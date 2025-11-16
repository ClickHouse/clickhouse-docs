---
'description': '시스템 테이블로, 치명적인 오류에 대한 스택 추적 정보를 포함합니다.'
'keywords':
- 'system table'
- 'crash_log'
'slug': '/operations/system-tables/crash_log'
'title': 'system.crash_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

치명적인 오류에 대한 스택 트레이스 정보를 포함합니다. 이 테이블은 기본적으로 데이터베이스에 존재하지 않으며, 치명적인 오류가 발생할 때만 생성됩니다.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트명.
- `event_date` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트의 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트의 시간.
- `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 이벤트의 타임스탬프(나노초 포함).
- `signal` ([Int32](../../sql-reference/data-types/int-uint.md)) — 신호 번호.
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 스레드 ID.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 쿼리 ID.
- `trace` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 충돌 시점의 스택 트레이스. 각 요소는 ClickHouse 서버 프로세스 내의 가상 메모리 주소입니다.
- `trace_full` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 충돌 시점의 스택 트레이스. 각 요소는 ClickHouse 서버 프로세스 내에서 호출된 메서드를 포함합니다.
- `version` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 서버 버전.
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 서버 리비전.
- `build_id` ([String](../../sql-reference/data-types/string.md)) — 컴파일러에 의해 생성된 BuildID.

**예시**

쿼리:

```sql
SELECT * FROM system.crash_log ORDER BY event_time DESC LIMIT 1;
```

결과 (전체 아님):

```text
Row 1:
──────
hostname:     clickhouse.eu-central1.internal
event_date:   2020-10-14
event_time:   2020-10-14 15:47:40
timestamp_ns: 1602679660271312710
signal:       11
thread_id:    23624
query_id:     428aab7c-8f5c-44e9-9607-d16b44467e69
trace:        [188531193,...]
trace_full:   ['3. DB::(anonymous namespace)::FunctionFormatReadableTimeDelta::executeImpl(std::__1::vector<DB::ColumnWithTypeAndName, std::__1::allocator<DB::ColumnWithTypeAndName> >&, std::__1::vector<unsigned long, std::__1::allocator<unsigned long> > const&, unsigned long, unsigned long) const @ 0xb3cc1f9 in /home/username/work/ClickHouse/build/programs/clickhouse',...]
version:      ClickHouse 20.11.1.1
revision:     54442
build_id:
```

**참고**
- [trace_log](../../operations/system-tables/trace_log.md) 시스템 테이블
