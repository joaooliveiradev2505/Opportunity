import { useState } from 'react';
import { formatBRL } from '../services/api';

export default function HeaderJornal({
  usuario,
  online,
  autenticado,
  onLogin,
  onLogout,
  onTrocarUsuario,
  onCriarNovoUsuario,
  carregando,
}) {
  const [mostrarPainelConta, setMostrarPainelConta] = useState(false);
  const [abaConta, setAbaConta] = useState('login'); // 'login' | 'cadastro' | 'uuid'
  const [idInput, setIdInput] = useState('');
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!credenciais.email || !credenciais.senha) return;
    const sucesso = await onLogin(credenciais.email, credenciais.senha);
    if (sucesso) {
      setCredenciais((prev) => ({ ...prev, senha: '' }));
      setMostrarPainelConta(false);
    }
  };

  const handleCriar = async (e) => {
    e.preventDefault();
    await onCriarNovoUsuario({
      ...novoUsuario,
      senhaHash: novoUsuario.senhaHash || '123456',
      renda: Number(novoUsuario.renda),
      diaFechamento: Number(novoUsuario.diaFechamento),
    });
    setMostrarPainelConta(false);
  };

  return (
    <header className="mb-4">
      {/* Faixa Superior de Expediente do Jornal */}
      <div
        className="d-flex flex-wrap justify-content-between align-items-center py-2 px-3 small font-mono-num"
        style={{
          backgroundColor: 'var(--bg-muted)',
          borderBottom: 'var(--border-ink)',
        }}
      >
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="fw-bold text-uppercase">
            <i className="bi bi-newspaper me-1"></i> VOL. I — EDIÇÃO FIAP
          </span>
          <span className="d-none d-md-inline text-capitalize" style={{ color: 'var(--ink-secondary)' }}>
            {dataHoje}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className={online ? 'stamp-badge-success' : 'stamp-badge-danger'}>
            <i className={`bi ${online ? 'bi-database-check' : 'bi-exclamation-triangle'} me-1`}></i>
            {online ? 'ORACLE FIAP CONECTADO' : 'MODO DEMONSTRAÇÃO'}
          </span>
          {autenticado && (
            <span className="stamp-badge-amber" title="Sessão autenticada via BCrypt + Bearer Token">
              <i className="bi bi-shield-lock-fill me-1"></i>
              SESSÃO AUTENTICADA
            </span>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-ink py-0 px-2"
            onClick={() => setMostrarPainelConta(!mostrarPainelConta)}
          >
            <i className="bi bi-person-lock me-1"></i>
            {autenticado ? 'Conta / Trocar Titular' : 'Entrar / Cadastrar'}
          </button>
          {autenticado && (
            <button
              type="button"
              className="btn btn-sm btn-outline-ink py-0 px-2"
              style={{ color: 'var(--accent-terracotta)', borderColor: 'var(--accent-terracotta)' }}
              onClick={onLogout}
              title="Encerrar sessão autenticada"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Sair
            </button>
          )}
        </div>
      </div>

      {/* Cabeçalho Principal (Masthead Editorial) */}
      <div className="container-fluid px-3 px-md-4 pt-3 pb-3 divider-double">
        <div className="row align-items-center g-3">
          <div className="col-12 col-lg-7">
            <div className="text-uppercase small fw-bold font-mono-num" style={{ color: 'var(--ink-secondary)', letterSpacing: '0.12em' }}>
              DIÁRIO DE PATRIMÔNIO, ORÇAMENTO REVERSO & CUSTO DE OPORTUNIDADE
            </div>
            <h1 className="font-editorial display-5 fw-bold mb-1" style={{ color: 'var(--ink-primary)' }}>
              The Opportunity Ledger
            </h1>
            <p className="mb-0" style={{ color: 'var(--ink-secondary)', fontSize: '0.95rem' }}>
              <em>&ldquo;Cada real gasto sem propósito hoje é tempo de liberdade negociado do seu amanhã.&rdquo;</em>
            </p>
          </div>

          {/* Ficha do Titular da Conta */}
          <div className="col-12 col-lg-5">
            <div className="ledger-card-flat p-3" style={{ backgroundColor: 'var(--bg-receipt)' }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="text-uppercase font-mono-num small" style={{ color: 'var(--ink-faint)' }}>
                    TITULAR DO LIVRO-CAIXA
                  </span>
                  <h2 className="h5 font-editorial fw-bold mb-1">
                    {carregando ? 'Carregando titular...' : usuario?.nome || 'Visitante'}
                  </h2>
                  <div className="small font-mono-num" style={{ color: 'var(--ink-secondary)' }}>
                    {usuario?.email} • Ciclo dia {usuario?.diaFechamento || 5}
                  </div>
                </div>
                <div className="text-end">
                  <span className="stamp-badge-amber d-inline-block mb-1">
                    PERFIL {usuario?.perfilInvestidor || 'MODERADO'}
                  </span>
                  <div className="font-mono-num fw-bold" style={{ color: 'var(--green-dollar)' }}>
                    Renda Base: {formatBRL(usuario?.renda)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Expansível de Autenticação (Login com Senha BCrypt, Cadastro de Novo Titular ou Troca por UUID) */}
        {mostrarPainelConta && (
          <div className="ledger-card p-3 mt-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: 'var(--border-hairline)' }}>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  className={`btn btn-sm ${abaConta === 'login' ? 'btn-ink' : 'btn-outline-ink'}`}
                  onClick={() => setAbaConta('login')}
                >
                  <i className="bi bi-shield-lock me-1"></i>
                  1. Entrar com E-mail e Senha
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${abaConta === 'cadastro' ? 'btn-ink' : 'btn-outline-ink'}`}
                  onClick={() => setAbaConta('cadastro')}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  2. Cadastrar Novo Titular
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${abaConta === 'uuid' ? 'btn-ink' : 'btn-outline-ink'}`}
                  onClick={() => setAbaConta('uuid')}
                >
                  <i className="bi bi-key me-1"></i>
                  3. Inspecionar por UUID (Oracle)
                </button>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-ink py-0 px-2"
                onClick={() => setMostrarPainelConta(false)}
              >
                Fechar
              </button>
            </div>

            {abaConta === 'login' && (
              <form onSubmit={handleLoginSubmit} className="row g-2 align-items-end">
                <div className="col-12 col-md-5">
                  <label className="form-label small font-mono-num text-uppercase mb-1">
                    E-mail do Titular
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm input-ledger"
                    placeholder="Ex: joao@opportunity.com.br"
                    required
                    value={credenciais.email}
                    onChange={(e) => setCredenciais({ ...credenciais, email: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small font-mono-num text-uppercase mb-1">
                    Senha (Protegida com BCrypt)
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm input-ledger"
                    placeholder="Digite sua senha"
                    required
                    value={credenciais.senha}
                    onChange={(e) => setCredenciais({ ...credenciais, senha: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-3 d-grid">
                  <button type="submit" className="btn btn-sm btn-ink">
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Autenticar no Oracle
                  </button>
                </div>
              </form>
            )}

            {abaConta === 'cadastro' && (
              <form onSubmit={handleCriar} className="row g-2 align-items-end">
                <div className="col-12 col-sm-3">
                  <label className="form-label small font-mono-num text-uppercase mb-1">Nome Completo</label>
                  <input
                    type="text"
                    className="form-control form-control-sm input-ledger"
                    placeholder="Nome completo"
                    required
                    value={novoUsuario.nome}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  />
                </div>
                <div className="col-12 col-sm-3">
                  <label className="form-label small font-mono-num text-uppercase mb-1">E-mail</label>
                  <input
                    type="email"
                    className="form-control form-control-sm input-ledger"
                    placeholder="E-mail"
                    required
                    value={novoUsuario.email}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                  />
                </div>
                <div className="col-12 col-sm-2">
                  <label className="form-label small font-mono-num text-uppercase mb-1">Senha</label>
                  <input
                    type="password"
                    className="form-control form-control-sm input-ledger"
                    placeholder="Sua senha"
                    required
                    value={novoUsuario.senhaHash}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, senhaHash: e.target.value })}
                  />
                </div>
                <div className="col-6 col-sm-2">
                  <label className="form-label small font-mono-num text-uppercase mb-1">Renda (R$)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm input-ledger font-mono-num"
                    placeholder="Renda R$"
                    required
                    value={novoUsuario.renda}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, renda: e.target.value })}
                  />
                </div>
                <div className="col-6 col-sm-2">
                  <label className="form-label small font-mono-num text-uppercase mb-1">Perfil</label>
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
                <div className="col-12 text-end mt-2">
                  <button type="submit" className="btn btn-sm btn-ink">
                    <i className="bi bi-person-check me-1"></i>
                    Criar Conta com BCrypt & Entrar
                  </button>
                </div>
              </form>
            )}

            {abaConta === 'uuid' && (
              <div>
                <p className="small mb-2" style={{ color: 'var(--ink-secondary)' }}>
                  Cole o UUID de qualquer titular salvo na tabela <code>TB_FIN_USUARIO</code> para inspeção direta:
                </p>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control input-ledger font-mono-num"
                    placeholder="Ex: da354833-b0ea-425a-b2aa-c9127c31d002"
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                  />
                  <button
                    className="btn btn-ink"
                    type="button"
                    onClick={() => {
                      if (idInput.trim()) {
                        onTrocarUsuario(idInput.trim());
                        setMostrarPainelConta(false);
                      }
                    }}
                  >
                    Carregar UUID
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
