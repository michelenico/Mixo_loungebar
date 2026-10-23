import { CalendarDays, Gamepad2, Play, Trophy } from 'lucide-react';
import { ranking, timeToReset } from '../services/weekly.js';

export function HomeView({ menu, gallery, achievement, reviews, events, contact, gameConfig, weeklyBoard, goTo }) {
  const leader = ranking(weeklyBoard)[0];
  const hero = menu[0];
  const categoryCount = new Set(menu.map((item) => item.category)).size;
  const featuredMenu = menu.slice(0, 2);
  const scrollToEvents = () => document.getElementById('home-events')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="home-stack">
      <section className="home-hero-panel">
        <div className="home-hero-copy">
          <div className="home-eyebrow">Mixò Lounge Bar · Menu Inverno 2026/27</div>
          <h1>Mixa la tua serata.</h1>
          <p>Burger, fritti, wrap e serate speciali: menu, prenotazioni ed eventi a portata di pollice. In evidenza: {hero ? hero.name : 'i nostri cavalli di battaglia'}.</p>
        </div>
        {hero?.image && (
          <div className="home-hero-visual">
            <img src={hero.image} alt={hero.name} />
          </div>
        )}
      </section>

      <section className="home-screen">
        <div className="home-analysis-row">
          <button className="home-secondary-action" onClick={() => goTo('menu')}>
            <strong>Menu</strong>
          </button>
          <button className="home-secondary-action" onClick={() => goTo('prenota')}>
            <strong>Prenota</strong>
          </button>
        </div>

        <div className="home-main-actions">
          <button className="home-main-action" onClick={() => goTo('gioco')}>
            <strong>Gioca</strong>
            <span>Sblocca il coupon</span>
          </button>
          <button className="home-main-action" onClick={scrollToEvents}>
            <strong>Serate speciali</strong>
            <span>Scopri gli eventi</span>
          </button>
        </div>

        <div className="home-period-row">
          <span>Orari di oggi</span>
          <strong>{contact.hoursLunch} / {contact.hoursDinner}</strong>
        </div>
      </section>

      <section className="home-summary-grid">
        <article className="card compact-card">
          <p>Piatti in menu</p>
          <p className="compact-number">{menu.length}</p>
        </article>
        <article className="card compact-card">
          <p>Categorie</p>
          <p className="compact-number">{categoryCount}</p>
        </article>
        <article className="card compact-card">
          <p>Serate in programma</p>
          <p className="compact-number">{events.length}</p>
        </article>
        <article className="card compact-card">
          <p>Chiusura</p>
          <p className="compact-number">{contact.closedDay}</p>
        </article>
      </section>

      <section className="weekly-box" style={{ marginTop: 0 }}>
        <div className="weekly-head">
          <Trophy size={22} />
          <div>
            <div className="achievement-eyebrow" style={{ margin: 0 }}>Premio della settimana</div>
            <div className="weekly-prize">{gameConfig.weeklyPrize}</div>
          </div>
        </div>
        <div className="section-sub" style={{ margin: '10px 0 14px' }}>
          {leader ? `In testa: ${leader.name} con ${leader.points} punti.` : 'Nessuno in classifica: il primo posto è tuo.'} La classifica si azzera tra {timeToReset()}.
        </div>
        <button className="btn btn-accent btn-block" onClick={() => goTo('gioco')}><Gamepad2 size={16} /> Gioca e scala la classifica</button>
      </section>

      {featuredMenu.length > 0 && (
        <section className="panel">
          <div className="panel-header compact-panel-header">
            <div>
              <div className="section-title">Da assaggiare</div>
              <div className="section-sub">Due scelte rapide prima di aprire il menu completo.</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => goTo('menu')}>Menu</button>
          </div>
          <div className="menu-list">
            {featuredMenu.map((it) => (
              <div key={it.id} className="menu-card">
                <div className="menu-photo" style={it.image ? { background: '#000', padding: 0 } : undefined}>
                  {it.image
                    ? <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                    : <span className="photo-placeholder">MX</span>}
                </div>
                <div className="menu-info">
                  <div className="menu-info-top">
                    <b>{it.name}</b>
                    <span className="menu-price">€{Number(it.price).toFixed(2)}</span>
                  </div>
                  <div className="menu-desc">{it.desc}</div>
                  {it.gf && <span className="gf-badge">Gluten Free</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="panel">
          <div className="panel-header compact-panel-header">
            <div>
              <div className="section-title">Dal nostro Instagram</div>
              <div className="section-sub">Un assaggio visivo, ordinato e sempre a portata di pollice.</div>
            </div>
          </div>
          <div className="gallery-grid">
            {gallery.map((g) => (
              <div key={g.id} className="gallery-tile" style={{ background: g.image ? '#000' : g.color }}>
                {g.image ? <img src={g.image} alt={g.caption} /> : <span className="photo-placeholder">MX</span>}
                {g.video && <div className="gallery-video-badge"><Play size={11} fill="#161310" color="#161310" /></div>}
                <div className="gallery-caption">{g.caption}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="panel" id="home-events">
          <div className="panel-header compact-panel-header">
            <div>
              <div className="section-title">Serate speciali</div>
              <div className="section-sub">Gli appuntamenti del Mixò: scorri e segna la data.</div>
            </div>
          </div>
          <div className="event-row">
            {events.map((o) => (
              <div key={o.id} className="event-card">
                {o.when && <div className="event-when">{o.when}</div>}
                <b>{o.title}</b>
                <p>{o.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-header compact-panel-header">
          <div>
            <div className="section-title">Azioni rapide</div>
            <div className="section-sub">Le due scorciatoie che servono davvero dopo aver aperto l'app.</div>
          </div>
        </div>
        <div className="quick-grid">
          <div className="quick-card" onClick={() => goTo('gioco')}>
            <Gamepad2 size={26} />
            <b>Gioca e vinci</b>
            <span style={{ fontSize: 11 }}>Prendi i piatti al volo, sblocca il premio</span>
          </div>
          <div className="quick-card" onClick={() => goTo('prenota')}>
            <CalendarDays size={26} />
            <b>Prenota un tavolo</b>
            <span style={{ fontSize: 11 }}>Scegli giorno e orario</span>
          </div>
        </div>
      </section>

      {achievement && (
        <div className="achievement-section">
          <div className="achievement-badge">{achievement.badge}</div>
          <div className="achievement-eyebrow">{achievement.eyebrow}</div>
          <div className="achievement-title">{achievement.title}</div>
          <p className="achievement-desc">{achievement.desc}</p>
        </div>
      )}

      {reviews.length > 0 && (
        <section className="panel">
          <div className="panel-header compact-panel-header">
            <div>
              <div className="section-title">Cosa dicono di noi</div>
              <div className="section-sub">Recensioni compatte in stile card.</div>
            </div>
          </div>
          <div className="review-row">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-stars">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-name">{r.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="hours-section">
        <div className="achievement-eyebrow">Vieni a trovarci</div>
        <div className="section-title" style={{ color: 'var(--accent)', marginTop: 6 }}>Mixò Lounge Bar</div>
        <div className="hours-box">
          <div className="day">Pranzo</div>
          <div className="times">{contact.hoursLunch}</div>
          <div className="day" style={{ marginTop: 10 }}>Cena</div>
          <div className="times">{contact.hoursDinner}</div>
          <div className="closed">Chiuso il {contact.closedDay}</div>
        </div>
        <button className="btn btn-black btn-block" style={{ marginTop: 16 }} onClick={() => goTo('prenota')}>
          <CalendarDays size={16} /> Prenota il tuo tavolo
        </button>
      </div>
    </div>
  );
}

/* ---------------- Menu ---------------- */
