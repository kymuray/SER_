import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../../services/firebase'

const RESPONSAVEL_UID = '7NBwLe6iDrfENDbmgwTqSCtwWyl2'

export default function Responsavel() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback('')

    if (!email.trim() || !password) {
      setFeedback('Preencha seu e-mail e sua senha.')
      return
    }

    setLoading(true)

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      )

      if (credential.user.uid !== RESPONSAVEL_UID) {
        await signOut(auth)
        setFeedback('Esta conta não possui autorização para acessar a área da responsável.')
        return
      }

      navigate('/painel-responsavel')
    } catch (error) {
      const code = (error as { code?: string })?.code

      if (code === 'auth/invalid-credential') {
        setFeedback('E-mail ou senha incorretos.')
      } else if (code === 'auth/too-many-requests') {
        setFeedback('Muitas tentativas. Aguarde um pouco e tente novamente.')
      } else {
        setFeedback('Não foi possível realizar o acesso. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="staff-auth">
      <section className="staff-auth__message">
        <Link to="/" className="staff-auth__logo">SER</Link>
        <div>
          <h1>Privacidade em primeiro lugar</h1>
          <p>
            As funcionalidades administrativas e os dados dos agendamentos
            ficam disponíveis somente após a autenticação.
          </p>
        </div>
      </section>

      <section className="staff-auth__panel">
        <form className="staff-auth__form" onSubmit={submit}>
          <p className="eyebrow">Área do responsável</p>
          <h2>Acesso da responsável</h2>
          <p className="page-lead">
            Entre com suas credenciais para acessar a agenda e os registros
            de atendimento.
          </p>

          <label>
            E-mail
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <p className="privacy-note">
            ♧ Acesso protegido. Não compartilhe suas credenciais com terceiros.
          </p>

          {feedback && (
            <p className="form-feedback" role="alert">
              {feedback}
            </p>
          )}

          <button
            type="submit"
            className="button button--primary button--wide"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Entrar com segurança'}
          </button>

          <button
            type="button"
            className="text-button"
            onClick={() => navigate('/')}
          >
            Voltar
          </button>
        </form>
      </section>
    </main>
  )
}
