---
title: '其他 JSON 方法'
slug: /integrations/data-formats/json/other-approaches
description: 'JSON 建模的其他方式'
keywords: ['json', 'formats']
doc_type: 'reference'
---



# 建模 JSON 的其他方法

**以下内容是 ClickHouse 中建模 JSON 的一些替代方案。这些方案出于文档完整性的考虑而记录下来，主要适用于 JSON 类型尚未推出之前的阶段，因此在大多数使用场景下通常不推荐使用或已不再适用。**

:::note 采用对象级建模方式
在同一个 schema 中，不同的对象可以采用不同的建模技术。例如，某些对象使用 `String` 类型效果最佳，而其他对象则更适合使用 `Map` 类型。请注意，一旦选择使用 `String` 类型，就不再需要做其他 schema 层面的决策。相反，我们也可以在 `Map` 的键下嵌套子对象——包括用 `String` 表示的 JSON——如下文所示：
:::



## 使用 String 类型 {#using-string}

如果对象高度动态、结构不可预测且包含任意嵌套对象,用户应使用 `String` 类型。可以在查询时使用 JSON 函数提取值,如下所示。

对于动态 JSON 数据,使用上述结构化方法处理通常不可行,因为这些 JSON 可能会发生变化或其模式尚不明确。为了获得最大的灵活性,用户可以简单地将 JSON 存储为 `String`,然后根据需要使用函数提取字段。这代表了处理 JSON 的另一个极端,与将其作为结构化对象处理完全相反。这种灵活性会带来显著的代价——主要是查询语法复杂性增加以及性能下降。

如前所述,对于[原始 person 对象](/integrations/data-formats/json/schema#static-vs-dynamic-json),我们无法确保 `tags` 列的结构。我们插入原始行(包括暂时忽略的 `company.labels`),将 `tags` 列声明为 `String`:

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

我们可以查询 `tags` 列,可以看到 JSON 已作为字符串插入:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

可以使用 [`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 函数从此 JSON 中提取值。请看下面的简单示例:

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

注意这些函数需要同时引用 `String` 列 `tags` 和要提取的 JSON 路径。嵌套路径需要嵌套函数,例如 `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')` 用于提取 `tags.car.year` 列。可以通过 [`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY) 和 [`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE) 函数简化嵌套路径的提取。

考虑 `arxiv` 数据集的极端情况,我们将整个内容视为 `String`。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

要插入到此模式中,我们需要使用 `JSONAsString` 格式:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```


假设我们希望按年份统计发布的论文数量。对比以下仅使用字符串的查询与使用[结构化版本](/integrations/data-formats/json/inference#creating-tables)模式的查询:

```sql
-- 使用结构化模式
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

返回 10 行。耗时:0.264 秒。处理了 231 万行,153.57 MB(875 万行/秒,582.58 MB/秒)。

-- 使用非结构化字符串

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

返回 10 行。耗时:1.281 秒。处理了 249 万行,4.22 GB(194 万行/秒,3.29 GB/秒)。
峰值内存使用:205.98 MiB。
```

注意这里使用 XPath 表达式来过滤 JSON,即 `JSON_VALUE(body, '$.versions[0].created')`。

字符串函数明显慢于使用索引的显式类型转换(慢 10 倍以上)。上述查询始终需要全表扫描并处理每一行。虽然在像这样的小数据集上这些查询仍然很快,但在较大的数据集上性能会下降。

这种方法的灵活性以明显的性能和语法成本为代价,应仅用于模式中高度动态的对象。

### 简单 JSON 函数 {#simple-json-functions}

上述示例使用 JSON\* 系列函数。这些函数使用基于 [simdjson](https://github.com/simdjson/simdjson) 的完整 JSON 解析器,解析严格,能够区分嵌套在不同层级的相同字段。这些函数能够处理语法正确但格式不规范的 JSON,例如键之间有多个空格。

还有一组更快且更严格的函数可用。这些 `simpleJSON*` 函数通过对 JSON 的结构和格式做出严格假设,可能提供更优的性能。具体来说:

- 字段名必须是常量
- 字段名编码必须一致,例如 `simpleJSONHas('{"abc":"def"}', 'abc') = 1`,但 `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- 字段名在所有嵌套结构中必须唯一。不区分嵌套层级,匹配不加区分。如果有多个匹配字段,使用第一次出现的字段。
- 字符串字面量之外不能有特殊字符,包括空格。以下内容无效且无法解析。

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

而以下内容将正确解析:


````json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}

在某些情况下,如果性能至关重要且您的 JSON 满足上述要求,使用这些函数可能是合适的。以下示例展示了使用 `simpleJSON*` 函数重写的前面的查询:

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

返回 10 行。耗时:0.964 秒。处理了 248 万行,4.21 GB(258 万行/秒,4.36 GB/秒)。
峰值内存使用量:211.49 MiB。
````

上面的查询使用 `simpleJSONExtractString` 提取 `created` 键，利用了这样一个事实：对于发布时间我们只需要第一个值。在这种情况下，为了获得性能提升，`simpleJSON*` 函数的这些限制是可以接受的。


## 使用 Map 类型 {#using-map}

如果对象用于存储任意键，且大多数键为同一类型,建议使用 `Map` 类型。理想情况下,唯一键的数量不应超过几百个。`Map` 类型也适用于包含子对象的对象,前提是子对象的类型保持一致。通常,我们建议将 `Map` 类型用于标签和标记,例如日志数据中的 Kubernetes pod 标签。

尽管 `Map` 提供了一种简单的方式来表示嵌套结构,但它们有一些显著的限制:

- 所有字段必须是相同类型。
- 访问子列需要特殊的 map 语法,因为这些字段不作为列存在。整个对象_本身_就是一个列。
- 访问子列会加载整个 `Map` 值,即所有同级元素及其各自的值。对于较大的 map,这可能导致显著的性能损失。

:::note String 键
将对象建模为 `Map` 时,使用 `String` 键来存储 JSON 键名。因此 map 始终为 `Map(String, T)`,其中 `T` 取决于数据。
:::

#### 原始值 {#primitive-values}

`Map` 最简单的应用场景是对象包含相同原始类型的值。在大多数情况下,这涉及使用 `String` 类型作为值 `T`。

考虑我们[之前的 person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json),其中 `company.labels` 对象被确定为动态的。重要的是,我们只期望将 String 类型的键值对添加到此对象中。因此我们可以将其声明为 `Map(String, String)`:

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

我们可以插入原始的完整 JSON 对象:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

查询对象中的这些字段需要使用 map 语法,例如:

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

可以使用完整的 `Map` 函数集来查询,详见[此处](/sql-reference/functions/tuple-map-functions.md)。如果您的数据类型不一致,可以使用函数执行[必要的类型转换](/sql-reference/functions/type-conversion-functions)。

#### 对象值 {#object-values}

`Map` 类型也适用于包含子对象的对象,前提是子对象的类型保持一致。

假设我们的 `persons` 对象的 `tags` 键需要一致的结构,其中每个 `tag` 的子对象都有 `name` 和 `time` 列。这样的 JSON 文档的简化示例可能如下所示:


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

这可以通过如下所示的 `Map(String, Tuple(name String, time DateTime))` 来建模：

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

在这种场景下使用 `Map` 通常较为少见，这也表明应该对数据进行重新建模，使具有动态键名的字段不再包含子对象。例如，可以将上述结构重新建模为如下形式，从而可以使用 `Array(Tuple(key String, name String, time DateTime))`。

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
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


## 使用 Nested 类型 {#using-nested}

[Nested 类型](/sql-reference/data-types/nested-data-structures/nested)可用于对很少变化的静态对象进行建模,是 `Tuple` 和 `Array(Tuple)` 的替代方案。我们通常不建议将此类型用于 JSON,因为其行为往往令人困惑。`Nested` 的主要优势在于其子列可以用于排序键。

下面我们提供一个使用 Nested 类型对静态对象进行建模的示例。考虑以下简单的 JSON 日志条目:

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

我们可以将 `request` 键声明为 `Nested`。与 `Tuple` 类似,我们需要指定子列。

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

设置 `flatten_nested` 控制嵌套类型的行为。

#### flatten_nested=1 {#flatten_nested1}

值为 `1`(默认值)时不支持任意级别的嵌套。使用此值时,最容易将嵌套数据结构理解为多个长度相同的 [Array](/sql-reference/data-types/array) 列。字段 `method`、`path` 和 `version` 实际上都是独立的 `Array(Type)` 列,但有一个关键约束:**`method`、`path` 和 `version` 字段的长度必须相同。** 使用 `SHOW CREATE TABLE` 可以看到这一点:

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

下面我们向此表插入数据:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

这里需要注意几个重要点:

- 我们需要使用设置 `input_format_import_nested_json` 将 JSON 作为嵌套结构插入。如果不使用此设置,我们需要展平 JSON,即:

  ```sql
  INSERT INTO http FORMAT JSONEachRow
  {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
  ```

- 嵌套字段 `method`、`path` 和 `version` 需要作为 JSON 数组传递,即:

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

可以使用点表示法查询列:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```


注意,对子列使用 `Array` 意味着可以充分利用全套 [Array 函数](/sql-reference/functions/array-functions),包括 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 子句——当列包含多个值时非常有用。

#### flatten_nested=0 {#flatten_nested0}

这允许任意级别的嵌套,使嵌套列保持为单个 `Tuple` 数组——实际上它们等同于 `Array(Tuple)`。

**这是将 JSON 与 `Nested` 配合使用的首选方式,通常也是最简单的方式。如下所示,它只要求所有对象都是列表形式。**

下面,我们重新创建表并重新插入一行数据:

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

-- 注意 Nested 类型得以保留。
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

这里有几个重要注意事项:

- 插入时无需设置 `input_format_import_nested_json`。
- `SHOW CREATE TABLE` 中保留了 `Nested` 类型。该列底层实际上是 `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`
- 因此,我们需要将 `request` 作为数组插入,即:

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

可以继续使用点表示法查询列:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
返回 1 行。耗时:0.002 秒。
```

### 示例 {#example}

上述数据的更大规模示例可在 S3 公共存储桶中获取:`s3://datasets-documentation/http/`。

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

返回 1 行。耗时:0.312 秒。
```

考虑到 JSON 的约束条件和输入格式,我们使用以下查询插入此示例数据集。这里设置 `flatten_nested=0`。

以下语句将插入 1000 万行数据,因此可能需要几分钟才能执行完成。如有需要可添加 `LIMIT`:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

查询此数据需要将 request 字段作为数组访问。下面,我们汇总固定时间段内的错误和 HTTP 方法。


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

成对数组在将 JSON 表示为字符串的灵活性与更结构化方法的性能之间提供了平衡。该模式的灵活性在于可以将任何新字段添加到根级别。但是,这需要更复杂的查询语法,并且与嵌套结构不兼容。

例如,考虑以下表:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

要向此表插入数据,我们需要将 JSON 结构化为键和值的列表。以下查询演示了如何使用 `JSONExtractKeysAndValues` 来实现此目的:

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

注意 request 列如何保持为以字符串表示的嵌套结构。我们可以向根级别插入任何新键。我们还可以在 JSON 本身中包含任意差异。要向本地表插入数据,请执行以下操作:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

查询此结构需要使用 [`indexOf`](/sql-reference/functions/array-functions#indexOf) 函数来识别所需键的索引(该索引应与值的顺序一致)。这可用于访问 values 数组列,即 `values[indexOf(keys, 'status')]`。我们仍然需要对 request 列使用 JSON 解析方法 - 在本例中为 `simpleJSONExtractString`。

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


共 5 行。耗时：0.383 秒。已处理 8.22 百万行，1.97 GB（21.45 百万行/秒，5.15 GB/秒）
峰值内存使用：51.35 MiB。

```
```
