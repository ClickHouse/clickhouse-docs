---
title: 'Другие подходы к моделированию JSON'
slug: /integrations/data-formats/json/other-approaches
description: 'Другие подходы к моделированию JSON'
keywords: ['json', 'форматы']
---


# Другие подходы к моделированию JSON

**Следующие альтернативы моделированию JSON в ClickHouse представлены для полноты картины и в целом не рекомендуются или не применимы в большинстве случаев.**

## Использование Nested {#using-nested}

Тип [Nested](/sql-reference/data-types/nested-data-structures/nested) может быть использован для моделирования статических объектов, которые редко подлежат изменению, предлагая альтернативу `Tuple` и `Array(Tuple)`. Мы в целом рекомендуем избегать использования этого типа для JSON, поскольку его поведение часто сбивает с толку. Основное преимущество `Nested` заключается в том, что подколонки могут использоваться в ключах сортировки.

Ниже приведён пример использования типа Nested для моделирования статического объекта. Рассмотрим следующую простую запись лога в JSON:

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

Мы можем объявить ключ `request` как `Nested`. Аналогично `Tuple`, нам требуется указать подколонки.

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

Настройка `flatten_nested` контролирует поведение вложенных структур.

#### flatten_nested=1 {#flatten_nested1}

Значение `1` (по умолчанию) не поддерживает произвольный уровень вложенности. При этом значении легко представить вложенную структуру как несколько [Array](/sql-reference/data-types/array) колонок одинаковой длины. Поля `method`, `path` и `version` фактически являются отдельными колонками `Array(Type)` с одним критическим ограничением: **длина полей `method`, `path` и `version` должна быть одинаковой.** Это можно проиллюстрировать, используя `SHOW CREATE TABLE`:

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

Ниже мы вставляем данные в эту таблицу:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

Несколько важных моментов, которые стоит отметить здесь:

* Нам нужно использовать настройку `input_format_import_nested_json`, чтобы вставить JSON как вложенную структуру. Без этого нам нужно расплющить JSON т.е.

    ```sql
    INSERT INTO http FORMAT JSONEachRow
    {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
    ```
* Вложенные поля `method`, `path` и `version` должны передаваться как JSON массивы т.е.

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

Столбцы можно запрашивать, используя точечную нотацию:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

Обратите внимание, что использование `Array` для подколонок означает, что можно потенциально использовать полный спектр [функций массива](/sql-reference/functions/array-functions), включая условие [`ARRAY JOIN`](/sql-reference/statements/select/array-join) - что полезно, если ваши столбцы имеют несколько значений.

#### flatten_nested=0 {#flatten_nested0}

Это позволяет произвольный уровень вложенности и означает, что вложенные столбцы остаются в виде одного массива `Tuple` - фактически они становятся тем же самым, что и `Array(Tuple)`.

**Это предпочтительный способ и часто самый простой способ использовать JSON с `Nested`. Как мы покажем ниже, это требует только, чтобы все объекты были списком.**

Ниже мы воссоздаем нашу таблицу и повторно вставляем строку:

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

-- обратите внимание, что тип Nested сохранен.
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

Несколько важных моментов, которые стоит отметить здесь:

* Настройка `input_format_import_nested_json` не требуется для вставки.
* Тип `Nested` сохранен в `SHOW CREATE TABLE`. Внутри этого столбца фактически находится `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
* В результате мы должны вставить `request` как массив т.е.

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
1 row in set. Elapsed: 0.002 sec.
```

### Пример {#example}

Более крупный пример приведенных выше данных доступен в публичном бакете в s3 по адресу: `s3://datasets-documentation/http/`.

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

Учитывая ограничения и формат ввода для JSON, мы вставляем этот образец данных с помощью следующего запроса. Здесь мы устанавливаем `flatten_nested=0`.

Следующее выражение вставляет 10 миллионов строк, поэтому выполнение может занять несколько минут. Примените `LIMIT`, если это необходимо:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

Запрос этих данных требует от нас доступа к полям запроса как к массивам. Ниже мы подводим итог по ошибкам и методам http за фиксированный период времени.

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

Парные массивы обеспечивают баланс между гибкостью представления JSON в виде строк и производительностью более структурированного подхода. Схема гибкая в том смысле, что любые новые поля могут быть потенциально добавлены к корню. Однако это требует значительно более сложного синтаксиса запросов и несовместимо с вложенными структурами.

В качестве примера рассмотрим следующую таблицу:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

Чтобы вставить данные в эту таблицу, нам необходимо структурировать JSON как список ключей и значений. Следующий запрос иллюстрирует использование `JSONExtractKeysAndValues` для достижения этого:

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

Обратите внимание, как колонка request остается вложенной структурой, представленной в виде строки. Мы можем добавить любые новые ключи в корень. Мы также можем иметь произвольные различия в самом JSON. Чтобы вставить данные в нашу локальную таблицу, выполните следующее:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

Запрос этой структуры требует использовать функцию [`indexOf`](/sql-reference/functions/array-functions#indexofarr-x) для определения индекса необходимого ключа (который должен соответствовать порядку значений). Это можно использовать для доступа к массиву значений т.е. `values[indexOf(keys, 'status')]`. Нам все еще требуется метод парсинга JSON для колонки request - в этом случае `simpleJSONExtractString`.

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
Peak memory usage: 51.35 MiB.
```
