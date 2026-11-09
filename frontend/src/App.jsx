import { Navigate, Route, Routes } from 'react-router-dom';
import { HOME_POR_PERFIL, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { RotaProtegida, RotaPublica } from './components/RotaProtegida';
import { Carregando } from './components/ui/Feedback';
import { LoginPage } from './pages/publico/LoginPage';
import { CadastroAlunoPage } from './pages/publico/CadastroAlunoPage';
import { CadastroEmpresaPage } from './pages/publico/CadastroEmpresaPage';
import { NaoEncontradaPage } from './pages/publico/NaoEncontradaPage';
import { AlunoInicio } from './pages/aluno/AlunoInicio';
import { CatalogoVantagens } from './pages/aluno/CatalogoVantagens';
import { MeusCupons } from './pages/aluno/MeusCupons';
import { PerfilAluno } from './pages/aluno/PerfilAluno';
import { ExtratoPage } from './pages/ExtratoPage';
import { ProfessorInicio } from './pages/professor/ProfessorInicio';
import { EnviarMoedas } from './pages/professor/EnviarMoedas';
import { EmpresaInicio } from './pages/empresa/EmpresaInicio';
import { MinhasVantagens } from './pages/empresa/MinhasVantagens';
import { CuponsEmpresa } from './pages/empresa/CuponsEmpresa';
import { PerfilEmpresa } from './pages/empresa/PerfilEmpresa';

function Inicio() {
  const { usuario, verificando } = useAuth();
  if (verificando) return <Carregando texto="Verificando sessão..." />;
  return <Navigate to={usuario ? HOME_POR_PERFIL[usuario.tipo] : '/login'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />

      <Route element={<RotaPublica />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro/aluno" element={<CadastroAlunoPage />} />
        <Route path="/cadastro/empresa" element={<CadastroEmpresaPage />} />
      </Route>

      <Route element={<RotaProtegida perfil="ALUNO" />}>
        <Route path="/aluno" element={<Layout />}>
          <Route index element={<AlunoInicio />} />
          <Route path="vantagens" element={<CatalogoVantagens />} />
          <Route path="extrato" element={<ExtratoPage />} />
          <Route path="cupons" element={<MeusCupons />} />
          <Route path="perfil" element={<PerfilAluno />} />
        </Route>
      </Route>

      <Route element={<RotaProtegida perfil="PROFESSOR" />}>
        <Route path="/professor" element={<Layout />}>
          <Route index element={<ProfessorInicio />} />
          <Route path="enviar" element={<EnviarMoedas />} />
          <Route path="extrato" element={<ExtratoPage />} />
        </Route>
      </Route>

      <Route element={<RotaProtegida perfil="EMPRESA" />}>
        <Route path="/empresa" element={<Layout />}>
          <Route index element={<EmpresaInicio />} />
          <Route path="vantagens" element={<MinhasVantagens />} />
          <Route path="cupons" element={<CuponsEmpresa />} />
          <Route path="perfil" element={<PerfilEmpresa />} />
        </Route>
      </Route>

      <Route path="*" element={<NaoEncontradaPage />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
