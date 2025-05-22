import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# 加载 JSON {#loading-json}

以下示例提供了加载结构化和半结构化 JSON 数据的非常简单的例子。有关更复杂的 JSON 包括嵌套结构，请参见 [**设计 JSON 架构**](/integrations/data-formats/json/schema) 的指南。

## 加载结构化 JSON {#loading-structured-json}

在本节中，我们假设 JSON 数据采用 [`NDJSON`](https://github.com/ndjson/ndjson-spec)（换行分隔 JSON）格式，在 ClickHouse 中称为 [`JSONEachRow`](/interfaces/formats#jsoneachrow)，且结构良好，即列名和类型是固定的。由于 `NDJSON` 格式简洁且有效利用空间，因此它是加载 JSON 的首选格式，其他格式亦被支持用于 [输入和输出](/interfaces/formats#json)。

考虑以下 JSON 示例，表示 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 中的一行：

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

为了将此 JSON 对象加载到 ClickHouse 中，必须定义一个表架构。

在这个简单的案例中，我们的结构是静态的，列名是已知的，并且它们的类型是明确定义的。

虽然 ClickHouse 通过 JSON 类型支持半结构化数据，键名及其类型可以是动态的，但在这里这是不必要的。

:::note 优先使用静态架构
在列名和类型固定且不期望有新列的情况下，始终优先在生产中使用静态定义的架构。

对于高度动态的数据，倾向于使用 JSON 类型，其中列的名称和类型可能会发生变化。此类型在原型设计和数据探索中也很有用。
:::

简单架构如下，其中 **JSON 键映射为列名**：

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
我们通过 `ORDER BY` 子句选择了一个排序键。有关排序键及其选择的详细信息，请参见 [此处](/data-modeling/schema-design#choosing-an-ordering-key)。
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

注意，我们不需要指定文件格式。相反，我们使用通配符模式读取存储桶中的所有 `*.json.gz` 文件。ClickHouse 自动从文件扩展名和内容推断格式为 `JSONEachRow`（ndjson）。如果 ClickHouse 无法检测格式，可以通过参数函数手动指定格式。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 压缩文件
上述文件也是压缩的。这一点由 ClickHouse 自动检测和处理。
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

行也可以使用 [`FORMAT` 子句](/sql-reference/statements/select/format) 直接加载，例如：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

这些示例假设使用 `JSONEachRow` 格式。其他常见的 JSON 格式也受支持，加载这些格式的示例提供在 [这里](/integrations/data-formats/json/other-formats)。

## 加载半结构化 JSON {#loading-semi-structured-json}

<PrivatePreviewBadge/>

我们之前的示例加载了静态的 JSON，键名和类型都是已知的。这通常并非如此——键可以被添加或其类型可以更改。这在可观测性数据等用例中很常见。

ClickHouse 通过专用的 [`JSON`](/sql-reference/data-types/newjson) 类型处理此类情况。

考虑以下来自扩展版本的 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的示例。在这里，我们添加了一个任意的 `tags` 列，包含随机键值对。

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

此处的 tags 列是不可预测的，因此我们无法为其建模。要加载这些数据，我们可以使用之前的架构，但提供一个附加的 `tags` 列，类型为 [`JSON`](/sql-reference/data-types/newjson):

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

注意在加载数据时的性能差异。JSON 列在插入时需要类型推断，以及如果存在多种类型的列，则需要额外的存储。尽管可以配置 JSON 类型（见 [设计 JSON 架构](/integrations/data-formats/json/schema)）以获得与显式声明列相当的性能，但其默认设置是故意灵活的。然而，这种灵活性是有代价的。

### 何时使用 JSON 类型 {#when-to-use-the-json-type}

当您的数据：

* 具有 **不可预测的键**，可能随时间变化。
* 包含 **具有不同类型的值**（例如，一个路径有时可能包含字符串，有时可能包含数字）。
* 需要架构灵活性，严格类型不适用。

如果您的数据结构已知且一致，通常不需要 JSON 类型，即使您的数据是 JSON 格式。具体来说，如果您的数据具有：

* **具有已知键的扁平结构**：使用标准列类型，例如 String。
* **可预测的嵌套**：使用 Tuple、Array 或 Nested 类型来处理这些结构。
* **具有不同类型的可预测结构**：考虑使用 Dynamic 或 Variant 类型。

您还可以混合使用方法，就像我们在上面的示例中所做的那样，对于可预测的顶级键使用静态列，对动态负载的部分使用单个 JSON 列。
