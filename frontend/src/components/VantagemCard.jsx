import { Gift, PackageX, Store } from 'lucide-react';
import { Badge } from './ui/Feedback';
import { Moedas } from './ui/Display';

/** Card de vantagem usado no catálogo do aluno e na vitrine da empresa. `acoes` fica no rodapé. */
export function VantagemCard({ vantagem: v, acoes, destaque, aoAbrir }) {
  const estoqueBaixo = v.disponivel && v.quantidade <= 5;
  return (
    <article className="group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {v.fotoUrl ? (
          <img
            src={v.fotoUrl}
            alt={`Foto: ${v.nome}`}
            loading="lazy"
            className={`size-full object-cover transition duration-500 group-hover:scale-105 ${v.disponivel ? '' : 'grayscale'}`}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-slate-300">
            <Gift className="size-12" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {!v.disponivel && (
            <Badge cor="neutro" icone={PackageX} className="bg-white/95">
              Esgotada
            </Badge>
          )}
          {estoqueBaixo && (
            <Badge cor="aviso" className="bg-amber-50/95">
              Últimas {v.quantidade}
            </Badge>
          )}
          {destaque}
        </div>
        <div className="absolute right-3 bottom-3 rounded-full bg-white/95 px-3 py-1 shadow-sm">
          <Moedas valor={v.custo} className="text-sm text-slate-900" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
          <Store className="size-3.5" aria-hidden="true" />
          {v.empresaNome}
        </p>
        <h3 className="mt-1 text-base leading-snug font-bold text-slate-900">
          {aoAbrir ? (
            <button type="button" onClick={aoAbrir} className="text-left hover:text-brand-700 focus-visible:underline">
              {v.nome}
            </button>
          ) : (
            v.nome
          )}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500">{v.descricao}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500">
          <span>{v.disponivel ? `${v.quantidade} em estoque` : 'Sem estoque no momento'}</span>
        </div>
        {acoes && <div className="mt-4 flex flex-wrap gap-2">{acoes}</div>}
      </div>
    </article>
  );
}
