---
title: 'Проектирование схемы данных'
description: 'Проектирование схемы данных для обсервабилити'
keywords: ['обсервабилити', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# Проектирование схемы для обсервабилити {#designing-a-schema-for-observability}

Мы рекомендуем пользователям всегда создавать собственную схему для логов и трейсов по следующим причинам:

- **Выбор первичного ключа** — Схемы по умолчанию используют `ORDER BY`, оптимизированный под конкретные шаблоны доступа. Маловероятно, что ваши шаблоны доступа будут совпадать с ними.
- **Извлечение структуры** — Возможно, вы захотите извлечь новые столбцы из существующих, например из столбца `Body`. Это можно сделать с помощью материализованных столбцов (и materialized views в более сложных случаях). Для этого требуются изменения схемы.
- **Оптимизация Map** — Схемы по умолчанию используют тип Map для хранения атрибутов. Эти столбцы позволяют хранить произвольные метаданные. Хотя это критически важная возможность (поскольку метаданные событий часто не определены заранее и, следовательно, не могут быть сохранены в строго типизированной базе данных, такой как ClickHouse), доступ к ключам Map и их значениям менее эффективен, чем доступ к обычному столбцу. Мы решаем это, модифицируя схему и вынося наиболее часто используемые ключи Map в отдельные столбцы верхнего уровня — см. ["Извлечение структуры с помощью SQL"](#extracting-structure-with-sql). Это требует изменения схемы.
- **Упрощение доступа к ключам Map** — Доступ к ключам в Map требует более многословного синтаксиса. Это можно сгладить с помощью алиасов. См. ["Использование алиасов"](#using-aliases) для упрощения запросов.
- **Вторичные индексы** — Схема по умолчанию использует вторичные индексы для ускорения доступа к Map и текстовым запросам. Как правило, они не требуются и увеличивают использование дискового пространства. Их можно применять, но следует протестировать, чтобы убедиться, что они действительно необходимы. См. ["Secondary / Data Skipping indices"](#secondarydata-skipping-indices).
- **Использование Codecs** — Возможно, вы захотите настроить кодеки для столбцов, если вы хорошо понимаете ожидаемые данные и у вас есть подтверждение, что это улучшает сжатие.

_Ниже мы подробно описываем каждый из указанных выше вариантов использования._

**Важно:** Хотя пользователей и поощряют расширять и модифицировать свою схему для достижения оптимального сжатия и производительности запросов, по возможности им следует придерживаться соглашений OTel по наименованию ключевых столбцов. Плагин ClickHouse для Grafana предполагает наличие некоторых базовых столбцов OTel для облегчения построения запросов, например Timestamp и SeverityText. Требуемые столбцы для логов и трейсов задокументированы здесь: [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) соответственно. Вы можете изменить эти имена столбцов, переопределив значения по умолчанию в конфигурации плагина.

## Извлечение структуры с помощью SQL {#extracting-structure-with-sql}

При приёме как структурированных, так и неструктурированных логов пользователям часто требуется возможность:

* **Извлекать столбцы из строковых blob-объектов**. Запросы к ним будут выполняться быстрее, чем использование строковых операций при выполнении запроса.
* **Извлекать ключи из Map**. Базовая схема помещает произвольные атрибуты в столбцы типа Map. Этот тип обеспечивает работу без заранее заданной схемы и имеет то преимущество, что пользователям не нужно предварительно определять столбцы для атрибутов при описании логов и трассировок — часто это невозможно при сборе логов из Kubernetes и необходимости гарантировать сохранение меток подов для последующего поиска. Доступ к ключам Map и их значениям медленнее, чем выполнение запросов по обычным столбцам ClickHouse. Поэтому извлечение ключей из Map в корневые столбцы таблицы часто бывает предпочтительным.

Рассмотрим следующие запросы:

Предположим, мы хотим посчитать, какие URL-пути получают больше всего POST-запросов, используя структурированные логи. JSON blob хранится в столбце `Body` как String. Дополнительно он может храниться в столбце `LogAttributes` как `Map(String, String)`, если пользователь включил json&#95;parser в коллекторе.

```sql
SELECT LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
LogAttributes: {'status':'200','log.file.name':'access-structured.log','request_protocol':'HTTP/1.1','run_time':'0','time_local':'2019-01-22 00:26:14.000','size':'30577','user_agent':'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)','referer':'-','remote_user':'-','request_type':'GET','request_path':'/filter/27|13 ,27|  5 ,p53','remote_addr':'54.36.149.41'}
```

Предполагая, что `LogAttributes` доступен, запрос для подсчёта, какие URL-пути сайта получают больше всего POST-запросов:

```sql
SELECT path(LogAttributes['request_path']) AS path, count() AS c
FROM otel_logs
WHERE ((LogAttributes['request_type']) = 'POST')
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.735 sec. Processed 10.36 million rows, 4.65 GB (14.10 million rows/s., 6.32 GB/s.)
Peak memory usage: 153.71 MiB.
```

Обратите внимание на использование синтаксиса `map`, например `LogAttributes['request_path']`, а также на функцию [`path`](/sql-reference/functions/url-functions#path) для удаления параметров запроса из URL.

Если пользователь не включил разбор JSON в коллекторе, то `LogAttributes` будет пустым, и нам придется использовать [JSON-функции](/sql-reference/functions/json-functions) для извлечения столбцов из строки `Body`.

:::note Предпочитайте ClickHouse для разбора
В целом мы рекомендуем выполнять разбор JSON в ClickHouse для структурированных логов. Мы уверены, что ClickHouse предоставляет самую быструю реализацию разбора JSON. Однако мы понимаем, что вы можете захотеть отправлять логи в другие системы и не хотите, чтобы эта логика была реализована в SQL.
:::


```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.668 sec. Processed 10.37 million rows, 5.13 GB (15.52 million rows/s., 7.68 GB/s.)
Peak memory usage: 172.30 MiB.
```

Теперь рассмотрим аналогичный пример для неструктурированных логов:

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
```

Аналогичный запрос для неструктурированных логов требует использования регулярных выражений с помощью функции `extractAllGroupsVertical`.

```sql
SELECT
        path((groups[1])[2]) AS path,
        count() AS c
FROM
(
        SELECT extractAllGroupsVertical(Body, '(\\w+)\\s([^\\s]+)\\sHTTP/\\d\\.\\d') AS groups
        FROM otel_logs
        WHERE ((groups[1])[1]) = 'POST'
)
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 1.953 sec. Processed 10.37 million rows, 3.59 GB (5.31 million rows/s., 1.84 GB/s.)
```

Повышенная сложность и стоимость запросов при разборе неструктурированных логов (обратите внимание на разницу в производительности) — причина, по которой мы рекомендуем пользователям по возможности всегда использовать структурированные логи.

:::note Рассмотрите использование словарей
Приведённый выше запрос можно оптимизировать за счёт использования словарей регулярных выражений. См. раздел [Using Dictionaries](#using-dictionaries) для более подробной информации.
:::

Обе эти задачи могут быть решены в ClickHouse путём переноса приведённой выше логики запроса на время вставки данных. Ниже мы рассмотрим несколько подходов, отмечая, когда каждый из них уместен.

:::note OTel или ClickHouse для обработки?
Вы также можете выполнять обработку, используя процессоры и операторы OTel Collector, как описано [здесь](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching). В большинстве случаев вы увидите, что ClickHouse значительно более эффективно использует ресурсы и работает быстрее, чем процессоры коллектора. Основной недостаток выполнения всей обработки событий в SQL — это привязка вашего решения к ClickHouse. Например, вы можете захотеть направлять обработанные логи в другие системы из OTel Collector, например в S3.
:::


### Материализованные столбцы {#materialized-columns}

Материализованные столбцы обеспечивают простейший способ извлечь структуру из других столбцов. Значения таких столбцов всегда вычисляются на этапе вставки и не могут быть указаны в запросах INSERT.

:::note Накладные расходы
Материализованные столбцы создают дополнительные накладные расходы на хранение, так как значения извлекаются в новые столбцы на диске при вставке.
:::

Материализованные столбцы поддерживают любые выражения ClickHouse и могут использовать любые аналитические функции для [обработки строк](/sql-reference/functions/string-functions) (включая [регулярные выражения (regex) и поиск](/sql-reference/functions/string-search-functions)) и [URL-адресов](/sql-reference/functions/url-functions), выполнения [преобразования типов](/sql-reference/functions/type-conversion-functions), [извлечения значений из JSON](/sql-reference/functions/json-functions) или [математических операций](/sql-reference/functions/math-functions).

Мы рекомендуем использовать материализованные столбцы для базовой обработки. Они особенно полезны для извлечения значений из отображений (map), выноса их в корневые столбцы и выполнения преобразования типов. Чаще всего они наиболее полезны при использовании в очень простых схемах или в сочетании с materialized view. Рассмотрим следующую схему для логов, в которых JSON был извлечён коллектором в столбец `LogAttributes`:

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `RequestPage` String MATERIALIZED path(LogAttributes['request_path']),
        `RequestType` LowCardinality(String) MATERIALIZED LogAttributes['request_type'],
        `RefererDomain` String MATERIALIZED domain(LogAttributes['referer'])
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

Эквивалентную схему для извлечения данных с использованием JSON-функций из строки `Body` можно найти [здесь](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==).

Наши три материализованных столбца извлекают запрашиваемую страницу, тип запроса и домен реферера. Они обращаются к ключам map-структуры и применяют функции к их значениям. Последующий запрос выполняется значительно быстрее:

```sql
SELECT RequestPage AS path, count() AS c
FROM otel_logs
WHERE RequestType = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.173 sec. Processed 10.37 million rows, 418.03 MB (60.07 million rows/s., 2.42 GB/s.)
Peak memory usage: 3.16 MiB.
```

:::note
Материализованные столбцы по умолчанию не возвращаются при выполнении `SELECT *`. Это сделано для гарантии того, что результат `SELECT *` всегда можно вставить обратно в таблицу с помощью INSERT. Это поведение можно отключить, установив `asterisk_include_materialized_columns=1`, а также его можно изменить в Grafana (см. `Additional Settings -> Custom Settings` в конфигурации источника данных).
:::


## Materialized views {#materialized-views}

[Materialized views](/materialized-views) предоставляют более мощный способ применения SQL‑фильтрации и преобразований к логам и трейсам.

Materialized Views позволяют перенести вычислительные затраты с момента выполнения запроса на момент вставки. materialized view в ClickHouse — это по сути триггер, который выполняет запрос на блоках данных по мере их вставки в таблицу. Результаты этого запроса вставляются во вторую, «целевую» таблицу.

<Image img={observability_10} alt="Materialized view" size="md" />

:::note Обновления в реальном времени
Materialized views в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на основе которой они построены, и функционируют скорее как постоянно обновляющиеся индексы. В отличие от этого, в других базах данных materialized views обычно являются статическими снимками результата запроса, которые необходимо периодически обновлять (аналогично ClickHouse Refreshable Materialized Views).
:::

Запрос, связанный с materialized view, теоретически может быть любым запросом, включая агрегацию, хотя [существуют ограничения при использовании Joins](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для задач преобразования и фильтрации, необходимых для логов и трейсинга, можно считать допустимым любой оператор `SELECT`.

Следует помнить, что запрос — это всего лишь триггер, выполняющийся над строками, вставляемыми в таблицу (исходную таблицу), а результаты отправляются в новую таблицу (целевую таблицу).

Чтобы гарантировать, что мы не будем хранить данные дважды (в исходной и целевой таблицах), мы можем изменить движок исходной таблицы на [Null table engine](/engines/table-engines/special/null), сохранив исходную схему. Наши OTel collectors будут продолжать отправлять данные в эту таблицу. Например, для логов таблица `otel_logs` становится:

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1))
) ENGINE = Null
```

Движок таблицы Null — это мощная оптимизация, его можно рассматривать как аналог `/dev/null`. Эта таблица не будет хранить какие-либо данные, но любые связанные с ней materialized view по‑прежнему будут выполняться над вставленными строками, прежде чем они будут отброшены.

Рассмотрим следующий запрос. Он преобразует наши строки в формат, который мы хотим сохранить, извлекая все столбцы из `LogAttributes` (мы предполагаем, что это было установлено коллектором с помощью оператора `json_parser`) и задавая значения `SeverityText` и `SeverityNumber` (на основе некоторых простых условий и определения [этих столбцов](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В этом случае мы также выбираем только те столбцы, которые, как нам известно, будут заполнены, игнорируя такие столбцы, как `TraceId`, `SpanId` и `TraceFlags`.


```sql
SELECT
        Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status'] AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddr,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:      2019-01-22 00:26:14
ServiceName:
Status:         200
RequestProtocol: HTTP/1.1
RunTime:        0
Size:           30577
UserAgent:      Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:        -
RemoteUser:     -
RequestType:    GET
RequestPath:    /filter/27|13 ,27|  5 ,p53
RemoteAddr:     54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.027 sec.
```

Мы также извлекаем столбец `Body` — на случай, если позже будут добавлены дополнительные атрибуты, которые не извлекаются нашим SQL. Этот столбец будет хорошо сжиматься в ClickHouse и к нему будут редко обращаться, поэтому он не повлияет на производительность запросов. Наконец, мы приводим Timestamp к типу DateTime (для экономии места — см. [&quot;Optimizing Types&quot;](#optimizing-types)) с помощью приведения типа (cast).

:::note Conditionals
Обратите внимание на использование [conditionals](/sql-reference/functions/conditional-functions) выше для извлечения `SeverityText` и `SeverityNumber`. Эти функции чрезвычайно полезны для формулирования сложных условий и проверки, заданы ли значения в отображениях (map) — мы наивно предполагаем, что все ключи существуют в `LogAttributes`. Рекомендуем пользователям с ними познакомиться — это ваш надёжный помощник при разборе логов, в дополнение к функциям для обработки [null values](/sql-reference/functions/functions-for-nulls)!
:::

Нам требуется таблица для приёма этих результатов. Приведённая ниже целевая таблица соответствует приведённому выше запросу:

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

Выбранные здесь типы основаны на оптимизациях, рассмотренных в разделе [&quot;Optimizing types&quot;](#optimizing-types).

:::note
Обратите внимание, насколько существенно мы изменили схему. На практике у вас, вероятно, также будут столбцы трассировок, которые вам потребуется сохранить, а также столбец `ResourceAttributes` (обычно он содержит метаданные Kubernetes). Grafana может использовать столбцы трассировок для реализации связей между логами и трассировками — см. раздел [&quot;Using Grafana&quot;](/observability/grafana).
:::


Ниже мы создаём materialized view `otel_logs_mv`, которая выполняет приведённый выше SELECT-запрос для таблицы `otel_logs` и записывает результаты в `otel_logs_v2`.

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

Вышеописанное можно представить схематически так:

<Image img={observability_11} alt="Otel MV" size="md" />

Если теперь перезапустить конфигурацию коллектора, используемую в [&quot;Exporting to ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse), данные появятся в `otel_logs_v2` в нужном формате. Обратите внимание на использование типизированных функций извлечения данных из JSON.

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:      2019-01-22 00:26:14
ServiceName:
Status:         200
RequestProtocol: HTTP/1.1
RunTime:        0
Size:           30577
UserAgent:      Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:        -
RemoteUser:     -
RequestType:    GET
RequestPath:    /filter/27|13 ,27|  5 ,p53
RemoteAddress:  54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.010 sec.
```

Эквивалентный materialized view, который извлекает столбцы из столбца `Body` с помощью JSON‑функций, показан ниже:


```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT  Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        JSONExtractUInt(Body, 'status') AS Status,
        JSONExtractString(Body, 'request_protocol') AS RequestProtocol,
        JSONExtractUInt(Body, 'run_time') AS RunTime,
        JSONExtractUInt(Body, 'size') AS Size,
        JSONExtractString(Body, 'user_agent') AS UserAgent,
        JSONExtractString(Body, 'referer') AS Referer,
        JSONExtractString(Body, 'remote_user') AS RemoteUser,
        JSONExtractString(Body, 'request_type') AS RequestType,
        JSONExtractString(Body, 'request_path') AS RequestPath,
        JSONExtractString(Body, 'remote_addr') AS remote_addr,
        domain(JSONExtractString(Body, 'referer')) AS RefererDomain,
        path(JSONExtractString(Body, 'request_path')) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```


### Осторожно с типами {#beware-types}

Приведённые выше materialized view опираются на неявное приведение типов — особенно при использовании map `LogAttributes`. ClickHouse часто прозрачно приводит извлечённое значение к типу целевой таблицы, сокращая необходимый синтаксис. Однако мы рекомендуем всегда тестировать такие представления, выполняя `SELECT` из view совместно с командой [`INSERT INTO`](/sql-reference/statements/insert-into) в целевую таблицу с той же схемой. Это позволяет убедиться, что типы обрабатываются корректно. Особое внимание следует уделить следующим случаям:

- Если ключ не существует в map, будет возвращена пустая строка. В случае числовых значений вам потребуется сопоставить их с подходящим значением. Это можно сделать с помощью [условных выражений](/sql-reference/functions/conditional-functions), например `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`, или [функций приведения типов](/sql-reference/functions/type-conversion-functions), если допустимы значения по умолчанию, например `toUInt8OrDefault(LogAttributes['status'] )`.
- Некоторые типы не всегда будут приводиться, например строковые представления чисел не будут приводиться к значениям enum.
- Функции извлечения из JSON возвращают значения по умолчанию для своего типа, если значение не найдено. Убедитесь, что эти значения корректны для вашей схемы!

:::note Avoid Nullable
Избегайте использования [Nullable](/sql-reference/data-types/nullable) в ClickHouse для данных обсервабилити. В логах и трейсах редко требуется различать пустое значение и null. Эта возможность приводит к дополнительным накладным расходам на хранение и негативно влияет на производительность запросов. Подробности см. [здесь](/data-modeling/schema-design#optimizing-types).
:::

## Выбор первичного (упорядочивающего) ключа {#choosing-a-primary-ordering-key}

После того как вы извлекли нужные столбцы, можно приступать к оптимизации вашего упорядочивающего/первичного ключа.

Для выбора упорядочивающего ключа можно применить несколько простых правил. Иногда они могут противоречить друг другу, поэтому рассматривайте их по порядку. В результате этого процесса вы сможете определить несколько ключей, обычно достаточно 4–5:

1. Выбирайте столбцы, которые соответствуют вашим типичным фильтрам и шаблонам доступа. Если вы обычно начинаете расследования в рамках обсервабилити с фильтрации по определённому столбцу, например имени пода, этот столбец будет часто использоваться в выражениях `WHERE`. Отдавайте приоритет включению таких столбцов в ключ по сравнению с теми, которые используются реже.
2. Предпочитайте столбцы, которые при фильтрации позволяют исключить большой процент всех строк, тем самым уменьшая объём данных, которые нужно прочитать. Имена сервисов и коды статуса часто являются хорошими кандидатами — во втором случае только если вы фильтруете по значениям, исключающим большинство строк. Например, фильтрация по кодам 200 в большинстве систем будет соответствовать большинству строк, в отличие от ошибок 500, которые будут соответствовать лишь небольшой части строк.
3. Предпочитайте столбцы, которые, вероятно, будут сильно коррелировать с другими столбцами в таблице. Это поможет обеспечить их последовательное хранение рядом друг с другом, улучшая сжатие.
4. Операции `GROUP BY` и `ORDER BY` для столбцов в упорядочивающем ключе могут быть более эффективными по потреблению памяти.

<br />

Определив подмножество столбцов для упорядочивающего ключа, их необходимо объявить в определённом порядке. Этот порядок может существенно повлиять как на эффективность фильтрации по столбцам вторичного ключа в запросах, так и на коэффициент сжатия файлов данных таблицы. В общем случае **лучше всего упорядочивать ключи в порядке возрастания их кардинальности**. Это нужно сбалансировать с тем фактом, что фильтрация по столбцам, которые появляются позже в упорядочивающем ключе, будет менее эффективной, чем фильтрация по тем, которые стоят раньше в кортеже. Найдите баланс между этими свойствами и учитывайте ваши шаблоны доступа. И самое важное — тестируйте варианты. Для более глубокого понимания упорядочивающих ключей и способов их оптимизации мы рекомендуем [эту статью](/guides/best-practices/sparse-primary-indexes).

:::note Сначала структура
Мы рекомендуем определять ваши упорядочивающие ключи после того, как вы структурируете свои логи. Не используйте ключи в картах атрибутов для упорядочивающего ключа или выражения извлечения JSON. Убедитесь, что ваши упорядочивающие ключи представлены корневыми столбцами в вашей таблице.
:::

## Использование Map {#using-maps}

В предыдущих примерах показано использование синтаксиса `map['key']` для доступа к значениям в столбцах типа `Map(String, String)`. Помимо обращения к вложенным ключам через нотацию map, в ClickHouse доступны специализированные [функции для работы с map](/sql-reference/functions/tuple-map-functions#mapKeys) для фильтрации или выборочного извлечения данных из этих столбцов.

Например, следующий запрос определяет все уникальные ключи, присутствующие в столбце `LogAttributes`, с помощью функции [`mapKeys`](/sql-reference/functions/tuple-map-functions#mapkeys), а затем функции [`groupArrayDistinctArray`](/sql-reference/aggregate-functions/combinators) (комбинатор).

```sql
SELECT groupArrayDistinctArray(mapKeys(LogAttributes))
FROM otel_logs
FORMAT Vertical

Row 1:
──────
groupArrayDistinctArray(mapKeys(LogAttributes)): ['remote_user','run_time','request_type','log.file.name','referer','request_path','status','user_agent','remote_addr','time_local','size','request_protocol']

1 row in set. Elapsed: 1.139 sec. Processed 5.63 million rows, 2.53 GB (4.94 million rows/s., 2.22 GB/s.)
Peak memory usage: 71.90 MiB.
```

:::note Избегайте точек
Мы не рекомендуем использовать точки в именах столбцов типа Map и в будущем можем признать такое использование устаревшим. Используйте символ `_`.
:::


## Использование псевдонимов {#using-aliases}

Запросы к типам Map выполняются медленнее, чем к обычным столбцам — см. раздел [&quot;Ускорение запросов&quot;](#accelerating-queries). Кроме того, их синтаксис сложнее, и писать такие запросы может быть неудобно. Чтобы решить последнюю из этих проблем, мы рекомендуем использовать столбцы типа ALIAS.

Столбцы типа ALIAS вычисляются во время выполнения запроса и не хранятся в таблице. Поэтому невозможно вставить значение оператором INSERT в столбец этого типа. Используя псевдонимы, мы можем ссылаться на ключи в Map и упростить синтаксис, прозрачно представляя элементы Map как обычные столбцы. Рассмотрим следующий пример:

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `RequestPath` String MATERIALIZED path(LogAttributes['request_path']),
        `RequestType` LowCardinality(String) MATERIALIZED LogAttributes['request_type'],
        `RefererDomain` String MATERIALIZED domain(LogAttributes['referer']),
        `RemoteAddr` IPv4 ALIAS LogAttributes['remote_addr']
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, Timestamp)
```

У нас есть несколько материализованных столбцов и столбец `ALIAS` — `RemoteAddr`, который обращается к карте `LogAttributes`. Теперь мы можем запрашивать значения `LogAttributes['remote_addr']` через этот столбец, тем самым упрощая наш запрос, т.е.

```sql
SELECT RemoteAddr
FROM default.otel_logs
LIMIT 5

┌─RemoteAddr────┐
│ 54.36.149.41  │
│ 31.56.96.51   │
│ 31.56.96.51   │
│ 40.77.167.129 │
│ 91.99.72.15   │
└───────────────┘

5 rows in set. Elapsed: 0.011 sec.
```

Кроме того, добавление `ALIAS` с помощью команды `ALTER TABLE` является тривиальной операцией. Эти столбцы сразу же становятся доступными, например:

```sql
ALTER TABLE default.otel_logs
        (ADD COLUMN `Size` String ALIAS LogAttributes['size'])

SELECT Size
FROM default.otel_logs_v3
LIMIT 5

┌─Size──┐
│ 30577 │
│ 5667  │
│ 5379  │
│ 1696  │
│ 41483 │
└───────┘

5 rows in set. Elapsed: 0.014 sec.
```

:::note Столбцы ALIAS по умолчанию исключены
По умолчанию `SELECT *` не включает столбцы ALIAS. Это поведение можно отключить, установив `asterisk_include_alias_columns=1`.
:::


## Оптимизация типов {#optimizing-types}

[Общие рекомендации по оптимизации типов в ClickHouse](/data-modeling/schema-design#optimizing-types) применимы и к данному сценарию использования ClickHouse.

## Использование кодеков {#using-codecs}

Помимо оптимизации типов, вы можете придерживаться [общих рекомендаций по использованию кодеков](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) при оптимизации сжатия для схем ClickHouse Observability.

Как правило, на практике кодек `ZSTD` хорошо подходит для наборов данных логов и трейсов. Увеличение уровня сжатия относительно значения по умолчанию 1 может улучшить степень сжатия. Однако это следует проверять, так как более высокие значения приводят к большему использованию CPU во время вставки. Обычно мы наблюдаем лишь незначительный выигрыш от увеличения этого значения.

Кроме того, временные метки, хотя и выигрывают от дельта-кодирования с точки зрения сжатия, по имеющимся данным приводят к замедлению выполнения запросов, если этот столбец используется в первичном/упорядочивающем ключе. Мы рекомендуем пользователям оценить соответствующий баланс между сжатием и производительностью запросов.

## Использование словарей {#using-dictionaries}

[Словари](/sql-reference/dictionaries) — это [ключевая возможность](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) ClickHouse, обеспечивающая хранимое в памяти представление данных в формате [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources), оптимизированное для сверхнизкой задержки при выполнении запросов поиска.

<Image img={observability_12} alt="Обсервабилити и словари" size="md"/>

Это удобно во множестве сценариев — от обогащения данных, поступающих при ингестии, «на лету» без замедления процесса ингестии до общего повышения производительности запросов, где особенно выигрывают операции JOIN.
Хотя операции JOIN редко требуются в сценариях обсервабилити, словари по‑прежнему могут быть полезны для обогащения — как на момент вставки, так и на момент выполнения запроса. Ниже мы приводим примеры обоих подходов.

:::note Ускорение JOIN
Пользователи, заинтересованные в ускорении операций JOIN с помощью словарей, могут найти дополнительную информацию [здесь](/dictionary).
:::

### Время вставки и время запроса {#insert-time-vs-query-time}

Словари могут использоваться для обогащения наборов данных во время запроса или во время вставки. У каждого из этих подходов есть свои преимущества и недостатки. Вкратце:

- **Время вставки** — Обычно подходит, если обогащающие значения не меняются и существуют во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки позволяет избежать поиска в словаре при выполнении запроса. Это происходит за счет производительности вставки, а также дополнительного расхода места в хранилище, так как обогащённые значения будут храниться как столбцы.
- **Время запроса** — Если значения в словаре часто меняются, поиск во время запроса зачастую более уместен. Это избавляет от необходимости обновлять столбцы (и перезаписывать данные), если изменяются сопоставленные значения. Такая гибкость достигается ценой дополнительных затрат на поиск во время запроса. Эти затраты обычно заметны, если требуется поиск для большого количества строк, например при использовании словаря в фильтрующем выражении. Для обогащения результата, т.е. в `SELECT`, эти накладные расходы обычно несущественны.

Мы рекомендуем пользователям ознакомиться с основами словарей. Словари предоставляют таблицу поиска в памяти, из которой значения могут быть получены с помощью [специализированных функций](/sql-reference/functions/ext-dict-functions#dictGetAll).

Примеры простого обогащения см. в руководстве по словарям [здесь](/dictionary). Ниже мы сосредоточимся на типичных задачах обогащения для обсервабилити.

### Использование IP-словарей {#using-ip-dictionaries}

Геообогащение логов и трейсов координатами (широтой и долготой) по IP-адресам — типовое требование в обсервабилити. Это можно реализовать с помощью структурированного словаря `ip_trie`.

Мы используем общедоступный [набор данных DB-IP с детализацией до города](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставленный [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [файла README](https://github.com/sapics/ip-location-db#csv-format) видно, что данные структурированы следующим образом:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

С учетом такой структуры давайте начнём с изучения данных с помощью табличной функции [url()](/sql-reference/table-functions/url):

```sql
SELECT *
FROM url('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV', '\n           \tip_range_start IPv4, \n       \tip_range_end IPv4, \n         \tcountry_code Nullable(String), \n     \tstate1 Nullable(String), \n           \tstate2 Nullable(String), \n           \tcity Nullable(String), \n     \tpostcode Nullable(String), \n         \tlatitude Float64, \n          \tlongitude Float64, \n         \ttimezone Nullable(String)\n   \t')
LIMIT 1
FORMAT Vertical
Row 1:
──────
ip_range_start: 1.0.0.0
ip_range_end:   1.0.0.255
country_code:   AU
state1:         Queensland
state2:         ᴺᵁᴸᴸ
city:           South Brisbane
postcode:       ᴺᵁᴸᴸ
latitude:       -27.4767
longitude:      153.017
timezone:       ᴺᵁᴸᴸ
```

Чтобы упростить задачу, давайте используем табличный движок [`URL()`](/engines/table-engines/special/url), чтобы создать в ClickHouse таблицу с нашими именами полей и проверить общее количество строк:

```sql
CREATE TABLE geoip_url(
        ip_range_start IPv4,
        ip_range_end IPv4,
        country_code Nullable(String),
        state1 Nullable(String),
        state2 Nullable(String),
        city Nullable(String),
        postcode Nullable(String),
        latitude Float64,
        longitude Float64,
        timezone Nullable(String)
) ENGINE=URL('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV')

select count() from geoip_url;

┌─count()─┐
│ 3261621 │ -- 3.26 million
└─────────┘
```

Поскольку наш словарь `ip_trie` требует, чтобы диапазоны IP-адресов были представлены в нотации CIDR, нам нужно будет преобразовать `ip_range_start` и `ip_range_end`.

CIDR для каждого диапазона можно просто вычислить с помощью следующего запроса:

```sql
WITH
        bitXor(ip_range_start, ip_range_end) AS xor,
        if(xor != 0, ceil(log2(xor)), 0) AS unmatched,
        32 - unmatched AS cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) AS cidr_address
SELECT
        ip_range_start,
        ip_range_end,
        concat(toString(cidr_address),'/',toString(cidr_suffix)) AS cidr    
FROM
        geoip_url
LIMIT 4;

┌─ip_range_start─┬─ip_range_end─┬─cidr───────┐
│ 1.0.0.0        │ 1.0.0.255    │ 1.0.0.0/24 │
│ 1.0.1.0        │ 1.0.3.255    │ 1.0.0.0/22 │
│ 1.0.4.0        │ 1.0.7.255    │ 1.0.4.0/22 │
│ 1.0.8.0        │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4 rows in set. Elapsed: 0.259 sec.
```


:::note
В приведённом выше запросе происходит довольно много всего. Тем, кому интересно, рекомендую это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). В противном случае просто примите, что выше вычисляется CIDR для диапазона IP-адресов.
:::

Для наших целей нам понадобится только диапазон IP-адресов, код страны и координаты, поэтому давайте создадим новую таблицу и вставим в неё наши данные Geo IP:

```sql
CREATE TABLE geoip
(
        `cidr` String,
        `latitude` Float64,
        `longitude` Float64,
        `country_code` String
)
ENGINE = MergeTree
ORDER BY cidr

INSERT INTO geoip
WITH
        bitXor(ip_range_start, ip_range_end) as xor,
        if(xor != 0, ceil(log2(xor)), 0) as unmatched,
        32 - unmatched as cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) as cidr_address
SELECT
        concat(toString(cidr_address),'/',toString(cidr_suffix)) as cidr,
        latitude,
        longitude,
        country_code    
FROM geoip_url
```

Чтобы выполнять низкозадержечные IP‑поиски в ClickHouse, мы будем использовать словари для хранения сопоставления ключей с атрибутами наших Geo IP‑данных в памяти. ClickHouse предоставляет структуру словаря `ip_trie` [структура словаря](/sql-reference/dictionaries#ip_trie) для сопоставления наших сетевых префиксов (CIDR‑блоков) с координатами и кодами стран. Следующий запрос определяет словарь, используя эту структуру и приведённую выше таблицу в качестве источника.

```sql
CREATE DICTIONARY ip_trie (
   cidr String,
   latitude Float64,
   longitude Float64,
   country_code String
)
primary key cidr
source(clickhouse(table 'geoip'))
layout(ip_trie)
lifetime(3600);
```

Мы можем выбрать строки из словаря и убедиться, что этот набор данных доступен для обращений (lookups):

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 rows in set. Elapsed: 4.662 sec.
```

:::note Периодическое обновление
Словари в ClickHouse периодически обновляются на основе данных базовой таблицы и указанного выше выражения `lifetime`. Чтобы обновить наш словарь Geo IP в соответствии с последними изменениями в наборе данных DB-IP, нам нужно лишь повторно вставить данные из удалённой таблицы `geoip_url` в нашу таблицу `geoip` с применением необходимых преобразований.
:::

Теперь, когда данные Geo IP загружены в наш словарь `ip_trie` (который для удобства также назван `ip_trie`), мы можем использовать его для геолокации по IP. Это можно сделать с помощью функции [`dictGet()`](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Обратите внимание на скорость выборки. Это позволяет нам обогащать логи. В данном случае мы выбираем **выполнять обогащение на этапе выполнения запроса**.

Возвращаясь к нашему исходному набору логов, мы можем использовать описанное выше, чтобы агрегировать наши логи по странам. Далее предполагается, что мы используем схему, полученную на основе ранее созданного materialized view, в которой уже есть выделенный столбец `RemoteAddress`.


```sql
SELECT dictGet('ip_trie', 'country_code', tuple(RemoteAddress)) AS country,
        formatReadableQuantity(count()) AS num_requests
FROM default.otel_logs_v2
WHERE country != ''
GROUP BY country
ORDER BY count() DESC
LIMIT 5

┌─country─┬─num_requests────┐
│ IR      │ 7.36 million    │
│ US      │ 1.67 million    │
│ AE      │ 526.74 thousand │
│ DE      │ 159.35 thousand │
│ FR      │ 109.82 thousand │
└─────────┴─────────────────┘

5 rows in set. Elapsed: 0.140 sec. Processed 20.73 million rows, 82.92 MB (147.79 million rows/s., 591.16 MB/s.)
Peak memory usage: 1.16 MiB.
```

Поскольку сопоставление IP‑адреса с географическим местоположением может меняться, пользователям, скорее всего, важно знать, откуда поступил запрос в момент его выполнения, а не каково текущее географическое местоположение для того же адреса. По этой причине здесь, вероятно, предпочтительно обогащение на этапе индексации. Это можно сделать с помощью материализованных столбцов, как показано ниже, или в операторе SELECT объекта materialized view:

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        `Country` String MATERIALIZED dictGet('ip_trie', 'country_code', tuple(RemoteAddress)),
        `Latitude` Float32 MATERIALIZED dictGet('ip_trie', 'latitude', tuple(RemoteAddress)),
        `Longitude` Float32 MATERIALIZED dictGet('ip_trie', 'longitude', tuple(RemoteAddress))
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note Периодическое обновление
Пользователям, скорее всего, потребуется, чтобы словарь обогащения IP-адресов периодически обновлялся на основе новых данных. Это можно реализовать с помощью директивы `LIFETIME` словаря, которая будет приводить к его периодической перезагрузке из исходной таблицы. Для обновления исходной таблицы см. [&quot;Refreshable Materialized views&quot;](/materialized-view/refreshable-materialized-view).
:::

Приведённые выше страны и координаты обеспечивают возможности визуализации, выходящие за рамки простого группирования и фильтрации по странам. Для вдохновения см. [&quot;Visualizing geo data&quot;](/observability/grafana#visualizing-geo-data).


### Использование словарей на основе регулярных выражений (разбор User-Agent) {#using-regex-dictionaries-user-agent-parsing}

Разбор [строк User-Agent](https://en.wikipedia.org/wiki/User_agent) — это классическая задача на регулярные выражения и типичное требование для наборов данных на основе логов и трассировок. ClickHouse обеспечивает эффективный разбор строк User-Agent с использованием Regular Expression Tree Dictionaries.

Словари на основе дерева регулярных выражений определяются в ClickHouse open-source с использованием типа источника словаря YAMLRegExpTree, который указывает путь к YAML-файлу, содержащему дерево регулярных выражений. Если вы хотите использовать собственный словарь регулярных выражений, подробности о требуемой структуре можно найти [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source). Далее мы сосредоточимся на разборе User-Agent с использованием [uap-core](https://github.com/ua-parser/uap-core) и загрузим наш словарь в поддерживаемом формате CSV. Этот подход совместим как с OSS, так и с ClickHouse Cloud.

:::note
В примерах ниже мы используем снимки актуальных регулярных выражений uap-core для разбора User-Agent по состоянию на июнь 2024 года. Актуальный файл, который периодически обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Вы можете выполнить шаги, описанные [здесь](/sql-reference/dictionaries#collecting-attribute-values), чтобы загрузить данные в CSV-файл, используемый ниже.
:::

Создайте следующие таблицы движка Memory. Они будут хранить наши регулярные выражения для разбора устройств, браузеров и операционных систем.

```sql
CREATE TABLE regexp_os
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;

CREATE TABLE regexp_browser
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;

CREATE TABLE regexp_device
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;
```

Эти таблицы можно заполнить данными из следующих публично доступных CSV‑файлов с помощью табличной функции URL:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

После заполнения таблиц в памяти мы можем загрузить словари регулярных выражений. Обратите внимание, что необходимо указать ключевые значения в виде столбцов — это будут атрибуты, которые мы сможем извлекать из User-Agent.

```sql
CREATE DICTIONARY regexp_os_dict
(
        regexp String,
        os_replacement String default 'Other',
        os_v1_replacement String default '0',
        os_v2_replacement String default '0',
        os_v3_replacement String default '0',
        os_v4_replacement String default '0'
)
PRIMARY KEY regexp
SOURCE(CLICKHOUSE(TABLE 'regexp_os'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(REGEXP_TREE);

CREATE DICTIONARY regexp_device_dict
(
        regexp String,
        device_replacement String default 'Other',
        brand_replacement String,
        model_replacement String
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_device'))
LIFETIME(0)
LAYOUT(regexp_tree);

CREATE DICTIONARY regexp_browser_dict
(
        regexp String,
        family_replacement String default 'Other',
        v1_replacement String default '0',
        v2_replacement String default '0'
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_browser'))
LIFETIME(0)
LAYOUT(regexp_tree);
```

Теперь, когда эти словари загружены, мы можем передать пример `User-Agent` и протестировать новые возможности извлечения данных с помощью словаря:


```sql
WITH 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0' AS user_agent
SELECT
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), user_agent) AS device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), user_agent) AS browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), user_agent) AS os

┌─device────────────────┬─browser───────────────┬─os─────────────────────────┐
│ ('Mac','Apple','Mac') │ ('Firefox','127','0') │ ('Mac OS X','10','15','0') │
└───────────────────────┴───────────────────────┴────────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Учитывая, что правила, связанные с user-agent, будут меняться редко, а словарь нужно будет обновлять только по мере появления новых браузеров, операционных систем и устройств, имеет смысл выполнять это извлечение на этапе вставки данных.

Мы можем выполнить эту обработку либо с использованием materialized column, либо с использованием materialized view. Ниже мы изменим materialized view, которую использовали ранее:

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2
AS SELECT
        Body,
        CAST(Timestamp, 'DateTime') AS Timestamp,
        ServiceName,
        LogAttributes['status'] AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(CAST(Status, 'UInt64') > 500, 'CRITICAL', CAST(Status, 'UInt64') > 400, 'ERROR', CAST(Status, 'UInt64') > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(CAST(Status, 'UInt64') > 500, 20, CAST(Status, 'UInt64') > 400, 17, CAST(Status, 'UInt64') > 300, 13, 9) AS SeverityNumber,
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), UserAgent) AS Device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), UserAgent) AS Browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), UserAgent) AS Os
FROM otel_logs
```

Для этого нам необходимо изменить схему целевой таблицы `otel_logs_v2`:

```sql
CREATE TABLE default.otel_logs_v2
(
 `Body` String,
 `Timestamp` DateTime,
 `ServiceName` LowCardinality(String),
 `Status` UInt8,
 `RequestProtocol` LowCardinality(String),
 `RunTime` UInt32,
 `Size` UInt32,
 `UserAgent` String,
 `Referer` String,
 `RemoteUser` String,
 `RequestType` LowCardinality(String),
 `RequestPath` String,
 `remote_addr` IPv4,
 `RefererDomain` String,
 `RequestPage` String,
 `SeverityText` LowCardinality(String),
 `SeverityNumber` UInt8,
 `Device` Tuple(device_replacement LowCardinality(String), brand_replacement LowCardinality(String), model_replacement LowCardinality(String)),
 `Browser` Tuple(family_replacement LowCardinality(String), v1_replacement LowCardinality(String), v2_replacement LowCardinality(String)),
 `Os` Tuple(os_replacement LowCardinality(String), os_v1_replacement LowCardinality(String), os_v2_replacement LowCardinality(String), os_v3_replacement LowCardinality(String))
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp, Status)
```

После перезапуска коллектора и начала приёма структурированных логов, согласно ранее описанным шагам, мы можем выполнять запросы к нашим вновь извлечённым столбцам Device, Browser и OS.


```sql
SELECT Device, Browser, Os
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Device:  ('Spider','Spider','Desktop')
Browser: ('AhrefsBot','6','1')
Os:     ('Other','0','0','0')
```

:::note Кортежи для сложных структур
Обратите внимание на использование кортежей (Tuple) для этих столбцов user agent. Кортежи рекомендуются для сложных структур с заранее известной иерархией. Подстолбцы обеспечивают ту же производительность, что и обычные столбцы (в отличие от ключей Map), при этом позволяют использовать разнородные типы.
:::


### Дополнительные материалы {#further-reading}

Для дополнительных примеров и более подробной информации о словарях рекомендуем следующие материалы:

- [Расширенные темы по словарям](/dictionary#advanced-dictionary-topics)
- [«Использование словарей для ускорения запросов»](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Словари](/sql-reference/dictionaries)

## Ускорение запросов {#accelerating-queries}

ClickHouse поддерживает ряд методов для ускорения выполнения запросов. К следующим подходам следует обращаться только после того, как выбран подходящий первичный ключ/ключ сортировки, оптимизированный под наиболее распространённые шаблоны доступа и максимально эффективное сжатие. Обычно именно это даёт наибольший прирост производительности при наименьших затратах.

### Использование materialized views (инкрементальных) для агрегаций {#using-materialized-views-incremental-for-aggregations}

В предыдущих разделах мы рассмотрели использование materialized views для трансформации и фильтрации данных. Однако materialized views также можно использовать для предварительного вычисления агрегаций во время вставки данных и сохранения результата. Этот результат может обновляться при последующих вставках, тем самым позволяя фактически выполнять агрегацию заранее — на этапе вставки.

Основная идея заключается в том, что результаты часто представляют собой более компактное представление исходных данных (в случае агрегаций — частичный sketch). В сочетании с более простым запросом для чтения результатов из целевой таблицы время выполнения запроса будет меньше, чем если бы те же вычисления выполнялись по исходным данным.

Рассмотрим следующий запрос, в котором мы вычисляем суммарный трафик по часам, используя наши структурированные логи:

```sql
SELECT toStartOfHour(Timestamp) AS Hour,
        sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.666 sec. Processed 10.37 million rows, 4.73 GB (15.56 million rows/s., 7.10 GB/s.)
Peak memory usage: 1.40 MiB.
```

Мы можем представить, что это распространённый линейный график, который пользователи строят в Grafana. Этот запрос действительно очень быстрый — набор данных всего 10 млн строк, и ClickHouse очень быстр! Однако, если мы масштабируем объём данных до миллиардов и триллионов строк, нам желательно сохранить такую производительность запросов.

:::note
Этот запрос был бы в 10 раз быстрее, если бы мы использовали таблицу `otel_logs_v2`, которая получается из нашей ранее созданной materialized view, извлекающей ключ size из карты `LogAttributes`. Здесь мы используем сырые данные только в иллюстративных целях и рекомендуем использовать эту materialized view, если это типичный запрос.
:::

Если мы хотим выполнять такое вычисление во время вставки с помощью materialized view, нам нужна таблица для приёма результатов. Эта таблица должна хранить только 1 строку в час. Если для уже существующего часа приходит обновление, остальные столбцы должны быть объединены со строкой этого часа. Чтобы слияние инкрементальных состояний происходило, частичные состояния должны храниться для остальных столбцов.

Для этого в ClickHouse требуется специальный тип движка таблицы: SummingMergeTree. Он заменяет все строки с одинаковым ключом сортировки одной строкой, которая содержит суммарные значения для числовых столбцов. Следующая таблица будет объединять любые строки с одинаковой датой, суммируя все числовые столбцы.

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Чтобы продемонстрировать работу нашей materialized view, предположим, что таблица `bytes_per_hour` пуста и ещё не получила никаких данных. Наша materialized view выполняет вышеуказанный `SELECT` по данным, вставляемым в `otel_logs` (это будет выполняться по блокам заданного размера), а результаты передаются в `bytes_per_hour`. Синтаксис показан ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Ключевым здесь является оператор `TO`, который указывает, куда будут отправлены результаты, т. е. в `bytes_per_hour`.

Если мы перезапустим наш OTel collector и повторно отправим логи, таблица `bytes_per_hour` будет постепенно заполняться результатом приведённого выше запроса. По завершении мы можем проверить объём данных в `bytes_per_hour` — в ней должна быть 1 строка за каждый час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```


Мы фактически сократили число строк здесь с 10 млн (в `otel_logs`) до 113, сохранив результат нашего запроса. Ключевой момент заключается в том, что при вставке новых логов в таблицу `otel_logs` новые значения будут записываться в `bytes_per_hour` для соответствующего часа, где они будут автоматически асинхронно объединяться в фоновом режиме — сохраняя только одну строку в час, `bytes_per_hour` таким образом всегда будет и компактной, и актуальной.

Поскольку объединение строк происходит асинхронно, при выполнении запроса пользователем может существовать более одной строки для одного часа. Чтобы обеспечить слияние всех оставшихся строк во время выполнения запроса, у нас есть два варианта:

* Использовать [модификатор `FINAL`](/sql-reference/statements/select/from#final-modifier) для имени таблицы (как мы сделали для запроса на подсчёт выше).
* Агрегировать по ключу сортировки, используемому в нашей итоговой таблице, т.е. по Timestamp, и суммировать метрики.

Обычно второй вариант более эффективен и гибок (таблица может использоваться и для других целей), но первый может быть проще для некоторых запросов. Ниже мы покажем оба варианта:

```sql
SELECT
        Hour,
        sum(TotalBytes) AS TotalBytes
FROM bytes_per_hour
GROUP BY Hour
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.008 sec.

SELECT
        Hour,
        TotalBytes
FROM bytes_per_hour
FINAL
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.005 sec.
```

Это ускорило выполнение нашего запроса с 0,6 с до 0,008 с — более чем в 75 раз!

:::note
Этот выигрыш может быть ещё больше на больших наборах данных с более сложными запросами. См. примеры [здесь](https://github.com/ClickHouse/clickpy).
:::


#### Более сложный пример {#a-more-complex-example}

Приведённый выше пример агрегирует простое почасовое количество записей, используя [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Для расчёта статистик, выходящих за рамки простых сумм, требуется другой движок целевой таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

Предположим, мы хотим вычислить количество уникальных IP-адресов (или уникальных пользователей) в день. Запрос для этого:

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │     4763    │
│ 2019-01-22 00:00:00 │     536     │
└─────────────────────┴─────────────┘

113 rows in set. Elapsed: 0.667 sec. Processed 10.37 million rows, 4.73 GB (15.53 million rows/s., 7.09 GB/s.)
```

Для сохранения счетчика кардинальности при инкрементальном обновлении нужен движок AggregatingMergeTree.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

Чтобы ClickHouse знал, что будут храниться агрегатные состояния, мы определяем столбец `UniqueUsers` как тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая агрегатную функцию — источник частичных состояний (uniq) и тип исходного столбца (IPv4). Как и в случае с SummingMergeTree, строки с одинаковым значением ключа `ORDER BY` будут объединяться (Hour в приведённом выше примере).

Связанная materialized view использует приведённый выше запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, что мы добавляем суффикс `State` в конец наших агрегатных функций. Это гарантирует, что будет возвращено агрегатное состояние функции, а не окончательный результат. Оно будет содержать дополнительную информацию, позволяющую объединить это частичное состояние с другими состояниями.

После того как данные были перезагружены посредством перезапуска Collector, мы можем подтвердить, что в таблице `unique_visitors_per_hour` доступно 113 строк.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

Наш итоговый запрос должен использовать суффикс Merge в наших функциях (поскольку столбцы хранят состояния частичной агрегации):

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │      4763   │
│ 2019-01-22 00:00:00 │      536    │
└─────────────────────┴─────────────┘

113 rows in set. Elapsed: 0.027 sec.
```

Обратите внимание, что здесь мы используем оператор `GROUP BY`, а не `FINAL`.


### Использование materialized views (инкрементальных) для быстрых выборок {#using-materialized-views-incremental--for-fast-lookups}

При выборе ключа сортировки ClickHouse по столбцам, которые часто используются в предложениях фильтрации и агрегации, необходимо учитывать характер доступа к данным. Это может быть ограничивающим фактором в сценариях обсервабилити, где у пользователей более разнообразные паттерны доступа, которые невозможно выразить с помощью одного набора столбцов. Лучше всего это иллюстрирует пример, встроенный в стандартные схемы OTel. Рассмотрим стандартную схему для трассировок:

```sql
CREATE TABLE otel_traces
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `ParentSpanId` String CODEC(ZSTD(1)),
        `TraceState` String CODEC(ZSTD(1)),
        `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
        `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `Duration` Int64 CODEC(ZSTD(1)),
        `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
        `StatusMessage` String CODEC(ZSTD(1)),
        `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
        `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        `Links.TraceId` Array(String) CODEC(ZSTD(1)),
        `Links.SpanId` Array(String) CODEC(ZSTD(1)),
        `Links.TraceState` Array(String) CODEC(ZSTD(1)),
        `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
```

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. В контексте трассировки пользователям также нужна возможность выполнять поиск по конкретному `TraceId` и получать спаны, связанные с этим трейсом. Хотя это поле присутствует в ключе сортировки, его положение в конце означает, что [фильтрация будет менее эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) и, вероятно, для получения одного трейса потребуется просканировать значительные объёмы данных.

OTel collector также разворачивает materialized view и связанную таблицу для решения этой задачи. Таблица и представление показаны ниже:

```sql
CREATE TABLE otel_traces_trace_id_ts
(
        `TraceId` String CODEC(ZSTD(1)),
        `Start` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `End` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.01) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY (TraceId, toUnixTimestamp(Start))

CREATE MATERIALIZED VIEW otel_traces_trace_id_ts_mv TO otel_traces_trace_id_ts
(
        `TraceId` String,
        `Start` DateTime64(9),
        `End` DateTime64(9)
)
AS SELECT
        TraceId,
        min(Timestamp) AS Start,
        max(Timestamp) AS End
FROM otel_traces
WHERE TraceId != ''
GROUP BY TraceId
```


Это представление по сути гарантирует, что в таблице `otel_traces_trace_id_ts` хранятся минимальная и максимальная метки времени для трейса. Эта таблица, упорядоченная по `TraceId`, позволяет эффективно получать эти метки времени. Эти диапазоны меток времени, в свою очередь, могут использоваться при выполнении запросов к основной таблице `otel_traces`. Конкретнее, при получении трейса по его идентификатору Grafana использует следующий запрос:

```sql
WITH 'ae9226c78d1d360601e6383928e4d22d' AS trace_id,
        (
        SELECT min(Start)
          FROM default.otel_traces_trace_id_ts
          WHERE TraceId = trace_id
        ) AS trace_start,
        (
        SELECT max(End) + 1
          FROM default.otel_traces_trace_id_ts
          WHERE TraceId = trace_id
        ) AS trace_end
SELECT
        TraceId AS traceID,
        SpanId AS spanID,
        ParentSpanId AS parentSpanID,
        ServiceName AS serviceName,
        SpanName AS operationName,
        Timestamp AS startTime,
        Duration * 0.000001 AS duration,
        arrayMap(key -> map('key', key, 'value', SpanAttributes[key]), mapKeys(SpanAttributes)) AS tags,
        arrayMap(key -> map('key', key, 'value', ResourceAttributes[key]), mapKeys(ResourceAttributes)) AS serviceTags
FROM otel_traces
WHERE (traceID = trace_id) AND (startTime >= trace_start) AND (startTime <= trace_end)
LIMIT 1000
```

Здесь CTE используется для определения минимальной и максимальной временных меток для trace id `ae9226c78d1d360601e6383928e4d22d`, после чего это используется для фильтрации основной таблицы `otel_traces` по связанным с ним span-ам.

Тот же подход может быть применён для похожих шаблонов доступа к данным. Похожий пример мы рассматриваем в разделе моделирования данных [здесь](/materialized-view/incremental-materialized-view#lookup-table).


### Использование проекций {#using-projections}

Проекции ClickHouse позволяют указать несколько конструкций `ORDER BY` для таблицы.

В предыдущих разделах мы рассмотрели, как materialized view можно использовать в ClickHouse для предварительного вычисления агрегаций, преобразования строк и оптимизации запросов обсервабилити под различные паттерны доступа.

Мы предоставили пример, в котором materialized view отправляет строки в целевую таблицу с ключом сортировки, отличающимся от ключа исходной таблицы, принимающей вставки, для оптимизации поиска по идентификатору трассировки.

Проекции можно использовать для решения той же задачи, позволяя пользователю оптимизировать запросы по столбцам, которые не входят в первичный ключ.

Теоретически эту возможность можно использовать для создания нескольких ключей сортировки для таблицы, однако у неё есть один существенный недостаток: дублирование данных. Конкретно, данные потребуется записывать как в порядке основного первичного ключа, так и в порядке, указанном для каждой проекции. Это замедлит операции вставки и увеличит потребление дискового пространства.

:::note Проекции и materialized views
Проекции предоставляют многие из тех же возможностей, что и materialized views, однако их следует использовать ограниченно, отдавая предпочтение последним. Важно понимать недостатки проекций и ситуации, в которых они уместны. Например, хотя проекции можно использовать для предварительного вычисления агрегаций, мы рекомендуем применять для этого materialized views.
:::

<Image img={observability_13} alt="Обсервабилити и проекции" size="md" />

Рассмотрим следующий запрос, который фильтрует таблицу `otel_logs_v2` по кодам ошибок 500. Это распространённый паттерн доступа при работе с логами, когда пользователям необходимо фильтровать данные по кодам ошибок:

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note Используйте Null для измерения производительности
Мы не выводим результаты, используя `FORMAT Null`. Это заставляет прочитать все результаты, но не возвращать их, тем самым предотвращая досрочное завершение запроса из-за LIMIT. Это нужно только для того, чтобы показать время, затраченное на сканирование всех 10 млн строк.
:::

Приведенный выше запрос требует линейного сканирования при использовании выбранного нами ключа сортировки `(ServiceName, Timestamp)`. Хотя мы могли бы добавить `Status` в конец ключа сортировки, что улучшило бы производительность данного запроса, мы также можем добавить проекцию.

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

Обратите внимание, что сначала необходимо создать проекцию, а затем материализовать её. Эта последняя команда приводит к двукратному сохранению данных на диске в двух различных порядках сортировки. Проекцию также можно определить при создании таблицы, как показано ниже, и она будет автоматически поддерживаться при вставке данных.

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        PROJECTION status
        (
           SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
           ORDER BY Status
        )
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

Важно: если проекция создаётся через `ALTER`, то при выполнении команды `MATERIALIZE PROJECTION` её создание происходит асинхронно. Вы можете отслеживать ход выполнения этой операции следующим запросом, ожидая `is_done=1`.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Если повторить приведенный выше запрос, можно увидеть, что производительность значительно улучшилась за счет дополнительного дискового пространства (см. раздел [&quot;Измерение размера таблицы и сжатия&quot;](#measuring-table-size--compression) о том, как это измерить).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

В приведённом выше примере мы указываем столбцы, использованные в предыдущем запросе, в проекции. Это означает, что только эти указанные столбцы будут храниться на диске как часть проекции, упорядоченной по Status. Если бы вместо этого мы использовали здесь `SELECT *`, все столбцы были бы сохранены. Хотя это позволило бы большему числу запросов (использующих любое подмножество столбцов) использовать преимущества проекции, это привело бы к дополнительным затратам на хранение. Для измерения дискового пространства и степени сжатия см. [«Измерение размера таблицы и сжатия»](#measuring-table-size--compression).


### Вторичные индексы / индексы пропуска данных {#secondarydata-skipping-indices}

Независимо от того, насколько хорошо настроен первичный ключ в ClickHouse, некоторые запросы неизбежно будут требовать полного сканирования таблицы. Хотя это можно смягчить с помощью materialized view (и проекций для части запросов), они требуют дополнительного сопровождения, а также осведомлённости пользователей об их наличии, чтобы гарантировать их использование. В то время как традиционные реляционные базы данных решают эту задачу с помощью вторичных индексов, они неэффективны в столбцовых базах данных, таких как ClickHouse. Вместо этого ClickHouse использует индексы пропуска данных (skip indexes), которые могут значительно повысить производительность запросов, позволяя базе данных пропускать крупные фрагменты данных, не содержащие подходящих значений.

Базовые схемы OTel используют вторичные индексы в попытке ускорить доступ к данным типа Map. Хотя на практике мы считаем их в целом неэффективными и не рекомендуем копировать их в вашу пользовательскую схему, индексы пропуска данных всё же могут быть полезны.

Перед тем как пытаться применять такие индексы, необходимо прочитать и понять [руководство по вторичным индексам пропуска данных](/optimize/skipping-indexes).

**В общем случае они эффективны, когда существует сильная корреляция между первичным ключом и целевым непервичным столбцом/выражением, а пользователи выполняют поиск по редким значениям, то есть по тем, которые встречаются не во многих гранулах.**

### Фильтры Блума для текстового поиска {#bloom-filters-for-text-search}

Для запросов обсервабилити вторичные индексы могут быть полезны при необходимости выполнения текстового поиска. В частности, индексы фильтров Блума на основе n-грамм и токенов [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) и [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) могут использоваться для ускорения поиска по столбцам типа String с операторами `LIKE`, `IN` и hasToken. Важно отметить, что индекс на основе токенов генерирует токены, используя в качестве разделителей неалфавитно-цифровые символы. Это означает, что при выполнении запроса могут быть найдены только токены (или целые слова). Для более детального поиска можно использовать [фильтр Блума на основе N-грамм](/optimize/skipping-indexes#bloom-filter-types). Он разбивает строки на n-граммы заданного размера, что позволяет выполнять поиск по частям слов.

Для оценки токенов, которые будут сгенерированы и затем сопоставлены, используйте функцию `tokens`:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Функция `ngram` предоставляет аналогичные возможности, при этом размер `ngram` можно указать вторым параметром:

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note Инвертированные индексы
ClickHouse также имеет экспериментальную поддержку инвертированных индексов в качестве вторичного индекса. В настоящее время мы не рекомендуем их использовать для логов, но ожидаем, что они заменят токен-ориентированные фильтры Блума после выхода в production.
:::

Для целей данного примера мы используем набор данных структурированных логов. Предположим, что необходимо подсчитать логи, в которых столбец `Referer` содержит `ultra`.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

Здесь нужно выполнить сопоставление с размером n-грамм, равным 3. Поэтому создаём индекс `ngrambf_v1`.

```sql
CREATE TABLE otel_logs_bloom
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        INDEX idx_span_attr_value Referer TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY (Timestamp)
```

Индекс `ngrambf_v1(3, 10000, 3, 7)` принимает четыре параметра. Последний из них (значение 7) представляет собой начальное значение (seed). Остальные представляют размер n-граммы (3), значение `m` (размер фильтра) и количество хеш-функций `k` (7). Параметры `k` и `m` требуют настройки и будут зависеть от количества уникальных n-грамм/токенов и вероятности того, что фильтр даст истинно отрицательный результат, тем самым подтверждая отсутствие значения в грануле. Рекомендуем использовать [эти функции](/engines/table-engines/mergetree-family/mergetree#bloom-filter) для определения этих значений.

Если всё настроено правильно, ускорение может быть существенным:

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│   182   │
└─────────┘

1 row in set. Elapsed: 0.077 sec. Processed 4.22 million rows, 375.29 MB (54.81 million rows/s., 4.87 GB/s.)
Peak memory usage: 129.60 KiB.
```

:::note Только пример
Приведённое выше предназначено исключительно для иллюстрации. Мы рекомендуем пользователям извлекать структуру из своих логов при вставке данных, а не пытаться оптимизировать текстовый поиск с помощью bloom-фильтров на основе токенов. Тем не менее существуют случаи, когда у пользователей есть трассировки стека или другие большие строки, для которых текстовый поиск может быть полезен из-за менее детерминированной структуры.
:::

Несколько общих рекомендаций по использованию bloom-фильтров:

Задача bloom-фильтра — отфильтровать [гранулы](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), тем самым избегая необходимости загружать все значения для столбца и выполнять линейное сканирование. Оператор `EXPLAIN` с параметром `indexes=1` можно использовать для определения количества пропущенных гранул. Рассмотрите результаты ниже для исходной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с bloom-фильтром ngram.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│       Expression (Before GROUP BY)                                 │
│       Filter ((WHERE + Change column names to column identifiers)) │
│       ReadFromMergeTree (default.otel_logs_v2)                     │
│       Indexes:                                                     │
│               PrimaryKey                                           │
│               Condition: true                                      │
│               Parts: 9/9                                           │
│               Granules: 1278/1278                                  │
└────────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.016 sec.

EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│       Expression (Before GROUP BY)                                 │
│       Filter ((WHERE + Change column names to column identifiers)) │
│       ReadFromMergeTree (default.otel_logs_bloom)                  │
│       Indexes:                                                     │
│               PrimaryKey                                           │ 
│               Condition: true                                      │
│               Parts: 8/8                                           │
│               Granules: 1276/1276                                  │
│               Skip                                                 │
│               Name: idx_span_attr_value                            │
│               Description: ngrambf_v1 GRANULARITY 1                │
│               Parts: 8/8                                           │
│               Granules: 517/1276                                   │
└────────────────────────────────────────────────────────────────────┘
```

Фильтр Блума, как правило, будет быстрее только в том случае, если он меньше самого столбца. Если он больше, выигрыш в производительности, скорее всего, будет несущественным. Сравните размер фильтра с размером столбца, используя следующие запросы:


```sql
SELECT
        name,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE (`table` = 'otel_logs_bloom') AND (name = 'Referer')
GROUP BY name
ORDER BY sum(data_compressed_bytes) DESC

┌─name────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ Referer │ 56.16 MiB       │ 789.21 MiB        │ 14.05 │
└─────────┴─────────────────┴───────────────────┴───────┘

1 row in set. Elapsed: 0.018 sec.

SELECT
        `table`,
        formatReadableSize(data_compressed_bytes) AS compressed_size,
        formatReadableSize(data_uncompressed_bytes) AS uncompressed_size
FROM system.data_skipping_indices
WHERE `table` = 'otel_logs_bloom'

┌─table───────────┬─compressed_size─┬─uncompressed_size─┐
│ otel_logs_bloom │ 12.03 MiB       │ 12.17 MiB         │
└─────────────────┴─────────────────┴───────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

В приведённых выше примерах видно, что вторичный индекс на основе bloom-фильтра имеет размер 12 МБ — почти в 5 раз меньше, чем сжатый размер самого столбца (56 МБ).

Bloom-фильтры могут требовать значительной тонкой настройки. Рекомендуем следовать примечаниям [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые помогут определить оптимальные настройки. Bloom-фильтры также могут быть ресурсоёмкими на этапах вставки и слияния данных. Оцените влияние на производительность вставки, прежде чем добавлять bloom-фильтры в продакшн-среду.

Дополнительные сведения о вторичных пропускающих индексах можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).


### Извлечение из типов Map {#extracting-from-maps}

Тип `Map` широко используется в схемах OTel. Для этого типа требуется, чтобы значения и ключи были одного и того же типа — этого достаточно для метаданных, таких как метки Kubernetes. Имейте в виду, что при выполнении запроса к вложенному ключу (`subkey`) типа `Map` загружается весь родительский столбец. Если в типе `Map` много ключей, это может привести к существенному замедлению запроса, поскольку с диска нужно читать больше данных, чем если бы этот ключ существовал как отдельный столбец.

Если вы часто выполняете запросы к определённому ключу, рассмотрите возможность вынести его в отдельный столбец на корневом уровне. Обычно это задача, которая выполняется в ответ на типичные паттерны доступа уже после развертывания и может быть сложной для прогнозирования до выхода в продакшен. См. раздел ["Managing schema changes"](/observability/managing-data#managing-schema-changes) о том, как изменять схему после развертывания.

## Измерение размера таблицы и степени сжатия {#measuring-table-size--compression}

Одна из основных причин, по которой ClickHouse используют для задач обсервабилити, — это сжатие.

Помимо существенного снижения затрат на хранение, меньшее количество данных на диске означает меньше операций ввода-вывода (I/O) и более быстрые запросы и вставки. Снижение объёма I/O перевесит накладные расходы на CPU, связанные с любым алгоритмом сжатия. Поэтому улучшение сжатия данных должно быть первым приоритетом при работе над обеспечением высокой скорости выполнения запросов в ClickHouse.

Подробности об измерении степени сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).