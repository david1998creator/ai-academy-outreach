// Waynautic Academy — HTML Flyer Generator & PNG Capture Studio

let currentFlyerData = null;

function buildFlyerHtml(data) {
  const d = data || DEFAULT_FLYER_DATA;
  const featuresHtml = (d.features || []).map(f => `
    <div class="feature-item">
      <div class="feature-icon-box">${f.icon || '▶'}</div>
      <div class="feature-text">
        <strong>${f.title}</strong>
        <p>${f.sub}</p>
      </div>
    </div>
  `).join('');

  const takeawaysHtml = (d.takeaways || []).map(t => `
    <div class="takeaway-item">
      <span class="takeaway-dash">—</span>
      <div>${t}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Waynautic Academy Flyer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #e5e5e5; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 24px; }
    .flyer { width: 560px; background-color: #F4EFEB; padding: 40px 32px 32px 32px; border-radius: 4px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 16px; letter-spacing: 0.5px; color: #122443; }
    .brand-icon { width: 22px; height: 22px; background: linear-gradient(135deg, #0ea5e9, #2563eb); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 12px; }
    .category-tag { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #78716c; text-transform: uppercase; }
    .hero-card { background-color: #152542; border-radius: 16px; padding: 32px 28px; color: #fff; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(18,36,67,0.12); }
    .hero-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .hero-enroll-hint { text-align: right; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #94a3b8; }
    .hero-enroll-hint span { display: block; color: #cbd5e1; font-weight: 500; font-size: 10px; letter-spacing: 0; margin-top: 2px; }
    .hero-title { font-size: 26px; font-weight: 800; line-height: 1.25; margin-bottom: 12px; color: #fff; max-width: 400px; }
    .hero-title .highlight { color: #E0A656; }
    .hero-sub { font-size: 12px; line-height: 1.5; color: #cbd5e1; margin-bottom: 26px; }
    .feature-list { display: flex; flex-direction: column; gap: 16px; }
    .feature-item { display: flex; align-items: flex-start; gap: 14px; }
    .feature-icon-box { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #93c5fd; font-size: 14px; }
    .feature-text strong { display: block; font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
    .feature-text p { font-size: 11px; color: #94a3b8; line-height: 1.4; }
    .takeaway-section { padding: 0 4px; margin-bottom: 24px; }
    .takeaway-kicker { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #b45309; text-transform: uppercase; margin-bottom: 12px; }
    .takeaway-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 13px; color: #1e293b; line-height: 1.4; }
    .takeaway-dash { color: #E0A656; font-weight: 800; font-size: 16px; line-height: 1; }
    .takeaway-closing { font-size: 12px; font-style: italic; color: #78350f; font-weight: 600; margin-top: 10px; }
    .cta-card { background-color: #152542; border-radius: 14px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; color: white; margin-bottom: 16px; }
    .cta-text-side { flex: 1; }
    .cta-kicker { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #E0A656; text-transform: uppercase; margin-bottom: 4px; }
    .cta-heading { font-size: 16px; font-weight: 800; color: white; line-height: 1.25; margin-bottom: 4px; }
    .cta-sub { font-size: 11px; color: #94a3b8; line-height: 1.3; }
    .qr-container { text-align: center; flex-shrink: 0; }
    .qr-box { width: 72px; height: 72px; background: white; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .qr-box img { width: 100%; height: 100%; object-fit: contain; }
    .qr-label { font-size: 8px; font-weight: 800; letter-spacing: 0.5px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; }
    .contact-card { background-color: #E0A656; color: #152542; padding: 12px 16px; border-radius: 10px; text-align: center; flex-shrink: 0; min-width: 145px; }
    .contact-kicker { font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; opacity: 0.85; }
    .contact-name { font-size: 13px; font-weight: 800; line-height: 1.2; }
    .contact-phone { font-size: 13px; font-weight: 800; letter-spacing: 0.5px; }
    .footer-note { text-align: center; font-size: 11px; font-weight: 600; color: #57534e; }
  </style>
</head>
<body>
  <div class="flyer" id="flyer-render-node">
    <div class="header">
      <div class="brand"><span class="brand-icon">W</span><span>WAYNAUTIC ACADEMY</span></div>
      <div class="category-tag">${d.categoryTag || 'MARKET-READY TRAINING'}</div>
    </div>
    <div class="hero-card">
      <div class="hero-top"><div style="flex:1;"></div><div class="hero-enroll-hint">ENROLL<span>Details below</span></div></div>
      <h1 class="hero-title">${d.headline} <span class="highlight">${d.headlineHighlight}</span></h1>
      <p class="hero-sub">${d.description}</p>
      <div class="feature-list">${featuresHtml}</div>
    </div>
    <div class="takeaway-section">
      <div class="takeaway-kicker">THE KEY TAKEAWAY</div>
      ${takeawaysHtml}
      <div class="takeaway-closing">${d.closingCta}</div>
    </div>
    <div class="cta-card">
      <div class="cta-text-side">
        <div class="cta-kicker">RESERVE YOUR SEAT</div>
        <div class="cta-heading">${d.ctaHeading || 'Enroll in the training program'}</div>
        <div class="cta-sub">${d.ctaSub || 'Scan the code or use the contact details to register.'}</div>
      </div>
      <div class="qr-container">
        <div class="qr-box"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://academy.waynautic.com/" alt="QR" /></div>
        <div class="qr-label">SCAN TO REGISTER</div>
      </div>
      <div class="contact-card">
        <div class="contact-kicker">CONTACT</div>
        <div class="contact-name">Pramod Gogadare</div>
        <div class="contact-phone">9158998226</div>
      </div>
    </div>
    <div class="footer-note">${d.footerNote || 'Open to college students & working professionals across all streams.'}</div>
  </div>
</body>
</html>`;
}

function renderFlyerPreview(data) {
  const html = buildFlyerHtml(data);
  const iframe = document.getElementById('flyer-preview-iframe');
  if (!iframe) return;
  iframe.srcdoc = html;
  const wrapper = document.getElementById('flyer-preview-wrapper');
  if (!wrapper) return;
  const clientWidth = wrapper.clientWidth;
  const wrapperWidth = clientWidth > 50 ? clientWidth - 16 : 560;
  const scale = Math.min(1, Math.max(0.4, wrapperWidth / 580));
  iframe.style.transform = `scale(${scale})`;
  iframe.style.transformOrigin = 'top center';
  iframe.style.width = '560px';
  iframe.style.height = '950px';
  wrapper.style.height = `${Math.round(950 * scale) + 20}px`;
}

function initDefaultFlyer() {
  currentFlyerData = { ...DEFAULT_FLYER_DATA };
  const editor = document.getElementById('flyer-content-editor');
  if (editor) editor.value = JSON.stringify(currentFlyerData, null, 2);
  renderFlyerPreview(currentFlyerData);
}

function applyFlyerEdits() {
  try {
    const edited = JSON.parse(document.getElementById('flyer-content-editor').value);
    currentFlyerData = edited;
    renderFlyerPreview(currentFlyerData);
    showToast("Flyer updated from edits!");
  } catch (e) {
    alert("Invalid JSON. Please fix the syntax and try again.\n\n" + e.message);
  }
}

function openFlyerFullscreen() {
  const html = buildFlyerHtml(currentFlyerData || DEFAULT_FLYER_DATA);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

async function runFlyerContentGeneration() {
  const promptInput = document.getElementById("gen-flyer-prompt");
  const btn = document.getElementById("btn-gen-flyers");
  const statusEl = document.getElementById("flyer-gen-status");
  const editor = document.getElementById("flyer-content-editor");

  const userIdea = promptInput.value.trim() || "Waynautic Academy flyer for 4-Week AI Engineering training with guaranteed 3-Month Industry Internship";
  lastPrompts['flyers'] = userIdea;

  btn.innerHTML = "<span>⚡ Generating Flyer Content...</span>";
  btn.disabled = true;
  statusEl.innerText = "Generating...";

  try {
    const flyerPrompt = `${WAYNAUTIC_BRAND_SYSTEM_PROMPT}

You are generating structured content for a professional marketing flyer for Waynautic Academy.

USER REQUEST: "${userIdea}"

Return ONLY a valid JSON object (no markdown fences, no explanation) with this exact structure:
{
  "categoryTag": "short uppercase tag for top-right corner, max 3 words, e.g. MARKET-READY TRAINING or AI ENGINEERING SPRINT",
  "headline": "main headline text WITHOUT the highlighted word at the end",
  "headlineHighlight": "one powerful word to highlight in gold at the end of the headline",
  "description": "1-2 sentence supporting description under the headline",
  "features": [
    { "icon": "emoji icon", "title": "bold feature title with dash separator", "sub": "short supporting description" },
    { "icon": "emoji icon", "title": "bold feature title", "sub": "short description" },
    { "icon": "emoji icon", "title": "bold feature title", "sub": "short description" }
  ],
  "takeaways": [
    "HTML string for takeaway 1 — use <strong> tags for bold parts",
    "HTML string for takeaway 2",
    "HTML string for takeaway 3"
  ],
  "closingCta": "italic closing call-to-action sentence in gold",
  "ctaHeading": "CTA heading for the bottom card, e.g. Enroll in the training program",
  "ctaSub": "CTA subtext, 1 sentence",
  "footerNote": "bottom footer note, 1 sentence"
}

IMPORTANT:
- Keep all text concise — this is a visual flyer, not an article.
- The headline + highlight should form one complete impactful sentence.
- Feature titles should be short (max 8 words) with a dash separator.
- Takeaways use HTML <strong> tags for bold emphasis.
- Always mention Waynautic Academy's real strengths: production-grade AI, RAG, MCP, 1-on-1 mentorship, 3-Month Industry Internship, Dual Certification.
- Return ONLY the JSON object. No other text.`;

    const result = await callGeminiApi(flyerPrompt);

    // Parse JSON from response (strip markdown fences if present)
    let jsonStr = result.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }
    const flyerData = JSON.parse(jsonStr);

    currentFlyerData = flyerData;
    editor.value = JSON.stringify(flyerData, null, 2);
    renderFlyerPreview(flyerData);
    statusEl.innerText = "Generated ✓";
    showToast("Flyer generated! Edit content on the right if needed.");
  } catch (err) {
    statusEl.innerText = "Error";
    alert("Flyer generation failed: " + err.message);
  } finally {
    btn.innerHTML = "<span>✨ Generate Flyer</span>";
    btn.disabled = false;
  }
}

// ==============================================================
// PNG Capture & Local Image Persistence (html2canvas)
// ==============================================================

async function captureFlyerAsPngDataUrl() {
  const iframe = document.getElementById('flyer-preview-iframe');
  if (!iframe || !iframe.contentDocument) {
    throw new Error("Flyer preview is not ready.");
  }

  const flyerNode = iframe.contentDocument.querySelector('.flyer');
  if (!flyerNode) {
    throw new Error("Flyer element not found in preview.");
  }

  // Ensure html2canvas is available
  if (typeof html2canvas === 'undefined') {
    throw new Error("html2canvas library is loading, please try again in a second.");
  }

  const canvas = await html2canvas(flyerNode, {
    scale: 2, // 2x DPI for crisp high-resolution print quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#F4EFEB'
  });

  return canvas.toDataURL('image/png');
}

async function saveCurrentFlyerImage() {
  const btn = document.getElementById("btn-save-flyer-png");
  if (btn) {
    btn.innerText = "⏳ Saving Image...";
    btn.disabled = true;
  }

  try {
    const dataUrl = await captureFlyerAsPngDataUrl();
    const activeCamp = campaigns.find(c => c.id === activeCampaignId);
    const title = (currentFlyerData && currentFlyerData.headline) 
      ? `${currentFlyerData.headline} ${currentFlyerData.headlineHighlight || ''}`
      : (activeCamp ? activeCamp.title : "Waynautic AI Flyer");

    const record = {
      id: Date.now(),
      title: title.trim(),
      imageDataUrl: dataUrl,
      flyerData: currentFlyerData || DEFAULT_FLYER_DATA,
      createdAt: new Date().toLocaleString()
    };

    const saved = saveFlyerToGallery(record);
    if (saved) {
      showToast("💾 Flyer PNG saved to local gallery!");
    }
  } catch (err) {
    console.error("Error saving flyer image:", err);
    alert("Failed to save flyer image: " + err.message);
  } finally {
    if (btn) {
      btn.innerText = "💾 Save Flyer Image";
      btn.disabled = false;
    }
  }
}

async function downloadCurrentFlyerPng() {
  try {
    showToast("Rendering high-res PNG...");
    const dataUrl = await captureFlyerAsPngDataUrl();
    const link = document.createElement('a');
    link.download = `Waynautic_Flyer_${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📥 Flyer PNG downloaded!");
  } catch (err) {
    alert("Download failed: " + err.message);
  }
}
