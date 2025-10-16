---
'slug': '/use-cases/data-lake/rest-catalog'
'sidebar_label': 'REST カタログ'
'title': 'REST カタログ'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、ClickHouseを使用してデータをクエリする手順を説明します。'
'keywords':
- 'REST'
- 'Tabular'
- 'Data Lake'
- 'Iceberg'
'show_related_blogs': true
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
RESTカタログとの統合は、Icebergテーブルのみで動作します。
この統合は、AWS S3および他のクラウドストレージプロバイダーの両方をサポートしています。
:::

ClickHouseは、複数のカタログ（Unity、Glue、REST、Polarisなど）との統合をサポートしています。このガイドでは、ClickHouseと[RESTカタログ](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/)仕様を使用してデータをクエリする手順を説明します。

RESTカタログは、Icebergカタログのための標準化されたAPI仕様で、以下のようなさまざまなプラットフォームでサポートされています：
- **ローカル開発環境**（docker-composeセットアップを使用）
- **管理サービス**（Tabular.ioなど）
- **セルフホスト型**RESTカタログ実装

:::note
この機能は実験的なため、次のコマンドで有効にする必要があります：
`SET allow_experimental_database_iceberg = 1;`
:::

## ローカル開発セットアップ {#local-development-setup}

ローカル開発とテストのために、コンテナ化されたRESTカタログのセットアップを使用できます。このアプローチは、学習、プロトタイピング、開発環境に最適です。

### 前提条件 {#local-prerequisites}

1. **DockerとDocker Compose**：Dockerがインストールされ、実行中であることを確認してください
2. **サンプルセットアップ**：さまざまなdocker-composeセットアップを使用できます（下記の「代替Dockerイメージ」を参照）

### ローカルRESTカタログのセットアップ {#setting-up-local-rest-catalog}

**[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**などのさまざまなコンテナ化されたRESTカタログ実装を利用できます。これにより、Spark + Iceberg + RESTカタログ環境がdocker-composeとともに提供され、Iceberg統合のテストに最適です。

**ステップ1**：例を実行するための新しいフォルダーを作成し、[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)からの設定で`docker-compose.yml`というファイルを作成します。

**ステップ2**：次に、`docker-compose.override.yml`というファイルを作成し、以下のClickHouseコンテナ設定を追加します：

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

**ステップ3**：サービスを起動するために次のコマンドを実行します：

```bash
docker compose up
```

**ステップ4**：すべてのサービスが準備完了するまで待ちます。ログをチェックできます：

```bash
docker-compose logs -f
```

:::note
RESTカタログのセットアップには、最初にIcebergテーブルにサンプルデータをロードする必要があります。ClickHouseを通じてクエリを実行する前に、Spark環境がテーブルを作成およびポピュレーションしていることを確認してください。テーブルの利用可能性は、特定のdocker-composeセットアップおよびサンプルデータのロードスクリプトに依存します。
:::

### ローカルRESTカタログへの接続 {#connecting-to-local-rest-catalog}

ClickHouseコンテナに接続します：

```bash
docker exec -it clickhouse clickhouse-client
```

次に、RESTカタログへのデータベース接続を作成します：

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

接続が確立されたので、RESTカタログを介してクエリを開始できます。例えば：

```sql
USE demo;

SHOW TABLES;
```

サンプルデータ（タクシーデータセットなど）が含まれている場合、次のようなテーブルが表示されるはずです：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが表示されない場合、通常は以下の理由が考えられます：
1. Spark環境がサンプルテーブルをまだ作成していない
2. RESTカタログサービスが完全に初期化されていない
3. サンプルデータのロードプロセスが完了していない

Sparkのログをチェックして、テーブル作成の進捗を確認できます：
```bash
docker-compose logs spark
```
:::

テーブルをクエリするには（利用可能な場合）：

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note バックスラッシュが必要
ClickHouseは1つの名前空間以上をサポートしていないため、バックスラッシュが必要です。
:::

テーブルDDLを確認するには：

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

## データレイクからClickHouseへのデータのロード {#loading-data-from-your-data-lake-into-clickhouse}

RESTカタログからClickHouseにデータをロードする必要がある場合、まずローカルのClickHouseテーブルを作成します：

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

次に、`INSERT INTO SELECT`を介してRESTカタログテーブルからデータをロードします：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
