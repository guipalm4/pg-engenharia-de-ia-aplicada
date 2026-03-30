# exemplo-000

> Exemplo em Node.js usando TensorFlow.js (tfjs-node) para treinar uma rede neural densa simples e classificar um perfil em `premium`, `medium` ou `basic`.

## Contexto
- Disciplina: Fundamentos de IA com LLM
- Período: Mar/2026
- Autor: guipalm4

## Descrição
Este projeto demonstra um pipeline mínimo de **treinamento supervisionado** em JavaScript com `@tensorflow/tfjs-node`:

- Monta um modelo `sequential` com camadas `dense` (ativação **ReLU** na camada oculta e **Softmax** na saída).
- Treina com `categoricalCrossentropy` + otimizador **Adam** e imprime a loss por época.
- Executa uma predição para um novo exemplo e retorna as probabilidades por classe.

Os dados de entrada são vetores numéricos já **normalizados** e com **one-hot encoding** para atributos categóricos (cor e localização).

## Tecnologias e Ferramentas
- [x] Python / Node.js / Outro
- [x] Bibliotecas principais: `@tensorflow/tfjs-node`
- [ ] Outras ferramentas: —

## Como executar

```bash
# na pasta do projeto
cd disciplinas/01-fundamentos-IA-LLM/projects/exemplo-000

# instalar dependências
npm install

# rodar (watch)
npm start

# alternativa sem watch
node index.js
```

## Estrutura do Projeto

```txt
exemplo-000/
├─ index.js
├─ package.json
├─ package-lock.json
└─ node_modules/            # gerado pelo npm (não versionar em projetos reais)
```

## Conceitos trabalhados
- [x] Classificação multiclasse
- [x] One-hot encoding (features e labels)
- [x] Normalização de features numéricas
- [x] MLP / rede neural densa (camadas fully-connected)
- [x] Função de ativação ReLU
- [x] Softmax para probabilidades por classe
- [x] Função de perda `categoricalCrossentropy`
- [x] Otimização com Adam

## Aprendizados
- [x] Como mapear dados tabulares simples para tensores e treinar um modelo supervisionado.
- [ ] O que faria diferente: ampliar dataset, separar treino/validação e medir generalização (evitar overfitting).

## Referências
- [x] TensorFlow.js (Node): `@tensorflow/tfjs-node` (npm)
- [x] Conceitos: softmax, cross-entropy, Adam, ReLU

---
> Gerado automaticamente por agente IA. Atualize conforme necessário.

