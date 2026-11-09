import { useMemo, useState } from 'react';
import { CheckCircle2, Coins, Mail, Search, Send, UserRoundSearch } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useFormulario } from '../../hooks/useFormulario';
import { useToast } from '../../context/ToastContext';
import { endpoints } from '../../lib/api';
import { fmtMoedas, fmtNumero } from '../../lib/format';
import { rankingPor } from '../../lib/estatisticas';
import { Avatar, Moedas, PageHeader } from '../../components/ui/Display';
import { ErroCarregamento, Carregando, Vazio } from '../../components/ui/Feedback';
import { FormError, Input, Textarea } from '../../components/ui/Form';
import { Button } from '../../components/ui/Button';

const VALORES_RAPIDOS = [10, 25, 50, 100];
const MOTIVOS_SUGERIDOS = [
  'Participação ativa nas aulas',
  'Excelente desempenho na avaliação',
  'Ajudou os colegas na atividade',
  'Entrega do trabalho com qualidade',
];

export function validarEnvio(v, saldo) {
  const valor = Number(v.valor);
  return {
    alunoId: !v.alunoId && 'Selecione o aluno que receberá as moedas.',
    valor:
      (!v.valor && 'Informe a quantidade de moedas.') ||
      ((!Number.isInteger(valor) || valor < 1) && 'Informe um número inteiro maior que zero.') ||
      (valor > saldo && `Saldo insuficiente: você tem ${fmtMoedas(saldo)}.`),
    motivo:
      (!v.motivo.trim() && 'O motivo do reconhecimento é obrigatório.') ||
      (v.motivo.length > 500 && 'O motivo deve ter no máximo 500 caracteres.'),
  };
}

/** Envio de moedas (US05): escolha do aluno da mesma instituição, valor e motivo obrigatório. */
export function EnviarMoedas() {
  const toast = useToast();
  const { dados, carregando, erro, recarregar } = useApi(
    () => Promise.all([endpoints.alunos.daMinhaInstituicao(), endpoints.professores.me(), endpoints.transacoes.extrato()]),
    [],
  );
  const [busca, setBusca] = useState('');
  const [ultimoEnvio, setUltimoEnvio] = useState(null);

  const [alunos = [], professor = { saldo: 0 }, extrato = { transacoes: [] }] = dados || [];
  const form = useFormulario({ alunoId: '', valor: '', motivo: '' }, (v) => validarEnvio(v, professor.saldo));

  const jaEnviado = useMemo(
    () => new Map(rankingPor(extrato.transacoes.filter((t) => t.tipo === 'ENVIO'), (t) => t.contraparte, (t) => -t.valor).map((r) => [r.chave, r.total])),
    [extrato],
  );
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return alunos.filter((a) => !termo || `${a.nome} ${a.cursoNome} ${a.matricula || ''}`.toLowerCase().includes(termo));
  }, [alunos, busca]);

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (carregando && !dados) return <Carregando />;

  const selecionado = alunos.find((a) => String(a.id) === String(form.valores.alunoId));
  const valorNumerico = Number(form.valores.valor) || 0;
  const saldoApos = professor.saldo - valorNumerico;

  const enviar = form.enviar(async (v) => {
    const transacao = await endpoints.transacoes.enviar(Number(v.alunoId), Number(v.valor), v.motivo.trim());
    setUltimoEnvio(transacao);
    toast.sucesso(`${fmtMoedas(transacao.valor)} enviadas para ${transacao.alunoNome}.`);
    form.setValores({ alunoId: '', valor: '', motivo: '' });
    await recarregar({ silencioso: true });
  });

  const adicionarMotivo = (texto) => {
    const atual = form.valores.motivo.trim();
    form.alterar('motivo', atual ? `${atual}. ${texto}` : texto);
  };

  return (
    <>
      <PageHeader
        titulo="Enviar moedas"
        descricao="Escolha um aluno da sua instituição, defina a quantidade e conte o motivo do reconhecimento. O aluno é avisado por e-mail."
        acoes={
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-card ring-1 ring-slate-200">
            <span className="text-sm text-slate-500">Seu saldo</span>
            <Moedas valor={professor.saldo} className="text-lg text-slate-900" />
          </div>
        }
      />

      {ultimoEnvio && (
        <div className="mb-6 flex animate-fade-in items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4" role="status">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <div className="text-sm text-emerald-900">
            <p className="font-semibold">
              {fmtMoedas(ultimoEnvio.valor)} enviadas para {ultimoEnvio.alunoNome}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-emerald-800/80">
              <Mail className="size-3.5" aria-hidden="true" /> O aluno recebeu um e-mail com o motivo: “{ultimoEnvio.motivo}”
            </p>
          </div>
        </div>
      )}

      <form noValidate onSubmit={enviar} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="card flex flex-col p-5" aria-labelledby="titulo-alunos">
          <h2 id="titulo-alunos" className="font-bold text-slate-900">
            1. Escolha o aluno
          </h2>
          <p className="text-sm text-slate-500">{alunos.length} aluno(s) da sua instituição</p>
          <label className="relative mt-4">
            <span className="sr-only">Buscar aluno</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              className="input pl-10"
              placeholder="Buscar por nome, curso ou matrícula"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>

          {form.erros.alunoId && (
            <p className="mt-2 text-xs font-medium text-rose-600" role="alert">
              {form.erros.alunoId}
            </p>
          )}

          {filtrados.length ? (
            <div role="radiogroup" aria-label="Aluno" className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {filtrados.map((a) => {
                const ativo = String(a.id) === String(form.valores.alunoId);
                const total = jaEnviado.get(a.nome) || 0;
                return (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      ativo ? 'border-brand-400 bg-brand-50/70 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="alunoId"
                      value={a.id}
                      checked={ativo}
                      onChange={() => form.alterar('alunoId', String(a.id))}
                      className="sr-only"
                    />
                    <Avatar nome={a.nome} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{a.nome}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {a.cursoNome}
                        {a.matricula ? ` · mat. ${a.matricula}` : ''}
                      </span>
                    </span>
                    {total > 0 && (
                      <span className="shrink-0 text-right text-xs text-slate-500">
                        você já enviou
                        <br />
                        <strong className="text-slate-700">{fmtNumero(total)}</strong>
                      </span>
                    )}
                    {ativo && <CheckCircle2 className="size-5 shrink-0 text-brand-600" aria-hidden="true" />}
                  </label>
                );
              })}
            </div>
          ) : (
            <Vazio
              icone={UserRoundSearch}
              titulo={alunos.length ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              descricao={alunos.length ? 'Tente outro termo de busca.' : 'Ainda não há alunos da sua instituição no sistema.'}
            />
          )}
        </section>

        <section className="card space-y-5 p-5 sm:p-6" aria-labelledby="titulo-envio">
          <h2 id="titulo-envio" className="font-bold text-slate-900">
            2. Defina o reconhecimento
          </h2>
          <FormError mensagem={form.erroGeral} />

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            {selecionado ? (
              <>
                <Avatar nome={selecionado.nome} tamanho="sm" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Aluno selecionado</p>
                  <p className="truncate text-sm font-semibold text-slate-900">{selecionado.nome}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Nenhum aluno selecionado</p>
            )}
          </div>

          <div>
            <Input
              label="Quantidade de moedas"
              obrigatorio
              type="number"
              min={1}
              max={Math.max(professor.saldo, 1)}
              step={1}
              inputMode="numeric"
              {...form.campo('valor')}
            />
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Valores rápidos">
              {VALORES_RAPIDOS.map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={v > professor.saldo}
                  onClick={() => form.alterar('valor', String(v))}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ring-1 transition disabled:opacity-40 ${
                    Number(form.valores.valor) === v ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-200 hover:ring-brand-300'
                  }`}
                >
                  {v} moedas
                </button>
              ))}
            </div>
          </div>

          <div>
            <Textarea
              label="Motivo do reconhecimento"
              obrigatorio
              rows={3}
              maxLength={500}
              contador
              dica="O aluno verá esta mensagem no e-mail e no extrato"
              {...form.campo('motivo')}
            />
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Sugestões de motivo">
              {MOTIVOS_SUGERIDOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => adicionarMotivo(m)}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:text-brand-700 hover:ring-brand-300"
                >
                  + {m}
                </button>
              ))}
            </div>
          </div>

          <dl className="divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4 text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500">Saldo atual</dt>
              <dd className="font-semibold tabular-nums">{fmtMoedas(professor.saldo)}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="font-semibold text-slate-700">Saldo após o envio</dt>
              <dd className={`font-bold tabular-nums ${saldoApos < 0 ? 'text-rose-600' : ''}`}>{fmtMoedas(saldoApos)}</dd>
            </div>
          </dl>

          <Button
            type="submit"
            tamanho="lg"
            icone={Send}
            className="w-full"
            carregando={form.enviando}
            disabled={professor.saldo < 1 || !alunos.length}
          >
            {valorNumerico > 0 ? `Enviar ${fmtMoedas(valorNumerico)}` : 'Enviar moedas'}
          </Button>
          {professor.saldo < 1 && (
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Coins className="size-3.5" aria-hidden="true" /> Seu saldo acabou. Você recebe mais 1.000 moedas no próximo semestre.
            </p>
          )}
        </section>
      </form>
    </>
  );
}
