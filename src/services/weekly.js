import { uid } from '../utils/uid.js';

// Classifica settimanale: la settimana va da lunedì 00:00 a domenica 23:59 (ora del dispositivo).

const pad = (n) => String(n).padStart(2, '0');
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function weekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export const weekKey = (date = new Date()) => toKey(weekStart(date));
export const dayKey = (date = new Date()) => toKey(date);

export function emptyBoard() {
  return { week: weekKey(), entries: [] };
}

export function ranking(board) {
  return [...(board?.entries || [])]
    .filter((e) => e.points > 0)
    // a parità di punti vince chi ci è arrivato prima
    .sort((a, b) => b.points - a.points || a.updatedAt.localeCompare(b.updatedAt));
}

// Se la settimana è cambiata (o se si forza), archivia il vincitore e riparte da zero.
export function rollover(board, winners, prize, force = false) {
  if (!force && board && !Array.isArray(board) && board.week === weekKey()) return null;
  const top = Array.isArray(board) ? null : ranking(board)[0];
  const nextWinners = top
    ? [{ id: uid(), week: board.week, name: top.name, points: top.points, prize, delivered: false }, ...winners]
    : winners;
  return { board: emptyBoard(), winners: nextWinners };
}

// Aggiunge i punti di una partita, rispettando il limite di partite valide al giorno.
export function addScore(board, player, score, maxPlaysPerDay) {
  const today = dayKey();
  const now = new Date().toISOString();
  const entries = [...board.entries];
  const i = entries.findIndex((e) => e.playerId === player.id);
  const entry = i >= 0
    ? { ...entries[i] }
    : { playerId: player.id, name: player.name, points: 0, plays: {}, updatedAt: now };
  const playedToday = entry.plays[today] || 0;
  if (playedToday >= maxPlaysPerDay) return { board, counted: false, playsLeft: 0 };

  entry.name = player.name;
  entry.plays = { [today]: playedToday + 1 };
  if (score > 0) {
    entry.points += score;
    entry.updatedAt = now;
  }
  if (i >= 0) entries[i] = entry; else entries.push(entry);
  return { board: { ...board, entries }, counted: true, playsLeft: maxPlaysPerDay - playedToday - 1 };
}

export function playsLeftToday(board, playerId, maxPlaysPerDay) {
  const entry = board?.entries?.find((e) => e.playerId === playerId);
  return Math.max(0, maxPlaysPerDay - (entry?.plays?.[dayKey()] || 0));
}

export function timeToReset(now = new Date()) {
  const next = weekStart(now);
  next.setDate(next.getDate() + 7);
  const ms = next - now;
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return days > 0 ? `${days}g ${hours}h` : `${hours}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

export function formatWeek(key) {
  const start = new Date(`${key}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const f = (d) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  return `${f(start)} – ${f(end)}`;
}
