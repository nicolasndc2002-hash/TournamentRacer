/* ==========================================================================
   RACE SIMULATOR - HALL OF FAME & RECORDS (js/hallOfFame.js)
   ========================================================================== */

const HallOfFame = {
  activeTab: 'championship', // 'championship', 'duels', 'timetrial', 'ranked'
  selectedTrackFilter: 'all',
  selectedDivisionFilter: 'all',

  render() {
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const history = Storage.getHistory();
    const seasons = Storage.getSeasons();
    const tracks = Storage.getTracks();
    const duels = Storage.getTeamDuels();
    const timeTrials = Storage.getBestTimeTrials();
    const rankedStandings = Storage.getRankedStandings();

    return `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Banner Hall da Fama -->
        <div class="dashboard-hero">
          <div class="hero-text">
            <span class="badge" style="background: var(--accent-gold); color: #000; font-weight: 800; margin-bottom: 8px;">
              REGISTRO HISTÓRICO & RECORDES MUNDIAIS
            </span>
            <h2>🏛️ Hall da Fama Multimodal</h2>
            <p>Estatísticas eternizadas de todos os modos de competição: Campeonatos por Séries, Duelos de Equipes, Contrarrelógio e Ranqueado Individual.</p>
          </div>
        </div>

        <!-- Abas de Navegação das Categorias do Hall da Fama -->
        <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; overflow-x: auto;">
          <button class="btn ${this.activeTab === 'championship' ? 'btn-primary' : 'btn-secondary'}" onclick="HallOfFame.switchTab('championship')">
            🏆 Modo Campeonato
          </button>
          <button class="btn ${this.activeTab === 'duels' ? 'btn-primary' : 'btn-secondary'}" onclick="HallOfFame.switchTab('duels')">
            ⚔️ Modo Equipe x Equipe
          </button>
          <button class="btn ${this.activeTab === 'timetrial' ? 'btn-primary' : 'btn-secondary'}" onclick="HallOfFame.switchTab('timetrial')">
            ⏱️ Modo Time-Trial
          </button>
          <button class="btn ${this.activeTab === 'ranked' ? 'btn-primary' : 'btn-secondary'}" onclick="HallOfFame.switchTab('ranked')">
            🎖️ Modo Ranqueado (MMR)
          </button>
        </div>

        <!-- Conteúdo Dinâmico por Aba -->
        ${this.renderTabContent(drivers, teams, history, seasons, tracks, duels, timeTrials, rankedStandings)}
      </div>
    `;
  },

  switchTab(tab) {
    this.activeTab = tab;
    App.navigateTo('hall-of-fame');
  },

  setDivisionFilter(divId) {
    this.selectedDivisionFilter = divId;
    App.navigateTo('hall-of-fame');
  },

  confirmDeleteSeason(seasonId, seasonName, divName) {
    if (!confirm(
      `⚠️ Excluir "${divName}" da ${seasonName}?\n\nIsso irá remover:\n• Todos os GPs e resultados desta série nesta temporada\n• O histórico de temporada dos pilotos relacionados\n\nEsta ação não pode ser desfeita.`
    )) return;

    const ok = Storage.deleteSeason(seasonId);
    if (ok) {
      App.navigateTo('hall-of-fame');
    } else {
      alert('Temporada não encontrada. Pode já ter sido removida.');
    }
  },

  confirmDeleteAllSeasons(seasonName, idsJoined) {
    const ids = idsJoined.split(',').filter(Boolean);
    if (ids.length === 0) return;
    if (!confirm(
      `⚠️ Excluir TODA a ${seasonName}?\n\nIsso irá remover as ${ids.length} série(s) desta temporada, incluindo:\n• Todos os GPs e resultados de todas as séries\n• O histórico de temporada de todos os pilotos envolvidos\n\nEsta ação não pode ser desfeita.`
    )) return;

    let allOk = true;
    ids.forEach(id => {
      if (!Storage.deleteSeason(id.trim())) allOk = false;
    });

    if (allOk) {
      App.navigateTo('hall-of-fame');
    } else {
      alert('Algumas temporadas não foram encontradas e podem já ter sido removidas.');
      App.navigateTo('hall-of-fame');
    }
  },

  renderTabContent(drivers, teams, history, seasons, tracks, duels, timeTrials, rankedStandings) {
    switch (this.activeTab) {
      case 'duels':
        return this.renderDuelsTab(teams, duels);
      case 'timetrial':
        return this.renderTimeTrialTab(tracks, timeTrials);
      case 'ranked':
        return this.renderRankedTab(drivers, teams, rankedStandings);
      case 'championship':
      default:
        return this.renderChampionshipTab(drivers, teams, history, seasons, tracks);
    }
  },

  renderChampionshipTab(drivers, teams, history, seasons, tracks) {
    const divisions = Storage.getDivisions();
    const activeDivisions = (this.selectedDivisionFilter && this.selectedDivisionFilter !== 'all')
      ? divisions.filter(d => d.id === this.selectedDivisionFilter)
      : divisions;

    return `
      <!-- Filtros do Hall da Fama do Campeonato -->
      <div class="glass-panel" style="padding: 16px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <h3 class="panel-title" style="font-size: 1.1rem;">🏆 Recordes Históricos por Série</h3>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">Série / Divisão:</span>
              <select class="form-select" style="max-width: 200px; padding: 4px 8px; font-size: 0.8rem;" onchange="HallOfFame.setDivisionFilter(this.value)">
                <option value="all" ${this.selectedDivisionFilter === 'all' ? 'selected' : ''}>Todas as Séries</option>
                ${divisions.map(d => `<option value="${d.id}" ${this.selectedDivisionFilter === d.id ? 'selected' : ''}>${d.icon || '🏆'} ${Utils.escapeHtml(d.name)}</option>`).join('')}
              </select>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">Filtrar Pista:</span>
              <select class="form-select" style="max-width: 200px; padding: 4px 8px; font-size: 0.8rem;" onchange="HallOfFame.onFilterChange(this.value)">
                <option value="all" ${this.selectedTrackFilter === 'all' ? 'selected' : ''}>Todas as Pistas (Geral)</option>
                ${tracks.map(t => `<option value="${Utils.escapeHtml(t.name)}" ${this.selectedTrackFilter === t.name ? 'selected' : ''}>${Utils.escapeHtml(t.name)}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Blocos do Hall da Fama por Série -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        ${activeDivisions.map(div => {
          const divTeams = teams.filter(t => (t.divisionId || 'div_a') === div.id);
          const divDrivers = drivers.filter(d => divTeams.some(t => t.id === d.teamId));
          const divDriverIds = divDrivers.map(d => d.id);

          const divRaces = history.filter(h => {
            if (h.isCasual || h.isTimeTrial || h.gpId?.startsWith('casual_') || h.gpId?.startsWith('tt_') || h.gpId?.startsWith('duel_') || h.gpId?.startsWith('ranked_') || h.isRanked || h.isTeamDuel) {
              return false;
            }
            let raceDiv = h.divisionId;
            if (!raceDiv) {
              if (h.gpId && h.gpId.includes('div_b')) raceDiv = 'div_b';
              else if (h.gpId && h.gpId.includes('div_c')) raceDiv = 'div_c';
              else if (h.gpId && h.gpId.includes('div_d')) raceDiv = 'div_d';
              else if (h.gpId && h.gpId.includes('div_a')) raceDiv = 'div_a';
              else if (h.results && h.results.length > 0) {
                const firstTeam = teams.find(t => t.id === h.results[0].teamId);
                if (firstTeam && firstTeam.divisionId) raceDiv = firstTeam.divisionId;
              }
              raceDiv = raceDiv || 'div_a';
            }
            return raceDiv === div.id;
          });

          const divWinsMap = new Map();
          divDrivers.forEach(d => {
            divWinsMap.set(d.id, { driver: d, wins: 0, podiums: 0, poles: 0 });
          });

          divRaces.forEach(race => {
            race.results?.forEach(res => {
              let entry = divWinsMap.get(res.driverId);
              if (!entry && divDriverIds.includes(res.driverId)) {
                const d = drivers.find(drv => drv.id === res.driverId);
                if (d) {
                  entry = { driver: d, wins: 0, podiums: 0, poles: 0 };
                  divWinsMap.set(res.driverId, entry);
                }
              }
              if (entry) {
                if (res.position === 1) entry.wins += 1;
                if (res.position <= 3) entry.podiums += 1;
                if (res.gridPos === 1) entry.poles += 1;
              }
            });
          });

          const divStatsList = Array.from(divWinsMap.values());
          const divWins = [...divStatsList].filter(i => i.wins > 0).sort((a, b) => b.wins - a.wins).slice(0, 5);
          const divPodiums = [...divStatsList].filter(i => i.podiums > 0).sort((a, b) => b.podiums - a.podiums).slice(0, 5);
          const divPoles = [...divStatsList].filter(i => i.poles > 0).sort((a, b) => b.poles - a.poles).slice(0, 5);

          let divLapRecords = [];
          const racesToFilter = this.selectedTrackFilter === 'all'
            ? divRaces
            : divRaces.filter(h => h.trackName === this.selectedTrackFilter);

          const lapsInDiv = [];
          racesToFilter.forEach(race => {
            race.results?.forEach(res => {
              if (res.bestLapMs && divDriverIds.includes(res.driverId)) {
                lapsInDiv.push({
                  driverName: res.driverName,
                  timeMs: res.bestLapMs,
                  trackInfo: `${race.date} (${race.gpName})`
                });
              }
            });
          });
          lapsInDiv.sort((a, b) => a.timeMs - b.timeMs);
          divLapRecords = lapsInDiv.slice(0, 5);

          if (divLapRecords.length === 0 && this.selectedTrackFilter === 'all') {
            divLapRecords = divDrivers
              .filter(d => d.stats && d.stats.bestLapTime)
              .sort((a, b) => a.stats.bestLapTime - b.stats.bestLapTime)
              .slice(0, 5)
              .map(d => ({
                driverName: d.name,
                timeMs: d.stats.bestLapTime,
                trackInfo: 'Recorde de Carreira'
              }));
          }

          return `
            <div class="glass-panel" style="border-left: 4px solid ${div.color};">
              <div class="panel-header" style="margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.5rem;">${div.icon || '🏆'}</span>
                  <div>
                    <h3 class="panel-title" style="color: ${div.color}; font-size: 1.25rem;">
                      ${Utils.escapeHtml(div.name)} — Hall da Fama
                    </h3>
                    <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">
                      Recordes eternizados da divisão ${Utils.escapeHtml(div.name)}
                    </p>
                  </div>
                </div>
                <span class="badge" style="background: ${div.color}20; color: ${div.color}; font-weight: bold; border: 1px solid ${div.color}60;">
                  ${divStatsList.length} Pilotos
                </span>
              </div>

              <!-- Cards Grid por Série -->
              <div class="grid-4">
                <!-- Mais Vitórias -->
                <div class="glass-panel" style="background: rgba(255, 255, 255, 0.02); padding: 14px;">
                  <div class="panel-header" style="margin-bottom: 10px;">
                    <h4 class="panel-title" style="font-size: 0.9rem;">🏆 Mais Vitórias em GPs</h4>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${divWins.map((item, i) => `
                      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid var(--border-color);">
                        <span><strong style="color: ${i === 0 ? 'var(--accent-gold)' : 'inherit'};">#${i + 1}</strong> ${Utils.escapeHtml(item.driver.name)}</span>
                        <strong style="color: var(--accent-gold);">${item.wins} vitórias</strong>
                      </div>
                    `).join('')}
                    ${divWins.length === 0 ? '<div style="color: var(--text-dim); font-size: 0.8rem;">Nenhum registro</div>' : ''}
                  </div>
                </div>

                <!-- Mais Pódios -->
                <div class="glass-panel" style="background: rgba(255, 255, 255, 0.02); padding: 14px;">
                  <div class="panel-header" style="margin-bottom: 10px;">
                    <h4 class="panel-title" style="font-size: 0.9rem;">🥇 Mais Pódios</h4>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${divPodiums.map((item, i) => `
                      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid var(--border-color);">
                        <span><strong style="color: ${i === 0 ? 'var(--accent-cyan)' : 'inherit'};">#${i + 1}</strong> ${Utils.escapeHtml(item.driver.name)}</span>
                        <strong style="color: var(--accent-cyan);">${item.podiums} pódios</strong>
                      </div>
                    `).join('')}
                    ${divPodiums.length === 0 ? '<div style="color: var(--text-dim); font-size: 0.8rem;">Nenhum registro</div>' : ''}
                  </div>
                </div>

                <!-- Mais Poles -->
                <div class="glass-panel" style="background: rgba(255, 255, 255, 0.02); padding: 14px;">
                  <div class="panel-header" style="margin-bottom: 10px;">
                    <h4 class="panel-title" style="font-size: 0.9rem;">⚡ Mais Pole Positions</h4>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${divPoles.map((item, i) => `
                      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid var(--border-color);">
                        <span><strong style="color: ${i === 0 ? 'var(--accent-green)' : 'inherit'};">#${i + 1}</strong> ${Utils.escapeHtml(item.driver.name)}</span>
                        <strong style="color: var(--accent-green);">${item.poles} poles</strong>
                      </div>
                    `).join('')}
                    ${divPoles.length === 0 ? '<div style="color: var(--text-dim); font-size: 0.8rem;">Nenhum registro</div>' : ''}
                  </div>
                </div>

                <!-- Melhores Voltas com Filtro -->
                <div class="glass-panel" style="background: rgba(255, 255, 255, 0.02); padding: 14px;">
                  <div class="panel-header" style="margin-bottom: 10px;">
                    <h4 class="panel-title" style="font-size: 0.9rem;">⏱️ Melhores Voltas</h4>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${divLapRecords.length > 0 ? divLapRecords.map((r, i) => `
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid var(--border-color);">
                        <div>
                          <div><strong>#${i + 1}</strong> ${Utils.escapeHtml(r.driverName)}</div>
                          <div style="font-size: 0.7rem; color: var(--text-dim);">${Utils.escapeHtml(r.trackInfo)}</div>
                        </div>
                        <strong style="font-family: var(--font-mono); color: var(--accent-purple);">${Utils.formatTime(r.timeMs)}</strong>
                      </div>
                    `).join('') : '<div style="color: var(--text-dim); font-size: 0.8rem; padding: 8px 0;">Nenhum registro</div>'}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Histórico das Temporadas -->
      <div class="glass-panel" style="margin-top: 24px;">
        <div class="panel-header">
          <h3 class="panel-title">📜 Histórico de Temporadas</h3>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">
            Clique no <strong>✕</strong> ao lado de uma série para removê-la, ou em <strong>🗑️ Excluir</strong> para apagar a temporada inteira.
          </p>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ano</th>
                <th>Temporada</th>
                <th>Séries / Excluir Série</th>
                <th>GPs Realizados</th>
                <th>Status</th>
                <th style="width: 110px; text-align: center;">Excluir Tudo</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                // Agrupa seasons por ano — todas as séries do mesmo ano = 1 linha
                const byYear = new Map();
                seasons.forEach(s => {
                  const yr = s.year || '—';
                  if (!byYear.has(yr)) byYear.set(yr, []);
                  byYear.get(yr).push(s);
                });
                return Array.from(byYear.entries())
                  .sort(([a], [b]) => b - a)
                  .map(([year, group]) => {
                    // Deduplica por divisionId — mantém a season com mais corridas (ou a mais recente)
                    const dedupedGroup = [];
                    const seenDivs = new Set();
                    [...group]
                      .sort((a, b) => (b.races?.length || 0) - (a.races?.length || 0))
                      .forEach(s => {
                        const divId = s.divisionId || 'div_a';
                        if (!seenDivs.has(divId)) {
                          seenDivs.add(divId);
                          dedupedGroup.push(s);
                        }
                      });

                    const totalGps = dedupedGroup.reduce((sum, s) => sum + (s.races?.length || 0), 0);
                    const completedGps = dedupedGroup.reduce((sum, s) => sum + (s.races?.filter(r => r.completed).length || 0), 0);
                    const allDone = completedGps === totalGps && totalGps > 0;
                    const anyActive = dedupedGroup.some(s => s.status === 'active');
                    const seasonName = dedupedGroup[0]?.name || `Temporada ${year}`;
                    // IDs de todas as seasons deste ano para excluir tudo de uma vez
                    const allIds = dedupedGroup.map(s => s.id).join(',');

                    return `
                      <tr>
                        <td><strong>${year}</strong></td>
                        <td><strong>${Utils.escapeHtml(seasonName)}</strong></td>
                        <td>
                          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                            ${dedupedGroup.map(s => {
                              const div = divisions.find(d => d.id === s.divisionId) || divisions[0];
                              const completedCount = s.races?.filter(r => r.completed).length || 0;
                              const totalCount = s.races?.length || 0;
                              const done = completedCount === totalCount && totalCount > 0;
                              return `
                                <span style="display:inline-flex;align-items:center;gap:4px;background:${div.color}18;color:${div.color};font-weight:bold;border:1px solid ${div.color}40;border-radius:6px;padding:3px 8px;font-size:0.78rem;">
                                  ${div.icon || '🏆'} ${Utils.escapeHtml(div.name)}
                                  ${done ? ' ✓' : ` (${completedCount}/${totalCount})`}
                                  <button
                                    onclick="HallOfFame.confirmDeleteSeason('${s.id}', '${Utils.escapeHtml(seasonName)}', '${Utils.escapeHtml(div.name)}')"
                                    title="Excluir ${Utils.escapeHtml(div.name)} da ${Utils.escapeHtml(seasonName)}"
                                    style="background:none;border:none;cursor:pointer;color:${div.color};opacity:0.6;font-size:0.9rem;padding:0 0 0 2px;line-height:1;font-weight:900;"
                                    onmouseover="this.style.opacity='1';this.style.color='var(--accent-red)'"
                                    onmouseout="this.style.opacity='0.6';this.style.color='${div.color}'">✕</button>
                                </span>
                              `;
                            }).join('')}
                          </div>
                        </td>
                        <td>${completedGps} / ${totalGps} GPs</td>
                        <td>
                          <span class="badge" style="background: ${allDone ? 'rgba(0,245,155,0.15)' : anyActive ? 'rgba(0,229,255,0.15)' : 'var(--bg-tertiary)'}; color: ${allDone ? 'var(--accent-green)' : anyActive ? 'var(--accent-cyan)' : 'var(--text-muted)'};">
                            ${allDone ? '✅ Finalizada' : anyActive ? '🔄 Em Andamento' : '⏸️ Pausada'}
                          </span>
                        </td>
                        <td style="text-align: center;">
                          <button
                            class="btn btn-danger btn-sm"
                            onclick="HallOfFame.confirmDeleteAllSeasons('${Utils.escapeHtml(seasonName)}', '${allIds}')"
                            title="Excluir toda a ${Utils.escapeHtml(seasonName)} (todas as séries)">
                            🗑️ Excluir
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('');
              })()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderDuelsTab(teams, duels) {
    // Calculate team win record in duels
    const duelStats = teams.map(team => {
      const myDuels = duels.filter(d => d.teamAId === team.id || d.teamBId === team.id);
      const wins = myDuels.filter(d => d.winnerTeamId === team.id).length;
      const losses = myDuels.length - wins;
      const winRate = myDuels.length > 0 ? ((wins / myDuels.length) * 100).toFixed(1) : '0.0';
      return { team, total: myDuels.length, wins, losses, winRate };
    }).sort((a, b) => b.wins - a.wins || parseFloat(b.winRate) - parseFloat(a.winRate));

    return `
      <div class="glass-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">⚔️ Supremacia das Escuderias em Duelos Diretos (1v1)</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">
              Ranking histórico de equipes com maior aproveitamento em confrontos diretos.
            </p>
          </div>
          <span class="badge" style="background: var(--grad-red); color: #fff;">
            ${duels.length} Duelos Disputados
          </span>
        </div>

        <div class="table-container" style="margin-top: 14px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Equipe</th>
                <th>Duelos Realizados</th>
                <th>Vitórias</th>
                <th>Derrotas</th>
                <th>Aproveitamento</th>
              </tr>
            </thead>
            <tbody>
              ${duelStats.map((st, idx) => `
                <tr>
                  <td><strong style="font-size: 1rem; ${idx === 0 ? 'color: var(--accent-gold);' : ''}">#${idx + 1}</strong></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1.3rem;">${st.team.logo || '🏎️'}</span>
                      <strong style="cursor: pointer; text-decoration: underline;" onclick="Teams.openTeamProfileModal('${st.team.id}')">${Utils.escapeHtml(st.team.name)}</strong>
                    </div>
                  </td>
                  <td>${st.total}</td>
                  <td><strong style="color: var(--accent-green); font-size: 1.1rem;">${st.wins}</strong></td>
                  <td><strong style="color: var(--accent-red);">${st.losses}</strong></td>
                  <td><strong style="font-family: var(--font-mono); color: var(--accent-cyan);">${st.winRate}%</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderTimeTrialTab(tracks, timeTrials) {
    return `
      <div class="glass-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">⏱️ Recordes Mundiais de Contrarrelógio (Pista a Pista)</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">
              A marca mais rápida de todos os tempos gravada em cada circuito.
            </p>
          </div>
          <span class="badge" style="background: var(--accent-cyan); color: #000; font-weight: bold;">
            ${timeTrials.length} Melhores Tempos Registrados
          </span>
        </div>

        <div class="grid-3" style="margin-top: 16px;">
          ${tracks.map(track => {
            const trackRecords = timeTrials.filter(t => t.trackId === track.id).sort((a, b) => a.bestLapMs - b.bestLapMs);
            const record = trackRecords[0];

            return `
              <div class="glass-panel" style="border-top: 3px solid var(--accent-cyan);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <strong style="font-size: 0.95rem;">${Utils.getCountryFlag(track.country)} ${Utils.escapeHtml(track.name)}</strong>
                  <span style="font-size: 0.75rem; color: var(--text-dim);">${track.lengthKm} km</span>
                </div>
                ${record ? `
                  <div style="background: rgba(0,0,0,0.25); padding: 10px; border-radius: var(--radius-sm); margin-top: 6px;">
                    <div style="font-size: 0.75rem; color: var(--text-dim);">RECORDE DA PISTA</div>
                    <div style="font-size: 1.4rem; font-weight: 800; font-family: var(--font-mono); color: var(--accent-purple); margin: 2px 0;">
                      ${Utils.formatTime(record.bestLapMs)}
                    </div>
                    <div style="font-size: 0.85rem; font-weight: bold; color: var(--accent-gold);">
                      👑 ${Utils.escapeHtml(record.driverName)}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                      ${record.teamName} • ${record.date}
                    </div>
                  </div>
                ` : `
                  <div style="background: rgba(0,0,0,0.15); padding: 20px; text-align: center; border-radius: var(--radius-sm); color: var(--text-dim); font-size: 0.8rem; font-style: italic;">
                    Sem recorde registrado ainda.
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  renderRankedTab(drivers, teams, rankedStandings) {
    const sorted = [...rankedStandings].sort((a, b) => b.rating - a.rating);

    return `
      <div class="glass-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">🎖️ Hall dos Melhores Pilotos Ranqueados (Top MMR)</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">
              Quadro de honra permanente dos pilotos com maior nível competitivo individual.
            </p>
          </div>
          <span class="badge" style="background: linear-gradient(135deg, var(--accent-purple) 0%, #3b82f6 100%); color: #fff;">
            Top Competitivo
          </span>
        </div>

        <div class="table-container" style="margin-top: 14px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Piloto</th>
                <th>Escuderia</th>
                <th>Tier</th>
                <th>Rating Atual</th>
                <th>Pico de Rating</th>
                <th>Vitórias</th>
              </tr>
            </thead>
            <tbody>
              ${sorted.map((s, idx) => {
                const driver = drivers.find(d => d.id === s.driverId) || { name: 'Piloto', color: '#fff', number: 0 };
                const team = teams.find(t => t.id === driver.teamId) || { name: 'Sem Equipe' };
                const tier = ModeRanked.getTierInfo(s.rating);

                return `
                  <tr>
                    <td><strong style="font-size: 1.1rem; ${idx === 0 ? 'color: var(--accent-gold);' : ''}">#${idx + 1}</strong></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${driver.color}; display: inline-block;"></span>
                        <strong style="cursor: pointer; text-decoration: underline;" onclick="Pilots.openProfileModal('${driver.id}')">${Utils.escapeHtml(driver.name)}</strong>
                      </div>
                    </td>
                    <td>${Utils.escapeHtml(team.name)}</td>
                    <td>
                      <span class="badge" style="background: ${tier.color}20; color: ${tier.color}; border: 1px solid ${tier.color}; font-weight: bold;">
                        ${tier.icon} ${tier.name}
                      </span>
                    </td>
                    <td><strong style="font-family: var(--font-mono); font-size: 1.15rem; color: var(--accent-cyan);">${s.rating} MMR</strong></td>
                    <td style="font-family: var(--font-mono); color: var(--accent-gold); font-weight: bold;">${s.peakRating || s.rating}</td>
                    <td><strong>${s.wins || 0}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  onFilterChange(trackName) {
    this.selectedTrackFilter = trackName;
    App.navigateTo('hall-of-fame');
  }
};
