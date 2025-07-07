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

Мы рекомендуем пользователям всегда создавать свою собственную схему для логов и трейсов по следующим причинам:

- **Выбор первичного ключа** - Стандартные схемы используют `ORDER BY`, который оптимизирован для определённых шаблонов доступа. Мало вероятно, что ваши шаблоны доступа совпадут с этим.
- **Извлечение структуры** - Пользователи могут захотеть извлекать новые колонки из существующих колонок, например, из колонки `Body`. Это можно сделать с помощью материализованных колонок (и материализованных представлений в более сложных случаях). Это требует изменений в схеме.
- **Оптимизация Maps** - Стандартные схемы используют тип Map для хранения атрибутов. Эти колонки позволяют хранить произвольные метаданные. Несмотря на то, что это необходимость, так как метаданные из событий часто не определены заранее и поэтому не могут быть сохранены в строго типизированной базе данных, такой как ClickHouse, доступ к ключам карты и их значениям не так эффективен, как доступ к обычной колонке. Мы решаем это, модифицируя схему и обеспечивая, чтобы наиболее часто используемые ключи карты были верхнеуровневыми колонками - см. ["Извлечение структуры с помощью SQL"](#extracting-structure-with-sql). Это также требует изменения схемы.
- **Упрощение доступа к ключам карты** - Доступ к ключам в картах требует более многословного синтаксиса. Пользователи могут смягчить это с помощью алиасов. См. ["Использование алиасов"](#using-aliases) для упрощения запросов.
- **Вторичные индексы** - Стандартная схема использует вторичные индексы для ускорения доступа к Maps и ускорения текстовых запросов. Обычно они не требуются и занимают дополнительное место на диске. Их можно использовать, но следует протестировать, чтобы убедиться, что они необходимы. См. ["Вторичные / Индексы пропуска данных"](#secondarydata-skipping-indices).
- **Использование кодеков** - Пользователи могут захотеть настроить кодеки для колонок, если они понимают ожидаемые данные и имеют доказательства того, что это улучшает сжатие.

_Мы подробно описываем каждый из вышеуказанных случаев использования ниже._

**Важно:** Хотя пользователям рекомендуется расширять и изменять свою схему для достижения оптимального сжатия и производительности запросов, они должны придерживаться наименований схемы OTel для основных колонок, когда это возможно. Плагин ClickHouse Grafana предполагает наличие некоторых основных колонок OTel для помощи в построении запросов, например, Timestamp и SeverityText. Требуемые колонки для логов и трейсов задокументированы здесь [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) соответственно. Вы можете изменить эти имена колонок, переопределив стандартные значения в конфигурации плагина.
## Извлечение структуры с помощью SQL {#extracting-structure-with-sql}

Независимо от того, принимаете ли вы структурированные или неструктурированные логи, пользователям часто требуется возможность:

- **Извлекать колонки из строковых BLOBов**. Запросы к ним будут быстрее, чем использование строковых операций при выполнении запроса.
- **Извлекать ключи из карт**. Стандартная схема помещает произвольные атрибуты в колонки типа Map. Этот тип предоставляет безсхемную возможность, которая имеет преимущество в том, что пользователи не должны заранее определять колонки для атрибутов при определении логов и трейсов - это часто невозможно, когда логи собираются из Kubernetes и необходимо обеспечить сохранение меток подов для последующего поиска. Доступ к ключам карты и их значениям медленнее, чем запросы к обычным колонкам ClickHouse. Извлечение ключей из карт в корневые колонки таблицы, следовательно, часто желательно.

Рассмотрим следующие запросы:

Предположим, мы хотим подсчитать, какие URL-адреса получают наибольшее количество POST-запросов с использованием структурированных логов. JSON BLOB хранится в колонке `Body` как строка. Кроме того, он может также храниться в колонке `LogAttributes` как `Map(String, String)`, если пользователь включил json_parser в сборщике.

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

Предположим, что `LogAttributes` доступен, запрос для подсчета, какие URL-адреса сайта получают наибольшее количество POST-запросов:

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

Обратите внимание на использование синтаксиса карты здесь, например `LogAttributes['request_path']`, и функцию [`path`](#) для удаления параметров запроса из URL.

Если пользователь не включил разбор JSON в сборщике, то `LogAttributes` будет пустым, и нам придется использовать [функции JSON](#) для извлечения колонок из строкового `Body`.

:::note Предпочитайте ClickHouse для разбора
Мы обычно рекомендуем пользователям выполнять разбор JSON в ClickHouse для структурированных логов. Мы уверены, что ClickHouse - это самое быстрое реализация разбора JSON. Однако мы понимаем, что пользователи могут захотеть отправить логи в другие источники и не хотят, чтобы эта логика располагалась в SQL.
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

Аналогичный запрос для неструктурированных логов требует использования регулярных выражений через функцию [`extractAllGroupsVertical`](#).

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

Возросшая сложность и стоимость запросов для разбора неструктурированных логов (обратите внимание на разницу в производительности) - вот почему мы рекомендуем пользователям всегда использовать структурированные логи, когда это возможно.

:::note Рассмотрите словари
Вышеупомянутый запрос можно оптимизировать для использования регулярных выражений словарей. См. [Использование словарей](#using-dictionaries) для получения более подробной информации.
:::

Оба этих случая использования могут быть удовлетворены с помощью ClickHouse, переместив вышеупомянутую логику запросов на время вставки. Мы исследуем несколько подходов ниже, подчеркивая, когда каждый из них подходит.

:::note OTel или ClickHouse для обработки?
Пользователи также могут выполнять обработку с помощью процессоров и операторов OTel Collector, как описано [здесь](#). В большинстве случаев пользователи обнаружат, что ClickHouse значительно эффективнее по ресурсам и быстрее, чем процессоры сборщика. Основной недостаток выполнения всей обработки событий в SQL - это связывание вашего решения с ClickHouse. Например, пользователи могут захотеть отправить обработанные логи в альтернативные назначения из сборщика OTel, например, S3.
:::
### Материализованные колонки {#materialized-columns}

Материализованные колонки предлагают простейшее решение для извлечения структуры из других колонок. Значения таких колонок всегда вычисляются в момент вставки и не могут быть указаны в запросах INSERT.

:::note Нагрузки
Материализованные колонки имеют дополнительные накладные расходы по хранению, так как значения извлекаются в новые колонки на диске в момент вставки.
:::

Материализованные колонки поддерживают любое выражение ClickHouse и могут использовать любые аналитические функции для [обработки строк](#) (включая [регулярные выражения и поиск](#) и [URL](#), выполняя [преобразования типов](#), [извлекая значения из JSON](#) или [математические операции](#).

Мы рекомендуем материализованные колонки для базовой обработки. Они особенно полезны для извлечения значений из карт, продвижения их к корневым колонкам и выполнения преобразований типов. Они наиболее полезны, когда используются в очень простых схемах или в сочетании с материализованными представлениями. Рассмотрим следующую схему для логов, из которых JSON был извлечён в колонку `LogAttributes` сборщиком:

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

Эквивалентная схема для извлечения с помощью функций JSON из строкового `Body` может быть найдена [здесь](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==).

Наши три материлизованные колонки извлекают страницу запроса, тип запроса и домен реферера. Эти колонки получают доступ к ключам карты и применяют функции к их значениям. Наш последующий запрос значительно быстрее:

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
Материализованные колонки по умолчанию не будут возвращаться в `SELECT *`. Это необходимо для сохранения инварианта, что результат `SELECT *` всегда может быть снова вставлен в таблицу с помощью INSERT. Это поведение можно отключить, установив `asterisk_include_materialized_columns=1`, и можно включить в Grafana (см. `Дополнительные настройки -> Пользовательские настройки` в конфигурации источника данных).
:::
## Материализованные представления {#materialized-views}

[Материализованные представления](#) предоставляют более мощные средства для применения SQL-фильтрации и трансформаций к логам и трейсам.

Материализованные представления позволяют пользователям перенести затраты на вычисление с времени запроса на время вставки. Материализованное представление ClickHouse - это просто триггер, который запускает запрос на блоках данных по мере их вставки в таблицу. Результаты этого запроса вставляются во вторую "целевую" таблицу.

<Image img={observability_10} alt="Материализованное представление" size="md"/>

:::note Обновления в реальном времени
Материализованные представления в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на которой они основаны, функционируя больше как постоянно обновляющиеся индексы. В отличие от этого, в других базах данных материализованные представления обычно являются статическими моментами запроса, которые должны быть обновлены (аналогично обновляемым материализованным представлениям ClickHouse).
:::

Запрос, связанный с материализованным представлением, теоретически может быть любым запросом, включая агрегацию, хотя [существуют ограничения с Joins](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для трансформаций и рабочих нагрузок фильтрации, требуемых для логов и трейсов, пользователи могут считать любое выражение `SELECT` возможным.

Пользователи должны помнить, что запрос - это просто триггер, выполняющийся над строками, вставляемыми в таблицу (исходная таблица), с результатами, отправляемыми в новую таблицу (целевую таблицу).

Чтобы убедиться, что мы не сохраняем данные дважды (в исходной и целевой таблицах), мы можем изменить движок таблицы исходной таблицы на [Null table engine](#), сохраняя исходную схему. Наши сборщики OTel будут продолжать отправлять данные в эту таблицу. Например, для логов таблица `otel_logs` становится:

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

Null table engine - это мощная оптимизация - рассматривайте её как `/dev/null`. Эта таблица не будет хранить никакие данные, но любые прикрепленные материализованные представления будут все равно выполняться над вставленными строками, прежде чем они будут отброшены.

Рассмотрим следующий запрос. Он преобразует наши строки в формат, который мы хотим сохранить, извлекая все колонки из `LogAttributes` (предполагаем, что это было установлено сборщиком с использованием оператора `json_parser`), устанавливая `SeverityText` и `SeverityNumber` (на основе некоторых простых условий и определения [этих колонок](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В этом случае мы также выбираем только те колонки, которые мы знаем, что будут заполнены - игнорируя такие колонки, как `TraceId`, `SpanId` и `TraceFlags`.

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

Мы также извлекаем колонку `Body` выше - на случай, если позже будут добавлены дополнительные атрибуты, которые не извлечены нашим SQL. Эта колонка должна хорошо сжиматься в ClickHouse и будет редко запрашиваться, таким образом, не влияя на производительность запроса. Наконец, мы уменьшаем Timestamp до DateTime (для экономии места - см. ["Оптимизация типов"](#optimizing-types)) с приведением типов.

:::note Условия
Обратите внимание на использование [условий](#) выше для извлечения `SeverityText` и `SeverityNumber`. Они чрезвычайно полезны для формулирования сложных условий и проверки наличия значений в картах - мы наивно предполагаем, что все ключи присутствуют в `LogAttributes`. Рекомендуем пользователям стать с ними знакомыми - они ваши союзники в разбираемом логировании, помимо функций для обработки [нулевых значений](#)!
:::

Нам нужна таблица для получения этих результатов. Ниже целевая таблица соответствует вышеизложенному запросу:

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

Выбранные здесь типы основываются на оптимизациях, обсужденных в ["Оптимизация типов"](#optimizing-types).

:::note
Обратите внимание, как мы кардинально изменили нашу схему. На практике пользователи, вероятно, также захотят сохранить колонки Trace, а также колонку `ResourceAttributes` (она обычно содержит метаданные Kubernetes). Grafana может использовать колонки Trace для обеспечения функциональности соединения между логами и трейса - см. ["Использование Grafana"](#).
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

Это визуализируется ниже:

<Image img={observability_11} alt="Otel MV" size="md"/>

Если мы теперь перезапустим конфигурацию сборщика, используемую в ["Экспорт в ClickHouse"](#), данные появятся в `otel_logs_v2` в нашем желаемом формате. Обратите внимание на использование типизированных функций извлечения JSON.

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

Эквивалентное материализованное представление, которое полагается на извлечение колонок из колонки `Body` с использованием функций JSON, показано ниже:

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
        JSONExtractString(Body, 'remote_addr') AS RemoteAddress,
        domain(JSONExtractString(Body, 'referer')) AS RefererDomain,
        path(JSONExtractString(Body, 'request_path')) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```
### Остерегайтесь типов {#beware-types}

Вышеупомянутые материализованные представления полагаются на неявные приведения типов - особенно в случае использования карты `LogAttributes`. ClickHouse часто прозрачно приводит извлечённое значение к типу целевой таблицы, уменьшая необходимый синтаксис. Тем не менее, мы рекомендуем пользователям всегда тестировать свои представления, используя оператор `SELECT` представлений с оператором [`INSERT INTO`](/sql-reference/statements/insert-into) с таблицей назначения, использующей ту же схему. Это должно подтвердить, что типы обрабатываются правильно. Особое внимание следует уделить следующим случаям:

- Если ключ не существует в карте, будет возвращена пустая строка. В случае чисел пользователям нужно будет сопоставить их с соответствующим значением. Это можно сделать с помощью [условий](#) например `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` или [функций приведения типов](#), если значения по умолчанию приемлемы, например `toUInt8OrDefault(LogAttributes['status'] )`.
- Некоторые типы не всегда будут приведены, например строковые представления чисел не будут приведены к значениям enum.
- Функции извлечения JSON возвращают значения по умолчанию для своего типа, если значение не найдено. Убедитесь, что эти значения имеют смысл!

:::note Избегать Nullable
Избегайте использования [Nullable](/sql-reference/data-types/nullable) в ClickHouse для данных Объективности. Чаще всего не требуется различать пустые и нулевые значения в логах и трейсам. Эта функция влечет за собой дополнительные накладные расходы по хранению и негативно влияет на производительность запросов. См. [здесь](/data-modeling/schema-design#optimizing-types) для получения дополнительных сведений.
:::
## Выбор первичного (упорядоченного) ключа {#choosing-a-primary-ordering-key}

После того, как вы извлекли желаемые колонки, вы можете начать оптимизацию своего упорядоченного/первоночального ключа.

Можно применить несколько простых правил, чтобы помочь в выборе упорядоченного ключа. Следующие правила иногда могут противоречить друг другу, поэтому рассмотрите их в порядке. Пользователи могут определить множество ключей в этом процессе, при этом 4-5 будет обычно достаточным:

1. Выберите колонки, которые соответствуют вашим общим фильтрам и шаблонам доступа. Если пользователи, как правило, начинают расследования мониторинга, фильтруя по конкретной колонке, например, имени пода, эта колонка будет часто использоваться в `WHERE` условиях. Предпочитайте включать их в свой ключ больше, чем те, которые используются реже.
2. Предпочитайте колонки, которые помогают исключить большой процент от общего количества строк при фильтрации, уменьшая таким образом объем данных, который необходимо читать. Имена служб и коды статуса часто являются хорошими кандидатами - в последнем случае только если пользователи фильтруют по значениям, которые исключают большинство строк, например, фильтрация по 200-запросам будет соответствовать большинству строк, по сравнению с 500 ошибками, которые будут соответствовать меньшему подмножеству.
3. Предпочитайте колонки, которые, вероятно, будут сильно коррелировать с другими колонками в таблице. Это поможет обеспечить, чтобы эти значения также хранились подряд, улучшая сжатие.
4. Операции `GROUP BY` и `ORDER BY` для колонок в упорядоченном ключе могут быть сделаны более эффективно по памяти.

<br />

Выявив подмножество колонок для упорядоченного ключа, их необходимо объявить в определенном порядке. Этот порядок может значительно повлиять как на эффективность фильтрации по вторичным ключевым колонкам в запросах, так и на коэффициент сжатия файлов данных таблицы. В общем случае **лучше всего упорядочивать ключи в порядке возрастания кардинальности**. Это следует балансировать с тем фактом, что фильтрация по колонкам, которые появляются позднее в упорядоченном ключе, будет менее эффективна, чем фильтрация по тем, которые появляются раньше в кортеже. Сбалансируйте эти поведения и рассмотрите свои шаблоны доступа. Более всего, протестируйте различные варианты. Для дальнейшего понимания упорядоченных ключей и способов их оптимизации мы рекомендуем [эту статью](#).

:::note Структура сначала
Мы рекомендуем определять ваши упорядоченные ключи после того, как вы структурировали свои логи. Не используйте ключи в атрибутах карт для упорядоченного ключа или выражениях извлечения JSON. Убедитесь, что ваши упорядоченные ключи являются корневыми колонками в вашей таблице.
:::
## Использование карт {#using-maps}

Ранее приведенные примеры показывают использование синтаксиса карты `map['key']` для доступа к значениям в колонках `Map(String, String)`. Кроме использования нотации карты для доступа к вложенным ключам, доступны специализированные функции ClickHouse [map functions](/sql-reference/functions/tuple-map-functions#mapkeys) для фильтрации или выбора этих колонок.

Например, следующий запрос идентифицирует все уникальные ключи, доступные в колонке `LogAttributes`, с помощью функции [`mapKeys`]( /sql-reference/functions/tuple-map-functions#mapkeys), за которой следует функция [`groupArrayDistinctArray`]( /sql-reference/aggregate-functions/combinators) (комбинатор).

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
Не рекомендуется использовать точки в именах колонок Map, и мы можем устареть ее использование. Используйте `_`.
:::
## Использование псевдонимов {#using-aliases}

Запросы к типам карт медленнее, чем к обычным колонкам - см. ["Ускорение запросов"](#accelerating-queries). Кроме того, это более синтаксически сложно и может быть громоздко для пользователей. Чтобы решить эту последнюю проблему, мы рекомендуем использовать колонки Alias.

Колонки ALIAS вычисляются во время запроса и не хранятся в таблице. Поэтому невозможно ВСТАВИТЬ значение в колонку этого типа. Используя псевдонимы, мы можем ссылаться на ключи карт и упрощать синтаксис, прозрачно открывать записи карты как обычную колонку. Рассмотрим следующий пример:

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

У нас есть несколько материализованных колонок и одна колонка `ALIAS`, `RemoteAddr`, которая получает доступ к карте `LogAttributes`. Теперь мы можем запрашивать значения `LogAttributes['remote_addr']` через эту колонку, тем самым упрощая наш запрос, т.е.

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

Более того, добавление `ALIAS` является тривиальным с помощью команды `ALTER TABLE`. Эти колонки доступны немедленно, например:

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

:::note Псевдонимы по умолчанию исключены
По умолчанию `SELECT *` исключает колонки ALIAS. Это поведение можно отключить, установив `asterisk_include_alias_columns=1`.
:::
## Оптимизация типов {#optimizing-types}

[Общие лучшие практики ClickHouse](/data-modeling/schema-design#optimizing-types) для оптимизации типов применимы к использованию ClickHouse.
## Использование кодеков {#using-codecs}

В дополнение к оптимизации типов, пользователи могут следовать [общим лучшим практикам для кодеков](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) при попытке оптимизировать сжатие для схем наблюдаемости ClickHouse.

В общем, пользователи найдут кодек `ZSTD` весьма применимым к наборам данных для журналирования и трассировки. Увеличение значения сжатия с его значения по умолчанию 1 может улучшить сжатие. Однако это должно быть протестировано, так как более высокие значения требуют больших затрат CPU в момент вставки. Обычно мы видим небольшую выгоду от увеличения этого значения.

Кроме того, временные метки, хотя и выигрывают от дельта-кодирования с точки зрения сжатия, показали замедление производительности запросов, если этот столбец используется в первичном/упорядочивающем ключе. Мы рекомендуем пользователям оценить соответствующие компромиссы между сжатием и производительностью запросов.
## Использование словарей {#using-dictionaries}

[Словари](/sql-reference/dictionaries) являются [ключевой функцией](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) ClickHouse, предоставляющие представление данных в памяти [ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources), оптимизированных для очень быстрой выборки.

<Image img={observability_12} alt="Наблюдаемость и словари" size="md"/>

Это удобно в различных сценариях, от обогащения принимаемых данных на лету без замедления процесса приема и улучшения производительности запросов в целом, при этом JOINы особенно выигрывают. Хотя JOINы редко требуются в сценариях наблюдаемости, словари все же могут быть полезны для обогащения - как во время вставки, так и во время запроса. Ниже мы предоставляем примеры обоих случаев.

:::note Ускорение соединений
Пользователи, заинтересованные в ускорении соединений с помощью словарей, могут найти дополнительные сведения [здесь](/dictionary).
:::
### Время вставки vs время запроса {#insert-time-vs-query-time}

Словари могут использоваться для обогащения наборов данных как во время запроса, так и во время вставки. Каждому из этих подходов свойственны свои плюсы и минусы. В общем:

- **Время вставки** - Это обычно подойдет, если значение обогащения не изменяется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки избегает времени поиска в словаре. Это отрицательно сказывается на производительности вставки, а также создает добавленную нагрузку на хранилище, так как обогащенные значения будут храниться как колонки.
- **Время запроса** - Если значения в словаре часто меняются, запросы на поиск по времени запроса часто более применимы. Это исключает необходимость обновления колонок (и переписывания данных), если сопоставленные значения изменяются. Эта гибкость обеспечивается за счет дополнительных затрат на поиск во время запроса. Эти затраты на время запроса обычно ощутимы, если поиск требуется для многих строк, например, при использовании поиска по словарю в условии фильтра. Для обогащения результата, т.е. в `SELECT`, эти дополнительные затраты обычно незаметны.

Мы рекомендуем пользователям ознакомиться с основами работы со словарями. Словари предоставляют таблицу поиска в памяти, из которой значения могут быть извлечены с помощью специализированных [функций]( /sql-reference/functions/ext-dict-functions#dictgetall).

Для простых примеров обогащения смотрите руководство по словарям [здесь](/dictionary). Ниже мы сосредоточимся на общих задачах обогащения для наблюдаемости.
### Использование IP-словарей {#using-ip-dictionaries}

Гео-обогащение журналов и трассировок значениями широты и долготы с использованием IP-адресов является обычным требованием наблюдаемости. Мы можем достичь этого с помощью структурированного словаря `ip_trie`.

Мы используем общедоступный [набор данных DB-IP на уровне города](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставленный [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [readme](https://github.com/sapics/ip-location-db#csv-format) мы видим, что данные структурированы следующим образом:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

Учитывая эту структуру, давайте начнем с того, чтобы взглянуть на данные с помощью табличной функции [url()](/sql-reference/table-functions/url):

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

Чтобы облегчить нашу жизнь, давайте использовать табличный движок [`URL()`](/engines/table-engines/special/url) для создания объекта таблицы ClickHouse с нашими именами полей и подтвердить общее количество строк:

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

Поскольку наш словарь `ip_trie` требует, чтобы диапазоны IP-адресов выражались в нотации CIDR, нам нужно преобразовать `ip_range_start` и `ip_range_end`.

Этот CIDR для каждого диапазона можно лаконично вычислить с помощью следующего запроса:

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
В приведенном выше запросе много деталей. Для заинтересованных пользователей прочитайте это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). В противном случае примите во внимание, что вышеуказанный запрос вычисляет CIDR для диапазона IP.
:::

Для наших целей нам нужны только диапазон IP, код страны и координаты, поэтому давайте создадим новую таблицу и вставим наши Geo IP данные:

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

Чтобы выполнять выборки с низкой задержкой IP в ClickHouse, мы воспользуемся словарями для хранения соответствий ключ -> атрибуты для наших Geo IP данных в памяти. ClickHouse предоставляет структуру словаря `ip_trie` [dictionary structure](/sql-reference/dictionaries#ip_trie) для сопоставления наших сетевых префиксов (CIDR-блоков) с координатами и кодами стран. Следующий запрос определяет словарь, используя эту структуру и вышеуказанную таблицу в качестве источника.

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

Мы можем выбрать строки из словаря и подтвердить, что этот набор данных доступен для выборок:

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
Словари в ClickHouse периодически обновляются на основе данных исходной таблицы и используемого выше условия жизни. Чтобы обновить наш гео IP словарь, чтобы отразить последние изменения в наборе данных DB-IP, нам просто нужно повторно вставить данные из удаленной таблицы geoip_url в нашу таблицу `geoip` с применением преобразований.
:::

Теперь, когда у нас загружены данные Geo IP в словарь `ip_trie` (удобно также названный `ip_trie`), мы можем использовать его для геолокации IP. Это можно сделать, используя функцию [`dictGet()`](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Обратите внимание на скорость извлечения здесь. Это позволяет нам обогащать журналы. В данном случае мы решили **выполнить обогащение во время запроса**.

Возвращаясь к нашему исходному набору данных журналов, мы можем использовать вышеуказанное для агрегации наших журналов по странам. Следующий запрос предполагает, что мы используем схему, полученную из нашего предыдущего материализованного представления, в которой есть извлеченная колонка `RemoteAddress`.

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

Поскольку сопоставление IP к географической локации может измениться, пользователи вероятно захотят знать, откуда пришел запрос в момент его отправки - а не о том, каково текущее географическое местоположение для того же адреса. По этой причине, вероятно, предпочтительно обогащение во время индексации. Это можно сделать с помощью материализованных колонок, как показано ниже, или в запросе материализованного представления:

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

:::note Регулярное обновление
Пользователи, вероятно, захотят, чтобы словарь обогащения IP периодически обновлялся на основе новых данных. Это можно достичь с помощью условия `LIFETIME` словаря, которое заставит словарь периодически перезагружаться из исходной таблицы. Чтобы обновить исходную таблицу, смотрите ["Обновляемые материализованные представления"](/materialized-view/refreshable-materialized-view).
:::

Указанные выше страны и координаты предлагают возможности визуализации, помимо группировки и фильтрации по странам. Для вдохновения смотрите ["Визуализация геоданных"](/observability/grafana#visualizing-geo-data).
### Использование Регулярных Словарей (Парсинг User Agent) {#using-regex-dictionaries-user-agent-parsing}

Парсинг [строк user-agent](https://en.wikipedia.org/wiki/User_agent) является классической проблемой регулярного выражения и общей необходимостью для наборов данных на основе журналов и трассировок. ClickHouse предоставляет эффективный парсинг user agents с использованием Словарей Регулярных Выражений.

Словари регулярных выражений определяются в ClickHouse с использованием типа источника словаря YAMLRegExpTree, который предоставляет путь к YAML-файлу, содержащему дерево регулярных выражений. Если вы хотите предоставить свой собственный словарь регулярных выражений, информация о требуемой структуре может быть найдена [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse). Ниже мы сосредоточимся на парсинге user-agent, используя [uap-core](https://github.com/ua-parser/uap-core) и загрузим наш словарь для поддерживаемого формата CSV. Этот подход совместим с OSS и ClickHouse Cloud.

:::note
В приведенных ниже примерах мы используем снимки самых последних регулярных выражений uap-core для парсинга user-agent с июня 2024 года. Последний файл, который иногда обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Пользователи могут следовать шагам [здесь](/sql-reference/dictionaries#collecting-attribute-values) для загрузки в CSV файл, используемый ниже.
:::

Создайте следующие таблицы Memory. Эти таблицы хранят наши регулярные выражения для парсинга устройств, браузеров и операционных систем.

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

Эти таблицы могут быть заполнены из следующих файлов CSV, которые размещены в открытом доступе, с использованием табличной функции url:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

С нашими заполненными таблицами Memory мы можем загрузить наши словари Регулярных Выражений. Обратите внимание, что нам нужно указать значения ключей как колонки - это будут атрибуты, которые мы сможем извлечь из user agent.

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

После загрузки этих словарей мы можем предоставить пример user-agent и протестировать наши новые возможности извлечения словаря:

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

Учитывая, что правила, касающиеся user agents, будут редко меняться, и словарь будет нуждаться в обновлении только в ответ на новые браузеры, операционные системы и устройства, имеет смысл выполнять это извлечение во время вставки.

Мы можем либо выполнить эту работу с использованием материализованной колонки, либо используя материализованное представление. Ниже мы изменим материализованное представление, использованное ранее:

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

Это требует от нас изменить схему целевой таблицы `otel_logs_v2`:

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

После перезапуска сборщика и загрузки структурированных журналов, основываясь на ранее задокументированных шагах, мы можем запрашивать наши новые извлеченные колонки Device, Browser и Os.

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
Обратите внимание на использование кортежей для этих колонок user agent. Кортежи рекомендуются для сложных структур, где иерархия известна заранее. Подколонки имеют такую же производительность, как обычные колонки (в отличие от ключей Map), позволяя использовать различный типы.
:::
### Дополнительное чтение {#further-reading}

Для получения дополнительных примеров и деталей по словарям, мы рекомендуем следующие статьи:

- [Расширенные темы словарей](/dictionary#advanced-dictionary-topics)
- ["Использование словарей для ускорения запросов"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Словари](/sql-reference/dictionaries)
## Ускорение запросов {#accelerating-queries}

ClickHouse поддерживает ряд методов для ускорения производительности запросов. Следующие методы следует рассмотреть только после выбора подходящего первичного/упорядочивающего ключа, чтобы оптимизировать наиболее популярные паттерны доступа и максимально увеличить сжатие. Это обычно будет иметь наибольшее влияние на производительность за наименьшие усилия.
### Использование материализованных представлений (инкрементные) для агрегаций {#using-materialized-views-incremental-for-aggregations}

В предыдущих разделах мы рассмотрели использование материализованных представлений для преобразования и фильтрации данных. Однако материализованные представления также могут использоваться для предварительного вычисления агрегаций во время вставки и сохранения результата. Этот результат можно обновлять с результатами последующих вставок, что фактически позволяет выполнять агрегацию на этапе вставки.

Основная идея заключается в том, что результаты часто будут меньшей репрезентацией оригинальных данных (частичный набросок в случае агрегаций). В сочетании с более простым запросом для чтения результатов из целевой таблицы, время выполнения запросов будет быстрее, чем если бы те же вычисления выполнялись на оригинальных данных.

Рассмотрим следующий запрос, где мы вычисляем общий трафик в час, используя наши структурированные логи:

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

5 строк в наборе. Затраченное время: 0.666 сек. Обработано 10.37 миллиона строк, 4.73 ГБ (15.56 миллиона строк/с., 7.10 ГБ/с.)
Максимальное использование памяти: 1.40 MiB.
```

Мы можем предположить, что это может быть общая линейная диаграмма, которую пользователи строят с помощью Grafana. Этот запрос, безусловно, очень быстрый – в наборе данных всего 10 миллионов строк, и ClickHouse быстр! Однако, если мы масштабируем это до миллиардов и триллионов строк, мы, в идеале, хотели бы поддерживать такую производительность запроса.

:::note
Этот запрос был бы в 10 раз быстрее, если бы мы использовали таблицу `otel_logs_v2`, которая является результатом нашего ранее созданного материализованного представления, извлекающего ключ размера из `LogAttributes` map. Мы используем необработанные данные здесь только для иллюстративных целей и рекомендуем использовать ранее созданное представление, если это общий запрос.
:::

Нам нужна таблица для получения результатов, если мы хотим вычислять это во время вставки, используя материализованное представление. Эта таблица должна хранить только 1 строку за час. Если поступает обновление для существующего часа, другие колонки должны объединяться в строку существующего часа. Для того чтобы это слияние инкрементальных состояний происходило, частичные состояния должны храниться для других колонок.

Это требует особого типа движка в ClickHouse: SummingMergeTree. Этот движок заменяет все строки с одинаковым ключом сортировки на одну строку, содержащую суммированные значения числовых колонок. Следующая таблица будет объединять любые строки с одинаковой датой, суммируя любые числовые колонки.

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Чтобы продемонстрировать наше материализованное представление, предположим, что наша таблица `bytes_per_hour` пуста и еще не получила никаких данных. Наше материализованное представление выполняет вышеуказанный `SELECT` над данными, вставленными в `otel_logs` (это будет выполнено на блоках заданного размера), с результатами, отправленными в `bytes_per_hour`. Синтаксис показан ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Клаузула `TO` здесь является ключевой, обозначающей, куда будут отправлены результаты, т.е. в `bytes_per_hour`.

Если мы перезапустим наш OTel Collector и повторно отправим логи, таблица `bytes_per_hour` будет инкрементально заполняться результатом вышеуказанного запроса. По завершении мы можем подтвердить размер нашего `bytes_per_hour` – мы должны получить 1 строку за час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 строка в наборе. Затраченное время: 0.039 сек.
```

Мы фактически сократили количество строк с 10 миллионов (в `otel_logs`) до 113, сохранив результат нашего запроса. Ключевым моментом здесь является то, что если новые логи вставляются в таблицу `otel_logs`, новые значения будут отправлены в `bytes_per_hour` за их соответствующий час, где они будут автоматически объединяться асинхронно в фоновом режиме – за счет хранения только одной строки за час `bytes_per_hour` будет всегда и небольшой и актуальной.

Поскольку объединение строк происходит асинхронно, может быть больше одной строки за час, когда пользователь выполняет запрос. Чтобы обеспечить объединение всех ожидающих строк во время запроса, у нас есть два варианта:

- Использовать [`FINAL` модификатор](/sql-reference/statements/select/from#final-modifier) в имени таблицы (что мы сделали в запросе для подсчета выше).
- Агрегировать по ключу сортировки, использованному в нашей итоговой таблице, т.е. Timestamp и суммировать метрики.

Обычно второй вариант более эффективен и гибок (таблицу можно использовать для других целей), но первый может быть проще для некоторых запросов. Мы покажем оба варианта ниже:

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

5 строк в наборе. Затраченное время: 0.008 сек.

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

5 строк в наборе. Затраченное время: 0.005 сек.
```

Это ускорило наш запрос с 0.6с до 0.008с – более чем в 75 раз!

:::note
Эти улучшения могут быть еще более значительными для более крупных наборов данных с более сложными запросами. См. [здесь](https://github.com/ClickHouse/clickpy) для примеров.
:::
#### Более сложный пример {#a-more-complex-example}

В приведенном выше примере выполняется агрегация простой суммы за час с помощью [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Для статистики, выходящей за рамки простых сумм, требуется другой целевой движок таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

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

113 строк в наборе. Затраченное время: 0.667 сек. Обработано 10.37 миллиона строк, 4.73 ГБ (15.53 миллиона строк/с., 7.09 ГБ/с.)
```

Чтобы сохранить подсчет кардинальности для инкрементального обновления, нужен AggregatingMergeTree.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

Чтобы обеспечить хранение агрегированных состояний, мы определяем колонку `UniqueUsers` как тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая исходную функцию частичных состояний (uniq) и тип исходной колонки (IPv4). Как и в случае с SummingMergeTree, строки с одинаковым значением ключа `ORDER BY` будут объединяться (Hour в приведенном выше примере).

Связанное материализованное представление использует предыдущий запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, как мы добавляем суффикс `State` к концу наших агрегатных функций. Это гарантирует, что возвращается состояние агрегата функции, а не финальный результат. Это будет содержать дополнительную информацию, позволяющую этому частичному состоянию объединяться с другими состояниями.

После перезагрузки данных через перезапуск Collectora мы можем подтвердить, что в таблице `unique_visitors_per_hour` доступны 113 строк.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 строка в наборе. Затраченное время: 0.009 сек.
```

Наш окончательный запрос должен использовать суффикс Merge для наших функций (так как колонки хранят частичные состояния агрегации):

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │      4763   │
│ 2019-01-22 00:00:00 │      536    │
└─────────────────────┴─────────────┘

113 строк в наборе. Затраченное время: 0.027 сек.
```

Обратите внимание, что мы используем `GROUP BY` здесь вместо использования `FINAL`.
### Использование материализованных представлений (инкрементные) для быстрого поиска {#using-materialized-views-incremental--for-fast-lookups}

Пользователи должны учитывать свои шаблоны доступа при выборе ключа сортировки в ClickHouse с колонками, которые часто используются в блоках фильтрации и агрегации. Это может быть ограничительным в случаях наблюдаемости, где пользователи имеют более разнообразные шаблоны доступа, которые не могут быть обобщены в едином наборе колонок. Это лучше всего проиллюстрировать на примере, встроенном в стандартные схемы OTel. Рассмотрим стандартную схему для трассировки:

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

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. В трассировке пользователи также должны иметь возможность выполнять поиск по конкретному `TraceId` и извлекать соответствующие спаны трассировки. Хотя это присутствует в ключе сортировки, его положение в конце означает, что [фильтрация не будет такой эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) и, вероятно, означает, что значительные объемы данных нужно будет просканировать при извлечении одной трассировки.

OTel Collector также устанавливает материализованное представление и связную таблицу, чтобы решить эту проблему. Таблица и представление показаны ниже:

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

Представление эффективно обеспечивает наличие в таблице `otel_traces_trace_id_ts` минимальной и максимальной метки времени для трассировки. Эта таблица, отсортированная по `TraceId`, позволяет эффективно извлекать эти временные метки. Эти временные диапазоны могут, в свою очередь, быть использованы при запросе основной таблицы `otel_traces`. Более конкретно, когда мы извлекаем трассировку по её идентификатору, Grafana использует следующий запрос:

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

CTE здесь идентифицирует минимальную и максимальную метку времени для идентификатора трассировки `ae9226c78d1d360601e6383928e4d22d`, прежде чем использовать это для фильтрации основной таблицы `otel_traces` по её связанным спанам.

Такой же подход может быть применён для аналогичных шаблонов доступа. Мы исследуем похожий пример в моделировании данных [здесь](/materialized-view/incremental-materialized-view#lookup-table).
### Использование проекций {#using-projections}

Проекции ClickHouse позволяют пользователям задавать несколько клаузул `ORDER BY` для таблицы.

В предыдущих разделах мы исследовали, как материализованные представления могут быть использованы в ClickHouse для предварительного вычисления агрегаций, преобразования строк и оптимизации запросов наблюдаемости для различных шаблонов доступа.

Мы привели пример, где материализованное представление отправляет строки в целевую таблицу с другим ключом сортировки, чем оригинальная таблица, принимающая вставки, для оптимизации поиска по идентификатору трассировки.

Проекции могут быть использованы для решения той же проблемы, позволяя пользователю оптимизировать запросы по колонке, которая не является частью первичного ключа.

Теоретически, эта возможность может быть использована для предоставления нескольких ключей сортировки для таблицы, с одним явным недостатком: дублированием данных. В частности, данные должны быть записаны в порядке основного первичного ключа, помимо указанного порядка для каждой проекции. Это замедлит вставки и потребует больше места на диске.

:::note Проекции против материализованных представлений
Проекции предлагают многие из тех же возможностей, что и материализованные представления, но их следует использовать с осторожностью, так как последние часто предпочитаются. Пользователи должны понимать недостатки и когда они уместны. Например, хотя проекции могут быть использованы для предварительного вычисления агрегаций, мы рекомендуем пользователям использовать материализованные представления для этого.
:::

<Image img={observability_13} alt="Наблюдаемость и проекции" size="md"/>

Рассмотрим следующий запрос, который фильтрует нашу таблицу `otel_logs_v2` по кодам ошибок 500. Это, вероятно, распространенный шаблон доступа для логирования, когда пользователи хотят фильтровать по кодам ошибок:

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 строк в наборе. Затраченное время: 0.177 сек. Обработано 10.37 миллиона строк, 685.32 МБ (58.66 миллиона строк/с., 3.88 ГБ/с.)
Максимальное использование памяти: 56.54 MiB.
```

:::note Используйте Null для измерения производительности
Мы не выводим результаты здесь, используя `FORMAT Null`. Это заставляет все результаты быть прочитанными, но не возвращенными, тем самым предотвращая преждевременное завершение запроса из-за LIMIT. Это нужно только для того, чтобы показать время, затраченное на сканирование всех 10 миллионов строк.
:::

Указанный запрос требует линейного сканирования с нашим выбранным ключом сортировки `(ServiceName, Timestamp)`. Хотя мы могли бы добавить `Status` в конец ключа сортировки для улучшения производительности вышеуказанного запроса, мы также можем добавить проекцию.

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

Обратите внимание, что сначала необходимо создать проекцию, а затем материализовать её. Эта последняя команда вызывает хранение данных дважды на диске в двух разных порядках. Проекцию также можно определить при создании данных, как показано ниже, и она будет автоматически поддерживаться по мере вставки данных.

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

Важно отметить, что если проекция создается с помощью `ALTER`, то её создание является асинхронным, когда выполняется команда `MATERIALIZE PROJECTION`. Пользователи могут подтвердить ход выполнения этой операции с помощью следующего запроса, ожидая `is_done=1`.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 строка в наборе. Затраченное время: 0.008 сек.
```

Если мы повторим указанный запрос, мы увидим, что производительность значительно улучшилась за счет дополнительного места для хранения (см. ["Измерение размера таблицы и сжатия"](#measuring-table-size--compression) для того, как измерить это).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 строк в наборе. Затраченное время: 0.031 сек. Обработано 51.42 тысячи строк, 22.85 МБ (1.65 миллиона строк/с., 734.63 МБ/с.)
Максимальное использование памяти: 27.85 MiB.
```

В приведенном выше примере мы указываем колонки, используемые в предыдущем запросе, в проекции. Это означает, что только эти указанные колонки будут храниться на диске как часть проекции, отсортированные по Status. Если бы мы использовали `SELECT *` здесь, то все колонки были бы сохранены. Хотя это позволило бы более комфортно использовать проекцию для более широкого диапазона запросов (с любым подмножеством колонок), это приведет к дополнительным затратам по хранению. Для измерения дискового пространства и сжатия см. ["Измерение размера таблицы и сжатия"](#measuring-table-size--compression).
### Вторичные/индексы пропуска данных {#secondarydata-skipping-indices}

Независимо от того, насколько хорошо первичный ключ настроен в ClickHouse, некоторые запросы неизбежно потребуют полных сканирований таблицы. Хотя это можно смягчить с помощью материализированных представлений (и проекций для некоторых запросов), они требуют дополнительного обслуживания и пользователи должны быть осведомлены об их доступности, чтобы гарантировать, что они будут использованы. В то время как традиционные реляционные базы данных решают эту проблему с помощью вторичных индексов, они неэффективны в столбцовых базах данных, таких как ClickHouse. Вместо этого ClickHouse использует "пропускающие" индексы, которые могут значительно улучшить производительность запросов, позволяя базе данных пропускать большие объемы данных без соответствующих значений.

Стандартные схемы OTel используют вторичные индексы в попытке ускорить доступ к доступу к картам. Хотя мы считаем, что они в целом неэффективны и не рекомендуем копировать их в вашу схему, пропускающие индексы могут быть полезны.

Пользователи должны прочитать и понять [руководство по вторичным индексам](/optimize/skipping-indexes) перед попыткой их применения.

**В общем, они эффективны, когда существует сильная корреляция между первичным ключом и целевой немаркировкой колонной/выражением и пользователи ищут редкие значения, т.е. те, которые встречаются не во многих гранулах.**
### Фильтры Блума для текстового поиска {#bloom-filters-for-text-search}

Для запросов по наблюдаемости вторичные индексы могут быть полезны, когда пользователям необходимо выполнять текстовые поиски. В частности, индексы фильтров Блума на основе ngram и токенов [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) и [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) можно использовать для ускорения поиска по колонкам типа String с операторами `LIKE`, `IN` и hasToken. Важно отметить, что индекс на основе токенов генерирует токены, используя неалфавитные символы в качестве разделителя. Это означает, что можно сопоставлять только токены (или целые слова) во время выполнения запроса. Для более детального сопоставления можно использовать [фильтр Блума на основе N-грамм](/optimize/skipping-indexes#bloom-filter-types). Он разбивает строки на n-граммы заданного размера, что позволяет сопоставлять подслова.

Чтобы оценить токены, которые будут произведены и, следовательно, сопоставлены, можно использовать функцию `tokens`:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Функция `ngram` предоставляет аналогичные возможности, где размер `ngram` можно задать как второй параметр:

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note Обратные индексы
ClickHouse также имеет экспериментальную поддержку обратных индексов как вторичного индекса. В настоящее время мы не рекомендуем их для наборов данных логирования, но ожидаем, что они заменят фильтры Блума на основе токенов, когда они станут готовыми к производству.
:::

Для целей этого примера мы используем набор данных структурированных логов. Предположим, мы хотим подсчитать логи, где колонка `Referer` содержит `ultra`.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

Здесь нам необходимо сопоставлять ngram размером 3. Поэтому мы создаем индекс `ngrambf_v1`.

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

Индекс `ngrambf_v1(3, 10000, 3, 7)` здесь принимает четыре параметра. Последний из них (значение 7) представляет собой семя. Остальные представляют размер ngram (3), значение `m` (размер фильтра) и количество хеш-функций `k` (7). `k` и `m` требуют настройки и будут зависеть от числа уникальных ngram/токенов и вероятности того, что фильтр дает ложный отрицательный результат — таким образом, подтверждая, что значение отсутствует в грануле. Мы рекомендуем [эти функции](/engines/table-engines/mergetree-family/mergetree#bloom-filter) для помощи в определении этих значений.

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
Вышеописанное предназначено только для иллюстрации. Мы рекомендуем пользователям извлекать структуру из своих логов при вставке, а не пытаться оптимизировать текстовые поиски с использованием фильтров Блума на основе токенов. Тем не менее, существуют случаи, когда у пользователей есть трассировки стека или другие большие строки, для которых текстовый поиск может быть полезен из-за менее детерминированной структуры.
:::

Некоторые общие рекомендации по использованию фильтров Блума:

Цель фильтра Блума — фильтровать [гранулы](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), что позволяет избежать необходимости загружать все значения для колонки и выполнять линейный обход. Параметр `EXPLAIN` с `indexes=1` может использоваться для определения числа гранул, которые были пропущены. Рассмотрим ответы ниже для оригинальной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с фильтром Блума на основе ngram.

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

Фильтр Блума обычно будет быстрее, если он меньше самой колонки. Если он больше, то вероятно, что производительность будет незаметно улучшена. Сравните размер фильтра с размером колонки с помощью следующих запросов:

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

В приведенных выше примерах видно, что вторичный индекс фильтра Блума составляет 12 МБ — почти в 5 раз меньше сжатого размера колонки, который составляет 56 МБ.

Фильтры Блума могут требовать значительной настройки. Мы рекомендуем следовать заметкам [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые могут быть полезны для определения оптимальных настроек. Фильтры Блума также могут быть дорогими при вставке и слиянии. Пользователи должны оценить влияние на производительность вставок перед добавлением фильтров Блума в продукцию.

Дополнительные сведения о вторичных индексах для пропуска данных можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).
### Извлечение из карт {#extracting-from-maps}

Тип Map широко распространен в схемах OTel. Этот тип требует, чтобы значения и ключи имели один и тот же тип - что достаточно для метаданных, таких как метки Kubernetes. Имейте в виду, что при запросе подпункта типа Map загружается весь родительский столбец. Если в карте много ключей, это может привести к значительным затратам на выполнение запроса, поскольку потребуется прочитать больше данных с диска, чем если бы ключ существовал как колонка.

Если вы часто запрашиваете определенный ключ, рассмотрите возможность переноса его в свой собственный выделенный столбец на верхнем уровне. Это обычно задача, которая выполняется в ответ на общие шаблоны доступа и после развертывания и может быть трудно предсказать до производства. См. ["Управление изменениями схемы"](/observability/managing-data#managing-schema-changes) для получения информации о том, как изменить свою схему после развертывания.
## Измерение размера таблицы и сжатия {#measuring-table-size--compression}

Одной из главных причин использования ClickHouse для наблюдаемости является сжатие.

Поскольку оно значительно снижает затраты на хранение, меньше данных на диске означает меньше I/O и быстрее запросы и вставки. Снижение I/O перевесит накладные расходы любого алгоритма сжатия в отношении производительности CPU. Улучшение сжатия данных должно быть первым приоритетом при работе над тем, чтобы запросы ClickHouse выполнялись быстро.

Подробности о измерении сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).
