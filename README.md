# 🎯 Fintech Opportunity - Gestão Financeira Baseada em Custo de Oportunidade

Documento de Especificação de Requisitos, Modelagem e Arquitetura para Desenvolvimento da Aplicação Web **Fintech** (Projeto Anual FIAP).

---

## 1. Visão Geral do Produto e Contexto da Startup

### 1.1 Conceito
O **Fintech Opportunity** é uma plataforma web responsiva de planejamento financeiro pessoal, controle de receitas, gastos, dívidas e investimentos que inverte a lógica tradicional de orçamento. Além de permitir o gerenciamento completo da saúde financeira do usuário, a aplicação utiliza a metodologia de **Orçamento Reverso** (*Pay Yourself First*) e calcula em tempo real o **Custo de Oportunidade** de gastos não essenciais e juros de dívidas sobre os objetivos de vida e investimentos do usuário (Reserva de Emergência, aposentadoria, imóvel, estudos, viagens, etc.).

### 1.2 Contexto do Projeto (Startup Fintech)
* **Patrocinador:** Diretoria da Startup Fintech, Departamento de Vendas e FIAP.
* **Orçamento Alocado:** R$ 30.000,00 (Trinta mil reais) para o ciclo de desenvolvimento de 1 ano (7 Fases).
* **Metodologia de Gestão:** Gestão Ágil de Projetos utilizando o framework **Scrum**.

### 1.3 Proposta de Valor
* **Controle Financeiro 360º:** Gestão centralizada de múltiplas fontes de receita, despesas fixas/variáveis, controle de dívidas (evitando inadimplência) e carteira de investimentos (Renda Fixa e Variável).
* **Conscientização Financeira (Custo de Oportunidade):** Traduz gastos supérfluos do presente e multas/juros de dívidas em "tempo de atraso" para grandes conquistas futuras.
* **Gasto Sem Culpa (Orçamento Reverso):** Define com clareza o valor exato que o usuário pode gastar livremente no mês após garantir o pagamento das contas fixas, parcelas de dívidas e os aportes para suas metas/investimentos.
* **Visualização Científica & Inteligência Artificial:** Utiliza projeções de juros compostos e um **Chatbot Inteligente (IA)** para orientar decisões financeiras no dia a dia.

---

## 2. Requisitos Funcionais (RF)

### RF-01: Autenticação, Perfil Financeiro e Fontes de Receita
* O sistema deve permitir o cadastro e login seguro de usuários.
* O usuário deve configurar seu perfil de investidor (*Conservador*, *Moderado* ou *Agressivo*) e a data-base do seu ciclo financeiro mensal.
* Permitir o registro de **múltiplas fontes de receita** (ex: salário, projetos, *freelance*, dividendos, extras), compondo a Renda Total Mensal dinamicamente.

### RF-02: Gestão de Objetivos de Vida (Metas) e Reserva de Emergência
* O sistema deve incentivar como primeira meta padrão a construção da **Reserva de Emergência** (atrelada a investimentos de baixa volatilidade e alta liquidez, como o Tesouro Selic).
* Permitir cadastrar objetivos financeiros com os seguintes atributos:
  * **Nome da Meta** (ex: *Reserva de Emergência*, *Primeiro Imóvel*, *Viagem Japão*, *Independência Financeira*).
  * **Valor Alvo (R$)** e **Saldo Atual Acumulado (R$)**.
  * **Aporte Mensal Planejado (R$)** e **Prazo / Data Alvo**.
  * **Prioridade/Peso** (1 a 5, para distribuição de aportes).
  * **Taxa de Rendimento Estimada (% a.a.)** para cálculo de rentabilidade futura.
* Exibir barra de progresso individual e consolidada das metas.

### RF-03: Controle de Dívidas e Prevenção de Inadimplência
* Permitir cadastrar e acompanhar **dívidas e parcelamentos** contendo:
  * Descrição da dívida, valor total, valor da parcela, número total de parcelas e parcelas pagas.
  * Data de vencimento mensal, taxa de juros/multa por atraso e status (*Em dia*, *Pendente*, *Atrasada*, *Quitada*).
* Emitir alertas visuais para evitar inadimplência e calcular o impacto que os juros de atraso causam nas metas do usuário.

### RF-04: Controle de Carteira de Investimentos (Renda Fixa e Variável)
* Permitir registrar e acompanhar os ativos financeiros do usuário, associando-os ou não a metas específicas:
  * **Renda Fixa:** Tesouro Selic, Tesouro IPCA, CDB, LCI e LCA (indicando isenção de IR quando aplicável).
  * **Renda Variável:** Fundos Imobiliários (FIIs), Ações, ETFs e Criptomoedas.
* Classificar cada investimento por **Nível de Risco** (*Baixo*, *Moderado*, *Alto*, *Muito Alto*), **Liquidez** (*Alta*, *Média*, *Baixa*) e **Perfil Recomendado**.

### RF-05: Módulo de Orçamento Reverso (*Pay Yourself First*)
* O sistema deve calcular automaticamente o **Teto de Gastos Livres (Gasto Sem Culpa)** do mês utilizando a fórmula:
  $$\text{Gastos Livres} = \sum(\text{Receitas do Mês}) - \sum(\text{Aportes das Metas}) - \sum(\text{Despesas Fixas}) - \sum(\text{Parcelas de Dívidas})$$
* Dashboard visual e responsivo mostrando o consumo do saldo livre disponível em tempo real.

### RF-06: Registro de Gastos e Calculadora de Custo de Oportunidade
* Ao registrar uma despesa não essencial/variável, o sistema deve calcular e exibir imediatamente:
  1. **Impacto em Prazo:** Quantos dias/meses esse valor adiciona para atingir a meta prioritária.
  2. **Impacto no Futuro (Juros Compostos):** Qual seria o valor desse gasto acumulado no prazo da meta de longo prazo se tivesse sido investido:
     $$FV = PV \times (1 + i)^n$$
     *Onde $PV$ é o valor gasto, $i$ é a taxa de juros mensal estimada da meta e $n$ é o número de meses até o prazo da meta.*

### RF-07: Analisador de Micro-hábitos (Gasto Recorrente)
* Permitir isolar e simular um gasto frequente ou compra por impulso (ex: R$ 25/dia com delivery).
* Projetar o impacto financeiro desse hábito em horizontes de **1, 5 e 10 anos** comparado à alocação do valor na carteira de investimentos cadastrada.

### RF-08: Assistente Virtual / Chatbot com Inteligência Artificial
* Disponibilizar um **Chatbot integrado** para tirar dúvidas de educação financeira (conceitos do glossário: Tesouro Direto, CDB, LCI, LCA, FIIs, Ações, ETFs, Cripto) e auxiliar o usuário em decisões rápidas (ex: *"Posso gastar R$ 150 hoje sem atrasar minha meta?"*).

---

## 3. Requisitos Não Funcionais (RNF)

* **RNF-01 (Stack Frontend Obrigatória):** Interface web desenvolvida obrigatoriamente com **HTML5, CSS3, JavaScript, ReactJS e Bootstrap**.
* **RNF-02 (Responsividade e Compatibilidade):** Layout responsivo adaptável a dispositivos móveis e desktops, homologado nas versões atualizadas do **Google Chrome, Mozilla Firefox e Microsoft Edge**.
* **RNF-03 (Stack Backend Obrigatória):** API / Web Service construída em **Java** (utilizando Orientação a Objetos e frameworks corporativos como Spring Boot) e algoritmos de apoio/IA em **Python**.
* **RNF-04 (Banco de Dados Obrigatório):** Persistência de dados em banco de dados relacional **Oracle**.
* **RNF-05 (Performance):** Os cálculos de projeção e recálculo de prazos das metas devem ser executados em tempo real com tempo de resposta $< 200\text{ms}$.
* **RNF-06 (Segurança):** Criptografia de senhas (BCrypt/Argon2) e autenticação stateless via tokens JWT.

---

## 4. Modelagem de Dados Relacional (DDL Padrão Oracle SQL)

```sql
-- 1. Tabela de Usuários
CREATE TABLE T_FIN_USUARIO (
    id_usuario VARCHAR2(36) PRIMARY KEY,
    nm_usuario VARCHAR2(100) NOT NULL,
    ds_email VARCHAR2(100) UNIQUE NOT NULL,
    ds_senha_hash VARCHAR2(255) NOT NULL,
    tp_perfil_investidor VARCHAR2(20) DEFAULT 'MODERADO', -- 'CONSERVADOR', 'MODERADO', 'AGRESSIVO'
    nr_dia_fechamento NUMBER(2) DEFAULT 5,
    dt_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Objetivos Financeiros (Metas e Reserva de Emergência)
CREATE TABLE T_FIN_META (
    id_meta VARCHAR2(36) PRIMARY KEY,
    id_usuario VARCHAR2(36) NOT NULL,
    nm_meta VARCHAR2(100) NOT NULL,
    vl_alvo NUMBER(12, 2) NOT NULL,
    vl_atual NUMBER(12, 2) DEFAULT 0.00,
    vl_aporte_mensal NUMBER(12, 2) NOT NULL,
    dt_alvo DATE NOT NULL,
    nr_prioridade NUMBER(1) DEFAULT 3, -- 1 (Baixa) a 5 (Alta)
    tx_rendimento_anual NUMBER(5, 2) DEFAULT 10.00, -- Ex: 10% a.a.
    st_reserva_emergencia CHAR(1) DEFAULT 'N', -- 'S' ou 'N'
    CONSTRAINT fk_meta_usuario FOREIGN KEY (id_usuario) REFERENCES T_FIN_USUARIO(id_usuario) ON DELETE CASCADE
);

-- 3. Tabela de Transações (Receitas, Gastos Fixos, Gastos Livres e Aportes)
CREATE TABLE T_FIN_TRANSACAO (
    id_transacao VARCHAR2(36) PRIMARY KEY,
    id_usuario VARCHAR2(36) NOT NULL,
    ds_transacao VARCHAR2(150) NOT NULL,
    vl_transacao NUMBER(12, 2) NOT NULL,
    tp_transacao VARCHAR2(20) NOT NULL, -- 'INCOME', 'FIXED_COST', 'FREE_SPEND', 'GOAL_DEPOSIT'
    ds_categoria VARCHAR2(50), -- 'SALARIO', 'FREELANCE', 'ALUGUEL', 'LAZER', 'DELIVERY', etc.
    dt_transacao DATE NOT NULL,
    CONSTRAINT fk_transacao_usuario FOREIGN KEY (id_usuario) REFERENCES T_FIN_USUARIO(id_usuario) ON DELETE CASCADE
);

-- 4. Tabela de Controle de Dívidas
CREATE TABLE T_FIN_DIVIDA (
    id_divida VARCHAR2(36) PRIMARY KEY,
    id_usuario VARCHAR2(36) NOT NULL,
    ds_divida VARCHAR2(150) NOT NULL,
    vl_total NUMBER(12, 2) NOT NULL,
    vl_parcela NUMBER(12, 2) NOT NULL,
    nr_total_parcelas NUMBER(4) NOT NULL,
    nr_parcelas_pagas NUMBER(4) DEFAULT 0,
    dt_vencimento_mensal DATE NOT NULL,
    tx_juros_atraso NUMBER(5, 2) DEFAULT 0.00,
    st_divida VARCHAR2(20) DEFAULT 'EM_DIA', -- 'EM_DIA', 'ATRASADA', 'QUITADA'
    CONSTRAINT fk_divida_usuario FOREIGN KEY (id_usuario) REFERENCES T_FIN_USUARIO(id_usuario) ON DELETE CASCADE
);

-- 5. Tabela de Carteira de Investimentos
CREATE TABLE T_FIN_INVESTIMENTO (
    id_investimento VARCHAR2(36) PRIMARY KEY,
    id_usuario VARCHAR2(36) NOT NULL,
    id_meta VARCHAR2(36),
    nm_ativo VARCHAR2(100) NOT NULL,
    tp_modalidade VARCHAR2(20) NOT NULL, -- 'RENDA_FIXA', 'RENDA_VARIAVEL'
    tp_produto VARCHAR2(30) NOT NULL, -- 'TESOURO_SELIC', 'TESOURO_IPCA', 'CDB', 'LCI_LCA', 'FII', 'ACOES', 'ETF', 'CRIPTO'
    vl_investido NUMBER(12, 2) NOT NULL,
    vl_saldo_atual NUMBER(12, 2) NOT NULL,
    ds_risco VARCHAR2(20) NOT NULL, -- 'BAIXO', 'MODERADO', 'ALTO', 'MUITO_ALTO'
    ds_liquidez VARCHAR2(20) NOT NULL, -- 'ALTA', 'MEDIA', 'BAIXA'
    st_isento_ir CHAR(1) DEFAULT 'N', -- 'S' ou 'N'
    dt_aplicacao DATE NOT NULL,
    CONSTRAINT fk_invest_usuario FOREIGN KEY (id_usuario) REFERENCES T_FIN_USUARIO(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_invest_meta FOREIGN KEY (id_meta) REFERENCES T_FIN_META(id_meta) ON DELETE SET NULL
);

-- 6. Histórico de Log de Custo de Oportunidade
CREATE TABLE T_FIN_LOG_OPORTUNIDADE (
    id_log VARCHAR2(36) PRIMARY KEY,
    id_transacao VARCHAR2(36) NOT NULL,
    id_meta_impactada VARCHAR2(36) NOT NULL,
    nr_dias_atraso NUMBER(6) NOT NULL,
    vl_futuro_perdido NUMBER(12, 2) NOT NULL,
    dt_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_transacao FOREIGN KEY (id_transacao) REFERENCES T_FIN_TRANSACAO(id_transacao) ON DELETE CASCADE,
    CONSTRAINT fk_log_meta FOREIGN KEY (id_meta_impactada) REFERENCES T_FIN_META(id_meta) ON DELETE CASCADE
);
```

---

## 5. Arquitetura da Aplicação e Stack Obrigatória FIAP

```
+-------------------------------------------------------------------+
|                        CLIENT (Camada View)                       |
|  - HTML5, CSS3, JavaScript (ES6+)                                 |
|  - ReactJS + Bootstrap 5 (Layout Responsivo Mobile/Desktop)       |
|  - Dashboard Interativo + Interface do Chatbot Financeiro         |
+-------------------------------------------------------------------+
                                  |
                            HTTP / REST API (JSON)
                                  |
+-------------------------------------------------------------------+
|                        SERVER (Camada Model / API)                |
|  - API Web Service em Java (Spring Boot / POO)                    |
|  - Motor Preditivo de Custo de Oportunidade & Juros Compostos     |
|  - Módulo de Algoritmos & Inteligência Artificial / Chatbot (Py)  |
|  - Autenticação e Segurança JWT                                   |
+-------------------------------------------------------------------+
                                  |
                             JDBC / JPA
                                  |
+-------------------------------------------------------------------+
|                    DATABASE (Persistência Relacional)             |
|  - Oracle Database (Tabelas T_FIN_*)                              |
+-------------------------------------------------------------------+
```

---

## 6. Cronograma de Desenvolvimento (As 7 Fases da FIAP)

### Fase 1: Gestão Ágil, Escopo, Algoritmos em Python & IA
* Formalização do projeto e escopo com artefatos do **Scrum** (Product Backlog, Sprint Backlog, controle do orçamento de R$ 30 mil).
* Preparação da infraestrutura e ambiente de desenvolvimento.
* Desenvolvimento dos primeiros algoritmos financeiros e lógica de cálculo de Custo de Oportunidade em **Python**.
* Concepção inicial do uso de **Inteligência Artificial** na análise de dados financeiros.

### Fase 2: Casos de Uso, Algoritmos e Prototipação (UI/UX)
* Documentação de Casos de Uso e regras de negócio (Receitas, Gastos, Dívidas, Investimentos e Metas).
* Evolução dos algoritmos financeiros.
* Idealização e desenho dos protótipos de tela (Wireframes / Mockups responsivos) da solução Fintech.

### Fase 3: Modelagem de Banco de Dados Relacional
* Modelagem Conceitual (MER/DER) e Lógica do banco de dados.
* Documentação do Dicionário de Dados contemplando usuários, receitas, despesas, dívidas, investimentos, metas e logs de oportunidade.
* Refinamento dos algoritmos integrados às estruturas de dados.

### Fase 4: Desenvolvimento da Camada View (Frontend Web)
* Construção de todas as interfaces do sistema utilizando **HTML, CSS, Bootstrap, JavaScript e ReactJS**.
* Implementação do layout responsivo e dashboards interativos (Orçamento Reverso, Simulador de Micro-hábitos, Carteira de Investimentos e Controle de Dívidas).
* Testes de compatibilidade no Google Chrome, Mozilla Firefox e Microsoft Edge.

### Fase 5: Programação Orientada a Objetos e Camada Model em Java
* Documentação de comunicação e arquitetura do sistema.
* Elaboração do **Diagrama de Classes UML**.
* Implementação das classes de domínio, regras de negócio (POO) e início da camada *Model* utilizando **Java**.

### Fase 6: Persistência em Java e Banco de Dados Oracle
* Criação física das tabelas (`T_FIN_*`), constraints e sequences no **Oracle Database**.
* Integração da camada *Model* em Java com o banco de dados Oracle (DAO / Repository) para manipulação e persistência dos dados.

### Fase 7: Integração Full-Stack, Chatbot IA e Testes Finais
* Integração completa entre a camada *View* (ReactJS + Bootstrap) e a API *Model* (Java + Oracle).
* Consolidação do **Chatbot com IA** para atendimento e consultoria financeira ao usuário.
* Execução da bateria de testes de software, validação de qualidade e entrega final do projeto.

---

## 7. Como Executar a API Backend (Java 21 + Spring Boot + Oracle)

### 7.1 Pré-requisitos e Configuração de Variáveis (`.env`)
1. **Java JDK 21** instalado (`java -version` e `javac -version`).
2. Na raiz do projeto (`FintechFiap/`), crie um arquivo `.env` (ignorado pelo Git) com suas credenciais do banco Oracle da FIAP:
   ```properties
   DB_USERNAME=rmXXXXXX
   DB_PASSWORD=sua_senha_fiap
   ```
3. Inicie o servidor Spring Boot utilizando o Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Acesse a documentação interativa **Swagger UI** no navegador:
   👉 **`http://localhost:8080/swagger-ui.html`**

---

### 7.2 Mapa de Endpoints da API REST

| Recurso | Método HTTP | Rota (`Endpoint`) | Descrição |
| :--- | :---: | :--- | :--- |
| **Usuários** | `POST` | `/api/usuarios` | Cadastra um novo usuário no Oracle (`201 Created`) |
| **Usuários** | `GET` | `/api/usuarios/{id}` | Busca os dados de um usuário pelo UUID |
| **Metas** | `POST` | `/api/metas/usuario/{usuarioId}` | Cria um objetivo financeiro / Reserva de Emergência |
| **Metas** | `GET` | `/api/metas/usuario/{usuarioId}` | Lista todas as metas de um usuário |
| **Metas** | `GET` | `/api/metas/{id}` | Busca uma meta específica pelo UUID |
| **Transações** | `POST` | `/api/transacoes/usuario/{usuarioId}` | Registra transação e **aciona o Motor de Custo de Oportunidade** se for `GASTO_LIVRE` |
| **Transações** | `GET` | `/api/transacoes/usuario/{usuarioId}` | Lista o extrato completo de transações do usuário |
| **Custo de Oportunidade** | `GET` | `/api/transacoes/usuario/{usuarioId}/custos-oportunidade` | Lista os logs calculados (Dias de Atraso + Valor Futuro Perdido em Juros Compostos) |
| **Dívidas** | `POST` | `/api/dividas/usuario/{usuarioId}` | Registra uma dívida ou parcelamento do usuário |
| **Dívidas** | `GET` | `/api/dividas/usuario/{usuarioId}` | Lista todas as dívidas do usuário |
| **Dívidas** | `GET` | `/api/dividas/{id}` | Busca uma dívida específica pelo UUID |
| **Investimentos** | `POST` | `/api/investimentos/usuario/{usuarioId}` | Cadastra um ativo de Renda Fixa ou Renda Variável na carteira |
| **Investimentos** | `GET` | `/api/investimentos/usuario/{usuarioId}` | Lista a carteira de investimentos do usuário |
| **Investimentos** | `GET` | `/api/investimentos/{id}` | Busca um investimento específico pelo UUID |

---

## 8. Roteiro de Testes Homologados (Swagger UI + Oracle FIAP)

Abaixo está o passo a passo completo do teste ponta a ponta (E2E) homologado no banco **Oracle 19c da FIAP**, validando a persistência relacional e o cálculo automático do **Motor de Custo de Oportunidade**.

> **⚠️ Atenção no Swagger UI:** Ao clicar em *"Try it out"* nos métodos `POST`, substitua todo o JSON de exemplo gerado pelo Swagger pelos payloads abaixo (não envie o campo `"id": "string"`, pois o Hibernate gera o UUID automaticamente no `INSERT`).

### Passo 1 — Criar Usuário (`POST /api/usuarios`)

**Payload enviado (`Request Body`):**
```json
{
  "nome": "João Gabriel",
  "email": "joao@opportunity.com.br",
  "senhaHash": "123456",
  "dataNascimento": "2002-05-25",
  "sexo": "MASCULINO",
  "renda": 5000.00,
  "rendaVariavel": false,
  "perfilInvestidor": "MODERADO",
  "diaFechamento": 5
}
```
* **Resultado:** `201 Created` — Usuário persistido na `TB_FIN_USUARIO` com UUID gerado (`da354833-b0ea-425a-b2aa-c9127c31d002`).

---

### Passo 2 — Cadastrar Meta Financeira (`POST /api/metas/usuario/{usuarioId}`)

* **Parâmetro `usuarioId`:** `da354833-b0ea-425a-b2aa-c9127c31d002`

**Payload enviado (`Request Body`):**
```json
{
  "meta": "Reserva de Emergência",
  "valorAlvo": 15000.00,
  "valorAtual": 3000.00,
  "aporteMensal": 1500.00,
  "dataAlvo": "2028-10-24",
  "prioridade": 1,
  "taxaRendimentoAnual": 12.00,
  "reservaEmergencia": true
}
```
* **Resultado:** `201 Created` — Meta persistida na `TB_FIN_META` com UUID `e811dc30-fa6a-4224-9759-7f8d8755db38` (Aporte planejado: R$ 1.500,00/mês = **R$ 50,00/dia** | Rendimento estimado: **12% a.a.** = **1% a.m.**).

---

### Passo 3 — Lançar um Gasto Livre (`POST /api/transacoes/usuario/{usuarioId}`)

* **Parâmetro `usuarioId`:** `da354833-b0ea-425a-b2aa-c9127c31d002`

**Payload enviado (`Request Body`):**
```json
{
  "descricao": "Costelinha na brasa de sábado",
  "valorTransacao": 150.00,
  "tipoTransacao": "GASTO_LIVRE",
  "categoria": "LAZER",
  "dataTransacao": "2026-10-24"
}
```
* **Resultado:** `201 Created` — Transação salva na `TB_FIN_TRANSACAO` (`df79b11d-2d11-4805-92e5-e507587e74a6`). Ao detectar `tipoTransacao == GASTO_LIVRE`, a camada `TransacaoService` disparou automaticamente o cálculo de impacto e gravou o registro na tabela `TB_FIN_LOG_OPORTUNIDADE`.

---

### Passo 4 — Consultar Custo de Oportunidade Calculado (`GET /api/transacoes/usuario/{usuarioId}/custos-oportunidade`)

* **Parâmetro `usuarioId`:** `da354833-b0ea-425a-b2aa-c9127c31d002`

**Resposta Real Retornada pela API (`200 OK`):**
```json
[
  {
    "id": "0d475719-e04d-4d53-9174-20a527859d25",
    "transacao": {
      "id": "df79b11d-2d11-4805-92e5-e507587e74a6",
      "usuario": {
        "id": "da354833-b0ea-425a-b2aa-c9127c31d002",
        "nome": "João Gabriel",
        "email": "joao@opportunity.com.br",
        "dataNascimento": "2002-05-25",
        "sexo": "MASCULINO",
        "senhaHash": "123456",
        "renda": 5000,
        "rendaVariavel": false,
        "perfilInvestidor": "MODERADO",
        "dataCriacao": null,
        "diaFechamento": 5,
        "hibernateLazyInitializer": {}
      },
      "descricao": "Costelinha na brasa de sábado",
      "valorTransacao": 150,
      "tipoTransacao": "GASTO_LIVRE",
      "categoria": "LAZER",
      "dataTransacao": "2026-10-24",
      "hibernateLazyInitializer": {}
    },
    "metaImpactada": {
      "id": "e811dc30-fa6a-4224-9759-7f8d8755db38",
      "usuario": {
        "id": "da354833-b0ea-425a-b2aa-c9127c31d002",
        "nome": "João Gabriel",
        "email": "joao@opportunity.com.br",
        "dataNascimento": "2002-05-25",
        "sexo": "MASCULINO",
        "senhaHash": "123456",
        "renda": 5000,
        "rendaVariavel": false,
        "perfilInvestidor": "MODERADO",
        "dataCriacao": null,
        "diaFechamento": 5,
        "hibernateLazyInitializer": {}
      },
      "meta": "Reserva de Emergência",
      "valorAlvo": 15000,
      "valorAtual": 3000,
      "aporteMensal": 1500,
      "dataAlvo": "2028-10-24",
      "prioridade": 1,
      "taxaRendimentoAnual": 12,
      "reservaEmergencia": true,
      "criadoEm": null,
      "hibernateLazyInitializer": {}
    },
    "diasAtraso": 3,
    "valorFuturoPerdido": 190.46,
    "dataCalculo": "2026-10-24T16:03:09.568441444"
  }
]
```

#### 📊 Memória de Cálculo Validada pelo Motor:
1. **Aporte Diário da Meta:** $\text{R\$ } 1.500{,}00 \div 30\text{ dias} = \text{R\$ } 50{,}00/\text{dia}$
2. **Impacto em Dias de Atraso (`diasAtraso`):** $\text{R\$ } 150{,}00 \div \text{R\$ } 50{,}00 = \mathbf{3\text{ dias}}$
3. **Impacto em Juros Compostos (`valorFuturoPerdido`):**
   $$FV = 150{,}00 \times (1 + 0{,}01)^{24\text{ meses}} = \mathbf{\text{R\$ } 190{,}46}$$
   *(O gasto de R$ 150,00 hoje representa R$ 190,46 a menos na Reserva de Emergência na data alvo de 24/10/2028).*
