/* ==========================================================================
   RACE SIMULATOR - INDIVIDUAL RANKED MODE (js/modeRanked.js)
   ========================================================================== */

const ModeRanked = {
  selectedTrackId: null,
  selectedLaps: 12,

  // Lê os tiers dinâmicos do Editor de Ranks (categoria 'ranked')
  getTierInfo(rating) {
    const ranks = Storage.getRanks('ranked');
    // Encontra o maior rank cujo minPoints <= rating
    let current = ranks[0] || { name: 'Bronze', color: '#cd7f32', icon: '🥉', minPoints: 0 };
    for (const rank of ranks) {
      if (rating >= rank.minPoints) current = rank;
    }
    return {
      name:   current.name,
      color:  current.color,
      icon:   current.icon,
      border: `border-${current.name.toLowerCase().replace(/\s/g, '-')}`
    };
  },

  render() {
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const tracks = Storage.getTracks();
    const rankedStandings = Storage.getRankedStandings();
    const rankedHistory = Storage.getRankedHistory();

    if (!this.selectedTrackId && tracks.length > 0) this.selectedTrackId = tracks[0].id;
    const track = tracks.find(t => t.id === this.selectedTrackId) || tracks[0];

    // Sort by rating descending
    const sortedStandings = [...rankedStandings].sort((a, b) => b.rating - a.rating);

    return `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Header com navegação de volta para o Hub de Modos -->
        <div class="glass-panel" style="display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--accent-purple);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('modes-hub')">⬅ Todos os Modos</button>
              <span class="badge" style="background: rgba(139, 92, 246, 0.2); color: var(--accent-purple); font-weight: 700;">MODO 4</span>
            </div>
            <h2 style="font-size: 1.6rem; font-weight: 800; margin-top: 6px;">🎖️ Modo Ranqueado Individual (Ranked)</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Disputa individual competitiva por MMR/Rating. Conquiste posições altas para subir de tier (Bronze até Legend)!
            </p>
          </div>
          <button class="btn btn-primary btn-lg" style="background: linear-gradient(135deg, var(--accent-purple) 0%, #3b82f6 100%); box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);" onclick="ModeRanked.startRankedRace()">
            ⚡ Iniciar Partida Ranqueada
          </button>
        </div>

        <!-- Seletor de Circuito e Tiers -->
        <div class="grid-2">
          <!-- Configuração da Corrida Ranqueada -->
          <div class="glass-panel">
            <div class="panel-header">
              <h3 class="panel-title">🏁 Configurar Próxima Partida</h3>
            </div>
            <div class="form-group" style="margin-top: 10px;">
              <label class="form-label">Circuito da Corrida</label>
              <select class="form-select" onchange="ModeRanked.setTrack(this.value)">
                ${tracks.map(t => `
                  <option value="${t.id}" ${t.id === track?.id ? 'selected' : ''}>
                    ${Utils.getCountryFlagText(t.country)} ${t.name} (${t.lengthKm} km)
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Número de Voltas: <span id="ranked-laps-display">${this.selectedLaps}</span> voltas</label>
              <input type="range" class="form-input" min="5" max="25" value="${this.selectedLaps}" oninput="ModeRanked.setLaps(this.value)">
            </div>
          </div>
          <!-- Divisões e Tiers Competitivos (dinâmico via Editor de Ranks) -->
          <div class="glass-panel">
            <div class="panel-header">
              <h3 class="panel-title">🏆 Tiers &amp; Divisões Competitivas</h3>
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('ranks')">✏️ Editar Ranks</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; margin-top: 10px; text-align: center;">
              ${(() => {
                const ranks = Storage.getRanks('ranked');
                return ranks.map((r, idx) => {
                  const nextMinPoints = ranks[idx + 1]?.minPoints;
                  const rangeLabel = nextMinPoints
                    ? `${r.minPoints} – ${nextMinPoints - 1}`
                    : `${r.minPoints}+`;
                  return `
                    <div style="background: ${r.color}18; border: 1px solid ${r.color}80; padding: 10px 6px; border-radius: var(--radius-sm); font-size: 0.75rem;">
                      <div style="font-size: 1.4rem; margin-bottom: 4px;">${r.icon || '🏁'}</div>
                      <strong style="color: ${r.color};">${Utils.escapeHtml(r.name)}</strong>
                      <div style="color: var(--text-dim); font-size: 0.7rem; margin-top: 2px;">${rangeLabel} MMR</div>
                    </div>
                  `;
                }).join('');
              })()}
            </div>
          </div>
        </div>

        <!-- Tabela de Classificação Ranqueada Individual -->
        <div class="glass-panel">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">📈 Tabela de Classificação Ranqueada (MMR)</h3>
              <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">
                Pontuação individual e histórico competitivo de cada piloto.
              </p>
            </div>
            <span class="badge" style="background: var(--grad-brand); color: #fff;">
              ${sortedStandings.length} Pilotos Ranqueados
            </span>
          </div>

          <div class="table-container" style="margin-top: 12px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Piloto</th>
                  <th>Equipe</th>
                  <th>Tier Competitivo</th>
                  <th>Rating (MMR)</th>
                  <th>Vitórias</th>
                  <th>Pódios</th>
                  <th>Partidas</th>
                  <th>Pico de Rating</th>
                </tr>
              </thead>
              <tbody>
                ${sortedStandings.map((s, idx) => {
                  const driver = drivers.find(d => d.id === s.driverId) || { name: 'Piloto', color: '#fff', number: 0 };
                  const team = teams.find(t => t.id === driver.teamId) || { name: 'Sem Equipe' };
                  const tier = ModeRanked.getTierInfo(s.rating);

                  return `
                    <tr>
                      <td>
                        <strong style="font-size: 1rem; ${idx === 0 ? 'color: var(--accent-gold);' : ''}">
                          #${idx + 1}
                        </strong>
                      </td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${driver.color}; display: inline-block;"></span>
                          <strong style="cursor: pointer; text-decoration: underline;" onclick="Pilots.openProfileModal('${driver.id}')">
                            ${Utils.escapeHtml(driver.name)}
                          </strong>
                          <span style="font-size: 0.75rem; color: var(--text-dim);"> #${driver.number}</span>
                        </div>
                      </td>
                      <td>${Utils.escapeHtml(team.name)}</td>
                      <td>
                        <span class="badge" style="background: ${tier.color}20; color: ${tier.color}; border: 1px solid ${tier.color}60; font-weight: 700;">
                          ${tier.icon} ${tier.name}
                        </span>
                      </td>
                      <td>
                        <strong style="font-family: var(--font-mono); font-size: 1.1rem; color: var(--accent-cyan);">
                          ${s.rating} MMR
                        </strong>
                      </td>
                      <td><strong>${s.wins || 0}</strong></td>
                      <td>${s.podiums || 0}</td>
                      <td>${s.matches || 0}</td>
                      <td style="font-family: var(--font-mono); color: var(--text-muted);">${s.peakRating || s.rating}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Histórico de Partidas Ranqueadas -->
        <div class="glass-panel">
          <div class="panel-header">
            <h3 class="panel-title">📜 Histórico de Corridas Ranqueadas</h3>
            <span class="badge" style="background: var(--bg-tertiary);">${rankedHistory.length} partidas</span>
          </div>

          <div class="table-container" style="margin-top: 12px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Circuito</th>
                  <th>Vencedor da Partida</th>
                  <th>Melhor Volta</th>
                  <th>Voltas</th>
                </tr>
              </thead>
              <tbody>
                ${rankedHistory.map(h => `
                  <tr>
                    <td>${h.date}</td>
                    <td>${Utils.escapeHtml(h.trackName)}</td>
                    <td>
                      <span style="color: var(--accent-gold); font-weight: bold;">
                        🏆 ${Utils.escapeHtml(h.winnerDriverName)}
                      </span>
                    </td>
                    <td style="font-family: var(--font-mono); color: var(--accent-purple);">
                      ${Utils.formatTime(h.fastestLapMs)} (${Utils.escapeHtml(h.fastestLapDriverName)})
                    </td>
                    <td>${h.laps}</td>
                  </tr>
                `).join('')}
                ${rankedHistory.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 20px;">Nenhuma partida ranqueada realizada ainda.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  setTrack(id) {
    this.selectedTrackId = id;
    App.navigateTo('mode-ranked');
  },

  setLaps(laps) {
    this.selectedLaps = parseInt(laps, 10);
    const el = document.getElementById('ranked-laps-display');
    if (el) el.textContent = this.selectedLaps;
  },

  startRankedRace() {
    const tracks = Storage.getTracks();
    const track = tracks.find(t => t.id === this.selectedTrackId) || tracks[0];

    const gpData = {
      id: Utils.generateId('ranked_gp'),
      name: `Corrida Ranqueada: ${track.name}`,
      trackId: track.id,
      laps: this.selectedLaps,
      isRanked: true
    };

    this.promptDriverSelection(gpData);
  },

  // Seleção manual de pilotos para o modo ranqueado
  promptDriverSelection(gpData) {
    this._pendingGpData = gpData;

    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const rankedStandings = Storage.getRankedStandings();

    // Mapeia standings para cada piloto
    const driverStandings = new Map();
    rankedStandings.forEach(s => {
      driverStandings.set(s.driverId, s);
    });

    const modalHtml = `
      <div class="modal-backdrop active" id="driver-select-modal">
        <div class="modal-content" style="max-width: 800px;">
          <div class="modal-header">
            <div>
              <h3>🏎️ Escolha os Pilotos Participantes</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                Selecione os pilotos que disputarão o <strong>${Utils.escapeHtml(gpData.name)}</strong>
              </p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('driver-select-modal')">✕</button>
          </div>
          <form id="driver-select-form" onsubmit="ModeRanked.confirmDriverSelection(event)">
            <div class="modal-body" style="max-height: 450px; overflow-y: auto;">
              <!-- Busca e Filtros -->
              <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                <input type="text" id="driver-search" class="form-input" placeholder="🔍 Buscar piloto por nome ou equipe..." style="flex: 1;" oninput="ModeRanked.filterDriverList()">
                <select id="team-filter" class="form-select" style="width: 180px;" onchange="ModeRanked.filterDriverList()">
                  <option value="all">Todas as Equipes</option>
                  ${teams.map(t => `<option value="${t.id}">${Utils.escapeHtml(t.name)}</option>`).join('')}
                </select>
                <select id="rank-filter" class="form-select" style="width: 160px;" onchange="ModeRanked.filterDriverList()">
                  <option value="all">Todos os Ranks</option>
                  ${(() => {
                    const ranks = Storage.getRanks('ranked');
                    const sortedRanks = [...ranks].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
                    return sortedRanks.map(r => `<option value="${r.id}">${r.icon} ${r.name}</option>`).join('');
                  })()}
                </select>
              </div>

              <!-- Ações Rápidas -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span id="selected-driver-counter" style="font-weight: 700; font-size: 0.85rem; color: var(--accent-cyan);">
                  Pilotos Selecionados: 0 / ${drivers.length}
                </span>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="ModeRanked.toggleAllDrivers(true)">Marcar Todos</button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="ModeRanked.toggleAllDrivers(false)">Desmarcar Todos</button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="ModeRanked.selectOnePerTeam()">1 por Equipe</button>
                </div>
              </div>

              ${drivers.length === 0 ? `
                <div style="text-align:center;padding:32px;color:var(--text-dim);">
                  <div style="font-size:2rem;margin-bottom:8px;">🏎️</div>
                  Nenhum piloto cadastrado. Acesse <strong>Pilotos</strong> para adicionar.
                </div>
              ` : ''}

              <!-- Lista de Pilotos -->
              <div id="driver-list" style="display: flex; flex-direction: column; gap: 8px;">
                ${this.renderDriverList(drivers, teams, driverStandings, '', 'all', 'all')}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal('driver-select-modal')">Cancelar</button>
              <button type="submit" class="btn btn-primary" ${drivers.length === 0 ? 'disabled' : ''}>Iniciar Corrida Ranqueada ⚡</button>
            </div>
          </form>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
    this.updateDriverCounter();
  },

  renderDriverList(drivers, teams, driverStandings, searchTerm = '', teamFilter = 'all', rankFilter = 'all') {
    let filteredDrivers = drivers;

    // Filtro por busca
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filteredDrivers = filteredDrivers.filter(d => {
        const team = teams.find(t => t.id === d.teamId);
        return d.name.toLowerCase().includes(query) ||
               d.code?.toLowerCase().includes(query) ||
               team?.name.toLowerCase().includes(query);
      });
    }

    // Filtro por equipe
    if (teamFilter !== 'all') {
      filteredDrivers = filteredDrivers.filter(d => d.teamId === teamFilter);
    }

    // Filtro por rank/tier
    if (rankFilter !== 'all') {
      const ranks = Storage.getRanks('ranked');
      const targetRank = ranks.find(r => r.id === rankFilter);
      if (targetRank) {
        filteredDrivers = filteredDrivers.filter(d => {
          const standing = driverStandings.get(d.id);
          if (!standing) return false;
          const tier = this.getTierInfo(standing.rating);
          return tier.name === targetRank.name;
        });
      }
    }

    // Ordena por nome (A-Z)
    filteredDrivers.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    return filteredDrivers.map(driver => {
      const team = teams.find(t => t.id === driver.teamId) || { name: 'Sem Equipe', color: '#999' };
      const standing = driverStandings.get(driver.id);
      const tier = standing ? this.getTierInfo(standing.rating) : null;

      return `
        <label class="glass-panel driver-item" style="padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-color: ${team.color}40; border-left: 3px solid ${team.color};"
               data-driver-name="${driver.name.toLowerCase()}"
               data-team-name="${team.name.toLowerCase()}"
               data-team-id="${team.id}">
          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="checkbox" class="driver-checkbox" value="${driver.id}" onchange="ModeRanked.updateDriverCounter()">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${driver.color}; display: inline-block;"></span>
            <div>
              <strong style="font-size: 0.95rem;">${Utils.escapeHtml(driver.name)}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">
                #${driver.number} • ${Utils.escapeHtml(team.name)}
                ${tier ? ` • <span style="color: ${tier.color};">${tier.icon} ${tier.name}</span>` : ''}
                ${standing ? ` • ${standing.rating} MMR` : ''}
              </div>
            </div>
          </div>
          ${tier ? `<span class="badge" style="background: ${tier.color}20; color: ${tier.color}; font-size: 0.75rem;">${tier.icon}</span>` : ''}
        </label>
      `;
    }).join('');
  },

  filterDriverList() {
    const searchTerm = document.getElementById('driver-search')?.value || '';
    const teamFilter = document.getElementById('team-filter')?.value || 'all';
    const rankFilter = document.getElementById('rank-filter')?.value || 'all';

    // Salva os checkboxes marcados antes de filtrar
    const checkedIds = new Set();
    document.querySelectorAll('.driver-checkbox:checked').forEach(cb => {
      checkedIds.add(cb.value);
    });

    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const rankedStandings = Storage.getRankedStandings();

    const driverStandings = new Map();
    rankedStandings.forEach(s => {
      driverStandings.set(s.driverId, s);
    });

    const listEl = document.getElementById('driver-list');
    if (listEl) {
      listEl.innerHTML = this.renderDriverList(drivers, teams, driverStandings, searchTerm, teamFilter, rankFilter);

      // Restaura os checkboxes marcados
      document.querySelectorAll('.driver-checkbox').forEach(cb => {
        if (checkedIds.has(cb.value)) {
          cb.checked = true;
        }
      });
    }
  },

  updateDriverCounter() {
    const checkboxes = document.querySelectorAll('.driver-checkbox:checked');
    const counter = document.getElementById('selected-driver-counter');
    if (counter) {
      const total = document.querySelectorAll('.driver-checkbox').length;
      counter.textContent = `Pilotos Selecionados: ${checkboxes.length} / ${total}`;
      counter.style.color = checkboxes.length === 0 ? 'var(--accent-red)' : 'var(--accent-cyan)';
    }
  },

  toggleAllDrivers(checkAll) {
    const checkboxes = document.querySelectorAll('.driver-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = checkAll;
    });
    this.updateDriverCounter();
  },

  selectOnePerTeam() {
    // Desmarca todos primeiro
    this.toggleAllDrivers(false);

    // Seleciona 1 piloto por equipe (o primeiro de cada)
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const teamDriverIds = new Set();

    teams.forEach(team => {
      const teamDrivers = drivers.filter(d => d.teamId === team.id);
      if (teamDrivers.length > 0) {
        teamDriverIds.add(teamDrivers[0].id);
      }
    });

    const checkboxes = document.querySelectorAll('.driver-checkbox');
    checkboxes.forEach(cb => {
      if (teamDriverIds.has(cb.value)) {
        cb.checked = true;
      }
    });

    this.updateDriverCounter();
  },

  confirmDriverSelection(e) {
    e.preventDefault();
    const gpData = this._pendingGpData;
    if (!gpData) {
      alert('Erro: dados do GP não encontrados. Tente novamente.');
      return;
    }

    const checked = Array.from(document.querySelectorAll('.driver-checkbox:checked')).map(cb => cb.value);

    if (checked.length === 0) {
      alert('Selecione pelo menos 1 piloto para disputar a corrida ranqueada!');
      return;
    }

    if (checked.length < 2) {
      alert('Selecione pelo menos 2 pilotos para uma corrida competitiva!');
      return;
    }

    // Cria uma equipe temporária com os pilotos selecionados
    const tempTeamId = 'ranked_temp_team';
    const tempTeam = {
      id: tempTeamId,
      name: 'Competidores Ranqueados',
      color: '#8b5cf6',
      secondaryColor: '#3b82f6',
      logo: '🎖️'
    };

    // Modifica os drivers para estarem na equipe temporária apenas para esta corrida
    const drivers = Storage.getDrivers();
    const originalTeamIds = new Map();
    checked.forEach(driverId => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver) {
        originalTeamIds.set(driverId, driver.teamId);
        driver.teamId = tempTeamId;
      }
    });

    App.closeModal('driver-select-modal');

    // Inicia a corrida com a equipe temporária
    this.selectedTeamIds = [tempTeamId];
    Race.startQualify(gpData, this.selectedTeamIds);

    // Restaura as equipes originais após a corrida começar
    setTimeout(() => {
      checked.forEach(driverId => {
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
          driver.teamId = originalTeamIds.get(driverId);
        }
      });
      Storage.saveDrivers(drivers);
    }, 100);
  },

  processRankedRaceResult(raceRecord) {
    const standings = Storage.getRankedStandings();
    const drivers = Storage.getDrivers();
    const settings = Storage.getSettings();
    const rankedCfg = settings.rankedSettings || {
      systemMode: 'mmr',
      baseRating: 1200,
      kFactor: 32,
      pointsSystem: [
        { pos: 1, pointsDelta: 45 },
        { pos: 2, pointsDelta: 30 },
        { pos: 3, pointsDelta: 20 },
        { pos: 4, pointsDelta: 10 },
        { pos: 5, pointsDelta: 5 },
        { pos: 6, pointsDelta: 0 },
        { pos: 7, pointsDelta: -5 },
        { pos: 8, pointsDelta: -10 },
        { pos: 9, pointsDelta: -20 },
        { pos: 10, pointsDelta: -30 }
      ]
    };

    const totalDrivers = raceRecord.results.length;

    raceRecord.results.forEach(res => {
      let st = standings.find(s => s.driverId === res.driverId);
      if (!st) {
        st = {
          driverId: res.driverId,
          rating: rankedCfg.baseRating || 1200,
          tier: 'Bronze',
          wins: 0,
          podiums: 0,
          matches: 0,
          peakRating: rankedCfg.baseRating || 1200,
          winRate: 0
        };
        standings.push(st);
      }

      st.matches = (st.matches || 0) + 1;
      if (res.position === 1) st.wins = (st.wins || 0) + 1;
      if (res.position <= 3) st.podiums = (st.podiums || 0) + 1;

      let delta = 0;

      if (rankedCfg.systemMode === 'mmr') {
        // Tabela configurável de pontos por posição
        const customRule = rankedCfg.pointsSystem?.find(p => p.pos === res.position);
        if (customRule) {
          delta = customRule.pointsDelta;
        } else {
          // Fallback para posições além da tabela
          const midpoint = (totalDrivers + 1) / 2;
          const posDiff = midpoint - res.position;
          delta = Math.round(posDiff * 10);
        }
      } else {
        // Modo ELO com fator K
        const k = rankedCfg.kFactor || 32;
        const actualScore = (totalDrivers - res.position) / (totalDrivers - 1 || 1); // 1.0 para 1º, 0.0 para último
        const expectedScore = 0.5; // Média esperada no grid
        delta = Math.round(k * (actualScore - expectedScore) * 2);
      }

      st.rating = Math.max(100, st.rating + delta);
      if (st.rating > (st.peakRating || 1200)) {
        st.peakRating = st.rating;
      }
      // Atualiza tier a partir do Editor de Ranks (sincronizado)
      const tierRank = typeof Ranks !== 'undefined'
        ? Ranks.getRankForPoints(st.rating, 'ranked')
        : ModeRanked.getTierInfo(st.rating);
      st.tier      = tierRank.name;
      st.tierId    = tierRank.id   || '';
      st.tierColor = tierRank.color;
      st.tierIcon  = tierRank.icon;

      // Update driver career profile stats (races, wins, podiums, best finish, best lap time)
      const driver = drivers.find(d => d.id === res.driverId);
      if (driver) {
        if (!driver.stats) {
          driver.stats = { races: 0, points: 0, wins: 0, podiums: 0, poles: 0, bestFinish: null, bestLapTime: null };
        }
        driver.stats.races = (driver.stats.races || 0) + 1;
        if (res.position === 1) driver.stats.wins = (driver.stats.wins || 0) + 1;
        if (res.position <= 3) driver.stats.podiums = (driver.stats.podiums || 0) + 1;
        if (res.gridPos === 1) driver.stats.poles = (driver.stats.poles || 0) + 1;
        if (!driver.stats.bestFinish || res.position < driver.stats.bestFinish) {
          driver.stats.bestFinish = res.position;
        }
        if (res.bestLapMs && (!driver.stats.bestLapTime || res.bestLapMs < driver.stats.bestLapTime)) {
          driver.stats.bestLapTime = res.bestLapMs;
        }
      }

      // Record MMR delta for history / profile view
      // Store numeric delta for calculations, display string for UI
      res.points = delta; // Store as number for calculations
      res.pointsDisplay = delta > 0 ? `+${delta}` : `${delta}`; // String for display
      res.mmrDelta = delta;
    });

    Storage.saveRankedStandings(standings);
    Storage.saveDrivers(drivers);

    // Save to general history so raceRecord retains updated points/mmrDelta
    const history = Storage.getHistory();
    const hIdx = history.findIndex(h => h.id === raceRecord.id);
    if (hIdx !== -1) {
      history[hIdx] = raceRecord;
      Storage.saveHistory(history);
    }

    // Save to ranked history
    Storage.addRankedMatch({
      id: Utils.generateId('rm'),
      date: raceRecord.date,
      trackName: raceRecord.trackName,
      laps: raceRecord.totalLaps,
      winnerDriverName: raceRecord.results[0]?.driverName || 'N/A',
      fastestLapMs: raceRecord.fastestLap?.timeMs || null,
      fastestLapDriverName: raceRecord.fastestLap?.driverName || 'N/A'
    });
  }
};
