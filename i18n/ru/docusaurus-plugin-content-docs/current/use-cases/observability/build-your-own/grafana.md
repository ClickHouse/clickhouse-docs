---
title: 'Использование Grafana'
description: 'Использование Grafana и ClickHouse для наблюдаемости'
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


# Использование Grafana и ClickHouse для Observability

Grafana — предпочтительный инструмент визуализации данных Observability в ClickHouse. Это реализовано с помощью официального плагина ClickHouse для Grafana. Инструкции по установке доступны по ссылке [здесь](/integrations/grafana).

Версия 4 плагина делает логи и трейсы полноправными сущностями в новом конструкторе запросов. Это снижает необходимость для SRE писать SQL-запросы и упрощает Observability на основе SQL, способствуя развитию этого нового подхода.
Часть этой работы заключалась в том, чтобы положить OpenTelemetry (OTel) в основу плагина, поскольку мы считаем, что именно это станет фундаментом SQL-ориентированного Observability в ближайшие годы и определит, как будут собираться данные.



## Интеграция с OpenTelemetry {#open-telemetry-integration}

При настройке источника данных ClickHouse в Grafana плагин позволяет указать базу данных и таблицу по умолчанию для логов и трассировок, а также определить, соответствуют ли эти таблицы схеме OTel. Это позволяет плагину возвращать столбцы, необходимые для корректного отображения логов и трассировок в Grafana. Если вы внесли изменения в стандартную схему OTel и предпочитаете использовать собственные имена столбцов, их можно указать. Использование стандартных имен столбцов OTel для таких столбцов, как время (`Timestamp`), уровень логирования (`SeverityText`) или тело сообщения (`Body`), означает, что никаких изменений вносить не требуется.

:::note HTTP или Native
Пользователи могут подключить Grafana к ClickHouse через протокол HTTP или Native. Последний обеспечивает незначительные преимущества в производительности, которые вряд ли будут заметны в агрегационных запросах, выполняемых пользователями Grafana. В то же время протокол HTTP обычно проще для проксирования и анализа.
:::

Конфигурация логов требует наличия столбцов времени, уровня логирования и сообщения для корректного отображения логов.

Конфигурация трассировок несколько сложнее (полный список [здесь](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)). Необходимые столбцы требуются для того, чтобы можно было абстрагировать последующие запросы, которые формируют полный профиль трассировки. Эти запросы предполагают, что данные структурированы аналогично OTel, поэтому пользователям, значительно отклоняющимся от стандартной схемы, потребуется использовать представления для работы с этой функцией.

<Image img={observability_15} alt='Конфигурация коннектора' size='sm' />

После настройки пользователи могут перейти в [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) и начать поиск логов и трассировок.


## Логи {#logs}

При соблюдении требований Grafana к логам пользователи могут выбрать `Query Type: Log` в конструкторе запросов и нажать `Run Query`. Конструктор запросов сформирует запрос для получения списка логов и обеспечит их корректное отображение, например:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt='Конфигурация логов коннектора' size='lg' border />

Конструктор запросов предоставляет простой способ модификации запроса, избавляя пользователей от необходимости писать SQL. Фильтрация, включая поиск логов по ключевым словам, может выполняться непосредственно из конструктора запросов. Пользователи, желающие написать более сложные запросы, могут переключиться на SQL-редактор. При условии, что возвращаются соответствующие столбцы и в качестве Query Type выбрано `logs`, результаты будут отображены в виде логов. Необходимые столбцы для отображения логов перечислены [здесь](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format).

### Переход от логов к трейсам {#logs-to-traces}

Если логи содержат идентификаторы трейсов, пользователи могут воспользоваться возможностью перехода к трейсу для конкретной строки лога.

<Image img={observability_17} alt='Переход от логов к трейсам' size='lg' border />


## Трассировки {#traces}

Аналогично описанному выше опыту работы с логами, если присутствуют столбцы, необходимые Grafana для отображения трассировок (например, при использовании схемы OTel), конструктор запросов автоматически формирует необходимые запросы. При выборе `Query Type: Traces` и нажатии `Run Query` будет сгенерирован и выполнен запрос, подобный следующему (в зависимости от настроенных столбцов — далее предполагается использование OTel):

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

Этот запрос возвращает имена столбцов, ожидаемые Grafana, и отображает таблицу трассировок, как показано ниже. Фильтрацию по длительности или другим столбцам можно выполнять без написания SQL.

<Image img={observability_18} alt='Traces' size='lg' border />

Пользователи, желающие писать более сложные запросы, могут переключиться на `SQL Editor`.

### Просмотр деталей трассировки {#view-trace-details}

Как показано выше, идентификаторы трассировок отображаются в виде кликабельных ссылок. При нажатии на идентификатор трассировки пользователь может просмотреть связанные спаны через ссылку `View Trace`. При этом выполняется следующий запрос (предполагая столбцы OTel) для получения спанов в требуемой структуре с отображением результатов в виде каскадной диаграммы.

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
Обратите внимание, что приведенный выше запрос использует материализованное представление `otel_traces_trace_id_ts` для поиска по идентификатору трассировки. Подробнее см. [Ускорение запросов - Использование материализованных представлений для поиска](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups).
:::

<Image img={observability_19} alt='Trace Details' size='lg' border />

### От трассировок к логам {#traces-to-logs}

Если логи содержат идентификаторы трассировок, пользователи могут переходить от трассировки к связанным с ней логам. Чтобы просмотреть логи, нажмите на идентификатор трассировки и выберите `View Logs`. При этом выполняется следующий запрос, предполагая столбцы OTel по умолчанию.

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt='Traces to logs' size='lg' border />


## Дашборды {#dashboards}

Пользователи могут создавать дашборды в Grafana, используя источник данных ClickHouse. Для получения дополнительной информации рекомендуем обратиться к [документации по источнику данных](https://github.com/grafana/clickhouse-datasource) Grafana и ClickHouse, особенно к разделам о [концепции макросов](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) и [переменных](https://grafana.com/docs/grafana/latest/dashboards/variables/).

Плагин предоставляет несколько готовых дашбордов, включая пример «Simple ClickHouse OTel dashboarding» для данных логирования и трассировки, соответствующих спецификации OTel. Для его использования необходимо придерживаться стандартных имён столбцов OTel. Дашборд можно установить из конфигурации источника данных.

<Image img={observability_21} alt='Дашборды' size='lg' border />

Ниже приведены несколько простых рекомендаций по созданию визуализаций.

### Временные ряды {#time-series}

Наряду со статистикой линейные графики являются наиболее распространённой формой визуализации в сценариях наблюдаемости. Плагин ClickHouse автоматически отобразит линейный график, если запрос возвращает поле `datetime` с именем `time` и числовой столбец. Например:

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

<Image img={observability_22} alt='Временные ряды' size='lg' border />

### Многолинейные графики {#multi-line-charts}

Многолинейные графики будут автоматически отображены для запроса при соблюдении следующих условий:

- поле 1: поле datetime с псевдонимом time
- поле 2: значение для группировки. Должно быть типа String.
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

<Image img={observability_23} alt='Многолинейные графики' size='lg' border />

### Визуализация геоданных {#visualizing-geo-data}

В предыдущих разделах мы рассмотрели обогащение данных наблюдаемости геокоординатами с использованием IP-словарей. При наличии столбцов `latitude` и `longitude` данные наблюдаемости можно визуализировать с помощью функции `geohashEncode`. Она создаёт геохеши, совместимые с диаграммой Geo Map в Grafana. Ниже показан пример запроса и визуализации:

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

<Image img={observability_24} alt='Визуализация геоданных' size='lg' border />
