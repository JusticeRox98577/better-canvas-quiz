import type { IncomingMessage, ServerResponse } from "http";
import { canvasRequest } from "../_lib/canvas.js";
import { sendJson } from "../_lib/utils.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "", "http://localhost");
  const courseId = url.searchParams.get("course_id");

  if (!courseId) {
    sendJson(res, { error: "Missing course_id" }, 400);
    return;
  }

  const response = await canvasRequest(
    `/api/v1/courses/${courseId}/enrollments?type[]=StudentEnrollment&per_page=100`
  );
  const body = await response.json();
  sendJson(res, body, response.status);
}
