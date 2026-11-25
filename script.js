/* VOGUE — frontend-only demo. No backend, no database. Cart & wishlist use localStorage. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PLACEHOLDER = 'assets/images/placeholder.svg';
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const U = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(d) && !Array.isArray(v) ? d : (v ?? d); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const imgTag = (id, alt, w) => `<img src="${U(id, w)}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">`;

/* ---------------- data ---------------- */
const CLOTH = ['XS', 'S', 'M', 'L', 'XL'], ONE = ['One Size'];
const P = [
  { id: 1, name: 'Linen Camp Shirt', g: 'men', cat: 'Shirts', price: 2499, img: '1596755094514-f87e34085b2c', tags: ['new'], desc: 'A breathable washed-linen shirt with a relaxed camp collar. Effortless from beach lunches to evening walks.' },
  { id: 2, name: 'Heavyweight Cotton Tee', g: 'men', cat: 'T-shirts', price: 1299, img: '1521572163474-6864f9cf17ab', tags: ['best'], desc: 'Dense 240gsm combed cotton with a boxy fit and clean neckline. Gets better with every wash.' },
  { id: 3, name: 'Pleated Wool Trousers', g: 'men', cat: 'Trousers', price: 3999, img: '1473966968600-fa801b869a1a', tags: [], desc: 'High-rise pleated trousers in a soft wool blend with a tapered leg and a sharp crease.' },
  { id: 4, name: 'Waxed Field Jacket', g: 'men', cat: 'Jackets', price: 7499, img: '1591047139829-d91aecb6caea', tags: ['new', 'trend'], desc: 'A weather-ready field jacket with four utility pockets and a corduroy collar. Built to be lived in.' },
  { id: 5, name: 'Drawstring Linen Set', g: 'men', cat: 'Casual Wear', price: 3299, img: '1552374196-1ab2a1c593e8', tags: ['best'], desc: 'A matching linen shirt and drawstring short set for slow weekends and easy travel days.' },
  { id: 6, name: 'Charcoal Tailored Blazer', g: 'men', cat: 'Formal Wear', price: 8999, img: '1594938298603-c8148c4dae35', tags: ['new'], desc: 'A half-canvassed single-breasted blazer in charcoal wool. Sharp shoulders, soft structure.' },
  { id: 7, name: 'Silk Slip Dress', g: 'women', cat: 'Dresses', price: 5999, img: '1572804013309-59a88b7e92f1', tags: ['new', 'best'], desc: 'A bias-cut slip dress in fluid satin finish with adjustable straps. Dress it up or layer it down.' },
  { id: 8, name: 'Ribbed Knit Top', g: 'women', cat: 'Tops', price: 1799, img: '1503342217505-b0a15ec3261c', tags: ['trend'], desc: 'A stretch-rib fitted top with a scooped neckline. A everyday layering essential.' },
  { id: 9, name: 'Poplin Boyfriend Shirt', g: 'women', cat: 'Shirts', price: 2799, img: '1485968579580-b6d095142e6e', tags: [], desc: 'Crisp cotton poplin with an oversized silhouette and curved hem. Wear it open, tucked or knotted.' },
  { id: 10, name: 'High-Rise Wide Trousers', g: 'women', cat: 'Trousers', price: 3499, img: '1509631179647-0177331693ae', tags: ['best'], desc: 'Fluid wide-leg trousers with a high rise and a clean front. Movement in every step.' },
  { id: 11, name: 'Terracotta Co-ord Set', g: 'women', cat: 'Co-ord Sets', price: 6499, img: '1496747611176-843222e1e57c', tags: ['new', 'trend'], desc: 'A cropped blazer and matching skirt in warm terracotta. One set, endless outfits.' },
  { id: 12, name: 'Leather Crossbody Bag', g: 'women', cat: 'Accessories', price: 4999, img: '1584917865442-de89df76afd3', tags: ['best', 'trend'], desc: 'Vegetable-tanned leather with a magnetic flap and adjustable strap. Compact, polished, timeless.', one: true },
  { id: 13, name: 'Floral Wrap Dress', g: 'women', cat: 'Dresses', price: 4599, img: '1595777457583-95e059d581b8', tags: ['trend'], desc: 'A flattering wrap dress in a soft viscose print with flutter sleeves and a tie waist.' },
  { id: 14, name: 'Oxford Button-Down', g: 'men', cat: 'Shirts', price: 2999, img: '1607345366928-199ea26cfe3e', tags: ['best'], desc: 'The classic oxford, reworked with a softer wash and a slightly longer, cleaner fit.' }
];
P.forEach(p => p.sizes = p.one ? ONE : CLOTH);
const byId = id => P.find(p => p.id === +id);
const W_CATS = [
  ['Dresses', 'Fluid silhouettes for every occasion.', 7], ['Tops', 'Soft knits and sharp essentials.', 8], ['Shirts', 'Crisp, oversized, endlessly styled.', 9],
  ['Trousers', 'Tailored lines with easy movement.', 10], ['Co-ord Sets', 'Matching pieces, zero effort.', 11], ['Accessories', 'The finishing touch.', 12]];
const M_CATS = [
  ['Shirts', 'Linen, oxford and everything between.', 1], ['T-shirts', 'Heavyweight basics built to last.', 2], ['Trousers', 'Pleats, drape and clean tapers.', 3],
  ['Jackets', 'Layers with character.', 4], ['Casual Wear', 'Easy sets for slow weekends.', 5], ['Formal Wear', 'Sharp tailoring, softly worn.', 6]];

/* ---------------- state ---------------- */
let cart = store.get('vogue_cart', []);
let wish = store.get('vogue_wish', []);
const filter = { tab: 'all', cat: '' };
let currentUser = null;

/* ---------------- toast ---------------- */
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 550); }, 2800);
}

/* ---------------- images from data-src ---------------- */
$$('img[data-src]').forEach(img => {
  img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; };
  img.src = U(img.dataset.src, 1100);
});

/* ---------------- loader ---------------- */
let loaded = false;
function finishLoading() {
  if (loaded) return; loaded = true;
  $('#loaderBar').style.width = '100%';
  setTimeout(() => {
    $('#loader').classList.add('out');
    document.body.classList.remove('loading');
    document.body.classList.add('ready');
    setTimeout(() => $('#loader').remove(), 1000);
  }, 450);
}
let prog = 0;
const progTimer = setInterval(() => { prog = Math.min(90, prog + Math.random() * 14); $('#loaderBar').style.width = prog + '%'; if (loaded) clearInterval(progTimer); }, 220);
setTimeout(finishLoading, reduce ? 300 : 2200);          // normal minimum show time
setTimeout(finishLoading, 3500);                         // hard fallback: never stuck

/* ---------------- layers (drawers, modals, search, menu) ---------------- */
const layers = { cart: $('#cart'), wish: $('#wish'), search: $('#search'), pModal: $('#pModal'), authModal: $('#authModal') };
const drawerLike = new Set(['cart', 'wish']);
function openLayer(name) {
  closeAll(true);
  const el = layers[name]; el.classList.add('open'); el.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
  if (drawerLike.has(name)) $('#backdrop').classList.add('on');
  if (name === 'search') setTimeout(() => $('#searchInput').focus(), 350);
}
function closeAll(keepLock) {
  Object.values(layers).forEach(el => { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); });
  $('#backdrop').classList.remove('on');
  closeMenu();
  if (!keepLock) document.body.classList.remove('locked');
}
$('#backdrop').onclick = () => closeAll();
addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
$$('[data-close]').forEach(b => b.addEventListener('click', () => closeAll()));
['pModal', 'authModal'].forEach(id => layers[id].addEventListener('mousedown', e => { if (e.target === layers[id]) closeAll(); }));

/* mobile menu */
const burger = $('#burger'), menu = $('#menu');
function closeMenu() { burger.classList.remove('on'); menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); if (!Object.values(layers).some(l => l.classList.contains('open'))) { $('#backdrop').classList.remove('on'); document.body.classList.remove('locked'); } }
burger.onclick = () => {
  const open = !menu.classList.contains('open');
  if (open) { closeAll(true); }
  burger.classList.toggle('on', open); menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open);
  $('#backdrop').classList.toggle('on', open); document.body.classList.toggle('locked', open);
};

$('#btnSearch').onclick = () => openLayer('search');
$('#btnBag').onclick = () => openLayer('cart');
$('#btnWish').onclick = () => openLayer('wish');
$('#btnAccount').onclick = () => openLayer('authModal');

/* ---------------- product card ---------------- */
function card(p, i = 0) {
  const tag = p.tags.includes('new') ? '<span class="tag hot">NEW</span>' : p.tags.includes('best') ? '<span class="tag">BESTSELLER</span>' : '';
  return `<article class="pcard" data-id="${p.id}" style="--i:${i}">
    <div class="pimg" data-act="view">${imgTag(p.img, p.name, 700)}${tag}
      <button class="heart ${wish.includes(p.id) ? 'on' : ''}" data-act="wish" aria-label="Add ${p.name} to wishlist"><svg><use href="#i-heart"/></svg></button>
      <button class="quick" data-act="add">ADD TO BAG</button></div>
    <div class="pinfo"><div><h3 data-act="view">${p.name}</h3><small>${p.g === 'men' ? 'Men' : 'Women'} · ${p.cat}</small></div><span class="price">${inr(p.price)}</span></div>
  </article>`;
}
const fill = (sel, list) => { $(sel).innerHTML = list.map(card).join(''); watch(); };

function renderShop() {
  let list = P.filter(p => filter.tab === 'all' || (filter.tab === 'new' ? p.tags.includes('new') : p.g === filter.tab));
  if (filter.cat) list = list.filter(p => p.cat === filter.cat);
  fill('#gridShop', list);
  $('#shopNone').hidden = list.length > 0;
  $$('#tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === filter.tab));
  $('#chipRow').hidden = !filter.cat;
  $('#chipTxt').textContent = `Category: ${filter.cat}`;
}
function renderStatic() {
  fill('#gridNew', P.filter(p => p.tags.includes('new')).slice(0, 4));
  fill('#gridBest', P.filter(p => p.tags.includes('best')).slice(0, 4));
  fill('#gridTrend', P.filter(p => p.tags.includes('trend')).slice(0, 4));
  const cats = (sel, arr, g) => { $(sel).innerHTML = arr.map(([c, d, pid], i) => `
    <button class="cat reveal" style="--d:${i * .08}s" data-g="${g}" data-c="${c}">${imgTag(byId(pid).img, c, 800)}
      <div class="cat-in"><h3>${c}</h3><p>${d}</p><span class="go">EXPLORE →</span></div></button>`).join(''); };
  cats('#catsWomen', W_CATS, 'women'); cats('#catsMen', M_CATS, 'men');
}
function setFilter(tab, cat = '') { filter.tab = tab; filter.cat = cat; renderShop(); }
function goShop() { $('#shop').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }

/* delegated clicks: cards, categories, filter links */
document.addEventListener('click', e => {
  const link = e.target.closest('[data-filter]');
  if (link) { e.preventDefault(); closeAll(); setFilter(link.dataset.filter); setTimeout(goShop, 60); return; }
  const cat = e.target.closest('.cat');
  if (cat) { setFilter(cat.dataset.g, cat.dataset.c); goShop(); return; }
  const a = e.target.closest('[data-act]'), pc = e.target.closest('.pcard');
  if (!a || !pc) return;
  const p = byId(pc.dataset.id);
  if (a.dataset.act === 'wish') { e.stopPropagation(); toggleWish(p.id, a); }
  else if (a.dataset.act === 'add') { e.stopPropagation(); addToCart(p.id, defaultSize(p), 1, false, pc.querySelector('.pimg img')); a.classList.add('added'); a.textContent = 'ADDED ✓'; setTimeout(() => { a.classList.remove('added'); a.textContent = 'ADD TO BAG'; }, 1300); }
  else if (a.dataset.act === 'view') openProduct(p.id);
});
$('#tabs').addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) setFilter(t.dataset.tab); });
$('#chipClear').onclick = () => setFilter(filter.tab);
// anchor links in the menu close the mobile menu
$$('.menu a').forEach(a => a.addEventListener('click', () => closeMenu()));

/* ---------------- wishlist ---------------- */
function toggleWish(id, btn) {
  const on = wish.includes(id);
  wish = on ? wish.filter(x => x !== id) : [...wish, id];
  store.set('vogue_wish', wish);
  $$(`.pcard[data-id="${id}"] .heart`).forEach(h => h.classList.toggle('on', !on));
  const wb = $('#wbtn'); if (wb && +wb.dataset.id === id) wb.classList.toggle('on', !on);
  updateCounts(); renderWish(); toast(on ? 'Removed from wishlist' : 'Saved to wishlist ♥');
}
function renderWish() {
  $('#wishBody').innerHTML = wish.length ? wish.map(byId).map(p => `
    <div class="line" data-id="${p.id}"><div class="pimg">${imgTag(p.img, p.name, 300)}</div>
      <div><h4>${p.name}</h4><small>${p.cat}</small><b class="price">${inr(p.price)}</b><br>
      <button class="rm" data-w="add" style="margin:.6rem 1rem 0 0">MOVE TO BAG</button><button class="rm" data-w="rm" style="margin:.6rem 0 0">REMOVE</button></div></div>`).join('')
    : '<div class="empty"><b>Your wishlist is empty</b>Tap the heart on any piece to save it here.</div>';
}
$('#wishBody').addEventListener('click', e => {
  const b = e.target.closest('[data-w]'); if (!b) return;
  const id = +b.closest('.line').dataset.id;
  if (b.dataset.w === 'rm') toggleWish(id);
  else { addToCart(id, defaultSize(byId(id)), 1, true); }
});

/* ---------------- cart ---------------- */
const defaultSize = p => p.sizes.includes('M') ? 'M' : p.sizes[0];
function addToCart(id, size, qty, silent, from) {
  const l = cart.find(x => x.id === id && x.size === size);
  l ? l.qty += qty : cart.push({ id, size, qty });
  saveCart();
  const bump = () => { const b = $('#btnBag'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); };
  from ? fly(from, bump) : bump();
  toast(`${byId(id).name} added to bag`);
}
function saveCart() { store.set('vogue_cart', cart); updateCounts(); renderCart(); }
const cartTotal = () => cart.reduce((s, l) => s + byId(l.id).price * l.qty, 0);
const cartCount = () => cart.reduce((s, l) => s + l.qty, 0);
function renderCart() {
  $('#cartBody').innerHTML = cart.length ? cart.map(l => { const p = byId(l.id); return `
    <div class="line" data-id="${l.id}" data-size="${l.size}"><div class="pimg">${imgTag(p.img, p.name, 300)}</div>
      <div><h4>${p.name}</h4><small>Size: ${l.size}</small><b class="price">${inr(p.price * l.qty)}</b><br>
      <span class="qty"><button data-q="-1" aria-label="Decrease quantity">−</button><span>${l.qty}</span><button data-q="1" aria-label="Increase quantity">+</button></span><button class="rm" data-q="rm">REMOVE</button></div></div>`; }).join('')
    : '<div class="empty"><b>Your bag is empty</b>Add a piece you love and it will appear here.</div>';
  $('#cartSub').textContent = inr(cartTotal());
  $('#cartFoot').hidden = !cart.length;
}
$('#cartBody').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const row = b.closest('.line'), id = +row.dataset.id, size = row.dataset.size;
  const l = cart.find(x => x.id === id && x.size === size);
  if (b.dataset.q === 'rm') cart = cart.filter(x => x !== l);
  else { l.qty += +b.dataset.q; if (l.qty < 1) cart = cart.filter(x => x !== l); }
  saveCart();
});
$('#checkout').onclick = () => {
  const n = cartCount(), t = cartTotal();
  cart = []; saveCart(); closeAll();
  toast(`Demo checkout: ${n} item(s), ${inr(t)}. No payment was taken. Thank you!`);
};
function updateCounts() {
  const w = $('#wishCount'), b = $('#bagCount');
  w.textContent = wish.length; w.dataset.n = wish.length;
  b.textContent = cartCount(); b.dataset.n = cartCount();
}

/* ---------------- product modal ---------------- */
function openProduct(id) {
  const p = byId(id); let size = defaultSize(p), qty = 1;
  $('#pBox').innerHTML = `<button class="close" data-close2 aria-label="Close"><svg><use href="#i-x"/></svg></button>
    <div class="p-det"><div class="pimg">${imgTag(p.img, p.name, 1000)}${p.tags.includes('new') ? '<span class="tag hot">NEW</span>' : ''}</div>
    <div class="p-info"><span class="cat-l">${p.g === 'men' ? 'MEN' : 'WOMEN'} · ${p.cat.toUpperCase()}</span><h2>${p.name}</h2><span class="price">${inr(p.price)}</span>
      <p>${p.desc}</p>
      <div><div class="lbl" style="margin-bottom:.5rem">SIZE</div><div class="sizes">${p.sizes.map(s => `<button data-s="${s}" class="${s === size ? 'on' : ''}">${s}</button>`).join('')}</div></div>
      <div class="p-actions"><span class="qty"><button data-m="-1" aria-label="Decrease">−</button><span id="mq">1</span><button data-m="1" aria-label="Increase">+</button></span>
        <button class="btn dark" id="mAdd">ADD TO BAG</button><button class="wbtn ${wish.includes(p.id) ? 'on' : ''}" id="wbtn" data-id="${p.id}" aria-label="Wishlist"><svg><use href="#i-heart"/></svg></button></div>
    </div></div>`;
  const box = $('#pBox');
  $('[data-close2]', box).onclick = () => closeAll();
  box.onclick = e => {
    const s = e.target.closest('[data-s]'), m = e.target.closest('[data-m]');
    if (s) { size = s.dataset.s; $$('.sizes button', box).forEach(x => x.classList.toggle('on', x === s)); }
    if (m) { qty = Math.min(10, Math.max(1, qty + +m.dataset.m)); $('#mq').textContent = qty; }
    if (e.target.closest('#wbtn')) toggleWish(p.id);
    if (e.target.closest('#mAdd')) { addToCart(p.id, size, qty, false, $('#pBox .pimg img')); const a = $('#mAdd'); a.classList.add('added'); a.textContent = 'ADDED ✓'; setTimeout(() => { a.classList.remove('added'); a.textContent = 'ADD TO BAG'; }, 1300); }
  };
  openLayer('pModal');
}

/* ---------------- search ---------------- */
$('#searchInput').addEventListener('input', e => {
  const terms = e.target.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) { $('#searchRes').innerHTML = ''; $('#searchNone').hidden = true; return; }
  const words = p => `${p.name} ${p.cat} ${p.g} ${p.g === 'men' ? "men's mens" : "women's womens"} ${p.tags.includes('new') ? 'new arrival arrivals' : ''}`.toLowerCase().split(/[\s-]+/);
  const res = P.filter(p => { const w = words(p); return terms.every(t => w.some(x => x.startsWith(t))); });
  $('#searchRes').innerHTML = res.map(card).join(''); watch();
  $('#searchNone').hidden = res.length > 0;
});

/* ---------------- auth (demo only) ---------------- */
const sw = $('#authSwitch'), fIn = $('#formIn'), fUp = $('#formUp');
function setMode(m) {
  sw.classList.toggle('up', m === 'up');
  $$('button', sw).forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  fIn.classList.toggle('on', m === 'in'); fUp.classList.toggle('on', m === 'up');
}
$$('button', sw).forEach(b => b.onclick = () => setMode(b.dataset.mode));
$$('.eye').forEach(b => b.onclick = () => {
  const i = b.previousElementSibling, show = i.type === 'password';
  i.type = show ? 'text' : 'password'; b.classList.toggle('on', show); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
function check(form, rules) {
  let ok = true;
  $$('label', form).forEach(l => { $('em', l).textContent = ''; $('input', l).classList.remove('bad'); });
  rules.forEach(([name, test, msg]) => {
    const inp = form.elements[name], v = inp.value.trim();
    if (!test(v, form)) { ok = false; const l = inp.closest('label'); $('em', l).textContent = msg; inp.classList.add('bad'); }
  });
  return ok;
}
fIn.addEventListener('submit', e => {
  e.preventDefault();
  if (!check(fIn, [['email', emailOk, 'Enter a valid email address.'], ['password', v => v.length >= 6, 'Password must be at least 6 characters.']])) return;
  currentUser = fIn.elements.email.value.split('@')[0]; fIn.reset(); closeAll(); toast(`Welcome back, ${currentUser} (demo sign-in)`);
});
fUp.addEventListener('submit', e => {
  e.preventDefault();
  if (!check(fUp, [
    ['name', v => v.length >= 2, 'Please enter your full name.'],
    ['email', emailOk, 'Enter a valid email address.'],
    ['password', v => v.length >= 6 && /\d/.test(v), 'Use 6+ characters including a number.'],
    ['confirm', (v, f) => v === f.elements.password.value && v !== '', 'Passwords do not match.']])) return;
  currentUser = fUp.elements.name.value.trim().split(' ')[0]; fUp.reset(); closeAll(); setMode('in'); toast(`Account created for ${currentUser} (demo only)`);
});

/* ---------------- newsletter ---------------- */
$('#newsForm').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('#newsEmail').value.trim(), m = $('#newsMsg');
  if (!emailOk(v)) { m.textContent = 'Please enter a valid email address.'; m.className = 'err'; return; }
  m.textContent = 'Thank you — you’re on the list (demo).'; m.className = ''; $('#newsEmail').value = ''; toast('Subscribed to VOGUE updates');
});

/* ---------------- scroll effects ---------------- */
const nav = $('#nav'), bar = $('#scrollbar'), ed = $('#edBg'), edSec = ed.parentElement;
let tick = false;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle('solid', y > 40); bar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
  if (!reduce) { const r = edSec.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) ed.style.transform = `translateY(${(r.top * -0.12).toFixed(1)}px)`; }
  tick = false;
}
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
ed.style.backgroundImage = `url(${U('1558769132-cb1aea458c5e', 1800)})`;

const io = 'IntersectionObserver' in window
  ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 })
  : { observe: el => el.classList.add('in'), unobserve() {} };
const watch = () => $$('.reveal:not(.in), .pcard:not(.in)').forEach(el => io.observe(el));

/* ================= EXTRA ANIMATIONS ================= */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* fly-to-bag */
function fly(from, done) {
  const b = $('#btnBag').getBoundingClientRect(), r = from.getBoundingClientRect();
  if (reduce || !from.animate || !r.width) return done();
  const el = document.createElement('div'); el.className = 'fly';
  el.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background-image:url("${from.currentSrc || from.src}")`;
  document.body.append(el);
  const dx = b.left + b.width / 2 - (r.left + r.width / 2), dy = b.top + b.height / 2 - (r.top + r.height / 2);
  const a = el.animate([
    { transform: 'none', opacity: 1, borderRadius: '4px' },
    { transform: `translate(${dx * .45}px,${dy * .45 - 70}px) scale(.4) rotate(-8deg)`, opacity: .95, offset: .55 },
    { transform: `translate(${dx}px,${dy}px) scale(.04)`, opacity: .2, borderRadius: '50%' }
  ], { duration: 850, easing: 'cubic-bezier(.5,0,.2,1)' });
  a.onfinish = () => { el.remove(); done(); };
}

/* word-by-word headings */
function splitWords(el) {
  let n = 0;
  (function walk(node) {
    [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) frag.append(' ');
          else { const w = document.createElement('span'); w.className = 'w'; const i = document.createElement('span'); i.textContent = t; i.style.setProperty('--wi', n++); w.append(i); frag.append(w); }
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
    });
  })(el);
}
$$('.sec-head h2, .ed-copy h2, .story-copy h2, .news h2').forEach(splitWords);

/* footer stagger */
$$('.f-grid > div').forEach((d, i) => { d.classList.add('reveal'); d.style.setProperty('--d', i * .1 + 's'); });

/* count-up facts */
if (!reduce) {
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, to = parseInt(el.dataset.to, 10), suf = el.dataset.suf, t0 = performance.now();
    (function step(now) { const p = Math.min(1, (now - t0) / 1800), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e) + suf; if (p < 1) requestAnimationFrame(step); })(t0);
  }), { threshold: .6 });
  $$('.facts b').forEach(b => { b.dataset.to = parseInt(b.textContent, 10); b.dataset.suf = b.textContent.replace(/\d/g, ''); b.textContent = '0' + b.dataset.suf; cio.observe(b); });
}

/* hero mouse parallax */
const hero = $('.hero');
if (fine && !reduce) hero.addEventListener('pointermove', e => {
  const r = hero.getBoundingClientRect();
  hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * 2);
  hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5) * 2);
});
$$('.float-card').forEach(b => b.addEventListener('click', () => openProduct(+b.dataset.pid)));

/* back-to-top ring */
const topBtn = document.createElement('button');
topBtn.className = 'totop'; topBtn.setAttribute('aria-label', 'Back to top');
topBtn.innerHTML = '<svg viewBox="0 0 44 44"><circle class="trk" cx="22" cy="22" r="20"/><circle class="prg" cx="22" cy="22" r="20"/></svg><span>↑</span>';
document.body.append(topBtn);
topBtn.onclick = () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
const prg = $('.prg', topBtn);
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  prg.style.strokeDashoffset = 125.7 * (1 - (max > 0 ? y / max : 0));
  topBtn.classList.toggle('show', y > 800);
  const busy = menu.classList.contains('open') || document.body.classList.contains('locked');
  if (y > 420 && y > lastY + 6 && !busy) nav.classList.add('hide'); else if (y < lastY - 6 || busy) nav.classList.remove('hide');
  lastY = y;
}, { passive: true });

/* button ripple */
document.addEventListener('click', e => {
  const b = e.target.closest('.btn'); if (!b || reduce) return;
  const r = b.getBoundingClientRect(), s = document.createElement('span');
  s.className = 'ripple'; s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
  b.append(s); setTimeout(() => s.remove(), 750);
});

if (fine && !reduce) {
  /* magnetic buttons */
  let mag = null;
  document.addEventListener('pointermove', e => {
    const t = e.target.closest('.btn, .ic, .totop');
    if (mag && mag !== t) { mag.style.transform = ''; mag = null; }
    if (!t) return; mag = t;
    const r = t.getBoundingClientRect();
    t.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .32}px)`;
  });
  /* 3D tilt on product images */
  document.addEventListener('pointermove', e => {
    const im = e.target.closest('.pcard .pimg'); if (!im) return;
    const r = im.getBoundingClientRect();
    im.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 8).toFixed(2) + 'deg');
    im.style.setProperty('--rx', (((e.clientY - r.top) / r.height - .5) * -8).toFixed(2) + 'deg');
  });
  document.addEventListener('pointerout', e => { const im = e.target.closest && e.target.closest('.pcard .pimg'); if (im && !im.contains(e.relatedTarget)) { im.style.setProperty('--rx', '0deg'); im.style.setProperty('--ry', '0deg'); } });

  /* custom cursor ring */
  const ring = document.createElement('div'); ring.className = 'cursor'; ring.innerHTML = '<span></span>'; document.body.append(ring);
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; ring.classList.add('on'); });
  document.addEventListener('mouseleave', () => ring.classList.remove('on'));
  (function loop() { cx += (tx - cx) * .18; cy += (ty - cy) * .18; ring.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('a, button, input, .tab, .pimg, .cat');
    ring.classList.toggle('hover', !!t);
    const label = e.target.closest('.cat') ? 'EXPLORE' : (e.target.closest('.pcard .pimg') && !e.target.closest('button')) ? 'VIEW' : '';
    ring.classList.toggle('label', !!label); ring.firstChild.textContent = label;
  });
}

/* ---------------- init ---------------- */
renderStatic(); renderShop(); renderCart(); renderWish(); updateCounts(); watch(); onScroll();
})();
