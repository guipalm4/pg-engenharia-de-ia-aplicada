# exemplo-001

> Exemplo em **JavaScript (browser)** com **TensorFlow.js** que simula um mini e-commerce e treina um modelo para **prever probabilidade de compra** e gerar uma lista de **recomendações** por usuário.

## Contexto
- Disciplina: Fundamentos de IA com LLM
- Período: Mar/2026
- Autor: guipalm4

## Descrição
Este projeto é uma aplicação web simples (estática) que:

- Carrega usuários e produtos de `data/*.json`.
- Exibe perfil do usuário e histórico de compras.
- Permite “comprar” produtos, persistindo o histórico via `sessionStorage`.
- Treina um modelo no navegador (via `@tensorflow/tfjs` carregado por CDN) com vetores de features (normalização + one-hot + pesos) para estimar \(P(\text{compra} \mid \text{usuário, produto})\).
- Ordena os produtos por score e renderiza as recomendações na UI.

O treinamento/score roda em `src/workers/modelTrainingWorker.js` (Web Worker), e a visualização usa `tfjs-vis`.

## Tecnologias e Ferramentas
- [x] Python / Node.js / Outro
- [x] Bibliotecas principais: `@tensorflow/tfjs` (CDN), `@tensorflow/tfjs-vis` (CDN)
- [x] Outras ferramentas: `browser-sync`, Bootstrap 5

## Como executar

```bash
# na pasta do projeto
cd disciplinas/01-fundamentos-IA-LLM/projects/exemplo-001

# instalar dependências (para subir o server local)
npm install

# iniciar (porta 3000)
npm start
```

Depois, abra `http://localhost:3000`.

## Estrutura do Projeto

```txt
exemplo-001/
├─ index.html
├─ style.css
├─ package.json
├─ package-lock.json
├─ data/
│  ├─ products.json
│  └─ users.json
└─ src/
   ├─ index.js
   ├─ controller/
   ├─ events/
   ├─ service/
   ├─ view/
   │  └─ templates/
   └─ workers/
      └─ modelTrainingWorker.js
```

## Conceitos trabalhados
- [x] Recomendação baseada em histórico de compras (supervisionado: compra vs não-compra)
- [x] Engenharia de features (normalização min–max, one-hot encoding, pesos por atributo)
- [x] Treinamento de rede neural no browser com TensorFlow.js
- [x] Separação de responsabilidades (UI/Controllers/Services) + execução assíncrona com Web Worker

## Aprendizados
- [x] Como transformar dados tabulares simples (usuário + produto) em vetores numéricos e treinar um modelo leve no navegador.
- [x] Trade-off prático: balancear features com pesos/normalização para evitar dominância de um único atributo (ex.: preço).

## Referências
- [x] TensorFlow.js (CDN) e tfjs-vis (CDN)
- [x] Links em `refs.txt` (curadoria de leituras)

---
