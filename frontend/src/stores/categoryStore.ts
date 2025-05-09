import { makeAutoObservable, runInAction } from "mobx";
import api from "../api/axios";

export interface ICategory {
  id: number;
  name: string;
  description: string;
}

class CategoryStore {
  categories: ICategory[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchCategories() {
    this.loading = true;
    this.error = null;
    try {
      const res = await api.get("/categories");
      runInAction(() => {
        this.categories = res.data;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка загрузки категорий";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createCategory(name: string, description: string) {
    this.error = null;
    try {
      await api.post("/categories", { name, description });
      await this.fetchCategories();
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка создания категории";
      });
      return false;
    }
  }

  async deleteCategory(id: number) {
    this.error = null;
    try {
      await api.delete(`/categories/${id}`);
      await this.fetchCategories();
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка удаления категории";
      });
    }
  }
}

const categoryStore = new CategoryStore();
export default categoryStore; 