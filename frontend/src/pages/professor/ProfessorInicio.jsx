import { Link } from 'react-router-dom';
import { ArrowRight, Building, CalendarRange, Coins, Medal, Send, Sigma, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { endpoints } from '../../lib/api';
import { fmtMoedas, fmtNumero, fmtSemestre, primeiroNome, saudacao } from '../../lib/format';
import { resumoProfessor, semestreDe, serieMensal } from '../../lib/estatisticas';
import { Avatar, PageHeader, StatCard } from '../../components/ui/Display';
import { ErroCarregamento, Progresso, Skeleton, Vazio } from '../../components/ui/Feedback';
import { GraficoMensal } from '../../components/GraficoMensal';
import { ListaMovimentacoes } from '../../components/ListaMovimentacoes';

const SERIES = [{ chave: 'saidas', rotulo: 'Moedas enviadas', cor: 'bg-brand-500' }];

export function ProfessorInicio() {
  const { dados, carregando, erro, recarregar } = useApi(
    () => Promise.all([endpoints.professores.me(), endpoints.transacoes.extrato()]),
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

  const [professor, extrato] = dados;
  const resumo = resumoProfessor(extrato);
  const disponivelNoSemestre = professor.saldo + resumo.enviadoNoSemestre;
  const usoSemestre = disponivelNoSemestre ? (resumo.enviadoNoSemestre / disponivelNoSemestre) * 100 : 0;
  const maiorRanking = resumo.ranking[0]?.total || 1;

  return (
    <>
      <PageHeader
        sobretitulo={`${saudacao()}, ${primeiroNome(professor.nome)}!`}
        titulo="Painel do professor"
        descricao="Reconheça o mérito dos seus alunos. Você recebe 1.000 moedas por semestre, e o saldo não utilizado é acumulado."
        acoes={
          <Link
            to="/professor/enviar"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <Send className="size-4" aria-hidden="true" /> Enviar moedas
          </Link>
        }
      />

      <section aria-label="Resumo" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          destaque
          icone={Coins}
          rotulo="Saldo disponível"
          valor={fmtNumero(professor.saldo)}
          detalhe={`+${fmtNumero(professor.valorSemestral)} a cada semestre`}
        />
        <StatCard
          icone={Send}
          rotulo="Enviado neste semestre"
          valor={fmtNumero(resumo.enviadoNoSemestre)}
          detalhe={fmtSemestre(semestreDe())}
        />
        <StatCard
          icone={Users}
          rotulo="Alunos reconhecidos"
          valor={resumo.alunosReconhecidos}
          detalhe={`${resumo.quantidadeEnvios} envio(s) no total`}
        />
        <StatCard icone={Sigma} rotulo="Média por envio" valor={fmtNumero(resumo.mediaPorEnvio)} detalhe="moedas por reconhecimento" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2" aria-labelledby="titulo-grafico">
          <h2 id="titulo-grafico" className="font-bold text-slate-900">
            Moedas enviadas nos últimos 6 meses
          </h2>
          <p className="mb-5 text-sm text-slate-500">Passe o mouse sobre um mês para ver o total</p>
          <GraficoMensal serie={serieMensal(extrato.transacoes, 6)} series={SERIES} titulo="Moedas enviadas por mês" />
        </section>

        <section className="card p-6" aria-labelledby="titulo-semestre">
          <h2 id="titulo-semestre" className="flex items-center gap-2 font-bold text-slate-900">
            <CalendarRange className="size-5 text-brand-500" aria-hidden="true" /> Uso no semestre
          </h2>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 tabular-nums">{Math.round(usoSemestre)}%</p>
          <p className="text-sm text-slate-500">
            {fmtMoedas(resumo.enviadoNoSemestre)} de {fmtMoedas(disponivelNoSemestre)} disponíveis neste semestre
          </p>
          <Progresso valor={usoSemestre} rotulo="Percentual do saldo do semestre já enviado" className="mt-4" />

          <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-start gap-3">
              <Building className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
              <div>
                <dt className="text-xs text-slate-400">Instituição · Departamento</dt>
                <dd className="font-medium text-slate-700">
                  {professor.instituicaoNome} · {professor.departamentoNome}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Coins className="mt-0.5 size-4 text-coin-500" aria-hidden="true" />
              <div>
                <dt className="text-xs text-slate-400">Último crédito semestral</dt>
                <dd className="font-medium text-slate-700">{fmtSemestre(professor.ultimoSemestreCreditado)}</dd>
              </div>
            </div>
          </dl>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-2" aria-labelledby="titulo-ranking">
          <h2 id="titulo-ranking" className="flex items-center gap-2 font-bold text-slate-900">
            <Medal className="size-5 text-coin-500" aria-hidden="true" /> Alunos mais reconhecidos
          </h2>
          {resumo.ranking.length ? (
            <ol className="mt-4 space-y-4">
              {resumo.ranking.slice(0, 5).map((r, i) => (
                <li key={r.chave} className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm font-bold text-slate-400">{i + 1}</span>
                  <Avatar nome={r.chave} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{r.chave}</p>
                      <p className="text-sm font-bold text-slate-700 tabular-nums">{fmtNumero(r.total)}</p>
                    </div>
                    <Progresso
                      valor={(r.total / maiorRanking) * 100}
                      rotulo={`${r.chave}: ${r.total} moedas`}
                      className="mt-1.5 h-1.5"
                    />
                    <p className="mt-1 text-xs text-slate-400">{r.quantidade} reconhecimento(s)</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <Vazio icone={Users} titulo="Nenhum aluno reconhecido ainda" />
          )}
        </section>

        <section className="card p-6 lg:col-span-3" aria-labelledby="titulo-ultimos">
          <div className="flex items-center justify-between">
            <h2 id="titulo-ultimos" className="font-bold text-slate-900">
              Últimos envios
            </h2>
            <Link to="/professor/extrato" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Ver extrato <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {extrato.transacoes.length ? (
            <ListaMovimentacoes transacoes={extrato.transacoes.slice(0, 5)} compacta />
          ) : (
            <Vazio
              icone={Send}
              titulo="Você ainda não enviou moedas"
              descricao="Reconheça a participação ou o desempenho de um aluno."
              acao={
                <Link to="/professor/enviar" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  Enviar moedas
                </Link>
              }
            />
          )}
        </section>
      </div>
    </>
  );
}
