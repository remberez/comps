import React from "react";
import { observer } from "mobx-react-lite";
import { Link, useNavigate } from "react-router-dom";
import userStore from "../stores/userStore";

const Header: React.FC = observer(() => {
  const navigate = useNavigate();

  const handleLogout = () => {
    userStore.logout();
    navigate("/");
  };

  return (
    <header className="w-full bg-white shadow-sm mb-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-violet-700">TechStore</Link>
          <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
            <Link to="/products" className="hover:text-violet-700">Товары</Link>
            <Link to="/cart" className="hover:text-violet-700">Корзина</Link>
            <Link to="/orders" className="hover:text-violet-700">Заказы</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {userStore.isAuth && userStore.user ? (
            <>
              <span className="text-gray-600 hidden sm:block">{userStore.user.username}</span>
              <button
                className="px-4 py-1 rounded bg-violet-600 text-white hover:bg-violet-700 transition"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1 rounded bg-violet-600 text-white hover:bg-violet-700 transition"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="px-4 py-1 rounded border border-violet-600 text-violet-700 hover:bg-violet-50 transition"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header; 