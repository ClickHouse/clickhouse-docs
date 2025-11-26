---
description: 'Руководство по использованию OpenTelemetry для распределённой трассировки и
  сбора метрик в ClickHouse'
sidebar_label: 'Трассировка ClickHouse с помощью OpenTelemetry'
sidebar_position: 62
slug: /operations/opentelemetry
title: 'Трассировка ClickHouse с помощью OpenTelemetry'
doc_type: 'guide'
---

[OpenTelemetry](https://opentelemetry.io/) — это открытый стандарт для сбора трасс и метрик из распределённых приложений. ClickHouse частично поддерживает OpenTelemetry.



## Передача контекста трассировки в ClickHouse {#supplying-trace-context-to-clickhouse}

ClickHouse принимает HTTP-заголовки контекста трассировки, как описано в [рекомендации W3C](https://www.w3.org/TR/trace-context/). Он также принимает контекст трассировки по нативному протоколу, который используется для обмена данными между серверами ClickHouse или между клиентом и сервером. Для ручного тестирования заголовки контекста трассировки, соответствующие спецификации Trace Context, можно передать в `clickhouse-client` с помощью флагов `--opentelemetry-traceparent` и `--opentelemetry-tracestate`.

Если родительский контекст трассировки не передан или переданный контекст трассировки не соответствует указанному выше стандарту W3C, ClickHouse может начать новую трассировку с вероятностью, задаваемой настройкой [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability).



## Распространение контекста трассировки {#propagating-the-trace-context}

Контекст трассировки распространяется в последующие сервисы в следующих случаях:

* Запросы к удалённым серверам ClickHouse, например, при использовании движка таблиц [Distributed](../engines/table-engines/special/distributed.md).

* Табличная функция [url](../sql-reference/table-functions/url.md). Информация о контексте трассировки передаётся в HTTP-заголовках.



## Трассировка самого ClickHouse {#tracing-the-clickhouse-itself}

ClickHouse создаёт `trace spans` для каждого запроса и некоторых этапов его выполнения, таких как планирование запроса или распределённые запросы.

Чтобы эта информация была полезной, данные трассировки должны быть экспортированы в систему мониторинга, поддерживающую OpenTelemetry, такую как [Jaeger](https://jaegertracing.io/) или [Prometheus](https://prometheus.io/). ClickHouse избегает зависимости от конкретной системы мониторинга и вместо этого предоставляет данные трассировки через системную таблицу. Информация о span'ах трассировки OpenTelemetry, [требуемая стандартом](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span), хранится в таблице [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md).

Таблица должна быть включена в конфигурации сервера, см. элемент `opentelemetry_span_log` в файле конфигурации по умолчанию `config.xml`. По умолчанию она включена.

Теги или атрибуты сохраняются в виде двух параллельных массивов, содержащих ключи и значения. Для работы с ними используйте [ARRAY JOIN](../sql-reference/statements/select/array-join.md).



## Log-query-settings {#log-query-settings}

Настройка [log_query_settings](settings/settings.md) позволяет логировать изменения параметров запроса во время его выполнения. При включении любые изменения настроек запроса будут записываться в журнал спанов OpenTelemetry. Эта функция особенно полезна в продуктивной среде для отслеживания изменений конфигурации, которые могут повлиять на производительность запросов.



## Интеграция с системами мониторинга

На данный момент нет готового инструмента, позволяющего экспортировать данные трассировки из ClickHouse в систему мониторинга.

Для тестирования можно настроить экспорт с помощью материализованного представления с движком [URL](../engines/table-engines/special/url.md) поверх таблицы [system.opentelemetry&#95;span&#95;log](../operations/system-tables/opentelemetry_span_log.md), которое будет отправлять поступающие лог-записи на HTTP-эндпоинт коллектора трассировок. Например, чтобы отправлять минимальные данные о спане в экземпляр Zipkin, запущенный по адресу `http://localhost:9411`, в формате Zipkin v2 JSON:

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

В случае возникновения ошибок та часть данных журнала, для которой произошла ошибка, будет незаметно потеряна. Если данные не поступают, проверьте журнал сервера на наличие сообщений об ошибках.


## См. также {#related-content}

- Блог: [Построение решения для наблюдаемости с ClickHouse — часть 2. Трейсы](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
