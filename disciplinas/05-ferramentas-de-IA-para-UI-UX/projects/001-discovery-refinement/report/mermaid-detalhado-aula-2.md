# COMANDO DE ENGENHARIA DE FLUXO

Atue como um Arquiteto de Soluções Sênior. Com base na análise de riscos e requisitos refinados que acabamos de gerar acima, crie o código para um Diagrama de Fluxo (Flowchart) utilizando a sintaxe **Mermaid.js**.

## Requisitos do Diagrama:
1. **Orientação:** Top-Down (`graph TD`).
2. **Cobertura:** Deve cobrir o "Caminho Feliz" (Sucesso) e TODOS os "Caminhos Infelizes" (Erros de API, Validação, Timeout, Falta de Saldo) identificados na análise anterior.
3. **Estados de Interface:** Represente claramente telas de *Loading*, *Empty State* e *Feedback de Erro*.
4. **Estilização Semântica:**
   - Use nós retangulares `[]` para Ações do Usuário ou Processos do Sistema.
   - Use losangos `{}` para Decisões de Lógica de Negócio (ex: "Tem saldo?", "API Online?").
   - **Importante:** Aplique estilos (classes) para diferenciar visualmente:
     - `classDef error fill:#f96,stroke:#333,stroke-width:2px;` (Para erros)
     - `classDef success fill:#9f6,stroke:#333,stroke-width:2px;` (Para sucesso)

## Saída Esperada:
Apenas o bloco de código Markdown (```mermaid```) pronto para renderização. Não inclua explicações em texto.


```mermaid
graph TD
    %% Definições de Estilo
    classDef error fill:#f96,stroke:#333,stroke-width:2px;
    classDef success fill:#9f6,stroke:#333,stroke-width:2px;
    classDef uiState fill:#e1f5fe,stroke:#01579b,stroke-width:1px;
    classDef process fill:#fff,stroke:#333,stroke-width:1px;

    %% Fluxo de Seleção de Contato
    Start((Início)) --> GetContacts[Carregar Lista de Contatos]
    GetContacts --> LoadingContacts[UI: Loading Skeleton]
    LoadingContacts --> CheckContacts{Há contatos?}
    
    CheckContacts -- Não --> EmptyContacts[UI: Empty State - Nenhum Contato]
    EmptyContacts --> SearchContact[Busca Manual de Chave]
    
    CheckContacts -- Sim --> SelectContact[Selecionar Contato]
    SearchContact --> SelectContact

    %% Fluxo de Valores e Regras
    SelectContact --> InputAmount[Inserir Valor R$]
    InputAmount --> ValidateLimit{Valor > R$ 5.000,00?}
    
    ValidateLimit -- Sim --> ErrorLimit[UI: Erro - Limite Diário Excedido]:::error
    ErrorLimit --> InputAmount

    ValidateLimit -- Não --> SelectDate[Selecionar Data no Calendário]
    
    %% Validação de Datas
    SelectDate --> CheckDate{Data Selecionada}
    CheckDate -- Hoje --> SuggestPix[UI: Sugestão - Mudar para Pix Normal]:::uiState
    CheckDate -- Passado --> ErrorDate[UI: Erro - Data Retroativa Inválida]:::error
    CheckDate -- Futuro --> ReviewScreen[UI: Tela de Revisão dos Dados]

    %% Processamento e Segurança
    ReviewScreen --> ConfirmAction[Botão: Confirmar Agendamento]
    ConfirmAction --> MFA[Desafio de Segurança: Senha/Biometria]
    
    MFA --> MFA_Check{Autenticado?}
    MFA_Check -- Não --> MFA_Retry[UI: Feedback de Senha Incorreta]:::error
    MFA_Retry --> MFA
    
    MFA_Check -- Sim --> API_Call[Chamada API: POST /pix/schedule]
    API_Call --> LoadingAPI[UI: Loading Overlay Ativo]:::uiState

    %% Tratamento de Respostas da API
    LoadingAPI --> API_Response{Status API}
    
    API_Response -- 201 Created --> SuccessScreen[UI: Tela de Comprovante]:::success
    API_Response -- 403 Forbidden --> ErrorBusiness[UI: Erro - Saldo Insuficiente/Regra de Risco]:::error
    API_Response -- 429/500 --> ErrorServer[UI: Erro - Instabilidade no Bacen]:::error
    API_Response -- Timeout --> ErrorTimeout[UI: Feedback - Verificar Extrato em Instantes]:::error

    %% Fluxo de Gerenciamento (Cancelamento)
    SuccessScreen --> ListSchedule[Ir para: Meus Agendamentos]
    ListSchedule --> CheckList{Há agendamentos?}
    
    CheckList -- Não --> EmptyList[UI: Empty State - Sem Agendamentos]:::uiState
    CheckList -- Sim --> ViewDetails[Ver Detalhes do Agendamento]
    
    ViewDetails --> CancelAction[Botão: Cancelar Agendamento]
    %% Aqui o Gemini comenteu um erro colocando as chaves e quebrando o desenho
    CancelAction --> API_Cancel[Chamada API: DELETE /pix/schedule/id]
    
    API_Cancel --> CancelStatus{Status Cancelamento}
    CancelStatus -- 200 OK --> CancelSuccess[UI: Toast - Agendamento Cancelado]:::success
    CancelStatus -- 400 Bad Request --> CancelLocked[UI: Erro - Já em processamento de envio]:::error

    %% Relacionamentos de Erro
    ErrorLimit -.-> InputAmount
    ErrorDate -.-> SelectDate
    ErrorBusiness -.-> ReviewScreen
    ErrorServer -.-> ConfirmAction
    CancelLocked -.-> ListSchedule
```