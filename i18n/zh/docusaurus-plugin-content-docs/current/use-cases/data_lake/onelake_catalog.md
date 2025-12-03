---
slug: /use-cases/data-lake/onelake-catalog
sidebar_label: 'Fabric OneLake'
title: 'Fabric OneLake'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将带您逐步了解如何在 Microsoft OneLake 中查询数据。'
keywords: ['OneLake', '数据湖', 'Fabric']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse 支持与多个目录（OneLake、Unity、Glue、Polaris 等）集成。本指南将引导你逐步完成使用 ClickHouse 和 [OneLake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview) 查询存储在 Microsoft OneLake 中的数据的操作。

Microsoft OneLake 的 lakehouse 支持多种表格式。借助 ClickHouse，你可以查询 Iceberg 表。

:::note
由于此功能处于 beta 阶段，你需要先通过以下命令将其启用：
`SET allow_database_iceberg = 1;`
:::

## 收集 OneLake 所需信息 {#gathering-requirements}

在 Microsoft Fabric 中查询数据表之前，你需要收集以下信息：

- OneLake 租户 ID（你的 Entra ID）
- 客户端 ID
- 客户端密钥
- 仓库 ID 和数据项 ID

如需帮助查找这些值，请参阅 [Microsoft OneLake 的文档](http://learn.microsoft.com/en-us/fabric/onelake/table-apis/table-apis-overview#prerequisites)。

## 在 OneLake 和 ClickHouse 之间创建连接 {#creating-a-connection-between-unity-catalog-and-clickhouse}

借助上面准备好的信息，现在可以在 Microsoft OneLake 和 ClickHouse 之间创建连接，但在此之前需要先启用目录（catalog）：

```sql
SET allow_database_iceberg=1
```

### 连接 OneLake {#connect-onelake}

```sql
CREATE DATABASE onelake_catalog
ENGINE = DataLakeCatalog('https://onelake.table.fabric.microsoft.com/iceberg')
SETTINGS
catalog_type = 'onelake',
warehouse = 'warehouse_id/data_item_id',
onelake_tenant_id = '<tenant_id>',
oauth_server_uri = 'https://login.microsoftonline.com/<tenant_id>/oauth2/v2.0/token',
auth_scope = 'https://storage.azure.com/.default',
onelake_client_id = '<client_id>',
onelake_client_secret = '<client_secret>'
```

## 使用 ClickHouse 查询 OneLake {#querying-onelake-using-clickhouse}

连接已建立后，您就可以开始查询 OneLake 了：

```sql
SHOW TABLES FROM onelake_catalog

Query id: 8f6124c4-45c2-4351-b49a-89dc13e548a7

   ┌─name──────────────────────────┐
1. │ year_2017.green_tripdata_2017 │
2. │ year_2018.green_tripdata_2018 │
3. │ year_2019.green_tripdata_2019 │
4. │ year_2020.green_tripdata_2020 │
5. │ year_2022.green_tripdata_2022 │
   └───────────────────────────────┘
```

如果您正在使用 Iceberg 客户端，则只会显示启用了 Uniform 的 Delta 表：

要查询某张表：

```sql
SELECT *
FROM onelake_catalog.`year_2017.green_tripdata_2017`
LIMIT 1

Query id: db6b4bda-cc58-4ca1-8891-e0d14f02c890

Row 1:
──────
VendorID:              2
lpep_pickup_datetime:  2017-05-18 16:55:43.000000
lpep_dropoff_datetime: 2017-05-18 18:04:11.000000
store_and_fwd_flag:    N
RatecodeID:            2
PULocationID:          130
DOLocationID:          48
passenger_count:       2
trip_distance:         12.43
fare_amount:           52
extra:                 4.5
mta_tax:               0.5
tip_amount:            0
tolls_amount:          33
ehail_fee:             ᴺᵁᴸᴸ
improvement_surcharge: 0.3
total_amount:          90.3
payment_type:          2
trip_type:             1
congestion_surcharge:  ᴺᵁᴸᴸ
source_file:           green_tripdata_2017-05.parquet
```

:::note 需要反引号
需要使用反引号，因为 ClickHouse 不支持多个命名空间。
:::

要查看该表的 DDL：

```sql
SHOW CREATE TABLE onelake_catalog.`year_2017.green_tripdata_2017`

Query id: 8bd5bd8e-83be-453e-9a88-32de12ba7f24

   ┌─statement───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ CREATE TABLE onelake_catalog.`year_2017.green_tripdata_2017`                                                                                                               ↴│
   │↳(                                                                                                                                                                          ↴│
   │↳    `VendorID` Nullable(Int64),                                                                                                                                            ↴│
   │↳    `lpep_pickup_datetime` Nullable(DateTime64(6, 'UTC')),                                                                                                                 ↴│
   │↳    `lpep_dropoff_datetime` Nullable(DateTime64(6, 'UTC')),                                                                                                                ↴│
   │↳    `store_and_fwd_flag` Nullable(String),                                                                                                                                 ↴│
   │↳    `RatecodeID` Nullable(Int64),                                                                                                                                          ↴│
   │↳    `PULocationID` Nullable(Int64),                                                                                                                                        ↴│
   │↳    `DOLocationID` Nullable(Int64),                                                                                                                                        ↴│
   │↳    `passenger_count` Nullable(Int64),                                                                                                                                     ↴│
   │↳    `trip_distance` Nullable(Float64),                                                                                                                                     ↴│
   │↳    `fare_amount` Nullable(Float64),                                                                                                                                       ↴│
   │↳    `extra` Nullable(Float64),                                                                                                                                             ↴│
   │↳    `mta_tax` Nullable(Float64),                                                                                                                                           ↴│
   │↳    `tip_amount` Nullable(Float64),                                                                                                                                        ↴│
   │↳    `tolls_amount` Nullable(Float64),                                                                                                                                      ↴│
   │↳    `ehail_fee` Nullable(Float64),                                                                                                                                         ↴│
   │↳    `improvement_surcharge` Nullable(Float64),                                                                                                                             ↴│
   │↳    `total_amount` Nullable(Float64),                                                                                                                                      ↴│
   │↳    `payment_type` Nullable(Int64),                                                                                                                                        ↴│
   │↳    `trip_type` Nullable(Int64),                                                                                                                                           ↴│
   │↳    `congestion_surcharge` Nullable(Float64),                                                                                                                              ↴│
   │↳    `source_file` Nullable(String)                                                                                                                                         ↴│
   │↳)                                                                                                                                                                          ↴│
   │↳ENGINE = Iceberg('abfss://<warehouse_id>@onelake.dfs.fabric.microsoft.com/<data_item_id>/Tables/year_2017/green_tripdata_2017') │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 将数据湖中的数据导入 ClickHouse {#loading-data-from-onelake-into-clickhouse}

如果您需要从 OneLake 向 ClickHouse 导入数据：

```sql
CREATE TABLE trips
ENGINE = MergeTree
ORDER BY coalesce(VendorID, 0)
AS SELECT *
FROM onelake_catalog.`year_2017.green_tripdata_2017`

查询 ID: d15983a6-ef6a-40fe-80d5-19274b9fe328

完成。

返回 0 行。耗时:32.570 秒。已处理 1174 万行,275.37 MB(36.036 万行/秒,8.45 MB/秒)。
峰值内存使用量:1.31 GiB。
```
