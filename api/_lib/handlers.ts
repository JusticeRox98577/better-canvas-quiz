import { createRemoteJWKSet, jwtVerify, SignJWT, importPKCS8 } from "jose";
import crypto from "crypto";
import * as cookie from "cookie";
import {
  baseUrl,
  readForm,
  requireEnv,
  sendHtml,
  sendJson,
  type NodeRequest,
  type NodeResponse,
} from "./utils.js";

const LTI_VERSION = "1.3.0";

function getClientId(): string {
  return requireEnv("LTI_CLIENT_ID");
}

function getPlatformIssuer(): string {
  return requireEnv("LTI_PLATFORM_ISSUER");
}

function getPlatformAuthUrl(): string {
  return requireEnv("LTI_PLATFORM_AUTH_URL");
}

function getPlatformJwksUrl(): string {
  return requireEnv("LTI_PLATFORM_JWKS_URL");
}

function getDeploymentId(): string {
  return requireEnv("LTI_DEPLOYMENT_ID");
}

function getToolIssuer(req: NodeRequest): string {
  return baseUrl(req);
}

function getToolJwksUrl(req: NodeRequest): string {
  return `${baseUrl(req)}/api/lti/jwks`;
}

function getToolLaunchUrl(req: NodeRequest): string {
  return `${baseUrl(req)}/api/lti/launch`;
}

function getPrivateKeyPem(): string {
  return requireEnv("LTI_PRIVATE_KEY_PEM");
}

function normalizePem(pem: string): string {
  if (pem.includes("BEGIN")) return pem;
  return pem.replace(/\\n/g, "\n");
}

function setNonceCookies(res: NodeResponse, state: string, nonce: string): void {
  const secure = true;
  const cookies = [
    cookie.serialize("lti_state", state, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    }),
    cookie.serialize("lti_nonce", nonce, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    }),
  ];
  res.setHeader("Set-Cookie", cookies);
}

function readCookies(req: NodeRequest): Record<string, string> {
  const header = req.headers.cookie ?? "";
  return cookie.parse(header);
}

export async function handleToolJwks(req: NodeRequest, res: NodeResponse): Promise<void> {
  const publicJwk = JSON.parse(requireEnv("LTI_PUBLIC_JWK"));
  sendJson(res, { keys: [publicJwk] });
}

export async function handleToolConfig(req: NodeRequest, res: NodeResponse): Promise<void> {
  const issuer = getToolIssuer(req);
  const config = {
    title: "Better Canvas Quiz",
    description: "Canvas-style quizzes with better UX.",
    oidc_initiation_url: `${issuer}/api/lti/oidc`,
    target_link_uri: getToolLaunchUrl(req),
    extensions: [
      {
        domain: new URL(issuer).host,
        tool_id: "better-canvas-quiz",
        privacy_level: "public",
        settings: {
          text: "Better Canvas Quiz",
          placements: [
            {
              placement: "course_navigation",
              message_type: "LtiResourceLinkRequest",
              target_link_uri: getToolLaunchUrl(req),
              text: "Better Canvas Quiz",
            },
            {
              placement: "assignment_selection",
              message_type: "LtiDeepLinkingRequest",
              target_link_uri: getToolLaunchUrl(req),
              text: "Better Canvas Quiz",
            },
          ],
        },
      },
    ],
    public_jwk_url: getToolJwksUrl(req),
    redirect_uris: [getToolLaunchUrl(req)],
    initiate_login_uri: `${issuer}/api/lti/oidc`,
    public_jwk: JSON.parse(requireEnv("LTI_PUBLIC_JWK")),
  };

  sendJson(res, config);
}

export async function handleOidcInit(req: NodeRequest, res: NodeResponse): Promise<void> {
  const url = new URL(req.url ?? "", baseUrl(req));
  const loginHint = url.searchParams.get("login_hint");
  const ltiMessageHint = url.searchParams.get("lti_message_hint");
  const targetLinkUri = url.searchParams.get("target_link_uri") ?? getToolLaunchUrl(req);
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  if (!loginHint) {
    sendJson(res, { error: "Missing login_hint" }, 400);
    return;
  }

  const params = new URLSearchParams({
    scope: "openid",
    response_type: "id_token",
    response_mode: "form_post",
    prompt: "none",
    client_id: getClientId(),
    redirect_uri: targetLinkUri,
    login_hint: loginHint,
    state,
    nonce,
  });

  if (ltiMessageHint) {
    params.set("lti_message_hint", ltiMessageHint);
  }

  setNonceCookies(res, state, nonce);
  const authUrl = `${getPlatformAuthUrl()}?${params.toString()}`;
  res.statusCode = 302;
  res.setHeader("location", authUrl);
  res.end();
}

export async function handleLaunch(req: NodeRequest, res: NodeResponse): Promise<void> {
  const form = await readForm(req);
  const idToken = form.id_token;

  if (!idToken) {
    sendJson(res, { error: "Missing id_token" }, 400);
    return;
  }

  const issuer = getPlatformIssuer();
  const audience = getClientId();
  const jwks = createRemoteJWKSet(new URL(getPlatformJwksUrl()));

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer,
    audience,
  });

  const cookies = readCookies(req);
  if (form.state && cookies.lti_state && form.state !== cookies.lti_state) {
    sendJson(res, { error: "State mismatch" }, 403);
    return;
  }

  const nonce = payload.nonce as string | undefined;
  if (nonce && cookies.lti_nonce && nonce !== cookies.lti_nonce) {
    sendJson(res, { error: "Nonce mismatch" }, 403);
    return;
  }

  const messageType = payload["https://purl.imsglobal.org/spec/lti/claim/message_type"] as string | undefined;
  const deploymentId = payload["https://purl.imsglobal.org/spec/lti/claim/deployment_id"] as string | undefined;

  if (deploymentId && deploymentId !== getDeploymentId()) {
    sendJson(res, { error: "Deployment id mismatch" }, 403);
    return;
  }

  if (messageType === "LtiDeepLinkingRequest") {
    sendHtml(
      res,
      `<!doctype html>
<html>
  <head><meta charset="utf-8"></head>
  <body>
    <h1>Deep Linking Placeholder</h1>
    <p>We will return a deep link when quizzes are implemented.</p>
  </body>
</html>`
    );
    return;
  }

  sendHtml(
    res,
    `<!doctype html>
<html>
  <head><meta charset="utf-8"></head>
  <body>
    <h1>Better Canvas Quiz</h1>
    <p>Launch received. User: ${payload.name ?? payload.sub}</p>
  </body>
</html>`
  );
}

export async function handlePlatformConfig(_req: NodeRequest, res: NodeResponse): Promise<void> {
  sendJson(res, {
    lti_version: LTI_VERSION,
    issuer: getPlatformIssuer(),
    authorization_endpoint: getPlatformAuthUrl(),
    jwks_uri: getPlatformJwksUrl(),
    scopes_supported: [
      "https://purl.imsglobal.org/spec/lti-ags/scope/score",
      "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly",
      "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
      "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly",
    ],
  });
}

export async function buildClientAssertion(req: NodeRequest): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const issuer = getToolIssuer(req);
  const audience = getPlatformIssuer();
  const privateKey = normalizePem(getPrivateKeyPem());
  const jwk = JSON.parse(requireEnv("LTI_PUBLIC_JWK"));

  const key = await importPKCS8(privateKey, "RS256");

  return new SignJWT({
    iss: issuer,
    aud: audience,
    iat: now,
    exp: now + 300,
    jti: crypto.randomUUID(),
    sub: getClientId(),
  })
    .setProtectedHeader({ alg: "RS256", kid: jwk.kid })
    .sign(key);
}
