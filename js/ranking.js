/* ==========================================================================
   RACE SIMULATOR - RANKING & CONSTRUCTORS LEADERBOARD (js/ranking.js)
   ========================================================================== */

const Ranking = {
  searchTerm: '',
  activeTab: 'drivers', // 'drivers' or 'constructors'
  selectedDivisionId: 'all',

  render() {
    const season = Storage.getCurrentSeason();
    if (!season) {
      return `
        <div class="glass-panel" style="text-align: center; padding: 40px;">
          <h2>Nenhuma temporada ativa para exibir ranking.</h2>
        </div>
      `;
    }

    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const divisions = Storage.getDivisions();
    const query = this.searchTerm.trim().toLowerCase();

    // Filter divisions if divisionId !== 'all'
    const activeDivisions = (this.selectedDivisionId && this.selectedDivisionId !== 'all')
      ? divisions.filter(d => d.id === this.selectedDivisionId)
      : divisions;

    // Drivers standings
    const sortedStandings = [...season.standings]
      .filter(st => {
        const driver = drivers.find(d => d.id === st.driverId);
        const team = teams.find(t => t.id === driver?.teamId);
        const matchesQuery = !query || `${driver?.name || ''} ${team?.name || ''} ${driver?.code || ''}`.toLowerCase().includes(query);
        const matchesDiv = this.selectedDivisionId === 'all' || (team && team.divisionId === this.selectedDivisionId);
        return matchesQuery && matchesDiv;
      })
      .sort((a, b) => b.points - a.points || b.wins - a.wins);

    return `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="glass-panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">🏆 Ranking da Temporada &amp; Construtores</h2>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
                Acompanhe o ranking de pilotos e a tabela de construtores agrupada por séries/divisões.
              </p>
            </div>
            <span class="badge" style="background: var(--grad-brand); color: #fff;">
              Temporada ${season.year}
            </span>
          </div>

          <!-- Seletor de Abas Pilotos vs Construtores -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; gap: 8px;">
              <button class="btn ${this.activeTab === 'drivers' ? 'btn-primary' : 'btn-secondary'}" onclick="Ranking.setTab('drivers')">
                👤 Ranking de Pilotos
              </button>
              <button class="btn ${this.activeTab === 'constructors' ? 'btn-primary' : 'btn-secondary'}" onclick="Ranking.setTab('constructors')">
                🏎️ Tabela de Construtores por Divisão
              </button>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">Filtrar Série:</span>
              <select class="form-select" style="max-width: 220px;" onchange="Ranking.setDivision(this.value)">
                <option value="all" ${this.selectedDivisionId === 'all' ? 'selected' : ''}>Todas as Séries</option>
                ${divisions.map(d => `
                  <option value="${d.id}" ${this.selectedDivisionId === d.id ? 'selected' : ''}>
                    ${d.icon || '🏆'} ${Utils.escapeHtml(d.name)}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <input class="form-input" style="margin-top: 14px;" placeholder="Pesquisar piloto ou escuderia..." value="${Utils.escapeHtml(this.searchTerm)}" oninput="Ranking.filter(this.value)">
        </div>

        ${this.activeTab === 'drivers' ? `
          <!-- Tabela de Pilotos SEPARADA POR DIVISÕES (Série A, B, C...) -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${activeDivisions.map(div => {
              const divSeason = Storage.getCurrentSeason(div.id);
              const divTeams = teams.filter(t => (t.divisionId || 'div_a') === div.id);
              const divTeamIds = divTeams.map(t => t.id);

              const divDrivers = drivers.filter(d => divTeamIds.includes(d.teamId));

              const sortedStandings = divDrivers.map(driver => {
                const st = divSeason?.standings?.find(s => s.driverId === driver.id) || {
                  driverId: driver.id,
                  points: 0,
                  wins: 0,
                  podiums: 0,
                  poles: 0,
                  fastestLaps: 0,
                  currentRankId: 'rank_bronze'
                };
                return st;
              }).filter(st => {
                const driver = drivers.find(d => d.id === st.driverId);
                if (!driver) return false;
                const team = divTeams.find(t => t.id === driver.teamId);
                const matchesQuery = !query || `${driver.name} ${team?.name || ''} ${driver.code || ''}`.toLowerCase().includes(query);
                return matchesQuery;
              }).sort((a, b) => (b.points - a.points) || (b.wins - a.wins) || (b.podiums - a.podiums));

              return `
                <div class="glass-panel" style="border-left: 4px solid ${div.color};">
                  <div class="panel-header">
                    <div>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.4rem;">${div.icon || '🏆'}</span>
                        <h3 class="panel-title" style="color: ${div.color}; font-size: 1.3rem;">
                          ${Utils.escapeHtml(div.name)} — Ranking de Pilotos
                        </h3>
                      </div>
                      <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">
                        Classificação oficial da ${Utils.escapeHtml(div.name)} (${divSeason ? Utils.escapeHtml(divSeason.name) : 'Temporada Atual'})
                      </p>
                    </div>
                    <span class="badge" style="background: ${div.color}20; color: ${div.color}; font-weight: bold; border: 1px solid ${div.color}60;">
                      ${sortedStandings.length} Pilotos
                    </span>
                  </div>

                  <div class="table-container" style="margin-top: 14px;">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th style="width: 80px;">Pos</th>
                          <th>Piloto</th>
                          <th>Escuderia</th>
                          <th style="min-width: 200px;">Rank &amp; Progresso</th>
                          <th>Pontos</th>
                          <th>Vitórias</th>
                          <th>Pódios</th>
                          <th>Voltas Rápidas</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${sortedStandings.map((st, idx) => {
                          const driver = drivers.find(d => d.id === st.driverId) || { name: 'Piloto', color: '#00e5ff', teamId: '' };
                          const team = divTeams.find(t => t.id === driver.teamId) || { name: 'Sem Equipe' };

                          return `
                            <tr data-search="${Utils.escapeHtml(`${driver.name} ${team.name} ${driver.code || ''}`)}">
                              <td>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                  <strong style="font-size: 1.05rem; min-width: 28px; ${idx === 0 ? 'color: var(--accent-gold);' : ''}">
                                    #${idx + 1}
                                  </strong>
                                  ${Ranking.renderPositionDelta(st.positionDelta)}
                                </div>
                              </td>
                              <td>
                                <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="Pilots.openProfileModal('${driver.id}')">
                                  <span style="width: 12px; height: 12px; border-radius: 50%; background: ${driver.color}; display: inline-block;"></span>
                                  <div>
                                    <strong>${Utils.escapeHtml(driver.name)}</strong>
                                    <span style="font-size: 0.75rem; color: var(--text-dim);"> #${driver.number}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style="display: flex; align-items: center; gap: 6px; cursor: pointer;" onclick="Teams.openTeamProfileModal('${team.id}')">
                                  <strong style="color: ${team.color || 'var(--text-color)'}">${Utils.escapeHtml(team.name)}</strong>
                                </div>
                              </td>
                              <td>
                                ${Ranks.renderProgressBar(st.points)}
                              </td>
                              <td>
                                <strong style="font-size: 1.1rem; font-family: var(--font-mono); color: var(--accent-cyan);">
                                  ${st.points}
                                </strong>
                              </td>
                              <td><strong>${st.wins}</strong></td>
                              <td>${st.podiums}</td>
                              <td>${st.fastestLaps}</td>
                            </tr>
                          `;
                        }).join('')}
                        ${sortedStandings.length === 0 ? '<tr><td colspan="8" style="text-align: center; color: var(--text-dim); padding: 20px;">Nenhum piloto nesta divisão.</td></tr>' : ''}
                      </tbody>
                    </table>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- Tabela de Construtores SEPARADA POR DIVISÕES (Série A, B, C...) -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${activeDivisions.map(div => {
              const divStandings = Storage.getConstructorsStandings(div.id)
                .filter(c => !query || c.teamName.toLowerCase().includes(query));

              return `
                <div class="glass-panel" style="border-left: 4px solid ${div.color};">
                  <div class="panel-header">
                    <div>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.4rem;">${div.icon || '🏆'}</span>
                        <h3 class="panel-title" style="color: ${div.color}; font-size: 1.3rem;">
                          ${Utils.escapeHtml(div.name)} — Campeonato de Construtores
                        </h3>
                      </div>
                      <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">
                        Regras de fim de temporada: 
                        <span style="color: var(--accent-green); font-weight: bold;">Top ${div.promoteCount || 0} Acesso ⬆️</span> • 
                        <span style="color: var(--accent-red); font-weight: bold;">Z-${div.relegateCount || 0} Descenso ⬇️</span>
                      </p>
                    </div>
                    <span class="badge" style="background: ${div.color}20; color: ${div.color}; font-weight: bold; border: 1px solid ${div.color}60;">
                      ${divStandings.length} / ${div.maxTeams || 10} Equipes
                    </span>
                  </div>

                  <div class="table-container" style="margin-top: 14px;">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th style="width: 80px;">Pos</th>
                          <th>Escuderia / Equipe</th>
                          <th>Pilotos Titulares</th>
                          <th>Pontos</th>
                          <th>Vitórias</th>
                          <th>Pódios</th>
                          <th>Status da Zona</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${divStandings.map((c, idx) => {
                          const pos = idx + 1;
                          const total = divStandings.length;
                          let zoneBadge = `<span class="badge" style="background: var(--bg-tertiary); color: var(--text-muted);">Permanência</span>`;
                          if (div.promoteCount > 0 && pos <= div.promoteCount) {
                            zoneBadge = `<span class="badge" style="background: rgba(0, 245, 155, 0.2); color: var(--accent-green); font-weight: bold;">⬆️ Zona de Acesso</span>`;
                          } else if (div.relegateCount > 0 && pos > (total - div.relegateCount)) {
                            zoneBadge = `<span class="badge" style="background: rgba(255, 51, 102, 0.2); color: var(--accent-red); font-weight: bold;">⬇️ Zona de Descenso</span>`;
                          }

                          return `
                            <tr data-search="${Utils.escapeHtml(c.teamName)}" style="cursor: pointer;" onclick="Teams.openTeamProfileModal('${c.teamId}')">
                              <td>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                  <strong style="font-size: 1.05rem; min-width: 28px; ${idx === 0 ? 'color: var(--accent-gold);' : ''}">
                                    #${pos}
                                  </strong>
                                  ${Ranking.renderPositionDelta(c.positionDelta)}
                                </div>
                              </td>
                              <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                  <span style="font-size: 1.3rem;">${c.logo}</span>
                                  <div>
                                    <strong style="color: ${c.color}">${Utils.escapeHtml(c.teamName)}</strong>
                                  </div>
                                </div>
                              </td>
                              <td>
                                ${c.drivers.map(d => `<span style="font-size: 0.8rem;">#${d.number} ${d.name}</span>`).join(' • ') || '<span style="color: var(--text-dim);">Sem pilotos</span>'}
                              </td>
                              <td>
                                <strong style="font-size: 1.15rem; font-family: var(--font-mono); color: var(--accent-cyan);">
                                  ${c.points} pts
                                </strong>
                              </td>
                              <td><strong>${c.wins}</strong></td>
                              <td>${c.podiums}</td>
                              <td>${zoneBadge}</td>
                            </tr>
                          `;
                        }).join('')}
                        ${divStandings.length === 0 ? '<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 20px;">Nenhuma equipe nesta divisão.</td></tr>' : ''}
                      </tbody>
                    </table>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  // Renderiza o indicador de variação de posição no campeonato.
  // delta > 0 = subiu posições (verde ▲), delta < 0 = desceu (vermelho ▼), null/0 = sem mudança (—).
  renderPositionDelta(delta) {
    if (delta == null) {
      return `<span style="color: var(--text-dim); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">—</span>`;
    }
    if (delta > 0) {
      return `<span style="color: var(--accent-green); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.3px;">▲${delta}</span>`;
    }
    if (delta < 0) {
      return `<span style="color: var(--accent-red); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.3px;">▼${Math.abs(delta)}</span>`;
    }
    return `<span style="color: var(--text-dim); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">—</span>`;
  },

  setTab(tab) {
    this.activeTab = tab;
    App.navigateTo('ranking');
  },

  setDivision(divId) {
    this.selectedDivisionId = divId;
    App.navigateTo('ranking');
  },

  filter(term) {
    this.searchTerm = term;
    const query = term.trim().toLowerCase();
    document.querySelectorAll('tr[data-search]').forEach(row => {
      row.style.display = !query || row.dataset.search.toLowerCase().includes(query) ? '' : 'none';
    });
  }
};
