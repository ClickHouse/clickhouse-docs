---
description: 'MergeTreeファミリーテーブルのデータパーツで発生したイベントに関する情報を含むシステムテーブル、例としてデータの追加やマージなど。'
keywords: ['system table', 'part_log']
slug: /operations/system-tables/part_log
title: 'system.part_log'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.part_log

<SystemTableCloud/>

`system.part_log` テーブルは、[part_log](/operations/server-configuration-parameters/settings#part_log) サーバ設定が指定されている場合にのみ作成されます。

このテーブルは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリーテーブル内の [data parts](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) に関して、データの追加やマージなどのイベントに関する情報を含みます。

`system.part_log` テーブルには以下のカラムが含まれています：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバのホスト名。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — このデータパートを作成した `INSERT` クエリの識別子。
- `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — データパートに発生したイベントの種類。以下のいずれかの値を取ることができます：
    - `NewPart` — 新しいデータパートの挿入。
    - `MergePartsStart` — データパーツのマージが開始されました。
    - `MergeParts` — データパーツのマージが終了しました。
    - `DownloadPart` — データパートのダウンロード。
    - `RemovePart` — [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart) を使用してデータパートを削除または切り離します。
    - `MutatePartStart` — データパートの変異が開始されました。
    - `MutatePart` — データパートの変異が終了しました。
    - `MovePart` — データパートを一つのディスクから別のディスクに移動します。
- `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` タイプのイベントの理由。以下のいずれかの値を取ることができます：
    - `NotAMerge` — 現在のイベントのタイプは `MERGE_PARTS` 以外です。
    - `RegularMerge` — 通常のマージ。
    - `TTLDeleteMerge` — 期限切れデータのクリーンアップ。
    - `TTLRecompressMerge` — データパートの再圧縮。
- `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — `MERGE_PARTS` タイプのイベントのマージアルゴリズム。以下のいずれかの値を取ることができます：
    - `Undecided`
    - `Horizontal`
    - `Vertical`
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベント日。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベント時間。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のイベント時間。
- `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 継続時間。
- `database` ([String](../../sql-reference/data-types/string.md)) — データパートが存在するデータベースの名前。
- `table` ([String](../../sql-reference/data-types/string.md)) — データパートが存在するテーブルの名前。
- `part_name` ([String](../../sql-reference/data-types/string.md)) — データパートの名前。
- `partition_id` ([String](../../sql-reference/data-types/string.md)) — データパートが挿入されたパーティションのID。カラムはパーティショニングが `tuple()` の場合、`all` 値を取ります。
- `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — データパートファイルのフォルダへの絶対パス。
- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパート内の行数。
- `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートのサイズ（バイト単位）。
- `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — 現在のパートが構成されるパーツ名の配列（マージ後）。
- `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 非圧縮バイトのサイズ。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み取られた行数。
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ中に読み取られたバイト数。
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このスレッドのコンテキストにおける割り当ておよび解放されたメモリの最大差。
- `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 発生したエラーのコード番号。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 発生したエラーのテキストメッセージ。

`system.part_log` テーブルは、`MergeTree` テーブルへの最初のデータ挿入の後に作成されます。

**例**

```sql
SELECT * FROM system.part_log LIMIT 1 FORMAT Vertical;
```

```text
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
