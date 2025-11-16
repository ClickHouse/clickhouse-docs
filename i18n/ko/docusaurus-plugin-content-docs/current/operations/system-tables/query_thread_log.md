---
'description': '시스템 테이블은 쿼리를 실행하는 스레드에 대한 정보를 포함합니다. 예를 들어, 스레드 이름, 스레드 시작 시간, 쿼리
  처리 기간.'
'keywords':
- 'system table'
- 'query_thread_log'
'slug': '/operations/system-tables/query_thread_log'
'title': 'system.query_thread_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_thread_log

<SystemTableCloud/>

쿼리를 실행하는 스레드에 대한 정보를 포함합니다. 예를 들어 스레드 이름, 스레드 시작 시간, 쿼리 처리 지속 시간 등이 포함됩니다.

로깅을 시작하려면:

1.  [query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log) 섹션에서 매개변수를 구성합니다.
2.  [log_query_threads](/operations/settings/settings#log_query_threads) 를 1로 설정합니다.

데이터 플러시 기간은 [query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log) 서버 설정 섹션의 `flush_interval_milliseconds` 매개변수에 설정됩니다. 플러시를 강제로 수행하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용하십시오.

ClickHouse는 테이블에서 데이터를 자동으로 삭제하지 않습니다. 더 자세한 내용은 [Introduction](/operations/system-tables/overview#system-tables-introduction)을 참조하십시오.

`query_thread_log` 테이블에 등록된 쿼리 수를 줄이기 위해 [log_queries_probability](/operations/settings/settings#log_queries_probability) 설정을 사용할 수 있습니다.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 스레드가 쿼리 실행을 마친 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 스레드가 쿼리 실행을 마친 날짜와 시간.
- `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — 마이크로초 정밀도로 스레드가 쿼리 실행을 마친 날짜와 시간.
- `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 쿼리 실행 시작 시간.
- `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도로 쿼리 실행 시작 시간.
- `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리 실행 지속 시간.
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 읽은 행 수.
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 읽은 바이트 수.
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` 쿼리의 경우, 작성된 행 수. 다른 쿼리의 경우, 열 값은 0.
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` 쿼리의 경우, 작성된 바이트 수. 다른 쿼리의 경우, 열 값은 0.
- `memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 스레드의 할당된 메모리와 해제된 메모리의 차이.
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 스레드의 할당된 메모리와 해제된 메모리의 최대 차이.
- `thread_name` ([String](../../sql-reference/data-types/string.md)) — 스레드 이름.
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — OS 스레드 ID.
- `master_thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 초기 스레드의 OS 초기 ID.
- `query` ([String](../../sql-reference/data-types/string.md)) — 쿼리 문자열.
- `is_initial_query` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리 유형. 가능한 값:
  - 1 — 클라이언트에 의해 쿼리가 시작되었습니다.
  - 0 — 분산 쿼리 실행을 위해 다른 쿼리에 의해 쿼리가 시작되었습니다.
- `user` ([String](../../sql-reference/data-types/string.md)) — 현재 쿼리를 시작한 사용자 이름.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 쿼리 ID.
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 쿼리를 수행하는 데 사용된 IP 주소.
- `port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리를 수행하는 데 사용된 클라이언트 포트.
- `initial_user` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리를 실행한 사용자 이름 (분산 쿼리 실행을 위한).
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리 ID (분산 쿼리 실행을 위한).
- `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 부모 쿼리가 실행된 IP 주소.
- `initial_port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — 부모 쿼리를 수행하는 데 사용된 클라이언트 포트.
- `interface` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리가 시작된 인터페이스. 가능한 값:
  - 1 — TCP.
  - 2 — HTTP.
- `os_user` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 를 실행하는 OS의 사용자 이름.
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트가 실행되는 클라이언트 머신의 호스트 이름.
- `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트 이름.
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 개정판.
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 주요 버전.
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 부 버전.
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트 버전의 패치 구성 요소.
- `http_method` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리를 시작한 HTTP 메서드. 가능한 값:
  - 0 — 쿼리가 TCP 인터페이스에서 시작되었습니다.
  - 1 — `GET` 메서드가 사용되었습니다.
  - 2 — `POST` 메서드가 사용되었습니다.
- `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP 요청에 전달된 `UserAgent` 헤더.
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — [quotas](../../operations/quotas.md) 설정에 지정된 "쿼터 키" (키가 지정된 것을 참조).
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 버전.
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — 이 스레드에 대한 다양한 지표를 측정하는 ProfileEvents. 그 설명은 [system.events](/operations/system-tables/events) 테이블에서 찾을 수 있습니다.

**예제**

```sql
SELECT * FROM system.query_thread_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                      clickhouse.eu-central1.internal
event_date:                    2020-09-11
event_time:                    2020-09-11 10:08:17
event_time_microseconds:       2020-09-11 10:08:17.134042
query_start_time:              2020-09-11 10:08:17
query_start_time_microseconds: 2020-09-11 10:08:17.063150
query_duration_ms:             70
read_rows:                     0
read_bytes:                    0
written_rows:                  1
written_bytes:                 12
memory_usage:                  4300844
peak_memory_usage:             4300844
thread_name:                   TCPHandler
thread_id:                     638133
master_thread_id:              638133
query:                         INSERT INTO test1 VALUES
is_initial_query:              1
user:                          default
query_id:                      50a320fd-85a8-49b8-8761-98a86bcbacef
address:                       ::ffff:127.0.0.1
port:                          33452
initial_user:                  default
initial_query_id:              50a320fd-85a8-49b8-8761-98a86bcbacef
initial_address:               ::ffff:127.0.0.1
initial_port:                  33452
interface:                     1
os_user:                       bharatnc
client_hostname:               tower
client_name:                   ClickHouse
client_revision:               54437
client_version_major:          20
client_version_minor:          7
client_version_patch:          2
http_method:                   0
http_user_agent:
quota_key:
revision:                      54440
ProfileEvents:        {'Query':1,'SelectQuery':1,'ReadCompressedBytes':36,'CompressedReadBufferBlocks':1,'CompressedReadBufferBytes':10,'IOBufferAllocs':1,'IOBufferAllocBytes':89,'ContextLock':15,'RWLockAcquiredReadLocks':1}
```

**참조**

- [system.query_log](/operations/system-tables/query_log) — 쿼리 실행에 대한 일반 정보를 포함하는 `query_log` 시스템 테이블의 설명.
- [system.query_views_log](/operations/system-tables/query_views_log) — 이 테이블은 쿼리 중에 실행된 각 뷰에 대한 정보를 포함합니다.
