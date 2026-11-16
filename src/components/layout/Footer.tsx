import { Link } from 'react-router-dom'
function Footer() { return <footer className="site-footer">
  <div className="site-footer__inner">
    <Link className="site-footer__logo" to="/">SER</Link>
    <nav aria-label="Navegação do rodapé">
      <ul className="site-footer__links">
        <li>
          <Link to="/">Início</Link>
        </li>
      <li>
        <Link to="/agendar">Agendar escuta</Link>
      </li>
    <li>
      <Link to="/agendamentos">Meus agendamentos</Link>
    </li>
  <li>
    <Link to="/entrar">Entrar</Link>
  </li>
<li>
  <Link to="/responsavel">Responsável</Link>
</li>
</ul>
</nav>
</div>
</footer> }
export default Footer
