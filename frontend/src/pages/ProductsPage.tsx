import React from "react";
import api from "../api/axios";
import cartStore from "../stores/cartStore";
import { observer } from "mobx-react-lite";

const ProductsPage: React.FC = observer(() => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addingId, setAddingId] = React.useState<number | null>(null);
  const [successId, setSuccessId] = React.useState<number | null>(null);

  React.useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => setError("Ошибка загрузки товаров"))
      .finally(() => setLoading(false));
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
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Товары</h1>
      {loading && <div>Загрузка...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid md:grid-cols-3 gap-8">
        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow p-7 flex flex-col items-center text-center border border-gray-100 hover:-translate-y-1 duration-200"
          >
            <div className="font-semibold text-xl mb-1 text-gray-900">{p.name}</div>
            <div className="text-gray-500 text-sm mb-4">{p.description}</div>
            <div className="font-extrabold text-2xl text-violet-700 mb-5">{p.price} <span className="text-base font-medium">₽</span></div>
            <button
              className="w-full py-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-60"
              onClick={() => handleAddToCart(p.id)}
              disabled={addingId === p.id}
            >
              {addingId === p.id
                ? "Добавление..."
                : successId === p.id
                ? "Добавлено!"
                : "В корзину"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProductsPage; 