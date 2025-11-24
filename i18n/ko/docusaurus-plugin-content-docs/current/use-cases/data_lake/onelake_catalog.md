---
'slug': '/use-cases/data-lake/onelake-catalog'
'sidebar_label': 'Fabric OneLake'
'title': 'Fabric OneLake'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드에서는 Microsoft OneLake에서 데이터를 쿼리하는 단계에 대해 설명합니다.'
'keywords':
- 'OneLake'
- 'Data Lake'
- 'Fabric'
'show_related_blogs': true
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

ClickHouse는 여러 카탈로그(OneLake, Unity, Glue, Polaris 등)와의 통합을 지원합니다. 이 가이드는 ClickHouse를 사용하여 Microsoft OneLake에 저장된 데이터를 쿼리하는 단계를 안내합니다. [OneLake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview) 

Microsoft OneLake는 그들의 레이크하우스를 위한 여러 테이블 형식을 지원합니다. ClickHouse를 사용하여 Iceberg 테이블을 쿼리할 수 있습니다.

:::note
이 기능은 베타 버전이므로 다음을 사용하여 활성화해야 합니다:
`SET allow_database_iceberg = 1;`
:::

## 요구 사항 수집 OneLake {#gathering-requirements}

Microsoft Fabric에서 테이블을 쿼리하기 전에 다음 정보를 수집해야 합니다:

- OneLake 테넌트 ID (귀하의 Entra ID)
- 클라이언트 ID
- 클라이언트 비밀
- 창고 ID 및 데이터 항목 ID

이 값을 찾는 데 도움을 받으려면 [Microsoft OneLake의 문서](http://learn.microsoft.com/en-us/fabric/onelake/table-apis/table-apis-overview#prerequisites)를 참조하십시오.

## OneLake와 ClickHouse 간의 연결 생성 {#creating-a-connection-between-unity-catalog-and-clickhouse}

위의 필수 정보를 사용하여 이제 Microsoft OneLake와 ClickHouse 간의 연결을 생성할 수 있지만, 그 전에 카탈로그를 활성화해야 합니다:

```sql
SET allow_database_iceberg=1
```

### OneLake에 연결 {#connect-onelake}

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

## ClickHouse를 사용하여 OneLake 쿼리하기 {#querying-onelake-using-clickhouse}

연결이 설정되었으므로 이제 OneLake를 쿼리할 수 있습니다:

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

Iceberg 클라이언트를 사용하는 경우 Uniform이 활성화된 Delta 테이블만 표시됩니다:

테이블을 쿼리하려면:

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

:::note 백틱 필수
ClickHouse는 하나 이상의 네임스페이스를 지원하지 않으므로 백틱이 필요합니다.
:::

테이블 DDL을 검사하려면:

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

## ClickHouse로 데이터 레이크에서 데이터 불러오기 {#loading-data-from-onelake-into-clickhouse}

OneLake에서 ClickHouse로 데이터를 불러오려면:

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
