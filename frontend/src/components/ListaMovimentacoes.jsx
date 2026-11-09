import { ArrowDownLeft, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { fmtData, fmtRelativo, fmtValorComSinal } from '../lib/format';

const ICONES = {
  RECEBIMENTO: { icone: ArrowDownLeft, classe: 'bg-emerald-50 text-emerald-600', rotulo: 'Recebimento' },
  ENVIO: { icone: ArrowUpRight, classe: 'bg-brand-50 text-brand-600', rotulo: 'Envio' },
  RESGATE: { icone: ShoppingBag, classe: 'bg-coin-100 text-amber-700', rotulo: 'Resgate' },
};

function titulo(t) {
  if (t.tipo === 'RECEBIMENTO') return `De ${t.contraparte}`;
  if (t.tipo === 'ENVIO') return `Para ${t.contraparte}`;
  return t.contraparte;
}

/** Lista de movimentações do extrato (ItemExtratoDTO), com ícone por tipo e valor com sinal. */
export function ListaMovimentacoes({ transacoes, compacta = false }) {
  return (
    <ul className="divide-y divide-slate-100">
      {transacoes.map((t, i) => {
        const tipo = ICONES[t.tipo] || ICONES.ENVIO;
        const Icone = tipo.icone;
        return (
          <li key={`${t.dataHora}-${i}`} className={`flex items-start gap-3 ${compacta ? 'py-3' : 'py-4'}`}>
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tipo.classe}`}>
              <Icone className="size-5" aria-hidden="true" />
              <span className="sr-only">{tipo.rotulo}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{titulo(t)}</p>
              <p className={`text-sm text-slate-500 ${compacta ? 'truncate' : ''}`}>{t.descricao}</p>
              {!compacta && t.codigoCupom && (
                <p className="mt-1 font-mono text-xs font-semibold text-brand-700">Cupom {t.codigoCupom}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-sm font-bold tabular-nums ${t.valor >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                {fmtValorComSinal(t.valor)}
              </p>
              <p className="text-xs text-slate-400" title={fmtData(t.dataHora)}>
                <time dateTime={t.dataHora}>{fmtRelativo(t.dataHora)}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
