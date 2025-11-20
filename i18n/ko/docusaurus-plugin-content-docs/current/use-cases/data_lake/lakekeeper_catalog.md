---
'slug': '/use-cases/data-lake/lakekeeper-catalog'
'sidebar_label': 'Lakekeeper 카탈로그'
'title': 'Lakekeeper 카탈로그'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드에서는 ClickHouse와 Lakekeeper 카탈로그를 사용하여 데이터를 쿼리하는 단계를 안내합니다.'
'keywords':
- 'Lakekeeper'
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
Lakekeeper 카탈로그와의 통합은 Iceberg 테이블에서만 작동합니다.
이 통합은 AWS S3 및 기타 클라우드 저장소 제공자를 지원합니다.
:::

ClickHouse는 여러 카탈로그(조화, Glue, REST, Polaris 등)와의 통합을 지원합니다. 이 가이드는 ClickHouse와 [Lakekeeper](https://docs.lakekeeper.io/) 카탈로그를 사용하여 데이터를 쿼리하는 단계를 안내합니다.

Lakekeeper는 Apache Iceberg를 위한 오픈 소스 REST 카탈로그 구현으로 다음 기능을 제공합니다:
- **Rust 네이티브** 구현으로 높은 성능과 신뢰성 제공
- **REST API** Iceberg REST 카탈로그 사양 준수
- **클라우드 저장소** S3 호환 저장소와 통합

:::note
이 기능은 실험적이므로 다음을 사용하여 활성화해야 합니다:
`SET allow_experimental_database_iceberg = 1;`
:::

## 로컬 개발 환경 설정 {#local-development-setup}

로컬 개발 및 테스트를 위해 컨테이너화된 Lakekeeper 설정을 사용할 수 있습니다. 이 접근법은 학습, 프로토타이핑 및 개발 환경에 이상적입니다.

### 전제 조건 {#local-prerequisites}

1. **Docker 및 Docker Compose**: Docker가 설치되고 실행되고 있는지 확인
2. **샘플 설정**: Lakekeeper 도커-컴포즈 설정을 사용할 수 있습니다.

### 로컬 Lakekeeper 카탈로그 설정 {#setting-up-local-lakekeeper-catalog}

공식 [Lakekeeper 도커-컴포즈 설정](https://github.com/lakekeeper/lakekeeper/tree/main/examples/minimal)을 사용할 수 있으며, 이 설정은 Lakekeeper, PostgreSQL 메타데이터 백엔드 및 객체 저장을 위한 MinIO가 포함된 완벽한 환경을 제공합니다.

**단계 1:** 예제를 실행할 새 폴더를 만들고, `docker-compose.yml` 파일을 다음 구성으로 생성합니다:

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

**단계 2:** 다음 명령을 실행하여 서비스를 시작합니다:

```bash
docker compose up -d
```

**단계 3:** 모든 서비스가 준비될 때까지 기다립니다. 로그를 확인할 수 있습니다:

```bash
docker-compose logs -f
```

:::note
Lakekeeper 설정은 먼저 Iceberg 테이블에 샘플 데이터를 로드해야 합니다. ClickHouse를 통해 쿼리하기 전에 환경에서 테이블이 생성되고 데이터가 채워져 있는지 확인하십시오. 테이블의 가용성은 특정 도커-컴포즈 설정 및 샘플 데이터 로딩 스크립트에 따라 다릅니다.
:::

### 로컬 Lakekeeper 카탈로그에 연결 {#connecting-to-local-lakekeeper-catalog}

ClickHouse 컨테이너에 연결합니다:

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

## ClickHouse를 사용하여 Lakekeeper 카탈로그 테이블 쿼리하기 {#querying-lakekeeper-catalog-tables-using-clickhouse}

연결이 완료되었으므로 Lakekeeper 카탈로그를 통해 쿼리를 시작할 수 있습니다. 예를 들어:

```sql
USE demo;

SHOW TABLES;
```

설치에 샘플 데이터(예: 택시 데이터 세트)가 포함되어 있다면 다음과 같은 테이블을 볼 수 있어야 합니다:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
테이블이 보이지 않으면 대개 다음을 의미합니다:
1. 환경에서 샘플 테이블을 아직 생성하지 않았습니다.
2. Lakekeeper 카탈로그 서비스가 완전히 초기화되지 않았습니다.
3. 샘플 데이터 로딩 프로세스가 완료되지 않았습니다.

Spark 로그를 확인하여 테이블 생성 진행 상황을 확인할 수 있습니다:
```bash
docker-compose logs spark
```
:::

테이블에 쿼리하려면(사용 가능할 경우):

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note 백틱 필요
ClickHouse는 하나 이상의 네임스페이스를 지원하지 않기 때문에 백틱이 필요합니다.
:::

테이블 DDL을 검사하려면:

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

## 데이터 레이크에서 ClickHouse로 데이터 로드하기 {#loading-data-from-your-data-lake-into-clickhouse}

Lakekeeper 카탈로그에서 ClickHouse로 데이터를 로드해야 하는 경우, 먼저 로컬 ClickHouse 테이블을 생성합니다:

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

그런 다음 `INSERT INTO SELECT`를 통해 Lakekeeper 카탈로그 테이블에서 데이터를 로드합니다:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
