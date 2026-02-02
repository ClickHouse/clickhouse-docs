---
slug: /use-cases/observability/clickstack/integrations/nodejs-traces
title: 'Мониторинг трейсов Node.js с помощью ClickStack'
sidebar_label: 'Трейсы Node.js'
pagination_prev: null
pagination_next: null
description: 'Мониторинг трейсов приложения Node.js с помощью ClickStack'
doc_type: 'guide'
keywords: ['Node.js', 'трейсы', 'OTel', 'ClickStack', 'распределённый трейсинг']
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


# Мониторинг трассировок Node.js с ClickStack \{#nodejs-traces-clickstack\}

:::note[Кратко]
Это руководство покажет, как собирать распределённые трассировки из вашего приложения Node.js и визуализировать их в ClickStack с помощью автоматической инструментации OpenTelemetry. Вы узнаете, как:

- Установить и настроить OpenTelemetry для Node.js с автоматической инструментацией
- Отправлять трассировки на OTLP-эндпоинт ClickStack
- Проверять, что трассировки отображаются в HyperDX
- Использовать готовую панель для визуализации производительности приложения

Демонстрационный набор данных с примерами трассировок доступен, если вы хотите протестировать интеграцию, прежде чем инструментировать ваше продакшн-приложение.

Требуемое время: 10–15 минут
:::

## Интеграция с существующим приложением Node.js \{#existing-nodejs\}

В этом разделе описывается добавление распределённого трассирования в существующее приложение Node.js с использованием автоматической инструментализации OpenTelemetry.

Если вы хотите протестировать интеграцию прежде чем настраивать собственное окружение, вы можете воспользоваться нашим предварительно настроенным окружением и примером данных в [разделе демонстрационного набора данных](#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack с доступными OTLP-эндпоинтами (порты 4317/4318)
- Существующее приложение на Node.js (Node.js 14 или выше)
- Менеджер пакетов npm или yarn
- Имя хоста или IP-адрес ClickStack

<VerticalStepper headerLevel="h4">

#### Установите и настройте OpenTelemetry \{#install-configure\}

Установите пакет `@hyperdx/node-opentelemetry` и инициализируйте его в начале работы вашего приложения. Подробные шаги по установке смотрите в [руководстве по Node.js SDK](/use-cases/observability/clickstack/sdks/nodejs#getting-started).

#### Получите ClickStack API key \{#get-api-key\}

API key для отправки трейсов на OTLP-эндпоинт ClickStack.

1. Откройте HyperDX по URL вашего ClickStack (например, http://localhost:8080)
2. Создайте аккаунт или войдите, если он уже есть
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **ключ API для приёма данных API key**

<Image img={api_key} alt="ClickStack API Key"/>

#### Запустите ваше приложение \{#run-application\}

Запустите ваше Node.js-приложение с установленными переменными окружения:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

#### Сгенерируйте трафик \{#generate-traffic\}

Отправьте запросы к вашему приложению, чтобы сгенерировать трейсы:

```bash
# Простые запросы
curl http://localhost:3000/
curl http://localhost:3000/api/users
curl http://localhost:3000/api/products

# Имитация нагрузки
for i in {1..100}; do curl -s http://localhost:3000/ > /dev/null; done
```

#### Проверьте трейсы в HyperDX \{#verify-traces\}

После настройки войдите в HyperDX и убедитесь, что трейсы поступают. Вы должны увидеть примерно следующее. Если вы не видите трейсы, попробуйте изменить диапазон времени:

<Image img={search_view} alt="Представление поиска трейсов"/>

Нажмите на любой трейc, чтобы открыть подробное представление со спанами, таймингом и атрибутами:

<Image img={trace_view} alt="Просмотр отдельного трейса"/>

</VerticalStepper>

## Демонстрационный набор данных \{#demo-dataset\}

Для пользователей, которые хотят протестировать трассировку Node.js с ClickStack до внедрения её в продакшен-приложения, мы предоставляем пример набора данных с предварительно сгенерированными трейсами Node.js-приложения и реалистичными шаблонами трафика.

<VerticalStepper headerLevel="h4">

#### Загрузите демонстрационный набор данных \{#download-sample\}

Скачайте файл с примером трейсов:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nodejs/nodejs-traces-sample.json
```

#### Запустите ClickStack \{#start-clickstack\}

Если у вас ещё не запущен ClickStack, запустите его командой:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD= \
  clickhouse/clickstack-all-in-one:latest
```

#### Получите ClickStack API key \{#get-api-key-demo\}

Ключ API для отправки трейсов на OTLP-эндпоинт ClickStack.

1. Откройте HyperDX по вашему URL ClickStack (например, http://localhost:8080)
2. Создайте аккаунт или войдите в систему при необходимости
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **ключ API для приёма данных API key**

<Image img={api_key} alt="ClickStack API Key"/>

Установите ключ API как переменную окружения:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### Отправьте трейсы в ClickStack \{#send-traces\}

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

Вы должны увидеть ответ вида `{"partialSuccess":{}}`, что означает успешную отправку трейсов.

#### Проверьте трейсы в HyperDX \{#verify-demo-traces\}

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свой аккаунт (возможно, сначала потребуется его создать)
2. Перейдите в представление **Search** и установите источник **Traces**
3. Установите временной диапазон **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

<Image img={search_view} alt="Traces search view"/>

<Image img={trace_view} alt="Individual trace view"/>

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**. Широкий временной диапазон гарантирует, что вы увидите демонстрационные трейсы независимо от вашего местоположения. Как только вы увидите трейсы, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>

## Дашборды и визуализация \{#dashboards\}

Чтобы помочь вам начать мониторинг производительности Node.js‑приложений, мы предоставляем предварительно настроенный дашборд с основными визуализациями трассировок.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nodejs-traces-dashboard.json')} download="nodejs-traces-dashboard.json" eventName="docs.nodejs_traces_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда \{#download-dashboard\}

#### Импортируйте преднастроенный дашборд \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу (в меню с многоточием)

<Image img={import_dashboard} alt="Импорт дашборда"/>

3. Загрузите файл `nodejs-traces-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Дашборд будет создан со всеми заранее сконфигурированными визуализациями \{#created-dashboard\}

<Image img={example_dashboard} alt="Пример дашборда"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). Импортированный дашборд по умолчанию не содержит заданного диапазона времени.
:::

</VerticalStepper>

## Устранение неполадок \{#troubleshooting\}

### Демонстрационные трейсы не появляются через curl \{#demo-traces-not-appearing\}

Если вы отправили трейсы через curl, но не видите их в HyperDX, попробуйте повторно отправить их:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

Это известная проблема, которая возникает при использовании демонстрационного варианта с curl и не затрагивает инструментированные боевые приложения.


### Трейсы не появляются в HyperDX \{#no-traces\}

**Убедитесь, что установлены переменные окружения:**

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

Подключение к конечной точке OTLP должно проходить успешно.

**Проверьте журналы приложения:**
При запуске приложения найдите сообщения об инициализации OpenTelemetry. SDK HyperDX должен вывести сообщение о том, что инициализация прошла успешно.


## Следующие шаги \{#next-steps\}

Если вы хотите пойти дальше, попробуйте следующие шаги для экспериментов с вашим дашбордом:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных метрик (уровни ошибок, пороги задержки)
- Создайте дополнительные дашборды для конкретных сценариев использования (мониторинг API, события безопасности)

## Переход в продакшен \{#going-to-production\}

В этом руководстве используется HyperDX SDK, который отправляет трейсы напрямую в OTLP-эндпоинт ClickStack. Такой подход хорошо подходит для разработки, тестирования и небольших и средних продакшен-развертываний.
Для более крупных продакшен-сред или если вам нужен дополнительный контроль над телеметрией, рассмотрите возможность развертывания собственного OpenTelemetry Collector в качестве агента. 
См. раздел [Приём данных с помощью OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для примеров продакшен-паттернов развертывания и конфигураций коллектора.