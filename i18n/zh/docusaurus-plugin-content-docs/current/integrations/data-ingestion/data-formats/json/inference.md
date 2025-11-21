---
title: 'JSON 模式推断'
slug: /integrations/data-formats/json/inference
description: '如何使用 JSON 模式推断功能'
keywords: ['json', 'schema', 'inference', 'schema inference']
doc_type: 'guide'
---

ClickHouse 可以自动推断 JSON 数据的结构。借助这一能力，可以直接查询 JSON 数据，例如使用 `clickhouse-local` 查询磁盘上的文件或 S3 存储桶中的数据，并在将数据加载到 ClickHouse 之前自动生成相应的表结构。



## 何时使用类型推断 {#when-to-use-type-inference}

- **结构一致** - 用于推断类型的数据包含您所需的全部键。类型推断基于数据采样,采样上限为[最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)或[最大字节数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)。采样范围之外包含额外列的数据将被忽略且无法查询。
- **类型一致** - 特定键的数据类型需要兼容,即必须能够自动将一种类型强制转换为另一种类型。

如果您的 JSON 数据更加动态,会添加新键且同一路径可能存在多种类型,请参阅["处理半结构化和动态数据"](/integrations/data-formats/json/inference#working-with-semi-structured-data)。


## 检测类型 {#detecting-types}

以下假设 JSON 结构一致,且每个路径具有单一类型。

我们之前的示例使用了 `NDJSON` 格式的简化版 [Python PyPI 数据集](https://clickpy.clickhouse.com/)。在本节中,我们将探索一个具有嵌套结构的更复杂数据集 - [arXiv 数据集](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download),其中包含 250 万篇学术论文。该数据集以 `NDJSON` 格式分发,每一行代表一篇已发表的学术论文。下面显示了一个示例行:

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
  "authors_parsed": [["Lemire", "Daniel", ""]]
}
```

此数据需要比之前示例复杂得多的模式。我们在下面概述定义此模式的过程,并介绍诸如 `Tuple` 和 `Array` 等复杂类型。

此数据集存储在公共 S3 存储桶中,位置为 `s3://datasets-documentation/arxiv/arxiv.json.gz`。

您可以看到上述数据集包含嵌套的 JSON 对象。虽然用户应该起草和版本化他们的模式,但类型推断功能允许从数据中自动推断类型。这使得模式 DDL 可以自动生成,避免了手动构建的需要,并加速了开发过程。

:::note 自动格式检测
除了检测模式外,JSON 模式推断还会根据文件扩展名和内容自动推断数据格式。因此,上述文件会自动被检测为 NDJSON 格式。
:::

使用 [s3 函数](/sql-reference/table-functions/s3) 配合 `DESCRIBE` 命令可以显示将被推断的类型。

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

:::note 避免使用 null
您可以看到许多列被检测为 Nullable。我们[不建议在非绝对必要时使用 Nullable](/sql-reference/data-types/nullable#storage-features) 类型。您可以使用 [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable) 来控制何时应用 Nullable 的行为。
:::

我们可以看到大多数列已自动检测为 `String`,`update_date` 列被正确检测为 `Date`。`versions` 列已创建为 `Array(Tuple(created String, version String))` 以存储对象列表,`authors_parsed` 被定义为 `Array(Array(String))` 用于嵌套数组。


:::note 控制类型检测
可以通过设置 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) 和 [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes)（两者默认均为启用）分别控制日期和日期时间的自动检测。将对象推断为元组的行为由设置 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects) 控制。用于控制 JSON 模式推断的其他设置（例如数字的自动检测）可在[此处](/interfaces/schema-inference#text-formats)找到。
:::



## 查询 JSON {#querying-json}

以下内容假设 JSON 结构一致,且每个路径具有单一类型。

我们可以依赖模式推断来直接查询 JSON 数据。下面的示例查找每年的顶级作者,利用了日期和数组自动检测的特性。

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

模式推断使我们能够在无需指定模式的情况下查询 JSON 文件,从而加速即席数据分析任务。


## 创建表 {#creating-tables}

我们可以利用模式推断来创建表的模式。以下 `CREATE AS EMPTY` 命令会推断表的 DDL 并创建表。此操作不会加载任何数据:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

要确认表模式,可以使用 `SHOW CREATE TABLE` 命令:

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

以上是此数据的正确模式。模式推断基于对数据进行采样并逐行读取数据。列值根据格式提取,使用递归解析器和启发式方法来确定每个值的类型。模式推断中从数据读取的最大行数和字节数由设置 [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)(默认为 25000)和 [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)(默认为 32MB)控制。如果检测结果不正确,用户可以提供提示,详见[此处](/operations/settings/formats#schema_inference_make_columns_nullable)。

### 从数据片段创建表 {#creating-tables-from-snippets}

上述示例使用 S3 上的文件来创建表模式。用户可能希望从单行数据片段创建模式。这可以使用 [format](/sql-reference/table-functions/format) 函数实现,如下所示:

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

以下内容假设 JSON 结构一致,且每个路径具有单一类型。

前面的命令已创建了一个可以加载数据的表。现在可以使用以下 `INSERT INTO SELECT` 语句将数据插入表中:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

有关从其他数据源(例如文件)加载数据的示例,请参阅[此处](/sql-reference/statements/insert-into)。

数据加载完成后,可以查询数据,也可以选择使用 `PrettyJSONEachRow` 格式以原始结构显示行:

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

有时,您可能会遇到错误的数据。例如,特定列的类型不正确或 JSON 对象格式不当。对于这种情况,您可以使用 [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) 和 [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio) 设置来允许在数据触发插入错误时忽略一定数量的行。此外,还可以提供[提示](/operations/settings/formats#schema_inference_hints)来辅助类型推断。


## 处理半结构化和动态数据 {#working-with-semi-structured-data}

我们之前的示例使用的是静态 JSON,其键名和类型都是已知的。但实际情况往往并非如此——键可能会被添加,或者它们的类型可能会发生变化。这在可观测性数据等用例中很常见。

ClickHouse 通过专用的 [`JSON`](/sql-reference/data-types/newjson) 类型来处理这种情况。

如果您的 JSON 是高度动态的,具有许多唯一键以及同一键的多种类型,我们建议不要使用 `JSONEachRow` 的模式推断来尝试为每个键推断列——即使数据是换行符分隔的 JSON 格式。

考虑以下来自上述 [Python PyPI 数据集](https://clickpy.clickhouse.com/)扩展版本的示例。在这里,我们添加了一个任意的 `tags` 列,其中包含随机的键值对。

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

此数据的样本以换行符分隔的 JSON 格式公开提供。如果我们尝试对此文件进行模式推断,您会发现性能很差,并且响应极其冗长:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- 为简洁起见省略结果

9 rows in set. Elapsed: 127.066 sec.
```

这里的主要问题是使用了 `JSONEachRow` 格式进行推断。这会尝试**为 JSON 中的每个键推断一个列类型**——实际上是在不使用 [`JSON`](/sql-reference/data-types/newjson) 类型的情况下尝试将静态模式应用于数据。

当有数千个唯一列时,这种推断方法会很慢。作为替代方案,用户可以使用 `JSONAsObject` 格式。

`JSONAsObject` 将整个输入视为单个 JSON 对象,并将其存储在一个 [`JSON`](/sql-reference/data-types/newjson) 类型的列中,使其更适合高度动态或嵌套的 JSON 负载。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

在列具有无法协调的多种类型的情况下,此格式也是必不可少的。例如,考虑一个包含以下换行符分隔 JSON 的 `sample.json` 文件:

```json
{"a":1}
{"a":"22"}
```

在这种情况下,ClickHouse 能够强制转换类型冲突,并将列 `a` 解析为 `Nullable(String)`。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 类型强制转换
这种类型强制转换可以通过多个设置进行控制。上述示例依赖于设置 [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings)。
:::

然而,某些类型是不兼容的。考虑以下示例:

```json
{"a":1}
{"a":{"b":2}}
```

在这种情况下,任何形式的类型转换都是不可能的。因此 `DESCRIBE` 命令会失败:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

```


从服务器接收到异常 (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: 无法从 JSON 格式文件中提取表结构。错误：
Code: 53. DB::Exception: 对第 1 行列 &#39;a&#39; 自动推断出的类型 Tuple(b Int64) 与前面各行定义的类型 Int64 不一致。您可以通过设置 schema&#95;inference&#95;hints 为该列指定类型。

````

在这种情况下,`JSONAsObject` 将每一行视为单个 [`JSON`](/sql-reference/data-types/newjson) 类型(该类型支持同一列包含多种数据类型)。这一点至关重要:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

返回 1 行。耗时:0.010 秒。
````


## 延伸阅读 {#further-reading}

要了解更多关于数据类型推断的信息,可以参考[此文档页面](/interfaces/schema-inference)。
