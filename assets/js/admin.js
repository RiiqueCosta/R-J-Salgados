/**
 * Admin Logic
 */
const API_URL = '../api';
const USE_MOCK = window.location.hostname !== 'localhost' && !window.location.href.includes('xampp');

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
    // Poll for new orders
    setInterval(fetchOrders, 10000);
});

async function fetchOrders() {
    let orders = [];
    try {
        if (USE_MOCK) {
            orders = JSON.parse(localStorage.getItem('rj_ds_orders') || '[]');
        } else {
            const res = await fetch(`${API_URL}/getOrders.php`);
            orders = await res.json();
        }
    } catch (e) {
        console.error(e);
    }
    renderOrders(orders);
}

function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="text-center p-10 text-gray-500">Nenhum pedido encontrado.</div>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <span class="text-lg font-bold text-gray-900">#${order.id}</span>
                        <span class="text-sm text-gray-500">${new Date(order.created_at || order.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 class="font-medium">${order.customer.name} - ${order.customer.phone}</h3>
                    <p class="text-sm text-gray-500">${order.deliveryMethod === 'Entrega' ? order.customer.address : 'Retirada'}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}">
                        ${order.status}
                    </span>
                    <select onchange="updateStatus('${order.id}', this.value)" class="text-sm border rounded p-1">
                        <option value="">Alterar Status...</option>
                        <option value="Novo">Novo</option>
                        <option value="Preparando">Preparando</option>
                        <option value="Saiu para Entrega">Saiu para Entrega</option>
                        <option value="Concluído">Concluído</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                </div>
            </div>
            <div class="bg-gray-50 p-3 rounded mb-2">
                ${order.items.map(i => `
                    <div class="flex justify-between text-sm">
                        <span>${i.quantity}x ${i.product_name || i.name}</span>
                        <span>R$ ${(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>R$ ${parseFloat(order.total || order.total_amount).toFixed(2)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

window.updateStatus = async (id, status) => {
    if (!status) return;
    if (USE_MOCK) {
        const orders = JSON.parse(localStorage.getItem('rj_ds_orders') || '[]');
        const idx = orders.findIndex(o => o.id == id);
        if (idx >= 0) {
            orders[idx].status = status;
            localStorage.setItem('rj_ds_orders', JSON.stringify(orders));
            fetchOrders();
        }
    } else {
        await fetch(`${API_URL}/updateOrderStatus.php`, {
            method: 'POST',
            body: JSON.stringify({ orderId: id, status }),
            headers: {'Content-Type': 'application/json'}
        });
        fetchOrders();
    }
};

function getStatusColor(status) {
    switch(status) {
        case 'Novo': return 'bg-blue-100 text-blue-800';
        case 'Preparando': return 'bg-yellow-100 text-yellow-800';
        case 'Concluído': return 'bg-green-100 text-green-800';
        case 'Cancelado': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}
