---
slug: /use-cases/data-lake/lakekeeper-catalog
sidebar_label: 'Lakekeeper カタログ'
title: 'Lakekeeper カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と Lakekeeper Catalog を使用してデータを照会する手順を説明します。'
keywords: ['Lakekeeper', 'REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Lakekeeper Catalog との統合は、Iceberg テーブルでのみ利用できます。
この統合は AWS S3 およびその他のクラウドストレージプロバイダーの両方をサポートします。
:::

ClickHouse は、複数のカタログ (Unity、Glue、REST、Polaris など) との統合をサポートしています。本ガイドでは、ClickHouse と [Lakekeeper](https://docs.lakekeeper.io/) カタログを使用してデータにクエリを実行する手順を説明します。

Lakekeeper は Apache Iceberg 向けのオープンソース REST カタログ実装で、次の機能を提供します。

* 高いパフォーマンスと信頼性を備えた **Rust ネイティブ** 実装
* Iceberg REST カタログ仕様に準拠した **REST API**
* S3 互換ストレージと連携する **クラウドストレージ** 統合

:::note
この機能は実験的機能のため、次の設定で有効化する必要があります。
`SET allow_experimental_database_iceberg = 1;`
:::

## ローカル開発環境のセットアップ \{#local-development-setup\}

ローカルでの開発やテストには、Lakekeeper のコンテナ化環境を使用できます。この方法は、学習、プロトタイピング、および開発環境に最適です。

### 前提条件 \{#local-prerequisites\}

1. **Docker と Docker Compose**: Docker がインストールされ、起動していることを確認する
2. **サンプルセットアップ**: Lakekeeper の docker-compose セットアップを利用できる

### ローカル Lakekeeper カタログのセットアップ \{#setting-up-local-lakekeeper-catalog\}

公式の [Lakekeeper の docker-compose セットアップ](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal) を使用できます。これは、Lakekeeper、PostgreSQL メタデータバックエンド、オブジェクトストレージ用の MinIO を含む完全な環境を提供します。

**ステップ 1:** サンプルを実行するための新しいフォルダーを作成し、次に以下の設定で `docker-compose.yml` ファイルを作成します。

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

**ステップ 2：** 次のコマンドを実行してサービスを起動します。

```bash
docker compose up -d
```

**ステップ 3：** すべてのサービスが準備完了になるまで待ちます。ログを確認できます：

```bash
docker-compose logs -f
```

:::note
Lakekeeper のセットアップでは、まずサンプルデータを Iceberg テーブルにロードしておく必要があります。ClickHouse を通じてクエリを実行する前に、環境でテーブルが作成され、データが投入されていることを必ず確認してください。テーブルが利用可能かどうかは、使用している特定の docker-compose セットアップやサンプルデータ読み込み用スクリプトに依存します。
:::

### ローカルの Lakekeeper カタログへの接続 \{#connecting-to-local-lakekeeper-catalog\}

ClickHouse コンテナに接続します。

```bash
docker exec -it lakekeeper-clickhouse clickhouse-client
```

次に、Lakekeeper カタログ用のデータベース接続を作成します。

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://lakekeeper:8181/catalog', 'minio', 'ClickHouse_Minio_P@ssw0rd')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/warehouse-rest', warehouse = 'demo'
```

## ClickHouse を使用して Lakekeeper カタログテーブルをクエリする \{#querying-lakekeeper-catalog-tables-using-clickhouse\}

接続が確立したので、Lakekeeper カタログ経由でクエリを実行できます。例えば次のとおりです。

```sql
USE demo;

SHOW TABLES;
```

セットアップにサンプルデータ（タクシーのデータセットなど）が含まれている場合は、次のようなテーブルが表示されます。

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが表示されない場合、通常は次のいずれかが原因です:

1. 環境でサンプルテーブルがまだ作成されていない
2. Lakekeeper カタログサービスが完全に初期化されていない
3. サンプルデータの読み込み処理が完了していない

テーブル作成の進捗状況は Spark のログで確認できます:

```bash
docker-compose logs spark
```

:::

テーブル（存在する場合）をクエリするには:

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note バッククォートが必要
ClickHouse は複数のネームスペースをサポートしていないため、バッククォートが必要です。
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
│ ENGINE = Iceberg('http://minio:9002/warehouse-rest/warehouse/default/taxis/', 'minio', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## データレイクから ClickHouse へのデータ取り込み \{#loading-data-from-your-data-lake-into-clickhouse\}

Lakekeeper カタログのデータを ClickHouse に取り込む必要がある場合は、まずローカルの ClickHouse テーブルを作成します。

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

次に、`INSERT INTO SELECT` を使用して Lakekeeper のカタログテーブルからデータをロードします。

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
