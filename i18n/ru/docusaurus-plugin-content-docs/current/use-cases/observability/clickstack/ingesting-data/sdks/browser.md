---
'slug': '/use-cases/observability/clickstack/sdks/browser'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': 'Браузерный SDK для ClickStack - Стек OBSERVABILITY ClickHouse'
'title': 'Браузер JS'
'doc_type': 'guide'
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

SDK браузера ClickStack позволяет вам инструментировать ваше фронтенд-приложение для отправки событий в ClickStack. Это позволяет вам просматривать сетевые запросы и исключения наряду с событиями бэкенда в одной временной шкале.

Кроме того, он автоматически собирает и коррелирует данные воспроизведения сессий, так что вы можете визуально пройтись и отладить то, что пользователь видел, используя ваше приложение.

Этот гид интегрирует следующее:

- **Логи консоли**
- **Воспроизведения сессий**
- **Запросы XHR/Fetch/Websocket**
- **Исключения**

## Начало работы {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="Импорт пакета" default>

**Установка через импорт пакета (Рекомендуется)**

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
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
    consoleCapture: true, // Capture console logs (default false)
    advancedNetworkCapture: true, // Capture full HTTP request/response headers and bodies (default false)
});
```

</TabItem>
<TabItem value="script_tag" label="Тег скрипта">

**Установка через тег скрипта (Альтернатива)**

Вы также можете включить и установить скрипт через тег скрипта вместо установки через NPM. Это создаст глобальную переменную `HyperDX`, которая может использоваться так же, как и пакет NPM.

Это рекомендуется, если ваш сайт в настоящее время не построен с использованием сборщика.

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
  });
</script>
```

</TabItem>
</Tabs>

### Опции {#options}

- `apiKey` - Ваш ключ API для приемки ClickStack.
- `service` - Имя сервиса, которое будет отображаться в интерфейсе HyperDX.
- `tracePropagationTargets` - Список регулярных выражений для сопоставления с HTTP запросами для связывания фронтенд и бэкенд трасс, он добавит дополнительный заголовок `traceparent` ко всем запросам, соответствующим любому из шаблонов. Это должно быть установлено на ваш домен API бэкенда (например, `api.yoursite.com`).
- `consoleCapture` - (Опционально) Захват всех логов консоли (по умолчанию `false`).
- `advancedNetworkCapture` - (Опционально) Захват полных заголовков и тел запросов/ответов (по умолчанию false).
- `url` - (Опционально) URL-адрес коллектора OpenTelemetry, необходим только для самоуправляемых экземпляров.
- `maskAllInputs` - (Опционально) Нужно ли маскировать все поля ввода в воспроизведении сессии (по умолчанию `false`).
- `maskAllText` - (Опционально) Нужно ли маскировать весь текст в воспроизведении сессии (по умолчанию `false`).
- `disableIntercom` - (Опционально) Нужно ли отключить интеграцию Intercom (по умолчанию `false`)
- `disableReplay` - (Опционально) Нужно ли отключить воспроизведение сессий (по умолчанию `false`)

## Дополнительная конфигурация {#additional-configuration}

### Присоединение информации о пользователе или метаданных {#attach-user-information-or-metadata}

Присоединение информации о пользователе позволит вам искать/фильтровать сессии и события в интерфейсе HyperDX. Это можно вызывать в любой момент в течение клиентской сессии. Текущая клиентская сессия и все события, отправленные после вызова, будут ассоциироваться с информацией о пользователе.

`userEmail`, `userName` и `teamName` будут заполнять интерфейс сессий соответствующими значениями, но могут быть опущены. Любые другие дополнительные значения могут быть указаны и использованы для поиска событий.

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### Автоматический захват ошибок границы ошибок React {#auto-capture-react-error-boundary-errors}

Если вы используете React, вы можете автоматически захватывать ошибки, которые происходят в пределах границ ошибок React, передав ваш компонент границы ошибок в функцию `attachToReactErrorBoundary`.

```javascript
// Import your ErrorBoundary (we're using react-error-boundary as an example)
import { ErrorBoundary } from 'react-error-boundary';

// This will hook into the ErrorBoundary component and capture any errors that occur
// within any instance of it.
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```

### Отправка пользовательских действий {#send-custom-actions}

Чтобы явно отслеживать конкретное событие приложения (например, регистрацию, отправку и т. д.), вы можете вызвать функцию `addAction` с именем события и опциональными метаданными события.

Пример:

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Signup Form',
  formType: 'signup',
});
```

### Включение захвата сети динамически {#enable-network-capture-dynamically}

Чтобы динамически включить или отключить захват сети, просто вызовите функцию `enableAdvancedNetworkCapture` или `disableAdvancedNetworkCapture` по мере необходимости.

```javascript
HyperDX.enableAdvancedNetworkCapture();
```

### Включение тайминга ресурсов для CORS запросов {#enable-resource-timing-for-cors-requests}

Если ваше фронтенд-приложение делает API-запросы к другому домену, вы можете по желанию включить заголовок `Timing-Allow-Origin`, который будет отправлен с запросом. Это позволит ClickStack захватывать детальную информацию о тайминге ресурсов для запроса, такую как DNS-lookup, скачивание ответа и т.д. через [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming).

Если вы используете `express` с пакетами `cors`, вы можете использовать следующий фрагмент для включения заголовка:

```javascript
var cors = require('cors');
var onHeaders = require('on-headers');

// ... all your stuff

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