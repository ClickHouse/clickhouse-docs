---
description: '백그라운드 스케줄 풀에서 실행된 작업의 이력을 담고 있는 시스템 테이블입니다.'
keywords: ['system table', 'background_schedule_pool_log']
slug: /operations/system-tables/background_schedule_pool_log
title: 'system.background_schedule_pool_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.background_schedule_pool_log \{#systembackground_schedule_pool_log\}

<SystemTableCloud />

`system.background_schedule_pool_log` 테이블은 [background&#95;schedule&#95;pool&#95;log](/operations/server-configuration-parameters/settings#background_schedule_pool_log) 서버 설정이 지정된 경우에만 생성됩니다.

이 테이블에는 백그라운드 스케줄 풀 태스크 실행 이력이 포함됩니다. 백그라운드 스케줄 풀은 분산 전송, 버퍼 플러시, 메시지 브로커 작업과 같은 주기적 작업을 실행하는 데 사용됩니다.

`system.background_schedule_pool_log` 테이블에는 다음 컬럼이 포함됩니다:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시간.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도의 이벤트 시간.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 백그라운드 작업과 연관된 쿼리의 식별자(실제 쿼리가 아니라 `system.text_log`에서 로그를 매칭하기 위해 무작위로 생성된 ID입니다).
* `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 데이터베이스 이름.
* `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 테이블 이름.
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 백그라운드 작업이 속한 테이블의 UUID.
* `log_name` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 백그라운드 작업 이름.
* `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 작업 실행 시간(밀리초 단위).
* `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 발생한 예외의 오류 코드.
* `exception` ([String](../../sql-reference/data-types/string.md)) — 발생한 오류의 텍스트 메시지.

`system.background_schedule_pool_log` 테이블은 첫 번째 백그라운드 작업이 실행된 후에 생성됩니다.

**예시**

```sql
SELECT * FROM system.background_schedule_pool_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2025-12-18
event_time:              2025-12-18 10:30:15
event_time_microseconds: 2025-12-18 10:30:15.123456
query_id:
database:                default
table:                   data
table_uuid:              00000000-0000-0000-0000-000000000000
log_name:                default.data
duration_ms:             42
error:                   0
exception:
```

**관련 항목**

* [system.background&#95;schedule&#95;pool](background_schedule_pool.md) — 백그라운드 스케줄 풀에 현재 예약되어 있는 작업에 대한 정보가 포함되어 있습니다.
