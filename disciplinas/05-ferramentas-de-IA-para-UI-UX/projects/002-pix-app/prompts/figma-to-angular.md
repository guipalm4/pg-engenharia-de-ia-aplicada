# PAPEL
Atue como um Engenheiro Front-end Sênior especialista em Angular 21, acessibilidade e Design Systems.

# OBJETIVO
Analisar a imagem de alta fidelidade do Figma (@extrato-figma.png) e as especificações de layout (@figma-specs.txt) para gerar um Standalone Component Angular que renderize essa lista de transações.

# DIRETRIZES TÉCNICAS
1. **Arquitetura de Dados:** Crie um Standalone Component chamado `PixHistoryComponent`. Defina uma interface TypeScript para a transação (`id`, `title`, `amount`, `type`, `date`) e use um Signal com um array mockado de 3 transações para popular a tela.
2. **Control Flow Moderno:** No template HTML, você DEVE usar a sintaxe oficial `@for` do Angular 21 para iterar sobre o array de transações.
3. **Fidelidade e Tokens:** O layout deve espelhar a imagem do Figma, aplicando as regras de flexbox do arquivo de especificações. É ESTRITAMENTE PROIBIDO usar cores hexadecimais absolutas. Leia o @src/styles.css e consuma as nossas variáveis nativas.
4. **Ícones:** Use a biblioteca oficial do @material-symbols-outlined para representar setas de envio/recebimento.

# FORMATO DE SAÍDA
Gere os arquivos `.ts`, `.html` e `.css` do componente.