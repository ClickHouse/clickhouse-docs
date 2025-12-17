---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipes 使您能够将 ClickHouse 与 DynamoDB 连接起来。'
keywords: ['DynamoDB']
title: '从 DynamoDB 到 ClickHouse 的 CDC（变更数据捕获）'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# 从 DynamoDB 到 ClickHouse 的 CDC {#cdc-from-dynamodb-to-clickhouse}

本页说明如何使用 ClickPipes 将 DynamoDB 的 CDC 设置到 ClickHouse。该集成包含两个组件：

1. 通过 S3 ClickPipes 完成初始快照
2. 通过 Kinesis ClickPipes 实现实时更新

数据将被摄取到一个 `ReplacingMergeTree` 中。此表引擎常用于 CDC 场景，以便支持应用更新操作。关于这一模式的更多内容可在以下博客文章中找到：

* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. 设置 Kinesis 流 {#1-set-up-kinesis-stream}

首先，需要在 DynamoDB 表上启用 Kinesis 流，以实时捕获变更。我们希望在创建快照之前先完成这一步，以避免遗漏任何数据。
请参考位于 [此处](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html) 的 AWS 官方指南。

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis 流" border/>

## 2. 创建快照 {#2-create-the-snapshot}

接下来，我们将创建 DynamoDB 表的快照。这可以通过使用 AWS 将数据导出到 S3 来实现。请参考位于[此处](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)的 AWS 指南。
**你需要执行一次使用 DynamoDB JSON 格式的 “Full export”（完整导出）。**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 导出" border/>

## 3. 将快照载入 ClickHouse {#3-load-the-snapshot-into-clickhouse}

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

请注意，数据是嵌套格式的。在将其加载到 ClickHouse 之前，我们需要先对其进行扁平化处理。可以在 ClickHouse 中通过 materialized view 结合 `JSONExtract` 函数来完成这一操作。

我们需要创建三个表：

1. 一个用于存储来自 DynamoDB 的原始数据的表
2. 一个用于存储最终扁平化数据的表（目标表）
3. 一个用于扁平化数据的 materialized view

对于上面示例的 DynamoDB 数据，对应的 ClickHouse 表结构如下：

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

目标表有以下几个要求：

* 该表必须是一个使用 `ReplacingMergeTree` 引擎的表
* 表中必须有一个 `version` 列
  * 在后续步骤中，我们会将来自 Kinesis 流的 `ApproximateCreationDateTime` 字段映射到 `version` 列。
* 表应使用分区键作为排序键（通过 `ORDER BY` 指定）
  * 具有相同排序键的行将基于 `version` 列进行去重。


### 创建快照 ClickPipe {#create-the-snapshot-clickpipe}

现在你可以创建一个 ClickPipe，将快照数据从 S3 加载到 ClickHouse。请按照 S3 ClickPipe 指南[此处](/integrations/clickpipes/object-storage/s3/overview)中的说明进行操作，但使用以下设置：

* **Ingest path**：你需要在 S3 中找到导出的 JSON 文件所在的路径。该路径看起来类似于：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

* **格式**：JSONEachRow
* **表**：你的快照表（例如上面的示例中为 `default.snapshot`）

创建完成后，数据将开始写入快照表和目标表。你无需等待快照加载完成即可继续下一步操作。


## 4. 创建 Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

现在我们可以配置 Kinesis ClickPipe 来从 Kinesis 流中捕获实时变更。请按照 Kinesis ClickPipe 指南[此处](/integrations/data-ingestion/clickpipes/kinesis.md)的步骤进行，但使用以下设置：

- **Stream**：在步骤 1 中使用的 Kinesis 流
- **Table**：目标表（例如上述示例中的 `default.destination`）
- **Flatten object**：true
- **Column mappings**：
  - `ApproximateCreationDateTime`：`version`
  - 将其他字段映射到如下所示的相应目标列

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB 映射列" border/>

## 5. 清理（可选） {#5-cleanup-optional}

当快照 ClickPipe 完成后，您可以删除快照表和 materialized view。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
