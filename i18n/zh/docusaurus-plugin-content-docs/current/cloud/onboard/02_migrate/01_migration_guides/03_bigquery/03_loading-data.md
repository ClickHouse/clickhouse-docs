---
sidebar_label: '加载数据'
title: '从 BigQuery 向 ClickHouse 加载数据'
slug: /migrations/bigquery/loading-data
description: '如何从 BigQuery 向 ClickHouse 加载数据'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'BigQuery']
doc_type: 'guide'
---

_本指南适用于 ClickHouse Cloud 以及自托管的 ClickHouse v23.5 及以上版本。_

本指南演示如何将数据从 [BigQuery](https://cloud.google.com/bigquery) 迁移到 ClickHouse。

我们首先将表导出到 [Google 的对象存储 (GCS)](https://cloud.google.com/storage)，然后将这些数据导入 [ClickHouse Cloud](https://clickhouse.com/cloud)。对于每一张要从 BigQuery 导出到 ClickHouse 的表，都需要重复执行这些步骤。

## 将数据导出到 ClickHouse 需要多长时间? {#how-long-will-exporting-data-to-clickhouse-take}

从 BigQuery 导出数据到 ClickHouse 所需的时间取决于数据集的大小。作为参考,使用本指南将 [4TB 公共以太坊数据集](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) 从 BigQuery 导出到 ClickHouse 大约需要一小时。

| 表                                                                                             | 行数          | 导出文件数 | 数据大小 | BigQuery 导出 | 槽位时间       | ClickHouse 导入 |
| ------------------------------------------------------------------------------------------------- | ------------- | -------------- | --------- | --------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16,569,489    | 73             | 14.53GB   | 23 秒         | 37 分钟          | 15.4 秒         |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169           | 957GB     | 1 分 38 秒    | 1 天 8 小时      | 18 分 5 秒    |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6,325,819,306 | 17,985         | 2.896TB   | 5 分 46 秒    | 5 天 19 小时    | 34 分 55 秒   |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57,225,837    | 350            | 45.35GB   | 16 秒          | 1 小时 51 分钟     | 39.4 秒         |
| 总计                                                                                             | 82.6 亿  | 23,577         | 3.982TB   | 8 分 3 秒     | \> 6 天 5 小时 | 53 分 45 秒   |

<VerticalStepper headerLevel="h2">

## 将表数据导出到 GCS {#1-export-table-data-to-gcs}

在此步骤中，我们使用 [BigQuery SQL workspace](https://cloud.google.com/bigquery/docs/bigquery-web-ui) 来执行 SQL 命令。下面的示例中，我们使用 [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements) 语句，将名为 `mytable` 的 BigQuery 表导出到一个 GCS 存储桶中。

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- 建议将 n 设置为对应的十亿行数。例如 50 亿行时,n = 5
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

在上述查询中，我们将 BigQuery 表导出为 [Parquet 数据格式](https://parquet.apache.org/)。我们在 `uri` 参数中还使用了一个 `*` 字符。这可以确保当导出数据超过 1GB 时，输出会被切分为多个文件，并带有数值递增的后缀。

这种方法有多项优势：

* Google 允许每天最多将 50TB 数据免费导出到 GCS。用户只需为 GCS 存储付费。
* 导出会自动生成多个文件，将每个文件限制在最多 1GB 的表数据。这对 ClickHouse 有利，因为这样可以并行导入。
* Parquet 作为列式格式，是更好的交换格式，因为它天然具备压缩特性，并且对 BigQuery 导出和 ClickHouse 查询都更快。

## 将数据从 GCS 导入 ClickHouse {#2-importing-data-into-clickhouse-from-gcs}

导出完成后，我们即可将这些数据导入到 ClickHouse 表中。可以使用 [ClickHouse SQL console](/integrations/sql-clients/sql-console) 或 [`clickhouse-client`](/interfaces/cli) 来执行以下命令。

首先，需要在 ClickHouse 中[创建表](/sql-reference/statements/create/table)：

```sql
-- 如果您的 BigQuery 表包含 STRUCT 类型的列，必须启用此设置
-- 以将该列映射到 ClickHouse 的 Nested 类型列
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
        `timestamp` DateTime64(6),
        `some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

创建表之后，如果集群中有多个 ClickHouse 副本，请启用 `parallel_distributed_insert_select` 设置以加快导出速度。如果只有一个 ClickHouse 节点，可以跳过此步骤：

```sql
SET parallel_distributed_insert_select = 1;
```

最后，我们可以使用 [`INSERT INTO SELECT` 命令](/sql-reference/statements/insert-into#inserting-the-results-of-select)，将来自 GCS 的数据插入到 ClickHouse 表中。该命令会根据 `SELECT` 查询的结果向表中插入数据。

为了获取要 `INSERT` 的数据，我们可以使用 [s3Cluster 函数](/sql-reference/table-functions/s3Cluster) 从 GCS 存储桶中读取数据，因为 GCS 与 [Amazon S3](https://aws.amazon.com/s3/) 兼容。如果您只有一个 ClickHouse 节点，可以使用 [s3 表函数](/sql-reference/table-functions/s3) 来替代 `s3Cluster` 函数。

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

上述查询中使用的 `ACCESS_ID` 和 `SECRET` 是与您的 GCS 存储桶关联的 [HMAC key](https://cloud.google.com/storage/docs/authentication/hmackeys)。

:::note 在导出可为 NULL 的列时使用 `ifNull`
在上述查询中，我们对 `some_text` 列使用了 [`ifNull` 函数](/sql-reference/functions/functions-for-nulls#ifNull)，以默认值向 ClickHouse 表插入数据。您也可以在 ClickHouse 中将列类型设置为 [`Nullable`](/sql-reference/data-types/nullable)，但不推荐这样做，因为这可能会对性能产生负面影响。

或者，您可以设置 `SET input_format_null_as_default=1`，此时任何缺失或 NULL 值都会被其对应列的默认值替换（前提是这些列已指定默认值）。
:::

## 测试数据导出是否成功 {#3-testing-successful-data-export}

要测试数据是否已正确插入,只需对新表执行 `SELECT` 查询:

```sql
SELECT * FROM mytable LIMIT 10;
```

如需导出更多 BigQuery 表,只需对每个额外的表重复上述步骤即可。

</VerticalStepper>

## 延伸阅读与支持 {#further-reading-and-support}

除了本指南之外，我们也建议阅读我们的博客文章，[了解如何使用 ClickHouse 加速 BigQuery，以及如何处理增量导入](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)。

如果您在将数据从 BigQuery 迁移到 ClickHouse 时遇到任何问题，请随时通过 support@clickhouse.com 联系我们。
