/* ============================================================
   views/defences.js — the picture of station 2: the five body defences of 10.1.4, one at a time.

   A row of five buttons, in the syllabus's order: skin, hairs in the nose, mucus, stomach acid, white blood cells (and
   "Next defence"). Each shows where the defence is and what it does to a pathogen, in a short motion that repeats:
   bacteria stop on unbroken skin and on a clot; dust and bacteria in the air stop in the hairs of the nose; mucus traps
   them in the airways; bacteria in swallowed food are killed in the stomach (they turn grey); a phagocyte and a
   lymphocyte. Pressing a button opens its card on the right; opening a card shows its defence. Names stand on ruled
   level lines that end ON the part (memory label-lines-never-cross).

   The drawings are Servier Medical Art (CC BY 4.0, adapted): skin blocks from its Blood & Immunology kit, the head in
   section and the stomach from its Digestive system kit, the cells from js/imm-art.js. The airways are a real
   electron micrograph (its credit with it). The hairs in the nostril are drawn for this lab, in the drawing's own line.
   With reduced motion each defence shows its last frame, still.
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function n1(v) { return Math.round(v * 10) / 10; }
  function still() { return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function pathogenSmall(x, y, s, rot, cls) {
    var D = global.ImmDraw; return D ? D.pathogen({ x: x, y: y, s: s, rot: rot, kind: 'tri', n: 0, cls: cls }).svg : '';
  }
  var DUR = 6;   /* one cycle of each motion, in seconds */
  /* the longest line of a name once it wraps at about n letters, never inside a word (as CircLearn.labels wraps it) */
  function lineMax(text, n) {
    var best = 0, cur = '';
    String(text).split(' ').forEach(function (w) { var tr = cur ? cur + ' ' + w : w; if (tr.length > n && cur) { best = Math.max(best, cur.length); cur = w; } else cur = tr; });
    return Math.max(best, cur.length);
  }

  /* each defence: its drawing (w × h, its own units), what moves at time u (0–1 of a cycle), and its names */
  var TABS = {
    skin: { name: 'Skin', w: 470, h: 300, say: 'Skin: pathogens cannot pass through unbroken skin, and a clot seals a cut',
      credit: 'Servier Medical Art, CC BY 4.0, adapted',
      art: function (u) {
        var out = '<image href="assets/photos/sv-skin.svg" x="10" y="8" width="220" height="288"/>' +
                  '<image href="assets/photos/sv-skin-clot.svg" x="245" y="8" width="220" height="288"/>' +
                  '<text class="dv__head" x="120" y="24" text-anchor="middle">unbroken skin</text><text class="dv__head" x="355" y="24" text-anchor="middle">a cut, sealed by a clot</text>';
        [[70, 132, 0], [128, 116, .3], [176, 124, .6], [300, 118, .15], [360, 104, .45], [408, 122, .75]].forEach(function (b, i) {
          var k = (u + b[2]) % 1, drop = k < .4 ? (1 - k / .4) : 0;
          out += pathogenSmall(b[0], b[1] - 60 * drop * drop, .14, i * 40, 'dv__bac');
        });
        return out;
      },
      pts: { skin: [200, 170, 'L'], bac: [128, 116, 'L'], clot: [356, 150, 'R'] },
      names: { skin: 'skin', bac: 'bacteria stay outside', clot: 'blood clot' } },
    nose: { name: 'Hairs in the nose', w: 360, h: 300, say: 'Hairs in the nose trap dust and pathogens in the air you breathe in',
      credit: 'Servier Medical Art, CC BY 4.0, adapted; the hairs drawn for this lab',
      art: function (u) {
        var out = '<image href="assets/photos/sv-head.svg" x="0" y="-40" width="337" height="343"/>';
        /* hairs at the entrance of the nostril */
        var hair = [[44, 222, 54, 210], [50, 226, 62, 214], [57, 229, 69, 219], [64, 231, 76, 224], [47, 218, 58, 205]];
        out += hair.map(function (q) { return '<path class="dv__hair" d="M' + q[0] + ' ' + q[1] + ' Q' + n1((q[0] + q[2]) / 2 + 3) + ' ' + n1((q[1] + q[3]) / 2 - 1) + ' ' + q[2] + ' ' + q[3] + '"/>'; }).join('');
        /* dust and bacteria in the air, carried in and caught on the hairs */
        [[0, 0], [.33, 6], [.66, -5]].forEach(function (p, i) {
          var k = (u + p[0]) % 1, m = Math.min(1, k / .55);
          var x = -30 + (58 + p[1] - -30) * m, y = 250 - (250 - (216 + p[1])) * m;
          out += '<circle class="dv__dust" cx="' + n1(x) + '" cy="' + n1(y) + '" r="3.6"/>' + pathogenSmall(x + 9, y + 7, .07, 30 * i, 'dv__bac');
        });
        return out;
      },
      pts: { hair: [60, 218, 'L'], dust: [20, 236, 'L'] },
      names: { hair: 'hairs in the nose', dust: 'dust and pathogens, trapped' } },
    mucus: { name: 'Mucus', w: 0, h: 0, photo: true },
    acid: { name: 'Stomach acid', w: 300, h: 260, say: 'Hydrochloric acid in the stomach kills pathogens in food and drink',
      credit: 'Servier Medical Art, CC BY 4.0, adapted',
      art: function (u) {
        var out = '<image href="assets/photos/sv-stomach.svg" x="30" y="8" width="233" height="250"/>';
        [[0, 0], [.25, 14], [.5, -10], [.75, 6]].forEach(function (p, i) {
          var k = (u + p[0]) % 1, m = Math.min(1, k / .45), dead = Math.max(0, Math.min(1, (k - .5) / .25));
          var x = 152 + p[1] * m - 28 * (1 - m), y = 6 + (150 + p[1] * .6 - 6) * m;
          out += '<g style="filter:grayscale(' + n1(dead * 100) / 100 + ')" opacity="' + n1((1 - Math.max(0, k - .85) / .15) * 100) / 100 + '">' + pathogenSmall(x, y, .11, 60 * i, 'dv__bac') + '</g>';
        });
        return out;
      },
      pts: { stomach: [232, 112, 'R'], bac: [158, 150, 'R'] },
      names: { stomach: 'stomach: hydrochloric acid', bac: 'bacteria in food, killed' } },
    wbc: { name: 'White blood cells', w: 420, h: 240, say: 'Phagocytes engulf and digest pathogens; lymphocytes make antibodies',
      credit: 'Servier Medical Art, CC BY 4.0, adapted',
      art: function (u) {
        var D = global.ImmDraw; if (!D) return '';
        var out = D.cell('neutrophil', 110, 120, .62) + D.pathogen({ x: 180 - 20 * Math.sin(u * 6.283), y: 52, s: .16, rot: 20, kind: 'tri', n: 7 }).svg +
                  D.cell('lymphocyte', 310, 120, .6);
        [0, .33, .66].forEach(function (p, i) {
          var k = (u + p) % 1;
          out += D.antibody({ x: 350 + 60 * k, y: 120 - 60 * k + i * 30 * k, rot: 40 + 50 * k, s: .62, kind: 'tri', op: Math.min(1, k * 4) * (1 - Math.max(0, k - .8) * 5) });
        });
        return out;
      },
      pts: { pha: [70, 120, 'L'], lym: [350, 92, 'R'], ab: [380, 70, 'R'] },
      names: { pha: 'phagocyte: engulfs and digests', lym: 'lymphocyte: makes antibodies', ab: 'antibody' } }
  };
  var ORDER = ['skin', 'nose', 'mucus', 'acid', 'wbc'];

  function make(spec, ctx) {
    var root = h('div', 'dfv');
    var bar = h('div', 'vbar dfv__bar'); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'The five body defences');
    var stage = h('div', 'dfv__stage');
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'dfv__svg'); svg.setAttribute('role', 'img');
    var gArt = document.createElementNS(NS, 'g'), gLab = document.createElementNS(NS, 'g');
    svg.appendChild(gArt); svg.appendChild(gLab); stage.appendChild(svg);
    var ph = h('figure', 'dfv__photo'); ph.hidden = true; stage.appendChild(ph);
    var key = h('ol', 'pinkey'); key.hidden = true;
    var next = h('button', 'dfv__next', 'Next defence →'); next.type = 'button';
    root.appendChild(bar); root.appendChild(stage); root.appendChild(key); root.appendChild(next);
    var cur = 'skin', raf = null, t0 = 0, font = 14, mL = 100, mR = 100, narrow = false;
    var btn = {};
    ORDER.forEach(function (id, i) {
      var b = h('button', 'dfv__tab', '<span class="dfv__n">' + (i + 1) + '</span> ' + TABS[id].name); b.type = 'button';
      b.addEventListener('click', function () { show(id); ctx.pick(id, { stay: true }); });
      bar.appendChild(b); btn[id] = b;
    });
    next.addEventListener('click', function () { var i = (ORDER.indexOf(cur) + 1) % ORDER.length; show(ORDER[i]); ctx.pick(ORDER[i], { stay: true }); });

    /* the mucus: a real photograph of the airway lining (spec.mucus, from the master) */
    function photoTab() {
      var m = spec.mucus || {}, base = 'assets/photos/' + (m.img || '');
      ph.innerHTML = '<div class="dfv__pwrap"><img src="' + base + '-900.jpg" alt="' + (m.alt || '') + '" decoding="async"></div>' +
        (m.labels || []).map(function (l) { return '<span class="dfv__plab" style="left:' + l[0] + '%;top:' + l[1] + '%">' + l[2] + '</span>'; }).join('');
    }
    function fit() {
      var T = TABS[cur]; if (T.photo) return;
      var r = stage.getBoundingClientRect(); if (!r.width) return;
      var names = Object.keys(T.pts).map(function (p) { return T.names[p]; });
      var wl = 0, wr = 0;
      Object.keys(T.pts).forEach(function (p) { var w = lineMax(T.names[p], 12); if (T.pts[p][2] === 'L') wl = Math.max(wl, w); else wr = Math.max(wr, w); });
      var f = 14, sc = 1;
      narrow = r.width < 440;
      for (var i = 0; i < 4; i++) {
        if (narrow) { mL = wl ? f * 1.44 + 14 : 8; mR = wr ? f * 1.44 + 14 : 8; }
        else { mL = wl ? f * .58 * wl + 34 : 8; mR = wr ? f * .58 * wr + 34 : 8; }
        sc = Math.min(r.width / (T.w + mL + mR), (r.height || 9999) / (T.h + 10));
        f = Math.max(11, 14.5 / sc);
      }
      font = f;
      svg.setAttribute('viewBox', n1(-mL) + ' -4 ' + n1(T.w + mL + mR) + ' ' + n1(T.h + 10));
    }
    function frame(u) {
      var T = TABS[cur]; if (T.photo) { key.hidden = true; return; }
      gArt.innerHTML = T.art(u);
      /* the headings over a drawing: the labels' size on screen, and the page's ink in bright and dark */
      Array.prototype.forEach.call(gArt.querySelectorAll('.dv__head'), function (t) { t.style.fontSize = (font * .92).toFixed(1) + 'px'; });
      var items = Object.keys(T.pts).map(function (p) { var q = T.pts[p]; return { id: p, text: T.names[p], x: q[0], y: q[1], side: q[2] }; });
      if (narrow) {
        var P = global.CircLearn.pinLabels({ items: items, left: -6, right: T.w + 6, font: font, top: 0, bottom: T.h, gap: 4 });
        gLab.innerHTML = P.svg;
        key.hidden = false; key.innerHTML = P.order.map(function (o) { return '<li><b>' + o.n + '</b> ' + o.text + '</li>'; }).join('');
      } else {
        key.hidden = true;
        gLab.innerHTML = global.CircLearn.labels({ items: items, left: -6, right: T.w + 6, font: font, top: 0, bottom: T.h, gap: font * .3, width: font * .56 * 11.5 });
      }
    }
    function loop(ts) {
      if (!t0) t0 = ts;
      frame(((ts - t0) / 1000 / DUR) % 1);
      raf = requestAnimationFrame(loop);
    }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; t0 = 0; }
    function start() { stop(); if (TABS[cur].photo) return; if (still()) { frame(.999); return; } raf = requestAnimationFrame(loop); }
    function show(id) {
      cur = id;
      ORDER.forEach(function (k) { btn[k].setAttribute('aria-pressed', k === id ? 'true' : 'false'); });
      var T = TABS[id];
      svg.style.display = T.photo ? 'none' : ''; ph.hidden = !T.photo;
      if (T.photo) photoTab();
      fit(); frame(.999); start();
      svg.setAttribute('aria-label', T.say || T.name);
      api.say = T.photo ? (spec.mucus || {}).say : T.say; api.credit = T.photo ? (spec.mucus || {}).credit : T.credit;
      ctx.caption();
    }
    if (global.ResizeObserver) new global.ResizeObserver(function () { fit(); frame(.999); }).observe(stage);
    var api = {
      el: root, say: '', credit: '',
      labels: { skin: 'skin', nose: 'hairs in the nose', mucus: 'mucus', acid: 'stomach acid', wbc: 'white blood cells' },
      focus: function (part) { if (part && TABS[part]) show(part); },
      start: function () { start(); },
      stop: stop,
      __seek: function (u) { stop(); frame(u); }
    };
    show('skin'); stop();
    return api;
  }
  global.Views.add('defences', make);
})(window);
