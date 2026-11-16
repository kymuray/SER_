import { Link } from 'react-router-dom'

export default function PainelResponsavel() {
  return (
    <main className="page-shell staff-home-shell">
      <section className="staff-welcome staff-welcome--home">
        <div className="staff-welcome__content">
          <p className="eyebrow">Área da responsável</p>
          <h1>Bem-vinda ao acesso da responsável!</h1>
          <p className="staff-welcome__description">
            Organize os horários de escuta, acompanhe os atendimentos do dia e
            mantenha os registros protegidos em um só lugar.
          </p>
          <Link
            className="button button--primary"
            to="/painel-responsavel/agenda"
          >
            Gerenciar horários
          </Link>
        </div>

        <div className="staff-highlights">
          <span>Atendimentos de hoje</span>
          <span>Horários livres</span>
          <span>Segurança</span>
        </div>
      </section>
    </main>
  )
}
