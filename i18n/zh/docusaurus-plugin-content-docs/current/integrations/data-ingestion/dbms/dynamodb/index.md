---
'sidebar_label': 'DynamoDB'
'sidebar_position': 10
'slug': '/integrations/dynamodb'
'description': 'ClickPipes 允许您将 ClickHouse 连接到 DynamoDB。'
'keywords':
- 'DynamoDB'
'title': '从DynamoDB到ClickHouse的CDC'
'show_related_blogs': true
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# 从 DynamoDB 到 ClickHouse 的 CDC

<ExperimentalBadge/>

本文介绍如何使用 ClickPipes 设置从 DynamoDB 到 ClickHouse 的 CDC。这一集成有两个组件：
1. 通过 S3 ClickPipes 进行初始快照
2. 通过 Kinesis ClickPipes 进行实时更新

数据将被摄入到一个 `ReplacingMergeTree` 中。此表引擎通常用于 CDC 场景，以允许应用更新操作。关于此模式的更多信息可以在以下博客文章中找到：

* [与 PostgreSQL 和 ClickHouse 的变更数据捕获 (CDC) - 第 1 部分](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [与 PostgreSQL 和 ClickHouse 的变更数据捕获 (CDC) - 第 2 部分](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. 设置 Kinesis 流 {#1-set-up-kinesis-stream}

首先，您需要在 DynamoDB 表上启用 Kinesis 流，以实时捕获更改。在创建快照之前，我们需要这样做，以避免丢失任何数据。
可以在 [这里](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html) 找到 AWS 指南。

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis 流" border/>

## 2. 创建快照 {#2-create-the-snapshot}

接下来，我们将创建 DynamoDB 表的快照。这可以通过 AWS 导出到 S3 来实现。可以在 [这里](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html) 找到 AWS 指南。
**您将需要执行 DynamoDB JSON 格式的“完整导出”。**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 导出" border/>

## 3. 将快照加载到 ClickHouse {#3-load-the-snapshot-into-clickhouse}

### 创建必要的表 {#create-necessary-tables}

DynamoDB 的快照数据大致如下所示：
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

请注意，数据是以嵌套格式呈现的。在将其加载到 ClickHouse 之前，我们需要扁平化这些数据。这可以通过使用 ClickHouse 中的 `JSONExtract` 函数在物化视图中实现。

我们需要创建三个表：
1. 一个用于存储来自 DynamoDB 的原始数据的表
2. 一个用于存储最终扁平数据（目标表）的表
3. 一个用于扁平化数据的物化视图

对于上述示例的 DynamoDB 数据，ClickHouse 表将如下所示：

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
- 该表必须是一个 `ReplacingMergeTree` 表
- 表必须有一个 `version` 列
  - 在后面的步骤中，我们将把来自 Kinesis 流的 `ApproximateCreationDateTime` 字段映射到 `version` 列。
- 表应使用分区键作为排序键（由 `ORDER BY` 指定）
  - 具有相同排序键的行将根据 `version` 列进行去重。

### 创建快照 ClickPipe {#create-the-snapshot-clickpipe}
现在您可以创建一个 ClickPipe，将快照数据从 S3 加载到 ClickHouse。按照 S3 ClickPipe 指南 [这里](/integrations/data-ingestion/clickpipes/object-storage.md)，但使用以下设置：

- **摄取路径**：您需要找到导出 JSON 文件在 S3 中的路径。路径大致如下所示：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **格式**：JSONEachRow
- **表**：您的快照表（例如上面例子中的 `default.snapshot`）

创建后，数据将开始填充到快照和目标表中。您不需要等到快照加载完成后再继续进行下一步。

## 4. 创建 Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

现在我们可以设置 Kinesis ClickPipe 来捕获来自 Kinesis 流的实时更改。按照 Kinesis ClickPipe 指南 [这里](/integrations/data-ingestion/clickpipes/kinesis.md)，但使用以下设置：

- **流**：步骤 1 中使用的 Kinesis 流
- **表**：您的目标表（例如上面例子中的 `default.destination`）
- **扁平化对象**：true
- **列映射**：
  - `ApproximateCreationDateTime`：`version`
  - 将其他字段映射到适当的目标列，如下所示

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB 映射列" border/>

## 5. 清理（可选） {#5-cleanup-optional}

一旦快照 ClickPipe 完成，您可以删除快照表和物化视图。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
