/* ==========================================================================
   RACE SIMULATOR - TEAMS CRUD & DIVISIONS MODULE (js/teams.js)
   ========================================================================== */

const Teams = {
  searchTerm: '',
  renderList() {
    const allTeams = Storage.getTeams();
    const query = this.searchTerm.trim().toLowerCase();
    const teams = allTeams.filter(team => !query || team.name.toLowerCase().includes(query));
    const drivers = Storage.getDrivers();
    const divisions = Storage.getDivisions();

    return `
      <div class="glass-panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">🏎️ Gestão de Equipes &amp; Divisões</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
              Gerencie escuderias, cores oficiais, divisões (Série A, B, C...) e contratações.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="Teams.openDivisionManagerModal()">⚙️ Gerenciar Séries &amp; Divisões</button>
            <button class="btn btn-primary" onclick="Teams.openModal()">+ Nova Equipe</button>
          </div>
        </div>

        <input class="form-input" style="margin-top: 16px;" placeholder="Pesquisar equipe..." value="${Utils.escapeHtml(this.searchTerm)}" oninput="Teams.filter(this.value)">

        <div class="grid-auto" style="margin-top: 20px;">
          ${teams.map(team => {
      const teamDrivers = drivers.filter(d => d.teamId === team.id);
      const div = divisions.find(d => d.id === team.divisionId) || divisions[0] || { name: 'Série A', color: '#ffd700', icon: '🏆' };
      return `
              <div class="driver-card" data-search="${Utils.escapeHtml(team.name)}" style="--card-team-color: ${team.color};">
                <div class="driver-header">
                  <div class="driver-avatar" style="font-size: 1.8rem; background: ${team.color}20; border-color: ${team.color};">
                    ${team.logo || '🏎️'}
                  </div>
                  <div class="driver-info">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                      <div class="driver-name">${Utils.escapeHtml(team.name)}</div>
                      <span class="badge" style="background: ${div.color}20; color: ${div.color}; border: 1px solid ${div.color}60; font-weight: 700; font-size: 0.75rem;">
                        ${div.icon || '🏆'} ${Utils.escapeHtml(div.name)}
                      </span>
                    </div>
                    <div class="driver-team-tag" style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: ${team.color}; display: inline-block;"></span>
                      <span style="width: 12px; height: 12px; border-radius: 50%; background: ${team.secondaryColor}; display: inline-block; border: 1px solid #666;"></span>
                      <code>${team.color}</code>
                    </div>
                  </div>
                </div>

                <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: var(--radius-md);">
                  <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
                    Pilotos Titulares (${teamDrivers.length})
                  </div>
                  ${teamDrivers.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${teamDrivers.map(d => `
                        <div style="font-size: 0.85rem; font-weight: 600; display: flex; justify-content: space-between;">
                          <span>#${d.number} ${Utils.escapeHtml(d.name)}</span>
                          <span>${Utils.getCountryFlag(d.nationality)}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : `
                    <div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Nenhum piloto vinculado</div>
                  `}
                </div>

                <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-color);">
                  <button class="btn btn-primary btn-sm" style="flex: 1.2;" onclick="Teams.openTeamProfileModal('${team.id}')">🏎️ Perfil da Equipe</button>
                  <button class="btn btn-secondary btn-sm" onclick="Teams.openModal('${team.id}')">Editar</button>
                  <button class="btn btn-danger btn-sm" onclick="Teams.deleteTeam('${team.id}')">✕</button>
                </div>
              </div>
            `;
    }).join('')}
          ${teams.length === 0 ? '<div style="color: var(--text-muted); padding: 20px;">Nenhuma equipe encontrada.</div>' : ''}
        </div>
      </div>
    `;
  },

  openModal(teamId = null) {
    const teams = Storage.getTeams();
    const divisions = Storage.getDivisions();
    const team = teamId ? teams.find(t => t.id === teamId) : {
      id: '',
      name: '',
      color: '#00e5ff',
      secondaryColor: '#ffffff',
      logo: '🏎️',
      divisionId: divisions[0]?.id || 'div_a'
    };

    const isEdit = !!teamId;
    const modalHtml = `
      <div class="modal-backdrop active" id="team-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${isEdit ? 'Editar Equipe' : 'Criar Nova Equipe'}</h3>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('team-modal')">✕</button>
          </div>
          <form id="team-form" onsubmit="Teams.saveForm(event)">
            <input type="hidden" id="team-id" value="${team.id}">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nome da Equipe</label>
                <input type="text" id="team-name" class="form-input" required value="${Utils.escapeHtml(team.name)}" placeholder="Ex: Scuderia Veloce">
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Logo / Ícone Emoji</label>
                  <input type="text" id="team-logo" class="form-input" value="${Utils.escapeHtml(team.logo || '🏎️')}" placeholder="Ex: 🏎️, ⚡, 🚀, 🐎">
                </div>
                <div class="form-group">
                  <label class="form-label">Divisão / Série Atual</label>
                  <select id="team-division" class="form-select">
                    ${divisions.map(d => `
                      <option value="${d.id}" ${team.divisionId === d.id ? 'selected' : ''}>
                        ${d.icon || '🏆'} ${Utils.escapeHtml(d.name)}
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Cor Primária (HEX)</label>
                  <input type="color" id="team-color" class="form-input" style="height: 44px; padding: 4px;" value="${team.color}">
                </div>
                <div class="form-group">
                  <label class="form-label">Cor Secundária (HEX)</label>
                  <input type="color" id="team-sec-color" class="form-input" style="height: 44px; padding: 4px;" value="${team.secondaryColor}">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal('team-modal')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Equipe</button>
            </div>
          </form>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
  },

  filter(term) {
    this.searchTerm = term;
    const query = term.trim().toLowerCase();
    document.querySelectorAll('.driver-card[data-search]').forEach(card => {
      card.style.display = !query || card.dataset.search.toLowerCase().includes(query) ? '' : 'none';
    });
  },

  saveForm(e) {
    e.preventDefault();
    const id = document.getElementById('team-id').value;
    const name = document.getElementById('team-name').value.trim();
    const logo = document.getElementById('team-logo').value.trim();
    const divisionId = document.getElementById('team-division').value;
    const color = document.getElementById('team-color').value;
    const secondaryColor = document.getElementById('team-sec-color').value;

    let teams = Storage.getTeams();
    if (id) {
      teams = teams.map(t => t.id === id ? { ...t, name, logo, divisionId, color, secondaryColor } : t);
    } else {
      teams.push({
        id: Utils.generateId('team'),
        name,
        logo,
        divisionId,
        color,
        secondaryColor,
        divisionHistory: []
      });
    }

    Storage.saveTeams(teams);
    App.closeModal('team-modal');
    App.navigateTo('teams');
  },

  deleteTeam(id) {
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
      let teams = Storage.getTeams();
      teams = teams.filter(t => t.id !== id);
      Storage.saveTeams(teams);
      App.navigateTo('teams');
    }
  },

  // Gerenciador Modal de Divisões (Série A, B, C, D...)
  openDivisionManagerModal() {
    const divisions = Storage.getDivisions();
    const teams = Storage.getTeams();

    const modalHtml = `
      <div class="modal-backdrop active" id="division-manager-modal">
        <div class="modal-content" style="max-width: 820px; max-height: 90vh; overflow-y: auto;">
          <div class="modal-header">
            <div>
              <h3>⚙️ Gerenciador de Séries &amp; Divisões</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                Adicione divisões (Série A, B, C, D...), defina posições de subida/descida e limite de equipes (padrão: 10).
              </p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('division-manager-modal')">✕</button>
          </div>

          <div class="modal-body" style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Formulário para Criar Nova Divisão -->
            <div class="glass-panel" style="padding: 14px;">
              <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--accent-cyan); margin-bottom: 10px;">
                ➕ Adicionar Nova Série / Divisão
              </h4>
              <form id="new-division-form" onsubmit="Teams.saveNewDivision(event)">
                <div class="grid-3">
                  <div class="form-group">
                    <label class="form-label">Nome da Série</label>
                    <input type="text" id="div-name" class="form-input" required placeholder="Ex: Série D">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Nível / Hierarquia</label>
                    <input type="number" id="div-level" class="form-input" min="1" max="20" value="${divisions.length + 1}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Ícone / Emoji</label>
                    <input type="text" id="div-icon" class="form-input" value="🏆">
                  </div>
                </div>
                <div class="grid-3" style="margin-top: 10px;">
                  <div class="form-group">
                    <label class="form-label">Limite de Equipes</label>
                    <input type="number" id="div-max-teams" class="form-input" min="1" max="50" value="10">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantos Sobem (Acesso)</label>
                    <input type="number" id="div-promote" class="form-input" min="0" max="10" value="2">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantos Descem (Descenso)</label>
                    <input type="number" id="div-relegate" class="form-input" min="0" max="10" value="2">
                  </div>
                </div>
                <div class="form-group" style="margin-top: 10px;">
                  <label class="form-label">Cor de Destaque (HEX)</label>
                  <input type="color" id="div-color" class="form-input" style="height: 38px; padding: 2px;" value="#3b82f6">
                </div>
                <button type="submit" class="btn btn-primary btn-sm" style="margin-top: 12px; width: 100%;">+ Adicionar Divisão</button>
              </form>
            </div>

            <!-- Lista e Regras das Séries Existentes -->
            <div class="glass-panel" style="padding: 14px;">
              <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">
                📋 Divisões Ativas &amp; Edição de Regras de Acesso/Descenso
              </h4>
              <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 12px;">
                Você pode alterar as regras de quantos sobem (Acesso), quantos descem (Descenso) e o limite de equipes a qualquer momento.
              </p>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Série</th>
                      <th>Nível</th>
                      <th>Equipes Alocadas / Limite</th>
                      <th>Sobem (Acesso)</th>
                      <th>Descem (Descenso)</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${divisions.map(div => {
      const divTeams = teams.filter(t => t.divisionId === div.id);
      return `
                        <tr>
                          <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <span style="font-size: 1.2rem;">${div.icon || '🏆'}</span>
                              <input type="text" class="form-input" style="padding: 4px 8px; width: 130px; font-weight: bold; color: ${div.color};" value="${Utils.escapeHtml(div.name)}" onchange="Teams.updateDivisionRule('${div.id}', 'name', this.value)">
                            </div>
                          </td>
                          <td>
                            <input type="number" class="form-input" style="padding: 4px 6px; width: 60px;" min="1" max="20" value="${div.level}" onchange="Teams.updateDivisionRule('${div.id}', 'level', this.value)">
                          </td>
                          <td>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span style="font-size: 0.85rem; font-weight: 600;">${divTeams.length} /</span>
                              <input type="number" class="form-input" style="padding: 4px 6px; width: 60px;" min="1" max="50" value="${div.maxTeams || 10}" onchange="Teams.updateDivisionRule('${div.id}', 'maxTeams', this.value)">
                            </div>
                          </td>
                          <td>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span style="color: var(--accent-green); font-weight: bold;">⬆️ Top</span>
                              <input type="number" class="form-input" style="padding: 4px 6px; width: 60px; color: var(--accent-green); font-weight: bold;" min="0" max="10" value="${div.promoteCount || 0}" onchange="Teams.updateDivisionRule('${div.id}', 'promoteCount', this.value)">
                            </div>
                          </td>
                          <td>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span style="color: var(--accent-red); font-weight: bold;">⬇️ Z-</span>
                              <input type="number" class="form-input" style="padding: 4px 6px; width: 60px; color: var(--accent-red); font-weight: bold;" min="0" max="10" value="${div.relegateCount || 0}" onchange="Teams.updateDivisionRule('${div.id}', 'relegateCount', this.value)">
                            </div>
                          </td>
                          <td>
                            <div style="display: flex; gap: 6px;">
                              <button class="btn btn-secondary btn-sm" title="Editar Detalhes" onclick="Teams.openEditDivisionModal('${div.id}')">✏️</button>
                              <button class="btn btn-danger btn-sm" title="Excluir Série" onclick="Teams.deleteDivision('${div.id}')">✕</button>
                            </div>
                          </td>
                        </tr>
                      `;
    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Botão para Processar Subida / Descida de Temporada -->
            <div class="glass-panel" style="padding: 14px; text-align: center;">
              <h4 style="font-size: 0.9rem; margin-bottom: 6px;">⚡ Processamento de Fim de Temporada</h4>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
                Aplica as regras de Acesso e Descenso nas séries com base na classificação dos Construtores e registra no histórico dos perfis.
              </p>
              <button class="btn btn-primary" style="background: var(--grad-brand);" onclick="Teams.triggerDivisionTransitions()">
                🏆 Processar Acesso &amp; Descenso de Séries
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="App.closeModal('division-manager-modal')">Fechar</button>
          </div>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
  },

  updateDivisionRule(divId, field, value) {
    let divisions = Storage.getDivisions();
    divisions = divisions.map(d => {
      if (d.id === divId) {
        let parsedVal = value;
        if (field === 'promoteCount' || field === 'relegateCount' || field === 'maxTeams' || field === 'level') {
          parsedVal = parseInt(value, 10) || 0;
        }
        return { ...d, [field]: parsedVal };
      }
      return d;
    });
    Storage.saveDivisions(divisions);
  },

  openEditDivisionModal(divId) {
    const divisions = Storage.getDivisions();
    const div = divisions.find(d => d.id === divId);
    if (!div) return;

    const modalHtml = `
      <div class="modal-backdrop active" id="edit-division-modal">
        <div class="modal-content" style="max-width: 550px;">
          <div class="modal-header">
            <h3>✏️ Editar Série: ${Utils.escapeHtml(div.name)}</h3>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('edit-division-modal')">✕</button>
          </div>
          <form id="edit-division-form" onsubmit="Teams.saveEditDivision(event, '${div.id}')">
            <div class="modal-body">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Nome da Série</label>
                  <input type="text" id="edit-div-name" class="form-input" required value="${Utils.escapeHtml(div.name)}">
                </div>
                <div class="form-group">
                  <label class="form-label">Nível / Hierarquia</label>
                  <input type="number" id="edit-div-level" class="form-input" min="1" max="20" value="${div.level}">
                </div>
              </div>
              <div class="grid-2" style="margin-top: 10px;">
                <div class="form-group">
                  <label class="form-label">Ícone / Emoji</label>
                  <input type="text" id="edit-div-icon" class="form-input" value="${Utils.escapeHtml(div.icon || '🏆')}">
                </div>
                <div class="form-group">
                  <label class="form-label">Cor de Destaque</label>
                  <input type="color" id="edit-div-color" class="form-input" style="height: 38px; padding: 2px;" value="${div.color || '#ffd700'}">
                </div>
              </div>
              <div class="grid-3" style="margin-top: 10px;">
                <div class="form-group">
                  <label class="form-label">Limite Equipes</label>
                  <input type="number" id="edit-div-max-teams" class="form-input" min="1" max="50" value="${div.maxTeams || 10}">
                </div>
                <div class="form-group">
                  <label class="form-label">Sobem (Acesso)</label>
                  <input type="number" id="edit-div-promote" class="form-input" min="0" max="10" value="${div.promoteCount || 0}">
                </div>
                <div class="form-group">
                  <label class="form-label">Descem (Descenso)</label>
                  <input type="number" id="edit-div-relegate" class="form-input" min="0" max="10" value="${div.relegateCount || 0}">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal('edit-division-modal')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
  },

  saveEditDivision(e, divId) {
    e.preventDefault();
    const name = document.getElementById('edit-div-name').value.trim();
    const level = parseInt(document.getElementById('edit-div-level').value, 10) || 1;
    const icon = document.getElementById('edit-div-icon').value.trim() || '🏆';
    const color = document.getElementById('edit-div-color').value;
    const maxTeams = parseInt(document.getElementById('edit-div-max-teams').value, 10) || 10;
    const promoteCount = parseInt(document.getElementById('edit-div-promote').value, 10) || 0;
    const relegateCount = parseInt(document.getElementById('edit-div-relegate').value, 10) || 0;

    let divisions = Storage.getDivisions();
    divisions = divisions.map(d => d.id === divId ? { ...d, name, level, icon, color, maxTeams, promoteCount, relegateCount } : d);
    Storage.saveDivisions(divisions);

    App.closeModal('edit-division-modal');
    this.openDivisionManagerModal();
  },

  saveNewDivision(e) {
    e.preventDefault();
    const name = document.getElementById('div-name').value.trim();
    const level = parseInt(document.getElementById('div-level').value, 10);
    const icon = document.getElementById('div-icon').value.trim() || '🏆';
    const maxTeams = parseInt(document.getElementById('div-max-teams').value, 10) || 10;
    const promoteCount = parseInt(document.getElementById('div-promote').value, 10) || 0;
    const relegateCount = parseInt(document.getElementById('div-relegate').value, 10) || 0;
    const color = document.getElementById('div-color').value;

    const divisions = Storage.getDivisions();
    const id = Utils.generateId('div');

    divisions.push({
      id,
      name,
      level,
      icon,
      maxTeams,
      promoteCount,
      relegateCount,
      color
    });

    Storage.saveDivisions(divisions);
    App.closeModal('division-manager-modal');
    this.openDivisionManagerModal();
  },

  deleteDivision(divId) {
    let divisions = Storage.getDivisions();
    if (divisions.length <= 1) {
      alert('A aplicação precisa manter pelo menos 1 divisão ativa!');
      return;
    }
    if (confirm('Tem certeza que deseja excluir esta divisão? As equipes vinculadas serão movidas para a Série Principal.')) {
      divisions = divisions.filter(d => d.id !== divId);
      const fallbackDiv = divisions[0].id;
      const teams = Storage.getTeams();
      teams.forEach(t => {
        if (t.divisionId === divId) t.divisionId = fallbackDiv;
      });
      Storage.saveTeams(teams);
      Storage.saveDivisions(divisions);
      App.closeModal('division-manager-modal');
      this.openDivisionManagerModal();
    }
  },

  triggerDivisionTransitions() {
    if (confirm('Deseja calcular e aplicar a subida e descida de divisão de todas as equipes nesta temporada?')) {
      Storage.processDivisionPromotionsRelegations();
      alert('Acesso e descenso de séries processados com sucesso! Os perfis das equipes foram atualizados.');
      App.closeModal('division-manager-modal');
      App.navigateTo('teams');
    }
  },

  openTeamProfileModal(teamId) {
    this.activeProfileId = teamId;
    this.activeTeamSeasonId = null;
    this.activeTeamProfileTab = 'overview';
    App.navigateTo('team-profile');
  },

  // Controle de aba ativa no perfil de equipe
  activeTeamProfileTab: 'overview',
  activeTeamSeasonId: null,

  setTeamProfileTab(tab) {
    this.activeTeamProfileTab = tab;
    App.navigateTo('team-profile');
  },

  setTeamSeasonTab(seasonId) {
    this.activeTeamSeasonId = seasonId;
    App.navigateTo('team-profile');
  },

  renderProfilePage() {
    const team = Storage.getTeams().find(item => item.id === this.activeProfileId);
    if (!team) return '<div class="glass-panel">Equipe não encontrada.</div>';

    const divisions    = Storage.getDivisions();
    const div          = divisions.find(d => d.id === team.divisionId) || divisions[0] || { name: 'Série A', color: '#ffd700', icon: '🏆', level: 1 };
    const allDrivers   = Storage.getDrivers();
    const drivers      = allDrivers.filter(d => d.teamId === team.id);
    const driverIds    = drivers.map(d => d.id);
    const history      = Storage.getHistory();
    const allDuels     = Storage.getTeamDuels();
    const duels        = allDuels.filter(duel => duel.teamAId === team.id || duel.teamBId === team.id);
    const tracks       = Storage.getTracks();
    const rankedStandings = Storage.getRankedStandings();
    const rankedHistory   = Storage.getRankedHistory();
    const bestTimeTrials  = Storage.getBestTimeTrials();
    const allTimeTrials   = Storage.getTimeTrials();
    const divisionHistory = team.divisionHistory || [];
    const allSeasons      = Storage.getSeasons();

    // ── Atributos médios (usa speed/acceleration/control/braking/consistency reais) ──
    let avgSpeed = 0, avgAccel = 0, avgCtrl = 0, avgBrake = 0, avgCons = 0, avgOvr = 0;
    if (drivers.length > 0) {
      drivers.forEach(d => {
        avgSpeed += d.attributes?.speed        || 75;
        avgAccel += d.attributes?.acceleration || 75;
        avgCtrl  += d.attributes?.control      || 75;
        avgBrake += d.attributes?.braking      ?? 75;
        avgCons  += d.attributes?.consistency  || 75;
      });
      const n = drivers.length;
      avgSpeed = Math.round(avgSpeed / n);
      avgAccel = Math.round(avgAccel / n);
      avgCtrl  = Math.round(avgCtrl  / n);
      avgBrake = Math.round(avgBrake / n);
      avgCons  = Math.round(avgCons  / n);
      avgOvr   = Math.round((avgSpeed + avgAccel + avgCtrl + avgBrake + avgCons) / 5);
    }

    // ── Estatísticas globais da equipe (todos os tempos) ──
    let totalTeamGPs = 0, totalTeamWins = 0, totalTeamPodiums = 0, totalTeamPoles = 0;
    let totalTeamFastestLaps = 0, totalTeamPoints = 0;
    let bestPosition = 999, worstPosition = 0;
    let bestTrackName = '-', worstTrackName = '-', bestDate = '-', worstDate = '-';

    const gpRaces = history.filter(h =>
      !h.isTimeTrial && !h.gpId?.startsWith('tt_') && !h.gpName?.startsWith('Time-Trial:')
    );

    // pontos acumulados por GP (para sparkline)
    const gpPointsHistory = [];

    gpRaces.forEach(race => {
      const teamResults = (race.results || []).filter(r => driverIds.includes(r.driverId));
      if (teamResults.length === 0) return;
      totalTeamGPs++;
      let gpPoints = 0;
      teamResults.forEach(r => {
        if (r.position === 1)  totalTeamWins++;
        if (r.position <= 3)   totalTeamPodiums++;
        if (r.gridPos === 1)   totalTeamPoles++;
        const pointsValue = typeof r.points === 'string' ? parseFloat(r.points.replace(/[^\d.-]/g, '')) || 0 : (r.points || 0);
        gpPoints += pointsValue;
        totalTeamPoints += pointsValue;
        if (race.fastestLap?.driverId && driverIds.includes(race.fastestLap.driverId)) totalTeamFastestLaps++;
        if (r.position < bestPosition) {
          bestPosition  = r.position;
          bestTrackName = race.gpName || race.trackName || 'GP';
          bestDate      = race.date   || '';
        }
        if (r.position > worstPosition) {
          worstPosition  = r.position;
          worstTrackName = race.gpName || race.trackName || 'GP';
          worstDate      = race.date   || '';
        }
      });
      gpPointsHistory.push({ name: race.gpName || 'GP', points: gpPoints, date: race.date });
    });

    if (bestPosition  === 999) bestPosition  = null;
    if (worstPosition === 0)   worstPosition = null;

    // ── Posição na temporada atual (construtores) ──
    const constructorsStandings = Storage.getConstructorsStandings(team.divisionId);
    const constructorIdx = constructorsStandings.findIndex(c => c.teamId === team.id);
    const currentRankPos  = constructorIdx !== -1 ? constructorIdx + 1 : '-';
    const currentPoints   = constructorIdx !== -1 ? constructorsStandings[constructorIdx].points : 0;

    // ── Temporadas anteriores desta equipe (via divisionHistory + allSeasons) ──
    // Também monta temporadas passadas a partir do histórico de corridas por ano
    const pastSeasons = this.buildTeamSeasonHistory(team.id, driverIds, allSeasons, history, divisionHistory, div);

    // ── Aba ativa ──
    const tab = this.activeTeamProfileTab || 'overview';

    // ── Renderização das abas ──
    const tabs = [
      { id: 'overview',   label: '📊 Visão Geral'     },
      { id: 'achievements', label: '🏆 Conquistas'   },
      { id: 'seasons',    label: '📅 Temporadas'       },
      { id: 'tournaments', label: '🏆 Torneios'         },
      { id: 'rivals',     label: '⚔️ Rivais & H2H'     },
      { id: 'timetrial',  label: '⏱️ Time-Trial'        },
      { id: 'ranked',     label: '🎖️ Ranqueado'         },
      { id: 'history',    label: '🏁 Histórico de GPs'  },
      { id: 'roster',     label: '👥 Elenco'            },
    ];

    return `
      <div class="profile-page" style="--profile-color: ${team.color};">

        <!-- ══ HERO ══ -->
        <div class="profile-hero" style="border-left: 5px solid ${team.color};">
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('teams')">← Equipes</button>
            <button class="btn btn-primary btn-sm" onclick="Teams.openModal('${team.id}')">✏️ Editar</button>
          </div>
          <div class="profile-identity">
            <div class="team-profile-logo"
              style="border-color: ${team.color}; background: linear-gradient(135deg, ${team.color}30, ${team.secondaryColor || '#000'}20);">
              ${team.logo || '🏎️'}
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <h1 style="font-size: 1.9rem; font-weight: 900; margin: 0;
                  background: linear-gradient(90deg, #fff 0%, ${team.color} 100%);
                  -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                  ${Utils.escapeHtml(team.name)}
                </h1>
                <span class="badge" style="background: ${div.color}22; color: ${div.color}; border: 1px solid ${div.color}80; font-weight: 800;">
                  ${div.icon || '🏆'} ${Utils.escapeHtml(div.name)}
                </span>
                <span class="badge" style="background: rgba(0,229,255,0.12); color: var(--accent-cyan); border: 1px solid rgba(0,229,255,0.35); font-weight: 800;">
                  ⚡ OVR ${avgOvr}
                </span>
                ${currentRankPos !== '-' ? `
                  <span class="badge" style="background: ${div.color}18; color: ${div.color}; border: 1px solid ${div.color}50; font-weight: 800;">
                    #${currentRankPos}º ${Utils.escapeHtml(div.name)}
                  </span>
                ` : ''}
              </div>
              <div style="display: flex; gap: 18px; margin-top: 8px; flex-wrap: wrap; font-size: 0.82rem; color: var(--text-muted);">
                <span>👥 ${drivers.length} piloto${drivers.length !== 1 ? 's' : ''}</span>
                <span>🏁 ${totalTeamGPs} GPs</span>
                <span>🏆 ${totalTeamWins} vitórias</span>
                <span>🥉 ${totalTeamPodiums} pódios</span>
                <span>⚡ ${totalTeamPoles} poles</span>
                <span style="display: inline-flex; align-items: center; gap: 5px;">
                  Cores:
                  <span style="width: 12px; height: 12px; border-radius: 50%; background: ${team.color}; border: 1px solid #fff4; display: inline-block;"></span>
                  <span style="width: 12px; height: 12px; border-radius: 50%; background: ${team.secondaryColor || '#fff'}; border: 1px solid #fff4; display: inline-block;"></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ ABAS ══ -->
        <div class="profile-tabs-bar">
          ${tabs.map(t => `
            <button class="profile-tab ${t.id === tab ? 'active' : ''}"
              onclick="Teams.setTeamProfileTab('${t.id}')">
              ${t.label}
            </button>
          `).join('')}
        </div>

        <!-- ══ CONTEÚDO DAS ABAS ══ -->
        <div class="profile-tab-content">
          ${tab === 'overview'  ? this.renderTabOverview(team, div, drivers, driverIds, avgSpeed, avgAccel, avgCtrl, avgBrake, avgCons, avgOvr, currentRankPos, currentPoints, totalTeamGPs, totalTeamWins, totalTeamPodiums, totalTeamPoles, totalTeamFastestLaps, totalTeamPoints, bestPosition, worstPosition, bestTrackName, worstTrackName, bestDate, worstDate, gpPointsHistory, rankedStandings) : ''}
          ${tab === 'achievements' ? (typeof Achievements !== 'undefined' ? Achievements.renderProfileSection('team', team.id) : '') : ''}
          ${tab === 'seasons'   ? this.renderTabSeasons(team, div, pastSeasons, divisionHistory, allSeasons, driverIds, history) : ''}
          ${tab === 'tournaments' ? (typeof Tournament !== 'undefined' ? Tournament.renderProfileHistory('team', team.id) : '') : ''}
          ${tab === 'rivals'    ? this.renderTabRivals(team, duels, allDrivers, history, driverIds) : ''}
          ${tab === 'timetrial' ? this.renderTabTimeTrial(drivers, bestTimeTrials, allTimeTrials, tracks) : ''}
          ${tab === 'ranked'    ? this.renderTabRanked(drivers, rankedStandings, rankedHistory) : ''}
          ${tab === 'history'   ? this.renderTabHistory(team.id, drivers, driverIds, history) : ''}
          ${tab === 'roster'    ? this.renderTabRoster(drivers, rankedStandings, bestTimeTrials) : ''}
        </div>

      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  // ABA 1 — VISÃO GERAL
  // ══════════════════════════════════════════════════════════════════════
  renderTabOverview(team, div, drivers, driverIds, avgSpeed, avgAccel, avgCtrl, avgBrake, avgCons, avgOvr,
    currentRankPos, currentPoints, totalTeamGPs, totalTeamWins, totalTeamPodiums, totalTeamPoles,
    totalTeamFastestLaps, totalTeamPoints, bestPosition, worstPosition, bestTrackName, worstTrackName,
    bestDate, worstDate, gpPointsHistory, rankedStandings) {

    const winRate   = totalTeamGPs > 0 ? ((totalTeamWins   / totalTeamGPs) * 100).toFixed(1) : '0.0';
    const podRate   = totalTeamGPs > 0 ? ((totalTeamPodiums / totalTeamGPs) * 100).toFixed(1) : '0.0';

    return `
      <!-- Métricas rápidas: 6 cards -->
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;">
        <div class="profile-stat-box" style="border-top: 3px solid ${div.color};">
          <span class="lbl">Posição atual</span>
          <span class="val" style="color: ${div.color};">${currentRankPos !== '-' ? '#' + currentRankPos : '–'}</span>
          <small style="color: var(--text-muted); font-size: 0.72rem;">${currentPoints} pts • ${div.name}</small>
        </div>
        <div class="profile-stat-box" style="border-top: 3px solid var(--accent-gold);">
          <span class="lbl">Vitórias</span>
          <span class="val" style="color: var(--accent-gold);">${totalTeamWins}</span>
          <small style="color: var(--text-muted); font-size: 0.72rem;">${winRate}% de aproveitamento</small>
        </div>
        <div class="profile-stat-box" style="border-top: 3px solid var(--accent-cyan);">
          <span class="lbl">Pódios</span>
          <span class="val" style="color: var(--accent-cyan);">${totalTeamPodiums}</span>
          <small style="color: var(--text-muted); font-size: 0.72rem;">${podRate}% das corridas</small>
        </div>
        <div class="profile-stat-box" style="border-top: 3px solid var(--accent-green);">
          <span class="lbl">Poles</span>
          <span class="val" style="color: var(--accent-green);">${totalTeamPoles}</span>
          <small style="color: var(--text-muted); font-size: 0.72rem;">${totalTeamGPs} GPs totais</small>
        </div>
        <div class="profile-stat-box" style="border-top: 3px solid var(--accent-purple);">
          <span class="lbl">Pontos totais</span>
          <span class="val" style="color: var(--accent-purple); font-size: 1.4rem;">${totalTeamPoints}</span>
          <small style="color: var(--text-muted); font-size: 0.72rem;">${totalTeamFastestLaps} V.Rápidas</small>
        </div>
        <div class="profile-stat-box" style="border-top: 3px solid var(--accent-red);">
          <span class="lbl">OVR Geral</span>
          <span class="val" style="color: var(--accent-red);">${avgOvr}</span>
          <small style="color: var(--text-muted); font-size: 0.72rem;">${drivers.length} pilotos titulares</small>
        </div>
      </div>

      <div class="profile-grid">
        <!-- Melhor / Pior resultado -->
        <section class="profile-panel">
          <div class="profile-panel-header"><h3>🎯 Melhores &amp; Piores Resultados</h3></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
            <div class="profile-stat-box" style="border: 1px solid rgba(255,183,3,0.3);">
              <span class="lbl">🥇 Melhor chegada</span>
              <span class="val" style="color: var(--accent-gold);">${bestPosition !== null ? 'P' + bestPosition : '–'}</span>
              <small style="color: var(--text-muted); font-size: 0.7rem; display: block; margin-top: 2px;">${Utils.escapeHtml(bestTrackName)}</small>
              <small style="color: var(--text-dim); font-size: 0.68rem;">${bestDate}</small>
            </div>
            <div class="profile-stat-box" style="border: 1px solid rgba(255,51,102,0.3);">
              <span class="lbl">🔻 Pior chegada</span>
              <span class="val" style="color: var(--accent-red);">${worstPosition !== null ? 'P' + worstPosition : '–'}</span>
              <small style="color: var(--text-muted); font-size: 0.7rem; display: block; margin-top: 2px;">${Utils.escapeHtml(worstTrackName)}</small>
              <small style="color: var(--text-dim); font-size: 0.68rem;">${worstDate}</small>
            </div>
          </div>

          <!-- Gráfico de barra de sequência de resultados -->
          ${this.renderResultsBar(driverIds, Storage.getHistory())}
        </section>

        <!-- Radar de atributos -->
        <section class="profile-panel">
          <div class="profile-panel-header"><h3>⚙️ Radar de Atributos — OVR ${avgOvr}</h3></div>
          <div class="radar-chart-wrapper">
            ${this.renderRadarChart(
              [avgSpeed, avgAccel, avgCtrl, avgBrake, avgCons],
              ['Velocidade', 'Aceleração', 'Controle', 'Frenagem', 'Constância'],
              team.color
            )}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
            ${[
              { label: '⚡ Velocidade',    val: avgSpeed, color: 'var(--accent-cyan)'   },
              { label: '🚀 Aceleração',    val: avgAccel, color: 'var(--accent-gold)'   },
              { label: '🎯 Controle',      val: avgCtrl,  color: 'var(--accent-green)'  },
              { label: '🛑 Frenagem',      val: avgBrake, color: 'var(--accent-red)'    },
              { label: '🛡️ Constância',    val: avgCons,  color: 'var(--accent-purple)' },
            ].map(a => `
              <div class="attr-bar-row">
                <div class="attr-bar-label-row">
                  <span style="font-size: 0.78rem;">${a.label}</span>
                  <span style="color: ${a.color}; font-family: var(--font-mono);">${a.val}</span>
                </div>
                <div class="attr-bar-bg">
                  <div class="attr-bar-fill" style="width: ${a.val}%; background: ${a.color};"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Sparkline de pontos por GP -->
        <section class="profile-panel profile-panel-wide">
          <div class="profile-panel-header">
            <h3>📈 Evolução de Pontos por GP (Temporada Atual)</h3>
            <span class="badge" style="background: var(--bg-tertiary);">${gpPointsHistory.length} GPs disputados</span>
          </div>
          ${this.renderSparklinePoints(gpPointsHistory, team.color)}
        </section>

        <!-- Pilotos — cards rápidos -->
        <section class="profile-panel profile-panel-wide">
          <div class="profile-panel-header"><h3>👥 Elenco Ativo</h3>
            <button class="btn btn-secondary btn-sm" onclick="Teams.setTeamProfileTab('roster')">Ver elenco completo</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; margin-top: 14px;">
            ${drivers.map(d => {
              const rs = rankedStandings.find(s => s.driverId === d.id) || { rating: 1200, tier: 'Bronze', wins: 0, matches: 0 };
              const tierInfo = (typeof ModeRanked !== 'undefined' && ModeRanked.getTierInfo) ? ModeRanked.getTierInfo(rs.rating) : { color: '#cd7f32', icon: '🥉', name: rs.tier };
              return `
                <button onclick="Pilots.openProfileModal('${d.id}')"
                  style="background: rgba(0,0,0,0.25); border: 1px solid ${d.color || 'var(--border-color)'}40;
                    border-radius: var(--radius-md); padding: 12px 14px; text-align: left; width: 100%;
                    display: flex; align-items: center; gap: 12px; transition: background 0.15s; cursor: pointer;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: ${d.color || 'var(--accent-cyan)'}25;
                    border: 2px solid ${d.color || 'var(--accent-cyan)'}; display: flex; align-items: center;
                    justify-content: center; font-weight: 800; font-size: 0.9rem; color: ${d.color || 'var(--accent-cyan)'}; flex-shrink: 0;">
                    #${d.number}
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 800; font-size: 0.88rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${Utils.getCountryFlag(d.nationality)} ${Utils.escapeHtml(d.name)}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">${d.code || 'DRV'}</div>
                  </div>
                  <div style="text-align: right; flex-shrink: 0;">
                    <span class="badge" style="background: ${tierInfo.color}20; color: ${tierInfo.color}; border: 1px solid ${tierInfo.color}60; font-size: 0.68rem;">
                      ${tierInfo.icon} ${tierInfo.name}
                    </span>
                    <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 3px;">${rs.rating} MMR</div>
                  </div>
                </button>
              `;
            }).join('') || `<div style="color: var(--text-dim); font-size: 0.85rem; padding: 16px;">Nenhum piloto vinculado.</div>`}
          </div>
        </section>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  // ABA 2 — TEMPORADAS
  // ══════════════════════════════════════════════════════════════════════
  renderTabSeasons(team, div, pastSeasons, divisionHistory, allSeasons, driverIds, history) {
    const seasonStats = this.buildTeamSeasonHistory(team.id, allSeasons, history, divisionHistory);
    if (seasonStats.length === 0) {
      return `<section class="profile-panel profile-panel-wide">
        <div class="profile-panel-header"><h3>📅 Temporadas da Equipe</h3></div>
        <div style="padding:20px;text-align:center;color:var(--text-dim);">Nenhuma temporada registrada para esta equipe.</div>
      </section>`;
    }

    const selected = seasonStats.find(season => season.id === this.activeTeamSeasonId) || seasonStats[0];
    const movementLabel = selected.status === 'promoted'
      ? `⬆️ Promovida para ${Utils.escapeHtml(selected.nextDivisionName || 'série superior')}`
      : selected.status === 'relegated'
        ? `⬇️ Rebaixada para ${Utils.escapeHtml(selected.nextDivisionName || 'série inferior')}`
        : selected.status === 'stayed'
          ? `🛡️ Permaneceu na ${Utils.escapeHtml(selected.divisionName || div.name)}`
          : '';

    return `
      <section class="profile-panel profile-panel-wide">
        <div class="profile-panel-header">
          <div>
            <h3>📅 Temporadas da Equipe</h3>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-top:3px;">Classificação e resultados registrados em cada campeonato.</p>
          </div>
          <span class="badge" style="background:var(--bg-tertiary);">${seasonStats.length} temporadas</span>
        </div>
        <div class="profile-tabs" style="margin-top:12px;">
          ${seasonStats.map(season => `
            <button class="profile-tab-btn ${season.id === selected.id ? 'active' : ''}"
              onclick="Teams.setTeamSeasonTab('${season.id}')">
              ${Utils.escapeHtml(String(season.year))} · ${Utils.escapeHtml(season.divisionName || season.name)}
            </button>
          `).join('')}
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:16px;">
          <strong>${Utils.escapeHtml(selected.name)}</strong>
          <span class="badge" style="background:${selected.active ? 'rgba(0,245,155,0.15)' : 'var(--bg-tertiary)'};color:${selected.active ? 'var(--accent-green)' : 'var(--text-muted)'};">
            ${selected.active ? 'Em andamento' : 'Encerrada'}
          </span>
          ${movementLabel ? `<span class="badge" style="background:${selected.status === 'promoted' ? 'rgba(0,245,155,0.15)' : selected.status === 'relegated' ? 'rgba(255,51,102,0.15)' : 'var(--bg-tertiary)'};color:${selected.status === 'promoted' ? 'var(--accent-green)' : selected.status === 'relegated' ? 'var(--accent-red)' : 'var(--text-muted)'};">${movementLabel}</span>` : ''}
          ${selected.position ? `<span class="badge">${selected.position}º lugar</span>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-top:12px;">
          ${[
            { label: 'GPs', value: selected.gps, color: 'var(--accent-cyan)' },
            { label: 'Pontos', value: selected.points, color: 'var(--accent-purple)' },
            { label: 'Vitórias', value: selected.wins, color: 'var(--accent-gold)' },
            { label: 'Pódios', value: selected.podiums, color: 'var(--accent-cyan)' },
            { label: 'Poles', value: selected.poles, color: 'var(--accent-green)' },
            { label: 'Voltas rápidas', value: selected.fastestLaps, color: 'var(--accent-purple)' }
          ].map(item => `<div class="profile-stat-box"><span class="lbl">${item.label}</span><span class="val" style="color:${item.color};">${item.value}</span></div>`).join('')}
        </div>
        <div class="table-container" style="margin-top:14px;">
          <table class="data-table">
            <thead><tr><th>Data</th><th>Grande Prêmio</th><th>Pista</th><th>Resultado da equipe</th><th>Resultados dos pilotos</th><th>Pontos</th><th>Volta rápida</th></tr></thead>
            <tbody>
              ${selected.races.map(item => `
                <tr>
                  <td>${Utils.escapeHtml(item.date || '—')}</td>
                  <td><strong>${Utils.escapeHtml(item.gpName)}</strong></td>
                  <td>${Utils.escapeHtml(item.trackName || '—')}</td>
                  <td>${item.bestPosition ? `P${item.bestPosition}` : '—'}</td>
                  <td>${item.driverResults.map(result => `
                    <div style="white-space:nowrap;">
                      ${Utils.escapeHtml(result.name)}: P${result.position} · ${Utils.escapeHtml(String(result.points))} pts
                      ${result.gridPos ? `· Grid P${result.gridPos}` : ''}
                      ${result.bestLapMs ? `· ${Utils.formatTime(result.bestLapMs)}` : ''}
                    </div>
                  `).join('') || '—'}</td>
                  <td>${item.points}</td>
                  <td>${item.fastestLap ? Utils.escapeHtml(item.fastestLap) : '—'}</td>
                </tr>
              `).join('')}
              ${selected.races.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:18px;">Nenhum GP disputado nesta temporada ainda.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  // ABA 3 — RIVAIS & H2H
  // ══════════════════════════════════════════════════════════════════════
  renderTabRivals(team, duels, allDrivers, history, driverIds) {
    const allTeams = Storage.getTeams();

    // ── H2H via Mode Team Duel ──
    const duelRivals = this.buildDuelRivals(team.id, duels);

    // ── H2H via histórico de corridas de campeonato ──
    const gpRivals = this.buildGpRivals(team.id, driverIds, history, allTeams, allDrivers);

    const hasData = duelRivals.length > 0 || gpRivals.length > 0;

    return `
      <div style="display: flex; flex-direction: column; gap: 20px;">

        <!-- Confrontos diretos via Modo Equipe x Equipe -->
        <section class="profile-panel profile-panel-wide">
          <div class="profile-panel-header">
            <h3>⚔️ Confrontos Diretos — Modo Equipe x Equipe</h3>
            <span class="badge" style="background: rgba(255,51,102,0.15); color: var(--accent-red);">${duels.length} duelos registrados</span>
          </div>
          ${duelRivals.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
              ${duelRivals.map(rival => {
                const winPct  = rival.matches > 0 ? (rival.wins / rival.matches) * 100 : 0;
                const losePct = 100 - winPct;
                return `
                  <div class="rival-card">
                    <div class="rival-card-header">
                      <div class="rival-vs-strip">
                        <span style="font-weight: 900; font-size: 0.95rem; color: #fff;">${Utils.escapeHtml(team.name)}</span>
                        <span style="color: var(--accent-red); font-weight: 900; font-size: 0.8rem;">VS</span>
                        <span style="font-weight: 900; font-size: 0.95rem; color: var(--text-muted);">${Utils.escapeHtml(rival.name)}</span>
                      </div>
                      <span class="badge" style="background: rgba(0,229,255,0.12); color: var(--accent-cyan);">${rival.matches} duelos</span>
                    </div>

                    <!-- Barra de aproveitamento -->
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 5px;">
                        <span style="color: var(--accent-green); font-weight: 700;">${rival.wins}V (${winPct.toFixed(0)}%)</span>
                        <span style="color: var(--accent-red); font-weight: 700;">${rival.losses}D (${losePct.toFixed(0)}%)</span>
                      </div>
                      <div class="rival-win-bar-wrap">
                        <div class="rival-win-bar-a" style="width: ${winPct}%;"></div>
                        <div class="rival-win-bar-b" style="width: ${losePct}%;"></div>
                      </div>
                    </div>

                    <div class="rival-matchup-grid">
                      <div class="rival-stat-cell">
                        <span class="rsc-val" style="color: var(--accent-green);">${rival.wins}</span>
                        <span class="rsc-lbl">Vitórias</span>
                      </div>
                      <div class="rival-stat-cell">
                        <span class="rsc-val">${rival.draws || 0}</span>
                        <span class="rsc-lbl">Empates</span>
                      </div>
                      <div class="rival-stat-cell">
                        <span class="rsc-val" style="color: var(--accent-red);">${rival.losses}</span>
                        <span class="rsc-lbl">Derrotas</span>
                      </div>
                      <div class="rival-stat-cell">
                        <span class="rsc-val" style="color: var(--accent-cyan);">${(winPct).toFixed(0)}%</span>
                        <span class="rsc-lbl">Aproveitamento</span>
                      </div>
                      <div class="rival-stat-cell">
                        <span class="rsc-val" style="font-size: 0.85rem; font-family: var(--font-mono);">${rival.lastScore || '—'}</span>
                        <span class="rsc-lbl">Último placar</span>
                      </div>
                      <div class="rival-stat-cell">
                        <span class="rsc-val" style="font-size: 0.85rem;">${rival.lastDate || '—'}</span>
                        <span class="rsc-lbl">Último duelo</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="color: var(--text-dim); text-align: center; padding: 24px; font-size: 0.85rem;">
              Nenhum duelo direto Equipe x Equipe registrado para esta equipe.
              <div style="margin-top: 8px;"><button class="btn btn-secondary btn-sm" onclick="App.navigateTo('mode-team-duel')">➔ Ir para Equipe x Equipe</button></div>
            </div>
          `}
        </section>

        <!-- H2H em corridas de campeonato -->
        <section class="profile-panel profile-panel-wide">
          <div class="profile-panel-header">
            <h3>🏁 Confrontos nas Corridas de Campeonato (H2H em GPs)</h3>
            <span class="badge" style="background: var(--bg-tertiary);">${gpRivals.length} rivais encontrados</span>
          </div>
          ${gpRivals.length > 0 ? `
            <div class="table-container" style="margin-top: 14px;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Equipe Rival</th>
                    <th>GPs em Conjunto</th>
                    <th>Melhor classificação da equipe</th>
                    <th>Qual. ficou à frente</th>
                    <th>Pontos marcados</th>
                    <th>Vitórias diretas</th>
                  </tr>
                </thead>
                <tbody>
                  ${gpRivals.map(r => `
                    <tr>
                      <td><strong style="color: ${r.rivalColor || '#fff'};">${Utils.escapeHtml(r.rivalName)}</strong></td>
                      <td><strong style="font-family: var(--font-mono);">${r.sharedRaces}</strong></td>
                      <td><span style="font-family: var(--font-mono);">P${r.teamBestPos || '–'}</span></td>
                      <td>
                        <span style="font-weight: 800; color: ${r.myAhead >= r.sharedRaces / 2 ? 'var(--accent-green)' : 'var(--accent-red)'};">
                          ${r.myAhead}× à frente
                        </span>
                      </td>
                      <td><strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${r.myPoints} pts</strong></td>
                      <td><strong style="color: var(--accent-gold);">${r.myWins} 🏆</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div style="color: var(--text-dim); text-align: center; padding: 24px; font-size: 0.85rem;">
              Nenhuma corrida de campeonato disputada ainda para comparar equipes.
            </div>
          `}
        </section>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  // ABA 4 — TIME-TRIAL
  // ══════════════════════════════════════════════════════════════════════
  renderTabTimeTrial(drivers, bestTimeTrials, allTimeTrials, tracks) {
    const driverIds = drivers.map(d => d.id);

    // Para cada pista, pega todos os tempos (ranking global) e marca os da equipe
    const trackGroups = tracks.map(track => {
      // Ranking global da pista
      const allTrackTTs = bestTimeTrials
        .filter(tt => tt.trackId === track.id)
        .sort((a, b) => a.bestLapMs - b.bestLapMs);

      if (allTrackTTs.length === 0) return null;

      // Registros dos pilotos desta equipe nesta pista
      const myDriverTimes = allTrackTTs
        .map((tt, idx) => ({ ...tt, globalPos: idx + 1 }))
        .filter(tt => driverIds.includes(tt.driverId));

      if (myDriverTimes.length === 0) return null;

      const leaderTime = allTrackTTs[0]?.bestLapMs || 0;

      return { track, allTrackTTs, myDriverTimes, leaderTime };
    }).filter(Boolean);

    if (trackGroups.length === 0) {
      return `
        <div class="glass-panel" style="text-align: center; padding: 32px; color: var(--text-dim);">
          <div style="font-size: 2rem; margin-bottom: 10px;">⏱️</div>
          Nenhum tempo de Time-Trial registrado para os pilotos desta equipe.
          <div style="margin-top: 12px;">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('mode-time-trial')">➔ Ir para Time-Trial</button>
          </div>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="glass-panel" style="padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 1rem; font-weight: 800;">⏱️ Time-Trial — Tempos por Pista</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Posição global calculada entre todos os pilotos do simulador para cada circuito.
            </div>
          </div>
          <span class="badge" style="background: rgba(0,229,255,0.15); color: var(--accent-cyan);">${trackGroups.length} pista${trackGroups.length !== 1 ? 's' : ''} com registro</span>
        </div>

        ${trackGroups.map(({ track, allTrackTTs, myDriverTimes, leaderTime }) => `
          <div class="tt-track-group">
            <div class="tt-track-header">
              <div class="tt-track-name">
                🏁 ${Utils.getCountryFlag(track.country)} ${Utils.escapeHtml(track.name)}
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 400;">${track.lengthKm} km</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.75rem; color: var(--text-dim);">${allTrackTTs.length} piloto${allTrackTTs.length !== 1 ? 's' : ''} no ranking</span>
                <span class="badge" style="background: rgba(168,85,247,0.15); color: var(--accent-purple); font-size: 0.7rem;">Recorde: ${Utils.formatTime(leaderTime)} (${Utils.escapeHtml(allTrackTTs[0]?.driverName || '?')})</span>
              </div>
            </div>

            ${myDriverTimes.map(tt => {
              const driver = drivers.find(d => d.id === tt.driverId);
              const delta = tt.bestLapMs - leaderTime;
              const posClass = tt.globalPos === 1 ? 'tt-pos-1' : tt.globalPos === 2 ? 'tt-pos-2' : tt.globalPos === 3 ? 'tt-pos-3' : 'tt-pos-other';
              const avgTime = allTimeTrials
                .filter(t => t.driverId === tt.driverId && t.trackId === track.id)
                .reduce((best, t) => (!best || t.bestLapMs < best) ? t.bestLapMs : best, null);

              return `
                <div class="tt-driver-row">
                  <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                    <div class="tt-position-badge ${posClass}">${tt.globalPos}º</div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 800; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
                        ${Utils.getCountryFlag(driver?.nationality || '')}
                        ${Utils.escapeHtml(tt.driverName)}
                        ${tt.globalPos === 1 ? '<span style="color: var(--accent-gold); font-size: 0.75rem;">👑 RECORDE GLOBAL</span>' : ''}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--text-dim);">${Utils.escapeHtml(tt.teamName || '')} • ${tt.date || ''}</div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 16px; flex-shrink: 0;">
                    <div style="text-align: right;">
                      <div class="tt-time-mono">${Utils.formatTime(tt.bestLapMs)}</div>
                      <div class="tt-delta-mono">${tt.globalPos === 1 ? '<span style="color:var(--accent-gold);">LÍDER</span>' : '+' + Utils.formatTime(delta)}</div>
                    </div>
                    ${tt.totalLaps ? `
                      <div style="text-align: right; font-size: 0.72rem; color: var(--text-dim);">
                        <div>${tt.totalLaps} voltas</div>
                        <div>${tt.avgLapMs ? Utils.formatTime(tt.avgLapMs) + ' méd.' : ''}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  // ABA 5 — RANQUEADO
  // ══════════════════════════════════════════════════════════════════════
  renderTabRanked(drivers, rankedStandings, rankedHistory) {
    const allRankedSorted = [...rankedStandings].sort((a, b) => b.rating - a.rating);

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">

        <!-- Visão geral dos pilotos ranqueados -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${drivers.map(driver => {
            const rs = rankedStandings.find(s => s.driverId === driver.id) || { rating: 1200, tier: 'Bronze', wins: 0, podiums: 0, matches: 0, peakRating: 1200 };
            const tierInfo = (typeof ModeRanked !== 'undefined' && ModeRanked.getTierInfo) ? ModeRanked.getTierInfo(rs.rating) : { color: '#cd7f32', icon: '🥉', name: rs.tier || 'Bronze' };
            const globalPos = allRankedSorted.findIndex(s => s.driverId === driver.id) + 1;
            const winRate   = rs.matches > 0 ? ((rs.wins / rs.matches) * 100).toFixed(1) : '0.0';
            const podRate   = rs.matches > 0 ? ((rs.podiums / rs.matches) * 100).toFixed(1) : '0.0';

            // Histórico ranqueado deste piloto
            const driverRankedHistory = rankedHistory.filter(h =>
              h.results?.some ? h.results.some(r => r.driverId === driver.id) : false
            ).slice(0, 8);

            // Histórico global para mostrar corridas do piloto
            const allHistory = Storage.getHistory();
            const rankedRaces = allHistory.filter(h => h.isRanked && (h.results || []).some(r => r.driverId === driver.id)).slice(0, 8);

            return `
              <div class="ranked-driver-block">
                <!-- Cabeçalho do piloto -->
                <div class="ranked-driver-header" onclick="Pilots.openProfileModal('${driver.id}')">
                  <div class="ranked-driver-info">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: ${driver.color || 'var(--accent-cyan)'}25;
                      border: 2px solid ${driver.color || 'var(--accent-cyan)'}; display: flex; align-items: center;
                      justify-content: center; font-size: 0.8rem; font-weight: 800; color: ${driver.color || 'var(--accent-cyan)'};">
                      #${driver.number}
                    </div>
                    <div>
                      <div style="font-weight: 800; font-size: 0.9rem;">${Utils.getCountryFlag(driver.nationality)} ${Utils.escapeHtml(driver.name)}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${driver.code || 'DRV'} • #${globalPos}º global</div>
                    </div>
                    <span class="badge" style="background: ${tierInfo.color}20; color: ${tierInfo.color}; border: 1px solid ${tierInfo.color}60; font-weight: 800;">
                      ${tierInfo.icon} ${tierInfo.name}
                    </span>
                  </div>
                  <div class="ranked-mmr-display">
                    <div class="ranked-mmr-value">${rs.rating} <span style="font-size: 0.75rem; color: var(--text-dim);">MMR</span></div>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">Pico: ${rs.peakRating || rs.rating} MMR</div>
                  </div>
                </div>

                <!-- Stats em grid -->
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; border-bottom: 1px solid var(--border-color);">
                  ${[
                    { lbl: 'Corridas',     val: rs.matches || 0, color: '#fff'                    },
                    { lbl: 'Vitórias',     val: rs.wins    || 0, color: 'var(--accent-gold)'      },
                    { lbl: 'Pódios',       val: rs.podiums || 0, color: 'var(--accent-cyan)'      },
                    { lbl: 'Win Rate',     val: winRate + '%',   color: parseFloat(winRate) >= 50 ? 'var(--accent-green)' : 'var(--text-main)' },
                    { lbl: 'Pódio Rate',   val: podRate + '%',   color: parseFloat(podRate) >= 33 ? 'var(--accent-cyan)' : 'var(--text-dim)'  },
                  ].map(s => `
                    <div style="padding: 10px 14px; text-align: center; border-right: 1px solid var(--border-color);">
                      <div style="font-size: 1.1rem; font-weight: 900; font-family: var(--font-mono); color: ${s.color};">${s.val}</div>
                      <div style="font-size: 0.68rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.3px;">${s.lbl}</div>
                    </div>
                  `).join('')}
                </div>

                <!-- Histórico recente de corridas ranqueadas deste piloto -->
                ${rankedRaces.length > 0 ? `
                  <div style="overflow-x: auto;">
                    <table class="data-table ranked-history-table" style="font-size: 0.8rem;">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Circuito</th>
                          <th>Posição</th>
                          <th>Delta MMR</th>
                          <th>Melhor volta</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rankedRaces.map(race => {
                          const res = race.results.find(r => r.driverId === driver.id);
                          if (!res) return '';
                          const delta = res.mmrDelta ?? 0;
                          return `
                            <tr>
                              <td style="color: var(--text-muted);">${race.date}</td>
                              <td><strong>${Utils.escapeHtml(race.trackName || race.gpName || '?')}</strong></td>
                              <td>
                                <span style="font-weight: 900; color: ${res.position === 1 ? 'var(--accent-gold)' : res.position <= 3 ? 'var(--accent-cyan)' : '#fff'};">
                                  P${res.position}
                                </span>
                              </td>
                              <td>
                                <span class="badge" style="background: ${delta >= 0 ? 'rgba(0,245,155,0.15)' : 'rgba(255,51,102,0.15)'}; color: ${delta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; border: none; font-weight: 800; font-family: var(--font-mono);">
                                  ${delta >= 0 ? '+' : ''}${delta} MMR
                                </span>
                              </td>
                              <td style="font-family: var(--font-mono); color: var(--accent-purple);">${res.bestLapMs ? Utils.formatTime(res.bestLapMs) : '—'}</td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                ` : `
                  <div style="padding: 14px 16px; color: var(--text-dim); font-size: 0.82rem; text-align: center;">
                    Nenhuma corrida ranqueada registrada para este piloto ainda.
                    <button class="btn btn-secondary btn-sm" style="margin-left: 10px;" onclick="App.navigateTo('mode-ranked')">➔ Jogar Ranqueado</button>
                  </div>
                `}
              </div>
            `;
          }).join('') || `
            <div class="glass-panel" style="text-align: center; padding: 32px; color: var(--text-dim);">
              Nenhum piloto vinculado a esta equipe.
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  // ABA 6 — HISTÓRICO DE GPs
  // ══════════════════════════════════════════════════════════════════════
  renderTabHistory(teamId, drivers, driverIds, history) {
    const gpRaces = history.filter(h =>
      !h.isTimeTrial && !h.gpId?.startsWith('tt_') && !h.gpName?.startsWith('Time-Trial:') &&
      (h.results || []).some(r => driverIds.includes(r.driverId))
    );

    if (gpRaces.length === 0) {
      return `
        <div class="glass-panel" style="text-align: center; padding: 32px; color: var(--text-dim);">
          Nenhuma corrida registrada para esta equipe.
        </div>
      `;
    }

    return `
      <section class="profile-panel profile-panel-wide">
        <div class="profile-panel-header">
          <h3>🏁 Histórico Completo de Corridas</h3>
          <span class="badge" style="background: var(--bg-tertiary);">${gpRaces.length} corridas</span>
        </div>
        <div class="table-container" style="margin-top: 14px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>GP / Corrida</th>
                <th>Modo</th>
                <th>Resultados dos Pilotos</th>
                <th>Pontos</th>
                <th>Melhor Volta</th>
              </tr>
            </thead>
            <tbody>
              ${gpRaces.map(race => {
                const teamResults = race.results.filter(r => driverIds.includes(r.driverId));
                const totalPoints = teamResults.reduce((s, r) => {
                  const pointsValue = typeof r.points === 'string' ? parseFloat(r.points.replace(/[^\d.-]/g, '')) || 0 : (r.points || 0);
                  return s + pointsValue;
                }, 0);
                const resultsHtml = teamResults.map(r => {
                  const d = drivers.find(drv => drv.id === r.driverId);
                  const pos = r.position;
                  const color = pos === 1 ? 'var(--accent-gold)' : pos <= 3 ? 'var(--accent-cyan)' : '#fff';
                  return `<span style="font-weight: 800; color: ${color};">P${pos}</span> ${d ? d.name.split(' ')[0] : 'Piloto'}`;
                }).join(' · ');

                const modeBadge = race.isRanked
                  ? `<span class="badge" style="background: rgba(139,92,246,0.2); color: var(--accent-purple); font-size: 0.68rem;">Ranqueado</span>`
                  : race.isTeamDuel
                  ? `<span class="badge" style="background: rgba(255,51,102,0.15); color: var(--accent-red); font-size: 0.68rem;">Duelo</span>`
                  : `<span class="badge" style="background: rgba(255,183,3,0.15); color: var(--accent-gold); font-size: 0.68rem;">Campeonato</span>`;

                const bestLapRes = teamResults.reduce((best, r) => {
                  if (!r.bestLapMs) return best;
                  if (!best || r.bestLapMs < best.bestLapMs) return r;
                  return best;
                }, null);

                return `
                  <tr>
                    <td style="color: var(--text-muted); font-size: 0.8rem;">${race.date}</td>
                    <td><strong>${Utils.escapeHtml(race.gpName || race.trackName || 'GP')}</strong>
                      <div style="font-size: 0.72rem; color: var(--text-dim);">${Utils.escapeHtml(race.trackName || '')} • ${race.totalLaps || 0} voltas</div>
                    </td>
                    <td>${modeBadge}</td>
                    <td style="font-size: 0.82rem;">${resultsHtml}</td>
                    <td><strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${totalPoints > 0 ? '+' + totalPoints : totalPoints} pts</strong></td>
                    <td style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--accent-purple);">${bestLapRes ? Utils.formatTime(bestLapRes.bestLapMs) : '—'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  // ABA 7 — ELENCO
  // ══════════════════════════════════════════════════════════════════════
  renderTabRoster(drivers, rankedStandings, bestTimeTrials) {
    if (drivers.length === 0) {
      return `
        <div class="glass-panel" style="text-align: center; padding: 32px; color: var(--text-dim);">
          Nenhum piloto vinculado a esta equipe.
        </div>
      `;
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
        ${drivers.map(driver => {
          const rs = rankedStandings.find(s => s.driverId === driver.id) || { rating: 1200, tier: 'Bronze', wins: 0, matches: 0, peakRating: 1200 };
          const tierInfo = (typeof ModeRanked !== 'undefined' && ModeRanked.getTierInfo) ? ModeRanked.getTierInfo(rs.rating) : { color: '#cd7f32', icon: '🥉', name: rs.tier };
          const driverBestTT = bestTimeTrials
            .filter(tt => tt.driverId === driver.id)
            .sort((a, b) => a.bestLapMs - b.bestLapMs)[0];
          const ovr = Math.round(((driver.attributes?.speed || 80) + (driver.attributes?.acceleration || 80) + (driver.attributes?.control || 80) + (driver.attributes?.braking ?? 75) + (driver.attributes?.consistency || 80)) / 5);
          const winRate = driver.stats?.races > 0 ? ((driver.stats.wins / driver.stats.races) * 100).toFixed(1) : '0.0';

          return `
            <div class="profile-panel" style="border-top: 3px solid ${driver.color || 'var(--accent-cyan)'};">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                <div style="width: 52px; height: 52px; border-radius: 50%; background: ${driver.color || 'var(--accent-cyan)'}20;
                  border: 2px solid ${driver.color || 'var(--accent-cyan)'}; display: flex; align-items: center;
                  justify-content: center; font-weight: 800; font-size: 1.2rem; color: ${driver.color || 'var(--accent-cyan)'}; flex-shrink: 0;">
                  ${driver.avatar ? `<img src="${driver.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : `#${driver.number}`}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 900; font-size: 1rem; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    ${Utils.getCountryFlag(driver.nationality)} ${Utils.escapeHtml(driver.name)}
                    <span class="badge" style="background: ${driver.color || 'var(--accent-cyan)'}22; color: ${driver.color || 'var(--accent-cyan)'}; border: 1px solid ${driver.color || 'var(--accent-cyan)'}50; font-size: 0.68rem;">${driver.code || 'DRV'}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 3px;">
                    <span class="badge" style="background: ${tierInfo.color}18; color: ${tierInfo.color}; border: 1px solid ${tierInfo.color}50; font-size: 0.68rem;">${tierInfo.icon} ${tierInfo.name}</span>
                    <span style="font-size: 0.72rem; color: var(--text-dim);">OVR ${ovr}</span>
                  </div>
                </div>
                <button onclick="Pilots.openProfileModal('${driver.id}')" class="btn btn-secondary btn-sm">Ver perfil</button>
              </div>

              <!-- Mini stats -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 14px;">
                ${[
                  { lbl: 'Corridas', val: driver.stats?.races    || 0,         color: '#fff'                },
                  { lbl: 'Vitórias', val: driver.stats?.wins     || 0,         color: 'var(--accent-gold)'  },
                  { lbl: 'Pódios',   val: driver.stats?.podiums  || 0,         color: 'var(--accent-cyan)'  },
                  { lbl: 'Win%',     val: winRate + '%',                        color: parseFloat(winRate) >= 50 ? 'var(--accent-green)' : 'var(--text-main)' },
                ].map(s => `
                  <div style="background: rgba(0,0,0,0.25); padding: 7px 6px; border-radius: var(--radius-sm); text-align: center; border: 1px solid var(--border-color);">
                    <div style="font-size: 1rem; font-weight: 900; font-family: var(--font-mono); color: ${s.color};">${s.val}</div>
                    <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase;">${s.lbl}</div>
                  </div>
                `).join('')}
              </div>

              <!-- Atributos mini-bar -->
              <div style="display: flex; flex-direction: column; gap: 5px;">
                ${[
                  { label: '⚡ Vel',     val: driver.attributes?.speed        || 80, color: 'var(--accent-cyan)'   },
                  { label: '🚀 Acel',    val: driver.attributes?.acceleration || 80, color: 'var(--accent-gold)'   },
                  { label: '🎯 Ctrl',    val: driver.attributes?.control      || 80, color: 'var(--accent-green)'  },
                  { label: '🛑 Fren',    val: driver.attributes?.braking      ?? 75, color: 'var(--accent-red)'    },
                  { label: '🛡️ Cons',    val: driver.attributes?.consistency  || 80, color: 'var(--accent-purple)' },
                ].map(a => `
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 0.68rem; color: var(--text-dim); width: 42px; flex-shrink: 0;">${a.label}</span>
                    <div class="attr-bar-bg" style="flex: 1;">
                      <div class="attr-bar-fill" style="width: ${a.val}%; background: ${a.color};"></div>
                    </div>
                    <span style="font-size: 0.72rem; font-family: var(--font-mono); color: ${a.color}; width: 24px; text-align: right; flex-shrink: 0;">${a.val}</span>
                  </div>
                `).join('')}
              </div>

              ${driverBestTT ? `
                <div style="margin-top: 10px; padding: 8px 10px; background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.25); border-radius: var(--radius-sm);">
                  <div style="font-size: 0.68rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 2px;">⏱️ Melhor TT registrado</div>
                  <div style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-purple);">${Utils.formatTime(driverBestTT.bestLapMs)}</div>
                  <div style="font-size: 0.7rem; color: var(--text-dim);">${Utils.escapeHtml(driverBestTT.trackName || '?')}</div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════════
  // HELPERS — Gráficos e dados
  // ══════════════════════════════════════════════════════════════════════

  /** Radar SVG pentagonal */
  renderRadarChart(values, labels, color) {
    const size   = 180;
    const cx     = size / 2;
    const cy     = size / 2;
    const radius = 70;
    const n      = values.length;
    const maxVal = 100;

    // Pontos da grade (5 níveis)
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

    const angleFor = i => (Math.PI * 2 * i / n) - Math.PI / 2;

    const ptForVal = (i, v) => {
      const r = (v / maxVal) * radius;
      const a = angleFor(i);
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };

    // Grade
    let gridHtml = '';
    gridLevels.forEach(lvl => {
      const pts = Array.from({ length: n }, (_, i) => {
        const r = lvl * radius;
        const a = angleFor(i);
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(' ');
      gridHtml += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
    });

    // Eixos
    let axesHtml = '';
    for (let i = 0; i < n; i++) {
      const pt = ptForVal(i, 100);
      axesHtml += `<line x1="${cx}" y1="${cy}" x2="${pt.x}" y2="${pt.y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
    }

    // Polígono de valores
    const dataPts = values.map((v, i) => ptForVal(i, v));
    const dataPolyPts = dataPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const hex = color || '#00e5ff';

    // Labels
    let labelsHtml = '';
    for (let i = 0; i < n; i++) {
      const pt = ptForVal(i, 118);
      labelsHtml += `<text x="${pt.x.toFixed(1)}" y="${pt.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
        fill="rgba(255,255,255,0.65)" font-size="9" font-family="inherit" font-weight="700">${labels[i]}</text>`;
      // Valor no vértice
      const vpt = ptForVal(i, values[i] + 10);
      labelsHtml += `<text x="${vpt.x.toFixed(1)}" y="${vpt.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
        fill="${hex}" font-size="9.5" font-family="monospace" font-weight="900">${values[i]}</text>`;
    }

    // Pontos nos vértices
    let dotsHtml = dataPts.map(p =>
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${hex}" stroke="rgba(0,0,0,0.5)" stroke-width="1"/>`
    ).join('');

    return `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="overflow: visible;">
        ${gridHtml}
        ${axesHtml}
        <polygon points="${dataPolyPts}" fill="${hex}22" stroke="${hex}" stroke-width="2" stroke-linejoin="round"/>
        ${dotsHtml}
        ${labelsHtml}
      </svg>
    `;
  },

  /** Barra visual com os últimos N resultados (P1/P2/P3/...) */
  renderResultsBar(driverIds, history) {
    const gpRaces = history
      .filter(h => !h.isTimeTrial && !h.gpId?.startsWith('tt_') && !h.gpName?.startsWith('Time-Trial:') &&
        (h.results || []).some(r => driverIds.includes(r.driverId)))
      .slice(0, 15);

    if (gpRaces.length === 0) {
      return `<div style="color: var(--text-dim); font-size: 0.78rem; text-align: center; padding: 14px 0;">Sem resultados para exibir.</div>`;
    }

    return `
      <div style="margin-top: 14px;">
        <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 7px;">
          Últimos ${gpRaces.length} resultados
        </div>
        <div style="display: flex; gap: 4px; align-items: flex-end; height: 48px;">
          ${gpRaces.map(race => {
            const teamRes = race.results.filter(r => driverIds.includes(r.driverId));
            const best = teamRes.reduce((b, r) => (!b || r.position < b.position) ? r : b, null);
            if (!best) return '';
            const pos   = best.position;
            const total = race.results.length;
            const barH  = Math.max(8, Math.round(((total - pos + 1) / total) * 44));
            const barC  = pos === 1 ? 'var(--accent-gold)' : pos <= 3 ? 'var(--accent-cyan)' : pos <= 6 ? 'var(--accent-green)' : 'rgba(255,255,255,0.2)';
            const title = `P${pos} — ${race.gpName || 'GP'} (${race.date || ''})`;
            return `
              <div title="${Utils.escapeHtml(title)}" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: default;">
                <div style="width: 100%; max-width: 20px; height: ${barH}px; background: ${barC}; border-radius: 2px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'"></div>
                <div style="font-size: 0.6rem; color: var(--text-dim); font-family: var(--font-mono);">P${pos}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /** Sparkline de pontos acumulados por GP */
  renderSparklinePoints(gpPointsHistory, color) {
    if (gpPointsHistory.length === 0) {
      return `
        <div style="color: var(--text-dim); text-align: center; padding: 24px; font-size: 0.85rem;">
          Nenhum GP disputado ainda. Participe de corridas para ver a evolução de pontos aqui.
        </div>
      `;
    }

    // Pontos cumulativos
    let cumulative = 0;
    const cumData = gpPointsHistory.map(g => {
      cumulative += g.points;
      return { ...g, cumulative };
    });

    const W = Math.max(400, cumData.length * 48);
    const H = 100;
    const pad = { top: 12, right: 16, bottom: 24, left: 36 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;
    const maxCum = Math.max(...cumData.map(d => d.cumulative), 1);

    const xFor  = i => pad.left + (i / Math.max(cumData.length - 1, 1)) * innerW;
    const yFor  = v => pad.top + innerH - (v / maxCum) * innerH;

    const polyline = cumData.map((d, i) => `${xFor(i).toFixed(1)},${yFor(d.cumulative).toFixed(1)}`).join(' ');
    const areaPath = `M ${xFor(0).toFixed(1)},${(pad.top + innerH).toFixed(1)} ` +
      cumData.map((d, i) => `L ${xFor(i).toFixed(1)},${yFor(d.cumulative).toFixed(1)}`).join(' ') +
      ` L ${xFor(cumData.length - 1).toFixed(1)},${(pad.top + innerH).toFixed(1)} Z`;

    // Y-axis labels (3 levels)
    const yLabels = [0, Math.round(maxCum / 2), maxCum].map(v => ({
      v,
      y: yFor(v)
    }));

    const hex = color || '#00e5ff';

    return `
      <div class="sparkline-container">
        <div class="sparkline-title">Pontos acumulados ao longo da temporada</div>
        <div class="sparkline-svg-wrap">
          <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display: block; min-width: ${W}px;">
            <!-- Grade horizontal -->
            ${yLabels.map(l => `
              <line x1="${pad.left}" y1="${l.y.toFixed(1)}" x2="${W - pad.right}" y2="${l.y.toFixed(1)}"
                stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="4,3"/>
              <text x="${(pad.left - 4).toFixed(1)}" y="${l.y.toFixed(1)}" text-anchor="end" dominant-baseline="middle"
                fill="rgba(255,255,255,0.3)" font-size="8" font-family="monospace">${l.v}</text>
            `).join('')}

            <!-- Área sob a linha -->
            <defs>
              <linearGradient id="sparkGrad_${this.activeProfileId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${hex}" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="${hex}" stop-opacity="0.02"/>
              </linearGradient>
            </defs>
            <path d="${areaPath}" fill="url(#sparkGrad_${this.activeProfileId})"/>

            <!-- Linha -->
            <polyline points="${polyline}" fill="none" stroke="${hex}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>

            <!-- Pontos e rótulos de GP -->
            ${cumData.map((d, i) => `
              <circle cx="${xFor(i).toFixed(1)}" cy="${yFor(d.cumulative).toFixed(1)}" r="3.5"
                fill="${d.points > 0 ? hex : 'rgba(255,255,255,0.15)'}"
                stroke="rgba(0,0,0,0.4)" stroke-width="1">
                <title>GP ${i+1}: ${Utils.escapeHtml(d.name)} | +${d.points} pts | Total: ${d.cumulative} pts</title>
              </circle>
              <text x="${xFor(i).toFixed(1)}" y="${(H - 4).toFixed(1)}" text-anchor="middle"
                fill="rgba(255,255,255,0.35)" font-size="7.5" font-family="inherit">GP${i+1}</text>
            `).join('')}
          </svg>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 6px;">
          <span>Total acumulado: <strong style="color: ${hex}; font-family: var(--font-mono);">${cumulative} pts</strong></span>
          <span>${cumData.length} GPs disputados</span>
        </div>
      </div>
    `;
  },

  /** Constrói histórico de estatísticas por temporada a partir do RACE_HISTORY */
  buildSeasonStatsFromHistory(driverIds, allSeasons, history) {
    // Agrupa corridas de campeonato por ano
    const byYear = new Map();

    const gpRaces = history.filter(h =>
      !h.isTimeTrial && !h.isRanked && !h.isTeamDuel &&
      !h.gpId?.startsWith('tt_') && !h.gpName?.startsWith('Time-Trial:') &&
      !h.gpId?.startsWith('casual_') && !h.gpId?.startsWith('ranked_') && !h.gpId?.startsWith('duel_') &&
      (h.results || []).some(r => driverIds.includes(r.driverId))
    );

    gpRaces.forEach(race => {
      // Infere o ano a partir da data ou da temporada
      let year = race.year || (race.date ? parseInt(race.date.split('/').pop()) : null) || 2026;
      const season = allSeasons.find(s => s.races?.some(gp => gp.id === race.gpId));
      const seasonName = season ? season.name : `Temporada ${year}`;

      if (!byYear.has(seasonName)) {
        byYear.set(seasonName, { seasonName, year, gps: 0, points: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0 });
      }
      const st = byYear.get(seasonName);
      st.gps++;

      (race.results || []).filter(r => driverIds.includes(r.driverId)).forEach(r => {
        const pointsValue = typeof r.points === 'string' ? parseFloat(r.points.replace(/[^\d.-]/g, '')) || 0 : (r.points || 0);
        st.points += pointsValue;
        if (r.position === 1) st.wins++;
        if (r.position <= 3) st.podiums++;
        if (r.gridPos === 1) st.poles++;
      });
      if (race.fastestLap?.driverId && driverIds.includes(race.fastestLap.driverId)) {
        st.fastestLaps++;
      }
    });

    return Array.from(byYear.values()).sort((a, b) => b.year - a.year);
  },

  buildTeamSeasonHistory(teamId, allSeasons, history, divisionHistory = []) {
    const teams = Storage.getTeams();
    const drivers = Storage.getDrivers();
    const currentTeam = teams.find(team => team.id === teamId);

    return allSeasons.map(season => {
      const snapshot = season.teamSnapshots?.find(item => item.teamId === teamId);
      const currentDivisionMembership = season.status === 'active' && currentTeam?.divisionId === season.divisionId;
      const memberIds = snapshot?.driverIds || drivers.filter(driver => driver.teamId === teamId).map(driver => driver.id);
      const seasonRaces = (season.races || []).map(gp => {
        const race = history.find(item => item.gpId === gp.id);
        const results = (race?.results || []).filter(result =>
          result.teamId === teamId || (!result.teamId && memberIds.includes(result.driverId))
        );
        const points = results.reduce((sum, result) => {
          const value = result.points;
          return sum + (typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) || 0 : value || 0);
        }, 0);
        const fastestLap = race?.fastestLap && results.some(result => result.driverId === race.fastestLap.driverId)
          ? race.fastestLap
          : null;

        return {
          gpName: gp.name,
          trackName: race?.trackName || Storage.getTracks().find(track => track.id === gp.trackId)?.name || '',
          date: race?.date || '',
          played: results.length > 0,
          points,
          bestPosition: results.length ? Math.min(...results.map(result => Number(result.position)).filter(Number.isFinite)) : null,
          podiums: results.filter(result => result.position <= 3).length,
          poles: results.filter(result => result.gridPos === 1).length,
          driverResults: results.map(result => ({
            name: drivers.find(driver => driver.id === result.driverId)?.name || result.driverName || 'Piloto',
            position: result.position,
            points: result.points || 0,
            gridPos: result.gridPos || null,
            bestLapMs: result.bestLapMs || null
          })),
          fastestLap: fastestLap?.timeMs ? Utils.formatTime(fastestLap.timeMs) : ''
        };
      });
      const playedRaces = seasonRaces.filter(race => race.played);
      const allResults = playedRaces;
      const driverStandings = (season.standings || []).filter(standing => memberIds.includes(standing.driverId));
      const historyEntry = divisionHistory.find(entry =>
        entry.seasonId === season.id || entry.seasonName === `${season.name} (${season.year})`
      );
      const currentPosition = season.status === 'active'
        ? Storage.getConstructorsStandings(season.divisionId).findIndex(standing => standing.teamId === teamId) + 1
        : null;
      const eventStats = {
        points: allResults.reduce((sum, race) => sum + race.points, 0),
        wins: playedRaces.reduce((sum, race) => sum + (race.bestPosition === 1 ? 1 : 0), 0),
        podiums: playedRaces.reduce((sum, race) => sum + race.podiums, 0),
        poles: playedRaces.reduce((sum, race) => sum + race.poles, 0)
      };
      const pointsFromStandings = driverStandings.reduce((sum, standing) => sum + (standing.points || 0), 0);
      const winsFromStandings = driverStandings.reduce((sum, standing) => sum + (standing.wins || 0), 0);
      const podiumsFromStandings = driverStandings.reduce((sum, standing) => sum + (standing.podiums || 0), 0);
      const polesFromStandings = driverStandings.reduce((sum, standing) => sum + (standing.poles || 0), 0);

      return {
        id: season.id,
        name: season.name,
        year: season.year,
        divisionName: snapshot?.divisionName || historyEntry?.divisionName || season.divisionName || 'Série',
        active: season.status === 'active',
        gps: playedRaces.length,
        points: playedRaces.length ? eventStats.points : (snapshot?.points ?? pointsFromStandings),
        wins: playedRaces.length ? eventStats.wins : (snapshot?.wins ?? winsFromStandings),
        podiums: playedRaces.length ? eventStats.podiums : (snapshot?.podiums ?? podiumsFromStandings),
        poles: playedRaces.length ? eventStats.poles : (snapshot?.poles ?? polesFromStandings),
        fastestLaps: playedRaces.filter(race => race.fastestLap).length || snapshot?.fastestLaps || 0,
        position: snapshot?.position || historyEntry?.position || currentPosition,
        status: snapshot?.status || historyEntry?.status || 'stayed',
        nextDivisionName: snapshot?.nextDivisionName || historyEntry?.nextDivisionName || '',
        races: seasonRaces,
        involved: Boolean(snapshot) || playedRaces.length > 0 || currentDivisionMembership
      };
    }).filter(season => season.involved).sort((a, b) => (b.year || 0) - (a.year || 0));
  },

  /** Rivals a partir de duelos Equipe x Equipe */
  buildDuelRivals(teamId, duels) {
    const grouped = new Map();
    duels.forEach(duel => {
      const isA      = duel.teamAId === teamId;
      const rivalId  = isA ? duel.teamBId   : duel.teamAId;
      const rivalName = isA ? duel.teamBName : duel.teamAName;
      const myPts    = isA ? duel.teamAPoints : duel.teamBPoints;
      const theirPts = isA ? duel.teamBPoints : duel.teamAPoints;

      const current  = grouped.get(rivalId) || { name: rivalName, matches: 0, wins: 0, losses: 0, draws: 0, lastScore: '', lastDate: '' };
      current.matches++;
      if (duel.winnerTeamId === teamId) current.wins++;
      else if (duel.winnerTeamId)       current.losses++;
      else                              current.draws++;
      current.lastScore = `${myPts} × ${theirPts}`;
      current.lastDate  = duel.date || '';
      grouped.set(rivalId, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.matches - a.matches);
  },

  /** Rivals baseados no histórico de corridas de campeonato */
  buildGpRivals(teamId, driverIds, history, allTeams, allDrivers) {
    const rivalMap = new Map();

    const gpRaces = history.filter(h =>
      !h.isTimeTrial && !h.gpId?.startsWith('tt_') && !h.gpName?.startsWith('Time-Trial:') &&
      (h.results || []).some(r => driverIds.includes(r.driverId))
    );

    gpRaces.forEach(race => {
      const teamRes   = (race.results || []).filter(r => driverIds.includes(r.driverId));
      const otherRes  = (race.results || []).filter(r => !driverIds.includes(r.driverId));
      const myBestPos = teamRes.reduce((b, r) => Math.min(b, r.position), 999);
      const myPoints  = teamRes.reduce((s, r) => {
        const pointsValue = typeof r.points === 'string' ? parseFloat(r.points.replace(/[^\d.-]/g, '')) || 0 : (r.points || 0);
        return s + pointsValue;
      }, 0);
      const myWon     = myBestPos === 1;

      // Coleta todas as equipes rivais nesta corrida
      const rivalTeamIds = new Set(otherRes.map(r => r.teamId).filter(Boolean));

      rivalTeamIds.forEach(rivalTeamId => {
        if (rivalTeamId === teamId) return;
        const rivalTeam   = allTeams.find(t => t.id === rivalTeamId);
        if (!rivalTeam) return;
        const rivalRes    = otherRes.filter(r => r.teamId === rivalTeamId);
        const rivalBestPos = rivalRes.reduce((b, r) => Math.min(b, r.position), 999);

        const key = rivalTeamId;
        const st  = rivalMap.get(key) || { rivalId: key, rivalName: rivalTeam.name, rivalColor: rivalTeam.color, sharedRaces: 0, myAhead: 0, myPoints: 0, myWins: 0, teamBestPos: 999 };
        st.sharedRaces++;
        st.myPoints += myPoints;
        if (myWon) st.myWins++;
        if (myBestPos < rivalBestPos) st.myAhead++;
        if (myBestPos < st.teamBestPos) st.teamBestPos = myBestPos;
        rivalMap.set(key, st);
      });
    });

    return Array.from(rivalMap.values()).sort((a, b) => b.sharedRaces - a.sharedRaces);
  },

  renderTeamRivals(teamId, duels) {
    const grouped = new Map();
    duels.forEach(duel => {
      const isTeamA = duel.teamAId === teamId;
      const rivalId = isTeamA ? duel.teamBId : duel.teamAId;
      const rivalName = isTeamA ? duel.teamBName : duel.teamAName;
      const myPoints = isTeamA ? duel.teamAPoints : duel.teamBPoints;
      const rivalPoints = isTeamA ? duel.teamBPoints : duel.teamAPoints;

      const current = grouped.get(rivalId) || { name: rivalName, matches: 0, wins: 0, losses: 0, lastScore: '' };
      current.matches += 1;
      if (duel.winnerTeamId === teamId) {
        current.wins += 1;
      } else if (duel.winnerTeamId) {
        current.losses += 1;
      }
      current.lastScore = `${myPoints} x ${rivalPoints}`;
      grouped.set(rivalId, current);
    });

    const rows = Array.from(grouped.values()).sort((a, b) => b.matches - a.matches);
    if (rows.length === 0) return '';

    return rows.map(rival => {
      const winRate = Math.round((rival.wins / rival.matches) * 100);
      return `
        <tr>
          <td><strong style="color: #fff;">${Utils.escapeHtml(rival.name)}</strong></td>
          <td><strong style="font-family: var(--font-mono);">${rival.matches} duelos</strong></td>
          <td><strong style="color: var(--accent-green); font-family: var(--font-mono);">${rival.wins}</strong></td>
          <td><strong style="color: var(--accent-red); font-family: var(--font-mono);">${rival.losses}</strong></td>
          <td><span class="badge" style="background: rgba(0, 229, 255, 0.15); color: var(--accent-cyan); font-weight: bold;">${winRate}%</span></td>
          <td><strong style="font-family: var(--font-mono); color: var(--text-muted);">${rival.lastScore}</strong></td>
        </tr>
      `;
    }).join('');
  },

  renderTeamTimeTrials(drivers, timeTrials, tracks) {
    // Esta função é mantida para compatibilidade legada (usada por views antigas).
    // O novo perfil de equipe usa renderTabTimeTrial() diretamente.
    const driverIds = drivers.map(d => d.id);
    const teamTimes = [];

    tracks.forEach(track => {
      const trackTTs = timeTrials.filter(tt => tt.trackId === track.id);
      // Ordena pelo campo correto: bestLapMs (ms), não lapTime
      trackTTs.sort((a, b) => (a.bestLapMs || a.lapTime || 0) - (b.bestLapMs || b.lapTime || 0));

      trackTTs.forEach((tt, globalIdx) => {
        if (driverIds.includes(tt.driverId)) {
          const driver = drivers.find(d => d.id === tt.driverId);
          const lapMs  = tt.bestLapMs || tt.lapTime || 0;
          teamTimes.push({
            trackName:          track.name,
            driverName:         driver ? driver.name : 'Piloto',
            driverNationality:  driver ? driver.nationality : 'BR',
            lapTimeFormatted:   lapMs ? Utils.formatTime(lapMs) : '--:--.---',
            globalPos:          globalIdx + 1
          });
        }
      });
    });

    if (teamTimes.length === 0) {
      return `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-dim); padding: 16px;">
            Nenhum tempo no Time-Trial gravado para os pilotos desta equipe.
          </td>
        </tr>
      `;
    }

    return teamTimes.map(tt => {
      let badgeClass = 'pos-badge-other';
      if      (tt.globalPos === 1) badgeClass = 'pos-badge-1st';
      else if (tt.globalPos === 2) badgeClass = 'pos-badge-2nd';
      else if (tt.globalPos === 3) badgeClass = 'pos-badge-3rd';

      return `
        <tr>
          <td><strong>🏁 ${Utils.escapeHtml(tt.trackName)}</strong></td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              ${Utils.getCountryFlag(tt.driverNationality)}
              <span>${Utils.escapeHtml(tt.driverName)}</span>
            </div>
          </td>
          <td>
            <strong style="font-family: var(--font-mono); color: var(--accent-cyan); font-size: 1rem;">
              ${tt.lapTimeFormatted}
            </strong>
          </td>
          <td><span class="pos-badge ${badgeClass}">P${tt.globalPos}</span></td>
        </tr>
      `;
    }).join('');
  },

  renderTeamActivity(teamId, drivers, history) {
    const driverIds = drivers.map(driver => driver.id);
    const rows = history.filter(race => !race.isTimeTrial && !race.gpId?.startsWith('tt_') && !race.gpName?.startsWith('Time-Trial:') && (race.results || []).some(result => driverIds.includes(result.driverId))).slice(0, 12).map(race => {
      const teamRes = race.results.filter(result => driverIds.includes(result.driverId));
      const resultsText = teamRes.map(r => {
        const d = drivers.find(drv => drv.id === r.driverId);
        const name = d ? d.name.split(' ')[0] : 'Piloto';
        return `P${r.position} (${name})`;
      }).join(' · ');

      return `
        <tr>
          <td>${race.date}</td>
          <td><strong>${Utils.escapeHtml(race.gpName)}</strong></td>
          <td><strong style="color: var(--accent-gold); font-family: var(--font-mono);">${resultsText}</strong></td>
        </tr>
      `;
    }).join('');

    return `<div class="table-container"><table class="data-table"><thead><tr><th>Data</th><th>Corrida</th><th>Resultados dos Pilotos</th></tr></thead><tbody>${rows || '<tr><td colspan="3" style="text-align: center; color: var(--text-dim); padding: 16px;">Nenhuma atividade recente registrada em corridas.</td></tr>'}</tbody></table></div>`;
  }
};

