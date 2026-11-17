import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import Home from './pages/Home/Home'
import Agendar from './pages/Agendar/Agendar'
import MeusAgendamentos from './pages/MeusAgendamentos/MeusAgendamentos'
import StudentAuth from './pages/StudentAuth/StudentAuth'
import Responsavel from './pages/Responsavel/Responsavel'
import PainelResponsavel from './pages/Responsavel/PainelResponsavel'
import AgendaResponsavel from './pages/Responsavel/AgendaResponsavel'

import './styles/pages.css'

function AppLayout() {
  const { pathname } = useLocation()
  const hideLayout = ['/entrar', '/cadastro', '/responsavel'].includes(pathname)

  return (
    <>
      {!hideLayout && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/agendamentos" element={<MeusAgendamentos />} />
        <Route path="/entrar" element={<StudentAuth />} />
        <Route path="/cadastro" element={<StudentAuth />} />
        <Route path="/responsavel" element={<Responsavel />} />
        <Route path="/painel-responsavel" element={<PainelResponsavel />} />
        <Route
          path="/painel-responsavel/agenda"
          element={<AgendaResponsavel />}
        />

        <Route
          path="*"
          element={
            <main className="page-shell">
              <section className="surface-card not-found-card">
                <h1>Página não encontrada</h1>
                <a className="button button--primary" href="/">
                  Voltar ao início
                </a>
              </section>
            </main>
          }
        />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
