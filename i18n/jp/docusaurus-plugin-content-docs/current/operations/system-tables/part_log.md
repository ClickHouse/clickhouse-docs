---
description: 'MergeTree ファミリーのテーブルで、データパーツに対して行われた追加やマージなどのイベントに関する情報を格納するシステムテーブル。'
keywords: ['システムテーブル', 'part_log']
slug: /operations/system-tables/part_log
title: 'system.part_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.part_log \{#systempart_log\}

<SystemTableCloud />

`system.part_log` テーブルは、[part&#95;log](/operations/server-configuration-parameters/settings#part_log) サーバー設定が指定されている場合にのみ作成されます。

このテーブルには、データの追加やマージなど、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリーテーブルの[データパート](../../engines/table-engines/mergetree-family/custom-partitioning-key.md)で発生したイベントに関する情報が含まれています。

`system.part_log` テーブルには次の列が含まれます:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — このデータパートを作成した `INSERT` クエリの識別子。
* `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — データパートで発生したイベントのタイプ。次のいずれかの値を持つことができます:
  * `NewPart` — 新しいデータパートの挿入。
  * `MergePartsStart` — データパートのマージが開始されました。
  * `MergeParts` — データパートのマージが完了しました。
  * `DownloadPart` — データパートのダウンロード。
  * `RemovePart` — [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart) を使用したデータパートの削除またはデタッチ。
  * `MutatePartStart` — データパートのミューテーションが開始されました。
  * `MutatePart` — データパートのミューテーションが完了しました。
  * `MovePart` — データパートをあるディスクから別のディスクに移動。
* `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — タイプが `MERGE_PARTS` のイベントの理由。次のいずれかの値を持つことができます:
  * `NotAMerge` — 現在のイベントのタイプは `MERGE_PARTS` 以外です。
  * `RegularMerge` — 通常のマージ。
  * `TTLDeleteMerge` — 期限切れデータのクリーンアップ。
  * `TTLRecompressMerge` — データパートの再圧縮。
* `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — タイプが `MERGE_PARTS` のイベントのマージアルゴリズム。次のいずれかの値を持つことができます:
  * `Undecided`
  * `Horizontal`
  * `Vertical`
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベント日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベント時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のイベント時刻。
* `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 期間。
* `database` ([String](../../sql-reference/data-types/string.md)) — データパートが存在するデータベースの名前。
* `table` ([String](../../sql-reference/data-types/string.md)) — データパートが存在するテーブルの名前。
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — データパートが属するテーブルの UUID。
* `part_name` ([String](../../sql-reference/data-types/string.md)) — データパートの名前。
* `partition_id` ([String](../../sql-reference/data-types/string.md)) — データパートが挿入されたパーティションの ID。パーティショニングが `tuple()` による場合、この列は `all` 値を取ります。
* `partition` ([String](../../sql-reference/data-types/string.md)) - パーティション名。
* `part_type` ([String](../../sql-reference/data-types/string.md)) - パートのタイプ。可能な値: Wide および Compact。
* `disk_name` ([String](../../sql-reference/data-types/string.md)) - データパートが存在するディスク名。
* `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — データパートファイルを含むフォルダへの絶対パス。
* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパート内の行数。
* `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートのバイト単位のサイズ。
* `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — 現在のパートが構成されたパートの名前の配列(マージ後)。
* `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 非圧縮バイトのサイズ。
* `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み取られた行数。
* `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み取られたバイト数。
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このスレッドのコンテキストで割り当てられたメモリと解放されたメモリの量の最大差。
* `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 発生したエラーのコード番号。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 発生したエラーのテキストメッセージ。
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — さまざまなメトリックを測定する ProfileEvents。これらの説明は、テーブル [system.events](/operations/system-tables/events) にあります。

`system.part_log` テーブルは、`MergeTree` テーブルに最初のデータを挿入した後に作成されます。

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
