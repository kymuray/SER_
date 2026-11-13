
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

import Home from './pages/Home/Home'
import Agendar from './pages/Agendar/Agendar'
import MeusAgendamentos from './pages/MeusAgendamentos/MeusAgendamentos'
import Login from './pages/Login/Login'
import Responsavel from './pages/Responsavel/Responsavel'

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/agendamentos" element={<MeusAgendamentos />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/responsavel" element={<Responsavel />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

export default App
