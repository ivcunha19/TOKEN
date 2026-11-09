import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, LogIn, Presentation, TriangleAlert } from 'lucide-react';
import { HOME_POR_PERFIL, useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useFormulario } from '../../hooks/useFormulario';
import { primeiroNome } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { FormError, Input, PasswordInput } from '../../components/ui/Form';
import { AuthShell } from './AuthShell';

/** Usuários criados pelo DataSeeder do back-end, para a demonstração. */
export const USUARIOS_DEMO = [
  { perfil: 'Professor', nome: 'Profa. Milena (PUC Minas)', login: 'milena.adao', senha: 'senha123', icone: Presentation },
  { perfil: 'Professor', nome: 'Prof. Carlos (UFMG)', login: 'carlos.silva', senha: 'senha123', icone: Presentation },
  { perfil: 'Aluno', nome: 'Lucas Oliveira (PUC Minas)', login: 'lucas.santos', senha: 'aluno123', icone: GraduationCap },
  { perfil: 'Aluno', nome: 'Mariana Alves (PUC Minas)', login: 'mariana.alves', senha: 'aluno123', icone: GraduationCap },
  { perfil: 'Empresa', nome: 'Livraria Universitária', login: 'livraria.univ', senha: 'empresa123', icone: Building2 },
  { perfil: 'Empresa', nome: 'Restaurante Sabor do Campus', login: 'restaurante.campus', senha: 'empresa123', icone: Building2 },
];

export function LoginPage() {
  const { entrar, sessaoExpirada } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useFormulario({ login: '', senha: '' }, (v) => ({
    login: !v.login.trim() && 'Informe o login.',
    senha: !v.senha && 'Informe a senha.',
  }));

  const aoEntrar = form.enviar(async (v) => {
    const usuario = await entrar(v.login.trim(), v.senha);
    toast.sucesso(`Bem-vindo(a), ${primeiroNome(usuario.nome)}!`);
    const destino = location.state?.de;
    const home = HOME_POR_PERFIL[usuario.tipo];
    navigate(destino && destino.startsWith(home) ? destino : home, { replace: true });
  });

  const preencher = (demo) => {
    form.setValores({ login: demo.login, senha: demo.senha });
    document.getElementById('botao-entrar')?.focus();
  };

  return (
    <AuthShell titulo="Entrar no TOKEN" descricao="Acesse com o login e a senha do seu perfil.">
      {sessaoExpirada && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Sua sessão expirou. Entre novamente para continuar.
        </div>
      )}

      <form noValidate onSubmit={aoEntrar} className="space-y-4">
        <FormError mensagem={form.erroGeral} />
        <Input label="Login" autoComplete="username" autoCapitalize="off" spellCheck={false} {...form.campo('login')} />
        <PasswordInput label="Senha" autoComplete="current-password" {...form.campo('senha')} />
        <Button id="botao-entrar" type="submit" tamanho="lg" icone={LogIn} carregando={form.enviando} className="w-full">
          Entrar
        </Button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/cadastro/aluno"
          className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-card"
        >
          <span className="rounded-xl bg-brand-50 p-2 text-brand-600">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900">Sou aluno</span>
            <span className="text-xs text-slate-500 group-hover:text-brand-600">Criar minha conta</span>
          </span>
        </Link>
        <Link
          to="/cadastro/empresa"
          className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-card"
        >
          <span className="rounded-xl bg-coin-100 p-2 text-amber-700">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900">Sou empresa</span>
            <span className="text-xs text-slate-500 group-hover:text-brand-600">Quero ser parceira</span>
          </span>
        </Link>
      </div>

      <section aria-labelledby="titulo-demo" className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-100/60 p-4">
        <h2 id="titulo-demo" className="text-sm font-bold text-slate-700">
          Usuários de demonstração
        </h2>
        <p className="text-xs text-slate-500">Clique para preencher o login e a senha.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {USUARIOS_DEMO.map((d) => (
            <li key={d.login}>
              <button
                type="button"
                onClick={() => preencher(d)}
                className="flex w-full items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-left ring-1 ring-slate-200 transition hover:ring-brand-300"
                aria-label={`Preencher com ${d.nome} (${d.perfil})`}
              >
                <d.icone className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-slate-800">{d.nome}</span>
                  <span className="block truncate font-mono text-[11px] text-slate-500">{d.login}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </AuthShell>
  );
}
