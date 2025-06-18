// script.js – Adaptive back‑off + cancel option for persistent 429 errors
// -----------------------------------------------------------------------
// What’s new?
// • Keeps retrying on 429 with exponential + jittered delay until success
// • Shows live countdown *and* a "Cancel" button so the user can break out
// • Fallbacks: switches model to gpt‑3.5‑turbo after 3 failed retries on 4‑series
// • Still serialises requests via a simple queue (one at a time)

window.addEventListener('DOMContentLoaded', () => {
  // -------- Grab elements --------
  const chat        = document.getElementById('chat');
  const sendBtn     = document.getElementById('sendBtn');
  const userInput   = document.getElementById('userInput');
  const apiKeyInput = document.getElementById('apiKey');
  if (!chat || !sendBtn || !userInput) {
    console.error('❌ Required HTML elements not found – check IDs.');
    return;
  }

  // -------- State --------
  const messages = [];      // conversation history
  const queue    = [];      // pending requests
  let currentJob = null;    // pointer to active job (for cancel)

  // -------- Helpers --------
  const rnd  = (min, max) => Math.random() * (max - min) + min;

  function appendMessage(role, content) {
    const bubble = document.createElement('div');
    bubble.className = `bubble ${role === 'user' ? 'user' : 'bot'}`;
    bubble.textContent = content;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
    return bubble;
  }

  function countdown(bubble, ms) {
    let remaining = Math.ceil(ms / 1000);
    bubble.textContent = `⏳ Rate‑limited. Retrying in ${remaining}s…  (Cancel)`;
    const iv = setInterval(() => {
      if (currentJob?.cancelled) { clearInterval(iv); return; }
      remaining -= 1;
      if (remaining <= 0) { clearInterval(iv); return; }
      bubble.textContent = `⏳ Rate‑limited. Retrying in ${remaining}s…  (Cancel)`;
    }, 1000);

    // Make bubble clickable to cancel the job
    bubble.style.cursor = 'pointer';
    bubble.onclick = () => {
      if (currentJob) currentJob.cancelled = true;
      bubble.textContent = '❌ Cancelled by user.';
    };
  }

  // ------------ API‑key helpers ------------
  const getApiKey = () => {
    const fromField = apiKeyInput?.value.trim();
    if (fromField) { localStorage.setItem('openai_api_key', fromField); return fromField; }
    const saved = localStorage.getItem('openai_api_key');
    if (saved) { if (apiKeyInput) apiKeyInput.value = saved; return saved; }
    const key = prompt('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');
    if (key) { const clean = key.trim(); localStorage.setItem('openai_api_key', clean); apiKeyInput.value = clean; return clean; }
    return null;
  };

  // ------------ OpenAI call with adaptive retry ------------
  async function callOpenAI(apiKey, payload, model, bubble) {
    let delay = 2000;          // 2 s start
    let attempt = 0;
    let activeModel = model;

    while (true) {
      if (currentJob?.cancelled) throw new Error('Cancelled');

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: activeModel, messages: payload })
      });

      if (res.ok) return res.json();

      if (res.status === 429) {
        attempt += 1;
        const retryAfterHeader = Number(res.headers.get('retry-after'));
        const waitMs = (retryAfterHeader ? retryAfterHeader * 1000 : delay) + rnd(500, 1500);
        countdown(bubble, waitMs);
        await new Promise(r => setTimeout(r, waitMs));
        delay = Math.min(delay * 2, 60000);   // cap at 60s
        if (attempt === 3 && model.startsWith('gpt-4')) { // fallback after 3 fails
          activeModel = 'gpt-3.5-turbo';
          bubble.textContent = '🔄 Switching to gpt‑3.5‑turbo due to sustained rate limits…';
          await new Promise(r => setTimeout(r, 1500));
        }
        continue;
      }

      const text = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }
  }

  // ------------ Queue processor ------------
  function enqueue(text) {
    return new Promise(resolve => {
      queue.push({ text, resolve });
      if (queue.length === 1) process();
    });
  }

  async function process() {
    if (queue.length === 0) return;
    const { text, resolve } = queue[0];

    // UI bubbles
    appendMessage('user', text);
    messages.push({ role: 'user', content: text });
    const placeholder = appendMessage('assistant', '⏳ Thinking…');

    // Job object so we can cancel
    currentJob = { cancelled: false };

    try {
      const apiKey = getApiKey();
      if (!apiKey) { placeholder.textContent = 'API key required.'; throw new Error('No API key'); }
      const data = await callOpenAI(apiKey, messages, 'gpt-4o-mini', placeholder);
      if (currentJob.cancelled) return; // user cancelled during wait
      const reply = data.choices?.[0]?.message?.content ?? 'No reply 😕';
      placeholder.textContent = reply;
      messages.push({ role: 'assistant', content: reply });
    } catch (err) {
      console.error(err);
      if (!currentJob.cancelled) placeholder.textContent = `⚠️ ${err.message}`;
    } finally {
      currentJob = null;
      queue.shift();
      resolve();
      process();
    }
  }

  // ------------ Event listeners ------------
  sendBtn.onclick = () => {
    const text = userInput.value.trim();
    if (!text) return;
    userInput.value = '';
    enqueue(text);
  };

  userInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); sendBtn.click(); }
  });

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); prompt('🔑 Enter your OpenAI API key:', apiKeyInput?.value || ''); }
  });

  // Autofill stored key
  const stored = localStorage.getItem('openai_api_key');
  if (stored && apiKeyInput) apiKeyInput.value = stored;
});
