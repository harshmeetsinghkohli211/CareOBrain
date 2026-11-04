import { getDoctorCdsUrl } from "../../utils/doctorCdsRoute";
import React from "react";
import {
  Brain,
  Play,
  LayoutDashboard,
  Sparkles,
  Users,
  Mic,
  WifiOff,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Heart,
  ChevronRight,
  Puzzle,
  TrendingUp,
  Camera,
  Music,
  Pill,
  Activity,
  FileText
} from "lucide-react";

export const HomeHero = ({ onSelectRole, onOpenMemoryTest, t }) => {
  return (
    <section className="relative pt-4 sm:pt-6 pb-12 sm:pb-16 bg-[#F8FAFC] overflow-hidden" id="hero">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Top Triple Action Banners: Neurological Assessment + Doctor CDS Scans + Neuroplasticity Music */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5 mb-6 sm:mb-8 max-w-6xl">
          {/* 1. Neurological Assessment Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-teal-300 hover:shadow-sm transition group">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#001A4C] group-hover:bg-[#0D7377] flex items-center justify-center text-white shrink-0 shadow-xs transition-colors">
                <Brain className="w-5 h-5 text-[#9DF3C4]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-[#0D7377] tracking-wider uppercase block truncate">
                  NEUROLOGICAL ASSESSMENT
                </span>
                <h3 className="text-xs font-bold text-[#0F172A] truncate">
                  Brain & Motor Agility Test
                </h3>
              </div>
            </div>
            <button
              type="button"
              id="home-take-memory-test-btn"
              onClick={() => onOpenMemoryTest && onOpenMemoryTest("voice_motor_test")}
              className="bg-[#001A4C] hover:bg-[#0D7377] text-white px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span>Test</span>
              <span>→</span>
            </button>
          </div>

          {/* 2. Doctor CDS & Medical Scans Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-teal-300 hover:shadow-sm transition group">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-teal-800 group-hover:bg-[#0D7377] flex items-center justify-center text-white shrink-0 shadow-xs transition-colors">
                <Stethoscope className="w-5 h-5 text-[#9DF3C4]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-[#0D7377] tracking-wider uppercase block flex items-center gap-1 truncate">
                  <Sparkles className="w-3 h-3 text-[#0D7377] shrink-0" />
                  DOCTOR CDS (NEO4J)
                </span>
                <h3 className="text-xs font-bold text-[#0F172A] truncate">
                  Scan Intake & Prescriptions
                </h3>
              </div>
            </div>
            <button
              type="button"
              id="home-doctor-cds-btn"
              onClick={() => {
                window.open(getDoctorCdsUrl(), "_blank");
              }}
              className="bg-gradient-to-r from-[#0D7377] to-teal-700 hover:from-teal-800 hover:to-[#0D7377] text-white px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span>CDS</span>
              <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded">Neo4j</span>
            </button>
          </div>

          {/* 3. Neuroplasticity Music & Therapy Lab */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-teal-300 hover:shadow-sm transition group sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#001A4C] group-hover:bg-[#0D7377] flex items-center justify-center text-white shrink-0 shadow-xs transition-colors">
                <Music className="w-5 h-5 text-[#9DF3C4]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-[#001A4C] tracking-wider uppercase block flex items-center gap-1 truncate">
                  <Sparkles className="w-3 h-3 text-[#001A4C] shrink-0" />
                  NEUROPLASTICITY LAB
                </span>
                <h3 className="text-xs font-bold text-[#0F172A] truncate">
                  Memory Lane & Rhythm
                </h3>
              </div>
            </div>
            <button
              type="button"
              id="home-memory-lane-music-btn"
              onClick={() => onOpenMemoryTest && onOpenMemoryTest("nostalgia_recall_music")}
              className="bg-[#001A4C] hover:bg-[#002466] text-white px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span>Explore</span>
              <span>✨</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-5 sm:space-y-6 max-w-2xl mx-auto lg:mx-0">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D7377]/10 border border-[#0D7377]/25 text-[#0D7377] text-xs font-black uppercase tracking-wider mb-1">
                <Activity className="w-3.5 h-3.5 text-[#0D7377]" />
                <span>{t?.hero?.badge || "Clinical Neurological Care & Rehabilitation"}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#001A4C] leading-[1.12]">
                {t?.hero?.t1 || "Targeted Therapy & Medication for"}
                <br />
                <span className="text-[#0D7377] block sm:inline">{t?.hero?.t2 || "All Treatable Brain Diseases"}</span>
              </h1>
            </div>

            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-normal">
              {t?.hero?.desc ||
                "Comprehensive digital neurological care for Alzheimer's, Stroke Recovery, Parkinson's, MCI, and Brain Trauma — unifying doctor-prescribed physical & cognitive therapies with precision medication protocols to stimulate neuroplasticity and restore independence."}
            </p>

            {/* Condition Badges Pill Row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-slate-700">
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold flex items-center gap-1">
                <span>🧠</span> Stroke Rehab
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold flex items-center gap-1">
                <span>⚡</span> Parkinson's Agility
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200/80 text-purple-800 text-xs font-bold flex items-center gap-1">
                <span>🧩</span> Dementia & Memory
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold flex items-center gap-1">
                <span>💊</span> Timed Medication
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <span>🎯</span> MCI & Trauma
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
              <button
                id="heroMainCta"
                onClick={() => onSelectRole && onSelectRole("patient")}
                className="btn-glow-blue w-full sm:w-auto justify-center px-7 py-3.5 sm:py-4.5 rounded-2xl bg-gradient-to-r from-[#0D7377] via-[#001A4C] to-[#0D7377] hover:brightness-110 text-white font-black text-base sm:text-lg flex items-center gap-3 transition shadow-xl cursor-pointer active:scale-95"
              >
                <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                  <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                </div>
                <span>{t?.hero?.cta1 || "Start Prescribed Therapy"}</span>
              </button>

              <button
                onClick={() => {
                  window.open(getDoctorCdsUrl(), "_blank");
                }}
                className="w-full sm:w-auto justify-center px-5 py-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-300 text-[#0D7377] font-bold text-sm sm:text-base flex items-center gap-2.5 transition shadow-xs cursor-pointer active:scale-95"
              >
                <Stethoscope className="w-4 h-4 text-[#0D7377] shrink-0" />
                <span>Doctor CDS (Neo4j)</span>
              </button>

              <button
                onClick={() => onSelectRole && onSelectRole("family")}
                className="w-full sm:w-auto justify-center px-4 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm sm:text-base flex items-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-600 shrink-0" />
                <span>{t?.hero?.cta2 || "Caregiver"}</span>
              </button>
            </div>

            {/* Trust Social Proof */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2 overflow-hidden shrink-0">
                <img
                  className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                  alt="Family Caregiver"
                />
                <img
                  className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Recovering Patient"
                />
                <img
                  className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                  alt="Neurologist"
                />
                <img
                  className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                  alt="Clinician"
                />
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">
                <span className="font-extrabold text-[#0D7377]">2,000+</span>{" "}
                {t?.hero?.trust || "Patients & Clinicians actively managing brain recovery"}
              </div>
            </div>
          </div>

          {/* Right Hero Column: Clinical Illustration with Live Medical Status Cards (Desktop & Large Tablets) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6 relative">
            <div 
              className="relative w-full max-w-lg mx-auto aspect-[4/3] rounded-3xl bg-gradient-to-b from-[#EFF6FF]/70 via-[#F8FAFC]/50 to-[#E2E8F0]/30 border border-slate-200/80 p-3 sm:p-5 flex items-center justify-center overflow-visible shadow-sm group"
            >
              
              {/* Main Landing Hero Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  id="heroCompanionImage"
                  src={`${import.meta.env.BASE_URL}images/hero_elder_tablet.svg`}
                  alt="Patient Performing Prescribed Brain Therapy with Tablet"
                  className="w-full h-full max-h-[380px] object-contain select-none drop-shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `${import.meta.env.BASE_URL}images/hero_bento_elder.svg`;
                  }}
                />
              </div>

              {/* 📊 Floating Card 1: Neurological Recovery Score (Top Left) */}
              <div className="absolute top-2 left-2 sm:-top-4 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg border border-teal-100 max-w-[200px] sm:max-w-[220px] transition transform hover:scale-105">
                <div className="text-[11px] sm:text-xs font-bold text-[#0F172A] mb-1 flex items-center justify-between">
                  <span>Recovery Progress</span>
                  <span className="text-[9px] font-black text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded uppercase">Active</span>
                </div>
                {/* Mini Line Chart SVG */}
                <div className="h-8 w-full mb-1">
                  <svg viewBox="0 0 160 35" className="w-full h-full overflow-visible">
                    <path
                      d="M 10 28 Q 45 18, 75 22 T 120 12 T 150 6"
                      fill="none"
                      stroke="#0D7377"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="10" cy="28" r="3" fill="#0D7377" />
                    <circle cx="50" cy="20" r="3" fill="#0D7377" />
                    <circle cx="75" cy="22" r="3" fill="#0D7377" />
                    <circle cx="115" cy="14" r="3" fill="#0D7377" />
                    <circle cx="150" cy="6" r="3.5" fill="#0D7377" stroke="#FFFFFF" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-left">
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block">Symmetry</span>
                    <span className="text-xs sm:text-sm font-black text-[#0D7377]">88%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block">Streak</span>
                    <span className="text-xs sm:text-sm font-black text-[#0F172A]">7 Days</span>
                  </div>
                </div>
              </div>

              {/* 🎯 Floating Card 2: Daily Medication & Therapy (Middle Left) */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-2 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-lg border border-slate-100 flex flex-col items-center text-center transition transform hover:scale-105">
                <span className="text-[11px] font-bold text-[#0F172A] mb-1">Medication & Therapy</span>
                <div className="relative w-12 h-12 flex items-center justify-center my-0.5">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#0D7377]"
                      strokeDasharray="100, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-[#0D7377]">5/5</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 mt-1">
                  Prescriptions
                  <br />
                  Completed
                </span>
              </div>

              {/* 🧩 Floating Card 3: Active Protocol (Bottom Left) */}
              <div className="absolute -bottom-4 left-2 sm:-bottom-6 sm:left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-teal-100 flex items-center gap-3 transition transform hover:scale-105 cursor-pointer max-w-[250px]">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D7377] flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] text-[#0D7377] font-bold block uppercase tracking-wider">
                    Doctor Prescribed
                  </span>
                  <div className="text-xs font-bold text-[#0F172A] truncate">Bilateral Cross-Body</div>
                  <span className="text-[10px] text-slate-500 block truncate">Stroke & Motor Neuroplasticity</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

            </div>
          </div>

        </div>

        {/* 5 Clinical Benefit Cards Row: Brain Diseases & Therapies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-12 sm:mt-16 pt-6 border-t border-slate-200/80">
          
          {/* Feature 1: Stroke Rehab */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D7377] flex items-center justify-center mb-3">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-1">
              Stroke & Hemiparesis
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bilateral cross-body retraining to re-establish neural pathways and motor symmetry.
            </p>
          </div>

          {/* Feature 2: Parkinson's Agility */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-1">
              Parkinson's & Agility
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rhythmic auditory stimulation and motor pacing to counteract rigidity and tremors.
            </p>
          </div>

          {/* Feature 3: Dementia & Memory */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Puzzle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-1">
              Dementia & Alzheimer's
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Synaptic reinforcement through memory grids, facial recall, and daily routines.
            </p>
          </div>

          {/* Feature 4: Medication Protocols */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Pill className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-1">
              Precision Medication
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Doctor-synchronized dosage timing, voice alerts, and drug interaction safety checks.
            </p>
          </div>

          {/* Feature 5: Doctor CDS */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition sm:col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-1">
              Doctor CDS (Neo4j AI)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Medical scan OCR intake, Knowledge Graph safety screening, and custom prescriptions.
            </p>
          </div>

        </div>

        {/* Bottom Trust Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 lg:gap-12 mt-6 sm:mt-8 pt-4 text-xs sm:text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0D7377]" />
            <span>Evidence-Based Clinical Protocols</span>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#0D7377]" />
            <span>Neurologist & Clinician Recommended</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#0D7377]" />
            <span>Integrated Therapy + Medication Management</span>
          </div>
        </div>

      </div>
    </section>
  );
};
