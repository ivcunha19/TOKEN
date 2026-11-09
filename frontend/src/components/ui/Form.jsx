import { useId, useState } from 'react';
import { CircleAlert, Eye, EyeOff } from 'lucide-react';

/**
 * Campo de formulário acessível: rótulo, dica, mensagem de erro e o controle (passado como função
 * que recebe as props de acessibilidade: id, aria-invalid, aria-describedby).
 */
export function Field({ label, dica, erro, obrigatorio = false, children, className = '' }) {
  const id = useId();
  const idDica = `${id}-dica`;
  const idErro = `${id}-erro`;
  const descritores = [dica && idDica, erro && idErro].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
        {obrigatorio && (
          <span className="ml-0.5 text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({ id, 'aria-invalid': erro ? 'true' : undefined, 'aria-describedby': descritores })}
      {erro ? (
        <p id={idErro} className="flex items-center gap-1 text-xs font-medium text-rose-600">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          {erro}
        </p>
      ) : (
        dica && (
          <p id={idDica} className="text-xs text-slate-500">
            {dica}
          </p>
        )
      )}
    </div>
  );
}

export function Input({ label, dica, erro, obrigatorio, className, ...props }) {
  return (
    <Field label={label} dica={dica} erro={erro} obrigatorio={obrigatorio} className={className}>
      {(a11y) => <input className="input" required={obrigatorio} {...a11y} {...props} />}
    </Field>
  );
}

export function Textarea({ label, dica, erro, obrigatorio, className, contador, ...props }) {
  const tamanho = String(props.value ?? '').length;
  return (
    <Field
      label={label}
      dica={contador && props.maxLength ? `${dica ? `${dica} · ` : ''}${tamanho}/${props.maxLength}` : dica}
      erro={erro}
      obrigatorio={obrigatorio}
      className={className}
    >
      {(a11y) => <textarea className="input min-h-20 resize-y" required={obrigatorio} {...a11y} {...props} />}
    </Field>
  );
}

export function Select({ label, dica, erro, obrigatorio, className, opcoes = [], placeholder = 'Selecione...', ...props }) {
  return (
    <Field label={label} dica={dica} erro={erro} obrigatorio={obrigatorio} className={className}>
      {(a11y) => (
        <select className="input pr-8" required={obrigatorio} {...a11y} {...props}>
          <option value="">{placeholder}</option>
          {opcoes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function PasswordInput({ label, dica, erro, obrigatorio, className, ...props }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <Field label={label} dica={dica} erro={erro} obrigatorio={obrigatorio} className={className}>
      {(a11y) => (
        <div className="relative">
          <input
            className="input pr-11"
            type={visivel ? 'text' : 'password'}
            required={obrigatorio}
            {...a11y}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-600"
            aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visivel}
          >
            {visivel ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      )}
    </Field>
  );
}

/** Caixa de erro geral do formulário (mensagem vinda da API). */
export function FormError({ mensagem }) {
  if (!mensagem) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{mensagem}</span>
    </div>
  );
}
