import { siteNavigation } from './navigation'

const mainLinks = siteNavigation.slice(0, 3)
const accountLinks = siteNavigation.slice(3)

function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-logo" href="/" aria-label="SER — página inicial">
          SER
        </a>

        <nav className="main-navigation" aria-label="Navegação principal">
          {mainLinks.map(({ label, href }) => (
            <a
              className="main-navigation__link"
              href={href}
              aria-current={href === '/' ? 'page' : undefined}
              key={href}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          {accountLinks.map(({ label, href }) => (
            <a
              className={`site-action ${href === '/entrar' ? 'site-action--primary' : 'site-action--secondary'}`}
              href={href}
              key={href}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Header
