import React, { useState, useEffect } from 'react';
import { Product, Order, OrderStatus, Category } from '../types';
import { getOrders, updateOrderStatus, getProducts, saveProduct, deleteProduct } from '../services/dataService';
import { Package, ChefHat, LayoutDashboard, Plus, Pencil, Trash2, CheckCircle, Clock, Search } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Product Form State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    refreshData();
    // Simple polling for new orders simulation
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setOrders(getOrders());
    setProducts(getProducts());
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    refreshData();
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.price) return;

    const productToSave: Product = {
      id: currentProduct.id || Math.random().toString(36).substr(2, 9),
      name: currentProduct.name,
      description: currentProduct.description || '',
      price: Number(currentProduct.price),
      category: currentProduct.category || Category.SALGADOS,
      imageUrl: currentProduct.imageUrl || 'https://picsum.photos/200',
      isAvailable: currentProduct.isAvailable ?? true
    };

    saveProduct(productToSave);
    setIsEditingProduct(false);
    setCurrentProduct({});
    refreshData();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      deleteProduct(id);
      refreshData();
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NOVO: return 'bg-blue-100 text-blue-800';
      case OrderStatus.PREPARANDO: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.SAIU_ENTREGA: return 'bg-purple-100 text-purple-800';
      case OrderStatus.CONCLUIDO: return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELADO: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-white shadow-sm z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
          </div>
          <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-600 font-medium">
            Sair
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'orders' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package size={18} />
            Pedidos ({orders.filter(o => o.status !== OrderStatus.CONCLUIDO && o.status !== OrderStatus.CANCELADO).length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'products' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ChefHat size={18} />
            Cardápio
          </button>
        </div>

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Nenhum pedido registrado ainda.</div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:shadow-md">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-bold text-gray-900">#{order.id}</span>
                          <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                        <h3 className="text-gray-800 font-medium">{order.customer.name} - {order.customer.phone}</h3>
                        <p className="text-sm text-gray-500">
                          {order.deliveryMethod === 'Entrega' 
                            ? `${order.customer.address}, ${order.customer.number}` 
                            : 'Retirada no Local'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-gray-50 p-1"
                        >
                          {Object.values(OrderStatus).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.quantity}x {item.name}</span>
                            <span className="text-gray-500 font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-gray-900">
                        <span>Total</span>
                        <span>R$ {order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded mb-2">
                        <strong>Obs:</strong> {order.notes}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Pagamento: <span className="font-medium">{order.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            {!isEditingProduct ? (
               <>
                 <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Buscar produto..." 
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                      />
                    </div>
                    <button 
                      onClick={() => { setCurrentProduct({}); setIsEditingProduct(true); }}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                      <Plus size={20} /> Novo Produto
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                        <div className="flex gap-4 mb-4">
                           <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                           <div>
                             <h3 className="font-bold text-gray-900">{product.name}</h3>
                             <p className="text-sm text-gray-500">{product.category}</p>
                             <p className="text-orange-600 font-bold mt-1">R$ {product.price.toFixed(2)}</p>
                           </div>
                        </div>
                        <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-gray-50">
                           <button 
                             onClick={() => { setCurrentProduct(product); setIsEditingProduct(true); }}
                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                           >
                             <Pencil size={18} />
                           </button>
                           <button 
                             onClick={() => handleDeleteProduct(product.id)}
                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>
                      </div>
                    ))}
                 </div>
               </>
            ) : (
              <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-lg font-bold">
                     {currentProduct.id ? 'Editar Produto' : 'Novo Produto'}
                   </h2>
                   <button onClick={() => setIsEditingProduct(false)} className="text-gray-500 hover:text-gray-700">
                     Cancelar
                   </button>
                </div>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input required className="w-full p-2 border rounded-lg" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                        <input required type="number" step="0.01" className="w-full p-2 border rounded-lg" value={currentProduct.price || ''} onChange={e => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select className="w-full p-2 border rounded-lg bg-white" value={currentProduct.category || ''} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value as Category})}>
                           {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea className="w-full p-2 border rounded-lg" rows={3} value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                    <input className="w-full p-2 border rounded-lg" value={currentProduct.imageUrl || ''} onChange={e => setCurrentProduct({...currentProduct, imageUrl: e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="avail" checked={currentProduct.isAvailable ?? true} onChange={e => setCurrentProduct({...currentProduct, isAvailable: e.target.checked})} className="w-4 h-4 text-orange-600 rounded" />
                    <label htmlFor="avail" className="text-sm font-medium text-gray-700">Disponível para venda</label>
                  </div>
                  <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                    Salvar Produto
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;