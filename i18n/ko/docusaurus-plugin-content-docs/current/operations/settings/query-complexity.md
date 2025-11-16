---
'description': '쿼리 복잡성을 제한하는 설정.'
'sidebar_label': '쿼리 복잡성에 대한 제한'
'sidebar_position': 59
'slug': '/operations/settings/query-complexity'
'title': '쿼리 복잡성에 대한 제한'
'doc_type': 'reference'
---


# 쿼리 복잡성에 대한 제한

## 개요 {#overview}

[설정](/operations/settings/overview)의 일환으로 ClickHouse는 쿼리 복잡성에 제한을 두는 기능을 제공합니다. 이는 잠재적으로 자원 집약적인 쿼리에 대한 보호를 도와주며, 특히 사용자 인터페이스를 사용할 때 보다 안전하고 예측 가능한 실행을 보장합니다.

거의 모든 제한은 `SELECT` 쿼리에만 적용되며, 분산 쿼리 처리의 경우 각 서버에서 별도로 제한이 적용됩니다.

ClickHouse는 일반적으로 데이터 파트가 완전히 처리된 후에만 제한을 검사하며, 각 행에 대해 제한을 검사하지는 않습니다. 이로 인해 파트가 처리되는 동안 제한이 위반될 수 있는 상황이 발생할 수 있습니다.

## `overflow_mode` 설정 {#overflow_mode_setting}

대부분의 제한은 `overflow_mode` 설정을 갖고 있으며, 이는 제한이 초과될 때 발생하는 일을 정의합니다. 두 가지 값 중 하나를 가질 수 있습니다:
- `throw`: 예외를 던짐 (기본값).
- `break`: 쿼리 실행을 중지하고 부분 결과를 반환, 원본 데이터가 소진된 것처럼.

## `group_by_overflow_mode` 설정 {#group_by_overflow_mode_settings}

`group_by_overflow_mode` 설정 또한 `any` 값을 가집니다:
- `any` : 집합에 포함된 키에 대해 집계를 계속하지만, 집합에 새로운 키를 추가하지 않음.

## 설정 목록 {#relevant-settings}

다음 설정은 쿼리 복잡성에 제한을 적용하는 데 사용됩니다.

:::note
"무언가의 최대량"에 대한 제한은 `0` 값을 가질 수 있으며, 이는 "제한 없음"을 의미합니다.
:::

| 설정                                                                                                                | 간략 설명                                                                                                                                                       |
|---------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                              | 단일 서버에서 쿼리를 실행하는 데 사용할 최대 RAM 양.                                                                                                          |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                             | 단일 서버에서 사용자의 쿼리를 실행하는 데 사용할 최대 RAM 양.                                                                                                 |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                              | 쿼리를 실행할 때 테이블에서 읽을 수 있는 최대 행 수.                                                                                                          |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                            | 쿼리를 실행할 때 테이블에서 읽을 수 있는 최대 바이트 수 (압축되지 않은 데이터).                                                                               |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                  | 읽은 데이터 볼륨이 리프 한계 중 하나를 초과할 때 발생하는 일을 설정.                                                                                           |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                      | 분산 쿼리를 실행할 때 리프 노드의 로컬 테이블에서 읽을 수 있는 최대 행 수.                                                                                    |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                    | 분산 쿼리를 실행할 때 리프 노드의 로컬 테이블에서 읽을 수 있는 최대 바이트 수 (압축되지 않은 데이터).                                                         |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                             | 읽은 데이터 볼륨이 리프 한계 중 하나를 초과할 때 발생하는 일을 설정.                                                                                           |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                       | 집계에서 받은 고유 키의 최대 수.                                                                                                                                 |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                   | 집계를 위한 고유 키의 수가 제한을 초과할 때 발생하는 일을 설정.                                                                                                |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)           | 외부 메모리에서 `GROUP BY` 절의 실행을 활성화하거나 비활성화합니다.                                                                                             |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by) | `GROUP BY`에 허용되는 사용 가능한 메모리의 비율. 비율에 도달하면 외부 메모리가 집계에 사용됩니다.                                                               |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                     | 외부 메모리에서 `ORDER BY` 절의 실행을 활성화하거나 비활성화합니다.                                                                                             |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)         | `ORDER BY`에 허용되는 사용 가능한 메모리의 비율. 비율에 도달하면 외부 정렬이 사용됩니다.                                                                        |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                              | 정렬하기 전의 최대 행 수. 정렬 시 메모리 소비를 제한할 수 있습니다.                                                                                             |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                             | 정렬하기 전의 최대 바이트 수.                                                                                                                                  |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                          | 정렬하기 전에 받은 행 수가 한계를 초과할 경우 발생하는 일을 설정.                                                                                               |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                | 결과 내의 행 수 제한.                                                                                                                                           |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                              | 바이트 단위로 결과 크기 제한 (압축되지 않음).                                                                                                                  |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                        | 결과 볼륨이 한계를 초과할 경우 수행할 작업을 설정.                                                                                                            |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                          | 최대 쿼리 실행 시간 (초 단위).                                                                                                                                   |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                      | 쿼리가 `max_execution_time` 보다 오래 실행되거나 예상 실행 시간이 `max_estimated_execution_time`보다 오래 실행될 경우 수행할 작업을 설정.                     |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                  | `max_execution_time`와 의미가 유사하지만, 분산 쿼리나 원격 쿼리의 경우 리프 노드에만 적용됩니다.                                                                |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                            | 리프 노드에서 쿼리가 `max_execution_time_leaf`보다 오래 실행될 경우 발생하는 일을 설정.                                                                         |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                          | 초당 최소 실행 속도.                                                                                                                                           |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                              | 초당 최소 실행 바이트 수.                                                                                                                                        |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                          | 초당 최대 실행 행 수.                                                                                                                                           |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                              | 초당 최대 실행 바이트 수.                                                                                                                                      |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)   | 지정된 시간(초)이 경과한 후 실행 속도가 너무 느리지 않은지 검사 (적어도 `min_execution_speed` 이상).                                                        |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                        | 최대 쿼리 예상 실행 시간 (초 단위).                                                                                                                             |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                          | 단일 쿼리에서 테이블에서读取할 수 있는 최대 컬럼 수.                                                                                                          |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                      | 쿼리 실행 중 RAM에 동시에 유지해야 하는 최대 임시 컬럼 수, 상수 컬럼 포함.                                                                                     |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                  | 쿼리 실행 중 RAM에 동시에 유지해야 하는 최대 임시 컬럼 수, 상수 컬럼 제외.                                                                                     |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                            | 쿼리에 지정된 수 이상의 중첩 서브쿼리가 있을 경우 발생하는 일을 설정.                                                                                           |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                    | 쿼리 구문 트리의 최대 중첩 깊이.                                                                                                                                 |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                | 쿼리 구문 트리의 최대 요소 수.                                                                                                                                  |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                | 서브쿼리로 생성된 IN 절의 데이터 세트에 대한 최대 행 수.                                                                                                       |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                | 서브쿼리로 생성된 IN 절의 세트에서 사용되는 최대 바이트 수 (압축되지 않은 데이터).                                                                              |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                             | 데이터 양이 한계를 초과할 경우 발생하는 일을 설정.                                                                                                            |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                       | DISTINCT를 사용할 때 가능한 최대 서로 다른 행 수.                                                                                                               |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                     | DISTINCT를 사용할 때 해시 테이블에서 메모리에 사용되는 상태의 최대 바이트 수 (압축되지 않은 바이트).                                                          |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                     | 데이터 양이 한계를 초과할 때 발생하는 일을 설정.                                                                                                              |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                       | GLOBAL IN/JOIN 섹션이 실행될 때 원격 서버로 전달되거나 임시 테이블에 저장될 수 있는 최대 크기(행 수).                                                         |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                     | GLOBAL IN/JOIN 섹션이 실행될 때 원격 서버로 전달되거나 임시 테이블에 저장될 수 있는 최대 바이트 수 (압축되지 않은 데이터).                                     |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                     | 데이터 양이 한계를 초과할 경우 발생하는 일을 설정.                                                                                                            |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                               | 테이블 조인을 위한 해시 테이블에서 사용할 수 있는 최대 행 수.                                                                                                   |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                             | 테이블 조인을 위한 해시 테이블에서 사용할 수 있는 최대 바이트 수.                                                                                               |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                           | 다음 조인 한계 중 하나에 도달했을 때 ClickHouse가 수행하는 작업을 정의.                                                                                       |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                  | 삽입된 단일 블록 내의 최대 파티션 수를 제한하며, 블록이 너무 많은 파티션을 포함할 경우 예외가 발생합니다.                                                      |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block) | `max_partitions_per_insert_block`에 도달했을 때의 동작을 제어할 수 있습니다.                                                                                   |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block) | 모든 동시 실행 사용자 쿼리의 임시 파일에서 소비되는 최대 데이터 양(바이트 단위).                                                                               |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 모든 동시 실행 쿼리의 임시 파일에서 소비되는 최대 데이터 양(바이트 단위).                                                                                     |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                       | ClickHouse 서버에 대한 인증된 사용자당 최대 동시 세션 수.                                                                                                      |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                     | 단일 쿼리에서 접근할 수 있는 최대 파티션 수를 제한합니다.                                                                                                      |

## 사용 중지된 설정 {#obsolete-settings}

:::note
다음 설정은 사용 중지되었습니다.
:::

### max_pipeline_depth {#max-pipeline-depth}

최대 파이프라인 깊이. 쿼리 처리 중 각 데이터 블록이 거치는 변환의 수에 해당합니다. 단일 서버의 한계 내에서 계산됩니다. 파이프라인 깊이가 더 크면 예외가 발생합니다.
