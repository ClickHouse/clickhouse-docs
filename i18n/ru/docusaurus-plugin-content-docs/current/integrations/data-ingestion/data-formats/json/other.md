---
title: 'Другие подходы к работе с JSON'
slug: /integrations/data-formats/json/other-approaches
description: 'Другие подходы к моделированию JSON'
keywords: ['json', 'formats']
doc_type: 'reference'
---

# Другие подходы к моделированию JSON \{#other-approaches-to-modeling-json\}

**Ниже приведены альтернативные подходы к моделированию JSON в ClickHouse. Они приведены для полноты и использовались до появления типа JSON, поэтому, как правило, не рекомендуются и не применяются в большинстве сценариев.**

:::note Применяйте подход на уровне объектов
К разным объектам в одной и той же схеме можно применять разные техники. Например, для одних объектов лучше всего подойдет тип `String`, а для других — тип `Map`. Обратите внимание, что после выбора типа `String` больше не требуется принимать какие-либо решения о схеме. Напротив, в ключ `Map` можно вложить подчиненные объекты, включая `String`, представляющую JSON, как показано ниже:
:::

## Использование типа String \{#using-string\}

Если объекты очень динамичны, не имеют предсказуемой структуры и содержат произвольные вложенные объекты, следует использовать тип `String`. Значения можно извлекать во время выполнения запроса с помощью JSON‑функций, как показано ниже.

Обработка данных с использованием описанного выше структурированного подхода часто неприменима, если вы работаете с динамическим JSON, который либо подвержен изменениям, либо чья схема плохо известна. Для максимальной гибкости вы можете просто хранить JSON как `String` и затем использовать функции для извлечения требуемых полей. Это представляет собой полную противоположность обработке JSON как структурированного объекта. Такая гибкость имеет свою цену и приводит к существенным недостаткам — в первую очередь к увеличению сложности синтаксиса запросов, а также к ухудшению производительности.

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

Мы можем выбрать столбец `tags` и убедиться, что JSON был сохранён в виде строки:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

С помощью функций [`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) можно извлекать значения из этого JSON. Рассмотрим простой пример ниже:

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


### Простые JSON-функции \{#simple-json-functions\}

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

````json
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
````

В приведённом выше запросе используется `simpleJSONExtractString` для извлечения ключа `created`, используя тот факт, что для даты публикации нам нужно только первое значение. В этом случае ограничения функций `simpleJSON*` приемлемы ради выигрыша в производительности.


## Использование типа Map {#using-map}

Если объект используется для хранения произвольных ключей (преимущественно одного типа), рассмотрите использование типа `Map`. В идеале количество уникальных ключей не должно превышать нескольких сотен. Тип `Map` также можно использовать для объектов с вложенными объектами при условии, что последние однородны по своим типам. В целом мы рекомендуем использовать тип `Map` для лейблов и тегов, например лейблов подов Kubernetes в логах.

Хотя `Map` предоставляет простой способ представления вложенных структур, у него есть несколько заметных ограничений:

* Все поля должны быть одного и того же типа.
* Доступ к подстолбцам требует специального синтаксиса `Map`, поскольку поля не существуют как отдельные столбцы. Весь объект *и есть* столбец.
* Доступ к подстолбцу загружает всё значение `Map`, то есть все соседние ключи и их соответствующие значения. Для больших `Map` это может приводить к существенным потерям производительности.

:::note Строковые ключи
При моделировании объектов как `Map` в качестве ключа используется строка (`String`), в которой хранится имя ключа JSON. Поэтому `Map` всегда будет иметь вид `Map(String, T)`, где `T` зависит от данных.
:::

#### Примитивные значения

Простейшее применение `Map` — когда объект содержит значения одного и того же примитивного типа. В большинстве случаев это означает использование типа `String` для значения `T`.

Рассмотрим наш [предыдущий JSON с описанием человека](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определён как динамический. Важно, что мы ожидаем добавления в этот объект только пар ключ–значение типа `String`. Таким образом, мы можем объявить его как `Map(String, String)`:

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

Мы можем вставить наш исходный полный JSON-объект:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Для выборки этих полей из объекта `request` необходимо использовать синтаксис `Map`, например:

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

Полный набор функций `Map`, доступных для выполнения запросов, описан [здесь](/sql-reference/functions/tuple-map-functions.md). Если ваши данные не являются однородными по типу, существуют функции для выполнения [необходимого приведения типов](/sql-reference/functions/type-conversion-functions).


#### Объектные значения

Тип `Map` также можно использовать для объектов, которые содержат вложенные объекты, если для вложенных объектов используются согласованные типы.

Предположим, что ключ `tags` для нашего объекта `persons` требует согласованной структуры, где вложенный объект для каждого `tag` имеет столбцы `name` и `time`. Упрощённый пример такого JSON-документа может выглядеть следующим образом:

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

Это можно смоделировать с помощью типа `Map(String, Tuple(name String, time DateTime))`, как показано ниже:

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

Использование `Map` в таком случае, как правило, встречается редко и свидетельствует о том, что данные лучше переработать так, чтобы динамические имена ключей не имели вложенных объектов. Например, приведённую выше структуру можно изменить следующим образом, что позволит использовать `Array(Tuple(key String, name String, time DateTime))`.

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


## Использование типа Nested

Тип [Nested](/sql-reference/data-types/nested-data-structures/nested) можно использовать для моделирования статических объектов, которые редко изменяются, в качестве альтернативы `Tuple` и `Array(Tuple)`. В целом мы рекомендуем избегать использования этого типа для JSON, поскольку его поведение часто оказывается запутанным. Основное преимущество `Nested` заключается в том, что подколонки могут использоваться в ключах сортировки.

Ниже приведён пример использования типа Nested для моделирования статического объекта. Рассмотрим следующую простую запись журнала в формате JSON:

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

Мы можем объявить ключ `request` как тип `Nested`. Подобно `Tuple`, необходимо явно указать подстолбцы.

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

Параметр `flatten_nested` управляет поведением типа данных `Nested`.

#### flatten&#95;nested=1

Значение `1` (по умолчанию) не поддерживает произвольную глубину вложенности. При таком значении проще всего рассматривать вложенную структуру данных как несколько столбцов [Array](/sql-reference/data-types/array) одинаковой длины. Поля `method`, `path` и `version` фактически являются отдельными столбцами `Array(Type)` с одним критическим ограничением: **длина полей `method`, `path` и `version` должна быть одинаковой.** Если мы воспользуемся `SHOW CREATE TABLE`, это иллюстрируется следующим образом:

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

Ниже вставляем данные в эту таблицу:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

Несколько важных моментов, на которые стоит обратить внимание:

* Необходимо использовать настройку `input_format_import_nested_json`, чтобы вставить JSON в виде вложенной структуры. Без этого JSON нужно будет сплющивать, т.е.

  ```sql
  INSERT INTO http FORMAT JSONEachRow
  {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
  ```
* Вложенные поля `method`, `path` и `version` должны передаваться как JSON-массивы, т.е.

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

К столбцам можно обращаться, используя точечную нотацию:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, что использование `Array` для подстолбцов означает, что потенциально может быть задействован полный набор [функций для массивов](/sql-reference/functions/array-functions), включая предложение [`ARRAY JOIN`](/sql-reference/statements/select/array-join) — это полезно, если ваши столбцы содержат несколько значений.


#### flatten&#95;nested=0

Это позволяет использовать произвольный уровень вложенности и означает, что вложенные столбцы остаются одним массивом `Tuple` — по сути, они становятся тем же самым, что и `Array(Tuple)`.

**Это предпочтительный и часто самый простой способ использования JSON с `Nested`. Как показано ниже, для этого требуется лишь, чтобы все объекты представляли собой список.**

Ниже мы заново создаём нашу таблицу и повторно вставляем строку:

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

Несколько важных моментов, на которые стоит обратить внимание:

* `input_format_import_nested_json` не требуется указывать при вставке.
* Тип `Nested` сохраняется в `SHOW CREATE TABLE`. Под капотом этот столбец фактически имеет тип `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`.
* В результате поле `request` нужно вставлять как массив, то есть:

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

К столбцам снова можно обращаться, используя точечную нотацию:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```


### Пример

Более объёмный пример приведённых выше данных доступен в общедоступном бакете в S3 по адресу: `s3://datasets-documentation/http/`.

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

С учетом ограничений и формата входных данных JSON мы вставляем этот пример набора данных с помощью следующего запроса. Здесь мы задаем `flatten_nested=0`.

Следующий запрос вставляет 10 миллионов строк, поэтому выполнение может занять несколько минут. При необходимости примените `LIMIT`:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

Для выполнения запросов к этим данным нам нужно обращаться к полям запроса как к массивам. Ниже мы агрегируем ошибки и HTTP-методы за фиксированный период времени.

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


### Использование парных массивов

Парные массивы обеспечивают баланс между гибкостью представления JSON в виде строк (`String`) и производительностью более структурированного подхода. Схема гибкая в том смысле, что любые новые поля потенциально могут быть добавлены в корень. Однако это требует значительно более сложного синтаксиса запросов и несовместимо с вложенными структурами.

В качестве примера рассмотрим следующую таблицу:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

Чтобы выполнить вставку в эту таблицу, нам нужно структурировать JSON в виде списка ключей и значений. Следующий запрос демонстрирует использование `JSONExtractKeysAndValues` для этого:

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

Обратите внимание, что столбец `request` остаётся вложенной структурой, представленной строкой. Мы можем добавлять любые новые ключи на верхнем уровне. При этом в самом JSON могут быть произвольные различия. Чтобы вставить данные в нашу локальную таблицу, выполните следующее:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

Для выполнения запросов к этой структуре необходимо использовать функцию [`indexOf`](/sql-reference/functions/array-functions#indexOf) для определения индекса нужного ключа (который должен соответствовать порядку в массиве значений). Это можно использовать для доступа к столбцу массива значений, т.е. `values[indexOf(keys, 'status')]`. Для столбца request по‑прежнему требуется метод парсинга JSON — в данном случае `simpleJSONExtractString`.

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
