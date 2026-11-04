/**
 * MedGraph Therapy Engine — Interactive Therapy Games & Instructions
 * 
 * Every therapy in the Neo4j database has a corresponding interactive game
 * or detailed step-by-step instructions. Exercise-based therapies get 
 * interactive HTML5 mini-games; clinical/pharmacological therapies get
 * rich visual instruction guides.
 *
 * Therapy IDs map 1:1 to seed_data.py get_therapies().
 */

const TherapyGames = (() => {

  // ── Game/Instruction Registry ──────────────────────────────────────
  // Every therapy_id maps to a game config object
  const GAMES = {

    // ═══════════════════════════════════════════════════════════════════
    // 1. PHYSICAL THERAPY — Joint Mobility Game
    // ═══════════════════════════════════════════════════════════════════
    th_physio: {
      title: "🏋️ Joint Mobility Challenge",
      type: "game",
      description: "Follow the on-screen joint movement patterns. Click the highlighted joints in the correct sequence to complete each exercise set.",
      render: (container) => {
        const joints = [
          { name: "Shoulder", x: 50, y: 20, color: "#4ecdc4" },
          { name: "Elbow", x: 35, y: 40, color: "#45b7d1" },
          { name: "Wrist", x: 25, y: 55, color: "#96ceb4" },
          { name: "Hip", x: 50, y: 55, color: "#ffeaa7" },
          { name: "Knee", x: 40, y: 72, color: "#dfe6e9" },
          { name: "Ankle", x: 35, y: 88, color: "#fd79a8" },
        ];
        let sequence = [];
        let playerIdx = 0;
        let score = 0;
        let round = 1;
        const maxRounds = 5;

        function generateSequence() {
          const len = Math.min(round + 2, joints.length);
          sequence = [];
          for (let i = 0; i < len; i++) {
            sequence.push(Math.floor(Math.random() * joints.length));
          }
          playerIdx = 0;
        }

        function renderGame() {
          container.innerHTML = `
            <div class="tg-game-area" style="position:relative;width:100%;max-width:400px;height:420px;margin:0 auto;background:linear-gradient(135deg,#0a0a2e,#1a1a4e);border-radius:20px;overflow:hidden;">
              <div class="tg-hud" style="display:flex;justify-content:space-between;padding:12px 18px;color:#fff;font-size:14px;font-weight:600;">
                <span>Round ${round}/${maxRounds}</span>
                <span>Score: ${score}</span>
              </div>
              <div id="tg-physio-msg" style="text-align:center;color:#ffeaa7;font-size:15px;padding:6px;min-height:28px;">Watch the sequence...</div>
              <svg viewBox="0 0 100 100" style="width:100%;height:320px;" id="tg-physio-svg">
                <!-- Body silhouette -->
                <line x1="50" y1="12" x2="50" y2="55" stroke="#334" stroke-width="2"/>
                <line x1="50" y1="20" x2="35" y2="40" stroke="#334" stroke-width="1.5"/>
                <line x1="35" y1="40" x2="25" y2="55" stroke="#334" stroke-width="1.5"/>
                <line x1="50" y1="20" x2="65" y2="40" stroke="#334" stroke-width="1.5"/>
                <line x1="65" y1="40" x2="75" y2="55" stroke="#334" stroke-width="1.5"/>
                <line x1="50" y1="55" x2="40" y2="72" stroke="#334" stroke-width="1.5"/>
                <line x1="40" y1="72" x2="35" y2="88" stroke="#334" stroke-width="1.5"/>
                <line x1="50" y1="55" x2="60" y2="72" stroke="#334" stroke-width="1.5"/>
                <line x1="60" y1="72" x2="65" y2="88" stroke="#334" stroke-width="1.5"/>
                <circle cx="50" cy="10" r="6" fill="#445" stroke="#667" stroke-width="1"/>
                ${joints.map((j, i) => `
                  <circle cx="${j.x}" cy="${j.y}" r="4" fill="${j.color}" stroke="#fff" stroke-width="0.8" 
                    style="cursor:pointer;filter:drop-shadow(0 0 4px ${j.color}80);" class="tg-joint" data-idx="${i}"/>
                  <text x="${j.x}" y="${j.y - 6}" text-anchor="middle" fill="#aab" font-size="3.2" font-weight="600">${j.name}</text>
                `).join("")}
              </svg>
            </div>
          `;

          const svg = document.getElementById("tg-physio-svg");
          const msg = document.getElementById("tg-physio-msg");

          // Animate sequence display
          generateSequence();
          let showIdx = 0;

          function showNext() {
            if (showIdx >= sequence.length) {
              msg.textContent = "Your turn! Click joints in order.";
              msg.style.color = "#55efc4";
              enableClicking();
              return;
            }
            const circles = svg.querySelectorAll(".tg-joint");
            circles.forEach(c => { c.style.transform = ""; c.style.filter = `drop-shadow(0 0 4px ${joints[c.dataset.idx].color}80)`; });
            const target = circles[sequence[showIdx]];
            target.style.filter = `drop-shadow(0 0 12px #fff)`;
            target.setAttribute("r", "6");
            msg.textContent = `Remember: ${joints[sequence[showIdx]].name}`;
            showIdx++;
            setTimeout(() => {
              target.setAttribute("r", "4");
              setTimeout(showNext, 300);
            }, 700);
          }

          setTimeout(showNext, 600);

          function enableClicking() {
            const circles = svg.querySelectorAll(".tg-joint");
            circles.forEach(c => {
              c.addEventListener("click", function handler() {
                const idx = parseInt(this.dataset.idx);
                if (idx === sequence[playerIdx]) {
                  this.style.filter = "drop-shadow(0 0 12px #55efc4)";
                  playerIdx++;
                  if (playerIdx >= sequence.length) {
                    score += round * 10;
                    round++;
                    if (round > maxRounds) {
                      msg.textContent = `🎉 Complete! Final Score: ${score}`;
                      msg.style.color = "#ffeaa7";
                    } else {
                      msg.textContent = `✅ Round complete! +${(round - 1) * 10} pts`;
                      setTimeout(renderGame, 1200);
                    }
                  }
                } else {
                  msg.textContent = `❌ Wrong joint! Correct was: ${joints[sequence[playerIdx]].name}. Try again!`;
                  msg.style.color = "#ff6b6b";
                  playerIdx = 0;
                  setTimeout(() => {
                    msg.textContent = "Sequence restarting...";
                    msg.style.color = "#ffeaa7";
                    setTimeout(renderGame, 800);
                  }, 1500);
                }
              });
            });
          }
        }

        renderGame();
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 2. HYDROTHERAPY — Water Resistance Game
    // ═══════════════════════════════════════════════════════════════════
    th_hydro: {
      title: "🌊 Water Resistance Exercise",
      type: "game",
      description: "Move the patient through the water by clicking. Hold the correct pace — not too fast, not too slow — to maintain the optimal exercise zone!",
      render: (container) => {
        let position = 50;
        let velocity = 0;
        let score = 0;
        let timeLeft = 30;
        let zoneCenter = 50;
        let animFrame;
        let timerInterval;

        container.innerHTML = `
          <div class="tg-game-area" style="position:relative;width:100%;max-width:440px;height:380px;margin:0 auto;background:linear-gradient(180deg,#006994,#004466,#002233);border-radius:20px;overflow:hidden;">
            <div class="tg-hud" style="display:flex;justify-content:space-between;padding:12px 18px;color:#fff;font-size:14px;font-weight:600;">
              <span id="tg-hydro-time">⏱ 30s</span>
              <span id="tg-hydro-score">Score: 0</span>
            </div>
            <!-- Water waves background -->
            <div style="position:absolute;bottom:0;width:100%;height:260px;opacity:0.15;">
              <svg viewBox="0 0 440 260" style="width:100%;height:100%;">
                <path d="M0,40 Q110,0 220,40 T440,40 V260 H0 Z" fill="#00b4d8"/>
                <path d="M0,70 Q110,30 220,70 T440,70 V260 H0 Z" fill="#0096c7"/>
              </svg>
            </div>
            <div style="position:relative;width:100%;height:260px;" id="tg-hydro-pool">
              <!-- Optimal zone indicator -->
              <div id="tg-hydro-zone" style="position:absolute;left:0;right:0;height:60px;background:rgba(85,239,196,0.2);border:2px dashed #55efc4;border-radius:8px;transition:top 0.8s ease;"></div>
              <!-- Patient avatar -->
              <div id="tg-hydro-avatar" style="position:absolute;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,#ffeaa7,#fdcb6e);box-shadow:0 0 20px rgba(253,203,110,0.5);left:50%;transform:translateX(-50%);transition:top 0.1s;display:flex;align-items:center;justify-content:center;font-size:20px;">🏊</div>
            </div>
            <div style="text-align:center;padding:8px;color:#81ecec;font-size:13px;" id="tg-hydro-hint">Click/tap to swim upward! Stay in the green zone.</div>
          </div>
        `;

        const pool = document.getElementById("tg-hydro-pool");
        const avatar = document.getElementById("tg-hydro-avatar");
        const zone = document.getElementById("tg-hydro-zone");
        const timeEl = document.getElementById("tg-hydro-time");
        const scoreEl = document.getElementById("tg-hydro-score");

        position = 50;
        zone.style.top = `${zoneCenter - 12}%`;
        avatar.style.top = `${position}%`;

        pool.addEventListener("click", () => {
          velocity = -3.5;
        });

        function gameLoop() {
          velocity += 0.18; // gravity (water resistance)
          position += velocity;
          position = Math.max(2, Math.min(90, position));
          avatar.style.top = `${position}%`;

          // Check if in zone
          const zoneTop = zoneCenter - 12;
          const zoneBottom = zoneCenter + 12;
          if (position >= zoneTop && position <= zoneBottom) {
            score++;
            avatar.style.boxShadow = "0 0 24px rgba(85,239,196,0.7)";
          } else {
            avatar.style.boxShadow = "0 0 20px rgba(253,203,110,0.5)";
          }
          scoreEl.textContent = `Score: ${score}`;
          animFrame = requestAnimationFrame(gameLoop);
        }

        timerInterval = setInterval(() => {
          timeLeft--;
          timeEl.textContent = `⏱ ${timeLeft}s`;
          if (timeLeft % 5 === 0) {
            zoneCenter = 20 + Math.random() * 55;
            zone.style.top = `${zoneCenter - 12}%`;
          }
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            cancelAnimationFrame(animFrame);
            document.getElementById("tg-hydro-hint").innerHTML = `<span style="color:#ffeaa7;font-size:16px;font-weight:700;">🎉 Exercise Complete! Score: ${score}</span>`;
          }
        }, 1000);

        animFrame = requestAnimationFrame(gameLoop);
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 3. CRYOTHERAPY — Ice Application Timer Game
    // ═══════════════════════════════════════════════════════════════════
    th_cryo: {
      title: "🧊 Cryotherapy Application Guide",
      type: "game",
      description: "Apply ice at the right timing! Hold the ice on the injury for 20 minutes, then rest for 20 minutes. Follow the RICE protocol.",
      render: (container) => {
        let phase = "apply"; // apply | rest
        let seconds = 0;
        let targetSeconds = 20; // Shortened for game (represents 20 min)
        let cycles = 0;
        let maxCycles = 3;
        let isHolding = false;
        let interval;
        let totalScore = 0;

        function renderCryo() {
          const progress = Math.min((seconds / targetSeconds) * 100, 100);
          const tempDisplay = phase === "apply" ? Math.max(-5, 15 - (seconds * 1.0)).toFixed(1) : (15 + seconds * 0.5).toFixed(1);
          
          container.innerHTML = `
            <div class="tg-game-area" style="position:relative;width:100%;max-width:420px;height:400px;margin:0 auto;background:linear-gradient(135deg,${phase === "apply" ? "#0a1628,#1a2a4e" : "#1a0a0a,#4e1a1a"});border-radius:20px;overflow:hidden;user-select:none;">
              <div class="tg-hud" style="display:flex;justify-content:space-between;padding:12px 18px;color:#fff;font-size:14px;font-weight:600;">
                <span>Cycle ${cycles + 1}/${maxCycles}</span>
                <span>Score: ${totalScore}</span>
              </div>
              <div style="text-align:center;padding:10px;">
                <div style="font-size:48px;margin:10px 0;">${phase === "apply" ? "🧊" : "⏸️"}</div>
                <div style="color:#fff;font-size:20px;font-weight:700;">${phase === "apply" ? "APPLY ICE" : "REST PERIOD"}</div>
                <div style="color:#81ecec;font-size:14px;margin-top:4px;">${phase === "apply" ? "Hold down the button to apply cold" : "Release and let tissue recover"}</div>
              </div>
              <!-- Temperature display -->
              <div style="text-align:center;margin:10px 0;">
                <span style="color:${phase === "apply" ? "#74b9ff" : "#ff7675"};font-size:36px;font-weight:800;">${tempDisplay}°C</span>
              </div>
              <!-- Progress bar -->
              <div style="margin:10px 30px;">
                <div style="background:#ffffff15;border-radius:10px;height:18px;overflow:hidden;">
                  <div style="width:${progress}%;height:100%;background:linear-gradient(90deg,${phase === "apply" ? "#74b9ff,#0984e3" : "#ff7675,#d63031"});border-radius:10px;transition:width 0.3s;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;color:#aaa;font-size:12px;margin-top:4px;">
                  <span>${seconds}s</span><span>${targetSeconds}s target</span>
                </div>
              </div>
              <!-- Action button -->
              <div style="text-align:center;margin-top:20px;">
                <button id="tg-cryo-btn" style="padding:16px 40px;border-radius:50px;border:none;font-size:16px;font-weight:700;cursor:pointer;background:${phase === "apply" ? "linear-gradient(135deg,#74b9ff,#0984e3)" : "linear-gradient(135deg,#ff7675,#d63031)"};color:#fff;box-shadow:0 4px 20px ${phase === "apply" ? "#0984e340" : "#d6303140"};transition:transform 0.1s;">
                  ${phase === "apply" ? "🧊 Hold to Apply Ice" : "☀️ Click When Ready"}
                </button>
              </div>
              <div style="text-align:center;color:#636e72;font-size:11px;margin-top:12px;">RICE Protocol: Rest, Ice, Compression, Elevation</div>
            </div>
          `;

          const btn = document.getElementById("tg-cryo-btn");
          
          if (phase === "apply") {
            btn.addEventListener("mousedown", () => { isHolding = true; startTimer(); });
            btn.addEventListener("mouseup", () => { isHolding = false; pauseTimer(); });
            btn.addEventListener("touchstart", (e) => { e.preventDefault(); isHolding = true; startTimer(); });
            btn.addEventListener("touchend", () => { isHolding = false; pauseTimer(); });
          } else {
            btn.addEventListener("click", () => {
              seconds = 0;
              phase = "apply";
              renderCryo();
            });
          }
        }

        function startTimer() {
          if (interval) return;
          interval = setInterval(() => {
            if (!isHolding) return;
            seconds++;
            if (seconds >= targetSeconds) {
              clearInterval(interval);
              interval = null;
              totalScore += 100;
              cycles++;
              if (cycles >= maxCycles) {
                container.querySelector(".tg-game-area").innerHTML = `
                  <div style="text-align:center;padding:60px 20px;color:#fff;">
                    <div style="font-size:64px;margin-bottom:16px;">🎉</div>
                    <h3 style="font-size:22px;margin-bottom:8px;">Cryotherapy Complete!</h3>
                    <p style="color:#81ecec;font-size:16px;">All ${maxCycles} cycles finished. Score: ${totalScore}</p>
                    <p style="color:#636e72;margin-top:12px;font-size:13px;">Remember: Apply ice for 20 min, rest 20 min. Never directly on skin.</p>
                  </div>
                `;
              } else {
                seconds = 0;
                phase = "rest";
                renderCryo();
              }
            } else {
              renderCryo();
            }
          }, 200);
        }

        function pauseTimer() {
          clearInterval(interval);
          interval = null;
        }

        renderCryo();
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 4. HEAT THERAPY — Temperature Control
    // ═══════════════════════════════════════════════════════════════════
    th_heat: {
      title: "🔥 Heat Therapy Instructions",
      type: "instructions",
      steps: [
        { icon: "🌡️", title: "Check Temperature", detail: "Ensure the hot pack or heating pad is between 40-45°C (104-113°F). Never apply directly to bare skin — always use a towel or cloth barrier." },
        { icon: "🎯", title: "Target the Area", detail: "Place the heat source on the stiff or sore area. Common targets: lower back, shoulders, neck, hips. Ensure full contact with the affected region." },
        { icon: "⏱️", title: "Time Application", detail: "Apply heat for 15-20 minutes per session. Set a timer. Do NOT fall asleep with a heating pad on — risk of burns." },
        { icon: "🔄", title: "Alternate if Needed", detail: "For chronic conditions, you may alternate heat and cold (contrast therapy): 3 min heat → 1 min cold → repeat 3 times." },
        { icon: "📋", title: "Post-Application", detail: "After removing heat, gently stretch the warmed muscles. The increased blood flow and elasticity make this the ideal time for gentle ROM exercises." },
        { icon: "⚠️", title: "Contraindications", detail: "Do NOT use on: acute injuries (first 48h), open wounds, areas with poor sensation, over malignancies, or during active hemorrhage." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 5. TENS THERAPY — Electrode Placement Guide
    // ═══════════════════════════════════════════════════════════════════
    th_tens: {
      title: "⚡ TENS Electrode Placement Game",
      type: "game",
      description: "Place the TENS electrodes on the correct body locations for each pain scenario. Accurate placement is key for effective pain relief!",
      render: (container) => {
        const scenarios = [
          { pain: "Lower Back Pain", correct: [{ x: 40, y: 42 }, { x: 60, y: 42 }], area: "lumbar" },
          { pain: "Knee Pain", correct: [{ x: 42, y: 72 }, { x: 58, y: 72 }], area: "knee" },
          { pain: "Neck Pain", correct: [{ x: 44, y: 16 }, { x: 56, y: 16 }], area: "cervical" },
          { pain: "Shoulder Pain", correct: [{ x: 34, y: 22 }, { x: 34, y: 30 }], area: "shoulder" },
        ];
        let currentScenario = 0;
        let placedElectrodes = [];
        let score = 0;

        function renderTENS() {
          const scenario = scenarios[currentScenario];
          container.innerHTML = `
            <div class="tg-game-area" style="position:relative;width:100%;max-width:420px;height:440px;margin:0 auto;background:linear-gradient(135deg,#1a0a2e,#2d1b4e);border-radius:20px;overflow:hidden;">
              <div class="tg-hud" style="display:flex;justify-content:space-between;padding:12px 18px;color:#fff;font-size:14px;font-weight:600;">
                <span>Scenario ${currentScenario + 1}/${scenarios.length}</span>
                <span>Score: ${score}</span>
              </div>
              <div style="text-align:center;color:#a29bfe;font-size:16px;font-weight:600;padding:4px;">
                📍 ${scenario.pain} — Place 2 Electrodes
              </div>
              <svg viewBox="0 0 100 100" style="width:100%;height:340px;cursor:crosshair;" id="tg-tens-svg">
                <!-- Body outline -->
                <ellipse cx="50" cy="10" rx="5" ry="6" fill="#445" stroke="#667" stroke-width="0.5"/>
                <line x1="50" y1="16" x2="50" y2="55" stroke="#556" stroke-width="2.5"/>
                <line x1="50" y1="22" x2="30" y2="40" stroke="#556" stroke-width="1.8"/>
                <line x1="50" y1="22" x2="70" y2="40" stroke="#556" stroke-width="1.8"/>
                <line x1="50" y1="55" x2="38" y2="80" stroke="#556" stroke-width="2"/>
                <line x1="50" y1="55" x2="62" y2="80" stroke="#556" stroke-width="2"/>
                <line x1="38" y1="80" x2="35" y2="92" stroke="#556" stroke-width="1.5"/>
                <line x1="62" y1="80" x2="65" y2="92" stroke="#556" stroke-width="1.5"/>
                <!-- Placed electrodes -->
                ${placedElectrodes.map((e, i) => `
                  <rect x="${e.x - 2.5}" y="${e.y - 2}" rx="1" ry="1" width="5" height="4" fill="#fdcb6e" stroke="#f39c12" stroke-width="0.5" opacity="0.9"/>
                  <text x="${e.x}" y="${e.y + 0.8}" text-anchor="middle" fill="#2d3436" font-size="2.5" font-weight="700">E${i + 1}</text>
                `).join("")}
              </svg>
              <div id="tg-tens-feedback" style="text-align:center;color:#dfe6e9;font-size:13px;padding:4px;">Click on the body to place electrodes</div>
            </div>
          `;

          const svg = document.getElementById("tg-tens-svg");
          svg.addEventListener("click", (e) => {
            if (placedElectrodes.length >= 2) return;
            const rect = svg.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            placedElectrodes.push({ x, y });

            if (placedElectrodes.length === 2) {
              // Check accuracy
              let totalDist = 0;
              scenario.correct.forEach((c, i) => {
                const placed = placedElectrodes[i];
                totalDist += Math.sqrt((c.x - placed.x) ** 2 + (c.y - placed.y) ** 2);
              });
              const accuracy = Math.max(0, 100 - totalDist);
              const points = Math.round(accuracy);
              score += points;

              const fb = document.getElementById("tg-tens-feedback");
              if (accuracy > 70) {
                fb.innerHTML = `<span style="color:#55efc4;">✅ Excellent placement! +${points} pts</span>`;
              } else if (accuracy > 40) {
                fb.innerHTML = `<span style="color:#ffeaa7;">⚠️ Decent placement. +${points} pts</span>`;
              } else {
                fb.innerHTML = `<span style="color:#ff7675;">❌ Off target. +${points} pts. Try to place closer to the pain area.</span>`;
              }

              setTimeout(() => {
                currentScenario++;
                placedElectrodes = [];
                if (currentScenario >= scenarios.length) {
                  container.querySelector(".tg-game-area").innerHTML = `
                    <div style="text-align:center;padding:60px 20px;color:#fff;">
                      <div style="font-size:64px;margin-bottom:16px;">⚡</div>
                      <h3 style="font-size:22px;">TENS Placement Complete!</h3>
                      <p style="color:#a29bfe;font-size:16px;margin-top:8px;">Total Score: ${score}</p>
                      <p style="color:#636e72;margin-top:12px;font-size:13px;">Key principle: Place electrodes surrounding the pain area, parallel to nerve fibers, 2-4 inches apart.</p>
                    </div>
                  `;
                } else {
                  renderTENS();
                }
              }, 1800);
            } else {
              renderTENS();
            }
          });
        }

        renderTENS();
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 6. THERAPEUTIC ULTRASOUND — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_ultrasound: {
      title: "🔊 Therapeutic Ultrasound Guide",
      type: "instructions",
      steps: [
        { icon: "🧴", title: "Apply Coupling Gel", detail: "Apply a generous amount of ultrasound coupling gel to the treatment area. This eliminates air gaps and ensures sound wave transmission into tissue." },
        { icon: "📐", title: "Select Parameters", detail: "Continuous mode (1 MHz) for deep tissues (3-5 cm). Pulsed mode (3 MHz) for superficial structures (1-2 cm). Intensity: 0.5-2.0 W/cm²." },
        { icon: "🔄", title: "Circular Motion", detail: "Move the transducer head in slow, overlapping circular motions at 4 cm/s. NEVER hold stationary — this causes tissue hotspots and potential burns." },
        { icon: "⏱️", title: "Duration", detail: "Treat each area for 5-10 minutes per session. Total treatment time depends on the area size: approximately 1-2 min per treatment area the size of the sound head." },
        { icon: "📅", title: "Frequency", detail: "Typically 2-3 sessions per week for 4-6 weeks. Reassess at 2-week intervals for progress and adjust intensity/duration as needed." },
        { icon: "⚠️", title: "Avoid These Areas", detail: "Never apply over: eyes, brain, heart, reproductive organs, growth plates in children, malignant tumors, active infections, or pregnant uterus." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 7. THERAPEUTIC MASSAGE — Pressure Control Game
    // ═══════════════════════════════════════════════════════════════════
    th_massage: {
      title: "💆 Massage Pressure Game",
      type: "game",
      description: "Apply the right massage pressure! Hold and release to match the target pressure wave. Too hard or too soft reduces your score.",
      render: (container) => {
        let pressure = 0;
        let targetPressure = 50;
        let score = 0;
        let timeLeft = 25;
        let isPressed = false;
        let interval, timer;

        container.innerHTML = `
          <div class="tg-game-area" style="position:relative;width:100%;max-width:420px;height:380px;margin:0 auto;background:linear-gradient(135deg,#2d1b69,#1a0a3e);border-radius:20px;overflow:hidden;user-select:none;">
            <div class="tg-hud" style="display:flex;justify-content:space-between;padding:12px 18px;color:#fff;font-size:14px;font-weight:600;">
              <span id="tg-mass-time">⏱ 25s</span>
              <span id="tg-mass-score">Score: 0</span>
            </div>
            <div style="text-align:center;color:#e8d5ff;font-size:14px;margin-top:8px;">Match the target pressure level</div>
            <!-- Pressure meter -->
            <div style="display:flex;align-items:center;justify-content:center;gap:30px;margin-top:20px;height:200px;">
              <!-- Target gauge -->
              <div style="text-align:center;">
                <div style="color:#a29bfe;font-size:12px;margin-bottom:6px;">TARGET</div>
                <div style="width:40px;height:180px;background:#ffffff10;border-radius:20px;position:relative;overflow:hidden;">
                  <div id="tg-mass-target" style="position:absolute;bottom:0;width:100%;background:linear-gradient(180deg,#a29bfe,#6c5ce7);border-radius:20px;transition:height 0.5s;"></div>
                </div>
              </div>
              <!-- Your gauge -->
              <div style="text-align:center;">
                <div style="color:#55efc4;font-size:12px;margin-bottom:6px;">YOUR PRESSURE</div>
                <div style="width:40px;height:180px;background:#ffffff10;border-radius:20px;position:relative;overflow:hidden;">
                  <div id="tg-mass-yours" style="position:absolute;bottom:0;width:100%;background:linear-gradient(180deg,#55efc4,#00b894);border-radius:20px;transition:height 0.15s;"></div>
                </div>
              </div>
              <!-- Match indicator -->
              <div id="tg-mass-match" style="font-size:32px;width:50px;text-align:center;">🎯</div>
            </div>
            <div style="text-align:center;margin-top:16px;">
              <button id="tg-mass-btn" style="padding:18px 50px;border-radius:50px;border:none;font-size:16px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#a29bfe,#6c5ce7);color:#fff;box-shadow:0 4px 20px #6c5ce740;">
                💆 Hold to Apply Pressure
              </button>
            </div>
          </div>
        `;

        const targetEl = document.getElementById("tg-mass-target");
        const yoursEl = document.getElementById("tg-mass-yours");
        const matchEl = document.getElementById("tg-mass-match");
        const timeEl = document.getElementById("tg-mass-time");
        const scoreEl = document.getElementById("tg-mass-score");
        const btn = document.getElementById("tg-mass-btn");

        function updateTarget() {
          targetPressure = 20 + Math.random() * 60;
          targetEl.style.height = `${targetPressure}%`;
        }
        updateTarget();

        interval = setInterval(() => {
          if (isPressed) {
            pressure = Math.min(100, pressure + 3);
          } else {
            pressure = Math.max(0, pressure - 2);
          }
          yoursEl.style.height = `${pressure}%`;

          const diff = Math.abs(pressure - targetPressure);
          if (diff < 8) {
            matchEl.textContent = "✅";
            score += 2;
          } else if (diff < 20) {
            matchEl.textContent = "🟡";
            score += 1;
          } else {
            matchEl.textContent = "❌";
          }
          scoreEl.textContent = `Score: ${score}`;
        }, 100);

        timer = setInterval(() => {
          timeLeft--;
          timeEl.textContent = `⏱ ${timeLeft}s`;
          if (timeLeft % 4 === 0) updateTarget();
          if (timeLeft <= 0) {
            clearInterval(interval);
            clearInterval(timer);
            container.querySelector(".tg-game-area").innerHTML = `
              <div style="text-align:center;padding:60px 20px;color:#fff;">
                <div style="font-size:64px;margin-bottom:16px;">💆</div>
                <h3 style="font-size:22px;">Massage Session Complete!</h3>
                <p style="color:#a29bfe;font-size:16px;margin-top:8px;">Score: ${score}</p>
                <p style="color:#636e72;margin-top:12px;font-size:13px;">Key techniques: Effleurage (long strokes), Petrissage (kneading), Friction (deep circular), Tapotement (rhythmic tapping).</p>
              </div>
            `;
          }
        }, 1000);

        btn.addEventListener("mousedown", () => isPressed = true);
        btn.addEventListener("mouseup", () => isPressed = false);
        btn.addEventListener("touchstart", (e) => { e.preventDefault(); isPressed = true; });
        btn.addEventListener("touchend", () => isPressed = false);
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 8. MANUAL THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_manual: {
      title: "🤲 Manual Therapy / Mobilization Guide",
      type: "instructions",
      steps: [
        { icon: "🔍", title: "Assessment", detail: "Assess the joint's accessory movement using Maitland grading (I-V). Identify hypomobile segments through passive physiological and accessory movement testing." },
        { icon: "📐", title: "Patient Positioning", detail: "Position the patient to relax the surrounding musculature. The joint should be accessible with the patient comfortable. Stabilize proximal segment." },
        { icon: "🤲", title: "Grade I-II Mobilization", detail: "Small amplitude rhythmic oscillations at the beginning (Grade I) or mid-range (Grade II) for pain relief. Use 2-3 sets of 30-60 second oscillations." },
        { icon: "💪", title: "Grade III-IV Mobilization", detail: "Large amplitude oscillations reaching end-range (Grade III) or small amplitude at end-range (Grade IV) for improving mobility. 3-5 sets of 30 seconds." },
        { icon: "⚡", title: "Grade V (Manipulation)", detail: "High-velocity, low-amplitude thrust at end-range. Requires informed consent. Often produces an audible 'pop' (cavitation). Perform only with proper certification." },
        { icon: "📝", title: "Reassess", detail: "Immediately reassess range of motion and pain after each technique. Progress or modify based on response. Document pre and post measurements." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 9. SPINAL TRACTION — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_traction: {
      title: "🦴 Spinal Traction Guide",
      type: "instructions",
      steps: [
        { icon: "📋", title: "Pre-Treatment Assessment", detail: "Review imaging (X-ray/MRI). Contraindications: spinal instability, tumors, osteoporosis, pregnancy, acute disc herniation with neurological deficit. Get informed consent." },
        { icon: "🛏️", title: "Patient Setup", detail: "Cervical: supine with head in halter. Lumbar: supine with harness around pelvis and thorax. Ensure comfort with pillow under knees for lumbar traction." },
        { icon: "⚖️", title: "Set Parameters", detail: "Cervical: start at 10-15 lbs, max 30 lbs (10-12% body weight). Lumbar: start at 25% body weight, may progress to 50%. Static or intermittent (30s on / 10s off)." },
        { icon: "⏱️", title: "Duration", detail: "Initial session: 8-10 minutes. Progress to 15-20 minutes as tolerated. Monitor patient throughout for symptom changes. Stop if pain increases or neurological symptoms appear." },
        { icon: "📈", title: "Progression", detail: "Increase force by 2-5 lbs per session as tolerated. Typical course: 10-15 sessions over 4-6 weeks. Combine with core strengthening program." },
        { icon: "🚶", title: "Post-Treatment", detail: "Release traction slowly (30 seconds). Have patient rest supine for 5 minutes. Avoid heavy lifting for 24 hours. Apply lumbar support belt if needed." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 10. SPLINTING — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_splint: {
      title: "🩹 Splinting / Immobilization Guide",
      type: "instructions",
      steps: [
        { icon: "🔍", title: "Assess the Injury", detail: "Determine the type and location of injury. Check neurovascular status (pulses, sensation, motor function) distally before and after applying the splint." },
        { icon: "📐", title: "Select Splint Type", detail: "Volar splint: wrist/forearm fractures. Sugar tong: elbow fractures. Ulnar gutter: 4th/5th metacarpal fractures. Thumb spica: scaphoid/thumb injuries. Posterior: ankle fractures." },
        { icon: "🧵", title: "Prepare Materials", detail: "Measure and cut plaster/fiberglass to appropriate length (joint above and below injury). Apply stockinette first, then padding (2-3 layers), especially over bony prominences." },
        { icon: "🤲", title: "Apply & Mold", detail: "Wet plaster in lukewarm water, squeeze out excess. Apply and smooth out wrinkles. Mold the splint to maintain the position of function. Hold until set (5-10 min)." },
        { icon: "✅", title: "Post-Application Check", detail: "Recheck neurovascular status. Ensure no pressure points. Fingers/toes should be warm, pink, with capillary refill < 2 seconds. Patient should be able to wiggle digits." },
        { icon: "📋", title: "Patient Education", detail: "Elevate above heart level. Ice over splint (with plastic bag). Watch for: increasing pain, numbness, blueness, swelling beyond splint edges. Follow up in 24-48 hours." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 11. COMPRESSION THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_compression: {
      title: "🧦 Compression Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "📊", title: "Select Compression Class", detail: "Class 1 (14-17 mmHg): mild edema. Class 2 (18-24 mmHg): moderate edema/varicose veins. Class 3 (25-35 mmHg): severe edema/DVT prevention. Class 4 (>35 mmHg): lymphedema." },
        { icon: "🌅", title: "Apply in the Morning", detail: "Apply compression before getting out of bed or after elevating the limb for 15 minutes. This ensures minimal swelling for proper fit. Use rubber gloves for grip." },
        { icon: "🔄", title: "Application Technique", detail: "Roll the stocking inside-out to the toe. Slip over the foot and gradually unroll up the leg. Ensure smooth, even distribution with no wrinkles or bunching." },
        { icon: "⏰", title: "Wearing Schedule", detail: "Wear during waking hours (12-16 hours). Remove before sleeping unless specifically instructed otherwise. Replace stockings every 3-6 months when elasticity decreases." },
        { icon: "👀", title: "Monitor Skin", detail: "Check skin daily for: redness, irritation, pressure marks, blistering, or color changes. Moisturize legs before bed (not before applying stockings). Report skin breaks immediately." },
        { icon: "⚠️", title: "When to Stop", detail: "Remove immediately if: severe pain, numbness/tingling, skin color changes (blue/white), excessive swelling above the stocking, or allergic reaction to material." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 12. ELEVATION THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_elevation: {
      title: "⬆️ Elevation Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "📐", title: "Proper Height", detail: "Elevate the injured limb ABOVE the level of the heart. For lower extremity: use 2-3 pillows. For upper extremity: use a sling or place arm on stacked pillows." },
        { icon: "⏱️", title: "Duration", detail: "Elevate for 20-30 minutes every 2-3 hours during the first 48-72 hours after injury. Continuous elevation during rest and sleep is recommended in the acute phase." },
        { icon: "🛏️", title: "Sleeping Position", detail: "For leg injuries: place pillows under the entire leg from knee to ankle. For arm injuries: sleep semi-reclined with arm on pillow at or above chest level." },
        { icon: "🔄", title: "Combine with RICE", detail: "Elevation works best as part of the RICE protocol: Rest the injury, Ice for 20 min/session, Compress with an elastic bandage, and Elevate above heart level." },
        { icon: "💡", title: "Active Elevation", detail: "While elevated, gently pump the ankle (foot circles) or make a fist and release to promote venous return. This active muscle pumping enhances the drainage effect." },
        { icon: "📈", title: "Progression", detail: "As swelling decreases (usually day 3-5), gradually reduce elevation time. Transition to intermittent elevation during rest periods while increasing gentle mobility." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 13. RANGE OF MOTION EXERCISES — Interactive Game
    // ═══════════════════════════════════════════════════════════════════
    th_rom: {
      title: "🔄 Range of Motion Challenge",
      type: "game",
      description: "Trace the arc of motion! Drag the joint through its full range to score points. Smooth, controlled movement scores higher.",
      render: (container) => {
        let currentJoint = 0;
        let score = 0;
        const joints = [
          { name: "Shoulder Flexion", startAngle: 0, endAngle: 180, cx: 200, cy: 120, r: 80, color: "#74b9ff" },
          { name: "Elbow Flexion", startAngle: 0, endAngle: 145, cx: 200, cy: 140, r: 70, color: "#55efc4" },
          { name: "Wrist Extension", startAngle: -70, endAngle: 70, cx: 200, cy: 160, r: 50, color: "#ffeaa7" },
          { name: "Knee Flexion", startAngle: 0, endAngle: 135, cx: 200, cy: 170, r: 75, color: "#fd79a8" },
        ];

        function renderROM() {
          if (currentJoint >= joints.length) {
            container.innerHTML = `
              <div class="tg-game-area" style="width:100%;max-width:420px;height:380px;margin:0 auto;background:linear-gradient(135deg,#0a2e1a,#1a4e2d);border-radius:20px;display:flex;align-items:center;justify-content:center;flex-direction:column;">
                <div style="font-size:64px;margin-bottom:16px;">🏆</div>
                <h3 style="color:#fff;font-size:22px;">ROM Exercises Complete!</h3>
                <p style="color:#55efc4;font-size:16px;margin-top:8px;">Total Score: ${score}</p>
                <p style="color:#636e72;margin-top:12px;font-size:13px;max-width:300px;text-align:center;">Remember: Move slowly through full range, hold at end-range for 2 seconds, perform 10 repetitions each direction.</p>
              </div>
            `;
            return;
          }

          const joint = joints[currentJoint];
          let traceProgress = 0;
          let isDragging = false;

          container.innerHTML = `
            <div class="tg-game-area" style="position:relative;width:100%;max-width:420px;height:400px;margin:0 auto;background:linear-gradient(135deg,#0a1e0a,#1a3e1a);border-radius:20px;overflow:hidden;">
              <div class="tg-hud" style="display:flex;justify-content:space-between;padding:12px 18px;color:#fff;font-size:14px;font-weight:600;">
                <span>Joint ${currentJoint + 1}/${joints.length}</span>
                <span>Score: ${score}</span>
              </div>
              <div style="text-align:center;color:${joint.color};font-size:18px;font-weight:600;padding:8px;">
                ${joint.name} (${joint.endAngle}°)
              </div>
              <canvas id="tg-rom-canvas" width="400" height="280" style="width:100%;cursor:grab;"></canvas>
              <div style="text-align:center;padding:8px;">
                <div style="background:#ffffff15;border-radius:10px;height:12px;margin:0 30px;overflow:hidden;">
                  <div id="tg-rom-progress" style="width:0%;height:100%;background:${joint.color};border-radius:10px;transition:width 0.2s;"></div>
                </div>
                <div style="color:#aaa;font-size:12px;margin-top:4px;" id="tg-rom-label">Click and drag to trace the arc</div>
              </div>
            </div>
          `;

          const canvas = document.getElementById("tg-rom-canvas");
          const ctx = canvas.getContext("2d");
          const progressBar = document.getElementById("tg-rom-progress");
          const label = document.getElementById("tg-rom-label");

          function drawArc() {
            ctx.clearRect(0, 0, 400, 280);
            // Draw target arc
            ctx.beginPath();
            ctx.strokeStyle = joint.color + "40";
            ctx.lineWidth = 12;
            ctx.arc(joint.cx, joint.cy, joint.r, (joint.startAngle * Math.PI) / 180, (joint.endAngle * Math.PI) / 180);
            ctx.stroke();

            // Draw completed arc
            const currentAngle = joint.startAngle + (joint.endAngle - joint.startAngle) * traceProgress;
            ctx.beginPath();
            ctx.strokeStyle = joint.color;
            ctx.lineWidth = 12;
            ctx.arc(joint.cx, joint.cy, joint.r, (joint.startAngle * Math.PI) / 180, (currentAngle * Math.PI) / 180);
            ctx.stroke();

            // Draw handle
            const handleAngle = (currentAngle * Math.PI) / 180;
            const hx = joint.cx + joint.r * Math.cos(handleAngle);
            const hy = joint.cy + joint.r * Math.sin(handleAngle);
            ctx.beginPath();
            ctx.arc(hx, hy, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.strokeStyle = joint.color;
            ctx.lineWidth = 3;
            ctx.stroke();
          }

          drawArc();

          function handleMove(clientX, clientY) {
            if (!isDragging) return;
            const rect = canvas.getBoundingClientRect();
            const mx = ((clientX - rect.left) / rect.width) * 400;
            const my = ((clientY - rect.top) / rect.height) * 280;
            const angle = Math.atan2(my - joint.cy, mx - joint.cx) * (180 / Math.PI);
            const range = joint.endAngle - joint.startAngle;
            let normalized = ((angle - joint.startAngle) / range);
            normalized = Math.max(0, Math.min(1, normalized));
            if (normalized > traceProgress) {
              traceProgress = normalized;
            }
            progressBar.style.width = `${traceProgress * 100}%`;
            drawArc();

            if (traceProgress >= 0.95) {
              isDragging = false;
              const points = Math.round(traceProgress * 100);
              score += points;
              label.innerHTML = `<span style="color:${joint.color}">✅ ${joint.name} complete! +${points} pts</span>`;
              setTimeout(() => {
                currentJoint++;
                renderROM();
              }, 1200);
            }
          }

          canvas.addEventListener("mousedown", () => isDragging = true);
          canvas.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
          canvas.addEventListener("mouseup", () => isDragging = false);
          canvas.addEventListener("touchstart", (e) => { e.preventDefault(); isDragging = true; });
          canvas.addEventListener("touchmove", (e) => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); });
          canvas.addEventListener("touchend", () => isDragging = false);
        }

        renderROM();
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 14. STRENGTHENING EXERCISES — Rep Counter Game
    // ═══════════════════════════════════════════════════════════════════
    th_strength: {
      title: "💪 Strengthening Reps Challenge",
      type: "game",
      description: "Complete exercise repetitions with proper form! Click in rhythm to perform each rep — match the target tempo for bonus points.",
      render: (container) => {
        const exercises = [
          { name: "Quad Sets", target: 10, icon: "🦵", tempo: 1200 },
          { name: "Straight Leg Raise", target: 8, icon: "🦿", tempo: 1500 },
          { name: "Wall Push-Ups", target: 10, icon: "🏋️", tempo: 1000 },
          { name: "Heel Raises", target: 12, icon: "🦶", tempo: 800 },
        ];
        let exIdx = 0;
        let reps = 0;
        let totalScore = 0;
        let lastClickTime = 0;

        function renderStrength() {
          if (exIdx >= exercises.length) {
            container.innerHTML = `
              <div class="tg-game-area" style="width:100%;max-width:420px;height:380px;margin:0 auto;background:linear-gradient(135deg,#1a2e0a,#2e4e1a);border-radius:20px;display:flex;align-items:center;justify-content:center;flex-direction:column;">
                <div style="font-size:64px;margin-bottom:16px;">💪</div>
                <h3 style="color:#fff;font-size:22px;">Workout Complete!</h3>
                <p style="color:#55efc4;font-size:16px;margin-top:8px;">Total Score: ${totalScore}</p>
                <p style="color:#636e72;margin-top:12px;font-size:13px;max-width:320px;text-align:center;">Progress: Start with 2 sets, build to 3 sets of each exercise. Increase resistance weekly as tolerated.</p>
              </div>
            `;
            return;
          }

          const ex = exercises[exIdx];
          container.innerHTML = `
            <div class="tg-game-area" style="position:relative;width:100%;max-width:420px;height:400px;margin:0 auto;background:linear-gradient(135deg,#0a2e1a,#0a1e2e);border-radius:20px;overflow:hidden;">
              <div class="tg-hud" style="display:flex;justify-content:space-between;padding:12px 18px;color:#fff;font-size:14px;font-weight:600;">
                <span>Exercise ${exIdx + 1}/${exercises.length}</span>
                <span>Score: ${totalScore}</span>
              </div>
              <div style="text-align:center;padding:20px;">
                <div style="font-size:64px;margin-bottom:10px;" id="tg-str-icon">${ex.icon}</div>
                <h3 style="color:#fff;font-size:22px;margin-bottom:4px;">${ex.name}</h3>
                <div style="color:#81ecec;font-size:14px;">Target: ${ex.target} reps · Tempo: ${(ex.tempo / 1000).toFixed(1)}s</div>
              </div>
              <div style="text-align:center;">
                <span style="font-size:72px;font-weight:800;color:#55efc4;" id="tg-str-count">${reps}</span>
                <span style="font-size:24px;color:#636e72;">/ ${ex.target}</span>
              </div>
              <div style="text-align:center;margin-top:24px;">
                <button id="tg-str-btn" style="width:100px;height:100px;border-radius:50%;border:4px solid #55efc4;background:rgba(85,239,196,0.15);cursor:pointer;font-size:32px;transition:transform 0.1s,background 0.1s;color:#fff;">
                  👊
                </button>
              </div>
              <div style="text-align:center;color:#636e72;font-size:12px;margin-top:10px;" id="tg-str-tempo">Tap in rhythm!</div>
            </div>
          `;

          const btn = document.getElementById("tg-str-btn");
          const countEl = document.getElementById("tg-str-count");
          const iconEl = document.getElementById("tg-str-icon");
          const tempoEl = document.getElementById("tg-str-tempo");

          btn.addEventListener("click", () => {
            const now = Date.now();
            const gap = now - lastClickTime;
            lastClickTime = now;

            reps++;
            countEl.textContent = reps;
            btn.style.transform = "scale(0.9)";
            iconEl.style.transform = "scale(1.2)";
            setTimeout(() => { btn.style.transform = "scale(1)"; iconEl.style.transform = "scale(1)"; }, 100);

            // Tempo scoring
            if (gap > 0 && gap < 5000) {
              const diff = Math.abs(gap - ex.tempo);
              if (diff < 200) {
                totalScore += 15;
                tempoEl.textContent = "🎯 Perfect tempo! +15";
                tempoEl.style.color = "#55efc4";
              } else if (diff < 500) {
                totalScore += 8;
                tempoEl.textContent = "👍 Good tempo! +8";
                tempoEl.style.color = "#ffeaa7";
              } else {
                totalScore += 3;
                tempoEl.textContent = "⏱ Watch your pace +3";
                tempoEl.style.color = "#ff7675";
              }
            }

            if (reps >= ex.target) {
              btn.disabled = true;
              tempoEl.innerHTML = `<span style="color:#55efc4;font-size:14px;font-weight:600;">✅ Set Complete!</span>`;
              setTimeout(() => {
                exIdx++;
                reps = 0;
                lastClickTime = 0;
                renderStrength();
              }, 1200);
            }
          });
        }

        renderStrength();
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 15. BALANCE & PROPRIOCEPTION — Balance Game
    // ═══════════════════════════════════════════════════════════════════
    th_balance: {
      title: "⚖️ Balance & Proprioception Trainer",
      type: "game",
      description: "Keep the balance ball centered on the platform! Use arrow keys or tilt buttons to counterbalance. Don't let it fall off!",
      render: (container) => {
        let ballX = 50;
        let ballVelX = 0;
        let platformTilt = 0;
        let score = 0;
        let timeLeft = 30;
        let animFrame, timer;

        container.innerHTML = `
          <div class="tg-game-area" style="position:relative;width:100%;max-width:440px;height:400px;margin:0 auto;background:linear-gradient(135deg,#0a0a2e,#1a1a4e);border-radius:20px;overflow:hidden;">
            <div class="tg-hud" style="display:flex;justify-content:space-between;padding:12px 18px;color:#fff;font-size:14px;font-weight:600;">
              <span id="tg-bal-time">⏱ 30s</span>
              <span id="tg-bal-score">Score: 0</span>
            </div>
            <canvas id="tg-bal-canvas" width="400" height="280" style="width:100%;"></canvas>
            <div style="display:flex;justify-content:center;gap:20px;padding:12px;">
              <button class="tg-bal-btn" id="tg-bal-left" style="padding:14px 28px;border-radius:12px;border:2px solid #74b9ff;background:rgba(116,185,255,0.15);color:#74b9ff;font-size:20px;cursor:pointer;font-weight:700;">⬅️ Tilt Left</button>
              <button class="tg-bal-btn" id="tg-bal-right" style="padding:14px 28px;border-radius:12px;border:2px solid #74b9ff;background:rgba(116,185,255,0.15);color:#74b9ff;font-size:20px;cursor:pointer;font-weight:700;">Tilt Right ➡️</button>
            </div>
          </div>
        `;

        const canvas = document.getElementById("tg-bal-canvas");
        const ctx = canvas.getContext("2d");
        const timeEl = document.getElementById("tg-bal-time");
        const scoreEl = document.getElementById("tg-bal-score");

        document.getElementById("tg-bal-left").addEventListener("mousedown", () => platformTilt = -0.3);
        document.getElementById("tg-bal-left").addEventListener("mouseup", () => platformTilt = 0);
        document.getElementById("tg-bal-left").addEventListener("touchstart", (e) => { e.preventDefault(); platformTilt = -0.3; });
        document.getElementById("tg-bal-left").addEventListener("touchend", () => platformTilt = 0);
        document.getElementById("tg-bal-right").addEventListener("mousedown", () => platformTilt = 0.3);
        document.getElementById("tg-bal-right").addEventListener("mouseup", () => platformTilt = 0);
        document.getElementById("tg-bal-right").addEventListener("touchstart", (e) => { e.preventDefault(); platformTilt = 0.3; });
        document.getElementById("tg-bal-right").addEventListener("touchend", () => platformTilt = 0);

        // Keyboard support
        document.addEventListener("keydown", (e) => {
          if (e.key === "ArrowLeft") platformTilt = -0.3;
          if (e.key === "ArrowRight") platformTilt = 0.3;
        });
        document.addEventListener("keyup", (e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") platformTilt = 0;
        });

        function gameLoop() {
          // Physics: random perturbation + tilt
          const perturbation = (Math.random() - 0.5) * 0.08;
          ballVelX += platformTilt + perturbation;
          ballVelX *= 0.96; // friction
          ballX += ballVelX;

          // Scoring
          if (Math.abs(ballX - 50) < 10) {
            score += 2;
            scoreEl.textContent = `Score: ${score}`;
          } else if (Math.abs(ballX - 50) < 25) {
            score += 1;
            scoreEl.textContent = `Score: ${score}`;
          }

          // Clamp
          if (ballX < 5 || ballX > 95) {
            ballX = 50;
            ballVelX = 0;
            score = Math.max(0, score - 20);
            scoreEl.textContent = `Score: ${score}`;
          }

          // Draw
          ctx.clearRect(0, 0, 400, 280);
          
          // Platform
          ctx.save();
          ctx.translate(200, 220);
          ctx.rotate(platformTilt * 0.3);
          ctx.fillStyle = "#445";
          ctx.fillRect(-150, -8, 300, 16);
          ctx.restore();

          // Center zone
          ctx.fillStyle = "rgba(85,239,196,0.2)";
          ctx.fillRect(160, 180, 80, 30);

          // Ball
          const bx = (ballX / 100) * 400;
          ctx.beginPath();
          ctx.arc(bx, 205, 15, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(bx - 4, 201, 2, bx, 205, 15);
          gradient.addColorStop(0, "#ffeaa7");
          gradient.addColorStop(1, "#fdcb6e");
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.strokeStyle = "#f39c12";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Labels
          ctx.fillStyle = "#55efc4";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Center Zone", 200, 175);

          animFrame = requestAnimationFrame(gameLoop);
        }

        timer = setInterval(() => {
          timeLeft--;
          timeEl.textContent = `⏱ ${timeLeft}s`;
          if (timeLeft <= 0) {
            clearInterval(timer);
            cancelAnimationFrame(animFrame);
            ctx.clearRect(0, 0, 400, 280);
            ctx.fillStyle = "#fff";
            ctx.font = "22px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`⚖️ Balance Training Complete!`, 200, 120);
            ctx.font = "16px sans-serif";
            ctx.fillStyle = "#55efc4";
            ctx.fillText(`Final Score: ${score}`, 200, 160);
            ctx.fillStyle = "#636e72";
            ctx.font = "13px sans-serif";
            ctx.fillText("Practice daily: single-leg stance, foam pad balance, perturbation training", 200, 200);
          }
        }, 1000);

        animFrame = requestAnimationFrame(gameLoop);
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 16. OCCUPATIONAL THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_occupational: {
      title: "🖐️ Occupational Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "📋", title: "Functional Assessment", detail: "Evaluate ability to perform Activities of Daily Living (ADLs): dressing, bathing, eating, grooming, toileting. Use standardized assessments like Barthel Index or FIM score." },
        { icon: "🖐️", title: "Fine Motor Skills", detail: "Practice: pinch grip strengthening with putty, button/zipper practice, writing exercises, coin manipulation, and key turning. Progress from large objects to small." },
        { icon: "🏠", title: "Home Modifications", detail: "Assess and recommend: grab bars in bathroom, raised toilet seat, long-handled reachers, non-slip mats, lever door handles, adapted utensils, and shower chairs." },
        { icon: "💼", title: "Workplace Ergonomics", detail: "Evaluate workstation setup: monitor at eye level, keyboard at elbow height, chair lumbar support, regular microbreaks every 30 minutes, anti-fatigue standing mats." },
        { icon: "🎯", title: "Adaptive Equipment", detail: "Introduce as needed: built-up handle utensils, plate guards, rocker knives, button hooks, sock aids, long-handled shoe horns, and universal cuffs." },
        { icon: "📈", title: "Progress & Goals", detail: "Set SMART goals with the patient. Track independence levels weekly. Gradually reduce assistive devices as function improves. Plan for community reintegration." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 17. SPEECH & SWALLOWING THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_speech: {
      title: "🗣️ Speech & Swallowing Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "🔍", title: "Baseline Assessment", detail: "Perform bedside swallowing assessment. Check gag reflex, tongue strength, lip closure, voice quality (wet/gurgly suggests aspiration). Order FEES/videofluoroscopy if needed." },
        { icon: "👅", title: "Oral Motor Exercises", detail: "Tongue strengthening: push against depressor (5 sec holds, 10 reps). Lip exercises: pucker/smile alternation. Jaw exercises: controlled opening against resistance." },
        { icon: "🥤", title: "Swallowing Techniques", detail: "Chin tuck: reduces aspiration risk. Supraglottic swallow: bear down, swallow, cough. Effortful swallow: squeeze hard while swallowing. Mendelsohn maneuver: hold larynx elevated." },
        { icon: "🍽️", title: "Diet Modifications", detail: "IDDSI Framework: Level 0 (thin liquids) through Level 7 (regular). Progress texture as swallowing improves. Thicken liquids with commercial thickeners if needed." },
        { icon: "🗣️", title: "Speech Exercises", detail: "Articulation drills with target sounds. Voice projection exercises: sustained vowels, pitch glides. Cognitive-linguistic tasks: word finding, sentence formulation, reading aloud." },
        { icon: "📝", title: "Home Program", detail: "Provide written exercise handout with illustrations. Recommend 3-5 practice sessions daily, 10-15 minutes each. Monitor for signs of aspiration: coughing during meals, wet voice, recurrent pneumonia." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 18. RESPIRATORY THERAPY — Breathing Game
    // ═══════════════════════════════════════════════════════════════════
    th_respiratory: {
      title: "🫁 Breathing Exercise Game",
      type: "game",
      description: "Follow the breathing pattern! Inhale when the circle expands, exhale when it contracts. Match the rhythm for maximum lung capacity training.",
      render: (container) => {
        let phase = "inhale";
        let size = 40;
        let targetSize = 40;
        let cycles = 0;
        let maxCycles = 6;
        let score = 0;
        let isHolding = false;
        let animFrame;

        container.innerHTML = `
          <div class="tg-game-area" style="position:relative;width:100%;max-width:420px;height:400px;margin:0 auto;background:linear-gradient(135deg,#0a2e3e,#0a1e2e);border-radius:20px;overflow:hidden;user-select:none;">
            <div class="tg-hud" style="display:flex;justify-content:space-between;padding:12px 18px;color:#fff;font-size:14px;font-weight:600;">
              <span>Cycle ${cycles + 1}/${maxCycles}</span>
              <span id="tg-resp-score">Score: ${score}</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;height:280px;flex-direction:column;">
              <div id="tg-resp-circle" style="width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle,#81ecec,#00b894);box-shadow:0 0 40px #00b89440;transition:width 0.3s,height 0.3s;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:28px;">🫁</span>
              </div>
              <div id="tg-resp-phase" style="color:#81ecec;font-size:20px;font-weight:700;margin-top:20px;">INHALE</div>
              <div style="color:#636e72;font-size:13px;margin-top:4px;" id="tg-resp-hint">Hold the button during inhale, release during exhale</div>
            </div>
            <div style="text-align:center;">
              <button id="tg-resp-btn" style="padding:16px 50px;border-radius:50px;border:none;background:linear-gradient(135deg,#81ecec,#00b894);color:#0a2e3e;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px #00b89440;">
                🫁 Hold to Inhale
              </button>
            </div>
          </div>
        `;

        const circle = document.getElementById("tg-resp-circle");
        const phaseEl = document.getElementById("tg-resp-phase");
        const scoreEl = document.getElementById("tg-resp-score");
        const btn = document.getElementById("tg-resp-btn");
        const hint = document.getElementById("tg-resp-hint");

        let phaseTimer = 0;
        const inhaleDuration = 4000; // 4 seconds inhale
        const exhaleDuration = 6000; // 6 seconds exhale (longer for therapeutic benefit)
        let phaseStart = Date.now();
        let currentPhaseDuration = inhaleDuration;

        function breatheLoop() {
          const elapsed = Date.now() - phaseStart;
          const progress = Math.min(elapsed / currentPhaseDuration, 1);

          if (phase === "inhale") {
            targetSize = 40 + 120 * progress;
            if (isHolding) score++;
          } else {
            targetSize = 160 - 120 * progress;
            if (!isHolding) score++;
          }

          circle.style.width = `${targetSize}px`;
          circle.style.height = `${targetSize}px`;
          scoreEl.textContent = `Score: ${score}`;

          if (progress >= 1) {
            if (phase === "inhale") {
              phase = "exhale";
              phaseEl.textContent = "EXHALE";
              phaseEl.style.color = "#ffeaa7";
              circle.style.background = "radial-gradient(circle,#ffeaa7,#fdcb6e)";
              currentPhaseDuration = exhaleDuration;
            } else {
              phase = "inhale";
              phaseEl.textContent = "INHALE";
              phaseEl.style.color = "#81ecec";
              circle.style.background = "radial-gradient(circle,#81ecec,#00b894)";
              currentPhaseDuration = inhaleDuration;
              cycles++;
              if (cycles >= maxCycles) {
                cancelAnimationFrame(animFrame);
                hint.innerHTML = `<span style="color:#55efc4;font-size:16px;font-weight:700;">🎉 Breathing Exercise Complete! Score: ${score}</span>`;
                phaseEl.textContent = "DONE!";
                return;
              }
            }
            phaseStart = Date.now();
          }

          animFrame = requestAnimationFrame(breatheLoop);
        }

        btn.addEventListener("mousedown", () => isHolding = true);
        btn.addEventListener("mouseup", () => isHolding = false);
        btn.addEventListener("touchstart", (e) => { e.preventDefault(); isHolding = true; });
        btn.addEventListener("touchend", () => isHolding = false);

        phaseStart = Date.now();
        animFrame = requestAnimationFrame(breatheLoop);
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 19. WOUND CARE — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_wound_care: {
      title: "🩹 Wound Care Management Guide",
      type: "instructions",
      steps: [
        { icon: "🧤", title: "Hand Hygiene & PPE", detail: "Wash hands thoroughly or use alcohol-based sanitizer. Don sterile/clean gloves. Use gown and face protection if wound is large or infected. Non-touch aseptic technique." },
        { icon: "🔍", title: "Wound Assessment", detail: "Document: size (L×W×D in cm), wound bed color (red=granulating, yellow=slough, black=necrotic), exudate amount/type, periwound skin condition, odor, signs of infection." },
        { icon: "🚿", title: "Cleansing", detail: "Irrigate with normal saline (0.9% NaCl) or clean water at low pressure. Use 30-60 mL syringe with 18-gauge tip. Clean from center outward. Temperature: body-warm solution." },
        { icon: "🗑️", title: "Debridement if Needed", detail: "Sharp debridement for necrotic tissue (by qualified practitioner only). Autolytic: moist wound healing with hydrogels. Enzymatic: collagenase ointment. Mechanical: wet-to-dry (use cautiously)." },
        { icon: "🩹", title: "Dressing Selection", detail: "Dry wounds: hydrogels/hydrocolloids (add moisture). Wet wounds: foams/alginates (absorb excess). Infected: silver dressings or iodine-based. Deep wounds: pack loosely, don't overfill." },
        { icon: "📋", title: "Documentation & Follow-up", detail: "Photo documentation at each visit. Measure wound size. Track healing trajectory (expect 20-40% reduction in 2 weeks). Change dressing per protocol: clean q24-72h, infected q8-24h." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 20. THROMBOLYTIC THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_thrombolysis: {
      title: "🚨 Thrombolytic Therapy Protocol",
      type: "instructions",
      steps: [
        { icon: "⏰", title: "Time is Critical", detail: "Stroke: tPA must be given within 4.5 hours of symptom onset. STEMI: within 12 hours. PE: for massive PE with hemodynamic instability. Document 'last known well' time precisely." },
        { icon: "📋", title: "Inclusion/Exclusion Check", detail: "Exclude: active bleeding, recent surgery (<14 days), stroke in past 3 months, blood pressure >185/110, INR >1.7, platelets <100,000, blood glucose <50. Get CT to rule out hemorrhagic stroke." },
        { icon: "💉", title: "Administration (tPA)", detail: "Alteplase 0.9 mg/kg (max 90mg): 10% as IV bolus over 1 min, remaining 90% infused over 60 minutes. Use dedicated IV line. No anticoagulants for 24 hours post-tPA." },
        { icon: "📊", title: "Monitoring", detail: "Neuro checks every 15 min during infusion, every 30 min for 6h, then hourly for 18h. Blood pressure monitoring every 15 minutes. Stop infusion if neurological decline occurs." },
        { icon: "⚠️", title: "Complications", detail: "Hemorrhagic transformation (6% risk): if suspected, stop infusion, urgent CT, check fibrinogen. Angioedema (1-5%): orolingual swelling, treat with epinephrine and antihistamines." },
        { icon: "📝", title: "Post-Procedure", detail: "No arterial punctures or NG tube for 24h. Repeat CT at 24 hours. Begin anticoagulation/antiplatelet per protocol at 24h if no hemorrhage. Document NIHSS score serially." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 21. ANTICOAGULATION THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_anticoag: {
      title: "💊 Anticoagulation Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "🎯", title: "Choose the Right Agent", detail: "Warfarin: for mechanical valves, INR-guided. DOACs (Rivaroxaban, Apixaban): for DVT/PE, AF. Heparin: for acute events, bridge therapy. LMWH (Enoxaparin): DVT prophylaxis. Consider renal function." },
        { icon: "📊", title: "INR Monitoring (Warfarin)", detail: "Target INR: 2.0-3.0 for most indications, 2.5-3.5 for mechanical mitral valve. Check INR at least weekly until stable, then every 4 weeks. Adjust dose by 10-15% for out-of-range values." },
        { icon: "🍽️", title: "Dietary Counseling (Warfarin)", detail: "Maintain consistent vitamin K intake (don't eliminate leafy greens, just be consistent). Avoid: excessive alcohol, cranberry juice. Report any dietary changes to your provider." },
        { icon: "⚠️", title: "Bleeding Precautions", detail: "Use electric razor (no blades). Soft-bristle toothbrush. Avoid contact sports. Report: prolonged bleeding, blood in urine/stool, unexplained bruising, severe headache." },
        { icon: "💊", title: "Drug Interactions", detail: "Common interactions: NSAIDs (↑bleeding), antibiotics (alter INR), herbal supplements (ginkgo, garlic). Always consult before starting any new medication. Wear medical alert ID." },
        { icon: "🆘", title: "Reversal Agents", detail: "Warfarin: Vitamin K (oral/IV) + FFP or 4-factor PCC. Heparin: Protamine sulfate. Rivaroxaban: Andexanet alfa. Apixaban: Andexanet alfa. Dabigatran: Idarucizumab. Know location of nearest ED." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 22. INSULIN THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_insulin: {
      title: "💉 Insulin Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "📊", title: "Blood Glucose Monitoring", detail: "Check fasting glucose (target: 80-130 mg/dL), pre-meal, and bedtime (target: <180 mg/dL). Keep a log. HbA1c target: <7% for most adults. Check HbA1c every 3 months." },
        { icon: "💉", title: "Injection Technique", detail: "Sites: abdomen (fastest absorption), thighs, upper arms, buttocks. Rotate sites within each area (2 cm apart). Pinch skin, insert at 90° (45° for thin patients). Hold for 10 seconds after injection." },
        { icon: "📏", title: "Dose Calculation", detail: "Basal insulin (Glargine/Detemir): start 10 units or 0.2 U/kg/day. Increase by 2 units every 3 days until fasting glucose at target. Bolus insulin: calculate correction factor (1500 rule for rapid)." },
        { icon: "🍽️", title: "Carbohydrate Counting", detail: "Learn to count carbs (1 serving = 15g carbs). Insulin-to-carb ratio (commonly 1:10-1:15). Adjust bolus based on meal content. Consistent meal timing helps maintain stable glucose." },
        { icon: "⚠️", title: "Hypoglycemia Management", detail: "Symptoms: shakiness, sweating, confusion, rapid heartbeat. Rule of 15: eat 15g fast-acting carbs (4 glucose tabs, 4 oz juice), wait 15 min, recheck. If <54 mg/dL: use glucagon emergency kit." },
        { icon: "🗄️", title: "Storage & Supplies", detail: "Unopened insulin: refrigerate (2-8°C). In-use pens: room temperature for up to 28 days. Never freeze. Dispose needles in sharps container. Always carry glucose tabs and medical ID." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 23. DIALYSIS — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_dialysis: {
      title: "🔬 Dialysis Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "📋", title: "Pre-Dialysis Assessment", detail: "Check: weight (fluid gain since last session), blood pressure, access site (AV fistula: feel for thrill, listen for bruit). Target weight gain between sessions: <2-3 kg. Review labs: BUN, creatinine, potassium." },
        { icon: "💧", title: "Fluid Management", detail: "Daily fluid limit: typically 1-1.5 liters (includes soups, ice, gelatin). Track intake precisely. Weigh daily at the same time. Thirst tips: ice chips, sugar-free gum, lemon water rinse." },
        { icon: "🍎", title: "Dietary Requirements", detail: "Low potassium: avoid bananas, oranges, potatoes, tomatoes. Low phosphorus: limit dairy, nuts, beans. Adequate protein: 1.2 g/kg/day on dialysis days. Limit sodium to <2g/day." },
        { icon: "🩺", title: "Access Care (AV Fistula)", detail: "Feel for thrill daily. No blood draws, blood pressure, or IV in fistula arm. No tight clothing or jewelry. No sleeping on fistula arm. Report: swelling, redness, loss of thrill, fever, bleeding." },
        { icon: "⏱️", title: "Session Protocol", detail: "Standard hemodialysis: 3-4 hours, 3 times per week. Blood flow rate: 300-500 mL/min. Dialysate flow: 500-800 mL/min. Monitor for: cramping, hypotension, nausea, headache during treatment." },
        { icon: "🆘", title: "Emergency Signs", detail: "Seek immediate help for: chest pain, severe shortness of breath, uncontrollable bleeding from access, fever >38°C, severe headache with confusion, loss of consciousness. Know your dry weight." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 24. CHEMOTHERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_chemo: {
      title: "🧬 Chemotherapy Patient Guide",
      type: "instructions",
      steps: [
        { icon: "📋", title: "Pre-Treatment Checklist", detail: "Labs: CBC with differential, metabolic panel, liver function. Adequate counts: ANC >1500, platelets >100K. Review: hydration status, antiemetics ordered, port/PICC access patency." },
        { icon: "🤢", title: "Nausea Management", detail: "Pre-medicate with: ondansetron + dexamethasone ± aprepitant (based on emetic risk). Take antiemetics ON SCHEDULE, not just when nauseous. Eat small frequent meals. Ginger tea may help. Avoid strong odors." },
        { icon: "🦠", title: "Infection Prevention", detail: "Neutropenic precautions when ANC <1000: avoid crowds, sick contacts, raw foods. Wash hands frequently. No fresh flowers in room. Fever >100.4°F (38°C): seek IMMEDIATE medical attention. This is an emergency." },
        { icon: "🩸", title: "Blood Count Monitoring", detail: "Nadir (lowest counts): typically day 7-14. WBC nadir: risk for infection. Platelet nadir: risk for bleeding. RBC decline: may need transfusion. Growth factors (G-CSF) may be prescribed." },
        { icon: "🍎", title: "Nutrition & Self-Care", detail: "High protein, high calorie diet. Stay hydrated (8-10 glasses/day). Mouth care: soft toothbrush, salt/soda rinses 4x/day. Skin care: moisturize, avoid sun exposure. Report: mouth sores, diarrhea, constipation." },
        { icon: "💪", title: "Coping & Support", detail: "Maintain gentle exercise (walking 20 min/day). Accept help from family/friends. Connect with support groups. Counseling available. Track side effects in a diary for your oncologist." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 25. RADIATION THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_radiation: {
      title: "☢️ Radiation Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "🎯", title: "Treatment Planning", detail: "CT simulation maps the exact treatment area. Tiny permanent tattoo dots mark the field. Custom molds ensure identical positioning each session. Treatment plans use 3D conformal, IMRT, or SBRT techniques." },
        { icon: "📅", title: "Treatment Schedule", detail: "Typical course: 5 days/week for 5-7 weeks (conventional fractionation). Each session: 10-30 minutes (most is setup; actual radiation is 1-5 minutes). Do NOT miss sessions — breaks reduce effectiveness." },
        { icon: "🧴", title: "Skin Care", detail: "Gently wash treatment area with lukewarm water, mild soap. Pat dry (don't rub). Apply recommended moisturizer (Aquaphor, aloe). No hot/cold packs. No adhesive tape. Wear loose, soft clothing." },
        { icon: "🍽️", title: "Managing Side Effects", detail: "Fatigue: rest when needed, maintain light activity. Skin: redness/peeling (like sunburn) is normal. Head/neck radiation: dry mouth — use saliva substitutes, sip water frequently, avoid spicy foods." },
        { icon: "⚠️", title: "When to Call", detail: "Report: fever >100.4°F, skin breakdown/blistering, severe pain, difficulty swallowing/breathing, persistent diarrhea/vomiting, bleeding from treatment area, new neurological symptoms." },
        { icon: "📈", title: "After Treatment", detail: "Side effects may continue 1-2 weeks post-treatment. Follow-up imaging typically at 6-8 weeks. Skin recovery: 2-4 weeks. Long-term monitoring for secondary effects per oncologist's schedule." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 26. CBT — Thought Challenge Game
    // ═══════════════════════════════════════════════════════════════════
    th_cbt: {
      title: "🧠 Cognitive Restructuring Challenge",
      type: "game",
      description: "Identify and challenge negative thought patterns! For each thought, select the cognitive distortion and then choose the balanced alternative.",
      render: (container) => {
        const scenarios = [
          {
            thought: "My pain will never get better. I'll be like this forever.",
            distortion: "Fortune Telling",
            options: ["Fortune Telling", "Mind Reading", "Personalization", "Overgeneralization"],
            balanced: "My pain is difficult right now, but many people with similar conditions improve with treatment. I'll focus on what I can control.",
          },
          {
            thought: "I can't do anything anymore. I'm completely useless.",
            distortion: "All-or-Nothing Thinking",
            options: ["Catastrophizing", "All-or-Nothing Thinking", "Emotional Reasoning", "Mental Filter"],
            balanced: "While I can't do everything I used to, I can still do many meaningful things. My worth isn't defined by my physical abilities alone.",
          },
          {
            thought: "If I exercise, I'll make my injury worse. Movement is dangerous.",
            distortion: "Catastrophizing",
            options: ["Mind Reading", "Labeling", "Catastrophizing", "Should Statements"],
            balanced: "Gentle, guided exercise is recommended by my therapist and is actually beneficial for recovery. I can start slowly and gradually progress.",
          },
          {
            thought: "Nobody understands what I'm going through. They all think I'm faking it.",
            distortion: "Mind Reading",
            options: ["Personalization", "Mind Reading", "Magnification", "Discounting the Positive"],
            balanced: "I don't actually know what others think. Many people care about me. I can communicate my experience to help them understand.",
          },
        ];

        let currentQ = 0;
        let score = 0;
        let phase = "distortion"; // distortion | balanced

        function renderCBT() {
          if (currentQ >= scenarios.length) {
            container.innerHTML = `
              <div class="tg-game-area" style="width:100%;max-width:440px;height:380px;margin:0 auto;background:linear-gradient(135deg,#2d1b69,#1a0a3e);border-radius:20px;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:20px;box-sizing:border-box;">
                <div style="font-size:64px;margin-bottom:16px;">🧠</div>
                <h3 style="color:#fff;font-size:22px;text-align:center;">Cognitive Restructuring Complete!</h3>
                <p style="color:#a29bfe;font-size:16px;margin-top:8px;">Score: ${score}/${scenarios.length * 2}</p>
                <p style="color:#636e72;margin-top:12px;font-size:13px;text-align:center;max-width:360px;">Key CBT skills: Identify automatic thoughts → Recognize distortion → Challenge with evidence → Replace with balanced thought.</p>
              </div>
            `;
            return;
          }

          const s = scenarios[currentQ];
          container.innerHTML = `
            <div class="tg-game-area" style="width:100%;max-width:460px;min-height:420px;margin:0 auto;background:linear-gradient(135deg,#2d1b69,#1a0a3e);border-radius:20px;overflow:hidden;padding:16px;box-sizing:border-box;">
              <div class="tg-hud" style="display:flex;justify-content:space-between;color:#fff;font-size:14px;font-weight:600;margin-bottom:12px;">
                <span>Thought ${currentQ + 1}/${scenarios.length}</span>
                <span>Score: ${score}</span>
              </div>
              <div style="background:rgba(255,255,255,0.06);border-radius:12px;padding:14px;margin-bottom:14px;">
                <div style="color:#ff7675;font-size:12px;font-weight:600;margin-bottom:6px;">💭 AUTOMATIC THOUGHT:</div>
                <div style="color:#fff;font-size:15px;font-style:italic;">"${s.thought}"</div>
              </div>
              <div style="color:#a29bfe;font-size:14px;font-weight:600;margin-bottom:10px;">
                ${phase === "distortion" ? "Which cognitive distortion is this?" : "✅ Now select the balanced alternative:"}
              </div>
              <div id="tg-cbt-options" style="display:flex;flex-direction:column;gap:8px;">
                ${phase === "distortion" ?
                  s.options.map(opt => `
                    <button class="tg-cbt-opt" data-answer="${opt}" style="padding:12px 16px;border-radius:10px;border:1px solid #ffffff20;background:rgba(255,255,255,0.06);color:#dfe6e9;font-size:14px;cursor:pointer;text-align:left;transition:background 0.2s,border-color 0.2s;">
                      ${opt}
                    </button>
                  `).join("") :
                  `<div style="background:rgba(85,239,196,0.1);border:1px solid #55efc4;border-radius:12px;padding:14px;margin-top:6px;">
                    <div style="color:#55efc4;font-size:13px;font-weight:600;margin-bottom:6px;">🔄 BALANCED THOUGHT:</div>
                    <div style="color:#dfe6e9;font-size:14px;">${s.balanced}</div>
                  </div>
                  <button id="tg-cbt-next" style="margin-top:14px;padding:12px 30px;border-radius:10px;border:none;background:linear-gradient(135deg,#a29bfe,#6c5ce7);color:#fff;font-size:14px;font-weight:600;cursor:pointer;width:100%;">
                    Next Thought →
                  </button>`
                }
              </div>
              <div id="tg-cbt-feedback" style="text-align:center;margin-top:10px;color:#dfe6e9;font-size:13px;min-height:20px;"></div>
            </div>
          `;

          if (phase === "distortion") {
            document.querySelectorAll(".tg-cbt-opt").forEach(btn => {
              btn.addEventListener("click", () => {
                const answer = btn.dataset.answer;
                const fb = document.getElementById("tg-cbt-feedback");
                if (answer === s.distortion) {
                  score++;
                  btn.style.background = "rgba(85,239,196,0.3)";
                  btn.style.borderColor = "#55efc4";
                  fb.innerHTML = `<span style="color:#55efc4;">✅ Correct! This is ${s.distortion}.</span>`;
                } else {
                  btn.style.background = "rgba(255,107,107,0.3)";
                  btn.style.borderColor = "#ff7675";
                  fb.innerHTML = `<span style="color:#ff7675;">❌ The distortion was: ${s.distortion}</span>`;
                }
                document.querySelectorAll(".tg-cbt-opt").forEach(b => b.disabled = true);
                setTimeout(() => { phase = "balanced"; renderCBT(); }, 1500);
              });
            });
          } else {
            document.getElementById("tg-cbt-next").addEventListener("click", () => {
              score++;
              currentQ++;
              phase = "distortion";
              renderCBT();
            });
          }
        }

        renderCBT();
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // 27. ACUPUNCTURE — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_acupuncture: {
      title: "📍 Acupuncture Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "📋", title: "Pre-Treatment", detail: "Eat a light meal 2 hours before (avoid empty stomach). Wear loose clothing. Inform practitioner of: all medications, pregnancy, bleeding disorders, pacemaker, fear of needles." },
        { icon: "📍", title: "Key Acupoints for Pain", detail: "LI4 (Hegu): hand pain, headache. ST36 (Zusanli): knee pain, general wellness. GB34 (Yanglingquan): musculoskeletal pain. BL40 (Weizhong): lower back pain. Local Ah-Shi points at tender areas." },
        { icon: "📏", title: "Needle Technique", detail: "Sterile, single-use filiform needles (0.18-0.30 mm). Insertion depth: 0.5-1.5 inches depending on location. 'De Qi' sensation (dull ache, tingling) indicates proper needle placement." },
        { icon: "⏱️", title: "Session Protocol", detail: "Needles retained for 20-30 minutes. Practitioner may manipulate needles periodically (twisting, lifting). Electroacupuncture may be added for enhanced effect (2-100 Hz stimulation)." },
        { icon: "📅", title: "Treatment Course", detail: "Acute conditions: 2-3 sessions/week for 2-4 weeks. Chronic conditions: 1-2 sessions/week for 8-12 weeks. Maintenance: monthly sessions. Benefit is cumulative — consistency is key." },
        { icon: "📝", title: "Post-Treatment", detail: "Mild soreness at needle sites is normal (resolves in 24h). Drink water. Rest if feeling light-headed. Avoid vigorous exercise for 2 hours. Track pain levels before/after each session." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 28. LOW-LEVEL LASER — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_laser: {
      title: "🔴 Low-Level Laser Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "📐", title: "Select Parameters", detail: "Wavelength: 632-904 nm (red/near-infrared). Power: 5-500 mW (Class 3B). Dose: 1-4 J/cm² for superficial, 4-8 J/cm² for deep tissue. Treatment area: contact or off-contact technique." },
        { icon: "👓", title: "Safety Precautions", detail: "Both patient and operator must wear wavelength-specific protective eyewear. Never aim at eyes. Ensure proper classification labeling. No use over: thyroid, tumors, pregnant uterus, hemorrhaging tissue." },
        { icon: "🎯", title: "Application Technique", detail: "Direct contact: press probe firmly against skin for maximum penetration. Grid technique: treat multiple points 1-2 cm apart. Scan technique: move slowly across area for broader coverage." },
        { icon: "⏱️", title: "Duration Per Point", detail: "30-60 seconds per point. Total session: 5-20 minutes. Larger treatment areas require more time. No thermal sensation should occur — if patient feels heat, reduce power or increase movement speed." },
        { icon: "📅", title: "Treatment Schedule", detail: "Acute conditions: daily for 5-7 days, then every other day. Chronic conditions: 2-3 times/week for 4-6 weeks. Re-evaluate at 6 sessions. Effect is cumulative — do not space sessions too far apart." },
        { icon: "✅", title: "Expected Outcomes", detail: "Tissue repair acceleration (20-40%). Anti-inflammatory effect within 2-3 sessions. Pain reduction: typically noticeable by session 3-4. Full benefit: 8-12 sessions for chronic conditions." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 29. SHOCKWAVE THERAPY — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_shockwave: {
      title: "💥 Extracorporeal Shockwave Therapy Guide",
      type: "instructions",
      steps: [
        { icon: "📋", title: "Indications", detail: "Most effective for chronic tendinopathies: plantar fasciitis, Achilles tendinopathy, tennis elbow (lateral epicondylitis), calcific shoulder tendinitis, patellar tendinopathy. Should have failed conservative treatment (3+ months)." },
        { icon: "🧴", title: "Preparation", detail: "Apply coupling gel to treatment area. Identify the point of maximum tenderness via palpation or ultrasound guidance. Inform patient of expected discomfort during treatment (6-7/10 pain is typical)." },
        { icon: "⚡", title: "Treatment Parameters", detail: "Radial shockwave: 2000-3000 impulses per session. Energy: 0.08-0.16 mJ/mm² (start low, increase to tolerance). Frequency: 8-12 Hz. Focused shockwave: lower impulse count, higher energy." },
        { icon: "📅", title: "Protocol", detail: "3-6 sessions, 1 week apart. No treatment more frequently than weekly (tissue needs recovery time). Reassess after 3 sessions. 70-80% of patients improve by the 3rd session." },
        { icon: "🚫", title: "Post-Treatment Instructions", detail: "Avoid: NSAIDs for 4 weeks (they reduce the inflammatory healing response shockwave initiates), ice therapy for 48h, high-impact activity for 48h. Mild discomfort is normal and part of healing." },
        { icon: "⚠️", title: "Contraindications", detail: "Avoid over: lung tissue, brain/spine, major nerves/blood vessels, growth plates, implants, malignancy. Not for: pregnancy, blood clotting disorders, pacemaker, cortisone injection within past 6 weeks." },
      ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 30. MANUAL LYMPHATIC DRAINAGE — Instructions
    // ═══════════════════════════════════════════════════════════════════
    th_lymphatic: {
      title: "🖐️ Manual Lymphatic Drainage Guide",
      type: "instructions",
      steps: [
        { icon: "📐", title: "Assessment", detail: "Measure limb circumference at multiple points (every 4 cm). Document degree of pitting edema (Grade 1-4). Compare bilateral measurements. Note skin condition and texture changes." },
        { icon: "🔄", title: "Opening Sequence", detail: "Begin at lymph nodes closest to the trunk: deep breathing (diaphragmatic pump), then clear nodes in this order: supraclavicular → axillary (or inguinal for LE) → proximal to distal segments." },
        { icon: "🤲", title: "Technique", detail: "Light pressure only (30-40 mmHg — like the weight of a nickel). Slow, rhythmic, circular strokes that stretch the skin. Direction: always toward the nearest functioning lymph node group." },
        { icon: "⏱️", title: "Session Protocol", detail: "Duration: 45-60 minutes for full limb treatment. Frequency: daily during intensive phase (2-4 weeks), then 2-3x/week for maintenance. Follow with compression bandaging immediately after MLD." },
        { icon: "🧦", title: "Compression Phase", detail: "Multi-layer short-stretch bandaging immediately post-MLD. Progress to compression garments (20-30 mmHg minimum). Wear during waking hours. Elevate limb when resting." },
        { icon: "🏋️", title: "Decongestive Exercises", detail: "Gentle exercises with compression garments on: ankle pumps, wrist flexion/extension, marching in place, diaphragmatic breathing. 10-15 minutes, 3x daily. Never exercise without compression." },
      ]
    },
  };

  // ═══════════════════════════════════════════════════════════════════
  // ── MODAL RENDERER ─────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════

  function createModal() {
    if (document.getElementById("tg-modal-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "tg-modal-overlay";
    overlay.innerHTML = `
      <div class="tg-modal">
        <div class="tg-modal-header">
          <h2 id="tg-modal-title"></h2>
          <button id="tg-modal-close" class="tg-modal-close-btn">&times;</button>
        </div>
        <div class="tg-modal-description" id="tg-modal-desc"></div>
        <div class="tg-modal-body" id="tg-modal-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.getElementById("tg-modal-close").addEventListener("click", closeModal);
  }

  function closeModal() {
    const overlay = document.getElementById("tg-modal-overlay");
    if (overlay) {
      overlay.classList.remove("visible");
      setTimeout(() => overlay.remove(), 300);
    }
  }

  function openGame(therapyId, therapyName) {
    createModal();

    const overlay = document.getElementById("tg-modal-overlay");
    const title = document.getElementById("tg-modal-title");
    const desc = document.getElementById("tg-modal-desc");
    const body = document.getElementById("tg-modal-body");

    const game = GAMES[therapyId];

    if (!game) {
      // Fallback: generate generic instructions from therapy name
      title.textContent = `📋 ${therapyName} Instructions`;
      desc.textContent = "Detailed guidance for this therapy.";
      body.innerHTML = `
        <div class="tg-instructions-list">
          <div class="tg-instruction-step">
            <span class="tg-step-icon">📋</span>
            <div class="tg-step-content">
              <h4>Consult Your Healthcare Provider</h4>
              <p>This therapy should be administered under professional medical supervision. Discuss the treatment plan, expected outcomes, duration, and any potential risks with your physician or therapist.</p>
            </div>
          </div>
          <div class="tg-instruction-step">
            <span class="tg-step-icon">📝</span>
            <div class="tg-step-content">
              <h4>Pre-Treatment Preparation</h4>
              <p>Follow all pre-treatment instructions from your healthcare team. This may include fasting, medication adjustments, lab work, or imaging studies prior to beginning therapy.</p>
            </div>
          </div>
          <div class="tg-instruction-step">
            <span class="tg-step-icon">⏱️</span>
            <div class="tg-step-content">
              <h4>Treatment Schedule</h4>
              <p>Adhere to the prescribed treatment schedule. Consistency is critical for optimal outcomes. Do not skip or reschedule sessions without consulting your provider.</p>
            </div>
          </div>
          <div class="tg-instruction-step">
            <span class="tg-step-icon">📊</span>
            <div class="tg-step-content">
              <h4>Monitor Progress</h4>
              <p>Keep a symptom diary. Track pain levels (0-10 scale), functional improvements, and any side effects. Share this information at each follow-up visit.</p>
            </div>
          </div>
          <div class="tg-instruction-step">
            <span class="tg-step-icon">⚠️</span>
            <div class="tg-step-content">
              <h4>Know When to Seek Help</h4>
              <p>Contact your healthcare provider immediately if you experience: worsening symptoms, new symptoms, allergic reactions, excessive pain, fever, or any adverse effects.</p>
            </div>
          </div>
          <div class="tg-instruction-step">
            <span class="tg-step-icon">🔄</span>
            <div class="tg-step-content">
              <h4>Follow-Up & Reassessment</h4>
              <p>Attend all follow-up appointments. Therapy protocols are adjusted based on your response. Open communication with your care team ensures the best possible outcome.</p>
            </div>
          </div>
        </div>
      `;
      requestAnimationFrame(() => overlay.classList.add("visible"));
      return;
    }

    title.textContent = game.title;

    if (game.type === "game") {
      desc.textContent = game.description;
      body.innerHTML = "";
      game.render(body);
    } else if (game.type === "instructions") {
      desc.textContent = "Follow these step-by-step instructions:";
      body.innerHTML = `
        <div class="tg-instructions-list">
          ${game.steps.map((step, i) => `
            <div class="tg-instruction-step" style="animation-delay: ${i * 0.1}s;">
              <span class="tg-step-icon">${step.icon}</span>
              <div class="tg-step-content">
                <h4>${step.title}</h4>
                <p>${step.detail}</p>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    requestAnimationFrame(() => overlay.classList.add("visible"));
  }

  // ── Public API ─────────────────────────────────────────────────────
  return {
    openGame,
    hasGame: (therapyId) => !!GAMES[therapyId],
    getGameType: (therapyId) => (GAMES[therapyId] ? GAMES[therapyId].type : "instructions"),
    getGameTitle: (therapyId) => (GAMES[therapyId] ? GAMES[therapyId].title : ""),
    getGameCount: () => Object.keys(GAMES).length,
    getAllTherapyIds: () => Object.keys(GAMES),
  };
})();

