---
description: 'File テーブルエンジンは、サポートされているファイル形式（`TabSeparated`、`Native` など）のいずれかで、データをファイルに保存します。'
sidebar_label: 'File'
sidebar_position: 40
slug: /engines/table-engines/special/file
title: 'File テーブルエンジン'
doc_type: 'reference'
---

# File テーブルエンジン \\{#file-table-engine\\}

File テーブルエンジンは、サポートされている[ファイルフォーマット](/interfaces/formats#formats-overview)（`TabSeparated`、`Native` など）のいずれかでデータをファイルに保存します。

利用シナリオ:

- ClickHouse からファイルへのデータエクスポート。
- データをあるフォーマットから別のフォーマットへ変換。
- ディスク上のファイルを編集して ClickHouse 内のデータを更新。

:::note
このエンジンは現在 ClickHouse Cloud では利用できません。[代わりに S3 テーブル関数を使用してください](/sql-reference/table-functions/s3.md)。
:::

## ClickHouse サーバーでの利用方法 \\{#usage-in-clickhouse-server\\}

```sql
File(Format)
```

`Format` パラメータは、利用可能なファイルフォーマットのうちの 1 つを指定します。`SELECT` クエリを実行するには、そのフォーマットが入力用としてサポートされている必要があり、`INSERT` クエリを実行するには出力用としてサポートされている必要があります。利用可能なフォーマットは [Formats](/interfaces/formats#formats-overview) セクションに一覧があります。

ClickHouse では、`File` に対してファイルシステムのパスを指定することはできません。サーバー設定の [path](../../../operations/server-configuration-parameters/settings.md) 設定で定義されたフォルダが使用されます。

`File(Format)` を使用してテーブルを作成すると、そのフォルダ内に空のサブディレクトリが作成されます。そのテーブルにデータが書き込まれると、そのサブディレクトリ内の `data.Format` ファイルに書き込まれます。

サーバーのファイルシステム上で、このサブフォルダとファイルを手動で作成し、その後、同じ名前のテーブルとして [ATTACH](../../../sql-reference/statements/attach.md) することで、そのファイルからデータをクエリできるようにすることも可能です。

:::note
この機能を使用する際は注意してください。ClickHouse は、この種のファイルに対する外部からの変更を追跡しません。ClickHouse 経由での書き込みと ClickHouse 外部からの書き込みが同時に行われた場合の結果は未定義です。
:::

## 例 \\{#example\\}

**1.** `file_engine_table` テーブルを作成します。

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

デフォルトでは、ClickHouse はフォルダ `/var/lib/clickhouse/data/default/file_engine_table` を作成します。

**2.** 手動で `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` を作成し、次の内容を記述します：

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** データをクエリする：

```sql
SELECT * FROM file_engine_table
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## ClickHouse-local での使用方法 \\{#usage-in-clickhouse-local\\}

[clickhouse-local](../../../operations/utilities/clickhouse-local.md) では、File エンジンは `Format` に加えてファイルパスも指定できます。デフォルトの入出力ストリームは、`0` や `stdin`、`1` や `stdout` のような数値または人間が読める名前で指定できます。追加のエンジンパラメータまたはファイル拡張子（`gz`、`br`、`xz`）に基づいて、圧縮ファイルの読み書きを行えます。

**例:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 実装の詳細 \\{#details-of-implementation\\}

- 複数の `SELECT` クエリは同時に実行できますが、`INSERT` クエリは直列に実行されます。
- `INSERT` クエリによる新規ファイルの作成をサポートしています。
- ファイルが既に存在する場合、`INSERT` はそのファイルに新しい値を追記します。
- サポートされていません:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - インデックス
  - レプリケーション

## PARTITION BY \\{#partition-by\\}

`PARTITION BY` — オプションです。パーティションキーによってデータを分割することで、別々のファイルとして保存できます。ほとんどの場合、パーティションキーは不要であり、必要な場合でも通常は「月」より細かい粒度のパーティションキーは必要ありません。パーティション分割は（`ORDER BY` 式とは対照的に）クエリの高速化にはつながりません。パーティションの粒度を細かくしすぎてはいけません。クライアント識別子や名前でデータをパーティション分割しないでください（その代わりに、`ORDER BY` 式の最初の列としてクライアント識別子または名前を指定します）。

月単位でパーティション分割するには、`toYYYYMM(date_column)` 式を使用します。ここで `date_column` は [Date](/sql-reference/data-types/date.md) 型の日付を持つ列です。このときのパーティション名は `"YYYYMM"` 形式になります。

## 仮想カラム \\{#virtual-columns\\}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。

## 設定 \\{#settings\\}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 存在しないファイルに対して空のデータを選択できるようにします。デフォルトでは無効です。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 挿入前にファイルを切り詰められるようにします。デフォルトでは無効です。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - フォーマットにサフィックスがある場合、挿入ごとに新しいファイルを作成できるようにします。デフォルトでは無効です。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 読み取り時に空のファイルをスキップできるようにします。デフォルトでは無効です。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - ストレージファイルからデータを読み出す方法で、`read`、`pread`、`mmap` のいずれかです。`mmap` メソッドは clickhouse-server には適用されません（clickhouse-local 用です）。デフォルト値は、clickhouse-server では `pread`、clickhouse-local では `mmap` です。
