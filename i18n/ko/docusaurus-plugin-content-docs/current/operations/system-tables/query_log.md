---
'description': '시스템 테이블에 실행된 쿼리에 대한 정보가 포함되어 있습니다. 예를 들어, 시작 시간, 처리 시간, 오류 메시지.'
'keywords':
- 'system table'
- 'query_log'
'slug': '/operations/system-tables/query_log'
'title': 'system.query_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_log

<SystemTableCloud/>

실행된 쿼리에 대한 메타데이터 및 통계(예: 시작 시간, 지속 시간, 오류 메시지, 리소스 사용량 및 기타 실행 세부정보)를 저장합니다. 쿼리의 결과는 저장하지 않습니다.

서버 구성의 [query_log](../../operations/server-configuration-parameters/settings.md#query_log) 섹션에서 쿼리 로깅 설정을 변경할 수 있습니다.

[log_queries = 0](/operations/settings/settings#log_queries)로 설정하여 쿼리 로깅을 비활성화할 수 있습니다. 이 테이블의 정보는 문제 해결에 중요하므로 로깅을 끄는 것은 권장하지 않습니다.

데이터의 플러시 주기는 [query_log](../../operations/server-configuration-parameters/settings.md#query_log) 서버 설정 섹션의 `flush_interval_milliseconds` 매개변수로 설정됩니다. 플러시를 강제로 실행하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용하십시오.

ClickHouse는 테이블에서 데이터를 자동으로 삭제하지 않습니다. 자세한 내용은 [Introduction](/operations/system-tables/overview#system-tables-introduction)을 참조하십시오.

`system.query_log` 테이블은 두 가지 종류의 쿼리를 등록합니다:

1. 클라이언트에 의해 직접 실행된 초기 쿼리.
2. 다른 쿼리(분산 쿼리 실행의 일환으로)에 의해 시작된 자식 쿼리. 이러한 유형의 쿼리에 대해서는 `initial_*` 열에 부모 쿼리에 대한 정보가 표시됩니다.

각 쿼리는 쿼리의 상태에 따라 `query_log` 테이블에 하나 또는 두 개의 행을 만듭니다 (상태는 `type` 열에서 확인할 수 있습니다):

1. 쿼리 실행이 성공적이었으면 `QueryStart` 및 `QueryFinish` 유형의 두 개의 행이 생성됩니다.
2. 쿼리 처리 중 오류가 발생하면 `QueryStart` 및 `ExceptionWhileProcessing` 유형의 두 개의 이벤트가 생성됩니다.
3. 쿼리 시작 전에 오류가 발생하면 `ExceptionBeforeStart` 유형의 단일 이벤트가 생성됩니다.

[log_queries_probability](/operations/settings/settings#log_queries_probability) 설정을 사용하여 `query_log` 테이블에 등록된 쿼리 수를 줄일 수 있습니다.

[log_formatted_queries](/operations/settings/settings#log_formatted_queries) 설정을 사용하여 `formatted_query` 열에 포맷된 쿼리를 기록할 수 있습니다.

## Columns {#columns}

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — 쿼리를 실행할 때 발생한 이벤트의 유형. 값:
  - `'QueryStart' = 1` — 쿼리 실행의 성공적인 시작.
  - `'QueryFinish' = 2` — 쿼리 실행의 성공적인 종료.
  - `'ExceptionBeforeStart' = 3` — 쿼리 실행 시작 전의 예외.
  - `'ExceptionWhileProcessing' = 4` — 쿼리 실행 중의 예외.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 쿼리 시작 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 쿼리 시작 시간.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도를 가진 쿼리 시작 시간.
- `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 쿼리 실행 시작 시간.
- `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도를 가진 쿼리 실행 시작 시간.
- `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리 실행 지속 시간 (밀리초).
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리에 참여한 모든 테이블 및 테이블 함수에서 읽어들인 총 행 수. 일반적인 서브쿼리, `IN` 및 `JOIN`에 대한 서브쿼리가 포함됩니다. 분산 쿼리의 경우 `read_rows`는 모든 복제본에서 읽은 총 행 수를 포함합니다. 각 복제본은 자신의 `read_rows` 값을 보내며, 쿼리 시작 서버는 모든 수신 및 로컬 값을 합산합니다. 캐시 볼륨은 이 값에 영향을 미치지 않습니다.
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리에 참여한 모든 테이블 및 테이블 함수에서 읽어들인 총 바이트 수. 일반적인 서브쿼리, `IN` 및 `JOIN`에 대한 서브쿼리가 포함됩니다. 분산 쿼리의 경우 `read_bytes`는 모든 복제본에서 읽은 총 바이트 수를 포함합니다. 각 복제본은 자신의 `read_bytes` 값을 보내며, 쿼리 시작 서버는 모든 수신 및 로컬 값을 합산합니다. 캐시 볼륨은 이 값에 영향을 미치지 않습니다.
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` 쿼리에 대해 기록된 행 수. 다른 쿼리에 대해서는 열 값이 0입니다.
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` 쿼리에 대해 기록된 바이트 수 (압축되지 않음). 다른 쿼리에 대해서는 열 값이 0입니다.
- `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `SELECT` 쿼리의 결과에서 행 수 또는 `INSERT` 쿼리의 행 수.
- `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리 결과를 저장하는 데 사용된 RAM 용량 (바이트).
- `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리에 의한 메모리 소비량.
- `current_database` ([String](../../sql-reference/data-types/string.md)) — 현재 데이터베이스의 이름.
- `query` ([String](../../sql-reference/data-types/string.md)) — 쿼리 문자열.
- `formatted_query` ([String](../../sql-reference/data-types/string.md)) — 포맷된 쿼리 문자열.
- `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 리터럴의 값만 다르고 동일한 쿼리에 대해 동일한 숫자 해시 값.
- `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 쿼리 유형. 
- `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에 포함된 데이터베이스 이름.
- `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에 포함된 테이블 이름.
- `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에 포함된 컬럼 이름.
- `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에 포함된 파티션 이름.
- `projections` ([String](../../sql-reference/data-types/string.md)) — 쿼리 실행 중 사용된 프로젝션의 이름.
- `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에 포함된 (물리화된 또는 라이브) 뷰의 이름.
- `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 예외 코드.
- `exception` ([String](../../sql-reference/data-types/string.md)) — 예외 메시지.
- `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [스택 추적](https://en.wikipedia.org/wiki/Stack_trace). 쿼리가 성공적으로 완료되면 빈 문자열.
- `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 쿼리 유형. 가능한 값:
  - 1 — 쿼리가 클라이언트에 의해 시작됨.
  - 0 — 쿼리가 분산 쿼리 실행의 일환으로 다른 쿼리에 의해 시작됨.
- `user` ([String](../../sql-reference/data-types/string.md)) — 현재 쿼리를 시작한 사용자 이름.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 쿼리 ID.
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 쿼리 실행에 사용된 IP 주소.
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 쿼리 실행에 사용된 클라이언트 포트.
- `initial_user` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리를 실행한 사용자 이름 (분산 쿼리 실행의 경우).
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리 ID (분산 쿼리 실행의 경우).
- `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 부모 쿼리가 실행된 IP 주소.
- `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 부모 쿼리를 실행하는 데 사용된 클라이언트 포트.
- `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 초기 쿼리 시작 시간 (분산 쿼리 실행의 경우).
- `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도를 가진 초기 쿼리 시작 시간 (분산 쿼리 실행의 경우).
- `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 쿼리가 시작된 인터페이스. 가능한 값:
  - 1 — TCP.
  - 2 — HTTP.
- `os_user` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md)를 실행하는 운영 체제 사용자 이름.
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트가 실행되는 클라이언트 기계의 호스트 이름.
- `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 이름.
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 수정 버전.
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 주요 버전.
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 부 버전.
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트 버전의 패치 구성 요소.
- `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md)용 여러 쿼리 스크립트에서 쿼리 번호.
- `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md)용 여러 쿼리 스크립트에서 쿼리 시작의 행 번호.
- `http_method` (UInt8) — 쿼리를 시작한 HTTP 메서드. 가능한 값:
  - 0 — 쿼리가 TCP 인터페이스에서 시작됨.
  - 1 — `GET` 메서드가 사용됨.
  - 2 — `POST` 메서드가 사용됨.
- `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP 쿼리에서 전달된 HTTP 헤더 `UserAgent`.
- `http_referer` ([String](../../sql-reference/data-types/string.md)) — HTTP 쿼리에서 전달된 HTTP 헤더 `Referer` (쿼리를 생성한 페이지의 절대 또는 부분 주소를 포함).
- `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — HTTP 쿼리에서 전달된 HTTP 헤더 `X-Forwarded-For`.
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — [쿼터](../../operations/quotas.md) 설정에서 지정된 `quota key` (see `keyed`).
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 수정 버전.
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 다양한 메트릭을 측정하는 ProfileEvents. 그에 대한 설명은 [system.events](/operations/system-tables/events) 테이블에서 확인할 수 있습니다.
- `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 클라이언트가 쿼리를 실행할 때 변경된 설정. 설정 변경 로깅을 활성화하려면 `log_query_settings` 매개변수를 1로 설정합니다.
- `log_comment` ([String](../../sql-reference/data-types/string.md)) — 로그 댓글. [max_query_size](../../operations/settings/settings.md#max_query_size)보다 길지 않은 임의의 문자열로 설정할 수 있습니다. 정의되지 않은 경우 빈 문자열입니다.
- `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 쿼리 실행에 참여하는 스레드 ID. 이 스레드는 동시에 실행되지 않을 수 있습니다.
- `peak_threads_usage` ([UInt64)](../../sql-reference/data-types/int-uint.md)) — 쿼리를 실행 중인 최대 동시 스레드 수.
- `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `aggregate functions`의 정규 이름.
- `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `aggregate functions combinators`의 정규 이름.
- `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `database engines`의 정규 이름.
- `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `data type families`의 정규 이름.
- `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `dictionaries`의 정규 이름. XML 파일을 사용하여 구성된 딕셔너리의 경우 딕셔너리의 이름이고, SQL 문에 의해 생성된 딕셔너리의 경우 정규 이름은 완전한 자격의 객체 이름입니다.
- `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `formats`의 정규 이름.
- `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `functions`의 정규 이름.
- `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `storages`의 정규 이름.
- `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `table functions`의 정규 이름.
- `used_executable_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `executable user defined functions`의 정규 이름.
- `used_sql_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `sql user defined functions`의 정규 이름.
- `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 성공적으로 확인된 권한.
- `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 누락된 권한.
- `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — 쿼리 실행 중 [쿼리 캐시](../query-cache.md)의 사용량. 값:
  - `'Unknown'` = 상태 미상.
  - `'None'` = 쿼리 결과가 쿼리 캐시에 기록되거나 읽히지 않음.
  - `'Write'` = 쿼리 결과가 쿼리 캐시에 기록됨.
  - `'Read'` = 쿼리 결과가 쿼리 캐시에서 읽힘.

## Examples {#examples}

**기본 예제**

```sql
SELECT * FROM system.query_log WHERE type = 'QueryFinish' ORDER BY query_start_time DESC LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                              clickhouse.eu-central1.internal
type:                                  QueryFinish
event_date:                            2021-11-03
event_time:                            2021-11-03 16:13:54
event_time_microseconds:               2021-11-03 16:13:54.953024
query_start_time:                      2021-11-03 16:13:54
query_start_time_microseconds:         2021-11-03 16:13:54.952325
query_duration_ms:                     0
read_rows:                             69
read_bytes:                            6187
written_rows:                          0
written_bytes:                         0
result_rows:                           69
result_bytes:                          48256
memory_usage:                          0
current_database:                      default
query:                                 DESCRIBE TABLE system.query_log
formatted_query:
normalized_query_hash:                 8274064835331539124
query_kind:
databases:                             []
tables:                                []
columns:                               []
projections:                           []
views:                                 []
exception_code:                        0
exception:
stack_trace:
is_initial_query:                      1
user:                                  default
query_id:                              7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
address:                               ::ffff:127.0.0.1
port:                                  40452
initial_user:                          default
initial_query_id:                      7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
initial_address:                       ::ffff:127.0.0.1
initial_port:                          40452
initial_query_start_time:              2021-11-03 16:13:54
initial_query_start_time_microseconds: 2021-11-03 16:13:54.952325
interface:                             1
os_user:                               sevirov
client_hostname:                       clickhouse.eu-central1.internal
client_name:                           ClickHouse
client_revision:                       54449
client_version_major:                  21
client_version_minor:                  10
client_version_patch:                  1
http_method:                           0
http_user_agent:
http_referer:
forwarded_for:
quota_key:
revision:                              54456
log_comment:
thread_ids:                            [30776,31174]
ProfileEvents:                         {'Query':1,'NetworkSendElapsedMicroseconds':59,'NetworkSendBytes':2643,'SelectedRows':69,'SelectedBytes':6187,'ContextLock':9,'RWLockAcquiredReadLocks':1,'RealTimeMicroseconds':817,'UserTimeMicroseconds':427,'SystemTimeMicroseconds':212,'OSCPUVirtualTimeMicroseconds':639,'OSReadChars':894,'OSWriteChars':319}
Settings:                              {'load_balancing':'random','max_memory_usage':'10000000000'}
used_aggregate_functions:              []
used_aggregate_function_combinators:   []
used_database_engines:                 []
used_data_type_families:               []
used_dictionaries:                     []
used_formats:                          []
used_functions:                        []
used_storages:                         []
used_table_functions:                  []
used_executable_user_defined_functions:[]
used_sql_user_defined_functions:       []
used_privileges:                       []
missing_privileges:                    []
query_cache_usage:                     None
```

**클라우드 예제**

ClickHouse Cloud에서는 `system.query_log`가 각 노드에 로컬입니다. 모든 항목을 보려면 [`clusterAllReplicas`](/sql-reference/table-functions/cluster)를 통해 쿼리해야 합니다.

예를 들어, "default" 클러스터의 모든 복제본에서 query_log 행을 집계하려면 다음과 같이 작성할 수 있습니다:

```sql
SELECT * 
FROM clusterAllReplicas('default', system.query_log)
WHERE event_time >= now() - toIntervalHour(1)
LIMIT 10
SETTINGS skip_unavailable_shards = 1;
```

**참고**

- [system.query_thread_log](/operations/system-tables/query_thread_log) — 이 테이블은 각 쿼리 실행 스레드에 대한 정보를 포함합니다.
