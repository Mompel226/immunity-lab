/* ============================================================
   w-routes.js — "Close the routes" (station `control`, 10.1.5).

   An infected person top left, a well person top right, and between them, as the rungs of a ladder, five ways a pathogen
   is transmitted indirectly (the first station's: air, water, food, contaminated surfaces, animals): each route is one
   arrow the full width of the drawing, with its name above it, so no name ever sits on a line. The drawing is measured
   in screen pixels (its viewBox is its own width), so the names stay 14.5 px on a phone and a laptop; a long name takes
   two lines on a narrow screen (Daniel, 3 Nov 2026: no overlaps, never tiny type). Press one of the five measures of
   10.1.5: the routes it stops are closed (a red bar, the route greys), and a line says what the measure does to the
   pathogen: kills it, removes it, or keeps it away. Every measure on: no route is left. The diagram is drawn for this lab
   (Daniel asked for it in the plan of 3 Nov 2026); the two people are the Material Symbols "person" icon (Google, Apache
   License 2.0). On a wide screen the drawing stands in the picture's column and the buttons stay here.
   Each measure's effect is the T10 summary's table, in its words.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn; if (!L || !L.stage) return;
  var h = L.h, esc = L.esc, NS = 'http://www.w3.org/2000/svg';
  var PERSON = 'M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12Zm-8 8v-2.8q0-.85.438-1.563T5.6 14.55q1.55-.775 3.15-1.163T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20H4Z';
  var FONT = 14.5, LH = 18;
  var ROUTES = [
    { id: 'air', name: 'air: droplets from a cough or sneeze' },
    { id: 'water', name: 'water: drinking water with sewage in it' },
    { id: 'food', name: 'food: undercooked, or handled with dirty hands' },
    { id: 'surface', name: 'surfaces: touched, then the mouth' },
    { id: 'animal', name: 'animals: flies and rats' }
  ];
  /* a name in lines no wider than w (Inter at 14.5 px: about 0.56 of the font a character) */
  function lines(text, w) {
    var max = Math.max(8, Math.floor(w / (FONT * .56))), out = [], line = '';
    text.split(' ').forEach(function (word) {
      if (line && (line + ' ' + word).length > max) { out.push(line); line = word; } else line = line ? line + ' ' + word : word;
    });
    if (line) out.push(line);
    return out;
  }
  var MEASURES = [
    { id: 'water', name: 'A clean water supply', stops: ['water'], does: 'Chlorine, UV light or boiling kills the pathogens in drinking water.' },
    { id: 'food', name: 'Hygienic food preparation', stops: ['food', 'surface'], does: 'Thorough cooking kills pathogens; clean surfaces, separate boards and covered food keep them away from food.' },
    { id: 'hygiene', name: 'Good personal hygiene', stops: ['food', 'surface', 'air'], does: 'Washing hands with soap removes pathogens; covering coughs and sneezes stops the droplets.' },
    { id: 'waste', name: 'Waste disposal', stops: ['animal'], does: 'Closed bins do not attract the flies and rats that carry pathogens.' },
    { id: 'sewage', name: 'Sewage treatment', stops: ['water'], does: 'Pathogens are removed from human waste, so they do not reach drinking water.' }
  ];

  function routes(spec) {
    var box = h('div', 'widget rt');
    box.appendChild(L.head(spec.title || 'Close the routes', spec.ask, 'Press a measure'));
    var wrap = h('div', 'rt__wrap'), left = h('div', 'rt__left'), pack = h('div', 'rt__pack');
    var packT = h('p', 'stg__title', esc(spec.title || 'Close the routes')); packT.hidden = true;
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'rt__svg'); svg.setAttribute('role', 'img');
    var W = 560;
    pack.appendChild(packT); pack.appendChild(svg); left.appendChild(pack);
    var right = h('div', 'rt__right');
    var btns = h('div', 'rt__btns'); btns.setAttribute('role', 'group'); btns.setAttribute('aria-label', 'The five measures');
    var say = h('p', 'rt__say'); say.setAttribute('aria-live', 'polite');
    var clear = h('button', 'rt__clear', '↺ Open every route again'); clear.type = 'button';
    right.appendChild(btns); right.appendChild(say); right.appendChild(clear);
    wrap.appendChild(left); wrap.appendChild(right); box.appendChild(wrap);
    var on = {}, last = null;
    MEASURES.forEach(function (m) {
      var b = h('button', 'rt__btn', esc(m.name)); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { on[m.id] = !on[m.id]; last = on[m.id] ? m : null; draw(); });
      btns.appendChild(b); m.btn = b;
    });
    clear.addEventListener('click', function () { on = {}; last = null; draw(); });
    function closed(rid) { return MEASURES.some(function (m) { return on[m.id] && m.stops.indexOf(rid) >= 0; }); }
    function draw() {
      var xL = 26, xR = W - 26, mid = W / 2, y = 64, out = '', open = 0, lanes = [];
      ROUTES.forEach(function (r) {
        var shut = closed(r.id); if (!shut) open++;
        var ls = lines(r.name, xR - xL - 28);
        ls.forEach(function (ln, i) {
          out += '<text class="rt__rn' + (shut ? ' is-shut' : '') + '" x="' + mid + '" y="' + (y + FONT + i * LH) + '" text-anchor="middle">' + esc(ln) + '</text>';
        });
        var ly = y + FONT + (ls.length - 1) * LH + 15;
        out += '<path class="rt__path' + (shut ? ' is-shut' : '') + '" d="M' + xL + ' ' + ly + ' L' + (xR - 2) + ' ' + ly + '" marker-end="url(#rtArrow)"/>';
        if (shut) out += '<g class="rt__bar"><rect x="' + (mid - 7) + '" y="' + (ly - 9) + '" width="14" height="18" rx="3" transform="rotate(-20 ' + mid + ' ' + ly + ')"/></g>';
        lanes.push(ly); y = ly + 14;
      });
      var H = y + 6, lastY = lanes[lanes.length - 1], none = open === 0;
      /* the two uprights: from the infected person down to every route, and from every route up to the well person */
      var head = '<rect class="rt__bg" x="0" y="0" width="' + W + '" height="' + H + '" rx="14"/>' +
        '<path class="rt__path rt__trunk' + (none ? ' is-shut' : '') + '" d="M' + xL + ' 50 L' + xL + ' ' + lastY + '"/>' +
        '<path class="rt__path rt__trunk' + (none ? ' is-shut' : '') + '" d="M' + xR + ' ' + lastY + ' L' + xR + ' 52" marker-end="url(#rtArrow)"/>' +
        '<path class="rt__who rt__who--ill" transform="translate(' + (xL - 20) + ' 4) scale(1.7)" d="' + PERSON + '"/>' +
        '<path class="rt__who rt__who--well" transform="translate(' + (xR - 20) + ' 4) scale(1.7)" d="' + PERSON + '"/>' +
        '<text class="rt__whot" x="' + (xL + 24) + '" y="32">infected</text><text class="rt__whot" x="' + (xR - 24) + '" y="32" text-anchor="end">well</text>';
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.innerHTML = '<defs><marker id="rtArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="rt__arrow"/></marker></defs>' + head + out;
      MEASURES.forEach(function (m) { m.btn.setAttribute('aria-pressed', on[m.id] ? 'true' : 'false'); });
      svg.setAttribute('aria-label', open + ' of 5 ways of transmission open.');
      say.innerHTML = last ? '<b>' + esc(last.name) + '</b> stops transmission by ' + last.stops.map(function (s) { return ROUTES.filter(function (r) { return r.id === s; })[0].name.split(':')[0]; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '. ' + esc(last.does) :
        open === 0 ? '<b>Every route is closed.</b> Each measure stops pathogens reaching a new host in at least one way.' :
        open + ' of 5 ways are open. Press a measure to see which ways it stops.';
    }
    var stg = L.stage({ box: box, spec: spec, pack: pack, home: left, watch: function () { return box; },
      onPlace: function (col) { packT.hidden = !col; box.classList.toggle('rt--staged', col); fit(); } });
    /* the drawing is as many units wide as it is pixels wide, so its words keep their size */
    function fit() { var w = Math.round(pack.getBoundingClientRect().width); if (w && Math.abs(w - W) > 2) { W = Math.max(260, Math.min(680, w)); draw(); } }
    var ro = global.ResizeObserver ? new ResizeObserver(function () { if (!box.isConnected) { ro.disconnect(); return; } fit(); }) : null;
    if (ro) ro.observe(pack);
    box.__onMove = function () { stg.mount(); fit(); };
    box.__onReset = function () { if (ro) ro.disconnect(); stg.detach(); };
    draw();
    return box;
  }
  L.add('routes', routes);
})(window);
