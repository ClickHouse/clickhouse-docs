---
slug: /use-cases/data-lake/lakekeeper-catalog
sidebar_label: 'Lakekeeper 카탈로그'
title: 'Lakekeeper 카탈로그'
pagination_prev: null
pagination_next: null
description: '이 가이드에서는 ClickHouse와 Lakekeeper 카탈로그를 사용하여
 데이터를 쿼리하는 방법을 단계별로 안내합니다.'
keywords: ['Lakekeeper', 'REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Lakekeeper 카탈로그와의 통합은 Iceberg 테이블에서만 동작합니다.
이 통합은 AWS S3 및 기타 클라우드 스토리지 서비스도 지원합니다.
:::

ClickHouse는 여러 카탈로그(Unity, Glue, REST, Polaris 등)와의 통합을 지원합니다. 이 가이드는 ClickHouse와 [Lakekeeper](https://docs.lakekeeper.io/) 카탈로그를 사용하여 데이터를 쿼리하는 방법을 단계별로 설명합니다.

Lakekeeper는 Apache Iceberg용 오픈 소스 REST 카탈로그 구현으로, 다음과 같은 기능을 제공합니다:

* 높은 성능과 안정성을 위한 **Rust 네이티브** 구현
* Iceberg REST 카탈로그 사양을 준수하는 **REST API**
* S3 호환 스토리지와 통합되는 **클라우드 스토리지** 지원

:::note
이 기능은 실험적 기능이므로 다음 설정을 사용해 활성화해야 합니다:
`SET allow_experimental_database_iceberg = 1;`
:::


## 로컬 개발 설정 \{#local-development-setup\}

로컬 개발 및 테스트를 위해 컨테이너 기반 Lakekeeper 환경을 사용할 수 있습니다. 이 방식은 학습, 프로토타이핑 및 개발 환경에서 사용하기에 적합합니다.

### 사전 준비 사항 \{#local-prerequisites\}

1. **Docker 및 Docker Compose**: Docker가 설치되어 실행 중인지 확인합니다.
2. **샘플 구성**: Lakekeeper docker-compose 구성을 사용할 수 있습니다.

### 로컬 Lakekeeper 카탈로그 설정 \{#setting-up-local-lakekeeper-catalog\}

Lakekeeper, PostgreSQL 메타데이터 백엔드, 그리고 객체 스토리지를 위한 MinIO가 포함된 전체 환경을 제공하는 공식 [Lakekeeper docker-compose 설정](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal)을 사용할 수 있습니다.

**1단계:** 예제를 실행할 새 폴더를 만든 다음, 다음 구성을 사용하여 `docker-compose.yml` 파일을 생성합니다:

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

  db:
    image: bitnami/postgresql:16.3.0
    environment:
      - POSTGRESQL_USERNAME=postgres
      - POSTGRESQL_PASSWORD=postgres
      - POSTGRESQL_DATABASE=postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -p 5432 -d postgres"]
      interval: 2s
      timeout: 10s
      retries: 5
      start_period: 10s
    volumes:
      - postgres_data:/bitnami/postgresql
    networks:
      - iceberg_net

  minio:
    image: bitnami/minio:2025.4.22
    environment:
      - MINIO_ROOT_USER=minio
      - MINIO_ROOT_PASSWORD=ClickHouse_Minio_P@ssw0rd
      - MINIO_API_PORT_NUMBER=9000
      - MINIO_CONSOLE_PORT_NUMBER=9001
      - MINIO_SCHEME=http
      - MINIO_DEFAULT_BUCKETS=warehouse-rest
    networks: 
      iceberg_net:
        aliases:
          - warehouse-rest.minio
    ports:
      - "9002:9000"
      - "9003:9001"
    healthcheck:
      test: ["CMD", "mc", "ls", "local", "|", "grep", "warehouse-rest"]
      interval: 2s
      timeout: 10s
      retries: 3
      start_period: 15s
    volumes:
      - minio_data:/bitnami/minio/data

  clickhouse:
    image: clickhouse/clickhouse-server:head
    container_name: lakekeeper-clickhouse
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
```

**2단계:** 다음 명령을 실행하여 서비스를 시작하십시오:

```bash
docker compose up -d
```

**3단계:** 모든 서비스가 준비될 때까지 기다리십시오. 로그를 확인할 수 있습니다:

```bash
docker-compose logs -f
```

:::note
Lakekeeper 구성에서는 먼저 Iceberg 테이블에 샘플 데이터를 적재해야 합니다. ClickHouse를 통해 해당 테이블에 쿼리를 실행하기 전에, 환경에서 테이블을 사전에 생성하고 데이터로 채워 두었는지 확인하십시오. 테이블을 사용할 수 있는지는 사용 중인 특정 docker-compose 구성과 샘플 데이터 적재 스크립트에 따라 달라집니다.
:::


### 로컬 Lakekeeper 카탈로그에 연결하기 \{#connecting-to-local-lakekeeper-catalog\}

ClickHouse 컨테이너에 접속하십시오:

```bash
docker exec -it lakekeeper-clickhouse clickhouse-client
```

그런 다음 Lakekeeper 카탈로그에 대한 데이터베이스 연결을 생성합니다:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://lakekeeper:8181/catalog', 'minio', 'ClickHouse_Minio_P@ssw0rd')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/warehouse-rest', warehouse = 'demo'
```


## ClickHouse를 사용하여 Lakekeeper 카탈로그 테이블 쿼리하기 \{#querying-lakekeeper-catalog-tables-using-clickhouse\}

이제 연결이 설정되었으므로 Lakekeeper 카탈로그를 통해 쿼리를 실행할 수 있습니다. 예:

```sql
USE demo;

SHOW TABLES;
```

구성에 예제 데이터(예: 택시 데이터셋)가 포함되어 있다면, 다음과 같은 테이블을 확인할 수 있습니다:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
테이블이 보이지 않는 경우, 일반적으로 다음과 같은 이유일 수 있습니다.

1. 환경에서 아직 샘플 테이블이 생성되지 않았습니다.
2. Lakekeeper 카탈로그 서비스가 완전히 초기화되지 않았습니다.
3. 샘플 데이터 적재 작업이 완료되지 않았습니다.

Spark 로그에서 테이블 생성 진행 상태를 확인할 수 있습니다.

```bash
docker-compose logs spark
```

:::

테이블이 존재하는 경우 다음과 같이 쿼리합니다:

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note 백틱(backtick) 필요
ClickHouse는 둘 이상의 네임스페이스를 지원하지 않으므로 백틱이 필요합니다.
:::

테이블 DDL을 확인하려면:

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


## 데이터 레이크에서 ClickHouse로 데이터 적재하기 \{#loading-data-from-your-data-lake-into-clickhouse\}

데이터 레이크의 Lakekeeper 카탈로그에서 ClickHouse로 데이터를 적재해야 하는 경우, 먼저 로컬 ClickHouse 테이블을 생성하십시오.

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

그런 다음 `INSERT INTO SELECT`를 사용하여 Lakekeeper 카탈로그 테이블에서 데이터를 로드합니다:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
