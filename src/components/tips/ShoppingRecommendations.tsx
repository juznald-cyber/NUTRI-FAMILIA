import React, { useState, useEffect } from 'react';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { getShoppingRecommendations, type ShoppingRecommendation } from '../../utils/recommendations';

export default function ShoppingRecommendations() {
  const [recommendations, setRecommendations] = useState<ShoppingRecommendation[]>([]);

  useEffect(() => {
    getShoppingRecommendations().then(setRecommendations);
  }, []);

  if (recommendations.length === 0) {
    return (
      <div className="apple-card p-6 text-center">
        <ShoppingCart className="w-8 h-8 text-apple-gray-2 mx-auto mb-2" />
        <p className="text-sm text-apple-gray-1">Agrega productos a tu despensa para ver recomendaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-apple-gray-1">
        Basado en tu despensa actual, te recomendamos:
      </p>
      {recommendations.map((rec, i) => (
        <div key={i} className="apple-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{rec.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">{rec.label}</h3>
                <span className={`apple-badge ${
                  rec.status === 'bueno' ? 'stock-high' :
                  rec.status === 'bajo' ? 'stock-medium' : 'stock-low'
                }`}>
                  {rec.status === 'bueno' ? '✓ Bien' :
                   rec.status === 'bajo' ? '⚠ Bajo' : '✗ Vacío'}
                </span>
              </div>
              <p className="text-xs text-apple-gray-1 mt-0.5">{rec.message}</p>
            </div>
          </div>
          {rec.suggestedItems.length > 0 && rec.status !== 'bueno' && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {rec.suggestedItems.map((item, j) => (
                  <span key={j} className="px-2.5 py-1 bg-apple-blue/8 text-apple-blue text-xs font-medium rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
