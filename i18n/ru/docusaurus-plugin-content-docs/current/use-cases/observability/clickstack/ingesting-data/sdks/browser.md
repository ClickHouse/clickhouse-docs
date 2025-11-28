---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'Браузерный SDK ClickStack — стек наблюдаемости ClickHouse'
title: 'Браузерный JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Браузерный SDK ClickStack позволяет инструментировать ваше фронтенд‑приложение для
отправки событий в ClickStack. Это позволяет просматривать сетевые
запросы и исключения вместе с событиями бэкенда в единой временной шкале.

Кроме того, он автоматически будет захватывать и коррелировать данные для воспроизведения сессий, чтобы
вы могли визуально, шаг за шагом, просматривать и отлаживать то, что видел пользователь при работе с вашим
приложением.

Это руководство охватывает интеграцию следующего:

* **Логи консоли**
* **Воспроизведение сессий**
* **Запросы XHR/Fetch/WebSocket**
* **Исключения**


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
    tracePropagationTargets: [/api.myapp.domain/i], // Используется для связывания трейсов от фронтенда с бэкенд-запросами
    consoleCapture: true, // Собирать логи консоли (по умолчанию false)
    advancedNetworkCapture: true, // Собирать полные HTTP-заголовки и тела запросов/ответов (по умолчанию false)
});
```

</TabItem>
<TabItem value="script_tag" label="Тег script">

**Установка через тег script (альтернативный вариант)**

Вы также можете подключить и установить скрипт через тег script вместо
установки через NPM. Это создаст глобальную переменную `HyperDX`, которую можно
использовать так же, как NPM-пакет.

Это рекомендуется, если ваш сайт сейчас не собирается с помощью бандлера (bundler).

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Используется для связывания трейсов от фронтенда с бэкенд-запросами
  });
</script>
```

</TabItem>
</Tabs>

### Параметры {#options}

- `apiKey` - Ваш ключ API ClickStack для приёма данных.
- `service` - Имя сервиса, под которым события будут отображаться в интерфейсе HyperDX.
- `tracePropagationTargets` - Список шаблонов регулярных выражений для сопоставления с HTTP-запросами
  с целью связывания трассировок фронтенда и бэкенда; добавляет дополнительный
  заголовок `traceparent` ко всем запросам, соответствующим любому из шаблонов. Должен
  быть установлен в домен вашего backend API (например, `api.yoursite.com`).
- `consoleCapture` - (необязательный) Собирать ли все логи консоли (по умолчанию `false`).
- `advancedNetworkCapture` - (необязательный) Собирать ли полные заголовки и тела
  запросов/ответов (по умолчанию `false`).
- `url` - (необязательный) URL коллектора OpenTelemetry, требуется только для
  самостоятельно развернутых инстансов.
- `maskAllInputs` - (необязательный) Маскировать ли все поля ввода при
  воспроизведении сеанса (по умолчанию `false`).
- `maskAllText` - (необязательный) Маскировать ли весь текст при воспроизведении сеанса (по умолчанию
  `false`).
- `disableIntercom` - (необязательный) Отключать ли интеграцию с Intercom (по умолчанию `false`)
- `disableReplay` - (необязательный) Отключать ли воспроизведение сеанса (по умолчанию `false`)

## Дополнительная настройка {#additional-configuration}

### Добавление информации о пользователе или метаданных

Добавление информации о пользователе позволит выполнять поиск и фильтрацию сеансов и событий
в интерфейсе HyperDX. Этот метод может быть вызван в любой момент в ходе клиентской сессии. Текущая
клиентская сессия и все события, отправленные после вызова, будут связаны
с информацией о пользователе.

`userEmail`, `userName` и `teamName` будут отображаться в интерфейсе сеансов с соответствующими
значениями, но их можно не указывать. Можно задать любые дополнительные значения
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

Если вы используете React, вы можете автоматически перехватывать ошибки, которые возникают внутри
React error boundary, передав ваш компонент error boundary
в функцию `attachToReactErrorBoundary`.

```javascript
// Импортируйте ErrorBoundary (в качестве примера используется react-error-boundary)
import { ErrorBoundary } from 'react-error-boundary';

// Это подключится к компоненту ErrorBoundary и будет перехватывать все ошибки,
// возникающие в любом его экземпляре.
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```


### Отправка пользовательских действий

Чтобы явно отслеживать конкретное событие приложения (например, регистрацию,
отправку формы и т. п.), вы можете вызвать функцию `addAction` с именем события
и необязательными метаданными.

Пример:

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Форма регистрации',
  formType: 'signup',
});
```


### Динамическое включение захвата сетевого трафика

Чтобы динамически включать или отключать захват сетевого трафика, вызывайте функцию `enableAdvancedNetworkCapture` или `disableAdvancedNetworkCapture` по мере необходимости.

```javascript
HyperDX.enableAdvancedNetworkCapture();
```


### Включение измерения времени загрузки ресурсов для CORS-запросов

Если ваше frontend-приложение отправляет API-запросы на другой домен, вы можете
при необходимости включить отправку заголовка [`Timing-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin) вместе с запросом. Это позволит ClickStack собирать детализированную
информацию о времени загрузки ресурсов для запроса, такую как DNS lookup, загрузка
ответа и т. д., с помощью [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming).

Если вы используете `express` вместе с пакетом `cors`, вы можете использовать следующий
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
