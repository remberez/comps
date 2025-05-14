import { makeAutoObservable, runInAction } from "mobx";
import api from "../api/axios";

export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  supplier_id: number;
  supply_price: number;
  last_supply_date: string;
}

class ProductStore {
  products: IProduct[] = [];
  loading = false;
  error: string | null = null;
  editingProduct: IProduct | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setEditingProduct(product: IProduct | null) {
    this.editingProduct = product;
  }

  async fetchProducts() {
    this.loading = true;
    this.error = null;
    try {
      const res = await api.get("/products");
      runInAction(() => {
        this.products = res.data;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка загрузки товаров";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createProduct(product: Omit<IProduct, "id">) {
    this.error = null;
    try {
      await api.post("/products", product);
      await this.fetchProducts();
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка создания товара";
      });
      return false;
    }
  }

  async updateProduct(id: number, product: Partial<IProduct>) {
    this.error = null;
    try {
      await api.put(`/products/${id}`, product);
      await this.fetchProducts();
      this.setEditingProduct(null);
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка обновления товара";
      });
      return false;
    }
  }

  async deleteProduct(id: number) {
    this.error = null;
    try {
      await api.delete(`/products/${id}`);
      await this.fetchProducts();
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка удаления товара";
      });
    }
  }
}

const productStore = new ProductStore();
export default productStore; 