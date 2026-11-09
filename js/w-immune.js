/* ============================================================
   w-immune.js — two step animations in the blood, on one small scene engine:

     firstmeet  "The first meeting" (station `antibodies`): a pathogen enters for the first time; the body already has
                lymphocytes for many shapes (clonal selection) but no memory cells (MS 0610/42/O/N/16 Q5(d): "memory cells
                produced in first infection"; its stem: "some of these lymphocytes are activated"); an antigen binds to the antibody on the surface of the one
                whose antibodies are complementary, and only that one is stimulated; it divides while the pathogens
                reproduce (the person is ill); the cells that do not stay as memory cells release antibodies; the
                antibodies bind: some pathogens are destroyed directly, the others are marked and engulfed by phagocytes;
                the antibodies left over are broken down; memory cells stay; the same pathogen returns, the memory cells
                divide quickly, and more antibodies, sooner, destroy it before the person becomes ill. The steps are the
                T10 summary's five steps (and its first sentence after them). The audit of 4 Nov 2026 added the binding,
                the reproducing, the left-over antibodies and the second division.
     vacsteps   "Vaccination, step by step" (station `vaccination`): 10.1.11 (a), (b), (c), then the real pathogen, with
                the same binding, left-over antibodies and second division.

   Every frame is a pure function of the time t (WKit.mount gives box.__seek). Each actor has keyframes; an antibody
   that binds is drawn, from that moment, inside its pathogen's own group, so it stays bound when the pathogen moves.

   SOURCES. Syllabus 0610 2026–2028 10.1.6–10.1.11 (Supplement), word for word in the steps where it has words. The T10
   summary's table "What happens when a pathogen first enters the body" (checked against MS 0610/41/O/N/20 Q2(a) and
   MS 0610/41/O/N/24 Q3(d)). Bold words are the schemes' marking words: antigens, specific / complementary shape,
   lymphocytes, antibodies, bind, phagocytes, engulf, digest, memory cells, active immunity, weakened.
   The drawings: js/imm-draw.js (Servier Medical Art cells, CC BY 4.0, adapted). Antibodies and antigens are drawn far
   larger than real (an antibody is about 10 nm across; a bacterium about 2 µm long), so their shapes show.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.ImmDraw;
  if (!L || !K || !D) return;
  var h = L.h, n1 = K.n1, seg = K.seg, ease = K.ease, lerp = K.lerp, clamp01 = K.clamp01;
  var W = 420, H = 560;
  /* the scripts below are written on a 480 × 430 sheet; the column is taller than it is wide, so the sheet is stretched to
     W × H (the cells and the pathogens keep their own shapes and sizes: only their places move) */
  var FX = W / 480, FY = H / 430;

  /* ---------- keyframes ---------- */
  function at(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (var i = 1; i < keys.length; i++) if (t < keys[i][0]) {
      var a = keys[i - 1], b = keys[i], k = ease(seg(t, a[0], b[0])), o = {};
      for (var p in b[1]) o[p] = typeof b[1][p] === 'number' && typeof a[1][p] === 'number' ? lerp(a[1][p], b[1][p], k) : (k < .5 ? a[1][p] : b[1][p]);
      for (p in a[1]) if (!(p in o)) o[p] = a[1][p];
      return o;
    }
    return keys[keys.length - 1][1];
  }

  /* ---------- a scene: lymphocytes, pathogens, antibodies, phagocytes ---------- */
  /* the drawings' scales: lymphocyte, pathogen, antibody. Sizes nearer to life (Daniel, 4 Nov 2026: the pathogens were drawn
     larger than the cells): the pathogen has the scale it has everywhere in the lab (.2: about 50 units long), a lymphocyte
     is about 1.7 times as long and a phagocyte about 3 times (life: about 3.5 and 6); the antigens and antibodies stay
     larger than real, so their shapes show */
  var LS = .52, PS = .2, AS = .62;
  /* a phagocyte that engulfs: its radius, its vacuole's radius, how far the vacuole stands from the pathogen's centre (towards
     the antibodies it binds) and from the cell's centre, and the scale of Servier's neutrophil inside it (defences.js: 62 ↔ .74) */
  var RN = 74, RV = 58, VOFF = 14, COFF = 12, NIN = .88;
  function lymph(x, y, kind, keys) { return { type: 'lym', kind: kind, keys: keys || [[0, { x: x, y: y, op: 1, glow: 0 }]] }; }
  function pathogenActor(kind, keys, ag) { return { type: 'pg', kind: kind, keys: keys, ag: ag }; }

  function remap(script) {
    function mv(o) { if (o.x != null) o.x *= FX; if (o.y != null) o.y *= FY; }
    script.pgs.concat(script.lyms, script.phas).forEach(function (a) { a.keys.forEach(function (k) { mv(k[1]); }); });
    script.abs.forEach(function (a) { a.x0 *= FX; a.y0 *= FY; if (a.x1 != null) a.x1 *= FX; if (a.y1 != null) a.y1 *= FY; });
    return script;
  }
  /* a pathogen that meets the matching lymphocyte (P.meet: { lym, t: [leaves, arrives, stays until, back] }, after remap):
     one of its antigens comes to sit in the cup of the small antibody on that lymphocyte's surface (the badge render draws),
     so the lymphocyte is stimulated by the antigen binding to it, never from a distance (the audit of 4 Nov 2026). The
     pathogen is turned, within ±24°, so that antigen points straight into the cup. */
  var BADGE = { dx: 30, dy: 28, rot: 20, s: .42 };
  function meetAt(P, script) {
    var ls = at(script.lyms[P.meet.lym].keys, P.meet.t[1]);
    var r = BADGE.rot * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r), A = 36 * Math.PI / 180;
    var tip = [Math.sin(A) * 24, -26 - Math.cos(A) * 24];                                   /* the right arm's cup (imm-draw.js) */
    var cup = [ls.x + BADGE.dx + (tip[0] * c - tip[1] * sn) * BADGE.s, ls.y + BADGE.dy + (tip[0] * sn + tip[1] * c) * BADGE.s];
    var out = [Math.sin(A) * c + Math.cos(A) * sn, Math.sin(A) * sn - Math.cos(A) * c];      /* the way the cup opens */
    var best = null;
    for (var dr = -24; dr <= 24; dr += .5) {
      D.pathogen({ x: 0, y: 0, s: PS, rot: (P.rot || 0) + dr, kind: P.kind, n: P.n || 9, phase: P.phase || 0 }).antigens.forEach(function (a) {
        var e = 1 + (a.nx * out[0] + a.ny * out[1]) + Math.abs(dr) * .0004;               /* 0 when the antigen points into the cup */
        if (!best || e < best.e) best = { e: e, rot: (P.rot || 0) + dr, a: a };
      });
    }
    P.rot = best.rot;
    var t = P.meet.t, home = at(P.keys, t[0]), from = {}, k;
    for (k in home) from[k] = home[k];
    var there = { x: cup[0] - best.a.x, y: cup[1] - best.a.y, op: 1, g: 1 };
    P.keys = P.keys.concat([[t[0], from], [t[1], there], [t[2], there], [t[3], from]]).sort(function (x, y) { return x[0] - y[0]; });
  }
  function build(script) {
    remap(script);
    /* each pathogen: its local drawing and its antigens, made once */
    script.pgs.forEach(function (P) {
      if (P.meet) meetAt(P, script);
      var d = D.pathogen({ x: 0, y: 0, s: PS, rot: P.rot || 0, kind: P.kind, n: P.n || 9, phase: P.phase || 0 });
      P.local = d; P.ags = d.antigens;
    });
    /* a phagocyte's places, from its pathogen's place when it arrives: it touches the antibodies' feet (the antibodies and
       antigens reach about 72 from the pathogen's centre), then moves over the pathogen until its vacuole holds it */
    script.phas.forEach(function (F) {
      if (F.eat == null) return;
      var P = script.pgs[F.eat], p0 = at(P.keys, F.t[1]), u = F.u, T = F.t;
      function along(d) { return { x: p0.x + d * u[0], y: p0.y + d * u[1] }; }
      var enter = along(228), touch = along(72 + RN - 6), fin = along(VOFF + COFF);
      F.p0 = [p0.x, p0.y]; P.eatenAt = T[1];
      F.keys = [[0, { x: enter.x, y: enter.y, op: 0 }], [T[0], { x: enter.x, y: enter.y, op: 0 }], [T[0] + .7, { x: lerp(enter.x, touch.x, .3), y: lerp(enter.y, touch.y, .3), op: 1 }],
        [T[1], { x: touch.x, y: touch.y, op: 1 }], [T[2], { x: fin.x, y: fin.y, op: 1 }], [T[4] + .6, { x: fin.x, y: fin.y, op: 1 }], [T[5], { x: enter.x, y: enter.y, op: 0 }]];
      /* its pathogen's antibodies bind the antigens that face the phagocyte (A.face: the first or second best) */
      var rank = P.ags.map(function (a, k) { return [k, a.nx * u[0] + a.ny * u[1]]; }).sort(function (x, y) { return y[1] - x[1]; });
      script.abs.forEach(function (A) { if (A.on === F.eat && A.face) A.ag = rank[A.face - 1][0]; });
    });
    /* each antibody that binds: its pose in its pathogen's own frame */
    script.abs.forEach(function (A) {
      if (A.on == null) return;
      var P = script.pgs[A.on], ag = P.ags[A.ag % P.ags.length];
      A.pose = D.bound(ag, P.kind, AS, A.arm || 'R');
    });
    return script;
  }
  function pgState(P, t) { return at(P.keys, t); }
  function worldOf(P, t, pose) {
    var s = pgState(P, t), g = s.g == null ? 1 : s.g;
    return { x: s.x + pose.x * g, y: s.y + pose.y * g, rot: pose.rot };
  }

  function render(script, t, lay, narrow) {
    var out = '', labels = [];
    var vis = function (o) { return o.op == null || o.op > .02; };
    /* lymphocytes and their copies (memory cells are lymphocytes too, ringed in the steps that name them) */
    script.lyms.forEach(function (Lm, i) {
      var s = at(Lm.keys, t); if (!vis(s)) return;
      var glow = s.glow || 0;
      out += '<g opacity="' + n1((s.op == null ? 1 : s.op) * 100) / 100 + '">' +
        (glow > .02 ? '<circle cx="' + n1(s.x) + '" cy="' + n1(s.y) + '" r="' + n1(50 * (s.sc || 1)) + '" class="im__glow" opacity="' + n1(glow * 100) / 100 + '"/>' : '') +
        (s.mem ? '<circle cx="' + n1(s.x) + '" cy="' + n1(s.y) + '" r="' + n1(48 * (s.sc || 1)) + '" class="im__mem" opacity="' + n1(s.mem * 100) / 100 + '"/>' : '') +
        D.cell('lymphocyte', s.x, s.y, LS * (s.sc || 1)) +
        /* which antibody this lymphocyte makes: a small one of its kind beside it */
        D.antibody({ x: s.x + 30 * (s.sc || 1), y: s.y + 28 * (s.sc || 1), rot: 20, s: .42 * (s.sc || 1), kind: Lm.kind, cls: 'im__badge' }) + '</g>';
      if ((s.op == null ? 1 : s.op) > .6 && (!Lm.nolabel || s.mem > .5)) labels.push({ id: s.mem > .5 ? 'mem' : 'lym', text: s.mem > .5 ? 'memory cell' : 'lymphocyte', x: s.x - 30, y: s.y, side: 'L', pri: s.mem > .5 ? 2 : 0, alts: [[s.x - 20, s.y - 22], [s.x - 20, s.y + 22]] });
    });
    /* phagocytes */
    /* phagocytes: each comes to its marked pathogen from the side its antibodies face, binds them, and its membrane flows
       round the pathogen while the cell moves over it; the pathogen is then inside, in a vacuole, is digested, and the
       vacuole goes (the defences' White blood cells, the same drawing: ImmDraw.membrane round Servier's inside) */
    script.phas.forEach(function (F, fi) {
      var s = at(F.keys, t); if (!vis(s)) return;
      var T = F.t, u = F.u, Vc = [F.p0[0] + VOFF * u[0], F.p0[1] + VOFF * u[1]], op = s.op == null ? 1 : s.op;
      var cw = t < T[2] ? 1 : t > T[4] + .6 ? seg(t, T[4] + .6, T[4] + 1.4) : 1 - seg(t, T[2], T[2] + .8);
      var balls = [[s.x, s.y, RN]];
      for (var i = 0; i < 7; i++) {
        var a = i * .898 + .3, w = (1.5 + 4 * cw) * Math.sin(t * 2.2 + i * 1.9);
        balls.push([s.x + (RN - 24) * Math.cos(a), s.y + (RN - 24) * Math.sin(a), 24 + w]);
      }
      var g = ease(seg(t, T[1], T[2])), ringOp = 1 - seg(t, T[2], T[3]);
      if (t >= T[1] && ringOp > .02) {
        var tu = Math.atan2(u[1], u[0]), phi = .7, N = 16;
        for (var sg = -1; sg <= 1; sg += 2) for (var j = 0; j <= N; j++) {
          var f = j / N; if (f * (Math.PI - phi) > g * (Math.PI - phi + .05)) continue;
          var an = tu + sg * (phi + f * (Math.PI - phi));
          balls.push([Vc[0] + RV * Math.cos(an), Vc[1] + RV * Math.sin(an), (11 + 2 * (1 - f)) * ringOp]);
        }
      }
      out += '<g opacity="' + n1(op * 100) / 100 + '">' + D.membrane({ id: 'imPh' + fi, balls: balls, edge: '#B9506B', rim: '#F797AA', fill: '#FACDD3' }) +
        D.inside('neutrophil', s.x - 7, s.y + 5, NIN);
      if (t >= T[2] && t < T[4] + .6) {
        var vr = RV - 28 * seg(t, T[3], T[4]), vo = seg(t, T[2], T[3]) * (1 - seg(t, T[4], T[4] + .6));
        out += '<circle class="dv__vac im__vac" cx="' + n1(Vc[0]) + '" cy="' + n1(Vc[1]) + '" r="' + n1(vr) + '" opacity="' + n1(vo * 100) / 100 + '"/>';
        if (t >= T[3] && t < T[4] - .4) labels.push({ id: 'vac', text: 'vacuole: the pathogen is digested', x: Vc[0] + vr * .7, y: Vc[1] - vr * .7, side: 'R', pri: 2 });
      }
      out += '</g>';
      if (op > .6) labels.push({ id: 'pha', text: 'phagocyte', x: s.x + 22, y: s.y + RN * .5, side: 'R', pri: 1, alts: [[s.x + 30, s.y + RN * .3], [s.x + 10, s.y + RN * .6]] });
    });
    /* pathogens, each with the antibodies bound to it by now */
    script.pgs.forEach(function (P, i) {
      var s = pgState(P, t); if (!vis(s)) return;
      var g = s.g == null ? 1 : s.g, inner = P.local.svg;
      script.abs.forEach(function (A) {
        if (A.on !== i || t < A.bt) return;
        inner += D.antibody({ x: A.pose.x, y: A.pose.y, rot: A.pose.rot, s: AS, kind: A.kind || P.kind });
      });
      out += '<g class="im__pg' + (s.dead > .5 ? ' is-dead' : '') + '" transform="translate(' + n1(s.x) + ' ' + n1(s.y) + ') scale(' + (Math.round(g * 1000) / 1000) + ')" opacity="' + n1((s.op == null ? 1 : s.op) * 100) / 100 + '"' +
        /* a weakened pathogen is paler than the real one: the same antigens, but it cannot cause the disease */
        (s.dead || P.weak ? ' style="filter:' + (P.weak ? 'saturate(.3) brightness(1.06) ' : '') + 'grayscale(' + n1((s.dead || 0) * 100) / 100 + ')"' : '') + '>' + inner + '</g>';
      /* named only once it is inside the frame, so the name never points at the edge (Daniel, 4 Nov 2026); the real pathogen
         after a vaccination is named as the real one, the vaccine's as weakened */
      /* a pathogen a phagocyte is engulfing is not named: the phagocyte and its vacuole are */
      if ((s.op == null ? 1 : s.op) > .25 && g > .7 && s.x < W - 30 && !(P.eatenAt != null && t >= P.eatenAt)) {
        labels.push({ id: 'pg', text: s.dead > .5 ? 'destroyed' : P.weak ? 'weakened pathogen' : P.real ? 'the real pathogen' : 'pathogen', x: s.x + 10, y: s.y, side: 'R', pri: 1, alts: [[s.x + 26, s.y + 8], [s.x - 4, s.y - 10]] });
        if (!s.dead) {
          var ag = P.ags.reduce(function (b, a) { return a.x > b.x ? a : b; });
          labels.push({ id: 'ag', text: 'antigen', x: s.x + ag.x * g, y: s.y + ag.y * g, side: 'R', pri: 2,
            alts: P.ags.filter(function (a) { return a.nx > .3; }).map(function (a) { return [s.x + a.x * g, s.y + a.y * g]; }) });
        }
      }
    });
    /* antibodies on their way */
    var shownAb = null;
    script.abs.forEach(function (A) {
      if (t < A.t0) return;
      var P = A.on != null ? script.pgs[A.on] : null;
      if (P && t >= A.bt) { if (!shownAb && pgState(P, t).op > .6 && !pgState(P, t).dead && !(P.eatenAt != null && t >= P.eatenAt)) shownAb = worldOf(P, t, A.pose); return; }
      var k = ease(seg(t, A.t0, A.bt == null ? A.t1 : A.bt));
      var end = P ? worldOf(P, A.bt, A.pose) : { x: A.x1, y: A.y1, rot: A.r1 || 0 };
      var x = lerp(A.x0, end.x, k), y = lerp(A.y0, end.y, k), r = lerp(A.r0 || 0, end.rot, k);
      var op = A.fade != null ? 1 - seg(t, A.fade, A.fade + 2) : 1;
      if (op < .02) return;
      out += D.antibody({ x: x, y: y, rot: r, s: AS, kind: A.kind || (P && P.kind) || 'tri', op: Math.min(1, seg(t, A.t0, A.t0 + .6)) * op });
      if (!shownAb && k > .3 && op > .6) shownAb = { x: x, y: y, rot: r };
    });
    if (shownAb) labels.push({ id: 'ab', text: 'antibody', x: shownAb.x, y: shownAb.y - 10, side: 'R', pri: 2 });
    return { svg: out, labels: labels };
  }

  /* ---------- the two widgets: one frame, one step list each ---------- */
  function widget(spec, title, aria, scriptOf, steps, M, notes, pills, pillAt) {
    var S = K.shell(spec, 'im', title, aria, pills);
    var svg = S.svg, NSV = K.NS;
    var bg = document.createElementNS(NSV, 'rect'); bg.setAttribute('class', 'im__bg'); svg.appendChild(bg);
    var model = document.createElementNS(NSV, 'g'); svg.appendChild(model);
    var defs = document.createElementNS(NSV, 'defs'), cp = document.createElementNS(NSV, 'clipPath'), cr = document.createElementNS(NSV, 'rect');
    var cid = 'imc' + Math.random().toString(36).slice(2, 7); cp.setAttribute('id', cid); cp.appendChild(cr); defs.appendChild(cp); svg.insertBefore(defs, bg);
    var plasma = '<rect class="im__plasma" x="0" y="0" width="' + W + '" height="' + H + '" rx="16"/>';
    var gArt = document.createElementNS(NSV, 'g'); gArt.setAttribute('clip-path', 'url(#' + cid + ')'); model.appendChild(gArt);
    var gLab = document.createElementNS(NSV, 'g'); svg.appendChild(gLab);
    var script = build(scriptOf()), lay = null, narrow = false, key = K.pinKey(S);
    /* each step: its motion, then a short beat; a single step stops where its picture stops (WKit.timeline) */
    var TL = K.timeline(M, null, MOTION, title), R = TL.R, clock = TL.clock;
    /* one name per kind of thing: the first of each is enough to teach it (K.itemsOf keeps the first of each id) */
    var itemsAt = K.itemsOf(function () { return lay; }, function (t) { return render(script, clock(t), lay, narrow).labels; }), memo = {};
    function draw(t, still) {
      var mt = clock(t), r = render(script, mt, lay, narrow);
      gArt.innerHTML = plasma + r.svg;
      var items = itemsAt(t);
      /* Reduce motion: the step's still also names what came and went during the step (CircLearn.stillItems) */
      items = L.stillItems(still, itemsAt, items, t, memo, narrow + '|' + lay.f);
      gLab.innerHTML = K.names(lay, items, narrow, key, null, 6);
      if (pillAt) pillAt(mt, S);
    }
    var sp = L.stepper({ steps: K.readerSteps(steps, R), end: TL.end, render: draw, flow: TL.flow, stills: K.stillsOf(steps, TL) });
    return K.mount(S, sp, 'im', notes, function (Dw, nar) {
      narrow = nar;
      var m = K.margins(nar, 11, 11, 96, 96);
      lay = K.frameOf(svg, bg, model, cr, { x0: 0, x1: W, y0: 0, y1: H }, false, Dw, m[0], m[1], m[2], m[3], 14.5);
    });
  }

  /* ================================================================
     firstmeet — a pathogen enters the body for the first time
     ================================================================ */
  /* Each step's words in parts with their level (Daniel, 8 Nov 2026: "exactly what is IGCSE and what is IB and what is
     beyond"; memory animations-in-their-own-card). Every line here is IGCSE: 0610 10.1.6–10.1.10 and 9.4.6, or a
     point the 0610 mark schemes in the header credit (the clonal start: 0610/42/O/N/16 Q5(d) and its stem). */
  var FM_STEPS = [
    { t: 0,  h: 'A pathogen enters the body', p: [['ig', 'A pathogen enters the blood. It has **antigens** on its surface, with a **specific shape**. Each lymphocyte makes antibodies of one shape only: the small antibody beside each shows which. The body already has lymphocytes for many different shapes, but **no memory cells** yet: only a few lymphocytes have the shape that fits.']] },
    { t: 8,  h: 'The matching lymphocytes are stimulated', p: [['ig', 'Only the **lymphocytes** that make antibodies with a shape **complementary** to these antigens are **stimulated**: an antigen binds to the antibody on the lymphocyte’s surface. The others are not.']] },
    { t: 14, h: 'They divide', p: [['ig', 'The stimulated lymphocytes **divide**, so there are many cells that make this one antibody. This takes days. Meanwhile the pathogens **reproduce**, so the person is **ill** for a few days.']] },
    { t: 22, h: 'They release antibodies', p: [['ig', 'The lymphocytes release many of these **antibodies**. Antibodies are **proteins**, not cells.']] },
    { t: 30, still: 36, h: 'The antibodies bind to the antigens', p: [['ig', 'The antibodies **bind to the antigens**: their shapes fit. Some pathogens are **destroyed directly**; the others are **marked**.']] },
    { t: 38, h: 'Phagocytes engulf the marked pathogens', p: [['ig', '**Phagocytes engulf** the marked pathogens: the membrane flows round each one, so it is inside the phagocyte, in a vacuole. Enzymes **digest** it. The person recovers.']] },
    { t: 48, h: 'Memory cells stay in the blood', p: [['ig', 'Some of the lymphocytes stay in the blood as **memory cells**. Most of the antibodies are broken down, so their number in the blood falls.']] },
    { t: 56, h: 'The same pathogen returns', p: [['ig', 'If the same pathogen returns, the **memory cells** divide quickly and make antibodies **faster** and in **larger numbers**, so the pathogen is destroyed **before the person becomes ill**. This is **active immunity**.']] }
  ];
  var FM_M = [0, 8, 14, 22, 30, 38, 48, 56, 68];
  /* `still` (Reduce motion): the step's still in the model's time, where all its parts are drawn: step 5 at 36, while the
     pathogen the antibodies destroyed directly is still there (it fades from 35.6 to 37.4); the others stop on their end */
  /* how long each step's picture really moves, in the model's seconds: written and checked by tools/motion.mjs (WKit.timeline) */
  var MOTION = {"The first meeting":[7.25,5.2,7.7,8,8,10,5,10.6],"Vaccination, step by step":[6.8,8,10,3.8,11.6]};
  function fmScript() {
    var P = [[410, 92, -12], [384, 216, 8], [384, 330, 20]];   /* to the right, so their new copies fit beside them in step 3, and the phagocytes fit in step 6 */
    var pgs = P.map(function (p, i) {
      var keys = [[0, { x: 540, y: p[1] + 10, op: 0, g: 1 }], [1.2 + i * .8, { x: 520, y: p[1], op: 1, g: 1 }], [6.5 + i * .4, { x: p[0], y: p[1], op: 1, g: 1 }]];
      if (i === 0) keys.push([34.4, { x: p[0], y: p[1], op: 1, g: 1, dead: 0 }], [35.6, { x: p[0], y: p[1], op: 1, g: .96, dead: 1 }], [37.4, { x: p[0], y: p[1], op: 0, g: .7, dead: 1 }]);
      /* the marked ones stay where they are while a phagocyte engulfs them, and are digested in its vacuole */
      else keys.push([44 + (i - 1) * 1.2, { x: p[0], y: p[1], op: 1, g: 1 }], [46.4 + (i - 1) * 1.2, { x: p[0], y: p[1], op: 0, g: .55 }]);
      var o = { kind: 'tri', rot: p[2], n: 9, phase: i * 2, keys: keys };
      /* step 2: this one's antigen binds to the antibody on the matching lymphocyte, which is stimulated (build: meetAt) */
      if (i === 1) o.meet = { lym: 1, t: [8.3, 9.7, 11.3, 13.2] };
      return o;
    });
    /* the same pathogen, back: three more, destroyed fast (pgs 3–5) */
    [[378, 96, 6], [408, 222, -10], [372, 342, 14]].forEach(function (p, i) {
      pgs.push({ kind: 'tri', rot: p[2], n: 9, phase: i, keys: [[0, { x: 540, y: p[1], op: 0 }], [56.2 + i * .3, { x: 540, y: p[1], op: 0 }], [57 + i * .3, { x: 520, y: p[1], op: 1 }],
        [59.6 + i * .3, { x: p[0], y: p[1], op: 1, dead: 0 }], [63.2, { x: p[0], y: p[1], op: 1, dead: 0, g: 1 }], [64.6, { x: p[0], y: p[1], op: 1, dead: 1, g: .95 }], [66.6, { x: p[0], y: p[1], op: .28, dead: 1, g: .8 }]] });
    });
    /* step 3: while the lymphocytes divide, the pathogens reproduce: each divides once (pgs 6–8), which is why the person is
       ill; the antibodies destroy the new ones directly (the audit of 4 Nov 2026) */
    [[322, 164], [326, 300], [318, 404]].forEach(function (d, i) {   /* a new cell is a little smaller (g .85) */
      var p = P[i], t0 = 15.6 + i * 1.1;
      pgs.push({ kind: 'tri', rot: p[2] + 30, n: 9, phase: i * 2 + 1, keys: [[0, { x: p[0], y: p[1], op: 0, g: .5 }], [t0, { x: p[0], y: p[1], op: 0, g: .5 }],
        [t0 + .5, { x: lerp(p[0], d[0], .25), y: lerp(p[1], d[1], .25), op: 1, g: .6 }], [t0 + 2.4, { x: d[0], y: d[1], op: 1, g: .85 }],
        [35 + i * .6, { x: d[0], y: d[1], op: 1, g: .85, dead: 0 }], [36.2 + i * .6, { x: d[0], y: d[1], op: 1, g: .82, dead: 1 }], [38 + i * .6, { x: d[0], y: d[1], op: 0, g: .6, dead: 1 }]] });
    });
    /* lymphocytes: three kinds; the middle one fits, and glows once the antigen has bound to it */
    var lyms = [
      lymph(0, 0, 'round', [[0, { x: 66, y: 84, op: 1 }], [10, { x: 66, y: 84, op: 1 }], [11.6, { x: 66, y: 84, op: .32 }], [47, { x: 66, y: 84, op: .32 }], [49, { x: 66, y: 84, op: 1 }]]),
      lymph(0, 0, 'tri',   [[0, { x: 66, y: 215, op: 1, glow: 0 }], [9.9, { x: 66, y: 215, op: 1, glow: 0 }], [10.9, { x: 66, y: 215, op: 1, glow: 1 }], [47, { x: 66, y: 215, op: 1, glow: 1 }], [49, { x: 66, y: 215, op: 1, glow: 0 }]]),
      lymph(0, 0, 'sq',    [[0, { x: 66, y: 346, op: 1 }], [10, { x: 66, y: 346, op: 1 }], [11.6, { x: 66, y: 346, op: .32 }], [47, { x: 66, y: 346, op: .32 }], [49, { x: 66, y: 346, op: 1 }]])
    ];
    /* the copies made by dividing: two stay as memory cells */
    [[172, 148, 15.5, 1], [172, 282, 17.5, 1], [252, 215, 19.5, 0]].forEach(function (c) {
      lyms.push(lymph(0, 0, 'tri', [[0, { x: 66, y: 215, op: 0, glow: 0 }], [c[2], { x: 78, y: 215, op: 0, glow: 1 }], [c[2] + 2.2, { x: c[0], y: c[1], op: 1, glow: 1 }],
        [47.5, { x: c[0], y: c[1], op: 1, glow: 1, mem: 0 }], [50, { x: c[0], y: c[1], op: c[3] ? 1 : 0, glow: 0, mem: c[3] }]]));
    });
    /* the second meeting: each memory cell divides quickly (57–59); their copies release the antibodies */
    var MEMC = [[172, 148, 252, 118], [172, 148, 252, 196], [172, 282, 252, 262], [172, 282, 252, 340]];
    MEMC.forEach(function (c, j) {
      var t0 = 57.2 + j * .3;
      lyms.push(lymph(0, 0, 'tri', [[0, { x: c[0], y: c[1], op: 0, glow: 0 }], [t0, { x: c[0] + 12, y: c[1], op: 0, glow: 1 }], [t0 + 1.4, { x: c[2], y: c[3], op: 1, glow: 1 }]]));
    });
    lyms.forEach(function (l, i) { if (i > 1) l.nolabel = true; });   /* one name, on the first; the copies are the same kind of cell */
    /* antibodies, released at 22–28 by the cells that do not stay as memory cells (memory cells do not release antibodies:
       the audit of 4 Nov 2026), bound at 30–34: two on each of the six pathogens */
    var abs = [], src = [[66, 215], [252, 215]];
    [[0, 0, 'R'], [0, 6, 'L'], [1, 1, 'R', 1], [1, 5, 'L', 2], [2, 2, 'L', 1], [2, 7, 'R', 2], [6, 0, 'R'], [6, 5, 'L'], [7, 3, 'L'], [7, 7, 'R'], [8, 1, 'R'], [8, 6, 'L']].forEach(function (b, i) {
      var s = src[i % 2];
      abs.push({ on: b[0], ag: b[1], arm: b[2], face: b[3], x0: s[0] + 30, y0: s[1], r0: 80, t0: 22.4 + i * .4, bt: 30.6 + i * .25 });
    });
    /* three more that bind nothing: they are broken down in step 7, so binding does not use antibodies up */
    [[120, 122, 40], [122, 300, -30], [232, 402, 20]].forEach(function (f, i) {
      var s = src[(i + 1) % 2];
      abs.push({ x0: s[0] + 30, y0: s[1], r0: 80, x1: f[0], y1: f[1], r1: f[2], t0: 27 + i * .3, t1: 30 + i * .3, fade: 49.4 + i * .8 });
    });
    /* the second meeting: more antibodies, sooner, from the memory cells' copies: seven on each pathogen */
    [[3, [0, 1, 2, 4, 5, 7, 8]], [4, [0, 2, 3, 4, 6, 7, 8]], [5, [1, 2, 3, 5, 6, 7, 8]]].forEach(function (q) {
      q[1].forEach(function (ag) {
        var i = abs.length, s = MEMC[i % 4];
        abs.push({ on: q[0], ag: ag, arm: i % 2 ? 'L' : 'R', x0: s[2] + 30, y0: s[3], r0: 80, t0: 58.6 + (abs.length - 15) * .1, bt: 60.8 + (abs.length - 15) * .08 });
      });
    });
    /* the phagocytes: each engulfs one marked pathogen (eat), coming from u; its times: enters, touches the antibodies,
       the membrane has closed, the vacuole is formed, digested, gone (build: eatAt works out its places) */
    var phas = [
      { eat: 1, u: [.5, -.87], t: [38.4, 40.4, 43, 43.8, 46.4, 49], keys: [[0, { x: 0, y: 0, op: 0 }]] },
      { eat: 2, u: [.5, .87], t: [39.6, 41.6, 44.2, 45, 47.6, 50.2], keys: [[0, { x: 0, y: 0, op: 0 }]] }
    ];
    return { pgs: pgs, lyms: lyms, abs: abs, phas: phas };
  }
  function fmPill(t, S) {
    S.pill('who', t < 14 ? 'infected' : t < 44 ? 'ill for a few days' : t < 56 ? 'recovered' : 'not ill', t < 14 ? 'warn' : t < 44 ? 'bad' : 'ok');
  }

  /* ================================================================
     vacsteps — vaccination, then the real pathogen
     ================================================================ */
  /* Every line IGCSE: 0610 10.1.11 (a)–(c), word for word where it has words, and 10.1.10 (the real pathogen later). */
  var VS_STEPS = [
    { t: 0,  h: 'The vaccine is put into the body', p: [['ig', '(a) **Weakened pathogens** or their **antigens** are put into the body, here by an injection. Weakened pathogens do not cause the disease in a healthy person, but they have the same antigens as the real pathogen.']] },
    { t: 8,  h: 'The antigens stimulate an immune response', p: [['ig', '(b) The **antigens stimulate an immune response** by **lymphocytes**: only the lymphocytes whose antibodies are **complementary** to the antigens are stimulated (an antigen binds to the antibody on the lymphocyte’s surface), and they divide.']] },
    { t: 16, h: 'The lymphocytes produce antibodies', p: [['ig', 'The lymphocytes **produce antibodies**, which **bind** to the antigens of the weakened pathogens, and the weakened pathogens are destroyed.']] },
    { t: 26, h: 'Memory cells are produced', p: [['ig', '(c) **Memory cells** are produced that give **long-term immunity**. Most of the antibodies are broken down.']] },
    { t: 33, h: 'Later: the real pathogen', p: [['ig', 'If the real pathogen enters the body later, the memory cells divide and make the specific antibodies **quickly**, so the pathogen is destroyed **before the person becomes ill**.']] }
  ];
  var VS_M = [0, 8, 16, 26, 33, 46];
  function vsScript() {
    var P = [[372, 96, -6], [404, 218, 10], [366, 336, 16]];
    var pgs = P.map(function (p, i) {
      var o = { kind: 'tri', rot: p[2], n: 9, phase: i * 2, weak: true,
        keys: [[0, { x: p[0] - 30, y: 20 + i * 6, op: 0, g: .9 }], [.6 + i * .6, { x: p[0] - 20, y: 30 + i * 8, op: 1, g: .9 }], [6 + i * .4, { x: p[0], y: p[1], op: 1, g: .9 }],
               [20.6 + i * .8, { x: p[0], y: p[1], op: 1, g: .9, dead: 0 }], [22.4 + i * .8, { x: p[0], y: p[1], op: 1, g: .86, dead: 1 }], [24.4 + i * .8, { x: p[0], y: p[1], op: .28, g: .8, dead: 1 }], [26.4, { x: p[0], y: p[1], op: 0, g: .7, dead: 1 }]] };
      /* step 2: its antigen binds to the antibody on the matching lymphocyte (build: meetAt) */
      if (i === 1) o.meet = { lym: 1, t: [8.3, 9.6, 10.8, 12.4] };
      return o;
    });
    [[378, 98, 4], [408, 222, -8], [370, 340, 12]].forEach(function (p, i) {
      pgs.push({ kind: 'tri', rot: p[2], n: 9, phase: i + 1, real: true, keys: [[0, { x: 540, y: p[1], op: 0 }], [33.2 + i * .3, { x: 540, y: p[1], op: 0 }], [34 + i * .3, { x: 520, y: p[1], op: 1 }],
        [37 + i * .3, { x: p[0], y: p[1], op: 1, dead: 0 }], [41, { x: p[0], y: p[1], op: 1, dead: 0, g: 1 }], [42.6, { x: p[0], y: p[1], op: 1, dead: 1, g: .95 }], [44.6, { x: p[0], y: p[1], op: .28, dead: 1, g: .8 }]] });
    });
    var lyms = [
      lymph(0, 0, 'round', [[0, { x: 66, y: 84, op: 1 }], [9.8, { x: 66, y: 84, op: 1 }], [11.2, { x: 66, y: 84, op: .32 }], [25, { x: 66, y: 84, op: .32 }], [27, { x: 66, y: 84, op: 1 }]]),
      lymph(0, 0, 'tri',   [[0, { x: 66, y: 215, op: 1, glow: 0 }], [9.8, { x: 66, y: 215, op: 1, glow: 0 }], [10.6, { x: 66, y: 215, op: 1, glow: 1 }], [25, { x: 66, y: 215, op: 1, glow: 1 }], [27, { x: 66, y: 215, op: 1, glow: 0 }]]),
      lymph(0, 0, 'sq',    [[0, { x: 66, y: 346, op: 1 }], [9.8, { x: 66, y: 346, op: 1 }], [11.2, { x: 66, y: 346, op: .32 }], [25, { x: 66, y: 346, op: .32 }], [27, { x: 66, y: 346, op: 1 }]])
    ];
    [[172, 148, 12.6, 1], [172, 282, 13.6, 1], [252, 215, 14.6, 0]].forEach(function (c) {
      lyms.push(lymph(0, 0, 'tri', [[0, { x: 66, y: 215, op: 0, glow: 0 }], [c[2], { x: 78, y: 215, op: 0, glow: 1 }], [c[2] + 2, { x: c[0], y: c[1], op: 1, glow: 1 }],
        [26, { x: c[0], y: c[1], op: 1, glow: 1, mem: 0 }], [28.4, { x: c[0], y: c[1], op: c[3] ? 1 : 0, glow: 0, mem: c[3] }]]));
    });
    /* the real pathogen: each memory cell divides quickly (35–37); their copies release the antibodies */
    var MEMC = [[172, 148, 252, 118], [172, 148, 252, 196], [172, 282, 252, 262], [172, 282, 252, 340]];
    MEMC.forEach(function (c, j) {
      var t0 = 35 + j * .3;
      lyms.push(lymph(0, 0, 'tri', [[0, { x: c[0], y: c[1], op: 0, glow: 0 }], [t0, { x: c[0] + 12, y: c[1], op: 0, glow: 1 }], [t0 + 1.4, { x: c[2], y: c[3], op: 1, glow: 1 }]]));
    });
    lyms.forEach(function (l, i) { if (i > 1) l.nolabel = true; });
    /* the first response: from the cells that do not stay as memory cells; two bind nothing and are broken down in step 4 */
    var abs = [], src = [[66, 215], [252, 215]];
    [[0, 0, 'R'], [0, 4, 'L'], [1, 1, 'R'], [1, 5, 'L'], [2, 2, 'R'], [2, 6, 'L']].forEach(function (b, i) {
      var s = src[i % 2];
      abs.push({ on: b[0], ag: b[1], arm: b[2], x0: s[0] + 30, y0: s[1], r0: 80, t0: 16.8 + i * .5, bt: 19.4 + i * .3 });
    });
    [[300, 170, 40], [296, 262, -30]].forEach(function (f, i) {
      var s = src[i % 2];
      abs.push({ x0: s[0] + 30, y0: s[1], r0: 80, x1: f[0], y1: f[1], r1: f[2], t0: 19.8 + i * .4, t1: 22.6 + i * .4, fade: 27 + i * .8 });
    });
    /* the real pathogen: more antibodies, sooner, from the memory cells' copies: six on each */
    [[3, [0, 1, 3, 4, 6, 7]], [4, [1, 2, 4, 5, 7, 8]], [5, [0, 2, 3, 5, 6, 8]]].forEach(function (q) {
      q[1].forEach(function (ag) {
        var i = abs.length - 8, s = MEMC[i % 4];
        abs.push({ on: q[0], ag: ag, arm: i % 2 ? 'L' : 'R', x0: s[2] + 30, y0: s[3], r0: 80, t0: 36.8 + i * .1, bt: 39 + i * .08 });
      });
    });
    return { pgs: pgs, lyms: lyms, abs: abs, phas: [] };
  }
  function vsPill(t, S) {
    S.pill('who', t < 33 ? 'vaccinated: not ill' : t < 44 ? 'meets the real pathogen' : 'not ill', t < 33 ? 'ok' : t < 44 ? 'warn' : 'ok');
  }

  function firstmeet(spec) {
    return widget(spec, 'The first meeting', 'A pathogen enters the blood; lymphocytes, antibodies and phagocytes respond, and memory cells stay.',
      fmScript, FM_STEPS, FM_M,
      [['Each kind of lymphocyte makes one kind of antibody: the small antibody beside each lymphocyte shows its kind. Antibodies and antigens are drawn far larger than real: an antibody is about 10 nm across, a bacterium about 2 µm long. A phagocyte engulfing a pathogen, step by step: the Circulation Lab, What blood is made of.']],
      [['who', 'The person:']], fmPill);
  }
  function vacsteps(spec) {
    return widget(spec, 'Vaccination, step by step', 'A vaccine of weakened pathogens stimulates lymphocytes to produce antibodies and memory cells; later the real pathogen is destroyed quickly.',
      vsScript, VS_STEPS, VS_M,
      [['The weakened pathogens are drawn paler than the real ones: they have the same antigens, so the same antibodies fit both. Antibodies and antigens are drawn far larger than real.']],
      [['who', 'The person:']], vsPill);
  }

  L.add('firstmeet', firstmeet);
  L.add('vacsteps', vacsteps);
})(window);
