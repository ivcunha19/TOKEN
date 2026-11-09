import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Mail, PartyPopper, Search, SearchX, Sparkles } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { endpoints } from '../../lib/api';
import { fmtMoedas } from '../../lib/format';
import { podeResgatar } from '../../lib/estatisticas';
import { PageHeader, Moedas } from '../../components/ui/Display';
import { Badge, ErroCarregamento, Skeleton, Vazio } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { VantagemCard } from '../../components/VantagemCard';
import { CodigoCupom } from '../../components/CodigoCupom';

const ORDENACOES = {
  'custo-asc': { rotulo: 'Menor custo', fn: (a, b) => a.custo - b.custo },
  'custo-desc': { rotulo: 'Maior custo', fn: (a, b) => b.custo - a.custo },
  nome: { rotulo: 'Nome (A–Z)', fn: (a, b) => a.nome.localeCompare(b.nome) },
};

/** Filtra e ordena o catálogo (exportada para testes). */
export function filtrarCatalogo(vantagens, { busca = '', empresa = '', soAcessiveis = false, ordem = 'custo-asc' }, saldo) {
  const termo = busca.trim().toLowerCase();
  return vantagens
    .filter((v) => !termo || `${v.nome} ${v.descricao} ${v.empresaNome}`.toLowerCase().includes(termo))
    .filter((v) => !empresa || String(v.empresaId) === String(empresa))
    .filter((v) => !soAcessiveis || podeResgatar(v, saldo))
    .sort(ORDENACOES[ordem]?.fn || ORDENACOES['custo-asc'].fn);
}

export function CatalogoVantagens() {
  const toast = useToast();
  const navigate = useNavigate();
  const { dados, carregando, erro, recarregar } = useApi(
    () => Promise.all([endpoints.vantagens.catalogo(), endpoints.alunos.me()]),
    [],
  );
  const [filtros, setFiltros] = useState({ busca: '', empresa: '', soAcessiveis: false, ordem: 'custo-asc' });
  const [selecionada, setSelecionada] = useState(null);
  const [resgatando, setResgatando] = useState(false);
  const [cupom, setCupom] = useState(null);

  const [vantagens = [], aluno = { saldo: 0 }] = dados || [];
  const empresas = useMemo(
    () => [...new Map(vantagens.map((v) => [v.empresaId, v.empresaNome])).entries()].sort((a, b) => a[1].localeCompare(b[1])),
    [vantagens],
  );
  const lista = useMemo(() => filtrarCatalogo(vantagens, filtros, aluno.saldo), [vantagens, filtros, aluno.saldo]);
  const alterarFiltro = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor }));

  const confirmarResgate = async () => {
    setResgatando(true);
    try {
      const resgate = await endpoints.resgates.resgatar(selecionada.id);
      setSelecionada(null);
      setCupom(resgate);
      recarregar({ silencioso: true });
    } catch (e) {
      toast.erro(e.message);
    } finally {
      setResgatando(false);
    }
  };

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;

  return (
    <>
      <PageHeader
        titulo="Catálogo de vantagens"
        descricao="Troque suas moedas por descontos e produtos das empresas parceiras. O cupom chega no seu e-mail."
        acoes={
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-card ring-1 ring-slate-200">
            <span className="text-sm text-slate-500">Seu saldo</span>
            <Moedas valor={aluno.saldo} className="text-lg text-slate-900" />
          </div>
        }
      />

      <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="relative">
          <span className="sr-only">Buscar vantagem</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            className="input pl-10"
            placeholder="Buscar por nome, descrição ou empresa"
            value={filtros.busca}
            onChange={(e) => alterarFiltro('busca', e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Filtrar por empresa</span>
          <select className="input" value={filtros.empresa} onChange={(e) => alterarFiltro('empresa', e.target.value)}>
            <option value="">Todas as empresas</option>
            {empresas.map(([id, nome]) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Ordenar por</span>
          <select className="input" value={filtros.ordem} onChange={(e) => alterarFiltro('ordem', e.target.value)}>
            {Object.entries(ORDENACOES).map(([chave, o]) => (
              <option key={chave} value={chave}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 text-sm font-medium text-slate-700 select-none">
          <input
            type="checkbox"
            className="size-4 rounded accent-brand-600"
            checked={filtros.soAcessiveis}
            onChange={(e) => alterarFiltro('soAcessiveis', e.target.checked)}
          />
          Só o que posso resgatar
        </label>
      </div>

      {carregando && !dados ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : lista.length ? (
        <>
          <p className="mb-3 text-sm text-slate-500" aria-live="polite">
            {lista.length} vantagem(ns) encontrada(s)
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lista.map((v) => {
              const ok = podeResgatar(v, aluno.saldo);
              const faltam = v.custo - aluno.saldo;
              return (
                <VantagemCard
                  key={v.id}
                  vantagem={v}
                  destaque={
                    ok && (
                      <Badge cor="sucesso" icone={Sparkles} className="bg-emerald-50/95">
                        Disponível para você
                      </Badge>
                    )
                  }
                  acoes={
                    <Button
                      className="w-full"
                      variante={ok ? 'primario' : 'secundario'}
                      icone={Gift}
                      disabled={!ok}
                      onClick={() => setSelecionada(v)}
                      aria-label={`Resgatar ${v.nome}`}
                    >
                      {!v.disponivel ? 'Esgotada' : ok ? 'Resgatar' : `Faltam ${fmtMoedas(faltam)}`}
                    </Button>
                  }
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="card">
          {vantagens.length ? (
            <Vazio
              icone={SearchX}
              titulo="Nenhuma vantagem com esses filtros"
              descricao="Tente outra busca ou desmarque “Só o que posso resgatar”."
              acao={
                <Button variante="secundario" onClick={() => setFiltros({ busca: '', empresa: '', soAcessiveis: false, ordem: 'custo-asc' })}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <Vazio icone={Gift} titulo="Catálogo vazio" descricao="Nenhuma empresa parceira cadastrou vantagens ainda." />
          )}
        </div>
      )}

      <ConfirmDialog
        aberto={Boolean(selecionada)}
        aoFechar={() => setSelecionada(null)}
        aoConfirmar={confirmarResgate}
        carregando={resgatando}
        titulo="Confirmar resgate"
        descricao={selecionada ? `${selecionada.nome} · ${selecionada.empresaNome}` : ''}
        textoConfirmar="Confirmar resgate"
      >
        {selecionada && (
          <div className="space-y-4">
            {selecionada.fotoUrl && <img src={selecionada.fotoUrl} alt="" className="h-36 w-full rounded-2xl object-cover" />}
            <p className="text-sm text-slate-600">{selecionada.descricao}</p>
            <dl className="divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4 text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500">Saldo atual</dt>
                <dd className="font-semibold tabular-nums">{fmtMoedas(aluno.saldo)}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-slate-500">Custo da vantagem</dt>
                <dd className="font-semibold text-rose-600 tabular-nums">− {fmtMoedas(selecionada.custo)}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="font-semibold text-slate-700">Saldo após o resgate</dt>
                <dd className="font-bold tabular-nums">{fmtMoedas(aluno.saldo - selecionada.custo)}</dd>
              </div>
            </dl>
          </div>
        )}
      </ConfirmDialog>

      <Modal
        aberto={Boolean(cupom)}
        aoFechar={() => setCupom(null)}
        titulo="Resgate realizado!"
        rodape={
          <>
            <Button variante="secundario" onClick={() => setCupom(null)}>
              Continuar no catálogo
            </Button>
            <Button onClick={() => navigate('/aluno/cupons')}>Ver meus cupons</Button>
          </>
        }
      >
        {cupom && (
          <div className="flex flex-col items-center text-center">
            <span className="rounded-2xl bg-coin-100 p-3 text-amber-600">
              <PartyPopper className="size-8" aria-hidden="true" />
            </span>
            <p className="mt-3 font-semibold text-slate-900">{cupom.vantagemNome}</p>
            <p className="text-sm text-slate-500">Apresente este código em {cupom.empresaNome}</p>
            <div className="my-5">
              <CodigoCupom codigo={cupom.codigoCupom} tamanho="lg" />
            </div>
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              <Mail className="size-4 text-brand-500" aria-hidden="true" />
              Enviamos o cupom para o seu e-mail e avisamos a empresa.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Saldo restante: <strong className="text-slate-900">{fmtMoedas(cupom.saldoAluno)}</strong>
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
