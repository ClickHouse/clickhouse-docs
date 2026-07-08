---
slug: /use-cases/data-lake/polaris-catalog
sidebar_label: 'Polaris カタログ'
title: 'Polaris カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と Snowflake Polaris カタログを使用して
 データをクエリする手順を説明します。'
keywords: ['Polaris', 'Snowflake', 'データレイク']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse は複数のカタログ (Unity、Glue、Polaris など) との連携をサポートしています。このガイドでは、ClickHouse と [Apache Polaris Catalog](https://polaris.apache.org/releases/1.1.0/getting-started/using-polaris/#setup) を使用してデータをクエリする手順を説明します。
Apache Polaris は Iceberg テーブルと Delta Tables (Generic Tables 経由) をサポートしています。現時点では、この連携でサポートされるのは Iceberg テーブルのみです。

:::note
この機能は実験的であるため、次を使用して有効にする必要があります。
`SET allow_experimental_database_unity_catalog = 1;`
:::

## 前提条件 \{#prerequisites\}

Polaris catalog に接続するには、以下が必要です。

* Snowflake Open Catalog (ホスト型 Polaris) またはセルフホスト型 Polaris Catalog
* Polaris catalog の URI (例: `https://<account-id>.<region>.aws.snowflakecomputing.com/polaris/api/catalog/v1` または `http://polaris:8181/api/catalog/v1/oauth/tokens`)
* catalog の認証情報 (client ID と client secret)
* Polaris インスタンスの OAuth token URI
* Iceberg データが保存されているオブジェクトストアのストレージエンドポイント (例: S3)
* ClickHouse バージョン 26.1+

Open Catalog (Snowflake のマネージド Polaris 提供) では URI に `/polaris` が含まれますが、セルフホスト型では含まれない場合があります。

<VerticalStepper>
  ## Polaris と ClickHouse の間の接続を作成する \{#connecting\}

  ClickHouse を Polaris catalog に接続するデータベースを作成します。

  ```sql
  CREATE DATABASE polaris_catalog
  ENGINE = DataLakeCatalog('https://<catalog_uri>/api/catalog/v1')
  SETTINGS
      catalog_type = 'rest',
      catalog_credential = '<client-id>:<client-secret>',
      warehouse = 'snowflake',
      auth_scope = 'PRINCIPAL_ROLE:ALL',
      oauth_server_uri = 'https://<catalog_uri>/api/catalog/v1/oauth/tokens',
      storage_endpoint = '<storage_endpoint>'
  ```

  ## ClickHouse を使用して Polaris catalog をクエリする \{#query-polaris-catalog\}

  接続を設定したら、Polaris をクエリできます。

  ```sql title="クエリ"
  USE polaris_catalog;
  SHOW TABLES;
  ```

  テーブルをクエリするには、次を実行します。

  ```sql title="クエリ"
  SELECT count(*) FROM `polaris_db.my_iceberg_table`;
  ```

  :::note
  たとえば `schema.table` のように、バッククォートが必要です。
  :::

  テーブルの DDL を確認するには、次を実行します。

  ```sql
  SHOW CREATE TABLE `polaris_db.my_iceberg_table`;
  ```

  ## Polaris から ClickHouse にデータをロードする \{#loading-data-into-clickhouse\}

  Polaris から ClickHouse テーブルにデータをロードするには、まず必要なスキーマで target テーブルを作成し、その後 Polaris テーブルから INSERT します。

  ```sql title="クエリ"
  CREATE TABLE my_clickhouse_table
  (
      -- Iceberg テーブルに合わせてカラムを定義
      `id` Int64,
      `name` String,
      `event_time` DateTime64(3)
  )
  ENGINE = MergeTree
  ORDER BY id;

  INSERT INTO my_clickhouse_table
  SELECT * FROM polaris_catalog.`polaris_db.my_iceberg_table`;
  ```
</VerticalStepper>