
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { useAuth } from '../../contexts/AuthContext'
import {
  getStudent,
  updateStudentPreferredName,
} from '../../services/studentService'
import './Profile.css'

type StudentProfile = {
  nome_completo?: string
  nome_preferido?: string
  cpf?: string
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function getDisplayName(student: StudentProfile) {
  return student.nome_preferido?.trim() || student.nome_completo?.trim() || 'aluno'
}

function getInitial(student: StudentProfile) {
  return getDisplayName(student).charAt(0).toUpperCase()
}

function ProfileFeedback({ children }: { children: string }) {
  return (
    <section className="profile-feedback surface-card" role="status">
      <p>{children}</p>
    </section>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 20c.7-3.35 2.85-5.25 6.5-5.25s5.8 1.9 6.5 5.25" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.75 19 6.5v5.05c0 4.1-2.55 7.25-7 8.7-4.45-1.45-7-4.6-7-8.7V6.5l7-2.75Z" />
      <path d="m9.2 12 1.8 1.8 3.8-4" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 10.75v5M12 7.8v.1" />
    </svg>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() { await signOut(auth); navigate('/entrar', { replace: true }) }

  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [preferredName, setPreferredName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let active = true

    async function loadStudent() {
      if (!user) return

      setLoading(true)
      setError('')

      try {
        const data = await getStudent(user.uid)

        if (!active) return

        if (!data) {
          setStudent(null)
          setError('Não encontramos os dados cadastrais deste aluno.')
          return
        }

        const studentData = data as StudentProfile

        setStudent(studentData)
        setPreferredName(studentData.nome_preferido || '')
      } catch {
        if (active) {
          setError('Não foi possível carregar seu perfil. Tente novamente mais tarde.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadStudent()

    return () => {
      active = false
    }
  }, [user])

  async function handleSavePreferredName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user || !student) return

    const name = preferredName.trim()

    if (!name) {
      setSaveError('Informe seu nome preferido.')
      setSaveMessage('')
      return
    }

    if (name.length > 40) {
      setSaveError('O nome preferido deve ter no máximo 40 caracteres.')
      setSaveMessage('')
      return
    }

    setSaving(true)
    setSaveError('')
    setSaveMessage('')

    try {
      await updateStudentPreferredName(user.uid, name)

      setStudent(current =>
        current ? { ...current, nome_preferido: name } : current,
      )
      setPreferredName(name)
      setSaveMessage('Nome preferido atualizado com sucesso!')
    } catch {
      setSaveError('Não foi possível salvar seu nome. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="profile-page page-shell" id="conteudo-principal">
      <header className="profile-page__heading page-heading">
        <p className="eyebrow">Área do aluno</p>
        <h1>Meu perfil</h1>
        <p className="page-lead">Consulte seus dados cadastrais com segurança.</p>
      </header>

      {loading && <ProfileFeedback>Carregando seus dados...</ProfileFeedback>}

      {!loading && error && <ProfileFeedback>{error}</ProfileFeedback>}

      {!loading && !error && student && (
        <>
          <section className="profile-hero" aria-labelledby="profile-greeting">
            <div className="profile-hero__identity">
              <span className="profile-hero__avatar" aria-hidden="true">
                {getInitial(student)}
              </span>

              <div>
                <p className="profile-hero__eyebrow">Minha área</p>
                <h2 id="profile-greeting">Olá, {getDisplayName(student)}.</h2>
                <p className="profile-hero__description">
                  Consulte suas informações pessoais e acompanhe seu acesso ao SER.
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
                  <PersonIcon />
                </span>

                <div>
                  <h2>Como você é chamado?</h2>
                  <p>Escolha como gostaria de ser chamado nos atendimentos do SER.</p>
                </div>
              </div>

              <form className="profile-form" onSubmit={handleSavePreferredName}>
                <label htmlFor="preferred-name">Nome preferido</label>

                <input
                  id="preferred-name"
                  name="nome_preferido"
                  type="text"
                  value={preferredName}
                  onChange={event => {
                    setPreferredName(event.target.value)
                    setSaveMessage('')
                    setSaveError('')
                  }}
                  placeholder="Digite como gostaria de ser chamado"
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
                  disabled={saving || !preferredName.trim()}
                >
                  {saving ? 'Salvando...' : 'Salvar nome'}
                </button>

                {saveMessage && (
                  <p className="profile-form__success" role="status">
                    {saveMessage}
                  </p>
                )}

                {saveError && (
                  <p className="profile-form__error" role="alert">
                    {saveError}
                  </p>
                )}
              </form>
            </article>

            <article className="profile-panel surface-card">
              <div className="profile-panel__heading">
                <span className="profile-panel__icon">
                  <ShieldIcon />
                </span>

                <div>
                  <h2>Dados cadastrados</h2>
                  <p>Informações usadas para confirmar seu acesso.</p>
                </div>
              </div>

              <dl className="profile-data-list">
                <div>
                  <dt>Nome completo</dt>
                  <dd>{student.nome_completo || 'Não informado'}</dd>
                </div>

                <div>
                  <dt>Nome preferido</dt>
                  <dd>{student.nome_preferido || 'Não informado'}</dd>
                </div>

                <div>
                  <dt>CPF</dt>
                  <dd>{formatCpf(student.cpf || '') || 'Não informado'}</dd>
                </div>
              </dl>

              <p className="profile-privacy-note">
                <InfoIcon />
                <span>
                  Seus dados cadastrais são utilizados para identificação e acesso ao SER.
                </span>
              </p>
            </article>
          </section>
        </>
      )}

      <div className="profile-page__actions">
        <div>
          <p className="eyebrow">Sua conta</p>
          <h2>Acesso e agendamentos</h2>
          <p>Volte à sua área para consultar seus próximos horários.</p>
        </div>

        <div className="profile-page__account-actions">
        <button
          className="button button--soft profile-page__back"
          type="button"
          onClick={() => navigate('/agendamentos')}
        >
          Voltar
        </button>
        <button className="button button--dark profile-page__logout" type="button" onClick={handleLogout}>Sair da conta</button>
        </div>
      </div>
    </main>
  )
}
