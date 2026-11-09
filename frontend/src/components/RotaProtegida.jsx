import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { HOME_POR_PERFIL, useAuth } from '../context/AuthContext';
import { Carregando } from './ui/Feedback';

/**
 * Libera as rotas filhas apenas para o perfil indicado (espelha o @PerfilPermitido do back-end).
 * Sem sessão → login; perfil diferente → painel do próprio perfil.
 */
export function RotaProtegida({ perfil }) {
  const { usuario, verificando } = useAuth();
  const location = useLocation();

  if (verificando) return <Carregando texto="Verificando sessão..." />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  if (perfil && usuario.tipo !== perfil) return <Navigate to={HOME_POR_PERFIL[usuario.tipo] || '/login'} replace />;
  return <Outlet />;
}

/** Páginas públicas (login/cadastro): quem já está logado vai direto para o painel. */
export function RotaPublica() {
  const { usuario, verificando } = useAuth();
  if (verificando) return <Carregando texto="Verificando sessão..." />;
  if (usuario) return <Navigate to={HOME_POR_PERFIL[usuario.tipo] || '/'} replace />;
  return <Outlet />;
}
