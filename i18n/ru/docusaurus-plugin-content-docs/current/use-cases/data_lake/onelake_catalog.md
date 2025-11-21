---
slug: /use-cases/data-lake/onelake-catalog
sidebar_label: 'Fabric OneLake'
title: 'Fabric OneLake'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве вы узнаете, как выполнять запросы к данным в Microsoft OneLake.'
keywords: ['OneLake', 'Data Lake', 'Fabric']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse поддерживает интеграцию с несколькими каталогами (OneLake, Unity, Glue, Polaris и т. д.). В этом руководстве описаны шаги, которые позволят вам выполнять запросы к данным, хранящимся в Microsoft OneLake, с помощью ClickHouse и [OneLake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview).

Microsoft OneLake поддерживает несколько форматов таблиц для lakehouse-хранилища. В ClickHouse вы можете выполнять запросы к таблицам Iceberg.

:::note
Поскольку эта функция находится в бета-версии, её необходимо включить с помощью:
`SET allow_database_iceberg = 1;`
:::


## Сбор требований OneLake {#gathering-requirements}

Перед выполнением запросов к таблице в Microsoft Fabric необходимо собрать следующую информацию:

- Идентификатор арендатора OneLake (ваш Entra ID)
- Идентификатор клиента
- Секрет клиента
- Идентификатор хранилища и идентификатор элемента данных

См. [документацию Microsoft OneLake](http://learn.microsoft.com/en-us/fabric/onelake/table-apis/table-apis-overview#prerequisites) для получения справки по поиску этих значений.


## Создание подключения между OneLake и ClickHouse {#creating-a-connection-between-unity-catalog-and-clickhouse}

Имея необходимую информацию, указанную выше, вы можете создать подключение между Microsoft OneLake и ClickHouse, но сначала необходимо включить каталоги:

```sql
SET allow_database_iceberg=1
```

### Подключение к OneLake {#connect-onelake}

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


## Запросы к OneLake с помощью ClickHouse {#querying-onelake-using-clickhouse}

Теперь, когда соединение установлено, можно начать выполнять запросы к OneLake:

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

Если вы используете клиент Iceberg, будут отображаться только таблицы Delta с включенным Uniform:

Для запроса к таблице:

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

:::note Требуются обратные кавычки
Обратные кавычки необходимы, так как ClickHouse не поддерживает более одного пространства имен.
:::

Для просмотра DDL таблицы:

```sql
SHOW CREATE TABLE onelake_catalog.`year_2017.green_tripdata_2017`

Query id: 8bd5bd8e-83be-453e-9a88-32de12ba7f24

```


┌─statement───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐

1. │ CREATE TABLE onelake_catalog.`year_2017.green_tripdata_2017` ↴│
   │↳( ↴│
   │↳ `VendorID` Nullable(Int64), ↴│
   │↳ `lpep_pickup_datetime` Nullable(DateTime64(6, 'UTC')), ↴│
   │↳ `lpep_dropoff_datetime` Nullable(DateTime64(6, 'UTC')), ↴│
   │↳ `store_and_fwd_flag` Nullable(String), ↴│
   │↳ `RatecodeID` Nullable(Int64), ↴│
   │↳ `PULocationID` Nullable(Int64), ↴│
   │↳ `DOLocationID` Nullable(Int64), ↴│
   │↳ `passenger_count` Nullable(Int64), ↴│
   │↳ `trip_distance` Nullable(Float64), ↴│
   │↳ `fare_amount` Nullable(Float64), ↴│
   │↳ `extra` Nullable(Float64), ↴│
   │↳ `mta_tax` Nullable(Float64), ↴│
   │↳ `tip_amount` Nullable(Float64), ↴│
   │↳ `tolls_amount` Nullable(Float64), ↴│
   │↳ `ehail_fee` Nullable(Float64), ↴│
   │↳ `improvement_surcharge` Nullable(Float64), ↴│
   │↳ `total_amount` Nullable(Float64), ↴│
   │↳ `payment_type` Nullable(Int64), ↴│
   │↳ `trip_type` Nullable(Int64), ↴│
   │↳ `congestion_surcharge` Nullable(Float64), ↴│
   │↳ `source_file` Nullable(String) ↴│
   │↳) ↴│
   │↳ENGINE = Iceberg('abfss://<warehouse_id>@onelake.dfs.fabric.microsoft.com/<data_item_id>/Tables/year_2017/green_tripdata_2017') │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

```


## Загрузка данных из Data Lake в ClickHouse {#loading-data-from-onelake-into-clickhouse}

Для загрузки данных из OneLake в ClickHouse:

```sql
CREATE TABLE trips
ENGINE = MergeTree
ORDER BY coalesce(VendorID, 0)
AS SELECT *
FROM onelake_catalog.`year_2017.green_tripdata_2017`

Query id: d15983a6-ef6a-40fe-80d5-19274b9fe328

Ok.

0 строк в наборе. Прошло: 32.570 сек. Обработано 11.74 млн строк, 275.37 МБ (360.36 тыс. строк/с., 8.45 МБ/с.)
Пиковое использование памяти: 1.31 ГиБ.
```
