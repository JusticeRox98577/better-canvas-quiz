import { requireEnv } from "./utils.js";

function canvasBaseUrl(): string {
  const base = requireEnv("CANVAS_BASE_URL").replace(/\/$/, "");
  return base;
}

function canvasToken(): string {
  return requireEnv("CANVAS_ACCESS_TOKEN");
}

export async function canvasRequest(path: string, init?: RequestInit): Promise<Response> {
  const url = `${canvasBaseUrl()}${path}`;
  const headers = new Headers(init?.headers ?? {});
  headers.set("authorization", `Bearer ${canvasToken()}`);
  headers.set("accept", "application/json");

  return fetch(url, {
    ...init,
    headers,
  });
}
