import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { mockApi, renderizarApp, sessao, USUARIOS } from '../test/utils';
import { ALUNO, EXTRATO_ALUNO, EXTRATO_PROFESSOR, PROFESSOR, RESGATE, VANTAGENS } from '../test/dados';
import { topoDoEixo } from '../components/GraficoMensal';

describe('painéis iniciais', () => {
  it('aluno: saldo, totais, próxima meta e vantagens já acessíveis', async () => {
    mockApi({
      ...sessao(USUARIOS.aluno),
      'GET /api/alunos/me': ALUNO,
      'GET /api/extrato': EXTRATO_ALUNO,
      'GET /api/resgates': [RESGATE],
      'GET /api/vantagens': VANTAGENS,
    });
    renderizarApp('/aluno');
    const resumo = await screen.findByRole('region', { name: 'Resumo' });
    expect(within(resumo).getByText('150')).toBeInTheDocument();
    expect(within(resumo).getByText('190')).toBeInTheDocument();
    expect(within(resumo).getByText('2 reconhecimento(s) de 2 professor(es)')).toBeInTheDocument();

    const meta = screen.getByRole('region', { name: 'Próxima meta' });
    expect(within(meta).getByText('Almoço executivo grátis')).toBeInTheDocument();
    expect(within(meta).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');

    const acessiveis = screen.getByRole('region', { name: 'Já dá para resgatar' });
    expect(within(acessiveis).getByText('Café com pão de queijo')).toBeInTheDocument();
    expect(within(acessiveis).queryByText('Almoço executivo grátis')).not.toBeInTheDocument();
  });

  it('professor: saldo, ranking de alunos e dados do semestre', async () => {
    mockApi({
      ...sessao(USUARIOS.professor),
      'GET /api/professores/me': PROFESSOR,
      'GET /api/extrato': EXTRATO_PROFESSOR,
    });
    renderizarApp('/professor');
    const resumo = await screen.findByRole('region', { name: 'Resumo' });
    expect(within(resumo).getByText('800')).toBeInTheDocument();
    expect(within(resumo).getByText('+1.000 a cada semestre')).toBeInTheDocument();
    const ranking = screen.getByRole('region', { name: 'Alunos mais reconhecidos' });
    expect(within(ranking).getByText('Lucas Oliveira Santos')).toBeInTheDocument();
    const semestre = screen.getByRole('region', { name: 'Uso no semestre' });
    expect(within(semestre).getByText('2º semestre de 2026')).toBeInTheDocument();
    expect(within(semestre).getByText('PUC Minas · Computação')).toBeInTheDocument();
  });

  it('empresa: cupons a validar, taxa de utilização e estoque em atenção', async () => {
    mockApi({
      ...sessao(USUARIOS.empresa),
      'GET /api/empresas/me': { id: 6, nome: 'Restaurante Sabor do Campus', email: 'r@x.com', login: 'restaurante.campus', cnpj: '98.765.432/0001-98', descricao: 'Restaurante' },
      'GET /api/vantagens/minhas': VANTAGENS,
      'GET /api/resgates': [RESGATE, { ...RESGATE, id: 11, utilizado: true }],
    });
    renderizarApp('/empresa');
    const resumo = await screen.findByRole('region', { name: 'Resumo' });
    expect(within(resumo).getByText('2/3')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    const estoque = screen.getByRole('region', { name: 'Estoque em atenção' });
    expect(within(estoque).getByText('Esgotada')).toBeInTheDocument();
    expect(within(estoque).getByText('3 restante(s)')).toBeInTheDocument();
  });
});

describe('GraficoMensal', () => {
  it('arredonda o topo do eixo para um valor redondo', () => {
    expect(topoDoEixo(0)).toBe(10);
    expect(topoDoEixo(7)).toBe(10);
    expect(topoDoEixo(130)).toBe(200);
    expect(topoDoEixo(240)).toBe(250);
    expect(topoDoEixo(1000)).toBe(1000);
  });
});
