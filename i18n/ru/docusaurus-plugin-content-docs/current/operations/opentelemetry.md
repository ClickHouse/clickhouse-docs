---
slug: '/operations/opentelemetry'
sidebar_label: 'Трассировка ClickHouse с OpenTelemetry'
sidebar_position: 62
description: 'Руководство по использованию OpenTelemetry для распределенной трассировки'
title: 'Трассировка ClickHouse с OpenTelemetry'
doc_type: guide
---
[OpenTelemetry](https://opentelemetry.io/) — это открытый стандарт для сбора трассировок и метрик из распределённого приложения. ClickHouse имеет некоторую поддержку OpenTelemetry.

## Передача контекста трассировки в ClickHouse {#supplying-trace-context-to-clickhouse}

ClickHouse принимает HTTP-заголовки контекста трассировки, как описано в [рекомендациях W3C](https://www.w3.org/TR/trace-context/). Он также принимает контекст трассировки через нативный протокол, который используется для передачи данных между серверами ClickHouse или между клиентом и сервером. Для ручного тестирования заголовки контекста трассировки, соответствующие рекомендациям по контексту трассировки, можно передать в `clickhouse-client`, используя флаги `--opentelemetry-traceparent` и `--opentelemetry-tracestate`.

Если родительский контекст трассировки не предоставлен или предоставленный контекст трассировки не соответствует стандарту W3C, ClickHouse может начать новую трассировку с вероятностью, управляемой настройкой [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability).

## Распространение контекста трассировки {#propagating-the-trace-context}

Контекст трассировки распространяется на последующие службы в следующих случаях:

* Запросы к удалённым серверам ClickHouse, например, при использовании движка таблиц [Distributed](../engines/table-engines/special/distributed.md).

* Табличная функция [url](../sql-reference/table-functions/url.md). Информация о контексте трассировки отправляется в HTTP-заголовках.

## Трассировка самого ClickHouse {#tracing-the-clickhouse-itself}

ClickHouse создаёт `trace spans` для каждого запроса и некоторых этапов выполнения запроса, таких как планирование запроса или распределённые запросы.

Чтобы быть полезной, информация трассировки должна экспортироваться в систему мониторинга, которая поддерживает OpenTelemetry, такую как [Jaeger](https://jaegertracing.io/) или [Prometheus](https://prometheus.io/). ClickHouse избегает зависимости от конкретной системы мониторинга и вместо этого предоставляет данные трассировки через системную таблицу. Информация о span трассировки OpenTelemetry [требуемая стандартом](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span) хранится в таблице [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md).

Эта таблица должна быть включена в конфигурации сервера, смотрите элемент `opentelemetry_span_log` в конфигурационном файле по умолчанию `config.xml`. Она включена по умолчанию.

Теги или атрибуты сохраняются как два параллельных массива, содержащих ключи и значения. Используйте [ARRAY JOIN](../sql-reference/statements/select/array-join.md) для работы с ними.

## Настройки логирования запросов {#log-query-settings}

Установка [log_query_settings](settings/settings.md) позволяет фиксировать изменения настроек запроса во время выполнения запроса. При включении любые изменения, внесённые в настройки запроса, будут записаны в журнал span OpenTelemetry. Эта функция особенно полезна в производственных средах для отслеживания изменений конфигурации, которые могут повлиять на производительность запроса.

## Интеграция с системами мониторинга {#integration-with-monitoring-systems}

На данный момент нет готового инструмента, который может экспортировать данные трассировки из ClickHouse в систему мониторинга.

Для тестирования возможно настроить экспорт, используя материализованное представление с движком [URL](../engines/table-engines/special/url.md) по таблице [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md), которое будет отправлять поступающие данные журнала на HTTP-эндпоинт сборщика трассировок. Например, чтобы отправить минимальные данные span в экземпляр Zipkin, работающий по адресу `http://localhost:9411`, в формате JSON v2 для Zipkin:

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

В случае ошибок часть данных журнала, для которой произошла ошибка, будет тихо потеряна. Проверьте журнал сервера на наличие сообщений об ошибках, если данные не прибывают.

## Связанный контент {#related-content}

- Блог: [Создание решения для мониторинга с помощью ClickHouse - Часть 2 - Трассировки](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)