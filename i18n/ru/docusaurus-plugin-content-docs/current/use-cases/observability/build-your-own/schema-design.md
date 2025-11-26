---
title: 'Проектирование схемы данных'
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

Мы рекомендуем пользователям всегда создавать собственную схему для логов и трейсов по следующим причинам:

- **Выбор первичного ключа** — стандартные схемы используют `ORDER BY`, оптимизированный под определённые паттерны доступа. Маловероятно, что ваши паттерны доступа будут с ними совпадать.
- **Извлечение структуры** — пользователи могут захотеть извлекать новые столбцы из существующих столбцов, например из столбца `Body`. Это можно сделать с помощью материализованных столбцов (и материализованных представлений в более сложных случаях). Для этого требуются изменения схемы.
- **Оптимизация Map** — стандартные схемы используют тип Map для хранения атрибутов. Эти столбцы позволяют хранить произвольные метаданные. Хотя это критически важная возможность (так как метаданные событий часто не определены заранее и иначе не могут быть сохранены в строго типизированной базе данных, такой как ClickHouse), доступ к ключам Map и их значениям менее эффективен, чем доступ к обычному столбцу. Мы решаем это, модифицируя схему и вынося наиболее часто используемые ключи Map в столбцы верхнего уровня — см. раздел ["Извлечение структуры с помощью SQL"](#extracting-structure-with-sql). Это требует изменения схемы.
- **Упрощение доступа к ключам Map** — доступ к ключам в Map требует более многословного синтаксиса. Пользователи могут компенсировать это с помощью алиасов. См. раздел ["Использование алиасов"](#using-aliases) для упрощения запросов.
- **Вторичные индексы** — стандартная схема использует вторичные индексы для ускорения доступа к Map и ускорения текстовых запросов. Обычно они не требуются и приводят к дополнительному расходу дискового пространства. Их можно использовать, но следует протестировать, чтобы убедиться в их необходимости. См. ["Вторичные / Data Skipping индексы"](#secondarydata-skipping-indices).
- **Использование Codecs** — пользователи могут захотеть настроить кодеки для столбцов, если они понимают ожидаемые данные и имеют подтверждение, что это улучшает сжатие.

_Ниже мы подробно описываем каждый из перечисленных выше сценариев использования._

**Важно:** хотя пользователям и рекомендуется расширять и изменять свою схему для достижения оптимального сжатия и производительности запросов, по возможности им следует придерживаться схемы именования OTel для основных столбцов. Плагин ClickHouse Grafana предполагает наличие некоторых базовых столбцов OTel для облегчения построения запросов, например Timestamp и SeverityText. Требуемые столбцы для логов и трейсов задокументированы здесь [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) соответственно. Вы можете изменить имена этих столбцов, переопределив значения по умолчанию в конфигурации плагина.



## Извлечение структуры с помощью SQL

При приёме как структурированных, так и неструктурированных логов пользователям часто требуется возможность:

* **Извлекать столбцы из строковых blob-ов**. Запросы к ним будут выполняться быстрее, чем использование строковых операций на этапе выполнения запроса.
* **Извлекать ключи из map-ов**. Схема по умолчанию помещает произвольные атрибуты в столбцы типа Map. Этот тип обеспечивает возможность работы без предопределённой схемы и имеет то преимущество, что пользователям не нужно заранее определять столбцы для атрибутов при описании логов и трассировок — часто это невозможно при сборе логов из Kubernetes и необходимости гарантировать, что метки подов сохраняются для последующего поиска. Доступ к ключам map-а и их значениям медленнее, чем выполнение запросов по обычным столбцам ClickHouse. Поэтому извлечение ключей из map-ов в корневые столбцы таблицы часто является предпочтительным.

Рассмотрим следующие запросы:

Предположим, мы хотим посчитать, какие URL-пути получают больше всего POST-запросов, используя структурированные логи. JSON blob хранится в столбце `Body` как String. Дополнительно он может также храниться в столбце `LogAttributes` как `Map(String, String)`, если пользователь включил json&#95;parser в коллекторе.

```sql
SELECT LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Строка 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
LogAttributes: {'status':'200','log.file.name':'access-structured.log','request_protocol':'HTTP/1.1','run_time':'0','time_local':'2019-01-22 00:26:14.000','size':'30577','user_agent':'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)','referer':'-','remote_user':'-','request_type':'GET','request_path':'/filter/27|13 ,27|  5 ,p53','remote_addr':'54.36.149.41'}
```

Предположим, что `LogAttributes` доступен; тогда запрос для подсчёта того, какие URL‑пути сайта получают больше всего POST‑запросов:

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

Получено 5 строк. Прошло: 0.735 сек. Обработано 10.36 млн строк, 4.65 ГБ (14.10 млн строк/с., 6.32 ГБ/с.)
Пиковое использование памяти: 153.71 МиБ.
```

Обратите внимание на использование синтаксиса отображения (map) здесь, например `LogAttributes['request_path']`, а также на функцию [`path`](/sql-reference/functions/url-functions#path) для отбрасывания параметров запроса из URL.

Если пользователь не включил разбор JSON в коллекторе, то `LogAttributes` будет пустым, поэтому нам придется использовать [JSON-функции](/sql-reference/functions/json-functions) для извлечения столбцов из строки `Body`.

:::note Предпочитайте ClickHouse для разбора
В общем случае мы рекомендуем выполнять разбор JSON структурированных логов в ClickHouse. Мы уверены, что ClickHouse обладает самой быстрой реализацией разбора JSON. Однако мы понимаем, что пользователи могут захотеть отправлять логи в другие системы и не реализовывать эту логику в SQL.
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
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 строк в наборе. Затрачено: 0.668 сек. Обработано 10.37 миллионов строк, 5.13 ГБ (15.52 миллионов строк/с., 7.68 ГБ/с.)
Пиковое потребление памяти: 172.30 МиБ.

````

Теперь рассмотрим то же самое для неструктурированных логов:

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

Аналогичный запрос для работы с неструктурированными логами требует использования регулярных выражений с функцией `extractAllGroupsVertical`.

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

Повышенная сложность и стоимость запросов для разбора неструктурированных логов (обратите внимание на разницу в производительности) — причина, по которой мы рекомендуем по возможности всегда использовать структурированные логи.

:::note Рассмотрите словари
Приведённый выше запрос можно оптимизировать, используя словари с регулярными выражениями. Подробности см. в разделе [Использование словарей](#using-dictionaries).
:::

Оба этих варианта использования могут быть реализованы в ClickHouse за счёт переноса указанной выше логики запросов на момент вставки данных. Ниже мы рассмотрим несколько подходов и отметим, когда каждый из них уместен.

:::note OTel или ClickHouse для обработки?
Пользователи также могут выполнять обработку с помощью процессоров и операторов OTel collector, как описано [здесь](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching). В большинстве случаев ClickHouse окажется значительно более эффективным по ресурсам и быстрым, чем процессоры коллектора. Основной недостаток выполнения всей обработки событий на SQL — жёсткая привязка решения к ClickHouse. Например, пользователи могут захотеть отправлять обработанные логи из OTel collector в другие системы, например в S3.
:::

### Материализованные столбцы

Материализованные столбцы предоставляют самое простое решение для извлечения структуры из других столбцов. Значения таких столбцов всегда вычисляются в момент вставки и не могут быть заданы явно в запросах INSERT.

:::note Накладные расходы
Материализованные столбцы приводят к дополнительным затратам на хранение, поскольку значения при вставке извлекаются в новые столбцы на диске.
:::

Материализованные столбцы поддерживают любые выражения ClickHouse и могут использовать любые аналитические функции для [обработки строк](/sql-reference/functions/string-functions) (включая [регулярные выражения и поиск](/sql-reference/functions/string-search-functions)) и [URL](/sql-reference/functions/url-functions), выполнения [преобразований типов](/sql-reference/functions/type-conversion-functions), [извлечения значений из JSON](/sql-reference/functions/json-functions) или [математических операций](/sql-reference/functions/math-functions).

Мы рекомендуем материализованные столбцы для базовой обработки. Они особенно полезны для извлечения значений из отображений (map), их «подъёма» в корневые столбцы и выполнения преобразований типов. Чаще всего они наиболее полезны в очень простых схемах или в сочетании с материализованными представлениями. Рассмотрим следующую схему для логов, в которой JSON был извлечён коллектором в столбец `LogAttributes`:


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

Наши три материализованных столбца извлекают запрашиваемую страницу, тип запроса и домен реферера. Они получают доступ к ключам карты и применяют функции к их значениям. Наш последующий запрос выполняется значительно быстрее:

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
Материализованные столбцы по умолчанию не возвращаются в результате запроса `SELECT *`. Это сделано для сохранения инварианта, согласно которому результат `SELECT *` всегда может быть вставлен обратно в таблицу с помощью `INSERT`. Это поведение можно отключить, установив `asterisk_include_materialized_columns=1`, а также включить в Grafana (см. `Additional Settings -> Custom Settings` в конфигурации источника данных).
:::


## Материализованные представления

[Материализованные представления](/materialized-views) предоставляют более мощный способ применения SQL-фильтрации и трансформаций к логам и трейсам.

Материализованные представления позволяют перенести вычислительную нагрузку с времени выполнения запроса на время вставки данных. Материализованное представление ClickHouse — это по сути триггер, который выполняет запрос над блоками данных по мере их вставки в таблицу. Результаты этого запроса вставляются во вторую, «целевую» таблицу.

<Image img={observability_10} alt="Materialized view" size="md" />

:::note Обновления в реальном времени
Материализованные представления в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на основе которой они построены, и функционируют скорее как непрерывно обновляемые индексы. В отличие от них, в других базах данных материализованные представления обычно являются статичными снимками результата запроса, которые необходимо периодически обновлять (аналогично ClickHouse Refreshable Materialized Views).
:::

Связанный с материализованным представлением запрос теоретически может быть любым, включая агрегирующий запрос, хотя [существуют ограничения при использовании Joins](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для задач трансформации и фильтрации, необходимых для логов и трейсов, можно считать возможным любой запрос `SELECT`.

Пользователям следует помнить, что этот запрос — всего лишь триггер, выполняющийся над строками, вставляемыми в таблицу (исходную таблицу), а результаты отправляются в новую таблицу (целевую таблицу).

Чтобы гарантировать, что мы не будем сохранять данные дважды (в исходной и целевой таблицах), мы можем изменить движок исходной таблицы на [табличный движок Null](/engines/table-engines/special/null), сохранив исходную схему. Наши коллекторы OTel продолжат отправлять данные в эту таблицу. Например, для логов таблица `otel_logs` становится:

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

Движок таблицы Null — это мощная оптимизация; его можно рассматривать как `/dev/null`. Эта таблица не будет хранить никаких данных, но любые присоединённые материализованные представления всё равно будут выполняться для вставленных строк перед их удалением.

Рассмотрим следующий запрос. Он преобразует наши строки в формат, который мы хотим сохранить, извлекая все столбцы из `LogAttributes` (мы предполагаем, что они были заданы коллектором с использованием оператора `json_parser`) и устанавливая `SeverityText` и `SeverityNumber` (на основе некоторых простых условий и определения [этих столбцов](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В этом случае мы также выбираем только те столбцы, которые, как мы знаем, будут иметь значения, — игнорируя такие столбцы, как `TraceId`, `SpanId` и `TraceFlags`.


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

Получена 1 строка. Затрачено: 0.027 сек.
```

Мы также извлекаем столбец `Body`, показанный выше — на случай, если позже будут добавлены дополнительные атрибуты, которые не извлекаются нашим SQL. Этот столбец будет хорошо сжиматься в ClickHouse и к нему будут редко обращаться, поэтому он не повлияет на производительность запросов. Наконец, мы приводим Timestamp к типу DateTime (для экономии места — см. [&quot;Оптимизация типов&quot;](#optimizing-types)) с помощью `CAST`.

:::note Условные выражения
Обратите внимание на использование [условных выражений](/sql-reference/functions/conditional-functions) выше для извлечения `SeverityText` и `SeverityNumber`. Они чрезвычайно полезны для формулирования сложных условий и проверки, установлены ли значения в map-структурах — мы наивно предполагаем, что в `LogAttributes` присутствуют все ключи. Рекомендуем пользователям внимательно с ними ознакомиться — это ваши помощники при разборе логов, в дополнение к функциям для обработки [значений null](/sql-reference/functions/functions-for-nulls)!
:::

Нам требуется таблица для приема этих результатов. Целевая таблица ниже соответствует приведенному выше запросу:

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
Обратите внимание, насколько сильно мы изменили нашу схему. На практике у пользователей, скорее всего, также будут столбцы трассировок, которые им нужно сохранить, а также столбец `ResourceAttributes` (он обычно содержит метаданные Kubernetes). Grafana может использовать столбцы трассировок, чтобы обеспечивать связывание между логами и трассировками — см. [&quot;Using Grafana&quot;](/observability/grafana).
:::


Ниже мы создаём материализованное представление `otel_logs_mv`, которое выполняет приведённый выше оператор SELECT для таблицы `otel_logs` и записывает результаты в `otel_logs_v2`.

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

Все это наглядно показано ниже:

<Image img={observability_11} alt="Материализованное представление OTel" size="md" />

Если теперь перезапустить конфигурацию коллектора, используемую в разделе [&quot;Экспорт в ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse), данные появятся в `otel_logs_v2` в необходимом нам формате. Обратите внимание на использование типизированных функций извлечения JSON.

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

1 строка. Затрачено: 0.010 сек.
```

Эквивалентное материализованное представление, использующее извлечение столбцов из столбца `Body` с помощью JSON-функций, показано ниже:


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

### Осторожно с типами

Приведённые выше материализованные представления полагаются на неявное приведение типов — особенно при использовании map `LogAttributes`. ClickHouse зачастую прозрачно приводит извлечённое значение к типу целевой таблицы, сокращая необходимый объём синтаксиса. Однако мы рекомендуем всегда тестировать такие представления, выполняя `SELECT`‑выражение представления вместе с оператором [`INSERT INTO`](/sql-reference/statements/insert-into) в целевую таблицу с тем же самым схемой. Это позволит убедиться, что типы обрабатываются корректно. Особое внимание следует уделить следующим случаям:

* Если ключ не существует в map, будет возвращена пустая строка. В случае числовых значений пользователям необходимо подставить вместо неё подходящее значение. Это можно сделать с помощью [условных выражений](/sql-reference/functions/conditional-functions), например `if(LogAttributes['status'] = '', 200, LogAttributes['status'])`, или [функций приведения типов](/sql-reference/functions/type-conversion-functions), если вас устраивают значения по умолчанию, например `toUInt8OrDefault(LogAttributes['status'])`.
* Некоторые типы не всегда будут приводиться, например строковые представления чисел не будут приводиться к значениям enum.
* Функции извлечения из JSON возвращают значения по умолчанию для своего типа, если значение не найдено. Убедитесь, что эти значения вам подходят.

:::note Избегайте Nullable
Избегайте использования [Nullable](/sql-reference/data-types/nullable) в ClickHouse для данных наблюдаемости. В логах и трейcах редко требуется различать пустое значение и null. Эта функциональность создаёт дополнительный расход хранилища и отрицательно сказывается на производительности запросов. См. [здесь](/data-modeling/schema-design#optimizing-types) для более подробной информации.
:::


## Выбор первичного (упорядочивающего) ключа {#choosing-a-primary-ordering-key}

После того как вы извлекли нужные столбцы, можно приступать к оптимизации упорядочивающего/первичного ключа.

Для выбора упорядочивающего ключа можно применить несколько простых правил. Иногда они могут конфликтовать между собой, поэтому рассматривайте их по порядку. Пользователи могут определить несколько ключей этим способом; как правило, достаточно 4–5:

1. Выберите столбцы, которые соответствуют вашим типичным фильтрам и шаблонам доступа. Если пользователи обычно начинают расследования, связанные с наблюдаемостью, с фильтрации по какому‑то конкретному столбцу, например имени пода, этот столбец будет часто использоваться в выражениях `WHERE`. Отдавайте приоритет включению таких столбцов в ключ по сравнению с теми, которые используются реже.
2. Предпочитайте столбцы, которые при фильтрации помогают исключить большой процент всех строк, тем самым уменьшая объем данных для чтения. Имена сервисов и коды статусов часто являются хорошими кандидатами — во втором случае только если пользователи фильтруют по значениям, которые исключают большинство строк; например, фильтрация по 200‑м в большинстве систем будет соответствовать большинству строк, тогда как ошибки 500 будут соответствовать лишь небольшой подвыборке.
3. Предпочитайте столбцы, которые, вероятно, будут сильно коррелировать с другими столбцами в таблице. Это поможет обеспечить их смежное хранение, улучшая степень сжатия.
4. Операции `GROUP BY` и `ORDER BY` для столбцов в упорядочивающем ключе могут выполняться более эффективно с точки зрения потребления памяти.

<br />

После определения подмножества столбцов для упорядочивающего ключа их необходимо объявить в определенном порядке. Этот порядок может существенно влиять как на эффективность фильтрации по столбцам вторичного ключа в запросах, так и на коэффициент сжатия файлов данных таблицы. В общих чертах **лучше всего упорядочить ключи в порядке возрастания их кардинальности**. Это следует сбалансировать с тем фактом, что фильтрация по столбцам, которые находятся позже в упорядочивающем ключе, будет менее эффективной, чем по тем, которые идут раньше в кортеже. Сбалансируйте эти эффекты и учитывайте ваши шаблоны доступа. И самое важное — тестируйте варианты. Для более глубокого понимания упорядочивающих ключей и способов их оптимизации мы рекомендуем [эту статью](/guides/best-practices/sparse-primary-indexes).

:::note Сначала — структура
Мы рекомендуем определять упорядочивающие ключи после того, как вы структурировали логи. Не используйте ключи в картах атрибутов в качестве упорядочивающего ключа или выражения извлечения из JSON. Убедитесь, что ваши упорядочивающие ключи представлены корневыми столбцами в таблице.
:::



## Использование maps

В более ранних примерах показано использование синтаксиса map `map['key']` для доступа к значениям в столбцах типа `Map(String, String)`. Помимо обращения к вложенным ключам через нотацию map, для фильтрации или отбора таких столбцов доступны специализированные [функции работы с map](/sql-reference/functions/tuple-map-functions#mapkeys) ClickHouse.

Например, следующий запрос определяет все уникальные ключи, доступные в столбце `LogAttributes`, с помощью [функции `mapKeys`](/sql-reference/functions/tuple-map-functions#mapkeys), а затем [функции `groupArrayDistinctArray`](/sql-reference/aggregate-functions/combinators) (комбинатор).

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
Мы не рекомендуем использовать точки в именах столбцов `Map`, и в будущем их поддержка может быть прекращена. Используйте `_`.
:::


## Использование псевдонимов

Выполнение запросов к столбцам типа `Map` медленнее, чем к обычным столбцам — см. «[Ускорение запросов](#accelerating-queries)». Кроме того, синтаксис таких запросов более сложен и может быть неудобен для пользователей. Чтобы решить именно эту проблему, мы рекомендуем использовать столбцы типа `ALIAS`.

Столбцы `ALIAS` вычисляются во время выполнения запроса и не хранятся в таблице. Поэтому невозможно выполнить `INSERT` значения в столбец этого типа. Используя псевдонимы, мы можем ссылаться на ключи `Map` и упростить синтаксис, прозрачно отображая элементы `Map` как обычные столбцы. Рассмотрим следующий пример:

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

У нас есть несколько материализованных столбцов и столбец `ALIAS` `RemoteAddr`, который ссылается на карту `LogAttributes`. Теперь мы можем запрашивать значения `LogAttributes['remote_addr']` через этот столбец, тем самым упрощая наш запрос, например:

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

:::note Псевдонимы исключаются по умолчанию
По умолчанию `SELECT *` исключает столбцы-алиасы (ALIAS). Это поведение можно отключить, установив `asterisk_include_alias_columns=1`.
:::


## Оптимизация типов {#optimizing-types}

[Общие рекомендации по работе с ClickHouse](/data-modeling/schema-design#optimizing-types) для оптимизации типов применимы и к данному сценарию использования ClickHouse.



## Использование кодеков {#using-codecs}

Помимо оптимизации типов, пользователи могут следовать [общим рекомендациям по использованию кодеков](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) при оптимизации сжатия для схем ClickHouse Observability.

В целом пользователи обнаружат, что кодек `ZSTD` хорошо подходит для наборов данных логов и трассировок. Увеличение уровня сжатия относительно значения по умолчанию (1) может улучшить степень сжатия. Однако это следует протестировать, так как более высокие значения приводят к большему потреблению процессорных ресурсов во время вставки. Как правило, мы наблюдаем незначительный выигрыш при увеличении этого значения.

Кроме того, отметки времени, хотя и выигрывают от дельта-кодирования с точки зрения сжатия, как показывает практика, могут вызывать снижение производительности запросов, если этот столбец используется в первичном ключе или ключе сортировки. Мы рекомендуем пользователям оценить соответствующие компромиссы между сжатием и производительностью запросов.



## Использование словарей

[Словари](/sql-reference/dictionaries) — это [ключевая функция](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) ClickHouse, обеспечивающая хранящееся в памяти (in-memory) [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) представление данных из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources), оптимизированное для высокоскоростных запросов с минимальными задержками при поиске по ключу.

<Image img={observability_12} alt="Observability and dictionaries" size="md" />

Это полезно в различных сценариях — от обогащения данных при приёме на лету без замедления процесса ингестии до общего повышения производительности запросов, где особенно выигрывают операции JOIN.
Хотя операции JOIN редко требуются в сценариях наблюдаемости, словари по-прежнему могут быть полезны для обогащения как на этапе вставки, так и на этапе выполнения запроса. Ниже мы приводим примеры обоих подходов.

:::note Ускорение JOIN&#39;ов
Пользователи, заинтересованные в ускорении операций JOIN с помощью словарей, могут найти дополнительные сведения [здесь](/dictionary).
:::

### Время вставки и время выполнения запроса

Словари можно использовать для обогащения наборов данных во время выполнения запроса или во время вставки. У каждого из этих подходов есть свои плюсы и минусы. Вкратце:

* **Время вставки** — как правило, уместно, если значение для обогащения не меняется и существует во внешнем источнике, который может быть использован для заполнения словаря. В этом случае обогащение строки во время вставки позволяет избежать обращения к словарю во время выполнения запроса. Это достигается ценой снижения производительности вставки, а также дополнительными затратами на хранение, поскольку обогащённые значения будут сохраняться как столбцы.
* **Время выполнения запроса** — если значения в словаре часто меняются, обогащение при выполнении запроса часто предпочтительно. Это позволяет избежать обновления столбцов (и перезаписи данных) при изменении сопоставленных значений. Такая гибкость достигается ценой стоимости поиска во время выполнения запроса. Эта стоимость обычно заметна, если требуется большое количество обращений, например при использовании поиска по словарю в выражении `WHERE`. Для обогащения результата, то есть в `SELECT`, эти накладные расходы обычно несущественны.

Мы рекомендуем пользователям ознакомиться с основами работы со словарями. Словари предоставляют хранящуюся в памяти таблицу соответствий, из которой значения могут быть получены с помощью [специализированных функций](/sql-reference/functions/ext-dict-functions#dictgetall).

Простые примеры обогащения см. в руководстве по словарям [здесь](/dictionary). Ниже мы сосредоточимся на типичных задачах обогащения в области наблюдаемости.

### Использование IP-словарей

Геообогащение логов и трассировок значениями широты и долготы по IP-адресам — распространённое требование в задачах наблюдаемости. Это можно реализовать с помощью структурированного словаря `ip_trie`.

Мы используем общедоступный [DB-IP city-level dataset](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставленный [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [файла readme](https://github.com/sapics/ip-location-db#csv-format) видно, что данные имеют следующую структуру:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

Исходя из этой структуры, сначала посмотрим на данные с помощью табличной функции [url()](/sql-reference/table-functions/url):

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

Чтобы упростить себе жизнь, давайте воспользуемся табличным движком [`URL()`](/engines/table-engines/special/url), чтобы создать объект таблицы ClickHouse с нашими именами полей и подтвердить общее количество строк:


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

Поскольку наш словарь `ip_trie` требует, чтобы диапазоны IP-адресов были выражены в CIDR-нотации, нам нужно будет преобразовать `ip_range_start` и `ip_range_end`.

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
В приведённом выше запросе происходит немало всего. Тем, кому интересно, стоит прочитать это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). Иначе просто примите как данность, что этот запрос вычисляет CIDR для диапазона IP.
:::

Для наших целей нам нужны только IP-диапазон, код страны и координаты, поэтому давайте создадим новую таблицу и вставим наши данные GeoIP:

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

Для выполнения IP‑поисков с низкой задержкой в ClickHouse мы будем использовать словари для хранения в памяти сопоставления ключей с атрибутами для наших GeoIP‑данных. ClickHouse предоставляет структуру словаря `ip_trie` ([dictionary structure](/sql-reference/dictionaries#ip_trie)) для сопоставления наших сетевых префиксов (CIDR-блоков) с координатами и кодами стран. Следующий запрос определяет словарь с такой структурой и использует приведённую выше таблицу в качестве источника.

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

Мы можем выбрать строки из словаря и убедиться, что этот набор данных доступен для поиска:

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
Словари в ClickHouse периодически обновляются на основе данных базовой таблицы и указанного выше параметра lifetime. Чтобы обновить словарь Geo IP для отражения последних изменений в наборе данных DB-IP, необходимо повторно вставить данные из удалённой таблицы geoip_url в таблицу `geoip` с применением преобразований.
:::

Теперь, когда данные Geo IP загружены в словарь `ip_trie` (который также удобно назван `ip_trie`), его можно использовать для геолокации IP-адресов. Это выполняется с помощью [функции `dictGet()`](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
````

Обратите внимание на скорость выборки данных. Это позволяет нам обогащать логи. В данном случае мы выбираем **выполнять обогащение на этапе выполнения запроса**.

Возвращаясь к нашему исходному набору логов, мы можем использовать вышеописанный подход, чтобы агрегировать логи по странам. Далее предполагается, что мы используем схему, полученную из нашего предыдущего материализованного представления, в которой есть извлечённый столбец `RemoteAddress`.

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

Получено 5 строк. Время выполнения: 0.140 сек. Обработано 20.73 млн строк, 82.92 МБ (147.79 млн строк/с., 591.16 МБ/с.)
Пиковое потребление памяти: 1.16 МиБ.
```

Поскольку сопоставление IP с географическим местоположением может меняться, пользователям, скорее всего, важнее знать, откуда пришёл запрос в момент его выполнения, а не каково текущее географическое местоположение для того же адреса. По этой причине здесь, скорее всего, предпочтительно обогащение на этапе индексирования. Это можно сделать с помощью материализованных столбцов, как показано ниже, или в операторе `SELECT` материализованного представления:

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
Пользователям, вероятно, потребуется, чтобы словарь обогащения по IP периодически обновлялся на основе новых данных. Это можно реализовать с помощью клаузы `LIFETIME` словаря, которая обеспечивает его периодическую перезагрузку из базовой таблицы. Для обновления базовой таблицы см. [&quot;Refreshable Materialized views&quot;](/materialized-view/refreshable-materialized-view).
:::

Приведённые выше страны и координаты обеспечивают возможности визуализации, выходящие за рамки группировки и фильтрации по стране. Для вдохновения см. [&quot;Visualizing geo data&quot;](/observability/grafana#visualizing-geo-data).

### Использование regex-словарей (разбор user agent)

Разбор [строк user agent](https://en.wikipedia.org/wiki/User_agent) — классическая задача на регулярные выражения и типовое требование для наборов данных на основе логов и трейсов. ClickHouse предоставляет эффективные средства разбора user agent с использованием словарей на основе дерева регулярных выражений (Regular Expression Tree Dictionaries).

Словари на основе дерева регулярных выражений определяются в ClickHouse open-source с использованием типа источника словаря YAMLRegExpTree, который указывает путь к YAML-файлу, содержащему дерево регулярных выражений. Если вы хотите использовать собственный словарь регулярных выражений, подробности необходимой структуры можно найти [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source). Ниже мы сосредоточимся на разборе user agent с использованием [uap-core](https://github.com/ua-parser/uap-core) и загрузим наш словарь для поддерживаемого формата CSV. Этот подход совместим с OSS и ClickHouse Cloud.

:::note
В примерах ниже мы используем снимки последних регулярных выражений uap-core для разбора user agent по состоянию на июнь 2024 года. Актуальный файл, который время от времени обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Пользователи могут выполнить шаги, указанные [здесь](/sql-reference/dictionaries#collecting-attribute-values), чтобы загрузить данные в CSV-файл, используемый ниже.
:::

Создайте следующие таблицы типа Memory. Они будут хранить наши регулярные выражения для разбора устройств, браузеров и операционных систем.

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

Эти таблицы можно заполнить из следующих публично размещённых CSV‑файлов с помощью табличной функции `url`:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

После заполнения таблиц в памяти мы можем загрузить словари регулярных выражений. Обратите внимание, что нам нужно указать значения ключей в виде столбцов — это будут атрибуты, которые мы сможем извлекать из User-Agent.

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


После загрузки этих словарей мы можем передать пример user-agent и протестировать новые возможности по извлечению данных из словарей:

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

Учитывая, что правила, связанные с user agent, редко меняются и обновлять словарь нужно только при появлении новых браузеров, операционных систем и устройств, имеет смысл выполнять это извлечение во время вставки данных.

Мы можем выполнять эту операцию либо с помощью материализованного столбца, либо с помощью материализованного представления. Ниже мы модифицируем материализованное представление, использованное ранее:

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

После перезапуска коллектора и начала приёма структурированных логов в соответствии с ранее описанными шагами мы можем выполнять запросы к недавно извлечённым столбцам Device, Browser и OS.


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
Обратите внимание на использование кортежей (Tuples) для этих столбцов user agent. Кортежи рекомендуется использовать для сложных структур, иерархия которых известна заранее. Подстолбцы обеспечивают ту же производительность, что и обычные столбцы (в отличие от ключей Map), при этом позволяют использовать разнотипные данные.
:::

### Дополнительные материалы

Для дополнительных примеров и подробной информации по словарям рекомендуем следующие статьи:

* [Расширенные темы по словарям](/dictionary#advanced-dictionary-topics)
* [&quot;Использование словарей для ускорения запросов&quot;](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
* [Словари](/sql-reference/dictionaries)


## Ускорение запросов

ClickHouse поддерживает ряд методов для ускорения выполнения запросов. К следующим вариантам следует переходить только после выбора подходящего первичного/упорядочивающего ключа, оптимизированного под наиболее распространённые паттерны доступа и максимальное сжатие. Обычно именно это оказывает наибольшее влияние на производительность при наименьших затратах усилий.

### Использование материализованных представлений (инкрементально) для агрегаций

В предыдущих разделах мы рассмотрели использование материализованных представлений для преобразования и фильтрации данных. Однако материализованные представления также могут использоваться для предварительного вычисления агрегаций на этапе вставки и сохранения результата. Этот результат может обновляться на основе последующих вставок, что по сути позволяет выполнять агрегацию заранее — во время вставки данных.

Основная идея заключается в том, что результаты часто представляют собой более компактное представление исходных данных (частичный sketch в случае агрегаций). В сочетании с более простым запросом для чтения результатов из целевой таблицы время выполнения запроса будет меньше, чем при выполнении тех же вычислений над исходными данными.

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

Мы можем представить, что это типичная линейная диаграмма, которую пользователи строят в Grafana. Этот запрос, надо признать, очень быстрый — набор данных содержит всего 10 млн строк, и ClickHouse сам по себе очень быстр. Однако, если мы масштабируем объём данных до миллиардов и триллионов строк, нам хотелось бы сохранить такую производительность запросов.

:::note
Этот запрос был бы в 10 раз быстрее, если бы мы использовали таблицу `otel_logs_v2`, которая является результатом нашего более раннего материализованного представления и извлекает ключ `size` из отображения `LogAttributes`. Здесь мы используем «сырые» данные только в иллюстративных целях и рекомендуем использовать более раннее представление, если это типичный запрос.
:::

Нам нужна таблица для записи результатов, если мы хотим выполнять эти вычисления во время вставки с использованием материализованного представления. Эта таблица должна хранить только одну строку в час. Если для существующего часа поступает обновление, другие столбцы должны быть объединены с уже существующей строкой для этого часа. Чтобы это слияние инкрементальных состояний происходило, для других столбцов должны храниться частичные состояния.

Для этого требуется специальный тип движка таблицы в ClickHouse: SummingMergeTree. Он заменяет все строки с одним и тем же ключом сортировки одной строкой, которая содержит суммы значений для числовых столбцов. Следующая таблица будет объединять любые строки с одинаковой датой, суммируя все числовые столбцы.

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Чтобы продемонстрировать материализованное представление, предположим, что таблица `bytes_per_hour` пуста и еще не содержит данных. Материализованное представление выполняет указанный выше `SELECT` для данных, вставляемых в `otel_logs` (операция выполняется по блокам заданного размера), а результаты записываются в `bytes_per_hour`. Синтаксис приведен ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Ключевым здесь является оператор `TO` — он указывает, куда будут отправляться результаты, то есть в таблицу `bytes_per_hour`.

Если мы перезапустим наш OTel collector и повторно отправим логи, таблица `bytes_per_hour` будет по мере выполнения постепенно заполняться результатами приведённого выше запроса. По завершении мы можем убедиться в содержимом `bytes_per_hour` — у нас должна быть 1 строка на каждый час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL
```


┌─count()─┐
│     113 │
└─────────┘

1 строка в выборке. Прошло: 0.039 сек.

````

Мы эффективно сократили количество строк с 10 млн (в `otel_logs`) до 113, сохранив результат запроса. Ключевой момент заключается в том, что при добавлении новых логов в таблицу `otel_logs` новые значения будут отправлены в `bytes_per_hour` для соответствующего часа, где они будут автоматически объединены асинхронно в фоновом режиме — сохраняя только одну строку на час, таблица `bytes_per_hour` всегда будет компактной и актуальной.

Поскольку объединение строк происходит асинхронно, при выполнении запроса может существовать более одной строки на час. Чтобы гарантировать объединение всех ожидающих обработки строк во время выполнения запроса, существует два варианта:

- Использовать [модификатор `FINAL`](/sql-reference/statements/select/from#final-modifier) для имени таблицы (как мы сделали в запросе подсчёта выше).
- Агрегировать по ключу сортировки, используемому в итоговой таблице, то есть по Timestamp, и суммировать метрики.

Как правило, второй вариант более эффективен и гибок (таблицу можно использовать для других целей), но первый может быть проще для некоторых запросов. Ниже показаны оба варианта:

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

Получено 5 строк. Затрачено: 0,008 сек.

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

Получено 5 строк. Затрачено: 0,005 сек.
````

Это ускорило наш запрос с 0,6 с до 0,008 с — более чем в 75 раз!

:::note
Экономия времени может быть ещё больше на более крупных наборах данных с более сложными запросами. См. примеры [здесь](https://github.com/ClickHouse/clickpy).
:::

#### Более сложный пример

Приведённый выше пример выполняет простую почасовую агрегацию количества с помощью [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Для статистики, выходящей за рамки простых сумм, требуется другой целевой движок таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

Предположим, мы хотим вычислить количество уникальных IP-адресов (или уникальных пользователей) за день. Запрос для этого:

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

Для сохранения счётчика кардинальности при инкрементальных обновлениях необходимо использовать AggregatingMergeTree.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```


Чтобы ClickHouse знал, что будут храниться агрегатные состояния, мы определяем столбец `UniqueUsers` как тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая агрегатную функцию — источник частичных состояний (uniq) и тип исходного столбца (IPv4). Аналогично SummingMergeTree, строки с одинаковым значением ключа `ORDER BY` будут объединяться (Hour в приведённом выше примере).

Связанное материализованное представление использует приведённый выше запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, что мы добавляем суффикс `State` в конец имени наших агрегатных функций. Это гарантирует, что будет возвращено состояние агрегации функции, а не окончательный результат. Оно будет содержать дополнительную информацию, позволяющую этому частичному состоянию объединяться с другими состояниями.

После повторной загрузки данных через перезапуск коллектора мы можем убедиться, что в таблице `unique_visitors_per_hour` доступно 113 строк.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 строка в наборе. Прошло: 0.009 сек.
```

Наш итоговый запрос должен использовать суффикс Merge для наших функций (так как столбцы хранят состояния частичной агрегации):

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │      4763   │
│ 2019-01-22 00:00:00 │      536    │
└─────────────────────┴─────────────┘

Получено 113 строк. Затрачено: 0.027 сек.
```

Обратите внимание, что здесь мы используем `GROUP BY` вместо `FINAL`.

### Использование материализованных представлений (инкрементальных) для быстрых выборок

Пользователям следует учитывать свои паттерны доступа при выборе ключа сортировки ClickHouse с колонками, которые часто используются в условиях фильтрации и агрегации. Это может быть ограничивающим в сценариях Observability, где у пользователей более разнообразные паттерны доступа, которые нельзя выразить единым набором колонок. Лучше всего это иллюстрируется на примере, встроенном в стандартные схемы OTel. Рассмотрим стандартную схему для trace-данных:


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

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. При трассировке пользователям также нужна возможность выполнять поиск по конкретному `TraceId` и получать спаны, относящиеся к этому трейсу. Хотя это поле присутствует в ключе сортировки, его положение в конце означает, что [фильтрация будет менее эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) и, вероятно, приведёт к необходимости сканировать значительные объёмы данных при выборке одного трейса.

OTel collector также устанавливает материализованное представление и связанную таблицу, чтобы решить эту проблему. Таблица и представление показаны ниже:

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

Представление фактически гарантирует, что в таблице `otel_traces_trace_id_ts` хранятся минимальная и максимальная метки времени для трассы. Эта таблица, упорядоченная по `TraceId`, позволяет эффективно получать эти метки времени. В свою очередь, эти диапазоны меток времени можно использовать при выполнении запросов к основной таблице `otel_traces`. А именно, при получении трассы по её идентификатору Grafana использует следующий запрос:


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

CTE здесь определяет минимальную и максимальную метки времени для trace id `ae9226c78d1d360601e6383928e4d22d`, после чего эти значения используются для фильтрации основной таблицы `otel_traces` по связанным span’ам.

Тот же подход может быть применён и к другим шаблонам доступа. Аналогичный пример рассматривается в разделе моделирования данных [здесь](/materialized-view/incremental-materialized-view#lookup-table).

### Использование проекций (projections)

Проекции (projections) в ClickHouse позволяют пользователям задавать несколько выражений `ORDER BY` для одной таблицы.

В предыдущих разделах мы рассмотрели, как материализованные представления могут использоваться в ClickHouse для предварительного вычисления агрегатов, преобразования строк и оптимизации запросов наблюдаемости (Observability) для разных шаблонов доступа.

Мы привели пример, где материализованное представление отправляет строки в целевую таблицу с иным ключом сортировки, чем у исходной таблицы, принимающей вставки, чтобы оптимизировать выборки по trace id.

Проекции можно использовать для решения той же задачи, позволяя пользователю оптимизировать запросы по столбцу, который не входит в первичный ключ.

Теоретически эта возможность может быть использована для задания нескольких ключей сортировки для одной таблицы, но с одним существенным недостатком: дублирование данных. В частности, данные придётся записывать в порядке основного первичного ключа в дополнение к порядку, заданному для каждой проекции. Это замедлит вставки и увеличит потребление дискового пространства.

:::note Projections vs Materialized Views
Проекции обеспечивают многие из тех же возможностей, что и материализованные представления, но их следует использовать умеренно, причём часто предпочтительнее именно материализованные представления. Пользователям важно понимать недостатки и случаи, когда использование проекций оправдано. Например, хотя проекции можно применять для предварительного вычисления агрегатов, мы рекомендуем для этого использовать материализованные представления.
:::

<Image img={observability_13} alt="Observability и проекции" size="md" />

Рассмотрим следующий запрос, который фильтрует нашу таблицу `otel_logs_v2` по кодам ошибок 500. Это, вероятно, распространённый шаблон доступа для логирования, когда пользователи хотят фильтровать по кодам ошибок:

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
Здесь мы не выводим результаты, используя `FORMAT Null`. Это приводит к тому, что все результаты считываются, но не возвращаются, что предотвращает досрочное завершение запроса из‑за LIMIT. Это нужно только для того, чтобы показать время, затраченное на сканирование всех 10 млн строк.
:::

Приведённый выше запрос требует линейного сканирования с нашим выбранным ключом упорядочивания `(ServiceName, Timestamp)`. Хотя мы могли бы добавить `Status` в конец ключа упорядочивания, улучшив производительность этого запроса, мы также можем добавить проекцию.

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

Обратите внимание, что сначала необходимо создать проекцию, а затем материализовать её. Вторая команда приводит к тому, что данные хранятся на диске дважды в двух разных порядках. Проекцию также можно определить при создании данных, как показано ниже, и она будет автоматически обновляться по мере вставки данных.


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

Важно: если проекция создается с помощью `ALTER`, ее материализация происходит асинхронно при выполнении команды `MATERIALIZE PROJECTION`. Пользователи могут контролировать ход этой операции с помощью следующего запроса, ожидая, пока `is_done` не станет равным 1.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Если повторить приведённый выше запрос, мы увидим, что производительность значительно улучшилась ценой дополнительного пространства на диске (см. [&quot;Измерение размера таблицы и сжатия&quot;](#measuring-table-size--compression), чтобы узнать, как это измерить).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 строк в наборе. Затрачено: 0.031 сек. Обработано 51.42 тысяч строк, 22.85 МБ (1.65 миллионов строк/с., 734.63 МБ/с.)
Пиковое использование памяти: 27.85 МиБ.
```

В приведённом выше примере мы указываем в проекции столбцы, использованные в предыдущем запросе. Это означает, что на диск в составе проекции будут записаны только эти столбцы, упорядоченные по `Status`. Если бы мы, наоборот, использовали здесь `SELECT *`, были бы сохранены все столбцы. Хотя это позволило бы большему числу запросов (использующих любые подмножества столбцов) получать выгоду от проекции, при этом потребовалось бы больше места на хранение. Информацию об измерении занятого дискового пространства и степени сжатия см. в разделе [&quot;Measuring table size &amp; compression&quot;](#measuring-table-size--compression).

### Вторичные индексы / индексы пропуска данных

Независимо от того, насколько хорошо настроен первичный ключ в ClickHouse, некоторые запросы неизбежно будут требовать полного сканирования таблицы. Хотя это можно частично компенсировать с помощью материализованных представлений (и проекций для некоторых запросов), они требуют дополнительного обслуживания, а также того, чтобы пользователи знали об их наличии и учитывали это в своих запросах. В то время как традиционные реляционные СУБД решают эту задачу с помощью вторичных индексов, в колоночных базах данных, таких как ClickHouse, они малоэффективны. Вместо этого в ClickHouse используются индексы пропуска (&quot;skip&quot; indexes), которые могут существенно повысить производительность запросов, позволяя базе данных пропускать крупные фрагменты данных, не содержащие подходящих значений.

Стандартные схемы OTel используют вторичные индексы в попытке ускорить доступ к данным в `map`. Хотя на практике мы считаем их в целом неэффективными и не рекомендуем переносить их в ваши пользовательские схемы, индексы пропуска по‑прежнему могут быть полезны.

Перед тем как пытаться применять их, пользователям следует прочитать и понять [руководство по вторичным индексам](/optimize/skipping-indexes).

**В целом они эффективны, когда существует сильная корреляция между первичным ключом и целевым, непервичным столбцом/выражением, а пользователи выполняют поиск по редким значениям, то есть по тем, которые встречаются не во многих гранулах.**

### Фильтры Блума для текстового поиска


Для запросов, связанных с наблюдаемостью, вторичные индексы могут быть полезны, когда пользователям необходимо выполнять текстовый поиск. В частности, блум-фильтры на основе n-грамм и токенов — [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) и [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) — могут использоваться для ускорения поиска по столбцам типа String с операторами `LIKE`, `IN` и `hasToken`. Важно, что индекс, основанный на токенах, генерирует токены, используя символы, отличные от букв и цифр, в качестве разделителей. Это означает, что во время выполнения запроса могут совпадать только токены (или целые слова). Для более детального сопоставления можно использовать [блум-фильтр на основе n-грамм](/optimize/skipping-indexes#bloom-filter-types). Он разбивает строки на n-граммы заданного размера, что позволяет выполнять сопоставление на уровне частей слов.

Чтобы оценить токены, которые будут сгенерированы и, соответственно, совпадать, можно использовать функцию `tokens`:

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
ClickHouse также экспериментально поддерживает инвертированные индексы в качестве вторичного индекса. В настоящее время мы не рекомендуем использовать их для наборов данных логов, но ожидаем, что они заменят bloom-фильтры на основе токенов, когда будут готовы к промышленной эксплуатации.
:::

В этом примере мы используем набор данных структурированных логов. Допустим, мы хотим подсчитать количество логов, в которых столбец `Referer` содержит `ultra`.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 строка в наборе. Затрачено: 0.177 сек. Обработано 10.37 млн строк, 908.49 МБ (58.57 млн строк/с., 5.13 ГБ/с.)
```

Здесь нам нужно использовать n-граммы размера 3. Поэтому создаём индекс `ngrambf_v1`.

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

Индекс `ngrambf_v1(3, 10000, 3, 7)` здесь принимает четыре параметра. Последний из них (значение 7) представляет собой seed (начальное значение). Остальные задают размер n‑граммы (3), значение `m` (размер фильтра) и количество хеш‑функций `k` (7). Параметры `k` и `m` требуют настройки и зависят от количества уникальных n‑грамм/токенов и вероятности того, что фильтр даст истинно отрицательный результат — тем самым подтверждая, что значение отсутствует в грануле. Мы рекомендуем использовать [эти функции](/engines/table-engines/mergetree-family/mergetree#bloom-filter), чтобы подобрать эти значения.


При корректной настройке прирост производительности может быть существенным:

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

:::note Пример только для иллюстрации
Приведённый выше пример предназначен только для иллюстрации. Мы рекомендуем пользователям извлекать структуру из своих логов на этапе вставки, а не пытаться оптимизировать полнотекстовый поиск с использованием блум-фильтров на основе токенов. Однако существуют случаи, когда у пользователей есть стек-трейсы или другие большие текстовые строки, для которых полнотекстовый поиск может быть полезен из-за менее детерминированной структуры.
:::

Некоторые общие рекомендации по использованию блум-фильтров:

Цель блум-фильтра — отфильтровать [гранулы](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), тем самым избегая необходимости загружать все значения столбца и выполнять последовательное сканирование. Оператор `EXPLAIN` с параметром `indexes=1` можно использовать для определения количества пропущенных гранул. Рассмотрим результаты ниже для исходной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с ngram-блум-фильтром.

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

10 строк в наборе. Прошло: 0.016 сек.

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

Фильтр Блума, как правило, будет работать быстрее только в том случае, если он меньше самого столбца. Если он больше, то выигрыш в производительности, вероятнее всего, будет незначительным. Сравните размер фильтра с размером столбца, используя следующие запросы:

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

1 строка в наборе. Затрачено: 0.004 сек.

```

В приведенных выше примерах видно, что вторичный индекс bloom filter занимает 12 МБ — почти в 5 раз меньше сжатого размера самого столбца (56 МБ).

Bloom-фильтры могут требовать значительной настройки. Рекомендуется следовать указаниям [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые помогут определить оптимальные параметры. Bloom-фильтры также могут быть ресурсоемкими при вставке и слиянии данных. Необходимо оценить влияние на производительность вставки перед добавлением bloom-фильтров в продакшен.

Дополнительные сведения о вторичных индексах пропуска можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).

### Извлечение данных из типа Map {#extracting-from-maps}

Тип Map широко используется в схемах OTel. Этот тип требует, чтобы значения и ключи имели одинаковый тип — этого достаточно для метаданных, таких как метки Kubernetes. Следует учитывать, что при запросе подключа типа Map загружается весь родительский столбец. Если map содержит много ключей, это может привести к значительному снижению производительности запроса, поскольку потребуется считать с диска больше данных, чем если бы ключ существовал как отдельный столбец.

Если определенный ключ запрашивается часто, рассмотрите возможность перемещения его в отдельный выделенный столбец на корневом уровне. Обычно это задача, которая выполняется в ответ на типичные шаблоны доступа после развертывания, и её необходимость может быть сложно предсказать до продакшена. См. раздел ["Управление изменениями схемы"](/observability/managing-data#managing-schema-changes) о том, как изменить схему после развертывания.
```


## Измерение размера таблицы и степени сжатия {#measuring-table-size--compression}

Одна из основных причин, по которой ClickHouse используют для задач наблюдаемости, — эффективное сжатие данных.

Помимо значительного снижения затрат на хранение, меньшее количество данных на диске означает меньший объём операций ввода-вывода (I/O) и более быстрые запросы и операции вставки. Выигрыш по I/O перекроет накладные расходы любого алгоритма сжатия по нагрузке на CPU. Поэтому улучшение сжатия данных должно быть первоочередной задачей при оптимизации производительности запросов в ClickHouse.

Подробности по измерению степени сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).
