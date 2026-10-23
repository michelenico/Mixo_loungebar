import { useState } from 'react';
import { Bell, CheckCheck, LogIn, LogOut, ShieldCheck, Trash2, X } from 'lucide-react';

export function Header({
  user,
  isAdmin,
  onLogin,
  onLogout,
  goTo,
  view,
  notifications = [],
  onMarkNotificationRead,
  onClearNotifications,
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="tbb-header" style={{ flexWrap: 'wrap', gap: 12, position: 'relative' }}>
      <div className="logo-mark" style={{ cursor: 'pointer' }} onClick={() => goTo && goTo('home')}>
        <img className="logo-image" src="/assets/mixo-logo-white.png" alt="Mixò" />
        <div>
          <div className="logo-burger-tag">Lounge Bar</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        {/* Notification Bell (for Admins or Authenticated users) */}
        {isAdmin && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="btn btn-outline btn-sm"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 10px',
                borderRadius: '50%',
                width: 32,
                height: 32,
              }}
              title="Notifiche Prenotazioni"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 16,
                    height: 16,
                    padding: '0 3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(239,68,68,0.7)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifs && (
              <div
                style={{
                  position: 'absolute',
                  top: 40,
                  right: 0,
                  width: 'min(340px, 90vw)',
                  background: '#141414',
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
                  zIndex: 100,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                    <Bell size={14} color="var(--accent)" /> Notifiche Prenotazioni
                    {unreadCount > 0 && <span style={{ fontSize: 11, color: '#ef4444' }}>({unreadCount} nuove)</span>}
                  </div>
                  <button
                    onClick={() => setShowNotifs(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                  >
                    <X size={15} />
                  </button>
                </div>

                <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--muted)', padding: '16px 0', textAlign: 'center' }}>
                      Nessuna notifica ricevuta.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          background: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(245,242,236,0.08)',
                          borderLeft: notif.read ? '3px solid transparent' : '3px solid #22c55e',
                          borderRadius: 8,
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: notif.read ? 'var(--muted)' : 'var(--white)' }}>
                            {notif.title}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                            {new Date(notif.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', lineHeight: 1.3 }}>
                          {notif.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                          {!notif.read && (
                            <button
                              onClick={() => onMarkNotificationRead && onMarkNotificationRead(notif.id)}
                              style={{ background: 'transparent', border: 'none', color: '#22c55e', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                            >
                              <CheckCheck size={11} /> Letto
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setShowNotifs(false);
                              goTo && goTo('admin');
                            }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 10, cursor: 'pointer' }}
                          >
                            Vedi prenotazioni
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Auth Section */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--line)' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: isAdmin ? '#eab308' : 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, overflow: 'hidden' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (user.displayName || user.email || 'U')[0].toUpperCase()
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: 11, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <span style={{ fontSize: 9, color: isAdmin ? '#facc15' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
                {isAdmin && <ShieldCheck size={9} />}
                {isAdmin ? 'Admin' : 'Utente'}
              </span>
            </div>

            {isAdmin && view !== 'admin' && (
              <button
                className="btn btn-outline btn-sm"
                style={{ padding: '2px 8px', fontSize: 10, height: 24, marginLeft: 2 }}
                onClick={() => goTo('admin')}
                title="Pannello Gestione"
              >
                Gestione
              </button>
            )}

            <button
              onClick={onLogout}
              style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2, display: 'flex' }}
              title="Disconnetti"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12 }}
            onClick={onLogin}
          >
            <LogIn size={14} /> Accedi
          </button>
        )}

        <div className="logo-tagline" style={{ borderLeft: '1px solid var(--line)', paddingLeft: 10 }}>
          Menu Inverno<br />2026/27
        </div>
      </div>
    </div>
  );
}
