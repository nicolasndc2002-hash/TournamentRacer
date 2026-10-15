/* ==========================================================================
   RACE SIMULATOR - MAIN APP CONTROLLER & SPA ROUTER (js/app.js)
   ========================================================================== */

const App = {
  currentView: 'dashboard',

  init() {
    // 1. Initialize LocalStorage and Seed Data
    Storage.init();

    // 2. Apply theme from settings
    const settings = Storage.getSettings();
    if (settings.theme === 'light') {
      document.body.classList.add('light-theme');
    }

    this.updateHeaderBrand();

    // 3. Register Navigation Listeners
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) {
          this.navigateTo(view);
        }
      });
    });

    // 4. Initial Navigation
    this.navigateTo('dashboard');
  },

  updateHeaderBrand() {
    const settings = Storage.getSettings();
    const season = Storage.getCurrentSeason();

    const titleEl = document.getElementById('app-brand-title');
    const logoEl = document.getElementById('app-brand-logo');
    const seasonBadgeEl = document.getElementById('sidebar-season-name');

    if (titleEl) titleEl.textContent = settings.categoryName || 'Tournament Racer';
    if (logoEl) logoEl.textContent = settings.categoryLogo || '🏎️';
    if (seasonBadgeEl && season) seasonBadgeEl.textContent = `${season.name} (${season.year})`;
  },

  navigateTo(viewName) {
    this.currentView = viewName;

    // Update active nav class
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Page Header Title
    const headerTitle = document.getElementById('page-header-title');
    const titles = {
      'dashboard': 'Dashboard Principal',
      'modes-hub': 'Central de Modos de Corrida',
      'championship': 'Campeonato & Calendário',
      'mode-team-duel': 'Modo 2: Equipe x Equipe',
      'mode-time-trial': 'Modo 3: Time-Trial (Contrarrelógio)',
      'mode-ranked': 'Modo 4: Competitivo Ranqueado',
      'mode-casual': 'Modo 5: Casual',
      'tournament': 'Torneios',
      'ranking': 'Ranking de Pilotos',
      'achievements': 'Galeria de Conquistas (Pilotos & Equipes)',
      'drivers': 'Gerenciamento de Pilotos',
      'driver-profile': 'Perfil do Piloto',
      'teams': 'Gerenciamento de Equipes',
      'team-profile': 'Perfil da Equipe',
      'tracks': 'Pistas & Circuitos SVG',
      'ranks': 'Sistema & Editor de Ranks',
      'hall-of-fame': 'Hall da Fama & Recordes',
      'history': 'Histórico de Corridas',
      'settings': 'Configurações',
      'race-live': 'Simulação de Corrida ao Vivo',
      'race-results': 'Resultado Oficial do GP',
      'qualify-results': 'Classificação Oficial (Qualifying)',
      'replay-view': 'Player de Replay Fiel'
    };

    if (headerTitle) {
      headerTitle.textContent = titles[viewName] || 'Race Simulator';
    }

    // Render corresponding view
    const container = document.getElementById('view-container');
    if (!container) return;

    switch (viewName) {
      case 'dashboard':
        container.innerHTML = Dashboard.render();
        break;
      case 'modes-hub':
        container.innerHTML = ModesHub.render();
        break;
      case 'championship':
        container.innerHTML = Championship.render();
        break;
      case 'mode-team-duel':
        container.innerHTML = ModeTeamDuel.render();
        break;
      case 'mode-time-trial':
        container.innerHTML = ModeTimeTrial.render();
        break;
      case 'mode-ranked':
        container.innerHTML = ModeRanked.render();
        break;
      case 'mode-casual':
        container.innerHTML = ModeCasual.render();
        break;
      case 'tournament':
        container.innerHTML = Tournament.render();
        break;
      case 'ranking':
        container.innerHTML = Ranking.render();
        break;
      case 'achievements':
        container.innerHTML = Achievements.render();
        break;
      case 'drivers':
        container.innerHTML = Pilots.renderList();
        break;
      case 'driver-profile':
        container.innerHTML = Pilots.renderProfilePage();
        break;
      case 'teams':
        container.innerHTML = Teams.renderList();
        break;
      case 'team-profile':
        container.innerHTML = Teams.renderProfilePage();
        break;
      case 'tracks':
        container.innerHTML = Tracks.renderList();
        break;
      case 'ranks':
        container.innerHTML = Ranks.renderEditor();
        break;
      case 'hall-of-fame':
        container.innerHTML = HallOfFame.render();
        break;
      case 'history':
        container.innerHTML = this.renderHistoryView();
        break;
      case 'settings':
        container.innerHTML = Settings.render();
        break;
      case 'qualify-results':
        container.innerHTML = Race.renderQualifyView();
        break;
      case 'race-live':
        container.innerHTML = Race.renderLiveView();
        break;
      case 'race-results':
        container.innerHTML = Championship.renderResultsView();
        break;
      case 'replay-view':
        container.innerHTML = Replay.renderView();
        break;
      default:
        container.innerHTML = Dashboard.render();
    }
  },

  renderHistoryView() {
    const history = Storage.getHistory();

    return `
      <div class="glass-panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">📜 Histórico de Corridas</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
              Reveja o resultado oficial de qualquer prova realizada.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="badge" style="background: var(--bg-tertiary);">${history.length} GPs Salvos</span>
            ${history.length > 0 ? `<button class="btn btn-danger btn-sm" onclick="App.clearHistoryConfirm()">🗑️ Limpar Todo o Histórico</button>` : ''}
          </div>
        </div>

        <div class="table-container" style="margin-top: 16px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Grande Prêmio</th>
                <th>Circuito</th>
                <th>Vencedor</th>
                <th>Melhor Volta</th>
                <th>Voltas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(race => `
                <tr>
                  <td>${race.date}</td>
                  <td><strong>${Utils.escapeHtml(race.gpName)}</strong></td>
                  <td>${Utils.getCountryFlag(race.country)} ${Utils.escapeHtml(race.trackName)}</td>
                  <td>
                    <span style="color: var(--accent-gold); font-weight: bold;">
                      🏆 ${Utils.escapeHtml(race.results[0]?.driverName || 'N/A')}
                    </span>
                  </td>
                  <td>
                    <span style="font-family: var(--font-mono); color: var(--accent-purple);">
                      ${Utils.formatTime(race.fastestLap?.timeMs)} (${race.fastestLap?.driverName || 'N/A'})
                    </span>
                  </td>
                  <td>${race.totalLaps}</td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm" onclick="Championship.viewGpResult('${race.gpId}')">Resultados</button>
                      <button class="btn btn-danger btn-sm" title="Apagar Corrida e Sincronizar Perfis" onclick="App.deleteSingleRace('${race.id}')">✕</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
              ${history.length === 0 ? '<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 30px;">Nenhuma corrida realizada ainda.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  deleteSingleRace(raceId) {
    if (confirm('Tem certeza que deseja apagar esta corrida do histórico? Os perfis dos pilotos e estatísticas serão recalculados automaticamente!')) {
      Storage.deleteRaceRecord(raceId);
      this.navigateTo('history');
    }
  },

  clearHistoryConfirm() {
    if (confirm('Atenção: Deseja apagar TODAS as corridas do histórico? As estatísticas e pontos dos perfis serão zerados!')) {
      Storage.clearAllHistory();
      this.navigateTo('history');
    }
  },

  // Modal Manager
  showModal(html) {
    const existing = document.getElementById('global-modal-wrapper');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.id = 'global-modal-wrapper';
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 250);
    }
  }
};

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
