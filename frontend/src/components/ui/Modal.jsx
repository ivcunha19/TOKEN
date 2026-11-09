import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';

/**
 * Diálogo modal acessível: foco preso no diálogo, Esc fecha, foco volta ao elemento de origem.
 */
export function Modal({ aberto, aoFechar, titulo, descricao, children, rodape, tamanho = 'md' }) {
  const idTitulo = useId();
  const idDescricao = useId();
  const caixa = useRef(null);
  const origem = useRef(null);
  // Guardado em ref para o efeito não reexecutar (e roubar o foco) a cada renderização do pai
  const fecharRef = useRef(aoFechar);
  fecharRef.current = aoFechar;

  useEffect(() => {
    if (!aberto) return undefined;
    origem.current = document.activeElement;
    const focaveis = () =>
      caixa.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [];
    const primeiro = caixa.current?.querySelector('[data-autofocus]') || focaveis()[0];
    primeiro?.focus();

    const aoTeclar = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        fecharRef.current?.();
      }
      if (e.key === 'Tab') {
        const lista = [...focaveis()];
        if (!lista.length) return;
        const [ini, fim] = [lista[0], lista[lista.length - 1]];
        if (e.shiftKey && document.activeElement === ini) {
          e.preventDefault();
          fim.focus();
        } else if (!e.shiftKey && document.activeElement === fim) {
          e.preventDefault();
          ini.focus();
        }
      }
    };
    document.addEventListener('keydown', aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflow;
      origem.current?.focus?.();
    };
  }, [aberto]);

  if (!aberto) return null;

  const larguras = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm" onClick={aoFechar} aria-hidden="true" />
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={descricao ? idDescricao : undefined}
        className={`relative flex max-h-[92vh] w-full ${larguras[tamanho]} animate-pop flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-5 pb-4">
          <div>
            <h2 id={idTitulo} className="text-lg font-bold text-slate-900">
              {titulo}
            </h2>
            {descricao && (
              <p id={idDescricao} className="mt-0.5 text-sm text-slate-500">
                {descricao}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="-mr-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {rodape && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">{rodape}</div>}
      </div>
    </div>,
    document.body,
  );
}

/** Confirmação com botões "Cancelar" e ação principal. */
export function ConfirmDialog({
  aberto,
  aoFechar,
  aoConfirmar,
  titulo,
  descricao,
  children,
  textoConfirmar = 'Confirmar',
  variante = 'primario',
  carregando = false,
}) {
  return (
    <Modal
      aberto={aberto}
      aoFechar={carregando ? undefined : aoFechar}
      titulo={titulo}
      descricao={descricao}
      tamanho="sm"
      rodape={
        <>
          <Button variante="secundario" onClick={aoFechar} disabled={carregando}>
            Cancelar
          </Button>
          <Button variante={variante} onClick={aoConfirmar} carregando={carregando} data-autofocus>
            {textoConfirmar}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
