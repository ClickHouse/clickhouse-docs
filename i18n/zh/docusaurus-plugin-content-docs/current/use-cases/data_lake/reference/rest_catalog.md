---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'REST 目录'
title: 'REST 目录'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将逐步演示如何使用 ClickHouse 和 REST Catalog 来查询您的数据。'
keywords: ['REST', 'Tabular', '数据湖', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
与 REST Catalog 的集成仅适用于 Iceberg 表。
此集成同时支持 AWS S3 和其他云存储服务提供商。
:::

ClickHouse 支持与多个 catalog 集成（Unity、Glue、REST、Polaris 等）。本指南将逐步说明如何使用 ClickHouse 和 [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/) 规范对您的数据进行查询。

REST Catalog 是针对 Iceberg catalog 的标准化 API 规范，受多个平台支持，包括：

* **本地开发环境**（使用 docker-compose 部署）
* **托管服务**，例如 Tabular.io
* **自托管** REST catalog 实现

:::note
由于此功能处于 beta 阶段，您需要通过以下设置启用它：
`SET allow_database_iceberg = 1;`
:::

## 本地开发环境搭建 \{#local-development-setup\}

在本地开发和测试场景下，可以使用容器化的 REST catalog 环境。此方式非常适合用于学习、原型验证以及日常开发。

### 前置条件 \{#local-prerequisites\}

1. **Docker 和 Docker Compose**：确保已安装 Docker 并且正在运行
2. **示例环境**：可以使用多种 docker-compose 配置（参见下文的替代 Docker 镜像）

### 配置本地 REST Catalog \{#setting-up-local-rest-catalog\}

你可以使用多种容器化的 REST catalog 实现，例如 **[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**，它通过 docker-compose 提供了完整的 Spark + Iceberg + REST catalog 环境，非常适合用于测试 Iceberg 集成。

**步骤 1：** 创建一个用于运行示例的新目录，然后创建文件 `docker-compose.yml`，其配置内容来自 [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)。

**步骤 2：** 接下来，创建文件 `docker-compose.override.yml`，并将以下 ClickHouse 容器配置放入其中：

```yaml
version: '3.8'

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: '0:0'  # Ensures root permissions
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # Mount dataset folder
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
```

**步骤 3：** 运行以下命令启动服务：

```bash
docker compose up
```

**步骤 4：** 等待所有服务就绪。可以通过查看日志进行检查：

```bash
docker-compose logs -f
```

:::note
REST 目录的配置要求首先将示例数据加载到 Iceberg 表中。请确保在通过 ClickHouse 尝试查询这些表之前，Spark 环境已经创建并写入了这些表。表的可用性取决于具体的 docker-compose 配置和示例数据加载脚本。
:::

### 连接到本地 REST 目录 \{#connecting-to-local-rest-catalog\}

连接到 ClickHouse 容器：

```bash
docker exec -it clickhouse clickhouse-client
```

然后为 REST 目录创建数据库连接：

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

## 使用 ClickHouse 查询 REST 目录表 \{#querying-rest-catalog-tables-using-clickhouse\}

既然连接已经建立，您可以开始通过 REST 目录进行查询。例如：

```sql
USE demo;

SHOW TABLES;
```

如果你的环境包含示例数据（例如 taxi 数据集），你应该会看到如下这些表：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
如果你没有看到任何表，通常意味着：

1. Spark 环境尚未创建示例表
2. REST catalog 服务尚未完全初始化
3. 示例数据加载过程尚未完成

你可以检查 Spark 日志以查看表创建进度：

```bash
docker-compose logs spark
```

:::

要查询表（如果存在）：

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
│ ENGINE = Iceberg('http://minio:9000/lakehouse/warehouse/default/taxis/', 'admin', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 将数据湖中的数据加载到 ClickHouse \{#loading-data-from-your-data-lake-into-clickhouse\}

如需将 REST 目录中的数据导入 ClickHouse，请先创建一个本地 ClickHouse 表：

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

然后通过执行 `INSERT INTO SELECT` 语句，从 REST 目录表中加载数据：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
