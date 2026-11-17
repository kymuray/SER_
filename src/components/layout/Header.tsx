import { Link, NavLink, useLocation } from 'react-router-dom'

function Header() {
  const { pathname } = useLocation()
  const isResponsavelArea = pathname.startsWith('/painel-responsavel')

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-logo" to="/" aria-label="SER — página inicial">
          SER
        </Link>

        {isResponsavelArea ? (
          <nav className="main-navigation" aria-label="Navegação da responsável">
            <NavLink
              className="main-navigation__link"
              to="/painel-responsavel"
              end
            >
              Início
            </NavLink>
            <NavLink
              className="main-navigation__link"
              to="/painel-responsavel/agenda"
            >
              Agenda
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
        ) : (
          <div className="site-header__actions">
            <Link className="site-action site-action--primary" to="/entrar">
              Entrar
            </Link>
            <Link
              className="site-action site-action--secondary"
              to="/responsavel"
            >
              Responsável
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
