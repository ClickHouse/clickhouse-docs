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
---



_本指南适用于 ClickHouse Cloud 和自管理的 ClickHouse v23.5 及以上版本。_

本指南展示了如何将数据从 [BigQuery](https://cloud.google.com/bigquery) 迁移到 ClickHouse。

我们首先将一个表导出到 [Google 的对象存储（GCS）](https://cloud.google.com/storage)，然后将该数据导入到 [ClickHouse Cloud](https://clickhouse.com/cloud)。您需要为每个希望从 BigQuery 导出到 ClickHouse 的表重复这些步骤。

## 导出数据到 ClickHouse 需要多长时间？ {#how-long-will-exporting-data-to-clickhouse-take}

从 BigQuery 导出数据到 ClickHouse 的时间取决于您的数据集大小。作为比较，使用本指南将 [4TB 的公共 Ethereum 数据集](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) 从 BigQuery 导出到 ClickHouse 大约需要一个小时。

| 表                                                                                               | 行数          | 导出文件数      | 数据大小   | BigQuery 导出    | Slot 时间        | ClickHouse 导入   |
| ------------------------------------------------------------------------------------------------ | ------------- | -------------- | --------- | --------------- | ---------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)            | 16,569,489    | 73             | 14.53GB   | 23 秒           | 37 分钟          | 15.4 秒          |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169           | 957GB     | 1 分 38 秒      | 1 天 8 小时      | 18 分 5 秒       |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)            | 6,325,819,306 | 17,985         | 2.896TB   | 5 分 46 秒      | 5 天 19 小时     | 34 分 55 秒      |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)      | 57,225,837    | 350            | 45.35GB   | 16 秒           | 1 小时 51 分     | 39.4 秒          |
| 总计                                                                                             | 82.6 亿       | 23,577         | 3.982TB   | 8 分 3 秒       | > 6 天 5 小时    | 53 分 45 秒      |

## 1. 导出表数据到 GCS {#1-export-table-data-to-gcs}

在这一步中，我们利用 [BigQuery SQL 工作区](https://cloud.google.com/bigquery/docs/bigquery-web-ui) 执行我们的 SQL 命令。下面，我们使用 [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements) 语句将一个名为 `mytable` 的 BigQuery 表导出到一个 GCS 存储桶。

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

在上面的查询中，我们将我们的 BigQuery 表导出为 [Parquet 数据格式](https://parquet.apache.org/)。我们的 `uri` 参数中也包含一个 `*` 字符。此设置确保输出被分片为多个文件，当导出超过 1GB 数据时，文件名的后缀会按数字递增。

这种方法有很多优势：

- Google 允许每天最多导出 50TB 数据到 GCS，而不收取费用。用户只需支付 GCS 存储费用。
- 导出会自动生成多个文件，每个文件的表数据最大为 1GB。这对于 ClickHouse 来说是有利的，因为这允许并行导入。
- Parquet 作为一种列式格式，作为交换格式更佳，因为它本身是压缩的，且 BigQuery 导出和 ClickHouse 查询时更快。

## 2. 从 GCS 导入数据到 ClickHouse {#2-importing-data-into-clickhouse-from-gcs}

导出完成后，我们可以将此数据导入到 ClickHouse 表中。您可以使用 [ClickHouse SQL 控制台](/integrations/sql-clients/sql-console) 或 [`clickhouse-client`](/interfaces/cli) 执行下面的命令。

您必须首先在 ClickHouse 中 [创建表](/sql-reference/statements/create/table)：

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

创建表后，如果您的集群中有多个 ClickHouse 副本，请启用设置 `parallel_distributed_insert_select` 以加速导入。如果您只有一个 ClickHouse 节点，可以跳过此步骤：

```sql
SET parallel_distributed_insert_select = 1;
```

最后，我们可以使用 [`INSERT INTO SELECT` 命令](/sql-reference/statements/insert-into#inserting-the-results-of-select) 将数据从 GCS 插入到我们的 ClickHouse 表，该命令根据 `SELECT` 查询的结果向表中插入数据。

为了检索要 `INSERT` 的数据，我们可以使用 [s3Cluster 函数](/sql-reference/table-functions/s3Cluster) 从我们的 GCS 存储桶检索数据，因为 GCS 与 [Amazon S3](https://aws.amazon.com/s3/) 是互操作的。如果您只有一个 ClickHouse 节点，可以使用 [s3 表函数](/sql-reference/table-functions/s3) 来代替 `s3Cluster` 函数。

```sql
INSERT INTO mytable
SELECT
    timestamp,
    ifNull(some_text, '') as some_text
FROM s3Cluster(
    'default',
    'https://storage.googleapis.com/mybucket/mytable/*.parquet.gz',
    '<ACCESS_ID>',
    '<SECRET>'
);
```

上述查询中使用的 `ACCESS_ID` 和 `SECRET` 是与您的 GCS 存储桶相关联的 [HMAC 密钥](https://cloud.google.com/storage/docs/authentication/hmackeys)。

:::note 使用 `ifNull` 导出可空列
在上述查询中，我们使用 [`ifNull` 函数](/sql-reference/functions/functions-for-nulls#ifnull) 和 `some_text` 列来用默认值插入数据到我们的 ClickHouse 表中。您也可以在 ClickHouse 中将列标记为 [`Nullable`](/sql-reference/data-types/nullable)，但这不推荐，因为可能会对性能产生负面影响。

或者，您可以 `SET input_format_null_as_default=1`，那么任何缺失或 NULL 值会被其各自列的默认值替代（前提是这些默认值被指定）。
:::

## 3. 测试数据导出是否成功 {#3-testing-successful-data-export}

要测试您的数据是否正确插入，只需对新表运行一个 `SELECT` 查询：

```sql
SELECT * FROM mytable limit 10;
```

要导出更多 BigQuery 表，只需对每个额外的表重复上述步骤。

## 进一步阅读和支持 {#further-reading-and-support}

除了本指南，我们还推荐阅读我们的博客文章，展示了 [如何使用 ClickHouse 加速 BigQuery 以及如何处理增量导入](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)。

如果在将数据从 BigQuery 迁移到 ClickHouse 时遇到问题，请随时通过 support@clickhouse.com 联系我们。
