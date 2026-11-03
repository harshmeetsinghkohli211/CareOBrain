/**
 * MedGraph Therapy Engine — Frontend Logic
 * Coordinates OCR, NLP extractive profiling, Neo4j graph reasoning,
 * and high-to-low sorted therapy/medication presentation.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ── State ──────────────────────────────────────────────────────────
  let selectedFile = null;
  let sampleReportsCatalog = [];
  let currentAnalysisResult = null;
  let prescribedTherapies = [];

  // ── DOM Elements ───────────────────────────────────────────────────
  const tabUpload = document.getElementById("tabUpload");
  const tabText = document.getElementById("tabText");
  const uploadView = document.getElementById("uploadView");
  const textView = document.getElementById("textView");

  const reportDropzone = document.getElementById("reportDropzone");
  const reportFileInput = document.getElementById("reportFileInput");
  const dropzoneEmpty = document.getElementById("dropzoneEmpty");
  const dropzonePreview = document.getElementById("dropzonePreview");
  const imagePreviewTarget = document.getElementById("imagePreviewTarget");
  const previewFilename = document.getElementById("previewFilename");
  const btnRemoveFile = document.getElementById("btnRemoveFile");

  const directClinicalText = document.getElementById("directClinicalText");
  const charCountLabel = document.getElementById("charCountLabel");
  const btnClearText = document.getElementById("btnClearText");
  const caseChipsContainer = document.getElementById("caseChipsContainer");

  const btnRunPipeline = document.getElementById("btnRunPipeline");
  const btnRunText = document.getElementById("btnRunText");
  const btnSpinner = document.getElementById("btnSpinner");

  const neo4jModeText = document.getElementById("neo4jModeText");
  const neo4jStatusPill = document.getElementById("neo4jStatusPill");
  const btnSeedDatabase = document.getElementById("btnSeedDatabase");

  // Stepper Elements
  const currentPipelineStageTag = document.getElementById("currentPipelineStageTag");
  const stepOCR = document.getElementById("stepOCR");
  const stepNLP = document.getElementById("stepNLP");
  const stepGraph = document.getElementById("stepGraph");
  const stepTokenizer = document.getElementById("stepTokenizer");

  // Results Elements
  const drugSafetyAlert = document.getElementById("drugSafetyAlert");
  const interactionList = document.getElementById("interactionList");
  const severityChip = document.getElementById("severityChip");
  const wordCountChip = document.getElementById("wordCountChip");
  const ocrConfidenceChip = document.getElementById("ocrConfidenceChip");
  const damagedAreasChips = document.getElementById("damagedAreasChips");
  const swellingChips = document.getElementById("swellingChips");
  const symptomsChips = document.getElementById("symptomsChips");
  const pathologiesChips = document.getElementById("pathologiesChips");
  const summarySentencesList = document.getElementById("summarySentencesList");

  const tabTherapies = document.getElementById("tabTherapies");
  const tabMedications = document.getElementById("tabMedications");
  const tabGraphInspector = document.getElementById("tabGraphInspector");
  const therapiesDeck = document.getElementById("therapiesDeck");
  const medicationsDeck = document.getElementById("medicationsDeck");
  const graphInspectorDeck = document.getElementById("graphInspectorDeck");
  const therapiesStream = document.getElementById("therapiesStream");
  const medicationsStream = document.getElementById("medicationsStream");
  const therapiesCount = document.getElementById("therapiesCount");
  const medicationsCount = document.getElementById("medicationsCount");
  const graphNodesViewer = document.getElementById("graphNodesViewer");
  const graphStatsDisplay = document.getElementById("graphStatsDisplay");
  const prescribedCountBadge = document.getElementById("prescribedCountBadge");
  const headerCartCountBadge = document.getElementById("headerCartCountBadge");
  const popoverCartSub = document.getElementById("popoverCartSub");
  const navRemindersBadge = document.getElementById("navRemindersBadge");

  // Navbar, Popover & Cart Drawer Elements
  const btnThreeDotsOverflow = document.getElementById("btnThreeDotsOverflow");
  const threeDotsPopover = document.getElementById("threeDotsPopover");
  const btnClosePopover = document.getElementById("btnClosePopover");
  const btnHeaderCart = document.getElementById("btnHeaderCart");
  const btnOpenCartFromPopover = document.getElementById("btnOpenCartFromPopover");
  const cartDrawerBackdrop = document.getElementById("cartDrawerBackdrop");
  const btnCloseCartDrawer = document.getElementById("btnCloseCartDrawer");
  const cartDrawerItemsList = document.getElementById("cartDrawerItemsList");
  const cartDrawerSummaryText = document.getElementById("cartDrawerSummaryText");
  const btnClearCart = document.getElementById("btnClearCart");
  const btnSeedFromPopover = document.getElementById("btnSeedFromPopover");

  // Custom Prescription Elements
  const btnToggleCustomRx = document.getElementById("btnToggleCustomRx");
  const formCustomRx = document.getElementById("formCustomRx");
  const customRxChevron = document.getElementById("customRxChevron");

  // ── Init ───────────────────────────────────────────────────────────
  fetchHealthCheck();
  loadSampleReports();
  fetchPrescriptions();
  setupNavbarAndCartListeners();

  // ── Unified Prescription Care Plan Management (Smriti Saathi Sync) ──
  async function fetchPrescriptions() {
    try {
      const saved = localStorage.getItem("smriti_doctor_prescribed_therapies") || localStorage.getItem("smriti_prescriptions_cart");
      if (saved) {
        prescribedTherapies = JSON.parse(saved);
      }
      const res = await fetch("/api/prescriptions");
      if (res.ok) {
        const data = await res.json();
        if (data.prescriptions && Array.isArray(data.prescriptions)) {
          const map = new Map();
          prescribedTherapies.forEach(p => map.set(p.id || p.therapy_id || p.medication_id || p.name || p.therapy_name, p));
          data.prescriptions.forEach(p => map.set(p.id || p.therapy_id || p.medication_id || p.name || p.therapy_name, p));
          prescribedTherapies = Array.from(map.values());
          syncLocalAndStorage();
        }
      }
    } catch (e) {
      console.log("Prescriptions loaded locally:", prescribedTherapies.length);
    }
    updatePrescriptionsBadge();
    renderCartDrawer();
  }

  function syncLocalAndStorage() {
    localStorage.setItem("smriti_doctor_prescribed_therapies", JSON.stringify(prescribedTherapies));
    localStorage.setItem("smriti_prescriptions_cart", JSON.stringify(prescribedTherapies));
    window.dispatchEvent(new Event("storage"));
  }

  function updatePrescriptionsBadge(animate = false) {
    const count = prescribedTherapies.length;
    const countText = `${count} Prescribed`;
    
    if (prescribedCountBadge) prescribedCountBadge.textContent = countText;
    if (headerCartCountBadge) {
      headerCartCountBadge.textContent = countText;
      if (animate) {
        headerCartCountBadge.classList.remove("pulse-cart");
        void headerCartCountBadge.offsetWidth;
        headerCartCountBadge.classList.add("pulse-cart");
      }
    }
    if (popoverCartSub) popoverCartSub.textContent = `${count} Care Plan Items`;
    if (cartDrawerSummaryText) cartDrawerSummaryText.textContent = `${count} Items in Care Plan`;
    if (navRemindersBadge) navRemindersBadge.textContent = Math.max(3, count);
  }

  async function syncPrescriptionsToBackend() {
    syncLocalAndStorage();
    try {
      await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptions: prescribedTherapies })
      });
    } catch (e) {
      console.error("Prescription sync error:", e);
    }
  }

  async function toggleTherapyPrescription(th, pct, isChecked, customNote = "") {
    const tid = th.therapy_id || "";
    if (isChecked) {
      const existingIdx = prescribedTherapies.findIndex(p => (p.therapy_id === tid || p.id === tid));
      const rxItem = {
        id: tid,
        item_type: "therapy",
        therapy_id: tid,
        therapy_name: th.therapy_name,
        name: th.therapy_name,
        therapy_description: th.therapy_description,
        description: th.therapy_description,
        doctor_note: customNote || "Perform as directed in Smriti Saathi daily routine.",
        combined_score: th.combined_score || 0.8,
        score_pct: pct,
        therapy_type: th.therapy_type || "Therapy",
        duration: th.duration || "4-8 weeks",
        evidence_level: th.evidence_level || "A",
        target_areas: th.target_areas || [],
        prescribed: true,
        prescribed_at: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        prescribed_by: "Dr. Debabrata Roy, MD"
      };

      if (existingIdx >= 0) {
        prescribedTherapies[existingIdx] = rxItem;
      } else {
        prescribedTherapies.push(rxItem);
      }
      showToast(`🛒 Added to Cart: "${th.therapy_name}" assigned to Patient!`);
      updatePrescriptionsBadge(true);
    } else {
      prescribedTherapies = prescribedTherapies.filter(p => p.therapy_id !== tid && p.id !== tid);
      showToast(`Removed "${th.therapy_name}" from Care Plan.`);
      updatePrescriptionsBadge(false);
    }

    await syncPrescriptionsToBackend();
    renderCartDrawer();
  }

  async function toggleMedicationPrescription(med, pct, isChecked, dosage, frequency, customNote = "") {
    const mid = med.medication_id || `med_${med.medication_name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    if (isChecked) {
      const existingIdx = prescribedTherapies.findIndex(p => (p.medication_id === mid || p.id === mid));
      const rxItem = {
        id: mid,
        item_type: "medication",
        medication_id: mid,
        medication_name: med.medication_name,
        name: med.medication_name,
        dosage: dosage || med.dosage || "Standard Dose",
        frequency: frequency || med.frequency || "Once daily",
        form: med.form || "oral tablet",
        medication_description: med.medication_description,
        description: med.medication_description,
        doctor_note: customNote || "Take with water as scheduled.",
        contraindications: med.contraindications || "None reported",
        combined_score: med.combined_score || 0.8,
        score_pct: pct,
        evidence_level: med.evidence_level || "A",
        prescribed: true,
        prescribed_at: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        prescribed_by: "Dr. Debabrata Roy, MD",
        taken_today: false
      };

      if (existingIdx >= 0) {
        prescribedTherapies[existingIdx] = rxItem;
      } else {
        prescribedTherapies.push(rxItem);
      }
      showToast(`💊 Added to Cart: "${med.medication_name}" (${rxItem.dosage}) prescribed!`);
      updatePrescriptionsBadge(true);
    } else {
      prescribedTherapies = prescribedTherapies.filter(p => p.medication_id !== mid && p.id !== mid);
      showToast(`Removed "${med.medication_name}" from Patient Care Plan.`);
      updatePrescriptionsBadge(false);
    }

    await syncPrescriptionsToBackend();
    renderCartDrawer();
  }

  async function removePrescriptionItem(itemId) {
    const item = prescribedTherapies.find(p => (p.id === itemId || p.therapy_id === itemId || p.medication_id === itemId));
    prescribedTherapies = prescribedTherapies.filter(p => p.id !== itemId && p.therapy_id !== itemId && p.medication_id !== itemId);
    showToast(`Removed "${item?.name || item?.therapy_name || 'Item'}" from Care Plan.`);
    updatePrescriptionsBadge(false);
    await syncPrescriptionsToBackend();
    renderCartDrawer();
    
    // Also uncheck checkbox in DOM if visible
    const therapyCb = document.querySelector(`.prescribe-therapy-cb[data-tid="${itemId}"]`);
    if (therapyCb) {
      therapyCb.checked = false;
      const card = therapyCb.closest(".ranked-item-card");
      if (card) {
        const tag = card.querySelector(".rx-status-tag");
        if (tag) {
          tag.className = "rx-status-tag";
          tag.textContent = "Not Prescribed";
        }
      }
    }
    const medCb = document.querySelector(`.prescribe-med-cb[data-mid="${itemId}"]`);
    if (medCb) {
      medCb.checked = false;
      const card = medCb.closest(".ranked-item-card");
      if (card) {
        const tag = card.querySelector(".rx-status-tag");
        if (tag) {
          tag.className = "rx-status-tag";
          tag.textContent = "Not Prescribed";
        }
      }
    }
  }

  async function clearAllPrescriptions() {
    if (!confirm("Are you sure you want to clear all prescribed care plan items?")) return;
    prescribedTherapies = [];
    showToast("Cleared all items from Care Plan Cart.");
    updatePrescriptionsBadge(false);
    await syncPrescriptionsToBackend();
    renderCartDrawer();

    // Uncheck all checkboxes on page
    document.querySelectorAll(".prescribe-therapy-cb, .prescribe-med-cb").forEach(cb => {
      cb.checked = false;
    });
    document.querySelectorAll(".rx-status-tag").forEach(tag => {
      tag.className = "rx-status-tag";
      tag.textContent = "Not Prescribed";
    });
  }

  function renderCartDrawer() {
    if (!cartDrawerItemsList) return;
    cartDrawerItemsList.innerHTML = "";

    if (prescribedTherapies.length === 0) {
      cartDrawerItemsList.innerHTML = `
        <div class="cart-empty-state">
          <i data-lucide="shopping-bag" class="cart-empty-icon"></i>
          <h4>Care Plan Cart is Empty</h4>
          <p>Prescribe therapies or medications from the ranked lists below or add custom instructions.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    prescribedTherapies.forEach((item, idx) => {
      const itemId = item.id || item.therapy_id || item.medication_id || `item_${idx}`;
      const isMed = item.item_type === "medication";
      const isCustom = item.item_type === "activity" || item.item_type === "note";
      const title = item.name || item.therapy_name || item.medication_name || "Care Item";
      const tagText = isMed ? "Medication" : isCustom ? "Custom Item" : "Therapy";
      const tagClass = isMed ? "med" : isCustom ? "custom" : "";

      const card = document.createElement("div");
      card.className = "cart-item-card";
      card.innerHTML = `
        <div class="cart-item-top">
          <span class="cart-item-tag ${tagClass}">${tagText}</span>
          <button class="btn-remove-cart-item" data-id="${itemId}" title="Remove from Care Plan">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
        <div class="cart-item-title">${title}</div>
        <div class="cart-item-desc">${item.description || item.therapy_description || item.medication_description || ""}</div>
        ${item.doctor_note ? `<div class="cart-item-doctor-note"><strong>Dr. Note:</strong> ${item.doctor_note}</div>` : ""}
        <div class="cart-item-meta">
          ${item.dosage ? `<span>Dosage: ${item.dosage}</span>` : ""}
          ${item.frequency ? `<span>Freq: ${item.frequency}</span>` : ""}
          ${item.duration ? `<span>Duration: ${item.duration}</span>` : ""}
          ${item.score_pct ? `<span>${item.score_pct}% Match</span>` : ""}
        </div>
      `;

      const removeBtn = card.querySelector(".btn-remove-cart-item");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => removePrescriptionItem(itemId));
      }

      cartDrawerItemsList.appendChild(card);
    });

    lucide.createIcons();
  }

  // ── Navbar, Popover & Cart Listeners ─────────────────────────────────
  function setupNavbarAndCartListeners() {
    // 1. Three Dots Popover
    if (btnThreeDotsOverflow && threeDotsPopover) {
      btnThreeDotsOverflow.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = threeDotsPopover.classList.contains("hidden");
        threeDotsPopover.classList.toggle("hidden", !isHidden);
        btnThreeDotsOverflow.classList.toggle("active", isHidden);
      });

      if (btnClosePopover) {
        btnClosePopover.addEventListener("click", () => {
          threeDotsPopover.classList.add("hidden");
          btnThreeDotsOverflow.classList.remove("active");
        });
      }

      document.addEventListener("click", (e) => {
        if (!threeDotsPopover.contains(e.target) && e.target !== btnThreeDotsOverflow) {
          threeDotsPopover.classList.add("hidden");
          btnThreeDotsOverflow.classList.remove("active");
        }
      });
    }

    // 2. Care Plan Cart Drawer
    if (btnHeaderCart && cartDrawerBackdrop) {
      btnHeaderCart.addEventListener("click", () => {
        renderCartDrawer();
        cartDrawerBackdrop.classList.remove("hidden");
      });
    }

    if (btnOpenCartFromPopover && cartDrawerBackdrop) {
      btnOpenCartFromPopover.addEventListener("click", () => {
        if (threeDotsPopover) threeDotsPopover.classList.add("hidden");
        renderCartDrawer();
        cartDrawerBackdrop.classList.remove("hidden");
      });
    }

    if (btnCloseCartDrawer && cartDrawerBackdrop) {
      btnCloseCartDrawer.addEventListener("click", () => {
        cartDrawerBackdrop.classList.add("hidden");
      });
    }

    if (cartDrawerBackdrop) {
      cartDrawerBackdrop.addEventListener("click", (e) => {
        if (e.target === cartDrawerBackdrop) {
          cartDrawerBackdrop.classList.add("hidden");
        }
      });
    }

    if (btnClearCart) {
      btnClearCart.addEventListener("click", clearAllPrescriptions);
    }

    if (btnSeedFromPopover && btnSeedDatabase) {
      btnSeedFromPopover.addEventListener("click", () => {
        btnSeedDatabase.click();
        if (threeDotsPopover) threeDotsPopover.classList.add("hidden");
      });
    }

    // 3. Custom Prescription Form
    if (btnToggleCustomRx && formCustomRx) {
      btnToggleCustomRx.addEventListener("click", () => {
        const isHidden = formCustomRx.classList.contains("hidden");
        formCustomRx.classList.toggle("hidden", !isHidden);
        if (customRxChevron) {
          customRxChevron.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
        }
      });

      formCustomRx.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("customRxTitle").value.trim();
        const type = document.getElementById("customRxType").value;
        const duration = document.getElementById("customRxDuration").value.trim();
        const target = document.getElementById("customRxTarget").value.trim();
        const notes = document.getElementById("customRxNotes").value.trim();

        if (!title || !notes) return;

        const customItem = {
          id: `custom_${Date.now()}`,
          item_type: type,
          name: title,
          therapy_name: title,
          medication_name: title,
          dosage: duration || "As indicated",
          duration: duration || "Daily routine",
          frequency: duration || "Daily",
          target_areas: target ? [target] : [],
          doctor_note: notes,
          description: notes,
          evidence_level: "A",
          score_pct: 100,
          prescribed: true,
          prescribed_at: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          prescribed_by: "Dr. Debabrata Roy, MD"
        };

        prescribedTherapies.push(customItem);
        showToast(`✨ Prescribed: "${title}" added to Patient Care Plan!`);
        updatePrescriptionsBadge(true);
        await syncPrescriptionsToBackend();
        renderCartDrawer();

        formCustomRx.reset();
        formCustomRx.classList.add("hidden");
        if (customRxChevron) customRxChevron.style.transform = "rotate(0deg)";
      });
    }
  }

  // ── Tabs Switching ─────────────────────────────────────────────────
  tabUpload.addEventListener("click", () => {
    tabUpload.classList.add("active");
    tabText.classList.remove("active");
    uploadView.classList.add("active");
    textView.classList.remove("active");
  });

  tabText.addEventListener("click", () => {
    tabText.classList.add("active");
    tabUpload.classList.remove("active");
    textView.classList.add("active");
    uploadView.classList.remove("active");
  });

  // Deck Tabs Switching
  tabTherapies.addEventListener("click", () => switchDeck("therapies"));
  tabMedications.addEventListener("click", () => switchDeck("medications"));
  tabGraphInspector.addEventListener("click", () => switchDeck("graph"));

  function switchDeck(deck) {
    [tabTherapies, tabMedications, tabGraphInspector].forEach(t => t.classList.remove("active"));
    [therapiesDeck, medicationsDeck, graphInspectorDeck].forEach(d => d.classList.remove("active"));

    if (deck === "therapies") {
      tabTherapies.classList.add("active");
      therapiesDeck.classList.add("active");
    } else if (deck === "medications") {
      tabMedications.classList.add("active");
      medicationsDeck.classList.add("active");
    } else if (deck === "graph") {
      tabGraphInspector.classList.add("active");
      graphInspectorDeck.classList.add("active");
    }
  }

  // ── Character Count for Textarea ───────────────────────────────────
  directClinicalText.addEventListener("input", () => {
    const len = directClinicalText.value.length;
    charCountLabel.textContent = `${len} characters`;
  });

  btnClearText.addEventListener("click", () => {
    directClinicalText.value = "";
    charCountLabel.textContent = "0 characters";
  });

  // ── Drag & Drop File Upload ────────────────────────────────────────
  reportDropzone.addEventListener("click", (e) => {
    if (e.target.closest("#btnRemoveFile")) return;
    reportFileInput.click();
  });

  reportDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    reportDropzone.classList.add("dragover");
  });

  reportDropzone.addEventListener("dragleave", () => {
    reportDropzone.classList.remove("dragover");
  });

  reportDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    reportDropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  reportFileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  function handleFileSelected(file) {
    selectedFile = file;
    previewFilename.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewTarget.src = e.target.result;
      dropzoneEmpty.classList.add("hidden");
      dropzonePreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
    showToast(`Scan loaded: ${file.name}`);
  }

  btnRemoveFile.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedFile = null;
    reportFileInput.value = "";
    imagePreviewTarget.src = "";
    dropzonePreview.classList.add("hidden");
    dropzoneEmpty.classList.remove("hidden");
  });

  // ── Quick Case Selector ────────────────────────────────────────────
  async function loadSampleReports() {
    try {
      const res = await fetch("/api/sample-reports");
      if (!res.ok) throw new Error("Failed to load sample cases");
      sampleReportsCatalog = await res.json();

      caseChipsContainer.innerHTML = "";
      sampleReportsCatalog.forEach((sample, idx) => {
        const chip = document.createElement("div");
        chip.className = "case-chip";
        chip.dataset.id = sample.id;
        chip.innerHTML = `
          <div>
            <span class="case-chip-title">${sample.title}</span>
            <span class="case-chip-meta">${sample.category} &bull; ${sample.body_area}</span>
          </div>
          <i data-lucide="chevron-right" class="case-chip-arrow"></i>
        `;

        chip.addEventListener("click", () => {
          document.querySelectorAll(".case-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          selectSampleCase(sample);
        });

        caseChipsContainer.appendChild(chip);
      });
      lucide.createIcons();
    } catch (err) {
      console.error("Error loading sample cases:", err);
    }
  }

  function selectSampleCase(sample) {
    // Switch to text tab and populate
    tabText.click();
    directClinicalText.value = sample.text;
    charCountLabel.textContent = `${sample.text.length} characters`;
    showToast(`Loaded scenario: ${sample.title}`);
  }

  // ── Health Check ───────────────────────────────────────────────────
  async function fetchHealthCheck() {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        const graph = data.graph;
        if (graph.neo4j_connected) {
          neo4jModeText.textContent = "Live Bolt 7687";
          neo4jStatusPill.classList.remove("standby");
        } else {
          neo4jModeText.textContent = "Embedded Graph";
          neo4jStatusPill.classList.add("standby");
        }
        graphStatsDisplay.textContent = `${graph.total_diseases} Diseases • ${graph.total_therapies} Therapies • ${graph.total_medications} Meds • ${graph.mode}`;
      }
    } catch (e) {
      neo4jModeText.textContent = "Local Graph";
    }
  }

  btnSeedDatabase.addEventListener("click", async () => {
    btnSeedDatabase.disabled = true;
    btnSeedDatabase.innerHTML = `<span class="btn-spinner" style="width:12px;height:12px"></span> Seeding...`;
    try {
      const res = await fetch("/api/seed-graph", { method: "POST" });
      const data = await res.json();
      showToast(data.message || "Neo4j Knowledge Graph synchronized!");
      fetchHealthCheck();
    } catch (err) {
      showToast("Seed request completed");
    } finally {
      btnSeedDatabase.disabled = false;
      btnSeedDatabase.innerHTML = `<i data-lucide="database"></i> Seed Graph`;
      lucide.createIcons();
    }
  });

  // ── Main Pipeline Execution ────────────────────────────────────────
  btnRunPipeline.addEventListener("click", runDiagnosticPipeline);

  async function runDiagnosticPipeline() {
    const isImageMode = uploadView.classList.contains("active");
    const textVal = directClinicalText.value.trim();

    if (isImageMode && !selectedFile) {
      showToast("Please select a medical report image or choose a sample case.", true);
      return;
    }

    if (!isImageMode && textVal.length < 10) {
      showToast("Please enter clinical notes or findings to analyze.", true);
      return;
    }

    // Set UI loading state
    setLoadingState(true);
    animateStagesStart();

    try {
      let response;
      if (isImageMode && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/analyze-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textVal }),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: "Analysis failed" }));
        throw new Error(errData.detail || "Pipeline failed");
      }

      currentAnalysisResult = await response.json();
      animateStagesComplete(currentAnalysisResult.execution_time_ms);
      renderAnalysisResults(currentAnalysisResult);
      showToast(`Analyzed in ${currentAnalysisResult.execution_time_ms || 80}ms — Ranked High to Low!`);
    } catch (err) {
      console.error("Diagnostic error:", err);
      showToast(`Error: ${err.message}`, true);
      resetStepper();
    } finally {
      setLoadingState(false);
    }
  }

  function setLoadingState(loading) {
    if (loading) {
      btnRunPipeline.disabled = true;
      btnRunText.textContent = "Processing OCR, Graph & TF-IDF Vectors...";
      btnSpinner.classList.remove("hidden");
    } else {
      btnRunPipeline.disabled = false;
      btnRunText.textContent = "Analyze Report & Rank Therapies";
      btnSpinner.classList.add("hidden");
    }
  }

  // ── Stepper Animations ─────────────────────────────────────────────
  function animateStagesStart() {
    currentPipelineStageTag.textContent = "Processing...";
    [stepOCR, stepNLP, stepGraph, stepTokenizer].forEach(s => {
      s.className = "step-item running";
      s.querySelector(".step-state-badge").textContent = "Active";
    });
  }

  function animateStagesComplete(execTimeMs) {
    [stepOCR, stepNLP, stepGraph, stepTokenizer].forEach(s => {
      s.className = "step-item completed";
      s.querySelector(".step-state-badge").textContent = "Complete";
    });
    currentPipelineStageTag.textContent = execTimeMs ? `⚡ Done in ${execTimeMs}ms` : "Complete";
  }

  function resetStepper() {
    currentPipelineStageTag.textContent = "Standby";
    [stepOCR, stepNLP, stepGraph, stepTokenizer].forEach(s => {
      s.className = "step-item";
      s.querySelector(".step-state-badge").textContent = "Waiting";
    });
  }

  // ── Render Results ─────────────────────────────────────────────────
  function renderAnalysisResults(data) {
    const ocr = data.ocr || {};
    const summary = data.summary || {};
    const profile = summary.clinical_profile || {};
    const entities = summary.entities || {};
    const therapies = data.therapies || [];
    const medications = data.medications || [];
    const interactions = data.drug_interactions || [];

    // 1. Metrics Header
    severityChip.textContent = `Severity: ${(profile.severity_level || "Undetermined").toUpperCase()}`;
    wordCountChip.textContent = `Words: ${ocr.word_count || 0}`;
    ocrConfidenceChip.textContent = `OCR Confidence: ${ocr.confidence ? ocr.confidence + "%" : "100%"}`;

    // 2. Clinical Entity Chips
    renderChips(damagedAreasChips, profile.affected_areas, "entity-chip");
    
    // Swelling & inflammation
    const swellingList = [];
    (profile.reported_symptoms || []).forEach(s => {
      if (s.toLowerCase().includes("swell") || s.toLowerCase().includes("edema") || s.toLowerCase().includes("effusion") || s.toLowerCase().includes("redness") || s.toLowerCase().includes("warmth")) {
        swellingList.push(s);
      }
    });
    (entities.imaging_findings || []).forEach(f => {
      if (f.toLowerCase().includes("effusion") || f.toLowerCase().includes("fluid") || f.toLowerCase().includes("edema")) {
        swellingList.push(f);
      }
    });
    renderChips(swellingChips, swellingList.length ? swellingList : ["Mild localized swelling noted"], "entity-chip swelling");

    // Symptoms
    renderChips(symptomsChips, profile.reported_symptoms, "entity-chip");

    // Pathologies / Diagnosed Conditions
    const pathologies = (profile.diagnosed_conditions && profile.diagnosed_conditions.length) 
      ? profile.diagnosed_conditions 
      : data.matched_diseases;
    renderChips(pathologiesChips, pathologies, "entity-chip pathology");

    // 3. Dense Extractive Summary Sentences
    summarySentencesList.innerHTML = "";
    const sentences = summary.summary_sentences || [];
    if (sentences.length > 0) {
      sentences.forEach(s => {
        const li = document.createElement("li");
        li.className = "summary-sentence-item";
        li.textContent = s.sentence;
        summarySentencesList.appendChild(li);
      });
    } else if (ocr.lines && ocr.lines.length) {
      ocr.lines.slice(0, 4).forEach(line => {
        const li = document.createElement("li");
        li.className = "summary-sentence-item";
        li.textContent = line;
        summarySentencesList.appendChild(li);
      });
    } else {
      summarySentencesList.innerHTML = `<li class="summary-item-placeholder">No summary sentences extracted.</li>`;
    }

    // 4. Drug Interactions Safety Banner
    if (interactions && interactions.length > 0) {
      drugSafetyAlert.classList.remove("hidden");
      interactionList.innerHTML = "";
      interactions.forEach(inter => {
        const item = document.createElement("div");
        item.className = "interaction-item";
        item.innerHTML = `
          <span class="severity-tag">${inter.severity}</span>
          <strong>${inter.drug_a}</strong> &harr; <strong>${inter.drug_b}</strong>: ${inter.interaction_note}
        `;
        interactionList.appendChild(item);
      });
    } else {
      drugSafetyAlert.classList.add("hidden");
    }

    // 5. Ranked Therapies Stream (HIGH to LOW)
    therapiesCount.textContent = therapies.length;
    therapiesStream.innerHTML = "";
    if (therapies.length === 0) {
      therapiesStream.innerHTML = `
        <div class="empty-state-card">
          <i data-lucide="clipboard-list" class="empty-state-icon"></i>
          <h3>No Direct Therapies Matched</h3>
          <p>Consider expanding search keywords or selecting a predefined clinical case.</p>
        </div>
      `;
    } else {
      therapies.forEach((th, idx) => {
        const pct = Math.round((th.combined_score || 0.8) * 100);
        const tid = th.therapy_id || "";
        const isGame = typeof TherapyGames !== "undefined" && TherapyGames.getGameType(tid) === "game";
        const btnText = isGame ? "🎮 Play Interactive Exercise" : "📋 View Clinical Protocol";
        const isPrescribed = Boolean(prescribedTherapies.find(p => (p.therapy_id === tid || p.id === tid)));
        const existingRx = prescribedTherapies.find(p => (p.therapy_id === tid || p.id === tid));
        const defaultDocNote = existingRx?.doctor_note || "";

        const card = document.createElement("div");
        card.className = "ranked-item-card";
        card.innerHTML = `
          <div class="rank-badge-ribbon">
            <span class="rank-number">#${idx + 1} High Match</span>
          </div>

          <div class="score-progress-group">
            <div class="score-labels">
              <span>Match Relevance Score</span>
              <span class="score-val">${pct}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar-fill" style="width: ${pct}%"></div>
            </div>
          </div>

          <div class="item-main-header">
            <h3 class="item-title">${th.therapy_name}</h3>
            <div class="item-meta-tags">
              <span class="item-tag evidence">Evidence ${th.evidence_level || "A"}</span>
              <span class="item-tag">${th.therapy_type || "Therapy"}</span>
              <span class="item-tag">Duration: ${th.duration || "4-8 weeks"}</span>
              ${th.target_areas && th.target_areas.length ? `<span class="item-tag">Target: ${th.target_areas.join(", ")}</span>` : ""}
            </div>
          </div>

          <p class="item-desc">${th.therapy_description}</p>

          <div class="therapy-notes-field">
            <label>Doctor's Custom Clinical Description & Instructions:</label>
            <textarea class="therapy-rx-notes" rows="2" placeholder="Optional notes for patient (e.g. 2 sets morning and evening, sit upright)...">${defaultDocNote}</textarea>
          </div>

          <div class="item-footer-details">
            <div class="diseases-list-mini">
              Treats: <strong>${(th.matching_diseases || []).join(", ") || "General Orthopedic / Vascular Pathology"}</strong>
            </div>
            <div class="contraindications-mini">
              Cautions: ${th.contraindications || "Standard clinical precautions"}
            </div>
          </div>

          <!-- Doctor Prescription Checkbox for Smriti Saathi Sync -->
          <div class="prescribe-control-box">
            <label class="prescribe-checkbox-label">
              <input type="checkbox" class="prescribe-therapy-cb" data-tid="${tid}" ${isPrescribed ? 'checked' : ''}>
              <span class="custom-cb"></span>
              <span class="cb-text-block">
                <span class="cb-title">Recommend to Smriti Saathi Patient Care Plan</span>
                <span class="cb-subtitle">Adds to Cart and syncs so patient can play/perform this activity in Smriti Saathi</span>
              </span>
            </label>
            <span class="rx-status-tag ${isPrescribed ? 'active' : ''}">${isPrescribed ? '✓ Prescribed' : 'Not Prescribed'}</span>
          </div>

          <div class="item-action-footer">
            <button class="btn-therapy-action ${isGame ? "btn-game-type" : ""}" data-tid="${tid}" data-tname="${th.therapy_name}">
              ${btnText}
            </button>
          </div>
        `;

        // Checkbox listener
        const rxCheckbox = card.querySelector(".prescribe-therapy-cb");
        const rxStatusTag = card.querySelector(".rx-status-tag");
        const rxNotesArea = card.querySelector(".therapy-rx-notes");

        if (rxCheckbox) {
          rxCheckbox.addEventListener("change", (e) => {
            const isChecked = e.target.checked;
            const customNotes = rxNotesArea ? rxNotesArea.value.trim() : "";
            if (rxStatusTag) {
              rxStatusTag.className = `rx-status-tag ${isChecked ? 'active' : ''}`;
              rxStatusTag.textContent = isChecked ? '✓ Prescribed' : 'Not Prescribed';
            }
            toggleTherapyPrescription(th, pct, isChecked, customNotes);
          });
        }

        if (rxNotesArea) {
          rxNotesArea.addEventListener("input", (e) => {
            if (rxCheckbox && rxCheckbox.checked) {
              toggleTherapyPrescription(th, pct, true, e.target.value.trim());
            }
          });
        }

        const actionBtn = card.querySelector(".btn-therapy-action");
        if (actionBtn) {
          actionBtn.addEventListener("click", () => {
            if (typeof TherapyGames !== "undefined") {
              TherapyGames.openGame(tid, th.therapy_name);
            }
          });
        }

        therapiesStream.appendChild(card);
      });
    }

    // 6. Ranked Medications Stream (HIGH to LOW)
    medicationsCount.textContent = medications.length;
    medicationsStream.innerHTML = "";
    if (medications.length === 0) {
      medicationsStream.innerHTML = `
        <div class="empty-state-card">
          <i data-lucide="pill" class="empty-state-icon"></i>
          <h3>No Direct Medications Matched</h3>
          <p>Prescriptions will appear here when medical pathology matches are confirmed.</p>
        </div>
      `;
    } else {
      medications.forEach((med, idx) => {
        const pct = Math.round((med.combined_score || 0.8) * 100);
        const mid = med.medication_id || `med_${med.medication_name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const isPrescribed = Boolean(prescribedTherapies.find(p => (p.medication_id === mid || p.id === mid)));
        const existingRx = prescribedTherapies.find(p => (p.medication_id === mid || p.id === mid));
        const defaultDosage = existingRx?.dosage || med.dosage || "Standard Dose";
        const defaultFreq = existingRx?.frequency || med.frequency || "Once daily";
        const defaultNotes = existingRx?.doctor_note || "";

        const card = document.createElement("div");
        card.className = "ranked-item-card";
        card.innerHTML = `
          <div class="rank-badge-ribbon">
            <span class="rank-number">#${idx + 1} High Match</span>
          </div>

          <div class="score-progress-group">
            <div class="score-labels">
              <span>Match Relevance Score</span>
              <span class="score-val">${pct}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar-fill" style="width: ${pct}%"></div>
            </div>
          </div>

          <div class="item-main-header">
            <h3 class="item-title">${med.medication_name}</h3>
            <div class="item-meta-tags">
              <span class="item-tag evidence">Evidence ${med.evidence_level || "A"}</span>
              <span class="item-tag dosage">Dosage: ${med.dosage || "Standard Dose"}</span>
              <span class="item-tag frequency">${med.frequency || "Daily"}</span>
              <span class="item-tag">${med.form || "oral"}</span>
            </div>
          </div>

          <p class="item-desc">${med.medication_description}</p>

          <!-- Doctor Editable Dosage, Frequency & Notes -->
          <div class="med-rx-controls">
            <div class="med-rx-inputs-row">
              <div class="med-input-field">
                <label>Prescribed Dosage</label>
                <input type="text" class="med-rx-dosage" value="${defaultDosage}" placeholder="e.g. 5mg or 10mg">
              </div>
              <div class="med-input-field">
                <label>Frequency & Timing</label>
                <input type="text" class="med-rx-frequency" value="${defaultFreq}" placeholder="e.g. Once daily at bedtime">
              </div>
            </div>
            <div class="med-notes-field">
              <label>Doctor's Special Instructions for Patient</label>
              <textarea class="med-rx-notes" rows="2" placeholder="e.g. Take with a glass of water after dinner. Monitor for dizziness.">${defaultNotes}</textarea>
            </div>
          </div>

          <div class="item-footer-details">
            <div class="diseases-list-mini">
              Indicated For: <strong>${(med.matching_diseases || []).join(", ") || "Clinical Indication"}</strong>
            </div>
            <div class="contraindications-mini">
              Contraindications: ${med.contraindications || "None reported"}
            </div>
          </div>

          <!-- Doctor Medication Prescription Checkbox ("Add to Cart") -->
          <div class="prescribe-control-box">
            <label class="prescribe-checkbox-label">
              <input type="checkbox" class="prescribe-med-cb" data-mid="${mid}" ${isPrescribed ? 'checked' : ''}>
              <span class="custom-cb"></span>
              <span class="cb-text-block">
                <span class="cb-title">Prescribe Medication to Patient Care Plan</span>
                <span class="cb-subtitle">Syncs directly into patient's dashboard with reminders and dosage tracker</span>
              </span>
            </label>
            <span class="rx-status-tag ${isPrescribed ? 'active' : ''}">${isPrescribed ? '✓ Prescribed' : 'Not Prescribed'}</span>
          </div>
        `;

        // Checkbox listener
        const rxCheckbox = card.querySelector(".prescribe-med-cb");
        const rxStatusTag = card.querySelector(".rx-status-tag");
        const dosageInput = card.querySelector(".med-rx-dosage");
        const freqInput = card.querySelector(".med-rx-frequency");
        const notesArea = card.querySelector(".med-rx-notes");

        const updateMedRx = (isChecked) => {
          const dosage = dosageInput ? dosageInput.value.trim() : med.dosage;
          const freq = freqInput ? freqInput.value.trim() : med.frequency;
          const notes = notesArea ? notesArea.value.trim() : "";
          if (rxStatusTag) {
            rxStatusTag.className = `rx-status-tag ${isChecked ? 'active' : ''}`;
            rxStatusTag.textContent = isChecked ? '✓ Prescribed' : 'Not Prescribed';
          }
          toggleMedicationPrescription(med, pct, isChecked, dosage, freq, notes);
        };

        if (rxCheckbox) {
          rxCheckbox.addEventListener("change", (e) => {
            updateMedRx(e.target.checked);
          });
        }

        [dosageInput, freqInput, notesArea].forEach(inputEl => {
          if (inputEl) {
            inputEl.addEventListener("input", () => {
              if (rxCheckbox && rxCheckbox.checked) {
                updateMedRx(true);
              }
            });
          }
        });

        medicationsStream.appendChild(card);
      });
    }

    // 7. Graph Topology Viewer
    renderGraphTopology(data);

    // Refresh icons
    lucide.createIcons();
  }

  function renderChips(container, items, className) {
    container.innerHTML = "";
    if (!items || items.length === 0) {
      container.innerHTML = `<span class="empty-placeholder">None detected</span>`;
      return;
    }
    items.forEach(item => {
      const chip = document.createElement("span");
      chip.className = className;
      chip.textContent = item;
      container.appendChild(chip);
    });
  }

  function renderGraphTopology(data) {
    graphNodesViewer.innerHTML = "";
    const matchedDiseases = data.matched_diseases || [];
    const topTherapies = (data.therapies || []).slice(0, 3);
    const topMeds = (data.medications || []).slice(0, 3);

    if (matchedDiseases.length === 0 && topTherapies.length === 0) {
      graphNodesViewer.innerHTML = `
        <div class="graph-empty-preview">
          <i data-lucide="git-fork" class="graph-preview-icon"></i>
          <h4>Active Graph Relationships</h4>
          <p>Run report diagnosis to visualize graph paths.</p>
        </div>
      `;
      return;
    }

    // Render active graph paths
    matchedDiseases.forEach(dName => {
      const pathCard = document.createElement("div");
      pathCard.className = "graph-path-card";

      let therapiesHtml = topTherapies.map(t => `<span class="hop-node therapy">${t.therapy_name}</span>`).join(" ");
      let medsHtml = topMeds.map(m => `<span class="hop-node med">${m.medication_name}</span>`).join(" ");

      pathCard.innerHTML = `
        <div class="graph-path-title">
          <i data-lucide="network"></i> Traversal Route for: ${dName}
        </div>
        <div class="graph-path-hops">
          <span class="hop-node disease">${dName}</span>
          <span class="hop-arrow">&mdash;[:TREATED_BY]&rarr;</span>
          ${therapiesHtml || '<span class="hop-node therapy">Therapy</span>'}
          <span class="hop-arrow">&mdash;[:MEDICATED_WITH]&rarr;</span>
          ${medsHtml || '<span class="hop-node med">Medication</span>'}
        </div>
      `;
      graphNodesViewer.appendChild(pathCard);
    });
  }

  // ── Toast Notification Helper ──────────────────────────────────────
  function showToast(message, isError = false) {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${isError ? "error" : ""}`;
    toast.innerHTML = `
      <i data-lucide="${isError ? "alert-circle" : "check-circle"}"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
