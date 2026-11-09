import { describe, expect, it } from 'vitest';
import { podeResgatar, proximaMeta, rankingPor, resumoAluno, resumoEmpresa, resumoProfessor, semestreDe, serieMensal } from './estatisticas';
import { EXTRATO_ALUNO, RESGATE, VANTAGENS } from '../test/dados';

describe('estatisticas', () => {
  it('calcula o semestre com a mesma regra do back-end', () => {
    expect(semestreDe(new Date(2026, 0, 10))).toBe('2026-1');
    expect(semestreDe(new Date(2026, 5, 30))).toBe('2026-1');
    expect(semestreDe(new Date(2026, 6, 1))).toBe('2026-2');
  });

  it('resume o extrato do aluno', () => {
    const r = resumoAluno(EXTRATO_ALUNO, [RESGATE, { ...RESGATE, id: 11, utilizado: true }]);
    expect(r.totalRecebido).toBe(190);
    expect(r.totalGasto).toBe(40);
    expect(r.quantidadeReconhecimentos).toBe(2);
    expect(r.professores).toBe(2);
    expect(r.cuponsAtivos).toBe(1);
    expect(r.cuponsUtilizados).toBe(1);
  });

  it('monta a série mensal com meses vazios e separa entradas de saídas', () => {
    const serie = serieMensal(EXTRATO_ALUNO.transacoes, 3, new Date(2026, 10, 9));
    expect(serie.map((m) => m.chave)).toEqual(['2026-09', '2026-10', '2026-11']);
    expect(serie[0]).toMatchObject({ entradas: 40, saidas: 0 });
    expect(serie[1]).toMatchObject({ entradas: 0, saidas: 0 });
    expect(serie[2]).toMatchObject({ entradas: 150, saidas: 40, rotulo: 'nov' });
  });

  it('resume os envios do professor e o semestre atual', () => {
    const extrato = {
      saldo: 700,
      transacoes: [
        { tipo: 'ENVIO', valor: -100, contraparte: 'Ana', dataHora: '2026-11-01T10:00:00' },
        { tipo: 'ENVIO', valor: -50, contraparte: 'Bruno', dataHora: '2026-10-01T10:00:00' },
        { tipo: 'ENVIO', valor: -150, contraparte: 'Ana', dataHora: '2026-03-01T10:00:00' },
      ],
    };
    const r = resumoProfessor(extrato, new Date(2026, 10, 9));
    expect(r.totalEnviado).toBe(300);
    expect(r.enviadoNoSemestre).toBe(150);
    expect(r.alunosReconhecidos).toBe(2);
    expect(r.mediaPorEnvio).toBe(100);
    expect(r.ranking[0]).toEqual({ chave: 'Ana', total: 250, quantidade: 2 });
  });

  it('resume vantagens e resgates da empresa', () => {
    const resgates = [RESGATE, { ...RESGATE, id: 11, utilizado: true, alunoId: 5 }];
    const r = resumoEmpresa(VANTAGENS, resgates);
    expect(r.ativas).toBe(2);
    expect(r.esgotadas).toBe(1);
    expect(r.estoqueTotal).toBe(103);
    expect(r.pendentes).toBe(1);
    expect(r.taxaUtilizacao).toBe(50);
    expect(r.alunosAtendidos).toBe(2);
    expect(r.moedasMovimentadas).toBe(80);
    expect(r.topVantagens[0]).toMatchObject({ chave: 'Café com pão de queijo', total: 2 });
  });

  it('encontra a próxima meta do aluno', () => {
    expect(proximaMeta(VANTAGENS, 150)).toMatchObject({ faltam: 50, progresso: 75, vantagem: { id: 2 } });
    expect(proximaMeta(VANTAGENS, 500)).toBeNull();
  });

  it('só permite resgatar vantagem disponível e com saldo suficiente', () => {
    expect(podeResgatar(VANTAGENS[0], 40)).toBe(true);
    expect(podeResgatar(VANTAGENS[0], 39)).toBe(false);
    expect(podeResgatar(VANTAGENS[2], 1000)).toBe(false);
  });

  it('ordena o ranking pelo total e desempata pelo nome', () => {
    const r = rankingPor([{ n: 'b' }, { n: 'a' }], (x) => x.n, () => 1);
    expect(r.map((x) => x.chave)).toEqual(['a', 'b']);
  });
});
