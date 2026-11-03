-- =============================================================================
-- FINTECH OPPORTUNITY — THE OPPORTUNITY LEDGER (PROJETO ANUAL FIAP)
-- Script DDL Relacional — Oracle Database 19c / 21c (RNF-04 / Fases 3 e 6)
-- =============================================================================

-- 1. Tabela de Usuários (TB_FIN_USUARIO)
CREATE TABLE TB_FIN_USUARIO (
    id_usuario           VARCHAR2(36) PRIMARY KEY,
    nm_usuario           VARCHAR2(150) NOT NULL,
    email                VARCHAR2(100) UNIQUE NOT NULL,
    dt_nascimento        DATE NOT NULL,
    sexo                 VARCHAR2(10) DEFAULT 'MASCULINO' NOT NULL,
    ds_senha_hash        VARCHAR2(255) NOT NULL,
    renda                NUMBER(12, 2),
    renda_variavel       NUMBER(1, 0) DEFAULT 0,
    tp_perfil_investidor VARCHAR2(20) DEFAULT 'MODERADO',
    dt_criacao           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nr_dia_fechamento    NUMBER(5, 0) DEFAULT 5
);

-- 2. Tabela de Objetivos Financeiros / Metas (TB_FIN_META)
CREATE TABLE TB_FIN_META (
    id_meta               VARCHAR2(36) PRIMARY KEY,
    id_usuario            VARCHAR2(36) NOT NULL,
    nm_meta               VARCHAR2(150) NOT NULL,
    vl_alvo               NUMBER(12, 2),
    vl_atual              NUMBER(12, 2) DEFAULT 0.00,
    vl_aporte_mensal      NUMBER(12, 2),
    dt_alvo               DATE NOT NULL,
    nr_prioridade         NUMBER(1, 0) DEFAULT 1 NOT NULL,
    tx_rendimento_anual   NUMBER(5, 2) DEFAULT 12.00,
    st_reserva_emergencia NUMBER(1, 0) DEFAULT 0,
    criado_em             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_meta_usuario FOREIGN KEY (id_usuario)
        REFERENCES TB_FIN_USUARIO (id_usuario) ON DELETE CASCADE
);

-- 3. Tabela de Transações do Livro-Caixa (TB_FIN_TRANSACAO)
CREATE TABLE TB_FIN_TRANSACAO (
    id_transacao VARCHAR2(36) PRIMARY KEY,
    id_usuario   VARCHAR2(36) NOT NULL,
    ds_descricao VARCHAR2(150) NOT NULL,
    vl_transacao NUMBER(12, 2) DEFAULT 0.00,
    tp_transacao VARCHAR2(20) NOT NULL, -- 'RECEITA', 'DESPESA_FIXA', 'GASTO_LIVRE', 'APORTE_META'
    ds_categoria VARCHAR2(50) NOT NULL,
    dt_transacao DATE NOT NULL,
    CONSTRAINT fk_transacao_usuario FOREIGN KEY (id_usuario)
        REFERENCES TB_FIN_USUARIO (id_usuario) ON DELETE CASCADE
);

-- 4. Tabela de Controle de Dívidas e Parcelamentos (TB_FIN_DIVIDA)
CREATE TABLE TB_FIN_DIVIDA (
    id_divida            VARCHAR2(36) PRIMARY KEY,
    id_usuario           VARCHAR2(36) NOT NULL,
    ds_divida            VARCHAR2(150) NOT NULL,
    vl_total             NUMBER(12, 2) NOT NULL,
    vl_parcela           NUMBER(12, 2) NOT NULL,
    nt_total_parcelas    NUMBER(10, 0) NOT NULL,
    nr_parcelas_pagas    NUMBER(10, 0) DEFAULT 0 NOT NULL,
    dt_vencimento_mensal DATE NOT NULL,
    tx_juros_atraso      NUMBER(5, 2) DEFAULT 0.00,
    status_divida        VARCHAR2(20) DEFAULT 'EM_DIA', -- 'EM_DIA', 'PENDENTE', 'ATRASADA', 'QUITADA'
    CONSTRAINT fk_divida_usuario FOREIGN KEY (id_usuario)
        REFERENCES TB_FIN_USUARIO (id_usuario) ON DELETE CASCADE
);

-- 5. Tabela de Carteira de Investimentos (TB_FIN_INVESTIMENTO)
CREATE TABLE TB_FIN_INVESTIMENTO (
    id_investimento VARCHAR2(36) PRIMARY KEY,
    id_usuario      VARCHAR2(36) NOT NULL,
    id_meta         VARCHAR2(36),
    nm_ativo        VARCHAR2(100) NOT NULL,
    tp_modalidade   VARCHAR2(20) NOT NULL, -- 'RENDA_FIXA', 'RENDA_VARIAVEL'
    tp_produto      VARCHAR2(30) NOT NULL, -- 'TESOURO_SELIC', 'CDB', 'LCI_LCA', 'FII', 'ACOES', 'ETF', 'CRIPTO'
    vl_investido    NUMBER(12, 2) DEFAULT 0.00 NOT NULL,
    vl_saldo_atual  NUMBER(12, 2) DEFAULT 0.00 NOT NULL,
    ds_risco        VARCHAR2(20) NOT NULL, -- 'BAIXO', 'MODERADO', 'ALTO', 'MUITO_ALTO'
    ds_liquidez     VARCHAR2(20) NOT NULL, -- 'ALTA', 'MEDIA', 'BAIXA'
    st_isento_ir    NUMBER(1, 0) DEFAULT 0,
    dt_aplicacao    DATE NOT NULL,
    CONSTRAINT fk_invest_usuario FOREIGN KEY (id_usuario)
        REFERENCES TB_FIN_USUARIO (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_invest_meta FOREIGN KEY (id_meta)
        REFERENCES TB_FIN_META (id_meta) ON DELETE SET NULL
);

-- 6. Tabela de Recibos de Custo de Oportunidade (TB_FIN_LOG_OPORTUNIDADE)
CREATE TABLE TB_FIN_LOG_OPORTUNIDADE (
    id_log            VARCHAR2(36) PRIMARY KEY,
    id_transacao      VARCHAR2(36) NOT NULL,
    id_meta_impactada VARCHAR2(36),
    nr_dias_atraso    NUMBER(10, 0) NOT NULL,
    vl_futuro_perdido NUMBER(12, 2),
    dt_calculo        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_transacao FOREIGN KEY (id_transacao)
        REFERENCES TB_FIN_TRANSACAO (id_transacao) ON DELETE CASCADE,
    CONSTRAINT fk_log_meta FOREIGN KEY (id_meta_impactada)
        REFERENCES TB_FIN_META (id_meta) ON DELETE CASCADE
);
