---
'slug': '/use-cases/data-lake/nessie-catalog'
'sidebar_label': 'Nessie カタログ'
'title': 'Nessie カタログ'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、ClickHouse を使用してデータをクエリする手順を説明します。Nessie カタログ。'
'keywords':
- 'Nessie'
- 'REST'
- 'Transactional'
- 'Data Lake'
- 'Iceberg'
- 'Git-like'
'show_related_blogs': true
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
Nessie カタログとの統合は Iceberg テーブルのみに対応しています。
この統合は AWS S3 と他のクラウドストレージプロバイダーの両方をサポートしています。
:::

ClickHouse は複数のカタログ（Unity、Glue、REST、Polaris など）との統合をサポートしています。このガイドでは、ClickHouse と [Nessie](https://projectnessie.org/) カタログを使用してデータをクエリする手順を説明します。

Nessie はデータレイク向けのオープンソーストランザクショナルカタログで、以下の機能を提供します：
- **Gitにインスパイアされた** データバージョン管理機能（ブランチとコミット）
- **クロステーブルトランザクション** 及び可視性保証
- **REST API** Iceberg REST カタログ仕様への準拠
- **オープンデータレイク** アプローチ（Hive、Spark、Dremio、Trino などをサポート）
- **本番環境で使用可能な** Docker または Kubernetes でのデプロイ

:::note
この機能は実験的であるため、以下のように有効にする必要があります：
`SET allow_experimental_database_iceberg = 1;`
:::

## ローカル開発セットアップ {#local-development-setup}

ローカル開発およびテスト用に、コンテナ化された Nessieセットアップを使用できます。このアプローチは、学習、プロトタイピング、および開発環境に理想的です。

### 前提条件 {#local-prerequisites}

1. **Docker および Docker Compose**：Docker がインストールされていて、実行中であることを確認してください
2. **サンプルセットアップ**：公式の Nessie docker-compose セットアップを使用できます

### ローカル Nessie カタログのセットアップ {#setting-up-local-nessie-catalog}

公式の [Nessie docker-compose セットアップ](https://projectnessie.org/guides/setting-up/) を使用すると、Nessie、インメモリバージョンストア、オブジェクトストレージ用の MinIO を含む完全な環境を提供します。

**ステップ 1：** 例を実行するための新しいフォルダーを作成し、次の構成のファイル `docker-compose.yml` を作成します：

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

**ステップ 2：** サービスを開始するために、以下のコマンドを実行します：

```bash
docker compose up -d
```

**ステップ 3：** すべてのサービスが利用可能になるまで待ちます。ログを確認することができます：

```bash
docker-compose logs -f
```

:::note
Nessie セットアップはインメモリバージョンストアを使用しており、最初に Iceberg テーブルにサンプルデータがロードされる必要があります。ClickHouse を介してクエリを実行する前に、環境がテーブルを作成し、データを格納していることを確認してください。
:::

### ローカル Nessie カタログへの接続 {#connecting-to-local-nessie-catalog}

ClickHouse コンテナに接続します：

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

次に、Nessie カタログへのデータベース接続を作成します：

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://nessie:19120/iceberg', 'admin', 'password')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/my-bucket', warehouse = 'warehouse'
```

## ClickHouse を使用した Nessie カタログテーブルのクエリ {#querying-nessie-catalog-tables-using-clickhouse}

接続ができたので、Nessie カタログを通じてクエリを開始できます。例えば：

```sql
USE demo;

SHOW TABLES;
```

サンプルデータ（タクシーデータセットなど）が含まれている場合、以下のようなテーブルが表示されるはずです：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
テーブルが表示されない場合、通常、次のことを意味します：
1. 環境がサンプルテーブルをまだ作成していない
2. Nessie カタログサービスが完全に初期化されていない
3. サンプルデータのロードプロセスが完了していない

Nessie のログを確認してカタログのアクティビティを確認できます：
```bash
docker-compose logs nessie
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

:::note バックティック必須
ClickHouse は 1 つのネームスペースしかサポートしていないため、バックティックが必要です。
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

## データレイクから ClickHouse へのデータのロード {#loading-data-from-your-data-lake-into-clickhouse}

Nessie カタログから ClickHouse にデータをロードする必要がある場合、ローカル ClickHouse テーブルを作成することから始めます：

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

次に、`INSERT INTO SELECT` を介して Nessie カタログテーブルからデータをロードします：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
