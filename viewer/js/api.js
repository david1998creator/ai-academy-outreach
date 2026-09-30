// Waynautic Academy — Gemini API Dispatcher & Failover Engine

function saveApiKey() {
  const val = document.getElementById('api-key-input').value.trim();
  currentApiKey = val;
  localStorage.setItem(STORAGE_KEY_API, val);
  showToast("API Key saved locally!");
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('api-key-input');
  input.type = input.type === 'password' ? 'text' : 'password';
}

async function testApiKey() {
  const btn = document.getElementById('test-api-btn');
  btn.innerText = "Testing...";
  try {
    const res = await callGeminiApi("Reply with 'API Connected Successfully!'", "text");
    showToast(res || "API Key Verified & Connected!");
    btn.innerText = "✓ Valid";
    btn.className = "px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold transition";
  } catch (err) {
    alert("API Key Notice: " + err.message);
    btn.innerText = "Error";
    btn.className = "px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold transition";
  }
}

// Core Gemini API Dispatcher (High Temperature 0.85 for Creativity & Dynamic Phrasing)
async function callGeminiApi(prompt, taskType = 'text') {
  const key = currentApiKey || localStorage.getItem(STORAGE_KEY_API) || '';

  // 1. Try local server proxy endpoint if running via HTTP with 7s timeout
  if (window.location.protocol.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      const proxyResp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey: key, type: taskType }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (proxyResp.ok) {
        const data = await proxyResp.json();
        if (data.content) return data.content;
        if (data.error) throw new Error(data.error);
      }
    } catch (proxyErr) {
      // Fall back to direct browser fetch
    }
  }

  // 2. Direct browser fetch to Google Generative Language API
  const candidateModels = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview'
  ];
  let lastErr = null;

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.85, 
            topP: 0.95,
            topK: 64
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (resp.ok) {
        const data = await resp.json();
        return data.candidates[0].content.parts[0].text;
      } else {
        const errData = await resp.json().catch(() => ({}));
        lastErr = `${model} returned ${resp.status}: ${errData.error?.message || resp.statusText}`;
      }
    } catch (e) {
      lastErr = e.message;
    }
  }

  throw new Error("Generation failed: " + lastErr);
}
