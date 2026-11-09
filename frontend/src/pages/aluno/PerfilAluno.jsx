import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Building, Coins, GraduationCap, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { endpoints } from '../../lib/api';
import { fmtMoedas } from '../../lib/format';
import { Avatar, PageHeader } from '../../components/ui/Display';
import { Carregando, ErroCarregamento } from '../../components/ui/Feedback';
import { AlunoForm } from '../../components/forms/AlunoForm';
import { ZonaDePerigo } from '../../components/ZonaDePerigo';

export function PerfilAluno() {
  const { atualizarUsuario, encerrarLocalmente } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { dados: aluno, carregando, erro, recarregar, definirDados } = useApi(() => endpoints.alunos.me(), []);
  const [revisao, setRevisao] = useState(0);

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (carregando || !aluno) return <Carregando />;

  const salvar = async (dados) => {
    const atualizado = await endpoints.alunos.atualizar(dados);
    definirDados(atualizado);
    setRevisao((r) => r + 1);
    atualizarUsuario({ nome: atualizado.nome, login: atualizado.login });
    toast.sucesso('Cadastro atualizado com sucesso.');
  };

  const excluir = async () => {
    await endpoints.alunos.excluir();
    encerrarLocalmente();
    toast.info('Sua conta foi excluída.');
    navigate('/login', { replace: true });
  };

  return (
    <>
      <PageHeader titulo="Meu cadastro" descricao="Mantenha seus dados atualizados para receber moedas e cupons." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="min-w-0 space-y-6">
          <div className="card p-6 text-center">
            <div className="flex justify-center">
              <Avatar nome={aluno.nome} tamanho="lg" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900">{aluno.nome}</h2>
            <p className="font-mono text-sm text-slate-500">@{aluno.login}</p>
            <dl className="mt-6 space-y-3 text-left text-sm">
              <div className="flex items-start gap-3">
                <Building className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-slate-400">Instituição</dt>
                  <dd className="font-medium text-slate-700">{aluno.instituicaoNome}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-slate-400">Curso</dt>
                  <dd className="font-medium text-slate-700">{aluno.cursoNome}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs text-slate-400">E-mail</dt>
                  <dd className="truncate font-medium text-slate-700">{aluno.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Coins className="mt-0.5 size-4 text-coin-500" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-slate-400">Saldo</dt>
                  <dd className="font-medium text-slate-700">{fmtMoedas(aluno.saldo)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 size-4 text-emerald-500" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-slate-400">CPF</dt>
                  <dd className="font-medium text-slate-700">{aluno.cpf}</dd>
                </div>
              </div>
            </dl>
          </div>
          <ZonaDePerigo
            descricao="Só é possível excluir contas sem histórico de moedas. Contas com movimentações são preservadas para auditoria."
            aoExcluir={excluir}
          />
        </aside>

        <div className="card p-6 sm:p-8">
          <AlunoForm key={revisao} inicial={aluno} edicao aoEnviar={salvar} />
        </div>
      </div>
    </>
  );
}
