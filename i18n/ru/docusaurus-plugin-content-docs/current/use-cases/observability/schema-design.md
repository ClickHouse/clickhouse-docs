---
title: 'Проектирование схемы'
description: 'Проектирование схемы для мониторинга'
keywords: ['мониторинг', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';

# Проектирование схемы для мониторинга

Мы рекомендуем пользователям всегда создавать собственную схему для логов и трейсов по следующим причинам:

- **Выбор первичного ключа** - Стандартные схемы используют `ORDER BY`, который оптимизирован для конкретных паттернов доступа. Вряд ли ваши паттерны доступа будут с этим совпадать.
- **Извлечение структуры** - Пользователи могут захотеть извлечь новые столбцы из существующих, например, из колонки `Body`. Это можно сделать с помощью материализованных столбцов (и материализованных представлений в более сложных случаях). Это требует изменений схемы.
- **Оптимизация карт** - Стандартные схемы используют тип Map для хранения атрибутов. Эти столбцы позволяют хранить произвольные метаданные. Хотя это важная возможность, поскольку метаданные событий часто не определяются заранее и, следовательно, не могут быть хранены в строго типизированной базе данных, такой как ClickHouse, доступ к ключам карты и их значениям не так эффективен, как доступ к обычному столбцу. Мы решаем эту проблему, модифицируя схему и обеспечивая, чтобы наиболее часто используемые ключи карты были верхнеуровневыми столбцами - смотрите ["Извлечение структуры с помощью SQL"](#extracting-structure-with-sql). Это требует изменения схемы.
- **Упрощение доступа к ключам карты** - Доступ к ключам в картах требует более многословного синтаксиса. Пользователи могут смягчить это с помощью псевдонимов. См. ["Использование псевдонимов"](#using-aliases) для упрощения запросов.
- **Вторичные индексы** - Стандартная схема использует вторичные индексы для ускорения доступа к картам и ускорения текстовых запросов. Обычно они не требуются и требуют дополнительного пространства на диске. Их можно использовать, но следует протестировать, чтобы убедиться, что они нужны. См. ["Вторичные индексы / Индексы пропуска данных"](#secondarydata-skipping-indices).
- **Использование кодеков** - Пользователи могут захотеть настроить кодеки для столбцов, если они понимают ожидаемые данные и имеют доказательства того, что это улучшает сжатие.

_Мы подробно описываем каждое из вышеупомянутых случаев использования ниже._

**Важно:** Хотя пользователям рекомендуется расширять и изменять свою схему для достижения оптимального сжатия и производительности запросов, они должны придерживаться именования схемы OTel для основных столбцов, где это возможно. Плагин ClickHouse для Grafana предполагает наличие некоторых основных столбцов OTel для помощи в построении запросов, например, Timestamp и SeverityText. Обязательные столбцы для логов и трейсов документированы здесь [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure), соответственно. Вы можете изменить эти имена столбцов, переопределив значения по умолчанию в конфигурации плагина.
## Извлечение структуры с помощью SQL {#extracting-structure-with-sql}

При приеме структурированных или неструктурированных логов пользователям часто требуется возможность:

- **Извлекать столбцы из строковых блобов**. Запросы к этим столбцам будут быстрее, чем использование строковых операций во время выполнения запроса.
- **Извлекать ключи из карт**. Стандартная схема помещает произвольные атрибуты в столбцы типа Map. Этот тип предоставляет возможность без схемы, что позволяет пользователям не определять столбцы для атрибутов при определении логов и трейсов - часто это невозможно при сборе логов из Kubernetes, если необходимо сохранить метки пода для последующего поиска. Доступ к ключам карты и их значениям может быть медленнее, чем запрос по обычным столбцам ClickHouse. Поэтому извлечение ключей из карт в корневые столбцы таблицы часто желательно.

Рассмотрим следующие запросы:

Допустим, мы хотим подсчитать, какие URL-адреса получают наибольшее количество POST-запросов, используя структурированные логи. JSON-блоб хранится в колонке `Body` в виде строки. Кроме того, он также может храниться в колонке `LogAttributes` как `Map(String, String)`, если пользователь активировал json_parser в сборщике.

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

Предположим, `LogAttributes` доступен, запрос для подсчета, какие URL-адреса сайта получают наибольшее количество POST-запросов:

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

Обратите внимание на использование синтаксиса карты, например, `LogAttributes['request_path']`, а также на функцию [`path`](https://clickhouse.com/sql-reference/functions/url-functions#path) для удаления параметров запроса из URL.

Если пользователь не активировал парсинг JSON в сборщике, тогда `LogAttributes` будет пустым, что заставит нас использовать [JSON функции](https://clickhouse.com/sql-reference/functions/json-functions) для извлечения столбцов из строки `Body`.

:::note Предпочитайте ClickHouse для парсинга
Мы в целом рекомендуем пользователям выполнять парсинг JSON в ClickHouse для структурированных логов. Мы уверены, что ClickHouse - это самая быстрая реализация парсинга JSON. Тем не менее, мы понимаем, что пользователи могут захотеть отправить логи в другие источники и не иметь этой логики в SQL.
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
```

Аналогичный запрос для неструктурированных логов требует использования регулярных выражений через функцию [`extractAllGroupsVertical`](https://clickhouse.com/sql-reference/functions/string-search-functions#extractallgroupsvertical).

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

Увеличанная сложность и стоимость запросов для парсинга неструктурированных логов (обратите внимание на разницу в производительности) является причиной, по которой мы рекомендуем пользователям всегда использовать структурированные логи, когда это возможно.

:::note Рассматривайте словари
Вышеупомянутый запрос можно оптимизировать для использования словарей регулярных выражений. См. [Использование словарей](#using-dictionaries) для получения более подробной информации.
:::

Оба этих случая использования могут быть удовлетворены с помощью ClickHouse, перенесением логики запросов на время вставки. Мы исследуем несколько подходов ниже, подчеркивая, когда каждый из них подходит.

:::note OTel или ClickHouse для обработки?
Пользователи также могут выполнять обработку с помощью процессоров и операторов сборщика OTel, как описано [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext). В большинстве случаев пользователи обнаружат, что ClickHouse значительно более эффективно использует ресурсы и быстрее, чем процессоры сборщика. Главным недостатком выполнения всей обработки событий в SQL является связывание вашего решения с ClickHouse. Например, пользователи могут захотеть отправить обработанные логи в альтернативные места назначения из сборщика OTel, например, S3.
:::
### Материализованные столбцы {#materialized-columns}

Материализованные столбцы предлагают самое простое решение для извлечения структуры из других столбцов. Значения таких столбцов всегда рассчитываются во время вставки и не могут быть указаны в запросах INSERT.

:::note Нагрузки
Материализованные столбцы требуют дополнительного объема памяти, так как значения извлекаются в новые столбцы на диске во время вставки.
:::

Материализованные столбцы поддерживают любые выражения ClickHouse и могут использовать любые аналитические функции для [обработки строк](https://clickhouse.com/sql-reference/functions/string-functions) (включая [регулярные выражения и поиск](https://clickhouse.com/sql-reference/functions/string-search-functions) и [URL](https://clickhouse.com/sql-reference/functions/url-functions)), выполняя [преобразования типов](https://clickhouse.com/sql-reference/functions/type-conversion-functions), [извлекая значения из JSON](https://clickhouse.com/sql-reference/functions/json-functions) или [математические операции](https://clickhouse.com/sql-reference/functions/math-functions).

Мы рекомендуем использовать материализованные столбцы для базовой обработки. Они особенно полезны для извлечения значений из карт, повышения их до корневых столбцов и выполнения преобразований типов. Они обычно наиболее полезны, когда используются в очень простых схемах или в сочетании с материализованными представлениями. Рассмотрим следующую схему для логов, из которой JSON был извлечен в колонку `LogAttributes` сборщиком:

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

Эквивалентная схема для извлечения с использованием JSON функций из строки `Body` может быть найдена [здесь](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==).

Наши три колонка материализованного представления извлекают страницу запроса, тип запроса и домен реферера. Они обращаются к ключам карты и применяют функции к их значениям. Наш последующий запрос значительно быстрее:

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
Материализованные столбцы по умолчанию не вернутся в `SELECT *`. Это необходимо для сохранения инварианта, что результат `SELECT *` всегда может быть вставлен обратно в таблицу с помощью INSERT. Это поведение можно отключить, установив `asterisk_include_materialized_columns=1`, и оно может быть включено в Grafana (см. `Дополнительные настройки -> Пользовательские настройки` в конфигурации источника данных).
:::
## Материализованные представления {#materialized-views}

[Материализованные представления](https://clickhouse.com/materialized-views) предоставляют более мощные средства применения фильтрации SQL и преобразований к логам и трейсам.

Материализованные представления позволяют пользователям переместить стоимость вычислений с времени запроса на время вставки. Материализованное представление ClickHouse - это просто триггер, который выполняет запрос над блоками данных, когда они вставляются в таблицу. Результаты этого запроса вставляются во вторую "целевую" таблицу.

<Image img={observability_10} alt="Материализованное представление" size="md"/>

:::note Обновления в реальном времени
Материализованные представления в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на которой они основаны, действуя скорее как постоянно обновляющиеся индексы. В отличие от этого, в других базах данных материализованные представления обычно представляют собой статические снимки запроса, которые должны обновляться (аналогично обновляемым материализованным представлениям ClickHouse).
:::

Запрос, связанный с материализованным представлением, теоретически может быть любым запросом, включая агрегации, хотя [существуют ограничения со соединениями](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для преобразований и фильтрации, необходимых для логов и трейсов, пользователи могут считать любое `SELECT` утверждение возможным.

Пользователи должны помнить, что запрос - это просто триггер, который выполняется над строками, вставляемыми в таблицу (исходную таблицу), а результаты отправляются в новую таблицу (целевую таблицу).

Чтобы избежать двойного хранения данных (в исходной и целевой таблицах), мы можем изменить табличный движок исходной таблицы на [Null](https://clickhouse.com/engines/table-engines/special/null), сохраняя оригинальную схему. Наши сборщики OTel продолжат отправлять данные в эту таблицу. Например, для логов таблица `otel_logs` становится:

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

Движок Null - это мощная оптимизация - думайте о нем как о `/dev/null`. Эта таблица не будет хранить никаких данных, но любые прикрепленные материализованные представления по-прежнему будут выполняться над вставляемыми строками, прежде чем они будут удалены.

Рассмотрим следующий запрос. Он преобразует наши строки в формат, который мы хотим сохранить, извлекая все столбцы из `LogAttributes` (мы предполагаем, что это было установлено сборщиком с использованием оператора `json_parser`), устанавливая `SeverityText` и `SeverityNumber` (на основании некоторых простых условий и определения [этих столбцов](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В этом случае мы также выбираем только те столбцы, которые мы знаем будут заполнены - игнорируя такие столбцы, как `TraceId`, `SpanId` и `TraceFlags`.

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

Мы также извлекаем столбец `Body` выше - на случай, если позже будут добавлены дополнительные атрибуты, которые не извлекаются нашим SQL. Этот столбец должен хорошо сжиматься в ClickHouse и будет редко доступен, тем самым не влияя на производительность запроса. Наконец, мы уменьшаем Timestamp до DateTime (чтобы сэкономить место - смотрите ["Оптимизация типов"](#optimizing-types)) с приведением типов.

:::note Условные операторы
Обратите внимание на использование [условных операторов](https://clickhouse.com/sql-reference/functions/conditional-functions) выше для извлечения `SeverityText` и `SeverityNumber`. Они очень полезны для формулирования сложных условий и проверки наличия значений в картах - мы наивно предполагаем, что все ключи существуют в `LogAttributes`. Мы рекомендуем пользователям ознакомиться с ними - они ваши друзья в парсинге логов, помимо функций для обработки [null значений](https://clickhouse.com/sql-reference/functions/functions-for-nulls)!
:::

Нам требуется таблица для хранения этих результатов. Ниже приведена целевая таблица, которая соответствует вышеупомянутому запросу:

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

Выбранные здесь типы основаны на обсуждаемых оптимизациях в ["Оптимизация типов"](#optimizing-types).

:::note
Обратите внимание на то, как мы существенно изменили нашу схему. На самом деле пользователи, вероятно, также захотят сохранить столбцы Trace, а также столбец `ResourceAttributes` (он обычно содержит метаданные Kubernetes). Grafana может использовать столбцы Trace для обеспечения функциональности связи между логами и трейсам - смотрите ["Использование Grafana"](/observability/grafana).
:::

Ниже мы создаем материализованное представление `otel_logs_mv`, которое выполняет вышеупомянутый запрос для таблицы `otel_logs` и отправляет результаты в `otel_logs_v2`.

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

Это представление визуализируется ниже:

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

Эквивалентное материализованное представление, которое полагается на извлечение столбцов из колонки `Body`, используя JSON функции, показано ниже:

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
### Будьте внимательны с типами {#beware-types}

Вышеупомянутые материализованные представления полагаются на неявное приведение типов - особенно в случае использования карты `LogAttributes`. ClickHouse часто прозрачно приводит извлеченные значения к типу целевой таблицы, сокращая требуемый синтаксис. Однако мы рекомендуем пользователям всегда тестировать свои представления, используя оператор `SELECT` представлений с оператором [`INSERT INTO`](https://clickhouse.com/sql-reference/statements/insert-into), используя целевую таблицу с той же схемой. Это должно подтвердить, что типы правильно обрабатываются. Особое внимание следует уделять следующим случаям:

- Если ключ не существует в карте, будет возвращена пустая строка. В случае чисел пользователям необходимо сопоставить их с соответствующим значением. Это можно сделать с помощью [условных операторов](https://clickhouse.com/sql-reference/functions/conditional-functions), например, `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` или [функций приведения типов](https://clickhouse.com/sql-reference/functions/type-conversion-functions), если значения по умолчанию приемлемы, например, `toUInt8OrDefault(LogAttributes['status'] )`
- Некоторые типы не всегда будут приведены, например, строковые представления чисел не будут приведены к значениям перечислений.
- Функции извлечения JSON возвращают значения по умолчанию для их типа, если значение не найдено. Убедитесь, что эти значения имеют смысл!

:::note Избегайте Nullable
Избегайте использования [Nullable](https://clickhouse.com/sql-reference/data-types/nullable) в ClickHouse для данных мониторинга. Обычно нет необходимости различать пустые и нулевые значения в логах и трейсов. Эта функция требует дополнительного объема памяти и негативно сказывается на производительности запросов. См. [здесь](https://clickhouse.com/data-modeling/schema-design#optimizing-types) для получения дополнительной информации.
:::
## Выбор первичного (упорядоченного) ключа {#choosing-a-primary-ordering-key}

После того, как вы извлекли желаемые столбцы, вы можете начать оптимизировать ваш упорядоченный/первичный ключ.

Некоторые простые правила можно применить для выбора упорядоченного ключа. Следующие пункты иногда могут конфликтовать, поэтому рассматривайте их в порядке значимости. Пользователи могут определить несколько ключей из этого процесса, из которых 4-5 обычно достаточно:

1. Выберите столбцы, которые соответствуют вашим общим фильтрам и паттернам доступа. Если пользователи обычно начинают расследования в области мониторинга, фильтруя по определенному столбцу, например, по имени пода, этот столбец будет часто использоваться в условиях `WHERE`. Приоритезируйте включение этих столбцов в ваш ключ по сравнению с теми, которые используются реже.
2. Предпочитайте столбцы, которые помогают исключать большой процент общих строк при фильтрации, тем самым уменьшая объем данных, которые необходимо читать. Названия служб и коды статуса часто являются хорошими кандидатами - в последнем случае только в том случае, если пользователи фильтруют по значениям, которые исключают большую часть строк, например, фильтрация по 200 будет соответствовать большинству строк в большинстве систем, в сравнении с 500 ошибками, которые будут соответствовать небольшой подсетке.
3. Предпочитайте столбцы, которые, вероятно, будут высоко коррелировать с другими столбцами в таблице. Это будет способствовать обеспечению того, чтобы эти значения также были записаны последовательно, улучшая сжатие.
4. Операции `GROUP BY` и `ORDER BY` для столбцов в упорядоченном ключе могут быть сделаны более эффективными по памяти.

<br />

После определения поднабора столбцов для упорядоченного ключа их необходимо объявить в определенном порядке. Этот порядок может значительно повлиять как на эффективность фильтрации по вторичным ключевым столбцам в запросах, так и на коэффициент сжатия для файлов данных таблицы. В общем, **лучше всего располагать ключи в порядке возрастания кардинальности**. Это следует сбалансировать с тем фактом, что фильтрация по столбцам, которые появляются позже в упорядоченном ключе, будет менее эффективной, чем фильтрация по тем, которые появляются раньше в кортежах. Сбалансируйте эти поведения и учитывайте ваши паттерны доступа. Самое главное, тестируйте варианты. Для более глубокого понимания упорядоченных ключей и того, как их оптимизировать, мы рекомендуем [эту статью](https://clickhouse.com/guides/best-practices/sparse-primary-indexes).

:::note Сначала структура
Мы рекомендуем определить ваши упорядоченные ключи после того, как вы структурировали ваши логи. Не используйте ключи в атрибутных картах для упорядоченного ключа или выражений извлечения JSON. Убедитесь, что ваши упорядоченные ключи являются корневыми столбцами в вашей таблице.
:::
## Использование карт {#using-maps}

Предыдущие примеры показывают использование синтаксиса карт `map['key']` для доступа к значениям в столбцах `Map(String, String)`. Кроме того, для фильтрации или выбора этих столбцов доступны специализированные функции ClickHouse [map functions](/sql-reference/functions/tuple-map-functions#mapkeys).

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
Рекомендуем избегать использования точек в именах колонок Map и можем отказаться от этого использования. Используйте `_`.
:::
## Использование псевдонимов {#using-aliases}

Запросы к типам карт медленнее, чем к обычным столбцам - см. ["Ускорение запросов"](#accelerating-queries). Кроме того, это более синтаксически сложно и может быть неудобно для пользователей. Чтобы решить эту последнюю проблему, мы рекомендуем использовать колонки Alias.

Колонки ALIAS вычисляются во время выполнения запроса и не хранятся в таблице. Поэтому невозможно INSERT значение в колонку этого типа. Используя псевдонимы, мы можем ссылаться на ключи карты и упрощать синтаксис, прозрачно отображая записи карты как обычный столбец. Рассмотрим следующий пример:

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

У нас есть несколько материализованных колонок и одна колонка `ALIAS`, `RemoteAddr`, которая обращается к карте `LogAttributes`. Теперь мы можем запрашивать значения `LogAttributes['remote_addr']` через этот столбец, тем самым упрощая наш запрос, т.е.

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

Кроме того, добавление `ALIAS` очень просто через команду `ALTER TABLE`. Эти колонки становятся немедленно доступными, например,

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

:::note ALIAS по умолчанию исключены
По умолчанию `SELECT *` исключает колонки ALIAS. Это поведение можно отключить, установив `asterisk_include_alias_columns=1`.
:::
## Оптимизация типов {#optimizing-types}

Общие лучшие практики ClickHouse по оптимизации типов применимы к использованию ClickHouse.
## Использование кодеков {#using-codecs}

Помимо оптимизации типов, пользователи могут следовать [общим best practices для кодеков](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) при оптимизации сжатия для схем наблюдаемости ClickHouse.

В общем, пользователи обнаружат, что кодек `ZSTD` высоко применим к данным журналов и трассировок. Увеличение значения сжатия с его значения по умолчанию 1 может улучшить сжатие. Однако это следует протестировать, так как более высокие значения увеличивают нагрузку на CPU во время вставки. Обычно мы наблюдаем небольшую выгоду от увеличения этого значения.

Кроме того, временные метки, хотя и выигрывают от дельта-кодирования относительно сжатия, продемонстрировали замедленную производительность запросов, если этот столбец используется в первичном/сортировочном ключе. Мы рекомендуем пользователям оценить соответствующие компромиссы между сжатием и производительностью запросов.
## Использование словарей {#using-dictionaries}

[Словари](/sql-reference/dictionaries) являются ключевой функцией ClickHouse, обеспечивающей хранение в памяти [пар ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) данных из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources), оптимизированные для запросов с низкой задержкой.

<Image img={observability_12} alt="Наблюдаемость и словари" size="md"/>

Это полезно в различных сценариях, от обогащения принятых данных на лету без замедления процесса загрузки и улучшения производительности запросов в целом, причем JOIN-ы получают особенно большую выгоду. Хотя JOIN-ы редко нужны в сценариях наблюдаемости, словари все равно могут быть полезны для целей обогащения - как во время вставки, так и во время запроса. Мы предоставляем примеры обоих ниже.

:::note Ускорение JOIN-ов
Пользователи, заинтересованные в ускорении JOIN-ов с помощью словарей, могут найти дополнительные сведения [здесь](/dictionary).
:::
### Время вставки против времени запроса {#insert-time-vs-query-time}

Словари могут использоваться для обогащения наборов данных как во время запроса, так и во время вставки. Каждому из этих подходов соответствуют свои плюсы и минусы. Вкратце:

- **Время вставки** - это обычно целесообразно, если значение обогащения не меняется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки избегает поиска в словаре во время запроса. Это происходит ценой производительности вставки и дополнительными затратами на хранение, так как обогащенные значения будут храниться как колонки.
- **Время запроса** - если значения в словаре часто меняются, поиски во время запроса чаще применимы. Это избегает необходимости обновлять колонки (и перезаписывать данные), если картированные значения изменяются. Эта гибкость обходится громадными затратами на поиск во время запроса. Эти затраты на время запроса обычно заметны, если требуется поиск для многих строк, например, при использовании поиска в словаре в условии фильтрации. Для обогащения результата, т.е. в `SELECT`, эти накладные расходы обычно незаметны.

Мы рекомендуем пользователям ознакомиться с основами словарей. Словари предоставляют таблицу поиска в памяти, из которой значения могут быть извлечены с использованием специализированных [специальных функций](/sql-reference/functions/ext-dict-functions#dictgetall).

Для простых примеров обогащения см. руководство по словарям [здесь](/dictionary). Ниже мы сосредоточимся на общих задачах обогащения для наблюдаемости.
### Использование IP словарей {#using-ip-dictionaries}

Геообогащение журналов и трассировок с использованием цен и широты на основании IP-адресов - это распространенное требование наблюдаемости. Мы можем достичь этого, используя структурированный словарь `ip_trie`.

Мы используем общедоступный [набор данных DB-IP на уровне города](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставленный [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [README](https://github.com/sapics/ip-location-db#csv-format) мы можем видеть, что данные структурированы следующим образом:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

Учитывая эту структуру, давайте начнем с того, чтобы заглянуть в данные, используя табличную функцию [url()](/sql-reference/table-functions/url):

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

Чтобы облегчить нашу задачу, давайте использовать [`URL()`](/engines/table-engines/special/url) движок таблицы для создания объекта таблицы ClickHouse с нашими именами полей и подтвердим общее количество строк:

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
│ 3261621 │ -- 3.26 миллиона
└─────────┘
```

Поскольку наш словарь `ip_trie` требует, чтобы диапазоны IP-адресов были выражены в нотации CIDR, нам нужно преобразовать `ip_range_start` и `ip_range_end`.

Этот CIDR для каждого диапазона можно коротко вычислить следующим запросом:

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
В приведенном выше запросе происходит множество операций. Для тех, кто заинтересован, прочтите это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). В противном случае примите, что вышеуказанное вычисляет CIDR для диапазона IP.
:::

Для наших целей нам понадобятся только IP-диапазон, код страны и координаты, так что давайте создадим новую таблицу и вставим в нее наши Geo IP данные:

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

Чтобы проводить низколатентные IP-поиски в ClickHouse, мы будем использовать словари для хранения соответствий ключ -> атрибуты для наших Geo IP данных в памяти. ClickHouse предоставляет структуру словаря `ip_trie` [dictionary structure](/sql-reference/dictionaries#ip_trie), чтобы сопоставить наши сетевые префиксы (CIDR-блоки) с координатами и кодами стран. Следующий запрос определяет словарь, используя эту структуру и вышеприведенную таблицу как источник.

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

Мы можем выбрать строки из словаря и подтвердить, что этот набор данных доступен для запросов:

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
Словари в ClickHouse периодически обновляются на основе данных в подлежащей таблице и использованного выше условия lifetime. Чтобы обновить наш Geo IP словарь, чтобы отразить последние изменения в наборе данных DB-IP, нам просто нужно вновь вставить данные из удаленной таблицы geoip_url в нашу таблицу `geoip` с применением преобразований.
:::

Теперь, когда у нас есть загруженные данные Geo IP в нашем словаре `ip_trie` (удобно также названном `ip_trie`), мы можем использовать его для геолокации IP. Это можно выполнить с помощью функции [`dictGet()`](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Обратите внимание на скорость извлечения здесь. Это позволяет нам обогащать журналы. В этом случае мы выбираем **выполнить обогащение во время запроса**.

Возвращаясь к нашему оригинальному набору данных журналов, мы можем использовать вышеуказанное для агрегирования наших журналов по странам. Следующее предполагает, что мы используем схему, полученную из нашего предыдущего материализованного представления, которое имеет извлеченный столбец `RemoteAddress`.

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

Поскольку соответствие IP к географическому местоположению может изменяться, пользователи, скорее всего, захотят знать, откуда был сделан запрос в момент его выполнения, а не то, какое текущее географическое местоположение для того же адреса. По этой причине обогащение во время индексации, вероятно, будет предпочтительным здесь. Это можно сделать с помощью материализованных колонок, как показано ниже, или в выборке материализованного представления:

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
Пользователи, вероятно, захотят, чтобы словарь обогащения ip периодически обновлялся на основе новых данных. Это можно достичь с помощью условия `LIFETIME` словаря, которое будет периодически перезагружать словарь из подлежащей таблицы. Чтобы обновить подлежащую таблицу, см. ["Обновляемые материализованные представления"](/materialized-view/refreshable-materialized-view).
:::

Предоставленные выше страны и координаты предлагают возможности визуализации, выходящие за рамки группировки и фильтрации по странам. За вдохновением смотрите ["Визуализация геоданных"](/observability/grafana#visualizing-geo-data).
### Использование словарей Regex (разбор User Agent) {#using-regex-dictionaries-user-agent-parsing}

Разбор [строк user agent](https://en.wikipedia.org/wiki/User_agent) является классической задачей регулярного выражения и общим требованием в наборах данных на основе журналов и трассировок. ClickHouse обеспечивает эффективный разбор user agents с помощью Словарей Дерева Регулярных Выражений.

Словари дереев регулярных выражений определяются в открытом исходном коде ClickHouse с использованием типа источника словаря YAMLRegExpTree, который предоставляет путь к YAML-файлу, содержащему дерево регулярных выражений. Если вы хотите предоставить свой собственный словарь регулярных выражений, детали о необходимой структуре можно найти [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source). Ниже мы сосредотачиваемся на разборе user-agent, используя [uap-core](https://github.com/ua-parser/uap-core) и загружаем наш словарь для поддерживаемого формата CSV. Этот подход совместим с OSS и ClickHouse Cloud.

:::note
В приведенных ниже примерах мы используем снимки последних регулярных выражений uap-core для разбора user-agent с июня 2024 года. Последний файл, который иногда обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Пользователи могут следовать шагам [здесь](/sql-reference/dictionaries#collecting-attribute-values), чтобы загрузить в CSV-файл, используемый ниже.
:::

Создайте следующие таблицы памяти. Эти таблицы хранят наши регулярные выражения для разбора устройств, браузеров и операционных систем.

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

Эти таблицы могут быть заполнены из следующих общедоступных CSV-файлов, используя табличную функцию url:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

С нашими таблицами памяти, заполненными загрузим наши Словари Регулярных Выражений. Обратите внимание, что мы должны указать ключевые значения как колонки - это будут атрибуты, которые мы можем извлечь из user agent.

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

С этими загруженными словарями мы можем предоставить пример user-agent и протестировать наши новые возможности извлечения словарей:

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

Учитывая, что правила для user agents редко меняются, и что словарь требуется обновлять только в ответ на новые браузеры, операционные системы и устройства, имеет смысл выполнять это извлечение во время вставки.

Мы можем либо выполнить эту работу с помощью материализованной колонки, либо с помощью материализованного представления. Ниже мы изменяем материализованное представление, использованное ранее:

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

После перезапуска коллектора и загрузки структурированных журналов, основываясь на ранее задокументированных шагах, мы можем запрашивать наши новые извлечённые колонки Device, Browser и Os.

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
Обратите внимание на использование кортежей для этих колонок user agent. Кортежи рекомендуются для сложных структур, где иерархия известна заранее. Подколонки предлагают такую же производительность, как и обычные колонки (в отличие от ключей Map), позволяя использовать неоднородные типы.
:::
### Дальнейшее чтение {#further-reading}

Для получения дополнительных примеров и деталей о словарях мы рекомендуем следующие статьи:

- [Расширенные темы словарей](/dictionary#advanced-dictionary-topics)
- ["Использование словарей для ускорения запросов"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Словари](/sql-reference/dictionaries)
## Ускорение запросов {#accelerating-queries}

ClickHouse поддерживает несколько техник для ускорения производительности запросов. Следующее следует рассматривать только после выбора подходящего первичного/сортировочного ключа для оптимизации самых популярных шаблонов доступа и максимизации сжатия. Это обычно оказывает наибольшее влияние на производительность с наименьшими усилиями.
### Использование материализованных представлений (инкрементные) для агрегаций {#using-materialized-views-incremental-for-aggregations}

В предыдущих разделах мы исследовали использование материализованных представлений для трансформации и фильтрации данных. Однако материализованные представления также могут быть использованы для предварительного вычисления агрегатов во время вставки и хранения результата. Этот результат может быть обновлён с учётом результатов последующих вставок, что эффективно позволяет предварительно вычислить агрегаты во время вставки.

Основная идея заключается в том, что результаты часто будут меньшим представлением оригинальных данных (частичным эскизом в случае агрегатов). В сочетании с более простым запросом для чтения результатов из целевой таблицы, время выполнения запросов будет быстрее, чем если бы то же вычисление выполнялось над оригинальными данными.

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

5 строк в результате. Время выполнения: 0.666 сек. Обработано 10.37 миллионов строк, 4.73 ГБ (15.56 миллионов строк/с, 7.10 ГБ/с.)
Пиковое использование памяти: 1.40 MiB.
```

Мы можем представить, что это может быть общей линейной диаграммой, которую пользователи строят с помощью Grafana. Этот запрос, безусловно, очень быстрый - набор данных составляет всего 10 миллионов строк, и ClickHouse быстрый! Однако если мы масштабируем это до миллиардов и триллионов строк, мы, пожалуй, хотели бы сохранить такую производительность запросов.

:::note
Этот запрос будет в 10 раз быстрее, если мы используем таблицу `otel_logs_v2`, которая является результатом нашего предыдущего материализованного представления, извлекающего ключ размера из карты `LogAttributes`. Мы используем сырые данные здесь только в иллюстративных целях и рекомендуем использовать более раннее представление, если это распространённый запрос.
:::

Нам нужна таблица для получения результатов, если мы хотим вычислить это во время вставки, используя материализованное представление. Эта таблица должна хранить всего 1 строку за час. Если обновление поступает для существующего часа, другие столбцы должны объединяться в строку уже существующего часа. Для того чтобы это объединение инкрементальных состояний произошло, частичные состояния должны храниться для других столбцов.

Это требует специального типа движка в ClickHouse: SummingMergeTree. Этот движок заменяет все строки с одинаковым ключом сортировки одной строкой, которая содержит суммированные значения для числовых столбцов. Следующая таблица будет объединять любые строки с одной и той же датой, суммируя любые числовые столбцы.

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Чтобы продемонстрировать наше материализованное представление, предположим, что наша таблица `bytes_per_hour` пуста и ещё не получила никаких данных. Наше материализованное представление выполняет указанный выше `SELECT` на данных, вставленных в `otel_logs` (это будет выполнено по блокам настроенного размера), с результатами, отправляемыми в `bytes_per_hour`. Синтаксис представлен ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Клауза `TO` здесь ключевая, указывая, куда будут отправляться результаты, т.е. в `bytes_per_hour`.

Если мы перезапустим наш OTel Collector и повторно отправим логи, таблица `bytes_per_hour` будет инкрементально заполняться результатом вышеуказанного запроса. По завершении мы можем подтвердить размер нашей `bytes_per_hour` - у нас должна быть 1 строка за час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 строка в результате. Время выполнения: 0.039 сек.
```

Мы эффективно уменьшили количество строк здесь с 10 миллионов (в `otel_logs`) до 113, сохранив результат нашего запроса. Ключевым моментом здесь является то, что если новые логи будут вставлены в таблицу `otel_logs`, новые значения будут отправлены в `bytes_per_hour` для своих соответствующих часов, где они будут автоматически объединены асинхронно в фоновом режиме - благодаря хранению только одной строки за час `bytes_per_hour` будет как небольшим, так и актуальным.

Поскольку объединение строк происходит асинхронно, может быть больше одной строки за час, когда пользователь выполняет запрос. Чтобы гарантировать, что все незавершённые строки будут объединены во время выполнения запроса, у нас есть два варианта:

- Использовать [`FINAL` модификатор](/sql-reference/statements/select/from#final-modifier) в имени таблицы (что мы сделали для запроса подсчёта выше).
- Агрегировать по ключу сортировки, используемому в нашей конечной таблице, т.е. Timestamp и суммировать метрики.

Обычно второй вариант более эффективен и гибок (таблицу можно использовать для других целей), но первый может быть проще для некоторых запросов. Мы показываем оба варианта ниже:

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

5 строк в результате. Время выполнения: 0.008 сек.

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

5 строк в результате. Время выполнения: 0.005 сек.
```

Это ускорило наш запрос с 0.6с до 0.008с - более чем на 75 раз!

:::note
Эти сбережения могут быть ещё больше на более крупных наборах данных с более сложными запросами. См. [здесь](https://github.com/ClickHouse/clickpy) для примеров.
:::
#### Более сложный пример {#a-more-complex-example}

Приведённый выше пример агрегирует простое количество за час, используя [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Статистики, выходящие за рамки простых сумм, требуют для своей работы другого движка целевой таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

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

113 строк в результате. Время выполнения: 0.667 сек. Обработано 10.37 миллионов строк, 4.73 ГБ (15.53 миллионов строк/с., 7.09 ГБ/с.)
```

Чтобы сохранить подсчёт кардинальности для инкрементального обновления, требуется AggregatingMergeTree.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

Чтобы убедиться, что ClickHouse знает, что агрегатные состояния будут храниться, мы определяем столбец `UniqueUsers` как тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая функцию-источник частичных состояний (uniq) и тип исходного столбца (IPv4). Как и в SummingMergeTree, строки с одинаковыми значениями `ORDER BY` будут объединяться (Hour в приведённом выше примере).

Связанное материализованное представление использует предыдущий запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, как мы добавляем суффикс `State` к концу наших агрегатных функций. Это гарантирует, что агрегатное состояние функции возвращается вместо конечного результата. Это будет содержать дополнительную информацию, позволяющую этому частичному состоянию объединяться с другими состояниями.

После того как данные были повторно загружены через перезапуск Collector, мы можем подтвердить, что в таблице `unique_visitors_per_hour` доступно 113 строк.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 строка в результате. Время выполнения: 0.009 сек.
```

Наш финальный запрос должен использовать суффикс Merge для наших функций (так как столбцы хранят частичные состояния агрегации):

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │      4763   │
│ 2019-01-22 00:00:00 │      536    │
└─────────────────────┴─────────────┘

113 строк в результате. Время выполнения: 0.027 сек.
```

Обратите внимание, что здесь мы используем `GROUP BY`, а не `FINAL`.
### Использование материализованных представлений (инкрементные) для быстрого поиска {#using-materialized-views-incremental--for-fast-lookups}

Пользователи должны учитывать свои шаблоны доступа при выборе ключа сортировки ClickHouse с колонками, которые часто используются в условиях фильтрации и агрегации. Это может быть ограничивающим в случаях наблюдаемости, где у пользователей более разнообразные шаблоны доступа, которые нельзя охватить в одном наборе колонок. Это лучше иллюстрируется на примере, встроенном в стандартные схемы OTel. Рассмотрим стандартную схему для трассировок:

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

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. В трассировке пользователям также нужна возможность выполнять поиск по конкретному `TraceId` и получать связанные spans. Хотя это присутствует в ключе сортировки, его позиция в конце означает, что [фильтрация будет не такой эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) и, вероятно, значит, что при извлечении одной трассировки потребуется сканировать значительное количество данных.

OTel collector также устанавливает материализованное представление и связанную таблицу, чтобы решить эту задачу. Таблица и представление представлены ниже:

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

Представление эффективно обеспечивает наличие минимальной и максимальной временной метки для трассы в таблице `otel_traces_trace_id_ts`. Эта таблица, упорядоченная по `TraceId`, позволяет эффективно извлекать эти временные интервалы. Эти диапазоны времени могут, в свою очередь, использоваться при запросе основной таблицы `otel_traces`. Более конкретно, при извлечении трассы по её id Grafana использует следующий запрос:

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

CTE здесь определяет минимальную и максимальную временную метку для идентификатора трассы `ae9226c78d1d360601e6383928e4d22d`, прежде чем использовать это для фильтрации основной таблицы `otel_traces` для её связанных spans.

Этот же подход можно применить для аналогичных шаблонов доступа. Мы исследуем похожий пример в Моделировании Данных [здесь](/materialized-view/incremental-materialized-view#lookup-table).
### Использование проекций {#using-projections}

Проекции ClickHouse позволяют пользователям указывать несколько клауз `ORDER BY` для таблицы.

В предыдущих разделах мы исследовали, как материализованные представления могут использоваться в ClickHouse для предварительного вычисления агрегатов, преобразования строк и оптимизации запросов наблюдаемости для различных шаблонов доступа.

Мы привели пример, где материализованное представление отправляет строки в целевую таблицу с другим ключом сортировки, чем оригинальная таблица, принимающая вставки, для оптимизации поиска по идентификатору трассы.

Проекции могут использоваться для решения той же проблемы, позволяя пользователю оптимизировать запросы по столбцу, который не является частью первичного ключа.

На теоретическом уровне эта возможность может использоваться для предоставления нескольких ключей сортировки для таблицы с одним отличительным недостатком: дублированием данных. В частности, данные должны быть записаны в порядке основного первичного ключа вдобавок к порядку, указанному для каждой проекции. Это замедлит вставки и потребует больше места на диске.

:::note Проекции против материализованных представлений
Проекции предлагают многие из тех же возможностей, что и материализованные представления, но должны использоваться умеренно, поскольку в большинстве случаев предпочтительнее последние. Пользователи должны понимать недостатки и когда они уместны. Например, хотя проекции могут использоваться для предварительного вычисления агрегатов, мы рекомендуем пользователям использовать материализованные представления для этой задачи.
:::

<Image img={observability_13} alt="Наблюдаемость и проекции" size="md"/>

Рассмотрим следующий запрос, который фильтрует таблицу `otel_logs_v2` по кодам ошибки 500. Это, вероятно, распространённый шаблон доступа для логирования, когда пользователи хотят фильтровать по кодам ошибок:

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 строк в результате. Время выполнения: 0.177 сек. Обработано 10.37 миллионов строк, 685.32 MB (58.66 миллионов строк/с., 3.88 ГБ/с.)
Пиковое использование памяти: 56.54 MiB.
```

:::note Используйте Null для оценки производительности
Мы не выводим результаты здесь, используя `FORMAT Null`. Это заставляет все результаты считываться, но не возвращаться, тем самым предотвращая преждевременное завершение запроса из-за LIMIT. Это нужно только для того, чтобы показать время, затраченное на сканирование всех 10 млн строк.
:::

Приведённый выше запрос требует линейного сканирования с нашим выбранным ключом сортировки `(ServiceName, Timestamp)`. Хотя мы могли бы добавить `Status` в конец ключа сортировки, улучшая производительность для указанного выше запроса, мы можем также добавить проекцию.

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

Обратите внимание, что мы сначала должны создать проекцию, а затем материализовать её. Эта последняя команда вызывает сохранение данных дважды на диске в двух различных порядках. Проекцию также можно определить при создании данных, как показано ниже, и она будет автоматически поддерживаться по мере вставки данных.

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

Важно отметить, что если проекция создается с помощью `ALTER`, её создание происходит асинхронно, когда команда `MATERIALIZE PROJECTION` выполняется. Пользователи могут подтвердить ход этой операции с помощью следующего запроса, дожидаясь `is_done=1`.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 строка в результате. Время выполнения: 0.008 сек.
```

Если мы повторим приведённый выше запрос, мы увидим, что производительность значительно улучшилась за счёт дополнительного хранилища (см. ["Измерение размера таблицы и сжатие"](#measuring-table-size--compression) для информации о том, как это измерить).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 строк в результате. Время выполнения: 0.031 сек. Обработано 51.42 тысячи строк, 22.85 MB (1.65 миллиона строк/с., 734.63 MB/с.)
Пиковое использование памяти: 27.85 MiB.
```

В приведённом выше примере мы указываем столбцы, используемые в предыдущем запросе, в проекции. Это будет означать, что только эти указанные столбцы будут храниться на диске в части проекции, упорядоченной по Status. Если, наоборот, мы использовали бы `SELECT *`, все столбцы были бы сохранены. Хотя это и позволило бы большему количеству запросов (испанованным любым подмножеством столбцов) выиграть от проекции, возникнет дополнительное потребление хранилища. Для измерения дискового пространства и сжатия см. ["Измерение размера таблицы и сжатие"](#measuring-table-size--compression).
### Вторичные / Индексы пропуска данных {#secondarydata-skipping-indices}

Как бы хорошо ни был настроен первичный ключ в ClickHouse, некоторые запросы неизбежно потребуют полных сканирований таблиц. Хотя это можно смягчить, используя материализованные представления (и проекции для некоторых запросов), такие подходы требуют дополнительного обслуживания, и пользователи должны быть осведомлены о их наличии, чтобы убедиться, что они будут использованы. В то время как традиционные реляционные базы данных решают эту задачу с помощью вторичных индексов, они неэффективны в колонкоориентированных базах данных, таких как ClickHouse. Вместо этого ClickHouse использует индексы "Пропуск", которые могут значительно улучшить производительность запросов, позволяя базе данных пропускать большие блоки данных без совпадающих значений.

Стандартные схемы OTel используют вторичные индексы в попытке ускорить доступ к доступу к картам. Хотя мы считаем их вообще неэффективными и не рекомендуем копировать их в вашу пользовательскую схему, индексы пропуска все ещё могут быть полезными.

Пользователи должны прочитать и понять [руководство по вторичным индексам](/optimize/skipping-indexes) перед попыткой их применения.

**В общем, они эффективны, когда существует сильная корреляция между первичным ключом и целевым, не первичным столбцом/выражением, и пользователи ищут редкие значения, т.е. те, которые не встречаются во многих гранулах.**
### Фильтры Блума для текстового поиска {#bloom-filters-for-text-search}

Для запросов мониторинга вторичные индексы могут быть полезны, когда пользователи нуждаются в выполнении текстовых поисков. В частности, индексы фильтров Блума на основе `ngram` и токенов [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) и [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) могут использоваться для ускорения поиска по колонкам типа String с операторами `LIKE`, `IN` и hasToken. Важно отметить, что индекс на основе токенов генерирует токены, используя неалфавитные символы в качестве разделителей. Это означает, что только токены (или целые слова) могут быть сопоставлены во время выполнения запроса. Для более тонкого сопоставления можно использовать [фильтр Блума N-грамм](/optimize/skipping-indexes#bloom-filter-types). Этот метод разбивает строки на N-граммы заданного размера, позволяя выполнять сопоставление подслов.

Чтобы оценить токены, которые будут сгенерированы, и, следовательно, сопоставлены, можно использовать функцию `tokens`:

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
ClickHouse также имеет экспериментальную поддержку обратных индексов в качестве вторичного индекса. Мы в настоящее время не рекомендуем их для наборов данных журналов, но ожидаем, что они заменят токенизированные фильтры Блума, когда те будут готовы к производству.
:::

В целях этого примера мы используем набор данных структурированных журналов. Предположим, мы хотим подсчитать журналы, в которых колонка `Referer` содержит `ultra`.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

Здесь нам необходимо сопоставить размер N-граммы 3. Поэтому мы создаем индекс `ngrambf_v1`.

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

Индекс `ngrambf_v1(3, 10000, 3, 7)` принимает четыре параметра. Последний из них (значение 7) представляет собой сид. Остальные представляют собой размер N-граммы (3), значение `m` (размер фильтра) и количество хеш-функций `k` (7). `k` и `m` требуют настройки и будут зависеть от количества уникальных N-грамм/токенов и вероятности того, что фильтр приведет к ложному отрицанию - что подтверждает отсутствие значения в грануле. Мы рекомендуем [эти функции](/engines/table-engines/mergetree-family/mergetree#bloom-filter) для помощи в установке этих значений.

Если настроить правильно, ускорение может быть значительным:

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
Вышеуказанное предназначено исключительно для иллюстрации. Мы рекомендуем пользователям извлекать структуру из своих журналов при вставке, а не пытаться оптимизировать текстовые поиски, используя токенизированные фильтры Блума. Тем не менее, есть случаи, когда у пользователей есть трассировки стека или другие большие строки, для которых текстовый поиск может быть полезен из-за менее детерминированной структуры.
:::

Некоторые общие рекомендации по использованию фильтров Блума:

Целью фильтра Блума является фильтрация [гранул](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), таким образом, чтобы избежать необходимости загружать все значения для колонки и выполнять линейный просмотр. Клаузула `EXPLAIN` с параметром `indexes=1` может быть использована для определения количества гранул, которые были пропущены. Рассмотрим ответы ниже для исходной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с фильтром Блума N-грамм.

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

Фильтр Блума обычно будет быстрее только в том случае, если он меньше, чем колонка сама по себе. Если он больше, то выгода в производительности, вероятно, будет незначительной. Сравните размер фильтра с колонкой, используя следующие запросы:

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

В приведенных выше примерах мы можем видеть, что второй индекс фильтра Блума занимает 12MB - почти в 5 раз меньше, чем сжатый размер колонки, которая составляет 56MB.

Фильтры Блума могут требовать значительной настройки. Мы рекомендуем следовать заметкам [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые могут быть полезны для определения оптимальных настроек. Фильтры Блума также могут быть затратными во время вставки и слияния. Пользователи должны оценить влияние на производительность вставки перед добавлением фильтров Блума в производство.

Дополнительные сведения о вторичных индексации пропусков можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).
### Извлечение из карт {#extracting-from-maps}

Тип Map широко распространен в схемах OTel. Этот тип требует, чтобы значения и ключи имели один и тот же тип, что достаточно для метаданных, таких как метки Kubernetes. Имейте в виду, что при запросе подключа ключа типа Map загружается весь родительский столбец. Если у карты много ключей, это может привести к значительному штрафу за запрос, поскольку необходимо прочитать больше данных с диска, чем если бы ключ существовал как отдельная колонка.

Если вы часто запрашиваете конкретный ключ, рассмотрите возможность перемещения его в собственный выделенный столбец на корне. Это, как правило, задача, которая выполняется в ответ на общие паттерны доступа и после развертывания и может быть трудно предсказать до начала эксплуатации. См. ["Управление изменениями схемы"](/observability/managing-data#managing-schema-changes) о том, как изменить вашу схему после развертывания.
## Измерение размера таблицы и сжатия {#measuring-table-size--compression}

Одной из основных причин, по которой ClickHouse используется для мониторинга, является сжатие.

Помимо значительного снижения затрат на хранение, меньшее количество данных на диске означает меньший ввод-вывод и более быстрые запросы и вставки. Снижение ввода-вывода перевешивает накладные расходы любого алгоритма сжатия относительно CPU. Улучшение сжатия данных должно быть первоочередной задачей при попытке гарантировать, что запросы ClickHouse выполняются быстро.

Подробности о измерении сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).
