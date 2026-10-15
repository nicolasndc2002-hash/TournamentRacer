/* ==========================================================================
   RACE SIMULATOR - TIME-TRIAL MODE (js/modeTimeTrial.js)
   ========================================================================== */

const ModeTimeTrial = {
  selectedDriverIds: [],   // agora suporta múltiplos pilotos
  selectedTeamIds: [],
  activeSelectionType: 'pilot',
  selectedTrackId: null,
  selectedLaps: 5,
  searchTerm: '',

  render() {
    const drivers = Storage.getDrivers();
    const tracks = Storage.getTracks();
    const teams = Storage.getTeams();
    const timeTrials = Storage.getBestTimeTrials();

    this.selectedDriverIds = this.selectedDriverIds.filter(id => drivers.some(driver => driver.id === id));
    this.selectedTeamIds = this.selectedTeamIds.filter(id => teams.some(team => team.id === id));
    if (this.selectedDriverIds.length === 0 && drivers.length > 0) {
      this.selectedDriverIds = [drivers[0].id];
    }
    if (!this.selectedTrackId && tracks.length > 0) this.selectedTrackId = tracks[0].id;

    const track = tracks.find(t => t.id === this.selectedTrackId) || tracks[0];

    // Filter best times for selected track, sorted best first
    const query = this.searchTerm.trim().toLowerCase();
    const trackRecords = timeTrials
      .filter(t => t.trackId === track?.id)
      .filter(t => !query || `${t.driverName} ${t.teamName}`.toLowerCase().includes(query))
      .sort((a, b) => a.bestLapMs - b.bestLapMs);

    return `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Header -->
        <div class="glass-panel" style="display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--accent-cyan);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('modes-hub')">⬅ Todos os Modos</button>
              <span class="badge" style="background: rgba(0, 229, 255, 0.2); color: var(--accent-cyan); font-weight: 700;">MODO 3</span>
            </div>
            <h2 style="font-size: 1.6rem; font-weight: 800; margin-top: 6px;">⏱️ Time-Trial — Desafio de Contrarrelógio</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Corra em pista limpa. Selecione até vários pilotos para uma batalha contrarrelógio simultânea!
            </p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
            <button class="btn btn-danger btn-sm" onclick="ModeTimeTrial.clearAllRecords()">Limpar todos os tempos</button>
            <button class="btn btn-primary btn-lg" style="box-shadow: 0 4px 15px var(--accent-cyan-glow);" onclick="ModeTimeTrial.startSession()">
              🏁 Iniciar Sessão
            </button>
          </div>
        </div>

        <!-- Grid: Circuito + Participantes Selecionados -->
        <div class="grid-2">
          <!-- Painel esquerdo: Circuito & Voltas -->
          <div class="glass-panel">
            <div class="panel-header">
              <span class="badge" style="background: var(--bg-tertiary);">TRAÇADO & CONFIGURAÇÃO</span>
              <select class="form-select" style="max-width: 220px; padding: 4px 8px; font-size: 0.85rem;" onchange="ModeTimeTrial.setTrack(this.value)">
                ${tracks.map(t => `<option value="${t.id}" ${t.id === track?.id ? 'selected' : ''}>${Utils.getCountryFlagText(t.country)} ${t.name}</option>`).join('')}
              </select>
            </div>

            <div style="margin: 12px 0;">
              <h3 style="font-size: 1.25rem;">${Utils.escapeHtml(track?.name || 'Pista')}</h3>
              <div style="font-size: 0.82rem; color: var(--text-muted);">
                Extensão: <strong>${track?.lengthKm} km</strong> • País: <strong>${track?.country}</strong>
              </div>
            </div>

            <div class="form-group" style="margin-top: 14px;">
              <label class="form-label">Voltas Cronometradas: <span id="tt-laps-display">${this.selectedLaps}</span> voltas</label>
              <input type="range" class="form-input" min="3" max="20" value="${this.selectedLaps}" oninput="ModeTimeTrial.setLaps(this.value)">
            </div>

            <input class="form-input" placeholder="Pesquisar piloto ou equipe..." value="${Utils.escapeHtml(this.searchTerm)}" oninput="ModeTimeTrial.filter(this.value)">

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: var(--radius-md); font-size: 0.8rem; color: var(--text-muted); margin-top: 12px;">
              💡 <strong>Como Funciona:</strong> Cada piloto selecionado corre voltas cronometradas de forma individual, sem interferência entre si. A melhor volta de cada piloto é salva no ranking da pista.
            </div>

            <!-- Recordes rápidos do circuito -->
            ${trackRecords.length > 0 ? `
              <div style="margin-top: 16px;">
                <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-dim); font-weight: bold; margin-bottom: 8px;">🏆 Top 3 do Circuito</div>
                ${trackRecords.slice(0, 3).map((r, idx) => `
                  <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: rgba(0,0,0,0.2); border-radius: 6px; margin-bottom: 4px; border-left: 3px solid ${idx === 0 ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'};">
                    <span style="color: ${idx === 0 ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight: bold; font-size: 0.85rem;">
                      ${idx === 0 ? '👑' : `#${idx + 1}`} ${Utils.escapeHtml(r.driverName)}
                    </span>
                    <span style="font-family: var(--font-mono); color: var(--accent-purple); font-weight: bold; font-size: 0.85rem;">
                      ${Utils.formatTime(r.bestLapMs)}
                    </span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Painel direito: Seleção de Pilotos ou Equipes -->
          <div class="glass-panel">
            <div class="panel-header">
              <span class="badge" style="background: var(--bg-tertiary);">${this.activeSelectionType === 'pilot' ? 'PILOTOS NA SESSÃO' : 'EQUIPES NA SESSÃO'}</span>
              <span class="badge" data-selected-count style="background: var(--accent-cyan); color: #000; font-weight: bold;">${this.getActiveSelectionIds().length} selecionados</span>
            </div>

            <div style="display: flex; gap: 8px; margin: 12px 0;">
              ${[
                { type: 'pilot', label: '👤 Pilotos' },
                { type: 'team', label: '🏎️ Equipes' }
              ].map(option => {
                const isActive = this.activeSelectionType === option.type;
                return `<button class="btn btn-sm" aria-pressed="${isActive}" onclick="ModeTimeTrial.setSelectionType('${option.type}')" style="background: ${isActive ? 'var(--accent-cyan)' : 'var(--bg-tertiary)'}; color: ${isActive ? '#000' : 'var(--text-muted)'}; border: 1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-color)'}; font-weight: 700;">${option.label}</button>`;
              }).join('')}
            </div>

            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
              ${this.activeSelectionType === 'pilot'
                ? 'Marque os pilotos que irão disputar esta sessão. Você pode adicionar vários para comparar tempos.'
                : 'Marque as equipes que irão disputar. Todos os pilotos das equipes selecionadas participarão da sessão.'}
            </p>

            <div class="time-trial-driver-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto; padding-right: 4px;">
              ${this.renderSelectionOptions(drivers, teams)}
            </div>

            <div style="margin-top: 12px; display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="ModeTimeTrial.selectAll()">✅ Todas</button>
              <button class="btn btn-secondary btn-sm" onclick="ModeTimeTrial.clearAll()">⬜ Limpar</button>
            </div>
          </div>
        </div>

        <!-- Tabela de Recordes do Circuito -->
        <div class="glass-panel">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🏆 Recordes Oficiais — ${Utils.escapeHtml(track?.name || '')}</h3>
              <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">Melhores marcas cravadas no modo Contrarrelógio nesta pista.</p>
            </div>
            <span class="badge" style="background: var(--accent-cyan); color: #000; font-weight: bold;">
              ${trackRecords.length} Marcas Registradas
            </span>
          </div>

          <div class="table-container" style="margin-top: 12px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Piloto</th>
                  <th>Equipe</th>
                  <th>Melhor Volta</th>
                  <th>Média</th>
                  <th>Voltas</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${trackRecords.map((r, idx) => `
                  <tr data-search="${Utils.escapeHtml(`${r.driverName} ${r.teamName}`)}">
                    <td><strong style="${idx === 0 ? 'color: var(--accent-gold);' : ''}">${idx === 0 ? '👑 #1' : '#' + (idx + 1)}</strong></td>
                    <td><strong>${Utils.escapeHtml(r.driverName)}</strong> <span style="font-size: 0.75rem; color: var(--text-dim);">#${r.driverNumber}</span></td>
                    <td>${Utils.escapeHtml(r.teamName)}</td>
                    <td><strong style="font-family: var(--font-mono); color: var(--accent-purple); font-size: 1rem;">${Utils.formatTime(r.bestLapMs)}</strong></td>
                    <td style="font-family: var(--font-mono);">${Utils.formatTime(r.avgLapMs)}</td>
                    <td>${r.totalLaps}</td>
                    <td>${r.date}</td>
                    <td>
                      <button class="btn btn-danger btn-sm" onclick="ModeTimeTrial.deleteRecord('${r.id}')">🗑️ Apagar</button>
                    </td>
                  </tr>
                `).join('')}
                ${trackRecords.length === 0 ? `<tr><td colspan="8" style="text-align: center; color: var(--text-dim); padding: 24px;">Nenhum recorde registrado nesta pista. Seja o primeiro!</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  toggleDriver(id) {
    if (this.selectedDriverIds.includes(id)) {
      this.selectedDriverIds = this.selectedDriverIds.filter(d => d !== id);
      // Sempre manter ao menos 1 piloto
      if (this.selectedDriverIds.length === 0) {
        this.selectedDriverIds = [id];
        return;
      }
    } else {
      this.selectedDriverIds.push(id);
    }
    this.refreshSelection();
  },

  toggleTeam(id) {
    if (this.selectedTeamIds.includes(id)) {
      this.selectedTeamIds = this.selectedTeamIds.filter(teamId => teamId !== id);
      if (this.selectedTeamIds.length === 0) {
        this.selectedTeamIds = [id];
        return;
      }
    } else {
      this.selectedTeamIds.push(id);
    }
    this.refreshSelection();
  },

  getActiveSelectionIds() {
    return this.activeSelectionType === 'team' ? this.selectedTeamIds : this.selectedDriverIds;
  },

  renderSelectionOptions(drivers, teams) {
    const isTeamSelection = this.activeSelectionType === 'team';
    const options = isTeamSelection ? teams : drivers;
    const selectedIds = this.getActiveSelectionIds();

    return options.map(option => {
      const isSelected = selectedIds.includes(option.id);
      const optionType = isTeamSelection ? 'team' : 'driver';
      const optionName = isTeamSelection ? option.name : `#${option.number} ${option.name}`;
      const team = isTeamSelection ? option : teams.find(item => item.id === option.teamId);
      const detail = isTeamSelection
        ? `${drivers.filter(driver => driver.teamId === option.id).length} pilotos na equipe`
        : `${team?.name || 'Sem Equipe'} • OVR ${Math.round((option.attributes.speed + option.attributes.acceleration + option.attributes.control + (option.attributes.braking ?? 75) + option.attributes.consistency) / 5)}`;
      const color = isTeamSelection ? option.color || '#fff' : option.color || team?.color || '#fff';

      return `
        <div class="time-trial-selection-option" data-option-type="${optionType}" data-option-id="${option.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: var(--radius-sm); border: 1.5px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.07)'}; background: ${isSelected ? 'rgba(0, 229, 255, 0.06)' : 'rgba(0,0,0,0.2)'}; cursor: pointer; transition: all 0.2s;" onclick="ModeTimeTrial.${isTeamSelection ? 'toggleTeam' : 'toggleDriver'}('${option.id}')">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="time-trial-selection-check" style="width: 18px; height: 18px; border-radius: 4px; border: 2px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.3)'}; background: ${isSelected ? 'var(--accent-cyan)' : 'transparent'}; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #000; font-weight: bold;">
              ${isSelected ? '✓' : ''}
            </div>
            ${isTeamSelection
              ? `<span style="font-size: 1.2rem; color: ${color};">${Utils.escapeHtml(option.logo || '🏎️')}</span>`
              : `<span style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; display: inline-block;"></span>`}
            <div>
              <strong style="font-size: 0.9rem;">${Utils.escapeHtml(optionName)}</strong>
              <div style="font-size: 0.72rem; color: var(--text-dim);">${Utils.escapeHtml(detail)}</div>
            </div>
          </div>
          <span class="badge time-trial-selection-badge" style="display: ${isSelected ? '' : 'none'}; background: rgba(0,229,255,0.15); color: var(--accent-cyan); font-size: 0.7rem;">✓ Selecionado</span>
        </div>
      `;
    }).join('');
  },

  selectAll() {
    const options = this.activeSelectionType === 'team' ? Storage.getTeams() : Storage.getDrivers();
    const selectedIds = options.map(option => option.id);
    if (this.activeSelectionType === 'team') this.selectedTeamIds = selectedIds;
    else this.selectedDriverIds = selectedIds;
    this.refreshSelection();
  },

  clearAll() {
    const options = this.activeSelectionType === 'team' ? Storage.getTeams() : Storage.getDrivers();
    const selectedIds = options.length > 0 ? [options[0].id] : [];
    if (this.activeSelectionType === 'team') this.selectedTeamIds = selectedIds;
    else this.selectedDriverIds = selectedIds;
    this.refreshSelection();
  },

  refreshSelection() {
    const countBadge = document.querySelector('[data-selected-count]');
    if (countBadge) countBadge.textContent = `${this.getActiveSelectionIds().length} selecionados`;

    document.querySelectorAll('.time-trial-selection-option').forEach(option => {
      const selectedIds = option.dataset.optionType === 'team' ? this.selectedTeamIds : this.selectedDriverIds;
      const isSelected = selectedIds.includes(option.dataset.optionId);
      option.style.borderColor = isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.07)';
      option.style.background = isSelected ? 'rgba(0, 229, 255, 0.06)' : 'rgba(0,0,0,0.2)';

      const check = option.querySelector('.time-trial-selection-check');
      if (check) {
        check.style.borderColor = isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.3)';
        check.style.background = isSelected ? 'var(--accent-cyan)' : 'transparent';
        check.textContent = isSelected ? '✓' : '';
      }

      const selectedBadge = option.querySelector('.time-trial-selection-badge');
      if (selectedBadge) selectedBadge.style.display = isSelected ? '' : 'none';
    });
  },

  setSelectionType(type) {
    if (type !== 'pilot' && type !== 'team') return;
    if (this.activeSelectionType === type) return;

    this.activeSelectionType = type;
    if (type === 'team' && this.selectedTeamIds.length === 0) {
      const firstTeam = Storage.getTeams()[0];
      if (firstTeam) this.selectedTeamIds = [firstTeam.id];
    }

    const pageScrollX = window.scrollX;
    const pageScrollY = window.scrollY;
    const listScrollTop = document.querySelector('.time-trial-driver-list')?.scrollTop || 0;
    App.navigateTo('mode-time-trial');
    requestAnimationFrame(() => {
      window.scrollTo(pageScrollX, pageScrollY);
      const list = document.querySelector('.time-trial-driver-list');
      if (list) list.scrollTop = listScrollTop;
    });
  },

  setTrack(id) {
    this.selectedTrackId = id;
    App.navigateTo('mode-time-trial');
  },

  setLaps(laps) {
    this.selectedLaps = parseInt(laps, 10);
    const el = document.getElementById('tt-laps-display');
    if (el) el.textContent = this.selectedLaps;
  },

  filter(term) {
    this.searchTerm = term;
    const query = term.trim().toLowerCase();
    document.querySelectorAll('tr[data-search]').forEach(row => {
      row.style.display = !query || row.dataset.search.toLowerCase().includes(query) ? '' : 'none';
    });
  },

  startSession() {
    const drivers = Storage.getDrivers();
    const tracks = Storage.getTracks();
    const track = tracks.find(t => t.id === this.selectedTrackId) || tracks[0];
    const selectedDriverIds = this.activeSelectionType === 'team'
      ? new Set(drivers.filter(driver => this.selectedTeamIds.includes(driver.teamId)).map(driver => driver.id))
      : new Set(this.selectedDriverIds);
    const selectedDrivers = drivers.filter(driver => selectedDriverIds.has(driver.id));

    if (!track || selectedDrivers.length === 0) {
      alert(`Selecione ${this.activeSelectionType === 'team' ? 'uma equipe com pilotos' : 'ao menos um piloto'} e um circuito.`);
      return;
    }

    // Sempre usa simulação real na pista — solo ou com múltiplos pilotos simultâneos
    const gpData = {
      id: Utils.generateId('tt_gp'),
      name: `Time-Trial: ${track.name}`,
      trackId: track.id,
      laps: this.selectedLaps,
      isTimeTrial: true,
      soloDriverId: selectedDrivers.length === 1 ? selectedDrivers[0].id : null,
      timeTrialDriverIds: selectedDrivers.map(d => d.id)
    };

    Race.startTimeTrial(gpData, selectedDrivers);
  },

  deleteRecord(trialId) {
    if (confirm('Tem certeza que deseja apagar este tempo de Time-Trial? O ranking da pista e as estatísticas dos pilotos serão recalculados automaticamente.')) {
      Storage.deleteTimeTrial(trialId);
      App.navigateTo('mode-time-trial');
    }
  },

  clearAllRecords() {
    if (!confirm('Limpar todos os tempos de Time-Trial? Esta ação vale para todos os pilotos e pistas.')) return;
    Storage.saveTimeTrials([]);
    Storage.saveHistory(Storage.getHistory().filter(race => !race.isTimeTrial && !race.gpId?.startsWith('tt_') && !race.gpName?.startsWith('Time-Trial:')));
    Storage.recalculateDriverBestLaps();
    App.navigateTo('mode-time-trial');
  },

  // Processa todos os resultados da simulação e salva um registro de TT por piloto
  processTimeTrialResult(raceRecord) {
    const drivers = Storage.getDrivers();
    let driversModified = false;

    const results = raceRecord.results || [];

    for (const result of results) {
      const driver = drivers.find(d => d.id === result.driverId);
      const bestLapMs = result.bestLapMs || raceRecord.fastestLap?.timeMs || 60000;
      const avgLapMs  = result.totalTimeMs
        ? Math.round(result.totalTimeMs / raceRecord.totalLaps)
        : bestLapMs;

      const timeTrialRecord = {
        id: Utils.generateId('tt'),
        driverId: driver?.id || result.driverId || 'unknown',
        driverName: driver?.name || result.driverName || 'Piloto',
        driverNumber: driver?.number || result.number || 1,
        teamName: result.teamName || 'Solo',
        trackId: raceRecord.trackId || this.selectedTrackId,
        trackName: raceRecord.trackName || result.trackName || '',
        bestLapMs,
        avgLapMs,
        totalLaps: raceRecord.totalLaps,
        date: new Date().toLocaleDateString('pt-BR')
      };

      Storage.addTimeTrial(timeTrialRecord);

      if (driver && (!driver.stats.bestLapTime || bestLapMs < driver.stats.bestLapTime)) {
        driver.stats.bestLapTime = bestLapMs;
        driversModified = true;
      }
    }

    if (driversModified) Storage.saveDrivers(drivers);
  }
};
