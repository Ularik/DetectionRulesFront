# Техническая спецификация: Detection Rules (frontend)

> Это главный технический документ проекта. На него ссылаются при разработке, ревью и рефакторинге.
> Целевая архитектура — **Feature-Sliced Design (FSD)**. Раздел 4 описывает целевое состояние,
> раздел 8 — план миграции с текущей структуры.

---

## 1. О проекте

Веб-панель управления SIEM-подобной системой обнаружения угроз. Через неё работают с правилами обнаружения,
корреляции и подавления, с IoC, инцидентами, сценариями атак, сырыми событиями Wazuh, организациями (агентами),
аудитом изменений и справочником MITRE ATT&CK.

- Это **только frontend**. Backend — отдельный REST API (`/api/...`), в docker-compose он доступен как `backend:8000`.
- Язык интерфейса — **русский**.
- Роли пользователей: `ADMIN`, `ANALYST`, `VIEWER`. Сейчас реализован только кабинет `ADMIN`.

## 2. Технологический стек

| Область         | Технология                                                                         |
| --------------- | ---------------------------------------------------------------------------------- |
| Фреймворк       | **Next.js 16** (App Router, `output: "standalone"`)                                |
| UI              | React 19.2, Tailwind CSS 4, shadcn/ui (style `radix-nova`) на `radix-ui`, `lucide-react` |
| Серверное состояние | TanStack Query v5 (+ Devtools)                                                 |
| HTTP            | axios (cookie-аутентификация, `withCredentials: true`)                             |
| Формы           | react-hook-form                                                                    |
| Уведомления     | sonner                                                                             |
| Утилиты стилей  | `clsx` + `tailwind-merge` (`cn`), `class-variance-authority`                        |
| Шрифты          | `next/font/google`: Montserrat (latin + cyrillic), Geist                           |
| Линт            | ESLint 9 (flat config, `eslint-config-next`)                                       |
| Тесты           | не настроены                                                                       |

> ⚠️ Next.js 16 отличается от предыдущих версий. Перед использованием API Next.js сверяйтесь с
> `node_modules/next/dist/docs/`. Например, **Middleware теперь называется Proxy** (`proxy.ts`).

### Команды

```bash
npm run dev     # dev-сервер, backend ожидается на http://localhost:8001/api
npm run build   # production-сборка (standalone)
npm run start   # запуск production-сборки
npm run lint    # ESLint
```

Docker: многоэтапный `Dockerfile` (node:20-alpine). Образ запускает `node server.js` на порту 3000 от пользователя `nextjs`.

## 3. Окружение и конфигурация

Базовый URL API (`apiURL`) выбирается во время выполнения:

| Условие                               | `apiURL`                     |
| ------------------------------------- | ---------------------------- |
| `NODE_ENV === "development"`          | `http://localhost:8001/api`  |
| production, код выполняется на сервере | `http://backend:8000/api`    |
| production, код выполняется в браузере | `/api` (reverse-proxy на том же домене) |

Переменные окружения:

| Переменная                 | Где используется                                          | Статус                    |
| -------------------------- | --------------------------------------------------------- | ------------------------- |
| `NODE_ENV`                 | выбор `apiURL`                                            | используется              |
| `NEXT_BACK_URL`            | `app/layout.tsx`, иконка `${NEXT_BACK_URL}/logo/logo.png` | **не задана в `.env`**    |
| `NEXT_API_URL`, `NEXT_IMAGE_URL` | `.env`                                              | в коде не используются    |
| `NEXT_PUBLIC_BACK_API_URL` | build-arg в `Dockerfile`                                  | в коде не используется    |

---

## 4. Целевая архитектура: Feature-Sliced Design

### 4.1. Слои

Слои перечислены сверху вниз. **Модуль может импортировать только из слоёв ниже себя.**

```
app       → глобальная инициализация: провайдеры, стили, guard'ы, layout'ы
views     → страницы (слой FSD "pages", переименован, см. 4.2)
widgets   → крупные самостоятельные блоки UI (таблица инцидентов, сайдбар)
features  → пользовательские действия, несущие ценность (смена статуса, создание правила)
entities  → бизнес-сущности: типы, API, query-хуки, базовый UI сущности
shared    → переиспользуемый код без бизнес-логики: ui-kit, api-клиент, config, lib
```

Правила:

1. **Импорт только вниз.** `features` не импортирует из `widgets`, `entities` не импортирует из `features`.
2. **Слайсы одного слоя не импортируют друг друга.** `features/rule-delete` не знает о `features/rule-toggle`.
   Если сущности ссылаются друг на друга по типам (инцидент → события), используйте **cross-import через `@x`**:
   `entities/event/@x/incident.ts` экспортирует то, что нужно `entities/incident`.
3. **Public API.** У каждого слайса есть `index.ts`. Снаружи импортируется только он:
   `import { RuleCard, useRules } from "@/entities/rule"`. Глубокие импорты (`@/entities/rule/ui/RuleCard`) запрещены.
4. `shared` и `app` делятся только на сегменты, слайсов в них нет.

### 4.2. Совместимость с Next.js App Router

У Next.js и FSD есть два конфликта имён: папка `app` (роутинг и слой FSD) и `pages` (Pages Router и слой FSD).
Решение:

- **Корневая `app/`** — только роутинг Next.js: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`,
  route groups. Файлы тонкие: они импортируют view и рендерят его. Бизнес-логики и разметки в них нет.
- **`src/`** содержит слои FSD. По документации Next.js `src/app` **игнорируется роутером**, если есть корневой `app/`,
  поэтому `src/app` безопасно использовать как слой FSD.
- Слой FSD `pages` называется **`views`**. Так `src/pages` не путается с Pages Router, и не нужна пустая папка `pages/` в корне.
- Server-side защита маршрутов (если понадобится) — в корневом `proxy.ts` (Next 16), логика — в `src/app/proxy/`.

```tsx
// app/(dashboard)/admin/rules/page.tsx — эталонный тонкий route-файл
import { RulesPage } from "@/views/rules";

export default function Page() {
  return <RulesPage />;
}
```

Для динамических сегментов route-файл передаёт параметры во view.
В Next 16 `params` — это Promise (см. `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`).

### 4.3. Сегменты внутри слайса

| Сегмент   | Содержимое                                                                 |
| --------- | -------------------------------------------------------------------------- |
| `ui/`     | React-компоненты                                                           |
| `api/`    | request-функции (axios), query-хуки TanStack Query, фабрика query-ключей   |
| `model/`  | типы, схемы форм, константы домена, локальное состояние/хуки               |
| `lib/`    | чистые функции-хелперы слайса (форматтеры, маппинг)                        |
| `config/` | статическая конфигурация слайса (колонки таблицы, пункты меню)             |

Сегменты именуются по назначению (`api`, `model`), а не по типу файла (`hooks`, `types`, `components`).

### 4.4. Целевая структура каталогов

```
/
├─ app/                          # ТОЛЬКО роутинг Next.js (тонкие файлы)
│  ├─ layout.tsx                 # → @/app/layouts/RootLayout, providers
│  ├─ globals.css → перенести в src/app/styles (импорт из layout)
│  ├─ (auth)/login/page.tsx      # → @/views/login
│  ├─ (auth)/auth/page.tsx       # → @/views/register
│  └─ (dashboard)/
│     ├─ layout.tsx              # → @/app/layouts/DashboardLayout
│     └─ admin/...               # → @/views/*
├─ proxy.ts                      # (опционально) server-side проверки
└─ src/
   ├─ app/
   │  ├─ providers/              # QueryProvider, Toaster
   │  ├─ guards/                 # RoleGuard (бывший middleware/ProtectedLayout)
   │  ├─ layouts/                # DashboardLayout (Sidebar + guard + main)
   │  └─ styles/globals.css
   ├─ views/
   │  ├─ login/  register/
   │  ├─ organizations/  organization-detail/  organization-edit/  organization-create/
   │  ├─ rules/  rule-detail/  rule-create/
   │  ├─ correlation-rules/  correlation-rule-detail/  correlation-rule-create/
   │  ├─ suppression-rules/  suppression-rule-detail/  suppression-rule-edit/  suppression-rule-create/
   │  ├─ ioc/  ioc-detail/  ioc-create/
   │  ├─ incidents/  incident-detail/
   │  ├─ scenarios/  scenario-detail/
   │  ├─ events/  event-detail/
   │  ├─ audit/  audit-detail/
   │  ├─ mitre/
   │  ├─ analyst-home/  viewer-home/
   ├─ widgets/
   │  ├─ sidebar/                # config/menu.ts (бывш. dashboardMenuItems)
   │  ├─ hunters-tabs/           # навигация Инциденты / Сценарии / События
   │  ├─ incidents-table/  incident-details/
   │  ├─ scenarios-list/  scenario-details/
   │  ├─ events-table/  event-details/
   │  ├─ rules-list/  rule-details/
   │  ├─ correlation-rules-list/  correlation-rule-details/
   │  ├─ suppression-rules-list/  suppression-rule-details/
   │  ├─ ioc-table/  audit-table/  organizations-list/
   │  └─ mitre-techniques/
   ├─ features/
   │  ├─ auth-login/  auth-logout/  auth-register/
   │  ├─ rule-upsert/  rule-delete/  rule-toggle-status/  rules-filter/
   │  ├─ correlation-rule-upsert/
   │  ├─ suppression-rule-upsert/
   │  ├─ ioc-create/  ioc-edit/
   │  ├─ incident-change-status/  incidents-filter/
   │  ├─ scenarios-filter/  events-filter/
   │  ├─ organization-upsert/  organization-delete/
   │  └─ mitre-sync/
   ├─ entities/
   │  ├─ user/  rule/  correlation-rule/  suppression-rule/  ioc/
   │  ├─ incident/  scenario/  event/  organization/  audit/
   │  ├─ mitre-technique/  attack-type/
   └─ shared/
      ├─ api/                    # axios-инстанс + interceptor 401, общие типы ответов
      ├─ config/                 # env, apiURL, routes, roleDashboardPaths
      ├─ ui/                     # shadcn-компоненты, Pagination, FieldError, SectionTitle, ArrayField
      └─ lib/                    # cn(), форматирование дат, хелперы
```

### 4.5. Шаблон слайса сущности

```
entities/rule/
├─ api/
│  ├─ ruleApi.ts        # fetchRules, fetchOneRule, fetchSeverityHints
│  ├─ queryKeys.ts      # ruleKeys — единый источник query-ключей
│  └─ queries.ts        # useRules, useRule, useSeverityHints
├─ model/types.ts       # RuleType, RuleApiResponse, QueryFiltersType
├─ ui/RuleCard.tsx
└─ index.ts             # public API
```

Фабрика query-ключей обязательна для каждой сущности. Features инвалидируют кэш только через неё:

```ts
export const ruleKeys = {
  all: ["rules"] as const,
  lists: () => [...ruleKeys.all, "list"] as const,
  list: (filters: QueryFiltersType) => [...ruleKeys.lists(), filters] as const,
  detail: (id: string) => [...ruleKeys.all, "detail", id] as const,
};
```

Мутации (create/update/delete/patch) живут в **features**. Сущность отдаёт request-функции и `*Keys`,
feature оборачивает их в `useMutation` и инвалидирует `entityKeys.all` / `entityKeys.detail(id)`.

### 4.6. Server и Client Components

- Route-файлы в `app/` по возможности остаются серверными компонентами. Директиву `"use client"` ставят во view, widget или feature, которым нужны хуки.
- Сейчас все данные загружаются на клиенте через TanStack Query. Перенос загрузки на сервер — отдельное решение, в рамках миграции на FSD его не делаем.

### 4.7. Алиасы

Целевой `tsconfig.json`: `"@/*": ["./src/*"]`.

**Сейчас (переходный период)** действуют алиасы на каждый слой: `@/app/*`, `@/views/*`, `@/widgets/*`, `@/features/*`,
`@/entities/*`, `@/shared/*` → `./src/<слой>/*`, а `@/*` → `./*` для ещё не перенесённых папок (`components/`, `services/`, `types/`).
TypeScript выбирает самый специфичный паттерн. Когда старых папок не останется, все алиасы заменяются одним `"@/*": ["./src/*"]`.

Импорты: `@/shared/ui`, `@/entities/rule`, `@/features/rule-delete`, `@/widgets/sidebar`, `@/views/rules`, `@/app/providers`.

`components.json` (shadcn) нужно перенастроить, чтобы `npx shadcn add` клал компоненты в shared:

```json
"aliases": {
  "components": "@/shared/ui",
  "ui": "@/shared/ui",
  "utils": "@/shared/lib/utils",
  "lib": "@/shared/lib",
  "hooks": "@/shared/lib/hooks"
}
```

и `"tailwind.css": "src/app/styles/globals.css"`.

Для автоматической проверки правил FSD рекомендуется линтер **Steiger** (`@feature-sliced/steiger`).

---

## 5. Доменная модель и API

Во всех путях ниже префикс — `apiURL`. Ответ 401 обрабатывается централизованно (раздел 6).

### 5.1. Сущности

| Entity (FSD)        | Текущие файлы                       | Ключевые типы                                                 | Пагинация        |
| ------------------- | ----------------------------------- | ------------------------------------------------------------- | ---------------- |
| `user`              | `services/users`, `types/users.ts`  | `UserType`, `UserRole`, `UserLoginType`, `UsersAuthType`      | —                |
| `rule`              | `services/rules`, `services/severities`, `lib/hooks/severities.ts` | `RuleType`, `RuleCreateUpdateType`, `QueryFiltersType` | `limit/offset` → `{total, has_next, items}` |
| `correlation-rule`  | `services/crule`, `services/autoFields` | `CorrelationRuleType`, `SequenceValueType`, `CorrelationGroupByFieldsType` | нет (массив) |
| `suppression-rule`  | `services/supers`                   | `SuppressionRuleTypes`, `MatchFieldResponseType`              | нет (массив)     |
| `ioc`               | `services/ioc`                      | `IocType`, `IocCreateType`, `IocPatchType`                    | `page/size` → `{items,total,page,size,pages,has_next,has_previous}` |
| `incident`          | `services/incident`, `types/incidentEvents.ts` | `IncidentSchema`, `IncidentLite`, `IncidentParams`, `ANALYST_STATUS` | `page/size` |
| `scenario`          | `services/scenarios`                | `SecurityScenario`, `ScenarioAggregateSchema`, `ScenarioQueryParams` | `page/size` |
| `event`             | `services/events`                   | `WazuhEvent`, `WazuhEventApiResponse`, `RawEventsQueryParamsSchema` | да |
| `organization`      | `services/organizations`            | `Organization`, `AgentType`, `OrganizationCreateUpdateType`   | нет              |
| `audit`             | `services/audits`                   | `AuditType`, `AuditDetailType` (содержит `rule: RuleType`)     | да               |
| `mitre-technique`   | `services/mitre`, `types/mitre.ts`  | `MitreTechnique`, `MitreSyncResponse`, `MitreType`            | нет (массив)     |
| `attack-type`       | `services/attackTypes`              | `AttackTypes`                                                 | —                |

Связи между сущностями (оформляются через `@x`):
`audit → rule, user`; `scenario → incident, event, ioc, mitre-technique`; `incident → event, mitre-technique`.

### 5.2. Эндпоинты

| Метод  | Путь                                           | Назначение                                | Слайс-владелец (цель) |
| ------ | ---------------------------------------------- | ----------------------------------------- | --------------------- |
| GET    | `/users/me`                                    | текущий пользователь                      | entities/user         |
| POST   | `/users/login`                                 | вход; пустое тело — обновление сессии     | features/auth-login, shared/api |
| DELETE | `/users/logout`                                | выход                                     | features/auth-logout  |
| POST   | `/users/`                                      | регистрация                               | features/auth-register |
| GET    | `rules/`                                       | список правил обнаружения (фильтры)       | entities/rule         |
| GET    | `rules/{rule_id}`                              | правило                                   | entities/rule         |
| GET    | `rules/enums/severity-hints`                   | справочник severity                       | entities/rule         |
| POST   | `rules/admin/`                                 | создать правило                           | features/rule-upsert  |
| PUT    | `rules/admin/{rule_id}`                        | обновить правило                          | features/rule-upsert  |
| PATCH  | `rules/admin/{rule_id}`                        | вкл/выкл (`{enabled}`)                    | features/rule-toggle-status |
| DELETE | `rules/admin/{rule_id}`                        | удалить правило                           | features/rule-delete  |
| GET    | `/correlation-rules/`                          | список правил корреляции                  | entities/correlation-rule |
| GET    | `/correlation-rules/{id}`                      | правило корреляции                        | entities/correlation-rule |
| GET    | `/correlation-rules/sequence`                  | справочники sequence / group-by полей     | entities/correlation-rule |
| POST   | `/correlation-rules/`                          | создать                                   | features/correlation-rule-upsert |
| PUT    | `/correlation-rules/{id}`                      | обновить                                  | features/correlation-rule-upsert |
| GET    | `/supersession-rules/`                         | список правил подавления                  | entities/suppression-rule |
| GET    | `/supersession-rules/{id}`                     | правило подавления                        | entities/suppression-rule |
| GET    | `/supersession-rules/suppression-match-fields` | метаданные полей match                    | entities/suppression-rule |
| POST   | `/supersession-rules/`                         | создать                                   | features/suppression-rule-upsert |
| PUT    | `/supersession-rules/{id}`                     | обновить                                  | features/suppression-rule-upsert |
| GET    | `/ioc/`                                        | список IoC                                | entities/ioc          |
| GET    | `/ioc/{id}`                                    | IoC                                       | entities/ioc          |
| POST   | `/ioc/`                                        | создать                                   | features/ioc-create   |
| PATCH  | `/ioc/{id}`                                    | изменить                                  | features/ioc-edit     |
| GET    | `/incidents`                                   | список инцидентов (`IncidentParams`)      | entities/incident     |
| GET    | `/incidents/{id}`                              | инцидент                                  | entities/incident     |
| GET    | `/incidents/{id}/events`                       | события инцидента (page/size)             | entities/incident     |
| PATCH  | `/incidents/{id}/status`                       | статус аналитика (optimistic update)      | features/incident-change-status |
| GET    | `/scenarios/`                                  | список сценариев                          | entities/scenario     |
| GET    | `/scenarios/{id}`                              | агрегат сценария                          | entities/scenario     |
| GET    | `/scenarios/{id}/events`                       | события сценария                          | entities/scenario     |
| GET    | `/events/`                                     | сырые события Wazuh                       | entities/event        |
| GET    | `/events/{index_name}/{event_id}`              | событие                                   | entities/event        |
| GET    | `/organizations/`                              | список организаций                        | entities/organization |
| GET    | `/organizations/{id}`                          | организация                               | entities/organization |
| GET    | `/organizations/agents`                        | агенты Wazuh                              | entities/organization |
| POST   | `/organizations/`                              | создать                                   | features/organization-upsert |
| PUT    | `/organizations/{id}`                          | обновить                                  | features/organization-upsert |
| DELETE | `/organizations/{id}`                          | удалить                                   | features/organization-delete |
| GET    | `/audits/`                                     | журнал аудита                             | entities/audit        |
| GET    | `/audits/{id}`                                 | запись аудита (с правилом)                | entities/audit        |
| GET    | `/mitre/mitre`                                 | техники MITRE ATT&CK                      | entities/mitre-technique |
| POST   | `/mitre/sync-mitre`                            | синхронизация MITRE                       | features/mitre-sync   |
| GET    | `/attack-types/`                               | справочник типов атак                     | entities/attack-type  |

> Пути `rules/...` указаны без ведущего `/`. В целевой реализации пути единообразны: всегда начинаются с `/`.

---

## 6. Аутентификация и авторизация

- Сессия хранится в **httpOnly cookie** и выставляется backend'ом. На клиенте токены не хранятся.
- axios-interceptor (`shared/api`): при ответе **401** (кроме запроса `/users/login`) делает один `POST /users/login`
  с пустым телом для обновления сессии и повторяет исходный запрос. Если обновить сессию не удалось, выполняется `window.location.replace("/login")`.
- Guard ролей (`src/app/guards/RoleGuard`, бывший `middleware/ProtectedLayout`) получает пользователя через `useMe()` и:
  - перенаправляет на `/login`, если пользователя нет или его роль не входит в разрешённые;
  - перенаправляет на «домашнюю» страницу роли (`roleDashboardPaths`), если пользователь открыл чужой раздел (`/admin`, `/analyst`, `/viewer`);
  - пока идёт проверка, ничего не рендерит (`null`).
- Защиты на стороне сервера **нет**. Проверка на клиенте — это UX, а не безопасность. Права обязан проверять backend.

| Роль      | Домашняя страница | Доступ          |
| --------- | ----------------- | --------------- |
| `ADMIN`   | `/admin` → `/admin/organizations` | весь `/admin/*` |
| `ANALYST` | `/analyst`        | заглушка        |
| `VIEWER`  | `/viewer`         | заглушка        |

## 7. Маршруты

| URL                                          | View (цель)                    | Примечание |
| -------------------------------------------- | ------------------------------ | ---------- |
| `/`                                          | —                              | редирект на `/login` |
| `/login`                                     | `views/login`                  | |
| `/auth`                                      | `views/register`               | регистрация |
| `/admin`                                     | —                              | редирект на `/admin/organizations` |
| `/admin/organizations`, `/new`, `/[organization_id]`, `/[organization_id]/edit` | `views/organization*` | |
| `/admin/rules`, `/new`, `/[slug]`            | `views/rule*`                  | правила обнаружения |
| `/admin/crule`, `/new`, `/[id]`              | `views/correlation-rule*`      | правила корреляции |
| `/admin/supers`, `/new`, `/[slug]`, `/[slug]/edit` | `views/suppression-rule*` | правила подавления |
| `/admin/ioc`, `/new`, `/[id]`                | `views/ioc*`                   | |
| `/admin/audit`, `/[id]`                      | `views/audit*`                 | |
| `/admin/mitre`                               | `views/mitre`                  | |
| `/admin/hunters`                             | —                              | редирект на `/admin/hunters/incidents` |
| `/admin/incidents`, `/[id]`                  | `views/incident*`              | ⚠️ раньше был `/admin/hunters/incidents`; вкладка и редирект `/admin/hunters` ещё ведут туда (раздел 9) |
| `/admin/hunters/scenarios`, `/[scenarioId]`  | `views/scenario*`              | вкладки `widgets/hunters-tabs` |
| `/admin/hunters/events`, `/[index_name]/[event_id]` | `views/event*`          | |
| `/admin/scenarios`, `/[scenarioId]`          | —                              | редирект на `/admin/hunters/scenarios` |
| `/admin/testRule`                            | —                              | заглушка |
| `/analyst`, `/viewer`                        | `views/analyst-home`, `views/viewer-home` | заглушки |

Константы путей хранятся в `shared/config/routes.ts`. Строки URL в компонентах не хардкодятся.

---

## 8. План миграции на FSD

Мигрировать нужно **по одному домену**, чтобы после каждого шага работали `npm run build` и `npm run lint`.

### Прогресс

| Этап                                   | Статус        |
| -------------------------------------- | ------------- |
| Шаг 0. Каркас и переходные алиасы       | ✅ выполнен    |
| Шаг 1. `shared` и `app`                 | ✅ выполнен    |
| Домен `rules` (шаги 2–5)                | ✅ выполнен, это **эталон** |
| Домены `user`/auth, `audit`, `correlation-rule`, `suppression-rule`, `ioc`, `incident`, `scenario`, `event`, `organization`, `mitre-technique`, `attack-type` | ⏳ не начаты |
| Шаг 6. Очистка                         | ⏳             |

**Эталон для переноса домена** — `rules`:
- `src/entities/rule`: `model/types.ts`, `api/{ruleApi,queryKeys,queries}.ts`, `config/`, `ui/` (презентационные компоненты, действия передаются через слот `actions`);
- `src/features/rule-{delete,toggle-status,upsert}`: `model/use*.ts` (мутация, инвалидация через `ruleKeys`, тосты) и `ui/` (кнопка или форма);
- `src/widgets/{rules-list,rule-details}`: собирают entity и features, держат состояние экрана (пагинация, загрузка, ошибка);
- `src/views/{rules,rule-detail,rule-create}` и тонкие `app/(dashboard)/admin/rules/**/page.tsx` (`params` — Promise).

Временные зависимости от старого кода: `src/app/guards/RoleGuard.tsx` и `src/widgets/sidebar` импортируют `@/services/users/usersQueries`.
Их нужно убрать при переносе домена `user`/auth.

### Шаг 0. Каркас ✅
1. Создать `src/{app,views,widgets,features,entities,shared}`.
2. Переходные алиасы в `tsconfig.json` (раздел 4.7).
3. Обновить `components.json` (раздел 4.7).

### Шаг 1. `shared` и `app` ✅
| Было                              | Стало                                       |
| --------------------------------- | ------------------------------------------- |
| `lib/axiosAPi.ts`                 | `src/shared/api/base.ts` (`import { axiosApi } from "@/shared/api"`) |
| `constants/main.ts` (`apiURL`, `isDev`) | `src/shared/config/env.ts`            |
| `constants/main.ts` (`roleDashboardPaths`) + объект `routes` | `src/shared/config/routes.ts` |
| `constants/main.ts` (`theme`)     | `src/shared/config/theme.ts`                |
| `constants/main.ts` (`inputClass`) | `src/shared/ui/form/styles.ts` (+ `errorClass`) |
| `constants/main.ts` (классы таблиц) | `src/shared/ui/table-styles.ts`           |
| `constants/main.ts` (`actionAction`, `actionSeverity`, `actionDecision`) | `services/supers/options.ts` (при переносе supers → `entities/suppression-rule/config`) |
| `constants/main.ts` (`dashboardMenuItems`) | `src/widgets/sidebar/config/menu.ts` |
| `lib/utils.ts`                    | `src/shared/lib/utils.ts`                   |
| `components/ui/*`                 | `src/shared/ui/*`                           |
| `components/pagination/pagination.tsx` | `src/shared/ui/pagination.tsx`         |
| `services/utils.tsx` (`FieldError`, `SectionTitle`, `ArrayField`) | `src/shared/ui/form` |
| `providers/provider.tsx`          | `src/app/providers/Providers.tsx`           |
| `middleware/ProtectedLayout.tsx`  | `src/app/guards/RoleGuard.tsx`              |
| `app/(dashboard)/layout.tsx` (разметка) | `src/app/layouts/DashboardLayout.tsx` |
| `components/sidebar/SideBar.tsx`  | `src/widgets/sidebar`                       |
| `app/globals.css`                 | `src/app/styles/globals.css`                |

### Шаг 2. `entities`
Для каждого домена: `types/<x>.ts` → `entities/<x>/model/types.ts`; GET-запросы и `useQuery`-хуки из `services/<x>` → `entities/<x>/api`;
добавить `queryKeys.ts`; базовые карточки и строки (`RuleCard`, `CruleCard`, `SuperRulesCard`) → `entities/<x>/ui`.

### Шаг 3. `features`
`useMutation`-хуки и формы: `RuleForm` → `features/rule-upsert`; `SuperRuleEditForm` → `features/suppression-rule-upsert`;
формы IoC и организаций из `app/.../new|edit/page.tsx` → `features/*-upsert`; фильтры из `Incidents.tsx`, `ScenarioList.tsx`, `Events.tsx` → `features/*-filter`;
`usePatchIncidentStatus` → `features/incident-change-status`; `useSyncMitre` → `features/mitre-sync`; `useLogin`/`useLogout`/`useRegister` → `features/auth-*`.

### Шаг 4. `widgets`
Крупные компоненты из `components/*`: `Incidents`, `IncidentDetail`, `ScenarioList`, `ScenarioDetail`, `Events`, `EventDetail`,
`RuleDetail`, `CorrelationDetailPage`, `SuperRule`, `AuditTable`, `IocTable`, `MitreTechniques`, `SideBar`, вкладки из `admin/hunters/layout.tsx`.
Самые большие файлы (`IncidentDetail` ~630 строк, `ScenarioDetail` ~550, `RuleForm` ~500, `Incidents` ~500)
нужно разбить на виджет и features.

### Шаг 5. `views` и тонкие route-файлы
Перенести содержимое `app/**/page.tsx` во `views/*`. В `app/` оставить только `import` и `return <XPage />`.

### Шаг 6. Очистка
Удалить `components/`, `services/`, `types/`, `lib/`, `constants/`, `providers/`, `middleware/` и временные алиасы.
Подключить Steiger и обновить `CLAUDE.md`.

---

## 9. Известные проблемы и техдолг

Их исправляют попутно, при переносе соответствующего слайса.

1. ✅ **Битые ссылки на `/admin/hunters/incidents`** (вкладка охотников, редирект `/admin/hunters`, ссылки в `Incidents`,
   `IncidentDetail`, `ScenarioDetail`) и на `/dashboard` (логотип сайдбара) заменены на `routes.*`.
2. ✅ **Дубли:** удалены `lib/hooks/severities.ts` и неиспользуемый `components/rule/RuleTable.tsx`.
3. **Query-ключи не согласованы:** `["organizations"]` и `["organization", id]`, `["event-detail", ...]`, опечатка `["seguence"]`.
   Префикс для одной сущности должен быть единым, решается фабриками ключей (4.5). ✅ Для `rules` уже сделано (`ruleKeys`).
4. **Опечатки в именах:** `useIncidentDetai`, `useSeguence`, `IocItemPatchcSchema`, `SuppresionRuleCreateType`, `ViewertHome`
   (✅ `axiosAPi.ts` убран).
5. ✅ **Guard:** `RoleGuard` скрывает контент чужого раздела для всех трёх ролей, в том числе `/viewer`.
6. **Редиректы `/` и `/admin`** сделаны через `useEffect` + `router.push` на клиенте. Лучше использовать `redirect()` в серверном компоненте или `redirects` в `next.config.ts`.
7. **Env:** `NEXT_BACK_URL` не задана, а `NEXT_API_URL`, `NEXT_IMAGE_URL` и `NEXT_PUBLIC_BACK_API_URL` не используются (раздел 3).
8. **Разные схемы пагинации** (`limit/offset` и `page/size`). Общие типы ответов вынести в `shared/api/types.ts`.
9. **Цвета захардкожены** (`#1E2B6D`, `#F7F8F4` и др.) в классах Tailwind. Перенести в CSS-переменные темы в `globals.css`.
10. **Тестов нет.**

---

## 10. Соглашения по коду

- Компоненты: `PascalCase.tsx`. Хуки: `useX`. Слайсы и папки: `kebab-case`.
- Request-функции — глаголы: `fetchX`, `createX`, `updateX`, `deleteX`, `patchXStatus`.
- Query-хуки: `useX` / `useXDetail`. Mutation-хуки: `useCreateX` / `useUpdateX` / `useDeleteX`.
- Типы ответов API называются по схеме backend, описываются через `interface` и лежат в `model/types.ts` своей сущности.
- Тексты UI пишутся на русском.
- `"use client"` ставится только там, где нужны хуки или браузерные API.
- Уведомления об успехе и ошибке мутаций показываются через `sonner` (`toast`) в feature, а не в entity.
