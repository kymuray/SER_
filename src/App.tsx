
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

import Home from './pages/Home/Home'
import Agendar from './pages/Agendar/Agendar'
import MeusAgendamentos from './pages/MeusAgendamentos/MeusAgendamentos'
import StudentAuth from './pages/StudentAuth/StudentAuth'
import Responsavel from './pages/Responsavel/Responsavel'

function AppLayout() {
  const location = useLocation()

  const hideLayout =
    location.pathname === '/entrar' ||
    location.pathname === '/responsavel'

  return (
    <>
      {!hideLayout && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/agendamentos" element={<MeusAgendamentos />} />
        <Route path="/entrar" element={<StudentAuth />} />
        <Route path="/responsavel" element={<Responsavel />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
