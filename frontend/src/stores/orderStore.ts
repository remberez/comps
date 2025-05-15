import { makeAutoObservable, runInAction } from "mobx";
import api from "../api/axios";

export interface IOrderProduct {
  product_id: number;
  quantity: number;
  price_at_time: number;
  name?: string;
}

export interface IOrder {
  id: number;
  status: string;
  total_amount: number;
  shipping_address: string;
  created_at: string;
  products?: IOrderProduct[];
}

class OrderStore {
  orders: IOrder[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchOrders() {
    this.loading = true;
    this.error = null;
    try {
      const res = await api.get("/orders");
      runInAction(() => {
        this.orders = res.data;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка загрузки заказов";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createOrder(shippingAddress: string) {
    this.loading = true;
    this.error = null;
    try {
      await api.post("/orders", { shipping_address: shippingAddress });
      await this.fetchOrders();
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка оформления заказа";
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateOrder(id: number, data: Partial<IOrder>) {
    this.loading = true;
    this.error = null;
    try {
      await api.put(`/orders/${id}`, data);
      await this.fetchOrders();
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка обновления заказа";
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

const orderStore = new OrderStore();
export default orderStore; 