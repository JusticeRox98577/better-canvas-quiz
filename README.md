# Better Canvas Quiz (LTI 1.3 MVP)

This is a minimal LTI 1.3 Advantage tool skeleton for Canvas, built as Vercel API routes.

## Quick start

1) Generate keys

```bash
node scripts/generate-keys.mjs
```

2) Set environment variables in Vercel

Required:
- `LTI_CLIENT_ID`
- `LTI_DEPLOYMENT_ID`
- `LTI_PLATFORM_ISSUER`
- `LTI_PLATFORM_AUTH_URL`
- `LTI_PLATFORM_JWKS_URL`
- `LTI_PUBLIC_JWK`
- `LTI_PRIVATE_KEY_PEM`

Canvas defaults (production, Instructure-hosted):
- `LTI_PLATFORM_ISSUER=https://canvas.instructure.com`
- `LTI_PLATFORM_AUTH_URL=https://sso.canvaslms.com/api/lti/authorize_redirect`
- `LTI_PLATFORM_JWKS_URL=https://sso.canvaslms.com/api/lti/security/jwks`

Canvas test/beta:
- `LTI_PLATFORM_ISSUER=https://canvas.test.instructure.com` or `https://canvas.beta.instructure.com`
- `LTI_PLATFORM_AUTH_URL=https://sso.test.canvaslms.com/api/lti/authorize_redirect` or `https://sso.beta.canvaslms.com/api/lti/authorize_redirect`
- `LTI_PLATFORM_JWKS_URL=https://sso.test.canvaslms.com/api/lti/security/jwks` or `https://sso.beta.canvaslms.com/api/lti/security/jwks`

If your Canvas is self-hosted, confirm issuer/auth/jwks URLs with your admin.

3) Deploy to Vercel

- Create a new Vercel project from this folder.
- After deploy, your base URL will look like: `https://better-canvas-quiz.vercel.app`

## Canvas install (By URL)

1) In Canvas course: Settings -> Apps -> +App
2) Configuration Type: By URL
3) Config URL:

```
https://better-canvas-quiz.vercel.app/api/lti/config
```

4) Submit, then copy the Client ID and Deployment ID into Vercel env vars.

## Canvas install (By Client ID)

1) Use the config URL above to get a Client ID via Dynamic Registration if your Canvas supports it.
2) Add the Client ID under Settings -> Apps -> +App -> By Client ID.

## Endpoints

- `GET /api/lti/config` (tool config JSON)
- `GET /api/lti/jwks` (tool public JWK set)
- `GET /api/lti/oidc` (OIDC initiation)
- `POST /api/lti/launch` (LTI launch)

## Notes

- This is a minimal launch flow. Deep linking, AGS, and NRPS are placeholders for now.
- State/nonce are stored in HTTP-only cookies for a basic integrity check.

## Token-based Canvas API (teacher access token)

If you can't use LTI 1.3, you can use a teacher access token for basic roster and grade sync.

Env vars:
- `CANVAS_BASE_URL` (e.g., `https://k12.instructure.com`)
- `CANVAS_ACCESS_TOKEN` (personal access token)
- `TEACHER_PASSCODE` (shared passcode for teacher UI)
- `SESSION_SECRET` (random string for session signing)

Endpoints:
- `GET /api/canvas/me` (test token)
- `GET /api/canvas/courses`
- `GET /api/canvas/enrollments?course_id=123`
- `POST /api/canvas/grade` JSON:
  `{ "course_id": "123", "assignment_id": "456", "user_id": "789", "score": 95 }`

UI routes:
- `/` (landing page with role selection)
- `/teacher` (teacher console, passcode protected)
- `/student` (student quiz with integrity log)
