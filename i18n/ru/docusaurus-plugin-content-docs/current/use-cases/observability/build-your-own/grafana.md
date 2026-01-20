---
title: "Использование Grafana"
description: "Использование Grafana и ClickHouse для обеспечения наблюдаемости"
slug: /observability/grafana
keywords: ['Observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
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

# Использование Grafana и ClickHouse для Observability \{#using-grafana-and-clickhouse-for-observability\}

Grafana является предпочтительным инструментом визуализации данных Observability в ClickHouse. Это достигается с помощью официального плагина ClickHouse для Grafana. Пользователи могут следовать инструкциям по установке, приведённым [здесь](/integrations/grafana).

Версия 4 плагина делает логи и трейсы полноправными объектами в новом конструкторе запросов. Это снижает необходимость для SRE-инженеров писать SQL‑запросы и упрощает Observability на основе SQL, продвигая вперёд этот зарождающийся подход.
Частью этого стало размещение OpenTelemetry (OTel) в основе плагина, поскольку мы считаем, что в ближайшие годы именно это станет фундаментом Observability на основе SQL и определит, как будут собираться данные.

## Интеграция с OpenTelemetry \{#open-telemetry-integration\}

При настройке источника данных ClickHouse в Grafana плагин позволяет пользователю указать базу данных и таблицу по умолчанию для логов и трейсов, а также задать, соответствуют ли эти таблицы схеме OTel. Это позволяет плагину возвращать столбцы, необходимые для корректного отображения логов и трейсов в Grafana. Если вы внесли изменения в стандартную схему OTel и предпочитаете использовать собственные имена столбцов, их можно указать здесь. Использование стандартных имен столбцов OTel для таких столбцов, как время (`Timestamp`), уровень логирования (`SeverityText`) или тело сообщения (`Body`), означает, что никаких изменений вносить не требуется.

:::note HTTP или Native
Вы можете подключать Grafana к ClickHouse как по протоколу HTTP, так и по протоколу Native. Последний обеспечивает незначительные преимущества в производительности, которые вряд ли будут заметны в агрегирующих запросах, выполняемых пользователями Grafana. Напротив, протокол HTTP, как правило, проще вам проксировать и анализировать.
:::

Конфигурация Logs требует указать столбцы времени, уровня логирования и сообщения, чтобы логи отображались корректно.

Конфигурация Traces немного сложнее (полный список [здесь](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)). Необходимые здесь столбцы нужны для того, чтобы последующие запросы, формирующие полный профиль трейса, могли работать независимо от конкретной структуры таблиц. Эти запросы предполагают, что данные имеют структуру, аналогичную OTel, поэтому пользователям, существенно отклоняющимся от стандартной схемы, потребуется использовать представления, чтобы воспользоваться этой функцией.

<Image img={observability_15} alt="Конфигурация коннектора" size="sm"/>

После настройки вы можете перейти в [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) и начать поиск по логам и трейсам.

## Логи \{#logs\}

Если вы соблюдаете требования Grafana к логам, вы можете выбрать `Query Type: Log` в конструкторе запросов и нажать `Run Query`. Конструктор запросов сформирует запрос для вывода списка логов и обеспечит их отображение, например:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Конфигурация логов коннектора" size="lg" border />

Конструктор запросов предоставляет простой способ изменения запроса, избавляя вас от необходимости писать SQL. Фильтрацию, включая поиск логов, содержащих ключевые слова, можно выполнять прямо в конструкторе запросов. Пользователи, которым нужно писать более сложные запросы, могут переключиться в SQL-редактор. Если возвращаются необходимые столбцы и `logs` выбрано в качестве типа запроса (Query Type), результаты будут отображаться как логи. Требуемые столбцы для отображения логов перечислены [здесь](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format).


### Переход от логов к трассам \{#logs-to-traces\}

Если логи содержат идентификаторы трассировок (trace IDs), вы можете воспользоваться возможностью перейти к соответствующей трассе для конкретной строки лога.

<Image img={observability_17} alt="Logs to traces" size="lg" border/>

## Трейсы \{#traces\}

Аналогично описанному выше сценарию работы с логами, если таблица содержит все столбцы, необходимые Grafana для отображения трейсов (например, при использовании схемы OTel), конструктор запросов сможет автоматически формировать нужные запросы. При выборе `Query Type: Traces` и нажатии `Run Query` будет сгенерирован и выполнен запрос, аналогичный приведённому ниже (в зависимости от настроенных столбцов — далее предполагается использование OTel):

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

Этот запрос возвращает имена столбцов, которые ожидает Grafana, и отображает таблицу трейсов, как показано ниже. Фильтрацию по длительности или другим столбцам можно выполнять, не прибегая к написанию SQL-запросов.

<Image img={observability_18} alt="Трейсы" size="lg" border />

Пользователи, желающие писать более сложные запросы, могут переключиться на `SQL Editor`.

### Просмотр деталей трейса \{#view-trace-details\}

Как показано выше, идентификаторы трейсов (Trace ID) отображаются как ссылки, по которым можно перейти. При нажатии на идентификатор трейса пользователь может выбрать просмотр связанных спанов по ссылке `View Trace`. При этом выполняется следующий запрос (при условии использования столбцов OTel) для получения спанов в требуемой структуре и отображения результата в виде диаграммы водопада.

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
Обратите внимание, что приведённый выше запрос использует материализованное представление `otel_traces_trace_id_ts` для поиска трассы по её идентификатору. Подробности см. в разделе [Ускорение запросов — использование материализованных представлений для быстрого поиска](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups).
:::

<Image img={observability_19} alt="Сведения о трассировке" size="lg" border />

### Переход от трейсов к логам \{#traces-to-logs\}

Если логи содержат идентификаторы трассировки (trace&#95;id), вы можете переходить от трейса к связанным с ним логам. Чтобы просмотреть логи, нажмите на trace&#95;id и выберите `View Logs`. Будет выполнен следующий запрос при условии использования стандартных столбцов OTel.

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Переход от трейсов к логам" size="lg" border />


## Дашборды \{#dashboards\}

Вы можете создавать дашборды в Grafana, используя источник данных ClickHouse. Мы рекомендуем [документацию по источнику данных для Grafana и ClickHouse](https://github.com/grafana/clickhouse-datasource) для получения дополнительной информации, в частности разделы о [макросах](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) и [переменных](https://grafana.com/docs/grafana/latest/dashboards/variables/).

Плагин предоставляет несколько готовых дашбордов, включая пример дашборда «Простой дашборд OTel в ClickHouse» для логов и трейсов, соответствующих спецификации OTel. Для этого пользователям необходимо использовать стандартные имена столбцов OTel; дашборд можно установить из конфигурации источника данных.

<Image img={observability_21} alt="Дашборды" size="lg" border/>

Ниже приведены несколько простых советов по построению визуализаций.

### Временные ряды \{#time-series\}

Наряду со статистикой линейные графики являются самой распространённой формой визуализации в сценариях наблюдаемости. Плагин ClickHouse автоматически отобразит линейный график, если запрос возвращает столбец типа `datetime` с именем `time` и хотя бы один числовой столбец. Например:

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

<Image img={observability_22} alt="Временные ряды" size="lg" border />

### Многолинейные графики \{#multi-line-charts\}

Многолинейные графики будут автоматически построены для запроса, если соблюдаются следующие условия:

* поле 1: поле типа DateTime с псевдонимом time
* поле 2: значение для группировки. Должно быть типа String.
* поле 3+: значения метрик

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

<Image img={observability_23} alt="Графики с несколькими линиями" size="lg" border />

### Визуализация геоданных \{#visualizing-geo-data\}

Ранее мы рассмотрели обогащение данных наблюдаемости геокоординатами с использованием IP-словарей. Предположим, у вас есть столбцы `latitude` и `longitude`; тогда данные наблюдаемости можно визуализировать с помощью функции `geohashEncode`. Она формирует геохэши, совместимые с диаграммой Geo Map в Grafana. Ниже приведены пример запроса и его визуализация:

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

<Image img={observability_24} alt="Визуализация геоданных" size="lg" border />
