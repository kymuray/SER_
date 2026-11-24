import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../services/firebase'
import { getResponsible, updateResponsiblePreferredName } from '../../services/responsibleService'
import Icon from '../../components/layout/Icon'
import '../Profile/Profile.css'

type ResponsibleProfileData = {
  nome_preferido?: string
  email?: string
}

function ProfileFeedback({ children }: { children: string }) {
  return (
    <section className="profile-feedback surface-card" role="status">
      <p>{children}</p>
    </section>
  )
}

export default function MinhaAreaResponsavel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ResponsibleProfileData | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let active = true

    async function loadResponsible() {
      setLoading(true)
      setError('')
      try {
        const data = await getResponsible()
        if (!active) return
        if (!data) {
          setProfile(null)
          setError('Não encontramos os dados cadastrais desta responsável.')
          return
        }
        const responsibleData = data as ResponsibleProfileData
        setProfile(responsibleData)
        setName(responsibleData.nome_preferido || '')
      } catch {
        if (active) setError('Não foi possível carregar seus dados. Tente novamente mais tarde.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadResponsible()
    return () => { active = false }
  }, [])

  async function handleSavePreferredName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const preferredName = name.trim()
    if (!preferredName) {
      setSaveError('Informe seu nome completo.')
      setSaveMessage('')
      return
    }
    if (preferredName.length > 40) {
      setSaveError('O nome completo deve ter no máximo 40 caracteres.')
      setSaveMessage('')
      return
    }

    setSaving(true)
    setSaveError('')
    setSaveMessage('')
    try {
      await updateResponsiblePreferredName(preferredName)
      setProfile(current => current ? { ...current, nome_preferido: preferredName } : current)
      setName(preferredName)
      setSaveMessage('Nome completo atualizado com sucesso!')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Não foi possível salvar seu nome. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/entrar', { replace: true })
  }

  const displayName = profile?.nome_preferido?.trim() || 'Responsável'
  const initial = displayName.charAt(0).toUpperCase()
  const email = user?.email || profile?.email || 'E-mail não disponível'

  return (
    <main className="profile-page page-shell" id="conteudo-principal">
      <header className="profile-page__heading page-heading">
        <p className="eyebrow">Área da responsável</p>
        <h1>Minha área</h1>
        <p className="page-lead">Consulte seus dados cadastrais com segurança.</p>
      </header>

      {loading && <ProfileFeedback>Carregando seus dados...</ProfileFeedback>}
      {!loading && error && <ProfileFeedback>{error}</ProfileFeedback>}

      {!loading && !error && profile && (
        <>
          <section className="profile-hero" aria-labelledby="profile-greeting">
            <div className="profile-hero__identity">
              <span className="profile-hero__avatar" aria-hidden="true">{initial}</span>
              <div>
                <p className="profile-hero__eyebrow">Minha área</p>
                <h2 id="profile-greeting">Olá, {displayName}.</h2>
                <p className="profile-hero__description">
                  Consulte suas informações e acompanhe seu acesso ao SER.
                </p>
              </div>
            </div>
            <span className="profile-hero__status">
              <span aria-hidden="true">✓</span>
              Conta ativa
            </span>
          </section>

          <section className="profile-grid" aria-label="Informações do perfil">
            <article className="profile-panel surface-card">
              <div className="profile-panel__heading">
                <span className="profile-panel__icon">
                  <Icon name="user" />
                </span>
                <div>
                  <h2>Como você é chamada?</h2>
                  <p>Escolha como gostaria de ser chamada durante os atendimentos do SER.</p>
                </div>
              </div>

              <form className="profile-form" onSubmit={handleSavePreferredName}>
                <label htmlFor="responsible-name">Nome completo</label>
                <input
                  id="responsible-name"
                  name="nome_preferido"
                  type="text"
                  value={name}
                  onChange={event => {
                    setName(event.target.value)
                    setSaveMessage('')
                    setSaveError('')
                  }}
                  placeholder="Digite seu nome completo"
                  maxLength={40}
                  required
                  disabled={saving}
                />
                <p className="profile-form__hint">
                  Esse nome aparecerá na sua saudação e poderá ser usado durante os atendimentos.
                </p>
                <button
                  className="profile-form__submit"
                  type="submit"
                  disabled={loading || saving || !name.trim()}
                >
                  {saving ? 'Salvando...' : 'Salvar nome'}
                </button>
                {saveMessage && <p className="profile-form__success" role="status">{saveMessage}</p>}
                {saveError && <p className="profile-form__error" role="alert">{saveError}</p>}
              </form>
            </article>

            <article className="profile-panel surface-card">
              <div className="profile-panel__heading">
                <span className="profile-panel__icon">
                  <Icon name="shield" />
                </span>
                <div>
                  <h2>Dados cadastrados</h2>
                  <p>Informações usadas para confirmar seu acesso.</p>
                </div>
              </div>

              <dl className="profile-data-list">
                <div>
                  <dt>Identificação</dt>
                  <dd>Responsável</dd>
                </div>
                <div>
                  <dt>Nome completo</dt>
                  <dd>{profile.nome_preferido || 'Não informado'}</dd>
                </div>
                <div>
                  <dt>E-mail</dt>
                  <dd>{email}</dd>
                </div>
              </dl>

              <p className="profile-privacy-note">
                <Icon name="info" />
                <span>Seus dados cadastrais são utilizados para identificação e acesso ao SER.</span>
              </p>
            </article>
          </section>
        </>
      )}

      <div className="profile-page__actions">
        <div>
          <p className="eyebrow">Sua conta</p>
          <h2>Acesso e agendamentos</h2>
          <p>Volte à sua área para consultar os atendimentos e organizar os horários.</p>
        </div>
        <div className="profile-page__account-actions">
          <button
            className="button button--soft profile-page__back"
            type="button"
            onClick={() => navigate('/painel-responsavel')}
          >
            <Icon name="arrow-left" /> Voltar
          </button>
          <button
            className="button button--dark profile-page__logout"
            type="button"
            onClick={handleLogout}
          >
            <Icon name="logout" /> Sair da conta
          </button>
        </div>
      </div>
    </main>
  )
}
