import type { IncomingMessage, ServerResponse } from "http";
import { canvasRequest } from "../_lib/canvas.js";
import { sendJson } from "../_lib/utils.js";

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  const response = await canvasRequest("/api/v1/users/self/profile");
  const body = await response.json();
  sendJson(res, body, response.status);
}
