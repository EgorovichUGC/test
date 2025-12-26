/* Steal a Drop — browser client (MVP) */

const $ = (id) => document.getElementById(id);
const logEl = $("log");
const pillEl = $("pillStatus");
const balanceEl = $("balance");
const wagerEl = $("wager");
const liveFeedEl = $("liveFeed");
const historyEl = $("history");

const nickEl = $("nick");
const btnConnect = $("btnConnect");
const btnQueue = $("btnQueue");
const btnLeave = $("btnLeave");

const youNameEl = $("youName");
const oppNameEl = $("oppName");
const moveButtons = Array.from(document.querySelectorAll(".move"));

let ws = null;
let connected = false;
let inMatch = false;
let roomId = null;
let youName = "";
let oppName = "";
let pickedMove = null;
let balance = 1000.0;
let lastWager = 0;

function setPill(state, text) {
  pillEl.classList.remove("pill--ok", "pill--warn", "pill--bad");
  if (state === "ok") pillEl.classList.add("pill--ok");
  if (state === "warn") pillEl.classList.add("pill--warn");
  if (state === "bad") pillEl.classList.add("pill--bad");
  pillEl.textContent = text;
}

function addLog(html) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const line = document.createElement("div");
  line.innerHTML = `<span style="opacity:.55">[${time}]</span> ${html}`;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function addFeed(html) {
  if (!liveFeedEl) return;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const item = document.createElement("div");
  item.className = "item";
  item.innerHTML = `<div class="item__top"><div class="item__title">${html}</div><div class="item__meta">${time}</div></div>`;
  liveFeedEl.prepend(item);
  while (liveFeedEl.children.length > 12) liveFeedEl.removeChild(liveFeedEl.lastElementChild);
}

function addHistory(outcome, yourMove, oppMove, wager) {
  if (!historyEl) return;
  const badgeClass = outcome === "win" ? "badge--win" : outcome === "lose" ? "badge--lose" : "badge--draw";
  const badgeText = outcome === "win" ? "WIN" : outcome === "lose" ? "LOSE" : "DRAW";
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const item = document.createElement("div");
  item.className = "item";
  item.innerHTML = `
    <div class="item__top">
      <div class="item__title">${humanMove(yourMove)} vs ${humanMove(oppMove)}</div>
      <span class="badge ${badgeClass}">${badgeText}</span>
    </div>
    <div class="item__meta">${time} • wager ${wager.toFixed(2)} 💧</div>
  `;
  historyEl.prepend(item);
  while (historyEl.children.length > 10) historyEl.removeChild(historyEl.lastElementChild);
}

function setBalance(next) {
  balance = Math.max(0, Number(next) || 0);
  if (balanceEl) balanceEl.textContent = balance.toFixed(2);
  localStorage.setItem("sad_balance", String(balance));
}

function readWager() {
  const raw = (wagerEl?.value || "").toString().replace(",", ".");
  const num = Number.parseFloat(raw);
  if (!Number.isFinite(num) || num <= 0) return 1;
  return Math.min(num, 100000);
}

function setUiState() {
  btnQueue.disabled = !connected || inMatch;
  btnLeave.disabled = !connected;
  moveButtons.forEach((b) => (b.disabled = !connected || !inMatch));
}

function resetMatchUi() {
  inMatch = false;
  roomId = null;
  oppName = "";
  oppNameEl.textContent = "—";
  pickedMove = null;
  moveButtons.forEach((b) => b.classList.remove("move--active"));
  setUiState();
}

function wsUrl() {
  const isHttps = window.location.protocol === "https:";
  const proto = isHttps ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws`;
}

function safeNick(raw) {
  return String(raw || "")
    .trim()
    .slice(0, 18)
    .replace(/[^\p{L}\p{N}_\-.\s]/gu, "");
}

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  youName = safeNick(nickEl.value) || `Player${Math.floor(Math.random() * 9000 + 1000)}`;
  youNameEl.textContent = youName;

  setPill("warn", "connecting…");
  addLog("Подключаемся к серверу…");
  addFeed(`<b>${youName}</b> connected`);

  ws = new WebSocket(wsUrl());

  ws.addEventListener("open", () => {
    connected = true;
    setPill("ok", "online");
    addLog("<b>Подключено.</b>");
    ws.send(JSON.stringify({ type: "hello", name: youName }));
    setUiState();
  });

  ws.addEventListener("message", (ev) => {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }
    handleMsg(msg);
  });

  ws.addEventListener("close", () => {
    connected = false;
    setPill("bad", "offline");
    addLog("<b>Соединение закрыто.</b>");
    addFeed(`<b>${youName || "Player"}</b> disconnected`);
    resetMatchUi();
    setUiState();
  });

  ws.addEventListener("error", () => {
    setPill("bad", "offline");
    addLog("<b>Ошибка соединения.</b>");
  });
}

function queue() {
  if (!connected) return;
  const wager = readWager();
  if (wager > balance) {
    addLog("<b>Недостаточно баланса</b> для ставки (это демо).");
    setPill("bad", "low balance");
    return;
  }
  lastWager = wager;
  addLog(`Ищем соперника… ставка <b>${wager.toFixed(2)} 💧</b>`);
  addFeed(`<b>${youName}</b> queued • ${wager.toFixed(2)} 💧`);
  ws.send(JSON.stringify({ type: "queue" }));
  btnQueue.disabled = true;
  setPill("warn", "searching…");
}

function leave() {
  if (!connected) return;
  ws.send(JSON.stringify({ type: "leave" }));
  addLog("Вы вышли из матча/очереди.");
  addFeed(`<b>${youName}</b> left`);
  resetMatchUi();
  setPill("ok", "online");
}

function setMoveActive(move) {
  pickedMove = move;
  moveButtons.forEach((b) => b.classList.toggle("move--active", b.dataset.move === move));
}

function sendMove(move) {
  if (!connected || !inMatch || !roomId) return;
  setMoveActive(move);
  ws.send(JSON.stringify({ type: "move", move }));
  addLog(`Выбор сделан: <b>${humanMove(move)}</b>. Ждём соперника…`);
}

function humanMove(m) {
  if (m === "rock") return "Камень";
  if (m === "paper") return "Бумага";
  if (m === "scissors") return "Ножницы";
  return m;
}

function handleMsg(msg) {
  if (!msg || typeof msg.type !== "string") return;

  if (msg.type === "queued") {
    setPill("warn", "in queue…");
    addLog("Вы в очереди. Сейчас найдём матч.");
    return;
  }

  if (msg.type === "match_found") {
    inMatch = true;
    roomId = msg.roomId || null;
    oppName = msg.opponent?.name || "Opponent";
    oppNameEl.textContent = oppName;
    addLog(`Матч найден! Ваш соперник: <b>${oppName}</b>. Делайте ход.`);
    addFeed(`Match found: <b>${youName}</b> vs <b>${oppName}</b>`);
    setPill("ok", "in match");
    setUiState();
    return;
  }

  if (msg.type === "state") {
    // optional state updates
    if (msg.state === "waiting_for_moves") {
      setPill("ok", "pick move");
    }
    if (msg.state === "waiting_for_opponent") {
      setPill("warn", "waiting…");
    }
    return;
  }

  if (msg.type === "round_result") {
    const your = humanMove(msg.yourMove);
    const opp = humanMove(msg.oppMove);
    const outcome = msg.outcome;

    let outcomeText = "Ничья";
    if (outcome === "win") outcomeText = "Победа";
    if (outcome === "lose") outcomeText = "Поражение";

    addLog(`Раунд окончен: вы <b>${your}</b>, соперник <b>${opp}</b> → <b>${outcomeText}</b>.`);
    const wager = Math.max(0, Number(lastWager) || 0);
    if (wager > 0) {
      if (outcome === "win") setBalance(balance + wager);
      if (outcome === "lose") setBalance(balance - wager);
    }
    addHistory(outcome, msg.yourMove, msg.oppMove, wager);
    addFeed(`Result: <b>${youName}</b> vs <b>${oppName || "Opponent"}</b> • <b>${outcomeText}</b>`);
    pickedMove = null;
    moveButtons.forEach((b) => b.classList.remove("move--active"));
    setPill("ok", "rematch?");
    return;
  }

  if (msg.type === "opponent_left") {
    addLog("<b>Соперник вышел.</b> Вы вернулись в лобби.");
    addFeed(`<b>${oppName || "Opponent"}</b> left the match`);
    resetMatchUi();
    setPill("ok", "online");
    return;
  }

  if (msg.type === "error") {
    addLog(`<b>Ошибка:</b> ${String(msg.message || "неизвестно")}`);
    setPill("bad", "error");
    setUiState();
    return;
  }
}

btnConnect.addEventListener("click", connect);
btnQueue.addEventListener("click", queue);
btnLeave.addEventListener("click", leave);
moveButtons.forEach((b) => b.addEventListener("click", () => sendMove(b.dataset.move)));

document.addEventListener("keydown", (e) => {
  if (!inMatch) return;
  if (e.key === "1") sendMove("rock");
  if (e.key === "2") sendMove("paper");
  if (e.key === "3") sendMove("scissors");
});

$("year").textContent = String(new Date().getFullYear());
setPill("bad", "offline");
setUiState();

const saved = Number(localStorage.getItem("sad_balance"));
if (Number.isFinite(saved) && saved > 0) setBalance(saved);
else setBalance(balance);

addLog("Готово. Введите ник и нажмите <b>Connect</b>.");
addFeed("Welcome to Duels (demo)");

