import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, CalendarClock, CheckCircle2, Gift, Store, Ticket } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { endpoints } from '../../lib/api';
import { fmtData, fmtMoedas } from '../../lib/format';
import { PageHeader } from '../../components/ui/Display';
import { Badge, Carregando, ErroCarregamento, Vazio } from '../../components/ui/Feedback';
import { CodigoCupom } from '../../components/CodigoCupom';

const FILTROS = [
  { id: 'ativos', rotulo: 'Para usar', fn: (r) => !r.utilizado },
  { id: 'utilizados', rotulo: 'Utilizados', fn: (r) => r.utilizado },
  { id: 'todos', rotulo: 'Todos', fn: () => true },
];

export function MeusCupons() {
  const { dados: resgates, carregando, erro, recarregar } = useApi(() => endpoints.resgates.listar(), []);
  const [filtro, setFiltro] = useState('ativos');

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (carregando || !resgates) return <Carregando />;

  const contagem = Object.fromEntries(FILTROS.map((f) => [f.id, resgates.filter(f.fn).length]));
  const lista = resgates.filter(FILTROS.find((f) => f.id === filtro).fn);

  return (
    <>
      <PageHeader
        titulo="Meus cupons"
        descricao="Apresente o código na empresa parceira para usar a vantagem. A empresa marca o cupom como utilizado na hora da troca."
      />

      <div role="tablist" aria-label="Filtrar cupons" className="mb-6 inline-flex rounded-2xl bg-slate-200/60 p-1">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filtro === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {f.rotulo} <span className="ml-1 text-xs text-slate-400">{contagem[f.id]}</span>
          </button>
        ))}
      </div>

      {lista.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {lista.map((r) => (
            <li
              key={r.id}
              className={`card relative overflow-hidden p-5 ${r.utilizado ? 'opacity-80' : ''}`}
            >
              <span
                className={`absolute inset-y-0 left-0 w-1.5 ${r.utilizado ? 'bg-slate-200' : 'bg-gradient-to-b from-brand-500 to-violet-500'}`}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                    <Store className="size-3.5" aria-hidden="true" /> {r.empresaNome}
                  </p>
                  <h2 className="mt-0.5 font-bold text-slate-900">{r.vantagemNome}</h2>
                </div>
                {r.utilizado ? (
                  <Badge icone={CheckCircle2}>Utilizado</Badge>
                ) : (
                  <Badge cor="sucesso" icone={Ticket}>
                    Válido
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <CodigoCupom codigo={r.codigoCupom} riscado={r.utilizado} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="flex items-center gap-1 text-slate-400">
                    <CalendarClock className="size-3.5" aria-hidden="true" /> Resgatado em
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-700">{fmtData(r.dataHora)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-slate-400">
                    {r.utilizado ? <CalendarCheck className="size-3.5" aria-hidden="true" /> : <Gift className="size-3.5" aria-hidden="true" />}
                    {r.utilizado ? 'Utilizado em' : 'Custo'}
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-700">{r.utilizado ? fmtData(r.dataUtilizacao) : fmtMoedas(r.valor)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card">
          <Vazio
            icone={Ticket}
            titulo={filtro === 'ativos' ? 'Nenhum cupom para usar' : 'Nenhum cupom aqui'}
            descricao="Resgate uma vantagem no catálogo para receber um cupom."
            acao={
              <Link to="/aluno/vantagens" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Ver catálogo
              </Link>
            }
          />
        </div>
      )}
    </>
  );
}
