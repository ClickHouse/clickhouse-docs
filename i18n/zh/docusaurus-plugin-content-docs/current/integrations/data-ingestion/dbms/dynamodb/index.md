import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';

# 从 DynamoDB 到 ClickHouse 的 CDC

<ExperimentalBadge/>

本页面介绍如何使用 ClickPipes 从 DynamoDB 设置 CDC 到 ClickHouse。此集成包含两个组件：
1. 通过 S3 ClickPipes 的初始快照
2. 通过 Kinesis ClickPipes 的实时更新

数据将被导入到 `ReplacingMergeTree`。这个表引擎通常用于 CDC 场景，以允许应用更新操作。有关这种模式的更多信息可以在以下博客文章中找到：

* [使用 PostgreSQL 和 ClickHouse 的变更数据捕获 (CDC) - 第 1 部分](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [使用 PostgreSQL 和 ClickHouse 的变更数据捕获 (CDC) - 第 2 部分](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. 设置 Kinesis 流 {#1-set-up-kinesis-stream}

首先，您需要在 DynamoDB 表上启用 Kinesis 流以捕获实时更改。我们希望在创建快照之前执行此操作，以避免丢失任何数据。
可以在 AWS 指南中找到相关内容 [这里](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)。

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis 流" border/>

## 2. 创建快照 {#2-create-the-snapshot}

接下来，我们将创建 DynamoDB 表的快照。可以通过 AWS 导出到 S3 来实现。可以在 AWS 指南中找到相关内容 [这里](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)。
**您需要在 DynamoDB JSON 格式中进行“完全导出”。**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 导出" border/>

## 3. 将快照加载到 ClickHouse {#3-load-the-snapshot-into-clickhouse}

### 创建必要的表 {#create-necessary-tables}

来自 DynamoDB 的快照数据大致如下所示：
```json
{
  "age": {
    "N": "26"
  },
  "first_name": {
    "S": "sally"
  },
  "id": {
    "S": "0A556908-F72B-4BE6-9048-9E60715358D4"
  }
}
```

请注意，数据采用嵌套格式。我们需要在将其加载到 ClickHouse 之前将数据扁平化。这可以通过在 ClickHouse 中的物化视图中使用 `JSONExtract` 函数来完成。

我们需要创建三个表：
1. 存储来自 DynamoDB 的原始数据的表
2. 存储最终扁平化数据的表（目标表）
3. 一个用于扁平化数据的物化视图


对于上面的示例 DynamoDB 数据，ClickHouse 表将如下所示：

```sql
/* Snapshot table */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* Table for final flattened data */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* Table for final flattened data */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
)
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

目标表有几个要求：
- 此表必须是 `ReplacingMergeTree` 表
- 表必须有一个 `version` 列
  - 在后面的步骤中，我们将把 Kinesis 流中的 `ApproximateCreationDateTime` 字段映射到 `version` 列。
- 表应使用分区键作为排序键（由 `ORDER BY` 指定）
  - 具有相同排序键的行将根据 `version` 列去重。

### 创建快照 ClickPipe {#create-the-snapshot-clickpipe}
现在，您可以创建一个 ClickPipe 将快照数据从 S3 加载到 ClickHouse。按照 S3 ClickPipe 指南 [这里](/integrations/data-ingestion/clickpipes/object-storage.md)，但使用以下设置：

- **导入路径**：您需要找到导出 JSON 文件在 S3 中的路径。路径大约如下所示：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **格式**：JSONEachRow
- **表**：您的快照表（例如上面示例中的 `default.snapshot`）

创建后，数据将开始填充到快照和目标表中。您无需等待快照加载完成即可继续进行下一步。

## 4. 创建 Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

现在我们可以设置 Kinesis ClickPipe 以捕获来自 Kinesis 流的实时更改。按照 Kinesis ClickPipe 指南 [这里](/integrations/data-ingestion/clickpipes/kinesis.md)，但使用以下设置：

- **流**：在步骤 1 中使用的 Kinesis 流
- **表**：您的目标表（例如上面示例中的 `default.destination`）
- **扁平化对象**：true
- **列映射**：
  - `ApproximateCreationDateTime`：`version`
  - 将其他字段映射到相应的目标列，如下所示

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB 列映射" border/>

## 5. 清理（可选） {#5-cleanup-optional}

快照 ClickPipe 完成后，您可以删除快照表和物化视图。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
