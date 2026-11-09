import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, renderizarApp, sessao, USUARIOS } from '../../test/utils';
import { RESGATE } from '../../test/dados';

const UTILIZADO = { ...RESGATE, utilizado: true, dataUtilizacao: '2026-11-09T11:00:00' };

describe('CuponsEmpresa', () => {
  it('confere um cupom válido digitado sem hífens e confirma a troca', async () => {
    const fetchMock = mockApi({
      ...sessao(USUARIOS.empresa),
      'GET /api/resgates': [RESGATE],
      'GET /api/resgates/cupom/TKN-W23N-F7E6': RESGATE,
      'POST /api/resgates/cupom/TKN-W23N-F7E6/utilizar': UTILIZADO,
    });
    renderizarApp('/empresa/cupons');

    await userEvent.type(await screen.findByLabelText('Código apresentado pelo aluno'), 'tknw23nf7e6');
    await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));

    expect(await screen.findByText('Cupom válido')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar troca (marcar como utilizado)' }));

    expect(await screen.findByText('Cupom já utilizado')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([u, o = {}]) => u === '/api/resgates/cupom/TKN-W23N-F7E6/utilizar' && o.method === 'POST')).toBe(true);
  });

  it('mostra o erro quando o cupom não existe', async () => {
    mockApi({
      ...sessao(USUARIOS.empresa),
      'GET /api/resgates': [],
      'GET /api/resgates/cupom/TKN-0000-0000': { status: 404, corpo: { erro: 'Cupom não encontrado.' } },
    });
    renderizarApp('/empresa/cupons');
    await userEvent.type(await screen.findByLabelText('Código apresentado pelo aluno'), 'TKN-0000-0000');
    await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Cupom não encontrado.');
  });

  it('valida um cupom pendente direto da lista, com confirmação', async () => {
    const fetchMock = mockApi({
      ...sessao(USUARIOS.empresa),
      'GET /api/resgates': [RESGATE],
      'POST /api/resgates/cupom/TKN-W23N-F7E6/utilizar': UTILIZADO,
    });
    renderizarApp('/empresa/cupons');
    await userEvent.click(await screen.findByRole('button', { name: 'Validar' }));
    const dialogo = screen.getByRole('dialog', { name: 'Confirmar a troca?' });
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Marcar como utilizado' }));
    await waitFor(() =>
      expect(fetchMock.mock.calls.filter(([u]) => u === '/api/resgates/cupom/TKN-W23N-F7E6/utilizar')).toHaveLength(1),
    );
    expect(await screen.findByText(/Troca confirmada/)).toBeInTheDocument();
  });

  it('separa cupons pendentes e utilizados', async () => {
    mockApi({ ...sessao(USUARIOS.empresa), 'GET /api/resgates': [RESGATE, { ...UTILIZADO, id: 11, codigoCupom: 'TKN-USAD-O000' }] });
    renderizarApp('/empresa/cupons');
    expect(await screen.findByText('TKN-W23N-F7E6')).toBeInTheDocument();
    expect(screen.queryByText('TKN-USAD-O000')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Utilizados/ }));
    expect(screen.getByText('TKN-USAD-O000')).toBeInTheDocument();
  });
});
