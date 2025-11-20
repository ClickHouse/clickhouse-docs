---
'description': '시스템 테이블로, 비동기 삽입에 대한 정보를 포함하고 있습니다. 각 항목은 비동기 삽입 쿼리에 버퍼링된 삽입 쿼리를 나타냅니다.'
'keywords':
- 'system table'
- 'asynchronous_insert_log'
'slug': '/operations/system-tables/asynchronous_insert_log'
'title': 'system.asynchronous_insert_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous_insert_log

<SystemTableCloud/>

비동기 삽입에 대한 정보를 포함합니다. 각 항목은 비동기 삽입 쿼리에 버퍼링된 삽입 쿼리를 나타냅니다.

로깅을 시작하려면 [asynchronous_insert_log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) 섹션에서 매개변수를 구성하십시오.

데이터 플러시 기간은 [asynchronous_insert_log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) 서버 설정 섹션의 `flush_interval_milliseconds` 매개변수로 설정됩니다. 플러시를 강제하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용하십시오.

ClickHouse는 테이블에서 데이터를 자동으로 삭제하지 않습니다. 자세한 내용은 [소개](/operations/system-tables/overview#system-tables-introduction)를 참조하십시오.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 비동기 삽입이 발생한 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 비동기 삽입이 실행을 마친 날짜와 시간.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도로 비동기 삽입이 실행을 마친 날짜와 시간.
- `query` ([String](../../sql-reference/data-types/string.md)) — 쿼리 문자열.
- `database` ([String](../../sql-reference/data-types/string.md)) — 테이블이 있는 데이터베이스의 이름.
- `table` ([String](../../sql-reference/data-types/string.md)) — 테이블 이름.
- `format` ([String](/sql-reference/data-types/string.md)) — 형식 이름.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리의 ID.
- `bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 삽입된 바이트 수.
- `exception` ([String](../../sql-reference/data-types/string.md)) — 예외 메시지.
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 뷰의 상태. 값:
  - `'Ok' = 1` — 성공적인 삽입.
  - `'ParsingError' = 2` — 데이터 구문 분석 시 발생한 예외.
  - `'FlushError' = 3` — 데이터 플러시 시 발생한 예외.
- `flush_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 플러시가 발생한 날짜와 시간.
- `flush_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도로 플러시가 발생한 날짜와 시간.
- `flush_query_id` ([String](../../sql-reference/data-types/string.md)) — 플러시 쿼리의 ID.

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

**참조**

- [system.query_log](../../operations/system-tables/query_log) — 쿼리 실행에 대한 일반 정보를 포함하는 `query_log` 시스템 테이블에 대한 설명.
- [system.asynchronous_inserts](/operations/system-tables/asynchronous_inserts) — 이 테이블은 대기 중인 비동기 삽입에 대한 정보를 포함합니다.
