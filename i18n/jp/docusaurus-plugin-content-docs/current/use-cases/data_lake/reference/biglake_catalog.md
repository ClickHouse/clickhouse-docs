---
slug: /use-cases/data-lake/biglake-catalog
sidebar_label: 'BigLake Metastore'
title: 'Lakehouse runtime catalog (BigLake Metastore)'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と Lakehouse runtime Catalog (BigLake Metastore) を使用して Google Cloud Storage にある
 データをクエリする手順を説明します。'
keywords: ['BigLake', 'GCS', 'データレイク', 'Iceberg', 'Google Cloud', 'Lakehouse Runtime Catalog']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse は、複数のカタログ (Unity、Glue、Polaris など) との統合をサポートしています。このガイドでは、ClickHouse 経由で [Lakehouse runtime catalog (別名 BigLake Metastore) ](https://docs.cloud.google.com/biglake/docs/) 内の Iceberg テーブルをクエリする手順を説明します。

:::note
この機能はベータ版のため、以下を使用して有効にする必要があります。
`SET allow_database_iceberg = 1;`
:::

## 前提条件 \{#prerequisites\}

ClickHouse から Lakehouse runtime catalog (BigLake Metastore) への接続を作成する前に、次のものがあることを確認してください。

* Lakehouse runtime catalog が有効になっている **Google Cloud プロジェクト**
* [Google Cloud Console](https://docs.cloud.google.com/docs/authentication/provide-credentials-adc) で作成した、アプリケーション用の **Application Default Credentials** (OAuth クライアント ID とクライアント シークレット)
* 適切なスコープ (例: `https://www.googleapis.com/auth/bigquery` および GCS 用の storage スコープ) で OAuth フローを完了して取得した **リフレッシュ トークン**
* **warehouse** パス: テーブルが保存されている GCS バケット (および必要に応じてプレフィックス) 。例: `gs://your-bucket` または `gs://your-bucket/prefix`

## Lakehouse runtime catalog と ClickHouse の接続を作成する \{#creating-a-connection\}

OAuth 認証情報を設定したら、[DataLakeCatalog](/engines/database-engines/datalakecatalog) データベースエンジンを使用するデータベースを ClickHouse に作成します：

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE lakehouse_runtime_catalog
ENGINE = DataLakeCatalog('https://biglake.googleapis.com/iceberg/v1/restcatalog')
SETTINGS
    catalog_type = 'biglake',
    google_adc_client_id = '<client-id>',
    google_adc_client_secret = '<client-secret>',
    google_adc_refresh_token = '<refresh-token>',
    google_adc_quota_project_id = '<gcp-project-id>',
    warehouse = 'gs://<bucket_name>/<optional-prefix>';
```

## ClickHouse を使用した Lakehouse runtime catalog テーブルのクエリ \{#querying-lakehouse-runtime-tables\}

接続を作成したら、Lakehouse runtime catalog に登録されているテーブルをクエリできます。

```sql
USE LAKEHOUSE_RUNTIME_CATALOG;

SHOW TABLES;
```

出力例:

```response
┌─name──────────────────────────────────────┐
│lakehouse_runtime_catalog.my_iceberg_table │   
└───────────────────────────────────────────┘
```

```sql
SELECT count(*) FROM `lakehouse_runtime_catalog.my_iceberg_table`;
```

:::note Backticks required
ClickHouse は複数のネームスペースをサポートしていないため、バッククォートが必要です。
:::

テーブル定義を確認するには:

```sql
SHOW CREATE TABLE `lakehouse_runtime_catalog.my_iceberg_table`;
```

## Lakehouse から ClickHouse へのデータの読み込み \{#loading-data-into-clickhouse\}

繰り返し実行するクエリを高速化するため、Lakehouse runtime catalog テーブルからローカルの ClickHouse テーブルにデータを読み込むには、MergeTree テーブルを作成し、カタログから挿入します。

```sql
CREATE TABLE clickhouse_table
(
    `id` Int64,
    `event_time` DateTime64(3),
    `user_id` String,
    `payload` String
)
ENGINE = MergeTree
ORDER BY (event_time, id);

INSERT INTO local_events
SELECT * FROM lakehouse_runtime_catalog.`icebench.my_iceberg_table`;
```

初回ロード後は、より低レイテンシで利用するために `clickhouse_table` をクエリします。必要に応じて BigLake からデータを更新するには、`INSERT INTO ... SELECT` を再実行します。