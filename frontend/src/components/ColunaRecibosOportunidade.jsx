import { useState, useEffect } from 'react';
import { formatBRL, formatDataBR } from '../services/api';

export default function ColunaRecibosOportunidade({
  logsOportunidade,
  metas = [],
  metaPrincipal,
  onRegistrarTransacao,
  onExcluirCustoOportunidade,
  salvando,
}) {
  const hojeISO = new Date().toISOString().split('T')[0];

  const [formTransacao, setFormTransacao] = useState({
    descricao: '',
    valorTransacao: '',
    tipoTransacao: 'GASTO_LIVRE',
    categoria: 'LAZER',
    dataTransacao: hojeISO,
  });

  // Simulador de Micro-hábitos (RF-07)
  const [valorHabitoDiario, setValorHabitoDiario] = useState(25);
  const [focoId, setFocoId] = useState(null);
  const [dragLog, setDragLog] = useState(null);
  const [hoveredLogId, setHoveredLogId] = useState(null);
  const [promotedLog, setPromotedLog] = useState(null);
  const [larguraTela, setLarguraTela] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 1200)
  );

  useEffect(() => {
    const handleResize = () => setLarguraTela(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Estados da Telinha de Visão dos Recibos Criados + Filtros de Organização
  const [modalRecibosAberto, setModalRecibosAberto] = useState(false);
  const [reciboDestacadoModalId, setReciboDestacadoModalId] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [filtroMetaId, setFiltroMetaId] = useState('TODAS');
  const [ordenacaoRecibos, setOrdenacaoRecibos] = useState('RECENTES');
  const [buscaRecibo, setBuscaRecibo] = useState('');

  // Aplica filtros e ordenação nos recibos de Custo de Oportunidade
  const logsFiltradosEOrdenados = logsOportunidade
    .filter((log) => {
      const cat = log.transacao?.categoria || 'LAZER';
      if (filtroCategoria !== 'TODAS' && cat !== filtroCategoria) return false;
      if (
        filtroMetaId !== 'TODAS' &&
        String(log.metaImpactada?.id) !== String(filtroMetaId)
      ) {
        return false;
      }
      if (buscaRecibo.trim() !== '') {
        const termo = buscaRecibo.trim().toLowerCase();
        const desc = (log.transacao?.descricao || '').toLowerCase();
        const metaNome = (log.metaImpactada?.meta || '').toLowerCase();
        if (!desc.includes(termo) && !metaNome.includes(termo)) return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => {
      const valA = Number(a.transacao?.valorTransacao || 0);
      const valB = Number(b.transacao?.valorTransacao || 0);
      const diasA = Number(a.diasAtraso || 0);
      const diasB = Number(b.diasAtraso || 0);

      if (ordenacaoRecibos === 'MAIOR_VALOR') return valB - valA;
      if (ordenacaoRecibos === 'MENOR_VALOR') return valA - valB;
      if (ordenacaoRecibos === 'MAIOR_ATRASO') return diasB - diasA;
      // RECENTES (mantém a ordem mais recente primeiro)
      return 0;
    });

  const abrirVisaoRecibo = (logId = null) => {
    setReciboDestacadoModalId(logId);
    setModalRecibosAberto(true);
  };

  const acionarFocoRecibo = (id, fromX = -60, fromRot = -5, viaClick = false) => {
    if (viaClick) {
      setPromotedLog({ id, fromX, fromRot });
      setTimeout(() => {
        setPromotedLog((atual) => (atual?.id === id ? null : atual));
      }, 500);
    }
    setFocoId(id);
  };

  // Pré-cálculo instantâneo em tela enquanto o usuário digita (antes mesmo de enviar ao Oracle!)
  const valorDigitado = Number(formTransacao.valorTransacao || 0);
  const aporteDiario =
    metaPrincipal?.aporteMensal && Number(metaPrincipal.aporteMensal) > 0
      ? Number(metaPrincipal.aporteMensal) / 30
      : 50;

  const diasAtrasoPrevisto =
    valorDigitado > 0 ? Math.ceil(valorDigitado / aporteDiario) : 0;

  const taxaAnual = Number(metaPrincipal?.taxaRendimentoAnual || 12);
  const taxaMensal = taxaAnual / 100 / 12;

  // Calcula meses até a dataAlvo da meta principal (mínimo 12 se não houver meta)
  const calcularMesesAteMeta = () => {
    if (!metaPrincipal?.dataAlvo) return 24;
    const hoje = new Date();
    const alvo = new Date(metaPrincipal.dataAlvo);
    const diffMeses =
      (alvo.getFullYear() - hoje.getFullYear()) * 12 +
      (alvo.getMonth() - hoje.getMonth());
    return Math.max(1, diffMeses);
  };

  const mesesAteAlvo = calcularMesesAteMeta();
  const valorFuturoPrevisto =
    valorDigitado > 0
      ? valorDigitado * Math.pow(1 + taxaMensal, mesesAteAlvo)
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTransacao.descricao || !formTransacao.valorTransacao) return;

    await onRegistrarTransacao({
      ...formTransacao,
      valorTransacao: Number(formTransacao.valorTransacao),
    });

    setFormTransacao({
      ...formTransacao,
      descricao: '',
      valorTransacao: '',
    });
  };

  // Cálculo de Micro-hábitos (aportes mensais compostos em 1, 5 e 10 anos)
  const gastoMensalHabito = valorHabitoDiario * 30;
  const projetarAnos = (anos) => {
    const meses = anos * 12;
    const i = taxaMensal > 0 ? taxaMensal : 0.01;
    // Fórmula de série uniforme de pagamentos: FV = PMT * (((1 + i)^n - 1) / i)
    return gastoMensalHabito * ((Math.pow(1 + i, meses) - 1) / i);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Máquina Registradora de Transações + Prévia de Custo de Oportunidade */}
      <div className="ledger-card p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 divider-dashed">
          <h3 className="h5 font-editorial fw-bold mb-0">
            <i className="bi bi-receipt-cutoff me-2"></i>
            Registrar Movimentação
          </h3>
          <span className="stamp-badge-danger">MOTOR JAVA ATIVO</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Descrição do Lançamento</label>
            <input
              type="text"
              className="form-control input-ledger"
              placeholder="Ex: Jantar de sexta, Uber, Salário..."
              required
              value={formTransacao.descricao}
              onChange={(e) =>
                setFormTransacao({ ...formTransacao, descricao: e.target.value })
              }
            />
          </div>

          <div className="row g-2 mb-2">
            <div className="col-6">
              <label className="form-label small fw-bold mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control input-ledger font-mono-num fw-bold"
                placeholder="150.00"
                required
                value={formTransacao.valorTransacao}
                onChange={(e) =>
                  setFormTransacao({
                    ...formTransacao,
                    valorTransacao: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-6">
              <label className="form-label small fw-bold mb-1">Natureza (Enum)</label>
              <select
                className="form-select input-ledger fw-semibold"
                value={formTransacao.tipoTransacao}
                onChange={(e) =>
                  setFormTransacao({
                    ...formTransacao,
                    tipoTransacao: e.target.value,
                  })
                }
              >
                <option value="GASTO_LIVRE">Gasto Livre (Impulso/Lazer)</option>
                <option value="CUSTO_FIXO">Custo Fixo Essencial</option>
                <option value="APORTE_META">Aporte na Meta</option>
                <option value="RECEITA">Receita / Renda Extra</option>
              </select>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label small fw-bold mb-1">Categoria</label>
              <select
                className="form-select form-select-sm input-ledger"
                value={formTransacao.categoria}
                onChange={(e) =>
                  setFormTransacao({ ...formTransacao, categoria: e.target.value })
                }
              >
                <option value="LAZER">Lazer & Gastronomia</option>
                <option value="DELIVERY">Delivery / iFood</option>
                <option value="COMPRAS">Compras & Vestuário</option>
                <option value="ASSINATURAS">Assinaturas & Streaming</option>
                <option value="MORADIA">Moradia & Contas</option>
                <option value="SALARIO">Salário / Freelance</option>
                <option value="INVESTIMENTO">Aporte Patrimonial</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small fw-bold mb-1">Data</label>
              <input
                type="date"
                className="form-control form-control-sm input-ledger font-mono-num"
                value={formTransacao.dataTransacao}
                onChange={(e) =>
                  setFormTransacao({
                    ...formTransacao,
                    dataTransacao: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Alerta Instantâneo de Pré-Voo (Quando é GASTO_LIVRE e o usuário digita um valor) */}
          {formTransacao.tipoTransacao === 'GASTO_LIVRE' && valorDigitado > 0 && (
            <div
              className="p-3 mb-3 ledger-card-flat"
              style={{ backgroundColor: 'var(--red-soft)', borderColor: 'var(--red-stamp)' }}
            >
              <div className="small fw-bold text-uppercase font-mono-num mb-1" style={{ color: 'var(--red-stamp)' }}>
                <i className="bi bi-lightning-charge-fill me-1"></i>
                Simulação Antes do Gasto ({metaPrincipal?.meta || 'Meta Principal'}):
              </div>
              <div className="d-flex justify-content-between align-items-center font-mono-num">
                <span>
                  Atraso imediato: <strong>+{diasAtrasoPrevisto} dia(s)</strong>
                </span>
                <span>
                  Custo em {mesesAteAlvo}m: <strong>{formatBRL(valorFuturoPrevisto)}</strong>
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-ink w-100 py-2"
            disabled={salvando}
          >
            <i className="bi bi-printer me-2"></i>
            {salvando
              ? 'Calculando e Gravando no Oracle...'
              : 'Lançar no Livro-Caixa & Emitir Recibo'}
          </button>
        </form>
      </div>

      {/* 2. Galeria de Recibos Físicos de Custo de Oportunidade (Vindos do Oracle!) */}
      <div className="ledger-card p-3 p-md-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-2 divider-dashed">
          <div>
            <h3 className="h5 font-editorial fw-bold mb-0">
              Recibos de Custo de Oportunidade
            </h3>
            <small style={{ color: 'var(--ink-secondary)' }}>
              Histórico oficial gravado em <code>TB_FIN_LOG_OPORTUNIDADE</code>
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-ink py-1 px-2 d-flex align-items-center gap-1"
              onClick={() => abrirVisaoRecibo(null)}
              title="Abrir telinha de visão geral, filtros e exclusão de recibos"
            >
              <i className="bi bi-plus-lg"></i>
              <span>Visão dos Recibos ({logsOportunidade.length})</span>
            </button>
          </div>
        </div>

        {/* Barra Rápida de Filtros e Organização diretamente nos Recibos de Custo de Oportunidade */}
        {logsOportunidade.length > 0 && (
          <div
            className="p-2 mb-3 ledger-card-flat"
            style={{ backgroundColor: 'var(--bg-muted)' }}
          >
            <div className="row g-2 align-items-center">
              <div className="col-6 col-sm-4">
                <label className="form-label font-mono-num mb-0" style={{ fontSize: '0.68rem', color: 'var(--ink-secondary)' }}>
                  <i className="bi bi-funnel me-1"></i>Categoria
                </label>
                <select
                  className="form-select form-select-sm input-ledger font-mono-num"
                  style={{ fontSize: '0.74rem' }}
                  value={filtroCategoria}
                  onChange={(e) => {
                    setFiltroCategoria(e.target.value);
                    setFocoId(null);
                  }}
                >
                  <option value="TODAS">Todas ({logsOportunidade.length})</option>
                  <option value="LAZER">Lazer & Gastronomia</option>
                  <option value="DELIVERY">Delivery / iFood</option>
                  <option value="COMPRAS">Compras & Vestuário</option>
                  <option value="ASSINATURAS">Assinaturas & Streaming</option>
                  <option value="MORADIA">Moradia & Contas</option>
                </select>
              </div>
              <div className="col-6 col-sm-4">
                <label className="form-label font-mono-num mb-0" style={{ fontSize: '0.68rem', color: 'var(--ink-secondary)' }}>
                  <i className="bi bi-sort-down me-1"></i>Organizar por
                </label>
                <select
                  className="form-select form-select-sm input-ledger font-mono-num"
                  style={{ fontSize: '0.74rem' }}
                  value={ordenacaoRecibos}
                  onChange={(e) => {
                    setOrdenacaoRecibos(e.target.value);
                    setFocoId(null);
                  }}
                >
                  <option value="RECENTES">Mais Recentes</option>
                  <option value="MAIOR_VALOR">Maior Valor (R$)</option>
                  <option value="MENOR_VALOR">Menor Valor (R$)</option>
                  <option value="MAIOR_ATRASO">Maior Atraso (Dias)</option>
                </select>
              </div>
              <div className="col-12 col-sm-4">
                <label className="form-label font-mono-num mb-0" style={{ fontSize: '0.68rem', color: 'var(--ink-secondary)' }}>
                  <i className="bi bi-search me-1"></i>Buscar Recibo
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm input-ledger font-mono-num"
                  style={{ fontSize: '0.74rem' }}
                  placeholder="Ex: Jantar, Uber..."
                  value={buscaRecibo}
                  onChange={(e) => {
                    setBuscaRecibo(e.target.value);
                    setFocoId(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {logsOportunidade.length === 0 ? (
          <div className="text-center py-4" style={{ color: 'var(--ink-secondary)' }}>
            <i className="bi bi-award display-6 d-block mb-2" style={{ color: 'var(--green-dollar)' }}></i>
            <p className="mb-0 fw-semibold">Nenhum Gasto Livre registrado ainda!</p>
            <small>Lance um gasto de lazer acima para ver o motor imprimir o impacto real.</small>
          </div>
        ) : logsFiltradosEOrdenados.length === 0 ? (
          <div className="text-center py-4 ledger-card-flat">
            <p className="mb-2 fw-bold">Nenhum recibo corresponde aos filtros selecionados.</p>
            <button
              type="button"
              className="btn btn-sm btn-outline-ink"
              onClick={() => {
                setFiltroCategoria('TODAS');
                setFiltroMetaId('TODAS');
                setOrdenacaoRecibos('RECENTES');
                setBuscaRecibo('');
              }}
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div>
            {/* Palco de Recibos Verticais Sobrepostos (Fiel ao Conceito 3 + Card-Game Drag Responsivo) */}
            <div
              className={`concept3-stage ${
                dragLog && Math.hypot(dragLog.dx, dragLog.dy) > 10
                  ? 'is-dragging-active'
                  : ''
              }`}
            >
              {(() => {
                const fatorMobile =
                  larguraTela < 400 ? 0.44 : larguraTela < 576 ? 0.54 : larguraTela < 768 ? 0.78 : 1;
                const idAtivo =
                  focoId && logsFiltradosEOrdenados.some((l) => l.id === focoId)
                    ? focoId
                    : logsFiltradosEOrdenados[0]?.id;
                const frente =
                  logsFiltradosEOrdenados.find((l) => l.id === idAtivo) ||
                  logsFiltradosEOrdenados[0];
                const outros = logsFiltradosEOrdenados
                  .filter((l) => l.id !== frente.id)
                  .slice(0, 3);
                const visiveisOrdenados = [frente, ...outros];
                const total = visiveisOrdenados.length;

                // Mantém ordem estável no DOM para animar suavemente a troca de sobreposição
                const domEstavel = [...visiveisOrdenados].sort((a, b) =>
                  String(a.id).localeCompare(String(b.id))
                );

                const calcularSlotLog = (rankIdx) => {
                  if (total === 1) {
                    return { x: 0, y: 8, rot: 0, scale: 1.02, posClass: 'is-front' };
                  }
                  if (total === 2) {
                    if (rankIdx === 0) {
                      return { x: Math.round(36 * fatorMobile), y: 14, rot: 1.5, scale: 1.02, posClass: 'is-front' };
                    }
                    return { x: Math.round(-48 * fatorMobile), y: -12, rot: -5.5, scale: 0.94, posClass: 'is-back-left' };
                  }
                  if (rankIdx === 0) {
                    return { x: 0, y: 14, rot: 0, scale: 1.02, posClass: 'is-front' };
                  }
                  if (rankIdx === 1) {
                    return { x: Math.round(-86 * fatorMobile), y: -12, rot: -6, scale: 0.93, posClass: 'is-back-left' };
                  }
                  if (rankIdx === 2) {
                    return { x: Math.round(86 * fatorMobile), y: -8, rot: 6, scale: 0.93, posClass: 'is-back-right' };
                  }
                  return { x: Math.round(112 * fatorMobile), y: -16, rot: 9, scale: 0.88, posClass: 'is-back-extra' };
                };

                const iconesRecibo = ['bi-clock', 'bi-flower1', 'bi-cash-coin'];

                return domEstavel.map((log, idx) => {
                  const rankIdx = visiveisOrdenados.findIndex((item) => item.id === log.id);
                  const isFront = rankIdx === 0;
                  const slot = calcularSlotLog(rankIdx);

                  const isThisDragging = dragLog?.id === log.id;
                  const isFrontYielding =
                    isFront &&
                    dragLog &&
                    Math.hypot(dragLog.dx, dragLog.dy) > 15 &&
                    !dragLog.isFront;
                  const isHovered = hoveredLogId === log.id && !dragLog;
                  const isPromotingArc = promotedLog?.id === log.id && isFront;

                  let tx = slot.x;
                  let ty = slot.y;
                  let rot = slot.rot;
                  let sc = slot.scale;

                  if (isThisDragging) {
                    tx = slot.x + dragLog.dx;
                    ty = slot.y + dragLog.dy - 10;
                    rot = Math.max(-18, Math.min(18, slot.rot + dragLog.dx * 0.08));
                    sc = 1.07;
                  } else if (isFrontYielding) {
                    tx = -32;
                    ty = -10;
                    rot = -4;
                    sc = 0.94;
                  } else if (isHovered && !isFront) {
                    ty = slot.y - 12;
                    sc = slot.scale + 0.03;
                  }

                  const icone = iconesRecibo[idx % iconesRecibo.length];
                  const corFundo = isFront ? '#F6F0E2' : '#EFE7D6';

                  return (
                    <div
                      key={log.id || idx}
                      className={`concept3-vertical-receipt ${slot.posClass} ${
                        isThisDragging ? 'is-dragging' : ''
                      } ${isFrontYielding ? 'is-yielding' : ''} ${
                        isPromotingArc ? 'is-promoting' : ''
                      }`}
                      style={{
                        transform: `translate3d(${tx}px, ${ty}px, 0px) rotate(${rot}deg) scale(${sc})`,
                        '--card-from-x': `${promotedLog?.fromX ?? -50}px`,
                        '--card-from-rot': `${promotedLog?.fromRot ?? -6}deg`,
                        '--card-rest-x': `${slot.x}px`,
                        '--card-rest-y': `${slot.y}px`,
                        '--card-rest-rot': `${slot.rot}deg`,
                      }}
                      onMouseEnter={() => setHoveredLogId(log.id)}
                      onMouseLeave={() =>
                        setHoveredLogId((atualId) => (atualId === log.id ? null : atualId))
                      }
                      onPointerDown={(e) => {
                        if (e.target.closest('button, input, select, a')) return;
                        if (e.button !== 0 && e.pointerType === 'mouse') return;
                        e.currentTarget.setPointerCapture(e.pointerId);
                        setDragLog({
                          id: log.id,
                          startX: e.clientX,
                          startY: e.clientY,
                          dx: 0,
                          dy: 0,
                          isFront,
                          fromX: slot.x,
                          fromRot: slot.rot,
                        });
                      }}
                      onPointerMove={(e) => {
                        if (!dragLog || dragLog.id !== log.id) return;
                        const dx = e.clientX - dragLog.startX;
                        const dy = e.clientY - dragLog.startY;
                        setDragLog((prev) => (prev ? { ...prev, dx, dy } : null));
                      }}
                      onPointerUp={(e) => {
                        if (!dragLog || dragLog.id !== log.id) return;
                        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        }
                        const dist = Math.hypot(dragLog.dx, dragLog.dy);
                        const fromX = dragLog.fromX;
                        const fromRot = dragLog.fromRot;
                        const eraFrente = dragLog.isFront;
                        setDragLog(null);

                        if (!eraFrente) {
                          if (dist >= 25) {
                            acionarFocoRecibo(log.id, fromX, fromRot, false);
                          } else if (dist < 8) {
                            acionarFocoRecibo(log.id, fromX, fromRot, true);
                          }
                        } else if (eraFrente && dist >= 50 && visiveisOrdenados.length > 1) {
                          acionarFocoRecibo(visiveisOrdenados[1].id, -48, -5.5, true);
                        }
                      }}
                      onPointerCancel={() => setDragLog(null)}
                    >
                      <div className="concept3-receipt-paper">
                        {/* Botão de Exclusão Rápida (Canto Superior Esquerdo) em caso de lançamento errado */}
                        {onExcluirCustoOportunidade && (
                          <button
                            type="button"
                            className="concept3-receipt-del-btn"
                            title="Excluir este recibo imediatamente (estornar lançamento errado)"
                            disabled={salvando}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (focoId === log.id) {
                                setFocoId(null);
                              }
                              await onExcluirCustoOportunidade(
                                log.id,
                                log.transacao?.descricao || 'Despesa'
                              );
                            }}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}

                        {/* Botão "+" em TODOS os recibos (Canto Superior Direito) para abrir a Telinha de Visão */}
                        <button
                          type="button"
                          className="concept3-receipt-plus-btn"
                          title="Ver detalhes e abrir visão dos recibos (+)"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirVisaoRecibo(log.id);
                          }}
                        >
                          +
                        </button>

                        {/* Barra Superior Colorida (Verde na frente, Terracota atrás - idêntico ao Conceito 3) */}
                        <div
                          className={
                            isFront
                              ? 'concept3-receipt-topbar-green'
                              : 'concept3-receipt-topbar-red'
                          }
                        ></div>

                        <div className="concept3-receipt-body">
                          {/* Título Centralizado com Altura Padronizada */}
                          <h4 className="font-editorial fw-bold concept3-receipt-title px-4">
                            {log.transacao?.descricao || 'Despesa Livre'}
                          </h4>

                          <div className="concept3-receipt-divider"></div>

                          {/* Valor Grande Centralizado */}
                          <div
                            className="font-mono-num fw-bold text-center"
                            style={{ fontSize: '1.35rem', lineHeight: 1.15 }}
                          >
                            {formatBRL(log.transacao?.valorTransacao)}
                          </div>

                          <div className="concept3-receipt-divider"></div>

                          {/* Tradução em Horas / Dias de Vida */}
                          <div className="font-mono-num small" style={{ fontSize: '0.76rem', lineHeight: 1.25 }}>
                            <div style={{ color: 'var(--ink-secondary)' }}>Tradução em Horas:</div>
                            <div className="fw-bold" style={{ color: 'var(--red-stamp)' }}>
                              {log.diasAtraso} {log.diasAtraso === 1 ? 'Dia de Vida' : 'Dias de Vida'}
                            </div>
                          </div>

                          {/* Crescimento Composto */}
                          <div className="font-mono-num small" style={{ fontSize: '0.76rem', lineHeight: 1.25 }}>
                            <div style={{ color: 'var(--ink-secondary)' }}>Crescimento Composto:</div>
                            <div className="fw-bold">
                              {formatBRL(log.valorFuturoPerdido)} no futuro
                            </div>
                          </div>

                          <div className="concept3-receipt-divider"></div>

                          {/* Ícone Editorial Centralizado */}
                          <div className="text-center d-flex align-items-center justify-content-center gap-2">
                            <i className={`bi ${icone} fs-5`} style={{ color: 'var(--ink-primary)' }}></i>
                            <span className="font-mono-num" style={{ fontSize: '0.65rem', color: 'var(--ink-faint)' }}>
                              Meta: {log.metaImpactada?.meta || 'Reserva'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Serrilhado Zig-Zag Sem Sombra Dupla na Base */}
                      <svg
                        viewBox="0 0 230 14"
                        preserveAspectRatio="none"
                        className="concept3-sawtooth-footer"
                      >
                        <polygon
                          points="1,0 1,2 12,12 23,2 35,12 46,2 58,12 69,2 81,12 92,2 104,12 115,2 127,12 138,2 150,12 161,2 173,12 184,2 196,12 207,2 219,12 229,2 229,0"
                          fill={corFundo}
                        />
                        <polyline
                          points="1,0 1,2 12,12 23,2 35,12 46,2 58,12 69,2 81,12 92,2 104,12 115,2 127,12 138,2 150,12 161,2 173,12 184,2 196,12 207,2 219,12 229,2 229,0"
                          fill="none"
                          stroke="#1C1A17"
                          strokeWidth="2"
                          strokeLinejoin="miter"
                        />
                      </svg>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="text-center font-mono-num small mt-1" style={{ color: 'var(--ink-secondary)', fontSize: '0.73rem' }}>
              <i className="bi bi-hand-index-thumb me-1"></i>
              Clique em <strong>+</strong> em qualquer recibo para abrir a telinha de visão e filtros, ou na lixeira para estornar lançamento errado.
            </div>
          </div>
        )}
      </div>

      {/* TELINHA DE VISÃO DOS RECIBOS DE CUSTO DE OPORTUNIDADE (MODAL COM FILTROS E EXCLUSÃO) */}
      {modalRecibosAberto && (
        <div
          className="concept3-modal-backdrop"
          onClick={() => {
            setModalRecibosAberto(false);
          }}
        >
          <div
            className="concept3-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho da Telinha */}
            <div
              className="p-3 p-md-4 d-flex flex-wrap justify-content-between align-items-center gap-2"
              style={{
                borderBottom: '2px solid var(--ink-primary)',
                backgroundColor: 'var(--bg-muted)',
              }}
            >
              <div>
                <span className="stamp-badge-danger me-2">VISÃO DE RECIBOS & AUDITORIA</span>
                <h4 className="h4 font-editorial fw-bold d-inline align-middle mb-0">
                  Recibos de Custo de Oportunidade Emitidos
                </h4>
                <div className="small font-mono-num mt-1" style={{ color: 'var(--ink-secondary)' }}>
                  Organize seus recibos com os filtros abaixo ou exclua lançamentos registrados por engano para restaurar seu Saldo Livre.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-ink px-3"
                onClick={() => {
                  setModalRecibosAberto(false);
                }}
              >
                <i className="bi bi-x-lg me-1"></i> Fechar
              </button>
            </div>

            {/* Corpo da Telinha com Filtros e Grid de Recibos */}
            <div className="concept3-modal-body">
              {/* Painel Completo de Filtros e Organização */}
              <div
                className="p-3 mb-3 ledger-card-flat"
                style={{ backgroundColor: 'var(--bg-receipt)' }}
              >
                <div className="row g-2 align-items-end">
                  <div className="col-12 col-md-3">
                    <label className="form-label small fw-bold font-mono-num mb-1">
                      <i className="bi bi-search me-1"></i>Buscar por Descrição
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm input-ledger font-mono-num"
                      placeholder="Ex: Costelinha, Uber..."
                      value={buscaRecibo}
                      onChange={(e) => setBuscaRecibo(e.target.value)}
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label small fw-bold font-mono-num mb-1">
                      <i className="bi bi-tag me-1"></i>Filtrar Categoria
                    </label>
                    <select
                      className="form-select form-select-sm input-ledger font-mono-num"
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                      <option value="TODAS">Todas as Categorias</option>
                      <option value="LAZER">Lazer & Gastronomia</option>
                      <option value="DELIVERY">Delivery / iFood</option>
                      <option value="COMPRAS">Compras & Vestuário</option>
                      <option value="ASSINATURAS">Assinaturas & Streaming</option>
                      <option value="MORADIA">Moradia & Contas</option>
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label small fw-bold font-mono-num mb-1">
                      <i className="bi bi-bullseye me-1"></i>Meta Impactada
                    </label>
                    <select
                      className="form-select form-select-sm input-ledger font-mono-num"
                      value={filtroMetaId}
                      onChange={(e) => setFiltroMetaId(e.target.value)}
                    >
                      <option value="TODAS">Todas as Metas</option>
                      {metas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.meta}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label small fw-bold font-mono-num mb-1">
                      <i className="bi bi-sort-down me-1"></i>Ordenar Recibos
                    </label>
                    <select
                      className="form-select form-select-sm input-ledger font-mono-num"
                      value={ordenacaoRecibos}
                      onChange={(e) => setOrdenacaoRecibos(e.target.value)}
                    >
                      <option value="RECENTES">Mais Recentes Primeiro</option>
                      <option value="MAIOR_VALOR">Maior Valor Gasto (R$)</option>
                      <option value="MENOR_VALOR">Menor Valor Gasto (R$)</option>
                      <option value="MAIOR_ATRASO">Maior Impacto (Dias de Vida)</option>
                    </select>
                  </div>
                </div>

                {/* Resumo consolidado dos recibos filtrados */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-2 divider-dashed font-mono-num small">
                  <span>
                    Exibindo <strong>{logsFiltradosEOrdenados.length}</strong> de{' '}
                    <strong>{logsOportunidade.length}</strong> recibo(s)
                  </span>
                  <div className="d-flex flex-wrap gap-3">
                    <span>
                      Total Gasto:{' '}
                      <strong>
                        {formatBRL(
                          logsFiltradosEOrdenados.reduce(
                            (acc, l) => acc + Number(l.transacao?.valorTransacao || 0),
                            0
                          )
                        )}
                      </strong>
                    </span>
                    <span style={{ color: 'var(--red-stamp)' }}>
                      Atraso Somado:{' '}
                      <strong>
                        +
                        {logsFiltradosEOrdenados.reduce(
                          (acc, l) => acc + Number(l.diasAtraso || 0),
                          0
                        )}{' '}
                        dia(s)
                      </strong>
                    </span>
                    <span style={{ color: 'var(--green-dollar)' }}>
                      Custo Futuro:{' '}
                      <strong>
                        {formatBRL(
                          logsFiltradosEOrdenados.reduce(
                            (acc, l) => acc + Number(l.valorFuturoPerdido || 0),
                            0
                          )
                        )}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid com Todos os Recibos Criados */}
              {logsFiltradosEOrdenados.length === 0 ? (
                <div className="text-center py-5 ledger-card-flat">
                  <p className="fw-bold mb-2">Nenhum recibo encontrado para este filtro.</p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-ink"
                    onClick={() => {
                      setFiltroCategoria('TODAS');
                      setFiltroMetaId('TODAS');
                      setOrdenacaoRecibos('RECENTES');
                      setBuscaRecibo('');
                    }}
                  >
                    Restaurar Todos os Recibos
                  </button>
                </div>
              ) : (
                <div className="row g-3">
                  {logsFiltradosEOrdenados.map((log, idx) => {
                    const isDestacado = reciboDestacadoModalId === log.id;

                    return (
                      <div key={log.id || idx} className="col-12 col-sm-6 col-md-4">
                        <div
                          className="concept3-grid-receipt h-100 d-flex flex-column"
                          style={{
                            border: isDestacado
                              ? '2.5px solid var(--green-dollar)'
                              : '2px solid var(--ink-primary)',
                            backgroundColor: isDestacado ? '#FBF7EE' : 'var(--bg-receipt)',
                          }}
                        >
                          <div
                            className={
                              isDestacado
                                ? 'concept3-receipt-topbar-green'
                                : 'concept3-receipt-topbar-red'
                            }
                          ></div>

                          <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-1 font-mono-num small">
                                <span className="stamp-badge-amber">
                                  {log.transacao?.categoria || 'LAZER'}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--ink-secondary)' }}>
                                  {formatDataBR(log.transacao?.dataTransacao)}
                                </span>
                              </div>

                              <h5 className="font-editorial fw-bold text-center my-2">
                                {log.transacao?.descricao || 'Despesa Livre'}
                              </h5>

                              <div className="concept3-receipt-divider my-2"></div>

                              <div
                                className="font-mono-num fw-bold text-center my-1"
                                style={{ fontSize: '1.35rem' }}
                              >
                                {formatBRL(log.transacao?.valorTransacao)}
                              </div>

                              <div className="concept3-receipt-divider my-2"></div>

                              <div className="font-mono-num small mb-1">
                                <span style={{ color: 'var(--ink-secondary)' }}>Impacto no Tempo: </span>
                                <strong style={{ color: 'var(--red-stamp)' }}>
                                  +{log.diasAtraso} {log.diasAtraso === 1 ? 'Dia de Vida' : 'Dias de Vida'}
                                </strong>
                              </div>

                              <div className="font-mono-num small mb-1">
                                <span style={{ color: 'var(--ink-secondary)' }}>Custo Futuro: </span>
                                <strong>{formatBRL(log.valorFuturoPerdido)}</strong>
                              </div>

                              <div className="font-mono-num small">
                                <span style={{ color: 'var(--ink-secondary)' }}>Meta Afetada: </span>
                                <strong>{log.metaImpactada?.meta || 'Meta Principal'}</strong>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 divider-dashed">
                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-ink flex-grow-1 font-mono-num"
                                  style={{ fontSize: '0.73rem' }}
                                  onClick={() => {
                                    setFocoId(log.id);
                                    setModalRecibosAberto(false);
                                  }}
                                  title="Colocar este recibo na frente da pilha"
                                >
                                  <i className="bi bi-layers-half me-1"></i>
                                  Destacar na Pilha
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm font-mono-num"
                                  style={{
                                    fontSize: '0.73rem',
                                    backgroundColor: 'var(--red-soft)',
                                    color: 'var(--red-stamp)',
                                    border: '1.5px solid var(--red-stamp)',
                                    fontWeight: 700,
                                  }}
                                  disabled={salvando}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (focoId === log.id) {
                                      setFocoId(null);
                                    }
                                    if (onExcluirCustoOportunidade) {
                                      await onExcluirCustoOportunidade(
                                        log.id,
                                        log.transacao?.descricao || 'Despesa'
                                      );
                                    }
                                  }}
                                  title="Excluir lançamento errado e estornar valor imediatamente"
                                >
                                  <i className="bi bi-trash3 me-1"></i>
                                  Excluir
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Analisador de Micro-Hábitos (RF-07 - 1, 5 e 10 Anos) */}
      <div className="ledger-card p-3 p-md-4">
        <div className="mb-2 pb-2 divider-dashed">
          <span className="stamp-badge-amber mb-1 d-inline-block">SIMULADOR DE LONGO PRAZO (RF-07)</span>
          <h3 className="h5 font-editorial fw-bold mb-0">
            Calculadora de Micro-Hábitos
          </h3>
        </div>

        <p className="small mb-2" style={{ color: 'var(--ink-secondary)' }}>
          Arraste para ver quanto um pequeno gasto diário (ex: café, delivery, taxa) acumularia na sua carteira ({taxaAnual}% a.a.):
        </p>

        <div className="mb-3">
          <div className="d-flex justify-content-between font-mono-num mb-1">
            <span className="small fw-bold">Gasto Diário Recorrente:</span>
            <span className="fw-bold" style={{ color: 'var(--red-stamp)' }}>
              {formatBRL(valorHabitoDiario)}/dia ({formatBRL(gastoMensalHabito)}/mês)
            </span>
          </div>
          <input
            type="range"
            className="form-range"
            min="5"
            max="150"
            step="5"
            value={valorHabitoDiario}
            onChange={(e) => setValorHabitoDiario(Number(e.target.value))}
          />
        </div>

        <div className="row g-2 text-center font-mono-num">
          <div className="col-4">
            <div className="p-2 ledger-card-flat" style={{ backgroundColor: 'var(--bg-receipt)' }}>
              <div className="small" style={{ color: 'var(--ink-secondary)' }}>Em 1 Ano</div>
              <div className="fw-bold small" style={{ color: 'var(--green-dollar)' }}>
                {formatBRL(projetarAnos(1))}
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="p-2 ledger-card-flat" style={{ backgroundColor: 'var(--bg-receipt)' }}>
              <div className="small" style={{ color: 'var(--ink-secondary)' }}>Em 5 Anos</div>
              <div className="fw-bold small" style={{ color: 'var(--amber-gold)' }}>
                {formatBRL(projetarAnos(5))}
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="p-2 ledger-card-flat" style={{ backgroundColor: 'var(--green-soft)' }}>
              <div className="small fw-bold">Em 10 Anos</div>
              <div className="fw-bold small" style={{ color: 'var(--green-dollar)' }}>
                {formatBRL(projetarAnos(10))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
