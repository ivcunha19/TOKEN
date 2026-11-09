import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carrega dados assíncronos com estados de carregamento e erro.
 * `carregar` é uma função que retorna Promise; `deps` controla quando recarregar.
 * Retorna { dados, carregando, erro, recarregar, definirDados }.
 */
export function useApi(carregar, deps = []) {
  const [estado, setEstado] = useState({ dados: undefined, carregando: true, erro: null });
  const montado = useRef(true);
  const versao = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executar = useCallback(carregar, deps);

  const recarregar = useCallback(async ({ silencioso = false } = {}) => {
    const atual = ++versao.current;
    if (!silencioso) setEstado((e) => ({ ...e, carregando: true, erro: null }));
    try {
      const dados = await executar();
      if (montado.current && atual === versao.current) setEstado({ dados, carregando: false, erro: null });
      return dados;
    } catch (erro) {
      if (montado.current && atual === versao.current) setEstado((e) => ({ ...e, carregando: false, erro }));
      return undefined;
    }
  }, [executar]);

  useEffect(() => {
    montado.current = true;
    recarregar();
    return () => {
      montado.current = false;
    };
  }, [recarregar]);

  const definirDados = useCallback((fn) => {
    setEstado((e) => ({ ...e, dados: typeof fn === 'function' ? fn(e.dados) : fn }));
  }, []);

  return { ...estado, recarregar, definirDados };
}
