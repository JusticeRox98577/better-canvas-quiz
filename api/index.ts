import type { IncomingMessage, ServerResponse } from "http";
import { sendHtml } from "./_lib/utils.js";

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Better Canvas Quiz</title>
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
        font-family: "Georgia", "Times New Roman", serif;
        color: var(--ink);
        background:
          radial-gradient(1200px 600px at 10% -10%, #fef7e7 0%, transparent 60%),
          radial-gradient(1000px 500px at 90% -20%, #e6f5f2 0%, transparent 60%),
          var(--paper);
      }
      main {
        max-width: 960px;
        margin: 64px auto;
        padding: 0 24px 64px;
      }
      .card {
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 12px 40px var(--shadow);
        padding: 28px 32px;
        border: 1px solid #ece7df;
      }
      h1 {
        font-size: 2.6rem;
        margin: 0 0 8px 0;
        letter-spacing: -0.02em;
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
        margin: 20px 0 6px;
      }
      a.button {
        display: inline-block;
        text-decoration: none;
        padding: 12px 18px;
        border-radius: 999px;
        font-weight: 600;
        letter-spacing: 0.01em;
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
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
      code {
        background: #fbf4e6;
        padding: 2px 6px;
        border-radius: 6px;
        font-family: "Courier New", monospace;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <h1>Better Canvas Quiz</h1>
        <p>A lightweight quiz tool that syncs with your Canvas roster and grades using a teacher access token.</p>
        <div class="actions">
          <a class="button primary" href="/api/canvas/me">Verify Canvas Token</a>
          <a class="button secondary" href="/api/canvas/courses">List My Courses</a>
        </div>
        <p class="tiny">Add this site to Canvas as an External URL in a Module if you don’t have LTI admin access.</p>
      </div>

      <div class="grid">
        <div class="tile">
          <h3>Step 1: Add External URL</h3>
          <p class="tiny">Modules ? + ? External URL ? paste this site URL ? check “Load in a new tab.”</p>
        </div>
        <div class="tile">
          <h3>Step 2: Confirm Token</h3>
          <p class="tiny">Click “Verify Canvas Token” above to make sure Canvas API access works.</p>
        </div>
        <div class="tile">
          <h3>Step 3: Use Courses</h3>
          <p class="tiny">Use “List My Courses” to pull course IDs for roster and grade sync.</p>
        </div>
      </div>
    </main>
  </body>
</html>`;

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  sendHtml(res, page);
}
