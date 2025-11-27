---
title: 'Проектирование схемы данных'
description: 'Проектирование схемы данных для наблюдаемости'
keywords: ['Обзервабилити', 'логи', 'трассировки', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# Проектирование схемы для обзервабилити

Мы рекомендуем пользователям всегда создавать собственную схему для логов и трейсов по следующим причинам:

- **Выбор первичного ключа** - Схемы по умолчанию используют `ORDER BY`, оптимизированный под конкретные шаблоны доступа. Маловероятно, что ваши шаблоны доступа будут с ними совпадать.
- **Извлечение структуры** - Пользователи могут захотеть извлекать новые столбцы из существующих столбцов, например столбца `Body`. Это можно сделать с помощью материализованных столбцов (и материализованных представлений в более сложных случаях). Для этого требуются изменения схемы.
- **Оптимизация Map** - Схемы по умолчанию используют тип Map для хранения атрибутов. Эти столбцы позволяют хранить произвольные метаданные. Хотя это критически важная возможность, поскольку метаданные событий часто не определены заранее и иначе не могут быть сохранены в строго типизированной базе данных, такой как ClickHouse, доступ к ключам Map и их значениям менее эффективен, чем доступ к обычному столбцу. Мы решаем эту проблему, модифицируя схему и вынося наиболее часто используемые ключи Map в столбцы верхнего уровня — см. раздел ["Extracting structure with SQL"](#extracting-structure-with-sql). Для этого требуется изменение схемы.
- **Упрощение доступа к ключам Map** - Доступ к ключам в Map требует более многословного синтаксиса. Пользователи могут минимизировать это неудобство с помощью алиасов. См. раздел ["Using Aliases"](#using-aliases), чтобы упростить запросы.
- **Вторичные индексы** - Схема по умолчанию использует вторичные индексы для ускорения доступа к Map и ускорения текстовых запросов. Обычно они не нужны и потребляют дополнительное дисковое пространство. Их можно использовать, но следует протестировать, чтобы убедиться, что они действительно необходимы. См. раздел ["Secondary / Data Skipping indices"](#secondarydata-skipping-indices).
- **Использование Codecs** - Пользователи могут захотеть настраивать кодеки для столбцов, если они понимают ожидаемые данные и имеют подтверждение, что это улучшает сжатие.

_Ниже мы подробно описываем каждый из приведённых выше вариантов использования._

**Важно:** Хотя пользователям рекомендуется расширять и изменять свою схему для достижения оптимального сжатия и производительности запросов, по возможности им следует придерживаться соглашений об именовании схемы OTel для основных столбцов. Плагин ClickHouse для Grafana предполагает наличие некоторых базовых столбцов OTel для помощи в построении запросов, например Timestamp и SeverityText. Требуемые столбцы для логов и трейсов задокументированы здесь [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) соответственно. Вы можете переименовать эти столбцы, переопределив значения по умолчанию в конфигурации плагина.

## Извлечение структуры с помощью SQL

Независимо от того, выполняется ли приём структурированных или неструктурированных логов, пользователям часто требуется возможность:

* **Извлекать столбцы из строковых blob-объектов**. Запросы к таким столбцам будут выполняться быстрее, чем использование строковых операций во время выполнения запроса.
* **Извлекать ключи из map-структур**. Базовая схема помещает произвольные атрибуты в столбцы типа Map. Этот тип предоставляет возможность работы без фиксированной схемы, что позволяет пользователям не определять заранее столбцы для атрибутов при описании логов и трейсов — часто это невозможно при сборе логов из Kubernetes и необходимости гарантировать сохранность меток подов для последующего поиска. Доступ к ключам map и их значениям медленнее, чем запрос по обычным столбцам ClickHouse. Поэтому извлечение ключей из map в корневые столбцы таблицы часто предпочтительно.

Рассмотрим следующие запросы:

Предположим, мы хотим посчитать, какие URL-пути получают больше всего POST-запросов, используя структурированные логи. JSON blob хранится в столбце `Body` как String. Дополнительно он может также храниться в столбце `LogAttributes` как `Map(String, String)`, если пользователь включил `json_parser` в коллекторе.

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

Предположим, что `LogAttributes` доступен. Тогда запрос, который подсчитывает, какие URL‑пути сайта получают больше всего POST‑запросов:

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

Получено 5 строк. Затрачено: 0,735 сек. Обработано 10,36 млн строк, 4,65 ГБ (14,10 млн строк/сек., 6,32 ГБ/сек.)
Пиковое использование памяти: 153,71 МиБ.
```

Обратите внимание на использование здесь синтаксиса отображения (map), например `LogAttributes['request_path']`, а также функции [`path`](/sql-reference/functions/url-functions#path) для удаления параметров запроса из URL.

Если пользователь не включил разбор JSON в коллекторе, то `LogAttributes` будет пустым, что вынудит нас использовать [JSON-функции](/sql-reference/functions/json-functions) для извлечения столбцов из строки типа String `Body`.

:::note Предпочитайте разбор в ClickHouse
В целом мы рекомендуем выполнять разбор JSON в ClickHouse для структурированных логов. Мы уверены, что ClickHouse обеспечивает самое быстрое выполнение разбора JSON. Однако мы понимаем, что пользователи могут хотеть отправлять логи в другие системы и не реализовывать эту логику в SQL.
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

Теперь рассмотрим то же для неструктурированных логов:

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

Для аналогичного запроса к неструктурированным логам необходимо использовать регулярные выражения через функцию `extractAllGroupsVertical`.

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

Получено 5 строк. Время выполнения: 1.953 сек. Обработано 10.37 млн строк, 3.59 ГБ (5.31 млн строк/с., 1.84 ГБ/с.)
```

Повышенная сложность и ресурсоёмкость запросов для парсинга неструктурированных логов (обратите внимание на разницу в производительности) — причина, по которой мы рекомендуем пользователям по возможности всегда использовать структурированные логи.

:::note Рассмотрите словари
Приведённый выше запрос можно оптимизировать, используя словари регулярных выражений. См. подробности в разделе [Использование словарей](#using-dictionaries).
:::

Оба этих сценария могут быть реализованы в ClickHouse за счёт переноса описанной выше логики запроса на этап вставки данных. Ниже мы рассмотрим несколько подходов и укажем, когда каждый из них уместен.

:::note OTel или ClickHouse для обработки?
Пользователи также могут выполнять обработку с использованием процессоров и операторов OTel collector, как описано [здесь](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching). В большинстве случаев пользователи увидят, что ClickHouse значительно эффективнее по использованию ресурсов и быстрее, чем процессоры OTel collector. Основной недостаток выполнения всей обработки событий с помощью SQL — это привязка вашего решения к ClickHouse. Например, пользователи могут захотеть отправлять обработанные логи из OTel collector в другие системы, например в S3.
:::


### Материализованные столбцы

Материализованные столбцы являются самым простым способом извлечь структуру из других столбцов. Значения таких столбцов всегда вычисляются во время вставки и не могут быть указаны в запросах INSERT.

:::note Overhead
Материализованные столбцы создают дополнительный расход дискового пространства, так как значения при вставке извлекаются в новые столбцы на диске.
:::

Материализованные столбцы поддерживают любое выражение ClickHouse и могут использовать любые аналитические функции для [обработки строк](/sql-reference/functions/string-functions) (включая [регулярные выражения и поиск](/sql-reference/functions/string-search-functions)) и [URL](/sql-reference/functions/url-functions), выполнения [преобразований типов](/sql-reference/functions/type-conversion-functions), [извлечения значений из JSON](/sql-reference/functions/json-functions) или [математических операций](/sql-reference/functions/math-functions).

Мы рекомендуем материализованные столбцы для базовой обработки. Они особенно полезны для извлечения значений из карт (Map), поднятия их в корневые столбцы и выполнения преобразований типов. Особенно эффективны они в очень простых схемах или при совместном использовании с материализованными представлениями. Рассмотрим следующую схему для логов, из которых сборщик извлёк JSON в столбец `LogAttributes`:

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

Эквивалентную схему для извлечения с использованием JSON-функций из строки `Body` можно найти [здесь](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==).

Наши три материализованных столбца извлекают запрашиваемую страницу, тип запроса и домен реферера. Они обращаются к ключам Map и применяют функции к их значениям. Наш последующий запрос выполняется значительно быстрее:

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

Получено 5 строк. Затрачено: 0,173 сек. Обработано 10,37 млн строк, 418,03 МБ (60,07 млн строк/с., 2,42 ГБ/с.)
Пиковое использование памяти: 3,16 МиБ.
```

:::note
Материализованные столбцы по умолчанию не возвращаются в результате `SELECT *`. Это необходимо для сохранения свойства, что результат `SELECT *` всегда можно вставить обратно в таблицу с помощью команды INSERT. Такое поведение можно отключить, установив `asterisk_include_materialized_columns=1`, а также включить в Grafana (см. `Additional Settings -> Custom Settings` в конфигурации источника данных).
:::


## Материализованные представления

[Материализованные представления](/materialized-views) предоставляют более мощный способ применения SQL-фильтрации и преобразований к логам и трейсам.

Материализованные представления позволяют перенести затраты на вычисления с момента выполнения запроса на момент вставки данных. Материализованное представление в ClickHouse — это просто триггер, который выполняет запрос над блоками данных по мере их вставки в таблицу. Результаты этого запроса вставляются во вторую «целевую» таблицу.

<Image img={observability_10} alt="Материализованное представление" size="md" />

:::note Обновления в реальном времени
Материализованные представления в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на которой они основаны, функционируя скорее как постоянно обновляющиеся индексы. Напротив, в других базах данных материализованные представления, как правило, представляют собой статичные снимки результата запроса, которые необходимо обновлять (аналогично ClickHouse Refreshable Materialized Views).
:::

Запрос, связанный с материализованным представлением, теоретически может быть любым запросом, включая агрегацию, хотя [существуют ограничения при использовании Joins](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для задач по преобразованию и фильтрации, необходимых для логов и трейсов, можно считать допустимым любой `SELECT`‑запрос.

Пользователям следует помнить, что запрос — это всего лишь триггер, выполняющийся над строками, вставляемыми в таблицу (исходную таблицу), а результаты отправляются в новую таблицу (целевую таблицу).

Чтобы гарантировать, что мы не будем сохранять данные дважды (в исходной и целевой таблицах), мы можем изменить движок исходной таблицы на [Null table engine](/engines/table-engines/special/null), сохранив исходную схему. Наши OTel collector будут продолжать отправлять данные в эту таблицу. Например, для логов таблица `otel_logs` становится:

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

Движок таблицы Null — это мощная оптимизация, по сути аналог устройства `/dev/null`. Эта таблица не будет хранить данные, но любые привязанные к ней материализованные представления всё равно будут выполняться над вставляемыми строками до того, как они будут отброшены.

Рассмотрим следующий запрос. Он преобразует строки в нужный нам формат, извлекая все столбцы из `LogAttributes` (предполагаем, что они заполняются коллектором с использованием оператора `json_parser`), а также устанавливая `SeverityText` и `SeverityNumber` (на основе некоторых простых условий и определения [этих столбцов](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В данном случае мы также выбираем только те столбцы, про которые знаем, что они будут заполнены, игнорируя такие столбцы, как `TraceId`, `SpanId` и `TraceFlags`.


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

Мы также извлекаем столбец `Body` в приведённом выше примере — на случай, если позже будут добавлены дополнительные атрибуты, которые не извлекаются нашим SQL. Этот столбец должен хорошо сжиматься в ClickHouse и будет редко запрашиваться, поэтому не повлияет на производительность запросов. Наконец, мы приводим Timestamp к типу DateTime (чтобы сэкономить место — см. [«Optimizing Types»](#optimizing-types)) с помощью `cast`.

:::note Условные выражения
Обратите внимание на использование [conditionals](/sql-reference/functions/conditional-functions) выше для извлечения `SeverityText` и `SeverityNumber`. Они чрезвычайно полезны для формулирования сложных условий и проверки, заданы ли значения в map-структурах — мы наивно предполагаем, что все ключи существуют в `LogAttributes`. Мы рекомендуем пользователям освоить их — это ваш лучший помощник при разборе логов, в дополнение к функциям для обработки [null values](/sql-reference/functions/functions-for-nulls)!
:::

Нам требуется таблица для приёма этих результатов. Приведённая ниже целевая таблица соответствует запросу выше:

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

Выбранные здесь типы основаны на оптимизациях, описанных в разделе [&quot;Optimizing types&quot;](#optimizing-types).

:::note
Обратите внимание, насколько сильно мы изменили нашу схему. На практике у пользователей, вероятно, также будут столбцы трассировок (Trace), которые они захотят сохранить, а также столбец `ResourceAttributes` (обычно он содержит метаданные Kubernetes). Grafana может использовать столбцы трассировок для связывания логов и трассировок — см. [&quot;Using Grafana&quot;](/observability/grafana).
:::


Ниже мы создаём материализованное представление `otel_logs_mv`, которое выполняет указанную выше выборку для таблицы `otel_logs` и отправляет результаты в `otel_logs_v2`.

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

Все вышеописанное показано ниже:

<Image img={observability_11} alt="Материализованное представление OTel" size="md" />

Если теперь перезапустить конфигурацию коллектора, используемую в разделе [&quot;Экспорт в ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse), данные появятся в `otel_logs_v2` в требуемом формате. Обратите внимание на использование типизированных функций извлечения JSON.

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Строка 1:
─────────
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

Получена 1 строка. Прошло: 0.010 сек.
```

Эквивалентное материализованное представление, которое опирается на извлечение столбцов из колонки `Body` с помощью JSON-функций, показано ниже:


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

Вышеописанные материализованные представления опираются на неявное приведение типов — особенно при использовании map `LogAttributes`. ClickHouse часто прозрачно приводит извлечённое значение к типу целевой таблицы, сокращая необходимый синтаксис. Однако мы рекомендуем всегда тестировать представления, выполняя их оператор `SELECT` совместно с оператором [`INSERT INTO`](/sql-reference/statements/insert-into) в целевую таблицу с той же схемой. Это позволит убедиться, что типы обрабатываются корректно. Особое внимание следует уделить следующим случаям:

- Если ключ не существует в map, будет возвращена пустая строка. В случае числовых типов такие значения необходимо заменить на корректные. Это можно сделать с помощью [условных выражений](/sql-reference/functions/conditional-functions), например `if(LogAttributes['status'] = "", 200, LogAttributes['status'])`, или [функций приведения типов](/sql-reference/functions/type-conversion-functions), если допустимы значения по умолчанию, например `toUInt8OrDefault(LogAttributes['status'])`.
- Некоторые типы не всегда будут приводиться, например строковые представления чисел не будут приводиться к значениям enum.
- Функции извлечения из JSON возвращают значения по умолчанию для своего типа, если значение не найдено. Убедитесь, что эти значения имеют смысл!

:::note Избегайте Nullable
Избегайте использования [Nullable](/sql-reference/data-types/nullable) в ClickHouse для данных наблюдаемости (Observability). В логах и трассировках редко требуется различать пустое значение и null. Эта возможность увеличивает накладные расходы на хранение и негативно сказывается на производительности запросов. Дополнительные подробности см. [здесь](/data-modeling/schema-design#optimizing-types).
:::

## Выбор первичного (упорядочивающего) ключа {#choosing-a-primary-ordering-key}

После того как вы выделили нужные столбцы, можно переходить к оптимизации вашего упорядочивающего/первичного ключа.

Можно применить несколько простых правил, которые помогут выбрать упорядочивающий ключ. Следующие рекомендации иногда могут конфликтовать друг с другом, поэтому учитывайте их по порядку. В результате пользователи могут определить несколько ключей; обычно достаточно 4–5:

1. Выбирайте столбцы, которые соответствуют вашим типичным фильтрам и паттернам доступа. Если пользователи обычно начинают расследования в Observability с фильтрации по определённому столбцу, например имени пода, этот столбец будет часто использоваться в предложениях `WHERE`. Отдавайте приоритет включению таких столбцов в ключ по сравнению с теми, которые используются реже.
2. Предпочитайте столбцы, которые при фильтрации помогают исключить большой процент всех строк, тем самым уменьшая объём данных, который нужно прочитать. Часто хорошими кандидатами являются имена сервисов и коды статусов — во втором случае только если пользователи фильтруют по значениям, исключающим большую часть строк; например, фильтрация по 200-м в большинстве систем будет соответствовать большинству строк, в отличие от ошибок 500, которые будут соответствовать небольшой подвыборке.
3. Предпочитайте столбцы, которые, вероятно, будут сильно коррелировать с другими столбцами в таблице. Это поможет обеспечить, что соответствующие значения также будут храниться непрерывно, улучшая сжатие.
4. Операции `GROUP BY` и `ORDER BY` для столбцов в упорядочивающем ключе могут быть сделаны более экономными по памяти.

<br />

Определив подмножество столбцов для упорядочивающего ключа, необходимо задать их в определённом порядке. Этот порядок может существенно влиять как на эффективность фильтрации по столбцам вторичного ключа в запросах, так и на коэффициент сжатия файлов данных таблицы. В общем случае **лучше упорядочивать ключи в порядке возрастания их кардинальности**. Это следует сбалансировать с тем фактом, что фильтрация по столбцам, которые появляются позже в упорядочивающем ключе, будет менее эффективной, чем фильтрация по тем, которые стоят раньше в кортеже. Сбалансируйте эти свойства и учитывайте ваши паттерны доступа. И самое важное — тестируйте варианты. Для более глубокого понимания упорядочивающих ключей и их оптимизации рекомендуем [эту статью](/guides/best-practices/sparse-primary-indexes).

:::note Сначала структура
Мы рекомендуем определять упорядочивающие ключи после того, как вы структурировали свои логи. Не используйте ключи в картах атрибутов для упорядочивающего ключа или JSON-выражения для извлечения данных. Убедитесь, что ваши упорядочивающие ключи представлены как корневые столбцы в вашей таблице.
:::

## Использование map

В более ранних примерах показано использование синтаксиса `map['key']` для доступа к значениям в столбцах типа `Map(String, String)`. Помимо использования нотации map для доступа к вложенным ключам, в ClickHouse доступны специализированные [функции работы с map](/sql-reference/functions/tuple-map-functions#mapkeys) для фильтрации или выборки данных из этих столбцов.

Например, следующий запрос выявляет все уникальные ключи, доступные в столбце `LogAttributes`, используя [функцию `mapKeys`](/sql-reference/functions/tuple-map-functions#mapkeys), а затем [функцию `groupArrayDistinctArray`](/sql-reference/aggregate-functions/combinators) (комбинатор).

```sql
SELECT groupArrayDistinctArray(mapKeys(LogAttributes))
FROM otel_logs
FORMAT Vertical

Строка 1:
──────
groupArrayDistinctArray(mapKeys(LogAttributes)): ['remote_user','run_time','request_type','log.file.name','referer','request_path','status','user_agent','remote_addr','time_local','size','request_protocol']

Получена 1 строка. Затрачено: 1.139 сек. Обработано 5.63 млн строк, 2.53 ГБ (4.94 млн строк/сек., 2.22 ГБ/сек.)
Пиковое использование памяти: 71.90 МиБ.
```

:::note Избегайте точек
Мы не рекомендуем использовать точки в именах столбцов Map и в дальнейшем можем признать такое использование устаревшим. Используйте `_`.
:::


## Использование алиасов

Запросы к типам `Map` выполняются медленнее, чем к обычным столбцам — см. раздел [&quot;Ускорение запросов&quot;](#accelerating-queries). Кроме того, синтаксис таких запросов более сложен и может быть неудобен для пользователей. Чтобы решить последнюю проблему, мы рекомендуем использовать столбцы типа `ALIAS`.

Столбцы типа `ALIAS` вычисляются во время выполнения запроса и не хранятся в таблице. Поэтому невозможно выполнить `INSERT` в столбец этого типа. Используя алиасы, мы можем обращаться к ключам `Map` и упростить синтаксис, прозрачно выводя элементы `Map` как обычные столбцы. Рассмотрим следующий пример:

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

У нас есть несколько материализованных столбцов и столбец `ALIAS` — `RemoteAddr`, который обращается к карте `LogAttributes`. Теперь мы можем запрашивать значения `LogAttributes['remote_addr']` через этот столбец, тем самым упрощая запрос, например:

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

Получено 5 строк. Прошло: 0.011 сек.
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

Получено 5 строк. Прошло: 0.014 сек.
```

:::note Псевдонимы по умолчанию исключены
По умолчанию `SELECT *` исключает столбцы типа ALIAS. Это поведение можно изменить, установив `asterisk_include_alias_columns=1`.
:::


## Оптимизация типов {#optimizing-types}

[Общие рекомендации ClickHouse](/data-modeling/schema-design#optimizing-types) по оптимизации типов также относятся к данному сценарию использования ClickHouse.

## Использование кодеков {#using-codecs}

Помимо оптимизаций типов, пользователи могут следовать [общим рекомендациям по использованию кодеков](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) при оптимизации сжатия для схем ClickHouse Observability.

Как правило, кодек `ZSTD` очень хорошо подходит для наборов данных журналов и трассировок. Увеличение уровня сжатия по сравнению со значением по умолчанию 1 может улучшить степень сжатия. Однако это следует проверять, так как более высокие значения увеличивают нагрузку на CPU в момент вставки. На практике мы редко видим существенную выгоду от увеличения этого значения.

Кроме того, отметки времени, хотя и выигрывают от дельта-кодирования с точки зрения сжатия, по наблюдениям приводят к медленной работе запросов, если этот столбец используется в первичном ключе или ключе сортировки. Мы рекомендуем пользователям оценить баланс между степенью сжатия и производительностью запросов.

## Использование словарей {#using-dictionaries}

[Словари](/sql-reference/dictionaries) — это [ключевая возможность](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) ClickHouse, обеспечивающая хранящееся в памяти представление данных в формате [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources), оптимизированное для запросов с крайне низкими задержками при поиске по ключу.

<Image img={observability_12} alt="Observability and dictionaries" size="md"/>

Это полезно в различных сценариях — от обогащения данных при их приёме «на лету» без замедления процесса ингестии до общего улучшения производительности запросов, особенно с использованием JOIN, где достигается наибольший выигрыш.
Хотя JOIN-операции редко требуются в сценариях Observability, словари по-прежнему могут быть полезны для обогащения — как на этапе вставки, так и на этапе выполнения запросов. Ниже приведены примеры обоих подходов.

:::note Ускорение JOIN-операций
Пользователи, заинтересованные в ускорении JOIN-операций с помощью словарей, могут найти дополнительную информацию [здесь](/dictionary).
:::

### Время вставки и время запроса {#insert-time-vs-query-time}

Справочники можно использовать для обогащения данных во время запроса или во время вставки. У каждого из этих подходов есть свои преимущества и недостатки. Вкратце:

- **Время вставки** — Обычно подходит, если значение для обогащения не меняется и хранится во внешнем источнике, который можно использовать для заполнения справочника. В этом случае обогащение строки во время вставки избавляет от необходимости выполнять поиск в справочнике во время запроса. Это происходит ценой снижения производительности вставки, а также дополнительного расхода места в хранилище, поскольку обогащённые значения будут храниться в виде столбцов.
- **Время запроса** — Если значения в справочнике часто меняются, поиск во время запроса обычно более предпочтителен. Это избавляет от необходимости обновлять столбцы (и перезаписывать данные), когда изменяются отображаемые значения. Такая гибкость достигается за счёт дополнительных затрат на поиск во время выполнения запроса. Эти затраты обычно становятся заметными, если поиск требуется для большого числа строк, например при использовании обращения к справочнику в условии фильтрации. Для обогащения результатов, то есть в `SELECT`, эта нагрузка, как правило, несущественна.

Мы рекомендуем пользователям ознакомиться с основами работы со справочниками. Справочники предоставляют размещаемую в памяти таблицу соответствий, из которой значения могут извлекаться с помощью специализированных [функций](/sql-reference/functions/ext-dict-functions#dictgetall).

Примеры простого обогащения см. в руководстве по справочникам [здесь](/dictionary). Ниже мы сосредоточимся на типичных задачах обогащения для систем наблюдаемости.

### Использование IP-словарей

Геообогащение логов и трейсов значениями широты и долготы по IP-адресам — распространённое требование в задачах Observability. Это можно реализовать с помощью структурированного словаря `ip_trie`.

Мы используем общедоступный [датасет DB-IP с точностью до города](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставляемый [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [файла readme](https://github.com/sapics/ip-location-db#csv-format) видно, что данные имеют следующую структуру:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

Учитывая такую структуру, давайте сначала посмотрим на данные с помощью табличной функции [url()](/sql-reference/table-functions/url):

```sql
SELECT *
FROM url('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV', '\n           \tip_range_start IPv4, \n       \tip_range_end IPv4, \n         \tcountry_code Nullable(String), \n     \tstate1 Nullable(String), \n           \tstate2 Nullable(String), \n           \tcity Nullable(String), \n     \tpostcode Nullable(String), \n         \tlatitude Float64, \n          \tlongitude Float64, \n         \ttimezone Nullable(String)\n   \t')
LIMIT 1
FORMAT Vertical
Строка 1:
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

Чтобы упростить себе жизнь, давайте используем табличный движок [`URL()`](/engines/table-engines/special/url), чтобы создать объект таблицы ClickHouse с нашими именами полей и подтвердить общее количество строк:

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
│ 3261621 │ -- 3.26 млн
└─────────┘
```

Поскольку наш словарь `ip_trie` требует, чтобы диапазоны IP-адресов задавались в формате CIDR, нам нужно будет преобразовать `ip_range_start` и `ip_range_end`.

CIDR-блок для каждого диапазона можно получить с помощью следующего запроса:

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

Получено 4 строки. Прошло: 0.259 сек.
```


:::note
В приведённом выше запросе происходит много всего. Тем, кому интересно, рекомендуется прочитать это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). Иначе просто считайте, что выше вычисляется CIDR для диапазона IP-адресов.
:::

Для наших целей нам понадобятся только диапазон IP-адресов, код страны и координаты, поэтому давайте создадим новую таблицу и добавим в неё наши данные GeoIP:

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

Чтобы выполнять низкозадержочный поиск по IP‑адресам в ClickHouse, мы будем использовать словари для хранения отображения ключ → атрибуты для наших GeoIP‑данных в памяти. ClickHouse предоставляет структуру словаря `ip_trie` ([dictionary structure](/sql-reference/dictionaries#ip_trie)) для сопоставления наших сетевых префиксов (CIDR-блоков) с координатами и кодами стран. Следующий запрос задаёт словарь с такой структурой и использует приведённую выше таблицу в качестве источника.

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

Мы можем выбрать строки из словаря и убедиться, что этот набор данных доступен для обращений по ключу:

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

Получено 3 строки. Затрачено: 4.662 сек.
```

:::note Периодическое обновление
Справочники в ClickHouse периодически обновляются на основе данных базовой таблицы и использованного выше предложения lifetime. Чтобы обновить наш Geo IP-справочник в соответствии с последними изменениями в наборе данных DB-IP, нам достаточно повторно загрузить данные из удалённой таблицы `geoip_url` в таблицу `geoip` с применёнными преобразованиями.
:::

Теперь, когда данные Geo IP загружены в наш справочник `ip_trie` (который для удобства также называется `ip_trie`), мы можем использовать его для геолокации по IP-адресу. Это можно сделать с помощью [функции `dictGet()`](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Обратите внимание на скорость выборки данных. Это позволяет нам обогащать логи. В данном случае мы выбираем вариант **обогащения во время выполнения запроса**.

Возвращаясь к нашему исходному набору логов, мы можем использовать описанное выше, чтобы агрегировать логи по странам. Далее предполагается, что мы используем схему, полученную из нашего ранее созданного материализованного представления, в которой есть извлечённый столбец `RemoteAddress`.


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

Поскольку соответствие IP-адреса географическому местоположению может меняться, пользователям, скорее всего, важно знать, откуда был отправлен запрос в момент его совершения, а не то, каково текущее географическое местоположение для того же адреса. По этой причине здесь, скорее всего, предпочтительно обогащение на этапе индексирования. Это можно сделать с помощью материализованных столбцов, как показано ниже, или в предложении SELECT материализованного представления:

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
Пользователям, скорее всего, понадобится, чтобы словарь обогащения IP-адресов периодически обновлялся на основе новых данных. Это можно реализовать с помощью параметра словаря `LIFETIME`, который приведёт к периодической перезагрузке словаря из базовой таблицы. Инструкции по обновлению базовой таблицы приведены в разделе [&quot;Обновляемые материализованные представления&quot;](/materialized-view/refreshable-materialized-view).
:::

Указанные выше страны и координаты предоставляют возможности визуализации, выходящие за рамки простой группировки и фильтрации по стране. В качестве примера см. раздел [&quot;Визуализация геоданных&quot;](/observability/grafana#visualizing-geo-data).


### Использование regex-словарей (разбор user agent)

Разбор [строк user agent](https://en.wikipedia.org/wiki/User_agent) — это классическая задача для регулярных выражений и распространённое требование для наборов данных, основанных на логах и трассировках. ClickHouse предоставляет эффективный разбор строк user agent с использованием Regular Expression Tree Dictionaries.

Деревья регулярных выражений для словарей определяются в open-source-версии ClickHouse с использованием типа источника словаря `YAMLRegExpTree`, который указывает путь к YAML-файлу, содержащему дерево регулярных выражений. Если вы хотите использовать собственный словарь регулярных выражений, подробности о требуемой структуре можно найти [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source). Ниже мы сосредоточимся на разборе строк user agent с использованием [uap-core](https://github.com/ua-parser/uap-core) и загрузим словарь в поддерживаемый CSV-формат. Этот подход совместим как с open-source-версией ClickHouse (OSS), так и с ClickHouse Cloud.

:::note
В примерах ниже мы используем актуальные на июнь 2024 года срезы регулярных выражений uap-core для разбора строк user agent. Последнюю версию файла, который время от времени обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Пользователи могут выполнить шаги, описанные [здесь](/sql-reference/dictionaries#collecting-attribute-values), чтобы загрузить данные в CSV-файл, используемый ниже.
:::

Создайте следующие таблицы типа Memory. Они будут содержать наши регулярные выражения для разбора устройств, браузеров и операционных систем.

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

Эти таблицы можно заполнить из следующих публично размещённых CSV-файлов с помощью табличной функции url:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

После заполнения таблиц в памяти мы можем загрузить словари регулярных выражений. Обратите внимание, что необходимо указать значения ключей как столбцы — это будут атрибуты, которые мы сможем извлечь из строки User-Agent.

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

После загрузки словарей мы можем задать пример значения заголовка User-Agent и протестировать новые возможности извлечения данных с их помощью:


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

Учитывая, что правила, связанные с user agent, будут редко меняться и словарь потребуется обновлять только при появлении новых браузеров, операционных систем и устройств, имеет смысл выполнять это извлечение на этапе вставки данных.

Мы можем выполнить эту работу либо с помощью материализованного столбца, либо с помощью материализованного представления. Ниже мы модифицируем использовавшееся ранее материализованное представление:

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

Для этого нам нужно изменить схему целевой таблицы `otel_logs_v2`:

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

После перезапуска коллектора и приёма структурированных логов на основе ранее описанных шагов мы можем выполнять запросы к только что извлечённым столбцам Device, Browser и Os.


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
Обратите внимание на использование кортежей для этих столбцов user agent. Кортежи рекомендуются для сложных структур, иерархия которых известна заранее. Подстолбцы обеспечивают ту же производительность, что и обычные столбцы (в отличие от ключей `Map`), при этом поддерживают неоднородные типы данных.
:::


### Дополнительные материалы {#further-reading}

Дополнительные примеры и подробности о словарях вы найдете в следующих статьях:

- [Расширенные темы, связанные со словарями](/dictionary#advanced-dictionary-topics)
- [«Использование словарей для ускорения запросов»](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Словари](/sql-reference/dictionaries)

## Ускорение запросов {#accelerating-queries}

ClickHouse поддерживает ряд методов для ускорения выполнения запросов. К следующим подходам следует прибегать только после выбора подходящего первичного/сортировочного ключа, оптимизированного под наиболее распространённые шаблоны доступа и обеспечивающего максимальное сжатие. Обычно именно это даёт наибольший прирост производительности при наименьших затратах усилий.

### Использование материализованных представлений (инкрементальных) для агрегаций

В предыдущих разделах мы рассмотрели использование материализованных представлений для преобразования и фильтрации данных. Однако материализованные представления также можно использовать для предварительного вычисления агрегаций во время вставки данных и сохранения результата. Этот результат может обновляться при последующих вставках, что фактически позволяет выполнять предварительное вычисление агрегации на этапе вставки.

Основная идея заключается в том, что результаты зачастую представляют собой более компактное представление исходных данных (приближённый эскиз в случае агрегаций). В сочетании с более простым запросом для чтения результатов из целевой таблицы время выполнения запросов будет меньше, чем если бы те же вычисления выполнялись над исходными данными.

Рассмотрим следующий запрос, в котором мы вычисляем общий объём трафика по часам, используя наши структурированные логи:

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

Мы можем представить, что это типичный линейный график, который пользователи строят в Grafana. Этот запрос, надо признать, очень быстрый — набор данных всего 10 млн строк, и ClickHouse быстр! Однако, если мы масштабируем объём данных до миллиардов и триллионов строк, нам желательно сохранить такую производительность запросов.

:::note
Этот запрос был бы в 10 раз быстрее, если бы мы использовали таблицу `otel_logs_v2`, которая является результатом нашего ранее созданного материализованного представления, извлекающего ключ size из карты `LogAttributes`. Здесь мы используем «сырые» данные только в иллюстративных целях и рекомендуем использовать это представление, если такой запрос является типовым.
:::

Нам нужна таблица для приёма результатов, если мы хотим выполнять такие вычисления во время вставки с использованием материализованного представления. Эта таблица должна хранить только по одной строке в час. Если для уже существующего часа получено обновление, остальные столбцы должны быть объединены со строкой этого часа. Чтобы произошло такое слияние инкрементальных состояний, частичные состояния для остальных столбцов должны быть сохранены.

Для этого требуется специальный тип движка в ClickHouse: SummingMergeTree. Он заменяет все строки с одинаковым ключом сортировки одной строкой, содержащей суммарные значения для числовых столбцов. Следующая таблица будет объединять любые строки с одинаковой датой, суммируя все числовые столбцы.

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Чтобы продемонстрировать наше материализованное представление, предположим, что таблица `bytes_per_hour` пуста и пока не содержит никаких данных. Наше материализованное представление применяет приведенный выше запрос `SELECT` к данным, вставляемым в `otel_logs` (это выполняется по блокам заданного размера), а результаты записываются в `bytes_per_hour`. Синтаксис показан ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Оператор `TO` здесь является ключевым — он указывает, куда будут отправляться результаты, то есть в `bytes_per_hour`.

Если мы перезапустим наш OTel collector и повторно отправим логи, таблица `bytes_per_hour` будет постепенно заполняться результатами приведённого выше запроса. По завершении мы можем проверить размер нашей `bytes_per_hour` — у нас должна быть по одной строке на каждый час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```


Мы фактически сократили количество строк здесь с 10 млн (в `otel_logs`) до 113, сохранив результат нашего запроса. Важно, что если в таблицу `otel_logs` вставляются новые логи, новые значения будут отправлены в `bytes_per_hour` для соответствующего часа, где они будут автоматически асинхронно объединяться в фоновом режиме — за счёт хранения только одной строки в час `bytes_per_hour` таким образом всегда будет и небольшой, и актуальной.

Поскольку объединение строк выполняется асинхронно, при выполнении запроса пользователем может существовать более одной строки на час. Чтобы гарантировать, что все необъединённые строки будут объединены во время выполнения запроса, у нас есть два варианта:

* Использовать [модификатор `FINAL`](/sql-reference/statements/select/from#final-modifier) в запросе к таблице (что мы сделали для запроса подсчёта выше).
* Агрегировать по ключу сортировки, используемому в нашей итоговой таблице, т.е. по `Timestamp`, и суммировать метрики.

Как правило, второй вариант более эффективен и гибок (таблицу можно использовать и для других целей), но первый может быть проще для некоторых запросов. Ниже показаны оба варианта:

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

Получено 5 строк. Прошло: 0.008 sec.

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

Получено 5 строк. Прошло: 0.005 sec.
```

Это ускорило выполнение нашего запроса с 0,6 с до 0,008 с — более чем в 75 раз!

:::note
Выигрыш может быть ещё больше на больших наборах данных с более сложными запросами. Примеры см. [здесь](https://github.com/ClickHouse/clickpy).
:::


#### Более сложный пример

Приведённый выше пример агрегирует простое количество в час, используя [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Статистика, выходящая за рамки простых сумм, требует другого движка целевой таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

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

113 строк в наборе. Затрачено: 0.667 сек. Обработано 10.37 млн строк, 4.73 ГБ (15.53 млн строк/с., 7.09 ГБ/с.)
```

Для сохранения счетчика кардинальности при инкрементальном обновлении требуется использование движка AggregatingMergeTree.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

Чтобы ClickHouse знал, что будут храниться состояния агрегатных функций, мы определяем столбец `UniqueUsers` как тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая агрегатную функцию, чьи частичные состояния сохраняются (uniq), и тип исходного столбца (IPv4). Как и в SummingMergeTree, строки с одинаковым значением ключа `ORDER BY` будут объединяться (Hour в примере выше).

Соответствующее материализованное представление использует ранее приведённый запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, что мы добавляем суффикс `State` к нашим агрегатным функциям. Это гарантирует, что будет возвращено состояние агрегатной функции, а не окончательный результат. Оно будет содержать дополнительную информацию, позволяющую объединять это частичное состояние с другими состояниями.

После того как данные были перезагружены путем перезапуска коллектора, мы можем убедиться, что в таблице `unique_visitors_per_hour` доступны 113 строк.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 строка. Затрачено: 0,009 сек.
```

В итоговом запросе нужно использовать суффикс Merge для функций (поскольку столбцы хранят состояния частичной агрегации):

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


### Использование материализованных представлений (инкрементальных) для быстрых выборок

Пользователям следует учитывать свои шаблоны доступа при выборе ключа сортировки ClickHouse — включать в него столбцы, которые часто используются в условиях фильтрации и агрегации. Это может быть ограничивающим фактором в сценариях наблюдаемости, где у пользователей более разнообразные шаблоны доступа, которые невозможно выразить одним набором столбцов. Лучше всего это иллюстрируется на примере, встроенном в стандартные схемы OTel. Рассмотрим схему по умолчанию для трассировок:

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

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. В трассировке пользователям также требуется возможность выполнять поиск по конкретному `TraceId` и получать спаны, относящиеся к соответствующему трейсу. Хотя это поле присутствует в ключе сортировки, его положение в конце означает, что [фильтрация будет не такой эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) и, вероятно, приведёт к необходимости сканировать значительные объёмы данных при получении одного трейса.

OTel collector также устанавливает материализованное представление и связанную таблицу для решения этой задачи. Таблица и представление показаны ниже:

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


Представление по сути гарантирует, что таблица `otel_traces_trace_id_ts` содержит минимальную и максимальную метку времени для каждого трейса. Эта таблица, упорядоченная по `TraceId`, позволяет эффективно извлекать эти метки времени. В свою очередь, эти диапазоны меток времени могут использоваться при выполнении запросов к основной таблице `otel_traces`. Конкретнее, при получении трейса по его идентификатору Grafana использует следующий запрос:

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

Здесь CTE определяет минимальное и максимальное значения временной метки для идентификатора трейса `ae9226c78d1d360601e6383928e4d22d`, после чего эти значения используются для фильтрации основной таблицы `otel_traces` по соответствующим спанам.

Тот же подход можно применить для похожих паттернов доступа. Аналогичный пример по моделированию данных разбирается [здесь](/materialized-view/incremental-materialized-view#lookup-table).


### Использование проекций

Проекции ClickHouse позволяют указать несколько предложений `ORDER BY` для таблицы.

В предыдущих разделах мы рассмотрели, как материализованные представления могут использоваться в ClickHouse для предварительного вычисления агрегаций, преобразования строк и оптимизации запросов наблюдаемости для различных паттернов доступа.

Мы предоставили пример, в котором материализованное представление отправляет строки в целевую таблицу с ключом сортировки, отличающимся от ключа исходной таблицы, принимающей вставки, чтобы оптимизировать поиск по идентификатору трассировки.

Проекции можно использовать для решения той же задачи, что позволяет оптимизировать запросы по столбцам, не входящим в первичный ключ.

Теоретически эту возможность можно использовать для создания нескольких ключей сортировки для таблицы, однако у неё есть существенный недостаток: дублирование данных. Данные потребуется записывать как в порядке основного первичного ключа, так и в порядке, заданном для каждой проекции. Это замедлит операции вставки и увеличит потребление дискового пространства.

:::note Проекции и материализованные представления
Проекции предоставляют многие из тех же возможностей, что и материализованные представления, однако их следует применять с осторожностью — в большинстве случаев предпочтительнее использовать материализованные представления. Необходимо понимать ограничения проекций и сценарии их корректного применения. Например, хотя проекции можно использовать для предварительного вычисления агрегаций, мы рекомендуем применять для этого материализованные представления.
:::

<Image img={observability_13} alt="Наблюдаемость и проекции" size="md" />

Рассмотрим следующий запрос, который фильтрует таблицу `otel_logs_v2` по кодам ошибок 500. Это типичный сценарий доступа при работе с логами, когда пользователи хотят отфильтровать записи по кодам ошибок:

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 строк в наборе. Затрачено: 0.177 сек. Обработано 10.37 млн строк, 685.32 МБ (58.66 млн строк/сек., 3.88 ГБ/сек.)
Пиковое использование памяти: 56.54 МиБ.
```

:::note Используйте Null для измерения производительности
Здесь мы не выводим результаты, используя `FORMAT Null`. Это принудительно читает все результаты без их возврата, предотвращая досрочное завершение запроса из-за LIMIT. Это необходимо только для того, чтобы показать время, затраченное на сканирование всех 10 млн строк.
:::

Приведенный выше запрос требует линейного сканирования при использовании выбранного нами ключа сортировки `(ServiceName, Timestamp)`. Хотя мы могли бы добавить `Status` в конец ключа сортировки для улучшения производительности этого запроса, альтернативным решением является добавление проекции.

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

Обратите внимание, что сначала необходимо создать проекцию, а затем материализовать её. Эта команда приводит к двойному сохранению данных на диске в двух различных порядках сортировки. Проекцию также можно определить при создании таблицы, как показано ниже, и она будет автоматически поддерживаться при вставке данных.

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

Важно: если проекция создается через `ALTER`, то при выполнении команды `MATERIALIZE PROJECTION` её создание происходит асинхронно. Пользователи могут отслеживать ход выполнения этой операции следующим запросом, ожидая `is_done=1`.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Если повторить указанный выше запрос, можно увидеть, что производительность значительно улучшилась за счёт дополнительного использования хранилища (см. [&quot;Измерение размера таблицы и сжатия&quot;](#measuring-table-size--compression)).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 строк в наборе. Затрачено: 0.031 сек. Обработано 51.42 тысяч строк, 22.85 МБ (1.65 миллионов строк/с., 734.63 МБ/с.)
Пиковое использование памяти: 27.85 МиБ.
```

В приведённом выше примере мы указываем в проекции столбцы, использованные в предыдущем запросе. Это означает, что только эти столбцы будут храниться на диске как часть проекции и будут упорядочены по Status. Если бы мы вместо этого использовали здесь `SELECT *`, сохранялись бы все столбцы. Хотя это позволило бы большему числу запросов (использующих любые подмножества столбцов) воспользоваться проекцией, потребовалось бы дополнительное дисковое пространство. Для измерения занимаемого дискового пространства и степени сжатия см. [&quot;Measuring table size &amp; compression&quot;](#measuring-table-size--compression).


### Вторичные индексы / индексы пропуска данных {#secondarydata-skipping-indices}

Независимо от того, насколько хорошо настроен первичный ключ в ClickHouse, некоторые запросы неизбежно будут требовать полного сканирования таблицы. Хотя необходимость таких сканирований можно снизить с помощью материализованных представлений (и проекций для некоторых запросов), они требуют дополнительного обслуживания, а пользователи должны знать об их наличии, чтобы эффективно их использовать. В то время как традиционные реляционные базы данных решают эту задачу с помощью вторичных индексов, в колоночных базах данных, таких как ClickHouse, они неэффективны. Вместо этого ClickHouse использует индексы пропуска данных (skip indexes), которые могут существенно повысить производительность запросов, позволяя базе данных пропускать крупные блоки данных без подходящих значений.

Стандартные схемы OTel используют вторичные индексы в попытке ускорить доступ к значениям в map-полях. Хотя на практике мы считаем их в целом неэффективными и не рекомендуем копировать их в вашу собственную схему, индексы пропуска данных по‑прежнему могут быть полезны.

Перед тем как пытаться их применять, пользователям следует прочитать и понять [руководство по индексам пропуска данных](/optimize/skipping-indexes).

**В целом они эффективны, когда существует сильная корреляция между первичным ключом и целевым непервичным столбцом/выражением, а пользователи выполняют поиск по редким значениям, то есть по тем, которые не встречаются во многих гранулах.**

### Фильтры Блума для текстового поиска

Для запросов наблюдаемости вторичные индексы могут быть полезны, когда требуется выполнять текстовый поиск. В частности, индексы фильтров Блума на основе n-грамм и токенов [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) и [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) можно использовать для ускорения поиска по столбцам типа String с операторами `LIKE`, `IN` и hasToken. Важно отметить, что индекс на основе токенов генерирует токены, используя неалфавитно-цифровые символы в качестве разделителей. Это означает, что во время выполнения запроса могут быть найдены только токены (или целые слова). Для более детального поиска можно использовать [фильтр Блума на основе N-грамм](/optimize/skipping-indexes#bloom-filter-types). Он разбивает строки на n-граммы указанного размера, что позволяет выполнять поиск по частям слов.

Для оценки токенов, которые будут созданы и сопоставлены, используйте функцию `tokens`:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 строка в наборе. Затрачено: 0.008 сек.
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
ClickHouse также имеет экспериментальную поддержку инвертированных индексов в качестве вторичного индекса. В настоящее время мы не рекомендуем их использовать для логов, но ожидаем, что они заменят bloom-фильтры на основе токенов после выхода в production.
:::

В данном примере используется набор данных структурированных логов. Предположим, требуется подсчитать логи, где столбец `Referer` содержит `ultra`.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 строка в наборе. Затрачено: 0.177 сек. Обработано 10.37 млн строк, 908.49 МБ (58.57 млн строк/с., 5.13 ГБ/с.)
```

Здесь необходимо выполнить сопоставление с размером n-граммы, равным 3. Поэтому создаём индекс `ngrambf_v1`.

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

Индекс `ngrambf_v1(3, 10000, 3, 7)` принимает четыре параметра. Последний из них (значение 7) представляет собой начальное значение (seed). Остальные параметры представляют размер n-граммы (3), значение `m` (размер фильтра) и количество хеш-функций `k` (7). Параметры `k` и `m` требуют настройки и зависят от количества уникальных n-грамм/токенов и вероятности того, что фильтр вернёт истинно отрицательный результат, тем самым подтверждая отсутствие значения в грануле. Рекомендуем использовать [эти функции](/engines/table-engines/mergetree-family/mergetree#bloom-filter) для определения этих значений.

Если всё настроено должным образом, прирост производительности может быть существенным:

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│   182   │
└─────────┘

1 строка в наборе. Затрачено: 0.077 сек. Обработано 4.22 млн строк, 375.29 МБ (54.81 млн строк/сек., 4.87 ГБ/сек.)
Пиковое использование памяти: 129.60 КиБ.
```

:::note Только пример
Приведённый выше пример служит исключительно для иллюстрации. Мы рекомендуем пользователям извлекать структуру из логов на этапе вставки, а не пытаться оптимизировать текстовый поиск с помощью блум‑фильтров на основе токенов. Однако существуют случаи, когда у пользователей есть трассировки стека или другие большие строки, для которых текстовый поиск может быть полезен из‑за менее детерминированной структуры.
:::

Некоторые общие рекомендации по использованию блум‑фильтров:

Цель блум‑фильтра — отфильтровывать [гранулы](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), избегая необходимости загружать все значения столбца и выполнять линейное сканирование. Оператор `EXPLAIN` с параметром `indexes=1` можно использовать для определения количества гранул, которые были пропущены. Рассмотрите приведённые ниже ответы для исходной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с блум‑фильтром ngram.

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

Фильтр Блума обычно будет быстрее только в том случае, если он меньше самого столбца. Если он больше, выигрыш в производительности, скорее всего, будет незначительным. Сравните размер фильтра с размером столбца, используя следующие запросы:


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

В приведённых выше примерах мы видим, что вторичный индекс блум-фильтра имеет размер 12 МБ — почти в 5 раз меньше сжатого размера самого столбца, равного 56 МБ.

Блум-фильтры могут требовать значительной настройки. Мы рекомендуем следовать примечаниям [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые помогут подобрать оптимальные параметры. Блум-фильтры также могут быть ресурсоёмкими при вставке и слиянии данных. Перед добавлением блум-фильтров в продуктивную среду рекомендуется оценить влияние на производительность вставки.

Дополнительные сведения о вторичных пропускающих индексах можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).


### Извлечение из типов Map {#extracting-from-maps}

Тип Map широко используется в схемах OTel. Для этого типа требуется, чтобы значения и ключи имели один и тот же тип — этого достаточно для метаданных, таких как метки Kubernetes. Имейте в виду, что при запросе подключа типа Map загружается весь родительский столбец. Если Map содержит много ключей, это может привести к существенному снижению производительности запроса, поскольку с диска нужно прочитать больше данных, чем если бы ключ существовал как отдельный столбец.

Если вы часто запрашиваете определённый ключ, рассмотрите возможность вынести его в отдельный столбец верхнего уровня. Обычно это делается в ответ на распространённые шаблоны доступа и уже после развертывания, и может быть сложно предсказать это до выхода в продакшн. См. раздел ["Управление изменениями схемы"](/observability/managing-data#managing-schema-changes) о том, как изменять схему после развертывания.

## Измерение размера таблицы и степени сжатия {#measuring-table-size--compression}

Одна из основных причин, по которой ClickHouse используют для задач наблюдаемости (Observability), — это сжатие.

Помимо значительного сокращения затрат на хранение, меньшее количество данных на диске означает меньше операций ввода-вывода (I/O) и более быстрые запросы и вставки. Снижение объёма I/O перевешивает накладные расходы любого алгоритма сжатия с точки зрения нагрузки на CPU. Поэтому улучшение сжатия данных должно быть первой задачей при обеспечении высокой скорости выполнения запросов в ClickHouse.

Подробности об измерении степени сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).