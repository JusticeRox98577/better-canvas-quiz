import type { IncomingMessage, ServerResponse } from "http";
import { clearTeacherSession } from "../_lib/auth.js";
import { sendJson } from "../_lib/utils.js";

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  clearTeacherSession(res);
  sendJson(res, { ok: true });
}
