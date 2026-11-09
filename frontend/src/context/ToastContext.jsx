import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

const ESTILOS = {
  sucesso: { icone: CheckCircle2, classe: 'border-emerald-200 bg-white text-emerald-900', cor: 'text-emerald-500' },
  erro: { icone: TriangleAlert, classe: 'border-rose-200 bg-white text-rose-900', cor: 'text-rose-500' },
  info: { icone: Info, classe: 'border-brand-200 bg-white text-slate-900', cor: 'text-brand-500' },
};

/** Notificações flutuantes (canto da tela), anunciadas por leitores de tela. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const proximoId = useRef(1);

  const fechar = useCallback((id) => setToasts((lista) => lista.filter((t) => t.id !== id)), []);

  const mostrar = useCallback(
    (mensagem, tipo = 'sucesso') => {
      const id = proximoId.current++;
      setToasts((lista) => [...lista.slice(-3), { id, mensagem, tipo }]);
      setTimeout(() => fechar(id), tipo === 'erro' ? 8000 : 5000);
    },
    [fechar],
  );

  const valor = useMemo(
    () => ({
      sucesso: (m) => mostrar(m, 'sucesso'),
      erro: (m) => mostrar(m, 'erro'),
      info: (m) => mostrar(m, 'info'),
    }),
    [mostrar],
  );

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => {
          const estilo = ESTILOS[t.tipo] || ESTILOS.info;
          const Icone = estilo.icone;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-full max-w-sm animate-slide-in items-start gap-3 rounded-xl border px-4 py-3 shadow-lift ${estilo.classe}`}
            >
              <Icone className={`mt-0.5 size-5 shrink-0 ${estilo.cor}`} aria-hidden="true" />
              <p className="flex-1 text-sm font-medium">{t.mensagem}</p>
              <button
                type="button"
                onClick={() => fechar(t.id)}
                className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Fechar notificação"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}
