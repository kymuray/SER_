import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
export default function Responsavel(){const [email,setEmail]=useState('');
const [password,setPassword]=useState('');
const [feedback,setFeedback]=useState('');
const navigate=useNavigate();
function submit(e:FormEvent){e.preventDefault();
if(!email||!password){setFeedback('Preencha seu e-mail e sua senha.');
return}navigate('/painel-responsavel')}return <main className="staff-auth">
  <section className="staff-auth__message">
    <Link to="/" className="staff-auth__logo">SER</Link>
    <div>
      <h1>Privacidade em primeiro lugar</h1>
      <p>As funcionalidades administrativas e os dados dos agendamentos ficam disponíveis somente após a autenticação.</p>
    </div>
</section>
<section className="staff-auth__panel">
  <form className="staff-auth__form" onSubmit={submit}
  ><p className="eyebrow">Área do responsável</p>
  <h2>Acesso da responsável</h2>
  <p className="page-lead">Entre com suas credenciais para acessar a agenda e os registros de atendimento.</p>
  <label>E-mail<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/>
    </label>
  <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/>
    </label>
  <p className="privacy-note">♧ Acesso protegido. Não compartilhe suas credenciais com terceiros.</p>
  {feedback&&<p className="form-feedback" role="status">
    {feedback}
  </p>}
<button className="button button--primary button--wide">Entrar com segurança</button>
<button type="button" className="text-button" onClick={()=>navigate('/')}
  >Voltar</button>
</form>
</section>
</main>}
