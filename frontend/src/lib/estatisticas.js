/**
 * Indicadores dos painéis, calculados a partir das respostas da API
 * (extrato, resgates, vantagens). Funções puras para facilitar os testes.
 */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Mesma regra do back-end (classe Semestre): jan–jun = "AAAA-1", jul–dez = "AAAA-2". */
export function semestreDe(data = new Date()) {
  const d = new Date(data);
  return `${d.getFullYear()}-${d.getMonth() < 6 ? 1 : 2}`;
}

const soma = (itens, fn) => itens.reduce((acc, item) => acc + fn(item), 0);

/** Agrupa por chave e devolve [{ chave, total, quantidade }] ordenado pelo total. */
export function rankingPor(itens, chave, valor) {
  const mapa = new Map();
  for (const item of itens) {
    const k = chave(item);
    const atual = mapa.get(k) || { chave: k, total: 0, quantidade: 0 };
    atual.total += valor(item);
    atual.quantidade += 1;
    mapa.set(k, atual);
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total || a.chave.localeCompare(b.chave));
}

/**
 * Série dos últimos N meses (inclui o atual) com entradas e saídas em valor absoluto.
 * Meses sem movimento aparecem com zero, para o gráfico não "pular" meses.
 */
export function serieMensal(transacoes, meses = 6, agora = new Date()) {
  const base = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const serie = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    serie.push({
      chave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      rotulo: MESES[d.getMonth()],
      ano: d.getFullYear(),
      entradas: 0,
      saidas: 0,
    });
  }
  const porChave = new Map(serie.map((m) => [m.chave, m]));
  for (const t of transacoes) {
    const d = new Date(t.dataHora);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const mes = porChave.get(chave);
    if (!mes) continue;
    if (t.valor >= 0) mes.entradas += t.valor;
    else mes.saidas += Math.abs(t.valor);
  }
  return serie;
}

export function resumoAluno(extrato, resgates = []) {
  const transacoes = extrato?.transacoes || [];
  const recebimentos = transacoes.filter((t) => t.tipo === 'RECEBIMENTO');
  const resgatesExtrato = transacoes.filter((t) => t.tipo === 'RESGATE');
  return {
    saldo: extrato?.saldo ?? 0,
    totalRecebido: soma(recebimentos, (t) => t.valor),
    totalGasto: soma(resgatesExtrato, (t) => Math.abs(t.valor)),
    quantidadeReconhecimentos: recebimentos.length,
    professores: new Set(recebimentos.map((t) => t.contraparte)).size,
    cuponsAtivos: resgates.filter((r) => !r.utilizado).length,
    cuponsUtilizados: resgates.filter((r) => r.utilizado).length,
  };
}

export function resumoProfessor(extrato, agora = new Date()) {
  const envios = (extrato?.transacoes || []).filter((t) => t.tipo === 'ENVIO');
  const semestre = semestreDe(agora);
  const doSemestre = envios.filter((t) => semestreDe(t.dataHora) === semestre);
  const totalEnviado = soma(envios, (t) => Math.abs(t.valor));
  return {
    saldo: extrato?.saldo ?? 0,
    totalEnviado,
    enviadoNoSemestre: soma(doSemestre, (t) => Math.abs(t.valor)),
    quantidadeEnvios: envios.length,
    alunosReconhecidos: new Set(envios.map((t) => t.contraparte)).size,
    mediaPorEnvio: envios.length ? Math.round(totalEnviado / envios.length) : 0,
    ranking: rankingPor(envios, (t) => t.contraparte, (t) => Math.abs(t.valor)),
  };
}

export function resumoEmpresa(vantagens = [], resgates = []) {
  const utilizados = resgates.filter((r) => r.utilizado).length;
  return {
    totalVantagens: vantagens.length,
    ativas: vantagens.filter((v) => v.disponivel).length,
    esgotadas: vantagens.filter((v) => !v.disponivel).length,
    estoqueTotal: soma(vantagens, (v) => v.quantidade),
    totalResgates: resgates.length,
    pendentes: resgates.length - utilizados,
    utilizados,
    moedasMovimentadas: soma(resgates, (r) => r.valor),
    taxaUtilizacao: resgates.length ? Math.round((utilizados / resgates.length) * 100) : 0,
    alunosAtendidos: new Set(resgates.map((r) => r.alunoId)).size,
    topVantagens: rankingPor(resgates, (r) => r.vantagemNome, () => 1),
  };
}

/**
 * Próxima vantagem que o aluno ainda não consegue resgatar (a mais barata acima do saldo),
 * com quanto falta e o progresso em %. Retorna null se ele já pode resgatar todas.
 */
export function proximaMeta(vantagens = [], saldo = 0) {
  const alvo = vantagens
    .filter((v) => v.disponivel && v.custo > saldo)
    .sort((a, b) => a.custo - b.custo)[0];
  if (!alvo) return null;
  return {
    vantagem: alvo,
    faltam: alvo.custo - saldo,
    progresso: Math.max(0, Math.min(100, Math.round((saldo / alvo.custo) * 100))),
  };
}

export function podeResgatar(vantagem, saldo) {
  return Boolean(vantagem?.disponivel) && vantagem.custo <= saldo;
}
