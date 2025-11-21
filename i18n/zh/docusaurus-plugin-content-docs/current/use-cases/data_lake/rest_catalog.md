---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'REST 目录'
title: 'REST 目录'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将向您演示如何使用 ClickHouse 和 REST 目录查询数据。'
keywords: ['REST', 'Tabular', '数据湖', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
与 REST Catalog 的集成仅适用于 Iceberg 表。
该集成同时支持 AWS S3 和其他云存储服务提供商。
:::

ClickHouse 支持与多个目录（Unity、Glue、REST、Polaris 等）的集成。本指南将逐步说明如何使用 ClickHouse 和 [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/) 规范来查询数据。

REST Catalog 是面向 Iceberg 目录的标准化 API 规范，受以下各类平台支持：

* **本地开发环境**（基于 docker-compose 的部署）
* **托管服务**，如 Tabular.io
* **自托管** REST Catalog 实现

:::note
由于此功能处于实验阶段，需要通过以下设置将其启用：
`SET allow_experimental_database_iceberg = 1;`
:::


## 本地开发环境配置 {#local-development-setup}

对于本地开发和测试,您可以使用容器化的 REST 目录配置。这种方式非常适合学习、原型开发和开发环境。

### 前置要求 {#local-prerequisites}

1. **Docker 和 Docker Compose**:确保 Docker 已安装并正在运行
2. **示例配置**:您可以使用各种 docker-compose 配置(请参阅下文的替代 Docker 镜像)

### 配置本地 REST 目录 {#setting-up-local-rest-catalog}

您可以使用各种容器化的 REST 目录实现,例如 **[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**,它通过 docker-compose 提供了完整的 Spark + Iceberg + REST 目录环境,非常适合测试 Iceberg 集成。

**步骤 1:** 创建一个新文件夹来运行示例,然后使用 [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io) 的配置创建 `docker-compose.yml` 文件。

**步骤 2:** 接下来,创建 `docker-compose.override.yml` 文件,并将以下 ClickHouse 容器配置放入其中:

```yaml
version: "3.8"

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: "0:0" # 确保 root 权限
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import # 挂载数据集文件夹
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
```

**步骤 3:** 运行以下命令启动服务:

```bash
docker compose up
```

**步骤 4:** 等待所有服务就绪。您可以查看日志:

```bash
docker-compose logs -f
```

:::note
REST 目录配置要求首先将示例数据加载到 Iceberg 表中。在尝试通过 ClickHouse 查询这些表之前,请确保 Spark 环境已创建并填充了这些表。表的可用性取决于具体的 docker-compose 配置和示例数据加载脚本。
:::

### 连接到本地 REST 目录 {#connecting-to-local-rest-catalog}

连接到您的 ClickHouse 容器:

```bash
docker exec -it clickhouse clickhouse-client
```

然后创建到 REST 目录的数据库连接:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS
    catalog_type = 'rest',
    storage_endpoint = 'http://minio:9000/lakehouse',
    warehouse = 'demo'
```


## 使用 ClickHouse 查询 REST catalog 表 {#querying-rest-catalog-tables-using-clickhouse}

连接建立后,您可以通过 REST catalog 开始查询。例如:

```sql
USE demo;

SHOW TABLES;
```

如果您的环境包含示例数据(如出租车数据集),您应该会看到类似以下的表:

```sql title="响应"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
如果您没有看到任何表,通常是因为:

1. Spark 环境尚未创建示例表
2. REST catalog 服务未完全初始化
3. 示例数据加载过程尚未完成

您可以查看 Spark 日志以了解表创建进度:

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
由于 ClickHouse 不支持多个命名空间,因此需要使用反引号。
:::

查看表 DDL:

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
│ ENGINE = Iceberg('http://minio:9000/lakehouse/warehouse/default/taxis/', 'admin', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## 将数据湖中的数据加载到 ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

如果需要将 REST 目录中的数据加载到 ClickHouse,首先需要创建一个本地 ClickHouse 表:

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

然后通过 `INSERT INTO SELECT` 语句从 REST 目录表中加载数据:

```sql
INSERT INTO taxis
SELECT * FROM demo.`default.taxis`;
```
