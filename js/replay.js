/* ==========================================================================
   RACE SIMULATOR - REPLAY STUB (js/replay.js)
   ========================================================================== */

const Replay = {
  loadRace(raceRecord) {
    App.navigateTo('history');
  },

  renderView() {
    return `
      <div class="glass-panel" style="text-align: center; padding: 40px; max-width: 600px; margin: 40px auto;">
        <h2>📜 Histórico de Corridas</h2>
        <p style="color: var(--text-muted); margin: 12px 0 20px;">
          O sistema de replay foi desativado. O resultado completo e as estatísticas de todos os pilotos são registrados no Histórico de Corridas.
        </p>
        <button class="btn btn-primary" onclick="App.navigateTo('history')">Ver Histórico de Corridas</button>
      </div>
    `;
  }
};
