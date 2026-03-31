const map = L.map('map', { zoomControl: false }).setView([39.0, 35.0], 5);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);

let basket = [];
let vaultStorage = [];
let moneyType = 'TRY';
let orderType = 'delivery';
let currentCategory = 'all';
const rate = 10.50; 

const items = [
    { id: 1, cat: "milk", name: "UHT Homogenized Milk (3.5% Fat)", size: "1 Liter", price: 35, img: "img/uht_milk_35.png" },
    { id: 2, cat: "milk", name: "Semi-Skimmed Milk (1.5% Fat)", size: "1 Liter", price: 32, img: "img/milk_semi.png" },
    { id: 3, cat: "milk", name: "Dietary Skimmed (0.1% Fat)", size: "1 Liter", price: 34, img: "img/milk_diet.png" },
    { id: 4, cat: "yogurt", name: "Strained Greek Yogurt (10% Fat)", size: "500 g", price: 85, img: "img/yogurt_greek.png" },
    { id: 5, cat: "butter", name: "Lactic Butter (82% Milkfat)", size: "250 g", price: 110, img: "img/butter_lactic.png" },
    { id: 6, cat: "cheese", name: "Aged 24m Parmigiano Reggiano", size: "200 g", price: 240, img: "img/parmesan.png" }
];

const stores = {
    tr: [{ name: "Istanbul Hub", pos: [41.0, 28.9] }, { name: "Ankara Hub", pos: [39.9, 32.8] }],
    tn: [{ name: "Sousse Hub", pos: [35.8, 10.6] }, { name: "Tunis Hub", pos: [36.8, 10.1] }]
};

let mapMarkers = [];

function changeCountry(code) {
    moneyType = (code === 'tn') ? 'TND' : 'TRY';
    document.querySelectorAll('.market-option').forEach(el => el.classList.remove('active'));
    document.getElementById(`btn-${code}`).classList.add('active');
    code === 'tn' ? map.flyTo([34.0, 9.5], 6) : map.flyTo([39.0, 35.0], 5);
    mapMarkers.forEach(m => map.removeLayer(m));
    mapMarkers = stores[code].map(s => L.circle(s.pos, { radius: 15000, color: '#0062ff', weight: 2, fillOpacity: 0.1 }).addTo(map).bindTooltip(s.name));
    showItems();
    update();
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-chip').forEach(btn => btn.classList.toggle('active', btn.innerText.toLowerCase().includes(cat) || (cat === 'all' && btn.innerText.includes('All'))));
    showItems();
}

function showItems() {
    const grid = document.getElementById('inventory-grid');
    const filtered = currentCategory === 'all' ? items : items.filter(i => i.cat === currentCategory);
    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div class="img-container">
                <img src="${p.img}" class="product-img" onerror="this.src='https://placehold.co/400x300/f8fafc/0062ff?text=${p.cat.toUpperCase()}'">
            </div>
            <div class="card-content">
                <div class="size-label">${p.size}</div>
                <h4>${p.name}</h4>
                <div class="price-tag">${format(p.price)}</div>
                <button class="add-btn" onclick="add(${p.id}, event)">Add to Basket</button>
            </div>
        </div>`).join('');
}

function add(id, e) { basket.push(items.find(i => i.id === id)); flyToBasket(e); update(); }
function remove(idx) { basket.splice(idx, 1); update(); }

function update() {
    document.getElementById('cart-count').innerText = basket.length;
    const subtotal = basket.reduce((s, i) => s + i.price, 0);
    const fee = (orderType === 'delivery' && basket.length > 0) ? 20 : 0;
    document.getElementById('sub-total').innerText = format(subtotal);
    document.getElementById('fee-val').innerText = format(fee);
    document.getElementById('cart-total').innerText = format(subtotal + fee);
    const list = document.getElementById('cart-items-list');
    list.innerHTML = basket.length === 0 ? `<div class="empty-state"><p>Empty.</p></div>` : 
        basket.map((i, idx) => `<div class="basket-item"><div><h5>${i.name}</h5><span>${i.size}</span></div><div style="display:flex; align-items:center; gap:12px;"><b>${format(i.price)}</b><button onclick="remove(${idx})" style="color:#ef4444; border:none; background:none; cursor:pointer;">✕</button></div></div>`).join('');
}

function handleCheckout() {
    if(!basket.length) return;
    vaultStorage.unshift(...basket);
    document.getElementById('vault-count').innerText = vaultStorage.length;
    document.getElementById('vault-list').innerHTML = vaultStorage.map(i => `<div style="padding:10px; background:#fff; border-radius:12px; border:1px solid #f1f5f9; margin-bottom:8px; font-size:0.7rem;">${i.name}</div>`).join('');
    basket = []; update(); closeBasket(); alert("Confirmed.");
}

function setMethod(m) { orderType = m; document.getElementById('m-del').classList.toggle('active', m === 'delivery'); document.getElementById('m-pick').classList.toggle('active', m === 'pickup'); document.getElementById('fee-row').style.display = (m === 'pickup' ? 'none' : 'flex'); update(); }
function format(v) { return moneyType === 'TND' ? (v/rate).toFixed(2) + " TND" : v.toFixed(2) + " TRY"; }
function openBasket() { document.getElementById('basket-modal').style.display = 'flex'; }
function closeBasket() { document.getElementById('basket-modal').style.display = 'none'; }
function openAbout() { document.getElementById('about-modal').style.display = 'flex'; }
function closeAbout() { document.getElementById('about-modal').style.display = 'none'; }

function flyToBasket(e) {
    const start = e.target.getBoundingClientRect();
    const end = document.getElementById('main-basket-btn').getBoundingClientRect();
    const p = document.createElement('div');
    p.className = 'fly-particle';
    p.style.left = start.left + 'px'; p.style.top = start.top + 'px';
    document.body.appendChild(p);
    setTimeout(() => { p.style.left = (end.left + 20) + 'px'; p.style.top = (end.top + 20) + 'px'; p.style.transform = 'scale(0.1)'; p.style.opacity = '0'; }, 50);
    setTimeout(() => p.remove(), 650);
}

window.onload = () => {
    changeCountry('tr');
    setTimeout(() => { document.getElementById('loading-screen').classList.add('hidden'); }, 1200);
};