---
description: '系统表，包含 MergeTree 系列表中数据分片发生事件的信息，例如数据的添加或合并等。'
keywords: ['system table', 'part_log']
slug: /operations/system-tables/part_log
title: 'system.part_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.part_log

<SystemTableCloud/>

仅当在服务器配置中指定了 [part_log](/operations/server-configuration-parameters/settings#part_log) 设置时，才会创建 `system.part_log` 表。

该表包含有关 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 家族表中 [data parts](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 的事件信息，例如添加或合并数据。

`system.part_log` 表包含以下列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行该查询的服务器主机名。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 用于创建该数据分片的 `INSERT` 查询的标识符。
* `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 发生在数据部件上的事件类型。可以是以下值之一：`
  * `NewPart` — 插入新的数据部分。
  * `MergePartsStart` — 数据部分合并已开始。
  * `MergeParts` — 数据部分合并已完成。
  * `DownloadPart` — 下载数据部分。
  * `RemovePart` — 使用 [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart) 删除或分离数据部分。
  * `MutatePartStart` — 数据部分变更已开始。
  * `MutatePart` — 数据部分变更已完成。
  * `MovePart` — 将数据部分从一个磁盘移动到另一个磁盘。
* `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — 类型为 `MERGE_PARTS` 的事件的原因。可以是以下值之一：`
  * `NotAMerge` — 当前事件的类型不是 `MERGE_PARTS`。
  * `RegularMerge` — 一次常规合并。
  * `TTLDeleteMerge` — 清理过期数据。
  * `TTLRecompressMerge` — 根据 TTL 规则对数据分片重新压缩。
* `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — 类型为 `MERGE_PARTS` 的事件所使用的合并算法。可以取以下值之一：
  * `未决定`
  * `水平`
  * `垂直`
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件发生时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 事件时间，精度为微秒。
* `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 持续时间。
* `database` ([String](../../sql-reference/data-types/string.md)) — 该数据部分所在的数据库名称。
* `table` ([String](../../sql-reference/data-types/string.md)) — 数据部分所在的表名。
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 该数据分片所属表的 UUID。
* `part_name` ([String](../../sql-reference/data-types/string.md)) — 数据部分的名称。
* `partition_id` ([String](../../sql-reference/data-types/string.md)) — 数据片段被插入到的分区 ID。若按 `tuple()` 分区，则该列的取值为 `all`。
* `partition` ([String](../../sql-reference/data-types/string.md)) - 分区名称。
* `part_type` ([String](../../sql-reference/data-types/string.md)) - 分片类型。可能的取值：Wide 和 Compact。
* `disk_name` ([String](../../sql-reference/data-types/string.md)) - 数据部分所在磁盘的名称。`
* `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — 数据分片文件所在文件夹的绝对路径。
* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据部分中的行数。
* `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据部分的大小（字节数）。
* `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — 一个字符串数组，包含合并后构成当前数据片段的各源数据片段名称。
* `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 未压缩数据的大小（字节）。
* `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 合并期间读取的行数。
* `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 合并期间读取的字节数。
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 在该线程上下文中，已分配内存与已释放内存之间的最大差值。`
* `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 发生的错误代码编号。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 所发生错误的文本信息。
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 用于度量各种指标的 ProfileEvents。相关说明可在表 [system.events](/operations/system-tables/events) 中找到。

在首次向 `MergeTree` 表插入数据后，会创建 `system.part_log` 表。

**示例**

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
rows:                    3285726 -- 329 万
size_in_bytes:           438968542 -- 4.39 亿
merged_from:             ['all_1_1_0','all_2_2_0','all_3_3_0','all_4_4_0','all_5_5_0','all_6_6_0','all_7_7_0']
bytes_uncompressed:      1373137767 -- 13.7 亿
read_rows:               3285726 -- 329 万
read_bytes:              1429206946 -- 14.3 亿
peak_memory_usage:       303611887 -- 3.04 亿
error:                   0
exception:
ProfileEvents:           {'FileOpen':703,'ReadBufferFromFileDescriptorRead':3824,'ReadBufferFromFileDescriptorReadBytes':439601681,'WriteBufferFromFileDescriptorWrite':592,'WriteBufferFromFileDescriptorWriteBytes':438988500,'ReadCompressedBytes':439601681,'CompressedReadBufferBlocks':6314,'CompressedReadBufferBytes':1539835748,'OpenedFileCacheHits':50,'OpenedFileCacheMisses':484,'OpenedFileCacheMicroseconds':222,'IOBufferAllocs':1914,'IOBufferAllocBytes':319810140,'ArenaAllocChunks':8,'ArenaAllocBytes':131072,'MarkCacheMisses':7,'CreatedReadBufferOrdinary':534,'DiskReadElapsedMicroseconds':139058,'DiskWriteElapsedMicroseconds':51639,'AnalyzePatchRangesMicroseconds':28,'ExternalProcessingFilesTotal':1,'RowsReadByMainReader':170857759,'WaitMarksLoadMicroseconds':988,'LoadedMarksFiles':7,'LoadedMarksCount':14,'LoadedMarksMemoryBytes':728,'Merge':2,'MergeSourceParts':14,'MergedRows':3285733,'MergedColumns':4,'GatheredColumns':51,'MergedUncompressedBytes':1429207058,'MergeTotalMilliseconds':2158,'MergeExecuteMilliseconds':2155,'MergeHorizontalStageTotalMilliseconds':145,'MergeHorizontalStageExecuteMilliseconds':145,'MergeVerticalStageTotalMilliseconds':2008,'MergeVerticalStageExecuteMilliseconds':2006,'MergeProjectionStageTotalMilliseconds':5,'MergeProjectionStageExecuteMilliseconds':4,'MergingSortedMilliseconds':7,'GatheringColumnMilliseconds':56,'ContextLock':2091,'PartsLockHoldMicroseconds':77,'PartsLockWaitMicroseconds':1,'RealTimeMicroseconds':2157475,'CannotWriteToWriteBufferDiscard':36,'LogTrace':6,'LogDebug':59,'LoggerElapsedNanoseconds':514040,'ConcurrencyControlSlotsGranted':53,'ConcurrencyControlSlotsAcquired':53}
```
