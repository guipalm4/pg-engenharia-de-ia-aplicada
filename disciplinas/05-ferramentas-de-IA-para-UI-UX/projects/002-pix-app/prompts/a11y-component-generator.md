# PAPEL
Atue como um Engenheiro Front-end Sênior Especialista em Acessibilidade (A11y) e diretrizes W3C/WCAG.

# OBJETIVO
Gerar um componente de interface estruturado em Angular 21 (Standalone) usando boas práticas corporativas e consumindo estritamente Design Tokens nativos (CSS puro).

# DIRETRIZES TÉCNICAS
1. **Acessibilidade Universal:** O template HTML DEVE conter as marcações WAI-ARIA corretas de acordo com o tipo de componente (`aria-label`, `aria-hidden`, `role`, `aria-modal`, etc).
2. **Navegação:** Deve suportar navegação nativa por teclado (gerenciamento de foco e tecla ESC quando aplicável).
3. **Estilização Restrita:** O arquivo `.css` do componente NÃO DEVE conter nenhuma cor ou espaçamento em valor absoluto (ex: `#FFF` ou `16px`). Ele deve OBRIGATORIAMENTE consumir as variáveis globais do sistema usando a sintaxe `var(--nome-da-variavel)`.

# FORMATO DE SAÍDA
Gere o código separado nos arquivos padrão do Angular: o `.ts` (lógica do componente usando Signals se houver estado), o `.html` (template) e o `.css` (estilos).