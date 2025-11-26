---
alias: []
description: 'Документация по формату Prometheus'
input_format: false
keywords: ['Prometheus']
output_format: true
slug: /interfaces/formats/Prometheus
title: 'Prometheus'
doc_type: 'reference'
---

| Ввод | Вывод | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |



## Описание {#description}

Экспортирует метрики в [текстовом формате экспонирования Prometheus](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format).

Для этого формата требуется, чтобы выходная таблица была корректно структурирована в соответствии со следующими правилами:

- Столбцы `name` ([String](/sql-reference/data-types/string.md)) и `value` (число) являются обязательными.
- Строки могут дополнительно содержать `help` ([String](/sql-reference/data-types/string.md)) и `timestamp` (число).
- Столбец `type` ([String](/sql-reference/data-types/string.md)) должен иметь одно из значений: `counter`, `gauge`, `histogram`, `summary`, `untyped` или быть пустым.
- Каждое значение метрики может также иметь метки `labels` ([Map(String, String)](/sql-reference/data-types/map.md)).
- Несколько последовательных строк могут относиться к одной и той же метрике с разными метками. Таблица должна быть отсортирована по имени метрики (например, с помощью `ORDER BY name`).

Существуют особые требования к меткам для `histogram` и `summary` — подробности см. в [документации Prometheus](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries).  
К строкам с метками `{'count':''}` и `{'sum':''}` применяются специальные правила: они преобразуются соответственно в `<metric_name>_count` и `<metric_name>_sum`.



## Пример использования

```yaml
┌─name────────────────────────────────┬─type──────┬─help──────────────────────────────────────┬─labels─────────────────────────┬────value─┬─────timestamp─┐
│ http_request_duration_seconds       │ histogram │ Гистограмма продолжительности запроса.    │ {'le':'0.05'}                  │    24054 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.1'}                   │    33444 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.2'}                   │   100392 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.5'}                   │   129389 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'1'}                     │   133988 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'+Inf'}                  │   144320 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'sum':''}                     │    53423 │             0 │
│ http_requests_total                 │ counter   │ Общее количество HTTP-запросов            │ {'method':'post','code':'200'} │     1027 │ 1395066363000 │
│ http_requests_total                 │ counter   │                                           │ {'method':'post','code':'400'} │        3 │ 1395066363000 │
│ metric_without_timestamp_and_labels │           │                                           │ {}                             │    12.47 │             0 │
│ rpc_duration_seconds                │ summary   │ Сводка продолжительности RPC в секундах.  │ {'quantile':'0.01'}            │     3102 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.05'}            │     3272 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.5'}             │     4773 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.9'}             │     9001 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.99'}            │    76656 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'count':''}                   │     2693 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'sum':''}                     │ 17560473 │             0 │
│ something_weird                     │           │                                           │ {'problem':'division by zero'} │      inf │      -3982045 │
└─────────────────────────────────────┴───────────┴───────────────────────────────────────────┴────────────────────────────────┴──────────┴───────────────┘
```

Будет иметь следующий формат:


```text
# HELP http_request_duration_seconds Гистограмма продолжительности запроса.
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05"} 24054
http_request_duration_seconds_bucket{le="0.1"} 33444
http_request_duration_seconds_bucket{le="0.5"} 129389
http_request_duration_seconds_bucket{le="1"} 133988
http_request_duration_seconds_bucket{le="+Inf"} 144320
http_request_duration_seconds_sum 53423
http_request_duration_seconds_count 144320
```


# HELP http_requests_total Общее количество HTTP-запросов
# TYPE http_requests_total counter
http_requests_total{code="200",method="post"} 1027 1395066363000
http_requests_total{code="400",method="post"} 3 1395066363000

metric_without_timestamp_and_labels 12.47



# HELP rpc&#95;duration&#95;seconds Сводная статистика длительности RPC в секундах.

# TYPE rpc&#95;duration&#95;seconds summary

rpc&#95;duration&#95;seconds{quantile="0.01"} 3102
rpc&#95;duration&#95;seconds{quantile="0.05"} 3272
rpc&#95;duration&#95;seconds{quantile="0.5"} 4773
rpc&#95;duration&#95;seconds{quantile="0.9"} 9001
rpc&#95;duration&#95;seconds{quantile="0.99"} 76656
rpc&#95;duration&#95;seconds&#95;sum 17560473
rpc&#95;duration&#95;seconds&#95;count 2693

something&#95;weird{problem="деление на ноль"} +Inf -3982045

```
```


## Параметры форматирования {#format-settings}
