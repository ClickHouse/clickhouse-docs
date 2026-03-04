---
slug: /use-cases/observability/clickstack/session-replay
title: "Воспроизведение сессий"
sidebar_label: "Воспроизведение сессий"
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: "Записывайте и воспроизводите пользовательские сессии в ClickStack, чтобы отлаживать проблемы фронтенда, понимать поведение пользователей и коррелировать активность браузера с логами и трейсами на бэкенде."
doc_type: 'guide'
keywords: ['clickstack', 'воспроизведение сессий', 'браузерный SDK', 'обсервабилити фронтенда', 'пользовательские сессии', 'отладка']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import session_replay from '@site/static/images/clickstack/session-replay/session-replay.png';
import replay_search from '@site/static/images/clickstack/session-replay/replay-search-view.png';
import trace_to_replay from '@site/static/images/clickstack/session-replay/trace-to-replay.png';
import clickpy_trace from '@site/static/images/clickstack/session-replay/clickpy-trace.gif';

Воспроизведение сессий в ClickStack захватывает и воссоздаёт взаимодействия пользователей с вашим веб-приложением, позволяя визуально воспроизвести в точности то, что пользователь видел и делал во время своей сессии. Вместо видеозаписи SDK фиксирует изменения DOM, движения мыши, клики, прокрутку, ввод с клавиатуры, логи консоли, сетевые запросы (XHR, Fetch, WebSocket) и исключения JavaScript, а затем воссоздаёт этот пользовательский опыт в браузере.

Поскольку воспроизведения сессий хранятся в ClickHouse вместе с логами, трейcами и метриками, вы можете за несколько кликов перейти от просмотра пользовательского опыта к анализу бэкенд-трейсов и запросов к базе данных, которые за ним стоят. Это делает воспроизведение сессий полезным для отладки проблем в продакшене, понимания поведения пользователей, выявления точек трения в UX и визуального подтверждения инцидентов, о которых сообщают в поддержку.


## Инструментирование вашего приложения \{#instrumentation\}

ClickStack полностью совместим с OpenTelemetry, поэтому вы можете отправлять браузерную телеметрию (трейсы, исключения) с помощью стандартного JavaScript SDK OpenTelemetry или любого из [языковых SDK ClickStack](/use-cases/observability/clickstack/sdks). Однако **для session replay требуется ClickStack Browser SDK** (`@hyperdx/browser`), который расширяет OpenTelemetry SDK возможностями записи сессий, захвата консоли и сетевых запросов. Если вам нужны только трейсы без session replay, любой совместимый с OTel браузерный SDK будет работать с ClickStack.

Примеры ниже используют ClickStack Browser SDK. Добавление session replay в ваше приложение включает всего три шага: установка пакета, инициализация SDK, после чего все действия пользователя автоматически записываются — дополнительные изменения в коде не требуются.

:::tip
Инициализируйте SDK в месте, которое гарантированно загружается при старте вашего приложения. Например, в приложении Next.js это может быть корневой `layout.js`. Это обеспечивает немедленный запуск записи сессий и захват полного пользовательского опыта.
:::

<Tabs groupId="install">
<TabItem value="npm" label="NPM" default>

```shell
npm install @hyperdx/browser
```

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
  url: 'http://your-otel-collector:4318',
  apiKey: 'YOUR_INGESTION_API_KEY', // не указывайте для Managed ClickStack
  service: 'my-frontend-app',
  tracePropagationTargets: [/api.myapp.domain/i],
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

</TabItem>
<TabItem value="yarn" label="Yarn">

```shell
yarn add @hyperdx/browser
```

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
  url: 'http://your-otel-collector:4318',
  apiKey: 'YOUR_INGESTION_API_KEY', // не указывайте для Managed ClickStack
  service: 'my-frontend-app',
  tracePropagationTargets: [/api.myapp.domain/i],
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

</TabItem>
<TabItem value="script_tag" label="Script Tag">

Для приложений, не использующих бандлер, подключите SDK напрямую через тег script. Это создаст глобальную переменную `HyperDX`, которую можно использовать так же, как пакет NPM.

```html
<script src="https://unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://your-otel-collector:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // не указывайте для Managed ClickStack
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i],
    consoleCapture: true,
    advancedNetworkCapture: true,
  });
</script>
```

</TabItem>
</Tabs>

:::note
Опция `tracePropagationTargets` ключевая для связывания session replay с бэкенд-трейсами — укажите здесь домен вашего API, чтобы включить полноценный распределённый трейсинг от фронтенда до бэкенда. Полный список опций SDK, включая настройки конфиденциальности, кастомные действия, React error boundaries и source maps, приведён в [справочнике по Browser SDK](/use-cases/observability/clickstack/sdks/browser).
:::

Browser SDK также поддерживает [маскирование инпутов и текста](/use-cases/observability/clickstack/sdks/browser#options) для приложений с повышенными требованиями к конфиденциальности, а также [привязку информации о пользователе](/use-cases/observability/clickstack/sdks/browser#attach-user-information-or-metadata), чтобы вы могли искать и фильтровать сессии по пользователю в интерфейсе ClickStack.

## Просмотр реплеев сессий \{#viewing-replays\}

Перейдите в раздел **Client Sessions** на левой боковой панели в интерфейсе ClickStack (HyperDX). В этом представлении перечислены все записанные браузерные сессии с указанием их длительности и количества событий.

<Image img={replay_search} alt="Поиск реплеев сессий" size="lg"/>

Нажмите кнопку воспроизведения у любой сессии, чтобы просмотреть её реплей. В представлении реплея реконструированный пользовательский опыт отображается справа, а таймлайн браузерных событий — сетевых запросов, логов консоли и ошибок — слева.

<Image img={session_replay} alt="Воспроизведение реплея сессии" size="lg"/>

Переключайтесь между режимами **Highlighted** и **All Events**, чтобы настроить уровень детализации, отображаемый на таймлайне. Ошибки помечаются красным цветом, а при клике на любое событие реплей переходит к соответствующему моменту сессии.

### От сессии к трейсу \{#session-to-trace\}

Когда вы выбираете сетевой запрос или ошибку на таймлайне сессии, вы можете перейти на вкладку **Trace**, чтобы отследить этот запрос через ваши backend-сервисы — просматривая связанные логи, спаны и запросы к базе данных, которые были вызваны этим действием пользователя.

Это работает, так как конфигурация `tracePropagationTargets` связывает спаны браузера со спанами сервера через заголовок `traceparent`, формируя единый распределённый трейc от клика пользователя до самой базы данных. Подробный пошаговый разбор этого на практике, включая инструментирование как frontend-, так и backend-частей, см. в статье [Instrumenting your NextJS application with OpenTelemetry and ClickStack](https://clickhouse.com/blog/instrumenting-nextjs-opentelemetry-clickstack).

<img src={clickpy_trace} alt="Переход от воспроизведения сессии к backend-трейсам в ClickStack" />

### От трассы к сессии \{#trace-to-session\}

Корреляция работает и в обратном направлении. При просмотре трассы в представлении **Search** щёлкните на неё, чтобы открыть подробную информацию о трассе, затем выберите вкладку **Session Replay**, чтобы увидеть, что именно видел и делал пользователь в момент формирования этой трассы. Это особенно полезно при расследовании ошибок или медленных запросов — вы можете начать с проблемы на стороне бэкенда и сразу увидеть, как происходящее выглядело для пользователя.

<Image img={trace_to_replay} alt="Представление трассы с воспроизведением сессии" size="lg"/>

## Как хранятся данные сессии \{#data-storage\}

Данные для воспроизведения сессий хранятся в отдельной таблице [`hyperdx_sessions`](/use-cases/observability/clickstack/ingesting-data/schemas#sessions) в ClickHouse, отдельно от логов и трейсов. Каждое событие сессии — это строка с полем `Body`, содержащим полезную нагрузку события, и отображением `LogAttributes`, в котором хранятся метаданные события. Столбцы `Body` и `LogAttributes` вместе содержат детали реальных событий сессии, которые используются для восстановления воспроизведения.

Полную информацию о схеме таблицы см. в разделе [Таблицы и схемы, используемые ClickStack](/use-cases/observability/clickstack/ingesting-data/schemas).

## Попробуйте на практике \{#try-it-out\}

Есть два способа увидеть session replay в действии:

- **Живой пример** — перейдите на [clickpy.clickhouse.com](https://clickpy.clickhouse.com), повзаимодействуйте с приложением, затем посмотрите запись своей сессии на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) в источнике **ClickPy Sessions**. Подробности об инструментации ClickPy см. в записи в блоге [Instrumenting your NextJS application with OpenTelemetry and ClickStack](https://clickhouse.com/blog/instrumenting-your-app-with-otel-clickstack).
- **Локальный демонстрационный пример** — [Session Replay Demo](/use-cases/observability/clickstack/example-datasets/session-replay-demo) пошагово показывает, как проинструментировать демонстрационное приложение, включая локальный запуск ClickStack и просмотр записей сессий.

## Узнать больше \{#learn-more\}

- [Демонстрация Session Replay](/use-cases/observability/clickstack/example-datasets/session-replay-demo) — интерактивное локальное демо‑приложение с пошаговыми инструкциями
- [Справочник по Browser SDK](/use-cases/observability/clickstack/sdks/browser) — все варианты конфигурации SDK, source maps, пользовательские действия и расширенные настройки
- [Поиск](/use-cases/observability/clickstack/search) — синтаксис поиска для фильтрации сессий и событий
- [Дашборды](/use-cases/observability/clickstack/dashboards) — создание визуализаций и дашбордов на основе данных сессий и трассировок
- [Оповещения](/use-cases/observability/clickstack/alerts) — настройка оповещений по ошибкам, задержкам и другим сигналам
- [Архитектура ClickStack](/use-cases/observability/clickstack/architecture) — как ClickHouse, HyperDX и OTel collector интегрируются друг с другом