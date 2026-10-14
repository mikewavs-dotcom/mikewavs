// @wavs_digital meme engine.
// build(spec) lays out the frame and returns layout warnings; renderAt(t) poses every element
// for time t (seconds). Everything is a pure function of t, so renders are deterministic and the
// loop is seamless: background motion completes whole cycles per loop, and the foreground
// CRT-wipes back to the same single dot it starts from.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, u) => a + (b - a) * u;
  const eOut = (u) => 1 - Math.pow(1 - u, 3);
  const eIn = (u) => u * u * u;
  const eInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const frac = (x) => x - Math.floor(x);
  const TAU = Math.PI * 2;
  const hash = (n) => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453);
  const snap = (v, g = 2) => Math.round(v / g) * g;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const COLORS = { gold: '#C9A24B', cyan: '#22C3EC', mag: '#E90AA7', bone: '#F2EEE4' };
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const frame = (color, inner) => {
    const f = el('div', 'frame ' + (color || ''));
    const i = el('div', 'in');
    if (inner) i.innerHTML = inner;
    f.appendChild(i);
    return f;
  };
  // "*word*" -> accent color, "\n" -> line break
  const rich = (s) => esc(s).split('\n').map((l) => l.replace(/\*([^*]+)\*/g, '<em>$1</em>')).join('<br>');

  let S, D, T, FPS, prop, stars, motes, bgctx;
  // whole cycles per loop at about `hz` per second, so motion keeps its speed at any duration
  const cycles = (hz) => Math.max(1, Math.round(hz * D));
  const E = {};
  const fx = { shake: 0, flash: 0, scan: 0, glow: 0 };

  // ---------- setup line with per-character typing ----------
  function makeSetup(text, extraCls) {
    const box = el('div', 'setup' + (extraCls ? ' ' + extraCls : ''));
    const chars = [];
    let accent = false;
    text.split('\n').forEach((line, li) => {
      if (li) box.appendChild(el('br'));
      line.split(' ').forEach((word, wi) => {
        if (wi) box.appendChild(document.createTextNode(' '));
        const w = el('span', 'w');
        for (const ch of word) {
          if (ch === '*') { accent = !accent; continue; }
          const c = el('span', 'c' + (accent ? ' a' : ''));
          c.textContent = ch;
          w.appendChild(c);
          chars.push(c);
        }
        box.appendChild(w);
      });
    });
    const cur = el('span', 'cursor');
    box.appendChild(cur);
    E.setup = { box, chars, cur };
    return box;
  }

  function renderSetup(t) {
    const { chars, cur } = E.setup;
    const n = chars.length;
    const k = t >= T.typeEnd ? n : Math.floor(seg(t, T.typeStart, T.typeEnd) * n + 1e-6);
    chars.forEach((c, i) => c.classList.toggle('on', i < k));
    let show = false;
    if (t >= T.typeStart && t < T.typeEnd) show = true;
    else if (t >= T.typeEnd && t < T.punch) show = Math.floor((t - T.typeEnd) / 0.16) % 2 === 0;
    cur.style.display = show ? 'block' : 'none';
    if (show) {
      const ref = chars[Math.max(0, k - 1)];
      const fs = parseFloat(getComputedStyle(E.setup.box).fontSize);
      cur.style.left = (k ? ref.offsetLeft + ref.offsetWidth + fs * 0.08 : ref.offsetLeft) + 'px';
      cur.style.top = ref.offsetTop + ref.offsetHeight * 0.1 + 'px';
    }
  }

  // ---------- props: the visual gag for each meme ----------
  const PROPS = {};

  // Two scoreboards: streams that never reach the payout line vs one presale fan.
  PROPS.streams = {
    build(st, p) {
      st.appendChild(makeSetup(S.setup.text));
      const duo = el('div', 'duo');
      const L = p.left, R = p.right;
      const l = frame('', `<div class="px t cyan-t">${esc(L.title)}</div>
        <div class="px num"><span class="n">0</span><small>${esc(L.unit)}</small></div>
        <div class="pbar">${'<i></i>'.repeat(20)}</div>
        <div class="px pl">${esc(L.payLabel || 'Payout')}</div><div class="px pay mag-t">${esc(L.payout)}</div>`);
      const r = frame('gold', `<div class="px t" style="color:var(--gold)">${esc(R.title)}</div>
        <div class="px num"><span class="n">0</span><small>${esc(R.unit)}</small></div>
        <div class="px pl" style="margin-top:82px">${esc(R.payLabel || 'Payout')}</div><div class="px pay">${esc(R.before || '$0.00')}</div>`);
      const coin = sprite('coin', 9);
      coin.className += ' coin';
      r.firstChild.appendChild(coin);
      duo.append(l, r);
      st.appendChild(duo);
      E.p = { l, r, coin, ln: $('.n', l), bar: [...l.querySelectorAll('.pbar i')], rn: $('.n', r), rpay: $('.pay', r) };
    },
    render(t, tp) {
      const p = S.prop, P = E.p;
      const target = p.left.target;
      const u = seg(t, T.typeStart + 0.05, T.punch - 0.15);
      const n = Math.round(target * (1 - Math.pow(1 - u, 4)));
      P.ln.textContent = n.toLocaleString('en-US');
      const goal = p.left.goal;
      const filled = Math.min(19, Math.floor((n / goal) * 20));
      P.bar.forEach((b, i) => {
        b.className = i < filled ? 'f' : '';
        if (i === 19 && u >= 1) b.className = Math.floor(t / 0.2) % 2 ? 'h' : '';
      });
      // right box wakes up on the punch: coin drops, fan count and payout flip
      const v = t - tp;
      const land = 0.2;
      P.r.style.opacity = v < 0 ? 0.5 : 1;
      if (v < 0) {
        P.coin.style.opacity = 0;
        P.rn.textContent = '0';
        P.rpay.textContent = p.right.before || '$0.00';
        P.rpay.style.color = 'rgba(242,238,228,.45)';
        P.rpay.style.transform = '';
      } else {
        P.coin.style.opacity = 1;
        let y = 0;
        if (v < land) y = lerp(-220, 0, eIn(v / land));
        else if (v < land + 0.16) y = -26 * Math.sin(Math.PI * seg(v, land, land + 0.16));
        const spin = v > land + 0.16 ? Math.abs(Math.cos(TAU * 0.8 * (v - land - 0.16))) : 1;
        P.coin.style.transform = `translateY(${snap(y, 3)}px) scaleX(${Math.max(0.15, spin).toFixed(3)})`;
        const hit = v >= land;
        P.rn.textContent = hit ? String(p.right.count) : '0';
        P.rpay.textContent = hit ? p.right.payout : p.right.before || '$0.00';
        P.rpay.style.color = hit ? 'var(--gold)' : 'rgba(242,238,228,.45)';
        const pop = hit ? 1 + 0.25 * (1 - eOut(seg(v, land, land + 0.25))) : 1;
        P.rpay.style.transform = `scale(${pop})`;
        P.rpay.style.transformOrigin = '0 50%';
      }
    },
  };

  // RPG dialog: the label NPC talks, the merch walks over to his side on the punch.
  PROPS.dialog = {
    build(st, p) {
      const scene = el('div', 'scene');
      const merch = el('div', 'merch');
      const lab = el('div', 'px lab', esc(p.ownerLabel || 'Your merch'));
      const items = el('div', 'items');
      // items: sprite names, or {name, px} to override the size
      const SIZE = { tee: 11, vinyl: 12, cassette: 10, coin: 10, heart: 12, fan: 13, fan2: 13, fan3: 13 };
      const locks = [];
      const its = (p.items || ['tee', 'vinyl', 'tee']).map((it) => {
        const n = typeof it === 'string' ? it : it.name;
        const s = sprite(n, (it && it.px) || SIZE[n] || 11);
        s.style.position = 'relative';
        if (p.action === 'lock') {
          const lk = sprite('lock', 5);
          lk.style.cssText = 'position:absolute;left:50%;top:50%;margin:-25px 0 0 -25px;opacity:0';
          s.appendChild(lk);
          locks.push(lk);
        }
        items.appendChild(s);
        return s;
      });
      merch.append(lab, items);
      const npc = el('div', 'npc');
      const exec = sprite(p.npc || 'exec', 15, null);
      npc.append(exec);
      scene.append(merch, npc);
      const dlg = frame('dlg', '');
      dlg.className = 'frame dlg';
      const who = el('div', 'px chip who', esc(p.speaker || 'Label'));
      const more = el('div', 'px more', '&#9660;');
      dlg.firstChild.append(who, makeSetup(S.setup.text), more);
      st.append(scene, dlg);
      E.p = { exec, its, lab, more, npc, locks };
    },
    render(t, tp) {
      const P = E.p, p = S.prop;
      const talking = t >= T.typeStart && t < T.typeEnd;
      const tl = T.punch; // label chip time
      let f = null;
      if (t >= tl) f = 'grin';
      else if (talking) f = Math.floor(t / 0.09) % 2 ? 'talk' : null;
      P.exec.setFrame(f);
      P.exec.style.transform = `translateY(${snap(Math.sin((TAU * cycles(0.8) * t) / D) * 5, 5)}px)`;
      P.more.style.opacity = t >= T.typeEnd && t < tl && Math.floor((t - T.typeEnd) / 0.2) % 2 === 0 ? 1 : 0;
      if (p.action === 'lock') {
        // items stay put but get locked behind a paywall once the translation lands
        P.its.forEach((s, i) => {
          const v = seg(t, tp + 0.12 + i * 0.08, tp + 0.3 + i * 0.08);
          s.firstChild.style.opacity = lerp(1, 0.3, v);
          const lk = P.locks[i];
          lk.style.opacity = v > 0 ? 1 : 0;
          const y = v < 1 ? lerp(-90, 0, eIn(v)) : 0;
          lk.style.transform = `translateY(${snap(y, 5)}px)`;
        });
      } else {
        // items slide over to the NPC once the translation lands
        if (P.dx == null) {
          const nx = P.npc.offsetLeft + P.npc.offsetWidth * 0.5;
          P.dx = P.its.map((s) => nx - (s.offsetLeft + s.offsetWidth / 2) - 40);
        }
        P.its.forEach((s, i) => {
          const v = seg(t, tp + 0.12 + i * 0.07, tp + 0.5 + i * 0.07);
          const x = P.dx[i] * eInOut(v) + (i - 1) * 46 * eInOut(v);
          const y = -Math.sin(Math.PI * v) * 40 + 70 * eInOut(v);
          const sc = lerp(1, 0.62, eInOut(v));
          s.style.transform = `translate(${snap(x, 3)}px, ${snap(y, 3)}px) scale(${sc})`;
          s.style.zIndex = 3;
        });
      }
      P.lab.textContent = t >= tp + 0.5 ? p.afterLabel || 'Their merch' : p.ownerLabel || 'Your merch';
      P.lab.style.color = t >= tp + 0.5 ? 'var(--mag)' : 'var(--cyan)';
    },
  };

  // Feed reach glitches out; the email list stays online.
  PROPS.reach = {
    build(st, p) {
      st.appendChild(makeSetup(S.setup.text));
      const m = el('div', 'meters');
      const a = frame('mag', `<div class="row"><span class="px t mag-t">${esc(p.feed.title)}</span><span class="px st mag-t">${esc(p.feed.ok)}</span></div><div class="blocks">${'<i></i>'.repeat(20)}</div>`);
      const b = frame('', `<div class="row"><span class="px t cyan-t">${esc(p.list.title)}</span><span class="px st cyan-t"><i class="lamp"></i><span class="s">${esc(p.list.ok)}</span></span></div><div class="blocks">${'<i></i>'.repeat(20)}</div>`);
      a.classList.add('meter'); b.classList.add('meter');
      const cv = el('canvas', 'noise');
      cv.width = 120; cv.height = 40;
      a.firstChild.appendChild(cv);
      m.append(a, b);
      st.appendChild(m);
      E.p = { a, b, cv, ab: [...a.querySelectorAll('.blocks i')], bb: [...b.querySelectorAll('.blocks i')], ast: $('.st', a), lamp: $('.lamp', b), bst: $('.s', b) };
    },
    render(t, tp) {
      const P = E.p, p = S.prop;
      const fr = Math.round(t * FPS);
      const g0 = p.glitch ? p.glitch[0] : T.typeEnd - 0.25, g1 = p.glitch ? p.glitch[1] : T.punch - 0.1;
      const inG = t >= g0 && t < g1;
      const u = seg(t, g0, g1);
      let n = Math.round(lerp(20, 1, eIn(u) * 0.5 + u * 0.5));
      if (inG) n = clamp(n + Math.round((hash(fr) - 0.5) * 6), 1, 20);
      const dead = t >= g1;
      P.ab.forEach((b, i) => {
        let on = i < n;
        if (dead && i === 0) on = Math.floor(t / 0.22) % 2 === 0;
        b.style.background = on ? 'var(--mag)' : 'rgba(242,238,228,.08)';
      });
      const j = inG ? (hash(fr * 3.1) - 0.5) * 26 : 0;
      P.a.style.transform = `translateX(${snap(j, 2)}px)`;
      const split = inG ? 4 + hash(fr * 7.7) * 8 : 0;
      P.a.style.filter = split ? `drop-shadow(${split}px 0 0 rgba(34,195,236,.7)) drop-shadow(${-split}px 0 0 rgba(233,10,167,.7))` : 'none';
      P.ast.textContent = t < g0 ? p.feed.ok : inG ? p.feed.err : p.feed.dead;
      P.ast.style.opacity = dead && Math.floor(t / 0.3) % 2 ? 0.35 : 1;
      // static noise over the feed panel
      const ctx = P.cv.getContext('2d');
      const na = inG ? 0.55 : dead ? 0.14 : 0;
      P.cv.style.opacity = na;
      if (na) {
        const img = ctx.createImageData(120, 40);
        for (let i = 0; i < 120 * 40; i++) {
          const v = hash(i * 0.731 + fr * 13.37) > 0.5 ? 200 : 20;
          img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
          img.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }
      fx.scan = inG ? 0.35 + hash(fr * 2.3) * 0.5 : 0;
      // list: steady the whole time, lights up on the punch
      const v = t - tp;
      const lit = v >= 0;
      P.lamp.style.background = lit ? 'var(--cyan)' : 'rgba(34,195,236,.25)';
      P.lamp.style.boxShadow = lit ? `0 0 ${14 + 8 * Math.sin(TAU * 3 * v)}px 4px rgba(34,195,236,.7)` : 'none';
      P.bb.forEach((b, i) => {
        const wave = lit ? clamp(1 - Math.abs(i - v * 60) / 3) : 0;
        b.style.background = wave > 0 ? `color-mix(in srgb, var(--cyan), #ffffff ${Math.round(wave * 70)}%)` : 'var(--cyan)';
      });
      P.b.style.setProperty('--fc', lit ? 'var(--cyan)' : 'rgba(34,195,236,.75)');
    },
  };

  // "ITEM GET!" pickup that turns into a cursed item: chains and a padlock on the money.
  PROPS.item = {
    build(st, p) {
      const box = el('div', 'itembox');
      const chip = el('div', 'px chip gold', esc(p.chip));
      const f = frame('gold', '');
      const art = el('div', 'art');
      const bob = el('div', 'bob');
      const bag = sprite('moneybag', 17);
      bag.classList.add('bag');
      bob.appendChild(bag);
      const sparks = [[40, 30], [340, 10], [20, 190], [370, 170], [350, 240], [50, 110]].map(([x, y], i) => {
        const s = sprite('sparkle', i % 2 ? 6 : 8);
        s.classList.add('spark');
        s.style.left = x + 'px'; s.style.top = y + 'px';
        art.appendChild(s);
        return s;
      });
      const chains = [80, 160].map((y) => {
        const c = el('div', 'chain');
        c.style.top = y + 'px';
        let h = '';
        for (let i = 0; i < 9; i++) h += sprite('chain', 6).outerHTML;
        c.innerHTML = `<div style="display:flex">${h}</div>`;
        bob.appendChild(c);
        return c;
      });
      const lock = sprite('lock', 10);
      lock.classList.add('lock');
      bob.appendChild(lock);
      art.appendChild(bob);
      const fine = el('div', 'fine', esc(p.fine || ''));
      f.firstChild.append(art, makeSetup(S.setup.text), fine);
      box.append(chip, f);
      st.appendChild(box);
      E.p = { chip, f, bob, sparks, chains, lock, fine };
    },
    render(t, tp) {
      const P = E.p, p = S.prop;
      const v = t - tp;
      const cursed = v >= 0;
      P.chip.textContent = cursed ? p.chipAfter : p.chip;
      P.chip.className = 'px chip ' + (cursed ? '' : 'gold');
      P.f.className = 'frame ' + (cursed ? 'mag' : 'gold');
      P.bob.style.transform = `translateY(${snap(Math.sin((TAU * cycles(0.6) * t) / D) * 8, 4)}px)`;
      P.sparks.forEach((s, i) => {
        const on = Math.sin((TAU * cycles(0.4 + 0.2 * (i % 3)) * t) / D + i * 1.7) > -0.2;
        const fade = cursed ? 1 - seg(v, 0, 0.15) : 1;
        s.style.opacity = on ? fade : 0;
      });
      P.chains.forEach((c, i) => {
        const w = seg(v, i * 0.06, i * 0.06 + 0.16);
        const from = i ? 640 : -640;
        c.style.opacity = v >= i * 0.06 ? 1 : 0;
        c.firstChild.style.transform = `translateX(${snap(lerp(from, 0, eOut(w)), 4)}px)`;
      });
      const lw = seg(v, 0.14, 0.32);
      let ly = lerp(-240, 0, eIn(clamp(lw / 0.75)));
      if (lw > 0.75) ly = -18 * Math.sin(Math.PI * seg(lw, 0.75, 1));
      P.lock.style.opacity = v >= 0.14 ? 1 : 0;
      P.lock.style.transform = `translateY(${snap(ly, 4)}px)`;
      P.fine.style.opacity = seg(v, 0.45, 0.65) * 0.9;
    },
  };

  // ---------- punchline ----------
  function buildPunch(st) {
    const wrap = el('div', 'punch-wrap');
    if (S.punch.label) {
      E.label = el('div', 'px chip punch-label', esc(S.punch.label));
      wrap.appendChild(E.label);
    }
    const p = el('div', 'punch', rich(S.punch.text));
    if (S.punch.size) p.style.fontSize = S.punch.size + 'px';
    wrap.appendChild(p);
    st.appendChild(wrap);
    E.punchWrap = wrap;
    E.punch = p;
  }

  function punchTime() {
    return S.punch.label ? T.punch + T.labelLead : T.punch;
  }

  function renderPunch(t) {
    const tp = punchTime();
    let shake = 0, flash = 0;
    if (E.label) {
      const v = t - T.punch;
      E.label.style.visibility = v >= 0 ? 'visible' : 'hidden';
      const s = v < 0 ? 1 : v < 0.06 ? lerp(1.5, 0.95, v / 0.06) : lerp(0.95, 1, eOut(seg(v, 0.06, 0.16)));
      E.label.style.transform = `scale(${s})`;
      if (v >= 0) shake = Math.max(shake, 6 * (1 - seg(v, 0, 0.15)));
    }
    const u = t - tp;
    if (u < 0) {
      E.punch.style.visibility = 'hidden';
      E.punch.style.transform = '';
    } else {
      E.punch.style.visibility = 'visible';
      const s = u < 0.07 ? lerp(1.55, 0.95, eIn(u / 0.07)) : lerp(0.95, 1, eOut(seg(u, 0.07, 0.2)));
      E.punch.style.transform = `scale(${s})`;
      E.punch.style.transformOrigin = '0 50%';
      const split = 14 * (1 - eOut(seg(u, 0, 0.3)));
      E.punch.style.textShadow = split > 0.4
        ? `${-split}px 0 0 rgba(34,195,236,.85), ${split}px 0 0 rgba(233,10,167,.85), 5px 5px 0 rgba(233,10,167,.55)`
        : '';
      flash = 0.5 * (1 - seg(u, 0, 0.12));
      shake = Math.max(shake, 18 * (1 - eOut(seg(u, 0, 0.35))));
    }
    fx.shake = shake;
    fx.flash = flash;
    return tp;
  }

  // ---------- CRT on/off (makes the loop seamless) ----------
  function renderCRT(t) {
    const a = T.off, b = a + 0.22, c = b + 0.1;
    let sx = 1, sy = 1, glow = 0;
    if (t < 0.06) { sx = lerp(0.02, 1, eOut(seg(t, 0, 0.06))); sy = 0; }
    else if (t < T.on) { sy = lerp(0.006, 1, eOut(seg(t, 0.06, T.on))); glow = 1 - seg(t, 0.06, T.on); }
    else if (t >= c) { sx = 0.02; sy = 0; }
    else if (t >= b) { sx = lerp(1, 0.02, eIn(seg(t, b, c))); sy = 0; }
    else if (t >= a) { sy = lerp(1, 0.006, eIn(seg(t, a, b))); glow = seg(t, a, b); }
    const fr = Math.round(t * FPS);
    const kx = fx.shake ? (hash(fr * 1.3) - 0.5) * 2 * fx.shake : 0;
    const ky = fx.shake ? (hash(fr * 2.9 + 4) - 0.5) * 2 * fx.shake : 0;
    if (sy < 0.02) {
      E.fg.style.opacity = 0;
      E.crt.style.display = 'block';
      E.crt.style.width = Math.max(14, 920 * sx) + 'px';
    } else {
      E.fg.style.opacity = 1;
      E.crt.style.display = 'none';
      E.fg.style.transform = `translate(${snap(kx)}px, ${snap(ky)}px) scale(1, ${sy})`;
      E.fg.style.filter = glow > 0.01 ? `brightness(${1 + 2.2 * glow})` : 'none';
    }
  }

  // ---------- background: stars, pixel drift, glow pulse, scanlines ----------
  function initBg() {
    let s = (S.seed || 7) >>> 0;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const pick = () => { const x = r(); return x < 0.12 ? COLORS.cyan : x < 0.22 ? COLORS.mag : COLORS.bone; };
    stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({ x: r() * 1080, y: r() * 1350, s: [2, 4, 4, 6][Math.floor(r() * 4)], c: pick(), a: 0.2 + r() * 0.5, k: 1 + Math.floor(r() * 3), ph: r() * TAU });
    }
    motes = [];
    const ang = ((S.background && S.background.driftAngle) ?? -100) * Math.PI / 180;
    for (let i = 0; i < 46; i++) {
      motes.push({ x: r() * 1080, y: r() * 1350, len: 90 + r() * 170, ang: ang + (r() - 0.5) * 0.5, s: r() < 0.7 ? 4 : 6, c: pick(), a: 0.35 + r() * 0.45, ph: r(), m: r() < 0.5 ? 1 : 2 });
    }
  }

  function drawBg(t) {
    const B = S.background || {};
    const c = bgctx;
    c.fillStyle = '#060018';
    c.fillRect(0, 0, 1080, 1350);
    const pulse = B.pulse ?? 0.4;
    const pc = B.pulseCycles || cycles(0.4);
    const ph = 0.5 + 0.5 * Math.sin((TAU * pc * t) / D);
    // floor glow, as on the carousels
    const g = c.createLinearGradient(0, 1350, 0, 830);
    g.addColorStop(0, `rgba(90,20,140,${0.3 + pulse * 0.25 * ph})`);
    g.addColorStop(1, 'rgba(90,20,140,0)');
    c.fillStyle = g;
    c.fillRect(0, 830, 1080, 520);
    // glow behind the stage
    const rg = c.createRadialGradient(540, B.glowY || 640, 20, 540, B.glowY || 640, 620);
    rg.addColorStop(0, `rgba(233,10,167,${0.05 + pulse * 0.12 * ph})`);
    rg.addColorStop(0.55, `rgba(34,195,236,${0.02 + pulse * 0.04 * (1 - ph)})`);
    rg.addColorStop(1, 'rgba(6,0,24,0)');
    c.fillStyle = rg;
    c.fillRect(0, 0, 1080, 1350);
    // twinkling stars
    for (const st of stars) {
      c.globalAlpha = st.a * (0.55 + 0.45 * Math.sin((TAU * st.k * t) / D + st.ph));
      c.fillStyle = st.c;
      c.fillRect(snap(st.x), snap(st.y), st.s, st.s);
    }
    // pixel drift: motes travel a short path and fade, completing whole cycles per loop
    const drift = B.drift ?? 1;
    for (const m of motes) {
      const p = frac((t / D) * m.m + m.ph);
      const x = ((m.x + Math.cos(m.ang) * m.len * p) % 1080 + 1080) % 1080;
      const y = ((m.y + Math.sin(m.ang) * m.len * p) % 1350 + 1350) % 1350;
      c.globalAlpha = Math.sin(Math.PI * p) * m.a * drift;
      c.fillStyle = m.c;
      c.fillRect(snap(x, 4), snap(y, 4), m.s, m.s);
    }
    c.globalAlpha = 1;
    // overlays
    const roll = B.roll ?? 1;
    const ry = -240 + frac((t / D) * (B.rollCycles || cycles(0.2))) * (1350 + 240);
    E.roll.style.transform = `translateY(${ry}px)`;
    E.roll.style.opacity = roll;
    E.scan.style.opacity = clamp((B.scan ?? 0.6) + fx.scan);
    E.flash.style.opacity = fx.flash;
  }

  // ---------- layout QA ----------
  function checkLayout() {
    const out = [];
    const safe = { l: 80, r: 1000, t: 150, b: 1200 };
    const st = $('#stage');
    let u = null;
    st.querySelectorAll('*').forEach((e) => {
      const r = e.getBoundingClientRect();
      if (!r.width || e.closest('.chain') || e.classList.contains('coin')) return;
      u = u ? { l: Math.min(u.l, r.left), r: Math.max(u.r, r.right), t: Math.min(u.t, r.top), b: Math.max(u.b, r.bottom) } : { l: r.left, r: r.right, t: r.top, b: r.bottom };
    });
    if (u && (u.l < safe.l - 8 || u.r > safe.r + 8 || u.t < safe.t || u.b > safe.b)) {
      out.push(`content box ${Math.round(u.l)},${Math.round(u.t)} to ${Math.round(u.r)},${Math.round(u.b)} leaves the safe area ${safe.l},${safe.t} to ${safe.r},${safe.b}`);
    }
    const lines = (node) => Math.round(node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight));
    const want = S.punch.text.split('\n').length;
    const got = lines(E.punch);
    if (got !== want) out.push(`punchline wraps to ${got} lines, expected ${want}: shorten a line or set punch.size`);
    const sl = lines(E.setup.box);
    if (sl > 3) out.push(`setup runs ${sl} lines (max 3)`);
    return { warnings: out, box: u };
  }

  // ---------- public API ----------
  window.build = function (spec) {
    S = spec;
    D = spec.duration || 9;
    FPS = spec.fps || 30;
    // Typing speed follows the setup length; the beat after it leaves time to read the setup,
    // and the punchline then holds until the CRT wipe at the end of the loop.
    const nChars = spec.setup.text.replace(/[*\n]/g, '').length;
    const typeStart = 0.25;
    const typeEnd = typeStart + clamp(nChars / 26, 0.8, 1.8);
    T = Object.assign({ on: 0.2, typeStart, typeEnd, punch: typeEnd + 1.3, labelLead: 0.2, off: D - 0.45 }, spec.timing || {});
    document.documentElement.style.setProperty('--accent', COLORS[spec.punch.accent || 'gold'] || spec.punch.accent);
    E.fg = $('#fg'); E.crt = $('#crt'); E.roll = $('#roll'); E.scan = $('.scan'); E.flash = $('#flash');
    bgctx = $('#bg').getContext('2d');
    const st = $('#stage');
    st.innerHTML = '';
    if (spec.layout && spec.layout.gap != null) st.style.gap = spec.layout.gap + 'px';
    prop = PROPS[spec.prop.type];
    if (!prop) throw new Error('unknown prop type ' + spec.prop.type);
    prop.build(st, spec.prop);
    buildPunch(st);
    initBg();
    // measure with everything visible and untransformed
    E.punch.style.visibility = 'visible';
    const res = checkLayout();
    // Where the video file starts in the loop. Default: the full meme on screen with every
    // effect settled, so frame 0 (the feed preview) shows the joke instead of the CRT dot.
    res.start = spec.start != null ? spec.start : Math.min(T.punch + 2, T.off - 0.6);
    return res;
  };

  window.renderAt = function (t) {
    t = ((t % D) + D) % D;
    fx.scan = 0;
    renderSetup(t);
    const tp = renderPunch(t);
    prop.render(t, tp);
    renderCRT(t);
    drawBg(t);
  };
})();
