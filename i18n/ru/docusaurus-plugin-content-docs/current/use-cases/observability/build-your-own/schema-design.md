---
title: 'Проектирование схемы'
description: 'Проектирование схемы данных для наблюдаемости'
keywords: ['наблюдаемость', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# Проектирование схемы для наблюдаемости

Мы рекомендуем пользователям всегда создавать собственную схему для логов и трассировок по следующим причинам:

- **Выбор первичного ключа** — в схемах по умолчанию используется `ORDER BY`, оптимизированный под конкретные шаблоны доступа. Маловероятно, что ваши шаблоны доступа будут с ними совпадать.
- **Извлечение структуры** — пользователи могут захотеть извлекать новые столбцы из существующих столбцов, например из столбца `Body`. Это можно сделать с помощью материализованных столбцов (и материализованных представлений в более сложных случаях). Это требует изменений схемы.
- **Оптимизация Map** — схемы по умолчанию используют тип Map для хранения атрибутов. Эти столбцы позволяют хранить произвольные метаданные. Хотя это важная возможность (поскольку метаданные событий часто не определены заранее и иначе не могут быть сохранены в строго типизированной базе данных, такой как ClickHouse), доступ к ключам Map и их значениям не так эффективен, как доступ к обычному столбцу. Мы решаем это, модифицируя схему и вынося наиболее часто запрашиваемые ключи Map в столбцы верхнего уровня — см. раздел ["Извлечение структуры с помощью SQL"](#extracting-structure-with-sql). Это требует изменения схемы.
- **Упрощение доступа к ключам Map** — доступ к ключам в Map требует более многословного синтаксиса. Пользователи могут смягчить это с помощью псевдонимов. См. раздел ["Использование псевдонимов"](#using-aliases) для упрощения запросов.
- **Вторичные индексы** — схема по умолчанию использует вторичные индексы для ускорения доступа к Map и текстовых запросов. Чаще всего они не требуются и приводят к дополнительному расходу дискового пространства. Их можно использовать, но следует протестировать, чтобы убедиться, что они действительно необходимы. См. раздел ["Вторичные / data skipping-индексы"](#secondarydata-skipping-indices).
- **Использование Codecs** — пользователи могут захотеть настраивать кодеки для столбцов, если они понимают ожидаемые данные и имеют подтверждения, что это улучшает сжатие.

_Ниже мы подробно описываем каждый из указанных выше сценариев использования._

**Важно:** Хотя пользователям рекомендуется расширять и изменять свою схему для достижения оптимального сжатия и производительности запросов, по возможности им следует придерживаться схемы именования OTel для основных столбцов. Плагин ClickHouse для Grafana предполагает наличие некоторых базовых столбцов OTel для помощи в построении запросов, например `Timestamp` и `SeverityText`. Обязательные столбцы для логов и трассировок задокументированы здесь [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) соответственно. Вы можете изменить эти имена столбцов, переопределив значения по умолчанию в конфигурации плагина.



## Извлечение структуры с помощью SQL {#extracting-structure-with-sql}

При приёме структурированных или неструктурированных логов пользователям часто требуется возможность:

- **Извлекать столбцы из строковых блобов**. Запросы к ним будут выполняться быстрее, чем использование строковых операций во время выполнения запроса.
- **Извлекать ключи из map-структур**. Схема по умолчанию помещает произвольные атрибуты в столбцы типа Map. Этот тип обеспечивает возможность работы без схемы, что имеет преимущество в том, что пользователям не нужно предварительно определять столбцы для атрибутов при определении логов и трассировок — часто это невозможно при сборе логов из Kubernetes, когда необходимо сохранить метки подов для последующего поиска. Доступ к ключам map-структур и их значениям медленнее, чем запросы к обычным столбцам ClickHouse. Поэтому извлечение ключей из map-структур в корневые столбцы таблицы часто является желательным.

Рассмотрим следующие запросы:

Предположим, мы хотим подсчитать, какие URL-пути получают наибольшее количество POST-запросов, используя структурированные логи. JSON-блоб хранится в столбце `Body` как String. Кроме того, он также может храниться в столбце `LogAttributes` как `Map(String, String)`, если пользователь включил json_parser в коллекторе.

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

Предполагая, что `LogAttributes` доступен, запрос для подсчёта того, какие URL-пути сайта получают наибольшее количество POST-запросов:

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

Получено 5 строк. Затрачено: 0.735 сек. Обработано 10.36 млн строк, 4.65 ГБ (14.10 млн строк/с., 6.32 ГБ/с.)
Пиковое использование памяти: 153.71 МиБ.
```

Обратите внимание на использование синтаксиса map-структур, например `LogAttributes['request_path']`, и функции [`path`](/sql-reference/functions/url-functions#path) для удаления параметров запроса из URL.

Если пользователь не включил парсинг JSON в коллекторе, то `LogAttributes` будет пустым, что вынуждает нас использовать [функции JSON](/sql-reference/functions/json-functions) для извлечения столбцов из строкового `Body`.

:::note Предпочтительно использовать ClickHouse для парсинга
Мы обычно рекомендуем пользователям выполнять парсинг JSON структурированных логов в ClickHouse. Мы уверены, что ClickHouse — это самая быстрая реализация парсинга JSON. Однако мы понимаем, что пользователи могут захотеть отправлять логи в другие источники и не размещать эту логику в SQL.
:::

```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

```


┌─path─────────────────────┬─────c─┐
│ /m/updateVariation │ 12182 │
│ /site/productCard │ 11080 │
│ /site/productPrice │ 10876 │
│ /site/productAdditives │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

Получено 5 строк. Затрачено: 0.668 сек. Обработано 10.37 млн строк, 5.13 ГБ (15.52 млн строк/с., 7.68 ГБ/с.)
Пиковое использование памяти: 172.30 МиБ.

````

Теперь рассмотрим аналогичный случай для неструктурированных логов:

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
````

Аналогичный запрос для неструктурированных логов требует использования регулярных выражений через функцию `extractAllGroupsVertical`.

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

Получено 5 строк. Затрачено: 1.953 сек. Обработано 10.37 млн строк, 3.59 ГБ (5.31 млн строк/с., 1.84 ГБ/с.)
```

Повышенная сложность и стоимость запросов для парсинга неструктурированных логов (обратите внимание на разницу в производительности) — это причина, по которой мы рекомендуем по возможности всегда использовать структурированные логи.

:::note Рассмотрите использование словарей
Приведенный выше запрос можно оптимизировать с помощью словарей регулярных выражений. Подробнее см. в разделе [Использование словарей](#using-dictionaries).
:::

Оба этих сценария использования можно реализовать в ClickHouse, перенеся логику запроса на момент вставки данных. Ниже мы рассмотрим несколько подходов, указывая, когда каждый из них применим.

:::note OTel или ClickHouse для обработки?
Пользователи также могут выполнять обработку с помощью процессоров и операторов OTel Collector, как описано [здесь](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching). В большинстве случаев ClickHouse оказывается значительно более ресурсоэффективным и быстрым, чем процессоры коллектора. Основным недостатком выполнения всей обработки событий в SQL является привязка решения к ClickHouse. Например, пользователи могут захотеть отправлять обработанные логи в альтернативные назначения из OTel Collector, например, в S3.
:::

### Материализованные столбцы {#materialized-columns}

Материализованные столбцы предлагают простейшее решение для извлечения структуры из других столбцов. Значения таких столбцов всегда вычисляются во время вставки и не могут быть указаны в запросах INSERT.

:::note Накладные расходы
Материализованные столбцы создают дополнительные накладные расходы на хранение, поскольку значения извлекаются в новые столбцы на диске во время вставки.
:::

Материализованные столбцы поддерживают любые выражения ClickHouse и могут использовать любые аналитические функции для [обработки строк](/sql-reference/functions/string-functions) (включая [регулярные выражения и поиск](/sql-reference/functions/string-search-functions)) и [URL-адресов](/sql-reference/functions/url-functions), выполнения [преобразований типов](/sql-reference/functions/type-conversion-functions), [извлечения значений из JSON](/sql-reference/functions/json-functions) или [математических операций](/sql-reference/functions/math-functions).

Мы рекомендуем использовать материализованные столбцы для базовой обработки. Они особенно полезны для извлечения значений из карт, повышения их до корневых столбцов и выполнения преобразований типов. Наиболее эффективны они при использовании в простых схемах или в сочетании с материализованными представлениями. Рассмотрим следующую схему для логов, из которых JSON был извлечен в столбец `LogAttributes` коллектором:


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

Эквивалентную схему для извлечения с помощью JSON‑функций из строки `Body` можно найти [здесь](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==).

Наши три материализованных столбца извлекают страницу запроса, тип запроса и домен реферера. Они обращаются к ключам карты и применяют функции к их значениям. Наш последующий запрос выполняется значительно быстрее:

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

5 строк в наборе. Затрачено: 0.173 сек. Обработано 10.37 млн строк, 418.03 МБ (60.07 млн строк/с., 2.42 ГБ/с.)
Пиковое использование памяти: 3.16 МиБ.
```

:::note
Материализованные столбцы по умолчанию не возвращаются в результате `SELECT *`. Это сделано для сохранения инварианта, что результат `SELECT *` всегда можно вставить обратно в таблицу с помощью `INSERT`. Это поведение можно отключить, установив `asterisk_include_materialized_columns=1`, и его можно включить в Grafana (см. `Additional Settings -> Custom Settings` в конфигурации источника данных).
:::


## Материализованные представления {#materialized-views}

[Материализованные представления](/materialized-views) предоставляют более мощные средства применения SQL-фильтрации и преобразований к логам и трассировкам.

Материализованные представления позволяют пользователям перенести вычислительные затраты с момента выполнения запроса на момент вставки данных. Материализованное представление ClickHouse — это триггер, который выполняет запрос к блокам данных по мере их вставки в таблицу. Результаты этого запроса вставляются во вторую «целевую» таблицу.

<Image img={observability_10} alt='Materialized view' size='md' />

:::note Обновления в реальном времени
Материализованные представления в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на которой они основаны, функционируя скорее как постоянно обновляемые индексы. В отличие от этого, в других базах данных материализованные представления обычно являются статическими снимками запроса, которые необходимо обновлять вручную (аналогично обновляемым материализованным представлениям ClickHouse — Refreshable Materialized Views).
:::

Запрос, связанный с материализованным представлением, теоретически может быть любым запросом, включая агрегацию, хотя [существуют ограничения для соединений](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для задач преобразования и фильтрации, необходимых для логов и трассировок, пользователи могут использовать любой оператор `SELECT`.

Пользователи должны помнить, что запрос — это просто триггер, выполняющийся над строками, вставляемыми в таблицу (исходную таблицу), с отправкой результатов в новую таблицу (целевую таблицу).

Чтобы не сохранять данные дважды (в исходной и целевой таблицах), мы можем изменить движок исходной таблицы на [движок таблиц Null](/engines/table-engines/special/null), сохранив исходную схему. Наши коллекторы OTel продолжат отправлять данные в эту таблицу. Например, для логов таблица `otel_logs` становится:

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

Движок таблиц Null — это мощная оптимизация, представьте его как `/dev/null`. Эта таблица не будет хранить никаких данных, но все присоединенные материализованные представления по-прежнему будут выполняться над вставляемыми строками до их удаления.

Рассмотрим следующий запрос. Он преобразует наши строки в формат, который мы хотим сохранить, извлекая все столбцы из `LogAttributes` (мы предполагаем, что это было установлено коллектором с использованием оператора `json_parser`), устанавливая `SeverityText` и `SeverityNumber` (на основе некоторых простых условий и определения [этих столбцов](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В данном случае мы также выбираем только те столбцы, которые, как мы знаем, будут заполнены, игнорируя такие столбцы, как `TraceId`, `SpanId` и `TraceFlags`.


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
RemoteAddr:     54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

Получена 1 строка. Затрачено: 0,027 сек.
```

Мы также извлекаем указанный выше столбец `Body` — на случай, если позже будут добавлены дополнительные атрибуты, которые не извлекаются нашим SQL. Этот столбец будет хорошо сжиматься в ClickHouse и будет редко запрашиваться, поэтому не повлияет на производительность запросов. Наконец, мы приводим поле Timestamp к типу DateTime (для экономии места — см. раздел [«Оптимизация типов»](#optimizing-types)).

:::note Conditionals
Обратите внимание на использование [условных функций](/sql-reference/functions/conditional-functions) выше для извлечения `SeverityText` и `SeverityNumber`. Они чрезвычайно полезны для формулирования сложных условий и проверки, установлены ли значения в отображениях (map) — мы наивно предполагаем, что все ключи существуют в `LogAttributes`. Рекомендуем пользователям ознакомиться с ними — они незаменимы при разборе логов, в дополнение к функциям для обработки [null-значений](/sql-reference/functions/functions-for-nulls)!
:::

Нам требуется таблица для получения этих результатов. Целевая таблица ниже соответствует приведённому выше запросу:

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
Обратите внимание, насколько сильно мы изменили схему. На практике у пользователей, вероятно, также будут столбцы трейсов (Trace), которые они захотят сохранить, а также столбец `ResourceAttributes` (обычно он содержит метаданные Kubernetes). Grafana может использовать столбцы трейсов для связывания логов и трейсов — см. раздел [&quot;Using Grafana&quot;](/observability/grafana).
:::


Ниже мы создаём материализованное представление `otel_logs_mv`, которое выполняет вышеуказанный запрос `SELECT` для таблицы `otel_logs` и направляет результаты в `otel_logs_v2`.

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

Это визуализировано ниже:

<Image img={observability_11} alt="Otel MV" size="md" />

Если теперь перезапустить конфигурацию коллектора, используемую в разделе [&quot;Exporting to ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse), данные появятся в `otel_logs_v2` в нужном формате. Обратите внимание на использование типизированных функций извлечения данных из JSON.

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Строка 1:
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

1 строка в результате. Прошло: 0.010 сек.
```

Эквивалентное материализованное представление, основанное на извлечении столбцов из столбца `Body` при помощи JSON-функций, показано ниже:


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

### Обратите внимание на типы данных {#beware-types}

Приведенные выше материализованные представления используют неявное приведение типов — особенно при работе с картой `LogAttributes`. ClickHouse часто автоматически приводит извлеченное значение к типу целевой таблицы, упрощая синтаксис. Тем не менее, рекомендуется всегда тестировать представления, выполняя запрос `SELECT` представления с инструкцией [`INSERT INTO`](/sql-reference/statements/insert-into) в целевую таблицу с той же схемой. Это позволит убедиться в корректной обработке типов. Особое внимание следует уделить следующим случаям:

- Если ключ отсутствует в карте, будет возвращена пустая строка. Для числовых значений потребуется сопоставить их с соответствующим значением. Это можно сделать с помощью [условных функций](/sql-reference/functions/conditional-functions), например `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`, или [функций приведения типов](/sql-reference/functions/type-conversion-functions), если допустимы значения по умолчанию, например `toUInt8OrDefault(LogAttributes['status'] )`
- Некоторые типы не всегда приводятся автоматически, например, строковые представления чисел не будут приведены к значениям enum.
- Функции извлечения JSON возвращают значения по умолчанию для своего типа, если значение не найдено. Убедитесь, что эти значения имеют смысл!

:::note Избегайте Nullable
Избегайте использования [Nullable](/sql-reference/data-types/nullable) в ClickHouse для данных наблюдаемости. В логах и трассировках редко требуется различать пустые значения и null. Эта возможность приводит к дополнительным накладным расходам на хранение и негативно влияет на производительность запросов. Подробнее см. [здесь](/data-modeling/schema-design#optimizing-types).
:::


## Выбор первичного (упорядочивающего) ключа {#choosing-a-primary-ordering-key}

После извлечения необходимых столбцов можно приступить к оптимизации упорядочивающего/первичного ключа.

Для выбора упорядочивающего ключа можно применить несколько простых правил. Иногда они могут противоречить друг другу, поэтому рассматривайте их в указанном порядке. В результате этого процесса можно определить несколько ключей, обычно достаточно 4-5:

1. Выбирайте столбцы, которые соответствуют вашим типичным фильтрам и шаблонам доступа. Если пользователи обычно начинают исследование данных наблюдаемости с фильтрации по определенному столбцу, например, имени пода, этот столбец будет часто использоваться в условиях `WHERE`. Отдавайте приоритет включению таких столбцов в ключ перед теми, которые используются реже.
2. Отдавайте предпочтение столбцам, которые при фильтрации помогают исключить большой процент от общего числа строк, тем самым уменьшая объем данных, которые необходимо прочитать. Имена сервисов и коды состояния часто являются хорошими кандидатами — в последнем случае только если пользователи фильтруют по значениям, исключающим большинство строк. Например, фильтрация по кодам 200 в большинстве систем будет соответствовать большинству строк, в отличие от ошибок 500, которые будут соответствовать небольшому подмножеству.
3. Отдавайте предпочтение столбцам, которые, вероятно, сильно коррелируют с другими столбцами в таблице. Это поможет обеспечить последовательное хранение этих значений, улучшая сжатие.
4. Операции `GROUP BY` и `ORDER BY` для столбцов в упорядочивающем ключе могут быть выполнены более эффективно с точки зрения использования памяти.

<br />

После определения подмножества столбцов для упорядочивающего ключа их необходимо объявить в определенном порядке. Этот порядок может существенно повлиять как на эффективность фильтрации по вторичным ключевым столбцам в запросах, так и на коэффициент сжатия файлов данных таблицы. В общем случае **лучше всего упорядочивать ключи по возрастанию кардинальности**. Это следует сбалансировать с тем фактом, что фильтрация по столбцам, которые находятся позже в упорядочивающем ключе, будет менее эффективной, чем фильтрация по тем, которые находятся раньше в кортеже. Сбалансируйте эти особенности и учитывайте ваши шаблоны доступа. Самое важное — тестируйте варианты. Для более глубокого понимания упорядочивающих ключей и способов их оптимизации рекомендуем [эту статью](/guides/best-practices/sparse-primary-indexes).

:::note Сначала структура
Рекомендуем определять упорядочивающие ключи после того, как вы структурировали свои логи. Не используйте ключи из карт атрибутов для упорядочивающего ключа или выражения извлечения JSON. Убедитесь, что ваши упорядочивающие ключи являются корневыми столбцами в таблице.
:::


## Использование Map {#using-maps}

В предыдущих примерах показано использование синтаксиса `map['key']` для доступа к значениям в столбцах `Map(String, String)`. Помимо использования нотации Map для доступа к вложенным ключам, для фильтрации или выборки этих столбцов доступны специализированные [функции для работы с Map](/sql-reference/functions/tuple-map-functions#mapkeys) ClickHouse.

Например, следующий запрос определяет все уникальные ключи, доступные в столбце `LogAttributes`, используя [функцию `mapKeys`](/sql-reference/functions/tuple-map-functions#mapkeys) с последующим применением [функции `groupArrayDistinctArray`](/sql-reference/aggregate-functions/combinators) (комбинатора).

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
Мы не рекомендуем использовать точки в именах столбцов типа Map и можем прекратить поддержку этой возможности. Используйте символ `_`.
:::


## Использование псевдонимов {#using-aliases}

Запросы к типам Map выполняются медленнее, чем запросы к обычным столбцам — см. раздел ["Ускорение запросов"](#accelerating-queries). Кроме того, синтаксис таких запросов более сложен и может быть громоздким для пользователей. Для решения этой проблемы рекомендуется использовать столбцы ALIAS.

Столбцы ALIAS вычисляются во время выполнения запроса и не хранятся в таблице. Поэтому невозможно выполнить INSERT значения в столбец этого типа. Используя псевдонимы, можно ссылаться на ключи Map и упрощать синтаксис, прозрачно представляя элементы Map как обычные столбцы. Рассмотрим следующий пример:

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

В этом примере есть несколько материализованных столбцов и столбец `ALIAS` с именем `RemoteAddr`, который обращается к Map `LogAttributes`. Теперь можно запрашивать значения `LogAttributes['remote_addr']` через этот столбец, упрощая тем самым запрос:

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

Кроме того, добавление `ALIAS` выполняется просто с помощью команды `ALTER TABLE`. Эти столбцы становятся доступными немедленно, например:

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

:::note Псевдонимы исключены по умолчанию
По умолчанию `SELECT *` исключает столбцы ALIAS. Это поведение можно отключить, установив параметр `asterisk_include_alias_columns=1`.
:::


## Оптимизация типов данных {#optimizing-types}

[Общие рекомендации ClickHouse](/data-modeling/schema-design#optimizing-types) по оптимизации типов данных применимы и в данном случае.


## Использование кодеков {#using-codecs}

Помимо оптимизации типов данных, пользователи могут следовать [общим рекомендациям по кодекам](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) при оптимизации сжатия для схем ClickHouse Observability.

В целом кодек `ZSTD` хорошо подходит для наборов данных логирования и трассировки. Увеличение уровня сжатия от значения по умолчанию 1 может улучшить сжатие. Однако это следует протестировать, поскольку более высокие значения приводят к большей нагрузке на процессор во время вставки данных. Как правило, увеличение этого значения дает незначительный выигрыш.

Кроме того, временные метки, хотя и выигрывают от дельта-кодирования с точки зрения сжатия, могут приводить к снижению производительности запросов, если этот столбец используется в первичном ключе или ключе сортировки. Мы рекомендуем пользователям оценить компромиссы между сжатием и производительностью запросов.


## Использование словарей {#using-dictionaries}

[Словари](/sql-reference/dictionaries) являются [ключевой возможностью](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) ClickHouse, обеспечивающей хранение данных из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources) в памяти в формате [ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database), оптимизированное для запросов поиска со сверхнизкой задержкой.

<Image img={observability_12} alt='Наблюдаемость и словари' size='md' />

Это полезно в различных сценариях: от обогащения поступающих данных на лету без замедления процесса загрузки до улучшения производительности запросов в целом, причём особенно выигрывают операции JOIN.
Хотя соединения редко требуются в сценариях наблюдаемости, словари всё равно могут быть полезны для целей обогащения — как при вставке, так и при выполнении запросов. Ниже мы приводим примеры обоих подходов.

:::note Ускорение соединений
Пользователи, заинтересованные в ускорении соединений с помощью словарей, могут найти дополнительную информацию [здесь](/dictionary).
:::

### Обогащение при вставке или при запросе {#insert-time-vs-query-time}

Словари могут использоваться для обогащения наборов данных во время выполнения запроса или во время вставки. Каждый из этих подходов имеет свои преимущества и недостатки. Вкратце:

- **Обогащение при вставке** — обычно подходит, если значение обогащения не изменяется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки позволяет избежать поиска в словаре во время выполнения запроса. Это достигается за счёт производительности вставки, а также дополнительных затрат на хранение, поскольку обогащённые значения будут храниться в виде столбцов.
- **Обогащение при запросе** — если значения в словаре часто изменяются, поиск во время выполнения запроса часто более применим. Это позволяет избежать необходимости обновления столбцов (и перезаписи данных) при изменении сопоставленных значений. Эта гибкость достигается за счёт затрат на поиск во время выполнения запроса. Эти затраты обычно заметны, если требуется поиск для многих строк, например, при использовании поиска в словаре в условии фильтрации. Для обогащения результатов, то есть в `SELECT`, эти накладные расходы обычно незначительны.

Мы рекомендуем пользователям ознакомиться с основами работы со словарями. Словари предоставляют таблицу поиска в памяти, из которой значения могут быть извлечены с помощью специализированных [функций](/sql-reference/functions/ext-dict-functions#dictgetall).

Простые примеры обогащения см. в руководстве по словарям [здесь](/dictionary). Ниже мы сосредоточимся на типичных задачах обогащения в контексте наблюдаемости.

### Использование IP-словарей {#using-ip-dictionaries}

Геообогащение журналов и трассировок значениями широты и долготы с использованием IP-адресов является распространённым требованием в области наблюдаемости. Мы можем достичь этого с помощью структурированного словаря `ip_trie`.

Мы используем общедоступный [набор данных DB-IP на уровне городов](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставленный [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [файла readme](https://github.com/sapics/ip-location-db#csv-format) видно, что данные структурированы следующим образом:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

Учитывая эту структуру, начнём с просмотра данных с помощью табличной функции [url()](/sql-reference/table-functions/url):

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

Чтобы упростить задачу, используем движок таблиц [`URL()`](/engines/table-engines/special/url) для создания объекта таблицы ClickHouse с нашими именами полей и подтвердим общее количество строк:


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
│ 3261621 │ -- 3,26 миллиона
└─────────┘
```

Поскольку наш словарь `ip_trie` требует, чтобы диапазоны IP-адресов были заданы в формате CIDR, нам нужно преобразовать `ip_range_start` и `ip_range_end`.

CIDR-представление для каждого диапазона можно вычислить следующим запросом:

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

Выбрано 4 строки. Затрачено: 0,259 сек.
```

:::note
В приведённом выше запросе происходит довольно много всего. Кому интересно, рекомендую прочитать это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). Иначе просто примите, что приведённый выше запрос вычисляет CIDR для диапазона IP-адресов.
:::

Для наших целей нам понадобятся только диапазон IP-адресов, код страны и координаты, поэтому создадим новую таблицу и вставим наши данные Geo IP:

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

Чтобы выполнять IP-поиски с низкой задержкой в ClickHouse, мы будем использовать словари для хранения отображения ключ → атрибуты для наших Geo IP-данных в памяти. ClickHouse предоставляет структуру словаря [`ip_trie`](/sql-reference/dictionaries#ip_trie) для сопоставления сетевых префиксов (CIDR-блоков) с координатами и кодами стран. Следующий запрос определяет словарь, использующий эту схему и приведённую выше таблицу в качестве источника.

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
```


┌─cidr───────┬─latitude─┬─longitude─┬─country&#95;code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 строки в наборе. Прошло: 4.662 сек.

````

:::note Периодическое обновление
Словари в ClickHouse периодически обновляются на основе данных базовой таблицы и указанного выше параметра lifetime. Чтобы обновить наш словарь Geo IP с учётом последних изменений в наборе данных DB-IP, достаточно повторно вставить данные из удалённой таблицы geoip_url в таблицу `geoip` с применением преобразований.
:::

Теперь, когда данные Geo IP загружены в словарь `ip_trie` (который также удобно назван `ip_trie`), мы можем использовать его для геолокации IP-адресов. Это можно сделать с помощью [функции `dictGet()`](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
````

Обратите внимание на скорость выборки. Это позволяет нам обогащать логи. В данном случае мы выбираем **выполнять обогащение при выполнении запроса**.

Возвращаясь к нашему исходному набору логов, мы можем использовать описанное выше, чтобы агрегировать наши логи по странам. Далее предполагается, что мы используем схему, полученную из ранее созданного материализованного представления, которое содержит выделенный столбец `RemoteAddress`.

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

Поскольку сопоставление IP с географическим местоположением может меняться, пользователям, скорее всего, важно знать, откуда был отправлен запрос в момент его выполнения, а не каково текущее географическое местоположение для того же адреса. По этой причине здесь, вероятнее всего, предпочтительно обогащение на этапе индексации. Это можно сделать с помощью материализованных столбцов, как показано ниже, или в выражении `SELECT` материализованного представления:

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
Пользователям, вероятно, потребуется периодически обновлять словарь обогащения IP на основе новых данных. Это можно реализовать с помощью параметра `LIFETIME` словаря, который обеспечивает периодическую перезагрузку словаря из базовой таблицы. Для обновления базовой таблицы см. раздел ["Обновляемые материализованные представления"](/materialized-view/refreshable-materialized-view).
:::

Указанные выше страны и координаты предоставляют возможности визуализации помимо группировки и фильтрации по странам. Примеры см. в разделе ["Визуализация геоданных"](/observability/grafana#visualizing-geo-data).

### Использование словарей с регулярными выражениями (парсинг user agent) {#using-regex-dictionaries-user-agent-parsing}

Парсинг [строк user agent](https://en.wikipedia.org/wiki/User_agent) является классической задачей для регулярных выражений и распространенным требованием в наборах данных на основе логов и трассировок. ClickHouse обеспечивает эффективный парсинг user agent с использованием древовидных словарей регулярных выражений.

Древовидные словари регулярных выражений определяются в ClickHouse open-source с использованием типа источника словаря YAMLRegExpTree, который указывает путь к YAML-файлу, содержащему дерево регулярных выражений. Если вы хотите использовать собственный словарь регулярных выражений, подробности о требуемой структуре можно найти [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source). Ниже мы рассмотрим парсинг user-agent с использованием [uap-core](https://github.com/ua-parser/uap-core) и загрузим словарь в поддерживаемом формате CSV. Этот подход совместим с OSS и ClickHouse Cloud.

:::note
В приведенных ниже примерах используются снимки последних регулярных выражений uap-core для парсинга user-agent от июня 2024 года. Последний файл, который периодически обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Пользователи могут следовать инструкциям [здесь](/sql-reference/dictionaries#collecting-attribute-values) для загрузки в CSV-файл, используемый ниже.
:::

Создайте следующие таблицы Memory. Они содержат регулярные выражения для парсинга устройств, браузеров и операционных систем.

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

Эти таблицы можно заполнить из следующих публично размещенных CSV-файлов, используя табличную функцию url:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

После заполнения таблиц Memory можно загрузить словари регулярных выражений. Обратите внимание, что необходимо указать ключевые значения в виде столбцов — это будут атрибуты, которые можно извлечь из user agent.

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


После загрузки этих словарей мы можем указать пример User-Agent и протестировать наши новые возможности извлечения с помощью словарей:

```sql
WITH 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0' AS user_agent
SELECT
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), user_agent) AS device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), user_agent) AS browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), user_agent) AS os

┌─device────────────────┬─browser───────────────┬─os─────────────────────────┐
│ ('Mac','Apple','Mac') │ ('Firefox','127','0') │ ('Mac OS X','10','15','0') │
└───────────────────────┴───────────────────────┴────────────────────────────┘

Получена 1 строка. Затрачено: 0.003 сек.
```

Учитывая, что правила, касающиеся user agent, будут меняться редко, а словарь потребуется обновлять только в ответ на появление новых браузеров, операционных систем и устройств, имеет смысл выполнять это извлечение при вставке данных.

Мы можем выполнить эту работу либо с помощью материализованного столбца, либо с помощью материализованного представления. Ниже мы модифицируем материализованное представление, использованное ранее:

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

После перезапуска коллектора и загрузки структурированных логов в соответствии с ранее описанными шагами мы можем выполнять запросы к вновь извлечённым столбцам Device, Browser и Os.


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
Обратите внимание на использование кортежей (Tuples) для этих столбцов пользовательского агента. Кортежи рекомендуются для сложных структур с заранее известной иерархией. Подстолбцы обеспечивают такую же производительность, как и обычные столбцы (в отличие от ключей Map), при этом позволяя использовать разнородные типы данных.
:::

### Дополнительные материалы {#further-reading}

Для получения дополнительных примеров и подробной информации о словарях рекомендуем следующие статьи:

- [Расширенные темы по словарям](/dictionary#advanced-dictionary-topics)
- [«Использование словарей для ускорения запросов»](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Словари](/sql-reference/dictionaries)


## Ускорение запросов {#accelerating-queries}

ClickHouse поддерживает ряд методов ускорения выполнения запросов. Следующие подходы следует рассматривать только после выбора подходящего первичного ключа/ключа сортировки для оптимизации наиболее распространённых шаблонов доступа и максимизации сжатия. Как правило, это оказывает наибольшее влияние на производительность при минимальных усилиях.

### Использование материализованных представлений (инкрементальных) для агрегаций {#using-materialized-views-incremental-for-aggregations}

В предыдущих разделах мы рассмотрели использование материализованных представлений для преобразования и фильтрации данных. Однако материализованные представления также можно использовать для предварительного вычисления агрегаций во время вставки и сохранения результата. Этот результат может обновляться результатами последующих вставок, что фактически позволяет предварительно вычислять агрегацию во время вставки.

Основная идея заключается в том, что результаты часто представляют собой более компактное представление исходных данных (частичный набросок в случае агрегаций). В сочетании с более простым запросом для чтения результатов из целевой таблицы время выполнения запросов будет меньше, чем если бы те же вычисления выполнялись на исходных данных.

Рассмотрим следующий запрос, в котором мы вычисляем общий трафик за час, используя наши структурированные логи:

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

Можно представить, что это может быть типичный линейный график, который пользователи строят в Grafana. Этот запрос, безусловно, очень быстрый — набор данных содержит всего 10 млн строк, а ClickHouse быстр! Однако при масштабировании до миллиардов и триллионов строк мы хотели бы сохранить такую производительность запросов.

:::note
Этот запрос был бы в 10 раз быстрее, если бы мы использовали таблицу `otel_logs_v2`, которая является результатом нашего предыдущего материализованного представления, извлекающего ключ size из карты `LogAttributes`. Мы используем здесь необработанные данные только в иллюстративных целях и рекомендуем использовать предыдущее представление, если это часто выполняемый запрос.
:::

Нам нужна таблица для получения результатов, если мы хотим вычислять это во время вставки с помощью материализованного представления. Эта таблица должна хранить только 1 строку на час. Если получено обновление для существующего часа, другие столбцы должны быть объединены в строку существующего часа. Чтобы произошло это слияние инкрементальных состояний, для других столбцов должны храниться частичные состояния.

Для этого требуется специальный тип движка в ClickHouse: SummingMergeTree. Он заменяет все строки с одинаковым ключом сортировки одной строкой, содержащей суммированные значения для числовых столбцов. Следующая таблица будет объединять любые строки с одинаковой датой, суммируя все числовые столбцы.

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Чтобы продемонстрировать наше материализованное представление, предположим, что наша таблица `bytes_per_hour` пуста и ещё не получила никаких данных. Наше материализованное представление выполняет указанный выше `SELECT` для данных, вставляемых в `otel_logs` (это будет выполняться для блоков настроенного размера), а результаты отправляются в `bytes_per_hour`. Синтаксис показан ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Ключевым здесь является предложение `TO`, указывающее, куда будут отправлены результаты, т. е. в `bytes_per_hour`.

Если мы перезапустим наш OTel Collector и повторно отправим логи, таблица `bytes_per_hour` будет инкрементально заполняться результатом указанного выше запроса. По завершении мы можем проверить размер нашей таблицы `bytes_per_hour` — у нас должна быть 1 строка на час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

```


┌─count()─┐
│ 113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.

````

Мы эффективно сократили количество строк с 10 млн (в таблице `otel_logs`) до 113, сохранив результат запроса. Ключевой момент заключается в том, что при добавлении новых логов в таблицу `otel_logs` новые значения будут отправлены в `bytes_per_hour` для соответствующего часа, где они будут автоматически объединены асинхронно в фоновом режиме — сохраняя только одну строку на час, таблица `bytes_per_hour` всегда будет компактной и актуальной.

Поскольку объединение строк происходит асинхронно, при выполнении запроса может существовать более одной строки на час. Чтобы гарантировать объединение всех необработанных строк во время выполнения запроса, существует два варианта:

- Использовать [модификатор `FINAL`](/sql-reference/statements/select/from#final-modifier) для имени таблицы (что мы сделали в запросе подсчёта выше).
- Агрегировать по ключу сортировки, используемому в итоговой таблице, то есть по Timestamp, и суммировать метрики.

Как правило, второй вариант более эффективен и гибок (таблица может использоваться для других целей), но первый может быть проще для некоторых запросов. Ниже показаны оба варианта:

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
````

Это ускорило запрос с 0,6 с до 0,008 с — более чем в 75 раз!

:::note
Эта экономия может быть ещё больше на более крупных наборах данных с более сложными запросами. Примеры см. [здесь](https://github.com/ClickHouse/clickpy).
:::

#### Более сложный пример {#a-more-complex-example}

Приведённый выше пример агрегирует простой подсчёт по часам с использованием [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Для статистики, выходящей за рамки простых сумм, требуется другой движок целевой таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

Предположим, необходимо вычислить количество уникальных IP-адресов (или уникальных пользователей) в день. Запрос для этого:

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

Для сохранения подсчёта кардинальности с возможностью инкрементного обновления требуется AggregatingMergeTree.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```


Чтобы ClickHouse понимал, что будут храниться агрегатные состояния, мы определяем столбец `UniqueUsers` с типом [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая функцию-источник частичных состояний (uniq) и тип исходного столбца (IPv4). Как и в SummingMergeTree, строки с одинаковым значением ключа `ORDER BY` будут объединены (в приведенном выше примере это Hour).

Связанное материализованное представление использует ранее описанный запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, что мы добавляем суффикс `State` в конец агрегатных функций. Это гарантирует возврат агрегатного состояния функции вместо окончательного результата. Оно содержит дополнительную информацию, позволяющую объединять это частичное состояние с другими состояниями.

После перезагрузки данных путем перезапуска Collector можно убедиться, что в таблице `unique_visitors_per_hour` доступно 113 строк.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

В итоговом запросе необходимо использовать суффикс Merge для функций (поскольку столбцы хранят частичные агрегатные состояния):

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

Обратите внимание, что здесь используется `GROUP BY` вместо `FINAL`.

### Использование материализованных представлений (инкрементальных) для быстрого поиска {#using-materialized-views-incremental--for-fast-lookups}

При выборе ключа сортировки ClickHouse пользователям следует учитывать свои паттерны доступа к данным и столбцы, которые часто используются в условиях фильтрации и агрегации. Это может быть ограничением в сценариях наблюдаемости, где пользователи имеют более разнообразные паттерны доступа, которые невозможно охватить одним набором столбцов. Это лучше всего проиллюстрировать на примере, встроенном в стандартные схемы OTel. Рассмотрим стандартную схему для трассировок:


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

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. В трейсинге пользователям также необходима возможность выполнять поиск по конкретному `TraceId` и извлекать спаны, связанные с этим трейсом. Хотя `TraceId` присутствует в ключе сортировки, его расположение в конце означает, что [фильтрация будет менее эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) и, вероятно, приведёт к тому, что для выборки одного трейса потребуется сканировать значительные объёмы данных.

Коллектор OTel также создаёт материализованное представление и связанную таблицу для решения этой задачи. Таблица и представление показаны ниже:

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

Представление фактически гарантирует, что таблица `otel_traces_trace_id_ts` содержит минимальную и максимальную метки времени для трейса. Эта таблица, упорядоченная по `TraceId`, позволяет эффективно извлекать эти метки времени. Эти диапазоны меток времени, в свою очередь, могут использоваться при выполнении запросов к основной таблице `otel_traces`. Конкретнее говоря, при получении трейса по его идентификатору Grafana использует следующий запрос:


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

Данное CTE определяет минимальную и максимальную временные метки для идентификатора трассировки `ae9226c78d1d360601e6383928e4d22d`, после чего использует их для фильтрации основной таблицы `otel_traces` по связанным спанам.

Этот же подход можно применить для аналогичных паттернов доступа. Похожий пример рассматривается в разделе моделирования данных [здесь](/materialized-view/incremental-materialized-view#lookup-table).

### Использование проекций {#using-projections}

Проекции ClickHouse позволяют пользователям указывать несколько выражений `ORDER BY` для таблицы.

В предыдущих разделах мы рассмотрели, как материализованные представления могут использоваться в ClickHouse для предварительного вычисления агрегаций, преобразования строк и оптимизации запросов наблюдаемости для различных паттернов доступа.

Мы привели пример, где материализованное представление отправляет строки в целевую таблицу с ключом сортировки, отличным от исходной таблицы, принимающей вставки, для оптимизации поиска по идентификатору трассировки.

Проекции могут использоваться для решения той же задачи, позволяя пользователю оптимизировать запросы по столбцу, который не входит в первичный ключ.

Теоретически эта возможность может использоваться для предоставления нескольких ключей сортировки для таблицы, но с одним существенным недостатком: дублированием данных. В частности, данные должны быть записаны в порядке основного первичного ключа, а также в порядке, указанном для каждой проекции. Это замедлит вставки и увеличит потребление дискового пространства.

:::note Проекции и материализованные представления
Проекции предлагают многие из тех же возможностей, что и материализованные представления, но должны использоваться с осторожностью, при этом последние часто предпочтительнее. Пользователи должны понимать недостатки и когда они уместны. Например, хотя проекции могут использоваться для предварительного вычисления агрегаций, мы рекомендуем пользователям применять для этого материализованные представления.
:::

<Image img={observability_13} alt='Наблюдаемость и проекции' size='md' />

Рассмотрим следующий запрос, который фильтрует нашу таблицу `otel_logs_v2` по кодам ошибок 500. Это, вероятно, распространенный паттерн доступа для журналирования, когда пользователи хотят фильтровать по кодам ошибок:

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note Использование Null для измерения производительности
Мы не выводим результаты здесь, используя `FORMAT Null`. Это заставляет прочитать все результаты, но не возвращать их, тем самым предотвращая досрочное завершение запроса из-за LIMIT. Это сделано только для того, чтобы показать время, затраченное на сканирование всех 10 миллионов строк.
:::

Приведенный выше запрос требует линейного сканирования с выбранным нами ключом сортировки `(ServiceName, Timestamp)`. Хотя мы могли бы добавить `Status` в конец ключа сортировки, улучшив производительность для данного запроса, мы также можем добавить проекцию.

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

Обратите внимание, что сначала необходимо создать проекцию, а затем материализовать её. Эта последняя команда приводит к тому, что данные сохраняются на диске дважды в двух разных порядках. Проекция также может быть определена при создании данных, как показано ниже, и будет автоматически поддерживаться при вставке данных.


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

Важно отметить, что если проекция создается с помощью команды `ALTER`, её создание происходит асинхронно при выполнении команды `MATERIALIZE PROJECTION`. Пользователи могут отслеживать прогресс этой операции следующим запросом, ожидая значения `is_done=1`.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Если повторить приведенный выше запрос, можно увидеть, что производительность значительно улучшилась за счет дополнительного использования дискового пространства (см. раздел [«Измерение размера таблицы и сжатия»](#measuring-table-size--compression) для получения информации о том, как это измерить).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

В приведенном выше примере мы указываем в проекции столбцы, используемые в предыдущем запросе. Это означает, что только эти указанные столбцы будут храниться на диске как часть проекции, упорядоченные по Status. Если бы мы использовали здесь `SELECT *`, то хранились бы все столбцы. Хотя это позволило бы большему количеству запросов (использующих любое подмножество столбцов) воспользоваться проекцией, потребуется дополнительное дисковое пространство. Для измерения дискового пространства и сжатия см. раздел [«Измерение размера таблицы и сжатия»](#measuring-table-size--compression).

### Вторичные индексы/индексы пропуска данных {#secondarydata-skipping-indices}

Независимо от того, насколько хорошо настроен первичный ключ в ClickHouse, некоторые запросы неизбежно потребуют полного сканирования таблицы. Хотя это можно смягчить с помощью материализованных представлений (и проекций для некоторых запросов), они требуют дополнительного обслуживания, и пользователи должны знать об их наличии, чтобы обеспечить их использование. В то время как традиционные реляционные базы данных решают эту проблему с помощью вторичных индексов, они неэффективны в колоночных базах данных, таких как ClickHouse. Вместо этого ClickHouse использует индексы пропуска (Skip indexes), которые могут значительно улучшить производительность запросов, позволяя базе данных пропускать большие блоки данных без совпадающих значений.

Схемы OTel по умолчанию используют вторичные индексы в попытке ускорить доступ к картам (map). Хотя мы считаем их в целом неэффективными и не рекомендуем копировать их в вашу пользовательскую схему, индексы пропуска все же могут быть полезны.

Пользователям следует прочитать и понять [руководство по вторичным индексам](/optimize/skipping-indexes) перед попыткой их применения.

**В целом, они эффективны, когда существует сильная корреляция между первичным ключом и целевым непервичным столбцом/выражением, и пользователи ищут редкие значения, то есть те, которые не встречаются во многих гранулах.**

### Фильтры Блума для текстового поиска {#bloom-filters-for-text-search}


В запросах наблюдаемости вторичные индексы могут быть полезны, когда пользователям необходимо выполнять текстовый поиск. В частности, индексы bloom-фильтра [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) и [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) могут использоваться для ускорения поиска по столбцам типа String с операторами `LIKE`, `IN` и `hasToken`. Важно, что токен-ориентированный индекс генерирует токены, используя небуквенно-цифровые символы в качестве разделителя. Это означает, что во время выполнения запроса могут сопоставляться только токены (или целые слова). Для более детализированного сопоставления можно использовать [N-gram bloom filter](/optimize/skipping-indexes#bloom-filter-types). Он разбивает строки на ngram’ы заданного размера, что позволяет выполнять сопоставление частей слов.

Чтобы понять, какие токены будут сгенерированы и, следовательно, сопоставлены, можно использовать функцию `tokens`:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 строка в наборе. Затрачено: 0.008 сек.
```

Функция `ngram` предоставляет схожие возможности: размер n-граммы можно задать вторым параметром.

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

Получена 1 строка. Затрачено: 0,008 сек.
```

:::note Инвертированные индексы
В ClickHouse также есть экспериментальная поддержка инвертированных индексов в качестве вторичных индексов. В настоящее время мы не рекомендуем использовать их для наборов данных с логами, но ожидаем, что они заменят основанные на токенах bloom‑фильтры, когда будут готовы к использованию в продакшене.
:::

Для целей этого примера мы используем набор данных со структурированными логами. Предположим, мы хотим посчитать логи, в которых столбец `Referer` содержит `ultra`.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 строка в наборе. Затрачено: 0.177 сек. Обработано 10.37 млн строк, 908.49 МБ (58.57 млн строк/с., 5.13 ГБ/с.)
```

Здесь нам нужно использовать размер n-граммы 3. Поэтому мы создаем индекс `ngrambf_v1`.

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

Индекс `ngrambf_v1(3, 10000, 3, 7)` здесь принимает четыре параметра. Последний из них (значение 7) представляет собой seed. Остальные задают размер n‑gram (3), значение `m` (размер фильтра) и количество хеш‑функций `k` (7). `k` и `m` требуют настройки и зависят от количества уникальных n‑gram/токенов и вероятности того, что фильтр даст истинный отрицательный результат — тем самым подтверждая, что значение отсутствует в грануле. Мы рекомендуем воспользоваться [этими функциями](/engines/table-engines/mergetree-family/mergetree#bloom-filter), чтобы подобрать эти значения.


При корректной настройке прирост производительности может быть существенным:

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│   182   │
└─────────┘

1 строка в наборе. Прошло: 0.077 сек. Обработано 4.22 млн строк, 375.29 МБ (54.81 млн строк/сек., 4.87 ГБ/сек.)
Пиковое потребление памяти: 129.60 КиБ.
```

:::note Пример
Приведённое выше предназначено только для иллюстрации. Мы рекомендуем пользователям извлекать структуру из своих логов при вставке данных, а не пытаться оптимизировать текстовый поиск с помощью блум-фильтров на основе токенов. Тем не менее, существуют случаи, когда у пользователей есть stack trace или другие большие значения типа `String`, для которых текстовый поиск может быть полезен из-за менее детерминированной структуры.
:::

Некоторые общие рекомендации по использованию блум-фильтров:

Цель блум-фильтра — отфильтровать [гранулы](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), тем самым избегая необходимости загружать все значения столбца и выполнять линейное сканирование. Конструкция `EXPLAIN` с параметром `indexes=1` может быть использована для определения количества гранул, которые были пропущены. Ниже приведены результаты для исходной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с ngram-блум-фильтром.

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

Фильтр Блума обычно обеспечивает ускорение только в том случае, если он меньше самого столбца. Если он больше, выигрыш в производительности, скорее всего, будет пренебрежимо мал. Сравните размер фильтра с размером столбца с помощью следующих запросов:

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
```


┌─table───────────┬─compressed&#95;size─┬─uncompressed&#95;size─┐
│ otel&#95;logs&#95;bloom │ 12.03 MiB       │ 12.17 MiB         │
└─────────────────┴─────────────────┴───────────────────┘

1 строка в наборе. Прошло: 0.004 сек.

```

В приведенных выше примерах видно, что вторичный индекс bloom filter занимает 12 МБ — почти в 5 раз меньше сжатого размера самого столбца (56 МБ).

Bloom-фильтры могут требовать значительной настройки. Рекомендуем ознакомиться с примечаниями [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые помогут определить оптимальные параметры. Bloom-фильтры также могут быть ресурсоемкими при вставке и слиянии данных. Пользователям следует оценить влияние на производительность вставки перед добавлением bloom-фильтров в продакшен.

Дополнительные сведения о вторичных индексах пропуска можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).

### Извлечение данных из Map {#extracting-from-maps}

Тип Map широко используется в схемах OTel. Этот тип требует, чтобы значения и ключи имели одинаковый тип — этого достаточно для метаданных, таких как метки Kubernetes. Следует учитывать, что при запросе подключа типа Map загружается весь родительский столбец. Если в map много ключей, это может привести к значительному снижению производительности запроса, поскольку с диска потребуется прочитать больше данных, чем если бы ключ существовал как отдельный столбец.

Если вы часто запрашиваете определенный ключ, рассмотрите возможность его перемещения в отдельный выделенный столбец на корневом уровне. Обычно это делается в ответ на типичные шаблоны доступа после развертывания, и может быть сложно предсказать необходимость этого до продакшена. См. раздел [«Управление изменениями схемы»](/observability/managing-data#managing-schema-changes) о том, как изменить схему после развертывания.
```


## Измерение размера таблицы и сжатия {#measuring-table-size--compression}

Одной из основных причин использования ClickHouse для Observability является сжатие данных.

Помимо значительного снижения затрат на хранение, меньший объём данных на диске означает меньше операций ввода-вывода и более быстрое выполнение запросов и вставок. Снижение нагрузки на ввод-вывод перевешивает накладные расходы любого алгоритма сжатия с точки зрения использования процессора. Поэтому улучшение сжатия данных должно быть первоочередной задачей при работе над обеспечением быстрого выполнения запросов в ClickHouse.

Подробную информацию об измерении сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).
