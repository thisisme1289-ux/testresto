/* ═══════════════════════════════════════
   CONVEYOR BELT WHEEL ENGINE — v3 CLEAN

   GEOMETRY:
   - Rotor center = bottom-center of .whl-wrap
   - Active slot = slot at index activeIdx, always at angle 270° (12 o'clock)
   - Spotlight positioned exactly over the active node

   SMALL-N ARC FIX:
   - N ≥ 5 : totalArc = 180°, edge nodes partial (original)
   - N = 4 : totalArc = 130°, no partials — all 4 visible
   - N = 3 : totalArc = 110°, no partials — all 3 visible
   - N ≤ 2 : SLOTS forced to 1 — single centered plate, arrows cycle dishes
             This avoids the off-screen problem: R=190px is too large relative
             to narrow phone widths for a 2-node symmetric arc.

   ANIMATION:
   - Easing  : cubic-bezier(0.16,1,0.3,1)  expo-out, no bounce
   - Duration : 700 ms
   - Card     : fades out → data swaps at mid-spin → fades back in

   TOUCH (v3.1):
   - Fires on touchmove as soon as horizontal drag ≥ 22px (instant feel)
   - Vertical scroll detection: if dy > dx, treat as page scroll (ignored)
   - Arrow buttons use ontouchstart + preventDefault to bypass 300ms tap delay
   - Fast flick at touchend adds 1–3 momentum steps
═══════════════════════════════════════ */

const WHL_DURATION = 700;
const WHL_EASE     = 'cubic-bezier(0.16,1,0.3,1)';
const WHL_FADE_MS  = 350;
const WHL_SWIPE_PX = 22;   /* horizontal pixels to trigger one step */

function wheelSizes() {
  const W = window.innerWidth;
  if (W < 480) return { R:190, ns:92,  SLOTS:5 };
  if (W < 768) return { R:255, ns:114, SLOTS:7 };
  return              { R:335, ns:138, SLOTS:7 };
}

/* Arc config — keyed on the EFFECTIVE slot count after N clamping.
   partial:true = edge nodes hidden (needed when arc=180° clips them off-screen).
   partial:false = all nodes fully visible, no hiding. */
function arcConfig(slots) {
  if (slots <= 1) return { totalArc:   0, partial: false }; /* single plate */
  if (slots <= 3) return { totalArc: 110, partial: false };
  if (slots <= 4) return { totalArc: 130, partial: false };
  return              { totalArc: 180, partial: true  };
}

function buildWheel(host, dishes, catLabel, accentColor, uid) {
  const N = dishes.length;
  if (!N) return;

  const { R, ns, SLOTS: rawSlots } = wheelSizes();

  /* ── EFFECTIVE SLOTS ──────────────────────────────────────────
     N ≤ 2 → force 1 slot. A 2-node arc on R=190 pushes the left
     node off-screen on narrow phones. Single plate + arrows is
     the cleanest solution and keeps the wheel design intact.
     N ≥ 3 → clamp to dish count as before.
  ── */
  const SLOTS     = N <= 2 ? 1 : Math.min(rawSlots, N);
  const nr        = ns / 2;
  const activeIdx = Math.floor(SLOTS / 2);

  const { totalArc, partial: usePartial } = arcConfig(SLOTS);
  const arcStep  = SLOTS > 1 ? totalArc / (SLOTS - 1) : 0;
  const arcStart = 270 - activeIdx * arcStep;

  const topPad   = 58;
  const wrapH    = topPad + R + nr;

  let activeDish = 0;
  let spinning   = false;

  /* ── DOM ── */
  host.innerHTML = `
    <div class="whl-wrap" id="${uid}_wrap"
         style="height:${wrapH}px;overflow:hidden;position:relative;">
      <div class="whl-table" style="
        width:${(R+nr)*2+80}px;height:${(R+nr)*2+80}px;
        position:absolute;left:50%;bottom:0;transform:translateX(-50%);
      "></div>
      <div class="whl-spotlight" style="
        width:${ns}px;height:${ns}px;position:absolute;
        left:50%;top:${topPad}px;transform:translateX(-50%);
        z-index:15;pointer-events:none;
      "></div>
      <div class="whl-rotor" id="${uid}_rotor" style="
        width:${R*2}px;height:${R*2}px;position:absolute;
        left:50%;top:${wrapH-R}px;transform:translateX(-50%);
      "></div>
    </div>
    <div class="whl-bottom">
      <button class="whl-arr whl-arr-left"
        ontouchstart="event.preventDefault();${uid}_rotate(-1)"
        onclick="${uid}_rotate(-1)">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="whl-card-wrap">
        <div class="whl-card empty" id="${uid}_card" onclick="${uid}_doAdd()">
          <div class="whl-card-inner" id="${uid}_ci">
            <div class="whl-card-thumb">
              <img id="${uid}_cimg" src="" alt="" loading="lazy">
            </div>
            <div class="whl-card-cat"   id="${uid}_ccat"></div>
            <div class="whl-card-name"  id="${uid}_cname"></div>
            <div class="whl-card-price" id="${uid}_cprice"></div>
            <button class="whl-add-btn"
                    ontouchstart="event.preventDefault();event.stopPropagation();${uid}_doAdd()"
                    onclick="event.stopPropagation();${uid}_doAdd()">
              <svg viewBox="0 0 24 24">
                <line x1="12" y1="5"  x2="12" y2="19"/>
                <line x1="5"  y1="12" x2="19" y2="12"/>
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <button class="whl-arr whl-arr-right"
        ontouchstart="event.preventDefault();${uid}_rotate(1)"
        onclick="${uid}_rotate(1)">
        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="whl-arrows-mobile">
        <button class="whl-arr"
          ontouchstart="event.preventDefault();${uid}_rotate(-1)"
          onclick="${uid}_rotate(-1)">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="whl-arr"
          ontouchstart="event.preventDefault();${uid}_rotate(1)"
          onclick="${uid}_rotate(1)">
          <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>`;

  const rotor = document.getElementById(`${uid}_rotor`);

  /* ── Build nodes ── */
  for (let i = 0; i < SLOTS; i++) {
    const deg = arcStart + i * arcStep;
    const rad = deg * Math.PI / 180;
    const x   = R + R * Math.cos(rad) - nr;
    const y   = R + R * Math.sin(rad) - nr;

    const isActive  = (i === activeIdx);
    const isPartial = usePartial && (i === 0 || i === SLOTS - 1);

    const node = document.createElement('div');
    node.className = 'whl-node'
      + (isActive  ? ' active'  : '')
      + (isPartial ? ' partial' : '');
    node.id = `${uid}_node${i}`;
    node.style.cssText =
      `width:${ns}px;height:${ns}px;left:${x}px;top:${y}px;position:absolute;`
      + (isPartial ? 'pointer-events:none;' : '');
    node.innerHTML = `
      <div class="whl-node-face" id="${uid}_face${i}">
        <img id="${uid}_img${i}" src="" alt="" loading="lazy">
      </div>
      <div class="whl-node-label" id="${uid}_lbl${i}"></div>`;

    if (!isPartial && !isActive) {
      const steps = activeIdx - i;
      /* instant response on touch — no 300ms delay */
      node.addEventListener('touchstart', e => {
        e.preventDefault();
        doRotate(steps);
      }, { passive: false });
      node.addEventListener('click', () => doRotate(steps));
    }
    if (isActive) {
      node.addEventListener('click', () => window[`${uid}_doAdd`]());
    }
    rotor.appendChild(node);
  }

  /* ── Image assignment ── */
  function renderImages() {
    for (let i = 0; i < SLOTS; i++) {
      const di   = ((activeDish + (activeIdx - i)) % N + N) % N;
      const dish = dishes[di];
      const img  = document.getElementById(`${uid}_img${i}`);
      const lbl  = document.getElementById(`${uid}_lbl${i}`);
      if (img) { img.src = getImg(dish.name); img.alt = dish.name; }
      if (lbl)   lbl.textContent = dish.name.split(' ').slice(0, 3).join(' ');
    }
  }

  /* ── Initial silent render ── */
  function render() {
    rotor.style.transition = 'none';
    rotor.style.transform  = `translateX(-50%) rotate(0deg)`;
    for (let i = 0; i < SLOTS; i++) {
      const face = document.getElementById(`${uid}_face${i}`);
      const lbl  = document.getElementById(`${uid}_lbl${i}`);
      if (face) { face.style.transition = 'none'; face.style.transform = 'rotate(0deg)'; }
      if (lbl)    lbl.style.transform = 'translateX(-50%) rotate(0deg)';
    }
    renderImages();
    updateCard();
  }

  function updateCard() {
    const card = document.getElementById(`${uid}_card`);
    if (!card) return;
    setCardData(dishes[((activeDish % N) + N) % N]);
    card.classList.remove('empty');
  }

  function setCardData(dish) {
    const ci = document.getElementById(`${uid}_cimg`);
    const cc = document.getElementById(`${uid}_ccat`);
    const cn = document.getElementById(`${uid}_cname`);
    const cp = document.getElementById(`${uid}_cprice`);
    if (ci) { ci.src = getImg(dish.name); ci.alt = dish.name; }
    if (cc)   cc.textContent = catLabel;
    if (cn)   cn.textContent = dish.name;
    if (cp)   cp.textContent = '\u20B9' + dish.price;
  }

  /* ── Rotate ──────────────────────────────────────────────────────
     For SLOTS=1 (N≤2): arcStep=0 so animDeg=0 — the rotor doesn't
     visually spin, but activeDish changes and the card crossfades
     to the next dish. Feels like a clean flip.
  ── */
  function doRotate(steps) {
    if (spinning) return;
    spinning = true;

    const card     = document.getElementById(`${uid}_card`);
    const ci       = document.getElementById(`${uid}_ci`);
    const animDeg  = steps * arcStep;   /* 0 when SLOTS=1 — card-only crossfade */
    const nextDish = ((activeDish + steps) % N + N) % N;

    /* 1. Fade card content out */
    if (ci) ci.classList.add('fading');

    /* 2. Spin rotor (no-op visually when arcStep=0) */
    rotor.style.transition = `transform ${WHL_DURATION}ms ${WHL_EASE}`;
    rotor.style.transform  = `translateX(-50%) rotate(${animDeg}deg)`;

    /* 3. Counter-rotate faces (no-op when arcStep=0) */
    for (let i = 0; i < SLOTS; i++) {
      const face = document.getElementById(`${uid}_face${i}`);
      const lbl  = document.getElementById(`${uid}_lbl${i}`);
      if (face) {
        face.style.transition = `transform ${WHL_DURATION}ms ${WHL_EASE}`;
        face.style.transform  = `rotate(${-animDeg}deg)`;
      }
      if (lbl) lbl.style.transform = `translateX(-50%) rotate(${-animDeg}deg)`;
    }

    /* 4. Mid-spin: swap card data while invisible */
    setTimeout(() => {
      setCardData(dishes[nextDish]);
      if (card) card.classList.remove('empty');
    }, WHL_FADE_MS);

    /* 5. End: reset rotor, reassign images, reveal card */
    setTimeout(() => {
      activeDish = nextDish;

      rotor.style.transition = 'none';
      rotor.style.transform  = `translateX(-50%) rotate(0deg)`;
      for (let i = 0; i < SLOTS; i++) {
        const face = document.getElementById(`${uid}_face${i}`);
        const lbl  = document.getElementById(`${uid}_lbl${i}`);
        if (face) { face.style.transition = 'none'; face.style.transform = 'rotate(0deg)'; }
        if (lbl)    lbl.style.transform = 'translateX(-50%) rotate(0deg)';
      }

      renderImages();

      requestAnimationFrame(() => {
        if (ci) ci.classList.remove('fading');
        spinning = false;
      });
    }, WHL_DURATION + 16);
  }

  window[`${uid}_rotate`] = (dir) => doRotate(dir);

  /* ── Add to cart — no rebuild if already on menu page ── */
  window[`${uid}_doAdd`] = function() {
    const dish = dishes[((activeDish % N) + N) % N];
    const ex   = cart.find(c => c.id === dish.id);
    if (ex) ex.qty++;
    else cart.push({
      id: dish.id, name: dish.name, price: dish.price, cat: catLabel, qty: 1
    });
    save();
    refreshCart();
    toast('\u2713 Added \u2014 ' + dish.name.split(' ').slice(0, 3).join(' '));

    const homePage = document.getElementById('home');
    if (homePage && homePage.classList.contains('on')) {
      showPage('menuPg');
      buildMenuUI();
      switchCat(dish.cat || catLabel);
      requestAnimationFrame(() => {
        const targetCat = dish.cat || catLabel;
        const sbBtn = [...document.querySelectorAll('.sb-btn')]
          .find(b => b.textContent.trim().startsWith(targetCat.split(' ')[0]));
        if (sbBtn) sbBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };

  /* ── Touch swipe — instant response on move, momentum on flick ──
     v3.1 changes vs v3:
     • Added touchmove listener: rotation fires as soon as horizontal drag
       crosses WHL_SWIPE_PX (22px), without waiting for finger lift.
     • Vertical scroll detection: if |dy| > |dx| the gesture is a page
       scroll — ignored completely so the page can still scroll normally.
     • tx0/ty0 reset after each triggered step so a long drag auto-steps.
     • touchend handles momentum steps for fast flicks only.
     • Arrow buttons use ontouchstart+preventDefault to fire with zero delay.
  ── */
  let tx0 = 0, ty0 = 0, tt0 = 0;
  let mSteps = 0, mDir = 0, mTimer = null;

  function fireMomentum() {
    if (mSteps <= 0) return;
    doRotate(mDir);
    mSteps--;
    if (mSteps > 0) mTimer = setTimeout(fireMomentum, WHL_DURATION + 40);
  }

  const wrap = document.getElementById(`${uid}_wrap`);
  if (wrap) {

    wrap.addEventListener('touchstart', e => {
      tx0 = e.touches[0].clientX;
      ty0 = e.touches[0].clientY;
      tt0 = Date.now();
      clearTimeout(mTimer);
      mSteps = 0;
    }, { passive: true });

    wrap.addEventListener('touchmove', e => {
      /* If already animating, ignore — prevents stacking mid-spin */
      if (spinning) return;

      const dx = e.touches[0].clientX - tx0;
      const dy = e.touches[0].clientY - ty0;

      /* Not moved enough yet */
      if (Math.abs(dx) < WHL_SWIPE_PX) return;

      /* Mostly vertical → let the page scroll, don't steal the gesture */
      if (Math.abs(dy) > Math.abs(dx)) return;

      /* Trigger rotation immediately */
      doRotate(dx < 0 ? -1 : 1);

      /* Reset origin so the next move segment starts fresh */
      tx0 = e.touches[0].clientX;
      ty0 = e.touches[0].clientY;
    }, { passive: true });

    wrap.addEventListener('touchend', e => {
      const dx  = e.changedTouches[0].clientX - tx0;
      const dy  = e.changedTouches[0].clientY - ty0;
      const dt  = Math.max(Date.now() - tt0, 1);
      const vel = Math.abs(dx) / dt;

      /* Ignore taps and vertical scrolls */
      if (Math.abs(dx) < WHL_SWIPE_PX || Math.abs(dy) > Math.abs(dx)) return;

      /* Add momentum steps proportional to flick speed */
      mDir = dx < 0 ? -1 : 1;
      if      (vel > 2.2) mSteps = 3;
      else if (vel > 1.4) mSteps = 2;
      else if (vel > 0.7) mSteps = 1;
      else                mSteps = 0;

      if (mSteps > 0) fireMomentum();
    }, { passive: true });
  }

  render();
     }
