---
slug: /use-cases/data-lake/nessie-catalog
sidebar_label: 'Nessie 카탈로그'
title: 'Nessie 카탈로그'
pagination_prev: null
pagination_next: null
description: '이 가이드에서는 ClickHouse와 Nessie 카탈로그를 사용하여
 데이터를 쿼리하는 방법을 단계별로 안내합니다.'
keywords: ['Nessie', 'REST', 'Transactional', '데이터 레이크', 'Iceberg', 'Git-like']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

:::note
Nessie Catalog 통합은 Iceberg 테이블에서만 동작합니다.
이 통합은 AWS S3 및 기타 클라우드 스토리지 서비스도 지원합니다.
:::

ClickHouse는 Unity, Glue, REST, Polaris 등 여러 카탈로그와의 통합을 지원합니다. 이 가이드는 ClickHouse와 [Nessie](https://projectnessie.org/) 카탈로그를 사용하여 데이터를 쿼리하는 방법을 단계별로 안내합니다.

Nessie는 데이터 레이크를 위한 오픈 소스 트랜잭션 카탈로그로, 다음과 같은 기능을 제공합니다:

* 브랜치와 커밋을 활용한 **Git 기반** 데이터 버전 관리
* **테이블 간 트랜잭션** 및 가시성 보장
* Iceberg REST 카탈로그 사양을 준수하는 **REST API** 호환성
* Hive, Spark, Dremio, Trino 등을 지원하는 **오픈 데이터 레이크** 접근 방식
* Docker 또는 Kubernetes에서의 **운영 환경용** 배포 지원

:::note
이 기능은 실험적 기능이므로 다음 설정을 통해 활성화해야 합니다:
`SET allow_experimental_database_iceberg = 1;`
:::


## 로컬 개발 설정 \{#local-development-setup\}

로컬 개발 및 테스트를 위해 컨테이너화된 Nessie 환경을 사용할 수 있습니다. 이 방식은 학습, 프로토타입 제작, 개발 환경에 적합합니다.

### 사전 준비 사항 \{#local-prerequisites\}

1. **Docker 및 Docker Compose**: Docker가 설치되어 있고 실행 중인지 확인하십시오
2. **샘플 환경**: 공식 Nessie docker-compose 구성을 사용할 수 있습니다

### 로컬 Nessie 카탈로그 설정 \{#setting-up-local-nessie-catalog\}

공식 [Nessie docker-compose 설정](https://projectnessie.org/guides/setting-up/)을 사용하면 Nessie, 인메모리 버전 저장소, 객체 스토리지를 위한 MinIO가 포함된 완전한 환경을 구성할 수 있습니다.

**1단계:** 예제를 실행할 새 폴더를 만든 다음, 아래 구성으로 `docker-compose.yml` 파일을 생성합니다:

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

**2단계:** 다음 명령을 실행하여 서비스를 시작하십시오:

```bash
docker compose up -d
```

**3단계:** 모든 서비스가 준비될 때까지 기다립니다. 로그를 확인해 볼 수 있습니다:

```bash
docker-compose logs -f
```

:::note
Nessie 설정은 인메모리 버전 저장소를 사용하며, 먼저 Iceberg 테이블에 샘플 데이터를 로드해야 합니다. ClickHouse를 통해 쿼리하기 전에 환경에서 테이블을 생성하고 데이터가 채워졌는지 반드시 확인하십시오.
:::


### 로컬 Nessie 카탈로그에 연결하기 \{#connecting-to-local-nessie-catalog\}

ClickHouse 컨테이너에 접속하십시오:

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

그런 다음 Nessie 카탈로그에 대한 데이터베이스 연결을 설정합니다:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://nessie:19120/iceberg', 'admin', 'password')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/my-bucket', warehouse = 'warehouse'
```


## ClickHouse에서 Nessie 카탈로그 테이블 조회하기 \{#querying-nessie-catalog-tables-using-clickhouse\}

이제 연결이 설정되었으므로 Nessie 카탈로그를 통해 쿼리를 실행할 수 있습니다. 예시는 다음과 같습니다:

```sql
USE demo;

SHOW TABLES;
```

구성에 예제 데이터(예: 택시 데이터세트)가 포함되어 있으면 다음과 같은 테이블이 표시됩니다:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
테이블이 보이지 않는 경우, 일반적으로 다음을 의미합니다:

1. 환경에서 아직 샘플 테이블을 CREATE하지 않았습니다
2. Nessie 카탈로그 서비스가 완전히 초기화되지 않았습니다
3. 샘플 데이터 로딩 프로세스가 완료되지 않았습니다

카탈로그 동작을 확인하려면 Nessie 로그를 확인하십시오:

```bash
docker-compose logs nessie
```

:::

테이블에 쿼리를 실행하려면(사용 가능한 경우):

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note 백틱 필요
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
│ ENGINE = Iceberg('http://localhost:9002/my-bucket/default/taxis/', 'admin', '[HIDDEN]')      │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## 데이터 레이크에서 ClickHouse로 데이터 로드 \{#loading-data-from-your-data-lake-into-clickhouse\}

데이터 레이크의 Nessie 카탈로그에서 ClickHouse로 데이터를 로드해야 하는 경우, 먼저 로컬 ClickHouse 테이블을 생성하십시오:

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

그런 다음 `INSERT INTO SELECT` 구문을 사용하여 Nessie 카탈로그 테이블에서 데이터를 불러옵니다:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
