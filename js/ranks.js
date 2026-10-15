/* ==========================================================================
   RACE SIMULATOR - RANKS ENGINE (js/ranks.js)
   ========================================================================== */

const Ranks = {
  activeCategory: 'championship', // 'championship' or 'ranked'

  // Get the rank for a given points value (in the specified category)
  getRankForPoints(points, category = 'championship') {
    const ranks = Storage.getRanks(category);
    let currentRank = ranks[0];
    for (const rank of ranks) {
      if (points >= rank.minPoints) currentRank = rank;
    }
    return currentRank;
  },

  // Calculate rank progress info
  getRankProgress(points, category = 'championship') {
    const ranks = Storage.getRanks(category);
    const currentRank = this.getRankForPoints(points, category);
    const currentIndex = ranks.findIndex(r => r.id === currentRank.id);

    if (currentIndex >= ranks.length - 1) {
      return { currentRank, nextRank: null, pointsInCurrentTier: points - currentRank.minPoints, pointsNeededForNext: 0, progressPercent: 100, isMaxRank: true };
    }

    const nextRank = ranks[currentIndex + 1];
    const range = nextRank.minPoints - currentRank.minPoints;
    const progress = points - currentRank.minPoints;
    return {
      currentRank, nextRank,
      pointsInCurrentTier: progress,
      pointsNeededForNext: nextRank.minPoints - points,
      progressPercent: Math.min(100, Math.max(0, Math.round((progress / range) * 100))),
      isMaxRank: false
    };
  },

  // Render HTML Rank Badge
  renderBadge(rank) {
    if (!rank) return '';
    return `<span class="badge rank-badge" style="background-color: ${rank.color};">${rank.icon ? rank.icon : ''} ${Utils.escapeHtml(rank.name)}</span>`;
  },

  // Render Progress Bar HTML (category defaults to championship)
  renderProgressBar(points, category = 'championship') {
    const info = this.getRankProgress(points, category);
    if (info.isMaxRank) {
      return `
        <div class="rank-progress-container">
          <div class="rank-progress-labels">
            <span>${this.renderBadge(info.currentRank)}</span>
            <span style="color: var(--accent-gold); font-weight: bold;">RANK MÁXIMO (${points} pts)</span>
          </div>
          <div class="rank-progress-bar">
            <div class="rank-progress-fill" style="width: 100%; background: ${info.currentRank.color};"></div>
          </div>
        </div>
      `;
    }
    return `
      <div class="rank-progress-container">
        <div class="rank-progress-labels">
          <span>${this.renderBadge(info.currentRank)}</span>
          <span>${points} / ${info.nextRank.minPoints} pts (Próximo: ${info.nextRank.name})</span>
        </div>
        <div class="rank-progress-bar">
          <div class="rank-progress-fill" style="width: ${info.progressPercent}%; background: ${info.currentRank.color};"></div>
        </div>
      </div>
    `;
  },

  // Switch active tab
  setCategory(cat) {
    this.activeCategory = cat;
    App.navigateTo('ranks');
  },

  // Render Editor with tabs
  renderEditor() {
    const cat = this.activeCategory;
    const ranks = Storage.getRanks(cat);

    const catLabel = cat === 'championship' ? '🏆 Campeonato' : '🎖️ Ranqueado';
    const catColor = cat === 'championship' ? 'var(--accent-gold)' : 'var(--accent-purple)';
    const catDesc = cat === 'championship'
      ? 'Ranks atribuídos dinamicamente pela pontuação acumulada na temporada. Usado para exibir o nível competitivo do piloto no campeonato.'
      : 'Ranks do Modo Ranqueado (MMR). Usados para classificar pilotos pelo Rating MMR/ELO acumulado nas corridas ranqueadas.';

    return `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Header -->
        <div class="glass-panel" style="border-left: 4px solid ${catColor};">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">⭐ Editor do Sistema de Ranks</h2>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">${catDesc}</p>
            </div>
            <button class="btn btn-primary" onclick="Ranks.openModal()">+ Novo Rank</button>
          </div>

          <!-- Abas de Categoria -->
          <div style="display: flex; gap: 8px; margin-top: 16px;">
            <button class="btn ${cat === 'championship' ? 'btn-primary' : 'btn-secondary'}" onclick="Ranks.setCategory('championship')">
              🏆 Campeonato
            </button>
            <button class="btn ${cat === 'ranked' ? 'btn-primary' : 'btn-secondary'}" style="${cat === 'ranked' ? 'background: var(--accent-purple);' : ''}" onclick="Ranks.setCategory('ranked')">
              🎖️ Ranqueado (MMR)
            </button>
          </div>
        </div>

        <!-- Tabela de Ranks da categoria ativa -->
        <div class="glass-panel">
          <div class="panel-header">
            <h3 class="panel-title">${catLabel} — Tabela de Ranks</h3>
            <span class="badge" style="background: ${catColor}25; color: ${catColor}; font-weight: bold;">${ranks.length} ranks configurados</span>
          </div>

          <div class="table-container" style="margin-top: 12px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Ícone</th>
                  <th>Nome do Rank</th>
                  <th>${cat === 'ranked' ? 'Rating MMR Mínimo' : 'Pontuação Mínima'}</th>
                  <th>Cor HEX</th>
                  <th>Preview</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${ranks.map((r, idx) => `
                  <tr>
                    <td><strong>#${r.order}</strong></td>
                    <td style="font-size: 1.5rem;">${r.icon || '🏁'}</td>
                    <td><strong>${Utils.escapeHtml(r.name)}</strong></td>
                    <td>
                      <strong style="font-family: var(--font-mono); color: ${r.color};">${r.minPoints} ${cat === 'ranked' ? 'MMR' : 'pts'}</strong>
                      ${idx < ranks.length - 1 ? `<span style="font-size: 0.7rem; color: var(--text-dim);"> — até ${ranks[idx + 1].minPoints - 1}</span>` : '<span style="font-size: 0.7rem; color: var(--accent-gold);"> — ♾️ MAX</span>'}
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="display: inline-block; width: 20px; height: 20px; border-radius: 6px; background: ${r.color}; border: 1px solid rgba(255,255,255,0.3);"></span>
                        <code style="font-size: 0.8rem;">${r.color}</code>
                      </div>
                    </td>
                    <td>${this.renderBadge(r)}</td>
                    <td style="display: flex; gap: 6px; flex-wrap: wrap;">
                      <button class="btn btn-secondary btn-sm" onclick="Ranks.openModal('${r.id}')">✏️ Editar</button>
                      ${ranks.length > 1 ? `<button class="btn btn-danger btn-sm" onclick="Ranks.deleteRank('${r.id}')">🗑️</button>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Visualização da escala de ranks -->
        <div class="glass-panel">
          <div class="panel-header">
            <h3 class="panel-title">📊 Progressão Visual dos Ranks — ${catLabel}</h3>
          </div>
          <div style="display: flex; align-items: flex-end; gap: 8px; margin-top: 16px; flex-wrap: wrap;">
            ${ranks.map((r, idx) => {
              const height = 40 + (idx * (120 / Math.max(ranks.length - 1, 1)));
              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; min-width: 60px;">
                  <span style="font-size: 0.7rem; color: var(--text-dim);">${r.minPoints}${cat === 'ranked' ? ' MMR' : 'pts'}</span>
                  <div style="font-size: 1.5rem;">${r.icon || '🏁'}</div>
                  <div style="height: ${height}px; background: linear-gradient(to top, ${r.color}, ${r.color}88); border-radius: 6px 6px 0 0; width: 100%;"></div>
                  <span style="font-size: 0.72rem; font-weight: bold; color: ${r.color}; text-align: center;">${r.name}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  openModal(rankId = null) {
    const cat = this.activeCategory;
    const ranks = Storage.getRanks(cat);
    const rank = rankId ? ranks.find(r => r.id === rankId) : {
      id: '', name: '', minPoints: 0, color: '#00e5ff', icon: '🏆', order: ranks.length + 1
    };

    const isEdit = !!rankId;
    const catLabel = cat === 'championship' ? '🏆 Campeonato' : '🎖️ Ranqueado (MMR)';
    const ptLabel = cat === 'ranked' ? 'Rating MMR Mínimo' : 'Pontuação Mínima';

    const modalHtml = `
      <div class="modal-backdrop active" id="rank-modal">
        <div class="modal-content" style="max-width: 520px;">
          <div class="modal-header">
            <div>
              <h3>${isEdit ? 'Editar Rank' : 'Criar Novo Rank'}</h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Categoria: ${catLabel}</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('rank-modal')">✕</button>
          </div>
          <form id="rank-form" onsubmit="Ranks.saveForm(event)">
            <input type="hidden" id="rank-id" value="${rank.id}">
            <input type="hidden" id="rank-category" value="${cat}">
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">

              <div class="form-group">
                <label class="form-label">Nome do Rank</label>
                <input type="text" id="rank-name" class="form-input" required value="${Utils.escapeHtml(rank.name)}" placeholder="Ex: Master, Diamante, Lenda...">
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">${ptLabel}</label>
                  <input type="number" id="rank-points" class="form-input" required min="0" value="${rank.minPoints}" placeholder="0">
                </div>
                <div class="form-group">
                  <label class="form-label">Ordem de Progressão</label>
                  <input type="number" id="rank-order" class="form-input" required min="1" value="${rank.order}">
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Cor HEX</label>
                  <input type="color" id="rank-color" class="form-input" style="height: 44px; padding: 4px;" value="${rank.color}">
                </div>
                <div class="form-group">
                  <label class="form-label">Ícone / Emoji</label>
                  <input type="text" id="rank-icon" class="form-input" value="${Utils.escapeHtml(rank.icon || '')}" placeholder="Ex: 👑, 💎, 🔥">
                </div>
              </div>

              <!-- Preview ao vivo -->
              <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">Preview</div>
                <span class="badge" id="rank-preview-badge" style="background-color: ${rank.color}; font-size: 1rem; padding: 8px 16px;">
                  ${rank.icon || '🏁'} ${rank.name || 'Rank'}
                </span>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal('rank-modal')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Rank ✓</button>
            </div>
          </form>
        </div>
      </div>
    `;
    App.showModal(modalHtml);

    // Live preview
    setTimeout(() => {
      const nameInput = document.getElementById('rank-name');
      const iconInput = document.getElementById('rank-icon');
      const colorInput = document.getElementById('rank-color');
      const preview = document.getElementById('rank-preview-badge');
      if (!preview) return;
      const update = () => {
        preview.textContent = `${iconInput.value || '🏁'} ${nameInput.value || 'Rank'}`;
        preview.style.backgroundColor = colorInput.value;
      };
      nameInput?.addEventListener('input', update);
      iconInput?.addEventListener('input', update);
      colorInput?.addEventListener('input', update);
    }, 50);
  },

  saveForm(e) {
    e.preventDefault();
    const id  = document.getElementById('rank-id').value;
    const cat = document.getElementById('rank-category').value;
    const name       = document.getElementById('rank-name').value.trim();
    const minPoints  = parseInt(document.getElementById('rank-points').value, 10);
    const order      = parseInt(document.getElementById('rank-order').value, 10);
    const color      = document.getElementById('rank-color').value;
    const icon       = document.getElementById('rank-icon').value.trim();

    let ranks = Storage.getRanks(cat);
    if (id) {
      ranks = ranks.map(r => r.id === id ? { ...r, name, minPoints, order, color, icon } : r);
    } else {
      ranks.push({ id: Utils.generateId('rank'), name, minPoints, order, color, icon });
    }
    ranks.sort((a, b) => a.order - b.order);
    Storage.saveRanks(ranks, cat);
    this.syncRanks(cat);  // sincroniza automaticamente
    App.closeModal('rank-modal');
    App.navigateTo('ranks');
  },

  deleteRank(id) {
    const cat = this.activeCategory;
    if (confirm('Tem certeza que deseja excluir este rank?')) {
      let ranks = Storage.getRanks(cat);
      ranks = ranks.filter(r => r.id !== id);
      Storage.saveRanks(ranks, cat);
      this.syncRanks(cat);  // sincroniza automaticamente
      App.navigateTo('ranks');
    }
  },

  // Sincroniza ranks de todos os pilotos/standings ao alterar a tabela
  syncRanks(category) {
    if (category === 'championship') {
      // Recalculate currentRankId for all drivers in all seasons
      const seasons = Storage.getSeasons();
      let changed = false;
      seasons.forEach(season => {
        if (!season.standings) return;
        season.standings.forEach(s => {
          const rank = this.getRankForPoints(s.points || 0, 'championship');
          if (s.currentRankId !== rank.id) {
            s.currentRankId = rank.id;
            changed = true;
          }
        });
      });
      if (changed) Storage.saveSeasons(seasons);

      // Also update driver objects' rankId if they have one
      const drivers = Storage.getDrivers();
      let driversChanged = false;
      drivers.forEach(d => {
        const pts = d.stats?.totalPoints || 0;
        const rank = this.getRankForPoints(pts, 'championship');
        if (d.currentRankId !== rank.id) {
          d.currentRankId = rank.id;
          driversChanged = true;
        }
      });
      if (driversChanged) Storage.saveDrivers(drivers);

    } else if (category === 'ranked') {
      // Recalculate tier for all ranked standings
      const standings = Storage.getRankedStandings();
      standings.forEach(s => {
        const rank = this.getRankForPoints(s.rating || 1200, 'ranked');
        s.tier     = rank.name;
        s.tierId   = rank.id;
        s.tierColor = rank.color;
        s.tierIcon  = rank.icon;
      });
      Storage.saveRankedStandings(standings);
    }
  }
};
