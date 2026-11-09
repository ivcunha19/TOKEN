import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Gift, GraduationCap, HandCoins, ReceiptText, Target, Ticket } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { endpoints } from '../../lib/api';
import { fmtMoedas, fmtNumero, primeiroNome, saudacao } from '../../lib/format';
import { podeResgatar, proximaMeta, resumoAluno, serieMensal } from '../../lib/estatisticas';
import { PageHeader, StatCard, Moedas } from '../../components/ui/Display';
import { ErroCarregamento, Progresso, Skeleton, Vazio } from '../../components/ui/Feedback';
import { GraficoMensal } from '../../components/GraficoMensal';
import { ListaMovimentacoes } from '../../components/ListaMovimentacoes';

const SERIES = [
  { chave: 'entradas', rotulo: 'Moedas recebidas', cor: 'bg-brand-500' },
  { chave: 'saidas', rotulo: 'Moedas trocadas', cor: 'bg-coin-400' },
];

export function AlunoInicio() {
  const { dados, carregando, erro, recarregar } = useApi(
    () =>
      Promise.all([
        endpoints.alunos.me(),
        endpoints.transacoes.extrato(),
        endpoints.resgates.listar(),
        endpoints.vantagens.catalogo(),
      ]),
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
        <Skeleton className="h-72" />
      </div>
    );
  }

  const [aluno, extrato, resgates, vantagens] = dados;
  const resumo = resumoAluno(extrato, resgates);
  const meta = proximaMeta(vantagens, aluno.saldo);
  const acessiveis = vantagens.filter((v) => podeResgatar(v, aluno.saldo)).slice(0, 3);
  const serie = serieMensal(extrato.transacoes, 6);

  return (
    <>
      <PageHeader
        sobretitulo={`${saudacao()}, ${primeiroNome(aluno.nome)}!`}
        titulo="Seu painel de moedas"
        descricao={
          <span className="flex items-start gap-2">
            <GraduationCap className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <span>
              {aluno.cursoNome} · {aluno.instituicaoNome}
              {aluno.matricula && <span className="text-slate-400"> · matrícula {aluno.matricula}</span>}
            </span>
          </span>
        }
        acoes={
          <Link
            to="/aluno/vantagens"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <Gift className="size-4" aria-hidden="true" /> Trocar moedas
          </Link>
        }
      />

      <section aria-label="Resumo" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard destaque icone={Coins} rotulo="Saldo disponível" valor={fmtNumero(aluno.saldo)} detalhe="moedas para trocar" />
        <StatCard
          icone={HandCoins}
          rotulo="Total recebido"
          valor={fmtNumero(resumo.totalRecebido)}
          detalhe={`${resumo.quantidadeReconhecimentos} reconhecimento(s) de ${resumo.professores} professor(es)`}
        />
        <StatCard
          icone={ReceiptText}
          rotulo="Total trocado"
          valor={fmtNumero(resumo.totalGasto)}
          detalhe={`${resgates.length} vantagem(ns) resgatada(s)`}
        />
        <StatCard
          icone={Ticket}
          rotulo="Cupons para usar"
          valor={resumo.cuponsAtivos}
          detalhe={`${resumo.cuponsUtilizados} já utilizado(s)`}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2" aria-labelledby="titulo-grafico">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 id="titulo-grafico" className="font-bold text-slate-900">
                Movimentação dos últimos 6 meses
              </h2>
              <p className="text-sm text-slate-500">Moedas recebidas dos professores e trocadas por vantagens</p>
            </div>
          </div>
          <GraficoMensal serie={serie} series={SERIES} titulo="Moedas recebidas e trocadas por mês" />
        </section>

        <section className="card flex flex-col p-6" aria-labelledby="titulo-meta">
          <h2 id="titulo-meta" className="flex items-center gap-2 font-bold text-slate-900">
            <Target className="size-5 text-brand-500" aria-hidden="true" /> Próxima meta
          </h2>
          {meta ? (
            <div className="mt-4 flex flex-1 flex-col">
              <div className="flex gap-3">
                {meta.vantagem.fotoUrl && (
                  <img src={meta.vantagem.fotoUrl} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{meta.vantagem.nome}</p>
                  <p className="text-xs text-slate-500">{meta.vantagem.empresaNome}</p>
                  <Moedas valor={meta.vantagem.custo} className="mt-1 text-sm text-slate-700" />
                </div>
              </div>
              <Progresso valor={meta.progresso} rotulo="Progresso até a próxima vantagem" className="mt-5" />
              <p className="mt-2 text-sm text-slate-600">
                <strong className="text-slate-900">{meta.progresso}%</strong> do caminho · faltam{' '}
                <strong className="text-slate-900">{fmtMoedas(meta.faltam)}</strong>
              </p>
              <p className="mt-auto pt-4 text-xs text-slate-500">
                Participe das aulas e atividades: seus professores podem reconhecer seu mérito com moedas.
              </p>
            </div>
          ) : (
            <Vazio
              icone={Gift}
              titulo="Você pode resgatar qualquer vantagem!"
              descricao="Seu saldo cobre todas as vantagens disponíveis no catálogo."
              className="flex-1"
            />
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-3" aria-labelledby="titulo-ultimas">
          <div className="flex items-center justify-between">
            <h2 id="titulo-ultimas" className="font-bold text-slate-900">
              Últimas movimentações
            </h2>
            <Link to="/aluno/extrato" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Ver extrato <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {extrato.transacoes.length ? (
            <ListaMovimentacoes transacoes={extrato.transacoes.slice(0, 5)} compacta />
          ) : (
            <Vazio icone={Coins} titulo="Nenhuma movimentação ainda" descricao="Quando um professor enviar moedas para você, elas aparecem aqui." />
          )}
        </section>

        <section className="card p-6 lg:col-span-2" aria-labelledby="titulo-acessiveis">
          <div className="flex items-center justify-between">
            <h2 id="titulo-acessiveis" className="font-bold text-slate-900">
              Já dá para resgatar
            </h2>
            <Link to="/aluno/vantagens" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Catálogo <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {acessiveis.length ? (
            <ul className="mt-3 space-y-3">
              {acessiveis.map((v) => (
                <li key={v.id} className="flex items-center gap-3 rounded-xl p-2 ring-1 ring-slate-100">
                  {v.fotoUrl ? (
                    <img src={v.fotoUrl} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex size-12 items-center justify-center rounded-lg bg-slate-100">
                      <Gift className="size-5 text-slate-400" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{v.nome}</p>
                    <p className="truncate text-xs text-slate-500">{v.empresaNome}</p>
                  </div>
                  <Moedas valor={v.custo} className="text-sm text-slate-800" />
                </li>
              ))}
            </ul>
          ) : (
            <Vazio icone={Gift} titulo="Continue acumulando" descricao="Seu saldo ainda não cobre nenhuma vantagem disponível." />
          )}
        </section>
      </div>
    </>
  );
}
