---
slug: /use-cases/data-lake/lakekeeper-catalog
sidebar_label: 'Lakekeeper 目录'
title: 'Lakekeeper 目录'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将演示如何使用 ClickHouse 和 Lakekeeper 目录来查询您的数据。'
keywords: ['Lakekeeper', 'REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
与 Lakekeeper Catalog 的集成目前仅适用于 Iceberg 表。
该集成同时支持 AWS S3 和其他云存储提供商。
:::

ClickHouse 支持与多个 Catalog 集成（Unity、Glue、REST、Polaris 等）。本指南将介绍如何使用 ClickHouse 和 [Lakekeeper](https://docs.lakekeeper.io/) Catalog 来查询你的数据。

Lakekeeper 是一个面向 Apache Iceberg 的开源 REST Catalog 实现，提供：

* **Rust 原生** 实现，具备高性能和高可靠性
* **REST API**，符合 Iceberg REST Catalog 规范
* 与兼容 **S3** 的云存储进行 **云存储集成**

:::note
由于该特性仍处于实验阶段，你需要通过以下设置启用它：
`SET allow_experimental_database_iceberg = 1;`
:::


## 本地开发环境设置

在本地进行开发和测试时，可以使用容器化的 Lakekeeper 环境。此方法非常适合用于学习、原型设计和开发环境。

### 前置条件

1. **Docker 和 Docker Compose**：确保已安装并正在运行 Docker 和 Docker Compose
2. **示例环境**：可以使用 Lakekeeper 的 docker-compose 示例配置

### 本地 Lakekeeper Catalog 设置

你可以使用官方的 [Lakekeeper docker-compose 设置](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal)，它提供了一个完整的环境，包括 Lakekeeper、PostgreSQL 元数据后端，以及用于对象存储的 MinIO。

**步骤 1：** 创建一个用于运行该示例的新文件夹，然后创建一个名为 `docker-compose.yml` 的文件，并写入以下配置：

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
user: &#39;0:0&#39;  # 确保以 root 权限运行
ports:

* &quot;8123:8123&quot;
* &quot;9000:9000&quot;
  volumes:
* clickhouse&#95;data:/var/lib/clickhouse
* ./clickhouse/data&#95;import:/var/lib/clickhouse/data&#95;import  # 挂载数据集文件夹
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

**步骤 2：** 运行以下命令启动服务：

```bash
docker compose up -d
````

**步骤 3：** 等待所有服务就绪。可以通过检查日志进行确认：

```bash
docker-compose logs -f
```

:::note
Lakekeeper 部署要求先将示例数据加载到 Iceberg 表中。请确保在通过 ClickHouse 查询之前，当前环境中已经创建这些表并写入了数据。表是否可用取决于具体的 docker-compose 部署以及示例数据加载脚本。
:::

### 连接到本地 Lakekeeper Catalog

连接到你的 ClickHouse 容器：

```bash
docker exec -it lakekeeper-clickhouse clickhouse-client
```

然后创建指向 Lakekeeper 目录的数据库连接：

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://lakekeeper:8181/catalog', 'minio', 'ClickHouse_Minio_P@ssw0rd')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/warehouse-rest', warehouse = 'demo'
```


## 使用 ClickHouse 查询 Lakekeeper 目录表

现在连接已经就绪，你可以开始通过 Lakekeeper 目录执行查询。例如：

```sql
USE demo;

SHOW TABLES;
```

如果你的配置中包含示例数据（例如 taxi 数据集），你应该会看到类似下面这样的表：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
如果你没有看到任何表，通常意味着：

1. 当前环境尚未创建示例表
2. Lakekeeper 目录服务尚未完全初始化
3. 示例数据加载过程尚未完成

你可以检查 Spark 日志来查看表创建进度：

```bash
docker-compose 日志 spark
```

:::

要查询一张表（如果已存在）：

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note 必须使用反引号
必须使用反引号，因为 ClickHouse 不支持多个命名空间。
:::

要查看该表的 DDL：

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


## 从数据湖向 ClickHouse 加载数据

如果你需要从 Lakekeeper 目录向 ClickHouse 加载数据，请先创建一个本地 ClickHouse 表：

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

然后通过 `INSERT INTO SELECT` 语句从 Lakekeeper 目录表加载数据：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
