import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
const weekdays=['D','S','T','Q','Q','S','S'];
const times=['09:00','09:30','10:30','14:00','14:30','16:00']
export default function Agendar(){const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
const [day,setDay]=useState<number|null>(null);
  const [time,setTime]=useState('');
  const [step,setStep]=useState(1);
  const [confirmed,setConfirmed]=useState(false);
  const year=month.getFullYear(),m=month.getMonth();
  const days= new Date(year,m+1,0).getDate();
  const offset=new Date(year,m,1).getDay();
  const available=useMemo(()=>Array.from({length:days},(_,i)=>i+1).filter(d=>[2,3,4].includes(new Date(year,m,d).getDay())),[days,year,m]);
  const monthName=month.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const dateLabel=day?new Date(year,m,day).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'}):''
  if(confirmed)return <main className="page-shell booking-shell">
    <div className="steps-indicator">
      <b>✓</b>
      <b>✓</b>
      <b>3</b>
    </div>
  <section className="confirmation-card">
    <div className="success-mark">✓</div>
    <span className="status-pill">Agendamento confirmado</span>
    <h1>Seu momento está reservado.</h1>
    <p>Você poderá consultar, remarcar ou cancelar este agendamento quando precisar.</p>
    <div className="booking-summary">
      <div>
        <small>Data</small>
        <strong>
          {dateLabel}
        </strong>
    </div>
  <div>
    <small>Horário</small>
    <strong>
      {time} — 30 minutos</strong>
  </div>
<div>
  <small>Local</small>
  <strong>Sala do SER</strong>
</div>
</div>
<Link className="button button--primary" to="/agendamentos">Ver meu agendamento</Link>
</section>
</main>
return <main className="page-shell booking-shell">
  <div className="page-heading">
    <p className="eyebrow">Programa SER</p>
    <h1>Agendar escuta</h1>
    <p className="page-lead">Escolha uma data e um horário disponível para seu atendimento de acolhimento.</p>
  </div>
<div className="steps-indicator">
  <b className={step>=1?'is-active':''}
    >1</b>
  <b className={step>=2?'is-active':''}
    >2</b>
  <b>3</b>
</div>
<div className="booking-grid">
  <section className="surface-card calendar-card">
    <div className="calendar-head">
      <button className="icon-button" aria-label="Mês anterior" onClick={()=>setMonth(new Date(year,m-1,1))}
        >‹</button>
      <h2>
        {monthName}
      </h2>
    <button className="icon-button" aria-label="Próximo mês" onClick={()=>setMonth(new Date(year,m+1,1))}
      >›</button>
  </div>
<div className="calendar-grid">
  {weekdays.map((d,i)=>
  <span className="weekday" key={i}
  >{d}
</span>)}{Array.from({length:offset},(_,i)=>
<span key={'blank'+i}/>)}{Array.from({length:days},(_,i)=>
{const d=i+1;
const candidate=new Date(year,m,d);
const today=new Date();
today.setHours(0,0,0,0);
const enabled=available.includes(d)&&candidate>=today;
return <button key={d} disabled={!enabled} className={`day-button ${day===d?'selected':''}`} onClick={()=>
  {setDay(d);
  setTime('');
  setStep(2)}}
  >{d}
</button>})}
</div>
<div className="calendar-legend">
  <span>
    <i/> Disponível</span>
  <span>
    <i className="legend-selected"/> Selecionado</span>
</div>
<p className="availability-note">Os horários ilustrativos seguem a disponibilidade semanal informada: terças e quartas pela manhã e quintas à tarde.</p>
</section>
<section className="surface-card time-card">
  <p className="eyebrow">
    {day?dateLabel:'Selecione uma data'}
  </p>
<h2>
  {day?`${day} de ${monthName.split(' de ')[0]}`:'Horários disponíveis'}
</h2>
<p className="field-hint">
  {day?'Selecione um horário disponível:':'Escolha primeiro um dia destacado no calendário.'}
</p>
<div className="time-options">
  {times.map(t=>
  <button key={t} disabled={!day||((new Date(year,m,day).getDay()===4)&&Number(t.slice(0,2))<12)||((new Date(year,m,day).getDay()!==4)&&Number(t.slice(0,2))>=12)} className={time===t?'chosen':''} onClick={()=>
    {setTime(t);
    setStep(2)}}
    >{t}
  </button>)}
</div>
{day&&time&&<div className="selected-slot">◷　Horário escolhido: <strong>
    {time}
  </strong>
</div>}
<button className="button button--primary button--wide" disabled={!day||!time} onClick={()=>setStep(3)}
  >Continuar</button>
{step===3&&<div className="confirm-inline">
  <p>Confirme sua escolha: <strong>
      {dateLabel}, às {time}
    </strong>.</p>
<p className="field-hint">Para concluir na versão demonstrativa, confirme abaixo.</p>
<button className="button button--primary button--wide" onClick={()=>setConfirmed(true)}
  >Confirmar agendamento</button>
</div>}
</section>
</div>
<p className="booking-footnote">Já possui um horário? <Link to="/agendamentos">Consulte seus agendamentos</Link>.</p>
</main>}
