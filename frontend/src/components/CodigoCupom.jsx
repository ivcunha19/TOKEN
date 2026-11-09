import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** Código do cupom em destaque, com botão de copiar. */
export function CodigoCupom({ codigo, tamanho = 'md', riscado = false }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* navegador sem permissão de área de transferência */
    }
  };

  const grande = tamanho === 'lg';
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border-2 border-dashed bg-white ${
        riscado ? 'border-slate-200' : 'border-brand-300'
      } ${grande ? 'px-5 py-3' : 'px-3 py-1.5'}`}
    >
      <code
        className={`font-mono font-bold tracking-wider ${riscado ? 'text-slate-400 line-through' : 'text-brand-800'} ${
          grande ? 'text-2xl sm:text-3xl' : 'text-sm'
        }`}
      >
        {codigo}
      </code>
      <button
        type="button"
        onClick={copiar}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        aria-label={copiado ? 'Código copiado' : `Copiar código ${codigo}`}
      >
        {copiado ? <Check className="size-4 text-emerald-500" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
