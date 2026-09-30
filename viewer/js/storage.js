// Waynautic Academy — Local Storage & Gallery Persistence Engine

function loadCampaignsFromStorage() {
  const savedDb = localStorage.getItem(STORAGE_KEY_DB);
  if (savedDb) {
    try {
      return JSON.parse(savedDb);
    } catch (e) {
      console.warn("Error parsing saved campaigns DB, falling back to defaults", e);
      return DEFAULT_CAMPAIGNS;
    }
  }
  saveCampaignsToStorage(DEFAULT_CAMPAIGNS);
  return DEFAULT_CAMPAIGNS;
}

function saveCampaignsToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save campaigns to localStorage:", err);
  }
}

// ==========================================
// WhatsApp Flyer Image Gallery Persistence
// ==========================================

function getSavedFlyers() {
  const data = localStorage.getItem(STORAGE_KEY_GALLERY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.warn("Error parsing saved flyer gallery:", e);
    return [];
  }
}

function saveFlyerToGallery(flyerRecord) {
  // flyerRecord: { id, title, imageDataUrl, flyerData, createdAt }
  const currentList = getSavedFlyers();
  // Add new item at the beginning
  currentList.unshift(flyerRecord);

  // Safety: cap gallery at 25 items to protect localStorage quota
  if (currentList.length > 25) {
    currentList.pop();
  }

  try {
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(currentList));
    updateGalleryCountBadges();
    return true;
  } catch (err) {
    console.error("Failed to save flyer image to gallery:", err);
    // If quota exceeded, try removing oldest 2 items and retry
    if (currentList.length > 2) {
      currentList.splice(-2);
      try {
        localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(currentList));
        updateGalleryCountBadges();
        return true;
      } catch (retryErr) {
        alert("Storage quota exceeded. Please delete some saved flyers from the gallery.");
        return false;
      }
    }
    return false;
  }
}

function deleteFlyerFromGallery(id) {
  let list = getSavedFlyers();
  list = list.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(list));
  updateGalleryCountBadges();
  renderGalleryGrid();
}

function clearFlyerGallery() {
  if (confirm("Are you sure you want to delete all saved flyers from the gallery?")) {
    localStorage.removeItem(STORAGE_KEY_GALLERY);
    updateGalleryCountBadges();
    renderGalleryGrid();
    showToast("Gallery cleared.");
  }
}

function updateGalleryCountBadges() {
  const count = getSavedFlyers().length;
  document.querySelectorAll(".gallery-count-badge").forEach(el => {
    el.innerText = `${count}`;
  });
}

// ==========================================
// Lead Radar & Apollo Pipeline Persistence
// ==========================================

function getSavedLeads() {
  const data = localStorage.getItem(STORAGE_KEY_LEADS);
  if (!data) {
    saveLeadsToPipeline(DEFAULT_LEADS);
    return DEFAULT_LEADS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.warn("Error parsing saved leads:", e);
    return DEFAULT_LEADS;
  }
}

function saveLeadsToPipeline(leads) {
  try {
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
  } catch (err) {
    console.error("Failed to save leads to localStorage:", err);
  }
}

function addLeadsToPipeline(newLeads) {
  const currentLeads = getSavedLeads();
  let addedCount = 0;
  newLeads.forEach(item => {
    const exists = currentLeads.some(l => 
      (l.linkedinUrl && item.linkedinUrl && l.linkedinUrl.toLowerCase() === item.linkedinUrl.toLowerCase()) ||
      (l.name.toLowerCase() === item.name.toLowerCase() && (l.college || '').toLowerCase() === (item.college || '').toLowerCase())
    );
    if (!exists) {
      currentLeads.unshift(item);
      addedCount++;
    }
  });
  saveLeadsToPipeline(currentLeads);
  return { addedCount, total: currentLeads.length };
}

function updateLeadInPipeline(id, patch) {
  const leads = getSavedLeads();
  const idx = leads.findIndex(l => l.id == id);
  if (idx !== -1) {
    leads[idx] = { ...leads[idx], ...patch };
    saveLeadsToPipeline(leads);
    return leads[idx];
  }
  return null;
}

function deleteLeadFromPipeline(id) {
  let leads = getSavedLeads();
  leads = leads.filter(l => l.id != id);
  saveLeadsToPipeline(leads);
}

function clearLeadsPipeline() {
  localStorage.removeItem(STORAGE_KEY_LEADS);
}

function getGoogleApiCredentials() {
  return {
    apiKey: localStorage.getItem(STORAGE_KEY_GOOGLE_API) || '',
    cx: localStorage.getItem(STORAGE_KEY_GOOGLE_CX) || ''
  };
}

function saveGoogleApiCredentials(apiKey, cx) {
  localStorage.setItem(STORAGE_KEY_GOOGLE_API, (apiKey || '').trim());
  localStorage.setItem(STORAGE_KEY_GOOGLE_CX, (cx || '').trim());
}

function getApolloApiKey() {
  return (localStorage.getItem(STORAGE_KEY_APOLLO_API) || '').trim();
}

function saveApolloApiKey(key) {
  localStorage.setItem(STORAGE_KEY_APOLLO_API, (key || '').trim());
}
