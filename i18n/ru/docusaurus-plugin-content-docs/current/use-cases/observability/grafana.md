---
title: 'Использование Grafana'
description: 'Использование Grafana и ClickHouse для наблюдаемости'
slug: /observability/grafana
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
---

import observability_15 from '@site/static/images/use-cases/observability/observability-15.png';
import observability_16 from '@site/static/images/use-cases/observability/observability-16.png';
import observability_17 from '@site/static/images/use-cases/observability/observability-17.png';
import observability_18 from '@site/static/images/use-cases/observability/observability-18.png';
import observability_19 from '@site/static/images/use-cases/observability/observability-19.png';
import observability_20 from '@site/static/images/use-cases/observability/observability-20.png';
import observability_21 from '@site/static/images/use-cases/observability/observability-21.png';
import observability_22 from '@site/static/images/use-cases/observability/observability-22.png';
import observability_23 from '@site/static/images/use-cases/observability/observability-23.png';
import observability_24 from '@site/static/images/use-cases/observability/observability-24.png';
import Image from '@theme/IdealImage';


# Использование Grafana и ClickHouse для наблюдаемости

Grafana является предпочтительным инструментом визуализации данных наблюдаемости в ClickHouse. Это достигается с помощью официального плагина ClickHouse для Grafana. Пользователи могут следовать инструкциям по установке, которые можно найти [здесь](/integrations/grafana).

V4 плагина делает логи и трассировки первоклассными гражданами в новом опыте конструктора запросов. Это минимизирует необходимость для SRE писать SQL-запросы и упрощает SQL-ориентированную наблюдаемость, продвигая эту новую парадигму вперед. Часть этого заключается в том, чтобы поместить Open Telemetry (OTel) в ядро плагина, поскольку мы считаем, что это будет основой SQL-ориентированной наблюдаемости в предстоящие годы и тем, как будут собираться данные.

## Интеграция Open Telemetry {#open-telemetry-integration}

При настройке источника данных Clickhouse в Grafana плагин позволяет пользователям указывать базу данных и таблицу по умолчанию для логов и трассировок, а также соответствуют ли эти таблицы схеме OTel. Это позволяет плагину возвращать необходимые столбцы для корректной визуализации логов и трассировок в Grafana. Если вы внесли изменения в схему OTel по умолчанию и предпочитаете использовать собственные имена столбцов, это можно указать. Использование имен столбцов OTel для таких столбцов, как время (Timestamp), уровень логирования (SeverityText) или тело сообщения (Body), означает, что никаких изменений вносить не нужно.

:::note HTTP или Native
Пользователи могут подключить Grafana к ClickHouse через HTTP или Native протокол. Последний предлагает небольшие преимущества в производительности, которые вряд ли будут заметны в агрегационных запросах, выдаваемых пользователями Grafana. Наоборот, HTTP протокол обычно проще для пользователей в проксировании и инспекции.
:::

Конфигурация логов требует наличия столбцов времени, уровня логирования и сообщения, чтобы логи отображались корректно.

Конфигурация трассировок немного более сложная (полный список [здесь](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)). Необходимые столбцы требуются для того, чтобы последующие запросы, которые строят полный профиль трассировки, могли быть абстрагированы. Эти запросы предполагают, что данные структурированы аналогично OTel, так что пользователям, значительно отклоняющимся от стандартной схемы, нужно будет использовать представления, чтобы воспользоваться этой функцией.

<Image img={observability_15} alt="Конфигурация соединителя" size="sm"/>

После настройки пользователи могут перейти к [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) и начать поиск логов и трассировок.

## Логи {#logs}

Если вы соблюдаете требования Grafana к логам, пользователи могут выбрать `Query Type: Log` в конструкторе запросов и нажать `Run Query`. Конструктор запросов сформирует запрос для перечисления логов и обеспечит их корректное отображение, например:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Конфигурация логов соединителя" size="lg" border/>

Конструктор запросов предоставляет простой способ модифицировать запрос, избегая необходимости писать SQL. Фильтрация, включая поиск логов, содержащих ключевые слова, может выполняться из конструктора запросов. Пользователи, желающие писать более сложные запросы, могут переключиться на SQL редактор. При условии, что возвращаются соответствующие столбцы, а `logs` выбрано как тип запроса, результаты будут отображены как логи. Необходимые столбцы для визуализации логов перечислены [здесь](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format).

### Логи к трассировкам {#logs-to-traces}

Если логи содержат идентификаторы трассировок, пользователи могут воспользоваться возможностью переходить к трассировке для конкретной строки лога.

<Image img={observability_17} alt="Логи к трассировкам" size="lg" border/>

## Трассировки {#traces}

Похожие на вышеописанный опыт работы с логами, если удовлетворяются требования Grafana к столбцам для визуализации трассировок (например, с использованием схемы OTel), конструктор запросов может автоматически формировать необходимые запросы. Выбрав `Query Type: Traces` и нажав `Run Query`, будет сгенерирован и выполнен запрос, подобный следующему (в зависимости от ваших настроенных столбцов - далее предполагается использование OTel):

```sql
SELECT "TraceId" as traceID,
  "ServiceName" as serviceName,
  "SpanName" as operationName,
  "Timestamp" as startTime,
  multiply("Duration", 0.000001) as duration
FROM "default"."otel_traces"
WHERE ( Timestamp >= $__fromTime AND Timestamp <= $__toTime )
  AND ( ParentSpanId = '' )
  AND ( Duration > 0 )
  ORDER BY Timestamp DESC, Duration DESC LIMIT 1000
```

Этот запрос возвращает ожидаемые имена столбцов для Grafana, визуализируя таблицу трассировок, как показано ниже. Фильтрация по продолжительности или другим столбцам может выполняться без необходимости писать SQL.

<Image img={observability_18} alt="Трассировки" size="lg" border/>

Пользователи, желающие писать более сложные запросы, могут переключиться на `SQL Editor`.

### Просмотр деталей трассировки {#view-trace-details}

Как показано выше, идентификаторы трассировки отображаются как кликабельные ссылки. Нажав на идентификатор трассировки, пользователь может выбрать просмотр связанных спанов через ссылку `View Trace`. Это запускает следующий запрос (при условии использования столбцов OTel) для получения спанов в требуемой структуре, визуализируя результаты в виде водопада.

```sql
WITH '<trace_id>' as trace_id,
  (SELECT min(Start) FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) as trace_start,
  (SELECT max(End) + 1 FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) as trace_end
SELECT "TraceId" as traceID,
  "SpanId" as spanID,
  "ParentSpanId" as parentSpanID,
  "ServiceName" as serviceName,
  "SpanName" as operationName,
  "Timestamp" as startTime,
  multiply("Duration", 0.000001) as duration,
  arrayMap(key -> map('key', key, 'value',"SpanAttributes"[key]),
  mapKeys("SpanAttributes")) as tags,
  arrayMap(key -> map('key', key, 'value',"ResourceAttributes"[key]),
  mapKeys("ResourceAttributes")) as serviceTags
FROM "default"."otel_traces"
WHERE traceID = trace_id
  AND startTime >= trace_start
  AND startTime <= trace_end
LIMIT 1000
```

:::note
Обратите внимание, как приведенный выше запрос использует материализованное представление `otel_traces_trace_id_ts` для выполнения поиска по идентификатору трассировки. См. [Ускорение запросов - Использование материализованных представлений для поиска](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups) для получения дополнительной информации.
:::

<Image img={observability_19} alt="Детали трассировки" size="lg" border/>

### Трассировки к логам {#traces-to-logs}

Если логи содержат идентификаторы трассировок, пользователи могут переходить от трассировки к связанным логам. Чтобы просмотреть логи, нажмите на идентификатор трассировки и выберите `View Logs`. Это выполняет следующий запрос, предполагая использование столбцов OTel по умолчанию.

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Трассировки к логам" size="lg" border/>

## Панели мониторинга {#dashboards}

Пользователи могут строить панели мониторинга в Grafana, используя источник данных ClickHouse. Мы рекомендуем ознакомится с документацией по источнику данных Grafana и ClickHouse [здесь](https://github.com/grafana/clickhouse-datasource) для получения дополнительной информации, особенно с [понятием макросов](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) и [переменных](https://grafana.com/docs/grafana/latest/dashboards/variables/).

Плагин предоставляет несколько готовых панелей мониторинга, включая пример панели мониторинга "Простое ClickHouse OTel графическое представление", для логирования и трассировок данных, соответствующих спецификации OTel. Это требует, чтобы пользователи использовали имена столбцов по умолчанию для OTel и может быть установлено из конфигурации источника данных.

<Image img={observability_21} alt="Панели мониторинга" size="lg" border/>

Мы предоставляем несколько простых советов по построению визуализаций ниже.

### Временные ряды {#time-series}

Вместе со статистикой линейные графики являются наиболее распространенной формой визуализации, используемой в сценариях наблюдаемости. Плагин Clickhouse автоматически отобразит линейный график, если запрос возвращает `datetime` с именем `time` и числовой столбец. Например:

```sql
SELECT
 $__timeInterval(Timestamp) as time,
 quantile(0.99)(Duration)/1000000 AS p99
FROM otel_traces
WHERE
 $__timeFilter(Timestamp)
 AND ( Timestamp  >= $__fromTime AND Timestamp <= $__toTime )
GROUP BY time
ORDER BY time ASC
LIMIT 100000
```

<Image img={observability_22} alt="Временные ряды" size="lg" border/>

### Многострочные графики {#multi-line-charts}

Многострочные графики будут автоматически отображаться для запроса, если выполнены следующие условия:

- поле 1: поле datetime с псевдонимом time
- поле 2: значение для группировки. Это должно быть строкой.
- поле 3+: метрики значений

Например:

```sql
SELECT
  $__timeInterval(Timestamp) as time,
  ServiceName,
  quantile(0.99)(Duration)/1000000 AS p99
FROM otel_traces
WHERE $__timeFilter(Timestamp)
AND ( Timestamp  >= $__fromTime AND Timestamp <= $__toTime )
GROUP BY ServiceName, time
ORDER BY time ASC
LIMIT 100000
```

<Image img={observability_23} alt="Многострочные графики" size="lg" border/>

### Визуализация геоданных {#visualizing-geo-data}

Мы рассматривали возможность обогащения данных наблюдаемости геокоординатами с использованием IP-словарей в предыдущих разделах. Предполагая, что у вас есть столбцы `latitude` и `longitude`, наблюдаемость может быть визуализирована с использованием функции `geohashEncode`. Это создает геохеши, совместимые с графиком Geo Map в Grafana. Пример запроса и визуализации показан ниже:

```sql
WITH coords AS
        (
        SELECT
                Latitude,
                Longitude,
                geohashEncode(Longitude, Latitude, 4) AS hash
        FROM otel_logs_v2
        WHERE (Longitude != 0) AND (Latitude != 0)
        )
SELECT
        hash,
        count() AS heat,
        round(log10(heat), 2) AS adj_heat
FROM coords
GROUP BY hash
```

<Image img={observability_24} alt="Визуализация геоданных" size="lg" border/>
