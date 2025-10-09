---
'slug': '/use-cases/data-lake/unity-catalog'
'sidebar_label': 'Unity Catalog'
'title': 'Unity Catalog'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、ClickHouseとUnity Catalogを使用してS3バケット内のデータをクエリする手順について説明します。'
'keywords':
- 'Unity'
- 'Data Lake'
'show_related_blogs': true
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
Unity Catalogとの統合は、管理されたテーブルおよび外部テーブルで機能します。
この統合は現在AWSでのみサポートされています。
:::

ClickHouseは、複数のカタログ（Unity、Glue、Polarisなど）との統合をサポートしています。このガイドでは、ClickHouseを使用してDatabricksによって管理されているデータにクエリを実行する手順を説明します。[Unity Catalog](https://www.databricks.com/product/unity-catalog)を使用します。

Databricksは、ラキハウスに対して複数のデータ形式をサポートしています。ClickHouseを使用すると、Unity CatalogのテーブルにDeltaとIcebergの両方としてクエリを実行できます。

:::note
この機能は実験的であるため、次のコマンドを使用して有効にする必要があります:
`SET allow_experimental_database_unity_catalog = 1;`
:::

## DatabricksにおけるUnityの設定 {#configuring-unity-in-databricks}

ClickHouseがUnityカタログと相互作用できるようにするには、Unity Catalogが外部リーダーとの相互作用を許可するように設定されていることを確認する必要があります。これを達成するには、[「Unity Catalogへの外部データアクセスを有効にする」](https://docs.databricks.com/aws/en/external-access/admin)ガイドに従います。

外部アクセスを有効にするだけでなく、統合を設定している主体が、テーブルを含むスキーマに対して`EXTERNAL USE SCHEMA`の[特権](https://docs.databricks.com/aws/en/external-access/admin#external-schema)を持っていることを確認してください。

カタログの設定が完了したら、ClickHouseのための認証情報を生成する必要があります。Unityとの相互作用モードに応じて、2つの異なる方法を使用できます。

* Icebergクライアントの場合、[サービス プリンシパル](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)として認証を使用します。

* Deltaクライアントの場合、パーソナル アクセス トークン（[PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)）を使用します。

## Unity CatalogとClickHouseの接続を作成する {#creating-a-connection-between-unity-catalog-and-clickhouse}

Unity Catalogの設定と認証が整ったら、ClickHouseとUnity Catalog間に接続を確立します。

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

## ClickHouseを使用してUnityカタログテーブルにクエリを実行する {#querying-unity-catalog-tables-using-clickhouse}

接続が確立されたので、Unityカタログを介してクエリを開始できます。たとえば:

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

Icebergクライアントを使用している場合、Uniformが有効なDeltaテーブルのみが表示されます:

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

:::note バックティックが必要
ClickHouseは1つの名前空間しかサポートしていないため、バックティックが必要です。
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

## データレイクからClickHouseへのデータの読み込み {#loading-data-from-your-data-lake-into-clickhouse}

DatabricksからClickHouseにデータを読み込む必要がある場合、最初にローカルのClickHouseテーブルを作成します:

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

次に、`INSERT INTO SELECT`を介してUnity Catalogテーブルからデータを読み込みます:

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
