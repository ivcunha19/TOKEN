import { useState } from 'react';
import { CheckCircle2, CircleAlert, ScanLine, Search, TicketCheck } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { endpoints } from '../../lib/api';
import { normalizarCupom } from '../../lib/documentos';
import { fmtData, fmtMoedas } from '../../lib/format';
import { Avatar, PageHeader } from '../../components/ui/Display';
import { Badge, Carregando, ErroCarregamento, Vazio } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/Form';
import { ConfirmDialog } from '../../components/ui/Modal';
import { CodigoCupom } from '../../components/CodigoCupom';

const FILTROS = [
  { id: 'pendentes', rotulo: 'Pendentes', fn: (r) => !r.utilizado },
  { id: 'utilizados', rotulo: 'Utilizados', fn: (r) => r.utilizado },
  { id: 'todos', rotulo: 'Todos', fn: () => true },
];

function ResultadoCupom({ cupom, aoUtilizar, utilizando }) {
  const valido = !cupom.utilizado;
  return (
    <div
      className={`mt-5 animate-pop rounded-2xl border-2 p-5 ${valido ? 'border-emerald-300 bg-emerald-50/60' : 'border-amber-300 bg-amber-50/60'}`}
      role="status"
    >
      <div className="flex items-center gap-2">
        {valido ? (
          <CheckCircle2 className="size-6 text-emerald-600" aria-hidden="true" />
        ) : (
          <CircleAlert className="size-6 text-amber-600" aria-hidden="true" />
        )}
        <p className={`text-lg font-bold ${valido ? 'text-emerald-900' : 'text-amber-900'}`}>
          {valido ? 'Cupom válido' : 'Cupom já utilizado'}
        </p>
      </div>
      <div className="mt-3">
        <CodigoCupom codigo={cupom.codigoCupom} riscado={!valido} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">Vantagem</dt>
          <dd className="font-semibold text-slate-900">{cupom.vantagemNome}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Aluno</dt>
          <dd className="font-semibold text-slate-900">{cupom.alunoNome}</dd>
          <dd className="text-xs text-slate-500">{cupom.alunoEmail}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Resgatado em</dt>
          <dd className="font-medium text-slate-700">{fmtData(cupom.dataHora)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{valido ? 'Valor pago' : 'Utilizado em'}</dt>
          <dd className="font-medium text-slate-700">{valido ? fmtMoedas(cupom.valor) : fmtData(cupom.dataUtilizacao)}</dd>
        </div>
      </dl>
      {valido && (
        <Button className="mt-5 w-full sm:w-auto" icone={TicketCheck} carregando={utilizando} onClick={aoUtilizar}>
          Confirmar troca (marcar como utilizado)
        </Button>
      )}
    </div>
  );
}

/** Conferência de cupons apresentados na loja e histórico de resgates das vantagens da empresa. */
export function CuponsEmpresa() {
  const toast = useToast();
  const { dados: resgates, carregando, erro, recarregar } = useApi(() => endpoints.resgates.listar(), []);
  const [codigo, setCodigo] = useState('');
  const [conferindo, setConferindo] = useState(false);
  const [erroConferencia, setErroConferencia] = useState('');
  const [cupom, setCupom] = useState(null);
  const [utilizando, setUtilizando] = useState(false);
  const [confirmar, setConfirmar] = useState(null);
  const [filtro, setFiltro] = useState('pendentes');

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (carregando && !resgates) return <Carregando />;

  const conferir = async (e) => {
    e.preventDefault();
    const normalizado = normalizarCupom(codigo);
    if (!normalizado) {
      setErroConferencia('Digite o código apresentado pelo aluno.');
      return;
    }
    setConferindo(true);
    setErroConferencia('');
    setCupom(null);
    try {
      setCupom(await endpoints.resgates.conferir(normalizado));
    } catch (err) {
      setErroConferencia(err.message);
    } finally {
      setConferindo(false);
    }
  };

  const utilizar = async (alvo) => {
    setUtilizando(true);
    try {
      const atualizado = await endpoints.resgates.utilizar(alvo.codigoCupom);
      toast.sucesso(`Troca confirmada: ${atualizado.vantagemNome} para ${atualizado.alunoNome}.`);
      if (cupom?.codigoCupom === atualizado.codigoCupom) setCupom(atualizado);
      setConfirmar(null);
      recarregar({ silencioso: true });
    } catch (err) {
      toast.erro(err.message);
    } finally {
      setUtilizando(false);
    }
  };

  const lista = (resgates || []).filter(FILTROS.find((f) => f.id === filtro).fn);
  const contagem = Object.fromEntries(FILTROS.map((f) => [f.id, (resgates || []).filter(f.fn).length]));

  return (
    <>
      <PageHeader
        titulo="Cupons"
        descricao="Confira o código apresentado pelo aluno e confirme a troca. Cada cupom só pode ser usado uma vez."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section className="card h-fit p-6" aria-labelledby="titulo-conferir">
          <h2 id="titulo-conferir" className="flex items-center gap-2 font-bold text-slate-900">
            <ScanLine className="size-5 text-brand-500" aria-hidden="true" /> Conferir cupom
          </h2>
          <form onSubmit={conferir} noValidate className="mt-4 space-y-3">
            <label htmlFor="codigo-cupom" className="text-sm font-semibold text-slate-700">
              Código apresentado pelo aluno
            </label>
            <div className="flex gap-2">
              <input
                id="codigo-cupom"
                className="input font-mono tracking-wider uppercase"
                placeholder="TKN-XXXX-XXXX"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength={20}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={erroConferencia ? 'true' : undefined}
              />
              <Button type="submit" icone={Search} carregando={conferindo}>
                Conferir
              </Button>
            </div>
            <FormError mensagem={erroConferencia} />
          </form>
          {cupom && <ResultadoCupom cupom={cupom} utilizando={utilizando} aoUtilizar={() => utilizar(cupom)} />}
        </section>

        <section className="card p-6" aria-labelledby="titulo-resgates">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="titulo-resgates" className="font-bold text-slate-900">
              Resgates das suas vantagens
            </h2>
            <div role="tablist" aria-label="Filtrar resgates" className="inline-flex rounded-xl bg-slate-100 p-1">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filtro === f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filtro === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.rotulo} <span className="text-slate-400">{contagem[f.id]}</span>
                </button>
              ))}
            </div>
          </div>

          {lista.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {lista.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <Avatar nome={r.alunoNome} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{r.alunoNome}</p>
                    <p className="truncate text-xs text-slate-500">
                      {r.vantagemNome} · {fmtData(r.dataHora)}
                    </p>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-brand-700">{r.codigoCupom}</p>
                  </div>
                  {r.utilizado ? (
                    <Badge icone={CheckCircle2}>Utilizado {fmtData(r.dataUtilizacao)}</Badge>
                  ) : (
                    <Button tamanho="sm" variante="secundario" icone={TicketCheck} onClick={() => setConfirmar(r)}>
                      Validar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Vazio icone={TicketCheck} titulo="Nenhum cupom nesta lista" />
          )}
        </section>
      </div>

      <ConfirmDialog
        aberto={Boolean(confirmar)}
        aoFechar={() => setConfirmar(null)}
        aoConfirmar={() => utilizar(confirmar)}
        carregando={utilizando}
        titulo="Confirmar a troca?"
        descricao={confirmar ? `${confirmar.vantagemNome} · ${confirmar.alunoNome}` : ''}
        textoConfirmar="Marcar como utilizado"
      >
        <p className="text-sm text-slate-600">
          Confira se o aluno apresentou o código <strong className="font-mono">{confirmar?.codigoCupom}</strong>. Depois de
          confirmado, o cupom não pode ser usado novamente.
        </p>
      </ConfirmDialog>
    </>
  );
}
