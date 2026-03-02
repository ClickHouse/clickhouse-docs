---
description: '백그라운드 스케줄 풀(background schedule pool)의 작업 정보가 포함된 system 테이블입니다.'
keywords: ['system 테이블', 'background_schedule_pool']
slug: /operations/system-tables/background_schedule_pool
title: 'system.background_schedule_pool'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.background_schedule_pool \{#systembackground_schedule_pool\}

<SystemTableCloud />

백그라운드 스케줄 풀에 있는 작업에 대한 정보를 포함합니다. 백그라운드 스케줄 풀은 분산 전송, 버퍼 플러시, 메시지 브로커 작업과 같은 주기적인 작업을 실행하는 데 사용됩니다.

컬럼:

* `pool` ([String](../../sql-reference/data-types/string.md)) — 풀 이름. 가능한 값은 다음과 같습니다.
  * `schedule` — 범용 스케줄 풀
  * `buffer_flush` — Buffer 테이블 데이터를 플러시하는 풀
  * `distributed` — 분산 테이블 작업을 위한 풀
  * `message_broker` — 메시지 브로커 작업을 위한 풀
* `database` ([String](../../sql-reference/data-types/string.md)) — 데이터베이스 이름.
* `table` ([String](../../sql-reference/data-types/string.md)) — 테이블 이름.
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 테이블 UUID.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 쿼리 ID(현재 실행 중인 경우). (이는 `system.text_log`에서 로그를 매칭하기 위한 무작위로 생성된 ID일 뿐 실제 쿼리는 아님에 유의하십시오.)
* `elapsed_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 작업 실행 시간(현재 실행 중인 경우).
* `log_name` ([String](../../sql-reference/data-types/string.md)) — 작업의 로그 이름.
* `deactivated` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 작업이 비활성화되었는지 여부(비활성화된 작업은 풀에서 제거되므로 항상 false).
* `scheduled` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 작업이 실행되도록 스케줄되었는지 여부.
* `delayed` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 작업이 지연되어 스케줄되었는지 여부.
* `executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 작업이 현재 실행 중인지 여부.

**예시**

```sql
SELECT * FROM system.background_schedule_pool LIMIT 5 FORMAT Vertical;
```

```text
Row 1:
──────
pool:        distributed
database:    default
table:       data
table_uuid:  00000000-0000-0000-0000-000000000000
query_id:
elapsed_ms:  0
log_name:    BackgroundJobsAssignee:DataProcessing
deactivated: 0
scheduled:   1
delayed:     0
executing:   0
```

**관련 항목**

* [system.background&#95;schedule&#95;pool&#95;log](background_schedule_pool_log.md) — 백그라운드 스케줄 풀 작업 실행 이력이 저장됩니다.
