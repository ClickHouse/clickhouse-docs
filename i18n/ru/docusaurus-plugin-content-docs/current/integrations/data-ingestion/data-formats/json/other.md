---
title: 'Другие подходы к моделированию JSON'
slug: /integrations/data-formats/json/other-approaches
description: 'Другие подходы к моделированию JSON'
keywords: ['json', 'форматы']
---


# Другие подходы к моделированию JSON

**Ниже представлены альтернативы моделированию JSON в ClickHouse. Они задокументированы для полноты и, как правило, не рекомендуются или неприменимы в большинстве случаев использования.**

## Использование Nested {#using-nested}

[Тип Nested](/sql-reference/data-types/nested-data-structures/nested) может быть использован для моделирования статических объектов, которые редко подлежат изменению, предлагая альтернативу `Tuple` и `Array(Tuple)`. Мы, как правило, рекомендуем избегать использования этого типа для JSON, так как его поведение часто вызывает путаницу. Основное преимущество `Nested` заключается в том, что подстолбцы могут использоваться в ключах сортировки.

Ниже приводится пример использования типа Nested для моделирования статического объекта. Рассмотрим следующую простую запись журнала в формате JSON:

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

Мы можем объявить ключ `request` как `Nested`. Аналогично `Tuple`, мы обязаны указать подстолбцы.

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

Значение `1` (значение по умолчанию) не поддерживает произвольный уровень вложенности. С этим значением проще всего мыслить о вложенной структуре данных как о нескольких [Array](/sql-reference/data-types/array) столбцах одинаковой длины. Поля `method`, `path` и `version` фактически являются отдельными столбцами `Array(Type)` с одним критическим ограничением: **длина полей `method`, `path` и `version` должна быть одинаковой.** Если мы используем `SHOW CREATE TABLE`, это будет проиллюстрировано:

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

Ниже мы делаем вставку в эту таблицу:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

Несколько важных моментов, которые стоит отметить:

* Мы обязаны использовать настройку `input_format_import_nested_json`, чтобы вставить JSON как вложенную структуру. Без этого мы обязаны расплющить JSON т.е.

    ```sql
    INSERT INTO http FORMAT JSONEachRow
    {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
    ```
* Вложенные поля `method`, `path` и `version` необходимо передавать как JSON массивы т.е.

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

Обратите внимание, что использование `Array` для подстолбцов означает, что весь спектр [функций Array](/sql-reference/functions/array-functions) может быть потенциально использован, включая [`ARRAY JOIN`](/sql-reference/statements/select/array-join) - что полезно, если ваши столбцы имеют несколько значений.

#### flatten_nested=0 {#flatten_nested0}

Это позволяет произвольный уровень вложенности и означает, что вложенные столбцы остаются как один массив `Tuple` - фактически они становятся такими же, как `Array(Tuple)`.

**Это предпочтительный способ и зачастую самый простой способ использовать JSON с `Nested`. Как мы покажем ниже, это требует только, чтобы все объекты были списком.**

Ниже мы воссоздадим нашу таблицу и повторно вставим строку:

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

* `input_format_import_nested_json` не требуется для вставки.
* Тип `Nested` сохранен в `SHOW CREATE TABLE`. Фактически под этим столбцом находится `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
* В результате мы обязаны вставить `request` как массив т.е.

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

Столбцы снова можно запрашивать, используя точечную нотацию:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### Пример {#example}

Более крупный пример приведенных данных доступен в публичном бакете в s3 по следующему адресу: `s3://datasets-documentation/http/`.

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

Следующий оператор вставляет 10 миллионов строк, поэтому выполнение может занять несколько минут. Примените `LIMIT`, если это необходимо:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

Запрос данных требует доступа к полям запроса как к массивам. Ниже мы резюмируем ошибки и HTTP методы за фиксированный период времени.

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

Парные массивы обеспечивают баланс между гибкостью представления JSON как строк и производительностью более структурированного подхода. Схема гибкая в том смысле, что любые новые поля потенциально могут быть добавлены к корню. Однако это требует значительно более сложного синтаксиса запросов и несовместимо с вложенными структурами.

В качестве примера рассмотрим следующую таблицу:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

Чтобы вставить данные в эту таблицу, нам нужно структурировать JSON как список ключей и значений. Следующий запрос иллюстрирует использование `JSONExtractKeysAndValues` для этого:

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

Обратите внимание, что столбец запроса остается вложенной структурой, представленной как строка. Мы можем добавлять любые новые ключи к корню. У нас также могут быть произвольные различия в самом JSON. Чтобы вставить в нашу локальную таблицу, выполните следующее:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

Запрос к этой структуре требует использования функции [`indexOf`](/sql-reference/functions/array-functions#indexofarr-x), чтобы определить индекс нужного ключа (который должен быть согласован с порядком значений). Это может быть использовано для доступа к массиву значений i.e. `values[indexOf(keys, 'status')]`. По-прежнему требуется метод разбора JSON для столбца запроса - в этом случае `simpleJSONExtractString`.

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
