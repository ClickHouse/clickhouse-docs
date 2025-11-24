---
'sidebar_label': '기능 및 구성'
'slug': '/integrations/dbt/features-and-configurations'
'sidebar_position': 2
'description': 'ClickHouse와 함께 dbt를 사용하는 기능'
'keywords':
- 'clickhouse'
- 'dbt'
- 'features'
'title': '기능 및 구성'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Features and Configurations

<ClickHouseSupportedBadge/>

이 섹션에서는 ClickHouse와 함께 사용할 수 있는 dbt의 몇 가지 기능에 대한 문서를 제공합니다.

<TOCInline toc={toc}  maxHeadingLevel={3} />
## Profile.yml configurations {#profile-yml-configurations}

dbt에서 ClickHouse에 연결하려면 `profiles.yml` 파일에 [프로필](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles)을 추가해야 합니다. ClickHouse 프로필은 다음 구문을 따릅니다:

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
### Schema vs Database {#schema-vs-database}

dbt 모델 관계 식별자인 `database.schema.table`은 ClickHouse와 호환되지 않습니다. ClickHouse는 `schema`를 지원하지 않기 때문입니다. 따라서 `schema`가 ClickHouse 데이터베이스인 간소화된 접근법인 `schema.table`을 사용합니다. `default` 데이터베이스를 사용하는 것은 권장되지 않습니다.
### SET Statement Warning {#set-statement-warning}

많은 환경에서, ClickHouse 설정을 모든 DBT 쿼리에서 지속적으로 적용하기 위해 SET 문을 사용하는 것은 신뢰할 수 없으며 예상치 못한 실패를 초래할 수 있습니다. 이는 특히 부하 분산기를 통해 HTTP 연결을 사용할 때 발생하며, 이 경우 쿼리가 여러 노드(예: ClickHouse 클라우드)에 분산되기 때문입니다. 하지만 일부 상황에서는 기본 ClickHouse 연결에서도 발생할 수 있습니다. 따라서 일반적으로 사전 후크 "SET" 문에 의존하는 대신, DBT 프로필의 "custom_settings" 속성에 필요한 ClickHouse 설정을 구성하는 것이 모범 사례로 권장됩니다.
### Setting `quote_columns` {#setting-quote_columns}

경고를 방지하려면 `dbt_project.yml`의 `quote_columns`에 대해 명시적으로 값을 설정해야 합니다. 자세한 내용은 [quote_columns 문서](https://docs.getdbt.com/reference/resource-configs/quote_columns)를 참조하세요.

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```
### About the ClickHouse Cluster {#about-the-clickhouse-cluster}

ClickHouse 클러스터를 사용할 때 고려해야 할 두 가지 사항이 있습니다:
- `cluster` 설정.
- 특히 두 개 이상의 `threads`를 사용하는 경우, 쓰기 후 읽기 일관성 보장.

#### Cluster Setting {#cluster-setting}

프로필의 `cluster` 설정은 dbt-clickhouse가 ClickHouse 클러스터에서 실행될 수 있도록 합니다. 프로필에서 `cluster`가 설정되면 **모든 모델은 기본적으로 `ON CLUSTER` 절로 생성됩니다.** 단, **Replicated** 엔진을 사용하는 모델은 제외됩니다. 여기에는 다음이 포함됩니다:

- 데이터베이스 생성
- 뷰 물리화
- 테이블 및 증분 물리화
- 분산 물리화

복제 엔진은 복제를 내부적으로 관리하도록 설계되었기 때문에 `ON CLUSTER` 절을 포함하지 않습니다.

특정 모델의 클러스터 기반 생성을 **비활성화**하려면 `disable_on_cluster` 구성을 추가합니다:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

비복제 엔진의 테이블 및 증분 물리화는 `cluster` 설정의 영향을 받지 않으며 (모델은 연결된 노드에서만 생성됨).

**호환성**

모델이 `cluster` 설정 없이 생성된 경우, dbt-clickhouse는 이 상황을 감지하고 이 모델에 대해 모든 DDL/DML을 `on cluster` 절 없이 실행합니다.
#### Read-after-write Consistency {#read-after-write-consistency}

dbt는 쓰기 후 읽기 일관성 모델에 의존합니다. 이는 단일 복제를 보장할 수 없는 경우 여러 복제본이 있는 ClickHouse 클러스터와는 호환되지 않습니다. dbt를 사용할 때 문제를 Encounter하지 않을 수 있지만, 이러한 보장을 마련하기 위한 몇 가지 전략이 있습니다:
- ClickHouse Cloud 클러스터를 사용하는 경우 프로필의 `custom_settings` 속성에 `select_sequential_consistency: 1`을 설정하면 됩니다. 이 설정에 대한 자세한 내용은 [여기](https://clickhouse.com/docs/operations/settings/settings#select_sequential_consistency)를 참조하세요.
- 자체 호스팅 클러스터를 사용하는 경우 모든 dbt 요청이 동일한 ClickHouse 복제본으로 전송되도록 하십시오. 부하 분산기가 있는 경우, 항상 동일한 복제본에 도달할 수 있도록 `replica aware routing` / `sticky sessions` 메커니즘을 사용하는 것이 좋습니다. ClickHouse Cloud 이외의 클러스터에서는 `select_sequential_consistency = 1` 설정을 추가하는 것은 [권장되지 않습니다](https://clickhouse.com/docs/operations/settings/settings#select_sequential_consistency).
## General information about features {#general-information-about-features}
### General table configurations {#general-table-configurations}

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine                 | 테이블 생성 시 사용할 테이블 엔진(테이블 유형)                                                                                                                                                                                                                                                         | `MergeTree()`  |
| order_by               | 컬럼 이름 또는 임의 표현의 튜플입니다. 이를 통해 데이터를 더 빠르게 찾는데 도움이 되는 작은 스파스 인덱스를 생성할 수 있습니다.                                                                                                                                                                                        | `tuple()`      |
| partition_by           | 파티션은 지정된 기준에 따라 테이블의 레코드를 논리적으로 조합한 것입니다. 파티션 키는 테이블 컬럼의 모든 표현이 될 수 있습니다.                                                                                                                                                                 |                |
| sharding_key           | 샤딩 키는 분산 엔진 테이블에 데이터를 삽입할 때 목적지 서버를 결정합니다. 샤딩 키는 무작위이거나 해시 함수의 결과로 사용할 수 있습니다.                                                                                                                                                      | `rand()`      |
| primary_key            | order_by와 같은 ClickHouse 기본 키 표현입니다. 지정하지 않으면 ClickHouse는 order by 표현을 기본 키로 사용합니다.                                                                                                                                                                                |                |
| unique_key             | 행을 고유하게 식별하는 컬럼 이름의 튜플입니다. 증분 모델 업데이트에 사용됩니다.                                                                                                                                                                                                                      |                |
| settings               | 이 모델과 함께 'CREATE TABLE'과 같은 DDL 문에 사용할 수 있는 "TABLE" 설정의 맵/사전입니다.                                                                                                                                                                                                                |                |
| query_settings         | 이 모델과 함께 `INSERT` 또는 `DELETE` 문에서 사용할 수 있는 ClickHouse 사용자 수준 설정의 맵/사전입니다.                                                                                                                                                                                    |                |
| ttl                    | 테이블과 함께 사용할 TTL 표현입니다. TTL 표현은 테이블에 대한 TTL을 지정하는 데 사용할 수 있는 문자열입니다.                                                                                                                                                                                       |                |
| indexes                | 생성할 [데이터 스킵 인덱스 목록](/optimize/skipping-indexes)입니다. 더 많은 정보는 아래를 참조하세요.                                                                                                                                                        |                |
| sql_security           | 뷰의 기본 쿼리를 실행할 ClickHouse 사용자를 지정할 수 있도록 합니다. `SQL SECURITY`는 [두 개의 법적 값](/sql-reference/statements/create/view#sql_security): `definer` `invoker`를 가집니다.                                                                             |                |
| definer                | `sql_security`가 `definer`로 설정된 경우, 기존 사용자 또는 `CURRENT_USER`를 `definer` 절에 지정해야 합니다.                                                                                                                                                                                             |                |
| projections            | 생성할 [프로젝션 목록](/data-modeling/projections)입니다. 자세한 내용은 [About projections](#projections)를 참조하세요.                                                                                                                                                        |                |
#### About data skipping indexes {#data-skipping-indexes}

데이터 스킵 인덱스는 `table` 물리화에만 사용할 수 있습니다. 테이블에 데이터 스킵 인덱스 목록을 추가하려면 `indexes` 구성을 사용하세요:

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```
#### About projections {#projections}

`table` 및 `distributed_table` 물리화에 `projections` 구성을 사용하여 [프로젝션](/data-modeling/projections)을 추가할 수 있습니다:

```sql
{{ config(
       materialized='table',
       projections=[
           {
               'name': 'your_projection_name',
               'query': 'SELECT department, avg(age) AS avg_age GROUP BY department'
           }
       ]
) }}
```
**Note**: 분산 테이블의 경우 프로젝션은 `_local` 테이블에 적용되며 분산 프록시 테이블에는 적용되지 않습니다.
### Supported table engines {#supported-table-engines}

| Type                   | Details                                                                                   |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (default)    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |
### Experimental supported table engines {#experimental-supported-table-engines}

| Type              | Details                                                                   |
|-------------------|---------------------------------------------------------------------------|
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

위에 언급한 엔진 중 하나를 사용하여 dbt에서 ClickHouse에 연결할 때 문제가 발생하면 [여기](https://github.com/ClickHouse/dbt-clickhouse/issues)에서 문제를 신고해 주세요.
### A note on model settings {#a-note-on-model-settings}

ClickHouse에는 여러 유형/수준의 "settings"가 있습니다. 위 모델 구성에서 구성할 수 있는 두 가지 유형이 있습니다. `settings`는 `CREATE TABLE/VIEW` 유형의 DDL 문에서 사용되는 `SETTINGS` 절을 의미합니다. 따라서 이는 일반적으로 특정 ClickHouse 테이블 엔진에 특정한 설정입니다. 새로운 `query_settings`는 모델 물리화에 사용되는 `INSERT` 및 `DELETE` 쿼리에 `SETTINGS` 절을 추가하는 데 사용됩니다 (증분 물리화 포함). ClickHouse 설정은 수백 가지가 있으며, "table" 설정과 "user" 설정이 어떤 것인지 항상 명확하지 않은 경우가 있습니다(후자는 일반적으로 `system.settings` 테이블에서 사용할 수 있습니다). 일반적으로 기본값을 사용하는 것이 권장되며, 이러한 속성을 사용하는 경우 신중하게 조사하고 테스트해야 합니다.
### Column Configuration {#column-configuration}

> **_NOTE:_** 아래의 컬럼 구성 옵션은 [모델 계약](https://docs.getdbt.com/docs/collaborate/govern/model-contracts)을 시행해야 합니다.

| Option | Description                                                                                                                                                | Default if any |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | 컬럼 DDL에서 `CODEC()`에 전달되는 인수로 구성된 문자열입니다. 예: `codec: "Delta, ZSTD"`는 `CODEC(Delta, ZSTD)`로 컴파일됩니다.    |    
| ttl    | 컬럼 DDL에서의 TTL(시간 제한) 규칙을 정의하는 [TTL 표현](https://clickhouse.com/docs/guides/developer/ttl)으로 구성된 문자열입니다. 예: `ttl: ts + INTERVAL 1 DAY`는 `TTL ts + INTERVAL 1 DAY`로 컴파일됩니다. |
#### Example of schema configuration {#example-of-schema-configuration}

```yaml
models:
  - name: table_column_configs
    description: 'Testing column-level configurations'
    config:
      contract:
        enforced: true
    columns:
      - name: ts
        data_type: timestamp
        codec: ZSTD
      - name: x
        data_type: UInt8
        ttl: ts + INTERVAL 1 DAY
```
#### Adding complex types {#adding-complex-types}

dbt는 SQL을 분석하여 각 컬럼의 데이터 유형을 자동으로 결정합니다. 그러나 특정 경우에 이 프로세스가 데이터 유형을 정확하게 결정하지 못하여 계약 `data_type` 속성에 지정된 유형과 충돌할 수 있습니다. 이를 해결하기 위해 우리는 모델 SQL에서 원하는 유형을 명시적으로 정의하기 위해 `CAST()` 함수를 사용하는 것을 권장합니다. 예를 들어:

```sql
{{
    config(
        materialized="materialized_view",
        engine="AggregatingMergeTree",
        order_by=["event_type"],
    )
}}

select
  -- event_type may be infered as a String but we may prefer LowCardinality(String):
  CAST(event_type, 'LowCardinality(String)') as event_type,
  -- countState() may be infered as `AggregateFunction(count)` but we may prefer to change the type of the argument used:
  CAST(countState(), 'AggregateFunction(count, UInt32)') as response_count, 
  -- maxSimpleState() may be infered as `SimpleAggregateFunction(max, String)` but we may prefer to also change the type of the argument used:
  CAST(maxSimpleState(event_type), 'SimpleAggregateFunction(max, LowCardinality(String))') as max_event_type
from {{ ref('user_events') }}
group by event_type
```
## Features {#features}
### Materialization: view {#materialization-view}

dbt 모델은 [ClickHouse 뷰](https://clickhouse.com/docs/en/sql-reference/table-functions/view/)로 생성할 수 있으며 다음 구문을 사용하여 구성됩니다:

프로젝트 파일 (`dbt_project.yml`):
```yaml
models:
  <resource-path>:
    +materialized: view
```

또는 구성 블록 (`models/<model_name>.sql`):
```python
{{ config(materialized = "view") }}
```
### Materialization: table {#materialization-table}

dbt 모델은 [ClickHouse 테이블](https://clickhouse.com/docs/en/operations/system-tables/tables/)로 생성할 수 있으며
다음 구문을 사용하여 구성됩니다:

프로젝트 파일 (`dbt_project.yml`):
```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

또는 구성 블록 (`models/<model_name>.sql`):
```python
{{ config(
    materialized = "table",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
      ...
    ]
) }}
```
### Materialization: incremental {#materialization-incremental}

테이블 모델은 각 dbt 실행에 대해 재구성됩니다. 이는 더 큰 결과 집합이나 복잡한 변환의 경우 실행 불가능할 수 있으며 매우 비용이 많이 들 수 있습니다. 이러한 도전을 해결하고 빌드 시간을 줄이기 위해, dbt 모델은 증분 ClickHouse 테이블로 생성될 수 있으며 다음 구문을 사용하여 구성됩니다:

`dbt_project.yml`의 모델 정의:
```yaml
models:
  <resource-path>:
    +materialized: incremental
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
    +unique_key: [ <column-name>, ... ]
    +inserts_only: [ True|False ]
```

또는 `models/<model_name>.sql`의 구성 블록:
```python
{{ config(
    materialized = "incremental",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
    unique_key = [ "<column-name>", ... ],
    inserts_only = [ True|False ],
      ...
    ]
) }}
```
#### Configurations {#configurations}
이 물리화 유형에 특정한 구성은 아래에 나열되어 있습니다.

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | 행을 고유하게 식별하는 컬럼 이름의 튜플입니다. 고유성 제약 조건에 대한 자세한 내용은 [여기](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)를 참조하세요.                                                                                       | 필수. 제공되지 않으면 변경된 행이 증분 테이블에 두 번 추가됩니다. |
| `inserts_only`           | `append` 증분 `strategy`의 혜택을 위해 더 이상 사용되지 않으며, 동일한 방식으로 작동합니다. 증분 모델에 대해 True로 설정하면 증분 업데이트가 중간 테이블을 생성하지 않고 대상 테이블에 직접 삽입됩니다. `inserts_only`가 설정되면 `incremental_strategy`는 무시됩니다. | 선택적 (기본값: `False`)                                                          |
| `incremental_strategy`   | 증분 물리화를 위해 사용할 전략입니다. `delete+insert`, `append`, `insert_overwrite`, 또는 `microbatch`가 지원됩니다. 추가 전략에 대한 자세한 내용은 [여기](/integrations/dbt/features-and-configurations#incremental-model-strategies)에서 확인하시기 바랍니다. | 선택적 (기본값: 'default')                                                        |
| `incremental_predicates` | 증분 물리화에 적용될 추가 조건입니다 (단지 `delete+insert` 전략에만 적용됨)                                                                                                                                                                                    | 선택적 |
#### Incremental Model Strategies {#incremental-model-strategies}

`dbt-clickhouse`는 세 가지 증분 모델 전략을 지원합니다.
##### The Default (Legacy) Strategy {#default-legacy-strategy}

역사적으로 ClickHouse는 비동기 "변형"의 형태로만 업데이트 및 삭제를 지원했습니다. 기대되는 dbt 동작을 모방하기 위해, dbt-clickhouse는 기본적으로 영향을 받지 않은(삭제되지 않음, 변경되지 않음) "구형" 레코드와 새로운 또는 업데이트된 모든 레코드를 포함하는 새로운 임시 테이블을 생성하고, 이 임시 테이블을 기존 증분 모델 관계와 교환합니다. 이는 원래 관계를 보존하는 유일한 전략이지만, 원래 테이블의 전체 복사본을 포함하기 때문에 수행 시 상당한 비용이 들고 느릴 수 있습니다.
##### The Delete+Insert Strategy {#delete-insert-strategy}

ClickHouse는 버전 22.8에서 "경량 삭제"를 실험적 기능으로 추가했습니다. 경량 삭제는 ClickHouse 데이터 파트를 다시 작성할 필요가 없기 때문에 `ALTER TABLE ... DELETE` 작업보다 훨씬 빠릅니다. 증분 전략인 `delete+insert`는 경량 삭제를 활용하여 "구형" 전략보다 훨씬 더 잘 수행되는 증분 물리화를 구현합니다. 그러나 이 전략을 사용함에 있어 몇 가지 중요한 경고가 있습니다:

- 경량 삭제는 ClickHouse 서버에서 설정 `allow_experimental_lightweight_delete=1`을 사용하여 활성화해야 하며, 또는 프로필에 `use_lw_deletes=true`를 설정해야 합니다 (이는 dbt 세션에 대해 해당 설정을 활성화합니다).
- 경량 삭제는 이제 프로덕션 준비가 되었지만, ClickHouse 버전 23.3 이전에는 성능 및 기타 문제가 있을 수 있습니다.
- 이 전략은 영향을 받는 테이블/관계에서 직접 작동하므로, 작업 중 문제가 발생하면 증분 모델의 데이터는 유효하지 않은 상태일 수 있습니다.
- 경량 삭제를 사용할 때, dbt-clickhouse는 `allow_nondeterministic_mutations` 설정을 활성화합니다. 드문 경우에는 비결정적 증분 프레데이드를 사용함에 따라 업데이트된/삭제된 항목에 대해 경쟁 조건이 발생할 수 있습니다 (ClickHouse 로그에서 관련 로그 메시지를 볼 수 있습니다). 일관된 결과를 보장하기 위해 증분 프레데이드는 수정되지 않을 데이터에만 서브 쿼리를 포함해야 합니다.
##### The Microbatch Strategy (Requires dbt-core >= 1.9) {#microbatch-strategy}

증분 전략인 `microbatch`는 대규모 시계열 데이터 변환을 효율적으로 처리하도록 설계된 dbt-core 기능입니다. dbt-clickhouse에서, 이는 기존 `delete_insert` 증분 전략 위에 구축되며 `event_time` 및 `batch_size` 모델 구성을 기반으로 증분을 사전 정의된 시계열 배치로 나눕니다.

대규모 변환 처리를 넘어서는 microbatch는 다음 기능을 제공합니다:
- [실패한 배치 재처리](https://docs.getdbt.com/docs/build/incremental-microbatch#retry).
- [병렬 배치 실행 자동 감지](https://docs.getdbt.com/docs/build/parallel-batch-execution).
- [백필링](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)에서 복잡한 조건 논리가 필요없게 만듭니다.

마이크로배치 사용에 대한 자세한 내용은 [공식 문서](https://docs.getdbt.com/docs/build/incremental-microbatch)를 참조하세요.
###### Available Microbatch Configurations {#available-microbatch-configurations}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | "행이 발생한 시점"을 나타내는 컬럼입니다. 마이크로배치 모델 및 필터링되어야 하는 모든 직접 부모에 대해 필수입니다.                                                                                                                                                                                                 |                |
| begin              | 마이크로배치 모델의 "시간의 시작"입니다. 이는 초기 또는 전체 새로 고침 빌드의 시작점입니다. 예를 들어, 2024-10-01에 실행된 일일 그래인 마이크로배치 모델의 begin이 '2023-10-01'이면 366개의 배치를 처리합니다(윤년임!). 오늘의 배치도 포함됩니다.                                                       |                |
| batch_size         | 배치의 세분성입니다. 지원되는 값은 `hour`, `day`, `month`, `year`입니다.                                                                                                                                                                                                                                                   |                |
| lookback           | 최신 책갈피 이전의 X 배치를 처리하여 늦게 도착한 레코드를 캡처합니다.                                                                                                                                                                                                                                                           | 1              |
| concurrent_batches | 배치를 동시에 실행하기 위한 dbt의 자동 감지를 무시합니다. [동시 배치 구성](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)에 대한 자세한 내용을 읽어보십시오. true로 설정하면 배치가 동시에 실행됩니다(병렬). false는 배치를 순차적으로 실행합니다(하나씩). |                |
##### The Append Strategy {#append-strategy}

이 전략은 이전 버전의 dbt-clickhouse에서 `inserts_only` 설정을 대체합니다. 이 접근 방식은 단순히 새로운 행을 기존 관계에 추가합니다. 결과적으로 중복 행은 제거되지 않으며 임시 또는 중간 테이블이 없습니다. 이는 데이터에 중복이 허용된 경우 또는 증분 쿼리 WHERE 절/필터로 제외된 경우 가장 빠른 접근 방식입니다.
##### The insert_overwrite Strategy (Experimental) {#insert-overwrite-strategy}

> [IMPORTANT]  
> 현재 insert_overwrite 전략은 분산 물리화와 완전히 기능하지 않습니다.

이 전략은 다음 단계를 수행합니다:

1. 증분 모델 관계와 동일한 구조의 스테이징(임시) 테이블을 만듭니다: `CREATE TABLE <staging> AS <target>`.
2. 스테이징 테이블에 새로만 생성된 레코드(`SELECT`에 의해 생성됨)를 삽입합니다.
3. 스테이징 테이블에서만 새로운 파티션을 대상 테이블로 교체합니다.

이 접근 방식은 다음과 같은 이점이 있습니다:

- 전체 테이블을 복사하지 않기 때문에 기본 전략보다 빠릅니다.
- INSERT 작업이 성공적으로 완료될 때까지 원래 테이블을 수정하지 않기 때문에 다른 전략보다 안전합니다: 중간 실패가 발생하면 원래 테이블은 수정되지 않습니다.
- 이는 파티션 불변성이라는 데이터 엔지니어링 모범 사례를 구현합니다. 이는 증분 및 병렬 데이터 처리, 롤백 등을 단순화합니다.

이 전략은 모델 구성에 `partition_by`가 설정되어 있어야 합니다. 모델 구성의 다른 전략 특정 매개변수는 무시됩니다.
### Materialization: materialized_view (Experimental) {#materialized-view}

`materialized_view` 물리화는 기존(소스) 테이블에서 `SELECT`해야 합니다. 어댑터가 모델 이름으로 대상 테이블과 이름이 `<model_name>_mv`인 ClickHouse MATERIALIZED VIEW를 생성합니다. PostgreSQL과 달리 ClickHouse 물리화된 뷰는 "정적"이지 않으며(해당 REFRESH 작업이 없습니다). 대신, "삽입 트리거" 역할을 하며, 소스 테이블에 삽입된 행에 대해 뷰 정의의 정의된 `SELECT` "변환"을 사용하여 대상 테이블에 새 행을 삽입합니다. 이 기능을 사용하는 방법에 대한 소개 예시는 [테스트 파일](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)을 참조하세요.

Clickhouse는 동일한 대상 테이블에 여러 물리화된 뷰가 기록할 수 있는 기능을 제공합니다. dbt-clickhouse에서 이를 지원하기 위해, 모델 파일에서 `UNION`을 구성할 수 있으며, 각 물리화된 뷰에 대한 SQL을 `--my_mv_name:begin` 및 `--my_mv_name:end` 형식의 주석으로 감쌀 수 있습니다.

예를 들어, 다음은 모델의 동일한 대상 테이블에 두 개의 물리화된 뷰를 빌드합니다. 물리화된 뷰의 이름은 `<model_name>_mv1` 및 `<model_name>_mv2` 형식을 따릅니다:

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> 중요!
>
> 여러 물리화된 뷰(MV)가 있는 모델을 업데이트할 때, 특히 MV 이름 중 하나를 변경할 때, dbt-clickhouse는 자동으로 구형 MV를 삭제하지 않습니다. 대신, 다음 경고가 발생합니다:
`경고 - 모델 이름 <your model name>과 동일한 패턴을 가진 테이블 <previous table name>가 감지되었지만 이번 실행에서 발견되지 않았습니다. 만약 이전 모델의 일부인 이름이 변경된 mv이라면, 수동으로 삭제하십시오 (!!!)`
#### Data catch-up {#data-catch-up}

현재 물리화된 뷰(MV)를 생성할 때 대상 테이블은 MV가 생성되기 전에 먼저 역사적인 데이터로 채워집니다.

즉, dbt-clickhouse는 처음에 대상 테이블을 생성하고 MV를 위한 정의된 쿼리를 기반으로 역사적인 데이터로 로드합니다. 이 단계를 수행한 후에야 MV가 생성됩니다.

MV 생성 시 역사적인 데이터를 사전 로드하지 않으려면 다음과 같이 catch-up 구성을 False로 설정하여 이 동작을 비활성화할 수 있습니다:

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```
#### Refreshable Materialized Views {#refreshable-materialized-views}

[Refreshable Materialized View](https://clickhouse.com/docs/en/materialized-view/refreshable-materialized-view)를 사용하려면 MV 모델에서 필요에 따라 다음 구성 조정을 해주세요(모든 구성은 refreshable 구성 객체 내부에 설정해야 합니다):

| Option                | Description                                                                                                                                                              | Required | Default Value |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------|
| refresh_interval      | 인터벌 절(필수)                                                                                                                                           | 예       |               |
| randomize             | `RANDOMIZE FOR` 이후에 나타날 무작위화 절입니다.                                                                                                              |          |               |
| append                | True로 설정하면 각 새로 고침이 기존 행을 삭제하지 않고 테이블에 행을 삽입합니다. 삽입은 일반 INSERT SELECT처럼 원자적이지 않습니다.                  |          | False         |
| depends_on            | 새로 고칠 수 있는 mv의 의존성 목록입니다. `{schema}.{view_name}` 형식으로 의존성을 제공해야 합니다.                                               |          |               |
| depends_on_validation | `depends_on`에 제공된 의존성의 존재 여부를 검증합니다. 의존성에 스키마가 포함되어 있지 않은 경우, 스키마 `default`에서 검증이 진행됩니다. |          | False         |

새로 고칠 수 있는 물리화된 뷰에 대한 구성 예시:

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}
```
#### 제한 사항 {#limitations}

* ClickHouse에서 의존성이 있는 새로 고칠 수 있는 물리화된 뷰(MV)를 생성할 때, 지정된 의존성이 생성 시점에 존재하지 않더라도 ClickHouse는 오류를 발생시키지 않습니다. 대신, 새로 고칠 수 있는 MV는 비활성 상태로 남아 있으며, 업데이트를 처리하거나 새로 고침을 시작하기 전에 의존성이 충족되기를 기다립니다. 이 동작은 설계된 것이지만, 필요한 의존성이 신속하게 해결되지 않으면 데이터 가용성에 지연이 발생할 수 있습니다. 사용자는 새로 고칠 수 있는 물리화된 뷰를 생성하기 전에 모든 의존성이 정확하게 정의되고 존재하는지 확인해야 합니다.
* 오늘 기준으로 mv와 그 의존성 간에는 실제 "dbt 링크"가 존재하지 않으므로 생성 순서는 보장되지 않습니다.
* 여러 mv가 동일한 대상 모델로 지시하는 경우 새로 고침 기능은 테스트되지 않았습니다.
### 물리화: 딕셔너리 (실험적) {#materialization-dictionary}

ClickHouse 딕셔너리의 물리화를 구현하는 방법에 대한 예시는 https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py의 테스트를 참조하십시오.
### 물리화: 분산 테이블 (실험적) {#materialization-distributed-table}

다음 단계로 생성된 분산 테이블:

1. 올바른 구조를 가져오기 위한 SQL 쿼리로 임시 뷰를 생성합니다.
2. 뷰 기반의 빈 로컬 테이블을 생성합니다.
3. 로컬 테이블을 기반으로 분산 테이블을 생성합니다.
4. 데이터는 분산 테이블에 삽입되며, 중복 없이 샤드에 걸쳐 분산됩니다.

참고:
- dbt-clickhouse 쿼리는 이제 `insert_distributed_sync = 1` 설정을 자동으로 포함하여 하위 증분 물리화 작업이 올바르게 실행되도록 합니다. 이로 인해 일부 분산 테이블 삽입이 예상보다 느리게 실행될 수 있습니다.
#### 분산 테이블 모델 예제 {#distributed-table-model-example}

```sql
{{
    config(
        materialized='distributed_table',
        order_by='id, created_at',
        sharding_key='cityHash64(id)',
        engine='ReplacingMergeTree'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```
#### 생성된 마이그레이션 {#distributed-table-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at)
    SETTINGS index_granularity = 8192;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```
### 물리화: 분산 증분 (실험적) {#materialization-distributed-incremental}

분산 테이블과 동일한 아이디어를 기반으로 하는 증분 모델로, 주요 어려움은 모든 증분 전략을 올바르게 처리하는 것입니다.

1. _첨가 전략_은 분산 테이블에 데이터를 삽입합니다.
2. _삭제+삽입 전략_은 모든 샤드에서 모든 데이터를 작업하기 위해 분산 임시 테이블을 생성합니다.
3. _기본(레거시) 전략_은 동일한 이유로 분산 임시 및 중간 테이블을 생성합니다.

샤드 테이블만 교체되며, 분산 테이블은 데이터를 유지하지 않습니다. 분산 테이블은 전체 새로 고침 모드가 활성화되거나 테이블 구조가 변경된 경우에만 다시 로드됩니다.
#### 분산 증분 모델 예제 {#distributed-incremental-model-example}

```sql
{{
    config(
        materialized='distributed_incremental',
        engine='MergeTree',
        incremental_strategy='append',
        unique_key='id,created_at'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```
#### 생성된 마이그레이션 {#distributed-incremental-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree
    SETTINGS index_granularity = 8192;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```
### 스냅샷 {#snapshot}

dbt 스냅샷을 사용하면 변경 사항을 추적할 수 있는 기록을 생성할 수 있습니다. 이를 통해 분석가는 모델의 이전 상태를 "시간을 거슬러" 볼 수 있는 시점 쿼리를 수행할 수 있습니다. 이 기능은 ClickHouse 커넥터에 의해 지원되며, 다음 구문을 사용하여 구성됩니다:

`snapshots/<model_name>.sql` 구성 블록:
```python
{{
   config(
     schema = "<schema-name>",
     unique_key = "<column-name>",
     strategy = "<strategy>",
     updated_at = "<updated-at-column-name>",
   )
}}
```

구성에 대한 자세한 정보는 [스냅샷 구성](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) 참조 페이지를 확인하십시오.
### 계약 및 제약 사항 {#contracts-and-constraints}

정확한 컬럼 유형 계약만 지원됩니다. 예를 들어, UInt32 컬럼 유형의 계약은 모델이 UInt64 또는 다른 정수 유형을 반환하면 실패합니다. ClickHouse는 전체 테이블/모델에 대해 _단지_ `CHECK` 제약 조건만 지원합니다. 기본 키, 외래 키, 고유 키 및 컬럼 수준 CHECK 제약 조건은 지원되지 않습니다.
(기본/정렬 키에 대한 ClickHouse 문서를 참조하십시오.)
### 추가 ClickHouse 매크로 {#additional-clickhouse-macros}
#### 모델 물리화 유틸리티 매크로 {#model-materialization-utility-macros}

ClickHouse 특정 테이블 및 뷰를 생성하기 위해 다음 매크로가 포함되어 있습니다:

- `engine_clause` -- ClickHouse 테이블 엔진을 할당하기 위해 `engine` 모델 구성 속성을 사용합니다. dbt-clickhouse는 기본적으로 `MergeTree` 엔진을 사용합니다.
- `partition_cols` -- ClickHouse 파티션 키를 할당하기 위해 `partition_by` 모델 구성 속성을 사용합니다. 기본적으로는 파티션 키가 할당되지 않습니다.
- `order_cols` -- ClickHouse 정렬 키를 할당하기 위해 `order_by` 모델 구성 속성을 사용합니다. 지정하지 않으면 ClickHouse는 빈 튜플()을 사용하여 테이블이 정렬되지 않습니다.
- `primary_key_clause` -- ClickHouse 기본 키를 할당하기 위해 `primary_key` 모델 구성 속성을 사용합니다. 기본적으로 기본 키가 설정되며 ClickHouse는 정렬 기준 절을 기본 키로 사용합니다.
- `on_cluster_clause` -- 특정 dbt 작업에 `ON CLUSTER` 절을 추가하기 위해 `cluster` 프로필 속성을 사용합니다: 분산 물리화, 뷰 생성, 데이터베이스 생성.
- `ttl_config` -- ClickHouse 테이블 TTL 표현식을 할당하기 위해 `ttl` 모델 구성 속성을 사용합니다. 기본적으로 TTL이 할당되지 않습니다.
#### s3Source 헬퍼 매크로 {#s3source-helper-macro}

`s3source` 매크로는 ClickHouse S3 테이블 함수를 사용하여 S3에서 클릭하우스 데이터를 직접 선택하는 과정을 단순화합니다. 이는 
명명된 구성 딕셔너리에서 S3 테이블 함수 매개변수를 채워서 작동합니다(딕셔너리 이름은 `s3`로 끝나야 합니다). 매크로는 
먼저 프로필 `vars`에서 딕셔너리를 찾고, 그 다음 모델 구성에서 찾습니다. 딕셔너리에는 다음 중 하나의 
키가 포함되어 매개변수를 채우는 데 사용됩니다:

| 매개변수 이름         | 설명                                                                                                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | 기본 bucket URL, 예: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`. 프로토콜이 제공되지 않으면 `https://`로 간주됩니다.                                         |
| path                  | 테이블 쿼리에 사용할 S3 경로, 예: `/trips_4.gz`. S3 와일드카드가 지원됩니다.                                                                                                  |
| fmt                   | 참조된 S3 객체의 예상 ClickHouse 입력 형식(예: `TSV` 또는 `CSVWithNames`).                                                                                         |
| structure             | bucket의 데이터 컬럼 구조, 이름/자료형 쌍의 목록(예: `['id UInt32', 'date DateTime', 'value String']`). 제공되지 않으면 ClickHouse가 구조를 유추합니다. |
| aws_access_key_id     | S3 접근 키 ID.                                                                                                                                                                        |
| aws_secret_access_key | S3 비밀 키.                                                                                                                                                                           |
| role_arn              | S3 객체를 안전하게 접근하기 위해 사용할 ClickhouseAccess IAM 역할의 ARN. 추가 정보는 이 [문서](https://clickhouse.com/docs/en/cloud/security/secure-s3)를 참조하십시오.     |
| compression           | S3 객체에 사용된 압축 방법. 제공되지 않으면 ClickHouse가 파일 이름을 기반으로 압축을 결정하려고 시도합니다.                                                   |

이 매크로를 사용하는 방법에 대한 예제는 [S3 테스트 파일](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)을 참조하십시오.
#### 교차 데이터베이스 매크로 지원 {#cross-database-macro-support}

dbt-clickhouse는 다음과 같은 예외를 제외하고 현재 `dbt Core`에 포함된 대부분의 교차 데이터베이스 매크로를 지원합니다:

* `split_part` SQL 함수는 ClickHouse에서 splitByChar 함수를 사용하여 구현됩니다. 이 함수는 "split" 구분자에 대해 상수 문자열을 사용해야 하므로, 이 매크로에 사용되는 `delimiter` 매개변수는 컬럼 이름이 아니라 문자열로 해석됩니다.
* 마찬가지로 ClickHouse의 `replace` SQL 함수도 `old_chars` 및 `new_chars` 매개변수에 대해 상수 문자열을 요구하므로, 매크로를 호출할 때 이러한 매개변수는 컬럼 이름이 아니라 문자열로 해석됩니다.
