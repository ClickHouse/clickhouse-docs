---
description: '`system.merge_tree_settings`에 포함된 MergeTree 설정'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree 테이블 설정'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

시스템 테이블 `system.merge_tree_settings`는 전역 MergeTree 설정값을 보여줍니다.

MergeTree 설정은 서버 설정 파일의 `merge_tree` 섹션에서 지정하거나,
각 `MergeTree` 테이블에 대해 `CREATE TABLE` 문의 `SETTINGS` 절에서 개별적으로 지정할 수 있습니다.

설정 `max_suspicious_broken_parts`를 사용자 정의하는 예:

서버 설정 파일에서 모든 `MergeTree` 테이블에 대한 기본값을 설정합니다:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

특정 테이블에 대한 설정:

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

특정 테이블의 설정을 변경하려면 `ALTER TABLE ... MODIFY SETTING` 명령을 사용합니다:

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree 설정 \{#mergetree-settings\}

{/* 아래 설정은 다음 스크립트에 의해 자동으로 생성되었습니다.
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }


## adaptive_write_buffer_initial_size \{#adaptive_write_buffer_initial_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16384" />

적응형 쓰기 버퍼의 초기 크기입니다.

## add_implicit_sign_column_constraint_for_collapsing_engine \{#add_implicit_sign_column_constraint_for_collapsing_engine\}

<SettingsInfoBlock type="Bool" default_value="0" />

값이 true이면 CollapsingMergeTree 또는 VersionedCollapsingMergeTree 테이블의 `sign` 컬럼에 암시적 제약 조건을 추가하여 유효한 값(`1` 및 `-1`)만 허용합니다.

## add_minmax_index_for_numeric_columns \{#add_minmax_index_for_numeric_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

이 설정을 활성화하면 테이블의 모든 숫자형 컬럼에 min-max(건너뛰기) 인덱스가 추가됩니다.

## add_minmax_index_for_string_columns \{#add_minmax_index_for_string_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

이 설정을 활성화하면 테이블의 모든 문자열 컬럼에 min-max(스키핑) 인덱스가 추가됩니다.

## add_minmax_index_for_temporal_columns \{#add_minmax_index_for_temporal_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "0"},{"label": "새 설정"}]}]}/>

사용하도록 설정하면 테이블의 모든 Date, Date32, Time, Time64, DateTime, DateTime64 컬럼에 대해 min-max(건너뛰기) 인덱스가 추가됩니다.

## allow_coalescing_columns_in_partition_or_order_key \{#allow_coalescing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "파티션 또는 정렬 키에서 coalescing 컬럼 사용을 허용하는 새로운 설정입니다."}]}]}/>

활성화되면 CoalescingMergeTree 테이블에서 coalescing 컬럼을 파티션 키 또는 정렬 키로 사용할 수 있습니다.

## allow_experimental_replacing_merge_with_cleanup \{#allow_experimental_replacing_merge_with_cleanup\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

`is_deleted` 컬럼이 있는 ReplacingMergeTree에 대해 실험적인 CLEANUP 머지를 허용합니다. 이 옵션을 활성화하면 `OPTIMIZE ... FINAL CLEANUP`을 사용하여 파티션의 모든 파트를 하나의 파트로 수동으로 머지하고, 삭제된 행을 제거할 수 있습니다.

또한 `min_age_to_force_merge_seconds`,
`min_age_to_force_merge_on_partition_only`,
`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` 설정을 사용하여 이러한 머지가 백그라운드에서 자동으로 수행되도록 허용합니다.

## allow_experimental_reverse_key \{#allow_experimental_reverse_key\}

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

MergeTree 정렬 키에서 내림차순 정렬을 사용할 수 있도록 합니다. 이
설정은 시계열 분석과 Top-N 쿼리에 특히 유용하며,
쿼리 성능을 최적화하기 위해 데이터를 역(내림차순) 시간 순서로 저장할 수 있게 합니다.

`allow_experimental_reverse_key`를 활성화하면 MergeTree 테이블의 `ORDER BY` 절에서
내림차순 정렬 순서를 정의할 수 있습니다. 이를 통해 내림차순 쿼리에서
`ReadInReverseOrder` 대신 더 효율적인 `ReadInOrder` 최적화를 사용할 수 있습니다.

**예시**

```sql
CREATE TABLE example
(
time DateTime,
key Int32,
value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- Descending order on 'time' field
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

쿼리에서 `ORDER BY time DESC`를 사용하면 `ReadInOrder`가 적용됩니다.

**기본값:** false


## allow_floating_point_partition_key \{#allow_floating_point_partition_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

부동 소수점 숫자를 파티션 키로 사용할 수 있도록 허용합니다.

가능한 값:

- `0` — 부동 소수점 파티션 키를 허용하지 않습니다.
- `1` — 부동 소수점 파티션 키를 허용합니다.

## allow_nullable_key \{#allow_nullable_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

널 허용(Nullable) 타입을 기본 키로 사용하는 것을 허용합니다.

## allow_part_offset_column_in_projections \{#allow_part_offset_column_in_projections\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "이제 프로젝션에서 '_part_offset' 컬럼을 사용할 수 있습니다."}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "새로운 설정입니다. 안정화될 때까지 부모 파트 오프셋 컬럼을 사용하는 프로젝션이 생성되지 않도록 보호합니다."}]}]}/>

프로젝션에 대한 SELECT 쿼리에서 '_part_offset' 컬럼 사용을 허용합니다.

## allow_reduce_blocking_parts_task \{#allow_reduce_blocking_parts_task\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "이제 SMT가 기본적으로 ZooKeeper에서 오래된 blocking 파트를 제거합니다"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 동기화"}]}]}/>

공유 MergeTree 테이블에서 blocking 파트를 줄이는 백그라운드 작업입니다.
ClickHouse Cloud에서만 지원됩니다.

## allow_remote_fs_zero_copy_replication \{#allow_remote_fs_zero_copy_replication\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

프로덕션 환경에서는 이 설정을 사용하지 마십시오. 아직 안정화되지 않았습니다.

## allow_summing_columns_in_partition_or_order_key \{#allow_summing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "파티션 또는 정렬 키 컬럼을 합산할 수 있도록 하는 새로운 설정"}]}]}/>

이 설정을 활성화하면 SummingMergeTree 테이블에서 합산되는 컬럼을
파티션 키 또는 정렬 키로 사용할 수 있습니다.

## allow_suspicious_indices \{#allow_suspicious_indices\}

<SettingsInfoBlock type="Bool" default_value="0" />

동일한 식을 사용하는 기본/보조 인덱스와 정렬 키를 거부합니다.

## allow_vertical_merges_from_compact_to_wide_parts \{#allow_vertical_merges_from_compact_to_wide_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

compact 파트에서 wide 파트로의 수직 병합을 허용합니다. 이 설정은 모든 레플리카에서 동일한 값으로 설정되어야 합니다.

## alter_column_secondary_index_mode \{#alter_column_secondary_index_mode\}

<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "Change the behaviour to allow ALTER `column` when they have dependent secondary indices"}]}]}/>

보조 인덱스가 걸려 있는 컬럼을 수정하는 `ALTER` 명령을 허용할지 여부와, 허용되는 경우 어떤 동작을 수행할지 설정합니다. 기본적으로 이러한 `ALTER` 명령은 허용되며 인덱스가 다시 빌드됩니다.

가능한 값:

- `rebuild` (기본값): `ALTER` 명령의 컬럼에 의해 영향을 받는 모든 보조 인덱스를 다시 빌드합니다.
- `throw`: 예외를 발생시켜 **명시적** 보조 인덱스가 걸려 있는 컬럼에 대한 모든 `ALTER`를 차단합니다. 암시적 인덱스는 이 제한에서 제외되며 다시 빌드됩니다.
- `drop`: 종속된 보조 인덱스를 삭제합니다. 새 파트에는 해당 인덱스가 없으며, 이를 다시 만들려면 `MATERIALIZE INDEX`가 필요합니다.
- `compatibility`: 기존 동작과 동일하게 동작합니다. `ALTER ... MODIFY COLUMN`에는 `throw`, `ALTER ... UPDATE/DELETE`에는 `rebuild`를 수행합니다.
- `ignore`: 전문가용으로 의도된 설정입니다. 인덱스를 일관되지 않은 상태로 남겨 두며, 잘못된 쿼리 결과가 발생할 수 있습니다.

## always_fetch_merged_part \{#always_fetch_merged_part\}

<SettingsInfoBlock type="Bool" default_value="0" />

true인 경우, 이 레플리카는 파트를 머지하지 않고 항상 다른 레플리카에서 머지된 파트를 다운로드합니다.

가능한 값:

- true, false

## always_use_copy_instead_of_hardlinks \{#always_use_copy_instead_of_hardlinks\}

<SettingsInfoBlock type="Bool" default_value="0" />

뮤테이션/교체/분리 작업 등에서 하드링크를 생성하는 대신 항상 데이터를 복사하도록 합니다.

## apply_patches_on_merge \{#apply_patches_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

이 설정이 true이면 머지 시 패치 파트가 적용됩니다.

## assign_part_uuids \{#assign_part_uuids\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면 새 파트가 생성될 때마다 고유한 파트 식별자가 할당됩니다.
활성화하기 전에 모든 레플리카가 UUID 버전 4를 지원하는지 확인하십시오.

## async_block_ids_cache_update_wait_ms \{#async_block_ids_cache_update_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

각 insert 반복에서 async_block_ids_cache 업데이트를 위해 대기하는 시간

## async_insert \{#async_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

값이 true이면 INSERT 쿼리의 데이터는 큐에 저장되었다가 이후 백그라운드에서 테이블에 반영됩니다.

## auto_statistics_types \{#auto_statistics_types\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting"}]}]}/>

적용 가능한 모든 컬럼에 대해 자동으로 계산할 통계 유형의 쉼표로 구분된 목록입니다.
지원되는 통계 유형: tdigest, countmin, minmax, uniq.

## background_task_preferred_step_execution_time_ms \{#background_task_preferred_step_execution_time_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

머지(merge) 또는 뮤테이션(mutation)의 한 단계 실행에 대한 목표 시간입니다.  
단일 단계의 수행 시간이 더 오래 걸리는 경우 이 목표 시간은 초과될 수 있습니다.

## cache_populated_by_fetch \{#cache_populated_by_fetch\}

<SettingsInfoBlock type="Bool" default_value="0" />

:::note
이 설정은 ClickHouse Cloud에만 적용됩니다.
:::

`cache_populated_by_fetch`가 비활성화되어 있을 때(기본값), 새 데이터
파트는 해당 파트가 필요한 쿼리가 실행될 때에만 파일 시스템 캐시에
적재됩니다.

활성화하면, `cache_populated_by_fetch`로 인해 모든 노드가 쿼리로 이러한 동작을
트리거할 필요 없이 스토리지에서 새 데이터 파트를
파일 시스템 캐시에 적재하도록 합니다.

**함께 보기**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)

## cache_populated_by_fetch_filename_regexp \{#cache_populated_by_fetch_filename_regexp\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>

:::note
이 설정은 ClickHouse Cloud에만 적용됩니다.
:::

값이 비어 있지 않은 경우, `cache_populated_by_fetch`가 활성화되어 있을 때 fetch 이후 캐시에 미리 적재되는 파일은 이 정규식과 일치하는 파일로만 제한됩니다.

## check_delay_period \{#check_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="60" />

더 이상 사용되지 않는 설정으로, 아무런 효과도 없습니다.

## check_sample_column_is_correct \{#check_sample_column_is_correct\}

<SettingsInfoBlock type="Bool" default_value="1" />

테이블을 생성할 때 샘플링에 사용되는 컬럼 또는 샘플링 표현식의 데이터 타입이 올바른지 검사하도록 설정합니다. 데이터 타입은 부호 없는
[정수 타입](/sql-reference/data-types/int-uint) 중 하나여야 합니다: `UInt8`, `UInt16`,
`UInt32`, `UInt64`.

가능한 값:

- `true`  — 검사가 활성화됩니다.
- `false` — 테이블 생성 시 검사가 비활성화됩니다.

기본값: `true`.

기본적으로 ClickHouse 서버는 테이블 생성 시 샘플링에 사용되는 컬럼 또는 샘플링 표현식의 데이터 타입을 검사합니다. 이미 샘플링 표현식이 잘못된 테이블이 있고 서버 시작 시 예외가 발생하지 않도록 하려는 경우 `check_sample_column_is_correct`를 `false`로 설정하십시오.

## clean_deleted_rows \{#clean_deleted_rows\}

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />

더 이상 사용되지 않는 설정으로, 아무 효과도 없습니다.

## cleanup_delay_period \{#cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

오래된 큐 로그, 블록 해시 및 파트를 정리하는 최소 간격입니다.

## cleanup_delay_period_random_add \{#cleanup_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

cleanup_delay_period에 0초부터 x초까지의 값 중 균등 분포로 선택된 값을 더하여,
매우 많은 수의 테이블이 존재하는 경우에 발생할 수 있는 thundering herd 효과와
그에 따른 ZooKeeper에 대한 DoS를 방지합니다.

## cleanup_thread_preferred_points_per_iteration \{#cleanup_thread_preferred_points_per_iteration\}

<SettingsInfoBlock type="UInt64" default_value="150" />

백그라운드 정리 작업을 위한 선호 배치 크기입니다(포인트는 추상적인 단위이지만 1 포인트는 대략 1개의 삽입된 블록에 해당합니다).

## cleanup_threads \{#cleanup_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

더 이상 사용되지 않는 설정으로, 아무런 효과도 없습니다.

## clone_replica_zookeeper_create_get_part_batch_size \{#clone_replica_zookeeper_create_get_part_batch_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "100"},{"label": "New setting"}]}]}/>

레플리카를 클론할 때 ZooKeeper multi-create get-part 요청에 사용하는 배치 크기입니다.

## columns_and_secondary_indices_sizes_lazy_calculation \{#columns_and_secondary_indices_sizes_lazy_calculation\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "컬럼 및 보조 인덱스 크기를 지연 계산하는 새로운 설정"}]}]}/>

테이블 초기화 시점이 아니라 첫 번째 요청 시점에 컬럼 및 보조 인덱스 크기를 지연 계산합니다.

## columns_to_prewarm_mark_cache \{#columns_to_prewarm_mark_cache\}

마크 캐시를 미리 워밍(prewarm)할 컬럼 목록입니다(기능이 활성화된 경우). 비어 있으면 모든 컬럼을 대상으로 합니다.

## compact_parts_max_bytes_to_buffer \{#compact_parts_max_bytes_to_buffer\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

ClickHouse Cloud에서만 사용 가능합니다. compact 파트에서 하나의 스트라이프에 기록할 최대 바이트 수입니다.

## compact_parts_max_granules_to_buffer \{#compact_parts_max_granules_to_buffer\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="128" />

ClickHouse Cloud에서만 사용할 수 있습니다. compact 파트에서 단일 스트라이프에 기록할 수 있는 그래뉼의 최대 개수입니다.

## compact_parts_merge_max_bytes_to_prefetch_part \{#compact_parts_merge_max_bytes_to_prefetch_part\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

ClickHouse Cloud에서만 사용할 수 있습니다. 머지(merge) 중 compact 파트를 통째로 메모리에 읽어 들일 때 허용되는 compact 파트의 최대 크기입니다.

## compatibility_allow_sampling_expression_not_in_primary_key \{#compatibility_allow_sampling_expression_not_in_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

`primary key`에 포함되지 않은 `sampling expression`으로 테이블을 생성할 수 있도록 허용합니다.  
이 설정은 잘못된 테이블이 있는 서버를 이전 버전과의 호환성을 위해 일시적으로 실행해야 할 때에만 필요합니다.

## compress_marks \{#compress_marks\}

<SettingsInfoBlock type="Bool" default_value="1" />

마크 파일은 압축을 지원하여 파일 크기를 줄이고 네트워크 전송 속도를 높입니다.

## compress_primary_key \{#compress_primary_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

기본 키에 대한 압축을 지원하여 기본 키 파일 크기를 줄이고 네트워크 전송을 가속화합니다.

## concurrent_part_removal_threshold \{#concurrent_part_removal_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100" />

비활성 데이터 파트 수가 이 값 이상일 때만
동시 파트 제거(「max_part_removal_threads」 참조)를 활성화합니다.

## deduplicate_merge_projection_mode \{#deduplicate_merge_projection_mode\}

<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

클래식 MergeTree가 아닌 MergeTree(Replicated, Shared가 아닌 MergeTree)에 대해 프로젝션 생성을 허용할지 여부를 지정합니다.
`ignore` 옵션은 호환성만을 위한 것으로, 잘못된 결과를 초래할 수 있습니다. 허용하는 경우,
프로젝션을 머지할 때의 동작(삭제 또는 재생성)을 지정합니다. 따라서 클래식 MergeTree는 이 설정을
무시합니다. 또한 `OPTIMIZE DEDUPLICATE`도 제어하지만, 모든 MergeTree 패밀리 엔진에 영향을 줍니다.
`lightweight_mutation_projection_mode` 옵션과 유사하게 파트(part) 수준 옵션입니다.

가능한 값:

- `ignore`
- `throw`
- `drop`
- `rebuild`

## default_compression_codec \{#default_compression_codec\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "새 설정"}]}]}/>

테이블 선언에서 특정 컬럼에 대해 아무것도 정의되지 않은 경우 사용할 기본 압축 코덱을 지정합니다.
컬럼에 대한 압축 코덱 선택 순서는 다음과 같습니다.

1. 테이블 선언에서 해당 컬럼에 대해 정의된 압축 코덱
2. `default_compression_codec`(이 설정)에서 정의된 압축 코덱
3. `compression` 설정에서 정의된 기본 압축 코덱  
기본값: 빈 문자열(정의되지 않음).

## detach_not_byte_identical_parts \{#detach_not_byte_identical_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

머지 또는 뮤테이션 이후에 레플리카의 데이터 파트가 다른 레플리카의 데이터 파트와 바이트 단위로 동일하지 않은 경우, 해당 데이터 파트를 분리(detach)할지 여부를 설정합니다. 비활성화된 경우 데이터 파트는 제거됩니다. 이후에 이러한 파트를 분석하려는 경우 이 설정을 활성화하십시오.

이 설정은 [데이터 복제](/engines/table-engines/mergetree-family/replacingmergetree)가 활성화된 `MergeTree` 테이블에 적용됩니다.

가능한 값:

- `0` — 파트를 제거합니다.
- `1` — 파트를 분리(detach)합니다.

## detach_old_local_parts_when_cloning_replica \{#detach_old_local_parts_when_cloning_replica\}

<SettingsInfoBlock type="Bool" default_value="1" />

손실된 레플리카를 복구할 때 기존 로컬 파트를 분리하지 않습니다.

가능한 값:

- `true`
- `false`

## disable_detach_partition_for_zero_copy_replication \{#disable_detach_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

zero copy 복제에서 DETACH PARTITION 쿼리를 비활성화합니다.

## disable_fetch_partition_for_zero_copy_replication \{#disable_fetch_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

제로 카피 복제에서 `FETCH PARTITION` 쿼리 실행을 비활성화합니다.

## disable_freeze_partition_for_zero_copy_replication \{#disable_freeze_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

zero copy 복제에서 FREEZE PARTITION 쿼리를 비활성화합니다.

## disk \{#disk\}

스토리지 디스크 이름입니다. storage policy 대신 사용할 수 있습니다.

## distributed_index_analysis_min_indexes_bytes_to_activate \{#distributed_index_analysis_min_indexes_bytes_to_activate\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1073741824"},{"label": "New setting"}]}]}/>

분산 인덱스 분석을 활성화하는 데 필요한 디스크 상의 최소 인덱스 크기(압축되지 않은 기준, data skipping 및 기본 키 인덱스)

## distributed_index_analysis_min_parts_to_activate \{#distributed_index_analysis_min_parts_to_activate\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "10"},{"label": "New setting"}]}]}/>

분산 인덱스 분석을 활성화하기 위한 최소 파트 수

## dynamic_serialization_version \{#dynamic_serialization_version\}

<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Dynamic 직렬화 버전을 제어하는 설정을 추가"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "더 나은 직렬화/역직렬화를 위해 기본적으로 Dynamic에 v3 직렬화 버전을 사용하도록 설정"}]}]}/>

Dynamic 데이터 타입에 대한 직렬화 버전입니다. 호환성을 위해 필요합니다.

가능한 값:

- `v1`
- `v2`
- `v3`

## enable_block_number_column \{#enable_block_number_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

각 행마다 _block_number 컬럼을 영구 저장하도록 활성화합니다.

## enable_block_offset_column \{#enable_block_offset_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

병합 시 가상 컬럼 `_block_number`를 디스크에 저장합니다.

## enable_index_granularity_compression \{#enable_index_granularity_compression\}

<SettingsInfoBlock type="Bool" default_value="1" />

가능한 경우 메모리에 있는 인덱스 granularity 값을 압축합니다

## enable_max_bytes_limit_for_min_age_to_force_merge \{#enable_max_bytes_limit_for_min_age_to_force_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "기본적으로 min_age_to_force_merge_seconds가 설정된 경우에도 파트 크기 제한"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "새 설정"}]}, {"id": "row-3","items": [{"label": "25.1"},{"label": "0"},{"label": "min_age_to_force_merge에 대한 최대 바이트 수를 제한하는 새 설정 추가"}]}]}/>

`min_age_to_force_merge_seconds` 및
`min_age_to_force_merge_on_partition_only` 설정이
`max_bytes_to_merge_at_max_space_in_pool` 설정을 따르도록 할지 여부를 지정합니다.

가능한 값:

- `true`
- `false`

## enable_mixed_granularity_parts \{#enable_mixed_granularity_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

`index_granularity_bytes` SETTING을 사용해 그래뉼(granule) 크기를 제어하는 방식으로 전환할지 여부를 활성화하거나 비활성화합니다. 19.11 버전 이전에는 그래뉼 크기를 제한하기 위해 `index_granularity` SETTING만 존재했습니다. `index_granularity_bytes` SETTING은 행 크기가 매우 큰(수십~수백 메가바이트 수준) 테이블에서 데이터를 조회할 때 ClickHouse 성능을 향상시킵니다. 큰 행을 가진 테이블이 있는 경우 해당 테이블에서 이 SETTING을 활성화하면 `SELECT` 쿼리 효율을 높일 수 있습니다.

## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge \{#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "ReplacingMergeTree에 대해 자동 정리(CLEANUP) 머지를 허용하는 새로운 설정"}]}]}/>

여러 파티션을 하나의 part로 병합할 때 ReplacingMergeTree에 대해 CLEANUP 머지를 사용할지 여부입니다. `allow_experimental_replacing_merge_with_cleanup`,
`min_age_to_force_merge_seconds` 및 `min_age_to_force_merge_on_partition_only`
설정을 활성화해야 합니다.

가능한 값:

- `true`
- `false`

## enable_the_endpoint_id_with_zookeeper_name_prefix \{#enable_the_endpoint_id_with_zookeeper_name_prefix\}

<SettingsInfoBlock type="Bool" default_value="0" />

복제된 MergeTree 테이블(Replicated Table)에 대해 엔드포인트 ID에 ZooKeeper 이름 접두사를 사용하도록 활성화합니다.

## enable_vertical_merge_algorithm \{#enable_vertical_merge_algorithm\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Vertical merge(수직 병합) 알고리즘 사용을 활성화합니다.

## enforce_index_structure_match_on_partition_manipulation \{#enforce_index_structure_match_on_partition_manipulation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

이 설정을 파티션 조작 쿼리(`ATTACH/MOVE/REPLACE PARTITION`)의 대상 테이블에 대해 활성화하면, 소스 테이블과 대상 테이블의 인덱스와 프로젝션이 동일해야 합니다. 비활성화된 경우에는 대상 테이블이 소스 테이블보다 더 많은 인덱스와 프로젝션(상위 집합)을 가질 수 있습니다.

## escape_index_filenames \{#escape_index_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "인덱스에 대해 생성되는 파일 이름에서 비-ASCII 문자 이스케이프"}]}]}/>

26.1 이전에는 보조 인덱스에 대해 생성된 파일 이름에서 특수 기호를 이스케이프하지 않았으며, 이로 인해 인덱스 이름에 포함된 일부 문자 때문에 손상된 파트가 생성될 수 있었습니다. 이는 호환성을 위한 설정일 뿐입니다. 인덱스 이름에 비-ASCII 문자를 사용하는 오래된 파트를 읽는 경우가 아니라면 변경하지 않는 것이 좋습니다.

## escape_variant_subcolumn_filenames \{#escape_variant_subcolumn_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Wide 파트에서 Variant 타입 서브컬럼에 대해 생성되는 파일명의 특수 문자를 이스케이프합니다"}]}]}/>

MergeTree 테이블의 Wide 파트에 있는 Variant 데이터 타입 서브컬럼에 대해 생성되는 파일명의 특수 문자를 이스케이프합니다. 호환성 유지를 위해 필요합니다.

## exclude_deleted_rows_for_part_size_in_merge \{#exclude_deleted_rows_for_part_size_in_merge\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면 파트를 병합할 때 선택할 파트를 결정하기 위해, 실제 데이터 파트 크기의 추정값(즉, `DELETE FROM`으로 삭제된 행을 제외한 크기)을 사용합니다. 이 동작은 이 설정이 활성화된 이후에 실행된 `DELETE FROM`의 영향을 받은 데이터 파트에만 적용됩니다.

가능한 값:

- `true`
- `false`

**함께 보기**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
설정

## exclude_materialize_skip_indexes_on_merge \{#exclude_materialize_skip_indexes_on_merge\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "새 SETTING입니다."}]}]} />

쉼표로 구분된 스킵 인덱스(skip index) 목록이 병합(merge) 중에 생성 및 저장되지 않도록 제외합니다.
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge)가 false로 설정되어 있으면 효과가 없습니다.

제외된 스킵 인덱스는 명시적인
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 쿼리나
[materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)
세션 SETTING에 따라 INSERT를 수행할 때 여전히 생성되고 저장됩니다.

예:

```sql
CREATE TABLE tab
(
a UInt64,
b UInt64,
INDEX idx_a a TYPE minmax,
INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple() SETTINGS exclude_materialize_skip_indexes_on_merge = 'idx_a';

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- setting has no effect on INSERTs

-- idx_a will be excluded from update during background or explicit merge via OPTIMIZE TABLE FINAL

-- can exclude multiple indexes by providing a list
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- default setting, no indexes excluded from being updated during merge
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```


## execute_merges_on_single_replica_time_threshold \{#execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="0" />

이 설정 값이 0보다 큰 경우, 하나의 레플리카만 즉시 머지 작업을 시작하고,
다른 레플리카들은 로컬에서 머지 작업을 수행하는 대신 해당 시간만큼 대기한 후 결과를 다운로드합니다. 선택된 레플리카가 해당 시간 내에 머지 작업을 완료하지 못하면 표준 동작으로 되돌아갑니다.

가능한 값:

- 0보다 큰 양의 정수.

## fault_probability_after_part_commit \{#fault_probability_after_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

테스트용입니다. 변경하지 마십시오.

## fault_probability_before_part_commit \{#fault_probability_before_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

테스트용입니다. 값은 변경하지 마십시오.

## finished_mutations_to_keep \{#finished_mutations_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="100" />

완료된 뮤테이션 레코드를 몇 개까지 유지할지 지정합니다. 값이 0이면 모든 레코드를 유지합니다.

## force_read_through_cache_for_merges \{#force_read_through_cache_for_merges\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

머지 작업에서 파일 시스템 캐시를 통해 강제 읽기를 수행합니다

## fsync_after_insert \{#fsync_after_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

삽입된 각 파트에 대해 `fsync`를 수행합니다. 삽입 성능이 크게 저하되므로 wide 파트와 함께 사용하는 것은 권장되지 않습니다.

## fsync_part_directory \{#fsync_part_directory\}

<SettingsInfoBlock type="Bool" default_value="0" />

모든 파트 작업(쓰기, 이름 변경 등)을 마친 후 파트 디렉터리에 대해 fsync를 수행합니다.

## in_memory_parts_enable_wal \{#in_memory_parts_enable_wal\}

<SettingsInfoBlock type="Bool" default_value="1" />

더 이상 사용되지 않는 설정으로, 아무 효과도 없습니다.

## in_memory_parts_insert_sync \{#in_memory_parts_insert_sync\}

<SettingsInfoBlock type="Bool" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 효과도 없습니다.

## inactive_parts_to_delay_insert \{#inactive_parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

단일 테이블 파티션에서 비활성 파트의 개수가
`inactive_parts_to_delay_insert` 값보다 커지면 `INSERT`가 의도적으로
지연됩니다.

:::tip
서버가 파트를 충분히 빠르게 정리하지 못할 때 유용합니다.
:::

가능한 값:

- 양의 정수.

## inactive_parts_to_throw_insert \{#inactive_parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

단일 파티션에서 비활성 파트의 개수가
`inactive_parts_to_throw_insert` 값보다 많으면 `INSERT`가 중단되고,
다음과 같은 오류가 발생합니다:

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" exception."

가능한 값:

- 임의의 양의 정수

## index_granularity \{#index_granularity\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

인덱스 마크 사이에 위치할 수 있는 최대 데이터 행(row) 수입니다. 즉, 하나의 기본 키(primary key) 값에 해당하는 행(row)의 개수입니다.

## index_granularity_bytes \{#index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

데이터 그래뉼의 최대 크기(바이트 단위)입니다.

그래뉼 크기를 행 수로만 제한하려면 `0`으로 설정합니다(권장되지 않음).

## initialization_retry_period \{#initialization_retry_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

테이블 초기화를 다시 시도하는 간격(초 단위)입니다.

## kill_delay_period \{#kill_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

더 이상 사용되지 않는 폐기된 설정으로, 아무 효과도 없습니다.

## kill_delay_period_random_add \{#kill_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

더 이상 사용되지 않는 설정으로, 아무런 동작도 하지 않습니다.

## kill_threads \{#kill_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

더 이상 사용되지 않는 설정으로, 아무 효과도 없습니다.

## lightweight_mutation_projection_mode \{#lightweight_mutation_projection_mode\}

<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

기본적으로 경량한 삭제 `DELETE`는 프로젝션이 있는 테이블에서는 동작하지 않습니다. 이는 프로젝션의 행이 `DELETE` 연산의 영향을 받을 수 있기 때문입니다. 따라서 기본값은 `throw`입니다. 그러나 이 옵션으로 동작 방식을 변경할 수 있습니다. 값을 `drop` 또는 `rebuild`로 설정하면 프로젝션이 있는 테이블에서도 삭제를 사용할 수 있습니다. `drop`은 프로젝션을 삭제하므로, 현재 쿼리는 프로젝션을 삭제하면서 더 빠를 수 있지만, 이후 쿼리는 프로젝션이 없으므로 더 느려질 수 있습니다. `rebuild`는 프로젝션을 재구축하므로 현재 쿼리의 성능에는 영향을 줄 수 있지만, 이후 쿼리는 더 빨라질 수 있습니다. 장점은 이러한 옵션은 파트(part) 수준에서만 동작한다는 점으로, 영향을 받지 않는 파트의 프로젝션은 삭제나 재구성과 같은 동작이 트리거되지 않고 그대로 유지된다는 것입니다.

가능한 값:

- `throw`
- `drop`
- `rebuild`

## load_existing_rows_count_for_old_parts \{#load_existing_rows_count_for_old_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

[exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge)가 함께 활성화된 경우,
테이블 시작 시 기존 데이터 파트에 대해 삭제된 행 개수가 계산됩니다.
이로 인해 테이블 로딩 시작이 느려질 수 있습니다.

가능한 값:

- `true`
- `false`

**함께 보기**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 설정

## lock_acquire_timeout_for_background_operations \{#lock_acquire_timeout_for_background_operations\}

<SettingsInfoBlock type="Seconds" default_value="120" />

머지, 뮤테이션 등 백그라운드 작업에서 테이블 락을 획득하지 못하면 실패로 간주하기까지 대기하는 시간(초)입니다.

## marks_compress_block_size \{#marks_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

마크를 압축할 때 사용하는 실제 블록 크기입니다.

## marks_compression_codec \{#marks_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

마크에 사용되는 압축 코덱입니다. 마크는 충분히 작고 캐시되므로
기본 압축 코덱은 ZSTD(3)입니다.

## materialize_skip_indexes_on_merge \{#materialize_skip_indexes_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>

활성화하면 머지 작업 시 새로운 파트에 대해 스킵 인덱스를 생성하고 저장합니다.  
비활성화된 경우에는 명시적인 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)나
[INSERT 중](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)에 생성/저장할 수 있습니다.

보다 세밀한 제어를 위해 [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge)도 참고하십시오.

## materialize_statistics_on_merge \{#materialize_statistics_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "새 설정"}]}]}/>

이 설정을 활성화하면 머지 작업 시 새 파트에 대한 통계를 생성하여 저장합니다.
비활성화된 경우 명시적인 [MATERIALIZE STATISTICS](/sql-reference/statements/alter/statistics.md)
또는 [INSERT 중](/operations/settings/settings.md#materialize_statistics_on_insert)에 통계를 생성하고 저장할 수 있습니다.

## materialize_ttl_recalculate_only \{#materialize_ttl_recalculate_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZE TTL을 수행할 때에만 TTL 정보를 다시 계산합니다.

## max_avg_part_size_for_too_many_parts \{#max_avg_part_size_for_too_many_parts\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

'parts_to_delay_insert'와 'parts_to_throw_insert'에 따른 'too many parts' 검사는
해당 파티션에서의 평균 파트 크기가 지정된 임계값보다 크지 않을 때에만 활성화됩니다.
평균 파트 크기가 지정된 임계값보다 크면 INSERT 문은 지연되거나 거부되지 않습니다.
이는 파트가 더 큰 파트로 성공적으로 머지되는 경우 단일 서버의 단일 테이블에
수백 테라바이트의 데이터를 저장할 수 있도록 합니다.
이 설정은 비활성 파트 또는 전체 파트 개수에 대한 임계값에는 영향을 주지 않습니다.

## max_bytes_to_merge_at_max_space_in_pool \{#max_bytes_to_merge_at_max_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="161061273600" />

사용 가능한 리소스가 충분한 경우, 여러 파트를 하나의 파트로 머지할 때 허용되는 파트들의 총 최대 크기(바이트 단위)입니다.  
자동 백그라운드 머지로 생성될 수 있는 파트의 최대 크기에 대략적으로 대응합니다.  
0이면 머지가 비활성화됩니다.

가능한 값:

- 0 이상의 정수.

머지 스케줄러는 주기적으로 파티션 내 파트의 크기와 개수를 분석하고, 풀(pool)에 사용 가능한 리소스가 충분하면 백그라운드 머지를 시작합니다.  
소스 파트들의 총 크기가 `max_bytes_to_merge_at_max_space_in_pool`보다 커질 때까지 머지가 수행됩니다.

[OPTIMIZE FINAL](/sql-reference/statements/optimize)에 의해 시작된 머지는  
`max_bytes_to_merge_at_max_space_in_pool` 설정을 무시하며, 사용 가능한 디스크 공간만 고려합니다.

## max_bytes_to_merge_at_min_space_in_pool \{#max_bytes_to_merge_at_min_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

백그라운드 풀에서 사용 가능한 리소스가 최소일 때 하나의 파트로 병합할 수 있는
최대 전체 파트 크기(바이트 단위)입니다.

가능한 값:

- 0보다 큰 정수.

`max_bytes_to_merge_at_min_space_in_pool`은(는) 디스크 공간(풀 내)이 부족하더라도
병합할 수 있는 파트들의 최대 전체 크기를 정의합니다.
이는 작은 파트의 개수와 `Too many parts` 오류 발생 가능성을 줄이기 위해 필요합니다.
병합 작업은 병합되는 전체 파트 크기의 두 배만큼 디스크 공간을 예약합니다.
따라서 사용 가능한 디스크 공간이 적을 때, 여유 공간은 있지만
이미 진행 중인 대규모 병합 작업이 이 공간을 예약해 버려
다른 병합이 시작되지 못하고, 각 insert마다 작은 파트 수가 증가하는
상황이 발생할 수 있습니다.

## max_cleanup_delay_period \{#max_cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="300" />

오래된 큐 로그, 블록 해시, 파트를 정리하는 최대 기간입니다.

## max_compress_block_size \{#max_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

테이블에 데이터를 기록하기 위해 압축을 수행하기 전에, 압축되지 않은 데이터 블록의 최대 크기입니다. 이 설정은 전역 설정에서도 지정할 수 있습니다
([max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)
설정을 참조하십시오). 테이블을 생성할 때 지정한 값이 이 설정에 대해 전역 값보다 우선합니다.

## max_concurrent_queries \{#max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree 테이블과 관련하여 동시에 실행되는 쿼리의 최대 수입니다.
쿼리는 다른 `max_concurrent_queries` 설정에 의해서도 계속 제한됩니다.

가능한 값:

* 양의 정수.
* `0` — 제한 없음.

기본값: `0` (제한 없음).

**예시**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max_delay_to_insert \{#max_delay_to_insert\}

<SettingsInfoBlock type="UInt64" default_value="1" />

초 단위의 값으로, 하나의 파티션에서 활성 파트의 개수가
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert) 값을 초과할 때
`INSERT` 지연 시간을 계산하는 데 사용됩니다.

가능한 값:

* 임의의 양의 정수.

`INSERT`에 대한 지연 시간(밀리초)은 다음 공식에 따라 계산됩니다:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

예를 들어, 어떤 파티션에 활성 파트가 299개 있고 parts&#95;to&#95;throw&#95;insert
= 300, parts&#95;to&#95;delay&#95;insert = 150, max&#95;delay&#95;to&#95;insert = 1인 경우 `INSERT`는
`pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
밀리초 동안 지연됩니다.

버전 23.1부터는 공식이 다음과 같이 변경되었습니다:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

예를 들어, 어떤 파티션에 활성 파트가 224개 있고 parts&#95;to&#95;throw&#95;insert
= 300, parts&#95;to&#95;delay&#95;insert = 150, max&#95;delay&#95;to&#95;insert = 1,
min&#95;delay&#95;to&#95;insert&#95;ms = 10인 경우, `INSERT` 연산은 `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500`밀리초 동안 지연됩니다.


## max_delay_to_mutate_ms \{#max_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

미완료 뮤테이션이 많을 때 MergeTree 테이블에 대한 뮤테이션을 지연시킬 수 있는 최대 시간(밀리초)입니다.

## max_digestion_size_per_segment \{#max_digestion_size_per_segment\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "더 이상 사용되지 않는 설정"}]}]}/>

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## max_file_name_length \{#max_file_name_length\}

<SettingsInfoBlock type="UInt64" default_value="127" />

파일 이름을 해시로 대체하지 않고 그대로 유지할 수 있는 최대 길이입니다.
이 설정은 `replace_long_file_name_to_hash` 설정이 활성화된 경우에만 적용됩니다.
이 설정 값에는 파일 확장자의 길이가 포함되지 않습니다. 따라서
파일 시스템 오류를 피하기 위해 최대 파일 이름 길이(일반적으로 255바이트)보다
여유를 두어 더 작은 값으로 설정할 것을 권장합니다.

## max_files_to_modify_in_alter_columns \{#max_files_to_modify_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="75" />

수정(삭제, 추가)해야 하는 파일 개수가 이 설정값보다 큰 경우 `ALTER` 작업을 수행하지 않습니다.

사용 가능한 값:

- 양의 정수.

기본값: 75

## max_files_to_remove_in_alter_columns \{#max_files_to_remove_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="50" />

삭제할 파일 개수가 이 설정값보다 크면 ALTER를 적용하지 않습니다.

가능한 값:

- 임의의 양의 정수.

## max_merge_delayed_streams_for_parallel_write \{#max_merge_delayed_streams_for_parallel_write\}

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

병합 시 동시에 플러시할 수 있는 스트림(컬럼)의 최대 개수입니다
(병합 시 `max_insert_delayed_streams_for_parallel_write`와 유사한 설정입니다). 수직 병합(vertical merge)에만 동작합니다.

## max_merge_selecting_sleep_ms \{#max_merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

머지할 파트를 다시 선택하기 전에, 이전 시도에서 어떤 파트도 선택되지 않았을 때 대기하는 최대 시간입니다. 더 낮은 설정값을 사용하면 `background_schedule_pool`에서 작업 선택이 더 자주 수행되어, 대규모 클러스터에서 ZooKeeper로의 요청이 매우 많아지게 됩니다.

## max_number_of_merges_with_ttl_in_pool \{#max_number_of_merges_with_ttl_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="2" />

풀에 TTL 항목이 포함된 머지 작업 수가 지정된 값보다 많으면, 새로운 TTL 머지를 더 이상 할당하지 않습니다. 이는 일반 머지 작업을 위한 스레드를 일부 남겨 두고 「Too many parts」 오류가 발생하는 것을 방지하기 위한 것입니다.

## max_number_of_mutations_for_replica \{#max_number_of_mutations_for_replica\}

<SettingsInfoBlock type="UInt64" default_value="0" />

각 레플리카의 파트 뮤테이션 수를 지정된 값으로 제한합니다.
0으로 설정하면 레플리카당 허용되는 뮤테이션 수에 제한이 없음을 의미합니다(단, 실행은 여전히 다른 설정에 의해 제약될 수 있습니다).

## max_part_loading_threads \{#max_part_loading_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

더 이상 사용되지 않는 설정으로, 아무 효과도 없습니다.

## max_part_removal_threads \{#max_part_removal_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## max_partitions_to_read \{#max_partitions_to_read\}

<SettingsInfoBlock type="Int64" default_value="-1" />

하나의 쿼리에서 읽을 수 있는 파티션의 최대 개수를 제한합니다.

테이블을 CREATE할 때 지정한 설정값은
쿼리 수준 설정으로 재정의할 수 있습니다.

가능한 값:

- 0보다 큰 임의의 정수.

쿼리 / 세션 / 프로필 수준에서 쿼리 복잡도 설정인 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)를 지정할 수도 있습니다.

## max_parts_in_total \{#max_parts_in_total\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

테이블의 모든 파티션에서 활성 파트의 총 개수가 `max_parts_in_total` 값보다 많아지면
`INSERT` 작업이 `Too many parts (N)` 예외와 함께 중단됩니다.

가능한 값:

- 양의 정수.

테이블에 파트가 너무 많으면 ClickHouse 쿼리 성능이 저하되고 ClickHouse 부팅 시간이 길어집니다. 이는 대부분 잘못된 설계, 예를 들어 파티션 전략 선택 시 실수로 인해 파티션 크기가 지나치게 작은 경우의 결과입니다.

## max_parts_to_merge_at_once \{#max_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="100" />

한 번에 머지(merge)할 수 있는 파트의 최대 개수입니다(0은 비활성화). OPTIMIZE FINAL 쿼리에는 영향을 주지 않습니다.

## max_postpone_time_for_failed_mutations_ms \{#max_postpone_time_for_failed_mutations_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

실패한 뮤테이션의 지연이 허용되는 최대 시간입니다.

## max_postpone_time_for_failed_replicated_fetches_ms \{#max_postpone_time_for_failed_replicated_fetches_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "복제 큐에서 fetch 작업을 연기할 수 있도록 하는 새 설정을 추가했습니다."}]}]}/>

실패한 복제 fetch 작업을 연기할 수 있는 최대 시간(밀리초)입니다.

## max_postpone_time_for_failed_replicated_merges_ms \{#max_postpone_time_for_failed_replicated_merges_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "복제 큐에서 머지 작업을 지연할 수 있도록 하는 새 설정이 추가되었습니다."}]}]}/>

실패한 복제 머지 작업에 대해 허용되는 최대 지연 시간입니다.

## max_postpone_time_for_failed_replicated_tasks_ms \{#max_postpone_time_for_failed_replicated_tasks_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "복제 큐에서 태스크를 연기할 수 있는 새로운 설정이 추가되었습니다."}]}]}/>

실패한 복제 태스크가 연기될 수 있는 최대 시간입니다. 이 값은 태스크가 fetch, merge, mutation이 아닐 때 적용됩니다.

## max_projections \{#max_projections\}

<SettingsInfoBlock type="UInt64" default_value="25" />

MergeTree 테이블 프로젝션의 최대 개수입니다.

## max_replicated_fetches_network_bandwidth \{#max_replicated_fetches_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

네트워크를 통한 데이터 교환 속도를 초당 바이트 단위로 제한합니다. 이 제한은
[복제된](../../engines/table-engines/mergetree-family/replication.md)
fetch 작업에 적용됩니다. 이 설정은 특정 테이블에만 적용되며,
서버에 적용되는
[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)
설정과는 구분됩니다.

서버 전체 네트워크와 특정 테이블의 네트워크 양쪽 모두를 제한할 수 있지만,
이를 위해서는 테이블 수준 설정 값이 서버 수준 설정 값보다 작아야 합니다.
그렇지 않으면 서버는
`max_replicated_fetches_network_bandwidth_for_server` 설정만 고려합니다.

이 설정은 엄밀하게 적용되지는 않습니다.

가능한 값은 다음과 같습니다.

- 양의 정수.
- `0` — 무제한.

기본값: `0`.

**사용**

새 노드를 추가하거나 교체하기 위해 데이터를 복제할 때 속도를 제한(스로틀링)하는 데 사용할 수 있습니다.

## max_replicated_logs_to_keep \{#max_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

비활성 레플리카가 있을 때 ClickHouse Keeper 로그에 유지될 수 있는 최대 레코드 수를 지정합니다. 로그 레코드 수가 이 값을 초과하면 비활성 레플리카는 손실된 것으로 간주됩니다.

가능한 값:

- 양의 정수.

## max_replicated_merges_in_queue \{#max_replicated_merges_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

ReplicatedMergeTree 큐에서 파트 병합 및 머테이션을 동시에 수행할 수 있는 작업의 최대 수입니다.

## max_replicated_merges_with_ttl_in_queue \{#max_replicated_merges_with_ttl_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1" />

ReplicatedMergeTree 큐에서 TTL이 설정된 파트를 병합하는 작업이 동시에 수행될 수 있는 최대 개수입니다.

## max_replicated_mutations_in_queue \{#max_replicated_mutations_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="8" />

ReplicatedMergeTree 큐에서 파트를 뮤테이션하는 작업을 동시에 실행할 수 있는 최대 개수입니다.

## max_replicated_sends_network_bandwidth \{#max_replicated_sends_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

[레플리카](/engines/table-engines/mergetree-family/replacingmergetree) 전송에 대해, 네트워크를 통한 데이터 교환의 최대 속도를 초당 바이트 수로 제한합니다. 이 설정은 서버에 적용되는
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
설정과 달리 특정 테이블에 적용됩니다.

서버 전체 네트워크와 특정 테이블에 대한 네트워크 모두에 제한을 둘 수 있지만, 이를 위해서는 테이블 수준 설정 값이 서버 수준 설정 값보다 작아야 합니다. 그렇지 않으면 서버는 `max_replicated_sends_network_bandwidth_for_server` 설정만 고려합니다.

이 설정은 완전히 정확하게 지켜지지는 않습니다.

가능한 값:

- 양의 정수.
- `0` — 무제한.

**사용**

새 노드를 추가하거나 교체하기 위해 데이터를 복제할 때 전송 속도를 제한(throttling)하는 데 사용할 수 있습니다.

## max_suspicious_broken_parts \{#max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="100" />

단일 파티션에서 손상된 파트 수가 `max_suspicious_broken_parts` 값을 초과하면
자동 삭제가 수행되지 않습니다.

허용되는 값:

- 양의 정수입니다.

## max_suspicious_broken_parts_bytes \{#max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

손상된 모든 파트의 최대 크기입니다. 이 값을 초과하면 자동 삭제가 수행되지 않습니다.

가능한 값:

- 양의 정수.

## max_uncompressed_bytes_in_patches \{#max_uncompressed_bytes_in_patches\}

<SettingsInfoBlock type="UInt64" default_value="32212254720" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>

모든 패치 파트의 압축 해제된 데이터 총 크기(바이트)에 대한 최대값입니다.
모든 패치 파트의 데이터 크기가 이 값을 초과하면 경량 업데이트가 거부됩니다.
0 - 제한 없음.

## merge_max_block_size \{#merge_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

머지된 파트에서 메모리로 읽어 들이는 행 수입니다.

가능한 값:

- 임의의 양의 정수.

머지 작업에서는 파트에서 `merge_max_block_size` 행으로 구성된 블록 단위로 데이터를 읽은 다음,
이를 머지하여 결과를 새로운 파트에 기록합니다. 읽어 들인 블록은 RAM에 적재되므로
`merge_max_block_size` 값은 머지에 필요한 RAM 크기에 영향을 줍니다.
따라서 행이 매우 넓은 테이블에서는 머지 시에 많은 양의 RAM이 소모될 수 있습니다
(평균 행 크기가 100kb이고 10개의 파트를 머지하는 경우,
(100kb * 10 * 8192) = 약 8GB RAM이 필요합니다). `merge_max_block_size`를 낮추면
머지에 필요한 RAM 양을 줄일 수 있지만 머지 속도는 느려질 수 있습니다.

## merge_max_block_size_bytes \{#merge_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

머지 작업 시 블록을 얼마나 많은 바이트로 구성할지 지정합니다. 기본적으로
`index_granularity_bytes`와 같은 값을 사용합니다.

## merge_max_bytes_to_prewarm_cache \{#merge_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud에서만 사용할 수 있는 설정입니다. 머지(merge) 중 캐시를 미리 예열(prewarm)하기 위한 파트(compact 또는 packed)의 최대 크기입니다.

## merge_max_dynamic_subcolumns_in_compact_part \{#merge_max_dynamic_subcolumns_in_compact_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "auto"},{"label": "데이터 타입에 지정된 파라미터와 무관하게 머지 후 Compact 파트에서 생성될 수 있는 동적 서브컬럼 수를 제한하는 새 설정을 추가합니다."}]}]}/>

머지 후 Compact 데이터 파트의 각 컬럼에서 생성될 수 있는 동적 서브컬럼의 최대 개수입니다.
이 설정을 사용하면 데이터 타입에 지정된 동적 파라미터와 상관없이 Compact 파트에서 동적 서브컬럼 개수를 제어할 수 있습니다.

예를 들어, 테이블에 JSON(max_dynamic_paths=1024) 타입의 컬럼이 있고 설정 merge_max_dynamic_subcolumns_in_compact_part 값을 128로 지정한 경우,
Compact 데이터 파트로 머지된 이후 이 파트의 동적 경로 개수는 128로 줄어들며, 128개의 경로만 동적 서브컬럼으로 기록됩니다.

## merge_max_dynamic_subcolumns_in_wide_part \{#merge_max_dynamic_subcolumns_in_wide_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "데이터 타입에서 지정한 파라미터와 관계없이 머지 후 Wide 파트에서 생성되는 동적 서브컬럼 수를 제한하는 새로운 설정이 추가되었습니다"}]}]}/>

머지 후 Wide 데이터 파트의 각 컬럼에서 생성될 수 있는 동적 서브컬럼의 최대 개수입니다.
데이터 타입에서 지정한 동적 파라미터와 관계없이 Wide 데이터 파트에서 생성되는 파일 개수를 줄일 수 있습니다.

예를 들어, 테이블에 JSON(max_dynamic_paths=1024) 타입의 컬럼이 있고 설정 merge_max_dynamic_subcolumns_in_wide_part가 128로 지정되어 있는 경우,
머지 후 Wide 데이터 파트에서 이 파트의 동적 경로 수는 128로 줄어들고, 동적 서브컬럼으로는 128개의 경로만 기록됩니다.

## merge_selecting_sleep_ms \{#merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

아무 파트도 선택되지 않은 후, 병합할 파트를 다시 선택하려고 시도하기 전에 대기하는 최소 시간입니다. 이 값을 낮게 설정하면 background_schedule_pool에서 선택 작업이 자주 실행되어, 대규모 클러스터에서는 ZooKeeper로 향하는 요청이 대량으로 발생합니다.

## merge_selecting_sleep_slowdown_factor \{#merge_selecting_sleep_slowdown_factor\}

<SettingsInfoBlock type="Float" default_value="1.2" />

머지 선택 작업의 대기 시간은 머지할 항목이 없을 때 이 계수를 곱해 늘어나며, 머지 작업이 할당되면 이 계수로 나누어 줄어듭니다.

## merge_selector_algorithm \{#merge_selector_algorithm\}

<ExperimentalBadge/>

<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

머지 작업에 할당할 파트를 선택하는 알고리즘입니다.

## merge_selector_base \{#merge_selector_base\}

<SettingsInfoBlock type="Float" default_value="5" />

할당된 머지의 쓰기 증폭(write amplification)에 영향을 줍니다(전문가 수준 설정이므로, 동작을 이해하지 못한다면 변경하지 마십시오). Simple 및 StochasticSimple 머지 선택기에 대해 적용됩니다.

## merge_selector_blurry_base_scale_factor \{#merge_selector_blurry_base_scale_factor\}

<SettingsInfoBlock type="UInt64" default_value="0" />

파티션 내 파트 수를 기준으로 이 로직이 언제 동작하기 시작하는지를 제어합니다.  
계수가 클수록 반응이 더 늦게 나타납니다.

## merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once \{#merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

단순 merge selector용 휴리스틱을 활성화하여 merge 선택 시 최대 한도를 낮춥니다.
이렇게 하면 동시에 실행되는 merge 수가 증가하여 TOO_MANY_PARTS 오류를 완화하는 데 도움이 될 수 있지만, 그와 동시에 write amplification이 증가합니다.

## merge_selector_enable_heuristic_to_remove_small_parts_at_right \{#merge_selector_enable_heuristic_to_remove_small_parts_at_right\}

<SettingsInfoBlock type="Bool" default_value="1" />

머지 대상 파트를 선택할 때, 범위의 오른쪽 측에서 파트 크기가 `sum_size`의 지정 비율(0.01)보다 작은 경우 해당 파트를 제거하도록 하는 휴리스틱을 활성화합니다.
`Simple` 및 `StochasticSimple` 머지 선택기에서 작동합니다.

## merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent \{#merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "5"},{"label": "New setting"}]}]}/>

감소 곡선을 구성하는 공식에서 사용되는 지수 값을 제어합니다. 지수 값을 낮추면 머지 폭이 줄어들어 쓰기 증폭(write amplification)이 증가합니다. 그 반대도 성립합니다.

## merge_selector_window_size \{#merge_selector_window_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

한 번에 확인하는 파트 수입니다.

## merge_total_max_bytes_to_prewarm_cache \{#merge_total_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="16106127360" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud에서만 사용할 수 있습니다. 머지(merge) 중 캐시를 예열(prewarm)하기 위해 사용할 수 있는 파트의 총 최대 크기입니다.

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds \{#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## merge_tree_clear_old_parts_interval_seconds \{#merge_tree_clear_old_parts_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="1" />

ClickHouse가 오래된 파트, WAL, 뮤테이션을 정리하는 작업을 실행하는 간격(초)을 설정합니다.

가능한 값:

- 양의 정수입니다.

## merge_tree_clear_old_temporary_directories_interval_seconds \{#merge_tree_clear_old_temporary_directories_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="60" />

ClickHouse가 오래된 임시 디렉터리를 정리하는 작업을 실행하는 간격(초 단위)을 설정합니다.

가능한 값:

- 0보다 큰 양의 정수.

## merge_tree_enable_clear_old_broken_detached \{#merge_tree_enable_clear_old_broken_detached\}

<SettingsInfoBlock type="UInt64" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## merge_with_recompression_ttl_timeout \{#merge_with_recompression_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

재압축 TTL이 설정된 머지를 다시 수행하기 전까지의 최소 지연 시간(초)입니다.

## merge_with_ttl_timeout \{#merge_with_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

삭제 TTL이 적용된 머지 작업을 다시 수행하기 전까지의 최소 지연 시간(초)입니다.

## merge_workload \{#merge_workload\}

머지 작업과 다른 워크로드 간의 리소스 사용 및 공유 방식을 조절하는 데 사용합니다. 지정된 값은 이 테이블의 백그라운드 머지 작업에 대해 `workload` 설정 값으로 사용됩니다. 값이 지정되지 않았거나(빈 문자열)인 경우 서버 설정 `merge_workload` 값이 대신 사용됩니다.

**함께 보기**

- [워크로드 스케줄링](/operations/workload-scheduling.md)

## min_absolute_delay_to_close \{#min_absolute_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="0" />

종료를 수행하고 요청 제공을 중단하며 상태 점검 시 Ok를 반환하지 않기까지의 최소 절대 지연 시간입니다.

## min_age_to_force_merge_on_partition_only \{#min_age_to_force_merge_on_partition_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

`min_age_to_force_merge_seconds`를 파티션 전체에만 적용하고 하위 집합에는 적용하지 않을지 여부입니다.

기본적으로 `max_bytes_to_merge_at_max_space_in_pool` 설정을 무시합니다
(`enable_max_bytes_limit_for_min_age_to_force_merge`를 참조하십시오).

가능한 값:

- true, false

## min_age_to_force_merge_seconds \{#min_age_to_force_merge_seconds\}

<SettingsInfoBlock type="UInt64" default_value="0" />

범위 내의 모든 파트가 `min_age_to_force_merge_seconds` 값보다 오래된 경우 파트를 머지합니다.

기본적으로 `max_bytes_to_merge_at_max_space_in_pool` 설정을 무시합니다
(`enable_max_bytes_limit_for_min_age_to_force_merge` 참조).

가능한 값:

- 양의 정수.

## min_bytes_for_compact_part \{#min_bytes_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## min_bytes_for_full_part_storage \{#min_bytes_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud에서만 사용할 수 있습니다. 압축되지 않은 최소 크기(바이트)로, 데이터 파트에 대해 패킹 방식 대신 전체(full) 스토리지 유형을 사용하도록 하는 임계값입니다.

## min_bytes_for_wide_part \{#min_bytes_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

`Wide` 형식으로 저장될 수 있는 데이터 파트(data part)의 최소 바이트 수 또는 행 수입니다. 이 설정은 하나만 지정하거나 둘 모두 지정하거나, 아예 지정하지 않을 수도 있습니다.

## min_bytes_to_prewarm_caches \{#min_bytes_to_prewarm_caches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "새 설정"}]}]}/>

새 파트에 대해 mark 캐시와 primary 인덱스 캐시를 예열(prewarm)하는 데 필요한 최소 크기(비압축 바이트 수)입니다.

## min_bytes_to_rebalance_partition_over_jbod \{#min_bytes_to_rebalance_partition_over_jbod\}

<SettingsInfoBlock type="UInt64" default_value="0" />

새로운 대용량 파트를 볼륨 디스크(JBOD, [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures))에 분산할 때 균형 분산을 활성화하기 위한 최소 바이트 수를 설정합니다.

가능한 값:

- 양의 정수.
- `0` — 균형 분산이 비활성화됩니다.

**사용**

`min_bytes_to_rebalance_partition_over_jbod` 설정 값은
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024 값보다 작아서는 안 됩니다. 그렇지 않으면 ClickHouse가 예외를 던집니다.

## min_columns_to_activate_adaptive_write_buffer \{#min_columns_to_activate_adaptive_write_buffer\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "500"},{"label": "새 설정"}]}]}/>

컬럼 수가 많은 테이블에서 adaptive write buffer를 사용하여 메모리 사용량을 줄일 수 있도록 합니다.

가능한 값은 다음과 같습니다:

- 0 - 제한 없음
- 1 - 항상 활성화됨

## min_compress_block_size \{#min_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

다음 마크를 기록할 때 압축을 수행하기 위해 필요한 비압축 데이터 블록의 최소 크기입니다.
이 설정은 전역 설정에서도 지정할 수 있습니다
([min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)
설정을 참조하십시오). 테이블을 생성할 때 지정한 값은 이 설정에 대한 전역 설정 값을
덮어씁니다.

## min_compressed_bytes_to_fsync_after_fetch \{#min_compressed_bytes_to_fsync_after_fetch\}

<SettingsInfoBlock type="UInt64" default_value="0" />

가져오기(fetch) 후 파트에 대해 `fsync`를 수행할 최소 압축 바이트 수입니다(0이면 비활성화됩니다).

## min_compressed_bytes_to_fsync_after_merge \{#min_compressed_bytes_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

머지 후 파트에 대해 fsync를 수행하기 위한 최소 압축 바이트 수입니다(0이면 비활성화).

## min_delay_to_insert_ms \{#min_delay_to_insert_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

단일 파티션에 병합되지 않은 파트가 많이 있을 때 MergeTree 테이블에 데이터를 삽입하기 전에 적용되는 최소 지연 시간(밀리초)입니다.

## min_delay_to_mutate_ms \{#min_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

미완료된 뮤테이션이 많을 때 MergeTree 테이블에서 뮤테이션을 수행하기까지의 최소 지연 시간(밀리초)입니다.

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

데이터를 삽입하기 위해 디스크 공간에 반드시 비어 있어야 하는 최소 바이트 수입니다. 사용 가능한 여유 바이트 수가
`min_free_disk_bytes_to_perform_insert` 값보다 작으면 예외가 발생하고
삽입은 수행되지 않습니다. 이 설정은 다음과 같은 특성이 있습니다.

- `keep_free_space_bytes` 설정을 고려합니다.
- `INSERT` 연산으로 기록될 데이터의 양은 고려하지 않습니다.
- 0이 아닌 양수의 바이트 수가 지정된 경우에만 확인합니다.

가능한 값:

- 양의 정수.

:::note
`min_free_disk_bytes_to_perform_insert`와 `min_free_disk_ratio_to_perform_insert`가
둘 다 지정된 경우, ClickHouse는 더 많은 양의 여유 디스크 공간에서
삽입을 수행할 수 있게 하는 값을 사용합니다.
:::

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\}

<SettingsInfoBlock type="Float" default_value="0" />

`INSERT`를 수행하기 위한 최소 여유 디스크 공간 비율입니다. 0과 1 사이의 부동 소수점 값이어야 합니다. 이 설정은 다음과 같은 특징이 있습니다:

- `keep_free_space_bytes` 설정을 고려합니다.
- `INSERT` 작업으로 실제로 기록될 데이터 양은 고려하지 않습니다.
- 양수(0이 아닌) 비율이 지정된 경우에만 확인됩니다.

가능한 값:

- Float, 0.0 - 1.0

`min_free_disk_ratio_to_perform_insert`와
`min_free_disk_bytes_to_perform_insert`가 모두 지정된 경우, ClickHouse는
더 많은 양의 여유 공간에서 `INSERT`를 수행할 수 있도록 허용하는
값을 기준으로 동작합니다.

## min_index_granularity_bytes \{#min_index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

데이터 그래뉼 크기의 최소 허용값(바이트 단위)입니다.

`index_granularity_bytes` 값을 너무 낮게 설정한 테이블이 실수로 생성되는 것을 방지하기 위한 보호 장치입니다.

## min_level_for_full_part_storage \{#min_level_for_full_part_storage\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud에서만 사용할 수 있습니다. 데이터 파트에 대해 패킹 형식이 아닌 전체 형식의 스토리지를 사용하기 위한 최소 파트 레벨입니다.

## min_level_for_wide_part \{#min_level_for_wide_part\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "새 설정"}]}]}/>

데이터 파트를 `Compact` 포맷이 아닌 `Wide` 포맷으로 생성하는 데 필요한 최소 파트 레벨입니다.

## min_marks_to_honor_max_concurrent_queries \{#min_marks_to_honor_max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

[ max&#95;concurrent&#95;queries](#max_concurrent_queries) 설정을 적용하기 위해 쿼리가 읽어야 하는 최소 마크 수입니다.

:::note
쿼리는 다른 `max_concurrent_queries` 설정에 의해서도 계속 제한을 받습니다.
:::

가능한 값:

* 양의 정수.
* `0` — 비활성화됨 (`max_concurrent_queries` 제한이 어떤 쿼리에도 적용되지 않음).

**예시**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io \{#min_merge_bytes_to_use_direct_io\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

머지 작업에서 직접 I/O를 사용하기 위한 최소 데이터 용량입니다. 데이터 파트를 머지할 때 ClickHouse는 머지 대상인 모든 데이터의 전체 저장 용량을 계산합니다. 이 용량이 `min_merge_bytes_to_use_direct_io` 바이트를 초과하면 ClickHouse는 직접 I/O 인터페이스(`O_DIRECT` 옵션)를 사용하여 스토리지 디스크에 데이터를 읽고 씁니다. `min_merge_bytes_to_use_direct_io = 0`이면 직접 I/O는 비활성화됩니다.

## min_parts_to_merge_at_once \{#min_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="0" />

머지 선택기가 한 번에 병합 대상으로 선택할 수 있는 최소 데이터 파트 수입니다
(전문가 수준 설정이므로, 동작을 이해하지 못한다면 변경하지 마십시오).
0 - 비활성화. Simple 및 StochasticSimple 머지 선택기에 적용됩니다.

## min_relative_delay_to_close \{#min_relative_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="300" />

다른 레플리카와의 지연 시간이 이 값 이상이 되면, 종료하고 요청 처리를 중단하며 상태 점검 시 Ok를 반환하지 않도록 하는 최소 지연 시간입니다.

## min_relative_delay_to_measure \{#min_relative_delay_to_measure\}

<SettingsInfoBlock type="UInt64" default_value="120" />

절대 지연이 이 값 이상일 때에만 레플리카의 상대 지연을 계산합니다.

## min_relative_delay_to_yield_leadership \{#min_relative_delay_to_yield_leadership\}

<SettingsInfoBlock type="UInt64" default_value="120" />

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## min_replicated_logs_to_keep \{#min_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="10" />

ZooKeeper 로그에서 대략 이 개수만큼의 마지막 레코드를 유지합니다. 레코드가
더 이상 필요 없더라도 유지됩니다. 이 설정은 테이블 동작에는 영향을 주지 않고,
정리 전에 ZooKeeper 로그를 진단하는 용도로만 사용됩니다.

가능한 값:

- 0보다 큰 정수.

## min_rows_for_compact_part \{#min_rows_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 기능도 수행하지 않습니다.

## min_rows_for_full_part_storage \{#min_rows_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse Cloud에서만 사용 가능합니다. 데이터 파트에 패킹 방식 대신 전체 형식의
스토리지를 사용하도록 하는 최소 행 수입니다.

## min_rows_for_wide_part \{#min_rows_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`Compact` 형식 대신 `Wide` 형식의 데이터 파트를 생성하기 위한 최소 행 개수입니다.

## min_rows_to_fsync_after_merge \{#min_rows_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

머지 후 파트에 대해 `fsync`를 수행하기 위한 최소 행 수입니다(0이면 비활성화됩니다).

## mutation_workload \{#mutation_workload\}

뮤테이션과 기타 워크로드 간의 리소스 사용 및 공유를 조절하는 데 사용합니다. 지정한 값은 이 테이블의 백그라운드 뮤테이션에 대한 `workload` 설정 값으로 사용됩니다. 값이 지정되지 않은 경우(빈 문자열인 경우)에는 서버 설정 `mutation_workload`가 대신 사용됩니다.

**관련 항목**

- [Workload Scheduling](/operations/workload-scheduling.md)

## non_replicated_deduplication_window \{#non_replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="0" />

복제되지 않은
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에서
중복을 확인하기 위해 해시 합계를 저장해 두는, 가장 최근에 삽입된 블록 개수입니다.

가능한 값:

- 양의 정수.
- `0` (중복 제거 비활성화).

복제된 테이블(자세한 내용은
[replicated_deduplication_window](#replicated_deduplication_window) 설정 참조)과 유사한 중복 제거 메커니즘이 사용됩니다.
생성된 파트의 해시 합계는 디스크에 있는 로컬 파일에 기록됩니다.

## notify_newest_block_number \{#notify_newest_block_number\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

SharedJoin 또는 SharedSet에 최신 블록 번호를 통지합니다. ClickHouse Cloud에서만 지원됩니다.

## nullable_serialization_version \{#nullable_serialization_version\}

<SettingsInfoBlock type="MergeTreeNullableSerializationVersion" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "basic"},{"label": "New setting"}]}]}/>

`Nullable(T)` 컬럼에 사용되는 직렬화 방식을 제어합니다.

가능한 값:

- basic — `Nullable(T)`에 표준 직렬화를 사용합니다.

- allow_sparse — `Nullable(T)`에서 희소 인코딩을 허용합니다.

## number_of_free_entries_in_pool_to_execute_mutation \{#number_of_free_entries_in_pool_to_execute_mutation\}

<SettingsInfoBlock type="UInt64" default_value="20" />

풀에서 사용 가능한 엔트리 수가 지정된 값보다 적으면 파트 뮤테이션을
실행하지 않습니다. 이는 일반 머지 작업을 위한 여유 스레드를 남겨 두고
「Too many parts」 오류를 방지하기 위한 것입니다.

가능한 값:

- 양의 정수입니다.

**사용**

`number_of_free_entries_in_pool_to_execute_mutation` 설정 값은
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) 값보다 작아야 합니다.

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
그렇지 않으면 ClickHouse가 예외를 발생시킵니다.

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition \{#number_of_free_entries_in_pool_to_execute_optimize_entire_partition\}

<SettingsInfoBlock type="UInt64" default_value="25" />

풀에서 사용 가능한 엔트리 수가 지정된 값보다 적으면, 백그라운드에서 전체 파티션을 최적화하는 작업을 실행하지 않습니다(이 작업은 `min_age_to_force_merge_seconds`를 설정하고
`min_age_to_force_merge_on_partition_only`를 활성화했을 때 생성됩니다). 이는 일반적인 머지 작업을 위한 여유 스레드를 남겨 두고 「Too many parts」 오류를 방지하기 위한 것입니다.

가능한 값:

- 양의 정수.

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
설정 값은
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)
값의 곱보다 작아야 합니다. 그렇지 않으면 ClickHouse에서 예외를 발생시킵니다.

## number_of_free_entries_in_pool_to_lower_max_size_of_merge \{#number_of_free_entries_in_pool_to_lower_max_size_of_merge\}

<SettingsInfoBlock type="UInt64" default_value="8" />

풀(pool)에서 사용 가능한(빈) 엔트리 수가 지정한 값보다 작아지면
(또는 복제 큐의 경우), 처리할 병합(merge)의 최대 크기
(또는 큐에 넣을 병합의 최대 크기)를 줄이기 시작합니다.
이는 장시간 실행되는 병합으로 풀을 가득 채우지 않고,
작은 병합이 처리될 수 있도록 하기 위한 것입니다.

가능한 값:

- 양의 정수.

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\}

<SettingsInfoBlock type="UInt64" default_value="500" />

테이블에 완료되지 않은 뮤테이션이 해당 개수 이상 존재하면, 테이블의 뮤테이션 실행 속도를 인위적으로 늦춥니다.  
0으로 설정하면 비활성화됩니다.

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

테이블에 완료되지 않은 뮤테이션이 이 값 이상 존재하면 「Too many mutations」 예외를 발생시킵니다. 0으로 설정하면 비활성화됩니다.

## number_of_partitions_to_consider_for_merge \{#number_of_partitions_to_consider_for_merge\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud에서만 사용할 수 있습니다. 머지를 고려할 상위 N개의 파티션까지만 대상으로 합니다. 파티션은 해당 파티션에서 머지할 수 있는 데이터 파트 개수를 가중치로 하는 가중 무작위 방식으로 선택됩니다.

## object_serialization_version \{#object_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "JSON 직렬화 버전을 제어하기 위한 설정 추가"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "고급 shared data 직렬화를 사용하기 위해 JSON에 대해 기본값으로 v3 직렬화 버전 활성화"}]}]}/>

JSON 데이터 타입에 대한 직렬화 버전입니다. 호환성을 위해 필요합니다.

가능한 값:

- `v1`
- `v2`
- `v3`

`v3` 버전에서만 shared data 직렬화 버전을 변경할 수 있습니다.

## object_shared_data_buckets_for_compact_part \{#object_shared_data_buckets_for_compact_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Compact 파트에서 JSON 직렬화 시 공유 데이터에 사용할 버킷 개수를 제어하는 설정이 추가되었습니다"}]}]}/>

Compact 파트에서 JSON 공유 데이터를 직렬화할 때 사용할 버킷 개수입니다. `map_with_buckets` 및 `advanced` 공유 데이터 직렬화 방식에서 사용됩니다.

## object_shared_data_buckets_for_wide_part \{#object_shared_data_buckets_for_wide_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "Wide 파트에서 공유 데이터의 JSON 직렬화에 사용되는 버킷 개수를 제어하는 설정 추가"}]}]}/>

Wide 파트에서 공유 데이터를 JSON으로 직렬화할 때 사용할 버킷 개수입니다. `map_with_buckets` 및 `advanced` 공유 데이터 직렬화 방식과 함께 동작합니다.

## object_shared_data_serialization_version \{#object_shared_data_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="advanced" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "advanced"},{"label": "Enable advanced shared data serialization version by default"}]}]}/>

JSON 데이터 타입 내부에 저장되는 공유 데이터의 직렬화 버전입니다.

가능한 값:

- `map` - 공유 데이터를 `Map(String, String)` 형태로 저장합니다.
- `map_with_buckets` - 공유 데이터를 여러 개의 개별 `Map(String, String)` 컬럼으로 저장합니다. 버킷을 사용하면 공유 데이터에서 개별 경로를 읽을 때 성능이 향상됩니다.
- `advanced` - 공유 데이터에서 개별 경로를 읽는 성능을 크게 향상시키도록 설계된 특수한 공유 데이터 직렬화 방식입니다.  
이 직렬화 방식은 많은 추가 정보를 저장하므로 디스크에서 공유 데이터가 차지하는 공간이 증가합니다.

`map_with_buckets` 및 `advanced` 직렬화에 사용되는 버킷 수는
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part) 설정으로 결정됩니다.

## object_shared_data_serialization_version_for_zero_level_parts \{#object_shared_data_serialization_version_for_zero_level_parts\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map_with_buckets" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "zero level 파트에 대한 JSON 직렬화 버전을 제어하는 설정을 추가합니다"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "map_with_buckets"},{"label": "zero level 파트에 대해 기본적으로 map_with_buckets 공유 데이터 직렬화 버전을 활성화합니다"}]}]}/>

이 설정은 삽입 작업 중에 생성되는 zero level 파트에 대해 JSON 타입 내부의 공유 데이터에 사용할 서로 다른 직렬화 버전을 지정할 수 있게 합니다.  
zero level 파트에 대해서는 `advanced` 공유 데이터 직렬화를 사용하지 않는 것이 좋습니다. 삽입 시간이 크게 증가할 수 있기 때문입니다.

## old_parts_lifetime \{#old_parts_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="480" />

예기치 않은 서버 재부팅 시 데이터 손실을 방지하기 위해 비활성 파트를
저장해 두는 시간(초)입니다.

가능한 값:

- 양의 정수.

여러 파트를 새 파트로 머지한 후 ClickHouse는 원래 파트를 비활성 상태로
표시하고, `old_parts_lifetime` 초가 지난 후에만 삭제합니다.
비활성 파트는 현재 쿼리에서 사용되지 않을 때, 즉 해당 파트의 `refcount`가
1인 경우 제거됩니다.

새 파트에 대해서는 `fsync`가 호출되지 않으므로, 일정 시간 동안 새 파트는
서버의 RAM(OS 캐시)에만 존재합니다. 서버가 예기치 않게 재부팅되면 새 파트는
손실되거나 손상될 수 있습니다. 데이터를 보호하기 위해 비활성 파트는 즉시
삭제되지 않습니다.

시작 시 ClickHouse는 파트의 무결성을 검사합니다. 머지된 파트가 손상된 경우
ClickHouse는 비활성 파트를 다시 활성 목록으로 되돌리고, 이후 다시 머지합니다.
그 다음 손상된 파트의 이름을 변경하고(`broken_` 접두사를 추가), `detached`
폴더로 이동합니다. 머지된 파트가 손상되지 않은 경우에는, 원래 비활성 파트의
이름을 변경하고(`ignored_` 접두사를 추가), `detached` 폴더로 이동합니다.

기본 `dirty_expire_centisecs` 값(Linux 커널 설정)은 30초(기록된 데이터가 RAM에만
저장될 수 있는 최대 시간)이지만, 디스크 시스템에 부하가 큰 경우 데이터 기록이
훨씬 늦게 이루어질 수 있습니다. `old_parts_lifetime`에 대해 480초라는 값은
실험적으로 선택되었으며, 이 시간 동안 새 파트가 디스크에 기록되는 것이
보장됩니다.

## optimize_row_order \{#optimize_row_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

새로 삽입되는 테이블 파트의 압축 효율을 높이기 위해, 삽입 시 행 순서를
최적화할지 여부를 제어합니다.

일반적인 MergeTree 엔진 테이블에만 효과가 있습니다. 특수한 MergeTree 엔진
테이블(예: CollapsingMergeTree)에는 영향을 주지 않습니다.

MergeTree 테이블은 (선택적으로) [compression codecs](/sql-reference/statements/create/table#column_compression_codec)를 사용해 압축됩니다.
LZ4, ZSTD와 같은 범용 압축 코덱은 데이터에 패턴이 있을 때 최대 압축률을
달성합니다. 동일한 값이 길게 반복되는 구간은 일반적으로 매우 잘 압축됩니다.

이 설정이 활성화되면 ClickHouse는 새로 삽입되는 파트의 데이터를, 새 테이블
파트의 컬럼 전반에서 동일 값이 연속되는 구간 수를 최소화하는 행 순서로
저장하려고 시도합니다.
다시 말해, 동일 값 구간의 수가 적다는 것은 각 구간이 길다는 의미이고,
이 경우 압축이 잘 됩니다.

최적의 행 순서를 찾는 것은 계산적으로 실현 불가능한 NP-난해 문제입니다.
따라서 ClickHouse는 원래 행 순서보다 압축률을 개선하면서도
빠르게 행 순서를 찾기 위한 휴리스틱을 사용합니다.

<details markdown="1">

<summary>행 순서를 찾기 위한 휴리스틱</summary>

SQL은 서로 다른 행 순서를 가진 동일 테이블(또는 테이블 파트)을 동등한 것으로
간주하므로, 일반적으로 테이블(또는 테이블 파트)의 행을 자유롭게 재배열할 수
있습니다.

테이블에 기본 키가 정의된 경우에는 이러한 행 재배열의 자유도가 제한됩니다.
ClickHouse에서 기본 키 `C1, C2, ..., CN`은 테이블 행이 컬럼 `C1`, `C2`, ... `Cn`
기준으로 정렬되도록 강제합니다([clustered index](https://en.wikipedia.org/wiki/Database_index#Clustered)).
그 결과, 행은 동일한 기본 키 컬럼 값들을 가지는 행들, 즉 하나의 "동치류" 내에서만
재배열할 수 있습니다.
직관적으로, 예를 들어 `DateTime64` 타임스탬프 컬럼을 포함하는 기본 키처럼
고카디널리티 기본 키는 많은 작은 동치류를 만듭니다.
반대로, 저카디널리티 기본 키를 가진 테이블은 소수의 크고 큰 동치류를 만듭니다.
기본 키가 없는 테이블은 모든 행을 포함하는 단일 동치류라는 극단적인 경우를
나타냅니다.

동치류의 개수가 적고 각 동치류가 클수록, 행을 다시 재배열할 수 있는 자유도가
높아집니다.

각 동치류 내에서 최적의 행 순서를 찾기 위해 적용되는 휴리스틱은
D. Lemire, O. Kaser의
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)에서
제안되었으며, 각 동치류의 행을 비-기본 키(non-primary-key) 컬럼의
카디널리티가 오름차순이 되도록 정렬하는 방식에 기반합니다.

이 알고리즘은 세 단계로 동작합니다:
1. 기본 키 컬럼의 행 값을 기준으로 모든 동치류를 찾습니다.
2. 각 동치류에 대해 비-기본 키 컬럼의 카디널리티를 계산(일반적으로 추정)합니다.
3. 각 동치류에 대해 비-기본 키 컬럼 카디널리티가 오름차순이 되도록 행을
정렬합니다.

</details>

이 설정을 활성화하면, 새로운 데이터의 행 순서를 분석하고 최적화하기 위해
삽입 작업에 추가적인 CPU 비용이 발생합니다.
데이터 특성에 따라 INSERT 작업은 30–50% 정도 더 오래 걸릴 수 있습니다.
LZ4 또는 ZSTD의 압축률은 평균적으로 20–40% 향상됩니다.

이 설정은 기본 키가 없거나 저카디널리티 기본 키를 가진 테이블, 즉 서로 다른
기본 키 값의 개수가 적은 테이블에서 가장 효과적입니다.
`DateTime64` 타입의 타임스탬프 컬럼을 포함하는 등 고카디널리티 기본 키를
가진 테이블은 이 설정의 이점을 기대하기 어렵습니다.

## part_moves_between_shards_delay_seconds \{#part_moves_between_shards_delay_seconds\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

세그먼트 간 파트를 이동하기 전후에 대기하는 시간(초)입니다.

## part_moves_between_shards_enable \{#part_moves_between_shards_enable\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

세그먼트 간 파트를 이동하는 실험적/미완성 기능입니다.  
샤딩 표현식은 고려하지 않습니다.

## parts_to_delay_insert \{#parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

하나의 파티션에서 활성 파트의 개수가 `parts_to_delay_insert` 값을 초과하면
`INSERT`가 인위적으로 지연됩니다.

가능한 값:

- 양의 정수.

ClickHouse는 백그라운드 머지 프로세스가 새로 추가되는 것보다 더 빠르게 파트를 머지할 수 있도록 `INSERT` 실행 시간을 인위적으로 늘립니다(「sleep」을 추가합니다).

## parts_to_throw_insert \{#parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="3000" />

단일 파티션에서 활성 파트 수가 `parts_to_throw_insert` 값을 초과하면
`INSERT`가 `Too many parts (N). Merges are processing significantly slower than inserts`
예외와 함께 중단됩니다.

가능한 값:

- 모든 양의 정수.

`SELECT` 쿼리의 최대 성능을 얻으려면 처리되는 파트 수를 최소화해야 합니다. 자세한 내용은 [Merge Tree](/development/architecture#merge-tree)를 참조하십시오.

버전 23.6 이전에는 이 설정이 300으로 설정되어 있었습니다. 더 높은 값으로 설정할 수 있으며,
이 경우 `Too many parts` 오류가 발생할 가능성은 줄어들지만 동시에 `SELECT` 성능이 저하될 수 있습니다.
또한 머지 문제(예: 디스크 공간 부족)가 발생하는 경우, 원래 값 300일 때보다 문제를 더 늦게 인지하게 됩니다.

## prefer_fetch_merged_part_size_threshold \{#prefer_fetch_merged_part_size_threshold\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

파트 크기의 합이 이 임계값을 초과하고, 복제 로그 항목이 생성된 이후 경과 시간이
`prefer_fetch_merged_part_time_threshold`를 초과하면 로컬에서 머지 작업을 수행하는 대신
레플리카에서 병합된 파트를 가져오는 동작을 우선합니다. 이는 매우 오래 걸리는 머지 작업을
더 빠르게 처리하기 위한 것입니다.

가능한 값:

- 양의 정수.

## prefer_fetch_merged_part_time_threshold \{#prefer_fetch_merged_part_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="3600" />

복제 로그(ClickHouse Keeper 또는 ZooKeeper)
엔트리가 생성된 이후 경과한 시간이 이 임계값을 초과하고, 파트 크기의 합이
`prefer_fetch_merged_part_size_threshold`보다 크면, 로컬에서 머지를 수행하는 대신
레플리카에서 머지된 파트를 가져오는 방식을 우선적으로 사용합니다. 이는 매우 오래 걸리는
머지 작업을 빠르게 처리하기 위한 설정입니다.

가능한 값:

- 양의 정수.

## prewarm_mark_cache \{#prewarm_mark_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

값이 true이면 삽입, 머지, 페치 및 서버 시작 시 마크를 마크 캐시에 저장하여
마크 캐시를 미리 채웁니다

## prewarm_primary_key_cache \{#prewarm_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

이 설정을 true로 설정하면 기본 인덱스
캐시는 insert, merge, fetch 작업 및 서버 시작 시 마크를 mark cache에 저장하여 미리 로드됩니다

## primary_key_compress_block_size \{#primary_key_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

프라이머리 키를 압축할 때 사용하는 블록의 기본 크기입니다. 압축할 블록의 실제 크기를 지정합니다.

## primary_key_compression_codec \{#primary_key_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

기본 키에 사용되는 압축 코덱입니다. 기본 키는 충분히 작고 캐시에 저장되므로 기본 압축 방식은 ZSTD(3)입니다.

## primary_key_lazy_load \{#primary_key_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

테이블을 초기화할 때가 아니라 처음 사용 시 기본 키를 메모리에 로드합니다. 이는 테이블 수가 매우 많을 때 메모리를 절약하는 데 도움이 됩니다.

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns \{#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns\}

<SettingsInfoBlock type="Float" default_value="0.9" />

데이터 파트(data part)에서 기본 키 컬럼의 값이 행들 사이에서 이 비율 이상으로 자주 변경되는 경우, 뒤에 오는 기본 키 컬럼들을 메모리에 로드하지 않습니다. 이렇게 하면 기본 키의 불필요한 컬럼을 로드하지 않아 메모리 사용량을 절감할 수 있습니다.

## ratio_of_defaults_for_sparse_serialization \{#ratio_of_defaults_for_sparse_serialization\}

<SettingsInfoBlock type="Float" default_value="0.9375" />

컬럼에서 *기본값(default)* 값이 *전체* 값에서 차지하는 비율의 최소값입니다.
이 값을 설정하면 컬럼이 희소 직렬화(sparse serialization)를 사용하여 저장됩니다.

컬럼이 희소(대부분이 0이거나 기본값)인 경우 ClickHouse는 이를 희소 형식으로
인코딩하여 계산을 자동으로 최적화할 수 있으며, 쿼리 시 데이터를 완전히
압축 해제할 필요가 없습니다. 이러한 희소 직렬화를 활성화하려면
`ratio_of_defaults_for_sparse_serialization` 설정을 1.0보다 작게
지정해야 합니다. 값이 1.0 이상이면 컬럼은 항상 일반 전체 직렬화 방식으로
기록됩니다.

가능한 값:

* 희소 직렬화를 활성화하려면 `0`과 `1` 사이의 Float 값
* 희소 직렬화를 사용하지 않으려면 `1.0` (또는 그 이상)

**예시**

다음 테이블에서 `s` 컬럼은 95%의 행에서 빈 문자열입니다.
`my_regular_table`에서는 희소 직렬화를 사용하지 않고,
`my_sparse_table`에서는 `ratio_of_defaults_for_sparse_serialization`을
0.95로 설정합니다:

```sql
CREATE TABLE my_regular_table
(
`id` UInt64,
`s` String
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO my_regular_table
SELECT
number AS id,
number % 20 = 0 ? toString(number): '' AS s
FROM
numbers(10000000);


CREATE TABLE my_sparse_table
(
`id` UInt64,
`s` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS ratio_of_defaults_for_sparse_serialization = 0.95;

INSERT INTO my_sparse_table
SELECT
number,
number % 20 = 0 ? toString(number): ''
FROM
numbers(10000000);
```

`my_sparse_table`의 `s` 컬럼은 디스크에서 더 적은 저장 공간을 사용합니다.

```sql
SELECT table, name, data_compressed_bytes, data_uncompressed_bytes FROM system.columns
WHERE table LIKE 'my_%_table';
```

```response
┌─table────────────┬─name─┬─data_compressed_bytes─┬─data_uncompressed_bytes─┐
│ my_regular_table │ id   │              37790741 │                75488328 │
│ my_regular_table │ s    │               2451377 │                12683106 │
│ my_sparse_table  │ id   │              37790741 │                75488328 │
│ my_sparse_table  │ s    │               2283454 │                 9855751 │
└──────────────────┴──────┴───────────────────────┴─────────────────────────┘
```

컬럼이 희소 인코딩을 사용하는지 확인하려면 `system.parts_columns` 테이블의 `serialization_kind` 컬럼을 조회하면 됩니다:

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

`희소` 직렬화를 사용하여 `s`의 어떤 파트들이 저장되었는지 확인할 수 있습니다.

```response
┌─column─┬─serialization_kind─┐
│ id     │ Default            │
│ s      │ Default            │
│ id     │ Default            │
│ s      │ Default            │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
└────────┴────────────────────┘
```


## reduce_blocking_parts_sleep_ms \{#reduce_blocking_parts_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5000"},{"label": "Cloud sync"}]}]}/>

ClickHouse Cloud에서만 사용할 수 있습니다. 어떤 범위도 삭제되거나 교체되지 않은 이후, 차단 파트를 다시 줄이려고 시도하기 전까지 대기하는 최소 시간입니다. 이 값을 더 낮게 설정하면 background_schedule_pool에서 태스크가 더 자주 트리거되어, 대규모 클러스터에서 ZooKeeper로의 요청이 매우 많이 발생합니다.

## refresh_parts_interval \{#refresh_parts_interval\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

0보다 큰 값으로 설정하면, 내부적으로 데이터가 업데이트되었는지 확인하기 위해 기본 파일 시스템에서 데이터 파트 목록을 새로 고칩니다.
테이블이 읽기 전용 디스크에 있는 경우에만 설정할 수 있으며, 이는 다른 레플리카가 데이터를 기록하는 동안 이 테이블이 읽기 전용 레플리카임을 의미합니다.

## refresh_statistics_interval \{#refresh_statistics_interval\}

<SettingsInfoBlock type="Seconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "300"},{"label": "통계 캐시 활성화"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "0"},{"label": "새 설정"}]}]}/>

통계 캐시를 갱신하는 간격(초)입니다. 0으로 설정하면 갱신이 비활성화됩니다.

## remote_fs_execute_merges_on_single_replica_time_threshold \{#remote_fs_execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="10800" />

이 설정의 값이 0보다 클 때, 공유 스토리지에 머지된 파트가 있는 경우 단일 레플리카만
즉시 머지 작업을 시작합니다.

:::note
Zero-copy 복제는 프로덕션 환경에서 사용하기에 아직 준비되지 않았습니다.
Zero-copy 복제는 ClickHouse 버전 22.8 이상에서 기본적으로 비활성화되어 있습니다.

이 기능은 프로덕션 환경에서의 사용이 권장되지 않습니다.
:::

가능한 값:

- 0보다 큰 양의 정수.

## remote_fs_zero_copy_path_compatible_mode \{#remote_fs_zero_copy_path_compatible_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

변환 과정에서 호환 모드로 zero-copy를 실행합니다.

## remote_fs_zero_copy_zookeeper_path \{#remote_fs_zero_copy_zookeeper_path\}

<ExperimentalBadge/>

<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

제로-카피와 관련된, 테이블에 독립적인 정보를 위한 ZooKeeper 경로입니다.

## remove_empty_parts \{#remove_empty_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

TTL, mutation 또는 collapsing merge 알고리즘에 의해 정리(prune)된 후 비어 있는 파트를 제거합니다.

## remove_rolled_back_parts_immediately \{#remove_rolled_back_parts_immediately\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

미완성 실험적 기능을 위한 설정입니다.

## remove_unused_patch_parts \{#remove_unused_patch_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

모든 활성 파트에 이미 적용된 패치 파트를 백그라운드 작업으로 제거합니다.

## replace_long_file_name_to_hash \{#replace_long_file_name_to_hash\}

<SettingsInfoBlock type="Bool" default_value="1" />

컬럼의 파일 이름이 너무 긴 경우(`max_file_name_length` 바이트를 초과하면) 파일 이름을 SipHash128 해시로 대체합니다.

## replicated_can_become_leader \{#replicated_can_become_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

`true`이면 이 노드에 있는 복제된 테이블의 레플리카들이 리더가 되려고 시도합니다.

가능한 값:

- `true`
- `false`

## replicated_deduplication_window \{#replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>

ClickHouse Keeper가 중복을 확인하기 위해 해시 합을 저장하는, 가장 최근에 삽입된 블록의 개수입니다.

가능한 값은 다음과 같습니다.

- 양의 정수
- 0 (중복 제거 비활성화)

`Insert` 명령은 하나 이상의 블록(파트)을 생성합니다. 
[insert deduplication](../../engines/table-engines/mergetree-family/replication.md)을 위해 복제된 테이블(Replicated Table)에 기록할 때, ClickHouse는 생성된 파트의 해시 합을 ClickHouse Keeper에 기록합니다. 해시 합은 가장 최근의 `replicated_deduplication_window` 블록에 대해서만 저장됩니다. 가장 오래된 해시 합은 ClickHouse Keeper에서 제거됩니다.

`replicated_deduplication_window` 값을 크게 설정하면, 더 많은 엔트리를 비교해야 하므로 `Insert`가 느려집니다. 해시 합은 필드 이름과 유형의 조합, 그리고 삽입된 파트(바이트 스트림)의 데이터로부터 계산됩니다.

## replicated_deduplication_window_for_async_inserts \{#replicated_deduplication_window_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper가 중복을 확인하기 위해 해시 합을 저장하는, 가장 최근 비동기 삽입 블록 개수입니다.

가능한 값:

- 양의 정수
- 0 (`async_inserts`에 대한 중복 제거(deduplication) 비활성화)

[Async Insert](/operations/settings/settings#async_insert) 명령은 하나 이상의 블록(파트)에 캐시됩니다. [삽입 중복 제거(insert deduplication)](/engines/table-engines/mergetree-family/replication)을 사용하여 복제된 테이블(Replicated Table)에 기록할 때 ClickHouse는 각 삽입의 해시 합을 ClickHouse Keeper에 기록합니다. 해시 합은 가장 최근 `replicated_deduplication_window_for_async_inserts` 블록에 대해서만 저장됩니다. 가장 오래된 해시 합은 ClickHouse Keeper에서 제거됩니다.
`replicated_deduplication_window_for_async_inserts` 값이 크면 더 많은 항목을 비교해야 하므로 `Async Inserts`가 느려집니다.
해시 합은 필드 이름과 타입의 조합 및 삽입 데이터(바이트 스트림)를 기반으로 계산됩니다.

## replicated_deduplication_window_seconds \{#replicated_deduplication_window_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

삽입된 블록의 해시 합계를 ClickHouse Keeper에서 제거하는 기준이 되는 시간(초)입니다.

가능한 값:

- 양의 정수.

[replicated_deduplication_window](#replicated_deduplication_window)와 유사하게
`replicated_deduplication_window_seconds`는 삽입 중복 제거(deduplication)를 위해
블록의 해시 합계를 얼마나 오래 저장할지 지정합니다. `replicated_deduplication_window_seconds`
보다 오래된 해시 합계는 `replicated_deduplication_window`보다 작더라도
ClickHouse Keeper에서 제거됩니다.

이 시간은 실제 시각(wall time)이 아니라 가장 최근 레코드의 시각을 기준으로 합니다.
레코드가 하나뿐이면 영구적으로 저장됩니다.

## replicated_deduplication_window_seconds_for_async_inserts \{#replicated_deduplication_window_seconds_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="604800" />

비동기 insert의 해시 합(hash sum)이 ClickHouse Keeper에서 제거되기까지 걸리는 시간(초)입니다.

가능한 값:

- 0보다 큰 정수.

[replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts)와
유사하게, `replicated_deduplication_window_seconds_for_async_inserts`는 비동기 insert 중복 제거를 위해
블록의 해시 합을 얼마나 오래 저장할지 지정합니다.
`replicated_deduplication_window_seconds_for_async_inserts`보다 오래된 해시 합은
`replicated_deduplication_window_for_async_inserts`보다 작더라도 ClickHouse Keeper에서 제거됩니다.

시간은 실제 시간(wall time)이 아니라 가장 최근 레코드의 시점을 기준으로 계산됩니다.
해당 레코드가 유일한 레코드인 경우에는 영구적으로 저장됩니다.

## replicated_fetches_http_connection_timeout \{#replicated_fetches_http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 효과도 없습니다.

## replicated_fetches_http_receive_timeout \{#replicated_fetches_http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 효과도 없습니다.

## replicated_fetches_http_send_timeout \{#replicated_fetches_http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 작업도 수행하지 않습니다.

## replicated_max_mutations_in_one_entry \{#replicated_max_mutations_in_one_entry\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

하나의 MUTATE_PART 엔트리에서 함께 병합하여 실행할 수 있는 뮤테이션 명령의 최대 개수입니다(0은 무제한임을 의미합니다).

## replicated_max_parallel_fetches \{#replicated_max_parallel_fetches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## replicated_max_parallel_fetches_for_host \{#replicated_max_parallel_fetches_for_host\}

<SettingsInfoBlock type="UInt64" default_value="15" />

더 이상 사용되지 않는 설정으로, 아무 효과도 없습니다.

## replicated_max_parallel_fetches_for_table \{#replicated_max_parallel_fetches_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## replicated_max_parallel_sends \{#replicated_max_parallel_sends\}

<SettingsInfoBlock type="UInt64" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무 효과도 없습니다.

## replicated_max_parallel_sends_for_table \{#replicated_max_parallel_sends_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

더 이상 사용되지 않는 설정으로, 아무런 동작도 하지 않습니다.

## replicated_max_ratio_of_wrong_parts \{#replicated_max_ratio_of_wrong_parts\}

<SettingsInfoBlock type="Float" default_value="0.5" />

잘못된 파트 수와 전체 파트 수의 비율이 이 값보다 작으면 시작할 수 있습니다.

가능한 값:

- Float, 0.0 - 1.0

## search_orphaned_parts_disks \{#search_orphaned_parts_disks\}

<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>

ClickHouse는 ATTACH 또는 CREATE 테이블이 실행될 때마다 모든 디스크를 스캔하여, 스토리지 정책에 포함되지 않은(정의되지 않은) 디스크에 있는 데이터 파트를 놓치지 않도록 고아 파트를 검색합니다.
고아 파트는 잠재적으로 안전하지 않은 스토리지 재구성(예: 디스크를 스토리지 정책에서 제외한 경우)으로 인해 발생할 수 있습니다.
이 설정은 디스크의 특성에 따라 검색 대상 디스크 범위를 제한합니다.

가능한 값:

- any - 범위를 제한하지 않습니다.
- local - 로컬 디스크로 범위를 제한합니다.
- none - 빈 범위, 검색하지 않습니다.

## serialization_info_version \{#serialization_info_version\}

<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "사용자 지정 문자열 직렬화를 허용하는 최신 형식으로 변경"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "새 설정"}]}]}/>

`serialization.json`을 기록할 때 사용되는 직렬화 정보 버전입니다.
클러스터 업그레이드 시 호환성을 유지하기 위해 필요한 설정입니다.

가능한 값:

- `basic` - 기본 형식입니다.
- `with_types` - `types_serialization_versions` 필드가 추가된 형식으로, 타입별 직렬화 버전을 허용합니다.
이를 통해 `string_serialization_version`과 같은 설정이 효과를 발휘합니다.

롤링 업그레이드 중에는 새 서버가 이전 서버와 호환되는 데이터 파트를 생성하도록 이 값을 `basic`으로 설정합니다.
업그레이드가 완료된 후에는 타입별 직렬화 버전을 활성화하기 위해 `with_types`로 전환합니다.

## shared_merge_tree_activate_coordinated_merges_tasks \{#shared_merge_tree_activate_coordinated_merges_tasks\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "새 설정"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "새 설정"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "새 설정"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "새 설정"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "새 설정"}]}]}/>

조정된 머지 작업의 재스케줄을 활성화합니다. shared_merge_tree_enable_coordinated_merges=0인 경우에도 머지 코디네이터 통계를 수집하여 콜드 스타트에 도움이 되므로 유용할 수 있습니다.

## shared_merge_tree_create_per_replica_metadata_nodes \{#shared_merge_tree_create_per_replica_metadata_nodes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Keeper의 메타데이터 양을 줄입니다."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud 동기화"}]}]}/>

ZooKeeper에 레플리카별 /metadata 및 /columns 노드를 생성하도록 활성화합니다.
ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_disable_merges_and_mutations_assignment \{#shared_merge_tree_disable_merges_and_mutations_assignment\}

<SettingsInfoBlock type="Bool" default_value="0" />

shared MergeTree에서 merge와 뮤테이션 할당을 중지합니다. ClickHouse Cloud에서만 사용할 수 있는 설정입니다.

## shared_merge_tree_empty_partition_lifetime \{#shared_merge_tree_empty_partition_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "새 설정"}]}]}/>

파트가 없는 파티션을 Keeper에 보관하는 시간(초)을 지정합니다.

## shared_merge_tree_enable_automatic_empty_partitions_cleanup \{#shared_merge_tree_enable_automatic_empty_partitions_cleanup\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "Enable by default"}]}, {"id": "row-2","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

빈 파티션의 Keeper 엔트리를 자동으로 정리하는 기능을 활성화합니다.

## shared_merge_tree_enable_coordinated_merges \{#shared_merge_tree_enable_coordinated_merges\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "새 설정"}]}]}/>

coordinated merges 전략을 활성화합니다.

## shared_merge_tree_enable_keeper_parts_extra_data \{#shared_merge_tree_enable_keeper_parts_extra_data\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

가상 파트에 속성을 기록하고 Keeper에서 블록을 커밋하는 기능을 활성화합니다.

## shared_merge_tree_enable_outdated_parts_check \{#shared_merge_tree_enable_outdated_parts_check\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

오래된 파트(outdated parts)를 검사하는 기능을 활성화합니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_idle_parts_update_seconds \{#shared_merge_tree_idle_parts_update_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

shared merge tree에서 ZooKeeper watch 트리거 없이 파트 업데이트가 수행되는 간격(초)입니다.
ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_initial_parts_update_backoff_ms \{#shared_merge_tree_initial_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

파트 업데이트를 위한 초기 백오프 시간입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_interserver_http_connection_timeout_ms \{#shared_merge_tree_interserver_http_connection_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

서버 간 HTTP 연결의 타임아웃입니다. ClickHouse Cloud에서만 사용 가능합니다.

## shared_merge_tree_interserver_http_timeout_ms \{#shared_merge_tree_interserver_http_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

서버 간 HTTP 통신에 대한 타임아웃입니다. ClickHouse Cloud에서만 사용 가능합니다.

## shared_merge_tree_leader_update_period_random_add_seconds \{#shared_merge_tree_leader_update_period_random_add_seconds\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

thundering herd 효과를 방지하기 위해 shared_merge_tree_leader_update_period에 0초에서 x초 사이에서 균등 분포로 선택된 값을 더합니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_leader_update_period_seconds \{#shared_merge_tree_leader_update_period_seconds\}

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

파트 업데이트를 위한 리더 노드 여부를 재검사하는 최대 주기입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_max_outdated_parts_to_process_at_once \{#shared_merge_tree_max_outdated_parts_to_process_at_once\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

리더가 하나의 HTTP 요청에서 제거 대상으로 확인하려고 시도하는 오래된 파트의 최대 개수를 정의합니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_max_parts_update_backoff_ms \{#shared_merge_tree_max_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "새 설정"}]}]}/>

파트 업데이트를 위한 최대 백오프 시간입니다. ClickHouse Cloud에서만 사용 가능합니다.

## shared_merge_tree_max_parts_update_leaders_in_total \{#shared_merge_tree_max_parts_update_leaders_in_total\}

<SettingsInfoBlock type="UInt64" default_value="6" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

파트 업데이트 리더의 최대 수입니다. ClickHouse Cloud에서만 사용 가능합니다.

## shared_merge_tree_max_parts_update_leaders_per_az \{#shared_merge_tree_max_parts_update_leaders_per_az\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

파트 업데이트 리더 수의 최대값입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_max_replicas_for_parts_deletion \{#shared_merge_tree_max_replicas_for_parts_deletion\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

파트 삭제 작업(killer 스레드)에 참여하는 레플리카의 최대 개수입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range \{#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

잠재적으로 충돌할 수 있는 머지 작업을 할당하려고 시도하는 레플리카의 최대 개수입니다(머지 할당 시 불필요한 충돌을 피하는 데 도움이 됩니다). 값이 0이면 비활성화됨을 의미합니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_max_suspicious_broken_parts \{#shared_merge_tree_max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT에 대해 허용되는 손상된 파트의 최대 개수입니다. 이 값을 초과하면 자동 detach를 수행하지 않습니다."}]}]}/>

SMT에 대해 허용되는 손상된 파트의 최대 개수입니다. 이 값을 초과하면 자동 detach를 수행하지 않습니다.

## shared_merge_tree_max_suspicious_broken_parts_bytes \{#shared_merge_tree_max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT에서 손상된 모든 파트의 최대 허용 크기입니다. 이 값을 초과하면 자동 detach를 수행하지 않습니다."}]}]}/>

SMT에서 손상된 모든 파트의 최대 허용 크기입니다. 이 값을 초과하면 자동 detach를 수행하지 않습니다.

## shared_merge_tree_memo_ids_remove_timeout_seconds \{#shared_merge_tree_memo_ids_remove_timeout_seconds\}

<SettingsInfoBlock type="Int64" default_value="1800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

INSERT 재시도 시 잘못된 동작을 방지하기 위해 insert memoization ID를 얼마나 오래 저장해 두는지 제어하는 설정입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_merge_coordinator_election_check_period_ms \{#shared_merge_tree_merge_coordinator_election_check_period_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

merge coordinator election 스레드 실행 간의 시간 간격을 지정합니다.

## shared_merge_tree_merge_coordinator_factor \{#shared_merge_tree_merge_coordinator_factor\}

<SettingsInfoBlock type="Float" default_value="1.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "Lower coordinator sleep time after load"}]}]}/>

코디네이터 스레드 지연 시간을 변경하는 계수

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms \{#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

merge coordinator가 최신 메타데이터를 가져오기 위해 ZooKeeper와 동기화하는 주기

## shared_merge_tree_merge_coordinator_max_merge_request_size \{#shared_merge_tree_merge_coordinator_max_merge_request_size\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

Coordinator가 한 번에 MergerMutator에 요청할 수 있는 merge 횟수입니다.

## shared_merge_tree_merge_coordinator_max_period_ms \{#shared_merge_tree_merge_coordinator_max_period_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

merge coordinator 스레드 실행 사이의 최대 시간

## shared_merge_tree_merge_coordinator_merges_prepare_count \{#shared_merge_tree_merge_coordinator_merges_prepare_count\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

코디네이터가 준비하여 워커에 분산해야 하는 머지 작업 항목의 개수입니다.

## shared_merge_tree_merge_coordinator_min_period_ms \{#shared_merge_tree_merge_coordinator_min_period_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

merge coordinator 스레드 실행 사이의 최소 시간

## shared_merge_tree_merge_worker_fast_timeout_ms \{#shared_merge_tree_merge_worker_fast_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

즉시 실행 작업 이후에 상태를 업데이트해야 할 때 merge worker 스레드가 사용하는 타임아웃 값입니다.

## shared_merge_tree_merge_worker_regular_timeout_ms \{#shared_merge_tree_merge_worker_regular_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

merge worker 스레드 실행 사이의 시간 간격

## shared_merge_tree_outdated_parts_group_size \{#shared_merge_tree_outdated_parts_group_size\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>

오래된 파트를 정리할 때 동일한 rendezvous 해시 그룹에 속하는 레플리카 수입니다.
ClickHouse Cloud에서만 사용 가능합니다.

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations \{#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations\}

<SettingsInfoBlock type="Float" default_value="0.5" />

`<뮤테이션 전용 후보 파티션(병합될 수 없는 파티션)>/<뮤테이션 후보 파티션>` 비율이 이 설정값보다 클 때, merge/mutate에서 파티션을 선택하는 작업에서 merge predicate를 다시 로드합니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_parts_load_batch_size \{#shared_merge_tree_parts_load_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="32" />

한 번에 스케줄하는 fetch 파트(parts) 메타데이터 작업의 개수입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

로컬에서 머지된 파트를 포함하는 새로운 머지를 시작하지 않고 이 파트를 보존하는 시간입니다.  
다른 레플리카가 이 파트를 페치(fetch)하여 해당 머지를 시작할 수 있도록 시간적 여유를 제공합니다.  
ClickHouse Cloud에서만 사용 가능합니다.

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

로컬에서 머지한 직후 다음 머지 작업을 바로 할당하는 것을 연기하기 위한 파트의 최소 크기(행 기준)입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_range_for_merge_window_size \{#shared_merge_tree_range_for_merge_window_size\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

이 파트를 포함하는 새 머지를 시작하지 않은 채, 로컬에서 머지된 파트를 유지하는 시간입니다.  
다른 레플리카가 해당 파트를 가져와 이 머지를 시작할 수 있는 기회를 제공합니다.  
ClickHouse Cloud에서만 지원됩니다.

## shared_merge_tree_read_virtual_parts_from_leader \{#shared_merge_tree_read_virtual_parts_from_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

가능한 경우 리더에서 가상 파트를 읽도록 합니다. ClickHouse
Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas \{#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "다른 레플리카에서 메모리 상의 파트 데이터를 가져오기 위한 새로운 설정"}]}]}/>

이 설정을 활성화하면 모든 레플리카가 해당 데이터가 이미 존재하는 다른 레플리카로부터 메모리 상의 파트 데이터(기본 키, 파티션 정보 등)를 가져오도록 시도합니다.

## shared_merge_tree_update_replica_flags_delay_ms \{#shared_merge_tree_update_replica_flags_delay_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

백그라운드 스케줄에 따라 레플리카가 플래그를 다시 로드하려고 시도하는 간격입니다.

## shared_merge_tree_use_metadata_hints_cache \{#shared_merge_tree_use_metadata_hints_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

다른 레플리카의 메모리 내 캐시에서 FS 캐시 힌트를 요청할 수 있도록 활성화합니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_use_outdated_parts_compact_format \{#shared_merge_tree_use_outdated_parts_compact_format\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "기본적으로 outdated parts v3 사용 활성화"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 동기화"}]}]}/>

오래된 파트에 compact 형식을 사용합니다. Keeper에 대한 부하를 줄이고, 오래된 파트 처리 성능을 향상시킵니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts \{#shared_merge_tree_use_too_many_parts_count_from_virtual_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

이 설정을 활성화하면 too many parts 카운터가 로컬 레플리카 상태가 아니라 Keeper에 있는 공유 데이터를 기준으로 동작합니다. ClickHouse Cloud에서만 사용할 수 있습니다

## shared_merge_tree_virtual_parts_discovery_batch \{#shared_merge_tree_virtual_parts_discovery_batch\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

배치당 묶어서 처리할 파티션 검색 횟수입니다.

## simultaneous_parts_removal_limit \{#simultaneous_parts_removal_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

오래된 파트가 많이 존재하면 정리 스레드는 한 번의 반복(iteration) 동안 최대
`simultaneous_parts_removal_limit`개의 파트를 삭제하려고 시도합니다.
`simultaneous_parts_removal_limit`을 `0`으로 설정하면 제한이 없음을 의미합니다.

## sleep_before_commit_local_part_in_replicated_table_ms \{#sleep_before_commit_local_part_in_replicated_table_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

테스트용 설정입니다. 변경하지 마십시오.

## sleep_before_loading_outdated_parts_ms \{#sleep_before_loading_outdated_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

테스트용 설정입니다. 변경하지 마십시오.

## storage_policy \{#storage_policy\}

<SettingsInfoBlock type="String" default_value="default" />

스토리지 디스크 정책의 이름

## string_serialization_version \{#string_serialization_version\}

<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "Change to the newer format with separate sizes"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "New setting"}]}]}/>

최상위 `String` 컬럼의 직렬화 포맷을 제어합니다.

이 설정은 `serialization_info_version`이 "with_types"로 설정된 경우에만 적용됩니다.
`with_size_stream`으로 설정하면, 최상위 `String` 컬럼은 문자열 길이를 저장하는 별도의
`.size` 서브컬럼으로 직렬화되며, 길이가 인라인으로 저장되지 않습니다. 이를 통해 실제 `.size`
서브컬럼을 사용할 수 있으며, 압축 효율이 향상될 수 있습니다.

`Nullable`, `LowCardinality`, `Array`, `Map` 내부에 있는 등 중첩된 `String` 타입에는
`Tuple` 안에 등장하는 경우를 제외하고는 영향을 주지 않습니다.

가능한 값은 다음과 같습니다.

- `single_stream` — 길이를 인라인으로 포함하는 표준 직렬화 포맷을 사용합니다.
- `with_size_stream` — 최상위 `String` 컬럼에 대해 별도의 size 스트림을 사용합니다.

## table_disk \{#table_disk\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

이 설정은 테이블 디스크를 지정하며, 경로/엔드포인트는 데이터베이스 데이터가 아니라 테이블 데이터가 저장된 위치를 가리켜야 합니다. `s3_plain`/`s3_plain_rewritable`/`web`에 대해서만 설정할 수 있습니다.

## temporary_directories_lifetime \{#temporary_directories_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

tmp_-디렉터리를 몇 초 동안 유지할지 지정하는 설정입니다. 이 설정 값을 낮추지 않아야 합니다. 값이 너무 낮으면 머지(merge)와 뮤테이션이 제대로 작동하지 않을 수 있습니다.

## try_fetch_recompressed_part_timeout \{#try_fetch_recompressed_part_timeout\}

<SettingsInfoBlock type="Seconds" default_value="7200" />

재압축이 포함된 머지 작업을 시작하기 전까지의 대기 시간(초)입니다. 이 시간 동안 ClickHouse는 해당 재압축 머지 작업이 할당된 레플리카에서 재압축된 파트를 가져오려고 시도합니다.

대부분의 경우 재압축은 느리게 동작하므로, 이 타임아웃이 지나기 전에는 재압축이 포함된 머지 작업을 시작하지 않고, 해당 재압축 머지 작업이 할당된 레플리카에서 재압축된 파트를 가져오려고 시도합니다.

가능한 값:

- 임의의 양의 정수.

## ttl_only_drop_parts \{#ttl_only_drop_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

MergeTree 테이블에서 해당 파트의 모든 행이 `TTL` 설정에 따라 만료되었을 때
데이터 파트를 완전히 삭제(drop)할지 여부를 제어합니다.

`ttl_only_drop_parts`가 비활성화되어 있을 때(기본값), `TTL` 설정에 따라
만료된 행만 제거됩니다.

`ttl_only_drop_parts`가 활성화되어 있으면, 해당 파트의 모든 행이
`TTL` 설정에 따라 만료된 경우 파트 전체가 삭제됩니다.

## use_adaptive_write_buffer_for_dynamic_subcolumns \{#use_adaptive_write_buffer_for_dynamic_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="1" />

동적 서브컬럼을 기록할 때 adaptive write buffer를 사용하여 메모리 사용량을 줄일 수 있도록 허용합니다

## use_async_block_ids_cache \{#use_async_block_ids_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

`true`이면 비동기 insert의 해시값을 캐시합니다.

가능한 값:

- `true`
- `false`

여러 개의 비동기 insert를 포함하는 블록은 여러 개의 해시값을 생성합니다.
일부 insert가 중복되는 경우, Keeper는 하나의 RPC에서 하나의 중복된 해시값만 반환하여 불필요한 RPC 재시도를 유발할 수 있습니다.
이 캐시는 Keeper에서 해시값 경로를 감시합니다. Keeper에서 업데이트가 감지되면 캐시는 가능한 한 빨리 갱신되어, 메모리에서 중복 insert를 필터링할 수 있게 됩니다.

## use_compact_variant_discriminators_serialization \{#use_compact_variant_discriminators_serialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

Variant 데이터 타입에서 구분자(discriminator)의 이진 직렬화를 위한 compact 모드를 활성화합니다.
이 모드를 사용하면 단일 variant가 주로 사용되거나 NULL 값이 매우 많은 경우,
구분자를 파트에 저장하는 데 사용하는 메모리를 크게 줄일 수 있습니다.

## use_const_adaptive_granularity \{#use_const_adaptive_granularity\}

<SettingsInfoBlock type="Bool" default_value="0" />

전체 파트에 대해 항상 고정된 granularity를 사용합니다. 이렇게 하면 인덱스 granularity 값을 메모리에서 압축할 수 있습니다. 컬럼 수가 적은 테이블에 대한 매우 큰 워크로드에서 유용할 수 있습니다.

## use_metadata_cache \{#use_metadata_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

더 이상 사용되지 않는 설정이며, 어떤 동작도 수행하지 않습니다.

## use_minimalistic_checksums_in_zookeeper \{#use_minimalistic_checksums_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper에서 파트 체크섬에 일반 형식(수십 KB) 대신 작은 형식(수십 바이트)을 사용합니다. 이 설정을 활성화하기 전에 모든 레플리카가 새로운 형식을 지원하는지 확인하십시오.

## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper에서 데이터 파트 헤더를 저장하는 방식입니다. 이 설정을 활성화하면 ZooKeeper에 저장되는 데이터 양이 줄어듭니다. 자세한 내용은 [여기](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)를 참고하십시오.

## use_primary_key_cache \{#use_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "새로운 설정"}]}]}/>

기본 인덱스를 캐시에 저장하여 모든 인덱스를 메모리에 보관하지 않도록 합니다. 매우 큰 테이블에서 유용할 수 있습니다.

## vertical_merge_algorithm_min_bytes_to_activate \{#vertical_merge_algorithm_min_bytes_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="0" />

수직 병합 알고리즘을 활성화하기 위해 병합되는 파트의 비압축 데이터가 가져야 하는 최소(대략적인) 크기(바이트 단위)입니다.

## vertical_merge_algorithm_min_columns_to_activate \{#vertical_merge_algorithm_min_columns_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="11" />

수직 병합 알고리즘을 활성화하는 데 필요한 PK가 아닌 컬럼의 최소 개수입니다.

## vertical_merge_algorithm_min_rows_to_activate \{#vertical_merge_algorithm_min_rows_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

수직 병합 알고리즘을 활성화하기 위해, 병합되는 파트들에 포함되어야 하는 행 수의 최소(대략적인) 합입니다.

## vertical_merge_optimize_lightweight_delete \{#vertical_merge_optimize_lightweight_delete\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

true인 경우 수직 병합 시 경량한 삭제가 최적화됩니다.

## vertical_merge_remote_filesystem_prefetch \{#vertical_merge_remote_filesystem_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

값이 `true`이면 머지(merge) 중에 다음 컬럼의 데이터를 원격 파일 시스템에서 미리 가져오기(prefetch)를 사용합니다.

## wait_for_unique_parts_send_before_shutdown_ms \{#wait_for_unique_parts_send_before_shutdown_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

종료 전에 테이블은 고유한 파트(현재 레플리카에만 존재하는 파트)를 다른 레플리카가 가져갈 수 있도록 지정된 시간 동안 대기합니다(0이면 비활성화됨).

## write_ahead_log_bytes_to_fsync \{#write_ahead_log_bytes_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

더 이상 사용되지 않는 설정이며, 아무 효과도 없습니다.

## write_ahead_log_interval_ms_to_fsync \{#write_ahead_log_interval_ms_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="100" />

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## write_ahead_log_max_bytes \{#write_ahead_log_max_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

더 이상 사용되지 않는 설정으로, 아무 동작도 하지 않습니다.

## write_final_mark \{#write_final_mark\}

<SettingsInfoBlock type="Bool" default_value="1" />

더 이상 사용되지 않는 설정으로, 아무 작업도 수행하지 않습니다.

## write_marks_for_substreams_in_compact_parts \{#write_marks_for_substreams_in_compact_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "기본값으로 Compact 파트에서 서브스트림 마크 쓰기 활성화"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "새로운 설정"}]}]}/>

Compact 파트에서 각 컬럼이 아니라 각 서브스트림마다 마크를 쓰도록 활성화합니다.
이를 통해 데이터 파트에서 개별 서브컬럼을 효율적으로 읽을 수 있습니다.

예를 들어 컬럼 `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` 는 다음 서브스트림들로 직렬화됩니다:

- 튜플 요소 `a`의 String 데이터에 대한 `t.a`
- 튜플 요소 `b`의 UInt32 데이터에 대한 `t.b`
- 튜플 요소 `c`의 배열 크기에 대한 `t.c.size0`
- 튜플 요소 `c`의 중첩 배열 요소에 대한 널 맵(null map)에 대한 `t.c.null`
- 튜플 요소 `c`의 중첩 배열 요소에 대한 UInt32 데이터에 대한 `t.c`

이 설정이 활성화되면 이 5개의 서브스트림 각각에 대해 마크를 기록하며,
이는 필요한 경우 그래뉼(granule)에서 각 개별 서브스트림의 데이터를 분리하여 읽을 수 있음을 의미합니다.
예를 들어 서브컬럼 `t.c`를 읽고자 하는 경우, `t.c.size0`, `t.c.null`, `t.c` 서브스트림의 데이터만 읽고
`t.a`와 `t.b` 서브스트림의 데이터는 읽지 않습니다. 이 설정이 비활성화된 경우,
상위 수준 컬럼 `t`에 대해서만 마크를 기록하며, 이는 일부 서브스트림 데이터만 필요하더라도
항상 그래뉼로부터 전체 컬럼 데이터를 읽게 됨을 의미합니다.

## zero_copy_concurrent_part_removal_max_postpone_ratio \{#zero_copy_concurrent_part_removal_max_postpone_ratio\}

<SettingsInfoBlock type="Float" default_value="0.05" />

더 작은 독립적인 범위를 얻기 위해 제거를 연기할 수 있는 최상위 레벨 파트의 최대 비율입니다. 이 설정은 변경하지 않는 것을 권장합니다.

## zero_copy_concurrent_part_removal_max_split_times \{#zero_copy_concurrent_part_removal_max_split_times\}

<SettingsInfoBlock type="UInt64" default_value="5" />

독립적인 Outdated 파트 범위를 더 작은 하위 범위로 분할할 때 허용되는 최대 재귀 깊이입니다. 변경하지 않는 것이 좋습니다.

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

zero copy 복제가 활성화된 경우, 머지(merge) 또는 뮤테이션(mutation)을 위해 파트 크기에 따라 잠금을 시도하기 전에 임의의 시간 동안 대기합니다.

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "새 설정"}]}]}/>

zero-copy 복제가 활성화된 경우 merge 또는 mutation에 대한 락을 획득하기 전에 최대 500ms까지 임의의 시간 동안 대기합니다.

## zookeeper_session_expiration_check_period \{#zookeeper_session_expiration_check_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper 세션 만료를 확인하는 주기(초 단위)입니다.

가능한 값:

- 임의의 양의 정수.