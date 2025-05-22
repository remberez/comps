import { makeAutoObservable, runInAction } from "mobx";
import api from "../api/axios";

export interface Category {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  lft: number;
  rgt: number;
  children?: Category[];
}

class CategoryStore {
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchCategories() {
    this.loading = true;
    this.error = null;
    try {
      const res = await api.get<Category[]>("/categories/");
      runInAction(() => {
        this.categories = res.data;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = "Ошибка загрузки категорий";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createCategory(name: string, description: string, parent_id: number | null = null) {
    this.loading = true;
    this.error = null;
    try {
      await api.post("/categories/", { name, description, parent_id });
      await this.fetchCategories();
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = e?.response?.data?.detail || "Ошибка создания категории";
      });
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async deleteCategory(id: number) {
    this.loading = true;
    this.error = null;
    try {
      await api.delete(`/categories/${id}`);
      await this.fetchCategories();
    } catch (e: any) {
      runInAction(() => {
        this.error = "Ошибка удаления категории";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // Построение дерева из flat-списка
  get categoryTree(): Category[] {
    const map = new Map<number, Category>();
    const roots: Category[] = [];
    this.categories.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });
    map.forEach(cat => {
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children!.push(cat);
      } else {
        roots.push(cat);
      }
    });
    // Сортировка по lft для корректного порядка
    const sortTree = (nodes: Category[]) => {
      nodes.sort((a, b) => a.lft - b.lft);
      nodes.forEach(n => n.children && sortTree(n.children));
    };
    sortTree(roots);
    return roots;
  }
}

const categoryStore = new CategoryStore();
export default categoryStore;