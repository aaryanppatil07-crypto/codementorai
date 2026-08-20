# CodeMentor AI — AI Code Reviewer & Complexity Analyzer

**Designed by Bhumika · Final Year IT Project**

A fully static, browser-only AI code review assistant. Paste code, get an
instant chat-style review — bugs, style issues, suggested fixes, and
estimated time/space complexity — then ask follow-up questions.

> Everything runs entirely in the browser. There is **no backend server and
> no database**, so it deploys perfectly to GitHub Pages.

## Features

- 🧑‍💻 **Code editor** with live line numbers and a language selector
  (JavaScript, Python, Java, C++, generic)
- 🤖 **AI-powered review** — connect a free Gemini API key and the bot gives
  a real AI-driven review plus answers natural-language follow-up questions
  in chat
- 🧠 **Built-in local static analyzer** — works immediately with **zero
  setup**, no API key and no internet dependency (detects nested loops,
  `var` usage, loose equality, leftover `console.log`/`print`, bare
  `except:`, long functions, TODO/FIXME comments), so live demos never fail
- 📊 **Complexity estimate** — Big-O time and space complexity shown as
  live-updating badges
- 💬 **Chat-style issue feed** — each finding shows up as its own card with
  a severity tag (Bug / Warning / Style / Suggestion), the line number, and
  a concrete fix suggestion
- 🧾 **Copy summary** button to grab the full review as plain text
- 🔘 **Load sample** and **Clear** buttons per language, for a reliable demo
- 🌗 Light/dark theme toggle · fully responsive

## How the AI bot works

1. You paste code and click **Analyze code**.
2. If you've added a Gemini API key (top-right → **AI key**), the code is
   sent directly from the browser to Google's Gemini API, which returns a
   structured review (issues, complexity, summary).
3. If no key is set — or the AI request fails (e.g. no internet during a
   demo) — a **local rule-based static analyzer** built into
   `assets/app.js` scans the code itself and returns real findings, so the
   app always works.
4. Follow-up chat questions ("why is this O(n²)?") use the AI directly —
   these need a key connected, since they require real reasoning about your
   specific code.

## Project structure

```
codementor-ai/
├── index.html         page structure
├── assets/
│   ├── style.css       "terminal mentor" design system
│   └── app.js            editor, local analyzer, AI review, chat
└── README.md
```

## Run it locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Publish it with GitHub Pages — step by step (avoid the common 404)

**The #1 cause of a 404 on GitHub Pages is `index.html` not being directly
in the repository root.** Follow this exactly:

1. Create a new **public** GitHub repository, e.g. `codementor-ai`.
2. On your computer, unzip this project. You'll have a folder named
   `codementor-ai/` containing `index.html`, `assets/`, and `README.md`.
3. **Open that folder** and upload its *contents* (not the folder itself)
   to the repository root:

   - Using the GitHub website: click **Add file → Upload files**, then
     drag in `index.html`, `README.md`, and the `assets` folder — so they
     land directly at the repo's top level, e.g.
     `codementor-ai/index.html` ✅ not `codementor-ai/codementor-ai/index.html` ❌

   - Or using git from inside the unzipped folder:

     ```bash
     cd codementor-ai
     git init
     git add .
     git commit -m "CodeMentor AI"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/codementor-ai.git
     git push -u origin main
     ```

4. In the repository, go to **Settings → Pages**.
5. Under **Build and deployment → Source**, choose **Deploy from a
   branch**, set **Branch** to `main` and folder to `/ (root)`, then
   **Save**.
6. Wait about a minute, then refresh that same Pages settings page — a
   green box will show your live public URL, typically:

   ```
   https://YOUR-USERNAME.github.io/codementor-ai/
   ```

**Before you call it done**, check your repo's file list on GitHub: you
should see `index.html` sitting directly at the top level, next to
`assets/` and `README.md` — not nested inside another folder.

## Getting a free Gemini API key (optional)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and
   generate a free key.
2. In the app, click **AI key** (top right) and paste it in — stored only
   in your browser's local storage.
3. For a public demo, add an HTTP referrer restriction on the key (in
   Google AI Studio / Google Cloud Console) so it only works from your
   GitHub Pages domain.

## Notes for your project report

- The local static analyzer uses pattern-based heuristics (regex/line
  scanning), not a full parser/AST — it's intentionally lightweight so it
  runs instantly in the browser with no dependencies. The AI path (when a
  key is connected) gives a deeper, context-aware review.
- Complexity estimates from the local analyzer are heuristic (based on
  loop nesting depth) and meant to be a reasonable estimate, not a formal
  proof — worth mentioning as a design trade-off in your report.
- Only use a **free-tier** Gemini key client-side, never a production/paid
  key, and apply referrer restrictions as noted above.
