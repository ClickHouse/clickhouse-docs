---
title: 'Проектирование схемы'
description: 'Проектирование схемы для наблюдаемости'
keywords: ['наблюдаемость', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';

# Проектирование схемы для наблюдаемости

Мы рекомендуем пользователям всегда создавать собственную схему для логов и трейсов по следующим причинам:

- **Выбор первичного ключа** - По умолчанию схемы используют `ORDER BY`, который оптимизирован для конкретных паттернов доступа. Вероятно, что ваши паттерны доступа не будут совпадать с этим.
- **Извлечение структуры** - Пользователи могут захотеть извлечь новые столбцы из существующих столбцов, например из столбца `Body`. Это можно сделать с помощью материализованных столбцов (а в более сложных случаях - с помощью материализованных представлений). Это требует изменений в схеме.
- **Оптимизация карт** - Схемы по умолчанию используют тип Map для хранения атрибутов. Эти столбцы позволяют хранить произвольные метаданные. Хотя это важная возможность, так как метаданные из событий часто не определяются заранее и, следовательно, не могут быть хранены в строго типизированной базе данных, такой как ClickHouse, доступ к ключам карты и их значениям не является таким эффективным, как доступ к обычному столбцу. Мы решаем эту проблему, изменяя схему и обеспечивая, чтобы наиболее часто запрашиваемые ключи карты были столбцами верхнего уровня - см. ["Извлечение структуры с помощью SQL"](#extracting-structure-with-sql). Это требует изменения схемы.
- **Упрощение доступа к ключам карты** - Доступ к ключам в картах требует более многословного синтаксиса. Пользователи могут смягчить это с помощью псевдонимов. См. ["Использование псевдонимов"](#using-aliases) для упрощения запросов.
- **Вторичные индексы** - Схема по умолчанию использует вторичные индексы для ускорения доступа к картам и ускорения текстовых запросов. Как правило, они не требуются и требуют дополнительного места на диске. Их можно использовать, но их следует протестировать, чтобы убедиться, что они необходимы. См. ["Вторичные индексы / Индексы пропуска данных"](#secondarydata-skipping-indices).
- **Использование кодеков** - Пользователи могут захотеть настроить кодеки для столбцов, если они понимают ожидаемые данные и имеют доказательства того, что это улучшает сжатие.

_Мы подробно описываем каждое из вышеуказанных случаев использования ниже._

**Важно:** Хотя пользователям рекомендуется расширять и изменять свою схему для достижения оптимального сжатия и производительности запросов, им следует придерживаться именования столбцов схемы OTel, где это возможно. Плагин Grafana для ClickHouse предполагает наличие некоторых основных столбцов OTel для помощи в создании запросов, таких как Timestamp и SeverityText. Обязательные столбцы для логов и трейсов задокументированы здесь [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) соответственно. Вы можете выбрать изменение имен этих столбцов, переопределив значения по умолчанию в конфигурации плагина.
## Извлечение структуры с помощью SQL {#extracting-structure-with-sql}

При приеме структурированных или неструктурированных логов пользователям часто нужна возможность:

- **Извлечение столбцов из строковых массивов**. Запросы к ним будут быстрее, чем использование строковых операций во время выполнения запроса.
- **Извлечение ключей из карт**. Схема по умолчанию помещает произвольные атрибуты в столбцы типа Map. Этот тип предоставляет возможность без схемы, что имеет преимущество в том, что пользователям не нужно заранее определять столбцы для атрибутов при создании логов и трейсов - часто это невозможно при сборе логов из Kubernetes и желании сохранить метки подов для дальнейшего поиска. Доступ к ключам карты и их значениям медленнее, чем запрос по обычным столбцам ClickHouse. Следовательно, извлечение ключей из карт в корневые столбцы таблицы часто желательно.

Рассмотрим следующие запросы:

Предположим, мы хотим сосчитать, какие URL пути получают больше всего POST запросов, используя структурированные логи. JSON массив хранится в столбце `Body` как строка. Кроме того, он может быть также хранится в столбце `LogAttributes` как `Map(String, String)`, если пользователь включил json_parser в сборщике.

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

Предположим, что `LogAttributes` доступен, запрос для подсчета, какие URL пути сайта получают больше всего POST запросов:

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

Обратите внимание на использование синтаксиса карты здесь, например, `LogAttributes['request_path']`, и [`path` функции](/sql-reference/functions/url-functions#path) для удаления параметров запроса из URL.

Если пользователь не включил парсинг JSON в сборщике, то `LogAttributes` будет пустым, что заставит нас использовать [JSON функции](/sql-reference/functions/json-functions) для извлечения столбцов из строкового `Body`.

:::note Предпочитайте ClickHouse для разбора
Мы обычно рекомендуем пользователям выполнять парсинг JSON в ClickHouse для структурированных логов. Мы уверены, что ClickHouse - самая быстрая реализация разбора JSON. Однако мы понимаем, что пользователи могут захотеть отправить логи в другие источники и не иметь этой логики в SQL.
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
```

Аналогичный запрос для неструктурированных логов требует использования регулярных выражений через [`extractAllGroupsVertical` функцию](/sql-reference/functions/string-search-functions#extractallgroupsvertical).

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

Увеличенная сложность и стоимость запросов для разбора неструктурированных логов (обратите внимание на разницу в производительности) - вот почему мы рекомендуем пользователям всегда использовать структурированные логи, когда это возможно.

:::note Рассмотрите словари
Вышеуказанный запрос можно оптимизировать для использования словарей регулярных выражений. См. [Использование словарей](#using-dictionaries) для получения дополнительной информации.
:::

Оба этих случая использования могут быть решены с помощью ClickHouse, перемещая логику вышеуказанных запросов на время вставки. Мы рассмотрим несколько подходов ниже, подчеркивая, когда каждый из них подходит.

:::note OTel или ClickHouse для обработки?
Пользователи также могут выполнять обработку, используя процессоры и операторы OTel Collector, как описано [здесь](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching). В большинстве случаев пользователи обнаружат, что ClickHouse значительно более эффективно использует ресурсы и быстрее, чем процессоры сборщика. Основным недостатком выполнения всей обработки событий в SQL является зависимость вашего решения от ClickHouse. Например, пользователи могут захотеть отправить обработанные логи в альтернативные пункты назначения из сборщика OTel, такие как S3.
:::
### Материализованные столбцы {#materialized-columns}

Материализованные столбцы предлагают самое простое решение для извлечения структуры из других столбцов. Значения таких столбцов всегда вычисляются во время вставки и не могут быть указаны в командах INSERT.

:::note Накладные расходы
Материализованные столбцы накладывают дополнительные накладные расходы на хранение, поскольку значения извлекаются в новые столбцы на диске во время вставки.
:::


Материализованные столбцы поддерживают любое выражение ClickHouse и могут использовать любые аналитические функции для [обработки строк](/sql-reference/functions/string-functions) (включая [регулярные выражения и поиск](/sql-reference/functions/string-search-functions)) и [url-адресов](/sql-reference/functions/url-functions), выполняя [преобразования типов](/sql-reference/functions/type-conversion-functions), [извлечение значений из JSON](/sql-reference/functions/json-functions) или [математические операции](/sql-reference/functions/math-functions).

Мы рекомендуем использовать материализованные столбцы для базовой обработки. Они особенно полезны для извлечения значений из карт, повышения их до корневых столбцов и выполнения преобразования типов. Они часто наиболее полезны при использовании в очень простых схемах или в сочетании с материализованными представлениями. Рассмотрим следующую схему для логов, из которых JSON был извлечен в столбец `LogAttributes` сборщиком:

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

Эквивалентная схема для извлечения с использованием JSON функций из строкового `Body` представлена [здесь](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==).

Наши три материализованных столбца извлекают запрашиваемую страницу, тип запроса и домен реферера. Они получают доступ к ключам карты и применяют функции к их значениям. Наш последующий запрос значительно быстрее:

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
Материализованные столбцы по умолчанию не будут возвращены в `SELECT *`. Это необходимо для сохранения инварианта, что результат `SELECT *` можно всегда вставить обратно в таблицу с помощью INSERT. Это поведение можно отключить, установив `asterisk_include_materialized_columns=1`, и оно может быть включено в Grafana (см. `Дополнительные настройки -> Пользовательские настройки` в конфигурации источника данных).
:::
## Материализованные представления {#materialized-views}

[Материализованные представления](/materialized-views) предоставляют более мощный способ применения SQL-фильтрации и преобразований к логам и трейсам.

Материализованные представления позволяют пользователям перенести стоимость вычислений с времени выполнения запросов на время вставки. Материализованное представление ClickHouse - это просто триггер, который выполняет запрос над блоками данных, когда они вставляются в таблицу. Результаты этого запроса вставляются во вторую "целевую" таблицу.

<Image img={observability_10} alt="Материализованное представление" size="md"/>

:::note Обновления в реальном времени
Материализованные представления в ClickHouse обновляются в реальном времени, когда данные поступают в таблицу, на основе которой они созданы, функционируя более как постоянно обновляющиеся индексы. В отличие от этого, в других базах данных материализованные представления обычно являются статическими снимками запроса, которые необходимо обновлять (аналогично обновляемым материализованным представлениям ClickHouse).
:::


Запрос, связанный с материализованным представлением, теоретически может быть любым запросом, включая агрегацию, хотя [существуют ограничения с соединениями](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для преобразований и фильтрации, необходимых для логов и трейсов, пользователи могут рассматривать любое выражение `SELECT` как возможное.

Пользователи должны помнить, что запрос - это всего лишь триггер, выполняющийся над строками, которые вставляются в таблицу (исходную таблицу), а результаты отправляются в новую таблицу (целевую таблицу).

Чтобы убедиться, что мы не сохраняем данные дважды (в исходной и целевой таблицах), мы можем изменить таблицу исходной таблицы на [движок таблицы Null](/engines/table-engines/special/null), сохраняя оригинальную схему. Наши сборщики OTel будут продолжать отправлять данные в эту таблицу. Например, для логов таблица `otel_logs` становится:

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

Движок таблицы Null представляет собой мощную оптимизацию - рассматривайте его как `/dev/null`. Эта таблица не будет хранить никаких данных, но все прикрепленные материализованные представления будут по-прежнему выполняться над вставляемыми строками перед тем, как они будут отброшены.

Рассмотрим следующий запрос. Он преобразует наши строки в формат, который мы хотим сохранить, извлекая все столбцы из `LogAttributes` (мы предполагаем, что это было установлено сборщиком с использованием оператора `json_parser`), устанавливая `SeverityText` и `SeverityNumber` (на основе простых условий и определения [этих столбцов](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В этом случае мы также выбираем только те столбцы, которые мы знаем, что будут заполнены - игнорируя столбцы, такие как `TraceId`, `SpanId` и `TraceFlags`.

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

Мы также извлекаем столбец `Body` выше - на случай, если дополнительные атрибуты будут добавлены позднее, которые не будут извлечены нашим SQL. Этот столбец должен хорошо сжиматься в ClickHouse и будет редко запрашиваться, таким образом, не влияя на производительность запроса. Наконец, мы уменьшаем Timestamp до DateTime (чтобы сэкономить место - см. ["Оптимизация типов"](#optimizing-types)) с приведением типа.

:::note Условные операторы
Обратите внимание на использование [условных операторов](/sql-reference/functions/conditional-functions) выше для извлечения `SeverityText` и `SeverityNumber`. Эти функции чрезвычайно полезны для формулирования сложных условий и проверки, установлены ли значения в картах - мы наивно предполагаем, что все ключи существуют в `LogAttributes`. Мы рекомендуем пользователям ознакомиться с ними - они ваши помощники в разборе логов в дополнение к функциям для работы с [null значениями](/sql-reference/functions/functions-for-nulls)!
:::

Нам нужна таблица для получения этих результатов. Ниже представлена целевая таблица, соответствующая вышеуказанному запросу:

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

Типы, выбранные здесь, основаны на оптимизациях, обсуждаемых в ["Оптимизация типов"](#optimizing-types).

:::note
Обратите внимание, как мы радикально изменили нашу схему. На самом деле, пользователи, вероятно, также захотят сохранить столбцы Trace, а также столбец `ResourceAttributes` (это обычно содержит метаданные Kubernetes). Grafana может использовать столбцы Trace для предоставления функциональности связывания между логами и трейсами - см. ["Использование Grafana"](/observability/grafana).
:::


Ниже мы создаем материализованное представление `otel_logs_mv`, которое выполняет вышеуказанный выбор для таблицы `otel_logs` и отправляет результаты в `otel_logs_v2`.

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

Эта вышеуказанная структура визуализируется ниже:

<Image img={observability_11} alt="Otel MV" size="md"/>

Если мы теперь перезапустим конфигурацию сборщика, используемую в ["Экспорт в ClickHouse"](/observability/integrating-opentelemetry#exporting-to-clickhouse), данные появятся в `otel_logs_v2` в нашем желаемом формате. Обратите внимание на использование типизированных функций извлечения JSON.

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

Эквивалентное материализованное представление, которое зависит от извлечения столбцов из столбца `Body` с использованием JSON функций, показано ниже:

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
### Будьте осторожны с типами {#beware-types}

Вышеуказанные материализованные представления полагаются на неявное приведение типов - особенно в случае использования карты `LogAttributes`. ClickHouse часто автоматически преобразует извлеченное значение в тип целевой таблицы, уменьшая необходимый синтаксис. Однако мы рекомендуем пользователям всегда тестировать свои представления, используя оператор `SELECT` представления с оператором [`INSERT INTO`](/sql-reference/statements/insert-into) с целевой таблицей, использующей ту же схему. Это должно подтвердить, что типы обрабатываются корректно. Особое внимание следует уделить следующим случаям:

- Если ключ не существует в карте, будет возвращена пустая строка. В случае числовых значений пользователям придется сопоставить их с подходящим значением. Это можно сделать с помощью [условных операторов](/sql-reference/functions/conditional-functions), например, `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`, или [функций приведения типов](/sql-reference/functions/type-conversion-functions), если допустимы значения по умолчанию, например, `toUInt8OrDefault(LogAttributes['status'] )`.
- Некоторые типы не всегда будут приводиться, например, строковые представления чисел не будут приводиться в значения перечислений.
- Функции извлечения JSON возвращают значения по умолчанию для своего типа, если значение не найдено. Убедитесь, что эти значения имеют смысл!

:::note Избегайте Nullable
Избегайте использования [Nullable](/sql-reference/data-types/nullable) в ClickHouse для данных наблюдаемости. Редко требуется в логах и трейсах различать пустые и null. Эта функция накладывает дополнительные накладные расходы на хранение и отрицательно влияет на производительность запросов. См. [здесь](/data-modeling/schema-design#optimizing-types) для получения дополнительных сведений.
:::
## Выбор первичного (упорядочивающего) ключа {#choosing-a-primary-ordering-key}

После того, как вы извлекли необходимые столбцы, вы можете начать оптимизировать ваш упорядочивающий/первичный ключ.

Некоторые простые правила могут быть применены для выбора упорядочивающего ключа. Следующие правила иногда могут конфликтовать, поэтому рассматривайте их в порядке очередности. Пользователи могут определить ряд ключей в этом процессе, при этом обычно достаточно 4-5:

1. Выберите столбцы, которые соответствуют вашим общим фильтрам и паттернам доступа. Если пользователи обычно начинают расследование в области наблюдаемости, отфильтровывая по конкретному столбцу, например, имени пода, этот столбец будет часто использоваться в условиях `WHERE`. Приоритизируйте их включение в ваш ключ по сравнению с теми, которые используются реже.
2. Предпочитайте столбцы, которые помогают исключить большой процент общих строк при фильтрации, уменьшая количество данных, которые необходимо прочитать. Имена сервисов и коды состояния обычно являются хорошими кандидатами - в последнем случае только если пользователи фильтруют значения, которые исключают большинство строк, например, фильтрация по 200-ым будет в большинстве систем соответствовать большинству строк, в сравнении с 500 ошибками, которые будут соответствовать небольшой подгруппе.
3. Предпочитайте столбцы, которые, вероятно, будут высоко коррелированы с другими столбцами в таблице. Это поможет обеспечить их соседнее хранение, улучшая сжатие.
4. Операции `GROUP BY` и `ORDER BY` для столбцов в упорядочивающем ключе могут быть выполнены более эффективно в отношении памяти.

<br />

Определив подмножество столбцов для упорядочивающего ключа, их необходимо объявить в определенном порядке. Этот порядок может значительно повлиять как на эффективность фильтрации по столбцам второго ключа в запросах, так и на коэффициент сжатия для файлов данных таблицы. В общем, **лучше всего упорядочивать ключи в порядке возрастания кардинальности**. Это следует сбалансировать с тем фактом, что фильтрация по столбцам, которые появляются позже в упорядочивающем ключе, будет менее эффективной, чем фильтрация по тем, которые появляются раньше в кортеже. Балансируйте эти поведения и учитывайте свои паттерны доступа. Важнейшее, тестируйте варианты. Для более глубокого понимания упорядочивающих ключей и того, как их оптимизировать, мы рекомендуем [эту статью](/guides/best-practices/sparse-primary-indexes).

:::note Сначала структура
Мы рекомендуем решить ваши упорядочивающие ключи, как только вы структурировали свои логи. Не используйте ключи в атрибутных картах для упорядочивающего ключа или выражений извлечения JSON. Убедитесь, что ваши упорядочивающие ключи являются корневыми столбцами в вашей таблице.
:::

## Использование карт {#using-maps}

Ранее приведенные примеры показывают использование синтаксиса карты `map['key']` для доступа к значениям в столбцах `Map(String, String)`. Кроме того, доступные специализированные функции ClickHouse [map functions](/sql-reference/functions/tuple-map-functions#mapkeys) позволяют фильтровать или выбирать эти столбцы.

Например, следующий запрос определяет все уникальные ключи, доступные в столбце `LogAttributes`, используя [`mapKeys` функцию](/sql-reference/functions/tuple-map-functions#mapkeys), за которой следует [`groupArrayDistinctArray` функция](/sql-reference/aggregate-functions/combinators) (комбинатор).

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
Мы не рекомендуем использовать точки в именах столбцов Map и можем объявить это использование устаревшим. Используйте `_`.
:::
## Использование псевдонимов {#using-aliases}

Запросы к типам карт медленнее, чем запросы к обычным столбцам - см. ["Ускорение запросов"](#accelerating-queries). Кроме того, они более синтаксически сложные и могут быть обременительными для пользователей. Для решения этой последней проблемы мы рекомендуем использовать столбцы Alias.

Столбцы ALIAS вычисляются во время запроса и не хранятся в таблице. Поэтому невозможно ВСТАВИТЬ значение в столбец такого типа. С помощью псевдонимов мы можем ссылаться на ключи карт и упрощать синтаксис, прозрачно об exposing элементы карты как обычный столбец. Рассмотрим следующий пример:

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

У нас есть несколько материализованных столбцов и столбец `ALIAS`, `RemoteAddr`, который получает доступ к карте `LogAttributes`. Теперь мы можем запрашивать значения `LogAttributes['remote_addr']` через этот столбец, тем самым упрощая наш запрос, т.е.

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

Более того, добавление `ALIAS` осуществляется легко через команду `ALTER TABLE`. Эти столбцы доступны немедленно, например:

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

:::note Псевдоним исключен по умолчанию
По умолчанию, `SELECT *` исключает столбцы ALIAS. Это поведение можно отключить, установив `asterisk_include_alias_columns=1`.
:::
## Оптимизация типов {#optimizing-types}

Общие [Рекомендации по ClickHouse](/data-modeling/schema-design#optimizing-types) для оптимизации типов применимы к использованию ClickHouse.
## Использование кодеков {#using-codecs}

Помимо оптимизации типов, пользователи могут следовать [общим рекомендациям по кодекам](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec), когда пытаются оптимизировать сжатие для схем наблюдаемости ClickHouse.

В общем, пользователи найдут, что кодек `ZSTD` очень подходит для данных журналирования и трассировки. Увеличение значения сжатия от его значения по умолчанию 1 может улучшить сжатие. Однако это следует протестировать, так как более высокие значения влекут за собой большую нагрузку на CPU во время вставки. Обычно мы не видим значительного прироста от увеличения этого значения.

Более того, временные метки, хотя и выигрывают от дельта-кодирования по отношению к сжатию, показали, что они замедляют выполнение запросов, если этот столбец используется в первичном/упорядочивающем ключе. Мы рекомендуем пользователям оценить соответствующие компромиссы между сжатием и производительностью запросов.
## Использование словарей {#using-dictionaries}

[Словари](/sql-reference/dictionaries) являются [ключевой функцией](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) ClickHouse, предоставляющей представление данных в памяти в формате [ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources), оптимизированным для запросов с супернизкой задержкой.

<Image img={observability_12} alt="Наблюдаемость и словари" size="md"/>

Это удобно в различных сценариях, начиная от обогащения принятых данных на лету без замедления процесса приема и улучшения производительности запросов в целом, особенно с использованием JOINs.
Хотя соединения редко требуются в случаях наблюдаемости, словари всё равно могут быть удобны для целей обогащения как во время вставки, так и во время запроса. Мы приводим примеры обоих случаев ниже.

:::note Ускорение соединений
Пользователи, заинтересованные в ускорении соединений с помощью словарей, могут найти дополнительные сведения [здесь](/dictionary).
:::
### Время вставки против времени запроса {#insert-time-vs-query-time}

Словари можно использовать для обогащения наборов данных во время запроса или во время вставки. Каждому из этих подходов соответствуют свои плюсы и минусы. Вкратце:

- **Время вставки** - Это обычно подходит, если значение обогащения не меняется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки избегает обращения к словарю во время запроса. Это происходит с потерей производительности вставки, а также с дополнительными затратами на хранилище, так как обогащенные значения будут храниться в виде столбцов.
- **Время запроса** - Если значения в словаре меняются часто, обращения к словарю во время запроса часто более применимы. Это избегает необходимости обновлять столбцы (и переписывать данные), если сопоставленные значения изменяются. Эта гибкость происходит за счет стоимости обращения во время запроса. Эта стоимость обычно заметна, если необходимо обратиться к многим строкам, например, используя поиск в словаре в условии фильтра. Для обогащения результатов, т.е. в `SELECT`, эта нагрузка обычно незначительна.

Мы рекомендуем пользователям ознакомиться с основами словарей. Словари предоставляют таблицу поиска в памяти, из которой можно извлекать значения с использованием специализированных [функций](/sql-reference/functions/ext-dict-functions#dictgetall).

Для простых примеров обогащения ознакомьтесь с руководством по Словарям [здесь](/dictionary). Ниже мы сосредоточимся на общих задачах обогащения в области наблюдаемости.
### Использование IP словарей {#using-ip-dictionaries}

Географическое обогащение логов и трасс с помощью значений широты и долготы, используя IP-адреса, является общим требованием наблюдаемости. Мы можем достичь этого с помощью структурированного словаря `ip_trie`.

Мы используем общедоступный [набор данных уровня города DB-IP](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставленный [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [README](https://github.com/sapics/ip-location-db#csv-format) видно, что данные структурированы следующим образом:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

Учитывая такую структуру, начнем с того, чтобы взглянуть на данные, используя табличную функцию [url()](/sql-reference/table-functions/url):

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

Чтобы упростить нашу задачу, давайте используем [`URL()`](/engines/table-engines/special/url) движок таблицы, чтобы создать объект таблицы ClickHouse с нашими именами полей и подтвердить общее количество строк:

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
) engine=URL('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV')

select count() from geoip_url;

┌─count()─┐
│ 3261621 │ -- 3.26 million
└─────────┘
```

Поскольку наш словарь `ip_trie` требует диапазоны IP-адресов в CIDR-нотации, нам нужно преобразовать `ip_range_start` и `ip_range_end`.

Этот CIDR для каждого диапазона можно кратко вычислить с помощью следующего запроса:

```sql
with
        bitXor(ip_range_start, ip_range_end) as xor,
        if(xor != 0, ceil(log2(xor)), 0) as unmatched,
        32 - unmatched as cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) as cidr_address
select
        ip_range_start,
        ip_range_end,
        concat(toString(cidr_address),'/',toString(cidr_suffix)) as cidr    
from
        geoip_url
limit 4;

┌─ip_range_start─┬─ip_range_end─┬─cidr───────┐
│ 1.0.0.0        │ 1.0.0.255    │ 1.0.0.0/24 │
│ 1.0.1.0        │ 1.0.3.255    │ 1.0.0.0/22 │
│ 1.0.4.0        │ 1.0.7.255    │ 1.0.4.0/22 │
│ 1.0.8.0        │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4 rows in set. Elapsed: 0.259 sec.
```

:::note
В запросе выше много работы. Для интересующихся, прочитайте это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). В противном случае примите, что выше вычисляется CIDR для диапазона IP.
:::

Для наших целей нам понадобятся только диапазон IP, код страны и координаты, поэтому давайте создадим новую таблицу и вставим наши данные Geo IP:

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

Чтобы выполнить запросы IP с низкой задержкой в ClickHouse, мы воспользуемся словарями для хранения отображения ключей и атрибутов для наших данных Geo IP в памяти. ClickHouse предоставляет структуру словаря `ip_trie` [словаря](/sql-reference/dictionaries#ip_trie) для сопоставления наших сетевых префиксов (CIDR блочные) с координатами и кодами стран. Следующий запрос определяет словарь, используя эту компоновку и указанную выше таблицу в качестве источника.

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

Мы можем выбрать строки из словаря и подтвердить, что этот набор данных доступен для поиска:

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
Словари в ClickHouse периодически обновляются на основе данных базовой таблицы и используемой выше оговорки о времени жизни. Чтобы обновить наш Geo IP словарь, чтобы отразить последние изменения в наборе данных DB-IP, нам нужно будет просто повторно вставить данные из удаленной таблицы geoip_url в нашу таблицу `geoip` с преобразованиями.
:::

Теперь, когда мы загрузили данные Geo IP в наш словарь `ip_trie` (который также удобно называется `ip_trie`), мы можем использовать его для геолокации IP. Это можно сделать с использованием [`dictGet()` функции](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Обратите внимание на скорость получения здесь. Это позволяет нам обогатить журналы. В этом случае мы выбрали **выполнять обогащение во время запроса**.

Возвращаясь к нашему первоначальному набору данных журналов, мы можем использовать вышеуказанное для агрегирования наших журналов по странам. Следующий запрос предполагает использование схемы, полученной из нашего раннего материализованного представления, которое имеет извлеченный столбец `RemoteAddress`.

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

Поскольку отображение IP на географическое местоположение может измениться, пользователи, вероятно, захотят знать, откуда был сделан запрос в момент его выполнения, а не где находится текущее географическое местоположение того же адреса. По этой причине обогащение во время индексации, вероятно, предпочтительнее. Это можно сделать с помощью материализованных столбцов, как показано ниже или в выборке материализованного представления:

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

:::note Обновление периодически
Пользователям, вероятно, захочется, чтобы словарь для обогащения ip обновлялся периодически на основе новых данных. Это можно сделать с помощью оговорки `LIFETIME` словаря, которая вызовет периодическую перезагрузку словаря из базовой таблицы. Чтобы обновить базовую таблицу, смотрите ["Обновляемые материализованные представления"](/materialized-view/refreshable-materialized-view).
:::

Вышеупомянутые страны и координаты предлагают возможности визуализации, помимо группировки и фильтрации по странам. Для вдохновения смотрите ["Визуализация геоданных"](/observability/grafana#visualizing-geo-data).
### Использование регулярных выражений в словарях (анализ строки User-Agent) {#using-regex-dictionaries-user-agent-parsing}

Анализ [строк user agent](https://en.wikipedia.org/wiki/User_agent) является классической задачей регулярных выражений и общим требованием в наборах данных на основе журналов и трасс. ClickHouse обеспечивает эффективный анализ user agent с помощью Словарей деревьев регулярных выражений.

Словари деревьев регулярных выражений определяются в открытом исходном коде ClickHouse с использованием типа источника словаря YAMLRegExpTree, который предоставляет путь к файлу YAML, содержащему дерево регулярных выражений. Если вы хотите предоставить свой собственный словарь регулярных выражений, подробности о необходимой структуре можно найти [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source). Ниже мы сосредотачиваемся на анализе строк user-agent, используя [uap-core](https://github.com/ua-parser/uap-core) и загружаем наш словарь для поддерживаемого формата CSV. Этот подход совместим с OSS и ClickHouse Cloud.

:::note
В приведенных ниже примерах мы используем снимки последних регулярных выражений uap-core для анализа user-agent с июня 2024 года. Последний файл, который периодически обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Пользователи могут следовать шагам [здесь](/sql-reference/dictionaries#collecting-attribute-values), чтобы загрузить в CSV-файл, используемый ниже.
:::

Создайте следующие таблицы памяти. Эти таблицы содержат наши регулярные выражения для анализа устройств, браузеров и операционных систем.

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

Эти таблицы можно заполнить из следующих общедоступных CSV-файлов, используя табличную функцию url:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

С нашими заполненными таблицами памяти, мы можем загружать наши словари регулярных выражений. Обратите внимание, что нам нужно указать ключевые значения как столбцы - это будут атрибуты, которые мы можем извлечь из user agent.

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

С загруженными словарями мы можем предоставить пример user-agent и протестировать наши новые возможности извлечения словаря:

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

Учитывая правила, касающиеся строк user agents, они редко изменяются, и словарь нуждается в обновлении только в ответ на новые браузеры, операционные системы и устройства, поэтому имеет смысл выполнять это извлечение во время вставки.

Мы можем выполнить эту работу, используя материализованный столбец или используя материализованное представление. Ниже мы модифицируем материализованное представление, использованное ранее:

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

Это требует от нас изменить схему для целевой таблицы `otel_logs_v2`:

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

После перезапуска сборщика и вставки структурированных логов, основанных на ранее задокументированных шагах, мы можем запрашивать наши новые извлеченные столбцы Device, Browser и Os.

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
Обратите внимание на использование кортежей для этих столбцов user agent. Кортежи рекомендуются для сложных структур, где иерархия известна заранее. Подколонки предлагают такую же производительность как обычные столбцы (в отличие от ключей Map), позволяя использовать разнородные типы.
:::
### Дальнейшее чтение {#further-reading}

Для получения дополнительных примеров и деталей по словарям мы рекомендуем следующие статьи:

- [Расширенные темы словарей](/dictionary#advanced-dictionary-topics)
- ["Использование словарей для ускорения запросов"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Словари](/sql-reference/dictionaries)
## Ускорение запросов {#accelerating-queries}

ClickHouse поддерживает ряд техник для ускорения производительности запросов. Следующие действия следует рассматривать только после выбора подходящего первичного/упорядочивающего ключа для оптимизации наиболее популярных паттернов доступа и максимизации сжатия. Это обычно окажет наибольшее влияние на производительность с наименьшими затратами.
```
### Использование материализованных представлений (инкрементальные) для агрегаций {#using-materialized-views-incremental-for-aggregations}

В прошлых разделах мы исследовали использование материализованных представлений для трансформации и фильтрации данных. Тем не менее, материализованные представления также можно использовать для предварительного вычисления агрегаций во время вставки и хранения результата. Этот результат может быть обновлен с результатами последующих вставок, что эффективно позволяет выполнять агрегацию заранее во время вставки.

Основная идея заключается в том, что результаты часто будут представлять собой более компактное представление оригинальных данных (частичный эскиз в случае агрегаций). При сочетании с более простым запросом для чтения результатов из целевой таблицы, время выполнения запросов будет быстрее, чем если бы то же вычисление выполнялось над оригинальными данными.

Рассмотрим следующий запрос, где мы вычисляем общий трафик за час, используя наши структурированные логи:

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

Мы можем представить, что это может быть распространенный линейный график, который пользователи строят с помощью Grafana. Этот запрос, безусловно, очень быстрый - набор данных содержит только 10 миллионов строк, и ClickHouse работает быстро! Однако, если мы увеличим объем данных до миллиардов и триллионов строк, мы хотели бы поддерживать такую производительность запросов.

:::note
Этот запрос будет в 10 раз быстрее, если мы используем таблицу `otel_logs_v2`, которая является результатом нашего предыдущего материализованного представления, которое извлекает ключ размера из карты `LogAttributes`. Мы используем сырые данные здесь только в иллюстративных целях и рекомендуем использовать предыдущее представление, если это распространенный запрос.
:::

Нам нужна таблица для получения результатов, если мы хотим вычислить это во время вставки, используя материализованное представление. Эта таблица должна хранить только 1 строку на час. Если обновление получено для уже существующего часа, другие столбцы должны быть объединены в строку существующего часа. Для того чтобы произошло это слияние инкрементальных состояний, частичные состояния должны храниться для других столбцов.

Это требует специального типа движка в ClickHouse: SummingMergeTree. Он заменяет все строки с одинаковым ключом сортировки одной строкой, которая содержит суммированные значения для числовых столбцов. Следующая таблица будет объединять любые строки с одинаковой датой, суммируя любые числовые столбцы.

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Чтобы продемонстрировать наше материализованное представление, предположим, что наша таблица `bytes_per_hour` пуста и еще не получила никаких данных. Наше материализованное представление выполняет вышеуказанный `SELECT` на данных, вставленных в `otel_logs` (это будет выполняться по блокам заданного размера), с результатами, отправляемыми в `bytes_per_hour`. Синтаксис приведен ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Клавиша `TO` здесь является ключевой, указывая, куда будут отправлены результаты, то есть в `bytes_per_hour`.

Если мы перезапустим наш OTel Collector и повторно отправим логи, таблица `bytes_per_hour` будет инкрементально заполняться вышеуказанным результатом запроса. После завершения мы можем подтвердить размер нашей таблицы `bytes_per_hour` - у нас должно быть 1 строка на час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

Мы фактически уменьшили количество строк здесь с 10 миллионов (в `otel_logs`) до 113, сохранив результат нашего запроса. Ключевым моментом здесь является то, что если новые логи вставляются в таблицу `otel_logs`, новые значения будут отправлены в `bytes_per_hour` для их соответствующего часа, где они будут автоматически объединены асинхронно в фоновом режиме - сохраняя только одну строку на час, `bytes_per_hour` всегда будет как малым, так и актуальным.

Поскольку слияние строк происходит асинхронно, при выполнении запроса может быть более одной строки на час. Чтобы гарантировать, что все ожидающие строки будут объединены во время выполнения запроса, у нас есть два варианта:

- Использовать [`FINAL` модификатор](/sql-reference/statements/select/from#final-modifier) в имени таблицы (что мы сделали для запроса подсчета выше).
- Агрегировать по ключу сортировки, используемому в нашей финальной таблице, то есть по Timestamp и суммировать метрики.

Обычно второй вариант более эффективен и гибок (таблица может использоваться для других целей), но первый может быть проще для некоторых запросов. Мы показываем оба варианта ниже:

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

Это ускорило наш запрос с 0.6с до 0.008с - более чем в 75 раз!

:::note
Эти экономии могут быть еще больше при работе с более крупными наборами данных с более сложными запросами. См. [здесь](https://github.com/ClickHouse/clickpy) для примеров.
:::
#### Более сложный пример {#a-more-complex-example}

В приведенном выше примере агрегируется простое количество за час, используя [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Статистика, выходящая за пределы простых сумм, требует другого движка целевой таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

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

113 rows in set. Elapsed: 0.667 sec. Processed 10.37 million rows, 4.73 GB (15.53 million rows/s., 7.09 GB/s.)
```

Чтобы сохранить подсчет кардинальности для инкрементального обновления, требуется AggregatingMergeTree.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

Чтобы убедиться, что ClickHouse знает, что агрегатные состояния будут храниться, мы определяем столбец `UniqueUsers` как тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая источник функции для частичных состояний (uniq) и тип исходного столбца (IPv4). Как и в случае с SummingMergeTree, строки с одинаковым значением ключа `ORDER BY` будут объединены (Hour в приведенном выше примере).

Связанное материализованное представление использует предыдущий запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, как мы добавляем суффикс `State` в конец наших агрегатных функций. Это гарантирует, что возвращается агрегатное состояние функции, а не окончательный результат. Это состояние будет содержать дополнительную информацию, позволяющую этому частичному состоянию объединиться с другими состояниями.

После того как данные будут загружены повторно, через перезапуск коллекторов, мы можем подтвердить, что в таблице `unique_visitors_per_hour` доступно 113 строк.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

Наш окончательный запрос должен использовать суффикс Merge для наших функций (поскольку в столбцах хранятся частичные состояния агрегации):

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

Обратите внимание, что мы используем `GROUP BY` здесь вместо использования `FINAL`.
### Использование материализованных представлений (инкрементальные) для быстрых запросов {#using-materialized-views-incremental--for-fast-lookups}

Пользователи должны учитывать свои шаблоны доступа при выборе ключа сортировки ClickHouse с колонками, которые часто используются в фильтрах и агрегационных клаузах. Это может быть ограничивающим моментом в случаях наблюдаемости, когда у пользователей более разнообразные шаблоны доступа, которые нельзя охватить в одном наборе колонок. Это лучше иллюстрируется на примере, встроенном в стандартные схемы OTel. Рассмотрим стандартную схему для трасс:

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

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. В трассировке пользователям также нужна возможность выполнять запросы по определенному `TraceId` и получать ассоциированные `span` трассы. Хотя это присутствует в ключе сортировки, его расположение в конце означает, что [фильтрация не будет такой эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) и вероятно, что значительное количество данных потребуется просканировать при получении одной трассы.

OTel Collector также устанавливает материализованное представление и связанную таблицу для решения этой проблемы. Таблица и представление приведены ниже:

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

Это представление эффективно гарантирует, что таблица `otel_traces_trace_id_ts` имеет минимальные и максимальные временные метки для трассы. Эта таблица, отсортированная по `TraceId`, позволяет эффективно извлекать эти временные метки. Эти диапазоны временных меток могут, в свою очередь, использоваться при запросе главной таблицы `otel_traces`. Более конкретно, когда Grafana извлекает трассу по ее идентификатору, она использует следующий запрос:

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

CTE здесь определяет минимальную и максимальную временную метку для идентификатора трассы `ae9226c78d1d360601e6383928e4d22d`, прежде чем использовать это для фильтрации главной таблицы `otel_traces` для её ассоциированных `span`.

Этот же подход можно применить к аналогичным шаблонам доступа. Мы исследуем аналогичный пример в моделировании данных [здесь](/materialized-view/incremental-materialized-view#lookup-table).
### Использование проекций {#using-projections}

Проекции ClickHouse позволяют пользователям указывать несколько клауз за сортировку для таблицы.

В предыдущих разделах мы исследовали, как материализованные представления могут использоваться в ClickHouse для предварительного вычисления агрегаций, трансформации строк и оптимизации запросов на наблюдаемость для различных шаблонов доступа.

Мы привели пример, где материализованное представление отправляет строки в целевую таблицу с другим ключом сортировки, чем оригинальная таблица, получающая вставки в целях оптимизации запросов по идентификатору трассы.

Проекции можно использовать для решения той же проблемы, позволяя пользователю оптимизировать запросы по колонке, не входящей в первичный ключ.

В теории, эта возможность может быть использована для предоставления нескольких ключей сортировки для таблицы, с одним весом недостатком: дублированием данных. В частности, данные необходимо будет записывать в порядке основного первичного ключа, помимо порядка, указанного для каждой проекции. Это замедлит вставки и потребует больше дискового пространства.

:::note Проекции против материализованных представлений
Проекции предлагают многие из тех же возможностей, что и материализованные представления, но должны использоваться с осторожностью, и последние часто предпочтительнее. Пользователям следует понимать недостатки и когда их применять. Например, хотя проекции можно использовать для предварительного вычисления агрегаций, мы рекомендуем пользователям использовать материализованные представления для этого.
:::

<Image img={observability_13} alt="Наблюдаемость и проекции" size="md"/>

Рассмотрим следующий запрос, который фильтрует нашу таблицу `otel_logs_v2` по коду ошибки 500. Это вероятно распространенный шаблон доступа для логирования, когда пользователи хотят фильтровать по кодам ошибок:

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
Мы не выводим результаты здесь, используя `FORMAT Null`. Это заставляет все результаты считываться, но не возвращаться, предотвращая таким образом раннее завершение запроса из-за LIMIT. Это делается только для того, чтобы показать время, потраченное на сканирование всех 10 миллионов строк.
:::

Указанный выше запрос требует линейного сканирования с выбранным ключом сортировки `(ServiceName, Timestamp)`. Хотя мы могли бы добавить `Status` в конец ключа сортировки, улучшив производительность для указанного выше запроса, мы также можем добавить проекцию.

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

Обратите внимание, что сначала необходимо создать проекцию, а затем материализовать ее. Эта последняя команда приводит к тому, что данные хранятся дважды на диске в двух различных порядках. Проекцию также можно определить при создании данных, как показано ниже, и она будет автоматически поддерживаться по мере вставки данных.

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

Важно отметить, что если проекция создается через `ALTER`, её создание происходит асинхронно, когда выполняется команда `MATERIALIZE PROJECTION`. Пользователи могут подтвердить ход выполнения этой операции с помощью следующего запроса, дожидаясь `is_done=1`.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Если мы повторим вышеуказанный запрос, мы увидим, что производительность значительно улучшилась за счет дополнительного хранилища (см. ["Измерение размера таблицы и сжатия"](#measuring-table-size--compression) для измерения этого).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

В приведенном выше примере мы указываем столбцы, использованные в предыдущем запросе, в проекции. Это означает, что только указанные столбцы будут храниться на диске в рамках проекции, отсортированные по Status. Если бы, с другой стороны, мы использовали `SELECT *` здесь, все столбцы были бы сохранены. Хотя это позволило бы большему количеству запросов (с использованием любой подмножества столбцов) выиграть от проекции, потребуется больше места для хранения. Для измерения дискового пространства и сжатия см. ["Измерение размера таблицы и сжатия"](#measuring-table-size--compression).
### Вторичные/Индексы для пропуска данных {#secondarydata-skipping-indices}

Независимо от того, насколько хорошо настроен первичный ключ в ClickHouse, некоторые запросы неизбежно потребуют полного сканирования таблицы. Хотя это можно смягчить с помощью материализованных представлений (и проекций для некоторых запросов), их использование требует дополнительного обслуживания, и пользователи должны быть осведомлены об их наличии, чтобы гарантировать их использование. В то время как традиционные реляционные базы данных решают эту проблему с помощью вторичных индексов, они неэффективны в колонно-ориентированных базах данных, таких как ClickHouse. Вместо этого ClickHouse использует индексы "пропуска", которые могут значительно улучшить производительность запросов, позволяя базе данных пропускать большие объемы данных, не содержащие совпадающих значений.

Стандартные схемы OTel используют вторичные индексы, пытаясь ускорить доступ к картам. Хотя мы находим их в целом неэффективными и не рекомендуем копировать их в вашу пользовательскую схему, индексы пропуска все же могут быть полезны.

Пользователям следует прочитать и понять [руководство по вторичным индексам](/optimize/skipping-indexes) перед тем, как пытаться их применять.

**В общем, они эффективны, когда существует сильная корреляция между первичным ключом и целевым, не первичным столбцом/выражением, и пользователи ищут редкие значения, то есть те, которые не встречаются во многих гранулах.**
### Фильтры Блума для текстового поиска {#bloom-filters-for-text-search}

Для запросов по наблюдаемости вторичные индексы могут быть полезны, когда пользователям необходимо выполнять текстовый поиск. В частности, индексы фильтров Блума на основе ngram и токенов [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) и [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) могут использоваться для ускорения поиска по строковым столбцам с операторами `LIKE`, `IN` и hasToken. Важно отметить, что индекс на основе токенов генерирует токены, используя неалфавитные символы в качестве разделителя. Это означает, что только токены (или целые слова) могут быть сопоставлены во время выполнения запроса. Для более детального сопоставления можно использовать [N-gram фильтр Блума](/optimize/skipping-indexes#bloom-filter-types). Он разбивает строки на n-grams заданного размера, позволяя тем самым выполнить сопоставление подслов.

Чтобы оценить токены, которые будут сгенерированы и, следовательно, сопоставлены, можно использовать функцию `tokens`:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Функция `ngram` предоставляет аналогичные возможности, где размер `ngram` может быть указан в качестве второго параметра:

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note Обратные индексы
ClickHouse также имеет экспериментальную поддержку обратных индексов в качестве вторичного индекса. В настоящее время мы не рекомендуем их для наборов данных журналов, но ожидаем, что они заменят фильтры Блума на основе токенов, когда они будут готовы к производству.
:::

Для целей этого примера мы используем набор данных структурированных журналов. Предположим, мы хотим подсчитать журналы, в которых столбец `Referer` содержит `ultra`.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

Здесь нам нужно сопоставить размером ngram равным 3. Поэтому мы создаем индекс `ngrambf_v1`.

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

Индекс `ngrambf_v1(3, 10000, 3, 7)` здесь принимает четыре параметра. Последний из них (значение 7) представляет собой семя. Остальные представляют размер ngram (3), значение `m` (размер фильтра) и количество хеш-функций `k` (7). Значения `k` и `m` требуют настройки и будут зависеть от количества уникальных ngrams/токенов и вероятности того, что фильтр даст ложноположительный результат, таким образом подтверждая, что значение отсутствует в грануле. Мы рекомендуем [эти функции](/engines/table-engines/mergetree-family/mergetree#bloom-filter) для определения этих значений.

Если настроить их правильно, ускорение может быть значительным:

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

:::note Пример только
Вышеуказанное предназначено только для иллюстрации. Мы рекомендуем пользователям извлекать структуру из своих журналов при вставке, а не пытаться оптимизировать текстовые поиски с использованием токенизированных фильтров Блума. Однако есть случаи, когда у пользователей есть трассировки стека или другие большие строки, для которых текстовый поиск может быть полезен из-за менее детерминированной структуры.
:::

Некоторые общие рекомендации по использованию фильтров Блума:

Цель фильтра Блума - отфильтровать [гранулы](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), избегая необходимости загружать все значения для столбца и выполнять линейный поиск. Клауза `EXPLAIN` с параметром `indexes=1` может быть использована для определения количества гранул, которые были пропущены. Рассмотрите ответы ниже для оригинальной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с фильтром Блума ngram.

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

Фильтр Блума обычно будет быстрее, если он меньше самого столбца. Если он больше, то, вероятно, преимущества в производительности будут незначительными. Сравните размер фильтра со столбцом с помощью следующих запросов:

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

В приведенных выше примерах мы видим, что вторичный индекс фильтра Блума имеет размер 12 МБ - почти в 5 раз меньше сжатого размера самого столбца, который составляет 56 МБ.

Фильтры Блума могут требовать значительной настройки. Мы рекомендуем следовать примечаниям [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые могут быть полезны для определения оптимальных настроек. Фильтры Блума также могут быть дорогостоящими во время вставки и слияния. Пользователи должны оценить влияние на производительность вставки перед добавлением фильтров Блума в производственные среды.

Дальнейшие сведения о вторичных индексах для пропуска можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).
### Извлечение из карт {#extracting-from-maps}

Тип Map широко используется в схемах OTel. Этот тип требует, чтобы значения и ключи имели один и тот же тип - что достаточно для метаданных, таких как метки Kubernetes. Имейте в виду, что при запросе подконечного ключа типа Map загружается весь родительский столбец. Если у карты много ключей, это может привести к значительным затратам на запрос, поскольку нужно прочитать больше данных с диска, чем если бы ключ существовал как столбец.

Если вы часто запрашиваете определенный ключ, рассмотрите возможность перемещения его в собственный выделенный столбец на корневом уровне. Это обычно задача, выполняемая в ответ на распространенные шаблоны доступа и после развертывания, и может быть трудна для предсказания до начала работы в производственной среде. См. ["Управление изменениями схемы"](/observability/managing-data#managing-schema-changes) о том, как изменить вашу схему после развертывания.
## Измерение размера таблицы и сжатия {#measuring-table-size--compression}

Одной из основных причин использования ClickHouse для наблюдаемости является сжатие.

Помимо значительного снижения затрат на хранение, меньше данных на диске означает меньше ввода-вывода и более быстрые запросы и вставки. Снижение ввода-вывода превысит накладные расходы любого алгоритма сжатия с точки зрения CPU. Таким образом, улучшение сжатия данных должно быть первым приоритетом, когда речь идет о том, чтобы обеспечить быструю работу запросов в ClickHouse.

Подробности об измерении сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).
