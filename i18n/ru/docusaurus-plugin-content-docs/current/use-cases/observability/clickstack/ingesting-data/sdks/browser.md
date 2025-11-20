---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'Browser SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'JS для браузера'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Браузерный SDK ClickStack позволяет инструментировать ваше frontend‑приложение
для отправки событий в ClickStack. Это дает возможность просматривать сетевые
запросы и исключения вместе с backend‑событиями на единой временной шкале.

Кроме того, он автоматически будет собирать и сопоставлять данные воспроизведения сессий, чтобы вы могли визуально просматривать и отлаживать то, что видел пользователь при работе с вашим приложением.

В этом руководстве интегрируется следующее:

* **Логи консоли**
* **Воспроизведение сессий**
* **Запросы XHR/Fetch/WebSocket**
* **Исключения**


## Начало работы {#getting-started}

<br />

<Tabs groupId="install">
<TabItem value="package_import" label="Импорт пакета" default>

**Установка через импорт пакета (рекомендуется)**

Используйте следующую команду для установки [пакета browser](https://www.npmjs.com/package/@hyperdx/browser).

```shell
npm install @hyperdx/browser
```

**Инициализация ClickStack**

```javascript
import HyperDX from "@hyperdx/browser"

HyperDX.init({
  url: "http://localhost:4318",
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-frontend-app",
  tracePropagationTargets: [/api.myapp.domain/i], // Укажите для связывания трассировок фронтенда с запросами к бэкенду
  consoleCapture: true, // Захват логов консоли (по умолчанию false)
  advancedNetworkCapture: true // Захват полных заголовков и тел HTTP-запросов/ответов (по умолчанию false)
})
```

</TabItem>
<TabItem value="script_tag" label="Тег скрипта">

**Установка через тег скрипта (альтернативный способ)**

Вы также можете подключить и установить скрипт через тег скрипта вместо
установки через NPM. Это создаст глобальную переменную `HyperDX`, которую можно
использовать так же, как NPM-пакет.

Этот способ рекомендуется, если ваш сайт не использует сборщик.

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: "http://localhost:4318",
    apiKey: "YOUR_INGESTION_API_KEY",
    service: "my-frontend-app",
    tracePropagationTargets: [/api.myapp.domain/i] // Set to link traces from frontend to backend requests
  })
</script>
```

</TabItem>
</Tabs>

### Параметры {#options}

- `apiKey` — ваш ключ API приёма данных ClickStack.
- `service` — имя сервиса, под которым события будут отображаться в интерфейсе HyperDX.
- `tracePropagationTargets` — список регулярных выражений для сопоставления с HTTP-запросами
  с целью связывания трассировок фронтенда и бэкенда. Добавляет дополнительный
  заголовок `traceparent` ко всем запросам, соответствующим любому из шаблонов. Следует
  указать домен вашего бэкенд API (например, `api.yoursite.com`).
- `consoleCapture` — (необязательно) захват всех логов консоли (по умолчанию `false`).
- `advancedNetworkCapture` — (необязательно) захват полных заголовков и тел
  запросов/ответов (по умолчанию false).
- `url` — (необязательно) URL коллектора OpenTelemetry, требуется только для
  самостоятельно размещённых экземпляров.
- `maskAllInputs` — (необязательно) маскировать ли все поля ввода при воспроизведении
  сеанса (по умолчанию `false`).
- `maskAllText` — (необязательно) маскировать ли весь текст при воспроизведении
  сеанса (по умолчанию `false`).
- `disableIntercom` — (необязательно) отключить ли интеграцию с Intercom (по умолчанию `false`)
- `disableReplay` — (необязательно) отключить ли воспроизведение сеанса (по умолчанию `false`)


## Дополнительная конфигурация {#additional-configuration}

### Привязка информации о пользователе или метаданных {#attach-user-information-or-metadata}

Привязка информации о пользователе позволит вам искать и фильтровать сессии и события
в интерфейсе HyperDX. Эту функцию можно вызвать в любой момент во время клиентской сессии. Текущая
клиентская сессия и все события, отправленные после вызова, будут связаны
с информацией о пользователе.

Параметры `userEmail`, `userName` и `teamName` заполнят интерфейс сессий соответствующими
значениями, но их можно опустить. Любые другие дополнительные значения можно
указать и использовать для поиска событий.

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name
  // Другие пользовательские свойства...
})
```

### Автоматический перехват ошибок границ ошибок React {#auto-capture-react-error-boundary-errors}

Если вы используете React, вы можете автоматически перехватывать ошибки, возникающие внутри
границ ошибок React, передав компонент границы ошибок
в функцию `attachToReactErrorBoundary`.

```javascript
// Импортируйте ваш ErrorBoundary (мы используем react-error-boundary в качестве примера)
import { ErrorBoundary } from "react-error-boundary"

// Это подключится к компоненту ErrorBoundary и перехватит любые ошибки, которые возникают
// внутри любого его экземпляра.
HyperDX.attachToReactErrorBoundary(ErrorBoundary)
```

### Отправка пользовательских действий {#send-custom-actions}

Для явного отслеживания конкретного события приложения (например, регистрация, отправка
и т.д.) можно вызвать функцию `addAction` с именем события и необязательными
метаданными события.

Пример:

```javascript
HyperDX.addAction("Form-Completed", {
  formId: "signup-form",
  formName: "Signup Form",
  formType: "signup"
})
```

### Динамическое включение перехвата сетевого трафика {#enable-network-capture-dynamically}

Для динамического включения или отключения перехвата сетевого трафика просто вызовите функцию `enableAdvancedNetworkCapture` или `disableAdvancedNetworkCapture` по мере необходимости.

```javascript
HyperDX.enableAdvancedNetworkCapture()
```

### Включение измерения времени ресурсов для CORS-запросов {#enable-resource-timing-for-cors-requests}

Если ваше фронтенд-приложение выполняет API-запросы к другому домену, вы можете
опционально включить отправку [заголовка](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin) `Timing-Allow-Origin` с запросом. Это позволит ClickStack перехватывать детальную
информацию о времени выполнения запроса, такую как поиск DNS, загрузка ответа
и т.д., через [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming).

Если вы используете `express` с пакетом `cors`, можно использовать следующий
фрагмент кода для включения заголовка:

```javascript
var cors = require("cors")
var onHeaders = require("on-headers")

// ... весь ваш код

app.use(function (req, res, next) {
  onHeaders(res, function () {
    var allowOrigin = res.getHeader("Access-Control-Allow-Origin")
    if (allowOrigin) {
      res.setHeader("Timing-Allow-Origin", allowOrigin)
    }
  })
  next()
})
app.use(cors())
```
