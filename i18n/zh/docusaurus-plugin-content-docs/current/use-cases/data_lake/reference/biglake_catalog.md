---
slug: /use-cases/data-lake/biglake-catalog
sidebar_label: 'BigLake Metastore'
title: 'BigLake Metastore'
pagination_prev: null
pagination_next: null
description: '本指南将逐步介绍如何使用 ClickHouse 和 BigLake Metastore 查询
 Google Cloud Storage 中的数据。'
keywords: ['BigLake', 'GCS', '数据湖', 'Iceberg', 'Google Cloud']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse 支持与多个目录 (Unity、Glue、Polaris 等) 集成。本指南将逐步介绍如何通过 ClickHouse 查询 [BigLake Metastore](https://docs.cloud.google.com/biglake/docs/) 中的 Iceberg 表。

:::note
由于该功能目前处于 beta 阶段，因此你需要使用以下命令启用它：
`SET allow_database_iceberg = 1;`
:::


## 先决条件 \{#prerequisites\}

在创建从 ClickHouse 到 BigLake Metastore 的连接之前，请确保您具备：

* 已启用 BigLake Metastore 的 **Google Cloud 项目**
* 某个应用的 **应用默认凭据** (OAuth 客户端 ID 和客户端密钥) ，通过 [Google Cloud Console](https://docs.cloud.google.com/docs/authentication/provide-credentials-adc) 创建
* 通过使用适当作用域完成 OAuth 流程获取的 **refresh token** (例如 `https://www.googleapis.com/auth/bigquery` 以及用于 GCS 的存储作用域) 
* 一个 **warehouse** 路径：存储表的 GCS 存储桶 (以及可选前缀) ，例如 `gs://your-bucket` 或 `gs://your-bucket/prefix`

## 在 BigLake Metastore 与 ClickHouse 之间创建 \{#creating-a-connection\}

在配置好 OAuth 凭据后，在 ClickHouse 中创建一个使用 [DataLakeCatalog](/engines/database-engines/datalakecatalog) 数据库引擎的数据库：

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE biglake_metastore
ENGINE = DataLakeCatalog('https://biglake.googleapis.com/iceberg/v1/restcatalog')
SETTINGS
    catalog_type = 'biglake',
    google_adc_client_id = '<client-id>',
    google_adc_client_secret = '<client-secret>',
    google_adc_refresh_token = '<refresh-token>',
    google_adc_quota_project_id = '<gcp-project-id>',
    warehouse = 'gs://<bucket_name>/<optional-prefix>';
```

## 使用 ClickHouse 查询 BigLake Metastore 中的表 \{#querying-biglake-metastore-tables\}

创建连接后，您可以查询已注册到 BigLake Metastore 的表。

```sql
USE biglake_metastore;

SHOW TABLES;
```

示例输出：

```response
┌─name─────────────────────┐
│icebench.my_iceberg_table │   
└──────────────────────────┘
```

```sql
SELECT count(*) FROM `icebench.my_iceberg_table`;
```

:::note 必须使用反引号
必须使用反引号，因为 ClickHouse 不支持一个以上的命名空间。
:::

要查看表定义：

```sql
SHOW CREATE TABLE `icebench.my_iceberg_table`;
```


## 将数据从 BigLake 加载到 ClickHouse \{#loading-data-into-clickhouse\}

要将 BigLake Metastore 表中的数据加载到本地 ClickHouse 表中，以加快重复查询的速度，请创建一个 MergeTree 表，并从目录中插入数据：

```sql
CREATE TABLE clickhouse_table
(
    `id` Int64,
    `event_time` DateTime64(3),
    `user_id` String,
    `payload` String
)
ENGINE = MergeTree
ORDER BY (event_time, id);

INSERT INTO local_events
SELECT * FROM biglake_metastore.`icebench.my_iceberg_table`;
```

初始加载完成后，查询 `clickhouse_table` 以降低延迟。需要时，重新运行 `INSERT INTO ... SELECT`，从 BigLake 刷新数据。
