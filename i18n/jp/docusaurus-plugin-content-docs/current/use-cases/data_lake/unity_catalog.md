---
slug: /use-cases/data-lake/unity-catalog
sidebar_label: 'Unity catalog'
title: 'Unity catalog'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と Unity Catalog を使用して S3 バケット内のデータをクエリする手順を説明します。'
keywords: ['Unity', 'Data Lake']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Unity Catalog との統合は、マネージドテーブルおよび外部テーブルで利用できます。
この統合は現在、AWS 上でのみサポートされています。
:::

ClickHouse は複数のカタログ（Unity、Glue、Polaris など）との統合をサポートしています。このガイドでは、ClickHouse と [Unity Catalog](https://www.databricks.com/product/unity-catalog) を使用して、Databricks によって管理されているデータをクエリする手順を説明します。

Databricks は、レイクハウス向けに複数のデータ形式をサポートしています。ClickHouse を使用すると、Unity Catalog のテーブルを Delta 形式および Iceberg 形式としてクエリできます。

:::note
この機能は実験的な機能であるため、次の設定で有効にする必要があります:
`SET allow_experimental_database_unity_catalog = 1;`
:::


## DatabricksにおけるUnityの設定 {#configuring-unity-in-databricks}

ClickHouseがUnityカタログと連携できるようにするには、Unity Catalogが外部リーダーとの連携を許可するように設定されていることを確認する必要があります。これは、["Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin)ガイドに従うことで実現できます。

外部アクセスを有効にすることに加えて、統合を設定するプリンシパルが、テーブルを含むスキーマに対して`EXTERNAL USE SCHEMA`[権限](https://docs.databricks.com/aws/en/external-access/admin#external-schema)を持っていることを確認してください。

カタログの設定が完了したら、ClickHouse用の認証情報を生成する必要があります。Unityとの連携モードに応じて、以下の2つの方法を使用できます。

- Icebergクライアントの場合は、[サービスプリンシパル](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)として認証を使用します。

- Deltaクライアントの場合は、Personal Access Token（[PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)）を使用します。


## Unity CatalogとClickHouse間の接続を作成する {#creating-a-connection-between-unity-catalog-and-clickhouse}

Unity Catalogの設定と認証が完了したら、ClickHouseとUnity Catalog間の接続を確立します。

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


## ClickHouseを使用したUnity catalogテーブルのクエリ {#querying-unity-catalog-tables-using-clickhouse}

接続が確立されたので、Unity catalogを介してクエリを実行できます。例:

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

Icebergクライアントを使用している場合、Uniformが有効化されたDeltaテーブルのみが表示されます:

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

テーブルをクエリするには:

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note バッククォートが必要
ClickHouseは複数の名前空間をサポートしていないため、バッククォートが必要です。
:::

テーブルのDDLを確認するには:

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


## Data LakeからClickHouseへのデータ読み込み {#loading-data-from-your-data-lake-into-clickhouse}

DatabricksからClickHouseにデータを読み込む場合は、まずローカルのClickHouseテーブルを作成します:

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

次に、`INSERT INTO SELECT`を使用してUnity Catalogテーブルからデータを読み込みます:

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
