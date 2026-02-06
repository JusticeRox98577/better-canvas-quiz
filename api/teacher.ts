import type { IncomingMessage, ServerResponse } from "http";
import { isTeacherAuthed } from "./_lib/auth.js";
import { sendHtml } from "./_lib/utils.js";

const page = (authed: boolean) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Teacher Console</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
    <style>
      :root {
        --ink: #1b1b1b;
        --muted: #5b5b5b;
        --paper: #f6f2ea;
        --accent: #0f6f5c;
        --accent-2: #f2b705;
        --shadow: rgba(0, 0, 0, 0.08);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Source Sans 3", "Trebuchet MS", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(1200px 600px at 15% -10%, #fef7e7 0%, transparent 60%),
          radial-gradient(1000px 500px at 90% -20%, #e6f5f2 0%, transparent 60%),
          var(--paper);
      }
      main {
        max-width: 1100px;
        margin: 56px auto;
        padding: 0 24px 64px;
      }
      h1 {
        font-family: "Playfair Display", "Georgia", serif;
        font-size: 2.5rem;
        margin: 0 0 8px 0;
      }
      p { color: var(--muted); margin: 8px 0; }
      .card {
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 12px 40px var(--shadow);
        padding: 22px 24px;
        border: 1px solid #ece7df;
        margin-bottom: 18px;
      }
      .actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 10px;
      }
      .button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        padding: 10px 16px;
        border-radius: 999px;
        font-weight: 600;
        letter-spacing: 0.01em;
        border: none;
        cursor: pointer;
      }
      .primary { background: var(--accent); color: #fff; }
      .secondary { background: #fff; border: 1px solid #d9d1c6; color: var(--ink); }
      .ghost { background: transparent; color: var(--muted); border: 1px dashed #d0c7bc; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      pre {
        background: #0f1a17;
        color: #f7f3ea;
        padding: 12px;
        border-radius: 12px;
        overflow: auto;
        min-height: 80px;
      }
      .input { width: 100%; padding: 10px 12px; border: 1px solid #dcd2c4; border-radius: 12px; }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <h1>Teacher Console</h1>
        <p>Protected tools for roster, courses, and grade posting.</p>
        <div class="actions">
          <a class="button secondary" href="/">Back home</a>
          <button class="button ghost" id="logout">Log out</button>
        </div>
      </div>

      ${authed ? `
      <div class="grid">
        <div class="card">
          <h2>Verify Token</h2>
          <p>Confirms the Canvas token is valid.</p>
          <div class="actions">
            <button class="button primary" data-action="me">Run</button>
          </div>
          <pre id="out-me"></pre>
        </div>
        <div class="card">
          <h2>Courses</h2>
          <p>Fetch your teaching courses.</p>
          <div class="actions">
            <button class="button primary" data-action="courses">Run</button>
          </div>
          <pre id="out-courses"></pre>
        </div>
        <div class="card">
          <h2>Enrollments</h2>
          <p>Enter a course ID to list students.</p>
          <input class="input" id="course-id" placeholder="Course ID" />
          <div class="actions">
            <button class="button primary" data-action="enrollments">Run</button>
          </div>
          <pre id="out-enrollments"></pre>
        </div>
        <div class="card">
          <h2>Post Grade</h2>
          <p>Enter course, assignment, user, score.</p>
          <input class="input" id="grade-course" placeholder="Course ID" />
          <input class="input" id="grade-assignment" placeholder="Assignment ID" />
          <input class="input" id="grade-user" placeholder="User ID" />
          <input class="input" id="grade-score" placeholder="Score" />
          <div class="actions">
            <button class="button primary" data-action="grade">Submit</button>
          </div>
          <pre id="out-grade"></pre>
        </div>
      </div>
      ` : `
      <div class="card">
        <p>You are not logged in. Go back to the home page and enter the teacher passcode.</p>
      </div>
      `}
    </main>

    <script>
      const logoutBtn = document.getElementById("logout");
      logoutBtn.addEventListener("click", async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      });

      async function writeOut(id, data) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = JSON.stringify(data, null, 2);
      }

      async function runAction(action) {
        if (action === "me") {
          const res = await fetch("/api/canvas/me");
          writeOut("out-me", await res.json());
        }
        if (action === "courses") {
          const res = await fetch("/api/canvas/courses");
          writeOut("out-courses", await res.json());
        }
        if (action === "enrollments") {
          const courseId = document.getElementById("course-id").value.trim();
          const res = await fetch(`/api/canvas/enrollments?course_id=${encodeURIComponent(courseId)}`);
          writeOut("out-enrollments", await res.json());
        }
        if (action === "grade") {
          const payload = {
            course_id: document.getElementById("grade-course").value.trim(),
            assignment_id: document.getElementById("grade-assignment").value.trim(),
            user_id: document.getElementById("grade-user").value.trim(),
            score: document.getElementById("grade-score").value.trim(),
          };
          const res = await fetch("/api/canvas/grade", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
          writeOut("out-grade", await res.json());
        }
      }

      document.querySelectorAll("[data-action]").forEach((btn) => {
        btn.addEventListener("click", () => runAction(btn.dataset.action));
      });
    </script>
  </body>
</html>`;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const authed = await isTeacherAuthed(req);
  sendHtml(res, page(authed));
}
