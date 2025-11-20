---
title: 'Другие подходы к работе с JSON'
slug: /integrations/data-formats/json/other-approaches
description: 'Другие подходы к моделированию JSON'
keywords: ['json', 'formats']
doc_type: 'reference'
---



# Другие подходы к моделированию JSON

**Ниже приведены альтернативные подходы к моделированию JSON в ClickHouse. Они описаны для полноты и применялись до появления типа JSON, поэтому в большинстве случаев не рекомендуются и неприменимы.**

:::note Применяйте объектный подход
К разным объектам в одной и той же схеме могут применяться разные техники. Например, некоторые объекты лучше всего реализовать с помощью типа `String`, а другие — с помощью типа `Map`. Обратите внимание, что после выбора типа `String` больше не требуется принимать какие-либо решения по схеме. Напротив, возможна вложенность под-объектов в ключ `Map` — включая `String`, представляющий JSON, как показано ниже:
:::



## Использование типа String {#using-string}

Если объекты являются высокодинамичными, не имеют предсказуемой структуры и содержат произвольные вложенные объекты, следует использовать тип `String`. Значения можно извлекать во время выполнения запроса с помощью функций JSON, как показано ниже.

Обработка данных с использованием структурированного подхода, описанного выше, часто невозможна для пользователей с динамическим JSON, который либо подвержен изменениям, либо имеет недостаточно изученную схему. Для максимальной гибкости можно просто хранить JSON как `String`, а затем использовать функции для извлечения полей по мере необходимости. Это представляет собой полную противоположность обработке JSON как структурированного объекта. Такая гибкость имеет свою цену и значительные недостатки — в первую очередь усложнение синтаксиса запросов и снижение производительности.

Как отмечалось ранее, для [исходного объекта person](/integrations/data-formats/json/schema#static-vs-dynamic-json) мы не можем гарантировать структуру столбца `tags`. Мы вставляем исходную строку (включая `company.labels`, которые пока игнорируем), объявляя столбец `tags` как `String`:

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

Мы можем выбрать столбец `tags` и увидеть, что JSON был вставлен как строка:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Функции [`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) можно использовать для извлечения значений из этого JSON. Рассмотрим простой пример ниже:

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, что функциям требуется как ссылка на столбец `String` `tags`, так и путь в JSON для извлечения. Вложенные пути требуют вложенных функций, например `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`, которая извлекает столбец `tags.car.year`. Извлечение вложенных путей можно упростить с помощью функций [`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY) и [`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE).

Рассмотрим крайний случай с набором данных `arxiv`, где мы считаем всё содержимое `String`.

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

Для вставки в эту схему необходимо использовать формат `JSONAsString`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```


Предположим, мы хотим подсчитать количество статей, выпущенных по годам. Сравните следующий запрос, использующий только строку, со [структурированной версией](/integrations/data-formats/json/inference#creating-tables) схемы:

```sql
-- использование структурированной схемы
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

-- использование неструктурированной строки (String)

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

Обратите внимание на использование XPath-выражения для фильтрации JSON, т. е. `JSON_VALUE(body, '$.versions[0].created')`.

Строковые функции работают заметно медленнее (более чем в 10 раз), чем явные преобразования типов с индексами. Приведенные выше запросы всегда требуют полного сканирования таблицы и обработки каждой строки. Хотя эти запросы будут выполняться быстро на небольшом наборе данных, таком как этот, производительность будет снижаться на больших наборах данных.

Гибкость этого подхода достигается ценой явных потерь в производительности и усложнения синтаксиса, поэтому его следует использовать только для высокодинамичных объектов в схеме.

### Простые JSON-функции {#simple-json-functions}

Приведенные выше примеры используют семейство функций JSON\*. Эти функции используют полноценный JSON-парсер на основе [simdjson](https://github.com/simdjson/simdjson), который строго выполняет разбор и различает одинаковые поля, вложенные на разных уровнях. Эти функции способны обрабатывать JSON, который синтаксически корректен, но плохо отформатирован, например, с двойными пробелами между ключами.

Доступен более быстрый и строгий набор функций. Эти функции `simpleJSON*` обеспечивают потенциально более высокую производительность, главным образом за счет строгих предположений относительно структуры и формата JSON. В частности:

- Имена полей должны быть константами
- Согласованное кодирование имен полей, например `simpleJSONHas('{"abc":"def"}', 'abc') = 1`, но `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- Имена полей уникальны во всех вложенных структурах. Различия между уровнями вложенности не делается, и сопоставление выполняется без учета уровня. В случае нескольких совпадающих полей используется первое вхождение.
- Отсутствие специальных символов вне строковых литералов. Это включает пробелы. Следующий пример недопустим и не будет разобран.

  ```json
  {
    "@timestamp": 893964617,
    "clientip": "40.135.0.0",
    "request": {
      "method": "GET",
      "path": "/images/hm_bg.jpg",
      "version": "HTTP/1.0"
    },
    "status": 200,
    "size": 24736
  }
  ```

В то время как следующий пример будет разобран корректно:


````json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}

В некоторых случаях, когда производительность критична, а ваш JSON соответствует вышеуказанным требованиям, использование этих функций может быть целесообразным. Ниже приведён пример предыдущего запроса, переписанный с использованием функций `simpleJSON*`:

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
````

Приведённый выше запрос использует `simpleJSONExtractString` для извлечения ключа `created`, используя тот факт, что для даты публикации нам нужно только первое значение. В этом случае ограничения функций `simpleJSON*` вполне приемлемы ради выигрыша в производительности.


## Использование типа Map {#using-map}

Если объект используется для хранения произвольных ключей, преимущественно одного типа, рассмотрите возможность использования типа `Map`. В идеале количество уникальных ключей не должно превышать нескольких сотен. Тип `Map` также можно использовать для объектов с подобъектами при условии, что последние имеют единообразие типов. В целом мы рекомендуем использовать тип `Map` для меток и тегов, например меток подов Kubernetes в логах.

Хотя `Map` предоставляет простой способ представления вложенных структур, он имеет некоторые существенные ограничения:

- Все поля должны быть одного типа.
- Доступ к подстолбцам требует специального синтаксиса map, поскольку поля не существуют как отдельные столбцы. Весь объект _является_ столбцом.
- Доступ к подстолбцу загружает всё значение `Map`, то есть все соседние элементы и их соответствующие значения. Для больших map это может привести к значительному снижению производительности.

:::note Строковые ключи
При моделировании объектов как `Map` для хранения имени ключа JSON используется ключ типа `String`. Поэтому map всегда будет иметь вид `Map(String, T)`, где `T` зависит от данных.
:::

#### Примитивные значения {#primitive-values}

Простейшее применение `Map` — когда объект содержит значения одного примитивного типа. В большинстве случаев это подразумевает использование типа `String` для значения `T`.

Рассмотрим наш [предыдущий JSON с данными о человеке](/integrations/data-formats/json/schema#static-vs-dynamic-json), где объект `company.labels` был определён как динамический. Важно отметить, что мы ожидаем добавления в этот объект только пар ключ-значение типа String. Таким образом, мы можем объявить его как `Map(String, String)`:

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

Мы можем вставить наш исходный полный объект JSON:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

Запрос этих полей внутри объекта требует синтаксиса map, например:

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

Полный набор функций для работы с `Map` доступен для запросов и описан [здесь](/sql-reference/functions/tuple-map-functions.md). Если ваши данные не имеют согласованного типа, существуют функции для выполнения [необходимого приведения типов](/sql-reference/functions/type-conversion-functions).

#### Объектные значения {#object-values}

Тип `Map` также можно использовать для объектов, которые имеют подобъекты, при условии что последние имеют согласованность типов.

Предположим, что ключ `tags` для нашего объекта `persons` требует согласованной структуры, где подобъект для каждого `tag` имеет столбцы `name` и `time`. Упрощённый пример такого документа JSON может выглядеть следующим образом:


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
      "name": "Тесла",
      "time": "2024-07-11 15:18:23"
    }
  }
}
```

Это можно смоделировать с помощью типа `Map(String, Tuple(name String, time DateTime)`, как показано ниже:

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

Обработана 1 строка. Затрачено: 0,002 сек.

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

Обработана 1 строка. Затрачено: 0,001 сек.
```

Применение типов `Map` в таком случае, как правило, бывает редким и указывает на то, что данные следует изменить так, чтобы динамические имена ключей не содержали под-объектов. Например, приведённую выше структуру можно изменить следующим образом, что позволит использовать `Array(Tuple(key String, name String, time DateTime))`.

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
      "name": "Тесла",
      "time": "2024-07-11 15:18:23"
    }
  ]
}
```


## Использование типа Nested {#using-nested}

[Тип Nested](/sql-reference/data-types/nested-data-structures/nested) можно использовать для моделирования статических объектов, которые редко изменяются, предоставляя альтернативу `Tuple` и `Array(Tuple)`. Мы обычно рекомендуем избегать использования этого типа для JSON, так как его поведение часто вызывает путаницу. Основное преимущество `Nested` заключается в том, что подстолбцы могут использоваться в ключах сортировки.

Ниже приведен пример использования типа Nested для моделирования статического объекта. Рассмотрим следующую простую запись журнала в формате JSON:

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

Мы можем объявить ключ `request` как `Nested`. Аналогично `Tuple`, необходимо указать подстолбцы.

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

Настройка `flatten_nested` управляет поведением вложенных структур.

#### flatten_nested=1 {#flatten_nested1}

Значение `1` (по умолчанию) не поддерживает произвольный уровень вложенности. При этом значении проще всего представлять вложенную структуру данных как несколько столбцов типа [Array](/sql-reference/data-types/array) одинаковой длины. Поля `method`, `path` и `version` фактически являются отдельными столбцами `Array(Type)` с одним критическим ограничением: **длина полей `method`, `path` и `version` должна быть одинаковой.** Это можно увидеть при использовании `SHOW CREATE TABLE`:

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

Ниже показана вставка данных в эту таблицу:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

Несколько важных моментов, на которые следует обратить внимание:

- Необходимо использовать настройку `input_format_import_nested_json` для вставки JSON как вложенной структуры. Без этой настройки требуется преобразовать JSON в плоскую структуру, то есть:

  ```sql
  INSERT INTO http FORMAT JSONEachRow
  {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
  ```

- Вложенные поля `method`, `path` и `version` должны передаваться как массивы JSON, то есть:

  ```json
  {
    "@timestamp": 897819077,
    "clientip": "45.212.12.0",
    "request": {
      "method": ["GET"],
      "path": ["/french/images/hm_nav_bar.gif"],
      "version": ["HTTP/1.0"]
    },
    "status": 200,
    "size": 3305
  }
  ```

К столбцам можно обращаться с использованием точечной нотации:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```


Обратите внимание, что использование `Array` для подстолбцов означает, что можно задействовать весь арсенал [функций для массивов](/sql-reference/functions/array-functions), включая конструкцию [`ARRAY JOIN`](/sql-reference/statements/select/array-join) — это полезно, если ваши столбцы содержат несколько значений.

#### flatten_nested=0 {#flatten_nested0}

Это позволяет использовать произвольный уровень вложенности и означает, что вложенные столбцы остаются единым массивом кортежей `Tuple` — фактически они становятся эквивалентны `Array(Tuple)`.

**Это предпочтительный и зачастую самый простой способ использования JSON с `Nested`. Как мы покажем ниже, он требует только, чтобы все объекты были представлены в виде списка.**

Ниже мы пересоздаём таблицу и повторно вставляем строку:

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

-- обратите внимание, что тип Nested сохраняется.
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

Несколько важных моментов, на которые следует обратить внимание:

- `input_format_import_nested_json` не требуется для вставки.
- Тип `Nested` сохраняется в `SHOW CREATE TABLE`. По сути, этот столбец представляет собой `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
- Как следствие, необходимо вставлять `request` в виде массива, т.е.

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

Столбцы снова можно запрашивать с использованием точечной нотации:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
Получена 1 строка. Затрачено: 0.002 сек.
```

### Пример {#example}

Более крупный пример приведённых выше данных доступен в публичном бакете S3 по адресу: `s3://datasets-documentation/http/`.

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

Получена 1 строка. Затрачено: 0.312 сек.
```

Учитывая ограничения и входной формат JSON, мы вставляем этот набор данных с помощью следующего запроса. Здесь мы устанавливаем `flatten_nested=0`.

Следующая инструкция вставляет 10 миллионов строк, поэтому выполнение может занять несколько минут. При необходимости примените `LIMIT`:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

Запрос этих данных требует обращения к полям request как к массивам. Ниже мы суммируем ошибки и HTTP-методы за фиксированный период времени.


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

Парные массивы обеспечивают баланс между гибкостью представления JSON в виде строк и производительностью более структурированного подхода. Схема является гибкой, так как любые новые поля могут быть добавлены в корень. Однако это требует значительно более сложного синтаксиса запросов и несовместимо с вложенными структурами.

В качестве примера рассмотрим следующую таблицу:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

Для вставки данных в эту таблицу необходимо структурировать JSON как список ключей и значений. Следующий запрос демонстрирует использование функции `JSONExtractKeysAndValues` для этой цели:

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

Обратите внимание, что столбец request остается вложенной структурой, представленной в виде строки. Мы можем добавлять любые новые ключи в корень. Также в самом JSON могут быть произвольные различия. Для вставки данных в локальную таблицу выполните следующее:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

Для запроса к этой структуре необходимо использовать функцию [`indexOf`](/sql-reference/functions/array-functions#indexOf) для определения индекса требуемого ключа (который должен соответствовать порядку значений). Это позволяет обращаться к столбцу массива values, например `values[indexOf(keys, 'status')]`. Для столбца request по-прежнему требуется метод парсинга JSON — в данном случае `simpleJSONExtractString`.

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


5 rows in set. Elapsed: 0.383 sec. Processed 8.22 million rows, 1.97 GB (21.45 million rows/s., 5.15 GB/s.)
Peak memory usage: 51.35 MiB.

```
```
