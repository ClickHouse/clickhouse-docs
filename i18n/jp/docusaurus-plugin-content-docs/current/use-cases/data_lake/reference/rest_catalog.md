---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'REST カタログ'
title: 'REST カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と REST カタログを使用して
 データに対してクエリを実行する手順を説明します。'
keywords: ['REST', 'Tabular', 'データレイク', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
REST Catalog との統合は Iceberg テーブルでのみ動作します。
この統合は AWS S3 およびその他のクラウドストレージプロバイダーの両方をサポートします。
:::

ClickHouse は複数のカタログ (Unity、Glue、REST、Polaris など) との統合をサポートしています。このガイドでは、ClickHouse と [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/) 仕様を使用してデータにクエリを実行する手順を説明します。

REST Catalog は Iceberg カタログ向けの標準化された API 仕様で、次のようなさまざまなプラットフォームでサポートされています。

* **ローカル開発環境** (docker-compose を用いたセットアップ)
* Tabular.io のような **マネージドサービス**
* **セルフホスト** 型の REST カタログ実装

:::note
この機能はベータ版のため、次の設定を使用して有効化する必要があります:
`SET allow_database_iceberg = 1;`
:::


## ローカル開発環境のセットアップ \{#local-development-setup\}

ローカルでの開発やテストには、コンテナ化された REST カタログ環境を利用できます。この方法は、学習用途やプロトタイピング、開発環境での利用に最適です。

### 前提条件 \{#local-prerequisites\}

1. **Docker および Docker Compose**: Docker がインストールされ、稼働していることを確認してください
2. **サンプルセットアップ**: さまざまな docker-compose セットアップを使用できます（下記の「Alternative Docker Images」を参照してください）

### ローカル REST カタログのセットアップ \{#setting-up-local-rest-catalog\}

**[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)** のような、さまざまなコンテナ化された REST カタログ実装を利用できます。これは、Spark + Iceberg + REST カタログ環境一式を docker-compose で提供し、Iceberg との連携をテストするのに最適です。

**手順 1:** この例を実行するための新しいディレクトリを作成し、その中に `docker-compose.yml` ファイルを作成して、[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io) の設定を記載します。

**手順 2:** 次に、`docker-compose.override.yml` ファイルを作成し、次の ClickHouse コンテナ設定をその中に追加します。

```yaml
version: '3.8'

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: '0:0'  # Ensures root permissions
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # Mount dataset folder
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
```

**ステップ 3：** 次のコマンドを実行してサービスを起動します。

```bash
docker compose up
```

**ステップ 4:** すべてのサービスが準備完了になるまで待ちます。状態はログで確認できます:

```bash
docker-compose logs -f
```

:::note
REST カタログをセットアップするには、まずサンプルデータが Iceberg テーブルにロードされている必要があります。ClickHouse からクエリを実行しようとする前に、Spark 環境でテーブルが作成され、データが投入されていることを確認してください。テーブルが利用可能かどうかは、使用している特定の docker-compose のセットアップと、サンプルデータをロードするスクリプトに依存します。
:::


### ローカル REST カタログへの接続 \{#connecting-to-local-rest-catalog\}

ClickHouse コンテナに接続します。

```bash
docker exec -it clickhouse clickhouse-client
```

次に、REST カタログ用のデータベース接続を作成します。

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```


## ClickHouse で REST カタログテーブルをクエリする \{#querying-rest-catalog-tables-using-clickhouse\}

接続が確立されたので、REST カタログ経由でクエリを実行できるようになりました。例えば、次のようにします。

```sql
USE demo;

SHOW TABLES;
```

環境にサンプルデータ（タクシーのデータセットなど）が含まれている場合は、次のようなテーブルが表示されます。

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが表示されない場合、通常は次のいずれかが原因です。

1. Spark 環境でサンプルテーブルがまだ作成されていない
2. REST カタログサービスが完全に初期化されていない
3. サンプルデータの読み込み処理が完了していない

Spark のログを参照して、テーブル作成の進捗状況を確認できます。

```bash
docker-compose logs spark
```

:::

（利用可能な場合）テーブルに対してクエリを実行するには、次のようにします。

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note Backticks required
ClickHouse は複数のネームスペースをサポートしていないため、バッククォートが必要です。
:::

テーブルの DDL を確認するには次を実行します:

```sql
SHOW CREATE TABLE `default.taxis`;
```

```sql title="Response"
┌─statement─────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE demo.`default.taxis`                                                             │
│ (                                                                                             │
│     `VendorID` Nullable(Int64),                                                               │
│     `tpep_pickup_datetime` Nullable(DateTime64(6)),                                           │
│     `tpep_dropoff_datetime` Nullable(DateTime64(6)),                                          │
│     `passenger_count` Nullable(Float64),                                                      │
│     `trip_distance` Nullable(Float64),                                                        │
│     `RatecodeID` Nullable(Float64),                                                           │
│     `store_and_fwd_flag` Nullable(String),                                                    │
│     `PULocationID` Nullable(Int64),                                                           │
│     `DOLocationID` Nullable(Int64),                                                           │
│     `payment_type` Nullable(Int64),                                                           │
│     `fare_amount` Nullable(Float64),                                                          │
│     `extra` Nullable(Float64),                                                                │
│     `mta_tax` Nullable(Float64),                                                              │
│     `tip_amount` Nullable(Float64),                                                           │
│     `tolls_amount` Nullable(Float64),                                                         │
│     `improvement_surcharge` Nullable(Float64),                                                │
│     `total_amount` Nullable(Float64),                                                         │
│     `congestion_surcharge` Nullable(Float64),                                                 │
│     `airport_fee` Nullable(Float64)                                                           │
│ )                                                                                             │
│ ENGINE = Iceberg('http://minio:9000/lakehouse/warehouse/default/taxis/', 'admin', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## データレイクから ClickHouse へのデータ読み込み \{#loading-data-from-your-data-lake-into-clickhouse\}

REST カタログから ClickHouse にデータを読み込む必要がある場合は、まずローカルの ClickHouse テーブルを作成します。

```sql
CREATE TABLE taxis
(
    `VendorID` Int64,
    `tpep_pickup_datetime` DateTime64(6),
    `tpep_dropoff_datetime` DateTime64(6),
    `passenger_count` Float64,
    `trip_distance` Float64,
    `RatecodeID` Float64,
    `store_and_fwd_flag` String,
    `PULocationID` Int64,
    `DOLocationID` Int64,
    `payment_type` Int64,
    `fare_amount` Float64,
    `extra` Float64,
    `mta_tax` Float64,
    `tip_amount` Float64,
    `tolls_amount` Float64,
    `improvement_surcharge` Float64,
    `total_amount` Float64,
    `congestion_surcharge` Float64,
    `airport_fee` Float64
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(tpep_pickup_datetime)
ORDER BY (VendorID, tpep_pickup_datetime, PULocationID, DOLocationID);
```

次に、`INSERT INTO SELECT` を使用して REST カタログテーブルからデータを読み込みます。

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
