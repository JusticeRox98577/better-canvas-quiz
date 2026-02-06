import type { IncomingMessage, ServerResponse } from "http";
import { sendHtml } from "./_lib/utils.js";

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Student Quiz</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Work+Sans:wght@400;600&display=swap" rel="stylesheet">
    <style>
      :root {
        --ink: #141414;
        --muted: #5a5a5a;
        --paper: #f4f5f7;
        --accent: #1b3f8b;
        --accent-2: #ffb000;
        --shadow: rgba(0, 0, 0, 0.08);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Work Sans", "Segoe UI", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(900px 500px at 10% -10%, #f3f7ff 0%, transparent 60%),
          radial-gradient(800px 400px at 90% -20%, #fff4d6 0%, transparent 55%),
          var(--paper);
      }
      main { max-width: 920px; margin: 48px auto; padding: 0 20px 56px; }
      h1 {
        font-family: "Fraunces", "Georgia", serif;
        font-size: 2.4rem;
        margin: 0 0 6px 0;
      }
      p { color: var(--muted); }
      .card {
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 12px 40px var(--shadow);
        padding: 22px 24px;
        border: 1px solid #e6e8ee;
        margin-bottom: 16px;
      }
      .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
      .button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        padding: 10px 16px;
        border-radius: 999px;
        font-weight: 600;
        border: none;
        cursor: pointer;
      }
      .primary { background: var(--accent); color: #fff; }
      .secondary { background: #fff; border: 1px solid #d5d8e1; color: var(--ink); }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 999px;
        padding: 6px 12px;
        background: #f1f3f9;
        color: #4c4c4c;
        font-size: 0.9rem;
      }
      .log {
        font-family: "Courier New", monospace;
        background: #0f1522;
        color: #f2f5ff;
        border-radius: 12px;
        padding: 12px;
        min-height: 90px;
        overflow: auto;
      }
      label { display: block; font-size: 0.9rem; color: var(--muted); margin-top: 12px; }
      textarea {
        width: 100%;
        min-height: 120px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #d5d8e1;
        font-family: inherit;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <h1>Student Quiz</h1>
        <p>Stay focused. Leaving the tab or copying content will be logged.</p>
        <div class="row">
          <div>
            <span class="badge" id="status">Integrity monitor: off</span>
          </div>
          <div class="actions">
            <button class="button primary" id="start">Start quiz</button>
            <button class="button secondary" id="fullscreen">Fullscreen</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Quiz</h2>
        <label for="answer">Short response</label>
        <textarea id="answer" placeholder="Write your response here..."></textarea>
      </div>

      <div class="card">
        <h2>Integrity Log</h2>
        <div class="log" id="log"></div>
      </div>
    </main>

    <script>
      const logEl = document.getElementById("log");
      const statusEl = document.getElementById("status");
      const startBtn = document.getElementById("start");
      const fullscreenBtn = document.getElementById("fullscreen");
      let active = false;

      const pushLog = (msg) => {
        const time = new Date().toLocaleTimeString();
        logEl.textContent += `[${time}] ${msg}\n`;
        logEl.scrollTop = logEl.scrollHeight;
      };

      const setStatus = (on) => {
        active = on;
        statusEl.textContent = `Integrity monitor: ${on ? "on" : "off"}`;
      };

      const handler = (msg) => {
        if (!active) return;
        pushLog(msg);
      };

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) handler("Tab hidden");
        else handler("Tab visible");
      });
      window.addEventListener("blur", () => handler("Window lost focus"));
      window.addEventListener("focus", () => handler("Window focused"));
      window.addEventListener("copy", () => handler("Copy event"));
      window.addEventListener("paste", () => handler("Paste event"));
      document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) handler("Exited fullscreen");
      });

      startBtn.addEventListener("click", () => {
        setStatus(true);
        pushLog("Quiz started");
      });

      fullscreenBtn.addEventListener("click", async () => {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          handler("Entered fullscreen");
        } else {
          await document.exitFullscreen();
        }
      });
    </script>
  </body>
</html>`;

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  sendHtml(res, page);
}
