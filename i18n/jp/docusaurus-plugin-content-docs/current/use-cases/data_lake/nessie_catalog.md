---
slug: /use-cases/data-lake/nessie-catalog
sidebar_label: 'Nessie カタログ'
title: 'Nessie カタログ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse と Nessie カタログを使用して
 データに対してクエリを実行する手順を説明します。'
keywords: ['Nessie', 'REST', 'トランザクショナル', 'データレイク', 'Iceberg', 'Git 風']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Nessie Catalog との連携は Iceberg テーブルに対してのみ動作します。
この連携機能は AWS S3 およびその他のクラウドストレージプロバイダーの両方をサポートします。
:::

ClickHouse は複数のカタログ（Unity、Glue、REST、Polaris など）との連携をサポートしています。このガイドでは、ClickHouse と [Nessie](https://projectnessie.org/) カタログを使用してデータをクエリする手順を説明します。

Nessie はデータレイク向けのオープンソースのトランザクションカタログで、次の機能を提供します。

* ブランチとコミットによる **Git に着想を得た** データバージョン管理
* **テーブル間トランザクション** と可視性の保証
* Iceberg REST カタログ仕様に準拠した **REST API** 準拠
* Hive、Spark、Dremio、Trino などをサポートする **オープンデータレイク** アプローチ
* Docker または Kubernetes 上での **本番運用対応の** デプロイメント

:::note
この機能は実験的な機能のため、次の設定で有効化する必要があります。
`SET allow_experimental_database_iceberg = 1;`
:::


## ローカル開発環境のセットアップ

ローカルでの開発およびテストには、コンテナ化された Nessie 環境を使用できます。この方法は、学習、プロトタイピング、および開発環境に最適です。

### 前提条件

1. **Docker と Docker Compose**: Docker がインストールされ、起動していることを確認する
2. **サンプルセットアップ**: 公式の Nessie の docker-compose セットアップを使用できます

### ローカル Nessie Catalog のセットアップ

Nessie、インメモリ版のバージョンストア、およびオブジェクトストレージ用の MinIO を含む完全な環境を提供する、公式の [Nessie docker-compose セットアップ](https://projectnessie.org/guides/setting-up/) を使用できます。

**ステップ 1:** 例を実行するための新しいディレクトリを作成し、その中に次の構成を含む `docker-compose.yml` ファイルを作成します:

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

**ステップ 2：** サービスを起動するには、次のコマンドを実行します。

```bash
docker compose up -d
```

**ステップ 3:** すべてのサービスの起動が完了するまで待ちます。ログを確認できます：

```bash
docker-compose logs -f
```

:::note
Nessie のセットアップではインメモリのバージョンストアを使用しており、事前にサンプルデータを Iceberg テーブルにロードしておく必要があります。ClickHouse 経由でクエリを実行する前に、環境でテーブルが作成され、データが投入されていることを確認してください。
:::

### ローカル Nessie カタログへの接続

ClickHouse コンテナに接続します:

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

次に、Nessie カタログへのデータベース接続を作成します。

```sql
SET allow_experimental_database_iceberg = 1;
```


CREATE DATABASE demo
ENGINE = DataLakeCatalog(&#39;[http://nessie:19120/iceberg](http://nessie:19120/iceberg)&#39;, &#39;admin&#39;, &#39;password&#39;)
SETTINGS catalog&#95;type = &#39;rest&#39;, storage&#95;endpoint = &#39;[http://minio:9002/my-bucket](http://minio:9002/my-bucket)&#39;, warehouse = &#39;warehouse&#39;

```
```


## ClickHouse から Nessie カタログテーブルをクエリする

接続が確立できたので、Nessie カタログ経由でクエリを実行できるようになりました。たとえば、次のように実行します。

```sql
USE demo;

SHOW TABLES;
```

セットアップにサンプルデータ（タクシーのデータセットなど）が含まれている場合、次のようなテーブルが表示されます：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが表示されない場合、通常は次のいずれかが原因です：

1. 環境でサンプルテーブルがまだ作成されていない
2. Nessie カタログサービスが完全に初期化されていない
3. サンプルデータのロード処理が完了していない

カタログの動作状況を確認するには、Nessie のログを参照してください：

```bash
docker-compose logs nessie
```

:::

テーブル（存在する場合）に対してクエリを実行するには:

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

Nessie カタログから ClickHouse へデータを読み込む必要がある場合は、まずローカルの ClickHouse テーブルを作成します。

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

次に、`INSERT INTO SELECT` 文を使用して、Nessie カタログのテーブルからデータをロードします。

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
