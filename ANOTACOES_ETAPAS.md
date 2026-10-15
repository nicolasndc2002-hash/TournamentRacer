# RACE SIMULATOR — PLANO DE EXECUÇÃO EM ETAPAS (ROADMAP)

Documento de anotação e acompanhamento do desenvolvimento do **Race Simulator**, baseado na especificação completa do projeto ([PROJETO INTEIRO](file:///c:/Users/rhuan/OneDrive/%C3%81rea%20de%20Trabalho/Tournament%20Racer/PROJETO%20INTEIRO)).

---

## 📌 Visão Geral e Diretrizes Obrigatórias
- **Tecnologias:** Exclusivamente **HTML5, CSS3 puro e Vanilla JavaScript** (Zero frameworks, zero dependências externas ou build tools).
- **Execução:** 100% offline, diretamente no navegador via `index.html`.
- **Persistência:** `LocalStorage` estruturado e sem duplicidade.
- **Design:** Tema escuro estilo central de telemetria/transmissão, glassmorphism, tipografia moderna, animações suaves e microinterações.
- **Diferenciais Principais:** Simulação fluida de bolinhas seguindo `SVG path`, leaderboard em tempo real, tela pós-corrida e Replay determinístico baseado em frames.

---

## 🗺️ Divisão do Projeto em Etapas

### 🧱 ETAPA 1: Estrutura Base, Design System & LocalStorage Hub
- [x] Criar arquitetura modular de pastas (`css/`, `js/`).
- [x] Criar `index.html` com layout SPA profissional (Sidebar de navegação fixa, Header com status/temporada, Container dinâmico de visualização de páginas).
- [x] Criar `css/style.css`, `css/components.css` e tokens de design (cores HSL escuras, gradientes, glassmorphism, modais, cards, botões, badges, inputs).
- [x] Criar `js/storage.js` para persistência robusta no `LocalStorage`:
  - Modelo para Pilotos, Equipes, Pistas, Temporadas, Corridas, Histórico, Ranks, Configurações e Hall da Fama.
  - Carregamento de dados iniciais padrão (seed data: equipes e pilotos padrão, pistas padrão, ranks padrão, sistema de pontos).
- [x] Criar `js/app.js` e sistema de roteamento/troca de visualizações sem recarregar a página.

---

### 🏎️ ETAPA 2: Módulos de Gestão (CRUD) - Pilotos, Equipes e Pistas
- [x] **Pilotos (`js/pilots.js`):**
  - Listagem com visualização em cards modernos (foto/avatar, número, nacionalidade, equipe, badge de rank, cor).
  - Formulário modal para Criar/Editar/Excluir.
  - Atributos (0 a 100): Velocidade, Aceleração, Controle, Constância.
  - Estatísticas acumuladas e visualização do perfil detalhado.
- [x] **Equipes (`js/teams.js`):**
  - Listagem de equipes com cores primária e secundária (HEX), logo e pilotos vinculados.
  - Criar/Editar/Excluir equipes.
- [x] **Pistas & Circuitos SVG (`js/tracks.js`):**
  - Gerenciador de pistas (Nome, País, Comprimento, Voltas padrão, SVG Path).
  - Pistas pré-configuradas com circuitos SVG atraentes e caminhos (`path`) precisos para corrida com preview em tempo real.

---

### ⚙️ ETAPA 3: Configurações Globais e Editor de Ranks
- [x] **Configurações (`js/settings.js`):**
  - Alternador de tema, velocidade padrão da simulação, exibição em corrida (Número vs Sigla do piloto), Nome/Logo da categoria.
  - Tabela configurável de pontuação por posição (ex: 1º=25, 2º=18, etc.).
- [x] **Editor de Ranks (`js/ranks.js`):**
  - Sistema de ranks baseado em pontuação na temporada (Bronze, Silver, Gold, Platinum, Diamond, Master, Legend).
  - CRUD de ranks: Nome, Pontuação mínima, Cor HEX, Ícone, Ordem.
  - Componente de barra de progresso visual para o próximo rank.

---

### 🏁 ETAPA 4: Motor de Simulação de Corrida (O Coração do Projeto)
- [x] **Tela de Corrida (`js/race.js` & `css/race.css`):**
  - Painel Esquerdo: Leaderboard ao vivo com posições, pilotos, equipes, deltas de tempo (gap para líder) e animações de ultrapassagem/ganho/perda de posição.
  - Painel Central: Canvas/SVG responsivo do circuito com as bolinhas (com cores da equipe e label de número/sigla) navegando suavemente pelo `SVG path` (`getPointAtLength`).
  - Painel Direito: Telemetria (Volta atual/total, clima, líder, volta mais rápida ao vivo, velocidade média).
- [x] **Física & RNG Controlado:**
  - Variação de velocidade de acordo com trechos da pista e atributos do piloto (Velocidade, Aceleração, Controle, Constância) + aleatoriedade calibrada (RNG).
  - Cálculo de tempos de volta precisos (milissegundos), gaps e detecção de melhor volta.
- [x] **Captura de Frames para Replay:**
  - Gravação automática de snapshots de frames a cada intervalo de tempo durante a simulação (posição no path, gap, volta, leaderboard, eventos).

---

### 🏆 ETAPA 5: Tela de Pós-Corrida, Resultados & Atualização do Campeonato
- [x] **Página de Resultados do Grande Prêmio:**
  - Header do GP (Nome do GP, Temporada, Clima, Total de voltas, Melhor Volta da prova).
  - Tabela oficial obrigatória: *Posição | Nome | Equipe | Tempo Total / Gap | Volta Mais Rápida | Voltas completadas | Pontos*.
  - Cards de Destaque: 🏆 Vencedor, ⚡ Melhor Volta, ⭐ Piloto do Dia, 🚀 Maior Escalada de Posições.
  - Botões de ação: "Assistir Replay Fiel" ou "Ver Classificação do Campeonato".
- [x] **Processamento Automático de Dados:**
  - Cálculo e injeção de pontos conforme tabela configurada.
  - Atualização automática dos ranks dos pilotos na temporada.
  - Atualização de estatísticas acumuladas dos pilotos e equipes.
  - Salvamento completo da corrida e frames no Histórico.

---

### ⏪ ETAPA 6: Sistema Completo de Replay Fiel
- [x] **Player de Replay (`js/replay.js`):**
  - Carregamento dos frames gravados na corrida (sem recálculo de simulação).
  - Controles: Play (▶), Pause (⏸), Reiniciar (⏮), Seletor de Velocidade (1x, 2x, 4x).
  - Barra de progresso deslizável interativa (scrubbing/timeline) para avançar/retroceder instantaneamente para qualquer frame.
  - Sincronização em tempo real de posições no circuito SVG, leaderboard e voltas.

---

### 📊 ETAPA 7: Temporadas, Campeonato, Ranking, Histórico & Hall da Fama
- [x] **Temporadas (`js/championship.js`):**
  - Criação de temporada (Ano, Nome, Seleção de GPs e Pilotos).
  - Tabela de classificação geral da temporada atual.
- [x] **Ranking da Temporada (`js/ranking.js`):**
  - Visão detalhada de posições, ranks atuais, barras de progresso de rank, vitórias, pódios e voltas rápidas.
- [x] **Histórico de Corridas:**
  - Listagem de todos os GPs passados com acesso direto à página de resultados e replay de cada um.
- [x] **Hall da Fama (`js/hallOfFame.js`):**
  - Preservação histórica entre temporadas: Maiores campeões, maiores vencedores, recordes de voltas rápidas, maiores ranks e histórico anual.

---

### 🏎️ ETAPA 8: Novos Modos de Corrida, Perfis Completos & Hall da Fama Expandido
- [x] **Central de Modos de Corrida (`js/modesHub.js`):**
  - Hub visual com cards dedicados para cada modo: Campeonato, Equipe x Equipe, Time-Trial e Modo Ranqueado.
- [x] **Modo 2: Equipe x Equipe (`js/modeTeamDuel.js`):**
  - Confronto direto 1v1 entre escuderias, com seleção de pilotos, soma de pontos por equipe, placar e histórico de rivalidade.
- [x] **Modo 3: Time-Trial (`js/modeTimeTrial.js`):**
  - Sessão de contrarrelógio em pista limpa, cálculo de tempos e recordes por circuito.
- [x] **Modo 4: Competitivo Ranqueado (`js/modeRanked.js`):**
  - Sistema de MMR/Rating individual, divisões competitivas (Bronze a Legend) e tabela ranqueada dedicada.
- [x] **Perfis Completos e Enriquecidos:**
  - Pilotos (`Pilots.openProfileModal`): foto, atributos técnicos (0 a 100), aproveitamento %, pódios, melhor volta, histórico recente e MMR.
  - Equipes (`Teams.openTeamProfileModal`): construtores, cores, pilotos titulares e histórico de duelos 1v1 (V/D).
- [x] **Hall da Fama Multimodal Expandido (`js/hallOfFame.js`):**
  - Abas para Campeonato, Duelos de Equipes, Recordes de Time-Trial e Top Melhores Pilotos Ranqueados.


---

### 🖥️ ETAPA 8: Dashboard Principal, Polimento & Validação Final
- [x] **Dashboard (`js/dashboard.js` & `css/dashboard.css`):**
  - Próxima corrida programada, Último vencedor, Top 3 da temporada em formato de pódio, Melhor volta da temporada e lista rápida de histórico.
- [x] **Polimento Visual & Responsividade:**
  - Layout escuro moderno estilo central de transmissão de corrida, glassmorphism, responsividade e micro-animações.

---

## 📝 Status Atual
- **Status:** Todas as 8 etapas implementadas com sucesso e integradas via Vanilla JS & CSS puro!
