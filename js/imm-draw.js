/* ============================================================
   imm-draw.js — the drawings this lab's pictures and animations share: one copy of each, so a pathogen, an
   antigen or an antibody looks the same in every station.

   The cells and the pathogen's body are Servier Medical Art (CC BY 4.0), from js/imm-art.js. The antigens and the
   antibodies are drawn here, because what the syllabus asks a pupil to see is their SHAPE (10.1.7, 10.1.9): each kind
   of antigen has its own head (a triangle, a disc, a square) on a short stalk on the pathogen's surface, and each
   antibody is a Y whose two arms end in a cup with exactly the opposite shape, so it fits one kind and no other.
   Antibodies are far smaller than a bacterium in life (about 10 nm against 2 µm): they are drawn larger, so they show.

   ImmDraw.pathogen(o)   a pathogen: o.x, o.y (centre), o.s (scale), o.rot (degrees), o.kind ('tri'|'round'|'sq'),
                         o.n (antigens), o.at (which points of the outline carry them), o.fade, o.dead, o.cls
                         → { svg, antigens: [{ x, y, nx, ny }] }   (the outer end of each antigen's head, and its outward direction)
   ImmDraw.antibody(o)   an antibody: o.x, o.y (its foot), o.rot, o.s, o.kind, o.cls → svg
   ImmDraw.bound(ag, kind, s, arm)   the antibody whose arm ('R' or 'L') holds that antigen: → { x, y, rot }
   ImmDraw.cell(name, x, y, s, cls)  a Servier cell, centred: 'lymphocyte' | 'neutrophil'
   ImmDraw.COL           the colour of each kind (an antigen and the antibody that fits it share it)
   ============================================================ */
(function (global) {
  'use strict';
  var ART = global.IMM_ART || {};
  function n1(v) { return Math.round(v * 10) / 10; }
  var COL = { tri: '#2E9E4F', round: '#8E44AD', sq: '#1F6FB2' };
  var EDGE = { tri: '#1B6B34', round: '#5E2A75', sq: '#154C7A' };

  /* an antigen's head, in its own frame: the stalk runs up from (0,0) to (0, -ST), the head sits on it */
  var ST = 7, HEAD = 9;
  function headPath(kind) {
    var y = -ST;
    if (kind === 'tri') return 'M' + (-HEAD) + ' ' + (y - 2) + ' L' + HEAD + ' ' + (y - 2) + ' L0 ' + (y - 2 - HEAD * 1.55) + ' Z';
    if (kind === 'sq') return 'M' + (-HEAD * .8) + ' ' + (y - 1) + ' h' + (HEAD * 1.6) + ' v' + (-HEAD * 1.6) + ' h' + (-HEAD * 1.6) + ' Z';
    return 'M' + (-HEAD) + ' ' + (y - 1) + ' A' + HEAD + ' ' + HEAD + ' 0 0 1 ' + HEAD + ' ' + (y - 1) + ' Z';
  }
  /* how far the head's outer end stands from the surface, in the antigen's own frame */
  function headTop(kind) { return kind === 'tri' ? ST + 2 + HEAD * 1.55 : kind === 'sq' ? ST + 1 + HEAD * 1.6 : ST + 1 + HEAD; }
  function antigen(kind, x, y, nx, ny, cls) {
    var a = Math.atan2(nx, -ny) * 180 / Math.PI;
    return '<g class="ag ag--' + kind + (cls ? ' ' + cls : '') + '" transform="translate(' + n1(x) + ' ' + n1(y) + ') rotate(' + n1(a) + ')">' +
      '<path class="ag__stalk" d="M0 1 V' + (-ST - 1) + '" stroke="' + EDGE[kind] + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path class="ag__head" d="' + headPath(kind) + '" fill="' + COL[kind] + '" stroke="' + EDGE[kind] + '" stroke-width="1.4" stroke-linejoin="round"/></g>';
  }

  /* ---------- the pathogen ---------- */
  function pathogen(o) {
    var P = ART.pathogen; if (!P) return { svg: '', antigens: [] };
    var s = o.s || 1, rot = (o.rot || 0) * Math.PI / 180, cx = (P.box[0] + P.box[2]) / 2, cy = (P.box[1] + P.box[3]) / 2;
    var c = Math.cos(rot), sn = Math.sin(rot);
    function tf(x, y) { var dx = (x - cx) * s, dy = (y - cy) * s; return [o.x + dx * c - dy * sn, o.y + dx * sn + dy * c]; }
    var edge = P.edge, n = o.n == null ? 10 : o.n, at = o.at;
    if (!at) { at = []; for (var i = 0; i < n; i++) at.push(Math.round(i * edge.length / n + (o.phase || 0)) % edge.length); }
    var ags = '', list = [];
    at.forEach(function (k) {
      var e = edge[k], p = tf(e[0], e[1]), nx = e[2] * c - e[3] * sn, ny = e[2] * sn + e[3] * c;
      ags += antigen(o.kind, p[0], p[1], nx, ny, o.agCls);
      var hm = headTop(o.kind);
      list.push({ x: p[0] + nx * hm, y: p[1] + ny * hm, nx: nx, ny: ny, k: k });
    });
    var body = '<g class="pg__body" transform="translate(' + n1(o.x) + ' ' + n1(o.y) + ') rotate(' + n1(o.rot || 0) + ') scale(' + s + ') translate(' + n1(-cx) + ' ' + n1(-cy) + ')">' + P.svg + '</g>';
    return { svg: '<g class="pg' + (o.cls ? ' ' + o.cls : '') + (o.dead ? ' is-dead' : '') + '"' + (o.fade != null ? ' opacity="' + n1(o.fade * 100) / 100 + '"' : '') + '>' + body + ags + '</g>',
             antigens: list, at: tf };
  }

  /* ---------- the antibody ----------
     In its own frame: the foot at (0,0), the stem up to the hinge at (0,-L1), two arms at ±36° from the stem, each L2
     long and W wide. Each arm ends in a cup whose hollow has the shape of one antigen's head, open away from the arm:
     the deepest point of the hollow is the arm's end, where the outer end of the head sits when it binds. */
  var L1 = 26, L2 = 24, W = 9, A = 36 * Math.PI / 180, CL = 1;   /* CL: the clearance round a head in its cup */
  function armTip(side) { var sg = side === 'L' ? -1 : 1; return [sg * Math.sin(A) * L2, -L1 - Math.cos(A) * L2]; }
  function cup(kind) {
    var h = HEAD + CL, t = 5.5;
    if (kind === 'tri') { var d = HEAD * 1.55 + CL * 1.5;
      return 'M' + (-h - t) + ' ' + (-d) + ' L0 ' + (t * 1.6) + ' L' + (h + t) + ' ' + (-d) + ' L' + h + ' ' + (-d) + ' L0 0 L' + (-h) + ' ' + (-d) + ' Z'; }
    if (kind === 'sq') { var a = HEAD * .8 + CL, q = HEAD * 1.6 + CL;
      return 'M' + (-a - t) + ' ' + (-q) + ' V' + t + ' H' + (a + t) + ' V' + (-q) + ' H' + a + ' V0 H' + (-a) + ' V' + (-q) + ' Z'; }
    var R = h + t;
    return 'M' + (-R) + ' ' + (-h) + ' A' + R + ' ' + R + ' 0 0 0 ' + R + ' ' + (-h) + ' L' + h + ' ' + (-h) + ' A' + h + ' ' + h + ' 0 0 1 ' + (-h) + ' ' + (-h) + ' Z';
  }
  function antibody(o) {
    /* o.plain: one grey for every kind, where the colour must not tell which antigen an antibody fits (Which antibody fits?) */
    var s = o.s || 1, k = o.kind || 'tri', col = o.plain ? '#8A97A3' : COL[k], ed = o.plain ? '#4B5864' : EDGE[k];
    function arm(side) {
      var deg = (side === 'L' ? -1 : 1) * 36;
      return '<g transform="translate(0 ' + (-L1) + ') rotate(' + deg + ')">' +
        '<rect x="' + (-W / 2) + '" y="' + (-L2 + 2) + '" width="' + W + '" height="' + (L2 + 1) + '" rx="3" fill="' + col + '" stroke="' + ed + '" stroke-width="1.3"/>' +
        '<path transform="translate(0 ' + (-L2) + ')" d="' + cup(k) + '" fill="' + col + '" stroke="' + ed + '" stroke-width="1.3" stroke-linejoin="round"/></g>';
    }
    return '<g class="ab ab--' + k + (o.cls ? ' ' + o.cls : '') + '" transform="translate(' + n1(o.x) + ' ' + n1(o.y) + ') rotate(' + n1(o.rot || 0) + ') scale(' + s + ')"' +
      (o.op != null ? ' opacity="' + n1(o.op * 100) / 100 + '"' : '') + '>' +
      '<rect x="' + (-W / 2) + '" y="' + (-L1 - 2) + '" width="' + W + '" height="' + (L1 + 2) + '" rx="3" fill="' + col + '" stroke="' + ed + '" stroke-width="1.3"/>' +
      arm('L') + arm('R') + '<rect x="' + (-W / 2 + 1.5) + '" y="' + (-L1 + 2) + '" width="2" height="' + (L1 - 5) + '" rx="1" fill="#fff" opacity=".45"/></g>';
  }
  /* where an antibody must stand for one arm to hold an antigen: the arm points at the pathogen along the antigen's
     own direction, and the deepest point of its cup sits on the outer end of the head */
  function bound(ag, kind, s, arm) {
    s = s || 1; arm = arm || 'R';
    var t = armTip(arm), d = [t[0], t[1] + L1];
    var rot = Math.atan2(-ag.ny, -ag.nx) - Math.atan2(d[1], d[0]);
    var c = Math.cos(rot), sn = Math.sin(rot);
    return { x: ag.x - (t[0] * c - t[1] * sn) * s, y: ag.y - (t[0] * sn + t[1] * c) * s, rot: rot * 180 / Math.PI };
  }

  function cell(name, x, y, s, cls) {
    var C = ART[name]; if (!C) return '';
    return '<g class="cellart cellart--' + name + (cls ? ' ' + cls : '') + '" transform="translate(' + n1(x) + ' ' + n1(y) + ') scale(' + s + ') translate(' + n1(-C.w / 2) + ' ' + n1(-C.h / 2) + ')">' + C.svg + '</g>';
  }

  /* the inside of a phagocyte without its outer outline, cytoplasm and rim, centred like cell(): the lab draws round it a
     membrane that can change shape (defences.js, w-immext.js; Daniel, 4 Nov 2026: "the cell membrane adapts"). The shapes
     are the Servier drawing's own, in their order: only the outer ones are left out. */
  var INSIDE = { neutrophil: { 0: 1, 1: 1, 2: 1, 14: 1 }, macrophage: { 0: 1, 3: 1, 6: 1 } }, insideSvg = {};
  function inside(name, x, y, s) {
    var C = ART[name]; if (!C) return '';
    if (!insideSvg[name]) { var i = -1; insideSvg[name] = C.svg.replace(/<path [^>]*\/>/g, function (m) { i++; return INSIDE[name][i] ? '' : m; }); }
    return '<g transform="translate(' + n1(x) + ' ' + n1(y) + ') scale(' + s + ') translate(' + n1(-C.w / 2) + ' ' + n1(-C.h / 2) + ')">' + insideSvg[name] + '</g>';
  }

  /* a cell membrane that can change shape: circles (balls: [[x, y, r], …]) blended into one smooth outline by a blur and a
     sharp threshold, in three layers (the edge, the rim, the cytoplasm), so it reads as one membrane round one cytoplasm. A
     ring of small circles round a pathogen makes the membrane flow round it; the space inside the ring stays empty, so the
     closed ring is the membrane of a vacuole. o: { id, balls, edge, rim, fill } (colours: the cell's own). */
  function membrane(o) {
    var id = o.id, f = function (k) { return '<filter id="' + id + k + '" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1000" height="1000">' +
      '<feGaussianBlur stdDeviation="5.5"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"/></filter>'; };
    function layer(k, col, dr) {
      return '<g filter="url(#' + id + k + ')">' + o.balls.map(function (b) { return b[2] + dr > .5 ? '<circle cx="' + n1(b[0]) + '" cy="' + n1(b[1]) + '" r="' + n1(b[2] + dr) + '" fill="' + col + '"/>' : ''; }).join('') + '</g>';
    }
    return '<defs>' + f('e') + f('r') + f('c') + '</defs>' + layer('e', o.edge, 2.6) + layer('r', o.rim, 1.2) + layer('c', o.fill, -1.4);
  }

  global.ImmDraw = { pathogen: pathogen, antibody: antibody, antigen: antigen, bound: bound, cell: cell, inside: inside, membrane: membrane, COL: COL, EDGE: EDGE, armTip: armTip,
                     L1: L1, L2: L2 };
})(window);
