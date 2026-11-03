import React from "react";
import { Play, Stethoscope, ArrowRight, Brain } from "lucide-react";

export const HomeStatsCTA = ({ t, onSelectRole }) => {
  return (
    <>
      {/* ═══════════════ STATS ═══════════════ */}
      <section className="section py-12 sm:py-16" id="stats">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="section__title text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              {t?.stats?.title || "Empowering Neurological Recovery Across the Nation"}
            </h2>
          </div>
          <div className="stats-grid">
            <div className="scard">
              <div className="scard-num text-[#0D7377]">95<span>%</span></div>
              <p>{t?.stats?.s1 || "Average improvement in motor & cognitive recovery metrics"}</p>
              <svg className="trend-svg" viewBox="0 0 120 40" fill="none">
                <path d="M5 35C20 30 40 25 55 18C70 10 90 8 115 4" stroke="#0D7377" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="115" cy="4" r="3.5" fill="#0D7377" />
              </svg>
            </div>
            <div className="scard">
              <div className="scard-num text-[#001A4C]">2,000<span>+</span></div>
              <p>{t?.stats?.s2 || "Active patients rehabilitating daily with prescribed protocols"}</p>
            </div>
            <div className="scard">
              <div className="scard-num text-emerald-600">8<span>+</span></div>
              <p>{t?.stats?.s3 || "Treatable brain conditions with validated therapy modules"}</p>
            </div>
            <div className="scard">
              <div className="scard-num text-purple-600">7<span>+</span></div>
              <p>{t?.stats?.s4 || "North-Eastern states with full offline & regional language access"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="section cta-section py-14 sm:py-20 bg-gradient-to-r from-[#001A4C] via-[#0D7377] to-[#001A4C]" id="contact">
        <div className="container cta-inner text-center max-w-4xl mx-auto px-4">
          <h2 className="cta-title text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
            {t?.cta?.title || "Heal Brain Diseases with Doctor-Prescribed Therapy & Medication"}
          </h2>
          <p className="cta-desc text-white/85 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            {t?.cta?.desc || "Join neurologists, patients, and caregivers utilizing evidence-based digital therapies and precision medication schedules for lasting brain recovery."}
          </p>
          <div className="cta-buttons flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              className="btn btn--white btn--xl cursor-pointer w-full sm:w-auto justify-center shadow-lg active:scale-95 transition"
              onClick={() => onSelectRole && onSelectRole("patient")}
            >
              <Play className="w-5 h-5 text-[#0D7377] fill-[#0D7377]" />
              <span>{t?.cta?.start || "Start Prescribed Therapy"}</span>
            </button>
            <button
              className="btn btn--outline-white btn--xl cursor-pointer w-full sm:w-auto justify-center active:scale-95 transition"
              onClick={() => {
                window.open("/doctor-cds", "_blank");
              }}
            >
              <Stethoscope className="w-5 h-5 text-white" />
              <span>{t?.cta?.demo || "Explore Doctor CDS (Neo4j)"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="footer bg-[#001438] py-8 border-t border-slate-800">
        <div className="container footer__inner flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="footer__brand flex items-center gap-2 text-white font-bold text-base">
            <div className="w-7 h-7 rounded-lg bg-[#0D7377] flex items-center justify-center text-white">
              <Brain className="w-4 h-4 text-[#9DF3C4]" />
            </div>
            <span>Smriti Saathi</span>
          </div>
          <div className="footer__links flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
            <a href="#hero" className="hover:text-white transition">Home</a>
            <a href="#categories" className="hover:text-white transition">{t?.nav?.categories || "Brain Disease Modules"}</a>
            <a href="#ai-engine" className="hover:text-white transition">{t?.nav?.ai || "Neuroplasticity AI"}</a>
            <a href="/doctor-cds" target="_blank" rel="noreferrer" className="text-[#9DF3C4] hover:underline">Doctor CDS (Neo4j)</a>
            <a href="#caregiver" className="hover:text-white transition">{t?.nav?.caregiver || "Caregiver Insights"}</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>
          <div className="footer__copy text-xs text-slate-400">Smriti Saathi — Clinical Neurological Care & Rehabilitation · © 2026</div>
        </div>
      </footer>
    </>
  );
};
