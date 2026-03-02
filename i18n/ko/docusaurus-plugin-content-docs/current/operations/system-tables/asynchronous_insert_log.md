---
description: '비동기 삽입에 관한 정보를 포함하는 시스템 테이블입니다. 각 항목은 비동기 삽입 쿼리로 버퍼링된 삽입 쿼리를 나타냅니다.'
keywords: ['system table', 'asynchronous_insert_log']
slug: /operations/system-tables/asynchronous_insert_log
title: 'system.asynchronous_insert_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.asynchronous_insert_log \{#systemasynchronous_insert_log\}

<SystemTableCloud />

비동기 insert에 대한 정보를 포함합니다. 각 항목은 비동기 insert 쿼리로 버퍼링된 insert 쿼리를 나타냅니다.

로그 작성을 시작하려면 [asynchronous&#95;insert&#95;log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) 섹션의 매개변수를 구성합니다.

데이터 플러시 주기는 [asynchronous&#95;insert&#95;log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) 서버 설정 섹션의 `flush_interval_milliseconds` 매개변수로 설정합니다. 플러시를 강제로 수행하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용합니다.

ClickHouse는 이 테이블에서 데이터를 자동으로 삭제하지 않습니다. 자세한 내용은 [Introduction](/operations/system-tables/overview#system-tables-introduction)을 참고하십시오.

컬럼:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름입니다.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 비동기 insert가 발생한 날짜입니다.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 비동기 insert 실행이 완료된 날짜와 시간입니다.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 비동기 insert 실행이 완료된 날짜와 시간(마이크로초 정밀도)입니다.
* `query` ([String](../../sql-reference/data-types/string.md)) — 쿼리 문자열입니다.
* `database` ([String](../../sql-reference/data-types/string.md)) — 테이블이 속한 데이터베이스 이름입니다.
* `table` ([String](../../sql-reference/data-types/string.md)) — 테이블 이름입니다.
* `format` ([String](/sql-reference/data-types/string.md)) — 포맷(format) 이름입니다.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 최초 쿼리의 ID입니다.
* `bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 삽입된 바이트 수입니다.
* `exception` ([String](../../sql-reference/data-types/string.md)) — 예외 메시지입니다.
* `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 뷰 상태입니다. 값은 다음과 같습니다.
  * `'Ok' = 1` — insert가 성공했습니다.
  * `'ParsingError' = 2` — 데이터를 파싱하는 동안 발생한 예외입니다.
  * `'FlushError' = 3` — 데이터를 플러시하는 동안 발생한 예외입니다.
* `flush_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 플러시가 발생한 날짜와 시간입니다.
* `flush_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 플러시가 발생한 날짜와 시간(마이크로초 정밀도)입니다.
* `flush_query_id` ([String](../../sql-reference/data-types/string.md)) — 플러시 쿼리의 ID입니다.

**예시**

쿼리:

```sql
SELECT * FROM system.asynchronous_insert_log LIMIT 1 \G;
```

결과:

```text
hostname:                clickhouse.eu-central1.internal
event_date:              2023-06-08
event_time:              2023-06-08 10:08:53
event_time_microseconds: 2023-06-08 10:08:53.199516
query:                   INSERT INTO public.data_guess (user_id, datasource_id, timestamp, path, type, num, str) FORMAT CSV
database:                public
table:                   data_guess
format:                  CSV
query_id:                b46cd4c4-0269-4d0b-99f5-d27668c6102e
bytes:                   133223
exception:
status:                  Ok
flush_time:              2023-06-08 10:08:55
flush_time_microseconds: 2023-06-08 10:08:55.139676
flush_query_id:          cd2c1e43-83f5-49dc-92e4-2fbc7f8d3716
```

**관련 항목**

* [system.query&#95;log](../../operations/system-tables/query_log) — 쿼리 실행에 대한 일반 정보를 포함하는 `query_log` 시스템 테이블에 대한 설명입니다.
* [system.asynchronous&#95;inserts](/operations/system-tables/asynchronous_inserts) — 큐에 대기 중인 비동기 insert 작업에 대한 정보를 포함하는 테이블입니다.
