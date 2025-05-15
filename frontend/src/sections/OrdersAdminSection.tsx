import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import orderStore, { type IOrder } from "../stores/orderStore";
import userStore from "../stores/userStore";

const OrderAdminSection: React.FC = observer(() => {
  const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    orderStore.fetchOrders();
  }, []);

  const handleEditClick = (order: IOrder) => {
    setEditingOrder(order);
    setStatus(order.status);
  };

  const handleCancel = () => {
    setEditingOrder(null);
    setStatus("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingOrder) return;

  const success = await orderStore.updateOrder(editingOrder.id, { status });
  if (success) {
    setSuccess(true);
    setEditingOrder(null);
    setStatus("");
    setTimeout(() => setSuccess(false), 1500);
  }
};

  if (!userStore.user?.is_admin) {
    return <div className="text-red-600 text-center text-lg">Доступ только для администраторов</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Заказы</h2>

      {editingOrder && (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-4 flex-wrap">
          <div className="flex flex-col flex-1">
            <label className="mb-1 text-gray-700">Статус заказа</label>
            <select
              name="status"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="" disabled>Выберите статус</option>
              <option value="pending">Ожидает</option>
              <option value="processing">В обработке</option>
              <option value="shipped">Отправлен</option>
              <option value="delivered">Доставлен</option>
              <option value="cancelled">Отменён</option>
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition"
              disabled={orderStore.loading}
            >
              {orderStore.loading ? "Сохранение..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {orderStore.error && <div className="text-red-600 mb-2">{orderStore.error}</div>}
      {success && <div className="text-green-600 mb-2">Статус заказа обновлён!</div>}

      <div className="space-y-2">
        {orderStore.orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between bg-white rounded shadow px-4 py-3">
            <div>
              <div className="font-semibold">ID заказа: {order.id}</div>
              <div className="text-gray-500 text-sm">Адрес: {order.shipping_address}</div>
              <div className="text-sm text-gray-700">Статус: {order.status} | Сумма: {order.total_amount} ₽</div>
              <div className="text-xs text-gray-400">Создан: {new Date(order.created_at).toLocaleString()}</div>
            </div>
            <button
              className="px-4 py-1 bg-violet-100 text-violet-600 rounded hover:bg-violet-200 transition"
              onClick={() => handleEditClick(order)}
            >
              Изменить статус
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default OrderAdminSection;
