---
'slug': '/use-cases/data-lake/rest-catalog'
'sidebar_label': 'REST Catalog'
'title': 'REST Catalog'
'pagination_prev': null
'pagination_next': null
'description': '在本指南中，我们将带您了解如何使用 ClickHouse 和 REST Catalog 查询您的数据。'
'keywords':
- 'REST'
- 'Tabular'
- 'Data Lake'
- 'Iceberg'
'show_related_blogs': true
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
与 REST 目录的集成仅适用于 Iceberg 表。
此集成支持 AWS S3 和其他云存储提供商。
:::

ClickHouse 支持与多个目录的集成（Unity、Glue、REST、Polaris 等）。本指南将引导您通过使用 ClickHouse 和 [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/) 规范查询您的数据。

REST Catalog 是 Iceberg 目录的标准化 API 规范，支持多个平台，包括：
- **本地开发环境**（使用 docker-compose 设置）
- **托管服务** 如 Tabular.io
- **自托管的** REST 目录实现

:::note
由于此功能处于实验阶段，您需要使用以下命令启用它：
`SET allow_experimental_database_iceberg = 1;`
:::

## 本地开发设置 {#local-development-setup}

对于本地开发和测试，您可以使用容器化的 REST 目录设置。这种方法非常适合学习、原型设计和开发环境。

### 先决条件 {#local-prerequisites}

1. **Docker 和 Docker Compose**：确保 Docker 已安装并正在运行
2. **示例设置**：您可以使用各种 docker-compose 设置（请参阅下面的替代 Docker 镜像）

### 设置本地 REST 目录 {#setting-up-local-rest-catalog}

您可以使用各种容器化的 REST 目录实现，例如 **[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)**，该实现提供了一个完整的 Spark + Iceberg + REST 目录环境，适合使用 docker-compose 测试 Iceberg 集成。

**步骤 1：** 在运行示例的文件夹中创建一个新文件夹，然后创建一个名为 `docker-compose.yml` 的文件，并使用 [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io) 的配置。

**步骤 2：** 接下来，创建一个名为 `docker-compose.override.yml` 的文件，并将以下 ClickHouse 容器配置放入其中：

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

**步骤 3：** 运行以下命令以启动服务：

```bash
docker compose up
```

**步骤 4：** 等待所有服务准备好。您可以检查日志：

```bash
docker-compose logs -f
```

:::note
REST 目录设置需要首先加载示例数据到 Iceberg 表中。在尝试通过 ClickHouse 查询它们之前，请确保 Spark 环境已创建并填充了表。表的可用性取决于特定的 docker-compose 设置和示例数据加载脚本。
:::

### 连接到本地 REST 目录 {#connecting-to-local-rest-catalog}

连接到您的 ClickHouse 容器：

```bash
docker exec -it clickhouse clickhouse-client
```

然后创建到 REST 目录的数据库连接：

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

## 使用 ClickHouse 查询 REST 目录表 {#querying-rest-catalog-tables-using-clickhouse}

现在连接已建立，您可以开始通过 REST 目录进行查询。例如：

```sql
USE demo;

SHOW TABLES;
```

如果您的设置包含示例数据（例如出租车数据集），您应该能够看到如下表格：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
如果您未看到任何表，这通常意味着：
1. Spark 环境尚未创建示例表
2. REST 目录服务尚未完全初始化
3. 示例数据加载过程尚未完成

您可以检查 Spark 日志以查看表创建进度：
```bash
docker-compose logs spark
```
:::

要查询表（如果可用）：

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note 需要反引号
需要反引号，因为 ClickHouse 不支持多个命名空间。
:::

要检查表 DDL：

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

## 从数据湖加载数据到 ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

如果您需要将数据从 REST 目录加载到 ClickHouse，请首先创建一个本地 ClickHouse 表：

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

然后通过 `INSERT INTO SELECT` 从您的 REST 目录表加载数据：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
