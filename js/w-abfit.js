/* ============================================================
   w-abfit.js — "Which antibody fits?" (station `antibodies`, 10.1.7 and 10.1.9).

   Three pathogens, each with its own antigens (a triangle, a disc, a square on a stalk), and three antibodies, each with
   ends shaped to fit one of them. The buttons only number the antibodies, so a pupil must compare the shapes (never match
   a word on the button with a word on the pathogen), and every antibody is drawn in one grey, so its colour does not
   match its antigens' (each kind's colour elsewhere in the lab); a screen reader hears what each fits. Choose an antibody, then press a pathogen: if the shapes are complementary, the antibody moves to it and
   binds to an antigen; if not, it does not bind, and the line under the picture says why. Two presses, never a drag,
   so it works the same with a mouse, a finger or the keyboard. The drawings: js/imm-draw.js (the pathogen's body is
   Servier Medical Art, CC BY 4.0, adapted). Antibodies and antigens are drawn far larger than real.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, D = global.ImmDraw; if (!L || !D) return;
  var h = L.h, esc = L.esc, NS = 'http://www.w3.org/2000/svg';
  var W = 600, H = 210;
  var KINDS = ['tri', 'round', 'sq'];
  var WORD = { tri: 'triangular', round: 'rounded', sq: 'square' };
  /* P, Q and R: the picture beside this station already calls its two pathogens A and B, in other colours */
  var PG = [{ kind: 'round', x: 105, y: 108, rot: -8, name: 'Pathogen P' }, { kind: 'sq', x: 300, y: 108, rot: 6, name: 'Pathogen Q' }, { kind: 'tri', x: 495, y: 108, rot: -4, name: 'Pathogen R' }];
  var NUM = { tri: 1, round: 2, sq: 3 };

  function abfit(spec) {
    var box = h('div', 'widget af');
    box.appendChild(L.head(spec.title || 'Which antibody fits?', spec.ask, 'Choose, then press'));
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'af__svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var pick = h('div', 'af__pick'); pick.setAttribute('role', 'group'); pick.setAttribute('aria-label', 'Choose an antibody');
    var say = h('p', 'af__say'); say.setAttribute('aria-live', 'polite');
    var again = h('button', 'af__again', '↺ Start again'); again.type = 'button';
    box.appendChild(svg); box.appendChild(pick); box.appendChild(say); box.appendChild(again);
    var chosen = null, bound = {}, anim = null, bad = null;
    var drawn = PG.map(function (p) { return D.pathogen({ x: p.x, y: p.y, s: .34, rot: p.rot, kind: p.kind, n: 9, phase: 1 }); });
    var btn = {};
    KINDS.forEach(function (k) {
      var b = h('button', 'af__ab'); b.type = 'button';
      b.innerHTML = '<svg viewBox="-34 -66 68 72" aria-hidden="true">' + D.antibody({ x: 0, y: 0, kind: k, s: .9, plain: true }) + '</svg><span>antibody ' + NUM[k] + '</span>';
      b.setAttribute('aria-label', 'antibody ' + NUM[k] + ': its ends fit ' + WORD[k] + ' antigens');
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { if (bound[k] != null) return; chosen = chosen === k ? null : k; bad = null; draw(); });
      pick.appendChild(b); btn[k] = b;
    });
    again.addEventListener('click', function () { chosen = null; bound = {}; bad = null; draw(); });
    function press(i) {
      if (!chosen) { say.innerHTML = 'First choose an antibody below.'; return; }
      var p = PG[i];
      if (p.kind === chosen) {
        bound[chosen] = i;
        var ag = drawn[i].antigens[2], pose = D.bound(ag, p.kind, .9, 'R');
        anim = { k: chosen, t0: performance.now(), from: { x: 300, y: 240, rot: 0 }, to: pose };
        say.innerHTML = '<b>It fits.</b> The shape of antibody ' + NUM[p.kind] + ' is <b>complementary</b> to the antigens of ' + p.name + ', so it binds to them.' +
          (Object.keys(bound).length === 3 ? ' <b>Each antibody fits the antigens of one pathogen only.</b>' : '');
        chosen = null; bad = null; tick();
      } else {
        bad = i;
        say.innerHTML = '<b>It does not fit.</b> The ends of antibody ' + NUM[chosen] + ' fit ' + WORD[chosen] + ' antigens; the antigens of ' + p.name + ' are ' + WORD[p.kind] + '. The shapes are not complementary, so it cannot bind.';
        draw();
      }
    }
    function tick() {
      var k = anim ? Math.min(1, (performance.now() - anim.t0) / 900) : 1;
      draw(k);
      if (anim && k < 1) requestAnimationFrame(tick); else anim = null;
    }
    function draw(k) {
      var out = '<rect class="af__bg" x="0" y="0" width="' + W + '" height="' + H + '" rx="14"/>';
      PG.forEach(function (p, i) {
        out += '<g class="af__pg' + (bad === i ? ' is-bad' : '') + '" data-i="' + i + '" role="button" tabindex="0" aria-label="' + p.name + ', with ' + WORD[p.kind] + ' antigens">' +
          '<rect class="af__hit" x="' + (p.x - 92) + '" y="6" width="184" height="' + (H - 12) + '" rx="12"/>' + drawn[i].svg +
          '<text class="af__nm" x="' + p.x + '" y="' + (H - 12) + '" text-anchor="middle">' + p.name + '</text></g>';
      });
      Object.keys(bound).forEach(function (kd) {
        var i = bound[kd], p = PG[i], pose = D.bound(drawn[i].antigens[2], p.kind, .9, 'R');
        var e = anim && anim.k === kd ? (k == null ? 1 : k) : 1, ee = e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
        var x = anim && anim.k === kd ? anim.from.x + (pose.x - anim.from.x) * ee : pose.x, y = anim && anim.k === kd ? anim.from.y + (pose.y - anim.from.y) * ee : pose.y;
        var r = anim && anim.k === kd ? pose.rot * ee : pose.rot;
        out += D.antibody({ x: x, y: y, rot: r, s: .9, kind: kd, plain: true });
      });
      svg.innerHTML = out;
      Array.prototype.forEach.call(svg.querySelectorAll('.af__pg'), function (g) {
        var i = +g.getAttribute('data-i');
        g.addEventListener('click', function () { press(i); });
        g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); press(i); } });
      });
      KINDS.forEach(function (kd) {
        btn[kd].setAttribute('aria-pressed', chosen === kd ? 'true' : 'false');
        btn[kd].disabled = bound[kd] != null;
      });
      if (!chosen && !anim && Object.keys(bound).length === 0 && bad == null) say.innerHTML = 'Choose an antibody below, then press the pathogen you think it fits.';
      else if (chosen && bad == null) say.innerHTML = 'Now press the pathogen whose antigens you think it fits.';
    }
    box.__onReset = function () { anim = null; };
    draw();
    return box;
  }
  L.add('abfit', abfit);
})(window);
