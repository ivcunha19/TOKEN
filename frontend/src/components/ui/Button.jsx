import { Loader2 } from 'lucide-react';

const VARIANTES = {
  primario:
    'bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300 disabled:shadow-none',
  secundario:
    'border border-slate-300 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 disabled:text-slate-400',
  fantasma: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-400',
  perigo: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:bg-rose-300',
  'perigo-suave': 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 disabled:text-rose-300',
  moeda: 'bg-coin-400 shadow-sm shadow-coin-500/30 hover:bg-coin-300 text-amber-950 disabled:bg-coin-200 disabled:text-amber-800/60',
};

const TAMANHOS = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-base',
};

export function Button({
  variante = 'primario',
  tamanho = 'md',
  carregando = false,
  icone: Icone,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={`inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...props}
    >
      {carregando ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        Icone && <Icone className="size-4" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
