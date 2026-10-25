import { useState } from 'react';
import { formatBRL, formatDataBR } from '../services/api';

export default function PainelPatrimonio360({
  metas,
  investimentos,
  dividas,
  transacoes,
  onCriarMeta,
  onPriorizarMeta,
  onAportarMeta,
  onExcluirMeta,
  onCriarInvestimento,
  onCriarDivida,
  saldoLivreRestante,
  metaPrincipal,
}) {
  const [abaAtiva, setAbaAtiva] = useState('METAS');

  // Estados da Telinha de Visão dos Recibos de Metas + Aporte Rápido ("+")
  const [modalMetasAberto, setModalMetasAberto] = useState(false);
  const [metaDestacadaModalId, setMetaDestacadaModalId] = useState(null);
  const [valoresAporteRapido, setValoresAporteRapido] = useState({});

  const abrirVisaoMetas = (metaId = null) => {
    setMetaDestacadaModalId(metaId);
    setModalMetasAberto(true);
  };

  // Estados dos formulários rápidos
  const [novaMeta, setNovaMeta] = useState({
    meta: '',
    valorAlvo: '',
    valorAtual: 0,
    aporteMensal: '',
    dataAlvo: '2028-12-31',
    prioridade: 1,
    taxaRendimentoAnual: 12.0,
    reservaEmergencia: false,
  });

  const [novoInvest, setNovoInvest] = useState({
    nomeAtivo: '',
    modalidade: 'RENDA_FIXA',
    tipoProduto: 'TESOURO_SELIC',
    valorInvestido: '',
    saldoAtual: '',
    risco: 'BAIXO',
    liquidez: 'ALTA',
    isentoIR: false,
  });

  const [novaDivida, setNovaDivida] = useState({
    descricaoDivida: '',
    valorTotal: '',
    valorParcela: '',
    totalParcelas: 12,
    parcelasPagas: 0,
    dataVencimentoMensal: '2026-11-10',
    taxaJurosAtraso: 2.5,
    statusDivida: 'EM_DIA',
  });

  // Estado do Consultor IA (RF-08)
  const [perguntaIA, setPerguntaIA] = useState('');
  const [mensagensIA, setMensagensIA] = useState([
    {
      autor: 'IA',
      texto:
        'Olá! Sou o Consultor Editorial do Opportunity. Posso analisar se uma compra cabe no seu Saldo Livre Sem Culpa ou explicar ativos como Tesouro Selic, CDB, LCI/LCA, FIIs e Ações. O que deseja avaliar hoje?',
    },
  ]);

  // Estados de Interação Estilo Card-Game para a Pilha de Recibos de Metas
  const [dragCard, setDragCard] = useState(null);
  const [hoveredMetaId, setHoveredMetaId] = useState(null);
  const [promotedMeta, setPromotedMeta] = useState(null);

  const acionarPromocaoMeta = (metaId, fromX = -60, fromRot = -5, viaClick = false) => {
    if (!onPriorizarMeta) return;
    if (viaClick) {
      setPromotedMeta({ id: metaId, fromX, fromRot });
      setTimeout(() => {
        setPromotedMeta((atual) => (atual?.id === metaId ? null : atual));
      }, 500);
    }
    onPriorizarMeta(metaId);
  };

  const responderNoConsultorIA = (e) => {
    e.preventDefault();
    if (!perguntaIA.trim()) return;

    const textoUsuario = perguntaIA.trim();
    const textoLower = textoUsuario.toLowerCase();

    // Extrai números caso o usuário pergunte "Posso gastar 200 hoje?"
    const matchValor = textoUsuario.match(/(\d+(?:[.,]\d+)?)/);
    const valorExtraido = matchValor
      ? parseFloat(matchValor[1].replace(',', '.'))
      : null;

    let resposta = '';
    const aporteDiario = metaPrincipal?.aporteMensal
      ? Number(metaPrincipal.aporteMensal) / 30
      : 50;

    if (valorExtraido && (textoLower.includes('gastar') || textoLower.includes('comprar') || textoLower.includes('vale') || textoLower.includes('posso'))) {
      const dias = Math.ceil(valorExtraido / aporteDiario);
      const fv = (valorExtraido * Math.pow(1.01, 24)).toFixed(2);
      if (valorExtraido <= saldoLivreRestante) {
        resposta = `✅ Você possui ${formatBRL(saldoLivreRestante)} de Saldo Livre Sem Culpa! Essa compra de ${formatBRL(valorExtraido)} cabe no seu orçamento reverso. Porém, lembre-se do Custo de Oportunidade: ela equivale a ${dias} dia(s) de trabalho da sua meta "${metaPrincipal?.meta || 'Reserva'}" (ou R$ ${fv} em 24 meses a 1% a.m.).`;
      } else {
        resposta = `⚠️ Alerta de Orçamento Reverso! Seu Saldo Livre atual é de ${formatBRL(saldoLivreRestante)}. Gastar ${formatBRL(valorExtraido)} agora vai invadir o dinheiro sagrado das suas metas, atrasando seu objetivo "${metaPrincipal?.meta || 'Reserva'}" em +${dias} dias!`;
      }
    } else if (textoLower.includes('selic') || textoLower.includes('reserva')) {
      resposta =
        '📌 O Tesouro Selic é o ativo número 1 para sua Reserva de Emergência: tem risco soberano (o mais baixo do país), liquidez diária (resgate em D+0/D+1) e rende 100% da taxa básica de juros sem sofrer marcação a mercado negativa.';
    } else if (textoLower.includes('lci') || textoLower.includes('lca') || textoLower.includes('cdb')) {
      resposta =
        '📌 CDBs têm incidência de Imposto de Renda regressivo (de 22,5% a 15%), enquanto LCI e LCA são 100% ISENTAS de IR para pessoa física! Uma LCI pagando 90% do CDI equivale a um CDB pagando ~109% do CDI.';
    } else if (textoLower.includes('fii') || textoLower.includes('imobili')) {
      resposta =
        '📌 Fundos Imobiliários (FIIs) pertencem à Renda Variável e permitem receber aluguéis mensais isentos de IR direto na conta, acelerando o efeito bola de neve dos juros compostos nas suas metas!';
    } else {
      resposta = `📊 Analisando seu Livro-Caixa: hoje seu Saldo Livre Sem Culpa é de ${formatBRL(saldoLivreRestante)} e cada ${formatBRL(aporteDiario)} investidos antecipam em 1 dia sua meta "${metaPrincipal?.meta || 'Reserva de Emergência'}". Dica: pergunte "Posso gastar 200 hoje?" ou tire dúvidas sobre Selic, LCI, CDB e FIIs!`;
    }

    setMensagensIA([
      ...mensagensIA,
      { autor: 'USUARIO', texto: textoUsuario },
      { autor: 'IA', texto: resposta },
    ]);
    setPerguntaIA('');
  };

  const totalInvestido = investimentos.reduce(
    (acc, inv) => acc + Number(inv.saldoAtual || inv.valorInvestido || 0),
    0
  );

  return (
    <div className="d-flex flex-column gap-4">
      {/* Menu de Abas Estilo Seções de Jornal (Mobile-First) */}
      <div className="ledger-card p-3 p-md-4">
        <div className="d-flex flex-wrap gap-2 mb-4 pb-3 divider-double">
          <button
            type="button"
            className={`btn btn-sm ${abaAtiva === 'METAS' ? 'btn-ink' : 'btn-outline-ink'}`}
            onClick={() => setAbaAtiva('METAS')}
          >
            <i className="bi bi-bullseye me-1"></i>
            1. Metas & Reserva ({metas.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${abaAtiva === 'INVESTIMENTOS' ? 'btn-ink' : 'btn-outline-ink'}`}
            onClick={() => setAbaAtiva('INVESTIMENTOS')}
          >
            <i className="bi bi-graph-up-arrow me-1"></i>
            2. Carteira de Ativos ({investimentos.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${abaAtiva === 'DIVIDAS' ? 'btn-ink' : 'btn-outline-ink'}`}
            onClick={() => setAbaAtiva('DIVIDAS')}
          >
            <i className="bi bi-shield-exclamation me-1"></i>
            3. Controle de Dívidas ({dividas.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${abaAtiva === 'EXTRATO' ? 'btn-ink' : 'btn-outline-ink'}`}
            onClick={() => setAbaAtiva('EXTRATO')}
          >
            <i className="bi bi-journal-text me-1"></i>
            4. Livro-Caixa ({transacoes.length})
          </button>
        </div>

        {/* ABA 1: METAS EM RECIBOS VERTICAIS SOBREPOSTOS (FIEL AO CONCEITO 3) */}
        {abaAtiva === 'METAS' && (
          <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-2 divider-dashed">
              <div>
                <h3 className="h4 font-editorial fw-bold mb-0">
                  Recibos de Metas & Prioridade
                </h3>
                <small style={{ color: 'var(--ink-secondary)' }}>
                  O <strong>papel da frente (barra verde)</strong> é a sua <strong>Prioridade #1</strong>.{' '}
                  <strong>Clique e segure para arrastar</strong> qualquer recibo para a frente ou clique no botão <strong>+</strong> em cada recibo!
                </small>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2 mt-2 mt-md-0">
                <span className="stamp-badge-success">
                  FRENTE ATUAL: {metas[0]?.meta || '—'}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-ink py-1 px-2 d-flex align-items-center gap-1"
                  onClick={() => abrirVisaoMetas(null)}
                  title="Abrir telinha de visão geral dos recibos de metas (+)"
                >
                  <i className="bi bi-plus-lg"></i>
                  <span>Visão dos Recibos ({metas.length})</span>
                </button>
              </div>
            </div>

            {metas.length === 0 ? (
              <div className="text-center py-4 mb-4 ledger-card-flat">
                <p className="mb-0 fw-bold">Nenhum recibo de meta emitido ainda.</p>
                <small style={{ color: 'var(--ink-secondary)' }}>
                  Emita sua primeira meta no formulário abaixo para inaugurar os recibos.
                </small>
              </div>
            ) : (
              <>
                {/* 1. PALCO DOS RECIBOS SOBREPOSTOS COM FÍSICA DE JOGO DE CARTAS (DRAG & DROP + SWOOP) */}
                <div
                  className={`concept3-stage mb-3 ${
                    dragCard && Math.hypot(dragCard.dx, dragCard.dy) > 10
                      ? 'is-dragging-active'
                      : ''
                  }`}
                >
                  {(() => {
                    // Mantém a ordem do DOM 100% estável por ID para que o navegador anime
                    // suavemente o deslizamento (translate3d + rotate + scale) entre os papéis!
                    const metasEstaveisDOM = [...metas].sort((a, b) =>
                      String(a.id).localeCompare(String(b.id))
                    );

                    const total = metas.length;
                    const iconesMeta = ['bi-clock', 'bi-flower1', 'bi-cash-coin', 'bi-shield-check'];

                    // Calcula as coordenadas de repouso (X, Y, Rotação, Escala) garantindo sobreposição real
                    // e folga generosa acima do quadro "PROGRESSO DAS METAS"
                    const calcularSlot = (rankIndex) => {
                      if (total === 1) {
                        return { x: 0, y: 4, rot: 0, scale: 1.02, posClass: 'is-front' };
                      }
                      if (total === 2) {
                        // Com 2 recibos: mais de 55% de sobreposição física para destacar quem está na frente!
                        if (rankIndex === 0) {
                          return { x: 42, y: 8, rot: 1.5, scale: 1.03, posClass: 'is-front' };
                        }
                        return { x: -56, y: -14, rot: -6, scale: 0.94, posClass: 'is-back-left' };
                      }
                      // Com 3 ou mais recibos (leque de cartas centralizado)
                      if (rankIndex === 0) {
                        return { x: 0, y: 10, rot: 0, scale: 1.03, posClass: 'is-front' };
                      }
                      if (rankIndex === 1) {
                        return { x: -104, y: -14, rot: -6.5, scale: 0.94, posClass: 'is-back-left' };
                      }
                      if (rankIndex === 2) {
                        return { x: 104, y: -10, rot: 6.5, scale: 0.94, posClass: 'is-back-right' };
                      }
                      return {
                        x: 138 + (rankIndex - 3) * 18,
                        y: -18,
                        rot: 9.5,
                        scale: 0.89,
                        posClass: 'is-back-extra',
                      };
                    };

                    return metasEstaveisDOM.map((m, domIdx) => {
                      const rankIndex = metas.findIndex((item) => item.id === m.id);
                      const ordem = rankIndex + 1;
                      const isFront = rankIndex === 0;
                      const slot = calcularSlot(rankIndex);

                      const isThisDragging = dragCard?.id === m.id;
                      const isDraggingSomethingSignificantly =
                        dragCard && Math.hypot(dragCard.dx, dragCard.dy) > 15;
                      const isFrontYielding =
                        isFront &&
                        isDraggingSomethingSignificantly &&
                        !dragCard.isFront;
                      const isHovered = hoveredMetaId === m.id && !dragCard;
                      const isPromotingArc = promotedMeta?.id === m.id && isFront;

                      // Calcula o transform em tempo real (Repouso vs Hover vs Arrastando com o mouse)
                      let tx = slot.x;
                      let ty = slot.y;
                      let rot = slot.rot;
                      let sc = slot.scale;

                      if (isThisDragging) {
                        tx = slot.x + dragCard.dx;
                        ty = slot.y + dragCard.dy - 10;
                        rot = Math.max(-18, Math.min(18, slot.rot + dragCard.dx * 0.08));
                        sc = 1.08;
                      } else if (isFrontYielding) {
                        // A carta da frente recua e abre espaço enquanto você puxa uma carta de trás!
                        tx = total === 2 ? -35 : -45;
                        ty = -10;
                        rot = -4;
                        sc = 0.95;
                      } else if (isHovered && !isFront) {
                        // Espiada suave ao passar o mouse na carta de trás
                        ty = slot.y - 14;
                        sc = slot.scale + 0.03;
                      }

                      const alvo = Number(m.valorAlvo || 1);
                      const atual = Number(m.valorAtual || 0);
                      const pct = Math.min(100, Math.round((atual / alvo) * 100));
                      const aporteDiario = (Number(m.aporteMensal || 0) / 30).toFixed(0);
                      const corFundo = isFront ? '#F6F0E2' : '#EFE7D6';
                      const icone = isFront ? 'bi-flower1' : iconesMeta[domIdx % iconesMeta.length];

                      const prontoParaSoltar =
                        isThisDragging &&
                        !isFront &&
                        Math.hypot(dragCard.dx, dragCard.dy) >= 28;

                      return (
                        <div
                          key={m.id}
                          className={`concept3-vertical-receipt ${slot.posClass} ${
                            isThisDragging ? 'is-dragging' : ''
                          } ${isFrontYielding ? 'is-yielding' : ''} ${
                            isPromotingArc ? 'is-promoting' : ''
                          }`}
                          style={{
                            transform: `translate3d(${tx}px, ${ty}px, 0px) rotate(${rot}deg) scale(${sc})`,
                            '--card-from-x': `${promotedMeta?.fromX ?? -60}px`,
                            '--card-from-rot': `${promotedMeta?.fromRot ?? -6}deg`,
                            '--card-rest-x': `${slot.x}px`,
                            '--card-rest-y': `${slot.y}px`,
                            '--card-rest-rot': `${slot.rot}deg`,
                          }}
                          onMouseEnter={() => setHoveredMetaId(m.id)}
                          onMouseLeave={() =>
                            setHoveredMetaId((atualId) => (atualId === m.id ? null : atualId))
                          }
                          onPointerDown={(e) => {
                            if (e.target.closest('button, input, select, a')) return;
                            if (e.button !== 0 && e.pointerType === 'mouse') return;
                            e.currentTarget.setPointerCapture(e.pointerId);
                            setDragCard({
                              id: m.id,
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
                            if (!dragCard || dragCard.id !== m.id) return;
                            const dx = e.clientX - dragCard.startX;
                            const dy = e.clientY - dragCard.startY;
                            setDragCard((prev) => (prev ? { ...prev, dx, dy } : null));
                          }}
                          onPointerUp={(e) => {
                            if (!dragCard || dragCard.id !== m.id) return;
                            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                              e.currentTarget.releasePointerCapture(e.pointerId);
                            }
                            const dist = Math.hypot(dragCard.dx, dragCard.dy);
                            const fromX = dragCard.fromX;
                            const fromRot = dragCard.fromRot;
                            const eraFrente = dragCard.isFront;
                            setDragCard(null);

                            if (!eraFrente) {
                              // Se arrastou a carta de trás para frente (>= 28px) OU deu um clique rápido (< 8px)
                              if (dist >= 28) {
                                acionarPromocaoMeta(m.id, fromX, fromRot, false);
                              } else if (dist < 8) {
                                acionarPromocaoMeta(m.id, fromX, fromRot, true);
                              }
                            } else if (eraFrente && dist >= 55 && metas.length > 1) {
                              // Se segurou e arrastou a carta da frente para o lado para tirá-la da frente,
                              // promove a carta #2 de trás para assumir a Prioridade #1!
                              acionarPromocaoMeta(metas[1].id, -56, -6, true);
                            }
                          }}
                          onPointerCancel={() => setDragCard(null)}
                        >
                          <div className="concept3-receipt-paper">
                            {/* Botão "+" em TODOS os recibos de meta (Canto Superior Direito) */}
                            <button
                              type="button"
                              className="concept3-receipt-plus-btn"
                              title="Abrir visão deste recibo de meta e somar aporte (+)"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirVisaoMetas(m.id);
                              }}
                            >
                              +
                            </button>

                            {/* Barra Superior Colorida (Verde na frente ou quando pronta p/ soltar, Vermelho atrás) */}
                            <div
                              className={
                                isFront || prontoParaSoltar
                                  ? 'concept3-receipt-topbar-green'
                                  : 'concept3-receipt-topbar-red'
                              }
                            ></div>

                            <div className="concept3-receipt-body">
                              {/* Selo da posição na pilha */}
                              <div className="text-center px-3">
                                <span
                                  className="font-mono-num fw-bold text-uppercase"
                                  style={{
                                    fontSize: '0.64rem',
                                    color:
                                      isFront || prontoParaSoltar
                                        ? 'var(--green-dollar)'
                                        : 'var(--red-stamp)',
                                  }}
                                >
                                  {prontoParaSoltar
                                    ? '★ SOLTE P/ VIRAR PRIORIDADE #1!'
                                    : isFront
                                    ? '★ NA FRENTE • PRIORIDADE #1'
                                    : `ATRÁS (#${ordem}) • ARRASTE P/ FRENTE`}
                                </span>
                              </div>

                              {/* Nome da Meta Centralizado com Altura Padronizada (1 ou 2 linhas) */}
                              <h4 className="font-editorial fw-bold concept3-receipt-title px-3">
                                {m.meta}
                              </h4>

                              <div className="concept3-receipt-divider"></div>

                              {/* Valor Alvo Grande Centralizado */}
                              <div
                                className="font-mono-num fw-bold text-center"
                                style={{ fontSize: '1.35rem', lineHeight: 1.15 }}
                              >
                                {formatBRL(alvo)}
                              </div>

                              <div className="concept3-receipt-divider"></div>

                              {/* Tradução em Horas / Aporte Diário */}
                              <div className="font-mono-num small" style={{ fontSize: '0.76rem', lineHeight: 1.25 }}>
                                <div style={{ color: 'var(--ink-secondary)' }}>Tradução em Tempo:</div>
                                <div className="fw-bold">
                                  R$ {aporteDiario} = 1 Dia de Vida
                                </div>
                              </div>

                              {/* Crescimento Composto */}
                              <div className="font-mono-num small" style={{ fontSize: '0.76rem', lineHeight: 1.25 }}>
                                <div style={{ color: 'var(--ink-secondary)' }}>Crescimento Composto:</div>
                                <div className="fw-bold">
                                  {formatBRL(m.aporteMensal)}/mês ({m.taxaRendimentoAnual}% a.a.)
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--ink-secondary)' }}>
                                  Acumulado: {formatBRL(atual)} ({pct}%)
                                </div>
                              </div>

                              <div className="concept3-receipt-divider"></div>

                              {/* Rodapé Padronizado (Mesma altura na carta da frente e de trás!) */}
                              <div className="text-center d-flex align-items-center justify-content-center gap-2">
                                <i className={`bi ${icone} fs-5`} style={{ color: 'var(--ink-primary)' }}></i>
                                <span
                                  className="font-mono-num fw-semibold text-uppercase"
                                  style={{ fontSize: '0.64rem', color: 'var(--ink-secondary)' }}
                                >
                                  {isFront ? 'Meta Principal Ativa' : 'Segure e Arraste'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Borda Inferior Serrilhada Zig-Zag Sem Sombra Dupla */}
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

                {/* 2. QUADRO "PROGRESSO DAS METAS" (IDÊNTICO AO QUADRO DIREITO DO CONCEITO 3) */}
                <div className="ledger-card mb-4">
                  <div
                    className="text-center font-editorial fw-bold text-uppercase py-2"
                    style={{ borderBottom: '2px solid var(--ink-primary)', letterSpacing: '0.03em' }}
                  >
                    PROGRESSO DAS METAS
                  </div>
                  <div className="p-2 p-md-3">
                    {metas.map((m, idx) => {
                      const alvo = Number(m.valorAlvo || 1);
                      const atual = Number(m.valorAtual || 0);
                      const pct = Math.min(100, Math.round((atual / alvo) * 100));
                      const isPrimeira = idx === 0;

                      return (
                        <div
                          key={m.id}
                          onClick={() => !isPrimeira && onPriorizarMeta && onPriorizarMeta(m.id)}
                          className="row g-2 align-items-center py-2"
                          style={{
                            borderBottom: idx < metas.length - 1 ? '1.5px solid var(--ink-primary)' : 'none',
                            cursor: isPrimeira ? 'default' : 'pointer',
                          }}
                          title={isPrimeira ? 'Prioridade #1 (Na frente)' : 'Clique para trazer este recibo para a frente (#1)'}
                        >
                          <div className="col-12 col-sm-4 font-editorial fw-bold">
                            <span className="font-mono-num me-1" style={{ color: isPrimeira ? 'var(--green-dollar)' : 'var(--red-stamp)' }}>
                              #{idx + 1}
                            </span>
                            {m.meta}
                          </div>
                          <div className="col-7 col-sm-4 font-mono-num small text-sm-end">
                            {formatBRL(atual)} / {formatBRL(alvo)}
                          </div>
                          <div className="col-5 col-sm-4 d-flex align-items-center gap-2">
                            <div className="concept3-progress-track flex-grow-1">
                              <div
                                className={isPrimeira ? 'concept3-progress-fill-green' : 'concept3-progress-fill-red'}
                                style={{ width: `${Math.max(12, pct)}%` }}
                              ></div>
                              <div
                                className="concept3-progress-fill-black"
                                style={{ width: `${100 - Math.max(12, pct)}%` }}
                              ></div>
                            </div>
                            <span className="font-mono-num small fw-bold" style={{ minWidth: '36px', textAlign: 'right' }}>
                              {pct}%
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-ink py-0 px-2 font-mono-num fw-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirVisaoMetas(m.id);
                              }}
                              title="Abrir visão deste recibo e somar aporte (+)"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* TELINHA DE VISÃO DOS RECIBOS DE METAS CRIADOS (MODAL LADO A LADO COM "+" APORTE) */}
            {modalMetasAberto && (
              <div
                className="concept3-modal-backdrop"
                onClick={() => {
                  setModalMetasAberto(false);
                }}
              >
                <div
                  className="concept3-modal-sheet"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="p-3 p-md-4 d-flex flex-wrap justify-content-between align-items-center gap-2"
                    style={{
                      borderBottom: '2px solid var(--ink-primary)',
                      backgroundColor: 'var(--bg-muted)',
                    }}
                  >
                    <div>
                      <span className="stamp-badge-success me-2">VISÃO DE RECIBOS DE METAS</span>
                      <h4 className="h4 font-editorial fw-bold d-inline align-middle mb-0">
                        Todos os Recibos de Metas Emitidos ({metas.length})
                      </h4>
                      <div className="small font-mono-num mt-1" style={{ color: 'var(--ink-secondary)' }}>
                        Visualize todos os recibos lado a lado, some novos aportes com o botão <strong>+</strong> ou defina qual fica na frente (Prioridade #1).
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-ink px-3"
                      onClick={() => {
                        setModalMetasAberto(false);
                      }}
                    >
                      <i className="bi bi-x-lg me-1"></i> Fechar
                    </button>
                  </div>

                  <div className="concept3-modal-body">
                    <div className="row g-3">
                      {metas.map((m, idx) => {
                        const isPrimeira = idx === 0;
                        const isDestacada = metaDestacadaModalId === m.id;
                        const alvo = Number(m.valorAlvo || 1);
                        const atual = Number(m.valorAtual || 0);
                        const pct = Math.min(100, Math.round((atual / alvo) * 100));
                        const aporteDiario = (Number(m.aporteMensal || 0) / 30).toFixed(0);
                        const valorInputAporte = valoresAporteRapido[m.id] ?? '';

                        return (
                          <div key={m.id} className="col-12 col-sm-6 col-md-4">
                            <div
                              className="concept3-grid-receipt h-100 d-flex flex-column"
                              style={{
                                border: isDestacada
                                  ? '2.5px solid var(--green-dollar)'
                                  : '2px solid var(--ink-primary)',
                                backgroundColor: isPrimeira ? '#FBF7EE' : 'var(--bg-receipt)',
                              }}
                            >
                              <div
                                className={
                                  isPrimeira
                                    ? 'concept3-receipt-topbar-green'
                                    : 'concept3-receipt-topbar-red'
                                }
                              ></div>

                              <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                                <div>
                                  <div className="d-flex justify-content-between align-items-center mb-1 font-mono-num small">
                                    <span
                                      className={
                                        isPrimeira ? 'stamp-badge-success' : 'stamp-badge-amber'
                                      }
                                    >
                                      {isPrimeira ? '★ PRIORIDADE #1' : `FILA #${idx + 1}`}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--ink-secondary)' }}>
                                      Alvo: {formatDataBR(m.dataAlvo)}
                                    </span>
                                  </div>

                                  <h5 className="font-editorial fw-bold text-center my-2">
                                    {m.meta}
                                  </h5>

                                  <div className="concept3-receipt-divider my-2"></div>

                                  <div
                                    className="font-mono-num fw-bold text-center my-1"
                                    style={{ fontSize: '1.35rem' }}
                                  >
                                    {formatBRL(alvo)}
                                  </div>

                                  <div className="concept3-receipt-divider my-2"></div>

                                  <div className="font-mono-num small mb-1">
                                    <span style={{ color: 'var(--ink-secondary)' }}>Acumulado: </span>
                                    <strong style={{ color: 'var(--green-dollar)' }}>
                                      {formatBRL(atual)} ({pct}%)
                                    </strong>
                                  </div>

                                  <div className="font-mono-num small mb-1">
                                    <span style={{ color: 'var(--ink-secondary)' }}>Aporte Planejado: </span>
                                    <strong>{formatBRL(m.aporteMensal)}/mês</strong>
                                  </div>

                                  <div className="font-mono-num small mb-2">
                                    <span style={{ color: 'var(--ink-secondary)' }}>Equivalência: </span>
                                    <strong>R$ {aporteDiario} = 1 Dia de Vida</strong>
                                  </div>

                                  {/* Ação "+" de Somar Aporte Direto no Recibo */}
                                  {onAportarMeta && (
                                    <div
                                      className="p-2 rounded-1 mt-2"
                                      style={{
                                        backgroundColor: 'var(--bg-muted)',
                                        border: '1px dashed var(--ink-primary)',
                                      }}
                                    >
                                      <label
                                        className="form-label font-mono-num fw-bold mb-1"
                                        style={{ fontSize: '0.7rem' }}
                                      >
                                        <i className="bi bi-plus-circle-fill me-1" style={{ color: 'var(--green-dollar)' }}></i>
                                        Somar Novo Aporte (+) neste Recibo:
                                      </label>
                                      <div className="input-group input-group-sm">
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="1"
                                          className="form-control input-ledger font-mono-num"
                                          placeholder="Valor R$ (ex: 250)"
                                          value={valorInputAporte}
                                          onChange={(e) =>
                                            setValoresAporteRapido({
                                              ...valoresAporteRapido,
                                              [m.id]: e.target.value,
                                            })
                                          }
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-ink font-mono-num fw-bold"
                                          onClick={async () => {
                                            if (!valorInputAporte || Number(valorInputAporte) <= 0) return;
                                            await onAportarMeta(m.id, Number(valorInputAporte));
                                            setValoresAporteRapido({
                                              ...valoresAporteRapido,
                                              [m.id]: '',
                                            });
                                          }}
                                        >
                                          + Somar
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 pt-2 divider-dashed">
                                  <div className="d-flex gap-2">
                                    {!isPrimeira ? (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-ink flex-grow-1 font-mono-num"
                                        style={{ fontSize: '0.72rem' }}
                                        onClick={() => onPriorizarMeta && onPriorizarMeta(m.id)}
                                      >
                                        ★ Trazer p/ Frente (#1)
                                      </button>
                                    ) : (
                                      <span
                                        className="btn btn-sm flex-grow-1 font-mono-num disabled"
                                        style={{
                                          fontSize: '0.72rem',
                                          backgroundColor: 'var(--green-soft)',
                                          color: 'var(--green-dollar)',
                                          border: '1.5px solid var(--green-dollar)',
                                          fontWeight: 700,
                                        }}
                                      >
                                        ★ Na Frente da Pilha
                                      </span>
                                    )}

                                    {onExcluirMeta && (
                                      <button
                                        type="button"
                                        className="btn btn-sm font-mono-num"
                                        style={{
                                          fontSize: '0.72rem',
                                          backgroundColor: 'var(--red-soft)',
                                          color: 'var(--red-stamp)',
                                          border: '1.5px solid var(--red-stamp)',
                                          fontWeight: 700,
                                        }}
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await onExcluirMeta(m.id, m.meta);
                                        }}
                                        title="Excluir este recibo de meta"
                                      >
                                        <i className="bi bi-trash3 me-1"></i>
                                        Excluir
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulário para Nova Meta */}
            <div className="p-3 ledger-card-flat" style={{ backgroundColor: 'var(--bg-muted)' }}>
              <h6 className="font-editorial fw-bold mb-2">
                <i className="bi bi-plus-circle me-1"></i> Cadastrar Nova Meta Financeira
              </h6>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onCriarMeta({
                    ...novaMeta,
                    valorAlvo: Number(novaMeta.valorAlvo),
                    valorAtual: Number(novaMeta.valorAtual),
                    aporteMensal: Number(novaMeta.aporteMensal),
                    taxaRendimentoAnual: Number(novaMeta.taxaRendimentoAnual),
                  });
                  setNovaMeta({ ...novaMeta, meta: '', valorAlvo: '', aporteMensal: '' });
                }}
                className="row g-2"
              >
                <div className="col-12 col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm input-ledger"
                    placeholder="Nome da Meta (ex: Viagem Japão)"
                    required
                    value={novaMeta.meta}
                    onChange={(e) => setNovaMeta({ ...novaMeta, meta: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <input
                    type="number"
                    className="form-control form-control-sm input-ledger font-mono-num"
                    placeholder="Alvo (R$)"
                    required
                    value={novaMeta.valorAlvo}
                    onChange={(e) => setNovaMeta({ ...novaMeta, valorAlvo: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <input
                    type="number"
                    className="form-control form-control-sm input-ledger font-mono-num"
                    placeholder="Aporte/mês"
                    required
                    value={novaMeta.aporteMensal}
                    onChange={(e) => setNovaMeta({ ...novaMeta, aporteMensal: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <input
                    type="date"
                    className="form-control form-control-sm input-ledger font-mono-num"
                    required
                    value={novaMeta.dataAlvo}
                    onChange={(e) => setNovaMeta({ ...novaMeta, dataAlvo: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <button type="submit" className="btn btn-sm btn-ink w-100">
                    Salvar Meta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ABA 2: CARTEIRA DE INVESTIMENTOS RENDA FIXA E VARIÁVEL (RF-04) */}
        {abaAtiva === 'INVESTIMENTOS' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="h5 font-editorial fw-bold mb-0">
                  Carteira de Ativos (Renda Fixa & Variável)
                </h3>
                <small style={{ color: 'var(--ink-secondary)' }}>
                  Tabela Oracle: <code>TB_FIN_INVESTIMENTO</code>
                </small>
              </div>
              <span className="stamp-badge-amber">
                PATRIMÔNIO: {formatBRL(totalInvestido)}
              </span>
            </div>

            {investimentos.length === 0 ? (
              <p className="small py-2" style={{ color: 'var(--ink-secondary)' }}>
                Nenhum ativo cadastrado ainda. Adicione seu Tesouro Selic, CDB, LCI/LCA ou FII abaixo!
              </p>
            ) : (
              <div className="table-responsive mb-3">
                <table className="table table-sm align-middle font-mono-num mb-0" style={{ borderColor: 'var(--ink-primary)' }}>
                  <thead style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <tr>
                      <th>Ativo</th>
                      <th>Modalidade</th>
                      <th>Produto</th>
                      <th>Risco / Liquidez</th>
                      <th>IR</th>
                      <th className="text-end">Saldo Atual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investimentos.map((inv) => (
                      <tr key={inv.id}>
                        <td className="fw-bold">{inv.nomeAtivo}</td>
                        <td>
                          <span className={inv.modalidade === 'RENDA_FIXA' ? 'stamp-badge-success' : 'stamp-badge-amber'}>
                            {inv.modalidade}
                          </span>
                        </td>
                        <td>{inv.tipoProduto}</td>
                        <td>{inv.risco} / {inv.liquidez}</td>
                        <td>{inv.isentoIR ? 'Isento' : 'Tributado'}</td>
                        <td className="text-end fw-bold" style={{ color: 'var(--green-dollar)' }}>
                          {formatBRL(inv.saldoAtual || inv.valorInvestido)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-3 ledger-card-flat" style={{ backgroundColor: 'var(--bg-muted)' }}>
              <h6 className="font-editorial fw-bold mb-2">
                <i className="bi bi-bank me-1"></i> Adicionar Ativo na Carteira
              </h6>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const valor = Number(novoInvest.valorInvestido);
                  await onCriarInvestimento({
                    ...novoInvest,
                    valorInvestido: valor,
                    saldoAtual: Number(novoInvest.saldoAtual || valor),
                  });
                  setNovoInvest({ ...novoInvest, nomeAtivo: '', valorInvestido: '', saldoAtual: '' });
                }}
                className="row g-2"
              >
                <div className="col-12 col-md-3">
                  <input
                    type="text"
                    className="form-control form-control-sm input-ledger"
                    placeholder="Ativo (ex: Tesouro Selic 2029)"
                    required
                    value={novoInvest.nomeAtivo}
                    onChange={(e) => setNovoInvest({ ...novoInvest, nomeAtivo: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <select
                    className="form-select form-select-sm input-ledger"
                    value={novoInvest.modalidade}
                    onChange={(e) => setNovoInvest({ ...novoInvest, modalidade: e.target.value })}
                  >
                    <option value="RENDA_FIXA">Renda Fixa</option>
                    <option value="RENDA_VARIAVEL">Renda Variável</option>
                  </select>
                </div>
                <div className="col-6 col-md-2">
                  <select
                    className="form-select form-select-sm input-ledger"
                    value={novoInvest.tipoProduto}
                    onChange={(e) => setNovoInvest({ ...novoInvest, tipoProduto: e.target.value })}
                  >
                    <option value="TESOURO_SELIC">Tesouro Selic</option>
                    <option value="CDB">CDB</option>
                    <option value="LCI_LCA">LCI / LCA (Isento)</option>
                    <option value="FII">FII (Imobiliário)</option>
                    <option value="ACOES">Ações / ETF</option>
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <input
                    type="number"
                    className="form-control form-control-sm input-ledger font-mono-num"
                    placeholder="Valor Aplicado (R$)"
                    required
                    value={novoInvest.valorInvestido}
                    onChange={(e) => setNovoInvest({ ...novoInvest, valorInvestido: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <button type="submit" className="btn btn-sm btn-ink w-100">
                    Registrar Ativo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ABA 3: CONTROLE DE DÍVIDAS E INADIMPLÊNCIA (RF-03) */}
        {abaAtiva === 'DIVIDAS' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="h5 font-editorial fw-bold mb-0">
                  Radar de Dívidas & Prevenção de Juros
                </h3>
                <small style={{ color: 'var(--ink-secondary)' }}>
                  Tabela Oracle: <code>TB_FIN_DIVIDA</code>
                </small>
              </div>
              <span className="stamp-badge-danger">CONTROLE DE PASSIVOS</span>
            </div>

            {dividas.length === 0 ? (
              <p className="small py-2" style={{ color: 'var(--ink-secondary)' }}>
                Nenhuma dívida ativa registrada. Parabéns pela saúde financeira!
              </p>
            ) : (
              <div className="row g-2 mb-3">
                {dividas.map((d) => (
                  <div key={d.id} className="col-12">
                    <div className="p-3 ledger-card-flat d-flex flex-wrap justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-receipt)' }}>
                      <div>
                        <span className={d.statusDivida === 'ATRASADA' ? 'stamp-badge-danger me-2' : 'stamp-badge-amber me-2'}>
                          {d.statusDivida}
                        </span>
                        <strong className="font-editorial">{d.descricaoDivida}</strong>
                        <div className="small font-mono-num" style={{ color: 'var(--ink-secondary)' }}>
                          Parcelas: {d.parcelasPagas}/{d.totalParcelas} • Vencimento: {formatDataBR(d.dataVencimentoMensal)}
                        </div>
                      </div>
                      <div className="text-end font-mono-num">
                        <div className="fw-bold" style={{ color: 'var(--red-stamp)' }}>
                          Parcela: {formatBRL(d.valorParcela)}/mês
                        </div>
                        <small>Total: {formatBRL(d.valorTotal)}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 ledger-card-flat" style={{ backgroundColor: 'var(--bg-muted)' }}>
              <h6 className="font-editorial fw-bold mb-2">
                <i className="bi bi-clipboard-plus me-1"></i> Cadastrar Compromisso / Parcelamento
              </h6>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onCriarDivida({
                    ...novaDivida,
                    valorTotal: Number(novaDivida.valorTotal),
                    valorParcela: Number(novaDivida.valorParcela),
                    totalParcelas: Number(novaDivida.totalParcelas),
                  });
                  setNovaDivida({ ...novaDivida, descricaoDivida: '', valorTotal: '', valorParcela: '' });
                }}
                className="row g-2"
              >
                <div className="col-12 col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm input-ledger"
                    placeholder="Descrição (ex: Financiamento / Cartão)"
                    required
                    value={novaDivida.descricaoDivida}
                    onChange={(e) => setNovaDivida({ ...novaDivida, descricaoDivida: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <input
                    type="number"
                    className="form-control form-control-sm input-ledger font-mono-num"
                    placeholder="Valor Total (R$)"
                    required
                    value={novaDivida.valorTotal}
                    onChange={(e) => setNovaDivida({ ...novaDivida, valorTotal: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <input
                    type="number"
                    className="form-control form-control-sm input-ledger font-mono-num"
                    placeholder="Parcela Mensal (R$)"
                    required
                    value={novaDivida.valorParcela}
                    onChange={(e) => setNovaDivida({ ...novaDivida, valorParcela: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-2">
                  <button type="submit" className="btn btn-sm btn-ink w-100">
                    Salvar Dívida
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ABA 4: EXTRATO COMPLETO DO LIVRO-CAIXA */}
        {abaAtiva === 'EXTRATO' && (
          <div>
            <h3 className="h5 font-editorial fw-bold mb-3">
              Escrituração Completa de Transações (<code>TB_FIN_TRANSACAO</code>)
            </h3>
            <div className="table-responsive">
              <table className="table table-sm align-middle font-mono-num mb-0">
                <thead style={{ backgroundColor: 'var(--bg-muted)' }}>
                  <tr>
                    <th>Data</th>
                    <th>Histórico</th>
                    <th>Categoria</th>
                    <th>Natureza</th>
                    <th className="text-end">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transacoes.map((t) => (
                    <tr key={t.id}>
                      <td>{formatDataBR(t.dataTransacao)}</td>
                      <td className="fw-semibold">{t.descricao}</td>
                      <td>{t.categoria}</td>
                      <td>
                        <span
                          className={
                            t.tipoTransacao === 'GASTO_LIVRE'
                              ? 'stamp-badge-danger'
                              : t.tipoTransacao === 'RECEITA'
                              ? 'stamp-badge-success'
                              : 'stamp-badge-amber'
                          }
                        >
                          {t.tipoTransacao}
                        </span>
                      </td>
                      <td
                        className="text-end fw-bold"
                        style={{
                          color:
                            t.tipoTransacao === 'RECEITA'
                              ? 'var(--green-dollar)'
                              : t.tipoTransacao === 'GASTO_LIVRE'
                              ? 'var(--red-stamp)'
                              : 'var(--ink-primary)',
                        }}
                      >
                        {t.tipoTransacao === 'RECEITA' ? '+' : '-'}{' '}
                        {formatBRL(t.valorTransacao)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Consultor Financeiro Inteligente / Chatbot IA (RF-08) */}
      <div className="ledger-card p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 divider-dashed">
          <div>
            <span className="stamp-badge-success me-2">IA & EDUCAÇÃO FINANCEIRA (RF-08)</span>
            <h3 className="h5 font-editorial fw-bold d-inline align-middle mb-0">
              Consultor Opportunity AI
            </h3>
          </div>
          <i className="bi bi-robot fs-4"></i>
        </div>

        <div
          className="p-3 mb-3 ledger-card-flat d-flex flex-column gap-2"
          style={{
            backgroundColor: 'var(--bg-receipt)',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {mensagensIA.map((m, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-1 small ${
                m.autor === 'USUARIO' ? 'ms-auto text-end' : ''
              }`}
              style={{
                backgroundColor:
                  m.autor === 'USUARIO' ? 'var(--bg-muted)' : 'transparent',
                borderLeft:
                  m.autor === 'IA' ? '3px solid var(--green-dollar)' : 'none',
                maxWidth: '90%',
              }}
            >
              <strong className="font-mono-num d-block mb-1" style={{ fontSize: '0.72rem' }}>
                {m.autor === 'IA' ? '📰 CONSELHEIRO OPPORTUNITY:' : 'VOCÊ:'}
              </strong>
              {m.texto}
            </div>
          ))}
        </div>

        <form onSubmit={responderNoConsultorIA} className="input-group">
          <input
            type="text"
            className="form-control input-ledger"
            placeholder='Pergunte: "Posso gastar 180 hoje?" ou "O que é LCI e Tesouro Selic?"'
            value={perguntaIA}
            onChange={(e) => setPerguntaIA(e.target.value)}
          />
          <button className="btn btn-ink" type="submit">
            <i className="bi bi-send me-1"></i> Consultar
          </button>
        </form>
      </div>
    </div>
  );
}
