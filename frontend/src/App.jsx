import { useState, useEffect, useCallback, useRef } from 'react';
import { api, DEFAULT_USER_ID } from './services/api';
import HeaderJornal from './components/HeaderJornal';
import BannerOrcamentoReverso from './components/BannerOrcamentoReverso';
import ColunaRecibosOportunidade from './components/ColunaRecibosOportunidade';
import PainelPatrimonio360 from './components/PainelPatrimonio360';

// Chave de sessão para guardar a ordem das metas instantaneamente no navegador
const getSessionOrderKey = (userId) => `opportunity_metas_order_${userId}`;

// Aplica a ordem salva na sessão (sessionStorage) sobre a lista vinda do banco
function aplicarOrdemDaSessao(listaMetas, userId) {
  if (!Array.isArray(listaMetas) || listaMetas.length === 0) return [];
  try {
    const salvo = sessionStorage.getItem(getSessionOrderKey(userId));
    if (!salvo) return listaMetas;
    const idsOrdenados = JSON.parse(salvo);
    if (!Array.isArray(idsOrdenados) || idsOrdenados.length === 0) return listaMetas;

    const mapa = new Map(listaMetas.map((m) => [m.id, m]));
    const reordenadas = [];

    idsOrdenados.forEach((id) => {
      if (mapa.has(id)) {
        reordenadas.push(mapa.get(id));
        mapa.delete(id);
      }
    });
    // Adiciona eventuais novas metas que ainda não estavam no sessionStorage
    mapa.forEach((m) => reordenadas.push(m));

    return reordenadas.map((m, idx) => ({
      ...m,
      prioridade: idx + 1,
    }));
  } catch {
    return listaMetas;
  }
}

// Dados de contingência (caso o servidor Java/Oracle esteja desligado durante uma demonstração offline)
const FALLBACK_USUARIO = {
  id: DEFAULT_USER_ID,
  nome: 'João Gabriel',
  email: 'joao@opportunity.com.br',
  renda: 5000.0,
  perfilInvestidor: 'MODERADO',
  diaFechamento: 5,
};

const FALLBACK_METAS = [
  {
    id: 'e811dc30-fa6a-4224-9759-7f8d8755db38',
    meta: 'Reserva de Emergência',
    valorAlvo: 15000.0,
    valorAtual: 3000.0,
    aporteMensal: 1500.0,
    dataAlvo: '2028-10-24',
    prioridade: 1,
    taxaRendimentoAnual: 12.0,
    reservaEmergencia: true,
  },
  {
    id: '420d4361-1e44-43a8-86b6-959be24106c2',
    meta: 'Comprar moto',
    valorAlvo: 15000.0,
    valorAtual: 0.0,
    aporteMensal: 1500.0,
    dataAlvo: '2026-12-31',
    prioridade: 2,
    taxaRendimentoAnual: 12.0,
    reservaEmergencia: false,
  },
];

const FALLBACK_TRANSACOES = [
  {
    id: 'df79b11d-2d11-4805-92e5-e507587e74a6',
    descricao: 'Costelinha na brasa de sábado',
    valorTransacao: 150.0,
    tipoTransacao: 'GASTO_LIVRE',
    categoria: 'LAZER',
    dataTransacao: '2026-10-24',
  },
];

const FALLBACK_LOGS = [
  {
    id: '0d475719-e04d-4d53-9174-20a527859d25',
    transacao: FALLBACK_TRANSACOES[0],
    metaImpactada: FALLBACK_METAS[0],
    diasAtraso: 3,
    valorFuturoPerdido: 190.46,
    dataCalculo: '2026-10-24T16:03:09',
  },
];

export default function App() {
  const [usuarioId, setUsuarioId] = useState(DEFAULT_USER_ID);
  const [usuario, setUsuario] = useState(null);
  const [metas, setMetas] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [logsOportunidade, setLogsOportunidade] = useState([]);
  const [dividas, setDividas] = useState([]);
  const [investimentos, setInvestimentos] = useState([]);

  const [online, setOnline] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [alertaFeedback, setAlertaFeedback] = useState(null);

  // Guarda o ID da meta que foi priorizada na sessão atual e aguarda sincronização no Oracle ao sair
  const metaPrioridadePendenteRef = useRef(null);

  // Envia a prioridade alterada na sessão para o Oracle (suporta keepalive: true no fechamento da aba)
  const sincronizarPrioridadeSessaoNoOracle = useCallback(async (usarKeepalive = false) => {
    const metaIdPendente = metaPrioridadePendenteRef.current;
    if (!metaIdPendente) return;

    metaPrioridadePendenteRef.current = null;
    try {
      await api.priorizarMeta(metaIdPendente, usarKeepalive);
    } catch (err) {
      console.warn('Não foi possível sincronizar prioridade de sessão no Oracle:', err);
    }
  }, []);

  // Sincroniza automaticamente no Oracle quando o usuário fecha a aba, recarrega ou troca de janela
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && metaPrioridadePendenteRef.current) {
        sincronizarPrioridadeSessaoNoOracle(true);
      }
    };

    const handlePageUnload = () => {
      if (metaPrioridadePendenteRef.current) {
        sincronizarPrioridadeSessaoNoOracle(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageUnload);
    window.addEventListener('beforeunload', handlePageUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageUnload);
      window.removeEventListener('beforeunload', handlePageUnload);
    };
  }, [sincronizarPrioridadeSessaoNoOracle]);

  // Carrega todos os dados financeiros do usuário em paralelo (Promise.all)
  const carregarDados = useCallback(async (idAlvo) => {
    setCarregando(true);
    setAlertaFeedback(null);
    try {
      const [
        dadosUsuario,
        dadosMetas,
        dadosTransacoes,
        dadosLogs,
        dadosDividas,
        dadosInvestimentos,
      ] = await Promise.all([
        api.buscarUsuario(idAlvo),
        api.listarMetas(idAlvo),
        api.listarTransacoes(idAlvo),
        api.listarCustosOportunidade(idAlvo),
        api.listarDividas(idAlvo),
        api.listarInvestimentos(idAlvo),
      ]);

      setUsuario(dadosUsuario);
      // Respeita a ordem de sessão (sessionStorage) caso o usuário já tenha organizado os recibos nesta sessão
      setMetas(aplicarOrdemDaSessao(dadosMetas || [], idAlvo));
      setTransacoes(dadosTransacoes || []);
      // Ordena os logs do mais recente para o mais antigo
      setLogsOportunidade(
        (dadosLogs || []).slice().reverse()
      );
      setDividas(dadosDividas || []);
      setInvestimentos(dadosInvestimentos || []);
      setOnline(true);
    } catch (err) {
      console.warn('API Spring Boot indisponível ou ID não encontrado, ativando modo demonstrativo:', err);
      setUsuario(FALLBACK_USUARIO);
      setMetas(aplicarOrdemDaSessao(FALLBACK_METAS, idAlvo));
      setTransacoes(FALLBACK_TRANSACOES);
      setLogsOportunidade(FALLBACK_LOGS);
      setDividas([]);
      setInvestimentos([]);
      setOnline(false);
      setAlertaFeedback({
        tipo: 'warning',
        mensagem: `Não foi possível carregar o ID "${idAlvo}" na API (http://localhost:8080). Exibindo dados de contingência.`,
      });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados(usuarioId);
  }, [usuarioId, carregarDados]);

  // 1. Handlers de Usuário
  const handleTrocarUsuario = async (novoId) => {
    if (metaPrioridadePendenteRef.current) {
      await sincronizarPrioridadeSessaoNoOracle(false);
    }
    setUsuarioId(novoId);
  };

  const handleCriarNovoUsuario = async (dadosNovoUsuario) => {
    try {
      setSalvando(true);
      const criado = await api.cadastrarUsuario(dadosNovoUsuario);
      setUsuarioId(criado.id);
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Titular "${criado.nome}" registrado no Oracle com sucesso! (ID: ${criado.id})`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao criar usuário: ${err.message}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  // 2. Handler de Transação + Disparo Automático do Custo de Oportunidade no Backend
  const handleRegistrarTransacao = async (novaTransacao) => {
    try {
      setSalvando(true);
      setAlertaFeedback(null);
      // Se o usuário trocou a prioridade dos recibos na sessão, sincroniza antes do Gasto Livre
      // para que o motor Java calcule o Custo de Oportunidade sobre o recibo que está na frente!
      if (metaPrioridadePendenteRef.current && online) {
        await sincronizarPrioridadeSessaoNoOracle(false);
      }
      await api.criarTransacao(usuarioId, novaTransacao);
      // Recarrega transações e recibos de custo de oportunidade calculados pelo Java
      await carregarDados(usuarioId);

      if (novaTransacao.tipoTransacao === 'GASTO_LIVRE') {
        setAlertaFeedback({
          tipo: 'warning',
          mensagem: `Recibo emitido! O motor Java calculou e gravou o Custo de Oportunidade para "${novaTransacao.descricao}" na tabela TB_FIN_LOG_OPORTUNIDADE.`,
        });
      } else if (novaTransacao.tipoTransacao === 'APORTE_META') {
        setAlertaFeedback({
          tipo: 'success',
          mensagem: `Aporte "${novaTransacao.descricao}" registrado no Livro-Caixa e somado automaticamente ao saldo da sua Meta Prioridade #1 no Oracle!`,
        });
      } else {
        setAlertaFeedback({
          tipo: 'success',
          mensagem: `Lançamento "${novaTransacao.descricao}" registrado no livro-razão Oracle.`,
        });
      }
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao registrar lançamento: ${err.message}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  // 3. Handlers de Metas, Investimentos e Dívidas
  const handleCriarMeta = async (novaMeta) => {
    try {
      setSalvando(true);
      const criada = await api.criarMeta(usuarioId, novaMeta);
      // Inclui a nova meta na ordem da sessão
      try {
        const atual = metas.map((m) => m.id);
        if (criada?.id) {
          sessionStorage.setItem(
            getSessionOrderKey(usuarioId),
            JSON.stringify([...atual, criada.id])
          );
        }
      } catch {
        // Ignora erro de storage
      }
      await carregarDados(usuarioId);
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Meta "${novaMeta.meta}" registrada! A equação do Orçamento Reverso foi recalibrada.`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao cadastrar meta: ${err.message}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  // Troca de prioridade instantânea em SESSÃO (0ms de latência) + Persistência no Oracle ao sair da página
  const handlePriorizarMeta = (metaId) => {
    const escolhida = metas.find((m) => m.id === metaId);
    if (!escolhida) return;

    const restantes = metas.filter((m) => m.id !== metaId);
    const novaLista = [escolhida, ...restantes].map((m, idx) => ({
      ...m,
      prioridade: idx + 1,
    }));

    // 1. Atualiza imediatamente o estado React na tela (0ms)
    setMetas(novaLista);

    // 2. Persiste na sessionStorage do navegador para manter durante a sessão
    try {
      sessionStorage.setItem(
        getSessionOrderKey(usuarioId),
        JSON.stringify(novaLista.map((m) => m.id))
      );
    } catch {
      // Ignora erro de quota do sessionStorage
    }

    // 3. Marca o ID como pendente para gravar no Oracle automaticamente ao fechar/sair da aba (ou antes de um Gasto Livre)
    metaPrioridadePendenteRef.current = metaId;
  };

  const handleCriarInvestimento = async (novoInvest) => {
    try {
      setSalvando(true);
      await api.criarInvestimento(usuarioId, novoInvest);
      await carregarDados(usuarioId);
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Ativo "${novoInvest.nomeAtivo}" adicionado ao portfólio patrimonial.`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao cadastrar investimento: ${err.message}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleAtualizarSaldoInvestimento = async (investimentoId, dados, nomeAtivo = 'Ativo') => {
    try {
      setSalvando(true);
      if (online) {
        await api.atualizarSaldoInvestimento(investimentoId, dados);
        await carregarDados(usuarioId);
      } else {
        setInvestimentos((prev) =>
          prev.map((inv) => {
            if (inv.id !== investimentoId) return inv;
            const atual = Number(inv.saldoAtual || inv.valorInvestido || 0);
            const novoSaldo =
              dados.valorAporte !== undefined
                ? Math.max(0, atual + Number(dados.valorAporte))
                : Number(dados.saldoAtual ?? atual);
            return { ...inv, saldoAtual: novoSaldo };
          })
        );
      }
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Saldo do ativo "${nomeAtivo}" atualizado com sucesso no portfólio!`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao atualizar saldo do ativo: ${err.message}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirInvestimento = async (investimentoId, nomeAtivo = 'Ativo') => {
    try {
      setSalvando(true);
      setInvestimentos((prev) => prev.filter((inv) => inv.id !== investimentoId));
      if (online) {
        await api.excluirInvestimento(investimentoId);
        await carregarDados(usuarioId);
      }
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Ativo "${nomeAtivo}" removido da carteira patrimonial.`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao excluir ativo: ${err.message}`,
      });
      if (online) await carregarDados(usuarioId);
    } finally {
      setSalvando(false);
    }
  };

  // Exclusão de recibo de Custo de Oportunidade (em caso de lançamento errado)
  const handleExcluirCustoOportunidade = async (logId, descricao = 'Lançamento') => {
    try {
      setSalvando(true);
      const logAlvo = logsOportunidade.find((l) => l.id === logId);
      // Atualização otimista imediata na tela (0ms)
      setLogsOportunidade((prev) => prev.filter((l) => l.id !== logId));
      if (logAlvo?.transacao?.id) {
        setTransacoes((prev) => prev.filter((t) => t.id !== logAlvo.transacao.id));
      }

      if (online) {
        await api.excluirCustoOportunidade(logId);
        await carregarDados(usuarioId);
      }
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Recibo "${descricao}" excluído com sucesso! O lançamento incorreto foi estornado do Oracle e seu Saldo Livre foi restaurado.`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao excluir recibo: ${err.message}`,
      });
      if (online) {
        await carregarDados(usuarioId);
      }
    } finally {
      setSalvando(false);
    }
  };

  // Exclusão de qualquer lançamento direto pelo Livro-Caixa (Aba 4)
  const handleExcluirTransacao = async (transacaoId, descricao = 'Transação') => {
    try {
      setSalvando(true);
      setTransacoes((prev) => prev.filter((t) => t.id !== transacaoId));
      setLogsOportunidade((prev) => prev.filter((l) => l.transacao?.id !== transacaoId));

      if (online) {
        await api.excluirTransacao(transacaoId);
        await carregarDados(usuarioId);
      }
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Lançamento "${descricao}" estornado do Livro-Caixa (TB_FIN_TRANSACAO) e saldos recalculados!`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao estornar lançamento: ${err.message}`,
      });
      if (online) await carregarDados(usuarioId);
    } finally {
      setSalvando(false);
    }
  };

  // Adição rápida de aporte ("+") em um recibo de Meta
  const handleAportarMeta = async (metaId, valorAporte) => {
    const num = Number(valorAporte);
    if (!num || num <= 0) return;
    try {
      setSalvando(true);
      if (online) {
        await api.aportarMeta(metaId, num);
        await carregarDados(usuarioId);
      } else {
        setMetas((prev) =>
          prev.map((m) =>
            m.id === metaId
              ? { ...m, valorAtual: Number(m.valorAtual || 0) + num }
              : m
          )
        );
      }
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Novo aporte de R$ ${num.toFixed(2)} somado ao recibo de meta no Oracle!`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao registrar aporte na meta: ${err.message}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  // Exclusão de recibo de Meta
  const handleExcluirMeta = async (metaId, nomeMeta = 'Meta') => {
    try {
      setSalvando(true);
      if (online) {
        await api.excluirMeta(metaId);
        await carregarDados(usuarioId);
      } else {
        setMetas((prev) => prev.filter((m) => m.id !== metaId));
      }
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Recibo da meta "${nomeMeta}" removido com sucesso.`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao excluir meta: ${err.message}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleCriarDivida = async (novaDivida) => {
    try {
      setSalvando(true);
      await api.criarDivida(usuarioId, novaDivida);
      await carregarDados(usuarioId);
      setAlertaFeedback({
        tipo: 'warning',
        mensagem: `Dívida "${novaDivida.descricaoDivida || novaDivida.descricao}" registrada no radar de amortização.`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao cadastrar dívida: ${err.message}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  const handlePagarParcelaDivida = async (dividaId, descricaoDivida = 'Dívida') => {
    try {
      setSalvando(true);
      if (online) {
        await api.pagarParcelaDivida(dividaId);
        await carregarDados(usuarioId);
      } else {
        setDividas((prev) =>
          prev.map((d) => {
            if (d.id !== dividaId) return d;
            const novasPagas = Math.min(Number(d.totalParcelas || 1), Number(d.parcelasPagas || 0) + 1);
            return {
              ...d,
              parcelasPagas: novasPagas,
              statusDivida: novasPagas >= Number(d.totalParcelas || 1) ? 'QUITADA' : 'EM_DIA',
            };
          })
        );
      }
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Parcela de "${descricaoDivida}" amortizada com sucesso!`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao amortizar parcela: ${err.message}`,
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirDivida = async (dividaId, descricaoDivida = 'Dívida') => {
    try {
      setSalvando(true);
      setDividas((prev) => prev.filter((d) => d.id !== dividaId));
      if (online) {
        await api.excluirDivida(dividaId);
        await carregarDados(usuarioId);
      }
      setAlertaFeedback({
        tipo: 'success',
        mensagem: `Compromisso "${descricaoDivida}" removido do controle de passivos.`,
      });
    } catch (err) {
      setAlertaFeedback({
        tipo: 'danger',
        mensagem: `Erro ao excluir dívida: ${err.message}`,
      });
      if (online) await carregarDados(usuarioId);
    } finally {
      setSalvando(false);
    }
  };

  // =========================================================================
  // MOTOR DE AGREGAÇÃO DO ORÇAMENTO REVERSO (Pay Yourself First)
  // =========================================================================
  const metaPrincipal = metas.length > 0 ? metas[0] : null;

  // Renda Base do Usuário + eventuais Receitas extras lançadas
  const receitasExtras = transacoes
    .filter((t) => t.tipoTransacao === 'RECEITA')
    .reduce((acc, t) => acc + Number(t.valorTransacao || 0), 0);

  const rendaMensalTotal = Number(usuario?.renda || 0) + receitasExtras;

  // Soma de todos os Aportes Mensais planejados nas Metas
  const totalAportesMetas = metas.reduce(
    (acc, m) => acc + Number(m.aporteMensal || 0),
    0
  );

  // Soma de Custos Fixos lançados + Parcelas de Dívidas ativas
  const totalCustosFixosTransacoes = transacoes
    .filter((t) => t.tipoTransacao === 'CUSTO_FIXO')
    .reduce((acc, t) => acc + Number(t.valorTransacao || 0), 0);

  const totalParcelasDividas = dividas
    .filter((d) => (d.statusDivida || d.status) !== 'QUITADA')
    .reduce((acc, d) => acc + Number(d.valorParcela || 0), 0);

  const totalCustosFixosEDividas = totalCustosFixosTransacoes + totalParcelasDividas;

  // Soma dos Gastos Livres já realizados no ciclo
  const totalGastosLivresMes = transacoes
    .filter((t) => t.tipoTransacao === 'GASTO_LIVRE')
    .reduce((acc, t) => acc + Number(t.valorTransacao || 0), 0);

  const tetoGastoSemCulpa = Math.max(
    0,
    rendaMensalTotal - totalAportesMetas - totalCustosFixosEDividas
  );
  const saldoLivreRestante = tetoGastoSemCulpa - totalGastosLivresMes;

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* 1. CABEÇALHO EDITORIAL ESTILO JORNAL FINANCEIRO */}
      <HeaderJornal
        usuario={usuario}
        online={online}
        onTrocarUsuario={handleTrocarUsuario}
        onCriarNovoUsuario={handleCriarNovoUsuario}
        carregando={carregando}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="container pb-5 flex-grow-1">
        {/* Alerta de Feedback ou Status */}
        {alertaFeedback && (
          <div
            className="ledger-card p-3 mb-4 d-flex justify-content-between align-items-center"
            style={{
              borderLeft: `5px solid ${
                alertaFeedback.tipo === 'danger'
                  ? 'var(--accent-terracotta)'
                  : alertaFeedback.tipo === 'warning'
                  ? 'var(--accent-amber)'
                  : 'var(--accent-sage)'
              }`,
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <div className="small">
              <strong className="text-uppercase font-mono-num me-2">
                [NOTA DE EXPEDIENTE]
              </strong>
              {alertaFeedback.mensagem}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-ink py-0 px-2"
              onClick={() => setAlertaFeedback(null)}
            >
              Fechar
            </button>
          </div>
        )}

        {/* 2. FAIXA SUPERIOR: EQUAÇÃO DO ORÇAMENTO REVERSO */}
        <BannerOrcamentoReverso
          rendaMensalTotal={rendaMensalTotal}
          totalAportesMetas={totalAportesMetas}
          totalCustosFixosEDividas={totalCustosFixosEDividas}
          totalGastosLivresMes={totalGastosLivresMes}
          metaPrincipal={metaPrincipal}
        />

        {/* 3. GRID ASSIMÉTRICO PRINCIPAL (2 COLUNAS ESTILO CADERNO DE ECONOMIA) */}
        <div className="row g-4 align-items-start">
          {/* Coluna Esquerda (5/12): Simulador + Recibos de Custo de Oportunidade */}
          <div className="col-12 col-lg-5">
            <ColunaRecibosOportunidade
              logsOportunidade={logsOportunidade}
              metas={metas}
              metaPrincipal={metaPrincipal}
              onRegistrarTransacao={handleRegistrarTransacao}
              onExcluirCustoOportunidade={handleExcluirCustoOportunidade}
              salvando={salvando}
            />
          </div>

          {/* Coluna Direita (7/12): Visão 360º de Patrimônio (Metas, Investimentos, Dívidas, Livro-Razão e IA) */}
          <div className="col-12 col-lg-7">
            <PainelPatrimonio360
              metas={metas}
              investimentos={investimentos}
              dividas={dividas}
              transacoes={transacoes}
              onCriarMeta={handleCriarMeta}
              onPriorizarMeta={handlePriorizarMeta}
              onAportarMeta={handleAportarMeta}
              onExcluirMeta={handleExcluirMeta}
              onCriarInvestimento={handleCriarInvestimento}
              onAtualizarSaldoInvestimento={handleAtualizarSaldoInvestimento}
              onExcluirInvestimento={handleExcluirInvestimento}
              onCriarDivida={handleCriarDivida}
              onPagarParcelaDivida={handlePagarParcelaDivida}
              onExcluirDivida={handleExcluirDivida}
              onExcluirTransacao={handleExcluirTransacao}
              saldoLivreRestante={saldoLivreRestante}
              metaPrincipal={metaPrincipal}
            />
          </div>
        </div>
      </main>

      {/* RODAPÉ EDITORIAL */}
      <footer
        className="py-3 mt-auto"
        style={{
          borderTop: '2px solid var(--border-ledger-strong)',
          backgroundColor: 'var(--bg-card-alt)',
        }}
      >
        <div className="container d-flex flex-wrap justify-content-between align-items-center small font-mono-num" style={{ color: 'var(--ink-secondary)' }}>
          <div>
            <strong>THE OPPORTUNITY LEDGER</strong> • PROJETO ANUAL FIAP • ARQUITETURA SPRING BOOT 4 + ORACLE 19C + REACT 19
          </div>
          <div className="d-flex align-items-center gap-3 mt-2 mt-md-0">
            <button
              type="button"
              className="btn btn-sm btn-outline-ink py-0 px-2"
              onClick={async () => {
                await sincronizarPrioridadeSessaoNoOracle(false);
                await carregarDados(usuarioId);
              }}
              disabled={carregando}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Sincronizar Oracle
            </button>
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="text-decoration-none"
              style={{ color: 'var(--ink-primary)' }}
            >
              <i className="bi bi-braces me-1"></i>Swagger API
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
