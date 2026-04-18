import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── 6×6 Sudoku Generator (2 cols × 3 rows per box) ───
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SIZE = 6;
const BOX_ROWS = 2; // 2 rows per box
const BOX_COLS = 3; // 3 cols per box

function isValid(b, r, c, n) {
  for (let i = 0; i < SIZE; i++) { if (b[r][i] === n || b[i][c] === n) return false; }
  const br = Math.floor(r / BOX_ROWS) * BOX_ROWS;
  const bc = Math.floor(c / BOX_COLS) * BOX_COLS;
  for (let i = br; i < br + BOX_ROWS; i++)
    for (let j = bc; j < bc + BOX_COLS; j++)
      if (b[i][j] === n) return false;
  return true;
}

function generateSolved() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  function solve(b) {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (b[r][c] === 0) {
        for (const n of shuffle([1, 2, 3, 4, 5, 6])) {
          if (isValid(b, r, c, n)) { b[r][c] = n; if (solve(b)) return true; b[r][c] = 0; }
        }
        return false;
      }
    }
    return true;
  }
  solve(board);
  return board;
}

function generatePuzzle(level) {
  const solved = generateSolved();
  const puzzle = solved.map(r => [...r]);
  // 36 total cells; difficulty scales with level
  // Easy (1-200): remove 12-16, Medium (201-500): 17-20, Hard (501-800): 21-24, Expert (801-1000): 25-28
  let remove;
  if (level <= 200) remove = 12 + Math.floor((level / 200) * 4);
  else if (level <= 500) remove = 17 + Math.floor(((level - 200) / 300) * 3);
  else if (level <= 800) remove = 21 + Math.floor(((level - 500) / 300) * 3);
  else remove = 25 + Math.floor(((level - 800) / 200) * 3);
  remove = Math.min(remove, 30); // keep at least 6 clues
  const positions = shuffle([...Array(36).keys()]);
  for (let i = 0; i < remove; i++) {
    const r = Math.floor(positions[i] / SIZE), c = positions[i] % SIZE;
    puzzle[r][c] = 0;
  }
  return { puzzle, solved };
}

// ─── Paper Confetti Celebration (FULLSCREEN 3s) ───
function Fireworks({ active, level }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const confettiRef = useRef([]);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (!active) { confettiRef.current = []; setOpacity(0); return; }
    setOpacity(1);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "#FF3E4D","#FF6B6B","#FFE066","#FFD700","#FFA94D",
      "#51CF66","#40C057","#339AF0","#4DABF7","#BE4BDB",
      "#CC5DE8","#FF69B4","#20C997","#FF8787","#FCC419",
      "#748FFC","#E599F7","#69DB7C","#F06595","#38D9A9"
    ];

    // Paper confetti shapes: rectangles, squares, strips, circles
    const shapes = ["rect","square","strip","circle","star"];

    function spawnBurst(cx, cy, count) {
      const W = canvas.width;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const w = shape === "strip" ? 3 + Math.random() * 4 : 6 + Math.random() * 10;
        const h = shape === "strip" ? 14 + Math.random() * 16 : shape === "square" ? w : 4 + Math.random() * 8;
        confettiRef.current.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed * (0.5 + Math.random()),
          vy: Math.sin(angle) * speed - 4 - Math.random() * 6,
          w, h, color, shape,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 15,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.05 + Math.random() * 0.1,
          wobbleAmp: 1 + Math.random() * 3,
          gravity: 0.12 + Math.random() * 0.08,
          drag: 0.98 + Math.random() * 0.015,
          life: 1,
          decay: 0.002 + Math.random() * 0.004,
          opacity: 0.8 + Math.random() * 0.2,
          flipSpeed: 0.02 + Math.random() * 0.06,
          flipAngle: Math.random() * Math.PI * 2,
          side: Math.random() > 0.5 ? color : shadeColor(color, -30),
        });
      }
    }

    function shadeColor(c, amt) {
      let col = c.replace("#","");
      let num = parseInt(col, 16);
      let r = Math.min(255, Math.max(0, (num >> 16) + amt));
      let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
      let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
      return `rgb(${r},${g},${b})`;
    }

    // Spawn from multiple cannons
    const W = canvas.width, H = canvas.height;
    // Bottom corners cannon burst
    spawnBurst(W * 0.1, H * 0.9, 60);
    spawnBurst(W * 0.9, H * 0.9, 60);
    // Center top
    spawnBurst(W * 0.5, H * 0.15, 50);
    // Sides
    setTimeout(() => {
      spawnBurst(W * 0.2, H * 0.5, 40);
      spawnBurst(W * 0.8, H * 0.5, 40);
    }, 200);
    // More waves
    const spawnInterval = setInterval(() => {
      const sx = Math.random() * W;
      const sy = Math.random() * H * 0.4;
      spawnBurst(sx, sy, 25 + Math.floor(Math.random() * 20));
    }, 350);

    // Rain from top continuously
    const rainInterval = setInterval(() => {
      for (let i = 0; i < 8; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const w = shape === "strip" ? 3 + Math.random() * 3 : 5 + Math.random() * 8;
        const h = shape === "strip" ? 12 + Math.random() * 14 : shape === "square" ? w : 3 + Math.random() * 6;
        confettiRef.current.push({
          x: Math.random() * W, y: -20,
          vx: (Math.random() - 0.5) * 3,
          vy: 1 + Math.random() * 2,
          w, h, color, shape,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 10,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.03 + Math.random() * 0.07,
          wobbleAmp: 1.5 + Math.random() * 3,
          gravity: 0.06 + Math.random() * 0.06,
          drag: 0.99,
          life: 1,
          decay: 0.003 + Math.random() * 0.003,
          opacity: 0.7 + Math.random() * 0.3,
          flipSpeed: 0.02 + Math.random() * 0.05,
          flipAngle: Math.random() * Math.PI * 2,
          side: Math.random() > 0.5 ? color : shadeColor(color, -30),
        });
      }
    }, 60);

    function drawStar(ctx, cx, cy, r, color, alpha) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const method = i === 0 ? "moveTo" : "lineTo";
        ctx[method](cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function animate() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      confettiRef.current = confettiRef.current.filter(p => p.life > 0 && p.y < H + 50);

      for (const p of confettiRef.current) {
        // Physics
        p.wobble += p.wobbleSpeed;
        p.vx += Math.sin(p.wobble) * p.wobbleAmp * 0.05;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.flipAngle += p.flipSpeed;
        p.life -= p.decay;

        // 3D flip effect — scale width based on sin of flip angle
        const flipScale = Math.abs(Math.sin(p.flipAngle));
        const showFront = Math.sin(p.flipAngle) > 0;
        const drawColor = showFront ? p.color : p.side;
        const alpha = p.opacity * Math.min(1, p.life * 2);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(flipScale, 1);

        if (p.shape === "star") {
          drawStar(ctx, 0, 0, p.w * 0.5, drawColor, alpha);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.w * 0.5, p.h * 0.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = drawColor;
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          // rect, square, strip
          ctx.fillStyle = drawColor;
          ctx.globalAlpha = alpha;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          // paper highlight edge
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.25})`;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * 0.2);
          ctx.globalAlpha = 1;
        }

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    }
    animate();

    const fadeTimer = setTimeout(() => setOpacity(0), 2600);
    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(spawnInterval);
      clearInterval(rainInterval);
      clearTimeout(fadeTimer);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  if (!active) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, pointerEvents: "none", opacity, transition: "opacity 0.4s ease", background: "rgba(0,0,0,0.5)" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", zIndex: 10000, animation: "celebText 0.6s ease both" }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 42, fontWeight: 900, background: "linear-gradient(135deg,#FFD700,#FF8C42,#FF6B6B,#FFD700)", backgroundSize: "300% 100%", animation: "shimmer 1.5s linear infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 30px #FFD70088) drop-shadow(0 4px 12px #00000088)", letterSpacing: 6 }}>🎉 LEVEL {level} 🎉</div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 700, color: "#4ECDC4", marginTop: 8, letterSpacing: 8, textShadow: "0 0 20px #4ECDC488,0 0 40px #4ECDC444" }}>CLEARED!</div>
      </div>
    </div>
  );
}

// ─── Star rating ───
function Stars({ level }) {
  const s = level <= 200 ? 1 : level <= 500 ? 2 : level <= 800 ? 3 : 4;
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4].map(i => (
        <span key={i} style={{ fontSize: 14, color: i <= s ? "#FFD700" : "#333", textShadow: i <= s ? "0 0 8px #FFD70088" : "none" }}>★</span>
      ))}
    </div>
  );
}

// ─── 3D Board Cell ───
function Cell3D({ value, isFixed, isSelected, isError, isHighlight, isSameNum, onClick, row, col, justSolved, cellSize }) {
  const [hover, setHover] = useState(false);
  const delay = (row * SIZE + col) * 0.02;
  // Box borders: 3 cols × 2 rows per box → thick border after col 2 and row 1,3
  const borderRight = (col === 2) ? "2px solid #FFD70055" : col < 5 ? "1px solid #ffffff12" : "none";
  const borderBottom = (row === 1 || row === 3) ? "2px solid #FFD70055" : row < 5 ? "1px solid #ffffff12" : "none";
  const fs = cellSize > 54 ? 28 : cellSize > 44 ? 24 : 20;

  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: cellSize, height: cellSize,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: isFixed ? "default" : "pointer",
        borderRight, borderBottom,
        background: isSelected ? "linear-gradient(145deg,#FFD70033,#FF8C0022)"
          : isError ? "linear-gradient(145deg,#FF4D4D33,#FF000022)"
          : isSameNum ? "linear-gradient(145deg,#FFD70018,#FFD70008)"
          : isHighlight ? "linear-gradient(145deg,#4ECDC418,#45B7D10A)"
          : hover ? "linear-gradient(145deg,#ffffff0D,#ffffff05)" : "transparent",
        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        transform: justSolved ? `perspective(500px) rotateY(${Math.sin(Date.now() / 200 + delay * 80) * 6}deg) scale(1.03)`
          : hover ? "perspective(500px) translateZ(6px) scale(1.02)" : "perspective(500px) translateZ(0)",
        animation: justSolved ? `cellPop 0.4s ${delay}s both` : undefined,
        position: "relative",
      }}>
      {value !== 0 && (
        <span style={{
          fontFamily: "'Orbitron',sans-serif", fontSize: fs, fontWeight: 700,
          color: isFixed ? "#E8E8E8" : isError ? "#FF6B6B" : "#FFD700",
          textShadow: isFixed ? "0 0 8px #ffffff33,0 1px 3px #00000066"
            : isError ? "0 0 12px #FF4D4D88,0 0 24px #FF000044"
            : "0 0 12px #FFD70088,0 0 24px #FFD70044",
          transition: "all 0.2s ease",
          transform: hover && !isFixed ? "scale(1.1)" : "scale(1)",
        }}>{value}</span>
      )}
    </div>
  );
}

// ─── Main App ───
const MAX_LEVEL = 1000;

export default function MiniSudoku3D() {
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState([]);
  const [solved, setSolved] = useState([]);
  const [fixed, setFixed] = useState([]);
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState(new Set());
  const [showFireworks, setShowFireworks] = useState(false);
  const [justSolved, setJustSolved] = useState(false);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const timerRef = useRef(null);
  const [cellSize, setCellSize] = useState(56);

  useEffect(() => {
    function calcSize() {
      const w = Math.min(window.innerWidth - 40, 440);
      setCellSize(Math.floor(Math.min((w - 8) / SIZE, 64)));
    }
    calcSize();
    window.addEventListener("resize", calcSize);
    return () => window.removeEventListener("resize", calcSize);
  }, []);

  const initLevel = useCallback((lvl) => {
    const { puzzle, solved: s } = generatePuzzle(lvl);
    setBoard(puzzle.map(r => [...r]));
    setSolved(s);
    setFixed(puzzle.map(r => r.map(c => c !== 0)));
    setSelected(null); setErrors(new Set()); setShowFireworks(false); setJustSolved(false);
    setLevel(lvl); setTimer(0); setRunning(true); setMoveCount(0);
    setHintsLeft(lvl <= 200 ? 5 : lvl <= 500 ? 3 : 2);
    setShowLevelSelect(false);
  }, []);

  useEffect(() => { initLevel(1); }, [initLevel]);
  useEffect(() => { if (running) { timerRef.current = setInterval(() => setTimer(t => t + 1), 1000); } return () => clearInterval(timerRef.current); }, [running]);

  const checkWin = useCallback((b) => {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (b[r][c] !== solved[r]?.[c]) return false;
    return true;
  }, [solved]);

  const triggerWin = useCallback(() => {
    setRunning(false); setJustSolved(true); setShowFireworks(true);
    setCompletedLevels(prev => new Set([...prev, level]));
    setTimeout(() => setShowFireworks(false), 3000);
  }, [level]);

  const handleCellClick = (r, c) => { if (justSolved) return; if (!fixed[r]?.[c]) setSelected([r, c]); };

  const handleInput = (num) => {
    if (!selected || justSolved) return;
    const [r, c] = selected;
    if (fixed[r][c]) return;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num; setBoard(newBoard); setMoveCount(m => m + 1);
    
    // Check all non-fixed cells for errors
    const newErrors = new Set();
    for (let ri = 0; ri < SIZE; ri++) {
      for (let ci = 0; ci < SIZE; ci++) {
        if (!fixed[ri]?.[ci] && newBoard[ri][ci] !== 0 && newBoard[ri][ci] !== solved[ri]?.[ci]) {
          newErrors.add(`${ri}-${ci}`);
        }
      }
    }
    setErrors(newErrors);
    
    // Check win — all cells filled correctly
    if (newErrors.size === 0 && checkWin(newBoard)) triggerWin();
  };

  const handleHint = () => {
    if (hintsLeft <= 0 || justSolved) return;
    const empties = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!fixed[r][c] && board[r][c] !== solved[r][c]) empties.push([r, c]);
    if (empties.length === 0) return;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = solved[r][c]; setBoard(newBoard); setHintsLeft(h => h - 1); setMoveCount(m => m + 1);
    if (checkWin(newBoard)) triggerWin();
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const difficulty = level <= 200 ? "EASY" : level <= 500 ? "MEDIUM" : level <= 800 ? "HARD" : "EXPERT";
  const diffColor = level <= 200 ? "#4ECDC4" : level <= 500 ? "#FFD700" : level <= 800 ? "#FF6B6B" : "#FF1493";

  const [levelPage, setLevelPage] = useState(0);
  const LEVELS_PER_PAGE = 50;
  const totalPages = MAX_LEVEL / LEVELS_PER_PAGE;

  // Highest unlocked level = highest completed + 1 (or 1 if none completed)
  const highestUnlocked = useMemo(() => {
    if (completedLevels.size === 0) return 1;
    let max = 0;
    completedLevels.forEach(l => { if (l > max) max = l; });
    return Math.min(max + 1, MAX_LEVEL);
  }, [completedLevels]);

  const highlightCells = useMemo(() => {
    if (!selected) return new Set();
    const [sr, sc] = selected; const s = new Set();
    for (let i = 0; i < SIZE; i++) { s.add(`${sr}-${i}`); s.add(`${i}-${sc}`); }
    const br = Math.floor(sr / BOX_ROWS) * BOX_ROWS, bc = Math.floor(sc / BOX_COLS) * BOX_COLS;
    for (let i = br; i < br + BOX_ROWS; i++) for (let j = bc; j < bc + BOX_COLS; j++) s.add(`${i}-${j}`);
    return s;
  }, [selected]);

  const sameNumCells = useMemo(() => {
    if (!selected) return new Set();
    const [sr, sc] = selected; const val = board[sr]?.[sc];
    if (!val || val === 0) return new Set();
    const s = new Set();
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (board[r][c] === val && !(r === sr && c === sc)) s.add(`${r}-${c}`);
    return s;
  }, [selected, board]);

  const boardPx = cellSize * SIZE + 8;

  return (
    <>
      <Fireworks active={showFireworks} level={level} />
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0a0a1a 0%,#0f0f2e 30%,#1a0a2e 60%,#0a0a1a 100%)", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", fontFamily: "'Orbitron',sans-serif", position: "relative", overflow: "hidden" }}>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes cellPop { 0% { transform:perspective(500px) rotateX(90deg) scale(0);opacity:0; } 60% { transform:perspective(500px) rotateX(-10deg) scale(1.1);opacity:1; } 100% { transform:perspective(500px) rotateX(0deg) scale(1);opacity:1; } }
          @keyframes glow { 0%,100% { box-shadow:0 0 20px #FFD70033,0 0 40px #FFD70011; } 50% { box-shadow:0 0 30px #FFD70055,0 0 60px #FFD70022; } }
          @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
          @keyframes slideIn { from { opacity:0;transform:translateY(20px) scale(0.95); } to { opacity:1;transform:translateY(0) scale(1); } }
          @keyframes celebText { 0% { opacity:0;transform:translate(-50%,-50%) scale(0.3); } 50% { transform:translate(-50%,-50%) scale(1.1); } 100% { opacity:1;transform:translate(-50%,-50%) scale(1); } }
          @keyframes bgOrb { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(30px,-20px) scale(1.2); } }
          .num-btn:active { transform:perspective(400px) rotateX(15deg) scale(0.92) !important; }
          ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#0a0a1a; } ::-webkit-scrollbar-thumb { background:#FFD70044;border-radius:3px; }
        `}</style>

        {/* Background orbs */}
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
          {[{ top: "10%", left: "15%", size: 200, color: "#FFD70008", delay: "0s" }, { top: "60%", left: "70%", size: 300, color: "#4ECDC408", delay: "2s" }, { top: "30%", left: "80%", size: 150, color: "#FF6B6B08", delay: "4s" }].map((orb, i) => (
            <div key={i} style={{ position: "absolute", top: orb.top, left: orb.left, width: orb.size, height: orb.size, borderRadius: "50%", background: `radial-gradient(circle,${orb.color},transparent)`, animation: `bgOrb 8s ${orb.delay} ease-in-out infinite` }} />
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: boardPx + 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 12, animation: "slideIn 0.6s ease" }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: 4, background: "linear-gradient(135deg,#FFD700,#FF8C42,#FFD700)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 2px 8px #FFD70044)" }}>SUDOKU</h1>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, color: "#ffffff55", letterSpacing: 6, marginTop: 2 }}>3D • 1000 LEVELS • 6×6</div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "10px 16px", marginBottom: 10, background: "linear-gradient(135deg,#ffffff08,#ffffff04)", borderRadius: 12, border: "1px solid #ffffff10", backdropFilter: "blur(10px)", animation: "slideIn 0.6s 0.1s both" }}>
            <div>
              <div style={{ fontFamily: "'Rajdhani'", fontSize: 10, color: "#ffffff55", letterSpacing: 2 }}>LEVEL</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{level}<span style={{ fontSize: 11, color: "#ffffff44" }}>/1000</span></div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Rajdhani'", fontSize: 10, fontWeight: 700, letterSpacing: 3, color: diffColor, textShadow: `0 0 10px ${diffColor}44` }}>{difficulty}</div>
              <Stars level={level} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Rajdhani'", fontSize: 10, color: "#ffffff55", letterSpacing: 2 }}>TIME</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#4ECDC4", fontFamily: "'Rajdhani'" }}>{formatTime(timer)}</div>
            </div>
          </div>

          {/* Moves & Hints */}
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "0 2px", marginBottom: 10, animation: "slideIn 0.6s 0.15s both" }}>
            <div style={{ fontFamily: "'Rajdhani'", fontSize: 13, color: "#ffffff44" }}>Moves: <span style={{ color: "#FFD700" }}>{moveCount}</span></div>
            <button onClick={handleHint} disabled={hintsLeft <= 0 || justSolved} style={{ fontFamily: "'Rajdhani'", fontSize: 13, fontWeight: 600, background: hintsLeft > 0 ? "linear-gradient(135deg,#4ECDC422,#4ECDC411)" : "#ffffff08", color: hintsLeft > 0 ? "#4ECDC4" : "#ffffff33", border: hintsLeft > 0 ? "1px solid #4ECDC433" : "1px solid #ffffff10", borderRadius: 8, padding: "4px 12px", cursor: hintsLeft > 0 ? "pointer" : "default" }}>💡 Hint ({hintsLeft})</button>
            <button onClick={() => setShowLevelSelect(true)} style={{ fontFamily: "'Rajdhani'", fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg,#FFD70022,#FFD70011)", color: "#FFD700", border: "1px solid #FFD70033", borderRadius: 8, padding: "4px 12px", cursor: "pointer" }}>Levels</button>
          </div>

          {/* 6×6 3D Board */}
          <div style={{ position: "relative", perspective: 800, animation: "slideIn 0.6s 0.2s both" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${SIZE},${cellSize}px)`, gridTemplateRows: `repeat(${SIZE},${cellSize}px)`, background: "linear-gradient(145deg,#1a1a3e,#12122a)", borderRadius: 16, overflow: "hidden", border: "2px solid #FFD70022", boxShadow: "0 20px 60px #00000088,0 0 30px #FFD70011,inset 0 1px 0 #ffffff08", animation: justSolved ? undefined : "glow 3s ease-in-out infinite", transform: "rotateX(2deg)", transformStyle: "preserve-3d" }}>
              {board.map((row, r) => row.map((val, c) => (
                <Cell3D key={`${r}-${c}`} value={val} row={r} col={c} cellSize={cellSize}
                  isFixed={fixed[r]?.[c]}
                  isSelected={selected && selected[0] === r && selected[1] === c}
                  isError={errors.has(`${r}-${c}`)}
                  isSameNum={sameNumCells.has(`${r}-${c}`)}
                  isHighlight={highlightCells.has(`${r}-${c}`) && !(selected && selected[0] === r && selected[1] === c)}
                  onClick={() => handleCellClick(r, c)}
                  justSolved={justSolved} />
              )))}
            </div>
          </div>

          {/* Number Pad: 2 rows — Row 1: 1 2 3, Row 2: 4 5 6 ✕ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 14, animation: "slideIn 0.6s 0.3s both" }}>
            <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
              {[1, 2, 3].map(n => (
                <button key={n} className="num-btn" onClick={() => handleInput(n)} style={{ width: cellSize, height: cellSize, borderRadius: 12, background: "linear-gradient(145deg,#1e1e44,#14142e)", border: "1px solid #FFD70022", color: "#FFD700", fontSize: cellSize > 50 ? 24 : 20, fontWeight: 700, fontFamily: "'Orbitron'", cursor: "pointer", boxShadow: "0 4px 14px #00000066,inset 0 1px 0 #ffffff08", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: "perspective(400px) translateZ(0)" }}
                  onMouseEnter={e => { e.target.style.transform = "perspective(400px) translateZ(8px) scale(1.08)"; e.target.style.boxShadow = "0 8px 24px #00000088,0 0 16px #FFD70022"; }}
                  onMouseLeave={e => { e.target.style.transform = "perspective(400px) translateZ(0)"; e.target.style.boxShadow = "0 4px 14px #00000066,inset 0 1px 0 #ffffff08"; }}
                >{n}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
              {[4, 5, 6].map(n => (
                <button key={n} className="num-btn" onClick={() => handleInput(n)} style={{ width: cellSize, height: cellSize, borderRadius: 12, background: "linear-gradient(145deg,#1e1e44,#14142e)", border: "1px solid #FFD70022", color: "#FFD700", fontSize: cellSize > 50 ? 24 : 20, fontWeight: 700, fontFamily: "'Orbitron'", cursor: "pointer", boxShadow: "0 4px 14px #00000066,inset 0 1px 0 #ffffff08", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: "perspective(400px) translateZ(0)" }}
                  onMouseEnter={e => { e.target.style.transform = "perspective(400px) translateZ(8px) scale(1.08)"; e.target.style.boxShadow = "0 8px 24px #00000088,0 0 16px #FFD70022"; }}
                  onMouseLeave={e => { e.target.style.transform = "perspective(400px) translateZ(0)"; e.target.style.boxShadow = "0 4px 14px #00000066,inset 0 1px 0 #ffffff08"; }}
                >{n}</button>
              ))}
              <button className="num-btn" onClick={() => handleInput(0)} style={{ width: cellSize, height: cellSize, borderRadius: 12, background: "linear-gradient(145deg,#2a1020,#1a0a18)", border: "1px solid #FF6B6B22", color: "#FF6B6B", fontSize: cellSize > 50 ? 24 : 20, fontWeight: 700, fontFamily: "'Orbitron'", cursor: "pointer", boxShadow: "0 4px 14px #00000066,inset 0 1px 0 #ffffff08", transition: "all 0.2s ease", transform: "perspective(400px) translateZ(0)" }}
                onMouseEnter={e => { e.target.style.transform = "perspective(400px) translateZ(8px) scale(1.08)"; e.target.style.boxShadow = "0 8px 24px #00000088,0 0 12px #FF6B6B22"; }}
                onMouseLeave={e => { e.target.style.transform = "perspective(400px) translateZ(0)"; e.target.style.boxShadow = "0 4px 14px #00000066,inset 0 1px 0 #ffffff08"; }}
              >✕</button>
            </div>
          </div>

          {/* Win overlay */}
          {justSolved && (
            <div style={{ marginTop: 18, textAlign: "center", animation: "slideIn 0.5s ease", padding: "16px 24px", borderRadius: 14, background: "linear-gradient(135deg,#FFD70011,#FF8C4211)", border: "1px solid #FFD70033" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#FFD700", marginBottom: 4 }}>🎉 LEVEL {level} CLEARED!</div>
              <div style={{ fontFamily: "'Rajdhani'", fontSize: 14, color: "#ffffff77", marginBottom: 12 }}>Time: {formatTime(timer)} • Moves: {moveCount}</div>
              <button onClick={() => initLevel(Math.min(level + 1, MAX_LEVEL))} style={{ fontFamily: "'Orbitron'", fontSize: 14, fontWeight: 700, padding: "12px 32px", borderRadius: 10, cursor: "pointer", background: "linear-gradient(135deg,#FFD700,#FF8C42)", color: "#0a0a1a", border: "none", boxShadow: "0 4px 20px #FFD70044", transition: "all 0.2s ease", letterSpacing: 2 }}
                onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
                {level < MAX_LEVEL ? "NEXT LEVEL →" : "🏆 ALL COMPLETE!"}
              </button>
            </div>
          )}

          {/* Level Select Modal */}
          {showLevelSelect && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "#000000cc", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }} onClick={() => setShowLevelSelect(false)}>
              <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(160deg,#1a1a3e,#0f0f2e)", borderRadius: 18, padding: 20, width: "92%", maxWidth: 420, maxHeight: "80vh", border: "1px solid #FFD70022", boxShadow: "0 20px 60px #000000cc", animation: "slideIn 0.3s ease", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ fontFamily: "'Orbitron'", fontSize: 16, fontWeight: 700, color: "#FFD700", margin: 0 }}>SELECT LEVEL</h2>
                  <button onClick={() => setShowLevelSelect(false)} style={{ background: "none", border: "none", color: "#ffffff66", fontSize: 22, cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 10 }}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setLevelPage(i)} style={{ fontFamily: "'Rajdhani'", fontSize: 10, fontWeight: 600, padding: "3px 6px", borderRadius: 5, cursor: "pointer", background: levelPage === i ? "#FFD70022" : "transparent", color: levelPage === i ? "#FFD700" : "#ffffff44", border: levelPage === i ? "1px solid #FFD70033" : "1px solid #ffffff10" }}>
                      {i * LEVELS_PER_PAGE + 1}-{(i + 1) * LEVELS_PER_PAGE}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 }}>
                  {Array.from({ length: LEVELS_PER_PAGE }, (_, i) => {
                    const lvl = levelPage * LEVELS_PER_PAGE + i + 1;
                    if (lvl > MAX_LEVEL) return null;
                    const done = completedLevels.has(lvl), current = lvl === level;
                    const unlocked = lvl <= highestUnlocked;
                    const locked = !unlocked;
                    return (
                      <button key={lvl} onClick={() => { if (unlocked) initLevel(lvl); }} style={{
                        fontFamily: "'Rajdhani'", fontSize: 13, fontWeight: 600, padding: "6px 0", borderRadius: 7,
                        cursor: locked ? "not-allowed" : "pointer",
                        opacity: locked ? 0.35 : 1,
                        background: current ? "#FFD70033" : done ? "#4ECDC411" : locked ? "#ffffff04" : "#ffffff08",
                        color: current ? "#FFD700" : done ? "#4ECDC4" : locked ? "#ffffff22" : "#ffffff55",
                        border: current ? "1px solid #FFD70044" : done ? "1px solid #4ECDC422" : "1px solid #ffffff10",
                        transition: "all 0.15s ease",
                        position: "relative"
                      }}>
                        {locked ? "🔒" : done ? "✓" : ""}{!locked ? lvl : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 18, fontFamily: "'Rajdhani'", fontSize: 11, color: "#ffffff22", letterSpacing: 3, textAlign: "center", animation: "slideIn 0.6s 0.4s both" }}>
            {completedLevels.size} OF {MAX_LEVEL} LEVELS COMPLETED
            <div style={{ marginTop: 6, height: 4, borderRadius: 2, width: 200, background: "#ffffff08", overflow: "hidden", margin: "6px auto 0" }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${(completedLevels.size / MAX_LEVEL) * 100}%`, background: "linear-gradient(90deg,#4ECDC4,#FFD700)", transition: "width 0.5s ease" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
