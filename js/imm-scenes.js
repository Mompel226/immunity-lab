/* ============================================================
   imm-scenes.js — pictures this lab draws (not files): a station's view names one as `draw` (js/views/figure.js), and
   a question may show one by name (`svg: 'gut#plain'`, js/learn.js DIAGRAMS).

   antibodies  station 4's picture, the T10 summary's figure in this lab's drawings: a lymphocyte makes antibodies;
               they fit the antigens of pathogen A (bound to them), not those of pathogen B.
   gut         Servier Medical Art's digestive system (CC BY 4.0, adapted), for a question: where the toxin acts.
   ============================================================ */
(function (global) {
  'use strict';
  var D = global.ImmDraw;
  function antibodies() {
    var A = D.pathogen({ x: 330, y: 118, s: .62, rot: -8, kind: 'tri', n: 11, phase: 1 });
    var B = D.pathogen({ x: 336, y: 306, s: .56, rot: 8, kind: 'round', n: 11, phase: 2 });
    var out = '<rect x="0" y="0" width="480" height="400" rx="14" class="im__plasma"/>' + D.cell('lymphocyte', 96, 112, .82) + A.svg + B.svg;
    [[0, 'R'], [3, 'L'], [6, 'R'], [9, 'L']].forEach(function (b) { var p = D.bound(A.antigens[b[0]], 'tri', .8, b[1]); out += D.antibody({ x: p.x, y: p.y, rot: p.rot, s: .8, kind: 'tri' }); });
    [[104, 300, 70], [156, 262, 110], [186, 330, 80], [72, 248, 95]].forEach(function (f) { out += D.antibody({ x: f[0], y: f[1], rot: f[2], s: .8, kind: 'tri' }); });
    /* the antigen named: the highest on the right of pathogen A, its head; pathogen A named lower down its body */
    var right = A.antigens.filter(function (a) { return a.nx > .35; });
    var ag = right.reduce(function (m, a) { return a.y < m.y ? a : m; });
    return { w: 480, h: 400, svg: out,
      pts: { lymphocyte: [60, 112, 'L'], antibody: [104, 296, 'L'], antigen: [ag.x - ag.nx * 6, ag.y - ag.ny * 6, 'R'], pathA: [372, 142, 'R'], pathB: [376, 312, 'R'] },
      alts: { antigen: right.map(function (a) { return [a.x - a.nx * 6, a.y - a.ny * 6]; }), pathA: [[360, 120], [380, 132], [350, 150]], pathB: [[360, 300], [380, 320]] } };
  }
  var MEMO = {};
  global.ImmScenes = { get: function (name) { if (!MEMO[name]) MEMO[name] = name === 'antibodies' ? antibodies() : null; return MEMO[name]; } };
  if (global.CircLearn && global.CircLearn.diagram) global.CircLearn.diagram('gut', function () {
    return '<svg class="hs__fig" viewBox="0 0 163 236" role="img" aria-label="The human alimentary canal and the organs round it">' +
      '<image href="assets/photos/sv-gut.svg" x="0" y="0" width="163" height="236"/></svg>';
  });
})(window);
