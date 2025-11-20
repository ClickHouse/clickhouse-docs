---
'slug': '/use-cases/data-lake/nessie-catalog'
'sidebar_label': '넥시 카탈로그'
'title': '넥시 카탈로그'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드에서는 ClickHouse와 Nessie Catalog를 사용하여 데이터를 쿼리하는 단계를 안내합니다.'
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
Nessie 카탈로그와의 통합은 Iceberg 테이블에 대해서만 작동합니다.
이 통합은 AWS S3 및 기타 클라우드 스토리지 공급자를 지원합니다.
:::

ClickHouse는 여러 카탈로그(예: Unity, Glue, REST, Polaris 등)와의 통합을 지원합니다. 이 가이드는 ClickHouse와 [Nessie](https://projectnessie.org/) 카탈로그를 사용하여 데이터를 쿼리하는 단계에 대해 설명합니다.

Nessie는 데이터 레이크를 위한 오픈 소스 트랜잭션 카탈로그로 다음과 같은 기능을 제공합니다:
- **Git 영감을 받은** 데이터 버전 관리(브랜치 및 커밋 포함)
- **테이블 간 트랜잭션** 및 가시성 보장
- **Iceberg REST 카탈로그 사양** 준수를 위한 **REST API**
- Hive, Spark, Dremio, Trino 등 지원하는 **오픈 데이터 레이크** 접근 방식
- Docker 또는 Kubernetes에서 실행 가능한 **프로덕션 준비 완료** 배포

:::note
이 기능은 실험적이므로, 다음 명령어를 사용하여 활성화해야 합니다:
`SET allow_experimental_database_iceberg = 1;`
:::

## 로컬 개발 설정 {#local-development-setup}

로컬 개발 및 테스트를 위해 컨테이너화된 Nessie 설정을 사용할 수 있습니다. 이 접근 방식은 학습, 프로토타입 제작 및 개발 환경에 적합합니다.

### 전제 조건 {#local-prerequisites}

1. **Docker 및 Docker Compose**: Docker가 설치되고 실행 중인지 확인합니다.
2. **샘플 설정**: 공식 Nessie docker-compose 설정을 사용할 수 있습니다.

### 로컬 Nessie 카탈로그 설정 {#setting-up-local-nessie-catalog}

공식 [Nessie docker-compose 설정](https://projectnessie.org/guides/setting-up/)을 사용할 수 있으며, 이 설정은 Nessie, 인메모리 버전 저장소 및 MinIO를 통한 객체 저장소를 포함한 완전한 환경을 제공합니다.

**1단계:** 예제를 실행할 새 폴더를 만들고, 다음 구성이 포함된 `docker-compose.yml` 파일을 생성합니다:

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

**2단계:** 서비스를 시작하기 위해 다음 명령어를 실행합니다:

```bash
docker compose up -d
```

**3단계:** 모든 서비스가 준비될 때까지 기다립니다. 로그를 확인할 수 있습니다:

```bash
docker-compose logs -f
```

:::note
Nessie 설정은 인메모리 버전 저장소를 사용하며 Iceberg 테이블에 샘플 데이터를 먼저 로드해야 합니다. ClickHouse를 통해 쿼리하기 전에 환경이 테이블을 생성하고 채웠는지 확인하십시오.
:::

### 로컬 Nessie 카탈로그에 연결하기 {#connecting-to-local-nessie-catalog}

ClickHouse 컨테이너에 연결합니다:

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

그런 다음 Nessie 카탈로그에 대한 데이터베이스 연결을 생성합니다:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://nessie:19120/iceberg', 'admin', 'password')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/my-bucket', warehouse = 'warehouse'
```

## ClickHouse를 사용한 Nessie 카탈로그 테이블 쿼리 {#querying-nessie-catalog-tables-using-clickhouse}

이제 연결이 설정되었으므로 Nessie 카탈로그를 통해 쿼리를 시작할 수 있습니다. 예를 들어:

```sql
USE demo;

SHOW TABLES;
```

설정에 샘플 데이터(예: 택시 데이터셋)가 포함되어 있다면 다음과 같은 테이블을 볼 수 있어야 합니다:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
테이블이 보이지 않는 경우, 일반적으로 다음을 의미합니다:
1. 환경이 샘플 테이블을 아직 생성하지 않았습니다.
2. Nessie 카탈로그 서비스가 완전히 초기화되지 않았습니다.
3. 샘플 데이터 로딩 프로세스가 완료되지 않았습니다.

Nessie 로그에서 카탈로그 활동을 확인할 수 있습니다:
```bash
docker-compose logs nessie
```
:::

사용 가능한 테이블을 쿼리하려면:

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note 백틱 필요
ClickHouse는 두 개 이상의 네임스페이스를 지원하지 않으므로 백틱이 필요합니다.
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
│ ENGINE = Iceberg('http://localhost:9002/my-bucket/default/taxis/', 'admin', '[HIDDEN]')      │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 데이터 레이크에서 ClickHouse로 데이터 로드하기 {#loading-data-from-your-data-lake-into-clickhouse}

Nessie 카탈로그에서 ClickHouse로 데이터를 로드해야 하는 경우, 먼저 로컬 ClickHouse 테이블을 생성합니다:

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

그런 다음 `INSERT INTO SELECT`를 통해 Nessie 카탈로그 테이블에서 데이터를 로드합니다:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
