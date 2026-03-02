---
description: 'MergeTree 계열 테이블의 데이터 파트에서 발생한 추가, 병합 등의 이벤트 정보를 포함하는 system 테이블입니다.'
keywords: ['system 테이블', 'part_log']
slug: /operations/system-tables/part_log
title: 'system.part_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.part_log \{#systempart_log\}

<SystemTableCloud />

`system.part_log` 테이블은 [part&#95;log](/operations/server-configuration-parameters/settings#part_log) 서버 설정이 지정된 경우에만 생성됩니다.

이 테이블에는 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 계열 테이블의 [데이터 파트](../../engines/table-engines/mergetree-family/custom-partitioning-key.md)에 대해 발생한 이벤트(데이터 추가, 병합 등)에 대한 정보가 포함됩니다.

`system.part_log` 테이블에는 다음 컬럼이 포함됩니다:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트명입니다.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 이 데이터 파트를 생성한 `INSERT` 쿼리의 식별자입니다.
* `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 데이터 파트에 대해 발생한 이벤트 유형입니다. 다음 값 중 하나를 가집니다.
  * `NewPart` — 새로운 데이터 파트를 삽입합니다.
  * `MergePartsStart` — 데이터 파트 병합이 시작되었습니다.
  * `MergeParts` — 데이터 파트 병합이 완료되었습니다.
  * `DownloadPart` — 데이터 파트를 다운로드합니다.
  * `RemovePart` — [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart)을(를) 사용하여 데이터 파트를 제거하거나 분리합니다.
  * `MutatePartStart` — 데이터 파트 변경 작업이 시작되었습니다.
  * `MutatePart` — 데이터 파트 변경 작업이 완료되었습니다.
  * `MovePart` — 데이터 파트를 한 디스크에서 다른 디스크로 이동합니다.
* `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` 타입 이벤트의 원인입니다. 다음 값들 중 하나를 가질 수 있습니다:
  * `NotAMerge` — 현재 이벤트의 타입이 `MERGE_PARTS`가 아님.
  * `RegularMerge` — 일반적인 머지 작업.
  * `TTLDeleteMerge` — 만료된 데이터 정리.
  * `TTLRecompressMerge` — 데이터 파트 재압축.
* `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` 타입의 이벤트에 사용되는 머지 알고리즘입니다. 다음 값 중 하나일 수 있습니다:
  * `Undecided`
  * `Horizontal`
  * `Vertical`
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트가 발생한 날짜입니다.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트가 발생한 시각입니다.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 단위까지 표현되는 이벤트 시간입니다.
* `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 지속 시간.
* `database` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트가 포함된 데이터베이스의 이름입니다.
* `table` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트가 포함된 테이블의 이름입니다.
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 데이터 파트가 속해 있는 테이블의 UUID입니다.
* `part_name` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트의 이름입니다.
* `partition_id` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트가 삽입된 파티션의 ID입니다. 파티셔닝이 `tuple()`로 정의된 경우 이 컬럼은 `all` 값을 가집니다.
* `partition` ([String](../../sql-reference/data-types/string.md)) - 파티션 이름.
* `part_type` ([String](../../sql-reference/data-types/string.md)) - 파트의 유형입니다. 가능한 값: Wide, Compact.`
* `disk_name` ([String](../../sql-reference/data-types/string.md)) - 데이터 파트가 위치한 디스크의 이름입니다.
* `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — 데이터 파트 파일이 있는 폴더의 절대 경로입니다.
* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 데이터 파트에 포함된 행 수입니다.
* `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 데이터 파트의 크기(바이트 단위)입니다.
* `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — 현재 파트가 merge 또는 뮤테이션 이후에 어떤 파트들로부터 구성되었는지를 나타내는 파트 이름 배열입니다.
* `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 압축되지 않은 데이터의 바이트 크기입니다.
* `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 머지 작업 동안 읽은 행의 수입니다.
* `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 머지 작업 중에 읽은 바이트 수입니다.
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 스레드 컨텍스트에서 할당된 메모리 양과 해제된 메모리 양의 차이 중 최댓값입니다.
* `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 발생한 오류의 코드 번호입니다.
* `exception` ([String](../../sql-reference/data-types/string.md)) — 발생한 오류에 대한 텍스트 메시지입니다.
* `mutation_ids` ([Array(String)](../../sql-reference/data-types/array.md)) — 이벤트 유형이 `MutatePartsStart` 및 `MutateParts`인 경우, 소스 파트(`merged_from`)에 적용된 mutation ID들의 배열입니다.
* `ProfileEvents` ([맵(Map(String, UInt64))](../../sql-reference/data-types/map.md)) — 다양한 메트릭을 계측하는 ProfileEvents입니다. 각 항목에 대한 설명은 [system.events](/operations/system-tables/events) 테이블에서 확인할 수 있습니다.

`system.part_log` 테이블은 `MergeTree` 테이블에 처음으로 데이터를 삽입한 후에 생성됩니다.

**예시**

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
mutation_ids:
ProfileEvents:           {'FileOpen':703,'ReadBufferFromFileDescriptorRead':3824,'ReadBufferFromFileDescriptorReadBytes':439601681,'WriteBufferFromFileDescriptorWrite':592,'WriteBufferFromFileDescriptorWriteBytes':438988500,'ReadCompressedBytes':439601681,'CompressedReadBufferBlocks':6314,'CompressedReadBufferBytes':1539835748,'OpenedFileCacheHits':50,'OpenedFileCacheMisses':484,'OpenedFileCacheMicroseconds':222,'IOBufferAllocs':1914,'IOBufferAllocBytes':319810140,'ArenaAllocChunks':8,'ArenaAllocBytes':131072,'MarkCacheMisses':7,'CreatedReadBufferOrdinary':534,'DiskReadElapsedMicroseconds':139058,'DiskWriteElapsedMicroseconds':51639,'AnalyzePatchRangesMicroseconds':28,'ExternalProcessingFilesTotal':1,'RowsReadByMainReader':170857759,'WaitMarksLoadMicroseconds':988,'LoadedMarksFiles':7,'LoadedMarksCount':14,'LoadedMarksMemoryBytes':728,'Merge':2,'MergeSourceParts':14,'MergedRows':3285733,'MergedColumns':4,'GatheredColumns':51,'MergedUncompressedBytes':1429207058,'MergeTotalMilliseconds':2158,'MergeExecuteMilliseconds':2155,'MergeHorizontalStageTotalMilliseconds':145,'MergeHorizontalStageExecuteMilliseconds':145,'MergeVerticalStageTotalMilliseconds':2008,'MergeVerticalStageExecuteMilliseconds':2006,'MergeProjectionStageTotalMilliseconds':5,'MergeProjectionStageExecuteMilliseconds':4,'MergingSortedMilliseconds':7,'GatheringColumnMilliseconds':56,'ContextLock':2091,'PartsLockHoldMicroseconds':77,'PartsLockWaitMicroseconds':1,'RealTimeMicroseconds':2157475,'CannotWriteToWriteBufferDiscard':36,'LogTrace':6,'LogDebug':59,'LoggerElapsedNanoseconds':514040,'ConcurrencyControlSlotsGranted':53,'ConcurrencyControlSlotsAcquired':53}
```
