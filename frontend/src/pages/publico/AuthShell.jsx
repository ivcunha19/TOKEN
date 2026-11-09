import { Link } from 'react-router-dom';
import { Award, Coins, Gift, Ticket } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { endpoints } from '../../lib/api';
import { Logo } from '../../components/ui/Display';

const PASSOS = [
  { icone: Award, titulo: 'Professores reconhecem', texto: 'Cada professor recebe 1.000 moedas por semestre para premiar o mérito dos alunos.' },
  { icone: Coins, titulo: 'Alunos acumulam', texto: 'As moedas chegam com o motivo do reconhecimento e ficam no extrato.' },
  { icone: Gift, titulo: 'Trocam por vantagens', texto: 'Descontos e produtos de empresas parceiras, com cupom enviado por e-mail.' },
];

/**
 * Moldura das páginas públicas: painel institucional à esquerda (como funciona + parceiros)
 * e o formulário à direita.
 */
export function AuthShell({ titulo, descricao, children, largo = false }) {
  const parceiras = useApi(() => endpoints.empresas.parceiras(), []);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-brand-950 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-brand-600),transparent_60%)]" aria-hidden="true" />
        <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-coin-400/10 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-1 flex-col px-10 py-10 xl:px-14">
          <Link to="/login" aria-label="TOKEN — entrar">
            <Logo claro />
          </Link>

          <div className="my-auto py-12">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-coin-300 ring-1 ring-white/15">
              <Ticket className="size-3.5" aria-hidden="true" /> Sistema de Moeda Estudantil
            </p>
            <h2 className="mt-5 text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl">
              O mérito dos alunos vale <span className="text-coin-400">moedas</span>.
            </h2>
            <p className="mt-4 max-w-md text-brand-200">
              Uma forma simples de valorizar participação, dedicação e bom desempenho em sala de aula.
            </p>

            <ol className="mt-10 space-y-5">
              {PASSOS.map((p, i) => (
                <li key={p.titulo} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <p.icone className="size-5 text-coin-300" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-bold">
                      <span className="mr-1.5 text-brand-300">{i + 1}.</span>
                      {p.titulo}
                    </p>
                    <p className="text-sm text-brand-200">{p.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {parceiras.dados?.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-wider text-brand-300 uppercase">Empresas parceiras</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {parceiras.dados.map((e) => (
                  <li key={e.id} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-brand-100 ring-1 ring-white/10">
                    {e.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:py-12">
        <div className="lg:hidden">
          <Link to="/login" aria-label="TOKEN — entrar">
            <Logo />
          </Link>
        </div>
        <div className={`mx-auto my-auto w-full animate-fade-in py-8 ${largo ? 'max-w-2xl' : 'max-w-md'}`}>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{titulo}</h1>
          {descricao && <p className="mt-2 text-slate-500">{descricao}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
