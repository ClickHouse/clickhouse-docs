---
sidebar_label: '머티리얼라이제이션'
slug: /integrations/dbt/materializations
sidebar_position: 3
description: '사용 가능한 머티리얼라이제이션과 해당 구성'
keywords: ['clickhouse', 'dbt', 'materializations', 'materialized view', 'incremental']
title: '머티리얼라이제이션'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 머티리얼라이제이션(Materializations) \{#materializations\}

<ClickHouseSupportedBadge/>

이 섹션에서는 실험적 기능을 포함해 dbt-clickhouse에서 사용 가능한 모든 머티리얼라이제이션을 다룹니다.

<TOCInline toc={toc}  maxHeadingLevel={3} />

## 일반 머티리얼라이제이션 구성 \{#general-materialization-configurations\}

다음 표는 사용 가능한 일부 머티리얼라이제이션에서 공유되는 구성을 보여줍니다. 일반적인 dbt 모델 구성에 대한 자세한 내용은 [dbt 문서](https://docs.getdbt.com/category/general-configs)를 참고하십시오:

| Option         | Description                                                                                                                                                                      | Default if any |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine         | 테이블을 생성할 때 사용할 테이블 엔진(테이블 유형)                                                                                                                                 | `MergeTree()`  |
| order_by       | 컬럼 이름 또는 임의의 표현식으로 구성된 튜플입니다. 이를 사용하여 데이터를 더 빠르게 찾는 데 도움이 되는 작은 희소 인덱스를 생성할 수 있습니다.                                      | `tuple()`      |
| partition_by   | 파티션은 지정된 기준에 따라 테이블의 레코드를 논리적으로 묶은 것입니다. 파티션 키는 테이블 컬럼에서 나온 임의의 표현식이 될 수 있습니다.                                             |                |
| primary_key    | order_by와 마찬가지로 ClickHouse 기본 키(primary key) 표현식입니다. 지정하지 않으면 ClickHouse는 ORDER BY 표현식을 기본 키로 사용합니다.                                           |                |
| settings       | 이 모델과 함께 「CREATE TABLE」과 같은 DDL 문에서 사용할 「TABLE」 설정의 맵/딕셔너리입니다.                                                                                      |                |
| query_settings | 이 모델과 함께 `INSERT` 또는 `DELETE` 문에서 사용할 ClickHouse 사용자 수준 설정의 맵/딕셔너리입니다.                                                                              |                |
| ttl            | 테이블에 사용할 TTL 표현식입니다. TTL 표현식은 테이블의 TTL을 지정하는 데 사용할 수 있는 문자열입니다.                                                                             |                |
| sql_security   | 뷰의 기반이 되는 쿼리를 실행할 때 사용할 ClickHouse 사용자입니다. [허용되는 값](/sql-reference/statements/create/view#sql_security): `definer`, `invoker`.                         |                |
| definer        | `sql_security`가 `definer`로 설정된 경우, `definer` 절에 존재하는 사용자 또는 `CURRENT_USER`를 지정해야 합니다.                                                                   |                |

### 지원되는 테이블 엔진 \{#supported-table-engines\}

| 유형                   | 상세 정보                                                                                |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (default)    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**참고**: materialized view에서는 모든 *MergeTree 엔진이 지원됩니다.

#### 실험적으로 지원되는 테이블 엔진 \{#experimental-supported-table-engines\}

| Type          | Details                                                                   |
|---------------|---------------------------------------------------------------------------|
| 분산 테이블   | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| 딕셔너리      | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

위 엔진 중 하나를 사용해 dbt에서 ClickHouse에 연결할 때 문제가 발생하면 [여기](https://github.com/ClickHouse/dbt-clickhouse/issues)에 이슈를 등록해 주십시오.

### 모델 설정에 대한 참고 사항 \{#a-note-on-model-settings\}

ClickHouse에는 여러 유형/수준의 "settings"가 있습니다. 위의 모델 구성에서는 이 중 두 가지 유형을
설정할 수 있습니다. `settings`는 `CREATE TABLE/VIEW` 유형의 DDL 문에서 사용하는 `SETTINGS`
절을 의미하며, 일반적으로 특정 ClickHouse 테이블 엔진에 특화된 설정을 뜻합니다. 새로 추가된
`query_settings`는 모델 구체화(materialization)에 사용되는 `INSERT` 및 `DELETE` 쿼리에 `SETTINGS` 절을 추가할 수 있도록 합니다
(증분 구체화를 포함합니다).
ClickHouse 설정은 수백 가지가 있으며, 어떤 것이 "테이블" 설정이고 어떤 것이 "사용자"
설정인지 항상 명확하지는 않습니다(후자는 일반적으로 `system.settings` 테이블에서
확인할 수 있습니다). 일반적으로 기본값 사용을 권장하며, 이러한 속성을 사용할 때에는
반드시 충분한 사전 조사와 테스트를 수행해야 합니다.

### 컬럼 구성 \{#column-configuration\}

> **_NOTE:_** 아래 컬럼 구성 옵션을 사용하려면 [model contracts](https://docs.getdbt.com/docs/collaborate/govern/model-contracts)가 강제 적용되어 있어야 합니다.

| 옵션 | 설명                                                                                                                                                | 기본값(해당되는 경우) |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | 컬럼의 DDL에서 `CODEC()`에 전달되는 인수로 이루어진 문자열입니다. 예를 들어 `codec: "Delta, ZSTD"`는 `CODEC(Delta, ZSTD)`로 컴파일됩니다.    |    
| ttl    | 컬럼의 DDL에서 TTL 규칙을 정의하는 [TTL(time-to-live) 표현식](https://clickhouse.com/docs/guides/developer/ttl)으로 이루어진 문자열입니다. 예를 들어 `ttl: ts + INTERVAL 1 DAY`는 `TTL ts + INTERVAL 1 DAY`로 컴파일됩니다. |

#### 스키마 설정 예시 \{#example-of-schema-configuration\}

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


#### 복합 타입 추가 \{#adding-complex-types\}

dbt는 모델을 생성하는 SQL을 분석하여 각 컬럼의 데이터 타입을 자동으로 결정합니다. 그러나 일부 경우 이 과정에서 데이터 타입을 정확하게 판별하지 못해 contract의 `data_type` 속성에 지정된 타입과 충돌이 발생할 수 있습니다. 이를 해결하기 위해 모델 SQL에서 `CAST()` 함수를 사용하여 원하는 타입을 명시적으로 정의할 것을 권장합니다. 예를 들면 다음과 같습니다.

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


## 머터리얼라이제이션: 뷰 \{#materialization-view\}

dbt 모델은 [ClickHouse 뷰](/sql-reference/table-functions/view/)
로 생성할 수 있으며, 다음 구문으로 구성합니다:

프로젝트 파일 (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: view
```

또는 구성 블록(`models/<model_name>.sql`):

```python
{{ config(materialized = "view") }}
```


## 머터리얼라이제이션: table \{#materialization-table\}

dbt 모델은 [ClickHouse 테이블](/operations/system-tables/tables/)로 생성할 수 있으며,
다음 구문을 사용하여 구성합니다:

프로젝트 파일 (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

또는 구성 블록(`models/<model_name>.sql`):

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


### 데이터 스키핑 인덱스 \{#data-skipping-indexes\}

`indexes` 설정을 사용해 `table` 머터리얼라이제이션에 [데이터 스키핑 인덱스](/optimize/skipping-indexes)를 추가합니다:

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


### 프로젝션 \{#projections\}

`projections` 구성 옵션을 사용하면 `table` 및 `distributed_table` 머터리얼라이제이션에 [프로젝션](/data-modeling/projections)을 추가할 수 있습니다:

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

**참고**: 분산 테이블에서는 PROJECTION이 분산 프록시 테이블이 아니라 `_local` 테이블에 적용됩니다.


## 머터리얼라이제이션: incremental \{#materialization-incremental\}

테이블 모델은 dbt가 실행될 때마다 다시 구성됩니다. 이는 결과 집합이 크거나 변환이 복잡한 경우 비현실적이거나 비용이 매우 많이 들 수 있습니다. 이러한 문제를 해결하고 빌드 시간을 줄이기 위해, dbt 모델을 incremental ClickHouse 테이블로 생성하고 다음 구문을 사용해 구성합니다:

`dbt_project.yml` 내 모델 정의:

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

또는 `models/<model_name>.sql` 파일의 config 블록:

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


### 구성 \{#incremental-configurations\}

이 머티리얼라이제이션 유형에만 적용되는 구성 옵션은 아래와 같습니다:

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | 행을 고유하게 식별하는 컬럼 이름들의 튜플입니다. 고유 제약 조건에 대한 자세한 내용은 [여기](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)를 참조하십시오.                                                                                       | 필수입니다. 제공하지 않으면 변경된 행이 증분 테이블에 두 번 추가됩니다. |
| `inserts_only`           | 동일한 방식으로 동작하는 `append` 증분 `strategy`로 대체되었으며, 더 이상 사용이 권장되지 않습니다(deprecated). 증분 모델에 대해 `True`로 설정하면, 중간 테이블을 생성하지 않고 증분 업데이트가 직접 대상 테이블에 삽입됩니다. `inserts_only`가 설정되면 `incremental_strategy`는 무시됩니다. | 선택 사항입니다 (기본값: `False`)                                                          |
| `incremental_strategy`   | 증분 머티리얼라이제이션에 사용할 전략입니다. `delete+insert`, `append`, `insert_overwrite`, `microbatch`가 지원됩니다. 전략에 대한 추가 세부 정보는 [여기](#incremental-model-strategies)를 참조하십시오. | 선택 사항입니다 (기본값: 'default')                                                        |
| `incremental_predicates` | 증분 머티리얼라이제이션에 적용할 추가 조건입니다 (`delete+insert` 전략에만 적용됩니다).                                                                                                                                                                                    | 선택 사항입니다                      

### 증분 모델 전략 \{#incremental-model-strategies\}

`dbt-clickhouse`는 세 가지 증분 모델 전략을 지원합니다.

#### 기본(레거시) 전략 \{#default-legacy-strategy\}

과거에는 ClickHouse에서 업데이트와 삭제를 비동기식 「뮤테이션(mutations)」 형태로만 제한적으로 지원했습니다.
일반적으로 기대되는 dbt 동작을 재현하기 위해,
dbt-clickhouse는 기본적으로 삭제되거나 변경되지 않은 기존 "old" 레코드(영향을 받지 않은 레코드) 전체와
새로운 레코드 또는 업데이트된 레코드를 모두 포함하는 임시 테이블을 새로 생성한 다음,
이 임시 테이블을 기존 증분 모델 릴레이션과 스왑(swap)하거나 익스체인지(exchange)합니다. 이 전략만이
연산이 완료되기 전에 문제가 발생하더라도 원래 릴레이션을 보존합니다.
다만 원본 테이블 전체를 복사해야 하므로 비용이 많이 들고, 실행 속도가 느려질 수 있습니다.

#### Delete+Insert 전략 \{#delete-insert-strategy\}

ClickHouse는 22.8 버전에서 실험적 기능으로서 「경량한 삭제(lightweight delete)」를 추가했습니다. 경량한 삭제는
ALTER TABLE ... DELETE
작업보다 훨씬 빠르며, ClickHouse 데이터 파트를 다시 쓸 필요가 없습니다. 증분 전략인 `delete+insert`는
경량한 삭제를 활용해
기존 "레거시" 전략보다 성능이 훨씬 뛰어난 증분 머터리얼라이제이션을 구현합니다. 다만, 이 전략을 사용할 때에는
다음과 같은 중요한 주의사항이 있습니다:

- 경량한 삭제 기능은 ClickHouse 서버에서
  `allow_experimental_lightweight_delete=1` SETTING을 사용해 활성화해야 하며, 또는
  프로필에서 `use_lw_deletes=true`를 설정해야 합니다(이 설정은 dbt 세션에 대해 위의 SETTING을 활성화합니다).
- 경량한 삭제 기능은 이제 프로덕션 용도로 사용할 준비가 되어 있지만, 23.3 이전 ClickHouse 버전에서는
  성능 및 기타 문제가 발생할 수 있습니다.
- 이 전략은 (중간 또는 임시 테이블을 생성하지 않고) 영향을 받는 테이블/릴레이션에 직접 작동하므로,
  실행 과정에서 문제가 발생하면
  증분 모델의 데이터가 잘못된 상태가 될 가능성이 큽니다.
- 경량한 삭제를 사용할 때 dbt-clickhouse는 `allow_nondeterministic_mutations` SETTING을 활성화합니다. 매우
  드문 경우이지만 비결정적인 `incremental_predicates`를 사용할 때,
  업데이트/삭제된 항목에 대해 경쟁 조건(및 ClickHouse 로그의 관련 로그 메시지)이 발생할 수 있습니다.
  일관된 결과를 보장하려면
  증분 프레디킷에는 증분 머터리얼라이제이션 동안 수정되지 않는 데이터에 대한 서브쿼리만 포함되어야 합니다.

#### 마이크로배치 전략 (dbt-core &gt;= 1.9 필요) \{#microbatch-strategy\}

증분 전략인 `microbatch`는 dbt-core 1.9 버전부터 제공되는 기능으로, 대규모 시계열 데이터 변환을 효율적으로 처리하도록 설계되었습니다. dbt-clickhouse에서는 기존 `delete_insert`
증분 전략을 기반으로, `event_time` 및 `batch_size` 모델 설정에 따라 증분 구간을 사전 정의된 시계열 배치로 분할하여 동작합니다.

대규모 변환 처리 외에도 microbatch는 다음과 같은 기능을 제공합니다.

- [실패한 배치 재처리](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)를 지원합니다.
- [병렬 배치 실행](https://docs.getdbt.com/docs/build/parallel-batch-execution)을 자동으로 감지합니다.
- [백필(backfilling)](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills) 시 복잡한 조건부 로직이 필요하지 않습니다.

microbatch 사용 방법에 대한 자세한 내용은 [공식 문서](https://docs.getdbt.com/docs/build/incremental-microbatch)를 참고하십시오.

##### 사용 가능한 마이크로배치 구성 \{#available-microbatch-configurations\}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | 행이 「어느 시점에 발생했는지」를 나타내는 컬럼입니다. 마이크로배치 모델과 필터링이 적용되어야 하는 모든 직접 상위 모델에 필요합니다.                                                                                                                                                                                                       |                |
| begin              | 마이크로배치 모델에 대한 「시간의 시작 시점」입니다. 초기 또는 전체 새로 고침(full-refresh) 빌드의 시작 지점입니다. 예를 들어, 일 단위 마이크로배치 모델이 2024-10-01에 실행되고 begin = '2023-10-01'인 경우, 366개의 배치(윤년이기 때문입니다)에 오늘에 해당하는 배치가 추가로 처리됩니다.                                                |                |
| batch_size         | 배치의 세분성(granularity)을 지정합니다. 사용할 수 있는 값은 `hour`, `day`, `month`, `year`입니다.                                                                                                                                                                                                                                        |                |
| lookback           | 지연 도착 레코드를 포착하기 위해 최신 북마크 이전의 X개 배치를 처리합니다.                                                                                                                                                                                                                                                                | 1              |
| concurrent_batches | 배치를 동시에(concurrently) 실행하기 위한 dbt의 자동 감지 기능을 재정의합니다. [동시 배치 구성](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)에 대해 자세히 살펴보십시오. true로 설정하면 배치를 동시에(병렬로) 실행하고, false로 설정하면 배치를 순차적으로(하나씩 차례대로) 실행합니다. |                |

#### Append 전략 \{#append-strategy\}

이 전략은 이전 버전의 dbt-clickhouse에서 사용되던 `inserts_only` 설정을 대체합니다. 이 방식은 단순히
새 행을 기존 relation(테이블/뷰)에 추가합니다.
그 결과 중복 행은 제거되지 않으며, 임시 테이블이나 중간 테이블도 사용하지 않습니다. 데이터에서 중복이 허용되거나,
증분 쿼리의 WHERE 절 또는 필터를 통해 중복이 제외되는 경우에는 가장 빠른 방식입니다.

#### insert_overwrite 전략(실험적) \{#insert-overwrite-strategy\}

> [IMPORTANT]  
> 현재 insert_overwrite 전략은 분산 머티리얼라이제이션(distributed materializations)과 완전히 호환되지 않습니다.

다음 단계를 수행합니다.

1. 증분 모델 relation과 동일한 구조를 가진 스테이징(임시) 테이블을 생성합니다:  
   `CREATE TABLE <staging> AS <target>`.
2. `SELECT`로 생성된 새로운 레코드만 스테이징 테이블에 INSERT합니다.
3. 스테이징 테이블에 존재하는 새로운 파티션만 대상 테이블로 교체합니다.

이 접근 방식은 다음과 같은 장점이 있습니다.

- 전체 테이블을 복사하지 않으므로 기본 전략보다 더 빠릅니다.
- INSERT 작업이 성공적으로 완료될 때까지 원본 테이블을 수정하지 않으므로 다른 전략보다 더 안전합니다.  
  중간에 실패가 발생하는 경우에도 원본 테이블은 변경되지 않습니다.
- 데이터 엔지니어링 모범 사례인 「파티션 불변성(partitions immutability)」을 구현합니다.  
  이를 통해 증분 및 병렬 데이터 처리, 롤백 등을 단순화할 수 있습니다.

이 전략을 사용하려면 모델 설정에서 `partition_by`가 설정되어 있어야 합니다.  
모델 설정에 정의된 다른 전략 관련 매개변수는 모두 무시됩니다.

## Materialization: materialized_view \{#materialized-view\}

`materialized_view` materialization은 INSERT 트리거처럼 동작하는 ClickHouse [materialized view](/sql-reference/statements/create/view#materialized-view)를 생성하여, 소스 테이블의 새로운 행을 자동으로 변환한 뒤 대상 테이블에 삽입합니다. 이는 dbt-clickhouse에서 제공되는 materialization 가운데 가장 강력한 유형 중 하나입니다.

이 materialization은 내용이 방대하여 별도의 전용 페이지로 제공됩니다. 전체 문서는 **[Materialized Views 가이드](/integrations/dbt/materialized-views)** 에서 확인하십시오.

## Materialization: dictionary (experimental) \{#materialization-dictionary\}

다음 테스트를 참고하십시오.
https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py

ClickHouse 딕셔너리에 대한 materialization 구현 예제를 확인할 수 있습니다.

## Materialization: distributed_table (experimental) \{#materialization-distributed-table\}

다음 단계를 통해 분산 테이블을 생성합니다:

1. 적절한 스키마를 얻기 위한 SQL 쿼리로 임시 뷰를 생성합니다.
2. 뷰를 기반으로 비어 있는 로컬 테이블을 생성합니다.
3. 로컬 테이블을 기반으로 분산 테이블을 생성합니다.
4. 데이터를 분산 테이블에 삽입하여, 복제 없이 세그먼트들에 분산되도록 합니다.

참고:

- dbt-clickhouse는 이제 다운스트림 증분 materialization 작업이 올바르게 실행되도록 보장하기 위해
  `insert_distributed_sync = 1` 설정을 쿼리에 자동으로 포함합니다. 이로 인해 일부 분산 테이블 삽입 작업이
  예상보다 느리게 실행될 수 있습니다.

### 분산 테이블 모델 예제 \{#distributed-table-model-example\}

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


### 생성된 마이그레이션 \{#distributed-table-generated-migrations\}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at);

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```


### 설정 \{#distributed-table-configurations\}

이 머터리얼라이제이션 타입에만 해당하는 설정은 아래와 같습니다.

| 옵션                   | 설명                                                                                                                                                                                                                                                                                                                 | 기본값 (있을 경우) |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| sharding_key           | Sharding key는 Distributed 엔진 테이블에 데이터를 INSERT할 때 대상 서버를 결정합니다. Sharding key는 무작위이거나 해시 함수의 출력값일 수 있습니다.                                                                                                                                                                       | `rand()`)          |

## materialization: distributed_incremental (experimental) \{#materialization-distributed-incremental\}

분산 테이블과 동일한 아이디어를 기반으로 한 증분 모델이며, 핵심 난점은 모든 증분 전략을 올바르게 처리하는 데 있습니다.

1. _Append 전략_은 단순히 데이터를 분산 테이블에 삽입합니다.
2. _Delete+Insert 전략_은 각 세그먼트의 전체 데이터로 작업하기 위해 분산 임시 테이블을 생성합니다.
3. _기본(레거시) 전략_도 같은 이유로 분산 임시 및 중간 테이블을 생성합니다.

분산 테이블은 데이터를 저장하지 않으므로 세그먼트 테이블만 교체됩니다.
분산 테이블은 `full_refresh` 모드가 활성화되어 있거나 테이블 구조가 변경되었을 수 있는 경우에만 다시 로드됩니다.

### 분산 증분 모델 예시 \{#distributed-incremental-model-example\}

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


### 자동 생성된 마이그레이션 \{#distributed-incremental-generated-migrations\}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```


## Snapshot \{#snapshot\}

dbt snapshot 기능을 사용하면 시간이 지남에 따라 변경되는 mutable 모델의 변경 사항을 기록할 수 있습니다. 이를 통해 분석가는 특정 시점에서 모델에 대해 쿼리를 실행하여 모델의 이전 상태를 「과거로 되돌아가」 확인할 수 있습니다. 이 기능은 ClickHouse 커넥터에서 지원되며 다음 구문을 사용하여 구성합니다:

`snapshots/<model_name>.sql`의 구성(Config) 블록:

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

구성에 대한 자세한 내용은 [snapshot configs](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) 참고 페이지를 확인하십시오.


## 계약과 제약 조건 \{#contracts-and-constraints\}

정확히 일치하는 컬럼 타입에 대한 계약만 지원합니다. 예를 들어 UInt32 컬럼 타입으로 정의된 계약에서 모델이
UInt64 또는 다른 정수 타입을 반환하면, 해당 계약은 실패합니다.
ClickHouse는 전체 테이블/모델 수준의 `CHECK` 제약 조건만을 _오직_ 지원합니다. 기본 키(primary key), 외래 키(foreign key), 고유(unique) 제약과
컬럼 수준 CHECK 제약 조건은 지원되지 않습니다.
(기본 키 및 ORDER BY 키에 대해서는 ClickHouse 문서를 참조하십시오.)