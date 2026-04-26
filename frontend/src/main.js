// ─── API Configuration ────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ─── State ────────────────────────────────────────────────────────────────────
let IS_RAMADAN = false;
let MENU_DATA = [];
let cart = [];
let orders = [];
let reservations = [];

// ─── API Helper ───────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  await checkRamadan();
  await loadMenu();
  await loadReservations();
  await loadOrders();
  observeFade();
  document.getElementById('resDate').valueAsDate = new Date();
}

// ─── Ramadan ──────────────────────────────────────────────────────────────────
async function checkRamadan() {
  try {
    const data = await apiFetch('/ramadan');
    IS_RAMADAN = data.isRamadan;
  } catch {
    // Fallback: detect locally
    const now = new Date();
    const year = now.getFullYear();
    IS_RAMADAN = now >= new Date(`${year}-03-01`) && now <= new Date(`${year}-03-30`);
  }
  if (IS_RAMADAN) activateRamadanMode();
}

function activateRamadanMode() {
  // Stars background
  const sb = document.getElementById('starsBg');
  sb.classList.add('active');
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${Math.random()*3+1}px;height:${Math.random()*3+1}px;animation-delay:${Math.random()*3}s;animation-duration:${2+Math.random()*3}s;`;
    sb.appendChild(s);
  }
  // Show Ramadan UI elements
  const show = ids => ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'block'; });
  const showFlex = ids => ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'flex'; });
  showFlex(['ramadanBanner', 'ramadanPill']);
  show(['ramadanFilterBtn', 'sahourOpt', 'iftarOpt', 'sahourRes', 'iftarRes', 'ramadanResBtn', 'footerSahour', 'footerIftar', 'heroRamadanStat', 'heroRamadanLbl']);
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
async function loadMenu() {
  const loading = document.getElementById('menuLoading');
  const errorEl = document.getElementById('menuError');
  const filtersEl = document.getElementById('menuFilters');
  try {
    loading.style.display = 'block';
    errorEl.style.display = 'none';
    const data = await apiFetch('/menu');
    MENU_DATA = data.data;
    loading.style.display = 'none';
    filtersEl.style.display = 'flex';
    renderMenu('all');
  } catch (err) {
    loading.style.display = 'none';
    errorEl.style.display = 'block';
    console.error('Menu load error:', err);
  }
}

function renderMenu(filter) {
  const grid = document.getElementById('menuGrid');
  let items = filter === 'all' ? MENU_DATA : MENU_DATA.filter(m => m.cat === filter);
  if (!IS_RAMADAN) items = items.filter(m => !m.ramadan);

  grid.innerHTML = items.map(m => {
    const serviceLabel = { lunch: 'Déjeuner', dinner: 'Dîner', sahour: 'Sahour ☪️', iftar: 'Iftar ☪️', both: 'Déjeuner & Dîner' }[m.service] || 'Déjeuner';
    const serviceClass = { lunch: 'type-lunch', dinner: 'type-dinner', sahour: 'type-ramadan', iftar: 'type-ramadan', both: 'type-both' }[m.service] || 'type-both';
    const disc = IS_RAMADAN && m.ramadan ? `<div class="disc-badge">-15%</div>` : '';
    return `<article class="menu-card ${m.ramadan ? 'ramadan-card' : ''} fade-in" role="listitem">
      ${disc}
      <div class="menu-img" aria-hidden="true">
        <span class="meal-type ${serviceClass}">${serviceLabel}</span>
        ${m.emoji}
      </div>
      <div class="menu-body">
        <div class="menu-name">${m.name}</div>
        <p class="menu-desc">${m.desc}</p>
        <div class="menu-foot">
          <div class="${m.ramadan ? 'menu-price ramadan-price' : 'menu-price'}" aria-label="Prix: ${m.price.toFixed(3)} dinars tunisiens">${m.price.toFixed(3)} DT</div>
          <button class="add-cart" onclick="addToCart(${m.id})" aria-label="Ajouter ${m.name} au panier">+</button>
        </div>
      </div>
    </article>`;
  }).join('');
  observeFade();
}

window.filterMenu = function(cat, btn) {
  document.querySelectorAll('.mf-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  renderMenu(cat);
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
window.addToCart = function(id) {
  const item = MENU_DATA.find(m => m.id === id);
  if (!item) return;
  const ex = cart.find(c => c.id === id);
  if (ex) ex.qty++;
  else cart.push({ ...item, qty: 1 });
  updateCartBadge();
  showToast(`${item.emoji} ${item.name} ajouté !`);
};

function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartBadge').textContent = count;
}

window.openModal = function() {
  document.getElementById('cartModal').classList.add('open');
  renderCartModal();
  document.querySelector('.modal-close').focus();
};

window.closeModal = function() {
  document.getElementById('cartModal').classList.remove('open');
};

// Close modal on overlay click
document.getElementById('cartModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function renderCartModal() {
  const list = document.getElementById('cartItemsList');
  if (cart.length === 0) {
    list.innerHTML = `<div class="empty-cart"><div class="icon">🛒</div><p>Votre panier est vide.<br>Ajoutez des plats depuis le menu !</p></div>`;
    document.getElementById('cartSummaryBox').innerHTML = '';
    document.getElementById('checkoutForm').style.display = 'none';
    return;
  }
  document.getElementById('checkoutForm').style.display = 'block';
  list.innerHTML = cart.map((i, idx) => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${i.emoji} ${i.name}</div>
        <div class="cart-item-sub">${i.price.toFixed(3)} DT × ${i.qty}</div>
      </div>
      <div class="cart-item-right">
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty(${idx},-1)" aria-label="Diminuer quantité">−</button>
          <div class="qty-num" aria-live="polite">${i.qty}</div>
          <button class="qty-btn" onclick="changeQty(${idx},1)" aria-label="Augmenter quantité">+</button>
        </div>
        <div class="cart-price">${(i.price * i.qty).toFixed(3)} DT</div>
      </div>
    </div>`).join('');
  updateCartSummary();
}

window.changeQty = function(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartBadge();
  renderCartModal();
};

function updateCartSummary() {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasRamadan = cart.some(i => i.ramadan);
  const disc = (IS_RAMADAN && hasRamadan) ? sub * 0.15 : 0;
  const total = sub - disc;
  const discRow = disc > 0 ? `<div class="summary-row ramadan-disc"><span>☪️ Remise Ramadan (-15%)</span><span>-${disc.toFixed(3)} DT</span></div>` : '';
  document.getElementById('cartSummaryBox').innerHTML = `
    <div class="cart-summary">
      <div class="summary-row"><span>Sous-total</span><span>${sub.toFixed(3)} DT</span></div>
      ${discRow}
      <div class="summary-row total"><span>Total</span><span>${total.toFixed(3)} DT</span></div>
    </div>`;
}

// ─── Place Order ──────────────────────────────────────────────────────────────
window.placeOrder = async function() {
  const name = document.getElementById('orderName').value.trim() || 'Client';
  const typeEl = document.getElementById('orderType');
  const mealEl = document.getElementById('orderMeal');
  if (cart.length === 0) { showToast('Panier vide !'); return; }

  const btn = document.querySelector('.place-order-btn');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';

  try {
    const result = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        client: name,
        type: typeEl.value,
        meal: mealEl.value,
        items: cart.map(i => i.id),
      }),
    });
    orders.unshift(result.data);
    cart = [];
    updateCartBadge();
    closeModal();
    showToast('🎉 Commande confirmée ! Merci ' + name);
    renderTrack();
  } catch (err) {
    showToast('⚠️ Erreur : ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ Confirmer la commande';
  }
};

// ─── Reservations ─────────────────────────────────────────────────────────────
async function loadReservations() {
  try {
    const data = await apiFetch('/reservations');
    reservations = data.data;
    renderReservations();
  } catch { renderReservations(); }
}

function renderReservations() {
  const list = document.getElementById('resList');
  list.innerHTML = reservations.length === 0
    ? '<p style="color:var(--muted);font-size:13px;text-align:center;padding:20px;">Aucune réservation aujourd\'hui</p>'
    : reservations.map(r => `
    <div class="res-item ${r.ramadan ? 'ramadan-res' : ''}">
      <div>
        <div class="ri-name">${r.name}</div>
        <div class="ri-meta">${r.type} • ${r.time} • ${r.persons} pers.</div>
      </div>
      <span class="ri-badge ${r.ramadan ? 'badge-ramadan' : r.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}">${r.ramadan ? '☪️ Ramadan' : r.status === 'confirmed' ? 'Confirmé' : 'En attente'}</span>
    </div>`).join('');
}

window.addReservation = async function(isRamadan) {
  const name = document.getElementById('resName').value.trim() || 'Nouveau client';
  const typeEl = document.getElementById('resType');
  const timeEl = document.getElementById('resTime');
  const date = document.getElementById('resDate').value || new Date().toISOString().split('T')[0];
  const persons = document.getElementById('resPersons').value || 1;
  const notes = document.getElementById('resNotes').value || '';
  const time = isRamadan ? (IS_RAMADAN ? 'Iftar 19h30 ☪️' : 'Dîner 19h30') : timeEl.options[timeEl.selectedIndex].text;

  const btn = isRamadan ? document.querySelector('.res-btn.ramadan') : document.querySelector('.res-btn:not(.ramadan)');
  if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }

  try {
    const result = await apiFetch('/reservations', {
      method: 'POST',
      body: JSON.stringify({
        name, type: typeEl.value, time, persons: Number(persons), date,
        ramadan: isRamadan && IS_RAMADAN, notes,
      }),
    });
    reservations.unshift(result.data);
    renderReservations();
    showToast(`✅ Réservation confirmée — ${name} (${persons} pers.)`);
    document.getElementById('resName').value = '';
    document.getElementById('resNotes').value = '';
  } catch (err) {
    showToast('⚠️ Erreur : ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = isRamadan ? '☪️ Réservation Iftar Ramadan' : '✅ Confirmer la Réservation'; }
  }
};

// ─── Tracking ─────────────────────────────────────────────────────────────────
async function loadOrders() {
  try {
    const data = await apiFetch('/orders');
    orders = data.data;
    renderTrack();
  } catch { renderTrack(); }
}

function renderTrack() {
  const g = document.getElementById('trackGrid');
  if (orders.length === 0) {
    g.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;grid-column:1/-1;">Aucune commande en cours.</p>';
    return;
  }
  g.innerHTML = orders.map(o => {
    const sc = o.status === 'preparing' ? 'sp-prep' : o.status === 'ready' ? 'sp-ready' : 'sp-delivered';
    const sl = o.status === 'preparing' ? 'En préparation 🔥' : o.status === 'ready' ? 'Prêt ! ✅' : 'Livré 📦';
    return `<div class="track-card fade-in" role="listitem">
      <div class="track-head">
        <div>
          <div class="track-id">${o.id} • ${o.meal}</div>
          <div class="track-client">${o.client}</div>
          <div style="font-size:11px;color:var(--muted)">${o.type}</div>
        </div>
        <span class="status-pill ${sc}">${sl}</span>
      </div>
      <div class="progress-track">
        <div class="prog-bar" role="progressbar" aria-valuenow="${o.progress}" aria-valuemin="0" aria-valuemax="100">
          <div class="prog-fill" style="width:${o.progress}%"></div>
        </div>
        <div class="prog-steps">
          <span class="${o.progress >= 10 ? 'ps-done' : ''}">Reçue</span>
          <span class="${o.progress >= 40 ? 'ps-done' : ''}">Cuisine</span>
          <span class="${o.progress >= 75 ? 'ps-done' : ''}">Prêt</span>
          <span class="${o.progress >= 100 ? 'ps-done' : ''}">Livré</span>
        </div>
      </div>
      <div class="track-items">${o.items.join(' • ')}</div>
      <div class="track-total">${o.total.toFixed(3)} DT</div>
    </div>`;
  }).join('');
  observeFade();
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
async function loadSubscriptions() {
  try {
    const data = await apiFetch('/menu/subscriptions/plans');
    renderSubscriptions(data.data);
  } catch { renderSubscriptionsDefault(); }
}

function renderSubscriptions(plans) {
  const grid = document.getElementById('aboGrid');
  grid.innerHTML = plans.map(p => `
    <div class="abo-card ${p.featured ? 'featured' : ''} fade-in" role="listitem">
      ${p.featured ? '<div class="popular-tag">⭐ Populaire</div>' : ''}
      <div class="abo-icon">${p.icon}</div>
      <div class="abo-who">${p.audience}</div>
      <div class="abo-name">${p.name}</div>
      <div class="abo-price-box">
        <div class="abo-price"><sup>DT</sup>${p.monthlyPrice}<sub>/mois</sub></div>
        ${IS_RAMADAN ? `<div class="abo-ramadan-price" style="display:block"><span>☪️ Ramadan : ${p.ramadanPrice} DT/mois</span></div>` : ''}
      </div>
      <ul class="abo-features">
        ${p.features.map(f => `<li class="${f.included ? '' : 'grey'}">${f.text}</li>`).join('')}
      </ul>
      <button class="subscribe-btn" onclick="subscribe('${p.name}', ${p.monthlyPrice})">S'abonner — ${p.monthlyPrice} DT/mois</button>
      ${IS_RAMADAN ? `<button class="subscribe-btn ramadan-btn" onclick="subscribe('${p.name} Ramadan', ${p.ramadanPrice})">☪️ Offre Ramadan — ${p.ramadanPrice} DT</button>` : ''}
    </div>`).join('');
  observeFade();
}

function renderSubscriptionsDefault() {
  // Fallback hardcoded
  const plans = [
    { id: 'etudiant', name: 'Étudiant', icon: '🎓', audience: 'ÉTUDIANT', monthlyPrice: 45, ramadanPrice: 38, features: [{ text: 'Déjeuner quotidien (5j/sem)', included: true }, { text: 'Plat du jour + Boisson', included: true }, { text: 'Accès cafétéria prioritaire', included: true }, { text: 'Carte de fidélité', included: true }, { text: 'Dîner inclus', included: false }] },
    { id: 'enseignant', name: 'Enseignant', icon: '👨‍🏫', audience: 'ENSEIGNANT', monthlyPrice: 65, ramadanPrice: 55, featured: true, features: [{ text: 'Déjeuner + Dîner (5j/sem)', included: true }, { text: 'Menu Premium au choix', included: true }, { text: 'Salle réservée enseignants', included: true }, { text: 'Invité 1×/mois offert', included: true }, { text: 'Réservation table en ligne', included: true }] },
    { id: 'externe', name: 'Externe', icon: '🏢', audience: 'PERSONNEL EXTERNE', monthlyPrice: 85, ramadanPrice: 72, features: [{ text: 'Déjeuner + Dîner (5j/sem)', included: true }, { text: 'Accès menu complet', included: true }, { text: 'Facturation mensuelle', included: true }, { text: 'Accès weekend (sam.)', included: true }, { text: 'Badge accès dédié', included: true }] },
  ];
  renderSubscriptions(plans);
}

window.subscribe = function(type, price) {
  showToast(`📋 Abonnement ${type} sélectionné — ${price} DT/mois. Contactez la caisse !`);
};

// ─── Utils ────────────────────────────────────────────────────────────────────
window.goTo = function(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('show'), 3500);
}

function observeFade() {
  const els = document.querySelectorAll('.fade-in:not(.visible)');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}

// Nav active state on scroll
window.addEventListener('scroll', () => {
  const sections = ['hero', 'menu', 'abonnement', 'reservation', 'tracking'];
  let current = 'hero';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 100) current = id;
  });
  document.querySelectorAll('.nav-link').forEach((btn, i) => {
    btn.classList.toggle('active', sections[i] === current);
  });
}, { passive: true });

// ─── Start ────────────────────────────────────────────────────────────────────
init();
loadSubscriptions();
