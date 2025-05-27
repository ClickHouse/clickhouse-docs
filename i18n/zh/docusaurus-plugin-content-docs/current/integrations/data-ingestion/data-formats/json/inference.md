---
'title': 'JSON 模式推断'
'slug': '/integrations/data-formats/json/inference'
'description': '如何使用 JSON 模式推断'
'keywords':
- 'json'
- 'schema'
- 'inference'
- 'schema inference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

ClickHouse 可以自动确定 JSON 数据的结构。这可以直接用于查询 JSON 数据，例如在磁盘上使用 `clickhouse-local` 或 S3 存储桶，和/或在将数据加载到 ClickHouse 之前自动创建模式。

## 何时使用类型推断 {#when-to-use-type-inference}

* **一致的结构** - 您将要推断类型的数据包含您感兴趣的所有键。类型推断是基于对数据进行采样，直到达到 [最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) 或 [字节数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)。在采样之后的数据中，额外的列将被忽略，无法查询。
* **一致的类型** - 特定键的数据类型需要兼容，即必须能够自动将一种类型强制转换为另一种类型。

如果您有更动态的 JSON，其中新键被添加并且同一路径可能有多种类型，请参见 ["处理半结构化和动态数据"](/integrations/data-formats/json/inference#working-with-semi-structured-data)。

## 检测类型 {#detecting-types}

以下假设 JSON 一致结构且每个路径只有一种类型。

我们之前的示例使用了 `NDJSON` 格式的简单版本 [Python PyPI 数据集](https://clickpy.clickhouse.com/)。在本节中，我们探讨一个具有嵌套结构的更复杂数据集 - [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)，包含 250 万篇学术论文。此数据集中每一行以 `NDJSON` 形式分布，代表一篇已发布的学术论文。示例行如下所示：

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n https://github.com/lemire/simple_fastfloat_benchmark/",
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

该数据需要比前面的示例更复杂的模式。我们在下面概述定义此模式的过程，介绍了 `Tuple` 和 `Array` 等复杂类型。

此数据集存储在公共 S3 存储桶中，位于 `s3://datasets-documentation/arxiv/arxiv.json.gz`。

您可以看到上面的数据集包含嵌套的 JSON 对象。虽然用户应该起草并版本化他们的模式，但推断允许从数据中推断类型。这使得可以自动生成模式 DDL，避免手动构建并加速开发过程。

:::note 自动格式检测
除了检测模式外，JSON 模式推断将自动根据文件扩展名和内容推断数据格式。上述文件由于自动检测被识别为 NDJSON。
:::

使用 [s3 function](/sql-reference/table-functions/s3) 和 `DESCRIBE` 命令显示将被推断的类型。

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
:::note 避免 Null
您会看到，很多列被检测为 Nullable。我们 [不建议在不绝对需要时使用 Nullable](/sql-reference/data-types/nullable#storage-features) 类型。您可以使用 [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable) 来控制何时应用 Nullable 的行为。
:::

我们可以看到大多数列已自动检测为 `String`，而 `update_date` 列被正确检测为 `Date`。 `versions` 列已创建为 `Array(Tuple(created String, version String))` 以存储对象列表，`authors_parsed` 被定义为 `Array(Array(String))` 用于嵌套数组。

:::note 控制类型检测
日期和日期时间的自动检测可以通过设置 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) 和 [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) 分别进行控制（两者默认启用）。对对象作为元组推断的控制由设置 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects) 控制。其他控制 JSON 模式推断的设置，如数字的自动检测，可以在 [此处]( /interfaces/schema-inference#text-formats) 找到。
:::

## 查询 JSON {#querying-json}

以下假设 JSON 是一致结构并且每个路径只有一种类型。

我们可以依赖模式推断直接查询 JSON 数据。下面，我们找出每年的顶级作者，利用日期和数组的自动检测。

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

18 rows in set. Elapsed: 20.172 sec. Processed 2.52 million rows, 1.39 GB (124.72 thousand rows/s., 68.76 MB/s.)
```

模式推断使我们能够在无需指定模式的情况下查询 JSON 文件，从而加速临时数据分析任务。

## 创建表 {#creating-tables}

我们可以依赖模式推断为表创建模式。以下的 `CREATE AS EMPTY` 命令导致推断表的 DDL 并创建表。这不会加载任何数据：

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
```

上述即为该数据的正确模式。模式推断基于对数据的采样，逐行读取数据。根据格式提取列值，使用递归解析器和启发式方法来确定每个值的类型。在模式推断中读取的最大行数和字节由设置 [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) （默认 25000）和 [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference) （默认 32MB）控制。如果检测不正确，用户可以根据 [此处]( /operations/settings/formats#schema_inference_make_columns_nullable) 的描述提供提示。

### 从代码片段创建表 {#creating-tables-from-snippets}

上述示例使用 S3 上的文件创建表模式。用户可以希望从单行代码片段创建模式。这可以通过使用 [format](/sql-reference/table-functions/format) 函数实现，如下所示：

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

以下假设 JSON 是一致结构并且每个路径只有一种类型。

之前的命令创建了一个可以加载数据的表。您现在可以使用以下的 `INSERT INTO SELECT` 将数据插入到您的表中：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

有关从其他源（例如文件）加载数据的示例，请参见 [此处]( /sql-reference/statements/insert-into)。

数据加载后，我们可以查询数据，选择使用格式 `PrettyJSONEachRow` 来显示行的原始结构：

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
  "comments": "11 pages",
  "journal-ref": "",
  "doi": "",
  "report-no": "",
  "categories": "math.CO",
  "license": "",
  "abstract": "  We show that a determinant of Stirling cycle numbers counts unlabeled acyclic\nsingle-source automata.",
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

有时，您可能会遇到坏数据。例如，特定列没有正确的类型或 JSON 对象格式不正确。为此，您可以使用设置 [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) 和 [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio) 来允许某些行被忽略，如果数据触发插入错误。此外，可以提供 [提示](/operations/settings/formats#schema_inference_hints) 来帮助推断。

## 处理半结构化和动态数据 {#working-with-semi-structured-data}

<PrivatePreviewBadge/>

我们之前的示例使用了具有静态且众所周知的键名和类型的 JSON。情况往往并非如此 - 键可以被添加或其类型可以更改。这在可观察性数据等用例中很常见。

ClickHouse 通过专用的 [`JSON`](/sql-reference/data-types/newjson) 类型来处理此问题。

如果您知道您的 JSON 动态性很高，具有许多唯一键和相同键的多种类型，我们建议不要使用 `JSONEachRow` 进行模式推断以尝试为每个键推断列 - 即使数据是换行分隔的 JSON 格式。

考虑以下从扩展版本上面的 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 数据集的示例。在这里，我们添加了一个任意的 `tags` 列，其中包含随机键值对。

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

这部分数据以换行分隔的 JSON 格式公开提供。如果我们尝试对该文件进行模式推断，您会发现性能较差，返回极为冗长的响应：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- result omitted for brevity

9 rows in set. Elapsed: 127.066 sec.
```

这里的主要问题是使用 `JSONEachRow` 格式进行推断。这试图推断 **JSON 中每个键的列类型** - 实际上试图对数据应用静态模式，而没有使用 [`JSON`](/sql-reference/data-types/newjson) 类型。

对于成千上万的唯一列，这种推断方法速度很慢。作为替代，用户可以使用 `JSONAsObject` 格式。

`JSONAsObject` 将整个输入视为一个单独的 JSON 对象，并将其存储在单个类型为 [`JSON`](/sql-reference/data-types/newjson) 的列中，使其更适合处理高度动态或嵌套的 JSON 负载。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

在列具有无法调和的多种类型的情况下，此格式也是必不可少的。例如，考虑一个 `sample.json` 文件，其换行分隔的 JSON 内容如下：

```json
{"a":1}
{"a":"22"}
```

在这种情况下，ClickHouse 能够强制类型冲突，并将列 `a` 解析为 `Nullable(String)`。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 类型强制转换
这种类型的强制转换可以通过多个设置来控制。上述示例依赖设置 [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings)。
:::

但是，一些类型是互不兼容的。考虑以下示例：

```json
{"a":1}
{"a":{"b":2}}
```

在这种情况下，这里任何形式的类型转换都是不可能的。因此 `DESCRIBE` 命令失败：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

在这种情况下，`JSONAsObject` 将每一行视为一个单独的 [`JSON`](/sql-reference/data-types/newjson) 类型（该类型支持同一列具有多种类型）。这一点至关重要：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```

## 进一步阅读 {#further-reading}

欲了解有关数据类型推断的更多信息，您可以参考 [此]( /interfaces/schema-inference) 文档页面。
