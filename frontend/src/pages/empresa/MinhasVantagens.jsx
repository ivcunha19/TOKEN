import { useMemo, useState } from 'react';
import { Gift, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { endpoints } from '../../lib/api';
import { PageHeader } from '../../components/ui/Display';
import { Badge, Carregando, ErroCarregamento, Vazio } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { VantagemCard } from '../../components/VantagemCard';
import { VantagemForm } from '../../components/forms/VantagemForm';

/** CRUD de vantagens da empresa (US04), com foto, estoque e custo em moedas. */
export function MinhasVantagens() {
  const toast = useToast();
  const { dados, carregando, erro, recarregar } = useApi(
    () => Promise.all([endpoints.vantagens.minhas(), endpoints.resgates.listar()]),
    [],
  );
  const [editando, setEditando] = useState(null); // null = fechado, {} = nova, vantagem = edição
  const [excluindo, setExcluindo] = useState(null);
  const [processando, setProcessando] = useState(false);

  const [vantagens = [], resgates = []] = dados || [];
  const resgatesPorVantagem = useMemo(() => {
    const mapa = new Map();
    resgates.forEach((r) => mapa.set(r.vantagemId, (mapa.get(r.vantagemId) || 0) + 1));
    return mapa;
  }, [resgates]);

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (carregando && !dados) return <Carregando />;

  const ehNova = editando && !editando.id;

  const salvar = async (formData) => {
    if (ehNova) {
      await endpoints.vantagens.cadastrar(formData);
      toast.sucesso('Vantagem cadastrada e já disponível no catálogo dos alunos.');
    } else {
      await endpoints.vantagens.atualizar(editando.id, formData);
      toast.sucesso('Vantagem atualizada.');
    }
    setEditando(null);
    recarregar({ silencioso: true });
  };

  const confirmarExclusao = async () => {
    setProcessando(true);
    try {
      await endpoints.vantagens.excluir(excluindo.id);
      toast.sucesso('Vantagem excluída.');
      setExcluindo(null);
      recarregar({ silencioso: true });
    } catch (e) {
      toast.erro(e.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <>
      <PageHeader
        titulo="Minhas vantagens"
        descricao="Cadastre produtos e descontos com foto, custo em moedas e estoque. Vantagens já resgatadas não podem ser excluídas — zere o estoque para retirá-las do catálogo."
        acoes={
          <Button icone={Plus} onClick={() => setEditando({})}>
            Nova vantagem
          </Button>
        }
      />

      {vantagens.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vantagens.map((v) => {
            const qtdResgates = resgatesPorVantagem.get(v.id) || 0;
            return (
              <VantagemCard
                key={v.id}
                vantagem={v}
                destaque={
                  qtdResgates > 0 && (
                    <Badge cor="marca" className="bg-brand-50/95">
                      {qtdResgates} resgate(s)
                    </Badge>
                  )
                }
                acoes={
                  <>
                    <Button variante="secundario" tamanho="sm" icone={Pencil} onClick={() => setEditando(v)} aria-label={`Editar ${v.nome}`}>
                      Editar
                    </Button>
                    <Button
                      variante="perigo-suave"
                      tamanho="sm"
                      icone={Trash2}
                      onClick={() => setExcluindo(v)}
                      aria-label={`Excluir ${v.nome}`}
                      disabled={qtdResgates > 0}
                      title={qtdResgates > 0 ? 'Vantagem já resgatada: não pode ser excluída' : undefined}
                    >
                      Excluir
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="card">
          <Vazio
            icone={Gift}
            titulo="Nenhuma vantagem cadastrada"
            descricao="Crie a primeira vantagem para aparecer no catálogo dos alunos."
            acao={
              <Button icone={Plus} onClick={() => setEditando({})}>
                Cadastrar vantagem
              </Button>
            }
          />
        </div>
      )}

      <Modal
        aberto={Boolean(editando)}
        aoFechar={() => setEditando(null)}
        titulo={ehNova ? 'Nova vantagem' : 'Editar vantagem'}
        descricao={ehNova ? 'Ela aparece no catálogo assim que for salva.' : editando?.nome}
        tamanho="lg"
      >
        {editando && (
          <VantagemForm key={editando.id || 'nova'} inicial={ehNova ? null : editando} aoEnviar={salvar} aoCancelar={() => setEditando(null)} />
        )}
      </Modal>

      <ConfirmDialog
        aberto={Boolean(excluindo)}
        aoFechar={() => setExcluindo(null)}
        aoConfirmar={confirmarExclusao}
        carregando={processando}
        variante="perigo"
        titulo="Excluir vantagem?"
        descricao={excluindo?.nome}
        textoConfirmar="Excluir"
      >
        <p className="text-sm text-slate-600">A vantagem sairá do catálogo dos alunos. Esta ação não pode ser desfeita.</p>
      </ConfirmDialog>
    </>
  );
}
