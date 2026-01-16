---
slug: /use-cases/data-lake/unity-catalog
sidebar_label: 'Unity カタログ'
title: 'Unity カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と Unity Catalog を使用して
 S3 バケット内のデータにクエリを実行する方法を説明します。'
keywords: ['Unity', 'データレイク']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Unity Catalog との連携は、マネージドテーブルおよび外部テーブルの両方で利用できます。
この連携は現在、AWS 上でのみサポートされています。
:::

ClickHouse は複数のカタログ（Unity、Glue、Polaris など）との連携をサポートしています。本ガイドでは、ClickHouse と [Unity Catalog](https://www.databricks.com/product/unity-catalog) を使用して、Databricks によって管理されているデータをクエリする手順を説明します。

Databricks はレイクハウス向けに複数のデータ形式をサポートしています。ClickHouse を使用すると、Unity Catalog のテーブルを Delta および Iceberg としてクエリできます。

:::note
この機能は実験的なため、次の設定で有効化する必要があります:
`SET allow_experimental_database_unity_catalog = 1;`
:::

## Databricks での Unity の構成 \\{#configuring-unity-in-databricks\\}

ClickHouse が Unity カタログと連携できるようにするには、Unity Catalog を外部リーダーとの連携を許可するように構成しておく必要があります。これは、[「Unity Catalog への外部データ アクセスを有効にする」](https://docs.databricks.com/aws/en/external-access/admin) ガイドに従うことで実現できます。

外部アクセスを有効にすることに加えて、テーブルを含むスキーマに対して `EXTERNAL USE SCHEMA` [権限](https://docs.databricks.com/aws/en/external-access/admin#external-schema) を、統合を構成するプリンシパルが付与されていることを確認してください。

カタログの構成が完了したら、ClickHouse 用の認証情報を生成する必要があります。Unity との連携モードに応じて、2 つのいずれかの方法を使用できます。

* Iceberg クライアントの場合は、[サービス プリンシパル](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m) として認証を行います。

* Delta クライアントの場合は、Personal Access Token（[PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)）を使用します。

## Unity Catalog と ClickHouse の接続を確立する \\{#creating-a-connection-between-unity-catalog-and-clickhouse\\}

Unity Catalog の設定と認証が完了したら、ClickHouse と Unity Catalog の間に接続を確立します。

### Delta の読み込み \\{#read-delta\\}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity'
```

### Iceberg を読み込む \\{#read-iceberg\\}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace', 
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql'
```

## ClickHouse を使用して Unity カタログのテーブルをクエリする \\{#querying-unity-catalog-tables-using-clickhouse\\}

接続が確立できたので、Unity カタログ経由でクエリを実行できるようになりました。例えば次のように実行します。

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

Iceberg クライアントを使用している場合は、Uniform を有効にした Delta テーブルのみが表示されます。

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

テーブルに対してクエリを実行するには：

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note バッククォートが必要
ClickHouse は複数のネームスペースをサポートしていないため、バッククォートが必要です。
:::

テーブルの DDL を確認するには、次を実行します：

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

## データレイクから ClickHouse へのデータの読み込み \\{#loading-data-from-your-data-lake-into-clickhouse\\}

Databricks から ClickHouse にデータを読み込む必要がある場合は、まずローカルの ClickHouse テーブルを作成します。

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

次に、`INSERT INTO SELECT` を使って Unity Catalog のテーブルからデータをロードします。

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
