import React from "react";

const categories = [
  {
    title: "Компьютеры",
    desc: "Готовые сборки для любых задач",
    icon: "💻",
    color: "bg-blue-50"
  },
  {
    title: "Комплектующие",
    desc: "Процессоры, видеокарты и многое другое",
    icon: "🖥️",
    color: "bg-violet-50"
  },
  {
    title: "Периферия",
    desc: "Клавиатуры, мыши и мониторы",
    icon: "⌨️",
    color: "bg-pink-50"
  },
];

const features = [
  {
    icon: "🚚",
    title: "Быстрая доставка",
    desc: "Доставим ваш заказ в кратчайшие сроки по всей России."
  },
  {
    icon: "💸",
    title: "Выгодные цены",
    desc: "Прямые поставки от производителей и регулярные акции."
  },
  {
    icon: "🛡️",
    title: "Гарантия качества",
    desc: "Только сертифицированные товары и официальная гарантия."
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Баннер */}
      <section className="max-w-3xl mx-auto mt-10 mb-8">
        <div className="rounded-2xl p-8 text-center bg-gradient-to-r from-violet-500 to-blue-400 text-white shadow-lg">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Добро пожаловать в <span className="text-white drop-shadow">TechStore</span></h1>
          <p className="mb-6 text-lg">Широкий выбор компьютеров и комплектующих по доступным ценам.<br/>Соберите свой идеальный компьютер уже сегодня!</p>
          <button className="px-6 py-2 bg-white text-violet-700 font-semibold rounded hover:bg-violet-100 transition">Смотреть товары</button>
        </div>
      </section>

      {/* Категории */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Популярные категории</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.title} className={`rounded-2xl p-6 ${cat.color} shadow hover:shadow-md transition flex flex-col items-center`}>
              <div className="text-5xl mb-4">{cat.icon}</div>
              <div className="font-semibold text-lg mb-1">{cat.title}</div>
              <div className="text-gray-500 text-sm mb-3 text-center">{cat.desc}</div>
              <a href="#" className="text-violet-700 font-medium hover:underline">Подробнее →</a>
            </div>
          ))}
        </div>
      </section>

      {/* Почему выбирают нас */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Почему выбирают нас</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow flex flex-col items-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <div className="font-semibold text-lg mb-1">{f.title}</div>
              <div className="text-gray-500 text-sm text-center">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 