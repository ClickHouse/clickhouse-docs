---
description: 'MergeTree ファミリーのテーブルで、データパーツに対して行われた追加やマージなどのイベントに関する情報を格納するシステムテーブル。'
keywords: ['システムテーブル', 'part_log']
slug: /operations/system-tables/part_log
title: 'system.part_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.part&#95;log {#systempart&#95;log}

<SystemTableCloud />

[part&#95;log](/operations/server-configuration-parameters/settings#part_log) サーバー設定が指定されている場合にのみ、`system.part_log` テーブルが作成されます。

このテーブルには、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル内の [データパーツ](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) に対して発生した、追加やマージなどのイベントに関する情報が含まれます。

`system.part_log` テーブルには次の列が含まれます。

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — このデータパートを作成した `INSERT` クエリの識別子。
* `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — データパーツに対して発生したイベントの種類。次のいずれかの値を取ります。
  * `NewPart` — 新しいデータパーツの挿入処理。
  * `MergePartsStart` — データパーツのマージ開始。
  * `MergeParts` — データパーツのマージ完了。
  * `DownloadPart` — データパーツのダウンロード処理。
  * `RemovePart` — [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart) を使用したデータパーツの削除またはデタッチ。
  * `MutatePartStart` — データパーツのミューテーション開始。
  * `MutatePart` — データパーツのミューテーション完了。
  * `MovePart` — データパーツをあるディスクから別のディスクへ移動する処理。
* `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — 型 `MERGE_PARTS` のイベントが発生した理由。次のいずれかの値を取ります：`
  * `NotAMerge` — 現在のイベントタイプが `MERGE_PARTS` 以外の場合。
  * `RegularMerge` — 通常のマージ。
  * `TTLDeleteMerge` — 有効期限切れデータの削除。
  * `TTLRecompressMerge` — データパーツの再圧縮。
* `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — タイプが `MERGE_PARTS` のイベントに対して使用されるマージアルゴリズム。取り得る値は次のいずれかです：
  * `未決定`
  * `水平`
  * `垂直`
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの発生時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のイベントの時刻。
* `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 継続時間。
* `database` ([String](../../sql-reference/data-types/string.md)) — データパーツが属するデータベースの名前。
* `table` ([String](../../sql-reference/data-types/string.md)) — データパーツが含まれているテーブルの名前。
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — データパートが属するテーブルのUUID。
* `part_name` ([String](../../sql-reference/data-types/string.md)) — データパーツ名。
* `partition_id` ([String](../../sql-reference/data-types/string.md)) — データパートが挿入されたパーティションの ID。パーティション分割が `tuple()` によって行われている場合、この列は `all` の値を取ります。
* `partition` ([String](../../sql-reference/data-types/string.md)) - パーティションの名前。
* `part_type` ([String](../../sql-reference/data-types/string.md)) - パーツのタイプ。取り得る値は Wide と Compact です。
* `disk_name` ([String](../../sql-reference/data-types/string.md)) - データパーツが配置されているディスク名。
* `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — データパーツファイルが格納されているフォルダへの絶対パス。
* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートに含まれる行数です。
* `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートのサイズ（バイト単位）。
* `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — 現在のパーツが（マージ後に）作成される際に元となったパーツ名の配列。
* `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 非圧縮データのバイト数。
* `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み込まれた行数。
* `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み取られたバイト数。
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このスレッドのコンテキストにおいて、割り当てられたメモリ量と解放されたメモリ量の差の最大値。
* `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 発生したエラーのエラーコード。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 発生したエラーの内容を示すテキストメッセージ。
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 各種メトリクスを計測する `ProfileEvents`。それぞれの説明はテーブル [system.events](/operations/system-tables/events) に記載されています。

`system.part_log` テーブルは、`MergeTree` テーブルにデータを初めて挿入した後に作成されます。

**例**

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
rows:                    3285726 -- 329万
size_in_bytes:           438968542 -- 4億3897万
merged_from:             ['all_1_1_0','all_2_2_0','all_3_3_0','all_4_4_0','all_5_5_0','all_6_6_0','all_7_7_0']
bytes_uncompressed:      1373137767 -- 13億7000万
read_rows:               3285726 -- 329万
read_bytes:              1429206946 -- 14億3000万
peak_memory_usage:       303611887 -- 3億361万
error:                   0
exception:
ProfileEvents:           {'FileOpen':703,'ReadBufferFromFileDescriptorRead':3824,'ReadBufferFromFileDescriptorReadBytes':439601681,'WriteBufferFromFileDescriptorWrite':592,'WriteBufferFromFileDescriptorWriteBytes':438988500,'ReadCompressedBytes':439601681,'CompressedReadBufferBlocks':6314,'CompressedReadBufferBytes':1539835748,'OpenedFileCacheHits':50,'OpenedFileCacheMisses':484,'OpenedFileCacheMicroseconds':222,'IOBufferAllocs':1914,'IOBufferAllocBytes':319810140,'ArenaAllocChunks':8,'ArenaAllocBytes':131072,'MarkCacheMisses':7,'CreatedReadBufferOrdinary':534,'DiskReadElapsedMicroseconds':139058,'DiskWriteElapsedMicroseconds':51639,'AnalyzePatchRangesMicroseconds':28,'ExternalProcessingFilesTotal':1,'RowsReadByMainReader':170857759,'WaitMarksLoadMicroseconds':988,'LoadedMarksFiles':7,'LoadedMarksCount':14,'LoadedMarksMemoryBytes':728,'Merge':2,'MergeSourceParts':14,'MergedRows':3285733,'MergedColumns':4,'GatheredColumns':51,'MergedUncompressedBytes':1429207058,'MergeTotalMilliseconds':2158,'MergeExecuteMilliseconds':2155,'MergeHorizontalStageTotalMilliseconds':145,'MergeHorizontalStageExecuteMilliseconds':145,'MergeVerticalStageTotalMilliseconds':2008,'MergeVerticalStageExecuteMilliseconds':2006,'MergeProjectionStageTotalMilliseconds':5,'MergeProjectionStageExecuteMilliseconds':4,'MergingSortedMilliseconds':7,'GatheringColumnMilliseconds':56,'ContextLock':2091,'PartsLockHoldMicroseconds':77,'PartsLockWaitMicroseconds':1,'RealTimeMicroseconds':2157475,'CannotWriteToWriteBufferDiscard':36,'LogTrace':6,'LogDebug':59,'LoggerElapsedNanoseconds':514040,'ConcurrencyControlSlotsGranted':53,'ConcurrencyControlSlotsAcquired':53}
```
