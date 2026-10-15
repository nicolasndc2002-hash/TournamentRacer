/* ==========================================================================
   RACE SIMULATOR - SETTINGS MODULE (js/settings.js)
   ========================================================================== */

const Settings = {
  render() {
    const settings = Storage.getSettings();
    
    // Update storage size display after rendering
    setTimeout(() => this.updateStorageSizeDisplay(), 100);

    return `
      <div class="glass-panel" style="max-width: 900px; margin: 0 auto;">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">⚙️ Configurações Gerais</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
              Personalize a categoria, visualização da telemetria e pontuação dos Grandes Prêmios.
            </p>
          </div>
          <button class="btn btn-primary" onclick="Settings.saveSettingsForm()">Salvar Alterações</button>
        </div>

        <form id="settings-form" onsubmit="event.preventDefault(); Settings.saveSettingsForm();">
          <!-- Categoria e Identidade -->
          <div style="margin-bottom: 28px;">
            <h3 style="font-size: 1rem; color: var(--accent-cyan); margin-bottom: 14px; text-transform: uppercase;">
              Identidade da Categoria
            </h3>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Nome da Categoria</label>
                <input type="text" id="setting-cat-name" class="form-input" value="${Utils.escapeHtml(settings.categoryName)}">
              </div>
              <div class="form-group">
                <label class="form-label">Logo / Emoji da Categoria</label>
                <input type="text" id="setting-cat-logo" class="form-input" value="${Utils.escapeHtml(settings.categoryLogo)}">
              </div>
            </div>
          </div>

          <!-- Exibição e Simulação -->
          <div style="margin-bottom: 28px;">
            <h3 style="font-size: 1rem; color: var(--accent-cyan); margin-bottom: 14px; text-transform: uppercase;">
              Simulação & Interface
            </h3>
            <div class="grid-3">
              <div class="form-group">
                <label class="form-label">Tema Visual</label>
                <select id="setting-theme" class="form-select" onchange="Settings.previewTheme(this.value)">
                  <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Tema Escuro (Motorsport)</option>
                  <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Tema Claro</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Exibição nas Bolinhas</label>
                <select id="setting-driver-display" class="form-select">
                  <option value="number" ${settings.driverDisplayMode === 'number' ? 'selected' : ''}>Número do Carro (#44)</option>
                  <option value="code" ${settings.driverDisplayMode === 'code' ? 'selected' : ''}>Sigla do Piloto (HAM)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Velocidade Padrão</label>
                <select id="setting-sim-speed" class="form-select">
                  <option value="1" ${settings.simSpeed == 1 ? 'selected' : ''}>1x (Normal)</option>
                  <option value="2" ${settings.simSpeed == 2 ? 'selected' : ''}>2x (Rápido)</option>
                  <option value="4" ${settings.simSpeed == 4 ? 'selected' : ''}>4x (Ultra)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Sistema de Pontuação Dinâmico da Temporada Oficial -->
          <div style="margin-bottom: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <h3 style="font-size: 1rem; color: var(--accent-cyan); text-transform: uppercase;">
                  Tabela de Pontuação por Posição (Campeonato Oficial)
                </h3>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                  Configure os pontos atribuídos aos pilotos a cada corrida da temporada.
                </p>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="Settings.addPointsRow()">+ Adicionar Posição</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="Settings.removePointsRow()">- Remover Última</button>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: var(--radius-md);">
              <label class="form-label" style="margin: 0;">Ponto Extra por Volta Mais Rápida:</label>
              <input type="number" id="setting-fastest-lap-pt" class="form-input" style="width: 70px; padding: 6px;" min="0" value="${settings.fastestLapPoint !== undefined ? settings.fastestLapPoint : 1}">
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Pontos Atribuídos</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody id="points-table-body">
                  ${settings.pointsSystem.map((p, idx) => `
                    <tr id="point-row-${p.pos}">
                      <td><strong>${p.pos}º Lugar</strong></td>
                      <td>
                        <input type="number" class="form-input point-input" data-pos="${p.pos}" style="width: 120px; padding: 6px;" min="0" value="${p.points}">
                      </td>
                      <td>
                        <button type="button" class="btn btn-danger btn-sm" onclick="Settings.deleteSpecificPointRow(${p.pos})">✕</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- SEÇÃO DEDICADA: Configurações do Modo Ranqueado (MMR / ELO) -->
          <div style="margin-bottom: 28px; border-top: 2px solid var(--accent-purple); padding-top: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge" style="background: var(--accent-purple); color: #fff; font-weight: bold;">MODO COMPETITIVO</span>
                  <h3 style="font-size: 1.1rem; color: var(--accent-purple); text-transform: uppercase; margin: 0;">
                    🎖️ Configurações das Corridas Ranqueadas
                  </h3>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                  Ajuste o algoritmo de pontuação (MMR vs ELO), taxa de variação (K-Factor) e a tabela dedicada de ganhos/perdas de pontos por colocação.
                </p>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="Settings.addRankedPointsRow()">+ Adicionar Posição Ranqueada</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="Settings.removeRankedPointsRow()">- Remover Última</button>
              </div>
            </div>

            <!-- Parâmetros do Algoritmo Ranqueado -->
            <div class="grid-3" style="margin-bottom: 16px;">
              <div class="form-group">
                <label class="form-label">Sistema de Cálculo</label>
                <select id="setting-ranked-mode" class="form-select">
                  <option value="mmr" ${(settings.rankedSettings?.systemMode || 'mmr') === 'mmr' ? 'selected' : ''}>MMR por Tabela de Posição (+/-)</option>
                  <option value="elo" ${(settings.rankedSettings?.systemMode || 'mmr') === 'elo' ? 'selected' : ''}>ELO Rating com Fator K</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Rating Inicial (Base)</label>
                <input type="number" id="setting-ranked-base" class="form-input" min="100" max="5000" value="${settings.rankedSettings?.baseRating || 1200}">
              </div>
              <div class="form-group">
                <label class="form-label">Sensibilidade / K-Factor</label>
                <input type="number" id="setting-ranked-kfactor" class="form-input" min="1" max="100" value="${settings.rankedSettings?.kFactor || 32}">
              </div>
            </div>

            <!-- Tabela de Ganhos/Perdas por Posição Ranqueada -->
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Posição Final</th>
                    <th>Variação de Rating (MMR / Pontos)</th>
                    <th>Impacto</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody id="ranked-points-table-body">
                  ${(settings.rankedSettings?.pointsSystem || [
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
                  ]).map((p) => {
                    const impactText = p.pointsDelta > 0 ? 'GANHO' : p.pointsDelta < 0 ? 'PERDA' : 'NEUTRO';
                    const impactBg = p.pointsDelta > 0 ? 'rgba(0, 245, 155, 0.15)' : p.pointsDelta < 0 ? 'rgba(255, 51, 102, 0.15)' : 'rgba(255, 255, 255, 0.08)';
                    const impactColor = p.pointsDelta > 0 ? 'var(--accent-green)' : p.pointsDelta < 0 ? 'var(--accent-red)' : 'var(--text-dim)';
                    const impactIcon = p.pointsDelta > 0 ? '▲' : p.pointsDelta < 0 ? '▼' : '●';

                    return `
                      <tr id="ranked-point-row-${p.pos}">
                        <td><strong>${p.pos}º Lugar</strong></td>
                        <td>
                          <input type="number" class="form-input ranked-point-input" data-pos="${p.pos}" oninput="Settings.updateImpactBadge(this)" style="width: 130px; padding: 6px; font-weight: bold; color: ${impactColor};" value="${p.pointsDelta}">
                        </td>
                        <td>
                          <span class="badge impact-badge-${p.pos}" style="background: ${impactBg}; color: ${impactColor}; font-weight: 700;">
                            ${impactIcon} ${impactText}
                          </span>
                        </td>
                        <td>
                          <button type="button" class="btn btn-danger btn-sm" onclick="Settings.deleteSpecificRankedPointRow(${p.pos})">✕</button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Acesso direto ao Editor de Ranks -->
          <div style="border-top: 1px solid var(--border-color); padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700;">Editor de Ranks de Pilotos</h4>
              <p style="color: var(--text-muted); font-size: 0.8rem;">Configure níveis, cores e metas de pontos para a temporada.</p>
            </div>
            <button type="button" class="btn btn-secondary" onclick="App.navigateTo('ranks')">Abrir Editor de Ranks ➔</button>
          </div>
        </form>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════
           SEÇÃO: DADOS & BACKUP
      ═══════════════════════════════════════════════════════════════ -->
      <div class="glass-panel" style="max-width: 900px; margin: 20px auto 0;">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">💾 Dados & Backup</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
              Salve um backup completo de todos os dados do jogo ou restaure a partir de um arquivo salvo anteriormente.
            </p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 8px;">

          <!-- Exportar -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; background: rgba(0, 229, 255, 0.05); border: 1px solid rgba(0, 229, 255, 0.2); border-radius: var(--radius-lg);">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-cyan);">⬇️ Exportar / Baixar Backup</h4>
              <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 3px;">
                Gera um arquivo <code style="font-family: var(--font-mono); background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px;">.json</code> com pilotos, equipes, temporadas, histórico de corridas e todas as configurações.
              </p>
            </div>
            <button class="btn btn-primary" style="flex-shrink: 0; margin-left: 16px;" onclick="Settings.exportBackup()">
              💾 Baixar Backup
            </button>
          </div>

          <!-- Importar -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: var(--radius-lg);">
            <div style="flex: 1;">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-purple);">⬆️ Importar / Restaurar Backup</h4>
              <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 3px;">
                Carrega um arquivo de backup gerado por este jogo. <strong style="color: var(--accent-red);">Todos os dados atuais serão substituídos.</strong>
              </p>
              <!-- Input de arquivo invisível — acionado pelo botão abaixo -->
              <input type="file" id="backup-file-input" accept=".json,application/json"
                style="display: none;"
                onchange="Settings.handleImportFile(this)">
            </div>
            <button class="btn btn-secondary" style="flex-shrink: 0; margin-left: 16px; border-color: var(--accent-purple); color: var(--accent-purple);"
              onclick="document.getElementById('backup-file-input').click()">
              📂 Carregar Arquivo
            </button>
          </div>

          <!-- Gerenciamento de Armazenamento -->
          <div style="display: flex; flex-direction: column; gap: 12px; padding: 18px 20px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-lg);">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-red);">🗑️ Gerenciamento de Armazenamento</h4>
              <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 3px;">
                Gerencie o espaço usado pelo LocalStorage. Tamanho atual: <span id="storage-size-display">Calculando...</span>
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" onclick="Settings.compressTracksSvg()">
                📦 Comprimir SVGs
              </button>
              <button class="btn btn-secondary btn-sm" onclick="Settings.clearOldHistory()">
                🧹 Limpar Histórico Antigo
              </button>
              <button class="btn btn-warning btn-sm" onclick="Settings.trimOldRaces()">
                ✂️ Manter Apenas 50 Corridas
              </button>
              <button class="btn btn-danger btn-sm" onclick="Settings.showStorageDetails()">
                📊 Detalhes
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  previewTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  },

  saveSettingsForm() {
    const theme = document.getElementById('setting-theme').value;
    const driverDisplayMode = document.getElementById('setting-driver-display').value;
    const simSpeed = parseInt(document.getElementById('setting-sim-speed').value, 10);
    const categoryName = document.getElementById('setting-cat-name').value.trim();
    const categoryLogo = document.getElementById('setting-cat-logo').value.trim();
    const fastestLapPoint = parseInt(document.getElementById('setting-fastest-lap-pt').value, 10);

    const pointInputs = document.querySelectorAll('.point-input');
    const pointsSystem = [];
    pointInputs.forEach(input => {
      pointsSystem.push({
        pos: parseInt(input.dataset.pos, 10),
        points: parseInt(input.value, 10) || 0
      });
    });

    // Ranked Settings parsing
    const rankedMode = document.getElementById('setting-ranked-mode').value;
    const rankedBase = parseInt(document.getElementById('setting-ranked-base').value, 10) || 1200;
    const rankedKFactor = parseInt(document.getElementById('setting-ranked-kfactor').value, 10) || 32;

    const rankedInputs = document.querySelectorAll('.ranked-point-input');
    const rankedPointsSystem = [];
    rankedInputs.forEach(input => {
      rankedPointsSystem.push({
        pos: parseInt(input.dataset.pos, 10),
        pointsDelta: parseInt(input.value, 10) || 0
      });
    });

    const newSettings = {
      theme,
      driverDisplayMode,
      simSpeed,
      categoryName,
      categoryLogo,
      fastestLapPoint,
      pointsSystem,
      rankedSettings: {
        systemMode: rankedMode,
        baseRating: rankedBase,
        kFactor: rankedKFactor,
        pointsSystem: rankedPointsSystem
      }
    };

    Storage.saveSettings(newSettings);
    this.previewTheme(theme);
    App.updateHeaderBrand();
    alert('Configurações gerais e ranqueadas salvas com sucesso!');
  },

  addPointsRow() {
    const tbody = document.getElementById('points-table-body');
    if (!tbody) return;

    const currentRows = tbody.querySelectorAll('tr');
    const nextPos = currentRows.length + 1;
    const defaultPoints = nextPos <= 10 ? Math.max(1, 12 - nextPos) : 1;

    const tr = document.createElement('tr');
    tr.id = `point-row-${nextPos}`;
    tr.innerHTML = `
      <td><strong>${nextPos}º Lugar</strong></td>
      <td>
        <input type="number" class="form-input point-input" data-pos="${nextPos}" style="width: 120px; padding: 6px;" min="0" value="${defaultPoints}">
      </td>
      <td>
        <button type="button" class="btn btn-danger btn-sm" onclick="Settings.deleteSpecificPointRow(${nextPos})">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  },

  removePointsRow() {
    const tbody = document.getElementById('points-table-body');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    if (rows.length > 1) {
      rows[rows.length - 1].remove();
    } else {
      alert('A tabela deve conter ao menos 1 posição pontuável.');
    }
  },

  deleteSpecificPointRow(pos) {
    const tbody = document.getElementById('points-table-body');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    if (rows.length <= 1) {
      alert('A tabela deve conter ao menos 1 posição pontuável.');
      return;
    }

    const row = document.getElementById(`point-row-${pos}`);
    if (row) row.remove();

    // Renumber remaining positions
    const remainingRows = tbody.querySelectorAll('tr');
    remainingRows.forEach((r, idx) => {
      const newPos = idx + 1;
      r.id = `point-row-${newPos}`;
      r.cells[0].innerHTML = `<strong>${newPos}º Lugar</strong>`;
      const input = r.querySelector('.point-input');
      if (input) input.dataset.pos = newPos;
      const btn = r.querySelector('button');
      if (btn) btn.setAttribute('onclick', `Settings.deleteSpecificPointRow(${newPos})`);
    });
  },

  updateImpactBadge(input) {
    const val = parseInt(input.value, 10) || 0;
    const pos = input.dataset.pos;
    const badge = document.querySelector(`.impact-badge-${pos}`);
    if (!badge) return;

    if (val > 0) {
      input.style.color = 'var(--accent-green)';
      badge.style.background = 'rgba(0, 245, 155, 0.15)';
      badge.style.color = 'var(--accent-green)';
      badge.innerHTML = '▲ GANHO';
    } else if (val < 0) {
      input.style.color = 'var(--accent-red)';
      badge.style.background = 'rgba(255, 51, 102, 0.15)';
      badge.style.color = 'var(--accent-red)';
      badge.innerHTML = '▼ PERDA';
    } else {
      input.style.color = 'var(--text-muted)';
      badge.style.background = 'rgba(255, 255, 255, 0.08)';
      badge.style.color = 'var(--text-dim)';
      badge.innerHTML = '● NEUTRO';
    }
  },

  // Ranked Points Rows Helpers
  addRankedPointsRow() {
    const tbody = document.getElementById('ranked-points-table-body');
    if (!tbody) return;

    const currentRows = tbody.querySelectorAll('tr');
    const nextPos = currentRows.length + 1;
    const defaultDelta = nextPos <= 5 ? 5 : -15;

    const impactText = defaultDelta > 0 ? 'GANHO' : defaultDelta < 0 ? 'PERDA' : 'NEUTRO';
    const impactBg = defaultDelta > 0 ? 'rgba(0, 245, 155, 0.15)' : defaultDelta < 0 ? 'rgba(255, 51, 102, 0.15)' : 'rgba(255, 255, 255, 0.08)';
    const impactColor = defaultDelta > 0 ? 'var(--accent-green)' : defaultDelta < 0 ? 'var(--accent-red)' : 'var(--text-dim)';
    const impactIcon = defaultDelta > 0 ? '▲' : defaultDelta < 0 ? '▼' : '●';

    const tr = document.createElement('tr');
    tr.id = `ranked-point-row-${nextPos}`;
    tr.innerHTML = `
      <td><strong>${nextPos}º Lugar</strong></td>
      <td>
        <input type="number" class="form-input ranked-point-input" data-pos="${nextPos}" oninput="Settings.updateImpactBadge(this)" style="width: 130px; padding: 6px; font-weight: bold; color: ${impactColor};" value="${defaultDelta}">
      </td>
      <td>
        <span class="badge impact-badge-${nextPos}" style="background: ${impactBg}; color: ${impactColor}; font-weight: 700;">
          ${impactIcon} ${impactText}
        </span>
      </td>
      <td>
        <button type="button" class="btn btn-danger btn-sm" onclick="Settings.deleteSpecificRankedPointRow(${nextPos})">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  },

  removeRankedPointsRow() {
    const tbody = document.getElementById('ranked-points-table-body');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    if (rows.length > 1) {
      rows[rows.length - 1].remove();
    } else {
      alert('A tabela ranqueada deve conter ao menos 1 posição.');
    }
  },

  deleteSpecificRankedPointRow(pos) {
    const tbody = document.getElementById('ranked-points-table-body');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    if (rows.length <= 1) {
      alert('A tabela ranqueada deve conter ao menos 1 posição.');
      return;
    }

    const row = document.getElementById(`ranked-point-row-${pos}`);
    if (row) row.remove();

    // Renumber remaining positions
    const remainingRows = tbody.querySelectorAll('tr');
    remainingRows.forEach((r, idx) => {
      const newPos = idx + 1;
      r.id = `ranked-point-row-${newPos}`;
      r.cells[0].innerHTML = `<strong>${newPos}º Lugar</strong>`;
      const input = r.querySelector('.ranked-point-input');
      if (input) input.dataset.pos = newPos;
      const btn = r.querySelector('button');
      if (btn) btn.setAttribute('onclick', `Settings.deleteSpecificRankedPointRow(${newPos})`);
    });
  },

  // ── Backup: Exportar ──────────────────────────────────────────────────────
  exportBackup() {
    try {
      Storage.exportData();
    } catch (e) {
      alert(`Erro ao gerar backup: ${e.message}`);
    }
  },

  // ── Backup: Importar ──────────────────────────────────────────────────────
  handleImportFile(input) {
    const file = input.files?.[0];
    if (!file) return;

    // Limpa o input para permitir carregar o mesmo arquivo novamente se necessário
    input.value = '';

    if (!confirm(
      `⚠️ ATENÇÃO\n\nIsso irá substituir TODOS os dados atuais (pilotos, equipes, histórico, temporadas) pelos dados do arquivo:\n\n"${file.name}"\n\nDeseja continuar?`
    )) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = Storage.importData(e.target.result);
        alert(`✅ Backup restaurado com sucesso!\n${result.imported} conjuntos de dados importados.${result.skipped > 0 ? `\n${result.skipped} chaves ignoradas (não reconhecidas).` : ''}\n\nA página será recarregada.`);
        // Recarrega a página para garantir que todos os módulos reflitam os novos dados
        window.location.reload();
      } catch (err) {
        alert(`❌ Falha ao importar backup:\n${err.message}`);
      }
    };
    reader.onerror = () => alert('Erro ao ler o arquivo. Tente novamente.');
    reader.readAsText(file, 'UTF-8');
  },

  // ── Storage Management ─────────────────────────────────────────────────────
  updateStorageSizeDisplay() {
    const display = document.getElementById('storage-size-display');
    if (!display) return;

    let total = 0;
    const keys = ['race_sim_settings', 'race_sim_drivers', 'race_sim_teams', 'race_sim_tracks', 
                  'race_sim_seasons', 'race_sim_history', 'race_sim_hall_of_fame', 'race_sim_team_duels',
                  'race_sim_time_trials', 'race_sim_ranked_standings', 'race_sim_ranked_history',
                  'race_sim_team_divisions', 'race_sim_tournaments', 'race_sim_ranks', 'race_sim_ranks_ranked'];
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) total += value.length;
    });

    const kb = (total / 1024).toFixed(2);
    const mb = (total / (1024 * 1024)).toFixed(2);
    display.textContent = `${kb} KB (${mb} MB)`;
  },

  compressTracksSvg() {
    if (!confirm('Isso vai comprimir os SVG paths de todos os circuitos para economizar espaço.\n\nA precisão será reduzida para 2 casas decimais, mas os circuitos continuarão funcionando normalmente.\n\nDeseja continuar?')) {
      return;
    }

    try {
      const tracks = Storage.getTracks();
      let compressedCount = 0;
      let totalSaved = 0;

      tracks.forEach(track => {
        if (track.svgPath && typeof Tracks !== 'undefined' && Tracks.compressSvgPath) {
          const original = track.svgPath;
          const compressed = Tracks.compressSvgPath(track.svgPath);
          track.svgPath = compressed;
          totalSaved += original.length - compressed.length;
          compressedCount++;
        }
      });

      Storage.saveTracks(tracks);
      alert(`✅ Compressão concluída!\n\nCircuitos comprimidos: ${compressedCount}\nEspaço economizado: ${(totalSaved / 1024).toFixed(2)} KB\n\nA página será recarregada.`);
      window.location.reload();
    } catch (e) {
      alert(`❌ Erro ao comprimir SVGs: ${e.message}`);
    }
  },

  clearOldHistory() {
    const history = Storage.getHistory();
    if (history.length === 0) {
      alert('Não há histórico de corridas para limpar.');
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6); // 6 meses atrás

    const oldCount = history.length;
    const recentHistory = history.filter(race => {
      const raceDate = new Date(race.date || 0);
      return raceDate > cutoffDate;
    });
    const removedCount = oldCount - recentHistory.length;

    if (removedCount === 0) {
      alert('Não há corridas antigas (mais de 6 meses) para remover.');
      return;
    }

    if (!confirm(`Isso irá remover ${removedCount} corridas antigas (mais de 6 meses).\n\nAs corridas recentes serão mantidas.\n\nDeseja continuar?`)) {
      return;
    }

    try {
      Storage.saveHistory(recentHistory);
      Storage.recalculateAllFromHistory();
      alert(`✅ Histórico limpo!\n\nCorridas removidas: ${removedCount}\nCorridas mantidas: ${recentHistory.length}\n\nAs classificações foram recalculadas.`);
      this.updateStorageSizeDisplay();
    } catch (e) {
      alert(`❌ Erro ao limpar histórico: ${e.message}`);
    }
  },

  trimOldRaces() {
    const history = Storage.getHistory();
    const oldCount = history.length;

    if (oldCount <= 50) {
      alert(`O histórico atual tem apenas ${oldCount} corridas (limite: 50). Não é necessário limpar.`);
      return;
    }

    if (!confirm(`O histórico atual tem ${oldCount} corridas.\n\nIsso irá manter apenas as 50 corridas mais recentes e remover as ${oldCount - 50} mais antigas.\n\nOs dados das corridas removidas não serão recuperados.\n\nDeseja continuar?`)) {
      return;
    }

    try {
      const trimmedHistory = history.slice(0, 50);
      Storage.saveHistory(trimmedHistory);
      Storage.recalculateAllFromHistory();
      alert(`✅ Histórico limpo!\n\nCorridas removidas: ${oldCount - 50}\nCorridas mantidas: 50\n\nAs classificações foram recalculadas.`);
      this.updateStorageSizeDisplay();
    } catch (e) {
      alert(`❌ Erro ao limpar histórico: ${e.message}`);
    }
  },

  showStorageDetails() {
    const details = [];
    const keys = ['race_sim_settings', 'race_sim_drivers', 'race_sim_teams', 'race_sim_tracks',
                  'race_sim_seasons', 'race_sim_history', 'race_sim_hall_of_fame', 'race_sim_team_duels',
                  'race_sim_time_trials', 'race_sim_ranked_standings', 'race_sim_ranked_history',
                  'race_sim_team_divisions', 'race_sim_tournaments', 'race_sim_ranks', 'race_sim_ranks_ranked'];

    let total = 0;
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        const size = value.length;
        total += size;
        details.push(`${key}: ${(size / 1024).toFixed(2)} KB`);
      }
    });

    const message = `Detalhes do Armazenamento:\n\n${details.join('\n')}\n\nTOTAL: ${(total / 1024).toFixed(2)} KB (${(total / (1024 * 1024)).toFixed(2)} MB)`;
    alert(message);
  }
};
