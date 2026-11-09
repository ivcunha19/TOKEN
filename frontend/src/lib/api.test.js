import { describe, expect, it, vi } from 'vitest';
import { api, ApiError, definirAoPerderSessao, endpoints } from './api';
import { mockApi, resposta } from '../test/utils';

describe('cliente da API', () => {
  it('envia JSON e devolve o corpo da resposta', async () => {
    const fetchMock = mockApi({ 'POST /api/transacoes': (corpo) => ({ id: 1, ...corpo }) });
    const r = await endpoints.transacoes.enviar(4, 50, 'Ótima participação');
    expect(r).toEqual({ id: 1, alunoId: 4, valor: 50, motivo: 'Ótima participação' });
    const [, opcoes] = fetchMock.mock.calls[0];
    expect(opcoes.headers['Content-Type']).toBe('application/json');
  });

  it('transforma o erro da API em ApiError com mensagem e campos', async () => {
    mockApi({ 'POST /api/alunos': { status: 400, corpo: { erro: 'Informe um CPF válido', campos: { cpf: 'Informe um CPF válido' } } } });
    const erro = await endpoints.alunos.cadastrar({}).catch((e) => e);
    expect(erro).toBeInstanceOf(ApiError);
    expect(erro.status).toBe(400);
    expect(erro.message).toBe('Informe um CPF válido');
    expect(erro.campos).toEqual({ cpf: 'Informe um CPF válido' });
  });

  it('retorna null em 204 (No Content)', async () => {
    mockApi({ 'DELETE /api/vantagens/3': null });
    await expect(endpoints.vantagens.excluir(3)).resolves.toBeNull();
  });

  it('avisa a perda de sessão em 401 fora das rotas de autenticação', async () => {
    const aoPerder = vi.fn();
    definirAoPerderSessao(aoPerder);
    mockApi({
      'GET /api/extrato': { status: 401, corpo: { erro: 'Faça login' } },
      'GET /api/auth/me': { status: 401, corpo: { erro: 'Faça login' } },
    });
    await expect(api('/api/auth/me')).rejects.toThrow('Faça login');
    expect(aoPerder).not.toHaveBeenCalled();
    await expect(api('/api/extrato')).rejects.toThrow('Faça login');
    expect(aoPerder).toHaveBeenCalledTimes(1);
    definirAoPerderSessao(null);
  });

  it('mostra mensagem amigável quando o servidor está fora do ar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api('/api/vantagens')).rejects.toThrow('Não foi possível conectar ao servidor');
  });

  it('usa mensagem genérica quando a resposta de erro não tem corpo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resposta(500)));
    await expect(api('/api/vantagens')).rejects.toThrow('Erro 500 ao comunicar com o servidor.');
  });

  it('codifica o código do cupom na URL', async () => {
    const fetchMock = mockApi({ 'GET /api/resgates/cupom/TKN-AAAA-BBBB': { codigoCupom: 'TKN-AAAA-BBBB' } });
    await endpoints.resgates.conferir('TKN-AAAA-BBBB');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/resgates/cupom/TKN-AAAA-BBBB');
  });
});
