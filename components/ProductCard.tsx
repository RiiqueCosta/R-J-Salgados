import React from 'react';
import { Product, Category } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="relative h-48 w-full overflow-hidden bg-gray-200">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Esgotado
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase">
            {product.category}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <span className="text-xl font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </span>
          
          <button
            onClick={() => onAdd(product)}
            disabled={!product.isAvailable}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${product.isAvailable 
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-orange-200' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;