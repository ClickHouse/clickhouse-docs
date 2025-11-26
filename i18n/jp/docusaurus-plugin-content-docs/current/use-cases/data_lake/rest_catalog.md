---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'REST カタログ'
title: 'REST カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と REST カタログを使用して
データにクエリを実行する手順を説明します。'
keywords: ['REST', '表形式', 'データレイク', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
REST Catalog との統合は Iceberg テーブルにのみ対応しています。
この統合は AWS S3 およびその他のクラウドストレージプロバイダーの両方に対応しています。
:::

ClickHouse は複数のカタログ (Unity、Glue、REST、Polaris など) との統合をサポートしています。このガイドでは、ClickHouse と [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/) 仕様を使用してデータをクエリする手順を説明します。

REST Catalog は Iceberg カタログ向けの標準化された API 仕様であり、次のようなさまざまなプラットフォームでサポートされています。

* **ローカル開発環境** (docker-compose ベースのセットアップを使用)
* Tabular.io のような **マネージドサービス**
* **セルフホスト型** の REST Catalog 実装

:::note
この機能は実験的な機能のため、次の設定で有効化する必要があります:
`SET allow_experimental_database_iceberg = 1;`
:::


## ローカル開発環境のセットアップ {#local-development-setup}

ローカルでの開発およびテストには、コンテナ化した REST カタログのセットアップを使用できます。この方法は、学習やプロトタイピング、開発環境に最適です。

### 前提条件 {#local-prerequisites}

1. **Docker と Docker Compose**: Docker がインストールされており、起動していることを確認してください
2. **サンプル環境**: さまざまな Docker Compose 構成を利用できます（以下の「Alternative Docker Images」を参照）

### ローカル REST カタログのセットアップ

**[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)** のような、コンテナ化されたさまざまな REST カタログ実装を利用できます。これは、Spark + Iceberg + REST カタログ環境一式を docker-compose で提供するため、Iceberg との統合をテストする用途に最適です。

**手順 1:** 例を実行するための新しいフォルダを作成し、[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io) に記載されている設定を使用して `docker-compose.yml` ファイルを作成します。

**手順 2:** 次に、`docker-compose.override.yml` ファイルを作成し、以下の ClickHouse コンテナ設定をその中に記述します。

```yaml
version: '3.8'

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: '0:0'  # root権限を確保します
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # データセットフォルダーをマウントします
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

**ステップ4：** すべてのサービスが起動して準備完了になるまで待ちます。ログを確認できます:

```bash
docker-compose logs -f
```

:::note
REST カタログをセットアップするには、まずサンプルデータを Iceberg テーブルにロードしておく必要があります。ClickHouse 経由でクエリを実行する前に、Spark 環境でテーブルが作成され、データが投入済みであることを必ず確認してください。テーブルが利用可能かどうかは、使用している特定の docker-compose セットアップおよびサンプルデータ読み込みスクリプトに依存します。
:::


### ローカルの REST カタログへの接続

ClickHouse コンテナに接続します。

```bash
docker exec -it clickhouse clickhouse-client
```

次に、REST カタログへのデータベース接続を作成します。

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```


## ClickHouse を使用した REST カタログテーブルのクエリ実行

接続が確立できたので、REST カタログ経由でクエリを実行できます。例えば、次のようになります。

```sql
USE demo;

SHOW TABLES;
```

セットアップにサンプルデータ（タクシーデータセットなど）が含まれている場合、次のようなテーブルが表示されているはずです。

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが表示されない場合、通常は次のいずれかが考えられます。

1. Spark 環境でサンプルテーブルがまだ作成されていない
2. REST カタログサービスがまだ完全に初期化されていない
3. サンプルデータのロード処理が完了していない

テーブル作成の進行状況は Spark ログで確認できます。

```bash
docker-compose logs spark
```

:::

テーブルが利用可能な場合にクエリを実行するには:

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note バッククォートが必要です
ClickHouse は複数のネームスペースをサポートしていないため、バッククォートが必須です。
:::

テーブルの DDL を確認するには:

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


## データレイク内のデータを ClickHouse に読み込む

REST カタログから ClickHouse にデータを読み込む必要がある場合は、まずローカルテーブルを作成します。

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

次に、`INSERT INTO SELECT` を使用して、REST カタログ テーブルからデータをロードします。

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
