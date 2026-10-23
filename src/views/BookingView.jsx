import { useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { uid } from '../utils/uid.js';
import { DOW, nextDays } from '../utils/dates.js';

export function BookingView({ bookingConfig, reservations, setReservations, showToast }) {
  const days = nextDays(14);
  const [selDate, setSelDate] = useState(null);
  const [selTime, setSelTime] = useState(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [people, setPeople] = useState(2);
  const [done, setDone] = useState(false);

  function dateKey(d) { return d.toISOString().slice(0, 10); }

  function countForSlot(dateStr, time) {
    return reservations.filter((r) => r.date === dateStr && r.time === time && r.status !== 'annullata')
      .reduce((sum, r) => sum + r.people, 0);
  }

  async function confirm() {
    const r = {
      id: uid(), name, phone, people,
      date: dateKey(selDate), time: selTime,
      status: 'confermata', createdAt: new Date().toISOString(),
    };
    await setReservations([...reservations, r]);
    setDone(true);
    showToast('Prenotazione confermata!');
  }

  if (done) {
    return (
      <div className="panel confirm-box">
        <div className="check-circle"><Check size={30} /></div>
        <div className="section-title">Prenotazione ricevuta</div>
        <div className="section-sub">Ti aspettiamo al Mixò Lounge Bar.</div>
        <div className="recap">
          <div><span>Nome</span><b>{name}</b></div>
          <div><span>Data</span><b>{selDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</b></div>
          <div><span>Orario</span><b>{selTime}</b></div>
          <div><span>Persone</span><b>{people}</b></div>
        </div>
        <button className="btn btn-black" onClick={() => { setDone(false); setStep(1); setSelDate(null); setSelTime(null); setName(''); setPhone(''); setPeople(2); }}>
          Nuova prenotazione
        </button>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="section-title">Prenota un tavolo</div>
      <div className="section-sub">Passo {step} di 3</div>

      {step === 1 && (
        <>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Scegli il giorno</div>
          <div className="day-scroller">
            {days.map((d, i) => {
              const closed = !bookingConfig.openWeekdays.includes(d.getDay());
              const active = selDate && dateKey(selDate) === dateKey(d);
              return (
                <div
                  key={i}
                  className={'day-chip' + (closed ? ' disabled' : '') + (active ? ' active' : '')}
                  onClick={() => { if (!closed) { setSelDate(d); setSelTime(null); } }}
                >
                  <div className="dow">{DOW[d.getDay()]}</div>
                  <div className="num">{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          <button className="btn btn-accent btn-block" style={{ marginTop: 18 }} disabled={!selDate} onClick={() => setStep(2)}>
            Continua
          </button>
        </>
      )}

      {step === 2 && selDate && (
        <>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            {selDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div className="section-sub">Scegli l'orario</div>
          <div className="slot-grid">
            {bookingConfig.slots.map((t) => {
              const used = countForSlot(dateKey(selDate), t);
              const full = used >= bookingConfig.maxPerSlot;
              return (
                <button
                  key={t}
                  className={'slot-btn' + (selTime === t ? ' active' : '') + (full ? ' full' : '')}
                  disabled={full}
                  onClick={() => setSelTime(t)}
                >
                  {t}
                  <span className="slot-avail">{full ? 'completo' : `${bookingConfig.maxPerSlot - used} posti`}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn btn-outline" onClick={() => setStep(1)}><ChevronLeft size={16} /> Indietro</button>
            <button className="btn btn-accent" style={{ flex: 1 }} disabled={!selTime} onClick={() => setStep(3)}>Continua</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="form-field">
            <label>Nome e cognome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Maria Rossi" />
          </div>
          <div className="form-field">
            <label>Telefono</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Es. 333 1234567" />
          </div>
          <div className="form-field">
            <label>Numero di persone</label>
            <div className="stepper">
              <button onClick={() => setPeople(Math.max(1, people - 1))}>−</button>
              <span>{people}</span>
              <button onClick={() => setPeople(Math.min(20, people + 1))}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn btn-outline" onClick={() => setStep(2)}><ChevronLeft size={16} /> Indietro</button>
            <button className="btn btn-red" style={{ flex: 1 }} disabled={!name || !phone} onClick={confirm}>
              Conferma prenotazione
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Game ---------------- */
