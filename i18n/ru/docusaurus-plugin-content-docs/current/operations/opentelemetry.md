---
slug: /operations/opentelemetry
sidebar_position: 62
sidebar_label: Трассировка ClickHouse с помощью OpenTelemetry
title: "Трассировка ClickHouse с помощью OpenTelemetry"
---

[OpenTelemetry](https://opentelemetry.io/) - это открытый стандарт для сбора трасс и метрик из распределенного приложения. ClickHouse имеет некоторую поддержку OpenTelemetry.

## Передача контекста трассировки в ClickHouse {#supplying-trace-context-to-clickhouse}

ClickHouse принимает HTTP-заголовки контекста трассировки, как описано в [рекомендациях W3C](https://www.w3.org/TR/trace-context/). Он также принимает контекст трассировки через собственный протокол, который используется для обмена данными между серверами ClickHouse или между клиентом и сервером. Для ручного тестирования заголовки контекста трассировки, соответствующие рекомендации по контексту трассировки, могут быть предоставлены `clickhouse-client` с использованием флагов `--opentelemetry-traceparent` и `--opentelemetry-tracestate`.

Если родительский контекст трассировки не предоставлен или предоставленный контекст трассировки не соответствует стандарту W3C, ClickHouse может начать новую трассировку, вероятность чего контролируется настройкой [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability).

## Распространение контекста трассировки {#propagating-the-trace-context}

Контекст трассировки передается в дочерние сервисы в следующих случаях:

* Запросы к удаленным серверам ClickHouse, например, при использовании [распределенного](../engines/table-engines/special/distributed.md) движка таблиц.

* Функция таблицы [url](../sql-reference/table-functions/url.md). Информация о контексте трассировки отправляется в HTTP-заголовках.

## Трассировка самого ClickHouse {#tracing-the-clickhouse-itself}

ClickHouse создает `trace spans` для каждого запроса и некоторых этапов выполнения запроса, таких как планирование запроса или распределенные запросы.

Чтобы быть полезной, информация о трассировке должна быть экспортирована в мониторинговую систему, которая поддерживает OpenTelemetry, такую как [Jaeger](https://jaegertracing.io/) или [Prometheus](https://prometheus.io/). ClickHouse избегает зависимости от конкретной мониторинговой системы, предоставляя данные трассировки лишь через системную таблицу. Информация о `trace span`, требуемая стандартом [в соответствии со стандартом](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span), хранится в таблице [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md).

Таблица должна быть включена в конфигурации сервера, см. элемент `opentelemetry_span_log` в файле конфигурации по умолчанию `config.xml`. Она включена по умолчанию.

Теги или атрибуты сохраняются как два параллельных массива, содержащих ключи и значения. Используйте [ARRAY JOIN](../sql-reference/statements/select/array-join.md) для работы с ними.

## Настройки журналирования запросов {#log-query-settings}

Настройка [log_query_settings](settings/settings.md) позволяет регистрировать изменения параметров запроса во время его выполнения. Когда она включена, любые изменения, внесенные в параметры запроса, будут зафиксированы в журнале OpenTelemetry span. Эта функция особенно полезна в производственных средах для отслеживания изменений конфигурации, которые могут повлиять на производительность запроса.

## Интеграция с мониторинговыми системами {#integration-with-monitoring-systems}

На данный момент нет готового инструмента, который мог бы экспортировать данные трассировки из ClickHouse в мониторинговую систему.

Для тестирования возможно настроить экспорт с использованием материализованного представления с движком [URL](../engines/table-engines/special/url.md) над таблицей [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md), что будет отправлять поступающие данные журнала на HTTP-эндпоинт коллектора трасс. Например, чтобы отправить минимальные данные span в экземпляр Zipkin, работающий по адресу `http://localhost:9411`, в формате JSON v2 для Zipkin:

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

В случае возникновения ошибок, часть данных журнала, для которой произошла ошибка, будет тихо утеряна. Проверьте журнал сервера на наличие сообщений об ошибках, если данные не приходят.

## Связанный контент {#related-content}

- Блог: [Создание решения для наблюдаемости с ClickHouse - Часть 2 - Трассы](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
