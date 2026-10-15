/* ==========================================================================
   RACE SIMULATOR - DASHBOARD MODULE (js/dashboard.js)
   ========================================================================== */

const Dashboard = {
  activeTrackSlideIndex: 0,

  nextTrackSlide(max) {
    if (max <= 0) return;
    this.activeTrackSlideIndex = (this.activeTrackSlideIndex + 1) % max;
    App.navigateTo('dashboard');
  },

  prevTrackSlide(max) {
    if (max <= 0) return;
    this.activeTrackSlideIndex = (this.activeTrackSlideIndex - 1 + max) % max;
    App.navigateTo('dashboard');
  },

  setTrackSlide(idx) {
    this.activeTrackSlideIndex = idx;
    App.navigateTo('dashboard');
  },

  render() {
    /* ── Fontes de dados ── */
    const divisions       = Storage.getDivisions();
    const history         = Storage.getHistory();
    const drivers         = Storage.getDrivers();
    const teams           = Storage.getTeams();
    const tracks          = Storage.getTracks();
    const duels           = Storage.getTeamDuels();
    const bestTrials      = Storage.getBestTimeTrials();
    const rankedStandings = Storage.getRankedStandings();
    const rankedHistory   = Storage.getRankedHistory();

    // Temporada principal (Série A — ranking do hero e próximo GP)
    const mainDivId = divisions[0]?.id || 'div_a';
    const season    = Storage.getCurrentSeason(mainDivId);

    /* ── Métricas globais ── */
    const gpRaces           = history.filter(h => !h.isTimeTrial && !h.gpId?.startsWith('tt_') && !h.gpName?.startsWith('Time-Trial:'));
    const totalRaces        = gpRaces.length;
    const totalLaps         = history.reduce((s, h) => s + (h.totalLaps || 0), 0);
    const totalDuels        = duels.length;
    const totalTTSessions   = bestTrials.length;
    const totalRankedMatches = rankedStandings.reduce((s, r) => s + (r.matches || 0), 0);
    const nextGp            = season?.races?.find(r => !r.completed) || null;

    /* ── Carrossel de recordes por pista ── */
    const trackCarouselData = tracks.map(track => {
      let record = null;

      // De corridas
      history.forEach(h => {
        if (h.trackId === track.id || h.trackName === track.name) {
          (h.results || []).forEach(r => {
            if (r.bestLapMs && (!record || r.bestLapMs < record.timeMs)) {
              record = {
                timeMs:     r.bestLapMs,
                driverName: r.driverName,
                driverId:   r.driverId,
                teamName:   r.teamName || '',
                teamId:     r.teamId   || '',
                date:       h.date,
                source:     h.isRanked ? 'Ranqueado' : 'Campeonato'
              };
            }
          });
        }
      });

      // De time-trials
      bestTrials.filter(t => t.trackId === track.id || t.trackName === track.name).forEach(t => {
        if (t.bestLapMs && (!record || t.bestLapMs < record.timeMs)) {
          record = {
            timeMs:     t.bestLapMs,
            driverName: t.driverName,
            driverId:   t.driverId,
            teamName:   t.teamName || '',
            teamId:     '',
            date:       t.date,
            source:     'Time-Trial'
          };
        }
      });

      // Top 5 da pista
      const allTimesMap = new Map();
      history.filter(h => h.trackId === track.id || h.trackName === track.name).forEach(h => {
        (h.results || []).forEach(r => {
          if (!r.bestLapMs) return;
          const prev = allTimesMap.get(r.driverId);
          if (!prev || r.bestLapMs < prev.ms) allTimesMap.set(r.driverId, { ms: r.bestLapMs, name: r.driverName, team: r.teamName });
        });
      });
      bestTrials.filter(t => t.trackId === track.id || t.trackName === track.name).forEach(t => {
        if (!t.bestLapMs) return;
        const prev = allTimesMap.get(t.driverId);
        if (!prev || t.bestLapMs < prev.ms) allTimesMap.set(t.driverId, { ms: t.bestLapMs, name: t.driverName, team: t.teamName || '' });
      });
      const top5 = Array.from(allTimesMap.values()).sort((a, b) => a.ms - b.ms).slice(0, 5);

      const recordDriver = record ? drivers.find(d => d.id === record.driverId) : null;
      const recordTeam   = record?.teamId ? teams.find(t => t.id === record.teamId) : null;

      return { track, record, recordDriver, recordTeam, top5 };
    });

    const maxSlides = trackCarouselData.length;
    if (this.activeTrackSlideIndex >= maxSlides) this.activeTrackSlideIndex = 0;
    const slide = trackCarouselData[this.activeTrackSlideIndex] || null;

    /* ── Rankings por divisão ── */
    const divisionRankings = divisions.map(div => {
      const divSeason  = Storage.getCurrentSeason(div.id);
      const divTeams   = teams.filter(t => (t.divisionId || 'div_a') === div.id);
      const divDriverIds = drivers.filter(d => divTeams.some(t => t.id === d.teamId)).map(d => d.id);

      const driverStandings = (divSeason?.standings || [])
        .filter(st => divDriverIds.includes(st.driverId))
        .sort((a, b) => (b.points - a.points) || (b.wins - a.wins))
        .slice(0, 5)
        .map(st => ({ st, driver: drivers.find(d => d.id === st.driverId) }))
        .filter(x => x.driver);

      const constructors = Storage.getConstructorsStandings(div.id).slice(0, 5);
      const maxPts = driverStandings[0]?.st.points || 1;
      const maxTeamPts = constructors[0]?.points || 1;

      return { div, driverStandings, constructors, maxPts, maxTeamPts };
    }).filter(d => d.driverStandings.length > 0 || d.constructors.length > 0);

    /* ── Top 10 Ranqueado ── */
    const top10Ranked = [...rankedStandings]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
    const maxRating = top10Ranked[0]?.rating || 1200;

    /* ── Maiores rivais Equipe × Equipe ── */
    const duelMap = new Map();
    duels.forEach(d => {
      const key = [d.teamAId, d.teamBId].sort().join('::');
      const st  = duelMap.get(key) || { teamAId: d.teamAId, teamAName: d.teamAName, teamBId: d.teamBId, teamBName: d.teamBName, matches: 0, aWins: 0, bWins: 0 };
      st.matches++;
      if (d.winnerTeamId === d.teamAId)      st.aWins++;
      else if (d.winnerTeamId === d.teamBId) st.bWins++;
      duelMap.set(key, st);
    });
    const topDuels = Array.from(duelMap.values()).sort((a, b) => b.matches - a.matches).slice(0, 6);

    /* ── Podium principal (Série A) ── */
    const mainStandings = [...(season?.standings || [])].sort((a, b) => (b.points - a.points) || (b.wins - a.wins)).slice(0, 3);
    const podiumDrivers = mainStandings.map(st => drivers.find(d => d.id === st.driverId));

    /* ── Últimas corridas ── */
    const recentRaces = gpRaces.slice(0, 6);

    /* ── Gráfico de barras: pontos acumulados por piloto (top 8 da Série A) ── */
    const chartDrivers = [...(season?.standings || [])]
      .sort((a, b) => b.points - a.points)
      .slice(0, 8)
      .map(st => ({ st, driver: drivers.find(d => d.id === st.driverId) }))
      .filter(x => x.driver);
    const chartMaxPts = chartDrivers[0]?.st.points || 1;

    /* ── Gráfico de vitórias por equipe ── */
    const constructorsAll = Storage.getConstructorsStandings()
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 6);
    const maxWins = constructorsAll[0]?.wins || 1;

    /* ══════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════ */
    return `
<div style="display: flex; flex-direction: column; gap: 20px;">

  <!-- ════════════════ HERO ════════════════ -->
  <div class="db-hero">
    <div class="db-hero-deco">🏎️</div>
    <div style="z-index: 2;">
      <div class="db-hero-badge">
        <span>●</span> TRANSMISSÃO AO VIVO — TELEMETRIA MULTIMODAL
      </div>
      <h1 class="db-hero-title">
        ${season ? Utils.escapeHtml(season.name) : 'Tournament Racer GP'}
      </h1>
      <p class="db-hero-sub">
        ${divisions.length} séries ativas • ${drivers.length} pilotos • ${teams.length} escuderias
        ${nextGp ? ` • Próximo: <strong style="-webkit-text-fill-color: var(--accent-cyan);">${Utils.escapeHtml(nextGp.name)}</strong>` : ' • Temporada encerrada'}
      </p>
    </div>
    <div class="db-hero-actions">
      ${nextGp ? `
        <button class="btn btn-primary btn-lg"
          onclick="Championship.launchGp('${nextGp.id}', '${mainDivId}')">
          🏎️ Largar Próximo GP
        </button>
      ` : `
        <button class="btn btn-primary btn-lg" onclick="App.navigateTo('championship')">
          🏆 Ver Temporadas
        </button>
      `}
      <button class="btn btn-secondary btn-lg" onclick="App.navigateTo('modes-hub')">
        🏁 Hub de Modos
      </button>
    </div>
  </div>

  <!-- ════════════════ KPI BAR ════════════════ -->
  <div class="db-kpi-bar">
    <div class="db-kpi-card" style="--kpi-color: var(--accent-cyan);" onclick="App.navigateTo('championship')" title="Total de GPs simulados">
      <span class="db-kpi-icon">🏁</span>
      <span class="db-kpi-val">${totalRaces}</span>
      <span class="db-kpi-lbl">GPs Realizados</span>
    </div>
    <div class="db-kpi-card" style="--kpi-color: var(--accent-purple);" title="Total de voltas simuladas">
      <span class="db-kpi-icon">🔄</span>
      <span class="db-kpi-val">${totalLaps}</span>
      <span class="db-kpi-lbl">Voltas Simuladas</span>
    </div>
    <div class="db-kpi-card" style="--kpi-color: var(--accent-gold);" onclick="App.navigateTo('drivers')" title="Pilotos cadastrados">
      <span class="db-kpi-icon">👤</span>
      <span class="db-kpi-val">${drivers.length}</span>
      <span class="db-kpi-lbl">Pilotos Ativos</span>
    </div>
    <div class="db-kpi-card" style="--kpi-color: var(--accent-green);" onclick="App.navigateTo('teams')" title="Equipes cadastradas">
      <span class="db-kpi-icon">🏎️</span>
      <span class="db-kpi-val">${teams.length}</span>
      <span class="db-kpi-lbl">Escuderias</span>
    </div>
    <div class="db-kpi-card" style="--kpi-color: var(--accent-red);" onclick="App.navigateTo('mode-team-duel')" title="Confrontos Equipe x Equipe">
      <span class="db-kpi-icon">⚔️</span>
      <span class="db-kpi-val">${totalDuels}</span>
      <span class="db-kpi-lbl">Duelos 1v1</span>
    </div>
    <div class="db-kpi-card" style="--kpi-color: var(--accent-purple);" onclick="App.navigateTo('mode-ranked')" title="Partidas ranqueadas disputadas">
      <span class="db-kpi-icon">🎖️</span>
      <span class="db-kpi-val">${totalRankedMatches}</span>
      <span class="db-kpi-lbl">Partidas Ranked</span>
    </div>
  </div>

  <!-- ════════════════ TORNEIOS ════════════════ -->
  ${this.renderTournamentsSection()}

  <!-- ════════════════ CARROSSEL DE RECORDES ════════════════ -->
  <div class="db-carousel-wrap">
    <div class="db-carousel-header">
      <div>
        <div class="db-section-title">⏱️ Recordes Mundiais por Circuito</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
          Melhores tempos registrados em corridas e Time-Trial • ${maxSlides} circuitos oficiais
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="db-carousel-dots">
          ${trackCarouselData.map((_, i) => `
            <button class="db-carousel-dot ${i === this.activeTrackSlideIndex ? 'active' : ''}"
              onclick="Dashboard.setTrackSlide(${i})"></button>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" onclick="Dashboard.prevTrackSlide(${maxSlides})">‹</button>
        <button class="btn btn-secondary btn-sm" onclick="Dashboard.nextTrackSlide(${maxSlides})">›</button>
      </div>
    </div>

    ${slide ? `
      <div class="db-carousel-slide">
        <!-- SVG da pista -->
        <div class="db-carousel-svg-pane">
          ${slide.track.svgPath ? `
            <svg viewBox="${slide.track.viewBox || '0 0 1000 600'}" style="width:160px;height:100px;position:relative;z-index:1;">
              <path d="${slide.track.svgPath}" fill="none"
                stroke="var(--accent-cyan)" stroke-width="18"
                stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
            </svg>
          ` : `<span style="font-size:3rem;opacity:0.4;">🏁</span>`}
          <div style="position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:0.65rem;color:var(--text-dim);font-weight:700;">
            ${this.activeTrackSlideIndex + 1} / ${maxSlides}
          </div>
        </div>

        <!-- Info da pista + recorde -->
        <div class="db-carousel-info">
          <div>
            <div class="db-carousel-track-name">
              ${Utils.getCountryFlag(slide.track.country)}
              ${Utils.escapeHtml(slide.track.name)}
              <span class="badge" style="background:rgba(168,85,247,0.15);color:var(--accent-purple);border:1px solid rgba(168,85,247,0.3);font-size:0.65rem;">
                ${slide.track.lengthKm} km
              </span>
            </div>
            <div class="db-carousel-meta">
              ${Utils.escapeHtml(slide.track.country)} • ${slide.track.defaultLaps || '—'} voltas padrão
            </div>
          </div>

          ${slide.record ? `
            <div class="db-carousel-record-box">
              <div style="display:flex;align-items:center;gap:12px;">
                <div class="db-rank-avatar"
                  style="width:40px;height:40px;border:2px solid ${slide.recordDriver?.color || 'var(--accent-cyan)'};background:${slide.recordDriver?.color || 'var(--accent-cyan)'}18;">
                  ${slide.recordDriver?.avatar
                    ? `<img src="${slide.recordDriver.avatar}">`
                    : `<span style="font-size:0.8rem;font-weight:900;color:${slide.recordDriver?.color || 'var(--accent-cyan)'};">#${slide.recordDriver?.number || '?'}</span>`}
                </div>
                <div>
                  <div style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;font-weight:800;letter-spacing:0.5px;">👑 Recordista</div>
                  <div style="font-weight:900;font-size:0.95rem;cursor:pointer;" onclick="Pilots.openProfileModal('${slide.record.driverId}')">
                    ${Utils.escapeHtml(slide.record.driverName)}
                  </div>
                  <div style="font-size:0.72rem;color:var(--text-muted);">
                    ${Utils.escapeHtml(slide.recordTeam?.name || slide.record.teamName || 'Escuderia')}
                    • ${slide.record.date} • <span style="color:var(--accent-cyan);">${slide.record.source}</span>
                  </div>
                </div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div style="font-size:0.6rem;color:var(--accent-purple);text-transform:uppercase;font-weight:800;letter-spacing:0.5px;">Melhor Volta</div>
                <div class="db-carousel-record-time">${Utils.formatTime(slide.record.timeMs)}</div>
              </div>
            </div>

            <!-- Top 5 da pista -->
            ${slide.top5.length > 1 ? `
              <div class="db-carousel-top-list">
                ${slide.top5.map((t, i) => {
                  const delta = t.ms - slide.record.timeMs;
                  const posColors = ['var(--accent-gold)', '#94a3b8', '#d97706', 'var(--text-muted)', 'var(--text-dim)'];
                  return `
                    <div class="db-carousel-top-row"
                      style="border-left-color:${posColors[i] || 'var(--text-dim)'};">
                      <span style="font-weight:900;color:${posColors[i]};width:20px;flex-shrink:0;">
                        ${i === 0 ? '👑' : `#${i+1}`}
                      </span>
                      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${Utils.escapeHtml(t.name)}
                        <span style="color:var(--text-dim);font-size:0.7rem;"> — ${Utils.escapeHtml(t.team)}</span>
                      </span>
                      <span style="font-family:var(--font-mono);color:var(--accent-purple);font-weight:800;flex-shrink:0;">
                        ${Utils.formatTime(t.ms)}
                      </span>
                      ${i > 0 ? `<span style="font-family:var(--font-mono);color:var(--text-dim);font-size:0.7rem;flex-shrink:0;width:60px;text-align:right;">+${Utils.formatTime(delta)}</span>` : '<span style="width:60px;flex-shrink:0;"></span>'}
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          ` : `
            <div style="padding:16px;background:rgba(0,0,0,0.2);border-radius:var(--radius-md);color:var(--text-dim);font-size:0.82rem;text-align:center;border:1px dashed var(--border-color);">
              Nenhum tempo registrado neste circuito. Corra no Time-Trial ou Campeonato!
            </div>
          `}
        </div>
      </div>
    ` : ''}
  </div>

  <!-- ════════════════ BLOCO 3 colunas: Pódio | Top MMR | Gráfico Pts ════════════════ -->
  <div class="db-grid-3">

    <!-- Pódio da Série Principal -->
    <div class="glass-panel" style="padding: 20px;">
      <div class="db-section-hd">
        <div class="db-section-title">🏆 Pódio — ${Utils.escapeHtml(divisions[0]?.name || 'Série A')}</div>
        <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('ranking')">Ranking ➔</button>
      </div>
      <div class="db-podium">
        <!-- P2 -->
        <div class="db-podium-slot db-podium-p2">
          <div class="db-podium-avatar"
            style="width:46px;height:46px;border:2px solid #94a3b8;background:rgba(148,163,184,0.1);">
            ${podiumDrivers[1]?.avatar
              ? `<img src="${podiumDrivers[1].avatar}">`
              : `<span style="font-size:0.6rem;font-weight:900;color:#94a3b8;text-align:center;padding:2px;line-height:1.15;word-break:break-word;max-width:40px;">
                  ${podiumDrivers[1] ? Utils.escapeHtml(podiumDrivers[1].name.split(' ')[0]) : '—'}
                </span>`}
          </div>
          <div class="db-podium-pillar">
            <span class="db-podium-pos" style="color:#94a3b8;">2º</span>
            <span class="db-podium-pts" style="font-size:0.75rem;color:#94a3b8;font-weight:800;">${mainStandings[1]?.points || 0} pts</span>
          </div>
        </div>
        <!-- P1 -->
        <div class="db-podium-slot db-podium-p1">
          <span class="db-podium-crown">👑</span>
          <div class="db-podium-avatar"
            style="width:58px;height:58px;border:3px solid var(--accent-gold);background:rgba(255,183,3,0.12);box-shadow:0 0 18px rgba(255,183,3,0.3);">
            ${podiumDrivers[0]?.avatar
              ? `<img src="${podiumDrivers[0].avatar}">`
              : `<span style="font-size:0.65rem;font-weight:900;color:var(--accent-gold);text-align:center;padding:2px;line-height:1.15;word-break:break-word;max-width:50px;">
                  ${podiumDrivers[0] ? Utils.escapeHtml(podiumDrivers[0].name.split(' ')[0]) : '—'}
                </span>`}
          </div>
          <div class="db-podium-pillar">
            <span class="db-podium-pos" style="color:var(--accent-gold);">1º</span>
            <span class="db-podium-pts" style="font-size:0.78rem;color:var(--accent-gold);font-weight:800;">${mainStandings[0]?.points || 0} pts</span>
          </div>
        </div>
        <!-- P3 -->
        <div class="db-podium-slot db-podium-p3">
          <div class="db-podium-avatar"
            style="width:46px;height:46px;border:2px solid #d97706;background:rgba(217,119,6,0.1);">
            ${podiumDrivers[2]?.avatar
              ? `<img src="${podiumDrivers[2].avatar}">`
              : `<span style="font-size:0.6rem;font-weight:900;color:#d97706;text-align:center;padding:2px;line-height:1.15;word-break:break-word;max-width:40px;">
                  ${podiumDrivers[2] ? Utils.escapeHtml(podiumDrivers[2].name.split(' ')[0]) : '—'}
                </span>`}
          </div>
          <div class="db-podium-pillar">
            <span class="db-podium-pos" style="color:#d97706;">3º</span>
            <span class="db-podium-pts" style="font-size:0.75rem;color:#d97706;font-weight:800;">${mainStandings[2]?.points || 0} pts</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top 10 Ranqueado -->
    <div class="glass-panel" style="padding: 0; overflow: hidden;">
      <div style="padding:16px 18px 12px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
        <div class="db-section-title">🎖️ Top 10 Ranqueado (MMR)</div>
        <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('mode-ranked')">Ver tudo ➔</button>
      </div>
      ${top10Ranked.map((s, idx) => {
        const drv  = drivers.find(d => d.id === s.driverId);
        if (!drv) return '';
        const tier = (typeof ModeRanked !== 'undefined' && ModeRanked.getTierInfo)
          ? ModeRanked.getTierInfo(s.rating)
          : { name: s.tier || 'Bronze', color: '#cd7f32', icon: '🥉' };
        const barW = Math.round((s.rating / maxRating) * 100);
        const posColor = idx === 0 ? 'var(--accent-gold)' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : 'var(--text-dim)';
        return `
          <div class="db-mmr-row" onclick="Pilots.openProfileModal('${drv.id}')">
            <div class="db-mmr-pos" style="color:${posColor};">${idx === 0 ? '👑' : `#${idx+1}`}</div>
            <div class="db-rank-avatar" style="width:28px;height:28px;border:1.5px solid ${drv.color || tier.color};background:${drv.color || tier.color}18;font-size:0.7rem;color:${drv.color || tier.color};">
              ${drv.avatar ? `<img src="${drv.avatar}">` : `#${drv.number}`}
            </div>
            <div class="db-rank-info">
              <div class="db-rank-name">${Utils.escapeHtml(drv.name)}</div>
              <div class="db-rank-sub">${s.matches||0}M · ${s.wins||0}V · <span style="color:${tier.color};">${tier.icon} ${tier.name}</span></div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
              <span style="font-family:var(--font-mono);font-weight:900;font-size:0.88rem;color:var(--accent-cyan);">${s.rating}</span>
              <div class="db-mmr-bar-wrap" style="width:50px;">
                <div class="db-mmr-bar-fill" style="width:${barW}%;background:${tier.color};"></div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
      ${top10Ranked.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-dim);">Nenhum piloto ranqueado ainda.</div>' : ''}
    </div>

    <!-- Gráfico de pontos Série A — barras horizontais SVG -->
    <div class="glass-panel" style="padding:20px;">
      <div class="db-section-hd">
        <div class="db-section-title">📊 Pontos — ${Utils.escapeHtml(divisions[0]?.name || 'Série A')}</div>
        <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('ranking')">Ranking ➔</button>
      </div>
      ${this.renderHorizontalBars(
        chartDrivers.map(x => ({
          label:  x.driver.name.split(' ')[0],
          value:  x.st.points,
          color:  x.driver.color || 'var(--accent-cyan)',
          sub:    x.st.wins + 'V',
          onClick: `Pilots.openProfileModal('${x.driver.id}')`
        })),
        chartMaxPts,
        'pts'
      )}
    </div>

  </div>

  <!-- ════════════════ RANKINGS POR SÉRIE — pilotos + construtores ════════════════ -->
  <div>
    <div class="db-section-hd" style="margin-bottom:12px;">
      <div class="db-section-title">🏅 Rankings por Série — Pilotos &amp; Construtores</div>
      <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('ranking')">Ver classificação completa ➔</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${divisionRankings.map(({ div, driverStandings, constructors, maxPts, maxTeamPts }) => `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">

          <!-- Pilotos -->
          <div class="db-rank-division-block">
            <div class="db-rank-division-hd" style="border-left:4px solid ${div.color};">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.2rem;">${div.icon || '🏆'}</span>
                <div>
                  <div style="font-size:0.82rem;font-weight:800;color:${div.color};">${Utils.escapeHtml(div.name)}</div>
                  <div style="font-size:0.68rem;color:var(--text-dim);">Ranking de Pilotos</div>
                </div>
              </div>
              <span class="badge" style="background:${div.color}18;color:${div.color};border:1px solid ${div.color}40;font-size:0.65rem;">
                ${driverStandings.length} pilotos
              </span>
            </div>
            ${driverStandings.map(({ st, driver }, idx) => {
              const team  = teams.find(t => t.id === driver.teamId);
              const barW  = maxPts > 0 ? Math.round((st.points / maxPts) * 100) : 0;
              const posColor = idx === 0 ? 'var(--accent-gold)' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : 'var(--text-dim)';
              return `
                <div class="db-rank-row" onclick="Pilots.openProfileModal('${driver.id}')">
                  <div class="db-rank-pos" style="color:${posColor};">
                    ${idx === 0 ? '👑' : `#${idx+1}`}
                  </div>
                  <div class="db-rank-avatar"
                    style="width:30px;height:30px;border:1.5px solid ${driver.color||'var(--accent-cyan)'};background:${driver.color||'var(--accent-cyan)'}18;font-size:0.7rem;color:${driver.color||'var(--accent-cyan)'};">
                    ${driver.avatar ? `<img src="${driver.avatar}">` : `#${driver.number}`}
                  </div>
                  <div class="db-rank-info">
                    <div class="db-rank-name">${Utils.escapeHtml(driver.name)}</div>
                    <div class="db-rank-sub">${Utils.escapeHtml(team?.name||'?')} · ${st.wins||0}V · ${st.podiums||0}P</div>
                  </div>
                  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
                    <div class="db-rank-pts" style="color:${div.color};">${st.points}</div>
                    <div class="db-rank-bar-wrap">
                      <div class="db-rank-bar-fill" style="width:${barW}%;background:${div.color};"></div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
            ${driverStandings.length === 0 ? '<div style="padding:16px;text-align:center;color:var(--text-dim);font-size:0.82rem;">Sem corridas nesta série ainda.</div>' : ''}
          </div>

          <!-- Construtores -->
          <div class="db-rank-division-block">
            <div class="db-rank-division-hd" style="border-left:4px solid ${div.color};">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.2rem;">${div.icon || '🏆'}</span>
                <div>
                  <div style="font-size:0.82rem;font-weight:800;color:${div.color};">${Utils.escapeHtml(div.name)}</div>
                  <div style="font-size:0.68rem;color:var(--text-dim);">Campeonato de Construtores</div>
                </div>
              </div>
              <span class="badge" style="background:${div.color}18;color:${div.color};border:1px solid ${div.color}40;font-size:0.65rem;">
                ${constructors.length} equipes
              </span>
            </div>
            ${constructors.map((c, idx) => {
              const barW = maxTeamPts > 0 ? Math.round((c.points / maxTeamPts) * 100) : 0;
              const posColor = idx === 0 ? 'var(--accent-gold)' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : 'var(--text-dim)';
              return `
                <div class="db-constructor-row" onclick="Teams.openTeamProfileModal('${c.teamId}')">
                  <div class="db-rank-pos" style="color:${posColor};">
                    ${idx === 0 ? '👑' : `#${idx+1}`}
                  </div>
                  <span style="font-size:1.3rem;">${c.logo||'🏎️'}</span>
                  <div class="db-rank-info">
                    <div class="db-rank-name" style="color:${c.color||'#fff'};">${Utils.escapeHtml(c.teamName)}</div>
                    <div class="db-rank-sub">${c.wins||0}V · ${c.podiums||0}P · ${c.drivers?.length||0} pilotos</div>
                  </div>
                  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
                    <div class="db-rank-pts" style="color:${c.color||div.color};">${c.points}</div>
                    <div class="db-rank-bar-wrap">
                      <div class="db-rank-bar-fill" style="width:${barW}%;background:${c.color||div.color};"></div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
            ${constructors.length === 0 ? '<div style="padding:16px;text-align:center;color:var(--text-dim);font-size:0.82rem;">Sem construtores nesta série.</div>' : ''}
          </div>

        </div>
      `).join('')}
      ${divisionRankings.length === 0 ? `
        <div class="glass-panel" style="text-align:center;padding:32px;color:var(--text-dim);">
          Nenhuma corrida realizada ainda. Inicie um GP para gerar rankings!
        </div>
      ` : ''}
    </div>
  </div>

  <!-- ════════════════ GRÁFICO: Vitórias por Escuderia ════════════════ -->
  ${constructorsAll.length > 0 ? `
    <div class="glass-panel" style="padding:20px;">
      <div class="db-section-hd">
        <div class="db-section-title">🏆 Vitórias por Escuderia (Histórico Geral)</div>
        <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('teams')">Ver equipes ➔</button>
      </div>
      ${this.renderHorizontalBars(
        constructorsAll.map(c => ({
          label:   c.teamName,
          value:   c.wins,
          color:   c.color || 'var(--accent-gold)',
          sub:     c.podiums + ' pódios',
          onClick: `Teams.openTeamProfileModal('${c.teamId}')`
        })),
        maxWins,
        'vitórias'
      )}
    </div>
  ` : ''}

  <!-- ════════════════ MAIORES RIVAIS: Equipe × Equipe ════════════════ -->
  ${topDuels.length > 0 ? `
    <div>
      <div class="db-section-hd">
        <div class="db-section-title">⚔️ Maiores Rivalidades — Equipe × Equipe</div>
        <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('mode-team-duel')">Ver confrontos ➔</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
        ${topDuels.map(d => {
          const aTeam = teams.find(t => t.id === d.teamAId);
          const bTeam = teams.find(t => t.id === d.teamBId);
          const aColor = aTeam?.color || 'var(--accent-green)';
          const bColor = bTeam?.color || 'var(--accent-red)';
          const aPct = d.matches > 0 ? Math.round((d.aWins / d.matches) * 100) : 50;
          const bPct = 100 - aPct;
          return `
            <div class="db-duel-card" onclick="App.navigateTo('mode-team-duel')">
              <div class="db-duel-teams">
                <div class="db-duel-team-name" style="color:${aColor};">
                  ${aTeam?.logo||'🏎️'} ${Utils.escapeHtml(d.teamAName)}
                </div>
                <span class="db-duel-vs">VS</span>
                <div class="db-duel-team-name" style="color:${bColor};text-align:right;">
                  ${Utils.escapeHtml(d.teamBName)} ${bTeam?.logo||'🏎️'}
                </div>
              </div>
              <div class="db-duel-win-bar">
                <div class="db-duel-win-a" style="width:${aPct}%;background:${aColor};"></div>
                <div class="db-duel-win-b" style="width:${bPct}%;background:${bColor};"></div>
              </div>
              <div class="db-duel-score">
                <span style="color:${aColor};font-weight:800;">${d.aWins}V (${aPct}%)</span>
                <span style="color:var(--text-dim);">${d.matches} duelo${d.matches!==1?'s':''}</span>
                <span style="color:${bColor};font-weight:800;">${d.bWins}V (${bPct}%)</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : ''}

  <!-- ════════════════ ÚLTIMAS CORRIDAS + ESCUDERIAS ════════════════ -->
  <div class="db-grid-2">

    <!-- Feed de corridas -->
    <div class="glass-panel" style="padding:20px;">
      <div class="db-section-hd">
        <div class="db-section-title">📜 Últimas Corridas</div>
        <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('history')">Histórico ➔</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${recentRaces.map(race => {
          const winner = race.results?.[0];
          const modeBadge = race.isRanked
            ? `<span class="badge" style="background:rgba(139,92,246,0.2);color:var(--accent-purple);font-size:0.65rem;">Ranked</span>`
            : race.isTeamDuel
            ? `<span class="badge" style="background:rgba(255,51,102,0.15);color:var(--accent-red);font-size:0.65rem;">Duelo</span>`
            : `<span class="badge" style="background:rgba(255,183,3,0.15);color:var(--accent-gold);font-size:0.65rem;">Campeonato</span>`;
          return `
            <div class="db-race-feed-row">
              <div style="flex:1;min-width:0;">
                <div style="font-weight:800;font-size:0.88rem;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  ${Utils.escapeHtml(race.gpName||race.trackName||'GP')}
                  ${modeBadge}
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">
                  ${race.date||''} •
                  🏆 <span style="color:var(--accent-gold);font-weight:700;">
                    ${Utils.escapeHtml(winner?.driverName||'?')}
                  </span>
                  ${winner?.bestLapMs ? `• ⏱️ <span style="font-family:var(--font-mono);color:var(--accent-purple);">${Utils.formatTime(winner.bestLapMs)}</span>` : ''}
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="Championship.viewGpResult('${race.gpId}')">
                Ver
              </button>
            </div>
          `;
        }).join('')}
        ${recentRaces.length === 0
          ? '<div style="text-align:center;color:var(--text-dim);padding:20px;">Nenhuma corrida realizada ainda.</div>'
          : ''}
      </div>
    </div>

    <!-- Escuderias -->
    <div class="glass-panel" style="padding:20px;">
      <div class="db-section-hd">
        <div class="db-section-title">🏎️ Escuderias (${teams.length})</div>
        <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('teams')">Ver todas ➔</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${teams.map(team => {
          const teamDrivers = drivers.filter(d => d.teamId === team.id);
          const div = divisions.find(d => d.id === team.divisionId) || divisions[0] || {};
          const constructorSt = Storage.getConstructorsStandings(team.divisionId).find(c => c.teamId === team.id);
          return `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;
              background:rgba(0,0,0,0.2);border:1px solid var(--border-color);
              border-left:3px solid ${team.color};border-radius:var(--radius-md);
              cursor:pointer;transition:background 0.15s;"
              onclick="Teams.openTeamProfileModal('${team.id}')"
              onmouseover="this.style.background='rgba(255,255,255,0.04)'"
              onmouseout="this.style.background='rgba(0,0,0,0.2)'">
              <span style="font-size:1.4rem;flex-shrink:0;">${team.logo||'🏎️'}</span>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:800;font-size:0.88rem;color:${team.color};">
                  ${Utils.escapeHtml(team.name)}
                </div>
                <div style="font-size:0.7rem;color:var(--text-dim);">
                  ${teamDrivers.length} piloto${teamDrivers.length!==1?'s':''} ·
                  <span style="color:${div.color||'var(--text-muted)'};">${Utils.escapeHtml(div.name||'')}</span>
                </div>
              </div>
              ${constructorSt ? `
                <div style="text-align:right;flex-shrink:0;">
                  <div style="font-family:var(--font-mono);font-weight:900;font-size:0.88rem;color:var(--accent-cyan);">${constructorSt.points} pts</div>
                  <div style="font-size:0.68rem;color:var(--text-dim);">${constructorSt.wins||0} vitórias</div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>

  </div>

</div>
    `;
  },

  renderTournamentsSection() {
    if (typeof Tournament === 'undefined') return '';

    const { active, lastFinished } = Tournament.getDashboardItems();
    const featured = active.slice(0, 3);
    if (featured.length === 0 && lastFinished) featured.push(lastFinished);

    return `
      <section>
        <div class="db-section-hd" style="margin-bottom:12px;">
          <div class="db-section-title">🏆 Torneios</div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('tournament')">Ver torneios ➔</button>
        </div>
        ${featured.length > 0
          ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
              ${featured.map(t => Tournament.renderSummaryCard(t, true)).join('')}
            </div>`
          : `<div class="glass-panel" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
              <span style="color:var(--text-muted);">Nenhum torneio criado ainda.</span>
              <button class="btn btn-primary btn-sm" onclick="Tournament.openCreate()">+ Novo torneio</button>
            </div>`}
        ${active.length > 3 ? `<div style="margin-top:8px;color:var(--text-dim);font-size:0.75rem;">E mais ${active.length - 3} torneio${active.length - 3 === 1 ? '' : 's'} em andamento.</div>` : ''}
      </section>
    `;
  },

  /* ── Helper: gráfico de barras horizontais com SVG ── */
  renderHorizontalBars(items, maxValue, unit = '') {
    if (!items || items.length === 0) {
      return `<div style="text-align:center;color:var(--text-dim);padding:16px;font-size:0.82rem;">Sem dados disponíveis.</div>`;
    }

    const barH    = 26;
    const gap     = 8;
    const labelW  = 100;
    const valueW  = 60;
    const padLeft = labelW + 8;
    const padRight = valueW + 8;
    const svgW    = 500; // viewBox width — SVG escala via CSS
    const barArea = svgW - padLeft - padRight;
    const svgH    = items.length * (barH + gap) + gap;

    const bars = items.map((item, i) => {
      const y      = gap + i * (barH + gap);
      const filled = maxValue > 0 ? Math.max(4, Math.round((item.value / maxValue) * barArea)) : 4;
      const color  = item.color.startsWith('var(') ? '#00e5ff' : item.color; // SVG não suporta CSS vars
      // resolve CSS var para cor comum
      const safeColor = item.color.startsWith('var(') ? this.resolveCssVar(item.color) : item.color;

      return `
        <g style="cursor:${item.onClick ? 'pointer' : 'default'};"
          onclick="${item.onClick ? item.onClick : ''}">
          <!-- Label -->
          <text x="${labelW - 4}" y="${y + barH/2 + 1}" text-anchor="end"
            dominant-baseline="middle" fill="rgba(255,255,255,0.7)"
            font-size="11" font-family="inherit" font-weight="700">
            ${Utils.escapeHtml(item.label.length > 12 ? item.label.slice(0,12)+'…' : item.label)}
          </text>
          <!-- Fundo -->
          <rect x="${padLeft}" y="${y}" width="${barArea}" height="${barH}"
            rx="4" fill="rgba(255,255,255,0.04)"/>
          <!-- Barra -->
          <rect x="${padLeft}" y="${y}" width="${filled}" height="${barH}"
            rx="4" fill="${safeColor}" opacity="0.85"/>
          <!-- Brilho topo -->
          <rect x="${padLeft}" y="${y}" width="${filled}" height="${Math.min(4, barH/3)}"
            rx="2" fill="rgba(255,255,255,0.18)"/>
          <!-- Valor -->
          <text x="${padLeft + barArea + 6}" y="${y + barH/2 + 1}"
            dominant-baseline="middle" fill="${safeColor}"
            font-size="11" font-family="monospace" font-weight="900">
            ${item.value}
          </text>
          <!-- Sub -->
          <text x="${padLeft + barArea + 6}" y="${y + barH - 3}"
            dominant-baseline="auto" fill="rgba(255,255,255,0.3)"
            font-size="8.5" font-family="inherit">
            ${Utils.escapeHtml(item.sub || '')}
          </text>
        </g>
      `;
    }).join('');

    return `
      <div class="db-chart-wrap" style="margin-top:6px;">
        <svg viewBox="0 0 ${svgW} ${svgH}" style="width:100%;max-width:${svgW}px;display:block;">
          ${bars}
        </svg>
      </div>
    `;
  },

  /* Resolve CSS variables para cores que SVG consegue usar */
  resolveCssVar(varStr) {
    const map = {
      'var(--accent-cyan)':   '#00e5ff',
      'var(--accent-gold)':   '#ffb703',
      'var(--accent-green)':  '#00f59b',
      'var(--accent-purple)': '#8b5cf6',
      'var(--accent-red)':    '#ff3366',
    };
    return map[varStr] || '#00e5ff';
  }
};
