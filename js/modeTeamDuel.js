/* ==========================================================================
   RACE SIMULATOR - TEAM DUEL MODE (js/modeTeamDuel.js)
   ========================================================================== */

const ModeTeamDuel = {
  selectedTeamA: null,
  selectedTeamB: null,
  selectedTrackId: null,
  selectedLaps: 10,
  selectedRaceCount: 1,
  selectedTrackMode: 'same',
  selectedRoundTrackIds: [],
  activeSeries: null,
  lastDuelResult: null,

  render() {
    const teams = Storage.getTeams();
    const tracks = Storage.getTracks();
    const duels = Storage.getTeamDuels();

    if (!this.selectedTeamA && teams.length > 0) this.selectedTeamA = teams[0].id;
    if (!this.selectedTeamB && teams.length > 1) this.selectedTeamB = teams[1].id;
    if (!this.selectedTrackId && tracks.length > 0) this.selectedTrackId = tracks[0].id;

    const teamA = teams.find(t => t.id === this.selectedTeamA) || teams[0];
    const teamB = teams.find(t => t.id === this.selectedTeamB) || teams[1];
    const track = tracks.find(t => t.id === this.selectedTrackId) || tracks[0];

    const drivers = Storage.getDrivers();
    const teamADrivers = drivers.filter(d => d.teamId === teamA?.id);
    const teamBDrivers = drivers.filter(d => d.teamId === teamB?.id);
    const trackOptions = (selectedTrackId) => tracks.map(t => `
      <option value="${t.id}" ${t.id === selectedTrackId ? 'selected' : ''}>
        ${Utils.getCountryFlagText(t.country)} ${Utils.escapeHtml(t.name)} (${t.lengthKm} km)
      </option>
    `).join('');

    return `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Header com navegação de volta para o Hub de Modos -->
        <div class="glass-panel" style="display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--accent-red);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('modes-hub')">⬅ Todos os Modos</button>
              <span class="badge" style="background: rgba(255, 51, 102, 0.2); color: var(--accent-red); font-weight: 700;">MODO 2</span>
            </div>
            <h2 style="font-size: 1.6rem; font-weight: 800; margin-top: 6px;">⚔️ Equipe x Equipe — Duelo Direto</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Coloque duas escuderias frente a frente. Os pilotos competem no asfalto e a pontuação somada define a equipe vencedora!
            </p>
          </div>
          <button class="btn btn-primary btn-lg" style="background: var(--grad-red); box-shadow: 0 4px 15px rgba(255, 51, 102, 0.4);" onclick="ModeTeamDuel.startDuel()">
            🚀 Iniciar Duelo Agora
          </button>
        </div>

        <!-- Painel de Seleção das Equipes Frente a Frente -->
        <div class="grid-2">
          <!-- Equipe A -->
          <div class="glass-panel" style="border-top: 3px solid ${teamA?.color || '#ff1e1e'};">
            <div class="panel-header">
              <span class="badge" style="background: ${teamA?.color || '#ff1e1e'}30; color: ${teamA?.color || '#ff1e1e'}; font-weight: bold;">
                EQUIPE DESAFIANTE A
              </span>
              <select class="form-select" style="max-width: 180px; padding: 4px 8px; font-size: 0.85rem;" onchange="ModeTeamDuel.setTeamA(this.value)">
                ${teams.map(t => `<option value="${t.id}" ${t.id === teamA?.id ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>

            <div style="display: flex; align-items: center; gap: 16px; margin: 12px 0;">
              <div style="font-size: 3rem; background: ${teamA?.color || '#ff1e1e'}20; width: 70px; height: 70px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 2px solid ${teamA?.color || '#ff1e1e'};">
                ${teamA?.logo || '🏎️'}
              </div>
              <div>
                <h3 style="font-size: 1.3rem;">${Utils.escapeHtml(teamA?.name || 'Equipe A')}</h3>
                <div style="display: flex; gap: 6px; margin-top: 4px;">
                  <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${teamA?.color || '#ff1e1e'};"></span>
                  <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${teamA?.secondaryColor || '#fff'}; border: 1px solid #555;"></span>
                </div>
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: var(--radius-md); margin-top: 10px;">
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
                Pilotos na Disputa (${teamADrivers.length})
              </div>
              ${teamADrivers.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${teamADrivers.map(d => `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span><strong>#${d.number}</strong> ${Utils.escapeHtml(d.name)}</span>
                      <span style="color: var(--accent-cyan); font-weight: bold;">OVR ${Math.round((d.attributes.speed + d.attributes.acceleration + d.attributes.control + (d.attributes.braking ?? 75) + d.attributes.consistency) / 5)}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `<div style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">Nenhum piloto escalado nesta equipe.</div>`}
            </div>
          </div>

          <!-- Equipe B -->
          <div class="glass-panel" style="border-top: 3px solid ${teamB?.color || '#00e5ff'};">
            <div class="panel-header">
              <span class="badge" style="background: ${teamB?.color || '#00e5ff'}30; color: ${teamB?.color || '#00e5ff'}; font-weight: bold;">
                EQUIPE RIVAL B
              </span>
              <select class="form-select" style="max-width: 180px; padding: 4px 8px; font-size: 0.85rem;" onchange="ModeTeamDuel.setTeamB(this.value)">
                ${teams.map(t => `<option value="${t.id}" ${t.id === teamB?.id ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>

            <div style="display: flex; align-items: center; gap: 16px; margin: 12px 0;">
              <div style="font-size: 3rem; background: ${teamB?.color || '#00e5ff'}20; width: 70px; height: 70px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 2px solid ${teamB?.color || '#00e5ff'};">
                ${teamB?.logo || '🏎️'}
              </div>
              <div>
                <h3 style="font-size: 1.3rem;">${Utils.escapeHtml(teamB?.name || 'Equipe B')}</h3>
                <div style="display: flex; gap: 6px; margin-top: 4px;">
                  <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${teamB?.color || '#00e5ff'};"></span>
                  <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${teamB?.secondaryColor || '#fff'}; border: 1px solid #555;"></span>
                </div>
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: var(--radius-md); margin-top: 10px;">
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
                Pilotos na Disputa (${teamBDrivers.length})
              </div>
              ${teamBDrivers.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${teamBDrivers.map(d => `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span><strong>#${d.number}</strong> ${Utils.escapeHtml(d.name)}</span>
                      <span style="color: var(--accent-cyan); font-weight: bold;">OVR ${Math.round((d.attributes.speed + d.attributes.acceleration + d.attributes.control + (d.attributes.braking ?? 75) + d.attributes.consistency) / 5)}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `<div style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">Nenhum piloto escalado nesta equipe.</div>`}
            </div>
          </div>
        </div>

        <!-- Configurações do Duelo (série, pistas e voltas) -->
        <div class="glass-panel">
          <div class="panel-header">
            <h3 class="panel-title">🏁 Formato do Duelo</h3>
          </div>
          <div class="grid-2" style="margin-top: 10px;">
            <div class="form-group">
              <label class="form-label">Rodadas</label>
              <select class="form-select" onchange="ModeTeamDuel.setRaceCount(this.value)">
                <option value="1" ${this.selectedRaceCount === 1 ? 'selected' : ''}>1 corrida</option>
                <option value="3" ${this.selectedRaceCount === 3 ? 'selected' : ''}>Melhor de 3 (3 corridas)</option>
                <option value="5" ${this.selectedRaceCount === 5 ? 'selected' : ''}>Melhor de 5 (5 corridas)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Número de Voltas: <span id="duel-laps-display">${this.selectedLaps}</span> voltas</label>
              <input type="range" class="form-input" min="3" max="30" value="${this.selectedLaps}" oninput="ModeTeamDuel.setLaps(this.value)">
            </div>
            ${this.selectedRaceCount > 1 ? `
              <div class="form-group">
                <label class="form-label">Pistas da série</label>
                <select class="form-select" onchange="ModeTeamDuel.setTrackMode(this.value)">
                  <option value="same" ${this.selectedTrackMode === 'same' ? 'selected' : ''}>Mesma pista em todas as rodadas</option>
                  <option value="different" ${this.selectedTrackMode === 'different' ? 'selected' : ''}>Escolher pista por rodada</option>
                </select>
              </div>
            ` : ''}
            ${this.selectedRaceCount > 1 && this.selectedTrackMode === 'different'
              ? Array.from({ length: this.selectedRaceCount }, (_, index) => `
                <div class="form-group">
                  <label class="form-label">Pista da rodada ${index + 1}</label>
                  <select class="form-select" onchange="ModeTeamDuel.setRoundTrack(${index}, this.value)">
                    ${trackOptions(this.selectedRoundTrackIds[index] || track?.id)}
                  </select>
                </div>
              `).join('')
              : `
                <div class="form-group">
                  <label class="form-label">Circuito / Pista do Confronto</label>
                  <select class="form-select" onchange="ModeTeamDuel.setTrack(this.value)">
                    ${trackOptions(track?.id)}
                  </select>
                </div>
              `}
          </div>
          ${this.selectedRaceCount > 1 ? '<p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 10px;">A equipe vencedora é definida pela soma dos pontos de todas as rodadas.</p>' : ''}
        </div>

        <!-- Histórico de Duelos Realizados -->
        <div class="glass-panel">
          <div class="panel-header">
            <h3 class="panel-title">📜 Histórico de Duelos Equipe x Equipe</h3>
            <span class="badge" style="background: var(--bg-tertiary);">${duels.length} confrontos</span>
          </div>

          <div class="table-container" style="margin-top: 12px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Circuito</th>
                  <th>Equipe A (Pontos)</th>
                  <th>Equipe B (Pontos)</th>
                  <th>Vencedora</th>
                  <th>Piloto Vencedor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${duels.map(d => `
                  <tr>
                    <td>${d.date}</td>
                    <td>${Utils.escapeHtml(d.trackName)}${d.roundCount > 1 ? `<div style="font-size:0.72rem;color:var(--text-dim);">${d.roundCount} rodadas</div>` : ''}</td>
                    <td><strong>${Utils.escapeHtml(d.teamAName)} (${d.teamAPoints} pts)</strong></td>
                    <td><strong>${Utils.escapeHtml(d.teamBName)} (${d.teamBPoints} pts)</strong></td>
                    <td>
                      <span class="badge" style="background: rgba(255, 183, 3, 0.2); color: var(--accent-gold); font-weight: bold;">
                        🏆 ${Utils.escapeHtml(d.winnerTeamName)}
                      </span>
                    </td>
                    <td>${Utils.escapeHtml(d.raceWinnerDriverName)}</td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="ModeTeamDuel.viewDuelDetails('${d.id}')">Ver Detalhes</button>
                    </td>
                  </tr>
                `).join('')}
                ${duels.length === 0 ? `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 24px;">Nenhum duelo de equipes registrado ainda. Inicie um confronto acima!</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  setTeamA(id) {
    this.selectedTeamA = id;
    App.navigateTo('mode-team-duel');
  },

  setTeamB(id) {
    this.selectedTeamB = id;
    App.navigateTo('mode-team-duel');
  },

  setTrack(id) {
    this.selectedTrackId = id;
    App.navigateTo('mode-team-duel');
  },

  setRaceCount(count) {
    this.selectedRaceCount = parseInt(count, 10) || 1;
    App.navigateTo('mode-team-duel');
  },

  setTrackMode(mode) {
    this.selectedTrackMode = mode === 'different' ? 'different' : 'same';
    App.navigateTo('mode-team-duel');
  },

  setRoundTrack(index, trackId) {
    this.selectedRoundTrackIds[index] = trackId;
  },

  setLaps(laps) {
    this.selectedLaps = parseInt(laps, 10);
    const el = document.getElementById('duel-laps-display');
    if (el) el.textContent = this.selectedLaps;
  },

  startDuel() {
    if (this.selectedTeamA === this.selectedTeamB) {
      alert('Selecione duas equipes diferentes para realizar o duelo!');
      return;
    }

    const teams = Storage.getTeams();
    const tracks = Storage.getTracks();
    const teamA = teams.find(t => t.id === this.selectedTeamA);
    const teamB = teams.find(t => t.id === this.selectedTeamB);
    const track = tracks.find(t => t.id === this.selectedTrackId);

    const raceCount = [1, 3, 5].includes(this.selectedRaceCount) ? this.selectedRaceCount : 1;
    const roundTrackIds = Array.from({ length: raceCount }, (_, index) =>
      raceCount > 1 && this.selectedTrackMode === 'different'
        ? (this.selectedRoundTrackIds[index] || track.id)
        : track.id
    );

    this.activeSeries = {
      id: Utils.generateId('duel_series'),
      roundCount: raceCount,
      nextRound: 1,
      teamAId: teamA.id,
      teamBId: teamB.id,
      laps: this.selectedLaps,
      trackIds: roundTrackIds,
      rounds: []
    };
    this.lastDuelResult = null;
    this.startSeriesRound();
  },

  startSeriesRound() {
    const series = this.activeSeries;
    if (!series || series.nextRound > series.roundCount) return;

    const teams = Storage.getTeams();
    const tracks = Storage.getTracks();
    const teamA = teams.find(t => t.id === series.teamAId);
    const teamB = teams.find(t => t.id === series.teamBId);
    const round = series.nextRound;
    const trackId = series.trackIds[round - 1];
    const track = tracks.find(t => t.id === trackId) || tracks[0];
    if (!teamA || !teamB || !track) {
      alert('Não foi possível iniciar a rodada: equipe ou pista não encontrada.');
      return;
    }

    const gpData = {
      id: Utils.generateId('duel_gp'),
      name: series.roundCount > 1
        ? `Duelo: ${teamA.name} vs ${teamB.name} — Rodada ${round}/${series.roundCount}`
        : `Duelo: ${teamA.name} vs ${teamB.name}`,
      trackId: track.id,
      laps: series.laps,
      isTeamDuel: true,
      teamAId: teamA.id,
      teamBId: teamB.id,
      duelSeriesId: series.id,
      duelRound: round,
      duelRoundCount: series.roundCount
    };

    Race.selectedTeamIds = [teamA.id, teamB.id];
    Race.startQualify(gpData, [teamA.id, teamB.id]);
  },

  startNextRound() {
    if (!this.activeSeries || this.activeSeries.nextRound > this.activeSeries.roundCount) return;
    this.startSeriesRound();
  },

  getSeriesScore() {
    const series = this.activeSeries;
    return (series?.rounds || []).reduce((score, round) => ({
      teamAPoints: score.teamAPoints + round.teamAPoints,
      teamBPoints: score.teamBPoints + round.teamBPoints
    }), { teamAPoints: 0, teamBPoints: 0 });
  },

  computeTeamOutcome(raceRecord) {
    const teams = Storage.getTeams();
    const teamA = teams.find(t => t.id === raceRecord.teamAId);
    const teamB = teams.find(t => t.id === raceRecord.teamBId);
    let teamAPoints = 0;
    let teamBPoints = 0;
    (raceRecord.results || []).forEach(res => {
      const pointsValue = typeof res.points === 'string' ? parseFloat(res.points.replace(/[^\d.-]/g, '')) || 0 : (res.points || 0);
      if (res.teamId === raceRecord.teamAId) teamAPoints += pointsValue;
      if (res.teamId === raceRecord.teamBId) teamBPoints += pointsValue;
    });
    let winnerTeamId = teamAPoints > teamBPoints ? raceRecord.teamAId : raceRecord.teamBId;
    let winnerTeamName = teamAPoints > teamBPoints ? teamA?.name : teamB?.name;
    if (teamAPoints === teamBPoints) {
      winnerTeamId = raceRecord.results?.[0]?.teamId || raceRecord.teamAId;
      winnerTeamName = teams.find(t => t.id === winnerTeamId)?.name || 'Empate Técnico';
    }
    return { teamA, teamB, teamAPoints, teamBPoints, winnerTeamId, winnerTeamName };
  },

  recordDuelResult(raceRecord) {
    const outcome = this.computeTeamOutcome(raceRecord);
    const series = this.activeSeries;
    const roundRecord = {
      raceId: raceRecord.id,
      round: raceRecord.duelRound || 1,
      trackName: raceRecord.trackName,
      teamAPoints: outcome.teamAPoints,
      teamBPoints: outcome.teamBPoints,
      results: raceRecord.results
    };

    if (series && series.id === raceRecord.duelSeriesId) {
      series.rounds.push(roundRecord);
      series.nextRound = roundRecord.round + 1;
      if (series.nextRound <= series.roundCount) return;
    }

    const rounds = series && series.id === raceRecord.duelSeriesId ? series.rounds : [roundRecord];
    const allResults = rounds.flatMap(round => round.results || []);
    const totalRaceRecord = {
      ...raceRecord,
      results: allResults,
      trackName: [...new Set(rounds.map(round => round.trackName))].join(', ')
    };
    const { teamA, teamB, winnerTeamId, winnerTeamName } = this.computeTeamOutcome(totalRaceRecord);
    const teamAPoints = rounds.reduce((sum, round) => sum + round.teamAPoints, 0);
    const teamBPoints = rounds.reduce((sum, round) => sum + round.teamBPoints, 0);

    const duelRecord = {
      id: Utils.generateId('duel'),
      date: raceRecord.date,
      trackName: raceRecord.trackName,
      teamAId: raceRecord.teamAId,
      teamAName: teamA?.name || 'Equipe A',
      teamAPoints,
      teamBId: raceRecord.teamBId,
      teamBName: teamB?.name || 'Equipe B',
      teamBPoints,
      winnerTeamId,
      winnerTeamName,
      raceWinnerDriverName: raceRecord.results[0]?.driverName || 'N/A',
      raceId: raceRecord.id,
      results: allResults,
      roundCount: rounds.length,
      rounds
    };

    if (!Storage.addTeamDuel(duelRecord)) {
      alert('Não foi possível salvar o histórico deste duelo. Verifique o espaço disponível no armazenamento do navegador.');
      return false;
    }
    this.lastDuelResult = duelRecord;
    return true;
  },

  viewDuelDetails(duelId) {
    const duels = Storage.getTeamDuels();
    const duel = duels.find(d => d.id === duelId);
    if (!duel) return;

    const modalHtml = `
      <div class="modal-backdrop active" id="duel-details-modal">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h3>⚔️ Detalhes do Duelo: ${Utils.escapeHtml(duel.teamAName)} vs ${Utils.escapeHtml(duel.teamBName)}</h3>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('duel-details-modal')">✕</button>
          </div>
          <div class="modal-body">
            <div style="display: flex; justify-content: space-around; text-align: center; background: rgba(0,0,0,0.3); padding: 16px; border-radius: var(--radius-md); margin-bottom: 16px;">
              <div>
                <h4 style="color: var(--accent-red);">${Utils.escapeHtml(duel.teamAName)}</h4>
                <div style="font-size: 1.8rem; font-weight: 800; font-family: var(--font-mono);">${duel.teamAPoints} pts</div>
              </div>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-dim); align-self: center;">VS</div>
              <div>
                <h4 style="color: var(--accent-cyan);">${Utils.escapeHtml(duel.teamBName)}</h4>
                <div style="font-size: 1.8rem; font-weight: 800; font-family: var(--font-mono);">${duel.teamBPoints} pts</div>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 16px;">
              <span class="badge" style="background: rgba(255, 183, 3, 0.2); color: var(--accent-gold); font-size: 0.9rem; padding: 6px 14px;">
                🏆 VENCEDOR: ${Utils.escapeHtml(duel.winnerTeamName)}
              </span>
            </div>

            ${duel.roundCount > 1 ? `
              <table class="data-table">
                <thead><tr><th>Rodada</th><th>Pista</th><th>${Utils.escapeHtml(duel.teamAName)}</th><th>${Utils.escapeHtml(duel.teamBName)}</th></tr></thead>
                <tbody>${duel.rounds.map(round => `
                  <tr><td>${round.round}</td><td>${Utils.escapeHtml(round.trackName)}</td><td>${round.teamAPoints} pts</td><td>${round.teamBPoints} pts</td></tr>
                `).join('')}</tbody>
              </table>
            ` : `
            <table class="data-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Piloto</th>
                  <th>Equipe</th>
                  <th>Tempo Total</th>
                  <th>Pontos</th>
                </tr>
              </thead>
              <tbody>
                ${duel.results ? duel.results.map(r => `
                  <tr>
                    <td><strong>P${r.position}</strong></td>
                    <td>${Utils.escapeHtml(r.driverName)}</td>
                    <td>${Utils.escapeHtml(r.teamName)}</td>
                    <td style="font-family: var(--font-mono);">${Utils.formatTime(r.totalTimeMs)}</td>
                    <td><strong style="color: var(--accent-cyan);">${r.points}</strong></td>
                  </tr>
                `).join('') : '<tr><td colspan="5">Sem detalhes disponíveis.</td></tr>'}
              </tbody>
            </table>
            `}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="App.closeModal('duel-details-modal')">Fechar</button>
          </div>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
  }
};
