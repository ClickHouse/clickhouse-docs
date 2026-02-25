---
description: '쿼리 실행 시 실행되는 종속 VIEW에 대한 정보(예: VIEW 유형, 실행 시간 등)를 포함하는 system 테이블입니다.'
keywords: ['system 테이블', 'query_views_log']
slug: /operations/system-tables/query_views_log
title: 'system.query_views_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.query_views_log \{#systemquery_views_log\}

<SystemTableCloud />

쿼리를 실행할 때 함께 실행되는 종속 뷰에 대한 정보(예: 뷰 유형, 실행 시간 등)를 포함합니다.

로깅을 시작하려면:

1. [query&#95;views&#95;log](../../operations/server-configuration-parameters/settings.md#query_views_log) 섹션에서 파라미터를 구성합니다.
2. [log&#95;query&#95;views](/operations/settings/settings#log_query_views)를 1로 설정합니다.

데이터 플러시 주기는 [query&#95;views&#95;log](../../operations/server-configuration-parameters/settings.md#query_views_log) 서버 설정 섹션의 `flush_interval_milliseconds` 파라미터로 설정합니다. 강제로 플러시하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용합니다.

ClickHouse는 이 테이블의 데이터를 자동으로 삭제하지 않습니다. 자세한 내용은 [Introduction](/operations/system-tables/overview#system-tables-introduction)을 참고하십시오.

`query_views_log` 테이블에 기록되는 쿼리 수를 줄이려면 [log&#95;queries&#95;probability](/operations/settings/settings#log_queries_probability) SETTING을 사용할 수 있습니다.

Columns:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행한 서버의 호스트 이름입니다.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 뷰에서 마지막 이벤트가 발생한 날짜입니다.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 뷰 실행이 완료된 날짜와 시간입니다.
* `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — 마이크로초 정밀도로 뷰 실행이 완료된 날짜와 시간입니다.
* `view_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 뷰 실행 시간(단계 합계)으로, 밀리초 단위입니다.
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리의 ID입니다(분산 쿼리 실행 시).
* `view_name` ([String](../../sql-reference/data-types/string.md)) — 뷰 이름입니다.
* `view_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 뷰의 UUID입니다.
* `view_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 뷰 유형입니다. 값:
  * `'Default' = 1` — [기본 뷰](/sql-reference/statements/create/view#normal-view)입니다. 이 로그에는 나타나지 않아야 합니다.
  * `'Materialized' = 2` — [materialized view](/sql-reference/statements/create/view#materialized-view)입니다.
  * `'Live' = 3` — [live view](../../sql-reference/statements/create/view.md#live-view)입니다.
* `view_query` ([String](../../sql-reference/data-types/string.md)) — 뷰가 실행한 쿼리입니다.
* `view_target` ([String](../../sql-reference/data-types/string.md)) — 뷰 대상 테이블의 이름입니다.
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 읽은 행 수입니다.
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 읽은 바이트 수입니다.
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 기록된 행 수입니다.
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 기록된 바이트 수입니다.
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 뷰 컨텍스트에서 할당된 메모리와 해제된 메모리 양의 최대 차이입니다.
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — 다양한 메트릭을 측정하는 ProfileEvents입니다. 이에 대한 설명은 [system.events](/operations/system-tables/events) 테이블에서 확인할 수 있습니다.
* `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 뷰 상태입니다. 값:
  * `'QueryStart' = 1` — 뷰 실행이 성공적으로 시작되었음을 나타냅니다. 나타나지 않아야 합니다.
  * `'QueryFinish' = 2` — 뷰 실행이 성공적으로 종료되었음을 나타냅니다.
  * `'ExceptionBeforeStart' = 3` — 뷰 실행이 시작되기 전에 예외가 발생했음을 나타냅니다.
  * `'ExceptionWhileProcessing' = 4` — 뷰 실행 중 예외가 발생했음을 나타냅니다.
* `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 예외 코드입니다.
* `exception` ([String](../../sql-reference/data-types/string.md)) — 예외 메시지입니다.
* `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [스택 트레이스](https://en.wikipedia.org/wiki/Stack_trace)입니다. 쿼리가 성공적으로 완료된 경우 빈 문자열입니다.

**예시**

Query:

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

**참고**

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
