---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipes 可将 ClickHouse 连接到 DynamoDB。'
keywords: ['DynamoDB']
title: '从 DynamoDB 到 ClickHouse 的 CDC'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# 从 DynamoDB 到 ClickHouse 的 CDC

<ExperimentalBadge/>

本页介绍如何使用 ClickPipes 将 DynamoDB 的 CDC 设置到 ClickHouse。此集成包含两个组件：
1. 通过 S3 ClickPipes 获取初始快照
2. 通过 Kinesis ClickPipes 实时更新

数据将写入 `ReplacingMergeTree`。此表引擎常用于 CDC 场景，以便支持更新操作。关于这一模式的更多内容可参考以下博客文章：

* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)



## 1. 设置 Kinesis 流 {#1-set-up-kinesis-stream}

首先,您需要在 DynamoDB 表上启用 Kinesis 流以实时捕获数据变更。建议在创建快照之前完成此操作,以避免遗漏任何数据。
请参阅 AWS 官方指南:[此处](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)。

<Image
  img={dynamodb_kinesis_stream}
  size='lg'
  alt='DynamoDB Kinesis 流'
  border
/>


## 2. 创建快照 {#2-create-the-snapshot}

接下来,我们将创建 DynamoDB 表的快照。这可以通过 AWS 导出到 S3 来实现。相关的 AWS 指南请参见[此处](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)。
**您需要选择 DynamoDB JSON 格式进行"完全导出"。**

<Image img={dynamodb_s3_export} size='md' alt='DynamoDB S3 导出' border />


## 3. 将快照加载到 ClickHouse {#3-load-the-snapshot-into-clickhouse}

### 创建必要的表 {#create-necessary-tables}

来自 DynamoDB 的快照数据格式如下:

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

可以看到数据采用嵌套格式。在将数据加载到 ClickHouse 之前,需要先将其展平。这可以通过在物化视图中使用 ClickHouse 的 `JSONExtract` 函数来实现。

我们需要创建三个表:

1. 用于存储来自 DynamoDB 的原始数据的表
2. 用于存储最终展平数据的表(目标表)
3. 用于展平数据的物化视图

对于上述示例 DynamoDB 数据,ClickHouse 表结构如下:

```sql
/* 快照表 */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* 用于展平数据的物化视图 */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* 最终展平数据表 */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
)
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

目标表有以下几个要求:

- 该表必须是 `ReplacingMergeTree` 表
- 该表必须包含 `version` 列
  - 在后续步骤中,我们将把 Kinesis 流中的 `ApproximateCreationDateTime` 字段映射到 `version` 列。
- 该表应使用分区键作为排序键(通过 `ORDER BY` 指定)
  - 具有相同排序键的行将根据 `version` 列进行去重。

### 创建快照 ClickPipe {#create-the-snapshot-clickpipe}

现在您可以创建一个 ClickPipe 来将快照数据从 S3 加载到 ClickHouse。请按照[此处](/integrations/clickpipes/object-storage)的 S3 ClickPipe 指南操作,但使用以下设置:

- **摄取路径**: 您需要找到 S3 中导出的 json 文件的路径。路径格式如下:

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **格式**: JSONEachRow
- **表**: 您的快照表(例如上述示例中的 `default.snapshot`)

创建后,数据将开始填充到快照表和目标表中。您无需等待快照加载完成即可继续下一步。


## 4. 创建 Kinesis ClickPipe {#4-create-the-kinesis-clickpipe}

现在我们可以设置 Kinesis ClickPipe 来捕获 Kinesis 流中的实时变更。请参考 Kinesis ClickPipe 指南[此处](/integrations/data-ingestion/clickpipes/kinesis.md),并使用以下配置:

- **Stream**: 步骤 1 中使用的 Kinesis 流
- **Table**: 您的目标表(例如上述示例中的 `default.destination`)
- **Flatten object**: true
- **Column mappings**:
  - `ApproximateCreationDateTime`: `version`
  - 将其他字段映射到相应的目标列,如下所示

<Image img={dynamodb_map_columns} size='md' alt='DynamoDB 列映射' border />


## 5. 清理(可选) {#5-cleanup-optional}

快照 ClickPipe 完成后,可以删除快照表和物化视图。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
