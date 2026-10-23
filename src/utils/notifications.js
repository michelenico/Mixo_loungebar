// Audio chime using Web Audio API (synthesized double chime, no external asset needed)
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    // Note 1 (E5 - 659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Note 2 (B5 - 987Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('Web Audio chime not permitted yet by user interaction', err);
  }
}

// Browser native Web Notification
export async function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'default') {
        const res = await Notification.requestPermission();
        return res === 'granted';
      }
      return Notification.permission === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

export function sendBrowserNotification(title, body) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/assets/app-icon-192.png',
        badge: '/assets/favicon-32.png',
      });
    } catch (err) {
      console.warn('Notification display failed', err);
    }
  }
}

// Generate Google Calendar Add Event URL
export function getGoogleCalendarUrl({ name, date, time, guests }) {
  try {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = (time || '20:00').split(':').map(Number);
    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    const formatGCal = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const dates = `${formatGCal(startDate)}/${formatGCal(endDate)}`;
    const title = encodeURIComponent(`Prenotazione Mixò Lounge Bar - ${name}`);
    const details = encodeURIComponent(`Tavolo per ${guests} persone a nome ${name} presso Mixò Lounge Bar.`);
    const location = encodeURIComponent('Mixò Lounge Bar');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  } catch {
    return '#';
  }
}

// WhatsApp confirmation/reminder link
export function getWhatsAppBookingUrl(barPhone, { name, date, time, guests }) {
  const cleanPhone = (barPhone || '').replace(/[^0-9+]/g, '');
  const text = encodeURIComponent(
    `Ciao Mixò Lounge Bar! Confermo la prenotazione del tavolo per ${guests} persone a nome *${name}* per il giorno *${date}* alle ore *${time}*. A presto!`
  );
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${text}`;
  }
  return `https://api.whatsapp.com/send?text=${text}`;
}
