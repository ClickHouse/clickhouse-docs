---
'slug': '/use-cases/data-lake/lakekeeper-catalog'
'sidebar_label': 'Lakekeeper カタログ'
'title': 'Lakekeeper カタログ'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、ClickHouse と Lakekeeper カタログを使用してデータをクエリする手順をご紹介します。'
'keywords':
- 'Lakekeeper'
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
Lakekeeper カタログとの統合は Iceberg テーブルのみに対応しています。
この統合は AWS S3 とその他のクラウドストレージプロバイダーの両方をサポートします。
:::

ClickHouse は複数のカタログ (Unity、Glue、REST、Polaris など) との統合をサポートしています。このガイドでは、ClickHouse と [Lakekeeper](https://docs.lakekeeper.io/) カタログを使用してデータをクエリする手順を説明します。

Lakekeeper は Apache Iceberg 用のオープンソース REST カタログ実装であり、次の機能を提供します：
- **Rust ネイティブ** 実装により高いパフォーマンスと信頼性
- **REST API** が Iceberg REST カタログ仕様に準拠
- **クラウドストレージ** が S3 互換のストレージと統合

:::note
この機能は実験的であるため、以下を使用して有効にする必要があります：
`SET allow_experimental_database_iceberg = 1;`
:::

## ローカル開発セットアップ {#local-development-setup}

ローカル開発およびテストのために、コンテナ化された Lakekeeper セットアップを使用できます。このアプローチは、学習、プロトタイピング、および開発環境に最適です。

### 前提条件 {#local-prerequisites}

1. **Docker と Docker Compose**：Docker がインストールされ、実行中であることを確認します。
2. **サンプルセットアップ**：Lakekeeper の docker-compose セットアップを使用できます。

### ローカル Lakekeeper カタログの設定 {#setting-up-local-lakekeeper-catalog}

公式の [Lakekeeper docker-compose セットアップ](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal) を使用できます。これにより、Lakekeeper、PostgreSQL メタデータバックエンド、およびオブジェクトストレージのための MinIO を含む完全な環境が提供されます。

**ステップ 1:** サンプルを実行するための新しいフォルダーを作成し、次の構成を持つファイル `docker-compose.yml` を作成します：

```yaml
version: '3.8'

services:
  lakekeeper:
    image: quay.io/lakekeeper/catalog:latest
    environment:
      - LAKEKEEPER__PG_ENCRYPTION_KEY=This-is-NOT-Secure!
      - LAKEKEEPER__PG_DATABASE_URL_READ=postgresql://postgres:postgres@db:5432/postgres
      - LAKEKEEPER__PG_DATABASE_URL_WRITE=postgresql://postgres:postgres@db:5432/postgres
      - RUST_LOG=info
    command: ["serve"]
    healthcheck:
      test: ["CMD", "/home/nonroot/lakekeeper", "healthcheck"]
      interval: 1s
      timeout: 10s
      retries: 10
      start_period: 30s
    depends_on:
      migrate:
        condition: service_completed_successfully
      db:
        condition: service_healthy
      minio:
        condition: service_healthy
    ports:
      - 8181:8181
    networks:
      - iceberg_net

  migrate:
    image: quay.io/lakekeeper/catalog:latest-main
    environment:
      - LAKEKEEPER__PG_ENCRYPTION_KEY=This-is-NOT-Secure!
      - LAKEKEEPER__PG_DATABASE_URL_READ=postgresql://postgres:postgres@db:5432/postgres
      - LAKEKEEPER__PG_DATABASE_URL_WRITE=postgresql://postgres:postgres@db:5432/postgres
      - RUST_LOG=info
    restart: "no"
    command: ["migrate"]
    depends_on:
      db:
        condition: service_healthy
    networks:
      - iceberg_net

  bootstrap:
    image: curlimages/curl
    depends_on:
      lakekeeper:
        condition: service_healthy
    restart: "no"
    command:
      - -w
      - "%{http_code}"
      - "-X"
      - "POST"
      - "-v"
      - "http://lakekeeper:8181/management/v1/bootstrap"
      - "-H"
      - "Content-Type: application/json"
      - "--data"
      - '{"accept-terms-of-use": true}'
      - "-o"
      - "/dev/null"
    networks:
      - iceberg_net

  initialwarehouse:
    image: curlimages/curl
    depends_on:
      lakekeeper:
        condition: service_healthy
      bootstrap:
        condition: service_completed_successfully
    restart: "no"
    command:
      - -w
      - "%{http_code}"
      - "-X"
      - "POST"
      - "-v"
      - "http://lakekeeper:8181/management/v1/warehouse"
      - "-H"
      - "Content-Type: application/json"
      - "--data"
      - '{"warehouse-name": "demo", "project-id": "00000000-0000-0000-0000-000000000000", "storage-profile": {"type": "s3", "bucket": "warehouse-rest", "key-prefix": "", "assume-role-arn": null, "endpoint": "http://minio:9000", "region": "local-01", "path-style-access": true, "flavor": "minio", "sts-enabled": true}, "storage-credential": {"type": "s3", "credential-type": "access-key", "aws-access-key-id": "minio", "aws-secret-access-key": "ClickHouse_Minio_P@ssw0rd"}}'
      - "-o"
      - "/dev/null"
    networks:
      - iceberg_net

  db:
    image: bitnami/postgresql:16.3.0
    environment:
      - POSTGRESQL_USERNAME=postgres
      - POSTGRESQL_PASSWORD=postgres
      - POSTGRESQL_DATABASE=postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -p 5432 -d postgres"]
      interval: 2s
      timeout: 10s
      retries: 5
      start_period: 10s
    volumes:
      - postgres_data:/bitnami/postgresql
    networks:
      - iceberg_net

  minio:
    image: bitnami/minio:2025.4.22
    environment:
      - MINIO_ROOT_USER=minio
      - MINIO_ROOT_PASSWORD=ClickHouse_Minio_P@ssw0rd
      - MINIO_API_PORT_NUMBER=9000
      - MINIO_CONSOLE_PORT_NUMBER=9001
      - MINIO_SCHEME=http
      - MINIO_DEFAULT_BUCKETS=warehouse-rest
    networks: 
      iceberg_net:
        aliases:
          - warehouse-rest.minio
    ports:
      - "9002:9000"
      - "9003:9001"
    healthcheck:
      test: ["CMD", "mc", "ls", "local", "|", "grep", "warehouse-rest"]
      interval: 2s
      timeout: 10s
      retries: 3
      start_period: 15s
    volumes:
      - minio_data:/bitnami/minio/data

  clickhouse:
    image: clickhouse/clickhouse-server:head
    container_name: lakekeeper-clickhouse
    user: '0:0'  # Ensures root permissions
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # Mount dataset folder
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
    depends_on:
      lakekeeper:
        condition: service_healthy
      minio:
        condition: service_healthy

volumes:
  postgres_data:
  minio_data:
  clickhouse_data:

networks:
  iceberg_net:
    driver: bridge
```

**ステップ 2:** 次のコマンドを実行してサービスを開始します：

```bash
docker compose up -d
```

**ステップ 3:** すべてのサービスが準備完了になるまで待ちます。ログを確認できます：

```bash
docker-compose logs -f
```

:::note
Lakekeeper セットアップでは、まず Iceberg テーブルにサンプルデータがロードされる必要があります。ClickHouse を通じてクエリを実行する前に、環境がテーブルを作成し、データを投入していることを確認してください。テーブルの利用可能性は、特定の docker-compose セットアップおよびサンプルデータの読み込みスクリプトに依存します。
:::

### ローカル Lakekeeper カタログへの接続 {#connecting-to-local-lakekeeper-catalog}

ClickHouse コンテナに接続します：

```bash
docker exec -it lakekeeper-clickhouse clickhouse-client
```

次に、Lakekeeper カタログへのデータベース接続を作成します：

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://lakekeeper:8181/catalog', 'minio', 'ClickHouse_Minio_P@ssw0rd')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/warehouse-rest', warehouse = 'demo'
```

## ClickHouse を使用した Lakekeeper カタログテーブルのクエリ {#querying-lakekeeper-catalog-tables-using-clickhouse}

接続が設定されたので、Lakekeeper カタログを介してクエリを開始できます。例えば：

```sql
USE demo;

SHOW TABLES;
```

サンプルデータ (タクシーデータセットなど) が含まれている場合は、次のようなテーブルが表示されるはずです：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが表示されない場合、通常は以下を意味します：
1. 環境がまだサンプルテーブルを作成していない
2. Lakekeeper カタログサービスが完全に初期化されていない
3. サンプルデータの読み込みプロセスが完了していない

テーブル作成の進捗を確認するために、Spark のログを確認できます：
```bash
docker-compose logs spark
```
:::

テーブルをクエリするには (利用可能な場合)：

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note バックティックが必要
ClickHouse は複数の名前空間をサポートしていないため、バックティックが必要です。
:::

テーブルの DDL を検査するには：

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
│ ENGINE = Iceberg('http://minio:9002/warehouse-rest/warehouse/default/taxis/', 'minio', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## データレイクから ClickHouse へのデータの読み込み {#loading-data-from-your-data-lake-into-clickhouse}

Lakekeeper カタログから ClickHouse へデータを読み込む必要がある場合は、まずローカルの ClickHouse テーブルを作成します：

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

次に、`INSERT INTO SELECT` を介して Lakekeeper カタログテーブルからデータを読み込みます：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
