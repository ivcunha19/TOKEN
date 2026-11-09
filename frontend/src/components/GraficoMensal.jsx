import { useState } from 'react';
import { fmtNumero } from '../lib/format';

/** Arredonda o topo do eixo para um valor "redondo" (1, 2, 2.5, 5 × 10^n). */
export function topoDoEixo(max) {
  if (max <= 0) return 10;
  const potencia = 10 ** Math.floor(Math.log10(max));
  const passo = [1, 2, 2.5, 5, 10].find((m) => m * potencia >= max);
  return passo * potencia;
}

/**
 * Barras agrupadas por mês (HTML/CSS). Uma série por chave de `series`.
 * Acessível: legenda, tooltip por mês (hover/foco) e tabela equivalente para leitores de tela.
 */
export function GraficoMensal({ serie, series, titulo }) {
  const [ativo, setAtivo] = useState(null);
  const max = Math.max(0, ...serie.flatMap((m) => series.map((s) => m[s.chave])));
  const topo = topoDoEixo(max);
  const linhas = [topo, topo / 2, 0];

  return (
    <figure className="relative">
      <figcaption className="sr-only">{titulo}</figcaption>

      {series.length > 1 && (
        <ul className="mb-4 flex flex-wrap gap-4 text-xs text-slate-600" aria-hidden="true">
          {series.map((s) => (
            <li key={s.chave} className="flex items-center gap-1.5">
              <span className={`size-2.5 rounded-sm ${s.cor}`} />
              {s.rotulo}
            </li>
          ))}
        </ul>
      )}

      <div className="relative" aria-hidden="true">
        <div className="pointer-events-none absolute inset-0 bottom-6 flex flex-col justify-between">
          {linhas.map((v) => (
            <div key={v} className="flex h-0 items-center gap-2">
              <span className="w-10 text-right text-[11px] text-slate-400 tabular-nums">{fmtNumero(v)}</span>
              <span className={`h-px flex-1 ${v === 0 ? 'bg-slate-300' : 'bg-slate-100'}`} />
            </div>
          ))}
        </div>

        <div className="relative ml-12 flex h-48 items-stretch gap-1 sm:gap-2">
          {serie.map((mes) => (
            <div
              key={mes.chave}
              className="relative flex flex-1 flex-col"
              onMouseEnter={() => setAtivo(mes.chave)}
              onMouseLeave={() => setAtivo(null)}
            >
              <div
                className={`flex flex-1 items-end justify-center gap-0.5 rounded-t-lg pb-px transition-colors ${
                  ativo === mes.chave ? 'bg-slate-100/80' : ''
                }`}
              >
                {series.map((s) => (
                  <div
                    key={s.chave}
                    className={`w-full max-w-5 rounded-t ${s.cor} transition-[height] duration-500`}
                    style={{ height: `${(mes[s.chave] / topo) * 100}%`, minHeight: mes[s.chave] > 0 ? 3 : 0 }}
                  />
                ))}
              </div>
              <span className="h-6 pt-1.5 text-center text-[11px] font-medium text-slate-500 capitalize">{mes.rotulo}</span>

              {ativo === mes.chave && (
                <div className="absolute bottom-full left-1/2 z-10 mb-1 w-max -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
                  <p className="mb-1 font-semibold capitalize">
                    {mes.rotulo} {mes.ano}
                  </p>
                  {series.map((s) => (
                    <p key={s.chave} className="flex items-center gap-1.5 tabular-nums">
                      <span className={`size-2 rounded-sm ${s.cor}`} />
                      {s.rotulo}: <strong>{fmtNumero(mes[s.chave])}</strong>
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sr-only">
        <table>
        <caption>{titulo}</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            {series.map((s) => (
              <th key={s.chave} scope="col">
                {s.rotulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {serie.map((mes) => (
            <tr key={mes.chave}>
              <th scope="row">
                {mes.rotulo} {mes.ano}
              </th>
              {series.map((s) => (
                <td key={s.chave}>{mes[s.chave]}</td>
              ))}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </figure>
  );
}
