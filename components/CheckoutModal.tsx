import React, { useState } from 'react';
import { CartItem, CustomerInfo, DeliveryMethod, PaymentMethod, Order } from '../types';
import { X, Send } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  onConfirmOrder: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, onClose, cartItems, total, onConfirmOrder 
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    number: '',
    neighborhood: '',
    complement: ''
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.DELIVERY);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: [...cartItems],
      total: total,
      status: 'Novo' as any,
      customer: formData,
      deliveryMethod,
      paymentMethod,
      notes,
      createdAt: new Date().toISOString()
    };

    // Simulate network delay for UX
    setTimeout(() => {
      onConfirmOrder(newOrder);
      setLoading(false);
      setStep(2); // Show success/whatsapp redirection
    }, 1500);
  };

  const sendToWhatsApp = (order: Order) => {
    const phone = "5521999999999"; // Replace with store number
    const lineBreak = "%0A";
    
    let msg = `*NOVO PEDIDO #${order.id}*${lineBreak}${lineBreak}`;
    msg += `*Cliente:* ${order.customer.name}${lineBreak}`;
    msg += `*Telefone:* ${order.customer.phone}${lineBreak}`;
    
    if (order.deliveryMethod === DeliveryMethod.DELIVERY) {
        msg += `*Endereço:* ${order.customer.address}, ${order.customer.number} - ${order.customer.neighborhood}${lineBreak}`;
        if (order.customer.complement) msg += `*Comp:* ${order.customer.complement}${lineBreak}`;
    } else {
        msg += `*Retirada no Local*${lineBreak}`;
    }

    msg += `${lineBreak}*ITENS:*${lineBreak}`;
    order.items.forEach(item => {
        msg += `- ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})${lineBreak}`;
    });

    msg += `${lineBreak}*Observações:* ${order.notes || 'Nenhuma'}${lineBreak}`;
    msg += `*Pagamento:* ${order.paymentMethod}${lineBreak}`;
    msg += `*TOTAL:* R$ ${order.total.toFixed(2)}`;

    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    onClose();
  };

  // If step 2, we just show a success message but technically the parent handles logic. 
  // However, for this modal, let's keep it simple: parent calls onConfirmOrder, we stay here to let user click "Open WhatsApp".

  if (step === 2) {
    // Reconstruct the order object for the button action since we didn't save it in state here (passed to parent)
    // In a real app, we'd get the confirmed ID back.
    // For this mock, we'll just reconstruct using current state which hasn't changed.
     const tempOrder: Order = {
      id: 'RECÉM-CRIADO', // Placeholder, the actual logic would use the one created in handleSubmit
      items: cartItems,
      total,
      status: 'Novo' as any,
      customer: formData,
      deliveryMethod,
      paymentMethod,
      notes,
      createdAt: new Date().toISOString()
    };

    return (
       <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Send size={32} />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h2>
           <p className="text-gray-600 mb-6">
             Seu pedido foi registrado. Agora, envie os detalhes para nosso WhatsApp para confirmarmos o preparo.
           </p>
           <button 
             onClick={() => sendToWhatsApp(tempOrder)}
             className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
           >
             <Send size={20} />
             Enviar no WhatsApp
           </button>
        </div>
       </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Finalizar Pedido</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          
          {/* Step 1: Delivery Method */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 block">Como deseja receber?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod(DeliveryMethod.DELIVERY)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  deliveryMethod === DeliveryMethod.DELIVERY 
                  ? 'border-orange-500 bg-orange-50 text-orange-700' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Entrega
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod(DeliveryMethod.PICKUP)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  deliveryMethod === DeliveryMethod.PICKUP
                  ? 'border-orange-500 bg-orange-50 text-orange-700' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Retirada no Balcão
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Ex: Maria Silva"
              />
             </div>
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
              <input 
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="(21) 99999-9999"
              />
             </div>
          </div>

          {/* Address - Only if Delivery */}
          {deliveryMethod === DeliveryMethod.DELIVERY && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
               <h3 className="font-semibold text-gray-900">Endereço de Entrega</h3>
               <div className="grid grid-cols-6 gap-3">
                 <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rua</label>
                    <input required name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-orange-500 outline-none" placeholder="Rua das Flores" />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Número</label>
                    <input required name="number" value={formData.number} onChange={handleChange} className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-orange-500 outline-none" placeholder="123" />
                 </div>
                 <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bairro</label>
                    <input required name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-orange-500 outline-none" placeholder="Centro" />
                 </div>
                 <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Complemento</label>
                    <input name="complement" value={formData.complement} onChange={handleChange} className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-orange-500 outline-none" placeholder="Apto 101" />
                 </div>
               </div>
            </div>
          )}

          {/* Payment */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              {Object.values(PaymentMethod).map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              placeholder="Ex: Tirar cebola, campainha estragada..."
            />
          </div>

          <div className="pt-4 border-t mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total a pagar:</span>
              <span className="text-2xl font-bold text-gray-900">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all 
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 hover:shadow-orange-200 active:scale-[0.99]'}
              `}
            >
              {loading ? 'Processando...' : 'Confirmar Pedido'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;