import { useEffect, useState } from 'react';
import { ChevronLeft, Lock, LogOut, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';
import { getUserRoleFromDb } from '../services/firebase.js';

export function AdminRouteGuard({
  children,
  user,
  isAdmin,
  authLoading,
  onLogin,
  onLogout,
  onNavigateHome,
}) {
  const [roleFromDb, setRoleFromDb] = useState(isAdmin ? 'admin' : null);
  const [dbChecking, setDbChecking] = useState(true);

  // Directly check role in the Firestore database whenever user changes
  useEffect(() => {
    let active = true;

    async function checkRole() {
      if (authLoading) return;

      if (!user) {
        if (active) {
          setRoleFromDb('guest');
          setDbChecking(false);
        }
        return;
      }

      setDbChecking(true);
      try {
        const role = await getUserRoleFromDb(user.uid);
        if (active) {
          setRoleFromDb(role);
        }
      } catch (err) {
        console.warn('AdminRouteGuard Firestore role check failed:', err);
        if (active) {
          setRoleFromDb(isAdmin ? 'admin' : 'user');
        }
      } finally {
        if (active) {
          setDbChecking(false);
        }
      }
    }

    checkRole();

    return () => {
      active = false;
    };
  }, [user, isAdmin, authLoading]);

  // Loading state while checking authentication or Firestore role
  if (authLoading || dbChecking) {
    return (
      <div className="admin-lock">
        <div className="lock-circle" style={{ animation: 'spin 1.5s linear infinite' }}>
          <Lock size={24} />
        </div>
        <div className="section-title">Controllo Ruolo Firestore</div>
        <div className="section-sub">Verifica delle autorizzazioni dell'account nel database in corso...</div>
      </div>
    );
  }

  // 1. Unauthenticated: Hide tools and require Google login
  if (!user || roleFromDb === 'guest') {
    return (
      <div className="admin-lock">
        <div className="lock-circle">
          <Lock size={26} />
        </div>
        <div className="section-title">Area Riservata Amministrazione</div>
        <div className="section-sub">
          Questa sezione contiene gli strumenti di gestione del menu, delle prenotazioni e del locale. Accedi con il tuo account autorizzato.
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            className="btn btn-black"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              maxWidth: 280,
              margin: '0 auto',
            }}
            onClick={onLogin}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Accedi con Google
          </button>
        </div>
        {onNavigateHome && (
          <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={onNavigateHome}>
            <ChevronLeft size={14} /> Torna al sito pubblico
          </button>
        )}
      </div>
    );
  }

  // 2. Authenticated, but NOT admin in Firestore: Block and completely shield admin tools
  if (roleFromDb !== 'admin') {
    return (
      <div className="admin-lock">
        <div className="lock-circle" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
          <ShieldAlert size={28} />
        </div>
        <div className="section-title">Accesso Negato</div>
        <div className="section-sub">
          Gli strumenti di gestione sono nascosti. Il tuo utente non possiede i permessi di amministratore nel database Firestore.
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '14px 18px',
            margin: '16px auto',
            width: '100%',
            maxWidth: 320,
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div>
            <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Utente autenticato</span>
            <div style={{ fontSize: 13, fontWeight: 700, wordBreak: 'break-all' }}>{user.email}</div>
          </div>
          <div>
            <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Ruolo rilevato nel Database</span>
            <div style={{ fontSize: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <UserX size={13} /> Utente Standard (user)
            </div>
          </div>
          <div>
            <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Ruolo richiesto</span>
            <div style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <ShieldCheck size={13} /> Amministratore (admin)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280, margin: '0 auto' }}>
          <button className="btn btn-outline" onClick={onLogin}>
            Accedi con un altro account Google
          </button>
          <button className="btn btn-black" onClick={onLogout}>
            <LogOut size={14} /> Disconnetti
          </button>
          {onNavigateHome && (
            <button className="btn btn-outline btn-sm" onClick={onNavigateHome}>
              <ChevronLeft size={14} /> Torna al sito pubblico
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. User is verified admin: Render the protected management tools!
  return <>{children}</>;
}
