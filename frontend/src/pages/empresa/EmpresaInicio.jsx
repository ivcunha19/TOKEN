import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, Coins, Gift, PackageX, Ticket, TicketCheck, TrendingUp, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { endpoints } from '../../lib/api';
import { fmtNumero, fmtRelativo, saudacao } from '../../lib/format';
import { resumoEmpresa } from '../../lib/estatisticas';
import { Avatar, PageHeader, StatCard } from '../../components/ui/Display';
import { Badge, ErroCarregamento, Progresso, Skeleton, Vazio } from '../../components/ui/Feedback';

export function EmpresaInicio() {
  const { dados, carregando, erro, recarregar } = useApi(
    () => Promise.all([endpoints.empresas.me(), endpoints.vantagens.minhas(), endpoints.resgates.listar()]),
    [],
  );

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (carregando || !dados) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-16 w-80" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const [empresa, vantagens, resgates] = dados;
  const r = resumoEmpresa(vantagens, resgates);
  const maiorTop = r.topVantagens[0]?.total || 1;
  const atencao = vantagens.filter((v) => v.quantidade <= 5).sort((a, b) => a.quantidade - b.quantidade);

  return (
    <>
      <PageHeader
        sobretitulo={`${saudacao()}!`}
        titulo={empresa.nome}
        descricao="Acompanhe o desempenho das suas vantagens e confira os cupons apresentados pelos alunos."
        acoes={
          <>
            <Link
              to="/empresa/cupons"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <TicketCheck className="size-4" aria-hidden="true" /> Conferir cupom
            </Link>
            <Link
              to="/empresa/vantagens"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <Gift className="size-4" aria-hidden="true" /> Gerenciar vantagens
            </Link>
          </>
        }
      />

      <section aria-label="Resumo" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          destaque
          icone={Ticket}
          rotulo="Cupons a validar"
          valor={r.pendentes}
          detalhe="aguardando a troca presencial"
        />
        <StatCard icone={TrendingUp} rotulo="Resgates" valor={r.totalResgates} detalhe={`${r.alunosAtendidos} aluno(s) atendido(s)`} />
        <StatCard
          icone={Gift}
          rotulo="Vantagens ativas"
          valor={`${r.ativas}/${r.totalVantagens}`}
          detalhe={`${fmtNumero(r.estoqueTotal)} unidade(s) em estoque`}
        />
        <StatCard icone={Coins} rotulo="Moedas trocadas" valor={fmtNumero(r.moedasMovimentadas)} detalhe="nas suas vantagens" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-6" aria-labelledby="titulo-utilizacao">
          <h2 id="titulo-utilizacao" className="flex items-center gap-2 font-bold text-slate-900">
            <TicketCheck className="size-5 text-brand-500" aria-hidden="true" /> Cupons utilizados
          </h2>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 tabular-nums">{r.taxaUtilizacao}%</p>
          <p className="text-sm text-slate-500">
            {r.utilizados} de {r.totalResgates} cupom(ns) já trocado(s) na loja
          </p>
          <Progresso valor={r.taxaUtilizacao} rotulo="Percentual de cupons utilizados" className="mt-4" />
        </section>

        <section className="card p-6 lg:col-span-2" aria-labelledby="titulo-top">
          <h2 id="titulo-top" className="font-bold text-slate-900">
            Vantagens mais resgatadas
          </h2>
          {r.topVantagens.length ? (
            <ol className="mt-4 space-y-3">
              {r.topVantagens.slice(0, 5).map((t) => (
                <li key={t.chave}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-slate-800">{t.chave}</span>
                    <span className="shrink-0 font-bold text-slate-700 tabular-nums">{t.total} resgate(s)</span>
                  </div>
                  <Progresso valor={(t.total / maiorTop) * 100} rotulo={`${t.chave}: ${t.total} resgates`} className="mt-1.5 h-1.5" />
                </li>
              ))}
            </ol>
          ) : (
            <Vazio icone={TrendingUp} titulo="Nenhum resgate ainda" descricao="Quando um aluno resgatar uma vantagem, ela aparece aqui." />
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-3" aria-labelledby="titulo-recentes">
          <div className="flex items-center justify-between">
            <h2 id="titulo-recentes" className="flex items-center gap-2 font-bold text-slate-900">
              <Users className="size-5 text-slate-400" aria-hidden="true" /> Resgates recentes
            </h2>
            <Link to="/empresa/cupons" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Todos os cupons <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {resgates.length ? (
            <ul className="mt-2 divide-y divide-slate-100">
              {resgates.slice(0, 6).map((x) => (
                <li key={x.id} className="flex items-center gap-3 py-3">
                  <Avatar nome={x.alunoNome} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{x.alunoNome}</p>
                    <p className="truncate text-xs text-slate-500">{x.vantagemNome}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {x.utilizado ? <Badge>Utilizado</Badge> : <Badge cor="aviso">Pendente</Badge>}
                    <p className="mt-1 text-xs text-slate-400">{fmtRelativo(x.dataHora)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Vazio icone={Ticket} titulo="Nenhum cupom emitido" />
          )}
        </section>

        <section className="card p-6 lg:col-span-2" aria-labelledby="titulo-estoque">
          <h2 id="titulo-estoque" className="flex items-center gap-2 font-bold text-slate-900">
            <Boxes className="size-5 text-slate-400" aria-hidden="true" /> Estoque em atenção
          </h2>
          {atencao.length ? (
            <ul className="mt-3 space-y-2">
              {atencao.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className="truncate text-sm font-medium text-slate-800">{v.nome}</span>
                  {v.quantidade === 0 ? (
                    <Badge cor="perigo" icone={PackageX}>
                      Esgotada
                    </Badge>
                  ) : (
                    <Badge cor="aviso">{v.quantidade} restante(s)</Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Vazio icone={Boxes} titulo="Estoque tranquilo" descricao="Todas as vantagens têm mais de 5 unidades." />
          )}
        </section>
      </div>
    </>
  );
}
