import React from "react";
import { Activity, TrendingUp, AlertTriangle, Pill, Clock, Stethoscope, CheckCircle2 } from "lucide-react";

export const HomeCaregiverMockup = ({ t }) => {
  return (
    <section className="section section--warm py-12 sm:py-16" id="caregiver">
      <div className="container cg-grid">
        <div className="cg-left">
          <span className="section-label">{t?.cg?.label || "Caregiver & Doctor Dashboard"}</span>
          <h2 className="section__title section__title--left">{t?.cg?.title || "Longitudinal Neuro-Recovery Insights"}</h2>
          <p className="cg-desc">
            {t?.cg?.desc || "A dedicated dashboard tracking category-wise cognitive performance, motor coordination graphs, medication adherence, and doctor-prescribed therapy completions."}
          </p>
          <ul className="cg-list">
            <li>
              <span className="cg-list-icon">
                <Activity className="w-4 h-4 text-[#0D7377]" />
              </span>
              <span>{t?.cg?.l1 || "Category-Wise Neurological Breakdown"}</span>
            </li>
            <li>
              <span className="cg-list-icon">
                <TrendingUp className="w-4 h-4 text-[#0D7377]" />
              </span>
              <span>{t?.cg?.l2 || "Longitudinal Motor & Cognitive Trajectory"}</span>
            </li>
            <li>
              <span className="cg-list-icon">
                <AlertTriangle className="w-4 h-4 text-[#0D7377]" />
              </span>
              <span>{t?.cg?.l3 || "Early Identification of Motor Rigidity / Tremors"}</span>
            </li>
            <li>
              <span className="cg-list-icon">
                <CheckCircle2 className="w-4 h-4 text-[#0D7377]" />
              </span>
              <span>{t?.cg?.l4 || "Prescription Adherence & Shift Alerts"}</span>
            </li>
            <li>
              <span className="cg-list-icon">
                <Pill className="w-4 h-4 text-[#0D7377]" />
              </span>
              <span>{t?.cg?.l5 || "Medication Schedules & Doctor Follow-ups"}</span>
            </li>
          </ul>
          <div className="cg-note bg-teal-50 border border-teal-200 text-[#0D7377]">
            <Stethoscope className="w-4 h-4 text-[#0D7377] shrink-0" />
            <em>{t?.cg?.note || "Clinical Note: Longitudinal tracking supports neurology follow-ups, medication tuning, and therapy optimization."}</em>
          </div>
        </div>

        <div className="cg-right">
          <div className="cg-mockup border border-teal-100 shadow-xl">
            <div className="cgm-header flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-extrabold text-slate-800 text-sm">{t?.cg?.mh || "Patient Recovery — Weekly Clinical Summary"}</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Synchronized
              </span>
            </div>
            <div className="cgm-grid grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
              <div className="cgm-stat cgm-stat--up p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Motor Rehab</span>
                <strong className="text-lg font-black text-[#0D7377]">88%</strong>
                <small className="text-emerald-600 font-bold block text-xs">↑14%</small>
              </div>
              <div className="cgm-stat p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Memory Score</span>
                <strong className="text-lg font-black text-slate-900">76%</strong>
                <small className="text-emerald-600 font-bold block text-xs">↑5%</small>
              </div>
              <div className="cgm-stat cgm-stat--up p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Med Adherence</span>
                <strong className="text-lg font-black text-emerald-600">100%</strong>
                <small className="text-emerald-600 font-bold block text-xs">On Time</small>
              </div>
              <div className="cgm-stat p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Response Time</span>
                <strong className="text-lg font-black text-slate-900">1.2s</strong>
                <small className="text-emerald-600 font-bold block text-xs">0.3s faster</small>
              </div>
            </div>
            <div className="cgm-chart-area pt-2">
              <span className="cgm-chart-title text-xs font-bold text-slate-500 block mb-2">{t?.cg?.chartLabel || "30-Day Neuroplastic Recovery Trend"}</span>
              <svg viewBox="0 0 300 80" className="cgm-chart-svg w-full h-20">
                <defs>
                  <linearGradient id="cgmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0D7377" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0D7377" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,60 Q50,45 100,50 T200,30 T300,18 L300,80 L0,80 Z" fill="url(#cgmGrad)" />
                <path d="M0,60 Q50,45 100,50 T200,30 T300,18" fill="none" stroke="#0D7377" strokeWidth="2.5" />
                <circle cx="100" cy="50" r="4" fill="#0D7377" />
                <circle cx="200" cy="30" r="4" fill="#0D7377" />
                <circle cx="300" cy="18" r="4" fill="#10B981" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
