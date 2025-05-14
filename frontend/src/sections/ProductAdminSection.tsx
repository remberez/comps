import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import productStore from "../stores/productStore";
import categoryStore from "../stores/categoryStore";
import userStore from "../stores/userStore";

const ProductAdminSection: React.FC = observer(() => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 1,
    stock: 1,
    category_id: 0,
    supplier_id: 1,
    supply_price: 1,
    last_supply_date: new Date().toISOString().slice(0, 10),
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    productStore.fetchProducts();
    categoryStore.fetchCategories();
  }, []);

  useEffect(() => {
    if (productStore.editingProduct) {
      setForm({
        name: productStore.editingProduct.name,
        description: productStore.editingProduct.description,
        price: productStore.editingProduct.price,
        stock: productStore.editingProduct.stock,
        category_id: productStore.editingProduct.category_id,
        supplier_id: productStore.editingProduct.supplier_id,
        supply_price: productStore.editingProduct.supply_price,
        last_supply_date: new Date(productStore.editingProduct.last_supply_date).toISOString().slice(0, 10),
      });
    }
  }, [productStore.editingProduct]);

  if (!userStore.user?.is_admin) {
    return <div className="text-red-600 text-center text-lg">Доступ только для администраторов</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const productData = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
      supplier_id: Number(form.supplier_id),
      supply_price: Number(form.supply_price),
      last_supply_date: new Date(form.last_supply_date).toISOString(),
    };

    let ok;
    if (productStore.editingProduct) {
      ok = await productStore.updateProduct(productStore.editingProduct.id, productData);
    } else {
      ok = await productStore.createProduct(productData);
    }

    if (ok) {
      setForm({
        name: "",
        description: "",
        price: 1,
        stock: 1,
        category_id: 0,
        supplier_id: 1,
        supply_price: 1,
        last_supply_date: new Date().toISOString().slice(0, 10),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
    }
  };

  const handleEdit = (product: typeof productStore.products[0]) => {
    productStore.setEditingProduct(product);
  };

  const handleCancel = () => {
    productStore.setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      price: 1,
      stock: 1,
      category_id: 0,
      supplier_id: 1,
      supply_price: 1,
      last_supply_date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Товары</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-4 flex-wrap">
        <div className="flex flex-col flex-1">
          <label className="mb-1 text-gray-700">Название товара</label>
          <input
            type="text"
            name="name"
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Введите название"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="mb-1 text-gray-700">Описание</label>
          <input
            type="text"
            name="description"
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Введите описание"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col w-32">
          <label className="mb-1 text-gray-700">Цена</label>
          <input
            type="number"
            name="price"
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Цена"
            value={form.price}
            onChange={handleChange}
            min={1}
            required
          />
        </div>
        <div className="flex flex-col w-32">
          <label className="mb-1 text-gray-700">Склад</label>
          <input
            type="number"
            name="stock"
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Склад"
            value={form.stock}
            onChange={handleChange}
            min={1}
            required
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-1 text-gray-700">Категория</label>
          <select
            name="category_id"
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={form.category_id}
            onChange={handleChange}
            required
          >
            <option value={0} disabled>Выберите категорию</option>
            {categoryStore.categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-32">
          <label className="mb-1 text-gray-700">ID поставщика</label>
          <input
            type="number"
            name="supplier_id"
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="ID поставщика"
            value={form.supplier_id}
            onChange={handleChange}
            min={1}
            required
          />
        </div>
        <div className="flex flex-col w-32">
          <label className="mb-1 text-gray-700">Закуп. цена</label>
          <input
            type="number"
            name="supply_price"
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Закуп. цена"
            value={form.supply_price}
            onChange={handleChange}
            min={1}
            required
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-1 text-gray-700">Дата последней поставки</label>
          <input
            type="date"
            name="last_supply_date"
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={form.last_supply_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col justify-end gap-2">
          <button
            type="submit"
            className="px-6 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition"
            disabled={productStore.loading}
          >
            {productStore.loading ? "Сохранение..." : productStore.editingProduct ? "Сохранить" : "Создать"}
          </button>
          {productStore.editingProduct && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Отмена
            </button>
          )}
        </div>
      </form>
      {productStore.error && <div className="text-red-600 mb-2">{productStore.error}</div>}
      {success && <div className="text-green-600 mb-2">
        {productStore.editingProduct ? "Товар обновлен!" : "Товар создан!"}
      </div>}
      
      <div className="space-y-2">
        {productStore.products.map(prod => (
          <div key={prod.id} className="flex items-center justify-between bg-white rounded shadow px-4 py-3">
            <div>
              <div className="font-semibold">{prod.name}</div>
              <div className="text-gray-500 text-sm">{prod.description}</div>
              <div className="text-sm text-gray-700">Цена: {prod.price} ₽, Склад: {prod.stock}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-1 bg-violet-100 text-violet-600 rounded hover:bg-violet-200 transition"
                onClick={() => handleEdit(prod)}
              >
                Изменить
              </button>
              <button
                className="px-4 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                onClick={() => productStore.deleteProduct(prod.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProductAdminSection; 