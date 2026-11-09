import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { endpoints } from '../../lib/api';
import { EmpresaForm } from '../../components/forms/EmpresaForm';
import { AuthShell } from './AuthShell';

export function CadastroEmpresaPage() {
  const { entrar } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const cadastrar = async (dados) => {
    await endpoints.empresas.cadastrar(dados);
    await entrar(dados.login, dados.senha);
    toast.sucesso('Empresa cadastrada! Agora cadastre as vantagens que deseja oferecer.');
    navigate('/empresa/vantagens', { replace: true });
  };

  return (
    <AuthShell
      largo
      titulo="Seja uma empresa parceira"
      descricao="Ofereça descontos e produtos aos estudantes e receba alunos engajados no seu negócio."
    >
      <div className="card p-6 sm:p-8">
        <EmpresaForm
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
