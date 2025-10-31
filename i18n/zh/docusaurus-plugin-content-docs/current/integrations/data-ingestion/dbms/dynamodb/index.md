---
'sidebar_label': 'DynamoDB'
'sidebar_position': 10
'slug': '/integrations/dynamodb'
'description': 'ClickPipes允许您将ClickHouse连接到DynamoDB。'
'keywords':
- 'DynamoDB'
'title': '从DynamoDB到ClickHouse的CDC'
'show_related_blogs': true
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# 从 DynamoDB 到 ClickHouse 的 CDC

<ExperimentalBadge/>

本页介绍如何使用 ClickPipes 设置从 DynamoDB 到 ClickHouse 的 CDC。此集成包含 2 个组件：
1. 通过 S3 ClickPipes 进行初始快照
2. 通过 Kinesis ClickPipes 进行实时更新

数据将被导入到 `ReplacingMergeTree` 中。该表引擎通常用于 CDC 场景，以便应用更新操作。有关此模式的更多信息，请参阅以下博客文章：

* [使用 PostgreSQL 和 ClickHouse 的变更数据捕获 (CDC) 第 1 部分](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [使用 PostgreSQL 和 ClickHouse 的变更数据捕获 (CDC) 第 2 部分](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. 设置 Kinesis 流 {#1-set-up-kinesis-stream}

首先，您需要在 DynamoDB 表上启用 Kinesis 流，以实时捕获更改。我们希望在创建快照之前执行此操作，以避免遗漏任何数据。
请查阅位于 [此处](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html) 的 AWS 指南。

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis Stream" border/>

## 2. 创建快照 {#2-create-the-snapshot}

接下来，我们将创建 DynamoDB 表的快照。这可以通过将数据导出到 S3 来实现。请查阅位于 [此处](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html) 的 AWS 指南。
**您需要执行“完整导出”并使用 DynamoDB JSON 格式。**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 Export" border/>

## 3. 将快照加载到 ClickHouse 中 {#3-load-the-snapshot-into-clickhouse}

### 创建必要的表 {#create-necessary-tables}

来自 DynamoDB 的快照数据将如下所示：
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

请注意，数据是以嵌套格式呈现的。我们需要在将其加载到 ClickHouse 之前扁平化此数据。这可以通过在物化视图中使用 ClickHouse 的 `JSONExtract` 函数来完成。

我们需要创建三个表：
1. 一个用于存储来自 DynamoDB 的原始数据的表
2. 一个用于存储最终扁平化数据的表（目标表）
3. 一个物化视图，用于扁平化数据

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

目标表有一些要求：
- 该表必须是 `ReplacingMergeTree` 表
- 表必须有一个 `version` 列
  - 在后续步骤中，我们将把 Kinesis 流中的 `ApproximateCreationDateTime` 字段映射到 `version` 列。
- 表应使用分区键作为排序键（通过 `ORDER BY` 指定）
  - 拥有相同排序键的行将根据 `version` 列去重。

### 创建快照 ClickPipe {#create-the-snapshot-clickpipe}

现在可以创建一个 ClickPipe，将快照数据从 S3 加载到 ClickHouse。请参阅 S3 ClickPipe 指南 [此处](/integrations/data-ingestion/clickpipes/object-storage.md)，但使用以下设置：

- **导入路径**：您需要找到导出 JSON 文件在 S3 中的路径。路径看起来像这样：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **格式**：JSONEachRow
- **表**：您的快照表（例如，在上述示例中为 `default.snapshot`）

创建后，数据将开始填充到快照和目标表中。在继续进行下一步骤之前，您无需等待快照加载完成。

## 4. 创建 Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

现在我们可以设置 Kinesis ClickPipe，以捕获 Kinesis 流中的实时更改。请参阅 Kinesis ClickPipe 指南 [此处](/integrations/data-ingestion/clickpipes/kinesis.md)，但使用以下设置：

- **流**：第 1 步中使用的 Kinesis 流
- **表**：您的目标表（例如，在上述示例中为 `default.destination`）
- **扁平化对象**：true
- **列映射**：
  - `ApproximateCreationDateTime`：`version`
  - 将其他字段映射到适当的目标列，如下所示

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB Map Columns" border/>

## 5. 清理（可选） {#5-cleanup-optional}

一旦快照 ClickPipe 完成，您可以删除快照表和物化视图。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
