---
title: JSON schema 推断
slug: /integrations/data-formats/json/inference
description: 如何使用 JSON schema 推断
keywords: [json, schema, inference, schema inference]
---

ClickHouse 可以自动确定 JSON 数据的结构。这可以用来直接查询 JSON 数据，例如通过 `clickhouse-local` 或 S3 桶，并/或在将数据加载到 ClickHouse 之前自动创建模式。

## 何时使用类型推断 {#when-to-use-type-inference}

* **一致的结构** - 你要推断类型的数据包含你感兴趣的所有列。推断类型后添加额外列的数据将被忽略，无法进行查询。
* **一致的类型** - 特定列的数据类型需要兼容。

:::note 重要
如果你有更动态的 JSON，其中新键在没有充分警告修改模式的情况下被添加，例如 Kubernetes 日志中的标签，我们建议阅读 [**设计 JSON schema**](/integrations/data-formats/json/schema)。
:::

## 检测类型 {#detecting-types}

我们之前的示例使用了 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的一个简单版本，采用 NDJSON 格式。在这一节中，我们探索一个更复杂的数据集，包含嵌套结构 - [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)，其中包含 250 万篇学术论文。该数据集中每一行，分发为 NDJSON，代表一篇已发表的学术论文。下面是一个示例行：

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "每秒一个吉字节的数字解析",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "随着磁盘和网络提供每秒吉字节 ....\n",
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

这些数据需要比之前示例更复杂的模式。我们在下面概述了定义此模式的过程，介绍了复杂类型，例如 `Tuple` 和 `Array`。

该数据集存储在公共 S3 桶中，路径为 `s3://datasets-documentation/arxiv/arxiv.json.gz`。

你可以看到，上述数据集包含嵌套的 JSON 对象。虽然用户应该起草并版本化他们的模式，但推断允许从数据中推断类型。这允许模式 DDL 自动生成，避免手动构建，加快开发过程。

:::note 自动格式检测
除了检测模式外，JSON schema 推断还会根据文件扩展名和内容自动推断数据的格式。上述文件因而被自动检测为 NDJSON。
:::

使用 [s3 函数](/sql-reference/table-functions/s3) 结合 `DESCRIBE` 命令可以显示将要推断的类型。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS describe_compact_output = 1
```
```response
┌─name───────────┬─type────────────────────────────────────────────────────────────────────┐
│ id             │ Nullable(String)                                                        │
│ submitter      │ Nullable(String)                                                        │
│ authors        │ Nullable(String)                                                        │
│ title          │ Nullable(String)                                                        │
│ comments       │ Nullable(String)                                                        │
│ journal-ref    │ Nullable(String)                                                        │
│ doi            │ Nullable(String)                                                        │
│ report-no      │ Nullable(String)                                                        │
│ categories     │ Nullable(String)                                                        │
│ license        │ Nullable(String)                                                        │
│ abstract       │ Nullable(String)                                                        │
│ versions       │ Array(Tuple(created Nullable(String),version Nullable(String)))         │
│ update_date    │ Nullable(Date)                                                          │
│ authors_parsed │ Array(Array(Nullable(String)))                                          │
└────────────────┴─────────────────────────────────────────────────────────────────────────┘
```
:::note 避免 null
你可以看到很多列被检测为 Nullable。当不绝对必要时，我们 [不推荐使用 Nullable](/sql-reference/data-types/nullable#storage-features) 类型。可以使用 [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable) 控制 Nullable 应用的行为。
:::

我们可以看到大多数列已自动识别为 `String`，而 `update_date` 列正确检测为 `Date`。`versions` 列被创建为 `Array(Tuple(created String, version String))` 来存储对象的列表，而 `authors_parsed` 被定义为 `Array(Array(String))`，表示嵌套数组。

:::note 控制类型检测
日期和日期时间的自动检测可以通过设置 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) 和 [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) 来控制（默认均为启用）。将对象推断为元组的推断则由设置 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects) 控制。控制 JSON 的模式推断的其他设置，例如数字的自动检测，见 [这里](/interfaces/schema-inference#text-formats)。
:::

## 查询 JSON {#querying-json}

我们可以依赖模式推断在本地查询 JSON 数据。下面，我们找出每年顶尖作者，利用日期和数组的自动检测。

```sql
SELECT
    toYear(update_date) AS year,
    authors,
    count() AS c
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
GROUP BY
    year,
    authors
ORDER BY
    year ASC,
    c DESC
LIMIT 1 BY year

┌─year─┬─authors────────────────────────────────────┬───c─┐
│ 2007 │ The BABAR Collaboration, B. Aubert, et al  │  98 │
│ 2008 │ The OPAL collaboration, G. Abbiendi, et al │  59 │
│ 2009 │ Ashoke Sen                                 │  77 │
│ 2010 │ The BABAR Collaboration, B. Aubert, et al  │ 117 │
│ 2011 │ Amelia Carolina Sparavigna                 │  21 │
│ 2012 │ ZEUS Collaboration                         │ 140 │
│ 2013 │ CMS Collaboration                          │ 125 │
│ 2014 │ CMS Collaboration                          │  87 │
│ 2015 │ ATLAS Collaboration                        │ 118 │
│ 2016 │ ATLAS Collaboration                        │ 126 │
│ 2017 │ CMS Collaboration                          │ 122 │
│ 2018 │ CMS Collaboration                          │ 138 │
│ 2019 │ CMS Collaboration                          │ 113 │
│ 2020 │ CMS Collaboration                          │  94 │
│ 2021 │ CMS Collaboration                          │  69 │
│ 2022 │ CMS Collaboration                          │  62 │
│ 2023 │ ATLAS Collaboration                        │ 128 │
│ 2024 │ ATLAS Collaboration                        │ 120 │
└──────┴────────────────────────────────────────────┴─────┘

共 18 行。耗时: 20.172 秒。处理了 252 万行，1.39 GB (每秒 124.72 千行, 每秒 68.76 MB.)
```

模式推断允许我们查询 JSON 文件，而无需指定模式，加快了临时数据分析任务的速度。

## 创建表 {#creating-tables}

我们可以依赖模式推断为表创建模式。以下的 `CREATE AS EMPTY` 命令会导致表的 DDL 被推断出来并创建。此操作不会加载任何数据：

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

要确认表模式，我们使用 `SHOW CREATE TABLE` 命令：

```sql
SHOW CREATE TABLE arxiv

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
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
SETTINGS index_granularity = 8192
```

上述是该数据的正确模式。模式推断基于对数据的采样，并逐行读取数据。列值根据格式提取，使用递归解析器和启发式方法确定每个值的类型。模式推断从数据中读取的最大行数和字节数由设置 [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)（默认值为 25000）和 [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)（默认值为 32MB）控制。如果检测不正确，用户可以提供提示，如 [这里](/operations/settings/formats#schema_inference_make_columns_nullable) 所述。

### 从片段创建表 {#creating-tables-from-snippets}

上述示例使用 S3 上的文件来创建表模式。用户可能希望从单行片段创建模式。这可以通过使用 [format](/sql-reference/table-functions/format) 函数来实现，如下所示：

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM format(JSONEachRow, '{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"每秒一个吉字节的数字解析","comments":"Software at https://github.com/fastfloat/fast_float and","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"随着磁盘和网络提供每秒吉字节 ","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}') SETTINGS schema_inference_make_columns_nullable = 0

SHOW CREATE TABLE arxiv

CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

## 加载 JSON 数据 {#loading-json-data}

上面的命令创建了一个可以加载数据的表。你现在可以使用以下 `INSERT INTO SELECT` 将数据插入表中：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (每秒 65.35 千行, 每秒 36.03 MB.)
峰值内存使用: 870.67 MiB.
```

有关从其他源（如文件）加载数据的示例，请参见 [这里](/sql-reference/statements/insert-into)。

一旦加载，我们可以查询数据，选择使用格式 `PrettyJSONEachRow` 以显示原始结构的行：

```sql
SELECT *
FROM arxiv
LIMIT 1
FORMAT PrettyJSONEachRow

{
    "id": "0704.0004",
    "submitter": "David Callan",
    "authors": "David Callan",
    "title": "Stirling 循环数的一个行列式计数无标签的无环",
    "comments": "11 页",
    "journal-ref": "",
    "doi": "",
    "report-no": "",
    "categories": "math.CO",
    "license": "",
    "abstract": "我们展示了一个行列式的 Stirling 循环数计数无标签的单源自动机。",
    "versions": [
        {
            "created": "Sat, 31 Mar 2007 03:16:14 GMT",
            "version": "v1"
        }
    ],
    "update_date": "2007-05-23",
    "authors_parsed": [
        [
            "Callan",
            "David"
        ]
    ]
}

1 row in set. Elapsed: 0.009 sec.
```

## 处理错误 {#handling-errors}

有时，你可能会遇到坏数据。例如，某些列没有正确的类型或格式不正确的 JSON。为此，你可以使用设置 [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio) 来允许在数据触发插入错误时忽略一定数量的行。此外，可以提供 [提示](/operations/settings/formats#schema_inference_hints) 来辅助推断。

## 进一步阅读 {#further-reading}

要了解有关数据类型推断的更多信息，你可以参考 [此](/interfaces/schema-inference) 文档页面。
