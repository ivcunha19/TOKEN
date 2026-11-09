import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Coins, ReceiptText, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { endpoints } from '../lib/api';
import { fmtNumero } from '../lib/format';
import { PageHeader, StatCard } from '../components/ui/Display';
import { Carregando, ErroCarregamento, Vazio } from '../components/ui/Feedback';
import { ListaMovimentacoes } from '../components/ListaMovimentacoes';

const PERIODOS = [
  { id: 'todos', rotulo: 'Todo o período', dias: null },
  { id: '30', rotulo: 'Últimos 30 dias', dias: 30 },
  { id: '90', rotulo: 'Últimos 90 dias', dias: 90 },
];

const TIPOS_POR_PERFIL = {
  ALUNO: [
    { id: '', rotulo: 'Tudo' },
    { id: 'RECEBIMENTO', rotulo: 'Recebimentos' },
    { id: 'RESGATE', rotulo: 'Resgates' },
  ],
  PROFESSOR: [{ id: '', rotulo: 'Envios' }],
};

/** Agrupa as movimentações por mês ("novembro de 2026"), mantendo a ordem (mais recentes primeiro). */
export function agruparPorMes(transacoes) {
  const grupos = [];
  for (const t of transacoes) {
    const d = new Date(t.dataHora);
    const chave = `${d.getFullYear()}-${d.getMonth()}`;
    let grupo = grupos[grupos.length - 1];
    if (!grupo || grupo.chave !== chave) {
      grupo = { chave, rotulo: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), itens: [], total: 0 };
      grupos.push(grupo);
    }
    grupo.itens.push(t);
    grupo.total += t.valor;
  }
  return grupos;
}

export function filtrarExtrato(transacoes, { tipo = '', periodo = 'todos', busca = '' }, agora = new Date()) {
  const dias = PERIODOS.find((p) => p.id === periodo)?.dias;
  const limite = dias ? agora.getTime() - dias * 86400000 : null;
  const termo = busca.trim().toLowerCase();
  return transacoes
    .filter((t) => !tipo || t.tipo === tipo)
    .filter((t) => !limite || new Date(t.dataHora).getTime() >= limite)
    .filter((t) => !termo || `${t.descricao} ${t.contraparte} ${t.codigoCupom || ''}`.toLowerCase().includes(termo));
}

/** Extrato (US06): saldo, totais e histórico filtrável — mesmo componente para aluno e professor. */
export function ExtratoPage() {
  const { usuario } = useAuth();
  const ehProfessor = usuario?.tipo === 'PROFESSOR';
  const { dados: extrato, carregando, erro, recarregar } = useApi(() => endpoints.transacoes.extrato(), []);
  const [filtros, setFiltros] = useState({ tipo: '', periodo: 'todos', busca: '' });

  const filtradas = useMemo(() => filtrarExtrato(extrato?.transacoes || [], filtros), [extrato, filtros]);
  const grupos = useMemo(() => agruparPorMes(filtradas), [filtradas]);

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (carregando || !extrato) return <Carregando />;

  const entradas = filtradas.filter((t) => t.valor > 0).reduce((s, t) => s + t.valor, 0);
  const saidas = filtradas.filter((t) => t.valor < 0).reduce((s, t) => s + Math.abs(t.valor), 0);
  const tipos = TIPOS_POR_PERFIL[usuario?.tipo] || TIPOS_POR_PERFIL.ALUNO;

  return (
    <>
      <PageHeader
        titulo={ehProfessor ? 'Extrato de envios' : 'Extrato de moedas'}
        descricao={
          ehProfessor
            ? 'Todas as moedas que você enviou aos alunos, com o motivo de cada reconhecimento.'
            : 'Moedas recebidas dos professores e trocadas por vantagens.'
        }
      />

      <section aria-label="Totais" className={`grid gap-4 ${ehProfessor ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        <StatCard destaque icone={Coins} rotulo="Saldo atual" valor={fmtNumero(extrato.saldo)} detalhe="moedas" />
        {!ehProfessor && (
          <StatCard icone={ArrowDownLeft} rotulo="Entradas no período" valor={`+${fmtNumero(entradas)}`} />
        )}
        <StatCard
          icone={ArrowUpRight}
          rotulo={ehProfessor ? 'Enviado no período' : 'Saídas no período'}
          valor={fmtNumero(saidas)}
          detalhe={`${filtradas.length} movimentação(ões)`}
        />
      </section>

      <section className="card mt-6 p-4 sm:p-6" aria-labelledby="titulo-historico">
        <h2 id="titulo-historico" className="sr-only">
          Histórico
        </h2>
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center">
          {tipos.length > 1 && (
            <div role="group" aria-label="Tipo de movimentação" className="inline-flex rounded-xl bg-slate-100 p-1">
              {tipos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={filtros.tipo === t.id}
                  onClick={() => setFiltros((f) => ({ ...f, tipo: t.id }))}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    filtros.tipo === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.rotulo}
                </button>
              ))}
            </div>
          )}
          <label className="relative flex-1">
            <span className="sr-only">Buscar no extrato</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              className="input pl-10"
              placeholder={ehProfessor ? 'Buscar por aluno ou motivo' : 'Buscar por professor, empresa, motivo ou cupom'}
              value={filtros.busca}
              onChange={(e) => setFiltros((f) => ({ ...f, busca: e.target.value }))}
            />
          </label>
          <label>
            <span className="sr-only">Período</span>
            <select
              className="input lg:w-48"
              value={filtros.periodo}
              onChange={(e) => setFiltros((f) => ({ ...f, periodo: e.target.value }))}
            >
              {PERIODOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>

        {grupos.length ? (
          grupos.map((g) => (
            <div key={g.chave} className="pt-5">
              <div className="flex items-baseline justify-between px-1">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">{g.rotulo}</h3>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  {g.total > 0 ? '+' : ''}
                  {fmtNumero(g.total)} no mês
                </span>
              </div>
              <ListaMovimentacoes transacoes={g.itens} />
            </div>
          ))
        ) : (
          <Vazio
            icone={ReceiptText}
            titulo={extrato.transacoes.length ? 'Nada encontrado com esses filtros' : 'Nenhuma movimentação até o momento'}
            descricao={
              extrato.transacoes.length
                ? 'Altere o período, o tipo ou a busca.'
                : ehProfessor
                  ? 'Envie moedas para reconhecer o mérito de um aluno.'
                  : 'Quando receber moedas, elas aparecem aqui.'
            }
          />
        )}
      </section>
    </>
  );
}
