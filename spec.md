# Техническая спецификация: Detection Rules (frontend)

> Это главный технический документ проекта. На него ссылаются при разработке, ревью и рефакторинге.
> Проект построен по **Feature-Sliced Design (FSD)**. Раздел 4 описывает архитектуру и правила,
> раздел 8 — историю миграции со старой плоской структуры (завершена).

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
| Шрифты          | `next/font/google`: Inter (latin + cyrillic), Geist                               |
| Линт            | ESLint 9 (flat config, `eslint-config-next`), Steiger (правила FSD)                |
| Тесты           | не настроены                                                                       |

> ⚠️ Next.js 16 отличается от предыдущих версий. Перед использованием API Next.js сверяйтесь с
> `node_modules/next/dist/docs/`. Например, **Middleware теперь называется Proxy** (`proxy.ts`).

### Команды

```bash
npm run dev     # dev-сервер, backend ожидается на http://localhost:8001/api
npm run build   # production-сборка (standalone)
npm run start   # запуск production-сборки
npm run lint    # ESLint
npm run lint:fsd  # Steiger — проверка правил FSD в src/
```

Если `tsc`/`next build` падают на `.next/dev/types/validator.ts`, это устаревшие типы от `next dev`:
при остановленном dev-сервере удалите `.next/dev`.

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

## 4. Архитектура: Feature-Sliced Design

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

> ⚠️ Значения `params` приходят **URL-кодированными** (проверено: `/x/a%20b` даёт `"a%20b"`), так же как `useParams()`.
> Если параметр — человекочитаемый id, который дальше снова кодируется (`routes.*`, `encodeURIComponent` в API),
> декодируйте его в route-файле: `decodeURIComponent(param)`. Так сделано для организаций, событий и редиректа сценариев.

```tsx
// app/(dashboard)/admin/rules/[slug]/page.tsx — динамический route-файл
import { RuleDetailPage } from "@/views/rule-detail";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RuleDetailPage ruleId={slug} />;
}
```

### 4.3. Сегменты внутри слайса

| Сегмент   | Содержимое                                                                 |
| --------- | -------------------------------------------------------------------------- |
| `ui/`     | React-компоненты                                                           |
| `api/`    | request-функции (axios), query-хуки TanStack Query, фабрика query-ключей   |
| `model/`  | типы, схемы форм, константы домена, локальное состояние/хуки               |
| `lib/`    | чистые функции-хелперы слайса (форматтеры, маппинг)                        |
| `config/` | статическая конфигурация слайса (колонки таблицы, пункты меню)             |

Сегменты именуются по назначению (`api`, `model`), а не по типу файла (`hooks`, `types`, `components`).

### 4.4. Структура каталогов

```
/
├─ app/                          # ТОЛЬКО роутинг Next.js (тонкие файлы, без "use client")
│  ├─ layout.tsx                 # html/body, шрифты, metadata, Toaster, @/app/providers, @/app/styles
│  ├─ page.tsx                   # redirect(routes.login)
│  ├─ (auth)/login, (auth)/auth  # → @/views/login, @/views/register
│  └─ (dashboard)/
│     ├─ layout.tsx              # → @/app/layouts (DashboardLayout)
│     ├─ admin/page.tsx          # redirect(routes.organizations)
│     ├─ admin/hunters/layout.tsx  # → @/widgets/hunters-tabs
│     └─ admin/**/page.tsx       # → @/views/*
├─ steiger.config.ts             # конфиг линтера FSD
└─ src/
   ├─ app/
   │  ├─ providers/              # Providers (QueryClient + Devtools)
   │  ├─ guards/                 # RoleGuard
   │  ├─ layouts/                # DashboardLayout (RoleGuard + Sidebar + main)
   │  └─ styles/globals.css
   ├─ views/
   │  ├─ login/  register/  analyst-home/  viewer-home/  test-rule/
   │  ├─ organizations/  organization-detail/  organization-create/  organization-edit/
   │  ├─ rules/  rule-detail/  rule-create/
   │  ├─ correlation-rules/  correlation-rule-detail/  correlation-rule-create/
   │  ├─ suppression-rules/  suppression-rule-detail/  suppression-rule-create/  suppression-rule-edit/
   │  ├─ ioc/  ioc-detail/  ioc-create/
   │  ├─ incidents/  incident-detail/  scenarios/  scenario-detail/  events/  event-detail/
   │  └─ audit/  audit-detail/  mitre/
   ├─ widgets/
   │  ├─ sidebar/  hunters-tabs/
   │  ├─ rules-list/  rule-details/  correlation-rules-list/
   │  ├─ suppression-rules-list/  suppression-rule-details/
   │  ├─ ioc-list/  ioc-details/  audit-list/  audit-details/
   │  ├─ incidents-table/  incident-details/  scenarios-list/  scenario-details/
   │  ├─ events-table/  event-details/
   │  └─ organizations-list/  organization-details/  mitre-techniques/
   ├─ features/
   │  ├─ auth-login/  auth-logout/  auth-register/
   │  ├─ rule-upsert/  rule-delete/  rule-toggle-status/
   │  ├─ correlation-rule-upsert/  suppression-rule-upsert/
   │  ├─ ioc-create/  ioc-edit/
   │  ├─ incident-change-status/  incidents-filter/  scenarios-filter/
   │  ├─ organization-upsert/  organization-delete/
   │  └─ mitre-sync/
   ├─ entities/
   │  ├─ user/  rule/  correlation-rule/  suppression-rule/  ioc/
   │  ├─ incident/  scenario/  event/  organization/  audit/
   │  └─ mitre-technique/  attack-type/
   └─ shared/
      ├─ api/                    # axiosApi + interceptor 401
      ├─ config/                 # env (apiURL), routes, roleDashboardPaths, UserRole, theme
      ├─ ui/                     # shadcn, pagination, form (ArrayField, inputClass…), detail-fields, table-styles
      └─ lib/                    # utils (cn), errors (getErrorMessage)
```

Фильтров у списков правил и событий в UI нет, поэтому `rules-filter` и `events-filter` не созданы. Таблицы IoC и аудита — это
презентационный UI сущностей (`entities/ioc/ui/IocTable`, `entities/audit/ui/AuditTable`), а не отдельные виджеты.

### 4.5. Шаблон слайса сущности

```
entities/rule/
├─ api/
│  ├─ ruleApi.ts        # fetchRules, fetchRule, fetchSeverityHints, createRule, updateRule, …
│  ├─ queryKeys.ts      # ruleKeys — единый источник query-ключей
│  └─ queries.ts        # useRules, useRule, useSeverityHints
├─ config/severity.ts   # RULE_SEVERITY_STYLES
├─ model/types.ts       # RuleType, RuleApiResponse, QueryFiltersType
├─ ui/                  # RuleCard (слот actions), RuleDetailTable (callback-driven)
├─ @x/audit.ts          # типы для entities/audit
└─ index.ts             # public API
```

В небольших сущностях фабрика ключей лежит прямо в `api/queries.ts`. UI сущности презентационный: действия
(features) передаются в него через слоты (`actions`) или колбэки (`onDelete`, `onUpdate`).

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

`tsconfig.json`: `"@/*": ["./src/*"]`. Обратите внимание: `@/app/*` — это слой FSD `src/app`, а не папка роутинга `app/`.

Импорты: `@/shared/ui`, `@/entities/rule`, `@/features/rule-delete`, `@/widgets/sidebar`, `@/views/rules`, `@/app/providers`.

`components.json` (shadcn) настроен так, чтобы `npx shadcn add` клал компоненты в shared:

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

### 4.8. Проверка правил FSD (Steiger)

`npm run lint:fsd` запускает **Steiger** (`steiger` + `@feature-sliced/steiger-plugin`, конфиг `steiger.config.ts`).
Steiger знает только стандартное имя слоя `pages`, поэтому в конфиге отключены:
- `fsd/insignificant-slice` — ссылки из `views` он не видит и ложно считает виджеты/фичи неиспользуемыми;
- `fsd/segments-by-purpose` для `src/app` — `providers` является устоявшимся именем сегмента.

Импорты внутри `views` Steiger не проверяет: при ревью следите, чтобы views импортировали только widgets/features/entities/shared
через public API.

---

## 5. Доменная модель и API

Во всех путях ниже префикс — `apiURL`. Ответ 401 обрабатывается централизованно (раздел 6).

### 5.1. Сущности

| Entity            | Query-хуки (`*Keys`)                                             | Ключевые типы                                                 | Пагинация        |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- | ---------------- |
| `user`            | `useMe` (`userKeys`)                                             | `UserType`, `UserRole`, `UserLoginType`, `UsersAuthType`      | —                |
| `rule`            | `useRules`, `useRule`, `useSeverityHints` (`ruleKeys`)           | `RuleType`, `RuleCreateUpdateType`, `QueryFiltersType`        | `limit/offset` → `{total, has_next, items}` |
| `correlation-rule`| `useCorrelationRules`, `useCorrelationRule`, `useSequenceOptions`, `useGroupByFields` (`correlationRuleKeys`) | `CorrelationRuleType`, `SequenceValueType`, `CorrelationGroupByFieldsType` | нет (массив) |
| `suppression-rule`| `useSuppressionRules`, `useSuppressionRule`, `useSuppressionMatchFields` (`suppressionRuleKeys`) | `SuppressionRuleTypes`, `SuppressionRuleCreateType`, `MatchFieldResponseType` | нет (массив) |
| `ioc`             | `useIocs`, `useIoc` (`iocKeys`)                                  | `IocType`, `IocCreateType`, `IocPatchType`                    | `page/size` → `{items,total,page,size,pages,has_next,has_previous}` |
| `incident`        | `useIncidents`, `useIncident`, `useIncidentEvents` (`incidentKeys`) | `IncidentSchema`, `Incident`, `IncidentParams`, `ANALYST_STATUS` | `page/size` |
| `scenario`        | `useScenarios`, `useScenario`, `useScenarioEvents` (`scenarioKeys`) | `SecurityScenario`, `ScenarioAggregateSchema`, `ScenarioQueryParams` | `page/size` |
| `event`           | `useEvents`, `useEvent` (`eventKeys`)                            | `WazuhEvent`, `WazuhEventApiResponse`, `RawEventsQueryParamsSchema` | `page/size` |
| `organization`    | `useOrganizations`, `useOrganization`, `useAgents` (`organizationKeys`) | `Organization`, `AgentType`, `OrganizationCreateUpdateType` | нет          |
| `audit`           | `useAudits`, `useAudit` (`auditKeys`)                            | `AuditType`, `AuditDetailType` (содержит `rule: RuleType`)     | `limit/offset`   |
| `mitre-technique` | `useMitreTechniques` (`mitreKeys`)                               | `MitreTechnique`, `MitreSyncResponse`, `MitreType`            | нет (массив)     |
| `attack-type`     | `useAttackTypes` (`attackTypeKeys`)                              | `AttackTypes`                                                 | —                |

Связи между сущностями оформлены через `@x`:
`audit → rule, user`; `scenario → incident, event, ioc, mitre-technique`; `incident → event`.

### 5.2. Эндпоинты

| Метод  | Путь                                           | Назначение                                | Слайс-владелец        |
| ------ | ---------------------------------------------- | ----------------------------------------- | --------------------- |
| GET    | `/users/me`                                    | текущий пользователь                      | entities/user         |
| POST   | `/users/login`                                 | вход; пустое тело — обновление сессии     | features/auth-login, shared/api |
| DELETE | `/users/logout`                                | выход                                     | features/auth-logout  |
| POST   | `/users/`                                      | регистрация                               | features/auth-register |
| GET    | `/rules/`                                       | список правил обнаружения (фильтры)       | entities/rule         |
| GET    | `/rules/{rule_id}`                              | правило                                   | entities/rule         |
| GET    | `/rules/enums/severity-hints`                   | справочник severity                       | entities/rule         |
| POST   | `/rules/admin/`                                 | создать правило                           | features/rule-upsert  |
| PUT    | `/rules/admin/{rule_id}`                        | обновить правило                          | features/rule-upsert  |
| PATCH  | `/rules/admin/{rule_id}`                        | вкл/выкл (`{enabled}`)                    | features/rule-toggle-status |
| DELETE | `/rules/admin/{rule_id}`                        | удалить правило                           | features/rule-delete  |
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

> Все пути в `entities/*/api` начинаются с `/`.
>
> ⚠️ `fetchGroupByFields` ходит на тот же `/correlation-rules/sequence`, что и `fetchSequenceOptions`, хотя ожидает
> `CorrelationGroupByFieldsType[]` (с `description`). Похоже на опечатку — нужно сверить адрес с backend (раздел 9).

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

| URL                                          | View                           | Примечание |
| -------------------------------------------- | ------------------------------ | ---------- |
| `/`                                          | —                              | `redirect(routes.login)` |
| `/login`                                     | `views/login`                  | |
| `/auth`                                      | `views/register`               | регистрация |
| `/admin`                                     | —                              | `redirect(routes.organizations)` |
| `/admin/organizations`, `/new`, `/[organization_id]`, `/[organization_id]/edit` | `views/organization*` | id декодируется в route-файле |
| `/admin/rules`, `/new`, `/[slug]`            | `views/rule*`                  | правила обнаружения |
| `/admin/crule`, `/new`, `/[id]`              | `views/correlation-rule*`      | правила корреляции; `/[id]` — форма редактирования |
| `/admin/supers`, `/new`, `/[slug]`, `/[slug]/edit` | `views/suppression-rule*` | правила подавления |
| `/admin/ioc`, `/new`, `/[id]`                | `views/ioc*`                   | |
| `/admin/audit`, `/[id]`                      | `views/audit*`                 | |
| `/admin/mitre`                               | `views/mitre`                  | |
| `/admin/incidents`, `/[id]`                  | `views/incident*`              | вкладка «Инциденты» в `widgets/hunters-tabs` ведёт сюда |
| `/admin/hunters`                             | —                              | `redirect(routes.incidents)` |
| `/admin/hunters/scenarios`, `/[scenarioId]`  | `views/scenario*`              | layout с `widgets/hunters-tabs` |
| `/admin/hunters/events`, `/[index_name]/[event_id]` | `views/event*`          | параметры декодируются в route-файле |
| `/admin/scenarios`, `/[scenarioId]`          | —                              | редирект на `/admin/hunters/scenarios[/id]` |
| `/admin/testRule`                            | `views/test-rule`              | заглушка |
| `/analyst`, `/viewer`                        | `views/analyst-home`, `views/viewer-home` | заглушки |

Константы путей хранятся в `shared/config/routes.ts` (`routes.rule(id)`, `routes.organizationEdit(id)` и т. д.).
Строки URL в компонентах не хардкодятся.

Внутри layout `(dashboard)` серверный `redirect()` отвечает не HTTP 307, а инструкцией `NEXT_REDIRECT` в RSC-потоке
(layout уже начал стримиться) — это штатное поведение Next, клиент выполняет переход сам.

---

## 8. История миграции на FSD

Миграция **завершена**. Каждый шаг — отдельный коммит в ветке `refactor/fsd`; после каждого проверялись `tsc`, `eslint` и `next build`.

| Этап | Что сделано |
| ---- | ----------- |
| 0. Каркас | `src/{app,views,widgets,features,entities,shared}`, переходные алиасы, `components.json` → shared |
| 1. `shared` и `app` | axios, config, ui, lib; Providers, RoleGuard, DashboardLayout, widgets/sidebar |
| 2–5. Домены | `rules` (эталон) → `user`/auth, `audit` → `attack-type`, `mitre-technique`, `organization` → `ioc` → `event` → `incident` → `scenario` → `correlation-rule` → `suppression-rule` |
| 6. Очистка | удалены `components/`, `services/`, `types/`, `lib/`, `constants/`, `providers/`, `middleware/`; единый алиас `@/*` → `./src/*`; Steiger; `widgets/hunters-tabs` |

Соответствие старых файлов новым (для чтения истории git):

| Было | Стало |
| ---- | ----- |
| `lib/axiosAPi.ts`, `lib/utils.ts` | `shared/api`, `shared/lib/utils` |
| `constants/main.ts` | `shared/config` (env, routes, theme), `shared/ui/form/styles`, `shared/ui/table-styles`, `widgets/sidebar/config/menu`, `entities/suppression-rule/config/options` |
| `components/ui/*`, `components/pagination` | `shared/ui/*` |
| `services/utils.tsx` | `shared/ui/form` |
| `providers/provider.tsx`, `middleware/ProtectedLayout.tsx` | `app/providers`, `app/guards/RoleGuard` |
| `types/<x>.ts` | `entities/<x>/model/types.ts` |
| `services/<x>/*Requests.ts` + GET-хуки из `*Queries.ts` | `entities/<x>/api` |
| мутации из `services/<x>/*Queries.ts` | `features/<x>-*/model` |
| `components/<x>/*` | `entities/<x>/ui` (карточки, таблицы) или `widgets/*` (экраны) |
| формы из `app/**/new|edit/page.tsx` | `features/*-upsert/ui` |
| `app/**/page.tsx` (разметка) | `views/*` + `widgets/*` |

---

## 9. Известные проблемы и техдолг

### Исправлено при миграции
1. ✅ Битые ссылки: `/admin/hunters/incidents` (вкладка, редирект, ссылки в инцидентах и сценариях), `/dashboard` (логотип сайдбара),
   `/superrules` (детали правила подавления).
2. ✅ Дубли: `lib/hooks/severities.ts`, неиспользуемые `RuleTable.tsx` и пустой `Header.tsx`; одна форма организации
   вместо двух копий; общие `DetailField`/`DetailFieldList`/`DetailSection` вместо копий в 4 виджетах.
3. ✅ Query-ключи: фабрика `*Keys` у каждой сущности, единый префикс на сущность.
4. ✅ Опечатки: `useIncidentDetai` → `useIncident`, `useSeguence` → `useSequenceOptions`, `SuppresionRuleCreateType` →
   `SuppressionRuleCreateType`, `axiosAPi.ts` убран, `ViewertHome` → `ViewerHomePage`.
   `IocItemPatchcSchema` оставлен намеренно — это алиас имени схемы backend.
5. ✅ `RoleGuard` скрывает контент чужого раздела для всех ролей, включая `/viewer`.
6. ✅ Редиректы `/` и `/admin` — серверный `redirect()` вместо `useEffect` + `router.push`.
7. ✅ Двойной тост при ошибке удаления правила; падение переключателя статуса правила на детальном кэше;
   `toast.success` вместо `toast.error` при ошибке сохранения правила подавления; двойное кодирование id
   в редиректе `/admin/scenarios/[scenarioId]`.
8. ✅ ESLint: 0 ошибок и 0 предупреждений (было 3 и 47), в том числе `setState` в `useEffect` у формы организации и `any`.

### Открыто
1. **`fetchGroupByFields` и `fetchSequenceOptions` ходят на один эндпоинт** `/correlation-rules/sequence` (см. 5.2).
2. **Заглушки в правилах корреляции:** кнопка удаления на карточке делает `console.log("delete")` (эндпоинта удаления нет);
   форма создания пишет данные в консоль и показывает тост «Заглушка: …» до ответа сервера.
3. **Пагинация правил подавления** — `PaginationControl` отображается, но список не режется (backend отдаёт массив целиком).
4. **`features/ioc-edit`** содержит только хук `useUpdateIoc` — UI редактирования IoC нет.
5. **Env:** `NEXT_BACK_URL` не задана, а `NEXT_API_URL`, `NEXT_IMAGE_URL` и `NEXT_PUBLIC_BACK_API_URL` не используются (раздел 3).
6. **Разные схемы пагинации** (`limit/offset` и `page/size`). Общие типы ответов можно вынести в `shared/api/types.ts`.
7. **Цвета захардкожены** (`#1E2B6D` и др.) в классах Tailwind на страницах, ещё не переведённых на макет CERT-KG SIEM. Палитра макета уже лежит в `@theme` в `globals.css` (`bg-brand`, `text-ink`, `border-line`…) — используйте её.
8. **Защита маршрутов только на клиенте** (раздел 6). Для server-side проверок — `proxy.ts`.
9. **Тестов нет.**

---

## 10. Соглашения по коду

- Компоненты: `PascalCase.tsx`. Хуки: `useX`. Слайсы и папки: `kebab-case`.
- Request-функции — глаголы: `fetchXs` (список), `fetchX` (одна запись), `createX`, `updateX`, `deleteX`, `patchXStatus`.
- Query-хуки: `useXs` (список) / `useX` (одна запись) — в `entities`. Mutation-хуки: `useCreateX` / `useUpdateX` /
  `useDeleteX` / `useToggleXStatus` — в `features`.
- Новый route-файл: тонкий `app/**/page.tsx` → `views/<page>` → `widgets`/`features` → `entities` → `shared`.
  Пути добавляются в `shared/config/routes.ts`.
- Типы ответов API называются по схеме backend, описываются через `interface` и лежат в `model/types.ts` своей сущности.
- Тексты UI пишутся на русском.
- `"use client"` ставится только там, где нужны хуки или браузерные API.
- Уведомления об успехе и ошибке мутаций показываются через `sonner` (`toast`) в feature, а не в entity.
