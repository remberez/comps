import { makeAutoObservable, runInAction } from "mobx";
import api from "../api/axios";

export interface IUser {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

class UserStore {
  user: IUser | null = null;
  token: string | null = localStorage.getItem("token");
  isAuth: boolean = !!this.token;
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    if (this.token) this.fetchUser();
  }

  async login(username: string, password: string) {
    this.loading = true;
    this.error = null;
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      const res = await api.post("/auth/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      runInAction(() => {
        this.token = res.data.access_token;
        this.isAuth = true;
        localStorage.setItem("token", this.token!);
      });
      await this.fetchUser();
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.detail || "Ошибка авторизации";
        this.isAuth = false;
        this.token = null;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async fetchUser() {
    if (!this.token) return;
    this.loading = true;
    try {
      const res = await api.get("/auth/me");
      runInAction(() => {
        this.user = res.data;
        this.isAuth = true;
      });
    } catch {
      runInAction(() => {
        this.user = null;
        this.isAuth = false;
        this.token = null;
        localStorage.removeItem("token");
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  logout() {
    this.user = null;
    this.token = null;
    this.isAuth = false;
    localStorage.removeItem("token");
  }
}

const userStore = new UserStore();
export default userStore; 