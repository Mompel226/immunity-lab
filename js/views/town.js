/* ============================================================
   views/town.js — the picture of station 5: a town of 96 people, and a transmissible disease arriving (10.1.12).

   Three towns, one button each: no one vaccinated; most people vaccinated; and years later, when vaccination has
   stopped and few are immune. In each, one infected person arrives, and the disease passes from person to person,
   one week at a time: "Next week" shows the next week and waits (memory animations-wait-for-the-reader); "Play all"
   runs to the end. The colours are the T10 summary's Fig. 2 (from Daniel's 10.1 lesson 3 slides): yellow = vaccinated,
   blue = not vaccinated and well, red = ill and infectious; grey = recovered. A key under the town says so.

   The model, kept simple on purpose: an ill person is infectious for one week, then recovers and is immune; each week
   each ill person passes the pathogen to each neighbour who is not immune with a chance of 0.6 (a fixed sequence of
   random numbers, so a town always runs the same way). Vaccinated people are immune. Babies and people who are ill
   with something else cannot be vaccinated: they are the people vaccination protects without vaccinating them.
   The person icon: Material Symbols "person", Google, Apache License 2.0.
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function n1(v) { return Math.round(v * 10) / 10; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
  var PERSON = 'M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12Zm-8 8v-2.8q0-.85.438-1.563T5.6 14.55q1.55-.775 3.15-1.163T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20H4Z';
  var C = 12, R = 8, CW = 50, RH = 42, W = C * CW, H = R * RH;
  /* who cannot be vaccinated: babies (drawn smaller) and people who are ill with something else */
  var BABY = [5, 18, 30, 43, 52, 61, 74, 87], UNWELL = [10, 37, 66, 81];
  var SCENES = {
    none: { name: 'No one vaccinated', cover: 0, seed: 9 },
    most: { name: 'Most people vaccinated', cover: .9, seed: 9 },
    stop: { name: 'Years after vaccination stopped', cover: .4, seed: 13 }
  };
  var START = 45;   /* the infected person arrives near the middle of the town (seeds chosen so each town tells its story: 3 Nov 2026) */

  function run(sc) {
    var r = rng(sc.seed), n = C * R, vac = [], i;
    for (i = 0; i < n; i++) vac.push(BABY.indexOf(i) < 0 && UNWELL.indexOf(i) < 0 && i !== START && r() < sc.cover);
    var state = [];   /* each week: per person 'v' vaccinated, 's' well, 'i' ill, 'r' recovered */
    var now = vac.map(function (v, k) { return v ? 'v' : k === START ? 'i' : 's'; });
    state.push(now.slice());
    for (var wk = 0; wk < 22; wk++) {
      var nx = now.slice(), any = false;
      for (i = 0; i < n; i++) if (now[i] === 'i') {
        nx[i] = 'r';
        var x = i % C, y = Math.floor(i / C);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var X = x + d[0], Y = y + d[1]; if (X < 0 || Y < 0 || X >= C || Y >= R) return;
          var j = Y * C + X; if (now[j] === 's' && nx[j] === 's' && r() < .6) { nx[j] = 'i'; any = true; }
        });
      }
      now = nx; state.push(now.slice());
      if (!any && now.indexOf('i') < 0) break;
    }
    return state;
  }
  function counts(st) { var o = { v: 0, s: 0, i: 0, r: 0 }; st.forEach(function (x) { o[x]++; }); return o; }

  function make(spec, ctx) {
    var root = h('div', 'twn');
    var bar = h('div', 'vbar twn__bar'); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Which town');
    var stage = h('div', 'twn__stage');
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'twn__svg'); svg.setAttribute('role', 'img');
    svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');   /* on a tall screen the town stands on its key, the space above it */
    stage.appendChild(svg);
    var ctl = h('div', 'twn__ctl');
    var nextB = h('button', 'twn__next', 'Next week ▶'), allB = h('button', 'twn__all', 'Play all'), againB = h('button', 'twn__again', '↺ Start again');
    [nextB, allB, againB].forEach(function (b) { b.type = 'button'; ctl.appendChild(b); });
    var read = h('p', 'twn__read'); read.setAttribute('aria-live', 'polite');
    /* the key: words under the town, never inside its drawing, so they keep their size and wrap on any screen (at
       1280 × 700 a key drawn in the town shrank with it and lost two of its rows: 3 Nov 2026) */
    var key = h('div', 'twn__keys', [['v', 'vaccinated'], ['s', 'not vaccinated, not infected'], ['i', 'ill, infectious'], ['r', 'recovered']].map(function (k) {
      return '<span class="twn__k"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="twn__p twn__p--' + k[0] + '" d="' + PERSON + '"/></svg>' + k[1] + '</span>';
    }).join('') + '<span class="twn__knote">Small: a baby, too young to be vaccinated. Ringed: the infected person who arrives.</span>');
    root.appendChild(bar); root.appendChild(stage); root.appendChild(key); root.appendChild(ctl); root.appendChild(read);
    var cur = 'none', week = 0, timer = null, runs = {}, mL = 10, mR = 10;
    Object.keys(SCENES).forEach(function (k) { runs[k] = run(SCENES[k]); });
    var btn = {};
    ['none', 'most', 'stop'].forEach(function (k) {
      var b = h('button', 'twn__mode', SCENES[k].name); b.type = 'button';
      b.addEventListener('click', function () { show(k); ctx.pick(k, { stay: true }); });
      bar.appendChild(b); btn[k] = b;
    });
    function fit() {
      svg.setAttribute('viewBox', n1(-mL) + ' -6 ' + n1(W + mL + mR) + ' ' + n1(H + 12));
    }
    function draw() {
      var st = runs[cur][Math.min(week, runs[cur].length - 1)], out = '';
      st.forEach(function (x, i) {
        var cx = (i % C) * CW + CW / 2, cy = Math.floor(i / C) * RH + RH / 2, baby = BABY.indexOf(i) >= 0, s = baby ? 1.05 : 1.5;
        out += '<path class="twn__p twn__p--' + x + (baby ? ' is-baby' : '') + '" transform="translate(' + n1(cx - 12 * s) + ' ' + n1(cy - 13 * s) + ') scale(' + s + ')" d="' + PERSON + '"/>';
      });
      /* the person who arrives ill: ringed in the first week (a name's line would run over the people) */
      if (week === 0) out += '<circle class="twn__ring" cx="' + n1((START % C) * CW + CW / 2) + '" cy="' + n1(Math.floor(START / C) * RH + RH / 2) + '" r="' + n1(RH * .52) + '"/>';
      svg.innerHTML = out;
      var c = counts(st), last = week >= runs[cur].length - 1;
      read.innerHTML = '<b>Week ' + week + '</b> · ill now: <b>' + c.i + '</b> · recovered: <b>' + c.r + '</b> · never ill: <b>' + (c.s + c.v) + '</b> of 96' +
        (last ? ' · <span class="twn__end">' + endWords(cur, c) + '</span>' : '');
      nextB.disabled = last; allB.disabled = last;
      nextB.classList.toggle('is-pulse', !last && week > 0);
      svg.setAttribute('aria-label', SCENES[cur].name + ': week ' + week + ', ' + c.i + ' ill, ' + c.r + ' recovered.');
    }
    function endWords(k, c) {
      if (k === 'none') return 'The disease spread from person to person through most of the town.';
      if (k === 'most') return 'The pathogen could not pass from person to person: the babies and the people who could not be vaccinated were protected too.';
      return 'With few people immune, the disease spread again.';
    }
    function stopT() { if (timer) clearInterval(timer); timer = null; }
    function show(k) {
      stopT(); cur = k; week = 0;
      Object.keys(btn).forEach(function (j) { btn[j].setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      draw();
      api.say = SCENES[k].name + ': one infected person arrives in a town of 96 people'; ctx.caption();
    }
    nextB.addEventListener('click', function () { stopT(); if (week < runs[cur].length - 1) { week++; draw(); } });
    allB.addEventListener('click', function () {
      stopT();
      timer = setInterval(function () { if (week >= runs[cur].length - 1) { stopT(); return; } week++; draw(); }, 700);
    });
    againB.addEventListener('click', function () { stopT(); week = 0; draw(); });
    if (global.ResizeObserver) new global.ResizeObserver(function () { fit(); draw(); }).observe(stage);
    var api = {
      el: root, say: '', credit: 'The person icon: Material Symbols, Google, Apache License 2.0',
      labels: { none: 'no one vaccinated', most: 'most people vaccinated', stop: 'years after vaccination stopped' },
      focus: function (part) { if (part && SCENES[part] && part !== cur) show(part); },
      stop: stopT,
      __runs: runs
    };
    fit(); show('none');
    return api;
  }
  global.Views.add('town', make);
})(window);
