import type { IncomingMessage, ServerResponse } from "http";
import { isTeacherAuthed } from "./_lib/auth.js";
import { sendHtml } from "./_lib/utils.js";

function page(authed: boolean): string {
  const status = authed ? "Teacher session active" : "Teacher session not active";
  const action = authed
    ? "<button class=\"ghost\" id=\"logout\">Log out</button>"
    : "<button class=\"ghost\" id=\"login\">Log in</button>";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Better Canvas Quiz</title>
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
          radial-gradient(1200px 600px at 10% -10%, #fef7e7 0%, transparent 60%),
          radial-gradient(1000px 500px at 90% -20%, #e6f5f2 0%, transparent 60%),
          var(--paper);
      }
      main {
        max-width: 980px;
        margin: 64px auto;
        padding: 0 24px 64px;
      }
      .hero {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 18px;
        align-items: center;
      }
      .card {
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 12px 40px var(--shadow);
        padding: 28px 32px;
        border: 1px solid #ece7df;
      }
      h1 {
        font-family: "Playfair Display", "Georgia", serif;
        font-size: 2.8rem;
        margin: 0 0 6px 0;
        letter-spacing: -0.02em;
      }
      h2 {
        font-family: "Playfair Display", "Georgia", serif;
        margin: 0 0 8px 0;
        font-size: 1.6rem;
      }
      p {
        margin: 8px 0;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.6;
      }
      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin: 16px 0 6px;
      }
      .button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        padding: 12px 18px;
        border-radius: 999px;
        font-weight: 600;
        letter-spacing: 0.01em;
        border: none;
        cursor: pointer;
      }
      .primary {
        background: var(--accent);
        color: #fff;
      }
      .secondary {
        background: #fff;
        border: 1px solid #d9d1c6;
        color: var(--ink);
      }
      .ghost {
        background: transparent;
        color: var(--muted);
        border: 1px dashed #d0c7bc;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
      .tile {
        background: #fdfaf4;
        border: 1px solid #efe7db;
        border-radius: 14px;
        padding: 14px 16px;
      }
      .tile h3 {
        margin: 0 0 6px 0;
        font-size: 1.05rem;
      }
      .tiny {
        font-size: 0.95rem;
        color: var(--muted);
      }
      .status {
        padding: 8px 12px;
        border-radius: 999px;
        background: #f3efe7;
        display: inline-block;
        font-size: 0.95rem;
        color: #6b6054;
      }
      .input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #dcd2c4;
        border-radius: 12px;
        font-size: 1rem;
      }
      .mono {
        font-family: "Courier New", monospace;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="hero">
        <div class="card">
          <h1>Better Canvas Quiz</h1>
          <p>Clean, focused quizzes with integrity signals and Canvas roster + grade sync.</p>
          <div class="actions">
            <a class="button primary" href="/student">I'm a student</a>
            <a class="button secondary" href="/teacher">I'm a teacher</a>
          </div>
          <p class="tiny">Tip: Add this as an External URL in Canvas Modules for student access.</p>
        </div>
        <div class="card">
          <h2>Session</h2>
          <p class="status">${status}</p>
          <div class="actions">${action}</div>
          <div id="login-panel" ${authed ? "style=\"display:none\"" : ""}>
            <label class="tiny" for="passcode">Teacher passcode</label>
            <input class="input mono" id="passcode" type="password" placeholder="Enter passcode" />
            <div class="actions">
              <button class="button primary" id="submit-pass">Unlock teacher tools</button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid">
        <div class="tile">
          <h3>Student-friendly</h3>
          <p class="tiny">Distraction-free quiz interface with a simple integrity log.</p>
        </div>
        <div class="tile">
          <h3>Teacher-ready</h3>
          <p class="tiny">Roster lookup, quick grading, and exportable logs.</p>
        </div>
        <div class="tile">
          <h3>Canvas-compatible</h3>
          <p class="tiny">Works via External URL today; LTI 1.3 ready with admin support.</p>
        </div>
      </div>
    </main>

    <script>
      const loginBtn = document.getElementById("login");
      const logoutBtn = document.getElementById("logout");
      const submitBtn = document.getElementById("submit-pass");
      const passInput = document.getElementById("passcode");

      if (loginBtn) {
        loginBtn.addEventListener("click", () => {
          document.getElementById("login-panel").style.display = "block";
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.reload();
        });
      }

      if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
          const passcode = passInput.value.trim();
          if (!passcode) return;
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ passcode }),
          });
          if (res.ok) {
            window.location.href = "/teacher";
            return;
          }
          alert("Invalid passcode");
        });
      }
    </script>
  </body>
</html>`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const authed = await isTeacherAuthed(req);
  sendHtml(res, page(authed));
}
