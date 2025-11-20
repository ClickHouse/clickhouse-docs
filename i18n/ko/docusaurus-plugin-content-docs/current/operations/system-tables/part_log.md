---
'description': '시스템 테이블로, MergeTree 계열 테이블에서 데이터 파트에 발생한 이벤트에 대한 정보를 포함하고 있습니다. 예를
  들어, 데이터 추가 또는 병합과 같은 이벤트입니다.'
'keywords':
- 'system table'
- 'part_log'
'slug': '/operations/system-tables/part_log'
'title': 'system.part_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.part_log

<SystemTableCloud/>

`system.part_log` 테이블은 [part_log](/operations/server-configuration-parameters/settings#part_log) 서버 설정이 지정된 경우에만 생성됩니다.

이 테이블은 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 계열 테이블의 [data parts](../../engines/table-engines/mergetree-family/custom-partitioning-key.md)와 관련하여 발생한 이벤트에 대한 정보를 포함합니다. 예를 들어 데이터를 추가하거나 병합하는 작업이 포함됩니다.

`system.part_log` 테이블은 다음과 같은 컬럼을 포함합니다:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 이 데이터 부분을 생성한 `INSERT` 쿼리의 식별자.
- `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 데이터 부분과 관련하여 발생한 이벤트의 유형. 다음 중 하나의 값을 가질 수 있습니다:
  - `NewPart` — 새 데이터 부분의 삽입.
  - `MergePartsStart` — 데이터 부분의 병합이 시작됨.
  - `MergeParts` — 데이터 부분의 병합이 완료됨.
  - `DownloadPart` — 데이터 부분 다운로드.
  - `RemovePart` — [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart)를 사용하여 데이터 부분을 제거하거나 분리.
  - `MutatePartStart` — 데이터 부분의 변형이 시작됨.
  - `MutatePart` — 데이터 부분의 변형이 완료됨.
  - `MovePart` — 한 디스크에서 다른 디스크로 데이터 부분 이동.
- `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` 유형의 이벤트에 대한 이유. 다음 중 하나의 값을 가질 수 있습니다:
  - `NotAMerge` — 현재 이벤트 유형이 `MERGE_PARTS`가 아님.
  - `RegularMerge` — 일반 병합.
  - `TTLDeleteMerge` — 만료된 데이터 정리.
  - `TTLRecompressMerge` — 데이터 부분의 재압축.
- `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` 유형 이벤트에 대한 병합 알고리즘. 다음 중 하나의 값을 가질 수 있습니다:
  - `Undecided`
  - `Horizontal`
  - `Vertical`
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시간.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도의 이벤트 시간.
- `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 지속 시간.
- `database` ([String](../../sql-reference/data-types/string.md)) — 데이터 부분이 포함된 데이터베이스의 이름.
- `table` ([String](../../sql-reference/data-types/string.md)) — 데이터 부분이 포함된 테이블의 이름.
- `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 데이터 부분이 속한 테이블의 UUID.
- `part_name` ([String](../../sql-reference/data-types/string.md)) — 데이터 부분의 이름.
- `partition_id` ([String](../../sql-reference/data-types/string.md)) — 데이터 부분이 삽입된 파티션의 ID. 파티셔닝이 `tuple()`에 의해 이루어지면 이 컬럼은 `all` 값을 가집니다.
- `partition` ([String](../../sql-reference/data-types/string.md)) — 파티션 이름.
- `part_type` ([String](../../sql-reference/data-types/string.md)) — 파트의 유형. 가능한 값: Wide 및 Compact.
- `disk_name` ([String](../../sql-reference/data-types/string.md)) — 데이터 부분이 위치한 디스크 이름.
- `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — 데이터 부분 파일이 있는 폴더의 절대 경로.
- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 데이터 부분의 행 수.
- `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 데이터 부분의 크기 (바이트 단위).
- `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — 현재 부분이 (병합 후) 구성된 파트의 이름 배열.
- `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 압축되지 않은 바이트의 크기.
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 병합 중 읽은 행 수.
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 병합 중 읽은 바이트 수.
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 스레드의 할당된 메모리와 해제된 메모리의 최대 차이.
- `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 발생한 오류의 코드 번호.
- `exception` ([String](../../sql-reference/data-types/string.md)) — 발생한 오류의 텍스트 메시지.
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 다양한 메트릭을 측정하는 ProfileEvents. 이들에 대한 설명은 [system.events](/operations/system-tables/events) 테이블에서 찾을 수 있습니다.

`system.part_log` 테이블은 `MergeTree` 테이블에 데이터가 처음 삽입된 후 생성됩니다.

**예제**

```sql
SELECT * FROM system.part_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
query_id:
event_type:              MergeParts
merge_reason:            RegularMerge
merge_algorithm:         Vertical
event_date:              2025-07-19
event_time:              2025-07-19 23:54:19
event_time_microseconds: 2025-07-19 23:54:19.710761
duration_ms:             2158
database:                default
table:                   github_events
table_uuid:              1ad33424-f5f5-402b-ac03-ec82282634ab
part_name:               all_1_7_1
partition_id:            all
partition:               tuple()
part_type:               Wide
disk_name:               default
path_on_disk:            ./data/store/1ad/1ad33424-f5f5-402b-ac03-ec82282634ab/all_1_7_1/
rows:                    3285726 -- 3.29 million
size_in_bytes:           438968542 -- 438.97 million
merged_from:             ['all_1_1_0','all_2_2_0','all_3_3_0','all_4_4_0','all_5_5_0','all_6_6_0','all_7_7_0']
bytes_uncompressed:      1373137767 -- 1.37 billion
read_rows:               3285726 -- 3.29 million
read_bytes:              1429206946 -- 1.43 billion
peak_memory_usage:       303611887 -- 303.61 million
error:                   0
exception:
ProfileEvents:           {'FileOpen':703,'ReadBufferFromFileDescriptorRead':3824,'ReadBufferFromFileDescriptorReadBytes':439601681,'WriteBufferFromFileDescriptorWrite':592,'WriteBufferFromFileDescriptorWriteBytes':438988500,'ReadCompressedBytes':439601681,'CompressedReadBufferBlocks':6314,'CompressedReadBufferBytes':1539835748,'OpenedFileCacheHits':50,'OpenedFileCacheMisses':484,'OpenedFileCacheMicroseconds':222,'IOBufferAllocs':1914,'IOBufferAllocBytes':319810140,'ArenaAllocChunks':8,'ArenaAllocBytes':131072,'MarkCacheMisses':7,'CreatedReadBufferOrdinary':534,'DiskReadElapsedMicroseconds':139058,'DiskWriteElapsedMicroseconds':51639,'AnalyzePatchRangesMicroseconds':28,'ExternalProcessingFilesTotal':1,'RowsReadByMainReader':170857759,'WaitMarksLoadMicroseconds':988,'LoadedMarksFiles':7,'LoadedMarksCount':14,'LoadedMarksMemoryBytes':728,'Merge':2,'MergeSourceParts':14,'MergedRows':3285733,'MergedColumns':4,'GatheredColumns':51,'MergedUncompressedBytes':1429207058,'MergeTotalMilliseconds':2158,'MergeExecuteMilliseconds':2155,'MergeHorizontalStageTotalMilliseconds':145,'MergeHorizontalStageExecuteMilliseconds':145,'MergeVerticalStageTotalMilliseconds':2008,'MergeVerticalStageExecuteMilliseconds':2006,'MergeProjectionStageTotalMilliseconds':5,'MergeProjectionStageExecuteMilliseconds':4,'MergingSortedMilliseconds':7,'GatheringColumnMilliseconds':56,'ContextLock':2091,'PartsLockHoldMicroseconds':77,'PartsLockWaitMicroseconds':1,'RealTimeMicroseconds':2157475,'CannotWriteToWriteBufferDiscard':36,'LogTrace':6,'LogDebug':59,'LoggerElapsedNanoseconds':514040,'ConcurrencyControlSlotsGranted':53,'ConcurrencyControlSlotsAcquired':53}
```
