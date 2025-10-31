---
'description': 'システムテーブルで、MergeTreeファミリーのテーブルで現在処理中のマージおよびパーツの変異に関する情報を含んでいます。'
'keywords':
- 'system table'
- 'merges'
'slug': '/operations/system-tables/merges'
'title': 'system.merges'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.merges

<SystemTableCloud/>

MergeTreeファミリーのテーブルに対して現在進行中のマージやパーツの変更に関する情報を含みます。

カラム:

- `database` (String) — テーブルが存在するデータベースの名前。
- `table` (String) — テーブル名。
- `elapsed` (Float64) — マージが開始してから経過した時間（秒）。
- `progress` (Float64) — 完了した作業の割合（0から1の間）。
- `num_parts` (UInt64) — マージするパーツの数。
- `result_part_name` (String) — マージの結果形成されるパーツの名前。
- `is_mutation` (UInt8) — このプロセスがパーツの変更である場合は1。
- `total_size_bytes_compressed` (UInt64) — マージされたチャンク内の圧縮データの総サイズ。
- `total_size_marks` (UInt64) — マージされたパーツ内のマークの総数。
- `bytes_read_uncompressed` (UInt64) — 読み取られたバイト数、未圧縮。
- `rows_read` (UInt64) — 読み取られた行数。
- `bytes_written_uncompressed` (UInt64) — 書き込まれたバイト数、未圧縮。
- `rows_written` (UInt64) — 書き込まれた行数。
- `memory_usage` (UInt64) — マージプロセスのメモリ消費量。
- `thread_id` (UInt64) — マージプロセスのスレッドID。
- `merge_type` — 現在のマージのタイプ。変更の場合は空。
- `merge_algorithm` — 現在のマージで使用されるアルゴリズム。変更の場合は空。
