---
title: 'Использование Grafana'
description: 'Использование Grafana и ClickHouse для мониторинга'
slug: /observability/grafana
keywords: ['мониторинг', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
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


# Использование Grafana и ClickHouse для мониторинга

Grafana является предпочтительным инструментом визуализации для данных мониторинга в ClickHouse. Это достигается с помощью официального плагина ClickHouse для Grafana. Пользователи могут следовать инструкциям по установке, найденным [здесь](/integrations/grafana).

V4 плагина делает логи и трейсы первоклассными объектами в новом интерфейсе построения запросов. Это минимизирует необходимость для SRE писать SQL запросы и упрощает основанный на SQL мониторинг, двигая вперед эту возникающую парадигму. Часть этого состоит в том, чтобы разместить Open Telemetry (OTel) в центре плагина, так как мы считаем, что это будет основой SQL-основанного мониторинга в ближайшие годы и тем, как будут собираться данные.

## Интеграция Open Telemetry {#open-telemetry-integration}

При настройке источника данных Clickhouse в Grafana, плагин позволяет пользователям указать базу данных и таблицу по умолчанию для логов и трейсов и соответствуют ли эти таблицы схеме OTel. Это позволяет плагину возвращать необходимые колонки для правильного отображения логов и трейсов в Grafana. Если вы изменили стандартную схему OTel и предпочитаете использовать свои собственные имена колонок, их можно указать. Использование стандартных имен колонок OTel для колонок, таких как время (Timestamp), уровень лога (SeverityText) или тело сообщения (Body), означает, что изменения не нужно вносить.

:::note HTTP или Native
Пользователи могут подключать Grafana к ClickHouse по протоколу HTTP или Native. Последний предлагает незначительные преимущества в производительности, которые, вероятно, не будут заметны в агрегатных запросах, выдаваемых пользователями Grafana. В то же время, протокол HTTP обычно проще для проксирования и инспекции пользователями.
:::

Конфигурация логов требует наличия колонки времени, уровня лога и сообщения для правильного отображения логов.

Конфигурация трейсов немного сложнее (полный список [здесь](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)). Здесь требуется наличие колонок, необходимых для того, чтобы последующие запросы, которые строят полный профиль трейса, могли быть абстрагированы. Эти запросы предполагают, что данные структурированы аналогично OTel, поэтому пользователи, значительно отклоняющиеся от стандартной схемы, должны использовать представления, чтобы воспользоваться этой функцией.

<Image img={observability_15} alt="Конфигурация подключения" size="sm"/>


После настройки пользователи могут перейти в [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) и начать поиск логов и трейсов.

## Логи {#logs}

Если следовать требованиям Grafana к логам, пользователи могут выбрать `Query Type: Log` в построителе запросов и нажать `Run Query`. Построитель запросов сформирует запрос для отображения логов и обеспечит их вывод, например:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Конфигурация логов подключения" size="lg" border/>

Построитель запросов предоставляет простой способ изменения запроса, избегая необходимости пользователям писать SQL. Фильтрация, включая поиск логов, содержащих ключевые слова, может быть выполнена из построителя запросов. Пользователи, желающие писать более сложные запросы, могут переключиться на SQL редактор. Если возвращаются соответствующие колонки, и выбраны `logs` как Тип Запроса, результаты будут отображены как логи. Требуемые колонки для отображения логов перечислены [здесь](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format).

### Логи к трейсам {#logs-to-traces}

Если логи содержат идентификаторы трасс, пользователи могут воспользоваться возможностью перейти к трассе для конкретной строки лога.

<Image img={observability_17} alt="Логи к трейсам" size="lg" border/>

## Трейсы {#traces}

Подобно вышеописанному опыту работы с логами, если удовлетворены колонки, необходимые Grafana для отображения трейсов (например, при использовании схемы OTel), построитель запросов может автоматически сформировать необходимые запросы. Выбрав `Query Type: Traces` и нажав `Run Query`, будет сгенерирован и выполнен запрос, аналогичный следующему (в зависимости от ваших настроенных колонок - следующее предполагает использование OTel):

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

Этот запрос возвращает имена колонок, ожидаемые Grafana, выводя таблицу трейсов, как показано ниже. Фильтрация по длительности или другим колонкам может быть выполнена без необходимости написания SQL.

<Image img={observability_18} alt="Трейсы" size="lg" border/>

Пользователи, желающие писать более сложные запросы, могут переключиться на `SQL Editor`.

### Просмотр деталей трейса {#view-trace-details}

Как показано выше, идентификаторы трасс отображаются как кликабельные ссылки. Нажав на идентификатор трассы, пользователь может выбрать просмотр связанных спанов через ссылку `View Trace`. Это выполняет следующий запрос (предполагая колонки OTel), чтобы получить спаны в требуемой структуре, отображая результаты в виде водопада.

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
Обратите внимание, как приведенный выше запрос использует материализованное представление `otel_traces_trace_id_ts` для выполнения поиска идентификатора трассы. См. [Ускорение запросов - Использование материализованных представлений для поиска](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups) для получения дополнительных сведений.
:::

<Image img={observability_19} alt="Детали трейса" size="lg" border/>

### Трейсы к логам {#traces-to-logs}

Если логи содержат идентификаторы трасс, пользователи могут перейти от трассы к связанным логам. Чтобы просмотреть логи, нажмите на идентификатор трассы и выберите `View Logs`. Это выполняет следующий запрос, предполагая, что используются стандартные колонки OTel.

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Трейсы к логам" size="lg" border/>

## Панели инструментов {#dashboards}

Пользователи могут создавать панели инструментов в Grafana, используя источник данных ClickHouse. Мы рекомендуем ознакомиться с документацией по источнику данных Grafana и ClickHouse [здесь](https://github.com/grafana/clickhouse-datasource) для получения дополнительных сведений, особенно с [понятием макросов](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) и [переменных](https://grafana.com/docs/grafana/latest/dashboards/variables/).

Плагин предоставляет несколько готовых панелей инструментов, включая пример панели инструментов "Простая панель инструментов OTel ClickHouse" для данных логирования и трассировки, которые соответствуют спецификации OTel. Это требует от пользователей соблюдения стандартных имен колонок для OTel и может быть установлено из конфигурации источника данных.

<Image img={observability_21} alt="Панели инструментов" size="lg" border/>

Мы предоставляем несколько простых советов по созданию визуализаций ниже.

### Временные ряды {#time-series}

Вместе со статистикой линейные графики являются самой распространенной формой визуализации, используемой в случаях мониторинга. Плагин Clickhouse автоматически отобразит линейный график, если запрос возвращает `datetime` с именем `time` и числовую колонку. Например:

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

Многострочные графики будут автоматически отображены для запроса при выполнении следующих условий:

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

Мы рассмотрели обогащение данных мониторинга геокоординатами с использованием IP-словарей в предыдущих разделах. Предполагая, что у вас есть колонки `latitude` и `longitude`, данные мониторинга могут быть визуализированы с использованием функции `geohashEncode`. Это производит геохеши, совместимые с графиком Geo Map в Grafana. Пример запроса и визуализации приведены ниже:

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
