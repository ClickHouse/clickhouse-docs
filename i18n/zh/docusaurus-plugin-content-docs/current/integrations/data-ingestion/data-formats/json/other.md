
# 其他 JSON 建模方法

**以下是 ClickHouse 中建模 JSON 的替代方案。这些方法是为了完整性而记录的，并适用于 JSON 类型开发之前，因此在大多数用例中通常不推荐或不适用。**

:::note 应用对象级方法
可以将不同的技术应用于同一架构中的不同对象。例如，某些对象最好用 `String` 类型解决，而其他对象则用 `Map` 类型解决。请注意，一旦使用了 `String` 类型，就不需要做进一步的架构决策。相反，可以在 `Map` 键中嵌套子对象 - 包括表示 JSON 的 `String` - 如下所示：
:::

## 使用 String {#using-string}

如果对象是高度动态的，具有不可预测的结构并包含任意嵌套对象，则用户应使用 `String` 类型。可以使用 JSON 函数在查询时提取值，如下所示。

使用上述描述的结构化方法处理数据通常对那些具有动态 JSON 的用户不可行，这种 JSON 要么处于变化当中，要么其架构并不明确。为了绝对灵活性，用户可以简单地将 JSON 存储为 `String`，之后根据需要使用函数提取字段。这代表了将 JSON 作为结构化对象处理的极端对立面。此灵活性会带来显著的成本，主要是查询语法复杂性增加以及性能下降。

如上所述，对于 [原始人员对象](/integrations/data-formats/json/schema#static-vs-dynamic-json)，我们无法确保 `tags` 列的结构。我们插入原始行（包括 `company.labels`，当前忽略），将 `Tags` 列声明为 `String`：

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

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 函数可用于从此 JSON 中检索值。考虑以下简单示例：

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

请注意，函数需要同时引用 `String` 列 `tags` 和 JSON 中的路径以进行提取。嵌套路径需要函数嵌套，例如 `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`，这提取了 `tags.car.year` 列。通过 [`JSON_QUERY`](/sql-reference/functions/json-functions#json_query) 和 [`JSON_VALUE`](/sql-reference/functions/json-functions#json_value) 函数，可以简化嵌套路径的提取。

考虑 `arxiv` 数据集的极端情况，我们将整个主体视为 `String`。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

要插入此架构，我们需要使用 `JSONAsString` 格式：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

假设我们希望按年份计算发布的论文数量。对比以下仅使用字符串的查询与架构的 [结构化版本](/integrations/data-formats/json/inference#creating-tables)：

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

注意此处使用 XPath 表达式按方法过滤 JSON，即 `JSON_VALUE(body, '$.versions[0].created')`。

字符串函数的速度明显较慢（> 10x）相比显式类型转换和索引。上述查询始终需要完全表扫描和处理每一行。虽然这些查询在像这样的较小数据集上仍然会很快，但在较大数据集上的性能会下降。

这种方法的灵活性以明显的性能和语法成本为代价，应该仅用于架构中的高度动态对象。

### 简单 JSON 函数 {#simple-json-functions}

上述示例使用 JSON* 家族的函数。这些函数利用基于 [simdjson](https://github.com/simdjson/simdjson) 的完整 JSON 解析器，该解析器在解析方面严格，并且会区分在不同级别嵌套的相同字段。这些函数能够处理语法上正确但格式不良的 JSON，例如键之间的双空格。

提供了一组速度更快且更严格的函数。这些 `simpleJSON*` 函数通过严格假设 JSON 的结构和格式，提供了潜在的更好性能。具体而言：

- 字段名称必须是常量
- 字段名称编码一致，例如 `simpleJSONHas('{"abc":"def"}', 'abc') = 1`，但 `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- 字段名称在所有嵌套结构中是唯一的。对于多个匹配字段，不区分嵌套层级，匹配是无差别的。在多个匹配字段的情况下，将使用第一个出现的字段。
- 字符串文字之外不能有特殊字符。这包括空格。以下是无效的，将无法解析。

```json
{"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
"path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
```

而以下内容将正确解析：

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

上述查询使用 `simpleJSONExtractString` 提取 `created` 键，利用我们仅想要首次值（即发布日期）的事实。在此情况下，`simpleJSON*` 函数的限制是可以接受的，以换取性能上的收益。

## 使用 Map {#using-map}

如果该对象用于存储任意键，且大多数为一种类型，考虑使用 `Map` 类型。理想情况下，唯一键的数量不应超过几百个。对于具有子对象的对象，只要后者在类型上具有一致性，也可以考虑使用 `Map` 类型。一般而言，我们建议对标签和标记使用 `Map` 类型，例如日志数据中的 Kubernetes pod 标签。

虽然 `Map` 提供了一种简单的方式来表示嵌套结构，但它们有一些显著的限制：

- 所有字段必须为相同类型。
- 访问子列需要特殊的 map 语法，因为字段不存在作为列。整个对象 _是_ 一列。
- 访问子列会加载整个 `Map` 值，即所有兄弟及其各自的值。对于较大映射，这可能会导致显著的性能损失。

:::note 字符串键
在将对象建模为 `Map` 时，使用 `String` 键来存储 JSON 键名。因此，map 将始终为 `Map(String, T)`，其中 `T` 取决于数据。
:::

#### 原始值 {#primitive-values}

`Map` 的最简单应用是当对象的值包含相同的原始类型时。在大多数情况下，这涉及到使用 `String` 类型作为值 `T`。

考虑我们之前的 [人员 JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)，其中 `company.labels` 对象被确定为动态。重要的是，我们仅希望将类型为 String 的键值对添加到此对象中。因此，我们可以将其声明为 `Map(String, String)`：

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

在请求对象中查询这些字段需要使用 map 语法，例如：

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

现在可以使用一整套 `Map` 函数查询此时间，描述在 [这里](/sql-reference/functions/tuple-map-functions.md)。如果您的数据类型不一致，存在函数执行 [必要的类型转换](/sql-reference/functions/type-conversion-functions)。

#### 对象值 {#object-values}

如果对象具有子对象，且后者在类型上具有一致性，则也可以考虑使用 `Map` 类型。

假设我们 `persons` 对象的 `tags` 键需要一致的结构，每个 `tag` 的子对象都有 `name` 和 `time` 列。这样一个 JSON 文档的简化示例如下：

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

在这种情况下，通常很少采用 maps 的应用，建议将数据重建为动态键名没有子对象的形式。例如，上述内容可以重建为允许使用 `Array(Tuple(key String, name String, time DateTime))`。

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

[Nested 类型](/sql-reference/data-types/nested-data-structures/nested) 可用于建模静态对象，这些对象很少会发生变化，提供一种替代 `Tuple` 和 `Array(Tuple)` 的方法。我们通常建议避免对 JSON 使用此类型，因为其行为通常令人困惑。`Nested` 的主要好处是可以在排序键中使用子列。

下面，我们提供了一个使用 Nested 类型建模静态对象的示例。考虑以下简单的 JSON 日志条目：

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

我们可以将 `request` 键声明为 `Nested`。与 `Tuple` 类似，我们需要指定子列。

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

设置 `flatten_nested` 控制 nested 的行为。

#### flatten_nested=1 {#flatten_nested1}

值为 `1`（默认值）不支持任意层级的嵌套。使用此值，最简单的理解是将嵌套数据结构视为多个相同长度的 [Array](/sql-reference/data-types/array) 列。字段 `method`、`path` 和 `version` 在效果上都是独立的 `Array(Type)` 列，且有一个重要约束：**`method`、`path` 和 `version` 字段的长度必须相同。** 如果我们使用 `SHOW CREATE TABLE`，则可以说明这一点：

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

需要注意几点：

* 我们需要使用设置 `input_format_import_nested_json` 将 JSON 插入为嵌套结构。否则，我们需要将 JSON 展平，即：

```sql
INSERT INTO http FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
```
* 嵌套字段 `method`、`path` 和 `version` 需要作为 JSON 数组传递，即：

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

注意，使用 `Array` 作为子列意味着可以利用完整的 [Array 函数](/sql-reference/functions/array-functions)，包括 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 子句 - 对于您的列具有多个值时非常有用。

#### flatten_nested=0 {#flatten_nested0}

这允许任意层级的嵌套，并意味着嵌套列保持为单个 `Tuple` 数组 - 实质上它们变为与 `Array(Tuple)` 相同。

**这代表了首选方式，并且通常是使用 `Nested` 处理 JSON 的最简单方式。正如下文所示，只需确保所有对象为列表。**

下面，我们重新创建表并再次插入一行：

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

需要注意几点：

* 插入时不需要 `input_format_import_nested_json`。
* `SHOW CREATE TABLE` 中保留了 `Nested` 类型。在该列下，它实质上是一个 `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
* 因此，我们需要将 `request` 插入为数组，即：

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

再次可以使用点表示法查询列：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 示例 {#example}

可在 s3 中的公共存储桶中找到上述数据的更大示例：`s3://datasets-documentation/http/`。

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

鉴于 JSON 的约束和输入格式，我们通过以下查询插入该示例数据集。在此，我们设置 `flatten_nested=0`。

以下语句插入 1000 万行，因此可能需要几分钟才能执行。如果需要，请应用 `LIMIT`：

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

查询此数据需要我们将请求字段作为数组进行访问。以下，我们总结了固定时间段内的错误和 http 方法。

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

成对数组在将 JSON 作为字符串表示的灵活性与更结构化方法的性能之间提供了平衡。架构是灵活的，任何新字段都可以可能添加到根中。然而，这需要更复杂的查询语法，并且与嵌套结构不兼容。

作为示例，考虑以下表：

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

要向该表插入数据，我们需要将 JSON 结构化为键值对列表。以下查询说明了使用 `JSONExtractKeysAndValues` 实现此目的：

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

注意请求列仍然保持为字符串表示的嵌套结构。我们可以将任何新键插入根中。我们也可以在 JSON 本身中拥有任意差异。要插入到我们的本地表中，请执行以下操作：

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

查询此结构需要使用 [`indexOf`](/sql-reference/functions/array-functions#indexofarr-x) 函数来识别所需键的索引（应与值的顺序一致）。这可以用来访问值数组列，即 `values[indexOf(keys, 'status')]`。我们仍然需要请求列的 JSON 解析方法 - 在这种情况下，`simpleJSONExtractString`。 

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
