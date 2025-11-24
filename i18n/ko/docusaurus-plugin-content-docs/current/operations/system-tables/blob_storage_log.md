---
'description': '시스템 테이블로, 업로드 및 삭제와 같은 다양한 blob 스토리지 작업에 대한 정보를 포함하는 로그 항목을 포함합니다.'
'keywords':
- 'system table'
- 'blob_storage_log'
'slug': '/operations/system-tables/blob_storage_log'
'title': 'system.blob_storage_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

다양한 블롭 저장소 작업(업로드 및 삭제 등)에 대한 정보가 포함된 로깅 항목을 포함합니다.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시간.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도의 이벤트 시간.
- `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 이벤트 유형. 가능한 값:
  - `'Upload'`
  - `'Delete'`
  - `'MultiPartUploadCreate'`
  - `'MultiPartUploadWrite'`
  - `'MultiPartUploadComplete'`
  - `'MultiPartUploadAbort'`
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 이벤트와 관련된 쿼리 식별자, 있는 경우.
- `thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 작업을 수행하는 스레드의 식별자.
- `thread_name` ([String](../../sql-reference/data-types/string.md)) — 작업을 수행하는 스레드의 이름.
- `disk_name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 연관된 디스크의 이름.
- `bucket` ([String](../../sql-reference/data-types/string.md)) — 버킷의 이름.
- `remote_path` ([String](../../sql-reference/data-types/string.md)) — 원격 리소스의 경로.
- `local_path` ([String](../../sql-reference/data-types/string.md)) — 원격 리소스를 참조하는 로컬 시스템의 메타데이터 파일 경로.
- `data_size` ([UInt32](/sql-reference/data-types/int-uint#integer-ranges)) — 업로드 이벤트에 관련된 데이터 크기.
- `error` ([String](../../sql-reference/data-types/string.md)) — 이벤트와 관련된 오류 메시지, 있는 경우.

**예시**

블롭 저장소 작업이 파일을 업로드하고 이벤트가 로깅된다고 가정해 보십시오:

```sql
SELECT * FROM system.blob_storage_log WHERE query_id = '7afe0450-504d-4e4b-9a80-cd9826047972' ORDER BY event_date, event_time_microseconds \G
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-10-31
event_time:              2023-10-31 16:03:40
event_time_microseconds: 2023-10-31 16:03:40.481437
event_type:              Upload
query_id:                7afe0450-504d-4e4b-9a80-cd9826047972
thread_id:               2381740
disk_name:               disk_s3
bucket:                  bucket1
remote_path:             rrr/kxo/tbnqtrghgtnxkzgtcrlutwuslgawe
local_path:              store/654/6549e8b3-d753-4447-8047-d462df6e6dbe/tmp_insert_all_1_1_0/checksums.txt
data_size:               259
error:
```

이 예에서 업로드 작업은 ID가 `7afe0450-504d-4e4b-9a80-cd9826047972`인 `INSERT` 쿼리와 관련이 있습니다. 로컬 메타데이터 파일 `store/654/6549e8b3-d753-4447-8047-d462df6e6dbe/tmp_insert_all_1_1_0/checksums.txt`는 디스크 `disk_s3`의 버킷 `bucket1`에서 원격 경로 `rrr/kxo/tbnqtrghgtnxkzgtcrlutwuslgawe`를 참조하며, 크기는 259바이트입니다.

**참고**

- [데이터 저장을 위한 외부 디스크](../../operations/storing-data.md)
