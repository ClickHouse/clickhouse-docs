---
description: '실행된 쿼리의 정보(예: 시작 시각, 처리 시간, 오류 메시지)를 포함하는 시스템 테이블입니다.'
keywords: ['시스템 테이블', 'query_log']
slug: /operations/system-tables/query_log
title: 'system.query_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_log \{#systemquery_log\}

<SystemTableCloud/>

실행된 쿼리에 대한 메타데이터와 통계(시작 시각, 소요 시간, 오류 메시지, 리소스 사용량 및 기타 실행 세부 정보 등)를 저장합니다. 쿼리 결과 자체는 저장하지 않습니다. 

서버 설정의 [query_log](../../operations/server-configuration-parameters/settings.md#query_log) 섹션에서 쿼리 로깅 관련 설정을 변경할 수 있습니다.

[log_queries = 0](/operations/settings/settings#log_queries) 설정으로 쿼리 로깅을 비활성화할 수 있습니다. 이 테이블의 정보는 문제 해결에 중요하므로 로깅을 끄지 않을 것을 권장합니다.

데이터 플러시 주기는 [query_log](../../operations/server-configuration-parameters/settings.md#query_log) 서버 설정 섹션의 `flush_interval_milliseconds` 파라미터로 설정합니다. 플러시를 강제로 수행하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용합니다.

ClickHouse는 이 테이블에서 데이터를 자동으로 삭제하지 않습니다. 자세한 내용은 [Introduction](/operations/system-tables/overview#system-tables-introduction)을 참조하십시오.

`system.query_log` 테이블은 두 종류의 쿼리를 기록합니다.

1.  클라이언트에서 직접 실행한 초기 쿼리
2.  다른 쿼리(분산 쿼리 실행용)에 의해 시작된 자식 쿼리  
    이러한 유형의 쿼리에 대해서는 부모 쿼리에 대한 정보가 `initial_*` 컬럼에 표시됩니다.

각 쿼리는 상태(쿼리의 `type` 컬럼 참조)에 따라 `query_log` 테이블에 하나 또는 두 개의 행을 생성합니다.

1.  쿼리 실행이 성공하면 `QueryStart` 및 `QueryFinish` 타입의 두 행이 생성됩니다.
2.  쿼리 처리 중에 오류가 발생하면 `QueryStart` 및 `ExceptionWhileProcessing` 타입의 두 이벤트가 생성됩니다.
3.  쿼리를 시작하기 전에 오류가 발생하면 `ExceptionBeforeStart` 타입의 단일 이벤트가 생성됩니다.

`query_log` 테이블에 기록되는 쿼리 수를 줄이려면 [log_queries_probability](/operations/settings/settings#log_queries_probability) 설정을 사용할 수 있습니다.

서식이 지정된 쿼리를 `formatted_query` 컬럼에 기록하려면 [log_formatted_queries](/operations/settings/settings#log_formatted_queries) 설정을 사용할 수 있습니다.

## 컬럼 \{#columns\}

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행한 서버의 호스트명입니다.
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) — 쿼리를 실행할 때 발생한 이벤트의 유형입니다. 가능한 값:`
  * `'QueryStart' = 1` — 쿼리 실행이 성공적으로 시작되었음을 의미합니다.
  * `'QueryFinish' = 2` — 쿼리 실행이 성공적으로 종료되었음을 의미합니다.
  * `'ExceptionBeforeStart' = 3` — 쿼리 실행이 시작되기 전에 예외가 발생했음을 의미합니다.
  * `'ExceptionWhileProcessing' = 4` — 쿼리 실행 중에 예외가 발생했음을 의미합니다.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 쿼리가 시작된 날짜입니다.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 쿼리가 시작된 시각.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 단위까지 기록되는 쿼리 시작 시간입니다.
* `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 쿼리 실행이 시작된 시간입니다.
* `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 단위의 정밀도로 기록되는 쿼리 실행 시작 시각입니다.
* `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리 실행 소요 시간(밀리초 단위)입니다.
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리에 참여한 모든 테이블과 테이블 함수에서 읽은 행의 총 개수입니다. 여기에는 일반 서브쿼리와 `IN` 및 `JOIN`용 서브쿼리가 포함됩니다. 분산 쿼리의 경우 `read_rows`에는 모든 레플리카에서 읽은 행의 총 개수가 포함됩니다. 각 레플리카는 자체 `read_rows` 값을 전송하고, 쿼리를 시작한 서버는 수신한 값과 로컬 값을 모두 합산합니다. 캐시에서 읽은 데이터 양은 이 값에 영향을 주지 않습니다.
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리에 참여한 모든 테이블과 테이블 함수에서 읽은 총 바이트 수입니다. 여기에는 일반 서브쿼리, `IN` 및 `JOIN`을 위한 서브쿼리가 포함됩니다. 분산 쿼리의 경우 `read_bytes`에는 모든 레플리카에서 읽은 총 바이트 수가 포함됩니다. 각 레플리카는 자신의 `read_bytes` 값을 전송하고, 쿼리를 시작한 서버가 수신한 값과 로컬 값을 모두 합산합니다. 캐시에서 읽은 데이터의 양은 이 값에 영향을 주지 않습니다.
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` 쿼리에서는 기록된 행 수입니다. 다른 쿼리에서는 이 컬럼 값이 0입니다.
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` 쿼리의 경우 기록된 바이트 수(압축되지 않은 기준)입니다. 다른 쿼리에서는 이 컬럼 값이 0입니다.
* `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `SELECT` 쿼리 결과의 행 수 또는 `INSERT` 쿼리의 행 수입니다.
* `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리 결과를 저장하는 데 사용된 RAM의 용량(바이트 단위)입니다.
* `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리의 메모리 사용량입니다.
* `current_database` ([String](../../sql-reference/data-types/string.md)) — 현재 데이터베이스 이름입니다.
* `query` ([String](../../sql-reference/data-types/string.md)) — 쿼리 문자열.
* `formatted_query` ([String](../../sql-reference/data-types/string.md)) — 서식이 적용된 쿼리 문자열.
* `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 리터럴 값만 서로 다른 쿼리에서도 동일하게 계산되는 숫자 해시 값입니다.
* `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 쿼리 유형입니다.
* `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에서 사용된 데이터베이스 이름입니다.
* `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에 포함된 테이블 이름입니다.
* `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에 포함된 컬럼 이름입니다.
* `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에 포함된 파티션 이름입니다.
* `projections` ([String](../../sql-reference/data-types/string.md)) — 쿼리 실행 중 사용된 프로젝션 이름입니다.
* `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 쿼리에 포함된 구체화된 뷰(Materialized View) 또는 라이브 뷰(Live View)의 이름입니다.
* `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 예외 코드입니다.
* `exception` ([String](../../sql-reference/data-types/string.md)) — 예외 메시지입니다.
* `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [스택 트레이스](https://en.wikipedia.org/wiki/Stack_trace). 쿼리가 성공적으로 완료되면 빈 문자열입니다.
* `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 쿼리 유형입니다. 가능한 값은 다음과 같습니다:
  * 1 — 클라이언트가 쿼리를 시작했습니다.
  * 0 — 분산 쿼리 실행의 일부로 다른 쿼리가 시작했습니다.
* `connection_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 연결이 이루어진 클라이언트의 IP 주소입니다. 프록시를 통해 연결된 경우 프록시의 주소가 됩니다.
* `connection_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 연결이 이루어진 클라이언트 포트입니다. 프록시를 통해 연결된 경우 프록시의 포트입니다.
* `user` ([String](../../sql-reference/data-types/string.md)) — 현재 쿼리를 실행한 사용자 이름입니다.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 쿼리 ID입니다.
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 쿼리를 실행하는 데 사용된 IP 주소입니다. 프록시를 통해 연결되어 있고 [auth&#95;use&#95;forwarded&#95;address](/operations/server-configuration-parameters/settings#auth_use_forwarded_address)가 설정된 경우에는 이 값이 프록시가 아닌 클라이언트의 주소가 됩니다.
* `port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리를 실행하는 데 사용된 클라이언트 포트입니다. 프록시를 통해 연결하고 [auth&#95;use&#95;forwarded&#95;address](/operations/server-configuration-parameters/settings#auth_use_forwarded_address)가 설정된 경우, 이 값에는 프록시 포트가 아니라 클라이언트 포트가 기록됩니다.
* `initial_user` ([String](../../sql-reference/data-types/string.md)) — 분산 쿼리 실행 시 초기 쿼리를 실행한 사용자의 이름입니다.
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리의 ID입니다(분산 쿼리 실행 시 사용).
* `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 상위 쿼리의 실행이 시작된 IP 주소입니다.
* `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 부모 쿼리를 실행하는 데 사용된 클라이언트 포트입니다.
* `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 초기 쿼리 시작 시각(분산 쿼리 실행 시).
* `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 분산 쿼리 실행 시 사용되는 초기 쿼리 시작 시간으로, 마이크로초 단위의 정밀도를 가집니다.
* `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 쿼리를 시작한 인터페이스입니다. 가능한 값은 다음과 같습니다.
  * 1 — TCP.
  * 2 — HTTP.
* `os_user` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md)를 실행하는 운영 체제 사용자 계정 이름.
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트가 실행되는 클라이언트 머신의 호스트명입니다.
* `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 이름입니다.
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 리비전 번호입니다.
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 메이저 버전 번호입니다.
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 마이너 버전입니다.
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트 버전의 패치(patch) 구성 요소입니다.
* `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md)를 사용할 때, 여러 개의 쿼리를 포함하는 스크립트에서 각 쿼리의 번호입니다.
* `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md)에서 여러 개의 쿼리가 포함된 스크립트에서 해당 쿼리가 시작되는 줄 번호입니다.
* `http_method` (UInt8) — 쿼리를 시작한 HTTP 메서드입니다. 가능한 값은 다음과 같습니다:
  * 0 — 쿼리가 TCP 인터페이스를 통해 실행되었습니다.
  * 1 — `GET` 메서드가 사용되었습니다.
  * 2 — `POST` 메서드가 사용되었습니다.
* `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP 쿼리에서 전달되는 HTTP 헤더 `UserAgent` 값입니다.
* `http_referer` ([String](../../sql-reference/data-types/string.md)) — HTTP 쿼리에 포함되어 전달되는 HTTP 헤더 `Referer`(쿼리를 수행하는 페이지의 전체 또는 일부 주소를 포함합니다).
* `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — HTTP 쿼리로 전달된 `X-Forwarded-For` HTTP 헤더입니다.
* `quota_key` ([String](../../sql-reference/data-types/string.md)) — [quotas](../../operations/quotas.md) 설정에서 지정하는 `quota key`입니다 (`keyed` 참조).
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 리비전 번호입니다.
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 다양한 메트릭을 계측하는 ProfileEvents입니다. 각 이벤트에 대한 설명은 [system.events](/operations/system-tables/events) 테이블에서 확인할 수 있습니다.
* `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 클라이언트가 쿼리를 실행할 때 변경된 Settings입니다. 설정 변경 사항 로깅을 활성화하려면 `log_query_settings` 매개변수를 1로 설정합니다.
* `log_comment` ([String](../../sql-reference/data-types/string.md)) — 로그 주석입니다. [max&#95;query&#95;size](../../operations/settings/settings.md#max_query_size)을 초과하지 않는 임의의 문자열로 설정할 수 있습니다. 설정되지 않은 경우 빈 문자열입니다.
* `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 쿼리 실행에 참여하는 스레드 ID입니다. 이 스레드들이 반드시 동시에 실행된 것은 아닙니다.
* `peak_threads_usage` ([UInt64)](../../sql-reference/data-types/int-uint.md)) — 동시에 쿼리를 실행한 스레드의 최대 개수입니다.
* `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중에 사용된 `aggregate functions`의 정규화된 이름입니다.
* `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `aggregate functions combinators`의 표준 이름을 나타냅니다.
* `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중에 사용된 `database engines`(데이터베이스 엔진)의 표준 이름입니다.
* `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중에 사용된 `data type families`의 정규화된 이름입니다.
* `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중에 사용된 `dictionaries`의 표준 이름(canonical name)입니다. XML 파일로 구성된 딕셔너리인 경우 이 값은 딕셔너리 이름이며, SQL 문으로 생성된 딕셔너리인 경우 표준 이름은 완전 수식 객체 이름(fully qualified object name)입니다.
* `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중에 사용된 `formats`의 캐노니컬 이름을 나타냅니다.
* `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중 사용된 `functions`의 정규화된 이름 목록입니다.
* `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중에 사용된 `storages`의 정규화된 이름입니다.
* `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중에 사용된 `table functions`의 정식 이름입니다.
* `used_executable_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중에 사용된 `executable user defined functions`의 정식 이름입니다.
* `used_sql_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 쿼리 실행 중에 사용된 `sql user defined functions`의 정규화된 이름입니다.
* `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - 쿼리 실행 중 성공적으로 검증된 권한입니다.
* `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - 쿼리 실행 중에 부족한 권한 목록입니다.
* `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — 쿼리 실행 중 [쿼리 캐시](../query-cache.md) 사용 방식을 나타냅니다. 값:
  * `'Unknown'` = 알 수 없는 상태입니다.
  * `'None'` = 쿼리 결과가 쿼리 캐시에 기록되지도 읽히지도 않았습니다.
  * `'Write'` = 쿼리 결과가 쿼리 캐시에 기록되었습니다.
  * `'Read'` = 쿼리 결과가 쿼리 캐시에서 읽혔습니다.

## 예제 \{#examples\}

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

**Cloud 예시**

ClickHouse Cloud에서는 `system.query_log`가 각 노드에 로컬로 존재하므로, 모든 항목을 확인하려면 [`clusterAllReplicas`](/sql-reference/table-functions/cluster)를 통해 쿼리해야 합니다.

예를 들어, &quot;default&quot; 클러스터의 모든 레플리카에서 `query_log` 행을 집계하려면 다음과 같이 작성할 수 있습니다:

```sql
SELECT * 
FROM clusterAllReplicas('default', system.query_log)
WHERE event_time >= now() - toIntervalHour(1)
LIMIT 10
SETTINGS skip_unavailable_shards = 1;
```

**관련 문서**

* [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) — 이 테이블에는 각 쿼리 실행 스레드에 대한 정보가 포함되어 있습니다.
