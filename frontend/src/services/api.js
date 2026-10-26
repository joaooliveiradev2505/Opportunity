const API_BASE_URL = 'http://localhost:8080/api';

// ID padrão homologado no Oracle da FIAP
export const DEFAULT_USER_ID = 'da354833-b0ea-425a-b2aa-c9127c31d002';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro na comunicação com a API (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  // 1. Usuários (TB_FIN_USUARIO)
  buscarUsuario: (id) => request(`/usuarios/${id}`),
  cadastrarUsuario: (dados) =>
    request('/usuarios', { method: 'POST', body: JSON.stringify(dados) }),
  atualizarUsuario: (id, dados) =>
    request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),

  // 2. Metas & Prioridade (TB_FIN_META)
  listarMetas: (usuarioId) => request(`/metas/usuario/${usuarioId}`),
  criarMeta: (usuarioId, dados) =>
    request(`/metas/usuario/${usuarioId}`, { method: 'POST', body: JSON.stringify(dados) }),
  atualizarMeta: (metaId, dados) =>
    request(`/metas/${metaId}`, { method: 'PUT', body: JSON.stringify(dados) }),
  priorizarMeta: (metaId, usarKeepalive = false) =>
    request(`/metas/${metaId}/priorizar`, { method: 'PUT', keepalive: usarKeepalive }),
  aportarMeta: (metaId, valor) =>
    request(`/metas/${metaId}/aporte`, { method: 'PUT', body: JSON.stringify({ valor }) }),
  excluirMeta: (metaId) =>
    request(`/metas/${metaId}`, { method: 'DELETE' }),

  // 3. Transações & Custo de Oportunidade (TB_FIN_TRANSACAO / TB_FIN_LOG_OPORTUNIDADE)
  listarTransacoes: (usuarioId) => request(`/transacoes/usuario/${usuarioId}`),
  criarTransacao: (usuarioId, dados) =>
    request(`/transacoes/usuario/${usuarioId}`, { method: 'POST', body: JSON.stringify(dados) }),
  atualizarTransacao: (transacaoId, dados) =>
    request(`/transacoes/${transacaoId}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluirTransacao: (transacaoId) =>
    request(`/transacoes/${transacaoId}`, { method: 'DELETE' }),
  listarCustosOportunidade: (usuarioId) =>
    request(`/transacoes/usuario/${usuarioId}/custos-oportunidade`),
  excluirCustoOportunidade: (logId) =>
    request(`/transacoes/custos-oportunidade/${logId}`, { method: 'DELETE' }),

  // 4. Dívidas & Amortização (TB_FIN_DIVIDA)
  listarDividas: (usuarioId) => request(`/dividas/usuario/${usuarioId}`),
  criarDivida: (usuarioId, dados) =>
    request(`/dividas/usuario/${usuarioId}`, { method: 'POST', body: JSON.stringify(dados) }),
  pagarParcelaDivida: (dividaId) =>
    request(`/dividas/${dividaId}/pagar-parcela`, { method: 'PUT' }),
  atualizarDivida: (dividaId, dados) =>
    request(`/dividas/${dividaId}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluirDivida: (dividaId) =>
    request(`/dividas/${dividaId}`, { method: 'DELETE' }),

  // 5. Carteira de Investimentos (TB_FIN_INVESTIMENTO)
  listarInvestimentos: (usuarioId) => request(`/investimentos/usuario/${usuarioId}`),
  criarInvestimento: (usuarioId, dados) =>
    request(`/investimentos/usuario/${usuarioId}`, { method: 'POST', body: JSON.stringify(dados) }),
  atualizarSaldoInvestimento: (investimentoId, dados) =>
    request(`/investimentos/${investimentoId}/saldo`, { method: 'PUT', body: JSON.stringify(dados) }),
  atualizarInvestimento: (investimentoId, dados) =>
    request(`/investimentos/${investimentoId}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluirInvestimento: (investimentoId) =>
    request(`/investimentos/${investimentoId}`, { method: 'DELETE' }),
};

export const formatBRL = (valor) => {
  const numero = Number(valor || 0);
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatDataBR = (isoDate) => {
  if (!isoDate) return '—';
  const partes = String(isoDate).split('T')[0].split('-');
  if (partes.length !== 3) return isoDate;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};
