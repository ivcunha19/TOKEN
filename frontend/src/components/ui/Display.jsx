import { Coins } from 'lucide-react';
import { fmtNumero, iniciais } from '../../lib/format';

export function PageHeader({ titulo, descricao, acoes, sobretitulo }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {sobretitulo && <p className="mb-1 text-sm font-semibold text-brand-600">{sobretitulo}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{titulo}</h1>
        {descricao && <p className="mt-1.5 max-w-2xl text-sm text-slate-500 sm:text-base">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}

/** Indicador numérico (stat tile): rótulo, valor em destaque e detalhe opcional. */
export function StatCard({ rotulo, valor, detalhe, icone: Icone, destaque = false, className = '' }) {
  if (destaque) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-5 text-white shadow-lift ${className}`}
      >
        <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute -right-2 -bottom-12 size-28 rounded-full bg-coin-400/20" aria-hidden="true" />
        <div className="relative">
          <p className="flex items-center gap-2 text-sm font-medium text-brand-100">
            {Icone && <Icone className="size-4" aria-hidden="true" />}
            {rotulo}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">{valor}</p>
          {detalhe && <p className="mt-1 text-sm text-brand-100">{detalhe}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className={`card p-5 ${className}`}>
      <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
        {Icone && <Icone className="size-4 text-slate-400" aria-hidden="true" />}
        {rotulo}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-slate-500">{detalhe}</p>}
    </div>
  );
}

const CORES_AVATAR = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
];

export function Avatar({ nome, tamanho = 'md' }) {
  const tamanhos = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg' };
  const indice = [...String(nome || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % CORES_AVATAR.length;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${tamanhos[tamanho]} ${CORES_AVATAR[indice]}`}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
}

/** Valor em moedas com o ícone de moeda. */
export function Moedas({ valor, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 font-bold tabular-nums ${className}`}>
      <Coins className="size-4 text-coin-500" aria-hidden="true" />
      {fmtNumero(valor)}
      <span className="sr-only"> {Math.abs(valor) === 1 ? 'moeda' : 'moedas'}</span>
    </span>
  );
}

export function Logo({ claro = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-md shadow-brand-600/30">
        <span className="absolute inset-1.5 rounded-full border-2 border-coin-400" aria-hidden="true" />
        <span className="relative text-sm font-black text-white">T</span>
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${claro ? 'text-white' : 'text-slate-900'}`}>
        TOKEN
      </span>
    </span>
  );
}
