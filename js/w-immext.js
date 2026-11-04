/* ============================================================
   w-immext.js — "How antibodies are made", an EXTENSION in the station Antibodies and active immunity (Daniel, 4 Nov 2026:
   "the macrophage chases the bacteria … the antigens … are shown in the plasma membrane, and then other cells identify that
   … mention cytokines and the different types of lymphocytes and phagocytes … only shown if you press a button").

   It is the IB version of "The first meeting": the switch above that animation (fmswitch, below) shows one or the other
   (Daniel, 4 Nov 2026: "a toggle"). Eight steps, each held until Next step (Play all runs them):
   a macrophage moves to a bacterium by amoeboid movement; engulfs it by endocytosis into a vesicle; lysosomes release
   enzymes that digest it, and pieces of its antigens are kept; MHC proteins take the pieces in the vesicle and carry them
   to the cell membrane (antigen presentation); a helper T-lymphocyte whose receptor fits binds, is activated and releases
   cytokines; a B-lymphocyte whose surface antibody fits binds a whole antigen, on another bacterium of the same kind,
   directly, and is activated by the helper T-cell; it divides by mitosis
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

  /* ---------- the places (the sheet is W × H) ----------
     Sizes nearer to life (Daniel, 4 Nov 2026: "make the macrophage bigger … keep the pathogen the same size"): a macrophage is
     about 20 µm across and a bacterium about 2 µm long, so the macrophage is drawn about five times the bacterium's length
     (life: ten); the bacterium keeps the scale it has everywhere in the lab, and the antigens and antibodies stay larger than
     real so their shapes show. The vesicle is wide enough to hold the whole bacterium, its antigens included. */
  var MR = 120, MS = 1.95;                                      /* the macrophage's radius, and the scale of Servier's inside for it */
  var M0 = [132, 380], M1 = [190, 214];                         /* where it starts (wholly inside the frame), where it stops */
  var PSC = .2, VR = 46, HM = 17;                               /* the bacterium's scale; the vesicle's radius; an antigen's height (ImmDraw: stalk 7 + 1 + head 9) */
  var B1 = [M1[0] + (MR + VR - 6) * Math.cos(-.576), M1[1] + (MR + VR - 6) * Math.sin(-.576)], B0 = [B1[0] + 48, B1[1] - 31];   /* the bacterium drifts; the macrophage follows it */
  var IN = [M1[0] + 44, M1[1] - 36];                            /* the vesicle, inside the macrophage, clear of its nucleus */
  var LYS = [[-34, -78], [96, 18], [58, 56]];                   /* lysosomes, in the cytoplasm, from the macrophage's centre */
  var SHOW = [-46, -18, 10].map(function (deg) { var r = deg * Math.PI / 180; return [M1[0] + (MR - 4) * Math.cos(r), M1[1] + (MR - 4) * Math.sin(r), r]; });
  var T0 = [450, 90], T1 = [SHOW[1][0] + (HM + 50) * Math.cos(SHOW[1][2]), SHOW[1][1] + (HM + 50) * Math.sin(SHOW[1][2])];
  var BC = [392, 372], T2 = [BC[0] - 10, BC[1] - 92];             /* the B-cell, and where the helper T-cell meets it */
  var CLONE = [[226, 458], [312, 468], [398, 456], [110, 440], [446, 382]];   /* plasma cells (0–2), memory cells (3–4), inside the frame, apart */
  /* the bacterium, its body and its antigens drawn apart, so the enzymes can digest the body while the antigens' shapes
     stay: REF gives each antigen's place on the body (its outer end x, y and outward direction nx, ny) */
  var REF = D.pathogen({ x: 0, y: 0, s: PSC, rot: 20, kind: KIND, n: 8 }).antigens;
  /* the B-cell's antibody that binds (left of the cell, a little low), and the bacterium it binds: the antigen that faces
     the B-cell, and the bound antibody's pose in the bacterium's own frame (ImmDraw.bound) */
  var BAB = [-41, 16], BROT = 200;   /* its foot on the B-cell's membrane */
  var BAG = (function () {
    var d = [.93, -.36];
    return D.pathogen({ x: 0, y: 0, s: .2, rot: BROT, kind: KIND, n: 8 }).antigens.reduce(function (m, a) { return a.nx * d[0] + a.ny * d[1] > m.nx * d[0] + m.ny * d[1] ? a : m; });
  })();
  var BPOSE = D.bound(BAG, KIND, .34, 'R');

  /* ---------- one frame at model time t ---------- */
  function render(t) {
    var out = '', labels = [];
    function lab(id, text, x, y, side, pri) { labels.push({ id: id, text: text, x: x, y: y, side: side, pri: pri || 1 }); }
    /* the macrophage: it moves by amoeboid movement, changing shape, then stays */
    var mk = ease(seg(t, 0, 6)), Mx = pt(M0, M1, mk), cw = Math.min(1, 6 * mk * (1 - mk));
    var balls = [[Mx[0], Mx[1], MR - 6]], dirB = Math.atan2(B1[1] - M1[1], B1[0] - M1[0]);
    for (var rb = 0; rb < 11; rb++) {   /* a macrophage's ruffled edge: small bulges round it, livelier while it crawls */
      var ra = rb * .571 + .2, rw = (1.2 + 3 * cw) * Math.sin(t * 1.5 + rb * 1.7);
      balls.push([Mx[0] + (MR - 16) * Math.cos(ra), Mx[1] + (MR - 16) * Math.sin(ra), 15 + rw]);
    }
    if (cw > .02) balls.push([Mx[0] + (MR - 8) * Math.cos(dirB), Mx[1] + (MR - 8) * Math.sin(dirB), (24 + 5 * Math.sin(t * 4)) * cw]);   /* the leading edge */
    if (t >= 6 && t < 46) lab('mac', 'macrophage (a phagocyte)', Mx[0] - MR + 14, Mx[1] + 40, 'L', 2);
    /* the bacterium: drifting (0–6), engulfed (8–12), in its vesicle (12–), its body digested (18.4–21.4) */
    var bp = t < 8 ? pt(B0, B1, ease(seg(t, 0, 6))) : pt(B1, IN, ease(seg(t, 9.5, 12.5)));
    var dig = ease(seg(t, 18.4, 21.4));
    /* the macrophage's membrane flows round it (8–10.5), the ends meet and it is inside, in a vesicle */
    if (t >= 8 && t < 12.5) {
      var g = ease(seg(t, 8, 10.5)), ringOp = 1 - seg(t, 10.5, 12.2), tu = Math.atan2(M1[1] - B1[1], M1[0] - B1[0]), phi = .8, N = 13;
      for (var sg = -1; sg <= 1; sg += 2) for (var j = 0; j <= N; j++) {
        var fj = j / N; if (fj * (Math.PI - phi) > g * (Math.PI - phi + .05)) continue;
        var aj = tu + sg * (phi + fj * (Math.PI - phi));
        balls.push([bp[0] + VR * Math.cos(aj), bp[1] + VR * Math.sin(aj), (10 + 2 * (1 - fj)) * ringOp]);
      }
      if (t < 10.5) lab('memb', 'its membrane flows round it', bp[0] + (VR + 8) * Math.cos(tu + phi + g * 1.4), bp[1] + (VR + 8) * Math.sin(tu + phi + g * 1.4), 'R', 3);
    }
    out += D.membrane({ id: 'ixMb', balls: balls, edge: '#5E8F5A', rim: '#B0D4AD', fill: '#CCE1C3' }) + D.inside('macrophage', Mx[0] - 6, Mx[1] + 4, MS);
    /* the vesicle round the bacterium, from when the membrane has closed until its antigen pieces have left it (10.5–25) */
    if (t >= 10.5 && t < 25) {
      var vo = Math.min(seg(t, 10.5, 12), 1 - seg(t, 23, 25));
      out += '<circle class="ix__ves" cx="' + n1(bp[0]) + '" cy="' + n1(bp[1]) + '" r="' + VR + '" opacity="' + n1(vo * 100) / 100 + '"/>';
      if (t >= 12.5 && t < 15) lab('ves', 'vesicle', bp[0] + VR * .72, bp[1] - VR * .72, 'R', 2);
    }
    /* lysosomes: small vesicles that contain enzymes, there from the start (Daniel, 4 Nov 2026: "the lysosomes are vesicles,
       and they contain the enzymes … the enzymes are released inside the vesicle"). Each moves to the vesicle (15–), its
       membrane fuses with the vesicle's (it becomes part of it), and its enzymes go into the vesicle and spread there. */
    var ENZ = [];
    LYS.forEach(function (q, i) {
      var home = [Mx[0] + q[0], Mx[1] + q[1]], ang = Math.atan2(home[1] - IN[1], home[0] - IN[0]), u = [Math.cos(ang), Math.sin(ang)];
      var t0 = 15 + i * .45, k1 = ease(seg(t, t0, t0 + 1.6)), k2 = ease(seg(t, t0 + 1.6, t0 + 2.6));
      var touch = [bp[0] + (VR + 8) * u[0], bp[1] + (VR + 8) * u[1]], onEdge = [bp[0] + VR * u[0], bp[1] + VR * u[1]];
      var c = pt(pt(home, touch, k1), onEdge, k2), lr = 11 * (1 - k2);
      if (lr > .3) out += '<circle class="ix__lys" cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" r="' + n1(lr) + '"/>';
      for (var e = 0; e < 3; e++) {
        var ea = ang + Math.PI + (e - 1) * .5, inLys = [c[0] + 4.5 * (1 - k2) * Math.cos(e * 2.1), c[1] + 4.5 * (1 - k2) * Math.sin(e * 2.1)];
        var spread = ease(seg(t, t0 + 2.2, t0 + 4)), deep = [bp[0] + (VR - 16) * u[0] + 18 * spread * Math.cos(ea + t * .6), bp[1] + (VR - 16) * u[1] + 18 * spread * Math.sin(ea + t * .6)];
        var ep = k2 > 0 ? pt(inLys, deep, k2) : inLys, eo = 1 - seg(t, 23, 25);
        if (eo > .02 && t < 25) ENZ.push(ep), out += '<circle class="ix__enz" cx="' + n1(ep[0]) + '" cy="' + n1(ep[1]) + '" r="2.6" opacity="' + n1(eo * 100) / 100 + '"/>';
      }
      if (i === 0 && t >= 12.5 && t < 16.2) lab('lys', 'lysosomes: vesicles that contain enzymes', c[0], c[1], 'L', 2);
    });
    if (t >= 18 && t < 20.5 && ENZ.length) lab('enz', 'enzymes, released into the vesicle', ENZ[1][0], ENZ[1][1], 'R', 3);
    /* the bacterium: its body, digested (fades and shrinks); its antigens keep their shape and stay */
    if (dig < 1) out += D.pathogen({ x: bp[0], y: bp[1], s: PSC * (1 - .35 * dig), rot: 20, kind: KIND, n: 0, fade: 1 - dig }).svg;
    if (t < 8 && t >= 6) lab('bac', 'bacterium', bp[0] + 12, bp[1] + 6, 'R', 1);
    /* the antigens: on the bacterium until 21.4, then the cell keeps three of them (pieces with the antigen's shape: the
       part a receptor fits), each held by an MHC protein (21.6–22.6) and carried to the membrane (22.6–26.6); the rest are
       digested too (21.4–22.6) */
    var KEEP = [1, 3, 6];
    REF.forEach(function (a, i) {
      var nx = a.nx, ny = a.ny, base = [bp[0] + a.x - nx * HM, bp[1] + a.y - ny * HM];
      var kept = KEEP.indexOf(i), op = kept < 0 ? 1 - seg(t, 21.4, 22.6) : 1;
      if (op < .02) return;
      if (dig > 0) {   /* loose in the vesicle: drawn a little in from where the body was */
        base = [lerp(base[0], bp[0] + (a.x - nx * HM) * .8, dig), lerp(base[1], bp[1] + (a.y - ny * HM) * .8, dig)];   /* a little in, never on each other */
      }
      var mhc = 0;
      if (kept >= 0) {
        var S = SHOW[kept], k = ease(seg(t, 22.6 + kept * .5, 26.6)), mo = seg(t, 21.6, 22.6);
        var na = Math.atan2(ny, nx), nb = S[2], da = Math.atan2(Math.sin(nb - na), Math.cos(nb - na)), an = na + da * k;
        nx = Math.cos(an); ny = Math.sin(an);
        var seat = [S[0], S[1]];
        base = pt(base, pt(Mx, seat, 1) , k);
        mhc = mo;
      }
      var rot = Math.atan2(nx, -ny) * 180 / Math.PI;
      out += '<g opacity="' + n1(op * 100) / 100 + '">' +
        (mhc > 0 ? '<path class="ix__mhc" opacity="' + n1(mhc * 100) / 100 + '" transform="translate(' + n1(base[0]) + ' ' + n1(base[1]) + ') rotate(' + n1(rot) + ')" d="M-8 5 L-8 -4 L-3.5 -4 L-3.5 1.5 L3.5 1.5 L3.5 -4 L8 -4 L8 5 Z"/>' : '') +
        D.antigen(KIND, base[0], base[1], nx, ny) + '</g>';
      if (i === 3 && t >= 6 && t < 8) lab('ag', 'antigens', bp[0] + a.x, bp[1] + a.y, 'R', 2);
      if (i === 6 && t >= 21 && t < 22.6) lab('agk', 'antigen pieces, kept: the same shape', base[0] + nx * HM, base[1] + ny * HM, 'R', 3);
    });
    /* each step names its own parts only: the pieces and the MHC proteins in step 4 */
    if (t >= 27 && t < 30.5) { lab('agp', 'antigen pieces, displayed', SHOW[0][0] + (HM - 4) * Math.cos(SHOW[0][2]), SHOW[0][1] + (HM - 4) * Math.sin(SHOW[0][2]), 'R', 2); lab('mhc', 'MHC protein', SHOW[2][0], SHOW[2][1], 'R', 3); }
    /* the helper T-cell: comes, its receptor fits a displayed piece (30–34), releases cytokines (34–38), goes to the B-cell (42–45) */
    if (t >= 30) {
      var tk = ease(seg(t, 30, 33.5)), Tx = t < 42 ? pt(T0, T1, tk) : pt(T1, T2, ease(seg(t, 42, 45)));
      out += art('t-lymph', Tx[0], Tx[1], 1.0) + (t >= 33 && t < 42 ? '<circle class="im__glow" cx="' + n1(Tx[0]) + '" cy="' + n1(Tx[1]) + '" r="54" opacity="' + n1(seg(t, 33, 34.5) * 50) / 100 + '"/>' : '');
      /* its receptor: a cup round the antigen piece it fits, on the T-cell's side, once it has bound */
      if (t >= 33.5 && t < 42) {
        /* round the displayed antigen's head: the head's flat side is 8 out from the membrane, its dome 9 more */
        var ra = SHOW[1][2], px = SHOW[1][0] + 8 * Math.cos(ra), py = SHOW[1][1] + 8 * Math.sin(ra), q = [];
        for (var qi = 0; qi <= 14; qi++) { var qa = ra - Math.PI / 2 + Math.PI * qi / 14; q.push(n1(px + 13 * Math.cos(qa)) + ' ' + n1(py + 13 * Math.sin(qa))); }
        out += '<path class="ix__rec" opacity="' + n1(seg(t, 33.5, 34.5) * 100) / 100 + '" d="M' + q.join(' L') + '"/>';
      }
      if (t >= 33.5 && t < 46) lab('th', t >= 42 ? 'helper T-cell' : 'helper T-lymphocyte, activated', Tx[0] + 12, Tx[1] - 44, 'R', 2);   /* high on the cell, a row above its receptor */
      if (t >= 34.5 && t < 38) lab('rec', 'its receptor fits the antigen', SHOW[1][0] + 21 * Math.cos(SHOW[1][2]), SHOW[1][1] + 21 * Math.sin(SHOW[1][2]), 'R', 3);
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
      /* its own antibodies on its surface; the third is turned to the antigen it will bind */
      [[-40, -22, -60], [44, -10, 60], [BAB[0], BAB[1], BPOSE.rot]].forEach(function (q, i) {
        out += D.antibody({ x: Bx[0] + q[0], y: Bx[1] + q[1], rot: q[2], s: .34, kind: KIND });
      });
      /* a whole antigen, on another bacterium of the same kind, comes to that antibody and binds (40–42): a B-cell binds
         intact antigen (C3.2.8: "direct interaction with the specific antigen"), not the pieces a macrophage displays */
      var bend = [Bx[0] + BAB[0] - BPOSE.x, Bx[1] + BAB[1] - BPOSE.y], bb = pt([bend[0] - 80, bend[1] + 70], bend, ease(seg(t, 40, 42)));
      var bo = Math.min(seg(t, 40, 40.6), 1 - seg(t, 46, 47));
      if (t >= 40 && bo > .02) out += '<g opacity="' + n1(bo * 100) / 100 + '">' + D.pathogen({ x: bb[0], y: bb[1], s: .2, rot: BROT, kind: KIND, n: 8 }).svg + '</g>';
      if (t >= 40) lab('bc', t >= 46 ? 'B-cell, activated' : 'B-lymphocyte', Bx[0] + 40, Bx[1] + 10, 'R', 2);
      /* named at the bacterium's far side, so the name's line never crosses it */
      if (t >= 42 && t < 46) lab('bab', 'a bacterium: its antigen binds', bb[0] - 14, bb[1], 'L', 3);
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
    { h: 'Enzymes from lysosomes digest it', tag: 'Extension · IB C3.2.5', p: '**Lysosomes** are small vesicles that contain **enzymes**. They fuse with the vesicle and release their enzymes into it. The enzymes digest the bacterium, but pieces of its **antigens** are kept, with the same shape.' },
    { h: 'The macrophage displays the antigens', tag: 'Extension · beyond IB', p: '**MHC proteins** carry the antigen pieces to the cell membrane and hold them on the outside, where other cells can meet their shape. This is **antigen presentation**.' },
    { h: 'A helper T-cell is activated', tag: 'Extension · IB C3.2.8 · cytokines beyond IB', p: 'A **helper T-lymphocyte** whose **receptor** fits these antigen pieces binds to them, and is **activated**. It releases **cytokines**: signalling proteins that act on other cells of the immune system.' },
    { h: 'A B-cell is activated', tag: 'Extension · IB C3.2.8', p: 'A **B-lymphocyte** carries antibodies of one shape on its surface. If they fit this antigen, it binds the antigen **directly**, here on another bacterium of the same kind. It is **activated** only when it also has **contact with a helper T-cell** activated by the same antigen.' },
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
      ['The cells are Servier Medical Art (CC BY 4.0, adapted); a plasma cell is drawn as a larger B-lymphocyte. The vesicle, the lysosomes, the enzymes, the MHC proteins and the cytokines are drawn for this lab, far larger than real. The macrophage is drawn about five times as long as the bacterium; in life it is about ten times. In life the enzymes cut the antigens into short pieces; each piece the macrophage displays keeps part of the antigen\u2019s shape, the part a receptor fits, so each is drawn here as the antigen itself.']
    ], function (Dw, nar) {
      narrow = nar;
      var m = K.margins(nar, 13, 13, 110, 110);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }

  /* the IB version of "The first meeting": shown by the switch above it (fmswitch), never on its own */
  function immext(spec) {
    var box = build(spec), head = box.firstChild;
    box.classList.add('ixw'); box.hidden = true;
    box.insertBefore(h('p', 'ixg__p', '<b>Extension.</b> Beyond the 0610 syllabus, which does not list these cells or steps. ' +
      'IB Biology (C3.2) asks most of it; two steps go beyond IB, and each step says which.'), head.nextSibling);
    return box;
  }
  /* "The first meeting" in two versions (Daniel, 4 Nov 2026: "a toggle that shows the easy animation for IGCSE and the more
     complex one … for IB"): IGCSE first; the IB one is the extension. Showing one hides the other; a hidden animation gives
     the picture column back by itself (the stage watches only what is on screen). */
  function fmswitch(spec) {
    var bar = h('div', 'vbar fmsw'); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Which version of the first meeting');
    var bI = h('button', 'fmsw__b', 'IGCSE: the first meeting'), bX = h('button', 'fmsw__b fmsw__b--ib', 'IB Biology (extension): how antibodies are made');
    [bI, bX].forEach(function (b) { b.type = 'button'; bar.appendChild(b); });
    function boxes() {
      var a = null, x = null, n = bar.nextElementSibling;
      while (n && (!a || !x)) { if (n.classList.contains('ixw')) x = n; else if (n.classList.contains('widget') && n.classList.contains('im')) a = a || n; n = n.nextElementSibling; }
      return { a: a, x: x };
    }
    function pick(ib) {
      var B = boxes(); if (!B.a || !B.x) return;
      B.a.hidden = ib; B.x.hidden = !ib;
      bI.setAttribute('aria-pressed', ib ? 'false' : 'true'); bX.setAttribute('aria-pressed', ib ? 'true' : 'false');
      var shown = ib ? B.x : B.a; if (shown.__onMove) shown.__onMove();
    }
    bI.addEventListener('click', function () { pick(false); });
    bX.addEventListener('click', function () { pick(true); });
    bI.setAttribute('aria-pressed', 'true'); bX.setAttribute('aria-pressed', 'false');
    return bar;
  }
  /* "Where do the antibody shapes come from?": a note under the two versions of the first meeting, visible in both (Daniel,
     4 Nov 2026: "add this information … about the shapes … as a note … that is visible … very interesting for the
     students"). Beyond the 0610 syllabus, and true: clonal selection (Burnet 1957), one cell one antibody (Nossal and
     Lederberg 1958), antibody genes joined at random (Tonegawa, Nobel Prize 1987), self-reactive lymphocytes removed, and
     affinity maturation after the first meeting. Plain words for EAL pupils; the analogy last. */
  function shapesnote() {
    var box = h('div', 'widget fmnote');
    box.innerHTML = '<p class="fmnote__h">Where do the antibody shapes come from? <span class="fmnote__tag">Beyond the 0610 syllabus</span></p>' +
      '<p>A lymphocyte does not learn a shape from the pathogen. Each new <b>lymphocyte</b>, while it is made in the bone marrow, joins pieces of its antibody genes in a random order. So each lymphocyte makes <b>antibodies</b> of one shape only, and the body has millions of different shapes before it meets any pathogen (Susumu Tonegawa, Nobel Prize 1987).</p>' +
      '<p>When a pathogen enters, its <b>antigens</b> bind only to the few lymphocytes whose antibodies already fit. Only these are stimulated: they divide, and some of their copies stay as <b>memory cells</b>. This is <b>clonal selection</b>. A pathogen has many different antigens, so it stimulates many different lymphocytes; but one lymphocyte, and every copy of it, makes antibodies of one shape only.</p>' +
      '<p>Two clues that the shapes are made first: people can make antibodies against chemicals made in a laboratory, which no pathogen has; and the body destroys young lymphocytes whose antibodies fit its own cells.</p>' +
      '<p>After the first meeting, the dividing cells change their antibody genes a little, and the cells whose antibodies fit best are kept. So memory cells fit the antigen better than the first lymphocytes did.</p>' +
      '<p class="fmnote__an">Think of a locksmith who cuts millions of different keys before any lock arrives. The lock (the antigen) finds the key that fits, and that key is copied many times. Some copies are kept for next time: the memory cells.</p>';
    return box;
  }
  L.add('immext', immext);
  L.add('fmswitch', fmswitch);
  L.add('shapesnote', shapesnote);
})(window);
