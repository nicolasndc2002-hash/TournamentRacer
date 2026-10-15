/* ==========================================================================
   RACE SIMULATOR - CASUAL RACE MODE (js/modeCasual.js)
   ========================================================================== */

const ModeCasual = {
  selectedTrackId: null,
  selectedLaps: 5,
  selectedDriverIds: null,
  selectedTeamIds: null,
  driverSearch: '',
  teamFilter: 'all',

  render() {
    const tracks = Storage.getTracks();
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    if (!this.selectedTrackId && tracks.length > 0) this.selectedTrackId = tracks[0].id;
    if (!this.selectedTeamIds) this.selectedTeamIds = teams.map(team => team.id);
    if (!this.selectedDriverIds) this.selectedDriverIds = drivers.map(driver => driver.id);
    const track = tracks.find(t => t.id === this.selectedTrackId) || tracks[0];
    const visibleDrivers = drivers.filter(driver => {
      const matchesName = `${driver.name} ${driver.code} ${driver.number}`.toLowerCase().includes(this.driverSearch.trim().toLowerCase());
      return matchesName && (this.teamFilter === 'all' || driver.teamId === this.teamFilter);
    });

    return `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 900px; margin: 0 auto;">
        <div class="glass-panel" style="border-left: 4px solid var(--accent-green);">
          <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('modes-hub')">⬅ Todos os Modos</button>
          <span class="badge" style="background: rgba(0, 245, 155, 0.15); color: var(--accent-green); font-weight: 700; margin-left: 8px;">MODO 5</span>
          <h2 style="font-size: 1.7rem; margin-top: 12px;">🏎️ Casual — Corrida Rápida</h2>
          <p style="color: var(--text-muted); margin-top: 8px;">Escolha uma pista, defina o número de voltas e largue sem compromisso. Todos os pilotos participam em uma ordem aleatória.</p>
        </div>

        <div class="glass-panel">
          <div class="form-group">
            <label class="form-label">Circuito</label>
            <select class="form-select" onchange="ModeCasual.setTrack(this.value)">
              ${tracks.map(t => `<option value="${t.id}" ${t.id === track?.id ? 'selected' : ''}>${Utils.getCountryFlagText(t.country)} ${Utils.escapeHtml(t.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-top: 18px;">
            <label class="form-label">Voltas: <span id="casual-laps-display">${this.selectedLaps}</span></label>
            <input type="range" class="form-input" min="1" max="30" value="${this.selectedLaps}" oninput="ModeCasual.setLaps(this.value)">
          </div>
          <div class="form-group" style="margin-top: 18px;">
            <label class="form-label">Pilotos participantes</label>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <input class="form-input" placeholder="Pesquisar piloto..." value="${Utils.escapeHtml(this.driverSearch)}" oninput="ModeCasual.filterDrivers(this.value)">
              <select class="form-select" style="max-width: 220px;" onchange="ModeCasual.filterTeam(this.value)">
                <option value="all">Todas as equipes</option>
                ${teams.map(team => `<option value="${team.id}" ${this.teamFilter === team.id ? 'selected' : ''}>${team.logo || '🏎️'} ${Utils.escapeHtml(team.name)}</option>`).join('')}
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto;">
              ${visibleDrivers.map(driver => `<label style="display: flex; gap: 8px; align-items: center;"><input type="checkbox" ${this.selectedDriverIds.includes(driver.id) ? 'checked' : ''} onchange="ModeCasual.toggleDriver('${driver.id}')"><span>#${driver.number} ${Utils.escapeHtml(driver.name)}</span><small style="color: var(--text-dim); margin-left: auto;">${Utils.escapeHtml(teams.find(team => team.id === driver.teamId)?.name || 'Sem equipe')}</small></label>`).join('') || '<span style="color: var(--text-dim);">Nenhum piloto encontrado.</span>'}
            </div>
          </div>
          <button class="btn btn-primary btn-lg" style="width: 100%; margin-top: 22px; background: var(--accent-green); color: #07130e;" onclick="ModeCasual.startSession()">🏁 Largar Corrida Casual</button>
        </div>
      </div>
    `;
  },

  setTrack(id) {
    this.selectedTrackId = id;
    App.navigateTo('mode-casual');
  },

  setLaps(laps) {
    this.selectedLaps = parseInt(laps, 10);
    const display = document.getElementById('casual-laps-display');
    if (display) display.textContent = this.selectedLaps;
  },

  filterDrivers(term) {
    this.driverSearch = term;
    const container = document.getElementById('view-container');
    if (container) container.innerHTML = this.render();
    const input = document.querySelector('#view-container input[placeholder="Pesquisar piloto..."]');
    if (input) input.focus();
  },

  filterTeam(id) {
    this.teamFilter = id;
    App.navigateTo('mode-casual');
  },

  toggleDriver(id) {
    this.selectedDriverIds = this.selectedDriverIds.includes(id) ? this.selectedDriverIds.filter(driverId => driverId !== id) : [...this.selectedDriverIds, id];
    App.navigateTo('mode-casual');
  },

  startSession() {
    const track = Storage.getTracks().find(t => t.id === this.selectedTrackId);
    const selectedDrivers = Storage.getDrivers().filter(driver => this.selectedDriverIds.includes(driver.id));
    if (!track || selectedDrivers.length === 0) {
      alert('Selecione pelo menos uma equipe e um piloto participante.');
      return;
    }
    Race.startCasual({
      id: Utils.generateId('casual_gp'),
      name: `Casual: ${track.name}`,
      trackId: track.id,
      laps: this.selectedLaps,
      isCasual: true
    }, selectedDrivers);
  }
};