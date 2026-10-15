/* ==========================================================================
   RACE SIMULATOR - GAME MODES HUB (js/modesHub.js)
   ========================================================================== */

const ModesHub = {
  render() {
    const season = Storage.getCurrentSeason();
    const duels = Storage.getTeamDuels();
    const trials = Storage.getTimeTrials();
    const rankedStandings = Storage.getRankedStandings();
    const topRanked = [...rankedStandings].sort((a, b) => b.rating - a.rating)[0];
    const drivers = Storage.getDrivers();
    const topDriver = topRanked ? drivers.find(d => d.id === topRanked.driverId) : null;

    return `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Banner Central dos Modos -->
        <div class="dashboard-hero" style="background: linear-gradient(135deg, rgba(0, 229, 255, 0.12) 0%, rgba(139, 92, 246, 0.15) 100%), var(--bg-card);">
          <div class="hero-text">
            <span class="badge" style="background: var(--grad-brand); color: #fff; font-weight: 800; margin-bottom: 8px;">
              SELECIONE SEU DESAFIO
            </span>
            <h2 style="font-size: 1.8rem; font-weight: 800;">🏁 Modos de Corrida & Competição</h2>
            <p>Escolha como deseja correr: dispute a temporada completa, enfrente equipes rivais, bata recordes no contrarrelógio ou escale a classificação ranqueada individual.</p>
          </div>
        </div>

        <!-- Grid dos Modos Principais -->
        <div class="grid-2">
          <!-- 1. CAMPEONATO -->
          <div class="glass-panel mode-card" style="border-top: 4px solid var(--accent-gold); display: flex; flex-direction: column; justify-content: space-between; gap: 16px; padding: 24px; position: relative; overflow: hidden;">
            <div style="position: absolute; right: -15px; top: -15px; font-size: 6rem; opacity: 0.08; user-select: none;">🏆</div>
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span class="badge" style="background: rgba(255, 183, 3, 0.15); color: var(--accent-gold); font-weight: 700;">MODO OFICIAL</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${season ? season.races.length + ' GPs' : 'Temporada'}</span>
              </div>
              <h3 style="font-size: 1.35rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span>🏆</span> Campeonato Mundial
              </h3>
              <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">
                Dispute o calendário oficial da temporada acumulando pontos a cada GP, evoluindo no ranking de construtores e conquistando o título de campeão mundial.
              </p>
            </div>

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: var(--radius-md); font-size: 0.82rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-dim);">Temporada Atual:</span>
                <strong>${season ? season.name : 'Nenhuma'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">Progresso de GPs:</span>
                <strong>${season ? season.races.filter(r => r.completed).length + ' / ' + season.races.length : '0/0'}</strong>
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%; justify-content: center; font-weight: 700;" onclick="App.navigateTo('championship')">
              Acessar Campeonato ➔
            </button>
          </div>

          <!-- 2. EQUIPE x EQUIPE -->
          <div class="glass-panel mode-card" style="border-top: 4px solid var(--accent-red); display: flex; flex-direction: column; justify-content: space-between; gap: 16px; padding: 24px; position: relative; overflow: hidden;">
            <div style="position: absolute; right: -15px; top: -15px; font-size: 6rem; opacity: 0.08; user-select: none;">⚔️</div>
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span class="badge" style="background: rgba(255, 51, 102, 0.15); color: var(--accent-red); font-weight: 700;">CONFRONTO DIRETO 1v1</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${duels.length} Duelos Salvos</span>
              </div>
              <h3 style="font-size: 1.35rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span>⚔️</span> Equipe x Equipe
              </h3>
              <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">
                Disputa direta entre duas escuderias para decidir quem é a mais rápida. Todos os pilotos das equipes duelam no asfalto com placar de pontos somados e rivalidade histórica!
              </p>
            </div>

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: var(--radius-md); font-size: 0.82rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-dim);">Duelos Realizados:</span>
                <strong>${duels.length} confrontos</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">Formato:</span>
                <strong>Pontuação Combinada por Equipe</strong>
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%; justify-content: center; font-weight: 700; background: var(--grad-red);" onclick="App.navigateTo('mode-team-duel')">
              Entrar em Equipe x Equipe ➔
            </button>
          </div>

          <!-- 3. TIME-TRIAL -->
          <div class="glass-panel mode-card" style="border-top: 4px solid var(--accent-cyan); display: flex; flex-direction: column; justify-content: space-between; gap: 16px; padding: 24px; position: relative; overflow: hidden;">
            <div style="position: absolute; right: -15px; top: -15px; font-size: 6rem; opacity: 0.08; user-select: none;">⏱️</div>
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span class="badge" style="background: rgba(0, 229, 255, 0.15); color: var(--accent-cyan); font-weight: 700;">CONTRARRELÓGIO PURO</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${trials.length} Recordes Gravados</span>
              </div>
              <h3 style="font-size: 1.35rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span>⏱️</span> Time-Trial (Recordes de Pista)
              </h3>
              <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">
                Sem tráfego ou regras de corrida: apenas você, o traçado e o cronômetro. Faça voltas voadoras com qualquer piloto em qualquer circuito e crave seu nome no topo do Hall da Fama.
              </p>
            </div>

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: var(--radius-md); font-size: 0.82rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-dim);">Sessões Registradas:</span>
                <strong>${trials.length} tentativas</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">Foco:</span>
                <strong>Telemetria & Menor Tempo</strong>
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%; justify-content: center; font-weight: 700;" onclick="App.navigateTo('mode-time-trial')">
              Entrar no Time-Trial ➔
            </button>
          </div>

          <!-- 4. RANKED -->
          <div class="glass-panel mode-card" style="border-top: 4px solid var(--accent-purple); display: flex; flex-direction: column; justify-content: space-between; gap: 16px; padding: 24px; position: relative; overflow: hidden;">
            <div style="position: absolute; right: -15px; top: -15px; font-size: 6rem; opacity: 0.08; user-select: none;">🎖️</div>
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span class="badge" style="background: rgba(139, 92, 246, 0.15); color: var(--accent-purple); font-weight: 700;">COMPETITIVO INDIVIDUAL</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Sistema de Rating / ELO</span>
              </div>
              <h3 style="font-size: 1.35rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span>🎖️</span> Modo Ranqueado (Ranked)
              </h3>
              <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">
                Focado 100% no desempenho individual de cada piloto. Cada corrida distribui ganhos ou perdas de Rating (MMR) em divisões de Bronze a Legend com tabela de classificação dedicada.
              </p>
            </div>

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: var(--radius-md); font-size: 0.82rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-dim);">Líder Ranqueado Atual:</span>
                <strong>${topDriver ? topDriver.name + ' (' + topRanked.rating + ' MMR)' : 'Em disputa'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">Patamares:</span>
                <strong>Bronze ➔ Prata ➔ Ouro ➔ Diamante ➔ Legend</strong>
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%; justify-content: center; font-weight: 700; background: linear-gradient(135deg, var(--accent-purple) 0%, #3b82f6 100%);" onclick="App.navigateTo('mode-ranked')">
              Entrar no Modo Ranqueado ➔
            </button>
          </div>

          <!-- 5. CASUAL -->
          <div class="glass-panel mode-card" style="border-top: 4px solid var(--accent-green); display: flex; flex-direction: column; justify-content: space-between; gap: 16px; padding: 24px; position: relative; overflow: hidden;">
            <div style="position: absolute; right: -15px; top: -15px; font-size: 6rem; opacity: 0.08; user-select: none;">🏎️</div>
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span class="badge" style="background: rgba(0, 245, 155, 0.15); color: var(--accent-green); font-weight: 700;">SEM PRESSÃO</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Corrida rápida</span>
              </div>
              <h3 style="font-size: 1.35rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"><span>🏎️</span> Modo Casual</h3>
              <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">Corra por diversão em uma prova rápida, com pilotos embaralhados e sem etapa de qualifying.</p>
            </div>
            <button class="btn btn-primary" style="width: 100%; justify-content: center; font-weight: 700; background: var(--accent-green); color: #07130e;" onclick="App.navigateTo('mode-casual')">Configurar Corrida Casual ➔</button>
          </div>
        </div>
      </div>
    `;
  }
};
