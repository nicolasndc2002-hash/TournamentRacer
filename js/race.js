/* ==========================================================================
   RACE SIMULATOR - RACE SIMULATION ENGINE (js/race.js)
   ========================================================================== */

const Race = {
  RACING_PHYSICS: {
    maxSpeed: 0.045,
    minCornerSpeed: 0.42,
    lookAhead: 50,
    brakingStrength: 300.0,
    accelerationStrength: 1.0,
    curveSensitivity: 2.25,
    curvatureSample: 18,
    profileSamples: 240,
    controlInfluence: 0.25
  },
  activeSession: null,
  animFrameId: null,
  isPaused: false,
  speedMultiplier: 1,
  qualifySession: null,
  selectedTeamIds: null,
  povDriverId: null,
  showNameTags: true,
  camX: null,
  camY: null,
  povZoomFactor: 1,
  freeCameraZoomFactor: 1,
  freeCameraViewBox: null,
  freeCameraDrag: null,

  // Prompt user to select participating teams (up to 10 teams / 20 drivers)
  promptTeamSelection(gpData) {
    // Guarda o gpData na instância para evitar serialização inline nos event handlers
    this._pendingGpData = gpData;

    let teams = Storage.getTeams();
    const drivers = Storage.getDrivers();

    // Filtra equipes pela divisão do GP — SEMPRE, usando o campo divisionId do gpData
    const divId = gpData?.divisionId || null;
    if (divId) {
      teams = teams.filter(t => (t.divisionId || 'div_a') === divId);
    }

    const division = Storage.getDivisions().find(d => d.id === divId);
    const divLabel = division ? ` — ${division.name}` : '';

    const modalHtml = `
      <div class="modal-backdrop active" id="team-select-modal">
        <div class="modal-content" style="max-width: 650px;">
          <div class="modal-header">
            <div>
              <h3>🏎️ Escolha as Equipes Participantes</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                Selecione quais escuderias disputarão o <strong>${Utils.escapeHtml(gpData.name)}</strong>${Utils.escapeHtml(divLabel)}. Todos os pilotos das equipes selecionadas participarão.
              </p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('team-select-modal')">✕</button>
          </div>
          <form id="team-select-form" onsubmit="Race.confirmTeamSelection(event)">
            <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span id="selected-team-counter" style="font-weight: 700; font-size: 0.85rem; color: var(--accent-cyan);">
                  Equipes Selecionadas: ${teams.length} / ${teams.length}
                </span>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="Race.toggleAllTeams(true)">Marcar Todas</button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="Race.toggleAllTeams(false)">Desmarcar Todas</button>
                </div>
              </div>

              ${teams.length === 0 ? `
                <div style="text-align:center;padding:32px;color:var(--text-dim);">
                  <div style="font-size:2rem;margin-bottom:8px;">🏎️</div>
                  Nenhuma equipe cadastrada nesta série. Acesse <strong>Equipes</strong> e defina a divisão correta.
                </div>
              ` : ''}

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${teams.map(team => {
                  const teamDrivers = drivers.filter(d => d.teamId === team.id);
                  return `
                    <label class="glass-panel" style="padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-color: ${team.color}40;">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <input type="checkbox" class="team-checkbox" value="${team.id}" checked onchange="Race.updateTeamCounter()">
                        <span style="font-size: 1.3rem;">${team.logo || '🏎️'}</span>
                        <div>
                          <strong style="font-size: 0.95rem;">${Utils.escapeHtml(team.name)}</strong>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">
                            ${teamDrivers.length} pilotos: ${teamDrivers.map(d => `#${d.number} ${d.name}`).join(', ') || 'Nenhum piloto'}
                          </div>
                        </div>
                      </div>
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: ${team.color}; display: inline-block;"></span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal('team-select-modal')">Cancelar</button>
              <button type="submit" class="btn btn-primary" ${teams.length === 0 ? 'disabled' : ''}>Avançar para o Qualifying ➔</button>
            </div>
          </form>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
  },

  updateTeamCounter() {
    const checkboxes = document.querySelectorAll('.team-checkbox:checked');
    const counter = document.getElementById('selected-team-counter');
    if (counter) {
      const total = document.querySelectorAll('.team-checkbox').length;
      counter.textContent = `Equipes Selecionadas: ${checkboxes.length} / ${total}`;
      counter.style.color = checkboxes.length === 0 ? 'var(--accent-red)' : 'var(--accent-cyan)';
    }
  },

  toggleAllTeams(checkAll) {
    const checkboxes = document.querySelectorAll('.team-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = checkAll;
    });
    this.updateTeamCounter();
  },

  confirmTeamSelection(e) {
    e.preventDefault();
    const gpData = this._pendingGpData;
    if (!gpData) {
      alert('Erro: dados do GP não encontrados. Tente novamente.');
      return;
    }

    const checked = Array.from(document.querySelectorAll('.team-checkbox:checked')).map(cb => cb.value);

    if (checked.length === 0) {
      alert('Selecione pelo menos 1 equipe para disputar o GP!');
      return;
    }

    this.selectedTeamIds = checked;
    App.closeModal('team-select-modal');
    this.startQualify(gpData, this.selectedTeamIds);
  },

  // Start Qualify Session before Main GP
  startQualify(gpData, teamIds = null) {
    let drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const tracks = Storage.getTracks();
    const track = tracks.find(t => t.id === gpData.trackId) || tracks[0];

    if (gpData.driverIds && gpData.driverIds.length > 0) {
      drivers = drivers.filter(d => gpData.driverIds.includes(d.id));
    } else if (teamIds && teamIds.length > 0) {
      drivers = drivers.filter(d => teamIds.includes(d.teamId));
    }

    // Sem limite de pilotos — todos os pilotos das equipes selecionadas participam

    // Qualifying now runs through the same visual simulation as the race.
    const qualifyRacers = drivers.map((driver, index) => {
      const team = teams.find(t => t.id === driver.teamId) || { color: '#00e5ff', secondaryColor: '#ffffff', name: 'Privada' };
      // Base Qualify Lap ~ 70s to 85s
      const baseTimeMs = 75000;
      const speedBonus = (driver.attributes.speed - 50) * 120;
      const accelBonus = (driver.attributes.acceleration - 50) * 80;
      const ctrlBonus = (driver.attributes.control - 50) * 70;
      const brakingBonus = ((driver.attributes.braking ?? 75) - 50) * 55;
      const rngNoise = (Math.random() - 0.5) * (100 - driver.attributes.consistency) * 50;

      const lapTimeMs = Math.max(45000, Math.round((baseTimeMs - (speedBonus + accelBonus + ctrlBonus + brakingBonus) + rngNoise) * this.getTrackDistanceFactor(track)));

      return {
        driverId: driver.id,
        name: driver.name,
        nationality: driver.nationality,
        code: driver.code,
        number: driver.number,
        teamId: driver.teamId,
        teamName: team.name,
        color: driver.color || team.color,
        teamPrimaryColor: team.color || driver.color || '#00e5ff',
        attributes: Utils.cloneDriverAttributes(driver && driver.attributes),
        gridPos: index + 1,
        currentPos: index + 1,
        lateralOffsetPx: (index % 2 === 0 ? -1 : 1) * 10,
        progress: 0,
        lap: 0,
        lapStartTime: 0,
        currentLapTime: 0,
        bestLapTime: null,
        totalTimeMs: 0,
        qualifyTargetTimeMs: lapTimeMs,
        isFinished: false,
        lastLapLogged: -1
      };
    });

    this.qualifySession = {
      gp: gpData,
      track: track,
      results: [],
      poleLapMs: 0
    };

      this.startVisualSession(gpData, track, qualifyRacers, gpData.qualifyLaps || 5, true);
  },

  startVisualSession(gpData, track, racers, totalLaps, isQualify = false) {
    const settings = Storage.getSettings();
    this.activeSession = {
      gp: gpData,
      track,
      totalLaps,
      racers,
      simTimeMs: 0,
      realStartTime: performance.now(),
      leaderboard: [...racers],
      fastestLap: { driverName: null, timeMs: null },
      events: [],
      frames: [],
      finishOrder: [],
      lastFrameTime: 0,
      isFinished: false,
      isQualify,
      isTimeTrial: !!gpData.isTimeTrial,
      trackStartProgress: track.startProgress || 0,
      trackDirection: track.direction === -1 ? -1 : 1
    };
    this.speedMultiplier = settings.simSpeed || 1;
    this.isPaused = false;
    App.navigateTo('race-live');
  },

  finishQualify() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const results = this.calculateBestLapClassification(this.activeSession.racers)
      .map((racer, index) => ({
        driverId: racer.driverId,
        name: racer.name,
        nationality: racer.nationality,
        code: racer.code,
        number: racer.number,
        teamId: racer.teamId,
        teamName: racer.teamName,
        color: racer.color,
        lapTimeMs: racer.bestLapTime,
        gridPos: index + 1,
        attributes: racer.attributes
      }));
    this.qualifySession.results = results;
    this.qualifySession.poleLapMs = results[0]?.lapTimeMs || 75000;
    this.activeSession = null;
    App.navigateTo('qualify-results');
  },

  renderQualifyView() {
    if (!this.qualifySession) {
      return `
        <div class="glass-panel" style="text-align: center; padding: 40px;">
          <h2>Nenhum Qualify em Andamento</h2>
          <button class="btn btn-primary" onclick="App.navigateTo('championship')">Ver Campeonato</button>
        </div>
      `;
    }

    const q = this.qualifySession;
    const pole = q.results[0];

    return `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 1000px; margin: 0 auto;">
        <div class="dashboard-hero" style="padding: 24px;">
          <div class="hero-text">
            <span class="badge" style="background: var(--accent-purple); color: #fff; font-weight: 800; margin-bottom: 8px;">
              ⏱️ SESSÃO DE CLASSIFICAÇÃO (QUALIFYING)
            </span>
            <h2>Grid de Largada: ${Utils.escapeHtml(q.gp.name || q.track.name)}</h2>
            <p>${q.track.name} • ${q.track.country} • Definição das posições oficiais de largada</p>
          </div>
          <div class="hero-cta-group">
            <button class="btn btn-primary btn-lg" onclick="Race.startFromQualify()">
              🚦 Iniciar Corrida Oficial ➔
            </button>
          </div>
        </div>

        <!-- Pole Position Card -->
        <div class="glass-panel" style="border-color: var(--accent-gold); background: linear-gradient(135deg, rgba(255,183,3,0.1) 0%, rgba(22,28,39,0.8) 100%);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="font-size: 2.5rem;">👑</div>
              <div>
                <span class="badge" style="background: var(--accent-gold); color: #000; font-weight: 900; margin-bottom: 4px;">
                  POLE POSITION
                </span>
                <h3 style="font-size: 1.4rem; font-weight: 800;">${Utils.getCountryFlag(pole.nationality)} ${Utils.escapeHtml(pole.name)} (#${pole.number})</h3>
                <span style="font-size: 0.85rem; color: var(--text-muted);">${pole.teamName}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: bold;">Tempo da Pole</div>
              <div style="font-size: 1.8rem; font-family: var(--font-mono); font-weight: 900; color: var(--accent-gold);">
                ${Utils.formatTime(pole.lapTimeMs)}
              </div>
            </div>
          </div>
        </div>

        <!-- Tabela do Grid de Largada -->
        <div class="glass-panel">
          <div class="panel-header">
            <h3 class="panel-title">🏁 Grid Oficial de Largada</h3>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Grid</th>
                  <th>Piloto</th>
                  <th>Equipe</th>
                  <th>Tempo de Qualificação</th>
                  <th>Diferença (Gap)</th>
                </tr>
              </thead>
              <tbody>
                ${q.results.map((res, idx) => {
                  const gap = idx === 0 ? 'POLE' : `+${((res.lapTimeMs - q.poleLapMs) / 1000).toFixed(3)}s`;
                  return `
                    <tr>
                      <td><strong style="font-size: 1.1rem; ${idx === 0 ? 'color: var(--accent-gold);' : ''}">P${res.gridPos}</strong></td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${res.color};"></span>
                          <strong>${Utils.getCountryFlag(res.nationality)} ${Utils.escapeHtml(res.name)}</strong>
                        </div>
                      </td>
                      <td>${Utils.escapeHtml(res.teamName)}</td>
                      <td><span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-purple);">${Utils.formatTime(res.lapTimeMs)}</span></td>
                      <td><span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-muted);">${gap}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  startFromQualify() {
    if (!this.qualifySession) return;
    const gpData = { ...this.qualifySession.gp };
    gpData.trackId = gpData.raceTrackId || gpData.trackId;
    gpData.qualifyResults = this.qualifySession.results.map(result => ({ ...result }));
    this.start(gpData, this.qualifySession.results);
  },

  // Wrapper de retrocompatibilidade (solo)
  startSoloTimeTrial(gpData, driver) {
    this.startTimeTrial(gpData, [driver]);
  },

  // Inicia Time-Trial com 1 ou mais pilotos em pista simultaneamente (simulação real ao vivo)
  startTimeTrial(gpData, driversArray) {
    const teams    = Storage.getTeams();
    const tracks   = Storage.getTracks();
    const settings = Storage.getSettings();

    const track     = tracks.find(t => t.id === gpData.trackId) || tracks[0];
    const totalLaps = gpData.laps || 5;
    const worldRecord = Storage.getTimeTrials()
      .filter(record => record.trackId === track.id && Number.isFinite(record.bestLapMs) && record.bestLapMs > 0)
      .reduce((best, record) => !best || record.bestLapMs < best.bestLapMs ? record : best, null);

    const racers = driversArray.map((driver, index) => {
      const team = teams.find(t => t.id === driver.teamId) || { color: '#00e5ff', secondaryColor: '#ffffff', name: 'Solo' };
      const lateralSide      = (index % 2 === 0) ? -1 : 1;
      const lateralOffsetPx  = lateralSide * 10;
      const gridProgressOffset = -(index * 0.007);

      return {
        driverId: driver.id,
        name: driver.name,
        nationality: driver.nationality,
        code: driver.code,
        number: driver.number,
        teamId: driver.teamId,
        teamName: team.name,
        color: driver.color || team.color,
        teamPrimaryColor: team.color || driver.color || '#00e5ff',
        attributes: Utils.cloneDriverAttributes(driver && driver.attributes),
        gridPos: index + 1,
        currentPos: index + 1,
        lateralOffsetPx,
        progress: gridProgressOffset,
        lap: 0,
        lapStartTime: 0,
        currentLapTime: 0,
        bestLapTime: null,
        totalTimeMs: 0,
        isFinished: false,
        lastLapLogged: -1
      };
    });

    this.activeSession = {
      gp: {
        ...gpData,
        worldRecordMs: worldRecord?.bestLapMs ?? null,
        worldRecordHolder: worldRecord?.driverName || null
      },
      track,
      totalLaps,
      racers,
      simTimeMs: 0,
      realStartTime: performance.now(),
      leaderboard: [...racers],
      fastestLap: { driverName: null, timeMs: null },
      events: [],
      frames: [],
      finishOrder: [],
      lastFrameTime: 0,
      isFinished: false,
      isTimeTrial: !!gpData.isTimeTrial,
      trackStartProgress: track.startProgress || 0,
      trackDirection: track.direction === -1 ? -1 : 1
    };

    this.speedMultiplier = settings.simSpeed || 1;
    this.isPaused = false;

    App.navigateTo('race-live');
    this.initSvgAndLoop();
  },

  // Start new GP simulation (with optional qualify grid)
  start(gpData, customGrid = null) {
    // If no qualify run yet, prompt team selection first!
    if (!customGrid) {
      this.promptTeamSelection(gpData);
      return;
    }

    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const tracks = Storage.getTracks();
    const settings = Storage.getSettings();

    const track = tracks.find(t => t.id === gpData.trackId) || tracks[0];
    const totalLaps = gpData.laps || track.defaultLaps || 15;

    // Use custom grid from qualify
    const racers = customGrid.map((qDriver, index) => {
      const driver = drivers.find(d => d.id === qDriver.driverId) || qDriver;
      const team = teams.find(t => t.id === driver.teamId) || { color: '#00e5ff', secondaryColor: '#ffffff', name: 'Privada' };
      
      // Grid diagonal staggering: P1 is at 0, P2 is slight behind on left/right side, P3 further behind, etc.
      // Offset along track path (progress) + lateral offset (side of track like F1 staggered grid)
      const lateralSide = (index % 2 === 0) ? -1 : 1; // Alternating left (-1) / right (+1)
      const lateralOffsetPx = lateralSide * 10; // 10px to the left or right of center racing line
      const gridProgressOffset = -(index * 0.007); // Stagger along the path

      return {
        driverId: driver.id,
        name: driver.name,
        nationality: driver.nationality,
        code: driver.code,
        number: driver.number,
        teamId: driver.teamId,
        teamName: team.name,
        color: driver.color || team.color,
        teamPrimaryColor: team.color || driver.color || '#00e5ff',
        attributes: Utils.cloneDriverAttributes(driver && driver.attributes),
        gridPos: index + 1,
        currentPos: index + 1,
        lateralOffsetPx: lateralOffsetPx,
        // Simulation path progress: continuous float (0 to totalLaps)
        progress: gridProgressOffset,
        lap: 0,
        lapStartTime: 0,
        currentLapTime: 0,
        bestLapTime: null,
        totalTimeMs: 0,
        isFinished: false,
        lastLapLogged: -1
      };
    });

    this.activeSession = {
      gp: gpData,
      track: track,
      totalLaps: totalLaps,
      racers: racers,
      simTimeMs: 0,
      realStartTime: performance.now(),
      leaderboard: [...racers],
      fastestLap: {
        driverName: null,
        timeMs: null
      },
      events: [],
      frames: [],
      finishOrder: [],
      lastFrameTime: 0,
      isFinished: false,
      isTimeTrial: !!gpData.isTimeTrial,
      trackStartProgress: track.startProgress || 0,
      trackDirection: track.direction === -1 ? -1 : 1
    };

    this.speedMultiplier = settings.simSpeed || 1;
    this.isPaused = false;
    App.navigateTo('race-live');
  },

  startCasual(gpData, selectedDrivers = null) {
    const drivers = (selectedDrivers || Storage.getDrivers())
      .slice().sort(() => Math.random() - 0.5);
    const casualGrid = drivers.map((driver, index) => ({
      driverId: driver.id,
      gridPos: index + 1
    }));
    this.start(gpData, casualGrid);
  },

  renderLiveView() {
    if (!this.activeSession) {
      return `
        <div class="glass-panel" style="text-align: center; padding: 40px;">
          <h2>Nenhuma corrida em andamento</h2>
          <p style="color: var(--text-muted); margin: 12px 0 20px;">Inicie um Grande Prêmio a partir do Campeonato ou do Dashboard.</p>
          <button class="btn btn-primary" onclick="App.navigateTo('championship')">Ver Campeonato</button>
        </div>
      `;
    }

    const session = this.activeSession;
    const settings = Storage.getSettings();

    setTimeout(() => this.initSimulationLoop(), 50);

    return `
      <div class="race-container">
        <!-- LADO ESQUERDO: Leaderboard em Tempo Real -->
        <div class="race-leaderboard-panel">
          <div class="leaderboard-header">
            <span>Classificação ao Vivo</span>
            <span style="font-size: 0.7rem; color: var(--accent-cyan); font-family: var(--font-mono);">TEMPO REAL</span>
          </div>
          <div class="leaderboard-list" id="race-leaderboard-list">
            <!-- Dynamic Rows rendered via updateUI() -->
          </div>
        </div>

        <div class="race-panel-resizer" id="race-leaderboard-resizer" role="separator" aria-label="Ajustar largura da classificação ao vivo" title="Arraste para ajustar a largura"></div>

        <!-- CENTRO: Circuito SVG e Bolinhas dos Pilotos -->
        <div class="race-center-panel">
          <div class="track-view-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="track-name-badge">🏁 ${session.isQualify ? 'QUALIFYING · ' : ''}${Utils.escapeHtml(session.gp.name || session.track.name)}</span>
              <span id="pov-camera-badge" title="Use a roda do mouse para aproximar ou afastar" style="display: none; align-items: center; gap: 6px; background: rgba(0, 229, 255, 0.15); color: var(--accent-cyan); font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid var(--accent-cyan);">
                🎥 POV: <span id="pov-driver-name"></span>
                <button id="pov-reset-btn" style="background: none; border: 1px solid var(--accent-cyan); color: var(--accent-cyan); border-radius: 10px; padding: 1px 7px; font-size: 0.7rem; cursor: pointer; margin-left: 4px;" title="Sair do modo POV">✕ Sair</button>
              </span>
            </div>
            <span class="badge" style="background: var(--bg-tertiary);">
              ${Utils.getCountryFlag(session.track.country)} ${session.track.lengthKm} km
            </span>
          </div>

          <!-- Overlay de Luzes de Largada -->
          <div class="start-lights-overlay" id="start-lights-overlay">
            <div class="start-gantry">
              <div class="light-bulb" id="light-1"></div>
              <div class="light-bulb" id="light-2"></div>
              <div class="light-bulb" id="light-3"></div>
              <div class="light-bulb" id="light-4"></div>
              <div class="light-bulb" id="light-5"></div>
            </div>
            <div class="start-message" id="start-message">PREPAREM OS MOTORES...</div>
          </div>

          <div class="svg-track-wrapper">
            <svg id="race-svg" viewBox="${session.track.viewBox || '0 0 1000 600'}">
              <path id="svg-race-path-kerb" d="${session.track.svgPath}" class="track-kerb-border" />
              <path id="svg-race-path-bg" d="${session.track.svgPath}" class="track-asphalt-bg" />
              <path id="svg-race-path" d="${session.track.svgPath}" class="track-racing-line" />
              <!-- Start / Finish Line Indicator -->
              <line id="race-start-line" class="builder-start-line" x1="0" y1="0" x2="0" y2="0" />

              <!-- Driver Dots Overlay -->
              <g id="svg-racers-group"></g>
            </svg>
          </div>
        </div>

        <!-- LADO DIREITO: Telemetria e Controles -->
        <div class="race-telemetry-panel">
          <div class="telemetry-card">
            <div class="telemetry-item-title">${session.isQualify ? 'Volta de Qualificação' : 'Volta Atual'}</div>
            <div class="lap-counter-wrapper">
              <span class="telemetry-big-val" id="telemetry-curr-lap" style="color: var(--accent-cyan);">1</span>
              <span class="lap-total">/ ${session.totalLaps}</span>
            </div>
          </div>

          <div class="telemetry-card">
            <div class="telemetry-item-title">Líder da Prova</div>
            <div class="telemetry-big-val" id="telemetry-leader-name" style="font-size: 1.15rem; color: var(--accent-gold);">
              Iniciando...
            </div>
          </div>

          <div class="telemetry-card fastest-lap-box">
            <div class="telemetry-item-title" style="color: var(--accent-purple);">⚡ Melhor Volta da Corrida</div>
            <div class="fastest-lap-time" id="telemetry-fastest-lap-time">--:--.---</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);" id="telemetry-fastest-lap-driver">Aguardando voltas</div>
          </div>

          ${session.isTimeTrial ? `
            <div class="telemetry-card world-record-box">
              <div class="telemetry-item-title">🏆 WR ATUAL DA PISTA</div>
              <div class="fastest-lap-time">${session.gp.worldRecordMs !== null ? Utils.formatTime(session.gp.worldRecordMs) : 'SEM RECORDE'}</div>
              ${session.gp.worldRecordHolder ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${Utils.escapeHtml(session.gp.worldRecordHolder)}</div>` : ''}
            </div>
          ` : ''}

          <div class="telemetry-card">
            <div class="telemetry-item-title">Clima & Condições</div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600;">
              <span>☀️ Pista Seca (28°C)</span>
            </div>
          </div>

          <div class="race-controls-panel">
            <div class="grid-2">
              <button class="btn btn-secondary btn-sm" id="btn-pause-sim" onclick="Race.togglePause()">⏸ Pausar</button>
              <button class="btn btn-secondary btn-sm" id="btn-speed-sim" onclick="Race.cycleSpeed()">⏩ ${this.speedMultiplier}x</button>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-nametag-sim" aria-pressed="${this.showNameTags}" onclick="Race.toggleNameTags()">🏷️ Nametags: ${this.showNameTags ? 'Ligadas' : 'Desligadas'}</button>
            <button class="btn btn-danger btn-sm" onclick="Race.abortRace()">Cancelar ${session.isQualify ? 'Qualifying' : 'Corrida'}</button>
          </div>
        </div>
      </div>
    `;
  },

  initSimulationLoop() {
    if (!this.activeSession) return;
    const pathElement = document.getElementById('svg-race-path');
    if (!pathElement) return;

    this.pathLength = pathElement.getTotalLength();
    this.buildTrackDynamics(pathElement);
    this.lastFrameTime = performance.now();
    this.updateRaceStartMarker();
    
    // Create SVG Racer elements
    const racersGroup = document.getElementById('svg-racers-group');
    if (racersGroup) {
      racersGroup.innerHTML = '';
      const displayMode = Storage.getSettings().driverDisplayMode;

      this.activeSession.racers.forEach((r, index) => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', `dot-group-${r.driverId}`);
        group.setAttribute('class', 'driver-dot-group');
        group.setAttribute('role', 'button');
        group.setAttribute('tabindex', '0');
        group.setAttribute('aria-label', `Ativar câmera POV de ${r.name}`);
        group.style.cursor = 'pointer';
        group.addEventListener('pointerdown', event => {
          event.stopPropagation();
          Race.setPovDriver(r.driverId);
        });
        group.addEventListener('keydown', event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          Race.setPovDriver(r.driverId);
        });

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'driver-dot-outer');
        circle.setAttribute('fill', r.teamPrimaryColor || r.color);
        circle.setAttribute('stroke', '#ffffff');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'driver-dot-text');
        text.textContent = displayMode === 'code' ? (r.code || 'DRV') : r.number;

        const nametag = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nametag.setAttribute('class', 'driver-nametag');
        nametag.style.display = this.showNameTags ? '' : 'none';
        nametag.style.pointerEvents = 'none';
        nametag.setAttribute('aria-label', `${r.nationality || ''} ${r.name}`.trim());
        r.nametagOffsetY = -24;
        nametag.setAttribute('transform', `translate(0 ${r.nametagOffsetY})`);
        const flagCode = Utils._countryCodeMap?.[r.nationality];
        const fullLabel = flagCode ? r.name : `${Utils.getCountryFlagText(r.nationality)} ${r.name}`;
        const labelCharacters = Array.from(fullLabel);
        const visibleLabel = labelCharacters.length > 17
          ? `${labelCharacters.slice(0, 16).join('')}…`
          : fullLabel;

        const nametagTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        nametagTitle.textContent = fullLabel;
        nametag.appendChild(nametagTitle);

        const nametagBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        nametagBg.setAttribute('class', 'driver-nametag-bounds');
        nametagBg.setAttribute('x', '39');
        nametagBg.setAttribute('y', '-10');
        nametagBg.setAttribute('width', '150');
        nametagBg.setAttribute('height', '20');
        nametagBg.setAttribute('rx', '3');
        nametagBg.setAttribute('fill', 'none');
        nametagBg.setAttribute('stroke', 'none');

        const tagStem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tagStem.setAttribute('class', 'driver-nametag-line');
        tagStem.setAttribute('x1', '6');
        tagStem.setAttribute('y1', String(-r.nametagOffsetY));
        tagStem.setAttribute('x2', '24');
        tagStem.setAttribute('y2', '0');

        const tagAnchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        tagAnchor.setAttribute('class', 'driver-nametag-anchor');
        tagAnchor.setAttribute('cx', '24');
        tagAnchor.setAttribute('cy', '0');
        tagAnchor.setAttribute('r', '3');

        const tagRule = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tagRule.setAttribute('class', 'driver-nametag-line');
        tagRule.setAttribute('x1', '27');
        tagRule.setAttribute('y1', '0');
        tagRule.setAttribute('x2', '39');
        tagRule.setAttribute('y2', '0');

        const nametagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nametagText.setAttribute('class', 'driver-nametag-text');
        nametagText.setAttribute('x', flagCode ? '62' : '42');
        nametagText.setAttribute('y', '0');
        nametagText.textContent = visibleLabel;
        nametag.appendChild(nametagBg);
        nametag.appendChild(tagStem);
        nametag.appendChild(tagAnchor);
        nametag.appendChild(tagRule);
        if (flagCode) {
          const flag = document.createElementNS('http://www.w3.org/2000/svg', 'image');
          flag.setAttribute('class', 'driver-nametag-flag');
          flag.setAttribute('href', `https://flagcdn.com/w20/${flagCode}.png`);
          flag.setAttribute('x', '42');
          flag.setAttribute('y', '-6');
          flag.setAttribute('width', '16');
          flag.setAttribute('height', '12');
          nametag.appendChild(flag);
        }
        nametag.appendChild(nametagText);

        group.appendChild(circle);
        group.appendChild(text);
        group.appendChild(nametag);
        racersGroup.appendChild(group);
      });
    }

    this.initLeaderboardResizer();

    // Reset POV state when starting a new session
    this.povDriverId = null;
    this.camX = null;
    this.camY = null;
    this.povZoomFactor = 1;
    this.freeCameraZoomFactor = 1;
    this.freeCameraViewBox = null;
    this.freeCameraDrag = null;

    const svgEl = document.getElementById('race-svg');
    if (svgEl) {
      svgEl.onwheel = event => {
        event.preventDefault();
        if (this.povDriverId) {
          this.adjustPovZoom(event.deltaY);
        } else {
          this.adjustFreeCameraZoom(event.deltaY, event.clientX, event.clientY);
        }
      };
      svgEl.onpointerdown = event => this.startFreeCameraPan(event);
      svgEl.onpointermove = event => this.moveFreeCameraPan(event);
      svgEl.onpointerup = event => this.endFreeCameraPan(event);
      svgEl.onpointercancel = event => this.endFreeCameraPan(event);
    }

    // Wire up the static POV reset button via addEventListener (not inline onclick)
    const povResetBtn = document.getElementById('pov-reset-btn');
    if (povResetBtn) {
      povResetBtn.onclick = null;
      povResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Race.setPovDriver(null);
      });
    }

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    
    // Posicionar carros no grid inicialmente
    this.updatePhysics(0);
    this.updateUI();

    // Trigger Countdown de Largada antes de liberar a movimentação
    this.isStarting = true;
    this.triggerStartLightsCountdown();
  },

  updateRaceStartMarker() {
    const session = this.activeSession;
    const path = document.getElementById('svg-race-path');
    const line = document.getElementById('race-start-line');
    if (!session || !path || !line) return;
    const distance = Math.max(0, Math.min(0.999, session.trackStartProgress || 0)) * this.pathLength;
    const point = path.getPointAtLength(distance);
    const nextDistance = (distance + session.trackDirection * Math.max(8, this.pathLength * 0.01) + this.pathLength) % this.pathLength;
    const next = path.getPointAtLength(nextDistance);
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const size = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / size;
    const ny = dx / size;
    line.setAttribute('x1', point.x - nx * 18);
    line.setAttribute('y1', point.y - ny * 18);
    line.setAttribute('x2', point.x + nx * 18);
    line.setAttribute('y2', point.y + ny * 18);
  },

  triggerStartLightsCountdown() {
    const overlay = document.getElementById('start-lights-overlay');
    const msg = document.getElementById('start-message');
    if (!overlay) {
      this.isStarting = false;
      this.lastFrameTime = performance.now();
      this.loop = this.loop.bind(this);
      this.animFrameId = requestAnimationFrame(this.loop);
      return;
    }

    overlay.classList.remove('hidden');
    let lightCount = 1;

    const interval = setInterval(() => {
      if (lightCount <= 5) {
        const light = document.getElementById(`light-${lightCount}`);
        if (light) light.classList.add('red');
        lightCount++;
      } else {
        clearInterval(interval);
        // Random pause between 0.8s and 2s before lights out (like real F1)
        setTimeout(() => {
          for (let i = 1; i <= 5; i++) {
            const light = document.getElementById(`light-${i}`);
            if (light) light.classList.remove('red');
          }
          if (msg) {
            msg.textContent = 'LARGADA! GREEN LIGHTS!';
            msg.classList.add('green');
          }
          
          setTimeout(() => {
            if (overlay) overlay.classList.add('hidden');
            this.isStarting = false;
            this.lastFrameTime = performance.now();
            this.loop = this.loop.bind(this);
            this.animFrameId = requestAnimationFrame(this.loop);
          }, 600);
        }, Utils.randomInt(700, 1600));
      }
    }, 700);
  },

  loop(currentTime) {
    if (!this.activeSession || this.activeSession.isFinished || this.isStarting) return;

    const delta = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    if (!this.isPaused && delta > 0 && delta < 1) {
      this.updatePhysics(delta * this.speedMultiplier);
      this.updateUI();
      this.captureReplayFrame();
    }

    if (!this.activeSession.isFinished) {
      this.animFrameId = requestAnimationFrame(this.loop);
    } else {
      if (this.activeSession.isQualify) {
        this.finishQualify();
      } else {
        this.finishRace();
      }
    }
  },

  buildTrackDynamics(pathElement) {
    const config = this.RACING_PHYSICS;
    const sampleCount = Math.max(48, Math.min(config.profileSamples, Math.ceil(this.pathLength / config.curvatureSample)));
    const spacing = this.pathLength / sampleCount;
    const tangentSample = Math.max(config.curvatureSample, spacing * 1.5);
    const curvature = [];

    for (let index = 0; index < sampleCount; index++) {
      const distance = index * spacing;
      const previous = pathElement.getPointAtLength((distance - tangentSample + this.pathLength) % this.pathLength);
      const current = pathElement.getPointAtLength(distance);
      const next = pathElement.getPointAtLength((distance + tangentSample) % this.pathLength);
      const incomingX = current.x - previous.x;
      const incomingY = current.y - previous.y;
      const outgoingX = next.x - current.x;
      const outgoingY = next.y - current.y;
      const incomingLength = Math.hypot(incomingX, incomingY) || 1;
      const outgoingLength = Math.hypot(outgoingX, outgoingY) || 1;
      const cosine = Math.max(-1, Math.min(1, (incomingX * outgoingX + incomingY * outgoingY) / (incomingLength * outgoingLength)));
      const turn = Math.min(1, (Math.acos(cosine) / Math.PI) * config.curveSensitivity * 2.5);
      curvature.push(turn);
    }

    this.trackDynamics = { curvature, spacing, sampleCount };
  },

  getTrackCurvature(distance) {
    const dynamics = this.trackDynamics;
    if (!dynamics) return 0;
    const wrappedDistance = ((distance % this.pathLength) + this.pathLength) % this.pathLength;
    const position = wrappedDistance / dynamics.spacing;
    const lowerIndex = Math.floor(position) % dynamics.sampleCount;
    const upperIndex = (lowerIndex + 1) % dynamics.sampleCount;
    const fraction = position - Math.floor(position);
    return dynamics.curvature[lowerIndex] + (dynamics.curvature[upperIndex] - dynamics.curvature[lowerIndex]) * fraction;
  },

  getAnticipatedCurvature(normalizedProgress, direction) {
    const config = this.RACING_PHYSICS;
    const currentDistance = normalizedProgress * this.pathLength;
    const lookAhead = Math.min(config.lookAhead, this.pathLength * 0.25);
    const samples = Math.max(4, Math.ceil(lookAhead / Math.max(config.curvatureSample, 1)));
    let anticipated = this.getTrackCurvature(currentDistance);

    for (let index = 1; index <= samples; index++) {
      const distanceAhead = (lookAhead * index) / samples;
      const weight = 1 - (distanceAhead / lookAhead) * 0.35;
      anticipated = Math.max(anticipated, this.getTrackCurvature(currentDistance + direction * distanceAhead) * weight);
    }
    return Math.min(1, anticipated);
  },

  getCornerSpeedFactor(curvature, control) {
    const config = this.RACING_PHYSICS;
    const skill = Math.max(0, Math.min(1, Number(control) / 100));
    const minimumSpeed = config.minCornerSpeed + (skill * config.controlInfluence);
    return 1 - (curvature * (1 - minimumSpeed));
  },

  getTrackDistanceFactor(track) {
    const lengthKm = Number(track?.lengthKm);
    if (!Number.isFinite(lengthKm) || lengthKm <= 0) return 1;
    return Math.max(0.55, Math.min(1.8, lengthKm / 5));
  },

  smoothRacerSpeed(racer, targetFactor, dt, accelerationSkill, brakingSkill) {
    const currentFactor = racer.visualSpeedFactor ?? 1;
    const skill = targetFactor < currentFactor ? brakingSkill : accelerationSkill;
    const skillFactor = 0.55 + (Math.max(0, Math.min(100, Number(skill) || 75)) / 100) * 0.9;
    const responseStrength = (targetFactor < currentFactor
      ? this.RACING_PHYSICS.brakingStrength
      : this.RACING_PHYSICS.accelerationStrength) * skillFactor;
    const response = 1 - Math.exp(-Math.max(0, dt) * responseStrength);
    racer.visualSpeedFactor = currentFactor + (targetFactor - currentFactor) * response;
    return racer.visualSpeedFactor;
  },

  updatePhysics(dt) {
    const session = this.activeSession;
    session.simTimeMs += (dt * 1000);
    const pathElement = document.getElementById('svg-race-path');
    if (!pathElement) return;

    let allFinished = true;

    session.racers.forEach(racer => {
      if (racer.isFinished) return;
      allFinished = false;

      // Base lap baseline speed ~ 20 to 30 seconds per lap
      // Attribute calculation: speed + accel + control + consistency RNG
      const attrs = racer.attributes || {};
      const speedAttr = attrs.speed ?? 85;
      const ctrlAttr = attrs.control ?? 85;
      const consistencyAttr = attrs.consistency ?? 85;
      const accelAttr = attrs.acceleration ?? 85;
      const brakingAttr = attrs.braking ?? 75;

      const attrSpeedFactor = speedAttr / 100;
      const attrCtrlFactor = ctrlAttr / 100;
      const consistencyFactor = consistencyAttr / 100;

      // Dynamic RNG with consistency dampening
      const rngNoise = (Math.random() - 0.5) * (1 - consistencyFactor * 0.7) * 0.15;
      
      // Calculate speed along track (synchronized speed across both Qualify and Official Races)
      const baseLapSpeed = this.RACING_PHYSICS.maxSpeed / this.getTrackDistanceFactor(session.track);
      const normalizedProgress = ((session.trackStartProgress + (session.trackDirection * racer.progress)) % 1 + 1) % 1;
      const anticipatedCurvature = this.getAnticipatedCurvature(normalizedProgress, session.trackDirection);
      const straightSpeedFactor = 0.78 + (attrSpeedFactor * 0.22);
      const cornerSpeedFactor = this.getCornerSpeedFactor(anticipatedCurvature, ctrlAttr);
      const targetSpeedFactor = Math.max(0.35, (straightSpeedFactor * cornerSpeedFactor) + rngNoise);
      const currentSpeed = baseLapSpeed * this.smoothRacerSpeed(
        racer,
        targetSpeedFactor,
        dt,
        accelAttr,
        brakingAttr
      );
      const previousProgress = racer.progress;
      racer.currentSpeed = currentSpeed;

      racer.progress += currentSpeed * dt;
      racer.totalTimeMs = session.simTimeMs;

      // Calculate current lap
      const currentLap = Math.max(1, Math.floor(racer.progress) + 1);
      racer.lap = currentLap;

      // Check Lap completion
      if (currentLap > racer.lastLapLogged && racer.progress >= 1) {
        if (racer.lastLapLogged >= 1) {
          // A full lap completed
          const lapDurationMs = session.simTimeMs - racer.lapStartTime;
          if (!racer.bestLapTime || lapDurationMs < racer.bestLapTime) {
            racer.bestLapTime = lapDurationMs;
          }
          if (!session.fastestLap.timeMs || lapDurationMs < session.fastestLap.timeMs) {
            session.fastestLap = {
              driverName: racer.name,
              driverId: racer.driverId,
              timeMs: lapDurationMs
            };
            session.events.push({
              timeMs: session.simTimeMs,
              type: 'fastest_lap',
              text: `⚡ Nova melhor volta: ${racer.name} (${Utils.formatTime(lapDurationMs)})`
            });
          }
        }
        racer.lapStartTime = session.simTimeMs;
        racer.lastLapLogged = currentLap;
      }

      // Check race finish
      if (racer.progress >= session.totalLaps) {
        racer.isFinished = true;
        racer.progress = session.totalLaps;
        const progressDelta = racer.progress - previousProgress;
        const finishFraction = progressDelta > 0 ? (session.totalLaps - previousProgress) / progressDelta : 1;
        racer.finishTimeMs = racer.finishTimeMs || session.simTimeMs - (dt * 1000) + (finishFraction * dt * 1000);
        racer.finishOrder = session.finishOrder.length + 1;
        session.finishOrder.push(racer.driverId);
      }

      // Update SVG Position with F1 staggered lateral offsets
      const point = pathElement.getPointAtLength(normalizedProgress * this.pathLength);
      let renderX = point.x;
      let renderY = point.y;

      if (racer.progress < 0.05 && racer.lateralOffsetPx) {
        // Sample next point on path for direction tangent
        const nextPos = ((normalizedProgress + session.trackDirection * 0.002) % 1 + 1) % 1;
        const nextPoint = pathElement.getPointAtLength(nextPos * this.pathLength);
        const dx = nextPoint.x - point.x;
        const dy = nextPoint.y - point.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        // Normal perpendicular vector (-dy, dx)
        const nx = -dy / len;
        const ny = dx / len;

        // Fade out lateral offset smoothly as cars gain speed off the grid
        const fadeFactor = Math.max(0, 1 - (racer.progress / 0.05));
        renderX += nx * (racer.lateralOffsetPx * fadeFactor);
        renderY += ny * (racer.lateralOffsetPx * fadeFactor);
      }

      // Guardar coordenadas de render para uso na Câmera POV
      racer.renderX = renderX;
      racer.renderY = renderY;

      const group = document.getElementById(`dot-group-${racer.driverId}`);
      if (group) {
        group.setAttribute('transform', `translate(${renderX}, ${renderY})`);
        if (this.povDriverId === racer.driverId) {
          group.classList.add('is-pov-active');
        } else {
          group.classList.remove('is-pov-active');
        }
      }
    });

    // Câmera Perseguidora POV
    if (this.povDriverId) {
      this.updatePovCamera();
    } else if (this.freeCameraViewBox) {
      const svgEl = document.getElementById('race-svg');
      if (svgEl) {
        const viewBox = this.freeCameraViewBox;
        svgEl.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
      }
    } else {
      this.camX = null;
      this.camY = null;
      const svgEl = document.getElementById('race-svg');
      if (svgEl && session.track && session.track.viewBox) {
        svgEl.setAttribute('viewBox', session.track.viewBox);
      }
    }

    // Once a racer crosses the line, arrival order is the official order.
    session.leaderboard = [...session.racers].sort((a, b) => {
      if (a.isFinished && b.isFinished) return a.finishOrder - b.finishOrder;
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;
      return b.progress - a.progress;
    });
    session.leaderboard.forEach((r, idx) => {
      r.currentPos = idx + 1;
    });

    // Z-INDEX / OVERLAY FIX: Reorder DOM elements inside SVG so the car ahead is rendered on top (last child)
    const racersGroup = document.getElementById('svg-racers-group');
    if (racersGroup) {
      // Sort racers from last place to first place so first place is appended last (top layer)
      const reverseLeaderboard = [...session.leaderboard].reverse();
      reverseLeaderboard.forEach(r => {
        const dotEl = document.getElementById(`dot-group-${r.driverId}`);
        if (dotEl && dotEl.parentNode === racersGroup) {
          racersGroup.appendChild(dotEl);
        }
      });
    }

    if (allFinished) {
      session.isFinished = true;
    }
  },

  calculateBestLapClassification(racers) {
    const withLap = racers
      .filter(racer => Number.isFinite(racer.bestLapTime) && racer.bestLapTime > 0)
      .sort((a, b) => a.bestLapTime - b.bestLapTime);
    const withoutLap = racers.filter(racer => !Number.isFinite(racer.bestLapTime) || racer.bestLapTime <= 0);

    withLap.forEach((racer, index) => {
      racer.currentPos = index + 1;
      racer.isLeader = index === 0;
      racer.gapMs = index === 0 ? null : racer.bestLapTime - withLap[0].bestLapTime;
    });
    withoutLap.forEach((racer, index) => {
      racer.currentPos = withLap.length + index + 1;
      racer.isLeader = false;
      racer.gapMs = null;
    });

    return [...withLap, ...withoutLap];
  },

  formatBestLapGap(diffMs) {
    if (diffMs === null || diffMs === undefined || !Number.isFinite(diffMs)) return '--:--.---';
    if (diffMs < 60000) return `+${(diffMs / 1000).toFixed(3)}`;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = ((diffMs % 60000) / 1000).toFixed(3).padStart(6, '0');
    return `+${minutes}:${seconds}`;
  },

  setPovDriver(driverId) {
    // Allow null explicitly to clear POV
    const next = (driverId && this.povDriverId === driverId) ? null : (driverId || null);
    if (next !== this.povDriverId) this.povZoomFactor = 1;
    this.povDriverId = next;
    this.camX = null;
    this.camY = null;
    this.freeCameraZoomFactor = 1;
    this.freeCameraViewBox = null;
    this.freeCameraDrag = null;
    document.getElementById('race-svg')?.classList.remove('race-svg-camera-pannable', 'race-svg-camera-panning');
    this._updateNametagOffsets();
    this._updatePovBadge();
    this._updateLeaderboardPovClasses();
    if (this.povDriverId) {
      this.updatePovCamera(true);
    } else {
      const session = this.activeSession;
      const svgEl = document.getElementById('race-svg');
      if (svgEl && session && session.track && session.track.viewBox) {
        svgEl.setAttribute('viewBox', session.track.viewBox);
      }
    }
  },

  adjustPovZoom(deltaY) {
    if (!this.povDriverId || !Number.isFinite(deltaY) || deltaY === 0) return;
    const zoomStep = deltaY < 0 ? 1.12 : 1 / 1.12;
    this.povZoomFactor = Math.max(0.5, Math.min(2.4, this.povZoomFactor * zoomStep));
    this.updatePovCamera(true);
  },

  getTrackViewBox() {
    const rawViewBox = this.activeSession?.track?.viewBox || '0 0 1000 600';
    const [x, y, width, height] = rawViewBox.trim().split(/[\s,]+/).map(Number);
    if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
      return { x: 0, y: 0, width: 1000, height: 600 };
    }
    return { x, y, width, height };
  },

  getSvgPointFromClient(svg, clientX, clientY) {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(matrix.inverse());
  },

  adjustFreeCameraZoom(deltaY, clientX, clientY) {
    if (!this.activeSession || !Number.isFinite(deltaY) || deltaY === 0) return;
    const svg = document.getElementById('race-svg');
    if (!svg) return;

    const base = this.getTrackViewBox();
    const current = this.freeCameraViewBox || base;
    const zoomStep = deltaY < 0 ? 1.12 : 1 / 1.12;
    let nextFactor = Math.max(0.5, Math.min(2.4, this.freeCameraZoomFactor * zoomStep));
    if ((this.freeCameraZoomFactor < 1 && nextFactor >= 1) || (this.freeCameraZoomFactor > 1 && nextFactor <= 1)) {
      nextFactor = 1;
    }

    if (Math.abs(nextFactor - 1) < 0.001) {
      this.freeCameraZoomFactor = 1;
      this.freeCameraViewBox = null;
      svg.setAttribute('viewBox', `${base.x} ${base.y} ${base.width} ${base.height}`);
      svg.classList.remove('race-svg-camera-pannable', 'race-svg-camera-panning');
      return;
    }

    const zoomPoint = this.getSvgPointFromClient(svg, clientX, clientY) || {
      x: current.x + current.width / 2,
      y: current.y + current.height / 2
    };
    const width = base.width / nextFactor;
    const height = base.height / nextFactor;
    let x = zoomPoint.x - (zoomPoint.x - current.x) * (width / current.width);
    let y = zoomPoint.y - (zoomPoint.y - current.y) * (height / current.height);

    if (nextFactor >= 1) {
      x = Math.max(base.x, Math.min(base.x + base.width - width, x));
      y = Math.max(base.y, Math.min(base.y + base.height - height, y));
    }

    this.freeCameraZoomFactor = nextFactor;
    this.freeCameraViewBox = { x, y, width, height };
    svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    svg.classList.toggle('race-svg-camera-pannable', nextFactor > 1.001);
    svg.classList.remove('race-svg-camera-panning');
  },

  startFreeCameraPan(event) {
    if (this.povDriverId || this.freeCameraZoomFactor <= 1.001 || event.button !== 0 || event.pointerType !== 'mouse') return;
    const svg = document.getElementById('race-svg');
    const viewBox = this.freeCameraViewBox;
    const rect = svg?.getBoundingClientRect();
    if (!svg || !viewBox || !rect?.width || !rect?.height) return;

    event.preventDefault();
    this.freeCameraDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startViewBox: { ...viewBox },
      rectWidth: rect.width,
      rectHeight: rect.height
    };
    svg.setPointerCapture(event.pointerId);
    svg.classList.add('race-svg-camera-panning');
  },

  moveFreeCameraPan(event) {
    const drag = this.freeCameraDrag;
    if (!drag || event.pointerId !== drag.pointerId || this.povDriverId) return;
    const svg = document.getElementById('race-svg');
    if (!svg) return;

    event.preventDefault();
    const base = this.getTrackViewBox();
    const dx = (event.clientX - drag.startX) * (drag.startViewBox.width / drag.rectWidth);
    const dy = (event.clientY - drag.startY) * (drag.startViewBox.height / drag.rectHeight);
    const x = Math.max(base.x, Math.min(base.x + base.width - drag.startViewBox.width, drag.startViewBox.x - dx));
    const y = Math.max(base.y, Math.min(base.y + base.height - drag.startViewBox.height, drag.startViewBox.y - dy));
    this.freeCameraViewBox = { ...drag.startViewBox, x, y };
    svg.setAttribute('viewBox', `${x} ${y} ${drag.startViewBox.width} ${drag.startViewBox.height}`);
  },

  endFreeCameraPan(event) {
    if (!this.freeCameraDrag || event.pointerId !== this.freeCameraDrag.pointerId) return;
    this.freeCameraDrag = null;
    document.getElementById('race-svg')?.classList.remove('race-svg-camera-panning');
  },

  updatePovCamera(snap = false) {
    const session = this.activeSession;
    const svgEl = document.getElementById('race-svg');
    const povRacer = session?.racers.find(racer => racer.driverId === this.povDriverId);
    if (!povRacer || !svgEl || povRacer.renderX === undefined) return;

    const zoomWidth = 360 / this.povZoomFactor;
    const zoomHeight = 216 / this.povZoomFactor;
    const targetX = povRacer.renderX - zoomWidth / 2;
    const targetY = povRacer.renderY - zoomHeight / 2;
    if (snap || this.camX === null || this.camX === undefined) {
      this.camX = targetX;
      this.camY = targetY;
    } else {
      this.camX += (targetX - this.camX) * 0.15;
      this.camY += (targetY - this.camY) * 0.15;
    }
    svgEl.setAttribute('viewBox', `${this.camX} ${this.camY} ${zoomWidth} ${zoomHeight}`);
  },

  _updateNametagOffsets() {
    const session = this.activeSession;
    if (!session) return;
    session.racers.forEach(racer => {
      const nametag = document.querySelector(`#dot-group-${CSS.escape(racer.driverId)} .driver-nametag`);
      if (!nametag) return;
      const offsetY = racer.driverId === this.povDriverId ? -24 : (racer.nametagOffsetY || -24);
      nametag.setAttribute('transform', `translate(0 ${offsetY})`);
    });
  },

  _updatePovBadge() {
    const session = this.activeSession;
    const badge = document.getElementById('pov-camera-badge');
    const nameEl = document.getElementById('pov-driver-name');
    if (!badge) return;
    if (this.povDriverId && session) {
      const povRacer = session.racers.find(r => r.driverId === this.povDriverId);
      if (nameEl) nameEl.textContent = povRacer ? povRacer.name : '';
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  },

  _updateLeaderboardPovClasses() {
    const listEl = document.getElementById('race-leaderboard-list');
    if (!listEl) return;
    listEl.querySelectorAll('.leaderboard-row').forEach(row => {
      const driverId = row.dataset.driverId;
      const isPov = this.povDriverId === driverId;
      row.classList.toggle('is-pov-selected', isPov);
      const posBadge = row.querySelector('.pos-badge');
      const nameEl = row.querySelector('.driver-name-text');
      if (posBadge) posBadge.dataset.povActive = isPov ? '1' : '0';
      if (nameEl) nameEl.dataset.povActive = isPov ? '1' : '0';
    });
  },

  updateUI() {
    const session = this.activeSession;
    if (!session) return;

    const isBestLapMode = session.isQualify || session.isTimeTrial;
    if (isBestLapMode) {
      session.leaderboard = this.calculateBestLapClassification(session.racers);
    }
    const leader = session.leaderboard[0];
    const maxLap = Math.min(session.totalLaps, Math.max(...session.racers.map(r => r.lap)));

    // Telemetry updates
    const lapEl = document.getElementById('telemetry-curr-lap');
    if (lapEl) lapEl.textContent = maxLap;

    const leaderEl = document.getElementById('telemetry-leader-name');
    if (leaderEl && leader) leaderEl.textContent = `${leader.name} (${leader.teamName})`;

    const fastestTimeEl = document.getElementById('telemetry-fastest-lap-time');
    const fastestDriverEl = document.getElementById('telemetry-fastest-lap-driver');
    if (fastestTimeEl && session.fastestLap.timeMs) {
      fastestTimeEl.textContent = Utils.formatTime(session.fastestLap.timeMs);
      fastestDriverEl.textContent = session.fastestLap.driverName;
    }

    // Leaderboard list render — build rows once per frame,
    // and re-order DOM nodes to match real-time standings
    const listEl = document.getElementById('race-leaderboard-list');
    if (listEl) {
      const existingRows = listEl.querySelectorAll('.leaderboard-row');
      const needRebuild = existingRows.length !== session.leaderboard.length;
      const baseLapSpeed = this.RACING_PHYSICS.maxSpeed / this.getTrackDistanceFactor(session.track);
      const lapTimeMs = (1 / baseLapSpeed) * 1000;

      const getGapTextForRacer = (racer, index) => {
        const isLeader = index === 0;
        if (isBestLapMode) {
          return isLeader ? Utils.formatTime(racer.bestLapTime) : this.formatBestLapGap(racer.gapMs);
        }
        if (racer.isFinished) {
          return 'FIM';
        }
        if (isLeader) {
          return 'LÍDER';
        }
        const progressDiff = leader.progress - racer.progress;
        if (progressDiff >= 1.0) {
          const lapDiff = Math.floor(progressDiff);
          return `+${lapDiff} ${lapDiff === 1 ? 'Volta' : 'Voltas'}`;
        }
        const gapMs = Math.max(0, progressDiff * lapTimeMs);
        return `+${(gapMs / 1000).toFixed(3)}s`;
      };

      if (needRebuild) {
        // Build the HTML once, attach event delegation once
        listEl.innerHTML = session.leaderboard.map((racer, index) => {
          const isLeader = index === 0;
          const isPov = this.povDriverId === racer.driverId;
          const gapText = getGapTextForRacer(racer, index);

          return `
            <div class="leaderboard-row ${isLeader ? 'is-leader' : ''} ${isPov ? 'is-pov-selected' : ''}" data-driver-id="${racer.driverId}" title="Clique para câmera POV" style="cursor: pointer;">
              <div class="pos-badge">${isPov ? '🎥' : `P${index + 1}`}</div>
              <div class="driver-color-indicator" style="background: ${racer.color};"></div>
              <div class="driver-name-block">
                <div class="driver-name-text" style="display:flex;align-items:center;gap:5px;">
                  <span aria-hidden="true">${Utils.getCountryFlag(racer.nationality)}</span>
                  <span>${Utils.escapeHtml(racer.name)}</span>
                </div>
                <div class="driver-team-text">${Utils.escapeHtml(racer.teamName)}</div>
              </div>
              <div class="gap-time-badge" data-gap="1">${gapText}</div>
            </div>
          `;
        }).join('');

        // Attach event delegation once after rebuild
        listEl.onclick = (e) => {
          const row = e.target.closest('.leaderboard-row');
          if (row && row.dataset.driverId) {
            Race.setPovDriver(row.dataset.driverId);
          }
        };
      } else {
        // Keep image nodes mounted; only move rows when their order changes.
        let renderedIds = Array.from(listEl.children).map(row => row.dataset.driverId);
        session.leaderboard.forEach((racer, index) => {
          const row = listEl.querySelector(`[data-driver-id="${racer.driverId}"]`);
          if (!row) return;

          const isLeader = index === 0;
          const isPov = this.povDriverId === racer.driverId;

          row.classList.toggle('is-leader', isLeader);
          row.classList.toggle('is-pov-selected', isPov);

          const posBadge = row.querySelector('.pos-badge');
          if (posBadge) posBadge.textContent = isPov ? '🎥' : `P${index + 1}`;

          const gapEl = row.querySelector('[data-gap]');
          if (gapEl) {
            gapEl.textContent = getGapTextForRacer(racer, index);
          }

          const currentIndex = renderedIds.indexOf(racer.driverId);
          if (currentIndex !== -1 && currentIndex !== index) {
            listEl.insertBefore(row, listEl.children[index] || null);
            renderedIds.splice(currentIndex, 1);
            renderedIds.splice(index, 0, racer.driverId);
          }
        });
      }
    }
  },

  captureReplayFrame() {
    const session = this.activeSession;
    // Capture snapshot every ~150ms of sim time
    if (session.simTimeMs - session.lastFrameTime >= 150) {
      session.lastFrameTime = session.simTimeMs;
      session.frames.push({
        simTimeMs: session.simTimeMs,
        racers: session.racers.map(r => ({
          driverId: r.driverId,
          progress: r.progress,
          lap: r.lap,
          currentPos: r.currentPos,
          isFinished: r.isFinished
        })),
        leaderboardIds: session.leaderboard.map(r => r.driverId)
      });
    }
  },

  togglePause() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById('btn-pause-sim');
    if (btn) btn.textContent = this.isPaused ? '▶ Retomar' : '⏸ Pausar';
  },

  toggleNameTags() {
    this.showNameTags = !this.showNameTags;
    document.querySelectorAll('.driver-nametag').forEach(tag => {
      tag.style.display = this.showNameTags ? '' : 'none';
    });
    const button = document.getElementById('btn-nametag-sim');
    if (button) {
      button.textContent = `🏷️ Nametags: ${this.showNameTags ? 'Ligadas' : 'Desligadas'}`;
      button.setAttribute('aria-pressed', String(this.showNameTags));
    }
  },

  cycleSpeed() {
    const speeds = [1, 2, 4];
    const nextIdx = (speeds.indexOf(this.speedMultiplier) + 1) % speeds.length;
    this.speedMultiplier = speeds[nextIdx];
    const btn = document.getElementById('btn-speed-sim');
    if (btn) btn.textContent = `⏩ ${this.speedMultiplier}x`;
  },

  initLeaderboardResizer() {
    const container = document.querySelector('.race-container');
    const resizer = document.getElementById('race-leaderboard-resizer');
    if (!container || !resizer || resizer.dataset.ready) return;
    resizer.dataset.ready = 'true';
    resizer.addEventListener('pointerdown', (event) => {
      resizer.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startWidth = container.querySelector('.race-leaderboard-panel').getBoundingClientRect().width;
      const move = (moveEvent) => {
        const width = Math.max(220, Math.min(520, startWidth + moveEvent.clientX - startX));
        container.style.setProperty('--leaderboard-width', `${width}px`);
      };
      const stop = () => {
        resizer.removeEventListener('pointermove', move);
        resizer.removeEventListener('pointerup', stop);
        resizer.removeEventListener('pointercancel', stop);
      };
      resizer.addEventListener('pointermove', move);
      resizer.addEventListener('pointerup', stop);
      resizer.addEventListener('pointercancel', stop);
    });
  },

  finishRace() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    
    const session = this.activeSession;
    const settings = Storage.getSettings();

    // Compile Official GP Results
    const resultOrder = session.isTimeTrial
      ? this.calculateBestLapClassification(session.racers)
      : session.leaderboard;
    const winner = resultOrder[0];
    const officialResults = resultOrder.map((r, index) => {
      const position = index + 1;
      const ptRule = settings.pointsSystem.find(p => p.pos === position);
      let points = session.gp?.isCasual || session.isTimeTrial ? 0 : (ptRule ? ptRule.points : 0);
      
      // Bonus point for fastest lap if in top 10
      if (!session.gp?.isCasual && !session.isTimeTrial && session.fastestLap.driverId === r.driverId && position <= 10) {
        points += (settings.fastestLapPoint || 1);
      }

      const totalTimeMs = r.finishTimeMs || r.totalTimeMs;
      return {
        position,
        driverId: r.driverId,
        driverName: r.name,
        teamId: r.teamId,
        teamName: r.teamName,
        color: r.color,
        totalTimeMs: totalTimeMs,
        bestLapMs: r.bestLapTime || (totalTimeMs / session.totalLaps),
        lapsCompleted: session.totalLaps,
        points: points,
        gridPos: r.gridPos,
        posGained: r.gridPos - position
      };
    });

    const raceRecord = {
      id: Utils.generateId('race'),
      gpId: session.gp.id,
      divisionId: session.gp.divisionId || 'div_a',
      gpName: session.gp.name,
      trackName: session.track.name,
      country: session.track.country,
      date: new Date().toLocaleDateString('pt-BR'),
      totalLaps: session.totalLaps,
      isCasual: !!session.gp?.isCasual,
      isChampionship: !!session.gp?.isChampionship,
      isRanked: !!session.gp?.isRanked,
      isTeamDuel: !!session.gp?.isTeamDuel,
      duelSeriesId: session.gp?.duelSeriesId || null,
      duelRound: session.gp?.duelRound || 1,
      duelRoundCount: session.gp?.duelRoundCount || 1,
      isTimeTrial: !!session.gp?.isTimeTrial,
      worldRecordMs: session.gp?.worldRecordMs ?? null,
      isTournament: !!session.gp?.isTournament,
      tournamentId: session.gp?.tournamentId || null,
      teamAId: session.gp?.isTeamDuel ? session.gp.teamAId : null,
      teamBId: session.gp?.isTeamDuel ? session.gp.teamBId : null,
      matchId: session.gp?.matchId || null,
      qualifyTrackId: session.gp?.qualifyTrackId || null,
      qualifyTrackName: session.gp?.qualifyTrackName || null,
      qualifyLaps: session.gp?.qualifyLaps || null,
      qualifyResults: session.gp?.qualifyResults || [],
      fastestLap: session.fastestLap,
      results: officialResults,
      events: session.events
    };
    if (raceRecord.isTimeTrial) {
      raceRecord.newWorldRecord = officialResults.some(result =>
        Number.isFinite(result.bestLapMs) &&
        result.bestLapMs > 0 &&
        (raceRecord.worldRecordMs === null || result.bestLapMs < raceRecord.worldRecordMs)
      );
    }

    // Save for mode specific histories
    if (session.gp?.isTournament && typeof Tournament !== 'undefined') {
      raceRecord.trackId = session.track.id;
      raceRecord.teamAId = session.gp.teamAId || null;
      raceRecord.teamBId = session.gp.teamBId || null;
      Tournament.applyRaceResult(raceRecord);
    } else if (session.gp?.isTeamDuel && typeof ModeTeamDuel !== 'undefined') {
      ModeTeamDuel.recordDuelResult(raceRecord);
      this.applyRaceToChampionship(raceRecord);
    }
    if (session.gp?.isRanked && typeof ModeRanked !== 'undefined') {
      ModeRanked.processRankedRaceResult(raceRecord);
    }
    if (session.gp?.isTimeTrial && typeof ModeTimeTrial !== 'undefined') {
      raceRecord.soloDriverId = session.gp.soloDriverId;
      raceRecord.timeTrialDriverIds = session.gp.timeTrialDriverIds;
      raceRecord.trackId = session.track.id;
      raceRecord.trackName = session.track.name;
      ModeTimeTrial.processTimeTrialResult(raceRecord);
    }

    if (!session.gp?.isTeamDuel || typeof ModeTeamDuel === 'undefined') {
      // Salva no histórico geral depois de completar os metadados e históricos específicos do modo.
      this.applyRaceToChampionship(raceRecord);
    }

    // Save for immediate Post-Race Screen
    this.lastFinishedRace = raceRecord;
    this.activeSession = null;

    App.navigateTo('race-results');
  },

  applyRaceToChampionship(raceRecord) {
    try {
      // 1. Captura snapshot das posições ANTES de salvar a nova corrida
      //    (assim o delta compara "antes desta corrida" vs "depois desta corrida")
      const prevSnapshot = Storage.capturePositionSnapshot();

      // 2. Save History
      const history = Storage.getHistory();
      history.unshift(raceRecord);
      Storage.saveHistory(history);

      // 3. Synchronize driver profiles and standings, passando o snapshot pré-corrida
      Storage.recalculateAllFromHistory(prevSnapshot);
    } catch (error) {
      console.error('[Race.applyRaceToChampionship] ERRO:', error);
      console.error('[Race.applyRaceToChampionship] Stack trace:', error.stack);
      alert('Erro ao salvar a corrida: ' + error.message + '\n\nO histórico pode estar muito cheio. Tente limpar algumas corridas antigas em Configurações.');
    }
  },

  abortRace() {
    if (confirm('Tem certeza que deseja cancelar a corrida atual?')) {
      const gp = this.activeSession?.gp;
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.activeSession = null;
      if (gp?.isTournament && gp.tournamentId) {
        Tournament.open(gp.tournamentId);
      } else {
        App.navigateTo('championship');
      }
    }
  }
};
