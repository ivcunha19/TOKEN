import { CircleAlert, Loader2, RotateCw } from 'lucide-react';
import { Button } from './Button';

const BADGES = {
  neutro: 'bg-slate-100 text-slate-700 ring-slate-200',
  sucesso: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  aviso: 'bg-amber-50 text-amber-800 ring-amber-200',
  perigo: 'bg-rose-50 text-rose-700 ring-rose-200',
  marca: 'bg-brand-50 text-brand-700 ring-brand-200',
  moeda: 'bg-coin-100 text-amber-900 ring-coin-300',
};

export function Badge({ cor = 'neutro', icone: Icone, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BADGES[cor]} ${className}`}
    >
      {Icone && <Icone className="size-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Carregando({ texto = 'Carregando...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500" role="status">
      <Loader2 className="size-5 animate-spin text-brand-500" aria-hidden="true" />
      {texto}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} aria-hidden="true" />;
}

export function ErroCarregamento({ erro, aoTentarNovamente }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center" role="alert">
      <div className="rounded-full bg-rose-50 p-3 text-rose-500">
        <CircleAlert className="size-6" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold text-slate-900">Não foi possível carregar os dados</p>
        <p className="mt-1 text-sm text-slate-500">{erro?.message}</p>
      </div>
      {aoTentarNovamente && (
        <Button variante="secundario" icone={RotateCw} onClick={() => aoTentarNovamente()}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function Vazio({ icone: Icone, titulo, descricao, acao, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 px-6 py-12 text-center ${className}`}>
      {Icone && (
        <div className="rounded-2xl bg-brand-50 p-3.5 text-brand-500">
          <Icone className="size-7" aria-hidden="true" />
        </div>
      )}
      <div className="max-w-sm">
        <p className="font-semibold text-slate-900">{titulo}</p>
        {descricao && <p className="mt-1 text-sm text-slate-500">{descricao}</p>}
      </div>
      {acao}
    </div>
  );
}

/** Barra de progresso (medidor): valor de 0 a 100, com rótulo acessível. */
export function Progresso({ valor, rotulo, cor = 'bg-brand-500', className = '' }) {
  const v = Math.max(0, Math.min(100, Math.round(valor || 0)));
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-200/80 ${className}`}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={rotulo}
    >
      <div className={`h-full rounded-full transition-[width] duration-700 ${cor}`} style={{ width: `${v}%` }} />
    </div>
  );
}
