import type { IncomingMessage, ServerResponse } from "http";
import { canvasRequest } from "../_lib/canvas.js";
import { isTeacherAuthed } from "../_lib/auth.js";
import { sendJson } from "../_lib/utils.js";

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  if (!(await isTeacherAuthed(_req))) {
    sendJson(res, { error: "Unauthorized" }, 401);
    return;
  }
  const response = await canvasRequest("/api/v1/courses?enrollment_type=teacher&per_page=100");
  const body = await response.json();
  sendJson(res, body, response.status);
}
