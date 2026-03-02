---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'REST 카탈로그'
title: 'REST 카탈로그'
pagination_prev: null
pagination_next: null
description: '이 가이드에서는 ClickHouse와 REST 카탈로그를 사용하여 데이터를 쿼리하는 방법을 단계별로 안내합니다.'
keywords: ['REST', 'Tabular', '데이터 레이크', 'Iceberg']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
REST Catalog 통합은 Iceberg 테이블에서만 작동합니다.
이 통합은 AWS S3 및 기타 클라우드 스토리지 제공자를 모두 지원합니다.
:::

ClickHouse는 여러 카탈로그(Unity, Glue, REST, Polaris 등)와의 통합을 지원합니다. 이 가이드는 ClickHouse와 [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/) 사양을 사용하여 데이터를 쿼리하는 절차를 안내합니다.

REST Catalog는 다음과 같은 다양한 플랫폼에서 지원되는 Iceberg 카탈로그용 표준화된 API 사양입니다:

* **로컬 개발 환경**(docker-compose 구성을 사용)
* Tabular.io와 같은 **매니지드 서비스**
* **셀프 호스팅** REST 카탈로그 구현

:::note
이 기능은 베타이므로, 다음을 실행하여 활성화해야 합니다:
`SET allow_database_iceberg = 1;`
:::


## 로컬 개발 환경 설정 \{#local-development-setup\}

로컬 개발 및 테스트를 위해 컨테이너 기반 REST 카탈로그 환경을 사용할 수 있습니다. 이 방식은 학습, 프로토타이핑 및 개발 환경에서 사용하기에 적합합니다.

### 사전 준비 사항 \{#local-prerequisites\}

1. **Docker 및 Docker Compose**: Docker가 설치되어 있고 실행 중인지 확인하십시오.
2. **샘플 구성**: 다양한 docker-compose 구성을 사용할 수 있습니다(아래의 Alternative Docker Images를 참조하십시오).

### 로컬 REST 카탈로그 설정 \{#setting-up-local-rest-catalog\}

**[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)** 와 같이 컨테이너화된 다양한 REST 카탈로그 구현을 사용할 수 있습니다. 이 구현은 docker-compose를 통해 완전한 Spark + Iceberg + REST 카탈로그 환경을 제공하므로 Iceberg 연동을 테스트하기에 적합합니다.

**1단계:** 예제를 실행할 새 폴더를 만든 다음, [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)에서 가져온 설정으로 `docker-compose.yml` 파일을 생성합니다.

**2단계:** 이어서 `docker-compose.override.yml` 파일을 생성하고, 여기에 아래 ClickHouse 컨테이너 구성을 추가합니다.

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

**3단계:** 다음 명령어를 실행하여 서비스를 시작합니다:

```bash
docker compose up
```

**4단계:** 모든 서비스가 준비될 때까지 기다립니다. 로그를 확인하십시오:

```bash
docker-compose logs -f
```

:::note
REST 카탈로그를 설정하려면 먼저 Iceberg 테이블에 샘플 데이터를 로드해야 합니다. Spark 환경에서 테이블을 생성하고 데이터를 채운 뒤에야 ClickHouse를 통해 해당 테이블을 쿼리할 수 있습니다. 테이블이 존재하는지는 사용 중인 docker-compose 설정과 샘플 데이터 로딩 스크립트에 따라 달라집니다.
:::


### 로컬 REST 카탈로그에 연결하기 \{#connecting-to-local-rest-catalog\}

ClickHouse 컨테이너에 연결하십시오:

```bash
docker exec -it clickhouse clickhouse-client
```

그런 다음 REST 카탈로그에 대한 데이터베이스 연결을 생성합니다:

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```


## ClickHouse를 사용하여 REST 카탈로그 테이블 쿼리하기 \{#querying-rest-catalog-tables-using-clickhouse\}

연결이 설정되었으므로 이제 REST 카탈로그를 통해 쿼리를 실행할 수 있습니다. 예를 들어 다음과 같습니다:

```sql
USE demo;

SHOW TABLES;
```

구성에 샘플 데이터(예: 택시 데이터셋)가 포함되어 있다면 다음과 같은 테이블이 보여야 합니다.

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
테이블이 표시되지 않는 경우 일반적으로 다음을 의미합니다:

1. Spark 환경에서 아직 샘플 테이블을 생성하지 않았습니다
2. REST 카탈로그 서비스가 완전히 초기화되지 않았습니다
3. 샘플 데이터 로딩 과정이 완료되지 않았습니다

Spark 로그를 통해 테이블 생성 진행 상태를 확인할 수 있습니다:

```bash
docker-compose logs spark
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
ClickHouse는 둘 이상의 네임스페이스를 지원하지 않으므로 백틱(`)을 사용해야 합니다.
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
│ ENGINE = Iceberg('http://minio:9000/lakehouse/warehouse/default/taxis/', 'admin', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```


## 데이터 레이크에서 ClickHouse로 데이터 적재하기 \{#loading-data-from-your-data-lake-into-clickhouse\}

REST 카탈로그에서 ClickHouse로 데이터를 적재해야 하는 경우, 먼저 로컬 ClickHouse 테이블을 생성해야 합니다:

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

그런 다음 `INSERT INTO SELECT`을 사용하여 REST 카탈로그 테이블에서 데이터를 로드합니다:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
