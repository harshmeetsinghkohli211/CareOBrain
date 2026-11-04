import React, { useState, useEffect, useMemo } from "react";
import {
  Brain,
  Stethoscope,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Activity,
  Award,
  ChevronRight,
  ExternalLink,
  Pill,
  Check,
  FileText,
  Volume2,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  Zap,
  Heart,
  Smile,
  ShieldCheck
} from "lucide-react";
import { TherapyMiniGameModal } from "./TherapyMiniGameModal";
import { all48Therapies } from "../../data/allTherapiesData";

const defaultStarterPrescriptions = [
  {
    id: "th_physio",
    therapy_id: "th_physio",
    therapy_name: "Physical Therapy & Joint Mobilization",
    name: "Physical Therapy & Joint Mobilization",
    therapy_description: "Structured kinetic exercises, manual joint mobilization, and postural realignment to restore functional motor movement and relieve pain.",
    item_type: "therapy",
    score_pct: 98,
    combined_score: 0.98,
    evidence_level: "A",
    duration: "15 min daily",
    target_areas: ["Shoulders", "Elbows", "Wrists", "Hips", "Knees", "Ankles"],
    doctor_note: "Focus on gentle 4-step joint mobility sequences. Practice morning and afternoon.",
    prescribed_by: "Dr. Debabrata Roy, MD"
  },
  {
    id: "th_rom",
    therapy_id: "th_rom",
    therapy_name: "Range of Motion (ROM) Exercises",
    name: "Range of Motion (ROM) Exercises",
    therapy_description: "Active-assisted and active physiological range exercises designed to maintain synovial fluid circulation and prevent muscle contractures.",
    item_type: "therapy",
    score_pct: 96,
    combined_score: 0.96,
    evidence_level: "A",
    duration: "12 min daily",
    target_areas: ["Neck", "Shoulders", "Knees", "Ankles"],
    doctor_note: "Gently extend joints to full comfortable limit without jerking.",
    prescribed_by: "Dr. Debabrata Roy, MD"
  },
  {
    id: "cog_memory_match",
    therapy_id: "cog_memory_match",
    therapy_name: "Memory Match & Synaptic Visual Recall",
    name: "Memory Match & Synaptic Visual Recall",
    therapy_description: "Interactive card matching targeting hippocampal short-term storage, visuospatial associations, and synaptic preservation for Alzheimer's and MCI.",
    item_type: "therapy",
    score_pct: 99,
    combined_score: 0.99,
    evidence_level: "A",
    duration: "15 min daily",
    target_areas: ["Hippocampus", "Visual Cortex"],
    doctor_note: "Play 2 sessions daily to maintain visual memory retention.",
    prescribed_by: "Dr. Debabrata Roy, MD"
  },
  {
    id: "th_tens",
    therapy_id: "th_tens",
    therapy_name: "TENS Electro-Neuromodulation",
    name: "TENS Electro-Neuromodulation",
    therapy_description: "Transcutaneous Electrical Nerve Stimulation delivering pulsed micro-currents to stimulate endogenous beta-endorphins and block nociceptive pain.",
    item_type: "therapy",
    score_pct: 94,
    combined_score: 0.94,
    evidence_level: "A",
    duration: "20 min as needed",
    target_areas: ["Cervical & Lumbar Pathways"],
    doctor_note: "Use low frequency setting (2-10 Hz) for chronic stiffness relief.",
    prescribed_by: "Dr. Debabrata Roy, MD"
  },
  {
    id: "med_donepezil",
    medication_id: "med_donepezil",
    medication_name: "Donepezil (Aricept) 10mg",
    name: "Donepezil (Aricept) 10mg",
    item_type: "medication",
    dosage: "10mg tablet",
    frequency: "Once daily at bedtime",
    instructions: "Take with half glass of water before sleeping.",
    prescribed_by: "Dr. Debabrata Roy, MD",
    taken_today: false
  },
  {
    id: "med_memantine",
    medication_id: "med_memantine",
    medication_name: "Memantine (Namenda) 10mg",
    name: "Memantine (Namenda) 10mg",
    item_type: "medication",
    dosage: "10mg tablet",
    frequency: "Morning with breakfast",
    instructions: "NMDA receptor antagonist. Protects neurons against glutamate excitotoxicity.",
    prescribed_by: "Dr. Debabrata Roy, MD",
    taken_today: true
  }
];

export const DoctorPrescribedTherapiesSection = ({
  profile,
  onLaunchActivity
}) => {
  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem("smriti_doctor_prescribed_therapies") || localStorage.getItem("smriti_prescriptions_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultStarterPrescriptions;
  });

  const [activeTab, setActiveTab] = useState("all_48"); // "all_48" | "therapies" | "medications"
  const [therapyCategoryFilter, setTherapyCategoryFilter] = useState("all"); // "all" | "physical" | "cognitive" | "clinical" | "sensory"
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTherapyForModal, setActiveTherapyForModal] = useState(null);
  const [completedTids, setCompletedTids] = useState(new Set());
  const [takenMeds, setTakenMeds] = useState(new Set());

  // Load prescribed items
  const loadPrescriptions = () => {
    try {
      const saved = localStorage.getItem("smriti_doctor_prescribed_therapies") || localStorage.getItem("smriti_prescriptions_cart");
      if (saved) {
        const items = JSON.parse(saved);
        if (Array.isArray(items) && items.length > 0) {
          setPrescriptions(items);

          // Restore completed / taken states
          const takenSet = new Set();
          items.forEach((item) => {
            if (item.taken_today) {
              takenSet.add(item.id || item.medication_id || item.medication_name);
            }
          });
          setTakenMeds(takenSet);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load prescribed care plan:", e);
    }
  };

  useEffect(() => {
    loadPrescriptions();

    const handleStorageChange = (e) => {
      if (e.key === "smriti_doctor_prescribed_therapies" || e.key === "smriti_prescriptions_cart") {
        loadPrescriptions();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Also fetch from API
    fetch("/api/prescriptions")
      .then((r) => r.json())
      .then((data) => {
        if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
          setPrescriptions(data.prescriptions);
          localStorage.setItem("smriti_doctor_prescribed_therapies", JSON.stringify(data.prescriptions));
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Separate therapies and medications from prescription cart
  const therapiesList = prescriptions.filter(
    (item) => item.item_type !== "medication" && (item.item_type === "therapy" || item.item_type === "activity" || item.therapy_name || !item.medication_name)
  );

  const medicationsList = prescriptions.filter(
    (item) => item.item_type === "medication" || Boolean(item.medication_name)
  );

  // Filter the all 48 therapies catalog
  const filtered48Therapies = useMemo(() => {
    return all48Therapies.filter((th) => {
      const matchesCategory =
        therapyCategoryFilter === "all" || th.category === therapyCategoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        th.name.toLowerCase().includes(q) ||
        th.description.toLowerCase().includes(q) ||
        (th.target_areas && th.target_areas.some((area) => area.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [therapyCategoryFilter, searchQuery]);

  const handlePlayTherapy = (therapy) => {
    const nameLower = (therapy.therapy_name || therapy.name || "").toLowerCase();
    const gameTitle = therapy.gameTitle || therapy.therapy_name || therapy.name;
    
    // If it has a matching app engine game and parent handler is provided, offer immediate start
    if (
      onLaunchActivity &&
      (nameLower.includes("memory") ||
        nameLower.includes("routine") ||
        nameLower.includes("pattern") ||
        nameLower.includes("object") ||
        nameLower.includes("number") ||
        nameLower.includes("sound") ||
        nameLower.includes("simon") ||
        nameLower.includes("cross-body") ||
        nameLower.includes("touch the body"))
    ) {
      onLaunchActivity(gameTitle);
    } else {
      setActiveTherapyForModal(therapy);
    }
  };

  const handleCompleteGame = (th) => {
    const tid = th.id || th.therapy_id;
    setCompletedTids((prev) => new Set([...prev, tid]));
  };

  const handleToggleMedicationTaken = (med) => {
    const mid = med.id || med.medication_id || med.medication_name;
    const isCurrentlyTaken = takenMeds.has(mid);
    const updatedTaken = new Set(takenMeds);

    if (isCurrentlyTaken) {
      updatedTaken.delete(mid);
    } else {
      updatedTaken.add(mid);
    }
    setTakenMeds(updatedTaken);

    // Update in prescriptions array and save
    const updatedPrescriptions = prescriptions.map((p) => {
      const pId = p.id || p.medication_id || p.medication_name;
      if (pId === mid) {
        return {
          ...p,
          taken_today: !isCurrentlyTaken,
          last_taken_at: !isCurrentlyTaken ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null
        };
      }
      return p;
    });

    setPrescriptions(updatedPrescriptions);
    localStorage.setItem("smriti_doctor_prescribed_therapies", JSON.stringify(updatedPrescriptions));
    localStorage.setItem("smriti_prescriptions_cart", JSON.stringify(updatedPrescriptions));
    window.dispatchEvent(new Event("storage"));

    // Sync to backend
    fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prescriptions: updatedPrescriptions })
    }).catch(() => {});
  };

  const doctorName = prescriptions[0]?.prescribed_by || "Dr. Debabrata Roy, MD";

  return (
    <div className="bg-gradient-to-r from-[#E6FFFA]/90 via-[#F0FDF4]/90 to-[#EFF6FF]/90 rounded-3xl p-4 sm:p-6 border-2 border-[#99F6E4] shadow-sm space-y-5">
      
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0D7377] text-white flex items-center justify-center shadow-md shrink-0">
            <Stethoscope className="w-6 h-6 text-[#9DF3C4]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                Clinical Therapies & Care Plan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0D7377] text-white shadow-2xs">
                Neo4j CDS Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-[#0D7377] border border-teal-200">
                48 Therapies Available
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Targeted neuroplasticity, physical rehabilitation & precision treatments prescribed by <strong>{doctorName}</strong>.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/90 rounded-2xl border border-[#99F6E4] shadow-2xs flex-wrap">
          <button
            onClick={() => setActiveTab("all_48")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              activeTab === "all_48"
                ? "bg-[#0D7377] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0D7377] hover:bg-slate-50"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#9DF3C4]" />
            <span>All 48 Therapies Library</span>
          </button>

          <button
            onClick={() => setActiveTab("therapies")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeTab === "therapies"
                ? "bg-[#0D7377] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0D7377] hover:bg-slate-50"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Doctor Prescriptions ({therapiesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("medications")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeTab === "medications"
                ? "bg-[#0D7377] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0D7377] hover:bg-slate-50"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medications ({medicationsList.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ALL 48 THERAPIES (NEO4J CDS COMPLETE LIBRARY) ================= */}
      {activeTab === "all_48" && (
        <div className="space-y-4">
          
          {/* Top Control Bar: Search & Category Filter Pills */}
          <div className="bg-white/95 rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any of 48 therapies (e.g. Memory, Hydro, ROM, TENS)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: "all", label: "All 48", count: 48 },
                { id: "physical", label: "Physical & Motor", count: 18 },
                { id: "cognitive", label: "Cognitive & Memory", count: 14 },
                { id: "clinical", label: "Clinical & Electro", count: 10 },
                { id: "sensory", label: "Sensory & Wellness", count: 6 }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setTherapyCategoryFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    therapyCategoryFilter === pill.id
                      ? "bg-[#0D7377] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    therapyCategoryFilter === pill.id ? "bg-white/20 text-white" : "bg-white text-slate-500"
                  }`}>
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filtered48Therapies.length}</strong> of <strong>48</strong> therapies
              {therapyCategoryFilter !== "all" && ` in ${therapyCategoryFilter}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            <span className="font-semibold text-teal-800">
              ✓ All therapies verified & playable
            </span>
          </div>

          {/* Grid of All 48 Therapies */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered48Therapies.map((th) => {
              const tid = th.id;
              const isDone = completedTids.has(tid);
              const title = th.name;
              const desc = th.description;
              const pct = th.score_pct || 95;

              const categoryBadgeColors = {
                physical: "bg-teal-50 text-[#0D7377] border-teal-200",
                cognitive: "bg-blue-50 text-blue-700 border-blue-200",
                clinical: "bg-purple-50 text-purple-700 border-purple-200",
                sensory: "bg-pink-50 text-pink-700 border-pink-200"
              };

              return (
                <div
                  key={tid}
                  className={`rounded-2xl p-4.5 transition border flex flex-col justify-between ${
                    isDone
                      ? "bg-emerald-50/95 border-emerald-300 shadow-xs"
                      : "bg-white hover:bg-slate-50/90 border-slate-200 shadow-2xs hover:shadow-xs hover:border-teal-300"
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        categoryBadgeColors[th.category] || "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {th.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#0D7377] text-white shadow-2xs">
                          {pct}% Clinical Match
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Ev. {th.evidence_level}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                      {title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {desc}
                    </p>

                    {/* Target Areas */}
                    {th.target_areas && th.target_areas.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-400 font-bold">Target:</span>
                        {th.target_areas.map((area, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isDone ? "✓ Completed Today" : th.duration || "Daily ongoing"}
                    </span>

                    <button
                      onClick={() => handlePlayTherapy(th)}
                      className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                        isDone
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-[#0D7377] hover:bg-[#0A5C5F] text-white"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isDone ? "Play Again" : "Play / Start Therapy"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: DOCTOR PRESCRIBED THERAPIES ================= */}
      {activeTab === "therapies" && (
        <div className="space-y-3">
          {therapiesList.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
              No specific therapies prescribed in the cart. Switch to the <strong>All 48 Therapies Library</strong> tab above to launch any clinical therapy.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {therapiesList.map((th, idx) => {
                const tid = th.id || th.therapy_id || `th_${idx}`;
                const isDone = completedTids.has(tid);
                const pct = th.score_pct || Math.round((th.combined_score || 0.8) * 100);
                const title = th.name || th.therapy_name || "Prescribed Therapy";
                const desc = th.description || th.therapy_description || "Targeted exercise protocol.";

                return (
                  <div
                    key={tid}
                    className={`rounded-2xl p-4.5 transition border flex flex-col justify-between ${
                      isDone
                        ? "bg-emerald-50/95 border-emerald-300 shadow-xs"
                        : "bg-white hover:bg-slate-50/90 border-slate-200 shadow-2xs"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#0D7377] text-white shadow-2xs">
                          {pct}% Clinical Match
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Evidence {th.evidence_level || "A"}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                        {title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>

                      {th.doctor_note && (
                        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-xs text-teal-900 leading-relaxed">
                          <span className="font-extrabold block text-[11px] text-[#0D7377] mb-0.5">
                            👨‍⚕️ Doctor's Specific Instructions:
                          </span>
                          {th.doctor_note}
                        </div>
                      )}

                      {th.target_areas && th.target_areas.length > 0 && (
                        <div className="text-[11px] text-slate-500">
                          Target Area: <strong className="text-slate-700">{th.target_areas.join(", ")}</strong>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {isDone ? "✓ Completed Today" : th.duration || "4-8 weeks"}
                      </span>

                      <button
                        onClick={() => handlePlayTherapy(th)}
                        className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-[#0D7377] hover:bg-[#0A5C5F] text-white"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isDone ? "Play Again" : "Play / Start Therapy"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: MEDICATIONS & DOSING ================= */}
      {activeTab === "medications" && (
        <div className="space-y-3">
          {medicationsList.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
              No medications currently prescribed in your care plan. Consult your doctor via the Doctor CDS portal.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {medicationsList.map((med, idx) => {
                const mid = med.id || med.medication_id || med.medication_name || `med_${idx}`;
                const isTaken = takenMeds.has(mid);
                const title = med.name || med.medication_name || "Prescribed Medication";
                const dosage = med.dosage || "Standard Dosage";
                const frequency = med.frequency || "Once daily";
                const form = med.form || "oral tablet";
                const desc = med.description || med.medication_description || "Targeted neurological treatment.";

                return (
                  <div
                    key={mid}
                    className={`rounded-2xl p-4.5 transition border flex flex-col justify-between ${
                      isTaken
                        ? "bg-emerald-50/95 border-emerald-300 shadow-xs"
                        : "bg-white hover:bg-slate-50/90 border-slate-200 shadow-2xs"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          <span>Prescription</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {form}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                        {title}
                      </h4>

                      {/* Dosage & Frequency highlight box */}
                      <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                            Recommended Dose
                          </span>
                          <strong className="text-amber-950 font-black">{dosage}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                            Frequency
                          </span>
                          <span className="text-amber-900 font-bold">{frequency}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>

                      {med.doctor_note && (
                        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-xs text-teal-900 leading-relaxed">
                          <span className="font-extrabold block text-[11px] text-[#0D7377] mb-0.5">
                            👨‍⚕️ Doctor's Dosing Directions:
                          </span>
                          {med.doctor_note}
                        </div>
                      )}

                      {med.contraindications && (
                        <div className="text-[10px] text-slate-500">
                          Precautions: <strong className="text-slate-600">{med.contraindications}</strong>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                        {isTaken ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Taken Today
                          </span>
                        ) : (
                          <span>Due for today</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleMedicationTaken(med)}
                        className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                          isTaken
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-600 hover:bg-rose-700 text-white"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isTaken ? "Taken ✓" : "Mark Taken"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Interactive Therapy Game / Protocol Modal */}
      {activeTherapyForModal && (
        <TherapyMiniGameModal
          therapy={activeTherapyForModal}
          isOpen={Boolean(activeTherapyForModal)}
          onClose={() => setActiveTherapyForModal(null)}
          onComplete={handleCompleteGame}
        />
      )}
    </div>
  );
};
