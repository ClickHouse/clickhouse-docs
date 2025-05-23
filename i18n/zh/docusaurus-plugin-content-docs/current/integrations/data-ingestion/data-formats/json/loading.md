---
'sidebar_label': '加载 JSON'
'sidebar_position': 20
'title': '处理 JSON'
'slug': '/integrations/data-formats/json/loading'
'description': '加载 JSON'
'keywords':
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'inserting'
'score': 15
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 加载 JSON {#loading-json}

以下示例提供了加载结构化和半结构化 JSON 数据的一个非常简单的例子。有关更复杂的 JSON，包括嵌套结构，请参阅指南 [**设计 JSON 模式**](/integrations/data-formats/json/schema)。

## 加载结构化 JSON {#loading-structured-json}

在本节中，我们假设 JSON 数据采用 [`NDJSON`](https://github.com/ndjson/ndjson-spec)（换行符分隔的 JSON）格式，在 ClickHouse 中被称为 [`JSONEachRow`](/interfaces/formats#jsoneachrow)，且结构良好，即列名和类型是固定的。`NDJSON` 是加载 JSON 的首选格式，因为它简洁且有效利用空间，但其他格式也受支持，用于输入和输出 [input and output](/interfaces/formats#json)。

考虑以下 JSON 示例，表示来自 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的一行：

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

为了将此 JSON 对象加载到 ClickHouse 中，必须定义一个表模式。

在这个简单的情况下，我们的结构是静态的，我们的列名是已知的，且它们的类型是明确定义的。

虽然 ClickHouse 通过 JSON 类型支持半结构化数据，其中键名及其类型可以是动态的，但在这里这是不必要的。

:::note 尽可能优先使用静态模式
在列名和类型固定且不期望新列的情况下，始终在生产环境中优先使用静态定义的模式。

对于高度动态的数据，建议使用 JSON 类型，其中列的名称和类型可能会发生变化。此类型在原型开发和数据探索中也非常有用。
:::

下方显示了一个简单的模式，其中 **JSON 键映射到列名**：

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
我们通过 `ORDER BY` 子句选择了一个排序键。有关排序键及其选择的更多详细信息，请参见 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。
:::

ClickHouse 可以以多种格式加载 JSON 数据，自动从扩展名和内容推断类型。我们可以使用 [S3 函数](/sql-reference/table-functions/s3) 读取上述表的 JSON 文件：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

请注意，我们无需指定文件格式。相反，我们使用通配符模式读取桶中的所有 `*.json.gz` 文件。ClickHouse 自动推断文件扩展名和内容为 `JSONEachRow`（ndjson）格式。如果 ClickHouse 无法检测到格式，可以通过参数函数手动指定格式。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 压缩文件
上述文件也被压缩。这由 ClickHouse 自动检测和处理。
:::

为了加载这些文件中的行，我们可以使用 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)：

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

行也可以使用 [`FORMAT` 子句](/sql-reference/statements/select/format) 进行内联加载，例如：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

这些示例假设使用 `JSONEachRow` 格式。也支持其他常见的 JSON 格式，相关加载示例提供 [这里](/integrations/data-formats/json/other-formats)。

## 加载半结构化 JSON {#loading-semi-structured-json}

<PrivatePreviewBadge/>

我们之前的示例加载了具有已知键名和类型的静态 JSON。这往往不是情况 - 键可以被添加或其类型可以改变。这在可观察性数据等用例中很常见。

ClickHouse 通过专用的 [`JSON`](/sql-reference/data-types/newjson) 类型来处理这个问题。

考虑来自上述 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的扩展版本的以下示例。在这里，我们添加了一列任意的 `tags`，其中包含随机的键值对。

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

这里的 tags 列是不可预测的，因此我们无法对其建模。为了加载这些数据，我们可以使用我们之前的模式，但提供一个附加的 `tags` 列，类型为 [`JSON`](/sql-reference/data-types/newjson)：

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

我们使用与原始数据集相同的方法填充表：

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

请注意，加载数据时的性能差异。JSON 列在插入时需要类型推断，并且如果存在多于一种类型的列，则需要额外的存储。虽然可以配置 JSON 类型（请参见 [设计 JSON 模式](/integrations/data-formats/json/schema)）以实现与显式声明列相当的性能，但它在开箱即用时有意灵活。然而，这种灵活性也会带来一些成本。

### 何时使用 JSON 类型 {#when-to-use-the-json-type}

在以下情况下使用 JSON 类型：

* 具有 **不可预测的键**，可能会随时间变化。
* 包含 **具有不同类型的值**（例如，路径有时可能包含字符串，有时可能是数字）。
* 需要模式灵活性，而严格类型不可行。

如果您的数据结构已知且一致，几乎没有必要使用 JSON 类型，即使您的数据是 JSON 格式。具体而言，如果您的数据具有：

* **已知键的扁平结构**：使用标准列类型，例如 String。
* **可预测的嵌套**：为这些结构使用 Tuple、Array 或 Nested 类型。
* **可预测结构但具有不同类型**：考虑使用 Dynamic 或 Variant 类型。

您还可以像上面的示例那样混合使用方法，使用静态列对应可预测的顶层键，并为负载的动态部分使用单一的 JSON 列。
