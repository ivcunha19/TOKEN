import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { corpoEnviado, mockApi, renderizarApp, sessao, USUARIOS } from '../../test/utils';
import { ALUNOS_DA_INSTITUICAO, EXTRATO_PROFESSOR, PROFESSOR } from '../../test/dados';
import { validarEnvio } from './EnviarMoedas';

describe('validarEnvio', () => {
  const erros = (v, saldo) => Object.fromEntries(Object.entries(validarEnvio(v, saldo)).filter(([, m]) => m));

  it('exige aluno, valor inteiro positivo dentro do saldo e motivo', () => {
    expect(erros({ alunoId: '', valor: '', motivo: ' ' }, 100)).toEqual({
      alunoId: 'Selecione o aluno que receberá as moedas.',
      valor: 'Informe a quantidade de moedas.',
      motivo: 'O motivo do reconhecimento é obrigatório.',
    });
    expect(erros({ alunoId: '4', valor: '2.5', motivo: 'ok' }, 100).valor).toMatch('inteiro');
    expect(erros({ alunoId: '4', valor: '150', motivo: 'ok' }, 100).valor).toBe('Saldo insuficiente: você tem 100 moedas.');
    expect(erros({ alunoId: '4', valor: '100', motivo: 'ok' }, 100)).toEqual({});
  });
});

describe('EnviarMoedas', () => {
  const rotas = (extra = {}) => ({
    ...sessao(USUARIOS.professor),
    'GET /api/alunos': ALUNOS_DA_INSTITUICAO,
    'GET /api/professores/me': PROFESSOR,
    'GET /api/extrato': EXTRATO_PROFESSOR,
    ...extra,
  });

  it('não envia sem escolher o aluno e sem motivo', async () => {
    const fetchMock = mockApi(rotas());
    renderizarApp('/professor/enviar');
    await userEvent.click(await screen.findByRole('button', { name: 'Enviar moedas' }));
    expect(screen.getByText('Selecione o aluno que receberá as moedas.')).toBeInTheDocument();
    expect(screen.getByText('O motivo do reconhecimento é obrigatório.')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([u, o = {}]) => u === '/api/transacoes' && o.method === 'POST')).toBe(false);
  });

  it('mostra quanto o professor já enviou para cada aluno', async () => {
    mockApi(rotas());
    renderizarApp('/professor/enviar');
    const lucas = await screen.findByRole('radio', { name: /Lucas Oliveira Santos/ });
    expect(lucas.closest('label')).toHaveTextContent('você já enviou200');
  });

  it('envia moedas com valor rápido e motivo sugerido', async () => {
    const fetchMock = mockApi(
      rotas({
        'POST /api/transacoes': (corpo) => ({
          id: 9,
          ...corpo,
          alunoNome: 'Mariana Alves Pereira',
          professorNome: PROFESSOR.nome,
          saldoProfessor: 750,
        }),
      }),
    );
    renderizarApp('/professor/enviar');

    await userEvent.click(await screen.findByRole('radio', { name: /Mariana Alves Pereira/ }));
    await userEvent.click(screen.getByRole('button', { name: '50 moedas' }));
    await userEvent.click(screen.getByRole('button', { name: '+ Participação ativa nas aulas' }));
    expect(screen.getByText('750 moedas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Enviar 50 moedas' }));

    await waitFor(() =>
      expect(corpoEnviado(fetchMock, 'POST', '/api/transacoes')).toEqual({
        alunoId: 5,
        valor: 50,
        motivo: 'Participação ativa nas aulas',
      }),
    );
    expect(await screen.findByText('50 moedas enviadas para Mariana Alves Pereira')).toBeInTheDocument();
  });

  it('bloqueia valores acima do saldo', async () => {
    mockApi(rotas());
    renderizarApp('/professor/enviar');
    await userEvent.click(await screen.findByRole('radio', { name: /Lucas Oliveira Santos/ }));
    await userEvent.type(screen.getByLabelText(/Quantidade de moedas/), '900');
    await userEvent.type(screen.getByLabelText(/Motivo do reconhecimento/), 'Projeto final');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar 900 moedas' }));
    expect(screen.getByText('Saldo insuficiente: você tem 800 moedas.')).toBeInTheDocument();
  });
});
