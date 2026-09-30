// Waynautic Academy — Home & Title Engine (Wireframe 2)

function renderSidebarTitles() {
  const list = document.getElementById("titles-sidebar-list");
  if (!list) return;
  list.innerHTML = "";
  document.getElementById("title-count-badge").innerText = `${campaigns.length} Titles`;

  campaigns.forEach(c => {
    const isActive = c.id === activeCampaignId;
    const div = document.createElement("div");
    div.className = `p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1.5 ${
      isActive 
        ? "bg-blue-50 border-blue-400 shadow-sm text-slate-900" 
        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
    }`;
    div.onclick = () => selectCampaign(c.id);

    div.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold ${isActive ? 'text-blue-700' : 'text-slate-800'} line-clamp-1">${escapeHtml(c.title)}</span>
        <span class="text-[10px] text-slate-400 font-mono">#${c.id}</span>
      </div>
      <div class="flex items-center gap-1.5 flex-wrap text-[9px] font-mono">
        <span class="px-1.5 py-0.5 rounded font-bold ${c.flyer ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}">Flyer</span>
        <span class="px-1.5 py-0.5 rounded font-bold ${c.wa ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}">WhatsApp</span>
        <span class="px-1.5 py-0.5 rounded font-bold ${c.li ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'}">LinkedIn</span>
        <span class="px-1.5 py-0.5 rounded font-bold ${c.pb ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'}">Playbook</span>
      </div>
    `;
    list.appendChild(div);
  });
}

function selectCampaign(id) {
  activeCampaignId = id;
  renderSidebarTitles();
  const c = campaigns.find(item => item.id === id);
  if (!c) return;

  const titleLabel = document.getElementById("active-title-label");
  if (titleLabel) titleLabel.innerText = c.title;

  // Update Column 1: Flyer
  const flyerText = document.getElementById("col-flyer-text");
  if (flyerText) flyerText.innerText = c.flyer || "Not generated yet. Open Full Title View to generate on-demand.";
  const flyerBadge = document.getElementById("status-badge-flyer");
  if (flyerBadge) {
    flyerBadge.innerText = c.flyer ? "Ready" : "Pending";
    flyerBadge.className = `text-[10px] px-2 py-0.5 rounded-full font-bold ${c.flyer ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`;
  }
  const flyerImg = document.getElementById("col-flyer-img");
  if (flyerImg && c.flyerImage) {
    flyerImg.src = c.flyerImage;
  }

  // Update Column 2: WhatsApp
  const waText = document.getElementById("col-wa-text");
  if (waText) waText.innerText = c.wa || "Not generated yet. Open Full Title View to generate on-demand.";
  const waBadge = document.getElementById("status-badge-wa");
  if (waBadge) {
    waBadge.innerText = c.wa ? "Ready" : "Pending";
    waBadge.className = `text-[10px] px-2 py-0.5 rounded-full font-bold ${c.wa ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`;
  }

  // Update Column 3: LinkedIn
  const liText = document.getElementById("col-li-text");
  if (liText) liText.innerText = c.li || "Not generated yet. Open Full Title View to generate on-demand.";
  const liBadge = document.getElementById("status-badge-li");
  if (liBadge) {
    liBadge.innerText = c.li ? "Ready" : "Pending";
    liBadge.className = `text-[10px] px-2 py-0.5 rounded-full font-bold ${c.li ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`;
  }

  // Update Column 4: Playbook
  const pbText = document.getElementById("col-pb-text");
  if (pbText) pbText.innerText = c.pb || "Not generated yet. Open Full Title View to generate on-demand.";
  const pbBadge = document.getElementById("status-badge-pb");
  if (pbBadge) {
    pbBadge.innerText = c.pb ? "Ready" : "Pending";
    pbBadge.className = `text-[10px] px-2 py-0.5 rounded-full font-bold ${c.pb ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`;
  }
}

// Modal: Create New Title
function openCreateTitleModal() {
  document.getElementById("create-title-modal").classList.remove("hidden");
}

function closeCreateTitleModal() {
  document.getElementById("create-title-modal").classList.add("hidden");
}

async function submitCreateTitle() {
  const titleName = document.getElementById("modal-title-name").value.trim();
  const promptText = document.getElementById("modal-title-prompt").value.trim();
  if (!titleName) {
    alert("Please enter a campaign title name.");
    return;
  }

  const genFlyer = document.getElementById("chk-flyer").checked;
  const genWa = document.getElementById("chk-wa").checked;
  const genLi = document.getElementById("chk-li").checked;
  const genPb = document.getElementById("chk-pb").checked;

  const btn = document.getElementById("btn-submit-title");
  btn.innerText = "Generating Selected Categories...";
  btn.disabled = true;

  try {
    const newId = Date.now();
    const newCampaign = {
      id: newId,
      title: titleName,
      prompt: promptText || titleName,
      flyer: "",
      flyerImage: "assets/flyer_sample_reference.png",
      wa: "",
      li: "",
      pb: ""
    };

    const context = `CAMPAIGN TOPIC: "${titleName}". SPECIFIC DETAILS: ${promptText || titleName}`;
    const tasks = [];

    if (genFlyer) {
      tasks.push(
        callGeminiApi(
          `${WAYNAUTIC_BRAND_SYSTEM_PROMPT}\n\nTask: Write a high-converting WhatsApp flyer copy blueprint for: ${context}. Include Headline, 3 core technical highlight bullets with emojis, 1-on-1 mentor + 3-Month Industry Internship benefit, and Pramod Gogadare (+91 9158998226) contact card.`
        ).then(res => { newCampaign.flyer = res; })
      );
    }

    if (genWa) {
      tasks.push(
        callGeminiApi(
          `${WAYNAUTIC_BRAND_SYSTEM_PROMPT}\n\nTask: Write a highly engaging, production-grade WhatsApp broadcast message for: ${context}. Emphasize real software engineering (Python, Vector DBs, RAG, MCP) and the 3-Month Industry Internship. Never use non-technical or no-code language.`
        ).then(res => { newCampaign.wa = res; })
      );
    }

    if (genLi) {
      tasks.push(
        callGeminiApi(
          `${WAYNAUTIC_BRAND_SYSTEM_PROMPT}\n\nTask: Write an authoritative, viral LinkedIn text post for: ${context}. Start with an irresistible 2-line hook, share real technical value, and direct readers to academy.waynautic.com.`
        ).then(res => { newCampaign.li = res; })
      );
    }

    if (genPb) {
      tasks.push(
        callGeminiApi(
          `${WAYNAUTIC_BRAND_SYSTEM_PROMPT}\n\nTask: Write a 3-step inbound DM qualification script & closing formula for: ${context}. Guide the prospect from diagnostic greeting to the Free Consultation / ₹19 Webinar, and close on the 4-week cohort + 3-month internship.`
        ).then(res => { newCampaign.pb = res; })
      );
    }

    await Promise.all(tasks);

    campaigns.unshift(newCampaign);
    saveDb();
    closeCreateTitleModal();
    selectCampaign(newId);
    showToast("New campaign title created & generated!");

    document.getElementById("modal-title-name").value = "";
    document.getElementById("modal-title-prompt").value = "";
  } catch (err) {
    alert("Generation Error: " + err.message);
  } finally {
    btn.innerText = "Generate Selected Categories";
    btn.disabled = false;
  }
}

// Modal: Full Title View Mode
function openFullTitleViewModal() {
  const c = campaigns.find(item => item.id === activeCampaignId);
  if (!c) return;

  document.getElementById("full-modal-title").innerText = c.title;
  document.getElementById("full-modal-flyer-content").innerText = c.flyer || "— [Not Generated Yet] Click 'Generate on Demand' above to create it.";
  document.getElementById("full-modal-wa-content").innerText = c.wa || "— [Not Generated Yet] Click 'Generate on Demand' above to create it.";
  document.getElementById("full-modal-li-content").innerText = c.li || "— [Not Generated Yet] Click 'Generate on Demand' above to create it.";
  document.getElementById("full-modal-pb-content").innerText = c.pb || "— [Not Generated Yet] Click 'Generate on Demand' above to create it.";

  document.getElementById("full-view-modal").classList.remove("hidden");
}

function closeFullTitleViewModal() {
  document.getElementById("full-view-modal").classList.add("hidden");
}

function deleteCategoryAsset(categoryKey) {
  const c = campaigns.find(item => item.id === activeCampaignId);
  if (!c) return;

  if (confirm(`Are you sure you want to delete the asset for this category?`)) {
    c[categoryKey] = "";
    saveDb();
    openFullTitleViewModal();
    selectCampaign(activeCampaignId);
    showToast("Category asset deleted.");
  }
}

function deleteCurrentCampaignTitle() {
  if (campaigns.length <= 1) {
    alert("You must keep at least one campaign title.");
    return;
  }
  if (confirm("Are you sure you want to delete this entire campaign title?")) {
    campaigns = campaigns.filter(item => item.id !== activeCampaignId);
    saveDb();
    closeFullTitleViewModal();
    selectCampaign(campaigns[0].id);
    showToast("Campaign title deleted.");
  }
}

async function generateCategoryOnDemand(categoryKey) {
  const c = campaigns.find(item => item.id === activeCampaignId);
  if (!c) return;

  showToast("Generating " + categoryKey + " on demand...");
  const context = `CAMPAIGN: "${c.title}". Prompt idea: ${c.prompt}`;

  try {
    let prompt = "";
    if (categoryKey === 'flyer') prompt = `${WAYNAUTIC_BRAND_SYSTEM_PROMPT}\n\nTask: Write a high-converting WhatsApp flyer copy blueprint for: ${context}.`;
    else if (categoryKey === 'wa') prompt = `${WAYNAUTIC_BRAND_SYSTEM_PROMPT}\n\nTask: Write an engaging, technically grounded WhatsApp broadcast message for: ${context}. Include 3-Month Industry Internship details.`;
    else if (categoryKey === 'li') prompt = `${WAYNAUTIC_BRAND_SYSTEM_PROMPT}\n\nTask: Write an authoritative LinkedIn text post for: ${context}.`;
    else if (categoryKey === 'pb') prompt = `${WAYNAUTIC_BRAND_SYSTEM_PROMPT}\n\nTask: Write an inbound qualification script & closing formula for: ${context}.`;

    const res = await callGeminiApi(prompt);
    c[categoryKey] = res;
    saveDb();
    openFullTitleViewModal();
    selectCampaign(activeCampaignId);
    showToast("Category generated successfully!");
  } catch (err) {
    alert("On-demand generation failed: " + err.message);
  }
}
