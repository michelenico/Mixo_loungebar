import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, Share2, Ticket, Trophy } from 'lucide-react';
import { formatWeek, playsLeftToday, ranking, timeToReset } from '../services/weekly.js';
import { uid } from '../utils/uid.js';

const PLAYER_IMAGE_SRC = '/assets/mixo-logo-white.png';
const INITIAL_SPAWN_INTERVAL = 920;
const MIN_SPAWN_INTERVAL = 260;
const INITIAL_FALL_SPEED = 125;
const SPEED_GAIN_PER_SECOND = 11;
const SCORE_SPEED_BONUS = 8;

export function GameView({ gameConfig, coupons, setCoupons, weeklyBoard, weeklyWinners, player, setPlayer, recordScore }) {
  const [phase, setPhase] = useState('intro'); // intro | playing | win | over
  const [playerName, setPlayerName] = useState(player?.name || '');
  const [weeklyResult, setWeeklyResult] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(gameConfig.lives);
  const [couponCode, setCouponCode] = useState('');
  const [shareMsg, setShareMsg] = useState('');

  const canvasRef = useRef(null);
  const boxRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef(null);
  const playerImageRef = useRef(null);
  const dims = useRef({ w: 340, h: 460 });
  // il loop è memoizzato: passa da qui per usare sempre i dati aggiornati a fine partita
  const finishRef = useRef({});

  useEffect(() => {
    const img = new Image();
    img.src = PLAYER_IMAGE_SRC;
    playerImageRef.current = img;
    return () => {
      playerImageRef.current = null;
    };
  }, []);

  function resetGameState() {
    stateRef.current = {
      playerX: dims.current.w / 2,
      panini: [],
      elapsed: 0,
      lastSpawn: 0,
      spawnInterval: INITIAL_SPAWN_INTERVAL,
      fallSpeed: INITIAL_FALL_SPEED,
      score: 0,
      lives: gameConfig.lives,
      running: true,
    };
    setScore(0);
    setLives(gameConfig.lives);
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = dims.current;
    ctx.clearRect(0, 0, w, h);

    // pista
    ctx.fillStyle = 'rgba(22,19,16,0.05)';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect((i * w) / 4, 0, 2, h);
    }

    const st = stateRef.current;
    if (!st) return;

    // panini
    st.panini.forEach((p) => {
      ctx.fillStyle = '#F5F2EC';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#111111';
      ctx.fillRect(p.x - 14, p.y - 1, 28, 3);
      ctx.font = '8px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MX', p.x, p.y - 6);
    });

    // personaggio
    const px = st.playerX, py = h - 34;
    ctx.fillStyle = 'rgba(0,0,0,0.40)';
    ctx.beginPath();
    ctx.ellipse(px, py + 26, 42, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const playerImg = playerImageRef.current;
    if (playerImg?.complete && playerImg.naturalWidth > 0) {
      const spriteW = 96;
      const spriteH = 96;
      const dx = px - spriteW / 2;
      const dy = py - 70;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(playerImg, dx, dy, spriteW, spriteH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#F5F2EC';
      ctx.beginPath();
      ctx.moveTo(px - 26, py - 10);
      ctx.lineTo(px + 26, py - 10);
      ctx.lineTo(px + 20, py + 26);
      ctx.lineTo(px - 20, py + 26);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#111111'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#111111';
      ctx.fillRect(px - 4, py - 10, 8, 30);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px, py - 24, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.fillRect(px - 12, py - 27, 10, 6);
      ctx.fillRect(px + 2, py - 27, 10, 6);
    }
  }, []);

  const loop = useCallback((ts) => {
    const st = stateRef.current;
    if (!st || !st.running) return;
    if (!st.lastTs) st.lastTs = ts;
    const dt = Math.min(40, ts - st.lastTs);
    st.lastTs = ts;
    st.elapsed += dt;

    // difficoltà crescente nel tempo
    const elapsedSeconds = st.elapsed / 1000;
    st.spawnInterval = Math.max(MIN_SPAWN_INTERVAL, INITIAL_SPAWN_INTERVAL - elapsedSeconds * 14);
    st.fallSpeed = INITIAL_FALL_SPEED + elapsedSeconds * SPEED_GAIN_PER_SECOND + Math.floor(st.score / 50) * SCORE_SPEED_BONUS;

    st.lastSpawn += dt;
    if (st.lastSpawn > st.spawnInterval) {
      st.lastSpawn = 0;
      st.panini.push({ x: 24 + Math.random() * (dims.current.w - 48), y: -20 });
    }

    const { h } = dims.current;
    const remaining = [];
    st.panini.forEach((p) => {
      p.y += (st.fallSpeed * dt) / 1000;
      const caught = p.y > h - 55 && p.y < h - 10 && Math.abs(p.x - st.playerX) < 40;
      if (caught) {
        st.score += 10;
        setScore(st.score);
      } else if (p.y > h + 10) {
        st.lives -= 1;
        setLives(st.lives);
      } else {
        remaining.push(p);
      }
    });
    st.panini = remaining;

    draw();

    if (st.score >= gameConfig.targetScore) {
      st.running = false;
      finishRef.current.win(st.score);
      return;
    }
    if (st.lives <= 0) {
      st.running = false;
      finishRef.current.over(st.score);
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, gameConfig.targetScore]);

  async function finishWin(finalScore) {
    const code = `${gameConfig.couponPrefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setCouponCode(code);
    setPhase('win');
    const entry = { id: uid(), name: player?.name || 'Ospite', code, score: finalScore, date: new Date().toISOString(), redeemed: false };
    await setCoupons([entry, ...coupons]);
    await saveWeekly(finalScore);
  }
  async function finishOver(finalScore) {
    setPhase('over');
    await saveWeekly(finalScore);
  }
  async function saveWeekly(finalScore) {
    const result = await recordScore(finalScore, player);
    setWeeklyResult({ ...result, score: finalScore });
  }
  finishRef.current = { win: finishWin, over: finishOver };

  const nameOk = playerName.trim().length >= 2;
  async function startGame() {
    if (!nameOk) return;
    const name = playerName.trim();
    if (!player || player.name !== name) await setPlayer({ id: player?.id || uid(), name });
    setWeeklyResult(null);
    resetGameState();
    setPhase('playing');
  }

  const board = ranking(weeklyBoard);
  const myIndex = player ? board.findIndex((e) => e.playerId === player.id) : -1;
  const playsLeft = player ? playsLeftToday(weeklyBoard, player.id, gameConfig.maxPlaysPerDay) : gameConfig.maxPlaysPerDay;
  const lastWinner = weeklyWinners[0];
  const weeklyNote = weeklyResult && (weeklyResult.counted
    ? `+${weeklyResult.score} punti nella classifica settimanale. Partite valide rimaste oggi: ${weeklyResult.playsLeft}.`
    : `Oggi hai già giocato ${gameConfig.maxPlaysPerDay} partite valide: questa non conta per la classifica. Torna domani!`);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (boxRef.current) {
      dims.current.w = Math.min(360, boxRef.current.clientWidth);
    }
    if (canvasRef.current) {
      canvasRef.current.width = dims.current.w;
      canvasRef.current.height = dims.current.h;
    }
    if (!stateRef.current) resetGameState();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function move(dir) {
    const st = stateRef.current;
    if (!st) return;
    st.playerX = Math.max(24, Math.min(dims.current.w - 24, st.playerX + dir * 28));
  }
  function onPointerMove(e) {
    const st = stateRef.current;
    if (!st || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    st.playerX = Math.max(24, Math.min(dims.current.w - 24, x));
  }

  async function shareWin() {
    const text = `Ho vinto "${gameConfig.rewardTitle}" giocando al Mixò Lounge Bar! Codice: ${couponCode}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareMsg('Copiato negli appunti!');
      }
    } catch (e) {
      try { await navigator.clipboard.writeText(text); setShareMsg('Copiato negli appunti!'); } catch (_) {}
    }
  }

  return (
    <div className="game-wrap">
      <div className="section-title">Prendi i Piatti</div>
      <div className="section-sub">Arriva a {gameConfig.targetScore} punti e vinci "{gameConfig.rewardTitle}"</div>

      {phase === 'intro' && (
        <div style={{ textAlign: 'center', padding: '20px 6px' }}>
          <div className="game-intro-player">
            <img src={PLAYER_IMAGE_SRC} alt="Mixò" />
          </div>
          <div className="form-field" style={{ maxWidth: 240, margin: '0 auto 14px' }}>
            <label>Il tuo nome in classifica</label>
            <input value={playerName} maxLength={18} onChange={(e) => setPlayerName(e.target.value)} placeholder="Es. Marco" />
          </div>
          <button className="btn btn-red" disabled={!nameOk} onClick={startGame}>Inizia a giocare</button>
          <div className="section-sub" style={{ marginTop: 12 }}>
            {playsLeft > 0
              ? `Oggi hai ancora ${playsLeft} ${playsLeft === 1 ? 'partita valida' : 'partite valide'} per la classifica.`
              : 'Per oggi hai finito le partite valide per la classifica: puoi comunque giocare per il coupon.'}
          </div>
        </div>
      )}

      {phase !== 'intro' && (
        <>
          <div className="game-hud">
            <span>Punti: {score} / {gameConfig.targetScore}</span>
            <span className="lives" aria-label={`${lives} vite rimaste`}>
              {Array.from({ length: Math.max(0, lives) }, (_, i) => <span key={i} className="life-dot" />)}
            </span>
          </div>
          <div className="game-canvas-box" ref={boxRef} style={{ height: 460 }}
            onMouseMove={onPointerMove} onTouchMove={onPointerMove}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
            {phase === 'win' && (
              <div className="game-overlay">
                <Ticket size={30} color="#FFFFFF" />
                <h2>Hai vinto!</h2>
                <p style={{ fontSize: 13 }}>{gameConfig.rewardDesc}</p>
                <div className="coupon-box">{couponCode}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-accent btn-sm" onClick={shareWin}><Share2 size={14} /> Condividi</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setPhase('intro')}><RotateCcw size={14} /> Rigioca</button>
                </div>
                {shareMsg && <div style={{ fontSize: 11, opacity: 0.8 }}>{shareMsg}</div>}
                {weeklyNote && <div className="weekly-note">{weeklyNote}</div>}
              </div>
            )}
            {phase === 'over' && (
              <div className="game-overlay">
                <h2>Game Over</h2>
                <p style={{ fontSize: 13 }}>Hai totalizzato {score} punti. Serviva arrivare a {gameConfig.targetScore}.</p>
                {weeklyNote && <div className="weekly-note">{weeklyNote}</div>}
                <button className="btn btn-accent btn-sm" onClick={startGame}><RotateCcw size={14} /> Riprova</button>
              </div>
            )}
          </div>
          {phase === 'playing' && (
            <div className="game-controls">
              <button onClick={() => move(-1)}>◀</button>
              <button onClick={() => move(1)}>▶</button>
            </div>
          )}
        </>
      )}

      <div className="weekly-box">
        <div className="weekly-head">
          <Trophy size={22} />
          <div>
            <div className="achievement-eyebrow" style={{ margin: 0 }}>Classifica della settimana · {formatWeek(weeklyBoard.week)}</div>
            <div className="weekly-prize">In palio: {gameConfig.weeklyPrize}</div>
          </div>
        </div>
        <div className="section-sub" style={{ margin: '10px 0 12px' }}>
          I punti di ogni partita si sommano. Chi ne ha di più domenica a mezzanotte vince. Si azzera tra {timeToReset()}.
        </div>
        {board.length === 0 && <div className="section-sub">Ancora nessun punto questa settimana: il primo posto è libero!</div>}
        {board.slice(0, 10).map((e, i) => (
          <div key={e.playerId} className={'weekly-row' + (i === myIndex ? ' me' : '')}>
            <span><b className="weekly-pos">{i + 1}</b>{e.name}{i === myIndex ? ' (tu)' : ''}</span>
            <b>{e.points}</b>
          </div>
        ))}
        {myIndex >= 10 && (
          <div className="weekly-row me">
            <span><b className="weekly-pos">{myIndex + 1}</b>{board[myIndex].name} (tu)</span>
            <b>{board[myIndex].points}</b>
          </div>
        )}
        {lastWinner && (
          <div className="weekly-last">Vincitore della settimana {formatWeek(lastWinner.week)}: <b>{lastWinner.name}</b> con {lastWinner.points} punti</div>
        )}
      </div>
    </div>
  );
}
