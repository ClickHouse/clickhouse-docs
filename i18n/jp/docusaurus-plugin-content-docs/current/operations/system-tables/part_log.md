---
'description': 'MergeTreeファミリーテーブルのデータパーツに関して発生したイベントの情報を含むシステムテーブル、例えばデータの追加やマージなど。'
'keywords':
- 'system table'
- 'part_log'
'slug': '/operations/system-tables/part_log'
'title': 'system.part_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.part_log

<SystemTableCloud/>

`system.part_log` テーブルは、[part_log](/operations/server-configuration-parameters/settings#part_log) サーバ設定が指定されている場合のみ作成されます。

このテーブルには、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル内の [data parts](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) に関するイベントの情報が含まれ、データの追加やマージなどが記録されます。

`system.part_log` テーブルには、以下のカラムが含まれています：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバのホスト名。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — このデータパートを作成した `INSERT` クエリの識別子。
- `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — データパートに対して発生したイベントの種類。次のいずれかの値を取ることができます：
  - `NewPart` — 新しいデータパートの挿入。
  - `MergePartsStart` — データパートのマージが開始された。
  - `MergeParts` — データパートのマージが完了した。
  - `DownloadPart` — データパートのダウンロード。
  - `RemovePart` — [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart) を使用してデータパートの削除または切り離し。
  - `MutatePartStart` — データパートの変更が開始された。
  - `MutatePart` — データパートの変更が完了した。
  - `MovePart` — あるディスクから別のディスクへのデータパートの移動。
- `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` タイプのイベントの理由。次のいずれかの値を取ることができます：
  - `NotAMerge` — 現在のイベントが `MERGE_PARTS` 以外のタイプである。
  - `RegularMerge` — 通常のマージ。
  - `TTLDeleteMerge` — 有効期限切れデータのクリーンアップ。
  - `TTLRecompressMerge` — データパートの再圧縮。
- `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` タイプのイベントのマージアルゴリズム。次のいずれかの値を取ることができます：
  - `Undecided`
  - `Horizontal`
  - `Vertical`
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のイベント時刻。
- `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 継続時間。
- `database` ([String](../../sql-reference/data-types/string.md)) — データパートが含まれているデータベースの名前。
- `table` ([String](../../sql-reference/data-types/string.md)) — データパートが含まれているテーブルの名前。
- `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — データパートが属するテーブルのUUID。
- `part_name` ([String](../../sql-reference/data-types/string.md)) — データパートの名前。
- `partition_id` ([String](../../sql-reference/data-types/string.md)) — データパートが挿入されたパーティションのID。このカラムは、パーティショニングが `tuple()` の場合は `all` の値を取ります。
- `partition` ([String](../../sql-reference/data-types/string.md)) - パーティションの名前。
- `part_type` ([String](../../sql-reference/data-types/string.md)) - パートのタイプ。可能な値: Wide と Compact。
- `disk_name` ([String](../../sql-reference/data-types/string.md)) - データパートが存在するディスクの名前。
- `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — データパートファイルを含むフォルダへの絶対パス。
- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパート内の行数。
- `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートのサイズ（バイト単位）。
- `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — 現在のパートがマージ後に構成されたパーツの名前の配列。
- `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 非圧縮バイトのサイズ。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み取られた行数。
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み取られたバイト数。
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このスレッドに関連する割り当てられたメモリと解放されたメモリの最大差。
- `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 発生したエラーのコード番号。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 発生したエラーのテキストメッセージ。
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 様々なメトリックを測定する ProfileEvents。それらの説明は [system.events](/operations/system-tables/events) テーブルにあります。

`system.part_log` テーブルは、`MergeTree` テーブルに初めてデータが挿入された後に作成されます。

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
