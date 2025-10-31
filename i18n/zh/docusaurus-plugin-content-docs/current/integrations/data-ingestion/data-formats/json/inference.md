---
'title': 'JSON schema 推断'
'slug': '/integrations/data-formats/json/inference'
'description': '如何使用 JSON schema 推断'
'keywords':
- 'json'
- 'schema'
- 'inference'
- 'schema inference'
'doc_type': 'guide'
---

ClickHouse 可以自动确定 JSON 数据的结构。这可以用于直接查询 JSON 数据，例如在磁盘上使用 `clickhouse-local` 或 S3 存储桶，和/或在将数据加载到 ClickHouse 之前自动创建模式。

## 何时使用类型推断 {#when-to-use-type-inference}

* **一致的结构** - 从中推断类型的数据包含您关注的所有键。类型推断基于对数据的采样，直到 [最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) 或 [字节数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)。在采样后的数据中，额外的列将被忽略，无法查询。
* **一致的类型** - 特定键的数据类型需要兼容，即必须能够自动强制转换一种类型为另一种类型。

如果您有更动态的 JSON，其中添加了新键且同一路径可能出现多种类型，请参见 ["处理半结构化和动态数据"](/integrations/data-formats/json/inference#working-with-semi-structured-data)。

## 检测类型 {#detecting-types}

以下假定 JSON 结构一致并且每个路径具有单一类型。

我们之前的示例使用了一个简单版本的 [Python PyPI 数据集](https://clickpy.clickhouse.com/) ，格式为 `NDJSON`。在本节中，我们探讨一个具有嵌套结构的更复杂数据集 - [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)，包含 250 万篇学术论文。该数据集中的每一行，分布为 `NDJSON`，代表一篇已发表的学术论文。以下是一个示例行：

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

该数据需要比之前更复杂的模式。我们在下面概述了定义此模式的过程，引入复杂类型，如 `Tuple` 和 `Array`。

该数据集存储在公共的 S3 存储桶中，地址为 `s3://datasets-documentation/arxiv/arxiv.json.gz`。

您可以看到，上述数据集包含嵌套的 JSON 对象。虽然用户应该起草和版本控制他们的模式，但推断允许从数据中推断类型。这允许自动生成模式 DDL，避免手动构建，加速开发过程。

:::note 自动格式检测
除了检测模式外，JSON 模式推断还会根据文件扩展名和内容自动推断数据的格式。由于上述文件被自动检测为 NDJSON。
:::

使用 [s3 函数](/sql-reference/table-functions/s3) 和 `DESCRIBE` 命令显示将要推断的类型。

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
:::note 避免空值
可以看到很多列被检测为 Nullable。我们 [不建议在不绝对需要时使用 Nullable](/sql-reference/data-types/nullable#storage-features) 类型。您可以使用 [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable) 控制何时应用 Nullable 的行为。
:::

我们可以看到大多数列已自动检测为 `String`，而 `update_date` 列正确地被检测为 `Date`。`versions` 列已创建为 `Array(Tuple(created String, version String))`，以存储对象列表，而 `authors_parsed` 被定义为 `Array(Array(String))`，用于嵌套数组。

:::note 控制类型检测
日期和日期时间的自动检测可以通过设置 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) 和 [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) 分别控制（默认情况下均启用）。对象作为元组的推断受设置 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects) 控制。控制 JSON 模式推断的其他设置，如数字的自动检测，可以在 [这里](/interfaces/schema-inference#text-formats) 找到。
:::

## 查询 JSON {#querying-json}

以下假定 JSON 结构一致并且每个路径具有单一类型。

我们可以依靠模式推断来就地查询 JSON 数据。下面，我们查找每年的顶级作者，利用日期和数组被自动检测的事实。

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

模式推断使我们能够查询 JSON 文件，而不需要指定模式，加速临时数据分析任务。

## 创建表 {#creating-tables}

我们可以依靠模式推断来创建表的模式。以下 `CREATE AS EMPTY` 命令使表的 DDL 被推断并创建表。此操作不会加载任何数据：

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

以上就是此数据的正确模式。模式推断基于对数据进行采样并逐行读取数据。列值根据格式提取，使用递归解析器和启发式方法来确定每个值的类型。在模式推断中从数据中读取的最大行数和字节数由设置 [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) （默认 25000）和 [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference) （默认 32MB）控制。如果检测不正确，用户可以提供提示，如 [这里](/operations/settings/formats#schema_inference_make_columns_nullable) 所述。

### 从片段创建表 {#creating-tables-from-snippets}

以上示例使用 S3 上的文件创建表模式。用户可能希望从单行片段创建模式。这可以通过使用 [format](/sql-reference/table-functions/format) 函数，如下所示实现：

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

以下假定 JSON 结构一致并且每个路径具有单一类型。

之前的命令创建了一个可以加载数据的表。现在您可以使用以下 `INSERT INTO SELECT` 将数据插入到表中：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

有关从其他源（例如文件）加载数据的示例，请参见 [这里](/sql-reference/statements/insert-into)。

一旦加载，我们可以查询我们的数据，选择使用格式 `PrettyJSONEachRow` 以显示原始结构中的行：

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

有时，您可能会遇到错误数据。例如，特定列没有正确的类型或格式不正确的 JSON 对象。为此，您可以使用设置 [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) 和 [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio) 来允许在数据触发插入错误时忽略一定数量的行。此外，可以提供 [提示](/operations/settings/formats#schema_inference_hints) 来帮助推断。

## 处理半结构化和动态数据 {#working-with-semi-structured-data}

我们之前的示例使用了具有固定键名和类型的静态 JSON。情况往往不是这样 - 可以添加键或它们的类型可能会发生变化。这在可观测性数据等用例中是非常常见的。

ClickHouse 通过专用的 [`JSON`](/sql-reference/data-types/newjson) 类型来处理此情况。

如果您知道您的 JSON 高度动态，具有许多独特的键和相同键的多种类型，我们建议不要使用 `JSONEachRow` 的模式推断来尝试为每个键推断列 - 即使数据是以换行分隔的 JSON 格式。

考虑以下来自上述 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的扩展版本的示例。在这里，我们添加了一个任意的 `tags` 列，包含随机键值对。

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

该数据的样本以换行分隔的 JSON 格式公开可用。如果我们尝试对该文件进行模式推断，您会发现性能不佳，响应非常冗长：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- result omitted for brevity

9 rows in set. Elapsed: 127.066 sec.
```

这里的主要问题是使用 `JSONEachRow` 格式进行推断。它尝试为 JSON 中的 **每个键推断一个列类型** - 有效地试图对数据应用静态模式，而不使用 [`JSON`](/sql-reference/data-types/newjson) 类型。

由于拥有数千个唯一列，这种推断方式很慢。作为替代方案，用户可以使用 `JSONAsObject` 格式。

`JSONAsObject` 将整个输入视为一个单一的 JSON 对象，并将其存储在类型为 [`JSON`](/sql-reference/data-types/newjson) 的单一列中，更适合高度动态或嵌套的 JSON 有效载荷。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

这种格式在存在类型无法调和的情况下也是必不可少的。例如，请考虑一个名为 `sample.json` 的文件，包含以下换行分隔的 JSON：

```json
{"a":1}
{"a":"22"}
```

在这种情况下，ClickHouse 可以强制类型冲突并将列 `a` 解析为 `Nullable(String)`。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 类型强制转换
此类型强制转换可以通过多个设置来控制。上述示例依赖于设置 [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings)。
:::

但是，一些类型不兼容。考虑以下示例：

```json
{"a":1}
{"a":{"b":2}}
```

在这种情况下，此处的任何形式的类型转换都是不可能的。因此， `DESCRIBE` 命令失败：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

在这种情况下，`JSONAsObject` 将每一行视为单一的 [`JSON`](/sql-reference/data-types/newjson) 类型（支持同一列具有多种类型）。这是至关重要的：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```

## 深入阅读 {#further-reading}

要了解有关数据类型推断的更多信息，请参阅 [此](/interfaces/schema-inference) 文档页面。
