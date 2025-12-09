
/**
 * RJ Doces e Salgados - Frontend Logic
 * Supports PHP backend or LocalStorage Mock for Preview
 */

// State
let products = [];
let cart = [];
let currentCategory = 'Todos';

// Configuration
// Detect if running on localhost with PHP (XAMPP usually serves on port 80 or 8080 without a complex path unless specified)
// We assume if 'api/' endpoints fail or return 404, we fall back to mock.
const API_URL = 'api';
const USE_MOCK = false; // We will try to fetch, if fail, use mock.

// DOM Elements
const productListEl = document.getElementById('product-list');
const cartDrawerEl = document.getElementById('cart-drawer');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountBadge = document.getElementById('cart-count');
const checkoutModalEl = document.getElementById('checkout-modal');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupEventListeners();
});

// --- Data Fetching ---
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/getProducts.php`);
        if (!response.ok) throw new Error('API Error');
        
        const text = await response.text();
        try {
            // PHP might return HTML error if not configured correctly, so we parse carefully
            products = JSON.parse(text);
        } catch (e) {
            console.warn('Backend returned non-JSON. Switching to Mock Data.', text);
            products = getMockProducts();
        }
    } catch (error) {
        console.warn('API unavailable. Switching to Mock Data.', error);
        products = getMockProducts();
    }
    renderProducts();
}

function getMockProducts() {
    return [
        { id: 1, name: 'Coxinha de Frango', description: 'A clássica coxinha com massa de batata.', price: 6.50, category: 'Salgados', imageUrl: 'https://images.unsplash.com/photo-1576158189445-5606e902b79a?auto=format&fit=crop&q=80&w=600', is_available: true },
        { id: 2, name: 'Brigadeiro Gourmet', description: 'Brigadeiro feito com chocolate belga.', price: 4.00, category: 'Doces', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=600', is_available: true },
        { id: 3, name: 'Combo Festa (50un)', description: 'Mix de 25 coxinhas e 25 bolinhas.', price: 89.90, category: 'Combos', imageUrl: 'https://images.unsplash.com/photo-1541795792062-39425861b7d8?auto=format&fit=crop&q=80&w=600', is_available: true },
        { id: 4, name: 'Coca-Cola 2L', description: 'Refrigerante gelado.', price: 12.00, category: 'Bebidas', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600', is_available: true },
        { id: 5, name: 'Empada de Camarão', description: 'Massa podre que derrete na boca.', price: 7.50, category: 'Salgados', imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=600', is_available: true }
    ];
}

// --- Rendering ---
function renderProducts() {
    if (!productListEl) return;
    
    productListEl.innerHTML = '';
    
    const filtered = currentCategory === 'Todos' 
        ? products 
        : products.filter(p => p.category === currentCategory);

    if (filtered.length === 0) {
        productListEl.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">Nenhum produto encontrado.</div>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full';
        
        // Handle image url discrepancies between mock and DB
        const img = product.imageUrl || product.image_url || 'https://via.placeholder.com/300';
        const isAvail = product.isAvailable !== undefined ? product.isAvailable : (product.is_available == 1 || product.is_available === true);

        card.innerHTML = `
            <div class="relative h-48 w-full overflow-hidden bg-gray-200">
                <img src="${img}" alt="${product.name}" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500">
                ${!isAvail ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center"><span class="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Esgotado</span></div>' : ''}
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase">${product.category}</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">${product.name}</h3>
                <p class="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">${product.description}</p>
                <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span class="text-xl font-bold text-gray-900">${formatCurrency(product.price)}</span>
                    <button onclick="window.addToCart(${product.id})" ${!isAvail ? 'disabled' : ''} 
                        class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isAvail ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}">
                        + Adicionar
                    </button>
                </div>
            </div>
        `;
        productListEl.appendChild(card);
    });
}

function renderCart() {
    if (!cartItemsEl) return;
    
    cartItemsEl.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="h-64 flex flex-col items-center justify-center text-gray-400 space-y-4">
                <p>Seu carrinho está vazio.</p>
                <button onclick="window.toggleCart()" class="text-orange-600 font-medium hover:underline">Voltar ao cardápio</button>
            </div>`;
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;
            
            const img = item.imageUrl || item.image_url || 'https://via.placeholder.com/100';
            
            const div = document.createElement('div');
            div.className = 'flex gap-4 p-3 bg-white border border-gray-100 rounded-lg shadow-sm mb-3';
            div.innerHTML = `
                <img src="${img}" class="w-16 h-16 object-cover rounded-md bg-gray-100">
                <div class="flex-1 flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                        <h3 class="font-medium text-gray-900 line-clamp-1">${item.name}</h3>
                        <button onclick="window.removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    <div class="flex justify-between items-end mt-2">
                        <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                            <button onclick="window.updateQty(${item.id}, -1)" class="p-1 hover:bg-white rounded shadow-sm text-gray-600">-</button>
                            <span class="text-sm font-semibold w-4 text-center">${item.quantity}</span>
                            <button onclick="window.updateQty(${item.id}, 1)" class="p-1 hover:bg-white rounded shadow-sm text-gray-600">+</button>
                        </div>
                        <span class="font-bold text-gray-900">${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                </div>
            `;
            cartItemsEl.appendChild(div);
        });
        
        // Re-render icons since we injected HTML
        if (window.lucide) window.lucide.createIcons();
    }

    if (cartTotalEl) cartTotalEl.innerText = formatCurrency(total);
    if (cartCountBadge) {
        cartCountBadge.innerText = count;
        cartCountBadge.style.display = count > 0 ? 'flex' : 'none';
        cartCountBadge.style.justifyContent = 'center';
    }
}

// --- Cart Logic ---
// We attach these to window explicitly to ensure they work with inline onclick handlers
window.addToCart = (id) => {
    // If id is string/number mismatch, handle it
    const product = products.find(p => p.id == id);
    if (!product) return;

    const existing = cart.find(item => item.id == id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    renderCart();
    window.toggleCart(true);
};

window.updateQty = (id, delta) => {
    const item = cart.find(i => i.id == id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            window.removeFromCart(id);
        } else {
            renderCart();
        }
    }
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id != id);
    renderCart();
};

window.toggleCart = (forceOpen = null) => {
    if (!cartDrawerEl) return;
    const isHidden = cartDrawerEl.classList.contains('hidden');
    if (forceOpen === true || isHidden) {
        cartDrawerEl.classList.remove('hidden');
    } else {
        cartDrawerEl.classList.add('hidden');
    }
};

window.filterCategory = (cat) => {
    currentCategory = cat;
    // Update active button styles
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.dataset.category === cat) {
            btn.classList.add('bg-orange-600', 'text-white', 'shadow-md');
            btn.classList.remove('bg-gray-100', 'text-gray-600');
        } else {
            btn.classList.remove('bg-orange-600', 'text-white', 'shadow-md');
            btn.classList.add('bg-gray-100', 'text-gray-600');
        }
    });
    renderProducts();
};

// --- Checkout ---
window.openCheckout = () => {
    window.toggleCart(false);
    const totalDisplay = document.getElementById('checkout-total-display');
    if (totalDisplay && cartTotalEl) totalDisplay.innerText = cartTotalEl.innerText;
    
    if (checkoutModalEl) checkoutModalEl.classList.remove('hidden');
    
    // Toggle fields based on method
    const deliveryBtn = document.getElementById('btn-delivery');
    const pickupBtn = document.getElementById('btn-pickup');
    const addressFields = document.getElementById('address-fields');
    
    if (deliveryBtn && pickupBtn) {
        deliveryBtn.onclick = () => {
            deliveryBtn.classList.add('border-orange-500', 'bg-orange-50', 'text-orange-700');
            pickupBtn.classList.remove('border-orange-500', 'bg-orange-50', 'text-orange-700');
            if (addressFields) addressFields.style.display = 'grid';
            const input = document.getElementById('input-delivery-method');
            if (input) input.value = 'Entrega';
        };
        
        pickupBtn.onclick = () => {
            pickupBtn.classList.add('border-orange-500', 'bg-orange-50', 'text-orange-700');
            deliveryBtn.classList.remove('border-orange-500', 'bg-orange-50', 'text-orange-700');
            if (addressFields) addressFields.style.display = 'none';
            const input = document.getElementById('input-delivery-method');
            if (input) input.value = 'Retirada';
        };
    }
};

window.closeCheckout = () => {
    if (checkoutModalEl) checkoutModalEl.classList.add('hidden');
};

const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Processando...';
        btn.disabled = true;

        const formData = new FormData(e.target);
        const orderData = {
            customer: {
                name: formData.get('name'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                number: formData.get('number'),
                neighborhood: formData.get('neighborhood'),
                complement: formData.get('complement'),
            },
            deliveryMethod: formData.get('deliveryMethod'), // Hidden input
            paymentMethod: formData.get('paymentMethod'),
            notes: formData.get('notes'),
            items: cart,
            total: cart.reduce((acc, i) => acc + (i.price * i.quantity), 0)
        };

        try {
            let orderId = Math.floor(Math.random() * 10000);
            
            try {
                const res = await fetch(`${API_URL}/createOrder.php`, {
                    method: 'POST',
                    body: JSON.stringify(orderData),
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.orderId) orderId = json.orderId;
                } else {
                    throw new Error("Backend failed");
                }
            } catch (backendErr) {
                console.warn("Backend save failed, using local fallback", backendErr);
                // Fallback to local storage for demo/if backend missing
                const orders = JSON.parse(localStorage.getItem('rj_ds_orders') || '[]');
                orders.unshift({ ...orderData, id: orderId, status: 'Novo', createdAt: new Date() });
                localStorage.setItem('rj_ds_orders', JSON.stringify(orders));
            }

            // WhatsApp Redirect
            sendToWhatsApp(orderData, orderId);
            
            // Reset
            cart = [];
            renderCart();
            window.closeCheckout();
            
        } catch (err) {
            console.error(err);
            alert('Erro ao processar pedido.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

function sendToWhatsApp(order, id) {
    const phone = "5521999999999"; 
    const lb = "%0A";
    let msg = `*NOVO PEDIDO #${id}*${lb}${lb}`;
    msg += `*Cliente:* ${order.customer.name}${lb}`;
    msg += `*Telefone:* ${order.customer.phone}${lb}`;
    
    if (order.deliveryMethod === 'Entrega') {
        msg += `*Endereço:* ${order.customer.address}, ${order.customer.number} - ${order.customer.neighborhood}${lb}`;
        if (order.customer.complement) msg += `*Comp:* ${order.customer.complement}${lb}`;
    } else {
        msg += `*Retirada no Local*${lb}`;
    }

    msg += `${lb}*ITENS:*${lb}`;
    order.items.forEach(item => {
        msg += `- ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})${lb}`;
    });

    msg += `${lb}*Obs:* ${order.notes || '-'}${lb}`;
    msg += `*Pagamento:* ${order.paymentMethod}${lb}`;
    msg += `*TOTAL:* ${formatCurrency(order.total)}`;

    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

// Helpers
function formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function setupEventListeners() {
    // Icons
    if (window.lucide) window.lucide.createIcons();
}
