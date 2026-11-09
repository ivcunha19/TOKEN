import { useCallback, useState } from 'react';
import { ApiError } from '../lib/api';

/**
 * Estado de formulário controlado com validação no cliente e erros vindos da API.
 * - validar(valores) → { campo: 'mensagem' } (vazio = válido)
 * - enviar(fn) → handler de submit; erros de campo da API (ApiError.campos) aparecem nos campos.
 */
export function useFormulario(valoresIniciais, validar = () => ({})) {
  const [valores, setValores] = useState(valoresIniciais);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = useCallback((campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  }, []);

  /** Props prontas para um <Input>: value, onChange e erro. */
  const campo = useCallback(
    (nome, transformar = (x) => x) => ({
      name: nome,
      value: valores[nome] ?? '',
      erro: erros[nome],
      onChange: (e) => alterar(nome, transformar(e.target.value)),
    }),
    [valores, erros, alterar],
  );

  const enviar = (fn) => async (evento) => {
    evento?.preventDefault?.();
    setErroGeral('');
    const novosErros = Object.fromEntries(Object.entries(validar(valores)).filter(([, m]) => m));
    setErros(novosErros);
    if (Object.keys(novosErros).length) {
      const primeiro = evento?.target?.querySelector?.(`[name="${Object.keys(novosErros)[0]}"]`);
      primeiro?.focus?.();
      return;
    }
    setEnviando(true);
    try {
      await fn(valores);
    } catch (erro) {
      if (erro instanceof ApiError && Object.keys(erro.campos).length) {
        setErros(erro.campos);
      }
      setErroGeral(erro.message || 'Não foi possível concluir a operação.');
    } finally {
      setEnviando(false);
    }
  };

  return { valores, setValores, alterar, campo, erros, erroGeral, setErroGeral, enviando, enviar };
}
