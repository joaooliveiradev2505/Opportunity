import { useState } from 'react';

export default function TelaLogin({
  onLogin,
  onCriarNovoUsuario,
  onAcessoDemonstracao,
  salvando,
  erro,
  onLimparErro,
}) {
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [credenciais, setCredenciais] = useState({
    email: 'joao@opportunity.com.br',
    senha: '',
  });

  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senhaHash: '',
    dataNascimento: '2000-01-01',
    sexo: 'MASCULINO',
    renda: 5000,
    rendaVariavel: false,
    perfilInvestidor: 'MODERADO',
    diaFechamento: 5,
  });

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (!credenciais.email || !credenciais.senha) return;
    await onLogin(credenciais.email, credenciais.senha);
  };

  const handleSubmitCadastro = async (e) => {
    e.preventDefault();
    await onCriarNovoUsuario({
      ...novoUsuario,
      renda: Number(novoUsuario.renda),
      diaFechamento: Number(novoUsuario.diaFechamento),
    });
  };

  const trocarModo = (novoModo) => {
    setModo(novoModo);
    if (onLimparErro) onLimparErro();
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between">
      {/* Faixa Superior de Expediente do Jornal */}
      <header>
        <div
          className="d-flex flex-wrap justify-content-between align-items-center py-2 px-3 px-md-4 small font-mono-num"
          style={{
            backgroundColor: 'var(--bg-muted)',
            borderBottom: 'var(--border-ink)',
          }}
        >
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="fw-bold text-uppercase">
              <i className="bi bi-newspaper me-1"></i> VOL. I — EDIÇÃO FIAP
            </span>
            <span className="d-none d-sm-inline text-capitalize" style={{ color: 'var(--ink-secondary)' }}>
              {dataHoje}
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="stamp-badge-amber">
              <i className="bi bi-shield-lock-fill me-1"></i>
              PORTARIA CRIPTOGRAFADA (BCRYPT + BEARER)
            </span>
          </div>
        </div>

        {/* Masthead Editorial */}
        <div className="container py-3 divider-double text-center">
          <div
            className="text-uppercase small fw-bold font-mono-num mb-1"
            style={{ color: 'var(--ink-secondary)', letterSpacing: '0.14em' }}
          >
            DIÁRIO DE PATRIMÔNIO, ORÇAMENTO REVERSO & CUSTO DE OPORTUNIDADE
          </div>
          <h1 className="font-editorial display-4 fw-bold mb-1" style={{ color: 'var(--ink-primary)' }}>
            The Opportunity Ledger
          </h1>
          <p className="mb-0" style={{ color: 'var(--ink-secondary)', fontSize: '0.98rem' }}>
            <em>&ldquo;Cada real gasto sem propósito hoje é tempo de liberdade negociado do seu amanhã.&rdquo;</em>
          </p>
        </div>
      </header>

      {/* Corpo Central: 2 Colunas Estilo Caderno Econômico */}
      <main className="container my-4 flex-grow-1 d-flex align-items-center">
        <div className="row g-4 align-items-stretch w-100 mx-auto" style={{ maxWidth: '1040px' }}>
          {/* Coluna Esquerda: Editorial & Tese do Produto */}
          <div className="col-12 col-lg-6 d-flex">
            <div
              className="ledger-card-flat p-4 d-flex flex-column justify-content-between w-100"
              style={{ backgroundColor: 'var(--bg-receipt)' }}
            >
              <div>
                <div className="d-flex justify-content-between align-items-center pb-2 mb-3" style={{ borderBottom: 'var(--border-ink)' }}>
                  <span className="font-mono-num small fw-bold text-uppercase">
                    NOTA EDITORIAL Nº 001
                  </span>
                  <span className="stamp-badge-success">
                    ORACLE 19C + SPRING BOOT 4
                  </span>
                </div>

                <h2 className="h3 font-editorial fw-bold mb-3">
                  Por que um Livro-Razão de Custo de Oportunidade?
                </h2>

                <p className="small mb-3" style={{ color: 'var(--ink-secondary)', lineHeight: '1.65' }}>
                  Aplicativos financeiros comuns funcionam como retrovisores: eles apenas anotam o dinheiro depois que ele já foi embora. O <strong>Opportunity Ledger</strong> inverte essa lógica aplicando duas leis matemáticas ao seu patrimônio:
                </p>

                <div className="p-3 mb-3" style={{ backgroundColor: 'var(--bg-card)', border: '1.5px solid var(--ink-primary)' }}>
                  <div className="font-mono-num small fw-bold text-uppercase mb-1" style={{ color: 'var(--green-dollar)' }}>
                    <i className="bi bi-1-square-fill me-1"></i> Orçamento Reverso (Pay Yourself First)
                  </div>
                  <div className="small" style={{ color: 'var(--ink-secondary)' }}>
                    Sua Renda separa primeiro o <strong>Aporte das Metas</strong> e os <strong>Custos Fixos</strong>. O que sobra é o seu <em>Saldo Livre para Gastar Sem Culpa</em>.
                  </div>
                </div>

                <div className="p-3 mb-3" style={{ backgroundColor: 'var(--bg-card)', border: '1.5px solid var(--ink-primary)' }}>
                  <div className="font-mono-num small fw-bold text-uppercase mb-1" style={{ color: 'var(--red-stamp)' }}>
                    <i className="bi bi-2-square-fill me-1"></i> Motor de Juros Compostos & Atraso de Metas
                  </div>
                  <div className="small" style={{ color: 'var(--ink-secondary)' }}>
                    Cada gasto por impulso emite um <strong>Recibo de Oportunidade</strong> mostrando quantos dias sua Meta #1 foi adiada e quanto esse valor renderia a 12% a.a.
                  </div>
                </div>
              </div>

              {/* Rodapé da Coluna Esquerda: Atalho Homologação FIAP */}
              <div className="pt-3 mt-2" style={{ borderTop: '1.5px dashed var(--ink-faint)' }}>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <div className="font-mono-num small fw-bold text-uppercase">
                      AVALIAÇÃO / HOMOLOGAÇÃO FIAP
                    </div>
                    <div className="small" style={{ color: 'var(--ink-secondary)', fontSize: '0.78rem' }}>
                      Titular padrão: <code>joao@opportunity.com.br</code> (Senha: <code>123456</code>)
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-ink font-mono-num"
                    disabled={salvando}
                    onClick={onAcessoDemonstracao}
                  >
                    <i className="bi bi-lightning-charge-fill me-1"></i>
                    Entrar como Titular FIAP
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Cartão de Credenciamento (Login / Cadastro) */}
          <div className="col-12 col-lg-6 d-flex">
            <div className="ledger-card p-4 w-100 d-flex flex-column justify-content-between">
              <div>
                {/* Faixa Verde/Terracota de Cabeçalho */}
                <div
                  className="concept3-eq-header-solid-green mb-3 text-center"
                  style={{
                    margin: '-1.5rem -1.5rem 1.25rem -1.5rem',
                    padding: '0.65rem 1rem',
                    backgroundColor: modo === 'login' ? 'var(--green-dollar)' : 'var(--ink-primary)',
                  }}
                >
                  <i className={`bi ${modo === 'login' ? 'bi-key-fill' : 'bi-person-plus-fill'} me-2`}></i>
                  {modo === 'login'
                    ? 'CREDENCIAMENTO DO TITULAR — ACESSO AO LIVRO-CAIXA'
                    : 'ABERTURA DE CONTA PATRIMONIAL — NOVO TITULAR'}
                </div>

                {/* Abas de Alternância Login / Cadastro */}
                <div className="d-flex gap-2 mb-4 pb-3" style={{ borderBottom: 'var(--border-hairline)' }}>
                  <button
                    type="button"
                    className={`btn btn-sm flex-grow-1 font-mono-num ${modo === 'login' ? 'btn-ink' : 'btn-outline-ink'}`}
                    onClick={() => trocarModo('login')}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    1. JÁ SOU TITULAR (LOGIN)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm flex-grow-1 font-mono-num ${modo === 'cadastro' ? 'btn-ink' : 'btn-outline-ink'}`}
                    onClick={() => trocarModo('cadastro')}
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    2. ABRIR CONTA (CADASTRO)
                  </button>
                </div>

                {/* Alerta de Erro de Credenciais */}
                {erro && (
                  <div
                    className="p-2 px-3 mb-3 small d-flex justify-content-between align-items-center"
                    style={{
                      backgroundColor: 'var(--red-soft)',
                      border: '1.5px solid var(--red-stamp)',
                      color: 'var(--ink-primary)',
                    }}
                  >
                    <div>
                      <strong className="font-mono-num text-uppercase me-1" style={{ color: 'var(--red-stamp)' }}>
                        [ACESSO NEGADO]
                      </strong>
                      {erro}
                    </div>
                    {onLimparErro && (
                      <button
                        type="button"
                        className="btn btn-sm py-0 px-1"
                        onClick={onLimparErro}
                        title="Fechar aviso"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {/* FORMULÁRIO 1: LOGIN */}
                {modo === 'login' ? (
                  <form onSubmit={handleSubmitLogin}>
                    <div className="mb-3">
                      <label className="form-label small font-mono-num text-uppercase fw-bold mb-1">
                        E-mail Cadastrado no Oracle (TB_FIN_USUARIO)
                      </label>
                      <input
                        type="email"
                        className="form-control input-ledger"
                        placeholder="seu.email@dominio.com.br"
                        required
                        value={credenciais.email}
                        onChange={(e) => setCredenciais({ ...credenciais, email: e.target.value })}
                      />
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small font-mono-num text-uppercase fw-bold mb-0">
                          Senha de Acesso
                        </label>
                        <span className="font-mono-num" style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}>
                          Hash BCrypt ($2a$10$)
                        </span>
                      </div>
                      <input
                        type="password"
                        className="form-control input-ledger"
                        placeholder="Digite sua senha (ex: 123456)"
                        required
                        value={credenciais.senha}
                        onChange={(e) => setCredenciais({ ...credenciais, senha: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-ink w-100 py-2 font-mono-num text-uppercase fw-bold"
                      disabled={salvando}
                    >
                      {salvando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Validando Credenciais no Oracle...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-unlock-fill me-2"></i>
                          Autenticar e Abrir Livro-Caixa
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* FORMULÁRIO 2: CADASTRO DE NOVO TITULAR */
                  <form onSubmit={handleSubmitCadastro} className="row g-2">
                    <div className="col-12">
                      <label className="form-label small font-mono-num text-uppercase fw-bold mb-1">
                        Nome Completo do Titular
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm input-ledger"
                        placeholder="Ex: Maria Clara Mendes"
                        required
                        value={novoUsuario.nome}
                        onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-sm-7">
                      <label className="form-label small font-mono-num text-uppercase fw-bold mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-sm input-ledger"
                        placeholder="maria@opportunity.com.br"
                        required
                        value={novoUsuario.email}
                        onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-sm-5">
                      <label className="form-label small font-mono-num text-uppercase fw-bold mb-1">
                        Senha (BCrypt)
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-sm input-ledger"
                        placeholder="Crie uma senha"
                        required
                        value={novoUsuario.senhaHash}
                        onChange={(e) => setNovoUsuario({ ...novoUsuario, senhaHash: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-sm-4">
                      <label className="form-label small font-mono-num text-uppercase fw-bold mb-1">
                        Renda Base (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm input-ledger font-mono-num"
                        required
                        value={novoUsuario.renda}
                        onChange={(e) => setNovoUsuario({ ...novoUsuario, renda: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-sm-4">
                      <label className="form-label small font-mono-num text-uppercase fw-bold mb-1">
                        Perfil Investidor
                      </label>
                      <select
                        className="form-select form-select-sm input-ledger"
                        value={novoUsuario.perfilInvestidor}
                        onChange={(e) => setNovoUsuario({ ...novoUsuario, perfilInvestidor: e.target.value })}
                      >
                        <option value="CONSERVADOR">Conservador</option>
                        <option value="MODERADO">Moderado</option>
                        <option value="AGRESSIVO">Agressivo</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-4">
                      <label className="form-label small font-mono-num text-uppercase fw-bold mb-1">
                        Dia Fechamento
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="28"
                        className="form-control form-control-sm input-ledger font-mono-num"
                        required
                        value={novoUsuario.diaFechamento}
                        onChange={(e) => setNovoUsuario({ ...novoUsuario, diaFechamento: e.target.value })}
                      />
                    </div>

                    <div className="col-12 mt-3">
                      <button
                        type="submit"
                        className="btn btn-ink w-100 py-2 font-mono-num text-uppercase fw-bold"
                        disabled={salvando}
                      >
                        {salvando ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Registrando Titular no Oracle...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-check-fill me-2"></i>
                            Registrar no Oracle & Iniciar Livro-Caixa
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Selo Técnico de Segurança */}
              <div
                className="mt-4 pt-2 d-flex justify-content-between align-items-center small font-mono-num"
                style={{ borderTop: '1px solid var(--ink-faint)', color: 'var(--ink-faint)', fontSize: '0.73rem' }}
              >
                <span>PROTOCOLO: REST JSON / WRITE_ONLY</span>
                <span>CRIPTOGRAFIA: BCRYPT + BEARER</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé Editorial */}
      <footer
        className="py-3"
        style={{
          borderTop: '2px solid var(--border-ledger-strong)',
          backgroundColor: 'var(--bg-card-alt)',
        }}
      >
        <div className="container d-flex flex-wrap justify-content-between align-items-center small font-mono-num" style={{ color: 'var(--ink-secondary)' }}>
          <div>
            <strong>THE OPPORTUNITY LEDGER</strong> • PROJETO ANUAL FIAP • SPRING BOOT 4 + ORACLE 19C + REACT 19
          </div>
          <div>
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="text-decoration-none"
              style={{ color: 'var(--ink-primary)' }}
            >
              <i className="bi bi-braces me-1"></i>Documentação Swagger API
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
