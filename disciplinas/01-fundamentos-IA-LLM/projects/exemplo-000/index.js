import tf from "@tensorflow/tfjs-node";

async function trainModel(inputXs, outputYs) {
  const model = tf.sequential();
  // primeira camada da rede:
  // entrada de 7 posições (idade normalizada, 3 cores, 3 localizações)

  // 80 neuronios = pouca base de treino
  //quanto mais neuronios, mais complexidade a rede aprender
  // e mais processamento necessário para treinar

  // A RelU age como um filtro, permitindo que apenas os sinais mais fortes sejam processados, o que ajuda a rede a aprender padrões mais complexos e a evitar o problema do gradiente desaparecido.
  // se a informação chegou nesse neuronio é positiva, passa para frente
  // se for zero ou negativa, pode jogar fora, não passa para frente, nao vai servir para nada.
  model.add(
    tf.layers.dense({ inputShape: [7], units: 80, activation: "relu" }),
  );

  // Saída: 3 neuronios (premium, medium, basic)
  // activation softmax é usada para classificação, pois converte os valores de saída em probabilidades, onde a soma de todas as saídas é igual a 1. Isso é útil para determinar a classe mais provável para cada entrada.
  model.add(tf.layers.dense({ units: 3, activation: "softmax" }));

  // Compilando o modelo:
  // optimizer "adam" é um algoritmo de otimização que ajusta os pesos da rede neural durante o treinamento para minimizar a função de perda. Ele é eficiente e amplamente utilizado em redes neurais, especialmente em problemas de classificação.
  // é um treinador moderno, ajusta os pesos de forma eficiente e inteligente
  // aprende com historico de erros e acertos

  // loss: "categoricalCrossentropy" é uma função de perda usada para problemas de classificação multiclasse. Ela mede a diferença entre as distribuições de probabilidade previstas pelo modelo e as distribuições reais (labels). O objetivo do treinamento é minimizar essa perda, o que significa que o modelo está aprendendo a fazer previsões mais precisas.
  // compara o que modelo "acha" que é a resposta certa, com o que é a resposta certa, e calcula o erro

  // quanto mais distente da previsão do modelo, maior o erro(loss)
  // Exemplo clássico: classificação de imagens, recomendação, categorização de usuário
  // qualquer coisa em que a reposta certa é "apenas uma entre várias possíveis"

  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  // Treinando o modelo:
  // epochs: número de vezes que o modelo passará por todo o conjunto de dados durante o treinamento. Cada época representa uma iteração completa sobre o dataset, onde o modelo ajusta seus pesos com base nos erros cometidos. O número ideal de épocas pode variar dependendo do tamanho do dataset e da complexidade do modelo, e é importante monitorar a perda e a precisão para evitar overfitting (quando o modelo se ajusta demais aos dados de treinamento e perde a capacidade de generalizar para novos dados).
  await model.fit(inputXs, outputYs, {
    epochs: 200,
    verbose: 0, // para não mostrar o progresso do treinamento
    shuffle: true, // para embaralhar os dados a cada época, ajudando a evitar overfitting
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
      },
    },
  });
  return model;
}

async function predict(model, input) {
  // transformar o array js em tensor
  const inputTensor = tf.tensor2d(input);

  // Faz a predição(output será um vetor de 3 possibilidades)
  const prediction = model.predict(inputTensor);
  const predctionArray = await prediction.array();

  return predctionArray[0].map((prob, index) => ({ prob, index }));
}

// Exemplo de pessoas para treino (cada pessoa com idade, cor e localização)
// const pessoas = [
//     { nome: "Erick", idade: 30, cor: "azul", localizacao: "São Paulo" },
//     { nome: "Ana", idade: 25, cor: "vermelho", localizacao: "Rio" },
//     { nome: "Carlos", idade: 40, cor: "verde", localizacao: "Curitiba" }
// ];

// Vetores de entrada com valores já normalizados e one-hot encoded
// Ordem: [idade_normalizada, azul, vermelho, verde, São Paulo, Rio, Curitiba]
// const tensorPessoas = [
//     [0.33, 1, 0, 0, 1, 0, 0], // Erick
//     [0, 0, 1, 0, 0, 1, 0],    // Ana
//     [1, 0, 0, 1, 0, 0, 1]     // Carlos
// ]

// Usamos apenas os dados numéricos, como a rede neural só entende números.
// tensorPessoasNormalizado corresponde ao dataset de entrada do modelo.
const tensorPessoasNormalizado = [
  [0.33, 1, 0, 0, 1, 0, 0], // Erick
  [0, 0, 1, 0, 0, 1, 0], // Ana
  [1, 0, 0, 1, 0, 0, 1], // Carlos
];

// Labels das categorias a serem previstas (one-hot encoded)
// [premium, medium, basic]
const labelsNomes = ["premium", "medium", "basic"]; // Ordem dos labels
const tensorLabels = [
  [1, 0, 0], // premium - Erick
  [0, 1, 0], // medium - Ana
  [0, 0, 1], // basic - Carlos
];

// Criamos tensores de entrada (xs) e saída (ys) para treinar o modelo
const inputXs = tf.tensor2d(tensorPessoasNormalizado);
const outputYs = tf.tensor2d(tensorLabels);

inputXs.print();
outputYs.print();
// quanto mais dados de treino, melhor o modelo aprende, mas também leva mais tempo para treinar
const model = await trainModel(inputXs, outputYs);

const pessoa = {
  nome: "Guilherme",
  idade: 28,
  cor: "verde",
  localizacao: "Curitiba",
};
// Normalizando os dados de entrada para a nova pessoa
// Exemplo: idade_min = 25, idade_max = 40, então idade_normalizada = (28 - 25) / (40 - 25) = 0.2

const pessoaNormalizada = [
  [
    0.2, // idade normalizada
    0, // cor azul
    0, // cor vermelho
    1, // cor verde
    0, // localização São Paulo
    0, // localização Rio
    1, // localização Curitiba
  ],
];

const predictions = await predict(model, pessoaNormalizada);

const results = predictions
  .sort((a, b) => b.prob - a.prob)
  .map((p) => `${labelsNomes[p.index]} (${(p.prob * 100).toFixed(2)}%)`)
  .join("\n"); // ordena por probabilidade decrescente

console.log(`Predições para ${pessoa.nome}:\n${results}`);
