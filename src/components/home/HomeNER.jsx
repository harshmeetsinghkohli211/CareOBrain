import React from "react";
import { Globe, Mic, Sparkles, WifiOff } from "lucide-react";

export const HomeNER = ({ t }) => {
  return (
    <section className="section ner-v2-section py-12 sm:py-16 bg-white" id="ner">
      <div className="container">
        <div className="section-header text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="ner-v2-badge">{t?.ner?.label || "ACCESSIBLE NEUROLOGICAL CARE"}</span>
          <h2 className="section__title ner-v2-title text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t?.ner?.titlePrefix || "Empowering Brain Recovery with"}{" "}
            <span className="ner-title-accent text-[#0D7377]">
              {t?.ner?.titleAccent || "Adaptive Clinical Technology"}
              <svg className="title-underline-svg" width="180" height="12" viewBox="0 0 180 12" fill="none">
                <path d="M3 9C45 3 135 3 177 9" stroke="#9DF3C4" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="section__sub text-slate-600 text-sm sm:text-base mt-2">
            {t?.ner?.sub || "Linguistic diversity, culturally resonant content, voice assistance, and 100% offline edge architecture for uninterrupted neuro-rehabilitation."}
          </p>
        </div>

        <div className="ner-v2-grid">
          {/* Card 1: Regional Languages */}
          <div className="ner-v2-card">
            <div className="ner-v2-card-header">
              <div className="ner-v2-icon">
                <Globe className="w-6 h-6 text-[#0D7377]" />
              </div>
              <h3>{t?.ner?.["1t"] || "Regional Languages & Dialects"}</h3>
            </div>
            <p>
              {t?.ner?.["1d"] || "Hindi, Assamese, Manipuri, Khasi, Nagamese, Bodo, Bengali — Voice AI delivers clinical instructions in familiar regional accents so patients engage effortlessly."}
            </p>
          </div>

          {/* Card 2: Voice Interaction */}
          <div className="ner-v2-card">
            <div className="ner-v2-card-header">
              <div className="ner-v2-icon">
                <Mic className="w-6 h-6 text-[#0D7377]" />
              </div>
              <h3>{t?.ner?.["2t"] || "Voice-First Motor & Speech Interaction"}</h3>
            </div>
            <p>
              {t?.ner?.["2d"] || "Speak and respond naturally — speech recognition and synthesis allow patients with tremors or motor impairment to participate without screen touch struggle."}
            </p>
          </div>

          {/* Card 3: Cultural Content */}
          <div className="ner-v2-card">
            <div className="ner-v2-card-header">
              <div className="ner-v2-icon">
                <Sparkles className="w-6 h-6 text-[#0D7377]" />
              </div>
              <h3>{t?.ner?.["3t"] || "Culturally Resonant Neurological Stimuli"}</h3>
            </div>
            <p>
              {t?.ner?.["3d"] || "Bihu, Gamusa, folk tales, and traditional motifs trigger joyful nostalgia and stimulate neuroplastic recall circuits."}
            </p>
          </div>

          {/* Card 4: Offline Mode */}
          <div className="ner-v2-card">
            <div className="ner-v2-card-header">
              <div className="ner-v2-icon">
                <WifiOff className="w-6 h-6 text-[#0D7377]" />
              </div>
              <h3>{t?.ner?.["4t"] || "100% Offline Clinical Edge Mode"}</h3>
            </div>
            <p>
              {t?.ner?.["4d"] || "Complete standalone offline sessions — ensuring continuous daily therapy and pill reminders even in remote hilly terrain and villages."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
