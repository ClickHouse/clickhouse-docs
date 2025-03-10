---
title: Проектирование схемы
description: Проектирование схемы для наблюдаемости
keywords: [наблюдаемость, журналы, трассировки, метрики, OpenTelemetry, Grafana, OTel]
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';

# Проектирование схемы для наблюдаемости

Мы рекомендуем пользователям всегда создавать свою собственную схему для журналов и трассировок по следующим причинам:

- **Выбор первичного ключа** - В схемах по умолчанию используется `ORDER BY`, который оптимизирован для определенных шаблонов доступа. Вряд ли ваши шаблоны доступа будут соответствовать этому.
- **Извлечение структуры** - Пользователи могут захотеть извлечь новые колонки из существующих колонок, например, из колонки `Body`. Это можно сделать с помощью материализованных колонок (и материализованных представлений в более сложных случаях). Это требует изменений в схеме.
- **Оптимизация карт** - В схемах по умолчанию используется тип Map для хранения атрибутов. Эти колонки позволяют хранить произвольные метаданные. Хотя это и является важной возможностью, так как метаданные событий часто не определяются заранее и, следовательно, не могут быть сохранены в строго типизированной базе данных, такой как ClickHouse, доступ к ключам и их значениям в карте не так эффективен, как доступ к обычной колонке. Мы решаем эту проблему, модифицируя схему и обеспечивая, чтобы наиболее часто используемые ключи карты были колонками верхнего уровня - см. ["Извлечение структуры с помощью SQL"](#extracting-structure-with-sql). Это требует изменений в схеме.
- **Упрощение доступа к ключам карты** - Доступ к ключам в картах требует более подробно описанного синтаксиса. Пользователи могут смягчить это с помощью псевдонимов. Смотрите ["Использование псевдонимов"](#using-aliases) для упрощения запросов.
- **Вторичные индексы** - В схеме по умолчанию используются вторичные индексы для ускорения доступа к картам и ускорения текстовых запросов. Обычно они не требуются и занимают дополнительное дисковое пространство. Их можно использовать, но следует протестировать, нужны ли они. Смотрите ["Вторичные / индексы пропуска данных"](#secondarydata-skipping-indices).
- **Использование кодеков** - Пользователи могут захотеть настроить кодеки для колонок, если они понимают ожидаемые данные и имеют доказательства того, что это улучшает сжатие.

_Мы подробно описываем каждый из вышеуказанных случаев использования ниже._

**Важно:** Хотя пользователи поощряются к расширению и изменению своей схемы для достижения оптимального сжатия и производительности запросов, они должны придерживаться схемы именования OTel для основных колонок, где это возможно. Плагин ClickHouse для Grafana предполагает наличие некоторых базовых колонок OTel для помощи в построении запросов, например, Timestamp и SeverityText. Требуемые колонки для журналов и трассировок задокументированы здесь [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) и [здесь](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure), соответственно. Вы можете изменить эти имена колонок, переопределив значения по умолчанию в конфигурации плагина.
## Извлечение структуры с помощью SQL {#extracting-structure-with-sql}

При поглощении структурированных или неструктурированных журналов пользователям часто требуется возможность:

- **Извлечение колонок из строковых блобов**. Запросы к ним будут быстрее, чем использование строковых операций во время выполнения запроса.
- **Извлечение ключей из карт**. Схема по умолчанию помещает произвольные атрибуты в колонки типа Map. Этот тип предоставляет схему без схемы, что имеет преимущество, так как пользователям не нужно заранее определять колонки для атрибутов при определении журналов и трассировок. Часто это невозможно при сборе журналов из Kubernetes, и при этом необходимо сохранить метки подов для последующего поиска. Доступ к ключам карты и их значениям медленнее, чем выполнение запросов по обычным колонкам ClickHouse. Следовательно, извлечение ключей из карт в корневые колонки таблицы часто желательно.

Рассмотрим следующие запросы:

Предположим, мы хотим подсчитать, какие URL пути получают больше всего POST запросов, используя структурированные журналы. JSON блоб хранится в колонке `Body` как строка. Кроме того, он может также храниться в колонке `LogAttributes` как `Map(String, String)`, если пользователь включил json_parser в сборщике.

```sql
SELECT LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:      	{"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
LogAttributes: {'status':'200','log.file.name':'access-structured.log','request_protocol':'HTTP/1.1','run_time':'0','time_local':'2019-01-22 00:26:14.000','size':'30577','user_agent':'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)','referer':'-','remote_user':'-','request_type':'GET','request_path':'/filter/27|13 ,27|  5 ,p53','remote_addr':'54.36.149.41'}
```

Предположим, что `LogAttributes` доступна, запрос для подсчета, какие URL пути сайта получают больше всего POST запросов:

```sql
SELECT path(LogAttributes['request_path']) AS path, count() AS c
FROM otel_logs
WHERE ((LogAttributes['request_type']) = 'POST')
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.735 sec. Processed 10.36 million rows, 4.65 GB (14.10 million rows/s., 6.32 GB/s.)
Peak memory usage: 153.71 MiB.
```

Обратите внимание на использование синтаксиса карты здесь, например, `LogAttributes['request_path']`, и функции [`path`](/sql-reference/functions/url-functions#path) для удаления параметров запроса из URL.

Если пользователь не включил разбор JSON в сборщике, `LogAttributes` будет пустым, что заставит нас использовать [функции JSON](/sql-reference/functions/json-functions) для извлечения колонок из строкового `Body`.

:::note Предпочитайте ClickHouse для разбора
Мы вообще рекомендуем пользователям выполнять разбор JSON в ClickHouse для структурированных журналов. Мы уверены, что ClickHouse - это самая быстрая реализация разбора JSON. Однако мы понимаем, что пользователи могут пожелать отправить журналы в другие источники и не хотят, чтобы эта логика находилась в SQL.
:::

```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.668 sec. Processed 10.37 million rows, 5.13 GB (15.52 million rows/s., 7.68 GB/s.)
Peak memory usage: 172.30 MiB.
```

Теперь рассмотрим то же самое для неструктурированных журналов:

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:      	151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
```

Аналогичный запрос для неструктурированных журналов требует использования регулярных выражений через функцию [`extractAllGroupsVertical`](/sql-reference/functions/string-search-functions#extractallgroupsvertical).

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
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 1.953 sec. Processed 10.37 million rows, 3.59 GB (5.31 million rows/s., 1.84 GB/s.)
```

Увеличенная сложность и стоимость запросов для разбора неструктурированных журналов (обратите внимание на разницу в производительности) является причиной, по которой мы рекомендуем пользователям всегда использовать структурированные журналы, когда это возможно.

:::note Рассмотрите словари 
Вышеупомянутый запрос может быть оптимизирован для использования словарей регулярных выражений. См. [Использование словарей](#using-dictionaries) для получения подробной информации.
:::

Оба этих случая использования могут быть реализованы с помощью ClickHouse, переместив вышеуказанную логику запроса на время вставки. Мы рассмотрим несколько подходов ниже, подчеркивая, когда каждый из них подходит.

:::note OTel или ClickHouse для обработки? 
Пользователи также могут выполнять обработку с использованием процессоров и операторов OTel Collector, как описано [здесь](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching). В большинстве случаев пользователи обнаружат, что ClickHouse значительно более эффективно расходует ресурсы и быстрее, чем процессоры сборщика. Основной недостаток выполнения всей обработки событий в SQL заключается в связывании вашего решения с ClickHouse. Например, пользователи могут пожелать отправить обработанные журналы в альтернативные пункты назначения от OTel сборщика, например, S3.
:::
### Материализованные колонки {#materialized-columns}

Материализованные колонки предлагают самое простое решение для извлечения структуры из других колонок. Значения таких колонок всегда вычисляются во время вставки и не могут быть указаны в запросах INSERT.

:::note Нагрузка 
Материализованные колонки требуют дополнительного объема памяти, поскольку значения извлекаются в новые колонки на диске во время вставки.
:::

Материализованные колонки поддерживают любое выражение ClickHouse и могут использовать любые аналитические функции для [обработки строк](/sql-reference/functions/string-functions) (включая [регулярные выражения и поиск](/sql-reference/functions/string-search-functions) и [URL](/sql-reference/functions/url-functions), выполнять [преобразования типов](/sql-reference/functions/type-conversion-functions), [извлечение значений из JSON](/sql-reference/functions/json-functions) или [математические операции](/sql-reference/functions/math-functions).

Мы рекомендуем материализованные колонки для базовой обработки. Они особенно полезны для извлечения значений из карт, их продвижения в корневые колонки и выполнения преобразований типов. Они обычно наиболее полезны, когда используются в очень простых схемах или в сочетании с материализованными представлениями. Рассмотрим следующую схему для журналов, из которой JSON был извлечен в колонку `LogAttributes` сборщиком:

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

Эквивалентная схема для извлечения с использованием функций JSON из строкового `Body` может быть найдена [здесь](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==).

Наши три материализованных представления колонок извлекают страницу запроса, тип запроса и домен реферера. Эти колонки обращаются к ключам карты и применяют функции к их значениям. Наш последующий запрос гораздо быстрее:

```sql
SELECT RequestPage AS path, count() AS c
FROM otel_logs
WHERE RequestType = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.173 sec. Processed 10.37 million rows, 418.03 MB (60.07 million rows/s., 2.42 GB/s.)
Peak memory usage: 3.16 MiB.
```

:::note
Материализованные колонки, по умолчанию, не будут возвращены в `SELECT *`. Это необходимо для сохранения инварианты того, что результат `SELECT *` может всегда быть вставлен обратно в таблицу с помощью INSERT. Это поведение можно отключить, установив `asterisk_include_materialized_columns=1`, и его можно включить в Grafana (см. `Дополнительные настройки -> Пользовательские настройки` в конфигурации источника данных).
:::
## Материализованные представления {#materialized-views}

[Материализованные представления](/materialized-views) предоставляют более мощный способ применения фильтрации SQL и преобразований к журналам и трассировкам.

Материализованные представления позволяют пользователям перенести стоимость вычислений с времени запроса на время вставки. Материализованное представление ClickHouse - это просто триггер, который выполняет запрос на блоках данных по мере их вставки в таблицу. Результаты этого запроса вставляются во вторую "целевую" таблицу.

<img src={observability_10}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />


:::note Обновления в реальном времени
Материализованные представления в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на основе которой они построены, функционируя больше как постоянно обновляющиеся индексы. В отличие от этого, в других базах данных материализованные представления обычно представляют собой статические снимки запроса, которые должны быть обновлены (аналогично обновляемым материализованным представлениям ClickHouse).
:::


Запрос, связанный с материализованным представлением, теоретически может быть любым запросом, включая агрегацию, хотя [существуют ограничения по соединениям](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins). Для преобразований и фильтрационных нагрузок, необходимых для журналов и трассировок, пользователи могут считать любое выражение `SELECT` возможным.

Пользователи должны помнить, что запрос является просто триггером, выполняющимся над вставляемыми строками в таблицу (исходная таблица), а результаты направляются в новую таблицу (целевую таблицу).

Чтобы гарантировать, что мы не сохраняем данные дважды (в исходной и целевой таблицах), мы можем изменить таблицу исходной таблицы на [нулевой движок таблиц](/engines/table-engines/special/null), сохраняя исходную схему. Наши сборщики OTel продолжат отправлять данные в эту таблицу. Например, для журналов таблица `otel_logs` становится:

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

Нулевой движок таблицы является мощной оптимизацией - воспринимайте его как `/dev/null`. Эта таблица не будет хранить никаких данных, но все присоединенные материализованные представления все равно будут выполняться над вставляемыми строками прежде, чем они будут отброшены.

Рассмотрим следующий запрос. Он преобразует наши строки в формат, который мы хотим сохранить, извлекая все колонки из `LogAttributes` (предполагаем, что это было установлено сборщиком с использованием оператора `json_parser`), устанавливая `SeverityText` и `SeverityNumber` (основываясь на некоторых простых условиях и определениях [этих колонок](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)). В этом случае мы также выбираем только колонки, о которых знаем, что они будут заполнены, игнорируя колонки, такие как `TraceId`, `SpanId` и `TraceFlags`.

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
Body:        	{"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:   	2019-01-22 00:26:14
ServiceName:
Status:      	200
RequestProtocol: HTTP/1.1
RunTime:     	0
Size:        	30577
UserAgent:   	Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:     	-
RemoteUser:  	-
RequestType: 	GET
RequestPath: 	/filter/27|13 ,27|  5 ,p53
RemoteAddr: 	54.36.149.41
RefererDomain:
RequestPage: 	/filter/27|13 ,27|  5 ,p53
SeverityText:	INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.027 sec.
```

Мы также извлекаем колонку `Body` выше - на случай, если впоследствии будут добавлены дополнительные атрибуты, которые не извлекаются нашим SQL. Эта колонка хорошо сжимается в ClickHouse и редко будет доступна, таким образом, не влияя на производительность запросов. Наконец, мы преобразуем Timestamp в DateTime (чтобы сэкономить место - см. ["Оптимизация типов"](#optimizing-types)).

:::note Условия
Обратите внимание на использование [условий](/sql-reference/functions/conditional-functions) выше для извлечения `SeverityText` и `SeverityNumber`. Эти функции чрезвычайно полезны для формирования сложных условий и проверки, если значения установлены в картах - мы наивно предполагаем, что все ключи существуют в `LogAttributes`. Мы рекомендуем пользователям ознакомиться с ними - они ваши помощники в разборе журналов, наряду с функциями для работы с [null значениями](/sql-reference/functions/functions-for-nulls)!
:::

Нам нужна таблица для получения этих результатов. Ниже целевая таблица соответствует вышеуказанному запросу:

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

Выбранные здесь типы основаны на оптимизациях, обсуждаемых в ["Оптимизация типов"](#optimizing-types).

:::note
Обратите внимание, как мы радикально изменили нашу схему. На самом деле, пользователи, вероятно, также захотят сохранить колонки Trace, а также колонку `ResourceAttributes` (которая обычно содержит метаданные Kubernetes). Grafana может использовать колонки трассировки для предоставления функциональности связывания между журналами и трассировками - см. ["Использование Grafana"](/observability/grafana).
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

Вышеизложенное визуализируется ниже:

<img src={observability_11}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

Если мы теперь перезапустим конфигурацию сборщика, используемую в ["Экспорт в ClickHouse"](/observability/integrating-opentelemetry#exporting-to-clickhouse), данные появятся в `otel_logs_v2` в нашем желаемом формате. Обратите внимание на использование типизированных функций извлечения JSON.

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:        	{"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:   	2019-01-22 00:26:14
ServiceName:
Status:      	200
RequestProtocol: HTTP/1.1
RunTime:     	0
Size:        	30577
UserAgent:   	Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:     	-
RemoteUser:  	-
RequestType: 	GET
RequestPath: 	/filter/27|13 ,27|  5 ,p53
RemoteAddress: 	54.36.149.41
RefererDomain:
RequestPage: 	/filter/27|13 ,27|  5 ,p53
SeverityText:	INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.010 sec.
```

Эквивалентное материальное представление, которое полагается на извлечение колонок из колонки `Body` с использованием функций JSON, показано ниже:

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

Вышеизложенные материализованные представления зависят от неявного приведения типов - особенно в случае использования карты `LogAttributes`. ClickHouse часто прозрачно приводит извлеченное значение к типу целевой таблицы, что уменьшает требуемый синтаксис. Однако мы рекомендуем пользователям всегда тестировать свои представления с помощью оператора `SELECT` представлений и оператора [`INSERT INTO`](/sql-reference/statements/insert-into) с целевой таблицей, использующей ту же схему. Это должно подтвердить, что типы обрабатываются правильно. Особое внимание следует уделить следующим случаям:

- Если ключ не существует в карте, будет возвращена пустая строка. В случае числовых значений пользователям нужно будет сопоставить их с соответствующим значением. Этого можно добиться с помощью [условий](/sql-reference/functions/conditional-functions), например, `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` или [функций приведения](/sql-reference/functions/type-conversion-functions), если значения по умолчанию приемлемы, например, `toUInt8OrDefault(LogAttributes['status'] )`.
- Некоторые типы не всегда будут приводиться, например, строковые представления чисел не будут приводиться к значениям перечислений.
- Функции извлечения JSON возвращают значения по умолчанию для своего типа, если значение не найдено. Убедитесь, что эти значения имеют смысл!

:::note Избегайте Nullable
Избегайте использования [Nullable](/sql-reference/data-types/nullable) в Clickhouse для данных наблюдаемости. Обычно не требуется различать пустые и нулевые значения в журналах и трассировках. Эта функция требует дополнительного объема памяти и негативно влияет на производительность запросов. См. [здесь](/data-modeling/schema-design#optimizing-types) для получения дополнительных подробностей.
:::
## Выбор первичного (упорядочивающего) ключа {#choosing-a-primary-ordering-key}

Как только вы извлечете желаемые колонки, вы можете начать оптимизировать свой упорядочивающий/первичный ключ.

Некоторые простые правила могут быть применены для выбора упорядочивающего ключа. Следующие правила иногда могут конфликтовать, поэтому рассмотрите их в порядке. Пользователи могут определить несколько ключей в этом процессе, обычно достаточно 4-5:

1. Выберите колонки, которые соответствуют вашим общим фильтрам и паттернам доступа. Если пользователи обычно начинают расследование наблюдаемости, фильтруя по конкретной колонке, например, по имени пода, эта колонка будет часто использоваться в `WHERE` условии. Приоритезируйте включение этих колонок в ваш ключ над теми, которые используются реже.
2. Предпочитайте колонки, которые помогают исключать большой процент общих строк при фильтрации, тем самым уменьшая объем данных, которые нужно читать. Имена сервисов и коды статуса часто являются хорошими кандидатами - в последнем случае только если пользователи фильтруют по значениям, которые исключают большинство строк, например, фильтрация по 200-м будет в большинстве случаев соответствовать большинству строк, в то время как фильтрация по 500 будет соответствовать небольшой подсистеме.
3. Предпочитайте колонки, которые, скорее всего, будут иметь высокую корреляцию с другими колонками в таблице. Это поможет гарантировать, что эти значения также будут храниться совместно, улучшая сжатие.
4. Операции `GROUP BY` и `ORDER BY` для колонок в упорядочивающем ключе могут быть сделаны более эффективными по памяти.

<br />

При выявлении поднабора колонок для упорядочивающего ключа, они должны быть объявлены в определенном порядке. Этот порядок может значительно повлиять как на эффективность фильтрации по колонкам вторичного ключа в запросах, так и на коэффициент сжатия для файлов данных таблицы. В общем, лучше всего упорядочивать ключи в порядке возрастания кардинальности. Это следует сбалансировать с тем фактом, что фильтрация по колонкам, которые располагаются позже в упорядочивающем ключе, будет менее эффективной, чем фильтрация по тем, которые располагаются раньше в наборе. Уравновесьте эти поведения и рассмотрите ваши паттерны доступа. Более всего, тестируйте варианты. Для дальнейшего понимания упорядочивающих ключей и их оптимизации мы рекомендуем [эту статью](/guides/best-practices/sparse-primary-indexes).

:::note Сначала структура
Мы рекомендуем определить свои упорядочивающие ключи, как только вы структурировали свои журналы. Не используйте ключи в атрибутах карт для упорядочивающего ключа или выражения извлечения JSON. Убедитесь, что ваши упорядочивающие ключи являются корневыми колонками в вашей таблице.
:::
## Использование карт {#using-maps}

Ранее примеры показывают использование синтаксиса карты `map['key']` для доступа к значениям в колонках `Map(String, String)`. В дополнение к тому, что используется обозначение карты для доступа к вложенным ключам, специализированные функции ClickHouse [функций карт](/sql-reference/functions/tuple-map-functions#mapkeys) доступны для фильтрации или выбора этих колонок.

Например, следующий запрос определяет все уникальные ключи, доступные в колонке `LogAttributes`, используя функцию [`mapKeys`](/sql-reference/functions/tuple-map-functions#mapkeys), за которой следует функция [`groupArrayDistinctArray`](/sql-reference/aggregate-functions/combinators) (комбинатор).

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
Мы не рекомендуем использовать точки в именах колонок карты и можем отменить ее использование. Используйте `_`. 
:::
## Использование псевдонимов {#using-aliases}

Запросы к типам map медленнее, чем к обычным колонкам - см. ["Ускорение запросов"](#accelerating-queries). Кроме того, синтаксически это более сложно и может быть обременительно для пользователей. Для решения этой последней проблемы мы рекомендуем использовать псевдонимы колонок.

Коло́нки ALIAS вычисляются во время запроса и не хранятся в таблице. Поэтому невозможно вставить значение в колонку такого типа. С помощью псевдонимов мы можем ссылаться на ключи map и упрощать синтаксис, прозрачно exposing записи map как обычную колонку. Рассмотрим следующий пример:

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

У нас есть несколько материализованных колонок и колонка `ALIAS`, `RemoteAddr`, которая обращается к карте `LogAttributes`. Теперь мы можем запрашивать значения `LogAttributes['remote_addr']` через эту колонку, тем самым упрощая наш запрос, т.е.

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

Кроме того, добавление `ALIAS` тривиально с помощью команды `ALTER TABLE`. Эти колонки сразу доступны, например:

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
По умолчанию, `SELECT *` исключает колонки ALIAS. Это поведение может быть отключено установкой `asterisk_include_alias_columns=1`.
:::
## Оптимизация типов {#optimizing-types}

Общие рекомендации по ClickHouse применимы к использованию ClickHouse для оптимизации типов.
## Использование кодеков {#using-codecs}

В дополнение к оптимизации типов пользователи могут следовать общим рекомендациям по кодекам при попытке оптимизации сжатия для схем ClickHouse Observability.

В общем, пользователи обнаружат, что кодек `ZSTD` весьма применим к наборам данных журналирования и трассировки. Увеличение значения сжатия от его значения по умолчанию 1 может улучшить сжатие. Однако это следует тестировать, так как более высокие значения увеличивают нагрузку на процессор в момент вставки. Обычно мы видим небольшое увеличение от повышения этого значения.

Более того, временные метки, хотя и выигрывают от дельта-кодирования в отношении сжатия, могут снижать скорость выполнения запросов, если этот столбец используется в первичном/упорядочивающем ключе. Мы рекомендуем пользователям оценить соответствующие компромиссы между сжатием и производительностью запросов.
## Использование словарей {#using-dictionaries}

[Словари](/sql-reference/dictionaries) являются ключевой функцией ClickHouse, обеспечивающей представление данных в памяти в формате [ключ-значение](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) из различных внутренних и внешних [источников](/sql-reference/dictionaries#dictionary-sources), оптимизированные для супернизкой задержки при поисковых запросах.

<img src={observability_12}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

Это полезно в различных сценариях, от обогащения обрабатываемых данных на лету без задержки в процессе вставки и улучшения производительности запросов в целом, при этом JOIN, в частности, получает выгоду.
Хотя соединения редко требуются в случаях Observability, словари все равно могут быть полезны для целей обогащения - как во время вставки, так и во время запроса. Мы предоставляем примеры обоих ниже.

:::note Ускорение соединений
Пользователи, заинтересованные в ускорении соединений с помощью словарей, могут найти дополнительные сведения [здесь](/dictionary).
:::
### Время вставки против времени запроса {#insert-time-vs-query-time}

Словари могут использоваться для обогащения наборов данных во время запроса или вставки. Каждому из этих подходов соответствуют свои плюсы и минусы. В кратце:

- **Время вставки** - Это обычно подходит, если значение обогащения не изменяется и доступно во внешнем источнике, который может быть использован для заполнения словаря. В этом случае обогащение строки во время вставки избегает поиска в словаре во время запроса. Это имеет свою цену в производительности вставки, а также дополнительной нагрузке на хранение, так как обогащенные значения будут храниться как колонки.
- **Время запроса** - Если значения в словаре часто меняются, поиски во время запроса часто более применимы. Это избегает необходимости обновлять колонки (и перезаписывать данные), если сопоставленные значения изменяются. Эта гибкость имеет свою цену в перегрузке поиска во время запроса. Эта цена обычно гораздо заметнее, если поиск требуется для многих строк, т.е. используя поиск в словаре в условии фильтра. Для обогащения результата, т.е. в `SELECT`, эта перегрузка обычно незначительна.

Мы рекомендуем пользователям ознакомиться с основами словарей. Словари предоставляют таблицу поиска в памяти, из которой значения могут быть извлечены с использованием специализированных [функций](/sql-reference/functions/ext-dict-functions#dictgetall).

Для простых примеров обогащения см. руководство по словарям [здесь](/dictionary). Ниже мы сосредоточимся на общих задачах обогащения в области observability.
### Использование IP словарей {#using-ip-dictionaries}

Гео-обогащение журналов и трассировок значениями широты и долготы с использованием IP-адресов является общей потребностью в области Observability. Мы можем достичь этого с помощью структурированного словаря `ip_trie`.

Мы используем общедоступный [набор данных уровня города DB-IP](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly), предоставленный [DB-IP.com](https://db-ip.com/) на условиях [лицензии CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Из [readme](https://github.com/sapics/ip-location-db#csv-format) мы можем увидеть, что данные структурированы следующим образом:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

Учитывая эту структуру, давайте сначала взглянем на данные с помощью функции таблицы [url()](/sql-reference/table-functions/url):

```sql
SELECT *
FROM url('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV', '\n    	\tip_range_start IPv4, \n    	\tip_range_end IPv4, \n    	\tcountry_code Nullable(String), \n    	\tstate1 Nullable(String), \n    	\tstate2 Nullable(String), \n    	\tcity Nullable(String), \n    	\tpostcode Nullable(String), \n    	\tlatitude Float64, \n    	\tlongitude Float64, \n    	\ttimezone Nullable(String)\n	\t')
LIMIT 1
FORMAT Vertical
Row 1:
──────
ip_range_start: 1.0.0.0
ip_range_end:   1.0.0.255
country_code:   AU
state1:     	Queensland
state2:     	ᴺᵁᴸᴸ
city:       	South Brisbane
postcode:   	ᴺᵁᴸᴸ
latitude:   	-27.4767
longitude:  	153.017
timezone:   	ᴺᵁᴸᴸ
```

Чтобы упростить нашу задачу, давайте используем таблицу [URL()](/engines/table-engines/special/url) для создания объекта таблицы ClickHouse с нашими именами полей и подтвердим общее количество строк:

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

SELECT count() FROM geoip_url;

┌─count()─┐
│ 3261621 │ -- 3.26 миллиона
└─────────┘
```

Поскольку наш словарь `ip_trie` требует, чтобы диапазоны IP были выражены в нотации CIDR, нам нужно преобразовать `ip_range_start` и `ip_range_end`.

Этот CIDR для каждого диапазона можно кратко вычислить с помощью следующего запроса:

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
│ 1.0.0.0     	 │ 1.0.0.255	 │ 1.0.0.0/24 │
│ 1.0.1.0     	 │ 1.0.3.255	 │ 1.0.0.0/22 │
│ 1.0.4.0     	 │ 1.0.7.255	 │ 1.0.4.0/22 │
│ 1.0.8.0     	 │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4 rows in set. Elapsed: 0.259 sec.
```

:::note
В приведенном выше запросе много процессов. Для заинтересованных пользователей читайте это отличное [объяснение](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation). В противном случае примите к сведению, что вышеуказанное вычисляет CIDR для диапазона IP.
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
    bitXor(ip_range_start, ip_range_end) AS xor,
    if(xor != 0, ceil(log2(xor)), 0) AS unmatched,
    32 - unmatched AS cidr_suffix,
    toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) AS cidr_address
SELECT
    concat(toString(cidr_address),'/',toString(cidr_suffix)) AS cidr,
    latitude,
    longitude,
    country_code    
FROM geoip_url
```

Чтобы выполнять низкозадерживающие запросы IP в ClickHouse, мы воспользуемся словарями для хранения сопоставления ключей к атрибутам для наших данных Geo IP в памяти. ClickHouse предоставляет структуру словаря `ip_trie` для сопоставления наших сетевых префиксов (CIDR блоков) к координатам и кодам стран. Следующий запрос определяет словарь с помощью этой структуры и указанной таблицы как источника.

```sql
CREATE DICTIONARY ip_trie (
   cidr String,
   latitude Float64,
   longitude Float64,
   country_code String
)
PRIMARY KEY cidr
SOURCE(clickhouse(table 'geoip'))
LAYOUT(ip_trie)
LIFETIME(3600);
```

Мы можем выбрать строки из словаря и подтвердить, что этот набор данных доступен для запросов:

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN       	   │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU       	   │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU       	   │
└────────────┴──────────┴───────────┴──────────────┘

3 rows in set. Elapsed: 4.662 sec.
```

:::note Периодическое обновление
Словари в ClickHouse обновляются периодически на основе данных подлежащей таблицы и условия срока использования, указанного выше. Чтобы обновить наш Geo IP словарь и отразить последние изменения в наборе данных DB-IP, нам просто нужно снова вставить данные из удаленной таблицы geoip_url в нашу таблицу `geoip` с примененными преобразованиями.
:::

Теперь, когда у нас есть данные Geo IP, загруженные в наш словарь `ip_trie` (который удобно назван `ip_trie`), мы можем использовать его для геолокации IP. Это можно сделать с помощью функции [`dictGet()`](/sql-reference/functions/ext-dict-functions) следующим образом:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Обратите внимание на скорость извлечения здесь. Это позволяет нам обогащать журналы. В этом случае мы выбираем **выполнить обогащение во время запроса**.

Возвращаясь к нашему исходному набору данных журналов, мы можем использовать вышеуказанное, чтобы агрегировать наши журналы по странам. Следующий запрос предполагает, что мы используем схему, полученную из нашего раннего материализованного представления, у которого есть извлеченная колонка `RemoteAddress`.

```sql
SELECT dictGet('ip_trie', 'country_code', tuple(RemoteAddress)) AS country,
    formatReadableQuantity(count()) AS num_requests
FROM default.otel_logs_v2
WHERE country != ''
GROUP BY country
ORDER BY count() DESC
LIMIT 5

┌─country─┬─num_requests────┐
│ IR  	  │ 7.36 миллионов	│
│ US  	  │ 1.67 миллиона	│
│ AE  	  │ 526.74 тысяч │
│ DE  	  │ 159.35 тысяч │
│ FR  	  │ 109.82 тысяч │
└─────────┴─────────────────┘

5 rows in set. Elapsed: 0.140 sec. Processed 20.73 million rows, 82.92 MB (147.79 million rows/s., 591.16 MB/s.)
Peak memory usage: 1.16 MiB.
```

Поскольку сопоставление IP с географическим местоположением может измениться, пользователям вероятно будет интересно знать, откуда пришел запрос в момент его отправки - а не какой в настоящее время географический адрес для того же IP. По этой причине обогащение во время вставки предполагается как предпочтительное. Это можно сделать с помощью материализованных колонок, как показано ниже, или в выборке материализованного представления:

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
Пользователи, вероятно, захотят, чтобы словарь обогащения IP периодически обновлялся на основе новых данных. Это можно сделать с помощью условия `LIFETIME` словаря, что вызовет периодическую перезагрузку словаря из подлежащей таблицы. Чтобы обновить подлежащую таблицу, смотрите ["Обновляемые материализованные представления"](/materialized-view/refreshable-materialized-view).
:::

Вышеуказанные страны и координаты предлагают возможности визуализации помимо группировки и фильтрации по странам. Для вдохновения смотрите ["Визуализация геоданных"](/observability/grafana#visualizing-geo-data).
### Использование регулярных выражений с помощью словарей (Парсинг User Agent) {#using-regex-dictionaries-user-agent-parsing}

Парсинг [строк user agent](https://en.wikipedia.org/wiki/User_agent) является классической задачей регулярных выражений и общей потребностью в наборах данных на основе журналов и трассировок. ClickHouse обеспечивает эффективный парсинг user agents, используя словари дерева регулярных выражений.

Словари дерева регулярных выражений определяются в ClickHouse open-source с использованием типа источника словаря YAMLRegExpTree, который предоставляет путь к файлу YAML, содержащему дерево регулярных выражений. Если вы хотите предоставить собственный словарь регулярных выражений, детали по необходимой структуре можно найти [здесь](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source). Ниже мы сосредоточимся на распарсивании user-agent, используя [uap-core](https://github.com/ua-parser/uap-core), и загрузим наш словарь для поддерживаемого формата CSV. Этот подход совместим как с OSS, так и с ClickHouse Cloud.

:::note
В приведенных ниже примерах мы используем снимки последних регулярных выражений uap-core для парсинга user-agent с июня 2024 года. Последний файл, который периодически обновляется, можно найти [здесь](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml). Пользователи могут следовать рекомендациям [здесь](/sql-reference/dictionaries#collecting-attribute-values) для загрузки в CSV файл, используемый ниже.
:::

Создайте следующие временные таблицы. В них хранятся наши регулярные выражения для парсинга устройств, браузеров и операционных систем.

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

Эти таблицы могут быть заполнены из следующих общедоступных файлов CSV, используя функцию таблицы url:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

С нашими заполненными временными таблицами мы можем загрузить наши словари регулярных выражений. Обратите внимание, что нам нужно указать значения ключей как колонки - это будут атрибуты, которые мы можем извлечь из user agent.

```sql
CREATE DICTIONARY regexp_os_dict
(
    regexp String,
    os_replacement String DEFAULT 'Other',
    os_v1_replacement String DEFAULT '0',
    os_v2_replacement String DEFAULT '0',
    os_v3_replacement String DEFAULT '0',
    os_v4_replacement String DEFAULT '0'
)
PRIMARY KEY regexp
SOURCE(CLICKHOUSE(TABLE 'regexp_os'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(REGEXP_TREE);

CREATE DICTIONARY regexp_device_dict
(
    regexp String,
    device_replacement String DEFAULT 'Other',
    brand_replacement String,
    model_replacement String
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_device'))
LIFETIME(0)
LAYOUT(REGEXP_TREE);

CREATE DICTIONARY regexp_browser_dict
(
    regexp String,
    family_replacement String DEFAULT 'Other',
    v1_replacement String DEFAULT '0',
    v2_replacement String DEFAULT '0'
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_browser'))
LIFETIME(0)
LAYOUT(REGEXP_TREE);
```

С загруженными этими словарями мы можем предоставить пример user-agent и протестировать наши новые возможности извлечения словаря:

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

Учитывая, что правила касательно user agents редко изменяются, словарь требуется обновлять только в ответ на новые браузеры, операционные системы и устройства, имеет смысл выполнять это извлечение во время вставки.

Мы можем выполнить эту работу с помощью материализованной колонки или с помощью материализованного представления. Ниже мы модифицируем материализованное представление, использованное ранее:

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

Это требует от нас модифицировать схему для целевой таблицы `otel_logs_v2`:

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
    `RemoteAddress` IPv4,
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

После перезапуска сборщика и вставки структурированных журналов, основанных на ранее задокументированных шагах, мы можем запрашивать наши недавно извлеченные колонки Device, Browser и Os.

```sql
SELECT Device, Browser, Os
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Device:  ('Spider','Spider','Desktop')
Browser: ('AhrefsBot','6','1')
Os:  	('Other','0','0','0')
```

:::note Кортежи для сложных структур
Обратите внимание на использование кортежей для этих колонок user agent. Кортежи рекомендуются для сложных структур, где иерархия известна заранее. Подколонки обеспечивают такую же производительность, как и обычные колонки (в отличие от ключей Map), позволяя использовать разнообразные типы данных.
:::
### Дополнительные материалы {#further-reading}

Для получения более подробных примеров и сведений о словарях мы рекомендуем следующее:

- [Расширенные темы словарей](/dictionary#advanced-dictionary-topics)
- ["Использование словарей для ускорения запросов"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Словари](/sql-reference/dictionaries)
## Ускорение запросов {#accelerating-queries}

ClickHouse поддерживает ряд техник для ускорения производительности запросов. Следующее следует учитывать только после выбора подходящего первичного/упорядочивающего ключа для оптимизации популярных паттернов доступа и максимизации компрессии. Это обычно будет иметь наибольшее влияние на производительность при наименьших усилиях.
### Использование материализованных представлений (инкрементальные) для агрегатов {#using-materialized-views-incremental-for-aggregations}

В предыдущих разделах мы исследовали использование материализованных представлений для преобразования и фильтрации данных. Однако, материализованные представления также можно использовать для предварительного вычисления агрегатов во время вставки и хранения результата. Этот результат можно обновлять результатами от последующих вставок, таким образом, эффективно позволяя предварительно вычислять агрегат во время вставки.

Основная идея здесь заключается в том, что результаты часто будут меньшим представлением оригинальных данных (частичной выборкой в случае агрегатов). Когда они объединяются с более простым запросом для чтения результатов из целевой таблицы, время выполнения запроса будет быстрее, чем если бы та же операция была выполнена на оригинальных данных.

Рассмотрим следующий запрос, где мы рассчитываем общий трафик по часам, используя наши структурированные журналы:

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

Мы можем представить, что это может быть распространенный линейный график, который пользователи построят с помощью Grafana. Этот запрос, безусловно, очень быстр - набор данных всего 10 млн строк, и ClickHouse быстр! Однако, если мы увеличим это до миллиардов и триллионов строк, мы бы хотели, чтобы это время выполнения запроса сохранялось.

:::note
Этот запрос будет в 10 раз быстрее, если мы будем использовать таблицу `otel_logs_v2`, которая является результатом нашего предыдущего материализованного представления, которое извлекает ключ размера из `LogAttributes`. Мы используем здесь необработанные данные только для иллюстрации и рекомендуем использовать предыдущее представление, если это распространенный запрос.
:::

Нам нужна таблица для получения результатов, если мы хотим выполнить это на этапе вставки, используя материализованное представление. Эта таблица должна хранить только 1 строку на час. Если обновление поступает для существующего часа, другие колонки должны быть объединены в существующую строку часа. Для этого слияния инкрементальных состояний необходимо хранить частичные состояния для других колонок.

Это требует специального типа движка в ClickHouse: SummingMergeTree. Это заменяет все строки с одинаковым упорядочивающим ключом на одну строку, содержащую сумму значений для числовых колонок. Следующая таблица объединит любые строки с одинаковой датой, суммируя любые числовые колонки.

```sql
CREATE TABLE bytes_per_hour
(
    `Hour` DateTime,
    `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Чтобы продемонстрировать наше материализованное представление, предположим, что наша таблица `bytes_per_hour` пуста и еще не получила никаких данных. Наше материализованное представление выполняет указанный выше `SELECT` на данных, вставленных в `otel_logs` (это будет выполняться по блокам заданного размера), с результатами, отправляемыми в `bytes_per_hour`. Синтаксис показан ниже:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

Клаузула `TO` здесь важна, указывая, куда будут отправлены результаты, т.е. `bytes_per_hour`.

Если мы перезапустим наш OTel Collector и снова отправим логи, таблица `bytes_per_hour` будет поэтапно заполняться результатом вышеизложенного запроса. После завершения мы можем подтвердить размер нашей таблицы `bytes_per_hour` - у нас должно быть 1 строка на час:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│ 	113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

Мы эффективно сократили количество строк здесь с 10 млн (в `otel_logs`) до 113, сохранив результат нашего запроса. Ключ здесь в том, что если новые логи будут вставлены в таблицу `otel_logs`, новые значения будут отправлены в `bytes_per_hour` для их соответствующего часа, где они будут автоматически объединены асинхронно в фоновом режиме - поскольку, сохраняя только одну строку на час, `bytes_per_hour` будет всегда как маленьким, так и актуальным.

Поскольку слияние строк происходит асинхронно, может быть больше одной строки на час, когда пользователь выполняет запрос. Чтобы убедиться, что все ожидающие строки объединены во время выполнения запроса, у нас есть два варианта:

- Используйте [`FINAL` модификатор](/sql-reference/statements/select/from#final-modifier) на имени таблицы (что мы сделали для запроса количества выше).
- Выполните агрегацию по упорядочивающему ключу, использованному в нашей конечной таблице, т.е. Timestamp, и суммируйте метрики.

Как правило, второй вариант более эффективен и гибок (таблица может использоваться для других целей), но первый может быть проще для некоторых запросов. Мы покажем оба ниже:

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
Эти экономии могут быть еще больше на более крупных наборах данных с более сложными запросами. Смотрите [здесь](https://github.com/ClickHouse/clickpy) для примеров.
:::
#### Более сложный пример {#a-more-complex-example}

Вышеуказанный пример агрегирует простое количество в час, используя [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Статистика, выходящая за рамки простых сумм, требует другого целевого механизма таблицы: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree).

Предположим, мы хотим вычислить количество уникальных IP-адресов (или уникальных пользователей) за день. Запрос для этого:

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │   	4763    │
…
│ 2019-01-22 00:00:00 │    	536     │
└─────────────────────┴─────────────┘

113 строк в наборе. Затрачено: 0.667 сек. Обработано 10.37 миллионов строк, 4.73 ГБ (15.53 миллиона строк/с., 7.09 ГБ/с.)
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

Чтобы ClickHouse знал, что агрегированные состояния будут храниться, мы определяем колонку `UniqueUsers` как тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction), указывая функцию источника частичных состояний (uniq) и тип исходного столбца (IPv4). Как и в случае с SummingMergeTree, строки с одинаковым значением ключа `ORDER BY` будут объединены (Hour в данном примере).

Связанное материализованное представление использует ранее указанный запрос:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
	uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

Обратите внимание, как мы добавляем суффикс `State` в конце наших агрегированных функций. Это гарантирует, что агрегированное состояние функции возвращается, а не конечный результат. Это будет содержать дополнительную информацию, позволяющую этому частичному состоянию объединяться с другими состояниями.

После того как данные будут повторно загружены, через перезапуск Collector, мы можем подтвердить наличие 113 строк в таблице `unique_visitors_per_hour`.

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│ 	113   │
└─────────┘

1 строка в наборе. Затрачено: 0.009 сек.
```

Наш конечный запрос должен использовать суффикс Merge для наших функций (так как столбцы хранят частичные агрегированные состояния):

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │   	 4763   │

│ 2019-01-22 00:00:00 │		 536    │
└─────────────────────┴─────────────┘

113 строк в наборе. Затрачено: 0.027 сек.
```

Обратите внимание, что мы используем `GROUP BY` здесь вместо использования `FINAL`.
### Использование материализованных представлений (инкрементальные) для быстрого поиска {#using-materialized-views-incremental--for-fast-lookups}

Пользователи должны учитывать свои модели доступа при выборе ключа сортировки ClickHouse с колонками, которые часто используются в фильтрах и агрегатных выражениях. Это может быть ограничительным в случае наблюдаемости, когда пользователи имеют более разнообразные модели доступа, которые нельзя охватить в одном наборе колонок. Это лучше всего иллюстрируется примером, встроенным в стандартные схемы OTel. Рассмотрим стандартную схему для трасс:

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

Эта схема оптимизирована для фильтрации по `ServiceName`, `SpanName` и `Timestamp`. В трассировке пользователям также необходима возможность делать запросы по конкретному `TraceId` и извлекать связанные спаны трассы. Хотя это присутствует в ключе сортировки, его расположение в конце означает, что [фильтрация не будет такой эффективной](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently), и, вероятно, потребуется сканировать значительное количество данных при извлечении одной трассы.

Сборщик OTel также устанавливает материализованное представление и связанную таблицу для решения этой проблемы. Таблица и представление показаны ниже:

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

Представление эффективно обеспечивает наличие в таблице `otel_traces_trace_id_ts` минимальной и максимальной метки времени для трассы. Эта таблица, отсортированная по `TraceId`, позволяет эффективно извлекать эти метки времени. Эти диапазоны меток времени могут, в свою очередь, использоваться при запросе основной таблицы `otel_traces`. Более конкретно, при извлечении трассы по ее идентификатору, Grafana использует следующий запрос:

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

CTE здесь определяет минимальную и максимальную метку времени для идентификатора трассы `ae9226c78d1d360601e6383928e4d22d`, прежде чем использовать это для фильтрации основной таблицы `otel_traces` для ее связанных спанов.

Этот же подход можно применять для аналогичных моделей доступа. Мы рассматриваем аналогичный пример в Моделировании данных [здесь](/materialized-view/incremental-materialized-view#lookup-table).
### Использование Проекций {#using-projections}

Проекции ClickHouse позволяют пользователям определять несколько клауз для `ORDER BY` для таблицы.

В предыдущих разделах мы рассматривали, как материализованные представления могут быть использованы в ClickHouse для предварительных вычислений агрегаций, трансформации строк и оптимизации запросов об Observability для различных моделей доступа. 

Мы предоставили пример, где материализованное представление отправляет строки в целевую таблицу с другим ключом сортировки, чем в оригинальной таблице, принимающей вставки, чтобы оптимизировать запросы по идентификатору трассы.

Проекции могут быть использованы для решения той же проблемы, позволяя пользователю оптимизировать запросы на столбец, не входящий в состав первичного ключа.

В теории, эта возможность может использоваться для предоставления нескольких ключей сортировки для таблицы, с одним определенным недостатком: дублированием данных. В частности, данные должны будут записываться в порядке основного первичного ключа, помимо порядка, указанного для каждой проекции. Это замедлит вставки и потребует больше дискового пространства.

:::note Проекции против материализованных представлений
Проекции предлагают многие из тех же возможностей, что и материализованные представления, но их следует использовать с осторожностью, часто предпочтительнее использовать последние. Пользователи должны понимать недостатки и когда они уместны. Например, хотя проекции можно использовать для предварительных вычислений агрегаций, мы рекомендуем пользователям использовать материализованные представления для этого.
:::

<img src={observability_13}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

Рассмотрим следующий запрос, который фильтрует нашу таблицу `otel_logs_v2` по кодам ошибки 500. Это, вероятно, распространенная модель доступа для логирования, когда пользователям нужно фильтровать по кодам ошибки:

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 строк в наборе. Затрачено: 0.177 сек. Обработано 10.37 миллионов строк, 685.32 МБ (58.66 миллионов строк/с., 3.88 ГБ/с.)
Пиковое использование памяти: 56.54 МиБ.
```

:::note Используйте Null для оценки производительности
Мы не выводим результаты здесь, используя `FORMAT Null`. Это заставляет все результаты считываться, но не возвращаться, избегая преждевременного завершения запроса из-за LIMIT. Это просто для демонстрации времени, затраченного на сканирование всех 10 миллионов строк.
:::

Вышеуказанный запрос требует линейного сканирования с нашим выбранным ключом сортировки `(ServiceName, Timestamp)`. Хотя мы могли бы добавить `Status` в конец ключа сортировки, улучшая производительность для вышеуказанного запроса, мы также можем добавить проекцию. 

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

Обратите внимание, что сначала мы должны создать проекцию, а затем ее материализовать. Эта последняя команда вызывает хранение данных дважды на диске в двух различных порядках. Проекция также может быть определена при создании данных, как показано ниже, и будет автоматически поддерживаться по мере вставки данных.

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

Важно, если проекция создается через `ALTER`, ее создание происходит асинхронно, когда выполняется команда `MATERIALIZE PROJECTION`. Пользователи могут подтвердить ход выполнения этой операции с помощью следующего запроса, ожидая `is_done=1`.

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│       	0 │   	1   │                	 │
└─────────────┴─────────┴────────────────────┘

1 строка в наборе. Затрачено: 0.008 сек.
```

Если мы повторим вышеуказанный запрос, мы можем увидеть, что производительность значительно улучшилась за счет дополнительного хранилища (см. ["Измерение размера таблицы и сжатия"](#measuring-table-size--compression) для того, как измерять это).

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 строк в наборе. Затрачено: 0.031 сек. Обработано 51.42 тысячи строк, 22.85 МБ (1.65 миллиона строк/с., 734.63 МБ/с.)
Пиковое использование памяти: 27.85 МиБ.
```

В приведенном примере мы указываем столбцы, используемые в ранее указанном запросе, в проекции. Это означает, что только эти указанные столбцы будут храниться на диске как часть проекции, отсортированной по Status. Если бы мы использовали `SELECT *` здесь, все столбцы были бы сохранены. Хотя это позволило бы больше запросов (с использованием любого подмножества столбцов) извлекать выгоду от проекции, потребуются дополнительные затраты на хранение. Для измерения дискового пространства и сжатия см. ["Измерение размера таблицы и сжатия"](#measuring-table-size--compression).
### Вторичные индексы/Индексы пропуска {#secondarydata-skipping-indices}

Независимо от того, насколько хорошо первичный ключ настроен в ClickHouse, некоторые запросы неизбежно потребуют полных сканирований таблицы. Хотя это можно смягчить с помощью материализованных представлений (и проекций для некоторых запросов), это требует дополнительного обслуживания, и пользователи должны быть информированы о их доступности, чтобы гарантировать, что они используются. В то время как традиционные реляционные базы данных решают эту проблему с помощью вторичных индексов, эти индексы неэффективны в колоночных базах данных, таких как ClickHouse. Вместо этого ClickHouse использует индексы "Пропуск", которые могут значительно улучшить производительность запросов, позволяя базе данных пропускать большие объемы данных, не имеющих подходящих значений.

Стандартные схемы OTel используют вторичные индексы в попытке ускорить доступ к доступу по картам. Хотя мы обнаружили, что они в целом неэффективны и не рекомендуем копировать их в вашу пользовательскую схему, индексы пропуска все же могут быть полезными.

Пользователи должны прочитать и понять [руководство по вторичным индексам](/optimize/skipping-indexes) перед тем, как пытаться применять их.

**В общем, они эффективны, когда существует сильная корреляция между первичным ключом и целевым нерелевантным столбцом/выражением, и пользователи ищут редкие значения, т.е. те, которые не встречаются во многих гранулах.**
### Фильтры Блума для текстового поиска {#bloom-filters-for-text-search}

Для запросов политики наблюдения вторичные индексы могут быть полезны, когда пользователи нуждаются в выполнении текстовых поисков. В частности, индексы блум на основе ngram и токенов [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) и [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) могут быть использованы для ускорения поиска по столбцам String с операторами `LIKE`, `IN` и hasToken. Важно отметить, что индекс на основе токенов генерирует токены, используя неалфавитные символы в качестве разделителя. Это означает, что на уровне запроса могут совпадать только токены (или целые слова). Для более детального соответствия можно использовать [фильтр N-грамм](/optimize/skipping-indexes#bloom-filter-types), который разбивает строки на n-граммы заданного размера, что позволяет искать соответствия по подсловам.

Чтобы оценить токены, которые будут производиться и, следовательно, соответствовать, можно использовать функцию `tokens`:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 строка в наборе. Затрачено: 0.008 сек.
```

Функция `ngram` предоставляет аналогичные возможности, где размер `ngram` может быть указан как второй параметр:

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 строка в наборе. Затрачено: 0.008 сек.
```

:::note Обратные индексы
ClickHouse также имеет экспериментальную поддержку обратных индексов в качестве вторичного индекса. Мы в настоящее время не рекомендуем их для наборов данных логирования, но ожидаем, что они заменят токенизированные фильтры Блума, когда они будут готовы к производству.
:::

В рамках этого примера мы используем структурированный набор данных логов. Предположим, мы хотим сосчитать логи, в которых столбец `Referer` содержит `ultra`.

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 строка в наборе. Затрачено: 0.177 сек. Обработано 10.37 миллионов строк, 908.49 МБ (58.57 миллионов строк/с., 5.13 ГБ/с.)
```

Здесь нам нужно совмещать по размеру ngram 3. Поэтому мы создаем индекс `ngrambf_v1`. 

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

Индекс `ngrambf_v1(3, 10000, 3, 7)` принимает четыре параметра. Последний из них (значение 7) представляет собой число случайных генераторов. Другие представляют размер ngram (3), значение `m` (размер фильтра) и количество хэш-функций `k` (7). Значения `k` и `m` требуют настройки и будут основаны на количестве уникальных ngrams/токенов и вероятности того, что фильтр дает ложный отрицательный результат - тем самым подтверждая, что значение отсутствует в грауле. Мы рекомендуем [эти функции](/engines/table-engines/mergetree-family/mergetree#bloom-filter) для помощи в установлении этих значений.

Если правильно настроены, ускорение здесь может быть значительным:

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│ 	182   │
└─────────┘

1 строка в наборе. Затрачено: 0.077 сек. Обработано 4.22 миллиона строк, 375.29 МБ (54.81 миллиона строк/с., 4.87 ГБ/с.)
Пиковое использование памяти: 129.60 КиБ.
```

:::note Пример только
Вышеуказанное представлено только в иллюстративных целях. Мы рекомендуем пользователям извлекать структуру из своих логов при вставке, а не пытаться оптимизировать текстовые поиски, используя токенизированные фильтры Блума. Тем не менее, существуют случаи, когда у пользователей есть стеки трасс и другие большие строки, для которых текстовый поиск может быть полезен из-за менее детерминированной структуры.
:::

Некоторые общие рекомендации по использованию фильтров Блума:

Цель фильтра состоит в том, чтобы фильтровать [гранулы](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design), таким образом избегая необходимости загружать все значения для столбца и выполнять линейное сканирование. Клауз `EXPLAIN`, с параметром `indexes=1`, может использоваться для определения количества гранул, которые были пропущены. Рассмотрим следующие ответы для оригинальной таблицы `otel_logs_v2` и таблицы `otel_logs_bloom` с фильтром ngram.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                      	 │
│   Aggregating                                                  	 │
│ 	Expression (Before GROUP BY)                               	     │
│   	Filter ((WHERE + Change column names to column identifiers)) │
│     	ReadFromMergeTree (default.otel_logs_v2)               	     │
│     	Indexes:                                               	     │
│       	PrimaryKey                                           	 │
│         	Condition: true                                    	     │
│         	Parts: 9/9                                         	     │
│         	Granules: 1278/1278                                	     │
└────────────────────────────────────────────────────────────────────┘

10 строк в наборе. Затрачено: 0.016 сек.


EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                      	 │
│   Aggregating                                                  	 │
│ 	Expression (Before GROUP BY)                               	     │
│   	Filter ((WHERE + Change column names to column identifiers)) │
│     	ReadFromMergeTree (default.otel_logs_bloom)            	     │
│     	Indexes:                                               	     │
│       	PrimaryKey                                           	 │ 
│         	Condition: true                                    	     │
│         	Parts: 8/8                                         	     │
│         	Granules: 1276/1276                                 	 │
│       	Skip                                                 	 │
│         	Name: idx_span_attr_value                          	     │
│         	Description: ngrambf_v1 GRANULARITY 1              	     │
│         	Parts: 8/8                                         	     │
│         	Granules: 517/1276                                 	     │
└────────────────────────────────────────────────────────────────────┘
```

Фильтр Блума обычно будет быстрее только в том случае, если он меньше самого столбца. Если он больше, то преимуществ в производительности, вероятно, не будет. Сравните размер фильтра с размером столбца с помощью следующих запросов:

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
│ Referer │ 56.16 MiB   	│ 789.21 MiB    	│ 14.05 │
└─────────┴─────────────────┴───────────────────┴───────┘

1 строка в наборе. Затрачено: 0.018 сек.


SELECT
	`table`,
	formatReadableSize(data_compressed_bytes) AS compressed_size,
	formatReadableSize(data_uncompressed_bytes) AS uncompressed_size
FROM system.data_skipping_indices
WHERE `table` = 'otel_logs_bloom'

┌─table───────────┬─compressed_size─┬─uncompressed_size─┐
│ otel_logs_bloom │ 12.03 MiB   	│ 12.17 MiB     	│
└─────────────────┴─────────────────┴───────────────────┘

1 строка в наборе. Затрачено: 0.004 сек.
```

В приведенных примерах мы можем увидеть, что вторичный индекс фильтра Блума составляет 12 МБ - почти в 5 раз меньше сжатого размера столбца, который составляет 56 МБ.

Фильтры Блума могут требовать значительной настройки. Мы рекомендуем следовать заметкам [здесь](/engines/table-engines/mergetree-family/mergetree#bloom-filter), которые могут быть полезны для определения оптимальных настроек. Фильтры Блума также могут быть дорогими при вставке и времени слияния. Пользователи должны оценить влияние на производительность вставки перед добавлением фильтров Блума в производство.

Дополнительные сведения о вторичных индексах пропуска можно найти [здесь](/optimize/skipping-indexes#skip-index-functions).
### Извлечение из карт {#extracting-from-maps}

Тип Map широко распространен в схемах OTel. Этот тип требует, чтобы значения и ключи имели один и тот же тип - что достаточно для метаданных, таких как метки Kubernetes. Имейте в виду, что при запросе подключающего ключа типа Map загружается весь родительский столбец. Если карта имеет много ключей, это может повлечь значительные затраты на запрос, поскольку с диска будет прочитано больше данных, чем если бы ключ существовал в качестве столбца.

Если вы часто запрашиваете конкретный ключ, рассмотрите возможность перемещения его в собственный выделенный столбец на корневом уровне. Обычно это задача, которая происходит в ответ на обычные модели доступа и после развертывания и может быть трудно предсказать до производства. См. ["Управление изменениями схемы"](/observability/managing-data#managing-schema-changes) для того, как изменить вашу схему после развертывания.
## Измерение размера таблицы и сжатия {#measuring-table-size--compression}

Одной из основных причин, по которой ClickHouse используется для наблюдаемости, является сжатие.

Помимо значительного сокращения затрат на хранение, меньше данных на диске означает меньше операций ввода-вывода и более быстрые запросы и вставки. Снижение количества операций ввода-вывода перевесит накладные расходы любого алгоритма сжатия по отношению к ЦП. Улучшение сжатия данных должно, следовательно, быть первым приоритетом при работе над тем, чтобы запросы ClickHouse были быстрыми.

Сведения о том, как измерять сжатие, можно найти [здесь](/data-compression/compression-in-clickhouse).
