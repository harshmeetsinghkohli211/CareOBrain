import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, Award, Sparkles, RefreshCw, Volume2, VolumeX, Shield, Play, Stethoscope } from "lucide-react";

export const TherapyMiniGameModal = ({ therapy, isOpen, onClose, onComplete }) => {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameMessage, setGameMessage] = useState("Watch the sequence carefully...");
  const [isGameOver, setIsGameOver] = useState(false);
  const [activeJoint, setActiveJoint] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [neo4jLoaded, setNeo4jLoaded] = useState(false);

  const containerRef = useRef(null);
  const gameMountRef = useRef(null);

  const tid = therapy?.id || therapy?.therapy_id || "";
  const therapyTitle = therapy?.name || therapy?.therapy_name || "Prescribed Therapy";
  const doctorNote = therapy?.doctor_note || "";

  // Joints for Joint Mobility Challenge fallback
  const joints = [
    { id: 0, name: "Shoulder", x: 50, y: 22, color: "#0D7377" },
    { id: 1, name: "Elbow", x: 32, y: 38, color: "#14B8A6" },
    { id: 2, name: "Wrist", x: 22, y: 52, color: "#059669" },
    { id: 3, name: "Hip", x: 50, y: 56, color: "#D97706" },
    { id: 4, name: "Knee", x: 38, y: 74, color: "#2563EB" },
    { id: 5, name: "Ankle", x: 32, y: 88, color: "#7C3AED" }
  ];

  const [sequence, setSequence] = useState([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);

  // Load /static/therapy_games.js if not already present on window
  useEffect(() => {
    if (typeof window !== "undefined" && !window.TherapyGames) {
      const script = document.createElement("script");
      script.src = "/static/therapy_games.js";
      script.async = true;
      script.onload = () => setNeo4jLoaded(true);
      document.body.appendChild(script);
    } else if (window.TherapyGames) {
      setNeo4jLoaded(true);
    }
  }, []);

  const hasNeo4jGame = Boolean(window.TherapyGames && window.TherapyGames.hasGame(tid));
  const neo4jGameType = window.TherapyGames ? window.TherapyGames.getGameType(tid) : "instructions";

  // Determine game type
  const isJointGame =
    !hasNeo4jGame &&
    (tid === "th_physio" ||
      therapyTitle.toLowerCase().includes("physical") ||
      therapyTitle.toLowerCase().includes("joint") ||
      therapyTitle.toLowerCase().includes("mobility") ||
      therapyTitle.toLowerCase().includes("motor"));

  // Step-by-step instructions for non-minigame therapies
  const protocolSteps = [
    {
      title: "Preparation & Breathing Alignment",
      detail: doctorNote
        ? `Doctor's Advice: ${doctorNote}. Sit upright, breathe gently for 30 seconds.`
        : "Sit or stand in a relaxed posture. Breathe deeply through your nose to prepare your neural pathways."
    },
    {
      title: "Targeted Movement Range",
      detail: `Focus on the prescribed treatment target: ${(therapy?.target_areas || ["Joints", "Muscles", "Cognitive Recall"]).join(", ")}. Perform gentle, smooth, controlled actions.`
    },
    {
      title: "Rhythmic Sustained Repetitions",
      detail: `Complete 3 sets of gentle repetitions. Pace: ${therapy?.duration || "10-15 minutes"}. Never strain or push through acute discomfort.`
    },
    {
      title: "Cool-down & Mindful Hydration",
      detail: "Gently relax for 1 minute. Drink a small glass of water and mark your exercise as completed in Smriti Saathi."
    }
  ];

  // Initialize Joint Mobility Challenge
  useEffect(() => {
    if (!isOpen) return;

    if (isJointGame) {
      setScore(0);
      setRound(1);
      setIsGameOver(false);
      startRound(1);
    }
  }, [isOpen, therapy, isJointGame]);

  const startRound = (r) => {
    const len = Math.min(r + 2, 6);
    const newSeq = [];
    for (let i = 0; i < len; i++) {
      newSeq.push(Math.floor(Math.random() * joints.length));
    }
    setSequence(newSeq);
    setPlayerIdx(0);
    setIsPlayerTurn(false);
    setGameMessage(`Round ${r}: Watch the joint pattern...`);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= newSeq.length) {
        clearInterval(interval);
        setActiveJoint(null);
        setIsPlayerTurn(true);
        setGameMessage("Your Turn! Click the joints in the same sequence.");
        return;
      }
      setActiveJoint(newSeq[idx]);
      setTimeout(() => setActiveJoint(null), 500);
      idx++;
    }, 900);
  };

  const handleJointClick = (jointIdx) => {
    if (!isPlayerTurn || isGameOver) return;

    if (jointIdx === sequence[playerIdx]) {
      const nextIdx = playerIdx + 1;
      setPlayerIdx(nextIdx);

      if (nextIdx >= sequence.length) {
        const newScore = score + round * 25;
        setScore(newScore);

        if (round >= 4) {
          setIsGameOver(true);
          setGameMessage(`🎉 Exercise Complete! Excellent Motor Recall. Score: ${newScore}`);
        } else {
          setRound(round + 1);
          setGameMessage(`✅ Correct! Moving to Round ${round + 1}...`);
          setIsPlayerTurn(false);
          setTimeout(() => startRound(round + 1), 1200);
        }
      }
    } else {
      setGameMessage(`❌ Incorrect joint! Correct was ${joints[sequence[playerIdx]].name}. Try again!`);
      setIsPlayerTurn(false);
      setTimeout(() => startRound(round), 1400);
    }
  };

  const handleLaunchNeo4jNativeModal = () => {
    if (window.TherapyGames) {
      window.TherapyGames.openGame(tid, therapyTitle);
    }
  };

  const handleSpeakInstructions = () => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let speechText = `Starting therapy: ${therapyTitle}. `;
    if (doctorNote) {
      speechText += `Your doctor advises: ${doctorNote}. `;
    }
    protocolSteps.forEach((step, idx) => {
      speechText += `Step ${idx + 1}: ${step.title}. ${step.detail}. `;
    });

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleFinish = () => {
    if (isSpeaking && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (onComplete) {
      onComplete(therapy, score || 100);
    }
    onClose();
  };

  if (!isOpen || !therapy) return null;

  return (
    <div className="fixed inset-0 z-[10060] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0D7377] via-[#0F8A8F] to-[#14B8A6] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner shrink-0">
              <Stethoscope className="w-5 h-5 text-[#9DF3C4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#9DF3C4] text-slate-900 px-2 py-0.5 rounded-full shadow-2xs">
                  Neo4j CDS Prescribed
                </span>
                <span className="text-[10px] text-teal-100 font-bold">
                  Evidence {therapy.evidence_level || "A"}
                </span>
              </div>
              <h3 className="font-black text-base sm:text-lg leading-tight mt-0.5">
                {therapyTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakInstructions}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isSpeaking
                  ? "bg-amber-400 text-amber-950 animate-bounce"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
              title={isSpeaking ? "Stop Voice Narration" : "Listen to Directions Aloud"}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Clinical Description */}
          <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-2xl border border-slate-100">
            {therapy.therapy_description || therapy.description}
          </p>

          {/* Doctor's Note Highlight */}
          {doctorNote && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 text-xs text-teal-950 shadow-2xs flex items-start gap-2.5">
              <Stethoscope className="w-4 h-4 text-[#0D7377] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] font-black uppercase text-[#0D7377] mb-0.5">
                  Dr. Debabrata Roy's Prescription Instructions:
                </strong>
                <p className="leading-relaxed font-medium">{doctorNote}</p>
              </div>
            </div>
          )}

          {/* Interactive Native Neo4j Mini-Game launcher (if game exists in Neo4j games engine) */}
          {hasNeo4jGame && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-teal-50 border border-teal-200 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-[#0D7377] uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>Interactive Exercise Ready ({neo4jGameType === "game" ? "HTML5 Mini-Game" : "Clinical Guide"})</span>
              </div>
              <p className="text-xs text-slate-600">
                This prescribed therapy includes an interactive exercise module from the Neo4j Medical CDS Engine.
              </p>
              <button
                onClick={handleLaunchNeo4jNativeModal}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0D7377] hover:bg-[#0A5C5F] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Interactive Neo4j Game / Protocol</span>
              </button>
            </div>
          )}

          {isJointGame ? (
            /* Joint Mobility Challenge Interactive Mini-Game Fallback */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#E6FFFA] border border-[#99F6E4] text-xs font-bold text-[#0D7377]">
                <span>Round: {round}/4</span>
                <span className="font-extrabold text-xs sm:text-sm">{gameMessage}</span>
                <span>Score: {score} pts</span>
              </div>

              {/* Interactive Silhouette Board */}
              <div className="relative w-full max-w-sm mx-auto h-[300px] bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF] rounded-3xl border-2 border-[#99F6E4] flex items-center justify-center p-3 shadow-inner">
                <svg viewBox="0 0 100 100" className="w-full h-full select-none">
                  {/* Skeletal Body Outline */}
                  <line x1="50" y1="14" x2="50" y2="56" stroke="#94A3B8" strokeWidth="2.5" />
                  <line x1="50" y1="22" x2="32" y2="38" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="32" y1="38" x2="22" y2="52" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="50" y1="22" x2="68" y2="38" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="68" y1="38" x2="78" y2="52" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="50" y1="56" x2="38" y2="74" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="38" y1="74" x2="32" y2="88" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="50" y1="56" x2="62" y2="74" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="62" y1="74" x2="68" y2="88" stroke="#94A3B8" strokeWidth="2" />
                  <circle cx="50" cy="11" r="7" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />

                  {/* Interactive Joint Circles */}
                  {joints.map((j) => {
                    const isFlashed = activeJoint === j.id;
                    return (
                      <g key={j.id} onClick={() => handleJointClick(j.id)} className="cursor-pointer">
                        <circle
                          cx={j.x}
                          cy={j.y}
                          r={isFlashed ? 7 : 5}
                          fill={isFlashed ? "#F59E0B" : j.color}
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          className="transition-all duration-200 hover:scale-125"
                        />
                        <text
                          x={j.x}
                          y={j.y - 7}
                          textAnchor="middle"
                          fill="#0F172A"
                          fontSize="3.8"
                          fontWeight="700"
                        >
                          {j.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="text-center text-[11px] text-slate-500 font-semibold">
                Click on the highlighted joint circles in sequence to complete your motor coordination challenge.
              </div>
            </div>
          ) : (
            /* Guided Step-by-Step Clinical Exercise Protocol */
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Follow the step-by-step clinical protocol below at your own pace:</span>
              </div>

              <div className="space-y-2">
                {protocolSteps.map((step, idx) => {
                  const isCurrent = stepIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setStepIdx(idx)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs ${
                        isCurrent
                          ? "bg-[#E6FFFA] border-[#0D7377] shadow-xs"
                          : "bg-white hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          isCurrent ? "bg-[#0D7377] text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900">{step.title}</h4>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{step.detail}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-semibold">
            {isGameOver ? "Session Finished!" : `Target: ${therapy.duration || "4-8 weeks"}`}
          </span>

          <button
            onClick={handleFinish}
            className="px-6 py-2.5 bg-[#0D7377] hover:bg-[#0A5C5F] text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#9DF3C4]" />
            <span>Mark Exercise Completed Today</span>
          </button>
        </div>
      </div>
    </div>
  );
};
