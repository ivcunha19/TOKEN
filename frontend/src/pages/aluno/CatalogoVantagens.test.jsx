import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { corpoEnviado, mockApi, renderizarApp, sessao, USUARIOS } from '../../test/utils';
import { ALUNO, RESGATE, VANTAGENS } from '../../test/dados';
import { filtrarCatalogo } from './CatalogoVantagens';

describe('filtrarCatalogo', () => {
  it('busca por texto, filtra por empresa e ordena por custo', () => {
    expect(filtrarCatalogo(VANTAGENS, { busca: 'café' }, 0).map((v) => v.id)).toEqual([1]);
    expect(filtrarCatalogo(VANTAGENS, { empresa: '5' }, 0).map((v) => v.id)).toEqual([3]);
    expect(filtrarCatalogo(VANTAGENS, { ordem: 'custo-desc' }, 0).map((v) => v.id)).toEqual([2, 3, 1]);
    expect(filtrarCatalogo(VANTAGENS, { ordem: 'nome' }, 0).map((v) => v.id)).toEqual([2, 1, 3]);
  });

  it('mostra só o que o aluno pode resgatar', () => {
    expect(filtrarCatalogo(VANTAGENS, { soAcessiveis: true }, 150).map((v) => v.id)).toEqual([1]);
  });
});

describe('CatalogoVantagens', () => {
  const rotas = () => ({
    ...sessao(USUARIOS.aluno),
    'GET /api/vantagens': VANTAGENS,
    'GET /api/alunos/me': ALUNO,
  });

  it('desabilita o resgate sem saldo ou sem estoque e informa quanto falta', async () => {
    mockApi(rotas());
    renderizarApp('/aluno/vantagens');
    const almoco = await screen.findByRole('button', { name: 'Resgatar Almoço executivo grátis' });
    expect(almoco).toBeDisabled();
    expect(almoco).toHaveTextContent('Faltam 50 moedas');
    expect(screen.getByRole('button', { name: 'Resgatar Kit papelaria completo' })).toHaveTextContent('Esgotada');
    expect(screen.getByRole('button', { name: 'Resgatar Café com pão de queijo' })).toBeEnabled();
  });

  it('confirma o resgate, mostra o cupom gerado e o saldo restante', async () => {
    const fetchMock = mockApi({ ...rotas(), 'POST /api/resgates': RESGATE });
    renderizarApp('/aluno/vantagens');

    await userEvent.click(await screen.findByRole('button', { name: 'Resgatar Café com pão de queijo' }));
    const confirmacao = screen.getByRole('dialog', { name: 'Confirmar resgate' });
    expect(within(confirmacao).getByText('110 moedas')).toBeInTheDocument();
    await userEvent.click(within(confirmacao).getByRole('button', { name: 'Confirmar resgate' }));

    const sucesso = await screen.findByRole('dialog', { name: 'Resgate realizado!' });
    expect(within(sucesso).getByText('TKN-W23N-F7E6')).toBeInTheDocument();
    expect(within(sucesso).getByText('110 moedas')).toBeInTheDocument();
    expect(corpoEnviado(fetchMock, 'POST', '/api/resgates')).toEqual({ vantagemId: 1 });

    await userEvent.click(within(sucesso).getByRole('button', { name: 'Ver meus cupons' }));
    await waitFor(() => expect(screen.getByTestId('rota-atual')).toHaveTextContent('/aluno/cupons'));
  });

  it('exibe o erro do servidor quando o resgate falha', async () => {
    mockApi({ ...rotas(), 'POST /api/resgates': { status: 422, corpo: { erro: 'Vantagem esgotada.' } } });
    renderizarApp('/aluno/vantagens');
    await userEvent.click(await screen.findByRole('button', { name: 'Resgatar Café com pão de queijo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar resgate' }));
    expect(await screen.findByText('Vantagem esgotada.')).toBeInTheDocument();
  });

  it('filtra pelo checkbox "Só o que posso resgatar"', async () => {
    mockApi(rotas());
    renderizarApp('/aluno/vantagens');
    await screen.findByText('Almoço executivo grátis');
    await userEvent.click(screen.getByLabelText('Só o que posso resgatar'));
    expect(screen.queryByText('Almoço executivo grátis')).not.toBeInTheDocument();
    expect(screen.getByText('1 vantagem(ns) encontrada(s)')).toBeInTheDocument();
  });
});
