import { siteNavigation } from './navigation'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <a className="site-footer__logo" href="/" aria-label="SER — página inicial">
          SER
        </a>

        <nav aria-label="Navegação do rodapé">
          <ul className="site-footer__links">
            {siteNavigation.map(({ label, href }) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
