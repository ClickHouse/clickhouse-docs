---
'sidebar_label': '加载数据'
'title': '从 BigQuery 加载数据到 ClickHouse'
'slug': '/migrations/bigquery/loading-data'
'description': '如何从 BigQuery 加载数据到 ClickHouse'
'keywords':
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'BigQuery'
'doc_type': 'guide'
---

_本指南兼容 ClickHouse Cloud 以及自管理的 ClickHouse v23.5+。_

本指南展示了如何将数据从 [BigQuery](https://cloud.google.com/bigquery) 迁移到 ClickHouse。

我们首先将一个表导出到 [Google 的对象存储 (GCS)](https://cloud.google.com/storage)，然后将该数据导入到 [ClickHouse Cloud](https://clickhouse.com/cloud)。这些步骤需要为您希望从 BigQuery 导出到 ClickHouse 的每个表重复。

## 将数据导出到 ClickHouse 需要多长时间？ {#how-long-will-exporting-data-to-clickhouse-take}

从 BigQuery 导出数据到 ClickHouse 的时间取决于您的数据集大小。作为比较，使用本指南从 BigQuery 导出 [4TB 的公开以太坊数据集](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) 到 ClickHouse 大约需要一个小时。

| 表                                                                                             | 行数          | 导出文件数 | 数据大小 | BigQuery 导出 | 槽时间         | ClickHouse 导入 |
| ------------------------------------------------------------------------------------------------- | ------------- | -------------- | --------- | --------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16,569,489    | 73             | 14.53GB   | 23秒           | 37分钟          | 15.4秒           |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169           | 957GB     | 1分钟 38秒     | 1天 8小时       | 18分钟 5秒      |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6,325,819,306 | 17,985         | 2.896TB   | 5分钟 46秒     | 5天 19小时      | 34分钟 55秒     |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57,225,837    | 350            | 45.35GB   | 16秒           | 1小时 51分钟    | 39.4秒           |
| 总计                                                                                             | 82.6亿        | 23,577         | 3.982TB   | 8分钟 3秒     | \> 6天 5小时    | 53分钟 45秒     |

<VerticalStepper headerLevel="h2">

## 将表数据导出到 GCS {#1-export-table-data-to-gcs}

在此步骤中，我们利用 [BigQuery SQL 工作区](https://cloud.google.com/bigquery/docs/bigquery-web-ui) 执行我们的 SQL 命令。下面，我们使用 [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements) 语句将 BigQuery 表 `mytable` 导出到 GCS 存储桶。

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- We recommend setting n to correspond to x billion rows. So 5 billion rows, n = 5
SET n = 100;

WHILE i < n DO
  SET export_path = CONCAT('gs://mybucket/mytable/', i,'-*.parquet');
  EXPORT DATA
    OPTIONS (
      uri = export_path,
      format = 'PARQUET',
      overwrite = true
    )
  AS (
    SELECT * FROM mytable WHERE export_id = i
  );
  SET i = i + 1;
END WHILE;
```

在上述查询中，我们将 BigQuery 表导出为 [Parquet 数据格式](https://parquet.apache.org/)。我们在 `uri` 参数中具有 `*` 字符。这确保如果导出的数据超过 1GB，输出将分片为多个文件，并且具有递增的数字后缀。

这种方法有多个优点：

- Google 允许每天最多将 50TB 数据免费导出到 GCS。用户仅需为 GCS 存储付费。
- 导出会自动生成多个文件，限制每个文件最大为 1GB 的表数据。这对 ClickHouse 有好处，因为它允许导入并行化。
- Parquet 作为一种列式格式，提供了更好的交换格式，因为它本质上是压缩的，BigQuery 导出和 ClickHouse 查询的速度更快。

## 从 GCS 导入数据到 ClickHouse {#2-importing-data-into-clickhouse-from-gcs}

一旦导出完成，我们可以将这些数据导入到 ClickHouse 表中。您可以使用 [ClickHouse SQL 控制台](/integrations/sql-clients/sql-console) 或 [`clickhouse-client`](/interfaces/cli) 执行以下命令。

您必须先在 ClickHouse 中 [创建表](/sql-reference/statements/create/table)：

```sql
-- If your BigQuery table contains a column of type STRUCT, you must enable this setting
-- to map that column to a ClickHouse column of type Nested
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
        `timestamp` DateTime64(6),
        `some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

创建表之后，如果您的集群中有多个 ClickHouse 副本，请启用设置 `parallel_distributed_insert_select` 来加速我们的导出。如果您只有一个 ClickHouse 节点，则可以跳过此步骤：

```sql
SET parallel_distributed_insert_select = 1;
```

最后，我们可以使用 [`INSERT INTO SELECT` 命令](/sql-reference/statements/insert-into#inserting-the-results-of-select) 将 GCS 中的数据插入到 ClickHouse 表中，该命令基于 `SELECT` 查询的结果将数据插入表中。

为了检索要 `INSERT` 的数据，我们可以使用 [s3Cluster 函数](/sql-reference/table-functions/s3Cluster) 从我们的 GCS 存储桶中检索数据，因为 GCS 与 [Amazon S3](https://aws.amazon.com/s3/) 兼容。如果您只有一个 ClickHouse 节点，也可以使用 [s3 表函数](/sql-reference/table-functions/s3) 而不是 `s3Cluster` 函数。

```sql
INSERT INTO mytable
SELECT
    timestamp,
    ifNull(some_text, '') AS some_text
FROM s3Cluster(
    'default',
    'https://storage.googleapis.com/mybucket/mytable/*.parquet.gz',
    '<ACCESS_ID>',
    '<SECRET>'
);
```

上述查询中使用的 `ACCESS_ID` 和 `SECRET` 是与您的 GCS 存储桶关联的 [HMAC 密钥](https://cloud.google.com/storage/docs/authentication/hmackeys)。

:::note 使用 `ifNull` 导出 nullable 列
在上述查询中，我们使用 [`ifNull` 函数](/sql-reference/functions/functions-for-nulls#ifNull) 在 `some_text` 列中插入数据到我们的 ClickHouse 表中，设置默认值。您也可以在 ClickHouse 中将列设置为 [`Nullable`](/sql-reference/data-types/nullable)，但不建议这样做，因为可能会对性能产生负面影响。

另外，您可以 `SET input_format_null_as_default=1`，任何缺失或 NULL 值将被替换为其各自列的默认值（如果已指定这些默认值）。
:::

## 测试数据导出是否成功 {#3-testing-successful-data-export}

要测试您的数据是否正确插入，只需在您的新表上运行 `SELECT` 查询：

```sql
SELECT * FROM mytable LIMIT 10;
```

要导出更多的 BigQuery 表，只需为每个附加表重复上述步骤。

</VerticalStepper>

## 进一步阅读和支持 {#further-reading-and-support}

除了本指南外，我们还推荐阅读我们的博客文章，展示 [如何使用 ClickHouse 加速 BigQuery 以及如何处理增量导入](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)。

如果您在从 BigQuery 到 ClickHouse 传输数据时遇到问题，请随时通过 support@clickhouse.com 联系我们。
