/* ============================================================
   views/defences.js — the picture of station 2: the five body defences of 10.1.4, one at a time.

   A row of five buttons, in the syllabus's order: skin, hairs in the nose, mucus, stomach acid, white blood cells (and
   "Next defence"). Each shows where the defence is and what it does to a pathogen, in a short motion that repeats:
   bacteria stop on unbroken skin and on a clot; dust and bacteria in the air stop in the hairs of the nose; mucus traps
   them in the airways; bacteria in swallowed food are killed in the stomach (they turn grey); a phagocyte and a
   lymphocyte. Pressing a button opens its card on the right; opening a card shows its defence. Names stand on ruled
   level lines that end ON the part (memory label-lines-never-cross).

   The drawings are Servier Medical Art (CC BY 4.0, adapted): skin blocks from its Blood & Immunology kit, the stomach from
   its Digestive system kit, the cells from js/imm-art.js. The hairs in the nose and the airways are real photographs (their
   credits with them): the nostril close up, because in a drawing of the whole head no hair can be seen (4 Nov 2026).
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
        /* the first bacterium lies still on the skin, and its name points at it; the others fall and stop on the skin or
           the clot (Daniel, 4 Nov 2026: a name that stays while its bacterium falls points at nothing) */
        /* each comes to rest ON the skin's top surface or the clot, never on the cut face of the block, where it would look
           as if it were inside the skin */
        [[70, 100, 0, 1], [125, 78, .3], [168, 98, .6], [300, 118, .15], [360, 104, .45], [338, 70, .75]].forEach(function (b, i) {
          var k = (u + b[2]) % 1, drop = b[3] ? 0 : k < .4 ? (1 - k / .4) : 0;
          var fall = Math.min(60, b[1] - 42);   /* it starts below the two headings, never over their words */
          out += pathogenSmall(b[0], b[1] - fall * drop * drop, .14, i * 40, 'dv__bac');
        });
        return out;
      },
      /* short lines: each pin near the edge its name stands at. The clot is drawn as the 0610 student learns it (9.4, and the
         Circulation Lab's Clotting): fibrin threads in a mesh that traps red blood cells, platelets at the cut (pieces.py
         fibrin_mesh; the kit's unnamed purple cells are left out). Each pin was placed on its part in a 4x render. */
      pts: { bac: [70, 100, 'L'], skin: [40, 175, 'L'], clot: [395, 84, 'R'], fib: [371, 121, 'R'], rbc: [358, 160, 'R'], plt: [365, 211, 'R'] },
      names: { bac: 'bacteria stay outside', skin: 'skin', clot: 'blood clot', fib: 'fibrin mesh', rbc: 'trapped red blood cells', plt: 'platelets' } },
    /* the nostril close up (Daniel, 4 Nov 2026: "you're pointing at the teeth … you could be taking a close up image of the
       nose"): a real photograph of the hairs in a nostril; dust and bacteria come in on the air breathed in and stop on the
       hairs. One of each lies there still, and its name points at it. Each pin was placed on its part in a gridded render. */
    nose: { name: 'Hairs in the nose', w: 360, h: 240, say: 'Hairs in the nose trap dust and pathogens in the air you breathe in',
      credit: 'Photograph: Thomy pc, Wikimedia Commons, public domain; the dust and bacteria drawn far larger than real',
      art: function (u) {
        var out = '<image href="assets/photos/nose-hairs-900.jpg" x="0" y="0" width="360" height="240" preserveAspectRatio="xMidYMid slice"/>';
        /* the air breathed in: into the nostril from below */
        out += '<path class="dv__air" d="M16 236 Q62 214 116 162"/><path class="dv__airh" d="M124 154 L104 160 L116 172 Z"/>';
        function speck(x, y, i) {
          return '<circle class="dv__dust" cx="' + n1(x) + '" cy="' + n1(y) + '" r="4.6"/>' + pathogenSmall(x + 10, y + 7, .1, 40 * i, 'dv__bac');
        }
        [[230, 186, 0], [160, 150, .33], [206, 112, .66]].forEach(function (t, i) {
          var k = (u + t[2]) % 1, m = Math.min(1, k / .42), e = 1 - (1 - m) * (1 - m);
          var x = 22 + (t[0] - 22) * e, y = 234 + (t[1] - 234) * e, op = k > .9 ? 1 - (k - .9) / .1 : 1;
          out += '<g opacity="' + n1(op * 100) / 100 + '">' + speck(x, y, i + 1) + '</g>';
        });
        return out + speck(128, 118, 0);
      },
      /* every name on the left, so the photograph can be as large as the column allows */
      pts: { hair: [150, 68, 'L'], trap: [128, 118, 'L'], air: [58, 214, 'L'] },
      names: { trap: 'dust and pathogens, trapped', air: 'air breathed in', hair: 'hairs in the nose' } },
    /* the mucus, step by step (Daniel, 4 Nov 2026: "you show the cilia, great, but where's the mucus? Show an animation"):
       the lining of an airway, Servier's ciliated cells with their cilia apart so they beat, and two Servier goblet cells set
       among them; the mucus layer is drawn for the lab, in the colour of the goblet cells' own mucus. Each step waits for
       "Next step". The real cilia are one press away (the electron micrograph, spec.mucus). */
    mucus: { name: 'Mucus', w: 420, h: 254, say: 'Mucus traps pathogens in the airways; cilia move it away from the lungs, to the throat',
      credit: 'Servier Medical Art (Tissues kit), CC BY 4.0, adapted; the mucus layer drawn for this lab',
      steps: [
        { say: 'Goblet cells in the lining of the airways make mucus.',
          pts: { gob: [148, 142, 'L'], cil: [60, 76, 'L'], cc: [250, 170, 'R'] },
          names: { gob: 'goblet cell: makes mucus', cil: 'cilia', cc: 'ciliated cell' } },
        { say: 'The mucus spreads over the cilia as a sticky layer.',
          pts: { muc: [100, 62, 'L'], cil: [360, 82, 'R'], gob: [148, 142, 'L'] },
          names: { muc: 'mucus', cil: 'cilia', gob: 'goblet cell' } },
        { say: 'Pathogens and dust in the air you breathe in stick to the mucus: they are trapped.',
          pts: { trap: [360, 48, 'R'], muc: [100, 62, 'L'] },
          names: { trap: 'pathogens and dust, trapped', muc: 'mucus' } },
        { say: 'The cilia beat. They move the mucus, and what it has trapped, towards the throat, away from the lungs.', ms: 4000,
          pts: { cil: [60, 80, 'L'], arr: [352, 16, 'R'] },
          names: { cil: 'cilia beat', arr: 'mucus moves towards the throat' } },
        { say: 'At the throat the mucus is swallowed. In the stomach, the acid kills the pathogens (see Stomach acid).', ms: 4000,
          pts: { arr: [404, 16, 'R'] },
          names: { arr: 'to the throat: swallowed' } }
      ],
      art: function (u, st, p) {
        var A = global.IMM_ART || {}, K = 1.3, X0 = 8, Y0 = 96, GX = [148.4, 297.9], R = X0 + 311 * K;
        function g(name, tf) { return A[name] ? '<g transform="' + tf + '">' + A[name].svg + '</g>' : ''; }
        /* the cilia beat all the time, as real cilia do: a quick stroke towards the throat, a slow return */
        var ph = still() ? 0 : (u * 6) % 1, ang = ph < .3 ? -14 + 28 * (ph / .3) : 14 - 28 * ((ph - .3) / .7);
        var base = Y0 + 18 * K, lin = 'translate(' + X0 + ' ' + Y0 + ') scale(' + K + ')';
        var beat = 'translate(0 ' + n1(base) + ') skewX(' + n1(ang) + ') translate(0 ' + n1(-base) + ')';
        /* no cilia over the goblet cells */
        var cl = '<clipPath id="dvCil"><rect x="0" y="0" width="' + n1(GX[0] - 27) + '" height="300"/><rect x="' + n1(GX[0] + 27) + '" y="0" width="' + n1(GX[1] - GX[0] - 54) + '" height="300"/><rect x="' + n1(GX[1] + 27) + '" y="0" width="200" height="300"/></clipPath>';
        var out = '<defs>' + cl + '<clipPath id="dvLin"><rect x="0" y="0" width="' + n1(R + 4) + '" height="300"/></clipPath></defs><g clip-path="url(#dvLin)">';
        out += '<g clip-path="url(#dvCil)"><g transform="' + beat + '">' + g('airway-ciliaback', lin) + '</g></g>';
        out += g('airway-cells', lin);
        GX.forEach(function (x) { out += g('goblet', 'translate(' + n1(x - 50.6 * 1.04 / 2) + ' ' + n1(Y0 + 16 * K) + ') scale(1.04 1.885)'); });
        out += '<g clip-path="url(#dvCil)"><g transform="' + beat + '">' + g('airway-cilia', lin) + '</g></g></g>';
        /* step 1: mucus leaves the goblet cells */
        if (st === 0) GX.forEach(function (x, i) {
          [0, .33, .66].forEach(function (o, j) {
            var k = Math.min(1, Math.max(0, p * 1.4 - o)), y = 122 - 30 * k;
            out += '<ellipse class="dv__mucdrop" cx="' + n1(x + (j - 1) * 5 * k) + '" cy="' + n1(y) + '" rx="' + n1(3 + 5 * k) + '" ry="' + n1(3 + 2 * k) + '" opacity="' + n1(Math.min(1, k * 3) * 100) / 100 + '"/>';
          });
        });
        /* steps 2 onwards: the layer of mucus, spreading from the goblet cells, then over all the cilia */
        if (st >= 1) {
          var r = st === 1 ? 20 + 180 * p : 400, top = 74, bot = 101;
          out += '<clipPath id="dvMuc"><rect x="' + n1(GX[0] - r) + '" y="0" width="' + n1(2 * r) + '" height="300"/><rect x="' + n1(GX[1] - r) + '" y="0" width="' + n1(2 * r) + '" height="300"/></clipPath>';
          var w = ''; for (var x = X0; x <= R; x += 20) w += (x === X0 ? 'M' : 'L') + x + ' ' + n1(top + 2 * Math.sin(x / 14)) + ' ';
          out += '<path class="dv__mucus" clip-path="url(#dvMuc)" d="' + w + 'L' + n1(R) + ' ' + bot + ' L' + X0 + ' ' + bot + ' Z"/>';
          /* what the mucus carries: lighter streaks in it, and later the trapped particles, move with it */
          var shift = st < 3 ? 0 : st === 3 ? 50 * p : 50 + 150 * p;
          for (var b = 0; b < 6; b++) {
            var bx = X0 + 30 + b * 68 + shift, op = bx > R - 10 ? 0 : 1;
            if (op) out += '<ellipse class="dv__mucstreak" clip-path="url(#dvMuc)" cx="' + n1(bx) + '" cy="' + n1(88 + (b % 2) * 5) + '" rx="16" ry="3"/>';
          }
          if (st >= 2) [[70, 0], [190, 1], [250, 0], [360, 1]].forEach(function (q, i) {
            var land = st === 2 ? Math.min(1, p * 1.25 - i * .08) : 1;
            if (land <= 0) return;
            var x = q[0] + shift, y = -20 + (78 - -20) * (1 - (1 - land) * (1 - land));
            if (x > R - 6) return;
            out += q[1] ? '<circle class="dv__dust" cx="' + n1(x) + '" cy="' + n1(y) + '" r="4.6"/>' : pathogenSmall(x, y - 2, .1, 30 * i, 'dv__bac');
          });
        }
        /* steps 4 and 5: the way to the throat */
        if (st >= 3) out += '<path class="dv__flow" d="M300 46 L398 46"/><path class="dv__flowh" d="M408 46 L396 40 L396 52 Z"/>';
        /* the whole picture 30 units higher: the space above the mucus is only for the falling dust and the arrow */
        return '<g transform="translate(0 -30)">' + out + '</g>';
      } },
    /* the acid is made by the lining and kills the bacteria in the stomach's contents, so the lining is named, not the outer
       wall (4 Nov 2026). Bacteria come down the oesophagus with food, turn grey as they die and fade; one dead bacterium
       lies still, and its name points at it. */
    acid: { name: 'Stomach acid', w: 300, h: 260, say: 'Hydrochloric acid in the stomach kills pathogens in food and drink',
      credit: 'Servier Medical Art, CC BY 4.0, adapted',
      art: function (u) {
        var out = '<image href="assets/photos/sv-stomach.svg" x="30" y="8" width="233" height="250"/>';
        [[176, 128, 0], [208, 150, .25], [166, 164, .5], [214, 118, .75]].forEach(function (p, i) {
          var k = (u + p[2]) % 1, m = Math.min(1, k / .45), dead = Math.max(0, Math.min(1, (k - .5) / .25)), x, y;
          if (m < .4) { x = 142 + (160 - 142) * (m / .4); y = 14 + (66 - 14) * (m / .4); }
          else { x = 160 + (p[0] - 160) * ((m - .4) / .6); y = 66 + (p[1] - 66) * ((m - .4) / .6); }
          out += '<g style="filter:grayscale(' + n1(dead * 100) / 100 + ')" opacity="' + n1((1 - Math.max(0, k - .85) / .15) * 100) / 100 + '">' + pathogenSmall(x, y, .11, 60 * i, 'dv__bac') + '</g>';
        });
        return out + '<g style="filter:grayscale(1)">' + pathogenSmall(195, 172, .11, 30, 'dv__bac') + '</g>';
      },
      /* every name on the right, away from the bacteria's way in, so the drawing can be larger */
      pts: { st: [240, 62, 'R'], lin: [222, 112, 'R'], bac: [195, 172, 'R'] },
      names: { st: 'stomach', lin: 'lining: makes hydrochloric acid', bac: 'bacteria in food: killed' } },
    /* larger cells (4 Nov 2026), and no name line through the antibodies: a pathogen comes to the phagocyte, goes in and
       fades as it is digested; the lymphocyte releases antibodies, and one that has left lies still beside it, with its name */
    wbc: { name: 'White blood cells', w: 440, h: 250, say: 'Phagocytes engulf and digest pathogens; lymphocytes make antibodies',
      credit: 'Servier Medical Art, CC BY 4.0, adapted',
      art: function (u) {
        var D = global.ImmDraw; if (!D) return '';
        var out = D.cell('neutrophil', 120, 138, .85) + D.cell('lymphocyte', 312, 138, .82);
        var k = u % 1, m = Math.min(1, k / .45), e = 1 - (1 - m) * (1 - m);
        var dig = Math.max(0, Math.min(1, (k - .5) / .35));
        out += '<g opacity="' + n1((1 - dig) * 100) / 100 + '">' + D.pathogen({ x: 200 + (124 - 200) * e, y: 34 + (134 - 34) * e, s: .16 - .06 * dig, rot: 20, kind: 'tri', n: 7 }).svg + '</g>';
        [0, .5].forEach(function (p) {
          var q = (u + p) % 1;
          out += D.antibody({ x: 352 + 50 * q, y: 112 - 14 * q, rot: 40 + 30 * q, s: .62, kind: 'tri', op: Math.min(1, q * 4) * (1 - Math.max(0, q - .7) / .3) });
        });
        return out + D.antibody({ x: 404, y: 52, rot: 70, s: .62, kind: 'tri', op: 1 });
      },
      pts: { pha: [62, 150, 'L'], ab: [404, 52, 'R'], lym: [372, 172, 'R'] },
      names: { pha: 'phagocyte: engulfs and digests', ab: 'antibody', lym: 'lymphocyte: makes antibodies' } }
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
    /* a defence told in steps (the mucus): each step waits for "Next step"; its sentence is the line under the picture */
    var sbar = h('div', 'dfv__stepbar'); sbar.hidden = true;
    var sCount = h('span', 'dfv__scount'), sNext = h('button', 'dfv__snext', 'Next step ▶'), sAgain = h('button', 'dfv__sagain', '↺ Start again'),
        sPhoto = h('button', 'dfv__sphoto', 'Photograph of real cilia');
    [sNext, sAgain, sPhoto].forEach(function (b) { b.type = 'button'; });
    sbar.appendChild(sCount); sbar.appendChild(sNext); sbar.appendChild(sAgain); sbar.appendChild(sPhoto);
    root.appendChild(bar); root.appendChild(stage); root.appendChild(key); root.appendChild(sbar); root.appendChild(next);
    var step = 0, stepT = 0, photoOn = false;
    var cur = 'skin', raf = null, t0 = 0, font = 14, mL = 100, mR = 100, narrow = false;
    function nowMs() { return (global.performance && performance.now) ? performance.now() : Date.now(); }
    function setStep(i) {
      var T = TABS[cur]; step = Math.max(0, Math.min(T.steps.length - 1, i)); stepT = nowMs();
      sCount.textContent = 'Step ' + (step + 1) + ' of ' + T.steps.length;
      var last = step === T.steps.length - 1;
      sNext.hidden = last; sAgain.hidden = !last && step === 0; sNext.classList.toggle('is-pulse', !last && step > 0);
      api.say = T.steps[step].say; ctx.caption(); frame(.999);
    }
    var btn = {};
    ORDER.forEach(function (id, i) {
      var b = h('button', 'dfv__tab', '<span class="dfv__n">' + (i + 1) + '</span> ' + TABS[id].name); b.type = 'button';
      b.addEventListener('click', function () { show(id); ctx.pick(id, { stay: true }); });
      bar.appendChild(b); btn[id] = b;
    });
    sNext.addEventListener('click', function () { setStep(step + 1); });
    sAgain.addEventListener('click', function () { setStep(0); });
    sPhoto.addEventListener('click', function () {
      photoOn = !photoOn; sPhoto.textContent = photoOn ? 'Back to the steps' : 'Photograph of real cilia';
      svg.style.display = photoOn ? 'none' : ''; ph.hidden = !photoOn; if (photoOn) photoTab();
      [sNext, sAgain, sCount].forEach(function (b) { b.style.visibility = photoOn ? 'hidden' : ''; });
      api.say = photoOn ? (spec.mucus || {}).say : TABS[cur].steps[step].say; api.credit = photoOn ? (spec.mucus || {}).credit : TABS[cur].credit; ctx.caption();
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
      var wl = 0, wr = 0;
      /* a defence in steps keeps one frame for all its steps: the margins of every step's names */
      (T.steps || [T]).forEach(function (S) {
        Object.keys(S.pts).forEach(function (p) { var w = lineMax(S.names[p], 12); if (S.pts[p][2] === 'L') wl = Math.max(wl, w); else wr = Math.max(wr, w); });
      });
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
      var T = TABS[cur]; if (T.photo || (T.steps && photoOn)) { key.hidden = true; return; }
      var S = T.steps ? T.steps[step] : T, sp = T.steps ? (still() ? 1 : Math.min(1, (nowMs() - stepT) / (S.ms || 2600))) : 0;
      gArt.innerHTML = T.art(u, step, sp);
      /* the headings over a drawing: the labels' size on screen, and the page's ink in bright and dark */
      Array.prototype.forEach.call(gArt.querySelectorAll('.dv__head'), function (t) { t.style.fontSize = (font * .92).toFixed(1) + 'px'; });
      var items = Object.keys(S.pts).map(function (p) { var q = S.pts[p]; return { id: p, text: S.names[p], x: q[0], y: q[1], side: q[2] }; });
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
      photoOn = false; sPhoto.textContent = 'Photograph of real cilia'; [sNext, sAgain, sCount].forEach(function (b) { b.style.visibility = ''; });
      svg.style.display = T.photo ? 'none' : ''; ph.hidden = !T.photo; sbar.hidden = !T.steps;
      if (T.photo) photoTab();
      svg.setAttribute('aria-label', T.say || T.name);
      api.say = T.photo ? (spec.mucus || {}).say : T.say; api.credit = T.photo ? (spec.mucus || {}).credit : T.credit;
      fit();
      if (T.steps) setStep(0); else { frame(.999); ctx.caption(); }
      start();
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
