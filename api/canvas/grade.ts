import type { IncomingMessage, ServerResponse } from "http";
import { canvasRequest } from "../_lib/canvas.js";
import { readJson, sendJson } from "../_lib/utils.js";

type GradePayload = {
  course_id: string;
  assignment_id: string;
  user_id: string;
  score: string | number;
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    sendJson(res, { error: "Method not allowed" }, 405, { "allow": "POST" });
    return;
  }

  const payload = await readJson<GradePayload>(req);
  if (!payload) {
    sendJson(res, { error: "Missing JSON body" }, 400);
    return;
  }

  const { course_id, assignment_id, user_id, score } = payload;
  if (!course_id || !assignment_id || !user_id || score === undefined) {
    sendJson(res, { error: "Missing course_id, assignment_id, user_id, or score" }, 400);
    return;
  }

  const form = new URLSearchParams();
  form.set("submission[posted_grade]", String(score));

  const response = await canvasRequest(
    `/api/v1/courses/${course_id}/assignments/${assignment_id}/submissions/${user_id}`,
    {
      method: "PUT",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }
  );

  const body = await response.json();
  sendJson(res, body, response.status);
}
