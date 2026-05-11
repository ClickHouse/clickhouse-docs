---
title: 'データカタログへの接続'
sidebar_label: 'カタログへの接続'
slug: /use-cases/data-lake/getting-started/connecting-catalogs
sidebar_position: 2
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/querying-directly
pagination_next: use-cases/data_lake/guides/accelerating-analytics
description: 'DataLakeCatalog データベースエンジンを使用して ClickHouse を外部データカタログに接続し、カタログ内のテーブルを ClickHouse ネイティブのデータベースとして公開します。'
keywords: ['データレイク', 'レイクハウス', 'カタログ', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[前のセクション](/use-cases/data-lake/getting-started/querying-directly)では、ストレージパスを直接指定してオープンテーブル形式をクエリしました。実際の運用では、ほとんどの組織が**データカタログ**を通じてテーブルのメタデータを管理します。データカタログは、テーブルの保存場所、スキーマ、パーティションを追跡する一元的なレジストリです。ClickHouse を [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) データベースエンジンを使用してカタログに接続すると、カタログ全体が ClickHouse データベースとして公開されます。カタログ内のすべてのテーブルが自動的に表示され、完全な ClickHouse SQL でクエリできます。個々のテーブルパスを把握したり、テーブルごとに認証情報を管理したりする必要はありません。

このガイドでは、[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) への接続方法を説明します。ClickHouse は以下のカタログもサポートしています。完全なセットアップ手順については、各リファレンスガイドを参照してください。

| Catalog              | Reference guide                                            |
| -------------------- | ---------------------------------------------------------- |
| AWS Glue             | [AWS Glue カタログ](/use-cases/data-lake/glue-catalog)         |
| Iceberg REST Catalog | [REST カタログ](/use-cases/data-lake/rest-catalog)             |
| Lakekeeper           | [Lakekeeper カタログ](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie       | [Nessie カタログ](/use-cases/data-lake/nessie-catalog)         |
| Microsoft OneLake    | [Fabric OneLake](/use-cases/data-lake/onelake-catalog)     |

## Unity Catalog への接続 \{#connecting-to-unity-catalog\}

<BetaBadge />

ここでは例として、Unity Catalog を使用します。

[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) は、Databricks の lakehouse データに対する一元的なガバナンスを提供します。

Databricks は、lakehouse 向けに複数のデータ形式をサポートしています。ClickHouse では、Unity Catalog のテーブルを Delta と Iceberg の両形式でクエリできます。

:::note
Unity Catalog との統合は、マネージドテーブルと外部テーブルの両方で機能します。
この統合は現在、AWS でのみサポートされています。
:::

### Databricks で Unity を設定する \{#configuring-unity-in-databricks\}

ClickHouse が Unity Catalog と連携できるようにするには、外部リーダーとの連携を許可するように Unity Catalog が設定されていることを確認する必要があります。これを行うには、[「Unity Catalog への外部データアクセスを有効にする」](https://docs.databricks.com/aws/en/external-access/admin) ガイドの手順に従ってください。

外部アクセスを有効にするだけでなく、統合を設定するプリンシパルに、テーブルを含むスキーマに対する `EXTERNAL USE SCHEMA` [権限](https://docs.databricks.com/aws/en/external-access/admin#external-schema) が付与されていることも確認してください。

カタログの設定が完了したら、ClickHouse 用の認証情報を生成する必要があります。Unity との連携モードに応じて、次の 2 つの方法を使用できます。

* Iceberg クライアントの場合は、[service principal](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m) を使用して認証します。

* Delta クライアントの場合は、Personal Access Token ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)) を使用します。

### カタログに接続する \{#connect-catalog\}

認証情報を使用して、該当するエンドポイントに接続し、Iceberg または Delta テーブルに対してクエリを実行できます。

<Tabs groupId="connection-formats">
  <TabItem value="delta" label="Delta" default>
    Delta 形式のデータにアクセスするには、[Unity catalog](/use-cases/data-lake/unity-catalog) を使用します。

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

カタログに接続したら、テーブルを一覧表示できます。

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘

31 rows in set.
```

### テーブルスキーマの確認 \{#exploring-table-schemas\}

標準の `SHOW CREATE TABLE` コマンドを使用すると、テーブルがどのように作成されたかを確認できます。

:::note バッククォートが必要です
ネームスペースとテーブル名はバッククォートで囲んで指定する必要がある点に注意してください。ClickHouse は複数のネームスペースをサポートしていません。
:::

以下は、REST Iceberg カタログに対してクエリを実行することを前提としています。

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

すべての ClickHouse 関数を使用できます。繰り返しになりますが、ネームスペース名とテーブル名はバッククォートで囲む必要があります。

```sql

SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

完全なセットアップ手順については、[Unity Catalog リファレンスガイド](/use-cases/data-lake/unity-catalog)を参照してください。
