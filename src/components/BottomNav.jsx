import { CalendarDays, Gamepad2, Home as HomeIcon, UtensilsCrossed } from 'lucide-react';

export function BottomNav({ view, setView }) {
  const items = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'prenota', label: 'Prenota', icon: CalendarDays },
    { id: 'gioco', label: 'Gioca', icon: Gamepad2 },
  ];
  return (
    <div className="tbb-nav">
      {items.map((it) => (
        <button
          key={it.id}
          className={'nav-btn' + (view === it.id ? ' active' : '')}
          onClick={() => setView(it.id)}
        >
          <it.icon size={20} />
          {it.label}
        </button>
      ))}
    </div>
  );
}
