---
description: 'Руководство по использованию OpenTelemetry для распределённого трассирования и сбора метрик
  в ClickHouse'
sidebar_label: 'Трассировка ClickHouse с помощью OpenTelemetry'
sidebar_position: 62
slug: /operations/opentelemetry
title: 'Трассировка ClickHouse с помощью OpenTelemetry'
doc_type: 'guide'
---

[OpenTelemetry](https://opentelemetry.io/) — это открытый стандарт для сбора трассировок и метрик от распределённых приложений. ClickHouse поддерживает OpenTelemetry.



## Передача контекста трассировки в ClickHouse {#supplying-trace-context-to-clickhouse}

ClickHouse принимает HTTP-заголовки контекста трассировки, как описано в [рекомендации W3C](https://www.w3.org/TR/trace-context/). Также поддерживается передача контекста трассировки через нативный протокол, который используется для взаимодействия между серверами ClickHouse или между клиентом и сервером. Для ручного тестирования заголовки контекста трассировки, соответствующие рекомендации Trace Context, можно передать в `clickhouse-client` с помощью флагов `--opentelemetry-traceparent` и `--opentelemetry-tracestate`.

Если родительский контекст трассировки не предоставлен или предоставленный контекст не соответствует указанному выше стандарту W3C, ClickHouse может начать новую трассировку с вероятностью, управляемой настройкой [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability).


## Распространение контекста трассировки {#propagating-the-trace-context}

Контекст трассировки передаётся в downstream-сервисы в следующих случаях:

- Запросы к удалённым серверам ClickHouse, например, при использовании движка таблиц [Distributed](../engines/table-engines/special/distributed.md).

- Табличная функция [url](../sql-reference/table-functions/url.md). Информация о контексте трассировки передаётся в HTTP-заголовках.


## Трассировка самого ClickHouse {#tracing-the-clickhouse-itself}

ClickHouse создаёт `trace spans` (интервалы трассировки) для каждого запроса и некоторых этапов его выполнения, таких как планирование запроса или распределённые запросы.

Чтобы информация трассировки была полезной, её необходимо экспортировать в систему мониторинга с поддержкой OpenTelemetry, например [Jaeger](https://jaegertracing.io/) или [Prometheus](https://prometheus.io/). ClickHouse не зависит от конкретной системы мониторинга, а предоставляет данные трассировки только через системную таблицу. Информация об интервалах трассировки OpenTelemetry, [требуемая стандартом](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span), хранится в таблице [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md).

Таблица должна быть включена в конфигурации сервера, см. элемент `opentelemetry_span_log` в файле конфигурации по умолчанию `config.xml`. По умолчанию она включена.

Теги или атрибуты сохраняются в виде двух параллельных массивов, содержащих ключи и значения. Для работы с ними используйте [ARRAY JOIN](../sql-reference/statements/select/array-join.md).


## Log-query-settings {#log-query-settings}

Настройка [log_query_settings](settings/settings.md) позволяет регистрировать изменения настроек запроса во время его выполнения. При включении все изменения настроек запроса будут записываться в журнал span OpenTelemetry. Эта функция особенно полезна в промышленных средах для отслеживания изменений конфигурации, которые могут повлиять на производительность запросов.


## Интеграция с системами мониторинга {#integration-with-monitoring-systems}

В настоящее время отсутствует готовый инструмент для экспорта данных трассировки из ClickHouse в системы мониторинга.

Для тестирования можно настроить экспорт с помощью материализованного представления с движком [URL](../engines/table-engines/special/url.md) над таблицей [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md), которое будет отправлять поступающие данные логов на HTTP-эндпоинт сборщика трассировок. Например, для отправки минимальных данных span в экземпляр Zipkin, работающий по адресу `http://localhost:9411`, в формате Zipkin v2 JSON:

```sql
CREATE MATERIALIZED VIEW default.zipkin_spans
ENGINE = URL('http://127.0.0.1:9411/api/v2/spans', 'JSONEachRow')
SETTINGS output_format_json_named_tuples_as_objects = 1,
    output_format_json_array_of_rows = 1 AS
SELECT
    lower(hex(trace_id)) AS traceId,
    CASE WHEN parent_span_id = 0 THEN '' ELSE lower(hex(parent_span_id)) END AS parentId,
    lower(hex(span_id)) AS id,
    operation_name AS name,
    start_time_us AS timestamp,
    finish_time_us - start_time_us AS duration,
    cast(tuple('clickhouse'), 'Tuple(serviceName text)') AS localEndpoint,
    cast(tuple(
        attribute.values[indexOf(attribute.names, 'db.statement')]),
        'Tuple("db.statement" text)') AS tags
FROM system.opentelemetry_span_log
```

В случае возникновения ошибок часть данных логов, для которой произошла ошибка, будет утеряна без уведомления. Если данные не поступают, проверьте лог сервера на наличие сообщений об ошибках.


## Связанный контент {#related-content}

- Блог: [Построение решения для наблюдаемости с ClickHouse — Часть 2: Трассировки](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
