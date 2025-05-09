import { makeAutoObservable, runInAction } from "mobx";
import api from "../api/axios";

export interface ICartProduct {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface ICartItem {
  id: number;
  product: ICartProduct;
  quantity: number;
}

class CartStore {
  items: ICartItem[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchCart() {
    this.loading = true;
    this.error = null;
    try {
      const res = await api.get("/cart");
      runInAction(() => {
        this.items = res.data;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка загрузки корзины";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateQuantity(cartItemId: number, quantity: number) {
    try {
      await api.put(`/cart/${cartItemId}`, { quantity });
      await this.fetchCart();
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка обновления количества";
      });
    }
  }

  async removeItem(cartItemId: number) {
    try {
      await api.delete(`/cart/${cartItemId}`);
      await this.fetchCart();
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка удаления товара";
      });
    }
  }

  async addToCart(productId: number, quantity: number = 1) {
    try {
      await api.post("/cart", { product_id: productId, quantity });
      await this.fetchCart();
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка добавления в корзину";
      });
    }
  }

  get total() {
    return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}

const cartStore = new CartStore();
export default cartStore; 