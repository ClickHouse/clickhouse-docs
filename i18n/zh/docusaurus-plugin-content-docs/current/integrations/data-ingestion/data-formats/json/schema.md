---
title: 设计 JSON 架构
slug: /integrations/data-formats/json/schema
description: 如何优化设计 JSON 架构
keywords: [json, clickhouse, inserting, loading, formats, schema]
---

# 设计你的架构

虽然可以使用 [schema inference](/integrations/data-formats/json/inference) 来建立 JSON 数据的初始架构并在原地查询 JSON 数据文件，例如在 S3 中，但用户应旨在为他们的数据建立一个优化的版本化架构。我们将在下面讨论建模 JSON 结构的选项。
## 尽可能提取 {#extract-where-possible}

如果可能，建议用户将频繁查询的 JSON 键提取到架构根部的列中。这不仅简化了查询语法，还允许用户在需要时在 `ORDER BY` 子句中使用这些列，或指定一个 [secondary index](/optimize/skipping-indexes)。

考虑在指南 [**JSON schema inference**](/integrations/data-formats/json/inference) 中探讨的 [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download):

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "With disks and networks providing gigabytes per second ....\n",
  "versions": [
    {
      "created": "Mon, 11 Jan 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Sat, 30 Jan 2021 23:57:29 GMT",
      "version": "v2"
    }
  ],
  "update_date": "2022-11-07",
  "authors_parsed": [
    [
      "Lemire",
      "Daniel",
      ""
    ]
  ]
}
```

假设我们希望将 `versions.created` 的第一个值作为主要排序键 - 理想情况下命名为 `published_date`。这应该在插入前提取或在插入时使用 ClickHouse 的 [materialized views](/docs/materialized-view/incremental-materialized-view) 或 [materialized columns](/sql-reference/statements/alter/column#materialize-column)。

物化列代表了在查询时提取数据的最简单方法，如果提取逻辑可以被捕获为简单的 SQL 表达式则被优先选择。作为示例，`published_date` 可以作为物化列添加到 arXiv 架构中，并定义为排序键，如下所示：

```sql
CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `journal-ref` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String)),
    `published_date` DateTime DEFAULT parseDateTimeBestEffort(versions[1].1)
)
ENGINE = MergeTree
ORDER BY published_date
```

<!--TODO: Find a better way-->
:::note 嵌套的列表达式
上述需要我们使用 `versions[1].1` 的符号来访问元组，按位置引用 `created` 列，而不是首选的语法 `versions.created_at[1]`。
:::

在加载数据时，该列将被提取：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
0 rows in set. Elapsed: 39.827 sec. Processed 2.52 million rows, 1.39 GB (63.17 thousand rows/s., 34.83 MB/s.)

SELECT published_date
FROM arxiv_2
LIMIT 2
┌──────published_date─┐
│ 2007-03-31 02:26:18 │
│ 2007-03-31 03:16:14 │
└─────────────────────┘

2 rows in set. Elapsed: 0.001 sec.
```

:::note 物化列行为
物化列的值总是在插入时计算，不能在 `INSERT` 查询中指定。物化列默认不会在 `SELECT *` 中返回。这是为了保持 `SELECT *` 的结果可以始终使用 INSERT 插回表中的不变性。可以通过设置 `asterisk_include_materialized_columns=1` 禁用此行为。
:::

对于更复杂的过滤和转换任务，建议使用 [materialized views](/materialized-view/incremental-materialized-view)。
## 静态与动态 JSON {#static-vs-dynamic-json}

定义 JSON 架构的主要任务是确定每个键值的适当类型。我们建议用户递归地对 JSON 层级中的每个键应用以下规则，以确定每个键的适当类型。

1. **原始类型** - 如果键的值是原始类型，不论它是嵌套对象的一部分还是根部，确保根据一般的架构 [design best practices](/data-modeling/schema-design) 和 [type optimization rules](/data-modeling/schema-design#optimizing-types) 选择其类型。原始值的数组，例如下面的 `phone_numbers`，可以建模为 `Array(<type>)`，例如 `Array(String)`。
2. **静态与动态** - 如果键的值是复杂对象，即对象或对象数组，确定其是否会发生变化。那些很少有新键的对象，预计新增键可以通过 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 的架构变化进行处理的，可以认为是 **静态** 的。这包括有些 JSON 文档可能仅提供部分键的对象。频繁添加新键和/或不可预测的对象应视为 **动态**。要判断一个值是 **静态** 还是 **动态**，请参见相关章节 [**Handling static objects**](/integrations/data-formats/json/schema#handling-static-objects) 和 [**Handling dynamic objects**](/integrations/data-formats/json/schema#handling-dynamic-objects) 。

<p></p>

**重要:** 上述规则应递归应用。如果键的值被确定为动态，则无需进一步评估，可以遵循 [**Handling dynamic objects**](/integrations/data-formats/json/schema#handling-dynamic-objects) 中的指南。如果对象是静态的，则继续评估子键，直到键值为原始值或遇到动态键。

为了说明这些规则，我们使用以下 JSON 示例表示一个人：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics",
    "labels": {
      "type": "database systems",
      "founded": "2021"
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "Databases",
    "holidays": [
      {
        "year": 2024,
        "location": "Azores, Portugal"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

应用这些规则：

- 根键 `name`、`username`、`email`、`website` 可以表示为类型 `String`。列 `phone_numbers` 是类型为 `Array(String)` 的原始数组，`dob` 和 `id` 类型分别为 `Date` 和 `UInt32`。
- 新键不会添加到 `address` 对象中（仅新地址对象），因此可以被认为是 **静态**。如果我们递归，则所有子列都可以被认为是原始值（类型为 `String`），除了 `geo`。这是一个静态结构，具有两个 `Float32` 列，`lat` 和 `lon`。
- `tags` 列是 **动态** 的。我们假设可以向此对象中添加新的任意标签，类型和结构可以不同。
- `company` 对象是 **静态**，且始终最多包含3个指定的键。子键 `name` 和 `catchPhrase` 的类型为 `String`。键 `labels` 是 **动态** 的。我们假设可以在该对象中添加新的任意标签。值将始终为类型字符串的键值对。
## 处理静态对象 {#handling-static-objects}

我们建议使用命名元组，即 `Tuple`，来处理静态对象。对象数组可以通过使用元组数组来保存，即 `Array(Tuple)`。在元组内部，应使用相同的规则定义列及其各自的类型。这可能导致嵌套的元组表示嵌套对象，如下所示。

为了说明这一点，我们使用之前的 JSON 人示例，省略动态对象：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

该表的架构如下所示：

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
    `dob` Date
)
ENGINE = MergeTree
ORDER BY username
```

注意 `company` 列被定义为 `Tuple(catchPhrase String, name String)`。`address` 字段使用 `Array(Tuple)`，其中嵌套的 `Tuple` 表示 `geo` 列。

JSON 可以以其当前结构插入到该表中：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

在我们的上例中，我们有最小的数据，但如下所示，我们可以通过其句点分隔的名称查询元组字段。

```sql
SELECT
    address.street,
    company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

注意 `address.street` 列作为 `Array` 返回。要按位置访问数组中的特定对象，应在列名后指定数组偏移量。例如，要访问第一个地址的街道：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

元组的主要缺点是子列不能用于排序键。因此，以下操作将失败：

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
    `dob` Date
)
ENGINE = MergeTree
ORDER BY company.name

Code: 47. DB::Exception: Missing columns: 'company.name' while processing query: 'company.name', required columns: 'company.name' 'company.name'. (UNKNOWN_IDENTIFIER)
```

:::note 元组在排序键中的应用
虽然元组列不能用于排序键，但整个元组可以使用。虽然这样做是可能的，但这很少有意义。
:::
### 处理默认值 {#handling-default-values}

即使 JSON 对象结构化，通常也只有已知键的子集提供，导致稀疏的情况。幸运的是，`Tuple` 类型不需要 JSON 负载中的所有列。如果未提供，将使用默认值。

考虑我们之前的 `people` 表和以下稀疏 JSON，缺少 `suite`、`geo`、`phone_numbers` 和 `catchPhrase` 这些键。

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771"
    }
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse"
  },
  "dob": "2007-03-31"
}
```

我们可以看到，下面这一行可以成功插入：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

查询这一行时，可以看到默认值被用作省略的列（包括子对象）：

```sql
SELECT *
FROM people
FORMAT PrettyJSONEachRow

{
    "id": "1",
    "name": "Clicky McCliickHouse",
    "username": "Clicky",
    "email": "clicky@clickhouse.com",
    "address": [
        {
            "city": "Wisokyburgh",
            "geo": {
                "lat": 0,
                "lng": 0
            },
            "street": "Victor Plains",
            "suite": "",
            "zipcode": "90566-7771"
        }
    ],
    "phone_numbers": [],
    "website": "clickhouse.com",
    "company": {
        "catchPhrase": "",
        "name": "ClickHouse"
    },
    "dob": "2007-03-31"
}

1 row in set. Elapsed: 0.001 sec.
```

:::note 区分空值和缺失值
如果用户需要区分值是否为空和未提供，可使用 [Nullable](/sql-reference/data-types/nullable) 类型。然而，这 [应避免](/cloud/bestpractices/avoid-nullable-columns)，除非绝对必要，因为它会对这些列的存储和查询性能产生负面影响。
:::
### 处理新列 {#handling-new-columns}

虽然当 JSON 键是静态时，结构化方法是最简单的，但如果架构变化是可计划的，例如新键的已知变化，则仍可以使用此方法。

请注意，默认情况下 ClickHouse 将忽略 JSON 负载中提供但不在架构中的 JSON 键。考虑以下修改的 JSON 负载，添加了 `nickname` 键：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "nickname": "Clicky",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

这个 JSON 可以成功插入，同时 `nickname` 键将被忽略：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

可以使用 [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) 命令向架构添加列。可以通过 `DEFAULT` 子句指定默认值，如果在后续插入时未指定，则将使用该默认值。对于这些值不存在的行（因为它们在创建之前被插入），也将返回该默认值。如果未指定 `DEFAULT` 值，将使用该类型的默认值。

例如：

```sql
-- insert initial row (nickname will be ignored)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- add column
ALTER TABLE people
    (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- insert new row (same data different id)
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- select 2 rows
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```
## 处理动态对象 {#handling-dynamic-objects}

处理动态对象有两种推荐的方法：

- [Map(String,V)](/sql-reference/data-types/map) 类型
- [String](/sql-reference/data-types/string) 结合 JSON 函数

可以应用以下规则来确定最合适的方法。

1. 如果对象高度动态，具有不可预测的结构，并包含任意嵌套对象，用户应使用 `String` 类型。可以在查询时使用 JSON 函数提取值，如我们在下面展示的。
2. 如果对象用于存储任意键，多为同一类型，则考虑使用 `Map` 类型。理想情况下，唯一键的数量不应超过几百个。对于具有子对象的对象，提供后一者有类型统一性，`Map` 类型也可以考虑使用。一般来说，我们建议将 `Map` 类型用于标签和标记，例如 Kubernetes 的日志数据中的 pod 标签。

<br />

:::note 应用对象级别的方法
不同的技术可以应用于同一架构中的不同对象。一些对象可以通过 `String` 解决得更好，而另一些则可以通过 `Map` 解决。请注意，一旦使用了 `String` 类型，就不需要做进一步的架构决策。相反，可以在 `Map` 键中嵌套子对象，如下所示 - 包括表示 JSON 的 `String`。
:::
### 使用 String {#using-string}

使用上述结构化方法处理数据通常对那些具有动态 JSON 的用户不可行，这些 JSON 受到变化或对其架构理解不清。当绝对需要灵活性时，用户可以简单地将 JSON 存储为 `String`，然后使用函数按需提取字段。这代表了处理 JSON 作为结构化对象的极端对立面。这种灵活性会带来显著的成本，主要是查询语法复杂性增加以及性能降级。

如前所述，对于 [原始人对象](/integrations/data-formats/json/schema#static-vs-dynamic-json)，我们无法确保 `tags` 列的结构。我们插入原始行（我们还包括 `company.labels`，目前将其忽略），将 `Tags` 列声明为 `String`：

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

我们可以选择 `tags` 列，看到 JSON 已作为字符串插入：

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[JSONExtract](/sql-reference/functions/json-functions#jsonextract-functions) 函数可用于从此 JSON 中检索值。考虑下面的简单示例：

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

注意，函数需要同时引用 `String` 列 `tags` 和 JSON 中的路径以进行提取。嵌套路径需要嵌套函数，例如：`JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')` 提取列 `tags.car.year`。通过 [JSON_QUERY](/sql-reference/functions/json-functions#json_query) 和 [JSON_VALUE](/sql-reference/functions/json-functions#json_value) 函数可以简化嵌套路径的提取。

考虑在 arxiv 数据集的极端案例中，我们将整个正文视为 `String`。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

要插入到此架构中，我们需要使用 `JSONAsString` 格式：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

假设我们希望按年份统计发布的论文数量。对比结构化版本的架构与仅使用字符串的查询：

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

注意这里使用了 XPath 表达式通过方法过滤 JSON，即：`JSON_VALUE(body, '$.versions[0].created')`。

字符串函数明显较慢（> 10x）于带索引的显式类型转换。这些查询总是需要完整的表扫描并处理每一行。尽管在如此小的数据集上这些查询仍然会很快，但在更大的数据集上性能会下降。

这种方法的灵活性显然会带来性能和语法的成本，应仅在架构中用于高度动态的对象。
#### 简单 JSON 函数 {#simple-json-functions}

上述示例使用了 JSON* 族的函数。这些函数利用基于 [simdjson](https://github.com/simdjson/simdjson) 的完整 JSON 解析器，严格解析，并区分在不同层级嵌套的相同字段。这些函数能够处理语法正确但格式不良的 JSON，例如键之间的双空格。

还有一组更快且更严格的函数可用。这些 `simpleJSON*` 函数通过对 JSON 的结构和格式做出严格假设，提供潜在的卓越性能。具体而言：

* 字段名称必须是常量
* 字段名称的一致编码，例如 `simpleJSONHas('{"abc":"def"}', 'abc') = 1`，但 `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
* 在所有嵌套结构中，字段名称都是唯一的。未区分嵌套级别，匹配是无差别的。如果有多个匹配字段，则使用第一个出现的。
* 在字符串文字之外没有特殊字符。这包括空格。以下是无效的，将不会解析：

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

    而下面的将正确解析：

    ```json
    {"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
    ```

在某些情况下，如果性能至关重要，并且你的 JSON 满足上述要求，这些函数可能是适当的。下面是将之前的查询重写为使用 `simpleJSON*` 函数的示例：

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
```

上述使用了 `simpleJSONExtractString` 提取 `created` 键，利用我们只需第一个值作为出版日期的事实。在这个情况下，`simpleJSON*` 函数的限制是可以接受的，因为获得了性能上的提升。
### 使用 Map {#using-map}

如果对象用于存储主要是同一类型的任意键，考虑使用 `Map` 类型。理想情况下，唯一键的数量不应超过几百个。我们建议将 `Map` 类型用于标签和标记，例如 Kubernetes pod 标签在日志数据中。虽然这种方式提供了表示嵌套结构的简单方法，但 `Map` 有一些显著的限制：

- 字段必须都是同一类型。
- 访问子列需要特殊的 map 语法，因为字段并不存在作为列；整个对象是一个列。
- 访问子列会加载整个 `Map` 值，即所有同级及其各自值。对于更大的 map，这可能导致显著的性能惩罚。

:::note 字符串键
在将对象建模为 `Map` 时，使用 `String` 键来存储 JSON 键名称。因此，map 将始终是 `Map(String, T)`，其中 `T` 取决于数据。
:::
#### 原始值 {#primitive-values}

`Map` 的最简单应用是当对象的值包含相同的原始类型。在大多数情况下，这涉及使用 `String` 类型作为值 `T`。

考虑我们之前提到的 [人 JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)，其中 `company.labels` 对象被确定为动态的。重要的是，我们只希望将类型为 String 的键值对添加到此对象。因此，我们可以将其声明为 `Map(String, String)`：

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

在此时可用的 `Map` 函数的完整集合可以在 [这里](/sql-reference/functions/tuple-map-functions.md) 找到。如果您的数据不一致，可以使用函数执行 [必要的类型转换](/sql-reference/functions/type-conversion-functions)。

#### 对象值 {#object-values}

当对象具有子对象，且后者的类型一致时，也可以考虑使用 `Map` 类型。

假设我们的 `persons` 对象的 `tags` 键需要一个一致的结构，其中每个 `tag` 的子对象都有一个 `name` 和一个 `time` 列。这样的 JSON 文档的简化示例可能如下所示：

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

这可以用 `Map(String, Tuple(name String, time DateTime))` 来建模，如下所示：

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

在这种情况下，使用 map 的应用通常是稀少的，并且建议将数据重新建模，以便动态键名没有子对象。例如，上述内容可以重新建模如下，从而允许使用 `Array(Tuple(key String, name String, time DateTime))`。

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
