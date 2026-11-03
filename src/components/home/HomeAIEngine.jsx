import React from "react";
import { Brain, Activity, Clock, ShieldCheck, Pill, Stethoscope } from "lucide-react";

export const HomeAIEngine = ({ t }) => {
  return (
    <section className="section section--warm py-12 sm:py-16" id="ai-engine">
      <div className="container ai-grid">
        <div className="ai-left">
          <span className="section-label">{t?.ai?.label || "Adaptive Neuro-Rehab & Medication Intelligence"}</span>
          <h2 className="section__title section__title--left">
            {t?.ai?.title || "AI-Powered Adaptive Neuroplasticity & Clinical CDS"}
          </h2>
          <p className="ai-desc">
            {t?.ai?.desc || "Our clinical AI evaluates motor accuracy, tremor response, decision latency, and medication compliance in real time — automatically adjusting exercise intensity and alerting physicians to neurological shifts."}
          </p>

          <div className="ai-metrics">
            <div className="ai-metric">
              <div className="ai-metric-icon ai-metric-icon--blue">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <strong>{t?.ai?.m1t || "Motor Accuracy & Tremor Tracking"}</strong>
                <p>{t?.ai?.m1d || "Real-time fine-motor precision and bilateral movement symmetry"}</p>
              </div>
            </div>

            <div className="ai-metric">
              <div className="ai-metric-icon ai-metric-icon--amber">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <strong>{t?.ai?.m2t || "Cognitive Latency & Processing Speed"}</strong>
                <p>{t?.ai?.m2d || "Time taken to formulate and execute cognitive and motor decisions"}</p>
              </div>
            </div>

            <div className="ai-metric">
              <div className="ai-metric-icon ai-metric-icon--rose">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <strong>{t?.ai?.m3t || "Longitudinal Recovery Trajectory"}</strong>
                <p>{t?.ai?.m3d || "Session-over-session neuroplastic progress and regression detection"}</p>
              </div>
            </div>

            <div className="ai-metric">
              <div className="ai-metric-icon ai-metric-icon--green">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div>
                <strong>{t?.ai?.m4t || "Medication Adherence & Drug Safety"}</strong>
                <p>{t?.ai?.m4d || "Tracking on-time dosage compliance and Neo4j drug interaction screening"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Visual Card showing adaptive difficulty */}
        <div className="ai-right">
          <div className="ai-visual-card shadow-xl border border-teal-100">
            <div className="avc-header">
              <strong>{t?.ai?.vc?.title || "Live Neurological Recovery Profile"}</strong>
              <span className="avc-live text-[#0D7377] font-extrabold">{t?.ai?.vc?.live || "● Clinical AI Active"}</span>
            </div>
            <div className="avc-bars">
              <div className="avc-bar-row">
                <span>{t?.ai?.vc?.memory || "Memory"}</span>
                <div className="avc-bar"><div className="avc-fill" style={{ width: "78%", background: "#0D7377" }}></div></div>
                <span>78%</span>
              </div>
              <div className="avc-bar-row">
                <span>{t?.ai?.vc?.attention || "Stroke Rehab"}</span>
                <div className="avc-bar"><div className="avc-fill" style={{ width: "68%", background: "#0284C7" }}></div></div>
                <span>68%</span>
              </div>
              <div className="avc-bar-row">
                <span>{t?.ai?.vc?.routine || "Medication"}</span>
                <div className="avc-bar"><div className="avc-fill" style={{ width: "95%", background: "#059669" }}></div></div>
                <span>95%</span>
              </div>
              <div className="avc-bar-row">
                <span>{t?.ai?.vc?.pattern || "Parkinson's"}</span>
                <div className="avc-bar"><div className="avc-fill" style={{ width: "62%", background: "#7C3AED" }}></div></div>
                <span>62%</span>
              </div>
              <div className="avc-bar-row">
                <span>{t?.ai?.vc?.object || "Speech"}</span>
                <div className="avc-bar"><div className="avc-fill" style={{ width: "74%", background: "#E11D48" }}></div></div>
                <span>74%</span>
              </div>
              <div className="avc-bar-row">
                <span>{t?.ai?.vc?.emotion || "Vitality"}</span>
                <div className="avc-bar"><div className="avc-fill" style={{ width: "88%", background: "#DB2777" }}></div></div>
                <span>88%</span>
              </div>
            </div>
            <div className="avc-insight bg-teal-50 border border-teal-200 text-[#0D7377]">
              <Stethoscope className="w-4 h-4 shrink-0 text-[#0D7377]" />
              <span className="text-xs font-semibold">{t?.ai?.vc?.insight || "Clinical Recommendation: Maintain morning Levodopa timing; continue bilateral cross-body motor therapy"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
