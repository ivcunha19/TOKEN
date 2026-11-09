import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { AppRoutes } from '../App';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

/** Resposta HTTP falsa no formato usado pelo cliente da API. */
export function resposta(status, corpo) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (corpo === undefined) throw new Error('sem corpo');
      return corpo;
    },
  };
}

/**
 * Substitui o fetch global por um roteador de respostas.
 * `rotas`: { 'GET /api/x': corpo | (req) => corpo | { status, corpo } }.
 * Rotas não mapeadas respondem 404. Retorna o mock para inspecionar as chamadas.
 */
export function mockApi(rotas) {
  const fetchMock = vi.fn(async (url, opcoes = {}) => {
    const metodo = opcoes.method || 'GET';
    const caminho = String(url).split('?')[0];
    const chave = `${metodo} ${caminho}`;
    if (!(chave in rotas)) return resposta(404, { erro: `Rota não mapeada no teste: ${chave}` });
    let valor = rotas[chave];
    if (typeof valor === 'function') {
      const corpo = opcoes.body && typeof opcoes.body === 'string' ? JSON.parse(opcoes.body) : opcoes.body;
      valor = await valor(corpo);
    }
    if (valor && typeof valor === 'object' && 'status' in valor && 'corpo' in valor) {
      return resposta(valor.status, valor.corpo);
    }
    return resposta(valor === null ? 204 : 200, valor === null ? undefined : valor);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Corpo JSON enviado na N-ésima chamada para `metodo url`. */
export function corpoEnviado(fetchMock, metodo, url, indice = 0) {
  const chamadas = fetchMock.mock.calls.filter(([u, o = {}]) => String(u) === url && (o.method || 'GET') === metodo);
  const corpo = chamadas[indice]?.[1]?.body;
  return typeof corpo === 'string' ? JSON.parse(corpo) : corpo;
}

export const USUARIOS = {
  aluno: { id: 4, nome: 'Lucas Oliveira Santos', login: 'lucas.santos', tipo: 'ALUNO' },
  professor: { id: 1, nome: 'Profa. Milena Menezes Adão', login: 'milena.adao', tipo: 'PROFESSOR' },
  empresa: { id: 6, nome: 'Restaurante Sabor do Campus', login: 'restaurante.campus', tipo: 'EMPRESA' },
};

/** Mostra a rota atual na tela, para os testes verificarem navegação. */
function LocalizacaoAtual() {
  const location = useLocation();
  return <div data-testid="rota-atual">{location.pathname}</div>;
}

/** Renderiza a aplicação inteira (rotas reais) a partir de `rota`. */
export function renderizarApp(rota = '/') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
          <Routes>
            <Route path="*" element={<LocalizacaoAtual />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

/** Rota de sessão: logado como `usuario` ou 401. */
export function sessao(usuario) {
  return { 'GET /api/auth/me': usuario || { status: 401, corpo: { erro: 'Faça login para acessar este recurso.' } } };
}
