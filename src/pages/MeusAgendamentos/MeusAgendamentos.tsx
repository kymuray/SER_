import { useState } from 'react'
import { Link } from 'react-router-dom'
export default function MeusAgendamentos(){const [status,setStatus]=useState<'Confirmado'|'Cancelado'>('Confirmado');
const [editing,setEditing]=useState(false);
const [newTime,setNewTime]=useState('10:00');
return <main className="page-shell">
  <div className="page-heading">
    <p className="eyebrow">Área do aluno</p>
    <h1>Meus agendamentos</h1>
    <p className="page-lead">Acompanhe seus horários e gerencie seus próximos atendimentos.</p>
  </div>
{status==='Cancelado'?<section className="surface-card empty-state">
  <h2>Nenhum agendamento ativo</h2>
  <p>Seu agendamento foi cancelado nesta demonstração. Você pode escolher um novo horário quando quiser.</p>
  <Link to="/agendar" className="button button--primary">Agendar escuta</Link>
</section>:<section className="appointment-card">
<aside className="appointment-date">
  <small>OUTUBRO</small>
  <strong>18</strong>
  <small>QUINTA-FEIRA</small>
</aside>
<div className="appointment-content">
  <span className="status-pill">
    {status}
  </span>
<h2>Escuta e Acolhimento</h2>
<div className="appointment-meta">
  <span>◷　{editing?newTime:'09:00'}
  </span>
<span>⌂　Sala de acolhimento</span>
</div>
{editing&&<div className="reschedule-box">
  <label htmlFor="new-time">Novo horário</label>
  <select id="new-time" value={newTime} onChange={e=>setNewTime(e.target.value)}
    ><option>09:00</option>
    <option>09:30</option>
    <option>10:00</option>
    <option>14:00</option>
    <option>14:30</option>
    <option>16:00</option>
  </select>
<button className="button button--primary" onClick={()=>setEditing(false)}
  >Salvar alteração</button>
</div>}
<div className="appointment-actions">
  <button className="button button--soft" onClick={()=>setEditing(!editing)}
    >{editing?'Fechar':'Remarcar'}
  </button>
<button className="button button--soft" onClick={()=>
  {if(window.confirm('Deseja cancelar este agendamento nesta demonstração?'))setStatus('Cancelado')}}
  >Cancelar</button>
</div>
</div>
</section>}
<p className="demo-note">Esta tela utiliza dados demonstrativos. As alterações não são salvas em banco de dados.</p>
</main>}
