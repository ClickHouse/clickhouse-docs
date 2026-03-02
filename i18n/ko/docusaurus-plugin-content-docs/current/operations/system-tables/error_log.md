---
description: '`system.errors` 테이블의 오류 값 이력을 포함하며, 주기적으로 디스크로 플러시되는 시스템 테이블입니다.'
keywords: ['시스템 테이블', 'error_log']
slug: /operations/system-tables/system-error-log
title: 'system.error_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud />

`system.errors` 테이블의 에러 값 이력을 포함하며, 주기적으로 디스크에 플러시됩니다.

컬럼:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시각.
* `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 에러 코드 번호.
* `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - 에러 이름.
* `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 해당 에러가 발생한 횟수.
* `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 원격 예외(예: 분산 쿼리 중 하나를 실행하는 동안 수신된 예외).
* `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md))  — 마지막 에러가 발생한 시각.
* `last_error_message` ([String](../../sql-reference/data-types/string.md)) — 마지막 에러에 대한 메시지.
* `last_error_query_id` ([String](../../sql-reference/data-types/string.md)) — 마지막 에러를 발생시킨 쿼리의 ID(사용 가능한 경우).
* `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 호출된 메서드가 저장된 물리적 주소 목록을 나타내는 스택 트레이스.

**예제**

```sql
SELECT * FROM system.error_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:            clickhouse.testing.internal
event_date:          2025-11-11
event_time:          2025-11-11 11:35:28
code:                60
error:               UNKNOWN_TABLE
value:               1
remote:              0
last_error_time:     2025-11-11 11:35:28
last_error_message:  Unknown table expression identifier 'system.table_not_exist' in scope SELECT * FROM system.table_not_exist
last_error_query_id: 77ad9ece-3db7-4236-9b5a-f789bce4aa2e
last_error_trace:    [100506790044914,100506534488542,100506409937998,100506409936517,100506425182891,100506618154123,100506617994473,100506617990486,100506617988112,100506618341386,100506630272160,100506630266232,100506630276900,100506629795243,100506633519500,100506633495783,100506692143858,100506692248921,100506790779783,100506790781278,100506790390399,100506790380047,123814948752036,123814949330028]
```

**함께 보기**

* [error&#95;log setting](../../operations/server-configuration-parameters/settings.md#error_log) — 이 SETTING을 활성화하거나 비활성화하는 방법입니다.
* [system.errors](../../operations/system-tables/errors.md) — 오류 코드와 각 오류가 발생한 횟수를 포함합니다.
* [Monitoring](../../operations/monitoring.md) — ClickHouse 모니터링의 기본 개념입니다.
