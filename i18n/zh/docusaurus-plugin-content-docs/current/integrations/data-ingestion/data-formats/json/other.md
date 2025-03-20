---
title: 其他 JSON 方法
slug: /integrations/data-formats/json/other-approaches
description: 其他 JSON 建模的方法
keywords: ['json', 'formats']
---


# 其他 JSON 建模的方法

**以下是 ClickHouse 中建模 JSON 的替代方案。这些记录是为了完整性，一般不推荐或适用于大多数使用案例。**

## 使用 Nested {#using-nested}

[Nested 类型](/sql-reference/data-types/nested-data-structures/nested) 可用于建模静态对象，这些对象很少发生变化，提供了 `Tuple` 和 `Array(Tuple)` 的替代方案。我们通常建议避免将此类型用于 JSON，因为其行为通常令人困惑。`Nested` 的主要好处是子列可以用于排序键。

以下是使用 Nested 类型建模静态对象的示例。考虑以下简单的 JSON 日志条目：

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

我们可以将 `request` 键声明为 `Nested`。类似于 `Tuple`，我们需要指定子列。

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

设置 `flatten_nested` 控制嵌套的行为。

#### flatten_nested=1 {#flatten_nested1}

值为 `1`（默认值）不支持任意等级的嵌套。使用此值，可以将嵌套数据结构视为多个同长度的 [Array](/sql-reference/data-types/array) 列。字段 `method`、`path` 和 `version` 实际上都是单独的 `Array(Type)` 列，并有一个关键限制：**`method`、`path` 和 `version` 字段的长度必须相同。** 如果使用 `SHOW CREATE TABLE`，将会表明这是：

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

下面，我们向此表插入数据：

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

需要注意的几点重要事项：

* 我们需要使用设置 `input_format_import_nested_json` 来插入嵌套结构的 JSON。否则，我们需要将 JSON 展平，即。

    ```sql
    INSERT INTO http FORMAT JSONEachRow
    {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
    ```
* 嵌套字段 `method`、`path` 和 `version` 需要作为 JSON 数组传递，即。

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

可以使用点表示法查询列：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

请注意，子列使用 `Array` 意味着可以利用完整的 [Array 函数](/sql-reference/functions/array-functions)，包括 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 子句 - 如果您的列有多个值，这将非常有用。

#### flatten_nested=0 {#flatten_nested0}

这允许任意层次的嵌套，意味着嵌套列保持为单个 `Tuple` 的数组 - 实际上它们变为与 `Array(Tuple)` 相同。

**这代表了首选的方法，也通常是使用 `Nested` 的最简单方法。如我们所示，只需确保所有对象是一个列表。**

下面，我们重新创建表并重新插入一行：

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

-- 注意 Nested 类型被保留。
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

需要注意的几点重要事项：

* 不需要 `input_format_import_nested_json` 来插入。
* 在 `SHOW CREATE TABLE` 中保留了 `Nested` 类型。此列底层实际上是一个 `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
* 因此，我们需要将 `request` 作为数组插入，即。

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

列再次可以使用点表示法查询：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 示例 {#example}

上述数据的更大示例可在 S3 的公共桶中找到：`s3://datasets-documentation/http/`。

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

考虑到 JSON 的约束和输入格式，我们使用以下查询插入此示例数据集。在此，我们将 `flatten_nested=0`。

以下语句插入 1000 万行，因此执行可能需要几分钟。如果需要，请应用 `LIMIT`：

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

查询此数据需要访问请求字段作为数组。下面，我们总结在固定时间段内的错误和 HTTP 方法。

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

### 使用成对数组 {#using-pairwise-arrays}

成对数组在将 JSON 表示为字符串的灵活性和更结构化方法的性能之间提供了平衡。模式是灵活的，可以在根部潜在地添加任何新字段。然而，这需要显著更复杂的查询语法，并且不兼容嵌套结构。

例如，考虑以下表：

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

要向此表插入数据，我们需要将 JSON 结构化为键和值的列表。以下查询说明了使用 `JSONExtractKeysAndValues` 来实现这一点：

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

请注意，请求列以字符串表示的嵌套结构保持不变。我们可以将任何新键插入到根部。我们还可以在 JSON 本身中存在任意差异。要插入到我们的本地表中，请执行以下操作：

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

查询此结构需要使用 [`indexOf`](/sql-reference/functions/array-functions#indexofarr-x) 函数来识别所需键的索引（这应与值的顺序一致）。这可以用来访问值数组列，即 `values[indexOf(keys, 'status')]`。我们仍然需要一种 JSON 解析方法来处理请求列 - 在这种情况下，使用 `simpleJSONExtractString`。

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
