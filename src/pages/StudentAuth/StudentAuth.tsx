import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../../services/firebase'
import { createStudent } from '../../services/studentService'
import './StudentAuth.css'

type Values = {
  name: string
  cpf: string
  password: string
}

const empty: Values = { name: '', cpf: '', password: '' }

function formatCpf(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)

  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function cpfToInternalEmail(cpf: string) {
  return `${cpf.replace(/\D/g, '')}@aluno.ser.app`
}

function getAuthErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este CPF já possui uma conta cadastrada.'
    case 'auth/invalid-credential':
      return 'CPF ou senha incorretos.'
    case 'auth/weak-password':
      return 'Sua senha precisa ter pelo menos 6 caracteres.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco e tente novamente.'
    case 'auth/network-request-failed':
      return 'Falha na conexão. Verifique sua internet e tente novamente.'
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Sua conta foi criada, mas não foi possível salvar seus dados. Procure a responsável.'
    default:
      return 'Não foi possível realizar o acesso. Tente novamente.'
  }
}

export default function StudentAuth() {
  const register = useLocation().pathname === '/cadastro'
  const navigate = useNavigate()

  const [values, setValues] = useState<Values>(empty)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback('')

    const cpf = values.cpf.replace(/\D/g, '')

    if (register && !values.name.trim()) {
      setFeedback('Preencha seu nome completo.')
      return
    }

    if (cpf.length !== 11) {
      setFeedback('Informe um CPF com 11 dígitos.')
      return
    }

    if (!values.password || values.password.length < 6) {
      setFeedback('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      const internalEmail = cpfToInternalEmail(cpf)

      if (register) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          internalEmail,
          values.password,
        )

        await updateProfile(credential.user, {
          displayName: values.name.trim(),
        })

        await createStudent(credential.user.uid, {
          nome_completo: values.name,
          cpf,
          nome_preferido: '',
        })
      } else {
        await signInWithEmailAndPassword(
          auth,
          internalEmail,
          values.password,
        )
      }

      navigate('/agendar')
    } catch (error) {
      setFeedback(getAuthErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="student-auth">
      <section className="student-auth__message">
        <Link className="student-auth__logo" to="/">SER</Link>

        <div className="student-auth__message-copy">
          <h1>
            {register
              ? 'Um cadastro simples. Um cuidado só seu.'
              : 'Seu momento, com privacidade.'}
          </h1>

          <p>
            Use seu acesso para escolher horários disponíveis, confirmar sua
            sessão e acompanhar seus agendamentos em um só lugar.
          </p>
        </div>
      </section>

      <section className="student-auth__panel">
        <div className="student-auth__form-wrap">
          <p className="student-auth__eyebrow">Área do aluno</p>

          <h2>
            {register ? 'Crie seu acesso!' : 'Que bom ter você aqui!'}
          </h2>

          <p className="student-auth__intro">
            {register
              ? 'Cadastre seu nome, CPF e escolha uma senha para acessar os agendamentos com segurança.'
              : 'Entre com seu CPF e sua senha para agendar ou consultar seus horários.'}
          </p>

          <form className="student-auth__form" onSubmit={submit} noValidate>
            {register && (
              <div className="student-auth__field">
                <label htmlFor="student-name">Nome completo</label>
                <input
                  id="student-name"
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) =>
                    setValues({ ...values, name: e.target.value })
                  }
                />
              </div>
            )}

            <div className="student-auth__field">
              <label htmlFor="student-cpf">CPF</label>
              <input
                id="student-cpf"
                inputMode="numeric"
                autoComplete="username"
                placeholder="000.000.000-00"
                maxLength={14}
                value={values.cpf}
                onChange={(e) =>
                  setValues({ ...values, cpf: formatCpf(e.target.value) })
                }
              />
            </div>

            <div className="student-auth__field">
              <label htmlFor="student-password">Senha</label>
              <input
                id="student-password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
              />
            </div>

            <p className="student-auth__switch">
              {register ? 'Já possui uma conta?' : 'Ainda não possui uma conta?'}{' '}
              <Link to={register ? '/entrar' : '/cadastro'}>
                {register ? 'Entrar' : 'Criar conta'}
              </Link>
            </p>

            {feedback && (
              <p className="student-auth__feedback" role="alert">
                {feedback}
              </p>
            )}

            <button
              className="student-auth__submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Aguarde...'
                : register
                  ? 'Criar conta'
                  : 'Entrar'}
            </button>

            <button
              className="student-auth__back"
              type="button"
              onClick={() => navigate('/')}
            >
              Voltar
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
