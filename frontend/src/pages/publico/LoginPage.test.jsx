import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { corpoEnviado, mockApi, renderizarApp, sessao, USUARIOS } from '../../test/utils';
import { ALUNO, EXTRATO_ALUNO, VANTAGENS } from '../../test/dados';

const ROTAS_PAINEL_ALUNO = {
  'GET /api/alunos/me': ALUNO,
  'GET /api/extrato': EXTRATO_ALUNO,
  'GET /api/resgates': [],
  'GET /api/vantagens': VANTAGENS,
};

describe('LoginPage', () => {
  it('valida os campos obrigatórios antes de chamar a API', async () => {
    const fetchMock = mockApi({ ...sessao(null), 'GET /api/empresas': [] });
    renderizarApp('/login');
    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('Informe o login.')).toBeInTheDocument();
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([url]) => url === '/api/auth/login')).toBe(false);
  });

  it('preenche com um usuário de demonstração e abre o painel do perfil', async () => {
    const fetchMock = mockApi({
      ...sessao(null),
      'GET /api/empresas': [],
      'POST /api/auth/login': USUARIOS.aluno,
      ...ROTAS_PAINEL_ALUNO,
    });
    renderizarApp('/login');

    await userEvent.click(await screen.findByRole('button', { name: /Preencher com Lucas Oliveira/ }));
    expect(screen.getByLabelText('Login')).toHaveValue('lucas.santos');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByTestId('rota-atual')).toHaveTextContent('/aluno'));
    expect(corpoEnviado(fetchMock, 'POST', '/api/auth/login')).toEqual({ login: 'lucas.santos', senha: 'aluno123' });
    expect(await screen.findByText('Seu painel de moedas')).toBeInTheDocument();
  });

  it('mostra o erro de credenciais devolvido pelo servidor', async () => {
    mockApi({
      ...sessao(null),
      'GET /api/empresas': [],
      'POST /api/auth/login': { status: 401, corpo: { erro: 'Login ou senha inválidos.' } },
    });
    renderizarApp('/login');
    await userEvent.type(await screen.findByLabelText('Login'), 'lucas.santos');
    await userEvent.type(screen.getByLabelText('Senha'), 'errada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Login ou senha inválidos.');
  });

  it('lista as empresas parceiras no painel institucional', async () => {
    mockApi({ ...sessao(null), 'GET /api/empresas': [{ id: 1, nome: 'Livraria Universitária' }] });
    renderizarApp('/login');
    expect(await screen.findByText('Livraria Universitária')).toBeInTheDocument();
  });
});

describe('rotas protegidas', () => {
  it('redireciona para o login quando não há sessão', async () => {
    mockApi({ ...sessao(null), 'GET /api/empresas': [] });
    renderizarApp('/aluno/extrato');
    await waitFor(() => expect(screen.getByTestId('rota-atual')).toHaveTextContent('/login'));
  });

  it('leva o usuário ao painel do próprio perfil ao acessar outro perfil', async () => {
    mockApi({ ...sessao(USUARIOS.aluno), ...ROTAS_PAINEL_ALUNO });
    renderizarApp('/empresa/vantagens');
    await waitFor(() => expect(screen.getByTestId('rota-atual')).toHaveTextContent(/^\/aluno$/));
  });

  it('quem já está logado não vê a tela de login', async () => {
    mockApi({ ...sessao(USUARIOS.aluno), ...ROTAS_PAINEL_ALUNO });
    renderizarApp('/login');
    await waitFor(() => expect(screen.getByTestId('rota-atual')).toHaveTextContent(/^\/aluno$/));
  });

  it('mostra o menu do perfil e encerra a sessão ao sair', async () => {
    const fetchMock = mockApi({
      ...sessao(USUARIOS.aluno),
      ...ROTAS_PAINEL_ALUNO,
      'POST /api/auth/logout': null,
      'GET /api/empresas': [],
    });
    renderizarApp('/aluno');
    const menu = await screen.findByRole('navigation', { name: 'Menu principal' });
    expect(menu).toHaveTextContent('Vantagens');
    expect(menu).toHaveTextContent('Meus cupons');
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
    await waitFor(() => expect(screen.getByTestId('rota-atual')).toHaveTextContent('/login'));
    expect(fetchMock.mock.calls.some(([url, o]) => url === '/api/auth/logout' && o.method === 'POST')).toBe(true);
  });
});
