import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { endpoints } from '../../lib/api';
import { AlunoForm } from '../../components/forms/AlunoForm';
import { AuthShell } from './AuthShell';

export function CadastroAlunoPage() {
  const { entrar } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const cadastrar = async (dados) => {
    await endpoints.alunos.cadastrar(dados);
    await entrar(dados.login, dados.senha);
    toast.sucesso('Conta criada! Você já está conectado(a).');
    navigate('/aluno', { replace: true });
  };

  return (
    <AuthShell
      largo
      titulo="Criar conta de aluno"
      descricao="Cadastre-se para receber moedas dos seus professores e trocá-las por vantagens."
    >
      <div className="card p-6 sm:p-8">
        <AlunoForm
          aoEnviar={cadastrar}
          acoesExtras={
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-600">
              <ArrowLeft className="size-4" aria-hidden="true" /> Já tenho conta
            </Link>
          }
        />
      </div>
    </AuthShell>
  );
}
