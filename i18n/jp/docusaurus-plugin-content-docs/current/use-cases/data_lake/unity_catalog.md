---
slug: '/use-cases/data-lake/unity-catalog'
sidebar_label: 'Unity Catalog'
title: 'Unity Catalog'
pagination_prev: null
pagination_next: null
description: 'In this guide, we will walk you through the steps to query your data
  in S3 buckets using ClickHouse and the Unity Catalog.'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
Unity Catalogとの統合は、管理されたテーブルと外部テーブルの両方で機能します。この統合は、現在AWSでのみサポートされています。
:::

ClickHouseは、複数のカタログ（Unity、Glue、Polarisなど）との統合をサポートしています。このガイドでは、ClickHouseを使用してDatabricksによって管理されているデータをクエリし、[Unity Catalog](https://www.databricks.com/product/unity-catalog)を利用する手順を説明します。 

Databricksは、彼らのレイクハウスに対して複数のデータフォーマットをサポートしています。ClickHouseを使用すると、Unity Catalogテーブルに対してDeltaとIcebergの両方でクエリを実行できます。

## DatabricksでのUnityの設定 {#configuring-unity-in-databricks}

ClickHouseがUnityカタログと対話できるようにするには、Unity Catalogが外部リーダーとの対話を許可するように設定されていることを確認する必要があります。これは、[ "Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin)ガイドに従うことで実現できます。

外部アクセスを有効にするだけでなく、統合を設定する担当者が、テーブルを含むスキーマに対して `EXTERNAL USE SCHEMA` の[特権](https://docs.databricks.com/aws/en/external-access/admin#external-schema)を持っていることを確認してください。

カタログの設定が完了したら、ClickHouseのための資格情報を生成する必要があります。Unityとの対話モードに応じて、2つの異なる方法を使用できます。

* Icebergクライアントの場合、[サービス資格情報](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)として認証を使用します。

* Deltaクライアントの場合は、Personal Access Token（[PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)）を使用します。


## Unity CatalogとClickHouseの接続を作成する {#creating-a-connection-between-unity-catalog-and-clickhouse}

Unityカタログが設定され、認証が整ったら、ClickHouseとUnityカタログの間に接続を確立します。

### Deltaの読み取り {#read-delta}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity'
```

### Icebergの読み取り {#read-iceberg}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace', 
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql'
```

## ClickHouseを使用したUnityカタログテーブルのクエリ {#querying-unity-catalog-tables-using-clickhouse}

接続が確立されたので、Unityカタログを介してクエリを開始できます。例えば：

```sql
USE unity;

SHOW TABLES;

┌─name───────────────────────────────────────────────┐
│ clickbench.delta_hits                              │
│ demo.fake_user                                     │
│ information_schema.catalog_privileges              │
│ information_schema.catalog_tags                    │
│ information_schema.catalogs                        │
│ information_schema.check_constraints               │
│ information_schema.column_masks                    │
│ information_schema.column_tags                     │
│ information_schema.columns                         │
│ information_schema.constraint_column_usage         │
│ information_schema.constraint_table_usage          │
│ information_schema.information_schema_catalog_name │
│ information_schema.key_column_usage                │
│ information_schema.parameters                      │
│ information_schema.referential_constraints         │
│ information_schema.routine_columns                 │
│ information_schema.routine_privileges              │
│ information_schema.routines                        │
│ information_schema.row_filters                     │
│ information_schema.schema_privileges               │
│ information_schema.schema_tags                     │
│ information_schema.schemata                        │
│ information_schema.table_constraints               │
│ information_schema.table_privileges                │
│ information_schema.table_tags                      │
│ information_schema.tables                          │
│ information_schema.views                           │
│ information_schema.volume_privileges               │
│ information_schema.volume_tags                     │
│ information_schema.volumes                         │
│ uniform.delta_hits                                 │
└────────────────────────────────────────────────────┘
```

Icebergクライアントを使用している場合、Uniformが有効になっているDeltaテーブルのみが表示されます：

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

テーブルをクエリするには：

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note バックティックが必要
バックティックが必要です。ClickHouseは複数のネームスペースをサポートしていません。
:::

テーブルのDDLを確認するには：

```sql
SHOW CREATE TABLE `uniform.delta_hits`

CREATE TABLE unity_uniform.`uniform.delta_hits`
(
    `WatchID` Int64,
    `JavaEnable` Int32,
    `Title` String,
    `GoodEvent` Int32,
    `EventTime` DateTime64(6, 'UTC'),
    `EventDate` Date,
    `CounterID` Int32,
    `ClientIP` Int32,
    ...
    `FromTag` String,
    `HasGCLID` Int32,
    `RefererHash` Int64,
    `URLHash` Int64,
    `CLID` Int32
)
ENGINE = Iceberg('s3://<path>);

```

## データレイクからClickHouseへのデータのロード {#loading-data-from-your-data-lake-into-clickhouse}

DatabricksからClickHouseにデータをロードする必要がある場合は、まずローカルのClickHouseテーブルを作成します：

```sql
CREATE TABLE hits
(
    `WatchID` Int64,
    `JavaEnable` Int32,
    `Title` String,
    `GoodEvent` Int32,
    `EventTime` DateTime64(6, 'UTC'),
    `EventDate` Date,
    `CounterID` Int32,
    `ClientIP` Int32,
    ...
    `FromTag` String,
    `HasGCLID` Int32,
    `RefererHash` Int64,
    `URLHash` Int64,
    `CLID` Int32
)
PRIMARY KEY (CounterID, EventDate, UserID, EventTime, WatchID);
```

次に、`INSERT INTO SELECT`を介してUnity Catalogテーブルからデータをロードします：

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
