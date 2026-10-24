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
