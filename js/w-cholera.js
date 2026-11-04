/* ============================================================
   w-cholera.js — "Cholera in the small intestine" (station `cholera`, 10.1.16–10.1.17).

   The lining of the small intestine (Servier Medical Art's villi, CC BY 4.0, adapted): the contents of the small
   intestine above and between two villi, the epithelial cells, and the blood capillaries inside a villus. Five steps,
   each held until "Next step", the five links of the T10 summary's Fig. 3 in its words:
     1 the bacterium is swallowed in contaminated water;   2 it produces a toxin in the small intestine;
     3 the toxin causes secretion of chloride ions into the small intestine;   4 water moves into the gut by osmosis
     (in water-potential words: the contents' water potential falls, the blood's rises);   5 diarrhoea: water and ions
     are lost from the blood, so the body becomes dehydrated.
   The bacteria are curved rods, as Vibrio cholerae is; they are drawn larger than real (about 2 µm long), and the
   toxin, the ions and the water far larger than real molecules. A key in the step words gives each colour.
   SOURCES: syllabus 0610 2026–28 10.1.16, 10.1.17; MS 0610/41/O/N/24 Q3(c) (loss of water); 0610/21/M/J/19 Q14
   (water potentials, key C); the T10 summary's cholera section (checked against 0610 schemes on 2–3 Nov 2026).
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit; if (!L || !K) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp, clamp01 = K.clamp01, rng = K.rng;
  var VW = 351.4, VH = 339;                              /* the villi drawing's own box */
  var WIN = { x0: 118, x1: 338, y0: 0, y1: 318 };        /* the part shown: the right villus and the gap beside it */

  var STEPS = [
    { t: 0,  h: 'The bacterium is swallowed', p: 'The cholera **bacterium** is swallowed in **contaminated water**, and reaches the **small intestine**.' },
    { t: 7,  h: 'It produces a toxin', p: 'The bacteria produce a **toxin** (orange) in the small intestine. The toxin reaches the epithelial cells that line the villi.' },
    { t: 14, h: 'Chloride ions are secreted', p: 'The toxin causes **secretion of chloride ions** (green) **into the small intestine**: ions from the blood pass through the cells, and the cells release them into the contents.' },
    { t: 22, h: 'Water moves in by osmosis', p: 'The chloride ions **lower the water potential** of the contents; the blood loses ions, so its water potential **rises**. Water (blue) moves from the blood into the gut by **osmosis**, down the water potential gradient.' },
    { t: 32, h: 'Diarrhoea and dehydration', p: '**Diarrhoea**: the water and ions leave the body. Water and ions are lost from the blood, so the body becomes **dehydrated**.' }
  ];
  var M = [0, 7, 14, 22, 32, 41];

  /* where things are, in the drawing's units (read from the drawing: the gap between the villi is at x 160–200, the
     brush border of the right villus at about x 200–208 from y 110 to 230, its capillaries at x 236–292) */
  function bacPath(i) { var r = rng(30 + i)(); return { x0: 150 + 60 * r + i * 9, y0: -20, x1: 166 + (i % 3) * 18 + 6 * r, y1: 40 + i * 34 }; }
  var BAC = [0, 1, 2, 3, 4].map(bacPath);
  function surfaceY(i, n) { return 116 + (i / (n - 1)) * 110; }
  function surfaceX(y) { return 205 - 6 * Math.sin((y - 116) / 110 * Math.PI) * .3; }
  var TOX = []; (function () { var r = rng(5); for (var i = 0; i < 12; i++) TOX.push({ b: i % 5, y: surfaceY(i, 12) + 4 * r(), t0: 7.4 + i * .35 }); })();
  var CL = []; (function () { var r = rng(9); for (var i = 0; i < 14; i++) CL.push({ y0: 130 + 150 * r(), y: surfaceY(i % 12, 12) + 6 * r(), x1: 160 + 34 * r(), y1: 70 + 170 * r(), t0: 14.2 + i * .24 }); })();
  var WA = []; (function () { var r = rng(13); for (var i = 0; i < 22; i++) WA.push({ y0: 120 + 160 * r(), y: surfaceY(i % 12, 12) + 8 * r(), x1: 158 + 38 * r(), y1: 60 + 180 * r(), t0: 22.6 + i * .32 }); })();

  /* where each moving thing is at time t: one function for the drawing AND its name, so a name follows its part (Daniel,
     4 Nov 2026: "the label follows the bacteria and not just static") */
  function bacAt(b, i, t) { var k = ease(seg(t, .3 + i * .5, 5.4 + i * .3)); return [lerp(b.x0, b.x1, k) + Math.sin(t * 1.3 + i) * 2, lerp(b.y0, b.y1, k)]; }
  function toxAt(q, t) { var b = BAC[q.b], k = ease(seg(t, q.t0, q.t0 + 3)); return [lerp(b.x1 + 6, surfaceX(q.y) - 2, k), lerp(b.y1, q.y, k)]; }
  /* a chloride ion comes from the blood (a capillary, x 236–292), through an epithelial cell, out into the contents: so
     the blood loses ions on screen, as step 4 says (the audit of 4 Nov 2026) */
  function clAt(q, t) {
    var k0 = ease(seg(t, q.t0, q.t0 + 1.2)), k1 = ease(seg(t, q.t0 + 1.2, q.t0 + 2.4)), k2 = ease(seg(t, q.t0 + 2.4, q.t0 + 5));
    var x = lerp(254, 222, k0), y = lerp(q.y0, q.y, k0);
    x = lerp(x, surfaceX(q.y) - 6, k1);
    x = lerp(x, q.x1, k2); y = lerp(y, q.y1, k2);
    if (t > 33) { var k3 = ease(seg(t, 33, 39)); y = lerp(y, -20, k3); x = lerp(x, 175, k3 * .5); }
    return [x, y];
  }
  function waAt(q, t) {
    var k1 = ease(seg(t, q.t0, q.t0 + 2)), k2 = ease(seg(t, q.t0 + 2, q.t0 + 4.4)), x = lerp(250, 222, k1), y = lerp(q.y0, q.y, k1);
    x = lerp(x, q.x1, k2); y = lerp(y, q.y1, k2);
    if (t > 33) { var k3 = ease(seg(t, 33, 39)); y = lerp(y, -20, k3); x = lerp(x, 182, k3 * .5); }
    return [x, y];
  }
  function comma(x, y, a, s, op) {
    return '<g transform="translate(' + n1(x) + ' ' + n1(y) + ') rotate(' + n1(a) + ') scale(' + s + ')" opacity="' + n1(op * 100) / 100 + '">' +
      '<path class="ch__bac" d="M-11 2 C-8 -6 6 -8 12 -2 C13 0 12 2 10 2 C5 -3 -5 -2 -8 5 C-10 6 -12 4 -11 2 Z"/></g>';
  }
  function render(t) {
    var out = '<image href="assets/photos/sv-villi.svg" x="0" y="0" width="' + VW + '" height="' + VH + '"/>';
    /* step 5: the blood in the capillaries pales as it loses water and ions */
    var pale = clamp01((t - 34) / 4);
    if (pale > 0) out += '<path class="ch__pale" opacity="' + n1(pale * 45) / 100 + '" d="M236 104 C246 96 262 96 270 100 C286 112 296 200 300 316 L232 316 C230 220 228 140 236 104 Z"/>';
    /* the bacteria */
    BAC.forEach(function (b, i) {
      var at = bacAt(b, i, t);
      out += comma(at[0], at[1], 20 + i * 47, .85, Math.min(1, seg(t, .3 + i * .5, 1.2 + i * .5)));
    });
    /* the toxin, from the bacteria to the cells' surface */
    TOX.forEach(function (q) {
      if (t < q.t0) return;
      var at = toxAt(q, t), x = at[0], y = at[1], op = t > 21 ? 1 - seg(t, 21, 23) : 1;
      out += '<path class="ch__tox" opacity="' + n1(op * 100) / 100 + '" d="M' + n1(x) + ' ' + n1(y - 3.4) + ' l3.4 3.4 l-3.4 3.4 l-3.4 -3.4 z"/>';
    });
    /* chloride ions, from the blood through the cells into the contents */
    CL.forEach(function (q) {
      if (t < q.t0) return;
      var at = clAt(q, t);
      out += '<circle class="ch__cl" cx="' + n1(at[0]) + '" cy="' + n1(at[1]) + '" r="3.6"/>';
    });
    /* water, from the blood through the cells into the contents */
    WA.forEach(function (q) {
      if (t < q.t0) return;
      var at = waAt(q, t);
      out += '<circle class="ch__wa" cx="' + n1(at[0]) + '" cy="' + n1(at[1]) + '" r="3"/>';
    });
    /* step 5: the contents leave, to the large intestine and out of the body */
    var fl = clamp01((t - 33) / 2);
    if (fl > 0) out += '<g opacity="' + n1(fl * 100) / 100 + '"><path class="ch__flow" d="M176 210 L176 26 L250 26" marker-end="url(#chArrow)"/></g>';
    return out;
  }
  function labelsAt(t) {
    var it = [];
    /* in step 4 the contents are named by their water potential, so their own name gives way (four names on one side bent the lines) */
    if (!(t > 24 && t < 33)) it.push({ id: 'lumen', text: 'contents of the small intestine', x: 176, y: 150, side: 'L', alts: [[176, 120], [180, 200]] });
    it.push({ id: 'epi', text: 'epithelial cell', x: 216, y: 236, side: 'L', alts: [[214, 200], [218, 250]] });
    it.push({ id: 'cap', text: t >= 34 ? 'blood: loses water and ions' : 'blood capillary', x: 270, y: 236, side: 'R', alts: [[262, 270], [268, 180]] });
    /* each name where its part IS now (bacAt, toxAt, clAt, waAt), with the others of its kind as alternatives */
    if (t > 1.4 && t < 33) { var ba = bacAt(BAC[2], 2, t); it.push({ id: 'bac', text: 'cholera bacteria (Vibrio cholerae)', x: ba[0] + 8, y: ba[1], side: 'R', alts: BAC.map(function (q, i) { var a = bacAt(q, i, t); return [a[0] + 8, a[1]]; }) }); }
    if (t > TOX[4].t0 + .4 && t < 21) { var ta = toxAt(TOX[4], t); it.push({ id: 'tox', text: 'toxin', x: ta[0], y: ta[1], side: 'R' }); }
    if (t > CL[3].t0 + .6 && t < 33) { var ca = clAt(CL[3], t); it.push({ id: 'cl', text: 'chloride ions', x: ca[0], y: ca[1], side: 'L', alts: CL.filter(function (q) { return t > q.t0; }).map(function (q) { return clAt(q, t); }) }); }
    if (t > WA[5].t0 + .6 && t < 33) { var wa = waAt(WA[5], t); it.push({ id: 'wa', text: 'water', x: wa[0], y: wa[1], side: 'L', alts: WA.filter(function (q) { return t > q.t0; }).map(function (q) { return waAt(q, t); }) }); }
    if (t > 24 && t < 33) it.push({ id: 'wpl', text: 'lower water potential', x: 180, y: 120, side: 'L', alts: [[180, 100], [176, 160]] }, { id: 'wph', text: 'higher water potential', x: 264, y: 150, side: 'R', alts: [[268, 130], [262, 170]] });
    if (t > 34.5) it.push({ id: 'out', text: 'diarrhoea: out of the body', x: 246, y: 26, side: 'R' });
    return it;
  }

  function cholera(spec) {
    var S = K.shell(spec, 'ch', 'Cholera in the small intestine', 'The lining of the small intestine: cholera bacteria, their toxin, chloride ions and water.', [['who', 'The person:']]);
    var svg = S.svg, NSV = K.NS;
    var defs = document.createElementNS(NSV, 'defs');
    defs.innerHTML = '<clipPath id="chClip"><rect x="' + WIN.x0 + '" y="' + WIN.y0 + '" width="' + (WIN.x1 - WIN.x0) + '" height="' + (WIN.y1 - WIN.y0) + '" rx="10"/></clipPath>' +
      '<marker id="chArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="ch__arrow"/></marker>';
    svg.appendChild(defs);
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'ch__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var art = document.createElementNS(NSV, 'g'); art.setAttribute('clip-path', 'url(#chClip)'); model.appendChild(art);
    var cr = document.createElementNS(NSV, 'rect');
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var lay = null, narrow = false, key = K.pinKey(S);
    var R = [0], wps = 3.2;
    STEPS.forEach(function (s, i) { var w = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], w / wps)); });
    var clock = K.readerClock(R, M);
    function draw(tt) {
      var t = clock(tt);
      art.innerHTML = render(t);
      var items = labelsAt(t).map(function (q) {
        var p = lay.to(q.x, q.y);
        return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side, alts: (q.alts || []).map(function (a) { return lay.to(a[0], a[1]); }) };
      });
      gLab.innerHTML = K.names(lay, items, narrow, key, { tox: 1.6, cl: 1.6, wa: 1.6 }, 6);
      S.pill('who', t < 32 ? 'infected' : t < 36 ? 'diarrhoea' : 'dehydrated', t < 32 ? 'warn' : 'bad');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS, R), end: R[R.length - 1], render: draw, flow: K.readerFlow(R, M) });
    /* a key to the colours, under the drawing and inside its figure (Daniel, 4 Nov 2026: "a legend for the chloride ions …
       as well as a legend for the water") */
    var keyEl = L.h('div', 'ch__keys',
      '<span class="ch__k"><svg viewBox="-13 -8 26 16" aria-hidden="true"><path class="ch__bac" d="M-11 2 C-8 -6 6 -8 12 -2 C13 0 12 2 10 2 C5 -3 -5 -2 -8 5 C-10 6 -12 4 -11 2 Z"/></svg>cholera bacterium</span>' +
      '<span class="ch__k"><svg viewBox="-5 -5 10 10" aria-hidden="true"><path class="ch__tox" d="M0 -3.4 l3.4 3.4 l-3.4 3.4 l-3.4 -3.4 z"/></svg>toxin</span>' +
      '<span class="ch__k"><svg viewBox="-5 -5 10 10" aria-hidden="true"><circle class="ch__cl" r="3.6"/></svg>chloride ions</span>' +
      '<span class="ch__k"><svg viewBox="-5 -5 10 10" aria-hidden="true"><circle class="ch__wa" r="3"/></svg>water</span>');
    S.fig.appendChild(keyEl);
    return K.mount(S, sp, 'ch', [
      ['The drawing is the lining of the small intestine: two villi cut in section. The bacteria are drawn larger than real (a cholera bacterium is about 2 µm long), and the toxin, the ions and the water far larger than real molecules.'],
      ['<b>Beyond 0610.</b> In fact the toxin enters the epithelial cells and keeps a channel in their membrane open, so chloride ions leave the cells; sodium ions follow them. The syllabus asks only for the chain above.', 'ch__fence']
    ], function (Dw, nar) {
      narrow = nar; var m = K.margins(nar, 16, 14, 150, 140);
      lay = K.frameOf(svg, bg, model, cr, WIN, false, Dw, m[0], m[1], m[2], m[3], 14.5);
      model.setAttribute('transform', 'translate(' + (-WIN.x0) + ' ' + (-WIN.y0) + ')');
    });
  }
  L.add('cholera', cholera);
})(window);
