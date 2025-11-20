---
title: 'Использование Grafana'
description: 'Использование Grafana и ClickHouse для обеспечения наблюдаемости'
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

Grafana является предпочтительным инструментом визуализации данных Observability в ClickHouse. Это реализуется с помощью официального плагина ClickHouse для Grafana. Пользователи могут следовать инструкциям по установке, доступным [здесь](/integrations/grafana).

Четвёртая версия плагина делает логи и трейсы «полноправными гражданами» в новом конструкторе запросов. Это снижает необходимость для SRE писать SQL‑запросы и упрощает SQL‑ориентированную Observability, продвигая вперёд это формирующееся направление.
Часть этой работы заключалась в том, чтобы сделать OpenTelemetry (OTel) центральным элементом плагина, поскольку мы считаем, что в ближайшие годы это станет основой Observability на основе SQL и способом сбора данных.



## Интеграция с OpenTelemetry {#open-telemetry-integration}

При настройке источника данных ClickHouse в Grafana плагин позволяет указать базу данных и таблицу по умолчанию для логов и трассировок, а также определить, соответствуют ли эти таблицы схеме OTel. Это позволяет плагину возвращать столбцы, необходимые для корректного отображения логов и трассировок в Grafana. Если вы внесли изменения в стандартную схему OTel и предпочитаете использовать собственные имена столбцов, их можно указать. Использование стандартных имен столбцов OTel для таких столбцов, как время (`Timestamp`), уровень логирования (`SeverityText`) или тело сообщения (`Body`), означает, что никаких изменений вносить не требуется.

:::note HTTP или Native
Пользователи могут подключить Grafana к ClickHouse через протокол HTTP или Native. Последний обеспечивает незначительные преимущества в производительности, которые вряд ли будут заметны в агрегационных запросах, выполняемых пользователями Grafana. С другой стороны, протокол HTTP обычно проще для проксирования и мониторинга.
:::

Конфигурация логов требует наличия столбцов времени, уровня логирования и сообщения для корректного отображения логов.

Конфигурация трассировок немного сложнее (полный список [здесь](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)). Необходимые столбцы требуются для того, чтобы можно было абстрагировать последующие запросы, которые формируют полный профиль трассировки. Эти запросы предполагают, что данные структурированы аналогично OTel, поэтому пользователям, значительно отклоняющимся от стандартной схемы, потребуется использовать представления для работы с этой функцией.

<Image img={observability_15} alt='Конфигурация коннектора' size='sm' />

После настройки пользователи могут перейти в [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) и начать поиск логов и трассировок.


## Логи {#logs}

При соблюдении требований Grafana к логам пользователи могут выбрать `Query Type: Log` в конструкторе запросов и нажать `Run Query`. Конструктор запросов сформирует запрос для получения списка логов и обеспечит их корректное отображение, например:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt='Connector logs config' size='lg' border />

Конструктор запросов предоставляет простой способ модификации запроса, избавляя пользователей от необходимости писать SQL. Фильтрация, включая поиск логов по ключевым словам, может выполняться непосредственно из конструктора запросов. Пользователи, которым требуется написать более сложные запросы, могут переключиться на SQL-редактор. При условии, что возвращаются соответствующие столбцы и в качестве Query Type выбрано `logs`, результаты будут отображены в виде логов. Необходимые столбцы для отображения логов перечислены [здесь](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format).

### Переход от логов к трейсам {#logs-to-traces}

Если логи содержат идентификаторы трейсов, пользователи могут перейти к трейсу для конкретной строки лога.

<Image img={observability_17} alt='Logs to traces' size='lg' border />


## Трассировки {#traces}

Аналогично работе с логами, описанной выше, если присутствуют столбцы, необходимые Grafana для отображения трассировок (например, при использовании схемы OTel), конструктор запросов автоматически формирует нужные запросы. При выборе `Query Type: Traces` и нажатии `Run Query` будет сгенерирован и выполнен запрос, подобный следующему (в зависимости от настроенных столбцов — далее предполагается использование OTel):

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

Пользователи, желающие написать более сложные запросы, могут переключиться на `SQL Editor`.

### Просмотр деталей трассировки {#view-trace-details}

Как показано выше, идентификаторы трассировок отображаются в виде кликабельных ссылок. При нажатии на идентификатор трассировки пользователь может просмотреть связанные спаны через ссылку `View Trace`. При этом выполняется следующий запрос (при условии использования столбцов OTel) для получения спанов в требуемой структуре с отображением результатов в виде каскадной диаграммы.

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
Обратите внимание, что приведенный выше запрос использует материализованное представление `otel_traces_trace_id_ts` для поиска по идентификатору трассировки. Подробнее см. в разделе [Ускорение запросов - Использование материализованных представлений для поиска](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups).
:::

<Image img={observability_19} alt='Trace Details' size='lg' border />

### От трассировок к логам {#traces-to-logs}

Если логи содержат идентификаторы трассировок, пользователи могут перейти от трассировки к связанным с ней логам. Чтобы просмотреть логи, нажмите на идентификатор трассировки и выберите `View Logs`. При этом выполняется следующий запрос (при условии использования столбцов OTel по умолчанию).

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt='Traces to logs' size='lg' border />


## Дашборды {#dashboards}

Пользователи могут создавать дашборды в Grafana с использованием источника данных ClickHouse. Для получения дополнительной информации мы рекомендуем обратиться к [документации по источнику данных Grafana и ClickHouse](https://github.com/grafana/clickhouse-datasource), особенно к разделам о [концепции макросов](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) и [переменных](https://grafana.com/docs/grafana/latest/dashboards/variables/).

Плагин поставляется с несколькими готовыми дашбордами, включая пример дашборда «Simple ClickHouse OTel dashboarding» для данных логирования и трассировки, соответствующих спецификации OTel. Для его использования требуется соответствие стандартным именам столбцов OTel, а установить дашборд можно из конфигурации источника данных.

<Image img={observability_21} alt='Дашборды' size='lg' border />

Ниже мы приводим несколько простых советов по созданию визуализаций.

### Временные ряды {#time-series}

Наряду со статистикой линейные графики — наиболее распространённая форма визуализации в сценариях наблюдаемости. Плагин ClickHouse автоматически отобразит линейный график, если запрос возвращает поле типа `datetime` с именем `time` и числовой столбец. Например:

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

<Image img={observability_22} alt='Time series' size='lg' border />

### Графики с несколькими линиями {#multi-line-charts}

Графики с несколькими линиями будут автоматически отображаться для запроса при выполнении следующих условий:

- первое поле: поле типа datetime с псевдонимом `time`;
- второе поле: значение для группировки (должно быть строкового типа);
- поля начиная с третьего: значения метрик.

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

<Image img={observability_23} alt='Multi-line charts' size='lg' border />

### Визуализация геоданных {#visualizing-geo-data}

В предыдущих разделах мы рассмотрели обогащение данных наблюдаемости географическими координатами с помощью словарей IP. Если у вас есть столбцы `latitude` и `longitude`, данные наблюдаемости можно визуализировать с использованием функции `geohashEncode`. Она генерирует геохеши, совместимые с виджетом Geo Map в Grafana. Ниже приведён пример запроса и визуализации:

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

<Image img={observability_24} alt='Visualizing geo data' size='lg' border />
