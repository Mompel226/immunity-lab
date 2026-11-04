/* ============================================================
   w-routes.js — "Close the routes" (station `control`, 10.1.5).

   An infected person top left, a well person top right, and between them, as the rungs of a ladder, seven ways a pathogen
   is transmitted indirectly (the first station's air, water, food, contaminated surfaces and animals, with water and food
   split where different measures close them): each route is one
   arrow the full width of the drawing, with its name above it, so no name ever sits on a line. The drawing is measured
   in screen pixels (its viewBox is its own width), so the names stay 14.5 px on a phone and a laptop; a long name takes
   two lines on a narrow screen (Daniel, 3 Nov 2026: no overlaps, never tiny type). Press one of the five measures of
   10.1.5: the routes it closes get a red bar and grey out, and a line says what the measure does to the pathogen: kills
   it, removes it, or keeps it away. A measure REDUCES transmission (the summary's word); with every measure on, every
   route shown is closed, and the line says that direct contact and mosquitoes need other measures. The diagram is drawn for this lab
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
    { id: 'air', name: 'air: droplets from a cough or sneeze', short: 'air' },
    /* two ways by water, each closed by its own measure (Daniel, 4 Nov 2026: "you could have a clean water supply without
       sewage treatment … people drink from water bottles, but the sewage treatment is not very good") */
    { id: 'drink', name: 'drinking water: not treated', short: 'drinking water' },
    { id: 'env', name: 'rivers, the sea and soil: with sewage in them', short: 'rivers, the sea and soil' },
    /* food two ways: personal hygiene does not cook food (the audit of 4 Nov 2026), and food preparation does not clean a
       door handle */
    { id: 'cook', name: 'food: not cooked thoroughly', short: 'food not cooked thoroughly' },
    { id: 'hands', name: 'food: from dirty hands or kitchen surfaces', short: 'food from dirty hands or surfaces' },
    { id: 'surface', name: 'surfaces such as door handles: touched, then the mouth', short: 'surfaces such as door handles' },
    { id: 'animal', name: 'animals: flies and rats', short: 'flies and rats' }
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
    /* what each does to the pathogen, and how (Daniel, 4 Nov 2026: "removes it … How? Why is it not killing it too?") */
    { id: 'water', name: 'A clean water supply', stops: ['drink'], does: 'Chlorine or UV light kills the pathogens in drinking water, and so does boiling. Treated or bottled water is safe to drink even where sewage is not treated.' },
    { id: 'food', name: 'Hygienic food preparation', stops: ['cook', 'hands'], does: 'Thorough cooking kills pathogens. Washed hands, clean surfaces and separate boards keep pathogens off food, and covering food keeps flies away from it.' },
    { id: 'hygiene', name: 'Good personal hygiene', stops: ['hands', 'surface', 'air'], does: 'Washing hands with soap and water lifts pathogens off the skin and washes them away; soap also breaks some apart, such as many viruses. Covering coughs and sneezes stops the droplets.' },
    { id: 'waste', name: 'Waste disposal', stops: ['animal'], does: 'Closed bins keep flies and rats away from the waste, so they do not carry its pathogens to food and people.' },
    { id: 'sewage', name: 'Sewage treatment', stops: ['env'], does: 'Pathogens settle out with the solids, and other microorganisms in the tanks feed on them; at the end, chlorine or UV light may kill the rest. The treated water does not spread pathogens in rivers, the sea or the soil.' }
  ];

  /* "by A, by B, and by C": a short name may hold a comma of its own (rivers, the sea and soil), so each is led by "by" */
  function byList(a) { a = a.map(function (x) { return 'by ' + x; }); return a.length < 2 ? a[0] : a.slice(0, -1).join(', ') + (a.length > 2 ? ', and ' : ' and ') + a[a.length - 1]; }

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
      svg.setAttribute('aria-label', open + ' of ' + ROUTES.length + ' ways of transmission open.');
      say.innerHTML = last ? '<b>' + esc(last.name) + '</b> reduces transmission ' + byList(last.stops.map(function (s) { return ROUTES.filter(function (r) { return r.id === s; })[0].short; })) + '. ' + esc(last.does) :
        open === 0 ? '<b>Every route shown is closed.</b> Each measure reduces transmission in at least one way. Direct contact, and mosquitoes, need other measures.' :
        open + ' of ' + ROUTES.length + ' ways are open. Press a measure to see which ways it closes.';
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
