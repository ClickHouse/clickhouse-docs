---
'description': '시스템 테이블은 모든 할당량의 모든 간격에 대한 최대값 정보를 포함합니다. 하나의 할당량에 대해 여러 행이나 0개의 행이
  대응할 수 있습니다.'
'keywords':
- 'system table'
- 'quota_limits'
'slug': '/operations/system-tables/quota_limits'
'title': 'system.quota_limits'
'doc_type': 'reference'
---


# system.quota_limits

모든 쿼터에 대한 모든 간격의 최대값에 대한 정보를 포함합니다. 하나의 쿼터에 대해 여러 개의 행 또는 0개가 대응될 수 있습니다.

열:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — 쿼터 이름.
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 리소스 소비를 계산하기 위한 시간 간격의 길이(초 단위).
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 논리 값. 간격이 무작위인지 여부를 나타냅니다. 무작위가 아닌 경우 간격은 항상 동일한 시간에 시작합니다. 예를 들어, 1분 간격은 항상 정수 분 수에서 시작합니다(즉, 11:20:00에서 시작할 수 있지만, 11:20:01에서 시작하지는 않습니다). 하루 간격은 항상 UTC 자정에 시작합니다. 만약 간격이 무작위라면, 첫 번째 간격은 무작위 시간에 시작하고, 이후의 간격은 하나씩 시작됩니다. 값:
- `0` — 간격이 무작위가 아님.
- `1` — 간격이 무작위임.
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 최대 쿼리 수.
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 최대 선택 쿼리 수.
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 최대 삽입 쿼리 수.
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 최대 오류 수.
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 최대 결과 행 수.
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 쿼리 결과를 저장하는 데 사용되는 최대 RAM 용량(바이트 단위).
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 쿼리에 참여한 모든 테이블 및 테이블 함수에서 읽은 최대 행 수.
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 쿼리에 참여한 모든 테이블 및 테이블 함수에서 읽은 최대 바이트 수.
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 쿼리 실행 시간의 최대값, 초 단위.
