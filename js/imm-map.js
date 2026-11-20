/* ============================================================
   imm-map.js — the immunity map (20 Nov 2026).

   Daniel's one-page poster for his Year 10 classes, who found it hard to tell innate from acquired immunity and to place
   active and passive immunity inside acquired immunity. It was first made outside this estate (a PDF printed from a
   "poster.html" that was never kept); this file is now its ONLY source:
     • in the lab, "See the immunity map" (in the stations about defences and immunity: STATIONS below) opens it BIG in a
       pop-up over the page, never a new tab or another page; × Close, the dark backdrop or Esc closes it, and the pupil
       is back where they were;
     • tools/imm-map-pdf.mjs prints the same map as the classroom PDF,
       IGCSE Lessons/Y10/T10_Disease and Immunity/Immunity-poster-answer-key.pdf.
   Its look is in css/imm-map.css.

   What changed from the first poster (Daniel, 20 Nov 2026: a pupil who reads "Acquired immunity" and sees lymphocyte and
   memory cell at its top thinks they are always produced, "that's not necessarily the case with passive immunity"):
     • Lymphocyte and Memory cell moved from the top of Acquired immunity into Active immunity, under "Only in active
       immunity"; Antigen and Antibody stay at the top, under "In both active and passive immunity";
     • Passive immunity answers them level, under "Not in passive immunity": no lymphocytes of your own (another
       individual made the antibodies) and no memory cells (0610 2026–28, 10.1.13 and 10.1.15); the white blood cells strip says "Lymphocytes (active immunity)";
     • his rules for every page: the key said the "beyond" card was "not examined" (never say so: 0610/22/M/J/22 Q19 asks
       about injected antibodies, and three 0610 mark schemes credit them), now "beyond 0610"; passive immunity is rose,
       as violet means beyond the syllabus on every site; and plain words for EAL pupils ("keep out", "get inside",
       "breathe in", "at once" → stop … entering, enter the body, inhale, immediately);
     • the injection card no longer says "(antiserum or antitoxin)": a private paper of his (the Y10 Annual 2025, Paper 4
       Q5) is built on an injection of antitoxin, and the lab shares no context with his private papers (its check 4).
   ============================================================ */
(function () {
  'use strict';

  /* the stations where a pupil meets innate, acquired, active or passive immunity: one button each, under the title */
  var STATIONS = { defences: 1, antibodies: 1, vaccination: 1, passive: 1 };

  function ref(t) { return ' <span class="mp-ref">[' + t + ']</span>'; }
  function card(h, p, extra) { return '<div class="mp-card' + (extra || '') + '"><h4>' + h + '</h4><p>' + p + '</p></div>'; }

  /* the map, as one piece of HTML (the pop-up and the PDF draw the same) */
  function html() {
    return [
      '<div class="mp" lang="en-GB">',

      '<div class="mp-top">',
        '<div>',
          '<p class="mp-eyebrow">Cambridge IGCSE Biology 0610 · Topic 10 Diseases and immunity</p>',
          '<h2 class="mp-title" id="mpTitle">Immunity: how the defences fit inside each other</h2>',
          '<p class="mp-lede">Every box sits inside the one around it. <b>Innate</b> and <b>acquired</b> are the two halves of immunity; <b>active</b> and <b>passive</b> are the two kinds of acquired immunity; each of those can happen <b>naturally</b> or <b>artificially</b>.</p>',
        '</div>',
        '<div class="mp-key"><p class="mp-key__h">Key</p><p><span class="mp-beyond">beyond 0610</span>not named in the syllabus, but an exam question can still use it</p></div>',
      '</div>',

      '<div class="mp-defs3">',
        card('Pathogen', 'A <b>disease-causing organism</b>, e.g. a virus, bacterium, fungus or protoctist.'),
        card('Transmissible disease', 'A disease in which the pathogen can be <b>passed from one host to another</b>.'),
        card('How pathogens spread', '<b>Direct contact</b> (incl. blood, body fluids) or <b>indirectly</b> (contaminated surfaces, food, animals, air).'),
      '</div>',

      '<section class="mp-imm">',
        '<h3 class="mp-imm__pill">IMMUNITY <span>· the body’s defences against pathogens</span></h3>',
        '<div class="mp-halves">',

          /* ---- half 1: innate ---- */
          '<section class="mp-half mp-innate">',
            '<p class="mp-half__n">Half 1</p>',
            '<h3>Innate immunity</h3>',
            '<p class="mp-half__is">Non-specific · present from birth · same response to every pathogen · no memory</p>',
            '<p class="mp-half__note">IGCSE calls these the <b>body defences</b>: skin, hairs in the nose, mucus, stomach acid and white blood cells.' + ref('10.1.4') + '</p>',
            '<p class="mp-lab">Physical (mechanical) barriers · stop pathogens entering</p>',
            '<div class="mp-stack">',
              card('Skin', 'A tough, continuous outer layer that pathogens cannot easily pass through.'),
              card('Hairs in the nose', 'Trap dust and pathogens in the air we inhale.'),
              card('Blood clotting' + ref('9.4.4'), 'Platelets help seal a cut, preventing blood loss <b>and the entry of pathogens</b>: fibrinogen is converted to a fibrin mesh.'),
            '</div>',
            '<p class="mp-lab">Chemical barriers · trap or kill pathogens</p>',
            '<div class="mp-stack">',
              '<div class="mp-card"><h4>Mucus</h4><p>Sticky; traps pathogens and particles in the airways.</p><p class="mp-sub"><b>Goblet cells</b> secrete mucus; <b>ciliated cells</b> beat to move it up the trachea and bronchi to the throat, where it is swallowed.' + ref('11.1.11') + '</p></div>',
              card('Stomach acid' + ref('7.4.5'), '<b>Hydrochloric acid</b> in gastric juice kills harmful microorganisms in food, drink and swallowed mucus.'),
            '</div>',
            '<p class="mp-lab">Cells · if pathogens enter the body</p>',
            '<div class="mp-stack">',
              card('Phagocytes (white blood cells)' + ref('9.4.3, 9.4.6'), '<b>Engulf</b> pathogens and <b>digest</b> them: <b>phagocytosis</b>. They attack any pathogen, so this is non-specific.', ' mp-card--key'),
            '</div>',
          '</section>',

          /* ---- half 2: acquired ---- */
          '<section class="mp-half mp-acq">',
            '<p class="mp-half__n">Half 2</p>',
            '<h3>Acquired immunity</h3>',
            '<p class="mp-half__is">Specific · gained during life · each response targets one pathogen’s antigens</p>',
            '<p class="mp-half__note">IGCSE does not use “acquired” as a heading: it is examined as <b>active immunity</b> and <b>passive immunity</b>.</p>',
            '<p class="mp-lab">In both active and passive immunity</p>',
            '<div class="mp-terms">',
              card('Antigen', 'Each pathogen has <b>its own antigens</b>, which have <b>specific shapes</b>.' + ref('10.1.7')),
              card('Antibody', 'A <b>protein</b> with a <b>complementary shape</b> that binds to a specific antigen.' + ref('10.1.8–9')),
            '</div>',

            '<div class="mp-kinds">',
              /* active */
              '<section class="mp-kind mp-active">',
                '<div class="mp-kind__head">',
                  '<h4 class="mp-kind__h">Active immunity</h4>',
                  '<p class="mp-kind__is">Defence against a pathogen by <b>antibody production in the body</b>.' + ref('10.1.6, 10.1.10') + '</p>',
                  '<div class="mp-chips"><span class="mp-chip">Your own lymphocytes</span><span class="mp-chip mp-chip--yes">Memory cells: YES</span><span class="mp-chip">Long-term</span><span class="mp-chip">Slow to develop</span></div>',
                '</div>',
                '<div class="mp-only">',
                  '<p class="mp-lab">Only in active immunity</p>',
                  '<div class="mp-terms">',
                    card('Lymphocyte', 'White blood cell whose function is <b>antibody production</b>.' + ref('9.4.6')),
                    card('Memory cell', 'Stays in the body and gives <b>long-term immunity</b>: a faster, bigger response next time.' + ref('10.1.11')),
                  '</div>',
                '</div>',
                '<div class="mp-card"><h5>Natural</h5><h4>After an infection by a pathogen</h4><p>Lymphocytes meet the pathogen’s antigens and make complementary antibodies, then memory cells remain. The person often becomes ill first.</p></div>',
                '<div class="mp-card"><h5>Artificial</h5><h4>By vaccination' + ref('10.1.11') + '</h4><ol>',
                  '<li><b>Weakened pathogens or their antigens</b> are put into the body.</li>',
                  '<li>The antigens stimulate an <b>immune response by lymphocytes</b>, which produce antibodies.</li>',
                  '<li><b>Memory cells</b> are produced that give long-term immunity.</li>',
                '</ol></div>',
                '<p class="mp-kind__tail"></p>',
              '</section>',

              /* passive */
              '<section class="mp-kind mp-passive">',
                '<div class="mp-kind__head">',
                  '<h4 class="mp-kind__h">Passive immunity</h4>',
                  '<p class="mp-kind__is">A <b>short-term</b> defence against a pathogen by <b>antibodies acquired from another individual</b>.' + ref('10.1.13') + '</p>',
                  '<div class="mp-chips"><span class="mp-chip">Ready-made antibodies</span><span class="mp-chip mp-chip--no">Memory cells: NO</span><span class="mp-chip">Short-term</span><span class="mp-chip">Immediate</span></div>',
                '</div>',
                '<div class="mp-only">',
                  '<p class="mp-lab">Not in passive immunity</p>',
                  '<div class="mp-terms">',
                    card('No lymphocytes of your own', 'Your own <b>lymphocytes</b> do not make these antibodies: another individual made them.', ' mp-not'),
                    card('No memory cells', '<b>Memory cells</b> are not produced in passive immunity.' + ref('10.1.15'), ' mp-not'),
                  '</div>',
                '</div>',
                '<div class="mp-card"><h5>Natural · mother to baby</h5><h4>Across the placenta and in breast milk</h4><p><b>Why breast-feeding matters:</b> a newborn’s immune system is not yet fully developed, so antibodies in breast milk protect it against pathogens the mother has met while it builds its own immunity.' + ref('10.1.14') + '</p></div>',
                '<div class="mp-card mp-card--beyond"><h5>Artificial<span class="mp-beyond">beyond 0610</span></h5><h4>Injection of antibodies</h4><p>Ready-made antibodies are injected, e.g. after a venomous snake bite, when protection is needed immediately.</p></div>',
                '<p class="mp-kind__tail">The antibodies are gradually <b>broken down</b> and none are replaced, so protection fades.' + ref('10.1.15') + '</p>',
              '</section>',
            '</div>',
          '</section>',
        '</div>',

        '<div class="mp-wbc">',
          '<h4>White blood cells work in both halves</h4>',
          '<p class="mp-wbc__in"><b>Phagocytes</b> (innate) engulf and digest pathogens by phagocytosis.</p>',
          '<span class="mp-wbc__ar" aria-hidden="true">↔</span>',
          '<p class="mp-wbc__ac"><b>Lymphocytes</b> (active immunity) make antibodies. Antibodies bind to antigens, leading to <b>direct destruction</b> of pathogens or <b>marking them for destruction</b> by phagocytes.</p>',
        '</div>',
      '</section>',

      '<div class="mp-bottom3">',
        '<div class="mp-card mp-cmp"><h4>Active vs passive: the comparison examiners ask for</h4>',
          '<table class="mp-tbl"><thead><tr><th scope="col"><span class="mp-sr">Question</span></th><th scope="col" class="mp-tbl__act">Active</th><th scope="col" class="mp-tbl__pas">Passive</th></tr></thead><tbody>',
            '<tr><th scope="row">Who makes the antibodies?</th><td>The body’s own lymphocytes</td><td>Another individual (received ready-made)</td></tr>',
            '<tr><th scope="row">Memory cells made?</th><td><b>Yes</b></td><td><b>No</b></td></tr>',
            '<tr><th scope="row">How long it lasts</th><td>Long-term</td><td>Short-term</td></tr>',
            '<tr><th scope="row">How quickly it works</th><td>Takes time to develop</td><td>Immediate</td></tr>',
            '<tr><th scope="row">Examples</th><td>Infection by a pathogen; vaccination</td><td>Across the placenta; breast milk</td></tr>',
          '</tbody></table>',
        '</div>',
        '<div class="mp-card mp-vacc"><h4>Why vaccination controls spread' + ref('10.1.12') + '</h4>',
          '<p><b>The individual:</b> if the real pathogen enters later, memory cells trigger fast production of lots of antibodies, so the pathogen is destroyed before symptoms develop.</p>',
          '<p><b>The population:</b> when a large proportion of people is vaccinated, the pathogen has few hosts to be passed to, so transmission falls and even unvaccinated people are less likely to meet it (<b>herd immunity</b>).</p>',
        '</div>',
        '<div class="mp-card mp-slips"><h4>Common exam slips</h4><ul>',
          '<li>A vaccine contains <b>weakened pathogens or antigens</b>, not antibodies.</li>',
          '<li>Passive immunity makes <b>no memory cells</b> and the antibodies are <b>broken down</b>: that is why it is short-term.</li>',
          '<li>Antibodies are made by <b>lymphocytes</b>; phagocytes <b>engulf</b>. Don’t swap them.</li>',
          '<li>Antibodies fit antigens because of <b>complementary shape</b>, so each antibody is specific to one <b>antigen</b>.</li>',
          '<li>Use the syllabus words: <b>body defences</b>, <b>active</b> and <b>passive immunity</b>.</li>',
        '</ul></div>',
      '</div>',

      '<p class="mp-foot">Wording follows the Cambridge IGCSE Biology 0610 syllabus for 2026–2028 (sections 7.4, 9.4, 10.1 and 11.1). Bracketed numbers are syllabus learning-objective references. “Innate”, “acquired”, “natural” and “artificial” are organising terms used in textbooks and later courses, not syllabus headings.</p>',
      '</div>'
    ].join('');
  }

  /* ---------- the pop-up ---------- */
  var dlg = null, opener = null;
  function build() {
    if (dlg) return dlg;
    dlg = document.createElement('div');
    dlg.className = 'modal modal--map';
    dlg.id = 'mapDlg';
    dlg.hidden = true;
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-labelledby', 'mpTitle');
    dlg.innerHTML = '<div class="mapbox">' +   /* not .modal__box: its h2, h3 and p rules would restyle the map */
      '<div class="mapbar"><span class="mapbar__name">The immunity map</span>' +
      '<button class="mapbar__close" id="mapClose" type="button" aria-label="Close the immunity map">× Close</button></div>' +
      html() + '</div>';
    document.body.appendChild(dlg);
    dlg.querySelector('#mapClose').addEventListener('click', close);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });      /* the dark backdrop */
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dlg.hidden) close(); });
    return dlg;
  }
  function open(from) {
    build();
    opener = from || document.activeElement;
    dlg.hidden = false;
    var box = dlg.querySelector('.mapbox'); if (box) box.scrollTop = 0;
    var x = dlg.querySelector('#mapClose');
    try { x.focus({ preventScroll: true }); } catch (e) { x.focus(); }
  }
  function close() {
    if (!dlg || dlg.hidden) return;
    dlg.hidden = true;
    if (opener && document.contains(opener)) { try { opener.focus({ preventScroll: true }); } catch (e) {} }
    opener = null;
  }

  /* the button a station shows under its title; null where the map is not offered */
  function button(stationId) {
    if (!STATIONS[stationId]) return null;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mapgo';
    b.setAttribute('aria-haspopup', 'dialog');
    b.innerHTML =
      '<svg class="mapgo__ic" viewBox="0 0 44 32" aria-hidden="true">' +
        '<rect class="mapgo__all" x="1" y="1" width="42" height="30" rx="5"/>' +
        '<rect class="mapgo__in" x="5" y="5" width="13" height="22" rx="3"/>' +
        '<rect class="mapgo__ac" x="21" y="5" width="18" height="22" rx="3"/>' +
        '<rect class="mapgo__act" x="23.5" y="12" width="6" height="12.5" rx="1.5"/>' +
        '<rect class="mapgo__pas" x="31" y="12" width="6" height="12.5" rx="1.5"/>' +
      '</svg>' +
      '<span class="mapgo__t"><span class="mapgo__q">Unsure where innate, acquired, active and passive immunity fit?</span>' +
      '<span class="mapgo__go">See the immunity map</span></span>';
    b.addEventListener('click', function () { open(b); });
    return b;
  }

  window.ImmMap = { html: html, open: open, close: close, button: button, stations: Object.keys(STATIONS) };
})();
