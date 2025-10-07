---
'title': 'Использование Grafana'
'description': 'Использование Grafana и ClickHouse для мониторинга'
'slug': '/observability/grafana'
'keywords':
- 'Observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'show_related_blogs': true
'doc_type': 'guide'
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

V4 плагина делает логи и трассировки первоклассными гражданами в новом интерфейсе построения запросов. Это минимизирует необходимость для SRE писать SQL-запросы и упрощает мониторинг на основе SQL, продвигая эту новую парадигму вперед. Часть этого заключается в том, что OpenTelemetry (OTel) находится в центре плагина, так как мы считаем, что это будет основой мониторинга на основе SQL в течение следующих нескольких лет и способом, которым будут собираться данные.

## Интеграция OpenTelemetry {#open-telemetry-integration}

При настройке источника данных ClickHouse в Grafana плагин позволяет пользователю указать базу данных и таблицу по умолчанию для логов и трассировок, а также соответствуют ли эти таблицы схеме OTel. Это позволяет плагину возвращать необходимые колонки для правильного рендеринга логов и трассировок в Grafana. Если вы внесли изменения в схему OTel по умолчанию и предпочитаете использовать свои собственные названия колонок, их можно указать. Использование стандартных названий колонок OTel, таких как время (`Timestamp`), уровень логирования (`SeverityText`) или тело сообщения (`Body`), означает, что изменения вносить не нужно.

:::note HTTP или Native
Пользователи могут подключать Grafana к ClickHouse по протоколу HTTP или Native. Последний предлагает незначительные преимущества в производительности, которые вряд ли будут заметны в агрегационных запросах, выполняемых пользователями Grafana. С другой стороны, протокол HTTP обычно проще для проксирования и инспекции пользователями.
:::

Конфигурация логов требует колонки времени, уровня логирования и сообщения, чтобы логи отображались корректно.

Конфигурация трассировок немного сложнее (полный список [здесь](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)). Необходимые колонки необходимы для того, чтобы последующие запросы, которые строят полный профиль трассировки, могли быть абстрагированы. Эти запросы предполагают, что данные структурированы аналогично OTel, поэтому пользователи, существенно отклоняющиеся от стандартной схемы, должны использовать представления, чтобы воспользоваться этой функцией.

<Image img={observability_15} alt="Настройки соединителя" size="sm"/>

После настройки пользователи могут перейти в [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) и начать искать логи и трассировки.

## Логи {#logs}

Если соблюдать требования Grafana к логам, пользователи могут выбрать `Query Type: Log` в конструкторе запросов и нажать `Run Query`. Конструктор запросов сформирует запрос для получения списка логов и убедится, что они отображаются, например:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Настройки логов соединителя" size="lg" border/>

Конструктор запросов предоставляет простой способ модификации запроса, избегая необходимости писать SQL пользователям. Фильтрация, включая поиск логов с ключевыми словами, может быть выполнена из конструктора запросов. Пользователи, желающие писать более сложные запросы, могут переключиться в SQL-редактор. При условии, что возвращаются соответствующие колонки, и `logs` выбраны как тип запроса, результаты будут отображаться как логи. Необходимые колонки для рендеринга логов перечислены [здесь](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format).

### Логи к трассировкам {#logs-to-traces}

Если логи содержат идентификаторы трассировок, пользователи могут воспользоваться возможностью перейти к трассировке для конкретной строки лога.

<Image img={observability_17} alt="Логи к трассировкам" size="lg" border/>

## Трассировки {#traces}

Похожим образом, если колонки, необходимые Grafana для отображения трассировок, удовлетворяют требованиям (например, при использовании схемы OTel), конструктор запросов может автоматически сформировать необходимые запросы. Выбирая `Query Type: Traces` и нажимая `Run Query`, будет сгенерирован и выполнен запрос, похожий на следующий (в зависимости от настроенных вами колонок - следующее предполагает использование OTel):

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

Этот запрос возвращает ожидаемые именем колонок Grafana, отображая таблицу трассировок, как показано ниже. Фильтрация по продолжительности или другим колонкам может быть выполнена без необходимости писать SQL.

<Image img={observability_18} alt="Трассировки" size="lg" border/>

Пользователи, желающие писать более сложные запросы, могут переключиться в `SQL Editor`.

### Просмотр деталей трассировки {#view-trace-details}

Как показано выше, идентификаторы трассировок отображаются как кликабельные ссылки. Нажимая на идентификатор трассировки, пользователь может выбрать просмотр связанных спанов через ссылку `View Trace`. Это выполняет следующий запрос (предполагая колонки OTel) для получения спанов в требуемой структуре, рендеря результаты в виде водопада.

```sql
WITH '<trace_id>' AS trace_id,
  (SELECT min(Start) FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) AS trace_start,
  (SELECT max(End) + 1 FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) AS trace_end
SELECT "TraceId" AS traceID,
  "SpanId" AS spanID,
  "ParentSpanId" AS parentSpanID,
  "ServiceName" AS serviceName,
  "SpanName" AS operationName,
  "Timestamp" AS startTime,
  multiply("Duration", 0.000001) AS duration,
  arrayMap(key -> map('key', key, 'value',"SpanAttributes"[key]),
  mapKeys("SpanAttributes")) AS tags,
  arrayMap(key -> map('key', key, 'value',"ResourceAttributes"[key]),
  mapKeys("ResourceAttributes")) AS serviceTags
FROM "default"."otel_traces"
WHERE traceID = trace_id
  AND startTime >= trace_start
  AND startTime <= trace_end
LIMIT 1000
```

:::note
Обратите внимание, как вышеуказанный запрос использует материализованное представление `otel_traces_trace_id_ts` для выполнения поиска идентификатора трассировки. См. [Ускорение запросов - Использование материализованных представлений для поиска](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups) для получения дополнительной информации.
:::

<Image img={observability_19} alt="Детали трассировки" size="lg" border/>

### Трассировки к логам {#traces-to-logs}

Если логи содержат идентификаторы трассировок, пользователи могут перейти от трассировки к связанным логам. Чтобы просмотреть логи, нажмите на идентификатор трассировки и выберите `View Logs`. Это выполняет следующий запрос, предполагая стандартные колонки OTel.

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Трассировки к логам" size="lg" border/>

## Панели мониторинга {#dashboards}

Пользователи могут создавать панели мониторинга в Grafana, используя источник данных ClickHouse. Мы рекомендуем ознакомиться с документацией по источнику данных Grafana и ClickHouse [здесь](https://github.com/grafana/clickhouse-datasource) для получения дополнительной информации, особенно с [концепцией макросов](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) и [переменных](https://grafana.com/docs/grafana/latest/dashboards/variables/).

Плагин предоставляет несколько готовых панелей мониторинга, включая пример панели мониторинга "Простое мониторинг ClickHouse OTel" для данных логирования и трассировки, соответствующих спецификации OTel. Это требует, чтобы пользователи соблюдали стандартные названия колонок для OTel, и может быть установлено из конфигурации источника данных.

<Image img={observability_21} alt="Панели мониторинга" size="lg" border/>

Мы предоставляем некоторые простые советы по созданию визуализаций ниже.

### Временные ряды {#time-series}

Вместе со статистикой линейные диаграммы являются наиболее распространенной формой визуализации, используемой в случаях мониторинга. Плагин Clickhouse автоматически отобразит линейную диаграмму, если запрос возвращает `datetime` с именем `time` и числовую колонку. Например:

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

### Многострочные диаграммы {#multi-line-charts}

Многострочные диаграммы будут автоматически отрисовываться для запроса при условии, что выполнены следующие условия:

- поле 1: поле datetime с псевдонимом time
- поле 2: значение для группировки. Это должно быть строкой.
- поле 3+: значения метрик

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

<Image img={observability_23} alt="Многострочные диаграммы" size="lg" border/>

### Визуализация геоданных {#visualizing-geo-data}

Мы рассматривали обогащение данных мониторинга геокоординатами с использованием IP-словарей в предыдущих разделах. Предполагая, что у вас есть колонки `latitude` и `longitude`, мониторинг можно визуализировать с помощью функции `geohashEncode`. Это создает геохэши, совместимые с картой Geo Map в Grafana. Пример запроса и визуализации показан ниже:

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