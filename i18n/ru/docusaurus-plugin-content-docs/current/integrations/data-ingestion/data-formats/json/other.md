---
title: 'Другие подходы к моделированию JSON'
slug: /integrations/data-formats/json/other-approaches
description: 'Другие подходы к моделированию JSON'
keywords: ['json', 'форматы']
---


# Другие подходы к моделированию JSON

**Следующие альтернативы моделированию JSON в ClickHouse документированы для полноты и применимы до разработки типа JSON, поэтому они, как правило, не рекомендуются и не подходят в большинстве случаев использования.**

:::note Примените предметный подход
Разные техники могут быть применены к разным объектам в одной схеме. Например, некоторые объекты могут быть лучше решены с использованием типа `String`, а другие - с использованием типа `Map`. Обратите внимание, что после использования типа `String` больше никаких решений по схеме принимать не нужно. В свою очередь, возможно вложение под-объектов в ключ `Map` - включая `String`, представляющий JSON - как показано ниже:
:::

## Использование String {#using-string}

Если объекты имеют высокую динамичность, без предсказуемой структуры и содержат произвольно вложенные объекты, пользователи должны использовать тип `String`. Значения могут быть извлечены во время запроса с помощью функций JSON, как показано ниже.

Обработка данных с использованием структурированного подхода, описанного выше, часто невозможно для пользователей с динамическим JSON, который либо подвержен изменениям, либо схема которого не хорошо понята. Для абсолютной гибкости пользователи могут просто хранить JSON как `String` до того, как использовать функции для извлечения полей по мере необходимости. Это представляет собой крайнюю противоположность обработке JSON как структурированного объекта. Эта гибкость влечет за собой затраты с существенными недостатками - в первую очередь увеличение сложности синтаксиса запроса, а также ухудшение производительности.

Как уже упоминалось ранее, для [оригинального объекта person](/integrations/data-formats/json/schema#static-vs-dynamic-json) мы не можем гарантировать структуру колонки `tags`. Мы вставляем оригинальную строку (включая `company.labels`, которую мы сейчас игнорируем), объявляя колонку `Tags` как `String`:

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
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, что функции требуют как ссылки на колонку `String` `tags`, так и пути в JSON для извлечения. Вложенные пути требуют вложения функций, например, `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`, который извлекает колонку `tags.car.year`. Извлечение вложенных путей может быть упрощено с помощью функций [`JSON_QUERY`](/sql-reference/functions/json-functions#json_query) и [`JSON_VALUE`](/sql-reference/functions/json-functions#json_value).

Рассмотрим крайний случай с набором данных `arxiv`, где мы считаем, что все тело является `String`.

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

Чтобы вставить в эту схему, нужно использовать формат `JSONAsString`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

Предположим, мы хотим подсчитать количество опубликованных работ по годам. Сравните следующий запрос, использующий только строку, с [структурированной версией](/integrations/data-formats/json/inference#creating-tables) схемы:

```sql
-- используя структурированную схему
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

-- используя неструктурированную строку

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

Обратите внимание на использование выражения XPath для фильтрации JSON по методу, т.е. `JSON_VALUE(body, '$.versions[0].created')`.

Функции для строков имеют заметно более низкую производительность (> 10x), чем явные преобразования типов с индексами. Вышеуказанные запросы всегда требуют полной проверки таблицы и обработки каждой строки. Хотя эти запросы все еще будут быстрыми на небольшом наборе данных, таких как этот, производительность ухудшится на больших наборах данных.

Гибкость этого подхода имеет явные затраты на производительность и синтаксис и должна использоваться только для высокодинамичных объектов в схеме.

### Простые JSON-функции {#simple-json-functions}

Вышеупомянутые примеры используют функции семейства JSON*. Эти функции используют полный JSON парсер на основе [simdjson](https://github.com/simdjson/simdjson), который строг в своем парсинге и будет различать одно и то же поле, вложенное на разных уровнях. Эти функции могут работать с JSON, который синтаксически корректен, но не хорошо отформатирован, например, с двойными пробелами между ключами.

Доступен более быстрый и строгий набор функций. Эти функции `simpleJSON*` предлагают потенциально более высокую производительность, в первую очередь, делая строгие предположения о структуре и формате JSON. В частности:

- Имена полей должны быть константами
- Последовательное кодирование имен полей, например, `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, но `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- Имена полей уникальны во всех вложенных структурах. Никто не делает различия между уровнями вложенности, и сопоставление является неразборчивым. В случае нескольких совпадающих полей используется первое вхождение.
- Никаких специальных символов вне строковых литералов. Это включает пробелы. Следующее недействительно и не будет разобрано.

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

В то время как следующее будет правильно разобрано:

```json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}

В некоторых случаях, когда производительность критична, и ваш JSON соответствует вышеизложенным требованиям, эти функции могут быть уместны. Пример вышеупомянутого запроса, переписанного с использованием функций `simpleJSON*`, показан ниже:

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
```

Вышеуказанный запрос использует `simpleJSONExtractString` для извлечения ключа `created`, используя тот факт, что нам нужно только первое значение для опубликованной даты. В этом случае ограничения функций `simpleJSON*` приемлемы для полученной производительности.

## Использование Map {#using-map}

Если объект используется для хранения произвольных ключей, в основном одного типа, рассмотрите использование типа `Map`. В идеале количество уникальных ключей не должно превышать нескольких сотен. Тип `Map` также можно рассмотреть для объектов с под-объектами, при условии, что последние имеют однородность в своих типах. Как правило, мы рекомендуем использовать тип `Map` для меток и тегов, например, меток пода Kubernetes в логах.

Хотя `Map` дают простой способ представления вложенных структур, они имеют некоторые заметные ограничения:

- Поля должны быть одного и того же типа.
- Доступ к под-столбцам требует специального синтаксиса карты, поскольку поля не существуют как колонки. Весь объект _является_ колонкой.
- Доступ к подколонке загружает все значение `Map`, т.е. все родственные и их соответствующие значения. Для больших карт это может привести к значительному уменьшению производительности.

:::note Строковые ключи
При моделировании объектов как `Map` используется строковой ключ для хранения имени ключа JSON. Таким образом, карта всегда будет иметь тип `Map(String, T)`, где `T` зависит от данных.
:::

#### Примитивные значения {#primitive-values}

Самое простое использование `Map` - это когда объект содержит одни и те же примитивные типы в качестве значений. В большинстве случаев это связано с использованием типа `String` для значения `T`.

Рассмотрим наш [ранее упомянутый объект person](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был признан динамическим. Важно отметить, что мы ожидаем, что в этот объект будут добавляться только пары ключ-значение типа String. Таким образом, мы можем объявить его как `Map(String, String)`:

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

Мы можем вставить наш оригинальный полный JSON-объект:

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

Полный набор функций `Map` доступен для запроса в это время, описанный [здесь](/sql-reference/functions/tuple-map-functions.md). Если ваши данные не одного и того же типа, доступны функции для выполнения [необходимейшей приведения типа](/sql-reference/functions/type-conversion-functions).

#### Объектные значения {#object-values}

Тип `Map` также можно рассмотреть для объектов, имеющих под-объекты, при условии, что последние имеют консистентность в своих типах.

Предположим, что ключ `tags` для нашего объекта `persons` требует консистентной структуры, где под-объект для каждого тега имеет колонки `name` и `time`. Упрощенный пример такого JSON-документа может выглядеть следующим образом:

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

Это может быть смоделировано с помощью `Map(String, Tuple(name String, time DateTime))`, как показано ниже:

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

Применение карт в данном случае, как правило, редко, и предполагает, что данные должны быть переработаны таким образом, чтобы динамические имена ключей не имели под-объектов. Например, приведенное выше могло бы быть переработано следующим образом, позволяя использование `Array(Tuple(key String, name String, time DateTime))`.

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

## Использование Nested {#using-nested}

Тип [Nested](/sql-reference/data-types/nested-data-structures/nested) может использоваться для моделирования статических объектов, которые редко подвержены изменениям, предлагая альтернативу `Tuple` и `Array(Tuple)`. В общем, мы рекомендуем избегать использования этого типа для JSON, так как его поведение часто бывает запутанным. Основное преимущество `Nested` заключается в том, что под-колонки могут использоваться в ключах сортировки.

Ниже приведен пример использования типа Nested для моделирования статического объекта. Рассмотрим следующую простую запись лога в JSON:

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

Настройка `flatten_nested` управляет поведением встроенного.

#### flatten_nested=1 {#flatten_nested1}

Значение `1` (по умолчанию) не поддерживает произвольный уровень вложенности. С этим значением проще всего думать о структуре вложенных данных как о нескольких [Array](/sql-reference/data-types/array) колонках одинаковой длины. Поля `method`, `path` и `version` на самом деле являются отдельными колонками `Array(Type)` с одним критическим ограничением: **длина полей `method`, `path` и `version` должна быть одинаковой.** Если мы используем `SHOW CREATE TABLE`, это иллюстрируется:

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

Несколько важных моментов, которые следует учитывать:

* Нам необходимо использовать настройку `input_format_import_nested_json`, чтобы вставить JSON как вложенную структуру. Без этого нам придется развернуть JSON, т.е.

```sql
INSERT INTO http FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
```
* Вложенные поля `method`, `path` и `version` должны передаваться как JSON массивы, т.е. 

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

Столбцы можно запросить, используя точечную нотацию:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание на использование `Array` для под-колонок; это означает, что можно потенциально воспользоваться всеми функциями [Array](/sql-reference/functions/array-functions), включая [клаузу `ARRAY JOIN`](/sql-reference/statements/select/array-join) - полезно, если ваши колонки имеют несколько значений.

#### flatten_nested=0 {#flatten_nested0}

Это позволяет произвольный уровень вложенности и означает, что вложенные колонки остаются как один массив `Tuple` - фактически они становятся тем же, что и `Array(Tuple)`.

**Это представляет собой предпочтительный способ и часто самый простой способ использовать JSON с `Nested`. Как мы показываем ниже, это требует, чтобы все объекты были списком.**

Ниже мы заново создаем нашу таблицу и повторно вставляем строку:

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

-- примечание: тип Nested сохранен
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

Несколько важных моментов, которые следует учитывать:

* `input_format_import_nested_json` не нужен для вставки.
* Тип `Nested` сохраняется в `SHOW CREATE TABLE`. Под этим столбцом фактически находится `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
* В результате мы должны вставить `request` как массив, т.е.

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

Колонки снова могут быть запрашиваемы с использованием точечной нотации:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### Пример {#example}

Более крупный пример вышеуказанных данных доступен в публичном бакете в s3 по адресу: `s3://datasets-documentation/http/`.

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

Учитывая ограничения и формат ввода для JSON, мы вставляем этот образец набора данных, используя следующий запрос. Здесь мы устанавливаем `flatten_nested=0`.

Следующий оператор вставляет 10 миллионов строк, поэтому это может занять несколько минут для выполнения. При необходимости примените `LIMIT`:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

Запрос этих данных требует, чтобы мы получили доступ к полям запроса в качестве массивов. Ниже мы обобщаем ошибки и методы http за фиксированный временной период.

```sql
SELECT status, request.method[1] as method, count() as c
FROM http
WHERE status >= 400
  AND toDateTime(timestamp) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP by method, status
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

Парные массивы обеспечивают баланс между гибкостью представления JSON как строк и производительностью более структурированного подхода. Схема гибка в том, что любые новые поля могут быть потенциально добавлены к корню. Это, однако, требует значительно более сложного синтаксиса запросов и несовместима со структурами вложенности.

В качестве примера рассмотрим следующую таблицу:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

Чтобы вставить в эту таблицу, нам нужно структурировать JSON как список ключей и значений. Следующий запрос иллюстрирует использование `JSONExtractKeysAndValues`, чтобы достичь этого:

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

Обратите внимание, что колонка запроса остается вложенной структурой, представленной как строка. Мы можем вставить любые новые ключи в корень. Мы также можем иметь произвольные различия в самом JSON. Чтобы вставить в нашу локальную таблицу, выполните следующее:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

Запрос этой структуры требует использования функции [`indexOf`](/sql-reference/functions/array-functions#indexofarr-x) для определения индекса необходимого ключа (который должен совпадать с порядком значений). Это может быть использовано для доступа к колонке значений, т.е. `values[indexOf(keys, 'status')]`. Мы все еще нуждаемся в методе парсинга JSON для колонки запроса - в этом случае, `simpleJSONExtractString`.

```sql
SELECT toUInt16(values[indexOf(keys, 'status')])                           as status,
       simpleJSONExtractString(values[indexOf(keys, 'request')], 'method') as method,
       count()                                                             as c
FROM http_with_arrays
WHERE status >= 400
  AND toDateTime(values[indexOf(keys, '@timestamp')]) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP by method, status ORDER BY c DESC LIMIT 5;

┌─status─┬─method─┬─────c─┐
│    404 │ GET    │ 11267 │
│    404 │ HEAD   │   276 │
│    500 │ GET    │   160 │
│    500 │ POST   │   115 │
│    400 │ GET    │    81 │
└────────┴────────┴───────┘

5 rows in set. Elapsed: 0.383 sec. Processed 8.22 million rows, 1.97 GB (21.45 million rows/s., 5.15 GB/s.)
```
