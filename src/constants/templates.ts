import { ProjectTemplate } from '../types/ide';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'web-dashboard',
    name: 'Modern Web Studio (HTML/JS/CSS)',
    description: 'Responsive interactive web application with components, live animations, and analytics widget.',
    iconName: 'Layout',
    badge: 'Popular',
    entryFileId: 'file-index-html',
    files: [
      {
        id: 'file-index-html',
        name: 'index.html',
        path: '/index.html',
        language: 'html',
        isFolder: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevStudio Pro</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-indigo-500 selection:text-white">
  <!-- Top Navbar -->
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <i class="fa-solid fa-code text-white text-sm"></i>
      </div>
      <div>
        <h1 class="font-bold text-base tracking-tight text-white flex items-center gap-2">
          DevStudio <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">v2.4</span>
        </h1>
        <p class="text-xs text-slate-400">Live Preview &amp; Runtime</p>
      </div>
    </div>
    
    <div class="flex items-center gap-3">
      <button id="themeToggleBtn" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-sm">
        <i class="fa-solid fa-moon"></i>
      </button>
      <button id="runActionBtn" class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition">
        <i class="fa-solid fa-play text-[10px]"></i> Run Simulation
      </button>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-6xl mx-auto p-6 space-y-6">
    <!-- Hero / Metrics Banner -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="metric-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
        <div class="flex items-center justify-between text-slate-400 text-xs">
          <span>Active Users</span>
          <i class="fa-solid fa-users text-indigo-400"></i>
        </div>
        <div class="mt-2 text-2xl font-bold text-white tracking-tight" id="metricUsers">14,289</div>
        <div class="mt-1 text-xs text-emerald-400 flex items-center gap-1">
          <i class="fa-solid fa-arrow-trend-up"></i> +12.5% this week
        </div>
      </div>

      <div class="metric-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
        <div class="flex items-center justify-between text-slate-400 text-xs">
          <span>API Requests</span>
          <i class="fa-solid fa-bolt text-amber-400"></i>
        </div>
        <div class="mt-2 text-2xl font-bold text-white tracking-tight" id="metricReqs">284.5k</div>
        <div class="mt-1 text-xs text-emerald-400 flex items-center gap-1">
          <i class="fa-solid fa-arrow-trend-up"></i> 99.98% uptime
        </div>
      </div>

      <div class="metric-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
        <div class="flex items-center justify-between text-slate-400 text-xs">
          <span>Build Latency</span>
          <i class="fa-solid fa-stopwatch text-violet-400"></i>
        </div>
        <div class="mt-2 text-2xl font-bold text-white tracking-tight" id="metricLatency">18 ms</div>
        <div class="mt-1 text-xs text-emerald-400 flex items-center gap-1">
          <i class="fa-solid fa-check"></i> Sub-millisecond TTFB
        </div>
      </div>

      <div class="metric-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
        <div class="flex items-center justify-between text-slate-400 text-xs">
          <span>Environment</span>
          <i class="fa-solid fa-server text-cyan-400"></i>
        </div>
        <div class="mt-2 text-2xl font-bold text-white tracking-tight text-emerald-400 flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span> Ready
        </div>
        <div class="mt-1 text-xs text-slate-400">WebAssembly + Sandbox</div>
      </div>
    </div>

    <!-- Interactive Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Canvas Visualizer -->
      <div class="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <i class="fa-solid fa-chart-line text-indigo-400"></i> Realtime Traffic &amp; Sine Wave Visualizer
            </h2>
            <p class="text-xs text-slate-400">Smooth 60fps HTML5 Canvas Render</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="waveModeBtn" class="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
              Switch Mode
            </button>
          </div>
        </div>

        <div class="relative w-full h-56 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
          <canvas id="vizCanvas" class="w-full h-full block"></canvas>
          <div class="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono">
            FPS: <span id="fpsCounter" class="text-emerald-400">60</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Primary Signal
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-violet-400 ml-2"></span> Harmonic Wave
          </div>
          <button id="addLogBtn" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            + Emit Console Event
          </button>
        </div>
      </div>

      <!-- Right 1 Col: Quick Interactive Todo / Task Hub -->
      <div class="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-indigo-400"></i> Project Backlog
            </h2>
            <span id="taskCountBadge" class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              3 items
            </span>
          </div>

          <!-- Add input -->
          <div class="flex gap-2">
            <input 
              id="newTaskInput" 
              type="text" 
              placeholder="Add a new feature..." 
              class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button id="addTaskBtn" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold">
              Add
            </button>
          </div>

          <!-- List -->
          <ul id="taskList" class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <!-- Dynamically populated -->
          </ul>
        </div>

        <div class="pt-4 border-t border-slate-800/80 text-center">
          <p class="text-[11px] text-slate-500">
            Edit <code class="text-indigo-400 bg-slate-950 px-1 py-0.5 rounded">index.html</code> or <code class="text-indigo-400 bg-slate-950 px-1 py-0.5 rounded">app.js</code> to see immediate live updates!
          </p>
        </div>
      </div>
    </div>
  </main>

  <script src="app.js"></script>
</body>
</html>`
      },
      {
        id: 'file-style-css',
        name: 'style.css',
        path: '/style.css',
        language: 'css',
        isFolder: false,
        content: `/* Custom animations and styling for DevStudio */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
  }
}

.metric-card {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.4);
}

.task-completed {
  text-decoration: line-through;
  opacity: 0.5;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
}
`
      },
      {
        id: 'file-app-js',
        name: 'app.js',
        path: '/app.js',
        language: 'javascript',
        isFolder: false,
        content: `// DevStudio Pro - Application Core Logic
console.log("⚡ [DevStudio] IDE Sandbox initialized successfully!");

let tasks = [
  { id: 1, text: "Build high performance IDE editor", done: true },
  { id: 2, text: "Connect GitHub poluanjali/IDE repo", done: true },
  { id: 3, text: "Integrate Monaco Code Editor & Terminal", done: false },
  { id: 4, text: "Support real-time simulation & preview", done: false }
];

let waveMode = 0; // 0: Dual sine wave, 1: Particle network
let animationFrameId = null;

// Initialize when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  initCanvas();
  setupEventListeners();
  console.log("🚀 [DevStudio] UI loaded with 4 backlog items.");
});

function setupEventListeners() {
  const addBtn = document.getElementById("addTaskBtn");
  const input = document.getElementById("newTaskInput");
  const runBtn = document.getElementById("runActionBtn");
  const waveBtn = document.getElementById("waveModeBtn");
  const logBtn = document.getElementById("addLogBtn");

  if (addBtn && input) {
    addBtn.addEventListener("click", () => {
      const val = input.value.trim();
      if (val) {
        tasks.push({ id: Date.now(), text: val, done: false });
        input.value = "";
        renderTasks();
        console.log(\`✅ [Task Added] "\${val}"\`);
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addBtn.click();
    });
  }

  if (runBtn) {
    runBtn.addEventListener("click", () => {
      console.info("⚡ [Action] Running system simulation tests...");
      const metricReqs = document.getElementById("metricReqs");
      if (metricReqs) {
        const randomReqs = (Math.random() * 50 + 280).toFixed(1) + "k";
        metricReqs.innerText = randomReqs;
      }
      const metricLatency = document.getElementById("metricLatency");
      if (metricLatency) {
        metricLatency.innerText = Math.floor(Math.random() * 8 + 12) + " ms";
      }
      console.log("✨ Simulation complete. Metrics recalculated.");
    });
  }

  if (waveBtn) {
    waveBtn.addEventListener("click", () => {
      waveMode = (waveMode + 1) % 2;
      console.log("🎨 Visualizer mode switched to:", waveMode === 0 ? "Waveform" : "Energy Pulse");
    });
  }

  if (logBtn) {
    logBtn.addEventListener("click", () => {
      const msgs = [
        "Memory usage steady at 48.2MB",
        "Hot reload trigger synchronized",
        "Asset compiled in 3.4ms",
        "WebSocket heartbeat acknowledged"
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      console.log("📡 [Telemetry]", randomMsg);
    });
  }
}

function renderTasks() {
  const list = document.getElementById("taskList");
  const badge = document.getElementById("taskCountBadge");
  if (!list) return;

  list.innerHTML = "";
  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs";
    
    li.innerHTML = \`
      <div class="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
        <input type="checkbox" \${t.done ? "checked" : ""} class="rounded border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer">
        <span class="\${t.done ? "task-completed text-slate-500" : "text-slate-200"}">\${escapeHtml(t.text)}</span>
      </div>
      <button class="delete-btn text-slate-500 hover:text-rose-400 px-1 transition">
        <i class="fa-solid fa-xmark"></i>
      </button>
    \`;

    const checkbox = li.querySelector("input");
    checkbox.addEventListener("change", () => {
      t.done = checkbox.checked;
      renderTasks();
      console.log(\`Task status changed: \${t.text} -> \${t.done ? "DONE" : "PENDING"}\`);
    });

    const delBtn = li.querySelector(".delete-btn");
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tasks = tasks.filter(item => item.id !== t.id);
      renderTasks();
      console.warn("Deleted task ID:", t.id);
    });

    list.appendChild(li);
  });

  if (badge) {
    const remaining = tasks.filter(t => !t.done).length;
    badge.innerText = \`\${remaining} left\`;
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// 60FPS Canvas Visualizer
function initCanvas() {
  const canvas = document.getElementById("vizCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener("resize", resize);

  let step = 0;
  function animate() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Sine wave 1
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#6366f1"; // Indigo
    for (let x = 0; x < width; x += 3) {
      const y = height / 2 + Math.sin((x + step) * 0.02) * 35 * Math.sin(step * 0.015);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Harmonic wave 2
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#a78bfa"; // Violet
    for (let x = 0; x < width; x += 3) {
      const y = height / 2 + Math.cos((x - step * 1.5) * 0.025) * 25;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    step += 2;
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}
`
      },
      {
        id: 'file-readme-md',
        name: 'README.md',
        path: '/README.md',
        language: 'markdown',
        isFolder: false,
        content: `# poluanjali / IDE Project Preview

Welcome to the live interactive preview of the **IDE** project!

### Overview
This project integrates an interactive Web IDE workspace with:
- 🚀 **Full Multi-file Code Editing**: Monaco Editor (VS Code engine).
- ⚡ **Live Browser Runtime**: Sandbox runner with automatic styling and scripts.
- 💻 **Integrated Terminal & Console**: Interactive shell and captured logs.
- 📦 **Git & GitHub Integration**: Synced with repository \`poluanjali/IDE\`.

### Hotkeys & Shortcuts
- **Ctrl + S** (or **Cmd + S**): Save file and refresh live preview
- **Ctrl + P**: Quick Open File Palette
- **F1 / Ctrl + Shift + P**: Command Palette
`
      },
      {
        id: 'file-package-json',
        name: 'package.json',
        path: '/package.json',
        language: 'json',
        isFolder: false,
        content: `{
  "name": "poluanjali-ide-preview",
  "version": "1.0.0",
  "description": "Interactive Web IDE Preview for poluanjali/IDE",
  "main": "index.html",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "tailwindcss": "^3.4.0"
  }
}`
      }
    ]
  },
  {
    id: 'retro-game',
    name: 'Cyber Pong & Arcade Canvas Game',
    description: 'Playable 60fps arcade game with paddle physics, particle explosions, and sound simulation.',
    iconName: 'Gamepad2',
    badge: 'Game',
    entryFileId: 'game-index-html',
    files: [
      {
        id: 'game-index-html',
        name: 'index.html',
        path: '/index.html',
        language: 'html',
        isFolder: false,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyber Pong 2099</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-black text-white flex flex-col items-center justify-center min-h-screen p-4 select-none">
  <div class="text-center mb-3">
    <h1 class="text-3xl font-extrabold tracking-widest text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
      CYBER PONG
    </h1>
    <p class="text-xs text-slate-400 mt-1">Move your mouse or arrow keys to control the paddle</p>
  </div>

  <div class="relative rounded-xl border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(34,211,238,0.3)] bg-slate-950 overflow-hidden">
    <canvas id="gameCanvas" width="600" height="400" class="block"></canvas>
  </div>

  <div class="mt-4 flex gap-6 text-sm font-mono">
    <div class="text-slate-400">Score: <span id="scoreVal" class="text-cyan-400 font-bold">0</span></div>
    <div class="text-slate-400">High Score: <span id="highVal" class="text-purple-400 font-bold">0</span></div>
  </div>

  <script src="game.js"></script>
</body>
</html>`
      },
      {
        id: 'game-style-css',
        name: 'style.css',
        path: '/style.css',
        language: 'css',
        isFolder: false,
        content: `body {
  font-family: 'Courier New', Courier, monospace;
}
canvas {
  background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
}`
      },
      {
        id: 'game-js',
        name: 'game.js',
        path: '/game.js',
        language: 'javascript',
        isFolder: false,
        content: `console.log("🎮 [Game] Arcade initialized!");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("scoreVal");
const highEl = document.getElementById("highVal");

let score = 0;
let highScore = 0;
let gameOver = false;

const paddle = {
  width: 90,
  height: 12,
  x: canvas.width / 2 - 45,
  y: canvas.height - 25,
  speed: 7
};

const ball = {
  x: canvas.width / 2,
  y: 100,
  vx: 4,
  vy: 4,
  radius: 7
};

let particles = [];

window.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const rootX = e.clientX - rect.left;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, rootX - paddle.width / 2));
});

function createExplosion(x, y, color) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 25,
      color
    });
  }
}

function update() {
  if (gameOver) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Bounce walls
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
    ball.vx = -ball.vx;
    createExplosion(ball.x, ball.y, "#22d3ee");
  }
  if (ball.y - ball.radius < 0) {
    ball.vy = -ball.vy;
    createExplosion(ball.x, ball.y, "#a855f7");
  }

  // Paddle collision
  if (
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    ball.vy = -Math.abs(ball.vy) * 1.03; // speed up slightly
    ball.vx += (Math.random() - 0.5) * 1.5;
    score += 10;
    scoreEl.innerText = score;
    if (score > highScore) {
      highScore = score;
      highEl.innerText = highScore;
    }
    createExplosion(ball.x, paddle.y, "#38bdf8");
    console.log("🏓 Hit paddle! Score:", score);
  }

  // Fall off bottom
  if (ball.y > canvas.height + 20) {
    gameOver = true;
    console.warn("💀 Game Over! Final Score:", score);
    setTimeout(() => {
      resetGame();
    }, 1500);
  }

  // Particles
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function resetGame() {
  score = 0;
  scoreEl.innerText = "0";
  ball.x = canvas.width / 2;
  ball.y = 80;
  ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = 4;
  gameOver = false;
  console.log("🔄 Game restarted");
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw paddle
  ctx.fillStyle = "#22d3ee";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 10;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f43f5e";
  ctx.shadowColor = "#f43f5e";
  ctx.shadowBlur = 15;
  ctx.fill();

  // Draw particles
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 4;
    ctx.fill();
  });

  ctx.shadowBlur = 0;

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Restarting...", canvas.width / 2, canvas.height / 2 + 30);
  }

  update();
  requestAnimationFrame(draw);
}

draw();`
      }
    ]
  },
  {
    id: 'python-algorithms',
    name: 'Python Computational Algorithms',
    description: 'Data structures, Fibonacci memoization, and sorting analysis executable in IDE terminal.',
    iconName: 'Terminal',
    badge: 'Python',
    entryFileId: 'py-main',
    files: [
      {
        id: 'py-main',
        name: 'main.py',
        path: '/main.py',
        language: 'python',
        isFolder: false,
        content: `# Cloud IDE Python Runner
import time

def fibonacci(n, memo={}):
    """Calculate the n-th Fibonacci number with memoization."""
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]

def quicksort(arr):
    """Sort an array using the QuickSort algorithm."""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

def main():
    print("=" * 45)
    print("  PYTHON RUNTIME & ALGORITHM BENCHMARK")
    print("=" * 45)
    
    # 1. Fibonacci benchmark
    terms = [10, 20, 30, 40]
    print("\\n[1] Fibonacci Memoization:")
    for t in terms:
        start = time.time()
        res = fibonacci(t)
        elapsed = (time.time() - start) * 1000
        print(f"    Fib({t:2d}) = {res:<12d} (calc in {elapsed:.4f} ms)")

    # 2. QuickSort benchmark
    data = [64, 34, 25, 12, 22, 11, 90, 48, 77, 3, 85, 19]
    print(f"\\n[2] QuickSort of {len(data)} items:")
    print(f"    Input:  {data}")
    sorted_data = quicksort(data)
    print(f"    Sorted: {sorted_data}")
    
    print("\\n✅ Execution successfully finished in IDE.")

if __name__ == "__main__":
    main()`
      },
      {
        id: 'py-readme',
        name: 'README.md',
        path: '/README.md',
        language: 'markdown',
        isFolder: false,
        content: `# Python Computational Environment

Run this file anytime by selecting **Terminal** in the IDE pane and typing:
\`\`\`bash
python main.py
\`\`\`
Or click the green **Run** button at the top!
`
      }
    ]
  }
];
