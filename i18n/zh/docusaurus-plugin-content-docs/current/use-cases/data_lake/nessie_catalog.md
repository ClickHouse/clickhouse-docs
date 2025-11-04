---
'slug': '/use-cases/data-lake/nessie-catalog'
'sidebar_label': 'Nessie 目录'
'title': 'Nessie 目录'
'pagination_prev': null
'pagination_next': null
'description': '在本指南中，我们将引导您通过使用 ClickHouse 和 Nessie 目录查询您的数据的步骤。'
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
与 Nessie Catalog 的集成仅与 Iceberg 表兼容。
该集成支持 AWS S3 及其他云存储提供商。
:::

ClickHouse 支持与多个目录（Unity、Glue、REST、Polaris 等）的集成。本指南将指导您如何使用 ClickHouse 与[Nessie](https://projectnessie.org/)目录查询数据。

Nessie 是一个开源的事务性目录，适用于数据湖，提供：
- **受 Git 启发的** 数据版本控制，具有分支和提交功能
- **跨表事务**和可见性保证
- **与 Iceberg REST 目录规范**兼容的 REST API
- **开放数据湖**方法，支持 Hive、Spark、Dremio、Trino 等
- **生产就绪的** Docker 或 Kubernetes 部署

:::note
由于此功能为实验性，您需要通过以下方式启用它：
`SET allow_experimental_database_iceberg = 1;`
:::

## 本地开发设置 {#local-development-setup}

对于本地开发和测试，您可以使用容器化的 Nessie 设置。这种方法非常适合学习、原型开发和开发环境。

### 先决条件 {#local-prerequisites}

1. **Docker 和 Docker Compose**：确保已安装并正在运行 Docker
2. **示例设置**：您可以使用官方的 Nessie docker-compose 设置

### 设置本地 Nessie 目录 {#setting-up-local-nessie-catalog}

您可以使用官方的 [Nessie docker-compose 设置](https://projectnessie.org/guides/setting-up/)，该设置提供了一个完整的环境，包括 Nessie、内存版本库和用于对象存储的 MinIO。

**步骤 1：** 创建一个新的文件夹以运行示例，然后创建一个文件 `docker-compose.yml`，配置如下：

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

**步骤 2：** 运行以下命令以启动服务：

```bash
docker compose up -d
```

**步骤 3：** 等待所有服务准备就绪。您可以检查日志：

```bash
docker-compose logs -f
```

:::note
Nessie 设置使用内存版本库，要求首先将示例数据加载到 Iceberg 表中。在通过 ClickHouse 尝试查询它们之前，请确保环境已经创建并填充了表。
:::

### 连接到本地 Nessie 目录 {#connecting-to-local-nessie-catalog}

连接到您的 ClickHouse 容器：

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

然后创建到 Nessie 目录的数据库连接：

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://nessie:19120/iceberg', 'admin', 'password')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/my-bucket', warehouse = 'warehouse'
```

## 使用 ClickHouse 查询 Nessie 目录表 {#querying-nessie-catalog-tables-using-clickhouse}

现在连接已建立，您可以开始通过 Nessie 目录进行查询。例如：

```sql
USE demo;

SHOW TABLES;
```

如果您的设置包括示例数据（例如出租车数据集），您应该会看到如下表：

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
如果您没有看到任何表，通常意味着：
1. 环境尚未创建示例表
2. Nessie 目录服务尚未完全初始化
3. 示例数据加载过程尚未完成

您可以检查 Nessie 日志以查看目录活动：
```bash
docker-compose logs nessie
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

要检查表的 DDL：

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

## 从数据湖将数据加载到 ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

如果您需要从 Nessie 目录将数据加载到 ClickHouse，请首先创建一个本地 ClickHouse 表：

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

然后通过 `INSERT INTO SELECT` 从 Nessie 目录表加载数据：

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
