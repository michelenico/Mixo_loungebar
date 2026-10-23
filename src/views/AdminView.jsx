import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, LogOut, Pencil, Play, Plus, Save, Trash2, Users } from 'lucide-react';
import { formatWeek, ranking, timeToReset } from '../services/weekly.js';
import { uid } from '../utils/uid.js';

export function AdminView(props) {
  const { goTo } = props;
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authChecking, setAuthChecking] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [tab, setTab] = useState('menu');

  useEffect(() => {
    fetch('/api/admin/session')
      .then((response) => {
        if (response.ok) setAuthed(true);
        else if (response.status !== 401) setAuthError('Impossibile verificare la sessione. Riprova.');
        setAuthChecking(false);
      })
      .catch(() => {
        setAuthError('Impossibile verificare la sessione. Riprova.');
        setAuthChecking(false);
      });
  }, []);

  async function login(event) {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwInput }),
      });
      if (!response.ok) {
        setAuthError(response.status === 429
          ? 'Troppi tentativi. Riprova più tardi.'
          : 'Password non corretta.');
        return;
      }
      setAuthed(true);
      setPwInput('');
    } catch {
      setAuthError('Impossibile contattare il server. Riprova.');
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function logout() {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed');
      setAuthed(false);
      setAuthError('');
    } catch {
      setAuthError('Impossibile terminare la sessione. Riprova.');
    }
  }

  if (authChecking) {
    return <div className="admin-lock"><div className="section-sub">Verifica sessione...</div></div>;
  }

  if (!authed) {
    return (
      <div className="admin-lock">
        <div className="lock-circle"><Lock size={26} /></div>
        <div className="section-title">Area gestione</div>
        <div className="section-sub">Accesso riservato al titolare.</div>
        <form onSubmit={login}>
          <div className="form-field" style={{ width: '100%', maxWidth: 260 }}>
            <input type="password" placeholder="Password" value={pwInput} autoComplete="current-password"
              onChange={(e) => setPwInput(e.target.value)} required />
          </div>
          <button className="btn btn-black" type="submit" disabled={authSubmitting}>
            {authSubmitting ? 'Verifica...' : 'Accedi'}
          </button>
        </form>
        {authError && <div className="section-sub" role="alert">{authError}</div>}
        {goTo && (
          <button className="btn btn-outline btn-sm" style={{ marginTop: 14 }} onClick={() => goTo('home')}>
            <ChevronLeft size={14} /> Torna al sito
          </button>
        )}
      </div>
    );
  }

  const tabs = [
    { id: 'menu', label: 'Menu' },
    { id: 'galleria', label: 'Galleria' },
    { id: 'traguardo', label: 'Traguardo' },
    { id: 'recensioni', label: 'Recensioni' },
    { id: 'serate', label: 'Serate speciali' },
    { id: 'contatti', label: 'Contatti' },
    { id: 'prenotazioni', label: 'Prenotazioni' },
    { id: 'gioco', label: 'Gioco' },
    { id: 'classifica', label: 'Classifica settimanale' },
    { id: 'coupon', label: 'Coupon vinti' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <div>
      <div className="section" style={{ paddingBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-title">Pannello di gestione</div>
        {authError && <div className="section-sub" role="alert">{authError}</div>}
        <div style={{ display: 'flex', gap: 6 }}>
          {goTo && <button className="btn btn-outline btn-sm" onClick={() => goTo('home')}><ChevronLeft size={14} /> Sito</button>}
          <button className="btn btn-outline btn-sm" onClick={logout}><LogOut size={14} /> Esci</button>
        </div>
      </div>
      <div className="admin-tabs">
        {tabs.map((t) => (
          <button key={t.id} className={'admin-tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="admin-section">
        {tab === 'menu' && <AdminMenu {...props} />}
        {tab === 'galleria' && <AdminGallery {...props} />}
        {tab === 'traguardo' && <AdminAchievement {...props} />}
        {tab === 'recensioni' && <AdminReviews {...props} />}
        {tab === 'serate' && <AdminEvents {...props} />}
        {tab === 'contatti' && <AdminContact {...props} />}
        {tab === 'prenotazioni' && <AdminReservations {...props} />}
        {tab === 'gioco' && <AdminGame {...props} />}
        {tab === 'classifica' && <AdminWeekly {...props} />}
        {tab === 'coupon' && <AdminCoupons {...props} />}
        {tab === 'account' && <AdminAccount />}
      </div>
    </div>
  );
}

function AdminMenu({ menu, setMenu, showToast }) {
  const [editing, setEditing] = useState(null); // item object or 'new'
  const blank = { id: '', category: 'I Cavalli di Battaglia', name: '', desc: '', price: 0, gf: false, image: '' };

  function startNew() { setEditing({ ...blank, id: uid() }); }
  async function save(item) {
    const exists = menu.some((m) => m.id === item.id);
    const next = exists ? menu.map((m) => (m.id === item.id ? item : m)) : [...menu, item];
    await setMenu(next);
    setEditing(null);
    showToast('Piatto salvato');
  }
  async function remove(id) {
    await setMenu(menu.filter((m) => m.id !== id));
    showToast('Piatto eliminato');
  }

  if (editing) {
    return (
      <div>
        <div className="form-field"><label>Nome</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
        <div className="form-field"><label>Categoria</label><input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
        <div className="form-field"><label>Descrizione</label><textarea rows={3} value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></div>
        <div className="form-field"><label>Prezzo (€)</label><input type="number" step="0.5" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} /></div>
        <div className="form-field"><label>URL foto (facoltativo)</label><input value={editing.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." /></div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 14 }}>
          <input type="checkbox" checked={editing.gf} onChange={(e) => setEditing({ ...editing, gf: e.target.checked })} /> Senza glutine
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setEditing(null)}>Annulla</button>
          <button className="btn btn-red" style={{ flex: 1 }} onClick={() => save(editing)}><Save size={14} /> Salva</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-accent btn-block" style={{ marginBottom: 14 }} onClick={startNew}><Plus size={16} /> Aggiungi piatto</button>
      {menu.map((m) => (
        <div key={m.id} className="item-row">
          <div className="item-row-top">
            <b style={{ fontSize: 14 }}>{m.name}</b>
            <div>
              <button className="icon-btn" onClick={() => setEditing(m)}><Pencil size={16} /></button>
              <button className="icon-btn" onClick={() => remove(m.id)}><Trash2 size={16} /></button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.category} · €{Number(m.price).toFixed(2)}{m.gf ? ' · GF' : ''}</div>
        </div>
      ))}
    </div>
  );
}

const GALLERY_COLORS = ['#080808', '#111111', '#FFFFFF', '#F4F4F4', '#C9C9C9', '#262626'];

function AdminGallery({ gallery, setGallery, showToast }) {
  const [editing, setEditing] = useState(null);
  function startNew() { setEditing({ id: uid(), caption: '', color: GALLERY_COLORS[0], video: false, image: '' }); }
  async function save(g) {
    const exists = gallery.some((x) => x.id === g.id);
    const next = exists ? gallery.map((x) => (x.id === g.id ? g : x)) : [...gallery, g];
    await setGallery(next);
    setEditing(null);
    showToast('Foto salvata');
  }
  async function remove(id) { await setGallery(gallery.filter((x) => x.id !== id)); showToast('Foto eliminata'); }
  async function move(id, dir) {
    const idx = gallery.findIndex((x) => x.id === id);
    const to = idx + dir;
    if (to < 0 || to >= gallery.length) return;
    const next = [...gallery];
    [next[idx], next[to]] = [next[to], next[idx]];
    await setGallery(next);
  }

  if (editing) {
    return (
      <div>
        <div className="section-sub">Incolla il link della foto. Se manca, verra mostrato un segnaposto minimale con il marchio.</div>
        <div className="form-field"><label>Didascalia</label><input value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} /></div>
        <div className="form-field"><label>URL foto (facoltativo)</label><input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." /></div>
        <div className="form-field">
          <label>Colore segnaposto</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {GALLERY_COLORS.map((c) => (
              <div key={c} onClick={() => setEditing({ ...editing, color: c })}
                style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer', border: editing.color === c ? '3px solid var(--accent)' : '2px solid rgba(255,255,255,0.18)' }} />
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 14 }}>
          <input type="checkbox" checked={editing.video} onChange={(e) => setEditing({ ...editing, video: e.target.checked })} /> Mostra badge video (reel)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setEditing(null)}>Annulla</button>
          <button className="btn btn-red" style={{ flex: 1 }} onClick={() => save(editing)}><Save size={14} /> Salva</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-accent btn-block" style={{ marginBottom: 14 }} onClick={startNew}><Plus size={16} /> Aggiungi foto</button>
      <div className="gallery-grid" style={{ padding: 0, marginBottom: 16 }}>
        {gallery.map((g) => (
          <div key={g.id} className="gallery-tile" style={{ background: g.image ? '#000' : g.color }}>
            {g.image ? <img src={g.image} alt={g.caption} /> : <span className="photo-placeholder">TB</span>}
            {g.video && <div className="gallery-video-badge"><Play size={11} fill="#161310" color="#161310" /></div>}
            <div className="gallery-caption">{g.caption}</div>
          </div>
        ))}
      </div>
      {gallery.map((g) => (
        <div key={g.id} className="item-row">
          <div className="item-row-top">
            <b style={{ fontSize: 13 }}>{g.caption || '(senza titolo)'}</b>
            <div>
              <button className="icon-btn" onClick={() => move(g.id, -1)}><ChevronLeft size={16} /></button>
              <button className="icon-btn" onClick={() => move(g.id, 1)}><ChevronRight size={16} /></button>
              <button className="icon-btn" onClick={() => setEditing(g)}><Pencil size={16} /></button>
              <button className="icon-btn" onClick={() => remove(g.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminAchievement({ achievement, setAchievement, showToast }) {
  const [form, setForm] = useState(achievement);
  async function save() { await setAchievement(form); showToast('Traguardo aggiornato'); }
  return (
    <div>
      <div className="section-sub">Questo blocco appare in home page per raccontare un risultato importante (premi, riconoscimenti, traguardi).</div>
      <div className="form-field"><label>Badge testuale</label><input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} /></div>
      <div className="form-field"><label>Etichetta (es. nome del premio)</label><input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} /></div>
      <div className="form-field"><label>Titolo</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="form-field"><label>Descrizione</label><textarea rows={4} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></div>
      <button className="btn btn-red btn-block" onClick={save}><Save size={14} /> Salva</button>
    </div>
  );
}

function AdminReviews({ reviews, setReviews, showToast }) {
  const [editing, setEditing] = useState(null);
  function startNew() { setEditing({ id: uid(), name: '', stars: 5, text: '' }); }
  async function save(r) {
    const exists = reviews.some((x) => x.id === r.id);
    const next = exists ? reviews.map((x) => (x.id === r.id ? r : x)) : [...reviews, r];
    await setReviews(next);
    setEditing(null);
    showToast('Recensione salvata');
  }
  async function remove(id) { await setReviews(reviews.filter((x) => x.id !== id)); showToast('Recensione eliminata'); }

  if (editing) {
    return (
      <div>
        <div className="form-field"><label>Nome cliente</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
        <div className="form-field">
          <label>Stelle</label>
          <select value={editing.stars} onChange={(e) => setEditing({ ...editing, stars: parseInt(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="form-field"><label>Testo recensione</label><textarea rows={3} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setEditing(null)}>Annulla</button>
          <button className="btn btn-red" style={{ flex: 1 }} onClick={() => save(editing)}><Save size={14} /> Salva</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <button className="btn btn-accent btn-block" style={{ marginBottom: 14 }} onClick={startNew}><Plus size={16} /> Aggiungi recensione</button>
      {reviews.map((r) => (
        <div key={r.id} className="item-row">
          <div className="item-row-top">
            <b style={{ fontSize: 14 }}>{r.name}</b>
            <div>
              <button className="icon-btn" onClick={() => setEditing(r)}><Pencil size={16} /></button>
              <button className="icon-btn" onClick={() => remove(r.id)}><Trash2 size={16} /></button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)} — {r.text}</div>
        </div>
      ))}
    </div>
  );
}

function AdminEvents({ events, setEvents, showToast }) {
  const [editing, setEditing] = useState(null);
  function startNew() { setEditing({ id: uid(), when: '', title: '', desc: '' }); }
  async function save(o) {
    const exists = events.some((x) => x.id === o.id);
    const next = exists ? events.map((x) => (x.id === o.id ? o : x)) : [...events, o];
    await setEvents(next);
    setEditing(null);
    showToast('Serata salvata');
  }
  async function remove(id) { await setEvents(events.filter((x) => x.id !== id)); showToast('Serata eliminata'); }

  if (editing) {
    return (
      <div>
        <div className="form-field"><label>Quando</label><input placeholder="Es. Venerdì · dalle 21:30" value={editing.when || ''} onChange={(e) => setEditing({ ...editing, when: e.target.value })} /></div>
        <div className="form-field"><label>Titolo</label><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
        <div className="form-field"><label>Descrizione</label><textarea rows={3} value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setEditing(null)}>Annulla</button>
          <button className="btn btn-red" style={{ flex: 1 }} onClick={() => save(editing)}><Save size={14} /> Salva</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <button className="btn btn-accent btn-block" style={{ marginBottom: 14 }} onClick={startNew}><Plus size={16} /> Aggiungi serata</button>
      {events.map((o) => (
        <div key={o.id} className="item-row">
          <div className="item-row-top">
            <b style={{ fontSize: 14 }}>{o.title}</b>
            <div>
              <button className="icon-btn" onClick={() => setEditing(o)}><Pencil size={16} /></button>
              <button className="icon-btn" onClick={() => remove(o.id)}><Trash2 size={16} /></button>
            </div>
          </div>
          {o.when && <div className="event-when">{o.when}</div>}
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{o.desc}</div>
        </div>
      ))}
    </div>
  );
}

function AdminContact({ contact, setContact, showToast }) {
  const [form, setForm] = useState(contact);
  async function save() { await setContact(form); showToast('Contatti aggiornati'); }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div>
      <div className="form-field"><label>Telefono</label><input value={form.phone} onChange={set('phone')} /></div>
      <div className="form-field"><label>Email</label><input value={form.email} onChange={set('email')} /></div>
      <div className="form-field"><label>Indirizzo</label><input value={form.address} onChange={set('address')} /></div>
      <div className="form-field"><label>Orari pranzo</label><input value={form.hoursLunch} onChange={set('hoursLunch')} /></div>
      <div className="form-field"><label>Orari cena</label><input value={form.hoursDinner} onChange={set('hoursDinner')} /></div>
      <div className="form-field"><label>Giorno di chiusura</label><input value={form.closedDay} onChange={set('closedDay')} /></div>
      <div className="form-field"><label>Instagram</label><input value={form.instagram} onChange={set('instagram')} /></div>
      <div className="form-field"><label>Facebook</label><input value={form.facebook} onChange={set('facebook')} /></div>
      <div className="form-field"><label>TikTok</label><input value={form.tiktok} onChange={set('tiktok')} /></div>
      <button className="btn btn-red btn-block" onClick={save}><Save size={14} /> Salva contatti</button>
    </div>
  );
}

function AdminReservations({ reservations, setReservations, bookingConfig, setBookingConfig, showToast }) {
  const sorted = [...reservations].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  async function cancel(id) {
    await setReservations(reservations.map((r) => (r.id === id ? { ...r, status: 'annullata' } : r)));
    showToast('Prenotazione annullata');
  }
  async function remove(id) {
    await setReservations(reservations.filter((r) => r.id !== id));
    showToast('Prenotazione eliminata');
  }
  async function updateMax(v) {
    await setBookingConfig({ ...bookingConfig, maxPerSlot: parseInt(v) || 1 });
  }
  return (
    <div>
      <div className="form-field" style={{ maxWidth: 180 }}>
        <label>Posti massimi per orario</label>
        <input type="number" value={bookingConfig.maxPerSlot} onChange={(e) => updateMax(e.target.value)} />
      </div>
      {sorted.length === 0 && <div className="section-sub">Nessuna prenotazione ancora.</div>}
      {sorted.map((r) => (
        <div key={r.id} className="item-row">
          <div className="item-row-top">
            <b style={{ fontSize: 14 }}>{r.name}</b>
            <span className={'res-status ' + r.status}>{r.status}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {r.date} · {r.time} · <Users size={11} style={{ verticalAlign: 'middle' }} /> {r.people} · {r.phone}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {r.status !== 'annullata' && (
              <button className="btn btn-outline btn-sm" onClick={() => cancel(r.id)}>Annulla</button>
            )}
            <button className="btn btn-sm" style={{ background: 'var(--accent)', color: 'var(--black)' }} onClick={() => remove(r.id)}>Elimina</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminGame({ gameConfig, setGameConfig, showToast }) {
  const [form, setForm] = useState(gameConfig);
  async function save() { await setGameConfig(form); showToast('Impostazioni gioco salvate'); }
  return (
    <div>
      <div className="form-field"><label>Punteggio per vincere</label><input type="number" value={form.targetScore} onChange={(e) => setForm({ ...form, targetScore: parseInt(e.target.value) || 0 })} /></div>
      <div className="form-field"><label>Vite del giocatore</label><input type="number" value={form.lives} onChange={(e) => setForm({ ...form, lives: parseInt(e.target.value) || 1 })} /></div>
      <div className="form-field"><label>Titolo premio</label><input value={form.rewardTitle} onChange={(e) => setForm({ ...form, rewardTitle: e.target.value })} /></div>
      <div className="form-field"><label>Descrizione premio</label><textarea rows={3} value={form.rewardDesc} onChange={(e) => setForm({ ...form, rewardDesc: e.target.value })} /></div>
      <div className="form-field"><label>Prefisso codice coupon</label><input value={form.couponPrefix} onChange={(e) => setForm({ ...form, couponPrefix: e.target.value.toUpperCase() })} /></div>
      <div className="form-field"><label>Premio della settimana (al primo in classifica)</label><input value={form.weeklyPrize} onChange={(e) => setForm({ ...form, weeklyPrize: e.target.value })} /></div>
      <div className="form-field"><label>Partite valide per la classifica, al giorno per persona</label><input type="number" min={1} value={form.maxPlaysPerDay} onChange={(e) => setForm({ ...form, maxPlaysPerDay: Math.max(1, parseInt(e.target.value) || 1) })} /></div>
      <button className="btn btn-red btn-block" onClick={save}><Save size={14} /> Salva</button>
    </div>
  );
}

function AdminWeekly({ weeklyBoard, setWeeklyBoard, weeklyWinners, setWeeklyWinners, resetWeekNow, gameConfig, showToast }) {
  const board = ranking(weeklyBoard);
  async function removePlayer(playerId) {
    if (!window.confirm('Togliere questo giocatore dalla classifica di questa settimana?')) return;
    await setWeeklyBoard({ ...weeklyBoard, entries: weeklyBoard.entries.filter((e) => e.playerId !== playerId) });
    showToast('Giocatore rimosso');
  }
  async function resetNow() {
    if (!window.confirm('Chiudere la settimana adesso? Il primo in classifica va tra i vincitori e i punti ripartono da zero.')) return;
    await resetWeekNow();
    showToast('Settimana chiusa');
  }
  async function toggleDelivered(id) {
    await setWeeklyWinners(weeklyWinners.map((w) => (w.id === id ? { ...w, delivered: !w.delivered } : w)));
  }
  return (
    <div>
      <div className="section-title" style={{ fontSize: 15 }}>Settimana {formatWeek(weeklyBoard.week)}</div>
      <div className="section-sub">In palio: {gameConfig.weeklyPrize}. Si azzera da sola lunedì alle 00:00 (tra {timeToReset()}).</div>
      {board.length === 0 && <div className="section-sub">Nessun punto ancora questa settimana.</div>}
      {board.map((e, i) => (
        <div key={e.playerId} className="item-row">
          <div className="item-row-top">
            <b style={{ fontSize: 14 }}>{i + 1}. {e.name}</b>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <b style={{ fontFamily: 'var(--font-mono)' }}>{e.points}</b>
              <button className="icon-btn" onClick={() => removePlayer(e.playerId)} aria-label="Rimuovi"><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      ))}
      <button className="btn btn-outline btn-block" style={{ margin: '6px 0 22px' }} onClick={resetNow}>Chiudi la settimana adesso</button>

      <div className="section-title" style={{ fontSize: 15 }}>Vincitori</div>
      {weeklyWinners.length === 0 && <div className="section-sub">Ancora nessun vincitore.</div>}
      {weeklyWinners.map((w) => (
        <div key={w.id} className="item-row">
          <div className="item-row-top">
            <b style={{ fontSize: 14 }}>{w.name}</b>
            <span className={'res-status ' + (w.delivered ? 'confermata' : 'annullata')}>{w.delivered ? 'consegnato' : 'da consegnare'}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Settimana {formatWeek(w.week)} · {w.points} punti · {w.prize}</div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => toggleDelivered(w.id)}>
            {w.delivered ? 'Segna come da consegnare' : 'Segna come consegnato'}
          </button>
        </div>
      ))}
    </div>
  );
}

function AdminCoupons({ coupons, setCoupons, showToast }) {
  async function toggle(id) {
    await setCoupons(coupons.map((c) => (c.id === id ? { ...c, redeemed: !c.redeemed } : c)));
  }
  const sorted = [...coupons].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div>
      {sorted.length === 0 && <div className="section-sub">Ancora nessun coupon vinto.</div>}
      {sorted.map((c) => (
        <div key={c.id} className="item-row">
          <div className="item-row-top">
            <b style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.code}</b>
            <span className={'res-status ' + (c.redeemed ? 'confermata' : 'annullata')}>{c.redeemed ? 'usato' : 'da usare'}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.name} · {c.score} punti · {new Date(c.date).toLocaleDateString('it-IT')}</div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => toggle(c.id)}>
            {c.redeemed ? 'Segna come da usare' : 'Segna come usato'}
          </button>
        </div>
      ))}
    </div>
  );
}

function AdminAccount() {
  return (
    <div>
      <div className="section-sub">La password di accesso viene configurata sul server e non è salvata nel browser.</div>
    </div>
  );
}
