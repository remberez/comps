import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import cartStore from "../stores/cartStore";
import orderStore from "../stores/orderStore";

const CartPage: React.FC = observer(() => {
  const [address, setAddress] = useState("");
  const [success, setSuccess] = useState(false);
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    cartStore.fetchCart();
  }, []);

  useEffect(() => {
    // Инициализируем локальные количества при загрузке корзины
    const quantities: Record<number, number> = {};
    cartStore.items.forEach(item => {
      quantities[item.id] = item.quantity;
    });
    setLocalQuantities(quantities);
  }, [cartStore.items]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const ok = await orderStore.createOrder(address);
    if (ok) {
      setAddress("");
      setSuccess(true);
      cartStore.fetchCart();
    }
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    // Сначала обновляем локальное состояние для мгновенного отображения
    setLocalQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));

    // Затем обновляем на сервере
    await cartStore.updateQuantity(itemId, newQuantity);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Корзина</h1>
      {cartStore.error && <div className="text-red-600 mb-4">{cartStore.error}</div>}
      {cartStore.items.length === 0 && !cartStore.loading ? (
        <div className="text-gray-500">Ваша корзина пуста</div>
      ) : (
        <div className="space-y-6">
          {cartStore.items.map(item => (
            <div key={item.id} className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow p-5 gap-4">
              <div className="flex-1 text-center md:text-left">
                <div className="font-semibold text-lg">{item.product.name}</div>
                <div className="text-gray-500 text-sm mb-2">{item.product.description}</div>
                <div className="font-bold text-violet-700">{item.product.price} ₽</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300 transition-colors"
                  onClick={() => handleQuantityChange(item.id, Math.max(1, localQuantities[item.id] - 1))}
                  disabled={localQuantities[item.id] <= 1}
                >-</button>
                <span className="font-semibold w-8 text-center">{localQuantities[item.id]}</span>
                <button
                  className="px-3 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300 transition-colors"
                  onClick={() => handleQuantityChange(item.id, localQuantities[item.id] + 1)}
                >+</button>
              </div>
              <button
                className="ml-4 px-4 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                onClick={() => cartStore.removeItem(item.id)}
              >Удалить</button>
            </div>
          ))}
        </div>
      )}
      {cartStore.items.length > 0 && (
        <form className="mt-8 flex flex-col items-end gap-4" onSubmit={handleOrder}>
          <div className="text-xl font-bold">Итого: {cartStore.total} ₽</div>
          <input
            type="text"
            className="w-full md:w-96 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Адрес доставки"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />
          {orderStore.error && <div className="text-red-600 mb-2">{orderStore.error}</div>}
          {success && <div className="text-green-600 mb-2">Заказ успешно оформлен!</div>}
          <button
            type="submit"
            className="px-6 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
            disabled={orderStore.loading}
          >
            {orderStore.loading ? "Оформление..." : "Оформить заказ"}
          </button>
        </form>
      )}
    </div>
  );
});

export default CartPage; 