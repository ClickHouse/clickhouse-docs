---
slug: /use-cases/data-lake/polaris-catalog
sidebar_label: 'Polaris 目录'
title: 'Polaris 目录'
pagination_prev: null
pagination_next: null
description: '本指南将逐步介绍如何使用 ClickHouse 和 Snowflake Polaris 目录
 查询您的数据。'
keywords: ['Polaris', 'Snowflake', '数据湖']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse 支持与多个目录 (Unity、Glue、Polaris 等) 集成。在本指南中，我们将逐步说明如何使用 ClickHouse 和 [Apache Polaris Catalog](https://polaris.apache.org/releases/1.1.0/getting-started/using-polaris/#setup) 查询数据。
Apache Polaris 支持 Iceberg 表和 Delta Tables (通过 Generic Tables) 。目前，此集成仅支持 Iceberg 表。

:::note
由于该功能仍处于实验阶段，你需要通过以下方式启用它：
`SET allow_experimental_database_unity_catalog = 1;`
:::

## 前提条件 \{#prerequisites\}

要连接到 Polaris 目录，您需要准备：

* Snowflake Open Catalog (托管版 Polaris) 或自托管 Polaris Catalog
* 您的 Polaris 目录 URI (例如：`https://<account-id>.<region>.aws.snowflakecomputing.com/polaris/api/catalog/v1` 或 `http://polaris:8181/api/catalog/v1/oauth/tokens`)
* 目录凭据 (客户端 ID 和客户端密钥)
* 您的 Polaris 实例的 OAuth token URI
* 存储 Iceberg 数据所在对象存储的存储端点 (例如 S3)
* ClickHouse 26.1+ 版本

对于 Open Catalog (Snowflake 托管的 Polaris 服务) ，URI 中会包含 `/polaris`；而对于自托管版本，则可能不包含。

<VerticalStepper>
  ## 在 Polaris 和 ClickHouse 之间创建连接 \{#connecting\}

  创建一个数据库，将 ClickHouse 连接到您的 Polaris 目录：

  ```sql
  CREATE DATABASE polaris_catalog
  ENGINE = DataLakeCatalog('https://<catalog_uri>/api/catalog/v1')
  SETTINGS
      catalog_type = 'rest',
      catalog_credential = '<client-id>:<client-secret>',
      warehouse = 'snowflake',
      auth_scope = 'PRINCIPAL_ROLE:ALL',
      oauth_server_uri = 'https://<catalog_uri>/api/catalog/v1/oauth/tokens',
      storage_endpoint = '<storage_endpoint>'
  ```

  ## 使用 ClickHouse 查询 Polaris 目录 \{#query-polaris-catalog\}

  连接建立后，您可以查询 Polaris：

  ```sql title="查询"
  USE polaris_catalog;
  SHOW TABLES;
  ```

  要查询某个表：

  ```sql title="查询"
  SELECT count(*) FROM `polaris_db.my_iceberg_table`;
  ```

  :::note
  必须使用反引号，例如 `schema.table`。
  :::

  要查看表的 DDL：

  ```sql
  SHOW CREATE TABLE `polaris_db.my_iceberg_table`;
  ```

  ## 将数据从 Polaris 导入到 ClickHouse \{#loading-data-into-clickhouse\}

  要将 Polaris 中的数据导入 ClickHouse 表，请先按所需 schema 创建目标表，然后从 Polaris 表中插入数据：

  ```sql title="查询"
  CREATE TABLE my_clickhouse_table
  (
      -- 定义与 Iceberg 表对应的列
      `id` Int64,
      `name` String,
      `event_time` DateTime64(3)
  )
  ENGINE = MergeTree
  ORDER BY id;

  INSERT INTO my_clickhouse_table
  SELECT * FROM polaris_catalog.`polaris_db.my_iceberg_table`;
  ```
</VerticalStepper>