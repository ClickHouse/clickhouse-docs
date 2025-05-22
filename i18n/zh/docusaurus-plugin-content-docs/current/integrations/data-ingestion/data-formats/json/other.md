---
'title': '其他 JSON 方法'
'slug': '/integrations/data-formats/json/other-approaches'
'description': '建模 JSON 的其他方法'
'keywords':
- 'json'
- 'formats'
---


# 其他建模 JSON 的方法

**以下是 ClickHouse 中建模 JSON 的替代方案。这些方法是为了完整性而记录的，并且在 JSON 类型开发之前适用，因此在大多数用例中通常不推荐使用。**

:::note 应用对象级别的方法
在相同的模式中，可以对不同的对象应用不同的技术。例如，某些对象可以使用 `String` 类型解决，而其他对象则可以使用 `Map` 类型。请注意，一旦使用了 `String` 类型，则不需要做进一步的模式决定。相反，可以在 `Map` 键中嵌套子对象 - 包括一个表示 JSON 的 `String` - 正如我们下面所示：
:::

## 使用 String {#using-string}

如果对象高度动态，结构不可预测并包含任意嵌套对象，用户应使用 `String` 类型。可以在查询时使用 JSON 函数提取值，如下所示。

对于拥有动态 JSON 的用户，使用上述结构化方法处理数据通常不可行，这些 JSON 要么有可能会变化，要么其模式不易理解。为了获得绝对的灵活性，用户可以简单地将 JSON 作为 `String` 存储，然后使用函数根据需要提取字段。这代表了将 JSON 处理为结构化对象的极端对立面。这种灵活性带来了显著的缺陷 - 主要是查询语法复杂性的增加以及性能下降。

如前所述，对于 [原始人员对象](/integrations/data-formats/json/schema#static-vs-dynamic-json)，我们无法确保 `tags` 列的结构。我们插入原始行（包括 `company.labels`，我们暂时忽略），将 `Tags` 列声明为 `String`：

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

我们可以选择 `tags` 列，并看到 JSON 已作为字符串插入：

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 函数可用于检索此 JSON 中的值。考虑下面这个简单的例子：

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

请注意，这些函数需要同时引用 `String` 列 `tags` 和提取 JSON 的路径。嵌套路径要求函数嵌套，例如 `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`，它提取列 `tags.car.year`。通过函数 [`JSON_QUERY`](/sql-reference/functions/json-functions#json_query) 和 [`JSON_VALUE`](/sql-reference/functions/json-functions#json_value)，可以简化嵌套路径的提取。

考虑极端情况下的 `arxiv` 数据集，我们将整个正文视为 `String`。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

要插入此模式，我们需要使用 `JSONAsString` 格式：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

假设我们希望按年份统计发布的论文数量。对比使用字符串的以下查询与模式的 [结构化版本](/integrations/data-formats/json/inference#creating-tables)：

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

请注意，这里使用 XPath 表达式来根据方法过滤 JSON，即 `JSON_VALUE(body, '$.versions[0].created')`。

字符串函数明显比显式类型转换带索引慢 (> 10x)。上述查询始终需要完全扫描整个表并处理每一行。尽管在小数据集上这样的查询仍然会很快，但在更大型的数据集中，性能会降低。

这种方法的灵活性伴随着明显的性能和语法成本，仅应对高度动态的对象使用。

### 简单 JSON 函数 {#simple-json-functions}

上述示例使用了 JSON* 函数系列。它们利用了基于 [simdjson](https://github.com/simdjson/simdjson) 的完整 JSON 解析器，该解析器在解析时很严格，并将处于不同级别的相同字段加以区分。这些函数能够处理语法正确但格式不佳的 JSON，例如键之间的双空格字符。

还有一组更快且更严格的函数。这些 `simpleJSON*` 函数通过对 JSON 的结构和格式做出严格假设，提供潜在的优越性能。具体要求如下：

- 字段名必须为常量
- 字段名称编码一致，例如 `simpleJSONHas('{"abc":"def"}', 'abc') = 1`，而 `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- 字段名称在所有嵌套结构中是唯一的。对嵌套级别不做区分，匹配是无差别的。如果存在多个匹配字段，则使用第一个匹配的字段。
- 除了字符串文字外，不允许有特殊字符。这包括空格。以下是无效的，并且无法解析。

```json
{"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
"path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
```

而下面的将正确解析：

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

上述查询使用 `simpleJSONExtractString` 提取 `created` 键，利用我们只需获取已发布日期的第一个值。在这种情况下，`simpleJSON*` 函数的限制对性能提升是可接受的。

## 使用 Map {#using-map}

如果对象用于存储任意键，且大多数为同一类型，则考虑使用 `Map` 类型。理想情况下，唯一键的数量不应超过几百个。`Map` 类型也可以用于具有子对象的对象，前提是后者在其类型上具有一致性。一般来说，我们建议将 `Map` 类型用于标签和标签，例如日志数据中的 Kubernetes pod 标签。

虽然 `Map` 提供了一种简单的方式来表示嵌套结构，但他们有一些显著的限制：

- 所有字段必须是同一类型。
- 访问子列需要特殊的 Map 语法，因为这些字段不存在为列。整个对象 _是_ 一列。
- 访问子列会加载整个 `Map` 值，即所有兄弟和它们各自的值。对于较大的 Map，这可能会导致显著的性能惩罚。

:::note 字符串键
在将对象建模为 `Map` 时，使用 `String` 键来存储 JSON 键名称。因此 Map 将始终是 `Map(String, T)`，其中 `T` 取决于数据。
:::

#### 原始值 {#primitive-values}

`Map` 的最简单应用是当对象包含相同的原始类型作为值时。在大多数情况下，这涉及将 `String` 类型用于值 `T`。

考虑我们之前的 [人员 JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)，其中 `company.labels` 对象被确定为动态。重要的是，我们只期望将类型为 String 的键值对添加到这个对象中。因此，我们可以将其声明为 `Map(String, String)`：

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

我们可以插入我们原始的完整 JSON 对象：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

在请求对象中查询这些字段需要使用 Map 语法，例如：

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

此时可以使用完整的 `Map` 函数查询，详细描述见 [这里](/sql-reference/functions/tuple-map-functions.md)。如果您的数据没有一致的类型，则存在执行 [必要的类型强制转换](/sql-reference/functions/type-conversion-functions) 的函数。

#### 对象值 {#object-values}

`Map` 类型也可以考虑用于具有子对象的对象，只要后者在其类型上保持一致。

假设我们 `persons` 对象的 `tags` 键需要一致的结构，其中每个 `tag` 的子对象具有 `name` 和 `time` 列。这样 JSON 文档的简化示例如下：

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

这可以建模为 `Map(String, Tuple(name String, time DateTime))`，如下所示：

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

在这种情况下使用 Map 通常是罕见的，建议对数据进行重建，使动态键名不再有子对象。例如，上述内容可以重建为允许使用 `Array(Tuple(key String, name String, time DateTime))`。

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

## 使用 Nested {#using-nested}

[Nested 类型](/sql-reference/data-types/nested-data-structures/nested) 可用于建模静态对象，这些对象很少发生变化，提供了一种替代 `Tuple` 和 `Array(Tuple)` 的方案。我们一般建议避免将此类型用于 JSON，因为它的行为通常令人困惑。`Nested` 的主要优点是可以在排序键中使用子列。

下面，我们提供一个使用 Nested 类型建模静态对象的示例。考虑以下简单的 JSON 日志条目：

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

值为 `1`（默认值）不支持任意层级的嵌套。使用此值时，可以将嵌套数据结构视为多个 [Array](/sql-reference/data-types/array) 列，且长度相同。字段 `method`、`path` 和 `version` 实际上都是独立的 `Array(Type)` 列，并有一个关键约束：**`method`、`path` 和 `version` 字段的长度必须相同。** 如果使用 `SHOW CREATE TABLE`，将会得到如下示例：

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

下面，我们插入到此表中：

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

这里有几点重要事项：

* 我们需要使用 `input_format_import_nested_json` 设置将 JSON 作为嵌套结构插入。没有此设置，我们需要将 JSON 扁平化，即。

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

请注意，对子列使用的 `Array` 意味着可以充分利用全套 [Array 函数](/sql-reference/functions/array-functions)，包括 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 子句 - 如果您的列具有多个值，这将非常有用。

#### flatten_nested=0 {#flatten_nested0}

这允许任意层级的嵌套，并意味着嵌套列保持为单个 `Tuple` 的数组 - 实际上它们变成了 `Array(Tuple)` 的相同形式。

**这是使用 `Nested` 的首选方式，通常也是最简单的方式。如我们下面所示，它只要求所有对象都是一个列表。**

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

这里有几点重要事项：

* 不需要 `input_format_import_nested_json` 来插入。
* `SHOW CREATE TABLE` 中保留了 `Nested` 类型。该列的底层实质上是 `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
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

可以再次使用点表示法查询列：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 示例 {#example}

上述数据的大型示例可在 s3 的公共桶中找到：`s3://datasets-documentation/http/`。

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

考虑到 JSON 的约束和输入格式，我们使用以下查询插入此示例数据集。在这里，我们设置 `flatten_nested=0`。

以下语句插入了 1000 万行，因此此过程可能需要几分钟来执行。如有需要，请应用 `LIMIT`：

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

查询此数据需要我们将请求字段作为数组访问。下面，我们总结了固定时间段内的错误和 HTTP 方法。

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

成对数组提供了一种在将 JSON 表示为字符串的灵活性和更结构化方法的性能之间的平衡。模式是灵活的，因为可以潜在地向根添加任何新字段。然而，这需要显著更复杂的查询语法，并且与嵌套结构不兼容。

例如，考虑以下表：

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

要插入此表，我们需要将 JSON 构建为键值对的列表。以下查询说明了如何使用 `JSONExtractKeysAndValues` 来实现这一点：

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

注意请求列仍然作为字符串表示的嵌套结构。我们可以向根添加任何新键。我们还可以在 JSON 本身中有任意差异。要插入我们的本地表，请执行以下操作：

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

查询此结构需要使用 [`indexOf`](/sql-reference/functions/array-functions#indexofarr-x) 函数识别所需键的索引（该索引应与值的顺序一致）。这可以用于访问值数组列，即 `values[indexOf(keys, 'status')]`。我们仍然需要一个 JSON 解析方法用于请求列 - 在这种情况下为 `simpleJSONExtractString`。

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
