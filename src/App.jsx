import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav.jsx';
import { Footer } from './components/Footer.jsx';
import { Header } from './components/Header.jsx';
import {
  DEFAULT_ACHIEVEMENT,
  DEFAULT_BOOKING_CONFIG,
  DEFAULT_CONTACT,
  DEFAULT_GALLERY,
  DEFAULT_GAME_CONFIG,
  DEFAULT_MENU,
  DEFAULT_EVENTS,
  DEFAULT_REVIEWS,
} from './data/defaultData.js';
import {
  subscribeAuth,
  loginWithGoogle,
  logoutUser,
  fetchAppConfig,
  saveAppConfig,
  subscribeAppConfig,
  createReservationInDb,
  deleteReservationFromDb,
  updateReservationStatusInDb,
  subscribeReservations,
  saveCouponToDb,
  redeemCouponInDb,
  subscribeCoupons,
  subscribeNotifications,
  markNotificationReadInDb,
  devLoginAdmin,
} from './services/firebase.js';
import { playNotificationSound } from './utils/notifications.js';
import { loadKey, saveKey, removeKey } from './services/storage.js';
import { addScore, emptyBoard, rollover } from './services/weekly.js';
import { GlobalStyle } from './styles/GlobalStyle.jsx';
import { AdminRouteGuard } from './components/AdminRouteGuard.jsx';
import { AdminView } from './views/AdminView.jsx';
import { BookingView } from './views/BookingView.jsx';
import { GameView } from './views/GameView.jsx';
import { HomeView } from './views/HomeView.jsx';
import { MenuView } from './views/MenuView.jsx';

function hydrateImages(items, defaults, matchKey) {
  if (!Array.isArray(items)) return defaults;
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

  // Firebase Auth & Roles
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // App Data (synced with Firestore)
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
  const [notifications, setNotifications] = useState([]);

  // Clear any legacy password stored in browser storage
  useEffect(() => {
    removeKey('adminPassword').catch(() => {});
  }, []);

  // Listen to Auth state changes
  useEffect(() => {
    const unsub = subscribeAuth((currentUser, adminFlag) => {
      setUser(currentUser);
      setIsAdmin(adminFlag);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Initial Data Load & Realtime Subscriptions
  useEffect(() => {
    let unsubs = [];

    (async () => {
      try {
        const [m, g, ach, rv, o, c, bc, gc, wb, ww, pl] = await Promise.all([
          fetchAppConfig('menu', DEFAULT_MENU),
          fetchAppConfig('gallery', DEFAULT_GALLERY),
          fetchAppConfig('achievement', DEFAULT_ACHIEVEMENT),
          fetchAppConfig('reviews', DEFAULT_REVIEWS),
          fetchAppConfig('events', DEFAULT_EVENTS),
          fetchAppConfig('contact', DEFAULT_CONTACT),
          fetchAppConfig('bookingConfig', DEFAULT_BOOKING_CONFIG),
          fetchAppConfig('gameConfig', DEFAULT_GAME_CONFIG),
          fetchAppConfig('weeklyBoard', emptyBoard()),
          fetchAppConfig('weeklyWinners', []),
          loadKey('player', null),
        ]);

        setMenu(hydrateImages(m, DEFAULT_MENU, 'name'));
        setGallery(hydrateImages(g, DEFAULT_GALLERY, 'caption'));
        setAchievement(ach?.badge === String.fromCodePoint(0x1f3c6) ? { ...ach, badge: '3°' } : ach);
        setReviews(rv || []);
        setEvents(o || []);
        setContact(c || DEFAULT_CONTACT);
        setBookingConfig(bc || DEFAULT_BOOKING_CONFIG);
        const config = normalizeGameConfig(gc);
        setGameConfig(config);
        setPlayer(pl);

        const rolled = rollover(wb, ww, config.weeklyPrize);
        if (rolled) {
          setWeeklyBoard(rolled.board);
          setWeeklyWinners(rolled.winners);
          await Promise.all([
            saveAppConfig('weeklyBoard', rolled.board),
            saveAppConfig('weeklyWinners', rolled.winners),
          ]);
        } else {
          setWeeklyBoard(wb || emptyBoard());
          setWeeklyWinners(ww || []);
        }
      } catch (err) {
        console.warn('Initial load fallback to defaults', err);
      } finally {
        setLoading(false);
      }

      // Realtime listener for configs
      unsubs.push(subscribeAppConfig('menu', DEFAULT_MENU, (data) => setMenu(hydrateImages(data, DEFAULT_MENU, 'name'))));
      unsubs.push(subscribeAppConfig('gallery', DEFAULT_GALLERY, (data) => setGallery(hydrateImages(data, DEFAULT_GALLERY, 'caption'))));
      unsubs.push(subscribeAppConfig('achievement', DEFAULT_ACHIEVEMENT, (data) => setAchievement(data)));
      unsubs.push(subscribeAppConfig('reviews', DEFAULT_REVIEWS, (data) => setReviews(data)));
      unsubs.push(subscribeAppConfig('events', DEFAULT_EVENTS, (data) => setEvents(data)));
      unsubs.push(subscribeAppConfig('contact', DEFAULT_CONTACT, (data) => setContact(data)));
      unsubs.push(subscribeAppConfig('bookingConfig', DEFAULT_BOOKING_CONFIG, (data) => setBookingConfig(data)));
      unsubs.push(subscribeAppConfig('gameConfig', DEFAULT_GAME_CONFIG, (data) => setGameConfig(normalizeGameConfig(data))));
      unsubs.push(subscribeAppConfig('weeklyBoard', emptyBoard(), (data) => setWeeklyBoard(data)));
      unsubs.push(subscribeAppConfig('weeklyWinners', [], (data) => setWeeklyWinners(data)));
    })();

    return () => {
      unsubs.forEach((fn) => typeof fn === 'function' && fn());
    };
  }, []);

  // Realtime listener for reservations & coupons
  useEffect(() => {
    const unsubRes = subscribeReservations((list) => {
      setReservations(list);
    }, user, isAdmin);

    const unsubCoup = subscribeCoupons((list) => {
      setCoupons(list);
    }, user, isAdmin);

    return () => {
      unsubRes();
      unsubCoup();
    };
  }, [user, isAdmin]);

  // Realtime listener for booking notifications
  useEffect(() => {
    if (!isAdmin) {
      setNotifications([]);
      return;
    }
    let initialRun = true;
    const unsubNotif = subscribeNotifications((list) => {
      if (!initialRun) {
        const latest = list[0];
        if (latest && !latest.read) {
          playNotificationSound();
          showToast(`🔔 ${latest.title}`);
        }
      }
      initialRun = false;
      setNotifications(list);
    }, isAdmin);

    return () => unsubNotif();
  }, [isAdmin]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  // Database-backed persist methods
  const persist = {
    menu: async (v) => {
      setMenu(v);
      await saveAppConfig('menu', v);
      saveKey('menu', v).catch(() => {});
    },
    gallery: async (v) => {
      setGallery(v);
      await saveAppConfig('gallery', v);
      saveKey('gallery', v).catch(() => {});
    },
    achievement: async (v) => {
      setAchievement(v);
      await saveAppConfig('achievement', v);
      saveKey('achievement', v).catch(() => {});
    },
    reviews: async (v) => {
      setReviews(v);
      await saveAppConfig('reviews', v);
      saveKey('reviews', v).catch(() => {});
    },
    events: async (v) => {
      setEvents(v);
      await saveAppConfig('events', v);
      saveKey('events', v).catch(() => {});
    },
    contact: async (v) => {
      setContact(v);
      await saveAppConfig('contact', v);
      saveKey('contact', v).catch(() => {});
    },
    bookingConfig: async (v) => {
      setBookingConfig(v);
      await saveAppConfig('bookingConfig', v);
      saveKey('bookingConfig', v).catch(() => {});
    },
    reservations: async (v) => {
      setReservations(v);
      // If a single new item is added, sync to DB
      const latest = v[v.length - 1];
      if (latest && !reservations.some((r) => r.id === latest.id)) {
        await createReservationInDb(latest);
      }
    },
    gameConfig: async (v) => {
      setGameConfig(v);
      await saveAppConfig('gameConfig', v);
      saveKey('gameConfig', v).catch(() => {});
    },
    coupons: async (v) => {
      setCoupons(v);
      const latest = v[v.length - 1];
      if (latest && !coupons.some((c) => c.id === latest.id)) {
        await saveCouponToDb(latest);
      }
    },
    weeklyBoard: async (v) => {
      setWeeklyBoard(v);
      await saveAppConfig('weeklyBoard', v);
      saveKey('weeklyBoard', v).catch(() => {});
    },
    weeklyWinners: async (v) => {
      setWeeklyWinners(v);
      await saveAppConfig('weeklyWinners', v);
      saveKey('weeklyWinners', v).catch(() => {});
    },
    player: async (v) => {
      setPlayer(v);
      await saveKey('player', v);
    },
  };

  async function checkWeek() {
    const rolled = rollover(weeklyBoard, weeklyWinners, gameConfig.weeklyPrize);
    if (!rolled) return { board: weeklyBoard, winners: weeklyWinners };
    await Promise.all([
      persist.weeklyBoard(rolled.board),
      persist.weeklyWinners(rolled.winners),
    ]);
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
    await Promise.all([
      persist.weeklyBoard(rolled.board),
      persist.weeklyWinners(rolled.winners),
    ]);
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
            CARICAMENTO DATABASE...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tbb-root">
      <GlobalStyle />
      <div className="tbb-frame">
        <Header
          user={user}
          isAdmin={isAdmin}
          onLogin={loginWithGoogle}
          onLogout={logoutUser}
          goTo={goTo}
          view={view}
          notifications={notifications}
          onMarkNotificationRead={async (notifId) => {
            await markNotificationReadInDb(notifId);
          }}
        />
        <div className="tbb-main">
          {view === 'home' && (
            <HomeView
              menu={menu}
              gallery={gallery}
              achievement={achievement}
              reviews={reviews}
              events={events}
              contact={contact}
              gameConfig={gameConfig}
              weeklyBoard={weeklyBoard}
              goTo={goTo}
            />
          )}
          {view === 'menu' && <MenuView menu={menu} />}
          {view === 'prenota' && (
            <BookingView
              bookingConfig={bookingConfig}
              reservations={reservations}
              setReservations={persist.reservations}
              showToast={showToast}
              user={user}
              contact={contact}
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
            <AdminRouteGuard
              user={user}
              isAdmin={isAdmin}
              authLoading={authLoading}
              onLogin={loginWithGoogle}
              onLogout={logoutUser}
              onNavigateHome={() => goTo('home')}
              onDevLogin={() => {
                const devUser = devLoginAdmin();
                setUser(devUser);
                setIsAdmin(true);
                showToast('Accesso Amministratore abilitato');
              }}
            >
              <AdminView
                goTo={goTo}
                user={user}
                isAdmin={isAdmin}
                authLoading={authLoading}
                loginWithGoogle={loginWithGoogle}
                logoutUser={logoutUser}
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
            </AdminRouteGuard>
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
