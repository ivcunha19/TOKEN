import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Mail, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { endpoints } from '../../lib/api';
import { Avatar, PageHeader } from '../../components/ui/Display';
import { Carregando, ErroCarregamento } from '../../components/ui/Feedback';
import { EmpresaForm } from '../../components/forms/EmpresaForm';
import { ZonaDePerigo } from '../../components/ZonaDePerigo';

export function PerfilEmpresa() {
  const { atualizarUsuario, encerrarLocalmente } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { dados: empresa, carregando, erro, recarregar, definirDados } = useApi(() => endpoints.empresas.me(), []);
  const [revisao, setRevisao] = useState(0);

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (carregando || !empresa) return <Carregando />;

  const salvar = async (dados) => {
    const atualizada = await endpoints.empresas.atualizar(dados);
    definirDados(atualizada);
    setRevisao((r) => r + 1);
    atualizarUsuario({ nome: atualizada.nome, login: atualizada.login });
    toast.sucesso('Cadastro da empresa atualizado.');
  };

  const excluir = async () => {
    await endpoints.empresas.excluir();
    encerrarLocalmente();
    toast.info('O cadastro da empresa foi excluído.');
    navigate('/login', { replace: true });
  };

  return (
    <>
      <PageHeader titulo="Cadastro da empresa" descricao="Estes dados aparecem para os alunos junto das suas vantagens." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="min-w-0 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <Avatar nome={empresa.nome} tamanho="lg" />
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900">{empresa.nome}</h2>
                <p className="font-mono text-sm text-slate-500">@{empresa.login}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">{empresa.descricao}</p>
            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 size-4 text-emerald-500" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-slate-400">CNPJ</dt>
                  <dd className="font-medium text-slate-700">{empresa.cnpj}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs text-slate-400">E-mail para avisos de resgate</dt>
                  <dd className="truncate font-medium text-slate-700">{empresa.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Store className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-slate-400">Perfil</dt>
                  <dd className="font-medium text-slate-700">Empresa parceira</dd>
                </div>
              </div>
            </dl>
          </div>
          <ZonaDePerigo
            descricao="Só é possível excluir o cadastro se nenhuma vantagem da empresa tiver sido resgatada."
            aoExcluir={excluir}
          />
        </aside>

        <div className="card p-6 sm:p-8">
          <EmpresaForm key={revisao} inicial={empresa} edicao aoEnviar={salvar} />
        </div>
      </div>
    </>
  );
}
