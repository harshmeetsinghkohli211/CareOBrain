import React, { useState, useEffect, useRef } from "react";
import { FileText, Users, Pill, Mic, MapPin, Music, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export const HomeFeaturesSlider = ({ t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(344);
  const trackRef = useRef(null);

  const features = [
    {
      index: 0,
      title: t?.pers?.["1t"] || "Doctor-Prescribed Scans & Reports",
      desc: t?.pers?.["1d"] || "Upload CT, MRI, and prescription reports for Neo4j OCR extraction and clinical therapy mapping.",
      icon: <FileText className="w-8 h-8 text-[#0D7377]" />
    },
    {
      index: 1,
      title: t?.pers?.["2t"] || "Family & Caregiver Network",
      desc: t?.pers?.["2d"] || "Add family portraits and names to strengthen social recognition and emotional grounding.",
      icon: <Users className="w-8 h-8 text-[#0D7377]" />
    },
    {
      index: 2,
      title: t?.pers?.["3t"] || "Precision Medication Schedules",
      desc: t?.pers?.["3d"] || "Program morning, afternoon, and evening pill timings with audible regional alerts.",
      icon: <Pill className="w-8 h-8 text-[#0D7377]" />
    },
    {
      index: 3,
      title: t?.pers?.["4t"] || "Voice-Guided Motor Reminders",
      desc: t?.pers?.["4d"] || "Gentle, spoken step-by-step instructions for physical exercises and daily therapy routines.",
      icon: <Mic className="w-8 h-8 text-[#0D7377]" />
    },
    {
      index: 4,
      title: t?.pers?.["5t"] || "Familiar Landmarks & Spatial Memory",
      desc: t?.pers?.["5d"] || "Home, neighbourhood, and sacred landmarks reinforcing spatial orientation.",
      icon: <MapPin className="w-8 h-8 text-[#0D7377]" />
    },
    {
      index: 5,
      title: t?.pers?.["6t"] || "Therapeutic Nostalgia & Music",
      desc: t?.pers?.["6d"] || "Bihu, Bhajans, and classical melodies stimulating neuro-auditory pathways.",
      icon: <Music className="w-8 h-8 text-[#0D7377]" />
    }
  ];

  // Measure card width for fluid responsive slider
  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 480) {
        setCardWidth(Math.min(320, window.innerWidth - 48));
      } else {
        setCardWidth(344);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  };

  const translateX = currentIndex * -cardWidth;

  return (
    <section className="feat-slider-section" id="personalization">
      <div className="feat-hero-banner py-12 sm:py-16">
        <div className="container text-center max-w-3xl mx-auto px-4">
          <div className="feat-pill-dropdown inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#9DF3C4]" />
            <span>{t?.pers?.label || "Clinical & Caregiver Personalization"}</span>
          </div>
          <h2 className="feat-hero-title text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-3">
            {t?.pers?.title || "Personalized Clinical & Reminiscence Features"}
          </h2>
          <p className="feat-hero-sub text-white/80 text-sm sm:text-base mt-2">
            {t?.pers?.sub || "Doctors and caregivers customize familiar therapy elements, routines, and medication regimens for tailored recovery."}
          </p>
        </div>
      </div>

      <div className="feat-slider-container">
        <div className="feat-track-wrapper">
          <div
            ref={trackRef}
            className="feat-track"
            id="featTrack"
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {features.map((feat) => {
              const isActive = feat.index === currentIndex;
              return (
                <div
                  key={feat.index}
                  className={`feat-card ${isActive ? "feat-card--active" : ""}`}
                  style={{ width: cardWidth, flex: `0 0 ${cardWidth}px` }}
                  data-index={feat.index}
                  onClick={() => setCurrentIndex(feat.index)}
                >
                  <div className="feat-icon-wrapper">
                    {feat.icon}
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                  <span className="feat-card-link text-[#0D7377] font-extrabold flex items-center gap-1">
                    <span>{t?.pers?.learnMore || "Clinical Protocol"}</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls: Prev, Dots, Next */}
        <div className="feat-controls">
          <button className="feat-nav-btn cursor-pointer" id="featPrev" onClick={handlePrev} aria-label="Previous Feature">
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="feat-dots" id="featDots">
            {features.map((feat) => (
              <div
                key={feat.index}
                className={`feat-dot ${feat.index === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(feat.index)}
              />
            ))}
          </div>
          <button className="feat-nav-btn cursor-pointer" id="featNext" onClick={handleNext} aria-label="Next Feature">
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>
    </section>
  );
};
