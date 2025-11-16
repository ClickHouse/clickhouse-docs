---
'description': '시스템 테이블로, 테이블 `system.errors`에서 오류 값의 이력을 포함하며, 주기적으로 디스크에 플러시됩니다.'
'keywords':
- 'system table'
- 'error_log'
'slug': '/operations/system-tables/system-error-log'
'title': 'system.error_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

`system.errors` 테이블에서 오류 값의 기록을 포함하며, 주기적으로 디스크에 플러시됩니다.

컬럼:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트명.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시간.
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 오류의 코드 번호.
- `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - 오류의 이름.
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 이 오류가 발생한 횟수.
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 원격 예외 (즉, 분산 쿼리 중에 수신됨).

**예제**

```sql
SELECT * FROM system.error_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2024-06-18
event_time: 2024-06-18 07:32:39
code:       999
error:      KEEPER_EXCEPTION
value:      2
remote:     0
```

**참고**

- [error_log 설정](../../operations/server-configuration-parameters/settings.md#error_log) — 설정을 활성화 및 비활성화합니다.
- [system.errors](../../operations/system-tables/errors.md) — 발생한 횟수와 함께 오류 코드를 포함합니다.
- [모니터링](../../operations/monitoring.md) — ClickHouse 모니터링의 기본 개념.
