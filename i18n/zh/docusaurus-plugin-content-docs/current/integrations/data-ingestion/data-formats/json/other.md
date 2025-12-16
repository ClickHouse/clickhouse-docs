---
title: 'JSON 建模的其他方法'
slug: /integrations/data-formats/json/other-approaches
description: '对 JSON 建模的其他方法'
keywords: ['json', 'formats']
doc_type: 'reference'
---

# 对 JSON 建模的其他方法 {#other-approaches-to-modeling-json}

**以下是在 ClickHouse 中对 JSON 建模的替代方法。这些方法为了文档完整性而被记录下来，主要适用于 JSON 类型尚未出现之前的阶段，因此在大多数用例中通常不推荐使用或不再适用。**

:::note 采用对象级建模方法
在同一个 schema 中，可以对不同对象采用不同的技术。例如，一些对象最适合使用 `String` 类型，另一些则适合使用 `Map` 类型。请注意，一旦使用了 `String` 类型，就不再需要做进一步的 schema 决策。相反，我们也可以在 `Map` 的某个 key 下嵌套子对象——包括用 `String` 表示的 JSON——如下所示：
:::

## 使用 String 类型 {#using-string}

如果对象高度动态、没有可预测的结构并且包含任意嵌套对象，建议使用 `String` 类型。可以在查询时使用 JSON 函数提取值，如下所示。

对于那些使用动态 JSON 的用户来说，采用前文所述的结构化方式处理数据通常不可行，因为这些 JSON 要么会发生变化，要么其模式（schema）并不清晰。为了获得最大灵活性，用户可以简单地将 JSON 以 `String` 的形式存储，然后在需要时使用函数提取字段。这代表了与将 JSON 作为结构化对象处理相反的一种极端做法。这种灵活性是有代价的，存在显著缺点——主要是查询语法复杂性增加以及性能下降。

如前所述，对于[原始 person 对象](/integrations/data-formats/json/schema#static-vs-dynamic-json)，我们无法保证 `tags` 列的结构。我们插入原始记录（包括暂时忽略的 `company.labels`），并将 `Tags` 列声明为 `String`：

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

我们可以查询 `tags` 列，可以看到 JSON 已作为字符串被插入：

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 函数可用于从该 JSON 数据中提取值。请看下面这个简单示例：

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

请注意，这些函数既需要对 `String` 列 `tags` 的引用，也需要指定要从 JSON 中提取的路径。对于嵌套路径，需要将函数嵌套使用，例如 `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`，它会提取列 `tags.car.year` 的值。通过函数 [`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY) 和 [`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE) 可以简化对嵌套路径的提取。

再考虑一个极端情况：在 `arxiv` 数据集中，我们将整个正文（body）视为一个 `String`。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

要向该表插入数据，我们需要使用 `JSONAsString` 格式：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

假设我们希望按年份统计论文发表数量。对比如下两条查询语句：一条仅使用字符串，另一条使用该模式的[结构化版本](/integrations/data-formats/json/inference#creating-tables)：

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

请注意，这里使用了一个 XPath 表达式来按 method 字段过滤 JSON，即 `JSON_VALUE(body, '$.versions[0].created')`。

字符串函数比带索引的显式类型转换明显更慢（慢超过 10 倍）。上述查询始终需要对整张表进行全表扫描并处理每一行。尽管在像本例这样的小数据集上这些查询仍然很快，但在更大的数据集上性能会明显下降。

这种方法的灵活性带来了显著的性能和语法开销，只应在模式中对象高度动态的情况下使用。

### 简单 JSON 函数 {#simple-json-functions}

上面的示例使用了 JSON* 函数族。这些函数使用基于 [simdjson](https://github.com/simdjson/simdjson) 的完整 JSON 解析器，解析严格，并且会区分位于不同嵌套层级的同名字段。这些函数能够处理语法正确但格式不佳的 JSON，例如键之间存在双空格。

还提供了一组更快且更严格的函数。这些 `simpleJSON*` 函数通过对 JSON 的结构和格式做出严格假设，从而提供潜在的更佳性能。具体而言：

* 字段名必须是常量
* 字段名的编码必须一致，例如 `simpleJSONHas('{"abc":"def"}', 'abc') = 1`，但 `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
* 字段名在所有嵌套结构中必须唯一。不区分嵌套层级，匹配不加区分地进行。如果存在多个匹配字段，将使用首次出现的字段。
* 字符串字面量之外不能出现特殊字符，包括空格。下面的示例是无效的，无法被解析。

  ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

而下面的示例将会被正确解析：

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

返回 10 行。用时:0.964 秒。处理了 248 万行,4.21 GB(258 万行/秒,4.36 GB/秒)。
峰值内存使用:211.49 MiB。
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

Ok.

已插入 1 行。耗时：0.002 秒。
```

Querying these fields within the request object requires a map syntax e.g.:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

返回 1 行。用时：0.001 秒。

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

返回 1 行。用时：0.001 秒。
```

A full set of `Map` functions is available to query this time, described [here](/sql-reference/functions/tuple-map-functions.md). If your data is not of a consistent type, functions exist to perform the [necessary type coercion](/sql-reference/functions/type-conversion-functions).

#### Object values {#object-values}

The `Map` type can also be considered for objects which have sub-objects, provided the latter have consistency in their types.

Suppose the `tags` key for our `persons` object requires a consistent structure, where the sub-object for each `tag` has a `name` and `time` column. A simplified example of such a JSON document might look like the following:

```json
{
  "id": 1,
  "name": "Clicky McClickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": {
    "hobby": {
      "name": "潜水",
      "time": "2024-07-11 14:18:01"
    },
    "car": {
      "name": "特斯拉",
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

1 行数据。用时:0.002 秒。

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 行数据。用时:0.001 秒。
```

The application of maps in this case is typically rare, and suggests that the data should be remodelled such that dynamic key names do not have sub-objects. For example, the above could be remodelled as follows allowing the use of `Array(Tuple(key String, name String, time DateTime))`.

```json
{
  "id": 1,
  "name": "Clicky McClickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": [
    {
      "key": "hobby",
      "name": "潜水",
      "time": "2024-07-11 14:18:01"
    },
    {
      "key": "car",
      "name": "特斯拉",
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
-- 默认
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
        "HTTP/1.0"
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
结果集包含 1 行。执行耗时：0.002 秒。
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

-- 注意：Nested 类型已保留。
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
结果集包含 1 行。执行耗时：0.002 秒。
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

返回 1 行。用时：0.312 秒。
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

5 rows in set. Elapsed: 0.007 sec.
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

第 1 行:
──────
keys:   ['@timestamp','clientip','request','status','size']
values: ['893964617','40.135.0.0','{"method":"GET","path":"/images/hm_bg.jpg","version":"HTTP/1.0"}','200','24736']

返回 1 行。耗时: 0.416 秒。
```

Note how the request column remains a nested structure represented as a string. We can insert any new keys to the root. We can also have arbitrary differences in the JSON itself. To insert into our local table, execute the following:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
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

5 行结果。耗时：0.383 秒。已处理 8.22 百万行，1.97 GB（21.45 百万行/秒，5.15 GB/秒）。
峰值内存占用：51.35 MiB。

```
```
