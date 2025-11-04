---
'title': '其他 JSON 方法'
'slug': '/integrations/data-formats/json/other-approaches'
'description': '建模 JSON 的其他方法'
'keywords':
- 'json'
- 'formats'
'doc_type': 'reference'
---


# 其他建模 JSON 的方法

**以下是在 ClickHouse 中建模 JSON 的替代方法。这些方法是为了完整性而记录，并且在 JSON 类型开发之前适用，因此在大多数用例中通常不推荐或不适用。**

:::note 应用对象级别方法
不同的技术可以应用于同一模式中的不同对象。例如，有些对象最好使用 `String` 类型解决，而其他对象则使用 `Map` 类型。请注意，一旦使用了 `String` 类型，就不需要进一步做出模式决策。相反，可以在 `Map` 键中嵌套子对象 - 包括表示 JSON 的 `String` - 正如我们在下面展示的那样：
:::

## 使用 String 类型 {#using-string}

如果对象高度动态，没有可预测的结构并包含任意嵌套对象，用户应该使用 `String` 类型。可以在查询时使用 JSON 函数提取值，如我们下面所示。

使用上述结构化方法处理数据对于那些具有动态 JSON 的用户通常是不可行的，这类 JSON 可能会发生变化或者其模式并不明确。为了绝对的灵活性，用户可以简单地将 JSON 存储为 `String`，然后根据需要使用函数提取字段。这代表了将 JSON 作为结构化对象处理的极端相反方式。这种灵活性带来了显著的缺点 - 主要是查询语法复杂性的增加以及性能的下降。

正如前面提到的，对于 [原始人员对象](/integrations/data-formats/json/schema#static-vs-dynamic-json)，我们无法确保 `tags` 列的结构。我们插入原始行（包括 `company.labels`，我们暂时忽略），将 `Tags` 列声明为 `String`：

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

我们可以选择 `tags` 列，看到 JSON 已被插入为字符串：

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 函数可以用来从这个 JSON 中检索值。考虑以下简单示例：

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

注意这些函数同时需要引用 `String` 列 `tags` 和 JSON 中的路径进行提取。嵌套路径需要嵌套函数，例如 `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`，它提取列 `tags.car.year`。通过 [`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY) 和 [`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE) 函数，可以简化嵌套路径的提取。

考虑在 `arxiv` 数据集中将整个主体视为 `String` 的极端情况。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

为了插入到这个模式中，我们需要使用 `JSONAsString` 格式：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

假设我们希望按年份计算发布的论文数量。将以下仅使用字符串的查询与此模式的 [结构化版本](/integrations/data-formats/json/inference#creating-tables) 对比：

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

注意此处使用 XPath 表达式来按方法过滤 JSON，即 `JSON_VALUE(body, '$.versions[0].created')`。

字符串函数明显比使用索引的显式类型转换慢 (> 10 倍)。上述查询始终需要对整个表进行扫描并处理每一行。虽然在如上所示的小型数据集上这些查询仍然会很快，但在较大的数据集上性能会下降。

这种方法的灵活性以明显的性能和语法成本为代价，应该仅用于模式中高度动态的对象。

### 简单 JSON 函数 {#simple-json-functions}

上述示例使用了一系列 JSON* 函数。这些函数利用了基于 [simdjson](https://github.com/simdjson/simdjson) 的完整 JSON 解析器，该解析器具有严格的解析能力，并且能够区分在不同级别嵌套的相同字段。该函数能够处理语法正确但格式不良的 JSON，例如键之间的双空格。

有一组更快且更严格的函数可供使用。这些 `simpleJSON*` 函数通过对 JSON 的结构和格式做出严格假设，提供了潜在的性能优势。具体来说：

- 字段名称必须是常量
- 字段名称必须一致编码，例如 `simpleJSONHas('{"abc":"def"}', 'abc') = 1`，但 `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- 字段名称在所有嵌套结构中必须是唯一的。嵌套级别之间没有区别，匹配是无差别的。在多个匹配字段的情况下，使用第一个出现的字段。
- 除字符串字面量外，不允许有特殊字符。这包括空格。以下是无效的，不会被解析。

```json
{"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
"path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
```

而且，以下将正确解析：

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

上述查询使用 `simpleJSONExtractString` 提取 `created` 键，利用我们只想要发布日期的第一个值的事实。在这种情况下，`simpleJSON*` 函数的限制对于性能的提升是可以接受的。

## 使用 Map 类型 {#using-map}

如果对象用于存储任意键，大多数为一种类型，请考虑使用 `Map` 类型。理想情况下，唯一键的数量不应超过数百个。对于具有子对象的对象，也可以考虑使用 `Map` 类型，前提是后者的类型要统一。一般而言，我们建议将 `Map` 类型用于标签和标签，例如日志数据中的 Kubernetes pod 标签。

虽然 `Map` 提供了一种简单代表嵌套结构的方式，但它有一些显著的限制：

- 所有字段必须为相同类型。
- 访问子列需要特殊的映射语法，因为字段并不存在为列。整个对象 _是_ 一列。
- 访问子列会加载整个 `Map` 值，即所有兄弟及其各自的值。对于较大的 Maps，这可能导致显著的性能损失。

:::note 字符串键
当将对象建模为 `Map`s 时，使用 `String` 键来存储 JSON 键名。因此，映射将始终是 `Map(String, T)`，其中 `T` 取决于数据。
:::

#### 原始值 {#primitive-values}

`Map` 的最简单应用场景是当对象包含相同原始类型的值。在大多数情况下，这涉及到使用 `String` 类型作为值 `T`。

考虑我们之前的 [人员 JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)，其中 `company.labels` 对象被确定为动态。重要的是，我们只期望将类型为 String 的键值对添加到该对象。因此，我们可以将其声明为 `Map(String, String)`：

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

我们可以插入原始完整的 JSON 对象：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

在请求对象中查询这些字段需要使用映射语法，例如：

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

可以查询的完整 `Map` 函数可在 [此处](/sql-reference/functions/tuple-map-functions.md) 查找。如果你的数据不是一致的类型，可以使用函数进行 [必要的类型转换](/sql-reference/functions/type-conversion-functions)。

#### 对象值 {#object-values}

对于具有子对象的对象，`Map` 类型也可以被考虑，前提是后者具有类型一致性。

假设我们 `persons` 对象的 `tags` 键需要一个一致的结构，其中每个 `tag` 的子对象都有 `name` 和 `time` 列。这样 JSON 文档的简化示例如下：

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

在这种情况下，使用映射的情况通常是罕见的，这表明数据应重新建模，以便动态键名没有子对象。例如，上述内容可以重新建模为如下，使得使用 `Array(Tuple(key String, name String, time DateTime))` 成为可能。

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

## 使用 Nested 类型 {#using-nested}

[Nested 类型](/sql-reference/data-types/nested-data-structures/nested) 可用于建模静态对象，这些对象很少会发生变化，提供了 `Tuple` 和 `Array(Tuple)` 的替代方案。我们通常建议避免将此类型用于 JSON，因为其行为往往令人困惑。`Nested` 的主要好处是可以在排序键中使用子列。

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

设置 `flatten_nested` 控制嵌套的行为。

#### flatten_nested=1 {#flatten_nested1}

值为 `1`（默认值）不支持任意级别的嵌套。使用此值，最容易将嵌套数据结构视为多个长度相同的 [Array](/sql-reference/data-types/array) 列。字段 `method`、`path` 和 `version` 在效果上都是单独的 `Array(Type)` 列，并且有一个关键约束：**`method`、`path` 和 `version` 字段的长度必须相同。** 如果我们使用 `SHOW CREATE TABLE`，这将得到体现：

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

在下面，我们插入此表：

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

这里有几个重要要点需要注意：

* 我们需要使用设置 `input_format_import_nested_json` 将 JSON 作为嵌套结构插入。否则，我们需要将 JSON 压平，即。

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

列可以使用点表示法进行查询：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

注意子列使用 `Array` 意味着可以潜在地利用完整的 [Array 函数](/sql-reference/functions/array-functions)，包括 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 子句 - 如果你的列有多个值，这将非常有用。

#### flatten_nested=0 {#flatten_nested0}

这允许任意级别的嵌套，并意味着嵌套列保持为单个 `Tuple` 数组 - 实际上，它们变得与 `Array(Tuple)` 相同。

**这是使用 JSON 结合 `Nested` 的首选方式，通常也是最简单的方式。正如我们下面所示，它只要求所有对象都是列表。**

在下面，我们重新创建我们的表并重新插入一行：

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

这里有几个重要要点需要注意：

* 插入时不需要 `input_format_import_nested_json`。
* 在 `SHOW CREATE TABLE` 中保留了 `Nested` 类型。在此列下实际是 `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
* 因此，我们被要求将 `request` 插入为一个数组，即。

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

列再次可以使用点表示法进行查询：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 示例 {#example}

上述数据的较大示例可以在公共 S3 存储桶中找到，位于： `s3://datasets-documentation/http/`。

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

考虑到 JSON 的约束和输入格式，我们使用以下查询插入此样本数据集。在这里，我们将 `flatten_nested=0`。

以下语句插入 1000 万行，因此可能需要几分钟才能执行。如果需要，请应用 `LIMIT`：

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

查询这些数据要求我们将请求字段视为数组。下面，我们总结在固定时间段内的错误和 HTTP 方法。

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

### 使用成对数组 {#using-pairwise-arrays}

成对数组在将 JSON 表示为字符串的灵活性和更结构化方法的性能之间提供了平衡。这一模式灵活性体现在根节点可以潜在添加任何新字段。然而，这需要显著更复杂的查询语法，并且不兼容嵌套结构。

作为示例，考虑以下表：

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

要插入到此表中，我们需要将 JSON 结构化为键值对列表。以下查询说明了如何使用 `JSONExtractKeysAndValues` 来实现这一点：

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

注意请求列仍作为嵌套结构表示为字符串。我们可以将任何新键插入到根。我们还可以在 JSON 本身中有任意差异。要插入到我们的本地表中，执行以下操作：

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

查询此结构需要使用 [`indexOf`](/sql-reference/functions/array-functions#indexOf) 函数来识别所需键的索引（这应该与值的顺序一致）。这可用于访问值数组列，即 `values[indexOf(keys, 'status')]`。我们仍然需要为请求列使用 JSON 解析方法 - 在这种情况下，`simpleJSONExtractString`。
