/* ============================================================
   w-mother.js — "From mother to baby" (station `passive`, 10.1.13–10.1.15).

   Five steps, each held until "Next step":
     1 before birth, in the placenta: antibodies in the mother's blood (Servier's placenta, CC BY 4.0: the mother's blood
       vessels open into the space round the villi of the placenta);
     2 they cross the placenta into the blood of the fetus, and reach the fetus along the umbilical cord;
     3 after birth: the baby receives antibodies in breast milk (Servier's baby, its head only);
     4 in the baby's blood, the mother's antibodies (those that crossed the placenta) bind to a pathogen the mother has
       already met; for a pathogen she has not met, none fits. The antibodies in milk stay in the baby's gut and work there
       (most are not absorbed into the blood: the audit of 4 Nov 2026), and the step says so;
     5 no memory cells are produced: the antibodies are broken down after a few weeks, so passive immunity is short-term.
   No graph of antibody concentration (Daniel's 2026–27 mock uses one): the antibodies simply go, one by one.
   SOURCES: syllabus 0610 2026–28 10.1.13–10.1.15 and 16.4.9; the T10 summary's passive immunity section and table
   (MS 0610/43/O/N/24 Q3(b)(iii): antibodies acquired from another individual, across the placenta, when breastfeeding,
   only to the pathogens the mother has antibodies for; MS 0610/43/M/J/17 Q6(d)(ii): no memory cells; antibodies broken
   down). Antibodies are drawn far larger than real.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.ImmDraw; if (!L || !K || !D) return;
  var n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp, clamp01 = K.clamp01;
  var W = 300, H = 420;                      /* taller than wide, as the picture's column is */
  var PX = 30, PY = 9, PS = 1.25;            /* where the placenta drawing (192 × 322) stands, and its scale */
  var BS = 2.5, BX = -228, BY = 42;          /* the baby drawing: its head, enlarged */
  var MOUTH = [BX + 135 * BS, BY + 85 * BS];
  function px(x) { return PX + x * PS; }
  function py(y) { return PY + y * PS; }

  var STEPS = [
    { t: 0,  h: 'Before birth: antibodies in the mother’s blood', p: 'The mother’s blood carries **antibodies** against the pathogens she has met. Her blood flows into the **placenta**, round its villi.' },
    { t: 8,  h: 'They cross the placenta', p: 'Antibodies from the mother **cross the placenta** into the blood of the fetus, and reach the fetus in the **umbilical cord**.' },
    { t: 16, h: 'After birth: in breast milk', p: 'After birth, the baby receives antibodies from its mother in **breast milk**.' },
    { t: 24, h: 'They protect the baby', p: 'In the baby’s blood, the antibodies that crossed the placenta bind to a pathogen **the mother has already met**, and it is destroyed. For a pathogen she has not met, none of her antibodies fits. The antibodies in milk work in the same way in the baby’s gut.' },
    { t: 32, h: 'No memory cells: short-term', p: '**Memory cells are not produced**: the antibodies were made by someone else’s lymphocytes. They are **broken down** after a few weeks, so passive immunity is **short-term**.' }
  ];
  var M = [0, 8, 16, 24, 32, 42];

  /* ---- panel 1–2: the placenta ---- */
  var AB1 = [[66, 104, 70, 150], [102, 104, 120, 142], [66, 104, 56, 176], [102, 104, 134, 172], [102, 104, 96, 128]];
  function placenta(t) {
    var out = '<image href="assets/photos/sv-placenta.svg" x="' + PX + '" y="' + PY + '" width="' + 192 * PS + '" height="' + 322 * PS + '"/>';
    AB1.forEach(function (a, i) {
      var k1 = ease(seg(t, .6 + i * .5, 5 + i * .4)), k2 = ease(seg(t, 8.6 + i * .5, 11.6 + i * .5)), k3 = ease(seg(t, 11.6 + i * .5, 15 + i * .2));
      var x = lerp(a[0], a[2], k1), y = lerp(a[1], a[3], k1);
      x = lerp(x, 95, k2); y = lerp(y, 186, k2);
      /* along the fetus's vessel and the cord, one below another, pointing the way the blood flows */
      x = lerp(x, [97, 90, 101, 92, 99][i], k3); y = lerp(y, 206 + i * 23, k3);
      out += D.antibody({ x: px(x), y: py(y), rot: lerp(160 + i * 25 + 40 * k2, 180 + (i % 2 ? 14 : -14), k3), s: .56, kind: 'tri', op: Math.min(1, seg(t, .6 + i * .5, 1.4 + i * .5)) });
    });
    return out;
  }
  /* ---- panel 3: breast milk ---- */
  function milk(t) {
    var out = '<defs><linearGradient id="mbFade" x1="0" y1="0" x2="0" y2="1"><stop offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
      '<mask id="mbMask" maskUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + (BY + 104 * BS) + '"><rect x="0" y="0" width="' + W + '" height="' + (BY + 104 * BS) + '" fill="url(#mbFade)"/></mask>' +
      '<clipPath id="mbClip"><rect x="0" y="0" width="' + W + '" height="' + (BY + 104 * BS) + '"/></clipPath></defs>' +
      '<g clip-path="url(#mbClip)" mask="url(#mbMask)"><image href="assets/photos/sv-baby.svg" x="' + BX + '" y="' + BY + '" width="' + (300 * BS) + '" height="' + (252 * BS) + '"/></g>';
    for (var i = 0; i < 7; i++) {
      /* each drop of milk, with its antibodies, flows to the mouth; the last three stay by the lips at the end of the step */
      var k = ease(seg(t, 16.4 + i * .7, 20.6 + i * .3)), stay = i >= 4;
      var x = lerp(-6, MOUTH[0] - 18 - (stay ? (6 - i) * 22 : 0), k), y = lerp(MOUTH[1] + 90 - i * 8, MOUTH[1] + 18 + (stay ? (i - 4) * 6 : 0), k);
      var op = Math.min(1, seg(t, 16.4 + i * .7, 17 + i * .7)) * (stay ? 1 : 1 - seg(t, 20.6 + i * .3, 21.4 + i * .3));
      if (op < .02) continue;
      out += '<g opacity="' + n1(op * 100) / 100 + '"><circle class="mb__milk" cx="' + n1(x) + '" cy="' + n1(y) + '" r="15"/>' +
        D.antibody({ x: x + 1, y: y + 9, rot: 70, s: .36, kind: 'tri' }) + '</g>';
    }
    return out;
  }
  /* ---- panels 4–5: in the baby's blood ---- */
  var FREE = [[70, 120, 20], [160, 60, -30], [96, 236, 60], [244, 214, 10], [70, 330, -50], [120, 392, 35]];   /* none near pathogen B: it must not look bound */
  var pA = D.pathogen({ x: 0, y: 0, s: .34, rot: -10, kind: 'tri', n: 9, phase: 1 });
  var pB = D.pathogen({ x: 0, y: 0, s: .34, rot: 10, kind: 'sq', n: 9, phase: 2 });
  var BIND = [[0, 'R'], [3, 'L'], [6, 'R']].map(function (b) { return D.bound(pA.antigens[b[0]], 'tri', .7, b[1]); });
  var AX = 150, AY = 150, BXp = 196, BYp = 300;
  function blood(t) {
    var out = '<rect class="im__plasma" x="0" y="0" width="' + W + '" height="' + H + '" rx="16"/>';
    var Ax = lerp(-70, AX, ease(seg(t, 24.2, 27))), dead = clamp01((t - 30.2) / 1.2), Aop = 1 - .72 * seg(t, 31.2, 31.9);
    var Bx = lerp(380, BXp, ease(seg(t, 25, 28)));
    FREE.forEach(function (f, i) {
      var gone = seg(t, 33 + i * 1.3, 34 + i * 1.3);
      if (i < 3) {
        var k = ease(seg(t, 27.4 + i * .5, 29.6 + i * .3)), b = BIND[i];
        var x = lerp(f[0], Ax + b.x, k), y = lerp(f[1], AY + b.y, k), r = lerp(f[2], b.rot, k);
        out += D.antibody({ x: x, y: y, rot: r, s: .7, kind: 'tri', op: Math.min(Aop, 1 - gone) });
      } else if (gone < 1) out += D.antibody({ x: f[0], y: f[1] + 4 * Math.sin(t * .8 + i), rot: f[2], s: .7 * (1 - gone * .6), kind: 'tri', op: 1 - gone });
    });
    if (t > 24) out += '<g transform="translate(' + n1(Ax) + ' ' + AY + ')" opacity="' + n1(Aop * 100) / 100 + '" style="filter:grayscale(' + n1(dead * 100) / 100 + ')">' + pA.svg + '</g>';
    if (t > 24.6) out += '<g transform="translate(' + n1(Bx) + ' ' + BYp + ')">' + pB.svg + '</g>';
    if (t > 32) out += '<g opacity="' + n1(seg(t, 32, 33) * 100) / 100 + '">' + D.cell('lymphocyte', 64, 52, .5) + '</g>';
    return out;
  }

  function render(t) {
    return t < 16 ? placenta(t) : t < 24 ? milk(t) : blood(t);
  }
  function labelsAt(t) {
    var it = [];
    if (t < 16) {
      it.push({ id: 'mum', text: 'the mother’s blood', x: px(22), y: py(160), side: 'L', alts: [[px(26), py(176)], [px(18), py(140)]] });
      it.push({ id: 'pla', text: 'a villus of the placenta', x: px(146), y: py(150), side: 'R', alts: [[px(140), py(162)], [px(130), py(140)]] });
      if (t > 8) it.push({ id: 'fet', text: 'blood of the fetus', x: px(100), y: py(236), side: 'R', alts: [[px(104), py(246)]] });
      it.push({ id: 'cord', text: 'umbilical cord, to the fetus', x: px(104), y: py(292), side: 'R', alts: [[px(108), py(302)]] });
      if (t > 1.2) { var a = AB1[t > 8 ? 4 : 2]; it.push({ id: 'ab', text: 'the mother’s antibodies', x: px(t > 8 ? 90 : a[2]), y: py(t > 8 ? 229 : a[3]), side: 'L' }); }
    } else if (t < 24) {
      it.push({ id: 'baby', text: 'a newborn baby', x: BX + 172 * BS, y: BY + 30 * BS, side: 'R' });
      if (t > 17.2) it.push({ id: 'milk', text: 'breast milk, with antibodies', x: MOUTH[0] - 62, y: MOUTH[1] + 24, side: 'L' });
    } else {
      it.push({ id: 'pa', text: t < 30.2 ? 'a pathogen the mother has met' : 'destroyed', x: lerp(-70, AX, ease(seg(t, 24.2, 27))) - 26, y: AY, side: 'L', alts: [[AX - 30, AY - 14], [AX - 30, AY + 14]] });
      if (t > 26.5) it.push({ id: 'pb', text: 'one she has not met: no antibody fits', x: lerp(380, BXp, ease(seg(t, 25, 28))) + 28, y: BYp, side: 'R' });
      if (t < 34) it.push({ id: 'ab', text: 'the mother’s antibodies', x: FREE[4][0], y: FREE[4][1], side: 'L' });
      if (t > 32.6) it.push({ id: 'lym', text: 'the baby’s lymphocytes: no memory cells made', x: 40, y: 52, side: 'L' });
    }
    return it;
  }

  function mother(spec) {
    var S = K.shell(spec, 'mb', 'From mother to baby', 'Antibodies cross the placenta and arrive in breast milk; they protect the baby, then are broken down.', [['age', 'The baby:']]);
    var svg = S.svg, NSV = K.NS;
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'mb__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var cr = document.createElementNS(NSV, 'rect'), lay = null, narrow = false, key = K.pinKey(S);
    /* each step: its motion, then a short beat (WKit.timeline) */
    var TL = K.timeline(M), R = TL.R, clock = TL.clock;
    function draw(tt) {
      var t = clock(tt);
      model.innerHTML = render(t);
      model.setAttribute('transform', 'translate(0 0)');
      var items = labelsAt(t).map(function (q) {
        var p = lay.to(q.x, q.y);
        return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side, alts: (q.alts || []).map(function (a) { return lay.to(a[0], a[1]); }) };
      });
      gLab.innerHTML = K.names(lay, items, narrow, key, null, 6);
      var weeks = Math.min(8, Math.max(1, Math.round(1 + 7 * seg(t, 32.4, 41))));
      S.pill('age', t < 16 ? 'before birth' : t < 24 ? 'newborn' : t < 32 ? 'a few days old, protected' : weeks + (weeks > 1 ? ' weeks' : ' week') + ' old', t < 32 ? 'ok' : weeks > 6 ? 'warn' : 'ok');
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS, R), end: TL.end, render: draw, flow: TL.flow });
    return K.mount(S, sp, 'mb', [
      ['The placenta drawing shows the mother’s blood vessels opening into the space round a villus of the placenta; the blood of the fetus flows inside the villus and along the umbilical cord. Antibodies are drawn far larger than real.']
    ], function (Dw, nar) {
      narrow = nar; var m = K.margins(nar, 14, 14, 90, 90);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }
  L.add('mother', mother);
})(window);
