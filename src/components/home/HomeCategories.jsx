import React from "react";
import { Brain, Stethoscope, Pill, Sparkles, Activity, ShieldCheck } from "lucide-react";

export const HomeCategories = ({
  t,
  completedTasks = {},
  skippedTasks = {},
  onCategoryLaunch,
  onSkipCategory,
}) => {
  const catData = [
    {
      id: 1,
      name: "memory",
      badge: "Dementia & Alzheimer's",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      img: `${import.meta.env.BASE_URL}images/cat_real_memory.jpg`,
      title: t?.cat?.["1t"] || "Dementia & Alzheimer's Care",
      desc: t?.cat?.["1d"] || "Memory retention cards, facial recall & routine stabilization — counteracting cognitive decline and reinforcing synaptic connections.",
      g1: t?.cat?.["1g1"] || "Memory Cards",
      g1Game: "1. Memory Match",
      g2: t?.cat?.["1g2"] || "Photo Recall",
      g2Game: "3. Picture Recall",
      gameTitle: "1. Memory Match"
    },
    {
      id: 2,
      name: "attention",
      badge: "Stroke Neuro-Rehab",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      img: `${import.meta.env.BASE_URL}images/cat_real_attention.jpg`,
      title: t?.cat?.["2t"] || "Stroke Rehabilitation & Motor Recovery",
      desc: t?.cat?.["2d"] || "Bilateral cross-body movement, hemispheric synchronization & fine motor retraining for post-stroke hemiparesis and neuroplastic recovery.",
      g1: t?.cat?.["2g1"] || "Cross-Body Motor",
      g1Game: "8. Color & Shape Match",
      g2: t?.cat?.["2g2"] || "Bilateral Agility",
      g2Game: "5. Sound Match",
      gameTitle: "8. Color & Shape Match"
    },
    {
      id: 3,
      name: "routine",
      badge: "Medication Adherence",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      img: `${import.meta.env.BASE_URL}images/cat_real_routine.jpg`,
      title: t?.cat?.["3t"] || "Medication Adherence & Daily Orientation",
      desc: t?.cat?.["3d"] || "Strict dosage schedules, morning/evening pill routines, and orientation sequencing to prevent missed doses and confusion.",
      g1: t?.cat?.["3g1"] || "Medication Timing",
      g1Game: "9. Daily Routine Recall",
      g2: t?.cat?.["3g2"] || "Daily Orientation",
      g2Game: "9. Daily Routine Recall",
      gameTitle: "9. Daily Routine Recall"
    },
    {
      id: 4,
      name: "pattern",
      badge: "Parkinson's Protocol",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      img: `${import.meta.env.BASE_URL}images/cat_real_pattern.jpg`,
      title: t?.cat?.["4t"] || "Parkinson's & Movement Disorders",
      desc: t?.cat?.["4d"] || "Rhythmic auditory stimulation, motor speed & finger sequencing to counter tremors, muscular rigidity, and bradykinesia.",
      g1: t?.cat?.["4g1"] || "Rhythmic Motor Tap",
      g1Game: "6. Simple Puzzle",
      g2: t?.cat?.["4g2"] || "Motor Sequencing",
      g2Game: "4. Pattern Recall",
      gameTitle: "4. Pattern Recall"
    },
    {
      id: 5,
      name: "object",
      badge: "Aphasia Recovery",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      img: `${import.meta.env.BASE_URL}images/cat_real_object.jpg`,
      title: t?.cat?.["5t"] || "Aphasia & Speech Recovery",
      desc: t?.cat?.["5d"] || "Culturally familiar object naming, linguistic association & auditory comprehension for post-stroke aphasia and anomia.",
      g1: t?.cat?.["5g1"] || "Object Naming",
      g1Game: "7. Find the Object",
      g2: t?.cat?.["5g2"] || "Voice Association",
      g2Game: "3. Picture Recall",
      gameTitle: "7. Find the Object"
    },
    {
      id: 6,
      name: "emotional",
      badge: "Neuro-Stimulation",
      badgeColor: "bg-pink-100 text-pink-800 border-pink-200",
      img: `${import.meta.env.BASE_URL}images/cat_real_emotion.jpg`,
      title: t?.cat?.["6t"] || "Neuro-Stimulation & Emotional Vitality",
      desc: t?.cat?.["6d"] || "Folk melodies, nostalgic memory storytelling & sensory stimulation to alleviate apathy, depression, and cognitive fatigue.",
      g1: t?.cat?.["6g1"] || "Music Therapy",
      g1Game: "16. Memory Art Gallery",
      g2: t?.cat?.["6g2"] || "Reminiscence Story",
      g2Game: "11. Story Recall",
      gameTitle: "16. Memory Art Gallery"
    }
  ];

  return (
    <section className="section py-12 sm:py-16" id="categories">
      <div className="container">
        <div className="section-header text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0D7377] text-xs font-black uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-[#0D7377]" />
            <span>{t?.cat?.label || "Neurological Condition & Therapy Modules"}</span>
          </div>
          <h2 className="section__title text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t?.cat?.title || "Clinical Therapies & Medication for Every Treatable Brain Disease"}
          </h2>
          <p className="section__sub text-slate-600 text-sm sm:text-base mt-2">
            {t?.cat?.sub || "Doctor-prescribed therapeutic protocols combining targeted motor coordination, cognitive rehabilitation, and precision medication synchronization."}
          </p>
        </div>

        <div className="cat-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {catData.map((cat) => {
            const isCompleted = !!completedTasks[cat.id];
            const isSkipped = !!skippedTasks[cat.id];

            return (
              <div
                key={cat.id}
                className={`cat-card cat-card--${cat.name} ${isCompleted ? "cat-card--completed" : ""} ${isSkipped ? "cat-card--skipped" : ""}`}
                id={`cat-${cat.id}`}
              >
                <div className="cat-card__done-badge" id={`done-${cat.id}`}>✅</div>
                <div className="cat-card__skip-badge" id={`skip-${cat.id}`}>
                  🔔 {t?.cat?.pending || "Saved in Notifications"}
                </div>
                
                {/* Condition Tag Badge */}
                <div className="mb-2.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide border ${cat.badgeColor}`}>
                    {cat.badge}
                  </span>
                </div>

                <div className="cat-img-wrapper">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="cat-img"
                    onError={(e) => {
                      e.currentTarget.src = "/images/cat_memory_elder.svg";
                    }}
                  />
                </div>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
                <div className="cat-games">
                  <button
                    type="button"
                    onClick={() => onCategoryLaunch && onCategoryLaunch(cat.id, cat.g1Game)}
                    className="cat-game cursor-pointer hover:bg-teal-100 hover:text-teal-900 transition flex items-center gap-1 border-0"
                    title={`Play ${cat.g1}`}
                  >
                    <span>▶</span> {cat.g1}
                  </button>
                  <button
                    type="button"
                    onClick={() => onCategoryLaunch && onCategoryLaunch(cat.id, cat.g2Game)}
                    className="cat-game cursor-pointer hover:bg-teal-100 hover:text-teal-900 transition flex items-center gap-1 border-0"
                    title={`Play ${cat.g2}`}
                  >
                    <span>▶</span> {cat.g2}
                  </button>
                </div>

                {/* Card Action Buttons (Enlarged Start Therapy & Skip Task) */}
                <div className="cat-card-actions">
                  <button
                    type="button"
                    onClick={() => onCategoryLaunch && onCategoryLaunch(cat.id, cat.gameTitle)}
                    className="btn btn--cat-start cursor-pointer"
                    aria-label={`Start ${cat.title} therapy`}
                  >
                    <span className="text-xl">🎮</span>
                    <span>{t?.hero?.cta1 || "Start Therapy"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSkipCategory && onSkipCategory(cat)}
                    className={`btn btn--cat-skip cursor-pointer ${isSkipped ? "is-skipped" : ""}`}
                    title={isSkipped ? "Task is in your notification bell. Click to undo." : "Skip this task and send it to your Notification Bell"}
                    aria-label={isSkipped ? "Undo skip task" : "Skip task and send to notifications"}
                  >
                    <span>{isSkipped ? "🔔 In Notifications" : "⏭️ Skip Task"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
