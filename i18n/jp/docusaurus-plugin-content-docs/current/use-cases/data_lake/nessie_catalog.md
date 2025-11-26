---
slug: /use-cases/data-lake/nessie-catalog
sidebar_label: 'Nessie カタログ'
title: 'Nessie カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と Nessie カタログを使用してデータをクエリする手順を説明します。'
keywords: ['Nessie', 'REST', 'トランザクション', 'データレイク', 'Iceberg', 'Git 風']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Nessie Catalog との統合は Iceberg テーブルに対してのみ動作します。
この統合は AWS S3 とその他のクラウドストレージプロバイダの両方をサポートします。
:::

ClickHouse は複数のカタログ (Unity、Glue、REST、Polaris など) との統合をサポートしています。このガイドでは、ClickHouse と [Nessie](https://projectnessie.org/) カタログを使用してデータをクエリする手順を説明します。

Nessie は、次の機能を備えたデータレイク向けのオープンソースのトランザクションカタログです。

* ブランチとコミットによる **Git 風の** データバージョン管理
* **テーブル間トランザクション** と可視性に関する保証
* Iceberg REST カタログ仕様に準拠した **REST API**
* Hive、Spark、Dremio、Trino などをサポートする **オープンデータレイク** アプローチ
* Docker または Kubernetes 上での **本番運用可能な** デプロイメント

:::note
この機能は実験的機能であるため、次を使用して有効化する必要があります:
`SET allow_experimental_database_iceberg = 1;`
:::


## ローカル開発環境のセットアップ {#local-development-setup}

ローカル開発およびテストには、コンテナ化された Nessie セットアップを利用できます。このアプローチは、学習、プロトタイピング、開発用途に最適です。

### 前提条件 {#local-prerequisites}

1. **Docker と Docker Compose**: Docker がインストールされ、起動していることを確認します
2. **サンプルセットアップ**: Nessie の公式 docker-compose セットアップを利用できます

### ローカルでの Nessie カタログのセットアップ

公式の [Nessie docker-compose セットアップ](https://projectnessie.org/guides/setting-up/) を使用できます。これは、Nessie、インメモリのバージョンストア、およびオブジェクトストレージ用の MinIO を含む完全な環境を提供します。

**ステップ 1:** サンプルを実行するための新しいフォルダを作成し、その中に以下の設定で `docker-compose.yml` ファイルを作成します。

```yaml
version: '3.8'

services:
  nessie:
    image: ghcr.io/projectnessie/nessie:latest
    ports:
      - "19120:19120"
    environment:
      - nessie.version.store.type=IN_MEMORY
      - nessie.catalog.default-warehouse=warehouse
      - nessie.catalog.warehouses.warehouse.location=s3://my-bucket/
      - nessie.catalog.service.s3.default-options.endpoint=http://minio:9000/
      - nessie.catalog.service.s3.default-options.access-key=urn:nessie-secret:quarkus:nessie.catalog.secrets.access-key
      - nessie.catalog.service.s3.default-options.path-style-access=true
      - nessie.catalog.service.s3.default-options.auth-type=STATIC
      - nessie.catalog.secrets.access-key.name=admin
      - nessie.catalog.secrets.access-key.secret=password
      - nessie.catalog.service.s3.default-options.region=us-east-1
      - nessie.server.authentication.enabled=false
    depends_on:
      minio:
        condition: service_healthy
    networks:
      - iceberg_net

  minio:
    image: quay.io/minio/minio
    ports:
      - "9002:9000"
      - "9003:9001"
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=password
      - MINIO_REGION=us-east-1
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 10s
      retries: 5
      start_period: 30s
    entrypoint: >
      /bin/sh -c "
      minio server /data --console-address ':9001' &
      sleep 10;
      mc alias set myminio http://localhost:9000 admin password;
      mc mb myminio/my-bucket --ignore-existing;
      tail -f /dev/null"
    networks:
      - iceberg_net

  clickhouse:
    image: clickhouse/clickhouse-server:head
    container_name: nessie-clickhouse
    user: '0:0'  # root権限を確保
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # データセットフォルダーをマウント
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
    depends_on:
      nessie:
        condition: service_started
      minio:
        condition: service_healthy

volumes:
  clickhouse_data:

networks:
  iceberg_net:
    driver: bridge
```

**ステップ 2：** 次のコマンドを実行してサービスを起動します：

```bash
docker compose up -d
```

**ステップ 3：** すべてのサービスが起動完了するまで待ちます。ログを確認できます：

```bash
docker-compose logs -f
```

:::note
Nessie のセットアップではインメモリのバージョンストアを使用し、最初にサンプルデータを Iceberg テーブルにロードしておく必要があります。ClickHouse からクエリを実行する前に、その環境でテーブルが作成され、データが投入されていることを必ず確認してください。
:::


### ローカル Nessie カタログへの接続

ClickHouse コンテナに接続します。

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

次に、Nessie カタログへのデータベース接続を作成します。

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://nessie:19120/iceberg', 'admin', 'password')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/my-bucket', warehouse = 'warehouse'
```


## ClickHouse を使用した Nessie カタログテーブルのクエリ実行

接続が確立できたので、Nessie カタログ経由でクエリを実行し始めることができます。たとえば次のとおりです。

```sql
USE demo;

SHOW TABLES;
```

セットアップにサンプルデータ（タクシーデータセットなど）が含まれている場合、次のようなテーブルが表示されるはずです：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが一つも表示されない場合、通常は次のいずれかが原因です。

1. 環境でサンプルテーブルがまだ作成されていない
2. Nessieカタログサービスが完全に初期化されていない
3. サンプルデータのロード処理が完了していない

Nessie のログを確認して、カタログの動作状況を確認できます。

```bash
docker-compose logs nessie
```

:::

（利用可能な場合）テーブルにクエリを実行するには:

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note バッククォートが必要
ClickHouse は複数のネームスペースをサポートしていないので、バッククォートが必要です。
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
│ ENGINE = Iceberg('http://localhost:9002/my-bucket/default/taxis/', 'admin', '[HIDDEN]')      │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## データレイクから ClickHouse へのデータ読み込み

Nessie カタログから ClickHouse にデータをロードする必要がある場合は、まずローカルの ClickHouse テーブルを作成することから始めます。

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

次に、`INSERT INTO SELECT` を使用して Nessie カタログのテーブルからデータを読み込みます。

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
