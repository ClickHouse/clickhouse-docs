---
sidebar_label: '加载 JSON'
sidebar_position: 20
title: '使用 JSON'
slug: /integrations/data-formats/json/loading
description: '加载 JSON'
keywords: ['json', 'clickhouse', 'inserting', 'loading', 'inserting']
score: 15
doc_type: 'guide'
---

# 加载 JSON \{#loading-json\}

以下示例展示了一个非常简单的用例,用于加载结构化和半结构化 JSON 数据。对于更复杂的 JSON(包括嵌套结构),请参阅指南 [**设计 JSON 模式**](/integrations/data-formats/json/schema)。

## 加载结构化 JSON \{#loading-structured-json\}

在本节中,我们假定 JSON 数据为 [`NDJSON`](https://github.com/ndjson/ndjson-spec)(以换行分隔的 JSON)格式,在 ClickHouse 中称为 [`JSONEachRow`](/interfaces/formats/JSONEachRow),且结构规范,即列名和类型是固定的。由于 `NDJSON` 简洁且空间利用率高,是加载 JSON 数据的首选格式,但 ClickHouse 也支持其他格式用于[输入和输出](/interfaces/formats/JSON)。

请看下面的 JSON 示例,表示来自 [Python PyPI 数据集](https://clickpy.clickhouse.com/)的一行记录:

```json
{
  "date": "2022-11-15",
  "country_code": "ES",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "pip",
  "python_minor": "3.9",
  "system": "Linux",
  "version": "0.3.0"
}
```

为了将此 JSON 对象加载到 ClickHouse 中,必须先定义一张表的结构(schema)。

在这个简单示例中,我们的结构是静态的,列名是已知的,并且它们的类型也是明确定义的。

虽然 ClickHouse 通过 JSON 类型支持半结构化数据(其中键名及其类型可以是动态的),但在这里并不需要使用这一特性。

:::note Prefer static schemas where possible
在列名和类型是固定的、且不预期出现新列的情况下,在生产环境中应始终优先使用静态定义的 schema。

对于高度动态的数据(列的名称和类型可能发生变化),应优先使用 JSON 类型。该类型在原型设计和数据探索场景中也非常有用。
:::

下面展示了一个简单的 schema,其中 **JSON 键被映射到列名**:

```sql
CREATE TABLE pypi (
  `date` Date,
  `country_code` String,
  `project` String,
  `type` String,
  `installer` String,
  `python_minor` String,
  `system` String,
  `version` String
)
ENGINE = MergeTree
ORDER BY (project, date)
```

:::note 排序键
我们在这里通过 `ORDER BY` 子句选择了一个排序键。关于排序键以及如何选择它的更多详情,请参见[此处](/data-modeling/schema-design#choosing-an-ordering-key)。
:::

ClickHouse 可以以多种格式加载 JSON 数据,并根据文件扩展名和内容自动推断类型。我们可以使用 [S3 函数](/sql-reference/table-functions/s3) 将 JSON 文件读取到上述表中:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

请注意,我们不需要显式指定文件格式。相反,我们使用一个 glob 通配符模式来读取存储桶中所有 `*.json.gz` 文件。ClickHouse 会根据文件扩展名和内容自动推断其格式为 `JSONEachRow`(NDJSON)。当 ClickHouse 无法自动识别格式时,可以通过参数函数手动指定。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 压缩文件
以上文件也已被压缩。ClickHouse 会自动检测并处理这些文件。
:::

要加载这些文件中的数据行,可以使用 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select):

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2 rows in set. Elapsed: 0.005 sec. Processed 8.19 thousand rows, 908.03 KB (1.63 million rows/s., 180.38 MB/s.)
```

也可以使用 [`FORMAT` 子句](/sql-reference/statements/select/format)以内联方式加载行数据,例如:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

这些示例假定使用 `JSONEachRow` 格式。系统同样支持其他常见的 JSON 格式,加载这些格式的示例请参见[此处](/integrations/data-formats/json/other-formats)。

## 加载半结构化 JSON \{#loading-semi-structured-json\}

前面的示例加载的是结构固定、键名和类型都已知的 JSON。现实中往往并非如此——可以新增键,或者键的类型会发生变化。这在可观测性数据等场景中非常常见。

ClickHouse 通过专用的 [`JSON`](/sql-reference/data-types/newjson) 类型来处理这种情况。

来看一个扩展版的上述 [Python PyPI dataset](https://clickpy.clickhouse.com/) 数据集示例。在这里,我们添加了一列名为 `tags` 的额外列,其中包含随机的键值对。

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

此处的 tags 列是不可预测的,因此我们无法对其进行建模。要加载这些数据,我们可以沿用之前的 schema,但额外提供一个类型为 [`JSON`](/sql-reference/data-types/newjson) 的 `tags` 列:

```sql
SET enable_json_type = 1;

CREATE TABLE pypi_with_tags
(
    `date` Date,
    `country_code` String,
    `project` String,
    `type` String,
    `installer` String,
    `python_minor` String,
    `system` String,
    `version` String,
    `tags` JSON
)
ENGINE = MergeTree
ORDER BY (project, date);
```

我们使用与原始数据集相同的方法来填充这张表:

```sql
INSERT INTO pypi_with_tags SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')
```

```sql
INSERT INTO pypi_with_tags SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')

Ok.

0 rows in set. Elapsed: 255.679 sec. Processed 1.00 million rows, 29.00 MB (3.91 thousand rows/s., 113.43 KB/s.)
Peak memory usage: 2.00 GiB.

SELECT *
FROM pypi_with_tags
LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┬─tags─────────────────────────────────────────────────────┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"nsBM":"5194603446944555691"}                           │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"4zD5MYQz4JkP1QqsJIS":"0","name":"8881321089124243208"} │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┴──────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.149 sec.
```

请注意此处在加载数据时的性能差异。`JSON` 列在插入时需要进行类型推断,并且如果某些列中存在多种类型的值,还需要额外的存储空间。尽管可以通过配置 `JSON` 类型(参见 [Designing JSON schema](/integrations/data-formats/json/schema))来获得与显式声明列相当的性能,但它在开箱即用时被刻意设计为更加灵活。不过,这种灵活性也会带来一定的代价。

### 何时使用 JSON 类型 \{#when-to-use-the-json-type\}

在以下情况下使用 `JSON` 类型:

* 数据具有**不可预测的键**,并且这些键会随时间变化。
* 数据包含**类型各异的值**(例如,同一路径有时为字符串,有时为数字)。
* 需要灵活的模式(schema),而严格的类型约束不可行。

如果你的数据结构是已知且稳定的,即使数据本身是 JSON 格式,也很少需要使用 `JSON` 类型。特别是当你的数据具有以下特征时:

* **已知键的扁平结构**:使用标准列类型,例如 String。
* **可预测的嵌套结构**:为这些结构使用 Tuple、Array 或 Nested 类型。
* **结构可预测但字段类型各异**:可以考虑使用 Dynamic 或 Variant 类型。

你也可以像上面的示例一样组合使用这些方法:对可预测的顶层键使用静态列,对负载中动态部分使用单个 JSON 列。