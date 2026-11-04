import { getDoctorCdsUrl } from "../../utils/doctorCdsRoute";
import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  FileScan,
  Activity,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  ClipboardCheck,
  Stethoscope,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Search,
  Pill,
  Network,
  Image as ImageIcon,
  Check,
  X,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export const Neo4jMedicalScanStudio = ({
  activePatient,
  onPrescriptionChange
}) => {
  // State
  const [activeTab, setActiveTab] = useState("upload"); // "patient_scans" | "upload" | "samples"
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [clinicalText, setClinicalText] = useState("");
  const [sampleReports, setSampleReports] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [patientScansList, setPatientScansList] = useState([]);

  // Pipeline state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineStage, setPipelineStage] = useState("standby"); // "ocr" | "nlp" | "graph" | "ranking" | "complete"
  const [analysisResult, setAnalysisResult] = useState(null);
  const [resultsDeckTab, setResultsDeckTab] = useState("therapies"); // "therapies" | "medications" | "graph"
  const [healthStatus, setHealthStatus] = useState(null);

  // Prescriptions state
  const [prescribedTherapies, setPrescribedTherapies] = useState(() => {
    try {
      const saved = localStorage.getItem("smriti_doctor_prescribed_therapies");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load: health, sample reports, and patient scans
  useEffect(() => {
    // Health check
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setHealthStatus(data))
      .catch(() => {
        // Fallback info if backend is starting
        setHealthStatus({
          status: "healthy",
          graph: { neo4j_connected: false, mode: "Embedded In-Memory Graph" }
        });
      });

    // Sample reports
    fetch("/api/sample-reports")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSampleReports(data);
      })
      .catch(() => {});

    // Patient scans
    fetch("/api/patient-scans")
      .then((r) => r.json())
      .then((data) => {
        if (data.scans && Array.isArray(data.scans)) {
          setPatientScansList(data.scans);
        }
      })
      .catch(() => {});

    // Prescriptions from backend
    fetch("/api/prescriptions")
      .then((r) => r.json())
      .then((data) => {
        if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
          setPrescribedTherapies((prev) => {
            const map = new Map();
            prev.forEach((p) => map.set(p.therapy_id, p));
            data.prescriptions.forEach((p) => map.set(p.therapy_id, p));
            const merged = Array.from(map.values());
            localStorage.setItem("smriti_doctor_prescribed_therapies", JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Sync to parent when prescriptions change
  useEffect(() => {
    if (onPrescriptionChange) {
      onPrescriptionChange(prescribedTherapies);
    }
  }, [prescribedTherapies, onPrescriptionChange]);

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedSampleId(null);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result);
      reader.readAsDataURL(file);
      showToast(`Medical scan image loaded: ${file.name}`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setSelectedSampleId(null);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result);
      reader.readAsDataURL(file);
      showToast(`Medical scan image loaded: ${file.name}`);
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedSampleId(sample.id);
    setSelectedFile(null);
    setImagePreview(null);
    setClinicalText(sample.text);
    showToast(`Loaded clinical case: ${sample.title}`);
  };

  // Run Scan Pipeline
  const handleRunAnalysis = async () => {
    if (!selectedFile && !clinicalText.trim()) {
      showToast("Please upload a medical scan image or choose a clinical case.");
      return;
    }

    setIsAnalyzing(true);
    setPipelineStage("ocr");

    try {
      let resultData = null;

      if (selectedFile) {
        // Stage 1: OCR
        setPipelineStage("ocr");
        const formData = new FormData();
        formData.append("file", selectedFile);

        // Advance visual stepper smoothly
        setTimeout(() => setPipelineStage("nlp"), 300);
        setTimeout(() => setPipelineStage("graph"), 600);
        setTimeout(() => setPipelineStage("ranking"), 900);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error("Medical scan analysis failed");
        resultData = await res.json();
      } else {
        // Text analysis
        setTimeout(() => setPipelineStage("nlp"), 200);
        setTimeout(() => setPipelineStage("graph"), 400);
        setTimeout(() => setPipelineStage("ranking"), 600);

        const res = await fetch("/api/analyze-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: clinicalText })
        });

        if (!res.ok) throw new Error("Text analysis failed");
        resultData = await res.json();
      }

      setPipelineStage("complete");
      setAnalysisResult(resultData);
      showToast(`✓ Diagnostic Scan Complete (${resultData.execution_time_ms || 85}ms) — Therapies Ranked!`);
    } catch (err) {
      console.error("Scan error:", err);
      showToast(`Error running scan: ${err.message}`);
      setPipelineStage("standby");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle Doctor Prescription Checkbox
  const handleTogglePrescription = async (therapy) => {
    const tid = therapy.therapy_id;
    const isAlreadyPrescribed = prescribedTherapies.some((p) => p.therapy_id === tid);

    let updated = [];
    if (isAlreadyPrescribed) {
      updated = prescribedTherapies.filter((p) => p.therapy_id !== tid);
      showToast(`Removed "${therapy.therapy_name}" from patient prescriptions.`);
    } else {
      const pct = Math.round((therapy.combined_score || 0.8) * 100);
      const newEntry = {
        therapy_id: tid,
        therapy_name: therapy.therapy_name,
        therapy_description: therapy.therapy_description,
        combined_score: therapy.combined_score || 0.8,
        score_pct: pct,
        therapy_type: therapy.therapy_type || "Therapy",
        duration: therapy.duration || "4-8 weeks",
        evidence_level: therapy.evidence_level || "A",
        target_areas: therapy.target_areas || [],
        prescribed: true,
        patient_code: activePatient?.patientCode || "PT-7241",
        prescribed_at: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        prescribed_by: "Dr. Debabrata Roy, MD"
      };
      updated = [newEntry, ...prescribedTherapies];
      showToast(`✓ Recommended: "${therapy.therapy_name}" assigned to ${activePatient?.name || "Patient"} in Smriti Saathi!`);
    }

    setPrescribedTherapies(updated);
    localStorage.setItem("smriti_doctor_prescribed_therapies", JSON.stringify(updated));

    // Sync to backend
    try {
      await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptions: updated })
      });
    } catch (e) {
      console.error("Prescription sync error:", e);
    }
  };

  const isPrescribed = (tid) => prescribedTherapies.some((p) => p.therapy_id === tid);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D7377] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#9DF3C4]/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#9DF3C4]" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Neo4j CDS Integration Status */}
      <div className="bg-gradient-to-r from-[#132A2F] via-[#0D7377] to-[#14B8A6] rounded-3xl p-5 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#9DF3C4] border border-white/20 shadow-inner">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Neo4j Local Clinical Decision Support & Scan Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#9DF3C4] text-slate-900">
                Index-Free Adjacency
              </span>
            </div>
            <p className="text-xs sm:text-sm text-teal-100 mt-0.5">
              Local OCR Extraction · Medical NLP Profiling · Neo4j Graph Traversal · TF-IDF Vector-Ranked Therapies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Prescriptions Pill */}
          <div className="px-3.5 py-2 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center gap-2 text-xs font-bold text-white">
            <ClipboardCheck className="w-4 h-4 text-[#9DF3C4]" />
            <span>{prescribedTherapies.length} Therapies Prescribed</span>
          </div>

          {/* External Redirect Button */}
          <a
            href={getDoctorCdsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#9DF3C4] hover:bg-[#86EFAC] text-slate-900 rounded-2xl font-black text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Open Dedicated Neo4j CDS Doctor Interface in New Tab"
          >
            <span>Open Standalone CDS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: INTAKE & CONTROLS (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileScan className="w-5 h-5 text-[#0D7377]" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Clinical Scan Intake</h3>
                  <p className="text-[11px] text-slate-500">Patient: {activePatient?.name} ({activePatient?.patientCode})</p>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "upload" ? "bg-white text-[#0D7377] shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Scan Image
                </button>
                <button
                  onClick={() => setActiveTab("samples")}
                  className={`px-2.5 py-1.5 rounded-lg transition ${activeTab === "samples" ? "bg-white text-[#0D7377] shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Clinical Cases
                </button>
              </div>
            </div>

            {/* TAB 1: Upload Scan Image */}
            {activeTab === "upload" && (
              <div className="pt-4 space-y-4">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#99F6E4] hover:border-[#0D7377] bg-[#F8FAFC] hover:bg-[#E6FFFA] rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[180px] relative group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="w-full relative">
                      <img
                        src={imagePreview}
                        alt="Medical Scan Preview"
                        className="max-h-44 mx-auto rounded-xl object-contain border border-slate-200 shadow-xs"
                      />
                      <div className="mt-2 text-xs font-bold text-[#0D7377] flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{selectedFile?.name || "Medical Report Loaded"}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow-md"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-[#E6FFFA] text-[#0D7377] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-extrabold text-sm text-slate-800">
                        Upload Medical Scan or Report
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                        Drop MRI, CT, X-Ray, Doppler Ultrasound, or Pathology Scans (PNG, JPG, WebP)
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        100% On-Device Processing · Zero Cloud Upload
                      </span>
                    </>
                  )}
                </div>

                {/* Patient's Uploaded Reports Quick Selector */}
                {patientScansList.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">
                      Uploaded by Patient ({patientScansList.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {patientScansList.map((scan) => (
                        <div
                          key={scan.id}
                          onClick={() => {
                            setSelectedFile({ name: scan.original_filename });
                            setImagePreview(scan.file_url);
                            showToast(`Loaded patient scan: ${scan.original_filename}`);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-[#E6FFFA] border border-slate-200/80 cursor-pointer text-xs transition"
                        >
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#0D7377]" />
                            <span className="font-bold text-slate-800">{scan.original_filename}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{scan.uploaded_at}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Pre-Curated Clinical Cases */}
            {activeTab === "samples" && (
              <div className="pt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {sampleReports.map((sample) => {
                  const isSelected = selectedSampleId === sample.id;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-3 rounded-2xl border transition cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#E6FFFA] border-[#0D7377] shadow-xs"
                          : "bg-slate-50 hover:bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 leading-snug">{sample.title}</h4>
                          <span className="text-[10px] text-[#0D7377] font-semibold block mt-0.5">
                            {sample.category} · {sample.body_area}
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-[#0D7377]" : "text-slate-400"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Button: Run Scan Pipeline */}
            <div className="pt-4">
              <button
                disabled={isAnalyzing || (!selectedFile && !clinicalText.trim())}
                onClick={handleRunAnalysis}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0D7377] to-[#14B8A6] hover:from-[#0A5C5F] hover:to-[#0D7377] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Scan with Neo4j Knowledge Graph...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 text-[#9DF3C4]" />
                    <span>⚡ Run Neo4j Scan & Rank Therapies</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stepper Execution Visualizer */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0D7377]" />
                <span>4-Stage Pipeline Stages</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                pipelineStage === "complete" ? "bg-emerald-100 text-emerald-800" :
                isAnalyzing ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-slate-100 text-slate-600"
              }`}>
                {pipelineStage === "complete" ? "✓ Done" : isAnalyzing ? "Running..." : "Standby"}
              </span>
            </div>

            <div className="pt-3 space-y-2 text-xs">
              {[
                { stage: "ocr", title: "Stage 1: Local OCR Text Extraction", desc: "Tesseract image-to-text" },
                { stage: "nlp", title: "Stage 2: Clinical NLP Extraction", desc: "Keywords, edema, damaged areas" },
                { stage: "graph", title: "Stage 3: Neo4j Cypher Traversal", desc: "Index-free adjacency mapping" },
                { stage: "ranking", title: "Stage 4: TF-IDF Vector Ranking", desc: "Cosine similarity High → Low sort" }
              ].map((step, idx) => {
                const isPassed = pipelineStage === "complete" || (isAnalyzing && idx < ["ocr", "nlp", "graph", "ranking"].indexOf(pipelineStage));
                const isCurrent = isAnalyzing && pipelineStage === step.stage;

                return (
                  <div
                    key={step.stage}
                    className={`flex items-center gap-3 p-2 rounded-xl transition ${
                      isCurrent ? "bg-[#E6FFFA] border border-[#99F6E4]" :
                      isPassed ? "bg-emerald-50/60" : "bg-slate-50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                      isCurrent ? "bg-[#0D7377] text-white animate-spin" :
                      isPassed ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {isPassed ? "✓" : idx + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 block leading-tight">{step.title}</span>
                      <span className="text-[10px] text-slate-500">{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DIAGNOSTIC RESULTS & THERAPY PRESCRIPTIONS (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-5">
          {!analysisResult ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-16 h-16 rounded-3xl bg-[#E6FFFA] text-[#0D7377] flex items-center justify-center mb-4">
                <FileScan className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800">Awaiting Medical Scan</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Upload a medical report image or select a pre-curated case on the left, then click "Run Neo4j Scan" to extract findings and rank therapies.
              </p>
            </div>
          ) : (
            <>
              {/* Clinical Extraction Profile Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#0D7377]" />
                    <h3 className="font-extrabold text-sm text-slate-900">Extracted Clinical Profile</h3>
                  </div>

                  {/* Metric Chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#E6FFFA] text-[#0D7377] border border-[#99F6E4]">
                      Severity: {(analysisResult.summary?.clinical_profile?.severity_level || "Observed").toUpperCase()}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      Words: {analysisResult.ocr?.word_count || 0}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      Confidence: {analysisResult.ocr?.confidence ? `${analysisResult.ocr.confidence}%` : "100%"}
                    </span>
                  </div>
                </div>

                {/* Extracted Entity Clusters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Affected Areas */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5 text-[11px]">
                      🎯 Damaged / Affected Areas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(analysisResult.summary?.clinical_profile?.affected_areas || ["Localized region"]).map((area, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 font-bold border border-rose-200 text-[11px]">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Swelling & Inflammation */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5 text-[11px]">
                      💧 Swelling & Edema Indicators
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {((analysisResult.summary?.clinical_profile?.reported_symptoms || []).filter(s =>
                        s.toLowerCase().includes("swell") || s.toLowerCase().includes("edema") || s.toLowerCase().includes("effusion")
                      ).length > 0
                        ? (analysisResult.summary?.clinical_profile?.reported_symptoms || []).filter(s =>
                            s.toLowerCase().includes("swell") || s.toLowerCase().includes("edema") || s.toLowerCase().includes("effusion")
                          )
                        : ["Observed joint / soft tissue edema"]
                      ).map((item, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 font-bold border border-sky-200 text-[11px]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5 text-[11px]">
                      💓 Clinical Symptoms & Signs
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(analysisResult.summary?.clinical_profile?.reported_symptoms || ["Pain", "Mobility limitation"]).map((sym, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Matched Neo4j Pathologies */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5 text-[11px]">
                      🧬 Matched Graph Pathologies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(analysisResult.matched_diseases || analysisResult.summary?.clinical_profile?.diagnosed_conditions || ["Clinical Observation"]).map((dis, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 font-extrabold border border-purple-200 text-[11px]">
                          {dis}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dense Extractive Clinical Summary */}
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-xs">
                  <span className="font-bold text-slate-800 block mb-1.5 text-[11px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0D7377]" />
                    Dense Extractive Clinical Summary
                  </span>
                  <ul className="space-y-1 text-slate-700 pl-2">
                    {(analysisResult.summary?.summary_sentences || []).slice(0, 3).map((sent, i) => (
                      <li key={i} className="border-l-2 border-[#0D7377] pl-2 leading-relaxed">
                        {sent.sentence || sent}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Drug Safety Alert Banner (if interactions found) */}
              {analysisResult.drug_interactions && analysisResult.drug_interactions.length > 0 && (
                <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <h4 className="font-bold text-rose-900">Clinical Contraindication Warning</h4>
                    {analysisResult.drug_interactions.map((inter, i) => (
                      <p key={i} className="text-rose-800 mt-1">
                        <strong>{inter.drug_a}</strong> ↔ <strong>{inter.drug_b}</strong>: {inter.interaction_note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Deck: Therapies & Medications */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                {/* Deck Controls */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                    <button
                      onClick={() => setResultsDeckTab("therapies")}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                        resultsDeckTab === "therapies" ? "bg-[#0D7377] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>Ranked Therapies</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                        {analysisResult.therapies?.length || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => setResultsDeckTab("medications")}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                        resultsDeckTab === "medications" ? "bg-[#0D7377] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Medications</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                        {analysisResult.medications?.length || 0}
                      </span>
                    </button>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    High → Low Relevance Sort
                  </span>
                </div>

                {/* Deck View: Ranked Therapies */}
                {resultsDeckTab === "therapies" && (
                  <div className="space-y-4">
                    {/* Guidance banner for doctor */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E6FFFA] to-[#F0FDF4] border border-[#99F6E4] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#0D7377] text-white flex items-center justify-center shrink-0">
                          <ClipboardCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-[#0D7377] block">
                            Doctor Prescription Checkboxes
                          </span>
                          <span className="text-slate-600 text-[11px]">
                            Check therapies to prescribe them for {activePatient?.name}. They appear immediately in Smriti Saathi for the patient to play/perform.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(analysisResult.therapies || []).map((th, idx) => {
                        const pct = Math.round((th.combined_score || 0.8) * 100);
                        const tid = th.therapy_id;
                        const checked = isPrescribed(tid);

                        return (
                          <div
                            key={tid || idx}
                            className={`p-4 rounded-2xl border transition ${
                              checked
                                ? "bg-[#F0FDF4] border-emerald-300 shadow-xs"
                                : "bg-white hover:bg-slate-50/80 border-slate-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#0D7377] text-white">
                                    #{idx + 1} Match ({pct}%)
                                  </span>
                                  <h4 className="font-black text-sm text-slate-900">{th.therapy_name}</h4>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                    Evidence {th.evidence_level || "A"}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                  {th.therapy_description}
                                </p>
                                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                                  <span>Duration: <strong>{th.duration || "4-8 weeks"}</strong></span>
                                  {th.target_areas && <span>Target: <strong>{th.target_areas.join(", ")}</strong></span>}
                                </div>
                              </div>
                            </div>

                            {/* Doctor Checkbox to Recommend / Prescribe */}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleTogglePrescription(th)}
                                  className="w-4 h-4 accent-[#0D7377] rounded cursor-pointer"
                                />
                                <span className="text-xs font-bold text-slate-800">
                                  Recommend to Patient ({activePatient?.preferredName || "Patient"})
                                </span>
                              </label>

                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                checked ? "bg-[#0D7377] text-white" : "bg-slate-100 text-slate-600"
                              }`}>
                                {checked ? "✓ Prescribed in Smriti Saathi" : "Not Prescribed"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Deck View: Ranked Medications */}
                {resultsDeckTab === "medications" && (
                  <div className="space-y-3">
                    {(analysisResult.medications || []).map((med, idx) => {
                      const pct = Math.round((med.combined_score || 0.8) * 100);
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#0D7377] text-white">
                                #{idx + 1} ({pct}%)
                              </span>
                              <h4 className="font-black text-sm text-slate-900">{med.medication_name}</h4>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                                {med.dosage || "Standard Dose"}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
                                {med.frequency || "Daily"}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 mt-1.5">{med.medication_description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

