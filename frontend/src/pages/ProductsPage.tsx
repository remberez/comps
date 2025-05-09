import React, { useEffect } from "react";
import cartStore from "../stores/cartStore";
import { observer } from "mobx-react-lite";
import productStore from "../stores/productStore";
import categoryStore from "../stores/categoryStore";

const ProductsPage = observer(() => {
  const [_, setError] = React.useState<string | null>(null);
  const [addingId, setAddingId] = React.useState<number | null>(null);
  const [successId, setSuccessId] = React.useState<number | null>(null);

  useEffect(() => {
    productStore.fetchProducts();
    categoryStore.fetchCategories();
  }, []);

  const handleAddToCart = async (productId: number) => {
    setAddingId(productId);
    setError(null);
    setSuccessId(null);
    await cartStore.addToCart(productId, 1);
    if (cartStore.error) {
      setError(cartStore.error);
    } else {
      setSuccessId(productId);
      setTimeout(() => setSuccessId(null), 1200);
    }
    setAddingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Товары</h1>
        
        {productStore.loading && (
          <div className="text-center text-gray-600">Загрузка...</div>
        )}
        
        {productStore.error && (
          <div className="text-red-600 mb-4">{productStore.error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productStore.products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h2>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-violet-600">
                    {product.price} ₽
                  </span>
                  <button
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingId === product.id}
                  >
                    {addingId === product.id
                      ? "Добавление..."
                      : successId === product.id
                      ? "Добавлено!"
                      : "В корзину"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProductsPage; 