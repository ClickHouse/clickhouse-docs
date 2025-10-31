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
'doc_type': 'guide'
---


# 加载 JSON {#loading-json}

以下示例提供了加载结构化和半结构化 JSON 数据的非常简单的示例。有关更复杂的 JSON，包括嵌套结构，请参阅指南 [**设计 JSON 模式**](/integrations/data-formats/json/schema)。

## 加载结构化 JSON {#loading-structured-json}

在本节中，我们假设 JSON 数据采用 [`NDJSON`](https://github.com/ndjson/ndjson-spec)（换行分隔 JSON）格式，在 ClickHouse 中称为 [`JSONEachRow`](/interfaces/formats#jsoneachrow)，并且结构良好，即列名和类型是固定的。由于其简洁性和高效的空间使用，`NDJSON` 是加载 JSON 的首选格式，但其他格式也受支持，包括 [输入和输出](/interfaces/formats#json)。

考虑以下 JSON 示例，表示来自 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的一行数据。

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

为了将此 JSON 对象加载到 ClickHouse 中，必须定义表模式。

在这个简单的例子中，我们的结构是静态的，我们的列名是已知的，类型也是明确定义的。

尽管 ClickHouse 通过 JSON 类型支持半结构化数据，其中键名及其类型可以是动态的，但在这里这是不必要的。

:::note 尽可能选择静态模式
在您的列具有固定名称和类型且不期望新列的情况下，在生产环境中始终优先选择静态定义的模式。

对于高度动态的数据，JSON 类型是首选，由于列的名称和类型可能会改变。此类型在原型设计和数据探索中也很有用。
:::

下面显示了一个简单的模式，其中 **JSON 键映射到列名**：

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
我们通过 `ORDER BY` 子句选择了一个排序键。有关排序键及如何选择它们的详细信息，请参见 [此处](/data-modeling/schema-design#choosing-an-ordering-key)。
:::

ClickHouse 可以以几种格式加载 JSON 数据，自动根据扩展名和内容推断类型。我们可以使用 [S3 函数](/sql-reference/table-functions/s3) 读取上述表的 JSON 文件：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

注意我们无需指定文件格式。相反，我们使用通配符模式读取存储桶中的所有 `*.json.gz` 文件。 ClickHouse 会自动根据文件扩展名和内容推断格式为 `JSONEachRow`（ndjson）。如果 ClickHouse 无法检测格式，可以通过参数函数手动指定格式。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 压缩文件
上述文件也是压缩的。ClickHouse 会自动检测和处理压缩文件。
:::

要加载这些文件中的行，我们可以使用 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)：

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

行也可以通过 [`FORMAT` 子句](/sql-reference/statements/select/format) 内联加载，例如：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

这些示例假设使用 `JSONEachRow` 格式。支持其他常见的 JSON 格式，这些格式的加载示例在 [此处](/integrations/data-formats/json/other-formats) 提供。

## 加载半结构化 JSON {#loading-semi-structured-json}

我们之前的示例加载了具有静态且已知键名和类型的 JSON。这种情况通常不是这样 - 密钥可以被添加或其类型可以改变。这在可观察性数据等用例中是很常见的。

ClickHouse 通过专用的 [`JSON`](/sql-reference/data-types/newjson) 类型处理这种情况。

考虑以下示例，来自上述 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的扩展版本。在这里，我们添加了一个任意的 `tags` 列，包含随机键值对。

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

这里的 tags 列是不可预测的，因此我们无法为其建模。要加载这些数据，我们可以使用我们之前的模式，但提供一个额外的 `tags` 列，其类型为 [`JSON`](/sql-reference/data-types/newjson)：

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

我们使用与原始数据集相同的方法填充表格：

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

注意这里加载数据时的性能差异。JSON 列在插入时需要进行类型推断，如果存在多个类型的列，则还需要额外存储。尽管可以配置 JSON 类型（参见 [设计 JSON 模式](/integrations/data-formats/json/schema)）以实现与显式声明列的等效性能，但它的灵活性是在开箱即用的情况下设计的。然而，这种灵活性是有代价的。

### 何时使用 JSON 类型 {#when-to-use-the-json-type}

当您的数据：

* 具有 **不可预测的键**，这些键可以随时间变化。
* 包含 **具有不同类型的值**（例如，一个路径有时可能包含一个字符串，有时是一个数字）。
* 需要模式灵活性，而严格类型不切实际。

如果您的数据结构是已知且一致的，则几乎不需要使用 JSON 类型，即使您的数据是 JSON 格式。具体来说，如果您的数据具有：

* **具有已知键的扁平结构**：使用标准列类型，例如 String。
* **可预测的嵌套**：使用 Tuple、Array 或 Nested 类型来表示这些结构。
* **具有不同类型的可预测结构**：可以考虑使用 Dynamic 或 Variant 类型。

您还可以像我们在上述示例中所做的那样混合使用方法，使用静态列来表示可预测的顶级键，并使用单个 JSON 列来表示有效负载的动态部分。
