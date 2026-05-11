---
sidebar_label: 'Мониторинг'
description: 'Мониторинг ClickPipes с помощью метрик Prometheus.'
slug: /integrations/clickpipes/monitoring
title: 'Мониторинг ClickPipes'
doc_type: 'reference'
keywords: ['ClickPipes', 'мониторинг', 'метрики', 'Prometheus', 'обсервабилити']
---

# Мониторинг ClickPipes \{#monitoring-clickpipes\}

Помимо мониторинга в консоли, ClickPipes предоставляет метрики через [конечную точку, совместимую с Prometheus](/integrations/prometheus), для сбора. Эти метрики публикуются вместе с другими метриками сервиса ClickHouse Cloud и позволяют интегрировать мониторинг ClickPipes с вашим существующим стеком обсервабилити (например, [Grafana](/integrations/prometheus#integrating-with-grafana), [Datadog](/integrations/prometheus#integrating-with-datadog)).

## Метки метрик \{#metric-labels\}

Метрики ClickPipes используют [стандартные метки уровня сервиса](/integrations/prometheus#metric-labels) (`clickhouse_org`, `clickhouse_service`, `clickhouse_service_name`), а также следующие метки, специфичные для ClickPipes:

| Метка              | Описание                                                             |
| ------------------ | -------------------------------------------------------------------- |
| `clickpipe_id`     | Уникальный идентификатор ClickPipe                                   |
| `clickpipe_name`   | Название ClickPipe                                                   |
| `clickpipe_source` | Тип источника (например, `kafka`, `postgres`, `s3`)                  |
| `clickpipe_state`  | Состояние ClickPipe (например, `Stopped`, `Provisioning`, `Running`) |

### Пример ответа \{#sample-response\}

Ниже показано, как метрики ClickPipes выглядят в ответе Prometheus на запрос сбора:

```response
# HELP ClickPipes_Info Always equal to 1. Label "clickpipe_state" contains the current state of the pipe: Stopped/Provisioning/Running/Paused/Failed
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent",clickpipe_state="Running"} 1

# HELP ClickPipes_FetchedEvents_Total Total number of records fetched from the source.
# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 5535376

# HELP ClickPipes_SentEvents_Total Total number of records sent to ClickHouse
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 5534250

# HELP ClickPipes_FetchedBytes_Total Total uncompressed bytes fetched from the source.
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_SentBytes_Total Total uncompressed bytes sent to ClickHouse.
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 477187967

# HELP ClickPipes_Errors_Total Total errors ingesting data.
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 0

# HELP ClickPipes_Latency Time in milliseconds between when the record was produced to when it was written to ClickHouse.
# TYPE ClickPipes_Latency gauge
ClickPipes_Latency{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 340
```

## Доступные метрики \{#available-metrics\}

### Передача данных \{#metrics-data-transfer\}

| Метрика                                    | Тип     | Описание                                                                                                                                  |
| ------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ClickPipes_FetchedBytes_Total`            | Counter | Общее количество несжатых байтов, считанных из источника.                                                                                 |
| `ClickPipes_FetchedBytesCompressed_Total`  | Counter | Общее количество сжатых байтов, считанных из источника. Если данные в источнике не сжаты, значение равно `ClickPipes_FetchedBytes_Total`. |
| `ClickPipes_FetchedBytesInitialLoad_Total` | Counter | **CDC ClickPipes** Общее количество несжатых байтов, считанных на этапе начальной загрузки.                                               |
| `ClickPipes_FetchedBytesResync_Total`      | Counter | **CDC ClickPipes** Общее количество несжатых байтов, считанных во время повторной синхронизации.                                          |
| `ClickPipes_SentBytes_Total`               | Counter | Общее количество несжатых байтов, отправленных в ClickHouse.                                                                              |
| `ClickPipes_SentBytesCompressed_Total`     | Counter | Общее количество сжатых байтов, отправленных в ClickHouse.                                                                                |

### События и записи \{#metrics-events\}

| Метрика                             | Тип     | Описание                                                                                                                                                          |
| ----------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ClickPipes_FetchedEvents_Total`    | Counter | Общее количество записей, полученных из источника.                                                                                                                |
| `ClickPipes_SentEvents_Total`       | Counter | Общее количество записей, отправленных в ClickHouse.                                                                                                              |
| `ClickPipes_FetchedEvents_PerTable` | Gauge   | **CDC ClickPipes** Количество записей, полученных по каждой целевой таблице и типу события. Используются дополнительные метки `destination_table` и `event_type`. |

### Ошибки \{#metrics-errors\}

| Метрика                   | Тип     | Описание                                                                                            |
| ------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `ClickPipes_Errors_Total` | Counter | Общее количество [ошибок](/integrations/clickpipes#error-reporting), возникших в процессе ингестии. |

### Задержка \{#metrics-latency\}

| Метрика                                   | Тип           | Описание                                                                                                                                         |
| ----------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ClickPipes_Latency`                      | Gauge (*avg*) | Время в миллисекундах между моментом, когда запись была создана в источнике, и моментом, когда она была записана в ClickHouse.                   |
| `ClickPipes_SourceReplicationLatency_MiB` | Gauge (*avg*) | **CDC ClickPipes** Задержка репликации на стороне источника в МиБ. Для Postgres ClickPipes это значение соответствует задержке слота репликации. |

### Использование ресурсов \{#metrics-resources\}

| Метрика                          | Тип            | Описание                                                    |
| -------------------------------- | -------------- | ----------------------------------------------------------- |
| `ClickPipes_Replica_CPUUsage`    | Gauge (*avg*)  | Среднее использование CPU репликами ингестии, в милликорях. |
| `ClickPipes_Replica_CPULimit`    | Gauge (*last*) | Заданный лимит CPU для реплик ингестии, в милликорях.       |
| `ClickPipes_Replica_MemoryUsage` | Gauge (*avg*)  | Среднее использование памяти репликами ингестии, в байтах.  |
| `ClickPipes_Replica_MemoryLimit` | Gauge (*last*) | Заданный лимит памяти для реплик ингестии, в байтах.        |

### Состояние и прогресс \{#metrics-state\}

| Метрика                         | Тип   | Описание                                                                                                                       |
| ------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| `ClickPipes_Info`               | Gauge | Всегда равно `1`. Используйте метку `clickpipe_state`, чтобы фильтровать данные или настраивать оповещения по состоянию пайпа. |
| `ClickPipes_LastFetchedBatchId` | Gauge | Идентификатор последнего батча, полученного из источника.                                                                      |
| `ClickPipes_LastSentBatchId`    | Gauge | Идентификатор последнего батча, отправленного в ClickHouse.                                                                    |

## Связанные страницы \{#related\}

* [Конечная точка Prometheus](/integrations/prometheus) — Справочник по конечной точке, аутентификация и настройка для внешних инструментов (например, Grafana, Datadog)
* [Рипортинг ошибок](/integrations/clickpipes#error-reporting) — Где хранятся ошибки записей и системные ошибки