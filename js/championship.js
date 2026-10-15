/* ==========================================================================
   RACE SIMULATOR - CHAMPIONSHIP, SEASONS & RESULTS (js/championship.js)
   ========================================================================== */

const Championship = {
  selectedDivisionId: 'div_a',

  setDivision(divId) {
    this.selectedDivisionId = divId;
    App.navigateTo('championship');
  },

  // Lança um GP a partir do ID do GP e da divisão — evita serializar objetos grandes em onclick inline
  launchGp(gpId, divisionId) {
    const season = Storage.getCurrentSeason(divisionId);
    if (!season) return;
    const gp = season.races.find(r => r.id === gpId);
    if (!gp) return;
    // Monta gpData limpo, com apenas os campos necessários para a corrida
    const gpData = {
      id:         gp.id,
      name:       gp.name,
      trackId:    gp.trackId,
      laps:       gp.laps,
      divisionId: divisionId,
      completed:  false,
      winnerDriverId: null,
      fastestLap:     null,
      result:         null,
      isChampionship: true  // Flag para identificar como corrida de campeonato
    };
    Race.promptTeamSelection(gpData);
  },

  startNewSeasonPrompt() {
    const divisions = Storage.getDivisions();
    const div = divisions.find(d => d.id === this.selectedDivisionId) || divisions[0];
    const currentSeason = Storage.getCurrentSeason(div.id);
    const nextYear = (currentSeason?.year || 2026) + 1;

    if (confirm(`Deseja encerrar as temporadas ativas de todas as séries e iniciar a temporada ${nextYear}?\n\n- Pontos e resultados de campeonato serão arquivados por temporada.\n- Promoções e rebaixamentos serão aplicados uma única vez.\n- Os tempos e replays de Time-Trial serão apagados.\n- Ratings e histórico do modo Ranqueado serão preservados.`)) {
      Storage.startNewSeason(div.id);
      alert(`🎉 Nova Temporada ${nextYear} iniciada para todas as séries!\nHistóricos de campeonato e promoções foram arquivados.`);
      App.navigateTo('championship');
    }
  },

  render() {
    const divisions = Storage.getDivisions();
    if (!this.selectedDivisionId && divisions.length > 0) {
      this.selectedDivisionId = divisions[0].id;
    }
    const currentDiv = divisions.find(d => d.id === this.selectedDivisionId) || divisions[0] || { id: 'div_a', name: 'Série A', color: '#ffd700', icon: '🏆' };

    const season = Storage.getCurrentSeason(this.selectedDivisionId);
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams().filter(t => (t.divisionId || 'div_a') === currentDiv.id);
    const tracks = Storage.getTracks();

    return `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Navegação por Abas de Campeonato por Divisão -->
        <div class="glass-panel" style="padding: 12px 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold; text-transform: uppercase;">Campeonato da Série:</span>
              <div style="display: flex; gap: 8px;">
                ${divisions.map(d => `
                  <button class="btn ${d.id === currentDiv.id ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="Championship.setDivision('${d.id}')">
                    ${d.icon || '🏆'} ${Utils.escapeHtml(d.name)}
                  </button>
                `).join('')}
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('ranking')">
              🏆 Ver Tabelas de Classificação &amp; Ranking ➔
            </button>
          </div>
        </div>

        <!-- Header do Campeonato da Divisão -->
        <div class="glass-panel" style="display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${currentDiv.color};">
          <div>
            <div style="font-size: 0.8rem; color: ${currentDiv.color}; font-weight: 800; text-transform: uppercase;">
              ${currentDiv.icon || '🏆'} ${Utils.escapeHtml(currentDiv.name)} • ${season?.year || 2026}
            </div>
            <h2 style="font-size: 1.6rem; font-weight: 800; margin-top: 2px;">
              ${season ? Utils.escapeHtml(season.name) : `Campeonato da ${currentDiv.name}`}
            </h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
              ${teams.length} escuderias disputando a temporada atual nesta divisão.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-success btn-sm" style="background: var(--grad-green); color: #fff; font-weight: bold;" onclick="Championship.startNewSeasonPrompt()">✨ Nova Temporada</button>
            <button class="btn btn-primary btn-sm" onclick="Championship.addAllGps()">⚡ Adicionar todos os GP's</button>
            <button class="btn btn-secondary btn-sm" onclick="Championship.openGpModal()">+ Adicionar GP Manual</button>
            <button class="btn btn-danger btn-sm" onclick="Championship.resetChampionship()">🗑️ Resetar Campeonato</button>
          </div>
        </div>

        <!-- Calendário de Corridas e GPs da Série -->
        <div class="glass-panel">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🗓️ Calendário de GPs — ${Utils.escapeHtml(currentDiv.name)}</h3>
              <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">
                Grandes Prêmios agendados exclusivamente para os pilotos e equipes da ${Utils.escapeHtml(currentDiv.name)}.
              </p>
            </div>
            <span class="badge" style="background: var(--bg-tertiary);">${season?.races.length || 0} Provas</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
            ${season?.races.map((gp, idx) => {
              const track = tracks.find(t => t.id === gp.trackId) || { name: 'Circuito', country: 'Global', lengthKm: 5 };
              const winner = gp.completed ? drivers.find(d => d.id === gp.winnerDriverId) : null;

              // Prepara dados do GP garantindo a divisionId
              const gpData = { ...gp, divisionId: currentDiv.id };

              return `
                <div class="glass-panel" style="padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-dim); width: 32px;">#${idx + 1}</div>
                    <div>
                      <div style="font-weight: 700; font-size: 1rem;">${Utils.escapeHtml(gp.name)}</div>
                      <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                        ${Utils.getCountryFlag(track.country)} ${Utils.escapeHtml(track.name)} • ${gp.laps} Voltas
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 10px;">
                    ${gp.completed ? `
                      <span class="badge" style="background: rgba(0, 245, 155, 0.15); color: var(--accent-green); font-weight: bold;">
                        🏆 Vencedor: ${Utils.escapeHtml(winner ? winner.name : 'Concluído')}
                      </span>
                      <button class="btn btn-secondary btn-sm" onclick="Championship.viewGpResult('${gp.id}')">Resultados</button>
                    ` : `
                      <button class="btn btn-primary" onclick="Championship.launchGp('${gp.id}', '${currentDiv.id}')">
                        🏁 Largar GP (${currentDiv.name})
                      </button>
                    `}
                    <button class="btn btn-danger btn-sm" title="Excluir GP" onclick="Championship.deleteGp('${gp.id}')">✕</button>
                  </div>
                </div>
              `;
            }).join('') || '<div style="text-align: center; color: var(--text-dim); padding: 30px;">Nenhum GP agendado para esta divisão.</div>'}
          </div>
        </div>
      </div>
    `;
  },

  viewGpResult(gpId) {
    const history = Storage.getHistory();
    const race = history.find(h => h.gpId === gpId);
    if (race) {
      Race.lastFinishedRace = race;
      App.navigateTo('race-results');
    } else {
      alert('Resultado desta prova não localizado no histórico.');
    }
  },

  renderResultsView() {
    const race = Race.lastFinishedRace;
    if (!race) {
      return `
        <div class="glass-panel" style="text-align: center; padding: 40px;">
          <h2>Nenhum resultado de corrida disponível</h2>
          <button class="btn btn-primary" onclick="App.navigateTo('championship')">Voltar ao Campeonato</button>
        </div>
      `;
    }

    const winner = race.results[0];
    const fastest = race.fastestLap;
    // Driver of the day: Biggest position gainer
    const driverOfTheDay = [...race.results].sort((a, b) => b.posGained - a.posGained)[0];
    const tournamentBack = race.isTournament && race.tournamentId
      ? `<button class="btn btn-primary" onclick="Tournament.open('${race.tournamentId}')">Voltar ao Torneio ➔</button>`
      : `<button class="btn btn-primary" onclick="App.navigateTo('championship')">Ver Classificação ➔</button>`;
    const duelSeries = race.isTeamDuel && ModeTeamDuel.activeSeries?.id === race.duelSeriesId
      ? ModeTeamDuel.activeSeries
      : null;
    const duelScore = duelSeries ? ModeTeamDuel.getSeriesScore() : null;
    const duelTeamA = duelSeries ? Storage.getTeams().find(team => team.id === duelSeries.teamAId) : null;
    const duelTeamB = duelSeries ? Storage.getTeams().find(team => team.id === duelSeries.teamBId) : null;
    const raceResultBack = race.isTeamDuel
      ? duelSeries && duelSeries.nextRound <= duelSeries.roundCount
        ? `<button class="btn btn-primary" onclick="ModeTeamDuel.startNextRound()">Iniciar rodada ${duelSeries.nextRound} de ${duelSeries.roundCount} ➔</button>`
        : `<button class="btn btn-primary" onclick="App.navigateTo('mode-team-duel')">Voltar ao Equipe x Equipe ➔</button>`
      : tournamentBack;

    return `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 1100px; margin: 0 auto;">
        <!-- Header do GP Concluído -->
        <div class="dashboard-hero" style="padding: 24px;">
          <div class="hero-text">
            <span class="badge" style="background: var(--accent-green); color: #000; font-weight: 800; margin-bottom: 8px;">
              PROVA CONCLUÍDA
            </span>
            ${race.isTimeTrial && race.newWorldRecord ? '<span class="badge" style="background: var(--accent-gold); color: #000; font-weight: 900; margin: 0 0 8px 8px;">NEW WR</span>' : ''}
            <h2>${Utils.escapeHtml(race.gpName)}</h2>
            <p>${race.trackName} • ${race.country} • ${race.totalLaps} Voltas • ${race.date}</p>
          </div>
          <div class="hero-cta-group">
            <button class="btn btn-secondary" onclick="App.navigateTo('history')">📜 Ver Histórico de Corridas</button>
            ${raceResultBack}
          </div>
        </div>

        ${duelSeries ? `
          <div class="glass-panel">
            <div class="panel-header">
              <h3 class="panel-title">${duelSeries.roundCount > 1 ? `Série: ${race.duelRound} de ${duelSeries.roundCount} rodadas` : 'Placar do duelo'}</h3>
              <strong style="font-family: var(--font-mono);">${Utils.escapeHtml(duelTeamA?.name || 'Equipe A')} ${duelScore.teamAPoints} × ${duelScore.teamBPoints} ${Utils.escapeHtml(duelTeamB?.name || 'Equipe B')}</strong>
            </div>
            ${duelSeries.roundCount > 1 ? `
              <div class="table-container">
                <table class="data-table">
                  <thead><tr><th>Rodada</th><th>Pista</th><th>${Utils.escapeHtml(duelTeamA?.name || 'Equipe A')}</th><th>${Utils.escapeHtml(duelTeamB?.name || 'Equipe B')}</th></tr></thead>
                  <tbody>${duelSeries.rounds.map(round => `
                    <tr><td>${round.round}</td><td>${Utils.escapeHtml(round.trackName)}</td><td>${round.teamAPoints} pts</td><td>${round.teamBPoints} pts</td></tr>
                  `).join('')}</tbody>
                </table>
              </div>
              ${duelSeries.nextRound > duelSeries.roundCount ? `<p style="margin-top: 10px; color: var(--accent-gold); font-weight: 700;">Série concluída: ${Utils.escapeHtml(ModeTeamDuel.lastDuelResult?.winnerTeamName || 'Empate')} venceu pela soma dos pontos.</p>` : ''}
            ` : ''}
          </div>
        ` : ''}

        <!-- Destaques Obrigatórios da Corrida -->
        <div class="grid-4">
          <div class="metric-card">
            <div class="metric-icon-box" style="background: rgba(255, 183, 3, 0.15); color: var(--accent-gold);">🏆</div>
            <div class="metric-data">
              <span class="metric-label">Vencedor</span>
              <span class="metric-value" style="font-size: 1.1rem;">${Utils.escapeHtml(winner?.driverName || 'N/A')}</span>
              <span style="font-size: 0.75rem; color: var(--text-dim);">${winner?.teamName}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box" style="background: rgba(139, 92, 246, 0.15); color: var(--accent-purple);">⚡</div>
            <div class="metric-data">
              <span class="metric-label">Melhor Volta</span>
              <span class="metric-value" style="font-size: 1.1rem; font-family: var(--font-mono);">${Utils.formatTime(fastest?.timeMs)}</span>
              <span style="font-size: 0.75rem; color: var(--text-dim);">${Utils.escapeHtml(fastest?.driverName || 'N/A')}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box" style="background: rgba(0, 229, 255, 0.15); color: var(--accent-cyan);">⭐</div>
            <div class="metric-data">
              <span class="metric-label">Piloto do Dia</span>
              <span class="metric-value" style="font-size: 1.1rem;">${Utils.escapeHtml(driverOfTheDay?.driverName || 'N/A')}</span>
              <span style="font-size: 0.75rem; color: var(--accent-green);">+${driverOfTheDay?.posGained || 0} posições</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box" style="background: rgba(0, 245, 155, 0.15); color: var(--accent-green);">🚀</div>
            <div class="metric-data">
              <span class="metric-label">Maior Escalada</span>
              <span class="metric-value" style="font-size: 1.1rem;">+${driverOfTheDay?.posGained > 0 ? driverOfTheDay.posGained : 0} POS</span>
              <span style="font-size: 0.75rem; color: var(--text-dim);">P${driverOfTheDay?.gridPos} ➔ P${driverOfTheDay?.position}</span>
            </div>
          </div>
        </div>

        <!-- Tabela Oficial Obrigatória de Resultados -->
        <div class="glass-panel">
          <div class="panel-header">
            <h3 class="panel-title">📋 Tabela Oficial de Resultados</h3>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Nome do Piloto</th>
                  <th>Equipe</th>
                  <th>Tempo Total / Diferença</th>
                  <th>Volta Mais Rápida</th>
                  <th>Voltas</th>
                  <th>Pontos</th>
                </tr>
              </thead>
              <tbody>
                ${race.results.map((res, index) => {
                  const timeDiff = index === 0 ? Utils.formatTime(res.totalTimeMs) : Utils.formatGap(res.totalTimeMs - winner.totalTimeMs);
                  return `
                    <tr>
                      <td><strong>#${res.position}</strong></td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${res.color};"></span>
                          <strong>${Utils.escapeHtml(res.driverName)}</strong>
                        </div>
                      </td>
                      <td>${Utils.escapeHtml(res.teamName)}</td>
                      <td><span style="font-family: var(--font-mono); font-weight: 700;">${timeDiff}</span></td>
                      <td><span style="font-family: var(--font-mono); color: var(--accent-purple);">${Utils.formatTime(res.bestLapMs)}</span></td>
                      <td>${res.lapsCompleted}</td>
                      <td><strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${res.pointsDisplay || (typeof res.points === 'string' ? res.points : '+' + (res.points || 0))} pts</strong></td>
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

  addAllGps() {
    const tracks = Storage.getTracks();
    if (!tracks || tracks.length === 0) {
      alert('Nenhuma pista cadastrada! Cadastre pistas antes de adicionar os GP\'s.');
      return;
    }

    const seasons = Storage.getSeasons();
    const season = Storage.getCurrentSeason(this.selectedDivisionId);
    if (season) {
      const sIdx = seasons.findIndex(s => s.id === season.id);
      if (sIdx !== -1) {
        tracks.forEach(track => {
          seasons[sIdx].races.push({
            id: Utils.generateId('gp'),
            name: `GP ${track.country} (${track.name})`,
            trackId: track.id,
            laps: track.defaultLaps || 15,
            completed: false,
            winnerDriverId: null,
            fastestLap: null,
            result: null
          });
        });
        Storage.saveSeasons(seasons);
      }
    }

    App.closeModal('gp-modal');
    App.navigateTo('championship');
  },

  openGpModal() {
    const tracks = Storage.getTracks();
    if (!tracks || tracks.length === 0) {
      alert('Nenhuma pista cadastrada! Cadastre uma pista antes de adicionar um GP.');
      return;
    }

    const defaultLaps = tracks[0].defaultLaps || 15;
    const modalHtml = `
      <div class="modal-backdrop active" id="gp-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Adicionar Grande Prêmio</h3>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('gp-modal')">✕</button>
          </div>
          <form id="gp-form" onsubmit="Championship.saveGp(event)">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nome do GP</label>
                <input type="text" id="gp-name" class="form-input" required placeholder="Ex: GP da Espanha">
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Circuito</label>
                  <select id="gp-track" class="form-select" onchange="Championship.onTrackSelect(this.value)">
                    ${tracks.map(t => `<option value="${t.id}">${Utils.escapeHtml(t.name)} (${Utils.escapeHtml(t.country)})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Total de Voltas</label>
                  <input type="number" id="gp-laps" class="form-input" required min="1" max="100" value="${defaultLaps}">
                </div>
              </div>
            </div>
            <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="Championship.addAllGps()">⚡ Adicionar todos os GP's</button>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-secondary" onclick="App.closeModal('gp-modal')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Adicionar GP</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
  },

  onTrackSelect(trackId) {
    const tracks = Storage.getTracks();
    const track = tracks.find(t => t.id === trackId);
    const lapsInput = document.getElementById('gp-laps');
    if (track && lapsInput) {
      lapsInput.value = track.defaultLaps || 15;
    }
  },

  saveGp(e) {
    e.preventDefault();
    const name = document.getElementById('gp-name').value.trim();
    const trackId = document.getElementById('gp-track').value;
    const laps = parseInt(document.getElementById('gp-laps').value, 10) || 15;

    const seasons = Storage.getSeasons();
    const season = Storage.getCurrentSeason(this.selectedDivisionId);
    if (season) {
      const sIdx = seasons.findIndex(s => s.id === season.id);
      if (sIdx !== -1) {
        seasons[sIdx].races.push({
          id: Utils.generateId('gp'),
          name,
          trackId,
          laps,
          completed: false,
          winnerDriverId: null,
          fastestLap: null,
          result: null
        });
        Storage.saveSeasons(seasons);
      }
    }

    App.closeModal('gp-modal');
    App.navigateTo('championship');
  },

  deleteGp(gpId) {
    if (confirm('Tem certeza que deseja remover este Grande Prêmio do calendário?')) {
      const seasons = Storage.getSeasons();
      const season = Storage.getCurrentSeason(this.selectedDivisionId);
      if (season) {
        const sIdx = seasons.findIndex(s => s.id === season.id);
        if (sIdx !== -1) {
          seasons[sIdx].races = seasons[sIdx].races.filter(r => r.id !== gpId);
          Storage.saveSeasons(seasons);
          Storage.recalculateAllFromHistory();
        }
      }
      App.navigateTo('championship');
    }
  },

  resetChampionship() {
    if (confirm('Atenção: Deseja reiniciar a temporada atual zerando todos os pontos e histórico de corridas desta temporada?')) {
      Storage.clearAllHistory();
      App.navigateTo('championship');
    }
  },

  createSeasonModal() {
    const currentYear = new Date().getFullYear();
    const modalHtml = `
      <div class="modal-backdrop active" id="season-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Iniciar Nova Temporada</h3>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('season-modal')">✕</button>
          </div>
          <form onsubmit="Championship.saveNewSeason(event)">
            <div class="modal-body">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Nome da Temporada</label>
                  <input type="text" id="season-name" class="form-input" required value="Temporada ${currentYear + 1}">
                </div>
                <div class="form-group">
                  <label class="form-label">Ano</label>
                  <input type="number" id="season-year" class="form-input" required value="${currentYear + 1}">
                </div>
              </div>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">
                Ao criar uma nova temporada, todos os pilotos começarão com 0 pontos e Rank Bronze. O histórico e recordes serão preservados no Hall da Fama!
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal('season-modal')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Iniciar Temporada</button>
            </div>
          </form>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
  },

  saveNewSeason(e) {
    e.preventDefault();
    const name = document.getElementById('season-name').value.trim();
    const year = parseInt(document.getElementById('season-year').value, 10);

    const drivers = Storage.getDrivers();
    const tracks = Storage.getTracks();
    const seasons = Storage.getSeasons();

    const newSeason = {
      id: Utils.generateId('season'),
      name,
      year,
      status: 'active',
      races: tracks.map((t, idx) => ({
        id: Utils.generateId('gp'),
        name: `GP ${t.country} (${t.name})`,
        trackId: t.id,
        laps: t.defaultLaps,
        completed: false,
        winnerDriverId: null,
        fastestLap: null,
        result: null
      })),
      standings: drivers.map(d => ({
        driverId: d.id,
        points: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        fastestLaps: 0,
        currentRankId: 'rank_bronze'
      }))
    };

    seasons.push(newSeason);
    Storage.saveSeasons(seasons);
    Storage.set(STORAGE_KEYS.CURRENT_SEASON_ID, newSeason.id);

    App.closeModal('season-modal');
    App.navigateTo('championship');
  }
};
