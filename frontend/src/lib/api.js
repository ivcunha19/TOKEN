/**
 * Cliente HTTP da API REST do TOKEN.
 * A sessão é mantida pelo cookie JSESSIONID (mesma origem), então não há token no front.
 * Erros da API chegam no formato { erro, campos } e viram ApiError.
 */

export class ApiError extends Error {
  constructor(mensagem, status, campos = {}) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.campos = campos || {};
  }
}

let aoPerderSessao = null;

/** Registra quem deve ser avisado quando a API responder 401 (sessão expirada). */
export function definirAoPerderSessao(callback) {
  aoPerderSessao = callback;
}

export async function api(url, { method = 'GET', json, form, signal } = {}) {
  const opcoes = { method, headers: { Accept: 'application/json' }, credentials: 'same-origin', signal };
  if (form) {
    opcoes.body = form;
  } else if (json !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(json);
  }

  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch (erro) {
    if (erro?.name === 'AbortError') throw erro;
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se a aplicação está no ar.', 0);
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401 && !url.startsWith('/api/auth/') && aoPerderSessao) {
      aoPerderSessao();
    }
    throw new ApiError(
      dados?.erro || `Erro ${resposta.status} ao comunicar com o servidor.`,
      resposta.status,
      dados?.campos,
    );
  }
  return dados;
}

/** Endpoints agrupados por recurso — espelham os controllers do Spring Boot. */
export const endpoints = {
  auth: {
    login: (login, senha) => api('/api/auth/login', { method: 'POST', json: { login, senha } }),
    logout: () => api('/api/auth/logout', { method: 'POST' }),
    me: () => api('/api/auth/me'),
  },
  catalogo: {
    instituicoes: () => api('/api/instituicoes'),
    cursos: () => api('/api/cursos'),
  },
  alunos: {
    cadastrar: (dados) => api('/api/alunos', { method: 'POST', json: dados }),
    me: () => api('/api/alunos/me'),
    atualizar: (dados) => api('/api/alunos/me', { method: 'PUT', json: dados }),
    excluir: () => api('/api/alunos/me', { method: 'DELETE' }),
    daMinhaInstituicao: () => api('/api/alunos'),
  },
  empresas: {
    cadastrar: (dados) => api('/api/empresas', { method: 'POST', json: dados }),
    parceiras: () => api('/api/empresas'),
    me: () => api('/api/empresas/me'),
    atualizar: (dados) => api('/api/empresas/me', { method: 'PUT', json: dados }),
    excluir: () => api('/api/empresas/me', { method: 'DELETE' }),
  },
  professores: {
    me: () => api('/api/professores/me'),
  },
  vantagens: {
    catalogo: () => api('/api/vantagens'),
    minhas: () => api('/api/vantagens/minhas'),
    cadastrar: (form) => api('/api/vantagens', { method: 'POST', form }),
    atualizar: (id, form) => api(`/api/vantagens/${id}`, { method: 'PUT', form }),
    excluir: (id) => api(`/api/vantagens/${id}`, { method: 'DELETE' }),
  },
  transacoes: {
    enviar: (alunoId, valor, motivo) => api('/api/transacoes', { method: 'POST', json: { alunoId, valor, motivo } }),
    extrato: () => api('/api/extrato'),
  },
  resgates: {
    resgatar: (vantagemId) => api('/api/resgates', { method: 'POST', json: { vantagemId } }),
    listar: () => api('/api/resgates'),
    conferir: (codigo) => api(`/api/resgates/cupom/${encodeURIComponent(codigo)}`),
    utilizar: (codigo) => api(`/api/resgates/cupom/${encodeURIComponent(codigo)}/utilizar`, { method: 'POST' }),
  },
};
