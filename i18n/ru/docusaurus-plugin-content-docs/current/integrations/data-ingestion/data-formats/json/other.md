---
'title': 'Другие подходы к JSON'
'slug': '/integrations/data-formats/json/other-approaches'
'description': 'Другие подходы к моделированию JSON'
'keywords':
- 'json'
- 'formats'
'doc_type': 'reference'
---


# Другие подходы к моделированию JSON

**Ниже представлены альтернативы моделированию JSON в ClickHouse. Эти методы документированы для полноты информации и были актуальны до разработки типа JSON, и поэтому, как правило, не рекомендуется использовать их в большинстве случаев.**

:::note Примените подход на уровне объекта
Для различных объектов в одной схеме могут использоваться различные техники. Например, некоторые объекты лучше всего решаются с помощью типа `String`, а другие — с помощью типа `Map`. Обратите внимание, что как только используется тип `String`, дальнейшие решения о схеме не требуются. Напротив, в `Map` можно вложить под-объекты — в том числе строку, представляющую JSON, как мы показываем ниже:
:::

## Использование типа String {#using-string}

Если объекты высоко динамичны, не имеют предсказуемой структуры и содержат произвольные вложенные объекты, пользователи должны использовать тип `String`. Значения могут быть извлечены во время запроса с использованием функций JSON, как мы показываем ниже.

Обработка данных с использованием структурированного подхода, описанного выше, часто не является целесообразной для тех пользователей, у кого динамический JSON, который подвержен изменениям или для которого схема не хорошо понятна. Для абсолютной гибкости пользователи могут просто хранить JSON в виде `String`, прежде чем использовать функции для извлечения полей по мере необходимости. Это представляет собой крайнюю противоположность обработке JSON как структурированного объекта. Эта гибкость влечет за собой затраты с существенными недостатками — прежде всего увеличение сложности синтаксиса запросов, а также ухудшение производительности.

Как уже упоминалось ранее, для [оригинального объекта person](/integrations/data-formats/json/schema#static-vs-dynamic-json) мы не можем гарантировать структуру колонки `tags`. Мы вставляем оригинальную строку (включая `company.labels`, которую мы игнорируем на данный момент), объявляя колонку `Tags` как `String`:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.
1 row in set. Elapsed: 0.002 sec.
```

Мы можем выбрать колонку `tags` и увидеть, что JSON был вставлен как строка:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Функции [`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) могут быть использованы для извлечения значений из этого JSON. Рассмотрим простой пример ниже:

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, что функции требуют как ссылку на колонку `String` `tags`, так и путь в JSON для извлечения. Вложенные пути требуют вложения функций, например, `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`, который извлекает колонку `tags.car.year`. Извлечение вложенных путей может быть упрощено с помощью функций [`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY) и [`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE).

Рассмотрим крайний случай с набором данных `arxiv`, где мы рассматриваем все содержимое как `String`.

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

Чтобы вставить в эту схему, нам нужно использовать формат `JSONAsString`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

Предположим, мы хотим подсчитать количество опубликованных статей по годам. Сравните следующий запрос, использующий только строку, с [структурированной версией](/integrations/data-formats/json/inference#creating-tables) схемы:

```sql
-- using structured schema
SELECT
    toYear(parseDateTimeBestEffort(versions.created[1])) AS published_year,
    count() AS c
FROM arxiv_v2
GROUP BY published_year
ORDER BY c ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.264 sec. Processed 2.31 million rows, 153.57 MB (8.75 million rows/s., 582.58 MB/s.)

-- using unstructured String

SELECT
    toYear(parseDateTimeBestEffort(JSON_VALUE(body, '$.versions[0].created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 1.281 sec. Processed 2.49 million rows, 4.22 GB (1.94 million rows/s., 3.29 GB/s.)
Peak memory usage: 205.98 MiB.
```

Обратите внимание на использование выражения XPath здесь для фильтрации JSON по методу, т.е. `JSON_VALUE(body, '$.versions[0].created')`.

Строковые функции заметно медленнее (> 10x), чем явные преобразования типов с индексами. Вышеуказанные запросы всегда требуют полного сканирования таблицы и обработки каждой строки. Хотя эти запросы будут по-прежнему быстры на небольшом наборе данных, таком как этот, производительность ухудшится на больших наборах данных.

Гибкость этого подхода сопряжена с очевидными затратами на производительность и сложностью синтаксиса, и его следует использовать только для высоко динамичных объектов в схеме.

### Простые функции JSON {#simple-json-functions}

Приведенные выше примеры используют семью функций JSON*. Эти функции используют полный парсер JSON, основанный на [simdjson](https://github.com/simdjson/simdjson), который строго выполняет разбор и сможет различать одно и то же поле, вложенное на разных уровнях. Эти функции способны обрабатывать JSON, который синтаксически корректен, но не хорошо отформатирован, например, двойные пробелы между ключами.

Доступен более быстрый и строгий набор функций. Эти функции `simpleJSON*` предлагают потенциально более высокую производительность, главным образом, делая строгие предположения относительно структуры и формата JSON. В частности:

- Имена полей должны быть константами
- Последовательное кодирование имен полей, например, `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, но `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- Имена полей уникальны во всех вложенных структурах. Не проводится различия между уровнями вложенности, и совпадение происходит indiscriminately. В случае нескольких совпадающих полей используется первое вхождение.
- Никаких специальных символов вне строковых литералов. Это включает пробелы. Следующее является недопустимым и не будет разобрано.

```json
{"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
"path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
```

В то время как следующее будет разобрано корректно:

```json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}

In some circumstances, where performance is critical and your JSON meets the above requirements, these may be appropriate. An example of the earlier query, re-written to use `simpleJSON*` functions, is shown below:

```sql
SELECT
    toYear(parseDateTimeBestEffort(simpleJSONExtractString(simpleJSONExtractRaw(body, 'versions'), 'created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.964 sec. Processed 2.48 million rows, 4.21 GB (2.58 million rows/s., 4.36 GB/s.)
Peak memory usage: 211.49 MiB.
```

Вышеуказанный запрос использует `simpleJSONExtractString` для извлечения ключа `created`, используя тот факт, что мы хотим только первое значение для даты публикации. В этом случае ограничения функций `simpleJSON*` приемлемы для получения прибыли в производительности.

## Использование типа Map {#using-map}

Если объект используется для хранения произвольных ключей, в основном одного типа, рассмотрите использование типа `Map`. В идеале количество уникальных ключей не должно превышать нескольких сотен. Тип `Map` также может быть рассмотрен для объектов с под-объектами, при условии, что последние имеют однородность в своих типах. Как правило, мы рекомендуем использовать тип `Map` для меток и тегов, например, меток пода Kubernetes в данных логов.

Хотя `Map` предоставляет простой способ представления вложенных структур, у них есть некоторые заметные ограничения:

- Все поля должны быть одного типа.
- Доступ к под-колонкам требует специального синтаксиса карты, поскольку поля не существуют как колонки. Весь объект _является_ колонкой.
- Доступ к подколонке загружает все значение `Map`, т.е. все родственные элементы и их соответствующие значения. Для больших карт это может привести к значительному штрафу по производительности.

:::note Строковые ключи
При моделировании объектов как `Map`s используется строковой ключ для хранения имени ключа JSON. Следовательно, карта всегда будет `Map(String, T)`, где `T` зависит от данных.
:::

#### Примитивные значения {#primitive-values}

Самое простое применение `Map` — это когда объект содержит одни и те же примитивные типы в качестве значений. В большинстве случаев это происходит с использованием типа `String` для значения `T`.

Рассмотрим наш [ранее упомянутый JSON person](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определен как динамический. Важно, что мы ожидаем, что в этот объект будут добавлены лишь пары ключ-значение типа String. Таким образом, мы можем объявить его как `Map(String, String)`:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String, labels Map(String,String)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

Мы можем вставить наш оригинальный полный JSON объект:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Запрос этих полей внутри объекта запроса требует синтаксиса карты, например:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Полный набор функций `Map` доступен для выполнения запросов, описанных [здесь](/sql-reference/functions/tuple-map-functions.md). Если ваши данные не одного типа, существуют функции для выполнения [необходимого приведения типов](/sql-reference/functions/type-conversion-functions).

#### Объектные значения {#object-values}

Тип `Map` также можно использовать для объектов, которые имеют под-объекты, если последние имеют однородность в своих типах.

Предположим, что ключ `tags` для нашего объекта `persons` требует согласованной структуры, где под-объект для каждого `tag` имеет колонки `name` и `time`. Упрощенный пример такого JSON-документа может выглядеть следующим образом:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": {
    "hobby": {
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    "car": {
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  }
}
```

Это можно смоделировать с помощью `Map(String, Tuple(name String, time DateTime))`, как показано ниже:

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `tags` Map(String, Tuple(name String, time DateTime))
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","tags":{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"},"car":{"name":"Tesla","time":"2024-07-11 15:18:23"}}}

Ok.

1 row in set. Elapsed: 0.002 sec.

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 row in set. Elapsed: 0.001 sec.
```

Применение карт в этом случае обычно редкое и предполагает, что данные следует переконструировать так, чтобы динамические имена ключей не имели под-объектов. Например, вышеуказанное может быть переустроено следующим образом, что позволит использовать `Array(Tuple(key String, name String, time DateTime))`.

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": [
    {
      "key": "hobby",
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    {
      "key": "car",
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  ]
}
```

## Использование типа Nested {#using-nested}

[Тип Nested](/sql-reference/data-types/nested-data-structures/nested) может быть использован для моделирования статических объектов, которые редко подвержены изменениям, предлагая альтернативу `Tuple` и `Array(Tuple)`. Мы обычно рекомендуем избегать использования этого типа для JSON, так как его поведение часто вызывать путаницу. Основное преимущество `Nested` заключается в том, что под-колонки могут использоваться в ключах сортировки.

Ниже мы приводим пример использования типа Nested для моделирования статического объекта. Рассмотрим следующую простую запись лога в JSON:

```json
{
  "timestamp": 897819077,
  "clientip": "45.212.12.0",
  "request": {
    "method": "GET",
    "path": "/french/images/hm_nav_bar.gif",
    "version": "HTTP/1.0"
  },
  "status": 200,
  "size": 3305
}
```

Мы можем объявить ключ `request` как `Nested`. Подобно `Tuple`, нам требуется указать подколонки.

```sql
-- default
SET flatten_nested=1
CREATE table http
(
   timestamp Int32,
   clientip     IPv4,
   request Nested(method LowCardinality(String), path String, version LowCardinality(String)),
   status       UInt16,
   size         UInt32,
) ENGINE = MergeTree() ORDER BY (status, timestamp);
```

### flatten_nested {#flatten_nested}

Настройка `flatten_nested` контролирует поведение вложенных.

#### flatten_nested=1 {#flatten_nested1}

Значение `1` (по умолчанию) не поддерживает произвольный уровень вложенности. При этом значении проще всего рассматривать вложенную структуру данных как несколько колонок [Array](/sql-reference/data-types/array) одной и той же длины. Параметры `method`, `path` и `version` по сути являются отдельными колонками `Array(Type)` с одним критическим ограничением: **длина полей `method`, `path` и `version` должна быть одинаковой.** Если мы используем `SHOW CREATE TABLE`, это будет проиллюстрировано:

```sql
SHOW CREATE TABLE http

CREATE TABLE http
(
    `timestamp` Int32,
    `clientip` IPv4,
    `request.method` Array(LowCardinality(String)),
    `request.path` Array(String),
    `request.version` Array(LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, timestamp)
```

Ниже мы вставляем в эту таблицу:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

Несколько важных моментов, которые следует отметить здесь:

* Нам необходимо использовать настройку `input_format_import_nested_json`, чтобы вставить JSON как вложенную структуру. Без этого нам нужно будет развернуть JSON, т.е.

```sql
INSERT INTO http FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
```
* Вложенные поля `method`, `path` и `version` необходимо передавать как JSON массивы, т.е.

```json
{
  "@timestamp": 897819077,
  "clientip": "45.212.12.0",
  "request": {
    "method": [
      "GET"
    ],
    "path": [
      "/french/images/hm_nav_bar.gif"
    ],
    "version": [
      "HTTP/1.0"
    ]
  },
  "status": 200,
  "size": 3305
}
```

Колонки можно запрашивать с использованием точечной нотации:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, что использование `Array` для под-колонок означает, что можно потенциально использовать полный набор [функций Array](/sql-reference/functions/array-functions), включая конструкцию [`ARRAY JOIN`](/sql-reference/statements/select/array-join) — полезную, если ваши колонки имеют несколько значений.

#### flatten_nested=0 {#flatten_nested0}

Это позволяет произвольный уровень вложенности и означает, что вложенные колонки остаются в виде одного массива `Tuple` — по сути, они становятся теми же, что и `Array(Tuple)`.

**Это представляет собой предпочтительный способ, и часто самый простой способ, использовать JSON с `Nested`. Как мы показываем ниже, это требует только, чтобы все объекты были списком.**

Ниже мы вновь создаем нашу таблицу и вставляем строку:

```sql
CREATE TABLE http
(
    `timestamp` Int32,
    `clientip` IPv4,
    `request` Nested(method LowCardinality(String), path String, version LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, timestamp)

SHOW CREATE TABLE http

-- note Nested type is preserved.
CREATE TABLE default.http
(
    `timestamp` Int32,
    `clientip` IPv4,
    `request` Nested(method LowCardinality(String), path String, version LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, timestamp)

INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

Несколько важных моментов, которые следует отметить здесь:

* `input_format_import_nested_json` не требуется для вставки.
* Тип `Nested` сохраняется в `SHOW CREATE TABLE`. Под этой колонкой фактически находится `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
* В результате нам необходимо вставить `request` в виде массива, т.е.

```json
{
  "timestamp": 897819077,
  "clientip": "45.212.12.0",
  "request": [
    {
      "method": "GET",
      "path": "/french/images/hm_nav_bar.gif",
      "version": "HTTP/1.0"
    }
  ],
  "status": 200,
  "size": 3305
}
```

Колонки снова можно запрашивать с использованием точечной нотации:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### Пример {#example}

Более крупный пример вышеуказанных данных доступен в публичной корзине в s3 по адресу: `s3://datasets-documentation/http/`.

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONEachRow')
LIMIT 1
FORMAT PrettyJSONEachRow

{
    "@timestamp": "893964617",
    "clientip": "40.135.0.0",
    "request": {
        "method": "GET",
        "path": "\/images\/hm_bg.jpg",
        "version": "HTTP\/1.0"
    },
    "status": "200",
    "size": "24736"
}

1 row in set. Elapsed: 0.312 sec.
```

Учитывая ограничения и формат ввода для JSON, мы вставляем этот образец данных, используя следующий запрос. Здесь мы устанавливаем `flatten_nested=0`.

Следующее выражение вставляет 10 миллионов строк, поэтому это может занять несколько минут для выполнения. При необходимости используйте `LIMIT`:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

Запрос этих данных требует от нас доступа к полям запроса как к массивам. Ниже мы подводим итоги по ошибкам и методам http за фиксированный период времени.

```sql
SELECT status, request.method[1] AS method, count() AS c
FROM http
WHERE status >= 400
  AND toDateTime(timestamp) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP BY method, status
ORDER BY c DESC LIMIT 5;

┌─status─┬─method─┬─────c─┐
│    404 │ GET    │ 11267 │
│    404 │ HEAD   │   276 │
│    500 │ GET    │   160 │
│    500 │ POST   │   115 │
│    400 │ GET    │    81 │
└────────┴────────┴───────┘

5 rows in set. Elapsed: 0.007 sec.
```

### Использование парных массивов {#using-pairwise-arrays}

Парные массивы обеспечивают баланс между гибкостью представлять JSON как строки и производительностью более структурированного подхода. Схема гибкая в том, что любые новые поля могут быть потенциально добавлены в корень. Однако это требует значительно более сложного синтаксиса запросов и не совместимо с вложенными структурами.

В качестве примера рассмотрим следующую таблицу:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

Чтобы вставить в эту таблицу, нам необходимо структурировать JSON как список ключей и значений. Следующий запрос иллюстрирует использование `JSONExtractKeysAndValues` для достижения этой цели:

```sql
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')
LIMIT 1
FORMAT Vertical

Row 1:
──────
keys:   ['@timestamp','clientip','request','status','size']
values: ['893964617','40.135.0.0','{"method":"GET","path":"/images/hm_bg.jpg","version":"HTTP/1.0"}','200','24736']

1 row in set. Elapsed: 0.416 sec.
```

Обратите внимание, что колонка запроса остается вложенной структурой, представленной как строка. Мы можем вставлять любые новые ключи в корень. Мы также можем иметь произвольные различия в самом JSON. Чтобы вставить в нашу локальную таблицу, выполните следующее:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

Запрос этой структуры требует использования функции [`indexOf`](/sql-reference/functions/array-functions#indexOf) для определения индекса необходимого ключа (который должен соответствовать порядку значений). Это можно использовать для доступа к массиву значений колонки, т.е. `values[indexOf(keys, 'status')]`. Нам по-прежнему требуется метод разбора JSON для колонки запроса — в этом случае `simpleJSONExtractString`.

```sql
SELECT toUInt16(values[indexOf(keys, 'status')])                           AS status,
       simpleJSONExtractString(values[indexOf(keys, 'request')], 'method') AS method,
       count()                                                             AS c
FROM http_with_arrays
WHERE status >= 400
  AND toDateTime(values[indexOf(keys, '@timestamp')]) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP BY method, status ORDER BY c DESC LIMIT 5;

┌─status─┬─method─┬─────c─┐
│    404 │ GET    │ 11267 │
│    404 │ HEAD   │   276 │
│    500 │ GET    │   160 │
│    500 │ POST   │   115 │
│    400 │ GET    │    81 │
└────────┴────────┴───────┘

5 rows in set. Elapsed: 0.383 sec. Processed 8.22 million rows, 1.97 GB (21.45 million rows/s., 5.15 GB/s.)
Peak memory usage: 51.35 MiB.
```
