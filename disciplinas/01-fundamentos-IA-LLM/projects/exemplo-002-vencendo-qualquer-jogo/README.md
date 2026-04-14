# Duck Hunt JS — Vencendo Qualquer Jogo

> Reimplementação do clássico Duck Hunt em JavaScript/HTML5, usada como base para explorar como IAs aprendem a jogar (e vencer) jogos digitais.

## Contexto
- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição
O projeto parte de uma versão funcional do Duck Hunt construída com PixiJS, GSAP e Howler, e a usa como ambiente de estudo para os conceitos centrais da disciplina: como um agente de IA percebe o estado do jogo, toma decisões e maximiza uma recompensa (pontuação). O jogo conta com 6 níveis de dificuldade crescente, sistema de ondas (waves), munição limitada e criador de níveis customizáveis via query string.

## Tecnologias e Ferramentas
- [x] JavaScript (ES6+ com Babel)
- [x] Bibliotecas principais: PixiJS 8 (rendering WebGL/Canvas), GSAP (tweening/animações), Howler (áudio Web Audio API / HTML5 fallback), Bluebird (Promises), Lodash
- [x] Outras ferramentas: Webpack 5, webpack-dev-server, ESLint, Gulp (geração de assets de áudio e imagem)

## Como executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento com hot-reload (disponível em http://localhost:8080)
npm start

# Gerar build de produção
npm run build

# (Opcional) Regenerar assets de áudio — requer ffmpeg instalado
npm run audio

# (Opcional) Regenerar sprites de imagem — requer TexturePacker instalado
npm run images

# Verificar qualidade do código
npm run lint
```

## Estrutura do Projeto
```
exemplo-002-vencendo-qualquer-jogo/
├── dist/                  # Build gerado (HTML, JS, áudio e sprites)
│   ├── index.html
│   ├── creator.html       # Interface do criador de níveis
│   ├── duckhunt.js
│   ├── sprites.json
│   ├── audio.json / .mp3 / .ogg
├── src/
│   ├── assets/            # Imagens e sons brutos
│   ├── data/
│   │   └── levels.json    # Definição dos 6 níveis (ondas, patos, velocidade, munição)
│   ├── libs/
│   │   ├── levelCreator.js  # Parsing de níveis via query string
│   │   └── utils.js
│   └── modules/           # Classes ES6 do jogo
│       ├── Game.js        # Loop principal, pontuação, fluxo de níveis/ondas
│       ├── Duck.js        # Comportamento e animação do pato
│       ├── Dog.js         # Personagem do cachorro
│       ├── Aim.js         # Mira do jogador
│       ├── Character.js   # Classe base de personagens
│       ├── Hud.js         # Interface (placar, balas, status)
│       ├── Sound.js       # Wrapper do Howler
│       └── Stage.js       # Gerenciamento da cena PixiJS
├── package.json
└── README.md
```

## Conceitos trabalhados
- [x] **Loop de jogo e gerenciamento de estado** — ciclo percepção → decisão → ação em `Game.js`
- [x] **Ambiente de agente** — estado observável (posição dos patos, balas, tempo), ações discretas (atirar/não atirar), recompensa (pontos por pato)
- [x] **Dificuldade progressiva** — níveis com parâmetros configuráveis simulam o ajuste de complexidade de ambientes em RL
- [x] **Espaço de estados e ações** — base conceitual para entender como agentes de IA exploram jogos (Q-Learning, MCTS, etc.)
- [x] **Criador de níveis via query string** — permite gerar ambientes arbitrários, analogia a ambientes sintéticos para treinamento de agentes

## Aprendizados
- [x] Jogos possuem todos os elementos de um problema de RL clássico: estado, ação, recompensa e episódio — mesmo sem IA no código, o ambiente já está estruturado para receber um agente
- [x] Separar lógica de jogo (Game.js) da renderização (Stage/Hud) facilita substituir o jogador humano por um agente automatizado sem alterar o motor do jogo

## Referências
- [PixiJS — Documentação oficial](https://pixijs.com/)
- [Howler.js — Web Audio](https://howlerjs.com/)
- [GSAP — GreenSock Animation Platform](https://greensock.com/gsap/)
- [Reinforcement Learning: An Introduction — Sutton & Barto](http://incompleteideas.net/book/the-book-2nd.html)
- [Playing Atari with Deep Reinforcement Learning — DeepMind (2013)](https://arxiv.org/abs/1312.5602)
- [Repositório original Duck Hunt JS](https://github.com/MattSurabian/DuckHunt-JS)

---
