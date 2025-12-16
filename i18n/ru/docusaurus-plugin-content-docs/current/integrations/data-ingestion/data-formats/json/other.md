---
title: 'Другие подходы к работе с JSON'
slug: /integrations/data-formats/json/other-approaches
description: 'Другие подходы к моделированию JSON'
keywords: ['json', 'formats']
doc_type: 'reference'
---

# Другие подходы к моделированию JSON {#other-approaches-to-modeling-json}

**Ниже приведены альтернативные подходы к моделированию JSON в ClickHouse. Они приведены для полноты и использовались до появления типа JSON, поэтому, как правило, не рекомендуются и не применяются в большинстве сценариев.**

:::note Применяйте подход на уровне объектов
К разным объектам в одной и той же схеме можно применять разные техники. Например, для одних объектов лучше всего подойдет тип `String`, а для других — тип `Map`. Обратите внимание, что после выбора типа `String` больше не требуется принимать какие-либо решения о схеме. Напротив, в ключ `Map` можно вложить подчиненные объекты, включая `String`, представляющую JSON, как показано ниже:
:::

## Использование типа String {#using-string}

Если объекты очень динамичны, не имеют предсказуемой структуры и содержат произвольные вложенные объекты, следует использовать тип `String`. Значения можно извлекать во время выполнения запроса с помощью JSON‑функций, как показано ниже.

Обработка данных с использованием описанного выше структурированного подхода часто неприменима для пользователей, работающих с динамическим JSON, который либо подвержен изменениям, либо чья схема плохо известна. Для максимальной гибкости пользователи могут просто хранить JSON как `String` и затем использовать функции для извлечения требуемых полей. Это представляет собой полную противоположность обработке JSON как структурированного объекта. Такая гибкость имеет свою цену и приводит к существенным недостаткам — в первую очередь к увеличению сложности синтаксиса запросов, а также к ухудшению производительности.

Как отмечалось ранее, для [исходного объекта person](/integrations/data-formats/json/schema#static-vs-dynamic-json) мы не можем гарантировать структуру столбца `tags`. Мы вставляем исходную строку (включая `company.labels`, который пока игнорируем), объявляя столбец `Tags` как `String`:

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

Мы можем выбрать столбец `tags` и увидеть, что JSON был вставлен в виде строки:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

С помощью функций [`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) можно извлекать значения из этого JSON-документа. Рассмотрим простой пример ниже:

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, что функциям требуется как ссылка на столбец типа `String` `tags`, так и путь в JSON для извлечения. Вложенные пути требуют вложенного вызова функций, например `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`, который извлекает столбец `tags.car.year`. Извлечение вложенных путей можно упростить с помощью функций [`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY) и [`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE).

Рассмотрим крайний случай с датасетом `arxiv`, где мы рассматриваем всё тело как значение типа `String`.

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

Чтобы вставить данные в эту схему, нужно использовать формат `JSONAsString`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

Предположим, мы хотим посчитать количество статей, выпущенных по годам. Сравним следующий запрос, использующий только строковое поле, с [структурированной версией](/integrations/data-formats/json/inference#creating-tables) схемы:

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

Обратите внимание на использование XPath-выражения для фильтрации JSON по методу, т.е. `JSON_VALUE(body, '$.versions[0].created')`.

Строковые функции заметно медленнее (&gt; 10x), чем явные преобразования типов с использованием индексов. Приведённым выше запросам всегда требуется полное сканирование таблицы и обработка каждой строки. Хотя такие запросы всё ещё будут быстрыми на небольших наборах данных, как в этом примере, по мере роста объёма данных производительность будет ухудшаться.

Гибкость такого подхода имеет очевидную цену в виде потерь производительности и усложнения синтаксиса, поэтому его следует использовать только для высокодинамичных объектов в схеме.

### Простые JSON-функции {#simple-json-functions}

Выше приведены примеры использования семейства функций JSON*. Они используют полноценный JSON-парсер на базе [simdjson](https://github.com/simdjson/simdjson), который строго относится к разбору и различает одноимённые поля на разных уровнях вложенности. Эти функции способны корректно обрабатывать синтаксически правильный, но плохо отформатированный JSON, например с двойными пробелами между ключами.

Доступен более быстрый и строгий набор функций. Эти функции `simpleJSON*` потенциально обеспечивают лучшую производительность, в первую очередь за счёт жёстких предположений о структуре и формате JSON. В частности:

* Имена полей должны быть константами
* Должна использоваться единообразная кодировка имён полей, например, `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, но `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
* Имена полей должны быть уникальными во всех вложенных структурах. Уровни вложенности не различаются, сопоставление выполняется без учёта уровня вложенности. В случае нескольких совпадающих полей используется первое вхождение.
* Вне строковых литералов не допускаются специальные символы. Это относится и к пробелам. Следующий пример является некорректным и не будет разобран:

  ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

В то время как следующий пример будет успешно разобран:

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

Получено 10 строк. Затрачено: 0.964 сек. Обработано 2.48 млн строк, 4.21 ГБ (2.58 млн строк/сек., 4.36 ГБ/сек.)
Пиковое использование памяти: 211.49 МиБ.
```

The above query uses the `simpleJSONExtractString` to extract the `created` key, exploiting the fact we want the first value only for the published date. In this case, the limitations of the `simpleJSON*` functions are acceptable for the gain in performance.

## Using the Map type {#using-map}

If the object is used to store arbitrary keys, mostly of one type, consider using the `Map` type. Ideally, the number of unique keys should not exceed several hundred. The `Map` type can also be considered for objects with sub-objects, provided the latter have uniformity in their types. Generally, we recommend the `Map` type be used for labels and tags, e.g. Kubernetes pod labels in log data.

Although `Map`s give a simple way to represent nested structures, they have some notable limitations:

- The fields must all be of the same type.
- Accessing sub-columns requires a special map syntax since the fields don't exist as columns. The entire object _is_ a column.
- Accessing a subcolumn loads the entire `Map` value i.e. all siblings and their respective values. For larger maps, this can result in a significant performance penalty.

:::note String keys
When modelling objects as `Map`s, a `String` key is used to store the JSON key name. The map will therefore always be `Map(String, T)`, where `T` depends on the data.
:::

#### Primitive values {#primitive-values}

The simplest application of a `Map` is when the object contains the same primitive type as values. In most cases, this involves using the `String` type for the value `T`.

Consider our [earlier person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json) where the `company.labels` object was determined to be dynamic. Importantly, we only expect key-value pairs of type String to be added to this object. We can thus declare this as `Map(String, String)`:

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

We can insert our original complete JSON object:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ок.

Обработана 1 строка. Прошло: 0.002 сек.
```

Querying these fields within the request object requires a map syntax e.g.:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'системы баз данных','founded':'2021'} │
└──────────────────────────────────────────────┘

1 строка в наборе. Прошло: 0,001 сек.

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ системы баз данных │
└──────────────────┘

1 строка в наборе. Прошло: 0,001 сек.
```

A full set of `Map` functions is available to query this time, described [here](/sql-reference/functions/tuple-map-functions.md). If your data is not of a consistent type, functions exist to perform the [necessary type coercion](/sql-reference/functions/type-conversion-functions).

#### Object values {#object-values}

The `Map` type can also be considered for objects which have sub-objects, provided the latter have consistency in their types.

Suppose the `tags` key for our `persons` object requires a consistent structure, where the sub-object for each `tag` has a `name` and `time` column. A simplified example of such a JSON document might look like the following:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": {
    "hobby": {
      "name": "Дайвинг",
      "time": "2024-07-11 14:18:01"
    },
    "car": {
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  }
}
```

This can be modelled with a `Map(String, Tuple(name String, time DateTime))` as shown below:

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

Получена 1 строка. Прошло: 0.002 сек.

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

Получена 1 строка. Прошло: 0.001 сек.
```

The application of maps in this case is typically rare, and suggests that the data should be remodelled such that dynamic key names do not have sub-objects. For example, the above could be remodelled as follows allowing the use of `Array(Tuple(key String, name String, time DateTime))`.

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": [
    {
      "key": "hobby",
      "name": "Дайвинг",
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

## Using the Nested type {#using-nested}

The [Nested type](/sql-reference/data-types/nested-data-structures/nested) can be used to model static objects which are rarely subject to change, offering an alternative to `Tuple` and `Array(Tuple)`. We generally recommend avoiding using this type for JSON as its behavior is often confusing. The primary benefit of `Nested` is that sub-columns can be used in ordering keys.

Below, we provide an example of using the Nested type to model a static object. Consider the following simple log entry in JSON:

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

We can declare the `request` key as `Nested`. Similar to `Tuple`, we are required to specify the sub columns.

```sql
-- по умолчанию
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

The setting `flatten_nested` controls the behavior of nested.

#### flatten_nested=1 {#flatten_nested1}

A value of `1` (the default) does not support an arbitrary level of nesting. With this value, it is easiest to think of a nested data structure as multiple  [Array](/sql-reference/data-types/array) columns of the same length. The fields `method`, `path`, and `version` are all separate `Array(Type)` columns in effect with one critical constraint: **the length of the `method`, `path`, and `version` fields must be the same.** If we use `SHOW CREATE TABLE`, this is illustrated:

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

Below, we insert into this table:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

A few important points to note here:

* We need to use the setting `input_format_import_nested_json` to insert the JSON as a nested structure. Without this, we are required to flatten the JSON i.e.

    ```sql
  INSERT INTO http FORMAT JSONEachRow
  {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
  ```
* The nested fields `method`, `path`, and `version` need to be passed as JSON arrays i.e.

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
        "HTTP/1.0"]
      ]
    },
    "status": 200,
    "size": 3305
  }
  ```

Columns can be queried using a dot notation:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
Получена 1 строка. Время выполнения: 0.002 сек.
```

Note the use of `Array` for the sub-columns means the full breath [Array functions](/sql-reference/functions/array-functions) can potentially be exploited, including the [`ARRAY JOIN`](/sql-reference/statements/select/array-join) clause - useful if your columns have multiple values.

#### flatten_nested=0 {#flatten_nested0}

This allows an arbitrary level of nesting and means nested columns stay as a single array of `Tuple`s - effectively they become the same as `Array(Tuple)`.

**This represents the preferred way, and often the simplest way, to use JSON with `Nested`. As we show below, it only requires all objects to be a list.**

Below, we re-create our table and re-insert a row:

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

-- обратите внимание, что тип Nested сохранён.
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

A few important points to note here:

* `input_format_import_nested_json` is not required to insert.
* The `Nested` type is preserved in `SHOW CREATE TABLE`. Underneath this column is effectively a `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
* As a result, we are required to insert `request` as an array i.e.

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

Columns can again be queried using a dot notation:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
Получена 1 строка. Время выполнения: 0.002 сек.
```

### Example {#example}

A larger example of the above data is available in a public bucket in s3 at: `s3://datasets-documentation/http/`.

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

Получена 1 строка. Прошло: 0.312 сек.
```

Given the constraints and input format for the JSON, we insert this sample dataset using the following query. Here, we set `flatten_nested=0`.

The following statement inserts 10 million rows, so this may take a few minutes to execute. Apply a `LIMIT` if required:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

Querying this data requires us to access the request fields as arrays. Below, we summarize the errors and http methods over a fixed time period.

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

5 строк в наборе. Прошло: 0,007 сек.
```

### Using pairwise arrays {#using-pairwise-arrays}

Pairwise arrays provide a balance between the flexibility of representing JSON as Strings and the performance of a more structured approach. The schema is flexible in that any new fields can be potentially added to the root. This, however, requires a significantly more complex query syntax and isn't compatible with nested structures.

As an example, consider the following table:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

To insert into this table, we need to structure the JSON as a list of keys and values. The following query illustrates the use of the `JSONExtractKeysAndValues` to achieve this:

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

Note how the request column remains a nested structure represented as a string. We can insert any new keys to the root. We can also have arbitrary differences in the JSON itself. To insert into our local table, execute the following:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825,01 тыс. строк/с., 8,85 МБ/с.)
```

Querying this structure requires using the [`indexOf`](/sql-reference/functions/array-functions#indexOf) function to identify the index of the required key (which should be consistent with the order of the values). This can be used to access the values array column i.e. `values[indexOf(keys, 'status')]`. We still require a JSON parsing method for the request column - in this case, `simpleJSONExtractString`.

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
```

5 строк в наборе. Прошло времени: 0.383 сек. Обработано 8.22 млн строк, 1.97 ГБ (21.45 млн строк/с, 5.15 ГБ/с.)
Пиковое потребление памяти: 51.35 МиБ.

```
```
