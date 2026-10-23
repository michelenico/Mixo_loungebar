import { Camera, Clock, Mail, MapPin, MessagesSquare, Music2, Phone, Settings } from 'lucide-react';

export function Footer({ contact, goTo }) {
  return (
    <div className="tbb-footer">
      <h3>Seguici</h3>
      <div className="tbb-footer-row"><Phone size={14} /> {contact.phone}</div>
      <div className="tbb-footer-row"><Mail size={14} /> {contact.email}</div>
      <div className="tbb-footer-row"><MapPin size={14} /> {contact.address}</div>
      <div className="tbb-footer-row">
        <Clock size={14} /> {contact.hoursLunch} · {contact.hoursDinner} — chiuso {contact.closedDay}
      </div>
      <div className="social-row">
        <a className="social-btn" href="#" onClick={(e) => e.preventDefault()}><Camera size={18} /></a>
        <a className="social-btn" href="#" onClick={(e) => e.preventDefault()}><MessagesSquare size={18} /></a>
        <a className="social-btn" href="#" onClick={(e) => e.preventDefault()}><Music2 size={18} /></a>
      </div>
      {goTo && (
        <button className="footer-admin-link" onClick={() => goTo('admin')}>
          <Settings size={11} /> Gestione locale
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', marginTop: 14, opacity: 0.85 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
        <span>Connesso a Cloud Firestore</span>
      </div>
    </div>
  );
}
