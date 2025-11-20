---
'description': '이 섹션은 세션 또는 쿼리 수준에서 변경할 수 없는 서버 설정에 대한 설명을 포함합니다.'
'keywords':
- 'global server settings'
'sidebar_label': '서버 설정'
'sidebar_position': 57
'slug': '/operations/server-configuration-parameters/settings'
'title': '서버 설정'
'doc_type': 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# 서버 설정

이 섹션에는 서버 설정에 대한 설명이 포함되어 있습니다. 이 설정은 세션 또는 쿼리 수준에서 변경할 수 없습니다.

ClickHouse에서 구성 파일에 대한 자세한 정보는 [""구성 파일""](/operations/configuration-files)를 참조하십시오.

다른 설정은 ""[설정](/operations/settings/overview)"" 섹션에 설명되어 있습니다.
설정을 공부하기 전에, [구성 파일](/operations/configuration-files) 섹션을 읽고 대체(str) 속성 사용을 주의하시기 바랍니다.

## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />LOGICAL_ERROR 예외가 발생하면 서버를 중단합니다. 전문가만 사용할 수 있습니다.
## access_control_improvements {#access_control_improvements} 

액세스 제어 시스템의 선택적 개선에 대한 설정입니다.

| 설정                                         | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 기본값 |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`      | 허용된 행 정책이 없는 사용자가 `SELECT` 쿼리를 사용하여 여전히 행을 읽을 수 있는지 설정합니다. 예를 들어, 사용자 A와 B가 있고 행 정책이 A에만 정의된 경우, 이 설정이 true이면 사용자 B는 모든 행을 볼 수 있습니다. 이 설정이 false이면 사용자 B는 행을 볼 수 없습니다.                                                                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` 쿼리에 `CLUSTER` 권한이 필요인지 설정합니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>` 쿼리를 실행하기 위해 권한이 필요한지 설정합니다. true로 설정하면 이 쿼리는 `GRANT SELECT ON system.<table>`, 비시스템 테이블과 마찬가지로 필요합니다. 예외: 몇 가지 시스템 테이블(`tables`, `columns`, `databases`, , `one`, `contributors`와 같은 상수 테이블)은 모두에게 접근 가능하고, `SHOW` 권한(예: `SHOW USERS`)이 부여되면 해당 시스템 테이블(`system.users`)에 접근할 수 있습니다. | `true`  |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>` 쿼리를 실행하기 위해 권한이 필요한지 설정합니다. true로 설정하면 이 쿼리는 `GRANT SELECT ON information_schema.<table>`를 필요로 합니다.                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | 일부 설정에 대한 설정 프로필의 제약 조건이 이전 제약 조건(다른 프로필에 정의됨)의 동작을 취소할지 여부를 설정합니다. 새 제약 조건에 의해 설정되지 않은 필드도 포함됩니다. 이 설정은 또한 `changeable_in_readonly` 제약 조건 유형을 활성화합니다.                                                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`                   | 특정 테이블 엔진으로 테이블을 생성하는 데 권한이 필요한지 설정합니다.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | 역할이 역할 캐시에 저장된 후 마지막 접근부터의 시간을 초 단위로 설정합니다.                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

예시:

```xml
<access_control_improvements>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```
## access_control_path {#access_control_path} 

ClickHouse 서버가 SQL 명령으로 생성된 사용자 및 역할 구성 정보를 저장하는 폴더의 경로입니다.

**참조**

- [액세스 제어 및 계정 관리](/operations/access-rights#access-control-usage)
## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />groupArray에서 최대 배열 요소 크기를 초과할 때 실행할 작업: `throw` 예외 또는 `discard` 추가 값
## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 함수의 최대 배열 요소 크기(바이트). 이 제한은 직렬화 시 검증되며 큰 상태 크기를 피하는 데 도움이 됩니다.
## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />
사용자가 다양한 기능 계층 관련 설정을 변경할 수 있는지 제어합니다.

- `0` - 모든 설정 변경이 허용됩니다(실험적, 베타, 생산).
- `1` - 베타 및 생산 기능 설정만 변경할 수 있습니다. 실험적 설정의 변경은 거부됩니다.
- `2` - 생산 설정만 변경할 수 있습니다. 실험적 또는 베타 설정의 변경은 거부됩니다.

이는 모든 `EXPERIMENTAL` / `BETA` 기능에 대한 읽기 전용 제약 조건을 설정하는 것과 같습니다.

:::note
값이 `0`인 경우 모든 설정이 변경될 수 있음을 의미합니다.
:::
## allow_impersonate_user {#allow_impersonate_user} 

<SettingsInfoBlock type="Bool" default_value="0" />IMPERSONATE 기능을 활성화/비활성화합니다(EXECUTE AS target_user).
## allow_implicit_no_password {#allow_implicit_no_password} 

명시적으로 'IDENTIFIED WITH no_password'가 지정되지 않는 한 비밀번호가 없는 사용자를 생성할 수 없습니다.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## allow_no_password {#allow_no_password} 

비밀번호가 없는 안전하지 않은 비밀번호 유형을 허용하는지 설정합니다.

```xml
<allow_no_password>1</allow_no_password>
```
## allow_plaintext_password {#allow_plaintext_password} 

평문 비밀번호 유형(안전하지 않음)을 허용하는지 설정합니다.

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc 메모리를 사용할 수 있도록 허용합니다.
## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Iceberg와 함께 사용할 수 있는 디스크 목록
## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />참일 경우 비동기 삽입 큐가 정상적으로 종료될 때 플러시됩니다.
## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />백그라운드에서 데이터를 실제로 구문 분석하고 삽입할 최대 스레드 수입니다. 0은 비동기 모드가 비활성화됨을 의미합니다.
## async_load_databases {#async_load_databases} 

<SettingsInfoBlock type="Bool" default_value="1" /> 
데이터베이스와 테이블을 비동기적으로 로드합니다.

- `true`이면 ClickHouse 서버 시작 후 `Ordinary`, `Atomic`, 및 `Replicated` 엔진이 있는 모든 비시스템 데이터베이스가 비동기적으로 로드됩니다. `system.asynchronous_loader` 테이블, `tables_loader_background_pool_size`, 및 `tables_loader_foreground_pool_size` 서버 설정을 참조하십시오. 테이블에 접근하려는 쿼리는 해당 테이블이 시작될 때까지 대기합니다. 로드 작업이 실패할 경우, 쿼리는 오류를 다시 발생시킵니다(비동기 로드가 비활성화된 경우 서버 전체가 종료되는 대신). 최소 하나의 쿼리가 기다리는 테이블은 높은 우선 순위로 로드됩니다. 데이터베이스에 대한 DDL 쿼리는 해당 데이터베이스가 시작될 때까지 대기합니다. 대기 쿼리의 총 수를 제한하기 위해 `max_waiting_queries` 설정을 고려하십시오.
- `false`이면 서버가 시작될 때 모든 데이터베이스가 로드됩니다.

**예시**

```xml
<async_load_databases>true</async_load_databases>
```
## async_load_system_database {#async_load_system_database} 

<SettingsInfoBlock type="Bool" default_value="0" />
시스템 테이블을 비동기적으로 로드합니다. 시스템 데이터베이스의 로그 테이블과 파트가 많을 경우 유용하게 사용할 수 있습니다. `async_load_databases` 설정과는 독립적입니다.

- `true`로 설정하면 ClickHouse 서버 시작 후 `Ordinary`, `Atomic`, 및 `Replicated` 엔진이 있는 모든 시스템 데이터베이스가 비동기적으로 로드됩니다. `system.asynchronous_loader` 테이블, `tables_loader_background_pool_size`, 및 `tables_loader_foreground_pool_size` 서버 설정을 참조하십시오. 시스템 테이블에 접근하려는 쿼리는 해당 테이블이 시작될 때까지 대기합니다. 최소 하나의 쿼리가 기다리는 테이블은 높은 우선 순위로 로드됩니다. 대기 쿼리의 총 수를 제한하기 위해 `max_waiting_queries` 설정을 고려하십시오.
- `false`로 설정하면 서버 시작 전에 시스템 데이터베이스가 로드됩니다.

**예시**

```xml
<async_load_system_database>true</async_load_system_database>
```
## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />무거운 비동기 메트릭 업데이트를 위한 주기(초 단위).
## asynchronous_insert_log {#asynchronous_insert_log} 

비동기 삽입을 기록하기 위한 [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters/>

**예시**

```xml
<clickhouse>
    <asynchronous_insert_log>
        <database>system</database>
        <table>asynchronous_insert_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </asynchronous_insert_log>
</clickhouse>
```
## asynchronous_metric_log {#asynchronous_metric_log} 

ClickHouse Cloud 배포에서 기본적으로 활성화되어 있습니다.

귀하의 환경에서 기본적으로 설정이 활성화되어 있지 않다면, ClickHouse 설치 방법에 따라 이를 활성화하거나 비활성화하기 위해 아래 지침을 따를 수 있습니다.

**활성화**

비동기 메트릭 로그 이력 수집을 수동으로 활성화하려면 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md) 파일을 생성하고 다음 내용을 추가합니다:

```xml
<clickhouse>
     <asynchronous_metric_log>
        <database>system</database>
        <table>asynchronous_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </asynchronous_metric_log>
</clickhouse>
```

**비활성화**

`asynchronous_metric_log` 설정을 비활성화하려면, 다음 내용을 포함하는 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` 파일을 생성합니다:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />무거운 비동기 메트릭 계산을 활성화합니다.
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />비동기 메트릭 업데이트를 위한 주기(초 단위).
## auth_use_forwarded_address {#auth_use_forwarded_address} 

프록스를 통해 연결된 클라이언트에 대해 인증용 원본 주소를 사용합니다.

:::note
이 설정은 전달된 주소가 쉽게 변조될 수 있으므로 매우 주의해서 사용해야 합니다 - 이와 같은 인증을 수용하는 서버에는 직접 접근하지 않고 신뢰할 수 있는 프록스를 통해서만 접근해야 합니다.
:::
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />[버퍼 엔진 테이블](/engines/table-engines/special/buffer)에서 백그라운드로 플러시 작업을 수행하기 위해 사용할 스레드의 최대 수입니다.
## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />[*MergeTree 엔진](/engines/table-engines/mergetree-family) 테이블에서 다양한 작업(주로 가비지 수집)을 수행하기 위해 사용할 스레드의 최대 수입니다.
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />분산 전송을 실행하기 위해 사용할 스레드의 최대 수입니다.
## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />[*MergeTree 엔진](/engines/table-engines/mergetree-family) 테이블에 대해 다른 복제본에서 데이터 파트를 가져오는 데 사용할 스레드의 최대 수입니다.
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />동시 실행할 수 있는 백그라운드 병합 및 변형의 스레드 수와의 비율을 설정합니다.

예를 들어, 비율이 2이고 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size)가 16으로 설정되면 ClickHouse는 32개의 백그라운드 병합을 동시에 실행할 수 있습니다. 이는 백그라운드 작업이 일시 중지되고 연기될 수 있기 때문입니다. 이는 작은 병합이 더 높은 실행 우선 순위를 가질 수 있도록 필요합니다.

:::note
이 비율은 런타임에서만 높일 수 있습니다. 낮추려면 서버를 재시작해야 합니다.

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 설정에 대해서도 [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) 설정은 하위 호환성을 위해 `default` 프로필에서 적용될 수 있습니다.
:::
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />백그라운드 병합 및 변형을 수행하는 정책입니다. 가능한 값: `round_robin` 및 `shortest_task_first`.

백그라운드 스레드 풀에 의해 실행될 다음 병합 또는 변형을 선택하는 데 사용되는 알고리즘입니다. 정책은 서버를 재시작하지 않고 런타임에서 변경될 수 있습니다. 하위 호환성을 위해 `default` 프로필에서 적용될 수 있습니다.

가능한 값:

- `round_robin` — 모든 동시 병합 및 변형이 라운드로빈 순서로 실행되어 기아 없는 작업을 보장합니다. 더 작은 병합 작업은 더 많은 블록을 병합해야 하는 큰 작업보다 더 빠르게 완료됩니다.
- `shortest_task_first` — 항상 더 작은 병합 또는 변형을 실행합니다. 병합 및 변형은 결과 크기를 기준으로 우선 순위가 할당됩니다. 더 작은 크기의 병합이 더 큰 크기에 대해 엄격하게 선호됩니다. 이 정책은 작은 부분의 가장 빠른 병합을 보장하지만 `INSERT`가 많이 포함된 파티션에서는 큰 병합의 기아를 무한정 발생시킬 수 있습니다.
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />메시지 스트리밍을 위한 백그라운드 작업을 실행하기 위해 사용할 스레드의 최대 수입니다.
## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />백그라운드에서 다른 디스크 또는 볼륨으로 데이터 파트를 이동하는 데 사용할 스레드의 최대 수입니다( *MergeTree 엔진 테이블의 경우).
## background_pool_size {#background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
MergeTree 엔진이 있는 테이블의 백그라운드 병합 및 변형을 수행하는 스레드 수를 설정합니다.

:::note
- 이 설정은 ClickHouse 서버 시작 시 하위 호환성을 위해 `default` 프로필 구성에서 적용될 수 있습니다.
- 런타임에서만 스레드 수를 늘릴 수 있습니다.
- 스레드 수를 줄이려면 서버를 재시작해야 합니다.
- 이 설정을 조정하면 CPU 및 디스크 부하를 관리하게 됩니다.
:::

:::danger
작은 풀 크기는 CPU와 디스크 리소스를 덜 사용하지만, 백그라운드 프로세스가 느리게 진행되어 결국 쿼리 성능에 영향을 줄 수 있습니다.
:::

변경하기 전에 다음 MergeTree 관련 설정도 확인해 보시기 바랍니다:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
- [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**예시**

```xml
<background_pool_size>16</background_pool_size>
```
## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />동일한 유형의 작업을 동시에 실행할 수 있는 풀 내 스레드의 최대 비율입니다.
## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />복제된 테이블, Kafka 스트리밍 및 DNS 캐시 업데이트를 위한 경량 주기 작업을 지속적으로 실행하는 데 사용할 최대 스레드 수입니다.
## backup_log {#backup_log} 

`BACKUP` 및 `RESTORE` 작업을 기록하기 위한 [backup_log](../../operations/system-tables/backup_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters/>

**예시**

```xml
<clickhouse>
    <backup_log>
        <database>system</database>
        <table>backup_log</table>
        <flush_interval_milliseconds>1000</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </backup_log>
</clickhouse>
```
## backup_threads {#backup_threads} 

`BACKUP` 요청을 실행하기 위한 최대 스레드 수입니다.
## backups {#backups} 

[`BACKUP` 및 `RESTORE`](../backup.md) 문을 실행할 때 사용되는 백업에 대한 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

<!-- SQL
WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','동일한 호스트에서 여러 백업 작업이 동시에 실행할 수 있는지를 결정합니다.', 'true'),
    ('allow_concurrent_restores', 'Bool', '동일한 호스트에서 여러 복원 작업이 동시에 실행할 수 있는지를 결정합니다.', 'true'),
    ('allowed_disk', 'String', '`File()`을 사용할 때 백업할 디스크입니다. 이 설정은 `File`을 사용하기 위해 설정해야 합니다.', ''),
    ('allowed_path', 'String', '`File()`을 사용할 때 백업할 경로입니다. 이 설정은 `File`을 사용하기 위해 설정해야 합니다.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '수집된 메타데이터 비교 후 불일치가 발생할 경우 잠전 메타데이터 수집 시도 횟수입니다.', '2'),
    ('collect_metadata_timeout', 'UInt64', '백업 중 메타데이터 수집을 위한 타임아웃(밀리초)입니다.', '600000'),
    ('compare_collected_metadata', 'Bool', 'true인 경우 수집된 메타데이터와 기존 메타데이터를 비교하여 백업 중 변경되지 않았음을 보장합니다.', 'true'),
    ('create_table_timeout', 'UInt64', '복원 중 테이블 생성을 위한 타임아웃(밀리초)입니다.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '조정된 백업/복원 중 잘못된 버전 오류가 발생했을 때 재시도할 최대 시도 횟수입니다.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '메타데이터 수집 시도 전 최대 대기 시간(밀리초)입니다.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '메타데이터 수집 시도 전 최소 대기 시간(밀리초)입니다.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '`BACKUP` 명령이 실패하면 ClickHouse는 이전에 백업된 파일을 제거하려고 시도하며, 그렇지 않으면 파일을 그대로 둡니다.', 'true'),
    ('sync_period_ms', 'UInt64', '조정된 백업/복원을 위한 동기화 주기(밀리초)입니다.', '5000'),
    ('test_inject_sleep', 'Bool', '테스트 관련 대기', 'false'),
    ('test_randomize_order', 'Bool', 'true인 경우 테스트를 위해 특정 작업의 순서를 무작위로 섞습니다.', 'false'),
    ('zookeeper_path', 'String', '`ON CLUSTER` 절을 사용할 때 백업 및 복원 메타데이터가 저장될 ZooKeeper의 경로입니다.', '/clickhouse/backups')
  ]) AS t )
SELECT concat('`', t.1, '`') AS 설정, t.2 AS 유형, t.3 AS 설명, concat('`', t.4, '`') AS 기본값 FROM settings FORMAT Markdown
-->
| 설정 | 유형 | 설명 | 기본값 |
|:-|:-|:-|:-|
| `allow_concurrent_backups` | Bool | 동일한 호스트에서 여러 백업 작업이 동시에 실행할 수 있는지를 결정합니다. | `true` |
| `allow_concurrent_restores` | Bool | 동일한 호스트에서 여러 복원 작업이 동시에 실행할 수 있는지를 결정합니다. | `true` |
| `allowed_disk` | String | `File()`을 사용할 때 백업할 디스크입니다. 이 설정은 `File`을 사용하기 위해 설정해야 합니다. | `` |
| `allowed_path` | String | `File()`을 사용할 때 백업할 경로입니다. 이 설정은 `File`을 사용하기 위해 설정해야 합니다. | `` |
| `attempts_to_collect_metadata_before_sleep` | UInt | 수집된 메타데이터 비교 후 불일치가 발생할 경우 잠전 메타데이터 수집 시도 횟수입니다. | `2` |
| `collect_metadata_timeout` | UInt64 | 백업 중 메타데이터 수집을 위한 타임아웃(밀리초)입니다. | `600000` |
| `compare_collected_metadata` | Bool | true인 경우 수집된 메타데이터와 기존 메타데이터를 비교하여 백업 중 변경되지 않았음을 보장합니다. | `true` |
| `create_table_timeout` | UInt64 | 복원 중 테이블 생성을 위한 타임아웃(밀리초)입니다. | `300000` |
| `max_attempts_after_bad_version` | UInt64 | 조정된 백업/복원 중 잘못된 버전 오류가 발생했을 때 재시도할 최대 시도 횟수입니다. | `3` |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 메타데이터 수집 시도 전 최대 대기 시간(밀리초)입니다. | `100` |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 메타데이터 수집 시도 전 최소 대기 시간(밀리초)입니다. | `5000` |
| `remove_backup_files_after_failure` | Bool | `BACKUP` 명령이 실패하면 ClickHouse는 이전에 백업된 파일을 제거하려고 시도하며, 그렇지 않으면 파일을 그대로 둡니다. | `true` |
| `sync_period_ms` | UInt64 | 조정된 백업/복원을 위한 동기화 주기(밀리초)입니다. | `5000` |
| `test_inject_sleep` | Bool | 테스트 관련 대기 | `false` |
| `test_randomize_order` | Bool | true인 경우 테스트를 위해 특정 작업의 순서를 무작위로 섞습니다. | `false` |
| `zookeeper_path` | String | `ON CLUSTER` 절을 사용할 때 백업 및 복원 메타데이터가 저장될 ZooKeeper의 경로입니다. | `/clickhouse/backups` |

이 설정은 기본적으로 다음과 같이 구성되어 있습니다:

```xml
<backups>
    ....
</backups>
```
## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />백업 IO 스레드 풀에서 예약할 수 있는 작업의 최대 수입니다. 현재 S3 백업 로직으로 인해 이 큐는 무제한으로 유지하는 것이 좋습니다.

:::note
값이 `0`(기본값)인 경우 무제한을 의미합니다.
:::
## bcrypt_workfactor {#bcrypt_workfactor} 

[비밀번호 해시]를 위해 `bcrypt_password` 인증 유형의 작업 계수와 관련된 작업 계수. 작업 계수는 해시를 계산하고 비밀번호를 확인하는 데 필요한 계산 및 시간의 양을 정의합니다.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
빈번한 인증을 요구하는 응용 프로그램의 경우,
bcrypt의 높은 작업 계수로 인한 계산 오버헤드를 고려하여
대안 인증 방법을 고려하십시오.
:::
## blob_storage_log {#blob_storage_log} 

[`blob_storage_log`](../system-tables/blob_storage_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters/>

예시:

```xml
<blob_storage_log>
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval} 

내장된 딕셔너리를 다시 로드하기 전의 간격(초).
 
ClickHouse는 x 초마다 내장된 딕셔너리를 다시 로드합니다. 이는 서버를 재시작하지 않고도 딕셔너리를 "즉석에서" 편집할 수 있게 합니다.

**예시**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />캐시 크기를 RAM 최대 비율로 설정합니다. 낮은 메모리 시스템에서 캐시 크기를 줄일 수 있도록 합니다.
## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />테스트 목적으로.
## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />
서버의 최대 허용 메모리 소비가 cgroups의 해당 임계값으로 조정되는 간격(초).

cgroup 관찰기를 비활성화하려면 이 값을 `0`으로 설정하십시오.
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />[컴파일된 표현](../../operations/caches.md)에 대한 캐시 크기(요소 수)를 설정합니다.
## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />[컴파일된 표현](../../operations/caches.md)에 대한 캐시 크기(바이트)를 설정합니다.
## compression {#compression} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 엔진 테이블에 대한 데이터 압축 설정입니다.

:::note
시작한 지 얼마 되지 않은 ClickHouse의 경우 이 설정을 변경하지 않는 것이 좋습니다.
:::

**구성 템플릿**:

```xml
<compression>
    <case>
      <min_part_size>...</min_part_size>
      <min_part_size_ratio>...</min_part_size_ratio>
      <method>...</method>
      <level>...</level>
    </case>
    ...
</compression>
```

**`<case>` 필드**:

- `min_part_size` – 데이터 파트의 최소 크기.
- `min_part_size_ratio` – 테이블 크기에 대한 데이터 파트 크기의 비율.
- `method` – 압축 방법. 허용되는 값: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`.
- `level` – 압축 수준. [코덱](/sql-reference/statements/create/table#general-purpose-codecs)을 참조하십시오.

:::note
여러 개의 `<case>` 섹션을 구성할 수 있습니다.
:::

**조건이 충족된 경우 작업**:

- 데이터 파트가 설정된 조건과 일치하는 경우, ClickHouse는 지정된 압축 방법을 사용합니다.
- 데이터 파트가 여러 조건 집합과 일치하는 경우, ClickHouse는 첫 번째로 일치하는 조건 집합을 사용합니다.

:::note
데이터 파트에 대한 조건이 충족되지 않으면 ClickHouse는 `lz4` 압축을 사용합니다.
:::

**예시**

```xml
<compression incl="clickhouse_compression">
    <case>
        <min_part_size>10000000000</min_part_size>
        <min_part_size_ratio>0.01</min_part_size_ratio>
        <method>zstd</method>
        <level>1</level>
    </case>
</compression>
```
## concurrent_threads_scheduler {#concurrent_threads_scheduler} 

<SettingsInfoBlock type="String" default_value="fair_round_robin" />
`concurrent_threads_soft_limit_num` 및 `concurrent_threads_soft_limit_ratio_to_cores`로 지정된 CPU 슬롯의 스케줄링을 수행하는 정책입니다. 동시 쿼리 간의 제한된 CPU 슬롯을 어떻게 분배할지를 결정하는 알고리즘입니다. 스케줄러는 서버를 재시작하지 않고 런타임에서 변경될 수 있습니다.

가능한 값:

- `round_robin` — `use_concurrency_control` = 1로 설정된 모든 쿼리가 최대 `max_threads`의 CPU 슬롯을 할당받습니다. 스레드마다 하나의 슬롯. 경쟁 상황에서 CPU 슬롯은 라운드 로빈 방식으로 쿼리에게 할당됩니다. 첫 번째 슬롯은 무조건 부여되며, 이는 불공정함과 높은 `max_threads`가 있는 쿼리의 대기 시간을 늘릴 수 있습니다.
- `fair_round_robin` — `use_concurrency_control` = 1로 설정된 모든 쿼리가 최대 `max_threads - 1`의 CPU 슬롯을 할당받습니다. 모든 쿼리의 첫 번째 스레드에 CPU 슬롯이 필요하지 않도록 설계된 `round_robin` 변형으로, 이를 통해 `max_threads` = 1인 쿼리는 슬롯이 필요하지 않으며 모든 슬롯을 불공정하게 할당받지 않게 됩니다. 무조건 슬롯이 부여되지 않습니다.
## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />
원격 서버에서 데이터를 검색하기 위한 스레드를 제외하고 실행할 수 있는 최대 쿼리 처리 스레드 수입니다. 이는 하드 제한이 아닙니다. 이 제한에 도달해도 쿼리는 여전히 최소한 하나의 스레드를 얻어 실행됩니다. 쿼리는 더 많은 스레드가 사용 가능해지면 실행 중에 원하는 수의 스레드로 확장될 수 있습니다.

:::note
값이 `0`(기본값)인 경우 무제한을 의미합니다.
:::
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />동일한 `concurrent_threads_soft_limit_num`과 동일하지만 코어 비율에 따라 달라집니다.
## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />ClickHouse가 구성 파일을 얼마나 자주 다시 로드하고 변경 사항을 확인하는지입니다.
## core_dump {#core_dump} 

코어 덤프 파일 크기에 대한 소프트 제한을 구성합니다.

:::note
하드 제한은 시스템 도구를 통해 구성됩니다.
:::

**예시**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## cpu_slot_preemption {#cpu_slot_preemption} 

<SettingsInfoBlock type="Bool" default_value="0" />
CPU 리소스(MASTER THREAD 및 WORKER THREAD)에 대한 작업 스케줄링이 어떻게 수행되는지를 정의합니다.

- `true`(권장)인 경우, 실제 사용된 CPU 시간에 따라 회계가 이루어집니다. 경쟁하는 작업에 대한 공정한 양의 CPU 시간이 할당됩니다. 슬롯은 한정된 시간 동안 할당되며 만료 후 다시 요청됩니다. CPU 리소스 과부하 시 슬롯 요청이 스레드 실행을 차단할 수 있으므로, 선점이 발생할 수 있습니다. 이는 CPU 시간의 공정성을 보장합니다.
- `false`(기본값)인 경우, 할당된 CPU 슬롯 수를 기준으로 회계가 이루어집니다. 경쟁하는 작업에 대한 공정한 양의 CPU 슬롯이 할당됩니다. 스레드가 시작되면 슬롯이 할당되고 지속적으로 유지되며 스레드 실행이 종료되면 해제됩니다. 쿼리 실행을 위해 할당된 스레드 수는 언제나 1에서 `max_threads`로 증가할 수 있으며 감소하지 않습니다. 이것은 장기 실행 쿼리에 더 유리하며 짧은 쿼리의 CPU 기아를 초래할 수 있습니다.

**예시**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**참고**
- [작업 스케줄링](/operations/workload-scheduling.md)
## cpu_slot_preemption_timeout_ms {#cpu_slot_preemption_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
비활성 상태에서 워커 스레드가 다른 CPU 슬롯을 받을 때까지 대기할 수 있는 밀리초 수를 정의합니다. 이 타임아웃 이후에 스레드가 새로운 CPU 슬롯을 획득하지 못하면 종료되며, 쿼리가 동적으로 동시에 실행되는 스레드 수를 낮추게 됩니다. 마스터 스레드는 다운스케일되지 않지만 무한정으로 선점될 수 있습니다. `cpu_slot_preemption`이 활성화되고 CPU 리소스가 WORKER THREAD에 정의될 때만 의미가 있습니다.

**예시**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**참고**
- [작업 부하 일정](/operations/workload-scheduling.md)
## cpu_slot_quantum_ns {#cpu_slot_quantum_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />
CPU 슬롯을 가져온 후 스레드가 소비할 수 있는 CPU 나노초 수를 정의합니다. 이는 `cpu_slot_preemption`이 활성화되고 CPU 리소스가 MASTER THREAD 또는 WORKER THREAD에 정의될 때만 의미가 있습니다.

**예시**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**참고**
- [작업 부하 일정](/operations/workload-scheduling.md)
## crash_log {#crash_log} 

[crash_log](../../operations/system-tables/crash_log.md) 시스템 테이블 작업에 대한 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| 설정                                | 설명                                                                                                                                                   | 기본값              | 비고                                                                                                               |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|--------------------------------------------------------------------------------------------------------------------|
| `database`                         | 데이터베이스의 이름.                                                                                                                                   |                      |                                                                                                                    |
| `table`                            | 시스템 테이블의 이름.                                                                                                                                 |                      |                                                                                                                    |
| `engine`                           | 시스템 테이블을 위한 [MergeTree 엔진 정의](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table).      |                      | `partition_by` 또는 `order_by`가 정의된 경우 사용할 수 없습니다. 지정되지 않은 경우 기본적으로 `MergeTree`가 선택됩니다. |
| `partition_by`                     | 시스템 테이블을 위한 [사용자 정의 파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key.md).                              |                      | 시스템 테이블을 위한 엔진이 지정된 경우 `partition_by` 매개변수는 'engine' 내에서 직접 지정해야 합니다.        |
| `ttl`                              | 테이블 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)을 지정합니다.                                              |                      | 시스템 테이블을 위한 엔진이 지정된 경우 `ttl` 매개변수는 'engine' 내에서 직접 지정해야 합니다.                  |
| `order_by`                         | 시스템 테이블에 대한 [사용자 정의 정렬 키](/engines/table-engines/mergetree-family/mergetree#order_by). 엔진이 정의된 경우 사용할 수 없습니다. |                      | 시스템 테이블에 대한 엔진이 지정된 경우 `order_by` 매개변수는 'engine' 내에서 직접 지정해야 합니다.          |
| `storage_policy`                   | 테이블에 사용할 저장소 정책의 이름 (선택 사항).                                                                                                         |                      | 시스템 테이블을 위한 엔진이 지정된 경우 `storage_policy` 매개변수는 'engine' 내에서 직접 지정해야 합니다.     |
| `settings`                         | MergeTree의 동작을 제어하는 [추가 매개변수](/engines/table-engines/mergetree-family/mergetree/#settings) (선택 사항).                               |                      | 시스템 테이블을 위한 엔진이 지정된 경우 `settings` 매개변수는 'engine' 내에서 직접 지정해야 합니다.           |
| `flush_interval_milliseconds`      | 메모리의 버퍼에서 테이블로 데이터를 플러시하는 간격.                                                                                                    | `7500`               |                                                                                                                    |
| `max_size_rows`                    | 로그의 최대 행 수. 비플러시 로그의 수가 max_size에 도달하면 로그가 디스크에 덤프됩니다.                                                                  | `1024`               |                                                                                                                    |
| `reserved_size_rows`               | 로그를 위한 미리 할당된 메모리 행 수.                                                                                                                  | `1024`               |                                                                                                                    |
| `buffer_size_rows_flush_threshold` | 행 수의 임계값. 임계값에 도달하면 로그를 백그라운드에서 디스크로 플러시합니다.                                                                          | `max_size_rows / 2`  |                                                                                                                    |
| `flush_on_crash`                   | 충돌 시 로그를 디스크에 덤프할지 여부를 설정합니다.                                                                                                    | `false`              |                                                                                                                    |

기본 서버 구성 파일 `config.xml`에는 다음 설정 섹션이 포함되어 있습니다:

```xml
<crash_log>
    <database>system</database>
    <table>crash_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1024</max_size_rows>
    <reserved_size_rows>1024</reserved_size_rows>
    <buffer_size_rows_flush_threshold>512</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</crash_log>
```
## custom_cached_disks_base_directory {#custom_cached_disks_base_directory} 

이 설정은 사용자 정의( SQL로 생성된) 캐시 디스크의 캐시 경로를 지정합니다.
`custom_cached_disks_base_directory`는 사용자 정의 디스크에 대해 `filesystem_caches_path`보다 우선합니다(이는 `filesystem_caches_path.xml`에 위치).
이 설정이 없으면 기본값으로 사용됩니다.
파일 시스템 캐시 설정 경로는 해당 디렉토리 내에 있어야 하며, 그렇지 않으면 디스크 생성이 방지되는 예외가 발생합니다.

:::note
이것은 서버가 업그레이드된 이전 버전에서 생성된 디스크에는 영향을 미치지 않습니다.
이 경우, 서버가 성공적으로 시작할 수 있도록 예외가 발생하지 않습니다.
:::

예시:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## custom_settings_prefixes {#custom_settings_prefixes} 

[사용자 정의 설정](/operations/settings/query-level#custom_settings)에 대한 접두어 목록. 접두사는 쉼표로 구분해야 합니다.

**예시**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**참고**
- [사용자 정의 설정](/operations/settings/query-level#custom_settings)
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />
삭제된 테이블을 [`UNDROP`](/sql-reference/statements/undrop.md) 문을 사용하여 복원할 수 있는 지연 시간. `DROP TABLE`이 `SYNC` 수정자와 함께 실행되는 경우 설정은 무시됩니다.
이 설정의 기본값은 `480` (8분)입니다.
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />테이블 삭제 실패 시, ClickHouse는 이 시간만큼 대기한 후 작업을 재시도합니다.
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />테이블 삭제에 사용되는 스레드풀의 크기입니다.
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
`store/` 디렉토리에서 가비지를 청소하는 작업의 매개변수입니다.
작업의 일정 간격을 설정합니다.

:::note
값이 `0`이면 "절대 하지 않음"을 의미합니다. 기본값은 1일에 해당합니다.
:::
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />
`store/` 디렉토리에서 가비지를 청소하는 작업의 매개변수입니다.
어떤 하위 디렉토리가 clickhouse-server에 의해 사용되지 않고, 마지막으로
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 초동안 수정되지 않은 경우 작업은 이 디렉토리를 "숨깁니다"
모든 접근 권한을 제거함으로써. 이는 clickhouse-server가 `store/` 내에서 보지 않기를 예상하는 디렉토리에도 작동합니다.

:::note
값이 `0`이면 "즉시"를 의미합니다.
:::
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />
`store/` 디렉토리에서 가비지를 청소하는 작업의 매개변수입니다.
어떤 하위 디렉토리가 clickhouse-server에 의해 사용되지 않고 이전에 "숨겨졌던"
(참조 [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec))
그리고 이 디렉토리가 마지막으로 수정된 이후
[`database_catalog_unused_dir_rm_timeout_sec`]/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 초동안 수정되지 않은 경우, 작업은 이 디렉토리를 제거합니다.
이는 clickhouse-server가 `store/` 내에서 보지 않기를 예상하는 디렉토리에도 작동합니다.

:::note
값이 `0`이면 "절대 하지 않음"을 의미합니다. 기본값은 30일에 해당합니다.
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />복제된 데이터베이스에서 테이블을 영구적으로 분리하는 것을 허용합니다.
## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />복제된 데이터베이스에서 예상치 못한 테이블을 드롭합니다. 별도의 로컬 데이터베이스로 이동하지 않습니다.
## dead_letter_queue {#dead_letter_queue} 

'dead_letter_queue' 시스템 테이블의 설정입니다.

<SystemLogParameters/>

기본 설정은 다음과 같습니다:

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```
## default_database {#default_database} 

<SettingsInfoBlock type="String" default_value="default" />기본 데이터베이스 이름입니다.
## default_password_type {#default_password_type} 

`CREATE USER u IDENTIFIED BY 'p'`와 같은 쿼리에 자동으로 설정할 비밀번호 유형을 설정합니다.

허용된 값은 다음과 같습니다:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## default_profile {#default_profile} 

기본 설정 프로파일. 설정 프로파일은 `user_config` 설정에 지정된 파일에 위치합니다.

**예시**

```xml
<default_profile>default</default_profile>
```
## default_replica_name {#default_replica_name} 

<SettingsInfoBlock type="String" default_value="{replica}" />
ZooKeeper의 복제본 이름입니다.

**예시**

```xml
<default_replica_name>{replica}</default_replica_name>
```
## default_replica_path {#default_replica_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />
ZooKeeper의 테이블 경로입니다.

**예시**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```
## default_session_timeout {#default_session_timeout} 

기본 세션 타임아웃(초)입니다.

```xml
<default_session_timeout>60</default_session_timeout>
```
## dictionaries_config {#dictionaries_config} 

딕셔너리를 위한 구성 파일의 경로입니다.

경로:

- 절대 경로 또는 서버 구성 파일과의 상대 경로를 지정합니다.
- 경로는 와일드카드 * 및 ?를 포함할 수 있습니다.

참조:
- "[딕셔너리](../../sql-reference/dictionaries/index.md)".

**예시**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load} 

<SettingsInfoBlock type="Bool" default_value="1" />
딕셔너 리의 지연 로드.

- `true`인 경우, 각 딕셔너리는 첫 번째 사용 시 로드됩니다. 로드에 실패하면 딕셔너리를 사용하는 함수가 예외를 발생시킵니다.
- `false`인 경우, 서버는 시작 시 모든 딕셔너리를 로드합니다.

:::note
서버는 시작 시 모든 딕셔너리가 로드할 때까지 대기한 후에 어떤 연결도 받지 않습니다
(예외: [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup)가 `false`로 설정된 경우).
:::

**예시**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />실패한 MySQL 및 Postgres 딕셔너리에 대한 재연결 시도 간격(밀리초)입니다. `background_reconnect`가 활성화된 경우에 해당합니다.
## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />
삽입/변경/삭제 쿼리를 비활성화합니다. 이 설정은 삽입 및 변경이 읽기 성능에 영향을 미치지 않도록 하기 위해 읽기 전용 노드를 필요로 할 경우 활성화됩니다. 외부 엔진(S3, DataLake, MySQL, PostgreSQL, Kafka 등)으로의 삽입은 이 설정에도 불구하고 허용됩니다.
## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />내부 DNS 캐시를 비활성화합니다. Kubernetes와 같은 빈번하게 변경되는 인프라에서 ClickHouse를 운영할 때 권장됩니다.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy} 

기본적으로, 터널링(즉, `HTTP CONNECT`)은 `HTTP` 프록시를 통해 `HTTPS` 요청을 만드는 데 사용됩니다. 이 설정을 사용하여 이를 비활성화할 수 있습니다.

**no_proxy**

기본적으로 모든 요청은 프록시를 통해 전달됩니다. 특정 호스트에 대한 프록시를 비활성화하려면 `no_proxy` 변수를 설정해야 합니다.
이 변수는 목록 및 원격 리졸버의 `<proxy>` 절 안에 설정할 수 있으며, 환경 리졸버에 대한 환경 변수로서 설정할 수 있습니다.
IP 주소, 도메인, 서브도메인 및 전체 우회에 대한 `'*'` 와일드카드를 지원합니다. 선행 점은 curl이 하는 것처럼 제거됩니다.

**예시**

다음 구성을 사용하면 `clickhouse.cloud` 및 그 모든 서브도메인(e.g., `auth.clickhouse.cloud`)에 대한 프록시 요청을 우회합니다.
이것은 GitLab에도 적용되지만, 점이 선행됩니다. `gitlab.com` 및 `about.gitlab.com` 모두 프록시를 우회합니다.

```xml
<proxy>
    <no_proxy>clickhouse.cloud,.gitlab.com</no_proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```
## disk_connections_soft_limit {#disk_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />이 limit을 초과하는 연결은 유효 기간이 현저히 짧습니다. 이 제한은 디스크 연결에 적용됩니다.
## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="30000" />이 limit을 초과하는 연결은 사용 후 재설정됩니다. 캐시를 끄려면 0으로 설정합니다. 이 제한은 디스크 연결에 적용됩니다.
## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />사용 중인 연결 수가 이 limit을 초과할 경우 경고 메시지가 로그에 기록됩니다. 이 제한은 디스크 연결에 적용됩니다.
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />
테이블, 데이터베이스, 테이블 함수 및 딕셔너리에 대한 `SHOW` 및 `SELECT` 쿼리에서 비밀을 표시하는 것의 활성화 또는 비활성화합니다.

비밀을 보려는 사용자는 또한
[`format_display_secrets_in_show_and_select` 형식 설정](../settings/formats#format_display_secrets_in_show_and_select)
이 켜져 있어야 하고
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 권한이 있어야 합니다.

가능한 값:

- `0` — 비활성화.
- `1` — 활성화.
## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />캐시 서버가 클라이언트로부터 받은 스로틀링 설정을 적용해야 하는지 여부입니다.
## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

활성 연결 수의 소프트 limit을 유지하기 위해 노력하는 분산 캐시가 있는 것입니다. 무료 연결 수가 distributed_cache_keep_up_free_connections_ratio * max_connections 아래로 떨어지면 가장 오래 활동한 연결이 종료되어 수가 limit을 초과할 때까지 시도합니다.
## distributed_ddl {#distributed_ddl} 

클러스터에서 [분산 ddl 쿼리](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`)의 실행을 관리합니다.
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper)가 활성화된 경우에만 작동합니다.

`<distributed_ddl>` 내에서 구성할 수 있는 설정은 다음과 같습니다:

| 설정                  | 설명                                                                                                                           | 기본값                              |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| `path`                 | DDL 쿼리를 위한 `task_queue`의 Keeper 내 경로                                                                                  |                                     |
| `profile`              | DDL 쿼리를 실행하는 데 사용되는 프로파일                                                                                        |                                     |
| `pool_size`            | 얼마나 많은 `ON CLUSTER` 쿼리를 동시에 실행할 수 있는지                                                                         |                                     |
| `max_tasks_in_queue`   | 대기열에 있을 수 있는 최대 작업 수.                                                                                           | `1,000`                             |
| `task_max_lifetime`    | 나이가 이 값을 초과하는 경우 노드를 삭제합니다.                                                                                | `7 * 24 * 60 * 60` (1주일, 초단위) |
| `cleanup_delay_period` | 마지막 청소가 이루어지지 않았던 경우 새 노드 이벤트를 수신한 후 청소가 시작됩니다.                                                | `60` 초                             |

**예시**

```xml
<distributed_ddl>
    <!-- Path in ZooKeeper to queue with DDL queries -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Settings from this profile will be used to execute DDL queries -->
    <profile>default</profile>

    <!-- Controls how much ON CLUSTER queries can be run simultaneously. -->
    <pool_size>1</pool_size>

    <!--
         Cleanup settings (active tasks will not be removed)
    -->

    <!-- Controls task TTL (default 1 week) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Controls how often cleanup should be performed (in seconds) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Controls how many tasks could be in the queue -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles} 

<SettingsInfoBlock type="Bool" default_value="0" />활성화되면, ON CLUSTER 쿼리는 원격 샤드에서 실행을 위해 발신자의 사용자 및 역할을 보존하고 사용합니다. 이는 클러스터 전반에 걸쳐 일관된 접근 제어를 보장하지만, 모든 노드에서 사용자 및 역할이 존재해야 합니다.
## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />이름을 ipv4 주소로 해결하는 것을 허용합니다.
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />이름을 ipv6 주소로 해결하는 것을 허용합니다.
## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />내부 DNS 캐시의 최대 항목 수입니다.
## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />내부 DNS 캐시 업데이트 기간(초)입니다.
## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />ClickHouse DNS 캐시에서 호스트 이름을 삭제하기 전에 허용되는 최대 DNS 해결 실패 수입니다.
## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />분산 캐시 삭제에 사용되는 스레드풀의 크기입니다.
## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />분산 캐시 삭제에 사용되는 스레드풀의 큐 크기입니다.
## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Azure sdk에서 로깅을 활성화합니다.
## encryption {#encryption} 

[암호화 코덱](/sql-reference/statements/create/table#encryption-codecs)에서 사용할 키를 얻기 위한 명령을 구성합니다. 키(또는 키)는 환경 변수에 작성하거나 구성 파일에 설정해야 합니다.

키는 16 바이트 길이의 16진수 또는 문자열일 수 있습니다.

**예시**

구성에서 로드:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
구성 파일에 키를 저장하는 것은 권장되지 않습니다. 안전하지 않습니다. 키를 보안 디스크의 별도 구성 파일로 이동하고 그 구성 파일을 `config.d/` 폴더에 대한 심볼릭 링크를 넣을 수 있습니다.
:::

구성에서 로드할 때 키가 16진수인 경우:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

환경 변수에서 키를 로드합니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

여기서 `current_key_id`는 암호화를 위한 현재 키를 설정하며, 지정된 모든 키는 복호화에 사용할 수 있습니다.

이 방법은 여러 키에 대해 적용할 수 있습니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

여기서 `current_key_id`는 암호화를 위한 현재 키를 표시합니다.

사용자는 또한 기본적으로 암호화 및 복호화 프로세스에서 사용되는 넌스가 0 바이트로 구성되도록 하는 12 바이트 길이의 넌스를 추가할 수 있습니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

또는 16진수로 설정할 수 있습니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
위에서 언급된 모든 내용은 `aes_256_gcm_siv`에 적용될 수 있습니다(하지만 키는 32 바이트 길이여야 합니다).
:::
## error_log {#error_log} 

기본적으로 비활성화되어 있습니다.

**활성화**

오류 기록 수집을 수동으로 켜려면 [`system.error_log`](../../operations/system-tables/error_log.md)를 사용하여 `/etc/clickhouse-server/config.d/error_log.xml`를 다음 내용을 사용하여 만듭니다:

```xml
<clickhouse>
    <error_log>
        <database>system</database>
        <table>error_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </error_log>
</clickhouse>
```

**비활성화**

`error_log` 설정을 비활성화하려면 다음 파일 `/etc/clickhouse-server/config.d/disable_error_log.xml`을 다음 내용으로 생성해야 합니다:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
입력을 파싱하기 위해 스레드 풀에서 예약할 수 있는 최대 작업 수입니다.

:::note
값이 `0`이면 무제한을 의미합니다.
:::
## format_schema_path {#format_schema_path} 

입력 데이터의 스키마(예: [CapnProto](/interfaces/formats/CapnProto) 형식의 스키마)에 대한 디렉토리 경로입니다.

**예시**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />전역 프로파일러의 CPU 클록 타이머 기간(나노초). 전역 프로파일러를 끄려면 값을 0으로 설정합니다. 단일 쿼리의 경우 10000000(초당 100회)의 권장 값 또는 클러스터 전체 프로파일링의 경우 1000000000(초당 1회)이 권장됩니다.
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />전역 프로파일러의 현실 시계 타이머 기간(나노초). 전역 프로파일러를 끄려면 값을 0으로 설정합니다. 단일 쿼리의 경우 10000000(초당 100회)의 권장 값 또는 클러스터 전체 프로파일링의 경우 1000000000(초당 1회)이 권장됩니다.
## google_protos_path {#google_protos_path} 

Protobuf 유형을 위한 프로토 파일을 포함하는 디렉토리를 정의합니다.

예시:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## graphite {#graphite} 

[Graphite](https://github.com/graphite-project)로 데이터를 전송합니다.

설정:

- `host` – Graphite 서버.
- `port` – Graphite 서버의 포트.
- `interval` – 전송 간격(초).
- `timeout` – 데이터 전송 타임아웃(초).
- `root_path` – 키의 접두사.
- `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블에서 데이터 전송.
- `events` – [system.events](/operations/system-tables/events) 테이블에서 특정 기간 동안 축적된 델타 데이터 전송.
- `events_cumulative` – [system.events](/operations/system-tables/events) 테이블에서 누적 데이터 전송.
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 테이블에서 데이터 전송.

다수의 `<graphite>` 절을 구성할 수 있습니다. 예를 들어, 서로 다른 간격으로 서로 다른 데이터를 전송하기 위해 이를 사용할 수 있습니다.

**예시**

```xml
<graphite>
    <host>localhost</host>
    <port>42000</port>
    <timeout>0.1</timeout>
    <interval>60</interval>
    <root_path>one_min</root_path>
    <metrics>true</metrics>
    <events>true</events>
    <events_cumulative>false</events_cumulative>
    <asynchronous_metrics>true</asynchronous_metrics>
</graphite>
```
## graphite_rollup {#graphite_rollup} 

Graphite용 데이터 축소 설정입니다.

자세한 내용은 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)를 참조하십시오.

**예시**

```xml
<graphite_rollup_example>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup_example>
```
## hsts_max_age {#hsts_max_age} 

HSTS의 만료 시간(초)입니다.

:::note
값이 `0`이면 ClickHouse가 HSTS를 비활성화합니다. 양수를 설정하면 HSTS가 활성화되고 max-age는 설정한 숫자가 됩니다.
:::

**예시**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />이 limit을 초과하는 연결은 유효 기간이 현저히 짧습니다. 이 limit은 디스크 또는 스토리지에 속하지 않는 http 연결에 적용됩니다.
## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />이 limit을 초과하는 연결은 사용 후 재설정됩니다. 캐시를 끄려면 0으로 설정합니다. 이 limit은 디스크 또는 스토리지에 속하지 않는 http 연결에 적용됩니다.
## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />사용 중인 연결 수가 이 limit을 초과할 경우 경고 메시지가 로그에 기록됩니다. 이 limit은 디스크 또는 스토리지에 속하지 않는 http 연결에 적용됩니다.
## http_handlers {#http_handlers} 

사용자 정의 HTTP 핸들러를 사용할 수 있습니다.
새 HTTP 핸들러를 추가하려면 간단히 새 `<rule>`를 추가합니다.
규칙은 정의된 대로 위에서 아래로 확인되며, 첫 번째 일치 항목이 핸들러를 실행합니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| 하위 태그            | 정의                                                                                                                                                        |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | 요청 URL과 일치하도록, 'regex:' 접두사를 사용하여 정규 표현식으로 일치시킬 수 있습니다(선택 사항)                                                     |
| `methods`            | 요청 방법과 일치하도록, 여러 방법 일치를 쉼표로 구분하여 사용할 수 있습니다(선택 사항)                                                                  |
| `headers`            | 요청 헤더와 일치하도록, 각 하위 요소(하위 요소 이름은 헤더 이름)과 일치시킬 수 있으며, 'regex:' 접두사를 사용하여 정규 표현식으로 일치시킬 수 있습니다(선택 사항) |
| `handler`            | 요청 핸들러                                                                                                                                              |
| `empty_query_string` | URL에 쿼리 문자열이 없음을 확인합니다                                                                                                                       |

`handler`에는 하위 태그로 구성할 수 있는 다음 설정이 포함됩니다:

| 하위 태그            | 정의                                                                                                                                                      |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | 리디렉션 위치                                                                                                                                           |
| `type`               | 지원되는 유형: static, dynamic_query_handler, predefined_query_handler, redirect                                                                          |
| `status`             | static 유형과 함께 사용 시, 응답 상태 코드                                                                                                               |
| `query_param_name`   | dynamic_query_handler 유형과 함께 사용, HTTP 요청 매개변수에서 `<query_param_name>` 값에 해당하는 값을 추출하고 실행합니다                                 |
| `query`              | predefined_query_handler 유형과 함께 사용, 핸들러 호출 시 쿼리를 실행합니다                                                                              |
| `content_type`       | static 유형과 함께 사용, 응답 콘텐츠 유형                                                                                                              |
| `response_content`   | static 유형과 함께 사용, 클라이언트에 전송되는 응답 콘텐츠, 'file://' 또는 'config://' 접두사를 사용하는 경우, 파일 또는 구성에서 콘텐츠를 찾습니다.    |

규칙 목록과 함께 `<defaults/>`를 지정할 수 있으며, 이는 모든 기본 핸들러를 활성화하는 것입니다.

예시:

```xml
<http_handlers>
    <rule>
        <url>/</url>
        <methods>POST,GET</methods>
        <headers><pragma>no-cache</pragma></headers>
        <handler>
            <type>dynamic_query_handler</type>
            <query_param_name>query</query_param_name>
        </handler>
    </rule>

    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.settings</query>
        </handler>
    </rule>

    <rule>
        <handler>
            <type>static</type>
            <status>200</status>
            <content_type>text/plain; charset=UTF-8</content_type>
            <response_content>config://http_server_default_response</response_content>
        </handler>
    </rule>
</http_handlers>
```
## http_options_response {#http_options_response} 

HTTP 요청의 응답에 헤더를 추가하는 데 사용됩니다. `OPTIONS` HTTP 요청입니다.
`OPTIONS` 방법은 CORS 사전 비행 요청을 할 때 사용됩니다.

자세한 내용은 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)를 참조하십시오.

예시:

```xml
<http_options_response>
     <header>
            <name>Access-Control-Allow-Origin</name>
            <value>*</value>
     </header>
     <header>
          <name>Access-Control-Allow-Headers</name>
          <value>origin, x-requested-with, x-clickhouse-format, x-clickhouse-user, x-clickhouse-key, Authorization</value>
     </header>
     <header>
          <name>Access-Control-Allow-Methods</name>
          <value>POST, GET, OPTIONS</value>
     </header>
     <header>
          <name>Access-Control-Max-Age</name>
          <value>86400</value>
     </header>
</http_options_response>
```
## http_server_default_response {#http_server_default_response} 

ClickHouse HTTP(s) 서버에 접근할 때 기본적으로 표시되는 페이지입니다.
기본값은 "Ok." (끝에 줄 바꿈 포함)입니다.

**예시**

`http://localhost: http_port`에 접근하면 `https://tabix.io/`가 열립니다.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />iceberg 카탈로그를 위한 백그라운드 풀의 크기입니다.
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />iceberg 카탈로그 풀에 밀어넣을 수 있는 작업 수입니다.
## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />항목 수에 대한 iceberg 메타데이터 파일 캐시의 최대 크기입니다. 0은 비활성화를 의미합니다.
## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

iceberg 메타데이터 캐시 정책 이름입니다.
## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

바이트 단위로 iceberg 메타데이터 캐시의 최대 크기입니다. 0은 비활성화를 의미합니다.
## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

iceberg 메타데이터 캐시의 총 크기에 대한 보호 큐의 크기(슬루 정책의 경우)입니다.
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />
참이면 ClickHouse는 `CREATE VIEW` 쿼리에서 빈 SQL 보안 문을 위한 기본값을 작성하지 않습니다.

:::note
이 설정은 마이그레이션 기간 동안에만 필요하며 24.4에서는 더 이상 필요하지 않게 됩니다.
:::
## include_from {#include_from} 

치환이 포함된 파일의 경로입니다. XML 및 YAML 형식이 모두 지원됩니다.

자세한 내용은 "[구성 파일](/operations/configuration-files)" 섹션을 참조하십시오.

**예시**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />보조 인덱스 마크 캐시 정책 이름입니다.
## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
인덱스 마크에 대한 캐시의 최대 크기입니다.

:::note

값이 `0`이면 비활성화됨을 의미합니다.

이 설정은 런타임 중에 수정할 수 있으며 즉시 적용됩니다.
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />보조 인덱스 마크 캐시에서 보호된 큐의 크기(슬루 정책의 경우)가 캐시의 총 크기에 대한 비율입니다.
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />보조 인덱스 압축되지 않은 캐시 정책 이름입니다.
## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
`MergeTree` 인덱스의 압축되지 않은 블록에 대한 캐시의 최대 크기입니다.

:::note
값이 `0`이면 비활성화됨을 의미합니다.

이 설정은 런타임 중에 수정할 수 있으며 즉시 적용됩니다.
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />보조 인덱스 압축되지 않은 캐시에서 보호된 큐의 크기(슬루 정책의 경우)가 캐시의 총 크기에 대한 비율입니다.
## interserver_http_credentials {#interserver_http_credentials} 

[복제](../../engines/table-engines/mergetree-family/replication.md) 중 다른 서버에 연결하는 데 사용되는 사용자 이름 및 비밀번호입니다. 추가로, 서버는 이러한 자격 증명을 사용하여 다른 복제본을 인증합니다. `interserver_http_credentials`는 따라서 클러스터의 모든 복제본에 대해 동일해야 합니다.

:::note
- 기본적으로, `interserver_http_credentials` 섹션이 생략되면, 복제 중 인증을 사용하지 않습니다.
- `interserver_http_credentials` 설정은 ClickHouse 클라이언트 자격 증명 [구성](../../interfaces/cli.md#configuration_files)과 관련이 없습니다.
- 이 자격 증명은 `HTTP` 및 `HTTPS`를 통한 복제에 공통적입니다.
:::

다음 설정은 하위 태그로 구성할 수 있습니다:

- `user` — 사용자 이름.
- `password` — 비밀번호.
- `allow_empty` — `true`인 경우 다른 복제본이 자격 증명이 설정되어 있어도 인증 없이 연결할 수 있도록 허용됩니다. `false`인 경우 인증 없이 연결이 거부됩니다. 기본값: `false`.
- `old` — 자격 증명 회전 중에 사용된 이전 `user` 및 `password`를 포함합니다. 여러 `old` 섹션을 지정할 수 있습니다.

**자격 증명 회전**

ClickHouse는 모든 복제본을 동시에 중지하지 않고 동적으로 interserver 자격 증명을 회전하는 것을 지원합니다. 자격 증명은 여러 단계로 변경할 수 있습니다.

인증을 활성화하려면 `interserver_http_credentials.allow_empty`를 `true`로 설정하고 자격 증명을 추가합니다. 이렇게 하면 인증과 비인증 모두에 대해 연결할 수 있습니다.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

모든 복제본을 구성한 후 `allow_empty`를 `false`로 설정하거나 이 설정을 제거하십시오. 그러면 새 자격 증명으로 인증이 필수적으로 됩니다.

기존 자격 증명을 변경하려면 사용자 이름과 비밀번호를 `interserver_http_credentials.old` 섹션으로 이동하고 `user` 및 `password`를 새 값으로 업데이트합니다. 이 시점에서 서버는 다른 복제본에 연결하기 위해 새 자격 증명을 사용하며 새 자격 증명 또는 이전 자격 증명으로의 연결을 허용합니다.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>222</password>
    <old>
        <user>admin</user>
        <password>111</password>
    </old>
    <old>
        <user>temp</user>
        <password>000</password>
    </old>
</interserver_http_credentials>
```

모든 복제본에 새 자격 증명이 적용되면 이전 자격 증명을 제거할 수 있습니다.
## interserver_http_host {#interserver_http_host} 

다른 서버가 이 서버에 접근할 수 있도록 사용할 수 있는 호스트 이름입니다.

생략하면 `hostname -f` 명령과 동일한 방법으로 정의됩니다.

특정 네트워크 인터페이스에서 벗어나기 위해 유용합니다.

**예제**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_http_port {#interserver_http_port} 

ClickHouse 서버 간 데이터 교환을 위한 포트입니다.

**예제**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_https_host {#interserver_https_host} 

[`interserver_http_host`](#interserver_http_host)와 유사하지만 이 호스트 이름은 다른 서버가 `HTTPS`를 통해 이 서버에 접근하는 데 사용할 수 있습니다.

**예제**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_https_port {#interserver_https_port} 

`HTTPS`를 통해 ClickHouse 서버 간의 데이터 교환을 위한 포트입니다.

**예제**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_listen_host {#interserver_listen_host} 

ClickHouse 서버 간에 데이터를 교환할 수 있는 호스트에 대한 제한입니다. Keeper가 사용되는 경우, 서로 다른 Keeper 인스턴스 간의 통신에도 동일한 제한이 적용됩니다.

:::note
기본적으로, 값은 [`listen_host`](#listen_host) 설정과 같습니다.
:::

**예제**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

유형:

기본값:
## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
IO 스레드 풀에서 예약할 수 있는 최대 작업 수입니다.

:::note
값이 `0`이면 무제한입니다.
:::
## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />system.trace_log에 jemalloc의 샘플 할당을 저장합니다.
## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

jemalloc 백그라운드 스레드를 활성화합니다. Jemalloc은 사용하지 않는 메모리 페이지를 정리하기 위해 백그라운드 스레드를 사용합니다. 이를 비활성화하면 성능 저하가 발생할 수 있습니다.
## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

모든 스레드에 대해 jemalloc의 할당 프로파일러를 활성화합니다. Jemalloc은 샘플 할당 및 샘플 할당을 위한 모든 해제를 샘플링합니다.
프로파일은 할당 분석에 사용할 수 있는 SYSTEM JEMALLOC FLUSH PROFILE을 사용하여 플러시할 수 있습니다.
샘플은 config jemalloc_collect_global_profile_samples_in_trace_log 또는 쿼리 설정 jemalloc_collect_profile_samples_in_trace_log을 사용하여 system.trace_log에 저장할 수도 있습니다.
[할당 프로파일링](/operations/allocation-profiling)을 참조하십시오.
## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

jemalloc 프로파일 플러시가 jemalloc_flush_profile_interval_bytes에 의해 전역 피크 메모리 사용량이 증가한 후에 수행됩니다.
## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

총 메모리가 초과 오류가 발생했을 때 jemalloc 프로파일 플러시가 수행됩니다.
## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

생성할 수 있는 jemalloc 백그라운드 스레드의 최대 수로, 0으로 설정하면 jemalloc의 기본 값이 사용됩니다.
## keep_alive_timeout {#keep_alive_timeout} 

연결을 닫기 전에 ClickHouse가 HTTP 프로토콜에 대한 들어오는 요청을 기다리는 초 수입니다.

**예제**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_hosts {#keeper_hosts} 

동적 설정. ClickHouse가 잠재적으로 연결할 수 있는 [Zoo]Keeper 호스트 집합을 포함합니다. `<auxiliary_zookeepers>`에서 정보를 노출하지 않습니다.
## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />배치 지원 MultiRead 요청에 대한 [Zoo]Keeper의 최대 배치 크기입니다. 0으로 설정하면 배치가 비활성화됩니다. ClickHouse Cloud에서만 사용할 수 있습니다.
## ldap_servers {#ldap_servers} 

다음과 같이 여기에 LDAP 서버 목록과 마다의 연결 매개변수를 입력하십시오:
- 'password' 대신 'ldap' 인증 메커니즘이 지정된 전용 로컬 사용자의 인증기에 사용됩니다.
- 원격 사용자 디렉토리로 사용됩니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| 설정                           | 설명                                                                                                                                                                                                                                                                                                                    |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP 서버의 호스트 이름 또는 IP, 이 매개변수는 필수이며 비어 있을 수 없습니다.                                                                                                                                                                                                                                   |
| `port`                         | LDAP 서버 포트, `enable_tls`가 true로 설정된 경우 기본값은 `636`, 그렇지 않으면 `389`입니다.                                                                                                                                                                                                                   |
| `bind_dn`                      | 바인딩할 DN을 구성하는 데 사용되는 템플릿입니다. 결과 DN은 각 인증 시도 동안 템플릿의 모든 `\{user_name\}` 하위 문자열을 실제 사용자 이름으로 교체하여 구성됩니다.                                                                                                                                                   |
| `user_dn_detection`            | 바인딩된 사용자의 실제 사용자 DN을 감지하기 위한 LDAP 검색 매개변수가 포함된 섹션입니다. 이는 서버가 Active Directory일 때 추가 역할 매핑을 위한 검색 필터에서 주로 사용됩니다. 결과 사용자 DN은 허용되는 모든 `\{user_dn\}` 하위 문자열을 교체하는 데 사용됩니다. 기본적으로, 사용자 DN은 바인딩 DN과 동일하게 설정되지만, 검색이 수행되면 실제 감지된 사용자 DN 값으로 업데이트됩니다. |
| `verification_cooldown`        | 성공적인 바인드 시도가 이루어진 후 LDAP 서버에 문의하지 않고 사용자가 모든 연속 요청에 대해 성공적으로 인증된 것으로 간주되는 시간(초)입니다. 캐시를 비활성화하고 각 인증 요청마다 LDAP 서버에 문의하도록 하려면 `0`(기본값)을 지정하십시오.                                                                                                 |
| `enable_tls`                   | LDAP 서버에 대한 보안 연결 사용을 트리거하는 플래그입니다. 일반 텍스트(`ldap://`) 프로토콜(권장하지 않음)에 대해 `no`로 지정하세요. SSL/TLS(`ldaps://`) 프로토콜(권장, 기본값)에 대해 `yes`로 지정하세요. 레거시 StartTLS 프로토콜(일반 텍스트(`ldap://`) 프로토콜, TLS로 업그레이드됨)에 대해 `starttls`로 지정하세요.                |
| `tls_minimum_protocol_version` | SSL/TLS의 최소 프로토콜 버전입니다. 허용되는 값은: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`(기본값)입니다.                                                                                                                                                                                                 |
| `tls_require_cert`             | SSL/TLS 피어 인증서 검증 동작입니다. 허용되는 값은: `never`, `allow`, `try`, `demand`(기본값)입니다.                                                                                                                                                                                                          |
| `tls_cert_file`                | 인증서 파일의 경로입니다.                                                                                                                                                                                                                                                                                           |
| `tls_key_file`                 | 인증서 키 파일의 경로입니다.                                                                                                                                                                                                                                                                                         |
| `tls_ca_cert_file`             | CA 인증서 파일의 경로입니다.                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_dir`              | CA 인증서가 포함된 디렉터리의 경로입니다.                                                                                                                                                                                                                                                                          |
| `tls_cipher_suite`             | 허용된 암호 모음(OpenSSL 표기법)입니다.                                                                                                                                                                                                                                                                             |

설정 `user_dn_detection`은 하위 태그로 구성할 수 있습니다:

| 설정          | 설명                                                                                                                                                                                                                       |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`     | LDAP 검색을 위한 기본 DN을 구성하는 템플릿입니다. 결과 DN은 LDAP 검색 동안 템플릿의 모든 `\{user_name\}` 및 `\{bind_dn\}` 하위 문자열을 실제 사용자 이름 및 바인딩 DN으로 교체하여 구성됩니다.                                                      |
| `scope`       | LDAP 검색의 범위입니다. 허용되는 값은: `base`, `one_level`, `children`, `subtree`(기본값)입니다.                                                                                                                                                                 |
| `search_filter` | LDAP 검색을 위한 검색 필터를 구성하는 템플릿입니다. 결과 필터는 LDAP 검색 동안 템플릿의 모든 `\{user_name\}`, `\{bind_dn\}`, 및 `\{base_dn\}` 하위 문자열을 실제 사용자 이름, 바인딩 DN 및 기본 DN으로 교체하여 구성됩니다. XML에서 특수 문자는 올바르게 이스케이프되어야 합니다. |

예제:

```xml
<my_ldap_server>
    <host>localhost</host>
    <port>636</port>
    <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
    <verification_cooldown>300</verification_cooldown>
    <enable_tls>yes</enable_tls>
    <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
    <tls_require_cert>demand</tls_require_cert>
    <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
    <tls_key_file>/path/to/tls_key_file</tls_key_file>
    <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
    <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
    <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
</my_ldap_server>
```

예제(추가 역할 매핑을 위해 사용자 DN 감지가 구성된 일반 Active Directory):

```xml
<my_ad_server>
    <host>localhost</host>
    <port>389</port>
    <bind_dn>EXAMPLE\{user_name}</bind_dn>
    <user_dn_detection>
        <base_dn>CN=Users,DC=example,DC=com</base_dn>
        <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
    </user_dn_detection>
    <enable_tls>no</enable_tls>
</my_ad_server>
```
## license_key {#license_key} 

ClickHouse Enterprise Edition에 대한 라이센스 키입니다.
## listen_backlog {#listen_backlog} 

리슨 소켓의 대기열 크기(대기 중인 연결의 대기열 크기)입니다. `4096`의 기본값은 linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4))와 동일합니다.

일반적으로 이 값은 변경할 필요가 없습니다. 이는:
- 기본값이 충분히 크고,
- 클라이언트의 연결을 수용하기 위해 서버는 별도의 스레드를 가집니다.

따라서 `TcpExtListenOverflows`(에서 `nstat`)가 0이 아닌 경우 ClickHouse 서버에 대해 이 카운터가 증가하더라도 이 값을 늘릴 필요는 없습니다. 이는:
- 일반적으로 `4096`가 충분하지 않으면 내부 ClickHouse 확장 문제를 나타내므로 문제를 보고하는 것이 좋습니다.
- 이는 서버가 이후에 더 많은 연결을 처리할 수 있다는 것을 의미하지 않습니다(설사 그렇게 할 수 있다고 해도, 그 순간 클라이언트가 사라지거나 연결이 끊어질 수 있습니다).

**예제**

```xml
<listen_backlog>4096</listen_backlog>
```
## listen_host {#listen_host} 

요청이 올 수 있는 호스트에 대한 제한입니다. 서버가 모든 요청에 응답하도록 하려면 `::`를 지정합니다.

예제:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_reuse_port {#listen_reuse_port} 

여러 서버가 동일한 주소:포트에서 수신하도록 허용합니다. 요청은 운영 체제에 의해 무작위 서버로 라우팅됩니다. 이 설정을 활성화하는 것은 권장되지 않습니다.

**예제**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

유형:

기본값:
## listen_try {#listen_try} 

IPv6 또는 IPv4 네트워크가 사용 불가능할 때 서버는 종료하지 않습니다.

**예제**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />마크 로딩을 위한 백그라운드 풀의 크기입니다.
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

프리패치 풀에 푸시할 수 있는 작업 수입니다.
## logger {#logger} 

로그 메시지의 위치와 형식입니다.

**키**:

| 키                    | 설명                                                                                                                                                           |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | 로그 수준. 허용되는 값: `none` (로깅 끄기), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                             |
| `log`                  | 로그 파일의 경로.                                                                                                                                             |
| `errorlog`             | 오류 로그 파일의 경로.                                                                                                                                         |
| `size`                 | 회전 정책: 로그 파일의 최대 크기 (바이트 단위). 로그 파일 크기가 이 임계값을 초과하면 이름이 바뀌고 아카이브되며 새 로그 파일이 생성됩니다.                     |
| `count`                | 회전 정책: Clickhouse에서 보관하는 최대 과거 로그 파일 수.                                                                                                     |
| `stream_compress`      | LZ4를 사용하여 로그 메시지를 압축합니다. `1` 또는 `true`로 설정하여 활성화합니다.                                                                                 |
| `console`              | 콘솔에 로깅을 활성화합니다. `1` 또는 `true`로 설정하여 활성화합니다. Clickhouse가 데몬 모드에서 실행되지 않으면 기본값은 `1`, 그렇지 않으면 `0`입니다.         |
| `console_log_level`    | 콘솔 출력의 로그 수준. 기본값은 `level`입니다.                                                                                                                |
| `formatting.type`      | 콘솔 출력의 로그 형식. 현재 `json`만 지원됩니다.                                                                                                               |
| `use_syslog`           | 로그 출력을 syslog로도 전달합니다.                                                                                                                             |
| `syslog_level`         | syslog에 로깅할 때의 로그 수준입니다.                                                                                                                            |
| `async`                | `true`(기본값)일 때 비동기적으로 로깅이 발생합니다(출력 채널당 백그라운드 스레드 하나). 그렇지 않으면 LOG를 호출하는 스레드 내부에서 로깅됩니다.              |
| `async_queue_max_size` | 비동기 로깅을 사용할 때, 플러시를 기다리는 큐에 유지될 최대 메시지 수. 추가 메시지는 삭제됩니다.                                                             |
| `startup_level`        | 서버 시작 시 루트 로거 수준을 설정하는 데 사용됩니다. 시작 후 로그 수준은 `level` 설정으로 되돌아갑니다.                                                      |
| `shutdown_level`       | 서버 종료 시 루트 로거 수준을 설정하는 데 사용됩니다.                                                                                                          |

**로그 형식 지정자**

`log` 및 `errorLog` 경로의 파일 이름은 결과 파일 이름에 사용할 수 있는 아래 형식 지정자를 지원합니다(디렉터리 부분은 지원하지 않음).

"예시" 열은 `2023-07-06 18:32:07`에서의 출력을 보여줍니다.

| 형식 지정자  | 설명                                                                                                                        | 예시                    |
|--------------|---------------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | 리터럴 %                                                                                                                  | `%`                        |
| `%n`         | 새 줄 문자                                                                                                              |                          |
| `%t`         | 수평 탭 문자                                                                                                            |                          |
| `%Y`         | 10진수로 표현된 연도, 예: 2017                                                                                           | `2023`                     |
| `%y`         | 10진수로 표현된 연도의 마지막 2자리 (범위 [00,99])                                                                     | `23`                       |
| `%C`         | 10진수로 표현된 연도의 처음 2자리 (범위 [00,99])                                                                      | `20`                       |
| `%G`         | 4자리 [ISO 8601 주 기반 연도](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) , 즉 지정된 주를 포함하는 연도. 일반적으로  `%V`와 함께 사용됨. | `2023`                     |
| `%g`         | 10진수로 표현된 [ISO 8601 주 기반 연도](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 의 마지막 2자리.                                          | `23`                       |
| `%b`         | 약어형 월 이름, 예: Oct (로케일에 따라 다름)                                                                            | `Jul`                      |
| `%h`         | %b의 동의어                                                                                                              | `Jul`                      |
| `%B`         | 전체 월 이름, 예: October (로케일에 따라 다름)                                                                          | `July`                     |
| `%m`         | 10진수로 표현된 월 (범위 [01,12])                                                                                       | `07`                       |
| `%U`         | 주 단위로 표현된 연도 (일요일이 주의 첫날) (범위 [00,53])                                                                 | `27`                       |
| `%W`         | 주 단위로 표현된 연도 (월요일이 주의 첫날) (범위 [00,53])                                                                 | `27`                       |
| `%V`         | ISO 8601 주 번호 (범위 [01,53])                                                                                          | `27`                       |
| `%j`         | 10진수로 표현된 연중 날 수 (범위 [001,366])                                                                             | `187`                      |
| `%d`         | 0으로 채워진 10진수로 표현된 월의 일 (범위 [01,31]). 단일 자리는 앞에 0이 붙습니다.                                       | `06`                       |
| `%e`         | 공백으로 채워진 10진수로 표현된 월의 일 (범위 [1,31]). 단일 자리는 앞에 공백이 붙습니다.                                  | `&nbsp; 6`                |
| `%a`         | 약어형 요일 이름, 예: Fri (로케일에 따라 다름)                                                                          | `Thu`                      |
| `%A`         | 전체 요일 이름, 예: Friday (로케일에 따라 다름)                                                                          | `Thursday`                 |
| `%w`         | 일요일 기준의 정수로 표현된 요일 (범위 [0-6])                                                                            | `4`                        |
| `%u`         | 1부터 시작하는 10진수 요일, 월요일을 1로 설정 (ISO 8601 형식) (범위 [1-7])                                           | `4`                        |
| `%H`         | 24시간제로 표현된 10진수로 된 시 (범위 [00-23])                                                                         | `18`                       |
| `%I`         | 12시간제로 표현된 10진수로 된 시 (범위 [01,12])                                                                         | `06`                       |
| `%M`         | 10진수로 표현된 분 (범위 [00,59])                                                                                        | `32`                       |
| `%S`         | 10진수로 표현된 초 (범위 [00,60])                                                                                        | `07`                       |
| `%c`         | 표준 날짜 및 시간 문자열, 예: Sun Oct 17 04:41:13 2010 (로케일에 따라 다름)                                            | `Thu Jul  6 18:32:07 2023` |
| `%x`         | 로컬화된 날짜 표현 (로케일에 따라 다름)                                                                                   | `07/06/23`                |
| `%X`         | 로컬화된 시간 표현, 예: 18:40:20 또는 6:40:20 PM (로케일에 따라 다름)                                                  | `18:32:07`                |
| `%D`         | 짧은 MM/DD/YY 날짜, %m/%d/%y에 상응                                                                                            | `07/06/23`                |
| `%F`         | 짧은 YYYY-MM-DD 날짜, %Y-%m-%d에 상응                                                                                        | `2023-07-06`              |
| `%r`         | 로컬화된 12시간제 시각 (로케일에 따라 다름)                                                                                | `06:32:07 PM`             |
| `%R`         | "%H:%M"의 동등한 표현                                                                                                     | `18:32`                    |
| `%T`         | "%H:%M:%S"의 동등한 표현 (ISO 8601 시간 형식)                                                                            | `18:32:07`                |
| `%p`         | 로컬화된 오전/오후 표시 (로케일에 따라 다름)                                                                                  | `PM`                       |
| `%z`         | UTC에서의 오프셋을 ISO 8601 형식으로 표현 (예: -0430), 또는 시간대 정보가 없을 경우 문자가 없음                             | `+0800`                    |
| `%Z`         | 로케일에 따른 시간대 이름 또는 약어, 또는 시간대 정보가 없을 경우 문자가 없음                                             | `Z AWST`                   |

**예시**

```xml
<logger>
    <level>trace</level>
    <log>/var/log/clickhouse-server/clickhouse-server-%F-%T.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server-%F-%T.err.log</errorlog>
    <size>1000M</size>
    <count>10</count>
    <stream_compress>true</stream_compress>
</logger>
```

로그 메시지를 콘솔에만 출력하려면:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**레벨별 오버라이드**

개별 로그 이름의 로그 수준을 오버라이드할 수 있습니다. 예를 들어, "Backup" 및 "RBAC" 로거의 모든 메시지를 음소거하려면 다음을 사용합니다.

```xml
<logger>
    <levels>
        <logger>
            <name>Backup</name>
            <level>none</level>
        </logger>
        <logger>
            <name>RBAC</name>
            <level>none</level>
        </logger>
    </levels>
</logger>
```

**syslog**

로그 메시지를 syslog로 추가하여 기록하려면:

```xml
<logger>
    <use_syslog>1</use_syslog>
    <syslog>
        <address>syslog.remote:10514</address>
        <hostname>myhost.local</hostname>
        <facility>LOG_LOCAL6</facility>
        <format>syslog</format>
    </syslog>
</logger>
```

`<syslog>`의 키:

| 키        | 설명                                                                                                                                                                                                                                   |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | `host\[:port\]` 형식의 syslog 주소입니다. 생략하면 로컬 데몬이 사용됩니다.                                                                                                                                                          |
| `hostname` | 로그를 전송하는 호스트의 이름 (선택 사항).                                                                                                                                                                                           |
| `facility` | syslog [시설 키워드](https://en.wikipedia.org/wiki/Syslog#Facility). 대문자로 "LOG_" 접두사를 붙여 명시해야 하며, 예: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` 등. 기본값: `address`가 지정된 경우 `LOG_USER`, 그렇지 않은 경우 `LOG_DAEMON`.                              |
| `format`   | 로그 메시지 형식. 가능한 값: `bsd` 및 `syslog.`                                                                                                                                                                                    |

**로그 형식**

콘솔 로그에 출력되는 로그 형식을 지정할 수 있습니다. 현재는 JSON만 지원됩니다.

**예시**

여기 JSON 로그의 출력 예시가 있습니다:

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "Received signal 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

JSON 로깅 지원을 활성화하려면 다음 스니펫을 사용하세요:

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Can be configured on a per-channel basis (log, errorlog, console, syslog), or globally for all channels (then just omit it). -->
        <!-- <channel></channel> -->
        <names>
            <date_time>date_time</date_time>
            <thread_name>thread_name</thread_name>
            <thread_id>thread_id</thread_id>
            <level>level</level>
            <query_id>query_id</query_id>
            <logger_name>logger_name</logger_name>
            <message>message</message>
            <source_file>source_file</source_file>
            <source_line>source_line</source_line>
        </names>
    </formatting>
</logger>
```

**JSON 로그용 키 이름 변경**

키 이름은 `<names>` 태그 내의 태그 값을 변경하여 수정할 수 있습니다. 예를 들어, `DATE_TIME`을 `MY_DATE_TIME`으로 변경하려면 `<date_time>MY_DATE_TIME</date_time>`를 사용할 수 있습니다.

**JSON 로그용 키 생략**

로그 속성은 속성을 주석 처리하여 생략할 수 있습니다. 예를 들어, 로그에서 `query_id`를 출력하고 싶지 않다면 `<query_id>` 태그를 주석 처리할 수 있습니다.
## macros {#macros} 

복제 테이블에 대한 매개변수 치환.

복제 테이블을 사용하지 않는 경우 생략할 수 있습니다.

자세한 내용은 [복제 테이블 생성](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) 섹션을 참조하세요.

**예시**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />마크 캐시 정책 이름입니다.
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />프리워밍 중에 채워야 할 마크 캐시의 총 크기에 대한 비율입니다.
## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
`MergeTree`(/engines/table-engines/mergetree-family) 계열 테이블의 마크를 위한 최대 캐시 크기입니다.

:::note
이 설정은 런타임 동안 수정 가능하며 즉시 적용됩니다.
:::
## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />마크 캐시의 전체 크기에 대한 보호 큐의 크기(예: SLRU 정책 경우)입니다.
## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />시작 시 활성 데이터 파트 집합을 로드하기 위한 스레드 수입니다 (활성 상태인 것).
## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />
사용자가 생성하거나 변경할 수 있는 인증 방법의 최대 수입니다.
이 설정을 변경해도 기존 사용자에게는 영향을 주지 않습니다. 이 설정에서 지정된 한도를 초과하는 인증 관련 쿼리는 실패합니다.
비인증 생성/변경 쿼리는 성공합니다.

:::note
`0` 값은 무제한을 의미합니다.
:::
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />서버에 대한 모든 백업의 최대 읽기 속도 (바이트/초)입니다. 0은 무제한을 의미합니다.
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />백업 IO 스레드 풀에서 **유휴** 스레드의 수가 `max_backup_io_thread_pool_free_size`를 초과하면, ClickHouse는 유휴 스레드에 의해 점유된 리소스를 해제하고 풀 크기를 줄입니다. 필요시 스레드가 다시 생성될 수 있습니다.
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse는 S3 백업 IO 작업을 수행하기 위해 백업 IO 스레드 풀에서 스레드를 사용합니다. `max_backups_io_thread_pool_size`는 풀에서 사용할 수 있는 최대 스레드 수를 제한합니다.
## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
벡터 인덱스를 구축하기 위해 사용할 최대 스레드 수입니다.

:::note
`0` 값은 모든 코어를 의미합니다.
:::
## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
동시 삽입 쿼리의 총 수에 대한 제한입니다.

:::note

`0` (기본값) 값은 무제한을 의미합니다.

이 설정은 런타임 동안 수정 가능하며 즉시 적용됩니다. 이미 실행 중인 쿼리는 변경되지 않습니다.
:::
## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
동시 실행 쿼리의 총 수에 대한 제한입니다. `INSERT` 및 `SELECT` 쿼리에 대한 제한과 사용자에 대한 최대 쿼리 수 역시 고려해야 합니다.

참조:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

`0` (기본값) 값은 무제한을 의미합니다.

이 설정은 런타임 동안 수정 가능하며 즉시 적용됩니다. 이미 실행 중인 쿼리는 변경되지 않습니다.
:::
## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
동시 선택 쿼리의 총 수에 대한 제한입니다.

:::note

`0` (기본값) 값은 무제한을 의미합니다.

이 설정은 런타임 동안 수정 가능하며 즉시 적용됩니다. 이미 실행 중인 쿼리는 변경되지 않습니다.
:::
## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />최대 서버 연결 수입니다.
## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />데이터베이스 수가 이 값을 초과하면 서버가 예외를 발생시킵니다. 0은 제한이 없음을 의미합니다.
## max_database_num_to_warn {#max_database_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
부착된 데이터베이스 수가 지정된 값을 초과하면 ClickHouse 서버가 `system.warnings` 테이블에 경고 메시지를 추가합니다.

**예시**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```
## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />데이터베이스 복구 중 테이블을 생성하기 위한 스레드 수입니다. 0은 스레드 수가 코어 수와 같음을 의미합니다.
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
사전 수가 이 값을 초과하면 서버가 예외를 발생시킵니다.

데이터베이스 엔진 테이블만 계산됨:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0` 값은 제한이 없음을 의미합니다.
:::

**예시**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```
## max_dictionary_num_to_warn {#max_dictionary_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
부착된 사전 수가 지정된 값을 초과하면 ClickHouse 서버가 `system.warnings` 테이블에 경고 메시지를 추가합니다.

**예시**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```
## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />서버에서 분산 캐시의 최대 총 읽기 속도 (바이트/초)입니다. 0은 무제한을 의미합니다.
## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />서버에서 분산 캐시의 최대 총 쓰기 속도 (바이트/초)입니다. 0은 무제한을 의미합니다.
## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />집계 과정에서 수집된 해시 테이블 통계의 최대 항목 수입니다.
## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION을 위한 스레드 수입니다.
## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
입력 파싱을 위한 스레드 풀에서 유지해야 하는 최대 유휴 대기 스레드 수입니다.
## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
입력 파싱을 위해 사용할 수 있는 최대 총 스레드 수입니다.
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
IO 스레드 풀에서 **유휴** 스레드 수가 `max_io_thread_pool_free_size`를 초과하면 ClickHouse는 유휴 스레드가 점유한 리소스를 해제하고 풀 크기를 줄입니다. 필요시 스레드가 다시 생성될 수 있습니다.
## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse는 S3와 상호 작용하기 위한 IO 작업을 수행하기 위해 IO 스레드 풀의 스레드를 사용합니다. `max_io_thread_pool_size`는 풀에서 사용할 수 있는 최대 스레드 수를 제한합니다.
## max_keep_alive_requests {#max_keep_alive_requests} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouse 서버에 의해 종료될 때까지 단일 keep-alive 연결을 통해 최대한 수행할 수 있는 요청 수입니다.

**예시**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
로컬 읽기의 최대 속도 (바이트/초)입니다.

:::note
`0` 값은 무제한을 의미합니다.
:::
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
로컬 쓰기의 최대 속도 (바이트/초)입니다.

:::note
`0` 값은 무제한을 의미합니다.
:::
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />
테이블에 부착된 물리화된 뷰의 수에 대한 제한입니다.

:::note
여기서는 직접적으로 의존하는 뷰만 고려되며, 뷰 위에 다른 뷰를 생성하는 것은 포함되지 않습니다.
:::
## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />서버에서 모든 병합의 최대 읽기 속도 (바이트/초)입니다. 0은 무제한을 의미합니다.
## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />서버에서 모든 변형의 최대 읽기 속도 (바이트/초)입니다. 0은 무제한을 의미합니다.
## max_named_collection_num_to_throw {#max_named_collection_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
명명된 컬렉션 수가 이 값을 초과하면 서버가 예외를 발생시킵니다.

:::note
`0` 값은 제한이 없음을 의미합니다.
:::

**예시**
```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```
## max_named_collection_num_to_warn {#max_named_collection_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
명명된 컬렉션 수가 지정된 값을 초과하면 ClickHouse 서버가 `system.warnings` 테이블에 경고 메시지를 추가합니다.

**예시**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```
## max_open_files {#max_open_files} 

최대 열린 파일 수입니다.

:::note
`getrlimit()` 함수가 잘못된 값을 반환하므로 이 옵션을 macOS에서 사용하는 것을 권장합니다.
:::

**예시**

```xml
<max_open_files>262144</max_open_files>
```
## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
OS CPU 대기 시간 (OSCPUWaitMicroseconds 메트릭)과 바쁨 (OSCPUVirtualTimeMicroseconds 메트릭) 시간 사이의 비율이 연결을 끊기에 고려되는 비율입니다. 최소 및 최대 비율 사이의 선형 보간이 확률을 계산하는 데 사용되며, 이 시점에서 확률은 1입니다.
서버 CPU 오버로드 시 동작 조절에 대한 [상세 내용](/operations/settings/server-overload)을 참조하십시오.
## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />시작 시 비활성 데이터 파트 집합을 로드하기 위한 스레드 수입니다.
## max_part_num_to_warn {#max_part_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="100000" />
활성 파트 수가 지정된 값을 초과하면 ClickHouse 서버가 `system.warnings` 테이블에 경고 메시지를 추가합니다.

**예시**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```
## max_partition_size_to_drop {#max_partition_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
파티션을 삭제하는 것에 대한 제한입니다.

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 크기가 [`max_partition_size_to_drop`](#max_partition_size_to_drop) (바이트 단위)를 초과하면, [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) 쿼리를 사용하여 파티션을 삭제할 수 없습니다.
이 설정은 ClickHouse 서버를 재시작하지 않고도 적용할 수 있습니다. 제한을 비활성화하는 또 다른 방법은 `<clickhouse-path>/flags/force_drop_table` 파일을 생성하는 것입니다.

:::note
값 `0`은 제약 없이 파티션을 삭제할 수 있음을 의미합니다.

이 제한은 테이블 삭제 및 테이블 잘리기에는 제한되지 않으며, [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)을 참조하세요.
:::

**예시**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```
## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />비활성 데이터 파트를 동시 제거하기 위한 스레드 수입니다.
## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
보류 중인 변형 중 하나가 지정된 값을 초과하는 경우 ClickHouse 서버가 `system.warnings` 테이블에 경고 메시지를 추가합니다.

**예시**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```
## max_pending_mutations_to_warn {#max_pending_mutations_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="500" />
보류 중인 변형 수가 지정된 값을 초과하면 ClickHouse 서버가 `system.warnings` 테이블에 경고 메시지를 추가합니다.

**예시**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```
## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
프리픽스 역직렬화 스레드 풀에서 **유휴** 스레드 수가 `max_prefixes_deserialization_thread_pool_free_size`를 초과하면, ClickHouse는 유휴 스레드가 점유한 리소스를 해제하고 풀 크기를 줄입니다. 필요시 스레드가 다시 생성될 수 있습니다.
## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse는 MergeTree의 Wide 파트에서 파일 프리픽스의 열 및 하위 열의 메타데이터를 병렬로 읽기 위해 프리픽스 역직렬화 스레드 풀의 스레드를 사용합니다. `max_prefixes_deserialization_thread_pool_size`는 풀에서 사용할 수 있는 최대 스레드 수를 제한합니다.
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
읽기 작업을 위한 네트워크 상의 데이터 교환의 최대 속도 (바이트/초)입니다.

:::note
`0` (기본값) 값은 무제한을 의미합니다.
:::
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
쓰기를 위한 네트워크 상의 데이터 교환의 최대 속도 (바이트/초)입니다.

:::note
`0` (기본값) 값은 무제한을 의미합니다.
:::
## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />복제된 가져오기에서 네트워크 상의 데이터 교환의 최대 속도 (바이트/초)입니다. 0은 무제한을 의미합니다.
## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />복제된 전송에서 네트워크 상의 데이터 교환의 최대 속도 (바이트/초)입니다. 0은 무제한을 의미합니다.
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
복제 테이블 수가 이 값을 초과하면 서버가 예외를 발생시킵니다.

데이터베이스 엔진 테이블만 계산됨:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0` 값은 제한이 없음을 의미합니다.
:::

**예시**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```
## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />
서버가 사용할 수 있는 최대 메모리 양 (바이트 단위)입니다.

:::note
서버의 최대 메모리 소비는 `max_server_memory_usage_to_ram_ratio` 설정에 의해 추가로 제한됩니다.
:::

특별한 경우로서, `0` (기본값) 값은 서버가 모든 사용 가능한 메모리를 소비할 수 있음을 의미합니다 (추가 제한은 제외됨).
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
서버가 사용할 수 있는 최대 메모리 양을 사용 가능한 전체 메모리에 대한 비율로 표현합니다.

예를 들어, `0.9` (기본값) 값은 서버가 사용 가능한 메모리의 90%를 소비할 수 있음을 의미합니다.

저메모리 시스템에서 메모리 사용량을 줄이는 것을 허용합니다.
RAM과 스왑이 낮은 호스트에서는 [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio)를 1보다 크게 설정해야 할 수도 있습니다.

:::note
서버의 최대 메모리 소비는 `max_server_memory_usage` 설정에 의해 추가로 제한됩니다.
:::
## max_session_timeout {#max_session_timeout} 

최대 세션 타임아웃, 초 단위입니다.

예시:

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_num_to_throw {#max_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
테이블 수가 이 값을 초과하면 서버가 예외를 발생시킵니다.

다음 테이블은 포함되지 않습니다:
- view
- remote
- dictionary
- system

데이터베이스 엔진 테이블만 계산됨:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0` 값은 제한이 없음을 의미합니다.
:::

**예시**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```
## max_table_num_to_warn {#max_table_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="5000" />
부착된 테이블 수가 지정된 값을 초과하면 ClickHouse 서버가 `system.warnings` 테이블에 경고 메시지를 추가합니다.

**예시**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```
## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
테이블 삭제에 대한 제한입니다.

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 크기가 `max_table_size_to_drop` (바이트 단위)를 초과하면, [`DROP`](../../sql-reference/statements/drop.md) 쿼리 또는 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 쿼리를 사용하여 삭제할 수 없습니다.

:::note
`0` 값은 모든 테이블을 제약 없이 삭제할 수 있음을 의미합니다.

이 설정은 ClickHouse 서버를 재시작하지 않고도 적용할 수 있습니다. 제한 비활성화의 또 다른 방법은 `<clickhouse-path>/flags/force_drop_table` 파일을 생성하는 것입니다.
:::

**예시**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
외부 집계, 조인 또는 정렬에 사용할 수 있는 최대 저장 용량입니다.
이 한도를 초과하는 쿼리는 예외가 발생하여 실패합니다.

:::note
`0` 값은 무제한을 의미합니다.
:::

참조:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)
## max_thread_pool_free_size {#max_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
전역 스레드 풀에서 **유휴** 스레드 수가 [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)를 초과하면, ClickHouse는 일부 스레드가 점유한 리소스를 해제하고 풀 크기를 줄입니다. 필요시 스레드가 다시 생성될 수 있습니다.

**예시**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```
## max_thread_pool_size {#max_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouse는 쿼리를 처리하기 위해 Global Thread 풀에서 스레드를 사용합니다. 쿼리를 처리할 수 있는 유휴 스레드가 없으면, 풀에서 새로운 스레드가 생성됩니다. `max_thread_pool_size`는 풀에서의 최대 스레드 수를 제한합니다.

**예시**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```
## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />시작 시 비활성 데이터 파트 세트(예기치 않은 것)를 로드할 스레드 수입니다.
## max_view_num_to_throw {#max_view_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
뷰 수가 이 값을 초과하면 서버는 예외를 발생시킵니다.

데이터베이스 엔진에 대한 테이블만 계산합니다:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
`0`의 값을 가지면 제한이 없습니다.
:::

**예시**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```
## max_view_num_to_warn {#max_view_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
첨부된 뷰 수가 지정된 값을 초과하면 ClickHouse 서버는 `system.warnings` 테이블에 경고 메시지를 추가합니다.

**예시**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```
## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
동시 대기 중인 쿼리의 총 수에 대한 제한입니다.
대기 쿼리 실행은 필요한 테이블이 비동기적으로 로딩되는 동안 차단됩니다 (참고: [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)).

:::note
대기 쿼리는 다음 설정에 의해 제어되는 제한을 확인할 때 계산되지 않습니다:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

이 수정은 서버 시작 후 이러한 제한에 도달하는 것을 피하기 위해 수행됩니다.
:::

:::note

`0`(기본값)의 값은 무제한을 의미합니다.

이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다. 이미 실행 중인 쿼리는 변경되지 않습니다.
:::
## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

백그라운드 메모리 워커가 jemalloc 및 cgroups와 같은 외부 소스의 정보를 기반으로 내부 메모리 트래커를 수정해야 하는지 여부입니다.
## memory_worker_period_ms {#memory_worker_period_ms} 

메모리 트래커의 메모리 사용량을 수정하고 더 높은 메모리 사용 중에 사용되지 않는 페이지를 정리하는 백그라운드 메모리 워커의 틱 주기입니다. 0으로 설정하면 메모리 사용 출처에 따라 기본값이 사용됩니다.
## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

현재 cgroup 메모리 사용 정보를 사용하여 메모리 추적을 수정합니다.
## merge_tree {#merge_tree} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)에 대한 테이블의 세밀 조정입니다.

자세한 내용은 MergeTreeSettings.h 헤더 파일을 참조하십시오.

**예시**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />
리소스가 머지 및 기타 작업 부하 간에 어떻게 활용되고 공유되는지를 조정하는 데 사용됩니다. 지정된 값은 모든 백그라운드 머지에 대한 `workload` 설정 값으로 사용됩니다. 머지 트리 설정으로 재정의할 수 있습니다.

**참조**
- [작업 부하 스케줄링](/operations/workload-scheduling.md)
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />
머지 및 변환 작업을 수행하는 데 사용되는 RAM에 대한 제한을 설정합니다.
ClickHouse가 설정된 한도에 도달하면 새 백그라운드 머지 또는 변환 작업을 스케줄하지 않지만 이미 스케줄된 작업은 계속 실행합니다.

:::note
`0`의 값은 무제한을 의미합니다.
:::

**예시**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />
기본 `merges_mutations_memory_usage_soft_limit` 값은 `memory_amount * merges_mutations_memory_usage_to_ram_ratio`로 계산됩니다.

**참조:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)
## metric_log {#metric_log} 

기본적으로 비활성화되어 있습니다.

**활성화**

메트릭 기록 수집을 수동으로 켜려면 [`system.metric_log`](../../operations/system-tables/metric_log.md)를 만들고 다음 내용을 포함하는 `/etc/clickhouse-server/config.d/metric_log.xml`를 생성하십시오:

```xml
<clickhouse>
    <metric_log>
        <database>system</database>
        <table>metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </metric_log>
</clickhouse>
```

**비활성화**

`metric_log` 설정을 비활성화하려면 다음 파일 `/etc/clickhouse-server/config.d/disable_metric_log.xml`을 생성하고 다음 내용을 포함하십시오:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
연결을 드롭하는 것으로 간주하기 위한 OS CPU 대기(OSCPUWaitMicroseconds 메트릭)와 바쁜(OSCPUVirtualTimeMicroseconds 메트릭) 시간 간의 최소 비율입니다. 최소 및 최대 비율 사이의 선형 보간을 사용하여 확률을 계산하며, 이 시점에서 확률은 0입니다.
자세한 내용은 [서버 CPU 과부하에서의 동작 제어](/operations/settings/server-overload)를 참조하십시오.
## mlock_executable {#mlock_executable} 

시작 후 `mlockall`을 수행하여 첫 번째 쿼리 대기를 줄이고 높은 IO 부하에서 ClickHouse 실행 파일이 페이지 아웃되는 것을 방지합니다.

:::note
이 옵션을 활성화하는 것은 권장되지만 시작 시간이 몇 초까지 증가할 수 있습니다.
이 설정은 "CAP_IPC_LOCK" 기능 없이는 작동하지 않을 것이라는 점을 유의하십시오.
:::

**예시**

```xml
<mlock_executable>false</mlock_executable>
```
## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />
이 설정은 빈번한 열기/닫기 호출(결과적으로 페이지 결함으로 인해 매우 비쌈)을 피하고 여러 스레드 및 쿼리에서 매핑을 재사용할 수 있습니다. 설정 값은 매핑된 영역의 수(일반적으로 매핑된 파일의 수와 동일)입니다.

매핑된 파일의 데이터 양은 다음 시스템 테이블에서 다음 메트릭을 모니터링할 수 있습니다:

- [`system.metrics`](/operations/system-tables/metrics)에서 `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells`, [`system.metric_log`](/operations/system-tables/metric_log)
- [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)에서 `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses`

:::note
매핑된 파일의 데이터 양은 메모리를 직접 소비하지 않으며, 쿼리 또는 서버 메모리 사용에서 계산되지 않습니다. 이는 이 메모리가 OS 페이지 캐시와 유사하게 버려질 수 있기 때문입니다. 캐시는 MergeTree 계열의 테이블에서 오래된 파트를 제거할 때 자동으로 삭제되며, `SYSTEM DROP MMAP CACHE` 쿼리로 수동으로 삭제할 수 있습니다.

이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다.
:::
## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />
리소스가 변환 및 기타 작업 부하 간에 어떻게 활용되고 공유되는지를 조정하는 데 사용됩니다. 지정된 값은 모든 백그라운드 변환에 대한 `workload` 설정 값으로 사용됩니다. 머지 트리 설정으로 재정의할 수 있습니다.

**참조**
- [작업 부하 스케줄링](/operations/workload-scheduling.md)
## mysql_port {#mysql_port} 

MySQL 프로토콜을 통해 클라이언트와 통신하기 위한 포트입니다.

:::note
- 양의 정수는 수신할 포트 번호를 지정합니다.
- 빈 값은 MySQL 프로토콜을 통해 클라이언트와의 통신을 비활성화하는 데 사용됩니다.
:::

**예시**

```xml
<mysql_port>9004</mysql_port>
```
## mysql_require_secure_transport {#mysql_require_secure_transport} 

true로 설정되면, 클라이언트와의 안전한 통신이 요구됩니다 [mysql_port](#mysql_port). `--ssl-mode=none` 옵션이 있는 연결은 거부됩니다. [OpenSSL](#openssl) 설정과 함께 사용하십시오.
## openSSL {#openssl} 

SSL 클라이언트/서버 구성입니다.

SSL에 대한 지원은 `libpoco` 라이브러리에서 제공됩니다. 사용 가능한 구성 옵션은 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)에서 설명됩니다. 기본값은 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)에서 찾을 수 있습니다.

서버/클라이언트 설정을 위한 키:

| 옵션                        | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 기본값                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | PEM 인증서의 비밀 키가 포함된 파일의 경로입니다. 파일에는 키와 인증서를 동시에 포함할 수 있습니다.                                                                                                                                                                                                                                                                                                                                              |                                            |
| `certificateFile`             | PEM 형식의 클라이언트/서버 인증서 파일의 경로입니다. `privateKeyFile`에 인증서가 포함되어 있을 경우 생략할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | 신뢰할 수 있는 CA 인증서를 포함하는 파일 또는 디렉토리의 경로입니다. 파일을 가리키는 경우 PEM 형식이어야 하며 여러 CA 인증서를 포함할 수 있습니다. 디렉토리를 가리키는 경우, 각 CA 인증서에 대해 하나의 .pem 파일이 포함되어야 합니다. 파일 이름은 CA 주제 이름 해시 값에 의해 검색됩니다. 자세한 내용은 [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html)의 매뉴얼 페이지를 참조하십시오. |                                            |
| `verificationMode`            | 노드의 인증서를 확인하는 방법입니다. 자세한 내용은 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 클래스의 설명을 참조하십시오. 가능한 값: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | 확인 체인의 최대 길이입니다. 인증서 체인 길이가 설정된 값을 초과하면 확인에 실패합니다.                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | OpenSSL의 내장 CA 인증서를 사용할지 여부입니다. ClickHouse는 내장 CA 인증서가 `/etc/ssl/cert.pem` 파일(또는 디렉토리 `/etc/ssl/certs`)에 있거나 환경 변수 `SSL_CERT_FILE` (또는 `SSL_CERT_DIR`)에 의해 지정된 파일(또는 디렉토리)에 있다고 가정합니다.                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | 지원되는 OpenSSL 암호화 방식입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | 세션 캐시를 활성화하거나 비활성화합니다. `sessionIdContext`와 함께 사용해야 합니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | 서버가 생성한 각 식별자에 추가하는 고유한 무작위 문자의 집합입니다. 문자열의 길이는 `SSL_MAX_SSL_SESSION_ID_LENGTH`를 초과할 수 없습니다. 이 매개변수는 서버가 세션을 캐시하는 경우와 클라이언트가 캐시 요청을 한 경우 모두 문제를 피하는 데 도움이 되므로 항상 권장됩니다.                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | 서버가 캐시하는 세션의 최대 수입니다. `0` 값은 무제한 세션을 의미합니다.                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | 서버에서 세션을 캐시하는 시간(시간)입니다.                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | 활성화된 경우, 인증서 CN 또는 SAN이 피어 호스트 이름과 일치하는지 확인합니다.                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | TLSv1 연결이 요구됩니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | TLSv1.1 연결이 요구됩니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | TLSv1.2 연결이 요구됩니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | OpenSSL FIPS 모드를 활성화합니다. 라이브러리의 OpenSSL 버전이 FIPS를 지원하는 경우 지원됩니다.                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | 개인 키에 액세스하기 위한 암호를 요청하는 클래스(PrivateKeyPassphraseHandler 하위 클래스)입니다. 예: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | 유효하지 않은 인증서를 검증하기 위한 클래스(CertificateHandler의 하위 클래스)입니다. 예: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | 사용이 허용되지 않은 프로토콜입니다.                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | 클라이언트가 선호하는 서버 암호입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

**설정 예시:**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 -->
        <dhParamsFile>/etc/clickhouse-server/dhparam.pem</dhParamsFile>
        <verificationMode>none</verificationMode>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <!-- Use for self-signed: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Use for self-signed: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## opentelemetry_span_log {#opentelemetry_span_log} 

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters/>

예시:

```xml
<opentelemetry_span_log>
    <engine>
        engine MergeTree
        partition by toYYYYMM(finish_date)
        order by (finish_date, finish_time_us, trace_id)
    </engine>
    <database>system</database>
    <table>opentelemetry_span_log</table>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</opentelemetry_span_log>
```
## os_cpu_busy_time_threshold {#os_cpu_busy_time_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />CPU가 일부 유용한 작업을 수행하고 있다고 간주하기 위한 OS CPU 바쁜 시간의 임계값 (OSCPUVirtualTimeMicroseconds 메트릭)입니다. 바쁜 시간이 이 값 미만일 경우에는 CPU 과부하로 간주되지 않습니다.
## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />
분산 캐시 TCP 핸들러의 스레드에 대한 Linux nice 값입니다. 낮은 값은 더 높은 CPU 우선순위를 의미합니다.

CAP_SYS_NICE 권한이 필요하며, 그렇지 않으면 효과가 없습니다.

가능한 값: -20에서 19.
## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />
병합 및 변환 스레드에 대한 Linux nice 값입니다. 낮은 값은 더 높은 CPU 우선순위를 의미합니다.

CAP_SYS_NICE 권한이 필요하며, 그렇지 않으면 효과가 없습니다.

가능한 값: -20에서 19.
## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />
ZooKeeper 클라이언트에서 전송 및 수신 스레드에 대한 Linux nice 값입니다. 낮은 값은 더 높은 CPU 우선순위를 의미합니다.

CAP_SYS_NICE 권한이 필요하며, 그렇지 않으면 효과가 없습니다.

가능한 값: -20에서 19.
## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />사용자 공간 페이지 캐시에서 무료로 유지할 메모리 한도의 비율입니다. Linux의 min_free_kbytes 설정과 유사합니다.
## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />해제된 메모리가 사용자 공간 페이지 캐시에 사용될 수 있기 전의 지연 시간입니다.
## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />사용자 공간 페이지 캐시의 최대 크기입니다. 캐시를 비활성화하려면 0으로 설정하십시오. page_cache_min_size보다 크면, 캐시 크기는 이 범위 내에서 지속적으로 조정되어 가용 메모리 대부분을 사용하되 전체 메모리 사용량은 한도(max_server_memory_usage[_to_ram_ratio]) 미만으로 유지됩니다.
## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />사용자 공간 페이지 캐시의 최소 크기입니다.
## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />사용자 공간 페이지 캐시 정책 이름입니다.
## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />뮤텍스 경합을 줄이기 위해 사용자 공간 페이지 캐시를 이 많은 샤드에 스트라이프합니다. 실험적이며 성능을 개선할 가능성이 낮습니다.
## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />캐시의 총 크기에 대한 사용자 공간 페이지 캐시의 보호된 큐의 크기입니다.
## part_log {#part_log} 

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)와 연관된 이벤트를 기록합니다. 예를 들어, 데이터를 추가하거나 병합하는 등의 작업입니다. 로그를 사용하여 병합 알고리즘을 시뮬레이션하고 특성을 비교할 수 있습니다. 병합 과정을 시각화할 수 있습니다.

쿼리는 [system.part_log](/operations/system-tables/part_log) 테이블에 기록되며, 별도의 파일에 기록되지 않습니다. 이 테이블의 이름은 `table` 매개변수에서 구성할 수 있습니다 (아래 참조).

<SystemLogParameters/>

**예시**

```xml
<part_log>
    <database>system</database>
    <table>part_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</part_log>
```
## parts_kill_delay_period {#parts_kill_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />
SharedMergeTree의 파트를 완전히 제거하기 위한 기간입니다. ClickHouse Cloud에서만 사용 가능합니다.
## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />
kill_delay_period에 0에서 x초까지 균일 분포된 값을 추가하여 큰 수의 테이블에서 발생할 수 있는 썬더링 허드 효과와 이후 ZooKeeper의 DoS를 방지합니다. ClickHouse Cloud에서만 사용 가능합니다.
## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />
공유 병합 트리의 오래된 스레드를 정리하는 스레드입니다. ClickHouse Cloud에서만 사용 가능합니다.
## path {#path} 

데이터가 포함된 디렉터리의 경로입니다.

:::note
끝 슬래시는 필수입니다.
:::

**예시**

```xml
<path>/var/lib/clickhouse/</path>
```
## postgresql_port {#postgresql_port} 

PostgreSQL 프로토콜을 통해 클라이언트와 통신하기 위한 포트입니다.

:::note
- 양의 정수는 수신할 포트 번호를 지정합니다.
- 빈 값은 PostgreSQL 프로토콜을 통해 클라이언트와의 통신을 비활성화하는 데 사용됩니다.
:::

**예시**

```xml
<postgresql_port>9005</postgresql_port>
```
## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

true로 설정되면, 클라이언트와의 안전한 통신이 요구됩니다 [postgresql_port](#postgresql_port). `sslmode=disable` 옵션이 있는 연결은 거부됩니다. [OpenSSL](#openssl) 설정과 함께 사용하십시오.
## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />원격 객체 저장소에 대한 미리 가져오기 배경 풀의 크기입니다.
## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />미리 가져오기 풀에 푸시할 수 있는 작업 수입니다.
## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
prefixes 역직렬화 스레드 풀에서 예약할 수 있는 최대 작업 수입니다.

:::note
`0`의 값은 무제한을 의미합니다.
:::
## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />
true면 ClickHouse는 시작 전에 구성된 모든 `system.*_log` 테이블을 생성합니다. 이 설정은 일부 시작 스크립트가 이 테이블에 의존할 경우 유용할 수 있습니다.
## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />기본 인덱스 캐시 정책 이름입니다.
## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />프리웜 중에 채워야 할 마크 캐시의 총 크기에 대한 비율입니다.
## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />기본 인덱스(즉, MergeTree 계열 테이블의 인덱스) 캐시의 최대 크기입니다.
## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />기본 인덱스 캐시의 보호된 큐의 크기(즉, SLRU 정책 경우)와 캐시의 총 크기 간의 비율입니다.
## process_query_plan_packet {#process_query_plan_packet} 

<SettingsInfoBlock type="Bool" default_value="0" />
이 설정은 QueryPlan 패킷을 읽을 수 있도록 합니다. 이 패킷은 serialize_query_plan이 활성화된 경우 분산 쿼리용으로 전송됩니다.
기본적으로는 쿼리 계획 바이너리 역직렬화에서 발생할 수 있는 보안 문제를 피하기 위해 비활성화되어 있습니다.

**예시**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```
## processors_profile_log {#processors_profile_log} 

[`processors_profile_log`](../system-tables/processors_profile_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters/>

기본 설정은 다음과 같습니다:

```xml
<processors_profile_log>
    <database>system</database>
    <table>processors_profile_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</processors_profile_log>
```
## prometheus {#prometheus} 

[Prometheus](https://prometheus.io)에서 스크래핑하기 위한 메트릭 데이터를 공개합니다.

설정:

- `endpoint` – prometheus 서버가 메트릭을 스크래핑하는 위한 HTTP 엔드포인트. '/'로 시작.
- `port` – `endpoint`를 위한 포트.
- `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블에서 메트릭을 공개합니다.
- `events` – [system.events](/operations/system-tables/events) 테이블에서 메트릭을 공개합니다.
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 테이블에서 현재 메트릭 값을 공개합니다.
- `errors` - 마지막 서버 재시작 이후 발생한 오류 코드별 오류 수를 공개합니다. 이 정보는 [system.errors](/operations/system-tables/errors)에서 또한 얻을 수 있습니다.

**예시**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
        <errors>true</errors>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

확인(예: `127.0.0.1`를 ClickHouse 서버의 IP 주소 또는 호스트 이름으로 교체):
```bash
curl 127.0.0.1:9363/metrics
```

## proxy {#proxy} 

HTTP 및 HTTPS 요청에 대한 프록시 서버를 정의합니다. 현재 S3 스토리지, S3 테이블 기능 및 URL 기능에서 지원됩니다.

프록시 서버를 정의하는 방법은 세 가지가 있습니다:
- 환경 변수
- 프록시 목록
- 원격 프록시 리졸버

특정 호스트에 대한 프록시 서버 우회도 `no_proxy`를 사용하여 지원됩니다.

**환경 변수**

`http_proxy` 및 `https_proxy` 환경 변수는 주어진 프로토콜에 대한 프록시 서버를 지정할 수 있도록 합니다. 시스템에 설정되어 있다면 원활히 작동해야 합니다.

해당 프로토콜에 하나의 프록시 서버만 있을 경우 이 방법이 가장 간단한 방법입니다. 그리고 그 프록시 서버가 변경되지 않을 때입니다.

**프록시 목록**

이 접근 방식은 프로토콜에 대해 하나 이상의 프록시 서버를 지정할 수 있도록 합니다. 여러 개의 프록시 서버가 정의된 경우 ClickHouse는 라운드 로빈 방식으로 서로 다른 프록시를 사용하여 서버 간의 부하를 균형적으로 분산합니다. 프로토콜에 대해 둘 이상의 프록시 서버가 있을 때, 그리고 프록시 서버 목록이 변경되지 않을 때 이 방법이 가장 간단합니다.

**구성 템플릿**

```xml
<proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```
아래 탭에서 부모 필드를 선택하여 자식 필드를 보십시오:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 필드     | 설명                             |
|-----------|----------------------------------|
| `<http>`  | 하나 이상의 HTTP 프록시 목록      |
| `<https>` | 하나 이상의 HTTPS 프록시 목록     |

  </TabItem>
  <TabItem value="http_https" label="<http> 및 <https>">

| 필드   | 설명           |
|---------|-----------------|
| `<uri>` | 프록시의 URI    |

  </TabItem>
</Tabs>

**원격 프록시 리졸버**

프록시 서버가 동적으로 변경될 수 있습니다. 이 경우 리졸버의 엔드포인트를 정의할 수 있습니다. ClickHouse는 해당 엔드포인트에 빈 GET 요청을 보내며, 원격 리졸버는 프록시 호스트를 반환해야 합니다. ClickHouse는 다음 템플릿을 사용하여 프록시 URI를 형성합니다: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**구성 템플릿**

```xml
<proxy>
    <http>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>80</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </http>

    <https>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>3128</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </https>

</proxy>
```

아래 탭에서 부모 필드를 선택하여 자식 필드를 보십시오:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 필드     | 설명                          |
|-----------|-------------------------------|
| `<http>`  | 하나 이상의 리졸버 목록*      |
| `<https>` | 하나 이상의 리졸버 목록*      |

  </TabItem>
  <TabItem value="http_https" label="<http> 및 <https>">

| 필드        | 설명                                        |
|-------------|---------------------------------------------|
| `<resolver>` | 리졸버에 대한 엔드포인트 및 기타 세부정보   |

:::note
여러 개의 `<resolver>` 요소를 가질 수 있지만, 주어진 프로토콜에 대해 첫 번째 `<resolver>`만 사용됩니다. 그 프로토콜에 대한 다른 `<resolver>` 요소는 무시됩니다. 이는 필요한 경우 로드 밸런싱이 원격 리졸버에 의해 수행되어야 함을 의미합니다.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 필드              | 설명                                                                                                                                                                            |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | 프록시 리졸버의 URI                                                                                                                                                          |
| `<proxy_scheme>`    | 최종 프록시 URI의 프로토콜입니다. 이 값은 `http` 또는 `https`일 수 있습니다.                                                                                                        |
| `<proxy_port>`      | 프록시 리졸버의 포트 번호                                                                                                                                                    |
| `<proxy_cache_time>` | 리졸버의 값이 ClickHouse에 의해 캐시될 초 단위 시간입니다. 이 값을 `0`으로 설정하면 ClickHouse는 HTTP 또는 HTTPS 요청마다 리졸버에 연락합니다.                                                                 |

  </TabItem>
</Tabs>

**우선순위**

프록시 설정은 다음 순서로 결정됩니다:

| 순서 | 설정                     |
|-------|--------------------------|
| 1.    | 원격 프록시 리졸버       |
| 2.    | 프록시 목록              |
| 3.    | 환경 변수                |

ClickHouse는 요청 프로토콜에 대해 가장 높은 우선 순위의 리졸버 유형을 확인합니다. 정의되지 않은 경우 다음 높은 우선 순위의 리졸버 유형을 확인하며, 환경 리졸버에 도달할 때까지 계속 진행합니다. 이로 인해 다양한 리졸버 유형을 사용할 수 있습니다.
## query_cache {#query_cache} 

[쿼리 캐시](../query-cache.md) 구성.

다음 설정을 사용할 수 있습니다:

| 설정                      | 설명                                                                               | 기본값        |
|----------------------------|------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`        | 최대 캐시 크기(바이트 단위)입니다. `0`은 쿼리 캐시가 비활성화됨을 의미합니다.       | `1073741824`  |
| `max_entries`              | 캐시에 저장되는 `SELECT` 쿼리 결과의 최대 개수입니다.                                 | `1024`        |
| `max_entry_size_in_bytes`  | 캐시에 저장될 수 있는 `SELECT` 쿼리 결과의 최대 크기(바이트 단위)입니다.           | `1048576`     |
| `max_entry_size_in_rows`   | 캐시에 저장될 수 있는 `SELECT` 쿼리 결과의 최대 행 수입니다.                       | `30000000`    |

:::note
- 변경된 설정은 즉시 적용됩니다.
- 쿼리 캐시에 대한 데이터는 DRAM에 할당됩니다. 메모리가 부족한 경우 `max_size_in_bytes`에 작은 값을 설정하거나 쿼리 캐시를 완전히 비활성화하십시오.
:::

**예제**

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```
## query_condition_cache_policy {#query_condition_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />쿼리 조건 캐시 정책 이름.
## query_condition_cache_size {#query_condition_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />
쿼리 조건 캐시의 최대 크기.
:::note
이 설정은 런타임 중에 수정할 수 있으며 즉시 적용됩니다.
:::
## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />쿼리 조건 캐시의 보호 큐 크기(SLRU 정책의 경우)입니다. 캐시의 총 크기에 대한 비율입니다.
## query_log {#query_log} 

[log_queries=1](../../operations/settings/settings.md) 설정으로 수신된 쿼리 로깅을 위한 설정입니다.

쿼리는 [system.query_log](/operations/system-tables/query_log) 테이블에 기록되며, 별도의 파일에 기록되지는 않습니다. `table` 파라미터에서 테이블의 이름을 변경할 수 있습니다(아래 참조).

<SystemLogParameters/>

이 테이블이 존재하지 않으면 ClickHouse가 생성합니다. ClickHouse 서버가 업데이트할 때 쿼리 로그의 구조가 변경된 경우, 기존 구조의 테이블은 이름이 변경되고 자동으로 새 테이블이 생성됩니다.

**예제**

```xml
<query_log>
    <database>system</database>
    <table>query_log</table>
    <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_log>
```
## query_masking_rules {#query_masking_rules} 

정규 표현식 기반 규칙으로, 서버 로그에 저장되기 전에 쿼리 및 모든 로그 메시지에 적용됩니다.
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) 테이블 및 클라이언트에 전송된 로그에서 적용됩니다. 이는 이름, 이메일, 개인 식별자 또는 신용 카드 번호와 같은 SQL 쿼리에서 민감한 데이터가 로그로 유출되는 것을 방지합니다.

**예제**

```xml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**구성 필드**:

| 설정     | 설명                                                                        |
|-----------|-----------------------------------------------------------------------------|
| `name`    | 규칙의 이름(선택 사항)                                                    |
| `regexp`  | RE2 호환 정규 표현식(필수)                                                |
| `replace` | 민감한 데이터에 대한 대체 문자열(선택 사항, 기본값 - 여섯 개의 별표)     |

마스킹 규칙은 전체 쿼리에 적용되어, 잘못된 형식의 쿼리에서 민감한 데이터 유출을 방지합니다.

[`system.events`](/operations/system-tables/events) 테이블에는 쿼리 마스킹 규칙의 일치를 나타내는 카운터 `QueryMaskingRulesMatch`가 있으며, 전체 쿼리 마스킹 규칙 일치 수를 제공합니다.

분산 쿼리의 경우 각 서버는 개별적으로 구성해야 하며, 그렇지 않으면 다른 노드에 전달된 서브쿼리는 마스킹 없이 저장됩니다.
## query_metric_log {#query_metric_log} 

기본적으로 비활성화되어 있습니다.

**활성화**

메트릭 기록 수집을 수동으로 활성화하려면 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md) 생성, `/etc/clickhouse-server/config.d/query_metric_log.xml`에 다음 내용을 추가합니다:

```xml
<clickhouse>
    <query_metric_log>
        <database>system</database>
        <table>query_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_metric_log>
</clickhouse>
```

**비활성화**

`query_metric_log` 설정을 비활성화하려면 다음 파일을 생성하십시오: `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`, 다음 내용을 포함합니다:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_thread_log {#query_thread_log} 

[log_query_threads=1](/operations/settings/settings#log_query_threads) 설정으로 수신된 쿼리의 스레드를 로깅하기 위한 설정입니다.

쿼리는 [system.query_thread_log](/operations/system-tables/query_thread_log) 테이블에 기록되며, 별도의 파일에 기록되지 않습니다. `table` 파라미터에서 테이블 이름을 변경할 수 있습니다(아래 참조).

<SystemLogParameters/>

이 테이블이 존재하지 않으면 ClickHouse가 생성합니다. ClickHouse 서버가 업데이트할 때 쿼리 스레드 로그의 구조가 변경된 경우, 기존 구조의 테이블은 이름이 변경되고 자동으로 새 테이블이 생성됩니다.

**예제**

```xml
<query_thread_log>
    <database>system</database>
    <table>query_thread_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_thread_log>
```
## query_views_log {#query_views_log} 

[log_query_views=1](/operations/settings/settings#log_query_views) 설정으로 수신된 쿼리에 따라 뷰(실시간, 물리화 등)를 로깅하기 위한 설정입니다.

쿼리는 [system.query_views_log](/operations/system-tables/query_views_log) 테이블에 기록되며, 별도의 파일에 기록되지 않습니다. `table` 파라미터에서 테이블 이름을 변경할 수 있습니다(아래 참조).

<SystemLogParameters/>

이 테이블이 존재하지 않으면 ClickHouse가 생성합니다. ClickHouse 서버가 업데이트할 때 쿼리 뷰 로그의 구조가 변경된 경우, 기존 구조의 테이블은 이름이 변경되고 자동으로 새 테이블이 생성됩니다.

**예제**

```xml
<query_views_log>
    <database>system</database>
    <table>query_views_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_views_log>
```
## remap_executable {#remap_executable} 

커다란 페이지를 사용하는 기계 코드("텍스트")의 메모리를 재할당하기 위한 설정입니다.

:::note
이 기능은 매우 실험적입니다.
:::

예제:

```xml
<remap_executable>false</remap_executable>
```
## remote_servers {#remote_servers} 

[분산](../../engines/table-engines/special/distributed.md) 테이블 엔진 및 `cluster` 테이블 함수에 의해 사용되는 클러스터의 구성입니다.

**예제**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 속성의 값에 대해서는 "[구성 파일](/operations/configuration-files)" 섹션을 참조하십시오.

**참고 사항**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [클러스터 발견](../../operations/cluster-discovery.md)
- [복제 데이터베이스 엔진](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts} 

URL 관련 스토리지 엔진 및 테이블 기능에서 사용할 수 있는 호스트 목록입니다.

`\<host\>` XML 태그로 호스트를 추가할 때:
- URL에서와 정확히 동일하게 지정해야 하며, 이름은 DNS 해제 전에 확인됩니다. 예: `<host>clickhouse.com</host>`
- URL에 포트가 명시적으로 지정된 경우, host:port를 전체로 확인합니다. 예: `<host>clickhouse.com:80</host>`
- 포트 없이 호스트가 지정된 경우, 호스트의 모든 포트가 허용됩니다. 예: `<host>clickhouse.com</host>`가 지정된 경우 `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) 등이 허용됩니다.
- IP 주소로 호스트가 지정된 경우 URL에 지정된 대로 확인됩니다. 예: `[2a02:6b8:a::a]`.
- 리다이렉트가 발생하고 리다이렉트 지원이 활성화된 경우, 모든 리다이렉트(위치 필드)가 확인됩니다.

예를 들어:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## replica_group_name {#replica_group_name} 

복제된 데이터베이스의 복제 그룹 이름입니다.

복제된 데이터베이스에 의해 생성된 클러스터는 동일한 그룹에 있는 복제본으로 구성됩니다.
DDL 쿼리는 동일한 그룹의 복제본을 기다립니다.

기본값은 비어 있습니다.

**예제**

```xml
<replica_group_name>backups</replica_group_name>
```
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />부품 가져오기 요청에 대한 HTTP 연결 시간 초과. 명시적으로 설정되지 않은 경우 기본 프로필 `http_connection_timeout`에서 상속됩니다.
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />부품 가져오기 요청에 대한 HTTP 수신 시간 초과. 명시적으로 설정되지 않은 경우 기본 프로필 `http_receive_timeout`에서 상속됩니다.
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />부품 가져오기 요청에 대한 HTTP 전송 시간 초과. 명시적으로 설정되지 않은 경우 기본 프로필 `http_send_timeout`에서 상속됩니다.
## replicated_merge_tree {#replicated_merge_tree} 

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md)에서 테이블에 대한 미세 조정. 이 설정은 더 높은 우선 순위를 가집니다.

자세한 내용은 MergeTreeSettings.h 헤더 파일을 참조하십시오.

**예제**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />복원 요청을 실행하기 위한 최대 스레드 수입니다.
## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />S3 리다이렉트 허용되는 최대 수입니다.
## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="500" />Aws::Client::RetryStrategy에 대한 설정입니다. Aws::Client가 자체적으로 재시도를 수행하며, 0은 재시도를 의미하지 않습니다.
## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />테이블이 생성되고 연결된 물리화된 뷰가 있더라도 S3Queue에서 스트리밍을 비활성화합니다.
## s3queue_log {#s3queue_log} 

` 시스 초기화

## text_index_header_cache_policy {#text_index_header_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />텍스트 인덱스 헤더 캐시 정책 이름입니다.
## text_index_header_cache_size {#text_index_header_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />텍스트 인덱스 헤더의 캐시 크기입니다. 0은 비활성화를 의미합니다.

:::note
이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다.
:::
## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />텍스트 인덱스 헤더 캐시에서 캐시의 총 크기에 대한 보호 큐의 크기(SLRU 정책의 경우)입니다.
## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />텍스트 인덱스 게시 목록의 캐시 크기(항목 수)입니다. 0은 비활성화를 의미합니다.
## text_index_postings_cache_policy {#text_index_postings_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />텍스트 인덱스 게시 목록 캐시 정책 이름입니다.
## text_index_postings_cache_size {#text_index_postings_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="2147483648" />텍스트 인덱스 게시 목록의 캐시 크기입니다. 0은 비활성화를 의미합니다.

:::note
이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다.
:::
## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />텍스트 인덱스 게시 목록 캐시에서 캐시의 총 크기에 대한 보호 큐의 크기(SLRU 정책의 경우)입니다.
## text_log {#text_log} 

텍스트 메시지를 로깅하기 위한 [text_log](/operations/system-tables/text_log) 시스템 테이블의 설정입니다.

<SystemLogParameters/>

추가적으로:

| 설정    | 설명                                                                                                                                                                                                 | 기본값            |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| `level` | 테이블에 저장될 최대 메시지 수준(기본적으로 `Trace`)입니다.                                                                                                                                         | `Trace`           |

**예시**

```xml
<clickhouse>
    <text_log>
        <level>notice</level>
        <database>system</database>
        <table>text_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <partition_by>event_date</partition_by> -->
        <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    </text_log>
</clickhouse>
```
## thread_pool_queue_size {#thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
전역 스레드 풀에서 예약될 수 있는 최대 작업 수입니다. 큐 크기를 늘리면 더 많은 메모리를 사용하게 됩니다. 이 값을 [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size)와 동일하게 유지하는 것이 좋습니다.

:::note
`0` 값은 무제한을 의미합니다.
:::

**예시**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```
## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />`local_filesystem_read_method = 'pread_threadpool'`일 때 로컬 파일 시스템에서 읽기 위한 스레드 풀의 스레드 수입니다.
## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />로컬 파일 시스템에서 읽기 위한 스레드 풀에 예약될 수 있는 최대 작업 수입니다.
## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />원격 파일 시스템에서 읽기 위해 사용되는 스레드 풀의 스레드 수입니다 (`remote_filesystem_read_method = 'threadpool'`일 때).
## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />원격 파일 시스템에서 읽기 위한 스레드 풀에 예약될 수 있는 최대 작업 수입니다.
## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />오브젝트 스토리지에 대한 쓰기 요청을 위한 백그라운드 풀의 크기입니다.
## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />오브젝트 스토리지에 대한 쓰기 요청을 위한 백그라운드 풀에 푸시할 수 있는 작업 수입니다.
## throw_on_unknown_workload {#throw_on_unknown_workload} 

<SettingsInfoBlock type="Bool" default_value="0" />
쿼리 설정 'workload'로 알 수 없는 WORKLOAD에 대한 접근 시 동작을 정의합니다.

- `true`인 경우, 알 수 없는 작업 부하에 액세스하려고 하는 쿼리에서 RESOURCE_ACCESS_DENIED 예외가 발생합니다. 이는 WORKLOAD 계층이 설정되고 WORKLOAD 기본값이 포함되는 모든 쿼리에 대한 리소스 스케줄링을 강제하는 데 유용합니다.
- `false`(기본값)인 경우, 알 수 없는 WORKLOAD를 가리키는 'workload' 설정을 가진 쿼리에 대한 무제한 접근이 제공됩니다. 이는 WORKLOAD의 계층을 설정하는 동안, WORKLOAD 기본값이 추가되기 전에는 중요합니다.

**예시**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**참고**
- [작업 부하 스케줄링](/operations/workload-scheduling.md)
## timezone {#timezone} 

서버의 표준 시간대입니다.

UTC 시간대 또는 지리적 위치에 대한 IANA 식별자로 지정됩니다 (예: Africa/Abidjan).

표준 시간대는 DateTime 필드가 텍스트 형식으로 출력될 때(화면이나 파일에 인쇄될 때)와 문자열에서 DateTime을 가져올 때 문자열과 DateTime 형식 간의 변환에 필요합니다. 또한, 시간이 입력 매개변수로 제공되지 않았을 때, 시간 및 날짜와 함께 작동하는 함수에서 사용됩니다.

**예시**

```xml
<timezone>Asia/Istanbul</timezone>
```

**참고**
- [session_timezone](../settings/settings.md#session_timezone)
## tmp_path {#tmp_path} 

대규모 쿼리를 처리하기 위해 임시 데이터를 저장하는 로컬 파일 시스템의 경로입니다.

:::note
- 임시 데이터 저장을 구성하는 데 사용할 수 있는 옵션은 `tmp_path`, `tmp_policy`, `temporary_data_in_cache` 중 하나입니다.
- 후행 슬래시는 필수입니다.
:::

**예시**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## tmp_policy {#tmp_policy} 


임시 데이터 저장을 위한 정책입니다. `tmp` 접두사가 붙은 모든 파일은 시작할 때 제거됩니다.

:::note
`tmp_policy`로 객체 저장소 사용에 대한 권장 사항:
- 각 서버에 대해 별도의 `bucket:path`를 사용합니다.
- `metadata_type=plain`을 사용합니다.
- 이 버킷에 대해 TTL을 설정할 수도 있습니다.
:::

:::note
- 임시 데이터 저장을 구성하는 데 사용할 수 있는 옵션은 `tmp_path`, `tmp_policy`, `temporary_data_in_cache` 중 하나입니다.
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes`는 무시됩니다.
- 정책은 정확히 *하나의 볼륨*이 있어야 합니다.

자세한 내용은 [MergeTree 테이블 엔진](/engines/table-engines/mergetree-family/mergetree) 문서를 참조하십시오.
:::

**예시**

`/disk1`이 가득 차면 임시 데이터는 `/disk2`에 저장됩니다.

```xml
<clickhouse>
<storage_configuration>
<disks>
<disk1>
<path>/disk1/</path>
</disk1>
<disk2>
<path>/disk2/</path>
</disk2>
</disks>

<policies>
<!-- highlight-start -->
<tmp_two_disks>
<volumes>
<main>
<disk>disk1</disk>
<disk>disk2</disk>
</main>
</volumes>
</tmp_two_disks>
<!-- highlight-end -->
</policies>
</storage_configuration>

<!-- highlight-start -->
<tmp_policy>tmp_two_disks</tmp_policy>
<!-- highlight-end -->
</clickhouse>
```
## top_level_domains_list {#top_level_domains_list} 

각 항목이 `<name>/path/to/file</name>` 형식인 사용자 정의 최상위 도메인 목록을 정의합니다.

예시:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

참고:
- [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) 함수와 그 변형은,
  사용자 정의 TLD 목록 이름을 수락하며, 첫 번째 중요한 서브도메인까지 최상위 서브도메인이 포함된 도메인 부분을 반환합니다.
## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />지정된 값 이하의 크기에서 난수 할당을 수집하며, 확률은 `total_memory_profiler_sample_probability`입니다. 0은 비활성화를 의미합니다. 이 임계값이 예상대로 작동하도록 하려면 'max_untracked_memory'를 0으로 설정할 수 있습니다.
## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />지정된 값 이상 크기의 난수 할당을 수집하며, 확률은 `total_memory_profiler_sample_probability`입니다. 0은 비활성화를 의미합니다. 이 임계값이 예상대로 작동하도록 하려면 'max_untracked_memory'를 0으로 설정할 수 있습니다.
## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />서버 메모리 사용량이 바이트 수의 다음 단계보다 커지면 메모리 프로파일러가 할당 스택 트레이스를 수집합니다. 0은 메모리 프로파일러가 비활성화됨을 의미합니다. 몇 메가바이트보다 낮은 값은 서버를 느리게 할 수 있습니다.
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />
알 수 없는 할당 및 해제 활동을 수집하고 이를 [system.trace_log](../../operations/system-tables/trace_log.md) 시스템 테이블에 `MemorySample` 유형의 `trace_type`으로 지정된 확률로 기록할 수 있게 합니다. 확률은 모든 할당 또는 해제에 대해 할당 크기와 관계없이 적용됩니다. 샘플링은 비추적 메모리량이 비추적 메모리 한도를 초과할 때만 발생합니다(기본값은 `4` MiB입니다). [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step)가 낮아지면 이 값을 낮출 수 있습니다. `total_memory_profiler_step`을 `1`로 설정하면 추가 세밀한 샘플링을 할 수 있습니다.

가능한 값:

- 긍정적인 실수입니다.
- `0` — 랜덤 할당 및 해제를 `system.trace_log` 시스템 테이블에 기록하는 것이 비활성화됩니다.
## trace_log {#trace_log} 

[trace_log](/operations/system-tables/trace_log) 시스템 테이블의 작업을 위한 설정입니다.

<SystemLogParameters/>

기본 서버 구성 파일 `config.xml`에는 다음과 같은 설정 섹션이 포함되어 있습니다:

```xml
<trace_log>
    <database>system</database>
    <table>trace_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <symbolize>false</symbolize>
</trace_log>
```
## uncompressed_cache_policy {#uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />비압축 캐시 정책 이름입니다.
## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
MergeTree 계열의 테이블 엔진이 사용하는 비압축 데이터의 최대 크기(바이트)입니다.

서버에는 하나의 공유 캐시가 있습니다. 메모리는 필요에 따라 할당됩니다. `use_uncompressed_cache` 옵션이 활성화된 경우 캐시가 사용됩니다.

비압축 캐시는 개별적인 경우 매우 짧은 쿼리에서 유리합니다.

:::note
값이 `0`이면 비활성화를 의미합니다.

이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다.
:::
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />비압축 캐시에서 캐시의 총 크기에 대한 보호 큐의 크기(SLRU 정책의 경우)입니다.
## url_scheme_mappers {#url_scheme_mappers} 

축약된 또는 기호 URL 접두사를 전체 URL로 변환하기 위한 구성입니다.

예시:

```xml
<url_scheme_mappers>
    <s3>
        <to>https://{bucket}.s3.amazonaws.com</to>
    </s3>
    <gs>
        <to>https://storage.googleapis.com/{bucket}</to>
    </gs>
    <oss>
        <to>https://{bucket}.oss.aliyuncs.com</to>
    </oss>
</url_scheme_mappers>
```
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 

ZooKeeper에서 데이터 파트 헤더의 저장 방법입니다. 이 설정은 [`MergeTree`](/engines/table-engines/mergetree-family) 계열에만 적용됩니다. 다음과 같이 지정할 수 있습니다:

**전역적으로 `config.xml`의 [merge_tree](#merge_tree) 섹션에서**

ClickHouse는 서버의 모든 테이블에 대해 이 설정을 사용합니다. 언제든지 설정을 변경할 수 있습니다. 기존 테이블은 설정이 변경될 때 동작이 변경됩니다.

**각 테이블별로**

테이블을 만들 때 해당 [엔진 설정](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)을 지정하십시오. 이 설정을 가진 기존 테이블은 글로벌 설정이 변경되더라도 동작이 변경되지 않습니다.

**가능한 값**

- `0` — 기능이 꺼짐니다.
- `1` — 기능이 켜짐니다.

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)로 설정하면, [복제된](../../engines/table-engines/mergetree-family/replication.md) 테이블은 단일 `znode`를 사용하여 데이터 파트의 헤더를 압축적으로 저장합니다. 테이블에 많은 컬럼이 포함된 경우, 이 저장 방법은 ZooKeeper에 저장되는 데이터의 볼륨을 크게 줄입니다.

:::note
`use_minimalistic_part_header_in_zookeeper = 1`을 적용한 후에는 이 설정을 지원하지 않는 버전으로 ClickHouse 서버를 다운그레이드할 수 없습니다. 클러스터의 서버에서 ClickHouse를 업그레이드할 때 주의하십시오. 모든 서버를 한 번에 업그레이드하지 않는 것이 좋습니다. 테스트 환경이나 클러스터의 몇 대의 서버에서 새로운 버전의 ClickHouse를 테스트하는 것이 더 안전합니다.

이 설정으로 이미 저장된 데이터 파트 헤더는 이전(비압축) 표현으로 복구할 수 없습니다.
:::
## user_defined_executable_functions_config {#user_defined_executable_functions_config} 

사용자 정의 실행 함수에 대한 구성 파일의 경로입니다.

경로:

- 절대 경로 또는 서버 구성 파일에 대한 상대 경로를 지정합니다.
- 경로에는 와일드카드 * 및 ?가 포함될 수 있습니다.

참고:
- "[실행 가능한 사용자 정의 함수](/sql-reference/functions/udf#executable-user-defined-functions).".

**예시**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## user_defined_path {#user_defined_path} 

사용자 정의 파일이 있는 디렉토리입니다. SQL 사용자 정의 함수 [SQL 사용자 정의 함수](/sql-reference/functions/udf)를 위해 사용됩니다.

**예시**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## user_directories {#user_directories} 

미리 정의된 사용자 구성이 포함된 구성 파일의 경로입니다.
- SQL 명령어로 생성된 사용자가 저장되는 폴더의 경로입니다.
- SQL 명령어로 생성된 사용자가 저장되고 복제되는 ZooKeeper 노드 경로입니다.

이 섹션이 지정되면, [users_config](/operations/server-configuration-parameters/settings#users_config) 및 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path)에서의 경로는 사용되지 않습니다.

`user_directories` 섹션은 임의의 수의 항목을 포함할 수 있으며, 항목의 순서는 우선순위를 의미합니다(항목이 높을수록 우선순위가 높습니다).

**예시**

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <local_directory>
        <path>/var/lib/clickhouse/access/</path>
    </local_directory>
</user_directories>
```

사용자, 역할, 행 정책, 쿼터 및 프로파일을 ZooKeeper에 저장할 수도 있습니다:

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <replicated>
        <zookeeper_path>/clickhouse/access/</zookeeper_path>
    </replicated>
</user_directories>
```

또한 `memory` 섹션을 정의하여 정보를 메모리에만 저장하고 디스크에 아무 것도 쓰지 않도록 할 수 있으며, `ldap` 섹션을 정의하여 로컬에 정의되지 않은 사용자들의 원격 사용자 디렉토리로 LDAP 서버를 사용할 수 있습니다.

LDAP 서버를 추가하려면 다음 설정을 가진 단일 `ldap` 섹션을 정의하십시오:

| 설정    | 설명                                                                                                                                                                                                                                                                                                                                                                         |
|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | `ldap_servers` 구성 섹션에 정의된 LDAP 서버 이름 중 하나. 이 매개변수는 필수이며 비워둘 수 없습니다.                                                                                                                                                                                                                                                             |
| `roles`  | LDAP 서버에서 검색된 각 사용자에게 할당될 로컬에서 정의된 역할 목록이 포함된 섹션입니다. 역할이 지정되지 않으면 사용자는 인증 후 아무 작업도 수행할 수 없습니다. 나열된 역할 중 하나라도 인증 시점에 로컬에서 정의되지 않으면 인증 시도가 잘못된 비밀번호처럼 실패할 것입니다. |

**예시**

```xml
<ldap>
    <server>my_ldap_server</server>
        <roles>
            <my_local_role1 />
            <my_local_role2 />
        </roles>
</ldap>
```
## user_files_path {#user_files_path} 

사용자 파일이 있는 디렉토리입니다. 테이블 함수 [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md)에서 사용됩니다.

**예시**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path} 

사용자 스크립트 파일이 있는 디렉토리입니다. 실행 가능한 사용자 정의 함수 [실행 가능한 사용자 정의 함수](/sql-reference/functions/udf#executable-user-defined-functions)를 위해 사용됩니다.

**예시**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

유형:

기본값:
## users_config {#users_config} 

다음이 포함된 파일 경로:

- 사용자 구성.
- 접근 권한.
- 설정 프로파일.
- 쿼터 설정.

**예시**

```xml
<users_config>users.xml</users_config>
```
## validate_tcp_client_information {#validate_tcp_client_information} 

<SettingsInfoBlock type="Bool" default_value="0" />쿼리 패킷이 수신될 때 클라이언트 정보의 유효성 검사가 활성화되어 있는지를 결정합니다.

기본값은 `false`입니다:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />벡터 유사성 인덱스의 캐시 크기(항목 수)입니다. 0은 비활성화를 의미합니다.
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />벡터 유사성 인덱스 캐시 정책 이름입니다.
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />벡터 유사성 인덱스의 캐시 크기입니다. 0은 비활성화를 의미합니다.

:::note
이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다.
:::
## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />벡터 유사성 인덱스 캐시에서 캐시의 총 크기에 대한 보호 큐의 크기(SLRU 정책의 경우)입니다.
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup} 

<SettingsInfoBlock type="Bool" default_value="1" />
이 설정은 `dictionaries_lazy_load`가 `false`인 경우 행동을 지정할 수 있게 합니다.
(`dictionaries_lazy_load`가 `true`이면 이 설정은 아무 영향을 주지 않습니다.)

`wait_dictionaries_load_at_startup`가 `false`인 경우, 서버는 시작 시 모든 딕셔너리를 로드하기 시작하며 병렬로 연결을 수신합니다.
딕셔너리가 쿼리에서 처음 사용될 때 아직 로드되지 않았다면, 쿼리는 딕셔너리가 로드될 때까지 기다립니다.
`wait_dictionaries_load_at_startup`를 `false`로 설정하면 ClickHouse가 더 빨리 시작될 수 있지만,
일부 쿼리는 로드될 딕셔너리를 기다려야 하므로 더 느리게 실행될 수 있습니다.

`wait_dictionaries_load_at_startup`가 `true`인 경우, 서버는 시작 시
모든 딕셔너리가 로드될 때까지(성공적으로 로드되든 아니든) 기다린 후에 연결을 수신합니다.

**예시**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```
## workload_path {#workload_path} 

모든 `CREATE WORKLOAD` 및 `CREATE RESOURCE` 쿼리를 저장하는 데 사용되는 디렉토리입니다. 기본적으로 서버 작업 디렉토리 아래 `/workload/` 폴더가 사용됩니다.

**예시**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**참고**
- [작업 부하 계층](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path} 

모든 `CREATE WORKLOAD` 및 `CREATE RESOURCE` 쿼리를 저장하는 데 사용되는 ZooKeeper 노드의 경로입니다. 일관성을 위해 모든 SQL 정의는 이 단일 znode의 값으로 저장됩니다. 기본적으로 ZooKeeper는 사용되지 않으며 정의는 [디스크](#workload_path)에 저장됩니다.

**예시**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**참고**
- [작업 부하 계층](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper} 

ClickHouse가 [ZooKeeper](http://zookeeper.apache.org/) 클러스터와 상호작용할 수 있도록 허용하는 설정을 포함합니다. ClickHouse는 복제된 테이블을 사용할 때 복제본의 메타데이터를 저장하기 위해 ZooKeeper를 사용합니다. 복제된 테이블을 사용하지 않을 경우 이 매개변수 섹션은 생략할 수 있습니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| 설정                                    | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | ZooKeeper 엔드포인트입니다. 여러 엔드포인트를 설정할 수 있습니다. 예: `<node index="1"><host>example_host</host><port>2181</port></node>`. `index` 속성은 ZooKeeper 클러스터에 연결할 때 노드의 순서를 지정합니다.                                                                                                                                                                                                                                                                                            |
| `session_timeout_ms`                       | 클라이언트 세션의 최대 타임아웃(밀리초)입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                     | 단일 작업에 대한 최대 타임아웃(밀리초)입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root` (선택 사항)                          | ClickHouse 서버가 사용하는 znodes의 루트로 사용되는 znode입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (선택 사항) | 기본 노드가 사용할 수 없을 때 대체 노드에 대한 zookeeper 세션의 수명 최소 한도(로드 밸런싱). 초 단위로 설정합니다. 기본값: 3시간.                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max` (선택 사항) | 기본 노드가 사용할 수 없을 때 대체 노드에 대한 zookeeper 세션의 수명 최대 한도(로드 밸런싱). 초 단위로 설정합니다. 기본값: 6시간.                                                                                                                                                                                                                                                                                                                                                              |
| `identity` (선택 사항)                      | 요청된 znodes에 접근하기 위해 ZooKeeper에서 필요한 사용자 및 비밀번호입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (선택 사항)               | true로 설정하면 Keeper 프로토콜에서 압축을 활성화합니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

또한, ZooKeeper 노드 선택 알고리즘을 선택할 수 있는 `zookeeper_load_balancing` 설정(선택 사항)이 있습니다:

| 알고리즘 이름                   | 설명                                                                                                                    |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `random`                         | ZooKeeper 노드 중 임의로 선택합니다.                                                                                       |
| `in_order`                       | 첫 번째 ZooKeeper 노드를 선택하며, 사용 불가능할 경우 두 번째 노드를 선택하고 계속 진행합니다.                                            |
| `nearest_hostname`               | 서버의 호스트 이름과 가장 유사한 호스트 이름을 가진 ZooKeeper 노드를 선택하며, 호스트 이름은 접두사로 비교됩니다. |
| `hostname_levenshtein_distance`  | `nearest_hostname`와 유사하지만, 호스트 이름 비교는 레벤슈타인 거리 방식으로 진행합니다.                                         |
| `first_or_random`                | 첫 번째 ZooKeeper 노드를 선택하며, 사용 불가능할 경우 나머지 ZooKeeper 노드 중 임의로 선택합니다.                |
| `round_robin`                    | 첫 번째 ZooKeeper 노드를 선택하며, 재연결할 경우 다음 노드를 선택합니다.                                                    |

**예시 구성**

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <session_timeout_ms>30000</session_timeout_ms>
    <operation_timeout_ms>10000</operation_timeout_ms>
    <!-- Optional. Chroot suffix. Should exist. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Optional. Zookeeper digest ACL string. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**참고**

- [복제](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper 프로그래머 가이드](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse와 ZooKeeper 간의 선택적 보안 통신](/operations/ssl-zookeeper)
## zookeeper_log {#zookeeper_log} 

[`zookeeper_log`](/operations/system-tables/zookeeper_log) 시스템 테이블의 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

<SystemLogParameters/>

**예시**

```xml
<clickhouse>
    <zookeeper_log>
        <database>system</database>
        <table>zookeeper_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <ttl>event_date + INTERVAL 1 WEEK DELETE</ttl>
    </zookeeper_log>
</clickhouse>
```
