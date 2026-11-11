// halo extras: the console (press ` to drop it down), go dark (press d to hide your wallet and balances on screen), and the live halo on the wall
(() => {
  'use strict';
  const Z = window.Z, FX = Z.FX, SND = FX.snd, { $, $$, esc, usd, pct, cls, S } = Z;
  const H = document.documentElement, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (s, n) => { s = String(s); return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length); }, lpad = (s, n) => { s = String(s); return s.length >= n ? s : ' '.repeat(n - s.length) + s; };
  const stocks = () => (S.board ? S.board.stocks : []), coins = () => (S.coins ? S.coins.coins : []);
  const find = q => { q = String(q || '').replace(/^\$/, '').toUpperCase(); return stocks().find(s => s.sym === q || s.name.toUpperCase() === q) || null; };
  const coinBy = q => { q = String(q || '').replace(/^\$/, '').toUpperCase(); return coins().find(c => c.symbol.toUpperCase() === q || c.mint === q) || null; };
  const lk = (h, t, n) => `<a href="${h}">${esc(t)}</a>` + ' '.repeat(Math.max(1, n - String(t).length));
  const pc = v => v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1) + '%', cc = v => v == null ? '' : v > 0 ? 'up' : v < 0 ? 'dn' : '';


  // ================================================================ the halo: every privacy layer orbiting on one ring, the coins launched here on an inner ring
  const kindOf = { chain: 'chain', protocol: 'protocol', network: 'network', compute: 'compute' };
  function orbInfo(n) { const el = $('#orbI'); if (!el) return; const L = stocks(), B = S.board;
    if (!n) el.innerHTML = `<span class="lab">the halo</span><b class="big">${L.length || '…'}</b><small>privacy layers orbiting${B ? ` · ${L.filter(s => s.route).length} pay in their own token` : ''}</small><em>hover a layer · click to open it</em>`;
    else if (n.coin) { const c = n.coin; el.innerHTML = `<span class="lab">coin · halo ${esc(c.stock)}</span><b class="big">$${esc(c.symbol)}</b><small>${esc(c.name)}</small><div class="row"><span>${usd(c.mcap || 0)}</span><span>curve ${c.curve || 0}%</span></div><em>click to open its page</em>`; }
    else { const x = n.s; el.innerHTML = `<span class="lab">#${x.rank} · ${esc(kindOf[x.kind] || x.kind || '')}</span><b class="big">${esc(x.sym)}</b><small>${esc(x.name)}</small><div class="row"><span>${usd(x.usd)}</span><span class="${cls(x.ch24)}">24h ${pct(x.ch24, 1)}</span><span class="${cls(x.perf30)}">30d ${pct(x.perf30, 1)}</span></div><small>pays holders in <b>${esc(x.route ? x.tok : 'SOL')}</b></small><em>click to open · or type launch ${esc(x.sym.toLowerCase())}</em>`; }
    el.classList.remove('sw'); void el.offsetWidth; el.classList.add('sw'); }
  function orbStats() { const el = $('#orbK'); if (!el) return; const L = stocks(); if (!L.length) { el.innerHTML = `<div>${Z.wait('board')}</div>`; return; }
    const up = L.filter(s => s.ch24 > 0).length, dn = L.filter(s => s.ch24 < 0).length, lead = [...L].filter(s => s.perf30 != null).sort((a, b) => b.perf30 - a.perf30)[0], T = S.status;
    el.innerHTML = `<div><span class="lab">today</span><b><span class="up">${up}▲</span> <span class="dn">${dn}▼</span></b></div><div><span class="lab">leader · 30d</span><b>${lead ? `<a href="#/l/${lead.sym}">${esc(lead.sym)}</a> <span class="up">${pct(lead.perf30, 1)}</span>` : '—'}</b></div><div><span class="lab">coins paired</span><b>${coins().length}</b></div><div><span class="lab">payouts</span><b>${T && T.payoutsLive ? '<span class="up">live</span>' : 'not live yet'}</b></div>`; }
  function orbit() { const box = $('#orb'), cv = $('#orbC'); if (!cv) return; const g = cv.getContext('2d'); let W = 0, Hc = 0, D = 1;
    const size = () => { D = Math.min(devicePixelRatio || 1, 2); W = box.clientWidth; Hc = box.clientHeight; cv.width = W * D; cv.height = Hc * D; cv.style.width = W + 'px'; cv.style.height = Hc + 'px'; g.setTransform(D, 0, 0, D, 0, 0); };
    size(); const ro = new ResizeObserver(size); ro.observe(box);
    let rot = 0, last = performance.now(), hov = null, speed = 1, mx = -1, my = -1, nodes = [], born = performance.now();
    const pt = e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    cv.addEventListener('pointermove', pt); cv.addEventListener('pointerleave', () => { mx = my = -1; });
    cv.addEventListener('click', e => { pt(e); const n = pick(); if (n) { SND.blip(740, .05); Z.go(n.coin ? '#/c/' + n.coin.mint : '#/l/' + n.s.sym); } });
    const pick = () => { let best = null, bd = 1e9; if (mx < 0) return null; for (const n of nodes) { const d = Math.hypot(n.x - mx, n.y - my); if (d < Math.max(16, n.r + 10) && d < bd && n.k > .15) { bd = d; best = n; } } return best; };
    const dots = (cx, cy, rx, ry, al, phase) => { g.fillStyle = `rgba(255,255,255,${al})`; const n = Math.round((rx + ry) * .9); for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + phase, z = (Math.sin(a) + 1) / 2; g.globalAlpha = .25 + .75 * z; g.fillRect(cx + rx * Math.cos(a) - .6, cy + ry * Math.sin(a) - .6, 1.2, 1.2); } g.globalAlpha = 1; };
    const draw = (n, on) => { const a = on ? 1 : .22 + .78 * n.k; g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (n.coin) { g.fillStyle = '#fff'; g.beginPath(); g.arc(n.x, n.y, n.r, 0, 6.2832); g.fill(); if ((n.k > .6 && W >= 600) || on) { g.font = '500 10px JB, monospace'; g.fillStyle = on ? '#fff' : '#a0a0a0'; g.fillText('$' + n.coin.symbol, n.x, n.y - n.r - 9); } g.globalAlpha = 1; return; }
      g.fillStyle = '#000'; g.strokeStyle = on ? '#fff' : `rgba(236,236,236,${(.45 + .55 * n.k).toFixed(2)})`; g.lineWidth = on ? 2 : 1.2; g.beginPath(); g.arc(n.x, n.y, n.r, 0, 6.2832); g.fill(); g.stroke();
      if (on) { g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; g.beginPath(); g.arc(n.x, n.y, n.r + 7, 0, 6.2832); g.stroke(); }
      const c24 = n.s.ch24; g.beginPath(); g.ellipse(n.x, n.y - n.r - 5, n.r * .85 + 2, (n.r * .85 + 2) * .3, 0, 0, 6.2832); g.strokeStyle = c24 > 0 ? '#8af0b4' : c24 < 0 ? '#ff7a7a' : '#9a9a9a'; g.lineWidth = 1.3; g.stroke();
      if (W < 600 && n.k < .5 && !on) { g.globalAlpha = 1; return; } g.font = `600 ${Math.round((W < 600 ? 8 : 9) + (W < 600 ? 3 : 4) * n.k)}px JB, monospace`; g.fillStyle = on ? '#fff' : `rgba(236,236,236,${(.4 + .6 * n.k).toFixed(2)})`; g.fillText(n.s.sym, n.x, n.y + n.r + 12); g.globalAlpha = 1; };
    const frame = now => { if (!cv.isConnected) { ro.disconnect(); return; } requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000); last = now;
      speed += ((hov ? .06 : 1) - speed) * .07; if (!RM) rot += dt * .085 * speed; const L = stocks(), C = coins(), intro = Math.min(1, (now - born) / 1400), ei = 1 - Math.pow(1 - intro, 3);
      g.clearRect(0, 0, W, Hc); const mob = W < 600, cx = W / 2, cy = Hc * .52, rx = (mob ? W * .4 : Math.min(W * .43, Hc * 1.3)) * (.6 + .4 * ei), ry = mob ? Math.min(Hc * .33, rx * 1.3) * (.6 + .4 * ei) : rx * .3;
      dots(cx, cy, rx, ry, .5, rot); dots(cx, cy, rx * .5, ry * .5, .35, -rot * 1.6);
      nodes = []; if (L.length) { const ms = L.map(s => Math.log10(Math.max(1, s.mcap || 1))), mx2 = Math.max(...ms), mn = Math.min(...ms);
        L.forEach((s, i) => { const a = rot + i / L.length * 6.2832, z = Math.sin(a), k = (z + 1) / 2, m = (Math.log10(Math.max(1, s.mcap || 1)) - mn) / ((mx2 - mn) || 1); nodes.push({ s, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), z, k, r: (4 + m * 9) * (.68 + .5 * k) * (W < 600 ? .8 : 1) }); }); }
      const CC = C.slice(0, 24); CC.forEach((c, i) => { const a = -rot * 1.6 + i / CC.length * 6.2832, z = Math.sin(a), k = (z + 1) / 2; nodes.push({ coin: c, x: cx + rx * .5 * Math.cos(a), y: cy + ry * .5 * Math.sin(a), z, k, r: 2.4 + 2 * k }); });
      nodes.sort((a, b) => a.z - b.z); const h = pick(); if (h !== hov && !(h && hov && h.s === hov.s && h.coin === hov.coin)) { hov = h; cv.style.cursor = hov ? 'pointer' : 'default'; orbInfo(hov); if (hov) SND.tick(.02, 5200); }
      for (const n of nodes) if (n.z < 0) draw(n, n === hov);
      g.save(); g.globalAlpha = .9; g.fillStyle = '#000'; g.beginPath(); g.ellipse(cx, cy, Math.max(0, rx * .5 - 26), Math.max(0, ry * .5 - 10), 0, 0, 6.2832); g.restore();
      for (const n of nodes) if (n.z >= 0) draw(n, n === hov); };
    requestAnimationFrame(frame); orbInfo(null); orbStats(); }
  Z.views.halo = { nav: 'halo',
    render() { return `<div class="vh"><h1><span data-scr>pick a halo.</span><small>get paid in it. every privacy layer, orbiting live: hover one to read it, click to open it.</small></h1><div class="rt"><a class="btn" href="#/wall"># the wall</a><a class="btn pri" href="#/launch">+ launch a coin</a></div></div>
      <div class="pn orb" id="orb"><canvas id="orbC"></canvas><div class="orb-c" id="orbI"></div><div class="orb-k" id="orbK"></div>
        <div class="orb-l"><span><i class="o1"></i>privacy layers · sized by market cap</span><span><i class="o3"></i>its halo: up or down today</span><span><i class="o2"></i>coins launched on halo</span></div></div>`; },
    init() { orbit(); }, refresh() { orbStats(); if (!$('#orbI .row')) orbInfo(null); } };

  // ================================================================ the console
  const con = document.createElement('section'); con.id = 'con'; con.setAttribute('aria-hidden', 'true');
  con.innerHTML = `<div class="cbar"><span>halo console</span><i>type <b>help</b> · tab completes · ↑ ↓ history · <b>\`</b> or esc closes</i><button type="button" id="conX" aria-label="close">×</button></div><div class="cout" id="conOut"></div><label class="cin"><span class="pr">halo<b>:~$</b></span><input id="conIn" autocomplete="off" spellcheck="false" aria-label="console"></label>`;
  document.body.appendChild(con);
  const out = $('#conOut'), inp = $('#conIn'), HIST = []; let hi = 0, open = false, greeted = false;
  const print = (html, c = '') => { const d = document.createElement('div'); d.className = 'cl ' + c; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; };
  const pre = lines => print(`<pre>${lines.join('\n')}</pre>`);
  const greet = () => { if (greeted) return; greeted = true; const B = S.board, T = S.status;
    pre([`<b>halo</b> · pick a halo. get paid in it.`, `${B ? B.stocks.length : '…'} privacy layers live · ${B ? B.stocks.filter(s => s.route).length : '…'} pay in their own token · ${T ? T.coins : '…'} coins paired`, `type <b>help</b> to see what this console can do.`]); };
  Z.con = { toggle(v) { open = v ?? !open; con.classList.toggle('on', open); con.setAttribute('aria-hidden', String(!open)); if (open) { greet(); setTimeout(() => inp.focus(), 60); SND.whoosh(.35, .06, false); } else { inp.blur(); SND.tick(.03, 2400); } }, run: cmd => run(cmd) };
  $('#conX').onclick = () => Z.con.toggle(false);
  const CMDS = {
    help: ['', 'this list', () => pre(Object.entries(CMDS).map(([k, [a, d]]) => `  <b>${pad(k + (a ? ' ' + a : ''), 18)}</b>${d}`))],
    ls: ['[kind]', 'every privacy layer (chain, protocol, network, compute)', a => { const k = (a[0] || '').toLowerCase(), L = stocks().filter(s => !k || s.kind === k); if (!L.length) return print(S.board ? 'no layers of that kind' : 'still reading prices…', 'mu');
      pre([`<span class="mu">${pad('#', 4)}${pad('halo', 8)}${pad('name', 18)}${lpad('price', 12)}${lpad('24h', 9)}${lpad('30d', 9)}  pays in</span>`, ...L.map(s => `${pad(s.rank, 4)}${lk('#/l/' + s.sym, s.sym, 8)}${pad(s.name, 18)}${lpad(usd(s.usd), 12)}<span class="${cc(s.ch24)}">${lpad(pc(s.ch24), 9)}</span><span class="${cc(s.perf30)}">${lpad(pc(s.perf30), 9)}</span>  ${s.route ? s.tok : 'SOL'}`)]); }],
    top: ['[n]', 'the best halos over 30 days', a => { const n = Math.max(1, Math.min(31, +a[0] || 5)); pre(stocks().slice(0, n).map(s => `${pad('#' + s.rank, 5)}${lk('#/l/' + s.sym, s.sym, 8)}<span class="${cc(s.perf30)}">${lpad(pc(s.perf30), 9)}</span>  ${FX.bar(Math.min(100, Math.abs(s.perf30 || 0)), 20)}`)); }],
    movers: ['', 'biggest moves today', () => { const L = stocks().filter(s => s.ch24 != null).sort((a, b) => b.ch24 - a.ch24); if (!L.length) return print('no data yet', 'mu'); pre(['<span class="mu">up</span>', ...L.slice(0, 5).map(s => `  ${lk('#/l/' + s.sym, s.sym, 8)}<span class="up">${lpad(pc(s.ch24), 8)}</span>`), '<span class="mu">down</span>', ...L.slice(-5).reverse().map(s => `  ${lk('#/l/' + s.sym, s.sym, 8)}<span class="dn">${lpad(pc(s.ch24), 8)}</span>`)]); }],
    price: ['<halo>', 'a price and its 30 days', a => { const s = find(a[0]); if (!s) return print(`no halo called ${esc(a[0] || '')}. try <b>ls</b>.`, 'dn');
      pre([`<b>${s.sym}</b> · ${esc(s.name)} · #${s.rank}`, `${usd(s.usd)}   24h <span class="${cc(s.ch24)}">${pc(s.ch24)}</span>   30d <span class="${cc(s.perf30)}">${pc(s.perf30)}</span>`, s.closes && s.closes.length > 4 ? FX.blocks(s.closes, Math.min(60, s.closes.length * 2)) : '']); }],
    halo: ['<halo>', 'what a halo pays its holders in, and how it hides', a => { const s = find(a[0]); if (!s) return print(`no halo called ${esc(a[0] || '')}. try <b>ls</b>.`, 'dn');
      pre([`<b>${s.sym}</b> · ${esc(s.name)} · ${esc(s.kind || '')}`, s.route ? `pays holders in <b>${esc(s.tok)}</b>, bought on Solana` : `pays holders in <b>SOL</b>: ${esc(s.tok)} doesn't trade on Solana yet`, '', ...String(s.how || '').match(/.{1,72}(\s|$)/g).map(x => '  ' + esc(x.trim()))]); }],
    open: ['<halo|$coin|view>', 'go there', a => { const q = a[0] || ''; const v = Z.NAV.find(n => n[0] === q.toLowerCase()), s = find(q), c = coinBy(q); if (v) Z.go('#/' + v[0]); else if (c) Z.go('#/c/' + c.mint); else if (s) Z.go('#/l/' + s.sym); else return print('nothing called ' + esc(q), 'dn'); print('opening ' + esc(q), 'mu'); }],
    launch: ['<halo>', 'launch a coin with that halo', a => { const s = find(a[0]); Z.go('#/launch' + (s ? '?layer=' + s.sym : '')); print(s ? `launching a coin with a <b>${s.sym}</b> halo…` : 'opening launch…', 'mu'); setTimeout(() => Z.con.toggle(false), 350); }],
    coins: ['', 'every coin launched on halo', () => { const C = coins(); if (!C.length) return print(S.coins ? 'no coins yet. be the first: <b>launch zec</b>' : 'reading the chain…', 'mu');
      pre(C.slice(0, 30).map(c => `${lk('#/c/' + c.mint, '$' + c.symbol, 11)}${pad('halo ' + c.stock, 12)}${lpad(usd(c.mcap || 0), 10)}  ${FX.bar(c.curve || 0, 12)} ${lpad((c.curve || 0) + '%', 4)}`)); }],
    watch: ['<halo>', 'add or remove a halo from your watchlist', a => { const s = find(a[0]); if (!s) return print('no halo called ' + esc(a[0] || ''), 'dn'); Z.watch.toggle(s.sym); print(`${s.sym} ${Z.watch.has(s.sym) ? 'is on' : 'is off'} your watchlist`); }],
    whoami: ['', 'your wallet', () => { const W = Z.wl && Z.wl(); if (!W || !W.pk) return print('not logged in. <b>login</b> connects a wallet.', 'mu'); pre([`wallet  <span class="rx">${esc(W.pk)}</span>`, W.view ? `SOL     <span class="rx">${(W.view.sol || 0).toFixed(3)}</span>` : '']); }],
    login: ['', 'connect a wallet', () => { Z.con.toggle(false); Z.login(); }],
    status: ['', 'is everything up', () => { const T = S.status, B = S.board; pre([`prices   ${B ? '<span class="up">live</span> · ' + B.stocks.length + ' halos' : S.err ? '<span class="dn">' + esc(S.err) + '</span>' : 'reading…'}`, `chain    ${S.coins ? '<span class="up">live</span> · ' + coins().length + ' coins' : S.coinsErr ? '<span class="dn">' + esc(S.coinsErr) + '</span>' : 'reading…'}`, `payouts  ${T && T.payoutsLive ? '<span class="up">live</span>' : 'not live yet'}`, `SOL      ${B ? usd(B.sol, 2) : '—'}`]); }],
    sol: ['', 'the SOL price', () => print(S.board ? 'SOL ' + usd(S.board.sol, 2) : 'reading…')],
    dark: ['', 'go dark: hide your wallet and balances on screen', () => { Z.dark(); print(H.classList.contains('dark') ? 'gone dark. hover anything blurred to see it.' : 'back in the light.'); }],
    sound: ['[on|off]', 'sound on or off', a => { const v = a[0] === 'on' ? true : a[0] === 'off' ? false : !SND.on; if (v !== SND.on) $('#sndb').click(); print('sound ' + (v ? 'on' : 'off')); }],
    intro: ['', 'play the intro again', () => { location.href = '/'; }],
    date: ['', 'the time, in UTC', () => print(new Date().toUTCString())],
    history: ['', 'what you typed', () => pre(HIST.map((h, i) => `${lpad(i + 1, 3)}  ${esc(h)}`))],
    clear: ['', 'clear the screen', () => { out.innerHTML = ''; }],
    exit: ['', 'close the console', () => Z.con.toggle(false)]
  };
  function run(line) { line = line.trim(); if (!line) return; HIST.push(line); hi = HIST.length; print(`<span class="pr">halo<b>:~$</b></span> ${esc(line)}`, 'echo');
    const [c, ...a] = line.split(/\s+/), k = c.toLowerCase(), f = CMDS[k];
    if (f) { try { f[2](a); } catch (e) { print('error: ' + esc(e.message), 'dn'); } SND.blip(880, .03); }
    else if (find(c)) CMDS.price[2]([c]); else print(`unknown command <b>${esc(c)}</b>. type <b>help</b>.`, 'dn'); }
  const complete = v => { const parts = v.split(/\s+/); if (parts.length === 1) { const m = Object.keys(CMDS).filter(k => k.startsWith(parts[0].toLowerCase())); return m.length === 1 ? m[0] + ' ' : (m.length ? (print(m.join('   '), 'mu'), v) : v); }
    const last = parts.pop().toUpperCase(), m = stocks().map(s => s.sym).filter(s => s.startsWith(last)); if (m.length === 1) return [...parts, m[0].toLowerCase()].join(' '); if (m.length) print(m.join('   '), 'mu'); return v; };
  inp.addEventListener('keydown', e => { e.stopPropagation();
    if (e.key === 'Enter') { run(inp.value); inp.value = ''; } else if (e.key === 'Tab') { e.preventDefault(); inp.value = complete(inp.value); } else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) inp.value = HIST[--hi]; } else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(HIST.length, hi + 1); inp.value = HIST[hi] || ''; }
    else if (e.key === 'Escape' || e.key === '`') { e.preventDefault(); Z.con.toggle(false); } });
  out.addEventListener('click', e => { const a = e.target.closest('a'); if (a) setTimeout(() => Z.con.toggle(false), 120); });

  // ================================================================ go dark: your wallet and your numbers blur on screen; hover to see them
  let dk = false; try { dk = localStorage.getItem('halo-dark') === '1'; } catch (e) { }
  const paintDark = () => { H.classList.toggle('dark', dk); const b = $('#darkb'); if (b) { b.textContent = dk ? 'dark · on' : 'go dark'; b.classList.toggle('on', dk); } };
  Z.dark = v => { dk = v ?? !dk; try { localStorage.setItem('halo-dark', dk ? '1' : '0'); } catch (e) { } paintDark(); SND.blip(dk ? 330 : 660, .05); Z.toast && Z.toast(dk ? 'Gone dark: your wallet and balances are hidden on screen. Hover to see them.' : 'Back in the light.'); };
  // the footer gets two more buttons
  const setView = () => { H.dataset.view = Z.view ? Z.view() : ''; }; addEventListener('hashchange', () => setTimeout(setView, 0)); setTimeout(setView, 0);
  addEventListener('keydown', e => { if (window.ZI && window.ZI.active) return; const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '');
    if ((e.key === '`' || e.key === '~') && !typing) { e.preventDefault(); Z.con.toggle(); } else if (e.key === 'd' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) Z.dark(); else if (e.key === 'Escape' && open) Z.con.toggle(false); });

  // ================================================================ the live halo: a small ASCII ring that floats beside the wall's title
  function mountHalo() { const rt = $('#view .vh .rt'); if (!rt || $('#wHalo')) return; const cv = document.createElement('canvas'); cv.id = 'wHalo'; cv.className = 'whalo'; cv.setAttribute('aria-hidden', 'true'); rt.prepend(cv);
    const D = Math.min(devicePixelRatio || 1, 2), W = 168, Hh = 64, fs = 5, cw = fs * .6, ch = fs * 1.1, cols = Math.floor(W / cw), rows = Math.floor(Hh / ch), g = cv.getContext('2d'); cv.width = W * D; cv.height = Hh * D; cv.style.width = W + 'px'; cv.style.height = Hh + 'px'; g.setTransform(D, 0, 0, D, 0, 0);
    let last = 0; const t0 = performance.now();
    const draw = now => { if (!cv.isConnected) return; requestAnimationFrame(draw); if (now - last < 33) return; last = now; const t = (now - t0) / 1000, Zg = FX.zero3d(cols, rows, .45 * Math.sin(t * .8), 1.0 + .22 * Math.sin(t * 1.3), { slash: false, sy: 1, r: .3, scale: 2.7, aspect: ch / cw, fine: true });
      g.clearRect(0, 0, W, Hh); g.font = `400 ${fs}px JB, monospace`; g.textBaseline = 'top';
      for (let j = 0; j < Zg.out.length; j++) { const c = Zg.out[j]; if (c === ' ') continue; g.fillStyle = `rgba(240,240,240,${(.25 + Zg.lum[j] * .75).toFixed(2)})`; g.fillText(c, (j % cols) * cw, Math.floor(j / cols) * ch); } };
    if (RM) { draw(0); } else requestAnimationFrame(draw); }
  const w = Z.views.wall; if (w) { const init = w.init; w.init = function (...a) { const r = init ? init.apply(this, a) : undefined; mountHalo(); return r; }; }
  setTimeout(mountHalo, 0);
  Z.start();
  // the footer gets two more buttons (the shell exists once start has run)
  const bot = $('#bot'); if (bot) { const kb = $('#kb'); const mk = (id, t, fn) => { const b = document.createElement('button'); b.className = 'keys'; b.id = id; b.type = 'button'; b.textContent = t; b.onclick = fn; bot.insertBefore(b, kb); return b; };
    mk('conb', '` console', () => Z.con.toggle()); mk('darkb', 'go dark', () => Z.dark()); }
  paintDark();
})();
