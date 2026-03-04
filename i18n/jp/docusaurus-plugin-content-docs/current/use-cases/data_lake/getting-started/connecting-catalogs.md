---
title: 'データカタログへの接続'
sidebar_label: 'カタログへの接続'
slug: /use-cases/data-lake/getting-started/connecting-catalogs
sidebar_position: 2
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/getting-started/querying-directly
pagination_next: use-cases/data_lake/getting-started/accelerating-analytics
description: 'ClickHouse を外部データカタログに接続し、DataLakeCatalog データベースエンジンを使用してカタログのテーブルをネイティブな ClickHouse データベースとして公開します。'
keywords: ['データレイク', 'レイクハウス', 'カタログ', 'Glue', 'Unity', 'REST', 'Lakekeeper', 'Nessie', 'OneLake']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[前のセクション](/use-cases/data-lake/getting-started/querying-directly)では、ストレージパスを直接指定してオープンなテーブル形式に対してクエリを実行しました。実際には、ほとんどの組織はテーブルのメタデータを **データカタログ** を通じて管理します。これは、テーブルの場所、スキーマ、およびパーティションを追跡する集中管理されたレジストリです。[`DataLakeCatalog`](/engines/database-engines/datalakecatalog) データベースエンジンを使用して ClickHouse をカタログに接続すると、カタログ全体を ClickHouse のデータベースとして扱えるようになります。カタログ内のすべてのテーブルは自動的に認識され、テーブルごとのパスや認証情報を把握・管理することなく、ClickHouse の SQL をフルに利用してクエリできます。

このガイドでは、[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) への接続手順を説明します。ClickHouse は次のカタログにも対応しており、完全なセットアップ手順については、それぞれのリファレンスガイドを参照してください。

| Catalog              | Reference guide                                            |
| -------------------- | ---------------------------------------------------------- |
| AWS Glue             | [AWS Glue カタログ](/use-cases/data-lake/glue-catalog)         |
| Iceberg REST Catalog | [REST カタログ](/use-cases/data-lake/rest-catalog)             |
| Lakekeeper           | [Lakekeeper カタログ](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie       | [Nessie カタログ](/use-cases/data-lake/nessie-catalog)         |
| Microsoft OneLake    | [Fabric OneLake](/use-cases/data-lake/onelake-catalog)     |


## Unity Catalog への接続 \{#connecting-to-unity-catalog\}

<BetaBadge/>

ここでは例として Unity Catalog を使用します。

[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) は、Databricks レイクハウス環境のデータに対する一元的なガバナンスを提供します。

Databricks は、そのレイクハウスに対して複数のデータ形式をサポートしています。ClickHouse を使用すると、Unity Catalog のテーブルを Delta および Iceberg としてクエリできます。

:::note
Unity Catalog との連携は、マネージドテーブルおよび外部テーブルで動作します。
この連携機能は現在、AWS 環境上でのみサポートされています。
:::

### Databricks での Unity の構成 \{#configuring-unity-in-databricks\}

ClickHouse から Unity Catalog と連携できるようにするには、Unity Catalog が外部リーダーからのアクセスを許可するよう構成されている必要があります。これは、["Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin) ガイドに従うことで実現できます。

外部アクセスを有効化することに加えて、テーブルを含むスキーマに対して、連携を構成するプリンシパルが `EXTERNAL USE SCHEMA` [権限](https://docs.databricks.com/aws/en/external-access/admin#external-schema) を持っていることを確認してください。

カタログの構成が完了したら、ClickHouse 用のクレデンシャルを生成する必要があります。Unity との接続モードに応じて、2 つの異なる方法を使用できます。

* Iceberg クライアントの場合は、[service principal](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m) を使って認証します。

* Delta クライアントの場合は、Personal Access Token（[PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)）を使用します。

### カタログに接続する \{#connect-catalog\}

認証情報を使用して、対象のエンドポイントに接続し、Iceberg または Delta テーブルに対してクエリを実行できます。

<Tabs groupId="connection-formats">
<TabItem value="delta" label="Delta" default>

[Unity Catalog](/use-cases/data-lake/unity-catalog) は、Delta 形式のデータにアクセスするために使用します。

```sql
SET allow_experimental_database_unity_catalog = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity';
```

</TabItem>
<TabItem value="iceberg" label="Iceberg" default>

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
```

</TabItem>
</Tabs>

### テーブルを一覧表示する \{#list-tables\}

カタログへの接続が確立されたら、テーブルを一覧表示できます。

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘

31 rows in set.
```


### テーブルスキーマの探索 \{#exploring-table-schemas\}

標準の `SHOW CREATE TABLE` コマンドを使用して、テーブルがどのように作成されたかを確認できます。

:::note Backticks required
ネームスペースとテーブル名をバッククォートで囲んで指定する必要がある点に注意してください。ClickHouse は複数のネームスペースをサポートしていません。
:::

以下では、REST Iceberg カタログに対してクエリを実行することを前提としています。

```sql
SHOW CREATE TABLE unity.`icebench.single_day_log`

CREATE TABLE unity.`icebench.single_day_log`
(
    `pull_request_number` Nullable(Int64),
    `commit_sha` Nullable(String),
    `check_start_time` Nullable(DateTime64(6, 'UTC')),
    `check_name` Nullable(String),
    `instance_type` Nullable(String),
    `instance_id` Nullable(String),
    `event_date` Nullable(Date32),
    `event_time` Nullable(DateTime64(6, 'UTC')),
    `event_time_microseconds` Nullable(DateTime64(6, 'UTC')),
    `thread_name` Nullable(String),
    `thread_id` Nullable(Decimal(20, 0)),
    `level` Nullable(String),
    `query_id` Nullable(String),
    `logger_name` Nullable(String),
    `message` Nullable(String),
    `revision` Nullable(Int64),
    `source_file` Nullable(String),
    `source_line` Nullable(Decimal(20, 0)),
    `message_format_string` Nullable(String)
)
ENGINE = Iceberg('s3://...')
```


### テーブルをクエリする \{#querying-a-table\}

すべての ClickHouse 関数が利用可能です。繰り返しになりますが、ネームスペースとテーブル名はバッククォートで囲む必要があります。

```sql

SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

セットアップの全手順については、[Unity Catalog リファレンスガイド](/use-cases/data-lake/unity-catalog)を参照してください。
