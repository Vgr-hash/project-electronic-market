/* Məişət və Texnologiya Mağazası — ortaq skript
 * Məhsullar /api/products-dan yüklənir, səbət localStorage-da productId ilə saxlanılır.
 */
const CART_KEY = 'meiset_cart_v2';
const MAX_QTY = 99;

const CATEGORY_SLUGS = {
  'Telefonlar və aksesuarlar': 'telefon',
  'Noutbuk və kompüterlər': 'noutbuk',
  'Televizorlar': 'tv',
  'Soyuducular': 'soyuducu',
  'Paltaryuyan maşınlar': 'paltaryuyan',
  'Mətbəx texnikası': 'metbex',
  'Audio və qulaqlıqlar': 'audio',
  'Ağıllı ev cihazları': 'smart'
};

let productsPromise = null;

const $ = (sel, root = document) => root.querySelector(sel);

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function money(n) {
  return new Intl.NumberFormat('az-AZ').format(Number(n) || 0) + ' ₼';
}

/* ---------- Məhsullar ---------- */

function loadProducts() {
  if (!productsPromise) {
    productsPromise = fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('API cavabı: HTTP ' + res.status);
        return res.json();
      })
      .catch(err => {
        productsPromise = null; // növbəti cəhddə yenidən yoxlasın
        throw err;
      });
  }
  return productsPromise;
}

function cardHtml(p) {
  const slug = CATEGORY_SLUGS[p.category] || '';
  const search = [p.name, p.description, p.category].join(' ').toLowerCase();
  return `
<article class="product-card" data-category="${esc(slug)}" data-search="${esc(search)}">
  <div class="product-photo">
    <img src="${esc(p.imageUrl)}" alt="${esc(p.name)}" loading="lazy">
    <span class="tag">Yeni</span>
  </div>
  <div class="product-info">
    <span class="product-category">${esc(p.category)}</span>
    <h3>${esc(p.name)}</h3>
    <div class="spec">${esc(p.description || '')}</div>
    <div class="product-bottom">
      <span class="price">${money(p.price)}</span>
      <button class="add-btn" type="button" data-product-id="${esc(p.id)}" aria-label="Səbətə əlavə et" title="Səbətə əlavə et">+</button>
    </div>
  </div>
</article>`;
}

async function renderCatalog() {
  const grid = $('#grid') || $('#productsGrid');
  if (!grid) return;

  const scope = grid.dataset.catalog || 'all';
  grid.innerHTML = '<p class="catalog-status">Məhsullar yüklənir...</p>';

  let products;
  try {
    products = await loadProducts();
  } catch (err) {
    console.error('Məhsullar yüklənmədi:', err);
    grid.innerHTML = '<p class="catalog-status">Məhsullar yüklənmədi. Serverin işlədiyini yoxlayın (http://localhost:8080 açılmalıdır).</p>';
    return;
  }

  if (!products.length) {
    grid.innerHTML = '<p class="catalog-status">Bazada məhsul tapılmadı. MySQL-də database/database.sql faylını icra edin.</p>';
    return;
  }

  const list = scope === 'all' ? products : products.filter(p => p.category === scope);
  if (!list.length) {
    grid.innerHTML = '<p class="catalog-status">Bu kateqoriyada hələ məhsul yoxdur.</p>';
    return;
  }

  grid.innerHTML = list.map(cardHtml).join('');
  applyFilters();
}

function applyFilters() {
  const grid = $('#grid') || $('#productsGrid');
  if (!grid) return;

  const searchInput = $('#search') || $('#productSearch');
  const query = (searchInput?.value || '').trim().toLowerCase();
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

  let shown = 0;
  grid.querySelectorAll('.product-card').forEach(card => {
    const matchCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchSearch = !query || card.dataset.search.includes(query);
    const visible = matchCategory && matchSearch;
    card.style.display = visible ? '' : 'none';
    if (visible) shown++;
  });

  // Boş vəziyyət mesajı yoxdursa, grid-dən sonra yaradılır
  let empty = $('#empty');
  if (!empty) {
    empty = document.createElement('div');
    empty.id = 'empty';
    empty.className = 'empty';
    empty.textContent = 'Axtarışa uyğun məhsul tapılmadı.';
    grid.insertAdjacentElement('afterend', empty);
  }
  if (empty) empty.style.display = shown ? 'none' : 'block';
}

function setupCatalogControls() {
  const searchInput = $('#search') || $('#productSearch');
  if (searchInput) searchInput.addEventListener('input', applyFilters);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
      applyFilters();
    });
  });
}

/* ---------- Səbət ---------- */

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadges();
}

function updateCartBadges() {
  const count = readCart().reduce((sum, p) => sum + p.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = count; });
}

async function addToCart(btn) {
  const id = Number(btn.dataset.productId);
  let products;
  try {
    products = await loadProducts();
  } catch {
    alert('Məhsul məlumatı yüklənmədi. Səhifəni yeniləyin.');
    return;
  }
  const product = products.find(p => p.id === id);
  if (!product) return;

  const cart = readCart();
  const line = cart.find(x => x.productId === id);
  if (line) {
    if (line.quantity >= MAX_QTY) {
      alert('Eyni məhsuldan maksimum 99 ədəd sifariş edə bilərsiniz.');
      return;
    }
    line.quantity++;
  } else {
    cart.push({
      productId: id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      category: product.category,
      quantity: 1
    });
  }
  saveCart(cart);

  const oldText = btn.textContent;
  btn.textContent = '✓';
  setTimeout(() => { btn.textContent = oldText || '+'; }, 650);
}

function renderCart() {
  const host = $('#cartItems');
  const sumEl = $('#cartTotal');
  if (!host) return;

  const cart = readCart();
  host.innerHTML = '';

  if (!cart.length) {
    host.innerHTML = '<div class="empty-cart">🛒<h2>Səbətiniz boşdur</h2><p>Məhsullara baxıb səbətə əlavə edə bilərsiniz.</p><a class="primary" href="index.html#products">Məhsullara qayıt</a></div>';
    if (sumEl) sumEl.textContent = money(0);
    return;
  }

  cart.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <img alt="">
      <div class="cart-desc"><strong></strong><small></small><b></b></div>
      <div class="qty">
        <button type="button" data-action="minus" data-index="${i}">−</button>
        <span></span>
        <button type="button" data-action="plus" data-index="${i}">+</button>
      </div>
      <button type="button" class="remove" data-action="remove" data-index="${i}" aria-label="Sil">×</button>`;
    row.querySelector('img').src = p.image || '';
    row.querySelector('strong').textContent = p.name;
    row.querySelector('small').textContent = p.category;
    row.querySelector('b').textContent = money(p.price);
    row.querySelector('.qty span').textContent = p.quantity;
    host.appendChild(row);
  });

  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);
  if (sumEl) sumEl.textContent = money(total);
}

function changeCart(index, action) {
  const cart = readCart();
  if (!cart[index]) return;
  if (action === 'remove') {
    cart.splice(index, 1);
  } else if (action === 'plus') {
    if (cart[index].quantity >= MAX_QTY) {
      alert('Eyni məhsuldan maksimum 99 ədəd sifariş edə bilərsiniz.');
      return;
    }
    cart[index].quantity++;
  } else if (action === 'minus') {
    cart[index].quantity--;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
  }
  saveCart(cart);
  renderCart();
}

/* ---------- Sifariş təntənəsi (fişəng + yazı) ---------- */

const CELEBRATE_TEXT = 'SİFARİŞİNİZ QƏBUL EDİLDİ';
const CELEBRATE_MS = 5000;

function ensureCelebrateStyles() {
  if (document.getElementById('celebrate-style')) return;
  const style = document.createElement('style');
  style.id = 'celebrate-style';
  style.textContent = `
    .celebrate{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;
      background:radial-gradient(circle at 50% 45%,rgba(16,27,52,.92),rgba(5,9,20,.97));
      cursor:pointer;overflow:hidden;opacity:0;transition:opacity .45s ease}
    .celebrate.show{opacity:1}
    .celebrate.hide{opacity:0}
    .celebrate canvas{position:absolute;inset:0;width:100%;height:100%}
    .celebrate-text{position:relative;z-index:1;margin:0 20px;text-align:center;
      font-family:Inter,system-ui,Segoe UI,sans-serif;font-weight:900;text-transform:uppercase;
      font-size:clamp(28px,7.2vw,96px);line-height:1.08;letter-spacing:.02em;
      background:linear-gradient(90deg,#ffd166,#ff6b6b,#4cc9f0,#b8f2e6,#ffd166);background-size:300% 100%;
      -webkit-background-clip:text;background-clip:text;color:transparent;
      text-shadow:0 0 40px rgba(255,209,102,.25);
      transform:scale(.4);opacity:0;animation:celebrate-pop .7s cubic-bezier(.2,1.4,.4,1) .1s forwards,
        celebrate-shine 2.4s linear .1s infinite}
    @keyframes celebrate-pop{to{transform:scale(1);opacity:1}}
    @keyframes celebrate-shine{from{background-position:0% 50%}to{background-position:300% 50%}}
    @media (prefers-reduced-motion: reduce){.celebrate-text{animation:celebrate-pop .3s .05s forwards}}
  `;
  document.head.appendChild(style);
}

function celebrateOrder() {
  ensureCelebrateStyles();

  const overlay = document.createElement('div');
  overlay.className = 'celebrate';
  overlay.innerHTML = `<canvas></canvas><h1 class="celebrate-text"></h1>`;
  overlay.querySelector('.celebrate-text').textContent = CELEBRATE_TEXT;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  const canvas = overlay.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['#ffd166', '#ff6b6b', '#4cc9f0', '#b8f2e6', '#c77dff', '#ffffff', '#06d6a0'];
  const particles = [];
  let width = 0, height = 0, dpr = 1, rafId = 0, lastBurst = 0, startedAt = performance.now();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.1;
      const speed = 2 + Math.random() * 4.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.012,
        color: Math.random() < 0.15 ? colors[Math.floor(Math.random() * colors.length)] : color,
        size: 1.5 + Math.random() * 1.8
      });
    }
  }

  function frame(now) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    if (!reduceMotion && now - lastBurst > 380 && now - startedAt < CELEBRATE_MS - 900) {
      lastBurst = now;
      burst(width * (0.15 + Math.random() * 0.7), height * (0.12 + Math.random() * 0.45));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.045;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    rafId = requestAnimationFrame(frame);
  }

  function close() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    clearTimeout(autoClose);
    overlay.classList.remove('show');
    overlay.classList.add('hide');
    setTimeout(() => overlay.remove(), 500);
  }

  resize();
  window.addEventListener('resize', resize);
  overlay.addEventListener('click', close);
  if (!reduceMotion) {
    burst(width / 2, height * 0.3);
    setTimeout(() => burst(width * 0.3, height * 0.25), 250);
    setTimeout(() => burst(width * 0.7, height * 0.3), 500);
  }
  rafId = requestAnimationFrame(frame);
  const autoClose = setTimeout(close, CELEBRATE_MS);
}

/* ---------- Sifariş ---------- */

async function placeOrder(e) {
  e.preventDefault();
  const cart = readCart();
  if (!cart.length) {
    alert('Səbət boşdur.');
    return;
  }

  const form = e.target;
  const payload = {
    customer_name: form.customer_name.value.trim(),
    phone: form.phone.value.trim(),
    address: form.address.value.trim(),
    note: form.note.value.trim(),
    items: cart.map(p => ({ productId: p.productId, quantity: p.quantity }))
  };

  const button = form.querySelector('button[type=submit]');
  button.disabled = true;
  button.textContent = 'Göndərilir...';

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Sifariş göndərilmədi.');
    }

    localStorage.removeItem(CART_KEY);
    updateCartBadges();
    renderCart();
    form.reset();

    celebrateOrder();
  } catch (err) {
    alert('Sifariş zamanı xəta: ' + err.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Sifariş et';
  }
}

/* ---------- Qeydiyyat (modal) ---------- */

function setupAuth() {
  const modal = $('#auth-modal');
  const btn = $('#auth-btn');
  const closeBtn = $('#close-modal');
  const form = $('#user-register-form');
  const toast = $('#success-toast');

  if (btn && modal) btn.onclick = () => { modal.style.display = 'flex'; };
  if (closeBtn && modal) closeBtn.onclick = () => { modal.style.display = 'none'; };
  window.addEventListener('click', e => {
    if (modal && e.target === modal) modal.style.display = 'none';
  });

  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const submit = form.querySelector('button[type=submit]');
    const payload = {
      full_name: $('#user-name').value.trim(),
      email: $('#user-email').value.trim(),
      password: $('#user-pass').value
    };

    const oldText = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Göndərilir...';
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Qeydiyyat alınmadı.');
      }

      modal.style.display = 'none';
      form.reset();
      if (toast) {
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 4000);
      }
      if (btn) {
        btn.innerHTML = `<i class="fas fa-user-check"></i> ${esc(payload.full_name)}`;
        btn.style.background = '#28a745';
      }
    } catch (err) {
      alert(err.message);
    } finally {
      submit.disabled = false;
      submit.textContent = oldText;
    }
  });
}

/* ---------- İlk yükləmə ---------- */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadges();
  setupAuth();
  setupCatalogControls();

  // Əlavə et düyməsi (dinamik yaradılan kartlar üçün delegation)
  document.addEventListener('click', e => {
    const addBtn = e.target.closest('.add-btn[data-product-id]');
    if (addBtn) {
      addToCart(addBtn);
      return;
    }
    if (e.target.closest('[data-cart-link]')) {
      location.href = 'sebet.html';
    }
  });

  const cartHost = $('#cartItems');
  if (cartHost) {
    cartHost.addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      changeCart(Number(btn.dataset.index), btn.dataset.action);
    });
    renderCart();
  }

  if ($('#grid') || $('#productsGrid')) renderCatalog();
});
