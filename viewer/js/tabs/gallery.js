// Waynautic Academy — Saved WhatsApp Flyers Gallery Modal Engine

function openGalleryModal() {
  const modal = document.getElementById("gallery-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderGalleryGrid();
}

function closeGalleryModal() {
  const modal = document.getElementById("gallery-modal");
  if (modal) modal.classList.add("hidden");
}

function renderGalleryGrid() {
  const grid = document.getElementById("gallery-cards-grid");
  const emptyState = document.getElementById("gallery-empty-state");
  if (!grid) return;

  const flyers = getSavedFlyers();
  updateGalleryCountBadges();

  if (flyers.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  grid.innerHTML = flyers.map(item => `
    <div class="gallery-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
      <div class="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
        <span class="text-[10px] font-mono text-slate-500 font-semibold">${escapeHtml(item.createdAt || 'Saved')}</span>
        <span class="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">PNG Ready</span>
      </div>

      <!-- Thumbnail Preview -->
      <div class="p-3 flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden max-h-[300px]" onclick="viewGalleryItemFullscreen(${item.id})">
        <img src="${item.imageDataUrl}" alt="${escapeHtml(item.title)}" class="max-h-[280px] w-auto object-contain rounded-lg border border-slate-200 shadow-sm hover:scale-[1.02] transition" />
      </div>

      <!-- Title & Details -->
      <div class="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
        <div>
          <h4 class="text-xs font-extrabold text-slate-900 line-clamp-2 leading-snug">${escapeHtml(item.title)}</h4>
          <p class="text-[11px] text-slate-500 mt-1 line-clamp-1">${escapeHtml((item.flyerData && item.flyerData.description) || 'Waynautic AI Marketing Flyer')}</p>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <button onclick="downloadGalleryItemPng(${item.id})" class="py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] transition flex items-center justify-center gap-1 shadow-xs" title="Download PNG">
            <span>📥</span>
            <span>PNG</span>
          </button>
          <button onclick="loadFlyerFromGallery(${item.id})" class="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] transition flex items-center justify-center gap-1 shadow-xs" title="Load into Studio">
            <span>✏️</span>
            <span>Edit</span>
          </button>
          <button onclick="deleteFlyerFromGallery(${item.id})" class="py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] transition flex items-center justify-center gap-1 shadow-xs" title="Delete">
            <span>🗑️</span>
            <span>Del</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function downloadGalleryItemPng(id) {
  const flyers = getSavedFlyers();
  const item = flyers.find(f => f.id === id);
  if (!item || !item.imageDataUrl) {
    alert("Image data not found.");
    return;
  }

  const link = document.createElement('a');
  link.download = `Waynautic_${(item.title || 'Flyer').replace(/[^a-zA-Z0-9]/g, '_')}_${item.id}.png`;
  link.href = item.imageDataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("📥 Flyer PNG downloaded!");
}

function loadFlyerFromGallery(id) {
  const flyers = getSavedFlyers();
  const item = flyers.find(f => f.id === id);
  if (!item) return;

  currentFlyerData = item.flyerData || DEFAULT_FLYER_DATA;
  const editor = document.getElementById("flyer-content-editor");
  if (editor) editor.value = JSON.stringify(currentFlyerData, null, 2);
  renderFlyerPreview(currentFlyerData);

  closeGalleryModal();
  switchTab("flyers");
  showToast("Loaded saved flyer into studio!");
}

function viewGalleryItemFullscreen(id) {
  const flyers = getSavedFlyers();
  const item = flyers.find(f => f.id === id);
  if (!item || !item.imageDataUrl) return;

  const w = window.open("");
  w.document.write(`
    <html>
      <head><title>${escapeHtml(item.title)}</title></head>
      <body style="margin:0; background:#121826; display:flex; justify-content:center; align-items:center; min-height:100vh;">
        <img src="${item.imageDataUrl}" style="max-height:95vh; max-width:95vw; object-contain; border-radius:8px; box-shadow:0 20px 50px rgba(0,0,0,0.5);" />
      </body>
    </html>
  `);
}
