---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'REST カタログ'
title: 'REST カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と REST Catalog を使用して
データにクエリを実行する手順をご説明します。'
keywords: ['REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
REST Catalog との統合は Iceberg テーブルでのみ機能します。
この統合は AWS S3 およびその他のクラウドストレージプロバイダーの両方をサポートします。
:::

ClickHouse は複数のカタログ (Unity、Glue、REST、Polaris など) との統合をサポートしています。このガイドでは、ClickHouse と [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/) 仕様を使用してデータをクエリする手順を説明します。

REST Catalog は Iceberg カタログ向けの標準化された API 仕様であり、次のようなさまざまなプラットフォームでサポートされています：

* **ローカル開発環境** (docker-compose 構成を使用)
* **Tabular.io のようなマネージドサービス**
* **セルフホスト型** REST カタログ実装

:::note
この機能は実験的機能であるため、次の設定で有効化する必要があります：
`SET allow_experimental_database_iceberg = 1;`
:::


## ローカル開発環境のセットアップ {#local-development-setup}

ローカル開発およびテストには、コンテナ化されたRESTカタログのセットアップを使用できます。このアプローチは、学習、プロトタイピング、および開発環境に最適です。

### 前提条件 {#local-prerequisites}

1. **DockerとDocker Compose**: Dockerがインストールされ、実行されていることを確認してください
2. **サンプルセットアップ**: 様々なdocker-composeセットアップを使用できます（以下の代替Dockerイメージを参照）

### ローカルRESTカタログのセットアップ {#setting-up-local-rest-catalog}

**[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**などの様々なコンテナ化されたRESTカタログ実装を使用できます。これはdocker-composeで完全なSpark + Iceberg + RESTカタログ環境を提供し、Iceberg統合のテストに最適です。

**ステップ1:** サンプルを実行するための新しいフォルダを作成し、[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)の設定を使用して`docker-compose.yml`ファイルを作成します。

**ステップ2:** 次に、`docker-compose.override.yml`ファイルを作成し、以下のClickHouseコンテナ設定を記述します:

```yaml
version: "3.8"

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: "0:0" # root権限を確保
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import # データセットフォルダをマウント
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
```

**ステップ3:** 以下のコマンドを実行してサービスを起動します:

```bash
docker compose up
```

**ステップ4:** すべてのサービスが準備完了するまで待ちます。ログを確認できます:

```bash
docker-compose logs -f
```

:::note
RESTカタログのセットアップでは、最初にサンプルデータをIcebergテーブルにロードする必要があります。ClickHouseを通じてテーブルをクエリする前に、Spark環境がテーブルを作成し、データを投入していることを確認してください。テーブルの可用性は、特定のdocker-composeセットアップとサンプルデータロードスクリプトに依存します。
:::

### ローカルRESTカタログへの接続 {#connecting-to-local-rest-catalog}

ClickHouseコンテナに接続します:

```bash
docker exec -it clickhouse clickhouse-client
```

次に、RESTカタログへのデータベース接続を作成します:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS
    catalog_type = 'rest',
    storage_endpoint = 'http://minio:9000/lakehouse',
    warehouse = 'demo'
```


## ClickHouseを使用したRESTカタログテーブルのクエリ {#querying-rest-catalog-tables-using-clickhouse}

接続が確立されたので、RESTカタログ経由でクエリを開始できます。例:

```sql
USE demo;

SHOW TABLES;
```

セットアップにサンプルデータ(タクシーデータセットなど)が含まれている場合、次のようなテーブルが表示されます:

```sql title="レスポンス"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが表示されない場合、通常は次のいずれかを意味します:

1. Spark環境がまだサンプルテーブルを作成していない
2. RESTカタログサービスが完全に初期化されていない
3. サンプルデータの読み込みプロセスが完了していない

Sparkログを確認して、テーブル作成の進行状況を確認できます:

```bash
docker-compose logs spark
```

:::

テーブルをクエリするには(利用可能な場合):

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="レスポンス"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note バッククォートが必要
ClickHouseは複数の名前空間をサポートしていないため、バッククォートが必要です。
:::

テーブルのDDLを確認するには:

```sql
SHOW CREATE TABLE `default.taxis`;
```

```sql title="レスポンス"
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


## Data LakeからClickHouseへのデータロード {#loading-data-from-your-data-lake-into-clickhouse}

RESTカタログからClickHouseにデータをロードする場合は、まずローカルのClickHouseテーブルを作成します:

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

次に、`INSERT INTO SELECT`を使用してRESTカタログテーブルからデータをロードします:

```sql
INSERT INTO taxis
SELECT * FROM demo.`default.taxis`;
```
