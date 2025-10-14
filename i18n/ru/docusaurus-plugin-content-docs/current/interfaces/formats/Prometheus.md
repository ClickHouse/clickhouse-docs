---
slug: '/interfaces/formats/Prometheus'
description: 'Документация для формата Prometheus'
title: Prometheus
keywords: ['Prometheus']
doc_type: reference
input_format: false
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Экспортирует метрики в [формате экспозиции Prometheus на основе текста](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format).

Для этого формата требуется правильная структура выходной таблицы, следуя следующим правилам:

- Столбцы `name` ([String](/sql-reference/data-types/string.md)) и `value` (число) являются обязательными.
- Строки могут дополнительно содержать `help` ([String](/sql-reference/data-types/string.md)) и `timestamp` (число).
- Столбец `type` ([String](/sql-reference/data-types/string.md)) должен быть одним из `counter`, `gauge`, `histogram`, `summary`, `untyped` или пустым.
- Каждое значение метрики может также иметь некоторые `labels` ([Map(String, String)](/sql-reference/data-types/map.md)).
- Несколько последующих строк могут относиться к одной метрике с разными метками. Таблица должна быть отсортирована по имени метрики (например, с помощью `ORDER BY name`).

Существуют специальные требования для меток `histogram` и `summary` - смотрите [документацию Prometheus](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries) для получения подробной информации. 
Специальные правила применяются к строкам с метками `{'count':''}` и `{'sum':''}`, которые преобразуются в `<metric_name>_count` и `<metric_name>_sum` соответственно.

## Пример использования {#example-usage}

```yaml
┌─name────────────────────────────────┬─type──────┬─help──────────────────────────────────────┬─labels─────────────────────────┬────value─┬─────timestamp─┐
│ http_request_duration_seconds       │ histogram │ A histogram of the request duration.      │ {'le':'0.05'}                  │    24054 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.1'}                   │    33444 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.2'}                   │   100392 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.5'}                   │   129389 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'1'}                     │   133988 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'+Inf'}                  │   144320 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'sum':''}                     │    53423 │             0 │
│ http_requests_total                 │ counter   │ Total number of HTTP requests             │ {'method':'post','code':'200'} │     1027 │ 1395066363000 │
│ http_requests_total                 │ counter   │                                           │ {'method':'post','code':'400'} │        3 │ 1395066363000 │
│ metric_without_timestamp_and_labels │           │                                           │ {}                             │    12.47 │             0 │
│ rpc_duration_seconds                │ summary   │ A summary of the RPC duration in seconds. │ {'quantile':'0.01'}            │     3102 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.05'}            │     3272 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.5'}             │     4773 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.9'}             │     9001 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.99'}            │    76656 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'count':''}                   │     2693 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'sum':''}                     │ 17560473 │             0 │
│ something_weird                     │           │                                           │ {'problem':'division by zero'} │      inf │      -3982045 │
└─────────────────────────────────────┴───────────┴───────────────────────────────────────────┴────────────────────────────────┴──────────┴───────────────┘
```

Будет отформатирован как:

```text

# HELP http_request_duration_seconds A histogram of the request duration.

# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05"} 24054
http_request_duration_seconds_bucket{le="0.1"} 33444
http_request_duration_seconds_bucket{le="0.5"} 129389
http_request_duration_seconds_bucket{le="1"} 133988
http_request_duration_seconds_bucket{le="+Inf"} 144320
http_request_duration_seconds_sum 53423
http_request_duration_seconds_count 144320


# HELP http_requests_total Total number of HTTP requests

# TYPE http_requests_total counter
http_requests_total{code="200",method="post"} 1027 1395066363000
http_requests_total{code="400",method="post"} 3 1395066363000

metric_without_timestamp_and_labels 12.47


# HELP rpc_duration_seconds A summary of the RPC duration in seconds.

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