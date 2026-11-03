import React, { useState, useEffect } from "react";
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
  AlertTriangle
} from "lucide-react";
import { TherapyMiniGameModal } from "./TherapyMiniGameModal";

export const DoctorPrescribedTherapiesSection = ({
  profile,
  onLaunchActivity
}) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState("therapies"); // "therapies" | "medications"
  const [activeTherapyForModal, setActiveTherapyForModal] = useState(null);
  const [completedTids, setCompletedTids] = useState(new Set());
  const [takenMeds, setTakenMeds] = useState(new Set());

  // Load prescribed items
  const loadPrescriptions = () => {
    try {
      const saved = localStorage.getItem("smriti_doctor_prescribed_therapies") || localStorage.getItem("smriti_prescriptions_cart");
      if (saved) {
        const items = JSON.parse(saved);
        setPrescriptions(items);

        // Restore completed / taken states
        const takenSet = new Set();
        items.forEach(item => {
          if (item.taken_today) {
            takenSet.add(item.id || item.medication_id || item.medication_name);
          }
        });
        setTakenMeds(takenSet);
      }
    } catch (e) {
      console.error("Failed to load prescribed care plan:", e);
    }
  };

  useEffect(() => {
    loadPrescriptions();

    // Listen to storage event (so doctor checking on doctor CDS updates patient view immediately)
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

  // Separate therapies and medications
  const therapiesList = prescriptions.filter(
    (item) => item.item_type !== "medication" && (item.item_type === "therapy" || item.item_type === "activity" || item.therapy_name || !item.medication_name)
  );

  const medicationsList = prescriptions.filter(
    (item) => item.item_type === "medication" || Boolean(item.medication_name)
  );

  const handlePlayTherapy = (therapy) => {
    const nameLower = (therapy.therapy_name || therapy.name || "").toLowerCase();
    if (
      onLaunchActivity &&
      (nameLower.includes("memory") ||
        nameLower.includes("routine") ||
        nameLower.includes("pattern") ||
        nameLower.includes("object") ||
        nameLower.includes("walk") ||
        nameLower.includes("stretch"))
    ) {
      onLaunchActivity(therapy.therapy_name || therapy.name);
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

  if (!prescriptions || prescriptions.length === 0) {
    return null; // No doctor prescriptions yet
  }

  const doctorName = prescriptions[0]?.prescribed_by || "Dr. Debabrata Roy, MD";

  return (
    <div className="bg-gradient-to-r from-[#E6FFFA]/90 via-[#F0FDF4]/90 to-[#EFF6FF]/90 rounded-3xl p-5 sm:p-6 border-2 border-[#99F6E4] shadow-sm space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0D7377] text-white flex items-center justify-center shadow-md shrink-0">
            <Stethoscope className="w-6 h-6 text-[#9DF3C4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                Doctor Prescribed Care Plan & Treatments
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0D7377] text-white shadow-2xs">
                Neo4j CDS Sync
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Prescribed specifically for your brain health & motor rehabilitation by <strong>{doctorName}</strong>.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/80 rounded-2xl border border-[#99F6E4] shadow-2xs">
          <button
            onClick={() => setActiveTab("therapies")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeTab === "therapies"
                ? "bg-[#0D7377] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0D7377] hover:bg-slate-50"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Therapies & Exercises ({therapiesList.length})</span>
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
            <span>Medications & Dosing ({medicationsList.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: THERAPIES & ACTIVITIES ================= */}
      {activeTab === "therapies" && (
        <div className="space-y-3">
          {therapiesList.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
              No therapies or physical activities prescribed yet. Check with your doctor in the Neo4j CDS portal.
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

                      {/* Doctor's Custom Clinical Instructions / Description */}
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

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {isDone ? "✓ Completed Today" : th.duration || "4-8 weeks"}
                      </span>

                      <button
                        onClick={() => handlePlayTherapy(th)}
                        className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-[#0D7377] hover:bg-[#0A5C5F] text-white"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isDone ? "Play Again" : "Play / View Therapy"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MEDICATIONS & DOSING ================= */}
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

                      {/* Doctor's Custom Clinical Instructions */}
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

                    {/* Action Bar */}
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
                        className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
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
