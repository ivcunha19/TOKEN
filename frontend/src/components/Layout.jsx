import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Gift,
  House,
  LogOut,
  ReceiptText,
  Send,
  Store,
  Ticket,
  TicketCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TIPO_USUARIO } from '../lib/format';
import { Avatar, Logo } from './ui/Display';

export const MENUS = {
  ALUNO: [
    { para: '/aluno', rotulo: 'Início', icone: House, fim: true },
    { para: '/aluno/vantagens', rotulo: 'Vantagens', icone: Gift },
    { para: '/aluno/extrato', rotulo: 'Extrato', icone: ReceiptText },
    { para: '/aluno/cupons', rotulo: 'Meus cupons', icone: Ticket },
    { para: '/aluno/perfil', rotulo: 'Meu cadastro', icone: UserRound },
  ],
  PROFESSOR: [
    { para: '/professor', rotulo: 'Início', icone: House, fim: true },
    { para: '/professor/enviar', rotulo: 'Enviar moedas', icone: Send },
    { para: '/professor/extrato', rotulo: 'Extrato', icone: ArrowLeftRight },
  ],
  EMPRESA: [
    { para: '/empresa', rotulo: 'Início', icone: House, fim: true },
    { para: '/empresa/vantagens', rotulo: 'Minhas vantagens', icone: Gift },
    { para: '/empresa/cupons', rotulo: 'Cupons', icone: TicketCheck },
    { para: '/empresa/perfil', rotulo: 'Cadastro', icone: Store },
  ],
};

function LinkMenu({ item, compacto = false }) {
  const Icone = item.icone;
  return (
    <NavLink
      to={item.para}
      end={item.fim}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
          compacto ? 'px-3 py-2 text-xs' : 'px-3.5 py-2 text-sm'
        } ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
      }
    >
      <Icone className="size-4" aria-hidden="true" />
      {item.rotulo}
    </NavLink>
  );
}

/** Estrutura das páginas autenticadas: cabeçalho com menu do perfil e área de conteúdo. */
export function Layout() {
  const { usuario, sair } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const menu = MENUS[usuario?.tipo] || [];

  const aoSair = async () => {
    await sair();
    toast.info('Você saiu do sistema. Até logo!');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <NavLink to="/" aria-label="TOKEN — página inicial">
            <Logo />
          </NavLink>

          <nav aria-label="Menu principal" className="hidden flex-1 items-center gap-1 md:flex">
            {menu.map((item) => (
              <LinkMenu key={item.para} item={item} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-semibold text-slate-900">{usuario?.nome}</p>
              <p className="text-xs text-slate-500">{TIPO_USUARIO[usuario?.tipo]}</p>
            </div>
            <Avatar nome={usuario?.nome} />
            <button
              type="button"
              onClick={aoSair}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Sair</span>
            </button>
          </div>
        </div>

        <nav aria-label="Menu principal (celular)" className="border-t border-slate-100 md:hidden">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
            {menu.map((item) => (
              <LinkMenu key={item.para} item={item} compacto />
            ))}
          </div>
        </nav>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 animate-fade-in px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>TOKEN · Sistema de Moeda Estudantil</p>
          <p>Laboratório de Desenvolvimento de Software · PUC Minas</p>
        </div>
      </footer>
    </div>
  );
}
