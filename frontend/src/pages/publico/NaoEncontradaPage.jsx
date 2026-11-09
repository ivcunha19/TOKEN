import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Logo } from '../../components/ui/Display';

export function NaoEncontradaPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div className="rounded-2xl bg-brand-50 p-4 text-brand-500">
        <Compass className="size-10" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Página não encontrada</h1>
        <p className="mt-2 text-slate-500">O endereço acessado não existe ou foi movido.</p>
      </div>
      <Link to="/" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Voltar ao início
      </Link>
    </main>
  );
}
