---
description: '모든 QUOTA의 모든 구간에 대한 최대값 정보를 포함하는 system 테이블입니다. 하나의 QUOTA에는 0개 이상의 행이 대응될 수 있습니다.'
keywords: ['system table', 'quota_limits']
slug: /operations/system-tables/quota_limits
title: 'system.quota_limits'
doc_type: 'reference'
---

# system.quota_limits \{#systemquota_limits\}

모든 QUOTA의 모든 구간에 대한 최대값 정보를 포함합니다. 하나의 QUOTA에 임의 개수(0개 포함)의 행이 대응될 수 있습니다.

Columns:

* `quota_name` ([String](../../sql-reference/data-types/string.md)) — QUOTA 이름.
* `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 리소스 사용량을 계산하는 시간 구간의 길이(초 단위).
* `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 논리 값입니다. 구간이 무작위화(randomized)되었는지 여부를 나타냅니다. 무작위화되지 않은 경우 구간은 항상 같은 시점에 시작합니다. 예를 들어, 1분 구간은 항상 정수 분 단위에서 시작합니다(즉, 11:20:00에는 시작할 수 있지만 11:20:01에는 시작하지 않습니다). 하루 구간은 항상 UTC 자정에 시작합니다. 구간이 무작위화된 경우 첫 번째 구간은 임의의 시점에 시작하고, 이후 구간은 순차적으로 시작합니다. 값:
* `0` — 구간이 무작위화되지 않았습니다.
* `1` — 구간이 무작위화되었습니다.
* `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 최대 쿼리 수.
* `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 최대 SELECT 쿼리 수.
* `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 최대 INSERT 쿼리 수.
* `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 최대 오류 수.
* `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 결과 행의 최대 개수.
* `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 쿼리 결과를 저장하는 데 사용되는 RAM 용량의 최대 바이트 수.
* `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 쿼리에 참여한 모든 테이블 및 테이블 함수에서 읽은 행의 최대 개수.
* `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 쿼리에 참여한 모든 테이블 및 테이블 함수에서 읽은 최대 바이트 수.
* `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 쿼리 실행 시간의 최대값(초 단위).