import type { IncomingMessage, ServerResponse } from "http";
import { sendJson } from "./_lib/utils.js";

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  sendJson(res, { ok: true, service: "better-canvas-quiz" });
}
