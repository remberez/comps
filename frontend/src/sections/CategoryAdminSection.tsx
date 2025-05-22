import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import categoryStore, { type Category } from "../stores/categoryStore";
import userStore from "../stores/userStore";

const renderTree = (nodes: Category[], level = 0) => (
  <ul className={level === 0 ? "space-y-2" : "ml-6 space-y-1"}>
    {nodes.map(cat => (
      <li key={cat.id}>
        <div className="flex items-center justify-between bg-white rounded shadow px-4 py-2 my-4">
          <div>
            <span className="font-semibold">{cat.name}</span>
            <span className="text-gray-500 text-sm ml-2">{cat.description}</span>
          </div>
          <button
            className="px-4 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
            onClick={() => categoryStore.deleteCategory(cat.id)}
          >Удалить</button>
        </div>
        {cat.children && cat.children.length > 0 && renderTree(cat.children, level + 1)}
      </li>
    ))}
  </ul>
);

const CategoryAdminSection: React.FC = observer(() => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    categoryStore.fetchCategories();
  }, []);

  if (!userStore.user?.is_admin) {
    return <div className="text-red-600 text-center text-lg">Доступ только для администраторов</div>;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const ok = await categoryStore.createCategory(name, description, parentId);
    if (ok) {
      setName("");
      setDescription("");
      setParentId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
    }
  };

  // Для выпадающего списка родительских категорий
  const renderParentOptions = (nodes: Category[], prefix = ""): React.ReactNode[] => {
    return nodes.flatMap(cat => [
      <option key={cat.id} value={cat.id}>{prefix + cat.name}</option>,
      ...(cat.children ? renderParentOptions(cat.children, prefix + "— ") : [])
    ]);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Категории товаров</h2>
      <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
          placeholder="Название категории"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="text"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
          placeholder="Описание"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <select
          className="flex-1 px-3 py-2 border rounded-lg"
          value={parentId ?? ""}
          onChange={e => setParentId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Без родителя (корневая)</option>
          {renderParentOptions(categoryStore.categoryTree)}
        </select>
        <button
          type="submit"
          className="px-6 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition"
          disabled={categoryStore.loading}
        >
          {categoryStore.loading ? "Создание..." : "Создать"}
        </button>
      </form>
      {categoryStore.error && <div className="text-red-600 mb-2">{categoryStore.error}</div>}
      {success && <div className="text-green-600 mb-2">Категория создана!</div>}
      <div className="mt-6">{renderTree(categoryStore.categoryTree)}</div>
    </div>
  );
});

export default CategoryAdminSection;