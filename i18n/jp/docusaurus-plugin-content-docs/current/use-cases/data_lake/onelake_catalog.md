---
slug: /use-cases/data-lake/onelake-catalog
sidebar_label: 'Fabric OneLake'
title: 'Fabric OneLake'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、Microsoft OneLake 内のデータをクエリするための手順を説明します。'
keywords: ['OneLake', 'データレイク', 'Fabric']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse は複数のカタログ (OneLake、Unity、Glue、Polaris など) との統合をサポートしています。このガイドでは、ClickHouse と [OneLake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview) を使用して、Microsoft OneLake に保存されているデータをクエリする手順を説明します。

Microsoft OneLake は、レイクハウス向けに複数のテーブル形式をサポートしています。ClickHouse では、Iceberg テーブルをクエリできます。

:::note
この機能はベータ版のため、次の設定を有効にする必要があります。
`SET allow_database_iceberg = 1;`
:::

## OneLake の要件の収集 \{#gathering-requirements\}

Microsoft Fabric でテーブルをクエリする前に、次の情報を収集する必要があります。

- OneLake テナント ID（ご利用の Entra ID）
- クライアント ID
- クライアント シークレット
- ウェアハウス ID とデータ アイテム ID

これらの値の確認方法については、[Microsoft OneLake のドキュメント](http://learn.microsoft.com/en-us/fabric/onelake/table-apis/table-apis-overview#prerequisites)を参照してください。

## OneLake と ClickHouse 間の接続を作成する \{#creating-a-connection-between-unity-catalog-and-clickhouse\}

上記の必要な情報が揃ったら、Microsoft OneLake と ClickHouse 間の接続を作成できます。ただし、その前にカタログを有効にする必要があります。

```sql
SET allow_database_iceberg=1
```

### OneLakeに接続する \{#connect-onelake\}

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

## ClickHouse を使用した OneLake へのクエリ実行 \{#querying-onelake-using-clickhouse\}

接続が確立できたので、これで OneLake に対してクエリを実行できます。

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

Iceberg クライアントを使用している場合、Uniform が有効化されている Delta テーブルのみが表示されます。

テーブルをクエリするには、次のようにします:

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

:::note Backticks required
ClickHouse は複数のネームスペースをサポートしていないため、バッククォート（`）が必要です。
:::

テーブルの DDL を確認するには：

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

## データレイクから ClickHouse へのデータ読み込み \{#loading-data-from-onelake-into-clickhouse\}

OneLake から ClickHouse にデータを読み込む必要がある場合は、次の手順を実行します。

```sql
CREATE TABLE trips
ENGINE = MergeTree
ORDER BY coalesce(VendorID, 0)
AS SELECT *
FROM onelake_catalog.`year_2017.green_tripdata_2017`

Query id: d15983a6-ef6a-40fe-80d5-19274b9fe328

Ok.

0 rows in set. Elapsed: 32.570 sec. Processed 11.74 million rows, 275.37 MB (360.36 thousand rows/s., 8.45 MB/s.)
Peak memory usage: 1.31 GiB.
```
