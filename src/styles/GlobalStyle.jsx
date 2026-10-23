export function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Jost:wght@200;300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

      :root{
        color-scheme: dark;
        --black:#080808;
        --black-soft:#151515;
        --black-card:#1B1B1B;
        --accent:#F5F2EC;
        --accent-soft:#FFFFFF;
        --white:#FFFFFF;
        --bg:#080808;
        --surface:rgba(21,21,21,0.92);
        --surface-strong:#1B1B1B;
        --surface-muted:rgba(245,242,236,0.10);
        --line:rgba(245,242,236,0.22);
        --line-soft:rgba(255,255,255,0.10);
        --muted:#C9C9C9;
        --muted-strong:#E7E7E7;
        --shadow:0 24px 70px rgba(0,0,0,0.54);
        --radius:22px;
        --radius-sm:16px;
        --font-display:'Jost', system-ui, sans-serif;
        --font-body:'DM Sans', system-ui, sans-serif;
        --font-mono:'Space Mono', monospace;
      }
      *{box-sizing:border-box;}
      html,
      body,
      #root{ margin:0; min-height:100%; }
      body{ background:var(--bg); }
      .tbb-root{
        width:100%; min-height:100vh;
        background:
          radial-gradient(circle at 80% -10%, rgba(255,255,255,0.10), transparent 34%),
          radial-gradient(circle at 5% 14%, rgba(255,255,255,0.05), transparent 28%),
          linear-gradient(180deg, #050505 0%, #0C0C0C 42%, #111111 100%);
        display:flex; justify-content:center; align-items:flex-start;
        min-width:0;
        font-family:var(--font-body); color:var(--white);
      }
      .tbb-frame{
        width:min(1180px, 100%);
        min-height:100vh;
        background:transparent;
        position:relative;
        display:flex;
        flex-direction:column;
        min-width:0;
      }
      .tbb-header{
        position:sticky; top:0; z-index:30;
        display:flex; align-items:center; justify-content:space-between; gap:16px;
        margin:0 16px 6px;
        padding:16px 6px 20px;
        background:linear-gradient(180deg, rgba(8,8,8,0.98), rgba(8,8,8,0.72));
        backdrop-filter:blur(18px);
        border-bottom:1px solid rgba(245,242,236,0.22);
      }
      .logo-mark{ display:flex; align-items:center; gap:8px; min-width:0; }
      .logo-image{ width:78px; height:78px; object-fit:contain; flex:0 0 auto; display:block; filter:drop-shadow(0 12px 22px rgba(0,0,0,0.42)); }
      .logo-hills{ font-family:var(--font-display); font-size:clamp(1.5rem, 4vw, 2.55rem); font-weight:300; color:var(--white); line-height:0.95; letter-spacing:0.18em; }
      .logo-burger-tag{ display:inline-block; margin-top:6px; font-family:var(--font-mono); font-size:0.68rem; font-weight:700; letter-spacing:0.14em; color:var(--accent); text-transform:uppercase; }
      .logo-tagline{ font-size:0.74rem; font-weight:900; color:var(--white); text-align:right; line-height:1.25; opacity:0.78; text-transform:uppercase; }

      .tbb-main{ flex:1; min-width:0; padding:0 16px calc(100px + env(safe-area-inset-bottom)); }

      .zigzag{ height:1px; width:100%; margin:4px 0; background:var(--line); }

      .page-stack,
      .home-stack{ display:grid; grid-template-columns:minmax(0, 1fr); gap:18px; min-width:0; }
      .home-screen{ display:grid; grid-template-columns:minmax(0, 1fr); gap:18px; min-width:0; }
      .tbb-hero,
      .home-hero-panel,
      .panel,
      .card{
        background:var(--surface);
        border:1px solid var(--line);
        border-radius:var(--radius);
        box-shadow:var(--shadow);
        backdrop-filter:blur(16px);
        min-width:0;
        width:100%;
      }
      .tbb-hero,
      .home-hero-panel{ padding:24px; }
      .tbb-hero{ color:var(--white); text-align:left; }
      .tbb-hero-eyebrow,
      .home-eyebrow,
      .achievement-eyebrow{
        margin:0 0 8px;
        font-family:var(--font-mono);
        color:var(--accent);
        font-size:0.72rem;
        font-weight:700;
        letter-spacing:0.14em;
        text-transform:uppercase;
      }
      .tbb-hero h1,
      .home-hero-panel h1{
        margin:0;
        max-width:760px;
        font-size:clamp(2.2rem, 8vw, 5.5rem);
        line-height:0.95;
        font-family:var(--font-display);
        font-weight:400;
        letter-spacing:0;
        color:var(--white);
        overflow-wrap:anywhere;
      }
      .tbb-hero p,
      .home-hero-panel p{ max-width:680px; margin:16px 0 0; font-size:1rem; color:var(--muted-strong); line-height:1.55; }
      .home-hero-panel{
        position:relative;
        overflow:hidden;
        min-height:420px;
        display:grid;
        grid-template-columns:minmax(0, 1fr);
        align-items:end;
        background:
          linear-gradient(180deg, rgba(8,8,8,0.20), rgba(8,8,8,0.92) 64%, rgba(8,8,8,0.98)),
          var(--surface-strong);
      }
      .home-hero-copy{ position:relative; z-index:2; max-width:720px; }
      .home-hero-visual{ position:absolute; inset:0; z-index:1; }
      .home-hero-visual::after{
        content:'';
        position:absolute;
        inset:0;
        background:
          linear-gradient(90deg, rgba(8,8,8,0.85), rgba(8,8,8,0.24) 50%, rgba(8,8,8,0.10)),
          linear-gradient(180deg, transparent 0%, rgba(8,8,8,0.90) 88%);
      }
      .home-hero-visual img{
        width:100%;
        height:100%;
        object-fit:cover;
        filter:saturate(1.05) contrast(1.08) brightness(0.78);
      }
      .tbb-cta-row,
      .home-action-row{ display:flex; gap:10px; flex-wrap:wrap; margin-top:18px; }
      .home-analysis-row,
      .home-main-actions,
      .home-summary-grid,
      .quick-grid{
        display:grid;
        gap:12px;
        grid-template-columns:repeat(2, minmax(0, 1fr));
      }
      .home-secondary-action,
      .home-main-action,
      .quick-card{
        border:none;
        border-radius:24px;
        text-align:center;
        cursor:pointer;
        transition:transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      }
      .home-secondary-action{
        min-height:72px;
        padding:18px 14px;
        background:var(--surface-strong);
        border:1px solid var(--line);
        color:var(--white);
        box-shadow:0 14px 32px rgba(0,0,0,0.24);
      }
      .home-secondary-action strong{ color:var(--white); font-size:1rem; }
      .home-main-action{
        min-height:138px;
        padding:24px 18px;
        background:linear-gradient(155deg, #FFFFFF, #DAD6CE);
        color:var(--black);
        border:1px solid rgba(255,255,255,0.08);
        box-shadow:0 24px 46px rgba(0,0,0,0.36);
      }
      .home-main-action:hover,
      .home-secondary-action:hover,
      .quick-card:hover{ transform:translateY(-1px); box-shadow:0 22px 48px rgba(0,0,0,0.36); }
      .home-main-action strong{ display:block; margin-bottom:8px; font-size:clamp(1.35rem, 4vw, 1.8rem); line-height:1.05; }
      .home-main-action span{ color:rgba(8,8,8,0.76); font-size:0.92rem; }
      .quick-card span{ color:var(--muted); font-size:0.92rem; }
      .home-period-row{
        display:flex;
        justify-content:center;
        gap:8px;
        align-items:center;
        flex-wrap:wrap;
        text-align:center;
        font-size:0.95rem;
      }
      .home-period-row span{ color:var(--muted); }
      .home-period-row strong{ color:var(--white); }
      .card{ padding:18px; }
      .compact-card{ padding:16px; min-height:94px; }
      .compact-card p:first-child{ margin:0; color:var(--muted); }
      .compact-number{ margin-top:10px; color:var(--accent); font-size:clamp(1.2rem, 4vw, 1.8rem); font-weight:900; line-height:1.05; overflow-wrap:anywhere; }
      .panel{ padding:22px; }
      .panel-header{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:16px; }
      .compact-panel-header{ margin-bottom:12px; }

      .btn{
        font-family:var(--font-body);
        font-weight:900;
        border:none;
        border-radius:14px;
        min-height:48px;
        padding:0 18px;
        cursor:pointer;
        font-size:14px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        transition:transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
      }
      .btn:hover,
      .btn:focus-visible{ transform:translateY(-1px); filter:saturate(1.04); }
      .btn:active{ transform:scale(0.98); }
      .btn-accent{ background:var(--accent); color:var(--black); box-shadow:0 14px 30px rgba(0,0,0,0.34); }
      .btn-red,
      .btn-black{ background:var(--black); color:var(--accent); border:1px solid rgba(245,242,236,0.34); box-shadow:0 14px 30px rgba(0,0,0,0.34); }
      .btn-outline{ background:rgba(255,255,255,0.04); border:1px solid rgba(245,242,236,0.30); color:var(--white); box-shadow:none; }
      .btn:disabled{ opacity:0.42; cursor:not-allowed; transform:none; }
      .btn-block{ width:100%; justify-content:center; }
      .btn-sm{ min-height:38px; padding:0 12px; font-size:12px; border-radius:12px; }

      .section{ padding:22px 0; }
      .section-title{ font-family:var(--font-display); font-size:clamp(1.15rem, 3vw, 1.45rem); font-weight:900; color:var(--white); margin:0 0 4px; line-height:1.12; }
      .section-sub{ font-size:13px; color:var(--muted); margin:0 0 16px; line-height:1.45; }

      .gallery-grid{ display:grid; grid-template-columns:repeat(auto-fit, minmax(96px, 1fr)); gap:8px; }
      .gallery-tile{
        position:relative;
        aspect-ratio:1/1;
        border-radius:18px;
        overflow:hidden;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:32px;
        border:1px solid rgba(245,242,236,0.22);
        background:var(--surface-strong);
      }
      .gallery-tile img{ width:100%; height:100%; object-fit:cover; position:absolute; inset:0; filter:saturate(1.02) contrast(1.04) brightness(0.86); }
      .gallery-video-badge{ position:absolute; top:7px; right:7px; width:24px; height:24px; border-radius:999px; background:var(--accent); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(17,17,17,0.16); }
      .gallery-caption{ position:absolute; left:0; right:0; bottom:0; padding:18px 8px 8px; background:linear-gradient(transparent, rgba(17,17,17,0.88)); font-size:9.5px; font-weight:900; color:var(--accent); line-height:1.15; text-transform:uppercase; letter-spacing:0; }

      .event-row,
      .review-row{ display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; scrollbar-width:none; }
      .event-row::-webkit-scrollbar,
      .review-row::-webkit-scrollbar,
      .cat-row::-webkit-scrollbar,
      .day-scroller::-webkit-scrollbar,
      .admin-tabs::-webkit-scrollbar{ display:none; }
      .event-card{ flex:0 0 240px; background:var(--black); color:var(--white); border-radius:18px; padding:16px; border:1px solid rgba(245,242,236,0.46); box-shadow:0 18px 36px rgba(17,17,17,0.18); }
      .event-when{ font-family:var(--font-mono); font-size:10.5px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
      .event-card b{ color:var(--accent); font-size:0.96rem; display:block; margin-bottom:8px; line-height:1.15; }
      .event-card p{ font-size:12.5px; opacity:0.86; margin:0; line-height:1.45; }

      .quick-grid{ margin-top:16px; }
      .quick-card{ background:var(--surface-strong); border:1px solid var(--line); color:var(--white); padding:18px 14px; }
      .quick-card svg{ margin-bottom:8px; }
      .quick-card b{ display:block; font-size:13px; margin-bottom:4px; }

      .cat-row{ display:flex; gap:8px; overflow-x:auto; padding:0 0 14px; scrollbar-width:none; }
      .cat-chip{ flex:0 0 auto; min-height:42px; padding:0 14px; border-radius:999px; border:1px solid rgba(245,242,236,0.22); background:rgba(255,255,255,0.04); color:var(--muted); font-size:13px; font-weight:900; cursor:pointer; white-space:nowrap; }
      .cat-chip.active{ background:var(--accent); color:var(--black); border-color:var(--accent); }

      .menu-list{ display:flex; flex-direction:column; gap:12px; }
      .menu-card{ display:flex; gap:12px; background:var(--surface-strong); border:1px solid var(--line); border-radius:18px; padding:12px; box-shadow:0 14px 36px rgba(0,0,0,0.34); }
      .menu-photo{ flex:0 0 82px; height:82px; border-radius:16px; background:linear-gradient(135deg, var(--accent), #171717); display:flex; align-items:center; justify-content:center; overflow:hidden; color:var(--black); font-family:var(--font-mono); font-weight:700; font-size:18px; }
      .menu-photo img{ width:100%; height:100%; object-fit:cover; display:block; filter:saturate(1.04) contrast(1.04) brightness(0.88); }
      .photo-placeholder{ color:var(--black); background:var(--accent); width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-weight:700; font-size:18px; }
      .menu-info{ flex:1; min-width:0; }
      .menu-info-top{ display:flex; justify-content:space-between; gap:8px; align-items:baseline; }
      .menu-info-top b{ color:var(--white); font-size:14px; line-height:1.2; }
      .menu-price{ font-family:var(--font-mono); font-weight:700; color:var(--black); white-space:nowrap; background:var(--accent); border-radius:999px; padding:2px 8px; font-size:12px; }
      .menu-desc{ font-size:12px; color:var(--muted); margin:6px 0 8px; line-height:1.4; }
      .gf-badge{ display:inline-block; font-size:10px; background:var(--accent); color:var(--black); padding:3px 8px; border-radius:999px; font-weight:900; }

      .day-scroller{ display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:none; }
      .day-chip{ flex:0 0 62px; border:1px solid rgba(245,242,236,0.22); border-radius:16px; padding:10px 4px; text-align:center; cursor:pointer; background:var(--surface-strong); color:var(--white); box-shadow:0 10px 24px rgba(0,0,0,0.28); }
      .day-chip.active{ background:var(--accent); color:var(--black); border-color:var(--accent); }
      .day-chip.disabled{ opacity:0.34; cursor:not-allowed; }
      .day-chip .dow{ font-size:10px; text-transform:uppercase; font-weight:900; color:var(--muted); }
      .day-chip.active .dow{ color:rgba(8,8,8,0.68); }
      .day-chip .num{ font-family:var(--font-display); font-weight:900; font-size:20px; }

      .slot-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:14px; }
      .slot-btn{ border:1px solid rgba(245,242,236,0.22); border-radius:14px; padding:11px 4px; background:var(--surface-strong); color:var(--white); font-family:var(--font-mono); font-size:13px; cursor:pointer; text-align:center; box-shadow:0 10px 24px rgba(0,0,0,0.24); }
      .slot-btn.active{ background:var(--accent); color:var(--black); border-color:var(--accent); }
      .slot-btn.full{ opacity:0.3; cursor:not-allowed; text-decoration:line-through; }
      .slot-avail{ display:block; font-size:9px; opacity:0.7; }

      .form-field{ margin-bottom:12px; }
      .form-field label{ display:block; font-size:12px; font-weight:900; margin-bottom:6px; color:var(--white); }
      .form-field input,
      .form-field textarea,
      .form-field select{ width:100%; border:1px solid rgba(245,242,236,0.24); border-radius:14px; padding:11px 12px; font-family:var(--font-body); font-size:14px; background:#101010; color:var(--white); outline:none; }
      .form-field input:focus,
      .form-field textarea:focus,
      .form-field select:focus{ border-color:var(--accent); box-shadow:0 0 0 3px rgba(245,242,236,0.24); }
      .stepper{ display:flex; align-items:center; gap:12px; }
      .stepper button{ width:38px; height:38px; border-radius:12px; border:1px solid rgba(245,242,236,0.28); background:var(--accent); color:var(--black); font-size:18px; cursor:pointer; }
      .stepper span{ font-family:var(--font-mono); font-size:16px; min-width:20px; text-align:center; }

      .confirm-box{ text-align:center; padding:30px 20px; }
      .confirm-box .check-circle{ width:70px; height:70px; border-radius:24px; background:var(--accent); color:var(--black); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }
      .recap{ background:rgba(245,242,236,0.12); border:1px dashed rgba(245,242,236,0.38); border-radius:18px; padding:14px; text-align:left; font-size:13px; margin:14px 0; }
      .recap div{ display:flex; justify-content:space-between; gap:12px; padding:4px 0; }

      .achievement-section{ background:var(--black); color:var(--white); padding:26px 22px; text-align:left; border-radius:var(--radius); box-shadow:var(--shadow); }
      .achievement-badge{ width:56px; height:56px; border-radius:20px; background:var(--accent); color:var(--black); font-family:var(--font-mono); font-size:20px; font-weight:700; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
      .achievement-section .achievement-eyebrow{ color:var(--accent); }
      .achievement-title{ font-family:var(--font-display); color:var(--accent); font-size:1.2rem; font-weight:900; line-height:1.18; margin:8px 0 10px; }
      .achievement-desc{ font-size:13px; opacity:0.86; max-width:680px; margin:0; line-height:1.5; }

      .review-card{ flex:0 0 250px; background:var(--surface-strong); border:1px solid var(--line); border-radius:18px; padding:16px; color:var(--white); box-shadow:0 14px 32px rgba(0,0,0,0.30); }
      .review-stars{ color:var(--black); font-size:12px; margin-bottom:8px; letter-spacing:2px; background:var(--accent); display:inline-flex; padding:2px 7px; border-radius:999px; }
      .review-text{ font-size:12.5px; margin:0 0 10px; line-height:1.45; }
      .review-name{ font-size:11px; font-weight:900; color:var(--muted); }

      .hours-section{ background:var(--black); color:var(--white); padding:26px 22px; text-align:left; border-radius:var(--radius); box-shadow:var(--shadow); }
      .hours-section .section-title,
      .hours-section .achievement-eyebrow{ color:var(--accent); }
      .hours-box{ background:rgba(255,255,255,0.08); border:1px dashed rgba(245,242,236,0.58); border-radius:18px; padding:16px; margin-top:14px; }
      .hours-box .day{ color:var(--accent); font-size:15px; font-weight:900; margin-bottom:4px; }
      .hours-box .times{ font-family:var(--font-mono); font-size:13px; }
      .hours-box .closed{ font-size:11px; opacity:0.75; margin-top:6px; }

      .tbb-footer{ background:var(--black); color:var(--white); padding:24px 22px 20px; margin-top:18px; border-radius:var(--radius) var(--radius) 0 0; }
      .tbb-footer h3{ font-size:15px; color:var(--accent); margin:0 0 12px; font-weight:900; }
      .tbb-footer-row{ display:flex; align-items:center; gap:8px; font-size:12.5px; margin-bottom:8px; opacity:0.9; }
      .social-row{ display:flex; gap:10px; margin-top:14px; }
      .social-btn{ width:38px; height:38px; border-radius:14px; background:var(--accent); color:var(--black); display:flex; align-items:center; justify-content:center; }
      .footer-admin-link{ display:flex; align-items:center; gap:5px; background:none; border:none; color:rgba(255,255,255,0.46); font-size:10.5px; margin-top:20px; padding:4px 0; cursor:pointer; }
      .footer-admin-link:hover{ color:var(--accent); }

      .tbb-nav{
        position:fixed;
        left:50%;
        bottom:0;
        transform:translateX(-50%);
        z-index:40;
        display:grid;
        grid-template-columns:repeat(4, minmax(0, 1fr));
        gap:6px;
        width:min(720px, calc(100% - 16px));
        padding:10px;
        margin-bottom:max(10px, env(safe-area-inset-bottom));
        border-radius:26px;
        background:rgba(14,14,14,0.94);
        backdrop-filter:blur(20px);
        border:1px solid rgba(245,242,236,0.26);
        box-shadow:0 22px 60px rgba(0,0,0,0.54);
      }
      .nav-btn{ min-height:50px; border-radius:18px; background:transparent; border:none; color:var(--muted); padding:7px 2px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; cursor:pointer; font-size:10px; font-weight:900; }
      .nav-btn.active{ background:var(--accent); color:var(--black); border:1px solid rgba(245,242,236,0.72); }

      .game-wrap{ padding:22px; background:var(--surface); border:1px solid var(--line); border-radius:var(--radius); box-shadow:var(--shadow); backdrop-filter:blur(16px); }
      .game-hud{ display:flex; justify-content:space-between; align-items:center; font-family:var(--font-mono); font-weight:700; margin-bottom:8px; font-size:14px; }
      .game-intro-mark{ width:76px; height:76px; border-radius:28px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; background:var(--accent); color:var(--black); border:1px solid rgba(17,17,17,0.18); font-family:var(--font-mono); font-weight:700; font-size:24px; box-shadow:0 18px 42px rgba(17,17,17,0.12); }
      .game-intro-player{ width:132px; height:174px; display:flex; align-items:flex-end; justify-content:center; margin:0 auto 16px; filter:drop-shadow(0 18px 24px rgba(0,0,0,0.46)); }
      .game-intro-player img{ width:100%; height:100%; object-fit:contain; display:block; }
      .lives{ display:flex; gap:5px; align-items:center; }
      .life-dot{ width:10px; height:10px; border-radius:999px; background:var(--accent); display:block; box-shadow:0 0 0 1px rgba(255,255,255,0.18); }
      .game-canvas-box{ position:relative; border:1px solid rgba(245,242,236,0.26); border-radius:22px; overflow:hidden; background:linear-gradient(#101010,#1E1E1E); touch-action:none; box-shadow:var(--shadow); }
      .game-controls{ display:flex; gap:10px; margin-top:10px; }
      .game-controls button{ flex:1; padding:14px; border-radius:16px; border:1px solid rgba(245,242,236,0.26); background:var(--surface-strong); color:var(--accent); font-size:20px; }
      .game-overlay{ position:absolute; inset:0; background:rgba(17,17,17,0.92); color:var(--white); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:24px; gap:10px; }
      .game-overlay h2{ color:var(--accent); font-size:22px; margin:0; font-weight:900; }
      .game-overlay .btn-outline{ color:var(--accent); border-color:rgba(245,242,236,0.58); background:transparent; }
      .weekly-box{ margin-top:22px; padding:18px; border-radius:var(--radius-sm); background:var(--black); border:1px solid var(--line); }
      .weekly-head{ display:flex; gap:12px; align-items:center; color:var(--accent); }
      .weekly-prize{ font-family:var(--font-display); font-size:1.05rem; font-weight:500; color:var(--white); margin-top:4px; line-height:1.2; }
      .weekly-row{ display:flex; justify-content:space-between; align-items:center; gap:10px; padding:9px 10px; border-radius:12px; font-size:13px; color:var(--white); }
      .weekly-row:nth-child(odd){ background:rgba(255,255,255,0.03); }
      .weekly-row.me{ background:var(--accent); color:var(--black); }
      .weekly-pos{ display:inline-block; width:24px; font-family:var(--font-mono); }
      .weekly-last{ margin-top:12px; font-size:12px; color:var(--muted); }
      .weekly-note{ font-size:12px; color:var(--muted-strong); max-width:260px; line-height:1.4; }
      .coupon-box{ font-family:var(--font-mono); background:var(--accent); color:var(--black); border-radius:14px; padding:10px 16px; font-size:18px; font-weight:700; letter-spacing:2px; margin:8px 0; }

      .admin-lock{ display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:70vh; padding:30px; text-align:center; }
      .admin-lock .lock-circle{ width:64px; height:64px; border-radius:22px; background:var(--accent); color:var(--black); display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
      .admin-tabs{ display:flex; gap:8px; overflow-x:auto; padding:14px 0 0; scrollbar-width:none; }
      .admin-tab{ flex:0 0 auto; min-height:40px; padding:0 12px; border-radius:999px; border:1px solid rgba(245,242,236,0.22); font-size:12px; font-weight:900; background:rgba(255,255,255,0.04); color:var(--muted); cursor:pointer; }
      .admin-tab.active{ background:var(--accent); color:var(--black); border-color:var(--accent); }
      .admin-section{ padding:16px 0 30px; }
      .item-row{ background:var(--surface-strong); border:1px solid var(--line); border-radius:18px; padding:14px; margin-bottom:10px; color:var(--white); box-shadow:0 12px 28px rgba(0,0,0,0.30); }
      .item-row-top{ display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:6px; }
      .icon-btn{ background:none; border:none; cursor:pointer; padding:6px; border-radius:10px; color:var(--accent); }
      .icon-btn:hover{ background:rgba(245,242,236,0.28); }
      .res-status{ font-size:10px; font-weight:900; padding:3px 8px; border-radius:999px; border:1px solid rgba(245,242,236,0.30); }
      .res-status.confermata{ background:var(--accent); color:var(--black); }
      .res-status.annullata{ background:var(--white); color:var(--black); }
      .toast{ position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:var(--black); color:var(--accent); padding:10px 18px; border-radius:14px; font-size:13px; z-index:100; font-weight:900; box-shadow:0 18px 44px rgba(17,17,17,0.26); }

      @media (max-width: 720px){
        .tbb-header{ align-items:flex-start; margin:0 16px 6px; }
        .logo-tagline{ display:none; }
        .tbb-main{ padding-left:16px; padding-right:16px; }
        .tbb-hero,
        .home-hero-panel,
        .panel{ padding:20px; }
        .home-main-action{ min-height:124px; padding:20px 14px; }
        .home-secondary-action{ min-height:64px; }
        .gallery-grid{ gap:7px; }
        .slot-grid{ grid-template-columns:repeat(2, 1fr); }
      }

      @media (min-width: 721px){
        .gallery-grid{ grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); }
      }

      @media (max-width: 360px){
        .tbb-main{ padding-left:12px; padding-right:12px; }
        .home-analysis-row,
        .home-main-actions,
        .home-summary-grid,
        .quick-grid{ gap:10px; }
        .home-main-action strong{ font-size:1.2rem; }
        .compact-card{ padding:14px; }
      }
    `}</style>
  );
}
