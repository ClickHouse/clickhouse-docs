---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'REST 目录'
title: 'REST 目录'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将逐步介绍如何使用 ClickHouse 和 REST 目录来查询您的数据。'
keywords: ['REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
与 REST Catalog 的集成仅适用于 Iceberg 表。
此集成同时支持 AWS S3 和其他云存储提供商。
:::

ClickHouse 支持与多个 Catalog 集成（Unity、Glue、REST、Polaris 等）。本指南将引导您完成使用 ClickHouse 和 [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/) 规范查询数据的各个步骤。

REST Catalog 是 Iceberg Catalog 的标准化 API 规范，并受以下各类平台支持：

* **本地开发环境**（使用 docker-compose 部署）
* **托管服务**（例如 Tabular.io）
* **自托管** REST Catalog 实现

:::note
由于该功能目前处于实验阶段，您需要通过以下命令将其启用：
`SET allow_experimental_database_iceberg = 1;`
:::


## 本地开发环境设置

在本地开发和测试场景中，你可以使用容器化的 REST catalog（目录）环境。此方式非常适合用于学习、原型验证以及开发环境。

### 前提条件

1. **Docker 和 Docker Compose**：确保已安装并正在运行 Docker
2. **示例配置**：你可以使用多种 docker-compose 配置（参见下文的 Alternative Docker Images）

### 本地 REST Catalog 设置

你可以使用多种容器化的 REST catalog 实现，例如 **[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**，它通过 docker-compose 提供了完整的 Spark + Iceberg + REST catalog 环境，非常适合用于测试 Iceberg 集成。

**步骤 1：** 创建一个用于运行示例的新文件夹，然后创建文件 `docker-compose.yml`，其内容使用 [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io) 中的配置。

**步骤 2：** 接下来，创建文件 `docker-compose.override.yml`，并将以下 ClickHouse 容器配置写入该文件：

```yaml
version: '3.8'

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: '0:0'  # 确保 root 权限
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # 挂载数据集目录
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

**步骤 4：** 等待所有服务就绪。可以通过检查日志来确认：

```bash
docker-compose logs -f
```

:::note
配置 REST catalog 之前，需要先将示例数据加载到 Iceberg 表中。请确保 Spark 环境已经创建这些表并写入了示例数据，然后再尝试通过 ClickHouse 查询它们。表是否可用取决于具体的 docker-compose 配置和示例数据加载脚本。
:::

### 连接到本地 REST Catalog

连接到你的 ClickHouse 容器：

```bash
docker exec -it clickhouse clickhouse-client
```

然后为 REST catalog 创建数据库连接：

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```


## 使用 ClickHouse 查询 REST 目录表

现在连接已经建立后，您可以开始通过 REST 目录执行查询。例如：

```sql
USE demo;

SHOW TABLES;
```

如果你的部署中包含示例数据（例如 taxi 数据集），你应该能看到如下这些表：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
如果你没有看到任何表，通常意味着：

1. Spark 环境尚未创建示例表
2. REST catalog 服务尚未完全初始化
3. 示例数据加载尚未完成

你可以查看 Spark 日志来了解表创建的进度：

```bash
docker-compose logs spark
```

:::

要查询表（如果已存在）：

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note 需要反引号
此处必须使用反引号，因为 ClickHouse 不支持多个命名空间。
:::

要查看表的 DDL：

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


## 将数据湖中的数据加载到 ClickHouse

如果需要将 REST 目录中的数据加载到 ClickHouse，首先创建一个本地 ClickHouse 表：

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

然后通过 `INSERT INTO SELECT` 将 REST 目录表中的数据加载进来：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
