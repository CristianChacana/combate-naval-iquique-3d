/**
 * Motor Principal del Juego 3D - Combate Naval de Iquique y Punta Gruesa
 * Versión Segura y Blindada contra Brechas de Seguridad (XSS, Injection, CSP)
 * Regla Estricta: Muerte Súbita (1 fallo = Game Over Instantáneo)
 */

class NavalBattleGame {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.environment = null;
    this.particles = null;
    this.questionManager = new QuestionManager();

    // Estado del juego
    this.currentScenario = 'punta_gruesa';
    this.gameMode = 'campaign';
    this.currentQuestionIndex = 0;
    this.activeQuestions = [];
    this.isAnswering = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.cameraMode = 'cinematic';
    this.isInitialized = false;

    // Barcos activos
    this.playerShip = null;
    this.enemyShip = null;

    // Sistema de Resistencia (Pierde a los 2 cañonazos enemigos)
    this.playerStrikes = 0;
    this.maxStrikes = 2;
    this.playerDamaged = false;

    // Salud e Integridad (100% inicial)
    this.playerHealth = 100;
    this.enemyHealth = 100;

    // Reloj
    this.clock = new THREE.Clock();
    this.targetCameraPos = new THREE.Vector3(0, 20, 60);
    this.targetCameraLookAt = new THREE.Vector3(0, 5, 0);

    this.shipAnimProgress = 0;
    this.isActionAnimating = false;
  }

  // Comprobación de compatibilidad WebGL
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  init() {
    if (this.isInitialized) return;

    if (!this.checkWebGLSupport()) {
      this.showFatalError("Tu navegador o tarjeta gráfica no tiene aceleración WebGL habilitada. Activa la aceleración de hardware en la configuración de tu navegador para jugar en 3D.");
      return;
    }

    try {
      this.setupThree();
      this.setupEvents();
      this.setupUI();
      this.loadScenario('punta_gruesa');
      this.animate();
      this.isInitialized = true;
    } catch (err) {
      console.error("Error al inicializar el combate naval:", err);
      this.showFatalError("Ocurrió un error al cargar el motor 3D: " + (err.message || err));
    }
  }

  showFatalError(message) {
    const errorBox = document.createElement('div');
    errorBox.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1f0909;border:2px solid #e74c3c;color:#fff;padding:24px 32px;border-radius:8px;max-width:550px;text-align:center;font-family:sans-serif;z-index:9999;box-shadow:0 0 30px rgba(0,0,0,0.9);";
    const title = document.createElement('h3');
    title.textContent = "⚠️ No se pudo iniciar el juego 3D";
    title.style.color = "#ff6b6b";
    title.style.marginBottom = "12px";
    const body = document.createElement('p');
    body.textContent = message;
    body.style.fontSize = "0.95rem";
    body.style.lineHeight = "1.5";
    errorBox.appendChild(title);
    errorBox.appendChild(body);
    document.body.appendChild(errorBox);
  }

  setupThree() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.5,
      1200
    );
    this.camera.position.set(0, 24, 65);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
      this.controls.minDistance = 8;
      this.controls.maxDistance = 250;
      this.controls.enabled = false;
    }

    this.environment = new BattleEnvironment(this.scene);
    this.environment.init('punta_gruesa');
    this.particles = new ParticleSystem(this.scene);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.onWindowResize());

    window.addEventListener('keydown', (e) => {
      if (this.isGameOver || this.isVictory) return;

      const key = e.key.toLowerCase();
      // Soporte tanto para números 1-4 como letras A-D
      const numMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };

      if (key in numMap && this.isAnswering) {
        this.selectOption(numMap[key]);
      } else if (key === 'c') {
        this.toggleCameraMode();
      } else if (key === 'm') {
        this.toggleMute();
      }
    });
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setupUI() {
    // Botones de cámara
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.cam;
        this.setCameraMode(mode);
      });
    });

    // Botón de audio
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => this.toggleMute());
    }

    // Botón de reintento en Game Over
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.retryCurrentScenario();
      });
    }

    // Selector de escenario rápido
    document.querySelectorAll('.scenario-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const scenario = e.currentTarget.dataset.scenario;
        this.gameMode = 'single';
        this.loadScenario(scenario);
      });
    });

    // Botón continuar tras victoria
    const nextScenarioBtn = document.getElementById('next-scenario-btn');
    if (nextScenarioBtn) {
      nextScenarioBtn.addEventListener('click', () => {
        if (this.currentScenario === 'punta_gruesa') {
          this.loadScenario('iquique');
        } else {
          this.loadScenario('punta_gruesa');
        }
      });
    }

    // Botón iniciar briefing directamente conectado de forma infalible
    const briefingBtn = document.getElementById('briefing-start-btn');
    if (briefingBtn) {
      briefingBtn.addEventListener('click', () => this.dismissBriefing());
    }

    this.setupCustomQuestionsModal();
  }

  dismissBriefing() {
    const modal = document.getElementById('briefing-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
    if (window.soundEngine) {
      window.soundEngine.ensureContext();
    }
    this.displayCurrentQuestion();
  }

  setupCustomQuestionsModal() {
    const modal = document.getElementById('questions-modal');
    const openBtn = document.getElementById('open-questions-btn');
    const closeBtn = document.getElementById('close-questions-btn');
    const form = document.getElementById('add-question-form');
    const resetBtn = document.getElementById('reset-questions-btn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        this.renderQuestionsList();
        modal.classList.remove('hidden');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('¿Restablecer todas las preguntas a las históricas originales?')) {
          this.questionManager.resetToDefault();
          this.renderQuestionsList();
          this.loadScenario(this.currentScenario);
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const scenario = document.getElementById('q-scenario').value;
          const title = document.getElementById('q-title').value;
          const question = document.getElementById('q-text').value;
          const opt0 = document.getElementById('q-opt0').value;
          const opt1 = document.getElementById('q-opt1').value;
          const opt2 = document.getElementById('q-opt2').value;
          const opt3 = document.getElementById('q-opt3').value;
          const correctIndex = parseInt(document.getElementById('q-correct').value, 10);
          const explanation = document.getElementById('q-explanation').value;

          this.questionManager.addQuestion(scenario, {
            title,
            question,
            options: [opt0, opt1, opt2, opt3],
            correctIndex,
            explanation
          });

          form.reset();
          this.renderQuestionsList();
          alert('¡Pregunta guardada y validada con éxito!');
        } catch (err) {
          alert('Error de validación: ' + err.message);
        }
      });
    }
  }

  // Renderizado SEGURO con DOM Manipulation (Sin innerHTML vulnerable)
  renderQuestionsList() {
    const listContainer = document.getElementById('questions-items-list');
    if (!listContainer) return;

    // Limpiar de forma segura
    while (listContainer.firstChild) {
      listContainer.removeChild(listContainer.firstChild);
    }

    const all = this.questionManager.getAllQuestions();

    ['punta_gruesa', 'iquique'].forEach(scKey => {
      const heading = document.createElement('h4');
      heading.className = 'section-badge';
      heading.textContent = scKey === 'punta_gruesa' 
        ? 'Combate de Punta Gruesa (Covadonga vs Independencia)' 
        : 'Combate de Iquique (Esmeralda vs Huáscar)';
      listContainer.appendChild(heading);

      const questions = all[scKey] || [];
      questions.forEach((q, idx) => {
        const row = document.createElement('div');
        row.className = 'question-row';

        const rowHeader = document.createElement('div');
        rowHeader.className = 'question-row-header';

        const numSpan = document.createElement('span');
        numSpan.className = 'q-number';
        numSpan.textContent = `#${idx + 1} ${q.title}`;

        const delBtn = document.createElement('button');
        delBtn.className = 'btn-del';
        delBtn.textContent = 'Eliminar';
        delBtn.addEventListener('click', () => {
          this.deleteQuestion(scKey, q.id);
        });

        rowHeader.appendChild(numSpan);
        rowHeader.appendChild(delBtn);

        const bodyP = document.createElement('p');
        bodyP.className = 'q-body';
        bodyP.textContent = q.question;

        const previewDiv = document.createElement('div');
        previewDiv.className = 'q-correct-preview';
        const strongText = document.createElement('strong');
        strongText.textContent = q.options[q.correctIndex] || '';
        previewDiv.textContent = 'Respuesta Correcta: ';
        previewDiv.appendChild(strongText);

        row.appendChild(rowHeader);
        row.appendChild(bodyP);
        row.appendChild(previewDiv);
        listContainer.appendChild(row);
      });
    });
  }

  deleteQuestion(scenarioKey, id) {
    this.questionManager.deleteQuestion(scenarioKey, id);
    this.renderQuestionsList();
    this.loadScenario(this.currentScenario);
  }

  // -------------------------------------------------------------
  // CARGA DE ESCENARIOS
  // -------------------------------------------------------------
  loadScenario(scenarioKey) {
    this.currentScenario = scenarioKey;
    this.currentQuestionIndex = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.playerHealth = 100;
    this.enemyHealth = 100;
    this.playerStrikes = 0;
    this.playerDamaged = false;

    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');

    this.particles.clear();
    this.environment.updateScenarioEnvironment(scenarioKey);

    if (this.playerShip) this.scene.remove(this.playerShip);
    if (this.enemyShip) this.scene.remove(this.enemyShip);

    if (scenarioKey === 'punta_gruesa') {
      this.playerShip = ShipBuilder.createCovadonga();
      this.enemyShip = ShipBuilder.createIndependencia();

      this.playerShip.position.set(10, 0, 0);
      this.playerShip.rotation.y = Math.PI;

      this.enemyShip.position.set(-25, 0, 35);
      this.enemyShip.rotation.y = Math.PI * 0.95;

      this.updateHUDTitles(
        "COMBATE DE PUNTA GRUESA",
        "Goleta Covadonga (C. Condell)",
        "Fragata Independencia (J. Moore)"
      );

      this.showBriefing(
        "PUNTA GRUESA: LA TÁCTICA DE CARLOS CONDELL",
        "21 de Mayo de 1879 - 09:00 AM",
        "La poderosa fragata blindada peruana Independencia (2.000 ton) persigue a la pequeña goleta chilena Covadonga. Condell decide guiar a su nave sobre los bajos fondos rocosos de la costa.\n\nRESISTENCIA: Tu buque soporta hasta 1 impacto de cañón. Al recibir el 2° cañonazo enemigo (2 errores), el buque será hundido y terminará el combate."
      );
    } else {
      this.playerShip = ShipBuilder.createEsmeralda();
      this.enemyShip = ShipBuilder.createHuascar();

      this.playerShip.position.set(0, 0, 0);
      this.playerShip.rotation.y = -Math.PI / 2;

      this.enemyShip.position.set(0, 0, 55);
      this.enemyShip.rotation.y = Math.PI;

      this.updateHUDTitles(
        "COMBATE NAVAL DE IQUIQUE",
        "Corbeta Esmeralda (A. Prat)",
        "Monitor Huáscar (M. Grau)"
      );

      this.showBriefing(
        "IQUIQUE: ¡LA CONTIENDA ES DESIGUAL!",
        "21 de Mayo de 1879 - 08:30 AM",
        "En la bahía de Iquique, el monitor blindado Huáscar acorrala a la vieja corbeta de madera Esmeralda. Arturo Prat llama a su tripulación a no rendirse jamás.\n\nRESISTENCIA: Dispones de 2 impactos de resistencia antes del hundimiento total. ¡Demuestra tu conocimiento y valor!"
      );
    }

    this.scene.add(this.playerShip);
    this.scene.add(this.enemyShip);

    this.activeQuestions = this.questionManager.getScenarioQuestions(scenarioKey);

    if (window.soundEngine) {
      window.soundEngine.playBell();
    }

    this.updateHUD();
    this.setCameraMode('cinematic');
  }

  showBriefing(title, subtitle, text) {
    const modal = document.getElementById('briefing-modal');
    if (!modal) return;
    document.getElementById('briefing-title').textContent = title;
    document.getElementById('briefing-subtitle').textContent = subtitle;
    document.getElementById('briefing-text').textContent = text;
    modal.classList.remove('hidden');
  }

  updateHUDTitles(battleName, playerTitle, enemyTitle) {
    document.getElementById('battle-title').textContent = battleName;
    document.getElementById('player-name').textContent = playerTitle;
    document.getElementById('enemy-name').textContent = enemyTitle;
  }

  updateHUD() {
    const playerBar = document.getElementById('player-health-bar');
    const enemyBar = document.getElementById('enemy-health-bar');
    const progressText = document.getElementById('question-progress');
    const pill = document.querySelector('.sudden-death-pill');

    if (playerBar) playerBar.style.width = `${Math.max(0, this.playerHealth)}%`;
    if (enemyBar) enemyBar.style.width = `${Math.max(0, this.enemyHealth)}%`;

    if (progressText) {
      progressText.textContent = `Etapa ${this.currentQuestionIndex + 1} de ${this.activeQuestions.length}`;
    }

    if (pill) {
      if (this.playerStrikes === 0) {
        pill.textContent = "🛡️ RESISTENCIA DEL CASCO: 2 IMPACTOS";
        pill.classList.remove('danger');
      } else if (this.playerStrikes === 1) {
        pill.textContent = "⚠️ CASCO AVERIADO: 1/2 IMPACTOS (¡PELIGRO DE HUNDIMIENTO!)";
        pill.classList.add('danger');
      } else {
        pill.textContent = "💥 BUQUE HUNDIDO";
        pill.classList.add('danger');
      }
    }
  }

  // -------------------------------------------------------------
  // DESPLIEGUE SEGURO Y ESTILIZADO DE PREGUNTAS (SIN NÚMEROS REPETIDOS)
  // -------------------------------------------------------------
  displayCurrentQuestion() {
    if (this.currentQuestionIndex >= this.activeQuestions.length) {
      this.triggerVictory();
      return;
    }

    this.isAnswering = true;
    const q = this.activeQuestions[this.currentQuestionIndex];

    const box = document.getElementById('question-box');
    box.classList.remove('hidden');

    document.getElementById('q-header-title').textContent = q.title;
    document.getElementById('q-prompt-text').textContent = q.question;

    const optionsContainer = document.getElementById('q-options-container');
    while (optionsContainer.firstChild) {
      optionsContainer.removeChild(optionsContainer.firstChild);
    }

    // Distintivo limpio solo con letras estilizadas A, B, C, D
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-card';

      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'opt-badge';
      badgeSpan.textContent = letters[index];

      const labelSpan = document.createElement('span');
      labelSpan.className = 'opt-label';
      labelSpan.textContent = optText;

      btn.appendChild(badgeSpan);
      btn.appendChild(labelSpan);
      btn.onclick = () => this.selectOption(index);
      optionsContainer.appendChild(btn);
    });

    this.updateHUD();
  }

  selectOption(selectedIndex) {
    if (!this.isAnswering || this.isGameOver || this.isVictory) return;
    this.isAnswering = false;

    const q = this.activeQuestions[this.currentQuestionIndex];
    const optionsButtons = document.querySelectorAll('.option-card');

    if (selectedIndex === q.correctIndex) {
      // RESPUESTA CORRECTA
      if (optionsButtons[selectedIndex]) {
        optionsButtons[selectedIndex].classList.add('correct');
      }

      this.executeActionSequence(true, q, () => {
        this.currentQuestionIndex++;
        const step = 100 / this.activeQuestions.length;
        this.enemyHealth = Math.max(0, this.enemyHealth - step);
        this.updateHUD();

        setTimeout(() => {
          document.getElementById('question-box').classList.add('hidden');
          this.displayCurrentQuestion();
        }, 1200);
      });

    } else {
      // RESPUESTA INCORRECTA (SISTEMA DE 2 IMPACTOS)
      this.playerStrikes++;
      this.playerHealth = Math.max(0, 100 - (this.playerStrikes * 50));
      this.updateHUD();

      if (optionsButtons[selectedIndex]) {
        optionsButtons[selectedIndex].classList.add('incorrect');
      }
      if (optionsButtons[q.correctIndex]) {
        optionsButtons[q.correctIndex].classList.add('correct');
      }

      const correctAnswerText = q.originalCorrectText || q.options[q.correctIndex];

      if (this.playerStrikes === 1) {
        // PRIMER CAÑONAZO (DAÑO CRÍTICO, AÚN VIVO)
        this.playerDamaged = true;
        this.executeEnemyCannonShot(false, () => {
          this.showCombatLog(`💥 ¡PRIMER CAÑONAZO ENEMIGO IMPACTA EN EL CASCO! (50% de daño)\nRespuesta histórica: ${correctAnswerText}\n⚠️ ¡Un cañonazo más y el buque se hundirá!`);
          
          setTimeout(() => {
            document.getElementById('question-box').classList.add('hidden');
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
          }, 3800);
        });

      } else {
        // SEGUNDO CAÑONAZO = HUNDIMIENTO TOTAL = GAME OVER
        this.executeEnemyCannonShot(true, () => {
          this.triggerGameOver(q, selectedIndex);
        });
      }
    }
  }

  executeActionSequence(isSuccess, q, onComplete) {
    this.isActionAnimating = true;

    this.showCombatLog(isSuccess ? q.actionText : "¡Fallo táctico! El enemigo concentra su fuego contra nuestro casco.");

    if (isSuccess) {
      if (this.currentScenario === 'punta_gruesa') {
        this.animatePuntaGruesaTurn(onComplete);
      } else {
        this.animateIquiqueBroadside(onComplete);
      }
    } else {
      this.animateEnemyCriticalHit(onComplete);
    }
  }

  showCombatLog(message) {
    const logBox = document.getElementById('combat-log-toast');
    if (!logBox) return;
    logBox.textContent = message;
    logBox.classList.remove('hidden');
    logBox.classList.add('show');

    setTimeout(() => {
      logBox.classList.remove('show');
      setTimeout(() => logBox.classList.add('hidden'), 500);
    }, 3500);
  }

  animatePuntaGruesaTurn(onComplete) {
    const isClimax = (this.currentQuestionIndex >= this.activeQuestions.length - 2);

    const covadongaGunPos = new THREE.Vector3().copy(this.playerShip.position).add(new THREE.Vector3(0, 4.5, -12));
    const enemyTargetPos = new THREE.Vector3().copy(this.enemyShip.position).add(new THREE.Vector3(0, 5, 0));

    this.particles.fireCannonBall(covadongaGunPos, enemyTargetPos, false, (hitPos) => {
      this.particles.createHullHit(hitPos, true);
    });

    const duration = 2.0;
    const startEnemyPos = this.enemyShip.position.clone();
    const endEnemyPos = isClimax 
      ? new THREE.Vector3(30, -1.8, -20)
      : new THREE.Vector3(startEnemyPos.x + 5, 0, startEnemyPos.z - 8);

    let elapsed = 0;
    const moveInterval = setInterval(() => {
      elapsed += 0.03;
      const t = Math.min(1, elapsed / duration);
      this.enemyShip.position.lerpVectors(startEnemyPos, endEnemyPos, t);

      if (isClimax) {
        this.enemyShip.rotation.z = t * 0.45;
        this.enemyShip.rotation.x = t * 0.15;
      }

      if (t >= 1) {
        clearInterval(moveInterval);
        if (isClimax && window.soundEngine) {
          window.soundEngine.playRamming();
        }
        this.isActionAnimating = false;
        if (onComplete) onComplete();
      }
    }, 30);
  }

  animateIquiqueBroadside(onComplete) {
    const isRammingStage = (this.currentQuestionIndex === 3 || this.currentQuestionIndex === 5);

    const esmeraldaSideGun = new THREE.Vector3().copy(this.playerShip.position).add(new THREE.Vector3(4.8, 2.8, 0));
    const huascarHull = new THREE.Vector3().copy(this.enemyShip.position).add(new THREE.Vector3(0, 2.5, 0));

    this.particles.fireCannonBall(esmeraldaSideGun, huascarHull, false, (hitPos) => {
      this.particles.createHullHit(hitPos, true);
    });

    if (isRammingStage) {
      const startHuascarPos = this.enemyShip.position.clone();
      const ramPos = new THREE.Vector3(0, 0, 10);

      let elapsed = 0;
      const ramInterval = setInterval(() => {
        elapsed += 0.03;
        const t = Math.min(1, elapsed / 1.8);
        this.enemyShip.position.lerpVectors(startHuascarPos, ramPos, t);

        if (t >= 1) {
          clearInterval(ramInterval);
          if (window.soundEngine) window.soundEngine.playRamming();
          this.triggerScreenShake();
          this.particles.createHullHit(new THREE.Vector3(0, 2, 8), false);

          setTimeout(() => {
            this.enemyShip.position.set(0, 0, 30);
            this.isActionAnimating = false;
            if (onComplete) onComplete();
          }, 800);
        }
      }, 30);
    } else {
      setTimeout(() => {
        this.isActionAnimating = false;
        if (onComplete) onComplete();
      }, 1500);
    }
  }

  // Disparo y Cañonazo Enemigo (Impacto Leve vs Hundimiento Fatal)
  executeEnemyCannonShot(isFatal, onComplete) {
    this.isActionAnimating = true;

    const enemyGunPos = new THREE.Vector3().copy(this.enemyShip.position).add(new THREE.Vector3(0, 5, 0));
    const playerTargetPos = new THREE.Vector3().copy(this.playerShip.position).add(new THREE.Vector3((Math.random() - 0.5) * 4, 2, (Math.random() - 0.5) * 8));

    this.particles.fireCannonBall(enemyGunPos, playerTargetPos, true, (hitPos) => {
      this.particles.createHullHit(hitPos, false);
      this.triggerScreenShake();

      if (isFatal) {
        // Segundo impacto: hundimiento irremediable
        this.playerShip.rotation.z = 0.55;
        this.playerShip.position.y = -4.0;
      } else {
        // Primer impacto: daño visible en el casco y balanceo violento
        this.playerShip.rotation.z = 0.22;
        setTimeout(() => {
          this.playerShip.rotation.z = 0.08;
        }, 800);
      }

      setTimeout(() => {
        this.isActionAnimating = false;
        if (onComplete) onComplete();
      }, 1000);
    });
  }

  triggerScreenShake() {
    const originalPos = this.camera.position.clone();
    let shakes = 0;
    const interval = setInterval(() => {
      this.camera.position.set(
        originalPos.x + (Math.random() - 0.5) * 2.5,
        originalPos.y + (Math.random() - 0.5) * 2.5,
        originalPos.z + (Math.random() - 0.5) * 2.5
      );
      shakes++;
      if (shakes > 14) {
        clearInterval(interval);
        this.camera.position.copy(originalPos);
      }
    }, 40);
  }

  // -------------------------------------------------------------
  // GAME OVER SEGURO
  // -------------------------------------------------------------
  triggerGameOver(question, selectedIndex) {
    this.isGameOver = true;
    document.getElementById('question-box').classList.add('hidden');

    if (window.soundEngine) {
      window.soundEngine.playGameOver();
    }

    const gameOverScreen = document.getElementById('game-over-screen');
    const wrongAnswerText = question.options[selectedIndex] || "Sin respuesta";
    const correctAnswerText = question.originalCorrectText || question.options[question.correctIndex];

    document.getElementById('go-wrong-text').textContent = wrongAnswerText;
    document.getElementById('go-correct-text').textContent = correctAnswerText;
    document.getElementById('go-explanation').textContent = question.explanation;

    gameOverScreen.classList.remove('hidden');
  }

  retryCurrentScenario() {
    this.loadScenario(this.currentScenario);
  }

  // -------------------------------------------------------------
  // VICTORIA SEGURA
  // -------------------------------------------------------------
  triggerVictory() {
    this.isVictory = true;
    document.getElementById('question-box').classList.add('hidden');

    if (window.soundEngine) {
      window.soundEngine.playVictory();
    }

    const victoryScreen = document.getElementById('victory-screen');
    const title = document.getElementById('vic-title');
    const summary = document.getElementById('vic-summary');
    const nextBtn = document.getElementById('next-scenario-btn');

    if (this.currentScenario === 'punta_gruesa') {
      title.textContent = "¡VICTORIA EN PUNTA GRUESA!";
      summary.textContent = "¡La fragata blindada Independencia ha quedado destrozada en el arrecife! Carlos Condell ha conseguido una hazaña legendaria que cambió el curso de la Guerra del Pacífico. Has superado todas las preguntas sin un solo fallo.";
      nextBtn.textContent = "Continuar a la Batalla de Iquique (Esmeralda vs Huáscar)";
    } else {
      title.textContent = "¡GLORIA ETERNA EN IQUIQUE!";
      summary.textContent = "¡La Esmeralda se ha hundido con su pabellón al tope sin haberse rendido jamás! El heroísmo de Arturo Prat, Serrano, Aldea y Riquelme queda grabado en la inmortalidad. ¡Has demostrado un conocimiento intachable y superado el desafío de Muerte Súbita!";
      nextBtn.textContent = "Reiniciar Campaña Histórica";
    }

    victoryScreen.classList.remove('hidden');
  }

  setCameraMode(mode) {
    this.cameraMode = mode;

    document.querySelectorAll('.cam-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cam === mode);
    });

    if (this.controls) {
      this.controls.enabled = (mode === 'orbit');
    }
  }

  toggleCameraMode() {
    const modes = ['cinematic', 'orbit', 'deck'];
    const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
    this.setCameraMode(modes[nextIdx]);
  }

  toggleMute() {
    if (window.soundEngine) {
      const muted = window.soundEngine.toggleMute();
      const muteBtn = document.getElementById('mute-btn');
      if (muteBtn) {
        muteBtn.textContent = muted ? "🔇 Activar Sonido" : "🔊 Silenciar";
      }
    }
  }

  updateCamera(time) {
    if (this.cameraMode === 'cinematic') {
      const radius = 65;
      const angle = time * 0.12;

      this.targetCameraPos.set(
        Math.sin(angle) * radius,
        18 + Math.sin(time * 0.2) * 5,
        Math.cos(angle) * radius + 15
      );

      const center = new THREE.Vector3();
      if (this.playerShip && this.enemyShip) {
        center.addVectors(this.playerShip.position, this.enemyShip.position).multiplyScalar(0.5);
      }

      this.camera.position.lerp(this.targetCameraPos, 0.03);
      this.camera.lookAt(center);

    } else if (this.cameraMode === 'deck') {
      if (this.playerShip) {
        const deckPos = this.playerShip.position.clone().add(new THREE.Vector3(0, 6.2, -10));
        this.camera.position.lerp(deckPos, 0.08);

        if (this.enemyShip) {
          this.camera.lookAt(this.enemyShip.position.clone().add(new THREE.Vector3(0, 3, 0)));
        }
      }
    } else if (this.cameraMode === 'orbit') {
      if (this.controls) {
        this.controls.update();
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    if (this.environment) {
      this.environment.updateOcean(elapsedTime);
    }

    if (this.playerShip) {
      ShipBuilder.updateShipAnimation(this.playerShip, elapsedTime, 0.4, 1.2);
      if (this.playerShip.userData.chimney && this.particles) {
        const chimneyWorldPos = new THREE.Vector3();
        this.playerShip.userData.chimney.getWorldPosition(chimneyWorldPos);
        chimneyWorldPos.y += 4;
        this.particles.emitChimneySmoke(chimneyWorldPos, 0.7);
      }

      // Humareda continua de daño de combate en el casco del jugador tras el primer cañonazo
      if (this.playerDamaged && this.particles && Math.random() > 0.35) {
        const damagePos = this.playerShip.position.clone().add(new THREE.Vector3(1.5, 2.2, -3.0));
        this.particles.emitChimneySmoke(damagePos, 1.8);
      }
    }

    if (this.enemyShip) {
      ShipBuilder.updateShipAnimation(this.enemyShip, elapsedTime, 0.35, 1.0);
      if (this.enemyShip.userData.chimney && this.particles) {
        const chimneyWorldPos = new THREE.Vector3();
        this.enemyShip.userData.chimney.getWorldPosition(chimneyWorldPos);
        chimneyWorldPos.y += 5;
        this.particles.emitChimneySmoke(chimneyWorldPos, 1.1);
      }

      if (this.enemyShip.userData.turret && this.playerShip) {
        const turretPos = new THREE.Vector3();
        this.enemyShip.userData.turret.getWorldPosition(turretPos);
        const targetPos = this.playerShip.position.clone();
        const dir = targetPos.sub(turretPos);
        const targetAngle = Math.atan2(dir.x, dir.z);
        this.enemyShip.userData.turret.rotation.y = THREE.MathUtils.lerp(
          this.enemyShip.userData.turret.rotation.y,
          targetAngle - this.enemyShip.rotation.y,
          0.02
        );
      }
    }

    if (this.particles) {
      this.particles.update(delta);
    }

    this.updateCamera(elapsedTime);
    this.renderer.render(this.scene, this.camera);
  }
}

// Inicialización segura e instantánea tolerante a race conditions de DOMContentLoaded
function bootNavalGame() {
  if (!window.game) {
    window.game = new NavalBattleGame();
    window.game.init();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootNavalGame);
} else {
  bootNavalGame();
}
