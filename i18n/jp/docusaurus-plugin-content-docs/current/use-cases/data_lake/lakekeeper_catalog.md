---
slug: /use-cases/data-lake/lakekeeper-catalog
sidebar_label: 'Lakekeeper カタログ'
title: 'Lakekeeper カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と Lakekeeper カタログを使用してデータをクエリする手順を説明します。'
keywords: ['Lakekeeper', 'REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Lakekeeper カタログとの統合は Iceberg テーブルにのみ対応しています。
この統合は AWS S3 およびその他のクラウドストレージプロバイダーの両方をサポートします。
:::

ClickHouse は複数のカタログ（Unity、Glue、REST、Polaris など）との統合をサポートしています。このガイドでは、ClickHouse と [Lakekeeper](https://docs.lakekeeper.io/) カタログを使用してデータをクエリするための手順を説明します。

Lakekeeper は Apache Iceberg 向けのオープンソース REST カタログ実装で、次の機能を提供します：

* 高いパフォーマンスと信頼性を実現する **Rust ネイティブ** 実装
* Iceberg REST カタログ仕様に準拠した **REST API**
* S3 互換ストレージとの **クラウドストレージ** 統合

:::note
この機能は実験的な機能であるため、次の設定を有効にする必要があります：
`SET allow_experimental_database_iceberg = 1;`
:::


## ローカル開発環境のセットアップ

ローカルでの開発およびテストには、コンテナ化された Lakekeeper 環境を使用できます。この方法は、学習、プロトタイピング、および開発環境に最適です。

### 前提条件

1. **Docker と Docker Compose**: Docker がインストールされ、起動していることを確認します。
2. **サンプル構成**: Lakekeeper の docker-compose セットアップを利用できます。

### ローカル Lakekeeper カタログのセットアップ

公式の [Lakekeeper docker-compose setup](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal) を使用できます。これは、Lakekeeper、PostgreSQL メタデータバックエンド、およびオブジェクトストレージ用の MinIO を備えた完全な環境を提供します。

**手順 1:** サンプルを実行するための新しいフォルダを作成し、その中に以下の設定内容で `docker-compose.yml` ファイルを作成します。

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
```


db:
image: bitnami/postgresql:16.3.0
environment:

* POSTGRESQL&#95;USERNAME=postgres
* POSTGRESQL&#95;PASSWORD=postgres
* POSTGRESQL&#95;DATABASE=postgres
  healthcheck:
  test: [&quot;CMD-SHELL&quot;, &quot;pg&#95;isready -U postgres -p 5432 -d postgres&quot;]
  interval: 2s
  timeout: 10s
  retries: 5
  start&#95;period: 10s
  volumes:
* postgres&#95;data:/bitnami/postgresql
  networks:
* iceberg&#95;net

minio:
image: bitnami/minio:2025.4.22
environment:

* MINIO&#95;ROOT&#95;USER=minio
* MINIO&#95;ROOT&#95;PASSWORD=ClickHouse&#95;Minio&#95;P@ssw0rd
* MINIO&#95;API&#95;PORT&#95;NUMBER=9000
* MINIO&#95;CONSOLE&#95;PORT&#95;NUMBER=9001
* MINIO&#95;SCHEME=http
* MINIO&#95;DEFAULT&#95;BUCKETS=warehouse-rest
  networks:
  iceberg&#95;net:
  aliases:
  * warehouse-rest.minio
    ports:
* &quot;9002:9000&quot;
* &quot;9003:9001&quot;
  healthcheck:
  test: [&quot;CMD&quot;, &quot;mc&quot;, &quot;ls&quot;, &quot;local&quot;, &quot;|&quot;, &quot;grep&quot;, &quot;warehouse-rest&quot;]
  interval: 2s
  timeout: 10s
  retries: 3
  start&#95;period: 15s
  volumes:
* minio&#95;data:/bitnami/minio/data

clickhouse:
image: clickhouse/clickhouse-server:head
container&#95;name: lakekeeper-clickhouse
user: &#39;0:0&#39;  # root 権限を確保します
ports:

* &quot;8123:8123&quot;
* &quot;9000:9000&quot;
  volumes:
* clickhouse&#95;data:/var/lib/clickhouse
* ./clickhouse/data&#95;import:/var/lib/clickhouse/data&#95;import  # データセットフォルダをマウントします
  networks:
* iceberg&#95;net
  environment:
* CLICKHOUSE&#95;DB=default
* CLICKHOUSE&#95;USER=default
* CLICKHOUSE&#95;DO&#95;NOT&#95;CHOWN=1
* CLICKHOUSE&#95;PASSWORD=
  depends&#95;on:
  lakekeeper:
  condition: service&#95;healthy
  minio:
  condition: service&#95;healthy

volumes:
postgres&#95;data:
minio&#95;data:
clickhouse&#95;data:

networks:
iceberg&#95;net:
driver: bridge

````

**ステップ2:** 次のコマンドを実行してサービスを起動します:

```bash
docker compose up -d
````

**ステップ 3:** すべてのサービスが起動して準備完了になるまで待ちます。ログを確認できます:

```bash
docker-compose logs -f
```

:::note
Lakekeeper のセットアップでは、最初に Iceberg テーブルにサンプルデータをロードしておく必要があります。ClickHouse からクエリを実行する前に、環境でテーブルが作成され、データが投入済みであることを確認してください。テーブルの有無は、利用している特定の docker-compose 構成とサンプルデータのロード用スクリプトに依存します。
:::

### ローカル Lakekeeper カタログへの接続

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


## ClickHouse からの Lakekeeper カタログテーブルのクエリ実行

これで接続が確立されたので、Lakekeeper カタログ経由でクエリを実行できるようになりました。例えば、次のように実行します。

```sql
USE demo;

SHOW TABLES;
```

セットアップにサンプルデータ（例: taxi データセット）が含まれている場合、次のようなテーブルが表示されます。

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが表示されない場合、通常は次のいずれかが原因です。

1. 環境がまだサンプルテーブルを作成していない
2. Lakekeeper カタログサービスが完全に初期化されていない
3. サンプルデータのロード処理が完了していない

Spark のログを確認すると、テーブル作成の進行状況を把握できます。

```bash
docker-compose logs spark
```

:::

テーブルに対してクエリを実行するには（利用可能な場合）:

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note バッククォートが必須
ClickHouse は複数のネームスペースをサポートしていないため、バッククォートが必須です。
:::

テーブルの DDL を確認するには：

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


## Data Lake から ClickHouse へのデータ読み込み

Lakekeeper カタログから ClickHouse にデータを読み込む必要がある場合は、まずローカルの ClickHouse テーブルを作成します。

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

次に、`INSERT INTO SELECT` を使用して Lakekeeper のカタログテーブルからデータを読み込みます：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
