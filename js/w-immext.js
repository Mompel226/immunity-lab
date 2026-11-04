/* ============================================================
   w-immext.js — "How antibodies are made", an EXTENSION in the station Antibodies and active immunity (Daniel, 4 Nov 2026:
   "the macrophage chases the bacteria … the antigens … are shown in the plasma membrane, and then other cells identify that
   … mention cytokines and the different types of lymphocytes and phagocytes … only shown if you press a button").

   It stays folded until "Show extension" is pressed. Eight steps, each held until Next step (Play all runs them):
   a macrophage moves to a bacterium by amoeboid movement; engulfs it by endocytosis into a vesicle; lysosomes release
   enzymes that digest it, and pieces of its antigens are kept; MHC proteins hold the pieces on the cell membrane (antigen
   presentation); a helper T-lymphocyte whose receptor fits binds, is activated and releases cytokines; a B-lymphocyte
   whose surface antibodies fit binds the antigen directly and is activated by the helper T-cell; it divides by mitosis
   into a clone of plasma cells that secrete antibodies; some of the clone stay as memory cells.

   Each step says what it belongs to (its tag). SOURCES: IB Biology guide (first assessment 2025), C3.2.4 ("Students are not
   required to know any components of the innate immune system other than phagocytes"), C3.2.5 ("amoeboid movement from
   blood to sites of infection … engulf them by endocytosis and digest them using enzymes from lysosomes"), C3.2.6–C3.2.10
   (B-cells activated by "direct interaction with the specific antigen and contact with a helper T-cell that has also
   become activated by the same type of antigen"; "divide by mitosis to produce large numbers of plasma B-cells";
   memory cells). Antigen presentation on MHC proteins and cytokines are named in no syllabus of the lab: "beyond IB".
   0610 asks none of it (10.1.6–10.1.10 only): the step list says so.

   The cells are Servier Medical Art (CC BY 4.0, adapted): the macrophage (Blood & Immunology, "Myelopoiesis (2)"), the T
   and B lymphocytes ("Lymphopoiesis"); a plasma cell is the B lymphocyte drawn larger, as plasma cells are. The bacterium
   and its antigens are js/imm-draw.js; the vesicle, the lysosomes, the MHC proteins, the receptor and the cytokines are
   drawn for the lab, far larger than real, so they show.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.ImmDraw;
  if (!L || !K || !D) return;
  var h = L.h, n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp;
  var A = global.IMM_ART || {};
  var W = 480, H = 520, KIND = 'round';

  function art(name, x, y, s, op) {
    var a = A[name]; if (!a) return '';
    return '<g opacity="' + n1((op == null ? 1 : op) * 100) / 100 + '" transform="translate(' + n1(x - a.w * s / 2) + ' ' + n1(y - a.h * s / 2) + ') scale(' + s + ')">' + a.svg + '</g>';
  }
  function pt(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
  function wob(t, amp) { return 1 + amp * Math.sin(t * 9); }

  /* ---------- the places (the sheet is W × H) ---------- */
  var M0 = [70, 330], M1 = [190, 210], MR = 74;                 /* the macrophage: where it starts, where it stops, its radius */
  var B0 = [330, 112], B1 = [282, 150];                         /* the bacterium drifts slowly; the macrophage follows it */
  var IN = [205, 205];                                          /* the vesicle inside the macrophage */
  var SHOW = [-46, -18, 10].map(function (deg) { var r = deg * Math.PI / 180; return [M1[0] + MR * Math.cos(r), M1[1] + MR * Math.sin(r), r]; });
  var T0 = [450, 90], T1 = [SHOW[1][0] + 58 * Math.cos(SHOW[1][2]), SHOW[1][1] + 58 * Math.sin(SHOW[1][2])];
  var BC = [372, 352], T2 = [BC[0] - 10, BC[1] - 92];             /* the B-cell, and where the helper T-cell meets it */
  var CLONE = [[226, 458], [312, 468], [398, 452], [180, 372], [440, 368]];   /* plasma cells (0–2), memory cells (3–4), inside the frame, apart */

  /* ---------- one frame at model time t ---------- */
  function render(t) {
    var out = '', labels = [];
    function lab(id, text, x, y, side, pri) { labels.push({ id: id, text: text, x: x, y: y, side: side, pri: pri || 1 }); }
    /* the macrophage: it moves by amoeboid movement, changing shape, then stays */
    var mk = ease(seg(t, 0, 6)), Mx = pt(M0, M1, mk), mw = t < 6 ? .06 * Math.sin(t * 7) : 0;
    out += '<g transform="translate(' + n1(Mx[0]) + ' ' + n1(Mx[1]) + ') scale(' + n1((1 + mw) * 100) / 100 + ' ' + n1((1 - mw) * 100) / 100 + ') translate(' + n1(-Mx[0]) + ' ' + n1(-Mx[1]) + ')">' + art('macrophage', Mx[0], Mx[1], 1.32) + '</g>';
    if (t >= 6 && t < 46) lab('mac', 'macrophage (a phagocyte)', Mx[0] - MR + 6, Mx[1] + 22, 'L', 2);
    /* the bacterium: drifting (0–6), engulfed (8–12), in its vesicle, digested (15–21) */
    var bp = t < 8 ? pt(B0, B1, seg(t, 0, 6)) : pt(B1, IN, ease(seg(t, 9.5, 12.5)));
    var dig = seg(t, 17, 21);
    /* the macrophage's membrane flows round it (8–10.5), the ends meet and it is inside, in a vesicle */
    if (t >= 8 && t < 12.5) {
      var g = ease(seg(t, 8, 10.5)), fade = 1 - seg(t, 10.5, 12.5), R2 = 34;
      var tu = Math.atan2(M1[1] - B1[1], M1[0] - B1[0]);
      [1, -1].forEach(function (sg) {
        var p = []; for (var i = 0; i <= 20; i++) { var a = tu + sg * (.9 + (Math.PI - .9) * g * i / 20); p.push(n1(B1[0] + R2 * Math.cos(a)) + ' ' + n1(B1[1] + R2 * Math.sin(a))); }
        var d = 'M' + p.join(' L');
        out += '<g opacity="' + n1(fade * 100) / 100 + '"><path class="ix__ext1" d="' + d + '"/><path class="ix__ext2" d="' + d + '"/></g>';
      });
    }
    if (t >= 10.5 && t < 30) {
      var vo = Math.min(seg(t, 10.5, 12), 1 - seg(t, 26, 29));
      out += '<circle class="ix__ves" cx="' + n1(bp[0]) + '" cy="' + n1(bp[1]) + '" r="30" opacity="' + n1(vo * 100) / 100 + '"/>';
      if (t >= 12.5 && t < 17) lab('ves', 'vesicle', bp[0] + 24, bp[1] - 18, 'R', 2);
    }
    /* lysosomes come to the vesicle and join it (15–18) */
    if (t >= 15 && t < 18.5) [[140, 250], [168, 272], [150, 182]].forEach(function (q, i) {
      var k = ease(seg(t, 15 + i * .4, 17.6)), at = pt(q, IN, k * .8);
      out += '<circle class="ix__lys" cx="' + n1(at[0]) + '" cy="' + n1(at[1]) + '" r="6" opacity="' + n1((1 - seg(t, 17.6, 18.5)) * 100) / 100 + '"/>';
      if (i === 0 && t < 16.2) lab('lys', 'lysosome', at[0], at[1], 'L', 2);
    });
    if (dig < 1) {
      var P = D.pathogen({ x: bp[0], y: bp[1], s: .2 * (1 - .4 * dig), rot: 20, kind: KIND, n: 8, fade: 1 - dig });
      out += P.svg;
      if (t < 8 && t >= 6) {
        lab('bac', 'bacterium', bp[0] + 12, bp[1] + 6, 'R', 1);
        var top = P.antigens.reduce(function (m, a) { return a.y < m.y ? a : m; });
        lab('ag', 'antigens', top.x, top.y, 'R', 2);
      }
    }
    /* pieces of the antigens: kept in the vesicle (20–22), carried to the membrane and held by MHC proteins (22–28) */
    if (t >= 20) SHOW.forEach(function (s, i) {
      var k = ease(seg(t, 22.5 + i * .5, 26.5)), at = pt([IN[0] + (i - 1) * 8, IN[1] + (i - 1) * 6], [s[0], s[1]], k);
      var rot = s[2] * 180 / Math.PI + 90, op = seg(t, 20, 21.5);
      var mhc = seg(t, 26, 28);
      out += '<g opacity="' + n1(op * 100) / 100 + '" transform="translate(' + n1(at[0]) + ' ' + n1(at[1]) + ') rotate(' + n1(rot * k) + ')">' +
        (mhc > 0 ? '<path class="ix__mhc" opacity="' + n1(mhc * 100) / 100 + '" d="M-7 6 L-7 -2 L-3 -2 L-3 3 L3 3 L3 -2 L7 -2 L7 6 Z"/>' : '') +
        '<circle class="ix__agp" cx="0" cy="-5" r="4.2"/></g>';
    });
    /* each step names its own parts only: the pieces and the MHC proteins in step 4 */
    if (t >= 28 && t < 30.5) { lab('agp', 'antigen pieces, displayed', SHOW[0][0], SHOW[0][1] - 5, 'R', 2); lab('mhc', 'MHC protein', SHOW[2][0] + 4, SHOW[2][1], 'R', 3); }
    /* the helper T-cell: comes, its receptor fits a displayed piece (30–34), releases cytokines (34–38), goes to the B-cell (42–45) */
    if (t >= 30) {
      var tk = ease(seg(t, 30, 33.5)), Tx = t < 42 ? pt(T0, T1, tk) : pt(T1, T2, ease(seg(t, 42, 45)));
      out += art('t-lymph', Tx[0], Tx[1], 1.0) + (t >= 33 && t < 42 ? '<circle class="im__glow" cx="' + n1(Tx[0]) + '" cy="' + n1(Tx[1]) + '" r="54" opacity="' + n1(seg(t, 33, 34.5) * 50) / 100 + '"/>' : '');
      /* its receptor: a cup round the antigen piece it fits, on the T-cell's side, once it has bound */
      if (t >= 33.5 && t < 42) {
        var ra = SHOW[1][2], px = SHOW[1][0] + 5 * Math.cos(ra), py = SHOW[1][1] + 5 * Math.sin(ra), q = [];
        for (var qi = 0; qi <= 12; qi++) { var qa = ra - Math.PI / 2 + Math.PI * qi / 12; q.push(n1(px + 8 * Math.cos(qa)) + ' ' + n1(py + 8 * Math.sin(qa))); }
        out += '<path class="ix__rec" opacity="' + n1(seg(t, 33.5, 34.5) * 100) / 100 + '" d="M' + q.join(' L') + '"/>';
      }
      if (t >= 33.5 && t < 46) lab('th', t >= 42 ? 'helper T-cell' : 'helper T-lymphocyte, activated', Tx[0] + 12, Tx[1] - 44, 'R', 2);   /* high on the cell, a row above its receptor */
      if (t >= 34.5 && t < 38) lab('rec', 'its receptor fits the piece', SHOW[1][0] + 13 * Math.cos(SHOW[1][2]), SHOW[1][1] + 13 * Math.sin(SHOW[1][2]), 'R', 3);
      /* cytokines: small signalling proteins, released and spreading */
      if (t >= 34) for (var c = 0; c < 9; c++) {
        var ca = c * .7 + .3, cr = 44 + 70 * seg(t, 34 + c * .12, 37.5), cx = (t < 42 ? T1 : T2)[0] + cr * Math.cos(ca), cy = (t < 42 ? T1 : T2)[1] + cr * Math.sin(ca) * .8;
        var co = t < 42 ? 1 - seg(t, 40, 42) : seg(t, 44, 45) * (1 - seg(t, 48, 50));
        if (co > .02) out += '<path class="ix__cyt" opacity="' + n1(co * 100) / 100 + '" d="M' + n1(cx) + ' ' + n1(cy - 4) + ' L' + n1(cx + 4) + ' ' + n1(cy) + ' L' + n1(cx) + ' ' + n1(cy + 4) + ' L' + n1(cx - 4) + ' ' + n1(cy) + ' Z"/>';
        if (c === 1 && t >= 37.5 && t < 40) lab('cyt', 'cytokines', cx, cy, 'R', 3);
      }
    }
    /* the B-cell: comes (38–40), its own antibodies bind a whole antigen (40–42), activated by the helper T-cell (44–46) */
    if (t >= 38 && t < 47) {
      var bk = ease(seg(t, 38, 40)), Bx = pt([470, 440], BC, bk);
      out += art('b-lymph', Bx[0], Bx[1], 1.05) + (t >= 44.5 ? '<circle class="im__glow" cx="' + n1(Bx[0]) + '" cy="' + n1(Bx[1]) + '" r="56" opacity="' + n1(seg(t, 44.5, 46) * 50) / 100 + '"/>' : '');
      [[-40, -22, -60], [44, -10, 60], [-46, 18, -110]].forEach(function (q, i) {
        out += D.antibody({ x: Bx[0] + q[0], y: Bx[1] + q[1], rot: q[2], s: .34, kind: KIND });
      });
      var ag = pt([300, 470], [Bx[0] - 56, Bx[1] - 40], ease(seg(t, 40, 42)));
      if (t >= 40) out += '<circle class="ix__agp" cx="' + n1(ag[0]) + '" cy="' + n1(ag[1]) + '" r="5"/>';
      if (t >= 40) lab('bc', t >= 46 ? 'B-cell, activated' : 'B-lymphocyte', Bx[0] + 40, Bx[1] + 10, 'R', 2);
      if (t >= 42 && t < 46) lab('bab', 'its antibodies bind the antigen', ag[0], ag[1], 'L', 3);
    }
    /* the clone: it divides by mitosis (46–50); plasma cells secrete antibodies (49–54); memory cells (54–) */
    if (t >= 46) CLONE.forEach(function (q, i) {
      var k = ease(seg(t, 46 + i * .5, 49 + i * .3)), at = pt(BC, q, k), plasma = i < 3, sc = plasma ? 1.05 + .2 * seg(t, 49, 51) : .9;
      out += art('b-lymph', at[0], at[1], sc * .78);
      if (!plasma && t >= 54) out += '<circle class="im__mem" cx="' + n1(at[0]) + '" cy="' + n1(at[1]) + '" r="' + n1(40 * .9) + '" opacity="' + n1(seg(t, 54, 55.5) * 100) / 100 + '"/>';
      if (plasma && t >= 50) for (var a = 0; a < 3; a++) {
        var e = (t - 50 - a * .9) / 3; if (e < 0) continue; e = e % 1;
        var an = -1.9 + i * .6 + a * .5, rr = 36 + 46 * e;
        out += D.antibody({ x: at[0] + rr * Math.cos(an), y: at[1] + rr * Math.sin(an), rot: an * 57.3 + 90, s: .3, kind: KIND, op: Math.min(1, e * 5) * (1 - Math.max(0, e - .8) * 5) });
      }
    });
    if (t >= 51) lab('pl', 'plasma cells: secrete antibodies', CLONE[0][0] - 30, CLONE[0][1], 'L', 2);
    if (t >= 55.5) lab('mem', 'memory cells', CLONE[3][0] + 34, CLONE[3][1], 'R', 2);
    return { svg: out, labels: labels };
  }

  var STEPS = [
    { h: 'A macrophage moves to a bacterium', tag: 'Extension · IB C3.2.5', p: 'A **macrophage** is a large **phagocyte**. Phagocytes move by **amoeboid movement**, changing their shape, from the blood to the place of an infection. This one follows the bacterium.' },
    { h: 'It engulfs the bacterium', tag: 'Extension · IB C3.2.5', p: 'The macrophage **recognises** the bacterium and **engulfs** it by **endocytosis**: its membrane flows round the bacterium and closes, so the bacterium is inside a **vesicle**.' },
    { h: 'Enzymes from lysosomes digest it', tag: 'Extension · IB C3.2.5', p: 'Small sacs, **lysosomes**, join the vesicle and release **enzymes**, which digest the bacterium. Its antigens are cut into small pieces, and the cell keeps some of them.' },
    { h: 'The macrophage displays the antigen pieces', tag: 'Extension · beyond IB', p: '**MHC proteins** carry the antigen pieces to the cell membrane and hold them on the outside. This is **antigen presentation**.' },
    { h: 'A helper T-cell is activated', tag: 'Extension · IB C3.2.8 · cytokines beyond IB', p: 'A **helper T-lymphocyte** whose **receptor** fits these antigen pieces binds to them, and is **activated**. It releases **cytokines**: signalling proteins that act on other cells of the immune system.' },
    { h: 'A B-cell is activated', tag: 'Extension · IB C3.2.8', p: 'A **B-lymphocyte** carries antibodies of one shape on its surface. If they fit this antigen, it binds the antigen **directly**. It is **activated** only when it also has **contact with a helper T-cell** activated by the same antigen.' },
    { h: 'It divides into plasma cells', tag: 'Extension · IB C3.2.9', p: 'The activated B-cell **divides by mitosis** many times, into a **clone**: cells that all make the same antibody. Most become **plasma cells**, which **secrete** large numbers of these **antibodies**.' },
    { h: 'Memory cells stay', tag: 'Extension · IB C3.2.10', p: 'Some cells of the clone become **memory cells**, which live for a long time. If the same pathogen returns, they respond quickly: this is **immunity**. Memory T-cells are made too.' }
  ];
  var M = [0, 7, 15, 22, 30, 38, 46, 54, 62];
  function readerTimes() {
    var R = [0];
    STEPS.forEach(function (s, i) { var words = (s.h + ' ' + s.p).replace(/\*\*/g, '').split(/\s+/).length; R.push(R[i] + Math.max(M[i + 1] - M[i], words / 3.2)); });
    return R;
  }

  function build(spec) {
    var S = K.shell(spec, 'im', 'How antibodies are made', 'A macrophage engulfs and digests a bacterium and displays pieces of its antigens; a helper T-cell and a B-cell are activated; plasma cells secrete antibodies; memory cells stay.', []);
    var svg = S.svg, NSV = K.NS;
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'im__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var defs = document.createElementNS(NSV, 'defs'), cp = document.createElementNS(NSV, 'clipPath'), cr = document.createElementNS(NSV, 'rect');
    var cid = 'ixc' + Math.random().toString(36).slice(2, 7); cp.setAttribute('id', cid); cp.appendChild(cr); defs.appendChild(cp); svg.insertBefore(defs, bg);
    var tissue = '<rect class="im__plasma" x="0" y="0" width="' + W + '" height="' + H + '" rx="16"/>';
    var gArt = document.createElementNS(NSV, 'g'); gArt.setAttribute('clip-path', 'url(#' + cid + ')'); model.appendChild(gArt);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var lay = null, narrow = false, key = K.pinKey(S), R = readerTimes(), clock = K.readerClock(R, M);
    function draw(t) {
      var mt = clock(t), r = render(mt);
      gArt.innerHTML = tissue + r.svg;
      var seen = {}, items = r.labels.filter(function (q) { if (seen[q.id]) return false; seen[q.id] = 1; return true; })
        .map(function (q) { var p = lay.to(q.x, q.y); return { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side, pri: q.pri }; });
      gLab.innerHTML = K.names(lay, items, narrow, key, null, 6);
    }
    var sp = L.stepper({ steps: K.readerSteps(STEPS, R), end: R[R.length - 1], render: draw });
    return K.mount(S, sp, 'im', [
      ['<b>The cells, by name</b> (extension). Phagocytes: <b>neutrophils</b>, the most common white blood cells, short-lived and the first to arrive at an infection; <b>macrophages</b>, larger and long-lived, which develop from monocytes that leave the blood; <b>dendritic cells</b>, which also display antigen pieces, to T-cells in the lymph nodes. Lymphocytes: <b>B-lymphocytes</b>, which become plasma cells and memory cells; <b>helper T-lymphocytes</b>, which activate B-cells and other cells, by contact and with cytokines; <b>cytotoxic (killer) T-lymphocytes</b>, which kill body cells infected by viruses. <b>Cytokines</b> are signalling proteins, for example interleukins. IB Biology names B-lymphocytes, helper T-lymphocytes, plasma cells and memory cells; the rest goes beyond IB.', 'ixg__names'],
      ['The cells are Servier Medical Art (CC BY 4.0, adapted); a plasma cell is drawn as a larger B-lymphocyte. The vesicle, the lysosomes, the MHC proteins and the cytokines are drawn for this lab, far larger than real.']
    ], function (Dw, nar) {
      narrow = nar;
      var m = K.margins(nar, 13, 13, 110, 110);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }

  /* folded until pressed: the extension is for the curious, and says so */
  function immext(spec) {
    var box = build(spec), head = box.firstChild, rest = [].slice.call(box.children, 1);
    rest.forEach(function (el) { el.hidden = true; });
    var gate = h('div', 'ixg', '<p class="ixg__p"><b>Extension.</b> Beyond the 0610 syllabus, which does not list these cells or steps. ' +
      'IB Biology (C3.2) asks most of it; two steps go beyond IB, and each step says which. It shows the cells that work together ' +
      'to make antibodies, and their names.</p>');
    var btn = h('button', 'ixg__btn', 'Show extension'); btn.type = 'button';
    gate.appendChild(btn);
    box.insertBefore(gate, head.nextSibling);
    btn.addEventListener('click', function () {
      rest.forEach(function (el) { el.hidden = false; });
      btn.remove();
      if (box.__onMove) box.__onMove();
    });
    return box;
  }
  L.add('immext', immext);
})(window);
