import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { corpoEnviado, mockApi, renderizarApp, sessao, USUARIOS } from '../../test/utils';
import { ALUNO, VANTAGENS } from '../../test/dados';
import { validarAluno } from '../../components/forms/AlunoForm';

const APOIO = {
  'GET /api/empresas': [],
  'GET /api/instituicoes': [{ id: 1, nome: 'PUC Minas', cnpj: null }],
  'GET /api/cursos': [{ codigo: 'ENGENHARIA_SOFTWARE', nome: 'Engenharia de Software' }],
};

describe('validarAluno', () => {
  const base = {
    nome: 'Ana', email: 'ana@x.com', cpf: '935.411.347-80', rg: 'MG-1', endereco: 'Rua A',
    instituicaoId: '1', curso: 'ENGENHARIA_SOFTWARE', matricula: '', login: 'ana', senha: 'segredo',
  };
  const erros = (v, o) => Object.fromEntries(Object.entries(validarAluno(v, o)).filter(([, m]) => m));

  it('aceita um cadastro válido', () => {
    expect(erros(base)).toEqual({});
  });

  it('rejeita CPF com dígito verificador errado e e-mail inválido', () => {
    expect(erros({ ...base, cpf: '935.411.347-81', email: 'ana' })).toEqual({
      cpf: 'CPF inválido: confira os dígitos.',
      email: 'Informe um e-mail válido.',
    });
  });

  it('exige senha no cadastro, mas não na edição', () => {
    expect(erros({ ...base, senha: '' })).toHaveProperty('senha');
    expect(erros({ ...base, senha: '' }, { edicao: true })).toEqual({});
    expect(erros({ ...base, senha: '123' }, { edicao: true })).toHaveProperty('senha');
  });
});

describe('CadastroAlunoPage', () => {
  it('cadastra o aluno, entra automaticamente e abre o painel', async () => {
    const fetchMock = mockApi({
      ...sessao(null),
      ...APOIO,
      'POST /api/alunos': (corpo) => ({ ...ALUNO, ...corpo }),
      'POST /api/auth/login': USUARIOS.aluno,
      'GET /api/alunos/me': ALUNO,
      'GET /api/extrato': { saldo: 0, transacoes: [] },
      'GET /api/resgates': [],
      'GET /api/vantagens': VANTAGENS,
    });
    renderizarApp('/cadastro/aluno');

    await userEvent.type(await screen.findByLabelText(/Nome completo/), 'Ana Souza');
    await userEvent.type(screen.getByLabelText(/CPF/), '93541134780');
    expect(screen.getByLabelText(/CPF/)).toHaveValue('935.411.347-80');
    await userEvent.type(screen.getByLabelText(/^RG/), 'MG-99.999.999');
    await userEvent.type(screen.getByLabelText(/Endereço completo/), 'Rua das Flores, 10');
    await waitFor(() => expect(screen.getByRole('option', { name: 'PUC Minas' })).toBeInTheDocument());
    await userEvent.selectOptions(screen.getByLabelText(/Instituição de ensino/), '1');
    await userEvent.selectOptions(screen.getByLabelText(/^Curso/), 'ENGENHARIA_SOFTWARE');
    await userEvent.type(screen.getByLabelText(/Matrícula/), '12a34');
    await userEvent.type(screen.getByLabelText(/E-mail/), 'ana@aluno.pucminas.br');
    await userEvent.type(screen.getByLabelText(/^Login/), 'ana.souza');
    await userEvent.type(screen.getByLabelText(/^Senha/), 'segredo1');
    await userEvent.click(screen.getByRole('button', { name: 'Criar minha conta' }));

    await waitFor(() => expect(screen.getByTestId('rota-atual')).toHaveTextContent(/^\/aluno$/));
    expect(corpoEnviado(fetchMock, 'POST', '/api/alunos')).toEqual({
      nome: 'Ana Souza',
      email: 'ana@aluno.pucminas.br',
      cpf: '935.411.347-80',
      rg: 'MG-99.999.999',
      endereco: 'Rua das Flores, 10',
      instituicaoId: 1,
      curso: 'ENGENHARIA_SOFTWARE',
      matricula: 1234,
      login: 'ana.souza',
      senha: 'segredo1',
    });
  });

  it('mostra no campo o erro de validação devolvido pela API', async () => {
    mockApi({
      ...sessao(null),
      ...APOIO,
      'POST /api/alunos': { status: 422, corpo: { erro: 'Já existe um usuário com este login.', campos: { login: 'Login já utilizado' } } },
    });
    renderizarApp('/cadastro/aluno');
    await userEvent.type(await screen.findByLabelText(/Nome completo/), 'Ana');
    await userEvent.type(screen.getByLabelText(/CPF/), '93541134780');
    await userEvent.type(screen.getByLabelText(/^RG/), 'MG');
    await userEvent.type(screen.getByLabelText(/Endereço completo/), 'Rua');
    await waitFor(() => expect(screen.getByRole('option', { name: 'PUC Minas' })).toBeInTheDocument());
    await userEvent.selectOptions(screen.getByLabelText(/Instituição de ensino/), '1');
    await userEvent.selectOptions(screen.getByLabelText(/^Curso/), 'ENGENHARIA_SOFTWARE');
    await userEvent.type(screen.getByLabelText(/E-mail/), 'ana@x.com');
    await userEvent.type(screen.getByLabelText(/^Login/), 'lucas.santos');
    await userEvent.type(screen.getByLabelText(/^Senha/), 'segredo1');
    await userEvent.click(screen.getByRole('button', { name: 'Criar minha conta' }));

    expect(await screen.findByText('Login já utilizado')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Já existe um usuário com este login.');
  });
});
