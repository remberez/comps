
const categories = [
  {
    title: "Компьютеры",
    desc: "Готовые сборки и комплектующие",
    icon: "💻",
    color: "bg-blue-50",
  },
  {
    title: "Периферия",
    desc: "Клавиатуры, мыши, мониторы",
    icon: "🖱️",
    color: "bg-green-50",
  },
  {
    title: "Аксессуары",
    desc: "Сумки, подставки, кабели",
    icon: "🎒",
    color: "bg-purple-50",
  },
];

const features = [
  {
    title: "Быстрая доставка",
    desc: "Доставляем в течение 1-2 дней",
    icon: "🚚",
  },
  {
    title: "Гарантия качества",
    desc: "Гарантия на все товары 1 год",
    icon: "⭐",
  },
  {
    title: "Поддержка 24/7",
    desc: "Всегда на связи с вами",
    icon: "💬",
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