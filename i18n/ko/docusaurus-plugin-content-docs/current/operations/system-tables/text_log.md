---
'description': '시스템 테이블에 로그 항목이 포함되어 있습니다.'
'keywords':
- 'system table'
- 'text_log'
'slug': '/operations/system-tables/text_log'
'title': 'system.text_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.text_log

<SystemTableCloud/>

로그 항목을 포함합니다. 이 테이블로 전송되는 로그 수준은 `text_log.level` 서버 설정에 제한될 수 있습니다.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트명.
- `event_date` (Date) — 항목의 날짜.
- `event_time` (DateTime) — 항목의 시간.
- `event_time_microseconds` (DateTime64) — 마이크로초 정밀도로 기록된 항목의 시간.
- `microseconds` (UInt32) — 항목의 마이크로초.
- `thread_name` (String) — 로그가 수행된 스레드의 이름.
- `thread_id` (UInt64) — OS 스레드 ID.
- `level` (`Enum8`) — 항목 수준. 가능한 값:
  - `1` 또는 `'Fatal'`.
  - `2` 또는 `'Critical'`.
  - `3` 또는 `'Error'`.
  - `4` 또는 `'Warning'`.
  - `5` 또는 `'Notice'`.
  - `6` 또는 `'Information'`.
  - `7` 또는 `'Debug'`.
  - `8` 또는 `'Trace'`.
- `query_id` (String) — 쿼리의 ID.
- `logger_name` (LowCardinality(String)) — 로거의 이름 (예: `DDLWorker`).
- `message` (String) — 메시지 자체.
- `revision` (UInt32) — ClickHouse 개정판.
- `source_file` (LowCardinality(String)) — 로그가 수행된 소스 파일.
- `source_line` (UInt64) — 로그가 수행된 소스 줄.
- `message_format_string` (LowCardinality(String)) — 메시지를 형식화하는 데 사용된 형식 문자열.
- `value1` (String) - 메시지를 형식화하는 데 사용된 인수 1.
- `value2` (String) - 메시지를 형식화하는 데 사용된 인수 2.
- `value3` (String) - 메시지를 형식화하는 데 사용된 인수 3.
- `value4` (String) - 메시지를 형식화하는 데 사용된 인수 4.
- `value5` (String) - 메시지를 형식화하는 데 사용된 인수 5.
- `value6` (String) - 메시지를 형식화하는 데 사용된 인수 6.
- `value7` (String) - 메시지를 형식화하는 데 사용된 인수 7.
- `value8` (String) - 메시지를 형식화하는 데 사용된 인수 8.
- `value9` (String) - 메시지를 형식화하는 데 사용된 인수 9.
- `value10` (String) - 메시지를 형식화하는 데 사용된 인수 10.

**예제**

```sql
SELECT * FROM system.text_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2020-09-10
event_time:              2020-09-10 11:23:07
event_time_microseconds: 2020-09-10 11:23:07.871397
microseconds:            871397
thread_name:             clickhouse-serv
thread_id:               564917
level:                   Information
query_id:
logger_name:             DNSCacheUpdater
message:                 Update period 15 seconds
revision:                54440
source_file:             /ClickHouse/src/Interpreters/DNSCacheUpdater.cpp; void DB::DNSCacheUpdater::start()
source_line:             45
message_format_string:   Update period {} seconds
value1:                  15
value2:                  
value3:                  
value4:                  
value5:                  
value6:                  
value7:                  
value8:                  
value9:                  
value10:                  
```
