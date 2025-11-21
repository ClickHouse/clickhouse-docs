---
slug: /use-cases/data-lake/nessie-catalog
sidebar_label: 'Nessie カタログ'
title: 'Nessie カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と Nessie カタログを使用してデータにクエリを実行する手順を説明します。'
keywords: ['Nessie', 'REST', 'トランザクショナル', 'データレイク', 'Iceberg', 'Git ライク']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Nessie Catalog との統合は、Iceberg テーブルでのみ利用できます。
この統合機能は、AWS S3 およびその他のクラウドストレージプロバイダーの両方をサポートします。
:::

ClickHouse は複数のカタログ (Unity、Glue、REST、Polaris など) との統合をサポートしています。このガイドでは、ClickHouse と [Nessie](https://projectnessie.org/) カタログを使用してデータをクエリする手順を説明します。

Nessie はデータレイク向けのオープンソースのトランザクションカタログで、次の機能を提供します。

* ブランチとコミットによる **Git 風** のデータバージョン管理
* **テーブル間トランザクション** と可視性に関する保証
* Iceberg REST カタログ仕様に準拠した **REST API**
* Hive、Spark、Dremio、Trino などをサポートする **オープンデータレイク** アプローチ
* Docker または Kubernetes 上での **本番運用対応の** デプロイ

:::note
この機能は実験的機能であるため、次の設定で有効化する必要があります。
`SET allow_experimental_database_iceberg = 1;`
:::


## ローカル開発環境のセットアップ {#local-development-setup}

ローカル開発およびテストには、コンテナ化されたNessieセットアップを使用できます。このアプローチは、学習、プロトタイピング、開発環境に最適です。

### 前提条件 {#local-prerequisites}

1. **DockerおよびDocker Compose**: Dockerがインストールされ、実行されていることを確認してください
2. **サンプルセットアップ**: 公式のNessie docker-composeセットアップを使用できます

### ローカルNessieカタログのセットアップ {#setting-up-local-nessie-catalog}

公式の[Nessie docker-composeセットアップ](https://projectnessie.org/guides/setting-up/)を使用できます。これは、Nessie、インメモリバージョンストア、およびオブジェクトストレージ用のMinIOを含む完全な環境を提供します。

**ステップ1:** サンプルを実行するための新しいフォルダを作成し、以下の設定で`docker-compose.yml`ファイルを作成します:

```yaml
version: "3.8"

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
    user: "0:0" # Ensures root permissions
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import # Mount dataset folder
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

**ステップ2:** 以下のコマンドを実行してサービスを起動します:

```bash
docker compose up -d
```

**ステップ3:** すべてのサービスが準備完了になるまで待機します。ログを確認できます:

```bash
docker-compose logs -f
```

:::note
Nessieセットアップはインメモリバージョンストアを使用するため、最初にサンプルデータをIcebergテーブルにロードする必要があります。ClickHouseを通じてクエリを実行する前に、環境がテーブルを作成し、データを投入済みであることを確認してください。
:::

### ローカルNessieカタログへの接続 {#connecting-to-local-nessie-catalog}

ClickHouseコンテナに接続します:

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

次に、Nessieカタログへのデータベース接続を作成します:

```sql
SET allow_experimental_database_iceberg = 1;

```


CREATE DATABASE demo
ENGINE = DataLakeCatalog(&#39;[http://nessie:19120/iceberg](http://nessie:19120/iceberg)&#39;, &#39;admin&#39;, &#39;password&#39;)
SETTINGS catalog&#95;type = &#39;rest&#39;, storage&#95;endpoint = &#39;[http://minio:9002/my-bucket](http://minio:9002/my-bucket)&#39;, warehouse = &#39;warehouse&#39;

```
```


## ClickHouseを使用したNessieカタログテーブルのクエリ {#querying-nessie-catalog-tables-using-clickhouse}

接続が確立されたので、Nessieカタログを介したクエリを開始できます。例:

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

1. 環境がまだサンプルテーブルを作成していない
2. Nessieカタログサービスが完全に初期化されていない
3. サンプルデータの読み込みプロセスが完了していない

Nessieログを確認してカタログのアクティビティを確認できます:

```bash
docker-compose logs nessie
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
│ ENGINE = Iceberg('http://localhost:9002/my-bucket/default/taxis/', 'admin', '[HIDDEN]')      │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## Data LakeからClickHouseへのデータロード {#loading-data-from-your-data-lake-into-clickhouse}

NessieカタログからClickHouseにデータをロードする場合は、まずローカルのClickHouseテーブルを作成します:

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

次に、`INSERT INTO SELECT`を使用してNessieカタログテーブルからデータをロードします:

```sql
INSERT INTO taxis
SELECT * FROM demo.`default.taxis`;
```
