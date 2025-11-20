---
'description': '시스템 테이블은 Delta Lake 테이블에서 읽은 메타데이터 파일에 대한 정보를 포함합니다. 각 항목은 루트 메타데이터
  JSON 파일을 나타냅니다.'
'keywords':
- 'system table'
- 'delta_lake_metadata_log'
'slug': '/operations/system-tables/delta_lake_metadata_log'
'title': 'system.delta_lake_metadata_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.delta_lake_metadata_log

`system.delta_lake_metadata_log` 테이블은 ClickHouse에 의해 읽혀진 Delta Lake 테이블의 메타데이터 접근 및 파싱 이벤트를 기록합니다. 이 테이블은 각 메타데이터 파일에 대한 자세한 정보를 제공하며, 이는 디버깅, 감사, Delta 테이블 구조의 진화를 이해하는 데 유용합니다.

## Purpose {#purpose}

이 테이블은 Delta Lake 테이블에서 읽혀진 모든 메타데이터 파일을 기록합니다. 이를 통해 사용자는 ClickHouse가 Delta 테이블 메타데이터를 해석하는 방법을 추적하고, 스키마 진화, 스냅샷 해상도 또는 쿼리 계획과 관련된 문제를 진단하는 데 도움을 받을 수 있습니다.

:::note
이 테이블은 주로 디버깅 목적으로 의도됩니다.
:::

## Columns {#columns}
| Name           | Type      | Description                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | 로그 파일의 날짜입니다.                                                                       |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | 이벤트의 타임스탬프입니다.                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | 메타데이터 읽기를 트리거한 쿼리 ID입니다.                                                   |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Delta Lake 테이블의 경로입니다.                                                                |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | 루트 메타데이터 JSON 파일의 경로입니다.             |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 형식의 내용(원시 메타데이터 .json)입니다.       |

<SystemTableCloud/>

## Controlling log verbosity {#controlling-log-verbosity}

현재 쿼리에서 사용되는 메타데이터 이벤트를 기록하려면 [`delta_lake_log_metadata`](../../operations/settings/settings.md#delta_lake_log_metadata) 설정을 사용하여 제어할 수 있습니다.

모든 메타데이터를 기록하려면:

```sql
SELECT * FROM my_delta_table SETTINGS delta_lake_log_metadata = 1;

SYSTEM FLUSH LOGS delta_lake_metadata_log;

SELECT *
FROM system.delta_lake_metadata_log
WHERE query_id = '{previous_query_id}';
```
