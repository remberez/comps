import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import userStore from "../stores/userStore";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await userStore.login(username, password);
    if (userStore.isAuth) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Вход в аккаунт</h2>
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Имя пользователя</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-gray-700">Пароль</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {userStore.error && (
          <div className="text-red-600 mb-4 text-center">{userStore.error}</div>
        )}
        <button
          type="submit"
          className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition"
          disabled={userStore.loading}
        >
          {userStore.loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
});

export default LoginPage; 