// Waynautic Academy — LinkedIn Lead Extraction & Apollo Enrichment Controller

let leadsList = [];
let selectedLeadIds = new Set();
let activeLeadFilter = 'all';
let currentPitchLeadId = null;

function initLeadsTab() {
  // 1. Populate saved credentials into UI if elements exist
  const googleCreds = getGoogleApiCredentials();
  const apolloKey = getApolloApiKey();

  const googleKeyEl = document.getElementById('leads-google-key');
  const googleCxEl = document.getElementById('leads-google-cx');
  const apolloKeyEl = document.getElementById('leads-apollo-key');

  if (googleKeyEl && googleCreds.apiKey) googleKeyEl.value = googleCreds.apiKey;
  if (googleCxEl && googleCreds.cx) googleCxEl.value = googleCreds.cx;
  if (apolloKeyEl && apolloKey) apolloKeyEl.value = apolloKey;

  // 2. Load and render leads
  leadsList = getSavedLeads();
  renderLeadsTable();
  updateLeadStats();
}

function saveApiCredentialsFromUi() {
  const googleKey = document.getElementById('leads-google-key')?.value.trim() || '';
  const googleCx = document.getElementById('leads-google-cx')?.value.trim() || '';
  const apolloKey = document.getElementById('leads-apollo-key')?.value.trim() || '';

  saveGoogleApiCredentials(googleKey, googleCx);
  saveApolloApiKey(apolloKey);

  showToast("API keys saved securely in local storage!");
  toggleApiDrawer(false);
}

function toggleApiDrawer(forceState) {
  const drawer = document.getElementById('leads-api-drawer');
  if (!drawer) return;
  if (typeof forceState === 'boolean') {
    if (forceState) drawer.classList.remove('hidden');
    else drawer.classList.add('hidden');
  } else {
    drawer.classList.toggle('hidden');
  }
}

function setLeadFilter(filter) {
  activeLeadFilter = filter;
  ['all', 'tpo', 'student'].forEach(f => {
    const btn = document.getElementById(`filter-btn-${f}`);
    if (btn) {
      if (f === filter) {
        btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-slate-100', 'text-slate-700');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-slate-100', 'text-slate-700');
      }
    }
  });
  renderLeadsTable();
}

async function searchLeadsUi() {
  const targetRole = document.getElementById('leads-target-role')?.value || 'tpo';
  const location = document.getElementById('leads-location')?.value.trim() || 'Pune';
  const customKeywords = document.getElementById('leads-keywords')?.value.trim() || '';
  const searchBtn = document.getElementById('btn-search-leads');

  const googleCreds = getGoogleApiCredentials();

  let query = "";
  if (targetRole === 'tpo') {
    query = `"Training and Placement Officer" OR "TPO" OR "Head Placements" "engineering" "${location}"`;
  } else {
    query = `"B.Tech" OR "MCA" OR "Computer Science" "2025" OR "2026" "Pune" "student"`;
  }
  if (customKeywords) {
    query += ` ${customKeywords}`;
  }

  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.innerHTML = `<span class="animate-spin inline-block mr-1">🌀</span> Extracting Leads...`;
  }

  try {
    const response = await fetch('/api/leads/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        target_role: targetRole,
        location: location,
        google_api_key: googleCreds.apiKey,
        google_cx: googleCreds.cx,
        num_results: 10
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to search leads");
    }

    const fetchedLeads = data.leads || [];
    if (fetchedLeads.length === 0) {
      showToast("No new leads returned. Try changing query keywords.");
    } else {
      const { addedCount, total } = addLeadsToPipeline(fetchedLeads);
      leadsList = getSavedLeads();
      renderLeadsTable();
      updateLeadStats();
      showToast(`Extracted ${fetchedLeads.length} leads (${addedCount} new added, total: ${total})!`);
    }
  } catch (err) {
    console.error("Search leads error:", err);
    alert("Lead Search Error: " + err.message);
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = `<span>🔍 Search LinkedIn Leads</span>`;
    }
  }
}

function openGoogleXRayDirect() {
  const targetRole = document.getElementById('leads-target-role')?.value || 'tpo';
  const location = document.getElementById('leads-location')?.value.trim() || 'Pune';
  const customKeywords = document.getElementById('leads-keywords')?.value.trim() || '';
  const googleCreds = getGoogleApiCredentials();
  const cx = googleCreds.cx || '5412b4801b4634488';

  let query = "";
  if (targetRole === 'tpo') {
    query = `"Training and Placement Officer" OR "TPO" "engineering" "${location}"`;
  } else {
    query = `"B.Tech" OR "MCA" OR "Computer Science" "2025" "${location}"`;
  }
  if (customKeywords) query += ` ${customKeywords}`;

  const cseUrl = `https://cse.google.com/cse?cx=${cx}#gsc.tab=0&gsc.q=${encodeURIComponent(query)}`;
  window.open(cseUrl, '_blank');
}

function openQuickPasteModal() {
  const modal = document.getElementById('quick-paste-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeQuickPasteModal() {
  const modal = document.getElementById('quick-paste-modal');
  if (modal) modal.classList.add('hidden');
}

function processPastedLeads() {
  const inputEl = document.getElementById('paste-leads-text');
  const targetRole = document.getElementById('paste-leads-role')?.value || 'tpo';
  const text = (inputEl?.value || '').trim();
  if (!text) {
    alert("Please paste text or search results into the box.");
    return;
  }

  // Parse lines or chunks
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const parsed = [];
  const phoneRegex = /(?:\+?91[\-\s]?)?[6-9]\d{9}\b/;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const linkRegex = /https:\/\/[a-z]{2,3}\.linkedin\.com\/in\/[^\s"')]+/i;

  let currentLead = null;

  lines.forEach(line => {
    // If line has " - " and mentions LinkedIn or role
    if (line.includes(' - ') || line.includes(' | LinkedIn') || line.toLowerCase().includes('training') || line.toLowerCase().includes('placement') || line.toLowerCase().includes('student')) {
      if (currentLead && currentLead.name) {
        parsed.push(currentLead);
      }
      let cleanLine = line.replace(/\s*\|\s*LinkedIn.*$/i, '').replace(/https?:\/\/\S+/g, '').trim();
      const parts = cleanLine.split(/\s*[\-–—]\s*/);
      const name = parts[0]?.trim() || "Lead Contact";
      const headline = parts[1]?.trim() || (targetRole === 'tpo' ? "Training & Placement Officer" : "Student");
      const college = parts[2]?.trim() || (targetRole === 'tpo' ? "Engineering College" : "Tech Candidate");

      currentLead = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: name,
        headline: headline,
        college: college,
        location: "Pune, Maharashtra",
        phone: "",
        email: "",
        audience: targetRole,
        linkedinUrl: "",
        status: "Pasted Lead"
      };
    }

    if (currentLead) {
      const pm = line.match(phoneRegex);
      if (pm && !currentLead.phone) currentLead.phone = pm[0].replace(/[^0-9]/g, '').slice(-10);

      const em = line.match(emailRegex);
      if (em && !currentLead.email) currentLead.email = em[0];

      const lm = line.match(linkRegex);
      if (lm && !currentLead.linkedinUrl) currentLead.linkedinUrl = lm[0];
    }
  });

  if (currentLead && currentLead.name) {
    parsed.push(currentLead);
  }

  // If no structured delimiters found, create single lead
  if (parsed.length === 0) {
    const pm = text.match(phoneRegex);
    const em = text.match(emailRegex);
    const lm = text.match(linkRegex);
    parsed.push({
      id: Date.now(),
      name: lines[0]?.slice(0, 40) || "Pasted Contact",
      headline: targetRole === 'tpo' ? "Training and Placement Officer" : "Student Candidate",
      college: "Institute",
      location: "Pune, Maharashtra",
      phone: pm ? pm[0].replace(/[^0-9]/g, '').slice(-10) : "",
      email: em ? em[0] : "",
      audience: targetRole,
      linkedinUrl: lm ? lm[0] : "",
      status: "Pasted Lead"
    });
  }

  const { addedCount, total } = addLeadsToPipeline(parsed);
  leadsList = getSavedLeads();
  renderLeadsTable();
  updateLeadStats();
  if (inputEl) inputEl.value = "";
  closeQuickPasteModal();
  showToast(`Added ${addedCount} new leads (total: ${total})!`);
}

function updateLeadStats() {
  const total = leadsList.length;
  const tpos = leadsList.filter(l => l.audience === 'tpo').length;
  const students = leadsList.filter(l => l.audience === 'student').length;
  const withEmail = leadsList.filter(l => l.email && l.email.includes('@')).length;
  const withPhone = leadsList.filter(l => l.phone && l.phone.length >= 10).length;

  const statTotal = document.getElementById('stat-total-leads');
  const statTpo = document.getElementById('stat-tpo-leads');
  const statStudent = document.getElementById('stat-student-leads');
  const statEnriched = document.getElementById('stat-enriched-leads');

  if (statTotal) statTotal.innerText = total;
  if (statTpo) statTpo.innerText = tpos;
  if (statStudent) statStudent.innerText = students;
  if (statEnriched) statEnriched.innerText = `${withEmail} emails / ${withPhone} phones`;
}

function renderLeadsTable() {
  const tbody = document.getElementById('leads-table-body');
  const emptyState = document.getElementById('leads-empty-state');
  if (!tbody) return;

  const filtered = leadsList.filter(lead => {
    if (activeLeadFilter === 'all') return true;
    return lead.audience === activeLeadFilter;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = filtered.map(lead => {
    const isSelected = selectedLeadIds.has(lead.id);
    const isTpo = lead.audience === 'tpo';
    const hasPhone = Boolean(lead.phone && lead.phone.length >= 8);
    const hasEmail = Boolean(lead.email && lead.email.includes('@'));

    const badgeClass = isTpo ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    const badgeLabel = isTpo ? '🎓 TPO / College' : '👨‍💻 Student / Fresher';

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition text-xs">
        <td class="p-3.5 text-center">
          <input type="checkbox" onchange="toggleLeadSelection(${lead.id})" ${isSelected ? 'checked' : ''} class="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" />
        </td>
        <td class="p-3.5 font-bold text-slate-900">
          <div class="flex items-center gap-2">
            <span class="text-sm font-extrabold">${escapeHtml(lead.name)}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full border font-bold ${badgeClass}">${badgeLabel}</span>
          </div>
          <div class="text-[11px] text-slate-500 font-normal mt-0.5 line-clamp-1">${escapeHtml(lead.headline || '')}</div>
        </td>
        <td class="p-3.5 text-slate-700">
          <div class="font-semibold text-slate-800 line-clamp-1">${escapeHtml(lead.college || 'Not specified')}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">📍 ${escapeHtml(lead.location || 'Pune')}</div>
        </td>
        <td class="p-3.5">
          <div class="space-y-1">
            <!-- Phone -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-mono ${hasPhone ? 'text-slate-800 font-semibold' : 'text-slate-400 italic'}">
                📞 ${hasPhone ? escapeHtml(lead.phone) : 'No direct phone'}
              </span>
              ${hasPhone ? `
                <button onclick="copyText('${lead.phone}')" title="Copy Phone" class="text-[10px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold">Copy</button>
                <a href="https://wa.me/91${lead.phone.replace(/[^0-9]/g, '')}" target="_blank" title="Chat on WhatsApp" class="text-[10px] bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-800 font-bold">WA</a>
              ` : ''}
            </div>
            <!-- Email / Apollo -->
            <div class="flex items-center gap-1.5">
              ${hasEmail ? `
                <span class="text-[11px] font-mono text-emerald-700 font-bold">✉️ ${escapeHtml(lead.email)}</span>
                <button onclick="copyText('${lead.email}')" title="Copy Email" class="text-[10px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold">Copy</button>
              ` : `
                <button onclick="enrichSingleLeadWithApollo(${lead.id})" id="btn-enrich-${lead.id}" class="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-bold transition flex items-center gap-1 shadow-xs">
                  <span>⚡ Enrich via Apollo</span>
                </button>
              `}
            </div>
          </div>
        </td>
        <td class="p-3.5">
          ${lead.linkedinUrl ? `
            <a href="${escapeHtml(lead.linkedinUrl)}" target="_blank" class="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-bold">
              <span>View Profile</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          ` : '<span class="text-slate-400 italic">No link</span>'}
          <div class="mt-1">
            <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">${escapeHtml(lead.status || 'Verified')}</span>
          </div>
        </td>
        <td class="p-3.5 text-right space-x-1 whitespace-nowrap">
          <button onclick="openPitchModal(${lead.id})" class="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition" title="Generate Branded AI Pitch">
            📝 AI Pitch
          </button>
          <button onclick="deleteLeadUi(${lead.id})" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition" title="Delete Lead">
            ✕
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleLeadSelection(id) {
  if (selectedLeadIds.has(id)) {
    selectedLeadIds.delete(id);
  } else {
    selectedLeadIds.add(id);
  }
  const selectAllCb = document.getElementById('select-all-leads-cb');
  if (selectAllCb) {
    selectAllCb.checked = selectedLeadIds.size > 0 && selectedLeadIds.size === leadsList.length;
  }
}

function selectAllLeads(cb) {
  if (cb.checked) {
    leadsList.forEach(l => selectedLeadIds.add(l.id));
  } else {
    selectedLeadIds.clear();
  }
  renderLeadsTable();
}

function deleteLeadUi(id) {
  deleteLeadFromPipeline(id);
  selectedLeadIds.delete(id);
  leadsList = getSavedLeads();
  renderLeadsTable();
  updateLeadStats();
  showToast("Lead removed from pipeline.");
}

function clearAllLeadsUi() {
  if (confirm("Are you sure you want to clear all leads?")) {
    clearLeadsPipeline();
    selectedLeadIds.clear();
    leadsList = [];
    renderLeadsTable();
    updateLeadStats();
    showToast("All leads cleared.");
  }
}

// ==========================================
// Apollo Free Tier Enrichment Engine
// ==========================================

async function enrichSingleLeadWithApollo(leadId) {
  const lead = leadsList.find(l => l.id == leadId);
  if (!lead) return;

  const apolloKey = getApolloApiKey();
  if (!apolloKey) {
    toggleApiDrawer(true);
    alert("Please enter your Apollo.io Free Tier API Key in the API Settings Drawer first!");
    return;
  }

  const btn = document.getElementById(`btn-enrich-${leadId}`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block">🌀</span> Matching...`;
  }

  try {
    const parts = (lead.name || '').trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const res = await fetch('/api/leads/enrich-apollo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        organization_name: lead.college || '',
        linkedin_url: lead.linkedinUrl || '',
        apollo_api_key: apolloKey
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Apollo matching failed");
    }

    const patch = {};
    if (data.email) patch.email = data.email;
    if (data.phone && !lead.phone) patch.phone = data.phone;
    patch.status = data.email ? "Enriched via Apollo" : "Apollo: No email found";

    updateLeadInPipeline(leadId, patch);
    leadsList = getSavedLeads();
    renderLeadsTable();
    updateLeadStats();

    if (data.email) {
      showToast(`Enriched email: ${data.email}`);
    } else {
      showToast("Apollo found profile match, but direct email requires credit or was not revealed.");
    }
  } catch (err) {
    console.error("Apollo enrich error:", err);
    alert("Apollo Enrichment Error: " + err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerText = "⚡ Enrich via Apollo";
    }
  }
}

async function bulkEnrichWithApollo() {
  const apolloKey = getApolloApiKey();
  if (!apolloKey) {
    toggleApiDrawer(true);
    alert("Please enter your Apollo.io Free Tier API Key in the API Settings Drawer first!");
    return;
  }

  const targets = selectedLeadIds.size > 0 
    ? leadsList.filter(l => selectedLeadIds.has(l.id) && !l.email)
    : leadsList.filter(l => !l.email);

  if (targets.length === 0) {
    alert("All selected leads already have emails or no leads found.");
    return;
  }

  if (!confirm(`Run Apollo email lookup on ${targets.length} leads? (This consumes Apollo API calls)`)) {
    return;
  }

  const bulkBtn = document.getElementById('btn-bulk-enrich');
  if (bulkBtn) {
    bulkBtn.disabled = true;
    bulkBtn.innerHTML = `🌀 Enriching (${targets.length})...`;
  }

  let enrichedCount = 0;
  for (const lead of targets) {
    try {
      const parts = (lead.name || '').trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const res = await fetch('/api/leads/enrich-apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          organization_name: lead.college || '',
          linkedin_url: lead.linkedinUrl || '',
          apollo_api_key: apolloKey
        })
      });
      const data = await res.json();
      if (data.email) {
        updateLeadInPipeline(lead.id, { email: data.email, status: "Enriched via Apollo" });
        enrichedCount++;
      }
    } catch (e) {
      console.warn("Bulk enrich item failed:", e);
    }
  }

  leadsList = getSavedLeads();
  renderLeadsTable();
  updateLeadStats();
  if (bulkBtn) {
    bulkBtn.disabled = false;
    bulkBtn.innerHTML = `⚡ Bulk Enrich via Apollo`;
  }
  showToast(`Enrichment complete! Found ${enrichedCount} emails.`);
}

// ==========================================
// CSV Export Engines (Normal & Apollo-Ready)
// ==========================================

function exportStandardCsv() {
  if (leadsList.length === 0) {
    alert("No leads to export.");
    return;
  }

  const headers = ["ID", "Name", "Audience", "Headline", "College/Institution", "Location", "Phone", "Email", "LinkedIn URL", "Status"];
  const rows = leadsList.map(l => [
    l.id,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    l.audience || '',
    `"${(l.headline || '').replace(/"/g, '""')}"`,
    `"${(l.college || '').replace(/"/g, '""')}"`,
    `"${(l.location || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.linkedinUrl || '').replace(/"/g, '""')}"`,
    `"${(l.status || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `waynautic_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Downloaded Standard CSV!");
}

function exportApolloReadyCsv() {
  if (leadsList.length === 0) {
    alert("No leads to export.");
    return;
  }

  // Apollo.io Bulk Import Official CSV Headers:
  // First Name, Last Name, Title, Company, Person Linkedin Url, Email, Phone
  const headers = ["First Name", "Last Name", "Title", "Company", "Person Linkedin Url", "Email", "Phone"];
  const rows = leadsList.map(l => {
    const parts = (l.name || '').trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    const title = l.headline || (l.audience === 'tpo' ? 'Training and Placement Officer' : 'Student / Candidate');
    const company = l.college || 'Institution';

    return [
      `"${firstName.replace(/"/g, '""')}"`,
      `"${lastName.replace(/"/g, '""')}"`,
      `"${title.replace(/"/g, '""')}"`,
      `"${company.replace(/"/g, '""')}"`,
      `"${(l.linkedinUrl || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `apollo_bulk_import_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Downloaded Apollo-Ready CSV! Upload directly to Apollo Contacts.");
}

// ==========================================
// Branded AI Pitch Generation Modal
// ==========================================

function openPitchModal(leadId) {
  const lead = leadsList.find(l => l.id == leadId);
  if (!lead) return;

  currentPitchLeadId = leadId;
  const isTpo = lead.audience === 'tpo';

  const modal = document.getElementById('lead-pitch-modal');
  const leadTitle = document.getElementById('pitch-lead-title');
  const promptBox = document.getElementById('pitch-custom-prompt');
  const outputBox = document.getElementById('pitch-output-box');

  if (leadTitle) {
    leadTitle.innerText = `${lead.name} (${isTpo ? 'TPO / College Placement' : 'Student Candidate'})`;
  }

  // Pre-fill targeted prompt template
  if (promptBox) {
    if (isTpo) {
      promptBox.value = `Draft an institutional AI Masterclass & 3-Month Industry Internship partnership proposal for ${lead.name} at ${lead.college || 'their institution'}. Highlight Waynautic Academy's GenAI Award 2025, zero upfront cost for college, 4-5 agentic portfolio projects for their students, and a hands-on live workshop led by Pramod Gogadare.`;
    } else {
      promptBox.value = `Draft a high-conversion direct LinkedIn/WhatsApp invite for ${lead.name} (${lead.college || 'Engineering student'}). Emphasize breaking out of tutorial hell, our 4-Week Cohort with guaranteed 3-Month Industry Internship + Dual Certification, 1-on-1 mentor guidance, and an invitation to book a free 15-min AI Career Consultation call.`;
    }
  }

  if (outputBox) {
    outputBox.innerHTML = `<span class="text-slate-400 italic font-sans">Click "Generate Branded Pitch" below to call Gemini.</span>`;
  }

  if (modal) modal.classList.remove('hidden');
}

function closePitchModal() {
  const modal = document.getElementById('lead-pitch-modal');
  if (modal) modal.classList.add('hidden');
  currentPitchLeadId = null;
}

async function runLeadPitchGeneration() {
  const lead = leadsList.find(l => l.id == currentPitchLeadId);
  if (!lead) return;

  const promptBox = document.getElementById('pitch-custom-prompt');
  const outputBox = document.getElementById('pitch-output-box');
  const genBtn = document.getElementById('btn-generate-lead-pitch');

  const instruction = promptBox?.value.trim();
  if (!instruction) {
    alert("Please enter pitch instructions.");
    return;
  }

  if (genBtn) {
    genBtn.disabled = true;
    genBtn.innerHTML = `🌀 Generating Branded Pitch...`;
  }
  if (outputBox) {
    outputBox.innerHTML = `<span class="text-blue-600 font-mono animate-pulse font-bold">⚡ Calling Gemini with Brand Identity & Custom Lead Context...</span>`;
  }

  try {
    const fullPrompt = `
${WAYNAUTIC_BRAND_SYSTEM_PROMPT}

TARGET RECIPIENT INFORMATION:
- Name: ${lead.name}
- Target Type: ${lead.audience === 'tpo' ? 'Training & Placement Officer (College Leader)' : 'Student / Jobseeker'}
- College / Organization: ${lead.college || 'Engineering Institute'}
- Role / Headline: ${lead.headline || 'Placement / Academic'}
- Location: ${lead.location || 'Pune, India'}

SPECIFIC OUTREACH GOAL:
${instruction}

FORMAT & TONE REQUIREMENTS:
- If recipient is a TPO: Professional, consultative, institutional academic tone. Focus on student placement metrics, industry-readiness, verifiable internship certificates, and hands-on GenAI curriculum. Include Founder contact Pramod Gogadare (+91 9158998226).
- If recipient is a student: Energetic, mentor-driven, candid engineering tone. Focus on landing high-paying AI jobs, real agentic projects, and free career consultation.
- Provide a clear subject line and ready-to-send copy.
`;

    const generatedPitch = await callGeminiApi(fullPrompt);
    if (outputBox) {
      outputBox.innerText = generatedPitch;
    }
    // Update lead in pipeline
    updateLeadInPipeline(lead.id, { pitchGenerated: generatedPitch });
    showToast("Pitch generated successfully!");
  } catch (err) {
    console.error("Pitch generation error:", err);
    if (outputBox) {
      outputBox.innerHTML = `<span class="text-rose-600 font-mono font-bold">Error: ${escapeHtml(err.message)}</span>`;
    }
  } finally {
    if (genBtn) {
      genBtn.disabled = false;
      genBtn.innerHTML = `<span>⚡ Generate Branded Pitch</span>`;
    }
  }
}

function copyGeneratedPitch() {
  const outputBox = document.getElementById('pitch-output-box');
  if (outputBox && outputBox.innerText && !outputBox.innerText.includes('Click "Generate')) {
    copyText(outputBox.innerText);
  } else {
    alert("No pitch content to copy.");
  }
}
