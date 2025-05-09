import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import CategoryAdminSection from "../sections/CategoryAdminSection";
import ProductAdminSection from "../sections/ProductAdminSection";

const sections = [
  { key: "categories", label: "Категории товаров" },
  { key: "products", label: "Товары" },
  { key: "users", label: "Пользователи" },
  // В будущем можно добавить другие сущности
];

const AdminPage: React.FC = observer(() => {
  const [active, setActive] = useState("categories");

  return (
    <div className="flex min-h-[80vh]">
      {/* Сайдбар */}
      <aside className="w-64 bg-white border-r flex flex-col py-8 px-4 gap-2">
        <h1 className="text-2xl font-bold mb-8">Админ-панель</h1>
        {sections.map((s) => (
          <button
            key={s.key}
            className={`text-left px-4 py-2 rounded font-medium transition ${active === s.key ? "bg-violet-100 text-violet-700" : "hover:bg-gray-100"}`}
            onClick={() => setActive(s.key)}
            disabled={active === s.key}
          >
            {s.label}
          </button>
        ))}
      </aside>
      {/* Контент */}
      <main className="flex-1 p-8">
        {active === "categories" && <CategoryAdminSection />}
        {active === "products" && <ProductAdminSection />}
        {active === "users" && (
          <div className="text-gray-400 text-lg">Управление пользователями появится позже</div>
        )}
      </main>
    </div>
  );
});

export default AdminPage; 