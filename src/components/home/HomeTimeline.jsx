import React from "react";
import { Stethoscope, CheckCircle2, Pill, Activity } from "lucide-react";

export const HomeTimeline = ({ t }) => {
  return (
    <section className="section section--warm py-12 sm:py-16" id="howit">
      <div className="container">
        <div className="section-header text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="section-label">{t?.how?.label || "Integrated Clinical Workflow"}</span>
          <h2 className="section__title text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t?.how?.title || "From Medical Diagnosis to Daily Recovery in 3 Steps"}
          </h2>
        </div>
      </div>

      <div className="timeline-wrapper">
        {/* STEP 1: Medical Scan & Condition Assessment */}
        <div className="tl-row">
          <div className="tl-line-col">
            <div className="tl-line tl-line--top-half"></div>
            <div className="tl-dot tl-dot--active"></div>
            <div className="tl-line"></div>
          </div>
          <div className="tl-content tl-content--left">
            <div className="tl-text-block">
              <span className="text-xs font-black text-[#0D7377] uppercase tracking-wider block mb-1">Step 1 • Intake</span>
              <h3>{t?.how?.s1t || "Upload Scans & Clinical Assessment"}</h3>
              <p>{t?.how?.s1d || "Patients upload brain MRI, CT, or medical reports. The Neo4j CDS extracts clinical findings, detects lesions, and checks drug interactions."}</p>
            </div>
          </div>
          <div className="tl-content tl-content--right">
            <div className="tl-chat-card">
              <div className="helpee-chat-inner">
                <div className="hc-msg hc-msg--agent">
                  <img
                    src={`${import.meta.env.BASE_URL}images/nedtx_hero.svg`}
                    className="hc-avatar"
                    alt="Clinical AI Agent"
                  />
                  <div className="hc-bubble">
                    {t?.how?.c1a || "Hello! I am Smriti Saathi. Which neurological condition is your loved one recovering from?"}
                  </div>
                </div>
                <div className="hc-msg hc-msg--user">
                  <div className="hc-bubble hc-bubble--user" style={{ background: "#0D7377" }}>
                    {t?.how?.c1b || "Post-stroke right-side weakness and mild speech difficulty."}
                  </div>
                </div>
                <div className="hc-msg hc-msg--agent">
                  <img
                    src={`${import.meta.env.BASE_URL}images/nedtx_hero.svg`}
                    className="hc-avatar"
                    alt="Clinical AI Agent"
                  />
                  <div className="hc-bubble">
                    {t?.how?.c1c || "Understood! Loading doctor-prescribed bilateral motor therapy and speech recall protocols 🧠"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: Doctor Prescribes Therapies & Medication */}
        <div className="tl-row tl-row--reverse">
          <div className="tl-line-col">
            <div className="tl-line"></div>
            <div className="tl-dot"></div>
            <div className="tl-line"></div>
          </div>
          <div className="tl-content tl-content--left">
            <div className="tl-chat-card tl-chat-card--light">
              <div className="helpee-chat-inner">
                <div className="hc-msg hc-msg--agent">
                  <img
                    src={`${import.meta.env.BASE_URL}images/nedtx_hero.svg`}
                    className="hc-avatar"
                    alt="Clinical AI Agent"
                  />
                  <div className="hc-bubble">
                    {t?.how?.c2a || "Today's Clinical Activity: Bilateral touch test — cross right hand to nose, then switch hands."}
                  </div>
                </div>
                <div className="hc-msg hc-msg--user">
                  <div className="hc-bubble hc-bubble--user" style={{ background: "#0D7377" }}>
                    {t?.how?.c2b || "Completed all 4 switch rounds smoothly! ✅"}
                  </div>
                </div>
                <div className="hc-msg hc-msg--agent">
                  <img
                    src={`${import.meta.env.BASE_URL}images/nedtx_hero.svg`}
                    className="hc-avatar"
                    alt="Clinical AI Agent"
                  />
                  <div className="hc-bubble">
                    {t?.how?.c2c || "Outstanding! Motor accuracy: 96% 🎉 Morning medication reminder scheduled next."}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tl-content tl-content--right">
            <div className="tl-text-block">
              <span className="text-xs font-black text-[#0D7377] uppercase tracking-wider block mb-1">Step 2 • Clinical Prescription</span>
              <h3>{t?.how?.s2t || "Doctor Prescribes Therapies & Medication"}</h3>
              <p>{t?.how?.s2d || "Neurologists recommend condition-specific digital exercises (motor agility, memory, speech) and synchronized medication schedules."}</p>
            </div>
          </div>
        </div>

        {/* STEP 3: Progress & Recovery Monitoring */}
        <div className="tl-row">
          <div className="tl-line-col">
            <div className="tl-line"></div>
            <div className="tl-dot"></div>
            <div className="tl-line tl-line--bottom-half"></div>
          </div>
          <div className="tl-content tl-content--left">
            <div className="tl-text-block">
              <span className="text-xs font-black text-[#0D7377] uppercase tracking-wider block mb-1">Step 3 • Daily Recovery</span>
              <h3>{t?.how?.s3t || "Daily Guided Therapy & Progress Tracking"}</h3>
              <p>{t?.how?.s3d || "Patients perform prescribed therapies at home while caregivers and doctors monitor neuroplastic recovery and adherence."}</p>
            </div>
          </div>
          <div className="tl-content tl-content--right">
            <div className="tl-app-card border border-teal-100 shadow-xl">
              <div className="app-card-header">
                <strong>{t?.how?.dash || "Clinical & Caregiver Recovery Dashboard"}</strong>
              </div>
              <div className="dash-preview">
                <div className="dash-stat">
                  <span className="dash-stat-val text-[#0D7377]">88%</span>
                  <span className="dash-stat-label">{t?.how?.d1 || "Motor Recovery"}</span>
                </div>
                <div className="dash-stat">
                  <span className="dash-stat-val text-emerald-600">↑14%</span>
                  <span className="dash-stat-label">{t?.how?.d2 || "Weekly Progress"}</span>
                </div>
                <div className="dash-stat">
                  <span className="dash-stat-val text-blue-600">100%</span>
                  <span className="dash-stat-label">Pills Taken</span>
                </div>
              </div>
              <div className="dash-alert bg-teal-50 text-[#0D7377] border border-teal-200">
                <Activity className="w-4 h-4 text-[#0D7377] shrink-0" />
                <span className="text-xs font-semibold">{t?.how?.alert || "Clinical Note: Motor symmetry improved +14% this week. Medication adherence 100%."}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
