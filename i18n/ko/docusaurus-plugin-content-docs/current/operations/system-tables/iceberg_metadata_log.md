---
description: 'Iceberg 테이블에서 읽은 메타데이터 파일 정보를 포함하는 시스템 테이블입니다. 각 항목은 루트 메타데이터 파일, Avro 파일에서 추출된 메타데이터, 또는 Avro 파일 내의 항목을 나타냅니다.'
keywords: ['시스템 테이블', 'iceberg_metadata_log']
slug: /operations/system-tables/iceberg_metadata_log
title: 'system.iceberg_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.iceberg_metadata_log \{#systemiceberg_metadata_log\}

`system.iceberg_metadata_log` 테이블은 ClickHouse가 Iceberg 테이블을 읽는 과정에서 발생하는 메타데이터 접근 및 파싱 이벤트를 기록합니다. 이 테이블은 처리된 각 메타데이터 파일 또는 항목에 대한 자세한 정보를 제공하며, 디버깅, 감사, Iceberg 테이블 구조의 진화 과정을 이해하는 데 유용합니다.

## Purpose \{#purpose\}

이 테이블은 Iceberg 테이블에서 읽은 모든 메타데이터 파일과 항목을 기록합니다. 루트 메타데이터 파일, 매니페스트 목록, 매니페스트 항목을 모두 포함하며, ClickHouse가 Iceberg 테이블 메타데이터를 어떻게 해석하는지 추적하고 스키마 진화, 파일 해석(file resolution), 쿼리 플래닝(query planning)과 관련된 문제를 진단하는 데 도움이 됩니다.

:::note
이 테이블은 주로 디버깅을 위한 용도로 사용됩니다.
:::

## Columns \{#columns\}

| Name           | Type      | Description                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | 로그 엔트리의 날짜입니다.                                                                       |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | 이벤트의 타임스탬프입니다.                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | 메타데이터 읽기를 발생시킨 쿼리 ID입니다.                                                   |
| `content_type` | [Enum8](../../sql-reference/data-types/enum.md)     | 메타데이터 콘텐츠 유형입니다(아래 참조).                                                        |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Iceberg 테이블의 경로입니다.                                                                   |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | 루트 메타데이터 JSON 파일, Avro 매니페스트 목록 또는 매니페스트 파일의 경로입니다.                   |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 형식의 콘텐츠입니다(.json 원시 메타데이터, Avro 메타데이터 또는 Avro 엔트리).              |
| `row_in_file`  | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | 해당되는 경우 파일 내 행 번호입니다. `ManifestListEntry` 및 `ManifestFileEntry` 콘텐츠 유형에 대해 기록됩니다. |
| `pruning_status`  | [Nullable](../../sql-reference/data-types/nullable.md)([Enum8](../../sql-reference/data-types/enum.md)) | 엔트리에 대한 프루닝 상태입니다. 'NotPruned', 'PartitionPruned', 'MinMaxIndexPruned' 값을 가집니다. 파티션 프루닝은 minmax 프루닝보다 먼저 수행되므로, 'PartitionPruned'는 엔트리가 파티션 필터에 의해 프루닝되었고 minmax 프루닝은 시도되지 않았음을 의미합니다. `ManifestFileEntry` 콘텐츠 유형에 대해 기록됩니다. |

## `content_type` 값 \{#content-type-values\}

- `None`: 내용 없음.
- `Metadata`: 루트 메타데이터 파일.
- `ManifestListMetadata`: 매니페스트 목록 메타데이터.
- `ManifestListEntry`: 매니페스트 목록의 항목.
- `ManifestFileMetadata`: 매니페스트 파일 메타데이터.
- `ManifestFileEntry`: 매니페스트 파일의 항목.

<SystemTableCloud/>

## 로그 상세 수준 제어 \{#controlling-log-verbosity\}

[`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 설정을 사용하여 어떤 메타데이터 이벤트를 기록할지 제어할 수 있습니다.

현재 쿼리에서 사용되는 모든 메타데이터를 기록하려면:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

현재 쿼리에서 사용된 루트 메타데이터 JSON 파일만 로그에 기록하려면:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

[`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 설정 설명에서 자세한 내용을 확인하십시오.


### 알아두면 좋은 점 \{#good-to-know\}

- Iceberg 테이블을 세부적으로 조사해야 하는 경우에만 쿼리 수준에서 `iceberg_metadata_log_level`을 사용하십시오. 그렇지 않으면 로그 테이블에 메타데이터가 과도하게 누적되어 성능 저하가 발생할 수 있습니다.
- 이 테이블은 주로 디버깅을 위한 것으로, 개체별 고유성이 보장되지 않기 때문에 중복된 항목이 포함될 수 있습니다. 프로그램에서 서로 다른 시점에 수집되므로, 내용과 프루닝(pruning) 상태는 별도의 행에 저장됩니다. 내용은 메타데이터를 읽을 때 수집되고, 프루닝 상태는 메타데이터가 프루닝 대상인지 확인할 때 수집됩니다. **중복 제거를 위해 이 테이블 자체에 의존해서는 안 됩니다.**
- `ManifestListMetadata`보다 더 상세한 `content_type`을 사용하는 경우, manifest 목록에 대해 Iceberg 메타데이터 캐시가 비활성화됩니다.
- 마찬가지로 `ManifestFileMetadata`보다 더 상세한 `content_type`을 사용하는 경우, manifest 파일에 대해 Iceberg 메타데이터 캐시가 비활성화됩니다.
- SELECT 쿼리가 취소되었거나 실패한 경우, 실패 전까지 처리된 메타데이터에 대한 항목은 로그 테이블에 남아 있을 수 있지만, 처리되지 않은 메타데이터 개체에 대한 정보는 포함되지 않습니다.

## 같이 보기 \{#see-also\}

- [Iceberg 테이블 엔진](../../engines/table-engines/integrations/iceberg.md)
- [Iceberg 테이블 FUNCTION](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)