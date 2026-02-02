---
slug: /use-cases/observability/clickstack/integrations/nodejs-traces
title: 'Мониторинг трейсов Node.js с помощью ClickStack'
sidebar_label: 'Трейсы Node.js'
pagination_prev: null
pagination_next: null
description: 'Мониторинг трейсов Node.js-приложений с помощью ClickStack'
doc_type: 'guide'
keywords: ['Node.js', 'трейсы', 'OTEL', 'ClickStack', 'распределённый трейсинг']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import api_key from '@site/static/images/clickstack/api-key.png';
import search_view from '@site/static/images/clickstack/nodejs/traces-search-view.png';
import trace_view from '@site/static/images/clickstack/nodejs/trace-view.png';
import finish_import from '@site/static/images/clickstack/nodejs/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/nodejs/example-traces-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг трассировок Node.js с помощью ClickStack \{#nodejs-traces-clickstack\}

:::note[TL;DR]
В этом руководстве показано, как собирать распределённые трассировки из вашего приложения Node.js и визуализировать их в ClickStack с использованием автоматической инструментации OpenTelemetry. Вы узнаете, как:

- Установить и настроить OpenTelemetry для Node.js с автоматической инструментацией
- Отправлять трассировки на OTLP endpoint ClickStack
- Проверять, что трассировки отображаются в HyperDX
- Использовать готовый дашборд для визуализации производительности приложения

Демонстрационный набор данных с примерами трассировок доступен, если вы хотите протестировать интеграцию, прежде чем инструментировать ваше боевое приложение.

Требуемое время: 10–15 минут
:::

## Интеграция с существующим приложением Node.js \{#existing-nodejs\}

В этом разделе рассматривается добавление распределённой трассировки в существующее приложение Node.js с использованием автоматической инструментации OpenTelemetry.

Если вы хотите протестировать интеграцию до настройки собственного приложения, вы можете воспользоваться нашей предварительно настроенной средой и тестовыми данными в [разделе демонстрационного набора данных](#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Развёрнутый экземпляр ClickStack с доступными OTLP-эндпоинтами (порты 4317/4318)
- Существующее Node.js‑приложение (Node.js 14 или выше)
- Менеджер пакетов npm или yarn
- Имя хоста или IP‑адрес ClickStack

<VerticalStepper headerLevel="h4">

#### Установите и настройте OpenTelemetry \{#install-configure\}

Установите пакет `@hyperdx/node-opentelemetry` и инициализируйте его в начале работы приложения. Подробные шаги по установке см. в [руководстве по Node.js SDK](/use-cases/observability/clickstack/sdks/nodejs#getting-started).

#### Получите ClickStack API key \{#get-api-key\}

API key для отправки трейсов на OTLP-эндпоинт ClickStack.

1. Откройте HyperDX по вашему URL‑адресу ClickStack (например, http://localhost:8080)
2. Создайте учётную запись или при необходимости войдите в уже существующую
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **ключ API для приёма данных API key**

<Image img={api_key} alt="ClickStack API Key"/>

#### Запустите ваше приложение \{#run-application\}

Запустите ваше Node.js‑приложение с установленными переменными окружения:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

#### Сгенерируйте немного трафика \{#generate-traffic\}

Выполните запросы к вашему приложению, чтобы сгенерировать трейсы:

```bash
# Простые запросы
curl http://localhost:3000/
curl http://localhost:3000/api/users
curl http://localhost:3000/api/products

# Имитация нагрузки
for i in {1..100}; do curl -s http://localhost:3000/ > /dev/null; done
```

#### Проверьте трейсы в HyperDX \{#verify-traces\}

После настройки войдите в HyperDX и убедитесь, что трейсы поступают. Вы должны увидеть что‑то подобное. Если вы не видите трейсы, попробуйте изменить диапазон времени:

<Image img={search_view} alt="Traces search view"/>

Нажмите на любой трейс, чтобы открыть детализированное представление со спанами, временными характеристиками и атрибутами:

<Image img={trace_view} alt="Individual trace view"/>

</VerticalStepper>

## Демонстрационный датасет \{#demo-dataset\}

Для пользователей, которые хотят протестировать трассировку Node.js в ClickStack перед тем, как инструментировать свои продакшн‑приложения, мы предоставляем пример датасета с заранее сгенерированными трассами Node.js‑приложения и реалистичными паттернами трафика.

<VerticalStepper headerLevel="h4">

#### Загрузите пример датасета \{#download-sample\}

Загрузите файл с примерами трасс:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nodejs/nodejs-traces-sample.json
```

#### Запустите ClickStack \{#start-clickstack\}

Если ClickStack ещё не запущен, запустите его с помощью:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD= \
  clickhouse/clickstack-all-in-one:latest
```

#### Получите ClickStack API key \{#get-api-key-demo\}

Ключ API для отправки трасс на OTLP‑эндпоинт ClickStack.

1. Откройте HyperDX по URL вашего ClickStack (например, http://localhost:8080)
2. Создайте аккаунт или войдите, если он уже есть
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **ключ API для приёма данных API key**

<Image img={api_key} alt="Ключ API ClickStack"/>

Задайте ключ API в переменную окружения:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### Отправьте трассы в ClickStack \{#send-traces\}

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

Вы должны увидеть ответ вида `{"partialSuccess":{}}`, что означает, что трассы были успешно отправлены.

#### Проверьте трассы в HyperDX \{#verify-demo-traces\}

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свой аккаунт (при необходимости сначала создайте аккаунт)
2. Перейдите в представление **Search** и установите источник **Traces**
3. Установите диапазон времени **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

<Image img={search_view} alt="Представление поиска трасс"/>

<Image img={trace_view} alt="Просмотр отдельной трассы"/>

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демонстрационные трассы независимо от вашего местоположения. После того как вы увидите трассы, вы можете сузить диапазон до 24‑часового периода для более наглядной визуализации.
:::

</VerticalStepper>

## Дашборды и визуализация \{#dashboards\}

Чтобы помочь вам начать мониторинг производительности приложения Node.js, мы предоставляем предварительно настроенный дашборд с основными визуализациями трейсов.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nodejs-traces-dashboard.json')} download="nodejs-traces-dashboard.json" eventName="docs.nodejs_traces_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда \{#download-dashboard\}

#### Импортируйте предварительно настроенный дашборд \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу (под значком с тремя точками)

<Image img={import_dashboard} alt="Import Dashboard"/>

3. Загрузите файл `nodejs-traces-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Finish import"/>

#### Дашборд будет создан со всеми предварительно настроенными визуализациями \{#created-dashboard\}

<Image img={example_dashboard} alt="Example dashboard"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** (при необходимости скорректируйте под свой часовой пояс). Импортированный дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

</VerticalStepper>

## Устранение неполадок \{#troubleshooting\}

### Демонстрационные трассы не появляются при отправке через curl \{#demo-traces-not-appearing\}

Если вы отправили трассы с помощью curl, но не видите их в HyperDX, попробуйте повторно отправить их:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

Это известная проблема, возникающая при использовании демонстрационного примера с curl, и она не затрагивает инструментированные продакшен‑приложения.


### В HyperDX не отображаются трассировки \{#no-traces\}

**Проверьте значения переменных окружения:**

```bash
echo $CLICKSTACK_API_KEY
# Should output your API key

echo $OTEL_EXPORTER_OTLP_ENDPOINT
# Should output http://localhost:4318 or your ClickStack host
```

**Проверьте сетевое подключение:**

```bash
curl -v http://localhost:4318/v1/traces
```

Должно успешно подключиться к endpoint OTLP.

**Проверьте логи приложения:**
При запуске приложения найдите сообщения об инициализации OpenTelemetry. SDK HyperDX должен вывести подтверждение успешной инициализации.


## Следующие шаги \{#next-steps\}

Если вы хотите пойти дальше, вот несколько шагов для экспериментов с вашей панелью мониторинга:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных метрик (уровни ошибок, пороги задержки)
- Создайте дополнительные дашборды для конкретных сценариев (мониторинг API, события безопасности)

## Переход в продакшен \{#going-to-production\}

В этом руководстве используется HyperDX SDK, который отправляет трейсы напрямую в OTLP-эндпоинт ClickStack. Такой подход хорошо подходит для разработки, тестирования, а также небольших и средних продакшен-развёртываний.
Для более крупных продакшен-сред или если вам требуется дополнительный контроль над телеметрическими данными, рассмотрите развертывание собственного OpenTelemetry Collector в режиме агента. 
См. раздел [Приём данных с помощью OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для ознакомления с вариантами продакшен-развёртывания и примерами конфигурации коллектора.