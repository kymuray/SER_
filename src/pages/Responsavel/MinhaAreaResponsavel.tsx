import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../services/firebase'
import { ensureResponsible, getResponsible, updateResponsiblePreferredName } from '../../services/responsibleService'
import Icon from '../../components/layout/Icon'
import '../Profile/Profile.css'

export default function MinhaAreaResponsavel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [savedName, setSavedName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!user) {
      setLoading(false)
      return () => { active = false }
    }
    async function loadProfile() {
      try {
        await ensureResponsible(user?.email || '')
        const data = await getResponsible()
        if (!active) return
        const preferred = data?.nome_preferido?.trim() || ''
        setName(preferred)
        setSavedName(preferred)
      } catch {
        if (active) setError('Não foi possível carregar seus dados.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadProfile()
    return () => { active = false }
  }, [user])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = name.trim()
    if (!value) {
      setError('Informe seu nome preferido.')
      setMessage('')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateResponsiblePreferredName(value)
      setName(value)
      setSavedName(value)
      setMessage('Nome preferido atualizado com sucesso!')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar o nome.')
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    await signOut(auth)
    navigate('/responsavel', { replace: true })
  }

  const displayName = savedName || user?.displayName?.trim() || 'Responsável'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <main className="profile-page page-shell responsible-profile" id="conteudo-principal">
      <header className="profile-page__heading page-heading">
        <p className="eyebrow">Área da responsável</p>
        <h1>Minha área</h1>
        <p className="page-lead">Gerencie suas informações de acesso.</p>
      </header>

      <section className="profile-hero" aria-labelledby="responsible-greeting">
        <div className="profile-hero__identity">
          <span className="profile-hero__avatar" aria-hidden="true">{initial}</span>
          <div>
            <p className="profile-hero__eyebrow">Minha área</p>
            <h2 id="responsible-greeting">Olá, {displayName}.</h2>
            <p className="profile-hero__description">Consulte suas informações e acompanhe seu acesso ao SER.</p>
          </div>
        </div>
        <span className="profile-hero__status"><span aria-hidden="true">✓</span> Conta ativa</span>
      </section>

      <section className="profile-grid responsible-profile__grid" aria-label="Informações da conta">
        <article className="profile-panel surface-card">
          <div className="profile-panel__heading">
            <span className="profile-panel__icon"><Icon name="user" /></span>
            <div>
              <h2>Como você é chamada?</h2>
              <p>Escolha como gostaria de ser chamada durante os atendimentos.</p>
            </div>
          </div>

          <form className="profile-form" onSubmit={save}>
            <label htmlFor="responsible-name">Nome preferido</label>
            <input
              id="responsible-name"
              name="nome_preferido"
              value={name}
              onChange={event => { setName(event.target.value); setMessage(''); setError('') }}
              placeholder="Digite como gostaria de ser chamada"
              maxLength={40}
              disabled={loading || saving}
              required
            />
            <p className="profile-form__hint">Esse nome aparecerá na sua saudação e poderá ser utilizado durante os atendimentos.</p>
            <button className="profile-form__submit" type="submit" disabled={loading || saving || !name.trim()}>
              {saving ? 'Salvando...' : 'Salvar nome'}
            </button>
          </form>
          {message && <p className="profile-form__success" role="status">{message}</p>}
          {error && <p className="profile-form__error" role="alert">{error}</p>}
        </article>

        <article className="profile-panel surface-card">
          <div className="profile-panel__heading">
            <span className="profile-panel__icon"><Icon name="shield" /></span>
            <div>
              <h2>Dados cadastrados</h2>
              <p>Informações utilizadas para confirmar seu acesso.</p>
            </div>
          </div>
          <dl className="profile-data-list">
            <div>
              <dt>Nome completo</dt>
              <dd>{user?.displayName?.trim() || displayName}</dd>
            </div>
            <div>
              <dt>Nome preferido</dt>
              <dd>{savedName || 'Não informado'}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{user?.email || 'E-mail não disponível'}</dd>
            </div>
          </dl>
          <p className="profile-privacy-note">
            <Icon name="shield" />
            Seus dados cadastrais são utilizados para identificação e acesso ao SER.
          </p>
        </article>
      </section>

      <section className="profile-page__actions responsible-profile__account">
        <div>
          <p className="eyebrow">Sua conta</p>
          <h2>Acesso e agendamentos</h2>
          <p>Volte à sua área para consultar os atendimentos e organizar os horários.</p>
        </div>
        <div className="profile-page__account-actions">
          <button className="button button--secondary responsible-profile__back" type="button" onClick={() => navigate('/painel-responsavel')}>
            <Icon name="calendar" /> Voltar
          </button>
          <button className="button button--dark responsible-profile__logout" type="button" onClick={logout}>
            <Icon name="logout" /> Sair da conta
          </button>
        </div>
      </section>
    </main>
  )
}
