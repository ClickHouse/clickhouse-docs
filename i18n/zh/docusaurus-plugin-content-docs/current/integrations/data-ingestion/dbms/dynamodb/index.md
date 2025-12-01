---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipes 使您能够将 ClickHouse 连接到 DynamoDB。'
keywords: ['DynamoDB']
title: '将 DynamoDB 的 CDC 同步到 ClickHouse'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# 从 DynamoDB 到 ClickHouse 的 CDC {#cdc-from-dynamodb-to-clickhouse}

<ExperimentalBadge/>

本页介绍如何使用 ClickPipes 将 DynamoDB 的 CDC（变更数据捕获）数据同步到 ClickHouse。此集成包含两个部分：
1. 通过 S3 ClickPipes 执行初始快照
2. 通过 Kinesis ClickPipes 实现实时更新

数据将被摄取到一个 `ReplacingMergeTree` 表中。此表引擎常用于 CDC 场景，以便能够应用更新操作。关于这一模式的更多信息，请参阅以下博客文章：

* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)



## 1. 设置 Kinesis 流 {#1-set-up-kinesis-stream}

首先，需要在 DynamoDB 表上启用 Kinesis 流，以实时捕获变更。我们希望在创建快照之前完成此步骤，以避免遗漏任何数据。
请参考位于[此处](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)的 AWS 指南。

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis 流" border/>



## 2. 创建快照 {#2-create-the-snapshot}

接下来，我们将为 DynamoDB 表创建一个快照。可以通过将数据从 AWS 导出到 S3 来完成此操作。请参阅[此处](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)的 AWS 指南。
**在 DynamoDB 中，需要执行一次使用 DynamoDB JSON 格式的“完全导出”（Full export）。**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 导出" border/>



## 3. 将快照加载到 ClickHouse 中 {#3-load-the-snapshot-into-clickhouse}

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

请注意，这些数据是嵌套格式的。我们需要在将其加载到 ClickHouse 之前将这些数据展平。可以通过在 ClickHouse 的物化视图中使用 `JSONExtract` 函数来完成。

我们需要创建三个表：

1. 一个用于存储来自 DynamoDB 的原始数据的表
2. 一个用于存储最终展平数据的表（目标表）
3. 一个用于对数据进行展平处理的物化视图

对于上述示例 DynamoDB 数据，ClickHouse 表将如下所示：

```sql
/* 快照表 */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* 最终扁平化数据的目标表 */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* 最终扁平化数据的目标表 */
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

* 该表必须是 `ReplacingMergeTree` 表
* 表中必须有一个 `version` 列
  * 在后续步骤中，我们会将来自 Kinesis 流的 `ApproximateCreationDateTime` 字段映射到 `version` 列。
* 表应使用分区键作为排序键（通过 `ORDER BY` 指定）
  * 具有相同排序键的行会基于 `version` 列进行去重。

### 创建快照 ClickPipe {#create-the-snapshot-clickpipe}

现在可以创建一个 ClickPipe，将来自 S3 的快照数据加载到 ClickHouse 中。请按照 S3 ClickPipe 指南[此处](/integrations/clickpipes/object-storage)的说明进行操作，但使用以下设置：

* **Ingest path**：您需要在 S3 中找到导出的 JSON 文件路径。该路径大致如下：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

* **格式**: JSONEachRow
* **表**: 你的快照表（例如上面的 `default.snapshot`）

创建完成后，数据会开始写入快照表和目标表。你无需等待快照加载完成再执行下一步操作。


## 4. 创建 Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

现在我们可以设置 Kinesis ClickPipe 来捕获 Kinesis 流中的实时变更。请按照 Kinesis ClickPipe 指南[此处](/integrations/data-ingestion/clickpipes/kinesis.md)中的说明进行配置，但使用以下设置：

- **Stream**：步骤 1 中使用的 Kinesis 流
- **Table**：目标表（例如前面示例中的 `default.destination`）
- **Flatten object**：true
- **Column mappings**：
  - `ApproximateCreationDateTime`：`version`
  - 将其他字段映射到相应的目标列，如下图所示

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB 列映射" border/>



## 5. 清理（可选） {#5-cleanup-optional}

当快照 ClickPipe 运行完成后，可以删除快照表和物化视图。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
