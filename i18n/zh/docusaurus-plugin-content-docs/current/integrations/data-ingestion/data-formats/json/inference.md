---
title: 'JSON 模式推断'
slug: /integrations/data-formats/json/inference
description: '如何使用 JSON 模式推断'
keywords: ['json', 'schema', 'inference', 'schema inference']
doc_type: 'guide'
---

ClickHouse 可以自动确定 JSON 数据的结构。利用此功能，可以直接查询 JSON 数据，例如使用 `clickhouse-local` 查询磁盘上的数据或 S3 存储桶中的数据，以及／或在将数据加载到 ClickHouse 之前自动创建模式。

## 何时使用类型推断 {#when-to-use-type-inference}

* **结构一致** - 用于推断类型的数据包含了你感兴趣的所有键。类型推断基于对数据进行采样，采样上限为[最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)或[最大字节数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)。采样之后的数据如果包含额外的列，这些列将被忽略且无法被查询。
* **类型一致** - 特定键的数据类型需要彼此兼容，即必须可以在两种类型之间自动进行类型转换。

如果你的 JSON 更加动态，会不断新增键，并且同一路径可能出现多种类型，请参阅[处理半结构化和动态数据](/integrations/data-formats/json/inference#working-with-semi-structured-data)。

## 类型检测 {#detecting-types}

以下内容假设 JSON 结构一致，并且每个路径上只对应一种类型。

我们之前的示例使用的是一个简单版本的 [Python PyPI 数据集](https://clickpy.clickhouse.com/)，其格式为 `NDJSON`。在本节中，我们将探索一个结构更复杂、包含嵌套结构的数据集 —— [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)，其中包含 250 万篇学术论文。该数据集中以 `NDJSON` 形式分发的每一行都代表一篇已发表的学术论文。下面展示了一行示例数据：

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "每秒千兆字节级数字解析",
  "comments": "软件位于 https://github.com/fastfloat/fast_float 和\n https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "随着磁盘和网络提供每秒千兆字节级的吞吐量....\n",
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

这批数据相比之前的示例需要复杂得多的 schema。下面我们将概述定义该 schema 的过程，并引入诸如 `Tuple` 和 `Array` 等复杂类型。

该数据集存储在一个公共 S3 bucket 中，路径为 `s3://datasets-documentation/arxiv/arxiv.json.gz`。

可以看到，上述数据集中包含嵌套的 JSON 对象。尽管用户应当自行编写并对自己的 schema 进行版本管理，但通过类型推断可以直接从数据中推断出类型。这样可以为该 schema 自动生成 DDL，避免手动构建，从而加速开发流程。

:::note 自动格式检测
除了检测 schema 之外，JSON schema 推断还会根据文件扩展名和内容自动推断数据格式。上述文件因此会被自动检测为 NDJSON。
:::

将 [s3 函数](/sql-reference/table-functions/s3) 与 `DESCRIBE` 命令配合使用，可以展示将要被推断出的类型。

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

:::note 避免使用 Nullable
你会发现很多列被检测为 Nullable。除非绝对必要，我们[不建议使用 Nullable](/sql-reference/data-types/nullable#storage-features) 类型。你可以使用 [schema&#95;inference&#95;make&#95;columns&#95;nullable](/operations/settings/formats#schema_inference_make_columns_nullable) 来控制何时将列推断为 Nullable。
:::

可以看到，大多数量都被自动检测为 `String`，其中 `update_date` 列被正确检测为 `Date`。`versions` 列被创建为 `Array(Tuple(created String, version String))` 用于存储对象列表，而 `authors_parsed` 列被定义为 `Array(Array(String))` 用于表示嵌套数组。

:::note 控制类型检测
日期和日期时间的自动检测可以分别通过设置 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) 和 [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) 来控制（两者默认均启用）。将对象推断为具名元组的行为由设置 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects) 控制。其他用于控制 JSON 模式推断的设置（例如数字的自动检测）可以在[此处](/interfaces/schema-inference#text-formats)找到。
:::

## 查询 JSON {#querying-json}

以下内容假设 JSON 结构一致，并且每个路径仅包含单一类型。

我们可以依赖模式推断（schema inference）就地查询 JSON 数据。下面的示例中，我们为每一年找出排名靠前的作者，利用的是系统会自动识别日期和数组这一特性。

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

返回 18 行。用时:20.172 秒。已处理 252 万行,1.39 GB(12.472 万行/秒,68.76 MB/秒)。
```

模式推断使我们无需显式定义模式即可查询 JSON 文件，从而加速即席数据分析。

## 创建表 {#creating-tables}

我们可以依赖模式推断（schema inference）来自动生成表的结构。下面的 `CREATE AS EMPTY` 命令会根据推断出的模式生成该表的 DDL 并创建表，但不会加载任何数据：

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

为了确认表结构，我们使用 `SHOW CREATE TABLE` 命令：

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
```

上面给出的是该数据的正确 schema。Schema 推断是基于对数据进行抽样，并逐行读取数据来完成的。列值会按照相应格式被提取，并通过递归解析器和启发式规则来确定每个值的类型。用于 schema 推断时从数据中读取的最大行数和字节数由设置 [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)（默认 25000）和 [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)（默认 32MB）控制。如果检测结果不正确，用户可以按照[此处](/operations/settings/formats#schema_inference_make_columns_nullable)所述提供提示信息。

### 从片段创建表 {#creating-tables-from-snippets}

上述示例使用 S3 上的文件来创建表的 schema。用户也可能希望从单行数据片段创建 schema。可以使用如下所示的 [format](/sql-reference/table-functions/format) 函数来实现这一点：

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM format(JSONEachRow, '{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"Withdisks and networks providing gigabytes per second ","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}') SETTINGS schema_inference_make_columns_nullable = 0

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

以下内容假设 JSON 结构一致，并且每个路径都只有单一类型。

前面的命令已经创建了一个可加载数据的表。现在可以使用以下 `INSERT INTO SELECT` 将数据插入到该表中：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

有关从其他来源（例如文件）加载数据的示例，请参阅[此处](/sql-reference/statements/insert-into)。

加载完成后，我们可以查询数据，并可以选择使用 `PrettyJSONEachRow` 格式，以原始结构展示每一行：

```sql
SELECT *
FROM arxiv
LIMIT 1
FORMAT PrettyJSONEachRow

{
  "id": "0704.0004",
  "submitter": "David Callan",
  "authors": "David Callan",
  "title": "A determinant of Stirling cycle numbers counts unlabeled acyclic",
  "comments": "11 页",
  "journal-ref": "",
  "doi": "",
  "report-no": "",
  "categories": "math.CO",
  "license": "",
  "abstract": "  我们证明了 Stirling 循环数的行列式可以计数无标签无环单源自动机。",
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

返回 1 行。耗时:0.009 秒。
```

## 处理错误 {#handling-errors}

有时，你可能会遇到有问题的数据。例如，某些列的类型不正确，或者存在格式不正确的 JSON 对象。对于这种情况，可以使用 [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) 和 [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio) 这两个设置，在数据触发写入错误时允许忽略一定数量的行。此外，还可以提供 [hints](/operations/settings/formats#schema_inference_hints) 来辅助模式推断。

## 处理半结构化和动态数据 {#working-with-semi-structured-data}

我们前面的示例使用的是 JSON，结构是静态的，键名和类型都是事先明确的。而实际情况往往并非如此——键可能会被新增，或者其类型可能会发生变化。这在可观测性数据等使用场景中非常常见。

ClickHouse 通过专门的 [`JSON`](/sql-reference/data-types/newjson) 类型来处理这种情况。

如果你知道你的 JSON 高度动态，包含大量各不相同的键，并且同一键可能对应多种类型，我们不建议在使用 `JSONEachRow` 时启用模式推断（schema inference）来为每个键推断一列——即使数据是换行分隔 JSON（newline-delimited JSON）格式。

来看下面这个基于上述 [Python PyPI dataset](https://clickpy.clickhouse.com/) 的扩展示例。在这里，我们添加了一个额外的 `tags` 列，其中包含随机的键值对。

```json
{
  "date": "2022-09-22",
  "country_code": "IN",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "bandersnatch",
  "python_minor": "",
  "system": "",
  "version": "0.2.8",
  "tags": {
    "5gTux": "f3to*PMvaTYZsz!*rtzX1",
    "nD8CV": "value"
  }
}
```

这份数据样本以换行分隔的 JSON 格式公开提供。如果我们尝试对该文件进行模式推断，你会发现性能非常差，而且响应内容极其冗长：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- 为简洁起见,此处省略结果

9 rows in set. Elapsed: 127.066 sec.
```

这里的主要问题是使用了 `JSONEachRow` 格式来进行推断。该格式会尝试为 **JSON 中的每个键推断一个列类型** —— 实际上是在不使用 [`JSON`](/sql-reference/data-types/newjson) 类型的情况下，对数据强行应用一个静态模式（schema）。

当存在成千上万的不同列时，这种推断方式会非常慢。作为替代方案，用户可以使用 `JSONAsObject` 格式。

`JSONAsObject` 会将整个输入视为单个 JSON 对象，并将其存储在一个类型为 [`JSON`](/sql-reference/data-types/newjson) 的单列中，因此更适合高度动态或嵌套的 JSON 数据。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

在列包含多种无法兼容的类型时，这种格式也同样必不可少。比如，假设有一个名为 `sample.json` 的文件，其中包含以下按行分隔的 JSON：

```json
{"a":1}
{"a":"22"}
```

在这种情况下，ClickHouse 能够自动处理类型冲突，并将列 `a` 的类型确定为 `Nullable(String)`。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 行结果集。用时:0.081 秒。
```

:::note 类型强制转换
可以通过多种设置来控制此类类型强制转换。上面的示例取决于设置 [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings)。
:::

但是，某些类型不兼容。请看以下示例：

```json
{"a":1}
{"a":{"b":2}}
```

在这种情况下，无法进行任何形式的类型转换，因此 `DESCRIBE` 命令会失败：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

耗时：0.755 秒。
```

从服务器接收到异常（版本 24.12.1）：
代码：636。DB::Exception: 从 sql-clickhouse.clickhouse.com:9440 接收到。DB::Exception: 无法从 JSON 格式文件中提取表结构。错误：
代码：53。DB::Exception: 为第 1 行列 &#39;a&#39; 自动推断的类型 Tuple(b Int64) 与之前行中定义的类型 Int64 不一致。你可以通过设置 schema&#95;inference&#95;hints 为该列指定类型。

````

在这种情况下,`JSONAsObject` 将每一行视为单个 [`JSON`](/sql-reference/data-types/newjson) 类型(该类型支持同一列包含多种类型)。这一点至关重要:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

返回 1 行。耗时:0.010 秒。
````

## 延伸阅读 {#further-reading}

要进一步了解数据类型推断，可参阅[此文档页面](/interfaces/schema-inference)。
