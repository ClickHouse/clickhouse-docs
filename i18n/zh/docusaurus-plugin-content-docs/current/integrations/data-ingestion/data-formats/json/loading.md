---
sidebar_label: 加载 JSON
sidebar_position: 20
title: 处理 JSON
slug: /integrations/data-formats/json/loading
description: 加载 JSON
keywords: [json, clickhouse, inserting, loading]
---


# 加载 JSON

在这一部分，我们假设 JSON 数据采用 [NDJSON](https://github.com/ndjson/ndjson-spec)（换行符分隔的 JSON）格式，在 ClickHouse 中称为 [`JSONEachRow`](/interfaces/formats#jsoneachrow)。由于其简洁性和高效的空间利用，这是加载 JSON 的首选格式，但其他格式亦支持 [输入和输出](/interfaces/formats#json)。

考虑以下 JSON 示例，代表来自 [Python PyPI 数据集](https://clickpy.clickhouse.com/) 的一行数据：

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

为了将此 JSON 对象加载到 ClickHouse 中，必须定义一个表模式。下面显示了一个简单的模式，其中 **JSON 键映射到列名**：

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
我们通过 `ORDER BY` 子句在这里选择了一个排序键。有关排序键的更多详细信息以及如何选择它们，请参见 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。
:::

ClickHouse 可以以多种格式加载 JSON 数据，根据扩展名及内容自动推断类型。我们可以使用 [S3 函数](/sql-reference/table-functions/s3) 读取上述表的 JSON 文件：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

注意，我们不需要指定文件格式。相反，我们使用通配符模式读取存储桶中的所有 `*.json.gz` 文件。ClickHouse 自动从文件扩展名和内容推断格式为 `JSONEachRow`（ndjson）。如果 ClickHouse 无法检测到格式，可以通过参数函数手动指定格式。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 压缩文件
上述文件也进行了压缩。ClickHouse 会自动检测并处理此情况。
:::

要加载这些文件中的行，我们可以使用 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)：

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┐
│ 2022-05-26 │ CN       	│ clickhouse-connect │
│ 2022-05-26 │ CN       	│ clickhouse-connect │
└────────────┴──────────────┴────────────────────┘

2 rows in set. Elapsed: 0.005 sec. Processed 8.19 thousand rows, 908.03 KB (1.63 million rows/s., 180.38 MB/s.)
```

行也可以使用 [`FORMAT` 子句](/sql-reference/statements/select/format) 在线加载，例如：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

这些示例假设使用 JSONEachRow 格式。其他常见的 JSON 格式也受到支持，加载这些格式的示例可以在 [这里](/integrations/data-formats/json/other-formats) 找到。

上述提供了一个非常简单的 JSON 数据加载示例。对于更复杂的 JSON，包括嵌套结构，请参见指南 [**设计 JSON 模式**](/integrations/data-formats/json/schema)。
