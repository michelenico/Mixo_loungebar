import { useState } from 'react';

export function MenuView({ menu }) {
  const categories = ['Tutti', ...Array.from(new Set(menu.map((m) => m.category)))];
  const [cat, setCat] = useState('Tutti');
  const items = cat === 'Tutti' ? menu : menu.filter((m) => m.category === cat);
  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-header compact-panel-header">
          <div>
            <div className="section-title">Il Menu</div>
            <div className="section-sub">Menu Inverno 2026/27.</div>
          </div>
        </div>
        <div className="cat-row">
          {categories.map((c) => (
            <button key={c} className={'cat-chip' + (cat === c ? ' active' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </section>
      <div className="menu-list">
        {items.map((it) => (
          <div key={it.id} className="menu-card">
            <div className="menu-photo" style={it.image ? { background: '#000', padding: 0 } : undefined}>
              {it.image
                ? <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
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
        {items.length === 0 && <div className="section-sub">Nessun piatto in questa categoria.</div>}
      </div>
    </div>
  );
}
