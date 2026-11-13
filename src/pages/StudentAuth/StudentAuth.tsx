import { useState } from 'react'
import type { FormEvent } from 'react'
import './StudentAuth.css'

type AuthMode = 'login' | 'register'

type FormValues = {
  name: string
  cpf: string
  password: string
}

const initialValues: FormValues = {
  name: '',
  cpf: '',
  password: '',
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

function StudentAuth() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [values, setValues] = useState<FormValues>(initialValues)
  const [error, setError] = useState('')

  const isRegister = mode === 'register'

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setValues(initialValues)
    setError('')
  }

  function handleChange(field: keyof FormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: field === 'cpf' ? formatCpf(value) : value,
    }))
    setError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isRegister && !values.name.trim()) {
      setError('Preencha seu nome completo.')
      return
    }

    if (!values.cpf.trim() || !values.password.trim()) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    if (values.cpf.replace(/\D/g, '').length !== 11) {
      setError('Informe um CPF válido.')
      return
    }

    if (values.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setError('Esta etapa é apenas visual. A ação ainda não está disponível.')
  }

  return (
    <main className="student-auth" aria-labelledby="auth-title">
      <section className="student-auth__message">
        <a className="student-auth__logo" href="/" aria-label="SER — página inicial">
          SER
        </a>
        <div className="student-auth__message-copy">
          <h1>{isRegister ? 'Um cadastro simples. Um cuidado só seu.' : 'Seu momento, com privacidade.'}</h1>
          <p>
            Use seu acesso para escolher horários disponíveis, confirmar sua sessão e acompanhar seus agendamentos em um só lugar.
          </p>
        </div>
      </section>

      <section className="student-auth__panel">
        <div className="student-auth__form-wrap">
          <p className="student-auth__eyebrow">Área do aluno</p>
          <h2 id="auth-title">{isRegister ? 'Crie seu acesso!' : 'Que bom ter você aqui!'}</h2>
          <p className="student-auth__intro">
            {isRegister
              ? 'Cadastre seu CPF e escolha uma senha para acessar os agendamentos com segurança.'
              : 'Entre com seu CPF e sua senha para agendar ou consultar seus horários.'}
          </p>

          <form className="student-auth__form" onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <div className="student-auth__field">
                <label htmlFor="name">Nome Completo</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  required
                />
              </div>
            )}

            <div className="student-auth__field">
              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="000.000.000-00"
                maxLength={14}
                value={values.cpf}
                onChange={(event) => handleChange('cpf', event.target.value)}
                required
              />
            </div>

            <div className="student-auth__field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={values.password}
                onChange={(event) => handleChange('password', event.target.value)}
                required
              />
            </div>

            <p className="student-auth__switch">
              {isRegister ? 'Já possui uma conta?' : 'Ainda não possui uma conta?'}{' '}
              <a
                href="/entrar"
                onClick={(event) => {
                  event.preventDefault()
                  changeMode(isRegister ? 'login' : 'register')
                }}
              >
                {isRegister ? 'Entrar' : 'Criar conta'}
              </a>
            </p>

            {error && (
              <p className="student-auth__feedback" role="status">
                {error}
              </p>
            )}

            <button className="student-auth__submit" type="submit">
              {isRegister ? 'Criar conta' : 'Entrar'}
            </button>
            <a className="student-auth__back" href="/">
              Voltar
            </a>
          </form>
        </div>
      </section>
    </main>
  )
}

export default StudentAuth
