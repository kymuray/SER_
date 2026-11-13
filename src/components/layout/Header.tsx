
import { Link, NavLink } from 'react-router-dom'
import { siteNavigation } from './navigation'

const mainLinks = siteNavigation.slice(0, 3)
const accountLinks = siteNavigation.slice(3)

function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-logo" to="/" aria-label="SER — página inicial">
          SER
        </Link>

        <nav className="main-navigation" aria-label="Navegação principal">
          {mainLinks.map(({ label, href }) => (
            <NavLink
              className="main-navigation__link"
              to={href}
              key={href}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          {accountLinks.map(({ label, href }) => (
            <Link
              className={`site-action ${href === '/entrar' ? 'site-action--primary' : 'site-action--secondary'}`}
              to={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Header
