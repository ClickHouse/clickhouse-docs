---
slug: /use-cases/observability/clickstack/text-to-chart
title: 'Text-to-Chart'
sidebar_label: 'Text-to-Chart'
pagination_prev: null
pagination_next: null
description: 'Создавайте графики по запросам на естественном языке в ClickStack с помощью функции Text-to-Chart на базе AI.'
doc_type: 'guide'
keywords: ['ClickStack', 'Text-to-Chart', 'AI', 'визуализация', 'Chart Explorer', 'естественный язык', 'обсервабилити']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import text_to_chart from '@site/static/images/clickstack/text-to-chart/text-to-chart.png';
import chart_explorer from '@site/static/images/clickstack/text-to-chart/chart-explorer.png';
import create_connection from '@site/static/images/clickstack/text-to-chart/create-connection.png';

Функция Text-to-Chart в ClickStack позволяет создавать визуализации, описывая простым текстом, что вы хотите увидеть. Вместо того чтобы вручную выбирать метрики, фильтры и поля группировки, вы можете ввести запрос, например &quot;доли ошибок по сервисам за последние 24 часа&quot;, и ClickStack автоматически сгенерирует соответствующий график.

Эта функция использует большую языковую модель (LLM), чтобы преобразовать ваш текстовый запрос в запрос, а затем построить визуализацию в [Chart Explorer](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer). Она работает с любым настроенным источником данных.


## Предварительные требования \{#prerequisites\}

Для Text-to-Chart требуется [API-ключ Anthropic](https://console.anthropic.com/). При запуске ClickStack задайте переменную среды `ANTHROPIC_API_KEY`.

Для open-source-развертываний передайте ключ через переменную среды. Способ зависит от типа развертывания:

<Tabs groupId="deployMethod">
  <TabItem value="docker-aio" label="Docker (All-in-One или локальный режим)" default>
    ```bash
    docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
    ```
  </TabItem>

  <TabItem value="docker-hyperdx" label="Docker (только HyperDX)">
    ```bash
    docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
    ```
  </TabItem>

  <TabItem value="docker-compose" label="Docker Compose">
    Добавьте переменную в файл `.env` или задайте её непосредственно в `docker-compose.yaml`:

    ```yaml
    services:
      app:
        environment:
          ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ```
  </TabItem>

  <TabItem value="helm" label="Helm">
    Передайте ключ с помощью `--set`:

    ```bash
    helm install my-hyperdx hyperdx/hdx-oss-v2 \
      --set env[0].name=ANTHROPIC_API_KEY \
      --set env[0].value=<YOUR_KEY>
    ```
  </TabItem>
</Tabs>

## Использование Text-to-Chart \{#using-text-to-chart\}

<VerticalStepper headerLevel="h3">

### Перейдите в Chart Explorer \{#navigate-chart-explorer\}

Выберите **Chart Explorer** в левом меню HyperDX.

### Выберите источник данных \{#select-data-source\}

Выберите источник данных, который хотите визуализировать, — например, **Logs**, **Traces** или **Metrics**.

<Image img={chart_explorer} alt="Chart explorer" />

### Введите текстовый запрос \{#enter-text-prompt\}

В верхней части Chart Explorer найдите поле ввода **AI Assistant**. Введите на естественном языке описание диаграммы, которую хотите создать. Например:

- `Show error rates by service over the last 24 hours`
- `Latency breakdown by endpoint`
- `Count of events over time grouped by severity`

ClickStack преобразует запрос в запрос и автоматически строит визуализацию.

<Image img={text_to_chart} alt="Text to chart" />

</VerticalStepper>

## Тестирование на демо-данных \{#demo-data\}

Самый быстрый способ опробовать Text-to-Chart — использовать Docker-образ [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only) и [удаленный набор демо-данных](/use-cases/observability/clickstack/getting-started/remote-demo-data):

```bash
docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 clickhouse/clickstack-local:latest
```

Перейдите по адресу `localhost:8080`. Чтобы подключиться к демо-данным, откройте **Team Settings** и создайте новое подключение со следующими параметрами:

* **Connection Name**: `Demo`
* **Host**: `https://sql-clickhouse.clickhouse.com`
* **Username**: `otel_demo`
* **Password**: оставьте пустым

<Image img={create_connection} alt="Создать подключение" />

Затем настройте каждый источник — **Logs**, **Traces**, **Metrics** и **Sessions** — на использование базы данных `otel_v2`. Подробные инструкции по настройке источников см. в [руководстве по удалённому демо-набору данных](/use-cases/observability/clickstack/getting-started/remote-demo-data).

После подключения откройте **Chart Explorer** и попробуйте запросы к доступным логам, трейсам и метрикам.


## Примеры запросов \{#example-prompts\}

Следующие запросы демонстрируют распространённые сценарии использования при работе с данными обсервабилити:

| Запрос                                            | Источник данных | Описание                                                 |
| ------------------------------------------------- | --------------- | -------------------------------------------------------- |
| `Error count by service over time`                | Логи            | Отображает частоту ошибок по сервисам с течением времени |
| `Average request duration grouped by endpoint`    | Трейсы          | Показывает паттерны задержки для каждого эндпоинта       |
| `P99 latency by service`                          | Трейсы          | Помогает выявить хвостовую задержку по сервисам          |
| `Count of 5xx status codes over the last 6 hours` | Логи            | Отслеживает динамику серверных ошибок                    |

Запросы могут ссылаться на любой столбец или атрибут, доступный в настроенных источниках данных. Чем конкретнее запрос, тем точнее будет сгенерированная диаграмма.

## Ограничения \{#limitations\}

* Сейчас Text-to-Chart поддерживает Anthropic только в качестве провайдера LLM. Поддержка дополнительных провайдеров, включая OpenAI, планируется в будущих релизах.
* В качестве источников данных поддерживаются только логи и трейсы. Метрики Prometheus пока не поддерживаются.
* Точность диаграммы зависит от ясности запроса и структуры исходных данных. Если сгенерированная диаграмма не соответствует ожиданиям, попробуйте переформулировать запрос или явно указать имена столбцов.

## Дополнительные материалы \{#further-reading\}

* [От текста к диаграммам: более быстрый способ визуализации в ClickStack](https://clickhouse.com/blog/text-to-charts-faster-way-to-visualize-clickstack) — запись в блоге с обзором этой функции
* [Панели мониторинга и визуализации](/use-cases/observability/clickstack/dashboards) — создание диаграмм вручную с помощью Chart Explorer
* [Поиск](/use-cases/observability/clickstack/search) — синтаксис полнотекстового поиска и поиска по свойствам
* [Конфигурация](/use-cases/observability/clickstack/config) — все переменные окружения ClickStack