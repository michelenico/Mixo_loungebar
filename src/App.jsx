import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav.jsx';
import { Footer } from './components/Footer.jsx';
import { Header } from './components/Header.jsx';
import { DEFAULT_ACHIEVEMENT, DEFAULT_BOOKING_CONFIG, DEFAULT_CONTACT, DEFAULT_GALLERY, DEFAULT_GAME_CONFIG, DEFAULT_MENU, DEFAULT_EVENTS, DEFAULT_REVIEWS } from './data/defaultData.js';
import { saveKey, loadKey, removeKey } from './services/storage.js';
import { addScore, emptyBoard, rollover } from './services/weekly.js';
import { GlobalStyle } from './styles/GlobalStyle.jsx';
import { AdminView } from './views/AdminView.jsx';
import { BookingView } from './views/BookingView.jsx';
import { GameView } from './views/GameView.jsx';
import { HomeView } from './views/HomeView.jsx';
import { MenuView } from './views/MenuView.jsx';

function hydrateImages(items, defaults, matchKey) {
  return items.map((item) => {
    if (item.image) return item;
    const fallback = defaults.find((entry) => entry[matchKey] === item[matchKey]);
    return fallback?.image ? { ...item, image: fallback.image } : item;
  });
}

function normalizeGameConfig(config) {
  const merged = { ...DEFAULT_GAME_CONFIG, ...config };
  return {
    ...merged,
    targetScore: Math.max(DEFAULT_GAME_CONFIG.targetScore, Number(merged.targetScore) || 0),
  };
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [toast, setToast] = useState('');

  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [gallery, setGallery] = useState(DEFAULT_GALLERY);
  const [achievement, setAchievement] = useState(DEFAULT_ACHIEVEMENT);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const [bookingConfig, setBookingConfig] = useState(DEFAULT_BOOKING_CONFIG);
  const [reservations, setReservations] = useState([]);
  const [gameConfig, setGameConfig] = useState(DEFAULT_GAME_CONFIG);
  const [coupons, setCoupons] = useState([]);
  const [weeklyBoard, setWeeklyBoard] = useState(emptyBoard);
  const [weeklyWinners, setWeeklyWinners] = useState([]);
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    (async () => {
      const [m, g, ach, rv, o, c, bc, res, gc, cp, wb, ww, pl] = await Promise.all([
        loadKey('menu', DEFAULT_MENU),
        loadKey('gallery', DEFAULT_GALLERY),
        loadKey('achievement', DEFAULT_ACHIEVEMENT),
        loadKey('reviews', DEFAULT_REVIEWS),
        loadKey('events', DEFAULT_EVENTS),
        loadKey('contact', DEFAULT_CONTACT),
        loadKey('bookingConfig', DEFAULT_BOOKING_CONFIG),
        loadKey('reservations', []),
        loadKey('gameConfig', DEFAULT_GAME_CONFIG),
        loadKey('coupons', []),
        loadKey('weeklyBoard', emptyBoard()),
        loadKey('weeklyWinners', []),
        loadKey('player', null),
      ]);
      removeKey('adminPassword').catch((error) => console.error('Unable to clear the previously saved admin password', error));
      setMenu(hydrateImages(m, DEFAULT_MENU, 'name'));
      setGallery(hydrateImages(g, DEFAULT_GALLERY, 'caption'));
      setAchievement(ach?.badge === String.fromCodePoint(0x1f3c6) ? { ...ach, badge: '3°' } : ach);
      setReviews(rv); setEvents(o); setContact(c); setBookingConfig(bc);
      const config = normalizeGameConfig(gc);
      setReservations(res); setGameConfig(config); setCoupons(cp);
      setPlayer(pl);
      const rolled = rollover(wb, ww, config.weeklyPrize);
      if (rolled) {
        setWeeklyBoard(rolled.board); setWeeklyWinners(rolled.winners);
        await Promise.all([saveKey('weeklyBoard', rolled.board), saveKey('weeklyWinners', rolled.winners)]);
      } else {
        setWeeklyBoard(wb); setWeeklyWinners(ww);
      }
      setLoading(false);
    })();
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  // persist wrappers
  const persist = {
    menu: async (v) => { setMenu(v); await saveKey('menu', v); },
    gallery: async (v) => { setGallery(v); await saveKey('gallery', v); },
    achievement: async (v) => { setAchievement(v); await saveKey('achievement', v); },
    reviews: async (v) => { setReviews(v); await saveKey('reviews', v); },
    events: async (v) => { setEvents(v); await saveKey('events', v); },
    contact: async (v) => { setContact(v); await saveKey('contact', v); },
    bookingConfig: async (v) => { setBookingConfig(v); await saveKey('bookingConfig', v); },
    reservations: async (v) => { setReservations(v); await saveKey('reservations', v); },
    gameConfig: async (v) => { setGameConfig(v); await saveKey('gameConfig', v); },
    coupons: async (v) => { setCoupons(v); await saveKey('coupons', v); },
    weeklyBoard: async (v) => { setWeeklyBoard(v); await saveKey('weeklyBoard', v); },
    weeklyWinners: async (v) => { setWeeklyWinners(v); await saveKey('weeklyWinners', v); },
    player: async (v) => { setPlayer(v); await saveKey('player', v); },
  };

  // Il lunedì la classifica riparte: controlla anche se l'app resta aperta a cavallo della settimana.
  async function checkWeek() {
    const rolled = rollover(weeklyBoard, weeklyWinners, gameConfig.weeklyPrize);
    if (!rolled) return { board: weeklyBoard, winners: weeklyWinners };
    await Promise.all([persist.weeklyBoard(rolled.board), persist.weeklyWinners(rolled.winners)]);
    return rolled;
  }

  async function recordScore(score, who) {
    const { board } = await checkWeek();
    const result = addScore(board, who, score, gameConfig.maxPlaysPerDay);
    if (result.counted) await persist.weeklyBoard(result.board);
    return result;
  }

  async function resetWeekNow() {
    const rolled = rollover(weeklyBoard, weeklyWinners, gameConfig.weeklyPrize, true);
    await Promise.all([persist.weeklyBoard(rolled.board), persist.weeklyWinners(rolled.winners)]);
  }

  function goTo(next) {
    setView(next);
    checkWeek();
  }

  if (loading) {
    return (
      <div className="tbb-root">
        <GlobalStyle />
        <div className="tbb-frame" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', background: 'var(--black)', padding: '20px 30px', borderRadius: 14 }}>
            CARICAMENTO...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tbb-root">
      <GlobalStyle />
      <div className="tbb-frame">
        <Header />
        <div className="tbb-main">
          {view === 'home' && (
            <HomeView menu={menu} gallery={gallery} achievement={achievement} reviews={reviews} events={events} contact={contact}
              gameConfig={gameConfig} weeklyBoard={weeklyBoard} goTo={goTo} />
          )}
          {view === 'menu' && <MenuView menu={menu} />}
          {view === 'prenota' && (
            <BookingView
              bookingConfig={bookingConfig}
              reservations={reservations}
              setReservations={persist.reservations}
              showToast={showToast}
            />
          )}
          {view === 'gioco' && (
            <GameView
              gameConfig={gameConfig}
              coupons={coupons}
              setCoupons={persist.coupons}
              weeklyBoard={weeklyBoard}
              weeklyWinners={weeklyWinners}
              player={player}
              setPlayer={persist.player}
              recordScore={recordScore}
            />
          )}
          {view === 'admin' && (
            <AdminView
              goTo={goTo}
              menu={menu} setMenu={persist.menu}
              gallery={gallery} setGallery={persist.gallery}
              achievement={achievement} setAchievement={persist.achievement}
              reviews={reviews} setReviews={persist.reviews}
              events={events} setEvents={persist.events}
              contact={contact} setContact={persist.contact}
              bookingConfig={bookingConfig} setBookingConfig={persist.bookingConfig}
              reservations={reservations} setReservations={persist.reservations}
              gameConfig={gameConfig} setGameConfig={persist.gameConfig}
              coupons={coupons} setCoupons={persist.coupons}
              weeklyBoard={weeklyBoard} setWeeklyBoard={persist.weeklyBoard}
              weeklyWinners={weeklyWinners} setWeeklyWinners={persist.weeklyWinners}
              resetWeekNow={resetWeekNow}
              showToast={showToast}
            />
          )}
          {view !== 'admin' && <Footer contact={contact} goTo={goTo} />}
        </div>
        {view !== 'admin' && (
          <BottomNav view={view} setView={goTo} />
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}
