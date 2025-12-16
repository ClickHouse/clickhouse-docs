---
title: 'Проектирование схемы'
description: 'Проектирование схемы для обсервабилити'
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

- **Выбор первичного ключа** - Схемы по умолчанию используют `ORDER BY`, оптимизированный под определённые паттерны доступа. Маловероятно, что ваши паттерны доступа будут с ними совпадать.
- **Извлечение структуры** - Возможно, вы захотите извлечь новые столбцы из существующих столбцов, например из столбца `Body`. Это можно сделать, используя materialized столбцы (и materialized view в более сложных случаях). Это требует изменений схемы.
- **Оптимизация Maps** - Схемы по умолчанию используют тип Map для хранения атрибутов. Эти столбцы позволяют хранить произвольные метаданные. Хотя это критически важная возможность (поскольку метаданные событий часто не определены заранее и иначе не могут быть сохранены в строго типизированной базе данных, такой как ClickHouse), доступ к ключам Map и их значениям менее эффективен, чем доступ к обычному столбцу. Мы решаем эту проблему, модифицируя схему и вынося наиболее часто используемые ключи Map в столбцы верхнего уровня — см. раздел ["Extracting structure with SQL"](#extracting-structure-with-sql). Это требует изменения схемы.
- **Упрощение доступа к ключам Map** - Доступ к ключам в Map требует более многословного синтаксиса. Это можно смягчить с помощью алиасов. См. ["Using Aliases"](#using-aliases) для упрощения запросов.
- **Вторичные индексы** - Схема по умолчанию использует вторичные индексы для ускорения доступа к Maps и ускорения текстовых запросов. Обычно в них нет необходимости, и они требуют дополнительного дискового пространства. Их можно использовать, но следует протестировать, действительно ли они нужны. См. ["Secondary / Data Skipping indices"](#secondarydata-skipping-indices).
- **Использование Codecs** - Возможно, вы захотите настроить кодеки для столбцов, если вы хорошо представляете ожидаемые данные и у вас есть подтверждения, что это улучшает сжатие.

_Ниже мы подробно описываем каждый из приведённых выше вариантов использования._

**Важно:** Хотя пользователям рекомендуется расширять и модифицировать свою схему для достижения оптимального сжатия и производительности запросов, по возможности им следует придерживаться схемы именования OTel для основных столбцов. Плагин ClickHouse для Grafana предполагает наличие некоторых базовых столбцов OTel, чтобы облегчить построение запросов, например Timestamp и SeverityText. Требуемые столбцы для логов и трейсов задокументированы здесь [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) соответственно. Вы можете изменить эти имена столбцов, переопределив значения по умолчанию в конфигурации плагина.

## Извлечение структуры с помощью SQL {#extracting-structure-with-sql}

Независимо от того, принимаются ли структурированные или неструктурированные логи, пользователям часто требуется возможность:

* **Извлекать столбцы из строковых blob-значений**. Запросы к таким столбцам будут выполняться быстрее, чем использование строковых операций на этапе выполнения запроса.
* **Извлекать ключи из значений типа Map**. Базовая схема размещает произвольные атрибуты в столбцах типа Map. Этот тип предоставляет возможность работы без схемы, что удобно тем, что пользователям не нужно заранее определять столбцы для атрибутов при описании логов и трейсов — часто это невозможно, когда логи собираются из Kubernetes и требуется сохранить метки подов для последующего поиска. Доступ к ключам и значениям Map медленнее, чем выполнение запросов по обычным столбцам ClickHouse. Поэтому зачастую желательно извлекать ключи из значений типа Map в корневые столбцы таблицы.

Рассмотрим следующие запросы:

Предположим, мы хотим посчитать, какие URL-пути получают больше всего POST-запросов, используя структурированные логи. JSON-блоб хранится в столбце `Body` как String. Дополнительно он может также сохраняться в столбце `LogAttributes` как `Map(String, String)`, если пользователь включил json&#95;parser в коллекторе.

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

Предположим, что `LogAttributes` доступен. Тогда запрос, подсчитывающий, какие URL‑пути сайта получают больше всего POST‑запросов, будет выглядеть так:

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

Обратите внимание на использование синтаксиса `map` здесь, например `LogAttributes['request_path']`, а также на функцию [`path`](/sql-reference/functions/url-functions#path) для удаления параметров запроса из URL.

Если пользователь не включил разбор JSON в коллекторе, то `LogAttributes` будет пустым, что вынудит нас использовать [JSON-функции](/sql-reference/functions/json-functions) для извлечения столбцов из строкового столбца `Body`.

:::note Предпочитайте ClickHouse для разбора
В целом мы рекомендуем выполнять разбор JSON структурированных логов в ClickHouse. Мы уверены, что ClickHouse предоставляет самую быструю реализацию разбора JSON. Однако мы понимаем, что вы можете захотеть отправлять логи в другие системы и не размещать эту логику в SQL.
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

Аналогичный запрос для неструктурированных логов требует использования регулярных выражений с функцией `extractAllGroupsVertical`.

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

Повышенная сложность и ресурсозатратность запросов для разбора неструктурированных логов (обратите внимание на разницу в производительности) — вот почему мы рекомендуем пользователям по возможности всегда использовать структурированные логи.

:::note Рассмотрите использование словарей
Приведённый выше запрос можно оптимизировать, используя словари регулярных выражений. Подробнее см. в разделе [Using Dictionaries](#using-dictionaries).
:::

Оба этих сценария можно реализовать в ClickHouse, перенёсши приведённую выше логику запроса на момент вставки данных. Ниже мы рассмотрим несколько подходов и отметим, когда каждый из них целесообразен.

:::note OTel или ClickHouse для обработки?
Вы также можете выполнять обработку с использованием процессоров и операторов OTel collector, как описано [здесь](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching). В большинстве случаев вы увидите, что ClickHouse значительно эффективнее расходует ресурсы и работает быстрее, чем процессоры коллектора. Основной недостаток выполнения всей обработки событий в SQL заключается в привязке вашего решения к ClickHouse. Например, вы можете захотеть отправлять обработанные логи из OTel collector в другие конечные точки, например в S3.
:::


### Материализованные столбцы {#materialized-columns}

Материализованные столбцы предоставляют самое простое решение для извлечения структуры из других столбцов. Значения таких столбцов всегда вычисляются во время вставки и не могут быть указаны в запросах INSERT.

:::note Накладные расходы
Материализованные столбцы создают дополнительные накладные расходы на хранение, поскольку значения извлекаются в новые столбцы на диске во время вставки.
:::

Материализованные столбцы поддерживают любые выражения ClickHouse и могут использовать любые аналитические функции для [обработки строк](/sql-reference/functions/string-functions) (включая функции [регулярных выражений и поиска](/sql-reference/functions/string-search-functions)) и [URL](/sql-reference/functions/url-functions), выполнения [преобразований типов](/sql-reference/functions/type-conversion-functions), [извлечения значений из JSON](/sql-reference/functions/json-functions) или [математических операций](/sql-reference/functions/math-functions).

Мы рекомендуем использовать материализованные столбцы для базовой обработки. Они особенно полезны для извлечения значений из map-структур, вывода их в корневые столбцы и выполнения преобразований типов. Чаще всего они оказываются наиболее полезными в простых схемах или в сочетании с materialized view. Рассмотрите следующую схему для логов, из которых JSON был извлечён в столбец `LogAttributes` коллектором:

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

Наши три материализованных столбца извлекают страницу запроса, тип запроса и домен реферера. Они обращаются к ключам map и применяют функции к их значениям. Наш последующий запрос выполняется значительно быстрее:

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
Материализованные столбцы по умолчанию не возвращаются в результате запроса `SELECT *`. Это необходимо для сохранения инварианта: результат `SELECT *` всегда можно вставить обратно в таблицу с помощью INSERT. Это поведение можно отключить, установив `asterisk_include_materialized_columns=1`, а также изменить в Grafana (см. `Additional Settings -> Custom Settings` в конфигурации источника данных).
:::


## Materialized views {#materialized-views}

[Materialized views](/materialized-views) предоставляют более мощный способ применения SQL-фильтрации и трансформаций к логам и трейсам.

Materialized Views позволяют перенести стоимость вычислений с момента выполнения запроса на момент вставки данных. Materialized view в ClickHouse — это по сути триггер, который выполняет запрос над блоками данных по мере их вставки в таблицу. Результаты этого запроса вставляются во вторую, «целевую» таблицу.

<Image img={observability_10} alt="Materialized view" size="md" />

:::note Обновление в реальном времени
Materialized views в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на которой они основаны, и функционируют скорее как постоянно обновляющиеся индексы. Напротив, в других базах данных materialized views обычно представляют собой статичные снимки результата запроса, которые необходимо периодически обновлять (аналогично ClickHouse Refreshable Materialized Views).
:::

Запрос, связанный с materialized view, теоретически может быть любым запросом, включая агрегацию, хотя [существуют ограничения при использовании Joins](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для задач трансформации и фильтрации, необходимых для логов и трейсов, можно считать возможным любой оператор `SELECT`.

Важно помнить, что запрос — это просто триггер, выполняющийся над строками, вставляемыми в таблицу (исходная таблица), а результаты отправляются в новую таблицу (целевая таблица).

Чтобы гарантировать, что мы не будем хранить данные дважды (в исходной и целевой таблицах), мы можем изменить движок исходной таблицы на [Null table engine](/engines/table-engines/special/null), сохранив исходную схему. Наши OTel collectors продолжат отправлять данные в эту таблицу. Например, для логов таблица `otel_logs` становится:

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

Движок таблицы Null — это мощная оптимизация, его можно представить как `/dev/null`. Эта таблица не будет сохранять данные, но все привязанные materialized view по-прежнему будут выполняться над вставляемыми строками до того, как они будут отброшены.

Рассмотрим следующий запрос. Этот запрос преобразует наши строки в формат, который мы хотим сохранить, извлекая все столбцы из `LogAttributes` (предполагается, что они были заданы коллектором с использованием оператора `json_parser`), а также устанавливая `SeverityText` и `SeverityNumber` (на основе нескольких простых условий и определения [этих столбцов](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В этом случае мы также выбираем только те столбцы, про которые знаем, что они будут заполнены, — игнорируем такие столбцы, как `TraceId`, `SpanId` и `TraceFlags`.


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

Мы также извлекаем столбец `Body` (см. выше) — на случай, если позже будут добавлены дополнительные атрибуты, которые не извлекаются нашим SQL. Этот столбец должен хорошо сжиматься в ClickHouse и будет редко запрашиваться, поэтому не повлияет на производительность запросов. Наконец, мы приводим Timestamp к типу DateTime (для экономии места — см. раздел [«Optimizing Types»](#optimizing-types)) с помощью приведения типа (CAST).

:::note Conditionals
Обратите внимание на использование [условных функций](/sql-reference/functions/conditional-functions) выше для извлечения `SeverityText` и `SeverityNumber`. Они чрезвычайно полезны для формулирования сложных условий и проверки, заданы ли значения в map — мы наивно предполагаем, что все ключи существуют в `LogAttributes`. Рекомендуем использовать их активно — это ваши помощники при разборе логов, в дополнение к функциям для обработки [null-значений](/sql-reference/functions/functions-for-nulls)!
:::

Нам требуется таблица для приёма этих результатов. Целевая таблица ниже соответствует приведённому выше запросу:

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
Обратите внимание, насколько сильно мы изменили нашу схему. На практике у вас, вероятно, также будут столбцы трассировок, которые вы захотите сохранить, а также столбец `ResourceAttributes` (обычно он содержит метаданные Kubernetes). Grafana может использовать столбцы трассировок, чтобы обеспечивать связывание между логами и трассировками — см. [&quot;Using Grafana&quot;](/observability/grafana).
:::


Ниже мы создаём materialized view `otel_logs_mv`, который выполняет указанный выше SELECT-запрос для таблицы `otel_logs` и отправляет результаты в `otel_logs_v2`.

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

Это визуализировано следующим образом:

<Image img={observability_11} alt="Otel MV" size="md" />

Если теперь перезапустить конфигурацию коллектора, используемую в разделе [&quot;Exporting to ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse), данные появятся в `otel_logs_v2` в требуемом формате. Обратите внимание на использование типизированных функций извлечения из JSON.

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

Вышеуказанные materialized views полагаются на неявное приведение типов — особенно при использовании map-колонки `LogAttributes`. ClickHouse во многих случаях будет прозрачно приводить извлечённое значение к типу целевой таблицы, упрощая запросы. Однако мы рекомендуем всегда тестировать такие представления, выполняя `SELECT` из этих представлений совместно с командой [`INSERT INTO`](/sql-reference/statements/insert-into) в целевую таблицу с той же схемой. Это позволяет убедиться, что типы обрабатываются корректно. Особое внимание следует уделить следующим случаям:

- Если ключ не существует в map-колонке, будет возвращена пустая строка. В случае числовых типов вам потребуется сопоставить такие значения с подходящим значением. Это можно сделать с помощью [условных функций](/sql-reference/functions/conditional-functions), например: `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`, или [функций приведения типов](/sql-reference/functions/type-conversion-functions), если вас устраивают значения по умолчанию, например: `toUInt8OrDefault(LogAttributes['status'] )`.
- Некоторые типы не всегда будут приводиться, например строковые представления числовых значений не будут приводиться к значениям Enum.
- Функции извлечения JSON возвращают значения по умолчанию для своего типа, если значение не найдено. Убедитесь, что эти значения корректны для вашего случая!

:::note Избегайте Nullable
Избегайте использования [Nullable](/sql-reference/data-types/nullable) в ClickHouse для данных обсервабилити. В логах и трейcах редко требуется различать пустое значение и NULL. Эта функциональность приводит к дополнительным затратам на хранение и будет негативно влиять на производительность запросов. Дополнительные сведения см. [здесь](/data-modeling/schema-design#optimizing-types).
:::

## Выбор первичного (упорядочивающего) ключа {#choosing-a-primary-ordering-key}

После того как вы выделили нужные столбцы, вы можете начать оптимизировать ваш ключ сортировки/первичный ключ.

Можно применить несколько простых правил, чтобы выбрать ключ сортировки. Следующие правила могут иногда конфликтовать, поэтому учитывайте их по порядку. В результате этого процесса вы можете определить несколько ключей, при этом обычно достаточно 4–5:

1. Выбирайте столбцы, которые соответствуют вашим типичным фильтрам и паттернам доступа. Если вы обычно начинаете расследования в области обсервабилити с фильтрации по определённому столбцу, например имени пода, этот столбец будет часто использоваться в `WHERE`-условиях. Отдавайте приоритет включению таких столбцов в ключ по сравнению с теми, которые используются реже.
2. Предпочитайте столбцы, которые при фильтрации помогают исключить большой процент всех строк, тем самым сокращая объём данных, который нужно прочитать. Имена сервисов и коды статусов часто являются хорошими кандидатами — в последнем случае только если вы фильтруете по значениям, исключающим большинство строк, например фильтрация по 200-м в большинстве систем будет соответствовать большинству строк, в то время как ошибки 500 будут соответствовать небольшому подмножеству строк.
3. Предпочитайте столбцы, которые, вероятно, будут сильно коррелировать с другими столбцами в таблице. Это поможет гарантировать, что эти значения также будут храниться последовательно, улучшая сжатие.
4. Операции `GROUP BY` и `ORDER BY` для столбцов в ключе сортировки могут быть сделаны более эффективными по потреблению памяти.

<br />

Определив подмножество столбцов для ключа сортировки, необходимо объявить их в определённом порядке. Этот порядок может существенно повлиять как на эффективность фильтрации по вторичным столбцам ключа в запросах, так и на коэффициент сжатия файлов данных таблицы. В общем случае **лучше всего упорядочивать ключи в порядке возрастания их кардинальности**. Это нужно сбалансировать с тем фактом, что фильтрация по столбцам, которые появляются позже в ключе сортировки, будет менее эффективной, чем фильтрация по тем, которые идут раньше в кортеже. Сбалансируйте эти свойства и учитывайте ваши паттерны доступа. И самое важное — тестируйте варианты. Для более глубокого понимания ключей сортировки и их оптимизации мы рекомендуем [эту статью](/guides/best-practices/sparse-primary-indexes).

:::note Structure first
Мы рекомендуем определять ключи сортировки после того, как вы структурировали свои логи. Не используйте ключи в картах атрибутов для ключа сортировки или выражений извлечения JSON. Убедитесь, что ваши ключи сортировки представлены как корневые столбцы в вашей таблице.
:::

## Использование map-структур {#using-maps}

В предыдущих примерах показано использование синтаксиса `map['key']` для доступа к значениям в столбцах типа `Map(String, String)`. Помимо нотации map для доступа к вложенным ключам, в ClickHouse доступны специализированные [map-функции](/sql-reference/functions/tuple-map-functions#mapkeys) для фильтрации или выборки данных из этих столбцов.

Например, следующий запрос определяет все уникальные ключи, присутствующие в столбце `LogAttributes`, с использованием [функции `mapKeys`](/sql-reference/functions/tuple-map-functions#mapkeys), за которой следует [функция `groupArrayDistinctArray`](/sql-reference/aggregate-functions/combinators) (комбинатор).

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
Мы не рекомендуем использовать точки в именах столбцов типа Map, и в будущем этот способ может быть объявлен устаревшим. Используйте `_`.
:::


## Использование псевдонимов {#using-aliases}

Выполнение запросов к типам `map` медленнее, чем к обычным столбцам — см. [&quot;Accelerating queries&quot;](#accelerating-queries). Кроме того, синтаксис более сложный, и такие запросы могут быть неудобны при написании. Чтобы решить эту проблему, мы рекомендуем использовать столбцы типа ALIAS.

Столбцы типа ALIAS вычисляются во время выполнения запроса и не хранятся в таблице. Поэтому выполнить INSERT значения в столбец этого типа невозможно. Используя псевдонимы, мы можем ссылаться на ключи `map` и упростить синтаксис, прозрачно представив элементы `map` как обычный столбец. Рассмотрим следующий пример:

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

У нас есть несколько материализованных столбцов и столбец `ALIAS` `RemoteAddr`, который обращается к map-столбцу `LogAttributes`. Теперь мы можем выполнять запросы к значениям `LogAttributes['remote_addr']` через этот столбец, что упрощает наш запрос, например:

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

Кроме того, добавить `ALIAS` очень просто с помощью команды `ALTER TABLE`. Эти столбцы сразу становятся доступными, например:

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

:::note Псевдонимы по умолчанию исключаются
По умолчанию `SELECT *` исключает столбцы с типом ALIAS. Это поведение можно отключить, установив `asterisk_include_alias_columns=1`.
:::


## Оптимизация типов {#optimizing-types}

[Общие рекомендации ClickHouse по оптимизации типов](/data-modeling/schema-design#optimizing-types) применимы и к данному сценарию использования ClickHouse.

## Использование кодеков {#using-codecs}

Помимо оптимизации типов, вы можете следовать [общим рекомендациям по использованию кодеков](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) при оптимизации сжатия для схем ClickHouse Observability.

Как правило, кодек `ZSTD` хорошо подходит для наборов данных логов и трейсов. Увеличение уровня сжатия по сравнению со значением по умолчанию 1 может улучшить степень сжатия. Однако это следует проверять, так как более высокие значения приводят к большему потреблению CPU во время вставки. На практике мы редко наблюдаем существенный выигрыш от увеличения этого значения.

Кроме того, временные метки, хотя и выигрывают от дельта-кодирования с точки зрения сжатия, могут приводить к замедлению выполнения запросов, если этот столбец используется в качестве первичного/упорядочивающего ключа. Мы рекомендуем пользователям оценить соответствующие компромиссы между сжатием и производительностью запросов.

## Использование словарей {#using-dictionaries}

[Словари](/sql-reference/dictionaries) — это [ключевая функция](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) ClickHouse, обеспечивающая хранящееся в памяти [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) представление данных из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources), оптимизированное для сверхнизкой задержки при выполнении запросов на поиск.

<Image img={observability_12} alt="Обсервабилити и словари" size="md"/>

Это удобно в различных сценариях — от обогащения данных при приёме «на лету» без замедления процесса ингестии до общего повышения производительности запросов, особенно с участием JOIN, которые получают наибольший эффект.
Хотя JOIN-запросы редко требуются в сценариях обсервабилити, словари по-прежнему могут быть полезны для обогащения — как во время вставки данных, так и во время выполнения запроса. Ниже мы приводим примеры обоих подходов.

:::note Accelerating joins
Пользователи, заинтересованные в ускорении JOIN-операций с помощью словарей, могут найти дополнительные подробности [здесь](/dictionary).
:::

### Время вставки и время запроса {#insert-time-vs-query-time}

Словари могут использоваться для обогащения наборов данных во время выполнения запроса или во время вставки. У каждого из этих подходов есть свои преимущества и недостатки. Вкратце:

- **Время вставки** — обычно подходит, если значение для обогащения не изменяется и существует во внешнем источнике, который может быть использован для заполнения словаря. В этом случае обогащение строки во время вставки избавляет от необходимости выполнять поиск в словаре во время запроса. Это происходит за счет производительности вставки, а также дополнительного накладного расхода на хранение, так как обогащенные значения будут храниться как столбцы.
- **Время запроса** — если значения в словаре часто меняются, поиск во время запроса зачастую более уместен. Это избавляет от необходимости обновлять столбцы (и перезаписывать данные), если сопоставленные значения изменяются. Такая гибкость достигается ценой накладных расходов на поиск во время запроса. Эти накладные расходы обычно заметны, если требуется выполнить большое количество поисков по множеству строк, например при использовании поиска в словаре в фильтрующем выражении. Для обогащения результата, то есть в `SELECT`, эти накладные расходы обычно несущественны.

Мы рекомендуем пользователям ознакомиться с основами словарей. Словари предоставляют размещенную в памяти таблицу для поиска, из которой значения могут быть получены с помощью [специализированных функций](/sql-reference/functions/ext-dict-functions#dictGetAll).

Примеры простого обогащения можно найти в руководстве по словарям [здесь](/dictionary). Ниже мы сосредоточимся на типичных задачах обогащения данных для обсервабилити.

### Использование IP-словарей {#using-ip-dictionaries}

Геообогащение логов и трейсов значениями широты и долготы на основе IP-адресов — распространённое требование в обсервабилити. Это можно реализовать с помощью структурированного словаря `ip_trie`.

Мы используем общедоступный [набор данных DB-IP на уровне городов](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставляемый [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [файла README](https://github.com/sapics/ip-location-db#csv-format) видно, что данные имеют следующую структуру:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

Исходя из этой структуры, начнем с быстрого просмотра данных с помощью табличной функции [url()](/sql-reference/table-functions/url):

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

Для упрощения задачи давайте используем движок таблицы [`URL()`](/engines/table-engines/special/url), чтобы создать объект таблицы ClickHouse с нашими именами полей и проверить общее количество строк:

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

Поскольку наш словарь `ip_trie` требует, чтобы диапазоны IP-адресов были заданы в формате CIDR, нам нужно будет преобразовать `ip_range_start` и `ip_range_end`.

CIDR для каждого диапазона можно вычислить с помощью следующего запроса:

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
В приведённом выше запросе происходит много всего. Тем, кому интересно, рекомендуем прочитать это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). В противном случае просто примите как данность, что в этом запросе вычисляется CIDR для диапазона IP-адресов.
:::

Для наших целей нам понадобятся только диапазон IP-адресов, код страны и координаты, поэтому давайте создадим новую таблицу и вставим в неё наши данные GeoIP:

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

Чтобы выполнять IP‑поиски с низкой задержкой в ClickHouse, мы будем использовать словари для хранения в памяти отображения ключей в атрибуты для наших GeoIP‑данных. ClickHouse предоставляет структуру словаря `ip_trie` ([dictionary structure](/sql-reference/dictionaries#ip_trie)) для сопоставления сетевых префиксов (CIDR‑блоков) с координатами и кодами стран. Следующий запрос определяет словарь такой структуры, используя приведённую выше таблицу в качестве источника.

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

Мы можем выбрать строки из словаря и убедиться, что этот набор данных доступен для поиска по ключу:

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
Словари в ClickHouse периодически обновляются на основе данных базовой таблицы и использованного выше параметра lifetime. Чтобы обновить наш словарь Geo IP в соответствии с последними изменениями в наборе данных DB-IP, нам нужно просто повторно вставить данные из удалённой таблицы `geoip_url` в нашу таблицу `geoip` с применением необходимых преобразований.
:::

Теперь, когда данные Geo IP загружены в наш словарь `ip_trie` (который, кстати, также называется `ip_trie`), мы можем использовать его для геолокации по IP. Это можно сделать с помощью функции [`dictGet()`](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Обратите внимание на скорость выборки. Это позволяет нам обогащать логи. В данном случае мы выбираем **выполнять обогащение на этапе выполнения запроса**.

Возвращаясь к нашему исходному набору логов, мы можем использовать описанное выше, чтобы агрегировать логи по странам. Далее предполагается, что мы используем схему, полученную из ранее созданной materialized view, в которой имеется извлечённый столбец `RemoteAddress`.


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

Поскольку сопоставление IP-адреса с географическим местоположением может меняться, пользователям, как правило, важно знать, откуда исходил запрос в момент его выполнения, а не каково текущее географическое местоположение для того же адреса. По этой причине здесь, скорее всего, предпочтительно обогащение на этапе индексации. Это можно сделать с использованием материализованных столбцов, как показано ниже, или в SELECT выражении materialized view:

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

:::note Периодически обновляйте
Пользователи, скорее всего, захотят, чтобы словарь обогащения по IP периодически обновлялся на основе новых данных. Это можно реализовать с помощью параметра `LIFETIME` словаря, который обеспечивает его периодическую перезагрузку из базовой таблицы. Информацию об обновлении базовой таблицы см. в разделе [&quot;Refreshable Materialized views&quot;](/materialized-view/refreshable-materialized-view).
:::

Указанные выше страны и координаты дают возможности визуализации, которые выходят за рамки простой группировки и фильтрации по стране. Для вдохновения см. раздел [&quot;Visualizing geo data&quot;](/observability/grafana#visualizing-geo-data).


### Использование regex-словарей (разбор user agent) {#using-regex-dictionaries-user-agent-parsing}

Разбор [строк user agent](https://en.wikipedia.org/wiki/User_agent) — классическая задача для регулярных выражений и распространённое требование для наборов данных, основанных на логах и трассировках. ClickHouse предоставляет эффективный разбор user agent с использованием словарей на основе деревьев регулярных выражений (Regular Expression Tree Dictionaries).

Словари на основе деревьев регулярных выражений в ClickHouse open-source определяются с использованием типа источника словаря `YAMLRegExpTree`, который задаёт путь к YAML‑файлу, содержащему дерево регулярных выражений. Если вы хотите использовать собственный словарь регулярных выражений, подробности требуемой структуры можно найти [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source). Ниже мы сосредоточимся на разборе user agent с использованием [uap-core](https://github.com/ua-parser/uap-core) и загрузим наш словарь для поддерживаемого CSV‑формата. Этот подход совместим как с OSS, так и с ClickHouse Cloud.

:::note
В примерах ниже мы используем снимки актуальных регулярных выражений uap-core для разбора user agent по состоянию на июнь 2024 года. Последнюю версию файла, который периодически обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Вы можете выполнить шаги, описанные [здесь](/sql-reference/dictionaries#collecting-attribute-values), чтобы загрузить данные в CSV‑файл, используемый ниже.
:::

Создайте следующие таблицы с движком Memory. В них будут храниться наши регулярные выражения для разбора устройств, браузеров и операционных систем.

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

Эти таблицы можно заполнить из следующих общедоступных CSV-файлов с помощью табличной функции `url`:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

После заполнения наших таблиц в памяти мы можем загрузить словари регулярных выражений. Обратите внимание, что нам нужно задать значения ключей как столбцы — это будут атрибуты, которые мы сможем извлечь из строки User-Agent.

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

После загрузки этих словарей мы можем передать пример значения user-agent и протестировать наши новые возможности извлечения с помощью словарей:


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

Учитывая, что правила, связанные с User-Agent, будут меняться редко, а словарь нужно будет обновлять лишь по мере появления новых браузеров, операционных систем и устройств, имеет смысл выполнять это извлечение в момент вставки данных.

Мы можем выполнить эту работу либо с помощью materialized column, либо с помощью materialized view. Ниже мы изменяем materialized view, использованный ранее:

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

Для этого нам потребуется изменить схему целевой таблицы `otel_logs_v2`:

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

После перезапуска коллектора и начала приёма структурированных логов согласно ранее описанным шагам мы можем выполнять запросы к нашим новым извлечённым столбцам Device, Browser и OS.


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
Обратите внимание на использование кортежей (Tuple) для этих столбцов user agent. Кортежи рекомендуется использовать для сложных структур с заранее известной иерархией. Подстолбцы обеспечивают такую же производительность, как обычные столбцы (в отличие от ключей Map), при этом позволяют использовать разные типы данных.
:::


### Дополнительные материалы {#further-reading}

Для получения дополнительных примеров и подробностей о словарях рекомендуем следующие статьи:

- [Расширенные темы по словарям](/dictionary#advanced-dictionary-topics)
- [«Использование словарей для ускорения запросов»](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Словари](/sql-reference/dictionaries)

## Ускорение запросов {#accelerating-queries}

ClickHouse поддерживает ряд методов для ускорения выполнения запросов. К следующим подходам следует обращаться только после выбора подходящего первичного/сортировочного ключа, оптимизированного под наиболее распространённые сценарии доступа и обеспечивающего максимальное сжатие данных. Как правило, именно этот шаг даёт наибольший прирост производительности при наименьших затратах.

### Использование materialized views (инкрементальных) для агрегаций {#using-materialized-views-incremental-for-aggregations}

В предыдущих разделах мы рассмотрели использование materialized views для трансформации и фильтрации данных. Однако materialized views также могут использоваться для предварительного вычисления агрегаций на этапе вставки и сохранения результата. Этот результат может обновляться при последующих вставках, тем самым фактически позволяя заранее вычислять агрегацию при вставке данных.

Основная идея здесь заключается в том, что результаты часто будут представлять собой более компактное представление исходных данных (частичное приближение в случае агрегаций). В сочетании с более простым запросом для чтения результатов из целевой таблицы время выполнения запроса будет меньше, чем если бы те же вычисления выполнялись над исходными данными.

Рассмотрим следующий запрос, в котором мы вычисляем общий трафик по часам, используя наши структурированные логи:

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

Можно представить, что это типичный линейный график, который пользователи строят в Grafana. Этот запрос, надо признать, очень быстрый — в наборе данных всего 10 млн строк, и ClickHouse быстр! Однако, если мы масштабируем объём данных до миллиардов и триллионов строк, нам хотелось бы сохранить такую же производительность запроса.

:::note
Этот запрос был бы в 10 раз быстрее, если бы мы использовали таблицу `otel_logs_v2`, которая получается из нашей предыдущей materialized view и извлекает ключ `size` из map `LogAttributes`. Здесь мы используем «сырые» данные только для иллюстрации и рекомендуем использовать предыдущую view, если это распространённый запрос.
:::

Нам нужна таблица для приёма результатов, если мы хотим выполнять вычисления во время вставки с использованием materialized view. Эта таблица должна хранить только одну строку в час. Если для уже существующего часа поступает обновление, остальные столбцы должны быть объединены с существующей строкой этого часа. Чтобы такое поэтапное слияние инкрементальных состояний было возможно, для остальных столбцов должны храниться частичные состояния.

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

Чтобы продемонстрировать наш materialized view, предположим, что таблица `bytes_per_hour` пуста и в неё ещё не поступали данные. Наш materialized view выполняет указанный выше запрос `SELECT` для данных, вставляемых в `otel_logs` (операция выполняется над блоками заданного размера), а результаты записывает в `bytes_per_hour`. Синтаксис показан ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Здесь ключевым является оператор `TO`, который указывает, куда будут отправлены результаты, т.е. в `bytes_per_hour`.

Если мы перезапустим наш OTel collector и переотправим логи, таблица `bytes_per_hour` будет постепенно (инкрементально) заполняться результатом указанного выше запроса. По завершении мы можем проверить содержимое таблицы `bytes_per_hour` — у нас должна быть 1 строка на каждый час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```


Мы фактически сократили количество строк с 10 млн (в `otel_logs`) до 113 за счет сохранения результата нашего запроса. Ключевой момент заключается в том, что при вставке новых логов в таблицу `otel_logs` новые значения будут отправлены в `bytes_per_hour` для соответствующего часа, где они будут автоматически асинхронно объединены в фоновом режиме — сохраняя только одну строку в час, `bytes_per_hour` таким образом всегда будет и компактной, и актуальной.

Поскольку объединение строк выполняется асинхронно, при выполнении запроса пользователем может существовать более одной строки на час. Чтобы гарантировать слияние всех незамерженных строк во время выполнения запроса, у нас есть два варианта:

* Использовать [модификатор `FINAL`](/sql-reference/statements/select/from#final-modifier) в запросе к таблице (как мы сделали для запроса с подсчетом выше).
* Агрегировать по ключу сортировки, используемому в нашей итоговой таблице, т.е. по Timestamp, и суммировать метрики.

Как правило, второй вариант более эффективен и гибок (таблицу можно использовать и для других задач), но первый может быть проще для некоторых запросов. Ниже показаны оба подхода:

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

Это ускорило выполнение запроса с 0,6 с до 0,008 с — более чем в 75 раз!

:::note
Выигрыш может быть ещё больше на больших наборах данных с более сложными запросами. См. примеры [здесь](https://github.com/ClickHouse/clickpy).
:::


#### Более сложный пример {#a-more-complex-example}

Приведённый выше пример агрегирует простое количество за каждый час с использованием [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Для вычисления статистики, выходящей за рамки простых сумм, требуется другой целевой движок таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

Предположим, что мы хотим вычислить количество уникальных IP-адресов (или уникальных пользователей) в день. Запрос для этого:

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

Для сохранения счёта кардинальности при инкрементальных обновлениях требуется движок AggregatingMergeTree.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

Чтобы ClickHouse знал, что будут храниться агрегатные состояния, мы определяем столбец `UniqueUsers` как тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая функцию, порождающую частичные состояния (uniq), и тип исходного столбца (IPv4). Как и в SummingMergeTree, строки с одинаковым значением ключа `ORDER BY` будут слиты (Hour в приведённом выше примере).

Соответствующая materialized view использует ранее приведённый запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, что мы добавляем суффикс `State` в конец имени наших агрегатных функций. Это гарантирует, что будет возвращено агрегированное состояние функции, а не итоговый результат. Оно будет содержать дополнительную информацию, позволяющую объединять это частичное состояние с другими состояниями.

После того как данные были перезагружены путём перезапуска Collector, мы можем убедиться, что 113 строк доступны в таблице `unique_visitors_per_hour`.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

В нашем итоговом запросе необходимо использовать суффикс Merge для функций (поскольку столбцы хранят состояния частичной агрегации).

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

Обратите внимание, что здесь мы используем `GROUP BY` вместо `FINAL`.


### Использование materialized views (инкрементальных) для быстрых выборок {#using-materialized-views-incremental--for-fast-lookups}

При выборе ключа сортировки в ClickHouse следует учитывать паттерны доступа — столбцы, которые часто используются в предложениях фильтрации и агрегации. Это может быть ограничивающим фактором в сценариях обсервабилити, где у пользователей более разнообразные паттерны доступа, которые невозможно уложить в один набор столбцов. Лучше всего это иллюстрируется на примере, встроенном в типовые OTel-схемы. Рассмотрим схему по умолчанию для трассировок (traces):

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

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. В трейсинге пользователям также необходима возможность выполнять поиск по конкретному `TraceId` и получать спаны, связанные с этим трейсом. Хотя это поле присутствует в ключе сортировки, его расположение в конце означает, что [фильтрация будет менее эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) и, вероятно, приведёт к необходимости сканировать значительные объёмы данных при получении одного трейса.

OTel collector также разворачивает materialized view и связанную таблицу, чтобы решить эту задачу. Таблица и materialized view показаны ниже:

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


Это представление обеспечивает, что таблица `otel_traces_trace_id_ts` содержит минимальную и максимальную метку времени для трассы. Эта таблица, упорядоченная по `TraceId`, позволяет эффективно получать эти временные метки. Эти диапазоны временных меток, в свою очередь, можно использовать при выполнении запроса к основной таблице `otel_traces`. Более конкретно, при получении трассы по её идентификатору Grafana использует следующий запрос:

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

Здесь CTE определяет минимальную и максимальную временную метку для trace id `ae9226c78d1d360601e6383928e4d22d`, который затем используется для фильтрации основной таблицы `otel_traces` по связанным с ним спанам.

Этот же подход можно применять к схожим шаблонам доступа. Похожий пример мы рассматриваем в разделе Data Modeling [здесь](/materialized-view/incremental-materialized-view#lookup-table).


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

В приведённом выше примере мы указываем в проекции столбцы, использованные в предыдущем запросе. Это означает, что только эти столбцы будут сохраняться на диске как часть проекции, упорядоченные по Status. Если же вместо этого мы использовали бы `SELECT *`, сохранялись бы все столбцы. Хотя это позволило бы большему числу запросов (использующих любой поднабор столбцов) получать выгоду от использования проекции, это повлечёт дополнительные затраты на хранение. Для измерения объёма дискового пространства и степени сжатия см. раздел [&quot;Measuring table size &amp; compression&quot;](#measuring-table-size--compression).


### Вторичные/пропускающие индексы {#secondarydata-skipping-indices}

Независимо от того, насколько хорошо настроен первичный ключ в ClickHouse, некоторые запросы неизбежно будут требовать полного сканирования таблицы. Хотя этого можно частично избежать, используя materialized views (и PROJECTION для некоторых запросов), они требуют дополнительного обслуживания, а также того, чтобы пользователи знали об их наличии и могли их использовать. В то время как традиционные реляционные базы данных решают эту задачу с помощью вторичных индексов, они малоэффективны в столбцовых базах данных, таких как ClickHouse. Вместо этого ClickHouse использует пропускающие индексы (skip-индексы), которые могут значительно повысить производительность выполнения запроса, позволяя базе данных пропускать крупные фрагменты данных, не содержащие подходящих значений.

Стандартные схемы OTel используют вторичные индексы в попытке ускорить доступ к данным в полях/столбцах типа Map. Хотя мы в целом считаем их малоэффективными и не рекомендуем копировать их в вашу пользовательскую схему, пропускающие индексы всё же могут быть полезны.

Прежде чем пытаться применять их, вам следует ознакомиться и разобраться с [руководством по вторичным индексам](/optimize/skipping-indexes).

**В общем случае они эффективны, когда существует сильная корреляция между первичным ключом и целевым непервичным столбцом/выражением, а пользователи ищут редкие значения, то есть те, которые не встречаются во многих гранулах.**

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

При правильной настройке прирост производительности здесь может быть значительным:

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
Приведённый выше пример предназначен исключительно для иллюстрации. Мы рекомендуем пользователям извлекать структуру из логов на этапе вставки, а не пытаться оптимизировать текстовый поиск с помощью токенизированных фильтров Блума. Однако существуют случаи, когда у пользователей есть стектрейсы или другие большие строки, для которых текстовый поиск может быть полезен из‑за менее строгой, детерминированной структуры.
:::

Некоторые общие рекомендации по использованию фильтров Блума:

Цель фильтра Блума — отфильтровать [гранулы](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), избегая необходимости загружать все значения для столбца и выполнять линейное сканирование. Оператор `EXPLAIN` с параметром `indexes=1` можно использовать для определения количества гранул, которые были пропущены. Рассмотрите приведённые ниже результаты для исходной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с ngram-фильтром Блума.

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

Фильтр Блума обычно даёт ускорение только в том случае, если он меньше самого столбца. Если он больше, то прирост производительности, скорее всего, будет незначительным. Сравните размер фильтра с размером столбца, используя следующие запросы:


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

В приведённых выше примерах видно, что вторичный индекс на основе Bloom-фильтра имеет размер 12 МБ — почти в 5 раз меньше, чем сжатый размер самого столбца (56 МБ).

Bloom-фильтры могут требовать значительной настройки. Мы рекомендуем следовать рекомендациям [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые могут быть полезны для определения оптимальных настроек. Bloom-фильтры также могут быть ресурсоёмкими во время вставки и слияния данных. Вам следует оценить влияние на производительность вставки перед тем, как добавлять Bloom-фильтры в продуктивную среду.

Дополнительные сведения о вторичных пропускающих индексах можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).


### Извлечение из Map {#extracting-from-maps}

Тип Map широко используется в схемах OTel. Для этого типа требуется, чтобы значения и ключи имели один и тот же тип — этого достаточно для метаданных, таких как метки Kubernetes. Учтите, что при выполнении запроса к вложенному ключу типа Map загружается весь родительский столбец. Если у Map много ключей, это может привести к заметному снижению производительности запроса, так как с диска нужно прочитать больше данных, чем если бы ключ существовал как отдельный столбец.

Если вы часто выполняете запросы к определенному ключу, рассмотрите возможность вынести его в отдельный столбец на корневом уровне. Обычно это делается в ответ на типичные шаблоны доступа уже после развертывания и может быть трудно предсказать до эксплуатации в продакшене. См. раздел ["Управление изменениями схемы"](/observability/managing-data#managing-schema-changes) о том, как изменять схему после развертывания.

## Измерение размера таблицы и степени сжатия {#measuring-table-size--compression}

Одна из основных причин, по которой ClickHouse используется для обсервабилити, — это сжатие.

Помимо существенного снижения затрат на хранение, меньшее количество данных на диске означает меньшую нагрузку на подсистему ввода-вывода и более быстрые запросы и вставки. Снижение объёма операций ввода-вывода перекроет накладные расходы любого алгоритма сжатия по нагрузке на CPU. Поэтому улучшение сжатия данных должно быть первоочередной задачей при работе над ускорением выполнения запросов в ClickHouse.

Подробнее об измерении сжатия можно узнать [здесь](/data-compression/compression-in-clickhouse).