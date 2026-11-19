
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function Header() {
  const { pathname } = useLocation()
  const { user, isResponsavel } = useAuth()
  const isResponsavelArea = pathname.startsWith('/painel-responsavel')

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
          <span className="header-profile-label">Responsável</span>
        ) : user && !isResponsavel ? (
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
