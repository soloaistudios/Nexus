const opportunities = [
  { pair: 'BTC / USDT', buy: 'Binance', sell: 'OKX', spread: 0.84, profit: 1078.98, liquidity: 92, confidence: 98 },
  { pair: 'ETH / USDT', buy: 'Bybit', sell: 'Kraken', spread: 0.71, profit: 764.21, liquidity: 84, confidence: 96 },
  { pair: 'SOL / USDT', buy: 'OKX', sell: 'Binance', spread: 0.63, profit: 518.44, liquidity: 78, confidence: 95 },
  { pair: 'XRP / USDT', buy: 'Kraken', sell: 'Coinbase', spread: 0.46, profit: 304.87, liquidity: 67, confidence: 91 },
  { pair: 'AVAX / USDT', buy: 'Bybit', sell: 'OKX', spread: 0.39, profit: 212.65, liquidity: 61, confidence: 89 },
  { pair: 'LINK / USDT', buy: 'Coinbase', sell: 'Binance', spread: 0.27, profit: 146.31, liquidity: 74, confidence: 87 }
];

const venues = ['Binance','OKX','Bybit','Kraken','Coinbase','Bitget','Gate'];
const feedMessages = [
  ['ROUTE','BTC/USDT spread confirmed 路 +0.84% edge detected','info'],
  ['SCAN','1,284 venue books synchronized',''],
  ['ROUTE','Liquidity gate passed 路 depth $4.7M',''],
  ['EXEC','Simulated route #NXR-88421 路 projected +$1,078.98',''],
  ['RISK','Slippage projection 0.08% 路 within guardrail','warn'],
  ['ROUTE','ETH/USDT spread widened 路 +0.71%','info'],
  ['AI','NEURA confidence score 96.4 路 route eligible',''],
  ['EXEC','Settlement check complete 路 no stale quotes',''],
  ['SCAN','Cross-venue latency stable at 18ms','info']
];

const $ = (id) => document.getElementById(id);
const fmtUSD = (v) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(v);

function renderOpportunities() {
  $('opportunityRows').innerHTML = opportunities.map((o, i) => `
    <tr>
      <td><span class="pair">${o.pair}</span><span class="subtle">ROUTE ${String(i+1).padStart(2,'0')}</span></td>
      <td>${o.buy}</td>
      <td>${o.sell}</td>
      <td class="spread">+${o.spread.toFixed(2)}%</td>
      <td class="profit-positive">+${fmtUSD(o.profit)}</td>
      <td><div class="bar" title="${o.liquidity}% liquidity"><span style="width:${o.liquidity}%"></span></div></td>
      <td><span class="confidence">${o.confidence}% AI</span></td>
      <td><button class="route-btn" data-index="${i}">Preview</button></td>
    </tr>
  `).join('');
}

function renderVenues() {
  $('venuePills').innerHTML = venues.map(v => `<span><span class="status-dot" style="display:inline-block;width:5px;height:5px;margin-right:6px"></span>${v}</span>`).join('');
}

function addFeedLine([tag, message, tone='']) {
  const el = document.createElement('div');
  el.className = 'feed-line';
  const now = new Date();
  const time = now.toLocaleTimeString('en-GB', { hour12:false });
  el.innerHTML = `<span class="feed-time">${time}</span><span class="feed-tag">[${tag}]</span><span class="feed-message ${tone}">${message}</span>`;
  $('terminalFeed').prepend(el);
  const lines = $('terminalFeed').children;
  if (lines.length > 30) lines[lines.length - 1].remove();
}

function seedFeed() {
  $('terminalFeed').innerHTML = '';
  feedMessages.slice().reverse().forEach((m, i) => setTimeout(() => addFeedLine(m), i * 70));
}

let running = false;
let feedTimer;
function setRunning(next) {
  running = next;
  const btn = $('startBtn');
  btn.classList.toggle('running', running);
  btn.querySelector('.btn-content').innerHTML = running
    ? '<span class="play-icon">鈻�</span> Arbitrage Running'
    : '<span class="play-icon">鈻�</span> Start Arbitrage';
  if (running) {
    showToast('NEURA execution engine started 路 scanning live routes');
    addFeedLine(['EXEC', 'Arbitrage engine engaged 路 route selection active']);
    feedTimer = setInterval(() => {
      const pool = [
        ['SCAN','Order book delta detected 路 recomputing route scores','info'],
        ['ROUTE',`Best edge now +${(0.34 + Math.random()*.72).toFixed(2)}% 路 awaiting gate`],
        ['RISK','Risk governor approved current opportunity'],
        ['AI',`NEURA confidence ${(91 + Math.random()*8).toFixed(1)}% 路 model stable`]
      ];
      addFeedLine(pool[Math.floor(Math.random()*pool.length)]);
    }, 1800);
  } else {
    clearInterval(feedTimer);
    showToast('Arbitrage execution paused 路 monitoring remains online');
    addFeedLine(['EXEC', 'Arbitrage engine paused by operator','warn']);
  }
}

function showToast(message) {
  const t = $('toast');
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => t.classList.remove('show'), 3000);
}

$('startBtn').addEventListener('click', () => setRunning(!running));
$('clearFeedBtn').addEventListener('click', () => { $('terminalFeed').innerHTML = ''; showToast('Transaction feed cleared'); });
$('refreshBtn').addEventListener('click', () => {
  opportunities.forEach(o => {
    o.spread = Math.max(0.12, o.spread + (Math.random()-.5)*.08);
    o.profit = Math.max(40, o.profit + (Math.random()-.5)*55);
    o.confidence = Math.round(Math.min(99, Math.max(82, o.confidence + (Math.random()-.5)*4)));
  });
  renderOpportunities();
  const scan = 1160 + Math.floor(Math.random()*220);
  $('scanRate').textContent = scan.toLocaleString();
  $('latency').textContent = 15 + Math.floor(Math.random()*8);
  $('scanProgress').style.width = `${64 + Math.floor(Math.random()*30)}%`;
  addFeedLine(['SCAN','Market intelligence refresh completed','info']);
  showToast('Market intelligence refreshed');
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.route-btn');
  if (!btn) return;
  const o = opportunities[Number(btn.dataset.index)];
  $('routeFrom').textContent = o.buy;
  $('routeTo').textContent = o.sell;
  $('netEdge').textContent = `+${o.spread.toFixed(2)}%`;
  $('estReturn').textContent = `+${fmtUSD(o.profit)}`;
  addFeedLine(['ROUTE', `${o.pair} preview loaded 路 ${o.buy} 鈫� ${o.sell}`, 'info']);
  showToast(`${o.pair} route selected 路 +${o.spread.toFixed(2)}% projected edge`);
});

$('walletBtn').addEventListener('click', () => {
  const connected = $('walletText').textContent !== 'Connect Wallet';
  $('walletText').textContent = connected ? 'Connect Wallet' : '0x7A9C鈥�42F1';
  showToast(connected ? 'Wallet disconnected' : 'Demo wallet connected 路 account ready');
  addFeedLine(['WALLET', connected ? 'Wallet session disconnected' : 'Wallet connected 路 execution permissions synced']);
});

renderOpportunities();
renderVenues();
seedFeed();
setInterval(() => {
  if (!running) addFeedLine(feedMessages[Math.floor(Math.random()*feedMessages.length)]);
}, 3200);
