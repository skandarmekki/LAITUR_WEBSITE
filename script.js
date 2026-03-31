const map = L.map('map', { zoomControl: false }).setView([39.0, 35.0], 5);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);

let basket = [];
let vaultStorage = [];
let Moneycurrency = 'TRY';
let orderType = 'delivery';
let currentCategory = 'all';
const rate = 10.50; 

const items = [
    { id: 1, cat: "milk", name: "UHT Homogenized Milk (3.5% Fat)", size: "1 Liter", price: 35, img: "img/uht_milk_35.png" },
    { id: 2, cat: "milk", name: "Semi-Skimmed Milk (1.5% Fat)", size: "1 Liter", price: 32, img: "img/milk_semi.png" },
    { id: 3, cat: "milk", name: "Dietary Skimmed (0.1% Fat)", size: "1 Liter", price: 34, img: "img/milk.png" },
    { id: 4, cat: "yogurt", name: "Strained Greek Yogurt (10% Fat)", size: "500 g", price: 85, img: "img/yogurt_greek.png " },
    { id: 5, cat: "butter", name: "Lactic Butter (82% Milkfat)", size: "250 g", price: 110, img: " " },
    { id: 6, cat: "cheese", name: "Aged 24m Parmigiano Reggiano", size: "200 g", price: 240, img: " " }
];

const stores = {
    tr: [{ name: "Istanbul Hub", pos: [41.0, 28.9] }, { name: "Ankara Hub", pos: [39.9, 32.8] }],
    tn: [{ name: "Sousse Hub", pos: [35.8, 10.6] }, { name: "Tunis Hub", pos: [36.8, 10.1] }]
};

let mapMarkers = [];

function changeCountry(currency) {
    if (currency === 'tn') {
        Moneycurrency = 'TND';
    } else {
        Moneycurrency = 'TRY';
    }

    const opts = document.querySelectorAll('.market-option');
    for (let i = 0; i < opts.length; i++) {
        opts[i].classList.remove('active');
    }

    document.getElementById('btn-' + currency).classList.add('active');

    if (currency === 'tn') {
        map.flyTo([34.0, 9.5], 6);
    } else {
        map.flyTo([39.0, 35.0], 5);
    }

    for (let i = 0; i < mapMarkers.length; i++) {
        map.removeLayer(mapMarkers[i]);
    }

    mapMarkers = [];
    for (let i = 0; i < stores[currency].length; i++) {
        let s = stores[currency][i];
        let marker = L.circle(s.pos, {
            radius: 15000,
            color: '#0062ff',
            weight: 2,
            fillOpacity: 0.1
        }).addTo(map).bindTooltip(s.name);

        mapMarkers.push(marker);
    }

    showItems();
    update();
}

function filterCategory(category) {
    currentCategory = category;

    const btns = document.querySelectorAll('.cat-chip');
    for (let i = 0; i < btns.length; i++) {
        let text = btns[i].innerText.toLowerCase();
        let active = false;

        if (category === 'all') {
            if (btns[i].innerText.indexOf('All') !== -1) {
                active = true;
            }
        } else {
            if (text.indexOf(category) !== -1) {
                active = true;
            }
        }

        if (active) {
            btns[i].classList.add('active');
        } else {
            btns[i].classList.remove('active');
        }
    }

    showItems();
}

function showItems() {
    const grid = document.getElementById('inventory-grid');
    let html = "";

    for (let i = 0; i < items.length; i++) {
        if (currentCategory === 'all' || items[i].cat === currentCategory) {
            let p = items[i];
            html += `
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
            </div>`;
        }
    }

    grid.innerHTML = html;
}

function add(id, e) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            basket.push(items[i]);
            break;
        }
    }
    flyToBasket(e);
    update();
}

function remove(idx) {
    basket.splice(idx, 1);
    update();
}

function update() {
    document.getElementById('cart-count').innerText = basket.length;

    let subtotal = 0;
    for (let i = 0; i < basket.length; i++) {
        subtotal += basket[i].price;
    }

    let fee = 0;
    if (orderType === 'delivery') {
        if (basket.length > 0) {
            fee = 20;
        }
    }

    document.getElementById('sub-total').innerText = format(subtotal);
    document.getElementById('fee-val').innerText = format(fee);
    document.getElementById('cart-total').innerText = format(subtotal + fee);

    const list = document.getElementById('cart-items-list');

    if (basket.length === 0) {
        list.innerHTML = `<div class="empty-state"><p>Empty.</p></div>`;
    } else {
        let html = "";
        for (let i = 0; i < basket.length; i++) {
            html += `<div class="basket-item">
                <div>
                    <h5>${basket[i].name}</h5>
                    <span>${basket[i].size}</span>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <b>${format(basket[i].price)}</b>
                    <button onclick="remove(${i})" style="color:#ef4444; border:none; background:none; cursor:pointer;">✕</button>
                </div>
            </div>`;
        }
        list.innerHTML = html;
    }
}

function handleCheckout() {
    if (basket.length === 0) return;

    for (let i = 0; i < basket.length; i++) {
        vaultStorage.unshift(basket[i]);
    }

    document.getElementById('vault-count').innerText = vaultStorage.length;

    let html = "";
    for (let i = 0; i < vaultStorage.length; i++) {
        html += `<div style="padding:10px; background:#fff; border-radius:12px; border:1px solid #f1f5f9; margin-bottom:8px; font-size:0.7rem;">${vaultStorage[i].name}</div>`;
    }
    document.getElementById('vault-list').innerHTML = html;

    basket = [];
    update();
    closeBasket();
    alert("Confirmed.");
}

function setMethod(m) {
    orderType = m;

    if (m === 'delivery') {
        document.getElementById('m-del').classList.add('active');
        document.getElementById('m-pick').classList.remove('active');
        document.getElementById('fee-row').style.display = 'flex';
    } else {
        document.getElementById('m-del').classList.remove('active');
        document.getElementById('m-pick').classList.add('active');
        document.getElementById('fee-row').style.display = 'none';
    }

    update();
}

function format(v) {
    if (Moneycurrency === 'TND') {
        return (v / rate).toFixed(2) + " TND";
    } else {
        return v.toFixed(2) + " TRY";
    }
}

function openBasket() {
    document.getElementById('basket-modal').style.display = 'flex';
}

function closeBasket() {
    document.getElementById('basket-modal').style.display = 'none';
}

function openAbout() {
    document.getElementById('about-modal').style.display = 'flex';
}

function closeAbout() {
    document.getElementById('about-modal').style.display = 'none';
}

function flyToBasket(e) {
    const start = e.target.getBoundingClientRect();
    const end = document.getElementById('main-basket-btn').getBoundingClientRect();

    const p = document.createElement('div');
    p.className = 'fly-particle';
    p.style.left = start.left + 'px';
    p.style.top = start.top + 'px';

    document.body.appendChild(p);

    setTimeout(function () {
        p.style.left = (end.left + 20) + 'px';
        p.style.top = (end.top + 20) + 'px';
        p.style.transform = 'scale(0.1)';
        p.style.opacity = '0';
    }, 50);

    setTimeout(function () {
        p.remove();
    }, 650);
}

window.onload = function () {
    changeCountry('tr');

    setTimeout(function () {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1200);
};
