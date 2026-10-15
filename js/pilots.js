/* ==========================================================================
   RACE SIMULATOR - DRIVERS CRUD MODULE (js/pilots.js)
   ========================================================================== */

const Pilots = {
  searchTerm: '',
  renderList() {
    const allDrivers = Storage.getDrivers();
    const query = this.searchTerm.trim().toLowerCase();
    const drivers = allDrivers.filter(driver => !query || `${driver.name} ${driver.code} ${driver.number}`.toLowerCase().includes(query));
    const teams = Storage.getTeams();
    const season = Storage.getCurrentSeason();

    return `
      <div class="glass-panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">👤 Gestão de Pilotos</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
              Cadastre atributos, números oficiais, equipes e visualize estatísticas completas.
            </p>
          </div>
          <button class="btn btn-primary" onclick="Pilots.openModal()">+ Novo Piloto</button>
        </div>

        <input class="form-input" style="margin-top: 16px;" placeholder="Pesquisar piloto por nome, sigla ou número..." value="${Utils.escapeHtml(this.searchTerm)}" oninput="Pilots.filter(this.value)">

        <div class="grid-auto" style="margin-top: 20px;">
          ${drivers.map(driver => {
            const team = teams.find(t => t.id === driver.teamId) || { name: 'Sem Equipe', color: '#64748b' };
            const driverDivId = team.divisionId || 'div_a';
            const driverSeason = Storage.getCurrentSeason(driverDivId);
            const seasonPoints = driverSeason ? (driverSeason.standings?.find(s => s.driverId === driver.id)?.points || 0) : 0;
            const rank = Ranks.getRankForPoints(seasonPoints);
            return `
              <div class="driver-card" data-search="${Utils.escapeHtml(`${driver.name} ${driver.code} ${driver.number}`)}" style="--card-team-color: ${driver.color || team.color};">
                <div class="driver-header">
                  <div class="driver-avatar" style="border-color: ${driver.color || team.color};">
                    ${driver.avatar ? `<img src="${driver.avatar}" alt="${driver.name}">` : `#${driver.number}`}
                  </div>
                  <div class="driver-info">
                    <div class="driver-name">
                      ${Utils.escapeHtml(driver.name)}
                      <span>${Utils.getCountryFlag(driver.nationality)}</span>
                    </div>
                    <div class="driver-team-tag">
                      ${Utils.escapeHtml(team.name)} • <span style="font-family: var(--font-mono); font-weight: bold;">${driver.code || 'DRV'}</span>
                    </div>
                  </div>
                </div>

                <!-- Rank Progress -->
                <div>
                  ${Ranks.renderProgressBar(seasonPoints)}
                </div>

                <!-- Attributes breakdown -->
                <div class="attribute-bars">
                  <div class="attribute-item">
                    <div class="attribute-label">
                      <span>Velocidade</span>
                      <span>${driver.attributes.speed}</span>
                    </div>
                    <div class="attribute-bar-bg">
                      <div class="attribute-bar-val" style="width: ${driver.attributes.speed}%;"></div>
                    </div>
                  </div>
                  <div class="attribute-item">
                    <div class="attribute-label">
                      <span>Aceleração</span>
                      <span>${driver.attributes.acceleration}</span>
                    </div>
                    <div class="attribute-bar-bg">
                      <div class="attribute-bar-val" style="width: ${driver.attributes.acceleration}%; background: var(--accent-gold);"></div>
                    </div>
                  </div>
                  <div class="attribute-item">
                    <div class="attribute-label">
                      <span>Controle</span>
                      <span>${driver.attributes.control}</span>
                    </div>
                    <div class="attribute-bar-bg">
                      <div class="attribute-bar-val" style="width: ${driver.attributes.control}%; background: var(--accent-green);"></div>
                    </div>
                  </div>
                    <div class="attribute-item">
                      <div class="attribute-label">
                        <span>Frenagem</span>
                        <span>${driver.attributes.braking ?? 75}</span>
                      </div>
                      <div class="attribute-bar-bg">
                        <div class="attribute-bar-val" style="width: ${driver.attributes.braking ?? 75}%; background: var(--accent-red);"></div>
                      </div>
                    </div>
                  <div class="attribute-item">
                    <div class="attribute-label">
                      <span>Constância</span>
                      <span>${driver.attributes.consistency}</span>
                    </div>
                    <div class="attribute-bar-bg">
                      <div class="attribute-bar-val" style="width: ${driver.attributes.consistency}%; background: var(--accent-purple);"></div>
                    </div>
                  </div>
                </div>

                <!-- Stats summary -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; background: rgba(0,0,0,0.25); padding: 8px; border-radius: var(--radius-sm); font-size: 0.75rem;">
                  <div>
                    <div style="color: var(--text-dim);">Vitórias</div>
                    <strong style="font-size: 0.95rem;">${driver.stats.wins || 0}</strong>
                  </div>
                  <div>
                    <div style="color: var(--text-dim);">Pódios</div>
                    <strong style="font-size: 0.95rem;">${driver.stats.podiums || 0}</strong>
                  </div>
                  <div>
                    <div style="color: var(--text-dim);">Corridas</div>
                    <strong style="font-size: 0.95rem;">${driver.stats.races || 0}</strong>
                  </div>
                </div>

                <!-- Actions -->
                <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-color);">
                  <button class="btn btn-primary btn-sm" style="flex: 1.2;" onclick="Pilots.openProfileModal('${driver.id}')">👤 Ver Perfil</button>
                  <button class="btn btn-secondary btn-sm" onclick="Pilots.openModal('${driver.id}')">Editar</button>
                  <button class="btn btn-danger btn-sm" onclick="Pilots.deleteDriver('${driver.id}')">✕</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  openModal(driverId = null) {
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const driver = driverId ? drivers.find(d => d.id === driverId) : {
      id: '',
      name: '',
      code: '',
      number: 1,
      nationality: 'Brasil',
      teamId: teams[0]?.id || '',
      color: '#00e5ff',
      avatar: '',
      attributes: { speed: 85, acceleration: 85, control: 85, braking: 85, consistency: 85 }
    };

    const isEdit = !!driverId;
    const modalHtml = `
      <div class="modal-backdrop active" id="driver-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${isEdit ? 'Editar Piloto' : 'Criar Novo Piloto'}</h3>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('driver-modal')">✕</button>
          </div>
          <form id="driver-form" onsubmit="Pilots.saveForm(event)">
            <input type="hidden" id="driver-id" value="${driver.id}">
            <div class="modal-body">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Nome Completo</label>
                  <input type="text" id="driver-name" class="form-input" required value="${Utils.escapeHtml(driver.name)}" placeholder="Ex: Ayrton Senna">
                </div>
                <div class="form-group">
                  <label class="form-label">Sigla (3 Letras)</label>
                  <input type="text" id="driver-code" class="form-input" maxlength="3" required value="${Utils.escapeHtml(driver.code || '')}" placeholder="Ex: SEN">
                </div>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label class="form-label">Número do Carro</label>
                  <input type="number" id="driver-number" class="form-input" required min="1" max="99" value="${driver.number}">
                </div>
                <div class="form-group" style="grid-column: span 2;">
                  <label class="form-label">Nacionalidade</label>
                  <div class="nationality-picker-wrap">
                    <div class="nationality-flag-preview" id="nat-flag-preview">
                      ${Utils.getCountryFlag(driver.nationality)}
                    </div>
                    <select id="driver-nationality" class="form-select nationality-select"
                      onchange="Pilots._onNationalityChange(this.value)"
                      required>
                      <option value="">— Selecione o país —</option>
                      ${Utils.getCountryList().map(c => `
                        <option value="${Utils.escapeHtml(c.name)}"
                          data-code="${c.code}"
                          ${driver.nationality === c.name ? 'selected' : ''}>
                          ${Utils.getCountryFlagText(c.name)} ${Utils.escapeHtml(c.name)}
                        </option>
                      `).join('')}
                    </select>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Equipe</label>
                <select id="driver-team" class="form-select">
                  ${teams.map(t => `<option value="${t.id}" ${driver.teamId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                </select>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Cor Customizada (HEX)</label>
                  <input type="color" id="driver-color" class="form-input" style="height: 44px; padding: 4px;" value="${driver.color || '#00e5ff'}">
                </div>
                <div class="form-group">
                  <label class="form-label">URL da Foto / Avatar</label>
                  <input type="text" id="driver-avatar" class="form-input" value="${Utils.escapeHtml(driver.avatar || '')}" placeholder="Opcional: https://...">
                </div>
              </div>

              <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--accent-cyan); margin: 16px 0 12px; letter-spacing: 0.5px;">
                Atributos de Performance (0 a 100)
              </h4>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Velocidade (Retas): <span id="val-speed">${driver.attributes.speed}</span></label>
                  <input type="range" id="attr-speed" class="form-input" min="50" max="99" value="${driver.attributes.speed}" oninput="document.getElementById('val-speed').textContent = this.value">
                </div>
                <div class="form-group">
                  <label class="form-label">Aceleração (Saídas): <span id="val-accel">${driver.attributes.acceleration}</span></label>
                  <input type="range" id="attr-accel" class="form-input" min="50" max="99" value="${driver.attributes.acceleration}" oninput="document.getElementById('val-accel').textContent = this.value">
                </div>
                <div class="form-group">
                  <label class="form-label">Controle (Curvas): <span id="val-ctrl">${driver.attributes.control}</span></label>
                  <input type="range" id="attr-ctrl" class="form-input" min="50" max="99" value="${driver.attributes.control}" oninput="document.getElementById('val-ctrl').textContent = this.value">
                </div>
                <div class="form-group">
                  <label class="form-label">Frenagem (Curvas): <span id="val-braking">${driver.attributes.braking ?? 75}</span></label>
                  <input type="range" id="attr-braking" class="form-input" min="50" max="99" value="${driver.attributes.braking ?? 75}" oninput="document.getElementById('val-braking').textContent = this.value">
                </div>
                <div class="form-group">
                  <label class="form-label">Constância (RNG): <span id="val-const">${driver.attributes.consistency}</span></label>
                  <input type="range" id="attr-const" class="form-input" min="50" max="99" value="${driver.attributes.consistency}" oninput="document.getElementById('val-const').textContent = this.value">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal('driver-modal')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Piloto</button>
            </div>
          </form>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
  },

  // Atualiza o preview de bandeira quando o select de país muda
  _onNationalityChange(countryName) {
    const preview = document.getElementById('nat-flag-preview');
    if (!preview) return;
    if (!countryName) {
      preview.innerHTML = '<span class="nat-flag-empty">🌍</span>';
      return;
    }
    preview.innerHTML = Utils.getCountryFlag(countryName);
    // Anima a troca
    preview.style.transform = 'scale(0.7)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { preview.style.transform = ''; });
    });
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
    const id = document.getElementById('driver-id').value;
    const name = document.getElementById('driver-name').value.trim();
    const code = document.getElementById('driver-code').value.trim().toUpperCase() || name.substring(0, 3).toUpperCase();
    const number = parseInt(document.getElementById('driver-number').value, 10);
    const nationality = document.getElementById('driver-nationality').value.trim();
    const teamId = document.getElementById('driver-team').value;
    const color = document.getElementById('driver-color').value;
    const avatar = document.getElementById('driver-avatar').value.trim();

    const attributes = {
      speed: parseInt(document.getElementById('attr-speed').value, 10),
      acceleration: parseInt(document.getElementById('attr-accel').value, 10),
      control: parseInt(document.getElementById('attr-ctrl').value, 10),
      braking: parseInt(document.getElementById('attr-braking').value, 10),
      consistency: parseInt(document.getElementById('attr-const').value, 10)
    };

    let drivers = Storage.getDrivers();
    if (id) {
      drivers = drivers.map(d => d.id === id ? { ...d, name, code, number, nationality, teamId, color, avatar, attributes } : d);
    } else {
      const newDriver = {
        id: Utils.generateId('drv'),
        name,
        code,
        number,
        nationality,
        teamId,
        color,
        avatar,
        attributes,
        stats: { races: 0, wins: 0, podiums: 0, poles: 0, points: 0, bestLapTime: null, bestFinish: null }
      };
      drivers.push(newDriver);

      // Add to current season standings
      const seasons = Storage.getSeasons();
      seasons.forEach(s => {
        if (!s.standings.find(st => st.driverId === newDriver.id)) {
          s.standings.push({
            driverId: newDriver.id,
            points: 0,
            wins: 0,
            podiums: 0,
            poles: 0,
            fastestLaps: 0,
            currentRankId: 'rank_bronze'
          });
        }
      });
      Storage.saveSeasons(seasons);
    }

    Storage.saveDrivers(drivers);
    App.closeModal('driver-modal');
    App.navigateTo('drivers');
  },

  deleteDriver(id) {
    if (confirm('Tem certeza que deseja excluir este piloto?')) {
      let drivers = Storage.getDrivers();
      drivers = drivers.filter(d => d.id !== id);
      Storage.saveDrivers(drivers);
      App.navigateTo('drivers');
    }
  },

  openProfileModal(driverId) {
    this.activeProfileId = driverId;
    this.activeProfileSeasonId = null;
    this.activeProfilePageTab = 'overview';
    App.navigateTo('driver-profile');
    return;
    /* Legacy modal markup retained below for compatibility with old saved views. */
    /*
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const season = Storage.getCurrentSeason();
    const history = Storage.getHistory();
    const rankedStandings = Storage.getRankedStandings();
    const timeTrials = Storage.getBestTimeTrials();

    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    const team = teams.find(t => t.id === driver.teamId) || { name: 'Sem Equipe', color: '#00e5ff', logo: '🏎️' };
    const seasonPoints = season ? (season.standings.find(s => s.driverId === driver.id)?.points || 0) : 0;
    const rank = Ranks.getRankForPoints(seasonPoints);
    const rankedData = rankedStandings.find(s => s.driverId === driver.id) || { rating: 1200, tier: 'Bronze', matches: 0, wins: 0 };
    const driverTrials = timeTrials.filter(t => t.driverId === driver.id);

    const overallAttr = Math.round((driver.attributes.speed + driver.attributes.acceleration + driver.attributes.control + (driver.attributes.braking ?? 75) + driver.attributes.consistency) / 5);
    const winRate = driver.stats.races > 0 ? ((driver.stats.wins / driver.stats.races) * 100).toFixed(1) : '0.0';
    const podiumRate = driver.stats.races > 0 ? ((driver.stats.podiums / driver.stats.races) * 100).toFixed(1) : '0.0';

    // Recent results in history
    const recentRaces = [];
    history.forEach(h => {
      const res = h.results?.find(r => r.driverId === driver.id);
      if (res) {
        recentRaces.push({
          date: h.date,
          gpName: h.gpName,
          pos: res.position,
          points: res.points,
          bestLapMs: res.bestLapMs
        });
      }
    });

    const modalHtml = `
      <div class="modal-backdrop active" id="driver-profile-modal">
        <div class="modal-content" style="max-width: 780px; max-height: 90vh; overflow-y: auto;">
          <div class="modal-header" style="border-bottom: 2px solid ${driver.color || team.color};">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div class="driver-avatar" style="width: 56px; height: 56px; font-size: 1.5rem; border-color: ${driver.color || team.color}; background: ${driver.color || team.color}20;">
                ${driver.avatar ? `<img src="${driver.avatar}">` : `#${driver.number}`}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h3 style="font-size: 1.4rem; margin: 0;">${Utils.escapeHtml(driver.name)}</h3>
                  <span style="font-size: 1.2rem;">${Utils.getCountryFlag(driver.nationality)}</span>
                  <span class="badge" style="background: ${driver.color || team.color}; color: #000; font-weight: 800;">#${driver.number} ${driver.code}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                  Escuderia: <strong style="color: #fff;">${Utils.escapeHtml(team.name)}</strong> • OVR Geral: <strong style="color: var(--accent-cyan);">${overallAttr}</strong>
                </div>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('driver-profile-modal')">✕</button>
          </div>

          <div class="modal-body" style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Ranks & Tiers Banner -->
            <div class="grid-2">
              <div class="glass-panel" style="padding: 12px;">
                <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
                  Rank de Temporada
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div>${Ranks.renderBadge(rank)}</div>
                  <strong style="font-size: 1.2rem; font-family: var(--font-mono); color: var(--accent-cyan);">${seasonPoints} Pts</strong>
                </div>
                <div style="margin-top: 8px;">
                  ${Ranks.renderProgressBar(seasonPoints)}
                </div>
              </div>

              <div class="glass-panel" style="padding: 12px;">
                <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
                  Competitivo Ranqueado (MMR)
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span class="badge" style="background: rgba(139, 92, 246, 0.2); color: var(--accent-purple); border: 1px solid var(--accent-purple); font-weight: 800;">
                    🎖️ ${rankedData.tier} (${rankedData.rating} MMR)
                  </span>
                  <span style="font-size: 0.8rem; color: var(--text-dim);">${rankedData.matches || 0} Partidas</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 10px;">
                  Pico de Rating: <strong>${rankedData.peakRating || rankedData.rating} MMR</strong>
                </div>
              </div>
            </div>

            <!-- Estatísticas Gerais de Carreira Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
              <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 0.75rem; color: var(--text-dim);">Corridas</div>
                <strong style="font-size: 1.3rem; font-family: var(--font-mono);">${driver.stats.races || 0}</strong>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 0.75rem; color: var(--accent-gold);">Vitórias</div>
                <strong style="font-size: 1.3rem; font-family: var(--font-mono); color: var(--accent-gold);">${driver.stats.wins || 0}</strong>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 0.75rem; color: var(--accent-cyan);">Pódios</div>
                <strong style="font-size: 1.3rem; font-family: var(--font-mono); color: var(--accent-cyan);">${driver.stats.podiums || 0}</strong>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 0.75rem; color: var(--accent-green);">Pole Positions</div>
                <strong style="font-size: 1.3rem; font-family: var(--font-mono); color: var(--accent-green);">${driver.stats.poles || 0}</strong>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 0.75rem; color: var(--text-dim);">Aproveitamento</div>
                <strong style="font-size: 1.1rem; font-family: var(--font-mono);">${winRate}% Vit.</strong>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 0.75rem; color: var(--text-dim);">Taxa Pódios</div>
                <strong style="font-size: 1.1rem; font-family: var(--font-mono);">${podiumRate}%</strong>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 0.75rem; color: var(--text-dim);">Melhor Chegada</div>
                <strong style="font-size: 1.1rem; font-family: var(--font-mono);">${driver.stats.bestFinish ? 'P' + driver.stats.bestFinish : 'N/A'}</strong>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm);">
                <div style="font-size: 0.75rem; color: var(--text-dim);">Melhor Volta</div>
                <strong style="font-size: 0.9rem; font-family: var(--font-mono); color: var(--accent-purple);">${driver.stats.bestLapTime ? Utils.formatTime(driver.stats.bestLapTime) : 'N/A'}</strong>
              </div>
            </div>

            <!-- Atributos Técnicos Detalhados -->
            <div class="glass-panel" style="padding: 16px;">
              <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--accent-cyan); margin-bottom: 12px;">
                Atributos e Competências Técnicas (0 a 100)
              </h4>
              <div class="grid-2">
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                    <span>⚡ Velocidade Final (Top Speed)</span>
                    <strong>${driver.attributes.speed}</strong>
                  </div>
                  <div class="attribute-bar-bg"><div class="attribute-bar-val" style="width: ${driver.attributes.speed}%;"></div></div>
                </div>
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                    <span>🚀 Aceleração e Saídas</span>
                    <strong>${driver.attributes.acceleration}</strong>
                  </div>
                  <div class="attribute-bar-bg"><div class="attribute-bar-val" style="width: ${driver.attributes.acceleration}%; background: var(--accent-gold);"></div></div>
                </div>
                <div style="margin-top: 10px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                    <span>🎯 Controle e Tangência</span>
                    <strong>${driver.attributes.control}</strong>
                  </div>
                  <div class="attribute-bar-bg"><div class="attribute-bar-val" style="width: ${driver.attributes.control}%; background: var(--accent-green);"></div></div>
                </div>
                <div style="margin-top: 10px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                    <span>🛑 Frenagem nas Curvas</span>
                    <strong>${driver.attributes.braking ?? 75}</strong>
                  </div>
                  <div class="attribute-bar-bg"><div class="attribute-bar-val" style="width: ${driver.attributes.braking ?? 75}%; background: var(--accent-red);"></div></div>
                </div>
                <div style="margin-top: 10px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                    <span>🛡️ Constância e Regularidade</span>
                    <strong>${driver.attributes.consistency}</strong>
                  </div>
                  <div class="attribute-bar-bg"><div class="attribute-bar-val" style="width: ${driver.attributes.consistency}%; background: var(--accent-purple);"></div></div>
                </div>
              </div>
            </div>

            ${this.renderActivityHistory(driver.id, history, driverTrials)}
            <div style="display: none;">
              <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
                Histórico Recente em GPs
              </h4>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>GP</th>
                      <th>Posição</th>
                      <th>Pontos</th>
                      <th>Melhor Volta</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentRaces.slice(0, 5).map(r => `
                      <tr>
                        <td>${r.date}</td>
                        <td><strong>${Utils.escapeHtml(r.gpName)}</strong></td>
                        <td><strong style="color: ${r.pos === 1 ? 'var(--accent-gold)' : r.pos <= 3 ? 'var(--accent-cyan)' : '#fff'};">P${r.pos}</strong></td>
                        <td>${r.points}</td>
                        <td style="font-family: var(--font-mono);">${Utils.formatTime(r.bestLapMs)}</td>
                      </tr>
                    `).join('')}
                    ${recentRaces.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 12px;">Nenhuma corrida registrada na temporada.</td></tr>' : ''}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="App.closeModal('driver-profile-modal')">Fechar Perfil</button>
            <button class="btn btn-primary" onclick="App.closeModal('driver-profile-modal'); Pilots.openModal('${driver.id}');">Editar Piloto</button>
          </div>
        </div>
      </div>
    `;
    App.showModal(modalHtml); */
  },

  activeProfileTab: 'all',
  activeProfileSeasonId: null,
  activeProfilePageTab: 'overview',

  switchProfileTab(tab) {
    this.activeProfileTab = tab;
    App.navigateTo('driver-profile');
  },

  setProfileSeasonTab(seasonId) {
    this.activeProfileSeasonId = seasonId;
    App.navigateTo('driver-profile');
  },

  setProfilePageTab(tab) {
    this.activeProfilePageTab = tab;
    App.navigateTo('driver-profile');
  },

  renderProfileSeasonHistory(driver, seasons, history, teams) {
    if (seasons.length === 0) {
      return `<section class="profile-panel profile-panel-full">
        <div class="profile-panel-header"><h3>📅 Histórico por Temporada</h3></div>
        <div style="padding:20px;text-align:center;color:var(--text-dim);">Nenhuma temporada registrada para este piloto.</div>
      </section>`;
    }

    // Agrupa seasons por ano — cada aba = um ano
    const byYear = new Map();
    seasons.forEach(s => {
      const yr = s.year || '—';
      if (!byYear.has(yr)) byYear.set(yr, []);
      byYear.get(yr).push(s);
    });
    const sortedYears = Array.from(byYear.keys()).sort((a, b) => b - a);

    // Descobre qual aba está ativa
    let selectedSeason = seasons.find(s => s.id === this.activeProfileSeasonId);
    if (!selectedSeason) selectedSeason = seasons.find(s => s.status === 'active') || seasons[0];
    const selectedYear = selectedSeason.year || sortedYears[0];

    // Dentro do ano selecionado, pega a season do piloto
    const yearGroup = byYear.get(selectedYear) || [selectedSeason];
    const activeSeason = yearGroup.find(s => s.id === selectedSeason.id) ||
      yearGroup.find(s => s.status === 'active') ||
      yearGroup.find(s =>
      s.standings?.some(st => st.driverId === driver.id) ||
      s.driverIds?.includes(driver.id)
    ) || yearGroup[0];

    const standing     = activeSeason.standings?.find(item => item.driverId === driver.id);
    const archivedRecord = driver.seasonHistory?.find(item => item.seasonId === activeSeason.id);
    const teamSnapshot = activeSeason.teamSnapshots?.find(item => item.driverIds?.includes(driver.id));
    const divisions    = Storage.getDivisions();
    const activeDivision = divisions.find(d => d.id === activeSeason.divisionId) || divisions[0];

    const gpRows = (activeSeason.races || []).map(gp => {
      const race = history.find(item => item.gpId === gp.id);
      const result = race?.results?.find(item => item.driverId === driver.id);
      const trackName = race?.trackName || Storage.getTracks().find(track => track.id === gp.trackId)?.name || '—';
      return { gp, race, result, trackName };
    });
    const recordedResults = gpRows.filter(row => row.result);

    // Calcula stats direto do histórico (sempre disponível, independente do recalc)
    const calcFromRows = {
      points: recordedResults.reduce((sum, row) => {
        const v = row.result.points;
        return sum + (typeof v === 'string' ? parseFloat(v.replace(/[^\d.-]/g, '')) || 0 : v || 0);
      }, 0),
      wins:        recordedResults.filter(row => row.result.position === 1).length,
      podiums:     recordedResults.filter(row => row.result.position <= 3).length,
      poles:       recordedResults.filter(row => row.result.gridPos  === 1).length,
      fastestLaps: recordedResults.filter(row => row.race?.fastestLap?.driverId === driver.id).length
    };

    let points, wins, podiums, poles, fastestLaps;
    if (activeSeason.status === 'active') {
      // Season ativa: pega o maior entre standing ao vivo e o calculado dos gpRows
      // (garante que standing zerado mid-recalc não esconda dados reais)
      points      = Math.max(standing?.points      ?? 0, calcFromRows.points);
      wins        = Math.max(standing?.wins        ?? 0, calcFromRows.wins);
      podiums     = Math.max(standing?.podiums     ?? 0, calcFromRows.podiums);
      poles       = Math.max(standing?.poles       ?? 0, calcFromRows.poles);
      fastestLaps = Math.max(standing?.fastestLaps ?? 0, calcFromRows.fastestLaps);
    } else {
      // Season encerrada: standing recalculado > archivedRecord > gpRows
      points      = standing?.points      ?? archivedRecord?.points      ?? calcFromRows.points;
      wins        = standing?.wins        ?? archivedRecord?.wins        ?? calcFromRows.wins;
      podiums     = standing?.podiums     ?? archivedRecord?.podiums     ?? calcFromRows.podiums;
      poles       = standing?.poles       ?? archivedRecord?.poles       ?? calcFromRows.poles;
      fastestLaps = standing?.fastestLaps ?? archivedRecord?.fastestLaps ?? calcFromRows.fastestLaps;
    }

    const movement = teamSnapshot?.status || archivedRecord?.divisionChange || 'stayed';
    const nextDivisionName = teamSnapshot?.nextDivisionName || archivedRecord?.nextDivisionName;
    const movementLabel = movement === 'promoted'
      ? `⬆️ Promovido para ${Utils.escapeHtml(nextDivisionName || 'série superior')}`
      : movement === 'relegated'
        ? `⬇️ Rebaixado para ${Utils.escapeHtml(nextDivisionName || 'série inferior')}`
        : '';

    const uniqueYears = sortedYears.length;

    return `
      <section class="profile-panel profile-panel-full">
        <div class="profile-panel-header">
          <div>
            <h3>📅 Histórico por Temporada</h3>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-top:3px;">Classificações e resultados do piloto em cada campeonato.</p>
          </div>
          <span class="badge" style="background:var(--bg-tertiary);">${uniqueYears} ${uniqueYears === 1 ? 'temporada' : 'temporadas'}</span>
        </div>

        <!-- Abas agrupadas por ano -->
        <div class="profile-tabs" style="margin-top:12px;">
          ${sortedYears.map(yr => {
            const group = byYear.get(yr) || [];
            const tabLabel = group[0]?.name || `Temporada ${yr}`;
            const isActive = yr === selectedYear;
            const tabSeason = group.find(s => s.status === 'active') ||
              group.find(s => s.teamSnapshots?.some(snapshot => snapshot.driverIds?.includes(driver.id))) ||
              group.find(s =>
              s.standings?.some(st => st.driverId === driver.id) ||
              s.driverIds?.includes(driver.id)
            ) || group[0];
            return `
              <button class="profile-tab-btn ${isActive ? 'active' : ''}"
                onclick="Pilots.setProfileSeasonTab('${tabSeason.id}')">
                ${Utils.escapeHtml(tabLabel)}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Cabeçalho da temporada selecionada com badge da série -->
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:16px;">
          <strong>${Utils.escapeHtml(activeSeason.name)}</strong>
          <span class="badge" style="background:${activeDivision.color}20;color:${activeDivision.color};border:1px solid ${activeDivision.color}50;font-weight:bold;">
            ${activeDivision.icon || '🏆'} ${Utils.escapeHtml(activeDivision.name)}
          </span>
          <span class="badge" style="background:${activeSeason.status === 'active' ? 'rgba(0,245,155,0.15)' : 'var(--bg-tertiary)'};color:${activeSeason.status === 'active' ? 'var(--accent-green)' : 'var(--text-muted)'};">
            ${activeSeason.status === 'active' ? 'Em andamento' : 'Encerrada'}
          </span>
          ${movementLabel ? `<span class="badge" style="background:${movement === 'promoted' ? 'rgba(0,245,155,0.15)' : 'rgba(255,51,102,0.15)'};color:${movement === 'promoted' ? 'var(--accent-green)' : 'var(--accent-red)'};">${movementLabel}</span>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-top:12px;">
          ${[
            { label: 'GPs',           value: recordedResults.length, color: 'var(--accent-cyan)' },
            { label: 'Pontos',        value: points,      color: 'var(--accent-purple)' },
            { label: 'Vitórias',      value: wins,        color: 'var(--accent-gold)' },
            { label: 'Pódios',        value: podiums,     color: 'var(--accent-cyan)' },
            { label: 'Poles',         value: poles,       color: 'var(--accent-green)' },
            { label: 'Voltas rápidas',value: fastestLaps, color: 'var(--accent-purple)' }
          ].map(item => `
            <div class="profile-stat-box"><span class="lbl">${item.label}</span><span class="val" style="color:${item.color};">${item.value}</span></div>
          `).join('')}
        </div>
        <div class="table-container" style="margin-top:14px;">
          <table class="data-table">
            <thead><tr><th>Data</th><th>Grande Prêmio</th><th>Pista</th><th>Resultado</th><th>Pontos</th><th>Grid</th><th>Melhor volta</th></tr></thead>
            <tbody>
              ${gpRows.map(({ gp, race, result, trackName }) => `
                <tr>
                  <td>${Utils.escapeHtml(race?.date || '—')}</td>
                  <td><strong>${Utils.escapeHtml(gp.name)}</strong></td>
                  <td>${Utils.escapeHtml(trackName)}</td>
                  <td>${result ? `P${result.position}` : race ? 'Sem resultado' : gp.completed ? 'Resultado indisponível' : 'Pendente'}</td>
                  <td>${result?.points ?? '—'}</td>
                  <td>${result?.gridPos ? `P${result.gridPos}` : '—'}</td>
                  <td style="font-family:var(--font-mono);">${result?.bestLapMs ? Utils.formatTime(result.bestLapMs) : '—'}</td>
                </tr>
              `).join('')}
              ${gpRows.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:18px;">Esta temporada ainda não possui etapas cadastradas.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  renderProfilePage() {
    const drivers = Storage.getDrivers();
    const driver = drivers.find(item => item.id === this.activeProfileId);
    if (!driver) return '<div class="glass-panel">Piloto não encontrado.</div>';

    const teams = Storage.getTeams();
    const team = teams.find(item => item.id === driver.teamId) || { name: 'Sem Equipe', color: '#64748b', divisionId: 'div_a' };
    const divisions = Storage.getDivisions();
    const division = divisions.find(d => d.id === (team.divisionId || 'div_a')) || divisions[0] || { name: 'Série A', color: '#ffd700', icon: '🏆' };

    const driverSeason = Storage.getCurrentSeason(team.divisionId || 'div_a');
    const seasonPoints = driverSeason?.standings?.find(s => s.driverId === driver.id)?.points || 0;
    const seasonRank = Ranks.getRankForPoints(seasonPoints);

    const history = Storage.getHistory();
    const allSeasons = Storage.getSeasons().slice().sort((a, b) => (b.year || 0) - (a.year || 0));
    const currentDivisionId = team.divisionId || divisions[0]?.id || 'div_a';
    const driverSeasonIds = new Set(history
      .filter(race => race.results?.some(result => result.driverId === driver.id))
      .map(race => {
        const matchingSeasons = allSeasons.filter(season => season.races?.some(gp => gp.id === race.gpId));
        return matchingSeasons.find(season => season.divisionId === race.divisionId)?.id ||
          matchingSeasons.find(season => season.standings?.some(standing => standing.driverId === driver.id))?.id ||
          matchingSeasons[0]?.id;
      })
      .filter(Boolean));
    const driverSeasons = allSeasons.filter(season => {
      if (season.status === 'active') return season.divisionId === currentDivisionId;

      const hasRosterSnapshot = Array.isArray(season.teamSnapshots) && season.teamSnapshots.length > 0;
      const isInSeasonRoster = season.teamSnapshots?.some(snapshot => snapshot.driverIds?.includes(driver.id)) ||
        (!hasRosterSnapshot && (
          season.driverIds?.includes(driver.id) ||
          season.standings?.some(standing => standing.driverId === driver.id)
        ));

      return isInSeasonRoster || driverSeasonIds.has(season.id);
    });
    const tracks = Storage.getTracks();
    const allTimeTrials = Storage.getTimeTrials();
    const bestTrials = Storage.getBestTimeTrials();

    // Ranked Data
    const rankedStandings = Storage.getRankedStandings();
    const rankedData = rankedStandings.find(s => s.driverId === driver.id) || { rating: 1200, tier: 'Bronze', matches: 0, wins: 0, peakRating: 1200 };
    const rankedPosition = [...rankedStandings].sort((a, b) => b.rating - a.rating).findIndex(s => s.driverId === driver.id) + 1;
    const rankedTier = (typeof ModeRanked !== 'undefined' && ModeRanked.getTierInfo) 
      ? ModeRanked.getTierInfo(rankedData.rating)
      : { name: rankedData.tier, color: '#3b82f6', icon: '🎖️' };

    // Overall Technical Rating
    const speed = driver.attributes.speed || 80;
    const accel = driver.attributes.acceleration || 80;
    const ctrl = driver.attributes.control || 80;
    const brake = driver.attributes.braking ?? 75;
    const cons = driver.attributes.consistency || 80;
    const ovr = Math.round((speed + accel + ctrl + brake + cons) / 5);

    // Career Stats
    const totalRaces = driver.stats.races || 0;
    const totalWins = driver.stats.wins || 0;
    const totalPodiums = driver.stats.podiums || 0;
    const totalPoles = driver.stats.poles || 0;
    const winRate = totalRaces > 0 ? ((totalWins / totalRaces) * 100).toFixed(1) : '0.0';
    const podiumRate = totalRaces > 0 ? ((totalPodiums / totalRaces) * 100).toFixed(1) : '0.0';

    // Rival Analysis
    const rivalData = this.getDetailedRival(driver.id, history, drivers, teams);

    // Track Times & Positions per Track (Deduped per track, position 1st gold, 2nd silver, 3rd bronze)
    const trackTimesList = tracks.map(track => {
      let driverBestLap = null;
      let dateRecorded = '-';

      // Check race history
      history.forEach(h => {
        if (h.trackName === track.name || h.trackId === track.id) {
          const res = h.results?.find(r => r.driverId === driver.id);
          if (res && res.bestLapMs) {
            if (!driverBestLap || res.bestLapMs < driverBestLap) {
              driverBestLap = res.bestLapMs;
              dateRecorded = h.date;
            }
          }
        }
      });

      // Check time trials
      allTimeTrials.filter(t => t.driverId === driver.id && (t.trackId === track.id || t.trackName === track.name)).forEach(t => {
        if (t.bestLapMs && (!driverBestLap || t.bestLapMs < driverBestLap)) {
          driverBestLap = t.bestLapMs;
          dateRecorded = t.date;
        }
      });

      if (!driverBestLap) {
        return { track, driverBestLap: null, dateRecorded: '-', position: null };
      }

      // Calculate track position among all drivers
      const allLapsOnTrack = [];
      drivers.forEach(d => {
        let best = null;
        history.forEach(h => {
          if (h.trackName === track.name || h.trackId === track.id) {
            const res = h.results?.find(r => r.driverId === d.id);
            if (res && res.bestLapMs) {
              if (!best || res.bestLapMs < best) best = res.bestLapMs;
            }
          }
        });
        allTimeTrials.filter(t => t.driverId === d.id && (t.trackId === track.id || t.trackName === track.name)).forEach(t => {
          if (t.bestLapMs && (!best || t.bestLapMs < best)) best = t.bestLapMs;
        });
        if (best) allLapsOnTrack.push({ driverId: d.id, bestMs: best });
      });

      allLapsOnTrack.sort((a, b) => a.bestMs - b.bestMs);
      const pos = allLapsOnTrack.findIndex(item => item.driverId === driver.id) + 1;

      return { track, driverBestLap, dateRecorded, position: pos > 0 ? pos : null };
    });

    // Categorized Activity History
    const activityMap = {
      all: [],
      championship: [],
      ranked: [],
      duels: [],
      timetrial: [],
      casual: []
    };

    history.forEach(race => {
      const res = race.results?.find(r => r.driverId === driver.id);
      if (!res) return;

      const isCasual = race.isCasual || race.gpId?.startsWith('casual_');
      const isTimeTrial = race.isTimeTrial || race.gpId?.startsWith('tt_') || race.gpId?.startsWith('time_trial');
      const isRanked = race.isRanked || race.gpId?.startsWith('ranked');
      const isTeamDuel = race.isTeamDuel || race.gpId?.startsWith('duel');

      let category = 'championship';
      if (isTimeTrial) category = 'timetrial';
      else if (isCasual) category = 'casual';
      else if (isRanked) category = 'ranked';
      else if (isTeamDuel) category = 'duels';

      const item = {
        date: race.date,
        name: race.gpName || race.trackName,
        category,
        position: res.position,
        time: res.bestLapMs,
        points: res.points,
        isCasual,
        isTimeTrial,
        isRanked,
        isTeamDuel
      };

      activityMap.all.push(item);
      activityMap[category].push(item);
    });

    // Time-Trial solo entries
    bestTrials.filter(t => t.driverId === driver.id).forEach(t => {
      const item = {
        date: t.date,
        name: `Time-Trial: ${t.trackName}`,
        category: 'timetrial',
        position: 1,
        time: t.bestLapMs,
        points: 0,
        isTimeTrial: true
      };
      if (!activityMap.timetrial.some(x => x.name === item.name && x.time === item.time)) {
        activityMap.timetrial.push(item);
        activityMap.all.push(item);
      }
    });

    const currentTab = this.activeProfileTab || 'all';
    const activeActivities = activityMap[currentTab] || activityMap.all;

    return `
      <div class="profile-page">
        <!-- Hero Banner Principal -->
        <div class="profile-hero" style="--profile-color: ${driver.color || team.color};">
          <div class="profile-identity">
            <div class="profile-avatar">
              ${driver.avatar ? `<img src="${driver.avatar}" alt="${Utils.escapeHtml(driver.name)}">` : `#${driver.number}`}
            </div>
            <div class="profile-identity-info">
              <h1>
                ${Utils.escapeHtml(driver.name)}
                <span style="font-size: 1.6rem;">${Utils.getCountryFlag(driver.nationality)}</span>
              </h1>
              <div class="profile-tags-row">
                <span class="badge" style="background: ${driver.color || team.color}; color: #000; font-weight: 900; padding: 4px 10px; font-size: 0.82rem;">
                  #${driver.number} ${driver.code || 'DRV'}
                </span>
                <span class="badge" style="background: rgba(255, 255, 255, 0.1); color: var(--text-color); border: 1px solid var(--border-color); font-weight: 700;">
                  🏎️ ${Utils.escapeHtml(team.name)}
                </span>
                <span class="badge" style="background: ${division.color}20; color: ${division.color}; border: 1px solid ${division.color}60; font-weight: 800;">
                  ${division.icon || '🏆'} ${Utils.escapeHtml(division.name)}
                </span>
              </div>
            </div>
          </div>

          <!-- Overall Rating Telemetry Badge -->
          <div class="profile-ovr-badge">
            <div class="profile-ovr-val">${ovr}</div>
            <div class="profile-ovr-label">OVR GERAL</div>
          </div>

          <!-- Action Buttons -->
          <div class="profile-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('drivers')">← Voltar aos Pilotos</button>
            <button class="btn btn-danger btn-sm" onclick="Pilots.clearAllTimeTrials()">🗑️ Limpar Tempos</button>
            <button class="btn btn-primary btn-sm" onclick="Pilots.openModal('${driver.id}')">✏️ Editar Piloto</button>
          </div>
        </div>

        <div class="profile-tabs-bar">
          <button class="profile-tab ${this.activeProfilePageTab === 'overview' ? 'active' : ''}" onclick="Pilots.setProfilePageTab('overview')">📊 Visão Geral</button>
          <button class="profile-tab ${this.activeProfilePageTab === 'achievements' ? 'active' : ''}" onclick="Pilots.setProfilePageTab('achievements')">🏆 Conquistas</button>
          <button class="profile-tab ${this.activeProfilePageTab === 'seasons' ? 'active' : ''}" onclick="Pilots.setProfilePageTab('seasons')">📅 Temporadas</button>
          <button class="profile-tab ${this.activeProfilePageTab === 'tournaments' ? 'active' : ''}" onclick="Pilots.setProfilePageTab('tournaments')">🏆 Torneios</button>
        </div>

        ${this.activeProfilePageTab === 'tournaments'
          ? (typeof Tournament !== 'undefined' ? Tournament.renderProfileHistory('driver', driver.id) : '')
          : this.activeProfilePageTab === 'seasons'
            ? this.renderProfileSeasonHistory(driver, driverSeasons, history, teams)
            : this.activeProfilePageTab === 'achievements'
              ? (typeof Achievements !== 'undefined' ? Achievements.renderProfileSection('pilot', driver.id) : '')
              : `
        <!-- Grid Principal do Perfil (Resumo, Habilidades, MMR, Rivais, Tempos) -->
        <div class="profile-grid">
          
          <!-- Card 1: Métricas de Carreira e Desempenho -->
          <div class="profile-panel">
            <div class="profile-panel-header">
              <h3>🏆 Estatísticas de Carreira &amp; Temporada</h3>
              ${Ranks.renderBadge(seasonRank)}
            </div>
            
            <div class="profile-stats-grid">
              <div class="profile-stat-box">
                <div class="lbl">Corridas</div>
                <div class="val" style="color: var(--accent-cyan);">${totalRaces}</div>
              </div>
              <div class="profile-stat-box">
                <div class="lbl">Vitórias</div>
                <div class="val" style="color: var(--accent-gold);">${totalWins}</div>
              </div>
              <div class="profile-stat-box">
                <div class="lbl">Pódios</div>
                <div class="val" style="color: #c0c0c0;">${totalPodiums}</div>
              </div>
              <div class="profile-stat-box">
                <div class="lbl">Poles</div>
                <div class="val" style="color: var(--accent-green);">${totalPoles}</div>
              </div>
              <div class="profile-stat-box">
                <div class="lbl">Aproveitamento</div>
                <div class="val" style="color: var(--accent-gold);">${winRate}%</div>
              </div>
              <div class="profile-stat-box">
                <div class="lbl">Taxa Pódios</div>
                <div class="val" style="color: var(--accent-cyan);">${podiumRate}%</div>
              </div>
              <div class="profile-stat-box">
                <div class="lbl">Pontos Série</div>
                <div class="val" style="color: #fff;">${seasonPoints}</div>
              </div>
              <div class="profile-stat-box">
                <div class="lbl">Melhor Volta</div>
                <div class="val" style="color: var(--accent-purple); font-size: 1rem;">
                  ${driver.stats.bestLapTime ? Utils.formatTime(driver.stats.bestLapTime) : '--:--.---'}
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Habilidades Técnicas e Desenvolvimentos (Gráficos) -->
          <div class="profile-panel">
            <div class="profile-panel-header">
              <h3>📊 Competências Técnicas (Gráfico de Habilidades)</h3>
              <span class="badge" style="background: rgba(0,229,255,0.15); color: var(--accent-cyan); font-weight: bold;">
                Nível OVR: ${ovr}
              </span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.83rem; font-weight: 700; margin-bottom: 4px;">
                  <span>⚡ Velocidade Final (Top Speed)</span>
                  <strong style="color: var(--accent-cyan);">${speed} / 100</strong>
                </div>
                <div class="attribute-bar-bg">
                  <div class="attribute-bar-val" style="width: ${speed}%;"></div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.83rem; font-weight: 700; margin-bottom: 4px;">
                  <span>🚀 Aceleração e Saídas</span>
                  <strong style="color: var(--accent-gold);">${accel} / 100</strong>
                </div>
                <div class="attribute-bar-bg">
                  <div class="attribute-bar-val" style="width: ${accel}%; background: var(--accent-gold);"></div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.83rem; font-weight: 700; margin-bottom: 4px;">
                  <span>🎯 Controle e Tangência</span>
                  <strong style="color: var(--accent-green);">${ctrl} / 100</strong>
                </div>
                <div class="attribute-bar-bg">
                  <div class="attribute-bar-val" style="width: ${ctrl}%; background: var(--accent-green);"></div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.83rem; font-weight: 700; margin-bottom: 4px;">
                  <span>🛑 Frenagem nas Curvas</span>
                  <strong style="color: var(--accent-red);">${brake} / 100</strong>
                </div>
                <div class="attribute-bar-bg">
                  <div class="attribute-bar-val" style="width: ${brake}%; background: var(--accent-red);"></div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.83rem; font-weight: 700; margin-bottom: 4px;">
                  <span>🛡️ Constância e Regularidade</span>
                  <strong style="color: var(--accent-purple);">${cons} / 100</strong>
                </div>
                <div class="attribute-bar-bg">
                  <div class="attribute-bar-val" style="width: ${cons}%; background: var(--accent-purple);"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3: Evolução em Ranqueada (MMR) -->
          <div class="profile-panel">
            <div class="profile-panel-header">
              <h3>🎖️ Evolução Competitiva Ranqueada</h3>
              <span class="badge" style="background: ${rankedTier.color}20; color: ${rankedTier.color}; border: 1px solid ${rankedTier.color}; font-weight: 800;">
                ${rankedTier.icon} ${rankedTier.name}
              </span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; background: rgba(0,0,0,0.25); padding: 14px; border-radius: var(--radius-md);">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Rating Atual</div>
                <div style="font-size: 1.8rem; font-weight: 900; font-family: var(--font-mono); color: var(--accent-cyan);">
                  ${rankedData.rating} <span style="font-size: 0.9rem; color: var(--text-muted);">MMR</span>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Posição Leaderboard</div>
                <div style="font-size: 1.5rem; font-weight: 900; font-family: var(--font-mono); color: var(--accent-gold);">
                  #${rankedPosition}
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
              <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: var(--radius-sm);">
                <small style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Pico de Rating</small>
                <div style="font-size: 1.1rem; font-weight: 800; font-family: var(--font-mono); color: var(--accent-gold); margin-top: 2px;">
                  ${rankedData.peakRating || rankedData.rating} MMR
                </div>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: var(--radius-sm);">
                <small style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Partidas</small>
                <div style="font-size: 1.1rem; font-weight: 800; font-family: var(--font-mono); margin-top: 2px;">
                  ${rankedData.matches || 0}
                </div>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: var(--radius-sm);">
                <small style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Vitórias Ranqueadas</small>
                <div style="font-size: 1.1rem; font-weight: 800; font-family: var(--font-mono); color: var(--accent-green); margin-top: 2px;">
                  ${rankedData.wins || 0}
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4: Rivais & Confrontos Diretos -->
          <div class="profile-panel">
            <div class="profile-panel-header">
              <h3>⚔️ Rivalidades &amp; Confrontos Diretos</h3>
              <span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; font-weight: bold; border: 1px solid rgba(239,68,68,0.4);">
                H2H Rival
              </span>
            </div>

            ${rivalData ? `
              <div class="rival-card">
                <div class="rival-info">
                  <div class="rival-avatar">
                    ${rivalData.opponent.avatar ? `<img src="${rivalData.opponent.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : `#${rivalData.opponent.number}`}
                  </div>
                  <div>
                    <strong style="font-size: 1.1rem;">${Utils.escapeHtml(rivalData.opponent.name)}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                      ${Utils.escapeHtml(rivalData.opponentTeam.name)} • #${rivalData.opponent.number}
                    </div>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-size: 1.2rem; font-weight: 900; font-family: var(--font-mono);">
                    <span style="color: var(--accent-green);">${rivalData.myWins}V</span>
                    <span style="color: var(--text-dim);"> - </span>
                    <span style="color: var(--accent-red);">${rivalData.rivalWins}V</span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                    ${rivalData.sharedRaces} confrontos compartilhados
                  </div>
                </div>
              </div>
            ` : `
              <div style="text-align: center; color: var(--text-dim); padding: 30px; font-style: italic; font-size: 0.85rem;">
                Ainda não há confrontos suficientes com outros pilotos para registrar uma rivalidade oficial.
              </div>
            `}
          </div>

          <!-- Card 5: Tempos nas Pistas e suas Posições (PAINEL FULL WIDE COM SCROLLBAR) -->
          <div class="profile-panel profile-panel-full">
            <div class="profile-panel-header">
              <div>
                <h3>⏱️ Recordes de Tempo por Pista &amp; Posição no Ranking</h3>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                  Compara a melhor marca do piloto em cada circuito com todos os pilotos do simulador.
                </p>
              </div>
              <span class="badge" style="background: var(--accent-cyan); color: #000; font-weight: bold;">
                ${trackTimesList.filter(t => t.driverBestLap).length} / ${tracks.length} Pistas Registradas
              </span>
            </div>

            <!-- CONTAINER COM BARRA DE ROLAGEM DEDICADA -->
            <div class="profile-track-scroll">
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Pista / Circuito</th>
                      <th>País</th>
                      <th>Data Registro</th>
                      <th>Melhor Volta</th>
                      <th style="text-align: center;">Posição na Pista</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${trackTimesList.map(item => {
                      let posBadge = '';
                      if (!item.driverBestLap || !item.position) {
                        posBadge = `<span style="color: var(--text-dim); font-size: 0.8rem; font-style: italic;">Sem registro</span>`;
                      } else if (item.position === 1) {
                        posBadge = `<span class="pos-badge pos-badge-1st">🥇 1º LUGAR</span>`;
                      } else if (item.position === 2) {
                        posBadge = `<span class="pos-badge pos-badge-2nd">🥈 2º LUGAR</span>`;
                      } else if (item.position === 3) {
                        posBadge = `<span class="pos-badge pos-badge-3rd">🥉 3º LUGAR</span>`;
                      } else {
                        posBadge = `<span class="pos-badge pos-badge-other">#${item.position}</span>`;
                      }

                      return `
                        <tr>
                          <td><strong>${Utils.escapeHtml(item.track.name)}</strong></td>
                          <td>${Utils.getCountryFlag(item.track.country)} ${Utils.escapeHtml(item.track.country)}</td>
                          <td>${item.dateRecorded}</td>
                          <td style="font-family: var(--font-mono); font-weight: bold; color: ${item.driverBestLap ? 'var(--accent-purple)' : 'var(--text-dim)'};">
                            ${item.driverBestLap ? Utils.formatTime(item.driverBestLap) : '--:--.---'}
                          </td>
                          <td style="text-align: center;">
                            ${posBadge}
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Card 6: Histórico de Atividades Separado por Modo de Corrida -->
          <div class="profile-panel profile-panel-full">
            <div class="profile-panel-header">
              <div>
                <h3>🏁 Atividades Recentes Separadas por Categorias de Modo</h3>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                  Filtre os resultados históricos do piloto nos 5 modos de competição.
                </p>
              </div>
            </div>

            <!-- Abas de Categoria do Perfil -->
            <div class="profile-tabs">
              <button class="profile-tab-btn ${currentTab === 'all' ? 'active' : ''}" onclick="Pilots.switchProfileTab('all')">
                🌐 Todas (${activityMap.all.length})
              </button>
              <button class="profile-tab-btn ${currentTab === 'championship' ? 'active' : ''}" onclick="Pilots.switchProfileTab('championship')">
                🏆 Campeonato (${activityMap.championship.length})
              </button>
              <button class="profile-tab-btn ${currentTab === 'ranked' ? 'active' : ''}" onclick="Pilots.switchProfileTab('ranked')">
                🎖️ Ranqueado (${activityMap.ranked.length})
              </button>
              <button class="profile-tab-btn ${currentTab === 'duels' ? 'active' : ''}" onclick="Pilots.switchProfileTab('duels')">
                ⚔️ Duelos (${activityMap.duels.length})
              </button>
              <button class="profile-tab-btn ${currentTab === 'timetrial' ? 'active' : ''}" onclick="Pilots.switchProfileTab('timetrial')">
                ⏱️ Time-Trial (${activityMap.timetrial.length})
              </button>
              <button class="profile-tab-btn ${currentTab === 'casual' ? 'active' : ''}" onclick="Pilots.switchProfileTab('casual')">
                🚥 Casual (${activityMap.casual.length})
              </button>
            </div>

            <!-- Tabela de Atividades do Modo Ativo -->
            <div class="table-container" style="max-height: 320px; overflow-y: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Evento / Circuito</th>
                    <th>Categoria</th>
                    <th>Posição</th>
                    <th>Melhor Volta</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeActivities.slice(0, 15).map(item => {
                    let catBadge = '';
                    if (item.category === 'championship') catBadge = `<span class="badge" style="background: var(--accent-gold)20; color: var(--accent-gold);">🏆 Campeonato</span>`;
                    else if (item.category === 'ranked') catBadge = `<span class="badge" style="background: var(--accent-purple)20; color: var(--accent-purple);">🎖️ Ranqueado</span>`;
                    else if (item.category === 'duels') catBadge = `<span class="badge" style="background: var(--accent-red)20; color: var(--accent-red);">⚔️ Duelo</span>`;
                    else if (item.category === 'timetrial') catBadge = `<span class="badge" style="background: var(--accent-cyan)20; color: var(--accent-cyan);">⏱️ Time-Trial</span>`;
                    else catBadge = `<span class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-muted);">🚥 Casual</span>`;

                    let posBadge = `<strong>P${item.position}</strong>`;
                    if (item.position === 1) posBadge = `<strong style="color: var(--accent-gold);">🥇 P1</strong>`;
                    else if (item.position <= 3) posBadge = `<strong style="color: var(--accent-cyan);">🥈 P${item.position}</strong>`;

                    return `
                      <tr>
                        <td>${item.date}</td>
                        <td><strong>${Utils.escapeHtml(item.name)}</strong></td>
                        <td>${catBadge}</td>
                        <td>${posBadge}</td>
                        <td style="font-family: var(--font-mono); color: var(--accent-purple);">${Utils.formatTime(item.time)}</td>
                      </tr>
                    `;
                  }).join('')}
                  ${activeActivities.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 20px;">Nenhuma atividade registrada nesta categoria.</td></tr>' : ''}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        `}
      </div>
    `;
  },

  getDetailedRival(driverId, history, drivers, teams) {
    const me = drivers.find(d => d.id === driverId);
    const candidates = drivers.filter(d => d.id !== driverId && (!me || d.teamId !== me.teamId));
    let bestRival = null;
    let maxShared = 0;
    let myWins = 0;
    let rivalWins = 0;

    candidates.forEach(opponent => {
      let shared = 0;
      let winsAgainstOpponent = 0;
      let lossesAgainstOpponent = 0;

      history.forEach(race => {
        const myRes = race.results?.find(r => r.driverId === driverId);
        const oppRes = race.results?.find(r => r.driverId === opponent.id);
        if (myRes && oppRes) {
          shared++;
          if (myRes.position < oppRes.position) winsAgainstOpponent++;
          else if (oppRes.position < myRes.position) lossesAgainstOpponent++;
        }
      });

      if (shared > maxShared) {
        maxShared = shared;
        myWins = winsAgainstOpponent;
        rivalWins = lossesAgainstOpponent;
        const opponentTeam = teams.find(t => t.id === opponent.teamId) || { name: 'Sem Equipe' };
        bestRival = {
          opponent,
          opponentTeam,
          sharedRaces: shared,
          myWins,
          rivalWins
        };
      }
    });

    return bestRival;
  },

  getRival(driverId, history) {
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const res = this.getDetailedRival(driverId, history, drivers, teams);
    return res ? { name: res.opponent.name, reason: `${res.sharedRaces} confrontos diretos` } : null;
  },

  clearAllTimeTrials() {
    if (!confirm('Limpar todos os tempos de Time-Trial? Esta ação vale para todos os pilotos e pistas.')) return;
    Storage.saveTimeTrials([]);
    Storage.saveHistory(Storage.getHistory().filter(race => !race.isTimeTrial && !race.gpId?.startsWith('tt_') && !race.gpName?.startsWith('Time-Trial:')));
    Storage.recalculateDriverBestLaps();
    App.navigateTo('driver-profile');
  },
};
