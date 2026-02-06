import crypto from "crypto";
import type { IncomingMessage, ServerResponse } from "http";

export type NodeRequest = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string | string[]>;
};

export type NodeResponse = ServerResponse;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export function sendJson(res: NodeResponse, body: unknown, status = 200, headers?: Record<string, string>): void {
  const payload = JSON.stringify(body, null, 2);
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
  }
  res.end(payload);
}

export function sendHtml(res: NodeResponse, body: string, status = 200, headers?: Record<string, string>): void {
  res.statusCode = status;
  res.setHeader("content-type", "text/html; charset=utf-8");
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
  }
  res.end(body);
}

export function randomState(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function baseUrl(req: NodeRequest): string {
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
  const host = (req.headers["x-forwarded-host"] as string | undefined) ?? req.headers.host ?? "";
  return `${proto}://${host}`;
}

export async function readBody(req: NodeRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function readForm(req: NodeRequest): Promise<Record<string, string>> {
  const contentType = (req.headers["content-type"] ?? "") as string;
  const body = await readBody(req);
  const text = body.toString("utf8");

  if (!contentType.includes("application/x-www-form-urlencoded")) {
    return {};
  }

  const params = new URLSearchParams(text);
  const data: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }
  return data;
}

export async function readJson<T = unknown>(req: NodeRequest): Promise<T | null> {
  const contentType = (req.headers["content-type"] ?? "") as string;
  if (!contentType.includes("application/json")) {
    return null;
  }
  const body = await readBody(req);
  if (!body.length) return null;
  return JSON.parse(body.toString("utf8")) as T;
}
