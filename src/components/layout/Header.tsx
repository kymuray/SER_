
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../services/firebase'

function Header() {
  const { pathname } = useLocation()
  const { user, isResponsavel } = useAuth()
  const navigate = useNavigate()
  const isResponsavelArea = pathname.startsWith('/painel-responsavel')

  async function handleLogout() {
    try {
      await signOut(auth)
      navigate('/entrar')
    } catch {
      // Mantém a sessão atual caso o Firebase não consiga encerrar o acesso.
    }
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-logo" to="/" aria-label="SER — página inicial">
          SER
        </Link>

        {isResponsavelArea ? (
          <nav className="main-navigation" aria-label="Navegação da responsável">
            <NavLink className="main-navigation__link" to="/painel-responsavel" end>
              Início
            </NavLink>
            <NavLink className="main-navigation__link" to="/painel-responsavel/agenda">
              Agenda
            </NavLink>
            <NavLink className="main-navigation__link" to="/painel-responsavel/gerenciamento">
              Gerenciamento
            </NavLink>
          </nav>
        ) : (
          <nav className="main-navigation" aria-label="Navegação principal">
            <NavLink className="main-navigation__link" to="/" end>
              Início
            </NavLink>
            <NavLink className="main-navigation__link" to="/agendar">
              Agendar escuta
            </NavLink>
            <NavLink className="main-navigation__link" to="/agendamentos">
              Meus agendamentos
            </NavLink>
          </nav>
        )}

        {isResponsavelArea ? (
          <div className="site-header__actions">
            <span className="header-profile-label">Responsável</span>
            <button type="button" className="site-action site-action--secondary" onClick={handleLogout}>
              Sair
            </button>
          </div>
        ) : user && !isResponsavel ? (
          <div className="site-header__actions">
            <Link className="header-user-area" to="/perfil" aria-label="Acessar minha área">

            <svg
              className="header-user-area__icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c.7-3.8 3-5.7 7-5.7s6.3 1.9 7 5.7" />
            </svg>
            <span>Minha área</span>
            </Link>
            <button type="button" className="site-action site-action--secondary" onClick={handleLogout}>
              Sair
            </button>
          </div>
        ) : (
          <div className="site-header__actions">
            <Link className="site-action site-action--primary" to="/entrar">
              Entrar
            </Link>
            <Link className="site-action site-action--secondary" to="/responsavel">
              Responsável
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
