---
description: "データパーツに関するイベントが発生した情報を含むシステムテーブルで、MergeTreeファミリーのテーブルにおいて、データの追加やマージなどが含まれます。"
slug: /operations/system-tables/part_log
title: "system.part_log"
keywords: ["system table", "part_log"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

`system.part_log` テーブルは、[part_log](/operations/server-configuration-parameters/settings#part_log) サーバー設定が指定されている場合にのみ作成されます。

このテーブルには、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルにおいて発生した[データパーツ](../../engines/table-engines/mergetree-family/custom-partitioning-key.md)に関するイベントの情報が含まれています。例えば、データの追加やマージなどです。

`system.part_log` テーブルには以下のカラムが含まれています。

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — このデータパーツを作成した `INSERT` クエリの識別子。
- `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — データパーツに関して発生したイベントの種類。次のいずれかの値を持つことができます:
    - `NewPart` — 新しいデータパーツの挿入。
    - `MergePartsStart` — データパーツのマージが開始されました。
    - `MergeParts` — データパーツのマージが終了しました。
    - `DownloadPart` — データパーツのダウンロード。
    - `RemovePart` — [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart)を使用してデータパーツを削除または切り離す。
    - `MutatePartStart` — データパーツの変異が開始されました。
    - `MutatePart` — データパーツの変異が終了しました。
    - `MovePart` — データパーツを1つのディスクから別のディスクに移動。
- `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` タイプのイベントの理由。次のいずれかの値を持つことができます:
    - `NotAMerge` — 現在のイベントは `MERGE_PARTS` 以外のタイプです。
    - `RegularMerge` — 一部の通常のマージ。
    - `TTLDeleteMerge` — 有効期限切れデータのクリーンアップ。
    - `TTLRecompressMerge` — データパーツの再圧縮。
- `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` タイプのイベントのマージアルゴリズム。次のいずれかの値を持つことができます:
    - `Undecided`
    - `Horizontal`
    - `Vertical`
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時間。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のイベントの時間。
- `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 持続時間。
- `database` ([String](../../sql-reference/data-types/string.md)) — データパーツが属するデータベースの名前。
- `table` ([String](../../sql-reference/data-types/string.md)) — データパーツが属するテーブルの名前。
- `part_name` ([String](../../sql-reference/data-types/string.md)) — データパーツの名前。
- `partition_id` ([String](../../sql-reference/data-types/string.md)) — データパーツが挿入されたパーティションのID。このカラムは、パーティショニングが `tuple()` の場合は `all` の値を取ります。
- `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — データパーツファイルのフォルダーへの絶対パス。
- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の行数。
- `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイト単位のデータパーツのサイズ。
- `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — 現在のパーツがマージ後に構成されたパーツの名前の配列。
- `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 非圧縮バイトのサイズ。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み取られた行の数。
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み取られたバイトの数。
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このスレッドにおける割り当てられたメモリと解放されたメモリの最大の差。
- `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 発生したエラーのコード番号。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 発生したエラーのテキストメッセージ。

`system.part_log` テーブルは、`MergeTree` テーブルに最初のデータを挿入した後に作成されます。

**例**

``` sql
SELECT * FROM system.part_log LIMIT 1 FORMAT Vertical;
```

``` text
Row 1:
──────
hostname:                      clickhouse.eu-central1.internal
query_id:                      983ad9c7-28d5-4ae1-844e-603116b7de31
event_type:                    NewPart
merge_reason:                  NotAMerge
merge_algorithm:               Undecided
event_date:                    2021-02-02
event_time:                    2021-02-02 11:14:28
event_time_microseconds:       2021-02-02 11:14:28.861919
duration_ms:                   35
database:                      default
table:                         log_mt_2
part_name:                     all_1_1_0
partition_id:                  all
path_on_disk:                  db/data/default/log_mt_2/all_1_1_0/
rows:                          115418
size_in_bytes:                 1074311
merged_from:                   []
bytes_uncompressed:            0
read_rows:                     0
read_bytes:                    0
peak_memory_usage:             0
error:                         0
exception:
```
