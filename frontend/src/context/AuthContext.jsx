import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { definirAoPerderSessao, endpoints } from '../lib/api';

const AuthContext = createContext(null);

/** Rota inicial de cada perfil. */
export const HOME_POR_PERFIL = { ALUNO: '/aluno', PROFESSOR: '/professor', EMPRESA: '/empresa' };

/**
 * Guarda o usuário da sessão (o mesmo UsuarioLogado do back-end: id, nome, login, tipo).
 * Ao abrir a página, consulta /api/auth/me para restaurar uma sessão existente.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [sessaoExpirada, setSessaoExpirada] = useState(false);

  useEffect(() => {
    let ativo = true;
    endpoints.auth
      .me()
      .then((u) => ativo && setUsuario(u))
      .catch(() => ativo && setUsuario(null))
      .finally(() => ativo && setVerificando(false));
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    definirAoPerderSessao(() => {
      setUsuario((atual) => {
        if (atual) setSessaoExpirada(true);
        return null;
      });
    });
    return () => definirAoPerderSessao(null);
  }, []);

  const entrar = useCallback(async (login, senha) => {
    const u = await endpoints.auth.login(login, senha);
    setSessaoExpirada(false);
    setUsuario(u);
    return u;
  }, []);

  const sair = useCallback(async () => {
    try {
      await endpoints.auth.logout();
    } catch {
      /* sessão já encerrada */
    }
    setUsuario(null);
  }, []);

  /** Atualiza nome/login no cabeçalho após editar o cadastro. */
  const atualizarUsuario = useCallback((dados) => {
    setUsuario((atual) => (atual ? { ...atual, ...dados } : atual));
  }, []);

  /** Usado após excluir a conta: a sessão já foi invalidada pelo servidor. */
  const encerrarLocalmente = useCallback(() => setUsuario(null), []);

  const valor = useMemo(
    () => ({ usuario, verificando, sessaoExpirada, entrar, sair, atualizarUsuario, encerrarLocalmente }),
    [usuario, verificando, sessaoExpirada, entrar, sair, atualizarUsuario, encerrarLocalmente],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
