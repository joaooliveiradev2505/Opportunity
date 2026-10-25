const API_BASE_URL = 'http://localhost:8080/api';

// ID padrão homologado no Oracle da FIAP (João Gabriel)
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
  // 1. Usuários (UsuarioController)
  buscarUsuario: (id) => request(`/usuarios/${id}`),
  cadastrarUsuario: (dados) =>
    request('/usuarios', { method: 'POST', body: JSON.stringify(dados) }),

  // 2. Metas (MetaController)
  listarMetas: (usuarioId) => request(`/metas/usuario/${usuarioId}`),
  criarMeta: (usuarioId, dados) =>
    request(`/metas/usuario/${usuarioId}`, { method: 'POST', body: JSON.stringify(dados) }),
  priorizarMeta: (metaId, keepalive = false) =>
    request(`/metas/${metaId}/priorizar`, { method: 'PUT', keepalive }),
  aportarMeta: (metaId, valor) =>
    request(`/metas/${metaId}/aporte`, { method: 'PUT', body: JSON.stringify({ valor }) }),
  excluirMeta: (metaId) =>
    request(`/metas/${metaId}`, { method: 'DELETE' }),

  // 3. Transações e Motor de Custo de Oportunidade (TransacaoController)
  listarTransacoes: (usuarioId) => request(`/transacoes/usuario/${usuarioId}`),
  criarTransacao: (usuarioId, dados) =>
    request(`/transacoes/usuario/${usuarioId}`, { method: 'POST', body: JSON.stringify(dados) }),
  listarCustosOportunidade: (usuarioId) =>
    request(`/transacoes/usuario/${usuarioId}/custos-oportunidade`),
  excluirCustoOportunidade: (logId) =>
    request(`/transacoes/custos-oportunidade/${logId}`, { method: 'DELETE' }),
  excluirTransacao: (transacaoId) =>
    request(`/transacoes/${transacaoId}`, { method: 'DELETE' }),

  // 4. Dívidas (DividaController)
  listarDividas: (usuarioId) => request(`/dividas/usuario/${usuarioId}`),
  criarDivida: (usuarioId, dados) =>
    request(`/dividas/usuario/${usuarioId}`, { method: 'POST', body: JSON.stringify(dados) }),

  // 5. Investimentos (InvestimentoController)
  listarInvestimentos: (usuarioId) => request(`/investimentos/usuario/${usuarioId}`),
  criarInvestimento: (usuarioId, dados) =>
    request(`/investimentos/usuario/${usuarioId}`, { method: 'POST', body: JSON.stringify(dados) }),
};

// Formatadores utilitários padrão Real Brasileiro (BRL) e Datas
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
