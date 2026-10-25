import { useState } from 'react';
import { formatBRL } from '../services/api';

export default function HeaderJornal({
  usuario,
  online,
  onTrocarUsuario,
  onCriarNovoUsuario,
  carregando,
}) {
  const [mostrarPainelConta, setMostrarPainelConta] = useState(false);
  const [idInput, setIdInput] = useState('');
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senhaHash: '123456',
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

  const handleCriar = async (e) => {
    e.preventDefault();
    await onCriarNovoUsuario({
      ...novoUsuario,
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

        <div className="d-flex align-items-center gap-2">
          <span className={online ? 'stamp-badge-success' : 'stamp-badge-danger'}>
            <i className={`bi ${online ? 'bi-database-check' : 'bi-exclamation-triangle'} me-1`}></i>
            {online ? 'ORACLE FIAP CONECTADO' : 'MODO DEMONSTRAÇÃO'}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-ink py-0 px-2"
            onClick={() => setMostrarPainelConta(!mostrarPainelConta)}
          >
            <i className="bi bi-person-badge me-1"></i>
            Trocar / Novo Titular
          </button>
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

        {/* Painel Expansível para Trocar UUID ou Cadastrar Novo Usuário no Oracle */}
        {mostrarPainelConta && (
          <div className="ledger-card p-3 mt-3">
            <div className="row g-3">
              <div className="col-12 col-md-5 border-end">
                <h6 className="font-editorial fw-bold mb-2">
                  <i className="bi bi-key me-1"></i> Carregar Titular por UUID (Oracle)
                </h6>
                <p className="small mb-2" style={{ color: 'var(--ink-secondary)' }}>
                  Cole o ID de qualquer usuário salvo na tabela <code>TB_FIN_USUARIO</code>:
                </p>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control input-ledger font-mono-num"
                    placeholder="Ex: da354833-b0ea-425a-..."
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
                    Carregar
                  </button>
                </div>
              </div>

              <div className="col-12 col-md-7">
                <h6 className="font-editorial fw-bold mb-2">
                  <i className="bi bi-person-plus me-1"></i> Cadastrar Novo Titular no Oracle
                </h6>
                <form onSubmit={handleCriar} className="row g-2">
                  <div className="col-12 col-sm-4">
                    <input
                      type="text"
                      className="form-control form-control-sm input-ledger"
                      placeholder="Nome completo"
                      required
                      value={novoUsuario.nome}
                      onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-sm-4">
                    <input
                      type="email"
                      className="form-control form-control-sm input-ledger"
                      placeholder="E-mail"
                      required
                      value={novoUsuario.email}
                      onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                    />
                  </div>
                  <div className="col-6 col-sm-2">
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
                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-sm btn-ink">
                      Criar e Selecionar Titular
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
