import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Order, Category } from './types';
import { getProducts, createOrder } from './services/dataService';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import { ShoppingBag, Search, Menu, Phone, Instagram, Facebook } from 'lucide-react';

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Load products on mount
  useEffect(() => {
    setProducts(getProducts());
    
    // Check URL hash for simple admin access (mock auth)
    const checkHash = () => {
      if (window.location.hash === '#admin') setIsAdminMode(true);
      else setIsAdminMode(false);
    };
    
    window.addEventListener('hashchange', checkHash);
    checkHash();
    
    return () => window.removeEventListener('hashchange', checkHash);
  }, [isAdminMode]); // Refresh products when switching modes

  // Cart Logic
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleConfirmOrder = (order: Order) => {
    createOrder(order);
    setCartItems([]); // Clear cart
    // CheckoutModal handles the redirection UI
  };

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (isAdminMode) {
    return <AdminDashboard onLogout={() => window.location.hash = ''} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <span className="font-bold text-xl">RJ</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 leading-none">RJ Doces</h1>
                <span className="text-xs text-orange-600 font-medium tracking-wide">& Salgados</span>
              </div>
            </div>

            {/* Desktop Navigation / Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
              <Search className="absolute left-3 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="O que você procura hoje?"
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-orange-50 rounded-full transition-colors group"
            >
              <div className="relative">
                <ShoppingBag size={26} className="text-gray-700 group-hover:text-orange-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar (only visible on small screens) */}
        <div className="md:hidden px-4 pb-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar delícias..."
                className="w-full bg-gray-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-200 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* Categories Scroll */}
        <div className="border-t border-gray-100 bg-white overflow-x-auto no-scrollbar">
           <div className="max-w-7xl mx-auto px-4 flex gap-2 py-3">
              {['Todos', ...Object.values(Category)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={`
                    whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${selectedCategory === cat 
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Banner (Static for now) */}
        {selectedCategory === 'Todos' && !searchQuery && (
          <div className="mb-10 rounded-2xl overflow-hidden relative h-48 md:h-64 shadow-xl">
             <img 
               src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200" 
               className="w-full h-full object-cover" 
               alt="Banner" 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8">
               <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">Sabor que Apaixona</h2>
               <p className="text-gray-200 max-w-md">Os melhores salgados e doces do Rio, feitos com carinho para sua festa ou lanche.</p>
             </div>
          </div>
        )}

        {/* Product Grid */}
        <div>
           <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
             {selectedCategory === 'Todos' ? 'Destaques' : selectedCategory}
           </h2>
           
           {filteredProducts.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
               <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
               <button onClick={() => {setSearchQuery(''); setSelectedCategory('Todos')}} className="mt-2 text-orange-600 font-medium hover:underline">
                 Limpar filtros
               </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
             </div>
           )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900">RJ Doces e Salgados</h3>
            <p className="text-sm text-gray-500 mt-1">Feito com ❤️ no Rio de Janeiro.</p>
          </div>
          <div className="flex gap-4">
             <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors">
               <Instagram size={20} />
             </a>
             <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors">
               <Facebook size={20} />
             </a>
             <a href="https://wa.me/5521999999999" target="_blank" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors">
               <Phone size={20} />
             </a>
          </div>
        </div>
        <div className="text-center mt-8 text-xs text-gray-400">
           <a href="#admin" className="hover:text-gray-600">Área Administrativa</a>
        </div>
      </footer>

      {/* Overlays */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        total={cartTotal}
        onConfirmOrder={handleConfirmOrder}
      />

    </div>
  );
};

export default App;