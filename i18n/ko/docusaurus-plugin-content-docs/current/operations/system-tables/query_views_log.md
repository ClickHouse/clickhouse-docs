---
'description': '쿼리를 실행할 때 실행된 종속 뷰에 대한 정보를 포함하는 시스템 테이블, 예를 들어 뷰 유형 또는 실행 시간.'
'keywords':
- 'system table'
- 'query_views_log'
'slug': '/operations/system-tables/query_views_log'
'title': 'system.query_views_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_views_log

<SystemTableCloud/>

쿼리를 실행할 때 실행된 종속 뷰에 대한 정보를 포함합니다. 예를 들어 뷰 유형이나 실행 시간 등이 있습니다.

로깅을 시작하려면:

1. [query_views_log](../../operations/server-configuration-parameters/settings.md#query_views_log) 섹션에서 매개변수를 구성합니다.
2. [log_query_views](/operations/settings/settings#log_query_views)를 1로 설정합니다.

데이터 플러시 주기는 [query_views_log](../../operations/server-configuration-parameters/settings.md#query_views_log) 서버 설정 섹션의 `flush_interval_milliseconds` 매개변수에서 설정됩니다. 플러시를 강제로 실행하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용하세요.

ClickHouse는 테이블에서 데이터를 자동으로 삭제하지 않습니다. 더 자세한 내용은 [소개](/operations/system-tables/overview#system-tables-introduction)를 참조하세요.

[log_queries_probability](/operations/settings/settings#log_queries_probability) 설정을 사용하여 `query_views_log` 테이블에 기록되는 쿼리 수를 줄일 수 있습니다.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 뷰의 마지막 이벤트가 발생한 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 뷰의 실행이 완료된 날짜와 시간.
- `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — 마이크로초 정밀도로 뷰의 실행이 완료된 날짜와 시간.
- `view_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 밀리초로 측정한 뷰 실행 시간(단계의 합계).
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리의 ID (분산 쿼리 실행용).
- `view_name` ([String](../../sql-reference/data-types/string.md)) — 뷰의 이름.
- `view_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 뷰의 UUID.
- `view_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 뷰의 유형. 값:
  - `'Default' = 1` — [기본 뷰](/sql-reference/statements/create/view#normal-view). 이 로그에 나타나서는 안 됩니다.
  - `'Materialized' = 2` — [물리화된 뷰](/sql-reference/statements/create/view#materialized-view).
  - `'Live' = 3` — [라이브 뷰](../../sql-reference/statements/create/view.md#live-view).
- `view_query` ([String](../../sql-reference/data-types/string.md)) — 뷰에 의해 실행된 쿼리.
- `view_target` ([String](../../sql-reference/data-types/string.md)) — 뷰 타겟 테이블의 이름.
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 읽은 행의 수.
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 읽은 바이트 수.
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 기록된 행의 수.
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 기록된 바이트 수.
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 뷰의 맥락에서 할당된 메모리와 해제된 메모리의 최대 차이.
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — 다양한 메트릭을 측정하는 ProfileEvents. 이들에 대한 설명은 [system.events](/operations/system-tables/events) 테이블에서 찾을 수 있습니다.
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 뷰의 상태. 값:
  - `'QueryStart' = 1` — 뷰 실행이 성공적으로 시작되었습니다. 나타나서는 안 됩니다.
  - `'QueryFinish' = 2` — 뷰 실행이 성공적으로 종료되었습니다.
  - `'ExceptionBeforeStart' = 3` — 뷰 실행 시작 전 예외가 발생했습니다.
  - `'ExceptionWhileProcessing' = 4` — 뷰 실행 중 예외가 발생했습니다.
- `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 예외의 코드.
- `exception` ([String](../../sql-reference/data-types/string.md)) — 예외 메시지.
- `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [스택 추적](https://en.wikipedia.org/wiki/Stack_trace). 쿼리가 성공적으로 완료되면 빈 문자열.

**예제**

쿼리:

```sql
SELECT * FROM system.query_views_log LIMIT 1 \G;
```

결과:

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2021-06-22
event_time:              2021-06-22 13:23:07
event_time_microseconds: 2021-06-22 13:23:07.738221
view_duration_ms:        0
initial_query_id:        c3a1ac02-9cad-479b-af54-9e9c0a7afd70
view_name:               default.matview_inner
view_uuid:               00000000-0000-0000-0000-000000000000
view_type:               Materialized
view_query:              SELECT * FROM default.table_b
view_target:             default.`.inner.matview_inner`
read_rows:               4
read_bytes:              64
written_rows:            2
written_bytes:           32
peak_memory_usage:       4196188
ProfileEvents:           {'FileOpen':2,'WriteBufferFromFileDescriptorWrite':2,'WriteBufferFromFileDescriptorWriteBytes':187,'IOBufferAllocs':3,'IOBufferAllocBytes':3145773,'FunctionExecute':3,'DiskWriteElapsedMicroseconds':13,'InsertedRows':2,'InsertedBytes':16,'SelectedRows':4,'SelectedBytes':48,'ContextLock':16,'RWLockAcquiredReadLocks':1,'RealTimeMicroseconds':698,'SoftPageFaults':4,'OSReadChars':463}
status:                  QueryFinish
exception_code:          0
exception:
stack_trace:
```

**참조**

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
