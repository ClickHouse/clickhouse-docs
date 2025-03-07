---
title: Использование Grafana
description: Использование Grafana и ClickHouse для наблюдаемости
slug: /observability/grafana
keywords: [наблюдаемость, логи, трассировки, метрики, OpenTelemetry, Grafana, OTel]
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


# Использование Grafana и ClickHouse для наблюдаемости

Grafana является предпочтительным инструментом визуализации для данных наблюдаемости в ClickHouse. Это достигается с использованием официального плагина ClickHouse для Grafana. Пользователи могут следовать инструкциям по установке, найденным [здесь](/integrations/grafana).

V4 плагина делает логи и трассировки первоклассными гражданами в новом опыте построения запросов. Это снижает необходимость для SRE писать SQL-запросы и упрощает SQL-основанную наблюдаемость, продвигая эту новую парадигму. Часть этого достигается за счет размещения Open Telemetry (OTel) в центре плагина, так как мы считаем, что это станет основой SQL-основанной наблюдаемости в ближайшие годы и тем, как будут собираться данные.

## Интеграция Open Telemetry {#open-telemetry-integration}

При настройке источника данных ClickHouse в Grafana плагин позволяет пользователям указать базу данных и таблицу по умолчанию для логов и трассировок, а также соответствуют ли эти таблицы схеме OTel. Это позволяет плагину возвращать колонки, необходимые для корректного отображения логов и трассировок в Grafana. Если вы внесли изменения в схему OTel по умолчанию и предпочитаете использовать свои собственные имена колонок, их можно указать. Использование стандартных имен колонок OTel для таких колонок, как время (Timestamp), уровень логирования (SeverityText) или тело сообщения (Body), означает, что изменения не требуются.

:::note HTTP или Native
Пользователи могут подключать Grafana к ClickHouse как по протоколу HTTP, так и по протоколу Native. Последний предлагает незначительные преимущества по производительности, которые вряд ли будут заметны в агрегирующих запросах, выданных пользователями Grafana. В свою очередь, протокол HTTP обычно проще для пользователей для прокси и инспекции.
:::

Конфигурация логов требует наличие колонки времени, уровня логирования и сообщения, чтобы логи отображались корректно.

Конфигурация трассировок немного сложнее (полный список [здесь](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)). Необходимые колонки нужны для того, чтобы последующие запросы, которые строят полный профиль трассировки, могли быть абстрагированы. Эти запросы предполагают, что данные структурированы аналогично OTel, поэтому пользователи, значительно отклоняющиеся от стандартной схемы, будут нуждаться в использовании представлений, чтобы воспользоваться этой функцией.

<a href={observability_15} target="_blank">
  <img src={observability_15}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '400px'}} />
</a>
<br />

После настройки пользователи могут перейти в [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) и начать искать логи и трассировки.

## Логи {#logs}

Если вы придерживаетесь требований Grafana к логам, пользователи могут выбрать `Query Type: Log` в конструкторе запросов и нажать `Run Query`. Конструктор запросов сформулирует запрос для отображения логов и обеспечения их корректного отображения, например:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<a href={observability_16} target="_blank">
  <img src={observability_16}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

Конструктор запросов предоставляет простой способ изменения запроса, избегая необходимости пользователям писать SQL. Фильтрация, включая поиск логов с ключевыми словами, может быть выполнена из конструктора запросов. Пользователи, желающие написать более сложные запросы, могут переключиться на SQL-редактор. При условии, что соответствующие колонки возвращаются, а `logs` выбраны как тип запроса, результаты будут отображены как логи. Необходимые колонки для отображения логов перечислены [здесь](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format).

### Логи к трассировкам {#logs-to-traces}

Если логи содержат идентификаторы трассировки, пользователи могут получить выгоду от возможности навигировать к трассировке для конкретной строки лога.

<a href={observability_17} target="_blank">
  <img src={observability_17}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

## Трассировки {#traces}

Аналогично вышеописанному опыту с логами, если колонки, необходимые для отображения трассировок в Grafana, удовлетворены (например, с использованием схемы OTel), конструктор запросов может автоматически сформулировать необходимые запросы. Выбирая `Query Type: Traces` и нажимая `Run Query`, будет сгенерирован и выполнен запрос, подобный следующему (в зависимости от ваших настроенных колонок - дальнейшее предполагает использование OTel):

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

Этот запрос возвращает имена колонок, ожидаемые Grafana, отображая таблицу трассировок, как показано ниже. Фильтрация по длительности или другим колонкам может быть выполнена без необходимости писать SQL.

<a href={observability_18} target="_blank">
  <img src={observability_18}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

Пользователи, желающие написать более сложные запросы, могут переключиться на `SQL Editor`.

### Просмотр деталей трассировки {#view-trace-details}

Как показано выше, идентификаторы трассировки отображаются как кликабельные ссылки. Нажав на идентификатор трассировки, пользователь может выбрать просмотр ассоциированных спанов через ссылку `View Trace`. Это выполняет следующий запрос (предполагая колонки OTel) для получения спанов в требуемой структуре, отображая результаты как водопад.

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
Обратите внимание, как вышеуказанный запрос использует материализованное представление `otel_traces_trace_id_ts` для выполнения поиска по идентификатору трассировки. См. [Ускорение запросов - Использование материализованных представлений для поиска](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups) для получения дополнительных сведений.
:::

<a href={observability_19} target="_blank">
  <img src={observability_19}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### Трассировки к логам {#traces-to-logs}

Если логи содержат идентификаторы трассировки, пользователи могут навигировать от трассировки к соответствующим логам. Чтобы просмотреть логи, нажмите на идентификатор трассировки и выберите `View Logs`. Это выполняет следующий запрос, предполагая стандартные колонки OTel.

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<a href={observability_20} target="_blank">
  <img src={observability_20}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

## Дашборды {#dashboards}

Пользователи могут создавать дашборды в Grafana, используя источник данных ClickHouse. Мы рекомендуем ознакомиться с [документацией по источнику данных Grafana и ClickHouse](https://github.com/grafana/clickhouse-datasource) для получения дополнительных деталей, особенно с [концепцией макросов](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) и [переменных](https://grafana.com/docs/grafana/latest/dashboards/variables/).

Плагин предлагает несколько готовых дашбордов, включая пример дашборда «Простой дашборд ClickHouse OTel» для данных логирования и трассировки, соответствующих спецификации OTel. Это требует, чтобы пользователи соответствовали стандартным именам колонок OTel и может быть установлен из конфигурации источника данных.

<a href={observability_21} target="_blank">
  <img src={observability_21}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

Мы предоставляем несколько простых советов по созданию визуализаций ниже.

### Временные ряды {#time-series}

Помимо статистики, линейные графики являются самой распространенной формой визуализации, используемой в случаях наблюдаемости. Плагин Clickhouse автоматически отобразит линейный график, если запрос возвращает `datetime`, именованный `time`, и числовую колонку. Например:

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

<a href={observability_22} target="_blank">
  <img src={observability_22}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### Мульти-линиейные графики {#multi-line-charts}

Мульти-линиейные графики будут автоматически отображаться для запроса при соблюдении следующих условий:

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

<a href={observability_23} target="_blank">
  <img src={observability_23}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### Визуализация геоданных {#visualizing-geo-data}

Мы исследовали возможность обогащения данных наблюдаемости геокоординатами, используя IP-словарь в предыдущих разделах. Предполагая, что у вас есть колонки `latitude` и `longitude`, наблюдаемость может быть визуализирована с использованием функции `geohashEncode`. Это производит геохэши, совместимые с графиком Geo Map в Grafana. Пример запроса и визуализации показаны ниже:

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

<a href={observability_24} target="_blank">
  <img src={observability_24}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />
