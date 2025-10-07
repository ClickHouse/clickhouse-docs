---
'title': 'Проектирование схемы'
'description': 'Проектирование схемы для мониторинга'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'slug': '/use-cases/observability/schema-design'
'show_related_blogs': true
'doc_type': 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# Проектирование схемы для мониторинга

Мы рекомендуем пользователям всегда создавать собственную схему для логов и трассировки по следующим причинам:

- **Выбор первичного ключа** - В схемах по умолчанию используется `ORDER BY`, который оптимизирован для определенных шаблонов доступа. Вряд ли ваши шаблоны доступа будут соответствовать этому.
- **Извлечение структуры** - Пользователи могут захотеть извлечь новые колонки из существующих колонок, например, из колонки `Body`. Это можно сделать с помощью материализованных колонок (а в более сложных случаях – с помощью материализованных представлений). Это требует изменения схемы.
- **Оптимизация Maps** - По умолчанию схемы используют тип Map для хранения атрибутов. Эти колонки позволяют хранить произвольные метаданные. Хотя это важная возможность, так как метаданные событий зачастую не определены заранее и, следовательно, не могут быть сохранены в строго типизированной базе данных, такой как ClickHouse, доступ к ключам map и их значениям не так эффективен, как доступ к обычным колонкам. Мы решаем эту проблему, модифицируя схему и обеспечивая, чтобы наиболее часто используемые ключи map были колонками верхнего уровня - см. ["Извлечение структуры с помощью SQL"](#extracting-structure-with-sql). Это требует изменения схемы.
- **Упрощение доступа к ключам map** - Доступ к ключам в map требует более громоздкого синтаксиса. Пользователи могут смягчить это с помощью псевдонимов. См. ["Использование псевдонимов"](#using-aliases), чтобы упростить запросы.
- **Вторичные индексы** - Схема по умолчанию использует вторичные индексы для ускорения доступа к Maps и ускорения текстовых запросов. Они обычно не требуются и требуют дополнительного места на диске. Их можно использовать, но необходимо протестировать, чтобы убедиться, что они необходимы. См. ["Вторичные / Индексы пропуска данных"](#secondarydata-skipping-indices).
- **Использование кодеков** - Пользователи могут захотеть настроить кодеки для колонок, если они понимают ожидаемые данные и имеют доказательства того, что это улучшает сжатие.

_Мы подробно описываем каждый из вышеупомянутых случаев использования ниже._

**Важно:** Хотя пользователям рекомендуется расширять и модифицировать свою схему для достижения оптимального сжатия и производительности запросов, они должны следовать правилам наименования схемы OTel для основных колонок, где это возможно. Плагин ClickHouse для Grafana предполагает наличие некоторых базовых колонок OTel для помощи в построении запросов, таких как Timestamp и SeverityText. Обязательные колонки для логов и трассировок задокументированы здесь [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure), соответственно. Вы можете изменить эти имена колонок, переопределив значения по умолчанию в конфигурации плагина.

## Извлечение структуры с помощью SQL {#extracting-structure-with-sql}

При загрузке структурированных или неструктурированных логов пользователям часто нужна возможность:

- **Извлекать колонки из строковых блобов**. Запросы к ним будут быстрее, чем использование строковых операций во время выполнения запроса.
- **Извлекать ключи из map**. В схеме по умолчанию произвольные атрибуты помещаются в колонки типа Map. Этот тип предоставляет возможность без схемы, что имеет преимущество, поскольку пользователи не нуждаются в предварительном определении колонок для атрибутов при создании логов и трассировок - это часто невозможно при сборе логов от Kubernetes и желании сохранить метки подов для последующего поиска. Доступ к ключам map и их значениям медленнее, чем запросы к обычным колонкам ClickHouse. Следовательно, извлечение ключей из map в корневые колонки таблицы часто является желаемым.

Рассмотрим следующие запросы:

Предположим, что мы хотим подсчитать, какие URL-адреса получают наибольшее количество POST-запросов с использованием структурированных логов. JSON-блоб хранится в колонке `Body` в виде строки. Кроме того, он также может быть сохранен в колонке `LogAttributes` как `Map(String, String)`, если пользователь включил json_parser в сборщике.

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

Если `LogAttributes` доступен, запрос для подсчета того, какие URL-адреса сайта получают наибольшее количество POST-запросов:

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

Обратите внимание на использование синтаксиса map здесь, например, `LogAttributes['request_path']`, и на функцию [`path`](/sql-reference/functions/url-functions#path) для удаления параметров запроса из URL.

Если пользователь не включил парсинг JSON в сборщике, то `LogAttributes` будет пустым, что заставит нас использовать функции [JSON](/sql-reference/functions/json-functions) для извлечения колонок из строки `Body`.

:::note Предпочитайте ClickHouse для парсинга
Мы обычно рекомендуем пользователям выполнять парсинг JSON в ClickHouse для структурированных логов. Мы уверены, что ClickHouse – это самая быстрая реализация парсинга JSON. Однако мы понимаем, что пользователи могут захотеть отправить логи в другие источники и не иметь этой логики в SQL.
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

Аналогичный запрос для неструктурированных логов требует использования регулярных выражений через функцию [`extractAllGroupsVertical`](/sql-reference/functions/string-search-functions#extractallgroupsvertical).

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

Увеличенная сложность и стоимость запросов для парсинга неструктурированных логов (обратите внимание на разницу в производительности) – вот почему мы рекомендуем пользователям всегда использовать структурированные логи, где это возможно.

:::note Рассмотрите словари
Вышеупомянутый запрос может быть оптимизирован для использования словарей регулярных выражений. См. [Использование словарей](#using-dictionaries) для получения более детальной информации.
:::

Оба эти случая использования могут быть реализованы с помощью ClickHouse, перемещая вышеуказанную логику запроса на время вставки. Мы исследуем несколько подходов ниже, подчеркивая, когда каждый из них подходит.

:::note OTel или ClickHouse для обработки?
Пользователи также могут выполнять обработку с использованием процессоров и операторов OTel Collector, как описано [здесь](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching). В большинстве случаев пользователи обнаружат, что ClickHouse значительно более эффективен с точки зрения ресурсов и быстрее, чем процессоры сборщика. Основной недостаток выполнения всей обработки событий в SQL заключается в связывании вашего решения с ClickHouse. Например, пользователи могут захотеть отправить обработанные логи в альтернативные пункты назначения из сборщика OTel, например, в S3.
:::
### Материализованные колонки {#materialized-columns}

Материализованные колонки предлагают наиболее простой способ извлечь структуру из других колонок. Значения таких колонок всегда рассчитываются во время вставки и не могут быть указаны в запросах INSERT.

:::note Нагрузка
Материализованные колонки требуют дополнительного объема хранилища, так как значения извлекаются в новые колонки на диске во время вставки.
:::

Материализованные колонки поддерживают любое выражение ClickHouse и могут использовать любые аналитические функции для [обработки строк](/sql-reference/functions/string-functions) (включая [regex и поиск](/sql-reference/functions/string-search-functions)) и [url](/sql-reference/functions/url-functions), выполняя [преобразования типов](/sql-reference/functions/type-conversion-functions), [извлекая значения из JSON](/sql-reference/functions/json-functions) или [математические операции](/sql-reference/functions/math-functions).

Мы рекомендуем использовать материализованные колонки для базовой обработки. Они особенно полезны для извлечения значений из map, продвижения их в корневые колонки и выполнения преобразования типов. Они часто наиболее полезны при использовании в очень простых схемах или в сочетании с материализованными представлениями. Рассмотрим следующую схему для логов, из которой JSON был извлечен в колонку `LogAttributes` сборщиком:

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

Эквивалентная схема для извлечения с использованием функций JSON из строки `Body` может быть найдена [здесь](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==).

Наши три материализованные колонки извлекают страницу запроса, тип запроса и домен реферера. Они обращаются к ключам map и применяют функции к их значениям. Наш последующий запрос значительно быстрее:

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
Материализованные колонки по умолчанию не будут возвращены в `SELECT *`. Это сделано для сохранения инварианта, что результат `SELECT *` всегда может быть повторно вставлен в таблицу с помощью INSERT. Это поведение можно отключить, установив `asterisk_include_materialized_columns=1`, и можно включить в Grafana (см. `Дополнительные настройки -> Пользовательские настройки` в конфигурации источника данных).
:::
## Материализованные представления {#materialized-views}

[Материализованные представления](/materialized-views) предоставляют более мощный способ применения фильтрации SQL и преобразований к логам и трассировкам.

Материализованные представления позволяют пользователям переместить стоимость вычислений с времени выполнения запроса на время вставки. Материализованное представление ClickHouse – это просто триггер, который запускает запрос на блоках данных по мере их вставки в таблицу. Результаты этого запроса вставляются во вторую "целевую" таблицу.

<Image img={observability_10} alt="Материализованное представление" size="md"/>

:::note Обновления в реальном времени
Материализованные представления в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на которой они основаны, функционируя более как постоянно обновляемые индексы. Напротив, в других базах данных материализованные представления обычно являются статическими снимками запроса, которые необходимо обновить (по аналогии с обновляемыми материализованными представлениями ClickHouse).
:::

Запрос, связанный с материализованным представлением, может теоретически быть любым запросом, включая агрегацию, хотя [существуют ограничения при использовании Joins](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для преобразований и фильтрации, требуемых для логов и трассировок, пользователи могут считать любое заявление `SELECT` возможным.

Пользователям стоит помнить, что запрос является просто триггером, выполняющимся над вставляемыми в таблицу строками (исходная таблица), а результаты отправляются в новую таблицу (целевая таблица).

Чтобы убедиться, что мы не сохраняем данные дважды (в исходной и целевой таблицах), мы можем изменить таблицу исходной таблицы на [движок таблицы Null](/engines/table-engines/special/null), сохраняя оригинальную схему. Наши сборщики OTel продолжат отправлять данные в эту таблицу. Например, для логов таблица `otel_logs` становится:

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

Движок таблицы Null - это мощная оптимизация - рассмотрите его как `/dev/null`. Эта таблица не будет хранить данные, но любые прикрепленные материализованные представления по-прежнему будут выполняться над вставленными строками до их удаления.

Рассмотрим следующий запрос. Он преобразует наши строки в формат, который мы хотим сохранить, извлекая все колонки из `LogAttributes` (предполагаем, что это было установлено сборщиком с использованием оператора `json_parser`), устанавливая `SeverityText` и `SeverityNumber` (на основе некоторых простых условий и определения [этих колонок](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В этом случае мы также выбираем только те колонки, которые, как мы знаем, будут заполнены - игнорируя такие колонки, как `TraceId`, `SpanId` и `TraceFlags`.

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

Мы также извлекаем колонку `Body` выше - на случай, если позже будут добавлены дополнительные атрибуты, которые не будут извлечены нашим SQL. Эта колонка должна хорошо сжиматься в ClickHouse и будет редко запрашиваться, что не повлияет на производительность запроса. Наконец, мы сокращаем Timestamp до DateTime (для экономии места - см. ["Оптимизация типов"](#optimizing-types)) с приведением типа.

:::note Условные операторы
Обратите внимание на использование [условных операторов](/sql-reference/functions/conditional-functions) выше для извлечения `SeverityText` и `SeverityNumber`. Они очень полезны для формирования сложных условий и проверки того, установлены ли значения в map – мы наивно предполагаем, что все ключи существуют в `LogAttributes`. Рекомендуем пользователям ознакомиться с ними – они ваши друзья в парсинге логов, помимо функций для работы с [значениями null](/sql-reference/functions/functions-for-nulls)!
:::

Нам требуется таблица для получения этих результатов. Ниже целевая таблица соответствует вышеупомянутому запросу:

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

Выбранные типы основаны на оптимизациях, обсуждаемых в ["Оптимизация типов"](#optimizing-types).

:::note
Обратите внимание, как мы существенно изменили нашу схему. На самом деле пользователи, вероятно, также будут иметь колонки Trace, которые они захотят сохранить, а также колонку `ResourceAttributes` (которая обычно содержит метаданные Kubernetes). Grafana может использовать колонки trace для предоставления функциональности ссылок между логами и трассировками - см. ["Использование Grafana"](/observability/grafana).
:::

Ниже мы создаем материализованное представление `otel_logs_mv`, которое выполняет указанный выше выбор для таблицы `otel_logs` и отправляет результаты в `otel_logs_v2`.

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

Эквивалентное материализованное представление, которое зависит от извлечения колонок из колонки `Body` с использованием функций JSON, показано ниже:

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

Вышеупомянутые материализованные представления зависят от неявного приведения типов - особенно в случае использования карты `LogAttributes`. ClickHouse часто прозрачно приводит извлеченные значения к типу целевой таблицы, что уменьшает требуемый синтаксис. Однако мы рекомендуем пользователям всегда проверять свои представления, используя оператор `SELECT` для этих представлений с оператором [`INSERT INTO`](/sql-reference/statements/insert-into), используя целевую таблицу с той же схемой. Это должно подтвердить, что типы обрабатываются правильно. Особое внимание следует уделить следующим случаям:

- Если ключа нет в map, будет возвращена пустая строка. В случае чисел пользователям потребуется сопоставить их с подходящим значением. Это можно сделать с помощью [условных операторов](/sql-reference/functions/conditional-functions), например, `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`, или [функций приведения типов](/sql-reference/functions/type-conversion-functions), если допустимы значения по умолчанию, например, `toUInt8OrDefault(LogAttributes['status'] )`.
- Некоторые типы не всегда будут приведены, например, строковые представления чисел не будут приведены к значениям перечисления.
- Функции извлечения JSON возвращают значения по умолчанию для своего типа, если значение не найдено. Убедитесь, что эти значения имеют смысл!

:::note Избегайте Nullable
Избегайте использования [Nullable](/sql-reference/data-types/nullable) в ClickHouse для данных Мониторинга. Чаще всего в логах и трассировках не требуется различать пустое значение и null. Эта функция требует дополнительного объема хранилища и отрицательно сказывается на производительности запроса. См. [здесь](/data-modeling/schema-design#optimizing-types) для получения дополнительной информации.
:::
## Выбор первичного (упорядочивающего) ключа {#choosing-a-primary-ordering-key}

После того, как вы извлекли желаемые колонки, вы можете начать оптимизацию вашего упорядочивающего/первичного ключа.

Некоторые простые правила могут быть применены, чтобы помочь выбрать упорядочивающий ключ. Следующее иногда может быть в конфликте, поэтому рассмотрите их по порядку. Пользователи могут идентифицировать несколько ключей в этом процессе, при этом 4-5 обычно достаточно:

1. Выбирайте колонки, которые соответствуют вашим общим фильтрам и шаблонам доступа. Если пользователи обычно начинают расследования по мониторингу, фильтруя по определенной колонке, например, по имени пода, эта колонка будет часто использоваться в условиях `WHERE`. Приоритизируйте их включение в ваш ключ выше тех, которые используются реже.
2. Предпочитайте колонки, которые помогают исключить большой процент всех строк при фильтрации, тем самым уменьшая объем данных, которые нужно читать. Имена сервисов и коды состояния часто являются хорошими кандидатами - в последнем случае только если пользователи фильтруют по значениям, которые исключают большинство строк, например, фильтрация по 200 будет соответствовать большинству строк в большинстве систем, в отличие от ошибок 500, которые будут соответствовать небольшой подмножеству.
3. Предпочитайте колонки, которые, вероятно, будут высоко коррелированы с другими колонками в таблице. Это поможет гарантировать, что эти значения также будут храниться непрерывно, улучшая сжатие.
4. Операции `GROUP BY` и `ORDER BY` для колонок в упорядочивающем ключе могут быть более эффективными с точки зрения памяти.

<br />

Определив подмножество колонок для упорядочивающего ключа, их необходимо объявить в специфическом порядке. Этот порядок может существенно повлиять на эффективность фильтрации по вторичным ключевым колонкам в запросах и на коэффициент сжатия для файлов данных таблицы. В общем, **лучше всего упорядочить ключи в порядке возрастания кардинальности**. Это следует сбалансировать с учетом того, что фильтрация по колонкам, которые появляются позже в упорядочивающем ключе, будет менее эффективной, чем фильтрация по тем, которые появляются ранее в кортеже. Уравновесьте эти поведения и учитывайте ваши шаблоны доступа. Важнее всего протестировать варианты. Для дальнейшего понимания упорядочивающих ключей и их оптимизации мы рекомендуем [данную статью](/guides/best-practices/sparse-primary-indexes).

:::note Сначала структура
Мы рекомендуем определиться с вашими упорядочивающими ключами после структурирования ваших логов. Не используйте ключи в атрибутах map для упорядочивающего ключа или выражений извлечения JSON. Убедитесь, что ваши упорядочивающие ключи являются корневыми колонками в вашей таблице.
:::
## Использование map {#using-maps}

Ранее приведенные примеры показывают использование синтаксиса map `map['key']` для доступа к значениям в колонках `Map(String, String)`. А также специальные функции ClickHouse для map [map functions](/sql-reference/functions/tuple-map-functions#mapkeys) доступны для фильтрации или выбора этих колонок.

Например, следующий запрос определяет все уникальные ключи, доступные в колонке `LogAttributes`, используя функцию [`mapKeys`](/sql-reference/functions/tuple-map-functions#mapkeys), после чего применяется функция [`groupArrayDistinctArray`](/sql-reference/aggregate-functions/combinators) (комбинатор).

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
Мы не рекомендуем использовать точки в названиях колонок Map и можем отказаться от их использования. Используйте `_`.
:::
## Использование псевдонимов {#using-aliases}

Запросы к типам map медленнее, чем запросы к обычным колонкам - см. ["Ускорение запросов"](#accelerating-queries). В дополнение, это более синтаксически сложно и может быть громоздко для пользователей. Чтобы решить эту последнюю проблему, мы рекомендуем использовать колонки Alias.

Колонки ALIAS вычисляются во время выполнения запроса и не хранятся в таблице. Следовательно, невозможно вставить значение в колонку этого типа. Используя псевдонимы, мы можем ссылаться на ключи map и упрощать синтаксис, прозрачным образом экспортируя записи map как обычную колонку. Рассмотрим следующий пример:

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

У нас есть несколько материализованных колонок и колонка `ALIAS`, `RemoteAddr`, которая обращается к map `LogAttributes`. Теперь мы можем запрашивать значения `LogAttributes['remote_addr']` через эту колонку, тем самым упрощая наш запрос, т.е.

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

Более того, добавление `ALIAS` не вызывает трудностей через команду `ALTER TABLE`. Эти колонки становятся доступными немедленно, например:

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

:::note Псевдоним по умолчанию исключен
По умолчанию `SELECT *` исключает колонки ALIAS. Это поведение можно отключить, установив `asterisk_include_alias_columns=1`.
:::
## Оптимизация типов {#optimizing-types}

Общие рекомендации по оптимизации типов Clickhouse применимы к случаю ClickHouse.
## Использование кодеков {#using-codecs}

Помимо оптимизации типов, пользователи могут следовать общим рекомендациям по кодекам при попытке оптимизировать сжатие для схем наблюдения ClickHouse.

В общем, пользователи найдут кодек `ZSTD` весьма применимым к наборам данных логов и трассировок. Увеличение значения сжатия с его значения по умолчанию 1 может улучшить сжатие. Это, однако, следует протестировать, так как более высокие значения накладывают большую нагрузку на CPU во время вставки. Обычно мы наблюдаем незначительное увеличение от увеличения этого значения.

Кроме того, временные метки, хотя и выигрывают от дельта-кодирования в отношении сжатия, были показаны замедляющими производительность запросов, если этот столбец используется в первичном/упорядочивающем ключе. Мы рекомендуем пользователям оценить соответствующие компромиссы между сжатием и производительностью запросов.
## Использование словарей {#using-dictionaries}

[Словари](/sql-reference/dictionaries) являются ключевой функцией ClickHouse, обеспечивающей представление данных из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources) в памяти в виде [ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database), оптимизированное для супер-низкой задержки запросов.

<Image img={observability_12} alt="Мониторинг и словари" size="md"/>

Это полезно в различных сценариях, от обогащения встраиваемых данных на лету без замедления процесса инжекции до улучшения производительности запросов в целом, при этом JOINs особенно выигрывают. Хотя соединения редко требуются в сценариях мониторинга, словари все равно могут быть полезны для целей обогащения - как на времени вставки, так и во время запроса. Мы предоставим примеры обоих случаев ниже.

:::note Ускорение соединений
Пользователи, заинтересованные в ускорении соединений с помощью словарей, могут найти дополнительные подробности [здесь](/dictionary).
:::
### Время вставки против времени запроса {#insert-time-vs-query-time}

Словари можно использовать для обогащения наборов данных как во время запроса, так и во время вставки. Каждому из этих подходов соответствуют свои плюсы и минусы. В резюме:

- **Время вставки** - Это обычно подходит, если значение обогащения не меняется и существует во внешнем источнике, который можно использовать для заполнения словаря. В этом случае обогащение строки во время вставки избегает поиска во времени запроса к словарю. Это происходит со стоимостью производительности вставки, а также дополнительным объемом хранилища, поскольку обогащенные значения будут храниться в виде колонок.
- **Время запроса** - Если значения в словаре часто меняются, запросы во времени запроса обычно более применимы. Это избегает необходимости обновлять колонки (и переписывать данные), если сопоставленные значения изменяются. Это гибкость происходит за счет стоимости поиска во времени запроса. Эта стоимость во времени запроса обычно ощутима, если поиск требуется для многих строк, например, при использовании поиска в словаре в условиях фильтрации. Для обогащения результата, т.е. в `SELECT`, данный издержки обычно не ощутимы.

Мы рекомендуем пользователям ознакомиться с основами словарей. Словари предоставляют таблицу поиска в памяти, из которой значения могут быть извлечены с помощью специализированных [функций](/sql-reference/functions/ext-dict-functions#dictgetall).

Для простых примеров обогащения см. руководство по словарям [здесь](/dictionary). Ниже мы сосредоточим внимание на общих задачах обогащения мониторинга.
### Использование IP-словарей {#using-ip-dictionaries}

Географическое обогащение логов и трассировок значениями широты и долготы с использованием IP-адресов является распространенной задачей мониторинга. Мы можем достичь этого, используя структурированный словарь `ip_trie`.

Мы используем общедоступный [набор данных DB-IP на уровне города](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставленный [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [чтения](https://github.com/sapics/ip-location-db#csv-format) мы можем видеть, что данные структурированы следующим образом:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

Учитывая эту структуру, давайте начнем с того, чтобы взглянуть на данные, используя [url()](/sql-reference/table-functions/url) функцию таблицы:

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

Чтобы облегчить себе задачу, давайте используем [`URL()`](/engines/table-engines/special/url) движок таблицы для создания объекта таблицы ClickHouse с нашими именами полей и подтвердим общее количество строк:

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

Поскольку наш словарь `ip_trie` требует, чтобы диапазоны IP-адресов выражались в нотации CIDR, нам нужно будет преобразовать `ip_range_start` и `ip_range_end`.

Эта CIDR для каждого диапазона может быть лаконично вычислена с помощью следующего запроса:

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
В запросе выше происходит много действий. Для заинтересованных, прочтите это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). В противном случае примите, что выше вычисляется CIDR для диапазона IP.
:::

Для наших целей нам нужны только диапазон IP, код страны и координаты, поэтому давайте создадим новую таблицу и вставим наши данные Geo IP:

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

Для выполнения запросов с низкой задержкой по IP в ClickHouse мы используем словари для хранения соответствия ключ -> атрибуты для наших данных Geo IP в памяти. ClickHouse предоставляет структуру словаря `ip_trie` [/sql-reference/dictionaries#ip_trie], чтобы сопоставить наши сетевые префиксы (CIDR-блоки) с координатами и кодами стран. Следующий запрос задает словарь, используя эту структуру и вышеупомянутую таблицу в качестве источника.

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
Словари в ClickHouse периодически обновляются на основе данных исходной таблицы и срока действия, используемого выше. Чтобы обновить наш словарь Geo IP, чтобы отразить последние изменения в наборе данных DB-IP, нам просто нужно повторно вставить данные из удаленной таблицы geoip_url в нашу таблицу `geoip` с примененными преобразованиями.
:::

Теперь, когда у нас есть данные Geo IP, загруженные в наш словарь `ip_trie` (который также удобно называется `ip_trie`), мы можем использовать его для геолокации IP. Это можно сделать с использованием функции [`dictGet()`](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Обратите внимание на скорость извлечения. Это позволяет нам обогащать логи. В этом случае мы выбираем **выполнять обогащение во время запроса**.

Вернувшись к нашему первоначальному набору данных логов, мы можем использовать вышеприведенное, чтобы агрегировать наши логи по стране. Следующее предполагает, что мы используем схему, полученную из нашего раннее описанного материализованного представления, которое содержит извлеченную колонку `RemoteAddress`.

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

Поскольку сопоставление IP к географическому положению может меняться, пользователи, вероятно, захотят знать, откуда поступил запрос в момент его отправки, а не о том, где текущее географическое положение для того же адреса. По этой причине обогащение времени индекса, вероятно, будет предпочтительным здесь. Это можно сделать с помощью материализованных колонок, как показано ниже, или в выборке материализованного представления:

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
Пользователи, вероятно, захотят, чтобы словарь обогащения IP периодически обновлялся на основе новых данных. Это можно достичь с помощью условия `LIFETIME` словаря, которое заставит словарь периодически перезагружаться из исходной таблицы. Чтобы обновить исходную таблицу, см. ["Обновляемые материализованные представления"](/materialized-view/refreshable-materialized-view).
:::

Вышеупомянутые страны и координаты предлагают возможности визуализации, выходящие за рамки группировки и фильтрации по стране. Для вдохновения смотрите ["Визуализация геоданных"](/observability/grafana#visualizing-geo-data).
### Использование словарей регулярных выражений (парсинг user agent) {#using-regex-dictionaries-user-agent-parsing}

Парсинг строк [user agent](https://en.wikipedia.org/wiki/User_agent) является классической задачей регулярного выражения и распространенным требованием в наборах данных на основе логов и трассировок. ClickHouse предоставляет эффективный парсинг user agent с помощью Словарей Деревьев Регулярных Выражений.

Словари деревьев регулярных выражений определяются в ClickHouse с использованием источника словаря YAMLRegExpTree, который предоставляет путь к файлу YAML, содержащему дерево регулярных выражений. Если вы хотите предоставить собственный словарь регулярных выражений, информация о требуемой структуре может быть найдена [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source). Ниже мы сосредоточимся на парсинге user agent с использованием [uap-core](https://github.com/ua-parser/uap-core) и загрузим наш словарь для поддерживаемого формата CSV. Этот подход совместим с OSS и ClickHouse Cloud.

:::note
В приведенных ниже примерах мы используем снимки последних регулярных выражений uap-core для парсинга user agent с июня 2024 года. Последний файл, который время от времени обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Пользователи могут следовать шагам [здесь](/sql-reference/dictionaries#collecting-attribute-values) для загрузки в CSV-файл, используемый ниже.
:::

Создайте следующие таблицы Memory. Они содержат наши регулярные выражения для парсинга устройств, браузеров и операционных систем.

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

Эти таблицы могут быть заполнены из следующих публично расположенных CSV-файлов, используя функцию таблицы url:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

Заполнив наши таблицы памяти, мы можем загрузить наши словари регулярных выражений. Обратите внимание, что нам нужно будет указать значения ключей в качестве колонок - это будут атрибуты, которые мы сможем извлечь из user agent.

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

С этими загруженными словарями мы можем предоставить пример user agent и протестировать наши новые возможности извлечения из словаря:

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

Учитывая, что правила для user agent редко меняются, словарь только нужно будет обновлять в ответ на новые браузеры, операционные системы и устройства, имеет смысл выполнять это извлечение на этапе вставки.

Мы можем выполнить эту работу с помощью материализованной колонки или с помощью материализованного представления. Ниже мы изменяем материализованное представление, использованное ранее:

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

Это требует модифицировать схему для целевой таблицы `otel_logs_v2`:

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

После перезапуска сборщика и загрузки структурированных логов на основе ранее задокументированных шагов, мы можем запросить наши только что извлеченные колонки Device, Browser и Os.

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
Обратите внимание на использование кортежей для этих колонок user agent. Кортежи рекомендованы для сложных структур, когда иерархия известна заранее. Подколонки предлагают такую же производительность, как обычные колонки (в отличие от ключей Map) и позволяют использовать разнородные типы.
### Дальнейшее чтение {#further-reading}

Для получения дополнительных примеров и подробностей о словарях, мы рекомендуем следующие статьи:

- [Расширенные темы словарей](/dictionary#advanced-dictionary-topics)
- ["Использование словарей для ускорения запросов"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Словари](/sql-reference/dictionaries)
## Ускорение запросов {#accelerating-queries}

ClickHouse поддерживает несколько методов для ускорения производительности запросов. Следующее следует рассматривать только после выбора подходящего первичного/упорядочивающего ключа для оптимизации наиболее популярных шаблонов доступа и максимизации сжатия. Обычно это окажет наибольшее влияние на производительность при наименьших усилиях.
### Использование материализованных представлений (инкрементных) для агрегаций {#using-materialized-views-incremental-for-aggregations}

На предыдущих страницах мы изучили использование материализованных представлений для трансформации и фильтрации данных. Однако материализованные представления также можно использовать для предварительного вычисления агрегаций во время вставки и хранения результата. Этот результат может обновляться результатами последующих вставок, таким образом, эффективно позволяя выполнять агрегацию во время вставки.

Основная идея здесь заключается в том, что результаты часто будут меньшим представлением оригинальных данных (частичный эскиз в случае агрегаций). Когда это сочетается с более простым запросом для чтения результатов из целевой таблицы, время выполнения запросов будет быстрее, чем если бы то же самое вычисление выполнялось на оригинальных данных.

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

Можно предположить, что это может быть общая линейная диаграмма, которую пользователи строят с помощью Grafana. Этот запрос, безусловно, очень быстрый - набор данных составляет всего 10 миллионов строк, и ClickHouse быстр! Тем не менее, если мы масштабируем это до миллиардов и триллионов строк, мы, по идее, хотели бы поддерживать такую производительность запроса.

:::note
Этот запрос будет в 10 раз быстрее, если мы используем таблицу `otel_logs_v2`, которая является результатом нашего предыдущего материализованного представления, которое извлекает ключ размера из карты `LogAttributes`. Мы используем здесь сырые данные только в иллюстративных целях и рекомендуем использовать предыдущее представление, если это общий запрос.
:::

Нам нужна таблица для получения результатов, если мы хотим вычислить это во время вставки, используя материализованное представление. Эта таблица должна хранить только 1 строку на час. Если обновление получено для существующего часа, другие столбцы должны быть объединены в строку текущего часа. Для того чтобы это слияние инкрементальных состояний произошло, частичные состояния должны храниться для других столбцов.

Для этого требуется специальный тип движка в ClickHouse: SummingMergeTree. Он заменяет все строки с одинаковым упорядочивающим ключом одной строкой, которая содержит суммированные значения для числовых столбцов. Следующая таблица объединит любые строки с одной и той же датой, суммируя любые числовые столбцы.

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Чтобы продемонстрировать наше материализованное представление, предположим, что наша таблица `bytes_per_hour` пустая и еще не получила никаких данных. Наше материализованное представление выполняет указанный выше `SELECT` на данных, вставленных в `otel_logs` (это будет выполняться по блокам заданного размера), а результаты отправляются в `bytes_per_hour`. Синтаксис показан ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Клаузула `TO` здесь имеет ключевое значение, указывая, куда будут отправлены результаты, т.е. в `bytes_per_hour`.

Если мы перезапустим наш OTel Collector и повторно отправим логи, таблица `bytes_per_hour` будет инкрементально заполняться результатом вышеуказанного запроса. По завершении мы можем подтвердить размер нашей таблицы `bytes_per_hour` - у нас должно быть 1 строка на час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

Мы эффективно сократили количество строк здесь с 10 миллионов (в `otel_logs`) до 113, сохраняя результат нашего запроса. Ключевое здесь то, что если новые логи вставляются в таблицу `otel_logs`, новые значения будут отправлены в `bytes_per_hour` для их соответствующего часа, где они автоматически объединяются асинхронно в фоновом режиме - сохраняя только одну строку на час, `bytes_per_hour` будет всегда и маленьким, и актуальным.

Поскольку объединение строк происходит асинхронно, может быть больше одной строки на час, когда пользователь выполняет запрос. Чтобы гарантировать, что все не объединенные строки будут объединены во время запроса, у нас есть два варианта:

- Использовать [`FINАL` модификатор](/sql-reference/statements/select/from#final-modifier) в имени таблицы (как мы сделали для вышеупомянутого запроса на количество).
- Аггрегировать по упорядочивающему ключу, использованному в нашей конечной таблице, т.е. Timestamp и суммировать метрики.

Как правило, второй вариант более эффективен и гибок (таблицу можно использовать для других задач), но первый может быть проще для некоторых запросов. Мы покажем оба варианта ниже:

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

Это ускорило наш запрос с 0.6s до 0.008s - более чем в 75 раз!

:::note
Эти преимущества могут быть еще больше на больших наборах данных с более сложными запросами. Смотрите [здесь](https://github.com/ClickHouse/clickpy) для примеров.
:::
#### Более сложный пример {#a-more-complex-example}

В приведенном выше примере выполняется агрегация простого подсчета за час с использованием [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Статистика, выходящая за рамки простых сумм, требует другого типа движка целевой таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

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

Чтобы сохранить счетчик кардинальности для инкрементального обновления, требуется AggregatingMergeTree.

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

Чтобы убедиться, что ClickHouse знает, что агрегатные состояния будут сохранены, мы определяем столбец `UniqueUsers` как тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая функцию-источник частичных состояний (uniq) и тип исходного столбца (IPv4). Как и в случае с SummingMergeTree, строки с одинаковым значением ключа `ORDER BY` будут объединены (Hour в приведенном выше примере).

Связанное материализованное представление использует ранее указанный запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, как мы добавляем суффикс `State` в конец наших агрегатных функций. Это гарантирует, что агрегатное состояние функции возвращается, а не итоговый результат. Это будет содержать дополнительную информацию, позволяющую этому частичному состоянию объединиться с другими состояниями.

Как только данные были перезагружены через перезапуск Collector-а, мы можем подтвердить, что в таблице `unique_visitors_per_hour` доступно 113 строк.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

Наш окончательный запрос должен использовать суффикс Merge для наших функций (так как столбцы хранят частичные агрегатные состояния):

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

Обратите внимание, что здесь мы используем `GROUP BY`, вместо использования `FINAL`.
### Использование материализованных представлений (инкрементных) для быстрого поиска {#using-materialized-views-incremental--for-fast-lookups}

Пользователи должны учитывать свои шаблоны доступа при выборе упорядочивающего ключа ClickHouse с колонками, которые часто используются в условиях фильтрации и агрегации. Это может быть ограничивающим фактором в сценариях мониторинга, где у пользователей более разнообразные шаблоны доступа, которые не могут быть обособлены в одном наборе колонок. Это лучше всего иллюстрируется на примере, встроенном в стандартные схемы OTel. Рассмотрим стандартную схему для трассировок:

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

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. В трассировке пользователям также нужна возможность выполнять поиск по конкретному `TraceId` и извлекать связанные с ним прогоны трассировки. Хотя это присутствует в упорядочивающем ключе, его положение в конце означает, что [фильтрация не будет такой эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) и, вероятно, потребуется просканировать значительные объемы данных при извлечении одной трассировки.

OTel collector также устанавливает материализованное представление и связанную таблицу для решения этой проблемы. Таблица и представление показаны ниже:

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

Представление эффективно гарантирует, что таблица `otel_traces_trace_id_ts` имеет минимальное и максимальное время метки для трассировки. Эта таблица, упорядоченная по `TraceId`, позволяет эффективно извлекать эти временные метки. Эти диапазоны временных меток могут, в свою очередь, использоваться при запросе основной таблицы `otel_traces`. Более конкретно, при извлечении трассировки по ее идентификатору, Grafana использует следующий запрос:

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

CTE здесь определяет минимальную и максимальную временную метку для идентификатора трассировки `ae9226c78d1d360601e6383928e4d22d`, прежде чем использовать это для фильтрации основной таблицы `otel_traces` для его связанных прогонах.

Этот же подход можно применить к аналогичным шаблонам доступа. Мы исследуем аналогичный пример в Моделировании данных [здесь](/materialized-view/incremental-materialized-view#lookup-table).
### Использование проекций {#using-projections}

Проекции ClickHouse позволяют пользователям указывать несколько клаузул `ORDER BY` для таблицы.

В предыдущих разделах мы исследовали, как материализованные представления могут быть использованы в ClickHouse для предварительного вычисления агрегаций, трансформации строк и оптимизации запросов мониторинга для различных шаблонов доступа.

Мы предоставили пример, где материализованное представление отправляет строки в целевую таблицу с другим упорядочивающим ключом, чем оригинальная таблица, получающая вставки, чтобы оптимизировать для поиска по идентификатору трассировки.

Проекции могут быть использованы для решения той же проблемы, позволяя пользователю оптимизировать запросы по столбцу, который не является частью первичного ключа.

В теории, эта возможность может быть использована для предоставления нескольких упорядочивающих ключей для таблицы, с одним явным недостатком: дублирование данных. В частности, данные должны быть записаны в порядке основного первичного ключа в дополнение к порядку, указанному для каждой проекции. Это замедлит вставки и потребует больше дискового пространства.

:::note Проекции против материализованных представлений
Проекции предоставляют многие те же возможности, что и материализованные представления, но их следует использовать экономно, часто предпочитая последние. Пользователи должны понимать недостатки и когда они уместны. Например, хотя проекции могут быть использованы для предварительного вычисления агрегаций, мы рекомендуем пользователям использовать материализованные представления для этого.
:::

<Image img={observability_13} alt="Мониторинг и проекции" size="md"/>

Рассмотрим следующий запрос, который фильтрует нашу таблицу `otel_logs_v2` по кодам ошибок 500. Это, вероятно, распространенный шаблон доступа для ведения логов с пользователями, желающими фильтровать по кодам ошибок:

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
Мы не выводим результаты здесь с использованием `FORMAT Null`. Это заставляет читать все результаты, но не возвращать их, тем самым предотвращая преждевременное завершение запроса из-за LIMIT. Это просто, чтобы показать время, затраченное на сканирование всех 10 миллионов строк.
:::

Вышеуказанный запрос требует линейного сканирования с нашим выбранным упорядочивающим ключом `(ServiceName, Timestamp)`. Хотя мы могли бы добавить `Status` в конец упорядочивающего ключа, улучшая производительность для вышеуказанного запроса, мы также можем добавить проекцию.

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

Обратите внимание, что сначала нужно создать проекцию, а затем материализовать ее. Эта последняя команда приводит к тому, что данные хранятся дважды на диске в двух различных порядках. Проекцию также можно определить при создании данных, как показано ниже, и она будет автоматически поддерживаться по мере вставки данных.

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

Важно отметить, что если проекция создается через `ALTER`, ее создание происходит асинхронно, когда команда `MATERIALIZE PROJECTION` выдается. Пользователи могут подтвердить ход этой операции с помощью следующего запроса, ожидая `is_done=1`.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Если мы повторим вышеуказанный запрос, мы можем увидеть, что производительность значительно улучшилась за счет дополнительного хранения (см. ["Измерение размера таблицы и сжатия"](#measuring-table-size--compression) для измерения этого).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

В приведенном примере мы указываем столбцы, использованные в предыдущем запросе, в проекции. Это означает, что только эти указанные столбцы будут храниться на диске как часть проекции, упорядоченные по Status. Если, наоборот, мы использовали бы `SELECT *` здесь, все столбцы будут храниться. Хотя это позволило бы большему количеству запросов (с использованием любого подмножества столбцов) извлекать выгоду из проекции, потребуется дополнительное хранилище. Для измерения дискового пространства и сжатия смотрите ["Измерение размера таблицы и сжатия"](#measuring-table-size--compression).
### Вторичные/индексы для пропуска данных {#secondarydata-skipping-indices}

Как бы хорошо первичный ключ ни был настроен в ClickHouse, некоторые запросы неизбежно потребуют полных сканирований таблицы. Хотя это может быть смягчено с помощью материализованных представлений (и проекций для некоторых запросов), они требуют дополнительного обслуживания, и пользователи должны быть в курсе их доступности, чтобы гарантировать их использование. В то время как традиционные реляционные базы данных решают эту проблему с помощью вторичных индексов, они неэффективны в колонкоориентированных базах данных, таких как ClickHouse. Вместо этого ClickHouse использует индексы "Пропуск", которые могут значительно улучшить производительность запросов, позволяя базе данных пропускать большие фрагменты данных без соответствующих значений.

Стандартные схемы OTel используют вторичные индексы в попытке ускорить доступ к картам. Хотя мы считаем их в целом неэффективными и не рекомендуем копировать их в вашу пользовательскую схему, индексы для пропуска могут быть все же полезны.

Пользователи должны прочитать и понять [руководство по вторичным индексам](/optimize/skipping-indexes) перед тем, как пытаться их применять.

**В общем, они эффективны, когда существует сильная корреляция между первичным ключом и целевым, не первичным столбцом/выражением, и пользователи ищут редкие значения, т.е. те, которые не встречаются во многих гранулах.**
### Фильтры Блума для текстового поиска {#bloom-filters-for-text-search}

Для запросов мониторинга вторичные индексы могут быть полезны, когда пользователи хотят выполнять текстовые поиски. В частности, индексы фильтров Блума на основе ngram и токенов [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) и [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) могут использоваться для ускорения поиска по строковым колонкам с операторами `LIKE`, `IN` и hasToken. Важно отметить, что индекс на основе токенов создает токены, используя неалфавитные символы в качестве разделителей. Это означает, что только токены (или целые слова) могут быть сопоставлены во время запроса. Для более детального сопоставления можно использовать [N-gram фильтр Блума](/optimize/skipping-indexes#bloom-filter-types). Он разбивает строки на ngram с заданным размером, что позволяет выполнять сопоставление подслов.

Чтобы оценить токены, которые будут созданы и, следовательно, сопоставлены, можно использовать функцию `tokens`:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

Функция `ngram` предоставляет подобные возможности, где размер `ngram` может быть указан в качестве второго параметра:

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note Обратные индексы
ClickHouse также имеет экспериментальную поддержку обратных индексов в качестве вторичного индекса. В настоящее время мы не рекомендуем их для наборов данных логов, но ожидаем, что они заменят индексы на основе токенов фильтров Блума, когда они будут готовы к производству.
:::

Для целей этого примера мы используем набор данных структурированных логов. Предположим, мы хотим подсчитать логи, в которых столбец `Referer` содержит `ultra`.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

Здесь нам нужно сопоставить ngram размером 3. Таким образом, мы создаем индекс `ngrambf_v1`.

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

Индекс `ngrambf_v1(3, 10000, 3, 7)` здесь принимает четыре параметра. Последний из них (значение 7) представляет собой сид. Остальные представляют собой размер ngram (3), значение `m` (размер фильтра) и количество хеш-функций `k` (7). `k` и `m` требуют настройки и будут основаны на количестве уникальных ngram/токенов и вероятности, что фильтр даёт ложный отрицательный результат - таким образом подтверждая, что значение отсутствует в грануле. Мы рекомендуем [эти функции](/engines/table-engines/mergetree-family/mergetree#bloom-filter) для помощи в установлении этих значений.

Если правильно настроить, ускорение здесь может быть значительным:

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
Вышеуказанное представлено только для иллюстрации. Мы рекомендуем пользователям извлекать структуру из своих логов во время вставки, а не пытаться оптимизировать текстовые поиски, используя токены фильтров Блума. Тем не менее, существуют случаи, когда у пользователей есть трассировки стека или другие большие строки, для которых текстовый поиск может быть полезен из-за менее детерминированной структуры.
:::

Некоторые общие рекомендации по использованию фильтров Блума:

Цель фильтра Блума – отфильтровать [гранулы](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), таким образом избегая необходимости загружать все значения для столбца и выполнять линейное сканирование. Клаузу `EXPLAIN` с параметром `indexes=1` можно использовать для определения количества гранул, которые были пропущены. Рассмотрите ответы ниже для оригинальной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с фильтром Блума ngram.

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

Фильтр Блума, как правило, будет быстрее только в том случае, если он меньше самого столбца. Если он больше, то вероятно, что преимущества производительности будут незначительными. Сравните размер фильтра с размером столбца, используя следующие запросы:

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

В приведенных примерах мы можем видеть, что вторичный индекс фильтра Блума составляет 12MB - почти в 5 раз меньше, чем сжатый размер самого столбца, который составляет 56MB.

Фильтры Блума могут потребовать значительной настройки. Мы рекомендуем следовать заметкам [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые могут быть полезны для определения оптимальных настроек. Фильтры Блума также могут быть затратными во время вставки и слияния. Пользователи должны оценить влияние на производительность вставки перед добавлением фильтров Блума в производство.

Дополнительные сведения о вторичных индексах для пропуска данных можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).
### Извлечение из карт {#extracting-from-maps}

Тип Map широко распространен в схемах OTel. Этот тип требует, чтобы значения и ключи имели один и тот же тип - что достаточно для метаданных, таких как метки Kubernetes. Будьте внимательны, что при запросе подполя типа Map загружается весь родительский столбец. Если в карте много ключей, это может привести к значительным штрафам за запрос, так как необходимо прочитать больше данных с диска, чем если бы ключ существовал как столбец.

Если вы часто запрашиваете определенный ключ, рассмотрите возможность его перемещения в собственный отдельный столбец на корневом уровне. Обычно это задача, которая происходит в ответ на общие шаблоны доступа и после развертывания, и ее сложно предсказать до производства. Смотрите ["Управление изменениями схемы"](/observability/managing-data#managing-schema-changes) для получения информации о том, как изменить свою схему после развертывания.
## Измерение размера таблицы и сжатия {#measuring-table-size--compression}

Одной из основных причин, по которым ClickHouse используется для мониторинга, является сжатие.

Помимо значительного снижения затрат на хранение, меньшее количество данных на диске означает меньшую I/O и более быстрые запросы и вставки. Снижение ввод-вывод перекрывает накладные расходы любого алгоритма сжатия относительно CPU. Таким образом, улучшение сжатия данных должно быть первым приоритетом при работе на обеспечении быстродействия запросов ClickHouse.

Подробности о измерении сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).
