---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'Браузерный SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'Браузерный JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Браузерный SDK ClickStack позволяет инструментировать ваше frontend-приложение,
чтобы оно отправляло события в ClickStack. Это даёт возможность просматривать сетевые
запросы и исключения вместе с backend-событиями в единой временной шкале.

Кроме того, он автоматически захватывает и коррелирует данные воспроизведения сессий, чтобы вы могли пошагово просматривать и отлаживать то, что видел пользователь во время работы с вашим приложением.

В этом руководстве интегрируются следующие компоненты:

* **Console Logs**
* **Session Replays**
* **XHR/Fetch/Websocket Requests**
* **Exceptions**


## Начало работы {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="Импорт пакета" default>

**Установка через импорт пакета (рекомендуется)**

Используйте следующую команду для установки [браузерного пакета](https://www.npmjs.com/package/@hyperdx/browser).

```shell
npm install @hyperdx/browser
```

**Инициализация ClickStack**

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Настройте, чтобы связывать трассировки от фронтенда с запросами бэкенда
    consoleCapture: true, // Собирать логи консоли (по умолчанию false)
    advancedNetworkCapture: true, // Собирать полные HTTP-заголовки и тела запросов/ответов (по умолчанию false)
});
```

</TabItem>
<TabItem value="script_tag" label="Script Tag">

**Установка через Script Tag (альтернативный вариант)**

Вы также можете подключить и установить скрипт через script-тег вместо
установки через NPM. Это создаст глобальную переменную `HyperDX`, которую можно
использовать так же, как NPM-пакет.

Этот вариант рекомендуется, если ваш сайт сейчас не собирается с помощью bundler.

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Настройте, чтобы связывать трассировки от фронтенда с запросами бэкенда
  });
</script>
```

</TabItem>
</Tabs>

### Параметры {#options}

- `apiKey` - Ваш ключ API для приёма данных ClickStack (ingestion API key).
- `service` - Имя сервиса, под которым события будут отображаться в интерфейсе HyperDX.
- `tracePropagationTargets` - Список шаблонов регулярных выражений для сопоставления с HTTP-
  запросами, чтобы связывать трассировки фронтенда и бэкенда; добавляет
  дополнительный заголовок `traceparent` ко всем запросам, соответствующим любому из шаблонов. Должен
  быть установлен в домен вашего бэкенд-API (например, `api.yoursite.com`).
- `consoleCapture` - (Необязательно) Собирать все логи консоли (по умолчанию `false`).
- `advancedNetworkCapture` - (Необязательно) Собирать полные заголовки и тела
  запросов/ответов (по умолчанию `false`).
- `url` - (Необязательно) URL коллектора OpenTelemetry, требуется только для
  самостоятельно размещённых инсталляций.
- `maskAllInputs` - (Необязательно) Маскировать ли все поля ввода в записи
  сессии (по умолчанию `false`).
- `maskAllText` - (Необязательно) Маскировать ли весь текст в записи сессии (по
  умолчанию `false`).
- `disableIntercom` - (Необязательно) Отключить ли интеграцию с Intercom (по умолчанию `false`)
- `disableReplay` - (Необязательно) Отключить ли запись сессий (по умолчанию `false`)



## Дополнительная конфигурация

### Добавление информации о пользователе или метаданных

Добавление информации о пользователе позволит выполнять поиск и фильтрацию сеансов и событий
в интерфейсе HyperDX. Этот вызов можно сделать в любой момент в течение клиентского сеанса.
Текущий клиентский сеанс и все события, отправленные после вызова, будут связаны
с информацией о пользователе.

`userEmail`, `userName` и `teamName` заполнят интерфейс сеансов
соответствующими значениями, но являются необязательными. Можно указать любые другие дополнительные значения
и использовать их для поиска событий.

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Другие пользовательские свойства...
});
```

### Автоматический захват ошибок в React error boundary

Если вы используете React, вы можете автоматически отслеживать ошибки, которые возникают внутри
React error boundary, передав свой компонент error boundary
в функцию `attachToReactErrorBoundary`.

```javascript
// Импортируйте ErrorBoundary (в качестве примера используется react-error-boundary)
import { ErrorBoundary } from 'react-error-boundary';

// Это подключится к компоненту ErrorBoundary и будет перехватывать все ошибки,
// возникающие в любом его экземпляре.
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```

### Отправка пользовательских действий

Чтобы явно отслеживать конкретное событие приложения (например,
регистрацию, отправку формы и т.п.), вы можете вызвать функцию `addAction`
с именем события и необязательными метаданными для него.

Пример:

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Форма регистрации',
  formType: 'signup',
});
```

### Динамическое включение захвата сетевого трафика

Чтобы динамически включить или отключить захват сетевого трафика, вызовите функцию `enableAdvancedNetworkCapture` или `disableAdvancedNetworkCapture` по мере необходимости.

```javascript
HyperDX.enableAdvancedNetworkCapture();
```

### Включение измерения времени ресурсов для CORS-запросов

Если ваше фронтенд‑приложение выполняет API-запросы к другому домену, вы
можете опционально добавить к запросу заголовок [`Timing-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin). Это позволит ClickStack собирать детализированную
информацию о таймингах ресурсов для запроса, такую как разрешение DNS-имени,
загрузка ответа и т. д., с помощью [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming).

Если вы используете `express` с пакетами `cors`, вы можете использовать следующий
фрагмент кода, чтобы включить этот заголовок:

```javascript
var cors = require('cors');
var onHeaders = require('on-headers');

// ... весь ваш код

app.use(function (req, res, next) {
  onHeaders(res, function () {
    var allowOrigin = res.getHeader('Access-Control-Allow-Origin');
    if (allowOrigin) {
      res.setHeader('Timing-Allow-Origin', allowOrigin);
    }
  });
  next();
});
app.use(cors());
```
