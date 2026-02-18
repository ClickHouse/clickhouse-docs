---
description: '쿼리를 실행하는 스레드에 대한 정보를 포함하는 system 테이블로, 예를 들어 스레드 이름, 스레드 시작 시간, 쿼리 처리 시간 등을 제공합니다.'
keywords: ['system table', 'query_thread_log']
slug: /operations/system-tables/query_thread_log
title: 'system.query_thread_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.query_thread_log \{#systemquery_thread_log\}

<SystemTableCloud />

쿼리를 실행하는 스레드에 대한 정보(예: 스레드 이름, 스레드 시작 시간, 쿼리 처리 시간)를 포함합니다.

로깅을 시작하려면:

1. [query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) 섹션에서 파라미터를 설정합니다.
2. [log&#95;query&#95;threads](/operations/settings/settings#log_query_threads)를 1로 설정합니다.

데이터 플러시 주기는 [query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) 서버 설정 섹션의 `flush_interval_milliseconds` 파라미터로 설정합니다. 강제로 플러시하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용합니다.

ClickHouse는 테이블에서 데이터를 자동으로 삭제하지 않습니다. 자세한 내용은 [Introduction](/operations/system-tables/overview#system-tables-introduction)을 참조하십시오.

`query_thread_log` 테이블에 기록되는 쿼리 수를 줄이려면 [log&#95;queries&#95;probability](/operations/settings/settings#log_queries_probability) 설정을 사용할 수 있습니다.

컬럼:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름입니다.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 스레드가 쿼리의 실행을 완료한 날짜입니다.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 스레드가 쿼리 실행을 마친 시점의 날짜와 시간입니다.
* `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — 스레드가 쿼리 실행을 완료한 날짜와 시간(마이크로초까지의 정밀도)입니다.
* `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 쿼리 실행 시작 시간입니다.
* `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 단위 정밀도로 쿼리 실행이 시작된 시각입니다.
* `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리 실행 소요 시간입니다.
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 읽은 행의 수입니다.
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 읽은 바이트 수입니다.
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` 쿼리에서는 기록된 행 수입니다. 다른 쿼리에서는 이 컬럼 값이 0입니다.
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` 쿼리의 경우 기록된 바이트 수입니다. 다른 쿼리의 경우 컬럼 값은 0입니다.
* `memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 스레드의 컨텍스트에서 할당된 메모리와 해제된 메모리 양의 차이입니다.
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 스레드 컨텍스트 내에서 할당된 메모리와 해제된 메모리의 양 사이의 차이 중 최대값입니다.
* `thread_name` ([String](../../sql-reference/data-types/string.md)) — 스레드의 이름입니다.
* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — OS 스레드 ID입니다.
* `master_thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 초기 스레드의 운영 체제(OS) 상의 최초 ID입니다.
* `query` ([String](../../sql-reference/data-types/string.md)) — 쿼리 문자열.
* `is_initial_query` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리 유형을 나타냅니다. 가능한 값은 다음과 같습니다.
  * 1 — 클라이언트가 쿼리를 시작한 경우.
  * 0 — 분산 쿼리 실행을 위해 다른 쿼리가 시작한 경우.
* `connection_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 연결이 이루어진 클라이언트 IP 주소입니다. 프록시를 통해 연결된 경우 프록시의 IP 주소가 됩니다.
* `connection_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 연결이 이루어진 클라이언트 포트입니다. 프록시를 통해 연결된 경우 프록시의 포트가 됩니다.
* `user` ([String](../../sql-reference/data-types/string.md)) — 현재 쿼리를 실행한 사용자의 이름입니다.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 쿼리 ID입니다.
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 쿼리를 수행하는 데 사용된 IP 주소입니다. 프록시를 통해 연결하고 [auth&#95;use&#95;forwarded&#95;address](/operations/server-configuration-parameters/settings#auth_use_forwarded_address)가 설정되어 있으면, 이 값은 프록시가 아닌 클라이언트의 IP 주소가 됩니다.
* `port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리를 수행할 때 사용된 클라이언트 포트 번호입니다. 프록시를 통해 연결하고 [auth&#95;use&#95;forwarded&#95;address](/operations/server-configuration-parameters/settings#auth_use_forwarded_address)가 설정되어 있는 경우, 이 값은 프록시가 아니라 클라이언트의 포트가 됩니다.
* `initial_user` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리(분산 쿼리 실행)의 실행 사용자 이름입니다.
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리의 ID(분산 쿼리 실행 시 사용).
* `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 상위 쿼리가 발행된 IP 주소입니다.
* `initial_port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — 부모 쿼리를 실행하는 데 사용된 클라이언트 포트입니다.
* `interface` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리가 실행된 인터페이스입니다. 가능한 값은 다음과 같습니다:
  * 1 — TCP.
  * 2 — HTTP.
* `os_user` ([String](../../sql-reference/data-types/string.md)) — OS에서 [clickhouse-client](../../interfaces/cli.md)를 실행한 사용자 이름입니다.
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트가 실행되는 클라이언트 머신의 호스트명입니다.
* `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 이름입니다.
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 버전입니다.
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 주 버전입니다.
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트의 마이너 버전 번호입니다.
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 또는 다른 TCP 클라이언트 버전의 패치 버전 구성 요소입니다.
* `http_method` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 쿼리를 실행한 HTTP 메서드입니다. 가능한 값은 다음과 같습니다.
  * 0 — 쿼리가 TCP 인터페이스를 통해 실행되었습니다.
  * 1 — `GET` 메서드가 사용되었습니다.
  * 2 — `POST` 메서드가 사용되었습니다.
* `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP 요청에 포함된 `UserAgent` 헤더입니다.
* `quota_key` ([String](../../sql-reference/data-types/string.md)) — [quotas](../../operations/quotas.md) 설정에서 지정하는 「quota key」 값입니다 (`keyed` 참조).
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 리비전 번호입니다.
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — 이 스레드의 다양한 메트릭을 측정하는 `ProfileEvents`입니다. 이에 대한 자세한 설명은 [system.events](/operations/system-tables/events) 테이블에서 확인할 수 있습니다.

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

**참고 항목**

* [system.query&#95;log](/operations/system-tables/query_log) — 쿼리 실행에 대한 일반적인 정보를 포함하는 `query_log` 시스템 테이블에 대한 설명입니다.
* [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) — 이 테이블에는 쿼리 실행 중에 실행된 각 VIEW에 대한 정보가 포함됩니다.
