---
description: '이 섹션에는 세션 또는 쿼리 수준에서는 변경할 수 없는 서버 설정에 대한 설명이 포함됩니다.'
keywords: ['전역 서버 설정']
sidebar_label: '서버 설정'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: '서버 설정'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# 서버 설정 \{#server-settings\}

이 섹션에서는 서버 설정에 대해 설명합니다. 여기서 설명하는 설정은
세션 또는 쿼리 수준에서 변경할 수 없습니다.

ClickHouse의 설정 파일에 대한 자세한 내용은 [""Configuration Files""](/operations/configuration-files)를 참조하십시오.

그 외 설정은 ""[Settings](/operations/settings/overview)"" 섹션에서 설명합니다.
설정을 살펴보기 전에 [Configuration files](/operations/configuration-files)
섹션을 먼저 읽고, 치환 기능(`incl` 및 `optional` 속성)의 사용 방식에 유의하기를 권장합니다.

## abort_on_logical_error \{#abort_on_logical_error\}

<SettingsInfoBlock type="Bool" default_value="0" />LOGICAL_ERROR 예외 발생 시 서버를 강제 종료합니다. 전문가만 사용해야 합니다.

## access_control_improvements \{#access_control_improvements\}

접근 제어 시스템의 선택적 개선 기능에 대한 설정입니다.

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                             | Default |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `on_cluster_queries_require_cluster_grant`      | `ON CLUSTER` 쿼리에 `CLUSTER` 권한이 필요한지 설정합니다.                                                                                                                                                                                                                                                                                                                              | `true`  |
| `role_cache_expiration_time_seconds`            | 마지막 액세스 이후 역할이 Role Cache에 유지되는 시간을 초 단위로 설정합니다.                                                                                                                                                                                                                                                                                                                        | `600`   |
| `select_from_information_schema_requires_grant` | `SELECT * FROM information_schema.<table>`에 아무 권한도 필요하지 않고 모든 사용자가 실행할 수 있는지 여부를 설정합니다. `true`로 설정하면, 이 쿼리를 실행하려면 일반 테이블과 마찬가지로 `GRANT SELECT ON information_schema.<table>` 권한이 필요합니다.                                                                                                                                                                                 | `true`  |
| `select_from_system_db_requires_grant`          | `SELECT * FROM system.<table>`에 아무 권한도 필요하지 않고 모든 사용자가 실행할 수 있는지 여부를 설정합니다. `true`로 설정하면, 이 쿼리를 실행하려면 일반 테이블과 마찬가지로 `GRANT SELECT ON system.<table>` 권한이 필요합니다. 예외: 일부 system 테이블(`tables`, `columns`, `databases` 및 `one`, `contributors`와 같은 일부 상수 테이블)은 여전히 모든 사용자가 접근할 수 있습니다. 또한 `SHOW USERS`와 같은 `SHOW` 권한이 부여된 경우, 해당 system 테이블(예: `system.users`)에 접근할 수 있습니다. | `true`  |
| `settings_constraints_replace_previous`         | 특정 setting에 대한 settings profile의 제약 조건이, 해당 setting에 대해 다른 profile에 정의된 이전 제약 조건의 동작을 새 제약 조건에서 설정하지 않은 필드를 포함하여 모두 무효화할지 여부를 설정합니다. 또한 `changeable_in_readonly` 제약 조건 유형을 활성화합니다.                                                                                                                                                                                      | `true`  |
| `table_engines_require_grant`                   | 특정 테이블 엔진을 사용하여 테이블을 생성할 때 권한이 필요한지 설정합니다.                                                                                                                                                                                                                                                                                                                              | `false` |
| `throw_on_unmatched_row_policies`               | 테이블에 행 정책이 있지만 현재 사용자에게 적용되는 정책이 하나도 없는 경우, 해당 테이블을 읽을 때 예외를 발생시킬지 여부를 설정합니다.                                                                                                                                                                                                                                                                                           | `false` |
| `users_without_row_policies_can_read_rows`      | 허용적인(permissive) 행 정책이 없는 사용자도 `SELECT` 쿼리를 사용해 행을 읽을 수 있는지 설정합니다. 예를 들어 사용자 A와 B가 있고 A에 대해서만 행 정책이 정의되어 있는 경우, 이 설정이 `true`이면 사용자 B는 모든 행을 볼 수 있습니다. 이 설정이 `false`이면 사용자 B는 어떤 행도 볼 수 없습니다.                                                                                                                                                                            | `true`  |

Example:

```xml
<access_control_improvements>
    <throw_on_unmatched_row_policies>true</throw_on_unmatched_row_policies>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```


## access_control_path \{#access_control_path\}

ClickHouse 서버가 SQL 명령으로 생성된 사용자 및 역할 구성을 저장하는 폴더 경로입니다.

**관련 항목**

- [Access Control and Account Management](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached \{#aggregate_function_group_array_action_when_limit_is_reached\}

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />groupArray에서 최대 배열 요소 크기를 초과했을 때 수행할 동작을 지정합니다: 예외를 `throw` 하거나 초과 값을 `discard` 합니다

## aggregate_function_group_array_max_element_size \{#aggregate_function_group_array_max_element_size\}

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 함수에서 배열 요소의 최대 크기(바이트 단위)를 지정합니다. 이 제한은 직렬화 시점에 검사되며 상태 크기가 과도하게 커지는 것을 방지하는 데 도움이 됩니다.

## allow_feature_tier \{#allow_feature_tier\}

<SettingsInfoBlock type="UInt32" default_value="0" />

서로 다른 feature tier와 관련된 설정을 변경할 수 있는지 제어합니다.

- `0` - 모든 설정 변경 허용 (experimental, beta, production).
- `1` - beta 및 production feature 설정만 변경 허용. experimental 설정 변경은 거부됩니다.
- `2` - production 설정만 변경 허용. experimental 또는 beta 설정 변경은 거부됩니다.

이는 모든 `EXPERIMENTAL` / `BETA` feature에 대해 읽기 전용 CONSTRAINT를 설정하는 것과 동일합니다.

:::note
값이 `0`이면 모든 설정을 변경할 수 있습니다.
:::

## allow_impersonate_user \{#allow_impersonate_user\}

<SettingsInfoBlock type="Bool" default_value="0" />IMPERSONATE 기능(EXECUTE AS target_user)을 활성화하거나 비활성화합니다. 이 설정은 더 이상 사용되지 않습니다.

## allow_implicit_no_password \{#allow_implicit_no_password\}

「IDENTIFIED WITH no&#95;password」를 명시적으로 지정하지 않는 한 비밀번호 없이 USER를 생성하는 것을 허용하지 않습니다.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow_no_password \{#allow_no_password\}

보안에 취약한 비밀번호 유형인 `no_password` 사용을 허용할지 여부를 설정합니다.

```xml
<allow_no_password>1</allow_no_password>
```


## allow_plaintext_password \{#allow_plaintext_password\}

보안에 취약한 평문(plaintext) 비밀번호 유형의 사용을 허용할지 여부를 설정합니다.

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory \{#allow_use_jemalloc_memory\}

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc 메모리를 사용할 수 있도록 허용합니다.

## allowed_disks_for_table_engines \{#allowed_disks_for_table_engines\}

Iceberg와 함께 사용할 수 있도록 허용된 디스크 목록입니다.

## async_insert_queue_flush_on_shutdown \{#async_insert_queue_flush_on_shutdown\}

<SettingsInfoBlock type="Bool" default_value="1" />값이 true이면 정상 종료 시 비동기 INSERT 대기열이 플러시됩니다.

## async_insert_threads \{#async_insert_threads\}

<SettingsInfoBlock type="UInt64" default_value="16" />백그라운드에서 실제로 데이터를 파싱하고 삽입하는 스레드의 최대 개수입니다. 0으로 설정하면 비동기 모드가 비활성화됩니다.

## async_load_databases \{#async_load_databases\}

<SettingsInfoBlock type="Bool" default_value="1" />

데이터베이스와 테이블을 비동기적으로 로드합니다.

* `true` 인 경우, ClickHouse 서버가 시작된 후 `Ordinary`, `Atomic`, `Replicated` 엔진을 사용하는 시스템 데이터베이스가 아닌 모든 데이터베이스가 비동기적으로 로드됩니다. `system.asynchronous_loader` 테이블과 `tables_loader_background_pool_size`, `tables_loader_foreground_pool_size` 서버 설정을 참고하십시오. 아직 로드되지 않은 테이블에 접근하려는 쿼리는 해당 테이블이 시작될 때까지 정확히 그 테이블에 대해서만 대기합니다. 로드 작업이 실패하면, (`async_load_databases = false` 인 경우처럼 전체 서버를 종료하는 대신) 쿼리는 오류를 다시 발생시킵니다. 하나 이상의 쿼리가 대기 중인 테이블은 더 높은 우선순위로 로드됩니다. 특정 데이터베이스에 대한 DDL 쿼리는 해당 데이터베이스가 시작될 때까지 정확히 그 데이터베이스만 대기합니다. 또한 대기 중인 쿼리의 총 개수를 제한하기 위해 `max_waiting_queries` 설정을 함께 사용하는 것을 고려하십시오.
* `false` 인 경우, 서버 시작 시 모든 데이터베이스가 로드됩니다.

**예시**

```xml
<async_load_databases>true</async_load_databases>
```


## async_load_system_database \{#async_load_system_database\}

<SettingsInfoBlock type="Bool" default_value="0" />

시스템 테이블을 비동기적으로 로드합니다. `system` 데이터베이스에 로그 테이블과 파트가 많이 있을 때 유용합니다. `async_load_databases` 설정과는 독립적입니다.

* `true`로 설정하면, ClickHouse 서버가 시작된 후 `Ordinary`, `Atomic`, `Replicated` 엔진을 사용하는 모든 `system` 데이터베이스가 비동기적으로 로드됩니다. `system.asynchronous_loader` 테이블과 `tables_loader_background_pool_size`, `tables_loader_foreground_pool_size` 서버 설정을 참조하십시오. 아직 로드되지 않은 시스템 테이블에 접근하려는 모든 쿼리는 해당 테이블이 시작될 때까지 기다립니다. 적어도 하나의 쿼리가 기다리고 있는 테이블은 더 높은 우선순위로 로드됩니다. 대기 중인 쿼리의 총 개수를 제한하려면 `max_waiting_queries` 설정을 함께 사용하는 것을 고려하십시오.
* `false`로 설정하면, 시스템 데이터베이스가 서버 시작 전에 로드됩니다.

**예시**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s \{#asynchronous_heavy_metrics_update_period_s\}

<SettingsInfoBlock type="UInt32" default_value="120" />부하가 큰 비동기 메트릭을 업데이트하는 주기(초 단위)입니다.

## asynchronous_insert_log \{#asynchronous_insert_log\}

비동기 insert 작업을 로깅하기 위한 [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) 시스템 테이블 설정입니다.

<SystemLogParameters />

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


## asynchronous_metric_log \{#asynchronous_metric_log\}

ClickHouse Cloud 배포에서는 기본적으로 활성화되어 있습니다.

환경에서 기본적으로 이 설정이 활성화되어 있지 않은 경우, ClickHouse 설치 방식에 따라 아래 안내를 따라 설정을 활성화하거나 비활성화할 수 있습니다.

**활성화**

비동기 메트릭 로그 이력 수집 기능 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)을(를) 수동으로 활성화하려면, 다음과 같은 내용을 가진 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` 파일을 생성합니다:

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

`asynchronous_metric_log` 설정을 비활성화하려면 다음 내용을 포함하는 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` 파일을 생성해야 합니다:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics \{#asynchronous_metrics_enable_heavy_metrics\}

<SettingsInfoBlock type="Bool" default_value="0" />부하가 큰 비동기 메트릭의 계산을 활성화합니다.

## asynchronous_metrics_keeper_metrics_only \{#asynchronous_metrics_keeper_metrics_only\}

<SettingsInfoBlock type="Bool" default_value="0" />비동기 메트릭이 Keeper 관련 메트릭만 계산하도록 합니다.

## asynchronous_metrics_update_period_s \{#asynchronous_metrics_update_period_s\}

<SettingsInfoBlock type="UInt32" default_value="1" />비동기 메트릭 업데이트 주기(초)입니다.

## auth_use_forwarded_address \{#auth_use_forwarded_address\}

프록시를 통해 연결된 클라이언트의 인증에 원래 발신 주소를 사용합니다.

:::note
이 설정은 전달된 주소가 쉽게 스푸핑(spoofing)될 수 있으므로 각별한 주의와 함께 사용해야 합니다. 이러한 인증을 허용하는 서버는 직접 접근하지 말고, 신뢰할 수 있는 프록시를 통해서만 접근해야 합니다.
:::

## background_buffer_flush_schedule_pool_size \{#background_buffer_flush_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />백그라운드에서 [Buffer 엔진 테이블](/engines/table-engines/special/buffer)에 대한 플러시(flush) 작업을 수행하는 데 사용되는 스레드의 최대 개수입니다.

## background_common_pool_size \{#background_common_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />백그라운드에서 [*MergeTree-engine](/engines/table-engines/mergetree-family) 테이블에 대한 다양한 작업(주로 가비지 컬렉션)을 수행하는 데 사용되는 스레드의 최대 개수입니다.

## background_distributed_schedule_pool_size \{#background_distributed_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />분산 전송을 실행하는 데 사용되는 최대 스레드 수입니다.

## background_fetches_pool_size \{#background_fetches_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />백그라운드에서 [*MergeTree-engine](/engines/table-engines/mergetree-family) 테이블의 다른 레플리카로부터 데이터 파트를 가져오는 데 사용되는 최대 스레드 수입니다.

## background_merges_mutations_concurrency_ratio \{#background_merges_mutations_concurrency_ratio\}

<SettingsInfoBlock type="Float" default_value="2" />

동시에 실행할 수 있는 백그라운드 머지와 뮤테이션 수와 스레드 수 간의 비율을 설정합니다.

예를 들어, 이 비율이 2이고 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size)가 16으로 설정되어 있으면 ClickHouse는 32개의 백그라운드 머지 작업을 동시에 실행할 수 있습니다. 이는 백그라운드 작업을 일시 중지하거나 연기할 수 있기 때문에 가능합니다. 작은 머지 작업에 더 높은 실행 우선순위를 부여하기 위해 필요합니다.

:::note
이 비율은 런타임에는 높일 수만 있습니다. 값을 낮추려면 서버를 재시작해야 합니다.

[`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 설정과 마찬가지로 [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio)는 하위 호환성을 위해 `default` 프로필에서 적용할 수 있습니다.
:::

## background_merges_mutations_scheduling_policy \{#background_merges_mutations_scheduling_policy\}

<SettingsInfoBlock type="String" default_value="round_robin" />

백그라운드 머지(merge) 및 뮤테이션(mutation)의 스케줄링 방식을 제어하는 정책입니다. 가능한 값은 `round_robin` 및 `shortest_task_first`입니다.

백그라운드 스레드 풀에서 다음에 실행할 머지 또는 뮤테이션을 선택하는 데 사용되는 알고리즘입니다. 이 정책은 서버를 재시작하지 않고 런타임에 변경할 수 있습니다.
하위 호환성을 위해 `default` 프로파일에서 설정하여 적용할 수 있습니다.

사용 가능한 값:

- `round_robin` — 기아(starvation) 없이 동작하도록 모든 동시 머지 및 뮤테이션을 라운드 로빈 방식으로 실행합니다. 더 적은 블록을 머지하기 때문에 작은 머지가 큰 머지보다 더 빠르게 완료됩니다.
- `shortest_task_first` — 항상 더 작은 머지 또는 뮤테이션을 먼저 실행합니다. 머지와 뮤테이션은 결과 크기에 따라 우선순위가 지정됩니다. 크기가 더 작은 머지가 큰 머지보다 항상 우선합니다. 이 정책은 작은 파트의 머지를 가능한 한 빠르게 수행하도록 해 주지만, `INSERT`가 매우 많이 발생하는 파티션에서는 큰 머지가 무기한 기아 상태에 빠질 수 있습니다.

## background_message_broker_schedule_pool_size \{#background_message_broker_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />메시지 스트리밍과 관련된 백그라운드 작업을 실행하는 데 사용되는 최대 스레드 수입니다.

## background_move_pool_size \{#background_move_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />백그라운드에서 *MergeTree 엔진 테이블*의 데이터 파트를 다른 디스크나 볼륨으로 이동하는 데 사용되는 최대 스레드 수입니다.

## background_pool_size \{#background_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

MergeTree 엔진을 사용하는 테이블에서 백그라운드 머지 및 뮤테이션을 수행하는 스레드 개수를 설정합니다.

:::note

* 이 설정은 ClickHouse 서버를 시작할 때, 이전 버전과의 호환성을 위해 `default` 프로파일 구성에서 적용될 수도 있습니다.
* 실행 중에는 스레드 수를 증가시키기만 할 수 있습니다.
* 스레드 수를 줄이려면 서버를 다시 시작해야 합니다.
* 이 설정을 조정하여 CPU 및 디스크 부하를 관리할 수 있습니다.
  :::

:::danger
풀 크기가 작을수록 CPU 및 디스크 리소스 사용량은 줄어들지만, 백그라운드 프로세스가 더 느리게 진행되어 결국 쿼리 성능에 영향을 줄 수 있습니다.
:::

이 값을 변경하기 전에 다음과 같은 관련 MergeTree 설정도 함께 검토하십시오.

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**예시**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_log \{#background_schedule_pool_log\}

여러 백그라운드 풀을 통해 실행되는 모든 백그라운드 작업에 대한 정보를 포함합니다.

```xml
<background_schedule_pool_log>
    <database>system</database>
    <table>background_schedule_pool_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <!-- Only tasks longer than duration_threshold_milliseconds will be logged. Zero means log everything -->
    <duration_threshold_milliseconds>0</duration_threshold_milliseconds>
</background_schedule_pool_log>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio \{#background_schedule_pool_max_parallel_tasks_per_type_ratio\}

<SettingsInfoBlock type="Float" default_value="0.8" />동일한 유형의 작업을 동시에 실행할 수 있는 풀 내 스레드의 최대 비율입니다.

## background_schedule_pool_size \{#background_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="512" />복제된 테이블(Replicated Table), Kafka 스트리밍, DNS 캐시 업데이트와 같은 경량 주기 작업을 지속적으로 실행하는 데 사용되는 스레드의 최대 개수입니다.

## backup_log \{#backup_log\}

`BACKUP` 및 `RESTORE` 작업을 로깅하기 위한 [backup&#95;log](../../operations/system-tables/backup_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

**예**

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


## backup_threads \{#backup_threads\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />`BACKUP` 요청을 실행하는 최대 스레드 수입니다.

## backups \{#backups\}

[`BACKUP` 및 `RESTORE`](/operations/backup/overview) SQL 문을 실행할 때 사용되는 백업 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다.

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','동일 호스트에서 여러 백업 작업을 동시에 실행할 수 있는지 여부를 결정합니다.', 'true'),
    ('allow_concurrent_restores', 'Bool', '동일 호스트에서 여러 복구 작업을 동시에 실행할 수 있는지 여부를 결정합니다.', 'true'),
    ('allowed_disk', 'String', '`File()`을 사용할 때 백업에 사용할 디스크입니다. `File`을 사용하려면 이 설정을 반드시 지정해야 합니다.', ''),
    ('allowed_path', 'String', '`File()`을 사용할 때 백업에 사용할 경로입니다. `File`을 사용하려면 이 설정을 반드시 지정해야 합니다.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '수집한 메타데이터를 비교한 후 불일치가 있는 경우, 대기 상태로 들어가기 전에 메타데이터 수집을 시도하는 횟수입니다.', '2'),
    ('collect_metadata_timeout', 'UInt64', '백업 중 메타데이터를 수집할 때의 타임아웃(밀리초)입니다.', '600000'),
    ('compare_collected_metadata', 'Bool', 'true인 경우, 백업 중 메타데이터가 변경되지 않았는지 확인하기 위해 수집된 메타데이터를 기존 메타데이터와 비교합니다.', 'true'),
    ('create_table_timeout', 'UInt64', '복구 중 테이블을 생성하기 위한 타임아웃(밀리초)입니다.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '조정된 백업/복구 작업 중 잘못된 버전 오류가 발생한 후 재시도할 수 있는 최대 횟수입니다.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '다음 메타데이터 수집을 다시 시도하기 전까지의 최대 대기 시간(밀리초)입니다.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '다음 메타데이터 수집을 다시 시도하기 전까지의 최소 대기 시간(밀리초)입니다.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '`BACKUP` 명령이 실패하면 ClickHouse는 실패 이전에 백업으로 이미 복사된 파일을 제거하려고 시도하며, 그렇지 않으면 복사된 파일을 그대로 남겨 둡니다.', 'true'),
    ('sync_period_ms', 'UInt64', '조정된 백업/복구 작업을 위한 동기화 주기(밀리초)입니다.', '5000'),
    ('test_inject_sleep', 'Bool', '테스트를 위해 지연(sleep)을 삽입할지 여부입니다.', 'false'),
    ('test_randomize_order', 'Bool', 'true인 경우, 테스트 목적을 위해 특정 작업의 실행 순서를 임의로 변경합니다.', 'false'),
    ('zookeeper_path', 'String', '`ON CLUSTER` 절을 사용할 때, 백업 및 복구 메타데이터가 저장되는 ZooKeeper 경로입니다.', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                                               | Default               |
| :-------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 동일한 호스트에서 여러 백업 작업을 동시에 실행할 수 있는지 여부를 결정합니다.                                              | `true`                |
| `allow_concurrent_restores`                         | Bool   | 동일한 호스트에서 여러 복원 작업을 동시에 실행할 수 있는지 여부를 결정합니다.                                              | `true`                |
| `allowed_disk`                                      | String | `File()`을 사용할 때 백업을 저장할 디스크입니다. 이 설정은 `File`을 사용하려면 반드시 지정해야 합니다.                         | ``                    |
| `allowed_path`                                      | String | `File()`을 사용할 때 백업을 저장할 경로입니다. 이 설정은 `File`을 사용하려면 반드시 지정해야 합니다.                          | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 수집된 메타데이터를 비교했을 때 불일치가 있는 경우, 대기(sleep)에 들어가기 전에 메타데이터 수집을 재시도하는 횟수입니다.                   | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | 백업 중 메타데이터를 수집하기 위한 타임아웃(밀리초)입니다.                                                         | `600000`              |
| `compare_collected_metadata`                        | Bool   | `true`이면, 백업 중 메타데이터가 변경되지 않았는지 확인하기 위해 수집된 메타데이터를 기존 메타데이터와 비교합니다.                       | `true`                |
| `create_table_timeout`                              | UInt64 | 복원 중 테이블을 생성하기 위한 타임아웃(밀리초)입니다.                                                           | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | coordinated 백업/복원 중 잘못된 버전 오류가 발생한 후 재시도할 수 있는 최대 횟수입니다.                                  | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 메타데이터 수집을 다시 시도하기 전까지의 최대 대기 시간(밀리초)입니다.                                                  | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 메타데이터 수집을 다시 시도하기 전까지의 최소 대기 시간(밀리초)입니다.                                                  | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | `BACKUP` 명령이 실패하면 ClickHouse는 실패 이전에 백업으로 이미 복사된 파일을 제거하려고 시도하며, 그렇지 않으면 복사된 파일을 그대로 둡니다. | `true`                |
| `sync_period_ms`                                    | UInt64 | coordinated 백업/복원을 위한 동기화 주기(밀리초)입니다.                                                     | `5000`                |
| `test_inject_sleep`                                 | Bool   | 테스트를 위해 대기(sleep)를 삽입하는 데 사용됩니다.                                                          | `false`               |
| `test_randomize_order`                              | Bool   | `true`이면, 테스트 목적을 위해 특정 작업의 실행 순서를 무작위로 변경합니다.                                            | `false`               |
| `zookeeper_path`                                    | String | `ON CLUSTER` 절을 사용할 때 백업 및 복원 메타데이터가 저장되는 ZooKeeper 상의 경로입니다.                             | `/clickhouse/backups` |

이 설정은 기본적으로 다음과 같이 구성됩니다.

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size \{#backups_io_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Backups IO Thread 풀에 스케줄링할 수 있는 작업 수의 최대값입니다. 현재 S3 백업 로직으로 인해 이 큐에는 제한을 두지 않고 설정할 것을 권장합니다.

:::note
`0`(기본값)은 무제한을 의미합니다.
:::

## bcrypt_workfactor \{#bcrypt_workfactor\}

[Bcrypt 알고리즘](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)을 사용하는 `bcrypt_password` 인증 유형에서 사용하는 워크 팩터입니다.
워크 팩터는 해시를 계산하고 비밀번호를 검증하는 데 필요한 연산량과 시간을 결정합니다.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
인증 요청이 매우 빈번한 애플리케이션에서는,
높은 work factor 설정으로 인한 bcrypt의 연산 오버헤드를 고려하여
다른 인증 방식을 검토하십시오.
:::


## blob_storage_log \{#blob_storage_log\}

[`blob_storage_log`](../system-tables/blob_storage_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

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


## builtin_dictionaries_reload_interval \{#builtin_dictionaries_reload_interval\}

내장 사전을 다시 로드하기까지의 간격(초)입니다.

ClickHouse는 내장 사전을 x초마다 다시 로드합니다. 이를 통해 서버를 재시작하지 않고도 내장 사전을 「실시간으로」 수정할 수 있습니다.

**예제**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio \{#cache_size_to_ram_max_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />캐시 크기를 RAM 최대 용량 대비 비율로 설정합니다. 메모리 용량이 작은 시스템에서 캐시 크기를 더 낮게 설정할 수 있습니다.

## cannot_allocate_thread_fault_injection_probability \{#cannot_allocate_thread_fault_injection_probability\}

<SettingsInfoBlock type="Double" default_value="0" />테스트 목적으로 사용됩니다.

## cgroups_memory_usage_observer_wait_time \{#cgroups_memory_usage_observer_wait_time\}

<SettingsInfoBlock type="UInt64" default_value="15" />

서버에서 허용되는 최대 메모리 사용량을 cgroups의 해당 임계값에 맞추어 조정하는 기간(초)입니다.

cgroup observer를 비활성화하려면 이 값을 `0`으로 설정하십시오.

## compiled_expression_cache_elements_size \{#compiled_expression_cache_elements_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />[compiled expressions](../../operations/caches.md)에 대한 캐시 크기(요소 수 기준)를 설정합니다.

## compiled_expression_cache_size \{#compiled_expression_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />[compiled expressions](../../operations/caches.md)에 대한 캐시의 크기(바이트 단위)를 설정합니다.

## compression \{#compression\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 엔진 테이블에 대한 데이터 압축 설정입니다.

:::note
ClickHouse 사용을 막 시작했다면 이 설정은 변경하지 않기를 권장합니다.
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

* `min_part_size` – 데이터 파트의 최소 크기.
* `min_part_size_ratio` – 데이터 파트 크기와 테이블 크기의 비율.
* `method` – 압축 방식. 허용 값: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
* `level` – 압축 레벨. [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)를 참조하십시오.

:::note
여러 개의 `<case>` 섹션을 구성할 수 있습니다.
:::

**조건이 충족될 때의 동작**:

* 데이터 파트가 조건 집합과 일치하면 ClickHouse는 지정된 압축 방식을 사용합니다.
* 데이터 파트가 여러 조건 집합과 일치하면 ClickHouse는 처음으로 일치한 조건 집합을 사용합니다.

:::note
데이터 파트가 어떤 조건도 충족하지 않으면 ClickHouse는 `lz4` 압축을 사용합니다.
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


## concurrent_threads_scheduler \{#concurrent_threads_scheduler\}

<SettingsInfoBlock type="String" default_value="max_min_fair" />

`concurrent_threads_soft_limit_num` 및 `concurrent_threads_soft_limit_ratio_to_cores`로 지정된 CPU 슬롯 스케줄링 방식을 정의합니다. 제한된 개수의 CPU 슬롯을 동시에 실행 중인 쿼리 사이에 어떻게 분배할지 제어하는 알고리즘입니다. 서버를 재시작하지 않고도 런타임에 스케줄러를 변경할 수 있습니다.

가능한 값:

- `round_robin` — `use_concurrency_control` 설정이 1인 모든 쿼리는 최대 `max_threads`개의 CPU 슬롯을 할당합니다. 스레드당 슬롯은 1개입니다. 경합이 발생하면 CPU 슬롯은 라운드 로빈 방식으로 쿼리에 부여됩니다. 첫 번째 슬롯은 조건 없이 부여된다는 점에 유의해야 하며, 이로 인해 `max_threads` 값이 큰 쿼리가, `max_threads` = 1인 다수의 쿼리가 존재하는 상황에서 공정성이 떨어지고 지연 시간이 증가할 수 있습니다.
- `fair_round_robin` — `use_concurrency_control` 설정이 1인 모든 쿼리는 최대 `max_threads - 1`개의 CPU 슬롯을 할당합니다. 모든 쿼리의 첫 번째 스레드에 대해 CPU 슬롯을 요구하지 않는 `round_robin`의 변형입니다. 이렇게 하면 `max_threads` = 1인 쿼리는 슬롯을 전혀 요구하지 않으며, 모든 슬롯을 불공정하게 점유할 수 없습니다. 어떤 슬롯도 무조건적으로 부여되지 않습니다.
- `max_min_fair` — `use_concurrency_control` 설정이 1인 모든 쿼리는 최대 `max_threads - 1`개의 CPU 슬롯을 할당합니다. `fair_round_robin`과 유사하지만, 해제된 슬롯은 항상 현재 할당된 슬롯 수가 최소인 쿼리에 부여됩니다. 이는 많은 쿼리가 제한된 CPU 슬롯을 두고 경쟁하는 높은 과할당 상황에서 공정성을 더 잘 보장합니다. 단시간 실행 쿼리는 시간이 지남에 따라 더 많은 슬롯을 축적한 장시간 실행 쿼리로 인해 불이익을 받지 않습니다.

## concurrent_threads_soft_limit_num \{#concurrent_threads_soft_limit_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />

원격 서버에서 데이터를 가져오는 스레드를 제외하고, 모든 쿼리를 합산하여 동시에 실행할 수 있는 쿼리 처리 스레드 수의 최대값입니다. 이는 하드 제한이 아닙니다. 한도에 도달하더라도 쿼리는 최소한 하나의 스레드를 배정받아 실행됩니다. 더 많은 스레드를 사용할 수 있게 되면, 실행 중에 쿼리가 필요한 스레드 수까지 확장될 수 있습니다.

:::note
값이 `0`(기본값)이면 제한이 없음을 의미합니다.
:::

## concurrent_threads_soft_limit_ratio_to_cores \{#concurrent_threads_soft_limit_ratio_to_cores\}

<SettingsInfoBlock type="UInt64" default_value="0" />[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num)와 동일하지만, 값이 코어 수에 대한 비율로 지정됩니다.

## config-file \{#config-file\}

<SettingsInfoBlock type="String" default_value="config.xml" />서버 구성 파일을 가리킵니다.

## config_reload_interval_ms \{#config_reload_interval_ms\}

<SettingsInfoBlock type="UInt64" default_value="2000" />

ClickHouse가 설정을 다시 로드하고 새로운 변경 사항을 확인하는 간격(밀리초 단위)입니다.

## core_dump \{#core_dump\}

코어 덤프 파일 크기에 대한 소프트 제한을 설정합니다.

:::note
하드 제한은 시스템 도구를 통해 설정됩니다.
:::

**예제**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## cpu_slot_preemption \{#cpu_slot_preemption\}

<SettingsInfoBlock type="Bool" default_value="1" />

CPU 리소스(MASTER THREAD 및 WORKER THREAD)에 대한 워크로드 스케줄링 방식이 어떻게 동작하는지 정의합니다.

* `true`(기본값)인 경우, 실제로 소비된 CPU 시간을 기준으로 사용량을 산정합니다. 경쟁하는 워크로드에 공정한 수준의 CPU 시간이 할당됩니다. 슬롯은 제한된 시간 동안만 할당되며, 만료 후 다시 요청합니다. CPU 리소스가 과부하 상태일 때 슬롯 요청이 스레드 실행을 차단할 수 있으며, 즉 선점이 발생할 수 있습니다. 이는 CPU 시간의 공정성을 보장합니다.
* `false`인 경우, 할당된 CPU 슬롯 수를 기준으로 사용량을 산정합니다. 경쟁하는 워크로드에 공정한 수의 CPU 슬롯이 할당됩니다. 슬롯은 스레드가 시작될 때 할당되고, 스레드 실행이 끝날 때까지 계속 유지되며 그 시점에 해제됩니다. 쿼리 실행에 할당되는 스레드 수는 1에서 `max_threads`까지 증가할 수만 있고 감소하지는 않습니다. 이는 장시간 실행되는 쿼리에 더 유리하며, 짧은 쿼리에서 CPU 자원 기아 현상(CPU starvation)이 발생할 수 있습니다.

**예제**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**함께 보기**

* [워크로드 스케줄링](/operations/workload-scheduling.md)


## cpu_slot_preemption_timeout_ms \{#cpu_slot_preemption_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

선점(preemption) 동안, 즉 다른 CPU 슬롯이 부여되기를 기다리는 동안 워커 스레드가 몇 밀리초 동안 대기할 수 있는지를 정의합니다. 이 타임아웃이 지나도 스레드가 새로운 CPU 슬롯을 확보하지 못하면 종료되며, 쿼리는 동시에 실행되는 스레드 수를 더 적은 값으로 동적으로 축소합니다. 마스터 스레드는 다운스케일되지 않지만, 무기한 선점될 수 있다는 점에 유의해야 합니다. `cpu_slot_preemption`이 활성화되어 있고 WORKER THREAD에 CPU 리소스가 정의되어 있을 때에만 의미가 있습니다.

**예시**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**관련 문서**

* [워크로드 스케줄링](/operations/workload-scheduling.md)


## cpu_slot_quantum_ns \{#cpu_slot_quantum_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

스레드가 CPU 슬롯을 획득한 후, 또 다른 CPU 슬롯을 요청하기 전에 사용할 수 있는 CPU 나노초 수를 정의합니다. `cpu_slot_preemption`이 활성화되어 있고 MASTER THREAD 또는 WORKER THREAD에 대해 CPU 리소스가 정의된 경우에만 의미가 있습니다.

**예제**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**함께 보기**

* [워크로드 스케줄링](/operations/workload-scheduling.md)


## crash_log \{#crash_log\}

[crash&#95;log](../../operations/system-tables/crash_log.md) 시스템 테이블 동작을 위한 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| Setting                            | Description                                                                                                                              | Default             | Note                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| `buffer_size_rows_flush_threshold` | 행 개수에 대한 임계값입니다. 이 임계값에 도달하면 백그라운드에서 디스크로 로그를 플러시합니다.                                                                                    | `max_size_rows / 2` |                                                                                     |
| `database`                         | 데이터베이스 이름입니다.                                                                                                                            |                     |                                                                                     |
| `engine`                           | 시스템 테이블에 대한 [MergeTree Engine Definition](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)입니다. |                     | `partition_by` 또는 `order_by`가 정의된 경우 사용할 수 없습니다. 지정하지 않으면 기본적으로 `MergeTree`가 선택됩니다. |
| `flush_interval_milliseconds`      | 메모리 버퍼에서 테이블로 데이터를 플러시하는 간격(밀리초)입니다.                                                                                                     | `7500`              |                                                                                     |
| `flush_on_crash`                   | 크래시가 발생한 경우 로그를 디스크에 덤프할지 여부를 설정합니다.                                                                                                     | `false`             |                                                                                     |
| `max_size_rows`                    | 로그의 최대 크기(행 수 기준)입니다. 플러시되지 않은 로그의 개수가 `max_size_rows`에 도달하면 로그를 디스크에 덤프합니다.                                                             | `1024`              |                                                                                     |
| `order_by`                         | 시스템 테이블에 대한 [사용자 지정 정렬 키](/engines/table-engines/mergetree-family/mergetree#order_by)입니다. `engine`이 정의된 경우 사용할 수 없습니다.                   |                     | 시스템 테이블에 `engine`이 지정된 경우 `order_by` 파라미터는 &#39;engine&#39; 내부에 직접 지정해야 합니다.        |
| `partition_by`                     | 시스템 테이블에 대한 [사용자 지정 파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key.md)입니다.                                      |                     | 시스템 테이블에 `engine`이 지정된 경우 `partition_by` 파라미터는 &#39;engine&#39; 내부에 직접 지정해야 합니다.    |
| `reserved_size_rows`               | 로그를 위한 사전 할당 메모리 크기(행 수 기준)입니다.                                                                                                          | `1024`              |                                                                                     |
| `settings`                         | MergeTree 동작을 제어하는 [추가 파라미터](/engines/table-engines/mergetree-family/mergetree/#settings)입니다(선택 사항).                                     |                     | 시스템 테이블에 `engine`이 지정된 경우 `settings` 파라미터는 &#39;engine&#39; 내부에 직접 지정해야 합니다.        |
| `storage_policy`                   | 테이블에 사용할 스토리지 정책 이름입니다(선택 사항).                                                                                                           |                     | 시스템 테이블에 `engine`이 지정된 경우 `storage_policy` 파라미터는 &#39;engine&#39; 내부에 직접 지정해야 합니다.  |
| `table`                            | 시스템 테이블 이름입니다.                                                                                                                           |                     |                                                                                     |
| `ttl`                              | 테이블 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)을 지정합니다.                                          |                     | 시스템 테이블에 `engine`이 지정된 경우 `ttl` 파라미터는 &#39;engine&#39; 내부에 직접 지정해야 합니다.             |

기본 서버 설정 파일 `config.xml`에는 다음 설정 섹션이 포함됩니다:

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


## custom_cached_disks_base_directory \{#custom_cached_disks_base_directory\}

이 설정은 커스텀(SQL에서 생성된) 캐시 디스크의 캐시 경로를 지정합니다.
`custom_cached_disks_base_directory`는 커스텀 디스크에 대해 `filesystem_caches_path`( `filesystem_caches_path.xml`에 정의됨)보다 더 높은 우선순위를 가지며,
전자가 설정되어 있지 않은 경우에만 후자가 사용됩니다.
파일 시스템 캐시 설정 경로는 반드시 해당 디렉터리 내부에 위치해야 하며,
그렇지 않으면 디스크 생성을 막기 위해 예외가 발생합니다.

:::note
이는 서버를 업그레이드하기 이전 버전에서 생성된 디스크에는 영향을 주지 않습니다.
이 경우 서버가 정상적으로 시작될 수 있도록 예외가 발생하지 않습니다.
:::

예:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom_settings_prefixes \{#custom_settings_prefixes\}

[사용자 정의 설정](/operations/settings/query-level#custom_settings)에 사용할 접두사(prefix) 목록입니다. 접두사는 쉼표로 구분합니다.

**예시**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**함께 보기**

* [사용자 정의 설정](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec \{#database_atomic_delay_before_drop_table_sec\}

<SettingsInfoBlock type="UInt64" default_value="480" />

삭제된 테이블을 [`UNDROP`](/sql-reference/statements/undrop.md) SQL 문을 사용하여 복원할 수 있도록 유지하는 지연 기간입니다. `DROP TABLE`이 `SYNC` 수정자와 함께 실행된 경우 이 설정은 무시됩니다.
이 설정의 기본값은 `480`(8분)입니다.

## database_catalog_drop_error_cooldown_sec \{#database_catalog_drop_error_cooldown_sec\}

<SettingsInfoBlock type="UInt64" default_value="5" />테이블 삭제가 실패한 경우 ClickHouse는 작업을 다시 시도하기 전에 이 시간 제한 동안 대기합니다.

## database_catalog_drop_table_concurrency \{#database_catalog_drop_table_concurrency\}

<SettingsInfoBlock type="UInt64" default_value="16" />테이블을 삭제할 때 사용되는 스레드 풀의 크기입니다.

## database_catalog_unused_dir_cleanup_period_sec \{#database_catalog_unused_dir_cleanup_period_sec\}

<SettingsInfoBlock type="UInt64" default_value="86400" />

`store/` 디렉터리에서 불필요한 데이터를 정리하는 작업의 매개변수입니다.  
작업의 실행 간격을 설정합니다.

:::note
값이 `0`이면 「절대 실행하지 않음」을 의미합니다. 기본값은 1일에 해당합니다.
:::

## database_catalog_unused_dir_hide_timeout_sec \{#database_catalog_unused_dir_hide_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

`store/` 디렉터리에서 불필요한 데이터를 정리하는 작업의 매개변수입니다.
어떤 하위 디렉터리가 ClickHouse 서버에서 사용되지 않고, 이 디렉터리가 마지막
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 초 동안 수정되지 않은 경우, 작업은 이 디렉터리의 모든 접근 권한을 제거하여
디렉터리를 "숨깁니다". 이는 ClickHouse 서버가 `store/` 내부에 존재할 것으로 예상하지 않는 디렉터리에 대해서도 작동합니다.

:::note
값이 `0`이면 「즉시」를 의미합니다.
:::

## database_catalog_unused_dir_rm_timeout_sec \{#database_catalog_unused_dir_rm_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

`store/` 디렉터리에서 불필요한 데이터(가비지)를 정리하는 작업의 매개변수입니다.
어떤 하위 디렉터리가 clickhouse-server에서 사용되지 않고 이전에 "숨김" 상태였으며
([database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 참고),
그리고 이 디렉터리가 지난 [`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec)초 동안 변경되지 않았다면, 해당 작업은 이 디렉터리를 제거합니다.
또한 clickhouse-server가 `store/` 내부에 존재할 것으로 예상하지 않는 디렉터리에 대해서도 동작합니다.

:::note
값이 `0`이면 「절대 삭제하지 않음」을 의미합니다. 기본값은 30일에 해당합니다.
:::

## database_replicated_allow_detach_permanently \{#database_replicated_allow_detach_permanently\}

<SettingsInfoBlock type="Bool" default_value="1" />Replicated 데이터베이스에서 테이블을 영구적으로 분리하는 것을 허용합니다

## database_replicated_drop_broken_tables \{#database_replicated_drop_broken_tables\}

<SettingsInfoBlock type="Bool" default_value="0" />예기치 않은 테이블을 별도의 로컬 데이터베이스로 이동하는 대신 Replicated 데이터베이스에서 삭제합니다

## dead_letter_queue \{#dead_letter_queue\}

&#39;dead&#95;letter&#95;queue&#39; 시스템 테이블 설정입니다.

<SystemLogParameters />

기본 설정은 다음과 같습니다.

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```


## default_database \{#default_database\}

<SettingsInfoBlock type="String" default_value="default" />기본 데이터베이스의 이름입니다.

## default_password_type \{#default_password_type\}

`CREATE USER u IDENTIFIED BY 'p'`와 같은 쿼리에서 기본으로 사용될 비밀번호 유형을 설정합니다.

허용되는 값은 다음과 같습니다:

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default_profile \{#default_profile\}

기본 설정 프로필입니다. 설정 프로필은 `user_config` 설정에서 지정한 파일에 정의됩니다.

**예시**

```xml
<default_profile>default</default_profile>
```


## default_replica_name \{#default_replica_name\}

<SettingsInfoBlock type="String" default_value="{replica}" />

ZooKeeper에 있는 레플리카 이름입니다.

**예시**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default_replica_path \{#default_replica_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />

ZooKeeper에 있는 테이블 경로입니다.

**예**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default_session_timeout \{#default_session_timeout\}

기본 세션 타임아웃 시간(초)입니다.

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries_config \{#dictionaries_config\}

딕셔너리 설정 파일의 경로입니다.

경로:

* 절대 경로이거나 서버 설정 파일에 대한 상대 경로를 지정합니다.
* 경로에는 와일드카드 * 및 ?를 포함할 수 있습니다.

참고:

* &quot;[Dictionaries](../../sql-reference/statements/create/dictionary/index.md)&quot;.

**예시**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries_lazy_load \{#dictionaries_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

딕셔너리의 지연 로딩을 설정합니다.

* `true`이면 각 딕셔너리는 처음 사용될 때 로드됩니다. 로드에 실패하면 해당 딕셔너리를 사용한 함수가 예외를 발생시킵니다.
* `false`이면 서버는 시작 시 모든 딕셔너리를 로드합니다.

:::note
서버는 어떤 연결도 받기 전에 시작 시 모든 딕셔너리의 로딩이 완료될 때까지 대기합니다
(예외: [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup)이 `false`로 설정된 경우).
:::

**예시**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionaries_lib_path \{#dictionaries_lib_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/dictionaries_lib/" />

사전 라이브러리가 위치한 디렉터리입니다.

**예시**

```xml
<dictionaries_lib_path>/var/lib/clickhouse/dictionaries_lib/</dictionaries_lib_path>
```


## dictionary_background_reconnect_interval \{#dictionary_background_reconnect_interval\}

<SettingsInfoBlock type="UInt64" default_value="1000" />`background_reconnect`가 활성화된 MySQL 및 Postgres 딕셔너리에서 연결 실패 시 재연결을 시도하는 간격(밀리초 단위)입니다.

## disable_insertion_and_mutation \{#disable_insertion_and_mutation\}

<SettingsInfoBlock type="Bool" default_value="0" />

INSERT/ALTER/DELETE 쿼리를 비활성화합니다. 이 설정은 읽기 전용 노드가 필요하여 INSERT 및 mutation 작업이 읽기 성능에 영향을 주지 않도록 해야 하는 경우 활성화됩니다. 이 설정과 관계없이 S3, DataLake, MySQL, PostgreSQL, Kafka 등의 외부 엔진으로의 INSERT는 허용됩니다.

## disable_internal_dns_cache \{#disable_internal_dns_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />내부 DNS 캐시를 비활성화합니다. Kubernetes와 같이 인프라가 자주 변경되는 시스템에서 ClickHouse를 운영하는 경우에 권장됩니다.

## disable_tunneling_for_https_requests_over_http_proxy \{#disable_tunneling_for_https_requests_over_http_proxy\}

기본적으로 `HTTP` 프록시를 통해 `HTTPS` 요청을 보낼 때 터널링(즉, `HTTP CONNECT`)이 사용됩니다. 이 설정을 사용하여 터널링을 비활성화할 수 있습니다.

**no&#95;proxy**

기본적으로 모든 요청은 프록시를 거칩니다. 특정 호스트에 대해서 프록시를 사용하지 않으려면 `no_proxy` 변수를 설정해야 합니다.
목록 및 원격 리졸버(list and remote resolver)의 경우 `<proxy>` 절 안에서, 환경 리졸버(environment resolver)의 경우 환경 변수로 설정할 수 있습니다.
IP 주소, 도메인, 서브도메인과 완전한 우회를 위한 `'*'` 와일드카드가 지원됩니다. curl과 마찬가지로 맨 앞의 점 문자는 제거됩니다.

**예시**

아래 설정은 `clickhouse.cloud` 및 그 모든 서브도메인(예: `auth.clickhouse.cloud`)에 대한 프록시 사용을 우회합니다.
GitLab의 경우에도 도메인 앞에 점이 붙어 있지만 동일하게 적용됩니다. `gitlab.com`과 `about.gitlab.com` 모두 프록시를 우회합니다.

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


## disk_connections_hard_limit \{#disk_connections_hard_limit\}

<SettingsInfoBlock type="UInt64" default_value="200000" />이 제한에 도달하면 생성을 시도할 때 예외가 발생합니다. 하드 제한을 비활성화하려면 0으로 설정하십시오. 이 제한은 디스크 연결에 적용됩니다.

## disk_connections_soft_limit \{#disk_connections_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="5000" />이 한도를 초과하는 연결은 TTL(time to live)이 크게 더 짧아집니다. 이 한도는 디스크 연결에 적용됩니다.

## disk_connections_store_limit \{#disk_connections_store_limit\}

<SettingsInfoBlock type="UInt64" default_value="10000" />이 한도를 넘는 연결은 사용 후 재설정됩니다. 연결 캐시 기능을 끄려면 0으로 설정하십시오. 이 한도는 디스크 연결에 적용됩니다.

## disk_connections_warn_limit \{#disk_connections_warn_limit\}

<SettingsInfoBlock type="UInt64" default_value="8000" />사용 중인 연결 수가 이 한도를 초과하면 경고 메시지가 로그에 기록됩니다. 이 한도는 디스크 연결에 적용됩니다.

## display_secrets_in_show_and_select \{#display_secrets_in_show_and_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

테이블, 데이터베이스, 테이블 함수, 딕셔너리에 대한 `SHOW` 및 `SELECT` 쿼리에서 시크릿을 표시할지 여부를 제어합니다.

시크릿을 조회하려는 사용자는
[`format_display_secrets_in_show_and_select` 포맷 설정](../settings/formats#format_display_secrets_in_show_and_select)을
활성화해야 하며,
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 권한도 가지고 있어야 합니다.

가능한 값:

- `0` — 비활성화됨.
- `1` — 활성화됨.

## distributed_cache_apply_throttling_settings_from_client \{#distributed_cache_apply_throttling_settings_from_client\}

<SettingsInfoBlock type="Bool" default_value="1" />캐시 서버가 클라이언트로부터 수신한 쓰로틀링(throttling) 설정을 적용할지 여부입니다.

## distributed_cache_keep_up_free_connections_ratio \{#distributed_cache_keep_up_free_connections_ratio\}

<SettingsInfoBlock type="Float" default_value="0.1" />분산 캐시가 사용 가능한 상태로 유지하려고 시도하는 유휴 연결(free connections) 수에 대한 소프트 한도입니다. 사용 가능한 연결 수가 distributed_cache_keep_up_free_connections_ratio * max_connections 값보다 작아지면, 해당 수가 한도보다 다시 커질 때까지 가장 오래전에 활동이 있었던 연결부터 순차적으로 종료합니다.

## distributed_ddl \{#distributed_ddl\}

클러스터에서 [분산 DDL 쿼리](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) 실행을 관리합니다.
[ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper)가 활성화된 경우에만 동작합니다.

`<distributed_ddl>` 내에서 구성 가능한 설정은 다음과 같습니다:

| Setting                | Description                                                                 | Default Value                      |
| ---------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| `cleanup_delay_period` | 마지막 정리 작업이 수행된 후 `cleanup_delay_period`초가 지난 상태에서 새 노드 이벤트를 수신하면 정리를 시작합니다. | `60`초                              |
| `max_tasks_in_queue`   | 대기열에 존재할 수 있는 작업의 최대 개수입니다.                                                 | `1,000`                            |
| `path`                 | DDL 쿼리를 위한 `task_queue`가 위치하는 Keeper 내 경로입니다.                               |                                    |
| `pool_size`            | 동시에 실행할 수 있는 `ON CLUSTER` 쿼리 수입니다.                                          |                                    |
| `profile`              | DDL 쿼리를 실행하는 데 사용되는 프로필입니다.                                                 |                                    |
| `task_max_lifetime`    | 노드의 수명이 이 값보다 길면 노드를 삭제합니다.                                                 | `7 * 24 * 60 * 60` (초 단위로 환산한 1주일) |

**Example**

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


## distributed_ddl.cleanup_delay_period \{#distributed_ddl.cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="60" />새로운 노드 이벤트가 수신된 후, 마지막 정리가 현재 시점으로부터 `<cleanup_delay_period>`초 이내에 수행된 것이 아니라면 정리가 시작됩니다.

## distributed_ddl.max_tasks_in_queue \{#distributed_ddl.max_tasks_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1000" />대기열에 포함될 수 있는 최대 작업 수입니다.

## distributed_ddl.path \{#distributed_ddl.path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/task_queue/ddl/" />DDL 쿼리용 `<task_queue>`가 위치하는 Keeper 경로입니다.

## distributed_ddl.pool_size \{#distributed_ddl.pool_size\}

<SettingsInfoBlock type="Int32" default_value="1" />동시에 실행할 수 있는 `<ON CLUSTER>` 쿼리의 개수

## distributed_ddl.profile \{#distributed_ddl.profile\}

DDL 쿼리 실행에 사용되는 프로필입니다

## distributed_ddl.replicas_path \{#distributed_ddl.replicas_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/task_queue/replicas/" />Keeper에서 레플리카의 `<task_queue>` 가 위치하는 경로입니다.

## distributed_ddl.task_max_lifetime \{#distributed_ddl.task_max_lifetime\}

<SettingsInfoBlock type="UInt64" default_value="604800" />노드가 생성된 후 경과 시간이 이 값보다 크면 노드를 삭제합니다.

## distributed_ddl_use_initial_user_and_roles \{#distributed_ddl_use_initial_user_and_roles\}

<SettingsInfoBlock type="Bool" default_value="0" />이 설정을 활성화하면 ON CLUSTER 쿼리가 실행될 때 원격 세그먼트에서 쿼리를 시작한 사용자와 역할을 그대로 유지하여 사용합니다. 이를 통해 클러스터 전반에서 일관된 액세스 제어가 보장되지만, 모든 노드에 해당 사용자와 역할이 존재해야 합니다.

## dns_allow_resolve_names_to_ipv4 \{#dns_allow_resolve_names_to_ipv4\}

<SettingsInfoBlock type="Bool" default_value="1" />호스트 이름을 IPv4 주소로 조회하도록 허용합니다.

## dns_allow_resolve_names_to_ipv6 \{#dns_allow_resolve_names_to_ipv6\}

<SettingsInfoBlock type="Bool" default_value="1" />호스트 이름을 IPv6 주소로 확인하도록 허용합니다.

## dns_cache_max_entries \{#dns_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="10000" />내부 DNS 캐시에 저장되는 엔트리의 최대 개수입니다.

## dns_cache_update_period \{#dns_cache_update_period\}

<SettingsInfoBlock type="Int32" default_value="15" />초 단위의 내부 DNS 캐시 업데이트 주기입니다.

## dns_max_consecutive_failures \{#dns_max_consecutive_failures\}

<SettingsInfoBlock type="UInt32" default_value="5" />

호스트 이름의 DNS 캐시를 업데이트하려는 시도의 연속 실패 횟수가 이 값에 도달하면, 이후에는 업데이트를 더 이상 시도하지 않습니다. 해당 정보는 DNS 캐시에 그대로 남아 있습니다. 0으로 설정하면 무제한을 의미합니다.

**관련 항목**

- [`SYSTEM DROP DNS CACHE`](../../sql-reference/statements/system#drop-dns-cache)

## drop_distributed_cache_pool_size \{#drop_distributed_cache_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />분산 캐시를 삭제할 때 사용하는 스레드 풀의 크기입니다.

## drop_distributed_cache_queue_size \{#drop_distributed_cache_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />분산 캐시를 삭제하는 데 사용되는 스레드 풀의 큐 크기입니다.

## enable_azure_sdk_logging \{#enable_azure_sdk_logging\}

<SettingsInfoBlock type="Bool" default_value="0" />Azure SDK의 로깅을 활성화합니다

## encryption \{#encryption\}

[encryption codecs](/sql-reference/statements/create/table#encryption-codecs)에 사용할 키를 획득하는 명령을 설정합니다. 키(또는 여러 키)는 환경 변수로 지정하거나 설정 파일에 설정해야 합니다.

키는 길이가 16바이트인 16진수(hex) 또는 문자열이어야 합니다.

**예시**

설정 파일에서 로드:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
구성 파일에 키를 저장하는 것은 권장되지 않습니다. 보안상 취약합니다. 키를 보안 디스크에 있는 별도 구성 파일로 옮긴 다음, 해당 구성 파일에 대한 심볼릭 링크를 `config.d/` 폴더에 둘 수 있습니다.
:::

키가 16진수 형식일 때, 구성 파일에서 로드하기:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

환경 변수에서 키를 불러옵니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

여기서 `current_key_id`는 암호화를 위한 현재 키를 설정하며, 지정된 모든 키는 복호화에 사용할 수 있습니다.

각 방법은 여러 키에 대해 사용할 수 있습니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

여기서 `current_key_id`는 암호화에 사용되는 현재 키를 나타냅니다.

또한 사용자는 길이가 12바이트인 논스를 추가할 수 있습니다(기본적으로 암호화 및 복호화 과정에서는 0바이트로만 구성된 논스를 사용합니다):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

또는 16진수 형식으로 설정할 수 있습니다:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
앞서 언급한 모든 내용은 `aes_256_gcm_siv` 에도 동일하게 적용됩니다 (단, 키는 32바이트 길이여야 합니다).
:::


## error_log \{#error_log\}

기본적으로 비활성화되어 있습니다.

**활성화**

오류 이력 수집 [`system.error_log`](../../operations/system-tables/error_log.md)을 수동으로 활성화하려면, 다음 내용을 포함한 `/etc/clickhouse-server/config.d/error_log.xml` 파일을 생성하십시오:

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

`error_log` 설정을 비활성화하려면 다음 내용을 가진 `/etc/clickhouse-server/config.d/disable_error_log.xml` 파일을 생성해야 합니다:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## filesystem_caches_path \{#filesystem_caches_path\}

이 설정은 캐시 경로를 지정합니다.

**예시**

```xml
<filesystem_caches_path>/var/lib/clickhouse/filesystem_caches/</filesystem_caches_path>
```


## format_parsing_thread_pool_queue_size \{#format_parsing_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

입력 데이터를 파싱하기 위해 thread pool에 예약할 수 있는 작업의 최대 개수입니다.

:::note
값이 `0`이면 제한이 없음을 의미합니다.
:::

## format_schema_path \{#format_schema_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/format_schemas/" />

[CapnProto](/interfaces/formats/CapnProto) 포맷 스키마 등, 입력 데이터에 대한 스키마가 저장된 디렉터리 경로입니다.

**예시**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>/var/lib/clickhouse/format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns \{#global_profiler_cpu_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000000" />글로벌 프로파일러의 CPU 클록 타이머 주기(나노초 단위)입니다. 값을 0으로 설정하면 CPU 클록 글로벌 프로파일러가 비활성화됩니다. 단일 쿼리 프로파일링에는 최소 10000000(초당 100회), 클러스터 전체 프로파일링에는 1000000000(초당 1회) 이상의 값을 권장합니다.

## global_profiler_real_time_period_ns \{#global_profiler_real_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000000" />전역 프로파일러의 실시간(real clock) 타이머 주기(나노초 단위)입니다. 실시간 시계 기반 전역 프로파일러를 끄려면 값을 0으로 설정하십시오. 단일 쿼리 프로파일링에는 최소 10000000(초당 100회), 클러스터 전체 프로파일링에는 1000000000(초당 1회) 이상의 값을 권장합니다.

## google_protos_path \{#google_protos_path\}

<SettingsInfoBlock type="String" default_value="/usr/share/clickhouse/protos/" />

Protobuf 타입에 대한 proto 파일이 들어 있는 디렉터리를 지정합니다.

**예시**

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite \{#graphite\}

[Graphite](https://github.com/graphite-project)에 데이터를 전송합니다.

설정:

* `host` – Graphite 서버 호스트.
* `port` – Graphite 서버 포트.
* `interval` – 전송 간격(초).
* `timeout` – 데이터 전송 타임아웃(초).
* `root_path` – 키에 사용할 접두사.
* `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블에서 데이터 전송.
* `events` – [system.events](/operations/system-tables/events) 테이블에서 지정된 기간 동안 누적된 델타 데이터 전송.
* `events_cumulative` – [system.events](/operations/system-tables/events) 테이블에서 누적 데이터 전송.
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 테이블에서 데이터 전송.

여러 개의 `<graphite>` 절을 구성할 수 있습니다. 예를 들어, 서로 다른 데이터를 서로 다른 간격으로 전송하도록 설정할 수 있습니다.

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


## graphite_rollup \{#graphite_rollup\}

Graphite 데이터 희소화(롤업)를 위한 설정입니다.

자세한 내용은 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)를 참조하십시오.

**예제**

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


## hdfs.libhdfs3_conf \{#hdfs.libhdfs3_conf\}

libhdfs3의 설정 파일이 위치한 올바른 경로를 지정합니다.

## hsts_max_age \{#hsts_max_age\}

HSTS 만료 시간(초 단위)입니다.

:::note
값이 `0`이면 ClickHouse는 HSTS를 비활성화합니다. 양수 값을 설정하면 HSTS가 활성화되고, `max-age`는 설정한 값이 됩니다.
:::

**예시**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_hard_limit \{#http_connections_hard_limit\}

<SettingsInfoBlock type="UInt64" default_value="200000" />이 제한에 도달하면 새로 생성하려는 시도 시 예외가 발생합니다. 하드 제한을 비활성화하려면 0으로 설정하십시오. 이 제한은 디스크나 스토리지에 속하지 않는 http 연결에 적용됩니다.

## http_connections_soft_limit \{#http_connections_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="100" />이 한도를 초과하는 연결은 time to live이 상당히 짧아집니다. 이 한도는 어떤 디스크나 스토리지에도 속하지 않는 HTTP 연결에 적용됩니다.

## http_connections_store_limit \{#http_connections_store_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />이 제한을 초과하는 연결은 사용 후 재설정됩니다. 연결 캐시를 끄려면 값을 0으로 설정합니다. 이 제한은 어느 디스크나 스토리지에도 속하지 않는 HTTP 연결에 적용됩니다.

## http_connections_warn_limit \{#http_connections_warn_limit\}

<SettingsInfoBlock type="UInt64" default_value="500" />현재 사용 중인 연결 수가 이 한도를 초과하면 경고 메시지가 로그에 기록됩니다. 이 한도는 어떤 디스크나 스토리지에도 속하지 않는 HTTP 연결에 적용됩니다.

## http_handlers \{#http_handlers\}

사용자 정의 HTTP 핸들러를 사용할 수 있도록 합니다.
새 http 핸들러를 추가하려면 새 `<rule>`을 추가하면 됩니다.
규칙은 정의된 순서대로 위에서 아래로 검사되며,
처음 일치하는 규칙의 핸들러가 실행됩니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

| Sub-tags             | Definition                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `url`                | 요청 URL을 매칭하기 위한 항목이며, 정규식 매칭을 사용하려면 &#39;regex:&#39; 접두사를 사용할 수 있습니다(선택 사항)                                 |
| `methods`            | 요청 메서드를 매칭하기 위한 항목이며, 여러 메서드를 매칭하려면 쉼표로 구분하여 사용할 수 있습니다(선택 사항)                                              |
| `headers`            | 요청 헤더를 매칭하기 위한 항목이며, 각 하위 요소(하위 요소 이름이 헤더 이름)를 매칭합니다. 정규식 매칭을 사용하려면 &#39;regex:&#39; 접두사를 사용할 수 있습니다(선택 사항) |
| `handler`            | 요청 핸들러                                                                                                      |
| `empty_query_string` | URL에 쿼리 문자열이 없는지 확인합니다                                                                                      |

`handler`는 다음 설정을 포함하며, 하위 태그로 구성할 수 있습니다:

| Sub-tags           | Definition                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | 리디렉션 대상 위치                                                                                                                         |
| `type`             | 지원되는 타입: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                         |
| `status`           | static 타입과 함께 사용하며, 응답 상태 코드를 지정합니다                                                                                                |
| `query_param_name` | dynamic&#95;query&#95;handler 타입과 함께 사용하며, HTTP 요청 파라미터에서 `<query_param_name>` 값에 해당하는 값을 추출하여 실행합니다                               |
| `query`            | predefined&#95;query&#95;handler 타입과 함께 사용하며, 핸들러가 호출될 때 쿼리를 실행합니다                                                                 |
| `content_type`     | static 타입과 함께 사용하며, 응답 콘텐츠 유형(content-type)을 지정합니다                                                                                 |
| `response_content` | static 타입과 함께 사용하며, 클라이언트로 전송할 응답 내용을 지정합니다. &#39;file://&#39; 또는 &#39;config://&#39; 접두사를 사용하는 경우, 파일 또는 설정에서 내용을 찾아 클라이언트로 전송합니다 |

규칙 목록과 함께 `<defaults/>`를 지정하여 모든 기본 핸들러를 활성화하도록 설정할 수 있습니다.

예:

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


## http_options_response \{#http_options_response\}

`OPTIONS` HTTP 요청에 대한 응답에 헤더를 추가하는 데 사용합니다.
`OPTIONS` 메서드는 CORS 프리플라이트(preflight) 요청을 보낼 때 사용됩니다.

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


## http_server_default_response \{#http_server_default_response\}

ClickHouse HTTP(S) 서버에 접속할 때 기본으로 표시되는 페이지입니다.
기본값은 「Ok.」(마지막에 줄 바꿈 문자가 포함됨)입니다.

**예시**

`http://localhost: http_port`에 접속하면 `https://tabix.io/`가 열립니다.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size \{#iceberg_catalog_threadpool_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="50" />Iceberg 카탈로그용 백그라운드 풀 크기입니다.

## iceberg_catalog_threadpool_queue_size \{#iceberg_catalog_threadpool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />iceberg 카탈로그 풀에 추가할 수 있는 작업의 최대 개수

## iceberg_metadata_files_cache_max_entries \{#iceberg_metadata_files_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1000" />항목 수 기준 iceberg 메타데이터 파일 캐시의 최대 크기입니다. 0으로 설정하면 비활성화됩니다.

## iceberg_metadata_files_cache_policy \{#iceberg_metadata_files_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Iceberg 메타데이터 캐시 정책의 이름입니다.

## iceberg_metadata_files_cache_size \{#iceberg_metadata_files_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />iceberg 메타데이터 캐시의 최대 크기(바이트 단위)입니다. 0은 비활성화를 의미합니다.

## iceberg_metadata_files_cache_size_ratio \{#iceberg_metadata_files_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />iceberg 메타데이터 캐시에서 보호 큐(SLRU 정책인 경우)의 크기가 캐시 전체 크기에서 차지하는 비율입니다.

## ignore_empty_sql_security_in_create_view_query \{#ignore_empty_sql_security_in_create_view_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

값이 true인 경우 ClickHouse는 `CREATE VIEW` 쿼리에서 비어 있는 SQL security 구문에 대해 기본값을 기록하지 않습니다.

:::note
이 설정은 마이그레이션 기간에만 필요하며 24.4에서는 더 이상 사용되지 않습니다.
:::

## include_from \{#include_from\}

<SettingsInfoBlock type="String" default_value="/etc/metrika.xml" />

치환 항목이 정의된 파일의 경로입니다. XML과 YAML 형식이 모두 지원됩니다.

자세한 내용은 [설정 파일](/operations/configuration-files) 섹션을 참조하십시오.

**예시**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy \{#index_mark_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />세컨더리 인덱스 마크 캐시에 사용되는 정책 이름입니다.

## index_mark_cache_size \{#index_mark_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

인덱스 마크 캐시의 최대 크기입니다.

:::note

값이 `0`이면 비활성화됨을 의미합니다.

이 설정은 런타임에 변경할 수 있으며 즉시 적용됩니다.
:::

## index_mark_cache_size_ratio \{#index_mark_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.3" />보조 인덱스 마크 캐시에서 SLRU 정책을 사용할 때, 보호 큐의 크기를 캐시 전체 크기 대비 비율로 지정합니다.

## index_uncompressed_cache_policy \{#index_uncompressed_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />보조 인덱스의 비압축 캐시 정책 이름입니다.

## index_uncompressed_cache_size \{#index_uncompressed_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

압축되지 않은 `MergeTree` 인덱스 블록 캐시의 최대 크기입니다.

:::note
값이 `0`이면 비활성화됨을 의미합니다.

이 설정은 실행 중에도 변경할 수 있으며, 변경 즉시 적용됩니다.
:::

## index_uncompressed_cache_size_ratio \{#index_uncompressed_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />SLRU 정책을 사용하는 경우, 보조 인덱스 비압축 캐시에서 보호 큐의 크기를 캐시 전체 크기에 대한 비율로 지정합니다.

## insert_deduplication_version \{#insert_deduplication_version\}

<SettingsInfoBlock type="InsertDeduplicationVersions" default_value="compatible_double_hashes" />

이 설정은 동기(sync) 및 비동기(async) insert에 대해 서로 완전히 다른 방식으로, 상호 간 중복 제거가 되지 않던 이전 코드 버전에서, 동기와 비동기 insert 전반에 걸쳐 삽입된 데이터가 함께 중복 제거되도록 하는 새로운 코드 버전으로 마이그레이션할 수 있도록 합니다.
기본값은 `old_separate_hashes`이며, 이는 ClickHouse가 동기 insert와 비동기 insert에 서로 다른 중복 제거 해시를 사용함을 의미합니다(이전과 동일한 동작).
이 값은 하위 호환성을 위해 기본값으로 사용해야 합니다. 모든 기존 ClickHouse 인스턴스는 변경으로 인한 장애를 피하기 위해 이 값을 사용해야 합니다.
`compatible_double_hashes` 값은 ClickHouse가 두 개의 중복 제거 해시를 사용함을 의미합니다. 하나는 동기 또는 비동기 insert를 위한 이전 해시이고, 다른 하나는 모든 insert를 위한 새로운 해시입니다. 이 값은 기존 인스턴스를 안전하게 새로운 동작으로 마이그레이션하는 데 사용해야 합니다.
마이그레이션 중에 동기나 비동기 insert가 손실되지 않았는지 확인하기 위해, 이 값은 일정 기간 동안 활성화해 두어야 합니다(`replicated_deduplication_window` 및 `non_replicated_deduplication_window` 설정 참조).
마지막으로 `new_unified_hash` 값은 ClickHouse가 동기 및 비동기 insert 모두에 대해 새로운 중복 제거 해시를 사용함을 의미합니다. 이 값은 새로운 ClickHouse 인스턴스나, 이미 일정 기간 동안 `compatible_double_hashes` 값을 사용했던 인스턴스에서 활성화할 수 있습니다.

## interserver_http_credentials \{#interserver_http_credentials\}

[복제](../../engines/table-engines/mergetree-family/replication.md) 동안 다른 서버에 연결하는 데 사용되는 사용자 이름과 비밀번호입니다. 추가로, 서버는 이 자격 증명을 사용하여 다른 레플리카를 인증합니다.
따라서 `interserver_http_credentials`는 클러스터 내 모든 레플리카에서 동일해야 합니다.

:::note

* 기본적으로 `interserver_http_credentials` 섹션을 생략하면 복제 중 인증이 사용되지 않습니다.
* `interserver_http_credentials` 설정은 ClickHouse 클라이언트 자격 증명 [구성](../../interfaces/cli.md#configuration_files)과 관련이 없습니다.
* 이 자격 증명은 `HTTP` 및 `HTTPS`를 통한 복제에 공통으로 사용됩니다.
  :::

다음 설정은 하위 태그로 구성할 수 있습니다.

* `user` — 사용자 이름.
* `password` — 비밀번호.
* `allow_empty` — `true`인 경우, 자격 증명이 설정되어 있더라도 다른 레플리카가 인증 없이 연결하는 것이 허용됩니다. `false`인 경우, 인증 없이 시도되는 연결은 거부됩니다. 기본값: `false`.
* `old` — 자격 증명 교체 시 사용되던 이전 `user`와 `password`를 포함합니다. 여러 개의 `old` 섹션을 지정할 수 있습니다.

**자격 증명 교체(Credentials Rotation)**

ClickHouse는 모든 레플리카의 구성을 동시에 업데이트하기 위해 중단하지 않은 채 interserver 자격 증명을 동적으로 교체하는 기능을 지원합니다. 자격 증명은 여러 단계에 걸쳐 변경할 수 있습니다.

인증을 활성화하려면 `interserver_http_credentials.allow_empty`를 `true`로 설정하고 자격 증명을 추가합니다. 이렇게 하면 인증이 있는 연결과 인증이 없는 연결 모두를 허용합니다.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

모든 레플리카 구성이 완료된 후에는 `allow_empty`를 `false`로 설정하거나 해당 설정을 제거하십시오. 이렇게 하면 새 자격 증명을 사용한 인증이 필수가 됩니다.

기존 자격 증명을 변경하려면 사용자 이름과 비밀번호를 `interserver_http_credentials.old` 섹션으로 옮긴 다음 `user`와 `password`를 새 값으로 업데이트하십시오. 이 시점부터 서버는 다른 레플리카에 연결할 때 새 자격 증명을 사용하며, 새 자격 증명과 기존 자격 증명을 사용한 연결을 모두 허용합니다.

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

새 자격 증명이 모든 레플리카에 적용되면 이전 자격 증명은 제거할 수 있습니다.


## interserver_http_host \{#interserver_http_host\}

다른 서버가 이 서버에 접속할 때 사용할 수 있는 호스트 이름입니다.

생략하면 `<hostname -f>` 명령과 동일한 방식으로 정의됩니다.

특정 네트워크 인터페이스와 분리하여 구성할 때 유용합니다.

**예제**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_port \{#interserver_http_port\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ClickHouse 서버 간에 데이터를 교환할 때 사용하는 포트입니다.

**예시**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_https_host \{#interserver_https_host\}

`<interserver_http_host>`와 유사하지만, 이 호스트 이름은 다른 서버가 `<HTTPS>`를 통해 이 서버에 접속하는 데 사용됩니다.

**예시**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_port \{#interserver_https_port\}

<SettingsInfoBlock type="UInt64" default_value="0" />

`<HTTPS>`를 통해 ClickHouse 서버 간에 데이터를 교환하는 데 사용되는 포트입니다.

**예시**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_listen_host \{#interserver_listen_host\}

ClickHouse 서버 간에 데이터를 교환할 수 있는 호스트에 대한 제한입니다.
Keeper를 사용하는 경우 서로 다른 Keeper 인스턴스 간의 통신에도 동일한 제한이 적용됩니다.

:::note
기본적으로 이 값은 [`listen_host`](#listen_host) 설정과 동일합니다.
:::

**예제**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

유형:

기본값:


## io_thread_pool_queue_size \{#io_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

IO 스레드 풀에 스케줄할 수 있는 작업의 최대 개수입니다.

:::note
값이 `0`이면 무제한을 의미합니다.
:::

## jemalloc_collect_global_profile_samples_in_trace_log \{#jemalloc_collect_global_profile_samples_in_trace_log\}

<SettingsInfoBlock type="Bool" default_value="0" />jemalloc에서 샘플링한 메모리 할당 정보를 system.trace_log에 저장합니다

## jemalloc_enable_background_threads \{#jemalloc_enable_background_threads\}

<SettingsInfoBlock type="Bool" default_value="1" />jemalloc의 백그라운드 스레드를 활성화합니다. jemalloc은 사용되지 않는 메모리 페이지를 정리하기 위해 백그라운드 스레드를 사용합니다. 이를 비활성화하면 성능이 저하될 수 있습니다.

## jemalloc_enable_global_profiler \{#jemalloc_enable_global_profiler\}

<SettingsInfoBlock type="Bool" default_value="0" />모든 스레드에 대해 jemalloc의 메모리 할당 프로파일러를 활성화합니다. jemalloc은 메모리 할당을 샘플링하고, 샘플링된 할당에 대한 모든 할당 해제를 샘플링합니다.
SYSTEM JEMALLOC FLUSH PROFILE을 사용하여 프로파일을 플러시하여 메모리 할당 분석에 활용할 수 있습니다.
샘플은 또한 config `jemalloc_collect_global_profile_samples_in_trace_log` 또는 쿼리 setting `jemalloc_collect_profile_samples_in_trace_log`을 사용하여 `system.trace_log`에 저장할 수도 있습니다.
자세한 내용은 「[할당 프로파일링](/operations/allocation-profiling)」을 참조하십시오.

## jemalloc_flush_profile_interval_bytes \{#jemalloc_flush_profile_interval_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />전역 최대 메모리 사용량이 jemalloc_flush_profile_interval_bytes만큼 증가한 후 jemalloc 프로파일 플러시가 수행됩니다

## jemalloc_flush_profile_on_memory_exceeded \{#jemalloc_flush_profile_on_memory_exceeded\}

<SettingsInfoBlock type="Bool" default_value="0" />전체 메모리 초과 오류 발생 시 jemalloc 프로파일을 플러시하도록 합니다

## jemalloc_max_background_threads_num \{#jemalloc_max_background_threads_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />생성할 jemalloc 백그라운드 스레드의 최대 개수입니다. 0으로 설정하면 jemalloc의 기본값이 사용됩니다.

## keep_alive_timeout \{#keep_alive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

연결을 종료하기 전에 ClickHouse가 HTTP 프로토콜에서 들어오는 요청을 기다리는 시간(초)입니다.

**예제**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts \{#keeper_hosts\}

동적 설정입니다. ClickHouse가 잠재적으로 연결할 수 있는 [Zoo]Keeper 호스트의 Set을 포함합니다. `<auxiliary_zookeepers>`에 있는 정보는 노출하지 않습니다.

## keeper_multiread_batch_size \{#keeper_multiread_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

배치를 지원하는 [Zoo]Keeper에 대한 MultiRead 요청에서 사용할 수 있는 최대 배치 크기입니다. 0으로 설정하면 배치가 비활성화됩니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## keeper_server.socket_receive_timeout_sec \{#keeper_server.socket_receive_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />Keeper 소켓 수신 타임아웃 시간입니다.

## keeper_server.socket_send_timeout_sec \{#keeper_server.socket_send_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />Keeper 소켓 송신 타임아웃입니다.

## ldap_servers \{#ldap_servers\}

다음 목적을 위해 연결 매개변수가 포함된 LDAP 서버를 여기에 나열합니다.

- 'password' 대신 'ldap' 인증 메커니즘이 지정된 전용 로컬 사용자의 인증자로 사용
- 원격 사용자 디렉터리로 사용

다음 설정은 하위 태그로 구성할 수 있습니다:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `bind_dn` | 바인딩할 DN을 구성하는 데 사용하는 템플릿입니다. 최종 DN은 각 인증 시도 시 템플릿 내 모든 `\{user_name\}` 부분 문자열을 실제 사용자 이름으로 대체하여 생성됩니다.                                                                                                                                                                                                                               |
| `enable_tls` | LDAP 서버에 대한 보안 연결 사용 여부를 제어하는 플래그입니다. 일반 텍스트(`ldap://`) 프로토콜을 사용하려면 `no`를 지정합니다(권장되지 않음). SSL/TLS(`ldaps://`)를 사용하는 LDAP 프로토콜을 사용하려면 `yes`를 지정합니다(권장, 기본값). 레거시 StartTLS 프로토콜(일반 텍스트 `ldap://` 프로토콜을 TLS로 업그레이드)을 사용하려면 `starttls`를 지정합니다.                                                                                                               |
| `host` | LDAP 서버 호스트 이름 또는 IP입니다. 이 매개변수는 필수이며 비워둘 수 없습니다.                                                                                                                                                                                                                                                                                                                                                             |
| `port` | LDAP 서버 포트입니다. `enable_tls`가 true로 설정된 경우 기본값은 636이고, 그렇지 않은 경우 `389`입니다.                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_dir` | CA 인증서가 포함된 디렉터리 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_file` | CA 인증서 파일 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_cert_file` | 인증서 파일 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_cipher_suite` | 허용되는 암호화 스위트(OpenSSL 표기)를 지정합니다.                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_key_file` | 인증서 키 파일 경로입니다.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_minimum_protocol_version` | SSL/TLS의 최소 프로토콜 버전입니다. 허용되는 값은 `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2`(기본값)입니다.                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert` | SSL/TLS 피어 인증서 검증 동작입니다. 허용되는 값은 `never`, `allow`, `try`, `demand`(기본값)입니다.                                                                                                                                                                                                                                                                                                                    |
| `user_dn_detection` | 바인딩된 사용자의 실제 사용자 DN을 탐지하기 위한 LDAP 검색 매개변수 섹션입니다. 이는 주로 서버가 Active Directory인 경우 이후 역할 매핑을 위한 검색 필터에서 사용됩니다. 최종 사용자 DN은 허용되는 모든 위치에서 `\{user_dn\}` 부분 문자열을 대체하는 데 사용됩니다. 기본적으로 사용자 DN은 bind DN과 동일하게 설정되지만, 검색이 수행되면 실제로 탐지된 사용자 DN 값으로 업데이트됩니다. |
| `verification_cooldown` | 성공적인 바인드 시도 이후, 지정된 시간(초) 동안 LDAP 서버에 다시 접속하지 않고도 사용자가 이어지는 모든 요청에서 성공적으로 인증된 것으로 간주되는 기간입니다. 캐싱을 비활성화하고 각 인증 요청마다 LDAP 서버에 접속하도록 강제하려면 `0`(기본값)을 지정합니다.                                                                                                                  |

`user_dn_detection` 설정은 하위 태그로 구성할 수 있습니다:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | LDAP 검색을 위한 base DN을 구성하는 템플릿입니다. 최종 DN은 LDAP 검색 중 템플릿 내의 모든 `\{user_name\}` 및 '\{bind_dn\}' 부분 문자열을 실제 사용자 이름과 bind DN으로 대체하여 생성됩니다.                                                                                                       |
| `scope`         | LDAP 검색 범위입니다. 허용되는 값은 `base`, `one_level`, `children`, `subtree`(기본값)입니다.                                                                                                                                                                                                                                       |
| `search_filter` | LDAP 검색을 위한 검색 필터를 구성하는 템플릿입니다. 최종 필터는 LDAP 검색 중 템플릿 내의 모든 `\{user_name\}`, `\{bind_dn\}`, `\{base_dn\}` 부분 문자열을 실제 사용자 이름, bind DN, base DN으로 대체하여 생성됩니다. 특수 문자는 XML에서 올바르게 이스케이프해야 합니다.  |

예시:

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

예시 (역할 매핑을 위해 user DN 탐지가 구성된 일반적인 Active Directory):

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


## license_file \{#license_file\}

ClickHouse Enterprise Edition 라이선스 파일의 내용

## license_public_key_for_testing \{#license_public_key_for_testing\}

CI에서만 사용하는 라이선스 데모 키입니다.

## listen_backlog \{#listen_backlog\}

<SettingsInfoBlock type="UInt32" default_value="4096" />

listen 소켓의 backlog(대기 중인 연결 큐의 크기)입니다. 기본값 `<4096>`은 Linux 5.4+의 기본값과 동일합니다).

일반적으로 이 값은 다음과 같은 이유로 변경할 필요가 없습니다.

* 기본값이 충분히 큽니다.
* 클라이언트 연결 수락은 서버의 별도 스레드가 담당합니다.

따라서 `<TcpExtListenOverflows>`(`<nstat>`에서 확인) 값이 0이 아니며 이 카운터가 ClickHouse 서버에서 증가하더라도, 다음과 같은 이유로 이 값을 반드시 늘려야 한다는 의미는 아닙니다.

* 일반적으로 `<4096>`으로도 부족하다면 내부적인 ClickHouse 스케일링 문제를 나타내는 경우가 많으므로 이슈로 보고하는 것이 좋습니다.
* 이 값을 늘린다고 해서 서버가 이후에 더 많은 연결을 처리할 수 있다는 의미는 아닙니다(설령 가능하더라도, 그 시점에는 클라이언트가 이미 사라졌거나 연결이 끊어졌을 수 있습니다).

**예시**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_host \{#listen_host\}

요청을 수락할 호스트를 제한합니다. 서버가 모든 호스트의 요청에 응답하도록 하려면 `::`를 지정합니다.

예시:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_reuse_port \{#listen_reuse_port\}

<SettingsInfoBlock type="Bool" default_value="0" />

여러 서버가 동일한 address:port에서 동시에 수신하도록 허용합니다. 운영 체제가 요청을 임의의 서버로 라우팅합니다. 이 설정을 활성화하는 것은 권장되지 않습니다.

**예제**

```xml
<listen_reuse_port>0</listen_reuse_port>
```


## listen_try \{#listen_try\}

<SettingsInfoBlock type="Bool" default_value="0" />

서버는 수신을 대기하는 동안 IPv6 또는 IPv4 네트워크를 사용할 수 없는 경우에도 종료되지 않습니다.

**예시**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size \{#load_marks_threadpool_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="50" />마크를 로드하는 백그라운드 풀 크기

## load_marks_threadpool_queue_size \{#load_marks_threadpool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />프리페치 풀에 넣을 수 있는 작업 수입니다

## logger \{#logger\}

로그 메시지의 위치와 형식을 설정합니다.

**키**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `async` | `true`(기본값)인 경우 로깅이 비동기적으로 수행됩니다(출력 채널당 하나의 백그라운드 스레드). 그렇지 않으면 LOG를 호출하는 스레드 내에서 로깅이 수행됩니다.           |
| `async_queue_max_size` | 비동기 로깅을 사용할 때, 플러시될 때까지 큐에 유지될 수 있는 최대 메시지 개수입니다. 초과하는 메시지는 삭제됩니다.                       |
| `console` | 콘솔 로깅을 활성화합니다. `1` 또는 `true`로 설정하면 활성화됩니다. ClickHouse가 데몬 모드로 실행되지 않을 때 기본값은 `1`, 그 외에는 `0`입니다.                            |
| `console_log_level` | 콘솔 출력에 대한 로그 레벨입니다. 기본값은 `level`입니다.                                                                                                                 |
| `console_shutdown_log_level` | 서버 종료 시 콘솔 로그 레벨을 설정하는 데 사용되는 종료 레벨입니다.   |
| `console_startup_log_level` | 서버 시작 시 콘솔 로그 레벨을 설정하는 데 사용되는 시작 레벨입니다. 시작 후에는 로그 레벨이 `console_log_level` 설정값으로 되돌아갑니다.                                   |   
| `count` | 로테이션 정책: ClickHouse가 보관하는 과거 로그 파일의 최대 개수입니다.                                                                                        |
| `errorlog` | 에러 로그 파일의 경로입니다.                                                                                                                                    |
| `formatting.type` | 콘솔 출력에 대한 로그 형식입니다. 현재는 `json`만 지원됩니다.                                                                                                 |
| `level` | 로그 레벨입니다. 허용되는 값: `none`(로깅 비활성화), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                 |
| `log` | 로그 파일의 경로입니다.                                                                                                                                          |
| `rotation` | 로테이션 정책: 로그 파일이 언제 로테이션될지 제어합니다. 크기, 시간 또는 둘의 조합을 기준으로 로테이션할 수 있습니다. 예: 100M, daily, 100M,daily. 로그 파일이 지정된 크기를 초과하거나 지정된 시간 간격에 도달하면 이름이 변경되어 보관되고, 새 로그 파일이 생성됩니다. |
| `shutdown_level` | 서버 종료 시 루트 로거(root logger) 레벨을 설정하는 데 사용되는 종료 레벨입니다.                                                                                            |
| `size` | 로테이션 정책: 로그 파일의 최대 크기(바이트 단위)입니다. 로그 파일 크기가 이 임계값을 초과하면 이름이 변경되어 보관되고, 새 로그 파일이 생성됩니다. |
| `startup_level` | 서버 시작 시 루트 로거 레벨을 설정하는 데 사용되는 시작 레벨입니다. 시작 후에는 로그 레벨이 `level` 설정값으로 되돌아갑니다.                                   |
| `stream_compress` | LZ4를 사용하여 로그 메시지를 압축합니다. `1` 또는 `true`로 설정하면 활성화됩니다.                                                                                                   |
| `syslog_level` | syslog에 기록할 때 사용할 로그 레벨입니다.                                                                                                                                   |
| `use_syslog` | 로그 출력을 syslog로도 전달합니다.                                                                                                                                 |

**로그 형식 지정자(Log format specifiers)**

`log` 및 `errorLog` 경로의 파일 이름은 결과 파일 이름에 대해 아래와 같은 형식 지정자를 지원합니다(디렉터리 부분은 형식 지정자를 지원하지 않습니다).

"Example" 열은 `2023-07-06 18:32:07`일 때의 출력을 보여줍니다.

| 지정자  | 설명                                                                                                                            | 예시                         |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%` | 리터럴 &#39;%&#39; 문자                                                                                                            | `%`                        |
| `%n` | 개행 문자                                                                                                                         |                            |
| `%t` | 수평 탭 문자                                                                                                                       |                            |
| `%Y` | 10진수 연도(예: 2017)                                                                                                              | `2023`                     |
| `%y` | 연도의 마지막 두 자리를 10진수로 표시(범위 [00,99])                                                                                            | `23`                       |
| `%C` | 연도의 처음 두 자리를 10진수로 표시(범위 [00,99])                                                                                             | `20`                       |
| `%G` | 4자리수 [ISO 8601 주 기준 연도](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), 즉 지정된 주가 포함된 연도입니다. 일반적으로는 `%V`와 함께 사용할 때만 유용합니다. | `2023`                     |
| `%g` | 지정된 주가 속한 [ISO 8601 주 기반 연도](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)의 연도 끝 2자리입니다.                                 | `23`                       |
| `%b` | 축약형 월 이름(예: Oct, 로케일에 따라 다름)                                                                                                  | `Jul`                      |
| `%h` | %b와 동일                                                                                                                        | `Jul`                      |
| `%B` | 월의 전체 이름(예: October, 로케일에 따라 다름)                                                                                              | `July`                     |
| `%m` | 월을 10진수로 표시(범위 [01,12])                                                                                                       | `07`                       |
| `%U` | 연도의 주 번호를 10진수로 표시(일요일을 한 주의 첫째 날로 간주, 범위 [00,53])                                                                            | `27`                       |
| `%W` | 연도의 주 번호를 10진수로 표시(월요일을 한 주의 첫째 날로 간주, 범위 [00,53])                                                                            | `27`                       |
| `%V` | ISO 8601 주 번호(범위 [01,53])                                                                                                     | `27`                       |
| `%j` | 연도의 일을 10진수로 표시(범위 [001,366])                                                                                                 | `187`                      |
| `%d` | 일(day)을 0으로 채운 10진수로 표시(범위 [01,31]). 한 자리 수 앞에는 0이 붙습니다.                                                                      | `06`                       |
| `%e` | 일(day)을 공백으로 채운 10진수로 표시(범위 [1,31]). 한 자리 수 앞에는 공백이 붙습니다.                                                                     | `&nbsp; 6`                 |
| `%a` | 축약형 요일 이름(예: Fri, 로케일에 따라 다름)                                                                                                 | `Thu`                      |
| `%A` | 요일의 전체 이름(예: Friday, 로케일에 따라 다름)                                                                                              | `Thursday`                 |
| `%w` | 요일을 10진 정수로 표시하며, 일요일은 0(범위 [0-6])                                                                                            | `4`                        |
| `%u` | 요일을 10진수로 표시하며, 월요일은 1(ISO 8601 형식, 범위 [1-7])                                                                                 | `4`                        |
| `%H` | 시를 10진수로 표시, 24시간제(범위 [00-23])                                                                                                | `18`                       |
| `%I` | 시를 10진수로 표시, 12시간제(범위 [01,12])                                                                                                | `06`                       |
| `%M` | 분을 10진수로 표시(범위 [00,59])                                                                                                       | `32`                       |
| `%S` | 초를 10진수로 표시(범위 [00,60])                                                                                                       | `07`                       |
| `%c` | 표준 날짜 및 시간 문자열(예: Sun Oct 17 04:41:13 2010, 로케일에 따라 다름)                                                                       | `Thu Jul  6 18:32:07 2023` |
| `%x` | 로케일에 따른 지역화된 날짜 표현(로케일에 따라 다름)                                                                                                | `23-07-06`                 |
| `%X` | 로케일에 따른 시간 표현입니다. 예: 18:40:20 또는 6:40:20 PM (로케일에 따라 달라짐)                                                                     | `18:32:07`                 |
| `%D` | 짧은 MM/DD/YY 형식의 날짜로, %m/%d/%y 와 동일합니다                                                                                         | `07/06/23`                 |
| `%F` | 짧은 YYYY-MM-DD 형식의 날짜로, %Y-%m-%d 와 동일합니다                                                                                       | `2023-07-06`               |
| `%r` | 로케일에 따른 12시간제 시각 표현입니다 (로케일에 따라 달라짐)                                                                                          | `06:32:07 PM`              |
| `%R` | &quot;%H:%M&quot; 과 동일합니다                                                                                                     | `18:32`                    |
| `%T` | &quot;%H:%M:%S&quot; 와 동일합니다 (ISO 8601 시간 형식)                                                                                 | `18:32:07`                 |
| `%p` | 로케일에 따른 오전/오후 표기입니다 (a.m./p.m., 로케일에 따라 달라짐)                                                                                  | `PM`                       |
| `%z` | ISO 8601 형식의 UTC로부터의 시간 오프셋입니다 (예: -0430). 시간대 정보가 없으면 아무 것도 출력하지 않습니다                                                        | `+0800`                    |
| `%Z` | 로케일에 따라 달라지는 시간대 이름 또는 약어입니다. 시간대 정보가 없으면 아무 것도 출력하지 않습니다                                                                     | `Z AWST `                  |

**예제**

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

**레벨별 재정의**

개별 로그 이름마다 로그 레벨을 재정의할 수 있습니다. 예를 들어, &quot;Backup&quot; 및 &quot;RBAC&quot; 로거의 모든 메시지가 출력되지 않도록 설정할 수 있습니다.

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

로그 메시지를 syslog에도 추가로 기록하려면:

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

`<syslog>`에 대한 키:

| Key        | Description                                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | `host\[:port\]` 형식의 syslog 주소입니다. 생략하면 로컬 데몬이 사용됩니다.                                                                                                                                                                         |
| `hostname` | 로그를 보내는 호스트의 이름입니다(옵션).                                                                                                                                                                                                      |
| `facility` | syslog [facility keyword](https://en.wikipedia.org/wiki/Syslog#Facility)입니다. 반드시 대문자로, 「LOG&#95;」 접두사를 붙여 지정해야 합니다. 예: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` 등. 기본값: `address`가 지정된 경우 `LOG_USER`, 그렇지 않으면 `LOG_DAEMON`입니다. |
| `format`   | 로그 메시지 형식입니다. 설정 가능한 값: `bsd`, `syslog`.                                                                                                                                                                                     |

**로그 형식**

콘솔 로그에 출력되는 로그 형식을 지정할 수 있습니다. 현재는 JSON만 지원합니다.

**예시**

다음은 출력되는 JSON 로그의 예시입니다:

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

JSON 로깅을 활성화하려면 다음 스니펫을 사용하십시오:

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

**JSON 로그 키 이름 변경**

`<names>` 태그 내부의 값을 변경하여 키 이름을 수정할 수 있습니다. 예를 들어, `DATE_TIME`을 `MY_DATE_TIME`으로 변경하려면 `<date_time>MY_DATE_TIME</date_time>`를 사용할 수 있습니다.

**JSON 로그 키 생략**

로그 속성은 해당 속성을 주석 처리하여 생략할 수 있습니다. 예를 들어, 로그에 `query_id`를 출력하지 않으려면 `<query_id>` 태그를 주석 처리하면 됩니다.


## logger.async \{#logger.async\}

<SettingsInfoBlock type="Bool" default_value="1" />`<true>`(기본값)로 설정되면 로깅이 비동기적으로 수행되며, 출력 채널마다 하나의 백그라운드 스레드를 사용합니다. 그렇지 않으면 LOG를 호출한 스레드 내에서 로깅이 수행됩니다.

## logger.async_queye_max_size \{#logger.async_queye_max_size\}

<SettingsInfoBlock type="UInt64" default_value="65536" />비동기 로깅을 사용할 때 플러시를 기다리며 큐에 보관될 수 있는 메시지의 최대 개수입니다. 이를 초과하는 메시지는 버려집니다.

## logger.console \{#logger.console\}

<SettingsInfoBlock type="Bool" default_value="0" />콘솔 로깅을 활성화합니다. 활성화하려면 `<1>` 또는 `<true>`로 설정합니다. ClickHouse가 데몬 모드로 실행되지 않을 때는 기본값이 `<1>`, 그 외에는 `<0>`입니다.

## logger.console_log_level \{#logger.console_log_level\}

<SettingsInfoBlock type="String" default_value="trace" />콘솔 출력에 대한 로그 레벨입니다. 기본값은 `<level>`로 설정됩니다.

## logger.count \{#logger.count\}

<SettingsInfoBlock type="UInt64" default_value="1" />로그 로테이션 정책: ClickHouse에서 보관되는 과거 로그 파일의 최대 개수입니다.

## logger.errorlog \{#logger.errorlog\}

오류 로그 파일의 경로입니다.

## logger.formatting.type \{#logger.formatting.type\}

<SettingsInfoBlock type="String" default_value="json" />콘솔 출력 시 사용할 로그 형식입니다. 현재는 `<json>`만 지원됩니다.

## logger.level \{#logger.level\}

<SettingsInfoBlock type="String" default_value="trace" />로그 수준입니다. 허용 가능한 값은 다음과 같습니다: `<none>` (로그 비활성화), `<fatal>`, `<critical>`, `<error>`, `<warning>`, `<notice>`, `<information>`, `<debug>`, `<trace>`, `<test>`.

## logger.log \{#logger.log\}

로그 파일의 경로입니다.

## logger.rotation \{#logger.rotation\}

<SettingsInfoBlock type="String" default_value="100M" />로테이션 정책: 로그 파일을 언제 교체(로테이션)할지 제어합니다. 로테이션 기준은 크기, 시간 또는 이 둘의 조합이 될 수 있습니다. 예시: 100M, daily, 100M,daily. 로그 파일이 지정된 크기를 초과하거나 지정된 시간 간격에 도달하면 이름을 변경하여 보관하고, 새 로그 파일을 생성합니다.

## logger.shutdown_level \{#logger.shutdown_level\}

logger.shutdown_level은 서버 종료 시 루트 로거의 레벨을 설정하는 데 사용됩니다.

## logger.size \{#logger.size\}

<SettingsInfoBlock type="String" default_value="100M" />회전 정책: 로그 파일의 최대 크기(바이트 단위)입니다. 로그 파일 크기가 이 임계값을 초과하면 해당 파일의 이름을 변경하여 보관하고, 새 로그 파일이 생성됩니다.

## logger.startup_level \{#logger.startup_level\}

Startup 레벨은 서버가 시작될 때 루트 로거(root logger)의 레벨을 설정하는 데 사용됩니다. 시작이 완료된 후에는 로그 레벨이 `<level>` 설정 값으로 되돌아갑니다.

## logger.stream_compress \{#logger.stream_compress\}

<SettingsInfoBlock type="Bool" default_value="0" />LZ4를 사용하여 로그 메시지를 압축합니다. 사용하려면 `<1>` 또는 `<true>`로 설정합니다.

## logger.syslog_level \{#logger.syslog_level\}

<SettingsInfoBlock type="String" default_value="trace" />syslog에 기록할 때 사용할 로그 레벨입니다.

## logger.use_syslog \{#logger.use_syslog\}

<SettingsInfoBlock type="Bool" default_value="0" />로그 출력을 syslog에도 전달합니다.

## macros \{#macros\}

복제된 테이블을 위한 매개변수 대체입니다.

복제된 테이블을 사용하지 않는 경우 생략할 수 있습니다.

자세한 내용은 [복제된 테이블 생성](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) 섹션을 참조하십시오.

**예제**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy \{#mark_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />mark 캐시 정책의 이름입니다.

## mark_cache_prewarm_ratio \{#mark_cache_prewarm_ratio\}

<SettingsInfoBlock type="Double" default_value="0.95" />프리워밍(prewarm) 시 채워질 mark 캐시 전체 크기에 대한 비율입니다.

## mark_cache_size \{#mark_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

[`MergeTree`](/engines/table-engines/mergetree-family) 계열 테이블의 마크(인덱스)를 위한 캐시의 최대 크기입니다.

:::note
이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다.
:::

## mark_cache_size_ratio \{#mark_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />mark cache에서 SLRU 정책을 사용하는 경우, 보호 큐의 크기를 캐시 전체 크기에 대한 비율로 지정합니다.

## max_active_parts_loading_thread_pool_size \{#max_active_parts_loading_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="64" />서버 시작 시 활성 상태인 데이터 파트 집합을 로드하는 스레드 수입니다.

## max_authentication_methods_per_user \{#max_authentication_methods_per_user\}

<SettingsInfoBlock type="UInt64" default_value="100" />

사용자당 생성하거나 변경할 때 설정할 수 있는 최대 인증 방식 수입니다.
이 설정을 변경해도 기존 사용자에는 영향을 주지 않습니다. 인증과 관련된 CREATE/ALTER 쿼리가 이 설정에 지정된 한도를 초과하면 실패합니다.
인증과 관련 없는 CREATE/ALTER 쿼리는 계속 성공합니다.

:::note
값이 `0`이면 무제한을 의미합니다.
:::

## max_backup_bandwidth_for_server \{#max_backup_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />서버의 모든 백업에 대해 초당 바이트 단위의 최대 읽기 속도입니다. 0으로 설정하면 무제한을 의미합니다.

## max_backups_io_thread_pool_free_size \{#max_backups_io_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />Backups IO Thread 풀에서 **유휴** 스레드 수가 `max_backup_io_thread_pool_free_size` 값을 초과하면, ClickHouse는 유휴 스레드가 점유하고 있는 리소스를 해제하고 풀 크기를 줄입니다. 필요할 경우 스레드를 다시 생성합니다.

## max_backups_io_thread_pool_size \{#max_backups_io_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse는 S3 백업 IO 작업을 수행하기 위해 Backups IO Thread 풀의 스레드를 사용합니다. `max_backups_io_thread_pool_size`는 해당 풀의 스레드 최대 개수를 제한합니다.

## max_build_vector_similarity_index_thread_pool_size \{#max_build_vector_similarity_index_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

벡터 인덱스를 빌드할 때 사용하는 최대 스레드 수입니다.

:::note
값이 `0`이면 모든 코어를 사용함을 의미합니다.
:::

## max_concurrent_insert_queries \{#max_concurrent_insert_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

동시에 실행할 수 있는 insert 쿼리의 총 개수를 제한합니다.

:::note

값이 `0`(기본값)이면 무제한을 의미합니다.

이 설정은 런타임 중에 수정할 수 있으며, 즉시 적용됩니다. 이미 실행 중인 쿼리는 변경되지 않습니다.
:::

## max_concurrent_queries \{#max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

동시에 실행될 수 있는 전체 쿼리 수에 대한 제한입니다. `INSERT` 및 `SELECT` 쿼리에 대한 제한과 사용자별 최대 쿼리 수 제한도 함께 고려해야 합니다.

다음 항목도 함께 참고하십시오:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

값이 `0`(기본값)이면 무제한을 의미합니다.

이 설정은 실행 중에도 수정할 수 있으며, 즉시 적용됩니다. 이미 실행 중인 쿼리는 변경되지 않습니다.
:::

## max_concurrent_select_queries \{#max_concurrent_select_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

동시에 실행될 수 있는 select 쿼리의 총 개수를 제한합니다.

:::note

`0`(기본값)은 무제한을 의미합니다.

이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다. 이미 실행 중인 쿼리는 변경되지 않습니다.
:::

## max_connections \{#max_connections\}

<SettingsInfoBlock type="Int32" default_value="4096" />서버의 최대 연결 수입니다.

## max_database_num_to_throw \{#max_database_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />데이터베이스 개수가 이 값을 초과하면 서버에서 예외를 발생시킵니다. 0은 제한이 없음을 의미합니다.

## max_database_num_to_warn \{#max_database_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

연결된 데이터베이스의 개수가 지정된 값을 초과하면 ClickHouse 서버가 경고 메시지를 `system.warnings` 테이블에 기록합니다.

**예시**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size \{#max_database_replicated_create_table_thread_pool_size\}

<SettingsInfoBlock type="UInt32" default_value="1" />DatabaseReplicated에서 레플리카 복구 중 테이블을 생성할 때 사용할 스레드 수입니다. 스레드 수를 0으로 설정하면 코어 수와 동일하게 설정됩니다.

## max_dictionary_num_to_throw \{#max_dictionary_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

딕셔너리 수가 이 값보다 크면 서버에서 예외를 발생시킵니다.

다음 데이터베이스 엔진의 테이블만 개수에 포함됩니다:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
값이 `0`이면 제한이 없음을 의미합니다.
:::

**예제**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```


## max_dictionary_num_to_warn \{#max_dictionary_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

등록된 딕셔너리의 수가 지정된 값을 초과하면 ClickHouse 서버는 경고 메시지를 `system.warnings` 테이블에 추가합니다.

**예시**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server \{#max_distributed_cache_read_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />서버에서 분산 캐시에서의 최대 전체 읽기 속도(초당 바이트 수)입니다. 0이면 제한이 없습니다.

## max_distributed_cache_write_bandwidth_for_server \{#max_distributed_cache_write_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />서버의 분산 캐시에 대한 최대 총 쓰기 속도(초당 바이트 수)입니다. 0이면 무제한을 의미합니다.

## max_entries_for_hash_table_stats \{#max_entries_for_hash_table_stats\}

<SettingsInfoBlock type="UInt64" default_value="10000" />집계 시 수집되는 해시 테이블 통계에 허용되는 최대 엔트리 수입니다

## max_fetch_partition_thread_pool_size \{#max_fetch_partition_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION 작업에 사용할 스레드 개수입니다.

## max_format_parsing_thread_pool_free_size \{#max_format_parsing_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

입력 파싱을 위한 스레드 풀에서 유지할 유휴 스레드의 최대 개수입니다.

## max_format_parsing_thread_pool_size \{#max_format_parsing_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />

입력 데이터를 파싱하는 데 사용할 최대 스레드 수입니다.

## max_io_thread_pool_free_size \{#max_io_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

IO thread 풀에서 **유휴(idle)** 상태인 스레드 수가 `max_io_thread_pool_free_size`를 초과하면, ClickHouse는 유휴 스레드가 점유한 리소스를 해제하고 풀 크기를 줄입니다. 필요하면 스레드가 다시 생성될 수 있습니다.

## max_io_thread_pool_size \{#max_io_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse는 IO 스레드 풀의 스레드를 사용하여 일부 IO 작업(S3와 상호 작용하는 작업 등)을 수행합니다. `max_io_thread_pool_size`는 풀의 최대 스레드 수를 제한합니다.

## max_keep_alive_requests \{#max_keep_alive_requests\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

하나의 keep-alive 연결에서 ClickHouse 서버가 연결을 닫기 전까지 처리할 수 있는 최대 요청 수입니다.

**예시**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server \{#max_local_read_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

초당 바이트 수로 표현되는 로컬 읽기의 최대 속도입니다.

:::note
값이 `0`이면 무제한을 의미합니다.
:::

## max_local_write_bandwidth_for_server \{#max_local_write_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

로컬 쓰기 연산의 최대 속도(초당 바이트 수)입니다.

:::note
값이 `0`이면 무제한을 의미합니다.
:::

## max_materialized_views_count_for_table \{#max_materialized_views_count_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

테이블에 연결된 materialized view의 개수에 대한 제한입니다.

:::note
여기서는 테이블에 직접 의존하는 뷰(view)만을 고려하며, 하나의 뷰 위에 다른 뷰를 생성하는 경우는 포함되지 않습니다.
:::

## max_merges_bandwidth_for_server \{#max_merges_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />서버에서 수행되는 모든 merge 작업의 최대 읽기 속도(초당 바이트 수)입니다. 0은 무제한을 의미합니다.

## max_mutations_bandwidth_for_server \{#max_mutations_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />서버에서 실행되는 모든 뮤테이션의 최대 읽기 속도를 초당 바이트 단위로 지정합니다. 0인 경우 제한이 없음을 의미합니다.

## max_named_collection_num_to_throw \{#max_named_collection_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

이 값보다 named collection(이름이 지정된 컬렉션)의 개수가 많으면 서버는 예외를 발생시킵니다.

:::note
값이 `0`이면 제한이 없음을 의미합니다.
:::

**예시**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max_named_collection_num_to_warn \{#max_named_collection_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Named collection의 개수가 지정된 값을 초과하면 ClickHouse 서버는 경고 메시지를 `system.warnings` 테이블에 추가합니다.

**예시**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max_open_files \{#max_open_files\}

<SettingsInfoBlock type="UInt64" default_value="0" />

동시에 열 수 있는 파일의 최대 개수입니다.

:::note
macOS에서는 `getrlimit()` 함수가 잘못된 값을 반환하므로, 이 옵션을 사용할 것을 권장합니다.
:::

## max_os_cpu_wait_time_ratio_to_drop_connection \{#max_os_cpu_wait_time_ratio_to_drop_connection\}

<SettingsInfoBlock type="Float" default_value="0" />

연결을 중단해야 할지를 판단하기 위해 사용하는 OS CPU 대기 시간(`OSCPUWaitMicroseconds` 메트릭)과 바쁜 시간(`OSCPUVirtualTimeMicroseconds` 메트릭) 사이의 최대 비율입니다. 최소 및 최대 비율 사이에서는 선형 보간을 사용하여 확률을 계산하며, 이 최대 비율에서는 확률이 1이 됩니다.
자세한 내용은 「[서버 CPU 과부하 시 동작 제어](/operations/settings/server-overload)」를 참조하십시오.

## max_outdated_parts_loading_thread_pool_size \{#max_outdated_parts_loading_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="32" />시작 시 비활성화된(오래된) 데이터 파트 집합을 로드하는 스레드 개수입니다.

## max_part_num_to_warn \{#max_part_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

활성 파트 수가 지정된 값을 초과하면 ClickHouse 서버가 `system.warnings` 테이블에 경고 메시지를 기록합니다.

**예시**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max_partition_size_to_drop \{#max_partition_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

파티션 삭제에 대한 제한입니다.

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 크기가 [`max_partition_size_to_drop`](#max_partition_size_to_drop) (바이트 단위)을 초과하는 경우, [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) 쿼리를 사용하여 파티션을 삭제할 수 없습니다.
이 설정은 적용을 위해 ClickHouse 서버를 재시작할 필요가 없습니다. 이 제한을 비활성화하는 또 다른 방법은 `<clickhouse-path>/flags/force_drop_table` 파일을 생성하는 것입니다.

:::note
값이 `0`이면 아무런 제한 없이 파티션을 삭제할 수 있음을 의미합니다.

이 제한은 DROP TABLE 및 TRUNCATE TABLE에는 적용되지 않습니다. [max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop)을 참조하십시오.
:::

**예시**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size \{#max_parts_cleaning_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="128" />비활성 데이터 파트를 동시에 제거하는 데 사용하는 스레드 수입니다.

## max_pending_mutations_execution_time_to_warn \{#max_pending_mutations_execution_time_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="86400" />

대기 중인 뮤테이션 중 하나라도 지정된 값(초 단위)을 초과하면 ClickHouse 서버는 경고 메시지를 `system.warnings` 테이블에 추가합니다.

**예시**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max_pending_mutations_to_warn \{#max_pending_mutations_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="500" />

대기 중인 뮤테이션 수가 지정된 값을 초과하면 ClickHouse 서버는 `system.warnings` 테이블에 경고 메시지를 추가합니다.

**예제**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size \{#max_prefixes_deserialization_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

prefixes 역직렬화용 스레드 풀에서 **유휴** 스레드 수가 `max_prefixes_deserialization_thread_pool_free_size`를 초과하면 ClickHouse는 유휴 스레드가 점유한 리소스를 해제하고 풀 크기를 줄입니다. 필요한 경우 스레드를 다시 생성할 수 있습니다.

## max_prefixes_deserialization_thread_pool_size \{#max_prefixes_deserialization_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse는 MergeTree의 Wide 파트에서 파일 prefix로부터 컬럼과 서브컬럼 메타데이터를 병렬로 읽기 위해 prefixes deserialization thread pool의 스레드를 사용합니다. `max_prefixes_deserialization_thread_pool_size`는 이 풀에서 사용할 수 있는 최대 스레드 수를 제한합니다.

## max_remote_read_network_bandwidth_for_server \{#max_remote_read_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

읽기 시 네트워크를 통한 데이터 전송의 최대 속도(초당 바이트 단위)입니다.

:::note
값 `0`(기본값)은 무제한을 의미합니다.
:::

## max_remote_write_network_bandwidth_for_server \{#max_remote_write_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

쓰기 시 네트워크를 통한 데이터 교환의 최대 속도(초당 바이트 단위)입니다.

:::note
`0`(기본값)은 무제한을 의미합니다.
:::

## max_replicated_fetches_network_bandwidth_for_server \{#max_replicated_fetches_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />레플리카 fetch 작업에 대해 네트워크를 통한 데이터 교환의 최대 속도를 초당 바이트 단위로 제한합니다. 0이면 제한이 없습니다.

## max_replicated_sends_network_bandwidth_for_server \{#max_replicated_sends_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />레플리카 전송을 위한 네트워크를 통한 데이터 교환의 최대 속도를 초당 바이트 단위로 제한합니다. 0이면 무제한을 의미합니다.

## max_replicated_table_num_to_throw \{#max_replicated_table_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

복제된 테이블(Replicated Table)의 수가 이 값보다 크면 서버에서 예외를 발생시킵니다.

다음 데이터베이스 엔진을 사용하는 테이블만 개수에 포함합니다:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
값이 `0`이면 제한이 없음을 의미합니다.
:::

**예시**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```


## max_server_memory_usage \{#max_server_memory_usage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

서버에서 사용할 수 있는 메모리의 최대 크기를 바이트 단위로 지정합니다.

:::note
서버의 최대 메모리 사용량은 `max_server_memory_usage_to_ram_ratio` 설정에 의해 추가로 제한됩니다.
:::

예외적으로, 값이 `0`(기본값)이면 서버는 사용 가능한 모든 메모리를 사용할 수 있음을 의미합니다. 단, 이때도 `max_server_memory_usage_to_ram_ratio`에 의해 적용되는 추가 제한은 그대로 유지됩니다.

## max_server_memory_usage_to_ram_ratio \{#max_server_memory_usage_to_ram_ratio\}

<SettingsInfoBlock type="Double" default_value="0.9" />

서버가 사용할 수 있는 최대 메모리 양을 전체 사용 가능 메모리에 대한 비율로 나타낸 값입니다.

예를 들어 `0.9`(기본값)인 경우, 서버는 사용 가능한 메모리의 90%까지 사용할 수 있습니다.

메모리가 적은 시스템에서 메모리 사용량을 줄이는 데 도움이 됩니다.
RAM과 스왑 공간이 적은 호스트에서는 [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) 값을 1보다 크게 설정해야 할 수도 있습니다.

:::note
서버의 최대 메모리 사용량은 `max_server_memory_usage` 설정에 의해 추가로 제한됩니다.
:::

## max_session_timeout \{#max_session_timeout\}

최대 세션 타임아웃 시간(초 단위)입니다.

예:

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max_table_num_to_throw \{#max_table_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

테이블 수가 이 값보다 크면 서버가 예외를 발생시킵니다.

다음 유형의 테이블은 계산에서 제외됩니다:

* view
* remote
* dictionary
* system

다음 데이터베이스 엔진에 속한 테이블만 계산에 포함됩니다:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
값이 `0`이면 제한이 없음을 의미합니다.
:::

**예제**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```


## max_table_num_to_warn \{#max_table_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

attached 상태인 테이블 수가 지정된 값을 초과하면 ClickHouse 서버가 경고 메시지를 `system.warnings` 테이블에 기록합니다.

**예시**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max_table_size_to_drop \{#max_table_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

테이블 삭제에 대한 제한 설정입니다.

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 크기가 `max_table_size_to_drop`(바이트 단위)을 초과하면 [`DROP`](../../sql-reference/statements/drop.md) 쿼리나 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 쿼리를 사용하여 해당 테이블을 삭제할 수 없습니다.

:::note
`0` 값은 모든 테이블을 제한 없이 삭제할 수 있음을 의미합니다.

이 설정은 적용을 위해 ClickHouse 서버를 재시작할 필요가 없습니다. 이 제한을 해제하는 다른 방법은 `<clickhouse-path>/flags/force_drop_table` 파일을 생성하는 것입니다.
:::

**예시**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size \{#max_temporary_data_on_disk_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

외부 집계, 조인 또는 정렬에 사용할 수 있는 최대 저장 용량입니다.
이 한도를 초과하면 예외가 발생하며 쿼리가 실패합니다.

:::note
값 `0`은 무제한을 의미합니다.
:::

함께 보기:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max_thread_pool_free_size \{#max_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Global Thread 풀에서 **유휴** 스레드 수가 [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)보다 많으면 ClickHouse는 일부 스레드가 점유하고 있는 리소스를 해제하여 풀 크기를 줄입니다. 필요할 경우 스레드는 다시 생성될 수 있습니다.

**예제**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max_thread_pool_size \{#max_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse는 Global Thread pool의 스레드를 사용하여 쿼리를 처리합니다. 쿼리를 처리할 유휴 스레드가 없으면 풀에 새 스레드를 생성합니다. `max_thread_pool_size`는 풀의 스레드 최대 개수를 제한합니다.

**예제**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size \{#max_unexpected_parts_loading_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />시작 시 비활성 상태의 데이터 파트 집합(예기치 않은 파트)을 로드하는 스레드 수입니다.

## max_view_num_to_throw \{#max_view_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

뷰(View)의 개수가 이 값보다 크면 서버에서 예외를 발생시킵니다.

다음 데이터베이스 엔진의 테이블만 집계합니다:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
값이 `0`이면 제한이 없음을 의미합니다.
:::

**예시**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max_view_num_to_warn \{#max_view_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

연결된 뷰(Materialized View 포함)의 개수가 지정한 값을 초과하면 ClickHouse 서버는 경고 메시지를 `system.warnings` 테이블에 추가합니다.

**예시**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries \{#max_waiting_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

동시에 대기 중인 쿼리의 총 수에 대한 제한입니다.
필요한 테이블이 비동기로 로드되는 동안([`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases) 참고) 대기 중인 쿼리의 실행이 차단됩니다.

:::note
다음 설정으로 제어되는 제한을 확인할 때 대기 중인 쿼리는 개수에 포함되지 않습니다.

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

이는 서버 시작 직후 이러한 제한에 바로 도달하는 상황을 방지하기 위한 조치입니다.
:::

:::note

값이 `0`(기본값)이면 무제한을 의미합니다.

이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다. 이미 실행 중인 쿼리에는 적용되지 않습니다.
:::

## memory_worker_correct_memory_tracker \{#memory_worker_correct_memory_tracker\}

<SettingsInfoBlock type="Bool" default_value="0" />

백그라운드 메모리 worker가 jemalloc, cgroups와 같은 외부 소스에서 가져온 정보를 기반으로 내부 메모리 트래커를 보정해야 하는지 여부입니다.

## memory_worker_decay_adjustment_period_ms \{#memory_worker_decay_adjustment_period_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

메모리 압력이 jemalloc의 `dirty_decay_ms`를 동적으로 조정하기 전에 얼마나 오래 지속되어야 하는지를 밀리초 단위로 지정합니다. 메모리 사용량이 이 기간 동안 purge 임계값을 초과한 상태로 유지되면, 메모리를 적극적으로 회수하기 위해 자동 dirty 페이지 decay가 비활성화됩니다 (`dirty_decay_ms=0`). 사용량이 이 기간 동안 임계값 아래로 유지되면 기본 decay 동작이 복원됩니다. 동적 조정을 비활성화하고 jemalloc의 기본 decay 설정을 사용하려면 0으로 설정합니다.

## memory_worker_period_ms \{#memory_worker_period_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

백그라운드 메모리 워커의 틱 주기로, 메모리 트래커의 메모리 사용량을 보정하고 메모리 사용량이 높을 때 사용되지 않는 페이지를 정리합니다. 0으로 설정하면 메모리 사용량의 원인에 따라 기본값이 사용됩니다.

## memory_worker_purge_dirty_pages_threshold_ratio \{#memory_worker_purge_dirty_pages_threshold_ratio\}

<SettingsInfoBlock type="Double" default_value="0.2" />

ClickHouse 서버에서 사용 가능한 메모리에 대해 jemalloc dirty 페이지가 차지하는 임계 비율입니다. dirty 페이지의 크기가 이 비율을 초과하면 백그라운드 메모리 워커가 dirty 페이지 정리를 강제로 수행합니다. 0으로 설정하면 dirty 페이지 비율을 기준으로 한 강제 정리가 비활성화됩니다.

## memory_worker_purge_total_memory_threshold_ratio \{#memory_worker_purge_total_memory_threshold_ratio\}

<SettingsInfoBlock type="Double" default_value="0.9" />

ClickHouse 서버에 사용 가능한 메모리를 기준으로 jemalloc을 purge하는 임계값 비율입니다. 전체 메모리 사용량이 이 비율을 초과하면 백그라운드 메모리 워커가 dirty 페이지를 강제로 purge합니다. 0으로 설정하면 전체 메모리 사용량을 기준으로 한 강제 purge가 비활성화됩니다.

## memory_worker_use_cgroup \{#memory_worker_use_cgroup\}

<SettingsInfoBlock type="Bool" default_value="1" />현재 cgroup의 메모리 사용량 정보를 사용하여 메모리 추적을 보정합니다.

## merge_tree \{#merge_tree\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블을 위한 세부 설정입니다.

자세한 내용은 MergeTreeSettings.h 헤더 파일을 참조하십시오.

**예시**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload \{#merge_workload\}

<SettingsInfoBlock type="String" default_value="default" />

머지와 다른 워크로드 간에 리소스가 어떻게 사용되고 공유되는지를 조절하는 데 사용합니다. 지정한 값은 모든 백그라운드 머지에 대해 `workload` 설정 값으로 사용됩니다. MergeTree 설정으로 재정의할 수 있습니다.

**관련 항목**

- [워크로드 스케줄링](/operations/workload-scheduling.md)

## merges_mutations_memory_usage_soft_limit \{#merges_mutations_memory_usage_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

머지와 뮤테이션 작업을 수행할 때 사용할 수 있는 RAM 용량의 상한을 설정합니다.
ClickHouse가 설정된 한계에 도달하면 새로운 백그라운드 머지나 뮤테이션 작업은 더 이상 스케줄링하지 않지만, 이미 스케줄된 작업의 실행은 계속됩니다.

:::note
값이 `0`이면 무제한을 의미합니다.
:::

**예제**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio \{#merges_mutations_memory_usage_to_ram_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />

기본 `merges_mutations_memory_usage_soft_limit` 설정값은 `memory_amount * merges_mutations_memory_usage_to_ram_ratio`로 계산됩니다.

**관련 항목:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric_log \{#metric_log\}

기본적으로 비활성화되어 있습니다.

**활성화**

[`system.metric_log`](../../operations/system-tables/metric_log.md)의 메트릭 이력 수집을 수동으로 활성화하려면, 다음 내용을 포함한 `/etc/clickhouse-server/config.d/metric_log.xml` 파일을 생성하십시오:

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

`metric_log` SETTING을 비활성화하려면 다음 내용을 포함하는 파일 `/etc/clickhouse-server/config.d/disable_metric_log.xml`을 생성해야 합니다:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection \{#min_os_cpu_wait_time_ratio_to_drop_connection\}

<SettingsInfoBlock type="Float" default_value="0" />

연결을 끊는(drop) 것을 고려할 때 기준이 되는 OS CPU 대기 시간(`OSCPUWaitMicroseconds` 메트릭)과 바쁜 시간(`OSCPUVirtualTimeMicroseconds` 메트릭)의 최소 비율입니다. 최소 및 최대 비율 사이에서 선형 보간을 사용해 확률을 계산하며, 이 지점에서의 확률은 0입니다.
자세한 내용은 [서버 CPU 과부하 시 동작 제어](/operations/settings/server-overload)를 참고하십시오.

## mlock_executable \{#mlock_executable\}

<SettingsInfoBlock type="Bool" default_value="0" />

시작 후 `<mlockall>`을 수행하여 초기 쿼리 지연 시간을 줄이고, 높은 I/O 부하 시 ClickHouse 실행 파일이 페이지 아웃되는 것을 방지합니다.

:::note
이 옵션을 활성화하는 것이 권장되지만, 시작 시간이 최대 몇 초까지 늘어날 수 있습니다. 또한 이 설정은 「CAP&#95;IPC&#95;LOCK」 capability가 없으면 동작하지 않습니다.
:::

**예시**

```xml
<mlock_executable>false</mlock_executable>
```


## mlock_executable_min_total_memory_amount_bytes \{#mlock_executable_min_total_memory_amount_bytes\}

<SettingsInfoBlock type="UInt64" default_value="5000000000" />`<mlockall>`을 호출할 수 있는 최소 메모리 임계값입니다.

## mmap_cache_size \{#mmap_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

이 설정을 사용하면 (연속적인 페이지 폴트로 인해 비용이 매우 큰) 빈번한 open/close 호출을 피하고, 여러 스레드와 쿼리에서 매핑을 재사용할 수 있습니다. 설정 값은 매핑된 영역의 개수이며(일반적으로 매핑된 파일 개수와 같습니다).

매핑된 파일에 포함된 데이터의 양은 다음 시스템 테이블의 아래 메트릭으로 모니터링할 수 있습니다:

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` 메트릭: [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` 메트릭: [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
매핑된 파일의 데이터 양은 메모리를 직접 소비하지 않으며, 쿼리나 서버 메모리 사용량에도 포함되지 않습니다. 이 메모리는 OS 페이지 캐시와 유사하게 폐기될 수 있기 때문입니다. 캐시는 MergeTree 계열 테이블에서 오래된 파트가 제거될 때 (파일이 닫히면서) 자동으로 삭제되며, `SYSTEM DROP MMAP CACHE` 쿼리를 사용해 수동으로도 삭제할 수 있습니다.

이 설정은 런타임에 수정할 수 있으며, 즉시 적용됩니다.
:::

## mutation_workload \{#mutation_workload\}

<SettingsInfoBlock type="String" default_value="default" />

뮤테이션과 다른 워크로드 간의 리소스 사용 및 공유를 조절하는 데 사용합니다. 지정한 값은 모든 백그라운드 뮤테이션에 대해 `workload` 설정 값으로 사용됩니다. MergeTree 설정으로 재정의할 수 있습니다.

**추가 참고**

- [워크로드 스케줄링](/operations/workload-scheduling.md)

## mysql_port \{#mysql_port\}

MySQL 프로토콜을 사용하는 클라이언트와 통신하기 위한 포트입니다.

:::note

* 양의 정수를 지정하면 서버가 수신 대기할 포트 번호가 됩니다.
* 값을 비워 두면 MySQL 프로토콜을 통한 클라이언트와의 통신이 비활성화됩니다.
  :::

**예제**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport \{#mysql_require_secure_transport\}

<SettingsInfoBlock type="Bool" default_value="0" />true로 설정하면 [mysql_port](/operations/server-configuration-parameters/settings#mysql_port)를 통한 클라이언트와의 보안 통신이 필수입니다. `<--ssl-mode=none>` 옵션을 사용한 연결은 거부됩니다. [OpenSSL](/operations/server-configuration-parameters/settings#openssl) 설정과 함께 사용하십시오.

## oom_score \{#oom_score\}

<SettingsInfoBlock type="Int32" default_value="0" />Linux 시스템에서 OOM killer의 동작을 제어하는 설정입니다.

## openSSL \{#openssl\}

SSL 클라이언트/서버 구성을 설명합니다.

SSL 지원은 `libpoco` 라이브러리에서 제공합니다. 사용 가능한 구성 옵션은 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)에 설명되어 있습니다. 기본값은 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)에서 확인할 수 있습니다.

서버/클라이언트 설정에 사용되는 키:

| 옵션                            | 설명                                                                                                                                                                                                                                                                                                                                         | 기본값                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `cacheSessions`               | 세션 캐싱을 활성화하거나 비활성화합니다. `sessionIdContext`와 함께 사용해야 합니다. 허용되는 값: `true`, `false`.                                                                                                                                                                                                                                                           | `false`                                                                                    |
| `caConfig`                    | 신뢰할 수 있는 CA 인증서를 포함하는 파일 또는 디렉터리의 경로입니다. 파일을 가리키는 경우 PEM 형식이어야 하며 여러 개의 CA 인증서를 포함할 수 있습니다. 디렉터리를 가리키는 경우 CA 인증서당 하나의 .pem 파일을 포함해야 합니다. 파일 이름은 CA subject name의 해시 값으로 조회됩니다. 자세한 내용은 [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html)의 man 페이지에서 확인할 수 있습니다. |                                                                                            |
| `certificateFile`             | PEM 형식의 클라이언트/서버 인증서 파일 경로입니다. `privateKeyFile`에 인증서가 포함되어 있으면 생략할 수 있습니다.                                                                                                                                                                                                                                                                 |                                                                                            |
| `cipherList`                  | 지원되는 OpenSSL 암호군입니다.                                                                                                                                                                                                                                                                                                                       | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `disableProtocols`            | 허용하지 않을 프로토콜입니다.                                                                                                                                                                                                                                                                                                                           |                                                                                            |
| `extendedVerification`        | 활성화된 경우, 인증서의 CN 또는 SAN이 피어 호스트 이름과 일치하는지 검증합니다.                                                                                                                                                                                                                                                                                           | `false`                                                                                    |
| `fips`                        | OpenSSL FIPS 모드를 활성화합니다. 사용하는 라이브러리의 OpenSSL 버전이 FIPS를 지원하는 경우에만 동작합니다.                                                                                                                                                                                                                                                                    | `false`                                                                                    |
| `invalidCertificateHandler`   | 유효하지 않은 인증서를 검증할 때 사용하는 클래스(`CertificateHandler`의 하위 클래스)입니다. 예: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                         | `RejectCertificateHandler`                                                                 |
| `loadDefaultCAFile`           | OpenSSL의 기본 내장 CA 인증서를 사용할지 여부입니다. ClickHouse는 기본 내장 CA 인증서가 파일 `/etc/ssl/cert.pem`(또는 디렉터리 `/etc/ssl/certs`)에 있거나, 환경 변수 `SSL_CERT_FILE`(또는 `SSL_CERT_DIR`)로 지정된 파일(또는 디렉터리)에 존재한다고 가정합니다.                                                                                                                                                | `true`                                                                                     |
| `preferServerCiphers`         | 서버가 선호하는 암호(ciphers)입니다.                                                                                                                                                                                                                                                                                                                   | `false`                                                                                    |
| `privateKeyFile`              | PEM 인증서의 비밀 키가 포함된 파일 경로입니다. 이 파일에는 키와 인증서를 함께 포함할 수 있습니다.                                                                                                                                                                                                                                                                                 |                                                                                            |
| `privateKeyPassphraseHandler` | 개인 키에 접근하기 위한 패스프레이즈를 요청하는 클래스(PrivateKeyPassphraseHandler의 서브클래스)입니다. 예를 들어 `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`와 같이 사용합니다.                                                                                                   | `KeyConsoleHandler`                                                                        |
| `requireTLSv1`                | TLSv1 연결을 요구합니다. 허용 가능한 값은 `true`, `false`입니다.                                                                                                                                                                                                                                                                                             | `false`                                                                                    |
| `requireTLSv1_1`              | TLSv1.1 연결을 요구합니다. 허용되는 값은 `true`, `false`입니다.                                                                                                                                                                                                                                                                                             | `false`                                                                                    |
| `requireTLSv1_2`              | TLSv1.2 연결을 요구합니다. 허용 가능한 값은 `true`, `false`입니다.                                                                                                                                                                                                                                                                                           | `false`                                                                                    |
| `sessionCacheSize`            | 서버에서 캐시할 수 있는 세션의 최대 개수입니다. 값이 `0`이면 세션 수는 무제한입니다.                                                                                                                                                                                                                                                                                         | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionIdContext`            | 서버가 각 식별자를 생성할 때 덧붙이는 고유한 난수 문자열입니다. 문자열 길이는 `SSL_MAX_SSL_SESSION_ID_LENGTH`를 초과해서는 안 됩니다. 이 매개변수는 서버가 세션을 캐시하는 경우와 클라이언트가 캐싱을 요청한 경우 모두에서 문제를 방지하는 데 도움이 되므로 항상 설정할 것을 권장합니다.                                                                                                                                                             | `$\{application.name\}`                                                                    |
| `sessionTimeout`              | 서버에서 세션을 캐시하는 시간(단위: 시간)입니다.                                                                                                                                                                                                                                                                                                               | `2`                                                                                        |
| `verificationDepth`           | 검증할 인증서 체인의 최대 길이입니다. 인증서 체인 길이가 설정된 값을 초과하면 검증이 실패합니다.                                                                                                                                                                                                                                                                                    | `9`                                                                                        |
| `verificationMode`            | 노드 인증서를 검증하는 방식입니다. 자세한 내용은 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 클래스 설명을 참조하십시오. 설정 가능한 값: `none`, `relaxed`, `strict`, `once`.                                                                                                                                      | `relaxed`                                                                                  |

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


## openSSL.client.caConfig \{#openssl.client.caconfig\}

신뢰할 수 있는 CA 인증서가 포함된 파일 또는 디렉터리의 경로입니다. 파일을 가리키는 경우 PEM 형식이어야 하며 여러 개의 CA 인증서를 포함할 수 있습니다. 디렉터리를 가리키는 경우 CA 인증서마다 하나의 .pem 파일이 있어야 합니다. 파일 이름은 CA subject name의 해시 값으로 조회됩니다. 자세한 내용은 [SSL_CTX_load_verify_locations](https://docs.openssl.org/3.0/man3/SSL_CTX_load_verify_locations/)의 man 페이지를 참고하십시오.

## openSSL.client.cacheSessions \{#openssl.client.cachesessions\}

<SettingsInfoBlock type="Bool" default_value="0" />세션을 캐시할지 여부를 설정합니다. `<sessionIdContext>`와 함께 사용해야 합니다. 허용되는 값: `<true>`, `<false>`.

## openSSL.client.certificateFile \{#openssl.client.certificatefile\}

PEM 형식의 클라이언트/서버 인증서 파일의 경로입니다. `<privateKeyFile>`에 인증서가 포함되어 있으면 생략할 수 있습니다.

## openSSL.client.cipherList \{#openssl.client.cipherlist\}

<SettingsInfoBlock type="String" default_value="ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH" />지원되는 OpenSSL 암호화 알고리즘입니다.

## openSSL.client.disableProtocols \{#openssl.client.disableprotocols\}

사용이 허용되지 않는 프로토콜을 지정합니다.

## openSSL.client.extendedVerification \{#openssl.client.extendedverification\}

<SettingsInfoBlock type="Bool" default_value="0" />활성화하면 인증서의 CN 또는 SAN이 피어 호스트 이름과 일치하는지 검증합니다.

## openSSL.client.fips \{#openssl.client.fips\}

<SettingsInfoBlock type="Bool" default_value="0" />OpenSSL FIPS 모드를 활성화합니다. 사용 중인 라이브러리의 OpenSSL 버전에서 FIPS를 지원하는 경우에만 사용 가능합니다.

## openSSL.client.invalidCertificateHandler.name \{#openssl.client.invalidcertificatehandler.name\}

<SettingsInfoBlock type="String" default_value="RejectCertificateHandler" />유효하지 않은 인증서를 검증하는 클래스입니다(CertificateHandler의 서브클래스). 예: `<<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>>`.

## openSSL.client.loadDefaultCAFile \{#openssl.client.loaddefaultcafile\}

<SettingsInfoBlock type="Bool" default_value="1" />OpenSSL에서 내장 CA 인증서를 사용할지 여부를 결정합니다. ClickHouse는 내장 CA 인증서가 파일 `</etc/ssl/cert.pem>`(또는 디렉터리 `</etc/ssl/certs>`)에 있거나, 환경 변수 `<SSL_CERT_FILE>`(또는 `<SSL_CERT_DIR>`)로 지정된 파일(또는 디렉터리)에 있다고 가정합니다.

## openSSL.client.preferServerCiphers \{#openssl.client.preferserverciphers\}

<SettingsInfoBlock type="Bool" default_value="0" />클라이언트가 선호하는 서버 측 암호화 스위트입니다.

## openSSL.client.privateKeyFile \{#openssl.client.privatekeyfile\}

PEM 인증서의 개인 키가 들어 있는 파일의 경로입니다. 파일에는 키와 인증서가 동시에 포함될 수 있습니다.

## openSSL.client.privateKeyPassphraseHandler.name \{#openssl.client.privatekeypassphrasehandler.name\}

<SettingsInfoBlock type="String" default_value="KeyConsoleHandler" />개인 키에 액세스하기 위한 패스프레이스를 요청하는 클래스(PrivateKeyPassphraseHandler 서브클래스)입니다. 예: `<<privateKeyPassphraseHandler>>`, `<<name>KeyFileHandler</name>>`, `<<options><password>test</password></options>>`, `<</privateKeyPassphraseHandler>>`

## openSSL.client.requireTLSv1 \{#openssl.client.requiretlsv1\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1 연결을 요구합니다. 허용 가능한 값: `<true>`, `<false>`.

## openSSL.client.requireTLSv1_1 \{#openssl.client.requiretlsv1_1\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1.1 연결을 요구합니다. 사용 가능한 값: `<true>`, `<false>`.

## openSSL.client.requireTLSv1_2 \{#openssl.client.requiretlsv1_2\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1.2 연결을 요구합니다. 허용되는 값은 `<true>`, `<false>`입니다.

## openSSL.client.verificationDepth \{#openssl.client.verificationdepth\}

<SettingsInfoBlock type="UInt64" default_value="9" />검증 체인의 최대 길이입니다. 인증서 체인의 길이가 설정된 값을 초과하면 검증이 실패합니다.

## openSSL.client.verificationMode \{#openssl.client.verificationmode\}

<SettingsInfoBlock type="String" default_value="relaxed" />노드의 인증서를 확인하는 방법입니다. 자세한 내용은 [Context](https://github.com/ClickHouse/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 클래스 설명을 참고하십시오. 가능한 값: `<none>`, `<relaxed>`, `<strict>`, `<once>`.

## openSSL.server.caConfig \{#openssl.server.caconfig\}

신뢰할 수 있는 CA 인증서가 포함된 파일 또는 디렉터리의 경로를 지정합니다. 이 설정이 파일을 가리키는 경우 해당 파일은 PEM 형식이어야 하며, 여러 개의 CA 인증서를 포함할 수 있습니다. 이 설정이 디렉터리를 가리키는 경우 각 CA 인증서마다 하나의 .pem 파일이 있어야 합니다. 파일 이름은 CA subject name의 해시 값으로 조회됩니다. 자세한 내용은 [SSL_CTX_load_verify_locations](https://docs.openssl.org/3.0/man3/SSL_CTX_load_verify_locations/)의 man 페이지를 참고하십시오.

## openSSL.server.cacheSessions \{#openssl.server.cachesessions\}

<SettingsInfoBlock type="Bool" default_value="0" />세션 캐싱을 활성화하거나 비활성화합니다. `<sessionIdContext>`와 함께 사용해야 합니다. 허용되는 값: `<true>`, `<false>`.

## openSSL.server.certificateFile \{#openssl.server.certificatefile\}

PEM 형식의 클라이언트/서버 인증서 파일의 경로입니다. 인증서가 `<privateKeyFile>`에 포함되어 있으면 생략할 수 있습니다.

## openSSL.server.cipherList \{#openssl.server.cipherlist\}

<SettingsInfoBlock type="String" default_value="ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH" />지원되는 OpenSSL 암호 알고리즘입니다.

## openSSL.server.disableProtocols \{#openssl.server.disableprotocols\}

사용이 허용되지 않는 프로토콜을 의미합니다.

## openSSL.server.extendedVerification \{#openssl.server.extendedverification\}

<SettingsInfoBlock type="Bool" default_value="0" />이 설정을 활성화하면 인증서의 CN 또는 SAN이 피어 호스트 이름과 일치하는지 확인합니다.

## openSSL.server.fips \{#openssl.server.fips\}

<SettingsInfoBlock type="Bool" default_value="0" />OpenSSL FIPS 모드를 활성화합니다. 사용 중인 라이브러리의 OpenSSL 버전이 FIPS를 지원하는 경우에만 사용할 수 있습니다.

## openSSL.server.invalidCertificateHandler.name \{#openssl.server.invalidcertificatehandler.name\}

<SettingsInfoBlock type="String" default_value="RejectCertificateHandler" />유효하지 않은 인증서를 검증하는 클래스(CertificateHandler의 서브클래스)입니다. 예: `<<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>>`.

## openSSL.server.loadDefaultCAFile \{#openssl.server.loaddefaultcafile\}

<SettingsInfoBlock type="Bool" default_value="1" />OpenSSL에서 내장 CA 인증서를 사용할지 여부를 결정합니다. ClickHouse는 내장 CA 인증서가 파일 `</etc/ssl/cert.pem>`(또는 디렉터리 `</etc/ssl/certs>`)에 있거나, 환경 변수 `<SSL_CERT_FILE>`(또는 `<SSL_CERT_DIR>`)로 지정된 파일(또는 디렉터리)에 있다고 가정합니다.

## openSSL.server.preferServerCiphers \{#openssl.server.preferserverciphers\}

<SettingsInfoBlock type="Bool" default_value="0" />서버가 선호하는 암호 스위트를 사용하도록 합니다.

## openSSL.server.privateKeyFile \{#openssl.server.privatekeyfile\}

PEM 인증서의 개인 키가 저장된 파일 경로입니다. 이 파일에는 키와 인증서가 함께 포함될 수 있습니다.

## openSSL.server.privateKeyPassphraseHandler.name \{#openssl.server.privatekeypassphrasehandler.name\}

<SettingsInfoBlock type="String" default_value="KeyConsoleHandler" />개인 키에 접근하기 위한 암호 문구를 요청하는 클래스입니다(PrivateKeyPassphraseHandler의 서브클래스). 예: `<<privateKeyPassphraseHandler>>`, `<<name>KeyFileHandler</name>>`, `<<options><password>test</password></options>>`, `<</privateKeyPassphraseHandler>>`

## openSSL.server.requireTLSv1 \{#openssl.server.requiretlsv1\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1 연결을 요구합니다. 허용되는 값: `<true>`, `<false>`.

## openSSL.server.requireTLSv1_1 \{#openssl.server.requiretlsv1_1\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1.1 연결을 필수로 합니다. 허용되는 값: `<true>`, `<false>`.

## openSSL.server.requireTLSv1_2 \{#openssl.server.requiretlsv1_2\}

<SettingsInfoBlock type="Bool" default_value="0" />TLSv1.2 연결을 요구합니다. 허용되는 값: `<true>`, `<false>`.

## openSSL.server.sessionCacheSize \{#openssl.server.sessioncachesize\}

<SettingsInfoBlock type="UInt64" default_value="20480" />서버가 캐시하는 세션의 최대 개수입니다. 값이 0이면 세션 수가 무제한입니다.

## openSSL.server.sessionIdContext \{#openssl.server.sessionidcontext\}

<SettingsInfoBlock type="String" default_value="application.name" />서버가 생성하는 각 식별자에 추가하는 고유한 무작위 문자 집합입니다. 문자열 길이는 `<SSL_MAX_SSL_SESSION_ID_LENGTH>` 값을 초과할 수 없습니다. 이 매개변수는 서버가 세션을 캐시하는 경우와 클라이언트가 캐싱을 요청한 경우 모두에 발생할 수 있는 문제를 방지하는 데 도움이 되므로, 항상 설정할 것을 권장합니다.

## openSSL.server.sessionTimeout \{#openssl.server.sessiontimeout\}

<SettingsInfoBlock type="UInt64" default_value="2" />서버가 세션을 캐시하는 기간(시간 단위)입니다.

## openSSL.server.verificationDepth \{#openssl.server.verificationdepth\}

<SettingsInfoBlock type="UInt64" default_value="9" />검증 체인의 최대 길이입니다. 인증서 체인 길이가 이 값을 초과하면 검증이 실패합니다.

## openSSL.server.verificationMode \{#openssl.server.verificationmode\}

<SettingsInfoBlock type="String" default_value="relaxed" />노드의 인증서를 검증하는 방법입니다. 자세한 내용은 [Context](https://github.com/ClickHouse/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 클래스 설명을 참고하십시오. 가능한 값: `<none>`, `<relaxed>`, `<strict>`, `<once>`.

## opentelemetry_span_log \{#opentelemetry_span_log\}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

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


## os_collect_psi_metrics \{#os_collect_psi_metrics\}

<SettingsInfoBlock type="Bool" default_value="1" />/proc/pressure/ 파일에서 PSI 메트릭을 수집하도록 활성화합니다.

## os_cpu_busy_time_threshold \{#os_cpu_busy_time_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />CPU가 실제로 유용한 작업을 수행하고 있다고 간주하기 위한 OS CPU 바쁜 시간(OSCPUVirtualTimeMicroseconds 메트릭 기준)의 마이크로초 단위 임계값입니다. 바쁜 시간이 이 값보다 작으면 CPU 과부하로 간주되지 않습니다.

## os_threads_nice_value_distributed_cache_tcp_handler \{#os_threads_nice_value_distributed_cache_tcp_handler\}

<SettingsInfoBlock type="Int32" default_value="0" />

분산 캐시 TCP 핸들러 스레드에 대한 Linux nice 값입니다. 값이 낮을수록 CPU 우선순위가 높아집니다.

CAP_SYS_NICE 권한이 필요하며, 그렇지 않으면 아무 동작도 하지 않습니다.

가능한 값: -20부터 19까지입니다.

## os_threads_nice_value_merge_mutate \{#os_threads_nice_value_merge_mutate\}

<SettingsInfoBlock type="Int32" default_value="0" />

merge 및 mutation 스레드용 Linux nice 값입니다. 값이 낮을수록 CPU 우선순위가 더 높아집니다.

CAP_SYS_NICE capability가 필요하며, 그렇지 않으면 아무 동작도 하지 않습니다.

가능한 값: -20부터 19까지.

## os_threads_nice_value_zookeeper_client_send_receive \{#os_threads_nice_value_zookeeper_client_send_receive\}

<SettingsInfoBlock type="Int32" default_value="0" />

ZooKeeper 클라이언트에서 송신 및 수신 스레드에 사용할 Linux nice 값입니다. 값이 낮을수록 CPU 우선순위가 높아집니다.

CAP_SYS_NICE capability가 필요하며, 없으면 아무 효과도 없습니다.

가능한 값: -20부터 19까지.

## page_cache_free_memory_ratio \{#page_cache_free_memory_ratio\}

<SettingsInfoBlock type="Double" default_value="0.15" />사용자 공간(userspace) 페이지 캐시에서 비워 둘 메모리 한도의 비율입니다. Linux의 `min_free_kbytes` 설정과 유사합니다.

## page_cache_history_window_ms \{#page_cache_history_window_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />해제된 메모리가 userspace 페이지 캐시에서 다시 사용될 수 있기까지의 지연 시간(밀리초)입니다.

## page_cache_max_size \{#page_cache_max_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />사용자 공간 페이지 캐시의 최대 크기입니다. 캐시를 비활성화하려면 0으로 설정합니다. 값이 page_cache_min_size보다 크면 사용 가능한 메모리를 최대한 활용하면서 전체 메모리 사용량이 제한값(max_server_memory_usage[_to_ram_ratio]) 아래로 유지되도록 이 범위 내에서 캐시 크기가 계속해서 조정됩니다.

## page_cache_min_size \{#page_cache_min_size\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />사용자 공간(userspace) 페이지 캐시의 최소 크기입니다.

## page_cache_policy \{#page_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Userspace 페이지 캐시 정책의 이름입니다.

## page_cache_shards \{#page_cache_shards\}

<SettingsInfoBlock type="UInt64" default_value="4" />뮤텍스 경합을 줄이기 위해 userspace 페이지 캐시를 이 수만큼의 세그먼트에 스트라이핑합니다. 실험적 기능이며, 성능이 향상될 가능성은 낮습니다.

## page_cache_size_ratio \{#page_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />사용자 공간 페이지 캐시에서 보호된 큐의 크기가 캐시 전체 크기에서 차지하는 비율입니다.

## part_log \{#part_log\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)와 관련된 이벤트를 기록합니다. 예를 들어 데이터 추가나 병합 작업이 있습니다. 이 로그를 사용하여 병합 알고리즘을 시뮬레이션하고 그 특성을 비교할 수 있습니다. 병합 과정을 시각화할 수도 있습니다.

쿼리는 별도의 파일이 아니라 [system.part&#95;log](/operations/system-tables/part_log) 테이블에 기록됩니다. 이 테이블의 이름은 아래에 설명된 `table` 매개변수에서 설정할 수 있습니다.

<SystemLogParameters />

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


## parts_kill_delay_period \{#parts_kill_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

SharedMergeTree의 파트를 완전히 제거하기까지의 기간입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## parts_kill_delay_period_random_add \{#parts_kill_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

테이블 수가 매우 많을 때 thundering herd 효과 및 그로 인한 ZooKeeper에 대한 DoS(서비스 거부)를 방지하기 위해 `kill_delay_period`에 0초에서 x초 사이의 균등 분포를 따르는 값을 추가합니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## parts_killer_pool_size \{#parts_killer_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="128" />

공유 MergeTree 파트(parts)를 정리하는 parts killer 스레드 풀의 스레드 수입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## path \{#path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/" />

데이터가 저장된 디렉터리 경로입니다.

:::note
경로 끝에 슬래시가 반드시 포함되어야 합니다.
:::

**예제**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql_port \{#postgresql_port\}

PostgreSQL 프로토콜을 통해 클라이언트와 통신하는 데 사용하는 포트입니다.

:::note

* 양의 정수는 수신 대기할 포트 번호를 지정합니다.
* 값을 비워 두면 PostgreSQL 프로토콜을 통한 클라이언트와의 통신이 비활성화됩니다.
  :::

**예제**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport \{#postgresql_require_secure_transport\}

<SettingsInfoBlock type="Bool" default_value="0" />true로 설정하면 [postgresql_port](/operations/server-configuration-parameters/settings#postgresql_port)를 통한 클라이언트와의 보안 통신이 필수입니다. `<sslmode=disable>` 옵션으로 연결을 시도하는 경우 연결이 거부됩니다. [OpenSSL](/operations/server-configuration-parameters/settings#openssl) 설정과 함께 사용하십시오.

## prefetch_threadpool_pool_size \{#prefetch_threadpool_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />원격 객체 스토리지용 프리페치 작업을 처리하는 백그라운드 풀의 크기

## prefetch_threadpool_queue_size \{#prefetch_threadpool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />prefetch 풀에 넣을 수 있는 작업 수입니다

## prefixes_deserialization_thread_pool_thread_pool_queue_size \{#prefixes_deserialization_thread_pool_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

prefixes 역직렬화 Thread pool에 스케줄링될 수 있는 작업 수의 최대값입니다.

:::note
값이 `0`이면 제한이 없음을 의미합니다.
:::

## prepare_system_log_tables_on_startup \{#prepare_system_log_tables_on_startup\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정 값이 true이면 ClickHouse는 시작하기 전에 구성된 모든 `system.*_log` 테이블을 미리 생성합니다. 일부 시작 스크립트가 이러한 테이블에 의존하는 경우 유용합니다.

## primary_index_cache_policy \{#primary_index_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />프라이머리 인덱스 캐시 정책의 이름입니다.

## primary_index_cache_prewarm_ratio \{#primary_index_cache_prewarm_ratio\}

<SettingsInfoBlock type="Double" default_value="0.95" />프리웜(prewarm) 과정에서 미리 채워 둘 마크 캐시(mark cache)의 전체 크기에 대한 비율입니다.

## primary_index_cache_size \{#primary_index_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />MergeTree 계열 테이블의 프라이머리 인덱스 캐시 최대 크기입니다.

## primary_index_cache_size_ratio \{#primary_index_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />기본 인덱스 캐시에서 보호 큐(SLRU 정책인 경우)의 크기를 캐시 전체 크기를 기준으로 한 비율로 지정합니다.

## process_query_plan_packet \{#process_query_plan_packet\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정은 QueryPlan 패킷을 읽도록 허용합니다. 이 패킷은 `serialize_query_plan`이 활성화되어 있을 때 분산 쿼리에 대해 전송됩니다.
쿼리 플랜 바이너리 역직렬화 과정의 버그로 인해 발생할 수 있는 잠재적 보안 문제를 피하기 위해 기본적으로 비활성화되어 있습니다.

**예시**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors_profile_log \{#processors_profile_log\}

[`processors_profile_log`](../system-tables/processors_profile_log.md) 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

기본 설정은 다음과 같습니다.

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


## prometheus \{#prometheus\}

[Prometheus](https://prometheus.io)에서 스크레이핑할 수 있도록 메트릭 데이터를 노출합니다.

설정:

* `endpoint` – Prometheus 서버가 메트릭을 스크레이핑하기 위한 HTTP 엔드포인트입니다. &#39;/&#39;로 시작해야 합니다.
* `port` – `endpoint`에 대한 포트입니다.
* `metrics` – [system.metrics](/operations/system-tables/metrics) 테이블의 메트릭을 노출합니다.
* `events` – [system.events](/operations/system-tables/events) 테이블의 메트릭을 노출합니다.
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 테이블의 현재 메트릭 값을 노출합니다.
* `errors` - 마지막 서버 재시작 이후 오류 코드별 오류 발생 횟수를 노출합니다. 이 정보는 [system.errors](/operations/system-tables/errors) 테이블에서도 확인할 수 있습니다.

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

확인하십시오 (`127.0.0.1`를 ClickHouse 서버의 IP 주소나 호스트 이름으로 바꾸십시오):

```bash
curl 127.0.0.1:9363/metrics
```


## prometheus.keeper_metrics_only \{#prometheus.keeper_metrics_only\}

<SettingsInfoBlock type="Bool" default_value="0" />Keeper 관련 메트릭을 노출합니다.

## proxy \{#proxy\}

현재 S3 스토리지, S3 테이블 함수, URL 함수에서 지원하는 HTTP 및 HTTPS 요청에 사용할 프록시 서버를 정의합니다.

프록시 서버를 정의하는 방법은 세 가지가 있습니다:

* 환경 변수
* 프록시 목록
* 원격 프록시 리졸버

`no_proxy`를 사용하여 특정 호스트에 대해 프록시 서버를 우회하도록 설정하는 것도 지원합니다.

**Environment variables**

`http_proxy` 및 `https_proxy` 환경 변수를 사용하면 해당 프로토콜에 사용할 프록시 서버를 지정할 수 있습니다. 시스템에 이 변수가 설정되어 있다면 별도의 추가 작업 없이 그대로 동작합니다.

특정 프로토콜에 대해 프록시 서버가 하나뿐이고, 해당 프록시 서버가 변경되지 않는 경우에 사용할 수 있는 가장 단순한 방법입니다.

**Proxy lists**

이 방법을 사용하면 하나 이상의 프록시 서버를 프로토콜별로 지정할 수 있습니다. 둘 이상의 프록시 서버가 정의된 경우 ClickHouse는 서버 간 부하를 분산하기 위해 라운드 로빈 방식으로 서로 다른 프록시를 사용합니다. 프로토콜별로 프록시 서버가 여러 개이고 프록시 서버 목록이 변경되지 않는 경우에 가장 단순한 방법입니다.

**Configuration template**

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

아래 탭에서 부모 필드를 선택하여 자식 필드를 확인하십시오:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | 필드        | 설명                  |
    | --------- | ------------------- |
    | `<http>`  | 하나 이상의 HTTP 프록시 목록  |
    | `<https>` | 하나 이상의 HTTPS 프록시 목록 |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | 필드      | 설명       |
    | ------- | -------- |
    | `<uri>` | 프록시의 URI |
  </TabItem>
</Tabs>

**원격 프록시 리졸버(Remote proxy resolver)**

프록시 서버가 동적으로 변경될 수 있습니다.
이 경우 리졸버의 엔드포인트를 정의할 수 있습니다. ClickHouse는 해당 엔드포인트로 본문이 없는 GET 요청을 보내며, 원격 리졸버는 프록시 호스트를 반환해야 합니다.
ClickHouse는 다음 템플릿을 사용하여 프록시 URI를 생성합니다: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**구성 템플릿(Configuration template)**

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

아래 탭에서 상위 필드를 선택하면 해당 하위 필드를 확인할 수 있습니다:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description            |
    | --------- | ---------------------- |
    | `<http>`  | 하나 이상의 resolver* 목록입니다 |
    | `<https>` | 하나 이상의 resolver* 목록입니다 |
  </TabItem>

  <TabItem value="http_https" label="<http> 및 <https>">
    | Field        | Description                     |
    | ------------ | ------------------------------- |
    | `<resolver>` | resolver에 대한 엔드포인트와 기타 세부 정보입니다 |

    :::note
    여러 개의 `<resolver>` 요소를 둘 수 있지만, 특정 프로토콜에 대해서는
    첫 번째 `<resolver>`만 사용됩니다. 해당 프로토콜에 대한 나머지
    `<resolver>` 요소는 무시됩니다. 따라서 부하 분산이 필요하다면
    원격 resolver에서 구현해야 합니다.
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Field                | Description                                                                                                        |
    | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
    | `<endpoint>`         | 프록시 resolver의 URI입니다                                                                                               |
    | `<proxy_scheme>`     | 최종 프록시 URI의 프로토콜입니다. `http` 또는 `https` 중 하나입니다.                                                                    |
    | `<proxy_port>`       | 프록시 resolver의 포트 번호입니다                                                                                             |
    | `<proxy_cache_time>` | resolver에서 가져온 값을 ClickHouse가 캐시해야 하는 시간(초)입니다. 이 값을 `0`으로 설정하면 ClickHouse가 모든 HTTP 또는 HTTPS 요청마다 resolver에 연결합니다. |
  </TabItem>
</Tabs>

**우선순위**

프록시 설정은 다음 순서로 결정됩니다.

| Order | Setting         |
| ----- | --------------- |
| 1.    | 원격 프록시 resolver |
| 2.    | 프록시 목록          |
| 3.    | 환경 변수           |


ClickHouse는 요청 프로토콜에 대해 우선순위가 가장 높은 resolver 유형을 확인합니다. 해당 유형이 정의되어 있지 않으면,
환경 resolver에 도달할 때까지 그다음으로 우선순위가 높은 resolver 유형을 순서대로 확인합니다.
이를 통해 서로 다른 resolver 유형을 함께 사용할 수도 있습니다.

## query_cache \{#query_cache\}

[쿼리 캐시](../query-cache.md) 구성입니다.

다음 설정을 사용할 수 있습니다:

| Setting                   | Description                                    | Default Value |
| ------------------------- | ---------------------------------------------- | ------------- |
| `max_entries`             | 캐시에 저장되는 `SELECT` 쿼리 결과의 최대 개수입니다.             | `1024`        |
| `max_entry_size_in_bytes` | 캐시에 저장할 수 있는 `SELECT` 쿼리 결과의 최대 크기(바이트 단위)입니다. | `1048576`     |
| `max_entry_size_in_rows`  | 캐시에 저장할 수 있는 `SELECT` 쿼리 결과의 최대 행 수입니다.        | `30000000`    |
| `max_size_in_bytes`       | 캐시의 최대 크기(바이트 단위)입니다. `0`이면 쿼리 캐시가 비활성화됩니다.    | `1073741824`  |

:::note

* 변경된 설정은 즉시 적용됩니다.
* 쿼리 캐시의 데이터는 DRAM에 할당됩니다. 메모리가 부족한 경우 `max_size_in_bytes` 값을 작게 설정하거나 쿼리 캐시를 완전히 비활성화하는 것이 좋습니다.
  :::

**예시**

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```


## query_cache.max_entries \{#query_cache.max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1024" />캐시에 저장할 수 있는 SELECT 쿼리 결과의 최대 개수입니다.

## query_cache.max_entry_size_in_bytes \{#query_cache.max_entry_size_in_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />캐시에 저장되는 SELECT 쿼리 결과의 최대 허용 크기(바이트 단위)입니다.

## query_cache.max_entry_size_in_rows \{#query_cache.max_entry_size_in_rows\}

<SettingsInfoBlock type="UInt64" default_value="30000000" />캐시에 저장될 수 있는 SELECT 쿼리 결과의 최대 행 수입니다.

## query_cache.max_size_in_bytes \{#query_cache.max_size_in_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />캐시의 최대 크기(바이트)입니다. 0으로 설정하면 쿼리 캐시가 비활성화됩니다.

## query_condition_cache_policy \{#query_condition_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />쿼리 조건 캐시 정책의 이름입니다.

## query_condition_cache_size \{#query_condition_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

쿼리 조건 캐시의 최대 크기입니다.
:::note
이 설정은 서버 실행 중에도 변경할 수 있으며, 변경 사항이 즉시 적용됩니다.
:::

## query_condition_cache_size_ratio \{#query_condition_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />쿼리 조건 캐시에서 보호 큐의 크기(SLRU 정책인 경우)를 캐시 전체 크기에 대한 비율로 지정합니다.

## query_log \{#query_log\}

[log&#95;queries=1](../../operations/settings/settings.md) 설정으로 수신된 쿼리를 로깅하기 위한 설정입니다.

쿼리는 별도 파일이 아니라 [system.query&#95;log](/operations/system-tables/query_log) 테이블에 기록됩니다. `table` 매개변수에서 테이블 이름을 변경할 수 있습니다(아래 참조).

<SystemLogParameters />

테이블이 존재하지 않으면 ClickHouse가 테이블을 생성합니다. ClickHouse 서버가 업데이트되면서 쿼리 로그의 구조가 변경된 경우, 기존 구조를 가진 테이블의 이름이 변경되고 새로운 테이블이 자동으로 생성됩니다.

**예시**

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


## query_masking_rules \{#query_masking_rules\}

정규 표현식 기반 규칙으로, 서버 로그에 저장되기 전에 쿼리뿐만 아니라 모든 로그 메시지에 적용됩니다.
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) 테이블과 클라이언트로 전송되는 로그에 모두 적용되어, 이름, 이메일, 개인 식별자, 신용카드 번호와 같은 SQL 쿼리의 민감한 데이터가 로그로 유출되는 것을 방지합니다.

**예시**

```xml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**설정 필드**:

| Setting   | Description                          |
| --------- | ------------------------------------ |
| `name`    | 규칙의 이름 (선택 사항)                       |
| `regexp`  | RE2 호환 정규 표현식 (필수)                   |
| `replace` | 민감한 데이터를 대체할 문자열 (선택 사항, 기본값은 별표 6개) |

마스킹 규칙은 전체 쿼리에 적용되어, 형식이 잘못되었거나 파싱할 수 없는 쿼리에서 민감한 데이터가 유출되는 것을 방지합니다.

[`system.events`](/operations/system-tables/events) 테이블에는 `QueryMaskingRulesMatch` 카운터가 있으며, 전체 쿼리 마스킹 규칙의 일치 횟수를 나타냅니다.

분산 쿼리를 사용하는 경우 각 서버를 개별적으로 설정해야 하며, 그렇지 않으면 다른 노드로 전달되는 서브쿼리가 마스킹되지 않은 상태로 저장됩니다.


## query_metric_log \{#query_metric_log\}

기본적으로 비활성화되어 있습니다.

**활성화**

메트릭 이력 수집 기능 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)을(를) 수동으로 활성화하려면 다음 내용을 포함하는 `/etc/clickhouse-server/config.d/query_metric_log.xml` 파일을 생성하십시오:

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

`query_metric_log` 설정을 비활성화하려면 다음 내용을 포함하는 파일 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`을 생성해야 합니다:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query_thread_log \{#query_thread_log\}

[log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) 설정으로 수신된 쿼리 스레드를 로깅하기 위한 설정입니다.

쿼리는 별도의 파일이 아니라 [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) 테이블에 로깅됩니다. `table` 매개변수에서 테이블 이름을 변경할 수 있습니다(아래 참조).

<SystemLogParameters />

테이블이 존재하지 않으면 ClickHouse가 테이블을 생성합니다. ClickHouse 서버가 업데이트될 때 쿼리 스레드 로그의 구조가 변경된 경우, 이전 구조를 가진 테이블의 이름이 변경되고 새 테이블이 자동으로 생성됩니다.

**예시**

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


## query_views_log \{#query_views_log\}

[log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 설정과 함께 수신된 쿼리에 따라 VIEW(라이브, 구체화된 뷰(Materialized View) 등)를 로깅하기 위한 설정입니다.

쿼리는 별도 파일이 아니라 [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) 테이블에 기록됩니다. `table` 파라미터에서 테이블 이름을 변경할 수 있습니다(아래 참조).

<SystemLogParameters />

테이블이 존재하지 않으면 ClickHouse가 테이블을 생성합니다. ClickHouse 서버가 업데이트되면서 query views 로그의 구조가 변경된 경우, 이전 구조의 테이블 이름이 변경되고 새로운 테이블이 자동으로 생성됩니다.

**예시**

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


## remap_executable \{#remap_executable\}

<SettingsInfoBlock type="Bool" default_value="0" />

huge page를 사용하여 머신 코드(「text」) 영역의 메모리를 재할당하도록 설정합니다.

:::note
이 기능은 매우 실험적인 기능입니다.
:::

**예시**

```xml
<remap_executable>false</remap_executable>
```


## remote_servers \{#remote_servers\}

[Distributed](../../engines/table-engines/special/distributed.md) 테이블 엔진과 `cluster` 테이블 FUNCTION에서 사용하는 클러스터를 구성하는 설정입니다.

**예시**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

`incl` 속성의 값은 「[설정 파일](/operations/configuration-files)」 절을 참조하십시오.

**참고**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [클러스터 디스커버리](../../operations/cluster-discovery.md)
* [복제된 데이터베이스 엔진(Replicated database engine)](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts \{#remote_url_allow_hosts\}

URL과 관련된 스토리지 엔진과 테이블 함수에서 사용할 수 있도록 허용된 호스트 목록입니다.

`\<host\>` XML 태그로 호스트를 추가할 때:

* URL에 있는 것과 정확히 동일하게 지정해야 합니다. 이름은 DNS 조회 전에 검증됩니다. 예: `<host>clickhouse.com</host>`
* URL에서 포트가 명시적으로 지정된 경우, host:port 전체가 하나의 값으로 검증됩니다. 예: `<host>clickhouse.com:80</host>`
* 포트 없이 호스트만 지정된 경우, 해당 호스트의 모든 포트가 허용됩니다. 예: `<host>clickhouse.com</host>` 가 지정되면 `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) 등이 허용됩니다.
* 호스트가 IP 주소로 지정된 경우, URL에 지정된 그대로 검증됩니다. 예: `[2a02:6b8:a::a]`.
* 리다이렉트가 있고 리다이렉트 지원이 활성화되어 있으면, 모든 리다이렉트(HTTP 응답의 Location 필드)가 검증됩니다.

예:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica_group_name \{#replica_group_name\}

Replicated 데이터베이스용 레플리카 그룹 이름입니다.

Replicated 데이터베이스로 생성된 클러스터는 동일한 그룹에 속한 레플리카들로 구성됩니다.
DDL 쿼리는 동일한 그룹에 속한 레플리카만을 기다립니다.

기본적으로 비어 있습니다.

**예시**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout \{#replicated_fetches_http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />파트(part) 페치 요청에 대한 HTTP 연결 타임아웃입니다. 명시적으로 설정하지 않으면 기본 프로필의 `http_connection_timeout` 값을 따릅니다.

## replicated_fetches_http_receive_timeout \{#replicated_fetches_http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />fetch part 요청에 대한 HTTP 수신 타임아웃입니다. 명시적으로 설정하지 않으면 기본 프로필의 `http_receive_timeout`을(를) 따릅니다.

## replicated_fetches_http_send_timeout \{#replicated_fetches_http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />파트 가져오기 요청에 대한 HTTP 전송 타임아웃입니다. 명시적으로 설정되지 않은 경우 기본 프로필의 `http_send_timeout` 값을 사용합니다.

## replicated_merge_tree \{#replicated_merge_tree\}

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에 대한 세부 설정입니다. 이 설정의 우선순위가 더 높습니다.

자세한 내용은 MergeTreeSettings.h 헤더 파일을 참조하십시오.

**예제**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads \{#restore_threads\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />RESTORE 요청을 처리하기 위해 사용할 최대 스레드 수입니다.

## s3_credentials_provider_max_cache_size \{#s3_credentials_provider_max_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />캐시할 수 있는 S3 자격 증명 공급자 수의 최대값입니다

## s3_max_redirects \{#s3_max_redirects\}

<SettingsInfoBlock type="UInt64" default_value="10" />허용되는 S3 리디렉션 홉 수의 최대값입니다.

## s3_retry_attempts \{#s3_retry_attempts\}

<SettingsInfoBlock type="UInt64" default_value="500" />Aws::Client::RetryStrategy에 대한 설정입니다. Aws::Client가 요청을 자체적으로 재시도하며, 0이면 재시도를 수행하지 않습니다.

## s3queue_disable_streaming \{#s3queue_disable_streaming\}

<SettingsInfoBlock type="Bool" default_value="0" />테이블이 생성되어 있고 연결된 구체화된 뷰(Materialized View)가 있더라도 S3Queue에서 스트리밍을 비활성화합니다

## s3queue_log \{#s3queue_log\}

`s3queue_log` 시스템 테이블에 대한 설정입니다.

<SystemLogParameters />

기본 설정은 다음과 같습니다.

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## send_crash_reports \{#send_crash_reports\}

ClickHouse 코어 개발 팀으로 크래시 리포트를 전송하기 위한 설정입니다.

특히 프리 프로덕션(pre-production) 환경에서 이 기능을 활성화해 두는 것을 권장합니다.

Keys:

| Key                   | Description                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `enabled`             | 기능을 활성화할지 여부를 결정하는 불리언(Boolean) 플래그입니다. 기본값은 `true`입니다. 크래시 리포트를 전송하지 않으려면 `false`로 설정합니다.                       |
| `endpoint`            | 크래시 리포트를 전송할 endpoint URL을 재정의할 수 있습니다.                                                                          |
| `send_logical_errors` | `LOGICAL_ERROR`는 `assert`와 유사한 것으로, ClickHouse의 버그를 의미합니다. 이 불리언(Boolean) 플래그는 이러한 예외를 전송하도록 설정합니다(기본값: `true`). |

**권장 사용 방법**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path \{#series_keeper_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

`generateSerialID` 함수로 생성되는 자동 증가 번호가 포함된 Keeper 경로입니다. 각 시리즈는 이 경로 아래의 노드가 됩니다.

## show_addresses_in_stack_traces \{#show_addresses_in_stack_traces\}

<SettingsInfoBlock type="Bool" default_value="1" />이 설정을 true로 하면 스택 트레이스에 주소가 표시됩니다.

## shutdown_wait_backups_and_restores \{#shutdown_wait_backups_and_restores\}

<SettingsInfoBlock type="Bool" default_value="1" />true로 설정하면 ClickHouse는 종료되기 전에 실행 중인 백업 및 복원 작업이 완료될 때까지 대기합니다.

## shutdown_wait_unfinished \{#shutdown_wait_unfinished\}

<SettingsInfoBlock type="UInt64" default_value="5" />완료되지 않은 쿼리를 기다리는 시간(초)

## shutdown_wait_unfinished_queries \{#shutdown_wait_unfinished_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />이 설정을 true로 지정하면 ClickHouse는 종료하기 전에 실행 중인 쿼리가 완료될 때까지 기다립니다.

## skip_binary_checksum_checks \{#skip_binary_checksum_checks\}

<SettingsInfoBlock type="Bool" default_value="0" />ClickHouse 바이너리의 체크섬 무결성 검사를 건너뜁니다

## skip_check_for_incorrect_settings \{#skip_check_for_incorrect_settings\}

<SettingsInfoBlock type="Bool" default_value="0" />

true로 설정하면 서버 설정이 올바른지 검사하지 않습니다.

**예시**

```xml
<skip_check_for_incorrect_settings>1</skip_check_for_incorrect_settings>
```


## snapshot_cleaner_period \{#snapshot_cleaner_period\}

<SettingsInfoBlock type="UInt64" default_value="120" />

SharedMergeTree에서 스냅샷 파트를 완전히 삭제하는 주기입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## snapshot_cleaner_pool_size \{#snapshot_cleaner_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="128" />

공유 MergeTree 스냅샷을 정리하는 스레드 수입니다. ClickHouse Cloud에서만 사용할 수 있습니다.

## ssh_server \{#ssh_server\}

호스트 키의 공개 키 부분은 첫 연결 시 SSH 클라이언트 측의 known&#95;hosts 파일에 기록됩니다.

호스트 키 설정은 기본적으로 비활성화되어 있습니다.
호스트 키 설정의 주석을 해제한 뒤, 각 ssh 키의 경로를 지정하여 활성화하십시오:

예:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms \{#startup_mv_delay_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />구체화된 뷰(Materialized View) 생성 지연을 재현하기 위한 디버그용 파라미터입니다

## startup_scripts.throw_on_error \{#startup_scripts.throw_on_error\}

<SettingsInfoBlock type="Bool" default_value="0" />true로 설정하면 스크립트 실행 중 오류가 발생한 경우 서버가 시작되지 않습니다.

## storage_configuration \{#storage_configuration\}

스토리지에 대해 다중 디스크 구성을 지원합니다.

스토리지 구성은 다음과 같은 구조를 따릅니다.

```xml
<storage_configuration>
    <disks>
        <!-- configuration -->
    </disks>
    <policies>
        <!-- configuration -->
    </policies>
</storage_configuration>
```


### 디스크 설정 \{#configuration-of-disks\}

`disks` 설정은 다음 구조를 따릅니다:

```xml
<storage_configuration>
    <disks>
        <disk_name_1>
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>
        ...
    </disks>
</storage_configuration>
```

위의 하위 태그는 `disks`에 대해 다음 설정을 정의합니다:

| Setting                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `<disk_name_N>`         | 디스크의 이름으로, 고유해야 합니다.                                          |
| `path`                  | 서버 데이터(`data` 및 `shadow` 카탈로그)가 저장될 경로입니다. 슬래시(`/`)로 끝나야 합니다. |
| `keep_free_space_bytes` | 디스크에 예약해 둘 여유 공간의 크기입니다.                                      |

:::note
디스크의 순서는 중요하지 않습니다.
:::


### 정책 구성 \{#configuration-of-policies\}

위의 하위 태그는 `policies`에 대해 다음 설정을 정의합니다:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 정책 이름입니다. 정책 이름은 고유해야 합니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `volume_name_N`              | 볼륨 이름입니다. 볼륨 이름은 고유해야 합니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `disk`                       | 볼륨 내부에 위치한 디스크입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | 이 볼륨의 모든 디스크에 존재할 수 있는 데이터 청크의 최대 크기입니다. 머지 결과로 예상되는 청크 크기가 `max_data_part_size_bytes`보다 커질 경우, 해당 청크는 다음 볼륨에 기록됩니다. 기본적으로 이 기능을 사용하면 새롭거나 작은 청크를 핫(SSD) 볼륨에 저장하고, 일정 크기에 도달하면 콜드(HDD) 볼륨으로 이동할 수 있습니다. 정책에 볼륨이 하나만 있는 경우에는 이 옵션을 사용하지 마십시오.                                                                 |
| `move_factor`                | 볼륨의 사용 가능한 여유 공간 비율입니다. 여유 공간이 이 값보다 작아지면 (존재하는 경우) 데이터가 다음 볼륨으로 이동하기 시작합니다. 이동 시에는 청크를 크기 기준으로 큰 것부터 작은 것까지(내림차순) 정렬하고, 합계 크기가 `move_factor` 조건을 만족하는 청크들을 선택합니다. 모든 청크의 총 크기가 충분하지 않은 경우, 모든 청크가 이동됩니다.                                                                                                             |
| `perform_ttl_move_on_insert` | 삽입 시 만료된 TTL 데이터를 이동하는 동작을 비활성화합니다. 기본적으로(활성화된 경우), 수명 기반 이동 규칙에 따라 이미 만료된 데이터 조각을 삽입하면 해당 데이터는 즉시 이동 규칙에 지정된 볼륨/디스크로 이동됩니다. 대상 볼륨/디스크가 느린 경우(예: S3) 삽입 속도가 크게 느려질 수 있습니다. 비활성화된 경우, 만료된 데이터 부분은 기본 볼륨에 기록된 후, 만료된 TTL에 대한 규칙에 지정된 볼륨으로 즉시 이동됩니다. |
| `load_balancing`             | 디스크 로드 밸런싱 정책입니다. `round_robin` 또는 `least_used`를 사용할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `least_used_ttl_ms`          | 모든 디스크의 사용 가능한 공간을 업데이트하기 위한 타임아웃(밀리초 단위)을 설정합니다 (`0` - 항상 업데이트, `-1` - 업데이트하지 않음, 기본값은 `60000`). 디스크가 ClickHouse에서만 사용되며, 파일 시스템의 실시간 리사이징이 발생하지 않는다면 `-1` 값을 사용할 수 있습니다. 그 외의 모든 경우에는, 결국 잘못된 공간 할당으로 이어질 수 있으므로 이 값을 사용하는 것은 권장되지 않습니다.                                                                                                                   |
| `prefer_not_to_merge`        | 이 볼륨에서 데이터 파트 병합을 비활성화합니다. 참고: 이는 잠재적으로 유해하며 성능 저하를 일으킬 수 있습니다. 이 설정을 활성화하면(이렇게 하지 않는 것이 좋습니다), 이 볼륨에서 데이터 병합이 금지됩니다(좋지 않습니다). 이를 통해 ClickHouse가 느린 디스크와 상호 작용하는 방식을 제어할 수 있습니다. 이 설정은 사용하지 않을 것을 권장합니다.                                                                                                                                                                          |
| `volume_priority`            | 볼륨이 채워지는 우선순위(순서)를 정의합니다. 값이 작을수록 우선순위가 높습니다. 파라미터 값은 자연수여야 하며, 1부터 N까지(N은 지정된 파라미터 값 중 가장 큰 값) 중간에 빠진 값 없이 범위를 모두 포함해야 합니다.                                                                                                                                                                                                                                             |

`volume_priority`에 대해:

- 모든 볼륨에 이 파라미터가 설정된 경우, 지정된 순서대로 우선순위가 부여됩니다.
- 일부 볼륨에만 설정된 경우, 이 파라미터가 없는 볼륨은 가장 낮은 우선순위를 가집니다. 파라미터가 있는 볼륨은 태그 값에 따라 우선순위가 결정되며, 나머지의 우선순위는 설정 파일에서 서로에 대해 설명된 순서에 따라 결정됩니다.
- 어떤 볼륨에도 이 파라미터가 설정되지 않은 경우, 설정 파일에 설명된 순서대로 우선순위가 결정됩니다.
- 볼륨 우선순위는 동일할 필요가 없습니다.

## storage_connections_hard_limit \{#storage_connections_hard_limit\}

<SettingsInfoBlock type="UInt64" default_value="200000" />이 제한에 도달하면 생성을 시도할 때 예외가 발생합니다. 하드 제한을 비활성화하려면 0으로 설정하십시오. 이 제한은 스토리지 연결에 적용됩니다.

## storage_connections_soft_limit \{#storage_connections_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="100" />이 제한을 초과하는 연결은 유지 시간(TTL)이 크게 짧아집니다. 이 제한은 스토리지 연결에 적용됩니다.

## storage_connections_store_limit \{#storage_connections_store_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />이 한도를 초과하는 연결은 사용 후 재설정됩니다. 연결 캐시를 끄려면 0으로 설정하십시오. 이 한도는 스토리지 연결에 적용됩니다.

## storage_connections_warn_limit \{#storage_connections_warn_limit\}

<SettingsInfoBlock type="UInt64" default_value="500" />사용 중인 연결 수가 이 임계값을 초과하면 경고 메시지가 로그에 기록됩니다. 이 임계값은 스토리지 연결에 적용됩니다.

## storage_metadata_write_full_object_key \{#storage_metadata_write_full_object_key\}

<SettingsInfoBlock type="Bool" default_value="1" />디스크 메타데이터 파일을 VERSION_FULL_OBJECT_KEY 형식으로 기록합니다. 기본값은 활성화 상태입니다. 이 설정은 더 이상 사용을 권장하지 않습니다.

## storage_shared_set_join_use_inner_uuid \{#storage_shared_set_join_use_inner_uuid\}

<SettingsInfoBlock type="Bool" default_value="1" />활성화하면 SharedSet 및 SharedJoin 생성 시 내부 UUID가 생성됩니다. ClickHouse Cloud에서만 적용됩니다.

## table_engines_require_grant \{#table_engines_require_grant\}

true로 설정되면, 사용자가 특정 엔진으로 테이블을 생성하기 위해서는 권한 부여가 필요합니다. 예: `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
기본적으로는 하위 호환성을 위해 특정 테이블 엔진으로 테이블을 생성할 때 권한 부여를 검사하지 않지만, 이 값을 true로 설정하여 동작을 변경할 수 있습니다.
:::

## tables_loader_background_pool_size \{#tables_loader_background_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

백그라운드 풀에서 비동기 로드 작업을 수행하는 스레드 수를 설정합니다. 백그라운드 풀은 테이블을 기다리는 쿼리가 없을 때, 서버 시작 이후 테이블을 비동기적으로 로드하는 데 사용됩니다. 테이블이 매우 많은 경우 백그라운드 풀의 스레드 수를 적게 유지하는 것이 유리할 수 있습니다. 이렇게 하면 동시 쿼리 실행을 위해 CPU 리소스를 확보할 수 있습니다.

:::note
값이 `0`이면 사용 가능한 모든 CPU가 사용됩니다.
:::

## tables_loader_foreground_pool_size \{#tables_loader_foreground_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

포어그라운드 풀에서 로드 작업을 수행하는 스레드 수를 설정합니다. 포어그라운드 풀은 서버가 포트에서 요청 수신을 시작하기 전에 테이블을 동기적으로 로드하고, 로딩이 완료되기를 기다리는 테이블을 로드하는 데 사용됩니다. 포어그라운드 풀은 백그라운드 풀보다 우선순위가 높습니다. 따라서 포어그라운드 풀에서 작업이 실행 중인 동안에는 백그라운드 풀에서 어떤 작업도 시작되지 않습니다.

:::note
값이 `0`이면 사용 가능한 모든 CPU가 사용됩니다.
:::

## tcp_close_connection_after_queries_num \{#tcp_close_connection_after_queries_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 연결당 실행할 수 있는 최대 쿼리 수입니다. 값을 0으로 설정하면 쿼리 수는 무제한입니다.

## tcp_close_connection_after_queries_seconds \{#tcp_close_connection_after_queries_seconds\}

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 연결이 종료되기 전까지의 최대 수명(초)입니다. 연결 수명을 무제한으로 설정하려면 0으로 지정하십시오.

## tcp_port \{#tcp_port\}

TCP 프로토콜을 통해 클라이언트와 통신하는 포트입니다.

**예**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure \{#tcp_port_secure\}

클라이언트와 보안 통신에 사용하는 TCP 포트입니다. [OpenSSL](#openssl) 설정과 함께 사용합니다.

**기본값**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp_ssh_port \{#tcp_ssh_port\}

임베디드 클라이언트를 사용하여 PTY를 통해 대화형으로 접속하고 쿼리를 실행할 수 있게 하는 SSH 서버의 포트입니다.

예:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary_data_in_cache \{#temporary_data_in_cache\}

이 옵션을 사용하면 특정 디스크에 대한 임시 데이터가 캐시에 저장됩니다.
이 섹션에서는 타입이 `cache`인 디스크 이름을 지정해야 합니다.
이 경우 캐시와 임시 데이터가 동일한 공간을 공유하며, 디스크 캐시는 임시 데이터를 저장하기 위해 제거(evict)될 수 있습니다.

:::note
임시 데이터 저장소를 구성할 때는 `tmp_path`, `tmp_policy`, `temporary_data_in_cache` 중 하나의 옵션만 사용할 수 있습니다.
:::

**예시**

`local_disk`의 캐시와 임시 데이터는 둘 다 파일 시스템의 `/tiny_local_cache`에 저장되며, `tiny_local_cache`에 의해 관리됩니다.

```xml
<clickhouse>
<storage_configuration>
<disks>
<local_disk>
<type>local</type>
<path>/local_disk/</path>
</local_disk>

<!-- highlight-start -->
<tiny_local_cache>
<type>cache</type>
<disk>local_disk</disk>
<path>/tiny_local_cache/</path>
<max_size_rows>10M</max_size_rows>
<max_file_segment_size>1M</max_file_segment_size>
<cache_on_write_operations>1</cache_on_write_operations>
</tiny_local_cache>
<!-- highlight-end -->
</disks>
</storage_configuration>

<!-- highlight-start -->
<temporary_data_in_cache>tiny_local_cache</temporary_data_in_cache>
<!-- highlight-end -->
</clickhouse>
```


## temporary_data_in_distributed_cache \{#temporary_data_in_distributed_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />분산 캐시에 임시 데이터를 저장합니다.

## text_index_dictionary_block_cache_max_entries \{#text_index_dictionary_block_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />텍스트 인덱스 딕셔너리 블록에 대한 캐시 크기(항목 수 기준)입니다. 0으로 설정하면 비활성화됩니다.

## text_index_dictionary_block_cache_policy \{#text_index_dictionary_block_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />텍스트 인덱스 딕셔너리 블록 캐시 정책의 이름입니다.

## text_index_dictionary_block_cache_size \{#text_index_dictionary_block_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />text 인덱스 딕셔너리 블록 캐시의 크기입니다. 0으로 설정하면 비활성화됩니다.

:::note
이 설정은 실행 중에 수정할 수 있으며, 즉시 적용됩니다.
:::

## text_index_dictionary_block_cache_size_ratio \{#text_index_dictionary_block_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />텍스트 인덱스 딕셔너리 블록 캐시에서 캐시 전체 크기 중 보호 큐가 차지하는 비율(SLRU 정책 사용 시)입니다.

## text_index_header_cache_max_entries \{#text_index_header_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="100000" />텍스트 인덱스 헤더 캐시의 크기(엔트리 수 기준)입니다. 0이면 비활성화됩니다.

## text_index_header_cache_policy \{#text_index_header_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />텍스트 인덱스 헤더 캐시 정책의 이름입니다.

## text_index_header_cache_size \{#text_index_header_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />텍스트 인덱스 헤더용 캐시 크기입니다. 0이면 비활성화됩니다.

:::note
이 설정은 런타임에 수정할 수 있으며, 즉시 적용됩니다.
:::

## text_index_header_cache_size_ratio \{#text_index_header_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />텍스트 인덱스 헤더 캐시에서 SLRU 정책을 사용할 때 보호 큐가 캐시 전체 크기에서 차지하는 비율입니다.

## text_index_postings_cache_max_entries \{#text_index_postings_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />텍스트 인덱스 포스팅 리스트에 대한 캐시 크기(엔트리 수 기준)입니다. 0은 비활성화를 의미합니다.

## text_index_postings_cache_policy \{#text_index_postings_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />텍스트 인덱스 포스팅 리스트 캐시 정책의 이름입니다.

## text_index_postings_cache_size \{#text_index_postings_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="2147483648" />텍스트 인덱스 포스팅 리스트 캐시의 크기입니다. 값이 0이면 비활성화됩니다.

:::note
이 설정은 런타임에도 수정할 수 있으며, 변경 사항이 즉시 적용됩니다.
:::

## text_index_postings_cache_size_ratio \{#text_index_postings_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />SLRU 정책 사용 시 텍스트 인덱스 포스팅 리스트 캐시에서 보호 큐의 크기가 캐시 전체 크기에 대해 차지하는 비율입니다.

## text_log \{#text_log\}

텍스트 메시지 로깅을 위한 [text&#95;log](/operations/system-tables/text_log) 시스템 테이블의 설정입니다.

<SystemLogParameters />

추가 설정:

| Setting | Description                           | Default Value |
| ------- | ------------------------------------- | ------------- |
| `level` | 테이블에 저장되는 최대 메시지 레벨(기본값은 `Trace`)입니다. | `Trace`       |

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


## thread_pool_queue_size \{#thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Global Thread pool에 스케줄링할 수 있는 작업의 최대 개수입니다. 큐 크기를 늘리면 메모리 사용량이 증가합니다. 이 값은 [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size)와 동일하게 유지할 것을 권장합니다.

:::note
값이 `0`이면 무제한을 의미합니다.
:::

**예시**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size \{#threadpool_local_fs_reader_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />`local_filesystem_read_method = 'pread_threadpool'`일 때 로컬 파일 시스템에서 데이터를 읽는 스레드 풀의 스레드 수입니다.

## threadpool_local_fs_reader_queue_size \{#threadpool_local_fs_reader_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />로컬 파일 시스템에서 데이터를 읽기 위해 thread pool에 예약될 수 있는 최대 작업 수입니다.

## threadpool_remote_fs_reader_pool_size \{#threadpool_remote_fs_reader_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />`remote_filesystem_read_method = 'threadpool'`일 때 원격 파일 시스템에서 읽기를 수행할 때 사용하는 스레드 풀의 스레드 수입니다.

## threadpool_remote_fs_reader_queue_size \{#threadpool_remote_fs_reader_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />원격 파일 시스템에서의 읽기 작업을 위해 thread pool에 예약할 수 있는 작업의 최대 개수입니다.

## threadpool_writer_pool_size \{#threadpool_writer_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />객체 스토리지로의 쓰기 요청을 처리하는 백그라운드 풀 크기입니다

## threadpool_writer_queue_size \{#threadpool_writer_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />객체 스토리지에 대한 쓰기 요청을 위해 백그라운드 풀에 넣을 수 있는 최대 작업 수

## throw_on_unknown_workload \{#throw_on_unknown_workload\}

<SettingsInfoBlock type="Bool" default_value="0" />

쿼리 setting &#39;workload&#39;로 정의되지 않은 WORKLOAD에 접근할 때의 동작을 정의합니다.

* `true`이면, 알 수 없는 WORKLOAD에 접근하려는 쿼리에서 RESOURCE&#95;ACCESS&#95;DENIED 예외가 발생합니다. 이는 WORKLOAD 계층 구조를 설정하고 WORKLOAD 기본값(default)을 포함한 이후, 모든 쿼리에 대해 리소스 스케줄링을 강제하는 데 유용합니다.
* `false`(기본값)이면, 알 수 없는 WORKLOAD를 가리키는 &#39;workload&#39; setting을 가진 쿼리에 리소스 스케줄링 없이 무제한 접근이 허용됩니다. 이는 WORKLOAD 기본값이 추가되기 전에 WORKLOAD 계층 구조를 설정하는 과정에서 중요한 동작입니다.

**예시**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**관련 문서**

* [워크로드 스케줄링](/operations/workload-scheduling.md)


## timezone \{#timezone\}

서버의 시간대입니다.

UTC 시간대 또는 지리적 위치를 나타내는 IANA 식별자로 지정합니다(예: Africa/Abidjan).

시간대는 DateTime 필드를 텍스트 형식(화면 출력 또는 파일)에 출력할 때 `String` 형식과 `DateTime` 형식 간의 변환, 그리고 문자열에서 `DateTime` 값을 가져올 때 필요합니다. 또한 시간 및 날짜를 처리하는 함수에서 입력 매개변수로 시간대를 전달하지 않은 경우, 해당 함수에서 사용할 시간대를 결정하는 데 쓰입니다.

**예**

```xml
<timezone>Asia/Istanbul</timezone>
```

**함께 보기**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tmp_path \{#tmp_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/tmp/" />

대용량 쿼리를 처리할 때 사용할 임시 데이터를 저장하는 로컬 파일 시스템의 경로입니다.

:::note

* 임시 데이터 저장소를 설정할 때는 tmp&#95;path, tmp&#95;policy, temporary&#95;data&#95;in&#95;cache 중 하나의 옵션만 사용할 수 있습니다.
* 경로 끝에는 슬래시(/)가 반드시 포함되어야 합니다.
  :::

**예시**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_policy \{#tmp_policy\}

임시 데이터용 스토리지 정책입니다. `tmp` 접두사로 시작하는 모든 파일은 서버 시작 시 제거됩니다.

:::note
`tmp_policy`로 객체 스토리지를 사용할 때의 권장 사항:

* 각 서버마다 별도의 `bucket:path`를 사용합니다.
* `metadata_type=plain`을 사용합니다.
* 필요에 따라 이 버킷에 TTL을 설정할 수 있습니다.
  :::

:::note

* 임시 데이터 스토리지는 `tmp_path`, `tmp_policy`, `temporary_data_in_cache` 중 하나의 옵션만 사용하여 구성해야 합니다.
* `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` 설정은 무시됩니다.
* 정책에는 반드시 *하나의 볼륨*만 있어야 합니다.

자세한 내용은 [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) 문서를 참고하십시오.
:::

**예시**

`/disk1`가 가득 찼을 때 임시 데이터는 `/disk2`에 저장됩니다.

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


## top_level_domains_list \{#top_level_domains_list\}

추가할 사용자 지정 최상위 도메인 목록을 정의합니다. 각 항목은 `<name>/path/to/file</name>` 형식입니다.

예를 들면 다음과 같습니다:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

또한 다음을 참조하십시오:

* FUNCTION [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) 및 그 변형은
  사용자 정의 TLD 목록 이름을 인수로 받아, 첫 번째 의미 있는 서브도메인까지의 최상위 서브도메인을 포함하는 도메인 부분을 반환합니다.


## top_level_domains_path \{#top_level_domains_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/top_level_domains/" />

최상위 도메인이 위치한 디렉터리입니다.

**예시**

```xml
<top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path>
```


## total_memory_profiler_sample_max_allocation_size \{#total_memory_profiler_sample_max_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />`total_memory_profiler_sample_probability`에 해당하는 확률로, 지정된 값 이하 크기의 메모리 할당을 무작위로 수집합니다. 0이면 비활성화됩니다. 이 임계값이 예상대로 동작하도록 하려면 `max_untracked_memory`를 0으로 설정하는 것이 좋습니다.

## total_memory_profiler_sample_min_allocation_size \{#total_memory_profiler_sample_min_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />`total_memory_profiler_sample_probability`에 해당하는 확률로, 지정한 값 이상 크기의 메모리 할당을 무작위로 수집합니다. 0이면 비활성화됩니다. 이 임계값이 의도한 대로 동작하도록 하려면 `max_untracked_memory`를 0으로 설정하는 것이 좋습니다.

## total_memory_profiler_step \{#total_memory_profiler_step\}

<SettingsInfoBlock type="UInt64" default_value="0" />서버 메모리 사용량이 바이트 단위로 지정된 각 단계(step)의 값을 초과할 때마다 메모리 프로파일러가 해당 시점의 할당 스택 트레이스를 수집합니다. 0으로 설정하면 메모리 프로파일러가 비활성화됩니다. 몇 메가바이트보다 작은 값으로 설정하면 서버 성능이 저하됩니다.

## total_memory_tracker_sample_probability \{#total_memory_tracker_sample_probability\}

<SettingsInfoBlock type="Double" default_value="0" />

무작위 메모리 할당 및 해제를 수집하여, 지정된 확률로 `trace_type`이 `MemorySample`인 항목으로 [system.trace_log](../../operations/system-tables/trace_log.md) 시스템 테이블에 기록합니다. 이 확률은 메모리 할당 크기와 관계없이 각 메모리 할당 및 해제마다 동일하게 적용됩니다. 샘플링은 미추적 메모리 양이 미추적 메모리 한도(기본값은 `4` MiB)를 초과할 때에만 이루어집니다. [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step)을 낮추면 이 값도 함께 낮아질 수 있습니다. 더 세밀한 샘플링을 위해 `total_memory_profiler_step`을 `1`로 설정할 수 있습니다.

가능한 값:

- 양의 실수(double).
- `0` — `system.trace_log` 시스템 테이블에 무작위 메모리 할당 및 해제를 기록하지 않습니다.

## trace_log \{#trace_log\}

[trace&#95;log](/operations/system-tables/trace_log) 시스템 테이블 동작을 위한 설정입니다.

<SystemLogParameters />

기본 서버 구성 파일 `config.xml`에는 다음 설정 섹션이 포함되어 있습니다.

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


## uncompressed_cache_policy \{#uncompressed_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />비압축 캐시 정책의 이름입니다.

## uncompressed_cache_size \{#uncompressed_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree 계열 테이블 엔진에서 사용하는 비압축 데이터의 최대 크기(바이트 단위)입니다.

서버 전체에 대해 하나의 공유 캐시가 있습니다. 메모리는 필요할 때마다 할당됩니다. 옵션 `use_uncompressed_cache`가 활성화된 경우에만 이 캐시가 사용됩니다.

비압축 캐시는 특정 상황에서 매우 짧은 쿼리에 유리합니다.

:::note
값이 `0`인 경우 비활성화됨을 의미합니다.

이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다.
:::

## uncompressed_cache_size_ratio \{#uncompressed_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />압축되지 않은 캐시에서 보호된 큐(SLRU 정책 사용 시)의 크기를 캐시 전체 크기에 대한 비율로 지정합니다.

## url_scheme_mappers \{#url_scheme_mappers\}

축약되거나 심볼릭한 URL 접두사를 전체 URL로 변환하는 설정입니다.

예:

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


## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

ZooKeeper에 있는 데이터 파트 헤더의 저장 방식입니다. 이 설정은 [`MergeTree`](/engines/table-engines/mergetree-family) 계열에만 적용됩니다. 다음과 같이 지정할 수 있습니다:

**`config.xml` 파일의 [merge_tree](#merge_tree) 섹션에서 전역적으로 지정**

ClickHouse는 서버의 모든 테이블에 대해 이 설정을 사용합니다. 이 설정은 언제든지 변경할 수 있습니다. 기존 테이블도 설정이 변경되면 동작이 변경됩니다.

**각 테이블별로 지정**

테이블을 생성할 때 해당 [엔진 설정](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)을 지정합니다. 이 설정을 사용해 생성된 기존 테이블의 동작은 전역 설정이 변경되더라도 변경되지 않습니다.

**가능한 값**

- `0` — 기능이 꺼져 있습니다.
- `1` — 기능이 켜져 있습니다.

[`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)인 경우, [복제된(replicated)](../../engines/table-engines/mergetree-family/replication.md) 테이블은 데이터 파트의 헤더를 단일 `znode`를 사용해 축약된 형태로 저장합니다. 테이블에 컬럼이 많을수록 이 저장 방식은 ZooKeeper에 저장되는 데이터 양을 상당히 줄여 줍니다.

:::note
`use_minimalistic_part_header_in_zookeeper = 1`을(를) 적용한 후에는, 이 설정을 지원하지 않는 버전의 ClickHouse 서버로 다운그레이드할 수 없습니다. 클러스터 내 서버에서 ClickHouse를 업그레이드할 때 주의해야 합니다. 모든 서버를 한 번에 업그레이드하지 마십시오. 테스트 환경이나 클러스터의 일부 서버에서만 새로운 ClickHouse 버전을 먼저 검증하는 것이 더 안전합니다.

이 설정으로 이미 저장된 데이터 파트 헤더는 이전의 (비축약) 표현 방식으로 복원할 수 없습니다.
:::

## user_defined_executable_functions_config \{#user_defined_executable_functions_config\}

실행 가능한 UDF(User Defined Function)에 대한 설정 파일 경로입니다.

경로:

* 절대 경로 또는 서버 설정 파일을 기준으로 한 상대 경로를 지정합니다.
* 경로에는 와일드카드 * 및 ?를 포함할 수 있습니다.

참고:

* 「[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)」.

**예시**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user_defined_path \{#user_defined_path\}

사용자 정의 파일이 있는 디렉터리입니다. SQL UDF에서 사용됩니다. 자세한 내용은 [SQL 사용자 정의 함수(SQL User Defined Functions)](/sql-reference/functions/udf)를 참조하십시오.

**예시**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user_directories \{#user_directories\}

다음과 같은 설정을 포함하는 구성 파일의 섹션입니다.

* 미리 정의된 사용자가 포함된 구성 파일 경로.
* SQL 명령으로 생성된 사용자가 저장되는 폴더 경로.
* SQL 명령으로 생성된 사용자가 저장 및 복제되는 ZooKeeper 노드 경로.

이 섹션이 지정되면 [users&#95;config](/operations/server-configuration-parameters/settings#users_config) 및 [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path)의 경로는 사용되지 않습니다.

`user_directories` 섹션에는 여러 개의 항목을 포함할 수 있으며, 항목의 순서는 우선순위를 의미합니다(위에 있는 항목일수록 우선순위가 높습니다).

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

사용자, 역할, 행 정책, QUOTA, 프로필 또한 ZooKeeper에 저장할 수 있습니다:

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

`memory` 섹션을 정의할 수도 있습니다. 이는 디스크에 기록하지 않고 메모리에만 정보를 저장함을 의미합니다. `ldap` 섹션은 정보를 LDAP 서버에 저장함을 의미합니다.

로컬에 정의되지 않은 사용자의 원격 사용자 디렉토리로 LDAP 서버를 추가하려면, 다음 설정과 함께 단일 `ldap` 섹션을 정의합니다:

| Setting  | Description                                                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `roles`  | LDAP 서버에서 조회된 각 사용자에게 할당될, 로컬에 정의된 역할 목록을 담은 섹션입니다. 역할이 지정되지 않은 경우 사용자는 인증 후에도 어떤 작업도 수행할 수 없습니다. 나열된 역할 중 하나라도 인증 시점에 로컬에 정의되어 있지 않으면, 제공된 비밀번호가 잘못된 것처럼 인증 시도가 실패합니다. |
| `server` | `ldap_servers` 설정 섹션에 정의된 LDAP 서버 이름 중 하나입니다. 이 매개변수는 필수이며 비워 둘 수 없습니다.                                                                                                 |

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


## user_files_path \{#user_files_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/user_files/" />

사용자 파일이 위치한 디렉터리입니다. 테이블 함수 [file()](/sql-reference/table-functions/file), [fileCluster()](/sql-reference/table-functions/fileCluster)에서 사용됩니다.

**예시**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_scripts_path \{#user_scripts_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/user_scripts/" />

사용자 스크립트 파일이 저장되는 디렉터리입니다. Executable UDF(실행형 사용자 정의 함수)에 사용됩니다. 자세한 내용은 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)을 참고하십시오.

**예시**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```


## users_config \{#users_config\}

다음을 포함하는 파일의 경로입니다:

* 사용자 구성
* 액세스 권한
* 설정 프로필(Settings profile)
* 쿼터(Quota) 설정

**예시**

```xml
<users_config>users.xml</users_config>
```


## users_to_ignore_early_memory_limit_check \{#users_to_ignore_early_memory_limit_check\}

조기 메모리 제한 검사를 건너뛸 사용자 목록을 쉼표로 구분하여 지정합니다. 사용자가 이 목록에 포함되지 않은 경우, 총 메모리 사용량이 한도를 초과하면 쿼리가 거부됩니다.

## validate_tcp_client_information \{#validate_tcp_client_information\}

<SettingsInfoBlock type="Bool" default_value="0" />쿼리 패킷을 수신했을 때 클라이언트 정보의 유효성 검사를 활성화할지 여부를 결정합니다.

기본적으로 `false`입니다:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries \{#vector_similarity_index_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />벡터 유사성 인덱스를 위한 캐시 크기(엔트리 수 기준)입니다. 0이면 비활성화됩니다.

## vector_similarity_index_cache_policy \{#vector_similarity_index_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />벡터 유사도 인덱스 캐시 정책 이름입니다.

## vector_similarity_index_cache_size \{#vector_similarity_index_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />벡터 유사성 인덱스 캐시의 크기입니다. 0이면 비활성화됩니다.

:::note
이 설정은 런타임에 수정할 수 있으며 즉시 적용됩니다.
:::

## vector_similarity_index_cache_size_ratio \{#vector_similarity_index_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />SLRU 정책을 사용하는 경우, 벡터 유사도 인덱스 캐시에서 보호된 큐의 크기가 캐시 전체 크기에서 차지하는 비율입니다.

## wait_dictionaries_load_at_startup \{#wait_dictionaries_load_at_startup\}

<SettingsInfoBlock type="Bool" default_value="1" />

이 설정은 `dictionaries_lazy_load`가 `false`일 때의 동작을 지정합니다.
(`dictionaries_lazy_load`가 `true`이면 이 설정은 아무런 영향을 미치지 않습니다.)

`wait_dictionaries_load_at_startup`이 `false`이면, 서버는 시작 시점에 모든 딕셔너리 로드를 시작하고,
그 로드와 병렬로 연결을 수락하기 시작합니다.
딕셔너리가 쿼리에서 처음 사용될 때, 해당 딕셔너리가 아직 로드되지 않았다면
쿼리는 딕셔너리가 로드될 때까지 대기합니다.
`wait_dictionaries_load_at_startup`을 `false`로 설정하면 ClickHouse 시작 속도가 빨라질 수 있지만,
일부 쿼리는 느리게 실행될 수 있습니다
(일부 딕셔너리가 로드될 때까지 기다려야 하기 때문입니다).

`wait_dictionaries_load_at_startup`이 `true`이면, 서버는 시작 시점에
어떠한 연결도 받기 전에 모든 딕셔너리의 로드가(성공이든 실패든) 완료될 때까지 기다립니다.

**예시**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload_path \{#workload_path\}

모든 `CREATE WORKLOAD` 및 `CREATE RESOURCE` 쿼리의 저장 위치로 사용되는 디렉터리입니다. 기본적으로 서버 작업 디렉터리 아래의 `/workload/` 폴더가 사용됩니다.

**예제**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**관련 항목**

* [워크로드 계층 구조](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload_zookeeper_path \{#workload_zookeeper_path\}

모든 `CREATE WORKLOAD` 및 `CREATE RESOURCE` 쿼리를 저장하는 저장소로 사용되는 ZooKeeper 노드의 경로입니다. 일관성을 위해 모든 SQL 정의는 이 단일 znode의 값으로 저장됩니다. 기본적으로 ZooKeeper는 사용하지 않으며, 정의는 [disk](#workload_path)에 저장됩니다.

**예시**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**참고 자료**

* [작업 부하 계층 구조](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper \{#zookeeper\}

ClickHouse가 [ZooKeeper](http://zookeeper.apache.org/) 클러스터와 상호 작용할 수 있도록 하는 설정을 포함합니다. ClickHouse는 복제된 테이블(Replicated Table)을 사용할 때 레플리카의 메타데이터를 저장하기 위해 ZooKeeper를 사용합니다. 복제된 테이블을 사용하지 않는 경우 이 매개변수 섹션은 생략할 수 있습니다.

다음 설정들은 하위 태그로 구성할 수 있습니다:

| Setting                                         | Description                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                          | ZooKeeper 엔드포인트입니다. 여러 엔드포인트를 설정할 수 있습니다. 예: `<node index="1"><host>example_host</host><port>2181</port></node>`. `index` 속성은 ZooKeeper 클러스터에 연결을 시도할 때의 노드 순서를 지정합니다.                                                                                                                          |
| `operation_timeout_ms`                          | 한 번의 작업에 대한 최대 타임아웃(밀리초)입니다.                                                                                                                                                                                                                                                                    |
| `session_timeout_ms`                            | 클라이언트 세션에 대한 최대 타임아웃(밀리초)입니다.                                                                                                                                                                                                                                                                   |
| `root` (optional)                               | ClickHouse 서버에서 사용하는 znode들의 루트로 사용되는 znode입니다.                                                                                                                                                                                                                                                 |
| `fallback_session_lifetime.min` (optional)      | 주(primary) 노드를 사용할 수 없을 때(로드 밸런싱) 폴백(fallback) 노드에 대한 ZooKeeper 세션 수명의 최소 값입니다. 초 단위로 설정합니다. 기본값: 3시간.                                                                                                                                                                                          |
| `fallback_session_lifetime.max` (optional)      | 주(primary) 노드를 사용할 수 없을 때(로드 밸런싱) 폴백(fallback) 노드에 대한 ZooKeeper 세션 수명의 최대 값입니다. 초 단위로 설정합니다. 기본값: 6시간.                                                                                                                                                                                          |
| `identity` (optional)                           | 요청된 znode에 접근하기 위해 ZooKeeper에서 요구하는 사용자와 비밀번호입니다.                                                                                                                                                                                                                                               |
| `use_compression` (optional)                    | `true`로 설정하면 Keeper 프로토콜에서 압축을 활성화합니다.                                                                                                                                                                                                                                                          |
| `use_xid_64` (optional)                         | 64비트 트랜잭션 ID를 활성화합니다. 확장된 트랜잭션 ID 형식을 사용하려면 `true`로 설정합니다. 기본값: `false`.                                                                                                                                                                                                                        |
| `pass_opentelemetry_tracing_context` (optional) | OpenTelemetry 트레이싱 컨텍스트를 Keeper 요청으로 전파하도록 활성화합니다. 활성화되면 Keeper 작업에 대해 트레이싱 span이 생성되어, ClickHouse와 Keeper 전반에서 분산 트레이싱이 가능해집니다. `use_xid_64`가 활성화되어 있어야 합니다. 자세한 내용은 [Tracing ClickHouse Keeper Requests](/operations/opentelemetry#tracing-clickhouse-keeper-requests)를 참고하십시오. 기본값: `false`. |

또한 ZooKeeper 노드 선택을 위한 알고리즘을 선택할 수 있는 `zookeeper_load_balancing` 설정(선택 사항)도 있습니다:

| Algorithm Name                  | Description                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `random`                        | ZooKeeper 노드 중 하나를 무작위로 선택합니다.                                               |
| `in_order`                      | 첫 번째 ZooKeeper 노드를 선택하고, 사용할 수 없으면 두 번째, 그다음 순서로 선택합니다.                      |
| `nearest_hostname`              | 서버 호스트 이름과 가장 비슷한 호스트 이름을 가진 ZooKeeper 노드를 선택합니다. 호스트 이름은 이름 접두사 기준으로 비교합니다. |
| `hostname_levenshtein_distance` | `nearest_hostname`와 동일하지만, 호스트 이름을 레벤슈타인 거리 방식으로 비교합니다.                      |
| `first_or_random`               | 첫 번째 ZooKeeper 노드를 선택하고, 사용할 수 없으면 남은 ZooKeeper 노드 중 하나를 무작위로 선택합니다.         |
| `round_robin`                   | 첫 번째 ZooKeeper 노드를 선택하고, 재연결이 발생하면 그다음 노드를 선택합니다.                            |

**구성 예시**

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
    <!-- Optional. Enable 64-bit transaction IDs. -->
    <use_xid_64>false</use_xid_64>
    <!-- Optional. Enable OpenTelemetry tracing context propagation (requires use_xid_64). -->
    <pass_opentelemetry_tracing_context>false</pass_opentelemetry_tracing_context>
</zookeeper>
```

**관련 항목**


- [복제](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper 프로그래머 가이드](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse와 ZooKeeper 간의 선택적 보안 통신](/operations/ssl-zookeeper)

## zookeeper_log \{#zookeeper_log\}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) 시스템 테이블에 대한 설정입니다.

다음 설정은 하위 태그로 구성할 수 있습니다:

<SystemLogParameters />

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
