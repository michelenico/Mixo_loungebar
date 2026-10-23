import { uid } from '../utils/uid.js';

// Foto provvisorie ritagliate dal menu cartaceo: da sostituire con scatti reali del locale.
const IMG = (name) => `/assets/menu/${name}.jpg`;

export const DEFAULT_MENU = [
  { id: uid(), category: 'I Cavalli di Battaglia', name: 'American Dream', desc: '200 gr di scottona, pomodoro, insalata, bacon croccante, cheddar fuso e salsa barbecue.', price: 7.9, gf: false, image: IMG('american-dream') },
  { id: uid(), category: 'I Cavalli di Battaglia', name: 'Crispy McBaz', desc: 'Doppio patty di hamburger, cheddar, bacon croccante e salsa burger.', price: 6.9, gf: false, image: IMG('crispy-mcbaz') },
  { id: uid(), category: 'I Cavalli di Battaglia', name: 'Legs 2.0', desc: 'Straccetti di pollo panati, insalata coleslaw e maionese al peperone.', price: 7.9, gf: false, image: IMG('legs') },
  { id: uid(), category: 'Tutti i Fritti', name: 'Patate Rustiche 150 gr', desc: 'Spesse & irregolari. Aggiunta cheddar e bacon +€1,00.', price: 2.5, gf: false, image: IMG('patate-rustiche') },
  { id: uid(), category: 'Tutti i Fritti', name: 'Patate Rustiche 300 gr', desc: 'Spesse & irregolari.', price: 4.9, gf: false, image: IMG('patate-rustiche') },
  { id: uid(), category: 'Tutti i Fritti', name: 'Loaded Fries 300 gr', desc: 'Con bacon croccante e cheddar fuso.', price: 5.9, gf: false, image: IMG('loaded-fries') },
  { id: uid(), category: 'Tutti i Fritti', name: 'Bandidos di Pollo 6 pz', desc: 'Con side di salsa a scelta.', price: 5.9, gf: false, image: IMG('bandidos') },
  { id: uid(), category: 'Tutti i Fritti', name: 'Speedy Pollo 6 pz', desc: 'Con side di salsa a scelta.', price: 4.9, gf: false, image: IMG('speedy') },
  { id: uid(), category: 'Tutti i Fritti', name: 'Spiedini di Pollo BBQ 6 pz', desc: 'Con side di salsa a scelta.', price: 4.9, gf: false, image: IMG('spiedini') },
  { id: uid(), category: 'I Sapori della Domenica', name: 'Nonna Bettina', desc: 'Baguette croccante, polpette di carne, ragù della domenica e Grana a scaglie.', price: 4.9, gf: false, image: IMG('nonna-bettina') },
  { id: uid(), category: 'I Sapori della Domenica', name: 'Nonna Maria', desc: 'Baguette croccante, polpette di carne, ragù della domenica e cacioricotta.', price: 4.9, gf: false, image: IMG('nonna-maria') },
  { id: uid(), category: 'Wrap', name: 'Ryu', desc: 'Carne tritata, cheddar, bacon, insalata e salse.', price: 6.9, gf: false, image: IMG('ryu') },
  { id: uid(), category: 'Wrap', name: 'Ken', desc: 'Petto di pollo fritto e impanato, cheddar, bacon, insalata e salse.', price: 7.9, gf: false, image: IMG('ken') },
  { id: uid(), category: 'Wrap', name: 'Branca', desc: 'Pulled pork, insalata e salsa barbecue.', price: 6.9, gf: false, image: IMG('branca') },
  { id: uid(), category: 'Hot Dog', name: 'Hot Dog Classic', desc: 'Würstel, patatine, senape e cipolla croccante.', price: 4.9, gf: false, image: IMG('hot-dog') },
  { id: uid(), category: 'Piada o Baguette', name: 'Classica', desc: 'Crudo, mozzarella, pomodoro e insalata.', price: 4.9, gf: false, image: IMG('piada-classica') },
  { id: uid(), category: 'Piada o Baguette', name: 'Leggera', desc: 'Cotto, mozzarella e insalata.', price: 4.9, gf: false, image: IMG('piada-leggera') },
];

// Serate di esempio: da confermare con il locale dal pannello di gestione.
export const DEFAULT_EVENTS = [
  { id: uid(), when: 'Giovedì · dalle 19:00', title: 'Aperitivo & DJ set', desc: 'Drink, fritti da condividere e musica dal vivo in consolle.' },
  { id: uid(), when: 'Venerdì · dalle 21:30', title: 'Street Fighter Night', desc: 'Torneo a eliminazione: scegli il tuo personaggio, Ryu, Ken o Branca, e conquista la serata.' },
  { id: uid(), when: 'Domenica · a pranzo', title: 'I Sapori della Domenica', desc: 'Le baguette di Nonna Bettina e Nonna Maria, col ragù della domenica.' },
];

export const DEFAULT_CONTACT = {
  phone: 'Da inserire',
  email: 'Da inserire',
  address: 'Da inserire',
  hoursLunch: 'Da inserire',
  hoursDinner: 'Da inserire',
  closedDay: 'Da inserire',
  instagram: '',
  facebook: '',
  tiktok: '',
};

export const DEFAULT_BOOKING_CONFIG = {
  openWeekdays: [0, 1, 2, 3, 4, 5, 6], // 0=Dom .. 6=Sab
  slots: ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'],
  maxPerSlot: 8,
};

export const DEFAULT_GAME_CONFIG = {
  targetScore: 500,
  lives: 3,
  rewardTitle: 'Patate Rustiche in omaggio!',
  rewardDesc: 'Mostra questo coupon al bancone del Mixò per ritirare il tuo premio.',
  couponPrefix: 'MIX',
  // classifica settimanale (si azzera ogni lunedì)
  weeklyPrize: 'Un Cavallo di Battaglia a scelta + Patate Rustiche',
  maxPlaysPerDay: 3,
};

export const DEFAULT_GALLERY = [
  { id: uid(), caption: 'American Dream', color: '#111111', video: false, image: IMG('american-dream') },
  { id: uid(), caption: 'Loaded Fries', color: '#111111', video: true, image: IMG('loaded-fries') },
  { id: uid(), caption: 'Legs 2.0', color: '#111111', video: false, image: IMG('legs') },
  { id: uid(), caption: 'Nonna Bettina', color: '#111111', video: false, image: IMG('nonna-bettina') },
  { id: uid(), caption: 'Wrap Ken', color: '#111111', video: true, image: IMG('ken') },
  { id: uid(), caption: 'Hot Dog Classic', color: '#111111', video: false, image: IMG('hot-dog') },
];

export const DEFAULT_ACHIEVEMENT = {
  badge: 'NEW',
  eyebrow: 'Menu Inverno 2026/27',
  title: 'Il nuovo menu è arrivato',
  desc: 'Fritti, burger, wrap da picchiaduro e i sapori della domenica: tutto il menu invernale del Mixò, da sfogliare qui.',
};

// Recensioni segnaposto: sostituirle con recensioni reali (es. da Google) prima della pubblicazione.
export const DEFAULT_REVIEWS = [];
