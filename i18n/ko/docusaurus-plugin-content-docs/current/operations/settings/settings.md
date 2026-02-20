---
title: '세션 설정'
sidebar_label: '세션 설정'
slug: /operations/settings/settings
toc_max_heading_level: 2
description: '``system.settings`` 테이블에 있는 설정입니다.'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 자동으로 생성됨 */ }

아래의 모든 설정은 [system.settings](/docs/operations/system-tables/settings) 테이블에서도 확인할 수 있습니다. 이러한 설정은 [source](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.cpp) 소스 코드에서 자동으로 생성됩니다.


## add_http_cors_header \{#add_http_cors_header\}

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP CORS 헤더를 추가합니다.

## additional_result_filter \{#additional_result_filter\}

`SELECT` 쿼리 결과에 추가로 적용할 필터 식입니다.
이 설정은 서브쿼리에는 적용되지 않습니다.

**예시**

```sql
INSERT INTO table_1 VALUES (1, 'a'), (2, 'bb'), (3, 'ccc'), (4, 'dddd');
SElECT * FROM table_1;
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 2 │ bb   │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```

```sql
SELECT *
FROM table_1
SETTINGS additional_result_filter = 'x != 2'
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```


## additional_table_filters \{#additional_table_filters\}

<SettingsInfoBlock type="Map" default_value="{}" />

지정된 테이블에서 데이터를 읽은 이후에 적용되는 추가 필터 식입니다.

**예시**

```sql
INSERT INTO table_1 VALUES (1, 'a'), (2, 'bb'), (3, 'ccc'), (4, 'dddd');
SELECT * FROM table_1;
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 2 │ bb   │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```

```sql
SELECT *
FROM table_1
SETTINGS additional_table_filters = {'table_1': 'x != 2'}
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```


## aggregate_function_input_format \{#aggregate_function_input_format\}

<SettingsInfoBlock type="AggregateFunctionInputFormat" default_value="state" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "state"},{"label": "INSERT 작업 시 AggregateFunction 입력 형식을 제어하기 위한 새로운 설정입니다. 기본값은 state입니다"}]}]} />

INSERT 작업에서 AggregateFunction 입력 형식을 제어하는 설정입니다.

가능한 값:

* `state` — 직렬화된 상태를 담고 있는 바이너리 문자열입니다(기본값). AggregateFunction 값이 바이너리 데이터로 제공된다고 가정하는 기본 동작입니다.
* `value` — 집계 함수의 인자가 하나인 경우 단일 값, 여러 개인 경우 해당 인자들의 튜플을 기대하는 형식입니다. 이 값들은 해당하는 `IDataType` 또는 `DataTypeTuple`을 사용해 역직렬화한 후, 상태를 형성하도록 집계됩니다.
* `array` — 위의 `value` 옵션에서 설명한 값들의 `Array`를 기대하는 형식입니다. 배열의 모든 요소가 상태를 형성하도록 집계됩니다.

**예시**

다음과 같은 구조의 테이블이 있다고 가정합니다:

```sql
CREATE TABLE example (
    user_id UInt64,
    avg_session_length AggregateFunction(avg, UInt32)
);
```

`aggregate_function_input_format = 'value'`를 사용하면:

```sql
INSERT INTO example FORMAT CSV
123,456
```

`aggregate_function_input_format = 'array'`인 경우:

```sql
INSERT INTO example FORMAT CSV
123,"[456,789,101]"
```

참고: `value` 및 `array` 형식은 삽입 시 값 생성 및 집계를 수행해야 하므로 기본 `state` 형식에 비해 더 느리게 동작합니다.


## aggregate_functions_null_for_empty \{#aggregate_functions_null_for_empty\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리에서 모든 집계 함수에 [-OrNull](/sql-reference/aggregate-functions/combinators#-ornull) 접미사를 추가하도록 쿼리를 재작성할지 여부를 설정합니다. SQL 표준과의 호환성을 위해 활성화합니다.
분산 쿼리에 대해 일관된 결과를 얻기 위해 [count&#95;distinct&#95;implementation](#count_distinct_implementation) 설정과 유사한 쿼리 재작성 방식으로 구현되었습니다.

가능한 값:

* 0 — 비활성화됨.
* 1 — 활성화됨.

**예시**

다음과 같은 집계 함수가 포함된 쿼리를 가정합니다:

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

`aggregate_functions_null_for_empty = 0`으로 설정하면 다음과 같은 결과가 나옵니다:

```text
┌─SUM(-1)─┬─MAX(0)─┐
│       0 │      0 │
└─────────┴────────┘
```

`aggregate_functions_null_for_empty = 1`로 설정하면 결과는 다음과 같습니다.

```text
┌─SUMOrNull(-1)─┬─MAXOrNull(0)─┐
│          NULL │         NULL │
└───────────────┴──────────────┘
```


## aggregation_in_order_max_block_bytes \{#aggregation_in_order_max_block_bytes\}

<SettingsInfoBlock type="UInt64" default_value="50000000" />

프라이머리 키 순서대로 집계하는 동안 누적되는 블록의 최대 크기(바이트 단위)입니다. 블록 크기를 더 작게 설정하면 집계의 최종 머지 단계에서 병렬 처리를 더 많이 수행할 수 있습니다.

## aggregation_memory_efficient_merge_threads \{#aggregation_memory_efficient_merge_threads\}

<SettingsInfoBlock type="UInt64" default_value="0" />

메모리 효율 모드에서 중간 집계 결과를 병합할 때 사용할 스레드 수입니다. 값이 클수록 더 많은 메모리가 사용됩니다. 0으로 설정하면 'max_threads'와 동일합니다.

## allow_aggregate_partitions_independently \{#allow_aggregate_partitions_independently\}

<SettingsInfoBlock type="Bool" default_value="0" />

파티션 키가 `GROUP BY` 키와 일치하는 경우, 각 파티션을 별도의 스레드에서 독립적으로 집계하도록 활성화합니다. 파티션 개수가 코어 수와 비슷하고 각 파티션의 크기가 대략 비슷할 때 유리합니다.

## allow_archive_path_syntax \{#allow_archive_path_syntax\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "아카이브 경로 구문을 비활성화할 수 있는 새로운 설정이 추가되었습니다."}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "아카이브 경로 구문을 비활성화할 수 있는 새로운 설정이 추가되었습니다."}]}]}/>

File/S3 엔진과 테이블 함수는 아카이브가 유효한 확장자를 가진 경우, '::'가 포함된 경로를 `<archive> :: <file>` 형식으로 파싱합니다.

## allow_asynchronous_read_from_io_pool_for_merge_tree \{#allow_asynchronous_read_from_io_pool_for_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

백그라운드 I/O 풀을 사용하여 MergeTree 테이블에서 데이터를 읽습니다. 이 설정은 I/O 바운드 쿼리의 성능을 향상시킬 수 있습니다.

## allow_changing_replica_until_first_data_packet \{#allow_changing_replica_until_first_data_packet\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면 hedged 요청(hedged requests)의 경우, 일부 진행이 이미 있었더라도
(`receive_data_timeout` 타임아웃 동안 진행 상황이 업데이트되지 않은 경우) 첫 번째 데이터 패킷을 받기 전까지는 새 연결을 시작할 수 있습니다.
비활성화된 경우에는 처음으로 진행이 감지된 이후에는 레플리카 변경이 비활성화됩니다.

## allow_create_index_without_type \{#allow_create_index_without_type\}

<SettingsInfoBlock type="Bool" default_value="0" />

TYPE 없이 CREATE INDEX 쿼리를 허용합니다. 해당 쿼리는 무시됩니다. SQL 호환성 테스트용입니다.

## allow_custom_error_code_in_throwif \{#allow_custom_error_code_in_throwif\}

<SettingsInfoBlock type="Bool" default_value="0" />

`throwIf()` 함수에서 사용자 정의 오류 코드를 활성화합니다. true로 설정하면 발생하는 예외에 예상치 못한 오류 코드가 포함될 수 있습니다.

## allow_ddl \{#allow_ddl\}

<SettingsInfoBlock type="Bool" default_value="1" />

값을 true로 설정하면 사용자가 DDL 쿼리를 실행할 수 있습니다.

## allow_deprecated_database_ordinary \{#allow_deprecated_database_ordinary\}

<SettingsInfoBlock type="Bool" default_value="0" />

더 이상 사용이 권장되지 않는 Ordinary 엔진을 사용하는 데이터베이스 생성을 허용합니다

## allow_deprecated_error_prone_window_functions \{#allow_deprecated_error_prone_window_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "더 이상 사용되지 않는 오류 발생 가능성이 높은 윈도 함수(neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference)의 사용을 허용합니다"}]}]}/>

더 이상 사용되지 않는 오류 발생 가능성이 높은 윈도 함수(neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference)의 사용을 허용합니다

## allow_deprecated_snowflake_conversion_functions \{#allow_deprecated_snowflake_conversion_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "사용 중단된 함수 snowflakeToDateTime[64] 및 dateTime[64]ToSnowflake를 비활성화합니다."}]}]}/>

함수 `snowflakeToDateTime`, `snowflakeToDateTime64`, `dateTimeToSnowflake`, `dateTime64ToSnowflake`는 사용이 중단되었으며 기본적으로 비활성화되어 있습니다.
대신 `snowflakeIDToDateTime`, `snowflakeIDToDateTime64`, `dateTimeToSnowflakeID`, `dateTime64ToSnowflakeID` 함수를 사용하십시오.

사용 중단된 함수를 다시 활성화하려면(예: 전환 기간 동안) 이 설정을 `true`로 설정하십시오.

## allow_deprecated_syntax_for_merge_tree \{#allow_deprecated_syntax_for_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

사용 중단된 엔진 정의 구문을 사용하여 *MergeTree 테이블을 생성할 수 있도록 허용합니다

## allow_distributed_ddl \{#allow_distributed_ddl\}

<SettingsInfoBlock type="Bool" default_value="1" />

true로 설정되어 있으면 분산 DDL 쿼리 실행이 허용됩니다.

## allow_drop_detached \{#allow_drop_detached\}

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE ... DROP DETACHED PART[ITION] ... 쿼리 실행을 허용합니다

## allow_dynamic_type_in_join_keys \{#allow_dynamic_type_in_join_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "기본적으로 JOIN 키에서 Dynamic 타입 사용을 허용하지 않음"}]}]}/>

JOIN 키에서 Dynamic 타입 사용을 허용합니다. 호환성을 위해 도입되었습니다. JOIN 키에서 Dynamic 타입을 사용하는 것은 다른 타입과의 비교 시 예기치 않은 결과를 초래할 수 있으므로 권장되지 않습니다.

## allow_execute_multiif_columnar \{#allow_execute_multiif_columnar\}

<SettingsInfoBlock type="Bool" default_value="1" />

`multiIf` 함수를 열 지향 방식으로 실행하는 것을 허용합니다.

## allow_experimental_alias_table_engine \{#allow_experimental_alias_table_engine\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "새 설정"}]}]}/>

Alias 엔진을 사용한 테이블 생성을 허용합니다.

## allow_experimental_analyzer \{#allow_experimental_analyzer\}

**별칭**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "기본적으로 analyzer 및 planner를 활성화합니다."}]}]}/>

새로운 쿼리 analyzer의 사용을 허용합니다.

## allow_experimental_codecs \{#allow_experimental_codecs\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 true로 지정하면 실험적인 압축 코덱 사용을 허용하지만, 현재 그러한 코덱은 제공되지 않으므로 이 옵션은 아무 효과도 없습니다.

## allow_experimental_correlated_subqueries \{#allow_experimental_correlated_subqueries\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "연관 서브쿼리 지원을 베타로 표시합니다."}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "연관 서브쿼리 실행을 허용하는 새로운 설정을 추가했습니다."}]}]}/>

연관 서브쿼리 실행을 허용합니다.

## allow_experimental_database_glue_catalog \{#allow_experimental_database_glue_catalog\}

<BetaBadge/>

**별칭**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Allow experimental database engine DataLakeCatalog with catalog_type = 'glue'"}]}]}/>

`catalog_type = 'glue'`인 실험적 데이터베이스 엔진인 DataLakeCatalog의 사용을 허용합니다

## allow_experimental_database_hms_catalog \{#allow_experimental_database_hms_catalog\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "catalog_type = 'hive'인 실험적 데이터베이스 엔진 DataLakeCatalog의 사용을 허용합니다"}]}]}/>

catalog_type = 'hms'인 실험적 데이터베이스 엔진 DataLakeCatalog의 사용을 허용합니다

## allow_experimental_database_iceberg \{#allow_experimental_database_iceberg\}

<BetaBadge/>

**별칭**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "새 설정입니다."}]}]}/>

catalog_type가 'iceberg'인 실험적 데이터베이스 엔진 DataLakeCatalog를 사용할 수 있도록 허용합니다.

## allow_experimental_database_materialized_postgresql \{#allow_experimental_database_materialized_postgresql\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Engine=MaterializedPostgreSQL(...)를 사용한 데이터베이스 생성을 허용합니다.

## allow_experimental_database_paimon_rest_catalog \{#allow_experimental_database_paimon_rest_catalog\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "New setting"}]}]}/>

catalog_type = 'paimon_rest'인 실험적 데이터베이스 엔진 DataLakeCatalog의 사용을 허용합니다.

## allow_experimental_database_unity_catalog \{#allow_experimental_database_unity_catalog\}

<BetaBadge/>

**별칭**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "catalog_type이 'unity'인 실험적 데이터베이스 엔진 DataLakeCatalog를 허용합니다"}]}]}/>

catalog_type이 'unity'인 실험적 데이터베이스 엔진 DataLakeCatalog를 허용합니다

## allow_experimental_delta_kernel_rs \{#allow_experimental_delta_kernel_rs\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

실험적인 delta-kernel-rs 구현 사용을 허용합니다.

## allow_experimental_delta_lake_writes \{#allow_experimental_delta_lake_writes\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

delta-kernel 쓰기 기능을 활성화합니다.

## allow_experimental_funnel_functions \{#allow_experimental_funnel_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

퍼널 분석용 실험적 함수를 활성화합니다.

## allow_experimental_hash_functions \{#allow_experimental_hash_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

실험적인 해시 함수 사용을 허용합니다

## allow_experimental_iceberg_compaction \{#allow_experimental_iceberg_compaction\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Iceberg 테이블에서 `OPTIMIZE` 명령을 명시적으로 사용할 수 있도록 허용합니다.

## allow_experimental_join_right_table_sorting \{#allow_experimental_join_right_table_sorting\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "이 설정을 true로 설정하고 `join_to_sort_minimum_perkey_rows` 및 `join_to_sort_maximum_table_rows` 조건을 충족하면, left hash join 또는 inner hash join에서 성능을 향상하기 위해 오른쪽 테이블을 키 기준으로 다시 정렬합니다."}]}]}/>

이 설정을 true로 설정하고 `join_to_sort_minimum_perkey_rows` 및 `join_to_sort_maximum_table_rows` 조건을 충족하면, left hash join 또는 inner hash join에서 성능을 향상하기 위해 오른쪽 테이블을 키 기준으로 다시 정렬합니다.

## allow_experimental_kafka_offsets_storage_in_keeper \{#allow_experimental_kafka_offsets_storage_in_keeper\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "커밋된 오프셋을 ClickHouse Keeper에 저장하는 실험적 Kafka 스토리지 엔진 사용 허용"}]}]}/>

Kafka 오프셋을 ClickHouse Keeper에 저장하는 실험적 기능을 허용합니다. 이 설정을 활성화하면 Kafka 테이블 엔진에 사용할 ClickHouse Keeper 경로와 레플리카 이름을 지정할 수 있습니다. 이렇게 하면 기본 Kafka 엔진 대신, 커밋된 오프셋을 주로 ClickHouse Keeper에 저장하는 새로운 유형의 Kafka 스토리지 엔진이 사용됩니다.

## allow_experimental_kusto_dialect \{#allow_experimental_kusto_dialect\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

Kusto Query Language(KQL)을 활성화합니다. SQL의 대체 쿼리 언어입니다.

## allow_experimental_materialized_postgresql_table \{#allow_experimental_materialized_postgresql_table\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

MaterializedPostgreSQL 테이블 엔진 사용을 허용합니다. 이 기능은 실험적인 기능이므로 기본적으로 비활성화되어 있습니다.

## allow_experimental_nlp_functions \{#allow_experimental_nlp_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

자연어 처리를 위한 실험적 함수들을 활성화합니다.

## allow_experimental_nullable_tuple_type \{#allow_experimental_nullable_tuple_type\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

테이블에 [Nullable](../../sql-reference/data-types/nullable) [Tuple](../../sql-reference/data-types/tuple.md) 컬럼을 생성할 수 있게 합니다.

## allow_experimental_object_storage_queue_hive_partitioning \{#allow_experimental_object_storage_queue_hive_partitioning\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "새 설정입니다."}]}]}/>

S3Queue/AzureQueue 엔진에서 Hive 파티셔닝 사용을 허용합니다.

## allow_experimental_parallel_reading_from_replicas \{#allow_experimental_parallel_reading_from_replicas\}

**별칭**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

SELECT 쿼리 실행을 위해 각 세그먼트에서 사용할 레플리카 수를 최대 `max_parallel_replicas`까지 사용합니다. 읽기는 병렬로 수행되고 동적으로 조율됩니다. 0 - 비활성화, 1 - 활성화, 장애 발생 시 조용히 비활성화, 2 - 활성화, 장애 발생 시 예외가 발생합니다.

## allow_experimental_prql_dialect \{#allow_experimental_prql_dialect\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "새로운 설정"}]}]}/>

SQL의 대안인 PRQL을 활성화합니다.

## allow_experimental_query_deduplication \{#allow_experimental_query_deduplication\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

part UUID를 기반으로 하는 SELECT 쿼리용 실험적 데이터 중복 제거

## allow_experimental_statistics \{#allow_experimental_statistics\}

<ExperimentalBadge/>

**별칭(Aliases)**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "설정 이름이 변경되었습니다. 이전 이름은 `allow_experimental_statistic`입니다."}]}]}/>

컬럼에 [통계(statistics)](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table)를 정의하고, [통계를 조작](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics)할 수 있도록 합니다.

## allow_experimental_time_series_aggregate_functions \{#allow_experimental_time_series_aggregate_functions\}

<ExperimentalBadge/>

**별칭**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "실험적인 timeSeries* 집계 함수를 활성화하는 새로운 설정입니다."}]}]}/>

Prometheus와 유사한 시계열 데이터의 리샘플링, rate, delta 계산을 위해 사용되는 실험적인 timeSeries* 집계 함수입니다.

## allow_experimental_time_series_table \{#allow_experimental_time_series_table\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "TimeSeries 테이블 엔진 사용을 허용하는 새 설정이 추가되었습니다"}]}]}/>

[TimeSeries](../../engines/table-engines/integrations/time-series.md) 테이블 엔진을 사용하는 테이블 생성을 허용합니다. 가능한 값은 다음과 같습니다.

- 0 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) 테이블 엔진이 비활성화됩니다.
- 1 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) 테이블 엔진이 활성화됩니다.

## allow_experimental_window_view \{#allow_experimental_window_view\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

WINDOW VIEW를 활성화합니다. 아직 충분히 성숙하지 않은 기능입니다.

## allow_experimental_ytsaurus_dictionary_source \{#allow_experimental_ytsaurus_dictionary_source\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "새 설정."}]}]}/>

YTsaurus 통합을 위한 실험적 딕셔너리 소스입니다.

## allow_experimental_ytsaurus_table_engine \{#allow_experimental_ytsaurus_table_engine\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "새 설정."}]}]}/>

YTsaurus와 통합하기 위한 실험적 테이블 엔진입니다.

## allow_experimental_ytsaurus_table_function \{#allow_experimental_ytsaurus_table_function\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

YTsaurus 통합을 위한 실험적 테이블 엔진입니다.

## allow_general_join_planning \{#allow_general_join_planning\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "해시 조인 알고리즘이 활성화된 경우, 보다 범용적인 조인 계획 알고리즘을 허용합니다."}]}]}/>

보다 범용적인 조인 계획 알고리즘을 사용해 더 복잡한 조건을 처리할 수 있게 하지만, 해시 조인에서만 작동합니다. 해시 조인이 활성화되지 않은 경우에는 이 설정 값과 관계없이 기본 조인 계획 알고리즘이 사용됩니다.

## allow_get_client_http_header \{#allow_get_client_http_header\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "새로운 함수가 도입되었습니다."}]}]}/>

현재 HTTP 요청의 헤더 값을 가져올 수 있게 하는 `getClientHTTPHeader` 함수 사용을 허용합니다. `Cookie`와 같이 민감한 정보를 포함할 수 있는 일부 헤더가 있기 때문에 보안상의 이유로 기본적으로 비활성화되어 있습니다. `X-ClickHouse-*` 및 `Authentication` 헤더는 항상 차단되며, 이 함수로 가져올 수 없습니다.

## allow_hyperscan \{#allow_hyperscan\}

<SettingsInfoBlock type="Bool" default_value="1" />

Hyperscan 라이브러리를 사용하는 함수를 허용합니다. 잠재적으로 긴 컴파일 시간과 과도한 리소스 사용을 피하려면 비활성화하십시오.

## allow_insert_into_iceberg \{#allow_insert_into_iceberg\}

<BetaBadge/>

**별칭**: `allow_experimental_insert_into_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "0"},{"label": "「INSERT INTO iceberg」 기능이 Beta 단계로 전환되었습니다."}]}, {"id": "row-2","items": [{"label": "25.7"},{"label": "0"},{"label": "새 설정입니다."}]}]}/>

Iceberg 테이블에 대한 `insert` 쿼리 실행을 허용합니다.

## allow_introspection_functions \{#allow_introspection_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리 프로파일링을 위해 [introspection functions](../../sql-reference/functions/introspection.md)를 활성화하거나 비활성화합니다.

가능한 값은 다음과 같습니다.

- 1 — introspection functions를 활성화합니다.
- 0 — introspection functions를 비활성화합니다.

**함께 보기**

- [Sampling Query Profiler](../../operations/optimizing-performance/sampling-query-profiler.md)
- 시스템 테이블 [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select \{#allow_materialized_view_with_bad_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "존재하지 않는 컬럼이나 테이블을 참조하는 MV 생성은 허용하지 않습니다"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "CREATE MATERIALIZED VIEW에서 더 엄격한 검증을 지원합니다(아직 기본값으로 활성화되지는 않음)"}]}]}/>

이 설정은 존재하지 않는 테이블이나 컬럼을 참조하는 SELECT 쿼리를 사용하는 CREATE MATERIALIZED VIEW를 허용합니다. 이때 쿼리는 문법적으로는 유효해야 합니다. refreshable materialized view에는 적용되지 않습니다. MV 스키마를 SELECT 쿼리에서 추론해야 하는 경우(즉, CREATE에 컬럼 목록과 TO 테이블이 모두 없는 경우)에는 적용되지 않습니다. 소스 테이블보다 먼저 MV를 생성하는 데 사용할 수 있습니다.

## allow_named_collection_override_by_default \{#allow_named_collection_override_by_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

기본적으로 named collection의 필드 재정의를 허용합니다.

## allow_non_metadata_alters \{#allow_non_metadata_alters\}

<SettingsInfoBlock type="Bool" default_value="1" />

테이블 메타데이터뿐만 아니라 디스크에 저장된 데이터에도 영향을 주는 ALTER 작업의 실행을 허용합니다.

## allow_nonconst_timezone_arguments \{#allow_nonconst_timezone_arguments\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*()과 같은 특정 시간 관련 함수에서 상수가 아닌 시간대(timezone) 인수를 허용합니다."}]}]}/>

toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*()과 같은 특정 시간 관련 함수에서 상수가 아닌 시간대(timezone) 인수를 허용합니다.
이 설정은 호환성 유지를 위한 목적에서만 존재합니다. ClickHouse에서는 시간대가 데이터 타입, 즉 컬럼의 속성입니다.
이 설정을 활성화하면 하나의 컬럼 안에 있는 값들이 서로 다른 시간대를 가질 수 있다는 잘못된 인상을 줍니다.
따라서 이 설정은 활성화하지 않는 것이 좋습니다.

## allow_nondeterministic_mutations \{#allow_nondeterministic_mutations\}

<SettingsInfoBlock type="Bool" default_value="0" />

복제된 테이블(Replicated Table)에서 `dictGet`와 같은 비결정적 함수(nondeterministic function)를 사용하는 뮤테이션을 허용하는 사용자 수준 설정입니다.

예를 들어 딕셔너리(dictionary)는 노드 간 상태가 서로 다를 수 있으므로, 기본적으로 이들에서 값을 조회하는 뮤테이션은 복제된 테이블에서 허용되지 않습니다. 이 설정을 활성화하면 이러한 동작이 허용되며, 사용되는 데이터가 모든 노드에서 동기화 상태를 유지하도록 보장하는 책임은 사용자에게 있습니다.

**예시**

```xml
<profiles>
    <default>
        <allow_nondeterministic_mutations>1</allow_nondeterministic_mutations>

        <!-- ... -->
    </default>

    <!-- ... -->

</profiles>
```


## allow_nondeterministic_optimize_skip_unused_shards \{#allow_nondeterministic_optimize_skip_unused_shards\}

<SettingsInfoBlock type="Bool" default_value="0" />

세그먼트 키에서 비결정적 함수(예: `rand` 또는 `dictGet`. `dictGet`는 업데이트 시 몇 가지 주의사항이 있음)를 허용합니다.

가능한 값:

- 0 — 허용하지 않습니다.
- 1 — 허용합니다.

## allow_prefetched_read_pool_for_local_filesystem \{#allow_prefetched_read_pool_for_local_filesystem\}

<SettingsInfoBlock type="Bool" default_value="0" />

모든 파트가 로컬 파일 시스템에 있는 경우 prefetched 스레드 풀 사용을 선호합니다.

## allow_prefetched_read_pool_for_remote_filesystem \{#allow_prefetched_read_pool_for_remote_filesystem\}

<SettingsInfoBlock type="Bool" default_value="1" />

모든 파트가 원격 파일 시스템에 있는 경우 미리 읽기(prefetch)용 스레드 풀을 우선 사용합니다.

## allow_push_predicate_ast_for_distributed_subqueries \{#allow_push_predicate_ast_for_distributed_subqueries\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "A new setting"}]}]}/>

analyzer가 활성화된 분산 서브쿼리에 대해 AST 수준에서 predicate pushdown을 허용합니다

## allow_push_predicate_when_subquery_contains_with \{#allow_push_predicate_when_subquery_contains_with\}

<SettingsInfoBlock type="Bool" default_value="1" />

서브쿼리에 WITH 절이 포함되어 있는 경우 프레디케이트 푸시다운을 허용합니다.

## allow_reorder_prewhere_conditions \{#allow_reorder_prewhere_conditions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

WHERE에서 PREWHERE로 조건을 이동할 때, 필터링을 최적화하기 위해 조건들의 순서를 재배열할 수 있도록 허용합니다.

## allow_settings_after_format_in_insert \{#allow_settings_after_format_in_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "INSERT 쿼리에서 FORMAT 이후에 SETTINGS를 허용하지 않습니다. ClickHouse가 SETTINGS를 값으로 해석하여 오해의 소지가 있기 때문입니다"}]}]} />

`INSERT` 쿼리에서 `FORMAT` 이후에 `SETTINGS`를 허용할지 여부를 제어합니다. `SETTINGS`의 일부를 값으로 해석할 수 있으므로 이 설정을 사용하는 것은 권장되지 않습니다.

예:

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

하지만 다음 쿼리는 `allow_settings_after_format_in_insert` 설정이 활성화된 경우에만 작동합니다:

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

가능한 값:

* 0 — 허용하지 않습니다.
* 1 — 허용합니다.

:::note
사용 사례가 기존 구문에 의존하는 경우에만 하위 호환성을 위해 이 설정을 사용하십시오.
:::


## allow_simdjson \{#allow_simdjson\}

<SettingsInfoBlock type="Bool" default_value="1" />

AVX2 명령어 집합을 사용할 수 있는 경우 'JSON*' 함수에서 simdjson 라이브러리 사용을 허용합니다. 비활성화하면 rapidjson이 사용됩니다.

## allow_special_serialization_kinds_in_output_formats \{#allow_special_serialization_kinds_in_output_formats\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "일부 출력 포맷에서 Sparse/Replicated와 같은 특수 컬럼 표현을 직접 출력할 수 있도록 활성화"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Sparse/Replicated와 같은 특수 컬럼 표현을 전체 컬럼으로 변환하지 않고 출력할 수 있도록 허용하는 설정 추가"}]}]}/>

Sparse 및 Replicated와 같은 특수 직렬화 방식이 적용된 컬럼을 전체 컬럼 표현으로 변환하지 않고 그대로 출력하도록 허용합니다.
이는 포맷팅 과정에서 불필요한 데이터 복사를 방지하는 데 도움이 됩니다.

## allow_statistics_optimize \{#allow_statistics_optimize\}

<BetaBadge/>

**Aliases**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "기본적으로 이 최적화를 활성화합니다."}]}, {"id": "row-2","items": [{"label": "24.6"},{"label": "0"},{"label": "설정 이름이 변경되었습니다. 이전 이름은 `allow_statistic_optimize`입니다."}]}]}/>

쿼리 최적화를 위해 통계 사용을 허용합니다.

## allow_suspicious_codecs \{#allow_suspicious_codecs\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "의미 없는 압축 코덱을 지정할 수 없음"}]}]}/>

true로 설정하면 의미 없는 압축 코덱도 지정할 수 있습니다.

## allow_suspicious_fixed_string_types \{#allow_suspicious_fixed_string_types\}

<SettingsInfoBlock type="Bool" default_value="0" />

CREATE TABLE 구문에서 FixedString(n) 타입의 컬럼을 n &gt; 256인 경우에도 생성할 수 있도록 허용합니다. 길이가 256 이상인 FixedString은 의심스러운 값으로 간주되며, 대부분 잘못 사용된 것일 가능성이 높습니다.

## allow_suspicious_indices \{#allow_suspicious_indices\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "true인 경우, 동일한 식으로 정의된 인덱스를 허용합니다"}]}]}/>

동일한 식으로 정의된 기본/보조 인덱스와 정렬 키를 허용하지 않습니다

## allow_suspicious_low_cardinality_types \{#allow_suspicious_low_cardinality_types\}

<SettingsInfoBlock type="Bool" default_value="0" />

고정 크기가 8바이트 이하인 데이터 타입(숫자 데이터 타입과 `FixedString(8_bytes_or_less)`)에서 [LowCardinality](../../sql-reference/data-types/lowcardinality.md)의 사용을 허용하거나 제한합니다.

작은 고정 크기 값을 사용하는 경우 `LowCardinality`를 사용하면 ClickHouse가 각 행마다 숫자 인덱스를 저장하기 때문에 일반적으로 비효율적입니다. 그 결과:

- 디스크 공간 사용량이 증가할 수 있습니다.
- 딕셔너리 크기에 따라 RAM 사용량이 더 많아질 수 있습니다.
- 일부 함수는 추가 인코딩/디코딩 작업 때문에 더 느리게 동작할 수 있습니다.

위에서 설명한 모든 이유로 인해 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 엔진 테이블에서 머지 시간이 증가할 수 있습니다.

가능한 값:

- 1 — `LowCardinality` 사용이 제한되지 않습니다.
- 0 — `LowCardinality` 사용이 제한됩니다.

## allow_suspicious_primary_key \{#allow_suspicious_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "MergeTree에서 의심스러운 PRIMARY KEY/ORDER BY(예: SimpleAggregateFunction)를 금지합니다"}]}]}/>

MergeTree에서 의심스러운 `PRIMARY KEY`/`ORDER BY`(예: SimpleAggregateFunction)를 허용합니다.

## allow_suspicious_ttl_expressions \{#allow_suspicious_ttl_expressions\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "새로운 설정이며, 이전 버전에서는 항상 허용하는 것과 동일하게 동작했습니다."}]}]}/>

해당 테이블의 어떤 컬럼에도 의존하지 않는 TTL 표현식을 거부합니다. 이는 대부분의 경우 사용자의 실수를 나타냅니다.

## allow_suspicious_types_in_group_by \{#allow_suspicious_types_in_group_by\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "기본적으로 GROUP BY에서 Variant/Dynamic 타입 사용을 허용하지 않음"}]}]}/>

GROUP BY 키에서 [Variant](../../sql-reference/data-types/variant.md) 및 [Dynamic](../../sql-reference/data-types/dynamic.md) 타입 사용을 허용하거나 제한합니다.

## allow_suspicious_types_in_order_by \{#allow_suspicious_types_in_order_by\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "기본적으로 ORDER BY에서 Variant/Dynamic 타입을 허용하지 않음"}]}]}/>

ORDER BY 키에서 [Variant](../../sql-reference/data-types/variant.md) 및 [Dynamic](../../sql-reference/data-types/dynamic.md) 타입 사용을 허용하거나 제한합니다.

## allow_suspicious_variant_types \{#allow_suspicious_variant_types\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "기본적으로 의심스러운 variant 들이 포함된 Variant 타입 생성을 허용하지 않습니다"}]}]}/>

이 설정을 사용하면 `CREATE TABLE` 문에서 유사한 variant 타입(예: 서로 다른 numeric 타입 또는 date 타입)을 가지는 Variant 타입을 지정할 수 있도록 허용합니다. 이 설정을 활성화하면 유사한 타입의 값들을 다룰 때 애매함이 발생할 수 있습니다.

## allow_unrestricted_reads_from_keeper \{#allow_unrestricted_reads_from_keeper\}

<SettingsInfoBlock type="Bool" default_value="0" />

`system.zookeeper` 테이블에서 경로 조건 없이 제한 없는 읽기를 허용합니다. 편리할 수 있지만, ZooKeeper에는 안전하지 않은 설정입니다.

## alter_move_to_space_execute_async \{#alter_move_to_space_execute_async\}

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE MOVE ... TO [DISK|VOLUME]를 비동기적으로 실행합니다.

## alter_partition_verbose_result \{#alter_partition_verbose_result\}

<SettingsInfoBlock type="Bool" default_value="0" />

파티션과 파트에 대한 조작 작업이 성공적으로 적용된 파트의 정보를 표시할지 여부를 활성화하거나 비활성화합니다.
[ATTACH PARTITION|PART](/sql-reference/statements/alter/partition#attach-partitionpart) 및 [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)에 적용됩니다.

가능한 값:

* 0 — 자세한 출력을 비활성화합니다.
* 1 — 자세한 출력을 활성화합니다.

**예시**

```sql
CREATE TABLE test(a Int64, d Date, s String) ENGINE = MergeTree PARTITION BY toYYYYMDECLARE(d) ORDER BY a;
INSERT INTO test VALUES(1, '2021-01-01', '');
INSERT INTO test VALUES(1, '2021-01-01', '');
ALTER TABLE test DETACH PARTITION ID '202101';

ALTER TABLE test ATTACH PARTITION ID '202101' SETTINGS alter_partition_verbose_result = 1;

┌─command_type─────┬─partition_id─┬─part_name────┬─old_part_name─┐
│ ATTACH PARTITION │ 202101       │ 202101_7_7_0 │ 202101_5_5_0  │
│ ATTACH PARTITION │ 202101       │ 202101_8_8_0 │ 202101_6_6_0  │
└──────────────────┴──────────────┴──────────────┴───────────────┘

ALTER TABLE test FREEZE SETTINGS alter_partition_verbose_result = 1;

┌─command_type─┬─partition_id─┬─part_name────┬─backup_name─┬─backup_path───────────────────┬─part_backup_path────────────────────────────────────────────┐
│ FREEZE ALL   │ 202101       │ 202101_7_7_0 │ 8           │ /var/lib/clickhouse/shadow/8/ │ /var/lib/clickhouse/shadow/8/data/default/test/202101_7_7_0 │
│ FREEZE ALL   │ 202101       │ 202101_8_8_0 │ 8           │ /var/lib/clickhouse/shadow/8/ │ /var/lib/clickhouse/shadow/8/data/default/test/202101_8_8_0 │
└──────────────┴──────────────┴──────────────┴─────────────┴───────────────────────────────┴─────────────────────────────────────────────────────────────┘
```


## alter_sync \{#alter_sync\}

**별칭**: `replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

[`ALTER`](../../sql-reference/statements/alter/index.md), [`OPTIMIZE`](../../sql-reference/statements/optimize.md) 또는 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 쿼리에 의해 레플리카에서 실행될 작업에 대해, 대기 동작을 지정합니다.

가능한 값:

- `0` — 대기하지 않습니다.
- `1` — 로컬에서의 실행이 완료될 때까지 대기합니다.
- `2` — 모든 레플리카에서의 실행이 완료될 때까지 대기합니다.
- `3` — 활성 레플리카에 대해서만 대기합니다.

Cloud 기본값: `1`.

:::note
`alter_sync`는 `Replicated` 및 `SharedMergeTree` 테이블에만 적용되며, `Replicated` 또는 `Shared` 테이블이 아닌 경우에는 아무 동작도 하지 않습니다.
:::

## alter_update_mode \{#alter_update_mode\}

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "A new setting"}]}]}/>

`UPDATE` 명령이 포함된 `ALTER` 쿼리의 모드입니다.

가능한 값:

- `heavy` - 일반 mutation을 실행합니다.
- `lightweight` - 가능하면 경량 업데이트를 실행하고, 그렇지 않으면 일반 mutation을 실행합니다.
- `lightweight_force` - 가능하면 경량 업데이트를 실행하고, 그렇지 않으면 예외를 발생시킵니다.

## analyze_index_with_space_filling_curves \{#analyze_index_with_space_filling_curves\}

<SettingsInfoBlock type="Bool" default_value="1" />

테이블 인덱스에 공간 채움 곡선(space-filling curve)이 지정되어 있고(예: `ORDER BY mortonEncode(x, y)` 또는 `ORDER BY hilbertEncode(x, y)`), 쿼리에 해당 인자에 대한 조건이 있는 경우(예: `x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`), 인덱스 분석 시 이 공간 채움 곡선을 사용합니다.

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested \{#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting."}]}]}/>

Nested에 복합 식별자를 추가하도록 허용합니다. 이 설정은 쿼리 결과를 변경하므로 호환성 설정입니다. 비활성화된 경우 `SELECT a.b.c FROM table ARRAY JOIN a` 는 동작하지 않으며, `SELECT a FROM table` 의 결과에 `Nested a` 내의 `a.b.c` 컬럼이 포함되지 않습니다.

## analyzer_compatibility_join_using_top_level_identifier \{#analyzer_compatibility_join_using_top_level_identifier\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "projection에서 JOIN USING의 식별자 해석을 강제 적용"}]}]}/>

projection에서 JOIN USING에 사용되는 식별자를 강제로 해석합니다(예를 들어 `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)`의 경우 조인은 `t1.b = t2.b`가 아니라 `t1.a + 1 = t2.b` 조건으로 수행됩니다).

## any_join_distinct_right_table_keys \{#any_join_distinct_right_table_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "기본값으로 ANY RIGHT 및 ANY FULL JOIN을 비활성화하여 비일관성을 방지"}]}]}/>

`ANY INNER|LEFT JOIN` 연산에서 레거시 ClickHouse 서버의 동작을 활성화합니다.

:::note
레거시 `JOIN` 동작에 의존하는 사용 사례가 있는 경우, 하위 호환성을 위해서만 이 설정을 사용하십시오.
:::

레거시 동작을 활성화한 경우:

- `t1 ANY LEFT JOIN t2` 및 `t2 ANY RIGHT JOIN t1` 연산 결과가 서로 같지 않습니다. ClickHouse가 왼쪽 테이블에서 오른쪽 테이블로의 다대일(left-to-right) 테이블 키 매핑 로직을 사용하기 때문입니다.
- `ANY INNER JOIN` 연산 결과는 `SEMI LEFT JOIN` 연산과 마찬가지로 왼쪽 테이블의 모든 행을 포함합니다.

레거시 동작을 비활성화한 경우:

- `t1 ANY LEFT JOIN t2` 및 `t2 ANY RIGHT JOIN t1` 연산 결과가 동일합니다. ClickHouse가 `ANY RIGHT JOIN` 연산에서 일대다 키 매핑을 사용하는 로직을 사용하기 때문입니다.
- `ANY INNER JOIN` 연산 결과는 왼쪽 및 오른쪽 테이블 모두에서 각 키당 하나의 행만 포함합니다.

가능한 값:

- 0 — 레거시 동작이 비활성화됩니다.
- 1 — 레거시 동작이 활성화됩니다.

함께 보기:

- [JOIN strictness](/sql-reference/statements/select/join#settings)

## apply_deleted_mask \{#apply_deleted_mask\}

<SettingsInfoBlock type="Bool" default_value="1" />

경량한 삭제(lightweight DELETE)로 삭제된 행을 필터링하도록 설정합니다. 비활성화하면 쿼리가 이러한 행을 읽을 수 있습니다. 이는 디버깅 또는 「삭제 취소(undelete)」 시나리오에서 유용합니다.

## apply_mutations_on_fly \{#apply_mutations_on_fly\}

<SettingsInfoBlock type="Bool" default_value="0" />

true인 경우, 데이터 파트(data part)에 구체화되지 않은 뮤테이션(UPDATE 및 DELETE)이 SELECT 쿼리 실행 시 적용됩니다.

## apply_patch_parts \{#apply_patch_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

값이 true이면, 경량 업데이트를 나타내는 패치 파트가 SELECT 쿼리에서 적용됩니다.

## apply_patch_parts_join_cache_buckets \{#apply_patch_parts_join_cache_buckets\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "New setting"}]}]}/>

Join 모드에서 패치 파트를 적용할 때 사용하는 임시 캐시의 버킷 수입니다.

## apply_prewhere_after_final \{#apply_prewhere_after_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "새로운 설정입니다. 활성화하면 PREWHERE 조건이 FINAL 처리 후에 적용됩니다."}]}]}/>

이 설정을 활성화하면 ReplacingMergeTree 및 유사한 엔진에서 PREWHERE 조건이 FINAL 처리 후에 적용됩니다.
이는 PREWHERE가 중복 행 전체에서 서로 다른 값을 가질 수 있는 컬럼을 참조하고,
필터링 전에 FINAL이 승자 행을 선택하도록 하려는 경우에 유용합니다. 이 설정이 비활성화되어 있으면 PREWHERE는 데이터 읽기 시점에 적용됩니다.
참고: apply_row_level_security_after_final이 활성화되어 있고 ROW POLICY가 정렬 키가 아닌 컬럼을 사용하는 경우,
올바른 실행 순서를 유지하기 위해 PREWHERE도 지연 적용됩니다(ROW POLICY가 PREWHERE보다 먼저 적용되어야 합니다).

## apply_row_policy_after_final \{#apply_row_policy_after_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "apply_row_policy_after_final을 기본값으로 활성화합니다. 25.8에서는 #87303 이전에 이미 이렇게 동작했습니다"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "0"},{"label": "row policy와 PREWHERE를 *MergeTree 테이블에 대한 FINAL 처리 이후에 적용할지 여부를 제어하는 새로운 설정입니다"}]}]}/>

이 설정을 활성화하면 *MergeTree 테이블에 대해 FINAL 처리가 완료된 후에 ROW POLICY와 PREWHERE가 적용됩니다. (특히 ReplacingMergeTree에 해당합니다)
비활성화하면 ROW POLICY는 FINAL 이전에 적용되며, 이 경우 ReplacingMergeTree 또는 유사한 엔진에서 중복 제거에 사용되어야 하는 행을
ROW POLICY가 필터링해 결과가 달라질 수 있습니다.

ROW POLICY 표현식이 ORDER BY에 포함된 컬럼에만 의존하는 경우, 이러한 필터링은 중복 제거 결과에 영향을 줄 수 없으므로
최적화를 위해 여전히 FINAL 이전에 적용됩니다.

가능한 값:

- 0 — ROW POLICY와 PREWHERE가 FINAL 이전에 적용됩니다(기본값).
- 1 — ROW POLICY와 PREWHERE가 FINAL 이후에 적용됩니다.

## apply_settings_from_server \{#apply_settings_from_server\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "클라이언트 측 코드(예: INSERT 입력 파싱 및 쿼리 출력 포맷팅)가 서버와 동일한 설정을 사용하며, 서버 설정 파일의 설정도 포함합니다."}]}]}/>

클라이언트가 서버로부터 설정을 수신하여 적용할지 여부입니다.

이는 특히 INSERT 입력 데이터 파싱과 쿼리 결과 포맷팅처럼 클라이언트 측에서 수행되는 작업에만 영향을 줍니다. 쿼리 실행의 대부분은 서버에서 수행되며 이 설정의 영향을 받지 않습니다.

일반적으로 이 설정은 클라이언트(클라이언트 명령줄 인자, `SET` 쿼리, `SELECT` 쿼리의 `SETTINGS` 섹션)를 통해서가 아니라 사용자 프로필(users.xml 또는 `ALTER USER`와 같은 쿼리)에서 설정해야 합니다. 클라이언트를 통해 이 값을 false로 변경할 수는 있지만, true로 변경할 수는 없습니다(사용자 프로필에 `apply_settings_from_server = false`가 설정되어 있으면 서버가 설정을 전송하지 않기 때문입니다).

초기 버전(24.12)에는 서버 설정(`send_settings_to_client`)이 있었으나, 이후 사용성을 높이기 위해 이 클라이언트 설정으로 대체되었습니다.

## archive_adaptive_buffer_max_size_bytes \{#archive_adaptive_buffer_max_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="8388608" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "8388608"},{"label": "New setting"}]}]}/>

아카이브 파일(예: tar 아카이브)에 데이터를 쓸 때 사용되는 적응형 버퍼의 최대 크기를 제한합니다.

## arrow_flight_request_descriptor_type \{#arrow_flight_request_descriptor_type\}

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "새로운 설정입니다. Arrow Flight 요청에 사용할 디스크립터(descriptor) 유형입니다: 'path' 또는 'command'. Dremio에서는 'command'가 필요합니다."}]}]}/>

Arrow Flight 요청에 사용할 디스크립터(descriptor) 유형입니다. 'path'는 데이터세트 이름을 경로 디스크립터(path descriptor)로 전송합니다. 'command'는 SQL 쿼리를 커맨드 디스크립터(command descriptor)로 전송합니다(Dremio에서 필요).

가능한 값:

- 'path' — FlightDescriptor::Path를 사용합니다(기본값, 대부분의 Arrow Flight 서버에서 동작).
- 'command' — SELECT 쿼리와 함께 FlightDescriptor::Command를 사용합니다(Dremio에서 필요).

## asterisk_include_alias_columns \{#asterisk_include_alias_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

와일드카드 쿼리(`SELECT *`)에서 [ALIAS](../../sql-reference/statements/create/table.md/#alias) 컬럼을 포함합니다.

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## asterisk_include_materialized_columns \{#asterisk_include_materialized_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

와일드카드 쿼리(`SELECT *`)에서 [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 컬럼을 포함할지 여부를 지정합니다.

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## async_insert \{#async_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

true인 경우, INSERT 쿼리로 들어온 데이터는 큐에 저장된 뒤 백그라운드에서 테이블로 플러시됩니다. wait_for_async_insert가 false이면 INSERT 쿼리는 거의 즉시 처리되고, 그렇지 않으면 클라이언트는 데이터가 테이블로 플러시될 때까지 대기합니다.

## async_insert_busy_timeout_decrease_rate \{#async_insert_busy_timeout_decrease_rate\}

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "적응형 비동기 insert 타임아웃이 감소하는 지수적 감소율"}]}]}/>

적응형 비동기 insert 타임아웃이 감소하는 지수적 감소율

## async_insert_busy_timeout_increase_rate \{#async_insert_busy_timeout_increase_rate\}

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "적응형 비동기 insert 타임아웃이 증가하는 지수적 비율"}]}]}/>

적응형 비동기 insert 타임아웃이 증가하는 지수적 비율

## async_insert_busy_timeout_max_ms \{#async_insert_busy_timeout_max_ms\}

**별칭**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="Milliseconds" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "비동기 insert 타임아웃의 최소값(밀리초)입니다. async_insert_busy_timeout_ms는 async_insert_busy_timeout_max_ms의 별칭입니다."}]}]}/>

첫 데이터가 나타난 시점부터, 해당 쿼리에서 수집된 데이터를 덤프하기 전까지 대기하는 최대 시간입니다.

## async_insert_busy_timeout_min_ms \{#async_insert_busy_timeout_min_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "비동기 삽입 타임아웃의 최소값(밀리초)입니다. 이후 적응 알고리즘에 의해 증가될 수 있는 초기값으로도 사용됩니다."}]}]}/>

async_insert_use_adaptive_busy_timeout을 통해 자동 조정이 활성화된 경우, 최초 데이터가 나타난 이후 쿼리별로 수집된 데이터를 덤프(기록)하기 전에 대기하는 최소 시간입니다. 또한 적응 알고리즘의 초기값으로도 사용됩니다.

## async_insert_deduplicate \{#async_insert_deduplicate\}

<SettingsInfoBlock type="Bool" default_value="0" />

복제된 테이블(Replicated Table)에서 async INSERT 쿼리를 실행할 때, 삽입되는 블록에 대한 중복 제거를 수행할지 여부를 지정합니다.

## async_insert_max_data_size \{#async_insert_max_data_size\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "이전 값이 너무 작은 것으로 판단되었습니다."}]}]}/>

삽입되기 전에 쿼리별로 수집되는 파싱되지 않은 데이터의 최대 크기(바이트 단위)입니다

## async_insert_max_query_number \{#async_insert_max_query_number\}

<SettingsInfoBlock type="UInt64" default_value="450" />

삽입이 실제로 수행되기 전에 허용되는 최대 insert 쿼리 개수입니다.
[`async_insert_deduplicate`](#async_insert_deduplicate) 설정이 1일 때에만 적용됩니다.

## async_insert_poll_timeout_ms \{#async_insert_poll_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "비동기 삽입 큐에서 데이터를 폴링할 때의 타임아웃(밀리초 단위)"}]}]}/>

비동기 삽입 큐에서 데이터를 폴링할 때의 타임아웃

## async_insert_use_adaptive_busy_timeout \{#async_insert_use_adaptive_busy_timeout\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Use adaptive asynchronous insert timeout"}]}]}/>

true로 설정하면 비동기 insert에 대해 adaptive busy timeout을 사용합니다.

## async_query_sending_for_remote \{#async_query_sending_for_remote\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "세그먼트 전체에 대해 비동기적으로 연결을 생성하고 쿼리를 전송합니다"}]}]}/>

원격 쿼리를 실행할 때 비동기적으로 연결을 생성하고 쿼리를 전송하도록 활성화합니다.

기본적으로 활성화되어 있습니다.

## async_socket_for_remote \{#async_socket_for_remote\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "모든 문제를 수정하고 원격 쿼리에 대해 소켓에서 비동기 읽기를 다시 기본값으로 활성화합니다"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "일부 문제로 인해 원격 쿼리에 대해 소켓에서 비동기 읽기를 비활성화합니다"}]}]}/>

원격 쿼리를 실행하는 동안 소켓에서 비동기 읽기를 활성화합니다.

기본적으로 활성화되어 있습니다.

## automatic_parallel_replicas_min_bytes_per_replica \{#automatic_parallel_replicas_min_bytes_per_replica\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1048576"},{"label": "테스트 결과를 기반으로 산출된 더 적절한 기본값"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "0"},{"label": "새로운 설정"}]}]}/>

`automatic_parallel_replicas_mode`=1일 때 병렬 레플리카를 자동으로 활성화하기 위한 레플리카당 최소 읽기 바이트 수 임계값입니다. 0은 임계값이 없음을 의미합니다.
읽어야 하는 전체 바이트 수는 수집된 통계를 기반으로 추정됩니다.

## automatic_parallel_replicas_mode \{#automatic_parallel_replicas_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "새 설정"}]}]}/>

수집된 통계에 기반하여 병렬 레플리카를 사용한 실행으로 자동 전환하도록 활성화합니다. 이를 위해서는 `parallel_replicas_local_plan`을 활성화하고 `cluster_for_parallel_replicas`를 지정해야 합니다.  
0 - 비활성화, 1 - 활성화, 2 - 통계 수집만 활성화(병렬 레플리카 실행으로의 전환은 비활성화).

## azure_allow_parallel_part_upload \{#azure_allow_parallel_part_upload\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "true"},{"label": "Azure 멀티파트 업로드 시 여러 스레드를 사용합니다."}]}]}/>

Azure 멀티파트 업로드 시 여러 스레드를 사용합니다.

## azure_check_objects_after_upload \{#azure_check_objects_after_upload\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "업로드가 성공적으로 완료되었는지 확인하기 위해 Azure Blob Storage에 업로드된 각 객체를 검사합니다"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "업로드가 성공적으로 완료되었는지 확인하기 위해 Azure Blob Storage에 업로드된 각 객체를 검사합니다"}]}]}/>

업로드가 성공적으로 완료되었는지 확인하기 위해 Azure Blob Storage에 업로드된 각 객체를 검사합니다

## azure_connect_timeout_ms \{#azure_connect_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "New setting"}]}]}/>

Azure 디스크 호스트에 대한 연결 시간 제한입니다.

## azure_create_new_file_on_insert \{#azure_create_new_file_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

azure engine 테이블에서 각 insert 작업마다 새 파일을 생성할지 여부를 활성화하거나 비활성화합니다.

## azure_ignore_file_doesnt_exist \{#azure_ignore_file_doesnt_exist\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "요청한 파일이 AzureBlobStorage 테이블 엔진에 존재하지 않을 때 예외를 던지는 대신 0개의 행을 반환하도록 허용합니다"}]}]}/>

특정 키를 읽을 때 해당 파일이 존재하지 않으면, 파일이 없다는 사실을 무시합니다.

가능한 값:

- 1 — `SELECT`가 빈 결과를 반환합니다.
- 0 — `SELECT`가 예외를 발생시킵니다.

## azure_list_object_keys_size \{#azure_list_object_keys_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject 요청 한 번에 배치로 반환될 수 있는 최대 파일 개수입니다.

## azure_max_blocks_in_multipart_upload \{#azure_max_blocks_in_multipart_upload\}

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Azure용 multipart 업로드에서 사용할 수 있는 최대 블록 개수입니다."}]}]}/>

Azure용 multipart 업로드에서 사용할 수 있는 최대 블록 개수입니다.

## azure_max_get_burst \{#azure_max_get_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

초당 요청 수 한도에 도달하기 전에 동시에 보낼 수 있는 최대 요청 수입니다. 기본값(0)은 `azure_max_get_rps`와 동일합니다.

## azure_max_get_rps \{#azure_max_get_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "새 설정"}]}]}/>

초당 Azure GET 요청 수에 대한 제한입니다. 0이면 제한이 없음을 의미합니다.

## azure_max_inflight_parts_for_one_file \{#azure_max_inflight_parts_for_one_file\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "멀티파트 업로드 요청에서 동시에 업로드되는 파트의 최대 개수입니다. 0이면 무제한입니다."}]}]}/>

멀티파트 업로드 요청에서 동시에 업로드되는 파트의 최대 개수입니다. 0이면 무제한입니다.

## azure_max_put_burst \{#azure_max_put_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

초당 요청 수 제한에 도달하기 전에 동시에 보낼 수 있는 최대 요청 수입니다. 기본값(0)은 `azure_max_put_rps`와 같습니다.

## azure_max_put_rps \{#azure_max_put_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

스로틀링(throttling)이 적용되기 전 Azure PUT 요청의 초당 횟수 한도입니다. 0이면 제한이 없음을 의미합니다.

## azure_max_redirects \{#azure_max_redirects\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "New setting"}]}]}/>

허용되는 Azure 리디렉션 홉의 최대 횟수입니다.

## azure_max_single_part_copy_size \{#azure_max_single_part_copy_size\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "Azure Blob Storage에서 단일 파트 복사(single-part copy)를 사용할 때 복사할 수 있는 개체의 최대 크기."}]}]}/>

Azure Blob Storage에서 단일 파트 복사(single-part copy)를 사용할 때 복사할 수 있는 개체의 최대 크기입니다.

## azure_max_single_part_upload_size \{#azure_max_single_part_upload_size\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "Align with S3"}]}]}/>

Azure Blob Storage에서 single-part 업로드를 사용할 때 단일 요청으로 업로드할 수 있는 객체의 최대 크기입니다.

## azure_max_single_read_retries \{#azure_max_single_read_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

단일 Azure Blob Storage 읽기에서 허용되는 최대 재시도 횟수입니다.

## azure_max_unexpected_write_error_retries \{#azure_max_unexpected_write_error_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "Azure Blob Storage에 쓰기 작업을 수행하는 동안 예기치 않은 오류가 발생했을 때 허용되는 최대 재시도 횟수"}]}]}/>

Azure Blob Storage에 쓰기 작업을 수행하는 동안 예기치 않은 오류가 발생했을 때 허용되는 최대 재시도 횟수입니다.

## azure_max_upload_part_size \{#azure_max_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "Azure Blob Storage에 멀티파트 업로드를 수행할 때 업로드하는 파트의 최대 크기입니다."}]}]}/>

Azure Blob Storage에 멀티파트 업로드를 수행할 때 업로드하는 파트의 최대 크기입니다.

## azure_min_upload_part_size \{#azure_min_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "Azure Blob Storage로 멀티파트 업로드 시 업로드되는 파트의 최소 크기입니다."}]}]}/>

Azure Blob Storage로 멀티파트 업로드 시 업로드되는 파트의 최소 크기입니다.

## azure_request_timeout_ms \{#azure_request_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "새 설정"}]}]}/>

Azure로 데이터를 송신하거나 수신할 때 적용되는 유휴 시간 제한입니다. 단일 TCP 읽기 또는 쓰기 호출이 이 시간 동안 차단 상태로 유지되면 실패합니다.

## azure_sdk_max_retries \{#azure_sdk_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK에서 수행할 최대 재시도 횟수"}]}]}/>

Azure SDK에서 수행할 최대 재시도 횟수

## azure_sdk_retry_initial_backoff_ms \{#azure_sdk_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK에서 재시도 간 최소 백오프 시간"}]}]}/>

Azure SDK에서 재시도 간 최소 백오프 시간

## azure_sdk_retry_max_backoff_ms \{#azure_sdk_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Maximal backoff between retries in azure sdk"}]}]}/>

Azure SDK에서 재시도 간의 최대 백오프(backoff) 대기 시간

## azure_skip_empty_files \{#azure_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "azure table engine에서 빈 파일을 건너뛸 수 있도록 허용"}]}]}/>

S3 engine에서 빈 파일을 건너뛸지 여부를 활성화하거나 비활성화합니다.

가능한 값:

- 0 — 빈 파일이 요청된 포맷과 호환되지 않으면 `SELECT`가 예외를 발생시킵니다.
- 1 — 빈 파일에 대해 `SELECT`가 빈 결과를 반환합니다.

## azure_strict_upload_part_size \{#azure_strict_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Azure Blob Storage에 멀티파트 업로드를 수행할 때 업로드할 각 파트의 정확한 크기입니다."}]}]}/>

Azure Blob Storage에 멀티파트 업로드를 수행할 때 업로드할 각 파트의 정확한 크기입니다.

## azure_throw_on_zero_files_match \{#azure_throw_on_zero_files_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "AzureBlobStorage 엔진에서 ListObjects 요청이 어떤 파일과도 일치하지 않을 때, 빈 쿼리 결과를 반환하는 대신 오류를 발생하도록 허용합니다"}]}]}/>

glob 확장 규칙에 따라 일치하는 파일이 0개인 경우 오류를 발생시킵니다.

가능한 값:

- 1 — `SELECT`가 예외를 발생시킵니다.
- 0 — `SELECT`가 빈 결과를 반환합니다.

## azure_truncate_on_insert \{#azure_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

Azure 엔진 테이블에서 INSERT 전에 TRUNCATE를 수행할지 여부를 설정합니다.

## azure_upload_part_size_multiply_factor \{#azure_upload_part_size_multiply_factor\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "단일 쓰기 작업에서 Azure Blob Storage로 업로드된 파트 수가 azure_multiply_parts_count_threshold에 도달할 때마다 azure_min_upload_part_size에 이 계수를 곱합니다."}]}]}/>

단일 쓰기 작업에서 Azure Blob Storage로 업로드된 파트 수가 azure_multiply_parts_count_threshold에 도달할 때마다 azure_min_upload_part_size에 이 계수를 곱합니다.

## azure_upload_part_size_multiply_parts_count_threshold \{#azure_upload_part_size_multiply_parts_count_threshold\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "지정된 개수의 파트가 Azure Blob Storage에 업로드될 때마다 azure_min_upload_part_size 값은 azure_upload_part_size_multiply_factor 값과 곱해집니다."}]}]}/>

지정된 개수의 파트가 Azure Blob Storage에 업로드될 때마다 azure_min_upload_part_size 값은 azure_upload_part_size_multiply_factor 값과 곱해집니다.

## azure_use_adaptive_timeouts \{#azure_use_adaptive_timeouts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

`true`로 설정하면 모든 Azure 요청에 대해 처음 두 번의 시도는 짧은 송신 및 수신 타임아웃 값으로 수행됩니다.
`false`로 설정하면 모든 시도가 동일한 타임아웃 값으로 수행됩니다.

## backup_restore_batch_size_for_keeper_multi \{#backup_restore_batch_size_for_keeper_multi\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

백업 또는 복원 작업 중 [Zoo]Keeper에 대한 멀티 요청 배치의 최대 크기입니다.

## backup_restore_batch_size_for_keeper_multiread \{#backup_restore_batch_size_for_keeper_multiread\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

백업 또는 복구 중 [Zoo]Keeper에 대한 multiread 요청 배치의 최대 크기입니다.

## backup_restore_failure_after_host_disconnected_for_seconds \{#backup_restore_failure_after_host_disconnected_for_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "새 설정입니다."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "새 설정입니다."}]}]}/>

BACKUP ON CLUSTER 또는 RESTORE ON CLUSTER 작업 도중 호스트가 이 시간 동안 ZooKeeper에서 임시 'alive' 노드를 다시 생성하지 못하면 전체 백업 또는 복원 작업이 실패한 것으로 간주됩니다.
이 값은 장애 발생 후 호스트가 ZooKeeper에 다시 연결되는 데 필요한 어떤 합리적인 시간보다 크게 설정해야 합니다.
0으로 설정하면 제한이 없음을 의미합니다.

## backup_restore_finish_timeout_after_error_sec \{#backup_restore_finish_timeout_after_error_sec\}

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "새로운 설정."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "새로운 설정."}]}]}/>

이니시에이터 호스트가 다른 호스트들이 'error' 노드에 반응하여 현재 BACKUP ON CLUSTER 또는 RESTORE ON CLUSTER 작업을 중단할 때까지 얼마 동안 대기해야 하는지를 지정합니다.

## backup_restore_keeper_fault_injection_probability \{#backup_restore_keeper_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

백업 또는 복원 중 Keeper 요청이 실패할 대략적인 확률입니다. 유효한 값은 [0.0f, 1.0f] 구간입니다.

## backup_restore_keeper_fault_injection_seed \{#backup_restore_keeper_fault_injection_seed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0이면 무작위 시드를 사용하고, 0이 아니면 설정 값 자체를 시드로 사용합니다

## backup_restore_keeper_max_retries \{#backup_restore_keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "BACKUP 또는 RESTORE 전체 작업이, 중간에 발생하는 일시적인 [Zoo]Keeper 장애 때문에 실패하지 않도록 충분히 큰 값으로 설정해야 합니다."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "BACKUP 또는 RESTORE 전체 작업이, 중간에 발생하는 일시적인 [Zoo]Keeper 장애 때문에 실패하지 않도록 충분히 큰 값으로 설정해야 합니다."}]}]}/>

BACKUP 또는 RESTORE 작업 중간에 수행되는 [Zoo]Keeper 작업의 최대 재시도 횟수입니다.  
전체 작업이 중간에 발생하는 일시적인 [Zoo]Keeper 장애 때문에 실패하지 않도록 충분히 큰 값으로 설정해야 합니다.

## backup_restore_keeper_max_retries_while_handling_error \{#backup_restore_keeper_max_retries_while_handling_error\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "새 설정."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "새 설정."}]}]}/>

BACKUP ON CLUSTER 또는 RESTORE ON CLUSTER 작업에서 오류를 처리하는 동안 수행하는 [Zoo]Keeper 작업의 최대 재시도 횟수입니다.

## backup_restore_keeper_max_retries_while_initializing \{#backup_restore_keeper_max_retries_while_initializing\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

BACKUP ON CLUSTER 또는 RESTORE ON CLUSTER 작업 초기화 중 수행되는 [Zoo]Keeper 작업의 최대 재시도 횟수입니다.

## backup_restore_keeper_retry_initial_backoff_ms \{#backup_restore_keeper_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

백업 또는 복원 중 [Zoo]Keeper 작업에 대한 초기 백오프 지연 시간

## backup_restore_keeper_retry_max_backoff_ms \{#backup_restore_keeper_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

백업 또는 복원 중 [Zoo]Keeper 작업에 적용되는 최대 백오프 시간입니다.

## backup_restore_keeper_value_max_size \{#backup_restore_keeper_value_max_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

백업 과정에서 [Zoo]Keeper 노드에 저장되는 데이터의 최대 크기

## backup_restore_s3_retry_attempts \{#backup_restore_s3_retry_attempts\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Aws::Client::RetryStrategy에 대한 설정입니다. Aws::Client가 자체적으로 재시도를 수행하며, 0으로 설정하면 재시도를 수행하지 않습니다. 이 설정은 백업/복원에만 적용됩니다."}]}]}/>

Aws::Client::RetryStrategy에 대한 설정입니다. Aws::Client가 자체적으로 재시도를 수행하며, 0으로 설정하면 재시도를 수행하지 않습니다. 이 설정은 백업/복원에만 적용됩니다.

## backup_restore_s3_retry_initial_backoff_ms \{#backup_restore_s3_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "New setting"}]}]}/>

백업 및 복원 중 첫 번째 재시도 전에 적용되는 초기 백오프 지연 시간(밀리초)입니다. 이후 각 재시도마다 지연 시간이 지수적으로 증가하며, `backup_restore_s3_retry_max_backoff_ms`에 의해 지정된 최대값까지 증가합니다.

## backup_restore_s3_retry_jitter_factor \{#backup_restore_s3_retry_jitter_factor\}

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "새 설정"}]}]}/>

백업 및 복원 작업 동안 `Aws::Client::RetryStrategy`에서 재시도 백오프 지연(backoff delay)에 적용되는 지터(jitter) 계수입니다. 계산된 백오프 지연은 [1.0, 1.0 + jitter] 범위의 무작위 계수와 곱해지며, 최대 `backup_restore_s3_retry_max_backoff_ms`까지 증가할 수 있습니다. 값은 [0.0, 1.0] 구간 내에 있어야 합니다.

## backup_restore_s3_retry_max_backoff_ms \{#backup_restore_s3_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "New setting"}]}]}/>

백업 및 복원 작업에서 재시도 간의 최대 지연 시간(밀리초)입니다.

## backup_slow_all_threads_after_retryable_s3_error \{#backup_slow_all_threads_after_retryable_s3_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "Disable the setting by default"}]}]}/>

`true`로 설정하면 동일한 백업 엔드포인트에 대해 S3 요청을 실행하는 모든 스레드는, 어느 하나의 S3 요청이라도 'Slow Down'과 같은 재시도 가능한 S3 오류를 만나면 모두 속도가 느려지도록 조정됩니다.
`false`로 설정하면 각 스레드는 다른 스레드와 독립적으로 S3 요청 백오프(backoff)를 처리합니다.

## cache_warmer_threads \{#cache_warmer_threads\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

ClickHouse Cloud에서만 적용됩니다. [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)가 활성화된 경우, 새로운 데이터 파트를 파일 시스템 캐시에 추측적으로 미리 다운로드하기 위한 백그라운드 스레드 수입니다. 0으로 설정하면 비활성화됩니다.

## calculate_text_stack_trace \{#calculate_text_stack_trace\}

<SettingsInfoBlock type="Bool" default_value="1" />

쿼리 실행 중 예외가 발생하는 경우 텍스트 스택 트레이스를 계산합니다. 기본값입니다. 이 설정은 심볼 조회를 필요로 하며, 잘못된 쿼리가 대량으로 실행되는 퍼징 테스트의 속도를 저하시킬 수 있습니다. 일반적인 상황에서는 이 옵션을 비활성화하지 않는 것이 좋습니다.

## cancel_http_readonly_queries_on_client_close \{#cancel_http_readonly_queries_on_client_close\}

<SettingsInfoBlock type="Bool" default_value="0" />

클라이언트가 응답을 기다리지 않고 연결을 종료하면 HTTP 읽기 전용 쿼리(예: `SELECT`)를 취소합니다.

Cloud에서의 기본값: `0`.

## cast_ipv4_ipv6_default_on_conversion_error \{#cast_ipv4_ipv6_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "함수 cast(value, 'IPv4') 및 cast(value, 'IPv6')가 toIPv4 및 toIPv6 함수와 동일하게 동작하도록 변경"}]}]}/>

IPv4 형 및 IPv6 형으로 변환하는 CAST 연산자와 toIPv4, toIPv6 함수는 변환 오류가 발생하면 예외를 발생시키는 대신 기본값을 반환합니다.

## cast_keep_nullable \{#cast_keep_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

[CAST](/sql-reference/functions/type-conversion-functions#CAST) 연산에서 `Nullable` 데이터 타입(널 허용 타입)을 유지할지 여부를 설정합니다.

이 설정이 활성화되어 있고 `CAST` 함수의 인자가 `Nullable`인 경우, 결과도 `Nullable` 타입으로 변환됩니다. 이 설정이 비활성화되어 있으면 결과는 항상 지정한 대상 데이터 타입과 정확히 동일한 타입이 됩니다.

가능한 값:

* 0 — `CAST` 결과는 지정된 대상 데이터 타입과 정확히 동일합니다.
* 1 — 인자 타입이 `Nullable`인 경우, `CAST` 결과는 `Nullable(DestinationDataType)`으로 변환됩니다.

**예시**

다음 쿼리의 결과는 대상 데이터 타입과 정확히 동일한 타입입니다:

```sql
SET cast_keep_nullable = 0;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

결과:

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Int32                                             │
└───┴───────────────────────────────────────────────────┘
```

다음 쿼리를 실행하면 대상 데이터 유형에 `Nullable` 변형이 적용됩니다.

```sql
SET cast_keep_nullable = 1;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

결과:

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Nullable(Int32)                                   │
└───┴───────────────────────────────────────────────────┘
```

**참고 항목**

* [CAST](/sql-reference/functions/type-conversion-functions#CAST) 함수


## cast_string_to_date_time_mode \{#cast_string_to_date_time_mode\}

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "Allow to use different DateTime parsing mode in String to DateTime cast"}]}]}/>

`String`에서 `DateTime`으로 캐스팅할 때, 날짜와 시간의 텍스트 표현을 해석하는 데 사용할 파서를 선택합니다.

가능한 값:

- `'best_effort'` — 확장 파싱을 활성화합니다.

    ClickHouse는 기본 형식인 `YYYY-MM-DD HH:MM:SS`와 모든 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 날짜 및 시간 형식을 파싱할 수 있습니다. 예: `'2018-06-08T01:02:03.000Z'`.

- `'best_effort_us'` — `best_effort`와 유사합니다(차이점은 [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS) 참고).

- `'basic'` — 기본 파서를 사용합니다.

    ClickHouse는 `YYYY-MM-DD HH:MM:SS` 또는 `YYYY-MM-DD` 기본 형식만 파싱할 수 있습니다. 예: `2019-08-20 10:18:56` 또는 `2019-08-20`.

관련 항목:

- [DateTime 데이터 타입.](../../sql-reference/data-types/datetime.md)
- [날짜와 시간을 다루는 함수.](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference \{#cast_string_to_dynamic_use_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "Add setting to allow converting String to Dynamic through parsing"}]}]}/>

String을 Dynamic으로 변환할 때 타입 추론을 사용합니다

## cast_string_to_variant_use_inference \{#cast_string_to_variant_use_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "String에서 Variant로 CAST할 때 타입 추론을 활성화하거나 비활성화하기 위한 새로운 설정"}]}]}/>

String에서 Variant로 변환할 때 타입 추론을 사용합니다.

## check_named_collection_dependencies \{#check_named_collection_dependencies\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "명명된 컬렉션을 DROP할 경우 이를 참조하는 테이블이 손상되거나 무효화되는지 확인하는 새로운 설정입니다."}]}]}/>

DROP NAMED COLLECTION 명령이 해당 컬렉션에 의존하는 테이블을 손상시키거나 무효화하지 않는지 확인합니다

## check_query_single_value_result \{#check_query_single_value_result\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "CHECK TABLE을 더욱 유용하게 만들기 위해 설정을 변경함"}]}]}/>

`MergeTree` 계열 엔진에 대한 [CHECK TABLE](/sql-reference/statements/check-table) 쿼리 결과의 세부 수준을 정의합니다.

가능한 값:

- 0 — 쿼리가 테이블의 각 개별 데이터 파트에 대한 검사 상태를 표시합니다.
- 1 — 쿼리가 테이블 전체에 대한 전체적인 검사 상태를 표시합니다.

## check_referential_table_dependencies \{#check_referential_table_dependencies\}

<SettingsInfoBlock type="Bool" default_value="0" />

DDL 쿼리(DROP TABLE 또는 RENAME 등)가 테이블 간 참조 종속성을 손상시키지 않는지 확인합니다

## check_table_dependencies \{#check_table_dependencies\}

<SettingsInfoBlock type="Bool" default_value="1" />

DDL 쿼리(예: DROP TABLE, RENAME)가 종속성을 손상시키지 않는지 확인합니다

## checksum_on_read \{#checksum_on_read\}

<SettingsInfoBlock type="Bool" default_value="1" />

읽을 때 체크섬을 검증합니다. 기본적으로 활성화되어 있으며, 프로덕션 환경에서는 항상 활성화된 상태로 두어야 합니다. 이 설정을 비활성화해도 아무런 이점이 없습니다. 이 설정은 실험 및 벤치마크 목적에만 사용해야 합니다. 이 설정은 MergeTree 계열 테이블에만 적용됩니다. 다른 테이블 엔진이나 네트워크를 통해 데이터를 수신하는 경우에는 항상 체크섬이 검증됩니다.

## cloud_mode \{#cloud_mode\}

<SettingsInfoBlock type="Bool" default_value="0" />

Cloud 모드

## cloud_mode_database_engine \{#cloud_mode_database_engine\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud에서 허용되는 데이터베이스 엔진입니다. 1 - DDL을 복제된 데이터베이스(Replicated database)를 사용하도록 재작성합니다, 2 - DDL을 공유 데이터베이스(Shared database)를 사용하도록 재작성합니다.

## cloud_mode_engine \{#cloud_mode_engine\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Cloud에서 허용되는 엔진 계열입니다.

- 0 - 모든 엔진 허용
- 1 - DDL을 *ReplicatedMergeTree를 사용하도록 다시 작성함
- 2 - DDL을 SharedMergeTree를 사용하도록 다시 작성함
- 3 - DDL을, 명시적으로 전달된 remote 디스크가 지정된 경우를 제외하고 SharedMergeTree를 사용하도록 다시 작성함
- 4 - 3과 동일하며, 추가로 Distributed 대신 Alias를 사용함 (Alias 테이블은 Distributed 테이블의 대상 테이블을 가리키므로 해당 로컬 테이블을 사용하게 됩니다)

공개 설정 범위를 최소화하기 위해 UInt64를 사용합니다.

## cluster_for_parallel_replicas \{#cluster_for_parallel_replicas\}

현재 서버가 속해 있는 세그먼트의 클러스터

## cluster_function_process_archive_on_multiple_nodes \{#cluster_function_process_archive_on_multiple_nodes\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "New setting"}]}]}/>

`true`로 설정하면 클러스터 함수에서 아카이브를 처리하는 성능이 향상됩니다. 이전 버전에서 아카이브를 사용하는 클러스터 함수를 사용 중인 경우에는, 25.7 이상으로 업그레이드할 때 호환성을 유지하고 오류를 방지하기 위해 `false`로 설정해야 합니다.

## cluster_table_function_buckets_batch_size \{#cluster_table_function_buckets_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

`bucket` 분할 단위(split granularity)를 사용하는 cluster table function에서 작업을 분산 처리할 때 사용되는 배치의 대략적인 크기(바이트 단위)를 정의합니다. 시스템은 이 값에 최소한 도달할 때까지 데이터를 누적합니다. 실제 크기는 데이터 경계에 맞추기 위해 약간 더 클 수 있습니다.

## cluster_table_function_split_granularity \{#cluster_table_function_split_granularity\}

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "새 설정입니다."}]}]}/>

CLUSTER TABLE FUNCTION을 실행할 때 데이터를 어떤 태스크 단위로 분할할지 제어합니다.

이 설정은 클러스터 전반에서 작업을 분배하는 세분화 수준을 정의합니다:

- `file` — 각 태스크가 파일 하나 전체를 처리합니다.
- `bucket` — 파일 내 내부 데이터 블록(예: Parquet row 그룹)마다 태스크가 생성됩니다.

`bucket`과 같은 더 세밀한 세분화 수준을 선택하면 소수의 대용량 파일을 처리할 때 병렬성을 향상할 수 있습니다.
예를 들어 하나의 Parquet 파일에 여러 row 그룹이 포함된 경우 `bucket` 세분화를 사용하면 각 그룹을 서로 다른 워커가 독립적으로 처리할 수 있습니다.

## collect_hash_table_stats_during_aggregation \{#collect_hash_table_stats_during_aggregation\}

<SettingsInfoBlock type="Bool" default_value="1" />

메모리 할당을 최적화하기 위해 해시 테이블 통계 수집을 활성화합니다.

## collect_hash_table_stats_during_joins \{#collect_hash_table_stats_during_joins\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "New setting."}]}]}/>

메모리 할당을 최적화하기 위해 해시 테이블 통계 수집을 활성화합니다

## compatibility \{#compatibility\}

`compatibility` 설정은 ClickHouse가 이전 버전의 ClickHouse 기본 설정을 사용하도록 합니다. 이때 사용할 이전 버전은 이 설정 값으로 지정합니다.

어떤 설정이 기본값이 아닌 값으로 이미 지정되어 있는 경우에는, 해당 설정이 그대로 유지됩니다. (`compatibility` 설정은 수정되지 않은 설정에만 영향을 줍니다.)

이 설정은 `22.3`, `22.8`과 같은 ClickHouse 버전 번호를 문자열로 받습니다. 빈 값은 이 설정이 비활성화됨을 의미합니다.

기본값은 비활성화입니다.

:::note
ClickHouse Cloud에서는 서비스 수준 기본 `compatibility` 설정값을 ClickHouse Cloud 지원팀이 설정해야 합니다. 설정을 원하면 [지원 케이스를 생성](https://clickhouse.cloud/support)하십시오.
하지만 `compatibility` 설정은 표준 ClickHouse 설정 메커니즘을 사용하여 사용자, 역할, 프로필, 쿼리 또는 세션 수준에서 재정의할 수 있습니다. 예를 들어 세션에서 `SET compatibility = '22.3'`, 쿼리에서 `SETTINGS compatibility = '22.3'`와 같이 설정할 수 있습니다.
:::

## compatibility_ignore_auto_increment_in_create_table \{#compatibility_ignore_auto_increment_in_create_table\}

<SettingsInfoBlock type="Bool" default_value="0" />

true인 경우 컬럼 선언에서 AUTO_INCREMENT 키워드를 무시하고, 그렇지 않으면 오류를 반환합니다. 이는 MySQL에서 마이그레이션을 간소화하는 데 도움이 됩니다.

## compatibility_ignore_collation_in_create_table \{#compatibility_ignore_collation_in_create_table\}

<SettingsInfoBlock type="Bool" default_value="1" />

CREATE TABLE에서 collation을 무시하도록 하는 호환성 설정

## compatibility_s3_presigned_url_query_in_path \{#compatibility_s3_presigned_url_query_in_path\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

호환성: 이 설정을 활성화하면 사전 서명된 URL의 쿼리 매개변수(예: X-Amz-*)를 S3 키에 접어 넣는(포함하는) 예전 동작을 사용하여
'?' 문자가 경로에서 와일드카드로 작동합니다. 비활성화(기본값)된 경우, 사전 서명된 URL 쿼리 매개변수는 URL 쿼리에 그대로 유지되어
'?' 문자가 와일드카드로 해석되지 않도록 합니다.

## compile_aggregate_expressions \{#compile_aggregate_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

집계 함수를 네이티브 코드로 JIT 컴파일할지 여부를 설정합니다. 이 설정을 활성화하면 성능이 향상될 수 있습니다.

가능한 값:

- 0 — JIT 컴파일 없이 집계를 수행합니다.
- 1 — JIT 컴파일을 사용하여 집계를 수행합니다.

**같이 보기**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions \{#compile_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "JIT 컴파일러를 기반으로 하는 LLVM 인프라가 이 설정을 기본값으로 활성화해도 될 만큼 충분히 안정적이라고 판단합니다."}]}]}/>

일부 스칼라 함수와 연산자를 네이티브 코드로 컴파일합니다.

## compile_sort_description \{#compile_sort_description\}

<SettingsInfoBlock type="Bool" default_value="1" />

정렬 정의를 네이티브 코드로 컴파일합니다.

## connect_timeout \{#connect_timeout\}

<SettingsInfoBlock type="Seconds" default_value="10" />

레플리카가 없는 경우의 연결 시간 초과 값입니다.

## connect_timeout_with_failover_ms \{#connect_timeout_with_failover_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "비동기 연결로 인해 기본 연결 타임아웃 증가"}]}]}/>

클러스터 정의에서 '세그먼트(shard)'와 '레플리카(replica)' 섹션을 사용하는 경우, 분산 테이블(Distributed table) 엔진이 원격 서버에 연결할 때 사용되는 타임아웃(밀리초)입니다.
연결에 실패하면 여러 레플리카에 대해 여러 번 연결을 시도합니다.

## connect_timeout_with_failover_secure_ms \{#connect_timeout_with_failover_secure_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "비동기 연결로 인해 기본 보안 연결 타임아웃 증가"}]}]}/>

보안 연결 시 첫 번째 정상 레플리카를 선택하기 위한 연결 타임아웃입니다.

## connection_pool_max_wait_ms \{#connection_pool_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

커넥션 풀이 가득 찬 경우 연결을 기다리는 시간(밀리초)입니다.

가능한 값:

- 양의 정수입니다.
- 0 — 무한 대기 시간입니다.

## connections_with_failover_max_tries \{#connections_with_failover_max_tries\}

<SettingsInfoBlock type="UInt64" default_value="3" />

Distributed 테이블 엔진에서 각 레플리카에 대해 수행되는 최대 연결 시도 횟수입니다.

## convert_query_to_cnf \{#convert_query_to_cnf\}

<SettingsInfoBlock type="Bool" default_value="0" />

`true`로 설정하면 `SELECT` 쿼리가 CNF(Conjunctive Normal Form, 논리곱 표준형)으로 변환됩니다. 쿼리를 CNF로 다시 작성하면 더 빠르게 실행되는 경우가 있습니다(자세한 설명은 [GitHub 이슈](https://github.com/ClickHouse/ClickHouse/issues/11749)를 참고하십시오).

예를 들어, 다음 `SELECT` 쿼리는 수정되지 않습니다(기본 동작).

```sql
EXPLAIN SYNTAX
SELECT *
FROM
(
    SELECT number AS x
    FROM numbers(20)
) AS a
WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15))
SETTINGS convert_query_to_cnf = false;
```

결과는 다음과 같습니다.

```response
┌─explain────────────────────────────────────────────────────────┐
│ SELECT x                                                       │
│ FROM                                                           │
│ (                                                              │
│     SELECT number AS x                                         │
│     FROM numbers(20)                                           │
│     WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15)) │
│ ) AS a                                                         │
│ WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15))     │
│ SETTINGS convert_query_to_cnf = 0                              │
└────────────────────────────────────────────────────────────────┘
```

`convert_query_to_cnf`를 `true`로 설정하고 어떤 점이 달라지는지 살펴보겠습니다.

```sql
EXPLAIN SYNTAX
SELECT *
FROM
(
    SELECT number AS x
    FROM numbers(20)
) AS a
WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15))
SETTINGS convert_query_to_cnf = true;
```

`WHERE` 절은 CNF 형태로 다시 쓰이지만, 결과 집합은 동일합니다. 즉, 불리언(Boolean) 논리는 변하지 않습니다.

```response
┌─explain───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SELECT x                                                                                                              │
│ FROM                                                                                                                  │
│ (                                                                                                                     │
│     SELECT number AS x                                                                                                │
│     FROM numbers(20)                                                                                                  │
│     WHERE ((x <= 15) OR (x <= 5)) AND ((x <= 15) OR (x >= 1)) AND ((x >= 10) OR (x <= 5)) AND ((x >= 10) OR (x >= 1)) │
│ ) AS a                                                                                                                │
│ WHERE ((x >= 10) OR (x >= 1)) AND ((x >= 10) OR (x <= 5)) AND ((x <= 15) OR (x >= 1)) AND ((x <= 15) OR (x <= 5))     │
│ SETTINGS convert_query_to_cnf = 1                                                                                     │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

가능한 값: true, false


## correlated_subqueries_default_join_kind \{#correlated_subqueries_default_join_kind\}

<SettingsInfoBlock type="DecorrelationJoinKind" default_value="right" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "새 설정입니다. 비상관화된 쿼리 플랜에 대한 기본 조인 유형입니다."}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "새 설정입니다. 비상관화된 쿼리 플랜에 대한 기본 조인 유형입니다."}]}]}/>

비상관화된 쿼리 플랜에서 사용되는 조인 유형을 제어합니다. 기본값은 `right`이며, 이는 비상관화된 플랜에 서브쿼리 입력이 오른쪽에 위치하는 RIGHT 조인이 포함됨을 의미합니다.

가능한 값:

- `left` - 비상관화 과정에서 LEFT 조인을 생성하며, 입력 테이블은 왼쪽에 위치합니다.
- `right` - 비상관화 과정에서 RIGHT 조인을 생성하며, 입력 테이블은 오른쪽에 위치합니다.

## correlated_subqueries_substitute_equivalent_expressions \{#correlated_subqueries_substitute_equivalent_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "상관 서브쿼리 플래닝 최적화를 위한 새로운 설정입니다."}]}]}/>

필터 표현식을 사용해 동치 표현식을 유추하고, `CROSS JOIN`을 생성하는 대신 해당 표현식으로 대체합니다.

## correlated_subqueries_use_in_memory_buffer \{#correlated_subqueries_use_in_memory_buffer\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "기본적으로 상관 서브쿼리의 입력에 메모리 내 버퍼를 사용합니다."}]}]}/>

상관 서브쿼리의 입력에 메모리 내 버퍼를 사용하여 여러 번 평가되는 것을 방지합니다.

## count_distinct_implementation \{#count_distinct_implementation\}

<SettingsInfoBlock type="String" default_value="uniqExact" />

[COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count) 구문을 실행할 때 사용할 `uniq*` 함수를 지정합니다.

가능한 값:

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization \{#count_distinct_optimization\}

<SettingsInfoBlock type="Bool" default_value="0" />

COUNT DISTINCT를 GROUP BY 서브쿼리로 변환합니다

## count_matches_stop_at_empty_match \{#count_matches_stop_at_empty_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting."}]}]}/>

`countMatches` 함수에서 패턴이 길이 0으로 매칭되는 순간부터는 개수 세기를 중단합니다.

## create_if_not_exists \{#create_if_not_exists\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "새 설정입니다."}]}]}/>

기본적으로 `CREATE` 문에서 `IF NOT EXISTS`를 활성화합니다. 이 설정이 활성화되어 있거나 `CREATE` 문에 `IF NOT EXISTS`가 명시되어 있고, 지정한 이름의 테이블이 이미 존재하는 경우에도 예외가 발생하지 않습니다.

## create_index_ignore_unique \{#create_index_ignore_unique\}

<SettingsInfoBlock type="Bool" default_value="0" />

`CREATE UNIQUE INDEX`에서 `UNIQUE` 키워드를 무시합니다. SQL 호환성 테스트를 위해 사용됩니다.

## create_replicated_merge_tree_fault_injection_probability \{#create_replicated_merge_tree_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

ZooKeeper에 메타데이터를 생성한 후 테이블 생성 시 장애를 주입할 확률입니다.

## create_table_empty_primary_key_by_default \{#create_table_empty_primary_key_by_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Better usability"}]}]}/>

ORDER BY와 PRIMARY KEY를 지정하지 않은 경우에도 기본 키가 비어 있는 *MergeTree 테이블을 생성할 수 있도록 허용합니다.

## cross_join_min_bytes_to_compress \{#cross_join_min_bytes_to_compress\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "CROSS JOIN에서 압축할 블록의 최소 크기입니다. 값이 0이면 이 임계값이 비활성화됨을 의미합니다. 이 블록은 두 가지 임계값(행 수 또는 바이트 수) 중 하나에 도달하면 압축됩니다."}]}]}/>

CROSS JOIN에서 압축할 블록의 최소 크기입니다. 값이 0이면 이 임계값이 비활성화됨을 의미합니다. 이 블록은 두 가지 임계값(행 수 또는 바이트 수) 중 하나에 도달하면 압축됩니다.

## cross_join_min_rows_to_compress \{#cross_join_min_rows_to_compress\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "CROSS JOIN에서 블록을 압축하기 위한 최소 행 수입니다. 0은 이 임계값을 비활성화한다는 의미입니다. 이 블록은 행 수 또는 바이트 크기 임계값 중 어느 하나에 도달하면 압축됩니다."}]}]}/>

CROSS JOIN에서 블록을 압축하기 위한 최소 행 수입니다. 0은 이 임계값을 비활성화한다는 의미입니다. 이 블록은 행 수 또는 바이트 크기 임계값 중 어느 하나에 도달하면 압축됩니다.

## cross_to_inner_join_rewrite \{#cross_to_inner_join_rewrite\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "2"},{"label": "comma join을 inner join으로 강제 재작성"}]}]}/>

WHERE 절에 조인 표현식이 있는 경우 comma join/cross join 대신 inner join을 사용합니다. 값: 0 - 재작성하지 않음, 1 - comma join/cross join에 대해 가능하면 적용, 2 - 모든 comma join을 강제 재작성, cross - cross join에 대해 가능하면 적용

## data_type_default_nullable \{#data_type_default_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

컬럼 정의에서 수정자 [NULL 또는 NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers)을(를) 명시적으로 지정하지 않은 경우, 해당 데이터 타입은 [Nullable](/sql-reference/data-types/nullable)(널 허용)로 간주됩니다.

가능한 값:

- 1 — 컬럼 정의의 데이터 타입이 기본적으로 `Nullable`로 설정됩니다.
- 0 — 컬럼 정의의 데이터 타입이 기본적으로 `Nullable`이 아니도록 설정됩니다.

## database_atomic_wait_for_drop_and_detach_synchronously \{#database_atomic_wait_for_drop_and_detach_synchronously\}

<SettingsInfoBlock type="Bool" default_value="0" />

모든 `DROP` 및 `DETACH` 쿼리에 수정자 `SYNC`를 추가합니다.

가능한 값:

- 0 — 지연을 두고 쿼리가 실행됩니다.
- 1 — 지연 없이 쿼리가 실행됩니다.

## database_datalake_require_metadata_access \{#database_datalake_require_metadata_access\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "New setting."}]}]}/>

데이터베이스 엔진 DataLakeCatalog에서 테이블 메타데이터를 가져올 권한이 없을 때 오류를 발생시킬지 여부를 제어합니다.

## database_replicated_allow_explicit_uuid \{#database_replicated_allow_explicit_uuid\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "테이블 UUID를 명시적으로 지정하지 못하도록 하는 새 설정이 추가되었습니다."}]}]}/>

0 - Replicated 데이터베이스의 테이블에 대해 UUID를 명시적으로 지정할 수 없습니다. 1 - 지정할 수 있습니다. 2 - 지정을 허용하지만 지정된 UUID는 무시하고 대신 임의의 UUID를 생성합니다.

## database_replicated_allow_heavy_create \{#database_replicated_allow_heavy_create\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Replicated database engine에서 장시간 실행되는 DDL 쿼리(CREATE AS SELECT 및 POPULATE)가 금지되었습니다"}]}]}/>

Replicated database engine에서 장시간 실행되는 DDL 쿼리(CREATE AS SELECT 및 POPULATE)를 허용합니다. 이 설정을 사용하면 DDL 대기열이 오랫동안 차단될 수 있습니다.

## database_replicated_allow_only_replicated_engine \{#database_replicated_allow_only_replicated_engine\}

<SettingsInfoBlock type="Bool" default_value="0" />

엔진이 Replicated인 데이터베이스에서는 Replicated 테이블만 생성할 수 있도록 허용합니다.

## database_replicated_allow_replicated_engine_arguments \{#database_replicated_allow_replicated_engine_arguments\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "기본적으로 명시적인 인자를 허용하지 않음"}]}]}/>

0 - Replicated 데이터베이스의 *MergeTree 테이블에서 ZooKeeper 경로와 레플리카 이름을 명시적으로 지정하는 것을 허용하지 않습니다. 1 - 허용합니다. 2 - 허용하지만, 지정된 경로는 무시하고 기본 경로를 대신 사용합니다. 3 - 허용하며 경고를 로그에 기록하지 않습니다.

## database_replicated_always_detach_permanently \{#database_replicated_always_detach_permanently\}

<SettingsInfoBlock type="Bool" default_value="0" />

데이터베이스 엔진이 Replicated인 경우 `DETACH TABLE`을 `DETACH TABLE PERMANENTLY`로 실행합니다.

## database_replicated_enforce_synchronous_settings \{#database_replicated_enforce_synchronous_settings\}

<SettingsInfoBlock type="Bool" default_value="0" />

일부 쿼리에 대해 동기적으로 대기하도록 강제합니다(database_atomic_wait_for_drop_and_detach_synchronously, mutations_sync, alter_sync도 참조하십시오). 이러한 설정을 활성화하는 것은 권장되지 않습니다.

## database_replicated_initial_query_timeout_sec \{#database_replicated_initial_query_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />

초기 DDL 쿼리가 복제된 데이터베이스(Replicated database)가 이전 DDL 대기열 항목을 처리할 때까지 대기하는 최대 시간을 초 단위로 설정합니다.

가능한 값:

- 양의 정수.
- 0 — 무제한.

## database_shared_drop_table_delay_seconds \{#database_shared_drop_table_delay_seconds\}

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "New setting."}]}]}/>

Shared 데이터베이스에서 삭제된 테이블이 실제로 제거되기까지의 지연 시간(초)입니다. 이 시간 내에 `UNDROP TABLE` 문을 사용하여 테이블을 복구할 수 있습니다.

## decimal_check_overflow \{#decimal_check_overflow\}

<SettingsInfoBlock type="Bool" default_value="1" />

십진수(Decimal) 산술/비교 연산에서 오버플로우가 발생하는지 확인합니다

## deduplicate_blocks_in_dependent_materialized_views \{#deduplicate_blocks_in_dependent_materialized_views\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "기본적으로 종속된 materialized view에 대한 중복 제거를 활성화합니다."}]}]}/>

Replicated\* 테이블(복제된 테이블, Replicated Table)에서 데이터를 수신하는 구체화된 뷰(Materialized View)에 대한 중복 제거 여부를 설정합니다.

가능한 값:

0 — 비활성화.
      1 — 활성화.

이 설정을 활성화하면 ClickHouse는 Replicated\* 테이블에 종속된 구체화된 뷰의 블록을 중복 제거합니다.
이 설정은 장애로 인해 삽입 작업이 재시도될 때 구체화된 뷰에 중복 데이터가 포함되지 않도록 하는 데 유용합니다.

**참고**

- [IN 연산자에서의 NULL 처리](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## deduplicate_insert \{#deduplicate_insert\}

<SettingsInfoBlock type="DeduplicateInsertMode" default_value="enable" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "backward_compatible_choice"},{"label": "INSERT 쿼리에 대한 중복 제거를 제어하기 위한 새로운 설정입니다."}]}, {"id": "row-2","items": [{"label": "26.2"},{"label": "enable"},{"label": "기본적으로 모든 동기 및 비동기 INSERT에 대해 중복 제거를 활성화합니다."}]}]}/>

`INSERT INTO`(Replicated\* 테이블 대상)에 대한 블록 단위 중복 제거를 활성화하거나 비활성화합니다.
이 설정은 `insert_deduplicate` 및 `async_insert_deduplicate` 설정을 재정의합니다.
이 설정에는 다음 세 가지 값을 사용할 수 있습니다.

- disable — `INSERT INTO` 쿼리에 대해 중복 제거가 비활성화됩니다.
- enable — `INSERT INTO` 쿼리에 대해 중복 제거가 활성화됩니다.
- backward_compatible_choice — 특정 INSERT 유형에 대해 `insert_deduplicate` 또는 `async_insert_deduplicate`가 활성화되어 있는 경우 중복 제거가 활성화됩니다.

## deduplicate_insert_select \{#deduplicate_insert_select\}

<SettingsInfoBlock type="DeduplicateInsertSelectMode" default_value="enable_when_possible" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "enable_when_possible"},{"label": "change the default behavior of deduplicate_insert_select to ENABLE_WHEN_POSSIBLE"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "enable_even_for_bad_queries"},{"label": "New setting, replace insert_select_deduplicate"}]}]}/>

`INSERT SELECT`에 대한 블록 중복 제거(Replicated\* 테이블용)를 활성화하거나 비활성화합니다.  
이 설정은 `INSERT SELECT` 쿼리에 대해 `insert_deduplicate` 및 `deduplicate_insert`보다 우선 적용됩니다.  
이 설정에는 다음 네 가지 값이 있습니다.

- disable — `INSERT SELECT` 쿼리에 대해 중복 제거를 비활성화합니다.
- force_enable — `INSERT SELECT` 쿼리에 대해 중복 제거를 활성화합니다. SELECT 결과가 안정적이지 않으면 예외가 발생합니다.
- enable_when_possible — `insert_deduplicate`가 활성화되어 있고 SELECT 결과가 안정적인 경우 중복 제거를 활성화하고, 그렇지 않으면 비활성화합니다.
- enable_even_for_bad_queries — `insert_deduplicate`가 활성화되어 있으면 중복 제거를 활성화합니다. SELECT 결과가 안정적이지 않은 경우 경고가 로그에 기록되지만, 중복 제거를 사용하여 쿼리가 실행됩니다. 이 옵션은 하위 호환성을 위한 것입니다. 예기치 않은 결과를 초래할 수 있으므로 다른 옵션 사용을 권장합니다.

## default_materialized_view_sql_security \{#default_materialized_view_sql_security\}

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "materialized view를 생성할 때 SQL SECURITY 옵션의 기본값을 설정할 수 있습니다."}]}]}/>

materialized view를 생성할 때 SQL SECURITY 옵션의 기본값을 설정할 수 있습니다. [SQL 보안에 대한 자세한 내용](../../sql-reference/statements/create/view.md/#sql_security).

기본값은 `DEFINER`입니다.

## default_max_bytes_in_join \{#default_max_bytes_in_join\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

제한이 필요한데 `max_bytes_in_join`이 설정되어 있지 않은 경우 오른쪽 테이블의 최대 크기입니다.

## default_normal_view_sql_security \{#default_normal_view_sql_security\}

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "일반 VIEW를 생성할 때 사용할 기본 `SQL SECURITY` 옵션을 설정할 수 있도록 합니다"}]}]}/>

일반 VIEW를 생성할 때 사용할 기본 `SQL SECURITY` 옵션을 설정할 수 있도록 합니다. [`SQL security`에 대해 더 알아보기](../../sql-reference/statements/create/view.md/#sql_security).

기본값은 `INVOKER`입니다.

## default_table_engine \{#default_table_engine\}

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "사용성 향상을 위해 기본 테이블 엔진을 MergeTree로 설정"}]}]} />

`CREATE` 문에서 `ENGINE`이 설정되지 않았을 때 사용할 기본 테이블 엔진입니다.

가능한 값:

* 유효한 테이블 엔진 이름을 나타내는 문자열

Cloud 기본값: `SharedMergeTree`.

**예시**

쿼리:

```sql
SET default_table_engine = 'Log';

SELECT name, value, changed FROM system.settings WHERE name = 'default_table_engine';
```

결과:

```response
┌─name─────────────────┬─value─┬─changed─┐
│ default_table_engine │ Log   │       1 │
└──────────────────────┴───────┴─────────┘
```

이 예에서는 `Engine`을 지정하지 않은 모든 새 테이블이 `Log` 테이블 엔진을 사용합니다:

쿼리:

```sql
CREATE TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TABLE my_table;
```

결과:

```response
┌─statement────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.my_table
(
    `x` UInt32,
    `y` UInt32
)
ENGINE = Log
└──────────────────────────────────────────────────────────────────────────┘
```


## default_temporary_table_engine \{#default_temporary_table_engine\}

<SettingsInfoBlock type="DefaultTableEngine" default_value="Memory" />

임시 테이블에 대해서는 [default&#95;table&#95;engine](#default_table_engine) 설정과 동일하게 동작합니다.

다음 예에서는 `Engine`을 지정하지 않은 새 임시 테이블에 `Log` 테이블 엔진이 사용됩니다.

쿼리:

```sql
SET default_temporary_table_engine = 'Log';

CREATE TEMPORARY TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TEMPORARY TABLE my_table;
```

결과:

```response
┌─statement────────────────────────────────────────────────────────────────┐
│ CREATE TEMPORARY TABLE default.my_table
(
    `x` UInt32,
    `y` UInt32
)
ENGINE = Log
└──────────────────────────────────────────────────────────────────────────┘
```


## default_view_definer \{#default_view_definer\}

<SettingsInfoBlock type="String" default_value="CURRENT_USER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "CURRENT_USER"},{"label": "뷰를 생성할 때 기본 `DEFINER` 옵션을 설정할 수 있도록 합니다"}]}]}/>

뷰를 생성할 때 기본 `DEFINER` 옵션을 설정할 수 있습니다. [SQL 보안에 대한 자세한 내용](../../sql-reference/statements/create/view.md/#sql_security).

기본값은 `CURRENT_USER`입니다.

## delta_lake_enable_engine_predicate \{#delta_lake_enable_engine_predicate\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

delta-kernel의 내부 데이터 프루닝(pruning)을 사용하도록 설정합니다.

## delta_lake_enable_expression_visitor_logging \{#delta_lake_enable_expression_visitor_logging\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

DeltaLake expression visitor의 테스트 수준 로그를 활성화합니다. 이 로그는 테스트 로깅에 사용하기에도 지나치게 장황해질 수 있습니다.

## delta_lake_insert_max_bytes_in_data_file \{#delta_lake_insert_max_bytes_in_data_file\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "새 설정입니다."}]}]}/>

Delta Lake에서 단일로 삽입되는 데이터 파일 하나에 대한 최대 바이트 크기를 정의합니다.

## delta_lake_insert_max_rows_in_data_file \{#delta_lake_insert_max_rows_in_data_file\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "새 설정."}]}]}/>

delta lake에서 단일로 삽입되는 각 데이터 파일에 대한 최대 행 수를 정의합니다.

## delta_lake_log_metadata \{#delta_lake_log_metadata\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

Delta Lake 메타데이터 파일을 system 테이블에 기록하도록 설정합니다.

## delta_lake_snapshot_end_version \{#delta_lake_snapshot_end_version\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "새 설정입니다."}]}]}/>

읽을 Delta Lake 스냅샷의 종료 버전입니다. 값 -1은 최신 버전을 읽는다는 의미입니다(값 0도 유효한 스냅샷 버전 값입니다).

## delta_lake_snapshot_start_version \{#delta_lake_snapshot_start_version\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "새 설정입니다."}]}]}/>

읽을 Delta Lake 스냅샷의 시작 버전입니다. 값 -1은 최신 버전을 읽는다는 의미입니다(값 0도 유효한 스냅샷 버전입니다).

## delta_lake_snapshot_version \{#delta_lake_snapshot_version\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "새 설정"}]}]}/>

읽을 Delta Lake 스냅샷의 버전을 지정합니다. 값 -1은 최신 버전을 읽도록 지정합니다(값 0도 유효한 스냅샷 버전입니다).

## delta_lake_throw_on_engine_predicate_error \{#delta_lake_throw_on_engine_predicate_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

delta-kernel에서 스캔 프레디케이트를 분석하는 동안 오류가 발생하면 예외를 던지도록 설정합니다.

## describe_compact_output \{#describe_compact_output\}

<SettingsInfoBlock type="Bool" default_value="0" />

true인 경우 DESCRIBE 쿼리의 결과에 컬럼 이름과 타입만 포함합니다.

## describe_include_subcolumns \{#describe_include_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="0" />

[DESCRIBE](../../sql-reference/statements/describe-table.md) 쿼리에서 서브컬럼을 함께 표시하도록 설정합니다. 예를 들어, [Tuple](../../sql-reference/data-types/tuple.md)의 멤버나 [Map](/sql-reference/data-types/map#reading-subcolumns-of-map), [Nullable](../../sql-reference/data-types/nullable.md/#finding-null), [Array](../../sql-reference/data-types/array.md/#array-size) 데이터 타입의 서브컬럼을 포함합니다.

가능한 값:

- 0 — 서브컬럼을 `DESCRIBE` 쿼리에 포함하지 않습니다.
- 1 — 서브컬럼을 `DESCRIBE` 쿼리에 포함합니다.

**예시**

[DESCRIBE](../../sql-reference/statements/describe-table.md) SQL 문에 대한 예시는 다음을 참조하십시오.

## describe_include_virtual_columns \{#describe_include_virtual_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

true인 경우 테이블의 가상 컬럼이 DESCRIBE 쿼리 결과에 포함됩니다.

## dialect \{#dialect\}

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

쿼리를 파싱할 때 사용할 SQL dialect입니다.

## dictionary_use_async_executor \{#dictionary_use_async_executor\}

<SettingsInfoBlock type="Bool" default_value="0" />

여러 스레드를 사용하여 딕셔너리 소스를 읽는 파이프라인을 실행합니다. 로컬 CLICKHOUSE 소스를 사용하는 딕셔너리에만 지원됩니다.

## dictionary_validate_primary_key_type \{#dictionary_validate_primary_key_type\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "딕셔너리의 기본 키 타입을 검증합니다. 기본적으로 simple 레이아웃의 ID 타입은 자동으로 UInt64로 변환됩니다."}]}]}/>

딕셔너리의 기본 키 타입을 검증합니다. 기본적으로 simple 레이아웃의 ID 타입은 자동으로 UInt64로 변환됩니다.

## distinct_overflow_mode \{#distinct_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

데이터량이 제한값 중 하나를 초과할 때 어떻게 동작할지 설정합니다.

가능한 값:

- `throw`: 예외를 발생시킵니다(기본값).
- `break`: 쿼리 실행을 중지하고 소스 데이터가 소진된 것처럼 부분 결과만 반환합니다.

## distributed_aggregation_memory_efficient \{#distributed_aggregation_memory_efficient\}

<SettingsInfoBlock type="Bool" default_value="1" />

분산 집계의 메모리 절약 모드를 활성화할지 여부를 지정합니다.

## distributed_background_insert_batch \{#distributed_background_insert_batch\}

**별칭**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

삽입된 데이터를 배치로 전송할지 여부를 제어합니다.

배치 전송이 활성화되면 [Distributed](../../engines/table-engines/special/distributed.md) 테이블 엔진은 삽입된 데이터 파일 여러 개를 각각 별도로 전송하는 대신 한 번의 작업으로 묶어 전송하려고 시도합니다. 배치 전송은 서버와 네트워크 리소스를 더 효율적으로 활용하여 클러스터 성능을 향상시킵니다.

가능한 값:

- 1 — 활성화.
- 0 — 비활성화.

## distributed_background_insert_max_sleep_time_ms \{#distributed_background_insert_max_sleep_time_ms\}

**별칭**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

[Distributed](../../engines/table-engines/special/distributed.md) 테이블 엔진이 데이터를 전송하는 최대 시간 간격입니다. [distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms) 설정에서 지정된 시간 간격의 지수적 증가를 제한합니다.

가능한 값:

- 양의 정수인 밀리초 값.

## distributed_background_insert_sleep_time_ms \{#distributed_background_insert_sleep_time_ms\}

**별칭**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

[Distributed](../../engines/table-engines/special/distributed.md) 테이블 엔진이 데이터를 전송하는 기본 간격입니다. 오류가 발생하면 실제 간격은 지수적으로 증가합니다.

가능한 값:

- 밀리초 단위의 양의 정수.

## distributed_background_insert_split_batch_on_failure \{#distributed_background_insert_split_batch_on_failure\}

**별칭(Aliases)**: `distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

실패 발생 시 배치를 분할할지 여부를 활성화/비활성화합니다.

특정 배치를 원격 세그먼트로 전송하는 작업이, 이후의 복잡한 파이프라인(예: `GROUP BY`가 있는 `MATERIALIZED VIEW`) 때문에 `Memory limit exceeded`와 같은 오류로 실패할 수 있습니다. 이 경우 단순 재시도는 도움이 되지 않고(이로 인해 해당 테이블에 대한 분산 전송이 멈출 수 있으며), 대신 해당 배치의 파일들을 하나씩 개별적으로 전송하면 `INSERT`가 성공할 수 있습니다.

따라서 이 설정을 `1`로 지정하면 그러한 실패한 배치에 대해 배치 처리가 비활성화됩니다(즉, 실패한 배치에 대해 `distributed_background_insert_batch`가 일시적으로 비활성화됩니다).

가능한 값:

- 1 — 활성화.
- 0 — 비활성화.

:::note
이 설정은 비정상적인 서버(머신) 종료와 [Distributed](../../engines/table-engines/special/distributed.md) 테이블 엔진에서 `fsync_after_insert`/`fsync_directories`가 설정되지 않아 발생할 수 있는 손상된 배치에도 영향을 줍니다.
:::

:::note
성능에 영향을 줄 수 있으므로 자동 배치 분할에 의존해서는 안 됩니다.
:::

## distributed_background_insert_timeout \{#distributed_background_insert_timeout\}

**별칭(Aliases)**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

Distributed 테이블로의 insert 쿼리에 대한 타임아웃입니다. 이 설정은 `insert_distributed_sync`가 활성화된 경우에만 사용됩니다. 값이 0이면 타임아웃이 없음을 의미합니다.

## distributed_cache_alignment \{#distributed_cache_alignment\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "distributed_cache_read_alignment 이름 변경"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 테스트용 설정이므로 변경하지 마십시오.

## distributed_cache_bypass_connection_pool \{#distributed_cache_bypass_connection_pool\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시 연결 풀(distributed cache connection pool)을 우회하도록 허용합니다.

## distributed_cache_connect_backoff_max_ms \{#distributed_cache_connect_backoff_max_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시 연결 생성에 대한 최대 백오프 시간(밀리초 단위)입니다.

## distributed_cache_connect_backoff_min_ms \{#distributed_cache_connect_backoff_min_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "새 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시 연결을 생성할 때 적용되는 최소 백오프(backoff) 시간(밀리초)입니다.

## distributed_cache_connect_max_tries \{#distributed_cache_connect_max_tries\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "Changed setting value"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "Cloud only"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 연결에 실패한 경우 distributed cache에 연결을 재시도하는 횟수입니다.

## distributed_cache_connect_timeout_ms \{#distributed_cache_connect_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "새 설정"}]}]}/>

ClickHouse Cloud에서만 사용됩니다. 분산 캐시 서버에 연결할 때의 연결 타임아웃입니다.

## distributed_cache_credentials_refresh_period_seconds \{#distributed_cache_credentials_refresh_period_seconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "새로운 비공개 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 자격 증명 갱신 주기입니다.

## distributed_cache_data_packet_ack_window \{#distributed_cache_data_packet_ack_window\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 단일 분산 캐시 읽기 요청에서 DataPacket 시퀀스에 대한 ACK를 전송하기 위한 윈도 크기를 정의합니다.

## distributed_cache_discard_connection_if_unread_data \{#distributed_cache_discard_connection_if_unread_data\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 일부 데이터가 읽히지 않은 상태라면 연결을 끊습니다.

## distributed_cache_fetch_metrics_only_from_current_az \{#distributed_cache_fetch_metrics_only_from_current_az\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud용 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. system.distributed_cache_metrics 및 system.distributed_cache_events에서 현재 가용 영역의 메트릭만 가져옵니다.

## distributed_cache_file_cache_name \{#distributed_cache_file_cache_name\}

<CloudOnlyBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "새로운 설정입니다."}]}]}/>

ClickHouse Cloud에서만 적용됩니다. CI 테스트 전용으로 사용되는 설정으로, 분산 캐시에서 사용할 파일 시스템(filesystem) 캐시 이름을 지정합니다.

## distributed_cache_log_mode \{#distributed_cache_log_mode\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. system.distributed_cache_log에 기록할 때 사용하는 모드입니다.

## distributed_cache_max_unacked_inflight_packets \{#distributed_cache_max_unacked_inflight_packets\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "ClickHouse Cloud용 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 단일 분산 캐시 읽기 요청에서 승인되지 않은 전송 중 패킷의 최대 개수입니다.

## distributed_cache_min_bytes_for_seek \{#distributed_cache_min_bytes_for_seek\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "새로운 비공개 설정."}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시(distributed cache)에서 탐색(seek)을 수행하기 위한 최소 바이트 수입니다.

## distributed_cache_pool_behaviour_on_limit \{#distributed_cache_pool_behaviour_on_limit\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "Cloud only"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 풀 제한에 도달했을 때 distributed cache 연결의 동작 방식을 정의합니다.

## distributed_cache_prefer_bigger_buffer_size \{#distributed_cache_prefer_bigger_buffer_size\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

ClickHouse Cloud에서만 적용됩니다. distributed cache에 대해 filesystem_cache_prefer_bigger_buffer_size와 동일하게 동작합니다.

## distributed_cache_read_only_from_current_az \{#distributed_cache_read_only_from_current_az\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 현재 가용 영역의 캐시 서버에서만 읽기를 허용합니다. 비활성화하면 모든 가용 영역의 모든 캐시 서버에서 읽습니다.

## distributed_cache_read_request_max_tries \{#distributed_cache_read_request_max_tries\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "Changed setting value"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시 요청이 실패했을 때 재시도할 최대 횟수입니다.

## distributed_cache_receive_response_wait_milliseconds \{#distributed_cache_receive_response_wait_milliseconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "ClickHouse Cloud용 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시에서 요청한 데이터를 수신하기 위해 대기하는 시간(밀리초)입니다.

## distributed_cache_receive_timeout_milliseconds \{#distributed_cache_receive_timeout_milliseconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "ClickHouse Cloud용 설정"}]}]}/>

ClickHouse Cloud에서만 사용됩니다. 분산 캐시로부터 어떤 종류의 응답이든 수신할 때까지 대기하는 시간(밀리초)입니다.

## distributed_cache_receive_timeout_ms \{#distributed_cache_receive_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시 서버로부터 데이터를 수신할 때의 타임아웃(밀리초)입니다. 이 시간 동안 단일 바이트도 수신되지 않으면 예외가 발생합니다.

## distributed_cache_send_timeout_ms \{#distributed_cache_send_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "새 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 밀리초 단위의 distributed cache 서버 데이터 전송 타임아웃입니다. 클라이언트가 데이터를 전송해야 하는데, 이 시간 동안 한 바이트도 전송하지 못하면 예외가 발생합니다.

## distributed_cache_tcp_keep_alive_timeout_ms \{#distributed_cache_tcp_keep_alive_timeout_ms\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시 서버에 대한 연결이 유휴 상태를 유지해야 TCP가 keepalive 프로브 전송을 시작하기까지의 시간(밀리초)입니다.

## distributed_cache_throw_on_error \{#distributed_cache_throw_on_error\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시와의 통신 중 발생한 예외 또는 분산 캐시에서 수신한 예외를 다시 발생시킵니다. 그렇지 않은 경우에는 오류 발생 시 분산 캐시 사용을 건너뜁니다.

## distributed_cache_use_clients_cache_for_read \{#distributed_cache_use_clients_cache_for_read\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 읽기 요청 시 클라이언트 캐시를 사용하십시오.

## distributed_cache_use_clients_cache_for_write \{#distributed_cache_use_clients_cache_for_write\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 쓰기 요청에 대해 클라이언트 캐시를 사용합니다.

## distributed_cache_wait_connection_from_pool_milliseconds \{#distributed_cache_wait_connection_from_pool_milliseconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "ClickHouse Cloud 전용 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. distributed_cache_pool_behaviour_on_limit이 wait인 경우, 커넥션 풀에서 커넥션을 받기까지 대기하는 시간(밀리초)입니다.

## distributed_connections_pool_size \{#distributed_connections_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

단일 분산 테이블(Distributed table)에 대해 수행되는 모든 쿼리를 분산 처리할 때 원격 서버와 동시에 사용할 수 있는 최대 연결 개수입니다. 클러스터의 서버 수보다 작지 않은 값으로 설정할 것을 권장합니다.

## distributed_ddl_entry_format_version \{#distributed_ddl_entry_format_version\}

<SettingsInfoBlock type="UInt64" default_value="5" />

분산 DDL (ON CLUSTER) 쿼리의 호환성 버전

## distributed_ddl_output_mode \{#distributed_ddl_output_mode\}

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

분산 DDL 쿼리 결과 형식을 설정합니다.

가능한 값:

- `throw` — 쿼리가 완료된 모든 호스트에 대해 쿼리 실행 상태를 포함한 결과 집합을 반환합니다. 일부 호스트에서 쿼리가 실패한 경우 첫 번째 예외를 다시 던집니다. 일부 호스트에서 쿼리가 아직 완료되지 않았고 [distributed_ddl_task_timeout](#distributed_ddl_task_timeout)을 초과한 경우 `TIMEOUT_EXCEEDED` 예외를 던집니다.
- `none` — `throw`와 유사하지만, 분산 DDL 쿼리가 결과 집합을 반환하지 않습니다.
- `null_status_on_timeout` — 해당 호스트에서 쿼리가 완료되지 않은 경우 `TIMEOUT_EXCEEDED` 예외를 던지는 대신, 결과 집합의 일부 행에서 실행 상태로 `NULL`을 반환합니다.
- `never_throw` — 일부 호스트에서 쿼리가 실패하더라도 `TIMEOUT_EXCEEDED`를 던지지 않고 예외를 다시 던지지 않습니다.
- `none_only_active` - `none`과 유사하지만, `Replicated` 데이터베이스의 비활성 레플리카는 기다리지 않습니다. 참고: 이 모드에서는 쿼리가 일부 레플리카에서 실행되지 않았고 백그라운드에서 실행될 것이라는 사실을 알 수 없습니다.
- `null_status_on_timeout_only_active` — `null_status_on_timeout`과 유사하지만, `Replicated` 데이터베이스의 비활성 레플리카는 기다리지 않습니다.
- `throw_only_active` — `throw`와 유사하지만, `Replicated` 데이터베이스의 비활성 레플리카는 기다리지 않습니다.

Cloud 기본값: `throw`.

## distributed_ddl_task_timeout \{#distributed_ddl_task_timeout\}

<SettingsInfoBlock type="Int64" default_value="180" />

클러스터의 모든 호스트에서 오는 DDL 쿼리 응답에 대한 시간 제한을 설정합니다. DDL 요청이 모든 호스트에서 완료되지 않은 경우 응답에는 시간 초과 오류가 포함되며, 요청은 비동기 모드로 실행됩니다. 음수 값은 무한 시간을 의미합니다.

가능한 값:

- 양의 정수.
- 0 — 비동기 모드.
- 음의 정수 — 무한 시간 제한.

## distributed_foreground_insert \{#distributed_foreground_insert\}

**별칭**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

[Distributed](/engines/table-engines/special/distributed) 테이블에 데이터를 동기식으로 삽입할지 여부를 설정합니다.

기본적으로 `Distributed` 테이블에 데이터를 삽입하면 ClickHouse 서버는 클러스터 노드로 데이터를 백그라운드 모드로 전송합니다. `distributed_foreground_insert=1`인 경우 데이터는 동기식으로 처리되며, 모든 세그먼트(그리고 `internal_replication`이 true인 경우 각 세그먼트마다 최소 한 개의 레플리카)에 데이터가 모두 저장된 후에만 `INSERT` 연산이 성공합니다.

가능한 값:

- `0` — 데이터가 백그라운드 모드로 삽입됩니다.
- `1` — 데이터가 동기식 모드로 삽입됩니다.

Cloud 기본값: `0`.

**관련 항목**

- [Distributed Table Engine](/engines/table-engines/special/distributed)
- [Managing Distributed Tables](/sql-reference/statements/system#managing-distributed-tables)

## distributed_group_by_no_merge \{#distributed_group_by_no_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

이 설정은 분산 쿼리 처리 시 서로 다른 서버에서 생성된 집계 상태를 병합하지 않습니다. 서로 다른 세그먼트마다 키가 서로 다르다는 것이 확실할 때 사용할 수 있습니다.

가능한 값:

* `0` — 비활성화됨(최종 쿼리 처리는 이니시에이터 노드에서 수행됩니다).
* `1` - 분산 쿼리 처리를 위해 서로 다른 서버의 집계 상태를 병합하지 않습니다(쿼리는 세그먼트에서 완전히 처리되고, 이니시에이터는 데이터만 프록시합니다). 서로 다른 세그먼트에 서로 다른 키가 존재함이 확실한 경우에 사용할 수 있습니다.
* `2` - `1`과 같지만 이니시에이터에서 `ORDER BY` 및 `LIMIT`을 적용합니다(쿼리가 원격 노드에서 완전히 처리되는 경우, 예: `distributed_group_by_no_merge=1`일 때는 이와 같은 처리가 불가능합니다). `ORDER BY` 및/또는 `LIMIT`이 있는 쿼리에 사용할 수 있습니다.

**예시**

```sql
SELECT *
FROM remote('127.0.0.{2,3}', system.one)
GROUP BY dummy
LIMIT 1
SETTINGS distributed_group_by_no_merge = 1
FORMAT PrettyCompactMonoBlock

┌─dummy─┐
│     0 │
│     0 │
└───────┘
```

```sql
SELECT *
FROM remote('127.0.0.{2,3}', system.one)
GROUP BY dummy
LIMIT 1
SETTINGS distributed_group_by_no_merge = 2
FORMAT PrettyCompactMonoBlock

┌─dummy─┐
│     0 │
└───────┘
```


## distributed_index_analysis \{#distributed_index_analysis\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

인덱스 분석이 레플리카 전반에 걸쳐 분산되어 수행됩니다.
공유 스토리지를 사용하는 클러스터에서 방대한 양의 데이터가 있을 때 유리합니다.
cluster_for_parallel_replicas에 정의된 레플리카를 사용합니다.

**관련 항목**

- [distributed_index_analysis_for_non_shared_merge_tree](#distributed_index_analysis_for_non_shared_merge_tree)
- [distributed_index_analysis_min_parts_to_activate](merge-tree-settings.md/#distributed_index_analysis_min_parts_to_activate)
- [distributed_index_analysis_min_indexes_bytes_to_activate](merge-tree-settings.md/#distributed_index_analysis_min_indexes_bytes_to_activate)

## distributed_index_analysis_for_non_shared_merge_tree \{#distributed_index_analysis_for_non_shared_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "New setting"}]}]}/>

SharedMergeTree(Cloud 전용 엔진)가 아닌 테이블에서도 분산 인덱스 분석을 활성화합니다.

## distributed_insert_skip_read_only_replicas \{#distributed_insert_skip_read_only_replicas\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "true인 경우, Distributed에 대한 INSERT 시 읽기 전용 레플리카를 건너뜁니다"}]}]}/>

Distributed 테이블에 대한 INSERT 쿼리에서 읽기 전용 레플리카를 건너뛰도록 활성화합니다.

가능한 값:

- 0 — INSERT는 기존과 동일하며, 읽기 전용 레플리카로 전송되면 실패합니다.
- 1 — 요청을 시작한 서버가 데이터를 세그먼트로 전송하기 전에 읽기 전용 레플리카를 건너뜁니다.

## distributed_plan_default_reader_bucket_count \{#distributed_plan_default_reader_bucket_count\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "새로운 실험적 설정입니다."}]}]}/>

분산 쿼리에서 병렬 읽기를 위한 기본 태스크 개수입니다. 태스크는 레플리카 간에 분산됩니다.

## distributed_plan_default_shuffle_join_bucket_count \{#distributed_plan_default_shuffle_join_bucket_count\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "New experimental setting."}]}]}/>

분산 shuffle-hash-join에서 사용하는 기본 버킷 수입니다.

## distributed_plan_execute_locally \{#distributed_plan_execute_locally\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New experimental setting."}]}]}/>

분산 쿼리 계획의 모든 작업을 로컬에서 실행합니다. 테스트 및 디버깅 시 유용합니다.

## distributed_plan_force_exchange_kind \{#distributed_plan_force_exchange_kind\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "새 실험적 설정입니다."}]}]}/>

분산 쿼리 단계 사이에 특정 유형의 Exchange 연산자를 강제로 사용합니다.

가능한 값은 다음과 같습니다.

- '' - 어떤 유형의 Exchange 연산자도 강제하지 않고 옵티마이저가 선택하도록 둡니다.
 - 'Persisted' - 객체 스토리지의 임시 파일을 사용합니다.
 - 'Streaming' - Exchange 데이터를 네트워크를 통해 스트리밍합니다.

## distributed_plan_force_shuffle_aggregation \{#distributed_plan_force_shuffle_aggregation\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "새로운 실험적 설정"}]}]}/>

분산 쿼리 플랜에서 PartialAggregation + Merge 대신 Shuffle aggregation 전략을 사용합니다.

## distributed_plan_max_rows_to_broadcast \{#distributed_plan_max_rows_to_broadcast\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "New experimental setting."}]}]}/>

분산 쿼리 플랜에서 shuffle join 대신 broadcast join을 사용할 최대 행 수입니다.

## distributed_plan_optimize_exchanges \{#distributed_plan_optimize_exchanges\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "새로운 실험적 설정입니다."}]}]}/>

분산 쿼리 계획에서 불필요한 exchange 연산을 제거합니다. 디버깅 시 비활성화하십시오.

## distributed_product_mode \{#distributed_product_mode\}

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

[분산 서브쿼리](../../sql-reference/operators/in.md)의 동작을 변경합니다.

ClickHouse는 쿼리에 분산 테이블 간의 곱(product)이 포함된 경우, 즉 분산 테이블에 대한 쿼리에 해당 분산 테이블에 대한 non-GLOBAL 서브쿼리가 포함된 경우 이 설정을 적용합니다.

제약 사항:

- IN 및 JOIN 서브쿼리에만 적용됩니다.
- FROM 절에서 둘 이상의 세그먼트를 포함하는 분산 테이블을 사용하는 경우에만 적용됩니다.
- 서브쿼리가 둘 이상의 세그먼트를 포함하는 분산 테이블을 대상으로 하는 경우에만 적용됩니다.
- 테이블 값을 반환하는 [remote](../../sql-reference/table-functions/remote.md) 함수에는 사용되지 않습니다.

가능한 값:

- `deny` — 기본값입니다. 이러한 유형의 서브쿼리 사용을 금지합니다(「Double-distributed IN/JOIN subqueries is denied」 예외를 반환합니다).
- `local` — 대상 서버(세그먼트)에 대해 서브쿼리 내 데이터베이스와 테이블을 해당 서버의 로컬 데이터베이스와 테이블로 대체하되, 일반 `IN`/`JOIN`은 그대로 유지합니다.
- `global` — `IN`/`JOIN` 쿼리를 `GLOBAL IN`/`GLOBAL JOIN`으로 대체합니다.
- `allow` — 이러한 유형의 서브쿼리 사용을 허용합니다.

## distributed_push_down_limit \{#distributed_push_down_limit\}

<SettingsInfoBlock type="UInt64" default_value="1" />

각 세그먼트별로 [LIMIT](#limit)을 개별적으로 적용할지 여부를 제어합니다.

이를 통해 다음을 피할 수 있습니다.

- 네트워크를 통해 불필요한 행을 전송하는 것
- 이니시에이터에서 LIMIT을 초과하는 행을 처리하는 것

21.9 버전부터는 다음 조건 중 최소 하나라도 만족하는 경우에만 `distributed_push_down_limit`가 쿼리 실행 방식을 변경하므로, 더 이상 부정확한 결과가 발생하지 않습니다.

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0.
- 쿼리에 `GROUP BY`/`DISTINCT`/`LIMIT BY`는 **없고**, `ORDER BY`/`LIMIT`은 있는 경우.
- 쿼리에 `ORDER BY`/`LIMIT`과 함께 `GROUP BY`/`DISTINCT`/`LIMIT BY`가 **있는** 경우로서, 다음을 모두 만족하는 경우:
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards)가 활성화된 경우.
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)가 활성화된 경우.

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

함께 보기:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap \{#distributed_replica_error_cap\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

- 유형: 부호 없는 정수(unsigned int)
- 기본값: 1000

각 레플리카의 오류 개수는 이 값으로 제한되며, 특정 레플리카에 오류가 과도하게 누적되지 않도록 합니다.

참고:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life \{#distributed_replica_error_half_life\}

<SettingsInfoBlock type="Seconds" default_value="60" />

- 유형: 초
- 기본값: 60초

분산 테이블에서 오류 카운트를 얼마나 빠르게 0으로 초기화할지 제어합니다. 레플리카가 일정 시간 동안 사용할 수 없는 상태이고 오류가 5번 누적되었으며 `distributed_replica_error_half_life` 값이 1초로 설정된 경우, 마지막 오류가 발생한 이후 3초가 지나면 해당 레플리카는 정상으로 간주됩니다.

함께 보기:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors \{#distributed_replica_max_ignored_errors\}

<SettingsInfoBlock type="UInt64" default_value="0" />

- 유형: 부호 없는 정수형(unsigned int)
- 기본값: 0

`load_balancing` 알고리즘에 따라 레플리카를 선택할 때 무시되는 오류 개수입니다.

참고:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final \{#do_not_merge_across_partitions_select_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

서로 다른 파티션 간의 병합을 피하여 FINAL 쿼리를 개선합니다.

이 설정을 활성화하면 SELECT FINAL 쿼리를 수행할 때 서로 다른 파티션에 속한 파트는 서로 병합되지 않습니다. 대신 각 파티션 내부에서만 병합이 수행됩니다. 파티션된 테이블을 사용할 때 쿼리 성능을 크게 향상시킬 수 있습니다.

## empty_result_for_aggregation_by_constant_keys_on_empty_set \{#empty_result_for_aggregation_by_constant_keys_on_empty_set\}

<SettingsInfoBlock type="Bool" default_value="1" />

상수 키를 기준으로 빈 Set에 대해 집계할 때 빈 결과를 반환합니다.

## empty_result_for_aggregation_by_empty_set \{#empty_result_for_aggregation_by_empty_set\}

<SettingsInfoBlock type="Bool" default_value="0" />

비어 있는 Set에 대해 키 없이 집계할 때 빈 결과를 반환합니다.

## enable_adaptive_memory_spill_scheduler \{#enable_adaptive_memory_spill_scheduler\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "새로운 설정입니다. 메모리 데이터를 외부 스토리지로 적응적으로 스필(spill)하도록 활성화합니다."}]}]}/>

프로세서를 트리거하여 데이터를 외부 스토리지로 적응적으로 스필(spill)하도록 합니다. 현재는 grace join만 지원됩니다.

## enable_add_distinct_to_in_subqueries \{#enable_add_distinct_to_in_subqueries\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "분산 IN 서브쿼리에 대해 전송되는 임시 테이블의 크기를 줄이기 위한 새로운 설정입니다."}]}]}/>

`IN` 서브쿼리에서 `DISTINCT`를 활성화합니다. 이는 트레이드오프가 있는 설정입니다. 이를 활성화하면 분산 `IN` 서브쿼리에 대해 전송되는 임시 테이블의 크기를 크게 줄일 수 있고, 고유한 값만 전송되도록 하여 세그먼트 간 데이터 전송 속도를 크게 높일 수 있습니다.
하지만 이 설정을 활성화하면 각 노드에서 중복 제거(DISTINCT)를 수행해야 하므로, 추가적인 머지 작업 비용이 발생합니다. 네트워크 전송이 병목이며, 이러한 추가 머지 비용이 허용 가능한 경우에 이 설정을 사용하십시오.

## enable_automatic_decision_for_merging_across_partitions_for_final \{#enable_automatic_decision_for_merging_across_partitions_for_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "New setting"}]}]}/>

이 설정이 활성화되면, 파티션 키 표현식이 결정적이고 파티션 키 표현식에 사용된 모든 컬럼이 기본 키에 포함된 경우 ClickHouse가 이 최적화를 자동으로 활성화합니다.
이 자동 추론을 통해 동일한 기본 키 값을 가진 행이 항상 동일한 파티션에 속하도록 보장되므로, 파티션 간 병합을 생략하더라도 안전하게 동작합니다.

## enable_blob_storage_log \{#enable_blob_storage_log\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "blob storage 연산 정보를 system.blob_storage_log 테이블에 기록합니다"}]}]}/>

blob storage 연산 정보를 system.blob_storage_log 테이블에 기록합니다

## enable_early_constant_folding \{#enable_early_constant_folding\}

<SettingsInfoBlock type="Bool" default_value="1" />

함수와 서브쿼리의 결과를 분석하여 그 값이 상수인 경우 쿼리를 다시 작성하는 쿼리 최적화를 활성화합니다

## enable_extended_results_for_datetime_functions \{#enable_extended_results_for_datetime_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

`Date` 타입과 비교해 범위가 확장된 `Date32` 타입 또는 `DateTime` 타입과 비교해 범위가 확장된 `DateTime64` 타입의 결과를 반환할지 여부를 활성화하거나 비활성화합니다.

가능한 값:

- `0` — 모든 종류의 인수에 대해 함수가 `Date` 또는 `DateTime`을 반환합니다.
- `1` — 함수가 `Date32` 또는 `DateTime64` 인수에 대해서는 `Date32` 또는 `DateTime64`를, 그 외의 경우에는 `Date` 또는 `DateTime`을 반환합니다.

아래 표는 다양한 날짜-시간 함수에 대해 이 설정의 동작을 보여줍니다.

| FUNCTION                  | `enable_extended_results_for_datetime_functions = 0`                         | `enable_extended_results_for_datetime_functions = 1`                                                             |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `toStartOfYear`           | `Date` 또는 `DateTime` 값을 반환합니다                                                | `Date`/`DateTime` 입력인 경우 `Date`/`DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력인 경우 `Date32`/`DateTime64`를 반환합니다 |
| `toStartOfISOYear`        | `Date` 또는 `DateTime` 값을 반환합니다                                                | `Date`/`DateTime` 입력 시 `Date`/`DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력 시 `Date32`/`DateTime64`를 반환합니다     |
| `toStartOfQuarter`        | `Date` 또는 `DateTime` 값을 반환합니다                                                | `Date`/`DateTime` 입력에 대해 `Date`/`DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력에 대해 `Date32`/`DateTime64`를 반환합니다 |
| `toStartOfMonth`          | `Date` 또는 `DateTime` 값을 반환합니다                                                | `Date`/`DateTime` 입력 시 `Date`/`DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력 시 `Date32`/`DateTime64`을 반환합니다     |
| `toStartOfWeek`           | `Date` 또는 `DateTime`을 반환합니다                                                  | `Date`/`DateTime` 입력에 대해 `Date`/`DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력에 대해 `Date32`/`DateTime64`를 반환합니다 |
| `toLastDayOfWeek`         | `Date` 또는 `DateTime`을 반환합니다                                                  | `Date`/`DateTime` 입력이면 `Date`/`DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력이면 `Date32`/`DateTime64`를 반환합니다     |
| `toLastDayOfMonth`        | `Date` 또는 `DateTime`을 반환합니다                                                  | `Date`/`DateTime` 입력 시 `Date`/`DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력 시 `Date32`/`DateTime64`를 반환합니다     |
| `toMonday`                | `Date` 또는 `DateTime`를 반환합니다                                                  | `Date`/`DateTime` 입력 시 `Date`/`DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력 시 `Date32`/`DateTime64`를 반환합니다     |
| `toStartOfDay`            | `DateTime`을 반환합니다<br />*참고: 1970-2149 범위를 벗어나는 값에는 잘못된 결과가 발생합니다*            | `Date`/`DateTime` 입력 시 `DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력 시 `DateTime64`를 반환합니다                     |
| `toStartOfHour`           | `DateTime`을 반환합니다<br />*주의: 1970-2149년 범위를 벗어나는 값에는 잘못된 결과를 반환합니다*           | `Date`/`DateTime` 입력값에는 `DateTime`을 반환<br />`Date32`/`DateTime64` 입력값에는 `DateTime64`를 반환                         |
| `toStartOfFifteenMinutes` | `DateTime`을 반환합니다<br />*참고: 1970-2149 범위를 벗어나는 값에 대해서는 잘못된 결과가 반환됩니다*        | `Date`/`DateTime` 입력값인 경우 `DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력값인 경우 `DateTime64`를 반환합니다               |
| `toStartOfTenMinutes`     | `DateTime`을 반환합니다<br />*참고: 1970-2149년 범위를 벗어나는 값에 대해서는 잘못된 결과를 반환합니다*       | `Date`/`DateTime` 입력에 대해 `DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력에 대해 `DateTime64`를 반환합니다                 |
| `toStartOfFiveMinutes`    | `DateTime`을 반환합니다<br />*주의: 1970년부터 2149년까지의 범위를 벗어나는 값에 대해서는 잘못된 결과가 반환됩니다* | `Date`/`DateTime`을 입력하면 `DateTime`을 반환합니다<br />`Date32`/`DateTime64`를 입력하면 `DateTime64`를 반환합니다                   |
| `toStartOfMinute`         | `DateTime`을 반환합니다<br />*참고: 1970-2149년 범위를 벗어나는 값에는 잘못된 결과가 반환됩니다*           | `Date`/`DateTime` 입력 시 `DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력 시 `DateTime64`를 반환합니다                     |
| `timeSlot`                | `DateTime`을 반환합니다<br />*참고: 1970-2149년 범위를 벗어나는 값에는 잘못된 결과가 반환됩니다*           | `Date`/`DateTime` 입력값에 대해 `DateTime`을 반환합니다<br />`Date32`/`DateTime64` 입력값에 대해 `DateTime64`를 반환합니다               |

## enable_filesystem_cache \{#enable_filesystem_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

원격 파일 시스템에서 캐시를 사용합니다. 이 설정은 디스크 캐시를 켜거나 끄지 않으며(이는 디스크 설정을 통해 구성해야 합니다), 필요할 경우 특정 쿼리가 캐시를 우회하도록 허용합니다.

## enable_filesystem_cache_log \{#enable_filesystem_cache_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

각 쿼리에 대한 파일 시스템 캐시 로그를 기록할 수 있도록 합니다

## enable_filesystem_cache_on_write_operations \{#enable_filesystem_cache_on_write_operations\}

<SettingsInfoBlock type="Bool" default_value="0" />

`write-through` 캐시를 활성화하거나 비활성화합니다. `false`로 설정하면 쓰기 작업에 대해 `write-through` 캐시가 비활성화됩니다. `true`로 설정하면 서버 설정(server config)의 캐시 디스크 구성 섹션에서 `cache_on_write_operations`가 활성화되어 있는 동안 `write-through` 캐시가 활성화됩니다.
자세한 내용은 「[Using local cache](/operations/storing-data#using-local-cache)」를 참조하십시오.

## enable_filesystem_read_prefetches_log \{#enable_filesystem_read_prefetches_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리 실행 중 `system.filesystem`의 `prefetch_log`에 로그를 기록합니다. 테스트나 디버깅 목적에만 사용해야 하며, 기본적으로 활성화해 두는 것은 권장되지 않습니다.

## enable_full_text_index \{#enable_full_text_index\}

<BetaBadge/>

**별칭**: `allow_experimental_full_text_index`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "텍스트 인덱스가 이제 일반 공급(GA)입니다"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "0"},{"label": "텍스트 인덱스가 베타 단계로 이전되었습니다."}]}]}/>

true로 설정하면 텍스트 인덱스를 사용할 수 있도록 허용합니다.

## enable_global_with_statement \{#enable_global_with_statement\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "기본적으로 WITH SQL 문을 UNION 쿼리 및 모든 서브쿼리에 전파합니다"}]}]}/>

기본적으로 WITH SQL 문을 UNION 쿼리 및 모든 서브쿼리에 전파합니다

## enable_hdfs_pread \{#enable_hdfs_pread\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "새로운 설정입니다."}]}]}/>

HDFS 파일에 대한 pread 사용을 활성화하거나 비활성화합니다. 기본적으로 `hdfsPread`가 사용됩니다. 비활성화하면 HDFS 파일을 읽을 때 `hdfsRead` 및 `hdfsSeek`가 사용됩니다.

## enable_http_compression \{#enable_http_compression\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "일반적으로 권장됩니다"}]}]}/>

HTTP 요청에 대한 응답으로 반환되는 데이터의 압축을 활성화하거나 비활성화합니다.

자세한 내용은 [HTTP 인터페이스에 대한 설명](/interfaces/http)을 참조하십시오.

가능한 값:

- 0 — 비활성화됨.
- 1 — 활성화됨.

## enable_job_stack_trace \{#enable_job_stack_trace\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "성능 오버헤드를 피하기 위해 기본적으로 비활성화되어 있습니다."}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "작업 스케줄링에서 스택 트레이스를 수집하도록 활성화합니다. 성능 오버헤드를 피하기 위해 기본적으로 비활성화되어 있습니다."}]}]}/>

작업이 예외로 종료될 때 작업 생성자의 스택 트레이스를 출력합니다. 성능 오버헤드를 피하기 위해 기본적으로 비활성화되어 있습니다.

## enable_join_runtime_filters \{#enable_join_runtime_filters\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "이 최적화를 활성화함"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "새 설정"}]}]}/>

실행 시간에 JOIN의 오른쪽 테이블에서 수집한 JOIN 키 Set으로 왼쪽 테이블을 필터링합니다.

## enable_lazy_columns_replication \{#enable_lazy_columns_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "기본적으로 JOIN 및 ARRAY JOIN에서 lazy columns replication을 활성화합니다"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "JOIN 및 ARRAY JOIN에서 lazy columns replication을 활성화하는 설정을 추가합니다"}]}]}/>

JOIN 및 ARRAY JOIN에서 lazy columns replication을 활성화합니다. 이를 통해 동일한 행을 메모리에서 불필요하게 여러 번 복사하는 것을 방지할 수 있습니다.

## enable_lightweight_delete \{#enable_lightweight_delete\}

**별칭**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree 테이블에서 경량 삭제(DELETE) 뮤테이션을 활성화합니다.

## enable_lightweight_update \{#enable_lightweight_update\}

<BetaBadge/>

**별칭**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "경량 업데이트가 Beta 단계로 전환되었습니다. 설정 'allow_experimental_lightweight_update'에 대한 별칭이 추가되었습니다."}]}]}/>

경량 업데이트 사용을 허용합니다.

## enable_memory_bound_merging_of_aggregation_results \{#enable_memory_bound_merging_of_aggregation_results\}

<SettingsInfoBlock type="Bool" default_value="1" />

집계에 대해 메모리 기반 병합 전략을 사용하도록 설정합니다.

## enable_multiple_prewhere_read_steps \{#enable_multiple_prewhere_read_steps\}

<SettingsInfoBlock type="Bool" default_value="1" />

AND로 결합된 여러 조건이 있는 경우, WHERE의 더 많은 조건을 PREWHERE로 이동하여 디스크에서 데이터를 여러 단계에 걸쳐 읽고 필터링합니다.

## enable_named_columns_in_function_tuple \{#enable_named_columns_in_function_tuple\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "모든 이름이 고유하며 따옴표 없이 사용할 수 있는 식별자로 취급될 수 있을 때 tuple() 함수에서 이름이 지정된 튜플을 생성합니다."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "사용성 개선을 위해 비활성화됨"}]}]}/>

모든 이름이 고유하며 따옴표 없이 사용할 수 있는 식별자로 취급될 수 있을 때 tuple() 함수에서 이름이 지정된 튜플을 생성합니다.

## enable_optimize_predicate_expression \{#enable_optimize_predicate_expression\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "기본적으로 서브쿼리에 대한 프레디케이트 최적화"}]}]}/>

`SELECT` 쿼리에서 프레디케이트 푸시다운(predicate pushdown)을 활성화합니다.

프레디케이트 푸시다운은 분산 쿼리의 네트워크 트래픽을 크게 줄일 수 있습니다.

사용 가능한 값:

- 0 — 비활성화됩니다.
- 1 — 활성화됩니다.

사용

다음 쿼리를 예로 들 수 있습니다.

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

`enable_optimize_predicate_expression = 1`인 경우, ClickHouse가 서브쿼리를 처리할 때 `WHERE`를 서브쿼리에 적용하므로 두 쿼리의 실행 시간은 동일합니다.

`enable_optimize_predicate_expression = 0`인 경우, 서브쿼리가 끝난 후 모든 데이터에 `WHERE` 절이 적용되므로 두 번째 쿼리의 실행 시간은 훨씬 더 길어집니다.

## enable_optimize_predicate_expression_to_final_subquery \{#enable_optimize_predicate_expression_to_final_subquery\}

<SettingsInfoBlock type="Bool" default_value="1" />

프레디케이트를 최종 서브쿼리로 푸시할 수 있도록 허용합니다.

## enable_order_by_all \{#enable_order_by_all\}

<SettingsInfoBlock type="Bool" default_value="1" />

`ORDER BY ALL` 구문을 사용한 정렬을 활성화하거나 비활성화합니다. 자세한 내용은 [ORDER BY](../../sql-reference/statements/select/order-by.md)를 참조하십시오.

가능한 값:

* 0 — ORDER BY ALL을 비활성화합니다.
* 1 — ORDER BY ALL을 활성화합니다.

**예제**

쿼리:

```sql
CREATE TABLE TAB(C1 Int, C2 Int, ALL Int) ENGINE=Memory();

INSERT INTO TAB VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM TAB ORDER BY ALL; -- returns an error that ALL is ambiguous

SELECT * FROM TAB ORDER BY ALL SETTINGS enable_order_by_all = 0;
```

결과:

```text
┌─C1─┬─C2─┬─ALL─┐
│ 20 │ 20 │  10 │
│ 30 │ 10 │  20 │
│ 10 │ 20 │  30 │
└────┴────┴─────┘
```


## enable_parallel_blocks_marshalling \{#enable_parallel_blocks_marshalling\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "true"},{"label": "A new setting"}]}]}/>

분산 쿼리에만 영향을 줍니다. 활성화하면 블록의 직렬화/역직렬화 및 압축/압축 해제 작업이, 기본값보다 더 높은 수준의 병렬성이 적용되는 파이프라인 스레드에서 이니시에이터로 전송되기 전후에 수행됩니다.

## enable_parsing_to_custom_serialization \{#enable_parsing_to_custom_serialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

true인 경우, 테이블에서 가져온 직렬화 힌트에 따라 사용자 정의 직렬화(예: Sparse)를 사용하는 컬럼으로 데이터를 직접 파싱할 수 있습니다.

## enable_positional_arguments \{#enable_positional_arguments\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "기본값으로 위치 인수 기능 활성화"}]}]} />

[GROUP BY](/sql-reference/statements/select/group-by), [LIMIT BY](../../sql-reference/statements/select/limit-by.md), [ORDER BY](../../sql-reference/statements/select/order-by.md) SQL 문에서 위치 인수 지원을 활성화하거나 비활성화합니다.

가능한 값:

* 0 — 위치 인수를 지원하지 않습니다.
* 1 — 위치 인수를 지원합니다. 컬럼 이름 대신 컬럼 번호를 사용할 수 있습니다.

**예시**

쿼리:

```sql
CREATE TABLE positional_arguments(one Int, two Int, three Int) ENGINE=Memory();

INSERT INTO positional_arguments VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM positional_arguments ORDER BY 2,3;
```

결과:

```text
┌─one─┬─two─┬─three─┐
│  30 │  10 │   20  │
│  20 │  20 │   10  │
│  10 │  20 │   30  │
└─────┴─────┴───────┘
```


## enable_positional_arguments_for_projections \{#enable_positional_arguments_for_projections\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "프로젝션에서 위치 기반 인자를 제어하기 위한 새로운 설정."}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "0"},{"label": "프로젝션에서 위치 기반 인자를 제어하기 위한 새로운 설정."}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "프로젝션에서 위치 기반 인자를 제어하기 위한 새로운 설정."}]}]}/>

PROJECTION 정의에서 위치 기반 인자 지원을 활성화하거나 비활성화합니다. [enable_positional_arguments](#enable_positional_arguments) 설정도 참고하십시오.

:::note
전문가 수준의 설정이므로 ClickHouse를 처음 사용한다면 변경하지 않는 것이 좋습니다.
:::

가능한 값은 다음과 같습니다.

- 0 — 위치 기반 인자를 지원하지 않습니다.
- 1 — 위치 기반 인자를 지원합니다. 컬럼 이름 대신 컬럼 번호를 사용할 수 있습니다.

## enable_producing_buckets_out_of_order_in_aggregation \{#enable_producing_buckets_out_of_order_in_aggregation\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

메모리 효율적인 집계(`distributed_aggregation_memory_efficient` 참조)에서 버킷을 순서와 다르게 생성할 수 있도록 허용합니다.
집계 버킷 크기가 편중된 경우, 레플리카가 낮은 ID를 가진 무거운 버킷을 아직 처리하는 동안 더 높은 ID를 가진 버킷을 먼저 이니시에이터로 전송할 수 있게 되어 성능이 향상될 수 있습니다.
단점은 메모리 사용량이 더 높아질 수 있다는 점입니다.

## enable_reads_from_query_cache \{#enable_reads_from_query_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

활성화된 경우 `SELECT` 쿼리의 결과를 [쿼리 캐시](../query-cache.md)에서 가져옵니다.

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## enable_s3_requests_logging \{#enable_s3_requests_logging\}

<SettingsInfoBlock type="Bool" default_value="0" />

S3 요청에 대한 매우 상세한 로깅을 활성화합니다. 디버깅 목적으로만 사용하는 것이 좋습니다.

## enable_scalar_subquery_optimization \{#enable_scalar_subquery_optimization\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "스칼라 서브쿼리가 큰 스칼라 값을 (디)직렬화하지 않도록 하고, 동일한 서브쿼리를 여러 번 실행하지 않도록 할 수 있음"}]}]}/>

`true`로 설정하면 스칼라 서브쿼리가 큰 스칼라 값을 (디)직렬화하지 않도록 하고, 동일한 서브쿼리를 여러 번 실행하지 않도록 할 수 있습니다.

## enable_scopes_for_with_statement \{#enable_scopes_for_with_statement\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "이전 analyzer와의 하위 호환성을 위한 새로운 설정입니다."}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "이전 analyzer와의 하위 호환성을 위한 새로운 설정입니다."}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "이전 analyzer와의 하위 호환성을 위한 새로운 설정입니다."}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "이전 analyzer와의 하위 호환성을 위한 새로운 설정입니다."}]}]}/>

비활성화되면 상위 WITH 절에서의 선언은 마치 현재 스코프에서 선언된 것과 동일한 스코프로 동작합니다.

이는 analyzer에 대한 호환성 설정으로, 이전 analyzer가 실행할 수 있었던 일부 잘못된 쿼리를 계속 실행할 수 있도록 허용합니다.

## enable_shared_storage_snapshot_in_query \{#enable_shared_storage_snapshot_in_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "쿼리에서 스토리지 스냅샷을 공유하기 위한 새로운 설정"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "기본적으로 쿼리에서 스토리지 스냅샷 공유를 활성화"}]}]} />

설정을 활성화하면 단일 쿼리 내의 모든 서브쿼리는 각 테이블에 대해 동일한 StorageSnapshot을 공유합니다.
이를 통해 동일한 테이블에 여러 번 액세스하더라도 쿼리 전체에서 데이터에 대한 일관된 뷰가 보장됩니다.

데이터 파트의 내부 일관성이 중요한 쿼리에는 이 설정이 필요합니다. 예:

```sql
SELECT
    count()
FROM events
WHERE (_part, _part_offset) IN (
    SELECT _part, _part_offset
    FROM events
    WHERE user_id = 42
)
```

이 설정이 없으면 외부 쿼리와 내부 쿼리가 서로 다른 데이터 스냅샷에서 실행되어 잘못된 결과가 발생할 수 있습니다.

:::note
이 설정을 활성화하면 실행 계획 수립 단계가 완료된 후 스냅샷에서 불필요한 파트를 제거하는 최적화 기능이 비활성화됩니다.
그 결과, 장시간 실행되는 쿼리는 전체 실행 시간 동안 불필요해진 파트를 계속 유지하게 되어 파트 정리가 지연되고 스토리지 압박이 증가할 수 있습니다.

이 설정은 현재 MergeTree 계열 테이블에만 적용됩니다.
:::

가능한 값:

* 0 - 비활성화
* 1 - 활성화


## enable_sharing_sets_for_mutations \{#enable_sharing_sets_for_mutations\}

<SettingsInfoBlock type="Bool" default_value="1" />

동일한 뮤테이션 내의 서로 다른 작업 간에 IN 서브쿼리에서 생성된 Set 객체를 공유할 수 있도록 허용합니다. 이를 통해 메모리 사용량과 CPU 사용량이 줄어듭니다.

## enable_software_prefetch_in_aggregation \{#enable_software_prefetch_in_aggregation\}

<SettingsInfoBlock type="Bool" default_value="1" />

집계(aggregation) 과정에서 software prefetch 사용을 활성화합니다.

## enable_time_time64_type \{#enable_time_time64_type\}

**별칭**: `allow_experimental_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "새로운 설정입니다. 새로운 실험적 Time 및 Time64 데이터 타입 사용을 허용합니다."}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "기본값으로 Time 및 Time64 타입을 활성화합니다."}]}]}/>

[Time](../../sql-reference/data-types/time.md) 및 [Time64](../../sql-reference/data-types/time64.md) 데이터 타입 생성을 허용합니다.

## enable_unaligned_array_join \{#enable_unaligned_array_join\}

<SettingsInfoBlock type="Bool" default_value="0" />

서로 다른 크기의 여러 배열에 대해 ARRAY JOIN을 허용합니다. 이 설정을 활성화하면 배열이 가장 긴 배열의 크기에 맞게 조정됩니다.

## enable_url_encoding \{#enable_url_encoding\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "기존 설정의 기본값이 변경됨"}]}]}/>

[URL](../../engines/table-engines/special/url.md) 엔진 테이블에서 URI 경로의 디코딩/인코딩을 활성화하거나 비활성화합니다.

기본적으로 비활성화되어 있습니다.

## enable_vertical_final \{#enable_vertical_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "버그를 수정한 후 vertical FINAL을 기본값으로 다시 활성화"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "기본값으로 vertical FINAL 사용"}]}]}/>

활성화되면 FINAL 중에 행을 병합하는 대신 행을 삭제된 것으로 표시해 두었다가 이후 필터링하여 중복된 행을 제거합니다

## enable_writes_to_query_cache \{#enable_writes_to_query_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

활성화되어 있으면 `SELECT` 쿼리의 결과가 [쿼리 캐시](../query-cache.md)에 저장됩니다.

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## enforce_strict_identifier_format \{#enforce_strict_identifier_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "새로운 설정."}]}]}/>

이 설정을 활성화하면 영문자, 숫자, 밑줄(_)만 포함하는 식별자만 허용됩니다.

## engine_file_allow_create_multiple_files \{#engine_file_allow_create_multiple_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

형식 이름에 접미사(`JSON`, `ORC`, `Parquet` 등)가 있는 경우, File 엔진 테이블에서 각 `INSERT`마다 새 파일을 생성할지 여부를 설정합니다. 활성화되면 각 `INSERT` 시 다음 패턴을 따르는 이름의 새 파일이 생성됩니다:

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` 등.

가능한 값:

- 0 — `INSERT` 쿼리가 파일 끝에 새 데이터를 추가합니다.
- 1 — `INSERT` 쿼리가 새 파일을 생성합니다.

## engine_file_empty_if_not_exists \{#engine_file_empty_if_not_exists\}

<SettingsInfoBlock type="Bool" default_value="0" />

파일이 존재하지 않는 file 엔진 테이블에서도 데이터를 조회할 수 있게 합니다.

가능한 값:

- 0 — `SELECT`가 예외를 발생시킵니다.
- 1 — `SELECT`가 빈 결과를 반환합니다.

## engine_file_skip_empty_files \{#engine_file_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) 엔진 테이블에서 빈 파일을 건너뛰도록 할지 여부를 설정합니다.

가능한 값:

- 0 — 빈 파일이 요청된 포맷과 호환되지 않는 경우 `SELECT`가 예외를 발생시킵니다.
- 1 — 빈 파일인 경우 `SELECT`가 빈 결과를 반환합니다.

## engine_file_truncate_on_insert \{#engine_file_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) 엔진 테이블에서 `INSERT` 전에 파일을 잘라내기(truncate)할지 여부를 설정합니다.

가능한 값:

- 0 — `INSERT` 쿼리가 파일 끝에 새 데이터를 추가합니다.
- 1 — `INSERT` 쿼리가 파일의 기존 내용을 새 데이터로 대체합니다.

## engine_url_skip_empty_files \{#engine_url_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

[URL](../../engines/table-engines/special/url.md) 엔진 테이블에서 빈 파일을 건너뛰도록 할지 여부를 설정합니다.

가능한 값:

- 0 — 요청된 형식과 호환되지 않는 빈 파일이 있으면 `SELECT`가 예외를 발생시킵니다.
- 1 — 빈 파일에 대해 `SELECT`가 빈 결과를 반환합니다.

## exact_rows_before_limit \{#exact_rows_before_limit\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면 ClickHouse가 rows_before_limit_at_least 통계에 대해 정확한 값을 제공하지만, 그 대신 limit 이전의 데이터를 모두 읽어야 하는 비용이 발생합니다.

## except_default_mode \{#except_default_mode\}

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

EXCEPT 쿼리에서 기본 모드를 설정합니다. 가능한 값: 빈 문자열, 'ALL', 'DISTINCT'입니다. 빈 문자열이면, 모드가 지정되지 않은 쿼리는 예외가 발생합니다.

## exclude_materialize_skip_indexes_on_insert \{#exclude_materialize_skip_indexes_on_insert\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "새로운 설정입니다."}]}]} />

INSERT 수행 시 생성 및 저장에서 제외할 skip 인덱스를 지정합니다. 제외된 skip 인덱스는 [머지 작업 중](merge-tree-settings.md/#materialize_skip_indexes_on_merge) 또는 명시적인
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 쿼리에 의해 여전히 생성 및 저장됩니다.

[materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert)가 false인 경우 효과가 없습니다.

예:

```sql
CREATE TABLE tab
(
    a UInt64,
    b UInt64,
    INDEX idx_a a TYPE minmax,
    INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple();

SET exclude_materialize_skip_indexes_on_insert='idx_a'; -- idx_a will be not be updated upon insert
--SET exclude_materialize_skip_indexes_on_insert='idx_a, idx_b'; -- neither index would be updated on insert

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- only idx_b is updated

-- since it is a session setting it can be set on a per-query level
INSERT INTO tab SELECT number, number / 50 FROM numbers(100, 100) SETTINGS exclude_materialize_skip_indexes_on_insert='idx_b';

ALTER TABLE tab MATERIALIZE INDEX idx_a; -- this query can be used to explicitly materialize the index

SET exclude_materialize_skip_indexes_on_insert = DEFAULT; -- reset setting to default
```


## execute_exists_as_scalar_subquery \{#execute_exists_as_scalar_subquery\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

비상관 EXISTS 서브쿼리를 스칼라 서브쿼리로 실행합니다. 스칼라 서브쿼리와 동일하게 캐시가 사용되며, 결과에는 상수 폴딩이 적용됩니다.

## external_storage_connect_timeout_sec \{#external_storage_connect_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="10" />

연결 타임아웃 시간(초)입니다. 현재는 MySQL에만 적용됩니다.

## external_storage_max_read_bytes \{#external_storage_max_read_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

외부 엔진 테이블이 이력 데이터를 플러시할 때 읽을 수 있는 최대 바이트 수를 제한합니다. 현재는 MySQL 테이블 엔진, 데이터베이스 엔진, 딕셔너리에 대해서만 지원됩니다. 0으로 설정하면 이 설정은 비활성화됩니다.

## external_storage_max_read_rows \{#external_storage_max_read_rows\}

<SettingsInfoBlock type="UInt64" default_value="0" />

외부 엔진을 사용하는 테이블이 이력 데이터를 플러시할 때 허용되는 최대 행 수를 제한합니다. 지금은 MySQL table engine 및 database engine, 그리고 딕셔너리에 대해서만 지원됩니다. 값이 0이면 이 설정은 비활성화됩니다.

## external_storage_rw_timeout_sec \{#external_storage_rw_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />

초 단위의 읽기/쓰기 타임아웃입니다. 현재는 MySQL에만 지원됩니다.

## external_table_functions_use_nulls \{#external_table_functions_use_nulls\}

<SettingsInfoBlock type="Bool" default_value="1" />

[mysql](../../sql-reference/table-functions/mysql.md), [postgresql](../../sql-reference/table-functions/postgresql.md) 및 [odbc](../../sql-reference/table-functions/odbc.md) 테이블 함수가 널 허용(Nullable) 컬럼을 어떻게 사용하는지 정의합니다.

가능한 값은 다음과 같습니다.

- 0 — 테이블 함수가 널 허용 컬럼을 명시적으로 사용합니다.
- 1 — 테이블 함수가 널 허용 컬럼을 암시적으로 사용합니다.

**사용**

이 SETTING을 `0`으로 지정하면 테이블 함수는 널 허용 컬럼을 생성하지 않고, NULL 대신 기본값을 삽입합니다. 이는 배열 내부의 NULL 값에도 동일하게 적용됩니다.

## external_table_strict_query \{#external_table_strict_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

`true`로 설정하면 외부 테이블에 대한 쿼리에서 식을 로컬 필터로 변환하는 것이 금지됩니다.

## extract_key_value_pairs_max_pairs_per_row \{#extract_key_value_pairs_max_pairs_per_row\}

**별칭**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "`extractKeyValuePairs` 함수로 생성할 수 있는 최대 키-값 쌍의 수입니다. 과도한 메모리 사용을 방지하기 위한 안전장치로 사용됩니다."}]}]}/>

`extractKeyValuePairs` 함수로 생성할 수 있는 최대 키-값 쌍의 수입니다. 과도한 메모리 사용을 방지하기 위한 안전장치로 사용됩니다.

## extremes \{#extremes\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리 결과 컬럼의 최소값과 최대값인 극단값을 계산할지 여부입니다. 0 또는 1만 사용할 수 있습니다. 기본값은 0(비활성화)입니다.
자세한 내용은 「Extreme values」 섹션을 참조하십시오.

## fallback_to_stale_replicas_for_distributed_queries \{#fallback_to_stale_replicas_for_distributed_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

최신 데이터를 사용할 수 없을 때 오래된 레플리카로 쿼리를 강제로 전송합니다. [복제(Replication)](../../engines/table-engines/mergetree-family/replication.md)를 참고하십시오.

ClickHouse는 테이블의 오래된 레플리카들 가운데 가장 적절한 것을 선택합니다.

복제된 테이블을 가리키는 분산 테이블에서 `SELECT`를 수행할 때 사용됩니다.

기본값은 1(활성화)입니다.

## filesystem_cache_allow_background_download \{#filesystem_cache_allow_background_download\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "filesystem cache에서 쿼리별 백그라운드 다운로드를 제어하기 위한 새 설정입니다."}]}]}/>

원격 스토리지에서 읽은 데이터에 대해 filesystem cache가 백그라운드 다운로드 작업을 대기열에 추가하도록 허용합니다. 이 설정을 비활성화하면 현재 쿼리/세션에서는 다운로드가 포그라운드에서만 수행됩니다.

## filesystem_cache_boundary_alignment \{#filesystem_cache_boundary_alignment\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "New setting"}]}]}/>

파일 시스템 캐시 경계 정렬을 설정합니다. 이 설정은 디스크를 사용하지 않는 읽기 작업(예: 원격 테이블 엔진/테이블 함수의 캐시에는 적용되지만, MergeTree 테이블의 스토리지 구성에는 적용되지 않음)에만 적용됩니다. 값이 0이면 정렬이 적용되지 않음을 의미합니다.

## filesystem_cache_enable_background_download_during_fetch \{#filesystem_cache_enable_background_download_during_fetch\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. filesystem cache에서 공간을 예약하기 위해 캐시를 잠글 때까지 기다리는 시간입니다.

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage \{#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. filesystem 캐시에서 공간을 예약할 때 캐시를 잠그기 위한 대기 시간입니다.

## filesystem_cache_max_download_size \{#filesystem_cache_max_download_size\}

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

단일 쿼리로 다운로드할 수 있는 원격 파일 시스템 캐시의 최대 크기입니다.

## filesystem_cache_name \{#filesystem_cache_name\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "상태가 없는 테이블 엔진 또는 데이터 레이크에 사용할 파일 시스템 캐시 이름"}]}]}/>

상태가 없는 테이블 엔진 또는 데이터 레이크에 사용할 파일 시스템 캐시 이름

## filesystem_cache_prefer_bigger_buffer_size \{#filesystem_cache_prefer_bigger_buffer_size\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

filesystem cache가 활성화된 경우 캐시 성능을 저하시킬 수 있는 작은 파일 세그먼트를 기록하지 않도록 더 큰 버퍼 크기를 사용합니다. 반면, 이 설정을 활성화하면 메모리 사용량이 증가할 수 있습니다.

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds \{#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "파일 시스템 캐시에서 공간을 예약하기 위해 캐시를 잠글 때까지의 대기 시간"}]}]}/>

파일 시스템 캐시에서 공간을 예약하기 위해 캐시를 잠글 때까지의 대기 시간입니다.

## filesystem_cache_segments_batch_size \{#filesystem_cache_segments_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="20" />

읽기 버퍼가 캐시에서 요청할 수 있는 파일 세그먼트 한 배치의 총 크기에 대한 제한입니다. 값이 너무 낮으면 캐시에 대한 요청이 지나치게 많아지고, 값이 너무 크면 캐시에서 데이터 제거(eviction) 속도가 느려질 수 있습니다.

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit \{#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit\}

**별칭**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "설정 skip_download_if_exceeds_query_cache_limit 이름 변경"}]}]}/>

쿼리 캐시 크기를 초과하면 원격 파일 시스템에서 다운로드를 건너뜁니다

## filesystem_prefetch_max_memory_usage \{#filesystem_prefetch_max_memory_usage\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

프리페치에 대해 허용되는 최대 메모리 사용량입니다.

## filesystem_prefetch_step_bytes \{#filesystem_prefetch_step_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

프리페치 단계를 바이트 단위로 지정합니다. 값이 0이면 `auto`를 의미합니다. 이 경우 대략적으로 최적에 가까운 프리페치 단계가 자동으로 추론되지만, 항상 100% 최적이라고는 할 수 없습니다. 실제 값은 filesystem_prefetch_min_bytes_for_single_read_task 설정에 따라 달라질 수 있습니다.

## filesystem_prefetch_step_marks \{#filesystem_prefetch_step_marks\}

<SettingsInfoBlock type="UInt64" default_value="0" />

마크에서의 prefetch 단계입니다. 0이면 `auto`를 의미하며, 최적에 가까운 prefetch 단계가 자동으로 결정되지만 100% 최적이라고는 할 수 없습니다. 실제 값은 설정값 filesystem_prefetch_min_bytes_for_single_read_task 때문에 달라질 수 있습니다.

## filesystem_prefetches_limit \{#filesystem_prefetches_limit\}

<SettingsInfoBlock type="UInt64" default_value="200" />

프리페치의 최대 개수입니다. 0이면 무제한을 의미합니다. 프리페치 개수를 제한하려는 경우 `filesystem_prefetches_max_memory_usage` 설정을 사용하는 것이 더 권장됩니다.

## final \{#final\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리에서 [FINAL](../../sql-reference/statements/select/from.md/#final-modifier)을 적용할 수 있는 모든 테이블(조인된 테이블, 서브쿼리 내 테이블, 분산 테이블(distributed table) 포함)에 [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 수정자를 자동으로 적용합니다.

가능한 값:

* 0 - 비활성화
* 1 - 활성화

예시:

```sql
CREATE TABLE test
(
    key Int64,
    some String
)
ENGINE = ReplacingMergeTree
ORDER BY key;

INSERT INTO test FORMAT Values (1, 'first');
INSERT INTO test FORMAT Values (1, 'second');

SELECT * FROM test;
┌─key─┬─some───┐
│   1 │ second │
└─────┴────────┘
┌─key─┬─some──┐
│   1 │ first │
└─────┴───────┘

SELECT * FROM test SETTINGS final = 1;
┌─key─┬─some───┐
│   1 │ second │
└─────┴────────┘

SET final = 1;
SELECT * FROM test;
┌─key─┬─some───┐
│   1 │ second │
└─────┴────────┘
```


## flatten_nested \{#flatten_nested\}

<SettingsInfoBlock type="Bool" default_value="1" />

[nested](../../sql-reference/data-types/nested-data-structures/index.md) 컬럼의 데이터 형식을 설정합니다.

가능한 값:

* 1 — Nested 컬럼을 개별 배열로 평탄화합니다.
* 0 — Nested 컬럼을 하나의 튜플 배열로 유지합니다.

**사용법**

이 SETTING을 `0`으로 설정하면 임의의 수준까지 중첩을 사용할 수 있습니다.

**예시**

쿼리:

```sql
SET flatten_nested = 1;
CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

결과:

```text
┌─statement───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.t_nest
(
    `n.a` Array(UInt32),
    `n.b` Array(UInt32)
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS index_granularity = 8192 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

쿼리:

```sql
SET flatten_nested = 0;

CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

결과:

```text
┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.t_nest
(
    `n` Nested(a UInt32, b UInt32)
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS index_granularity = 8192 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## force_aggregate_partitions_independently \{#force_aggregate_partitions_independently\}

<SettingsInfoBlock type="Bool" default_value="0" />

적용 가능하지만 휴리스틱에 의해 사용하지 않도록 결정된 경우에도 해당 최적화를 강제로 사용합니다.

## force_aggregation_in_order \{#force_aggregation_in_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정은 서버 자체에서 분산 쿼리를 지원하기 위해 사용됩니다. 수동으로 변경하지 마십시오. 정상적인 동작이 중단될 수 있습니다. (분산 집계 시 원격 노드에서 정렬 순서에 따른 집계("in order" aggregation)을 강제로 사용합니다).

## force_data_skipping_indices \{#force_data_skipping_indices\}

전달된 data skipping 인덱스를 사용하지 않으면 쿼리 실행을 비활성화합니다.

다음 예를 살펴보십시오:

```sql
CREATE TABLE data
(
    key Int,
    d1 Int,
    d1_null Nullable(Int),
    INDEX d1_idx d1 TYPE minmax GRANULARITY 1,
    INDEX d1_null_idx assumeNotNull(d1_null) TYPE minmax GRANULARITY 1
)
Engine=MergeTree()
ORDER BY key;

SELECT * FROM data_01515;
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices=''; -- query will produce CANNOT_PARSE_TEXT error.
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices='d1_idx'; -- query will produce INDEX_NOT_USED error.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='d1_idx'; -- Ok.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`'; -- Ok (example of full featured parser).
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- query will produce INDEX_NOT_USED error, since d1_null_idx is not used.
SELECT * FROM data_01515 WHERE d1 = 0 AND assumeNotNull(d1_null) = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- Ok.
```


## force_grouping_standard_compatibility \{#force_grouping_standard_compatibility\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.9"},{"label": "1"},{"label": "GROUPING 함수의 결과를 SQL 표준 및 다른 DBMS와 동일하게 만듭니다"}]}]}/>

인수가 집계 키로 사용되지 않을 때 GROUPING 함수가 1을 반환하도록 합니다

## force_index_by_date \{#force_index_by_date\}

<SettingsInfoBlock type="Bool" default_value="0" />

인덱스를 날짜 기준으로 사용할 수 없으면 쿼리 실행을 하지 않습니다.

MergeTree 계열 테이블에서 작동합니다.

`force_index_by_date=1`이면 ClickHouse는 쿼리에 데이터 범위를 제한하는 데 사용할 수 있는 날짜 키 조건이 있는지 확인합니다. 적절한 조건이 없으면 예외를 발생시킵니다. 그러나 해당 조건이 실제로 읽을 데이터 양을 줄이는지는 확인하지 않습니다. 예를 들어 조건 `Date != ' 2000-01-01 '`은 테이블의 모든 데이터와 일치하더라도(즉, 쿼리를 실행하려면 전체 스캔이 필요함) 허용됩니다. MergeTree 테이블의 데이터 범위에 대한 자세한 내용은 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)를 참조하십시오.

## force_optimize_projection \{#force_optimize_projection\}

<SettingsInfoBlock type="Bool" default_value="0" />

[프로젝션](../../engines/table-engines/mergetree-family/mergetree.md/#projections) 최적화가 활성화된 경우(설정 [optimize_use_projections](#optimize_use_projections) 참조), `SELECT` 쿼리에서 프로젝션을 반드시 사용하도록 강제할지 여부를 설정합니다.

가능한 값:

- 0 — 프로젝션 사용을 강제하지 않습니다.
- 1 — 프로젝션 사용을 강제합니다.

## force_optimize_projection_name \{#force_optimize_projection_name\}

비어 있지 않은 문자열로 설정하면 해당 PROJECTION이 쿼리에서 최소 한 번 이상 사용되는지 확인합니다.

가능한 값:

- string: 쿼리에서 사용할 PROJECTION의 이름

## force_optimize_skip_unused_shards \{#force_optimize_skip_unused_shards\}

<SettingsInfoBlock type="UInt64" default_value="0" />

[optimize_skip_unused_shards](#optimize_skip_unused_shards)가 활성화되어 있고 사용되지 않는 세그먼트를 건너뛸 수 없을 때, 쿼리 실행을 허용할지 여부를 설정합니다. 세그먼트를 건너뛸 수 없고 이 설정이 활성화되어 있으면 예외가 발생합니다.

가능한 값:

- 0 — 비활성화. ClickHouse는 예외를 발생시키지 않습니다.
- 1 — 활성화. 테이블에 샤딩 키가 있는 경우에만 쿼리 실행이 비활성화됩니다.
- 2 — 활성화. 테이블에 샤딩 키가 정의되어 있는지 여부와 관계없이 쿼리 실행이 비활성화됩니다.

## force_optimize_skip_unused_shards_nesting \{#force_optimize_skip_unused_shards_nesting\}

<SettingsInfoBlock type="UInt64" default_value="0" />

분산 쿼리의 중첩 수준(예: 하나의 `Distributed` 테이블이 다른 `Distributed` 테ーブル을 조회하는 경우)에 따라 [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards)의 동작을 제어합니다. 이 설정이 적용되려면 [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards)가 활성화되어 있어야 합니다.

가능한 값:

- 0 - 비활성화. `force_optimize_skip_unused_shards`가 항상 동작합니다.
- 1 — 첫 번째 수준에 대해서만 `force_optimize_skip_unused_shards`를 활성화합니다.
- 2 — 두 번째 수준까지 `force_optimize_skip_unused_shards`를 활성화합니다.

## force_primary_key \{#force_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

기본 키(primary key)를 이용한 인덱싱이 불가능한 경우 쿼리 실행을 허용하지 않습니다.

MergeTree 계열 테이블에서 동작합니다.

`force_primary_key=1`인 경우, ClickHouse는 쿼리에 데이터 범위를 제한하는 데 사용할 수 있는 기본 키 조건이 있는지 확인합니다. 적절한 조건이 없으면 예외를 발생시킵니다. 다만 해당 조건이 실제로 읽을 데이터 양을 줄이는지는 확인하지 않습니다. MergeTree 테이블의 데이터 범위에 대한 자세한 내용은 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)를 참조하십시오.

## force_remove_data_recursively_on_drop \{#force_remove_data_recursively_on_drop\}

<SettingsInfoBlock type="Bool" default_value="0" />

DROP 쿼리에서 데이터를 재귀적으로 삭제합니다. 「Directory not empty」 오류를 방지하지만, 분리(detached)된 데이터가 사용자에게 알리지 않고 삭제될 수 있습니다

## formatdatetime_e_with_space_padding \{#formatdatetime_e_with_space_padding\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "MySQL DATE_FORMAT/STR_TO_DATE와의 호환성 개선"}]}]}/>

함수 `formatDateTime`에서 포맷 지정자 '%e'는 한 자리 수 날짜를 앞에 공백을 하나 붙여 출력합니다(예: '2'가 아니라 ' 2').

## formatdatetime_f_prints_scale_number_of_digits \{#formatdatetime_f_prints_scale_number_of_digits\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting."}]}]}/>

`formatDateTime` 함수의 형식 지정자 '%f'는 고정된 6자리 숫자를 출력하는 대신, DateTime64의 스케일(scale)에 해당하는 자릿수만 출력합니다.

## formatdatetime_f_prints_single_zero \{#formatdatetime_f_prints_single_zero\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Improved compatibility with MySQL DATE_FORMAT()/STR_TO_DATE()"}]}]}/>

함수 'formatDateTime'에서 서식 지정자 '%f'는 형식화된 값에 소수 초가 없을 때 6개의 0 대신 1개의 0만 출력합니다.

## formatdatetime_format_without_leading_zeros \{#formatdatetime_format_without_leading_zeros\}

<SettingsInfoBlock type="Bool" default_value="0" />

「formatDateTime」 함수에서 포매터 '%c', '%l', '%k'는 앞에 0을 붙이지 않고 월과 시를 출력합니다.

## formatdatetime_parsedatetime_m_is_month_name \{#formatdatetime_parsedatetime_m_is_month_name\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "Improved compatibility with MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

`formatDateTime` 및 `parseDateTime` 함수에서 서식 지정자 '%M'은 분(minute)이 아니라 월 이름을 출력하거나 파싱합니다.

## fsync_metadata \{#fsync_metadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

`.sql` 파일을 기록할 때 [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html) 사용을 활성화하거나 비활성화합니다. 기본값은 활성화입니다.

서버에 매우 작은 테이블이 수백만 개에 달하고 이들이 지속적으로 생성 및 삭제되는 경우, 이 설정을 비활성화하는 것이 좋습니다.

## function_date_trunc_return_type_behavior \{#function_date_trunc_return_type_behavior\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "dateTrunc 함수의 이전 동작을 유지하기 위한 새 설정 추가"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "음수 값에 대해서도 올바른 결과를 얻을 수 있도록 DateTime64/Date32 인수에 대해 시간 단위와 무관하게 dateTrunc 함수의 결과 타입을 DateTime64/Date32로 변경"}]}]}/>

`dateTrunc` 함수의 결과 타입 동작 방식을 변경할 수 있도록 합니다.

가능한 값:

- 0 - 두 번째 인수가 `DateTime64/Date32`인 경우, 첫 번째 인수의 시간 단위와 상관없이 반환 타입은 `DateTime64/Date32`가 됩니다.
- 1 - `Date32`의 경우 결과는 항상 `Date`입니다. `DateTime64`의 경우 결과는 시간 단위가 `second` 이상일 때 `DateTime`이 됩니다.

## function_implementation \{#function_implementation\}

특정 타깃 또는 변형(variant)에 사용할 FUNCTION 구현을 선택합니다(실험적). 비워 두면 모든 FUNCTION 구현이 활성화됩니다.

## function_json_value_return_type_allow_complex \{#function_json_value_return_type_allow_complex\}

<SettingsInfoBlock type="Bool" default_value="0" />

json&#95;value 함수에서 struct, array, 맵과 같은 복합 타입의 반환을 허용할지 여부를 제어합니다.

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

가능한 값:

* true — 허용.
* false — 허용 안 함.


## function_json_value_return_type_allow_nullable \{#function_json_value_return_type_allow_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

JSON&#95;VALUE 함수에서 값이 존재하지 않을 때 `NULL`을 반환하도록 허용할지 여부를 제어합니다.

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;

┌─JSON_VALUE('{"hello":"world"}', '$.b')─┐
│ ᴺᵁᴸᴸ                                   │
└────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

가능한 값:

* true — 허용.
* false — 허용 안 함.


## function_locate_has_mysql_compatible_argument_order \{#function_locate_has_mysql_compatible_argument_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "MySQL locate 함수와의 호환성을 높입니다."}]}]}/>

함수 [locate](../../sql-reference/functions/string-search-functions.md/#locate)의 인수 순서를 제어합니다.

가능한 값:

- 0 — 함수 `locate`는 인수 `(haystack, needle[, start_pos])`를 인수로 받습니다.
- 1 — 함수 `locate`는 인수 `(needle, haystack, [, start_pos])`를 인수로 받습니다(MySQL과 호환되는 동작).

## function_range_max_elements_in_block \{#function_range_max_elements_in_block\}

<SettingsInfoBlock type="UInt64" default_value="500000000" />

함수 [range](/sql-reference/functions/array-functions#range)가 생성하는 데이터 양에 대한 안전 임계값을 설정합니다. 데이터 블록 하나에서 함수가 생성하는 값의 최대 개수(블록 내 각 행의 배열 크기 합)를 정의합니다.

설정 가능한 값:

- 양의 정수

**참고**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block \{#function_sleep_max_microseconds_per_block\}

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "이전 버전에서는 3초의 최대 sleep 시간이 `sleep`에만 적용되고 `sleepEachRow` 함수에는 적용되지 않았습니다. 새 버전에서는 이 설정을 도입합니다. 이전 버전과의 호환성을 설정하면 이 제한을 완전히 해제합니다."}]}]}/>

함수 `sleep`이 각 블록에 대해 대기할 수 있는 최대 마이크로초 수입니다. 사용자가 이보다 큰 값으로 호출하면 예외를 발생시킵니다. 안전을 위한 한계값입니다.

## function_visible_width_behavior \{#function_visible_width_behavior\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "`visibleWidth`의 기본 동작을 보다 정밀하게 변경했습니다"}]}]}/>

`visibleWidth` 동작의 버전입니다. 0 - 코드 포인트의 개수만 계산합니다. 1 - zero-width 및 결합 문자를 올바르게 계산하고, 전각 문자를 두 글자로 계산하며, 탭 너비를 추정하고, 삭제 문자도 계산합니다.

## geo_distance_returns_float64_on_float64_arguments \{#geo_distance_returns_float64_on_float64_arguments\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "기본 정밀도가 증가했습니다."}]}]}/>

`geoDistance`, `greatCircleDistance`, `greatCircleAngle` 함수의 네 개 인수가 모두 Float64인 경우 Float64를 반환하고, 내부 계산에는 배정밀도(double precision)를 사용합니다. 이전 ClickHouse 버전에서는 이 함수들이 항상 Float32를 반환했습니다.

## geotoh3_argument_order \{#geotoh3_argument_order\}

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "경도와 위도 인수 순서를 기존 방식으로 설정하기 위한 새로운 설정"}]}]}/>

함수 `geoToH3`는 `lon_lat`로 설정된 경우 (lon, lat)을, `lat_lon`으로 설정된 경우 (lat, lon)을 인수로 받습니다.

## glob_expansion_max_elements \{#glob_expansion_max_elements\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

허용되는 주소의 최대 개수입니다(외부 스토리지, 테이블 함수 등).

## grace_hash_join_initial_buckets \{#grace_hash_join_initial_buckets\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

Grace Hash Join 초기 버킷 수

## grace_hash_join_max_buckets \{#grace_hash_join_max_buckets\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

grace hash join 버킷의 최대 개수 제한

## group_by_overflow_mode \{#group_by_overflow_mode\}

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

집계 시 고유 키 수가 제한을 초과했을 때의 동작을 설정합니다:

- `throw`: 예외를 발생시킵니다.
- `break`: 쿼리 실행을 중지하고 부분 결과를 반환합니다.
- `any`: 집합에 이미 포함된 키에 대해서만 집계를 계속하고, 새로운 키는 집합에 추가하지 않습니다.

`any` 값을 사용하면 GROUP BY를 근사해서 실행할 수 있습니다. 이 근사의 품질은 데이터의 통계적 특성에 따라 달라집니다.

## group_by_two_level_threshold \{#group_by_two_level_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

키 개수가 어느 정도부터 2단계 집계를 시작할지 정의합니다. 0이면 임계값을 사용하지 않습니다.

## group_by_two_level_threshold_bytes \{#group_by_two_level_threshold_bytes\}

<SettingsInfoBlock type="UInt64" default_value="50000000" />

바이트 단위의 집계 상태 크기가 어느 정도부터 두 단계 집계를 사용하기 시작하는지 지정합니다. 0이면 임계값이 설정되지 않습니다. 설정된 임계값 중 하나라도 충족되면 두 단계 집계를 사용합니다.

## group_by_use_nulls \{#group_by_use_nulls\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정은 [GROUP BY 절](/sql-reference/statements/select/group-by)이 집계 키의 자료형을 처리하는 방식을 변경합니다.
`ROLLUP`, `CUBE`, `GROUPING SETS` 지정자를 사용하는 경우, 일부 집계 키는 일부 결과 행을 생성하는 데 사용되지 않을 수 있습니다.
이 설정에 따라 해당 키의 컬럼은 해당 행에서 기본값 또는 `NULL`로 채워집니다.

가능한 값:

- 0 — 누락된 값이 필요한 경우 집계 키 자료형의 기본값을 사용합니다.
- 1 — ClickHouse가 SQL 표준에서 정의한 것과 동일한 방식으로 `GROUP BY`를 실행합니다. 집계 키의 자료형은 [널 허용](/sql-reference/data-types/nullable)으로 변환됩니다. 해당 집계 키에 대한 컬럼은 해당 키가 사용되지 않은 행에 대해 [NULL](/sql-reference/syntax#null)로 채워집니다.

함께 보기:

- [GROUP BY 절](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order \{#h3togeo_lon_lat_result_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "새 설정"}]}]}/>

이 설정이 true이면 함수 'h3ToGeo'는 (lon, lat)을 반환하고, 그렇지 않으면 (lat, lon)을 반환합니다.

## handshake_timeout_ms \{#handshake_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

핸드셰이크 중 레플리카로부터 Hello 패킷을 수신할 때까지 허용되는 시간 제한(밀리초)입니다.

## hdfs_create_new_file_on_insert \{#hdfs_create_new_file_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

HDFS 엔진 테이블에서 각 `INSERT` 시마다 새 파일을 생성할지 여부를 설정합니다. 값을 1로 설정하면 `INSERT`가 실행될 때마다 다음 패턴과 유사한 이름으로 새로운 HDFS 파일이 생성됩니다:

예: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` 등.

가능한 값:

- 0 — `INSERT` 쿼리가 파일의 끝에 새 데이터를 추가합니다.
- 1 — `INSERT` 쿼리가 새 파일을 생성합니다.

## hdfs_ignore_file_doesnt_exist \{#hdfs_ignore_file_doesnt_exist\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "요청한 파일이 존재하지 않을 때 예외를 발생시키는 대신 HDFS 테이블 엔진에서 0개의 행을 반환하도록 허용합니다"}]}]}/>

특정 키를 읽을 때 파일이 존재하지 않으면, 해당 파일의 부재를 무시합니다.

가능한 값:

- 1 — `SELECT`가 빈 결과를 반환합니다.
- 0 — `SELECT`가 예외를 발생시킵니다.

## hdfs_replication \{#hdfs_replication\}

<SettingsInfoBlock type="UInt64" default_value="0" />

실제 복제본 수는 hdfs 파일을 생성할 때 지정할 수 있습니다.

## hdfs_skip_empty_files \{#hdfs_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="0" />

[HDFS](../../engines/table-engines/integrations/hdfs.md) 엔진 테이블에서 빈 파일을 건너뛸지 여부를 설정합니다.

가능한 값:

- 0 — 빈 파일이 요청된 형식과 호환되지 않는 경우 `SELECT`가 예외를 발생시킵니다.
- 1 — 빈 파일에 대해 `SELECT`가 빈 결과를 반환합니다.

## hdfs_throw_on_zero_files_match \{#hdfs_throw_on_zero_files_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "HDFS engine에서 ListObjects 요청이 어떤 파일과도 일치하지 않을 때, 빈 쿼리 결과 대신 오류를 발생시키도록 허용"}]}]}/>

glob 확장 규칙에 따라 일치하는 파일이 0개이면 오류를 발생시킵니다.

가능한 값:

- 1 — `SELECT`가 예외를 발생시킵니다.
- 0 — `SELECT`가 빈 결과를 반환합니다.

## hdfs_truncate_on_insert \{#hdfs_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

HDFS 엔진 테이블에 데이터를 삽입하기 전에 잘라내기(truncate) 동작을 활성화하거나 비활성화합니다. 비활성화하면 HDFS에 해당 파일이 이미 존재하는 경우 삽입을 시도할 때 예외가 발생합니다.

가능한 값:

- 0 — `INSERT` 쿼리가 파일 끝에 새 데이터를 추가합니다.
- 1 — `INSERT` 쿼리가 파일의 기존 내용을 새 데이터로 대체합니다.

## hedged_connection_timeout_ms \{#hedged_connection_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "Start new connection in hedged requests after 50 ms instead of 100 to correspond with previous connect timeout"}]}]}/>

Hedged 요청에서 레플리카에 대한 연결을 설정할 때 적용되는 연결 타임아웃입니다.

## hnsw_candidate_list_size_for_search \{#hnsw_candidate_list_size_for_search\}

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "새로운 설정입니다. 이전에는 CREATE INDEX에서 값을 선택적으로 지정할 수 있었으며, 지정하지 않을 경우 기본값은 64였습니다."}]}]}/>

벡터 유사도 인덱스를 검색할 때 사용되는 동적 후보 목록의 크기이며, 'ef_search'라고도 합니다.

## hsts_max_age \{#hsts_max_age\}

<SettingsInfoBlock type="UInt64" default_value="0" />

HSTS의 만료 시간입니다. 0이면 HSTS가 비활성화됩니다.

## http_connection_timeout \{#http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="1" />

HTTP 연결 타임아웃(초 단위)입니다.

가능한 값:

- 양의 정수.
- 0 - 비활성화(무한 타임아웃).

## http_headers_progress_interval_ms \{#http_headers_progress_interval_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

지정된 간격보다 더 자주 X-ClickHouse-Progress HTTP 헤더를 전송하지 않습니다.

## http_make_head_request \{#http_make_head_request\}

<SettingsInfoBlock type="Bool" default_value="1" />

`http_make_head_request` 설정은 HTTP를 통해 데이터를 읽을 때 `HEAD` 요청을 실행하여 읽을 파일의 크기와 같은 정보를 조회할 수 있게 합니다. 이 설정은 기본적으로 활성화되어 있으므로, 서버가 `HEAD` 요청을 지원하지 않는 경우에는 비활성화하는 것이 바람직할 수 있습니다.

## http_max_field_name_size \{#http_max_field_name_size\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP 헤더 필드 이름의 최대 허용 길이입니다.

## http_max_field_value_size \{#http_max_field_value_size\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP 헤더 필드 값의 최대 길이입니다.

## http_max_fields \{#http_max_fields\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

HTTP 헤더 내 필드의 최대 개수

## http_max_multipart_form_data_size \{#http_max_multipart_form_data_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

multipart/form-data 콘텐츠 크기에 대한 제한입니다. 이 설정은 URL 매개변수에서 파싱할 수 없으며 사용자 프로필에서 설정해야 합니다. 콘텐츠는 쿼리 실행이 시작되기 전에 메모리에서 파싱되고 외부 테이블이 생성된다는 점에 유의하십시오. 이 단계에 영향을 미치는 제한은 이것뿐입니다. (최대 메모리 사용량 및 최대 실행 시간 제한은 HTTP form data를 읽는 동안에는 적용되지 않습니다.)

## http_max_request_param_data_size \{#http_max_request_param_data_size\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

사전에 정의된 HTTP 요청에서 쿼리 매개변수로 사용하는 요청 데이터의 크기 제한입니다.

## http_max_tries \{#http_max_tries\}

<SettingsInfoBlock type="UInt64" default_value="10" />

HTTP를 통해 데이터를 읽는 최대 시도 횟수입니다.

## http_max_uri_size \{#http_max_uri_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

HTTP 요청 URI의 최대 길이를 설정합니다.

가능한 값:

- 양의 정수입니다.

## http_native_compression_disable_checksumming_on_decompress \{#http_native_compression_disable_checksumming_on_decompress\}

<SettingsInfoBlock type="Bool" default_value="0" />

클라이언트에서 전송한 HTTP POST 데이터를 압축 해제할 때 체크섬 검증 여부를 활성화하거나 비활성화합니다. ClickHouse 네이티브 압축 형식에만 사용되며, `gzip` 또는 `deflate`에는 사용되지 않습니다.

자세한 내용은 [HTTP 인터페이스 설명](/interfaces/http)을 참조하십시오.

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## http_receive_timeout \{#http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "http_send_timeout을 참조하십시오."}]}]}/>

HTTP 수신 타임아웃을 초 단위로 지정합니다.

가능한 값:

- 양의 정수.
- 0 - 비활성화(무한 타임아웃).

## http_response_buffer_size \{#http_response_buffer_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

서버가 HTTP 응답을 클라이언트로 전송하거나( `http_wait_end_of_query`가 활성화된 경우) 디스크에 기록하기 전에 서버 메모리에서 버퍼링할 바이트 수입니다.

## http_response_headers \{#http_response_headers\}

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "새 설정입니다."}]}]}/>

성공적으로 처리된 쿼리의 응답에서 서버가 반환하는 HTTP 헤더를 추가하거나 기존 헤더를 재정의할 수 있게 합니다.
이는 HTTP 인터페이스에만 영향을 줍니다.

헤더가 기본값으로 이미 설정되어 있는 경우, 제공된 값이 해당 값을 덮어씁니다.
헤더가 기본값으로 설정되어 있지 않은 경우, 헤더 목록에 새로 추가됩니다.
서버에서 기본으로 설정되었지만 이 설정으로 재정의되지 않은 헤더는 그대로 유지됩니다.

이 설정을 사용하면 헤더를 상수 값으로 설정할 수 있습니다. 현재로서는 동적으로 계산된 값으로 헤더를 설정하는 방법은 없습니다.

헤더 이름과 값 모두 ASCII 제어 문자를 포함할 수 없습니다.

사용자가 설정을 수정할 수 있도록 허용하면서 동시에 반환된 헤더를 기반으로 의사 결정을 내리는 UI 애플리케이션을 구현하는 경우, 이 설정을 읽기 전용(readonly)으로 제한할 것을 권장합니다.

예: `SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms \{#http_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

HTTP를 통해 읽기를 재시도할 때 사용할 최소(초기) 백오프 시간(밀리초)입니다.

## http_retry_max_backoff_ms \{#http_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

HTTP를 통해 읽기를 재시도할 때 사용할 최대 백오프 시간(밀리초)입니다.

## http_send_timeout \{#http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3분은 지나치게 길어 보입니다. 이는 전체 업로드 작업이 아니라 단일 네트워크 쓰기 호출에 대한 타임아웃이라는 점에 유의하십시오."}]}]}/>

HTTP 전송 타임아웃(초 단위)입니다.

허용되는 값:

- 임의의 양의 정수.
- 0 — 비활성화(타임아웃 없음).

:::note
기본 프로필에만 적용됩니다. 변경 사항을 적용하려면 서버를 재부팅해야 합니다.
:::

## http_skip_not_found_url_for_globs \{#http_skip_not_found_url_for_globs\}

<SettingsInfoBlock type="Bool" default_value="1" />

HTTP_NOT_FOUND 오류가 발생한 glob 패턴에 대한 URL을 건너뜁니다.

## http_wait_end_of_query \{#http_wait_end_of_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

서버에서 HTTP 응답을 버퍼링하도록 설정합니다.

## 출력 형식으로 예외 기록 \{#http_write_exception_in_output_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "형식 간 일관성을 위해 변경됨"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "HTTP 스트리밍 중 예외 발생 시 유효한 JSON/XML을 출력합니다."}]}]}/>

유효한 출력을 생성하도록 예외를 출력 형식으로 기록합니다. JSON 및 XML 형식에서 동작합니다.

## http_zlib_compression_level \{#http_zlib_compression_level\}

<SettingsInfoBlock type="Int64" default_value="3" />

[enable_http_compression = 1](#enable_http_compression)인 경우 HTTP 요청에 대한 응답에서 사용하는 데이터 압축 수준을 설정합니다.

가능한 값: 1부터 9까지의 숫자입니다.

## iceberg_delete_data_on_drop \{#iceberg_delete_data_on_drop\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "새 설정"}]}]}/>

DROP 시 모든 Iceberg 파일을 삭제할지 여부를 지정합니다.

## iceberg_insert_max_bytes_in_data_file \{#iceberg_insert_max_bytes_in_data_file\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "새로운 설정입니다."}]}]}/>

INSERT 작업 시 iceberg Parquet 데이터 파일의 최대 크기(바이트 단위)입니다.

## iceberg_insert_max_partitions \{#iceberg_insert_max_partitions\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100"},{"label": "New setting."}]}]}/>

Iceberg 테이블 엔진에서 하나의 INSERT 작업당 허용되는 최대 파티션 수입니다.

## iceberg_insert_max_rows_in_data_file \{#iceberg_insert_max_rows_in_data_file\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "새로운 설정입니다."}]}]}/>

INSERT 작업 시 생성되는 Iceberg Parquet 데이터 파일의 최대 행 수입니다.

## iceberg_metadata_compression_method \{#iceberg_metadata_compression_method\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "새로운 설정"}]}]}/>

`.metadata.json` 파일의 압축 방법입니다.

## iceberg_metadata_log_level \{#iceberg_metadata_log_level\}

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "새로운 설정입니다."}]}]}/>

Iceberg 테이블에 대해 system.iceberg_metadata_log에 기록되는 메타데이터 로그 수준을 제어합니다.
일반적으로 이 설정은 주로 디버깅 목적으로 수정할 수 있습니다.

가능한 값:

- none - 메타데이터 로그를 기록하지 않습니다.
- metadata - 루트 metadata.json 파일.
- manifest_list_metadata - 위의 모든 항목 + 스냅샷에 해당하는 Avro manifest list의 메타데이터.
- manifest_list_entry - 위의 모든 항목 + Avro manifest list 항목들.
- manifest_file_metadata - 위의 모든 항목 + 순회된 Avro manifest 파일들의 메타데이터.
- manifest_file_entry - 위의 모든 항목 + 순회된 Avro manifest 파일 항목들.

## iceberg_snapshot_id \{#iceberg_snapshot_id\}

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

특정 스냅샷 ID를 사용하여 Iceberg 테이블을 쿼리합니다.

## iceberg_timestamp_ms \{#iceberg_timestamp_ms\}

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "새 설정입니다."}]}]}/>

특정 타임스탬프 시점에 유효했던 스냅샷을 사용해 Iceberg 테이블을 쿼리합니다.

## idle_connection_timeout \{#idle_connection_timeout\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

지정된 초가 경과하면 유휴 TCP 연결을 종료하는 시간 제한입니다.

가능한 값:

- 양의 정수 (0 - 0초 후 즉시 종료).

## ignore_cold_parts_seconds \{#ignore_cold_parts_seconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud에서만 적용됩니다. 새로 생성된 데이터 파트는 캐시가 미리 채워져 있거나([cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) 참조) 이 설정에서 지정한 시간(초)만큼 경과하기 전까지는 SELECT 쿼리에서 제외됩니다. Replicated-/SharedMergeTree에서만 사용할 수 있습니다.

## ignore_data_skipping_indices \{#ignore_data_skipping_indices\}

쿼리에서 사용되는 경우, 지정된 데이터 스키핑 인덱스를 무시합니다.

다음 예제를 살펴보십시오:

```sql
CREATE TABLE data
(
    key Int,
    x Int,
    y Int,
    INDEX x_idx x TYPE minmax GRANULARITY 1,
    INDEX y_idx y TYPE minmax GRANULARITY 1,
    INDEX xy_idx (x,y) TYPE minmax GRANULARITY 1
)
Engine=MergeTree()
ORDER BY key;

INSERT INTO data VALUES (1, 2, 3);

SELECT * FROM data;
SELECT * FROM data SETTINGS ignore_data_skipping_indices=''; -- query will produce CANNOT_PARSE_TEXT error.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- Ok.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- Ok.

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- query will produce INDEX_NOT_USED error, since xy_idx is explicitly ignored.
SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';
```

아무 인덱스도 무시하지 않는 쿼리:

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2;

Expression ((Projection + Before ORDER BY))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    Indexes:
      PrimaryKey
        Condition: true
        Parts: 1/1
        Granules: 1/1
      Skip
        Name: x_idx
        Description: minmax GRANULARITY 1
        Parts: 0/1
        Granules: 0/1
      Skip
        Name: y_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
      Skip
        Name: xy_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
```

`xy_idx` 인덱스를 무시:

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';

Expression ((Projection + Before ORDER BY))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    Indexes:
      PrimaryKey
        Condition: true
        Parts: 1/1
        Granules: 1/1
      Skip
        Name: x_idx
        Description: minmax GRANULARITY 1
        Parts: 0/1
        Granules: 0/1
      Skip
        Name: y_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
```

MergeTree 계열의 테이블에서 작동합니다.


## ignore_drop_queries_probability \{#ignore_drop_queries_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "테스트 목적을 위해 지정된 확률로 서버가 DROP 쿼리를 무시하도록 허용"}]}]}/>

이 설정을 활성화하면 서버가 지정된 확률로 모든 DROP TABLE 쿼리를 무시합니다(메모리 엔진과 JOIN 엔진의 경우 DROP을 TRUNCATE로 대체합니다). 테스트 목적으로 사용됩니다.

## ignore_format_null_for_explain \{#ignore_format_null_for_explain\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "FORMAT Null은 이제 기본적으로 EXPLAIN 쿼리에서 무시됩니다"}]}]}/>

활성화하면 `EXPLAIN` 쿼리에서 `FORMAT Null`이 무시되고 기본 출력 형식이 대신 사용됩니다.
비활성화하면 `FORMAT Null`을 사용하는 `EXPLAIN` 쿼리는 아무 출력도 생성하지 않습니다(이전 버전과의 호환 동작).

## ignore_materialized_views_with_dropped_target_table \{#ignore_materialized_views_with_dropped_target_table\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "대상 테이블이 삭제된 materialized view를 무시할 수 있는 새 설정을 추가합니다"}]}]}/>

뷰로 데이터를 푸시할 때 대상 테이블이 삭제된 materialized view를 무시합니다

## ignore_on_cluster_for_replicated_access_entities_queries \{#ignore_on_cluster_for_replicated_access_entities_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

복제된 액세스 엔티티 관리를 위한 쿼리에서 `ON CLUSTER` 절을 무시합니다.

## ignore_on_cluster_for_replicated_database \{#ignore_on_cluster_for_replicated_database\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "복제된 데이터베이스(Replicated Database)를 사용하는 DDL 쿼리에서 ON CLUSTER 절을 무시하기 위한 새로운 설정을 추가했습니다."}]}]}/>

복제된 데이터베이스(Replicated Database)를 사용하는 DDL 쿼리에서는 ON CLUSTER 절을 항상 무시합니다.

## ignore_on_cluster_for_replicated_named_collections_queries \{#ignore_on_cluster_for_replicated_named_collections_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "복제된 named collections 관리 쿼리에서 ON CLUSTER 절을 무시합니다."}]}]}/>

복제된 named collections 관리 쿼리에서 ON CLUSTER 절을 무시합니다.

## ignore_on_cluster_for_replicated_udf_queries \{#ignore_on_cluster_for_replicated_udf_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

레플리카 UDF 관리 쿼리에서 ON CLUSTER 절을 무시합니다.

## implicit_select \{#implicit_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

선행하는 `SELECT` 키워드 없이도 단순한 `SELECT` 쿼리를 작성할 수 있도록 허용하여, 예를 들어 `1 + 2`와 같은 표현도 계산기처럼 간단히 사용할 수 있으며 유효한 쿼리가 됩니다.

`clickhouse-local`에서는 기본값으로 이 설정이 활성화되어 있으며, 명시적으로 비활성화할 수 있습니다.

## implicit_table_at_top_level \{#implicit_table_at_top_level\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "clickhouse-local에서 사용되는 새로운 설정"}]}]}/>

비어 있지 않은 경우, 최상위 수준에서 FROM이 없는 쿼리는 system.one 대신 이 테이블에서 데이터를 읽습니다.

이는 clickhouse-local에서 입력 데이터 처리를 위해 사용됩니다.
이 설정은 사용자가 명시적으로 설정할 수 있지만, 이러한 용도로 사용하도록 의도된 것은 아닙니다.

서브쿼리는 이 설정의 영향을 받지 않습니다(스칼라, FROM, IN 서브쿼리 모두 해당).
UNION, INTERSECT, EXCEPT 체인의 최상위 수준에 있는 SELECT는 괄호로 어떻게 그룹화되어 있는지와 무관하게 동일하게 처리되며, 이 설정의 영향을 받습니다.
이 설정이 뷰와 분산 쿼리에 어떤 영향을 미치는지는 명시되어 있지 않습니다.

이 설정은 테이블 이름(이 경우 테이블은 현재 데이터베이스에서 조회됨) 또는 'database.table' 형식의 정규화된 이름을 허용합니다.
데이터베이스와 테이블 이름 모두 따옴표 없이 작성해야 하며, 단순 식별자만 허용됩니다.

## implicit_transaction \{#implicit_transaction\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정이 활성화되어 있고 아직 트랜잭션 내부가 아닌 경우, 쿼리를 전체 트랜잭션(begin + commit 또는 rollback)으로 감싸서 실행합니다.

## inject_random_order_for_select_without_order_by \{#inject_random_order_for_select_without_order_by\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

설정을 활성화하면 ORDER BY 절이 없는 SELECT 쿼리에 「ORDER BY rand()」를 주입합니다.
서브쿼리 깊이가 0인 경우(최상위 쿼리)에만 적용되며, 서브쿼리와 INSERT INTO ... SELECT 구문에는 영향을 주지 않습니다.
최상위 구문이 UNION인 경우, 「ORDER BY rand()」가 각 자식 쿼리에 독립적으로 주입됩니다.
테스트와 개발 목적에만 유용합니다(ORDER BY를 지정하지 않으면 쿼리 결과가 비결정적(non-deterministic)이 될 수 있습니다).

## insert_allow_materialized_columns \{#insert_allow_materialized_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면 INSERT문에서 materialized 컬럼을 허용합니다.

## insert_deduplicate \{#insert_deduplicate\}

<SettingsInfoBlock type="Bool" default_value="1" />

`INSERT` 블록 중복 제거를 활성화하거나 비활성화합니다(Replicated\* 테이블용).

가능한 값:

- 0 — 비활성화됨.
- 1 — 활성화됨.

기본적으로 `INSERT` 문으로 복제된 테이블에 삽입되는 블록은 중복 제거됩니다([데이터 복제(Data Replication)](../../engines/table-engines/mergetree-family/replication.md) 참조).
복제된 테이블의 경우 기본적으로 각 파티션마다 최근 100개의 블록만 중복 제거됩니다([replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window), [replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) 참조).
복제되지 않은 테이블의 경우 [non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window)를 참조하십시오.

## insert_deduplication_token \{#insert_deduplication_token\}

이 설정은 사용자가 MergeTree/ReplicatedMergeTree에서 고유한 중복 제거 기준을 정의할 수 있도록 합니다.
예를 들어, 각 INSERT 문에서 이 설정에 고유한 값을 지정하면
동일한 삽입 데이터가 중복으로 간주되어 제거되는 것을 방지할 수 있습니다.

가능한 값:

* 임의의 문자열

`insert_deduplication_token`은 비어 있지 않을 때에만 중복 제거에 *사용됩니다*.

복제된 테이블의 경우, 기본적으로 각 파티션마다 가장 최근 100개의 INSERT만 중복 제거됩니다([replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window), [replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) 참고).
비복제 테이블의 경우 [non&#95;replicated&#95;deduplication&#95;window](merge-tree-settings.md/#non_replicated_deduplication_window)를 참고하십시오.

:::note
`insert_deduplication_token`은 파티션 수준에서 동작합니다( `insert_deduplication` 체크섬과 마찬가지입니다). 여러 파티션이 동일한 `insert_deduplication_token`을 가질 수 있습니다.
:::

예:

```sql
CREATE TABLE test_table
( A Int64 )
ENGINE = MergeTree
ORDER BY A
SETTINGS non_replicated_deduplication_window = 100;

INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (1);

-- the next insert won't be deduplicated because insert_deduplication_token is different
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test1' VALUES (1);

-- the next insert will be deduplicated because insert_deduplication_token
-- is the same as one of the previous
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (2);

SELECT * FROM test_table

┌─A─┐
│ 1 │
└───┘
┌─A─┐
│ 1 │
└───┘
```


## insert_keeper_fault_injection_probability \{#insert_keeper_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

insert 작업 중 Keeper 요청이 실패할 대략적인 확률입니다. 유효한 값은 [0.0f, 1.0f] 범위입니다.

## insert_keeper_fault_injection_seed \{#insert_keeper_fault_injection_seed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 무작위 시드, 0이 아닌 경우 설정 값

## insert_keeper_max_retries \{#insert_keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "INSERT 시 Keeper에 대한 재연결을 활성화하고, 신뢰성을 개선합니다"}]}]} />

이 설정은 복제된 MergeTree에 대한 INSERT 작업 중 ClickHouse Keeper(또는 ZooKeeper) 요청에 대해 수행되는 재시도의 최대 횟수를 설정합니다. 네트워크 오류, Keeper 세션 타임아웃, 요청 타임아웃으로 인해 실패한 Keeper 요청만 재시도 대상으로 간주됩니다.

가능한 값:

* 양의 정수.
* 0 — 재시도가 비활성화됩니다.

Cloud 기본값: `20`.

Keeper 요청 재시도는 일정 시간 경과 후에 수행됩니다. 이 타임아웃은 다음 설정으로 제어됩니다: `insert_keeper_retry_initial_backoff_ms`, `insert_keeper_retry_max_backoff_ms`.
첫 번째 재시도는 `insert_keeper_retry_initial_backoff_ms` 타임아웃 후에 수행됩니다. 이후 재시도까지의 타임아웃은 다음과 같이 계산됩니다:

```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

예를 들어 `insert_keeper_retry_initial_backoff_ms=100`, `insert_keeper_retry_max_backoff_ms=10000`, `insert_keeper_max_retries=8`인 경우, 타임아웃은 `100, 200, 400, 800, 1600, 3200, 6400, 10000`이 됩니다.

재시도는 장애 허용 외에도 더 나은 사용자 경험을 제공하기 위한 것입니다. 예를 들어 Keeper가 업그레이드로 인해 재시작되더라도 INSERT 실행 중에 즉시 오류를 반환하지 않도록 합니다.


## insert_keeper_retry_initial_backoff_ms \{#insert_keeper_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

INSERT 쿼리 실행 중 실패한 Keeper 요청을 재시도하기 위한 초기 타임아웃값(밀리초 단위)입니다.

가능한 값:

- 양의 정수.
- 0 — 타임아웃 없음

## insert_keeper_retry_max_backoff_ms \{#insert_keeper_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

INSERT 쿼리 실행 중 실패한 Keeper 요청을 재시도할 때 적용되는 최대 타임아웃(밀리초 단위)입니다.

가능한 값:

- 양의 정수
- 0 — 최대 타임아웃에 제한이 없습니다.

## insert_null_as_default \{#insert_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

널 허용(Nullable)이 아닌 데이터 타입의 컬럼에 [기본값](/sql-reference/statements/create/table#default_values) 대신 [NULL](/sql-reference/syntax#null)을 삽입할지 여부를 설정합니다.  
컬럼 타입이 널 허용이 아니고 이 설정이 비활성화되어 있으면 `NULL`을 삽입할 때 예외가 발생합니다. 컬럼 타입이 널 허용([nullable](/sql-reference/data-types/nullable))인 경우에는, 이 설정과 관계없이 `NULL` 값이 그대로 삽입됩니다.

이 설정은 [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 쿼리에 적용됩니다. `SELECT` 서브쿼리는 `UNION ALL` 절과 결합될 수 있습니다.

가능한 값:

- 0 — 널 허용이 아닌 컬럼에 `NULL`을 삽입하면 예외가 발생합니다.
- 1 — `NULL` 대신 컬럼의 기본값이 삽입됩니다.

## insert_quorum \{#insert_quorum\}

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
이 설정은 SharedMergeTree에는 적용되지 않습니다. 자세한 내용은 [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency)를 참고하십시오.
:::

쿼럼 쓰기를 활성화합니다.

- `insert_quorum < 2`이면 쿼럼 쓰기가 비활성화됩니다.
- `insert_quorum >= 2`이면 쿼럼 쓰기가 활성화됩니다.
- `insert_quorum = 'auto'`이면 과반수 값(`number_of_replicas / 2 + 1`)을 쿼럼 수로 사용합니다.

쿼럼 쓰기

`INSERT`는 ClickHouse가 `insert_quorum_timeout` 기간 동안 레플리카의 `insert_quorum` 개수에 데이터를 올바르게 기록하는 데 성공한 경우에만 성공합니다. 어떤 이유로든 쓰기에 성공한 레플리카 수가 `insert_quorum`에 도달하지 못하면, 쓰기는 실패한 것으로 간주되며 ClickHouse는 이미 데이터가 기록된 모든 레플리카에서 삽입된 블록을 삭제합니다.

`insert_quorum_parallel`이 비활성화되어 있으면, 쿼럼에 포함된 모든 레플리카는 일관성을 유지합니다. 즉, 이전의 모든 `INSERT` 쿼리에서 기록된 데이터를 포함합니다(`INSERT` 시퀀스가 선형화됩니다). `insert_quorum`을 사용해 기록된 데이터를 읽을 때 `insert_quorum_parallel`이 비활성화되어 있으면, [select_sequential_consistency](#select_sequential_consistency)를 사용하여 `SELECT` 쿼리에 대해 순차적 일관성을 설정할 수 있습니다.

ClickHouse는 다음과 같은 경우 예외를 발생시킵니다.

- 쿼리 시점에 사용 가능한 레플리카 수가 `insert_quorum`보다 작은 경우
- `insert_quorum_parallel`이 비활성화된 상태에서, 이전 블록이 아직 레플리카의 `insert_quorum`에 삽입되지 않았는데 데이터 쓰기를 시도한 경우. 이 상황은 사용자가 `insert_quorum`을 사용하는 이전 `INSERT`가 완료되기 전에 동일한 테이블에 대해 다른 `INSERT` 쿼리를 수행하려고 할 때 발생할 수 있습니다.

함께 보기:

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel \{#insert_quorum_parallel\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "기본적으로 병렬 쿼럼 INSERT를 사용합니다. 순차 쿼럼 INSERT보다 훨씬 더 편리합니다."}]}]}/>

:::note
이 설정은 SharedMergeTree에는 적용되지 않습니다. 자세한 내용은 [SharedMergeTree 일관성](/cloud/reference/shared-merge-tree#consistency)을 참조하십시오.
:::

쿼럼 `INSERT` 쿼리의 병렬 실행을 활성화하거나 비활성화합니다. 활성화하면 이전 쿼리가 아직 완료되지 않았더라도 추가 `INSERT` 쿼리를 전송할 수 있습니다. 비활성화하면 동일한 테이블에 대한 추가 쓰기는 거부됩니다.

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

함께 보기:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout \{#insert_quorum_timeout\}

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

쿼럼 쓰기에 대한 타임아웃(밀리초 단위)을 설정합니다. 이 타임아웃이 경과했는데도 아직 쓰기가 수행되지 않은 경우 ClickHouse는 예외를 발생시키며, 클라이언트는 동일한 블록을 동일한 레플리카 또는 다른 레플리카에 쓰기 위해 쿼리를 다시 실행해야 합니다.

다음 항목도 참고하십시오:

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_shard_id \{#insert_shard_id\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`0`이 아니면, 데이터를 동기적으로 삽입할 [Distributed](/engines/table-engines/special/distributed) 테이블의 세그먼트를 지정합니다.

`insert_shard_id` 값이 올바르지 않으면 서버에서 예외를 발생시킵니다.

`requested_cluster`의 세그먼트 개수를 확인하려면 서버 구성이나 다음 쿼리 중 하나를 사용할 수 있습니다:

```sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

가능한 값:

* 0 — 비활성화됨.
* 해당 [Distributed](/engines/table-engines/special/distributed) 테이블에서 `1`부터 `shards_num`까지의 임의의 숫자.

**예시**

쿼리:

```sql
CREATE TABLE x AS system.numbers ENGINE = MergeTree ORDER BY number;
CREATE TABLE x_dist AS x ENGINE = Distributed('test_cluster_two_shards_localhost', currentDatabase(), x);
INSERT INTO x_dist SELECT * FROM numbers(5) SETTINGS insert_shard_id = 1;
SELECT * FROM x_dist ORDER BY number ASC;
```

결과:

```text
┌─number─┐
│      0 │
│      0 │
│      1 │
│      1 │
│      2 │
│      2 │
│      3 │
│      3 │
│      4 │
│      4 │
└────────┘
```


## interactive_delay \{#interactive_delay\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

요청 실행 취소 여부를 확인하고 진행 상황을 전송하기 위한 검사 주기(마이크로초)입니다.

## intersect_default_mode \{#intersect_default_mode\}

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

INTERSECT 쿼리에서 기본 모드를 설정합니다. 가능한 값은 빈 문자열, 'ALL', 'DISTINCT'입니다. 빈 문자열인 경우, 모드가 지정되지 않은 쿼리는 예외가 발생합니다.

## jemalloc_collect_profile_samples_in_trace_log \{#jemalloc_collect_profile_samples_in_trace_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

트레이스 로그에서 jemalloc 메모리 할당 및 해제 샘플을 수집합니다.

## jemalloc_enable_profiler \{#jemalloc_enable_profiler\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

쿼리에 대해 jemalloc 프로파일러를 활성화합니다. Jemalloc은 메모리 할당을 샘플링하며, 샘플링된 메모리 할당에 대한 모든 해제를 추적합니다.
프로파일은 SYSTEM JEMALLOC FLUSH PROFILE을 사용하여 플러시할 수 있으며, 메모리 할당 분석에 사용할 수 있습니다.
샘플은 설정 jemalloc_collect_global_profile_samples_in_trace_log 또는 쿼리 설정 jemalloc_collect_profile_samples_in_trace_log을 사용하여 system.trace_log에 저장할 수도 있습니다.
자세한 내용은 [Allocation Profiling](/operations/allocation-profiling)을 참조하십시오.

## join_algorithm \{#join_algorithm\}

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "'default'는 명시적으로 지정된 조인 알고리즘을 사용하도록 변경되면서 더 이상 사용되지 않으며, 이제 parallel_hash가 hash보다 우선적으로 사용됩니다"}]}]}/>

어떤 [JOIN](../../sql-reference/statements/select/join.md) 알고리즘을 사용할지 지정합니다.

여러 알고리즘을 지정할 수 있으며, 쿼리의 종류/엄격성과 테이블 엔진에 따라 사용 가능한 알고리즘이 선택됩니다.

가능한 값:

- grace_hash

[Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join)을 사용합니다. Grace hash는 메모리 사용량을 제한하면서 복잡한 조인을 고성능으로 수행할 수 있는 알고리즘 옵션을 제공합니다.

Grace 조인의 첫 번째 단계에서는 오른쪽 테이블을 읽고 키 컬럼의 해시 값에 따라 이를 N개의 버킷으로 분할합니다(초기 N 값은 `grace_hash_join_initial_buckets`입니다). 각 버킷이 서로 독립적으로 처리될 수 있도록 분할합니다. 첫 번째 버킷의 행은 메모리 내 해시 테이블에 추가하고, 나머지는 디스크에 저장합니다. 해시 테이블이 메모리 한도(예: [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)로 설정된 값)를 초과하면 버킷 수를 늘리고 각 행에 할당된 버킷을 다시 계산합니다. 현재 버킷에 속하지 않는 행은 모두 디스크로 플러시한 뒤 다시 할당합니다.

`INNER/LEFT/RIGHT/FULL ALL/ANY JOIN`을 지원합니다.

- hash

[Hash join 알고리즘](https://en.wikipedia.org/wiki/Hash_join)을 사용합니다. 종류와 엄격성의 모든 조합 및 `JOIN ON` 절에서 `OR`로 결합된 여러 조인 키를 지원하는 가장 범용적인 구현입니다.

`hash` 알고리즘을 사용할 때는 `JOIN`의 오른쪽 부분이 RAM으로 적재됩니다.

- parallel_hash

데이터를 여러 버킷으로 분할하고, 하나의 해시 테이블 대신 여러 개의 해시 테이블을 동시에 생성하여 이 과정을 가속화하는 `hash` 조인의 변형입니다.

`parallel_hash` 알고리즘을 사용할 때는 `JOIN`의 오른쪽 부분이 RAM으로 적재됩니다.

- partial_merge

오른쪽 테이블만 완전히 정렬하는 [sort-merge 알고리즘](https://en.wikipedia.org/wiki/Sort-merge_join)의 변형입니다.

`RIGHT JOIN`과 `FULL JOIN`은 `ALL` 엄격성에서만 지원됩니다(`SEMI`, `ANTI`, `ANY`, `ASOF`는 지원되지 않습니다).

`partial_merge` 알고리즘을 사용할 때 ClickHouse는 데이터를 정렬하고 디스크로 덤프합니다. ClickHouse의 `partial_merge` 알고리즘은 고전적인 구현과 약간 다릅니다. 먼저 ClickHouse는 오른쪽 테이블을 조인 키로 블록 단위로 정렬하고, 정렬된 블록에 대해 최소-최대 인덱스를 생성합니다. 그런 다음 왼쪽 테이블의 일부를 `join key`로 정렬하고 이를 오른쪽 테이블과 조인합니다. 불필요한 오른쪽 테이블 블록을 건너뛰기 위해 최소-최대 인덱스도 사용됩니다.

- direct

`direct`(nested loop라고도 함) 알고리즘은 왼쪽 테이블의 행을 키로 사용하여 오른쪽 테이블에서 조회를 수행합니다.
 [Dictionary](/engines/table-engines/special/dictionary), [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md), [MergeTree](/engines/table-engines/mergetree-family/mergetree) 테이블과 같은 특수 스토리지를 지원합니다.

MergeTree 테이블의 경우 이 알고리즘은 조인 키 필터를 스토리지 레이어로 직접 푸시합니다. 키가 테이블의 기본 키 인덱스를 사용해 조회할 수 있을 때 더 효율적일 수 있으며, 그렇지 않은 경우 왼쪽 테이블 블록마다 오른쪽 테이블을 전체 스캔합니다.

`INNER`와 `LEFT` 조인, 그리고 다른 조건 없이 단일 컬럼 동등성 조인 키만 지원합니다.

- auto

`auto`로 설정하면 우선 `hash` 조인을 시도하며, 메모리 한도를 초과하면 실행 중에 다른 알고리즘으로 전환합니다.

- full_sorting_merge

조인 전에 조인되는 테이블 둘 다를 완전히 정렬하는 [sort-merge 알고리즘](https://en.wikipedia.org/wiki/Sort-merge_join)입니다.

- prefer_partial_merge

가능한 경우 항상 `partial_merge` 조인을 사용하려 하고, 그렇지 않으면 `hash`를 사용합니다. *더 이상 사용되지 않으며*, `partial_merge,hash`와 동일합니다.

- default (deprecated)

과거 버전과의 호환성을 위한 값이므로 더 이상 사용하지 마십시오.
 `direct,hash`와 동일하며, 즉 direct 조인을 우선 사용하고 그다음 hash 조인을 시도합니다.

## join_any_take_last_row \{#join_any_take_last_row\}

<SettingsInfoBlock type="Bool" default_value="0" />

`ANY` 엄격성(strictness)을 사용하는 `JOIN` 연산의 동작을 변경합니다.

:::note
이 설정은 [Join](../../engines/table-engines/special/join.md) 엔진 테이블을 사용하는 `JOIN` 연산에만 적용됩니다.
:::

가능한 값:

- 0 — 오른쪽 테이블에 일치하는 행이 둘 이상 있는 경우, 처음 발견된 행만 조인됩니다.
- 1 — 오른쪽 테이블에 일치하는 행이 둘 이상 있는 경우, 마지막으로 발견된 행만 조인됩니다.

함께 보기:

- [JOIN 절](/sql-reference/statements/select/join)
- [Join 테이블 엔진](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness \{#join_default_strictness\}

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

[JOIN 절](/sql-reference/statements/select/join)에 대한 기본 엄격도를 설정합니다.

가능한 값:

- `ALL` — 오른쪽 테이블에 여러 개의 일치하는 행이 있는 경우, ClickHouse는 일치하는 행들로부터 [데카르트 곱(Cartesian product)](https://en.wikipedia.org/wiki/Cartesian_product)을 생성합니다. 이는 표준 SQL에서의 일반적인 `JOIN` 동작입니다.
- `ANY` — 오른쪽 테이블에 여러 개의 일치하는 행이 있는 경우, 처음 발견된 행 하나만 조인합니다. 오른쪽 테이블에 일치하는 행이 하나만 있는 경우 `ANY`와 `ALL`의 결과는 동일합니다.
- `ASOF` — 일치 여부가 불확실한 시퀀스를 조인할 때 사용합니다.
- `Empty string` — 쿼리에서 `ALL` 또는 `ANY`가 지정되지 않은 경우 ClickHouse가 예외를 발생시킵니다.

## join_on_disk_max_files_to_merge \{#join_on_disk_max_files_to_merge\}

<SettingsInfoBlock type="UInt64" default_value="64" />

디스크에서 실행되는 MergeJoin 연산에서 병렬 정렬에 허용되는 파일 개수의 최대값을 설정합니다.

이 설정 값을 크게 설정할수록 RAM 사용량은 늘어나지만 디스크 I/O는 줄어듭니다.

가능한 값:

- 2부터 시작하는 모든 양의 정수입니다.

## join_output_by_rowlist_perkey_rows_threshold \{#join_output_by_rowlist_perkey_rows_threshold\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "해시 조인에서 row list 방식으로 결과를 출력할지 여부를 결정할 때 사용하는, 오른쪽 테이블의 키별 평균 행 수에 대한 하한값입니다."}]}]}/>

해시 조인에서 row list 방식으로 결과를 출력할지 여부를 결정할 때 사용하는, 오른쪽 테이블의 키별 평균 행 수에 대한 하한값입니다.

## join_overflow_mode \{#join_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

다음 조인 제한값에 도달하면 ClickHouse가 수행하는 동작을 정의합니다:

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

가능한 값:

- `THROW` — ClickHouse가 예외를 발생시키고 연산을 중단합니다.
- `BREAK` — ClickHouse가 연산을 중단하지만 예외는 발생시키지 않습니다.

기본값: `THROW`.

**관련 항목**

- [JOIN 절](/sql-reference/statements/select/join)
- [Join 테이블 엔진](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes \{#join_runtime_bloom_filter_bytes\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "새 설정"}]}]}/>

JOIN 런타임 필터로 사용되는 블룸 필터의 크기(바이트 단위)를 나타냅니다. 자세한 내용은 `enable_join_runtime_filters` 설정을 참조하십시오.

## join_runtime_bloom_filter_hash_functions \{#join_runtime_bloom_filter_hash_functions\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "New setting"}]}]}/>

JOIN 런타임 필터로 사용되는 블룸 필터에서 사용하는 해시 함수의 개수입니다( enable_join_runtime_filters 설정을 참조하십시오).

## join_runtime_bloom_filter_max_ratio_of_set_bits \{#join_runtime_bloom_filter_max_ratio_of_set_bits\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "New setting"}]}]}/>

런타임 블룸 필터(runtime bloom filter)에서 설정된 비트(set bits)의 개수가 이 비율을 초과하면 오버헤드를 줄이기 위해 필터가 완전히 비활성화됩니다.

## join_runtime_filter_blocks_to_skip_before_reenabling \{#join_runtime_filter_blocks_to_skip_before_reenabling\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "30"},{"label": "New setting"}]}]}/>

낮은 필터링 비율 때문에 이전에 비활성화된 런타임 필터를 동적으로 다시 활성화하기 전에 건너뛰는 블록 수를 지정합니다.

## join_runtime_filter_exact_values_limit \{#join_runtime_filter_exact_values_limit\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "New setting"}]}]}/>

런타임 필터의 요소를 Set에 원래 값 그대로 저장할 수 있는 최대 개수입니다. 이 임계값을 초과하면 Set 대신 블룸 필터가 사용됩니다.

## join_runtime_filter_pass_ratio_threshold_for_disabling \{#join_runtime_filter_pass_ratio_threshold_for_disabling\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "새로운 설정"}]}]}/>

통과된 행 수와 검사된 행 수의 비율이 이 임계값을 초과하면 런타임 필터(runtime filter)가 성능이 저조한 것으로 간주되어, 오버헤드를 줄이기 위해 다음 `join_runtime_filter_blocks_to_skip_before_reenabling` 블록 동안 비활성화됩니다.

## join_to_sort_maximum_table_rows \{#join_to_sort_maximum_table_rows\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "left 또는 inner join에서 오른쪽 테이블을 키 기준으로 다시 정렬할지 여부를 결정하기 위한 오른쪽 테이블의 최대 행 수"}]}]}/>

left 또는 inner join에서 오른쪽 테이블을 키 기준으로 다시 정렬할지 여부를 결정하기 위해 사용하는 오른쪽 테이블의 최대 행 수입니다.

## join_to_sort_minimum_perkey_rows \{#join_to_sort_minimum_perkey_rows\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "왼쪽 조인 또는 내부 조인에서 오른쪽 테이블을 키 기준으로 다시 정렬할지 여부를 결정하기 위해 사용하는, 오른쪽 테이블의 키당 평균 행 수의 최소값입니다. 이 설정은 희소 키를 가진 테이블에 이 최적화가 적용되지 않도록 합니다."}]}]}/>

왼쪽 조인 또는 내부 조인에서 오른쪽 테이블을 키 기준으로 다시 정렬할지 여부를 결정하기 위해 사용하는, 오른쪽 테이블의 키당 평균 행 수의 최소값입니다. 이 설정은 희소 키를 가진 테이블에 이 최적화가 적용되지 않도록 합니다.

## join_use_nulls \{#join_use_nulls\}

<SettingsInfoBlock type="Bool" default_value="0" />

[JOIN](../../sql-reference/statements/select/join.md) 동작 유형을 설정합니다. 테이블을 조인할 때 빈 셀이 생길 수 있습니다. ClickHouse는 이 설정에 따라 이러한 셀을 채우는 방식을 다르게 적용합니다.

가능한 값:

- 0 — 빈 셀을 해당 필드 형식의 기본값으로 채웁니다.
- 1 — `JOIN`이 표준 SQL과 동일한 방식으로 동작합니다. 해당 필드의 형식이 [널 허용(Nullable)](/sql-reference/data-types/nullable)으로 변환되고, 빈 셀은 [NULL](/sql-reference/syntax)로 채워집니다.

## joined_block_split_single_row \{#joined_block_split_single_row\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

왼쪽 테이블의 단일 행에 해당하는 행 단위로 해시 조인 결과를 청크로 분할하도록 허용합니다.
이 설정은 오른쪽 테이블에서 많은 매칭이 발생하는 행이 있는 경우 메모리 사용량을 줄이는 데 도움이 되지만, CPU 사용량은 증가할 수 있습니다.
이 설정이 효과가 있으려면 `max_joined_block_size_rows != 0`이어야 합니다.
`max_joined_block_size_bytes`는 이 설정과 함께 사용하면, 일부 크기가 큰 행에서 오른쪽 테이블에 많은 매칭이 발생하는 편향된 데이터의 경우 과도한 메모리 사용을 방지하는 데 도움이 됩니다.

## joined_subquery_requires_alias \{#joined_subquery_requires_alias\}

<SettingsInfoBlock type="Bool" default_value="1" />

조인된 서브쿼리와 테이블 함수가 이름을 올바르게 한정할 수 있도록 별칭을 반드시 지정하도록 강제합니다.

## kafka_disable_num_consumers_limit \{#kafka_disable_num_consumers_limit\}

<SettingsInfoBlock type="Bool" default_value="0" />

사용 가능한 CPU 코어 수에 의존하는 `kafka_num_consumers` 제한을 비활성화합니다.

## kafka_max_wait_ms \{#kafka_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

재시도 전에 [Kafka](/engines/table-engines/integrations/kafka)에서 메시지를 읽을 때 대기하는 시간(밀리초)입니다.

가능한 값은 다음과 같습니다:

- 양의 정수.
- 0 — 무한 대기 시간.

추가 참고:

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode \{#keeper_map_strict_mode\}

<SettingsInfoBlock type="Bool" default_value="0" />

KeeperMap에서 연산을 수행할 때 추가 검사를 강제합니다. 예를 들어 이미 존재하는 키를 삽입하려 하면 예외를 발생시킵니다.

## keeper_max_retries \{#keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "일반 Keeper 작업의 최대 재시도 횟수"}]}]}/>

일반 Keeper 작업의 최대 재시도 횟수

## keeper_retry_initial_backoff_ms \{#keeper_retry_initial_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "일반적인 Keeper 작업에 대한 초기 백오프 타임아웃"}]}]}/>

일반적인 Keeper 작업에 대한 초기 백오프 타임아웃

## keeper_retry_max_backoff_ms \{#keeper_retry_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "일반적인 Keeper 작업에 대한 최대 백오프 시간 제한"}]}]}/>

일반적인 Keeper 작업에 대한 최대 백오프 시간 제한

## least_greatest_legacy_null_behavior \{#least_greatest_legacy_null_behavior\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

이 설정을 활성화하면 `least` 및 `greatest` 함수는 인수 중 하나가 NULL인 경우 NULL을 반환합니다.

## legacy_column_name_of_tuple_literal \{#legacy_column_name_of_tuple_literal\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "호환성만을 위한 설정입니다. 21.7보다 낮은 버전에서 더 높은 버전으로 클러스터를 롤링 업데이트할 때에만 'true'로 설정하는 것이 합리적입니다"}]}]}/>

큰 tuple 리터럴의 컬럼 이름에서 해시 대신 각 요소의 이름을 모두 나열합니다. 이 설정은 호환성 유지를 위한 용도로만 존재합니다. 21.7보다 낮은 버전에서 더 높은 버전으로 클러스터를 롤링 업데이트할 때에만 'true'로 설정하는 것이 합리적입니다.

## lightweight_delete_mode \{#lightweight_delete_mode\}

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "A new setting"}]}]}/>

경량한 삭제의 일부로 실행되는 내부 업데이트 쿼리의 동작 모드입니다.

가능한 값은 다음과 같습니다.

- `alter_update` - heavyweight mutation을 생성하는 `ALTER UPDATE` 쿼리를 실행합니다.
- `lightweight_update` - 가능하면 경량 업데이트를 실행하고, 그렇지 않으면 `ALTER UPDATE`를 실행합니다.
- `lightweight_update_force` - 가능하면 경량 업데이트를 실행하고, 그렇지 않으면 예외를 발생시킵니다.

## lightweight_deletes_sync \{#lightweight_deletes_sync\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "The same as 'mutation_sync', but controls only execution of lightweight deletes"}]}]}/>

[`mutations_sync`](#mutations_sync)와 동일하지만, 경량한 삭제(lightweight deletes)의 실행만 제어합니다.

가능한 값:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | 뮤테이션이 비동기적으로 실행됩니다.                                                                                                                    |
| `1`   | 쿼리가 현재 서버에서 경량한 삭제가 완료될 때까지 대기합니다.                                                                                           |
| `2`   | 쿼리가 모든 레플리카(존재하는 경우)에서 경량한 삭제가 완료될 때까지 대기합니다.                                                                        |
| `3`   | 쿼리가 활성 레플리카에서만 경량한 삭제가 완료될 때까지 대기합니다. `SharedMergeTree`에서만 지원됩니다. `ReplicatedMergeTree`에서는 `mutations_sync = 2`와 동일하게 동작합니다. |

**관련 항목**

- [ALTER 쿼리의 동기성](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [뮤테이션](../../sql-reference/statements/alter/index.md/#mutations)

## limit \{#limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쿼리 결과에서 가져올 최대 행 수를 설정합니다. [LIMIT](/sql-reference/statements/select/limit) 절로 설정된 값을 조정하여, 쿼리에서 지정한 LIMIT 값이 이 설정으로 지정한 LIMIT 값을 초과하지 못하도록 합니다.

가능한 값:

- 0 — 행 수에 제한이 없습니다.
- 양의 정수.

## load_balancing \{#load_balancing\}

<SettingsInfoBlock type="LoadBalancing" default_value="random" />

분산 쿼리 처리 시 레플리카를 선택할 때 사용하는 알고리즘을 지정합니다.

ClickHouse는 다음과 같은 레플리카 선택 알고리즘을 지원합니다.

- [Random](#load_balancing-random) (기본값)
- [Nearest hostname](#load_balancing-nearest_hostname)
- [Hostname levenshtein distance](#load_balancing-hostname_levenshtein_distance)
- [In order](#load_balancing-in_order)
- [First or random](#load_balancing-first_or_random)
- [Round robin](#load_balancing-round_robin)

다음 항목도 참고하십시오.

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

### 랜덤(기본값) \{#load_balancing-random\}

```sql
load_balancing = random
```

오류 개수는 레플리카별로 집계됩니다. 쿼리는 오류가 가장 적은 레플리카로 전송되며, 그러한 레플리카가 여러 개이면 그중 임의의 레플리카로 전송됩니다.
단점: 서버와의 물리적 근접성은 고려되지 않습니다. 레플리카마다 데이터가 다르면, 서로 다른 데이터를 받게 됩니다.


### 가장 가까운 호스트명 \{#load_balancing-nearest_hostname\}

```sql
load_balancing = nearest_hostname
```

오류 개수는 각 레플리카마다 집계합니다. 5분마다 오류 개수를 2로 정수 나눗셈하여 줄입니다. 따라서 최근 시점을 기준으로 지수 평활(exponential smoothing) 방식으로 오류 개수가 계산됩니다. 최소 오류 개수를 가진 레플리카가 하나뿐인 경우(즉, 다른 레플리카에서 최근에 오류가 발생한 경우), 해당 레플리카로 쿼리가 전송됩니다. 동일한 최소 오류 개수를 가진 레플리카가 여러 개 있는 경우, 설정 파일에 지정된 서버 호스트 이름과 가장 유사한 호스트 이름을 가진 레플리카로 쿼리가 전송됩니다(두 호스트 이름의 최소 길이까지, 같은 위치에서 서로 다른 문자 개수를 기준으로 함).

예를 들어, example01-01-1과 example01-01-2는 한 위치에서만 다르지만, example01-01-1과 example01-02-2는 두 위치에서 다릅니다.
이 방법은 다소 단순해 보일 수 있지만, 네트워크 토폴로지에 대한 외부 데이터가 필요하지 않고, IP 주소를 비교하지도 않으므로 IPv6 주소의 경우 복잡해지는 문제를 피할 수 있습니다.

따라서 동등한 레플리카가 여러 개 있는 경우, 이름이 가장 가까운 레플리카가 우선 선택됩니다.
또한 장애가 없는 상태에서 동일한 서버로 쿼리를 전송하면, 분산 쿼리도 동일한 서버들로 전송된다고 가정할 수 있습니다. 따라서 레플리카에 서로 다른 데이터가 배치되어 있더라도, 쿼리는 대부분 동일한 결과를 반환합니다.


### 호스트명 Levenshtein 거리 \{#load_balancing-hostname_levenshtein_distance\}

```sql
load_balancing = hostname_levenshtein_distance
```

`nearest_hostname`와 같지만, 호스트 이름을 [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance) 방식으로 비교합니다. 예를 들어:

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### 순서대로 \{#load_balancing-in_order\}

```sql
load_balancing = in_order
```

동일한 오류 수를 가진 레플리카는 구성에 지정된 순서대로 접근됩니다.
이 방법은 어떤 레플리카를 우선적으로 사용하는 것이 더 좋은지 정확히 알고 있을 때 적절합니다.


### First 또는 Random \{#load_balancing-first_or_random\}

```sql
load_balancing = first_or_random
```

이 알고리즘은 집합에서 첫 번째 레플리카를 선택하거나, 첫 번째 레플리카를 사용할 수 없는 경우 임의의 레플리카를 선택합니다. 교차 복제 토폴로지 구성에서는 효과적이지만, 다른 구성에서는 효과적이지 않습니다.

`first_or_random` 알고리즘은 `in_order` 알고리즘의 문제를 해결합니다. `in_order`의 경우, 하나의 레플리카가 다운되면 그다음 레플리카가 두 배의 부하를 처리하는 반면, 나머지 레플리카는 평소와 같은 수준의 트래픽만 처리하게 됩니다. `first_or_random` 알고리즘을 사용하면, 사용 가능한 레플리카들 사이에 부하가 균등하게 분산됩니다.

설정 `load_balancing_first_offset`를 사용해 어떤 레플리카를 첫 번째 레플리카로 사용할지 명시적으로 정의할 수 있습니다. 이를 통해 레플리카 간 쿼리 워크로드를 보다 세밀하게 리밸런싱할 수 있습니다.


### 라운드 로빈(Round Robin) \{#load_balancing-round_robin\}

```sql
load_balancing = round_robin
```

이 알고리즘은 동일한 오류 수를 가진 레플리카 간에 라운드 로빈(round-robin) 정책을 사용하며, 이때 `round_robin` 정책이 설정된 쿼리만 고려됩니다.


## load_balancing_first_offset \{#load_balancing_first_offset\}

<SettingsInfoBlock type="UInt64" default_value="0" />

FIRST_OR_RANDOM 로드 밸런싱 전략을 사용할 때, 어느 레플리카로 우선적으로 쿼리를 전송할지 지정합니다.

## load_marks_asynchronously \{#load_marks_asynchronously\}

<SettingsInfoBlock type="Bool" default_value="0" />

MergeTree 마크를 비동기적으로 불러옵니다

## local_filesystem_read_method \{#local_filesystem_read_method\}

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

로컬 파일 시스템에서 데이터를 읽는 방법입니다. 사용할 수 있는 값은 다음과 같습니다: read, pread, mmap, io_uring, pread_threadpool.

「io_uring」 방식은 실험적 기능이며, Log, TinyLog, StripeLog, File, Set, Join 및 그 밖의 append 가능한 파일을 사용하는 테이블에서 동시 읽기 및 쓰기가 발생하는 경우 동작하지 않습니다.
인터넷에서 「io_uring」에 대한 여러 글을 보더라도 이를 맹신하지 않아야 합니다. 많은 수의 작은 IO 요청이 발생하는 특수한 경우가 아니라면 파일을 읽는 더 나은 방법이 아니며, ClickHouse에서는 이러한 경우에 해당하지 않습니다. 따라서 「io_uring」을 활성화할 이유가 없습니다.

## local_filesystem_read_prefetch \{#local_filesystem_read_prefetch\}

<SettingsInfoBlock type="Bool" default_value="0" />

로컬 파일 시스템에서 데이터를 읽을 때 프리페치를 사용할지 여부를 지정합니다.

## lock_acquire_timeout \{#lock_acquire_timeout\}

<SettingsInfoBlock type="Seconds" default_value="120" />

잠금 요청이 실패하기 전까지 대기하는 시간을 초 단위로 정의합니다.

잠금 타임아웃은 테이블에 대한 읽기/쓰기 작업을 수행하는 동안 교착 상태로부터 보호하기 위해 사용됩니다. 타임아웃이 만료되고 잠금 요청이 실패하면 ClickHouse 서버는 오류 코드 `DEADLOCK_AVOIDED`와 함께 「Locking attempt timed out! Possible deadlock avoided. Client should retry.」 예외를 발생시킵니다.

가능한 값:

- 양의 정수(초 단위).
- 0 — 잠금 타임아웃 없음.

## log_comment \{#log_comment\}

[system.query&#95;log](../system-tables/query_log.md) 테이블의 `log_comment` 필드 값과 서버 로그에 기록될 코멘트 텍스트를 지정합니다.

서버 로그의 가독성을 높이는 데 사용할 수 있습니다. 또한 [clickhouse-test](../../development/tests.md)를 실행한 이후 `system.query_log`에서 테스트와 관련된 쿼리를 선택하는 데 도움이 됩니다.

가능한 값:

* [max&#95;query&#95;size](#max_query_size)보다 길지 않은 임의의 문자열. max&#95;query&#95;size를 초과하면 서버가 예외를 발생시킵니다.

**예시**

쿼리:

```sql
SET log_comment = 'log_comment test', log_queries = 1;
SELECT 1;
SYSTEM FLUSH LOGS;
SELECT type, query FROM system.query_log WHERE log_comment = 'log_comment test' AND event_date >= yesterday() ORDER BY event_time DESC LIMIT 2;
```

결과:

```text
┌─type────────┬─query─────┐
│ QueryStart  │ SELECT 1; │
│ QueryFinish │ SELECT 1; │
└─────────────┴───────────┘
```


## log_formatted_queries \{#log_formatted_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />

[system.query_log](../../operations/system-tables/query_log.md) 시스템 테이블에 형식화된 쿼리를 기록합니다( [system.query_log](../../operations/system-tables/query_log.md) 의 `formatted_query` 컬럼을 채웁니다).

가능한 값:

- 0 — 형식화된 쿼리가 시스템 테이블에 기록되지 않습니다.
- 1 — 형식화된 쿼리가 시스템 테이블에 기록됩니다.

## log_processors_profiles \{#log_processors_profiles\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Enable by default"}]}]}/>

프로세서가 실행되거나 데이터 대기 중에 소요한 시간을 `system.processors_profile_log` 테이블에 기록합니다.

참고:

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events \{#log_profile_events\}

<SettingsInfoBlock type="Bool" default_value="1" />

쿼리 성능 통계를 `query_log`, `query_thread_log`, `query_views_log` 로그에 기록합니다.

## log_queries \{#log_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

쿼리 로깅을 활성화합니다.

이 설정이 활성화되면 ClickHouse에 전송된 쿼리는 [query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log) 서버 구성 매개변수에 정의된 규칙에 따라 로그에 기록됩니다.

예시:

```text
log_queries=1
```


## log_queries_cut_to_length \{#log_queries_cut_to_length\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

쿼리 길이가 설정된 임계값(바이트 단위)보다 길면, 쿼리 로그에 기록할 때 해당 쿼리를 잘라서 기록합니다. 일반 텍스트 로그에 출력되는 쿼리의 길이도 이 값으로 제한합니다.

## log_queries_min_query_duration_ms \{#log_queries_min_query_duration_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

0이 아닌 값으로 설정해 활성화하면, 이 설정 값보다 더 빠르게 실행된 쿼리는 로그에 기록되지 않습니다(이를 [MySQL Slow Query Log](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html)의 `long_query_time`과 비슷한 개념으로 볼 수 있습니다). 즉, 이러한 쿼리는 다음 테이블에서 조회할 수 없습니다:

- `system.query_log`
- `system.query_thread_log`

다음 유형의 쿼리만 로그에 기록됩니다:

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- 타입: 밀리초(milliseconds)
- 기본값: 0 (모든 쿼리)

## log_queries_min_type \{#log_queries_min_type\}

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

`query_log`에 기록할 최소 타입을 지정합니다.

가능한 값은 다음과 같습니다.

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

`query_log`에 어떤 항목을 기록할지 제한하는 데 사용할 수 있습니다. 예를 들어 오류에만 관심이 있는 경우 `EXCEPTION_WHILE_PROCESSING`을 사용할 수 있습니다.

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability \{#log_queries_probability\}

<SettingsInfoBlock type="Float" default_value="1" />

지정한 확률에 따라 무작위로 선택된 쿼리 샘플만 [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md), [query_views_log](../../operations/system-tables/query_views_log.md) 시스템 테이블에 기록되도록 합니다. 초당 쿼리 수가 매우 많을 때 부하를 줄이는 데 도움이 됩니다.

가능한 값:

- 0 — 시스템 테이블에 쿼리가 기록되지 않습니다.
- [0..1] 범위의 양의 부동 소수점 수. 예를 들어, 설정 값이 `0.5`이면 쿼리의 약 절반이 시스템 테이블에 기록됩니다.
- 1 — 모든 쿼리가 시스템 테이블에 기록됩니다.

## log_query_settings \{#log_query_settings\}

<SettingsInfoBlock type="Bool" default_value="1" />

query_log 및 OpenTelemetry span 로그에 쿼리 설정을 기록합니다.

## log_query_threads \{#log_query_threads\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리 스레드 로깅을 설정합니다.

쿼리 스레드는 [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md) 테이블에 기록됩니다. 이 설정은 [log&#95;queries](#log_queries)가 true일 때에만 적용됩니다. 이 설정으로 ClickHouse에서 실행되는 쿼리 스레드는 [query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) 서버 구성 파라미터의 규칙에 따라 로깅됩니다.

가능한 값:

* 0 — 비활성화.
* 1 — 활성화.

**예제**

```text
log_query_threads=1
```


## log_query_views \{#log_query_views\}

<SettingsInfoBlock type="Bool" default_value="1" />

쿼리 view 로깅을 설정합니다.

이 설정을 활성화한 상태에서 ClickHouse가 실행하는 쿼리에 연관된 view(구체화된 뷰(Materialized View) 또는 라이브 view)가 있는 경우, 이들은 [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log) 서버 구성 매개변수에 기록됩니다.

예시:

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format \{#low_cardinality_allow_in_native_format\}

<SettingsInfoBlock type="Bool" default_value="1" />

[Native](/interfaces/formats/Native) 포맷에서 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 데이터 타입 사용을 허용하거나 제한합니다.

`LowCardinality` 사용이 제한된 경우, ClickHouse 서버는 `SELECT` 쿼리에 대해 `LowCardinality` 컬럼을 일반 컬럼으로 변환하고, `INSERT` 쿼리에 대해 일반 컬럼을 `LowCardinality` 컬럼으로 변환합니다.

이 설정은 주로 `LowCardinality` 데이터 타입을 지원하지 않는 타사 클라이언트에 필요합니다.

가능한 값:

- 1 — `LowCardinality` 사용이 제한되지 않습니다.
- 0 — `LowCardinality` 사용이 제한됩니다.

## low_cardinality_max_dictionary_size \{#low_cardinality_max_dictionary_size\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

저장소 파일 시스템에 기록될 수 있는 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 데이터 타입의 공유 전역 딕셔너리 최대 크기(행 단위)를 설정합니다. 이 설정은 딕셔너리가 무제한으로 증가할 경우 RAM 관련 문제가 발생하는 것을 방지합니다. 딕셔너리 최대 크기 제한 때문에 인코딩할 수 없는 데이터는 모두 ClickHouse가 일반적인 방식으로 기록합니다.

가능한 값:

- 양의 정수.

## low_cardinality_use_single_dictionary_for_part \{#low_cardinality_use_single_dictionary_for_part\}

<SettingsInfoBlock type="Bool" default_value="0" />

데이터 파트에 단일 딕셔너리를 사용할지 여부를 켜거나 끕니다.

기본적으로 ClickHouse 서버는 딕셔너리 크기를 모니터링하며, 딕셔너리가 오버플로되면 다음 딕셔너리를 새로 쓰기 시작합니다. 여러 개의 딕셔너리 생성을 허용하지 않으려면 `low_cardinality_use_single_dictionary_for_part = 1` 로 설정합니다.

가능한 값:

- 1 — 데이터 파트에 대해 여러 개의 딕셔너리를 생성하는 것이 금지됩니다.
- 0 — 데이터 파트에 대해 여러 개의 딕셔너리를 생성하는 것이 허용됩니다.

## low_priority_query_wait_time_ms \{#low_priority_query_wait_time_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "New setting."}]}]}/>

쿼리 우선순위 지정 메커니즘(설정 `priority` 참조)을 사용하는 경우 낮은 우선순위의 쿼리는 더 높은 우선순위의 쿼리가 완료될 때까지 대기합니다. 이 설정은 해당 대기 시간을 지정합니다.

## make_distributed_plan \{#make_distributed_plan\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "새로운 실험적 설정입니다."}]}]}/>

분산 쿼리 실행 계획을 생성합니다.

## materialize_skip_indexes_on_insert \{#materialize_skip_indexes_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "INSERT 시 skip 인덱스 머티리얼라이즈를 비활성화할 수 있는 새 설정 추가"}]}]}/>

INSERT 시 skip 인덱스를 생성하고 저장합니다. 비활성화하면 skip 인덱스는 [머지 시](merge-tree-settings.md/#materialize_skip_indexes_on_merge) 또는 명시적인 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)에 의해서만 생성 및 저장됩니다.

[exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert)도 참조하십시오.

## materialize_statistics_on_insert \{#materialize_statistics_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Added new setting to allow to disable materialization of statistics on insert"}]}]}/>

활성화된 경우 INSERT 시 통계가 생성되어 함께 삽입됩니다. 비활성화하면 통계는 머지(merge) 작업 동안 또는 명시적인 MATERIALIZE STATISTICS 실행 시 생성 및 저장됩니다.

## materialize_ttl_after_modify \{#materialize_ttl_after_modify\}

<SettingsInfoBlock type="Bool" default_value="1" />

ALTER MODIFY TTL 쿼리 이후 기존 데이터에 대해 TTL을 적용합니다

## materialized_views_ignore_errors \{#materialized_views_ignore_errors\}

<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZED VIEW에서 발생하는 오류를 무시하고, MATERIALIZED VIEW와 상관없이 원본 블록을 테이블에 전달하도록 합니다.

## materialized_views_squash_parallel_inserts \{#materialized_views_squash_parallel_inserts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "필요한 경우 기존 동작을 유지하기 위한 설정을 추가했습니다."}]}]}/>

하나의 INSERT 쿼리에서 구체화된 뷰(materialized view) 대상 테이블에 대해 수행되는 병렬 INSERT를 하나로 합쳐, 생성되는 파트 수를 줄입니다.  
false로 설정되어 있고 `parallel_view_processing`이 활성화되어 있는 경우, INSERT 쿼리는 대상 테이블에서 각 `max_insert_thread`마다 하나의 파트를 생성합니다.

## max_analyze_depth \{#max_analyze_depth\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

인터프리터가 수행할 수 있는 최대 분석 횟수입니다.

## max_ast_depth \{#max_ast_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

쿼리 구문 트리의 최대 중첩 깊이입니다. 이를 초과하면 예외가 발생합니다.

:::note
현재 시점에서는 파싱 중에는 검사되지 않고, 쿼리 파싱이 끝난 이후에만 검사됩니다.
이는 파싱 과정에서 너무 깊은 구문 트리가 생성될 수 있지만,
해당 쿼리는 실패하게 됨을 의미합니다.
:::

## max_ast_elements \{#max_ast_elements\}

<SettingsInfoBlock type="UInt64" default_value="50000" />

쿼리의 구문 트리에서 허용되는 최대 요소 수입니다. 이 값을 초과하면 예외가 발생합니다.

:::note
현재는 파싱하는 동안에는 검사되지 않고, 쿼리 파싱이 완료된 이후에만 검사됩니다.
이는 파싱 과정에서 깊이가 너무 큰 구문 트리가 생성될 수 있지만,
결국 해당 쿼리는 실패한다는 의미입니다.
:::

## max_autoincrement_series \{#max_autoincrement_series\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

`generateSerialID` 함수가 생성하는 series 개수에 대한 제한입니다.

각 series는 Keeper의 하나의 노드를 나타내므로, series 개수는 수백만 개를 넘기지 않는 것이 좋습니다.

## max_backup_bandwidth \{#max_backup_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

서버에서 특정 백업에 대해 적용되는 초당 바이트 단위의 최대 읽기 속도입니다. 0은 무제한을 의미합니다.

## max_block_size \{#max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

ClickHouse에서는 데이터를 블록 단위로 처리하며, 각 블록은 컬럼 파트의 집합입니다. 단일 블록에 대한 내부 처리 사이클은 효율적이지만, 각 블록을 처리할 때마다 무시할 수 없는 오버헤드가 발생합니다.

`max_block_size` 설정은 테이블에서 데이터를 로드할 때 하나의 블록에 포함할 행의 권장 최대 개수를 나타냅니다. 항상 `max_block_size` 크기의 블록이 테이블에서 로드되는 것은 아니며, ClickHouse가 더 적은 데이터를 가져와도 충분하다고 판단하면 더 작은 블록을 처리합니다.

블록 크기가 너무 작으면 각 블록을 처리할 때의 오버헤드를 피하기 어렵습니다. 반대로 블록 크기가 너무 크면 첫 번째 블록을 처리한 이후 `LIMIT` 절이 있는 쿼리가 빠르게 완료되기 어렵습니다. `max_block_size`를 설정할 때의 목적은 다중 스레드에서 많은 수의 컬럼을 추출할 때 메모리를 과도하게 사용하지 않도록 하고, 동시에 최소한의 캐시 지역성(cache locality)을 유지하는 데 있습니다.

## max_bytes_before_external_group_by \{#max_bytes_before_external_group_by\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 기본값: 레플리카당 메모리 용량의 절반입니다.

`GROUP BY` 절을 외부 메모리에서 실행할지 여부를 설정합니다.
([외부 메모리에서의 GROUP BY](/sql-reference/statements/select/group-by#group-by-in-external-memory) 참고)

설정 가능한 값:

- 단일 [GROUP BY](/sql-reference/statements/select/group-by) 연산에서 사용할 수 있는 RAM의 최대 용량(바이트 단위).
- `0` — 외부 메모리에서 `GROUP BY`를 비활성화합니다.

:::note
GROUP BY 연산 중 메모리 사용량이 이 임계값(바이트 단위)을 초과하면
「external aggregation」 모드가 활성화되어 데이터를 디스크로 스필(spill)합니다.

권장 값은 사용 가능한 시스템 메모리의 절반입니다.
:::

## max_bytes_before_external_sort \{#max_bytes_before_external_sort\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 기본값은 레플리카당 메모리 용량의 절반입니다.

`ORDER BY` 절을 외부 메모리에서 실행할지 여부를 설정합니다. 자세한 내용은 [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details)를 참조하십시오.
`ORDER BY` 연산 중 메모리 사용량이 이 임계값(바이트 단위)을 초과하면 외부 정렬(external sorting) 모드(데이터를 디스크로 스필(spill))가 활성화됩니다.

가능한 값:

- 단일 [ORDER BY](../../sql-reference/statements/select/order-by.md) 연산에서 사용할 수 있는 최대 RAM 용량(바이트 단위)입니다.
  권장 값은 사용 가능한 시스템 메모리의 절반입니다.
- `0` — 외부 메모리에서의 `ORDER BY`를 비활성화합니다.

## max_bytes_before_remerge_sort \{#max_bytes_before_remerge_sort\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

ORDER BY와 LIMIT이 함께 사용되는 경우, 메모리 사용량이 지정된 임계값을 초과하면, 최종 병합 전에 블록을 추가로 병합하는 단계를 수행하여 상위 LIMIT개의 행만 유지합니다.

## max_bytes_in_distinct \{#max_bytes_in_distinct\}

<SettingsInfoBlock type="UInt64" default_value="0" />

메모리에 저장되는 상태의 최대 크기(비압축 바이트 기준)로, DISTINCT를 사용할 때 해시 테이블이 사용할 수 있는 한도입니다.

## max_bytes_in_join \{#max_bytes_in_join\}

<SettingsInfoBlock type="UInt64" default_value="0" />

조인 연산에서 사용되는 해시 테이블의 최대 크기(바이트 단위)입니다.

이 설정은 [SELECT ... JOIN](/sql-reference/statements/select/join)
연산과 [Join table engine](/engines/table-engines/special/join)에 적용됩니다.

쿼리에 조인이 포함되어 있으면 ClickHouse는 모든 중간 결과에 대해 이 설정을 확인합니다.

제한에 도달했을 때 ClickHouse는 여러 가지 동작을 수행할 수 있습니다.
[join_overflow_mode](/operations/settings/settings#join_overflow_mode) 설정을 사용하여 동작을 선택하십시오.

가능한 값:

- 양의 정수.
- 0 — 메모리 제어가 비활성화됩니다.

## max_bytes_in_set \{#max_bytes_in_set\}

<SettingsInfoBlock type="UInt64" default_value="0" />

서브쿼리에서 생성된 `IN` 절의 Set가 사용하는 압축되지 않은 데이터의 최대 바이트 수입니다.

## max_bytes_ratio_before_external_group_by \{#max_bytes_ratio_before_external_group_by\}

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "기본값으로 디스크로 자동 스필링을 활성화합니다."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

`GROUP BY`에 사용할 수 있도록 허용되는 사용 가능 메모리의 비율입니다. 이 비율에 도달하면 집계를 위해 외부 메모리를 사용합니다.

예를 들어 `0.6`으로 설정하면, `GROUP BY`는 실행 시작 시 사용 가능 메모리
(서버/사용자/머지 작업)의 60%까지 사용할 수 있고, 그 이후에는
외부 집계를 사용하기 시작합니다.

## max_bytes_ratio_before_external_sort \{#max_bytes_ratio_before_external_sort\}

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "기본값으로 디스크로의 자동 스필(spill)을 활성화합니다."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

`ORDER BY`에 사용할 수 있는 사용 가능 메모리 비율입니다. 이 비율에 도달하면 외부 정렬(external sort)이 사용됩니다.

예를 들어 `0.6`으로 설정하면, 실행 시작 시점에 `ORDER BY`가 사용 가능 메모리(서버/USER/머지 작업 기준)의 `60%`까지 사용할 수 있으며, 그 이후에는 외부 정렬을 사용하기 시작합니다.

`max_bytes_before_external_sort`는 여전히 적용되며, 정렬 블록이 `max_bytes_before_external_sort`보다 클 때에만 디스크로 스필이 수행됩니다.

## max_bytes_to_read \{#max_bytes_to_read\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쿼리를 실행할 때 테이블에서 읽을 수 있는 최대 바이트 수(비압축 데이터 기준)입니다.
제한은 처리되는 각 데이터 청크마다 검사되며, 가장 내부 테이블 표현식에만 적용됩니다. 원격 서버에서 읽는 경우 원격 서버에서만 검사됩니다.

## max_bytes_to_read_leaf \{#max_bytes_to_read_leaf\}

<SettingsInfoBlock type="UInt64" default_value="0" />

분산 쿼리 실행 시 리프(leaf) 노드의 로컬 테이블에서 읽을 수 있는 최대 바이트 수(비압축 데이터 기준)입니다. 분산 쿼리는 각 세그먼트(leaf)에 여러 개의 서브 쿼리를 발행할 수 있지만, 이 제한은 리프 노드에서의 읽기 단계에서만 적용되며, 루트 노드에서 결과를 병합하는 단계에서는 무시됩니다.

예를 들어, 2개의 세그먼트로 구성된 클러스터가 있고 각 세그먼트에는 100바이트의 데이터를 가진 테이블이 하나씩 있다고 가정합니다. 두 테이블의 모든 데이터를 읽어야 하는 분산 쿼리가 `max_bytes_to_read=150`으로 설정된 경우, 전체가 200바이트가 되므로 쿼리가 실패합니다. `max_bytes_to_read_leaf=150`으로 설정된 쿼리는 리프 노드가 최대 100바이트만 읽기 때문에 성공합니다.

이 제한은 처리되는 각 데이터 청크에 대해 확인됩니다.

:::note
이 설정은 `prefer_localhost_replica=1`인 경우 안정적으로 동작하지 않습니다.
:::

## max_bytes_to_sort \{#max_bytes_to_sort\}

<SettingsInfoBlock type="UInt64" default_value="0" />

정렬을 위해 처리할 수 있는 최대 바이트 수입니다. `ORDER BY` 연산에서 처리해야 하는 비압축 바이트 수가 지정된 양을 초과하면, 동작은 기본값이 `throw`로 설정된 `sort_overflow_mode` 설정에 의해 결정됩니다.

## max_bytes_to_transfer \{#max_bytes_to_transfer\}

<SettingsInfoBlock type="UInt64" default_value="0" />

GLOBAL IN/JOIN 절이 실행될 때 원격 서버로 전송하거나 임시 테이블에 저장할 수 있는 비압축 데이터의 최대 바이트 수입니다.

## max_columns_to_read \{#max_columns_to_read\}

<SettingsInfoBlock type="UInt64" default_value="0" />

단일 쿼리에서 테이블에서 읽을 수 있는 컬럼의 최대 개수입니다.
쿼리가 지정된 개수보다 더 많은 컬럼을 읽어야 하는 경우 예외가 발생합니다.

:::tip
이 설정은 지나치게 복잡한 쿼리를 방지하는 데 유용합니다.
:::

`0` 값은 제한이 없음을 의미합니다.

## max_compress_block_size \{#max_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

테이블에 기록하기 위해 압축하기 전 비압축 데이터 블록의 최대 크기입니다. 기본값은 1,048,576 (1 MiB)입니다. 더 작은 블록 크기를 지정하면 일반적으로 압축률이 약간 낮아지지만, 캐시 지역성(cache locality)을 활용해 압축 및 압축 해제 속도가 약간 빨라지고 메모리 사용량이 감소합니다.

:::note
이 설정은 전문가 수준의 설정이며, 이제 막 ClickHouse를 사용하기 시작한 경우에는 변경하지 않는 것이 좋습니다.
:::

압축용 블록(바이트 배열로 구성된 메모리 청크)과 쿼리 처리용 블록(테이블의 행 집합)을 혼동하지 마십시오.

## max_concurrent_queries_for_all_users \{#max_concurrent_queries_for_all_users\}

<SettingsInfoBlock type="UInt64" default_value="0" />

이 설정 값이 현재 동시에 처리 중인 쿼리 수보다 작거나 같으면 예외가 발생합니다.

예를 들어, `max_concurrent_queries_for_all_users`를 모든 사용자에 대해 99로 설정하고, 데이터베이스 관리자는 서버가 과부하 상태일 때에도 조사 목적으로 쿼리를 실행할 수 있도록 본인에 대해서는 100으로 설정할 수 있습니다.

하나의 쿼리나 사용자에 대해 설정을 변경해도 다른 쿼리에는 영향을 주지 않습니다.

가능한 값:

* 양의 정수.
* 0 — 제한 없음.

**예시**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**추가 참고**

* [max&#95;concurrent&#95;queries](/operations/server-configuration-parameters/settings#max_concurrent_queries)


## max_concurrent_queries_for_user \{#max_concurrent_queries_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

각 사용자별로 동시에 처리할 수 있는 쿼리의 최대 개수입니다.

설정 가능한 값:

* 양의 정수.
* 0 — 제한 없음.

**예시**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections \{#max_distributed_connections\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

단일 분산 테이블(Distributed table)에 대한 단일 쿼리를 분산 처리할 때 원격 서버와 동시에 생성할 수 있는 최대 연결 수입니다. 클러스터 내 서버 수 이상으로 설정할 것을 권장합니다.

다음 매개변수들은 분산 테이블(Distributed table)을 생성할 때(및 서버를 시작할 때)만 사용되므로, 런타임에 변경할 필요가 없습니다.

## max_distributed_depth \{#max_distributed_depth\}

<SettingsInfoBlock type="UInt64" default_value="5" />

[Distributed](../../engines/table-engines/special/distributed.md) 테이블에 대한 재귀 쿼리의 최대 깊이를 제한합니다.

이 값을 초과하면 서버에서 예외를 던집니다.

허용되는 값:

- 양의 정수.
- 0 — 깊이에 제한 없음.

## max_download_buffer_size \{#max_download_buffer_size\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

각 스레드별 병렬 다운로드(예: URL engine)에 사용되는 버퍼의 최대 크기입니다.

## max_download_threads \{#max_download_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="4" />

데이터를 다운로드할 때 사용하는 스레드의 최대 개수입니다(예: URL 엔진).

## max_estimated_execution_time \{#max_estimated_execution_time\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "max_execution_time과 max_estimated_execution_time을 분리"}]}]}/>

쿼리의 최대 예상 실행 시간을 초 단위로 설정합니다. [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)가 만료될 때마다 각 데이터 블록에 대해 확인됩니다.

## max_execution_speed \{#max_execution_speed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

초당 실행 행 수의 최대값입니다. [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)가 만료될 때마다 각 데이터 블록에서 검사합니다. 실행 속도가 너무 빠른 경우 실행 속도가 낮춰집니다.

## max_execution_speed_bytes \{#max_execution_speed_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

초당 허용되는 최대 실행 바이트 수입니다. [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)가 만료된 후 각 데이터 블록마다 확인합니다. 실행 속도가 높은 경우 실행 속도가 제한됩니다.

## max_execution_time \{#max_execution_time\}

<SettingsInfoBlock type="Seconds" default_value="0" />

쿼리의 최대 실행 시간을 초 단위로 지정합니다.

`max_execution_time` 매개변수는 다소 이해하기 까다로울 수 있습니다.
현재 쿼리 실행 속도를 기준으로 한 보간(interpolation)에 따라 동작합니다
(이 동작은 [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)로 제어됩니다).

ClickHouse는 예상 실행 시간이 지정된 `max_execution_time`을 초과하면
쿼리를 중단합니다. 기본적으로 `timeout_before_checking_execution_speed`
값은 10초로 설정되어 있습니다. 이는 쿼리가 10초 동안 실행된 이후에 ClickHouse가
총 실행 시간을 추정하기 시작한다는 의미입니다. 예를 들어 `max_execution_time`이
3600초(1시간)로 설정되어 있으면, ClickHouse는 추정된 시간이
3600초 한도를 초과하는 경우 해당 쿼리를 종료합니다. `timeout_before_checking_execution_speed`를
0으로 설정하면, ClickHouse는 `max_execution_time`의 기준으로 실제 시계 시간을 사용합니다.

쿼리 실행 시간이 지정된 초 수를 초과하면 동작은 `timeout_overflow_mode`
설정에 의해 결정되며, 기본값은 `throw`입니다.

:::note
타임아웃은 데이터 처리 중에 지정된 지점에서만 확인되며, 해당 지점에서만 쿼리를 중단할 수 있습니다.
현재로서는 집계 상태 병합이나 쿼리 분석 중에는 중단할 수 없으며,
실제 실행 시간은 이 설정에 지정한 값보다 더 길어지게 됩니다.
:::

## max_execution_time_leaf \{#max_execution_time_leaf\}

<SettingsInfoBlock type="Seconds" default_value="0" />

[`max_execution_time`](#max_execution_time)과 의미는 비슷하지만,
분산 또는 원격 쿼리에서 리프 노드에만 적용됩니다.

예를 들어 리프 노드의 실행 시간을 `10s`로 제한하되
초기 노드에는 아무 제한도 두지 않으려면, 중첩 서브쿼리 설정에 `max_execution_time`을 두는 대신:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

`max_execution_time_leaf`를 쿼리 설정으로 사용할 수 있습니다.

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements \{#max_expanded_ast_elements\}

<SettingsInfoBlock type="UInt64" default_value="500000" />

별칭과 애스터리스크(*)가 전개된 이후 쿼리 구문 트리에서 노드 수 기준으로 허용되는 최대 크기입니다.

## max_fetch_partition_retries_count \{#max_fetch_partition_retries_count\}

<SettingsInfoBlock type="UInt64" default_value="5" />

다른 호스트에서 파티션을 가져올 때 허용되는 재시도 횟수입니다.

## max_final_threads \{#max_final_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 수정자가 있는 `SELECT` 쿼리의 데이터 읽기 단계에서 사용할 최대 병렬 스레드 수를 설정합니다.

가능한 값은 다음과 같습니다:

- 양의 정수.
- 0 또는 1 — 비활성화. `SELECT` 쿼리는 단일 스레드로 실행됩니다.

## max_http_get_redirects \{#max_http_get_redirects\}

<SettingsInfoBlock type="UInt64" default_value="0" />

허용되는 HTTP GET 리디렉션 홉 수의 최대값입니다. 악의적인 서버가 요청을 예상치 못한 서비스로 리디렉션하지 못하도록 추가적인 보안 조치를 보장합니다.\n\n예를 들어 외부 서버가 다른 주소로 리디렉션하지만, 해당 주소가 회사 인프라의 내부 주소처럼 보이는 경우가 있습니다. 이때 내부 서버로 HTTP 요청을 보내면, 인증을 우회하여 내부 네트워크에서 내부 API를 호출하거나 Redis 또는 Memcached와 같은 다른 서비스에 쿼리를 보낼 수도 있습니다. 내부 인프라(로컬호스트에서 실행 중인 것까지 포함)가 없거나 서버를 신뢰하는 경우에는 리디렉션을 허용해도 안전합니다. 다만 URL이 HTTPS가 아니라 HTTP를 사용하는 경우에는 원격 서버뿐 아니라 ISP와 그 사이에 있는 모든 네트워크도 함께 신뢰해야 한다는 점을 유의해야 합니다.

## max_hyperscan_regexp_length \{#max_hyperscan_regexp_length\}

<SettingsInfoBlock type="UInt64" default_value="0" />

[hyperscan multi-match 함수](/sql-reference/functions/string-search-functions#multiMatchAny)에서 각 정규 표현식의 최대 길이를 정의합니다.

가능한 값:

* 양의 정수.
* 0 - 길이에 제한이 없습니다.

**예시**

쿼리:

```sql
SELECT multiMatchAny('abcd', ['ab','bcd','c','d']) SETTINGS max_hyperscan_regexp_length = 3;
```

결과:

```text
┌─multiMatchAny('abcd', ['ab', 'bcd', 'c', 'd'])─┐
│                                              1 │
└────────────────────────────────────────────────┘
```

쿼리:

```sql
SELECT multiMatchAny('abcd', ['ab','bcd','c','d']) SETTINGS max_hyperscan_regexp_length = 2;
```

결과:

```text
Exception: Regexp length too large.
```

**함께 보기**

* [max&#95;hyperscan&#95;regexp&#95;total&#95;length](#max_hyperscan_regexp_total_length)


## max_hyperscan_regexp_total_length \{#max_hyperscan_regexp_total_length\}

<SettingsInfoBlock type="UInt64" default_value="0" />

각 [hyperscan multi-match function](/sql-reference/functions/string-search-functions#multiMatchAny)에서 모든 정규식의 총 길이 최대값을 설정합니다.

가능한 값:

* 양의 정수.
* 0 - 길이에 제한이 없습니다.

**예시**

쿼리:

```sql
SELECT multiMatchAny('abcd', ['a','b','c','d']) SETTINGS max_hyperscan_regexp_total_length = 5;
```

결과:

```text
┌─multiMatchAny('abcd', ['a', 'b', 'c', 'd'])─┐
│                                           1 │
└─────────────────────────────────────────────┘
```

쿼리:

```sql
SELECT multiMatchAny('abcd', ['ab','bc','c','d']) SETTINGS max_hyperscan_regexp_total_length = 5;
```

결과:

```text
Exception: Total regexp lengths too large.
```

**함께 보기**

* [max&#95;hyperscan&#95;regexp&#95;length](#max_hyperscan_regexp_length)


## max_insert_block_size \{#max_insert_block_size\}

**별칭**: `max_insert_block_size_rows`

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048449" />

테이블에 데이터를 삽입할 때 형성되는 블록의 최대 크기(행 개수 기준)입니다.

이 설정은 포맷 파싱 시 블록 형성을 제어합니다. 서버가 행 기반 입력 포맷(CSV, TSV, JSONEachRow 등)이나 어떤 인터페이스(HTTP, 인라인 데이터를 사용하는 clickhouse-client, gRPC, PostgreSQL wire protocol)로부터 Values 포맷을 파싱할 때, 이 설정을 사용하여 언제 블록을 생성할지 결정합니다.  
참고: 파일을 읽기 위해 clickhouse-client 또는 clickhouse-local을 사용할 때는 클라이언트가 직접 데이터를 파싱하며, 이 설정은 클라이언트 측에 적용됩니다.

다음 조건 중 하나를 만족하면 블록이 생성됩니다.

- 최소 임계값(AND): `min_insert_block_size_rows`와 `min_insert_block_size_bytes`가 모두 도달했을 때
- 최대 임계값(OR): `max_insert_block_size` 또는 `max_insert_block_size_bytes` 중 하나에 도달했을 때

기본값은 `max_block_size`보다 약간 큽니다. 그 이유는 특정 테이블 엔진(`*MergeTree`)이 각 삽입 블록마다 디스크에 데이터 파트를 형성하는데, 이 데이터 파트가 상당히 큰 단위이기 때문입니다. 마찬가지로 `*MergeTree` 테이블은 삽입 시 데이터를 정렬하며, 블록 크기가 충분히 크면 RAM에서 더 많은 데이터를 정렬할 수 있습니다.

가능한 값:

- 양의 정수.

## max_insert_block_size_bytes \{#max_insert_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "Row Input Format에서 데이터를 파싱하는 동안 형성되는 블록의 크기를 바이트 단위로 제어할 수 있도록 하는 새로운 설정입니다."}]}]}/>

테이블에 데이터를 삽입할 때 생성되는 블록의 최대 크기(바이트 단위)를 지정합니다.

이 설정은 max_insert_block_size_rows와 함께 동작하며, 동일한 컨텍스트에서 블록 생성 방식을 제어합니다. 이 설정들이 언제, 어떻게 적용되는지에 대한 자세한 내용은 max_insert_block_size_rows를 참조하십시오.

가능한 값:

- 양의 정수.
- 0 — 블록 생성에 사용되지 않습니다.

## max_insert_delayed_streams_for_parallel_write \{#max_insert_delayed_streams_for_parallel_write\}

<SettingsInfoBlock type="UInt64" default_value="0" />

최종 파트 플러시 작업을 지연할 수 있는 최대 스트림(컬럼) 수입니다. 기본값은 auto이며, 기저 스토리지가 S3와 같이 병렬 쓰기를 지원하는 경우 100, 그렇지 않은 경우 비활성화됩니다.

## max_insert_threads \{#max_insert_threads\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT SELECT` 쿼리를 실행하는 스레드의 최대 개수입니다.

설정 가능 값:

- 0 (또는 1) — `INSERT SELECT`를 병렬로 실행하지 않습니다.
- 1보다 큰 양의 정수.

Cloud 기본값:

- 메모리 8 GiB 노드: `1`
- 메모리 16 GiB 노드: `2`
- 더 큰 노드: `4`

병렬 `INSERT SELECT`는 `SELECT` 부분이 병렬로 실행되는 경우에만 효과가 있습니다. [`max_threads`](#max_threads) 설정을 참조하십시오.
값을 크게 설정할수록 메모리 사용량이 증가합니다.

## max_joined_block_size_bytes \{#max_joined_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "신규 설정"}]}]}/>

JOIN 결과 블록의 최대 크기(바이트 단위)입니다(조인 알고리즘이 이 설정을 지원하는 경우). 0으로 설정하면 제한이 없습니다.

## max_joined_block_size_rows \{#max_joined_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

JOIN 결과 블록의 최대 크기(해당 join 알고리즘이 지원하는 경우). 0은 무제한을 의미합니다.

## max_limit_for_vector_search_queries \{#max_limit_for_vector_search_queries\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "New setting"}]}]}/>

이 설정 값보다 큰 LIMIT가 지정된 SELECT 쿼리는 벡터 유사도 인덱스를 사용할 수 없습니다. 벡터 유사도 인덱스에서 메모리 오버플로가 발생하는 것을 방지하는 데 도움이 됩니다.

## max_local_read_bandwidth \{#max_local_read_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

로컬 읽기의 최대 속도(초당 바이트 수)입니다.

## max_local_write_bandwidth \{#max_local_write_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

초당 바이트 수로 표현되는 로컬 쓰기의 최대 속도입니다.

## max_memory_usage \{#max_memory_usage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 기본값: 레플리카의 RAM 용량에 따라 달라집니다.

단일 서버에서 하나의 쿼리를 실행할 때 사용할 수 있는 RAM의 최대 용량입니다.
값이 `0`이면 무제한을 의미합니다.

이 설정은 사용 가능한 메모리 용량이나 머신의 전체 메모리 용량을 고려하지 않습니다.
제한은 단일 서버 내의 단일 쿼리에만 적용됩니다.

각 쿼리의 현재 메모리 사용량을 확인하려면 `SHOW PROCESSLIST`를 사용할 수 있습니다.
각 쿼리에 대해 최대 메모리 사용량(피크 값)이 추적되어 로그에 기록됩니다.

다음 집계 함수에서 `String` 및 `Array` 인자를 사용할 때에는 상태에 대한 메모리 사용량이 완전히 추적되지 않습니다:

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

메모리 사용량은 [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user) 및
[`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage)
매개변수에 의해서도 제한됩니다.

## max_memory_usage_for_user \{#max_memory_usage_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

단일 서버에서 특정 사용자의 쿼리를 실행할 때 사용할 수 있는 RAM의 최대 사용량입니다. 0이면 제한이 없음을 의미합니다.

기본적으로 이 값에는 제한이 없습니다(`max_memory_usage_for_user = 0`).

[`max_memory_usage`](/operations/settings/settings#max_memory_usage)에 대한 설명도 참고하십시오.

예를 들어 `clickhouse_read`라는 이름의 사용자에 대해 `max_memory_usage_for_user`를 1000바이트로 설정하려면 다음 구문을 사용할 수 있습니다.

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

클라이언트에서 로그아웃한 뒤 다시 로그인한 후 `getSetting` 함수를 사용하여 정상적으로 적용되었는지 확인할 수 있습니다.

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth \{#max_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

네트워크를 통한 데이터 교환 속도를 초당 바이트 단위로 제한합니다. 이 설정은 모든 쿼리에 적용됩니다.

가능한 값:

- 양의 정수.
- 0 — 대역폭 제어가 비활성화됩니다.

## max_network_bandwidth_for_all_users \{#max_network_bandwidth_for_all_users\}

<SettingsInfoBlock type="UInt64" default_value="0" />

네트워크를 통해 교환되는 데이터의 속도를 초당 바이트 단위로 제한합니다. 이 설정은 서버에서 동시에 실행되는 모든 쿼리에 적용됩니다.

가능한 값:

- 양의 정수.
- 0 — 데이터 속도 제어가 비활성화됩니다.

## max_network_bandwidth_for_user \{#max_network_bandwidth_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

네트워크를 통한 데이터 전송 속도를 초당 바이트 수로 제한합니다. 이 설정은 단일 사용자가 동시에 실행하는 모든 쿼리에 적용됩니다.

가능한 값:

- 양의 정수.
- 0 — 데이터 속도 제어를 비활성화합니다.

## max_network_bytes \{#max_network_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쿼리를 실행할 때 네트워크를 통해 수신되거나 전송되는 데이터량(바이트 단위)을 제한합니다. 이 설정은 각 개별 쿼리에 적용됩니다.

가능한 값은 다음과 같습니다.

- 양의 정수.
- 0 — 데이터량 제어가 비활성화됩니다.

## max_number_of_partitions_for_independent_aggregation \{#max_number_of_partitions_for_independent_aggregation\}

<SettingsInfoBlock type="UInt64" default_value="128" />

테이블에서 이 최적화를 적용하는 파티션의 최대 개수입니다.

## max_os_cpu_wait_time_ratio_to_throw \{#max_os_cpu_wait_time_ratio_to_throw\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "설정값이 변경되었으며 25.4 버전에 백포트되었습니다"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "새 설정"}]}]}/>

쿼리를 거부할지를 판단하기 위해 사용하는 OS CPU 대기 시간(OSCPUWaitMicroseconds 메트릭)과 사용 시간(OSCPUVirtualTimeMicroseconds 메트릭) 사이의 최대 비율입니다. 최소 및 최대 비율 사이에서 선형 보간을 사용해 확률을 계산하며, 이 비율에서의 확률은 1입니다.

## max_parallel_replicas \{#max_parallel_replicas\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "기본적으로 최대 1000개의 병렬 레플리카를 사용합니다."}]}]}/>

쿼리를 실행할 때 각 세그먼트당 사용할 수 있는 레플리카의 최대 개수입니다.

가능한 값:

- 양의 정수.

**추가 정보**

이 설정은 사용되는 다른 설정값에 따라 서로 다른 결과가 나올 수 있습니다.

:::note
이 설정은 조인 또는 서브쿼리가 관련되어 있고, 모든 테이블이 특정 요구 사항을 충족하지 못하는 경우 잘못된 결과를 초래할 수 있습니다. 자세한 내용은 [Distributed Subqueries and max_parallel_replicas](/operations/settings/settings#max_parallel_replicas)를 참조하십시오.
:::

### `SAMPLE` 키를 사용한 병렬 처리 \{#parallel-processing-using-sample-key\}

하나의 쿼리를 여러 서버에서 병렬로 실행하면 더 빠르게 처리될 수 있습니다. 하지만 다음과 같은 경우에는 쿼리 성능이 저하될 수 있습니다.

- 파티셔닝 키에서 샘플링 키의 위치 때문에 효율적인 범위 스캔을 수행할 수 없는 경우
- 테이블에 샘플링 키를 추가함으로써 다른 컬럼을 사용한 필터링 효율이 떨어지는 경우
- 샘플링 키가 계산 비용이 많이 드는 표현식인 경우
- 클러스터 지연 시간 분포에 긴 꼬리가 있어, 더 많은 서버에 쿼리할수록 전체 쿼리 지연 시간이 증가하는 경우

### [parallel_replicas_custom_key](#parallel_replicas_custom_key)를 사용한 병렬 처리 \{#parallel-processing-using-parallel_replicas_custom_keyparallel_replicas_custom_key\}

이 설정은 모든 복제 테이블(Replicated Table)에 유용합니다.

## max_parser_backtracks \{#max_parser_backtracks\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "Limiting the complexity of parsing"}]}]}/>

파서가 백트래킹을 수행하는 최대 횟수(재귀 하강 파싱 과정에서 서로 다른 대안을 시도하는 횟수)입니다.

## max_parser_depth \{#max_parser_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

재귀 하향식 파서에서의 최대 재귀 깊이를 제한합니다. 호출 스택 크기를 제어하는 데 사용됩니다.

가능한 값:

- 양의 정수.
- 0 — 재귀 깊이가 무제한입니다.

## max_parsing_threads \{#max_parsing_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "파일에서 병렬 파싱 시 스레드 수를 제어하는 별도 설정 추가"}]}]}/>

병렬 파싱을 지원하는 입력 포맷에서 데이터를 파싱할 때 사용되는 스레드의 최대 개수입니다. 기본적으로 자동으로 결정됩니다.

## max_partition_size_to_drop \{#max_partition_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

쿼리 실행 시 파티션 삭제에 대한 제한입니다. 값 `0`은 파티션을 아무 제한 없이 삭제할 수 있음을 의미합니다.

Cloud 기본값: 1 TB입니다.

:::note
이 쿼리 설정은 동일한 서버 설정에 해당하는 값을 덮어씁니다. [max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop)를 참고하십시오.
:::

## max_partitions_per_insert_block \{#max_partitions_per_insert_block\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "Add a limit for the number of partitions in one block"}]}]}/>

단일 INSERT 블록에 포함될 수 있는 최대 파티션 수를 제한하며,
블록에 파티션이 너무 많이 포함되어 있으면 예외가 발생합니다.

- 양의 정수.
- `0` — 파티션 수에 제한이 없습니다.

**자세한 내용**

데이터를 INSERT할 때 ClickHouse는 INSERT되는 블록 내 파티션 수를 계산합니다.
파티션 수가 `max_partitions_per_insert_block` 값보다 많으면,
ClickHouse는 `throw_on_max_partitions_per_insert_block` 값에 따라 경고를 기록하거나
예외를 발생시킵니다. 예외 메시지는 다음과 같습니다:

> "Too many partitions for a single INSERT block (`partitions_count` partitions, limit is " + toString(max_partitions) + ").
  The limit is controlled by the 'max_partitions_per_insert_block' setting.
  A large number of partitions is a common misconception. It will lead to severe
  negative performance impact, including slow server startup, slow INSERT queries
  and slow SELECT queries. Recommended total number of partitions for a table is
  under 1000..10000. Please note, that partitioning is not intended to speed up
  SELECT queries (ORDER BY key is sufficient to make range queries fast).
  Partitions are intended for data manipulation (DROP PARTITION, etc)."

:::note
이 설정은 많은 수의 파티션 사용이 일반적인 오해라는 점을 고려한 안전 임계값 역할을 합니다.
:::

## max_partitions_to_read \{#max_partitions_to_read\}

<SettingsInfoBlock type="Int64" default_value="-1" />

단일 쿼리에서 읽을 수 있는 파티션 수의 최대값을 제한합니다.

테이블을 생성할 때 지정한 설정 값은 쿼리 수준 설정으로 덮어쓸 수 있습니다.

가능한 값:

- 양의 정수
- `-1` - 무제한(기본값)

:::note
테이블 설정에서 MergeTree 설정 [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)을(를) 지정할 수도 있습니다.
:::

## max_parts_to_move \{#max_parts_to_move\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "새 설정"}]}]}/>

하나의 쿼리에서 이동할 수 있는 파트 수를 제한합니다. 0은 제한이 없음을 의미합니다.

## max_projection_rows_to_use_projection_index \{#max_projection_rows_to_use_projection_index\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

projection 인덱스에서 읽어야 할 행 수가 이 임계값 이하이면 ClickHouse는 쿼리 실행 시 projection 인덱스를 적용하려고 시도합니다.

## max_query_size \{#max_query_size\}

<SettingsInfoBlock type="UInt64" default_value="262144" />

SQL 파서가 파싱할 쿼리 문자열의 최대 바이트 수입니다.
INSERT 쿼리의 VALUES 절에 있는 데이터는 별도의 스트림 파서(RAM을 O(1)만 사용)를 통해 처리되며, 이 제한의 영향을 받지 않습니다.

:::note
`max_query_size`는 SQL 쿼리 내에서 설정할 수 없습니다(예: `SELECT now() SETTINGS max_query_size=10000`). ClickHouse가 쿼리를 파싱하기 위해 버퍼를 할당해야 하며, 이 버퍼 크기는 `max_query_size` 설정에 의해 결정되므로 쿼리가 실행되기 전에 미리 설정되어 있어야 합니다.
:::

## max_read_buffer_size \{#max_read_buffer_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

파일 시스템에서 데이터를 읽을 때 사용하는 버퍼의 최대 크기입니다.

## max_read_buffer_size_local_fs \{#max_read_buffer_size_local_fs\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

로컬 파일 시스템에서 데이터를 읽을 때 사용하는 버퍼의 최대 크기입니다. 0으로 설정하면 max_read_buffer_size 설정 값이 사용됩니다.

## max_read_buffer_size_remote_fs \{#max_read_buffer_size_remote_fs\}

<SettingsInfoBlock type="UInt64" default_value="0" />

원격 파일 시스템에서 읽을 때 사용하는 버퍼의 최대 크기입니다. 0으로 설정하면 max_read_buffer_size가 사용됩니다.

## max_recursive_cte_evaluation_depth \{#max_recursive_cte_evaluation_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "재귀 CTE 평가 깊이의 최대 한도"}]}]}/>

재귀 CTE 평가 깊이의 최대 한도

## max_remote_read_network_bandwidth \{#max_remote_read_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

읽기 시 네트워크를 통한 데이터 교환의 최대 속도를 초당 바이트 수로 설정합니다.

## max_remote_write_network_bandwidth \{#max_remote_write_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쓰기 작업 시 네트워크를 통한 데이터 교환의 최대 속도(초당 바이트 수)입니다.

## max_replica_delay_for_distributed_queries \{#max_replica_delay_for_distributed_queries\}

<SettingsInfoBlock type="UInt64" default_value="300" />

분산 쿼리에서 지연 중인 레플리카가 사용되지 않도록 합니다. [복제(Replication)](../../engines/table-engines/mergetree-family/replication.md)를 참조하십시오.

시간을 초 단위로 설정합니다. 레플리카의 지연 시간이 설정된 값보다 크거나 같으면 해당 레플리카는 사용되지 않습니다.

허용되는 값:

- 양의 정수.
- 0 — 레플리카 지연을 확인하지 않습니다.

지연 시간이 0이 아닌 레플리카가 사용되지 않도록 하려면 이 매개변수를 1로 설정합니다.

복제된 테이블을 가리키는 분산 테이블에서 `SELECT`를 실행할 때 사용됩니다.

## max_result_bytes \{#max_result_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

결과 크기를 바이트 단위(비압축 기준)로 제한합니다. 임계값에 도달하면 데이터 블록을 하나 처리한 후 쿼리 실행이 중단되지만,
결과의 마지막 블록을 잘라내지는 않으므로 결과 크기가 임계값보다 클 수 있습니다.

**주의 사항**

이 임계값에는 메모리에 상주하는 결과 데이터의 크기가 기준이 됩니다.
결과 크기가 작더라도 메모리에서 더 큰 데이터 구조를 참조할 수 있습니다.
예를 들어 LowCardinality 컬럼의 딕셔너리나 AggregateFunction 컬럼의 Arena를 참조할 수 있으므로,
결과 크기가 작더라도 임계값을 초과할 수 있습니다.

:::warning
이 설정은 비교적 저수준 설정이므로 주의해서 사용해야 합니다.
:::

## max_result_rows \{#max_result_rows\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 기본값: `0`.

결과에 포함될 수 있는 행의 수를 제한합니다. 서브쿼리뿐만 아니라, 분산 쿼리 실행 시 파트를 처리하는 원격 서버에서도 동일하게 확인됩니다.
값이 `0`이면 제한이 적용되지 않습니다.

임계값에 도달하면 데이터 블록을 처리한 후 쿼리가 중지되지만,
결과의 마지막 블록은 잘리지 않으므로 결과 크기가
임계값보다 클 수 있습니다.

## max_reverse_dictionary_lookup_cache_size_bytes \{#max_reverse_dictionary_lookup_cache_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "104857600"},{"label": "새로운 설정입니다. 함수 `dictGetKeys`에서 쿼리별 역방향 딕셔너리 조회 캐시로 사용하는 최대 크기(바이트 단위)입니다. 이 캐시는 동일한 쿼리 내에서 딕셔너리를 다시 스캔하지 않도록, 속성 값별로 직렬화된 키 튜플을 저장합니다."}]}]}/>

함수 `dictGetKeys`에서 쿼리별 역방향 딕셔너리 조회 캐시로 사용하는 최대 크기(바이트 단위)입니다. 이 캐시는 동일한 쿼리 내에서 딕셔너리를 다시 스캔하지 않도록, 속성 값별로 직렬화된 키 튜플을 저장합니다. 최대 크기에 도달하면 LRU 방식으로 항목을 제거합니다. 캐싱을 비활성화하려면 0으로 설정하십시오.

## max_rows_in_distinct \{#max_rows_in_distinct\}

<SettingsInfoBlock type="UInt64" default_value="0" />

DISTINCT를 사용할 때 서로 다른 행 수의 최대값입니다.

## max_rows_in_join \{#max_rows_in_join\}

<SettingsInfoBlock type="UInt64" default_value="0" />

테이블을 조인할 때 사용되는 해시 테이블에 저장할 최대 행 수를 제한합니다.

이 설정은 [SELECT ... JOIN](/sql-reference/statements/select/join)
연산과 [Join](/engines/table-engines/special/join) 테이블 엔진에 적용됩니다.

쿼리에 여러 개의 조인이 포함된 경우 ClickHouse는 각 중간 결과마다 이 설정을 확인합니다.

제한에 도달했을 때 ClickHouse는 다양한 동작을 수행할 수 있습니다. 수행할 동작을 선택하려면
[`join_overflow_mode`](/operations/settings/settings#join_overflow_mode) 설정을 사용하십시오.

가능한 값:

- 양의 정수.
- `0` — 행 수에 제한이 없습니다.

## max_rows_in_set \{#max_rows_in_set\}

<SettingsInfoBlock type="UInt64" default_value="0" />

서브쿼리로부터 생성된 IN 절의 데이터 Set에 포함될 수 있는 최대 행 수입니다.

## max_rows_in_set_to_optimize_join \{#max_rows_in_set_to_optimize_join\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "읽기 순서 최적화를 방해하므로 조인 최적화를 비활성화했습니다"}]}]}/>

조인 전에 서로의 행 집합(Set)을 사용하여 조인 대상 테이블을 서로 필터링할 때 사용하는 Set의 최대 크기입니다.

가능한 값:

- 0 — 비활성화합니다.
- 임의의 양의 정수.

## max_rows_to_group_by \{#max_rows_to_group_by\}

<SettingsInfoBlock type="UInt64" default_value="0" />

집계 결과에서 얻을 수 있는 고유 키의 최대 개수입니다. 이 설정을 사용하면 집계 시 메모리 사용량을 제한할 수 있습니다.

GROUP BY 집계가 지정된 개수보다 많은 행(고유 GROUP BY 키)을 생성하는 경우 동작은 `group_by_overflow_mode`에 의해 결정됩니다. 기본값은 `throw`이며, 근사 GROUP BY 모드로 전환할 수도 있습니다.

## max_rows_to_read \{#max_rows_to_read\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쿼리를 실행할 때 테이블에서 읽을 수 있는 최대 행 수입니다.
이 제한은 처리되는 각 데이터 청크마다 확인되며, 가장 안쪽 테이블
식에만 적용됩니다. 원격 서버에서 읽는 경우에는 이 제한이 원격 서버에서만
확인됩니다.

## max_rows_to_read_leaf \{#max_rows_to_read_leaf\}

<SettingsInfoBlock type="UInt64" default_value="0" />

분산 쿼리를 실행할 때 리프 노드의 로컬 테이블에서 읽을 수 있는 최대 행 수입니다.  
분산 쿼리는 각 세그먼트(리프)에 여러 하위 쿼리를 발행할 수 있지만, 이 제한은 리프 노드에서의 읽기 단계에서만 확인되며, 루트 노드에서 결과를 병합하는 단계에서는 무시됩니다.

예를 들어, 클러스터가 2개의 세গ먼트로 구성되어 있고 각 세그먼트에 100개의 행을 가진 테이블이 하나씩 있다고 가정합니다.  
두 테이블에서 모든 데이터를 읽도록 되어 있는 분산 쿼리가 `max_rows_to_read=150`으로 설정되면, 총 200개의 행이 존재하므로 실패합니다.  
반면 `max_rows_to_read_leaf=150`으로 설정된 쿼리는 리프 노드에서 최대 100개의 행만 읽기 때문에 성공합니다.

이 제한은 처리되는 각 데이터 청크에 대해 확인됩니다.

:::note
이 설정은 `prefer_localhost_replica=1`인 경우 안정적으로 동작하지 않습니다.
:::

## max_rows_to_sort \{#max_rows_to_sort\}

<SettingsInfoBlock type="UInt64" default_value="0" />

정렬 전에 처리할 수 있는 최대 행 수입니다. 이를 통해 정렬 시 메모리 사용량을 제한할 수 있습니다.
ORDER BY 연산을 위해 처리해야 하는 행 수가 지정된 값을 초과하는 경우,
동작 방식은 기본값이 `throw`로 설정되어 있는 `sort_overflow_mode`에 의해 결정됩니다.

## max_rows_to_transfer \{#max_rows_to_transfer\}

<SettingsInfoBlock type="UInt64" default_value="0" />

GLOBAL IN/JOIN 절이 실행될 때 원격 서버로 전달하거나 임시 테이블에 저장할 수 있는 최대 크기(행 수 기준)입니다.

## max_sessions_for_user \{#max_sessions_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

인증된 사용자 한 명이 ClickHouse 서버에 가질 수 있는 동시 세션의 최대 개수입니다.

예시:

```xml
<profiles>
    <single_session_profile>
        <max_sessions_for_user>1</max_sessions_for_user>
    </single_session_profile>
    <two_sessions_profile>
        <max_sessions_for_user>2</max_sessions_for_user>
    </two_sessions_profile>
    <unlimited_sessions_profile>
        <max_sessions_for_user>0</max_sessions_for_user>
    </unlimited_sessions_profile>
</profiles>
<users>
    <!-- User Alice can connect to a ClickHouse server no more than once at a time. -->
    <Alice>
        <profile>single_session_user</profile>
    </Alice>
    <!-- User Bob can use 2 simultaneous sessions. -->
    <Bob>
        <profile>two_sessions_profile</profile>
    </Bob>
    <!-- User Charles can use arbitrarily many of simultaneous sessions. -->
    <Charles>
        <profile>unlimited_sessions_profile</profile>
    </Charles>
</users>
```

가능한 값:

* 양의 정수
* `0` - 동시 세션 수 무제한 (기본값)


## max_size_to_preallocate_for_aggregation \{#max_size_to_preallocate_for_aggregation\}

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "더 큰 테이블에 대한 최적화를 활성화합니다."}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "이 설정은 성능을 최적화합니다."}]}]}/>

집계를 수행하기 전에 모든 해시 테이블을 합산했을 때, 미리 공간을 할당할 수 있는 요소의 최대 개수를 정의합니다.

## max_size_to_preallocate_for_joins \{#max_size_to_preallocate_for_joins\}

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "새로운 설정입니다."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "더 큰 테이블에 대한 최적화를 활성화합니다."}]}]}/>

조인을 수행하기 전에 모든 해시 테이블을 합산하여 미리 할당이 허용되는 요소 수의 상한을 지정합니다.

## max_streams_for_files_processing_in_cluster_functions \{#max_streams_for_files_processing_in_cluster_functions\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Cluster 테이블 함수에서 파일 처리용 스트림 개수를 제한할 수 있는 새 설정을 추가했습니다."}]}]}/>

값이 0이 아니면 *Cluster 테이블 함수에서 파일로부터 데이터를 읽는 스레드 수를 제한합니다.

## max_streams_for_merge_tree_reading \{#max_streams_for_merge_tree_reading\}

<SettingsInfoBlock type="UInt64" default_value="0" />

값이 0이 아니면 MergeTree 테이블의 읽기 스트림 개수를 제한합니다.

## max_streams_multiplier_for_merge_tables \{#max_streams_multiplier_for_merge_tables\}

<SettingsInfoBlock type="Float" default_value="5" />

Merge 테이블에서 데이터를 읽을 때 더 많은 스트림을 사용하도록 설정합니다. 스트림은 Merge 테이블이 사용하는 여러 테이블에 분산됩니다. 이를 통해 작업이 스레드 전반에 보다 고르게 분산되며, 특히 병합된 테이블들의 크기가 서로 다를 때 유용합니다.

## max_streams_to_max_threads_ratio \{#max_streams_to_max_threads_ratio\}

<SettingsInfoBlock type="Float" default_value="1" />

스레드 수보다 더 많은 소스를 사용할 수 있도록 하여 작업을 스레드 전반에 보다 고르게 분산합니다. 향후에는 소스 수를 스레드 수와 동일하게 맞추되, 각 소스가 스스로 사용 가능한 작업을 동적으로 선택할 수 있게 될 예정이므로, 이 설정은 임시적인 해결책으로 간주됩니다.

## max_subquery_depth \{#max_subquery_depth\}

<SettingsInfoBlock type="UInt64" default_value="100" />

쿼리에 중첩 서브쿼리가 이 설정에서 지정한 개수보다 많이 포함되면 예외를 발생시킵니다.

:::tip
이 설정을 사용하면 클러스터 사용자가 지나치게 복잡한 쿼리를 작성하지 못하도록 방지하는 안전성 검사를 수행할 수 있습니다.
:::

## max_table_size_to_drop \{#max_table_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

쿼리 실행 시 테이블을 삭제할 때 적용되는 제한입니다. 값 `0`은 어떤 제약 없이 모든 테이블을 삭제할 수 있음을 의미합니다.

Cloud의 기본값: 1 TB.

:::note
이 쿼리 설정은 동일한 서버 설정값을 덮어씁니다. 자세한 내용은 [max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop)를 참조하십시오.
:::

## max_temporary_columns \{#max_temporary_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쿼리를 실행할 때 상수 컬럼을 포함하여 RAM에 동시에 유지해야 하는 임시 컬럼의 최대 수를 지정합니다.
쿼리가 중간 계산 결과로 메모리에서 지정된 수보다 더 많은 임시 컬럼을 생성하면 예외가 발생합니다.

:::tip
이 설정은 과도하게 복잡한 쿼리를 방지하는 데 유용합니다.
:::

`0`으로 설정하면 제한이 없습니다.

## max_temporary_data_on_disk_size_for_query \{#max_temporary_data_on_disk_size_for_query\}

<SettingsInfoBlock type="UInt64" default_value="0" />

동시에 실행 중인 모든 쿼리에 대해 디스크 상의 임시 파일이 사용할 수 있는 데이터의 최대 크기(바이트 단위)입니다.

가능한 값:

- 양의 정수.
- `0` — 무제한(기본값)

## max_temporary_data_on_disk_size_for_user \{#max_temporary_data_on_disk_size_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

동시에 실행 중인 모든 사용자 쿼리에서 디스크의 임시 파일이 사용할 수 있는 데이터의 최대 크기(바이트 단위)입니다.

가능한 값:

- 양의 정수.
- `0` — 무제한(기본값)

## max_temporary_non_const_columns \{#max_temporary_non_const_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`max_temporary_columns`와 마찬가지로, 쿼리를 실행할 때 RAM에 동시에 유지해야 하는 임시 컬럼의 최대 개수이지만, 상수 컬럼은 계산에서 제외합니다.

:::note
쿼리를 실행할 때 상수 컬럼은 상당히 자주 생성되지만, 계산 리소스는 거의 소모되지 않습니다.
:::

## max_threads \{#max_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

원격 서버에서 데이터를 가져오는 스레드를 제외한 쿼리 처리 스레드의 최대 개수입니다. (['max_distributed_connections'](/operations/settings/settings#max_distributed_connections) 설정 참조)

이 설정은 쿼리 처리 파이프라인의 동일한 단계를 병렬로 수행하는 스레드에 적용됩니다.
예를 들어 테이블에서 데이터를 읽을 때, 함수가 포함된 표현식을 계산하고 `WHERE`로 필터링하며 `GROUP BY`를 위한 사전 집계를 최소한 'max_threads' 개의 스레드를 사용해 병렬로 수행할 수 있다면, 'max_threads' 개의 스레드가 사용됩니다.

LIMIT으로 인해 빠르게 완료되는 쿼리의 경우 더 낮은 'max_threads' 값을 설정할 수 있습니다.
예를 들어 필요한 레코드 수가 각 블록에 모두 존재하고 max_threads = 8인 경우, 실제로는 하나의 블록만 읽으면 충분하지만 8개의 블록을 가져오게 됩니다.
`max_threads` 값이 작을수록 소비되는 메모리가 줄어듭니다.

기본적으로 `max_threads` 설정은 ClickHouse에서 사용 가능한 하드웨어 스레드 수(CPU 코어 수)와 일치합니다.
특수한 경우로, CPU 코어가 32개 미만이고 SMT(예: Intel HyperThreading)가 활성화된 x86 프로세서에서는 ClickHouse가 기본적으로 논리 코어 수(물리 코어 수 x 2)에 해당하는 값을 사용합니다.

SMT(예: Intel HyperThreading)가 없는 경우에는 CPU 코어 수와 동일합니다.

ClickHouse Cloud의 기본값은 `auto(N)`으로 표시되며, 여기서 N은 서비스의 vCPU 크기(예: 2vCPU/8GiB, 4vCPU/16GiB 등)와 일치합니다.
모든 서비스 크기 목록은 Cloud 콘솔의 "Settings" 탭을 참고하십시오.

## max_threads_for_indexes \{#max_threads_for_indexes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

인덱스를 처리하는 데 사용하는 스레드의 최대 개수입니다.

## max_untracked_memory \{#max_untracked_memory\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

작은 메모리 할당 및 할당 해제는 스레드 로컬 변수에 모아지며, 절대값 기준 누적 양이 지정된 값보다 커질 때에만 추적되거나 프로파일링됩니다. 이 값이 'memory_profiler_step'보다 크면 실제로는 'memory_profiler_step' 값으로 낮춰 적용됩니다.

## memory_overcommit_ratio_denominator \{#memory_overcommit_ratio_denominator\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "기본적으로 메모리 오버커밋 기능을 활성화합니다"}]}]}/>

전역 수준에서 하드 한도에 도달했을 때의 소프트 메모리 한도를 나타냅니다.
이 값은 쿼리에 대한 오버커밋 비율을 계산하는 데 사용됩니다.
0으로 설정하면 쿼리를 건너뜁니다.
자세한 내용은 [메모리 오버커밋](memory-overcommit.md)을 참조하십시오.

## memory_overcommit_ratio_denominator_for_user \{#memory_overcommit_ratio_denominator_for_user\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "기본적으로 메모리 오버커밋 기능을 활성화합니다"}]}]}/>

사용자 수준에서 하드 메모리 한계에 도달했을 때 적용되는 소프트 메모리 한계값입니다.
이 값은 쿼리의 오버커밋 비율을 계산하는 데 사용됩니다.
0으로 설정하면 해당 쿼리 실행을 건너뜁니다.
자세한 내용은 [메모리 오버커밋](memory-overcommit.md)을 참조하십시오.

## memory_profiler_sample_max_allocation_size \{#memory_profiler_sample_max_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`memory_profiler_sample_probability`에 해당하는 확률로, 지정된 값보다 작거나 같은 크기의 메모리 할당을 무작위로 수집합니다. 0으로 설정하면 비활성화됩니다. 이 임계값이 기대한 대로 동작하도록 하려면 `max_untracked_memory`를 0으로 설정하는 것이 좋습니다.

## memory_profiler_sample_min_allocation_size \{#memory_profiler_sample_min_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

지정된 값보다 크거나 같은 크기의 메모리 할당을 대상으로, `memory_profiler_sample_probability`에 해당하는 확률로 무작위로 수집합니다. 0으로 설정하면 비활성화됩니다. 이 임계값이 예상대로 동작하도록 하려면 'max_untracked_memory'를 0으로 설정하는 것이 좋습니다.

## memory_profiler_sample_probability \{#memory_profiler_sample_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

무작위 메모리 할당 및 해제를 수집하여 `system.trace_log`에 `trace_type`이 `MemorySample`인 항목으로 기록합니다. 이 확률은 할당 크기와 관계없이 각 alloc/free에 적용됩니다( `memory_profiler_sample_min_allocation_size` 및 `memory_profiler_sample_max_allocation_size`로 변경할 수 있음). 샘플링은 추적되지 않은 메모리 양이 `max_untracked_memory`를 초과할 때에만 수행됩니다. 보다 세밀한 샘플링이 필요하면 `max_untracked_memory`를 0으로 설정하는 것이 좋습니다.

## memory_profiler_step \{#memory_profiler_step\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

메모리 프로파일러의 단계를 설정합니다. 쿼리 메모리 사용량이 바이트 단위의 각 단계 임계값을 초과할 때마다 메모리 프로파일러가 메모리 할당 시점의 스택 트레이스를 수집하여 [trace_log](/operations/system-tables/trace_log)에 기록합니다.

가능한 값:

- 0보다 큰 정수(바이트 단위).

- 0 — 메모리 프로파일러를 비활성화합니다.

## memory_tracker_fault_probability \{#memory_tracker_fault_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

`exception safety`를 테스트하기 위해 지정된 확률로 메모리를 할당할 때마다 예외를 발생시킵니다.

## memory_usage_overcommit_max_wait_microseconds \{#memory_usage_overcommit_max_wait_microseconds\}

<SettingsInfoBlock type="UInt64" default_value="5000000" />

사용자 수준에서 메모리 오버커밋이 발생했을 때 스레드가 메모리가 해제되기를 기다리는 최대 시간입니다.
이 시간이 초과되었는데도 메모리가 해제되지 않으면 예외가 발생합니다.
자세한 내용은 [메모리 오버커밋](memory-overcommit.md)을 참고하십시오.

## merge_table_max_tables_to_look_for_schema_inference \{#merge_table_max_tables_to_look_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

명시적인 스키마 없이 `Merge` 테이블을 생성하거나 `merge` 테이블 함수를 사용할 때, 스키마는 지정된 개수 이내의 조건에 맞는 테이블들의 합집합으로 추론합니다.  
테이블 수가 이 값보다 많으면, 앞에서부터 지정된 개수만큼의 테이블만 사용하여 스키마를 추론합니다.

## merge_tree_coarse_index_granularity \{#merge_tree_coarse_index_granularity\}

<SettingsInfoBlock type="UInt64" default_value="8" />

데이터를 검색할 때 ClickHouse는 인덱스 파일의 데이터 마크를 확인합니다. ClickHouse가 필요한 키가 특정 범위 내에 있다고 판단하면, 이 범위를 `merge_tree_coarse_index_granularity`개의 하위 범위로 나누고, 각 하위 범위에서 필요한 키를 재귀적으로 검색합니다.

가능한 값:

- 임의의 양의 짝수 정수.

## merge_tree_compact_parts_min_granules_to_multibuffer_read \{#merge_tree_compact_parts_min_granules_to_multibuffer_read\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

ClickHouse Cloud에서만 적용됩니다. MergeTree 테이블의 compact 파트 스트라이프에서 multibuffer reader를 사용하기 위한 그래뉼 개수를 지정합니다. multibuffer reader는 병렬 읽기 및 prefetch를 지원합니다. 원격 파일 시스템에서 읽는 경우 multibuffer reader를 사용하면 읽기 요청 수가 증가합니다.

## merge_tree_determine_task_size_by_prewhere_columns \{#merge_tree_determine_task_size_by_prewhere_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

읽기 작업 크기를 결정할 때 `PREWHERE` 컬럼 크기만을 기준으로 할지 여부입니다.

## merge_tree_max_bytes_to_use_cache \{#merge_tree_max_bytes_to_use_cache\}

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

ClickHouse가 단일 쿼리에서 `merge_tree_max_bytes_to_use_cache` 바이트보다 더 많이 읽어야 하는 경우, 비압축 블록 캐시를 사용하지 않습니다.

비압축 블록 캐시는 쿼리용으로 추출된 데이터를 저장합니다. ClickHouse는 이 캐시를 사용하여 반복되는 작은 쿼리에 대한 응답 속도를 높입니다. 이 설정은 많은 양의 데이터를 읽는 쿼리로 인해 캐시가 불필요하게 소모되는 것을 방지합니다. [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 서버 설정은 비압축 블록 캐시의 크기를 정의합니다.

가능한 값:

- 양의 정수.

## merge_tree_max_rows_to_use_cache \{#merge_tree_max_rows_to_use_cache\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

ClickHouse가 단일 쿼리에서 `merge_tree_max_rows_to_use_cache` 행보다 더 많이 읽어야 하는 경우, 비압축 블록 캐시를 사용하지 않습니다.

비압축 블록 캐시는 쿼리용으로 추출된 데이터를 저장합니다. ClickHouse는 이 캐시를 사용하여 반복되는 작은 쿼리에 대한 응답 속도를 높입니다. 이 설정은 많은 양의 데이터를 읽는 쿼리로 인해 캐시가 쓰레싱(thrashing)되는 것을 방지합니다. [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 서버 설정은 비압축 블록 캐시의 크기를 지정합니다.

가능한 값:

- 임의의 양의 정수.

## merge_tree_min_bytes_for_concurrent_read \{#merge_tree_min_bytes_for_concurrent_read\}

<SettingsInfoBlock type="UInt64" default_value="251658240" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 엔진 테이블의 단일 파일에서 읽어야 하는 바이트 수가 `merge_tree_min_bytes_for_concurrent_read` 값을 초과하면 ClickHouse는 여러 스레드를 사용해 이 파일을 동시에 읽으려고 시도합니다.

가능한 값:

- 양의 정수.

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "설정이 사용 중단되었습니다"}]}]}/>

원격 파일 시스템에서 파일을 읽을 때, [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 엔진이 하나의 파일에 대해 읽기를 병렬화하기 전에 읽어야 하는 최소 바이트 수입니다. 이 설정의 사용을 권장하지 않습니다.

가능한 값:

- 양의 정수.

## merge_tree_min_bytes_for_seek \{#merge_tree_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="0" />

하나의 파일에서 읽을 두 데이터 블록 사이의 거리가 `merge_tree_min_bytes_for_seek` 바이트보다 작으면, ClickHouse는 두 블록을 모두 포함하는 파일 범위를 순차적으로 읽어 추가적인 탐색 동작을 피합니다.

가능한 값:

- 임의의 양의 정수.

## merge_tree_min_bytes_per_task_for_remote_reading \{#merge_tree_min_bytes_per_task_for_remote_reading\}

**별칭**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "값이 `filesystem_prefetch_min_bytes_for_single_read_task`와 통합되었습니다"}]}]}/>

작업당 읽는 최소 바이트 수입니다.

## merge_tree_min_read_task_size \{#merge_tree_min_read_task_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "New setting"}]}]}/>

태스크 크기에 대한 하드 하한값입니다. 그래뉼 수가 적고 사용 가능한 스레드 수가 많더라도 이보다 작은 태스크는 할당되지 않습니다.

## merge_tree_min_rows_for_concurrent_read \{#merge_tree_min_rows_for_concurrent_read\}

<SettingsInfoBlock type="UInt64" default_value="163840" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블 파일에서 읽어야 할 행 수가 `merge_tree_min_rows_for_concurrent_read` 값을 초과하면, ClickHouse는 여러 스레드를 사용해 이 파일을 동시에 읽으려고 시도합니다.

가능한 값:

- 양의 정수

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "설정이 사용 중단됨"}]}]}/>

원격 파일 시스템에서 데이터를 읽을 때, [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 엔진이 읽기를 병렬로 수행하기 전에 하나의 파일에서 읽어야 하는 최소 행 수입니다. 이 설정의 사용은 권장하지 않습니다.

가능한 값:

- 양의 정수입니다.

## merge_tree_min_rows_for_seek \{#merge_tree_min_rows_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="0" />

하나의 파일에서 읽을 두 데이터 블록 사이의 거리가 `merge_tree_min_rows_for_seek` 행보다 작으면, ClickHouse는 파일에서 탐색(seek)을 수행하지 않고 데이터를 순차적으로 읽습니다.

가능한 값:

- 임의의 양의 정수

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability \{#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "`PartsSplitter` 테스트를 위해 지정된 확률로 MergeTree에서 읽을 때마다 읽기 범위를 교차하는 범위와 교차하지 않는 범위로 분할합니다."}]}]}/>

`PartsSplitter` 테스트를 위해 지정된 확률로 MergeTree에서 읽을 때마다 읽기 범위를 교차하는 범위와 교차하지 않는 범위로 분할합니다.

## merge_tree_storage_snapshot_sleep_ms \{#merge_tree_storage_snapshot_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "쿼리에서 스토리지 스냅샷 일관성을 디버깅하기 위한 새로운 설정"}]}]}/>

MergeTree 테이블에 대한 스토리지 스냅샷을 생성할 때 인위적인 지연 시간을 밀리초 단위로 삽입합니다.
테스트 및 디버깅 목적에만 사용됩니다.

가능한 값:

- 0 - 지연 없음 (기본값)
- N - 밀리초 단위 지연

## merge_tree_use_const_size_tasks_for_remote_reading \{#merge_tree_use_const_size_tasks_for_remote_reading\}

<SettingsInfoBlock type="Bool" default_value="1" />

원격 테이블에서 데이터를 읽을 때 고정 크기 태스크를 사용할지 여부입니다.

## merge_tree_use_deserialization_prefixes_cache \{#merge_tree_use_deserialization_prefixes_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree에서 deserialization prefixes 캐시 사용을 제어하는 새로운 설정"}]}]}/>

MergeTree에서 원격 디스크로부터 데이터를 읽을 때 파일 프리픽스에서 컬럼 메타데이터를 캐싱하도록 활성화합니다.

## merge_tree_use_prefixes_deserialization_thread_pool \{#merge_tree_use_prefixes_deserialization_thread_pool\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree에서 prefix의 병렬 역직렬화를 위한 스레드 풀 사용을 제어하는 새로운 설정"}]}]}/>

MergeTree에서 Wide 파트의 prefix 데이터를 병렬로 읽기 위해 스레드 풀 사용을 활성화합니다. 해당 스레드 풀의 크기는 서버 설정 `max_prefixes_deserialization_thread_pool_size`로 제어됩니다.

## merge_tree_use_v1_object_and_dynamic_serialization \{#merge_tree_use_v1_object_and_dynamic_serialization\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "JSON 및 Dynamic 타입용 새로운 V2 직렬화 버전을 추가"}]}]}/>

이 설정을 활성화하면 MergeTree에서 JSON 및 Dynamic 타입에 대해 V2가 아닌 V1 직렬화 버전을 사용합니다. 이 설정 변경 사항은 서버를 다시 시작한 후에만 적용됩니다.

## metrics_perf_events_enabled \{#metrics_perf_events_enabled\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면 일부 perf 이벤트가 쿼리 실행 전 과정에서 측정됩니다.

## metrics_perf_events_list \{#metrics_perf_events_list\}

쿼리 실행 전체에 걸쳐 측정할 perf 메트릭 목록을 콤마로 구분하여 지정합니다. 비어 있으면 모든 이벤트를 의미합니다. 사용 가능한 이벤트는 소스 코드의 PerfEventInfo를 참조하십시오.

## min_bytes_to_use_direct_io \{#min_bytes_to_use_direct_io\}

<SettingsInfoBlock type="UInt64" default_value="0" />

스토리지 디스크에 direct I/O로 접근하기 위해 필요한 최소 데이터량입니다.

ClickHouse는 테이블에서 데이터를 읽을 때 이 설정을 사용합니다. 읽을 모든 데이터의 전체 크기가 `min_bytes_to_use_direct_io` 바이트를 초과하면, ClickHouse는 `O_DIRECT` 옵션을 사용하여 스토리지 디스크에서 데이터를 읽습니다.

가능한 값:

- 0 — direct I/O가 비활성화됩니다.
- 양의 정수.

## min_bytes_to_use_mmap_io \{#min_bytes_to_use_mmap_io\}

<SettingsInfoBlock type="UInt64" default_value="0" />

실험적인 설정입니다. 커널에서 사용자 공간으로 데이터를 복사하지 않고 대용량 파일을 읽을 때 사용하는 최소 메모리 크기를 설정합니다. [mmap/munmap](https://en.wikipedia.org/wiki/Mmap)이 느리기 때문에 권장 임계값은 약 64 MB입니다. 대용량 파일에만 의미가 있으며, 데이터가 페이지 캐시에 있는 경우에만 도움이 됩니다.

설정 가능 값:

- 양의 정수.
- 0 — 커널에서 사용자 공간으로 데이터를 복사하는 방식만으로 대용량 파일을 읽습니다.

## min_chunk_bytes_for_parallel_parsing \{#min_chunk_bytes_for_parallel_parsing\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- 유형: 부호 없는 정수형(unsigned int)
- 기본값: 1 MiB

각 스레드가 병렬 파싱 시 처리하는 청크의 최소 크기(바이트 단위)입니다.

## min_compress_block_size \{#min_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에 적용됩니다. 쿼리 처리 시 지연 시간을 줄이기 위해, 다음 마크를 기록할 때 블록 크기가 `min_compress_block_size` 이상이면 해당 블록을 압축합니다. 기본값은 65,536입니다.

비압축 데이터가 `max_compress_block_size`보다 작을 경우, 실제 블록 크기는 이 값보다 작지 않으며, 하나의 마크에 해당하는 데이터량보다도 작지 않습니다.

예제를 살펴보겠습니다. 테이블 생성 시 `index_granularity`가 8192로 설정되어 있다고 가정합니다.

UInt32 타입 컬럼(값당 4바이트)을 기록한다고 가정합니다. 8192개의 행을 기록하면 총 데이터량은 32 KB가 됩니다. min_compress_block_size = 65,536이므로, 압축 블록은 두 개의 마크마다 하나씩 형성됩니다.

이번에는 String 타입의 URL 컬럼(값당 평균 60바이트)을 기록한다고 가정합니다. 8192개의 행을 기록하면 평균적으로 500 KB보다 약간 작은 데이터가 됩니다. 이는 65,536보다 크므로, 각 마크마다 하나의 압축 블록이 형성됩니다. 이 경우, 디스크에서 단일 마크 범위의 데이터를 읽을 때 추가 데이터가 불필요하게 압축 해제되지 않습니다.

:::note
이 설정은 전문가 수준의 설정이므로, ClickHouse를 막 사용하기 시작한 경우에는 변경하지 않는 것이 좋습니다.
:::

## min_count_to_compile_aggregate_expression \{#min_count_to_compile_aggregate_expression\}

<SettingsInfoBlock type="UInt64" default_value="3" />

동일한 집계 표현식이 JIT 컴파일을 시작하기 위해 필요한 최소 개수입니다. [compile_aggregate_expressions](#compile_aggregate_expressions) 설정이 활성화되어 있어야만 동작합니다.

허용되는 값:

- 양의 정수.
- 0 — 동일한 집계 표현식을 항상 JIT 컴파일합니다.

## min_count_to_compile_expression \{#min_count_to_compile_expression\}

<SettingsInfoBlock type="UInt64" default_value="3" />

같은 expression을 컴파일하기 전에 필요한 최소 실행 횟수입니다.

## min_count_to_compile_sort_description \{#min_count_to_compile_sort_description\}

<SettingsInfoBlock type="UInt64" default_value="3" />

JIT 컴파일되기 전에 동일한 정렬 설명이 나타나야 하는 횟수입니다.

## min_execution_speed \{#min_execution_speed\}

<SettingsInfoBlock type="UInt64" default_value="0" />

초당 행 수 기준의 최소 실행 속도입니다. [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
가 만료될 때마다 각 데이터 블록의 속도를 검사합니다. 실행 속도가 더 낮으면 예외가 발생합니다.

## min_execution_speed_bytes \{#min_execution_speed_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

초당 실행 바이트 수 기준 최소 실행 속도입니다. [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)가
만료될 때마다 각 데이터 블록에서 확인합니다. 실행 속도가 이 값보다 낮으면 예외가 발생합니다.

## min_external_table_block_size_bytes \{#min_external_table_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "블록이 충분히 크지 않은 경우 외부 테이블에 전달되는 블록을 지정된 바이트 크기로 병합합니다."}]}]}/>

블록이 충분히 크지 않은 경우 외부 테이블에 전달되는 블록을 지정된 바이트 크기로 병합합니다.

## min_external_table_block_size_rows \{#min_external_table_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "블록이 충분히 크지 않은 경우, 외부 테이블에 전달되는 블록을 지정한 행 수가 되도록 병합합니다."}]}]}/>

블록이 충분히 크지 않은 경우, 외부 테이블에 전달되는 블록을 지정한 행 수가 되도록 병합합니다.

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "임시 쓰기를 허용하면서도 insert 시 일정량의 디스크 여유 공간(바이트)을 유지합니다."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

insert를 수행할 때 필요한 최소 디스크 여유 공간(바이트)입니다.

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "임시 쓰기를 허용하면서, 전체 디스크 공간 대비 비율로 표현되는 일정량의 여유 디스크 공간 바이트가 INSERT로 인해 소모되지 않도록 유지합니다."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

INSERT를 수행하기 위한 최소 여유 디스크 공간 비율입니다.

## min_free_disk_space_for_temporary_data \{#min_free_disk_space_for_temporary_data\}

<SettingsInfoBlock type="UInt64" default_value="0" />

외부 정렬 및 집계에 사용되는 임시 데이터를 저장할 때 확보해 두어야 하는 최소 디스크 공간입니다.

## min_hit_rate_to_use_consecutive_keys_optimization \{#min_hit_rate_to_use_consecutive_keys_optimization\}

<SettingsInfoBlock type="Float" default_value="0.5" />

집계에서 연속 키 최적화를 수행할 때 사용하는 캐시가 계속 활성화되기 위한 최소 적중률입니다.

## min_insert_block_size_bytes \{#min_insert_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="268402944" />

테이블에 데이터를 삽입할 때 생성할 블록의 최소 크기(바이트 단위)입니다.

이 설정은 `min_insert_block_size_rows`와 함께 작동하며, 동일한 컨텍스트(포맷 분석 및 `INSERT` 연산)에서 블록 생성 방식을 제어합니다. 이 설정들이 언제, 어떻게 적용되는지에 대한 자세한 내용은 `min_insert_block_size_rows`를 참조하십시오.

허용 값:

- 양의 정수.
- 0 — 설정이 블록 생성에 참여하지 않습니다.

## min_insert_block_size_bytes_for_materialized_views \{#min_insert_block_size_bytes_for_materialized_views\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` 쿼리로 테이블에 삽입할 수 있는 블록의 최소 바이트 크기를 설정합니다. 더 작은 크기의 블록은 더 큰 블록으로 병합됩니다. 이 설정은 [materialized view](../../sql-reference/statements/create/view.md)에 삽입되는 블록에만 적용됩니다. 이 설정을 조정하면 materialized view로 데이터를 전달할 때 블록 병합 동작을 제어하여 과도한 메모리 사용을 피할 수 있습니다.

가능한 값:

- 임의의 양의 정수.
- 0 — 블록 병합 비활성화.

**관련 항목**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows \{#min_insert_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="1048449" />

테이블로 데이터를 삽입할 때 생성되는 블록의 최소 크기(행 기준)입니다.

이 설정은 다음 두 가지 상황에서 블록 형성을 제어합니다:

1. 포맷 파싱: 서버가 어떤 인터페이스(HTTP, 인라인 데이터가 있는 clickhouse-client, gRPC, PostgreSQL wire protocol 등)를 통해 행 기반 입력 포맷(CSV, TSV, JSONEachRow 등)을 파싱할 때, 이 설정을 사용하여 언제 블록을 내보낼지 결정합니다.  
참고: clickhouse-client 또는 clickhouse-local로 파일에서 읽을 때는 클라이언트 자체가 데이터를 파싱하며, 이 설정은 클라이언트 측에 적용됩니다.
2. INSERT 연산: INSERT...SELECT 쿼리 동안과 데이터가 materialized view를 통해 흐를 때, 스토리지에 기록하기 전에 이 설정을 기준으로 블록이 병합됩니다.

포맷 파싱에서 블록은 다음 조건 중 하나를 만족하면 내보내집니다:

- 최소 임계값(AND): min_insert_block_size_rows와 min_insert_block_size_bytes가 모두 도달했을 때
- 최대 임계값(OR): max_insert_block_size 또는 max_insert_block_size_bytes 중 하나에 도달했을 때

INSERT 연산에서 더 작은 크기의 블록은 더 큰 블록으로 병합되며, min_insert_block_size_rows 또는 min_insert_block_size_bytes 중 하나에 도달하면 내보내집니다.

가능한 값:

- 양의 정수.
- 0 — 이 설정은 블록 형성에 사용되지 않습니다.

## min_insert_block_size_rows_for_materialized_views \{#min_insert_block_size_rows_for_materialized_views\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` 쿼리로 테이블에 삽입될 수 있는 블록의 최소 행 수를 설정합니다. 더 작은 크기의 블록은 더 큰 블록으로 병합됩니다. 이 설정은 [materialized view](../../sql-reference/statements/create/view.md)에 삽입되는 블록에만 적용됩니다. 이 설정을 조정하면 materialized view로 전송하는 과정에서 블록 병합 동작을 제어하고, 과도한 메모리 사용을 방지할 수 있습니다.

가능한 값:

- 양의 정수.
- 0 — 블록 병합이 비활성화됩니다.

**함께 보기**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes \{#min_joined_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "새 설정입니다."}]}]}/>

JOIN 입력 및 출력 블록에 대한 최소 블록 크기(바이트 단위)입니다(조인 알고리즘이 이를 지원하는 경우). 작은 블록은 합쳐집니다. 0으로 설정하면 제한이 없습니다.

## min_joined_block_size_rows \{#min_joined_block_size_rows\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "New setting."}]}]}/>

JOIN 입력 및 출력 블록(조인 알고리즘이 지원하는 경우)에 대한 최소 블록 크기를 행 단위로 지정합니다. 작은 블록은 병합됩니다. 0은 제한이 없음을 의미합니다.

## min_os_cpu_wait_time_ratio_to_throw \{#min_os_cpu_wait_time_ratio_to_throw\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "설정 값이 변경되어 25.4 버전에 백포트되었습니다"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "새 설정"}]}]}/>

쿼리를 거부할지 판단할 때 사용하는 OS CPU 대기 시간(OSCPUWaitMicroseconds 메트릭)과 사용 시간(OSCPUVirtualTimeMicroseconds 메트릭) 간의 최소 비율입니다. 최소 및 최대 비율 사이에서 선형 보간을 사용하여 확률을 계산하며, 이 최소 비율 지점에서 확률은 0입니다.

## min_outstreams_per_resize_after_split \{#min_outstreams_per_resize_after_split\}

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "새로운 설정입니다."}]}]}/>

파이프라인 생성 중 분할이 수행된 이후 `Resize` 또는 `StrictResize` 프로세서의 출력 스트림 최소 개수를 지정합니다. 생성된 출력 스트림 개수가 이 값보다 작으면 분할 연산은 수행되지 않습니다.

### Resize 노드란 무엇인가 \{#what-is-a-resize-node\}

`Resize` 노드는 쿼리 파이프라인에서 흐르는 데이터 스트림의 개수를 조정하는 프로세서입니다. 이 노드는 여러 스레드 또는 프로세서 간에 작업 부하를 균형 있게 분산하기 위해 스트림 개수를 늘리거나 줄일 수 있습니다. 예를 들어, 쿼리에 더 높은 수준의 병렬 처리가 필요하면 `Resize` 노드는 단일 스트림을 여러 스트림으로 분할할 수 있습니다. 반대로, 여러 스트림을 더 적은 수의 스트림으로 병합하여 데이터 처리를 통합할 수도 있습니다.

`Resize` 노드는 데이터 블록의 구조를 유지하면서 데이터가 스트림 전반에 고르게 분산되도록 합니다. 이를 통해 리소스 사용을 최적화하고 쿼리 성능을 향상시키는 데 도움이 됩니다.

### Resize 노드를 분할해야 하는 이유 \{#why-the-resize-node-needs-to-be-split\}

파이프라인 실행 중에 중앙 허브 역할을 하는 `Resize` 노드의 ExecutingGraph::Node::status_mutex에 대한 경합이 특히 코어 수가 많은 환경에서 크게 발생하며, 이로 인해 다음과 같은 문제가 발생합니다:

1. ExecutingGraph::updateNode의 지연 시간이 증가하여 쿼리 성능에 직접적인 영향을 줍니다.
2. 스핀락 경합(native_queued_spin_lock_slowpath)으로 인해 과도한 CPU 사이클이 낭비되어 효율성이 저하됩니다.
3. CPU 활용도가 감소하여 병렬성과 처리량이 제한됩니다.

### Resize 노드가 분할되는 방식 \{#how-the-resize-node-gets-split\}

1. 출력 스트림 수를 확인하여 분할이 가능한지 검증합니다. 각 분할 프로세서의 출력 스트림이 `min_outstreams_per_resize_after_split` 임계값 이상인지 확인합니다.
2. `Resize` 노드는 포트 개수가 동일한 더 작은 여러 개의 `Resize` 노드로 분할되며, 각 노드는 입력 및 출력 스트림의 하위 집합을 처리합니다.
3. 각 그룹은 서로 독립적으로 처리되어 락 경합(lock contention)이 줄어듭니다.

### 임의 개수의 입력/출력을 가진 Resize 노드 분할 \{#splitting-resize-node-with-arbitrary-inputsoutputs\}

입력/출력 개수가 분할할 `Resize` 노드 수로 나누어떨어지지 않는 경우, 일부 입력은 `NullSource`에 연결되고 일부 출력은 `NullSink`에 연결됩니다. 이렇게 하면 전체 데이터 흐름에 영향을 주지 않고 분할을 수행할 수 있습니다.

### 설정의 목적 \{#purpose-of-the-setting\}

`min_outstreams_per_resize_after_split` 설정은 `Resize` 노드의 분할이 의미 있는 수준으로 이루어지도록 보장하고, 스트림 수가 지나치게 적게 생성되어 병렬 처리가 비효율적으로 되는 상황을 방지합니다. 최소 출력 스트림 개수를 강제함으로써 병렬성과 오버헤드 사이의 균형을 유지하도록 돕고, 스트림 분할 및 병합이 포함된 시나리오에서 쿼리 실행을 최적화합니다.

### 설정 비활성화 \{#disabling-the-setting\}

`Resize` 노드 분할을 비활성화하려면 이 설정 값을 0으로 설정하십시오. 이렇게 하면 파이프라인을 생성할 때 `Resize` 노드가 분할되지 않아, 더 작은 노드로 나뉘지 않고 원래 구조를 유지합니다.

## min_table_rows_to_use_projection_index \{#min_table_rows_to_use_projection_index\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

테이블에서 읽을 것으로 예상되는 행 수가 이 임계값보다 크거나 같으면 ClickHouse는 쿼리를 실행하는 동안 프로젝션 인덱스를 사용하려고 시도합니다.

## mongodb_throw_on_unsupported_query \{#mongodb_throw_on_unsupported_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "새 설정입니다."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "새 설정입니다."}]}]}/>

이 설정을 활성화하면 MongoDB 쿼리를 생성할 수 없을 때 MongoDB 테이블이 오류를 반환합니다. 비활성화된 경우 ClickHouse가 전체 테이블을 읽어서 로컬에서 처리합니다. 이 옵션은 'allow_experimental_analyzer=0'일 때는 적용되지 않습니다.

## move_all_conditions_to_prewhere \{#move_all_conditions_to_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

WHERE 절에 있는 조건 중 PREWHERE 절로 이동할 수 있는 모든 조건을 이동합니다

## move_primary_key_columns_to_end_of_prewhere \{#move_primary_key_columns_to_end_of_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

기본 키 컬럼을 포함하는 PREWHERE 조건을 AND 체인의 끝으로 이동합니다. 이러한 조건은 대부분 기본 키 분석 단계에서 이미 고려되므로, PREWHERE 필터링에는 크게 기여하지 않을 수 있습니다.

## multiple_joins_try_to_keep_original_names \{#multiple_joins_try_to_keep_original_names\}

<SettingsInfoBlock type="Bool" default_value="0" />

여러 조인을 재작성할 때 최상위 표현식 목록에 별칭을 추가하지 않습니다

## mutations_execute_nondeterministic_on_initiator \{#mutations_execute_nondeterministic_on_initiator\}

<SettingsInfoBlock type="Bool" default_value="0" />

`true`인 경우, 상수 비결정적 함수(예: 함수 `now()`)가 이니시에이터에서 실행되고 `UPDATE` 및 `DELETE` 쿼리에서 리터럴로 대체됩니다. 이는 상수 비결정적 함수를 사용하는 뮤테이션을 실행할 때 레플리카 간 데이터가 동일하게 유지되도록 하는 데 도움이 됩니다. 기본값: `false`.

## mutations_execute_subqueries_on_initiator \{#mutations_execute_subqueries_on_initiator\}

<SettingsInfoBlock type="Bool" default_value="0" />

`true`로 설정하면 스칼라 서브쿼리가 이니시에이터에서 실행되어 `UPDATE` 및 `DELETE` 쿼리에서 리터럴로 대체됩니다. 기본값: `false`.

## mutations_max_literal_size_to_replace \{#mutations_max_literal_size_to_replace\}

<SettingsInfoBlock type="UInt64" default_value="16384" />

`UPDATE` 및 `DELETE` 쿼리에서 대체될 직렬화된 리터럴의 최대 크기(바이트 단위)입니다. 위의 두 설정 중 하나 이상이 활성화된 경우에만 적용됩니다. 기본값은 16384(16 KiB)입니다.

## mutations_sync \{#mutations_sync\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` 쿼리([뮤테이션](../../sql-reference/statements/alter/index.md/#mutations))를 동기적으로 실행하도록 허용합니다.

가능한 값:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | 뮤테이션이 비동기적으로 실행됩니다.                                                                                                                   |
| `1`   | 현재 서버에서 모든 뮤테이션이 완료될 때까지 쿼리가 대기합니다.                                                                                        |
| `2`   | 모든 레플리카(존재하는 경우)에서 모든 뮤테이션이 완료될 때까지 쿼리가 대기합니다.                                                                     |
| `3`   | 활성 레플리카에 대해서만 쿼리가 대기합니다. `SharedMergeTree`에서만 지원됩니다. `ReplicatedMergeTree`에서는 `mutations_sync = 2`와 동일하게 동작합니다. |

## mysql_datatypes_support_level \{#mysql_datatypes_support_level\}

MySQL 타입을 대응하는 ClickHouse 타입으로 어떻게 변환할지 정의합니다. `decimal`, `datetime64`, `date2Date32`, `date2String`을 쉼표로 구분해 임의의 조합으로 지정합니다.

- `decimal`: 정밀도가 허용하는 경우 `NUMERIC` 및 `DECIMAL` 타입을 `Decimal`로 변환합니다.
- `datetime64`: 정밀도가 `0`이 아닐 때 `DATETIME` 및 `TIMESTAMP` 타입을 `DateTime` 대신 `DateTime64`로 변환합니다.
- `date2Date32`: `DATE`를 `Date` 대신 `Date32`로 변환합니다. `date2String`보다 우선합니다.
- `date2String`: `DATE`를 `Date` 대신 `String`으로 변환합니다. `datetime64` 설정에 의해 무시됩니다.

## mysql_map_fixed_string_to_text_in_show_columns \{#mysql_map_fixed_string_to_text_in_show_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "ClickHouse를 BI 도구와 연결하기 위한 구성 작업을 줄입니다."}]}]}/>

이 설정을 활성화하면 [FixedString](../../sql-reference/data-types/fixedstring.md) ClickHouse 데이터 타입이 [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns)에서 `TEXT`로 표시됩니다.

MySQL wire 프로토콜을 통해 연결하는 경우에만 효과가 있습니다.

- 0 - `BLOB`을 사용합니다.
- 1 - `TEXT`를 사용합니다.

## mysql_map_string_to_text_in_show_columns \{#mysql_map_string_to_text_in_show_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "ClickHouse를 BI 도구와 연결하는 구성 작업을 줄입니다."}]}]}/>

이 설정을 활성화하면 ClickHouse의 [String](../../sql-reference/data-types/string.md) 데이터 타입이 [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) 결과에서 `TEXT`로 표시됩니다.

MySQL wire protocol을 통해 연결하는 경우에만 효과가 있습니다.

- 0 - `BLOB`을 사용합니다.
- 1 - `TEXT`를 사용합니다.

## mysql_max_rows_to_insert \{#mysql_max_rows_to_insert\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

MySQL 저장소 엔진에서 배치 삽입 시 한 번에 삽입할 수 있는 최대 행 수입니다.

## network_compression_method \{#network_compression_method\}

<SettingsInfoBlock type="String" default_value="LZ4" />

클라이언트/서버 및 서버/서버 통신 데이터를 압축할 때 사용하는 코덱입니다.

가능한 값:

- `NONE` — 압축하지 않습니다.
- `LZ4` — LZ4 코덱을 사용합니다.
- `LZ4HC` — LZ4HC 코덱을 사용합니다.
- `ZSTD` — ZSTD 코덱을 사용합니다.

**관련 항목**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level \{#network_zstd_compression_level\}

<SettingsInfoBlock type="Int64" default_value="1" />

ZSTD 압축 수준을 조정합니다. [network_compression_method](#network_compression_method)가 `ZSTD`로 설정된 경우에만 사용됩니다.

가능한 값:

- 1에서 15 사이의 양의 정수입니다.

## normalize_function_names \{#normalize_function_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "함수 이름을 표준 이름(canonical name)으로 정규화합니다. 이는 PROJECTION 쿼리 라우팅을 위해 필요했습니다"}]}]}/>

함수 이름을 표준 이름(canonical name)으로 정규화합니다

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\}

<SettingsInfoBlock type="UInt64" default_value="0" />

해당 테이블에 미완료된 뮤테이션이 이 값 이상 존재하는 경우, 테이블의 뮤테이션을 인위적으로 지연시킵니다. 0이면 비활성화됩니다.

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

뮤테이션 대상 테이블에 완료되지 않은 뮤테이션이 지정된 개수 이상 존재하면 'Too many mutations ...' 예외를 발생시킵니다. 0 - 비활성화

## odbc_bridge_connection_pool_size \{#odbc_bridge_connection_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

ODBC bridge에서 각 연결 설정 문자열마다 사용하는 커넥션 풀의 크기입니다.

## odbc_bridge_use_connection_pooling \{#odbc_bridge_use_connection_pooling\}

<SettingsInfoBlock type="Bool" default_value="1" />

ODBC bridge에서 연결 풀링을 사용합니다. 값을 false로 설정하면 매번 새 연결이 생성됩니다.

## offset \{#offset\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쿼리에서 행을 반환하기 전에 건너뛸 행(row) 수를 설정합니다. [OFFSET](/sql-reference/statements/select/offset) 절에 의해 설정된 offset을 조정하여 두 값이 합산되도록 설정합니다.

가능한 값:

* 0 — 행을 건너뛰지 않습니다.
* 양의 정수.

**예시**

입력 테이블:

```sql
CREATE TABLE test (i UInt64) ENGINE = MergeTree() ORDER BY i;
INSERT INTO test SELECT number FROM numbers(500);
```

쿼리:

```sql
SET limit = 5;
SET offset = 7;
SELECT * FROM test LIMIT 10 OFFSET 100;
```

결과:

```text
┌───i─┐
│ 107 │
│ 108 │
│ 109 │
└─────┘
```


## opentelemetry_start_keeper_trace_probability \{#opentelemetry_start_keeper_trace_probability\}

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "auto"},{"label": "New setting"}]}]}/>

ZooKeeper 요청에 대해 트레이스를 시작할 확률입니다. 상위 트레이스 존재 여부와 관계없이 적용됩니다.

가능한 값:

- 'auto' - `opentelemetry_start_trace_probability` 설정과 동일합니다.
- 0 — 트레이싱이 비활성화됩니다.
- 0에서 1 — 확률 값입니다 (예: 1.0 = 항상 활성화).

## opentelemetry_start_trace_probability \{#opentelemetry_start_trace_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

ClickHouse가 (부모 [trace context](https://www.w3.org/TR/trace-context/)가 제공되지 않은 경우) 실행된 쿼리에 대해 트레이스를 시작할 확률을 설정합니다.

가능한 값:

- 0 — (부모 trace context가 제공되지 않은 경우) 모든 실행된 쿼리에 대해 트레이스가 시작되지 않습니다.
- [0..1] 범위의 양의 부동소수점 수. 예를 들어, 값이 `0.5`이면 ClickHouse는 평균적으로 전체 쿼리의 절반에 대해 트레이스를 시작합니다.
- 1 — 모든 실행된 쿼리에 대해 트레이스가 시작됩니다.

## opentelemetry_trace_cpu_scheduling \{#opentelemetry_trace_cpu_scheduling\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "`cpu_slot_preemption` 기능을 추적하기 위한 새 설정입니다."}]}]}/>

워크로드의 선점형 CPU 스케줄링과 관련된 OpenTelemetry 스팬을 수집합니다.

## opentelemetry_trace_processors \{#opentelemetry_trace_processors\}

<SettingsInfoBlock type="Bool" default_value="0" />

프로세서에서 사용할 OpenTelemetry span을 수집합니다.

## optimize_aggregation_in_order \{#optimize_aggregation_in_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에서 해당 정렬 순서에 따라 데이터를 집계하는 [SELECT](../../sql-reference/statements/select/index.md) 쿼리에 대해 [GROUP BY](/sql-reference/statements/select/group-by) 최적화를 활성화합니다.

가능한 값:

- 0 — `GROUP BY` 최적화가 비활성화됩니다.
- 1 — `GROUP BY` 최적화가 활성화됩니다.

**관련 항목**

- [GROUP BY 최적화](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## optimize_aggregators_of_group_by_keys \{#optimize_aggregators_of_group_by_keys\}

<SettingsInfoBlock type="Bool" default_value="1" />

SELECT 절에서 GROUP BY 키에 대한 min/max/any/anyLast 집계 함수를 제거합니다.

## optimize_and_compare_chain \{#optimize_and_compare_chain\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "A new setting"}]}]}/>

AND 체인에서 상수 비교를 전파하여 필터링 성능을 향상합니다. 연산자 `<`, `<=`, `>`, `>=`, `=` 및 이들의 조합을 지원합니다. 예를 들어 `(a < b) AND (b < c) AND (c < 5)`는 `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)`로 확장됩니다.

## optimize_append_index \{#optimize_append_index\}

<SettingsInfoBlock type="Bool" default_value="0" />

인덱스 조건을 추가하기 위해 [제약 조건](../../sql-reference/statements/create/table.md/#constraints)을 사용합니다. 이 설정의 기본값은 `false`입니다.

가능한 값:

- true, false

## optimize_arithmetic_operations_in_aggregate_functions \{#optimize_arithmetic_operations_in_aggregate_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

집계 함수 밖으로 산술 연산을 이동합니다

## optimize_const_name_size \{#optimize_const_name_size\}

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "큰 상수에 대해 scalar 값으로 대체하고 이름으로 hash 를 사용합니다(크기는 이름 길이로 추정됩니다)"}]}]}/>

큰 상수에 대해 scalar 값으로 대체하고, 이름으로 hash 를 사용합니다. 크기는 이름 길이로 추정합니다.

가능한 값:

- 양의 정수 — 이름의 최대 길이
- 0 — 항상 대체
- 음의 정수 — 절대 대체하지 않음

## optimize_count_from_files \{#optimize_count_from_files\}

<SettingsInfoBlock type="Bool" default_value="1" />

다양한 입력 포맷의 파일에서 행 수를 계산할 때 사용하는 최적화를 활성화하거나 비활성화합니다. 이 설정은 테이블 함수/엔진 `file`/`s3`/`url`/`hdfs`/`azureBlobStorage`에 적용됩니다.

가능한 값:

- 0 — 최적화 비활성화.
- 1 — 최적화 활성화.

## optimize_distinct_in_order \{#optimize_distinct_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

DISTINCT에 사용된 일부 컬럼이 정렬 순서의 접두사(앞부분)를 이루는 경우 DISTINCT 최적화를 활성화합니다. 예를 들어 MergeTree 엔진에서 정렬 키의 접두사가 되거나 ORDER BY 구문에서 정렬 순서의 접두사가 되는 경우입니다.

## optimize_distributed_group_by_sharding_key \{#optimize_distributed_group_by_sharding_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

이 설정은 이니시에이터 서버에서 비용이 많이 드는 집계를 피함으로써 `GROUP BY sharding_key` 쿼리를 최적화합니다. 이로 인해 이니시에이터 서버에서 해당 쿼리가 사용하는 메모리가 줄어듭니다.

다음과 같은 유형의 쿼리(및 이들의 모든 조합)를 지원합니다.

- `SELECT DISTINCT [..., ]sharding_key[, ...] FROM dist`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...]`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] ORDER BY x`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1 BY x`

다음과 같은 유형의 쿼리는 지원하지 않습니다(일부는 추후 지원이 추가될 수 있습니다).

- `SELECT ... GROUP BY sharding_key[, ...] WITH TOTALS`
- `SELECT ... GROUP BY sharding_key[, ...] WITH ROLLUP`
- `SELECT ... GROUP BY sharding_key[, ...] WITH CUBE`
- `SELECT ... GROUP BY sharding_key[, ...] SETTINGS extremes=1`

가능한 값:

- 0 — 비활성화됨.
- 1 — 활성화됨.

함께 보기:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [distributed_push_down_limit](#distributed_push_down_limit)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)

:::note
현재 이 설정은 `optimize_skip_unused_shards`가 활성화되어 있어야 합니다. 이는 이 설정이 언젠가 기본적으로 활성화될 수 있으며, 그 경우 데이터가 Distributed 테이블(즉, 데이터가 sharding_key에 따라 분산됨)을 통해 입력된 경우에만 올바르게 동작하기 때문입니다.
:::

## optimize_dry_run_check_part \{#optimize_dry_run_check_part\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "새 설정입니다."}]}]}/>

이 설정이 활성화되면 `OPTIMIZE ... DRY RUN`은 `checkDataPart`를 사용하여 병합 결과 파트를 검증합니다. 검증에 실패하면 예외가 발생합니다.

## optimize_empty_string_comparisons \{#optimize_empty_string_comparisons\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "새 설정입니다."}]}]}/>

`col = ''` 또는 `'' = col`과 같은 표현을 `empty(col)`로, `col != ''` 또는 `'' != col`을 `notEmpty(col)`로 변환합니다.
단, `col`이 `String` 또는 `FixedString` 타입인 경우에만 적용됩니다.

## optimize_extract_common_expressions \{#optimize_extract_common_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "WHERE, PREWHERE, ON, HAVING 및 QUALIFY 식에서 논리합(disjunction)으로 이루어진 식의 공통 식을 추출하여 최적화합니다."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "WHERE, PREWHERE, ON, HAVING 및 QUALIFY 식에서 논리합(disjunction)으로 이루어진 식의 공통 식을 추출하여 최적화하기 위한 설정을 도입합니다."}]}]}/>

WHERE, PREWHERE, ON, HAVING 및 QUALIFY 식의 논리합(disjunction)으로 이루어진 식에서 공통 식을 추출할 수 있도록 허용합니다. `(A AND B) OR (A AND C)`와 같은 논리식은 `A AND (B OR C)`로 다시 작성할 수 있으며, 이는 다음과 같은 최적화에 도움이 될 수 있습니다:

- 단순 필터링 식에서의 인덱스 활용
- cross 조인을 inner join으로 최적화

## optimize_functions_to_subcolumns \{#optimize_functions_to_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Enabled settings by default"}]}]}/>

일부 함수 호출을 서브컬럼 읽기로 변환하는 최적화를 활성화하거나 비활성화합니다. 이를 통해 읽어야 하는 데이터 양이 줄어듭니다.

다음 함수들이 다음과 같이 변환될 수 있습니다:

- [length](/sql-reference/functions/array-functions#length)를 [size0](../../sql-reference/data-types/array.md/#array-size) 서브컬럼 읽기로 변환합니다.
- [empty](/sql-reference/functions/array-functions#empty)를 [size0](../../sql-reference/data-types/array.md/#array-size) 서브컬럼 읽기로 변환합니다.
- [notEmpty](/sql-reference/functions/array-functions#notEmpty)를 [size0](../../sql-reference/data-types/array.md/#array-size) 서브컬럼 읽기로 변환합니다.
- [isNull](/sql-reference/functions/functions-for-nulls#isNull)을 [null](../../sql-reference/data-types/nullable.md/#finding-null) 서브컬럼 읽기로 변환합니다.
- [isNotNull](/sql-reference/functions/functions-for-nulls#isNotNull)을 [null](../../sql-reference/data-types/nullable.md/#finding-null) 서브컬럼 읽기로 변환합니다.
- [count](/sql-reference/aggregate-functions/reference/count)를 [null](../../sql-reference/data-types/nullable.md/#finding-null) 서브컬럼 읽기로 변환합니다.
- [mapKeys](/sql-reference/functions/tuple-map-functions#mapKeys)를 [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) 서브컬럼 읽기로 변환합니다.
- [mapValues](/sql-reference/functions/tuple-map-functions#mapValues)를 [values](/sql-reference/data-types/map#reading-subcolumns-of-map) 서브컬럼 읽기로 변환합니다.

가능한 값:

- 0 — 최적화를 비활성화합니다.
- 1 — 최적화를 활성화합니다.

## optimize_group_by_constant_keys \{#optimize_group_by_constant_keys\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "기본적으로 상수 키를 사용하는 GROUP BY를 최적화"}]}]}/>

블록 내 모든 키가 상수인 경우 GROUP BY를 최적화합니다

## optimize_group_by_function_keys \{#optimize_group_by_function_keys\}

<SettingsInfoBlock type="Bool" default_value="1" />

GROUP BY 절에서 다른 키에 적용된 함수들을 제거합니다.

## optimize_if_chain_to_multiif \{#optimize_if_chain_to_multiif\}

<SettingsInfoBlock type="Bool" default_value="0" />

if(cond1, then1, if(cond2, ...)) 체인을 multiIf로 변환합니다. 현재는 숫자형 데이터 타입에는 성능상 이점이 없습니다.

## optimize_if_transform_strings_to_enum \{#optimize_if_transform_strings_to_enum\}

<SettingsInfoBlock type="Bool" default_value="0" />

If 및 Transform 함수의 문자열 타입 인자를 enum으로 대체합니다. 분산 쿼리에서 불일치한 변경을 일으켜 실패로 이어질 수 있으므로 기본적으로 비활성화되어 있습니다.

## optimize_injective_functions_in_group_by \{#optimize_injective_functions_in_group_by\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "분석기에서 GROUP BY 절의 단사 함수(injective function)를 해당 함수의 인수로 대체합니다"}]}]}/>

GROUP BY 절에서 단사 함수(injective function)를 해당 함수의 인수로 대체합니다

## optimize_injective_functions_inside_uniq \{#optimize_injective_functions_inside_uniq\}

<SettingsInfoBlock type="Bool" default_value="1" />

uniq*() 함수 내부에서 인자가 하나뿐인 단사 함수(injective function)를 제거합니다.

## optimize_inverse_dictionary_lookup \{#optimize_inverse_dictionary_lookup\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

미리 계산된 가능한 키 값 Set에서 더 빠르게 조회를 수행하여 반복적인 역 딕셔너리 조회를 방지합니다.

## optimize_min_equality_disjunction_chain_length \{#optimize_min_equality_disjunction_chain_length\}

<SettingsInfoBlock type="UInt64" default_value="3" />

`expr = x1 OR ... expr = xN` 형태의 표현식에 최적화를 적용하기 위한 최소 길이입니다.

## optimize_min_inequality_conjunction_chain_length \{#optimize_min_inequality_conjunction_chain_length\}

<SettingsInfoBlock type="UInt64" default_value="3" />

`expr <> x1 AND ... expr <> xN` 형태의 표현식을 최적화하기 위한 최소 길이입니다.

## optimize_move_to_prewhere \{#optimize_move_to_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

[SELECT](../../sql-reference/statements/select/index.md) 쿼리에서 자동 [PREWHERE](../../sql-reference/statements/select/prewhere.md) 최적화를 활성화하거나 비활성화합니다.

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) 테이블에서만 작동합니다.

사용할 수 있는 값:

- 0 — 자동 `PREWHERE` 최적화가 비활성화됩니다.
- 1 — 자동 `PREWHERE` 최적화가 활성화됩니다.

## optimize_move_to_prewhere_if_final \{#optimize_move_to_prewhere_if_final\}

<SettingsInfoBlock type="Bool" default_value="0" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 수정자가 포함된 [SELECT](../../sql-reference/statements/select/index.md) 쿼리에서 자동 [PREWHERE](../../sql-reference/statements/select/prewhere.md) 최적화를 활성화하거나 비활성화합니다.

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) 테이블에서만 작동합니다.

가능한 값:

- 0 — `FINAL` 수정자가 있는 `SELECT` 쿼리에서 자동 `PREWHERE` 최적화가 비활성화됩니다.
- 1 — `FINAL` 수정자가 있는 `SELECT` 쿼리에서 자동 `PREWHERE` 최적화가 활성화됩니다.

**함께 보기**

- [optimize_move_to_prewhere](#optimize_move_to_prewhere) 설정

## optimize_multiif_to_if \{#optimize_multiif_to_if\}

<SettingsInfoBlock type="Bool" default_value="1" />

조건이 하나뿐인 'multiIf'를 'if'로 변환합니다.

## optimize_normalize_count_variants \{#optimize_normalize_count_variants\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "기본적으로 의미상 count()와 동일한 집계 함수는 count()로 자동 변환합니다"}]}]}/>

기본적으로 의미상 count()와 동일한 집계 함수는 count()로 자동 변환합니다.

## optimize_on_insert \{#optimize_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "기본적으로 INSERT 시 데이터 최적화를 활성화하여 더 나은 사용자 경험 제공"}]}]} />

INSERT 전에 테이블 엔진에 따라 이 블록에 대해 merge가 수행된 것처럼 데이터를 변환하도록 설정할지 여부를 제어합니다.

가능한 값은 다음과 같습니다.

* 0 — 비활성화.
* 1 — 활성화.

**예시**

활성화된 경우와 비활성화된 경우의 차이:

쿼리:

```sql
SET optimize_on_insert = 1;

CREATE TABLE test1 (`FirstTable` UInt32) ENGINE = ReplacingMergeTree ORDER BY FirstTable;

INSERT INTO test1 SELECT number % 2 FROM numbers(5);

SELECT * FROM test1;

SET optimize_on_insert = 0;

CREATE TABLE test2 (`SecondTable` UInt32) ENGINE = ReplacingMergeTree ORDER BY SecondTable;

INSERT INTO test2 SELECT number % 2 FROM numbers(5);

SELECT * FROM test2;
```

결과:

```text
┌─FirstTable─┐
│          0 │
│          1 │
└────────────┘

┌─SecondTable─┐
│           0 │
│           0 │
│           0 │
│           1 │
│           1 │
└─────────────┘
```

이 설정은 [Materialized view](/sql-reference/statements/create/view#materialized-view)의 동작에 영향을 미칩니다.


## optimize_or_like_chain \{#optimize_or_like_chain\}

<SettingsInfoBlock type="Bool" default_value="0" />

여러 `OR LIKE`를 `multiMatchAny`로 최적화합니다. 이 최적화는 일부 경우 인덱스 분석을 방해할 수 있으므로 기본값으로 활성화하지 않아야 합니다.

## optimize_qbit_distance_function_reads \{#optimize_qbit_distance_function_reads\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

`QBit` 데이터형에 대한 distance 함수를, 계산에 필요한 컬럼만 저장소에서 읽기만 하는 동일한 함수로 대체합니다.

## optimize_read_in_order \{#optimize_read_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에서 데이터를 읽는 [SELECT](../../sql-reference/statements/select/index.md) 쿼리에서 [ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) 최적화를 활성화합니다.

가능한 값:

- 0 — `ORDER BY` 최적화가 비활성화됩니다.
- 1 — `ORDER BY` 최적화가 활성화됩니다.

**함께 보기**

- [ORDER BY 절](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_redundant_functions_in_order_by \{#optimize_redundant_functions_in_order_by\}

<SettingsInfoBlock type="Bool" default_value="1" />

인자가 그대로 ORDER BY에 포함되어 있는 경우 ORDER BY에서 해당 함수를 제거합니다

## optimize_respect_aliases \{#optimize_respect_aliases\}

<SettingsInfoBlock type="Bool" default_value="1" />

true로 설정하면 WHERE/GROUP BY/ORDER BY 절에서 별칭(alias)을 인식하여 파티션 프루닝(partition pruning), 세컨더리 인덱스(secondary index), optimize_aggregation_in_order, optimize_read_in_order, optimize_trivial_count 최적화에 도움이 됩니다.

## optimize_rewrite_aggregate_function_with_if \{#optimize_rewrite_aggregate_function_with_if\}

<SettingsInfoBlock type="Bool" default_value="1" />

논리적으로 동등한 경우, 인수로 `if` 표현식을 사용하는 집계 함수(aggregate function)를 재작성합니다.
예를 들어 `avg(if(cond, col, null))`는 `avgOrNullIf(cond, col)`로 재작성될 수 있습니다. 이렇게 하면 성능이 향상될 수 있습니다.

:::note
analyzer(`enable_analyzer = 1`)가 활성화된 경우에만 지원됩니다.
:::

## optimize_rewrite_array_exists_to_has \{#optimize_rewrite_array_exists_to_has\}

<SettingsInfoBlock type="Bool" default_value="0" />

논리적으로 동일한 경우 `arrayExists()` 함수를 `has()`로 변환합니다. 예를 들어 `arrayExists(x -> x = 1, arr)`는 `has(arr, 1)`로 변환할 수 있습니다.

## optimize_rewrite_like_perfect_affix \{#optimize_rewrite_like_perfect_affix\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

완전한 접두사 또는 접미사를 사용하는 LIKE 표현식(예: `col LIKE 'ClickHouse%'`)을 `startsWith` 또는 `endsWith` 함수 호출(예: `startsWith(col, 'ClickHouse')`)로 자동 변환합니다.

## optimize_rewrite_regexp_functions \{#optimize_rewrite_regexp_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "A new setting"}]}]}/>

정규 표현식 관련 함수를 더 단순하고 효율적인 형태로 재작성합니다.

## optimize_rewrite_sum_if_to_count_if \{#optimize_rewrite_sum_if_to_count_if\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Only available for the analyzer, where it works correctly"}]}]}/>

논리적으로 동등한 경우 sumIf() 및 sum(if()) 함수를 countIf() 함수로 변환합니다.

## optimize_skip_merged_partitions \{#optimize_skip_merged_partitions\}

<SettingsInfoBlock type="Bool" default_value="0" />

레벨이 0보다 큰 파트가 하나만 존재하고 해당 파트에 만료된 TTL이 없을 때, [OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md) 쿼리에 대한 최적화 기능을 활성화하거나 비활성화합니다.

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

기본적으로 `OPTIMIZE TABLE ... FINAL` 쿼리는 파트가 하나만 있더라도 그 파트를 다시 작성합니다.

가능한 값:

- 1 - 최적화를 활성화합니다.
- 0 - 최적화를 비활성화합니다.

## optimize_skip_unused_shards \{#optimize_skip_unused_shards\}

<SettingsInfoBlock type="Bool" default_value="0" />

`WHERE/PREWHERE`에 샤딩 키 조건이 있는 [SELECT](../../sql-reference/statements/select/index.md) 쿼리에 대해 사용되지 않는 세그먼트를 건너뛰는 기능을 활성화하거나 비활성화하고, 샤딩 키별 집계와 같은 분산 쿼리(분산 쿼리)를 위한 관련 최적화를 활성화합니다.

:::note
데이터가 샤딩 키 기준으로 분산되어 있다고 가정하며, 그렇지 않은 경우 쿼리 결과가 올바르지 않을 수 있습니다.
:::

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## optimize_skip_unused_shards_limit \{#optimize_skip_unused_shards_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

샤딩 키 값 개수의 최대 한도입니다. 이 한도에 도달하면 `optimize_skip_unused_shards`가 자동으로 비활성화됩니다.

값이 너무 많으면 처리에 상당한 리소스가 필요할 수 있으며, 이득은 확실하지 않습니다. `IN (...)`에 매우 많은 값을 사용하는 경우에는, 어차피 대부분의 경우 쿼리가 모든 세그먼트로 전송될 가능성이 높기 때문입니다.

## optimize_skip_unused_shards_nesting \{#optimize_skip_unused_shards_nesting\}

<SettingsInfoBlock type="UInt64" default_value="0" />

분산 쿼리의 중첩 수준(예: 하나의 `Distributed` 테이블이 다른 `Distributed` 테이블을 조회하는 경우)에 따라 [`optimize_skip_unused_shards`](#optimize_skip_unused_shards)의 동작을 제어합니다. 이 설정을 사용하려면 [`optimize_skip_unused_shards`](#optimize_skip_unused_shards)를 활성화해 두어야 합니다.

가능한 값:

- 0 — 비활성화. 이 경우 `optimize_skip_unused_shards`가 항상 동작합니다.
- 1 — 첫 번째 수준에 대해서만 `optimize_skip_unused_shards`를 활성화합니다.
- 2 — 두 번째 수준까지 `optimize_skip_unused_shards`를 활성화합니다.

## optimize_skip_unused_shards_rewrite_in \{#optimize_skip_unused_shards_rewrite_in\}

<SettingsInfoBlock type="Bool" default_value="1" />

원격 세그먼트에 대한 쿼리에서 `IN` 조건을 다시 작성하여 해당 세그먼트에 속하지 않는 값들을 제외합니다 (`optimize_skip_unused_shards` 설정이 필요합니다).

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## optimize_sorting_by_input_stream_properties \{#optimize_sorting_by_input_stream_properties\}

<SettingsInfoBlock type="Bool" default_value="1" />

입력 스트림의 정렬 속성을 기반으로 정렬을 최적화합니다.

## optimize_substitute_columns \{#optimize_substitute_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

컬럼 대체를 위해 [제약 조건(constraints)](../../sql-reference/statements/create/table.md/#constraints)을 사용합니다. 기본값은 `false`입니다.

가능한 값:

- true, false

## optimize_syntax_fuse_functions \{#optimize_syntax_fuse_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

동일한 인수를 가진 집계 함수를 하나로 결합(fuse)하도록 활성화합니다. 쿼리에 동일한 인수를 가진 [sum](/sql-reference/aggregate-functions/reference/sum), [count](/sql-reference/aggregate-functions/reference/count), [avg](/sql-reference/aggregate-functions/reference/avg) 집계 함수가 최소 2개 이상 포함되어 있을 경우, 이를 [sumCount](/sql-reference/aggregate-functions/reference/sumcount)로 재작성합니다.

가능한 값:

* 0 — 동일한 인수를 가진 함수를 결합하지 않습니다.
* 1 — 동일한 인수를 가진 함수를 결합합니다.

**예시**

쿼리:

```sql
CREATE TABLE fuse_tbl(a Int8, b Int8) Engine = Log;
SET optimize_syntax_fuse_functions = 1;
EXPLAIN SYNTAX run_query_tree_passes = 1 SELECT sum(a), sum(b), count(b), avg(b) from fuse_tbl FORMAT TSV;
```

결과:

```text
SELECT
    sum(__table1.a) AS `sum(a)`,
    tupleElement(sumCount(__table1.b), 1) AS `sum(b)`,
    tupleElement(sumCount(__table1.b), 2) AS `count(b)`,
    divide(tupleElement(sumCount(__table1.b), 1), toFloat64(tupleElement(sumCount(__table1.b), 2))) AS `avg(b)`
FROM default.fuse_tbl AS __table1
```


## optimize_throw_if_noop \{#optimize_throw_if_noop\}

<SettingsInfoBlock type="Bool" default_value="0" />

[OPTIMIZE](../../sql-reference/statements/optimize.md) 쿼리가 머지를 수행하지 않았을 때 예외를 발생시킬지 여부를 설정합니다.

기본적으로 `OPTIMIZE`는 아무 작업도 수행하지 않았더라도 성공으로 처리됩니다. 이 설정을 사용하면 이러한 상황을 구분하고, 예외 메시지를 통해 그 이유를 확인할 수 있습니다.

가능한 값:

- 1 — 예외를 발생시킵니다.
- 0 — 예외를 발생시키지 않습니다.

## optimize_time_filter_with_preimage \{#optimize_time_filter_with_preimage\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "형 변환 없이 함수 호출을 동등한 비교 연산으로 변환하여 Date 및 DateTime 술어를 최적화합니다 (예: toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31')"}]}]}/>

형 변환 없이 함수 호출을 동등한 비교 연산으로 변환하여 Date 및 DateTime 술어를 최적화합니다 (예: `toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`)

## optimize_trivial_approximate_count_query \{#optimize_trivial_approximate_count_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

EmbeddedRocksDB와 같이 이러한 추정 기능을 지원하는 스토리지에서 단순 COUNT 최적화를 위해 근사값을 사용합니다.

가능한 값:

- 0 — 최적화 비활성화.
   - 1 — 최적화 활성화.

## optimize_trivial_count_query \{#optimize_trivial_count_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree 메타데이터를 사용하여 `SELECT count() FROM table`과 같은 단순 카운트 쿼리를 최적화할지 여부를 활성화하거나 비활성화합니다. 행 수준 보안(row-level security)을 사용해야 하는 경우 이 설정을 비활성화해야 합니다.

가능한 값:

- 0 — 최적화를 비활성화합니다.
   - 1 — 최적화를 활성화합니다.

함께 보기:

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select \{#optimize_trivial_insert_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "이 최적화는 많은 경우에 유의미하지 않습니다."}]}]}/>

단순한 'INSERT INTO table SELECT ... FROM TABLES' 쿼리를 최적화합니다.

## optimize_uniq_to_count \{#optimize_uniq_to_count\}

<SettingsInfoBlock type="Bool" default_value="1" />

서브쿼리에 DISTINCT 또는 GROUP BY 절이 있는 경우, uniq 및 그 변형(uniqUpTo 제외)을 count로 자동 변환합니다.

## optimize_use_implicit_projections \{#optimize_use_implicit_projections\}

<SettingsInfoBlock type="Bool" default_value="1" />

SELECT 쿼리를 실행할 때 사용할 암시적 프로젝션을 자동으로 선택합니다

## optimize_use_projection_filtering \{#optimize_use_projection_filtering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "New setting"}]}]}/>

프로젝션이 SELECT 쿼리 수행에 선택되지 않은 경우에도 프로젝션을 사용해 파트 범위를 필터링하도록 활성화합니다.

## optimize_use_projections \{#optimize_use_projections\}

**별칭(Aliases)**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

`SELECT` 쿼리를 처리할 때 [프로젝션](../../engines/table-engines/mergetree-family/mergetree.md/#projections) 최적화를 활성화하거나 비활성화합니다.

가능한 값은 다음과 같습니다.

- 0 — 프로젝션 최적화를 비활성화합니다.
- 1 — 프로젝션 최적화를 활성화합니다.

## optimize_using_constraints \{#optimize_using_constraints\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리 최적화를 위해 [제약 조건](../../sql-reference/statements/create/table.md/#constraints)을 사용합니다. 기본값은 `false`입니다.

설정 가능한 값:

- true, false

## os_threads_nice_value_materialized_view \{#os_threads_nice_value_materialized_view\}

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

materialized view 스레드용 Linux nice 값입니다. 값이 낮을수록 CPU 우선순위가 높아집니다.

CAP_SYS_NICE capability가 필요하며, 없으면 아무 효과도 없습니다.

가능한 값: -20부터 19까지입니다.

## os_threads_nice_value_query \{#os_threads_nice_value_query\}

**별칭**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "새 설정."}]}]}/>

쿼리 처리 스레드에 대한 Linux nice 값입니다. 값이 낮을수록 CPU 우선순위가 높아집니다.

CAP_SYS_NICE 권한이 필요하며, 그렇지 않으면 아무 효과도 없습니다.

가능한 값: -20부터 19까지입니다.

## page_cache_block_size \{#page_cache_block_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "이 설정을 쿼리 단위로 조정할 수 있도록 변경했습니다."}]}]}/>

userspace 페이지 캐시에 저장할 파일 청크의 크기(바이트)입니다. 캐시를 거치는 모든 읽기는 이 크기의 배수에 맞춰집니다.

이 설정은 쿼리 단위로 조정할 수 있지만, 서로 다른 블록 크기를 사용하는 캐시 엔트리는 재사용할 수 없습니다. 이 설정을 변경하면 사실상 캐시에 존재하는 엔트리가 무효화됩니다.

1 MiB와 같은 더 큰 값은 고 처리량 쿼리에 적합하며, 64 KiB와 같은 더 작은 값은 저지연 포인트 쿼리에 적합합니다.

## page_cache_inject_eviction \{#page_cache_inject_eviction\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "사용자 공간 페이지 캐시 추가"}]}]}/>

사용자 공간 페이지 캐시는 때때로 임의의 페이지를 무효화합니다. 테스트용 설정입니다.

## page_cache_lookahead_blocks \{#page_cache_lookahead_blocks\}

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "이 설정을 쿼리 단위로 조정 가능하도록 변경했습니다."}]}]}/>

userspace 페이지 캐시에서 miss가 발생하면, 캐시에 없는 경우에 한해 하위 스토리지에서 최대 이 설정값에 해당하는 개수만큼의 연속된 블록을 한 번에 읽습니다. 각 블록의 크기는 page_cache_block_size 바이트입니다.

값이 클수록 고처리량 쿼리에 유리하며, 저지연 포인트 쿼리는 리드어헤드(readahead) 없이 더 잘 동작합니다.

## parallel_distributed_insert_select \{#parallel_distributed_insert_select\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "Enable parallel distributed insert select by default"}]}]}/>

병렬 분산 `INSERT ... SELECT` 쿼리를 활성화합니다.

`INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b` 쿼리를 실행할 때 두 테이블이 동일한 클러스터를 사용하고, 두 테이블이 모두 [복제된(replicated)](../../engines/table-engines/mergetree-family/replication.md) 테이블이거나 모두 비복제 테이블인 경우, 이 쿼리는 각 세그먼트에서 로컬로 처리됩니다.

가능한 값:

- `0` — 비활성화합니다.
- `1` — `SELECT`가 분산 엔진의 기반 테이블에서 각 세그먼트별로 실행됩니다.
- `2` — `SELECT`와 `INSERT`가 분산 엔진의 기반 테이블에서/로 각 세그먼트별로 실행됩니다.

이 설정을 사용할 때는 `enable_parallel_replicas = 1`로 설정해야 합니다.

## parallel_hash_join_threshold \{#parallel_hash_join_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

해시 기반 조인 알고리즘이 적용될 때 이 임계값은 `hash`와 `parallel_hash` 중 어느 것을 사용할지 결정하는 데 사용됩니다(오른쪽 테이블 크기를 추정할 수 있는 경우에만 해당합니다).
오른쪽 테이블 크기가 이 임계값 미만이라는 것을 알고 있는 경우에는 `hash`를 사용합니다.

## parallel_non_joined_rows_processing \{#parallel_non_joined_rows_processing\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "RIGHT/FULL parallel_hash 조인에서 조인되지 않은 행을 병렬로 처리할 수 있도록 하는 새로운 설정입니다."}]}]}/>

RIGHT 및 FULL JOIN에서 오른쪽 테이블의 조인되지 않은 행을 여러 스레드가 병렬로 처리하도록 허용합니다.
이는 대용량 테이블에서 `parallel_hash` 조인 알고리즘을 사용할 때 비조인 단계의 처리를 가속할 수 있습니다.
비활성화하면 조인되지 않은 행은 단일 스레드에서 처리됩니다.

## parallel_replica_offset \{#parallel_replica_offset\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

이 설정은 직접 사용하지 않는 내부 설정으로, 'parallel replicas' 모드의 구현 세부를 나타냅니다. 이 설정은 분산 쿼리 실행 시 병렬 레플리카들 중 쿼리 처리에 참여하는 레플리카의 인덱스에 대해 이니시에이터 서버에 의해 자동으로 설정됩니다.

## parallel_replicas_allow_in_with_subquery \{#parallel_replicas_allow_in_with_subquery\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "true인 경우 IN 절의 서브쿼리가 모든 follower 레플리카에서 실행됩니다"}]}]}/>

true인 경우 IN 절의 서브쿼리가 모든 follower 레플리카에서 실행됩니다.

## parallel_replicas_allow_materialized_views \{#parallel_replicas_allow_materialized_views\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "병렬 레플리카와 함께 materialized view 사용 허용"}]}]}/>

병렬 레플리카와 함께 materialized view 사용을 허용합니다

## parallel_replicas_connect_timeout_ms \{#parallel_replicas_connect_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "Separate connection timeout for parallel replicas queries"}]}]}/>

병렬 레플리카를 사용하여 쿼리를 실행할 때 원격 레플리카에 연결하는 데 사용하는 시간 제한(밀리초)입니다. 이 시간 제한을 초과하면 해당 레플리카는 쿼리 실행에 사용되지 않습니다.

## parallel_replicas_count \{#parallel_replicas_count\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

이 설정은 직접 사용해서는 안 되는 내부용 설정으로, 'parallel replicas(병렬 레플리카)' 모드의 구현 세부 사항을 나타냅니다. 이 설정은 분산 쿼리에서 쿼리 처리에 참여하는 병렬 레플리카 수로, 쿼리를 시작한 서버에 의해 자동으로 설정됩니다.

## parallel_replicas_custom_key \{#parallel_replicas_custom_key\}

<BetaBadge/>

특정 테이블에 대해 레플리카 간에 작업을 분할하는 데 사용할 수 있는 임의의 정수형 표현식입니다.
값은 어떤 정수형 표현식이든 될 수 있습니다.

기본 키를 사용하는 단순한 표현식을 사용하는 것이 좋습니다.

이 SETTING이 여러 레플리카를 가진 단일 세그먼트로 구성된 클러스터에서 사용되면, 해당 레플리카는 가상 세그먼트로 변환됩니다.
그렇지 않은 경우에는 `SAMPLE` 키와 동일하게 동작하며, 각 세그먼트의 여러 레플리카를 사용합니다.

## parallel_replicas_custom_key_range_lower \{#parallel_replicas_custom_key_range_lower\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Add settings to control the range filter when using parallel replicas with dynamic shards"}]}]}/>

`range` 필터 유형이 사용자 지정 범위 `[parallel_replicas_custom_key_range_lower, INT_MAX]`를 기준으로 레플리카 간 작업을 균등하게 분할할 수 있도록 합니다.

[parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper)와 함께 사용하면, 범위 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]`에 대해 필터가 레플리카 간 작업을 균등하게 분할할 수 있도록 합니다.

참고: 이 설정은 쿼리 처리 중에 추가로 더 많은 데이터가 필터링되도록 하지는 않으며, 대신 병렬 처리를 위해 범위 필터가 범위 `[0, INT_MAX]`를 분할하는 지점을 변경합니다.

## parallel_replicas_custom_key_range_upper \{#parallel_replicas_custom_key_range_upper\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "동적 세그먼트와 함께 병렬 레플리카를 사용할 때 범위 필터를 제어하는 설정을 추가합니다. 값이 0이면 상한이 비활성화됩니다"}]}]}/>

필터 유형 `range`가 사용자 지정 범위 `[0, parallel_replicas_custom_key_range_upper]`를 기준으로 레플리카 간 작업을 균등하게 분할하도록 합니다. 값이 0이면 상한이 비활성화되며, 사용자 지정 키 표현식의 최대값으로 설정됩니다.

[parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower)와 함께 사용하면, 범위 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]`에 대해 필터가 레플리카 간 작업을 균등하게 분할하도록 할 수 있습니다.

참고: 이 설정은 쿼리 처리 중 추가적인 데이터가 필터링되도록 만들지 않으며, 대신 병렬 처리를 위해 범위 필터가 범위 `[0, INT_MAX]`를 분할하는 지점을 변경합니다.

## parallel_replicas_filter_pushdown \{#parallel_replicas_filter_pushdown\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "0"},{"label": "New setting"}]}]}/>

병렬 레플리카가 실행하도록 선택한 쿼리의 일부에 필터를 푸시다운하도록 허용합니다

## parallel_replicas_for_cluster_engines \{#parallel_replicas_for_cluster_engines\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "New setting."}]}]}/>

테이블 함수 엔진을 해당하는 -Cluster 버전으로 대체합니다

## parallel_replicas_for_non_replicated_merge_tree \{#parallel_replicas_for_non_replicated_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

true인 경우 ClickHouse는 복제되지 않은 MergeTree 테이블에도 parallel replicas 알고리즘을 사용합니다.

## parallel_replicas_index_analysis_only_on_coordinator \{#parallel_replicas_index_analysis_only_on_coordinator\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "인덱스 분석은 replica-coordinator에서만 수행되고 다른 레플리카에서는 건너뜁니다. parallel_replicas_local_plan이 활성화된 경우에만 적용됩니다."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "인덱스 분석은 replica-coordinator에서만 수행되고 다른 레플리카에서는 건너뜁니다. parallel_replicas_local_plan이 활성화된 경우에만 적용됩니다."}]}]}/>

인덱스 분석은 replica-coordinator에서만 수행되고 다른 레플리카에서는 건너뜁니다. parallel_replicas_local_plan이 활성화된 경우에만 적용됩니다.

## parallel_replicas_insert_select_local_pipeline \{#parallel_replicas_insert_select_local_pipeline\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "병렬 레플리카를 사용하는 분산 INSERT SELECT 작업에서 로컬 파이프라인을 사용합니다. 현재는 성능 문제로 인해 비활성화되어 있습니다"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "병렬 레플리카를 사용하는 분산 INSERT SELECT 작업에서 로컬 파이프라인을 사용합니다. 현재는 성능 문제로 인해 비활성화되어 있습니다"}]}]}/>

병렬 레플리카를 사용하는 분산 INSERT SELECT 작업에서 로컬 파이프라인을 사용합니다

## parallel_replicas_local_plan \{#parallel_replicas_local_plan\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "병렬 레플리카를 사용하는 쿼리에서 로컬 레플리카에 로컬 플랜 사용"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "병렬 레플리카를 사용하는 쿼리에서 로컬 레플리카에 로컬 플랜 사용"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "병렬 레플리카를 사용하는 쿼리에서 로컬 레플리카에 로컬 플랜 사용"}]}]}/>

로컬 레플리카용 로컬 플랜을 생성합니다

## parallel_replicas_mark_segment_size \{#parallel_replicas_mark_segment_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "이 설정 값은 이제 자동으로 결정됩니다"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "새로운 parallel replicas coordinator 구현에서 세그먼트 크기를 제어하기 위한 새로운 설정이 추가되었습니다"}]}]}/>

파트는 레플리카 간 병렬 읽기를 위해 세그먼트로 가상 분할됩니다. 이 설정은 이러한 세그먼트의 크기를 제어합니다. 동작을 완전히 이해하지 못한 경우 변경하지 않는 것이 좋습니다. 값은 [128; 16384] 범위여야 합니다.

## parallel_replicas_min_number_of_rows_per_replica \{#parallel_replicas_min_number_of_rows_per_replica\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쿼리에 사용되는 레플리카 수를 (읽을 것으로 추정되는 행 수 / 「min_number_of_rows_per_replica」)로 제한합니다. 최대값은 여전히 「max_parallel_replicas」에 의해 제한됩니다.

## parallel_replicas_mode \{#parallel_replicas_mode\}

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "이 설정은 병렬 레플리카 기능을 Beta로 제공하기 위해 도입되었습니다"}]}]}/>

병렬 레플리카에서 커스텀 키와 함께 사용할 필터 유형을 지정합니다. default - 커스텀 키에 대해 모듈로 연산을 사용합니다. range - 커스텀 키의 값 타입이 가질 수 있는 모든 값을 사용하여 커스텀 키에 범위 필터를 적용합니다.

## parallel_replicas_only_with_analyzer \{#parallel_replicas_only_with_analyzer\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Parallel replicas is supported only with analyzer enabled"}]}]}/>

parallel replicas를 사용하려면 analyzer가 활성화되어 있어야 합니다. analyzer가 비활성화된 경우 parallel replicas에서의 병렬 읽기가 활성화되어 있더라도 쿼리 실행은 로컬 실행으로 되돌아갑니다. analyzer가 활성화되지 않은 상태에서 parallel replicas를 사용하는 것은 지원되지 않습니다.

## parallel_replicas_prefer_local_join \{#parallel_replicas_prefer_local_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "설정 값이 true이고 JOIN을 parallel replicas 알고리즘으로 실행할 수 있으며, 오른쪽 JOIN 부분의 모든 스토리지가 *MergeTree인 경우 GLOBAL JOIN 대신 local JOIN이 사용됩니다."}]}]}/>

설정 값이 true이고 JOIN을 parallel replicas 알고리즘으로 실행할 수 있으며, 오른쪽 JOIN 부분의 모든 스토리지가 *MergeTree인 경우 GLOBAL JOIN 대신 local JOIN이 사용됩니다.

## parallel_replicas_support_projection \{#parallel_replicas_support_projection\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "새로운 설정입니다. 프로젝션 최적화를 병렬 레플리카에서 적용할 수 있습니다. parallel_replicas_local_plan이 활성화되어 있고 aggregation_in_order가 비활성화된 경우에만 효과가 있습니다."}]}]}/>

프로젝션 최적화를 병렬 레플리카에서 적용할 수 있습니다. parallel_replicas_local_plan이 활성화되어 있고 aggregation_in_order가 비활성화된 경우에만 효과가 있습니다.

## parallel_view_processing \{#parallel_view_processing\}

<SettingsInfoBlock type="Bool" default_value="0" />

연결된 뷰로의 데이터 전송을 순차적으로가 아니라 동시에(병렬로) 수행하도록 설정합니다.

## parallelize_output_from_storages \{#parallelize_output_from_storages\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "file/url/S3 등에서 데이터를 읽는 쿼리를 실행할 때 병렬 처리를 허용합니다. 이로 인해 행의 순서가 변경될 수 있습니다."}]}]}/>

스토리지에서 데이터를 읽는 단계의 출력을 병렬화합니다. 가능하면 스토리지에서 데이터를 읽은 직후 쿼리 처리를 병렬화할 수 있도록 합니다.

## parsedatetime_e_requires_space_padding \{#parsedatetime_e_requires_space_padding\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "MySQL DATE_FORMAT/STR_TO_DATE와의 호환성 개선"}]}]}/>

함수 'parseDateTime'에서 서식 지정자 '%e'는 한 자리 일(day) 값이 앞에 공백으로 채워져 있어야 합니다. 예를 들어 ' 2'는 허용되지만 '2'는 오류가 발생합니다.

## parsedatetime_parse_without_leading_zeros \{#parsedatetime_parse_without_leading_zeros\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "MySQL DATE_FORMAT/STR_TO_DATE와의 호환성 개선"}]}]}/>

함수 `parseDateTime`에서 포맷터 `%c`, `%l`, `%k`는 앞에 0을 붙이지 않은 월과 시간을 파싱합니다.

## partial_merge_join_left_table_buffer_bytes \{#partial_merge_join_left_table_buffer_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0이 아닌 경우 partial merge join에서 왼쪽 테이블의 블록들을 더 큰 블록으로 묶습니다. 각 조인 스레드마다 지정한 메모리의 최대 2배까지 사용합니다.

## partial_merge_join_rows_in_right_blocks \{#partial_merge_join_rows_in_right_blocks\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

부분 병합 조인 알고리즘을 사용하는 [JOIN](../../sql-reference/statements/select/join.md) 쿼리에서 조인 오른쪽(우측) 데이터 블록의 크기를 제한합니다.

ClickHouse 서버는 다음을 수행합니다.

1.  오른쪽 조인 데이터를 지정된 행 수 이내를 포함하는 블록으로 분할합니다.
2.  각 블록을 해당 최소값과 최대값으로 인덱싱합니다.
3.  가능한 경우 준비된 블록을 디스크로 내보냅니다.

가능한 값:

- 양의 정수. 권장 범위: \[1000, 100000\].

## partial_result_on_first_cancel \{#partial_result_on_first_cancel\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리가 취소된 후에도 부분 결과를 반환할 수 있도록 허용합니다.

## parts_to_delay_insert \{#parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

대상 테이블의 단일 파티션에 활성 파트가 이 수 이상 존재하는 경우, 테이블에 대한 INSERT를 인위적으로 지연합니다.

## parts_to_throw_insert \{#parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

대상 테이블의 단일 파티션에서 활성 파트의 수가 이 값보다 많으면 'Too many parts ...' 예외가 발생합니다.

## per_part_index_stats \{#per_part_index_stats\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "새 설정입니다."}]}]}/>

각 파트별 인덱스 통계를 로그에 기록합니다.

## poll_interval \{#poll_interval\}

<SettingsInfoBlock type="UInt64" default_value="10" />

서버의 쿼리 대기 루프를 지정된 초 동안 블로킹합니다.

## postgresql_connection_attempt_timeout \{#postgresql_connection_attempt_timeout\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL 연결의 'connect_timeout' 매개변수를 제어할 수 있도록 합니다."}]}]}/>

PostgreSQL 엔드포인트에 대한 단일 연결 시도에 적용되는 연결 타임아웃(초)입니다.
이 값은 연결 URL의 `connect_timeout` 매개변수로 전달됩니다.

## postgresql_connection_pool_auto_close_connection \{#postgresql_connection_pool_auto_close_connection\}

<SettingsInfoBlock type="Bool" default_value="0" />

연결을 풀에 반환하기 전에 연결을 닫습니다.

## postgresql_connection_pool_retries \{#postgresql_connection_pool_retries\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL 연결 풀에서 재시도 횟수를 제어할 수 있도록 합니다."}]}]}/>

PostgreSQL 테이블 엔진과 데이터베이스 엔진에서 사용되는 연결 풀 push/pop 시 재시도 횟수입니다.

## postgresql_connection_pool_size \{#postgresql_connection_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

PostgreSQL 테이블 엔진과 데이터베이스 엔진에서 사용하는 커넥션 풀의 크기입니다.

## postgresql_connection_pool_wait_timeout \{#postgresql_connection_pool_wait_timeout\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

PostgreSQL 테이블 엔진과 데이터베이스 엔진에서, 연결 풀(connection pool)에 항목이 없을 때 push/pop 작업에 적용되는 대기 타임아웃입니다. 기본적으로 풀이 비어 있으면 요청이 대기 상태가 됩니다.

## postgresql_fault_injection_probability \{#postgresql_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

PostgreSQL 복제용 내부 쿼리에 장애를 주입할 대략적인 확률입니다. 유효한 값 범위는 [0.0f, 1.0f]입니다.

## prefer_column_name_to_alias \{#prefer_column_name_to_alias\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리 표현식과 절에서 별칭(alias) 대신 원래 컬럼 이름을 사용할지 여부를 제어합니다. 특히 별칭이 컬럼 이름과 동일한 경우에 중요합니다. 자세한 내용은 [Expression Aliases](/sql-reference/syntax#notes-on-usage)를 참조하십시오. 이 설정을 활성화하면 ClickHouse의 별칭 구문 규칙이 대부분의 다른 데이터베이스 엔진과 더 잘 호환되도록 할 수 있습니다.

가능한 값:

* 0 — 컬럼 이름이 별칭으로 대체됩니다.
* 1 — 컬럼 이름이 별칭으로 대체되지 않습니다.

**예시**

설정 활성화/비활성화에 따른 차이:

쿼리:

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

결과:

```text
Received exception from server (version 21.5.1):
Code: 184. DB::Exception: Received from localhost:9000. DB::Exception: Aggregate function avg(number) is found inside another aggregate function in query: While processing avg(number) AS number.
```

쿼리:

```sql
SET prefer_column_name_to_alias = 1;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

결과:

```text
┌─number─┬─max(number)─┐
│    4.5 │           9 │
└────────┴─────────────┘
```


## prefer_external_sort_block_bytes \{#prefer_external_sort_block_bytes\}

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "외부 정렬 시 최대 블록 크기를 우선적으로 사용하여 병합(merge) 중 메모리 사용량을 줄입니다."}]}]}/>

외부 정렬 시 최대 블록 크기를 우선적으로 사용하여 병합(merge) 중 메모리 사용량을 줄입니다.

## prefer_global_in_and_join \{#prefer_global_in_and_join\}

<SettingsInfoBlock type="Bool" default_value="0" />

`IN`/`JOIN` 연산자를 `GLOBAL IN`/`GLOBAL JOIN`으로 대체하도록 활성화합니다.

가능한 값:

- 0 — 비활성화. `IN`/`JOIN` 연산자가 `GLOBAL IN`/`GLOBAL JOIN`으로 대체되지 않습니다.
- 1 — 활성화. `IN`/`JOIN` 연산자가 `GLOBAL IN`/`GLOBAL JOIN`으로 대체됩니다.

**사용**

`SET distributed_product_mode=global`은 분산 테이블에 대한 쿼리의 동작을 변경할 수 있지만, 로컬 테이블이나 외부 리소스의 테이블에는 적합하지 않습니다. 이때 `prefer_global_in_and_join` 설정을 사용합니다.

예를 들어, 분산에 적합하지 않은 로컬 테이블을 포함하는 쿼리 처리 노드들이 있다고 가정합니다. 이러한 로컬 테이블의 데이터를 `GLOBAL` 키워드 — `GLOBAL IN`/`GLOBAL JOIN`을 사용하여 분산 처리 중에 온디맨드로 분산해야 합니다.

`prefer_global_in_and_join`의 또 다른 사용 사례는 외부 엔진으로 생성된 테이블에 접근하는 것입니다. 이 설정은 이러한 테이블을 조인할 때 외부 소스에 대한 호출 횟수를 줄이는 데 도움이 되며, 쿼리당 한 번만 호출되도록 합니다.

**함께 보기:**

- `GLOBAL IN`/`GLOBAL JOIN` 사용 방법에 대한 자세한 내용은 [분산 서브쿼리](/sql-reference/operators/in#distributed-subqueries)를 참고하십시오.

## prefer_localhost_replica \{#prefer_localhost_replica\}

<SettingsInfoBlock type="Bool" default_value="1" />

분산 쿼리를 처리할 때 localhost 레플리카를 우선적으로 사용할지 여부를 활성화/비활성화합니다.

가능한 값:

- 1 — localhost 레플리카가 존재하면 ClickHouse가 항상 해당 레플리카로 쿼리를 전송합니다.
- 0 — ClickHouse가 [load_balancing](#load_balancing) 설정에 지정된 로드 밸런싱 전략을 사용합니다.

:::note
[parallel_replicas_custom_key](#parallel_replicas_custom_key) 없이 [max_parallel_replicas](#max_parallel_replicas)를 사용하는 경우 이 설정을 비활성화하십시오.
[parallel_replicas_custom_key](#parallel_replicas_custom_key)가 설정된 경우, 여러 세그먼트와 여러 레플리카를 포함하는 클러스터에서 사용하는 경우에만 이 설정을 비활성화하십시오.
하나의 세그먼트와 여러 레플리카만 있는 클러스터에서 사용하는 경우, 이 설정을 비활성화하면 부정적인 영향이 있습니다.
:::

## prefer_warmed_unmerged_parts_seconds \{#prefer_warmed_unmerged_parts_seconds\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud에서만 적용됩니다. 머지된 파트가 생성된 후 이 설정 값(초)보다 시간이 덜 지났고, 사전 워밍(pre-warm)되어 있지 않지만([cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) 참조), 그 머지의 소스가 된 모든 파트가 사용 가능하며 사전 워밍되어 있는 경우 `SELECT` 쿼리는 대신 해당 소스 파트들에서 읽습니다. ReplicatedMergeTree/SharedMergeTree에만 적용됩니다. 이 설정은 CacheWarmer가 해당 파트를 처리했는지만 확인합니다. 파트가 다른 메커니즘에 의해 캐시에 적재되었더라도 CacheWarmer가 처리하기 전까지는 여전히 「콜드(cold)」 상태로 간주됩니다. 또한 한 번 워밍된 후 캐시에서 제거(evict)되었더라도 CacheWarmer 기준으로는 여전히 「웜(warm)」 상태로 간주됩니다.

## preferred_block_size_bytes \{#preferred_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

이 설정은 쿼리 처리에 사용되는 데이터 블록 크기를 조정하는 것으로, 보다 거친 'max_block_size' 설정을 추가로 세밀하게 튜닝하는 역할을 합니다. 컬럼이 크고 'max_block_size' 행을 사용할 때 블록 크기가 지정된 바이트 수를 초과할 것으로 예상되면, 더 나은 CPU 캐시 지역성을 위해 이 크기가 줄어듭니다.

## preferred_max_column_in_block_size_bytes \{#preferred_max_column_in_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

데이터를 읽을 때 블록 내 단일 컬럼이 가질 수 있는 최대 크기에 대한 제한입니다. 캐시 미스 횟수를 줄이는 데 도움이 됩니다. L2 캐시 크기에 가깝게 설정하는 것이 좋습니다.

## preferred_optimize_projection_name \{#preferred_optimize_projection_name\}

비어 있지 않은 문자열로 설정하면 ClickHouse에서 쿼리를 실행할 때 지정된 프로젝션(projection)을 사용하려고 시도합니다.

가능한 값:

- 문자열: 선호하는 프로젝션(projection)의 이름

## prefetch_buffer_size \{#prefetch_buffer_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

파일 시스템에서 데이터를 읽을 때 사용할 prefetch 버퍼의 최대 크기입니다.

## print_pretty_type_names \{#print_pretty_type_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "더 나은 사용자 경험."}]}]} />

`DESCRIBE` 쿼리와 `toTypeName()` 함수에서 들여쓰기를 사용하여 깊이 중첩된 타입 이름을 가독성 좋게 출력할 수 있습니다.

예:

```sql
CREATE TABLE test (a Tuple(b String, c Tuple(d Nullable(UInt64), e Array(UInt32), f Array(Tuple(g String, h Map(String, Array(Tuple(i String, j UInt64))))), k Date), l Nullable(String))) ENGINE=Memory;
DESCRIBE TABLE test FORMAT TSVRaw SETTINGS print_pretty_type_names=1;
```

```
a   Tuple(
    b String,
    c Tuple(
        d Nullable(UInt64),
        e Array(UInt32),
        f Array(Tuple(
            g String,
            h Map(
                String,
                Array(Tuple(
                    i String,
                    j UInt64
                ))
            )
        )),
        k Date
    ),
    l Nullable(String)
)
```


## priority \{#priority\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쿼리의 우선순위입니다. 1은 가장 높고, 숫자가 커질수록 우선순위가 낮아집니다. 0은 우선순위를 사용하지 않음을 의미합니다.

## promql_database \{#promql_database\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "새 실험적 설정"}]}]}/>

「promql」 방언에서 사용하는 데이터베이스 이름을 지정합니다. 빈 문자열이면 현재 데이터베이스를 의미합니다.

## promql_evaluation_time \{#promql_evaluation_time\}

<ExperimentalBadge/>

**별칭**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "설정 이름이 변경되었습니다. 이전 이름은 `evaluation_time`입니다."}]}]}/>

PromQL dialect에서 사용할 평가 시점을 설정합니다. `auto` 값은 현재 시간을 의미합니다.

## promql_table \{#promql_table\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "새로운 실험적 설정"}]}]}/>

「promql」 방언에서 사용되는 TimeSeries 테이블의 이름을 지정합니다.

## push_external_roles_in_interserver_queries \{#push_external_roles_in_interserver_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting."}]}]}/>

쿼리를 수행하는 동안 쿼리를 시작한 노드에서 다른 노드로 사용자 역할을 전달하도록 활성화합니다.

## query_cache_compress_entries \{#query_cache_compress_entries\}

<SettingsInfoBlock type="Bool" default_value="1" />

[쿼리 캐시](../query-cache.md)의 항목을 압축합니다. 쿼리 캐시의 메모리 사용량을 줄이는 대신, 캐시에 항목을 삽입하거나 캐시에서 읽는 작업이 더 느려집니다.

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_cache_max_entries \{#query_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

현재 사용자가 [쿼리 캐시](../query-cache.md)에 저장할 수 있는 쿼리 결과의 최대 개수입니다. 0이면 무제한을 의미합니다.

가능한 값:

- 0 이상의 정수.

## query_cache_max_size_in_bytes \{#query_cache_max_size_in_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

현재 사용자가 [쿼리 캐시](../query-cache.md)에 할당할 수 있는 최대 메모리 크기(바이트 단위)입니다. 0은 무제한을 의미합니다.

가능한 값:

- 0 이상의 정수.

## query_cache_min_query_duration \{#query_cache_min_query_duration\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

쿼리 결과를 [쿼리 캐시](../query-cache.md)에 저장하기 위해 쿼리가 실행되어야 하는 최소 실행 시간(밀리초)입니다.

가능한 값:

- 0 이상인 정수.

## query_cache_min_query_runs \{#query_cache_min_query_runs\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`SELECT` 쿼리 결과가 [쿼리 캐시](../query-cache.md)에 저장되기 전에 해당 쿼리가 실행되어야 하는 최소 횟수입니다.

가능한 값:

- 0 이상인 정수.

## query_cache_nondeterministic_function_handling \{#query_cache_nondeterministic_function_handling\}

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

비결정적 함수(예: `rand()`, `now()`)를 포함하는 `SELECT` 쿼리를 [쿼리 캐시](../query-cache.md)가 어떻게 처리할지 제어합니다.

가능한 값:

- `'throw'` - 예외를 발생시키고 쿼리 결과를 캐시하지 않습니다.
- `'save'` - 쿼리 결과를 캐시합니다.
- `'ignore'` - 쿼리 결과를 캐시하지 않고 예외도 발생시키지 않습니다.

## query_cache_share_between_users \{#query_cache_share_between_users\}

<SettingsInfoBlock type="Bool" default_value="0" />

활성화된 경우 [쿼리 캐시](../query-cache.md)에 저장된 `SELECT` 쿼리 결과를 다른 사용자도 읽을 수 있습니다.
보안상의 이유로 이 설정을 활성화하지 않을 것을 권장합니다.

가능한 값:

- 0 - 비활성화됨
- 1 - 활성화됨

## query_cache_squash_partial_results \{#query_cache_squash_partial_results\}

<SettingsInfoBlock type="Bool" default_value="1" />

부분 결과 블록을 [max_block_size](#max_block_size) 크기의 블록으로 합칩니다. 이 설정을 사용하면 [쿼리 캐시](../query-cache.md)로의 INSERT 성능은 저하되지만, 캐시 엔트리의 압축 효율은 향상됩니다([query_cache_compress-entries](#query_cache_compress_entries) 참조).

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_cache_system_table_handling \{#query_cache_system_table_handling\}

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "쿼리 캐시는 더 이상 system 테이블에 대한 쿼리 결과를 캐시하지 않습니다"}]}]}/>

[쿼리 캐시](../query-cache.md)가 `system.*` 및 `information_schema.*` 데이터베이스의 테이블과 같은 시스템 테이블에 대한 `SELECT` 쿼리를 어떻게 처리할지 제어합니다.

가능한 값:

- `'throw'` - 예외를 발생시키고 쿼리 결과를 캐시하지 않습니다.
- `'save'` - 쿼리 결과를 캐시합니다.
- `'ignore'` - 쿼리 결과를 캐시하지 않고 예외도 발생시키지 않습니다.

## query_cache_tag \{#query_cache_tag\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "쿼리 캐시 설정에 레이블을 지정하기 위한 새 설정입니다."}]}]}/>

[쿼리 캐시](../query-cache.md) 항목에 대한 레이블로 사용되는 문자열입니다.
동일한 쿼리라도 태그가 다르면 쿼리 캐시에서는 서로 다른 쿼리로 간주합니다.

가능한 값:

- 임의의 문자열

## query_cache_ttl \{#query_cache_ttl\}

<SettingsInfoBlock type="Seconds" default_value="60" />

이 시간(초)이 지나면 [쿼리 캐시](../query-cache.md)의 항목이 만료된 것으로 간주됩니다.

가능한 값:

- 0 이상의 정수.

## query_metric_log_interval \{#query_metric_log_interval\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "새 설정입니다."}]}]}/>

개별 쿼리에 대한 [query_metric_log](../../operations/system-tables/query_metric_log.md)이(가) 수집되는 간격(밀리초 단위)입니다.

음수 값(0 미만)으로 설정하면 [query_metric_log 설정](/operations/server-configuration-parameters/settings#query_metric_log)의 `collect_interval_milliseconds` 값을 사용하며, 해당 값이 없으면 기본값인 1000밀리초가 사용됩니다.

단일 쿼리에 대한 수집을 비활성화하려면 `query_metric_log_interval`을 0으로 설정하십시오.

기본값: -1

## query_plan_aggregation_in_order \{#query_plan_aggregation_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "쿼리 플랜 관련 리팩터링 일부 활성화"}]}]}/>

쿼리 플랜 단계에서 in-order 집계 최적화의 사용 여부를 제어합니다.
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 설정이 1일 때만 적용됩니다.

:::note
이 설정은 개발자가 디버깅 목적으로만 사용해야 하는 고급 설정입니다. 이 설정은 향후 이전 버전과 호환되지 않는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_convert_any_join_to_semi_or_anti_join \{#query_plan_convert_any_join_to_semi_or_anti_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

JOIN 이후의 필터가 매칭되지 않은 행 또는 매칭된 행에 대해 항상 false로 평가되는 경우, ANY JOIN을 SEMI JOIN 또는 ANTI JOIN으로 변환할 수 있도록 허용합니다.

## query_plan_convert_join_to_in \{#query_plan_convert_join_to_in\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

출력 컬럼이 왼쪽 테이블의 컬럼에만 의존하는 경우 `JOIN`을 `IN`을 사용하는 서브쿼리로 변환할 수 있도록 허용합니다. ANY가 아닌 JOIN(예: 기본값인 ALL JOIN)에서는 잘못된 결과가 발생할 수 있습니다.

## query_plan_convert_outer_join_to_inner_join \{#query_plan_convert_outer_join_to_inner_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Allow to convert OUTER JOIN to INNER JOIN if filter after JOIN always filters default values"}]}]}/>

`JOIN` 이후의 필터가 항상 기본값만을 걸러내는 경우 `OUTER JOIN`을 `INNER JOIN`으로 변환할 수 있도록 허용합니다

## query_plan_direct_read_from_text_index \{#query_plan_direct_read_from_text_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

쿼리 플랜에서 역텍스트 인덱스만 사용하여 전문 검색 필터링을 수행하도록 허용합니다.

## query_plan_display_internal_aliases \{#query_plan_display_internal_aliases\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

EXPLAIN PLAN에서 원본 쿼리에 지정된 별칭 대신 __table1과 같은 내부 별칭을 표시합니다.

## query_plan_enable_multithreading_after_window_functions \{#query_plan_enable_multithreading_after_window_functions\}

<SettingsInfoBlock type="Bool" default_value="1" />

윈도우 함수를 평가한 이후 멀티스레딩을 활성화하여 병렬 스트림 처리가 가능하도록 합니다

## query_plan_enable_optimizations \{#query_plan_enable_optimizations\}

<SettingsInfoBlock type="Bool" default_value="1" />

쿼리 플랜 수준에서 쿼리 최적화 사용 여부를 전환합니다.

:::note
이 설정은 개발자가 디버깅 목적으로만 사용해야 하는 고급 설정입니다. 향후 하위 호환성이 보장되지 않는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값은 다음과 같습니다.

- 0 - 쿼리 플랜 수준에서 모든 최적화를 비활성화
- 1 - 쿼리 플랜 수준에서 최적화를 활성화(단, 개별 최적화는 해당 개별 설정을 통해 여전히 비활성화될 수 있음)

## query_plan_execute_functions_after_sorting \{#query_plan_execute_functions_after_sorting\}

<SettingsInfoBlock type="Bool" default_value="1" />

정렬 단계 이후로 식(expression)을 이동하는 쿼리 플랜(query plan) 수준 최적화를 제어합니다.  
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 설정이 1인 경우에만 적용됩니다.

:::note
이 설정은 개발자가 디버깅 목적으로만 사용해야 하는 전문가용 설정입니다. 향후 이전 버전과 호환되지 않는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_filter_push_down \{#query_plan_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

실행 계획에서 필터를 하위 단계로 이동시키는 쿼리 플랜 수준 최적화의 사용 여부를 전환합니다.
설정 [query_plan_enable_optimizations](#query_plan_enable_optimizations)가 1인 경우에만 적용됩니다.

:::note
이는 개발자가 디버깅 목적으로만 사용해야 하는 전문가용 설정입니다. 이 설정은 향후 하위 호환되지 않는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_join_shard_by_pk_ranges \{#query_plan_join_shard_by_pk_ranges\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

두 테이블에서 조인 키가 각각 해당 테이블의 PRIMARY KEY 접두사인 경우 JOIN에 세그먼트 단위 처리를 적용합니다. hash, parallel_hash, full_sorting_merge 알고리즘에서 지원됩니다. 일반적으로 쿼리 속도를 높이지는 않지만 메모리 사용량을 줄이는 데 도움이 될 수 있습니다.

## query_plan_join_swap_table \{#query_plan_join_swap_table\}

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "New setting. Right table was always chosen before."}]}]}/>

쿼리 플랜에서 조인 양쪽 중 어느 테이블을 build 테이블(내부 테이블이라고도 하며, 해시 조인을 위해 해시 테이블에 삽입되는 테이블)로 사용할지 결정합니다. 이 설정은 `JOIN ON` 절과 함께 사용하는 `ALL` 조인 엄격도에만 지원됩니다. 가능한 값은 다음과 같습니다:

- `auto`: 어느 테이블을 build 테이블로 사용할지 플래너가 결정하도록 합니다.
    - `false`: 테이블을 스왑하지 않습니다(오른쪽 테이블이 build 테이블입니다).
    - `true`: 항상 테이블을 스왑합니다(왼쪽 테이블이 build 테이블입니다).

## query_plan_lift_up_array_join \{#query_plan_lift_up_array_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

실행 계획에서 `ARRAY JOIN`을 상위 단계로 끌어올리는 쿼리 플랜 수준 최적화를 토글합니다.
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 설정이 1인 경우에만 적용됩니다.

:::note
이는 개발자가 디버깅 목적으로만 사용해야 하는 전문가용 설정입니다. 이 설정은 향후 하위 호환성이 깨지는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_lift_up_union \{#query_plan_lift_up_union\}

<SettingsInfoBlock type="Bool" default_value="1" />

쿼리 플랜 상의 더 큰 서브트리를 `union`으로 이동시켜 추가적인 최적화를 가능하게 하는, 쿼리 플랜 수준의 최적화를 제어합니다.  
설정 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations)가 1인 경우에만 적용됩니다.

:::note
전문가 수준의 설정으로, 개발자가 디버깅 목적으로만 사용해야 합니다. 이 설정은 향후 하위 호환성이 깨지는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_max_limit_for_lazy_materialization \{#query_plan_max_limit_for_lazy_materialization\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "lazy materialization 최적화를 위해 쿼리 플랜 사용을 허용하는 최대 한계값을 제어하는 새 SETTING이 추가되었습니다. 0이면 제한이 없습니다"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10000"},{"label": "성능 향상 이후 이 한계를 10000으로 늘렸습니다"}]}, {"id": "row-3","items": [{"label": "25.11"},{"label": "100"},{"label": "더 최적화되었습니다"}]}]}/>

lazy materialization 최적화를 위해 쿼리 플랜 사용을 허용하는 최대 한계값을 제어합니다. 0이면 제한이 없습니다.

## query_plan_max_limit_for_top_k_optimization \{#query_plan_max_limit_for_top_k_optimization\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "New setting."}]}]}/>

minmax skip 인덱스와 동적 임계값 필터링을 사용하여 TopK 최적화를 수행할 때 쿼리 플랜을 평가하는 데 사용할 수 있는 LIMIT의 최대 값을 제어합니다. 0으로 설정하면 제한이 없습니다.

## query_plan_max_optimizations_to_apply \{#query_plan_max_optimizations_to_apply\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

쿼리 플랜에 적용되는 최적화의 총 횟수를 제한합니다. 설정 [query_plan_enable_optimizations](#query_plan_enable_optimizations)을 참조하십시오.
복잡한 쿼리에서 최적화 시간이 과도하게 길어지는 것을 방지하는 데 유용합니다.
EXPLAIN PLAN 쿼리에서는 이 값에 도달하면 그 이후로는 더 이상 최적화를 적용하지 않고, 그 시점의 플랜을 그대로 반환합니다.
일반 쿼리 실행의 경우 실제 최적화 횟수가 이 설정을 초과하면 예외가 발생합니다.

:::note
이 설정은 개발자가 디버깅 목적으로만 사용해야 하는 고급 설정입니다. 이 설정은 향후 하위 호환성을 보장하지 않는 방식으로 변경되거나 제거될 수 있습니다.
:::

## query_plan_max_step_description_length \{#query_plan_max_step_description_length\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "New setting"}]}]}/>

EXPLAIN PLAN에서 단계 설명의 최대 길이를 지정합니다.

## query_plan_merge_expressions \{#query_plan_merge_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

연속된 필터를 병합하는 쿼리 플랜 수준 최적화 기능을 제어합니다.  
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 설정이 1인 경우에만 적용됩니다.

:::note
이는 개발자가 디버깅할 때만 사용해야 하는 전문가용 설정입니다. 이 설정은 향후 하위 호환성이 깨지는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_merge_filter_into_join_condition \{#query_plan_merge_filter_into_join_condition\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "필터를 JOIN 조건으로 병합하는 새로운 설정 추가"}]}]}/>

필터를 `JOIN` 조건으로 병합하고 `CROSS JOIN`을 `INNER JOIN`으로 변환하도록 허용합니다.

## query_plan_merge_filters \{#query_plan_merge_filters\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "쿼리 플랜에서 필터 병합을 허용합니다"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "쿼리 플랜에서 필터 병합을 허용합니다. 이는 analyzer와 함께 filter push-down을 올바르게 지원하기 위해 필요합니다."}]}]}/>

쿼리 플랜에서 필터 병합을 허용합니다.

## query_plan_optimize_join_order_algorithm \{#query_plan_optimize_join_order_algorithm\}

<ExperimentalBadge/>

<SettingsInfoBlock type="JoinOrderAlgorithm" default_value="greedy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "greedy"},{"label": "New experimental setting."}]}]}/>

쿼리 플랜을 최적화할 때 시도할 JOIN 순서 알고리즘을 지정합니다. 사용 가능한 알고리즘은 다음과 같습니다.

- 'greedy' - 기본적인 greedy 알고리즘으로, 빠르게 동작하지만 최적의 조인 순서를 만들지 못할 수 있습니다.
 - 'dpsize' - 현재 Inner 조인에만 적용되는 DPsize 알고리즘을 구현합니다. 가능한 모든 조인 순서를 고려하여 가장 최적의 순서를 찾지만, 많은 테이블과 조인 조건이 있는 쿼리에서는 느릴 수 있습니다.

여러 알고리즘을 지정할 수 있습니다. 예: 'dpsize,greedy'.

## query_plan_optimize_join_order_limit \{#query_plan_optimize_join_order_limit\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10"},{"label": "Allow JOIN reordering with more tables by default"}]}]}/>

동일한 서브쿼리 내에서 JOIN 순서를 최적화합니다. 현재는 극히 제한적인 경우에만 지원됩니다.
값은 최적화 대상이 되는 테이블의 최대 개수입니다.

## query_plan_optimize_lazy_materialization \{#query_plan_optimize_lazy_materialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "lazy materialization을 최적화하기 위해 쿼리 플랜을 사용하는 새로운 설정 추가"}]}]}/>

lazy materialization을 최적화하기 위해 쿼리 플랜을 사용합니다.

## query_plan_optimize_prewhere \{#query_plan_optimize_prewhere\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "지원되는 스토리지에서 필터를 PREWHERE 식으로 푸시다운하도록 허용"}]}]}/>

지원되는 스토리지에서 필터를 PREWHERE 식으로 푸시다운하도록 허용합니다

## query_plan_push_down_limit \{#query_plan_push_down_limit\}

<SettingsInfoBlock type="Bool" default_value="1" />

실행 계획에서 `LIMIT`을 더 하위 단계로 내리는 쿼리 플랜 수준의 최적화를 켜거나 끕니다.  
설정 [query_plan_enable_optimizations](#query_plan_enable_optimizations) 값이 1로 설정된 경우에만 효과가 있습니다.

:::note
이는 개발자가 디버깅 목적으로만 사용해야 하는 전문가용 설정입니다. 이 설정은 향후 하위 호환성이 없게 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_read_in_order \{#query_plan_read_in_order\}

<SettingsInfoBlock type="Bool" default_value="1" />

`read in-order` 최적화를 쿼리 플랜 수준에서 사용할지 여부를 토글합니다.
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 설정이 1인 경우에만 적용됩니다.

:::note
이는 개발자가 디버깅 목적으로만 사용해야 하는 전문가용 설정입니다. 이 설정은 향후 하위 호환되지 않게 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_read_in_order_through_join \{#query_plan_read_in_order_through_join\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

JOIN 연산에서 왼쪽 테이블을 순서대로 계속 읽어 들이며, 이렇게 유지된 순서는 이후 단계에서 활용될 수 있습니다.

## query_plan_remove_redundant_distinct \{#query_plan_remove_redundant_distinct\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "Remove redundant Distinct step in query plan"}]}]}/>

불필요한 DISTINCT 단계를 제거하는 쿼리 플랜 수준 최적화 기능의 사용 여부를 제어합니다.
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 설정이 1인 경우에만 적용됩니다.

:::note
이는 개발자가 디버깅 목적으로만 사용해야 하는 전문가 수준 설정입니다. 이 설정은 향후 하위 호환성이 깨지는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_remove_redundant_sorting \{#query_plan_remove_redundant_sorting\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "쿼리 플랜에서 중복 정렬을 제거합니다. 예를 들어 서브쿼리의 ORDER BY 절과 관련된 정렬 단계"}]}]}/>

쿼리 플랜 수준에서 서브쿼리의 ORDER BY 절 등과 관련된 중복 정렬 단계를 제거하는 최적화 여부를 제어합니다.
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 설정이 1일 때만 적용됩니다.

:::note
이 설정은 전문가 수준의 설정으로, 개발자가 디버깅 목적으로만 사용해야 합니다. 이 설정은 향후 이전 버전과 호환되지 않는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_remove_unused_columns \{#query_plan_remove_unused_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "새로운 설정입니다. 쿼리 플랜에서 사용되지 않는 컬럼을 제거하는 최적화를 추가합니다."}]}]}/>

쿼리 플랜 단계에서 사용되지 않는 컬럼(입력 및 출력 컬럼 모두)을 제거하려고 시도하는 쿼리 플랜 수준 최적화의 사용 여부를 제어합니다.
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 설정이 1일 때만 적용됩니다.

:::note
이는 개발자가 디버깅 목적으로만 사용해야 하는 전문가 수준 설정입니다. 이 설정은 향후 하위 호환성이 보장되지 않는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_reuse_storage_ordering_for_window_functions \{#query_plan_reuse_storage_ordering_for_window_functions\}

**별칭(Aliases)**: `optimize_read_in_window_order`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "기본적으로 이 로직을 비활성화합니다."}]}]}/>

윈도 함수용 정렬 시 스토리지의 정렬 순서를 활용하는 쿼리 플랜 수준 최적화의 사용 여부를 제어합니다.  
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 설정이 1인 경우에만 적용됩니다.

:::note
이 설정은 개발자가 디버깅 목적으로만 사용해야 하는 고급 설정입니다. 향후 이전 버전과 호환되지 않는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_split_filter \{#query_plan_split_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
이 설정은 개발자가 디버깅 목적으로만 사용해야 하는 고급 설정입니다. 이 설정은 향후 하위 호환성이 없는 방식으로 변경되거나 제거될 수 있습니다.
:::

필터를 개별 표현식으로 분할하는 쿼리 플랜 수준 최적화의 사용 여부를 제어합니다.  
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 설정이 1일 때만 적용됩니다.

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_text_index_add_hint \{#query_plan_text_index_add_hint\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

쿼리 플랜에서 역인덱스(inverted text index)를 기반으로 생성된 필터에 힌트(추가 조건식)를 추가할 수 있도록 허용합니다.

## query_plan_try_use_vector_search \{#query_plan_try_use_vector_search\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "새 설정."}]}]}/>

쿼리 플랜 수준에서 벡터 유사도 인덱스를 사용하도록 시도하는 최적화 기능의 사용 여부를 제어합니다.
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 설정이 1인 경우에만 적용됩니다.

:::note
이는 개발자가 디버깅 목적으로만 사용해야 하는 전문가용 설정입니다. 향후 하위 호환성을 보장하지 않는 방식으로 변경되거나 제거될 수 있습니다.
:::

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## query_plan_use_new_logical_join_step \{#query_plan_use_new_logical_join_step\}

**별칭**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "새 단계 활성화"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "새 조인 단계, 내부 변경"}]}]}/>

쿼리 플랜에서 논리 조인 단계를 사용합니다.  
참고: `query_plan_use_new_logical_join_step` 설정은 더 이상 사용되지 않습니다. 대신 `query_plan_use_logical_join_step`을(를) 사용하십시오.

## query_profiler_cpu_time_period_ns \{#query_profiler_cpu_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md)의 CPU 클록 타이머 주기를 설정합니다. 이 타이머는 CPU 시간만을 측정합니다.

가능한 값:

- 양의 정수 나노초 값.

    권장 값:

            - 단일 쿼리의 경우 10000000 나노초(초당 100회) 이상.
            - 클러스터 전체 프로파일링의 경우 1000000000 나노초(초당 1회).

- 0은 타이머를 끄는 값입니다.

함께 보기:

- 시스템 테이블 [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns \{#query_profiler_real_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md)의 실시간 타이머 주기를 설정합니다. 실시간 타이머는 벽시계 시간을 기준으로 경과 시간을 측정합니다.

설정 가능한 값:

- 양의 정수(나노초 단위).

    권장 값:

            - 단일 쿼리의 경우 10000000 나노초(초당 100회) 이하.
            - 클러스터 전체 프로파일링의 경우 1000000000 나노초(초당 1회).

- 0: 타이머를 끕니다.

함께 보기:

- 시스템 테이블 [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms \{#queue_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

동시 요청 수가 최대값을 초과할 때, 요청 대기열에서 대기하는 시간입니다.

## rabbitmq_max_wait_ms \{#rabbitmq_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

RabbitMQ에서 읽기 작업을 재시도하기 전에 대기하는 시간입니다.

## read_backoff_max_throughput \{#read_backoff_max_throughput\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

느린 읽기가 발생했을 때 스레드 수를 줄이기 위한 설정입니다. 읽기 대역폭이 초당 해당 바이트 수보다 작을 때 이벤트를 계산합니다.

## read_backoff_min_concurrency \{#read_backoff_min_concurrency\}

<SettingsInfoBlock type="UInt64" default_value="1" />

읽기가 느린 경우에도 유지하려는 최소 스레드 수를 설정합니다.

## read_backoff_min_events \{#read_backoff_min_events\}

<SettingsInfoBlock type="UInt64" default_value="2" />

읽기가 느린 경우 스레드 수를 줄이기 위한 설정입니다. 스레드 수를 줄이기 위해 필요한 최소 이벤트 수를 지정합니다.

## read_backoff_min_interval_between_events_ms \{#read_backoff_min_interval_between_events_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

느린 읽기가 발생한 경우 사용되는 스레드 수를 줄이기 위한 설정입니다. 이전 이벤트 발생 시점으로부터 경과 시간이 설정된 값보다 짧으면 해당 이벤트는 무시합니다.

## read_backoff_min_latency_ms \{#read_backoff_min_latency_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

느린 읽기가 발생하는 경우 스레드 수를 줄이기 위한 설정입니다. 최소한 해당 시간 이상이 소요된 읽기만 고려합니다.

## read_from_distributed_cache_if_exists_otherwise_bypass_cache \{#read_from_distributed_cache_if_exists_otherwise_bypass_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 동작합니다. read_from_filesystem_cache_if_exists_otherwise_bypass_cache와 동일하지만, 분산 캐시에 적용되는 설정입니다.

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache \{#read_from_filesystem_cache_if_exists_otherwise_bypass_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

파일 시스템 캐시(filesystem cache)를 패시브 모드로 사용할 수 있도록 허용합니다. 이미 존재하는 캐시 엔트리는 활용하되, 캐시에 새로운 엔트리를 추가하지는 않습니다. 이 설정을 부하가 큰 애드혹(ad-hoc) 쿼리에만 적용하고 짧은 실시간 쿼리에는 비활성화로 두면, 과도하게 무거운 쿼리로 인한 캐시 스래싱(cache thrashing)을 피하고 전체 시스템 효율을 향상할 수 있습니다.

## read_from_page_cache_if_exists_otherwise_bypass_cache \{#read_from_page_cache_if_exists_otherwise_bypass_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "userspace page cache 추가됨"}]}]}/>

read_from_filesystem_cache_if_exists_otherwise_bypass_cache와 유사하게, 수동(passive) 모드에서 userspace page cache를 사용합니다.

## read_in_order_two_level_merge_threshold \{#read_in_order_two_level_merge_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100" />

멀티스레드로 기본 키 순서대로 읽을 때, 사전 머지 단계를 수행하기 위해 읽어야 하는 최소 파트 수입니다.

## read_in_order_use_buffering \{#read_in_order_use_buffering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "Use buffering before merging while reading in order of primary key"}]}]}/>

기본 키 순서로 데이터를 읽을 때 병합 전에 버퍼링을 사용합니다. 이렇게 하면 쿼리 실행의 병렬성이 높아집니다.

## read_in_order_use_virtual_row \{#read_in_order_use_virtual_row\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "기본 키 또는 그 단조 함수의 순서로 읽을 때 가상 행을 사용합니다. 여러 파트에서 조회할 때 관련된 파트만 읽게 되어 유용합니다."}]}]}/>

기본 키 또는 그 단조 함수의 순서로 읽을 때 가상 행을 사용합니다. 여러 파트에서 조회할 때 관련된 파트만 읽게 되어 유용합니다.

## read_overflow_mode \{#read_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

제한을 초과했을 때 수행할 동작을 정의합니다.

## read_overflow_mode_leaf \{#read_overflow_mode_leaf\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

읽은 데이터의 양이 리프 제한값 중 하나를 초과할 때 어떻게 처리할지 설정합니다.

가능한 옵션:

- `throw`: 예외를 발생시킵니다 (기본값).
- `break`: 쿼리 실행을 중단하고 부분 결과를 반환합니다.

## read_priority \{#read_priority\}

<SettingsInfoBlock type="Int64" default_value="0" />

로컬 파일 시스템 또는 원격 파일 시스템에서 데이터를 읽는 우선순위입니다. 로컬 파일 시스템의 'pread_threadpool' 메서드와 원격 파일 시스템의 `threadpool` 메서드에서만 지원됩니다.

## read_through_distributed_cache \{#read_through_distributed_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 전용 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시에서 데이터를 읽을 수 있게 합니다.

## readonly \{#readonly\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 읽기 전용 제한이 없습니다. 1 - 읽기 요청만 허용되며, 명시적으로 허용된 설정만 변경할 수 있습니다. 2 - 읽기 요청만 허용되며, 설정 변경은 가능하지만 "readonly" 설정은 변경할 수 없습니다.

## receive_data_timeout_ms \{#receive_data_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

레플리카로부터 첫 번째 데이터 패킷 또는 진행 상황이 보고된 패킷을 수신할 때까지의 연결 타임아웃입니다.

## receive_timeout \{#receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="300" />

네트워크에서 데이터를 수신하기 위한 타임아웃(초 단위)입니다. 이 기간 동안 바이트를 전혀 수신하지 못하면 예외가 발생합니다. 이 설정을 클라이언트에서 지정하면, 서버 측의 해당 연결 소켓에도 `send_timeout`이 설정됩니다.

## regexp_dict_allow_hyperscan \{#regexp_dict_allow_hyperscan\}

<SettingsInfoBlock type="Bool" default_value="1" />

Hyperscan 라이브러리를 사용하는 regexp_tree 딕셔너리를 허용합니다.

## regexp_dict_flag_case_insensitive \{#regexp_dict_flag_case_insensitive\}

<SettingsInfoBlock type="Bool" default_value="0" />

regexp_tree 딕셔너리에 대해 대소문자를 구분하지 않는(case-insensitive) 매칭을 사용합니다. 개별 표현식에서는 (?i) 또는 (?-i)로 이 설정을 재정의할 수 있습니다.

## regexp_dict_flag_dotall \{#regexp_dict_flag_dotall\}

<SettingsInfoBlock type="Bool" default_value="0" />

regexp_tree 딕셔너리에 대해 '.'이 줄 바꿈 문자와도 일치하도록 허용합니다.

## regexp_max_matches_per_row \{#regexp_max_matches_per_row\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

단일 정규식이 한 행에서 일치할 수 있는 최대 횟수를 설정합니다. [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal) 함수에서 탐욕적 정규식을 사용할 때 메모리 과다 사용을 방지하기 위해 사용합니다.

가능한 값:

- 양의 정수

## reject_expensive_hyperscan_regexps \{#reject_expensive_hyperscan_regexps\}

<SettingsInfoBlock type="Bool" default_value="1" />

NFA 상태 폭발로 인해 hyperscan으로 평가 비용이 클 것으로 예상되는 패턴을 거부합니다.

## remerge_sort_lowered_memory_bytes_ratio \{#remerge_sort_lowered_memory_bytes_ratio\}

<SettingsInfoBlock type="Float" default_value="2" />

remerge 이후 메모리 사용량이 이 비율 이상으로 감소하지 않으면 remerge가 비활성화됩니다.

## remote_filesystem_read_method \{#remote_filesystem_read_method\}

<SettingsInfoBlock type="String" default_value="threadpool" />

원격 파일 시스템에서 데이터를 읽는 방식으로, read 또는 threadpool 중 하나입니다.

## remote_filesystem_read_prefetch \{#remote_filesystem_read_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

원격 파일 시스템에서 데이터를 읽을 때 프리페치를 사용합니다.

## remote_fs_read_backoff_max_tries \{#remote_fs_read_backoff_max_tries\}

<SettingsInfoBlock type="UInt64" default_value="5" />

백오프를 사용하여 읽기를 재시도하는 최대 횟수

## remote_fs_read_max_backoff_ms \{#remote_fs_read_max_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

원격 디스크에서 데이터를 읽을 때의 최대 대기 시간입니다.

## remote_read_min_bytes_for_seek \{#remote_read_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

원격 읽기(url, S3)에서 read with ignore 방식으로 데이터를 읽어 버리는 대신 seek를 수행하기 위해 필요한 최소 바이트 수입니다.

## rename_files_after_processing \{#rename_files_after_processing\}

- **유형:** String

- **기본값:** 빈 문자열

이 설정은 `file` 테이블 함수로 처리된 파일에 적용할 이름 변경 패턴을 지정합니다. 이 옵션을 설정하면, `file` 테이블 함수로 읽은 모든 파일은 플레이스홀더를 포함한 지정된 패턴에 따라 이름이 변경되며, 파일 처리가 성공적으로 완료된 경우에만 적용됩니다.

### 플레이스홀더 \{#placeholders\}

- `%a` — 원본 전체 파일 이름(예: "sample.csv").
- `%f` — 확장자를 제외한 원본 파일 이름(예: "sample").
- `%e` — 점을 포함한 원본 파일 확장자(예: ".csv").
- `%t` — 타임스탬프(마이크로초 단위).
- `%%` — 퍼센트 기호("%").

### 예시 \{#example\}

- 옵션: `--rename_files_after_processing="processed_%f_%t%e"`

- 쿼리: `SELECT * FROM file('sample.csv')`

`sample.csv`를 성공적으로 읽으면 파일 이름이 `processed_sample_1683473210851438.csv`로 변경됩니다.

## replace_running_query \{#replace_running_query\}

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP 인터페이스를 사용할 때 `query_id` 매개변수를 전달할 수 있습니다. 이는 쿼리 식별자로 사용되는 임의의 문자열입니다.
동일한 사용자로부터 동일한 `query_id`를 가진 쿼리가 이미 존재하는 경우, 동작은 `replace_running_query` 매개변수에 의해 결정됩니다.

`0` (기본값) – 예외를 발생시킵니다(동일한 `query_id`를 가진 쿼리가 이미 실행 중인 경우, 쿼리 실행을 허용하지 않습니다).

`1` – 이전 쿼리를 취소하고 새 쿼리의 실행을 시작합니다.

세그먼트 조건에 대한 추천 기능을 구현하기 위해 이 매개변수를 1로 설정합니다. 다음 문자를 입력한 후에도 이전 쿼리가 아직 완료되지 않았다면, 해당 쿼리는 취소해야 합니다.

## replace_running_query_max_wait_ms \{#replace_running_query_max_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

[replace_running_query](#replace_running_query) 설정이 활성화되어 있을 때, 동일한 `query_id`를 가진 실행 중인 쿼리가 종료될 때까지 기다리는 시간입니다.

가능한 값:

- 양의 정수 값.
- 0 — 서버가 이미 동일한 `query_id`로 쿼리를 실행 중인 경우, 새 쿼리 실행을 허용하지 않고 예외를 발생시킵니다.

## replication_wait_for_inactive_replica_timeout \{#replication_wait_for_inactive_replica_timeout\}

<SettingsInfoBlock type="Int64" default_value="120" />

비활성 레플리카가 [`ALTER`](../../sql-reference/statements/alter/index.md), [`OPTIMIZE`](../../sql-reference/statements/optimize.md) 또는 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 쿼리를 실행할 때까지 대기하는 시간(초)을 지정합니다.

가능한 값:

- `0` — 대기하지 않습니다.
- 음의 정수 — 무기한 대기합니다.
- 양의 정수 — 대기할 초 단위 시간입니다.

## restore_replace_external_dictionary_source_to_null \{#restore_replace_external_dictionary_source_to_null\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "새 설정."}]}]}/>

복원 시 외부 딕셔너리 소스를 Null로 대체합니다. 테스트용으로 유용합니다.

## restore_replace_external_engines_to_null \{#restore_replace_external_engines_to_null\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

테스트용입니다. 모든 외부 엔진을 Null로 대체하여 외부 연결이 생성되지 않도록 합니다.

## restore_replace_external_table_functions_to_null \{#restore_replace_external_table_functions_to_null\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

테스트 목적의 설정입니다. 외부 연결이 생성되지 않도록 모든 external table function을 Null로 대체합니다.

## restore_replicated_merge_tree_to_shared_merge_tree \{#restore_replicated_merge_tree_to_shared_merge_tree\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting."}]}]}/>

RESTORE 작업 중 테이블 엔진을 Replicated*MergeTree에서 Shared*MergeTree로 교체합니다.

## result_overflow_mode \{#result_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Cloud 기본값: `throw`

결과의 크기가 설정된 제한값 중 하나를 초과할 때 어떻게 처리할지 설정합니다.

가능한 값:

* `throw`: 예외를 발생시킵니다(기본값).
* `break`: 쿼리 실행을 중지하고, 마치
  소스 데이터가 소진된 것처럼 일부 결과만 반환합니다.

&#39;break&#39;를 사용하는 것은 LIMIT을 사용하는 것과 유사합니다. `Break`는 블록 단위에서만 실행을 중단합니다. 이는 반환되는 행 수가
[`max_result_rows`](/operations/settings/settings#max_result_rows)보다 크고, [`max_block_size`](/operations/settings/settings#max_block_size)의 배수이며
[`max_threads`](/operations/settings/settings#max_threads)에 따라 달라진다는 것을 의미합니다.

**예시**

```sql title="Query"
SET max_threads = 3, max_block_size = 3333;
SET max_result_rows = 3334, result_overflow_mode = 'break';

SELECT *
FROM numbers_mt(100000)
FORMAT Null;
```

```text title="Result"
6666 rows in set. ...
```


## rewrite_count_distinct_if_with_count_distinct_implementation \{#rewrite_count_distinct_if_with_count_distinct_implementation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "count_distinct_implementation 설정을 사용하여 countDistinctIf를 재작성하는 설정"}]}]}/>

`countDistcintIf`를 [count_distinct_implementation](#count_distinct_implementation) 설정으로 재작성할 수 있도록 허용합니다.

가능한 값:

- true — 허용합니다.
- false — 허용하지 않습니다.

## rewrite_in_to_join \{#rewrite_in_to_join\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

'x IN subquery'와 같은 표현을 JOIN으로 변환합니다. 이는 JOIN 재정렬(join reordering)을 통해 전체 쿼리를 최적화하는 데 도움이 될 수 있습니다.

## rows_before_aggregation \{#rows_before_aggregation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "rows_before_aggregation 통계에 대해 정확한 값을 제공하며, 이는 집계를 수행하기 전에 읽은 행 수를 나타냅니다"}]}]}/>

설정을 활성화하면 ClickHouse는 rows_before_aggregation 통계에 대해 정확한 값을 제공합니다. 이는 집계를 수행하기 전에 읽은 행 수를 나타냅니다.

## s3_allow_multipart_copy \{#s3_allow_multipart_copy\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "새 설정입니다."}]}]}/>

S3에서 멀티파트 복사를 허용합니다.

## s3_allow_parallel_part_upload \{#s3_allow_parallel_part_upload\}

<SettingsInfoBlock type="Bool" default_value="1" />

S3 멀티파트 업로드에 여러 스레드를 사용합니다. 메모리 사용량이 약간 증가할 수 있습니다.

## s3_check_objects_after_upload \{#s3_check_objects_after_upload\}

<SettingsInfoBlock type="Bool" default_value="0" />

S3에 업로드된 각 객체에 대해 HEAD 요청을 보내 업로드가 성공했는지 확인합니다.

## s3_connect_timeout_ms \{#s3_connect_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "S3 연결 타임아웃을 위한 새로운 전용 설정 도입"}]}]}/>

S3 디스크의 호스트 연결 타임아웃입니다.

## s3_create_new_file_on_insert \{#s3_create_new_file_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

s3 엔진 테이블에서 각 INSERT 수행 시마다 새 파일을 생성할지 여부를 활성화하거나 비활성화합니다. 이 설정을 활성화하면, 각 INSERT 시마다 다음 패턴과 유사한 키를 사용하여 새로운 S3 객체가 생성됩니다:

예: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` 등.

가능한 값:

- 0 — `INSERT` 쿼리가 새 파일을 생성하거나, 파일이 이미 존재하고 s3_truncate_on_insert가 설정되어 있지 않으면 실패합니다.
- 1 — s3_truncate_on_insert가 설정되어 있지 않은 경우, `INSERT` 쿼리가 (두 번째부터는) 접미사를 사용하여 각 INSERT마다 새 파일을 생성합니다.

자세한 내용은 [여기](/integrations/s3#inserting-data)를 참고하십시오.

## s3_disable_checksum \{#s3_disable_checksum\}

<SettingsInfoBlock type="Bool" default_value="0" />

파일을 S3로 전송할 때 체크섬(checksum)을 계산하지 않습니다. 이는 파일을 여러 차례 반복 처리하는 과정을 피함으로써 쓰기 속도를 높입니다. MergeTree 테이블의 데이터는 이미 ClickHouse에 의해 체크섬이 계산되므로 대부분의 경우 안전하며, S3에 HTTPS로 접근하는 경우 네트워크 전송 시 무결성은 TLS 계층에서 이미 보장됩니다. 한편 S3에서의 추가 체크섬은 방어 심층화(defense in depth)에 기여합니다.

## s3_ignore_file_doesnt_exist \{#s3_ignore_file_doesnt_exist\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "요청된 파일이 존재하지 않을 때 예외를 발생시키는 대신 S3 테이블 엔진에서 0개의 행을 반환하도록 허용합니다"}]}]}/>

특정 키를 읽을 때 대상 파일이 없으면, 파일이 없다는 사실을 무시합니다.

가능한 값:

- 1 — `SELECT`가 빈 결과를 반환합니다.
- 0 — `SELECT`가 예외를 발생시킵니다.

## s3_list_object_keys_size \{#s3_list_object_keys_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject 요청 한 번에 배치로 반환될 수 있는 파일의 최대 개수입니다.

## s3_max_connections \{#s3_max_connections\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

서버 하나당 허용되는 최대 연결 수입니다.

## s3_max_get_burst \{#s3_max_get_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

1초당 요청 수 제한에 도달하기 전에 동시에 보낼 수 있는 최대 요청 수입니다. 기본값(0)은 `s3_max_get_rps` 값과 같습니다.

## s3_max_get_rps \{#s3_max_get_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

S3 GET 요청의 초당 최대 횟수 제한입니다. 이 값을 초과하면 제한(throttling)이 적용됩니다. 0은 무제한을 의미합니다.

## s3_max_inflight_parts_for_one_file \{#s3_max_inflight_parts_for_one_file\}

<SettingsInfoBlock type="UInt64" default_value="20" />

멀티파트 업로드 요청에서 동시에 로드되는 파트의 최대 개수입니다. 0은 무제한을 의미합니다.

## s3_max_part_number \{#s3_max_part_number\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "S3 업로드 파트의 최대 번호"}]}]}/>

S3 업로드 파트(part)의 최대 번호입니다.

## s3_max_put_burst \{#s3_max_put_burst\}

<SettingsInfoBlock type="UInt64" default_value="0" />

초당 요청 수 제한에 도달하기 전에 동시에 수행할 수 있는 최대 요청 수입니다. 기본값(0)일 때는 `s3_max_put_rps`와 같습니다.

## s3_max_put_rps \{#s3_max_put_rps\}

<SettingsInfoBlock type="UInt64" default_value="0" />

S3 PUT 요청의 초당 처리 속도를 제한합니다. 요청 속도가 이 값을 초과하면 제한이 적용됩니다. 0이면 제한이 없습니다.

## s3_max_single_operation_copy_size \{#s3_max_single_operation_copy_size\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "Maximum size for a single copy operation in s3"}]}]}/>

S3에서 단일 연산으로 수행되는 복사의 최대 크기입니다. 이 설정은 `s3_allow_multipart_copy`가 true인 경우에만 사용됩니다.

## s3_max_single_part_upload_size \{#s3_max_single_part_upload_size\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

단일 파트(singlepart) 업로드 방식으로 S3에 업로드할 수 있는 객체의 최대 크기입니다.

## s3_max_single_read_retries \{#s3_max_single_read_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

단일 S3 읽기 작업에서 허용되는 최대 재시도 횟수입니다.

## s3_max_unexpected_write_error_retries \{#s3_max_unexpected_write_error_retries\}

<SettingsInfoBlock type="UInt64" default_value="4" />

S3에 데이터를 쓰는 동안 예기치 않은 오류가 발생한 경우 재시도할 수 있는 최대 횟수입니다.

## s3_max_upload_part_size \{#s3_max_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

S3로 멀티파트 업로드를 수행할 때 업로드하는 각 파트의 최대 크기입니다.

## s3_min_upload_part_size \{#s3_min_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

S3로 멀티파트 업로드를 수행할 때 업로드하는 파트의 최소 크기입니다.

## s3_path_filter_limit \{#s3_path_filter_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "New setting"}]}]}/>

파일 순회를 위해 glob 목록 대신 사용할 수 있도록 쿼리 필터에서 추출할 수 있는 `_path` 값의 최대 개수입니다.
0이면 비활성화됨을 의미합니다.

## s3_request_timeout_ms \{#s3_request_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="30000" />

S3로 데이터를 보내거나 S3에서 데이터를 받을 때의 유휴 시간 초과값입니다. 단일 TCP 읽기 또는 쓰기 호출이 이 시간 동안 차단되면 실패합니다.

## s3_skip_empty_files \{#s3_skip_empty_files\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "더 나은 UX를 제공하기를 바랍니다"}]}]}/>

[S3](../../engines/table-engines/integrations/s3.md) 엔진 테이블에서 빈 파일을 건너뛸지 여부를 제어합니다.

가능한 값:

- 0 — 빈 파일이 요청된 형식과 호환되지 않으면 `SELECT`가 예외를 발생시킵니다.
- 1 — 빈 파일에 대해 `SELECT`가 빈 결과를 반환합니다.

## s3_slow_all_threads_after_network_error \{#s3_slow_all_threads_after_network_error\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "새 설정"}]}]}/>

`true`로 설정하면, 동일한 백업 엔드포인트로 S3 요청을 실행하는 모든 스레드는 어느 하나의 S3 요청에서 소켓 타임아웃과 같은 재시도 가능한 네트워크 오류가 발생한 이후에 모두 느려지도록 동작합니다.
`false`로 설정하면, 각 스레드는 다른 스레드와 무관하게 S3 요청에 대한 backoff를 개별적으로 처리합니다.

## s3_strict_upload_part_size \{#s3_strict_upload_part_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

S3로 멀티파트 업로드를 수행할 때 업로드할 파트의 정확한 크기를 지정합니다. (일부 구현은 가변 크기 파트를 지원하지 않습니다.)

## s3_throw_on_zero_files_match \{#s3_throw_on_zero_files_match\}

<SettingsInfoBlock type="Bool" default_value="0" />

ListObjects 요청에서 일치하는 파일이 하나도 없을 경우 오류를 발생시킵니다.

## s3_truncate_on_insert \{#s3_truncate_on_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

S3 engine 테이블에서 `INSERT` 전에 파일을 비우는(truncate) 동작을 활성화하거나 비활성화합니다. 비활성화된 경우 S3 객체가 이미 존재하면 `INSERT` 시도 시 예외가 발생합니다.

가능한 값:

- 0 — `INSERT` 쿼리가 새 파일을 생성하거나, 파일이 존재하고 s3_create_new_file_on_insert가 설정되어 있지 않으면 실패합니다.
- 1 — `INSERT` 쿼리가 파일의 기존 내용을 새로운 데이터로 교체합니다.

자세한 내용은 [여기](/integrations/s3#inserting-data)를 참조하십시오.

## s3_upload_part_size_multiply_factor \{#s3_upload_part_size_multiply_factor\}

<SettingsInfoBlock type="UInt64" default_value="2" />

단일 쓰기에서 S3로 업로드된 파트 수가 `s3_multiply_parts_count_threshold`에 도달할 때마다 `s3_min_upload_part_size`에 이 계수를 곱합니다.

## s3_upload_part_size_multiply_parts_count_threshold \{#s3_upload_part_size_multiply_parts_count_threshold\}

<SettingsInfoBlock type="UInt64" default_value="500" />

이 개수만큼의 파트가 S3에 업로드될 때마다 `s3_min_upload_part_size`에 `s3_upload_part_size_multiply_factor`를 곱합니다.

## s3_use_adaptive_timeouts \{#s3_use_adaptive_timeouts\}

<SettingsInfoBlock type="Bool" default_value="1" />

`true`로 설정하면 모든 S3 요청에서 처음 두 번의 시도는 짧은 전송 및 수신 타임아웃으로 수행됩니다.
`false`로 설정하면 모든 시도가 동일한 타임아웃으로 수행됩니다.

## s3_validate_request_settings \{#s3_validate_request_settings\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Allow to disable S3 request settings validation"}]}]}/>

S3 요청 설정에 대한 유효성 검사를 활성화합니다.
가능한 값:

- 1 — 설정을 유효성 검사합니다.
- 0 — 설정을 유효성 검사하지 않습니다.

## s3queue_default_zookeeper_path \{#s3queue_default_zookeeper_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

S3Queue 엔진의 기본 ZooKeeper 경로 접두사입니다.

## s3queue_enable_logging_to_s3queue_log \{#s3queue_enable_logging_to_s3queue_log\}

<SettingsInfoBlock type="Bool" default_value="0" />

system.s3queue_log에 기록하도록 설정합니다. 이 값은 테이블 설정으로 테이블별로 재정의할 수 있습니다.

## s3queue_keeper_fault_injection_probability \{#s3queue_keeper_fault_injection_probability\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

S3Queue용 Keeper 장애 주입 확률입니다.

## s3queue_migrate_old_metadata_to_buckets \{#s3queue_migrate_old_metadata_to_buckets\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "새 설정."}]}]}/>

S3Queue 테이블의 이전 메타데이터 구조를 새로운 메타데이터 구조로 마이그레이션합니다

## schema_inference_cache_require_modification_time_for_url \{#schema_inference_cache_require_modification_time_for_url\}

<SettingsInfoBlock type="Bool" default_value="1" />

Last-Modified 헤더가 있는 URL에 대해 마지막 수정 시간을 검증하여 캐시에 저장된 스키마를 사용합니다

## schema_inference_use_cache_for_azure \{#schema_inference_use_cache_for_azure\}

<SettingsInfoBlock type="Bool" default_value="1" />

Azure 테이블 함수를 사용할 때 스키마 추론 시 캐시를 사용합니다.

## schema_inference_use_cache_for_file \{#schema_inference_use_cache_for_file\}

<SettingsInfoBlock type="Bool" default_value="1" />

file 테이블 함수를 사용할 때 스키마 추론에서 캐시를 사용합니다.

## schema_inference_use_cache_for_hdfs \{#schema_inference_use_cache_for_hdfs\}

<SettingsInfoBlock type="Bool" default_value="1" />

hdfs table function을 사용할 때 스키마 추론 시 캐시를 사용합니다

## schema_inference_use_cache_for_s3 \{#schema_inference_use_cache_for_s3\}

<SettingsInfoBlock type="Bool" default_value="1" />

S3 테이블 함수 사용 시 스키마 추론에 캐시를 사용합니다.

## schema_inference_use_cache_for_url \{#schema_inference_use_cache_for_url\}

<SettingsInfoBlock type="Bool" default_value="1" />

URL 테이블 함수 사용 시 스키마 추론에서 캐시를 사용합니다.

## secondary_indices_enable_bulk_filtering \{#secondary_indices_enable_bulk_filtering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "데이터 스키핑 인덱스에 대한 새로운 필터링 알고리즘"}]}]}/>

인덱스에 대해 일괄 필터링 알고리즘을 활성화합니다. 항상 더 나은 성능을 낼 것으로 예상되지만, 호환성과 제어를 위해 이 설정이 유지됩니다.

## select_sequential_consistency \{#select_sequential_consistency\}

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
이 설정은 SharedMergeTree와 ReplicatedMergeTree에서 동작 방식이 다릅니다. SharedMergeTree에서 `select_sequential_consistency`가 어떻게 동작하는지에 대한 자세한 내용은 [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency)를 참조하십시오.
:::

`SELECT` 쿼리에 대한 순차 일관성(sequential consistency)을 활성화하거나 비활성화합니다. 이 설정을 사용하려면 `insert_quorum_parallel`이 비활성화되어 있어야 합니다. (`insert_quorum_parallel`의 기본값은 활성화입니다.)

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

사용 방법

순차 일관성이 활성화되면, ClickHouse는 클라이언트가 `insert_quorum`과 함께 실행된 모든 이전 `INSERT` 쿼리의 데이터를 포함하는 레플리카에 대해서만 `SELECT` 쿼리를 실행하도록 허용합니다. 클라이언트가 불완전한 레플리카에 접근하는 경우 ClickHouse는 예외를 발생시킵니다. 해당 SELECT 쿼리에는 아직 쿼럼 레플리카에 기록되지 않은 데이터가 포함되지 않습니다.

`insert_quorum_parallel`이 활성화되어 있는 경우(기본값), `select_sequential_consistency`는 동작하지 않습니다. 병렬 `INSERT` 쿼리가 서로 다른 쿼럼 레플리카 집합에 기록될 수 있으므로 단일 레플리카가 모든 쓰기 작업을 수신했다는 보장이 없기 때문입니다.

함께 보기:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level \{#send_logs_level\}

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

지정된 최소 레벨 이상의 서버 텍스트 로그를 클라이언트로 전송합니다. 유효한 값: 'trace', 'debug', 'information', 'warning', 'error', 'fatal', 'none'

## send_logs_source_regexp \{#send_logs_source_regexp\}

지정된 정규식(regexp)에 일치하는 로그 소스 이름을 가진 서버 텍스트 로그를 전송합니다. 비워 두면 모든 소스를 대상으로 합니다.

## send_profile_events \{#send_profile_events\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "새 설정. 클라이언트로 프로파일 이벤트를 전송할지 여부를 제어합니다."}]}]}/>

클라이언트로 [ProfileEvents](/native-protocol/server.md#profile-events) 패킷을 전송할지 여부를 활성화하거나 비활성화합니다.

프로파일 이벤트가 필요하지 않은 클라이언트의 네트워크 트래픽을 줄이기 위해 이 설정을 비활성화할 수 있습니다.

가능한 값:

- 0 — 비활성화됨.
- 1 — 활성화됨.

## send_progress_in_http_headers \{#send_progress_in_http_headers\}

<SettingsInfoBlock type="Bool" default_value="0" />

`clickhouse-server` 응답에서 `X-ClickHouse-Progress` HTTP 응답 헤더를 활성화하거나 비활성화합니다.

자세한 내용은 [HTTP 인터페이스 설명](/interfaces/http)을 참조하십시오.

가능한 값은 다음과 같습니다.

- 0 — 비활성화.
- 1 — 활성화.

## send_timeout \{#send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="300" />

네트워크로 데이터를 전송할 때의 타임아웃(초)입니다. 클라이언트가 데이터를 전송해야 하지만 이 시간 내에 단 한 바이트도 전송하지 못하면 예외가 발생합니다. 이 설정을 클라이언트에 지정하면, 해당 소켓의 `receive_timeout`도 서버 측 연결에서 함께 설정됩니다.

## serialize_query_plan \{#serialize_query_plan\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

분산 처리용으로 쿼리 플랜을 직렬화합니다

## serialize_string_in_memory_with_zero_byte \{#serialize_string_in_memory_with_zero_byte\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

집계 중인 String 값을 메모리에 직렬화할 때 문자열 끝에 0 바이트를 추가합니다. 서로 호환되지 않는 버전의 클러스터를 대상으로 쿼리할 때도 호환성을 유지하려면 이 설정을 활성화합니다.

## session_timezone \{#session_timezone\}

<BetaBadge />

현재 세션 또는 쿼리의 암시적(implicit) 시간대를 설정합니다.
암시적 시간대는 시간대가 명시적으로 지정되지 않은 DateTime/DateTime64 타입 값에 적용되는 시간대입니다.
이 설정은 전역으로 구성된(서버 수준) 암시적 시간대보다 우선합니다.
값이 &#39;&#39; (빈 문자열)인 경우 현재 세션 또는 쿼리의 암시적 시간대는 [server time zone](../server-configuration-parameters/settings.md/#timezone)과 동일합니다.

세션 시간대와 서버 시간대를 가져오기 위해 `timeZone()` 및 `serverTimeZone()` 함수를 사용할 수 있습니다.

가능한 값:

* `system.time_zones`에 있는 모든 시간대 이름. 예: `Europe/Berlin`, `UTC`, `Zulu`

예시:

```sql
SELECT timeZone(), serverTimeZone() FORMAT CSV

"Europe/Berlin","Europe/Berlin"
```

```sql
SELECT timeZone(), serverTimeZone() SETTINGS session_timezone = 'Asia/Novosibirsk' FORMAT CSV

"Asia/Novosibirsk","Europe/Berlin"
```

세션 시간대인 &#39;America/Denver&#39;를 명시적인 시간대가 없는 내부 DateTime 값에 할당합니다.

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
모든 DateTime/DateTime64를 파싱하는 FUNCTION이 `session_timezone`를 준수하는 것은 아닙니다. 이로 인해 미묘한 오류가 발생할 수 있습니다.
다음 예제와 설명을 참고하십시오.
:::

```sql
CREATE TABLE test_tz (`d` DateTime('UTC')) ENGINE = Memory AS SELECT toDateTime('2000-01-01 00:00:00', 'UTC');

SELECT *, timeZone() FROM test_tz WHERE d = toDateTime('2000-01-01 00:00:00') SETTINGS session_timezone = 'Asia/Novosibirsk'
0 rows in set.

SELECT *, timeZone() FROM test_tz WHERE d = '2000-01-01 00:00:00' SETTINGS session_timezone = 'Asia/Novosibirsk'
┌───────────────────d─┬─timeZone()───────┐
│ 2000-01-01 00:00:00 │ Asia/Novosibirsk │
└─────────────────────┴──────────────────┘
```

이는 서로 다른 파싱 파이프라인 때문입니다:

* 명시적으로 타임존을 지정하지 않은 `toDateTime()`이 첫 번째 `SELECT` 쿼리에서 사용될 때는 `session_timezone` 설정과 전역 타임존을 따릅니다.
* 두 번째 쿼리에서는 DateTime이 String에서 파싱되며, 기존 컬럼 `d`의 타입과 타임존을 상속합니다. 따라서 `session_timezone` 설정과 전역 타임존은 적용되지 않습니다.

**관련 항목**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode \{#set_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

데이터 양이 설정된 제한 중 하나를 초과했을 때 수행할 동작을 설정합니다.

가능한 값:

- `throw`: 예외를 발생시킵니다(기본값).
- `break`: 쿼리 실행을 중단하고, 소스 데이터가 소진된 것처럼 부분 결과만 반환합니다.

## shared_merge_tree_sync_parts_on_partition_operations \{#shared_merge_tree_sync_parts_on_partition_operations\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "새 설정입니다. 기본값으로 파트는 항상 동기화됩니다"}]}]}/>

SMT 테이블에서 MOVE|REPLACE|ATTACH 파티션 작업 후 데이터 파트 집합을 자동으로 동기화합니다. Cloud에서만 사용할 수 있습니다

## short_circuit_function_evaluation \{#short_circuit_function_evaluation\}

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

[if](../../sql-reference/functions/conditional-functions.md/#if), [multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf), [and](/sql-reference/functions/logical-functions#and), [or](/sql-reference/functions/logical-functions#or) 함수를 [단락 평가(short-circuit evaluation)](https://en.wikipedia.org/wiki/Short-circuit_evaluation) 방식으로 계산되도록 합니다. 이를 통해 이러한 함수에서 복잡한 표현식의 실행을 최적화하고, 예기치 않은 0으로 나누기와 같은 예외가 발생하는 것을 방지하는 데 도움이 됩니다.

가능한 값:

- `enable` — 예외를 던질 수 있거나 계산 비용이 큰 함수 등 단락 평가에 적합한 함수에 대해 단락 평가를 활성화합니다.
- `force_enable` — 모든 함수에 대해 단락 평가를 강제로 활성화합니다.
- `disable` — 단락 평가를 비활성화합니다.

## short_circuit_function_evaluation_for_nulls \{#short_circuit_function_evaluation_for_nulls\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "모든 인자의 값이 NULL이 아닌 행에서만 Nullable(널 허용) 인자를 가진 함수를 실행할 수 있도록 허용합니다"}]}]}/>

어떤 인자라도 NULL이면 NULL을 반환하는 함수의 평가를 최적화합니다. 함수 인자에서 NULL 값의 비율이 short_circuit_function_evaluation_for_nulls_threshold를 초과하면, 시스템은 행별 함수 평가를 수행하지 않습니다. 대신 모든 행에 대해 즉시 NULL을 반환하여 불필요한 연산을 방지합니다.

## short_circuit_function_evaluation_for_nulls_threshold \{#short_circuit_function_evaluation_for_nulls_threshold\}

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "널 허용(Nullable) 인자를 갖는 FUNCTION을, 모든 인자에 NULL이 아닌 값만 있는 행에 대해서만 실행할지 여부를 결정하는 NULL 값 비율 임계값입니다. short_circuit_function_evaluation_for_nulls SETTING이 활성화된 경우에 적용됩니다."}]}]}/>

널 허용(Nullable) 인자를 갖는 FUNCTION을, 모든 인자에 NULL이 아닌 값만 있는 행에 대해서만 실행할지 여부를 결정하는 NULL 값 비율 임계값입니다. `short_circuit_function_evaluation_for_nulls` SETTING이 활성화된 경우에 적용됩니다.
NULL 값을 포함하는 행의 수를 전체 행 수로 나눈 비율이 이 임계값을 초과하면, 이러한 NULL 값을 포함하는 행은 평가되지 않습니다.

## show_data_lake_catalogs_in_system_tables \{#show_data_lake_catalogs_in_system_tables\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Disable catalogs in system tables by default"}]}]}/>

시스템 테이블에 데이터 레이크 카탈로그를 표시하도록 활성화합니다.

## show_processlist_include_internal \{#show_processlist_include_internal\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "새로운 설정."}]}]}/>

`SHOW PROCESSLIST` 쿼리 출력에 내부 보조 프로세스를 표시합니다.

내부 프로세스에는 딕셔너리 다시 로드, 갱신 가능 구체화 뷰 다시 로드, `SHOW ...` 쿼리에서 실행되는 보조 `SELECT`, 손상된 테이블을 처리하기 위해 내부적으로 실행되는 보조 `CREATE DATABASE ...` 쿼리 등이 포함됩니다.

## show_table_uuid_in_table_create_query_if_not_nil \{#show_table_uuid_in_table_create_query_if_not_nil\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "Engine=Atomic 테이블의 CREATE 쿼리에 테이블 UID를 더 이상 표시하지 않습니다"}]}]}/>

`SHOW TABLE` 쿼리의 출력 형식을 설정합니다.

가능한 값:

- 0 — 쿼리가 테이블 UUID 없이 표시됩니다.
- 1 — 쿼리가 테이블 UUID와 함께 표시됩니다.

## single_join_prefer_left_table \{#single_join_prefer_left_table\}

<SettingsInfoBlock type="Bool" default_value="1" />

단일 JOIN에서 식별자가 모호한 경우 왼쪽 테이블을 우선적으로 사용합니다.

## skip_redundant_aliases_in_udf \{#skip_redundant_aliases_in_udf\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "이 설정을 활성화하면 동일한 테이블에서 여러 materialized 컬럼에 대해 동일한 사용자 정의 함수를 여러 번 사용할 수 있습니다."}]}]} />

사용을 단순화하기 위해 사용자 정의 함수에서는 불필요한 별칭이 사용되지(치환되지) 않습니다.

가능한 값:

* 1 — UDF에서 별칭이 생략(치환)됩니다.
* 0 — UDF에서 별칭이 생략되지 않고(치환되지 않고) 그대로 사용됩니다.

**Example**

활성화된 경우와 비활성화된 경우의 차이:

쿼리:

```sql
SET skip_redundant_aliases_in_udf = 0;
CREATE FUNCTION IF NOT EXISTS test_03274 AS ( x ) -> ((x + 1 as y, y + 2));

EXPLAIN SYNTAX SELECT test_03274(4 + 2);
```

결과:

```text
SELECT ((4 + 2) + 1 AS y, y + 2)
```

쿼리:

```sql
SET skip_redundant_aliases_in_udf = 1;
CREATE FUNCTION IF NOT EXISTS test_03274 AS ( x ) -> ((x + 1 as y, y + 2));

EXPLAIN SYNTAX SELECT test_03274(4 + 2);
```

결과:

```text
SELECT ((4 + 2) + 1, ((4 + 2) + 1) + 2)
```


## skip_unavailable_shards \{#skip_unavailable_shards\}

<SettingsInfoBlock type="Bool" default_value="0" />

사용할 수 없는 세그먼트를 오류 없이 건너뛸지 여부를 활성화하거나 비활성화합니다.

세그먼트의 모든 레플리카를 사용할 수 없는 경우 해당 세그먼트는 사용할 수 없는 것으로 간주됩니다. 레플리카는 다음과 같은 경우 사용할 수 없습니다.

- ClickHouse가 어떤 이유로든 레플리카에 연결할 수 없음.

    레플리카에 연결할 때 ClickHouse는 여러 번 시도합니다. 이러한 모든 시도가 실패하면 해당 레플리카는 사용할 수 없는 것으로 간주됩니다.

- DNS를 통해 레플리카를 확인할 수 없음.

    레플리카의 호스트 이름을 DNS를 통해 확인할 수 없는 경우, 다음과 같은 상황을 나타낼 수 있습니다.

    - 레플리카의 호스트에 DNS 레코드가 없음. 예를 들어 [Kubernetes](https://kubernetes.io)처럼 동적 DNS를 사용하는 시스템에서는 노드가 다운타임 동안 확인 불가능해질 수 있으며, 이는 오류가 아닙니다.

    - 구성 오류. ClickHouse 구성 파일에 잘못된 호스트 이름이 포함되어 있음.

가능한 값:

- 1 — 건너뛰기 활성화.

    세그먼트를 사용할 수 없는 경우 ClickHouse는 부분 데이터에 기반한 결과를 반환하며 노드 가용성 문제를 보고하지 않습니다.

- 0 — 건너뛰기 비활성화.

    세그먼트를 사용할 수 없는 경우 ClickHouse는 예외를 발생시킵니다.

## sleep_after_receiving_query_ms \{#sleep_after_receiving_query_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler에서 쿼리를 수신한 후 대기할 시간

## sleep_in_send_data_ms \{#sleep_in_send_data_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler에서 데이터를 전송하는 동안 일시 정지하는 시간

## sleep_in_send_tables_status_ms \{#sleep_in_send_tables_status_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler에서 테이블 상태 응답을 보내기 전 대기 시간

## sort_overflow_mode \{#sort_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

정렬 전에 수신된 행 개수가 설정된 한도 중 하나를 초과했을 때 어떻게 처리할지 지정합니다.

가능한 값:

- `throw`: 예외를 발생시킵니다.
- `break`: 쿼리 실행을 중단하고 부분 결과를 반환합니다.

## split_intersecting_parts_ranges_into_layers_final \{#split_intersecting_parts_ranges_into_layers_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 최적화 중에 교차하는 파트 범위를 레이어로 분할할 수 있도록 허용"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 최적화 중에 교차하는 파트 범위를 레이어로 분할할 수 있도록 허용"}]}]}/>

FINAL 최적화 중에 교차하는 파트 범위를 레이어로 분할합니다

## split_parts_ranges_into_intersecting_and_non_intersecting_final \{#split_parts_ranges_into_intersecting_and_non_intersecting_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 최적화 중에 파트 범위를 서로 겹치는 범위와 겹치지 않는 범위로 분할하도록 허용"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 최적화 중에 파트 범위를 서로 겹치는 범위와 겹치지 않는 범위로 분할하도록 허용"}]}]}/>

FINAL 최적화 중에 파트 범위를 서로 겹치는 범위와 겹치지 않는 범위로 분할합니다

## splitby_max_substrings_includes_remaining_string \{#splitby_max_substrings_includes_remaining_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

인자 `max_substrings`가 0보다 큰 함수 [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md)가 결과 배열의 마지막 요소에 나머지 문자열을 포함할지 여부를 제어합니다.

가능한 값:

- `0` - 결과 배열의 마지막 요소에 나머지 문자열을 포함하지 않습니다.
- `1` - 결과 배열의 마지막 요소에 나머지 문자열을 포함합니다. 이는 Spark의 [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) 함수 및 Python의 ['string.split()'](https://docs.python.org/3/library/stdtypes.html#str.split) 메서드의 동작과 동일합니다.

## stop_refreshable_materialized_views_on_startup \{#stop_refreshable_materialized_views_on_startup\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

서버 시작 시 `SYSTEM STOP VIEWS`를 실행한 것처럼 갱신 가능 구체화 뷰의 스케줄링이 되지 않도록 합니다. 이후 `SYSTEM START VIEWS` 또는 `SYSTEM START VIEW <name>`를 사용하여 수동으로 시작할 수 있습니다. 이 설정은 새로 생성되는 VIEW에도 적용됩니다. 갱신 가능이 아닌 materialized view에는 영향을 주지 않습니다.

## storage_file_read_method \{#storage_file_read_method\}

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

스토리지 파일에서 데이터를 읽는 방법을 지정합니다. 사용 가능한 값은 `read`, `pread`, `mmap`입니다. `mmap` 방식은 clickhouse-server에는 적용되지 않으며, clickhouse-local 전용입니다.

## storage_system_stack_trace_pipe_read_timeout_ms \{#storage_system_stack_trace_pipe_read_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

`system.stack_trace` 테이블에 대해 쿼리를 수행할 때 스레드로부터 정보를 받기 위해 파이프에서 데이터를 읽는 최대 시간입니다. 이 설정은 테스트 목적을 위해 사용되며, 사용자가 변경하도록 설계된 설정이 아닙니다.

## stream_flush_interval_ms \{#stream_flush_interval_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="7500" />

타임아웃이 발생했거나 스레드가 [max_insert_block_size](#max_insert_block_size) 행을 생성했을 때, 스트리밍을 사용하는 테이블에 적용됩니다.

기본값은 7500입니다.

값이 작을수록 더 자주 데이터가 테이블로 플러시됩니다. 값을 너무 낮게 설정하면 성능이 저하됩니다.

## stream_like_engine_allow_direct_select \{#stream_like_engine_allow_direct_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "기본적으로 Kafka/RabbitMQ/FileLog에 대해 직접 SELECT를 허용하지 않음"}]}]}/>

Kafka, RabbitMQ, FileLog, Redis Streams, S3Queue, AzureQueue 및 NATS 엔진에 대해 직접 `SELECT` 쿼리를 허용합니다. materialized view가 연결되어 있는 경우, 이 설정을 활성화하더라도 `SELECT` 쿼리는 허용되지 않습니다.
연결된 materialized view가 없는 경우, 이 설정을 활성화하면 데이터를 읽을 수 있습니다. 일반적으로 읽은 데이터는 큐에서 제거된다는 점에 유의해야 합니다. 읽은 데이터가 제거되지 않도록 하려면 관련 엔진 설정을 적절히 구성해야 합니다.

## stream_like_engine_insert_queue \{#stream_like_engine_insert_queue\}

stream 유사 엔진이 여러 큐에서 데이터를 읽는 경우, 데이터를 쓸 때 어느 큐에 삽입할지 하나를 선택해야 합니다. Redis Streams 및 NATS에서 사용됩니다.

## stream_poll_timeout_ms \{#stream_poll_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="500" />

스트리밍 저장소와의 데이터 폴링 타임아웃입니다.

## system_events_show_zero_values \{#system_events_show_zero_values\}

<SettingsInfoBlock type="Bool" default_value="0" />

[`system.events`](../../operations/system-tables/events.md)에서 값이 0인 이벤트도 선택할 수 있게 합니다.

일부 모니터링 시스템은 체크포인트마다 해당 시점의 모든 메트릭 값이 전달되어야 하며, 메트릭 값이 0인 경우도 포함됩니다.

가능한 값:

* 0 — 비활성화.
* 1 — 활성화.

**예시**

쿼리

```sql
SELECT * FROM system.events WHERE event='QueryMemoryLimitExceeded';
```

결과

```text
Ok.
```

쿼리

```sql
SET system_events_show_zero_values = 1;
SELECT * FROM system.events WHERE event='QueryMemoryLimitExceeded';
```

결과

```text
┌─event────────────────────┬─value─┬─description───────────────────────────────────────────┐
│ QueryMemoryLimitExceeded │     0 │ Number of times when memory limit exceeded for query. │
└──────────────────────────┴───────┴───────────────────────────────────────────────────────┘
```


## table_engine_read_through_distributed_cache \{#table_engine_read_through_distributed_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "새로운 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 테이블 엔진/테이블 함수(S3, Azure 등)를 통해 분산 캐시에서의 읽기를 허용합니다.

## table_function_remote_max_addresses \{#table_function_remote_max_addresses\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

[remote](../../sql-reference/table-functions/remote.md) 함수의 패턴에서 생성되는 주소의 최대 개수를 설정합니다.

가능한 값:

- 양의 정수.

## tcp_keep_alive_timeout \{#tcp_keep_alive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="290" />

TCP에서 keepalive probe를 전송하기 시작하기 전에 연결이 유휴 상태로 유지되는 시간(초)입니다.

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds \{#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds\}

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "파일 시스템 캐시에서 임시 데이터용 공간을 예약하기 위해 캐시를 잠그는 데 허용되는 대기 시간"}]}]}/>

파일 시스템 캐시에서 임시 데이터용 공간을 예약하기 위해 캐시를 잠그는 데 허용되는 대기 시간

## temporary_files_buffer_size \{#temporary_files_buffer_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "New setting"}]}]}/>

임시 파일 기록을 위한 버퍼 크기입니다. 버퍼 크기가 클수록 시스템 호출 횟수는 줄어들지만, 메모리 사용량은 증가합니다.

## temporary_files_codec \{#temporary_files_codec\}

<SettingsInfoBlock type="String" default_value="LZ4" />

디스크에서 정렬 및 조인 작업에 사용되는 임시 파일의 압축 코덱을 설정합니다.

가능한 값은 다음과 같습니다.

- LZ4 — [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) 압축이 적용됩니다.
- NONE — 압축이 적용되지 않습니다.

## text_index_hint_max_selectivity \{#text_index_hint_max_selectivity\}

<SettingsInfoBlock type="Float" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0.2"},{"label": "New setting"}]}]}/>

역색인 텍스트 인덱스에서 생성된 힌트를 사용할 수 있는 필터의 최대 선택도입니다.

## text_index_use_bloom_filter \{#text_index_use_bloom_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "새로운 설정입니다."}]}]}/>

테스트를 위해 텍스트 인덱스에서 블룸 필터 사용 여부를 설정합니다.

## throw_if_no_data_to_insert \{#throw_if_no_data_to_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

비어 있는 INSERT를 허용하거나 금지하며, 기본값은 활성화입니다(빈 INSERT 시 오류가 발생합니다). [`clickhouse-client`](/interfaces/cli)를 사용한 INSERT 또는 [gRPC 인터페이스](/interfaces/grpc)를 사용한 INSERT에만 적용됩니다.

## throw_on_error_from_cache_on_write_operations \{#throw_on_error_from_cache_on_write_operations\}

<SettingsInfoBlock type="Bool" default_value="0" />

쓰기 작업(INSERT, merges) 시 캐싱을 수행할 때 발생하는 캐시 오류를 무시합니다.

## throw_on_max_partitions_per_insert_block \{#throw_on_max_partitions_per_insert_block\}

<SettingsInfoBlock type="Bool" default_value="1" />

`max_partitions_per_insert_block`에 도달했을 때의 동작을 제어합니다.

가능한 값은 다음과 같습니다:

- `true`  - 하나의 INSERT 블록이 `max_partitions_per_insert_block`에 도달하면 예외를 발생시킵니다.
- `false` - `max_partitions_per_insert_block`에 도달하면 경고를 로그에 남깁니다.

:::tip
[`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)을 변경할 때 사용자에 미치는 영향을 파악하는 데 유용합니다.
:::

## throw_on_unsupported_query_inside_transaction \{#throw_on_unsupported_query_inside_transaction\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

트랜잭션 내에서 지원되지 않는 쿼리를 사용하면 예외를 발생시킵니다.

## timeout_before_checking_execution_speed \{#timeout_before_checking_execution_speed\}

<SettingsInfoBlock type="Seconds" default_value="10" />

초 단위로 지정된 시간이 경과한 후,
실행 속도가 너무 느리지 않은지(`min_execution_speed` 이상인지) 확인합니다.

## timeout_overflow_mode \{#timeout_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

쿼리 실행 시간이 `max_execution_time`을 초과하거나, 예상 실행 시간이 `max_estimated_execution_time`보다 긴 경우 어떻게 처리할지 설정합니다.

가능한 값은 다음과 같습니다:

- `throw`: 예외를 발생시킵니다(기본값).
- `break`: 쿼리 실행을 중지하고, 마치 소스 데이터가 더 이상 없는 것처럼 부분 결과를 반환합니다.

## timeout_overflow_mode_leaf \{#timeout_overflow_mode_leaf\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

리프 노드에서 실행되는 쿼리의 실행 시간이 `max_execution_time_leaf`를 초과할 때 어떻게 처리할지 설정합니다.

가능한 값:

- `throw`: 예외를 발생시킵니다(기본값).
- `break`: 쿼리 실행을 중단하고 마치 소스 데이터가 소진된 것처럼 부분 결과를 반환합니다.

## totals_auto_threshold \{#totals_auto_threshold\}

<SettingsInfoBlock type="Float" default_value="0.5" />

`totals_mode = 'auto'`에 대한 임계값입니다.
「WITH TOTALS 수정자」 섹션을 참조하십시오.

## totals_mode \{#totals_mode\}

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

HAVING이 있을 때와 max_rows_to_group_by 및 group_by_overflow_mode = 'any'가 설정되어 있을 때 TOTALS를 어떻게 계산할지 정의합니다.
「WITH TOTALS 수정자」 절을 참조하십시오.

## trace_profile_events \{#trace_profile_events\}

<SettingsInfoBlock type="Bool" default_value="0" />

프로파일 이벤트가 업데이트될 때마다 프로파일 이벤트 이름과 증가값과 함께 스택 트레이스를 수집하여 [trace_log](/operations/system-tables/trace_log)에 전송할지 여부를 설정합니다.

가능한 값:

- 1 — 프로파일 이벤트 추적이 활성화됩니다.
- 0 — 프로파일 이벤트 추적이 비활성화됩니다.

## trace_profile_events_list \{#trace_profile_events_list\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "New setting"}]}]}/>

`trace_profile_events` SETTING이 활성화되어 있을 때, 추적되는 이벤트를 쉼표로 구분된 이름 목록으로 제한합니다.
`trace_profile_events_list`가 빈 문자열(기본값)인 경우, 모든 프로파일 이벤트를 추적합니다.

예시 값: 'DiskS3ReadMicroseconds,DiskS3ReadRequestsCount,SelectQueryTimeMicroseconds,ReadBufferFromS3Bytes'

이 SETTING을 사용하면 매우 많은 수의 쿼리에 대해 데이터를 더 정밀하게 수집할 수 있습니다. 그렇지 않으면 방대한 양의 이벤트로 인해 내부 시스템 로그 큐가 오버플로우되어 일부가 손실될 수 있습니다.

## transfer_overflow_mode \{#transfer_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

데이터 양이 설정된 제한 중 하나를 초과했을 때 어떻게 처리할지 설정합니다.

가능한 값:

- `throw`: 예외를 발생시킵니다 (기본값).
- `break`: 쿼리 실행을 중단하고, 마치 소스 데이터가 소진된 것처럼
부분 결과만 반환합니다.

## transform_null_in \{#transform_null_in\}

<SettingsInfoBlock type="Bool" default_value="0" />

[IN](../../sql-reference/operators/in.md) 연산자에서 [NULL](/sql-reference/syntax#null) 값의 동등 비교를 활성화합니다.

기본적으로 `NULL` 값은 `NULL`이 정의되지 않은 값이라는 의미이므로 비교할 수 없습니다. 따라서 `expr = NULL` 비교는 항상 `false`를 반환해야 합니다. 이 설정을 사용하면 `IN` 연산자에 대해서 `NULL = NULL`이 `true`를 반환합니다.

가능한 값:

* 0 — `IN` 연산자에서 `NULL` 값 비교는 `false`를 반환합니다.
* 1 — `IN` 연산자에서 `NULL` 값 비교는 `true`를 반환합니다.

**예시**

`null_in` 테이블을 가정합니다:

```text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
│    3 │     3 │
└──────┴───────┘
```

쿼리:

```sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 0;
```

결과:

```text
┌──idx─┬────i─┐
│    1 │    1 │
└──────┴──────┘
```

쿼리:

```sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 1;
```

결과:

```text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
└──────┴───────┘
```

**참고**

* [IN 연산자의 NULL 처리](/sql-reference/operators/in#null-processing)


## traverse_shadow_remote_data_paths \{#traverse_shadow_remote_data_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "system.remote_data_paths를 쿼리할 때 shadow 디렉터리를 탐색합니다."}]}]}/>

system.remote_data_paths를 쿼리할 때 실제 테이블 데이터 외에 동결된 데이터(shadow 디렉터리)도 함께 탐색합니다.

## union_default_mode \{#union_default_mode\}

`SELECT` 쿼리 결과를 결합하는 모드를 설정합니다. 이 설정은 `UNION ALL` 또는 `UNION DISTINCT`를 명시적으로 지정하지 않고 [UNION](../../sql-reference/statements/select/union.md)을 사용할 때만 사용됩니다.

가능한 값:

- `'DISTINCT'` — ClickHouse가 쿼리를 결합한 결과에서 중복 행을 제거한 후 행을 출력합니다.
- `'ALL'` — ClickHouse가 쿼리를 결합한 결과에서 중복 행을 포함한 모든 행을 출력합니다.
- `''` — `UNION`과 함께 사용하면 ClickHouse가 예외를 발생시킵니다.

예시는 [UNION](../../sql-reference/statements/select/union.md)을 참고하십시오.

## unknown_packet_in_send_data \{#unknown_packet_in_send_data\}

<SettingsInfoBlock type="UInt64" default_value="0" />

N번째 데이터 패킷 대신 알 수 없는 패킷을 전송하도록 합니다.

## update_parallel_mode \{#update_parallel_mode\}

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "A new setting"}]}]}/>

동시에 실행되는 `UPDATE` 쿼리의 동작 방식을 결정합니다.

가능한 값:

- `sync` - 모든 `UPDATE` 쿼리를 순차적으로 실행합니다.
- `auto` - 하나의 쿼리에서 갱신되는 컬럼과, 다른 쿼리의 표현식에서 사용되는 컬럼 사이에 의존성이 있는 `UPDATE` 쿼리만 순차적으로 실행합니다.
- `async` - `UPDATE` 쿼리를 동기화하지 않습니다.

## update_sequential_consistency \{#update_sequential_consistency\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

true인 경우 업데이트를 실행하기 전에 파트 집합이 최신 버전으로 갱신됩니다.

## use_async_executor_for_materialized_views \{#use_async_executor_for_materialized_views\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

materialized view 쿼리를 비동기 및 멀티스레드 방식으로 실행하여 INSERT 시 materialized view 처리 속도를 높일 수 있으나, 메모리 사용량이 증가합니다.

## use_cache_for_count_from_files \{#use_cache_for_count_from_files\}

<SettingsInfoBlock type="Bool" default_value="1" />

테이블 함수 `file`/`S3`/`url`/`hdfs`/`azureBlobStorage`에서 파일에 대해 count 연산을 수행할 때 행 수를 캐시하도록 합니다.

기본적으로 활성화되어 있습니다.

## use_client_time_zone \{#use_client_time_zone\}

<SettingsInfoBlock type="Bool" default_value="0" />

서버의 시간대를 사용하는 대신, `DateTime` 문자열 값을 해석할 때 클라이언트의 시간대를 사용합니다.

## use_compact_format_in_distributed_parts_names \{#use_compact_format_in_distributed_parts_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "기본적으로 Distributed 테이블에 대한 비동기 INSERT에 compact 형식을 사용"}]}]}/>

`Distributed` 엔진을 사용하는 테이블에 대해 백그라운드 INSERT(`distributed_foreground_insert`) 시 블록을 저장할 때 compact 형식을 사용합니다.

가능한 값:

- 0 — `user[:password]@host:port#default_database` 디렉터리 형식을 사용합니다.
- 1 — `[shard{shard_index}[_replica{replica_index}]]` 디렉터리 형식을 사용합니다.

:::note

- `use_compact_format_in_distributed_parts_names=0`인 경우, 클러스터 정의의 변경 사항이 백그라운드 INSERT에는 적용되지 않습니다.
- `use_compact_format_in_distributed_parts_names=1`인 경우, 클러스터 정의에서 노드 순서를 변경하면 `shard_index`/`replica_index`가 변경되므로 주의하십시오.
:::

## use_concurrency_control \{#use_concurrency_control\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Enable concurrency control by default"}]}]}/>

서버의 동시성 제어 기능을 따릅니다(전역 서버 설정 `concurrent_threads_soft_limit_num` 및 `concurrent_threads_soft_limit_ratio_to_cores`를 참조하십시오). 비활성화하면 서버가 과부하 상태이더라도 더 많은 스레드를 사용할 수 있습니다(일반적인 사용에는 권장되지 않으며, 주로 테스트용으로 필요합니다).

## use_hash_table_stats_for_join_reordering \{#use_hash_table_stats_for_join_reordering\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "새로운 설정입니다. 이전에는 'collect_hash_table_stats_during_joins' 설정을 그대로 따랐습니다."}]}]}/>

조인 재정렬 시 카디널리티(기수)를 추정할 때 수집된 해시 테이블 통계를 사용하도록 설정합니다

## use_hedged_requests \{#use_hedged_requests\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "Enable Hedged Requests feature by default"}]}]}/>

원격 쿼리에 대해 hedged requests 로직을 활성화합니다. 이 기능을 사용하면 하나의 쿼리에 대해 서로 다른 레플리카에 여러 연결을 설정할 수 있습니다.
레플리카와의 기존 연결이 `hedged_connection_timeout` 내에 설정되지 않았거나,
`receive_data_timeout` 내에 데이터를 수신하지 못한 경우 새 연결이 설정됩니다. 쿼리는 비어 있지 않은 progress 패킷(또는 `allow_changing_replica_until_first_data_packet`가 설정된 경우 data 패킷)을
가장 먼저 전송한 연결을 사용하며, 나머지 연결은 취소됩니다. `max_parallel_replicas > 1`인 쿼리도 지원합니다.

기본적으로 활성화되어 있습니다.

Cloud 기본값: `1`

## use_hive_partitioning \{#use_hive_partitioning\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "기본값으로 설정이 활성화되었습니다."}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "File, URL, S3, AzureBlobStorage 및 HDFS 엔진에서 Hive 스타일 파티션을 사용할 수 있도록 허용합니다."}]}]}/>

이 설정을 활성화하면 ClickHouse는 파일과 유사한 테이블 엔진인 [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning)의 경로(`/name=value/`)에서 Hive 스타일 파티션을 감지하고, 쿼리에서 파티션 컬럼을 가상 컬럼으로 사용할 수 있게 합니다. 이러한 가상 컬럼의 이름은 파티션 경로에 있는 이름과 동일하지만, 앞에 `_`가 붙은 형태입니다.

## use_iceberg_metadata_files_cache \{#use_iceberg_metadata_files_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting"}]}]}/>

켜져 있으면 iceberg table function과 iceberg storage에서 iceberg 메타데이터 파일 캐시를 활용합니다.

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## use_iceberg_partition_pruning \{#use_iceberg_partition_pruning\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "기본값으로 Iceberg 파티션 프루닝을 활성화합니다."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Iceberg 파티션 프루닝을 위한 새로운 설정입니다."}]}]}/>

Iceberg 테이블에서 Iceberg 파티션 프루닝을 사용합니다.

## use_index_for_in_with_subqueries \{#use_index_for_in_with_subqueries\}

<SettingsInfoBlock type="Bool" default_value="1" />

IN 연산자의 오른쪽에 서브쿼리나 테이블 표현식이 있는 경우 인덱스를 사용하도록 시도합니다.

## use_index_for_in_with_subqueries_max_values \{#use_index_for_in_with_subqueries_max_values\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`IN` 연산자의 오른쪽에 있는 Set의 최대 크기입니다. 이 값 이하일 때 테이블 인덱스를 사용해 필터링합니다. 이를 통해 대용량 쿼리를 위해 추가 데이터 구조를 준비할 때 발생할 수 있는 성능 저하와 메모리 사용량 증가를 방지합니다. 0이면 제한이 없음을 의미합니다.

## use_join_disjunctions_push_down \{#use_join_disjunctions_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "이 최적화를 활성화했습니다."}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

OR로 연결된 JOIN 조건의 일부를 해당 입력 측으로 푸시다운하는 기능(「partial pushdown」)을 활성화합니다.
이를 통해 스토리지 엔진이 더 이른 단계에서 필터링할 수 있어, 읽어야 하는 데이터 양을 줄일 수 있습니다.
이 최적화는 의미를 보존하며, 각 최상위 OR 분기가 대상 측에 대해 최소 하나의 결정적 프레디케이트를 포함하는 경우에만 적용됩니다.

## use_legacy_to_time \{#use_legacy_to_time\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "새로운 설정입니다. 기존 toTime 함수 로직 사용을 허용하며, 이는 toTimeWithFixedDate처럼 동작합니다."}]}]}/>

이 설정을 활성화하면 시간 정보를 가진 날짜를 고정된 특정 날짜로 변환하면서 시간은 그대로 유지하는 레거시 `toTime` 함수를 사용할 수 있습니다.
비활성화된 경우, 여러 유형의 데이터를 `Time` 타입으로 변환하는 새로운 `toTime` 함수를 사용합니다.
기존 레거시 함수는 `toTimeWithFixedDate` 이름으로 항상 별도로 사용할 수 있습니다.

## use_page_cache_for_disks_without_file_cache \{#use_page_cache_for_disks_without_file_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "userspace 페이지 캐시 추가"}]}]}/>

파일 시스템 캐시가 활성화되지 않은 원격 디스크에 대해 userspace 페이지 캐시를 사용합니다.

## use_page_cache_for_local_disks \{#use_page_cache_for_local_disks\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "0"},{"label": "로컬 디스크에서 사용자 공간 페이지 캐시를 사용하기 위한 새로운 설정"}]}]}/>

로컬 디스크에서 데이터를 읽을 때 사용자 공간 페이지 캐시를 사용합니다. 주로 테스트 목적이며, 실제 환경에서 성능이 향상될 가능성은 낮습니다. `local_filesystem_read_method = 'pread'` 또는 `'read'` 설정이 필요합니다. OS 페이지 캐시는 비활성화하지 않으며, 이를 비활성화하려면 `min_bytes_to_use_direct_io`를 사용할 수 있습니다. `file()` 테이블 함수나 `File()` 테이블 엔진이 아닌 일반 테이블에만 영향을 미칩니다.

## use_page_cache_for_object_storage \{#use_page_cache_for_object_storage\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "0"},{"label": "객체 스토리지 테이블 함수에서 userspace 페이지 캐시를 사용하기 위한 새로운 설정입니다"}]}]}/>

객체 스토리지 테이블 함수(S3, Azure, HDFS) 및 테이블 엔진(S3, Azure, HDFS)에서 데이터를 읽을 때 userspace 페이지 캐시를 사용합니다.

## use_page_cache_with_distributed_cache \{#use_page_cache_with_distributed_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

distributed cache가 사용되는 경우 userspace page cache를 사용합니다.

## use_paimon_partition_pruning \{#use_paimon_partition_pruning\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "새 설정입니다."}]}]}/>

Paimon 테이블 함수에서 Paimon 파티션 프루닝을 사용합니다

## use_primary_key \{#use_primary_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "MergeTree가 쿼리 실행 중 그래뉼 수준에서 프루닝할 때 기본 키 사용 여부를 제어하는 새로운 설정입니다."}]}]}/>

MergeTree 테이블에서 쿼리 실행 시 기본 키를 사용하여 그래뉼을 프루닝하도록 합니다.

가능한 값:

- 0 — 비활성화됨.
- 1 — 활성화됨.

## use_query_cache \{#use_query_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

사용하도록 설정하면 `SELECT` 쿼리가 [쿼리 캐시](../query-cache.md)를 사용할 수 있습니다. [enable_reads_from_query_cache](#enable_reads_from_query_cache) 및 [enable_writes_to_query_cache](#enable_writes_to_query_cache) 매개변수로 캐시 사용 방식을 보다 세밀하게 제어합니다.

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## use_query_condition_cache \{#use_query_condition_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "새 최적화 기능"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "새 설정"}]}]}/>

[query condition cache](/operations/query-condition-cache)를 활성화합니다. 이 캐시는 데이터 파트(파트)에서 `WHERE` 절의 조건을 만족하지 않는 그래뉼의 범위를 저장하고,
이 정보를 이후 쿼리에서 임시 인덱스로 재사용합니다.

가능한 값:

- 0 - 비활성화
- 1 - 활성화

## use_roaring_bitmap_iceberg_positional_deletes \{#use_roaring_bitmap_iceberg_positional_deletes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "새 설정"}]}]}/>

Iceberg 위치 기반 삭제(positional delete)에 roaring bitmap을 사용합니다.

## use_skip_indexes \{#use_skip_indexes\}

<SettingsInfoBlock type="Bool" default_value="1" />

쿼리 실행 중에 데이터 스키핑 인덱스를 사용합니다.

가능한 값:

- 0 — 사용 안 함.
- 1 — 사용함.

## use_skip_indexes_for_disjunctions \{#use_skip_indexes_for_disjunctions\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

AND와 OR 조건이 혼합된 WHERE 필터를 skip 인덱스를 사용하여 평가합니다. 예: WHERE A = 5 AND (B = 5 OR C = 5).
비활성화된 경우에도 skip 인덱스를 사용하여 WHERE 조건을 평가하지만, 이때는 AND로만 연결된 절만 포함해야 합니다.

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## use_skip_indexes_for_top_k \{#use_skip_indexes_for_top_k\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "새로운 설정."}]}]}/>

TopK 필터링에 데이터 스키핑 인덱스를 사용하도록 설정합니다.

이 설정을 활성화하면 `ORDER BY <column> LIMIT n` 쿼리에서 해당 컬럼에 minmax 스킵 인덱스가 존재하는 경우 옵티마이저가 최종 결과와 관련이 없는 그래뉼을 건너뛰기 위해 minmax 인덱스를 사용하려고 시도합니다. 이렇게 하면 쿼리 지연 시간이 줄어들 수 있습니다.

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## use_skip_indexes_if_final \{#use_skip_indexes_if_final\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "설정 기본값 변경"}]}]}/>

FINAL 수정자가 포함된 쿼리를 실행할 때 스킵 인덱스 사용 여부를 제어합니다.

스킵 인덱스는 최신 데이터를 포함하는 행(그래뉼)을 제외할 수 있어, FINAL 수정자가 포함된 쿼리 결과가 올바르지 않을 수 있습니다. 이 설정이 활성화되어 있으면 FINAL 수정자가 있어도 스킵 인덱스가 적용되며, 최신 업데이트를 놓칠 위험이 있는 대신 성능이 향상될 수 있습니다. 이 설정은 use_skip_indexes_if_final_exact_mode 설정과 동기화되도록 함께 활성화하는 것이 좋습니다(기본적으로 활성화됨).

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## use_skip_indexes_if_final_exact_mode \{#use_skip_indexes_if_final_exact_mode\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Change in default value of setting"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "This setting was introduced to help FINAL query return correct results with skip indexes"}]}]}/>

이 설정은 스킵 인덱스에 의해 반환된 그래뉼을, FINAL 수정자를 사용해 쿼리를 실행할 때 올바른 결과를 반환하도록 더 최신 파트에서 확장할지 여부를 제어합니다.

스킵 인덱스를 사용하면 최신 데이터를 포함하는 행(그래뉼)이 제외되어 잘못된 결과가 발생할 수 있습니다. 이 설정은 스킵 인덱스가 반환한 범위와 겹치는 더 최신 파트를 스캔하여 올바른 결과가 반환되도록 보장할 수 있습니다. 애플리케이션에서 스킵 인덱스를 조회해 얻은 근사 결과도 허용되는 경우에만 이 설정을 비활성화해야 합니다.

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## use_skip_indexes_on_data_read \{#use_skip_indexes_on_data_read\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "기본값: 사용"}]}, {"id": "row-2","items": [{"label": "25.9"},{"label": "0"},{"label": "새 설정"}]}]}/>

데이터를 읽는 동안 데이터 스키핑 인덱스를 사용하도록 설정합니다.

활성화하면 쿼리 실행이 시작되기 전에 미리 분석하는 대신, 각 데이터 그래뉼을 읽을 때마다 데이터 스키핑 인덱스가 동적으로 평가됩니다. 이를 통해 쿼리 시작 지연 시간을 줄일 수 있습니다.

가능한 값:

- 0 — 비활성화됨.
- 1 — 활성화됨.

## use_statistics \{#use_statistics\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "Enable this optimization by default."}]}]}/>

/// 'use_primary_key' 및 'use_skip_indexes'와의 일관성을 위해 'allow_statistics_optimize'보다 선호됩니다
쿼리 최적화를 위해 통계 사용을 허용합니다

## use_statistics_cache \{#use_statistics_cache\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "statistics 캐시 활성화"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "0"},{"label": "새 설정"}]}]}/>

각 파트의 통계를 로드하는 오버헤드를 피하기 위해 쿼리에서 statistics 캐시를 사용합니다.

## use_structure_from_insertion_table_in_table_functions \{#use_structure_from_insertion_table_in_table_functions\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "테이블 함수에서 데이터 기반 스키마 추론 대신 삽입 테이블 구조 사용 방식 개선"}]}]}/>

데이터에 대한 스키마 추론 대신 삽입 테이블의 구조를 사용합니다. 가능한 값: 0 - 비활성화, 1 - 활성화, 2 - 자동

## use_text_index_dictionary_cache \{#use_text_index_dictionary_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

역직렬화된 텍스트 인덱스 딕셔너리 블록 캐시 사용 여부를 지정합니다.
텍스트 인덱스 딕셔너리 블록 캐시를 사용하면 대량의 텍스트 인덱스 쿼리를 처리할 때 지연 시간을 크게 줄이고 처리량을 높일 수 있습니다.

## use_text_index_header_cache \{#use_text_index_header_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

역직렬화된 텍스트 인덱스 헤더 캐시를 사용할지 여부입니다.
텍스트 인덱스 헤더 캐시를 사용하면 대량의 텍스트 인덱스 쿼리를 처리할 때 지연 시간을 크게 줄이고 처리량을 높일 수 있습니다.

## use_text_index_postings_cache \{#use_text_index_postings_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

역직렬화된 텍스트 인덱스 포스팅 리스트 캐시를 사용할지 여부입니다.
텍스트 인덱스 포스팅 캐시를 사용하면 다수의 텍스트 인덱스 쿼리를 처리할 때 지연 시간이 크게 줄어들고 처리량이 증가할 수 있습니다.

## use_top_k_dynamic_filtering \{#use_top_k_dynamic_filtering\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "새로운 설정입니다."}]}]}/>

`ORDER BY <column> LIMIT n` 쿼리를 실행할 때 동적 필터링 최적화를 활성화합니다.

이 설정을 활성화하면, 쿼리 실행기는 최종 결과 집합의 `top N` 행에 포함되지 않을 그래뉼과 행을 건너뛰려고 시도합니다. 이 최적화는 동적으로 동작하며, 대기 시간(latency) 개선 정도는 데이터 분포와 쿼리에 포함된 다른 조건식 존재 여부에 따라 달라집니다.

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## use_uncompressed_cache \{#use_uncompressed_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

압축되지 않은 블록 캐시를 사용할지 여부입니다. 0 또는 1을 허용합니다. 기본값은 0(비활성화)입니다.
압축되지 않은 캐시(MergeTree 계열 테이블에만 해당)를 사용하면 많은 수의 짧은 쿼리를 처리할 때 지연 시간을 크게 줄이고 처리량을 높일 수 있습니다. 짧은 쿼리를 자주 보내는 사용자에 대해서는 이 설정을 활성화하십시오. 또한 압축되지 않은 캐시 블록의 크기(구성 파일에서만 설정)를 나타내는 [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 구성 파라미터에도 유의해야 합니다. 기본값은 8 GiB입니다. 압축되지 않은 캐시는 필요에 따라 채워지며, 가장 적게 사용된 데이터는 자동으로 삭제됩니다.

적어도 어느 정도 큰 양의 데이터(100만 행 이상)를 읽는 쿼리의 경우, 실제로 작은 쿼리를 위한 공간을 확보하기 위해 압축되지 않은 캐시가 자동으로 비활성화됩니다. 따라서 「use_uncompressed_cache」 설정을 항상 1로 유지해도 무방합니다.

## use_variant_as_common_type \{#use_variant_as_common_type\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "사용성을 개선합니다."}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "0"},{"label": "공통 타입이 없을 때 if/multiIf에서 Variant를 사용할 수 있도록 허용합니다."}]}]} />

인자 타입들 사이에 공통 타입이 없을 때 [if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md) 함수의 결과 타입으로 `Variant` 타입을 사용할 수 있게 합니다.

예:

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(if(number % 2, number, range(number))) as variant_type FROM numbers(1);
SELECT if(number % 2, number, range(number)) as variant FROM numbers(5);
```

```text
┌─variant_type───────────────────┐
│ Variant(Array(UInt64), UInt64) │
└────────────────────────────────┘
┌─variant───┐
│ []        │
│ 1         │
│ [0,1]     │
│ 3         │
│ [0,1,2,3] │
└───────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(multiIf((number % 4) = 0, 42, (number % 4) = 1, [1, 2, 3], (number % 4) = 2, 'Hello, World!', NULL)) AS variant_type FROM numbers(1);
SELECT multiIf((number % 4) = 0, 42, (number % 4) = 1, [1, 2, 3], (number % 4) = 2, 'Hello, World!', NULL) AS variant FROM numbers(4);
```

```text
─variant_type─────────────────────────┐
│ Variant(Array(UInt8), String, UInt8) │
└──────────────────────────────────────┘

┌─variant───────┐
│ 42            │
│ [1,2,3]       │
│ Hello, World! │
│ ᴺᵁᴸᴸ          │
└───────────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(array(range(number), number, 'str_' || toString(number))) as array_of_variants_type from numbers(1);
SELECT array(range(number), number, 'str_' || toString(number)) as array_of_variants FROM numbers(3);
```

```text
┌─array_of_variants_type────────────────────────┐
│ Array(Variant(Array(UInt64), String, UInt64)) │
└───────────────────────────────────────────────┘

┌─array_of_variants─┐
│ [[],0,'str_0']    │
│ [[0],1,'str_1']   │
│ [[0,1],2,'str_2'] │
└───────────────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(map('a', range(number), 'b', number, 'c', 'str_' || toString(number))) as map_of_variants_type from numbers(1);
SELECT map('a', range(number), 'b', number, 'c', 'str_' || toString(number)) as map_of_variants FROM numbers(3);
```

```text
┌─map_of_variants_type────────────────────────────────┐
│ Map(String, Variant(Array(UInt64), String, UInt64)) │
└─────────────────────────────────────────────────────┘

┌─map_of_variants───────────────┐
│ {'a':[],'b':0,'c':'str_0'}    │
│ {'a':[0],'b':1,'c':'str_1'}   │
│ {'a':[0,1],'b':2,'c':'str_2'} │
└───────────────────────────────┘
```


## use_variant_default_implementation_for_comparisons \{#use_variant_default_implementation_for_comparisons\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "비교 함수에서 Variant 타입에 대한 기본 구현 활성화"}]}]}/>

비교 함수에서 Variant 타입에 대한 기본 구현 사용 여부를 설정합니다.

## use_with_fill_by_sorting_prefix \{#use_with_fill_by_sorting_prefix\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "ORDER BY 절에서 WITH FILL 컬럼 앞에 위치한 컬럼은 정렬 접두어(sorting prefix)를 형성합니다. 정렬 접두어 값이 서로 다른 행은 각각 독립적으로 채워집니다"}]}]}/>

ORDER BY 절에서 WITH FILL 컬럼 앞에 위치한 컬럼은 정렬 접두어(sorting prefix)를 형성합니다. 정렬 접두어 값이 서로 다른 행은 각각 독립적으로 채워집니다

## validate_enum_literals_in_operators \{#validate_enum_literals_in_operators\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

이 설정을 활성화하면 `IN`, `NOT IN`, `==`, `!=` 같은 연산자에서 enum 리터럴이 enum 타입에 속하는지 검증하고, 리터럴이 유효한 enum 값이 아니면 예외를 발생시킵니다.

## validate_mutation_query \{#validate_mutation_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "기본적으로 뮤테이션 쿼리를 검증하는 새로운 설정입니다."}]}]}/>

이 설정은 뮤테이션 쿼리를 수락하기 전에 검증합니다. 뮤테이션은 백그라운드에서 실행되며, 잘못된 쿼리를 실행하면 뮤테이션이 멈춰 버려 수동 개입이 필요하게 됩니다.

하위 호환성이 없는 버그가 발생한 경우에만 이 설정을 변경하십시오.

## validate_polygons \{#validate_polygons\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "기본적으로 `pointInPolygon` 함수에서 폴리곤이 올바르지 않은 경우, 잘못된 결과를 반환할 가능성이 있는 대신 예외를 발생시키도록 합니다"}]}]}/>

폴리곤이 자기 교차(self-intersecting) 또는 자기 접선(self-tangent)인 경우 [pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon) 함수에서 예외를 발생시킬지 여부를 설정합니다.

가능한 값:

- 0 — 예외 발생이 비활성화됩니다. `pointInPolygon`은 올바르지 않은 폴리곤을 허용하며, 이에 대해 잘못된 결과를 반환할 수 있습니다.
- 1 — 예외 발생이 활성화됩니다.

## vector_search_filter_strategy \{#vector_search_filter_strategy\}

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

벡터 검색 쿼리에 WHERE 절이 있는 경우, 이 설정은 해당 WHERE 절을 먼저 평가할지(프리필터링), 아니면 벡터 유사도 인덱스를 먼저 확인할지(포스트필터링)를 결정합니다. 가능한 값은 다음과 같습니다.

- 'auto' - 포스트필터링(정확한 동작 방식은 향후 변경될 수 있습니다).
- 'postfilter' - 벡터 유사도 인덱스를 사용하여 가장 가까운 이웃을 식별한 다음, 다른 필터를 적용합니다.
- 'prefilter' - 다른 필터를 먼저 평가한 뒤, 브루트 포스 검색을 수행하여 이웃을 식별합니다.

## vector_search_index_fetch_multiplier \{#vector_search_index_fetch_multiplier\}

**별칭(Aliases)**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "설정 'vector_search_postfilter_multiplier'의 별칭"}]}]}/>

벡터 유사도 인덱스에서 가져오는 최근접 이웃의 개수를 이 값으로 곱합니다. 다른 조건자와 함께 후처리(post-filtering)로 필터링을 수행하거나 `vector_search_with_rescoring = 1`로 설정된 경우에만 적용됩니다.

## vector_search_with_rescoring \{#vector_search_with_rescoring\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

ClickHouse가 벡터 유사도 인덱스를 사용하는 쿼리에 대해 재점수를 수행할지 여부를 설정합니다.
재점수 없이 동작하는 경우, 벡터 유사도 인덱스는 가장 잘 일치하는 값을 포함한 행들을 바로 반환합니다.
재점수를 사용하는 경우, 행들이 그라뉼(granule) 수준으로 확장된 다음, 해당 그라뉼의 모든 행이 다시 검사됩니다.
대부분의 상황에서 재점수는 정확도를 소폭만 향상시키는 반면, 벡터 검색 쿼리의 성능을 크게 저하시킵니다.
참고: 재점수 없이 실행되는 쿼리라도 병렬 레플리카가 활성화된 경우 자동으로 재점수가 적용될 수 있습니다.

## wait_changes_become_visible_after_commit_mode \{#wait_changes_become_visible_after_commit_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

커밋된 변경 사항이 최신 스냅샷에 실제로 반영되어 보이게 될 때까지 대기합니다

## wait_for_async_insert \{#wait_for_async_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

`true`인 경우 비동기 삽입 작업이 처리될 때까지 대기합니다.

## wait_for_async_insert_timeout \{#wait_for_async_insert_timeout\}

<SettingsInfoBlock type="Seconds" default_value="120" />

비동기 `INSERT` 처리가 완료될 때까지 대기하는 시간 제한입니다.

## wait_for_window_view_fire_signal_timeout \{#wait_for_window_view_fire_signal_timeout\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

이벤트 시간(event time) 처리에서 window view fire signal을 기다리는 대기 시간 제한입니다.

## window_view_clean_interval \{#window_view_clean_interval\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

만료된 데이터를 정리하기 위한 window view의 정리 주기(초 단위)입니다.

## window_view_heartbeat_interval \{#window_view_heartbeat_interval\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

watch 쿼리가 실행 중임을 나타내는 하트비트 간격(초)입니다.

## workload \{#workload\}

<SettingsInfoBlock type="String" default_value="default" />

리소스에 접근할 때 사용할 workload 이름입니다.

## write_full_path_in_iceberg_metadata \{#write_full_path_in_iceberg_metadata\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

전체 경로(S3:// 포함)를 iceberg 메타데이터 파일에 기록합니다.

## write_through_distributed_cache \{#write_through_distributed_cache\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud용 설정"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. 분산 캐시에 대한 쓰기를 허용합니다(S3로의 쓰기도 분산 캐시를 통해 수행됩니다).

## write_through_distributed_cache_buffer_size \{#write_through_distributed_cache_buffer_size\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New cloud setting"}]}]}/>

ClickHouse Cloud에서만 적용됩니다. write-through 분산 캐시의 버퍼 크기를 설정합니다. 값이 0이면, 분산 캐시가 없었다면 사용했을 버퍼 크기를 사용합니다.

## zstd_window_log_max \{#zstd_window_log_max\}

<SettingsInfoBlock type="Int64" default_value="0" />

ZSTD의 최대 window log를 선택할 수 있습니다(MergeTree 계열에는 사용되지 않습니다).