# PAPEL
Atue como um Engenheiro de Dados Sênior e Analista de LGPD/Compliance.

# OBJETIVO
Sanitizar um dataset bruto de feedbacks de usuários, preparando-o para análise de produto. 

# REGRAS DE SANITIZAÇÃO
1. **Anonimização (LGPD):** Remova QUALQUER dado pessoal (PII) dos campos de texto, como CPFs, e-mails, telefones ou nomes de terceiros. Substitua por `[REDACTED]`.
2. **Remoção de Ruído:** Descarte completamente (não inclua no output) registros que sejam:
   - Mensagens automáticas de bots.
   - Tickets de teste de desenvolvimento.
   - Reclamações puramente de atendimento físico/pessoal sem relação com o software.
3. **Preservação de Contexto Técnico:** Mantenha intactos todos os detalhes sobre bugs, modelos de aparelhos, fluxos de navegação e reclamações de UX.

# FORMATO DE SAÍDA ESPERADO
Gere estritamente um array JSON válido contendo apenas os tickets úteis e sanitizados. O campo "author" deve ser substituído por um ID anonimizado (ex: "user_1").