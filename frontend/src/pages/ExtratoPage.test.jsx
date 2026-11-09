import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, renderizarApp, sessao, USUARIOS } from '../test/utils';
import { EXTRATO_ALUNO, EXTRATO_PROFESSOR } from '../test/dados';
import { agruparPorMes, filtrarExtrato } from './ExtratoPage';

describe('funções do extrato', () => {
  it('agrupa por mês somando o saldo do mês', () => {
    const grupos = agruparPorMes(EXTRATO_ALUNO.transacoes);
    expect(grupos).toHaveLength(2);
    expect(grupos[0].total).toBe(110);
    expect(grupos[0].itens).toHaveLength(2);
    expect(grupos[1].total).toBe(40);
  });

  it('filtra por tipo, período e texto', () => {
    const agora = new Date('2026-11-09T12:00:00');
    const t = EXTRATO_ALUNO.transacoes;
    expect(filtrarExtrato(t, { tipo: 'RESGATE' }, agora)).toHaveLength(1);
    expect(filtrarExtrato(t, { periodo: '30' }, agora)).toHaveLength(2);
    expect(filtrarExtrato(t, { busca: 'tkn-aaaa' }, agora)).toHaveLength(1);
    expect(filtrarExtrato(t, { busca: 'ricardo' }, agora)).toHaveLength(1);
  });
});

describe('ExtratoPage', () => {
  it('mostra saldo, entradas, saídas e o cupom de cada resgate do aluno', async () => {
    mockApi({ ...sessao(USUARIOS.aluno), 'GET /api/extrato': EXTRATO_ALUNO });
    renderizarApp('/aluno/extrato');
    expect(await screen.findByText('Extrato de moedas')).toBeInTheDocument();
    expect(screen.getByText('+190')).toBeInTheDocument();
    expect(screen.getByText('Cupom TKN-AAAA-BBBB')).toBeInTheDocument();
    expect(screen.getByText('De Profa. Milena Menezes Adão')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Resgates' }));
    expect(screen.queryByText('De Profa. Milena Menezes Adão')).not.toBeInTheDocument();
    expect(screen.getByText('Restaurante Sabor do Campus')).toBeInTheDocument();
  });

  it('para o professor, mostra apenas os envios e para quem foram', async () => {
    mockApi({ ...sessao(USUARIOS.professor), 'GET /api/extrato': EXTRATO_PROFESSOR });
    renderizarApp('/professor/extrato');
    expect(await screen.findByText('Extrato de envios')).toBeInTheDocument();
    expect(screen.getByText('Para Lucas Oliveira Santos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resgates' })).not.toBeInTheDocument();
  });

  it('informa quando não há movimentações', async () => {
    mockApi({ ...sessao(USUARIOS.aluno), 'GET /api/extrato': { saldo: 0, transacoes: [] } });
    renderizarApp('/aluno/extrato');
    expect(await screen.findByText('Nenhuma movimentação até o momento')).toBeInTheDocument();
  });
});
