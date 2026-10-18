
import { useEffect, useState } from "react";
import {
  ChefHat, House, Refrigerator, BookOpen, ShoppingCart,
  MessageCircle, CookingPot, Plus, Trash2, Check, ArrowRight,
  Clock, Sparkles, Flame, Leaf, Send, RotateCcw
} from "lucide-react";

const starterProducts = [
  { id: 1, name: "Курица", qty: "500", unit: "г", category: "Мясо" },
  { id: 2, name: "Картофель", qty: "1", unit: "кг", category: "Овощи" },
  { id: 3, name: "Яйца", qty: "6", unit: "шт.", category: "Молочное" },
  { id: 4, name: "Сыр", qty: "200", unit: "г", category: "Молочное" }
];

const recipes = [
  {
    id: 1, name: "Курица с картофелем", emoji: "🍗",
    time: 40, difficulty: "Легко", tags: ["Сытно", "Ужин"],
    ingredients: ["Курица", "Картофель"],
    description: "Простой домашний ужин с золотистой корочкой.",
    steps: [
      "Нарежь курицу и картофель на небольшие кусочки.",
      "Добавь соль, перец и любимые специи.",
      "Запекай до полной готовности курицы и мягкости картофеля."
    ]
  },
  {
    id: 2, name: "Омлет с сыром", emoji: "🍳",
    time: 12, difficulty: "Очень легко", tags: ["Быстро", "Завтрак"],
    ingredients: ["Яйца", "Сыр"],
    description: "Быстрый завтрак из простых продуктов.",
    steps: [
      "Взбей яйца в миске.",
      "Натри сыр и добавь к яйцам.",
      "Готовь на сковороде на умеренном огне до готовности."
    ]
  },
  {
    id: 3, name: "Картофельная запеканка", emoji: "🥘",
    time: 35, difficulty: "Легко", tags: ["Домашнее"],
    ingredients: ["Картофель", "Сыр"],
    description: "Нежный картофель с расплавленным сыром.",
    steps: [
      "Нарежь картофель тонкими ломтиками.",
      "Выложи в форму и добавь сыр.",
      "Запекай до мягкости картофеля и золотистой корочки."
    ]
  }
];

const readStore = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState(() =>
    readStore("azykoch-products", starterProducts)
  );
  const [shopping, setShopping] = useState(() =>
    readStore("azykoch-shopping", [])
  );
  const [newProduct, setNewProduct] = useState("");
  const [newItem, setNewItem] = useState("");
  const [search, setSearch] = useState("");
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [step, setStep] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Привет! Я AZYKOCH 👨‍🍳 Расскажи, что есть в холодильнике, или спроси, что приготовить."
    }
  ]);
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem("azykoch-products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("azykoch-shopping", JSON.stringify(shopping));
  }, [shopping]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const availableRecipes = recipes.map(recipe => {
    const found = recipe.ingredients.filter(ingredient =>
      products.some(p => p.name.toLowerCase() === ingredient.toLowerCase())
    );
    return {
      ...recipe,
      match: Math.round(found.length / recipe.ingredients.length * 100),
      missing: recipe.ingredients.filter(i => !found.includes(i))
    };
  }).filter(recipe =>
    recipe.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.match - a.match);

  function addProduct(event) {
    event.preventDefault();
    const name = newProduct.trim();
    if (!name) return;
    setProducts(old => [
      ...old,
      { id: Date.now(), name, qty: "1", unit: "шт.", category: "Другое" }
    ]);
    setNewProduct("");
  }

  function addShoppingItem(event) {
    event.preventDefault();
    const name = newItem.trim();
    if (!name) return;
    setShopping(old => [...old, { id: Date.now(), name, done: false }]);
    setNewItem("");
  }

  function toggleShopping(id) {
    setShopping(old => old.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  }

  function buyItem(item) {
    const quantity = window.prompt(
      `Сколько ${item.name} куплено? Введи количество:`,
      "1"
    );
    if (quantity === null || !quantity.trim()) return;
    const amount = Number(quantity.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Введи количество больше нуля.");
      return;
    }
    setProducts(old => [
      ...old,
      {
        id: Date.now(),
        name: item.name,
        qty: String(amount),
        unit: "шт.",
        category: "Покупки"
      }
    ]);
    setShopping(old => old.filter(i => i.id !== item.id));
  }

  function sendMessage(event) {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setMessages(old => [...old, { role: "user", text }]);
    setChatInput("");

    const lower = text.toLowerCase();
    let reply;

    if (lower.includes("куп") || lower.includes("спис")) {
      reply = shopping.length
        ? `В списке покупок: ${shopping.filter(i => !i.done).map(i => i.name).join(", ") || "всё куплено"}.`
        : "Список пока пуст. Добавь продукты в разделе «Покупки» или выбери рецепт.";
    } else if (lower.includes("есть") || lower.includes("продукт") || lower.includes("холодиль")) {
      reply = products.length
        ? `Сейчас в твоём инвентаре: ${products.map(p => `${p.name} (${p.qty} ${p.unit})`).join(", ")}.`
        : "Инвентарь пока пуст. Добавь продукты в разделе «Моя кухня».";
    } else if (lower.includes("рецепт") || lower.includes("приготов") || lower.includes("готов")) {
      const best = availableRecipes[0];
      reply = best
        ? `Попробуй «${best.name}»! Совпадение по продуктам: ${best.match}%. ${best.missing.length ? "Не хватает: " + best.missing.join(", ") + "." : "Все основные ингредиенты есть!"} Открой раздел «Рецепты», чтобы начать.`
        : "Добавь продукты в инвентарь, и я смогу предложить варианты.";
    } else if (lower.includes("яйц") || lower.includes("сыр") || lower.includes("куриц")) {
      reply = "Я пока работаю в демо-режиме. Могу показать инвентарь и подобрать рецепт из встроенного каталога. Для свободного AI-диалога позже подключим серверный API.";
    } else {
      reply = "Я AZYKOCH в демо-режиме 👨‍🍳 Пока я умею проверять инвентарь, подсказывать рецепты и список покупок. Подключение настоящего AI сделаем следующим этапом.";
    }

    setMessages(old => [...old, { role: "assistant", text: reply }]);
  }

  const nav = [
    { id: "home", label: "Главная", icon: House },
    { id: "kitchen", label: "Моя кухня", icon: Refrigerator },
    { id: "recipes", label: "Рецепты", icon: BookOpen },
    { id: "cooking", label: "Готовка", icon: CookingPot },
    { id: "shopping", label: "Покупки", icon: ShoppingCart },
    { id: "chat", label: "AI-повар", icon: MessageCircle }
  ];

  function startCooking(recipe) {
    setActiveRecipe(recipe);
    setStep(0);
    setSeconds(0);
    setTimerRunning(false);
    setPage("cooking");
  }

  const currentRecipe = activeRecipe || availableRecipes[0];
  const currentStep = currentRecipe?.steps[step];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><ChefHat size={25} /></div>
          <div><strong>AZYKOCH</strong><small>YOUR AI KITCHEN</small></div>
        </div>
        <div className="side-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        {nav.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id}
              className={`nav-link ${page === item.id ? "active" : ""}`}
              onClick={() => setPage(item.id)}>
              <Icon size={19} /><span>{item.label}</span>
              {item.id === "shopping" && shopping.filter(i => !i.done).length > 0 &&
                <span className="nav-count">{shopping.filter(i => !i.done).length}</span>}
            </button>
          );
        })}
        <div className="sidebar-bottom">
          <span className="online-dot" /> ДЕМО-РЕЖИМ
          <small>AI API ещё не подключён</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><ChefHat size={23} /> AZYKOCH</div>
          <span className="breadcrumb">Твоя кухня <span>/</span> {
            nav.find(n => n.id === page)?.label || "Готовка"
          }</span>
          <div className="profile-mark">A</div>
        </header>

        {page === "home" && <section className="page">
          <div className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><Sparkles size={14}/> ТВОЙ УМНЫЙ ПОМОЩНИК</div>
              <h1>Готовить проще.<br/><span>Жить вкуснее.</span></h1>
              <p>Я помогу придумать блюдо из того, что уже есть у тебя дома.</p>
              <button className="primary-btn" onClick={() => setPage("recipes")}>
                Найти рецепт <ArrowRight size={17}/>
              </button>
            </div>
            <div className="hero-art"><span>🥘</span><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/></div>
            <div className="hero-note"><Leaf size={15}/> Меньше отходов — больше вкуса</div>
          </div>

          <div className="section-heading">
            <div><span className="eyebrow">ТВОЙ ПРОГРЕСС</span><h2>Кухня сегодня</h2></div>
            <span className="date-label">{new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><span className="stat-icon green"><Refrigerator/></span><span>Продуктов дома</span><strong>{products.length}</strong><small>В твоём инвентаре</small></div>
            <div className="stat-card"><span className="stat-icon orange"><BookOpen/></span><span>Рецептов найдено</span><strong>{availableRecipes.length}</strong><small>В демо-каталоге</small></div>
            <div className="stat-card"><span className="stat-icon purple"><ShoppingCart/></span><span>Нужно купить</span><strong>{shopping.filter(i => !i.done).length}</strong><small>В списке покупок</small></div>
          </div>

          <div className="section-heading">
            <div><span className="eyebrow">ПОДБОРКА ДЛЯ ТЕБЯ</span><h2>Что приготовим?</h2></div>
            <button className="text-btn" onClick={() => setPage("recipes")}>Все рецепты <ArrowRight size={15}/></button>
          </div>
          <RecipeGrid recipes={availableRecipes.slice(0, 3)} onCook={startCooking}/>
        </section>}

        {page === "kitchen" && <section className="page">
          <div className="page-title"><span className="eyebrow">ИНВЕНТАРЬ</span><h1>Моя кухня</h1><p>Знаем, что есть дома — меньше выбрасываем.</p></div>
          <form className="add-form" onSubmit={addProduct}>
            <input value={newProduct} onChange={e => setNewProduct(e.target.value)} placeholder="Например, помидоры..." aria-label="Название продукта"/>
            <button className="primary-btn" type="submit"><Plus size={17}/> Добавить</button>
          </form>
          <div className="inventory-grid">
            {products.map(product => <div className="inventory-card" key={product.id}>
              <div className="product-symbol">🥬</div>
              <div className="product-info"><strong>{product.name}</strong><small>{product.category}</small><span>{product.qty} {product.unit}</span></div>
              <button className="icon-btn danger" onClick={() => {
                if (window.confirm(`Удалить ${product.name} из инвентаря?`))
                  setProducts(old => old.filter(p => p.id !== product.id));
              }} aria-label={`Удалить ${product.name}`}><Trash2 size={17}/></button>
            </div>)}
          </div>
          {!products.length && <Empty title="Пока пусто" text="Добавь первые продукты в свою кухню."/>}
        </section>}

        {page === "recipes" && <section className="page">
          <div className="page-title"><span className="eyebrow">ВКУСНЫЕ ИДЕИ</span><h1>Найди свой рецепт</h1><p>Рецепты сортируются по совпадению с твоими продуктами.</p></div>
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск рецепта..."/>
          <RecipeGrid recipes={availableRecipes} onCook={startCooking}/>
          {!availableRecipes.length && <Empty title="Ничего не найдено" text="Попробуй изменить поисковый запрос."/>}
        </section>}

        {page === "cooking" && <section className="page cooking-page">
          <div className="page-title"><span className="eyebrow">COOKING MODE</span><h1>Готовим вместе</h1><p>Шаг за шагом, без спешки.</p></div>
          {currentRecipe ? <>
            <div className="cooking-card">
              <div className="cooking-food">{currentRecipe.emoji}</div>
              <span className="eyebrow">ТЕКУЩИЙ РЕЦЕПТ</span>
              <h2>{currentRecipe.name}</h2>
              <div className="recipe-meta"><span><Clock size={15}/> {currentRecipe.time} мин</span><span>{currentRecipe.difficulty}</span></div>
              <div className="step-progress"><div style={{width: `${((step + 1) / currentRecipe.steps.length) * 100}%`}}/></div>
              <div className="step-counter">ШАГ {step + 1} ИЗ {currentRecipe.steps.length}</div>
              <p className="step-text">{currentStep}</p>
              <div className="timer-box">
                <Clock size={20}/><strong>{String(Math.floor(seconds / 60)).padStart(2,"0")}:{String(seconds % 60).padStart(2,"0")}</strong>
                <button className="secondary-btn" onClick={() => setTimerRunning(v => !v)}>{timerRunning ? "Пауза" : "Старт таймера"}</button>
                <button className="icon-btn" onClick={() => {setSeconds(0);setTimerRunning(false);}} aria-label="Сбросить таймер"><RotateCcw size={16}/></button>
              </div>
              <div className="step-actions">
                <button className="secondary-btn" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Назад</button>
                <button className="primary-btn" onClick={() => {
                  if (step < currentRecipe.steps.length - 1) setStep(s => s + 1);
                  else { setTimerRunning(false); window.alert("Отличная работа! Приятного аппетита!"); }
                }}>{step === currentRecipe.steps.length - 1 ? "Готово!" : "Следующий шаг"} <ArrowRight size={16}/></button>
              </div>
            </div>
            <p className="demo-note">Время таймера считает секунды, пока страница открыта. Это пока не таймер безопасности и не уведомление в фоне.</p>
          </> : <Empty title="Выбери блюдо" text="Перейди в рецепты и нажми «Начать готовить»."/>}
        </section>}

        {page === "shopping" && <section className="page">
          <div className="page-title"><span className="eyebrow">НЕ ЗАБУДЬ КУПИТЬ</span><h1>Список покупок</h1><p>Всё необходимое — в одном месте.</p></div>
          <form className="add-form" onSubmit={addShoppingItem}>
            <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Что нужно купить?" aria-label="Новый товар"/>
            <button className="primary-btn" type="submit"><Plus size={17}/> Добавить</button>
          </form>
          <div className="shopping-card">
            {shopping.map(item => <div className={`shopping-row ${item.done ? "checked" : ""}`} key={item.id}>
              <button className="check-btn" onClick={() => toggleShopping(item.id)} aria-label="Отметить покупку">{item.done && <Check size={15}/>}</button>
              <span className="shopping-name">{item.name}</span>
              {!item.done && <button className="text-btn" onClick={() => buyItem(item)}>Куплено</button>}
              <button className="icon-btn" onClick={() => setShopping(old => old.filter(i => i.id !== item.id))} aria-label="Удалить"><Trash2 size={16}/></button>
            </div>)}
            {!shopping.length && <Empty title="Список пуст" text="Добавь товары или ингредиенты для рецепта."/>}
          </div>
          {shopping.some(i => i.done) && <button className="text-btn clear-btn" onClick={() => setShopping(old => old.filter(i => !i.done))}>Удалить отмеченные</button>}
        </section>}

        {page === "chat" && <section className="page chat-page">
          <div className="page-title"><span className="eyebrow">ТВОЙ AI-ПОВАР</span><h1>Спроси AZYKOCH</h1><p>Демо-чат с доступом к твоему текущему инвентарю.</p></div>
          <div className="chat-card">
            <div className="chat-header"><div className="assistant-avatar"><ChefHat/></div><div><strong>AZYKOCH Chef</strong><small><span className="online-dot"/> Demo assistant</small></div><span className="demo-badge">DEMO</span></div>
            <div className="messages">
              {messages.map((message, i) => <div key={i} className={`message ${message.role}`}>
                {message.role === "assistant" && <div className="mini-avatar">👨‍🍳</div>}
                <p>{message.text}</p>
              </div>)}
            </div>
            <div className="quick-prompts">
              {["Что у меня есть?", "Что приготовить?", "Что купить?"].map(text =>
                <button key={text} className="prompt-chip" onClick={() => {
                  setChatInput(text);
                }}>{text}</button>
              )}
            </div>
            <form className="chat-form" onSubmit={sendMessage}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Напиши сообщение..." aria-label="Сообщение помощнику"/>
              <button className="send-btn" type="submit" aria-label="Отправить"><Send size={18}/></button>
            </form>
          </div>
          <p className="demo-note">Это демонстрационная логика, а не подключённая языковая модель. Настоящий AI подключим через защищённый серверный API.</p>
        </section>}

        {page === "settings" && <section className="page">
          <div className="page-title"><span className="eyebrow">ПРОЕКТ</span><h1>Настройки</h1><p>Статус текущей версии AZYKOCH.</p></div>
          <div className="settings-card"><Sparkles/><div><strong>AZYKOCH MVP</strong><p>Версия 0.1.0 · Демо-режим</p><small>React + Vite · Local storage · Cloudflare</small></div></div>
          <div className="settings-card"><Refrigerator/><div><strong>Локальные данные</strong><p>Продукты и покупки сохраняются в этом браузере.</p><button className="text-btn" onClick={() => {
            if (window.confirm("Очистить продукты и список покупок?")) {
              setProducts([]);
              setShopping([]);
            }
          }}>Очистить данные</button></div></div>
        </section>}

        <footer className="footer"><span>AZYKOCH © {new Date().getFullYear()}</span><span>COOK SMARTER. WASTE LESS.</span></footer>
      </main>

      <nav className="mobile-nav">
        {nav.filter(n => ["home", "kitchen", "recipes", "shopping", "chat"].includes(n.id)).map(item => {
          const Icon = item.icon;
          return <button key={item.id} className={page === item.id ? "selected" : ""} onClick={() => setPage(item.id)}>
            <Icon size={20}/><span>{item.label}</span>
          </button>;
        })}
      </nav>
    </div>
  );
}

function RecipeGrid({ recipes, onCook }) {
  return <div className="recipe-grid">
    {recipes.map(recipe => <article className="recipe-card" key={recipe.id}>
      <div className="recipe-visual"><span>{recipe.emoji}</span><div className="match-badge"><Sparkles size={12}/> {recipe.match}% совпадение</div></div>
      <div className="recipe-body">
        <div className="recipe-tags">{recipe.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        <h3>{recipe.name}</h3><p>{recipe.description}</p>
        <div className="recipe-meta"><span><Clock size={14}/> {recipe.time} мин</span><span>{recipe.difficulty}</span></div>
        <div className="ingredient-list">{recipe.ingredients.map(name => <span key={name} className={recipe.missing.includes(name) ? "missing" : ""}>{recipe.missing.includes(name) ? "＋" : "✓"} {name}</span>)}</div>
        {recipe.missing.length > 0 && <p className="missing-note">Нужно докупить: {recipe.missing.join(", ")}</p>}
        <button className="primary-btn full-btn" onClick={() => onCook(recipe)}>Начать готовить <ArrowRight size={16}/></button>
      </div>
    </article>)}
  </div>;
}

function Empty({ title, text }) {
  return <div className="empty-state"><span>🍽️</span><strong>{title}</strong><p>{text}</p></div>;
}
