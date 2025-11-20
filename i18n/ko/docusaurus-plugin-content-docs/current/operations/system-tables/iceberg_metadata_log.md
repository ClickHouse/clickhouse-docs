---
'description': '시스템 테이블로, Iceberg 테이블에서 읽어온 메타데이터 파일에 대한 정보를 포함합니다. 각 항목은 루트 메타데이터
  파일, Avro 파일에서 추출된 메타데이터, 또는 일부 Avro 파일의 항목을 나타냅니다.'
'keywords':
- 'system table'
- 'iceberg_metadata_log'
'slug': '/operations/system-tables/iceberg_metadata_log'
'title': 'system.iceberg_metadata_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.iceberg_metadata_log

`system.iceberg_metadata_log` 테이블은 ClickHouse가 읽는 Iceberg 테이블의 메타데이터 접근 및 파싱 이벤트를 기록합니다. 처리된 각 메타데이터 파일 또는 항목에 대한 상세 정보를 제공하며, 디버깅, 감사 및 Iceberg 테이블 구조의 변화를 이해하는 데 유용합니다.

## Purpose {#purpose}

이 테이블은 Iceberg 테이블에서 읽은 모든 메타데이터 파일과 항목을 기록하며, 루트 메타데이터 파일, 매니페스트 목록 및 매니페스트 항목을 포함합니다. 사용자가 ClickHouse가 Iceberg 테이블 메타데이터를 어떻게 해석하는지를 추적하고 스키마 변화, 파일 해상도 또는 쿼리 계획과 관련된 문제를 진단하는 데 도움을 줍니다.

:::note
이 테이블은 주로 디버깅 목적으로 사용됩니다.
:::

## Columns {#columns}

| Name           | Type      | Description                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | 로그 항목의 날짜입니다.                                                                       |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | 이벤트의 타임스탬프입니다.                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | 메타데이터 읽기를 트리거한 쿼리 ID입니다.                                                   |
| `content_type` | [Enum8](../../sql-reference/data-types/enum.md)     | 메타데이터 내용의 유형입니다 (아래 참조).                                                        |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Iceberg 테이블의 경로입니다.                                                                   |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | 루트 메타데이터 JSON 파일, Avro 매니페스트 목록 또는 매니페스트 파일의 경로입니다.                   |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 형식의 내용입니다 (원시 메타데이터 .json, Avro 메타데이터 또는 Avro 항목).              |
| `row_in_file`  | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | 파일 내의 행 번호입니다. 해당하는 경우에만 존재합니다. `ManifestListEntry` 및 `ManifestFileEntry` 내용 유형에 대해 존재합니다. |

## `content_type` 값들 {#content-type-values}

- `None`: 내용이 없음.
- `Metadata`: 루트 메타데이터 파일.
- `ManifestListMetadata`: 매니페스트 목록 메타데이터.
- `ManifestListEntry`: 매니페스트 목록의 항목.
- `ManifestFileMetadata`: 매니페스트 파일 메타데이터.
- `ManifestFileEntry`: 매니페스트 파일의 항목.

<SystemTableCloud/>

## 로그 상세도 제어 {#controlling-log-verbosity}

[`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 설정을 사용하여 기록할 메타데이터 이벤트를 제어할 수 있습니다.

현재 쿼리에 사용된 모든 메타데이터를 기록하려면:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

현재 쿼리에 사용된 루트 메타데이터 JSON 파일만 기록하려면:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

더 많은 정보는 [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 설정의 설명에서 확인하십시오.

### 알아두면 좋은 사항 {#good-to-know}

- Iceberg 테이블을 자세히 조사해야 할 때만 쿼리 수준에서 `iceberg_metadata_log_level`을 사용하십시오. 그렇지 않으면 로그 테이블에 과도한 메타데이터가 축적되어 성능 저하를 경험할 수 있습니다.
- 이 테이블은 주로 디버깅 용도로 사용되므로 중복 항목을 포함할 수 있으며, 엔티티별로 고유성을 보장하지 않습니다.
- `ManifestListMetadata`보다 더 상세한 `content_type`을 사용하면 매니페스트 목록에 대한 Iceberg 메타데이터 캐시가 비활성화됩니다.
- 마찬가지로, `ManifestFileMetadata`보다 더 상세한 `content_type`을 사용하면 매니페스트 파일에 대한 Iceberg 메타데이터 캐시가 비활성화됩니다.

## See also {#see-also}
- [Iceberg Table Engine](../../engines/table-engines/integrations/iceberg.md)
- [Iceberg Table Function](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)
