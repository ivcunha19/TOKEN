import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/Modal';

/** Seção de exclusão de conta com confirmação digitada. */
export function ZonaDePerigo({ descricao, aoExcluir, palavra = 'EXCLUIR' }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');

  const fechar = () => {
    setAberto(false);
    setTexto('');
    setErro('');
  };

  const confirmar = async () => {
    if (texto.trim().toUpperCase() !== palavra) {
      setErro(`Digite ${palavra} para confirmar.`);
      return;
    }
    setExcluindo(true);
    try {
      await aoExcluir();
    } catch (e) {
      setErro(e.message);
      setExcluindo(false);
    }
  };

  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6" aria-labelledby="titulo-perigo">
      <h2 id="titulo-perigo" className="font-bold text-rose-900">
        Excluir conta
      </h2>
      <p className="mt-1 text-sm text-rose-800/80">{descricao}</p>
      <Button variante="perigo-suave" icone={Trash2} className="mt-4" onClick={() => setAberto(true)}>
        Excluir minha conta
      </Button>

      <ConfirmDialog
        aberto={aberto}
        aoFechar={fechar}
        aoConfirmar={confirmar}
        carregando={excluindo}
        variante="perigo"
        titulo="Excluir conta definitivamente?"
        descricao="Esta ação não pode ser desfeita."
        textoConfirmar="Excluir conta"
      >
        <label className="block text-sm text-slate-600">
          Digite <strong className="font-mono text-rose-700">{palavra}</strong> para confirmar:
          <input
            className="input mt-2"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setErro('');
            }}
            aria-invalid={erro ? 'true' : undefined}
            autoComplete="off"
          />
        </label>
        {erro && (
          <p role="alert" className="mt-2 text-sm font-medium text-rose-600">
            {erro}
          </p>
        )}
      </ConfirmDialog>
    </section>
  );
}
