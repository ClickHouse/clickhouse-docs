---
sidebar_label: '加载 JSON'
sidebar_position: 20
title: '使用 JSON'
slug: /integrations/data-formats/json/loading
description: '加载 JSON'
keywords: ['json', 'clickhouse', '插入', '加载', '插入']
score: 15
doc_type: 'guide'
---



# 加载 JSON {#loading-json}

以下示例展示了如何加载结构化和半结构化 JSON 数据的基本方法。对于更复杂的 JSON(包括嵌套结构),请参阅指南 [**设计 JSON 模式**](/integrations/data-formats/json/schema)。


## 加载结构化 JSON {#loading-structured-json}

在本节中,我们假设 JSON 数据采用 [`NDJSON`](https://github.com/ndjson/ndjson-spec)(换行符分隔的 JSON)格式,在 ClickHouse 中称为 [`JSONEachRow`](/interfaces/formats/JSONEachRow),并且结构良好,即列名和类型是固定的。由于 `NDJSON` 格式简洁且空间利用率高,因此是加载 JSON 的首选格式,但 ClickHouse 也支持其他格式用于[输入和输出](/interfaces/formats/JSON)。

考虑以下 JSON 示例,它表示来自 [Python PyPI 数据集](https://clickpy.clickhouse.com/)的一行数据:

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

要将此 JSON 对象加载到 ClickHouse 中,必须定义表结构。

在这个简单的示例中,我们的结构是静态的,列名是已知的,并且它们的类型是明确定义的。

虽然 ClickHouse 通过 JSON 类型支持半结构化数据,其中键名及其类型可以是动态的,但在这里不需要使用该类型。

:::note 尽可能使用静态结构
在列具有固定名称和类型,并且不期望出现新列的情况下,在生产环境中始终优先使用静态定义的结构。

JSON 类型适用于高度动态的数据,其中列的名称和类型可能会发生变化。此类型在原型设计和数据探索中也很有用。
:::

下面显示了一个简单的结构定义,其中 **JSON 键映射到列名**:

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
我们在这里通过 `ORDER BY` 子句选择了排序键。有关排序键及其选择方法的更多详细信息,请参阅[此处](/data-modeling/schema-design#choosing-an-ordering-key)。
:::

ClickHouse 可以加载多种格式的 JSON 数据,并自动从扩展名和内容推断类型。我们可以使用 [S3 函数](/sql-reference/table-functions/s3)读取上述表的 JSON 文件:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

返回 1 行。耗时:1.232 秒。
```

请注意,我们不需要指定文件格式。相反,我们使用 glob 模式读取存储桶中的所有 `*.json.gz` 文件。ClickHouse 会自动从文件扩展名和内容推断格式为 `JSONEachRow`(ndjson)。如果 ClickHouse 无法检测格式,可以通过参数函数手动指定格式。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 压缩文件
上述文件也是压缩的。ClickHouse 会自动检测并处理压缩文件。
:::

要加载这些文件中的行,我们可以使用 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select):

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

返回 0 行。耗时:10.445 秒。已处理 1949 万行,35.71 MB(187 万行/秒,3.42 MB/秒)。

SELECT * FROM pypi LIMIT 2

```


┌───────date─┬─country&#95;code─┬─project────────────┬─type──┬─installer────┬─python&#95;minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2 行结果。耗时：0.005 秒。已处理 8.19 千行，908.03 KB（1.63 百万行/秒，180.38 MB/秒）。

````

也可以使用 [`FORMAT` 子句](/sql-reference/statements/select/format)以内联方式加载行数据,例如:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
````

这些示例假定使用 `JSONEachRow` 格式。还支持其他常见的 JSON 格式，其加载示例见[此处](/integrations/data-formats/json/other-formats)。


## 加载半结构化 JSON {#loading-semi-structured-json}

我们之前的示例加载的 JSON 是静态的,具有已知的键名和类型。但实际情况往往并非如此——键可能会被添加,或者它们的类型可能会发生变化。这在可观测性数据等使用场景中很常见。

ClickHouse 通过专用的 [`JSON`](/sql-reference/data-types/newjson) 类型来处理这种情况。

请参考以下来自上述 [Python PyPI 数据集](https://clickpy.clickhouse.com/)扩展版本的示例。在这里,我们添加了一个任意的 `tags` 列,其中包含随机的键值对。

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

这里的 tags 列是不可预测的,因此我们无法对其进行建模。要加载这些数据,我们可以使用之前的模式,但需要提供一个类型为 [`JSON`](/sql-reference/data-types/newjson) 的额外 `tags` 列:

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

我们使用与原始数据集相同的方法填充表:

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

请注意这里在加载数据时的性能差异。JSON 列在插入时需要进行类型推断,如果列存在多种类型,还需要额外的存储空间。尽管可以配置 JSON 类型(参见[设计 JSON 模式](/integrations/data-formats/json/schema))以获得与显式声明列相当的性能,但它在开箱即用时是有意设计为灵活的。然而,这种灵活性是有一定代价的。

### 何时使用 JSON 类型 {#when-to-use-the-json-type}

在以下情况下使用 JSON 类型:

- 具有可能随时间变化的**不可预测的键**。
- 包含**类型可变的值**(例如,某个路径有时可能包含字符串,有时可能包含数字)。
- 需要模式灵活性,而严格类型化不可行。

如果您的数据结构是已知且一致的,即使数据采用 JSON 格式,也很少需要使用 JSON 类型。具体来说,如果您的数据具有以下特征:


* **具有已知键的扁平结构**：使用标准列类型，例如 String。
* **嵌套结构可预测**：对这些结构使用 Tuple、Array 或 Nested 类型。
* **结构可预测但列类型多样**：可以考虑改用 Dynamic 或 Variant 类型。

你也可以像上面的示例一样组合使用这些方法：对可预测的顶层键使用静态列类型，对负载中动态部分使用单个 JSON 列。
