# RACE SIMULATOR — ESPECIFICAÇÃO COMPLETA DO PROJETO

## 1. OBJETIVO DO PROJETO

Desenvolver um site chamado "Race Simulator", um simulador de corridas para uso exclusivamente pessoal e offline.

Eu serei o administrador do sistema. Não existirão usuários externos.

Eu mesmo vou cadastrar e gerenciar:

- Pilotos
- Equipes
- Pistas
- Temporadas
- Corridas

O sistema deverá simular corridas automaticamente e apresentar uma experiência visual semelhante a uma central de controle/transmissão de automobilismo.

O projeto deve priorizar:

- Simplicidade
- Leveza
- Desempenho
- Organização
- Interface profissional
- Facilidade de manutenção
- Baixa quantidade de dependências
- Experiência visual de alta qualidade

──────────────────────────────────────────────

# 2. RESTRIÇÃO FUNDAMENTAL DE TECNOLOGIA

IMPORTANTE:

Este projeto deve utilizar EXCLUSIVAMENTE:

- HTML
- CSS
- JavaScript

Utilizar JavaScript puro (Vanilla JavaScript).

NÃO utilizar:

- React
- Vue
- Angular
- Svelte
- Vite
- Next.js
- TypeScript
- Tailwind CSS
- Bootstrap
- Framer Motion
- React Router
- Node.js
- Backend
- Banco de dados
- Frameworks frontend
- Bibliotecas externas desnecessárias
- Dependências externas desnecessárias

Toda a aplicação deve funcionar diretamente no navegador.

Não deve ser necessário instalar pacotes ou dependências para executar o projeto.

O projeto deve poder ser executado simplesmente abrindo o arquivo HTML principal no navegador.

Caso seja necessário criar diferentes páginas, utilizar HTML, CSS e JavaScript puro.

Toda a navegação deve ser implementada com JavaScript puro quando necessário.

Todas as animações devem ser feitas utilizando CSS e/ou JavaScript.

Toda a lógica da simulação deve ser feita utilizando JavaScript puro.

A pista deve utilizar SVG nativo.

A movimentação das bolinhas deve ser controlada por JavaScript.

A persistência dos dados deve utilizar LocalStorage.

NÃO adicionar frameworks, bibliotecas ou tecnologias por conta própria.

Se uma funcionalidade puder ser implementada com HTML, CSS e JavaScript puro, essa deve ser sempre a primeira escolha.

A simplicidade deve ser priorizada em relação a arquiteturas desnecessariamente complexas.

──────────────────────────────────────────────

# 3. ARMAZENAMENTO

Todos os dados devem ser armazenados localmente utilizando LocalStorage.

Não utilizar banco de dados externo.

Os dados devem permanecer salvos mesmo após fechar o navegador.

Criar uma estrutura organizada de armazenamento para:

- Pilotos
- Equipes
- Pistas
- Temporadas
- Corridas
- Resultados
- Replays
- Ranks
- Configurações
- Recordes
- Histórico

Evitar duplicação desnecessária de informações.

──────────────────────────────────────────────

# 4. ESTRUTURA PRINCIPAL

Criar um menu de navegação contendo:

- Dashboard
- Corridas
- Pilotos
- Equipes
- Pistas
- Campeonato
- Ranking
- Hall da Fama
- Configurações

A navegação deve ser simples, rápida e intuitiva.

──────────────────────────────────────────────

# 5. DASHBOARD

A página inicial deve apresentar um resumo da categoria.

Mostrar:

- Próxima corrida
- Último vencedor
- Classificação atual do campeonato
- Melhor volta da temporada
- Últimos recordes
- Top 3 pilotos da temporada
- Temporada atual

Criar cards e painéis visualmente organizados.

──────────────────────────────────────────────

# 6. SISTEMA DE PILOTOS

Criar uma página para gerenciamento dos pilotos.

Permitir:

- Criar piloto
- Editar piloto
- Excluir piloto
- Visualizar perfil do piloto

Cada piloto deverá possuir:

## Informações

- Nome
- Número
- Foto
- Nacionalidade
- Equipe
- Cor personalizada em HEX

## Atributos

- Velocidade
- Aceleração
- Controle
- Constância

Os atributos devem utilizar uma escala simples, por exemplo de 0 a 100.

## Estatísticas

- Corridas
- Vitórias
- Pódios
- Poles
- Pontos
- Melhor volta
- Maior posição conquistada

As estatísticas devem ser atualizadas automaticamente após cada corrida.

──────────────────────────────────────────────

# 7. SISTEMA DE EQUIPES

Criar uma página para gerenciamento das equipes.

Cada equipe deve possuir:

- Nome
- Logo
- Cor principal em HEX
- Cor secundária em HEX
- Lista de pilotos

A cor da equipe será utilizada também na representação visual dos pilotos durante as corridas.

──────────────────────────────────────────────

# 8. SISTEMA DE PISTAS

Criar uma página para gerenciamento das pistas.

Cada pista deve possuir:

- Nome
- País
- Comprimento
- Número padrão de voltas
- SVG do circuito

O SVG será utilizado diretamente na simulação.

A pista deve possuir um PATH principal que será utilizado como linha de percurso dos pilotos.

Os pilotos devem seguir esse PATH durante toda a corrida.

──────────────────────────────────────────────

# 9. SISTEMA DE TEMPORADAS

Permitir criar e gerenciar temporadas.

Cada temporada possuirá:

- Nome
- Ano
- Lista de Grandes Prêmios
- Classificação
- Estatísticas
- Campeão

As corridas concluídas deverão ficar registradas dentro da temporada correspondente.

──────────────────────────────────────────────

# 10. SISTEMA DE PONTUAÇÃO

O sistema deverá permitir configurar uma tabela de pontuação para as posições finais.

A pontuação deve ser aplicada automaticamente após cada corrida.

Os pontos obtidos serão utilizados para:

- Campeonato
- Ranking
- Ranks
- Estatísticas
- Hall da Fama

A tabela de pontuação deve ser configurável nas configurações.

──────────────────────────────────────────────

# 11. SISTEMA DE RANKS

Criar um sistema de ranks baseado EXCLUSIVAMENTE na quantidade de pontos conquistados pelo piloto durante a temporada.

O rank não deve influenciar a performance do piloto.

O rank é apenas uma representação visual do desempenho do piloto na temporada.

Exemplo padrão:

Bronze — 0 pontos
Silver — 100 pontos
Gold — 250 pontos
Platinum — 450 pontos
Diamond — 700 pontos
Master — 1000 pontos
Legend — 1400 pontos

Esses valores são apenas exemplos e devem ser totalmente personalizáveis.

Cada rank deverá possuir:

- Nome
- Pontuação mínima
- Cor HEX
- Ícone opcional
- Ordem

O sistema deverá determinar automaticamente o rank atual do piloto de acordo com seus pontos.

Exemplo:

Piloto possui 286 pontos.

Rank atual:

Gold

Próximo rank:

Platinum

Progresso:

286 / 450 pontos

Criar uma barra visual mostrando o progresso até o próximo rank.

──────────────────────────────────────────────

# 12. TEMPORADAS E RANKS

O rank será válido somente dentro da temporada atual.

Quando uma nova temporada começar:

- Todos os pilotos começam novamente no primeiro rank.
- A pontuação da nova temporada começa em 0.
- A classificação da nova temporada começa do zero.

Porém, o histórico não deve ser perdido.

O Hall da Fama deverá registrar:

- Maior rank já alcançado
- Quantas vezes o piloto terminou uma temporada em cada rank
- Temporadas em que alcançou determinado rank

Exemplo:

Nicolas

Maior rank:
Legend

Temporadas:

2026 — Diamond
2027 — Legend
2028 — Master

──────────────────────────────────────────────

# 13. RANKING

Criar uma página de ranking da temporada.

Mostrar:

- Posição
- Piloto
- Rank
- Equipe
- Pontos
- Vitórias
- Pódios
- Melhor volta

O ranking deve ser atualizado automaticamente após cada corrida.

──────────────────────────────────────────────

# 14. CAMPEONATO

Criar uma página específica para o campeonato.

Mostrar:

- Classificação dos pilotos
- Pontos
- Vitórias
- Pódios
- Poles
- Melhor volta
- Rank atual

A classificação deve ser atualizada automaticamente após cada corrida.

Também mostrar informações da temporada atual.

──────────────────────────────────────────────

# 15. HALL DA FAMA

Criar um Hall da Fama para preservar recordes históricos.

Registrar automaticamente:

- Maior número de vitórias
- Maior número de títulos
- Maior número de poles
- Melhor volta da história
- Maior sequência de vitórias
- Maior rank alcançado
- Mais temporadas em determinado rank
- Piloto com mais pódios

O Hall da Fama deve preservar informações de temporadas anteriores.

──────────────────────────────────────────────

# 16. CONFIGURAÇÕES

Criar uma página de configurações.

Permitir configurar:

- Tema claro/escuro
- Velocidade da simulação
- Mostrar nome ou número dos pilotos
- Nome da categoria
- Logo da categoria
- Tabela de pontuação
- Sistema de ranks

Também incluir o Editor de Ranks.

O Editor de Ranks deverá permitir:

- Criar rank
- Excluir rank
- Alterar nome
- Alterar ordem
- Alterar pontuação mínima
- Alterar cor HEX
- Alterar ícone

Salvar todas as alterações automaticamente no LocalStorage.

──────────────────────────────────────────────

# 17. SIMULAÇÃO DE CORRIDA

A simulação é o coração do projeto.

A experiência visual deve lembrar uma transmissão profissional de automobilismo, mas possuir identidade visual própria.

A corrida será baseada em RNG.

Isso significa que os resultados não devem ser sempre iguais.

Os atributos dos pilotos deverão influenciar suas chances, mas também deverá existir uma parcela de aleatoriedade para gerar resultados diferentes.

O objetivo é evitar que o piloto com os melhores atributos vença absolutamente todas as corridas.

──────────────────────────────────────────────

# 18. TELA DA CORRIDA

Criar uma interface específica para a simulação.

## LADO ESQUERDO

Leaderboard em tempo real.

Mostrar:

- Posição
- Piloto
- Rank
- Equipe
- Diferença para o líder

Atualizar constantemente durante a corrida.

## CENTRO

Mostrar o circuito utilizando SVG.

Os pilotos serão representados por pequenas bolinhas.

Cada bolinha deverá utilizar a cor principal da equipe.

Mostrar acima da bolinha:

- Número do piloto

ou

- Abreviação do nome

A escolha deverá ser controlável pelas configurações.

## LADO DIREITO

Mostrar:

- Volta atual
- Total de voltas
- Líder
- Melhor volta
- Clima

──────────────────────────────────────────────

# 19. MOVIMENTAÇÃO DOS PILOTOS

Os pilotos devem seguir exatamente o PATH da pista.

Não utilizar movimentação aleatória fora do circuito.

As bolinhas devem permanecer sobre o percurso.

O movimento deve ser fluido.

As curvas devem influenciar na velocidade.

Exemplo:

Reta:
100%

Curva leve:
85%

Curva média:
70%

Curva fechada:
55%

Hairpin:
45%

Esses valores podem ser ajustados conforme o circuito.

Os atributos dos pilotos também devem influenciar levemente o desempenho.

Exemplo:

Velocidade:
influencia desempenho em retas.

Aceleração:
influencia saída de curvas.

Controle:
influencia desempenho em curvas.

Constância:
reduz variações negativas causadas pelo RNG.

──────────────────────────────────────────────

# 20. RNG DA CORRIDA

A corrida deve possuir um sistema de RNG equilibrado.

Os atributos devem influenciar as probabilidades, mas nunca determinar completamente o resultado.

O sistema pode gerar:

- Ultrapassagens
- Mudanças de posição
- Diferenças pequenas
- Diferenças grandes
- Pilotos surpreendendo
- Pilotos perdendo posições

Evitar resultados completamente previsíveis.

A aleatoriedade deve ser controlada para evitar resultados absurdos.

──────────────────────────────────────────────

# 21. LEADERBOARD

O leaderboard deve acompanhar a corrida em tempo real.

Exemplo:

P1  Nicolas    Ferrari
P2  Lucas      McLaren   +0.842
P3  Pedro      Mercedes  +2.154

Quando ocorrer uma mudança de posição, atualizar visualmente.

Utilizar pequenas animações para indicar:

- Subida de posição
- Queda de posição
- Nova liderança

──────────────────────────────────────────────

# 22. VOLTAS

A corrida deve possuir um sistema de voltas.

Cada piloto deve completar o número de voltas definido para o GP.

Registrar:

- Volta atual
- Tempo da volta
- Melhor volta
- Tempo total

O sistema deve detectar automaticamente quando cada piloto completa uma volta.

──────────────────────────────────────────────

# 23. MELHOR VOLTA

Registrar automaticamente a melhor volta de cada piloto.

Também registrar:

- Melhor volta da corrida
- Melhor volta da temporada
- Melhor volta histórica

──────────────────────────────────────────────

# 24. FINAL DA CORRIDA

Quando todos os pilotos terminarem a corrida:

Não mostrar apenas um modal de resultado.

Redirecionar automaticamente para uma página específica:

# RESULTADO DO GRANDE PRÊMIO

No topo mostrar:

- Nome do GP
- Temporada
- Clima
- Número de voltas
- Melhor volta da corrida

──────────────────────────────────────────────

# 25. TABELA DE RESULTADOS

A página de resultados deve possuir obrigatoriamente uma tabela com as seguintes colunas:

| Posição | Nome | Equipe | Tempo | Volta Mais Rápida | Voltas |

O vencedor deverá mostrar seu tempo total.

Os demais pilotos deverão mostrar a diferença para o vencedor.

Exemplo:

1 | Nicolas | Ferrari | 1:28:43.218 | 1:24.552 | 58
2 | Lucas | McLaren | +2.184 | 1:24.610 | 58
3 | Pedro | Mercedes | +7.892 | 1:24.930 | 58

──────────────────────────────────────────────

# 26. DESTAQUES DA CORRIDA

Na página de resultados mostrar cartões de destaque:

🏆 Vencedor

⚡ Melhor volta

⭐ Piloto da corrida

🚀 Maior ganho de posições

Esses dados devem ser calculados automaticamente.

──────────────────────────────────────────────

# 27. ATUALIZAÇÃO DO CAMPEONATO

Após finalizar uma corrida:

- Adicionar os pontos
- Atualizar classificação
- Atualizar vitórias
- Atualizar pódios
- Atualizar poles
- Atualizar melhor volta
- Atualizar ranks
- Atualizar estatísticas
- Atualizar Hall da Fama quando aplicável

Tudo deve acontecer automaticamente.

──────────────────────────────────────────────

# 28. HISTÓRICO DE CORRIDAS

Toda corrida finalizada deverá ser salva.

O histórico deverá permitir visualizar:

- Temporada
- GP
- Data
- Vencedor
- Melhor volta
- Resultado

Ao abrir uma corrida antiga, mostrar sua página completa de resultados.

──────────────────────────────────────────────

# 29. SISTEMA DE REPLAY

Toda corrida deverá gerar automaticamente um replay.

IMPORTANTE:

O replay NÃO deve recalcular a corrida.

Ele deve reproduzir exatamente o que aconteceu durante a corrida original.

Durante a corrida, armazenar os dados necessários para reconstruir sua execução.

Registrar informações como:

- Posição de cada piloto
- Posição no circuito
- Volta atual
- Tempo
- Velocidade aproximada
- Ordem da classificação
- Mudanças de posição
- Mudanças de liderança
- Melhor volta
- Ultrapassagens

──────────────────────────────────────────────

# 30. FRAMES DO REPLAY

Criar frames da corrida em intervalos regulares.

Exemplo:

Frame 1:
tempo 0 ms

Frame 2:
tempo 100 ms

Frame 3:
tempo 200 ms

Frame 4:
tempo 300 ms

E assim por diante.

Cada frame deve armazenar o estado necessário dos pilotos naquele momento.

O replay deverá apenas reproduzir esses frames.

Não realizar uma nova simulação.

Isso garante que o replay seja fiel à corrida original.

──────────────────────────────────────────────

# 31. CONTROLES DO REPLAY

Na página de replay adicionar:

▶ Reproduzir

⏸ Pausar

⏮ Reiniciar

1x

2x

4x

Barra de progresso

O usuário deverá poder arrastar a barra de progresso para qualquer momento da corrida.

Ao alterar o momento do replay:

- Atualizar posição dos pilotos
- Atualizar leaderboard
- Atualizar volta
- Atualizar diferenças
- Atualizar eventos

Tudo deve corresponder ao estado daquela parte da corrida.

──────────────────────────────────────────────

# 32. EVENTOS DO REPLAY

Registrar eventos importantes.

Exemplos:

- Ultrapassagem
- Mudança de liderança
- Nova melhor volta
- Mudança significativa de posição

Esses eventos poderão futuramente ser exibidos em uma timeline.

──────────────────────────────────────────────

# 33. ESTRUTURA DOS DADOS DA CORRIDA

Cada corrida deverá possuir uma estrutura semelhante a:

{
    gp,
    temporada,
    clima,
    numeroDeVoltas,
    resultadoFinal,
    melhorVolta,
    estatisticas,
    eventos,
    framesReplay
}

O resultado final deverá armazenar:

- Posição
- Piloto
- Equipe
- Tempo
- Melhor volta
- Voltas
- Pontos

──────────────────────────────────────────────

# 34. CONSISTÊNCIA DOS DADOS

Evitar duplicação de informações.

Ranking, Campeonato, Hall da Fama, Histórico e Replay devem utilizar os mesmos dados gerados pelas corridas.

Uma corrida deve gerar seus dados uma única vez.

Os demais sistemas devem consumir essas informações.

──────────────────────────────────────────────

# 35. DESIGN DA INTERFACE

Criar uma interface visualmente premium.

Estilo inspirado em centrais de controle e transmissões modernas de automobilismo.

Não copiar a interface oficial de nenhuma categoria.

Criar identidade visual própria.

Utilizar:

- Tema escuro como padrão
- Glassmorphism
- Painéis modernos
- Bordas arredondadas
- Sombras discretas
- Tipografia moderna
- Cores vibrantes
- Animações suaves
- Microinterações
- Excelente hierarquia visual

A interface deve parecer um software profissional de gerenciamento e transmissão de corridas.

──────────────────────────────────────────────

# 36. RESPONSIVIDADE

O sistema deve funcionar adequadamente em:

- Desktop
- Notebook
- Tablet

A tela de simulação deve priorizar a experiência em desktop, pois é onde o mapa da pista e o leaderboard terão maior espaço.

──────────────────────────────────────────────

# 37. ARQUITETURA DOS ARQUIVOS

Manter o projeto organizado.

Uma estrutura inicial possível:

/index.html

/css/
    style.css
    dashboard.css
    race.css
    tables.css
    components.css

/js/
    app.js
    storage.js
    pilots.js
    teams.js
    tracks.js
    championship.js
    ranking.js
    ranks.js
    race.js
    replay.js
    hallOfFame.js
    settings.js
    utils.js

/assets/
    /images/
    /tracks/
    /icons/

Não é obrigatório seguir exatamente essa estrutura caso exista uma organização melhor utilizando apenas HTML, CSS e JavaScript puro.

O importante é evitar colocar todo o projeto em um único arquivo gigante.

──────────────────────────────────────────────

# 38. COMPONENTES REUTILIZÁVEIS

Mesmo utilizando JavaScript puro, criar componentes e funções reutilizáveis para elementos como:

- Sidebar
- Header
- Cards
- Modais
- Tabelas
- Leaderboard
- Badges de rank
- Botões
- Inputs
- Selects
- Barras de progresso
- Cards de piloto
- Cards de equipe

Evitar duplicar HTML e JavaScript desnecessariamente.

──────────────────────────────────────────────

# 39. EXPERIÊNCIA DO USUÁRIO

A aplicação deve ser simples de utilizar.

Eu devo conseguir:

1. Criar pilotos.
2. Criar equipes.
3. Criar pistas.
4. Criar uma temporada.
5. Adicionar os GPs.
6. Selecionar os pilotos.
7. Iniciar uma corrida.
8. Assistir à simulação.
9. Ver o resultado.
10. Assistir ao replay.
11. Ver os pontos atualizados.
12. Ver os ranks atualizados.
13. Acompanhar o campeonato.
14. Consultar o histórico.
15. Consultar o Hall da Fama.

──────────────────────────────────────────────

# 40. O QUE NÃO IMPLEMENTAR

Não adicionar funcionalidades que não foram solicitadas.

Não implementar:

- Login
- Cadastro de usuários
- Multiplayer
- Chat
- Sistema financeiro
- Moedas
- Loja
- Patrocinadores
- Contratos
- Salários
- Lesões
- Aposentadoria
- Sistema de funcionários
- Mercado complexo
- Economia
- Sistemas desnecessariamente complexos

O projeto deve permanecer simples.

──────────────────────────────────────────────

# 41. PRIORIDADES DO PROJETO

Priorizar as funcionalidades nesta ordem:

1. Sistema de simulação
2. Movimentação das bolinhas no SVG
3. Sistema RNG
4. Leaderboard em tempo real
5. Sistema de voltas
6. Resultado da corrida
7. Sistema de Replay
8. Campeonato
9. Sistema de pontuação
10. Sistema de ranks
11. Pilotos
12. Equipes
13. Pistas
14. Histórico
15. Hall da Fama
16. Dashboard
17. Configurações

──────────────────────────────────────────────

# 42. REGRA FUNDAMENTAL

HTML + CSS + JavaScript puro são suficientes para este projeto.

Não adicionar frameworks, bibliotecas, pacotes ou dependências externas sem minha autorização explícita.

Priorizar:

- Simplicidade
- Desempenho
- Baixo consumo de memória
- Código limpo
- Facilidade de manutenção
- Organização
- Experiência visual

Não transformar funcionalidades simples em sistemas excessivamente complexos.

Se houver duas formas de implementar algo, escolher preferencialmente a solução mais simples utilizando JavaScript puro.

Não criar funcionalidades adicionais apenas porque parecem interessantes.

Seguir exatamente o escopo definido neste documento.

──────────────────────────────────────────────

# 43. DESENVOLVIMENTO

Não tentar criar todo o projeto de uma única vez se isso comprometer a qualidade.

Desenvolver de maneira incremental.

Primeiro construir a estrutura base.

Depois implementar cada sistema de forma independente e integrada.

Sempre preservar funcionalidades que já estejam funcionando.

Antes de alterar uma funcionalidade existente, verificar como ela está estruturada e evitar quebrar outras partes do projeto.

O resultado final deve ser um simulador de corridas leve, bonito, organizado, funcional e divertido de utilizar, com a simulação visual e o replay como principais diferenciais.