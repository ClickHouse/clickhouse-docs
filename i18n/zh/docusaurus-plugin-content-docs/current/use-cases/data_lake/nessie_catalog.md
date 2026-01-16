---
slug: /use-cases/data-lake/nessie-catalog
sidebar_label: 'Nessie 目录'
title: 'Nessie 目录'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将分步骤介绍如何使用 ClickHouse 和 Nessie Catalog
 来查询您的数据。'
keywords: ['Nessie', 'REST', '事务型', '数据湖', 'Iceberg', '类似 Git']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
与 Nessie Catalog 的集成仅适用于 Iceberg 表。
此集成支持 AWS S3 以及其他云存储服务提供商。
:::

ClickHouse 支持与多个 catalog 集成（Unity、Glue、REST、Polaris 等）。本指南将引导您完成使用 ClickHouse 和 [Nessie](https://projectnessie.org/) catalog 查询数据的步骤。

Nessie 是一个面向数据湖的开源事务型 catalog，提供：

* **类 Git 风格的** 分支与提交式数据版本控制
* **跨表事务** 与可见性保证
* **REST API**，符合 Iceberg REST catalog 规范
* **开放数据湖** 方案，支持 Hive、Spark、Dremio、Trino 等
* 可在 Docker 或 Kubernetes 上进行 **生产就绪** 的部署

:::note
由于该功能目前为实验特性，您需要通过以下命令启用：
`SET allow_experimental_database_iceberg = 1;`
:::

## 本地开发环境设置 \\{#local-development-setup\\}

在进行本地开发和测试时，你可以使用容器化的 Nessie 环境。此方式非常适合用于学习、原型验证以及开发环境。

### 前提条件 \\{#local-prerequisites\\}

1. **Docker 和 Docker Compose**：确保已安装 Docker 并已启动运行
2. **示例环境**：可以使用官方提供的 Nessie docker-compose 配置

### 设置本地 Nessie Catalog \\{#setting-up-local-nessie-catalog\\}

你可以使用官方提供的 [Nessie docker-compose 部署](https://projectnessie.org/guides/setting-up/)，它提供了一个完整的环境，包括 Nessie、内存版本存储（in-memory version store）以及用于对象存储的 MinIO。

**步骤 1：** 创建一个新文件夹用于运行该示例，然后创建一个名为 `docker-compose.yml` 的文件，并填入以下配置：

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

**步骤 2：** 运行以下命令启动服务：

```bash
docker compose up -d
```

**步骤 3：** 等待所有服务就绪。您可以通过查看日志进行检查：

```bash
docker-compose logs -f
```

:::note
Nessie 设置使用基于内存的版本存储，并要求先将示例数据加载到 Iceberg 表中。请确保在通过 ClickHouse 查询这些表之前，环境中已经创建并填充好这些表。
:::

### 连接到本地 Nessie Catalog \\{#connecting-to-local-nessie-catalog\\}

连接到 ClickHouse 容器：

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

然后创建与 Nessie 目录的数据库连接：

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://nessie:19120/iceberg', 'admin', 'password')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/my-bucket', warehouse = 'warehouse'
```

## 使用 ClickHouse 查询 Nessie 目录表 \\{#querying-nessie-catalog-tables-using-clickhouse\\}

现在连接已就绪，您可以开始通过 Nessie 目录执行查询。例如：

```sql
USE demo;

SHOW TABLES;
```

如果你的环境包含示例数据（例如 taxi 数据集），应该能看到如下所示的表：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
如果没有看到任何数据表，通常意味着：

1. 环境尚未创建示例表
2. Nessie 目录服务尚未完全初始化
3. 示例数据加载流程尚未完成

可以查看 Nessie 日志以了解目录的活动情况：

```bash
docker-compose logs nessie
```

:::

要查询某个表（如果已存在）：

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note Backticks required
需要使用反引号，因为 ClickHouse 仅支持单一命名空间。
:::

要检查该表的 DDL：

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

## 将数据湖中的数据加载到 ClickHouse \\{#loading-data-from-your-data-lake-into-clickhouse\\}

如果需要将 Nessie 目录中的数据加载到 ClickHouse，请首先创建一个本地 ClickHouse 表：

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

然后通过 `INSERT INTO ... SELECT` 语句从 Nessie 目录表中加载数据：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
