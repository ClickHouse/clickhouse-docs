---
alias: []
description: 'Документация для формата Prometheus'
input_format: false
keywords: ['Prometheus']
output_format: true
slug: /interfaces/formats/Prometheus
title: 'Prometheus'
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✗              | ✔              |           |

## Описание {#description}

Экспортирует метрики в [текстовом формате эксопзиции Prometheus](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format).

Для этого формата необходимо, чтобы таблица вывода была правильно структурирована согласно следующим правилам:

- Столбцы `name` ([String](/sql-reference/data-types/string.md)) и `value` (число) обязательны.
- Строки могут дополнительно содержать `help` ([String](/sql-reference/data-types/string.md)) и `timestamp` (число).
- Столбец `type` ([String](/sql-reference/data-types/string.md)) должен быть одним из `counter`, `gauge`, `histogram`, `summary`, `untyped` или пустым.
- Каждое значение метрики может также иметь некоторые `labels` ([Map(String, String)](/sql-reference/data-types/map.md)).
- Несколько последовательных строк могут относиться к одной метрике с разными метками. Таблица должна быть отсортирована по имени метрики (например, с помощью `ORDER BY name`).

Существуют особые требования для меток `histogram` и `summary` - смотрите [документацию Prometheus](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries) для получения деталей. 
Специальные правила применяются к строкам с метками `{'count':''}` и `{'sum':''}`, которые преобразуются в `<metric_name>_count` и `<metric_name>_sum` соответственно.

## Пример использования {#example-usage}

```yaml
┌─name────────────────────────────────┬─type──────┬─help──────────────────────────────────────┬─labels─────────────────────────┬────value─┬─────timestamp─┐
│ http_request_duration_seconds       │ histogram │ Гистограмма времени обработки запроса.    │ {'le':'0.05'}                  │    24054 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.1'}                   │    33444 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.2'}                   │   100392 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.5'}                   │   129389 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'1'}                     │   133988 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'+Inf'}                  │   144320 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'sum':''}                     │    53423 │             0 │
│ http_requests_total                 │ counter   │ Общее количество HTTP запросов           │ {'method':'post','code':'200'} │     1027 │ 1395066363000 │
│ http_requests_total                 │ counter   │                                           │ {'method':'post','code':'400'} │        3 │ 1395066363000 │
│ metric_without_timestamp_and_labels │           │                                           │ {}                             │    12.47 │             0 │
│ rpc_duration_seconds                │ summary   │ Сводка по времени RPC в секундах.       │ {'quantile':'0.01'}            │     3102 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.05'}            │     3272 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.5'}             │     4773 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.9'}             │     9001 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.99'}            │    76656 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'count':''}                   │     2693 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'sum':''}                     │ 17560473 │             0 │
│ something_weird                     │           │                                           │ {'problem':'division by zero'} │      inf │      -3982045 │
└─────────────────────────────────────┴───────────┴───────────────────────────────────────────┴────────────────────────────────┴──────────┴───────────────┘
```

Будет отформатировано как:

```text

# HELP http_request_duration_seconds Гистограмма времени обработки запроса.

# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05"} 24054
http_request_duration_seconds_bucket{le="0.1"} 33444
http_request_duration_seconds_bucket{le="0.5"} 129389
http_request_duration_seconds_bucket{le="1"} 133988
http_request_duration_seconds_bucket{le="+Inf"} 144320
http_request_duration_seconds_sum 53423
http_request_duration_seconds_count 144320


# HELP http_requests_total Общее количество HTTP запросов

# TYPE http_requests_total counter
http_requests_total{code="200",method="post"} 1027 1395066363000
http_requests_total{code="400",method="post"} 3 1395066363000

metric_without_timestamp_and_labels 12.47


# HELP rpc_duration_seconds Сводка по времени RPC в секундах.

# TYPE rpc_duration_seconds summary
rpc_duration_seconds{quantile="0.01"} 3102
rpc_duration_seconds{quantile="0.05"} 3272
rpc_duration_seconds{quantile="0.5"} 4773
rpc_duration_seconds{quantile="0.9"} 9001
rpc_duration_seconds{quantile="0.99"} 76656
rpc_duration_seconds_sum 17560473
rpc_duration_seconds_count 2693

something_weird{problem="division by zero"} +Inf -3982045
```

## Настройки формата {#format-settings}
