# RACE SIMULATOR — AJUSTES E MELHORIAS (ANOTACOES_AJUSTES.md)

Arquivo de registro e controle para as correções e novas funcionalidades solicitadas.

---

## 📋 Lista de Tarefas / Ajustes Solicitados:

### 1. 🏎️ Visual da Simulação: Sobreposição de Bolinhas (Z-Index / Render Order)
- **Problema:** Quando os carros/bolinhas estão juntos ou disputando posição, a ordem visual fica confusa.
- **Solução:** No loop de renderização do SVG (`js/race.js` e `js/replay.js`), reorganizar/reordenar os elementos SVG `<g>` no container para que a bolinha do piloto que estiver **na frente** sempre sobreponha a que está atrás (maior z-index / último no DOM SVG).

---

### 2. 🏁 Construtor Visual de Pistas Ponto a Ponto (Track Path Builder)
- **Problema:** Criar uma pista exigia digitar o comando SVG Path manualmente.
- **Solução:** Na criação de pistas (`js/tracks.js`), adicionar o **Editor Interativo / Construtor de Pista**:
  - Um canvas/SVG onde o usuário pode clicar para adicionar pontos (A, B, C, D, E...) e conectá-los com curva suave fechada.
  - Botões para: Adicionar Ponto, Desfazer Último Ponto, Fechar Circuito Automaticamente e Limpar.
  - Alternância fácil entre "Modo Construtor Visual (Cliques)" e "Modo Texto SVG Direto".

---

### 3. 🐛 Correção no Modal "Adicionar GP" no Campeonato
- **Problema:** Ao preencher os dados e selecionar a pista no modal de Adicionar GP, o formulário apresentava falha e não salvava o GP.
- **Solução:** Corrigir a função `Championship.saveGp(e)` e `Championship.openGpModal()` em `js/championship.js`, garantindo que o array de corridas da temporada ativa seja atualizado e salvo corretamente no LocalStorage com id único e recarga imediata da view.

---

### 4. 🗑️ Botões de Limpar / Apagar Replays, Histórico e Campeonatos
- **Solução:**
  - Na aba **Histórico & Replay (`js/app.js` / `js/championship.js`)**: Botão de "Excluir Corrida" individual em cada linha + Botão "Limpar Todo o Histórico de Replays".
  - Na aba **Campeonato (`js/championship.js`)**: Botão para "Excluir GP" do calendário antes ou depois de realizado, e botão "Excluir / Reiniciar Campeonato".

---

### 5. 🔄 Sincronização e Recálculo Automático ao Apagar Dados
- **Solução:**
  - Criar função central `Storage.recalculateAllFromHistory()` / `Championship.recalculateStandings()`:
  - Ao excluir um GP finalizado do histórico, recalcular automaticamente:
    - Pontuação e estatísticas dos pilotos na temporada ativa.
    - Status do GP no calendário da temporada (volta para não concluído se aplicável).
    - Estatísticas de vitórias/pódios/voltas rápidas dos pilotos.
    - Ranks da temporada.
    - Hall da Fama.

---

### 6. 🚥 Sequência de Luzes de Largada (Start Lights Countdown)
- **Solução:**
  - Ao iniciar um GP, antes dos carros começarem a andar:
  - Exibir overlay visual emocionante estilo Fórmula 1 / Motorsport no topo da tela com o fundo e a pista totalmente visíveis.
  - 5 luzes vermelhas acendendo uma a uma (1... 2... 3... 4... 5...).
  - Apagamento das luzes: **LARGADA! / GREEN LIGHTS!** e os carros disparam.

---

### 7. 🏁 Grid de Largada Diagonal (F1 Staggered Grid)
- **Solução:**
  - Os carros agora se posicionam em zigue-zague / diagonal alternada (lado esquerdo / lado direito da pista) exatamente como no grid oficial da Fórmula 1.
  - O cálculo utiliza a normal perpendicular ao vetor tangente do circuito SVG para posicionamento preciso nas curvas ou retas da largada.

---

### 8. ⏱️ Sistema de Qualificação Pré-Corrida (Qualifying / Pole Position)
- **Solução:**
  - Antes de qualquer Grande Prêmio, o sistema realiza a **Sessão de Classificação (Qualify)**.
  - Calcula voltas voadoras rápidas com base nos atributos do piloto (Velocidade, Aceleração, Controle e Constância).
  - Exibe a tela de resultado da Classificação com destaque para o **Pole Position**, tabela com tempos e gaps.
  - Um botão **"Iniciar Corrida Oficial ➔"** carrega o grid definido na classificação diretamente para a largada da prova.

---

### 9. 🏛️ Filtro por Pista na Seção de Melhores Voltas do Hall da Fama
- **Solução:**
  - Adicionado um seletor dropdown na aba **Hall da Fama ➔ Melhores Voltas**.
  - Permite alternar entre "Todas as Pistas (Geral)" e cada um dos circuitos cadastrados (Monza, Interlagos, Mônaco, pistas customizadas, etc.).
  - Filtra instantaneamente o ranking histórico dos 5 tempos mais rápidos gravados especificamente naquele circuito, exibindo o piloto, a data/GP e o tempo em milissegundos.

---

### 10. 👥 Seletor de Equipes Participantes antes do GP
- **Solução:**
  - Ao iniciar qualquer GP, abre-se uma tela modal interativa permitindo marcar/desmarcar quais escuderias irão participar daquela etapa.
  - Limite configurado com contador em tempo real: **Máximo de 10 equipes (até 20 pilotos)**.
  - Botões rápidos para "Marcar Todas" e "Desmarcar Todas".
  - Apenas os pilotos das equipes selecionadas disputam o Qualifying e a Corrida Oficial.

---

### 11. ⚙️ Tabela Dinâmica de Pontuação (Adicionar / Remover Posições)
- **Solução:**
  - Na página de **Configurações**, a tabela de pontuação agora é totalmente dinâmica.
  - Botões para **"+ Adicionar Posição"** e **"- Remover Última"**, além de botão individual `✕` em cada linha.
  - Permite configurar campeonatos que pontuam Top 5, Top 10, Top 15 ou qualquer quantidade desejada de posições, salvando no LocalStorage.

---

### 12. 🎖️ Painel Dedicado de Configurações das Corridas Ranqueadas
- **Solução:**
  - Criada uma seção isolada e estilizada em **Configurações** especificamente para o Modo Ranqueado (MMR / ELO).
  - Permite escolher o **Sistema de Cálculo** (MMR por Tabela de Posição vs ELO Rating com Fator K), **Rating Base Inicial** e **K-Factor**.
  - **Tabela dinâmica de variação de pontos por posição ranqueada**: adicionar, editar e remover posições com indicador visual de ganho (▲), perda (▼) ou neutro (●).
  - O motor do `ModeRanked.js` lê diretamente essas regras customizadas para atualizar o MMR dos pilotos após cada corrida.

---

### 13. ⏱️ Simulação Real no Modo Time-Trial & Gerenciamento de Recordes
- **Solução:**
  - O modo **Time-Trial** agora executa a **simulação real e animada na pista** via `Race.startSoloTimeTrial`, com o piloto acelerando solo e completando as voltas com física completa, telemetria ao vivo e captura de frames para replay.
  - Adicionado botão de **"🗑️ Apagar"** tempo na tabela de recordes do circuito.
  - Sincronização automática com `Storage.deleteTimeTrial` e `Storage.recalculateDriverBestLaps`, garantindo que a melhor volta da carreira dos pilotos e o Hall da Fama permaneçam consistentes ao apagar um tempo.

---

### 14. 🎖️ Padronização da Coluna Impacto (Ranqueado)
- **Solução:**
  - Configurado para atualizar em tempo real a coluna **Impacto**:
    - `> 0`: **▲ GANHO** (verde)
    - `= 0`: **● NEUTRO** (cinza/dim)
    - `< 0`: **▼ PERDA** (vermelho)

---

### 15. 📊 Dashboard Principal Enriquecido e Multimodal
- **Solução:**
  - Reformulado o layout de [dashboard.js](file:///c:/Users/rhuan/OneDrive/Área de Trabalho/Tournament Racer/js/dashboard.js) contemplando os 4 modos de jogo:
    - 4 Cards Métricos Interativos dos 4 modos (Campeonato, Equipe x Equipe, Time-Trial e Líder Ranqueado MMR).
    - Widget de Pódio Top 3 da Temporada + Widget de Top Pilotos Ranqueados (com tiers, partidas, vitórias e MMR).
    - Lista de Últimas Corridas com botão direto para Replay + Visão Geral de Escuderias com acesso rápido aos perfis.

### 16. 🏎️ Qualifying Visual e Largura Ajustável da Classificação
- **Solução:**
  - O Qualifying agora executa uma volta visual na mesma pista SVG e no mesmo loop de animação da corrida, com luzes de largada, bolinhas dos pilotos, telemetria e classificação em tempo real.
  - Ao final da volta visual, os tempos calculados por piloto são organizados no grid oficial antes da corrida.
  - Adicionada uma barra lateral arrastável entre a classificação ao vivo e a pista; ela altera somente a largura do painel dentro da simulação, sem redimensionar o layout global.

### 17. 🏁 Qualifying em 5 Voltas, Time-Trial Preciso e Modo Casual
- **Solução:**
  - O Qualifying passou a ter 5 voltas visuais; cada piloto corre simultaneamente e a pole respeita o tempo individual de sua sessão, sem esperar uma simulação sequencial.
  - O Time-Trial agora ordena e salva os resultados pelo `finishTimeMs` individual, preservando cada milissegundo e removendo o atraso artificial por posição.
  - Adicionado o Modo Casual, com seleção de pista e voltas, grid aleatório e largada direta sem Qualifying.

### 18. 🔎 Filtros, Participantes do Casual, Coordenadas do Construtor e Atividades
- **Solução:**
  - Adicionados filtros instantâneos nas páginas de Pilotos, Equipes, Pistas, Ranking e Time-Trial, sem perder o foco do campo durante a digitação.
  - O Modo Casual agora permite selecionar equipes e pilotos; somente a interseção das seleções participa da corrida.
  - O construtor visual converte o clique usando a matriz real do SVG, corrigindo o deslocamento causado pelo ajuste proporcional do canvas.
  - Os perfis de pilotos e equipes passaram a exibir atividades separadas em MODO CASUAL, RANQUEADO, CAMPEONATO e TIME-TRIAL; nesta última categoria são mostrados tempo e posição atual por pista, derivados dos registros salvos para refletir exclusões imediatamente.
  - A inicialização tardia da simulação foi protegida para não acessar uma sessão já encerrada após navegação.

### 19. 🏁 Enquadramento, Largada/Chegada e Filtros do Casual
- **Solução:**
  - Adicionado o botão **Centralizar Pista** no criador/ editor; ele calcula o `viewBox` pelo limite real do traçado e salva o novo enquadramento.
  - Adicionados controles para definir a posição percentual da linha de largada/chegada e o sentido normal ou inverso do circuito. A simulação utiliza esses dados para desenhar a linha e mover os pilotos na direção configurada.
  - No Casual, removida a coluna separada de equipes participantes. A seleção agora fica em uma lista única de pilotos, com pesquisa por nome/sigla/número e filtro por equipe; a equipe exibida ao lado de cada piloto facilita a conferência.
  - O seletor de sentido permanece sincronizado com a seta e a linha de referência do construtor ao ser alterado.

### 20. ⏱️ Gap por Melhor Volta no Qualifying e Time-Trial
- **Solução:**
  - Criada uma classificação específica para Qualifying e Time-Trial baseada exclusivamente em `bestLapTime` em milissegundos.
  - Pilotos com melhor volta válida são ordenados pelo menor tempo; pilotos sem volta ficam ao final com `--:--.---`.
  - O líder exibe sua melhor volta no formato `MM:SS.mmm`; os demais exibem somente a diferença para o melhor tempo do líder, sem a letra `s`.
  - A classificação é recalculada a cada atualização da simulação, permitindo troca imediata de líder quando surge uma volta mais rápida.
  - Corridas normais continuam usando a lógica original de classificação e gap.

### 21. 🏆 Um Único Melhor Tempo por Piloto e Pista
- **Solução:**
  - Criada uma coleção deduplicada de Time-Trial que mantém somente o menor `bestLapMs` de cada piloto em cada pista.
  - Perfis de pilotos/equipes, página de Time-Trial e Hall da Fama passaram a exibir apenas esse melhor registro, evitando duplicidade e mantendo a posição correta no ranking da pista.

### 22. 🛑 Frenagem nas Curvas
- **Solução:**
  - Adicionado o atributo de performance `braking` (Frenagem) aos pilotos, disponível no cadastro/edição, cards e perfil.
  - A simulação mede a mudança de direção do caminho SVG em tempo real; quanto mais fechada a curva e menor a frenagem do piloto, maior a redução de velocidade aplicada naquele trecho.
  - Pilotos antigos sem o atributo usam valor padrão 75, mantendo compatibilidade com os dados já salvos.
  - O OVR dos pilotos foi atualizado para considerar os cinco atributos de performance.

### 23. 👤 Perfis Independentes, Rivais, Limpeza Global e Bandeiras PNG
- **Solução:**
  - Perfis de pilotos e equipes passaram a ser páginas independentes, com layout organizado por resumo, estatísticas, atividades e navegação de retorno.
  - Adicionada rivalidade de pilotos baseada em confrontos compartilhados e rivalidade de equipes baseada no histórico de duelos.
  - O perfil de piloto, perfil de equipe e tela Time-Trial agora possuem acesso à limpeza global de todos os tempos, recalculando imediatamente os melhores tempos das carreiras.
  - A duplicidade do rank de temporada foi removida do perfil independente; o rank aparece somente como badge no resumo.
  - A seção ranqueada do perfil mostra posição atual no ranking MMR e últimos resultados registrados.
  - As bandeiras passaram de emojis para imagens PNG via `flagcdn.com`, com fallback para países não mapeados.
  - A limpeza global também remove registros antigos de Time-Trial do histórico de replays, mantendo todas as telas sincronizadas.

### 24. 🏎️ Velocidade Relacionada à Extensão e Frenagem Suave
- **Solução:**
  - A taxa de avanço da simulação agora considera `lengthKm`: pistas maiores exigem mais tempo por volta e pistas menores são percorridas mais rapidamente.
  - O tempo-base do Qualifying também é escalado pela extensão da pista, mantendo a comparação de desempenho coerente entre circuitos.
  - A velocidade em curvas passou a usar uma transição suavizada por frame: a bolinha desacelera progressivamente ao entrar em uma curva e recupera velocidade ao sair, tornando perceptível a influência do atributo Frenagem sem alterar a lógica das corridas.

### 20. 🧮 Pontuação Restrita por Modo e Gap Cronometrado
- **Solução:**
  - Corridas Casuais e Time-Trial continuam podendo gerar resultado/replay, mas não alteram pontuação, classificação, estatísticas ou melhor volta de campeonato; o Casual também não cria registro de tempo de pista.
  - O gap exibido no Qualifying usa a diferença entre os tempos de volta dos pilotos; no Time-Trial usa o tempo estimado individual e, após a chegada, o tempo exato de cruzamento da linha, sempre em segundos e milissegundos.
  - Mesmo após cruzar a linha, Qualifying e Time-Trial continuam exibindo o gap cronometrado; “FIM” permanece reservado para corridas comuns.

### 25. ⚡ Sincronização do Leaderboard e Gap com as Bolinhas na Simulação
- **Solução:**
  - Corrigida a desincronização entre a posição visual das bolinhas na pista e o painel de classificação ao vivo (`race-leaderboard-list`).
  - Em cada frame da simulação, os elementos DOM das linhas de piloto são localizados por `data-driver-id` e reordenados na ordem exata de `session.leaderboard`.
  - A bolinha da frente na pista agora corresponde sempre ao piloto no topo da tabela, mantendo nomes, crachás de posição (`P1`, `P2`...) e gaps dinâmicos perfeitamente alinhados durante ultrapassagens.
  - O gap em relação ao líder passa a considerar o tempo base por volta da pista e a indicar `+X Voltas` para retardatários.

### 26. 🏆 Agrupamento por Série no Ranking de Pilotos e Hall da Fama
- **Solução:**
  - No **Ranking de Pilotos** (`js/ranking.js`), a exibição passou a ser agrupada por Série/Divisão (Série A, Série B, etc.), com cartões e tabelas independentes para cada divisão, alinhando a visualização à Tabela de Construtores.
  - No **Hall da Fama** (`js/hallOfFame.js`), os recordes históricos (Mais Vitórias, Mais Pódios, Mais Poles e Melhores Voltas) no modo Campeonato passaram a ser calculados e apresentados isoladamente para cada série/divisão.
  - Adicionado um seletor dropdown de Série/Divisão no topo do Hall da Fama para permitir filtrar uma série específica ou visualizar todas organizadas lado a lado.

### 27. 📊 Correção e validação do Dashboard
- **Problemas identificados:**
  - Uma chave extra encerrava o objeto `Dashboard` antes dos helpers do gráfico, causando `SyntaxError: Unexpected token '}'` e impedindo o carregamento do módulo.
  - `Dashboard.render()` chamava `renderTournamentsSection()`, mas esse método não existia, o que interrompia a montagem da página mesmo após corrigir a sintaxe.
  - A ordenação do pódio e do gráfico alterava diretamente `season.standings` em memória.
- **Correções:**
  - Mantidos os helpers dentro de `Dashboard` e criada a seção de torneios usando os dados e cartões já fornecidos por `Tournament`.
  - As ordenações do pódio e do gráfico agora trabalham sobre cópias dos standings.
- **Validação:** `node --check` passou nos 21 módulos JavaScript; o teste de renderização simulado passou sem torneios e com torneio ativo. Não foi feita inspeção visual no navegador nesta rodada.

### 28. 🏁 Virada Global de Temporada e Históricos nos Perfis
- **Virada de temporada:**
  - Iniciar uma nova temporada encerra e recria as temporadas ativas de todas as séries em conjunto, congelando a classificação de construtores antes de aplicar promoções e rebaixamentos.
  - Os standings dos campeonatos começam zerados; estatísticas de carreira e dados de MMR/histórico ranqueado são preservados.
  - Registros e replays de Time-Trial são apagados, e as melhores voltas de carreira são recalculadas com os registros restantes.
  - Cada temporada guarda a série, participantes e snapshots das equipes. O recálculo relaciona corridas pelo ID do GP para manter temporadas encerradas e seus resultados.
  - Séries sem temporada ativa recebem o próximo ano e IDs de GP únicos.
- **Perfis:**
  - O perfil do piloto e a aba **Temporadas** do perfil da equipe agora permitem selecionar cada temporada e consultar estatísticas e resultados dos GPs.
  - O histórico da equipe usa o `teamId` registrado em cada resultado e os snapshots sazonais, sem atribuir ao elenco atual resultados de temporadas anteriores; a tabela também discrimina resultado, grid, pontos e melhor volta de cada piloto por GP.
- **Validação:** sintaxe aprovada nos 21 módulos JavaScript; simulação do fluxo confirmou promoções, standings zerados, limpeza de Time-Trial e preservação do Ranqueado após recálculo.

### 29. 🏆 Configuração de Confrontos e Histórico de Torneios nos Perfis
- **Configuração por confronto:**
  - Antes de iniciar cada confronto, o modal permite selecionar pista e voltas da classificação e, separadamente, pista e voltas do GP oficial.
  - O Qualify usa seu próprio circuito e total de voltas; ao avançar, o motor troca para a pista e o total de voltas oficiais.
  - As escolhas, grid e tempos do Qualify são salvos junto ao resultado do confronto.
- **Perfis de pilotos e equipes:**
  - Adicionada uma página/aba exclusiva de torneios, com adversário, fase, desfecho, pistas e voltas de cada sessão e resultados dos pilotos.
  - O gráfico SVG resume vitórias, derrotas e empates por fase; o histórico completo dos confrontos permanece consultável.

### 30. 🧩 Chaveamento Horizontal dos Torneios
- Os confrontos agora são agrupados em colunas horizontais por fase, com cartões de participantes, estado da partida e destaque para o vencedor.
- A área permite rolagem horizontal em telas estreitas e exibe em cada confronto a pista e o total de voltas de Qualify e GP.
- O botão **Iniciar Confronto** permanece disponível dentro de cada partida pronta; confrontos concluídos mantêm o acesso ao resultado.
- **Validação:** `node --check js/tournament.js` e diagnósticos do editor sem erros.

### 31. 🌍 Bandeiras no Grid do Simulador
- As bandeiras de nacionalidade agora aparecem junto ao nome do piloto no leaderboard ao vivo e no grid oficial do Qualify.
- A nacionalidade acompanha os racers durante Qualify, corrida oficial e Time-Trial para manter a identificação consistente.
- Corrigido o piscar das imagens: as linhas do leaderboard só são movidas no DOM quando a ordem dos pilotos muda, sem reanexá-las a cada frame.
- A câmera POV agora pode ser ativada clicando na bolinha do piloto no circuito; o evento usa `pointerdown` para evitar perder o clique enquanto a bolinha se move. Enter e Espaço também ativam o POV quando a bolinha está focada.
- **Validação:** `node --check js/race.js` e diagnósticos do editor sem erros.

### 32. 🏷️ Nametags com Controle no Simulador
- Adicionadas etiquetas SVG com bandeira PNG e nome do piloto em um callout diagonal ligado à bolinha, sem placa retangular.
- Todas as etiquetas agora usam o mesmo deslocamento fixo acima e à direita da bolinha, seguindo o exemplo enviado, sem variação por piloto.
- Corrigido o offset vertical aplicado em dobro, que alongava os conectores e afastava as etiquetas das bolinhas.
- Incluído botão no painel de controles para ligar/desligar todas as nametags durante a sessão, com estado acessível via `aria-pressed`.
- Padronizada a área invisível de cada nametag em 150×20 unidades SVG, sem fundo nem borda, com fonte de 14px e bandeira de 16×12; nomes muito longos são abreviados visualmente, mantendo o texto completo no tooltip.
- **Validação:** `node --check js/race.js`, diagnósticos do editor e teste no navegador confirmaram bandeiras reais, layout diagonal e alternância nos dois estados.

### 33. 🎨 Duas Cores das Equipes nas Bolinhas
- As bolinhas do simulador agora usam a cor primária da equipe no preenchimento e a cor secundária no contorno.
- Aplicado em Qualify, corrida oficial, Casual e Time-Trial, com branco como fallback para equipe sem cor secundária cadastrada.
- **Validação:** `node --check js/race.js` e teste no navegador confirmaram as cores da Scuderia Veloce e da Papaya Racing.







