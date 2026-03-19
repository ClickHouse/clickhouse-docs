---
slug: /use-cases/observability/clickstack/example-datasets/session-replay-demo
title: 'Демонстрация воспроизведения сессий'
sidebar_position: 4
pagination_prev: null
pagination_next: null
description: 'Интерактивное демонстрационное приложение, показывающее, как настроить инструментирование веб-приложения для воспроизведения сессий в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'воспроизведение сессий', 'браузерный SDK', 'демо', 'обсервабилити', 'инструментирование']
---

import Image from '@theme/IdealImage';
import api_key from '@site/static/images/clickstack/api-key.png';
import demo_app from '@site/static/images/clickstack/session-replay/demo-app.png';
import session_replay from '@site/static/images/clickstack/session-replay/session-replay.png';
import replay_search from '@site/static/images/clickstack/session-replay/replay-search-view.png';

:::note[Если кратко]
В этом руководстве описывается процесс инструментирования веб-приложения для записи и воспроизведения сессий с помощью ClickStack Browser SDK. В отличие от других демонстрационных наборов данных, которые загружают заранее сгенерированные данные, это демо предоставляет интерактивное приложение, в котором вы генерируете данные сессий своими действиями.

Ориентировочное время: 10–15 минут
:::


## Обзор \{#overview\}

[Демонстрационное приложение для session replay](https://github.com/ClickHouse/clickstack-session-replay-demo) — это просмотрщик документации, написанный на чистом JavaScript. Оно демонстрирует, насколько минимальным может быть инструментирование session replay: один тег со скриптом и один вызов инициализации автоматически фиксируют все действия пользователя.

Репозиторий содержит две ветки:

- **`main`** — полностью инструментированная и готовая к немедленному использованию
- **`pre-instrumented`** — чистая версия без инструментирования, с комментариями в коде, указывающими, где его добавить

В этом руководстве сначала используется ветка `main`, чтобы увидеть session replay в действии, а затем подробно рассматривается код инструментирования, чтобы вы могли применить тот же подход в своём приложении.

Для ознакомления с тем, что такое session replay и как он интегрируется в ClickStack, см. страницу функции [Session Replay](/use-cases/observability/clickstack/session-replay).

## Предварительные требования \{#prerequisites\}

- Установлены Docker и Docker Compose
- Порты 3000, 4317, 4318 и 8080 должны быть свободны

## Запуск демо \{#running-the-demo\}

<VerticalStepper headerLevel="h3">

### Клонирование репозитория \{#clone-repository\}

```shell
git clone https://github.com/ClickHouse/clickstack-session-replay-demo
cd clickstack-session-replay-demo
```

### Запуск ClickStack \{#start-clickstack\}

```shell
docker-compose up -d clickstack
```

### Получение вашего ключа API \{#get-api-key\}

1. Откройте HyperDX по адресу [http://localhost:8080](http://localhost:8080)
2. Создайте аккаунт или войдите, если он уже есть
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **ключ API для приёма данных API key**

<Image img={api_key} alt="ClickStack API Key"/>

5. Установите его как переменную окружения:

```shell
export CLICKSTACK_API_KEY='your-api-key-here'
```

### Запуск демонстрационного приложения \{#start-demo-app\}

```shell
docker-compose --profile demo up demo-app
```

:::note
Убедитесь, что вы выполняете эту команду в том же терминале, в котором экспортировали переменную `CLICKSTACK_API_KEY`.
:::

Откройте [http://localhost:3000](http://localhost:3000) в браузере и взаимодействуйте с приложением: ищите темы, фильтруйте по категориям, просматривайте примеры кода и добавляйте элементы в закладки.

<Image img={demo_app} alt="Демонстрационное приложение для воспроизведения сессий"/>

Все взаимодействия автоматически записываются ClickStack Browser SDK.

### Просмотр воспроизведения вашей сессии \{#view-session-replay\}

Вернитесь в HyperDX по адресу [http://localhost:8080](http://localhost:8080) и перейдите в раздел **Client Sessions** в левой боковой панели.

<Image img={replay_search} alt="Поиск воспроизведений сессий"/>

Вы должны увидеть свою сессию с указанием её продолжительности и количества событий. Нажмите кнопку ▶️, чтобы воспроизвести её.

<Image img={session_replay} alt="Воспроизведение сессии"/>

Переключайтесь между режимами **Highlighted** и **All Events**, чтобы настроить уровень детализации на временной шкале.

</VerticalStepper>

## Инструментирование \{#instrumentation\}

Демонстрационное приложение показывает, как мало кода требуется для включения воспроизведения сессий (session replay). Достаточно всего двух изменений в приложении:

**1. Подключите SDK (`app/public/index.html`):**

```html
<script src="https://unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
```

**2. Инициализируйте ClickStack (`app/public/js/app.js`):**

```javascript
window.HyperDX.init({
  url: 'http://localhost:4318',
  apiKey: window.CLICKSTACK_API_KEY,
  service: 'clickhouse-session-replay-demo',
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

Остальной код — это стандартный прикладной код. SDK автоматически собирает все взаимодействия пользователя, логи консоли, сетевые запросы и ошибки — дополнительная инструментация не требуется.


### Попробуйте сами \{#try-it-yourself\}

Чтобы инструментировать приложение с нуля, переключитесь на ветку `pre-instrumented`:

```shell
git checkout pre-instrumented
```

Эта ветка содержит то же приложение, но без какого-либо инструментирования ClickStack. Комментарии в коде в `app/public/index.html` и `app/public/js/app.js` указывают, куда именно нужно добавить два приведённых выше фрагмента кода. После добавления перезапустите демонстрационное приложение, и ваши взаимодействия начнут отображаться в ClickStack.


## Устранение неполадок \{#troubleshooting\}

### Сеансы не отображаются в HyperDX \{#sessions-not-appearing\}

1. Проверьте консоль браузера на наличие ошибок
2. Убедитесь, что ClickStack запущён: `docker-compose ps`
3. Убедитесь, что установлен API-ключ: `echo $CLICKSTACK_API_KEY`
4. Измените временной диапазон в представлении Client Sessions (попробуйте **Last 15 minutes**)
5. Выполните принудительное обновление страницы в браузере: `Cmd+Shift+R` (Mac) или `Ctrl+Shift+R` (Windows/Linux)

### Ошибки 401 Unauthorized \{#401-errors\}

API-ключ указан некорректно. Убедитесь, что вы:

1. Экспортировали его в терминале: `export CLICKSTACK_API_KEY='your-key'`
2. Запустили демо-приложение в **том же терминале**, где вы его экспортировали
3. Получили ключ в интерфейсе HyperDX (а не использовали случайно сгенерированную строку)

## Очистка \{#cleanup\}

Остановите сервисы:

```bash
docker-compose down
```

Удалить все данные:

```bash
docker-compose down -v
```


## Подробнее \{#learn-more\}

- [Session Replay](/use-cases/observability/clickstack/session-replay) — обзор функции, варианты SDK и настройки конфиденциальности
- [Browser SDK Reference](/use-cases/observability/clickstack/sdks/browser) — полный перечень возможностей SDK и расширенные настройки
- [ClickStack Getting Started](/use-cases/observability/clickstack/getting-started) — разверните ClickStack и выполните приём ваших первых данных
- [All Sample Datasets](/use-cases/observability/clickstack/sample-datasets) — другие примерные наборы данных и руководства