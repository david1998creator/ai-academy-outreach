// Waynautic Academy — Core Application Controller & State Engine

let campaigns = [];
let activeCampaignId = 1;
let currentApiKey = '';
let lastPrompts = { flyers: '', wa: '', li: '', pb: '' };

function initApp() {
  // 1. Load API Key
  const savedKey = localStorage.getItem(STORAGE_KEY_API);
  if (savedKey) {
    currentApiKey = savedKey;
    const input = document.getElementById('api-key-input');
    if (input) input.value = savedKey;
  }

  // 2. Load Campaigns DB
  campaigns = loadCampaignsFromStorage();

  // 3. Render Views
  renderSidebarTitles();
  if (campaigns.length > 0) {
    selectCampaign(campaigns[0].id);
  }
  renderCategoryFeeds();
  initDefaultFlyer();
  updateGalleryCountBadges();
  if (typeof initLeadsTab === 'function') {
    initLeadsTab();
  }
}

function saveDb() {
  saveCampaignsToStorage(campaigns);
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".nav-tab").forEach(el => {
    el.classList.remove("bg-blue-600", "text-white", "shadow-md");
    el.classList.add("text-slate-600");
  });

  const activeSection = document.getElementById("tab-" + tabId);
  const activeBtn = document.getElementById("tab-btn-" + tabId);
  if (activeSection) activeSection.classList.remove("hidden");
  if (activeBtn) {
    activeBtn.classList.add("bg-blue-600", "text-white", "shadow-md");
    activeBtn.classList.remove("text-slate-600");
  }

  if (tabId === 'flyers') {
    setTimeout(() => {
      renderFlyerPreview(currentFlyerData || DEFAULT_FLYER_DATA);
    }, 50);
  }
}

// Unified AI Text Generation Dispatcher
async function runAiGeneration(tab) {
  const promptInput = document.getElementById(`gen-${tab}-prompt`);
  const outputBox = document.getElementById(`gen-${tab}-output`);
  const btn = document.getElementById(`btn-gen-${tab}`);

  const userPrompt = promptInput.value.trim();
  if (!userPrompt) {
    alert("Please enter a prompt or instruction in the text edit box.");
    return;
  }

  lastPrompts[tab] = userPrompt;
  btn.innerText = "Generating with Gemini...";
  btn.disabled = true;
  outputBox.innerHTML = `<span class="text-emerald-700 font-mono animate-pulse font-bold">⚡ Calling Gemini with Waynautic Brand Guardrails...</span>`;

  try {
    let angleInstruction = "";
    if (tab === 'wa' && typeof getWhatsAppAngleInstruction === 'function') {
      angleInstruction = getWhatsAppAngleInstruction();
    } else if (tab === 'li' && typeof getLinkedInAngleInstruction === 'function') {
      angleInstruction = getLinkedInAngleInstruction();
    } else if (tab === 'pb' && typeof getPlaybookAngleInstruction === 'function') {
      angleInstruction = getPlaybookAngleInstruction();
    }

    const fullInstruction = `
${WAYNAUTIC_BRAND_SYSTEM_PROMPT}

USER INSTRUCTION: "${userPrompt}"
${angleInstruction}

OUTPUT REQUIREMENTS:
- Format specifically for ${tab === 'wa' ? 'WhatsApp (clean bolding, emojis, bullets, 1-tap wa.link)' : tab === 'li' ? 'LinkedIn (hook in first 2 lines, white space between paragraphs, strong discussion question or CTA)' : 'consultative DM closing script'}.
- Ensure tone is authoritative, encouraging, and deeply technical (for real developers and engineers).
- Never use generic no-code or non-technical AI phrasing.
`;

    const result = await callGeminiApi(fullInstruction);
    outputBox.innerText = result;
    showToast("Branded content generated!");
  } catch (err) {
    outputBox.innerHTML = `<span class="text-rose-600 font-mono font-bold">Error: ${escapeHtml(err.message)}</span>`;
  } finally {
    btn.innerText = "Generate Button";
    btn.disabled = false;
  }
}

function retryGeneration(tab) {
  if (tab === 'flyers') {
    runFlyerContentGeneration();
    return;
  }
  const promptInput = document.getElementById(`gen-${tab}-prompt`);
  if (!promptInput.value.trim() && lastPrompts[tab]) {
    promptInput.value = lastPrompts[tab];
  }
  runAiGeneration(tab);
}

function discardGeneration(tab) {
  if (tab === 'flyers') {
    document.getElementById('gen-flyer-prompt').value = "";
    initDefaultFlyer();
    showToast("Flyer reset to default.");
    return;
  }
  document.getElementById(`gen-${tab}-prompt`).value = "";
  document.getElementById(`gen-${tab}-output`).innerHTML = `<span class="text-slate-400 italic font-sans">Generated content cleared.</span>`;
  showToast("Discarded.");
}

function saveGeneration(tab) {
  const c = campaigns.find(item => item.id === activeCampaignId);
  if (!c) return;

  if (tab === 'flyers') {
    if (!currentFlyerData) {
      alert("No flyer content to save.");
      return;
    }
    c.flyer = `Headline: ${currentFlyerData.headline} ${currentFlyerData.headlineHighlight}\n\nDescription: ${currentFlyerData.description}\n\nKey Highlights:\n` +
      (currentFlyerData.features || []).map(f => `• ${f.title} - ${f.sub}`).join('\n') +
      `\n\nTakeaways:\n` +
      (currentFlyerData.takeaways || []).map(t => `• ${t.replace(/<[^>]*>/g, '')}`).join('\n') +
      `\n\nCTA: ${currentFlyerData.closingCta}\nContact: Pramod Gogadare (9158998226)`;
    saveDb();
    selectCampaign(activeCampaignId);
    showToast("Saved flyer to active campaign!");
    return;
  }

  const outputEl = document.getElementById(`gen-${tab}-output`);
  const outputText = outputEl ? outputEl.innerText : '';
  if (!outputText || outputText.includes("will appear here") || outputText.includes("cleared")) {
    alert("No generated content to save.");
    return;
  }

  c[tab] = outputText;
  saveDb();
  selectCampaign(activeCampaignId);
  showToast("Saved to active campaign!");
}

function renderCategoryFeeds() {
  const waContainer = document.getElementById("wa-messages-container");
  if (waContainer) {
    waContainer.innerHTML = campaigns.map(c => `
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <span class="text-xs font-bold text-slate-800">${escapeHtml(c.title)}</span>
          <button onclick="copyText(this.dataset.copy)" data-copy="${escapeHtml(c.wa || '')}" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-semibold transition">Copy</button>
        </div>
        <div class="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">${escapeHtml(c.wa || 'No copy generated yet.')}</div>
      </div>
    `).join('');
  }

  const liContainer = document.getElementById("li-posts-container");
  if (liContainer) {
    liContainer.innerHTML = campaigns.map(c => `
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <span class="text-xs font-bold text-slate-800">${escapeHtml(c.title)}</span>
          <button onclick="copyText(this.dataset.copy)" data-copy="${escapeHtml(c.li || '')}" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-semibold transition">Copy</button>
        </div>
        <div class="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">${escapeHtml(c.li || 'No post generated yet.')}</div>
      </div>
    `).join('');
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toast-msg");
  if (!toast || !msgEl) return;
  msgEl.innerText = msg;
  toast.classList.remove("opacity-0", "translate-y-20", "pointer-events-none");
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-20", "pointer-events-none");
  }, 3000);
}

function copyColText(elementId) {
  const text = document.getElementById(elementId).innerText;
  copyText(text);
}

function copyText(str) {
  navigator.clipboard.writeText(str).then(() => {
    showToast("Copied to clipboard!");
  }).catch(() => {
    alert("Clipboard copy failed. Please select and copy manually.");
  });
}

function openFullscreenFlyer() {
  openFlyerFullscreen();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

window.addEventListener('DOMContentLoaded', initApp);
