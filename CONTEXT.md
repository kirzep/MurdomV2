# MURDOM — Полный технический контекст проекта

> Этот документ предназначен для ИИ-ассистентов. Здесь описан каждый компонент, API, функция и механика приложения с достаточным уровнем детализации, чтобы точно отвечать на вопросы о проекте.

---

## 1. ЧТО ЭТО ЗА ПРОЕКТ

**Murdom** — прогрессивное веб-приложение (PWA) для управления кошачьим приютом. Дипломный проект студента Цепелёва Кирилла (2025).

**Что делает приложение:**
- Ведёт карточки кошек (фото, документы, медицинские обработки, статусы).
- Отслеживает даты прививок и напоминает о ревакцинации.
- Управляет командой сотрудников с разными правами доступа.
- Генерирует PDF-карты животных.
- Показывает публичные карточки животных для пристройства с Open Graph превью для соцсетей.
- Отправляет push-уведомления о просроченных прививках.
- Устанавливается как нативное приложение на телефон (PWA).

---

## 2. ТЕХНОЛОГИЧЕСКИЙ СТЕК

| Слой | Что используется |
|------|-----------------|
| Фреймворк | **Next.js 14** (App Router, TypeScript) |
| Рендеринг | Серверные компоненты + клиентские компоненты React 18 |
| Стилизация | **Tailwind CSS** v3, mobile-first, брейкпоинты sm/md/lg/xl |
| Анимации | **Framer Motion** v10 — пружинные переходы, hover-эффекты, AnimatePresence |
| База данных | **SQLite** (файл `prisma/dev.db`) через **Prisma ORM** v6 |
| Аутентификация | **NextAuth.js** v4, стратегия JWT, провайдер Credentials (email+пароль) |
| Хеширование паролей | **bcrypt** (10 раундов) |
| Обработка изображений | **sharp** — ресайз до 1024×1024, конвертация в JPEG 85% |
| Экспорт PDF | **jsPDF** + **html2canvas** |
| Push-уведомления | **web-push** (VAPID) |
| Нечёткий поиск | **fuse.js** (порог 0.4) |
| Даты | **date-fns** + locale `ru` |
| Формы | React Hook Form + Zod |
| Сканер документов | **react-webcam** (доступ к камере устройства) |
| Отладка запросов | use-debounce (400мс задержка поиска) |
| Иконки | lucide-react |
| Среда выполнения | Node.js 18+ |

---

## 3. СТРУКТУРА ПАПОК

```
app/
├── adopt/[id]/           # Публичная страница пристройства (БЕЗ авторизации)
│   ├── page.tsx          # Серверный компонент: читает БД, генерирует OG-мета
│   └── AdoptionCard.tsx  # Клиентский компонент: UI карточки + кнопка Share
├── api/                  # REST API (Next.js Route Handlers)
│   ├── auth/[...nextauth]/route.ts   # NextAuth обработчик
│   ├── cats/
│   │   ├── route.ts                  # GET все кошки, POST создать, DELETE массовое удаление
│   │   └── [id]/
│   │       ├── route.ts              # GET/PATCH/DELETE одной кошки
│   │       ├── treatments/route.ts   # POST/DELETE обработки
│   │       ├── documents/route.ts    # POST/DELETE документы
│   │       ├── photos/route.ts       # GET/POST/DELETE фотогалерея
│   │       ├── photos/[photoId]/route.ts  # PATCH — сделать фото аватаром
│   │       └── audit/route.ts        # GET журнал аудита (последние 5 записей)
│   ├── upload/route.ts              # POST — загрузка файлов (sharp обработка)
│   ├── profile/route.ts             # PATCH — обновление профиля пользователя
│   ├── setup-profile/route.ts       # PATCH — первичная настройка профиля
│   ├── register/route.ts            # POST — регистрация по токену приглашения
│   ├── staff/
│   │   ├── route.ts                 # GET список сотрудников
│   │   ├── [id]/route.ts            # PATCH/DELETE конкретный сотрудник
│   │   └── invitations/route.ts     # POST — создание ссылки-приглашения
│   ├── push/
│   │   ├── subscribe/route.ts       # POST/DELETE — управление подписками
│   │   ├── vapid-key/route.ts       # GET — публичный VAPID ключ
│   │   ├── notify/route.ts          # POST — отправить уведомление конкретному пользователю
│   │   └── broadcast/route.ts       # POST — отправить всем (о просрочках)
│   ├── get-user-profile/route.ts    # GET профиль пользователя по id
│   ├── health/route.ts              # GET healthcheck (возвращает {status:"ok"})
│   └── icons/[folder]/route.ts      # GET список файлов-иконок из папки
├── components/
│   ├── AppShell.tsx       # Обёртка: скрывает нижнюю навигацию на /login, /register, /adopt
│   ├── BottomNavBar.tsx   # Нижняя панель навигации (дашборд, календарь, персонал, профиль)
│   ├── LoadingScreen.tsx  # Экран загрузки с летящими иконками
│   ├── SidePanel.tsx      # Боковая панель (если открыта)
│   ├── PatchNotesModal.tsx # Модалка с патч-нотами при обновлении версии
│   ├── ConnectionStatusBanner.tsx  # Баннер "нет интернета"
│   ├── PWAInstaller.tsx   # Управление установкой PWA
│   ├── InstallPWAButton.tsx
│   └── ui/
│       ├── Button.tsx     # Полиморфная кнопка (as prop), варианты primary/secondary/danger/ghost
│       ├── Input.tsx      # Инпут с иконкой слева
│       ├── Modal.tsx      # Модальное окно через Portal
│       ├── Portal.tsx     # React Portal для рендера вне иерархии
│       ├── Spinner.tsx    # Спиннер загрузки
│       └── Skeleton.tsx   # Мерцающий скелетон-плейсхолдер (CSS анимация shimmer)
├── dashboard/
│   ├── page.tsx           # Серверный компонент: загружает иконки, рендерит DashboardClient
│   ├── DashboardClient.tsx # Клиентский: поиск, фильтры, список кошек, ShelterStats
│   ├── CatCard.tsx        # Карточка кошки в списке (fade-up анимация, hover-lift, long-press)
│   ├── AddCatModal.tsx    # Модалка добавления новой кошки
│   ├── ShelterStats.tsx   # Сворачиваемая панель статистики приюта
│   ├── RevaccinationAlerts.tsx # Аккордеон-баннер просроченных/предстоящих прививок
│   ├── RevaccinationModal.tsx  # Модалка с деталями прививок
│   ├── CreatorInfoModal.tsx    # Модалка "кто создал карточку"
│   └── calendar/
│       ├── page.tsx         # Страница календаря прививок
│       ├── CalendarView.tsx # Компонент календаря (месяц/год/список)
│       ├── CalendarEventCard.tsx  # Карточка события в календаре
│       └── ConfirmVaccinationModal.tsx  # Подтверждение прививки
│   cat/[id]/
│       ├── page.tsx               # Страница профиля кошки: свайп профиль↔галерея, PDF экспорт
│       ├── CatProfileView.tsx     # Основной вид профиля (объединяет все секции)
│       ├── CatProfileHeader.tsx   # Шапка: аватар, имя, возраст, кнопки действий, "Поделиться"
│       ├── PhotoGallery.tsx       # Галерея фото: upload, выделение, delete, лайтбокс
│       ├── TreatmentsSection.tsx  # Список обработок/прививок с бейджами
│       ├── DocumentsSection.tsx   # Раздел документов
│       ├── DocumentItem.tsx       # Отдельный документ (иконка по типу, просмотр/скачать)
│       ├── DocumentViewerModal.tsx # Просмотр документа в модалке
│       ├── NotesSection.tsx       # Редактируемые заметки (textarea с автосохранением)
│       ├── EditCatModal.tsx       # Модалка редактирования данных кошки
│       ├── AuditLogModal.tsx      # Журнал изменений
│       ├── ScanDocumentModal.tsx  # Сканирование через камеру (react-webcam)
│       ├── CatTimeline.tsx        # Хроника событий (единая лента: прибытие, обработки, документы, фото)
│       └── CatReportTemplate.tsx  # Скрытый шаблон для PDF (рендерится за экраном)
├── login/page.tsx         # Страница входа
├── register/[token]/page.tsx  # Страница регистрации по токену приглашения
├── setup-profile/page.tsx # Первичная настройка профиля (имя + аватар)
├── profile/page.tsx       # Страница профиля пользователя
├── staff/page.tsx         # Управление командой
├── users/[id]/page.tsx    # Публичная страница профиля сотрудника
├── view-profile/[id]/page.tsx # Просмотр профиля пользователя
├── globals.css            # Глобальные стили: скролл, bg-noise, .btn-spring, .skeleton, @keyframes
├── layout.tsx             # Корневой layout: Nunito шрифт, PWA метаданные, AppShell
└── template.tsx           # Шаблон страницы (анимация появления)

lib/
├── auth.ts                # authOptions для NextAuth (JWT стратегия, callbacks)
├── prisma.ts              # Синглтон PrismaClient (предотвращение дублирования в dev)
├── revaccinationHelper.ts # Логика расчёта дат прививок
├── calendarHelper.ts      # Генерация событий для календаря
└── utils.ts               # generateAvatar и другие утилиты

hooks/
├── useLongPress.ts        # Хук длинного нажатия (haptic feedback, детекция скролла)
└── (другие кастомные хуки)

prisma/
├── schema.prisma          # Схема БД
├── seed.ts                # Сид: 29 кошек + 4 пользователя
└── migrations/            # 4 миграции истории схемы

public/
├── sw.js                  # Service Worker (кеш + push-уведомления)
├── manifest.json          # Web App Manifest (PWA)
├── uploads/               # Загруженные файлы (игнорируется в git)
└── screenshots/           # Скриншоты для README и manifest

middleware.ts              # Защита маршрутов NextAuth
```

---

## 4. МОДЕЛЬ ДАННЫХ (PRISMA SCHEMA)

### User
Пользователь системы.
- `id` — CUID (строка)
- `name`, `email` (unique), `password` (hashed bcrypt), `image` (путь к аватару)
- `role` — enum: `VOLUNTEER | MEDICAL_STAFF | TRUSTED_PERSON | DEVELOPER`
- `isProfileSetupComplete` — boolean, false у новых пользователей (ведёт на `/setup-profile`)
- Связи: `createdCats`, `auditLogs`, `subscriptions` (push), `createdInvitations`, `sentMessages`

### Cat
Карточка кошки.
- `id` — CUID
- `name`, `avatarUrl`, `arrivalDate`, `birthYear`, `notes`, `status` (default "В приюте")
- `creatorId` — FK на User с `onDelete: SetNull`
- Связи: `treatments`, `documents`, `photos`, `auditLogs`

### Treatment
Медицинская обработка.
- `type` — enum: `WORMS | FLEAS | EAR_MITES | VACCINATION`
- `date`, `productName`, `vaccinationStage` (null | 'first' | 'second' | 'revaccination')
- FK на Cat с `onDelete: Cascade`

### Photo
Фотография в галерее.
- `filePath`, `isAvatar` (boolean, max 1 per cat), `createdAt`
- FK на Cat с `onDelete: Cascade`

### Document
Документ котика.
- `fileName`, `filePath`, `fileType` (MIME-тип)
- FK на Cat с `onDelete: Cascade`

### AuditLog
Журнал изменений.
- `change` (текстовое описание), `createdAt`
- FK на Cat и User с `onDelete: Cascade`

### Invitation
Одноразовая ссылка-приглашение.
- `token` (random 32 bytes hex), `expires` (24 часа), `used` (boolean)
- FK на User (`createdBy`)

### PushSubscription
Подписка на push-уведомления.
- `endpoint` (unique), `p256dh`, `auth` (ключи Web Push)
- FK на User с `onDelete: Cascade`

### NextAuth таблицы
`Account`, `Session`, `VerificationToken` — стандартные таблицы NextAuth.

---

## 5. REST API — ПОЛНЫЙ СПРАВОЧНИК

### Аутентификация (все API, кроме `/adopt/[id]/page.tsx`)
Все защищённые API вызывают `getServerSession(authOptions)`. Если сессии нет → 401. Если роль не подходит → 403.

---

### `GET /api/cats`
**Авторизация:** любой залогиненный.
**Параметры:** `?q=текст` (опционально) — нечёткий поиск по имени через fuse.js (threshold 0.4).
**Возвращает:** массив объектов Cat с полями `creator: User` и `treatments: Treatment[]`.
**Без q:** все кошки, сортировка по `createdAt DESC`.
**С q:** результаты нечёткого поиска.

### `POST /api/cats`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Тело:** `{ name, avatarUrl?, arrivalDate?, birthYear? }`.
**Логика:** если avatarUrl не передан — генерируется через `generateAvatar(name)`.
**Возвращает:** созданный Cat с creator, статус 201.

### `DELETE /api/cats`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Тело:** `{ ids: string[] }` — массив ID.
**Возвращает:** `{ message: "N cats deleted successfully." }`.

---

### `GET /api/cats/[id]`
**Авторизация:** любой залогиненный.
**Возвращает:** Cat с `treatments`, `documents`, `creator`. 404 если не найден.

### `PATCH /api/cats/[id]`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Тело:** любые поля Cat + опциональный `newAvatarPath`.
**Логика:**
1. Находит текущую кошку.
2. Вычисляет что изменилось (`createChangeDescription`): имя, год рождения, статус, дата прибытия, аватар, заметки.
3. Создаёт `AuditLog` запись если есть изменения.
4. Если `newAvatarPath`: в транзакции снимает флаг `isAvatar` со старого фото, создаёт новый Photo с `isAvatar: true`, обновляет `avatarUrl` в Cat.
5. Иначе просто обновляет Cat.
**Возвращает:** обновлённый Cat.

### `DELETE /api/cats/[id]`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Логика:**
1. Находит кошку со всеми документами и фото.
2. Физически удаляет файлы с диска (`fs.unlink`).
3. В транзакции удаляет AuditLog записи и саму кошку (остальное каскадно).
**Возвращает:** `{ message: "Cat deleted successfully" }`.

---

### `GET /api/cats/[id]/audit`
**Авторизация:** любой залогиненный.
**Возвращает:** последние 5 записей AuditLog с `user.name`. Сортировка `createdAt DESC`.

---

### `POST /api/cats/[id]/treatments`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Тело:** `{ type: TreatmentType, date: string, productName: string, vaccinationStage?: string }`.
**Логика:** создаёт Treatment + AuditLog с описанием на русском.
**Возвращает:** новый Treatment, статус 201.

### `DELETE /api/cats/[id]/treatments?treatmentId=ID`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Параметры:** `?treatmentId=` в URL.
**Логика:** удаляет Treatment + создаёт AuditLog.

---

### `GET /api/cats/[id]/photos`
**Авторизация:** любой залогиненный.
**Возвращает:** массив Photo, сортировка: аватар первым (`isAvatar DESC`), затем по дате.

### `POST /api/cats/[id]/photos`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Тело:** `{ filePaths: string[] }`.
**Логика:** создаёт несколько Photo через `createMany`, создаёт AuditLog.

### `DELETE /api/cats/[id]/photos`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Тело:** `{ ids: string[] }`.
**Логика:** проверяет что ни одна фото не является аватаром (→ 400), физически удаляет файлы, удаляет из БД, AuditLog.

### `PATCH /api/cats/[id]/photos/[photoId]`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Логика:** в транзакции снимает `isAvatar` у всех фото котика, ставит `isAvatar: true` у выбранного, обновляет `avatarUrl` у Cat.

---

### `POST /api/cats/[id]/documents`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Тело:** `{ fileName, filePath, fileType }`.
**Логика:** в транзакции создаёт AuditLog + Document.
**Возвращает:** новый Document, статус 201.

### `DELETE /api/cats/[id]/documents`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Режим 1:** `?documentId=ID` — удаляет одни документ.
**Режим 2:** тело `{ ids: string[] }` — массовое удаление.
**Логика:** физически удаляет файлы + записи + AuditLog.

---

### `POST /api/upload`
**Авторизация:** любой залогиненный.
**Тело:** multipart/form-data с полем `file`.
**Логика:**
1. Читает файл в буфер.
2. Пытается обработать через sharp: ресайз до 1024×1024 (fit: inside, без увеличения), JPEG 85%.
3. Если sharp падает (PDF или неизвестный тип) — сохраняет оригинал как есть.
4. Сохраняет в `public/uploads/`, имя: `{timestamp}-{random}.jpeg` или с оригинальным расширением.
**Возвращает:** `{ success, fileName, filePath: "/uploads/...", fileType }`.

---

### `PATCH /api/profile`
**Авторизация:** любой залогиненный.
**Тело:** multipart/form-data, поля `name` (string) и/или `file` (изображение).
**Логика:** обновляет имя и/или аватар пользователя. Аватар: sharp → 512×512 JPEG, сохраняется в `public/uploads/avatars/`.

---

### `GET /api/staff`
**Авторизация:** любой залогиненный.
**Возвращает:** массив `{ id, name, email, role, image }` — только безопасные поля.

### `POST /api/staff/invitations`
**Авторизация:** MEDICAL_STAFF, TRUSTED_PERSON, DEVELOPER.
**Логика:** генерирует токен (32 байта hex), срок 24 часа, создаёт Invitation в БД.
**Возвращает:** `{ inviteLink: "https://domain/register/{token}" }`.

---

### `POST /api/register`
**Авторизация:** публичный.
**Тело:** `{ email, password, token }`.
**Логика:**
1. Проверяет токен (существует, не использован, не просрочен).
2. Проверяет email на уникальность.
3. Хеширует пароль bcrypt с солью 10.
4. В транзакции: создаёт User (роль `VOLUNTEER`, `isProfileSetupComplete: false`) + помечает Invitation как `used: true`.
**Возвращает:** созданный User, статус 201.

---

### `POST /api/push/subscribe`
**Авторизация:** любой залогиненный.
**Тело:** объект PushSubscription браузера `{ endpoint, keys: { p256dh, auth } }`.
**Логика:** если подписки с таким endpoint нет — создаёт. Если есть — ничего не делает.

### `DELETE /api/push/subscribe`
**Тело:** `{ endpoint }`.
**Логика:** удаляет подписку из БД (игнорирует P2025 если уже удалена).

### `GET /api/push/vapid-key`
**Возвращает:** `{ publicKey: process.env.VAPID_PUBLIC_KEY }`.

---

### `GET /api/health`
Возвращает `{ status: "ok" }`. Используется для мониторинга.

---

## 6. КЛЮЧЕВЫЕ БИЗНЕС-ФУНКЦИИ

### Логика ревакцинации (`lib/revaccinationHelper.ts`)

Функция `getRevaccinationStatus(cat: Cat): RevaccinationInfo` — **ключевая бизнес-логика**:

```
Вход: объект Cat с treatments
Выход: { status: 'overdue'|'upcoming'|null, dueDate, isOverdue, message }
```

**Алгоритм:**
1. Если статус кошки не "В приюте" → возвращает null (не проверяем дома/на радуге).
2. Если есть **будущая запланированная** прививка в течение 7 дней → upcoming.
3. Среди прошлых прививок ищет:
   - Последнюю ежегодную (`revaccination`) → следующая через 1 год.
   - Первичную без второй (`first` без `second`) → ревакцинация через 28 дней.
   - Первичную + вторую → следующая ежегодная через 1 год от первичной.
4. Если дата прошла (и не сегодня) → `overdue`. Если в пределах 7 дней → `upcoming`. Иначе → null.

Используется в:
- `DashboardClient.tsx` — вычисляет `vaccinationAlerts` через `useMemo` по всем кошкам.
- `RevaccinationAlerts.tsx` — отображает баннер-аккордеон на дашборде.
- `ShelterStats.tsx` — счётчик "Внимание".
- `CatProfileHeader.tsx` — алерт на карточке конкретной кошки.

---

### Хук useLongPress (`hooks/useLongPress.ts`)

```typescript
useLongPress(onLongPress, onClick, { delay: 500, isPreventDefault: true })
```

Возвращает: `{ onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd, onMouseMove, onTouchMove }`.

**Логика:**
- При нажатии стартует таймер на `delay` мс. Если удержать — срабатывает `onLongPress` + вибрация 50мс.
- При отпускании до таймера (и без скролла) — срабатывает `onClick`.
- Если пальц сдвинулся более чем на 10px — таймер сбрасывается, клик не срабатывает (скролл).

Используется: `CatCard.tsx` (long-press → режим выделения), `PhotoGallery.tsx` (long-press → выделение фото).

---

## 7. СТРАНИЦЫ (КЛИЕНТСКАЯ ЧАСТЬ)

### `/dashboard` — Главный дашборд

**Компонент:** `DashboardClient.tsx`

**State:**
- `cats: Cat[]` — все кошки из API
- `searchQuery` (с debounce 400мс)
- `activeFilter: CatStatus` — "В приюте" | "Дома" | "Умерли"
- `isSelectionMode`, `selectedCats: string[]` — режим массового выделения
- `showPatchNotes` — показывать ли патч-ноты (сравнивает версию в localStorage с `CURRENT_APP_VERSION`)

**Computed (useMemo):**
- `filteredCats` — отфильтрованные + отсортированные по дате кошки
- `vaccinationAlerts` — кошки с просроченными/предстоящими прививками

**Функции:**
- `fetchCats()` — GET /api/cats, обновляет state
- `handleStartSelectionMode(catId)` — включает режим выделения, добавляет первый элемент
- `handleDeleteSelected()` — DELETE /api/cats с массивом ID, запрашивает confirm()

**Рендер:**
1. Header: поиск (Input) + кнопка "Создать" (только для canEdit)
2. ShelterStats — сворачиваемая панель статистики
3. RevaccinationAlerts — баннер прививок (только для вкладки "В приюте")
4. Табы статусов с motion.layoutId для анимации активного таба
5. Сетка CatCard через motion.div с staggerChildren 0.08s
6. AnimatePresence для режима выделения (панель снизу с Удалить)

---

### `/dashboard/cat/[id]` — Профиль кошки

**Компонент:** `page.tsx` (клиентский)

**State:**
- `cat: Cat | null` — данные кошки
- `auditLogs: AuditLog[]` — последние 5 изменений
- `currentView: 'profile' | 'gallery'` — активная вкладка
- `swipeDir: 1 | -1` — направление свайп-перехода
- `isGeneratingReport: boolean` — генерация PDF

**Свайп-механизм:**
- Переход между профилем и галереей реализован через `AnimatePresence mode="popLayout"` с 3D-вариантами анимации (уходящая панель уезжает в сторону, уменьшается scale 0.82, поворачивается rotateY 6°, затухает).
- Жест свайпа детектируется **сырыми pointer-событиями** на контейнере (`onPointerDown`/`onPointerUp`), а не через framer-drag (чтобы избежать конфликта с exit-анимацией).
- При определении жеста: dx > 70px и |dx| > |dy| * 1.5 (горизонтальный, не вертикальный скролл).
- Взаимодействия на textarea/input/button/a/label/[contenteditable] **не перехватываются** как свайп.

**PDF экспорт:**
1. `CatReportTemplate` рендерится за экраном (`left: -9999px`).
2. `html2canvas` делает скриншот шаблона с scale:2, useCORS:true.
3. `jsPDF` создаёт A4 PDF, добавляет скриншот.
4. Для каждого документа-изображения добавляется отдельная страница.
5. Скачивается как `"Карта - {name}.pdf"`.

---

### `/adopt/[id]` — Публичная карточка пристройства

**Доступ:** публичный (не в middleware matcher).
**`page.tsx` — серверный компонент:**
- Запрашивает только безопасные поля через Prisma `select`: `{ id, name, avatarUrl, birthYear, arrivalDate, status }`.
- Если `status === 'Умерли'` или кошка не найдена → `notFound()` (404).
- `generateMetadata()` — генерирует OG/Twitter теги: title, description, image.
- Передаёт в `AdoptionCard.tsx`: name, avatarSrc, ageLabel, arrivalLabel, description (авто-текст), adopted (boolean), shareUrl, contact.

**`AdoptionCard.tsx` — клиентский:**
- Кнопка "Поделиться": пытается `navigator.share` (нативный шаринг), fallback — копирует ссылку в буфер.
- `contactHref()` — определяет тип контакта (URL, email, телефон) и формирует нужный href.

---

### Скелетон загрузки профиля кошки

Пока `isLoading: true` — рендерится полная скелетон-структура страницы (шапка с заглушками, аватар, блоки секций). После загрузки подменяется реальным контентом без прыжков layout. Используется компонент `Skeleton.tsx` с CSS классом `.skeleton` и анимацией `shimmer`.

---

## 8. АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ

**Провайдер:** Credentials (email + пароль).
**Стратегия сессии:** JWT (не database sessions).

**Поток входа:**
1. Форма → POST /api/auth/callback/credentials.
2. `authorize()`: ищет юзера по email, сравнивает пароль bcrypt.
3. `jwt` callback: записывает в токен `id`, `role`, `isProfileSetupComplete`, `picture`.
4. `session` callback: переносит из токена в объект сессии.
5. При `trigger === "update"` (после setup-profile): перечитывает юзера из БД, обновляет токен.

**Middleware (`middleware.ts`):**
- Срабатывает на: `/dashboard/*`, `/profile`, `/staff`, `/view-profile/*`, `/setup-profile`.
- Если нет токена → NextAuth редиректит на `/login`.
- Если `isProfileSetupComplete === false` и не на `/setup-profile` → редирект на `/setup-profile`.
- Если профиль завершён и пытается зайти на `/setup-profile` → редирект на `/dashboard`.
- `/adopt/*` **не в матчере** → публичная страница, без авторизации.

**Роли (проверяются в каждом API):**
```
VOLUNTEER        → только чтение (GET запросы)
MEDICAL_STAFF    → чтение + запись (без управления командой)
TRUSTED_PERSON   → чтение + запись (без управления командой)
DEVELOPER        → полный доступ включая создание инвайтов
```

`canEdit = session.user.role !== Role.VOLUNTEER` — формула на клиенте для скрытия кнопок.

---

## 9. PWA И SERVICE WORKER

**manifest.json:**
- `name: "Архив Кошек Мурдом"`, `short_name: "Мурдом"`
- `start_url: "/dashboard"`, `display: "standalone"`
- Иконки 192x192 и 512x512 с `purpose: "any maskable"`
- Скриншоты для store-листинга

**sw.js — стратегии кеширования:**
- При установке кеширует статику: `/`, `/dashboard`, `/login`, `/manifest.json`, `/icons/favicon.ico`.
- **API запросы (`/api/`):** Network First — сначала сеть, при ошибке → кеш.
- **`/_next/static/`:** Cache First — JS/CSS берётся из кеша, сеть только при промахе.
- **Остальное:** Stale While Revalidate — отвечает из кеша, обновляет в фоне.
- Push-уведомления: sw слушает событие `push`, показывает Notification с иконкой и данными из payload.

---

## 10. АНИМАЦИИ (FRAMER MOTION)

**globals.css добавляет:**
```css
.btn-spring {
  transition: transform, box-shadow, background-color, border-color, color;
  transition-duration: 280ms;
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); /* пружина с перелётом */
}

.skeleton {
  background: linear-gradient(90deg, #f1f0ec 0%, #fbe9ee 50%, #f1f0ec 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
```

**Button.tsx:** использует класс `.btn-spring` + `active:scale-95`.

**CatCard.tsx:**
- `cardVariants`: hidden `{y: 24, opacity: 0}` → visible spring (stiffness 320, damping 26).
- `whileHover`: `{y: -6}` при наведении (только не в режиме выделения).
- `whileTap`: `{scale: 0.97}`.
- CSS-transition только для цвета/тени (transform отдан framer).

**DashboardClient.tsx:**
- `containerVariants` с `staggerChildren: 0.08` — карточки появляются каскадом.
- Таб фильтра: `motion.div` с `layoutId="activeFilterTab"` — пилюля анимированно перемещается.

**Свайп-переход профиль↔галерея:**
```javascript
variants = {
  enter:  dir => ({ x: dir > 0 ? '55%' : '-55%', scale: 0.9, opacity: 0 }),
  center: { x: '0%', scale: 1, opacity: 1 },
  exit:   dir => ({ x: dir > 0 ? '-30%' : '30%', scale: 0.82, opacity: 0, rotateY: dir > 0 ? 6 : -6 })
}
// Родитель: perspective: 1600px
// Длительность: 0.5s, ease [0.4, 0, 0.2, 1]
```

**CatTimeline.tsx:** `whileInView` — события появляются fade-up когда скроллятся в видимую область.

---

## 11. АДАПТИВНОСТЬ

Mobile-first на Tailwind CSS. В коде ~120 адаптивных правил.

**Брейкпоинты Tailwind:**
- `sm` (640px+) — планшет/десктоп
- `md` (768px+)
- `lg` (1024px+) — двухколоночный layout профиля кошки
- `xl` (1280px+)

**Примеры адаптации:**
- Кнопка "Создать": `w-12 sm:w-auto` — на мобильном квадратная (только +), на десктопе с текстом.
- Сетка карточек: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- Профиль кошки: `grid-cols-1 lg:grid-cols-12` (4 колонки заметкам + 8 процедурам).
- Панели действий: кнопки-иконки на мобильном, с текстом на `sm`.

**PWA/мобильные:**
- `min-height: 100dvh` (dynamic viewport, без прыжков адресной строки).
- `env(safe-area-inset-bottom)` — отступ под "домашнюю полоску" iPhone.
- `viewportFit: 'cover'` — контент под notch.
- `userScalable: false` — запрет зума (как нативное приложение).

---

## 12. БАЗА ДАННЫХ — ДЕТАЛИ

**СУБД:** SQLite (файловая, `prisma/dev.db`).
**Почему SQLite:** не требует отдельного сервера, достаточно для одного приюта с умеренной нагрузкой, легко бекапится (один файл), Prisma позволяет сменить на PostgreSQL изменением одной строки `provider`.

**Почему Prisma ORM:**
- Типобезопасные запросы (TypeScript типы генерируются из схемы).
- Параметризованные запросы → защита от SQL-инъекций.
- Миграции с историей: 4 файла (init → прививки+push → статусы → фотогалерея).
- `onDelete: Cascade` на зависимых записях, `onDelete: SetNull` для создателя.

**Паттерн синглтона (lib/prisma.ts):** в dev-режиме Next.js пересоздаёт модули при HMR — глобальная переменная предотвращает создание сотен соединений.

**Транзакции используются для:**
- Удаление кошки (auditLogs + cat).
- Смена аватара (снять isAvatar у всех → поставить у нового → обновить cat.avatarUrl).
- Добавление документа (auditLog + document).
- Регистрация (создать user + пометить invitation как used).

---

## 13. РАЗВЁРТЫВАНИЕ

- Запускается через **PM2** на VM/VPS.
- `ecosystem.config.js` — конфиг PM2 (в gitignore).
- Порт SSH 22 заблокирован в некоторых окружениях — push идёт через `ssh.github.com:443`.
- Docker в проекте **не используется**, но добавить `Dockerfile` несложно.

**Команды:**
```bash
npm run dev            # разработка
npm run build          # production сборка
npm run start          # запуск production
npm run prisma:seed    # заполнить БД тестовыми данными
npm run db:setup       # полный сброс + миграции + сид
```

**Тестовые данные (seed):**
- 29 кошек (разные статусы: В приюте, Дома, Умерли), с обработками и документами.
- 4 пользователя: `admin@gmail.com`/`12345` (DEVELOPER), `medical@example.com`/`12345` (MEDICAL_STAFF), `trusted@example.com`/`12345` (TRUSTED_PERSON), `volunteer@example.com`/`12345` (VOLUNTEER).

---

## 14. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

| Переменная | Назначение | Обязательна |
|-----------|-----------|:---:|
| `DATABASE_URL` | Путь к SQLite (`file:./dev.db`) | ✅ |
| `NEXTAUTH_SECRET` | Ключ подписи JWT | ✅ |
| `NEXTAUTH_URL` | Базовый URL (для инвайт-ссылок, NextAuth callbacks) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Базовый URL в клиентском коде (аватары, OG-изображения) | ✅ |
| `VAPID_PUBLIC_KEY` | Публичный ключ Web Push | ⬜ |
| `VAPID_PRIVATE_KEY` | Приватный ключ Web Push | ⬜ |
| `VAPID_SUBJECT` | Email/URL для VAPID (`mailto:...`) | ⬜ |
| `NEXT_PUBLIC_SHELTER_CONTACT` | Контакт приюта на публичной карточке пристройства | ⬜ |

---

## 15. ПОЛНЫЙ СПРАВОЧНИК ФУНКЦИЙ

### lib/utils.ts

#### `stringToColor(str: string): string`
Генерирует детерминированный HEX-цвет из строки. Алгоритм: проходит по каждому символу, применяет побитовый сдвиг `hash = charCode + ((hash << 5) - hash)`, затем извлекает три байта (RGB) и форматирует как hex. Одно и то же имя всегда даёт один и тот же цвет.

#### `generateAvatar(name: string): string`
Создаёт SVG-аватарку на лету и возвращает её как Data URL (`data:image/svg+xml;base64,...`).
- Берёт первую букву имени в верхнем регистре.
- Вызывает `stringToColor(name)` для фона.
- Вычисляет яркость фона по формуле `(R*299 + G*587 + B*114) / 1000` — если > 125, текст чёрный, иначе белый (контраст).
- Генерирует SVG 100×100 с `<rect>` и `<text>`, кодирует в base64 через `Buffer.from(svg).toString('base64')`.
- Используется в `POST /api/cats` когда avatarUrl не передан.

---

### lib/revaccinationHelper.ts

#### `checkAndCreateInfo(dueDate: Date, messagePrefix: string): RevaccinationInfo` (внутренняя)
Принимает расчётную дату прививки и префикс сообщения.
- Сравнивает дату с сегодня через `startOfDay`.
- `isOverdue = isPast(dueDate) && !isToday(dueDate)`.
- `daysUntil = differenceInDays(dueDate, today)`.
- Возвращает `RevaccinationInfo` с status `'overdue'` или `'upcoming'` если `daysUntil <= 7`, иначе `{ status: null }`.

#### `getRevaccinationStatus(cat: Cat): RevaccinationInfo`
Главная бизнес-функция напоминаний. Полный алгоритм:
1. Если `cat.status !== 'В приюте'` → `{ status: null }` (Дома и Умерли не проверяем).
2. Фильтрует treatments по `type === VACCINATION` и наличию `vaccinationStage`, сортирует по дате.
3. Ищет будущие (запланированные) прививки. Если есть в пределах 7 дней → `'upcoming'` с текстом по этапу.
4. Из прошлых прививок берёт: `first`, `second`, `lastAnnual` (`revaccination`).
5. Приоритеты расчёта следующей даты:
   - Есть `lastAnnual` → следующая через **1 год** от неё.
   - Есть `first` но нет `second` → ревакцинация через **28 дней** от первой.
   - Есть `first` и `second` → ежегодная через **1 год** от первой.
6. Передаёт дату в `checkAndCreateInfo`. Если в пределах 7 дней или просрочено → возвращает статус, иначе null.

---

### lib/calendarHelper.ts

#### `generateVaccinationEvents(cats: Cat[]): CalendarEvent[]`
Генерирует события для календаря прививок. Принимает все кошки, фильтрует только `'В приюте'`.

Для каждой кошки делает два прохода:

**Проход 1 — реальные события:**
Перебирает все прошлые прививки, для каждой создаёт `CalendarEvent` с `isProjected: false`. Этап `'revaccination'` переименовывается в `'annual'`.

**Проход 2 — прогнозируемые события:**
Логика расчёта следующей даты идентична `getRevaccinationStatus`, но порог для `isUpcoming` = **30 дней** (а не 7). `canConfirmVaccination = isOverdue || isUpcoming` — показывает галочку подтверждения.
Проверяет `hasMatchingRealEvent` — если уже есть реальное событие на эту дату, прогноз не создаётся.

Возвращает плоский массив всех событий для всех кошек.

---

### hooks/useLongPress.ts

#### `useLongPress(onLongPress, onClick, { delay, isPreventDefault })`
Возвращает объект с обработчиками: `{ onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd, onMouseMove, onTouchMove }`.

**Внутренний state:**
- `longPressTriggered` — был ли уже вызван long-press колбэк.
- `timeout` ref — ссылка на `setTimeout`.
- `target` ref — ссылка на DOM-элемент (для `touchend` listener).
- `startCoord` ref — координаты начала касания.

**`start(event)`** (вызывается при mousedown/touchstart):
- Сохраняет начальные координаты в `startCoord`.
- Если `isPreventDefault` — вешает `touchend` listener с `preventDefault`.
- Запускает `setTimeout` на `delay` мс. При срабатывании: `navigator.vibrate(50)`, `onLongPress(event)`, `longPressTriggered = true`.

**`move(event)`** (вызывается при mousemove/touchmove):
- Если сдвиг от начала > 10px по X или Y → `clearTimeout`, `startCoord = null` (помечает как скролл).

**`clear(event, shouldTriggerClick)`** (вызывается при mouseup/touchend):
- Очищает таймаут.
- Если `startCoord === null` — это был скролл, клик не вызывается.
- Если не long-press и не скролл → вызывает `onClick`.
- Сбрасывает `longPressTriggered` и `startCoord`.

---

### app/dashboard/DashboardClient.tsx

#### `fetchCats()` (useCallback)
`GET /api/cats` → обновляет `cats` state. Устанавливает `isDataLoading = false` в finally.

#### `filteredCats` (useMemo)
Цепочка трансформаций:
1. Копирует и сортирует по `createdAt DESC`.
2. Если есть `debouncedSearchQuery` — фильтрует по `cat.name.toLowerCase().includes(...)`.
3. Фильтрует по `cat.status === activeFilter`.

#### `vaccinationAlerts` (useMemo)
Маппирует все кошки через `getRevaccinationStatus`. Возвращает только те, у которых `alert.status !== null`. Тип: `{ cat: Cat; alert: RevaccinationInfo }[]`.

#### `handleStartSelectionMode(catId: string)`
Ставит `isSelectionMode = true`, кладёт `catId` в `selectedCats`. Вызывается из CatCard по long-press.

#### `handleToggleSelection(catId: string)`
Если ID уже в `selectedCats` — убирает. Если нет — добавляет. useEffect следит: если `isSelectionMode && selectedCats.length === 0` → выключает режим.

#### `handleCancelSelection()`
Сбрасывает `isSelectionMode = false`, очищает `selectedCats`.

#### `handleDeleteSelected()`
Показывает `confirm()`. При согласии: `DELETE /api/cats` с массивом `{ ids: selectedCats }`, затем `fetchCats()`, `handleCancelSelection()`.

---

### app/dashboard/ShelterStats.tsx

#### `toggle()`
Инвертирует `collapsed`. Сохраняет `'1'` или `'0'` в `localStorage['statsPanelCollapsed']`.

#### `useEffect` (mount)
Читает `localStorage['statsPanelCollapsed']` — если `'1'`, устанавливает `collapsed = true`. Инициализация только при монтировании.

#### Вычисления (прямо в теле компонента):
- `total`, `inShelter`, `atHome`, `rainbow` — фильтрация `cats` по статусам.
- `attention = alerts.length`, `overdue = alerts.filter(isOverdue)`, `upcoming = attention - overdue`.
- `pct(n) = total > 0 ? (n / total) * 100 : 0` — процент для ширины сегмента полоски.
- `segments` — массив `{ label, value, color }` без нулевых значений (`.filter(s => s.value > 0)`).

#### `CountUp({ value })` (внутренний компонент)
Использует Framer Motion `animate(0, value, { duration: 0.9, ease: 'easeOut', onUpdate })` — плавно меняет `display` state от 0 до value при монтировании. `Math.round(v)` чтобы не было дробей.

---

### app/dashboard/cat/[id]/page.tsx (CatProfilePage)

#### `fetchCatDataAndLogs()`
Параллельно (через `Promise.all`) запрашивает:
- `GET /api/cats/{id}` — данные кошки с treatments, documents, creator.
- `GET /api/cats/{id}/audit` — последние 5 записей аудита.
При ошибке 404/500 — редирект на `/dashboard`.

#### `goToView(view: 'profile' | 'gallery')`
Если `view === currentView` — ничего не делает (защита от лишних ре-рендеров).
Устанавливает `swipeDir`: 1 если к галерее, -1 если к профилю.
Устанавливает `currentView`.

#### `onSwipePointerDown(e: ReactPointerEvent)`
Если event начался на `textarea, input, select, button, a, label, [contenteditable], [data-no-swipe]` (через `el.closest()`) → `swipeStart = null`, выходит.
Иначе записывает `{ x: e.clientX, y: e.clientY }` в `swipeStart` ref.

#### `onSwipePointerUp(e: ReactPointerEvent)`
Если `swipeStart === null` — выходит.
Вычисляет `dx = clientX - startX`, `dy = clientY - startY`.
Сбрасывает `swipeStart = null`.
Если `Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5` (горизонтальный жест):
- `dx < 0` → `goToView('gallery')`.
- `dx > 0` → `goToView('profile')`.

#### `handleExportReport()`
1. `html2canvas(reportRef.current, { scale: 2, useCORS: true })` → canvas.
2. `canvas.toDataURL('image/png')` → imgData.
3. `new jsPDF('p', 'mm', 'a4')` — книжный A4.
4. Первая страница: `addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')`.
5. Для каждого документа с `fileType.startsWith('image/')`:
   - Создаёт `new Image()`, `img.crossOrigin = 'anonymous'`, загружает через промис.
   - Вычисляет размеры: сохраняет aspect-ratio, вписывает в `pdfWidth - 30` × `pdfHeight - 40`.
   - Центрирует на странице (`x = (pdfWidth - newWidth) / 2`).
   - `pdf.addPage()`, `pdf.addImage(img, 'JPEG', x, 30, ...)`.
6. `pdf.save('Карта - {cat.name}.pdf')`.

---

### app/dashboard/cat/[id]/CatProfileHeader.tsx

#### `pluralizeYears(age: number): string`
Русское склонение числительного «год»:
- `age % 10 === 1 && age % 100 !== 11` → «год».
- `[2,3,4].includes(age % 10) && ![12,13,14].includes(age % 100)` → «года».
- Иначе → «лет».

#### `getAge(birthYear: number | null): string | null`
`new Date().getFullYear() - birthYear` → форматирует с `pluralizeYears`.

#### `handleShare()`
1. Формирует URL: `${window.location.origin}/adopt/${cat.id}`.
2. Пытается `navigator.share({ title, text, url })` (нативный шаринг на мобильном).
3. Fallback: `navigator.clipboard.writeText(url)` → `shareCopied = true` на 2 секунды.
4. Не работает для кошек со статусом `'Умерли'` (`canShare = cat.status !== 'Умерли'`).

---

### app/dashboard/cat/[id]/CatProfileView.tsx

#### `handleDocFilesChange(e)`
Конвертирует `FileList` в массив `DocUploadState[]`: каждому файлу присваивает `customName` (имя без расширения) и уникальный `id = Date.now() + index`.

#### `handleSingleDocNameChange(id, newName)`
Иммутабельно обновляет поле `customName` у конкретного файла в `docFilesToUpload`.

#### `handleNotesUpdate(data: Partial<Cat>)`
`PATCH /api/cats/{id}` с произвольными полями. Вызывает `onDataChange()`.

#### `handleDeleteCat()`
`confirm()` → `DELETE /api/cats/{id}` → `alert()` → `router.push('/dashboard')`.

#### `handleDeleteTreatment(treatmentId)`
`confirm()` → `DELETE /api/cats/{id}/treatments?treatmentId={id}` → `onDataChange()`.

#### `handleAddTreatment(e: FormEvent)`
Берёт поля из `treatmentForm`. Поле `vaccinationStage` отправляет только если `type === VACCINATION`.
`POST /api/cats/{id}/treatments` → закрывает модалку → `onDataChange()`.

#### `handleDeleteSingleDocument(docId)`
`confirm()` → `DELETE /api/cats/{id}/documents?documentId={id}` → закрывает `DocumentViewerModal` → `onDataChange()`.

#### `handleAddDocument(e: FormEvent)`
Параллельно (`Promise.all`) для каждого файла:
1. `FormData` → `POST /api/upload` → получает `{ filePath }`.
2. `POST /api/cats/{id}/documents` с `{ fileName: customName, filePath, fileType }`.
При любой ошибке — `alert`. В finally: закрывает модалку, сбрасывает `docFilesToUpload`, вызывает `onDataChange()`.

#### `handleScanComplete(scannedFile: File)`
Принимает файл от ScanDocumentModal, формирует `DocUploadState` с именем `"Скан от {дата}"`, кладёт в `docFilesToUpload` и открывает `isAddDocModalOpen`.

---

### app/dashboard/cat/[id]/PhotoGallery.tsx

#### `fetchPhotos()` (useCallback, async)
`GET /api/cats/{id}/photos` → обновляет `photos` state. Устанавливает `isLoading`.

#### `handleFileChange(e: ChangeEvent<HTMLInputElement>)`
Параллельно загружает все выбранные файлы:
1. Для каждого файла: `FormData` → `POST /api/upload` → получает `{ filePath }`.
2. `Promise.all(uploadPromises)` → собирает `filePaths`.
3. `POST /api/cats/{id}/photos` с `{ filePaths }`.
4. `fetchPhotos()`, `onDataChange()`.

#### `handleSetAvatar(photoId: string)`
`PATCH /api/cats/{id}/photos/{photoId}` → `fetchPhotos()` → `onDataChange()` → закрывает лайтбокс.

#### `handleDelete(photoIds: string[])`
`confirm()` → `DELETE /api/cats/{id}/photos` с `{ ids }`. Если ответ не ok — показывает ошибку из `{ error }`. Сбрасывает выделение → `fetchPhotos()`.

#### `handleDownload(filePath: string)`
Создаёт `<a href="{appUrl}{filePath}" download="{filename}">`, добавляет в DOM, кликает, удаляет.

#### `handleDownloadSelected()`
Для каждого выбранного фото вызывает `handleDownload` с задержкой `index * 300мс` (браузеры блокируют множественные скачивания без паузы).

#### `handleStartSelection(photoId)` / `handleToggleSelection(photoId)`
Аналог из DashboardClient: включает режим, переключает выбор. useEffect: если `isSelectionMode && selectedPhotos.length === 0` → выключает режим.

---

### app/dashboard/cat/[id]/CatTimeline.tsx

#### `vaccineBadge(stage?: string | null): string | null`
`'first'` → `'1 этап'`, `'second'` → `'2 этап'`, `'revaccination'` → `'Ежегодно'`, иначе `null`.

#### `useEffect` (fetch photos)
При монтировании запрашивает `GET /api/cats/{id}/photos`, сохраняет только даты `createdAt`. Использует флаг `cancelled` для защиты от race condition (если компонент размонтирован до ответа).

#### `events` (useMemo)
Собирает единую ленту событий из трёх источников:
- **Обработки**: из `cat.treatments`, визуальный стиль из `treatmentVisual`, бейдж через `vaccineBadge`.
- **Документы**: из `cat.documents`, дата = `createdAt`.
- **Фото**: из `photoDates` — группирует по дням через `Map<'yyyy-MM-dd', { date, count }>`. Каждый уникальный день = одно событие "Добавлено N фото".
- **Прибытие**: из `cat.arrivalDate`, всегда последнее (самое старое).
Сортирует всё `DESC` (новые сверху). Возвращает `TimelineEvent[]`.

---

### app/adopt/[id]/page.tsx (серверные функции)

#### `getPublicCat(id: string)`
`prisma.cat.findUnique` с `select: { id, name, avatarUrl, birthYear, arrivalDate, status }` — **только безопасные поля**, без notes/documents/creator/медкарты. В try/catch, возвращает null при ошибке.

#### `pluralizeYears(age: number)` / `getAgeLabel(birthYear)`
Склонение + расчёт возраста (аналог из CatProfileHeader).

#### `absoluteAvatar(avatarUrl, name): string`
- Если `avatarUrl` начинается с `data:` или `http` — возвращает как есть.
- Если относительный путь — добавляет `NEXT_PUBLIC_APP_URL`.
- Если null — возвращает placehold.co URL с первой буквой имени.

#### `buildDescription(name, ageLabel, adopted): string`
- `adopted: true` → "X нашёл(ла) свой дом и любящую семью."
- `adopted: false` → "X (возраст) ищет любящую семью и заботливого хозяина. Этот котик ждёт свой дом — поделитесь карточкой, чтобы помочь."

#### `generateMetadata({ params }): Promise<Metadata>` (Next.js)
Вызывает `getPublicCat`. Если кошка не найдена или `'Умерли'` → `{ title: 'Котик не найден' }`.
Иначе формирует: `title`, `description`, `openGraph: { title, description, images: [absoluteAvatar], type: 'website' }`, `twitter: { card: 'summary_large_image', ... }`.

---

### app/adopt/[id]/AdoptionCard.tsx

#### `contactHref(contact: string): string`
Определяет тип контакта:
- `/^https?:\/\//i` → возвращает как есть.
- `/^[^@\s]+@[^@\s]+\.[^@\s]+$/` → `mailto:{contact}`.
- `/^[+\d][\d\s()-]{5,}$/` → `tel:{contact}` (убирает пробелы).
- Иначе → возвращает строку как есть.

#### `handleShare()`
1. Формирует `{ title, text, url: shareUrl }`.
2. Пытается `navigator.share(data)`.
3. Fallback: `navigator.clipboard.writeText(shareUrl)` → `copied = true` на 2 секунды (кнопка показывает "Ссылка скопирована" + чек-иконку).

---

### app/api/push/notify/route.ts (серверные функции)

#### `toAppCat(catFromDb: any): Cat`
Конвертирует Prisma-объект (с `Date` полями) в клиентский тип `Cat` (с ISO-строками): `arrivalDate.toISOString()`, `createdAt.toISOString()`, маппинг treatments аналогично. Нужно потому что `getRevaccinationStatus` принимает клиентский тип, а не Prisma-тип.

#### `sendPayloadToSubscriptions(subscriptions, payload): Promise<number>`
Перебирает подписки, для каждой вызывает `webPush.sendNotification(subscriptionObject, payload)`.
При ошибке 410/404 (подписка истекла) — удаляет её из БД через `prisma.pushSubscription.delete`.
Возвращает количество успешно отправленных.

#### `findAndSendNotifications(): Promise<number>`
1. Загружает все кошки с treatments и creator.
2. Маппирует через `toAppCat`.
3. Для каждой кошки вызывает `getRevaccinationStatus`. Если status !== null — группирует по `creatorId`.
4. Для каждого пользователя с алертами: загружает его подписки, группирует алерты по тексту сообщения, отправляет по одному уведомлению на группу (`sendPayloadToSubscriptions`).
Payload: `{ title: 'Напоминание о вакцинации!', body: '{message}: {catNames}.', icon, data: { url: '/dashboard' } }`.

#### `GET /api/push/notify`
Входная точка (вызывается по крону или вручную). Вызывает `findAndSendNotifications()`, возвращает количество отправленных.

---

### app/api/push/broadcast/route.ts

#### `POST /api/push/broadcast`
Только для `DEVELOPER`.
Принимает `{ title, message }` из тела.
Загружает ВСЕ подписки из БД.
Отправляет параллельно (`Promise.all`) через `webPush.sendNotification`.
При 410/404 — удаляет недействительную подписку.

---

### app/api/staff/[id]/route.ts (иерархия ролей)

#### `roleHierarchy: Record<Role, number>`
```
DEVELOPER: 0, MEDICAL_STAFF: 1, TRUSTED_PERSON: 2, VOLUNTEER: 3
```
Чем меньше число — тем выше ранг. Используется для проверки прав.

#### `PATCH /api/staff/[id]` (смена роли)
Запрещает менять свою роль (`session.user.id === targetUserId` → 403).
Загружает targetUser. Если `currentUserRank >= roleHierarchy[targetUser.role]` → 403 (нельзя менять роль равного или вышестоящего). При успехе обновляет роль.

#### `DELETE /api/staff/[id]` (удаление пользователя)
Запрещает удалять себя. Проверяет иерархию.
В транзакции:
1. `cat.updateMany({ creatorId: null })` — открепляет кошек (не удаляет).
2. `message.deleteMany` — удаляет сообщения.
3. `auditLog.deleteMany` — удаляет логи.
4. `user.delete` — удаляет пользователя.

---

### app/api/setup-profile/route.ts

#### `POST /api/setup-profile`
Принимает multipart FormData: `name` (обязательное), `file` (опциональный аватар).
Устанавливает `isProfileSetupComplete: true` — после этого middleware перестаёт редиректить на `/setup-profile`.
Аватар: sharp → 512×512 WebP 80% (в отличие от `api/profile` который делает JPEG — исторически setup использовал WebP).

---

### app/api/cats/[id]/route.ts

#### `createChangeDescription(currentCat, body): string` (внутренняя)
Сравнивает поля `name`, `birthYear`, `status`, `arrivalDate`, `notes`, `newAvatarPath` между текущим и новым значением.
Собирает массив изменённых полей на русском, возвращает строку `"изменил(а): поле1, поле2"`. Пустая строка если ничего не изменилось (AuditLog не создаётся).

---

## 16. ИЗВЕСТНЫЕ ОСОБЕННОСТИ

1. **Консольные предупреждения в dev-режиме:**
   - Hydration mismatch на компоненте приветствия по времени суток (сервер рендерит «Доброй ночи», клиент «Добрый день»). Не влияет на функциональность.
   - Ref-warning от `AnimatePresence mode="popLayout"` (framer-motion). Функционально работает.
   - Оба некритичны и не появляются в production.

2. **Файлы `:Zone.Identifier` в git:** В репозиторий случайно попали Windows NTFS ADS файлы с недопустимым символом `:`. Они не влияют на работу приложения, но ломают стандартный `git reset` без `core.protectNTFS=false`.

3. **Long-press на мобильных:** useLongPress хук слушает как touch, так и mouse события (для десктопной совместимости). Haptic feedback (вибрация 50мс) при срабатывании long-press.

4. **Свайп и выделение текста:** pointer-события свайпа не перехватываются если начинаются на textarea/input/button и других интерактивных элементах.

5. **CUID идентификаторы:** все ID генерируются как CUID (compact unique identifier) — неугадываемые в отличие от автоинкремента, что важно для публичных URL (/adopt/[id]).
