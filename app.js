// CodeMentor AI — AI code reviewer & complexity analyzer (fully static, client-side only)
(() => {
  "use strict";

  /* ============================================================
     1. THEME
     ============================================================ */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  let theme = localStorage.getItem("cm_theme") || "dark";
  function applyTheme(t){
    root.setAttribute("data-theme", t);
    themeIcon.innerHTML = t === "light"
      ? '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
      : '<path d="M12 3v1.5M12 19.5V21M21 12h-1.5M4.5 12H3M18.4 5.6l-1.06 1.06M6.66 17.34l-1.06 1.06M18.4 18.4l-1.06-1.06M6.66 6.66 5.6 5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6"/>';
    localStorage.setItem("cm_theme", t);
  }
  applyTheme(theme);
  themeToggle.addEventListener("click", () => { theme = theme === "dark" ? "light" : "dark"; applyTheme(theme); });

  /* ============================================================
     2. EDITOR: gutter line numbers + line count
     ============================================================ */
  const codeInput = document.getElementById("codeInput");
  const gutter = document.getElementById("gutter");
  const lineCount = document.getElementById("lineCount");

  function updateGutter(){
    const lines = codeInput.value.split("\n").length;
    gutter.textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
    lineCount.textContent = `${lines} line${lines === 1 ? "" : "s"}`;
  }
  codeInput.addEventListener("input", updateGutter);
  codeInput.addEventListener("scroll", () => { gutter.scrollTop = codeInput.scrollTop; });
  updateGutter();

  const SAMPLES = {
    javascript: `function findDuplicates(arr) {
  let duplicates = [];
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr.length; j++) {
      if (i !== j && arr[i] == arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }
  console.log(duplicates);
  return duplicates;
}`,
    python: `def find_duplicates(items):
    duplicates = []
    for i in range(len(items)):
        for j in range(len(items)):
            if i != j and items[i] == items[j]:
                duplicates.append(items[i])
    print(duplicates)
    return duplicates`,
    java: `public class Finder {
    public static List<Integer> findDuplicates(int[] arr) {
        List<Integer> duplicates = new ArrayList<>();
        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr.length; j++) {
                if (i != j && arr[i] == arr[j]) {
                    duplicates.add(arr[i]);
                }
            }
        }
        System.out.println(duplicates);
        return duplicates;
    }
}`,
    cpp: `vector<int> findDuplicates(vector<int>& arr) {
    vector<int> duplicates;
    for (int i = 0; i < arr.size(); i++) {
        for (int j = 0; j < arr.size(); j++) {
            if (i != j && arr[i] == arr[j]) {
                duplicates.push_back(arr[i]);
            }
        }
    }
    cout << duplicates.size() << endl;
    return duplicates;
}`,
    other: `# paste any code — CodeMentor will still scan it for obvious issues
loop i from 0 to n:
  loop j from 0 to n:
    compare item[i] and item[j]`
  };

  const langSelect = document.getElementById("langSelect");
  document.getElementById("loadSampleBtn").addEventListener("click", () => {
    codeInput.value = SAMPLES[langSelect.value] || SAMPLES.javascript;
    updateGutter();
  });
  document.getElementById("clearBtn").addEventListener("click", () => {
    codeInput.value = "";
    updateGutter();
    codeInput.focus();
  });

  /* ============================================================
     3. CHAT FEED UI
     ============================================================ */
  const chatFeed = document.getElementById("chatFeed");
  function addMessage(who, html){
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.innerHTML = `<span class="msg-tag">${who === "user" ? "You" : "CodeMentor"}</span><p>${html}</p>`;
    chatFeed.appendChild(div);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    return div;
  }
  function addTyping(){
    const div = document.createElement("div");
    div.className = "msg bot";
    div.innerHTML = `<span class="msg-tag">CodeMentor</span><div class="typing"><span></span><span></span><span></span></div>`;
    chatFeed.appendChild(div);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    return div;
  }
  function addIssueCards(issues){
    const wrap = document.createElement("div");
    wrap.className = "msg bot";
    const label = document.createElement("span");
    label.className = "msg-tag";
    label.textContent = "CodeMentor";
    wrap.appendChild(label);
    if (!issues.length){
      const p = document.createElement("p");
      p.textContent = "No obvious issues found — nice and clean!";
      wrap.appendChild(p);
    } else {
      issues.forEach(iss => {
        const card = document.createElement("div");
        card.className = "issue-card";
        card.innerHTML = `
          <div class="issue-head">
            <span class="sev-tag sev-${iss.severity}">${iss.severity}</span>
            <span class="issue-line">${iss.line ? "Line " + iss.line : ""}</span>
          </div>
          <div class="issue-msg">${escapeHtml(iss.message)}</div>
          ${iss.suggestion ? `<div class="issue-fix"><strong>Suggestion:</strong> ${escapeHtml(iss.suggestion)}</div>` : ""}
        `;
        wrap.appendChild(card);
      });
    }
    chatFeed.appendChild(wrap);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }

  /* ============================================================
     4. COMPLEXITY DISPLAY
     ============================================================ */
  function setComplexity(time, space, issueCountVal){
    document.getElementById("timeVal").textContent = time || "—";
    document.getElementById("spaceVal").textContent = space || "—";
    document.getElementById("issueCount").textContent = issueCountVal ?? "—";
  }

  /* ============================================================
     5. LOCAL STATIC ANALYZER (zero setup, zero network)
     ============================================================ */
  function localAnalyze(code, lang){
    const lines = code.split("\n");
    const issues = [];

    // detect nested loops -> likely O(n^2) or worse
    let loopDepthMax = 0;
    let depth = 0;
    const loopPattern = /\b(for|while)\b.*[:{(]|for\s+\w+\s+in\s+range|loop\s+\w+\s+from/i;
    lines.forEach((line, idx) => {
      if (loopPattern.test(line)) {
        depth += 1;
        loopDepthMax = Math.max(loopDepthMax, depth);
        if (depth >= 2){
          issues.push({
            line: idx + 1,
            severity: "warning",
            message: "Nested loop detected — this is a common source of quadratic (or worse) time complexity.",
            suggestion: "See if a hash map / set / dictionary lookup can replace the inner loop to bring this down to roughly linear time."
          });
        }
      }
      // crude closing-brace depth decrement for C-like languages
      if (/^\s*\}/.test(line) && depth > 0) depth -= 1;
    });

    // var usage (JS)
    if (lang === "javascript"){
      lines.forEach((line, idx) => {
        if (/\bvar\s+\w+/.test(line)){
          issues.push({
            line: idx + 1,
            severity: "style",
            message: "Use of 'var' — this has function scope, not block scope, which can cause subtle bugs.",
            suggestion: "Replace 'var' with 'let' or 'const' depending on whether the variable is reassigned."
          });
        }
        if (/==(?!=)/.test(line) && !/===/.test(line)){
          issues.push({
            line: idx + 1,
            severity: "bug",
            message: "Loose equality '==' can cause unexpected type coercion bugs.",
            suggestion: "Use strict equality '===' instead, unless the coercion is intentional."
          });
        }
        if (/console\.log/.test(line)){
          issues.push({
            line: idx + 1,
            severity: "style",
            message: "Leftover console.log statement.",
            suggestion: "Remove debug logging before shipping, or use a proper logger with log levels."
          });
        }
      });
    }
    if (lang === "python"){
      lines.forEach((line, idx) => {
        if (/^\s*print\(/.test(line)){
          issues.push({
            line: idx + 1,
            severity: "style",
            message: "Leftover print() statement.",
            suggestion: "Remove debug prints, or switch to the 'logging' module for production code."
          });
        }
        if (/except\s*:/.test(line)){
          issues.push({
            line: idx + 1,
            severity: "bug",
            message: "Bare 'except:' catches every exception, including ones you probably don't want to silently swallow (like KeyboardInterrupt).",
            suggestion: "Catch a specific exception type instead, e.g. 'except ValueError:'."
          });
        }
      });
    }

    // long function heuristic
    if (lines.length > 40){
      issues.push({
        line: null,
        severity: "suggestion",
        message: `This block is ${lines.length} lines long — long functions are harder to test and reason about.`,
        suggestion: "Consider splitting it into smaller, single-purpose helper functions."
      });
    }

    // TODO / FIXME
    lines.forEach((line, idx) => {
      if (/TODO|FIXME/i.test(line)){
        issues.push({ line: idx + 1, severity: "suggestion", message: "Unresolved TODO/FIXME comment left in the code.", suggestion: "Resolve it or file it as a tracked issue before submission." });
      }
    });

    const time = loopDepthMax >= 2 ? `O(n${loopDepthMax > 2 ? "^" + loopDepthMax : "²"})` : (loopDepthMax === 1 ? "O(n)" : "O(1)");
    const space = "O(1)–O(n) (estimated — depends on data structures used)";

    return { issues, time, space };
  }

  /* ============================================================
     6. AI (Gemini) REVIEWER — used when a key is configured
     ============================================================ */
  const API_KEY_STORAGE = "cm_gemini_key";
  function getApiKey(){ return localStorage.getItem(API_KEY_STORAGE) || ""; }

  async function aiAnalyze(code, lang){
    const key = getApiKey();
    const prompt = `You are CodeMentor, an AI code reviewer. Review the following ${lang} code.

Reply with ONLY strict JSON, no markdown fences, no extra text, in this exact shape:
{"issues":[{"line":<number or null>,"severity":"bug|warning|style|suggestion","message":"<short explanation>","suggestion":"<short fix suggestion>"}],"time":"<Big-O time complexity, e.g. O(n^2)>","space":"<Big-O space complexity, e.g. O(1)>","summary":"<one short encouraging sentence summarizing the review>"}

Code:
\`\`\`${lang}
${code}
\`\`\``;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    if (!res.ok) throw new Error(`AI request failed (${res.status})`);
    const data = await res.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    text = text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    return JSON.parse(text);
  }

  async function aiFollowUp(question, code, lang, lastReview){
    const key = getApiKey();
    const prompt = `You are CodeMentor, an AI code review assistant chatting with a student.
Language: ${lang}
Code under discussion:
\`\`\`${lang}
${code}
\`\`\`
Prior review summary (JSON): ${JSON.stringify(lastReview || {})}
Student's follow-up question: "${question}"

Reply with a short, clear, plain-text answer (2-5 sentences, no markdown fences, no JSON) as CodeMentor would in a chat.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    if (!res.ok) throw new Error(`AI request failed (${res.status})`);
    const data = await res.json();
    return (data?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
  }

  /* ============================================================
     7. ANALYZE PIPELINE
     ============================================================ */
  let lastReview = null;
  const analyzeBtn = document.getElementById("analyzeBtn");
  const analyzeLabel = document.getElementById("analyzeLabel");

  async function runAnalysis(){
    const code = codeInput.value;
    const lang = langSelect.value;
    if (!code.trim()){
      addMessage("bot", "Paste some code first — I need something to review!");
      return;
    }
    addMessage("user", `Analyze this ${lang} snippet (${code.split("\n").length} lines).`);
    analyzeBtn.disabled = true;
    analyzeLabel.textContent = "Analyzing…";
    const typingEl = addTyping();

    const key = getApiKey();
    let review;
    let usedAI = false;
    if (key){
      try{
        review = await aiAnalyze(code, lang);
        usedAI = true;
      }catch(err){
        const local = localAnalyze(code, lang);
        review = { issues: local.issues, time: local.time, space: local.space, summary: "AI request failed, so I used the built-in analyzer instead." };
      }
    } else {
      const local = localAnalyze(code, lang);
      review = { issues: local.issues, time: local.time, space: local.space, summary: "Here's what the built-in analyzer found." };
    }

    typingEl.remove();
    lastReview = review;

    setComplexity(review.time, review.space, review.issues.length);
    addIssueCards(review.issues);
    addMessage("bot", escapeHtml(review.summary || (usedAI ? "Review complete." : "Review complete using the built-in analyzer.")));

    analyzeBtn.disabled = false;
    analyzeLabel.textContent = "Analyze code";
  }
  analyzeBtn.addEventListener("click", runAnalysis);

  /* ============================================================
     8. FOLLOW-UP CHAT
     ============================================================ */
  const askForm = document.getElementById("askForm");
  const askInput = document.getElementById("askInput");
  askForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = askInput.value.trim();
    if (!q) return;
    askInput.value = "";
    addMessage("user", escapeHtml(q));

    const key = getApiKey();
    if (!key){
      addMessage("bot", "Follow-up chat needs an AI key connected (the built-in analyzer only does the initial scan) — click <em>AI key</em> above to add a free Gemini key, or just re-run <em>Analyze code</em> for a fresh scan.");
      return;
    }
    const typingEl = addTyping();
    try{
      const answer = await aiFollowUp(q, codeInput.value, langSelect.value, lastReview);
      typingEl.remove();
      addMessage("bot", escapeHtml(answer || "Sorry, I didn't get a clear answer for that — try rephrasing."));
    }catch(err){
      typingEl.remove();
      addMessage("bot", "That AI request failed — check your key or connection and try again.");
    }
  });

  /* ============================================================
     9. COPY SUMMARY
     ============================================================ */
  document.getElementById("copyBtn").addEventListener("click", async () => {
    if (!lastReview){
      addMessage("bot", "Nothing to copy yet — run an analysis first.");
      return;
    }
    const text = [
      `CodeMentor AI review`,
      `Time complexity: ${lastReview.time}`,
      `Space complexity: ${lastReview.space}`,
      `Issues (${lastReview.issues.length}):`,
      ...lastReview.issues.map((iss, i) => `${i + 1}. [${iss.severity}]${iss.line ? " line " + iss.line : ""} — ${iss.message}${iss.suggestion ? " Suggestion: " + iss.suggestion : ""}`)
    ].join("\n");
    try{
      await navigator.clipboard.writeText(text);
      addMessage("bot", "Copied the review summary to your clipboard.");
    }catch(err){
      addMessage("bot", "Couldn't copy automatically — please select and copy the review manually.");
    }
  });

  /* ============================================================
     10. API KEY MODAL
     ============================================================ */
  const apiKeyBtn = document.getElementById("apiKeyBtn");
  const apiKeyStatus = document.getElementById("apiKeyStatus");
  const apiModalBackdrop = document.getElementById("apiModalBackdrop");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const apiKeySave = document.getElementById("apiKeySave");
  const apiKeyClear = document.getElementById("apiKeyClear");

  function refreshKeyStatus(){
    const has = !!getApiKey();
    apiKeyStatus.classList.toggle("on", has);
    apiKeyStatus.classList.toggle("off", !has);
  }
  refreshKeyStatus();

  apiKeyBtn.addEventListener("click", () => {
    apiKeyInput.value = getApiKey();
    apiModalBackdrop.classList.add("open");
  });
  apiModalBackdrop.addEventListener("click", (e) => {
    if (e.target === apiModalBackdrop) apiModalBackdrop.classList.remove("open");
  });
  apiKeySave.addEventListener("click", () => {
    const v = apiKeyInput.value.trim();
    if (v) localStorage.setItem(API_KEY_STORAGE, v);
    refreshKeyStatus();
    apiModalBackdrop.classList.remove("open");
  });
  apiKeyClear.addEventListener("click", () => {
    localStorage.removeItem(API_KEY_STORAGE);
    apiKeyInput.value = "";
    refreshKeyStatus();
  });

  /* ============================================================
     11. REPO LINK (best-effort self-detect on GitHub Pages)
     ============================================================ */
  const repoLink = document.getElementById("repoLink");
  if (repoLink && location.hostname.endsWith("github.io")){
    const user = location.hostname.split(".")[0];
    const path = location.pathname.split("/").filter(Boolean)[0];
    if (user && path) repoLink.href = `https://github.com/${user}/${path}`;
  }
})();
