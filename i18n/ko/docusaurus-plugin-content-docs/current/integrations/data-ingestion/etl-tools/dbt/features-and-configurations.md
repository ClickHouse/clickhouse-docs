---
sidebar_label: '기능 및 구성'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: '제공되는 기능과 일반 구성에 대한 설명'
keywords: ['clickhouse', 'dbt', 'features']
title: '기능 및 구성'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 기능 및 설정 \{#features-and-configurations\}

<ClickHouseSupportedBadge/>

이 섹션에서는 ClickHouse와 함께 dbt에서 사용할 수 있는 일부 기능에 대해 설명합니다.

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Profile.yml 구성 \{#profile-yml-configurations\}

dbt에서 ClickHouse에 연결하려면 `profiles.yml` 파일에 [프로필](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles)을 추가해야 합니다. ClickHouse 프로필의 구문은 다음과 같습니다:

```yaml
your_profile_name:
  target: dev
  outputs:
    dev:
      type: clickhouse

      # Optional
      schema: [default] # ClickHouse database for dbt models
      driver: [http] # http or native.  If not set this will be autodetermined based on port setting
      host: [localhost] 
      port: [8123]  # If not set, defaults to 8123, 8443, 9000, 9440 depending on the secure and driver settings 
      user: [default] # User for all database operations
      password: [<empty string>] # Password for the user
      cluster: [<empty string>] # If set, certain DDL/table operations will be executed with the `ON CLUSTER` clause using this cluster. Distributed materializations require this setting to work. See the following ClickHouse Cluster section for more details.
      verify: [True] # Validate TLS certificate if using TLS/SSL
      secure: [False] # Use TLS (native protocol) or HTTPS (http protocol)
      client_cert: [null] # Path to a TLS client certificate in .pem format
      client_cert_key: [null] # Path to the private key for the TLS client certificate
      retries: [1] # Number of times to retry a "retriable" database exception (such as a 503 'Service Unavailable' error)
      compression: [<empty string>] # Use gzip compression if truthy (http), or compression type for a native connection
      connect_timeout: [10] # Timeout in seconds to establish a connection to ClickHouse
      send_receive_timeout: [300] # Timeout in seconds to receive data from the ClickHouse server
      cluster_mode: [False] # Use specific settings designed to improve operation on Replicated databases (recommended for ClickHouse Cloud)
      use_lw_deletes: [False] # Use the strategy `delete+insert` as the default incremental strategy.
      check_exchange: [True] # Validate that clickhouse support the atomic EXCHANGE TABLES command.  (Not needed for most ClickHouse versions)
      local_suffix: [_local] # Table suffix of local tables on shards for distributed materializations.
      local_db_prefix: [<empty string>] # Database prefix of local tables on shards for distributed materializations. If empty, it uses the same database as the distributed table.
      allow_automatic_deduplication: [False] # Enable ClickHouse automatic deduplication for Replicated tables
      tcp_keepalive: [False] # Native client only, specify TCP keepalive configuration. Specify custom keepalive settings as [idle_time_sec, interval_sec, probes].
      custom_settings: [{}] # A dictionary/mapping of custom ClickHouse settings for the connection - default is empty.
      database_engine: '' # Database engine to use when creating new ClickHouse schemas (databases).  If not set (the default), new databases will use the default ClickHouse database engine (usually Atomic).
      threads: [1] # Number of threads to use when running queries. Before setting it to a number higher than 1, make sure to read the [read-after-write consistency](#read-after-write-consistency) section.
      
      # Native (clickhouse-driver) connection settings
      sync_request_timeout: [5] # Timeout for server ping
      compress_block_size: [1048576] # Compression block size if compression is enabled
```


### 스키마와 데이터베이스 비교 \{#schema-vs-database\}

dbt 모델 relation 식별자 `database.schema.table`은(는) ClickHouse와 호환되지 않습니다. ClickHouse가
`schema`를 지원하지 않기 때문입니다.
따라서 `schema.table` 형태의 단순화된 방식을 사용하며, 여기에서 `schema`는 ClickHouse 데이터베이스를 의미합니다. `default` 데이터베이스 사용은 권장되지 않습니다.

### SET 구문 경고 \{#set-statement-warning\}

많은 환경에서, 모든 DBT 쿼리에 걸쳐 ClickHouse 설정을 유지하기 위해 `SET` 구문을 사용하는 방식은 신뢰하기 어렵고
예기치 않은 실패를 유발할 수 있습니다. 이는 특히 로드 밸런서를 통해 HTTP 연결을 사용하여 쿼리를 여러 노드에 분산하는
구성(예: ClickHouse Cloud)을 사용할 때 두드러지지만, 일부 상황에서는 네이티브 ClickHouse 연결에서도 발생할 수 있습니다.
따라서 사전 훅(pre-hook)에서의 "SET" 구문에 의존하는 대신, 모범 사례로서 필요한 ClickHouse 설정은
DBT 프로필의 "custom_settings" 속성에 구성할 것을 권장합니다.

### `quote_columns` 설정 \{#setting-quote_columns\}

경고 메시지가 발생하지 않도록 `dbt_project.yml`에서 `quote_columns` 값을 명시적으로 지정해야 합니다. 자세한 내용은 [quote&#95;columns 문서](https://docs.getdbt.com/reference/resource-configs/quote_columns)를 참고하십시오.

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```


### ClickHouse 클러스터 소개 \{#about-the-clickhouse-cluster\}

ClickHouse 클러스터를 사용할 때에는 다음 두 가지를 고려해야 합니다.

- `cluster` 설정을 지정합니다.
- 특히 `threads` 값을 2개 이상으로 사용하는 경우, 쓰기 후 읽기(read-after-write) 일관성이 보장되도록 합니다.

#### 클러스터 설정 \{#cluster-setting\}

프로필의 `cluster` 설정을 사용하면 dbt-clickhouse가 ClickHouse 클러스터를 대상으로 실행되도록 설정할 수 있습니다. 프로필에 `cluster`가 설정되어 있으면 **Replicated 엔진을 사용하는 모델을 제외한 모든 모델이 기본적으로 `ON CLUSTER` 절과 함께 생성됩니다.** 여기에는 다음이 포함됩니다:

* 데이터베이스 생성
* 뷰 구체화
* 테이블 및 증분 구체화
* Distributed 구체화

Replicated 엔진은 내부적으로 복제를 관리하도록 설계되었기 때문에 `ON CLUSTER` 절을 **포함하지 않습니다.**

특정 모델에 대해 클러스터 기반 생성을 **사용하지 않도록(opt out)** 하려면 `disable_on_cluster` 설정을 추가하십시오:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

레플리카가 없는 비복제(non-replicated) 엔진을 사용하는 테이블 및 incremental materialization은 `cluster` 설정의 영향을 받지 않습니다
(모델은 연결된 노드에서만 생성됩니다).

**호환성**

모델이 `cluster` 설정 없이 생성된 경우, dbt-clickhouse는 이를 감지하여 이 모델에 대해서는 모든 DDL/DML을
`on cluster` 절 없이 실행합니다.


#### 쓰기 후 읽기 일관성 \{#read-after-write-consistency\}

dbt는 쓰기 후 읽기(삽입 후 읽기) 일관성 모델에 의존합니다. 모든 작업이 항상 동일한 레플리카로 전달된다는 보장을 할 수 없다면, 이는 두 개 이상의 레플리카를 가진 ClickHouse 클러스터와는 호환되지 않습니다. 일반적인 dbt 사용에서는 문제가 발생하지 않을 수 있지만, 클러스터에 따라 이러한 보장을 확보하기 위한 몇 가지 전략을 사용할 수 있습니다:

- ClickHouse Cloud 클러스터를 사용하는 경우, 프로필의 `custom_settings` 속성에 `select_sequential_consistency: 1`만 설정하면 됩니다. 이 설정에 대한 상세 내용은 [여기](/operations/settings/settings#select_sequential_consistency)에서 확인할 수 있습니다.
- 자가 호스팅 클러스터를 사용하는 경우, 모든 dbt 요청이 동일한 ClickHouse 레플리카로 전송되도록 해야 합니다. 그 위에 로드 밸런서를 사용하는 경우, 항상 동일한 레플리카에 도달할 수 있도록 `replica aware routing`/`sticky sessions` 메커니즘 사용을 고려하십시오. ClickHouse Cloud 외부의 클러스터에서 `select_sequential_consistency = 1` 설정을 추가하는 것은 [권장되지 않습니다](/operations/settings/settings#select_sequential_consistency).

## 추가적인 ClickHouse 매크로 \{#additional-clickhouse-macros\}

### 모델 머티리얼라이제이션 유틸리티 매크로 \{#model-materialization-utility-macros\}

다음 매크로들은 ClickHouse 전용 테이블과 뷰를 생성하는 작업을 쉽게 하기 위해 포함합니다.

- `engine_clause` -- `engine` 모델 구성 속성을 사용해 ClickHouse 테이블 엔진을 지정합니다. dbt-clickhouse는
  기본적으로 `MergeTree` 엔진을 사용합니다.
- `partition_cols` -- `partition_by` 모델 구성 속성을 사용해 ClickHouse 파티션 키를 지정합니다. 기본적으로는
  파티션 키가 지정되지 않습니다.
- `order_cols` -- `order_by` 모델 구성 속성을 사용해 ClickHouse ORDER BY/정렬 키를 지정합니다. 지정하지 않으면
  ClickHouse는 빈 tuple()을 사용하며, 테이블은 정렬되지 않은 상태로 유지됩니다.
- `primary_key_clause` -- `primary_key` 모델 구성 속성을 사용해 ClickHouse 기본 키를 지정합니다. 기본적으로
  기본 키가 설정되며, ClickHouse는 ORDER BY 절을 기본 키로 사용합니다.
- `on_cluster_clause` -- `cluster` 프로필 속성을 사용해 특정 dbt 작업(분산 머티리얼라이제이션, 뷰 생성,
  데이터베이스 생성)에 `ON CLUSTER` 절을 추가합니다.
- `ttl_config` -- `ttl` 모델 구성 속성을 사용해 ClickHouse 테이블 TTL 표현식을 지정합니다. 기본적으로는
  TTL이 지정되지 않습니다.

### s3Source helper macro \{#s3source-helper-macro\}

`s3source` 매크로는 ClickHouse S3 테이블 함수를 사용하여 S3에서 ClickHouse 데이터를 직접 조회하는 과정을 단순화합니다. 이 매크로는
이름이 `s3`로 끝나는 구성 딕셔너리에서 S3 테이블 함수의 매개변수를 채워 동작합니다. 매크로는 먼저 프로필의 `vars`에서 딕셔너리를
검색한 다음, 모델 구성에서 검색합니다. 이 딕셔너리에는 S3 테이블 함수의 매개변수를 채우기 위해 사용하는 다음 키들을 포함할 수 있습니다:

| Argument Name         | Description                                                                                                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`와 같은 버킷 기본 URL입니다. 프로토콜이 제공되지 않으면 `https://`로 간주합니다.                                          |
| path                  | `/trips_4.gz`와 같은 테이블 쿼리에 사용할 S3 경로입니다. S3 와일드카드를 지원합니다.                                                                                                          |
| fmt                   | 참조되는 S3 오브젝트의 예상 ClickHouse 입력 포맷입니다(예: `TSV`, `CSVWithNames`).                                                                                                           |
| structure             | 버킷 내 데이터의 컬럼 구조로, `['id UInt32', 'date DateTime', 'value String']`와 같은 이름/데이터 타입 쌍의 목록입니다. 제공되지 않으면 ClickHouse가 구조를 자동으로 추론합니다.              |
| aws_access_key_id     | S3 액세스 키 ID입니다.                                                                                                                                                                       |
| aws_secret_access_key | S3 시크릿 키입니다.                                                                                                                                                                          |
| role_arn              | S3 오브젝트에 안전하게 액세스하기 위해 사용할 ClickhouseAccess IAM 역할의 ARN입니다. 자세한 내용은 이 [문서](/cloud/data-sources/secure-s3)를 참고하십시오.                                   |
| compression           | S3 오브젝트에 사용된 압축 방식입니다. 제공되지 않으면 ClickHouse가 파일 이름을 기준으로 압축 방식을 판별하려고 시도합니다.                                                                  |

이 매크로 사용 예시는
[S3 테스트 파일](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)을
참고하십시오.

### 데이터베이스 간 매크로 지원 \{#cross-database-macro-support\}

dbt-clickhouse는 현재 `dbt Core`에 포함된 대부분의 데이터베이스 간 매크로를 지원하지만, 다음과 같은 예외 사항이 있습니다:

* `split_part` SQL 함수는 ClickHouse에서 `splitByChar` 함수로 구현됩니다. 이 함수에서는 「split」 구분 기호에 상수 문자열을 사용해야 하므로, 이 매크로에 사용되는 `delimeter` 매개변수는 컬럼 이름이 아니라 문자열 리터럴로 해석됩니다.
* 마찬가지로, ClickHouse의 `replace` SQL 함수는 `old_chars` 및 `new_chars` 매개변수에 상수 문자열을 요구하므로, 이 매크로를 호출할 때 해당 매개변수는 컬럼 이름이 아닌 문자열 리터럴로 해석됩니다.

## 카탈로그 지원 \{#catalog-support\}

### dbt 카탈로그 통합 상태 \{#dbt-catalog-integration-status\}

dbt Core v1.10에서는 카탈로그 통합 지원이 도입되어, 어댑터가 Apache Iceberg와 같은 오픈 테이블 형식을 관리하는 외부 카탈로그에 모델을 구체화할 수 있습니다. **이 기능은 아직 dbt-clickhouse에 기본적으로 구현되어 있지 않습니다.** 이 기능의 구현 진행 상황은 [GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489)에서 확인할 수 있습니다.

### ClickHouse 카탈로그 지원 \{#clickhouse-catalog-support\}

ClickHouse에는 최근 Apache Iceberg 테이블과 데이터 카탈로그에 대한 네이티브 지원이 추가되었습니다. 대부분의 기능은 아직 `experimental` 상태이지만, 최신 ClickHouse 버전을 사용 중이라면 이미 사용할 수 있습니다.

* ClickHouse에서 [Iceberg table engine](/engines/table-engines/integrations/iceberg)과 [iceberg table function](/sql-reference/table-functions/iceberg)을 사용하여 **객체 스토리지(S3, Azure Blob Storage, Google Cloud Storage)에 저장된 Iceberg 테이블을 쿼리**할 수 있습니다.

* 또한 ClickHouse는 [DataLakeCatalog database engine](/engines/database-engines/datalakecatalog)을 제공하며, 이를 통해 AWS Glue Catalog, Databricks Unity Catalog, Hive Metastore, REST 카탈로그를 포함한 **외부 데이터 카탈로그에 연결**할 수 있습니다. 이를 사용하면 데이터 중복 저장 없이 외부 카탈로그에서 Iceberg, Delta Lake와 같은 오픈 테이블 포맷(open table format) 데이터를 직접 쿼리할 수 있습니다.

### Iceberg 및 카탈로그 사용을 위한 우회 방법 \{#workarounds-iceberg-catalogs\}

위에서 정의한 도구를 사용해 ClickHouse 클러스터에 이미 Iceberg 테이블 또는 카탈로그를 만들어 둔 경우, dbt 프로젝트에서 해당 Iceberg 테이블이나 카탈로그의 데이터를 읽을 수 있습니다. dbt의 `source` 기능을 활용하여 이러한 테이블을 dbt 프로젝트에서 참조할 수 있습니다. 예를 들어 REST 카탈로그의 테이블에 접근하려면 다음과 같이 하면 됩니다.

1. **외부 카탈로그를 가리키는 데이터베이스를 생성합니다.**

```sql
-- Example with REST Catalog
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE iceberg_catalog
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

2. **dbt에서 카탈로그 데이터베이스와 해당 테이블을 소스로 정의합니다:** 테이블은 이미 ClickHouse에 존재하고 있어야 합니다

```yaml
version: 2

sources:
  - name: external_catalog
    database: iceberg_catalog
    tables:
      - name: orders
      - name: customers
```

3. **dbt 모델에서 카탈로그 테이블을 사용하십시오.**

```sql
SELECT 
    o.order_id,
    c.customer_name,
    o.order_date
FROM {{ source('external_catalog', 'orders') }} o
INNER JOIN {{ source('external_catalog', 'customers') }} c
    ON o.customer_id = c.customer_id
```


### 우회 방법에 대한 참고 사항 \{#benefits-workarounds\}

이 우회 방법의 장점은 다음과 같습니다:

* dbt 네이티브 카탈로그 통합을 기다리지 않고도 다양한 외부 테이블 유형과 외부 카탈로그를 즉시 사용할 수 있습니다.
* 네이티브 카탈로그 지원이 제공되면 원활하게 마이그레이션할 수 있습니다.

하지만 현재 다음과 같은 제한 사항이 있습니다:

* **수동 설정:** Iceberg 테이블과 카탈로그 데이터베이스는 dbt에서 참조하기 전에 ClickHouse에서 수동으로 생성해야 합니다.
* **카탈로그 수준 DDL 없음:** dbt는 외부 카탈로그에서 Iceberg 테이블을 생성하거나 삭제하는 등의 카탈로그 수준 작업을 관리할 수 없습니다. 따라서 현재는 dbt 커넥터에서 이러한 작업을 수행할 수 없습니다. Iceberg() 엔진으로 테이블을 생성하는 기능은 향후 추가될 수 있습니다.
* **쓰기 작업:** 현재 Iceberg/Data Catalog 테이블로의 쓰기 작업은 제한적으로만 지원됩니다. 어떤 옵션이 제공되는지 확인하려면 ClickHouse 문서를 참조하십시오.