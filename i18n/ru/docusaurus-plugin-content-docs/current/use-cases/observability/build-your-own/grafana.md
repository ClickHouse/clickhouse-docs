---
title: 'Использование Grafana'
description: 'Использование Grafana и ClickHouse для наблюдаемости'
slug: /observability/grafana
keywords: ['наблюдаемость', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
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


# Использование Grafana и ClickHouse для наблюдаемости (Observability)

Grafana является предпочтительным инструментом визуализации данных наблюдаемости в ClickHouse. Это реализуется с помощью официального плагина ClickHouse для Grafana. Пользователи могут следовать инструкциям по установке, доступным [здесь](/integrations/grafana).

Версия 4 плагина делает логи и трейсы полноценными сущностями в новом конструкторе запросов. Это снижает необходимость для SRE писать SQL‑запросы и упрощает наблюдаемость на основе SQL, продвигая вперёд это зарождающееся направление.
Часть этой работы — перенести OpenTelemetry (OTel) в основу плагина, поскольку мы считаем, что именно это станет фундаментом SQL‑ориентированной наблюдаемости в ближайшие годы и определит, как будут собираться данные.



## Интеграция с OpenTelemetry {#open-telemetry-integration}

При настройке источника данных ClickHouse в Grafana плагин позволяет пользователю указать базу данных и таблицу по умолчанию для логов и трейсов, а также отметить, соответствуют ли эти таблицы схеме OTel. Это позволяет плагину возвращать столбцы, необходимые для корректного отображения логов и трейсов в Grafana. Если вы внесли изменения в стандартную схему OTel и предпочитаете использовать собственные имена столбцов, их можно явно задать. При использовании стандартных имён столбцов OTel для таких полей, как время (`Timestamp`), уровень логирования (`SeverityText`) или тело сообщения (`Body`), никаких изменений вносить не требуется.

:::note HTTP or Native
Пользователи могут подключать Grafana к ClickHouse как по протоколу HTTP, так и по протоколу Native. Второй даёт незначительное преимущество в производительности, которое вряд ли будет заметно в агрегирующих запросах, выполняемых пользователями Grafana. Напротив, протокол HTTP обычно проще проксировать и инспектировать.
:::

Конфигурация Logs требует указания столбцов времени, уровня логирования и сообщения, чтобы логи отображались корректно.

Конфигурация Traces немного сложнее (полный перечень столбцов приведён [здесь](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)). Необходимые здесь столбцы требуются для того, чтобы последующие запросы, формирующие полный профиль трейса, могли выполняться автоматически. Эти запросы предполагают, что данные структурированы аналогично OTel, поэтому пользователям, существенно отклоняющимся от стандартной схемы, потребуется использовать представления (views), чтобы воспользоваться этой возможностью.

<Image img={observability_15} alt="Конфигурация коннектора" size="sm"/>

После завершения настройки пользователи могут перейти в [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) и начать поиск по логам и трейсам.



## Логи

Если соблюдаются требования Grafana к логам, пользователи могут выбрать `Query Type: Log` в конструкторе запросов и нажать `Run Query`. Конструктор сформирует запрос для вывода логов и их корректного отображения, например:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Настройка логов коннектора" size="lg" border />

Конструктор запросов предоставляет простой способ изменять запрос, устраняя необходимость писать SQL. Фильтрацию, включая поиск логов, содержащих ключевые слова, можно выполнять в конструкторе запросов. Пользователи, которым нужны более сложные запросы, могут переключиться в SQL-редактор. При условии, что возвращаются соответствующие столбцы и в качестве Query Type выбрано `logs`, результаты будут отображаться как логи. Требуемые столбцы для отображения логов перечислены [здесь](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format).

### Логи в трейсы

Если логи содержат идентификаторы трейсов (trace IDs), пользователи могут воспользоваться возможностью перейти к трейсу для конкретной строки лога.

<Image img={observability_17} alt="Логи в трейсы" size="lg" border />


## Трейсы

Аналогично описанному выше опыту работы с логами, если в таблице есть все столбцы, необходимые Grafana для отображения трейсов (например, при использовании схемы OTel), конструктор запросов может автоматически формировать нужные запросы. При выборе `Query Type: Traces` и нажатии `Run Query` будет сгенерирован и выполнен запрос, аналогичный приведённому ниже (в зависимости от настроенных столбцов — далее предполагается использование OTel):

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

Этот запрос возвращает имена столбцов, которые ожидает Grafana, и отображает таблицу трейсов, как показано ниже. Фильтрацию по длительности или другим столбцам можно выполнять, не прибегая к написанию SQL‑запросов.

<Image img={observability_18} alt="Трейсы" size="lg" border />

Пользователи, которым нужны более сложные запросы, могут переключиться в `SQL Editor`.

### Просмотр деталей трейса

Как показано выше, идентификаторы трейсов отображаются в виде активных ссылок. При нажатии на идентификатор трейса пользователь может выбрать ссылку `View Trace` для просмотра связанных спанов. Это выполняет следующий запрос (при условии наличия столбцов OTel) для получения спанов в требуемой структуре и отображения результатов в виде диаграммы‑водопада.

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
Обратите внимание, что в приведённом выше запросе используется материализованное представление `otel_traces_trace_id_ts` для поиска по идентификатору трассировки. Подробнее см. в разделе [Ускорение запросов — использование материализованных представлений для поиска](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups).
:::

<Image img={observability_19} alt="Сведения о трассировке" size="lg" border />

### Переход от трассировок к логам

Если логи содержат идентификаторы трассировок, пользователи могут переходить от трассировки к соответствующим логам. Чтобы просмотреть логи, щёлкните идентификатор трассировки и выберите `View Logs`. Это выполнит следующий запрос при использовании стандартных столбцов OTel.

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Трейсы в логи" size="lg" border />


## Дашборды

Пользователи могут создавать дашборды в Grafana, используя источник данных ClickHouse. Рекомендуем ознакомиться с [документацией по источнику данных](https://github.com/grafana/clickhouse-datasource) Grafana и ClickHouse для получения дополнительной информации, в частности о [концепции макросов](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) и [переменных](https://grafana.com/docs/grafana/latest/dashboards/variables/).

Плагин предоставляет несколько готовых дашбордов, включая пример дашборда «Simple ClickHouse OTel dashboarding» для логов и трейсов, соответствующих спецификации OTel. Для этого пользователям необходимо придерживаться стандартных названий столбцов для OTel; дашборд можно установить из конфигурации источника данных.

<Image img={observability_21} alt="Dashboards" size="lg" border />

Ниже приведены несколько простых советов по построению визуализаций.

### Временные ряды

Наряду со статистикой, линейные графики являются наиболее распространённой формой визуализации, используемой в сценариях наблюдаемости. Плагин ClickHouse автоматически построит линейный график, если запрос возвращает `datetime` с именем `time` и числовой столбец. Например:

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

### Многолинейные графики

Многолинейные графики будут автоматически построены для запроса, если выполняются следующие условия:

* поле 1: поле типа datetime с псевдонимом time
* поле 2: значение для группировки. Тип — String
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

<Image img={observability_23} alt="Многолинейные графики" size="lg" border />

### Визуализация геоданных

Ранее мы рассмотрели обогащение данных наблюдаемости геокоординатами с использованием IP-словарей. Если у вас есть столбцы `latitude` и `longitude`, данные наблюдаемости можно визуализировать с помощью функции `geohashEncode`. Она генерирует геохэши, совместимые с графиком Geo Map в Grafana. Ниже приведены пример запроса и его визуализации:

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
