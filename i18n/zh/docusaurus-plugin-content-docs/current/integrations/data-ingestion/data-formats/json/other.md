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

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 函数可以用来从该 JSON 中提取值。下面是一个简单示例：

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

要向该表插入数据时，我们需要使用 `JSONAsString` 格式：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```


假设我们希望按年份统计论文发表数量。对比如下两条查询语句：一条仅使用字符串，另一条使用该架构的[结构化版本](/integrations/data-formats/json/inference#creating-tables)：

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
* 字段名在所有嵌套结构中必须唯一。不区分嵌套层级，不加区分地进行匹配。如果存在多个匹配字段，将使用首次出现的字段。
* 字符串字面量之外不能出现特殊字符，包括空格。下面的示例是无效的，无法被解析。

  ```json
  {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
  "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
  ```

而下面的示例将会被正确解析：

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

上面的查询使用 `simpleJSONExtractString` 提取 `created` 键，利用了我们在发布日期上只需要第一个值这一点。在这种情况下，为了换取性能提升，可以接受 `simpleJSON*` 函数的这些限制。


## 使用 Map 类型 {#using-map}

如果对象用于存储任意键，并且这些键大多为同一类型，可以考虑使用 `Map` 类型。理想情况下，唯一键的数量不应超过数百个。对于包含子对象的对象，在这些子对象的类型足够统一的前提下，也可以考虑使用 `Map` 类型。一般来说，我们推荐使用 `Map` 类型来存储标签和标记（labels / tags），例如日志数据中的 Kubernetes pod（容器组）标签。

尽管 `Map` 提供了一种简单的方式来表示嵌套结构，但它也有一些显著的限制：

* 所有字段必须是相同的类型。
* 由于字段本身并不存在为列，因此访问子列需要使用特殊的 map 语法。整个对象本身*就是*一列。
* 访问某个子列会加载整个 `Map` 值，即所有同级字段及其对应的值。对于较大的 map，这可能会带来显著的性能损失。

:::note String keys
在将对象建模为 `Map` 时，使用 `String` 键来存储 JSON 键名。因此 map 始终是 `Map(String, T)`，其中 `T` 取决于数据。
:::

#### 原始类型值

`Map` 最简单的用法是对象将同一种原始类型作为值。在大多数情况下，这意味着对值 `T` 使用 `String` 类型。

回顾我们[前面的人物 JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)，其中 `company.labels` 对象被判定为动态。需要强调的是，我们只期望向该对象添加 String 类型的键值对。因此我们可以将其声明为 `Map(String, String)`：

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

我们可以插入原始的完整 JSON 对象：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

在请求对象中查询这些字段时，需要使用 map 语法，例如：

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

完整的 `Map` 函数集可用于对其进行查询，相关说明见[此处](/sql-reference/functions/tuple-map-functions.md)。如果你的数据类型不一致，可以使用相应函数执行[必要的类型强制转换](/sql-reference/functions/type-conversion-functions)。


#### 对象值

对于包含子对象的对象，如果这些子对象在类型上保持一致，也可以考虑使用 `Map` 类型。

假设 `persons` 对象中的 `tags` 键要求具有一致的结构，其中每个 `tag` 的子对象都有一个 `name` 和 `time` 列。此类 JSON 文档的简化示例如下所示：

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

这可以使用 `Map(String, Tuple(name String, time DateTime))` 进行建模，如下所示：

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

在这种情况下使用 Map 的做法并不常见，这通常意味着应重新设计数据模型，使具有动态键名的对象不再包含子对象。例如，可以将上述结构重新建模为如下形式，以便使用 `Array(Tuple(key String, name String, time DateTime))`。

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


## 使用 Nested 类型

[Nested 类型](/sql-reference/data-types/nested-data-structures/nested) 可用于表示很少发生变化的静态对象，可作为 `Tuple` 和 `Array(Tuple)` 的一种替代方案。我们通常建议避免在处理 JSON 时使用此类型，因为它的行为往往令人困惑。`Nested` 的主要优势在于其子列可以用于排序键。

下面我们给出一个使用 Nested 类型来表示静态对象的示例。考虑如下这个简单的 JSON 日志条目：

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

我们可以将 `request` 字段声明为 `Nested`。与 `Tuple` 类似，我们需要指定其中的子列。

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

`flatten_nested` 设置用于控制 `Nested` 类型的行为。

#### flatten&#95;nested=1

当值为 `1`（默认）时，不支持任意深度的嵌套。在该设置下，最简单的理解方式是：将嵌套数据结构视为多个长度相同的 [Array](/sql-reference/data-types/array) 列。字段 `method`、`path` 和 `version` 实际上分别是独立的 `Array(Type)` 列，但有一个关键约束：**`method`、`path` 和 `version` 字段的长度必须相同。** 如果使用 `SHOW CREATE TABLE`，就可以看到这一点：

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

接下来，我们向该表插入数据：

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

这里有几点需要特别注意：

* 我们需要启用配置项 `input_format_import_nested_json` 才能将 JSON 作为嵌套结构插入。否则，就必须先将 JSON 展平，例如：

  ```sql
  INSERT INTO http FORMAT JSONEachRow
  {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
  ```
* 嵌套字段 `method`、`path` 和 `version` 需要以 JSON 数组的形式传入，例如：

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

列可以使用点号表示法进行查询：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

请注意，将子列声明为 `Array` 意味着可以充分利用 [Array 函数](/sql-reference/functions/array-functions) 的全部能力，包括 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 子句——当列包含多个值时，这非常有用。


#### flatten&#95;nested=0

这允许任意级别的嵌套，并意味着嵌套列会保持为一个由 `Tuple` 组成的单个数组——实质上它们与 `Array(Tuple)` 相同。

**这是在配合 `Nested` 使用 JSON 时的首选方式，并且通常是最简单的方式。正如下文所示，它只要求所有对象以列表的形式组织起来。**

在下面的示例中，我们重新创建表并重新插入一行数据：

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

这里有几点重要说明：

* 在插入数据时，不需要设置 `input_format_import_nested_json`。
* `Nested` 类型会在 `SHOW CREATE TABLE` 中保留不变。从实现上看，这一列实际上是一个 `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
* 因此，我们必须将 `request` 作为数组插入，例如：

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

同样可以使用点号表示法来查询这些列：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```


### 示例

上述数据的更大规模示例可在 S3 的公共存储桶中获取，路径为：`s3://datasets-documentation/http/`。

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

鉴于 JSON 的约束条件和输入格式，我们使用如下查询插入此示例数据集。在这里，我们将 `flatten_nested` 设置为 0。

下面的语句会插入 1000 万行，因此执行可能需要几分钟时间。如有需要，请添加 `LIMIT`：

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

要查询这些数据，我们需要以数组形式访问请求字段。下面，我们将在固定时间段内汇总错误和 HTTP 方法。

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


### 使用成对数组

成对数组在将 JSON 表示为 `String` 的灵活性与更结构化方案的性能之间提供了一种折中。该模式比较灵活，因为可以在根级别添加任意新的字段。不过，这也需要明显更复杂的查询语法，并且与嵌套结构不兼容。

例如，考虑下列表：

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

要向此表中插入数据，我们需要将 JSON 结构化为键和值的列表。下面的查询演示了如何使用 `JSONExtractKeysAndValues` 来实现这一点：

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

请注意，`request` 列仍然是一个通过字符串表示的嵌套结构。我们可以在根级别插入任意新的键，JSON 本身也可以存在任意差异。要向本地表中插入数据，请执行以下操作：

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

要对这种结构进行查询，需要使用 [`indexOf`](/sql-reference/functions/array-functions#indexOf) 函数来确定所需键的索引（该索引应当与对应值的顺序保持一致）。然后即可用它来访问 values 数组列，即 `values[indexOf(keys, 'status')]`。我们仍然需要一种对 request 列进行 JSON 解析的方法——在这里使用的是 `simpleJSONExtractString`。

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
