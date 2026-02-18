---
description: '쿼리 복잡도를 제한하는 설정.'
sidebar_label: '쿼리 복잡도 제한'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: '쿼리 복잡도 제한'
doc_type: 'reference'
---



# 쿼리 복잡도 제한 \{#restrictions-on-query-complexity\}



## 개요 \{#overview\}

[settings](/operations/settings/overview)의 일부로, ClickHouse는
쿼리 복잡도에 제한을 둘 수 있는 기능을 제공합니다. 이는 잠재적으로
리소스를 많이 소모하는 쿼리로부터 시스템을 보호하여, 특히 사용자 인터페이스를
사용할 때 더 안전하고 예측 가능한 실행을 보장하는 데 도움이 됩니다.

거의 모든 제한은 `SELECT` 쿼리에만 적용되며, 분산 쿼리 처리를 사용하는 경우
각 서버에서 제한이 개별적으로 적용됩니다.

ClickHouse는 일반적으로 각 행에 대해 제한을 검사하지 않고, 데이터 파트가
완전히 처리된 이후에만 제한을 검사합니다. 이로 인해 파트를 처리하는 동안
제한이 위반되는 상황이 발생할 수 있습니다.



## `overflow_mode` settings \{#overflow_mode_setting\}

대부분의 제한에는 제한값을 초과했을 때의 동작을 정의하는 `overflow_mode` 설정이 있으며, 다음 두 값 중 하나를 가질 수 있습니다:
- `throw`: 예외를 발생시킵니다(기본값).
- `break`: 소스 데이터가 소진된 것처럼 쿼리 실행을 중단하고 부분 결과를 반환합니다.



## `group_by_overflow_mode` settings \{#group_by_overflow_mode_settings\}

`group_by_overflow_mode` 설정은 `any` 값으로 설정할 수도 있습니다:
- `any`: 이미 Set에 포함된 키에 대해서는 집계를 계속 수행하지만, 
          새로운 키는 Set에 추가하지 않습니다.



## 설정 목록 \{#relevant-settings\}

다음 설정은 쿼리 복잡도에 대한 제한을 적용하는 데 사용됩니다.

:::note
「어떤 항목의 최대값」에 대한 제한은 값을 `0`으로 설정할 수 있으며,
이는 「제한 없음」을 의미합니다.
:::



| 설정                                                                                                                     | 간단한 설명                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                                   | 단일 서버에서 하나의 쿼리를 실행할 때 사용할 수 있는 최대 RAM 용량입니다.                                                          |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                                 | 단일 서버에서 하나의 사용자가 실행하는 모든 쿼리에 대해 사용할 수 있는 최대 RAM 용량입니다.                                                |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                                   | 쿼리를 실행할 때 테이블에서 읽을 수 있는 최대 행 수입니다.                                                                    |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                                 | 쿼리를 실행할 때 테이블에서 읽을 수 있는 비압축 데이터의 최대 바이트 수입니다.                                                         |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                     | 읽은 데이터 양이 리프 한계값 중 하나를 초과했을 때 어떻게 처리할지 설정합니다.                                                         |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                         | 분산 쿼리를 실행할 때 리프 노드의 로컬 테이블에서 읽을 수 있는 최대 행 수입니다.                                                       |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                       | 분산 쿼리를 실행할 때 리프 노드의 로컬 테이블에서 읽을 수 있는 비압축 데이터의 최대 바이트 수입니다.                                            |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                                | 읽은 데이터 양이 리프 한계값 중 하나를 초과했을 때 어떻게 처리할지 설정합니다.                                                         |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                           | 집계에서 얻을 수 있는 고유 키의 최대 개수입니다.                                                                          |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                       | 집계를 위한 고유 키 개수가 한계값을 초과했을 때 어떻게 처리할지 설정합니다.                                                           |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)               | `GROUP BY` 절을 외부 메모리에서 실행하도록 활성화하거나 비활성화합니다.                                                          |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by)   | `GROUP BY`에 사용할 수 있도록 허용되는 사용 가능 메모리의 비율입니다. 이 비율에 도달하면 집계를 외부 메모리로 수행합니다.                            |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                       | 외부 메모리를 사용하여 `ORDER BY` 절을 실행할지 여부를 설정합니다.                                                            |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)           | 사용 가능한 메모리 가운데 `ORDER BY`에 사용할 수 있는 비율입니다. 이 비율에 도달하면 외부 정렬이 수행됩니다.                                   |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                   | 정렬 전에 처리할 수 있는 최대 행 수입니다. 정렬 시 메모리 사용량을 제한할 수 있습니다.                                                   |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                  | 정렬 전에 처리할 수 있는 최대 바이트 수입니다.                                                                           |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                               | 정렬 전에 수신된 행 수가 한계값을 초과했을 때 어떻게 처리할지 설정합니다.                                                            |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                     | 결과에 포함될 수 있는 행 수를 제한합니다.                                                                              |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                                   | 결과의 비압축 기준 바이트 크기를 제한합니다.                                                                             |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                           | 결과 데이터 양이 한계값을 초과했을 때 어떻게 처리할지 설정합니다.                                                                 |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                               | 쿼리의 최대 실행 시간을 초 단위로 지정합니다.                                                                            |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                         | 쿼리 실행 시간이 `max_execution_time`을 초과하거나 예상 실행 시간이 `max_estimated_execution_time`을 초과할 경우 수행할 동작을 설정합니다. |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                     | `max_execution_time`과 의미상 유사하지만, 분산 또는 원격 쿼리에서 리프 노드에만 적용됩니다.                                         |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                               | 리프 노드의 쿼리 실행 시간이 `max_execution_time_leaf`를 초과했을 때의 동작을 설정합니다.                                        |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                             | 초당 최소 실행 속도(행 수 기준)입니다.                                                                               |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                                 | 초당 최소 실행 바이트 수입니다.                                                                                    |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                             | 초당 최대 실행 속도(행 수 기준)입니다.                                                                               |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                                 | 초당 최대 실행 바이트 수입니다.                                                                                    |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)     | 지정된 시간이(초 단위) 경과한 후, 실행 속도가 `min_execution_speed` 미만으로 떨어지지 않았는지 확인합니다.                               |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                           | 쿼리의 예상 최대 실행 시간을 초 단위로 지정합니다.                                                                         |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                             | 단일 쿼리로 테이블에서 읽을 수 있는 최대 컬럼 수입니다.                                                                      |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                         | 쿼리를 실행할 때 상수 컬럼을 포함하여 RAM에 동시에 유지해야 하는 임시 컬럼의 최대 개수입니다.                                               |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                     | 쿼리를 실행할 때 상수 컬럼을 제외하고 RAM에 동시에 유지해야 하는 임시 컬럼의 최대 개수입니다.                                               |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                               | 쿼리의 중첩 서브쿼리 개수가 지정된 값보다 많을 때 어떻게 처리할지 설정합니다.                                                          |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                         | 쿼리 구문 트리의 허용되는 최대 중첩 깊이입니다.                                                                           |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                   | 쿼리 구문 트리에서 허용되는 최대 요소 개수입니다.                                                                          |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                     | 서브쿼리로부터 생성되는 IN 절의 데이터 Set에서 허용되는 최대 행 수입니다.                                                          |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                   | 서브쿼리로부터 생성되는 IN 절의 Set이 사용할 수 있는 최대 바이트 수(비압축 데이터 기준)입니다.                                             |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                                  | 데이터 양이 설정된 한계를 초과할 때 데이터를 어떻게 처리할지 지정합니다.                                                             |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                           | DISTINCT를 사용할 때 서로 다른 행의 최대 개수입니다.                                                                    |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                         | DISTINCT를 사용할 때 해시 테이블이 메모리에 유지하는 상태의 최대 크기입니다(비압축 바이트 수 기준).                                         |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                       | 데이터 양이 설정된 한계를 초과할 때 데이터를 어떻게 처리할지 지정합니다.                                                             |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                           | GLOBAL IN/JOIN 구문이 실행될 때 원격 서버로 전달하거나 임시 테이블에 저장할 수 있는 최대 크기(행 수 기준)입니다.                              |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                         | GLOBAL IN/JOIN 구문이 실행될 때 원격 서버로 전달하거나 임시 테이블에 저장할 수 있는 최대 바이트 수(비압축 데이터 기준)입니다.                       |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                       | 데이터 양이 설정된 한계를 초과할 때 데이터를 어떻게 처리할지 지정합니다.                                                             |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                                   | 테이블 조인 시 사용되는 해시 테이블의 최대 행 수를 제한합니다.                                                                  |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                                 | 테이블 조인 시 사용되는 해시 테이블의 최대 크기(바이트 수 기준)입니다.                                                             |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                               | 다음의 조인 제한값 중 하나에 도달했을 때 ClickHouse가 수행하는 동작을 정의합니다.                                                   |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                     | 한 번에 삽입되는 단일 블록에서 허용되는 파티션의 최대 개수를 제한하며, 블록에 파티션이 너무 많으면 예외가 발생합니다.                                   |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | `max_partitions_per_insert_block`에 도달했을 때의 동작을 제어합니다.                                                 |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | 동시에 실행 중인 모든 사용자 쿼리에 대해, 디스크상의 임시 파일들이 사용할 수 있는 최대 데이터 양(바이트 단위)입니다.                                  |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 동시에 실행 중인 모든 쿼리에 대해, 디스크상의 임시 파일들이 사용할 수 있는 최대 데이터 양(바이트 단위)입니다.                                      |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                         | 인증된 각 사용자별로 ClickHouse 서버에 동시에 생성할 수 있는 최대 세션 수입니다.                                                   |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                       | 단일 쿼리에서 접근할 수 있는 파티션의 최대 개수를 제한합니다.                                                                   |





## 더 이상 사용되지 않는 설정 \{#obsolete-settings\}

:::note
다음 설정은 더 이상 사용되지 않습니다.
:::

### max_pipeline_depth \{#max-pipeline-depth\}

최대 파이프라인 깊이입니다. 각 데이터 블록이 쿼리 처리 중에 거치는 변환 단계의 수에 해당합니다. 단일 서버 내에서만 계산됩니다. 파이프라인 깊이가 이 값보다 크면 예외가 발생합니다.
