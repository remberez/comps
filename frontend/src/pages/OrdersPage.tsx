import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import orderStore from "../stores/orderStore";

const OrdersPage: React.FC = observer(() => {
  useEffect(() => {
    orderStore.fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
      {orderStore.loading && <div>Загрузка...</div>}
      {orderStore.error && <div className="text-red-600 mb-4">{orderStore.error}</div>}
      {orderStore.orders.length === 0 && !orderStore.loading ? (
        <div className="text-gray-500">У вас пока нет заказов</div>
      ) : (
        <div className="space-y-8">
          {orderStore.orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
                <div>
                  <span className="font-semibold">Заказ №{order.id}</span>
                  <span className="ml-4 text-gray-500">{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="text-violet-700 font-bold">{order.total_amount} ₽</div>
                <div className="text-sm text-gray-600">Статус: {order.status}</div>
              </div>
              <div className="text-sm text-gray-700 mb-2">Адрес: {order.shipping_address}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default OrdersPage; 