import { formatBRL } from '../services/api';

export default function BannerOrcamentoReverso({
  rendaMensalTotal,
  totalAportesMetas,
  totalCustosFixosEDividas,
  totalGastosLivresMes,
  metaPrincipal,
}) {
  // Fórmula do Orçamento Reverso (Pay Yourself First - RF-05):
  // Livre para Gastar = Renda - Metas - Custos Fixos
  const tetoGastoSemCulpa = Math.max(
    0,
    rendaMensalTotal - totalAportesMetas - totalCustosFixosEDividas
  );
  const saldoLivreRestante = tetoGastoSemCulpa - totalGastosLivresMes;

  const aporteDiarioMeta = metaPrincipal?.aporteMensal
    ? Number(metaPrincipal.aporteMensal) / 30
    : 50;

  return (
    <section className="mb-4">
      {/* Faixa de Título idêntica ao Conceito 3 */}
      <div className="concept3-title-banner">
        <h2 className="font-editorial fw-bold text-uppercase mb-0" style={{ fontSize: 'clamp(1.35rem, 2.5vw, 2rem)', letterSpacing: '0.02em' }}>
          EQUAÇÃO DO ORÇAMENTO REVERSO
        </h2>
      </div>

      {/* Os 4 Blocos da Equação separados por operadores matemáticos (Grid 2x2 compacto no Mobile e Linha contínua no Desktop) */}
      <div className="row g-2 align-items-center justify-content-between">
        {/* Bloco 1: RENDA */}
        <div className="col-6 col-md">
          <div className="concept3-eq-box h-100">
            <div className="concept3-eq-strip-green"></div>
            <div className="py-1 px-1 font-editorial fw-bold small text-uppercase text-truncate" style={{ borderBottom: '1.5px solid var(--ink-primary)' }}>
              RENDA
            </div>
            <div className="py-2 py-md-3 font-mono-num fw-bold" style={{ fontSize: 'clamp(1.05rem, 2vw, 1.75rem)' }}>
              {formatBRL(rendaMensalTotal)}
            </div>
            <div className="concept3-eq-strip-green-bottom"></div>
          </div>
        </div>

        {/* Operador - (Visível em telas médias/grandes) */}
        <div className="d-none d-md-block col-md-auto text-center py-1">
          <span className="concept3-eq-operator">−</span>
        </div>

        {/* Bloco 2: METAS */}
        <div className="col-6 col-md">
          <div className="concept3-eq-box h-100">
            <div className="concept3-eq-strip-green"></div>
            <div className="py-1 px-1 font-editorial fw-bold small text-uppercase text-truncate" style={{ borderBottom: '1.5px solid var(--ink-primary)' }}>
              <span className="d-inline d-md-none me-1">−</span>
              METAS ({metaPrincipal?.meta || 'RESERVA'})
            </div>
            <div className="py-2 py-md-3 font-mono-num fw-bold" style={{ fontSize: 'clamp(1.05rem, 2vw, 1.75rem)' }}>
              {formatBRL(totalAportesMetas)}
            </div>
            <div className="concept3-eq-strip-green-bottom"></div>
          </div>
        </div>

        {/* Operador - (Visível em telas médias/grandes) */}
        <div className="d-none d-md-block col-md-auto text-center py-1">
          <span className="concept3-eq-operator">−</span>
        </div>

        {/* Bloco 3: CUSTOS FIXOS */}
        <div className="col-6 col-md">
          <div className="concept3-eq-box h-100">
            <div className="concept3-eq-strip-red"></div>
            <div className="py-1 px-1 font-editorial fw-bold small text-uppercase text-truncate" style={{ borderBottom: '1.5px solid var(--ink-primary)' }}>
              <span className="d-inline d-md-none me-1">−</span>
              CUSTOS FIXOS
            </div>
            <div className="py-2 py-md-3 font-mono-num fw-bold" style={{ fontSize: 'clamp(1.05rem, 2vw, 1.75rem)' }}>
              {formatBRL(totalCustosFixosEDividas)}
            </div>
            <div className="concept3-eq-strip-red-bottom"></div>
          </div>
        </div>

        {/* Operador = (Visível em telas médias/grandes) */}
        <div className="d-none d-md-block col-md-auto text-center py-1">
          <span className="concept3-eq-operator">=</span>
        </div>

        {/* Bloco 4: LIVRE PARA GASTAR */}
        <div className="col-6 col-md">
          <div className="concept3-eq-box h-100">
            <div className="concept3-eq-header-solid-green small text-truncate">
              <span className="d-inline d-md-none me-1">=</span>
              LIVRE PARA GASTAR
            </div>
            <div
              className="py-2 py-md-3 font-mono-num fw-bold"
              style={{
                fontSize: 'clamp(1.1rem, 2.1vw, 1.85rem)',
                color: saldoLivreRestante >= 0 ? 'var(--ink-primary)' : 'var(--red-stamp)',
              }}
            >
              {formatBRL(saldoLivreRestante)}
            </div>
            <div className="concept3-eq-strip-green-bottom"></div>
          </div>
        </div>
      </div>

      {/* Sub-barra de contexto do Câmbio do Tempo */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 px-1 small font-mono-num" style={{ color: 'var(--ink-secondary)' }}>
        <span>
          <i className="bi bi-layers-half me-1"></i>
          Papel da Frente Ativo (#1): <strong>{metaPrincipal?.meta || 'Nenhum'}</strong> (Câmbio: <strong>{formatBRL(aporteDiarioMeta)} = 1 Dia de Vida</strong>)
        </span>
        <span>
          Gastos Livres no mês: <strong>{formatBRL(totalGastosLivresMes)}</strong> de {formatBRL(tetoGastoSemCulpa)}
        </span>
      </div>
    </section>
  );
}
