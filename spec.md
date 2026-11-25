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
│     ├─ admin/page.tsx          # → @/views/home («Главная»)
│     ├─ admin/(administration)/ # audit (route group без своего layout)
│     └─ admin/**/page.tsx       # → @/views/*
├─ steiger.config.ts             # конфиг линтера FSD
└─ src/
   ├─ app/
   │  ├─ providers/              # Providers (QueryClient + Devtools)
   │  ├─ guards/                 # RoleGuard
   │  ├─ layouts/                # DashboardLayout (RoleGuard + Sidebar + main)
   │  └─ styles/globals.css
   ├─ views/
   │  ├─ login/  register/  home/  analyst-home/  viewer-home/  test-rule/
   │  ├─ organizations/  organization-detail/  organization-create/  organization-edit/
   │  ├─ rules/  rule-detail/  rule-create/
   │  ├─ correlation-rules/  correlation-rule-detail/  correlation-rule-create/
   │  ├─ suppression-rules/  suppression-rule-detail/  suppression-rule-create/
   │  ├─ ioc/  ioc-detail/  ioc-create/
   │  ├─ incidents/  incident-detail/  incident-modal/  source-ip-incidents/  source-ip-incidents-modal/
│  ├─ scenarios/  scenario-detail/  events/  event-detail/
   │  └─ audit/  audit-detail/  mitre/  mitre-detail/
   ├─ widgets/
   │  ├─ sidebar/
   │  ├─ rules/ (группа: list, details)  correlation-rules/ (группа: list, details)
   │  ├─ suppression-rules/ (группа: list, details)
   │  ├─ ioc-list/  ioc-details/  audit-list/  audit-details/
   │  ├─ incidents-table/  incident-details/  scenarios-list/  scenario-details/
   │  ├─ events-table/  event-details/
   │  └─ organizations-list/  organization-details/  mitre-techniques/ (список + карточка техники)
   ├─ features/
   │  ├─ auth-login/  auth-logout/  auth-register/
   │  ├─ rule-upsert/ (RuleForm + тест правила)  rule-delete/ (DeleteRulesDialog)  rule-toggle-status/
   │  ├─ correlation-rule/ (группа: upsert — форма + тест, delete, toggle-status)  suppression-rule/ (группа: upsert — форма + тест, delete, toggle-status)
   │  ├─ ioc-create/  ioc-mark-viewed/
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
      ├─ ui/                     # shadcn, pagination, form (ArrayField, inputClass…), detail-fields, table-styles,
      │                          # filter-bar (поиск, «Добавить фильтр», чипы — для инцидентов и сценариев)
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
├─ config/conditions.ts # операторы условий, condition_mode, поля события (схема Event)
├─ ui/                  # RuleDetailTable (callback-driven, используется в аудите)
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
| `rule`            | `useRules`, `useAllRules`, `useRule`, `useSeverityHints`, `useDetectionCategories`, `useDetectionScopes` (`ruleKeys`) | `RuleType`, `RuleCondition`, `RuleCreateUpdateType`, `DetectionCategory`, `DetectionScope`, `RuleTestResponse` | `limit/offset` (limit < 20) → `{total, has_next, items}`; раздел грузит все правила пачками (`fetchAllRules`) |
| `correlation-rule`| `useCorrelationRules`, `useCorrelationRule`, `useSequenceOptions`, `useGroupByFields` (`correlationRuleKeys`) | `CorrelationRuleType`, `CorrelationRuleRequestCreateUpdateType`, `CorrelationSeverity`, `CorrelationRuleTestRequest/Response` | нет (массив) |
| `suppression-rule`| `useSuppressionRules`, `useSuppressionRule`, `useSuppressionMatchFields` (`suppressionRuleKeys`) | `SuppressionRuleType`, `SuppressionRuleCreateType`, `SuppressionRuleUpdateType`, `SuppressionRuleTestRequest/Response`; `getExclusionType`, `summarizeMatch` | нет (массив, фильтры и пагинация на клиенте) |
| `ioc`             | `useIocs`, `useIoc` (`iocKeys`)                                  | `IocType`, `IocCreateType`, `IocPatchResponse`                | `page/size` → `{items,total,page,size,pages,has_next,has_previous}` |
| `incident`        | `useIncidents`, `useIncident`, `useIncidentEvents` (`incidentKeys`) | `IncidentSchema`, `Incident`, `IncidentParams`, `ANALYST_STATUS` | `page/size` |
| `scenario`        | `useScenarios`, `useScenario`, `useScenarioEvents` (`scenarioKeys`) | `SecurityScenario`, `ScenarioAggregateSchema`, `ScenarioQueryParams` | `page/size` |
| `event`           | `useEvents`, `useEvent` (`eventKeys`)                            | `WazuhEvent`, `WazuhEventApiResponse`, `RawEventsQueryParamsSchema` | `page/size` |
| `organization`    | `useOrganizations`, `useOrganization`, `useAgents` (`organizationKeys`) | `Organization`, `AgentType`, `OrganizationCreateUpdateType` | нет          |
| `audit`           | `useAudits`, `useAudit` (`auditKeys`)                            | `AuditType`, `AuditDetailType` (содержит `rule: RuleType`)     | `limit/offset`   |
| `mitre-technique` | `useMitreTechniques`, `useMitreTechnique` (`mitreKeys`)          | `MitreTechnique`, `MitreSyncResponse`, `MitreType`; `getMitreTechniqueStatus`, `MitreStatusBadge` | нет (массив)     |
| `source`          | `useSources`, `useSource`, `useSourceHealth`, `useSourceSampleEvents` (`sourceKeys`) | `SourceType`, `SourceCreateUpdateType`, `SourceHealthType`, `SourceSampleEventsType` | нет (`{items}`, фильтры на клиенте) |
| `attack-type`     | `useAttackTypes`, `useAttackGroups` (`attackTypeKeys`)           | `AttackTypes`, `AttackGroupsResponseSchema`, `HuntingIpIncidentSchema` | `page/size`; total = `summary.incident_count` |

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
| GET    | `/rules/enums/detection-categories`             | категории + значения по умолчанию         | entities/rule         |
| GET    | `/rules/enums/detection-scopes`                 | scope + `default_fields`                  | entities/rule         |
| POST   | `/rules/admin/test`                             | `{rule, event}` → `{matched, rule_id}`    | features/rule-upsert  |
| POST   | `/rules/admin/`, `/rules/analyst/`              | создать правило (путь по роли из `useMe`, 400 — id занят) | features/rule-upsert  |
| PUT    | `/rules/admin/{rule_id}`, `/rules/analyst/{rule_id}` | обновить правило (путь по роли)      | features/rule-upsert  |
| PATCH  | `/rules/admin/{rule_id}`                        | вкл/выкл (`{enabled}`)                    | features/rule-toggle-status |
| DELETE | `/rules/admin/{rule_id}`                        | удалить правило                           | features/rule-delete  |
| GET    | `/correlation-rules/`                          | список правил корреляции                  | entities/correlation-rule |
| GET    | `/correlation-rules/{id}`                      | правило корреляции                        | entities/correlation-rule |
| GET    | `/correlation-rules/sequence`                  | справочник шагов последовательности (`[{value,label}]`) | entities/correlation-rule |
| GET    | `/correlation-rules/group-by-fields`           | поля группировки (`{items, count}`)       | entities/correlation-rule |
| GET    | `/correlation-rules/scenario-types`            | справочник `scenario_type` (`{items:[{value,label}], count}`); в форме — всплывающий `SearchSelect` с поиском, можно ввести своё значение | entities/correlation-rule |
| POST   | `/correlation-rules/`                          | создать (201, схема ответа не описана)    | features/correlation-rule/upsert |
| PUT    | `/correlation-rules/{id}`                      | обновить                                  | features/correlation-rule/upsert |
| POST   | `/correlation-rules/test`                      | `{rule, incidents}` → `{matched, scenario_type, severity, confidence, recommendations}` | features/correlation-rule/upsert |
| PATCH  | `/correlation-rules/{id}/status`               | вкл/выкл (`{enabled}`)                    | features/correlation-rule/toggle-status |
| DELETE | `/correlation-rules/{id}`                      | удалить (`{correlation_id, deleted}`)     | features/correlation-rule/delete |
| GET    | `/supersession-rules/`                         | список правил подавления                  | entities/suppression-rule |
| GET    | `/supersession-rules/{id}`                     | правило подавления                        | entities/suppression-rule |
| GET    | `/supersession-rules/suppression-match-fields` | метаданные полей match                    | entities/suppression-rule |
| POST   | `/supersession-rules/`                         | создать (`{success, rule}`, id выдаёт backend) | features/suppression-rule/upsert |
| PUT    | `/supersession-rules/{id}`                     | обновить: поля action плоско; severity, action.attack_type и enabled не меняются | features/suppression-rule/upsert |
| POST   | `/supersession-rules/test`                     | `{rule, incident}` → `{matched, mode, reason, result}` | features/suppression-rule/upsert |
| PATCH  | `/supersession-rules/{id}/status`              | вкл/выкл (`{enabled}`)                    | features/suppression-rule/toggle-status |
| DELETE | `/supersession-rules/{id}`                     | удалить (`{success, suppression_id}`)     | features/suppression-rule/delete |
| GET    | `/ioc/`                                        | список IoC                                | entities/ioc          |
| GET    | `/ioc/{id}`                                    | IoC                                       | entities/ioc          |
| POST   | `/ioc/`                                        | создать                                   | features/ioc-create   |
| PATCH  | `/ioc/{id}` (без тела)                         | отметить просмотренным                    | features/ioc-mark-viewed |
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
| GET    | `/sources/`                                    | список источников                         | entities/source       |
| GET    | `/sources/{id}`                                | источник                                  | entities/source       |
| GET    | `/sources/{id}/health`                         | состояние: events_5m, eps_5m, lag, status (опрос раз в 30 с) | entities/source |
| GET    | `/sources/{id}/sample-events?size=`            | примеры raw-событий + `detected_fields`   | entities/source       |
| POST   | `/sources/`                                    | создать                                   | features/source-upsert |
| PUT    | `/sources/{id}`                                | обновить                                  | features/source-upsert |
| DELETE | `/sources/{id}`                                | удалить                                   | features/source-delete |
| GET    | `/normalization-profiles/`                     | профили нормализации (`items`, `count`)   | entities/normalization-profile |
| GET    | `/normalization-profiles/{name}`               | профиль                                   | entities/normalization-profile |
| GET    | `/normalization-profiles/fields`               | каталог полей SIEM (`items`, `categories`) | entities/normalization-profile |
| POST   | `/normalization-profiles/test`                 | применить профиль к raw-событию без сохранения | features/normalization-profile/test |
| POST   | `/normalization-profiles/`                     | создать (занятое имя → 500)               | features/normalization-profile/upsert |
| PUT    | `/normalization-profiles/{name}`               | обновить                                  | features/normalization-profile/upsert |
| DELETE | `/normalization-profiles/{name}`               | удалить (generic-профили нельзя)          | features/normalization-profile/delete |
| GET    | `/audits/`                                     | журнал аудита                             | entities/audit        |
| GET    | `/audits/{id}`                                 | запись аудита (с правилом)                | entities/audit        |
| GET    | `/audits/correlation-rules`                    | история всех правил корреляции (`action`, `author_id`, limit < 20) → `{total, has_next, items}` | entities/audit |
| GET    | `/audits/correlation-rules/rule/{correlation_id}` | история одного правила корреляции (`action`) | entities/audit (`useCorrelationRuleAudits`) |
| GET    | `/audits/correlation-rules/{audit_id}`         | версия правила + `changes: [{field, old, new}]` | entities/audit (`useCorrelationAudit`) |
| GET    | `/audits/rule/{rule_id}`                       | история изменений правила (`{total, items}` с `author`, limit < 20) | entities/audit (`useRuleAudits`, `AuditTimeline`) |
| GET    | `/mitre/mitre`                                 | техники MITRE ATT&CK                      | entities/mitre-technique |
| GET    | `/mitre/{mitre_id}`                            | техника MITRE (та же схема `MitreTechnique`) | entities/mitre-technique |
| POST   | `/mitre/sync-mitre`                            | синхронизация MITRE                       | features/mitre-sync   |
| GET    | `/attack-types/`                               | справочник типов атак                     | entities/attack-type  |
| GET    | `/attack-types/attach-group`                   | инциденты одного `source_ip` + группировка по типам атак (page/size) | entities/attack-type  |

> Все пути в `entities/*/api` начинаются с `/`.

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
| `ADMIN`   | `/admin` («Главная») | весь `/admin/*` |
| `ANALYST` | `/analyst`        | заглушка        |
| `VIEWER`  | `/viewer`         | заглушка        |

## 7. Маршруты

| URL                                          | View                           | Примечание |
| -------------------------------------------- | ------------------------------ | ---------- |
| `/`                                          | —                              | `redirect(routes.login)` |
| `/login`                                     | `views/login`                  | |
| `/auth`                                      | `views/register`               | регистрация |
| `/admin`                                    | `views/home`                   | «Главная», заглушка |
| `/admin/incidents`, `/[id]`                  | `views/incident*`              | «Инциденты»; плюсик в строке списка (вся строка не кликабельна) → `/ip/[sourceIp]` (или сразу `/[id]`, если source_ip нет) |
| `/admin/incidents/ip/[sourceIp]`             | `views/source-ip-incidents*`   | все инциденты source_ip; из списка открывается модалкой (`@modal/(.)incidents/ip`); при прямом заходе/F5 полная страница рисует список инцидентов подложкой и ту же модалку (закрытие → `replace` на список), стрелка в строке → `/[id]`; параметр декодируется в route-файле |
| `/admin/scenarios`, `/[scenarioId]`          | `views/scenario*`              | «Сценарии»: строка списка раскрывается только по плюсику (карточки сценария + связанные инциденты из `/scenarios/{id}`); клик по id связанного инцидента → `/admin/incidents/ip/[sourceIp]` |
| `/admin/ioc`, `/new`, `/[id]`                | `views/ioc*`                   | «Threat Intelligence»; как в MITRE: таблица в `app/(dashboard)/admin/ioc/layout.tsx` → `IocLayout`, карточка IOC открывается справа по клику на значение (`/new` рендерится без таблицы); id декодируется в route-файле |
| `/admin/mitre`, `/[mitreId]`                 | `views/mitre`, `views/mitre-detail` | «MITRE ATT&CK»; таблица живёт в `app/(dashboard)/admin/mitre/layout.tsx` → `MitreLayout` (поиск и страница не сбрасываются), карточка техники открывается справа, таблица при этом компактная; id декодируется в route-файле |
| `/admin/events`, `/[index_name]/[event_id]`  | `views/event*`, `views/event-modal` | «Raw data»; карточка события из списка открывается модалкой (`@modal/(.)events/...`); параметры декодируются в route-файле |
| `/admin/organizations`, `/new`, `/[organization_id]`, `/[organization_id]/edit` | `views/organization*` | «Организации» (раньше «Кампании»); как в MITRE: таблица в `app/(dashboard)/admin/organizations/layout.tsx` → `OrganizationsLayout`, карточка организации открывается справа по клику на строку; `/new` и `/[id]/edit` рендерятся без таблицы; id декодируется в route-файле |
| `/admin/sources`, `/new`, `/[source_id]`, `/[source_id]/edit` | `views/source*` | «Источники» (макет `public/images/sources.jpeg`); таблица и фильтры в `app/(dashboard)/admin/sources/layout.tsx` → `SourcesLayout` → `widgets/sources/list`, карточка (`widgets/sources/details`) открывается справа; «Синхронизировать» — перезапрос `sourceKeys.all` (эндпоинта синхронизации нет), «Качество данных» — заполненность `detected_fields` по выборке `sample-events`; удаление — на странице редактирования; id декодируется в route-файле |
| `/admin/normalization-profiles`, `/new[?copy=<name>]`, `/[profile_name]`, `/[profile_name]/edit` | `views/normalization-profile*` | «Профили нормализации» (макет `public/images/normalizations-profile.jpeg`); как «Источники»: таблица в layout → `widgets/normalization/list`, карточка (`widgets/normalization/details`) справа с вкладками «Сопоставление полей», «Тест профиля», «JSON-просмотр»; «Дублировать» — `/new?copy=<name>`; имя профиля при редактировании не меняется |
| `/admin/normalization-fields` | `views/normalization-fields` | «Поля нормализации» — каталог `GET /normalization-profiles/fields` |
| `/admin/rules`, `/new[?copy=<id>]`, `/[slug][?tab=test\|history]` | `views/rule*`       | «Правила обнаружения» — отдельный пункт сайдбара (макет `public/images/detect-rules.jpeg`); таблица, фильтры, счётчики и массовые действия в `app/(dashboard)/admin/rules/layout.tsx` → `RulesLayout` → `widgets/rules/list`; форма правила (`features/rule-upsert` → `RuleForm`, вкладки Основное/Условия/Классификация/MITRE/Тестирование) открывается справа и для `/new`, и для `/[slug]`; id декодируется в route-файле |
| `/admin/correlation-rules`, `/new[?copy=<id>]`, `/[correlation_id][?tab=test\|history]` | `views/correlation-rule*` | «Правила корреляции» — отдельный пункт сайдбара (макет `public/images/correlation-rules.jpeg`); как «Правила обнаружения»: таблица в layout → `widgets/correlation-rules/list`, форма (`features/correlation-rule/upsert`, вкладки Основное/Условия/Действия/Тестирование/История) справа; id декодируется в route-файле |
| `/admin/supers`, `/new[?copy=<id>]`, `/[suppression_id][?tab=test]` | `views/suppression-rule*` | «Правила подавления» (макет `public/images/suppression-rules.jpeg`); как «Правила корреляции»: таблица в `app/(dashboard)/admin/supers/layout.tsx` → `widgets/suppression-rules/list`, форма (`features/suppression-rule/upsert`, вкладки Основное/Условия/Действие/Тестирование) справа; id декодируется в route-файле |
| `/admin/audit`, `/[id]`                      | `views/audit*`                 | «Администрирование» → аудит |
| `/admin/testRule`                            | `views/test-rule`              | заглушка |
| `/analyst`, `/viewer`                        | `views/analyst-home`, `views/viewer-home` | заглушки |

Навигация повторяет макет CERT-KG SIEM (Figma): пункты сайдбара — `widgets/sidebar/config/menu.ts`
(«Администрирование» закреплён внизу и раскрывается по клику: внутри «Правила обнаружения», «Правила корреляции»,
«Правила подавления», «Нормализация», «Аудит»; на маршрутах группы она открыта сразу).
Аудит лежит в route group `(administration)` (имя группы не попадает в URL); полосы вкладок у раздела нет.
«Организации» (раньше «Кампании») в UI — это сущность `organization` (backend `/organizations`).

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
1. **«Правила корреляции» (сверено с OpenAPI 2026-11-24):** без авторизации проверены только `/sequence`, `/group-by-fields` и `/scenario-types`
   (`group-by-fields` отдаёт `{items, count}`, а не массив — исправлено); список, карточка и мутации свёрстаны по схемам OpenAPI.
   Создание (`/new`, в т. ч. копия) — отдельная страница-конструктор на всю ширину (layout раздела не рисует таблицу),
   редактирование — та же форма в правой панели. Пять блоков: основное → условия (sequence) → параметры (окно, group_by,
   «Дополнительные параметры» с min_unique_categories) → результат → MITRE. Шаги sequence трёх типов
   (`model/useConditionCatalog.ts`): Detection Rule = `rule:<rule_id>` (формат из постановки, в OpenAPI не описан),
   Detection Category и Attack Type — значения без префикса. `mitre_ids` — необязательное поле
   `CorrelationRuleRequestCreateUpdateSchema` (сверено с OpenAPI 2026-11-25), значения из `/mitre/mitre`.
   Устаревшие значения старых правил (неизвестный scenario_type, group_by вне справочника, удалённое/отключённое правило
   обнаружения, отозванная техника) показываются с предупреждением; сохранение блокируют только отозванные техники.
   В модели backend нет названия, MITRE, организации и флага «учитывать порядок» из макета — в UI их нет;
   «Название» в таблице — `description`, 4-й счётчик вместо «С предупреждениями» — правила с высокой и критической критичностью.
   Вкладка «Тестирование» — `POST /correlation-rules/test`; «История» — `/audits/correlation-rules/*` (фильтр по действию, раскрытая запись показывает изменённые поля). Ручки истории под авторизацией — свёрстаны по OpenAPI. Контролы форм-панелей — `shared/ui/form/controls.tsx`.
3. **«Правила подавления» (сверено с OpenAPI 2026-11-25):** названия и «Тип исключения» на backend нет — «Название» = `description`, «Описание / Причина» = `reason`, тип выводится из заполненных условий match (`getExclusionType`). Счётчика «Сработавших», фильтра по организации и вкладки «История» из макета нет (нет данных и ручки аудита); 4-й счётчик — активные правила с `suppressed`. `created_at`/`updated_at` backend отдаёт `null`. PUT не меняет `severity`, `action.attack_type` и `enabled` — в форме редактирования первые два заблокированы, статус уходит отдельным `PATCH /status`. `POST /test`, `PATCH`, `DELETE` под авторизацией — свёрстаны по OpenAPI. Метаданные match ссылаются на `/reference/attack-types`, такой ручки нет — берём `/attack-types/`.
4. **Редактирования IoC в UI нет:** `PATCH /ioc/{id}` вызывается без тела и только отмечает IoC просмотренным (`features/ioc-mark-viewed`).
5. **Env:** `NEXT_BACK_URL` не задана, а `NEXT_API_URL`, `NEXT_IMAGE_URL` и `NEXT_PUBLIC_BACK_API_URL` не используются (раздел 3).
6. **Разные схемы пагинации** (`limit/offset` и `page/size`). Общие типы ответов можно вынести в `shared/api/types.ts`.
7. **Цвета захардкожены** (`#1E2B6D` и др.) в классах Tailwind на страницах, ещё не переведённых на макет CERT-KG SIEM. Палитра макета уже лежит в `@theme` в `globals.css` (`bg-brand`, `text-ink`, `border-line`…) — используйте её.
8. **Защита маршрутов только на клиенте** (раздел 6). Для server-side проверок — `proxy.ts`.
9. **Тестов нет.**
10. **«Главная» — заглушка**, макета для неё пока нет.
11. **«Источники»:** у backend нет эндпоинтов синхронизации и качества данных, а в ответах нет `created_at`/`updated_at` (в карточке «—»). Схемы ответов `/sources` в OpenAPI не описаны — типы сняты с реальных ответов. `widgets/sources` — группа слайсов (`list`, `details`), чтобы слой `widgets` не превышал лимит Steiger в 20 слайсов.
12. **«Профили нормализации»:** в ответах нет даты изменения (в макете «Обновлён» — не выводим). `features/normalization-profile` и `widgets/normalization` — группы слайсов из-за лимита Steiger. Сайдбар поддерживает подпункты (`children` в `widgets/sidebar/config/menu.ts`).
12. **Kibana и статус в карточке события:** в макете есть «Открыть в Kibana» и «Статус», но URL Kibana не настроен, а статуса у событий на backend нет — в UI их нет.
14. **«Правила обнаружения» (проверено на backend 2026-11-24):** схемы описаны в OpenAPI (`RuleESSchema`, `RuleRequestCreateUpdateSchema`); в ответе `category`, `attack_type`, `description`, `created_by`, `updated_by` могут быть `null`.
    Карточка правила: вкладка «История» (`?tab=history`, `GET /audits/rule/{id}`), кнопка «Удалить», автор и даты под заголовком. Аналитик сохраняет правила через `/rules/analyst/*`, но раздела аналитика в UI пока нет (`/analyst` — заглушка).
    `GET /rules/` принимает только `limit < 20`; фильтров по scope/категории/статусу/severity нет, поэтому раздел загружает все правила и фильтрует на клиенте.
    Одна запись в БД ломает список (500 на любой выборке, где она есть) — `fetchAllRules` перезапрашивает такую пачку по одному правилу и показывает, сколько не загрузилось.
    `?rule_id=` в `GET /rules/` возвращает страницу из одного правила или пустую — `ruleExists` проверяет занятость Rule ID перед созданием.
    `POST`/`PUT`/`DELETE /rules/admin/*` на момент проверки отвечали 500, проверить их ответы не удалось. «С предупреждением» из макета на backend нет — 4-й счётчик показывает critical-правила.
    Операторы условий backend: contains/equals/startswith/endswith (regex из макета не поддерживается); scope у правила один, а не список.
13. **Период в «Сценариях»:** в макете есть выбор дат, но `GET /scenarios/` не принимает `from_time/to_time` — в UI его нет, пока backend не добавит параметры.

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
