---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipes allows you to connect ClickHouse to DynamoDB.'
keywords: ['clickhouse', 'DynamoDB', 'connect', 'integrate', 'table']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';


# 从 DynamoDB 到 ClickHouse 的 CDC

<ExperimentalBadge/>

本页面介绍如何使用 ClickPipes 设置从 DynamoDB 到 ClickHouse 的变更数据捕获 (CDC)。此集成有两个组成部分：
1. 通过 S3 ClickPipes 的初始快照
2. 通过 Kinesis ClickPipes 的实时更新

数据将被导入到 `ReplacingMergeTree` 中。该表引擎通常用于 CDC 场景，以允许应用更新操作。有关此模式的更多信息，请参见以下博客文章：

* [使用 PostgreSQL 和 ClickHouse 进行变更数据捕获 (CDC) - 第 1 部分](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [使用 PostgreSQL 和 ClickHouse 进行变更数据捕获 (CDC) - 第 2 部分](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. 设置 Kinesis Stream {#1-set-up-kinesis-stream}

首先，您需要在 DynamoDB 表上启用 Kinesis 流以实时捕获更改。在创建快照之前，我们希望做到这一点，以避免丢失任何数据。请查阅 [AWS 指南](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)。

<img src={dynamodb_kinesis_stream} alt="DynamoDB Kinesis Stream"/>

## 2. 创建快照 {#2-create-the-snapshot}

接下来，我们将创建 DynamoDB 表的快照。这可以通过 AWS 导出到 S3 来实现。请查阅 [AWS 指南](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)。  
**您希望以 DynamoDB JSON 格式进行“完整导出”。**

<img src={dynamodb_s3_export} alt="DynamoDB S3 Export"/>

## 3. 将快照加载到 ClickHouse {#3-load-the-snapshot-into-clickhouse}

### 创建必要的表 {#create-necessary-tables}

来自 DynamoDB 的快照数据看起来大致如下：
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

请注意，数据采用嵌套格式。在将其加载到 ClickHouse 之前，我们需要扁平化这些数据。可以使用 ClickHouse 中的 `JSONExtract` 函数在物化视图中完成此操作。

我们需要创建三个表：
1. 用于存储来自 DynamoDB 的原始数据的表
2. 用于存储最终扁平化数据（目标表）的表
3. 一个物化视图用于扁平化数据

对于上面的示例 DynamoDB 数据，ClickHouse 的表将如下所示：

```sql
/* 快照表 */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* 最终扁平化数据的表 */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* 最终扁平化数据的表 */
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
- 此表必须是 `ReplacingMergeTree` 表
- 表必须包含一个 `version` 列
  - 在后续步骤中，我们将把 Kinesis 流中的 `ApproximateCreationDateTime` 字段映射到 `version` 列。
- 表应将分区键用作排序键（由 `ORDER BY` 指定）
  - 拥有相同排序键的行将根据 `version` 列进行去重。

### 创建快照 ClickPipe {#create-the-snapshot-clickpipe}
现在您可以创建一个 ClickPipe，将快照数据从 S3 加载到 ClickHouse。请按照 S3 ClickPipe 指南 [这里](/integrations/data-ingestion/clickpipes/object-storage.md) 的步骤，但使用以下设置：

- **导入路径**：您需要找到在 S3 中导出的 json 文件的路径。路径大致如下：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **格式**：JSONEachRow
- **表**：您的快照表（例如，上述的 `default.snapshot`）

创建后，数据将开始填充到快照和目标表中。您不需要在继续进行下一步之前等待快照加载完成。

## 4. 创建 Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

现在我们可以设置 Kinesis ClickPipe 从 Kinesis 流捕获实时更改。请按照 Kinesis ClickPipe 指南 [这里](/integrations/data-ingestion/clickpipes/kinesis.md) 的步骤，但使用以下设置：

- **流**：步骤 1 中使用的 Kinesis 流
- **表**：您的目标表（例如，上述的 `default.destination`）
- **扁平化对象**：true
- **列映射**：
  - `ApproximateCreationDateTime`: `version`
  - 将其他字段映射到相应的目标列，如下所示

<img src={dynamodb_map_columns} alt="DynamoDB Map Columns"/>

## 5. 清理 (可选) {#5-cleanup-optional}

一旦快照 ClickPipe 完成，您可以删除快照表和物化视图。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
