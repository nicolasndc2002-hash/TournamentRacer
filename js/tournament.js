/* ==========================================================================
   RACE SIMULATOR - TOURNAMENT ORGANIZER (js/tournament.js)
   O Torneio organiza competições. O desempenho vem do motor e dos perfis reais.
   ========================================================================== */

const Tournament = {
  currentId: null,
  viewMode: 'list', // list | create | detail
  draft: {
    name: 'Copa dos Campeões',
    type: 'drivers',
    participantIds: [],
    format: 'auto',
    trackId: '',
    laps: 10
  },

  PHASE_LABELS: {
    groups: 'Grupos',
    round_of_16: 'Oitavas de Final',
    quarterfinal: 'Quartas de Final',
    semifinal: 'Semifinal',
    final: 'Final'
  },

  getAll() {
    return Storage.getTournaments();
  },

  saveAll(list) {
    Storage.saveTournaments(list);
  },

  getById(id) {
    return this.getAll().find(t => t.id === id) || null;
  },

  persist(tournament) {
    const list = this.getAll();
    const idx = list.findIndex(t => t.id === tournament.id);
    if (idx >= 0) list[idx] = tournament;
    else list.unshift(tournament);
    this.saveAll(list);
    return tournament;
  },

  open(id) {
    this.currentId = id;
    this.viewMode = 'detail';
    App.navigateTo('tournament');
  },

  openList() {
    this.currentId = null;
    this.viewMode = 'list';
    App.navigateTo('tournament');
  },

  openCreate() {
    const tracks = Storage.getTracks();
    this.draft = {
      name: 'Copa dos Campeões',
      type: 'drivers',
      participantIds: [],
      format: 'auto',
      trackId: tracks[0]?.id || '',
      laps: 10
    };
    this.viewMode = 'create';
    App.navigateTo('tournament');
  },

  render() {
    if (this.viewMode === 'create') return this.renderCreate();
    if (this.viewMode === 'detail' && this.currentId) return this.renderDetail(this.currentId);
    return this.renderList();
  },

  /* ── Live profile lookup (never copies entities) ── */
  liveDriver(id) {
    return Storage.getDrivers().find(d => d.id === id) || null;
  },

  liveTeam(id) {
    return Storage.getTeams().find(t => t.id === id) || null;
  },

  liveName(tournament, participantId) {
    if (!participantId) return 'A definir';
    if (tournament.type === 'teams') {
      return this.liveTeam(participantId)?.name || 'Equipe removida';
    }
    return this.liveDriver(participantId)?.name || 'Piloto removido';
  },

  seasonLabel() {
    const season = Storage.getCurrentSeason();
    return season ? `${season.name}` : `Temporada ${new Date().getFullYear()}`;
  },

  seasonYear() {
    return Storage.getCurrentSeason()?.year || new Date().getFullYear();
  },

  phaseLabel(phase) {
    return this.PHASE_LABELS[phase] || phase || '—';
  },

  progress(t) {
    const total = (t.matches || []).length;
    const done = (t.matches || []).filter(m => m.status === 'completed').length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  },

  currentPhase(t) {
    if (t.status === 'finished') return 'Finalizado';
    const pending = (t.matches || []).find(m => m.status !== 'completed');
    if (pending) return this.phaseLabel(pending.phase);
    return this.phaseLabel(t.currentPhase) || 'Em andamento';
  },

  nextMatch(t) {
    return (t.matches || []).find(m => m.status !== 'completed' && m.participantAId && m.participantBId) || null;
  },

  getDashboardItems() {
    const all = this.getAll();
    const active = all.filter(t => t.status === 'active');
    const finished = all.filter(t => t.status === 'finished');
    return { active, lastFinished: finished[0] || null };
  },

  getProfileMatchHistory(entityType, entityId) {
    const raceHistory = Storage.getHistory();
    const records = [];

    this.getAll().forEach(tournament => {
      (tournament.matches || []).filter(match => match.status === 'completed').forEach(match => {
        const race = raceHistory.find(item => item.id === match.raceId || item.matchId === match.id);
        const savedResult = match.result || {};
        const results = savedResult.results?.length ? savedResult.results : (race?.results || []);
        const qualifyResults = savedResult.qualifyResults?.length ? savedResult.qualifyResults : (race?.qualifyResults || []);
        const ownResults = results.filter(result => entityType === 'driver'
          ? result.driverId === entityId
          : result.teamId === entityId
        );
        const ownQualifyResults = qualifyResults.filter(result => entityType === 'driver'
          ? result.driverId === entityId
          : result.teamId === entityId
        );
        const sideType = tournament.type === 'teams' ? 'team' : 'driver';
        const participantMatch = entityType === sideType &&
          (match.participantAId === entityId || match.participantBId === entityId);
        if (ownResults.length === 0 && !participantMatch) return;

        const ownSideId = entityType === sideType
          ? entityId
          : (entityType === 'driver' ? ownResults[0]?.teamId : ownResults[0]?.driverId);
        const resultUsesSide = participantId => tournament.type === 'teams'
          ? ownResults.some(result => result.teamId === participantId)
          : ownResults.some(result => result.driverId === participantId);
        const isSideA = match.participantAId === ownSideId || resultUsesSide(match.participantAId);
        const isSideB = match.participantBId === ownSideId || resultUsesSide(match.participantBId);
        const opponentId = isSideA ? match.participantBId : isSideB ? match.participantAId : null;
        const opponentName = opponentId
          ? this.liveName(tournament, opponentId)
          : (isSideA ? savedResult.participantBName : savedResult.participantAName) || 'Adversário';
        const winningSideId = tournament.type === 'teams'
          ? (entityType === 'driver' ? ownResults[0]?.teamId : entityId)
          : (entityType === 'team' ? ownResults.find(result => result.driverId === savedResult.winnerId)?.teamId : entityId);
        const isWinner = savedResult.winnerId === winningSideId || savedResult.winnerId === entityId;
        const wonByOwnTeam = entityType === 'team' && tournament.type === 'drivers' &&
          ownResults.some(result => result.driverId === savedResult.winnerId);
        const outcome = isWinner || wonByOwnTeam ? 'Vitória' : savedResult.winnerId ? 'Derrota' : 'Empate';
        const personalPoints = ownResults.reduce((sum, result) => {
          const value = result.points;
          return sum + (typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) || 0 : value || 0);
        }, 0);
        const ownPoints = entityType === 'team' && tournament.type === 'teams'
          ? (isSideA ? savedResult.teamAPoints : savedResult.teamBPoints) ?? personalPoints
          : personalPoints;
        const positions = ownResults.map(result => Number(result.position)).filter(Number.isFinite);
        const qualifyTrackId = savedResult.qualifyTrackId || race?.qualifyTrackId || match.qualifyTrackId || match.trackId;
        const raceTrackId = savedResult.trackId || race?.trackId || match.trackId;
        const tracks = Storage.getTracks();

        records.push({
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          tournamentType: tournament.type,
          matchId: match.id,
          gpId: race?.gpId || `trn_${match.id}`,
          phase: match.phase,
          phaseName: this.phaseLabel(match.phase),
          opponentName,
          outcome,
          date: savedResult.date || race?.date || '',
          qualifyTrackName: savedResult.qualifyTrackName || tracks.find(track => track.id === qualifyTrackId)?.name || '',
          raceTrackName: savedResult.trackName || race?.trackName || tracks.find(track => track.id === raceTrackId)?.name || '',
          qualifyLaps: savedResult.qualifyLaps || race?.qualifyLaps || match.qualifyLaps || 5,
          raceLaps: savedResult.totalLaps || race?.totalLaps || match.laps || 0,
          points: ownPoints,
          position: positions.length ? Math.min(...positions) : null,
          fastestLap: ownResults.map(result => result.bestLapMs).filter(Number.isFinite).sort((a, b) => a - b)[0] || null,
          qualifyingResults: ownQualifyResults,
          results: ownResults.map(result => ({
            name: result.driverName || Storage.getDrivers().find(driver => driver.id === result.driverId)?.name || 'Piloto',
            position: result.position,
            points: result.points || 0,
            gridPos: result.gridPos || null,
            bestLapMs: result.bestLapMs || null
          }))
        });
      });
    });

    return records;
  },

  renderProfileChart(records) {
    const phaseKeys = Object.keys(this.PHASE_LABELS);
    const phases = phaseKeys.map(key => ({
      key,
      name: this.phaseLabel(key),
      wins: records.filter(record => record.phase === key && record.outcome === 'Vitória').length,
      losses: records.filter(record => record.phase === key && record.outcome === 'Derrota').length,
      draws: records.filter(record => record.phase === key && record.outcome === 'Empate').length
    })).filter(phase => phase.wins + phase.losses + phase.draws > 0);
    if (phases.length === 0) return '<div style="color:var(--text-dim);padding:16px 0;">Sem dados para o gráfico.</div>';

    const maxMatches = Math.max(...phases.map(phase => phase.wins + phase.losses + phase.draws), 1);
    const barWidth = 260;
    const rowHeight = 34;
    const svgHeight = phases.length * rowHeight + 12;
    return `
      <svg viewBox="0 0 500 ${svgHeight}" role="img" aria-label="Vitórias e derrotas por fase do torneio" style="width:100%;max-width:600px;display:block;">
        ${phases.map((phase, index) => {
          const y = 8 + index * rowHeight;
          const total = phase.wins + phase.losses + phase.draws;
          const winsWidth = (phase.wins / maxMatches) * barWidth;
          const lossesWidth = (phase.losses / maxMatches) * barWidth;
          const drawsWidth = (phase.draws / maxMatches) * barWidth;
          return `
            <text x="0" y="${y + 15}" fill="var(--text-muted)" font-size="11">${Utils.escapeHtml(phase.name)}</text>
            <rect x="118" y="${y}" width="${barWidth}" height="22" rx="3" fill="rgba(255,255,255,0.06)"/>
            <rect x="118" y="${y}" width="${winsWidth}" height="22" rx="3" fill="var(--accent-green)"/>
            <rect x="${118 + winsWidth}" y="${y}" width="${lossesWidth}" height="22" fill="var(--accent-red)"/>
            <rect x="${118 + winsWidth + lossesWidth}" y="${y}" width="${drawsWidth}" height="22" fill="var(--text-dim)"/>
            <text x="390" y="${y + 15}" fill="var(--text-muted)" font-size="10">${phase.wins}V · ${phase.losses}D · ${total}</text>
          `;
        }).join('')}
      </svg>
    `;
  },

  renderProfileHistory(entityType, entityId) {
    const records = this.getProfileMatchHistory(entityType, entityId);
    const wins = records.filter(record => record.outcome === 'Vitória').length;
    const losses = records.filter(record => record.outcome === 'Derrota').length;
    const draws = records.filter(record => record.outcome === 'Empate').length;
    const title = entityType === 'team' ? 'Torneios da Equipe' : 'Torneios do Piloto';

    return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <section class="profile-panel profile-panel-wide">
          <div class="profile-panel-header">
            <div><h3>🏆 ${title}</h3><p style="font-size:0.8rem;color:var(--text-muted);margin-top:3px;">Fases, adversários e resultados de todos os confrontos registrados.</p></div>
            <span class="badge" style="background:var(--bg-tertiary);">${records.length} confrontos</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-top:14px;">
            ${[
              { label: 'Confrontos', value: records.length, color: 'var(--accent-cyan)' },
              { label: 'Vitórias', value: wins, color: 'var(--accent-green)' },
              { label: 'Derrotas', value: losses, color: 'var(--accent-red)' },
              { label: 'Empates', value: draws, color: 'var(--text-muted)' },
              { label: 'Pontos', value: records.reduce((sum, record) => sum + record.points, 0), color: 'var(--accent-gold)' }
            ].map(item => `<div class="profile-stat-box"><span class="lbl">${item.label}</span><span class="val" style="color:${item.color};">${item.value}</span></div>`).join('')}
          </div>
        </section>
        <section class="profile-panel profile-panel-wide">
          <div class="profile-panel-header"><h3>📊 Desempenho por fase</h3></div>
          ${this.renderProfileChart(records)}
        </section>
        <section class="profile-panel profile-panel-wide">
          <div class="profile-panel-header"><h3>📋 Histórico detalhado dos confrontos</h3></div>
          <div class="table-container" style="margin-top:12px;">
            <table class="data-table">
              <thead><tr><th>Data</th><th>Torneio</th><th>Fase</th><th>Adversário</th><th>Desfecho</th><th>Classificação</th><th>Pista (Q / GP)</th><th>Voltas (Q / GP)</th><th>Resultados</th><th></th></tr></thead>
              <tbody>
                ${records.map(record => `
                  <tr>
                    <td>${Utils.escapeHtml(record.date || '—')}</td>
                    <td><strong>${Utils.escapeHtml(record.tournamentName)}</strong></td>
                    <td>${Utils.escapeHtml(record.phaseName)}</td>
                    <td>${Utils.escapeHtml(record.opponentName)}</td>
                    <td><strong style="color:${record.outcome === 'Vitória' ? 'var(--accent-green)' : record.outcome === 'Derrota' ? 'var(--accent-red)' : 'var(--text-muted)'};">${record.outcome}</strong></td>
                    <td>${record.position ? `P${record.position}` : '—'} · ${record.points} pts</td>
                    <td>${Utils.escapeHtml(record.qualifyTrackName || '—')} / ${Utils.escapeHtml(record.raceTrackName || '—')}</td>
                    <td>${record.qualifyLaps} / ${record.raceLaps || '—'}</td>
                    <td>${record.qualifyingResults.map(result => `
                      <div style="white-space:nowrap;color:var(--accent-purple);">Q P${result.gridPos}: ${Utils.escapeHtml(result.name)} · ${Utils.formatTime(result.lapTimeMs)}</div>
                    `).join('')}
                    ${record.results.map(result => `
                      <div style="white-space:nowrap;">${Utils.escapeHtml(result.name)}: P${result.position} · ${Utils.escapeHtml(String(result.points))} pts${result.gridPos ? ` · Grid P${result.gridPos}` : ''}${result.bestLapMs ? ` · ${Utils.formatTime(result.bestLapMs)}` : ''}</div>
                    `).join('') || '—'}</td>
                    <td>${record.gpId ? `<button class="btn btn-secondary btn-sm" onclick="Championship.viewGpResult('${record.gpId}')">Resultado</button>` : ''}</td>
                  </tr>
                `).join('')}
                ${records.length === 0 ? '<tr><td colspan="10" style="text-align:center;color:var(--text-dim);padding:24px;">Nenhum confronto de torneio registrado.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  },

  /* ── UI chips using live identity ── */
  renderEntityChip(tournament, participantId) {
    if (tournament.type === 'teams') {
      const team = this.liveTeam(participantId);
      if (!team) return `<span style="color:var(--text-dim);">Equipe indisponível</span>`;
      const drivers = Storage.getDrivers().filter(d => d.teamId === team.id);
      return `
        <div style="display:flex;align-items:center;gap:8px;min-width:0;">
          <span style="font-size:1.2rem;">${team.logo || '🏎️'}</span>
          <div style="min-width:0;">
            <div style="font-weight:800;color:${team.color || '#fff'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${Utils.escapeHtml(team.name)}
            </div>
            <div style="font-size:0.7rem;color:var(--text-dim);">
              ${drivers.length} piloto${drivers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>`;
    }
    const driver = this.liveDriver(participantId);
    if (!driver) return `<span style="color:var(--text-dim);">Piloto indisponível</span>`;
    const team = Storage.getTeams().find(t => t.id === driver.teamId);
    return `
      <div style="display:flex;align-items:center;gap:8px;min-width:0;">
        <div class="db-rank-avatar" style="width:32px;height:32px;border:1.5px solid ${driver.color || team?.color || '#00e5ff'};background:${driver.color || '#00e5ff'}18;font-size:0.7rem;color:${driver.color || '#00e5ff'};flex-shrink:0;">
          ${driver.avatar ? `<img src="${Utils.escapeHtml(driver.avatar)}" alt="">` : `#${driver.number}`}
        </div>
        <div style="min-width:0;">
          <div style="font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${Utils.getCountryFlag(driver.nationality)} ${Utils.escapeHtml(driver.name)}
          </div>
          <div style="font-size:0.7rem;color:var(--text-dim);">
            #${driver.number} · ${Utils.escapeHtml(team?.name || 'Sem equipe')}
          </div>
        </div>
      </div>`;
  },

  /* ── Create ── */
  toggleDraftParticipant(id) {
    const set = new Set(this.draft.participantIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.draft.participantIds = Array.from(set);
    App.navigateTo('tournament');
  },

  setDraftField(field, value) {
    this.draft[field] = field === 'laps' ? parseInt(value, 10) : value;
    if (field === 'type') this.draft.participantIds = [];
    App.navigateTo('tournament');
  },

  resolveFormat(n, requested) {
    if (requested === 'knockout' && [2, 4, 8, 16].includes(n)) return 'knockout';
    if (requested === 'groups' && n >= 3) return 'groups';
    if (requested === 'groups_knockout' && n >= 8 && n % 4 === 0) return 'groups_knockout';
    if ([2, 4, 8, 16].includes(n)) return 'knockout';
    if (n >= 8 && n % 4 === 0) return 'groups_knockout';
    if (n >= 3) return 'groups';
    return 'knockout';
  },

  shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  makeMatch(partial) {
    return {
      id: Utils.generateId('tmatch'),
      phase: 'final',
      groupId: null,
      participantAId: null,
      participantBId: null,
      trackId: null,
      qualifyTrackId: null,
      qualifyLaps: 5,
      laps: 10,
      status: 'pending',
      winnerId: null,
      raceId: null,
      nextMatchId: null,
      nextSlot: null,
      result: null,
      ...partial
    };
  },

  roundRobinPairs(ids) {
    const pairs = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        pairs.push([ids[i], ids[j]]);
      }
    }
    return pairs;
  },

  phaseForBracketSize(n) {
    if (n >= 16) return 'round_of_16';
    if (n >= 8) return 'quarterfinal';
    if (n >= 4) return 'semifinal';
    return 'final';
  },

  buildKnockoutMatches(ids, trackId, laps) {
    const seeded = this.shuffle(ids);
    const n = seeded.length;
    if (n < 2) return [];
    const rounds = [];
    let size = n;
    while (size >= 2) {
      const phase = this.phaseForBracketSize(size);
      const round = [];
      for (let i = 0; i < size / 2; i++) {
        round.push(this.makeMatch({
          phase,
          participantAId: size === n ? seeded[i * 2] : null,
          participantBId: size === n ? seeded[i * 2 + 1] : null,
          trackId,
          laps
        }));
      }
      rounds.push(round);
      size /= 2;
    }
    for (let r = 0; r < rounds.length - 1; r++) {
      rounds[r].forEach((m, i) => {
        m.nextMatchId = rounds[r + 1][Math.floor(i / 2)].id;
        m.nextSlot = i % 2 === 0 ? 'A' : 'B';
      });
    }
    return rounds.flat();
  },

  buildGroups(ids, trackId, laps) {
    const seeded = this.shuffle(ids);
    const groups = [];
    const matches = [];
    const groupSize = 4;
    let gi = 0;
    for (let i = 0; i < seeded.length; i += groupSize) {
      const chunk = seeded.slice(i, i + groupSize);
      if (chunk.length < 2) {
        if (groups.length) groups[groups.length - 1].participantIds.push(...chunk);
        continue;
      }
      const name = `Grupo ${String.fromCharCode(65 + gi)}`;
      const group = {
        id: Utils.generateId('tgroup'),
        name,
        participantIds: chunk,
        standings: chunk.map(pid => ({
          participantId: pid, played: 0, wins: 0, draws: 0, losses: 0, points: 0, racePoints: 0
        }))
      };
      groups.push(group);
      this.roundRobinPairs(chunk).forEach(([a, b]) => {
        matches.push(this.makeMatch({
          phase: 'groups',
          groupId: group.id,
          participantAId: a,
          participantBId: b,
          trackId,
          laps
        }));
      });
      gi += 1;
    }
    return { groups, matches };
  },

  createFromDraft() {
    const ids = this.draft.participantIds;
    if (ids.length < 2) {
      alert('Selecione pelo menos 2 participantes cadastrados.');
      return;
    }
    const format = this.resolveFormat(ids.length, this.draft.format);
    const tracks = Storage.getTracks();
    const trackId = this.draft.trackId || tracks[0]?.id;
    if (!trackId) {
      alert('Cadastre ao menos uma pista antes de criar o torneio.');
      return;
    }

    const tournament = {
      id: Utils.generateId('trn'),
      name: (this.draft.name || 'Torneio').trim(),
      type: this.draft.type === 'teams' ? 'teams' : 'drivers',
      seasonYear: this.seasonYear(),
      seasonName: this.seasonLabel(),
      status: 'active',
      format,
      participantIds: [...ids],
      trackId,
      laps: this.draft.laps || 10,
      groups: [],
      matches: [],
      currentPhase: format === 'knockout' ? this.phaseForBracketSize(ids.length) : 'groups',
      championId: null,
      createdAt: new Date().toISOString()
    };

    if (format === 'knockout') {
      tournament.matches = this.buildKnockoutMatches(ids, trackId, tournament.laps);
      tournament.currentPhase = tournament.matches[0]?.phase || 'final';
    } else if (format === 'groups') {
      const built = this.buildGroups(ids, trackId, tournament.laps);
      tournament.groups = built.groups;
      tournament.matches = built.matches;
      tournament.currentPhase = 'groups';
    } else {
      const built = this.buildGroups(ids, trackId, tournament.laps);
      tournament.groups = built.groups;
      tournament.matches = built.matches;
      tournament.currentPhase = 'groups';
    }

    this.persist(tournament);
    this.open(tournament.id);
  },

  /* ── Knockout after groups ── */
  maybeStartKnockout(tournament) {
    if (tournament.format !== 'groups_knockout') return;
    const groupMatches = tournament.matches.filter(m => m.phase === 'groups');
    if (!groupMatches.length || groupMatches.some(m => m.status !== 'completed')) return;
    if (tournament.matches.some(m => m.phase !== 'groups')) return;

    const qualifiers = [];
    tournament.groups.forEach(g => {
      const ranked = [...g.standings].sort((a, b) =>
        (b.points - a.points) || (b.racePoints - a.racePoints) || (b.wins - a.wins)
      );
      ranked.slice(0, 2).forEach(row => qualifiers.push(row.participantId));
    });
    if (qualifiers.length < 2) return;

    const ko = this.buildKnockoutMatches(qualifiers, tournament.trackId, tournament.laps);
    tournament.matches.push(...ko);
    tournament.currentPhase = ko[0]?.phase || 'semifinal';
  },

  maybeFinishGroupsChampion(tournament) {
    if (tournament.format !== 'groups') return;
    if (tournament.matches.some(m => m.status !== 'completed')) return;
    const table = [];
    tournament.groups.forEach(g => table.push(...g.standings));
    table.sort((a, b) => (b.points - a.points) || (b.racePoints - a.racePoints) || (b.wins - a.wins));
    tournament.championId = table[0]?.participantId || null;
    tournament.status = 'finished';
    tournament.currentPhase = 'final';
  },

  updateGroupStanding(tournament, match, winnerId, racePointsMap) {
    if (!match.groupId) return;
    const group = tournament.groups.find(g => g.id === match.groupId);
    if (!group) return;
    const a = group.standings.find(s => s.participantId === match.participantAId);
    const b = group.standings.find(s => s.participantId === match.participantBId);
    if (!a || !b) return;
    a.played += 1;
    b.played += 1;
    a.racePoints += racePointsMap[match.participantAId] || 0;
    b.racePoints += racePointsMap[match.participantBId] || 0;
    if (!winnerId) {
      a.draws += 1;
      b.draws += 1;
      a.points += 1;
      b.points += 1;
      return;
    }
    if (winnerId === match.participantAId) {
      a.wins += 1; a.points += 3;
      b.losses += 1;
    } else {
      b.wins += 1; b.points += 3;
      a.losses += 1;
    }
  },

  advanceWinner(tournament, match, winnerId) {
    if (!match.nextMatchId || !winnerId) return;
    const next = tournament.matches.find(m => m.id === match.nextMatchId);
    if (!next) return;
    if (match.nextSlot === 'B') next.participantBId = winnerId;
    else next.participantAId = winnerId;
  },

  decideWinner(tournament, match, raceRecord) {
    if (tournament.type === 'teams') {
      const outcome = ModeTeamDuel.computeTeamOutcome(raceRecord);
      return {
        winnerId: outcome.winnerTeamId,
        extra: outcome
      };
    }
    const first = raceRecord.results?.[0];
    return { winnerId: first?.driverId || null, extra: null };
  },

  applyRaceResult(raceRecord) {
    if (!raceRecord?.isTournament || !raceRecord.tournamentId || !raceRecord.matchId) return;
    const tournament = this.getById(raceRecord.tournamentId);
    if (!tournament) return;
    const match = tournament.matches.find(m => m.id === raceRecord.matchId);
    if (!match) return;
    if (match.status === 'completed') return; // never overwrite history

    const { winnerId, extra } = this.decideWinner(tournament, match, raceRecord);
    const racePointsMap = {};
    if (tournament.type === 'teams' && extra) {
      racePointsMap[match.participantAId] = extra.teamAPoints;
      racePointsMap[match.participantBId] = extra.teamBPoints;
    } else {
      (raceRecord.results || []).forEach(res => {
        const pointsValue = typeof res.points === 'string' ? parseFloat(res.points.replace(/[^\d.-]/g, '')) || 0 : (res.points || 0);
        racePointsMap[res.driverId] = (racePointsMap[res.driverId] || 0) + pointsValue;
      });
    }

    match.status = 'completed';
    match.winnerId = winnerId;
    match.raceId = raceRecord.id;
    match.result = {
      winnerId,
      winnerName: this.liveName(tournament, winnerId),
      participantAName: this.liveName(tournament, match.participantAId),
      participantBName: this.liveName(tournament, match.participantBId),
      trackName: raceRecord.trackName,
      trackId: raceRecord.trackId || match.trackId,
      qualifyTrackName: raceRecord.qualifyTrackName || '',
      qualifyTrackId: raceRecord.qualifyTrackId || match.qualifyTrackId,
      qualifyLaps: raceRecord.qualifyLaps || match.qualifyLaps || 5,
      date: raceRecord.date,
      qualifyResults: raceRecord.qualifyResults || [],
      totalLaps: raceRecord.totalLaps,
      fastestLap: raceRecord.fastestLap || null,
      results: raceRecord.results || [],
      teamAPoints: extra?.teamAPoints ?? null,
      teamBPoints: extra?.teamBPoints ?? null,
      raceId: raceRecord.id
    };

    this.updateGroupStanding(tournament, match, winnerId, racePointsMap);
    this.advanceWinner(tournament, match, winnerId);

    if (match.phase === 'final' && winnerId) {
      tournament.championId = winnerId;
      tournament.status = 'finished';
      tournament.currentPhase = 'final';
    } else if (match.phase === 'groups') {
      this.maybeStartKnockout(tournament);
      this.maybeFinishGroupsChampion(tournament);
      const next = this.nextMatch(tournament);
      tournament.currentPhase = next?.phase || tournament.currentPhase;
    } else {
      const next = this.nextMatch(tournament);
      tournament.currentPhase = next?.phase || match.phase;
    }

    this.persist(tournament);
  },

  startMatch(tournamentId, matchId) {
    const tournament = this.getById(tournamentId);
    const match = tournament?.matches.find(m => m.id === matchId);
    if (!match) return;
    if (match.status === 'completed') {
      alert('Este confronto já possui resultado no histórico.');
      return;
    }
    if (!match.participantAId || !match.participantBId) {
      alert('Os dois lados deste confronto ainda não foram definidos.');
      return;
    }

    const tracks = Storage.getTracks();
    if (tracks.length === 0) {
      alert('Nenhuma pista cadastrada para o confronto.');
      return;
    }

    if (tournament.type === 'teams') {
      const teamA = this.liveTeam(match.participantAId);
      const teamB = this.liveTeam(match.participantBId);
      const drivers = Storage.getDrivers();
      if (!drivers.some(d => d.teamId === teamA?.id) || !drivers.some(d => d.teamId === teamB?.id)) {
        alert('Cada equipe precisa ter seus pilotos cadastrados para o confronto.');
        return;
      }
    } else {
      const drvA = this.liveDriver(match.participantAId);
      const drvB = this.liveDriver(match.participantBId);
      if (!drvA || !drvB) {
        alert('Um dos pilotos não está mais cadastrado. O torneio referencia IDs existentes.');
        return;
      }
    }

    const defaultRaceTrackId = match.trackId || tournament.trackId || tracks[0].id;
    const defaultQualifyTrackId = match.qualifyTrackId || tournament.qualifyTrackId || defaultRaceTrackId;
    const raceTrack = tracks.find(track => track.id === defaultRaceTrackId) || tracks[0];

    App.showModal(`
      <div class="modal-backdrop active" id="tournament-match-config">
        <div class="modal-content" style="max-width:560px;">
          <div class="modal-header"><div><h3>Configurar confronto</h3><p style="color:var(--text-muted);font-size:0.82rem;margin-top:4px;">${Utils.escapeHtml(tournament.name)} · ${Utils.escapeHtml(this.phaseLabel(match.phase))}</p></div>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('tournament-match-config')">✕</button>
          </div>
          <div class="modal-body" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <label>Qualify · Pista
              <select id="tournament-qualify-track" class="form-select" style="margin-top:6px;">
                ${tracks.map(track => `<option value="${track.id}" ${track.id === defaultQualifyTrackId ? 'selected' : ''}>${Utils.escapeHtml(track.name)}</option>`).join('')}
              </select>
            </label>
            <label>Qualify · Voltas
              <input id="tournament-qualify-laps" class="form-input" type="number" min="1" max="20" step="1" value="${match.qualifyLaps || tournament.qualifyLaps || 5}" style="margin-top:6px;">
            </label>
            <label>Corrida oficial · Pista
              <select id="tournament-race-track" class="form-select" style="margin-top:6px;">
                ${tracks.map(track => `<option value="${track.id}" ${track.id === raceTrack.id ? 'selected' : ''}>${Utils.escapeHtml(track.name)}</option>`).join('')}
              </select>
            </label>
            <label>Corrida oficial · Voltas
              <input id="tournament-race-laps" class="form-input" type="number" min="1" max="100" step="1" value="${match.laps || tournament.laps || raceTrack.defaultLaps || 10}" style="margin-top:6px;">
            </label>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="App.closeModal('tournament-match-config')">Cancelar</button>
            <button class="btn btn-primary" onclick="Tournament.launchConfiguredMatch('${tournament.id}','${match.id}')">Iniciar Qualify</button>
          </div>
        </div>
      </div>
    `);
  },

  launchConfiguredMatch(tournamentId, matchId) {
    const tournament = this.getById(tournamentId);
    const match = tournament?.matches.find(item => item.id === matchId);
    if (!match) return;

    const qualifyTrack = Storage.getTracks().find(track => track.id === document.getElementById('tournament-qualify-track')?.value);
    const raceTrack = Storage.getTracks().find(track => track.id === document.getElementById('tournament-race-track')?.value);
    const qualifyLaps = parseInt(document.getElementById('tournament-qualify-laps')?.value, 10);
    const raceLaps = parseInt(document.getElementById('tournament-race-laps')?.value, 10);
    if (!qualifyTrack || !raceTrack || !Number.isInteger(qualifyLaps) || qualifyLaps < 1 || qualifyLaps > 20 || !Number.isInteger(raceLaps) || raceLaps < 1 || raceLaps > 100) {
      alert('Confira as pistas e a quantidade de voltas das duas sessões.');
      return;
    }

    match.qualifyTrackId = qualifyTrack.id;
    match.trackId = raceTrack.id;
    match.qualifyLaps = qualifyLaps;
    match.laps = raceLaps;
    this.persist(tournament);

    const nameA = this.liveName(tournament, match.participantAId);
    const nameB = this.liveName(tournament, match.participantBId);
    const gpData = {
      id: `trn_${match.id}`,
      name: `${tournament.name} — ${this.phaseLabel(match.phase)}: ${nameA} vs ${nameB}`,
      trackId: qualifyTrack.id,
      qualifyTrackId: qualifyTrack.id,
      qualifyTrackName: qualifyTrack.name,
      qualifyLaps,
      raceTrackId: raceTrack.id,
      laps: raceLaps,
      isTournament: true,
      tournamentId: tournament.id,
      matchId: match.id
    };

    App.closeModal('tournament-match-config');
    if (tournament.type === 'teams') {
      gpData.tournamentTeamMatch = true;
      gpData.teamAId = match.participantAId;
      gpData.teamBId = match.participantBId;
      Race.selectedTeamIds = [match.participantAId, match.participantBId];
      Race.startQualify(gpData, [match.participantAId, match.participantBId]);
      return;
    }

    gpData.driverIds = [match.participantAId, match.participantBId];
    Race.startQualify(gpData, null);
  },

  viewMatchHistory(tournamentId, matchId) {
    const t = this.getById(tournamentId);
    const match = t?.matches.find(m => m.id === matchId);
    if (!match?.result) return;
    const r = match.result;
    const modalHtml = `
      <div class="modal-backdrop active" id="tmatch-history-modal">
        <div class="modal-content" style="max-width:640px;">
          <div class="modal-header">
            <h3>Histórico do confronto</h3>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('tmatch-history-modal')">✕</button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:12px;">
              Torneio: <strong>${Utils.escapeHtml(t.name)}</strong><br>
              Fase: <strong>${this.phaseLabel(match.phase)}</strong><br>
              Confronto: <strong>${Utils.escapeHtml(r.participantAName)} × ${Utils.escapeHtml(r.participantBName)}</strong><br>
              Qualify: <strong>${Utils.escapeHtml(r.qualifyTrackName || '—')}</strong> · ${r.qualifyLaps || 5} voltas<br>
              Corrida: <strong>${Utils.escapeHtml(r.trackName || '—')}</strong> · ${r.totalLaps || '—'} voltas
            </p>
            <div style="text-align:center;margin-bottom:14px;">
              <span class="badge" style="background:rgba(255,183,3,0.2);color:var(--accent-gold);padding:6px 12px;">
                🏆 ${Utils.escapeHtml(r.winnerName || '—')} venceu
              </span>
            </div>
            <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:10px;">
              Tempo (P1): <span style="font-family:var(--font-mono);">${Utils.formatTime(r.results?.[0]?.totalTimeMs)}</span>
              · Volta mais rápida: <span style="font-family:var(--font-mono);color:var(--accent-purple);">${Utils.formatTime(r.fastestLap?.timeMs)}</span>
              (${Utils.escapeHtml(r.fastestLap?.driverName || '—')})
            </div>
            <table class="data-table">
              <thead><tr><th>Pos</th><th>Piloto</th><th>Equipe</th><th>Tempo</th><th>Melhor volta</th></tr></thead>
              <tbody>
                ${(r.results || []).map(row => `
                  <tr>
                    <td>P${row.position}</td>
                    <td>${Utils.escapeHtml(row.driverName)}</td>
                    <td>${Utils.escapeHtml(row.teamName)}</td>
                    <td style="font-family:var(--font-mono);">${Utils.formatTime(row.totalTimeMs)}</td>
                    <td style="font-family:var(--font-mono);">${Utils.formatTime(row.bestLapMs)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="App.closeModal('tmatch-history-modal')">Fechar</button>
          </div>
        </div>
      </div>`;
    App.showModal(modalHtml);
  },

  deleteTournament(id) {
    if (!confirm('Remover este torneio? Os perfis de pilotos e equipes não serão alterados.')) return;
    this.saveAll(this.getAll().filter(t => t.id !== id));
    this.openList();
  },

  renderList() {
    const all = this.getAll();
    const active = all.filter(t => t.status === 'active');
    const finished = all.filter(t => t.status === 'finished');
    return `
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div class="glass-panel" style="display:flex;justify-content:space-between;align-items:center;border-left:4px solid var(--accent-gold);">
          <div>
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('modes-hub')">⬅ Todos os Modos</button>
            <h2 style="font-size:1.5rem;font-weight:800;margin-top:8px;">🏆 Torneios</h2>
            <p style="color:var(--text-muted);font-size:0.85rem;">
              Organizador de competição com os pilotos e equipes já cadastrados. O motor de corrida continua o mesmo.
            </p>
          </div>
          <button class="btn btn-primary btn-lg" onclick="Tournament.openCreate()">+ Novo Torneio</button>
        </div>
        ${this.renderTournamentGrid(active, 'Em andamento')}
        ${this.renderTournamentGrid(finished, 'Finalizados')}
      </div>`;
  },

  renderTournamentGrid(list, title) {
    if (!list.length) {
      return `
        <div class="glass-panel">
          <h3 class="panel-title">${title}</h3>
          <p style="color:var(--text-dim);padding:16px 0;">Nenhum torneio nesta lista.</p>
        </div>`;
    }
    return `
      <div>
        <div class="db-section-title" style="margin-bottom:12px;">${title}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">
          ${list.map(t => this.renderSummaryCard(t, true)).join('')}
        </div>
      </div>`;
  },

  renderSummaryCard(t, withOpen) {
    const next = this.nextMatch(t);
    const prog = this.progress(t);
    const typeLabel = t.type === 'teams' ? 'Equipes' : 'Pilotos';
    const nextNames = next
      ? `${this.liveName(t, next.participantAId)} × ${this.liveName(t, next.participantBId)}`
      : t.status === 'finished'
        ? `Campeão: ${this.liveName(t, t.championId)}`
        : 'Aguardando chave';
    const track = next ? Storage.getTracks().find(tr => tr.id === (next.trackId || t.trackId)) : null;
    return `
      <div class="glass-panel db-tournament-card" style="padding:16px;border-top:3px solid var(--accent-gold);">
        <div style="font-weight:800;font-size:1.05rem;">${Utils.escapeHtml(t.name)}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin:4px 0 10px;">
          ${typeLabel} • ${Utils.escapeHtml(t.seasonName || ('Temporada ' + t.seasonYear))}
          • ${t.participantIds.length} participantes
        </div>
        <div style="font-size:0.82rem;margin-bottom:6px;">Fase: <strong>${this.currentPhase(t)}</strong></div>
        <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:8px;">
          ${t.status === 'finished' ? '🏆 ' : 'Próximo confronto:<br>'}
          <strong style="color:var(--text-main);">${Utils.escapeHtml(nextNames)}</strong>
        </div>
        ${track ? `<div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:8px;">Pista: ${Utils.escapeHtml(track.name)}</div>` : ''}
        <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;margin-bottom:10px;">
          <div style="height:100%;width:${prog.pct}%;background:var(--accent-gold);"></div>
        </div>
        ${withOpen ? `<button class="btn btn-primary btn-sm" style="width:100%;justify-content:center;" onclick="Tournament.open('${t.id}')">ABRIR TORNEIO</button>` : ''}
      </div>`;
  },

  renderCreate() {
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const tracks = Storage.getTracks();
    const isTeams = this.draft.type === 'teams';
    const pool = isTeams ? teams : drivers;
    return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="glass-panel">
          <button class="btn btn-secondary btn-sm" onclick="Tournament.openList()">⬅ Voltar</button>
          <h2 style="margin-top:10px;">Novo Torneio</h2>
          <p style="color:var(--text-muted);font-size:0.85rem;">Os participantes são os cadastros reais. Nenhum piloto ou equipe paralelo é criado.</p>
        </div>
        <div class="glass-panel">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Nome</label>
              <input class="form-input" value="${Utils.escapeHtml(this.draft.name)}" onchange="Tournament.setDraftField('name', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Modalidade</label>
              <select class="form-select" onchange="Tournament.setDraftField('type', this.value)">
                <option value="drivers" ${!isTeams ? 'selected' : ''}>Pilotos</option>
                <option value="teams" ${isTeams ? 'selected' : ''}>Equipes</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Pista padrão dos confrontos</label>
              <select class="form-select" onchange="Tournament.setDraftField('trackId', this.value)">
                ${tracks.map(tr => `<option value="${tr.id}" ${tr.id === this.draft.trackId ? 'selected' : ''}>${Utils.escapeHtml(tr.name)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Voltas</label>
              <input type="number" class="form-input" min="3" max="30" value="${this.draft.laps}" onchange="Tournament.setDraftField('laps', this.value)">
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label class="form-label">Formato</label>
              <select class="form-select" onchange="Tournament.setDraftField('format', this.value)">
                <option value="auto" ${this.draft.format === 'auto' ? 'selected' : ''}>Automático (mata-mata se 2/4/8/16; senão grupos)</option>
                <option value="knockout">Mata-mata</option>
                <option value="groups">Somente grupos</option>
                <option value="groups_knockout">Grupos + mata-mata</option>
              </select>
            </div>
          </div>
        </div>
        <div class="glass-panel">
          <div class="panel-header">
            <h3 class="panel-title">Participantes cadastrados (${this.draft.participantIds.length})</h3>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow:auto;">
            ${pool.map(item => {
              const checked = this.draft.participantIds.includes(item.id);
              if (isTeams) {
                const roster = drivers.filter(d => d.teamId === item.id);
                return `
                  <label class="glass-panel" style="padding:10px 12px;display:flex;gap:10px;align-items:center;cursor:pointer;">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="Tournament.toggleDraftParticipant('${item.id}')">
                    <span>${item.logo || '🏎️'}</span>
                    <div>
                      <strong style="color:${item.color};">${Utils.escapeHtml(item.name)}</strong>
                      <div style="font-size:0.75rem;color:var(--text-dim);">${roster.map(d => d.name).join(', ') || 'Sem pilotos'}</div>
                    </div>
                  </label>`;
              }
              const team = teams.find(tm => tm.id === item.teamId);
              const a = item.attributes || {};
              return `
                <label class="glass-panel" style="padding:10px 12px;display:flex;gap:10px;align-items:center;cursor:pointer;">
                  <input type="checkbox" ${checked ? 'checked' : ''} onchange="Tournament.toggleDraftParticipant('${item.id}')">
                  <div>
                    <strong>${Utils.getCountryFlag(item.nationality)} #${item.number} ${Utils.escapeHtml(item.name)}</strong>
                    <div style="font-size:0.75rem;color:var(--text-dim);">
                      ${Utils.escapeHtml(team?.name || '—')} · Vel ${a.speed} · Acel ${a.acceleration} · Ctrl ${a.control} · Cons ${a.consistency} · Fren ${a.braking ?? 75}
                    </div>
                  </div>
                </label>`;
            }).join('')}
          </div>
          <div class="modal-footer" style="margin-top:16px;">
            <button class="btn btn-secondary" onclick="Tournament.openList()">Cancelar</button>
            <button class="btn btn-primary" onclick="Tournament.createFromDraft()">Gerar chave e iniciar</button>
          </div>
        </div>
      </div>`;
  },

  renderDetail(id) {
    const t = this.getById(id);
    if (!t) return `<div class="glass-panel">Torneio não encontrado. <button class="btn btn-primary" onclick="Tournament.openList()">Voltar</button></div>`;
    const next = this.nextMatch(t);
    const prog = this.progress(t);
    const typeLabel = t.type === 'teams' ? 'Equipes' : 'Pilotos';
    const champion = t.championId ? this.liveName(t, t.championId) : null;

    return `
      <div style="display:flex;flex-direction:column;gap:18px;">
        <div class="glass-panel" style="border-left:4px solid var(--accent-gold);">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div>
              <button class="btn btn-secondary btn-sm" onclick="Tournament.openList()">⬅ Torneios</button>
              <h2 style="margin-top:8px;">${Utils.escapeHtml(t.name)}</h2>
              <p style="color:var(--text-muted);font-size:0.85rem;">
                ${typeLabel} • ${Utils.escapeHtml(t.seasonName || '')} • ${t.participantIds.length} participantes
                • Fase: <strong>${this.currentPhase(t)}</strong>
              </p>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start;">
              ${next ? `<button class="btn btn-primary" onclick="Tournament.startMatch('${t.id}','${next.id}')">INICIAR CONFRONTO</button>` : ''}
              <button class="btn btn-danger btn-sm" onclick="Tournament.deleteTournament('${t.id}')">Remover</button>
            </div>
          </div>
          <div style="margin-top:10px;font-size:0.8rem;color:var(--text-dim);">
            Progresso: ${prog.done}/${prog.total} confrontos (${prog.pct}%)
          </div>
          ${champion ? `<div style="margin-top:10px;color:var(--accent-gold);font-weight:800;">🏆 Campeão: ${Utils.escapeHtml(champion)}</div>` : ''}
        </div>

        <div class="glass-panel">
          <h3 class="panel-title">Participantes (cadastro ao vivo)</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-top:12px;">
            ${t.participantIds.map(pid => `
              <div class="glass-panel" style="padding:10px;">${this.renderEntityChip(t, pid)}</div>
            `).join('')}
          </div>
        </div>

        ${t.groups?.length ? this.renderGroups(t) : ''}
        ${this.renderMatches(t)}
      </div>`;
  },

  renderGroups(t) {
    return `
      <div class="glass-panel">
        <h3 class="panel-title">Fase de grupos</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-top:12px;">
          ${t.groups.map(g => {
            const rows = [...g.standings].sort((a, b) => (b.points - a.points) || (b.racePoints - a.racePoints));
            return `
              <div class="glass-panel" style="padding:12px;">
                <strong>${Utils.escapeHtml(g.name)}</strong>
                <table class="data-table" style="margin-top:8px;">
                  <thead><tr><th>#</th><th>Participante</th><th>Pts</th><th>J</th></tr></thead>
                  <tbody>
                    ${rows.map((row, i) => `
                      <tr>
                        <td>${i + 1}</td>
                        <td>${Utils.escapeHtml(this.liveName(t, row.participantId))}</td>
                        <td><strong>${row.points}</strong></td>
                        <td>${row.played}</td>
                      </tr>`).join('')}
                  </tbody>
                </table>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  },

  renderMatches(t) {
    const phases = [];
    (t.matches || []).forEach(m => {
      if (!phases.includes(m.phase)) phases.push(m.phase);
    });
    const tracks = Storage.getTracks();

    return `
      <div class="glass-panel">
        <div class="tournament-bracket-heading">
          <h3 class="panel-title">Chaveamento do torneio</h3>
          <span class="tournament-bracket-hint">Deslize horizontalmente para acompanhar as próximas fases</span>
        </div>
        <div class="tournament-bracket-scroll" tabindex="0" aria-label="Chaveamento horizontal do torneio">
          <div class="tournament-bracket">
            ${phases.map((phase, phaseIndex) => `
              <section class="tournament-bracket-phase">
                <header class="tournament-bracket-phase-header">
                  <span class="tournament-bracket-phase-index">${String(phaseIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>${Utils.escapeHtml(this.phaseLabel(phase))}</h4>
                    <span>${t.matches.filter(match => match.phase === phase).length} confrontos</span>
                  </div>
                </header>
                <div class="tournament-bracket-match-list">
                  ${t.matches.filter(match => match.phase === phase).map((match, matchIndex) => {
                    const ready = match.participantAId && match.participantBId && match.status !== 'completed';
                    const winnerId = match.winnerId || match.result?.winnerId;
                    const track = tracks.find(item => item.id === (match.trackId || t.trackId));
                    const qualifyTrack = tracks.find(item => item.id === (match.qualifyTrackId || match.trackId || t.trackId));
                    const renderSide = (participantId, side) => {
                      if (!participantId) {
                        return `<div class="tournament-bracket-side is-pending"><span class="tournament-bracket-identity">?</span><span>A definir</span></div>`;
                      }
                      const isTeam = t.type === 'teams';
                      const entity = isTeam ? this.liveTeam(participantId) : this.liveDriver(participantId);
                      const identity = isTeam ? (entity?.logo || '🏎️') : `#${entity?.number || '—'}`;
                      const isWinner = winnerId === participantId;
                      return `
                        <div class="tournament-bracket-side ${isWinner ? 'is-winner' : ''}">
                          <span class="tournament-bracket-identity">${Utils.escapeHtml(String(identity))}</span>
                          <span class="tournament-bracket-name">${Utils.escapeHtml(this.liveName(t, participantId))}</span>
                          ${isWinner ? '<span class="tournament-bracket-winner-mark">V</span>' : ''}
                          <span class="tournament-bracket-side-label">${side}</span>
                        </div>
                      `;
                    };

                    return `
                      <article class="tournament-bracket-match ${match.status === 'completed' ? 'is-complete' : ''}">
                        <div class="tournament-bracket-match-top">
                          <span>CONFRONTO ${matchIndex + 1}</span>
                          <span class="tournament-bracket-match-status">${match.status === 'completed' ? 'Finalizado' : ready ? 'Pronto' : 'Aguardando'}</span>
                        </div>
                        ${renderSide(match.participantAId, 'A')}
                        <div class="tournament-bracket-versus">VS</div>
                        ${renderSide(match.participantBId, 'B')}
                        <div class="tournament-bracket-match-meta">
                          <span>Q: ${qualifyTrack ? Utils.escapeHtml(qualifyTrack.name) : 'Pista'} · ${match.qualifyLaps || 5} voltas</span>
                          <span>GP: ${track ? Utils.escapeHtml(track.name) : 'Pista'} · ${match.laps || t.laps || track?.defaultLaps || 10} voltas</span>
                        </div>
                        <div class="tournament-bracket-match-actions">
                          ${ready ? `<button class="btn btn-primary btn-sm" onclick="Tournament.startMatch('${t.id}','${match.id}')">INICIAR CONFRONTO</button>` : ''}
                          ${match.status === 'completed' ? `<button class="btn btn-secondary btn-sm" onclick="Tournament.viewMatchHistory('${t.id}','${match.id}')">Ver resultado</button>` : ''}
                        </div>
                      </article>
                    `;
                  }).join('')}
                </div>
              </section>
            `).join('')}
          </div>
        </div>
      </div>`;
  }
};
