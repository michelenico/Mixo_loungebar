import { useState } from 'react';
import { Bell, Calendar, Check, ChevronLeft, MessageSquareShare } from 'lucide-react';
import { uid } from '../utils/uid.js';
import { DOW, nextDays } from '../utils/dates.js';
import { createNotificationInDb } from '../services/firebase.js';
import {
  playNotificationSound,
  sendBrowserNotification,
  requestNotificationPermission,
  getGoogleCalendarUrl,
  getWhatsAppBookingUrl,
} from '../utils/notifications.js';

export function BookingView({ bookingConfig, reservations, setReservations, showToast, user, contact }) {
  const days = nextDays(14);
  const [selDate, setSelDate] = useState(null);
  const [selTime, setSelTime] = useState(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [people, setPeople] = useState(2);
  const [done, setDone] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  function dateKey(d) { return d.toISOString().slice(0, 10); }

  function countForSlot(dateStr, time) {
    return reservations.filter((r) => r.date === dateStr && (r.time === time || r.slot === time) && r.status !== 'annullata' && r.status !== 'cancelled')
      .reduce((sum, r) => sum + (Number(r.people) || Number(r.guests) || 1), 0);
  }

  async function confirm() {
    const formattedDate = dateKey(selDate);
    const r = {
      id: uid(),
      userId: user?.uid || 'guest',
      name,
      phone,
      email: user?.email || '',
      people: Number(people),
      guests: String(people),
      date: formattedDate,
      time: selTime,
      slot: selTime,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore reservations
    await setReservations([...reservations, r]);

    // Send real-time notification to database for staff/admin
    await createNotificationInDb({
      id: uid(),
      type: 'new_booking',
      title: `Nuova prenotazione: ${name}`,
      message: `${name} (${phone}) ha prenotato per ${people} persone il ${formattedDate} alle ${selTime}.`,
      reservationId: r.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Sound chime and browser notification
    playNotificationSound();
    sendBrowserNotification(
      'Prenotazione Ricevuta!',
      `Tavolo confermato per ${name} (${people} persone) il ${formattedDate} alle ${selTime}.`
    );

    setLastBooking(r);
    setDone(true);
    showToast('Tavolo prenotato e notifica inviata!');
  }

  if (done && lastBooking) {
    const gcalUrl = getGoogleCalendarUrl(lastBooking);
    const waUrl = getWhatsAppBookingUrl(contact?.phone, lastBooking);

    return (
      <div className="panel confirm-box">
        <div className="check-circle"><Check size={30} /></div>
        <div className="section-title">Prenotazione Confermata!</div>
        <div className="section-sub">Riceverai promemoria e aggiornamenti. Ti aspettiamo al Mixò Lounge Bar!</div>

        <div className="recap" style={{ textAlign: 'left', margin: '16px 0' }}>
          <div><span>Nome</span><b>{lastBooking.name}</b></div>
          <div><span>Telefono</span><b>{lastBooking.phone}</b></div>
          <div><span>Data</span><b>{selDate?.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</b></div>
          <div><span>Orario</span><b>{lastBooking.time}</b></div>
          <div><span>Persone</span><b>{lastBooking.people}</b></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginBottom: 16 }}>
          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
          >
            <Calendar size={16} /> Aggiungi a Google Calendar
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', borderColor: '#22c55e', color: '#22c55e' }}
          >
            <MessageSquareShare size={16} /> Invia promemoria su WhatsApp
          </a>

          <button
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={async () => {
              const ok = await requestNotificationPermission();
              showToast(ok ? 'Notifiche browser abilitate!' : 'Notifiche non abilitate nel browser');
            }}
          >
            <Bell size={14} /> Abilita notifiche push sul dispositivo
          </button>
        </div>

        <button className="btn btn-black btn-block" onClick={() => { setDone(false); setStep(1); setSelDate(null); setSelTime(null); setName(''); setPhone(''); setPeople(2); setLastBooking(null); }}>
          Fai un'altra prenotazione
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
