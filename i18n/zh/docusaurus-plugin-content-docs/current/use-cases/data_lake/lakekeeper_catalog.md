---
slug: /use-cases/data-lake/lakekeeper-catalog
sidebar_label: 'Lakekeeper 目录'
title: 'Lakekeeper 目录'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将逐步介绍如何使用 ClickHouse 和 Lakekeeper 目录来查询您的数据。'
keywords: ['Lakekeeper', 'REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
与 Lakekeeper 目录的集成当前仅适用于 Iceberg 表。
该集成支持 AWS S3 及其他云存储提供商。
:::

ClickHouse 支持与多个目录服务集成（Unity、Glue、REST、Polaris 等）。本指南将引导您完成使用 ClickHouse 和 [Lakekeeper](https://docs.lakekeeper.io/) 目录查询数据的步骤。

Lakekeeper 是一个开源的 Apache Iceberg REST 目录实现，提供：

* **Rust 原生** 实现，以获得高性能和高可靠性
* **REST API**，符合 Iceberg REST 目录规范
* **云存储** 集成，支持对接兼容 S3 的存储

:::note
由于该功能目前为实验特性，您需要通过以下方式启用它：
`SET allow_experimental_database_iceberg = 1;`
:::


## 本地开发环境设置 {#local-development-setup}

对于本地开发和测试,您可以使用容器化的 Lakekeeper 设置。此方法非常适合学习、原型设计和开发环境。

### 前置条件 {#local-prerequisites}

1. **Docker 和 Docker Compose**:确保已安装 Docker 并正在运行
2. **示例设置**:您可以使用 Lakekeeper docker-compose 设置

### 设置本地 Lakekeeper 目录 {#setting-up-local-lakekeeper-catalog}

您可以使用官方的 [Lakekeeper docker-compose 设置](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal),它提供了一个完整的环境,包含 Lakekeeper、PostgreSQL 元数据后端以及用于对象存储的 MinIO。

**步骤 1:** 创建一个新文件夹用于运行示例,然后创建一个包含以下配置的 `docker-compose.yml` 文件:

```yaml
version: "3.8"

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
environment: - POSTGRESQL_USERNAME=postgres - POSTGRESQL_PASSWORD=postgres - POSTGRESQL_DATABASE=postgres
healthcheck:
test: ["CMD-SHELL", "pg_isready -U postgres -p 5432 -d postgres"]
interval: 2s
timeout: 10s
retries: 5
start_period: 10s
volumes: - postgres_data:/bitnami/postgresql
networks: - iceberg_net

minio:
image: bitnami/minio:2025.4.22
environment: - MINIO_ROOT_USER=minio - MINIO_ROOT_PASSWORD=ClickHouse_Minio_P@ssw0rd - MINIO_API_PORT_NUMBER=9000 - MINIO_CONSOLE_PORT_NUMBER=9001 - MINIO_SCHEME=http - MINIO_DEFAULT_BUCKETS=warehouse-rest
networks:
iceberg_net:
aliases: - warehouse-rest.minio
ports: - "9002:9000" - "9003:9001"
healthcheck:
test: ["CMD", "mc", "ls", "local", "|", "grep", "warehouse-rest"]
interval: 2s
timeout: 10s
retries: 3
start_period: 15s
volumes: - minio_data:/bitnami/minio/data

clickhouse:
image: clickhouse/clickhouse-server:head
container_name: lakekeeper-clickhouse
user: '0:0' # Ensures root permissions
ports: - "8123:8123" - "9000:9000"
volumes: - clickhouse_data:/var/lib/clickhouse - ./clickhouse/data_import:/var/lib/clickhouse/data_import # Mount dataset folder
networks: - iceberg_net
environment: - CLICKHOUSE_DB=default - CLICKHOUSE_USER=default - CLICKHOUSE_DO_NOT_CHOWN=1 - CLICKHOUSE_PASSWORD=
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

````

**步骤 2:** 运行以下命令启动服务:

```bash
docker compose up -d
````

**步骤 3:** 等待所有服务就绪。可以通过以下命令查看日志:

```bash
docker-compose logs -f
```

:::note
Lakekeeper 的设置要求首先将示例数据加载到 Iceberg 表中。在尝试通过 ClickHouse 查询这些表之前,请确保环境已创建并填充了相应的表。表的可用性取决于具体的 docker-compose 配置和示例数据加载脚本。
:::

### 连接到本地 Lakekeeper Catalog {#connecting-to-local-lakekeeper-catalog}

连接到 ClickHouse 容器:

```bash
docker exec -it lakekeeper-clickhouse clickhouse-client
```

然后创建到 Lakekeeper catalog 的数据库连接:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://lakekeeper:8181/catalog', 'minio', 'ClickHouse_Minio_P@ssw0rd')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/warehouse-rest', warehouse = 'demo'
```


## 使用 ClickHouse 查询 Lakekeeper 目录表 {#querying-lakekeeper-catalog-tables-using-clickhouse}

现在连接已建立,您可以开始通过 Lakekeeper 目录进行查询。例如:

```sql
USE demo;

SHOW TABLES;
```

如果您的设置包含示例数据(例如出租车数据集),您应该会看到如下表:

```sql title="响应"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
如果您没有看到任何表,这通常意味着:

1. 环境尚未创建示例表
2. Lakekeeper 目录服务尚未完全初始化
3. 示例数据加载过程尚未完成

您可以检查 Spark 日志以查看表创建进度:

```bash
docker-compose logs spark
```

:::

查询表(如果可用):

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="响应"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note 需要使用反引号
需要使用反引号,因为 ClickHouse 不支持多个命名空间。
:::

检查表 DDL:

```sql
SHOW CREATE TABLE `default.taxis`;
```

```sql title="响应"
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


## 将数据湖中的数据加载到 ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

如果需要将 Lakekeeper 目录中的数据加载到 ClickHouse,首先需要创建一个本地 ClickHouse 表:

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

然后通过 `INSERT INTO SELECT` 语句从 Lakekeeper 目录表中加载数据:

```sql
INSERT INTO taxis
SELECT * FROM demo.`default.taxis`;
```
