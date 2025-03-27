---
description: 'Руководство по использованию OpenTelemetry для распределенного трассирования и сбора метрик в ClickHouse'
sidebar_label: 'Трассировка ClickHouse с OpenTelemetry'
sidebar_position: 62
slug: /operations/opentelemetry
title: 'Трассировка ClickHouse с OpenTelemetry'
---

[OpenTelemetry](https://opentelemetry.io/) — это открытый стандарт для сбора трасс, и метрик из распределенного приложения. ClickHouse имеет некоторую поддержку OpenTelemetry.

## Передача контекста трассировки в ClickHouse {#supplying-trace-context-to-clickhouse}

ClickHouse принимает HTTP-заголовки контекста трассировки, как описано в [рекомендации W3C](https://www.w3.org/TR/trace-context/). Он также принимает контекст трассировки через нативный протокол, используемый для связи между серверами ClickHouse или между клиентом и сервером. Для ручного тестирования заголовки контекста трассировки, соответствующие рекомендациям по контексту трассировки, могут быть переданы в `clickhouse-client` с помощью флагов `--opentelemetry-traceparent` и `--opentelemetry-tracestate`.

Если родительский контекст трассировки не предоставлен или предоставленный контекст трассировки не соответствует стандарту W3C, ClickHouse может начать новую трассировку с вероятностью, контролируемой настройкой [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability).

## Распространение контекста трассировки {#propagating-the-trace-context}

Контекст трассировки распространяется на downstream-сервисы в следующих случаях:

* Запросы к удаленным серверам ClickHouse, например, при использовании движка таблиц [Distributed](../engines/table-engines/special/distributed.md).

* Табличная функция [url](../sql-reference/table-functions/url.md). Информация контекста трассировки передается в HTTP-заголовках.

## Трассировка самого ClickHouse {#tracing-the-clickhouse-itself}

ClickHouse создает `trace spans` для каждого запроса и некоторых стадий выполнения запроса, таких как планирование запроса или распределенные запросы.

Чтобы быть полезной, информация трассировки должна быть экспортирована в мониторинговую систему, которая поддерживает OpenTelemetry, такую как [Jaeger](https://jaegertracing.io/) или [Prometheus](https://prometheus.io/). ClickHouse избегает зависимости от конкретной мониторинговой системы, предоставляя только данные трассировки через системную таблицу. Информация о трассировочных span, [требуемая стандартом](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span), хранится в таблице [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md).

Эта таблица должна быть включена в конфигурации сервера, см. элемент `opentelemetry_span_log` в файле конфигурации по умолчанию `config.xml`. По умолчанию он включен.

Теги или атрибуты сохраняются как два параллельных массива, содержащих ключи и значения. Используйте [ARRAY JOIN](../sql-reference/statements/select/array-join.md) для работы с ними.

## Настройки логирования запросов {#log-query-settings}

Установка [log_query_settings](settings/settings.md) позволяет фиксировать изменения настроек запросов во время выполнения запроса. Когда это включено, любые изменения, внесенные в настройки запроса, будут записываться в лог трассировки OpenTelemetry. Эта функция особенно полезна в производственных средах для отслеживания изменений в конфигурации, которые могут повлиять на производительность запросов.

## Интеграция с мониторинговыми системами {#integration-with-monitoring-systems}

На данный момент нет готового инструмента для экспорта данных трассировки из ClickHouse в мониторинговую систему.

Для тестирования возможно настроить экспорт, используя материализованное представление с движком [URL](../engines/table-engines/special/url.md) над таблицей [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md), которое будет отправлять поступающие данные лога на HTTP-эндпоинт сборщика трасс. Например, чтобы отправить минимальные данные span на экземпляр Zipkin, работающий на `http://localhost:9411`, в формате JSON v2 Zipkin:

```sql
CREATE MATERIALIZED VIEW default.zipkin_spans
ENGINE = URL('http://127.0.0.1:9411/api/v2/spans', 'JSONEachRow')
SETTINGS output_format_json_named_tuples_as_objects = 1,
    output_format_json_array_of_rows = 1 AS
SELECT
    lower(hex(trace_id)) AS traceId,
    case when parent_span_id = 0 then '' else lower(hex(parent_span_id)) end AS parentId,
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

В случае возникновения ошибок часть данных лога, для которой произошла ошибка, будет тихо потеряна. Проверьте серверный лог на наличие сообщений об ошибках, если данные не приходят.

## Связанный контент {#related-content}

- Блог: [Создание решения по наблюдаемости с ClickHouse - Часть 2 - Трассы](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
