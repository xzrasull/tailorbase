# TailorBase

**TailorBase** — облачный сервис для профессиональных портных. Позволяет хранить мерки клиентов в Firebase, управлять базой данных с любого устройства и находить нужного клиента за секунды. Никаких бумажных блокнотов — только точность, порядок и удобный поиск.

---

## Стек технологий

- **Frontend:** HTML, CSS, Vanilla JS (ES Modules)
- **Backend / БД:** Firebase (Firestore + Authentication)
- **Аутентификация:** Google OAuth (через Firebase Auth)
- **Шрифты:** Google Fonts (Science Gothic)
- **Хостинг:** статический (Vercel)

---

## Структура проекта

```
/
├── index.html          # Лендинг / главная страница
├── about.html          # Страница "О нас"
├── auth.html           # Страница входа (Google OAuth)
├── style.css           # Стили для публичных страниц
│
└── profile/            # Защищённый раздел (после входа)
    ├── main.html       # Список клиентов
    ├── profile.html    # Профиль пользователя
    ├── profileStyle.css
    ├── main.js         # Логика работы с клиентами (Firestore CRUD)
    └── profile.js      # Профиль + выход из системы
│
└── script.js           # Логика аутентификации (Google Sign-In)
```

---

## Функциональность

### Публичные страницы
- **`index.html`** — лендинг с описанием сервиса и кнопкой входа
- **`about.html`** — информация о проекте и авторе
- **`auth.html`** — вход через Google аккаунт

### Личный кабинет (после авторизации)
- **Список клиентов** — карточки с именем и фото, сортировка по дате добавления
- **Поиск** — живой поиск по имени (синхронизирован между desktop и мобильной версией)
- **Добавление клиента** — форма с базовыми и расширенными мерками:
  - Базовые: рост, талия, грудь, бёдра
  - Расширенные: плечи, спина, шея, рукав, запястье, бедро, длина брюк и др. (17 полей)
  - Поле для заметок / описания
- **Просмотр мерок** — попап с полным набором данных клиента
- **Редактирование** — изменение любых данных клиента
- **Удаление** — с подтверждением
- **Профиль** — имя пользователя и кнопка выхода

---

## Мерки (поддерживаемые поля)

| Поле | Описание |
|------|----------|
| Рост | Общий рост |
| Талия | Обхват талии |
| Грудь | Обхват груди |
| Бёдра (сурин) | Обхват бёдер |
| Ширина плеч | |
| Длина плеча | |
| Ширина спины | |
| Длина спины до талии | |
| Обхват шеи | |
| Длина рукава | |
| Обхват руки | |
| Запястье | |
| Внутренняя длина ноги | |
| Внешняя длина ноги | |
| Обхват бедра | |
| Глубина сиденья | |
| Полная длина | |

---

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone https://github.com/xzrasul13/tailorbase.git
cd tailorbase
```

### 2. Настроить Firebase

1. Создайте проект на [console.firebase.google.com](https://console.firebase.google.com)
2. Включите **Firestore Database** (режим production или test)
3. Включите **Authentication → Google**
4. Скопируйте конфиг и замените значения в `script.js`, `main.js`, `profile.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 3. Правила Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Запустить локально

Откройте через любой локальный HTTP-сервер (не через `file://`):

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Откройте `http://localhost:8000` в браузере.

---

## Структура данных в Firestore

```
users/
  {uid}/
    displayName: string
    email: string
    photoURL: string
    lastLogin: timestamp
    
    clients/
      {clientId}/
        name: string
        description: string
        createdAt: timestamp
        updatedAt: timestamp
        measurements:
          height: number
          waist: number
          bust: number
          hips: number
          shoulderWidth: number
          shoulderLength: number
          backWidth: number
          backWaistLength: number
          neckGirth: number
          sleeveLength: number
          armGirth: number
          wrist: number
          inseam: number
          outseam: number
          thigh: number
          crotchDepth: number
          fullLength: number
```

---

## Адаптивность

Сайт полностью адаптирован под три типа устройств:

- **Mobile (< 768px)** — бургер-меню, выдвижной drawer, карточки в сетке 2×N
- **Tablet (600–767px)** — сетка 3×N
- **Desktop (≥ 768px)** — полная навигация в хедере, поиск и иконка профиля

---

## Автор

**Расулджон Муминов**

- Instagram: [@xzrasul](https://www.instagram.com/xzrasul)
- Telegram: [@xzrasul](https://t.me/xzrasul)
- Телефон: +992 200 190 190

---

© 2026 Tailor Base. Все права защищены.# tailorbase
