---
description: 'Delta Lake 테이블에서 읽은 메타데이터 파일 정보를 포함하는 시스템 테이블입니다. 각 항목은 하나의 루트 메타데이터 JSON 파일을 나타냅니다.'
keywords: ['시스템 테이블', 'delta_lake_metadata_log']
slug: /operations/system-tables/delta_lake_metadata_log
title: 'system.delta_lake_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.delta_lake_metadata_log \{#systemdelta_lake_metadata_log\}

`system.delta_lake_metadata_log` 테이블은 ClickHouse가 읽은 Delta Lake 테이블의 메타데이터 접근 및 파싱 이벤트를 기록합니다. 이 테이블은 각 메타데이터 파일에 대한 상세 정보를 제공하여 디버깅, 감사, Delta 테이블 구조 변화 추이를 파악하는 데 유용합니다.



## 목적 \{#purpose\}

이 테이블은 Delta Lake 테이블에서 읽은 모든 메타데이터 파일을 기록합니다. 이를 통해 ClickHouse가 Delta 테이블 메타데이터를 어떻게 해석하는지 추적하고, 스키마 진화, 스냅샷 결정, 쿼리 플랜 수립과 관련된 문제를 진단하는 데 도움이 됩니다.

:::note
이 테이블은 주로 디버깅 용도로 제공됩니다.
:::



## 컬럼 \{#columns\}
| 이름           | 유형      | 설명                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | 로그 파일의 날짜입니다.                                                                       |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | 이벤트의 타임스탬프입니다.                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | 메타데이터 읽기를 트리거한 쿼리 ID입니다.                                                   |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Delta Lake 테이블의 경로입니다.                                                                |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | 루트 메타데이터 JSON 파일의 경로입니다.             |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 형식의 콘텐츠입니다(.json의 원시 메타데이터).       |

<SystemTableCloud/>



## 로그 상세 수준 제어 \{#controlling-log-verbosity\}

[`delta_lake_log_metadata`](../../operations/settings/settings.md#delta_lake_log_metadata) SETTING을 사용하여 어떤 메타데이터 이벤트를 기록할지 제어할 수 있습니다.

현재 쿼리에서 사용되는 모든 메타데이터를 로그로 기록하려면:

```sql
SELECT * FROM my_delta_table SETTINGS delta_lake_log_metadata = 1;

SYSTEM FLUSH LOGS delta_lake_metadata_log;

SELECT *
FROM system.delta_lake_metadata_log
WHERE query_id = '{previous_query_id}';
```
