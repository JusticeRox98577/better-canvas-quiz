import type { IncomingMessage, ServerResponse } from "http";
import { requireTeacherPasscode, setTeacherSession } from "../_lib/auth.js";
import { readJson, sendJson } from "../_lib/utils.js";

type LoginPayload = { passcode?: string };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    sendJson(res, { error: "Method not allowed" }, 405, { "allow": "POST" });
    return;
  }

  const payload = await readJson<LoginPayload>(req);
  if (!payload?.passcode) {
    sendJson(res, { error: "Missing passcode" }, 400);
    return;
  }

  if (payload.passcode !== requireTeacherPasscode()) {
    sendJson(res, { error: "Invalid passcode" }, 401);
    return;
  }

  await setTeacherSession(res);
  sendJson(res, { ok: true });
}
