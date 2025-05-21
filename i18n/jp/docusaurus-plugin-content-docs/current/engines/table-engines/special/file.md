---
description: 'File テーブルエンジンは、データをサポートされているファイル形式のファイルに保持します（`TabSeparated`、`Native` など）。'
sidebar_label: 'File'
sidebar_position: 40
slug: /engines/table-engines/special/file
title: 'File テーブルエンジン'
---


# File テーブルエンジン

File テーブルエンジンは、データをサポートされている [ファイル形式](/interfaces/formats#formats-overview) のファイルに保持します（`TabSeparated`、`Native` など）。

使用シナリオ：

- ClickHouse からファイルへのデータエクスポート。
- データをある形式から別の形式に変換。
- ディスク上のファイルを編集して ClickHouse のデータを更新。

:::note
このエンジンは現在 ClickHouse Cloud では利用できません。代わりに [S3 テーブル関数を使用してください](/sql-reference/table-functions/s3.md)。
:::

## ClickHouse サーバーでの使用 {#usage-in-clickhouse-server}

```sql
File(Format)
```

`Format` パラメータは、利用可能なファイル形式のいずれかを指定します。`SELECT` クエリを実行するためには、入力用に形式がサポートされている必要があり、`INSERT` クエリを実行するためには出力用にサポートされている必要があります。利用可能な形式は [Formats](/interfaces/formats#formats-overview) セクションに一覧されています。

ClickHouse では `File` にファイルシステムパスを指定することはできません。サーバー構成の [path](../../../operations/server-configuration-parameters/settings.md) 設定で定義されたフォルダーを使用します。

`File(Format)` を使用してテーブルを作成すると、そのフォルダーに空のサブディレクトリが作成されます。そのテーブルにデータが書き込まれると、そのサブディレクトリの `data.Format` ファイルに格納されます。

このサブフォルダーとファイルをサーバーのファイルシステム内で手動で作成し、名前が一致するテーブル情報に [ATTACH](../../../sql-reference/statements/attach.md) することによって、そのファイルからデータをクエリすることができます。

:::note
この機能には注意してください。ClickHouse はそのようなファイルへの外部変更を追跡しません。ClickHouse 内外からの同時書き込みの結果は未定義です。
:::

## 例 {#example}

**1.** `file_engine_table` テーブルを設定：

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

デフォルトでは、ClickHouse は `/var/lib/clickhouse/data/default/file_engine_table` フォルダーを作成します。

**2.** `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` を手動で作成し、以下を含めます：

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** データをクエリ：

```sql
SELECT * FROM file_engine_table
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## ClickHouse-local での使用 {#usage-in-clickhouse-local}

[clickhouse-local](../../../operations/utilities/clickhouse-local.md) では、File エンジンは `Format` に加えてファイルパスを受け付けます。デフォルトの入力/出力ストリームは、数値または人間が読みやすい名前（`0` または `stdin`、`1` または `stdout`）を使用して指定できます。追加のエンジンパラメータまたはファイル拡張子（`gz`、`br` または `xz`）に基づいて圧縮されたファイルを読み書きすることも可能です。

**例：**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 実装の詳細 {#details-of-implementation}

- 複数の `SELECT` クエリを同時に実行できますが、`INSERT` クエリはお互いに待機します。
- `INSERT` クエリによって新しいファイルを作成することがサポートされています。
- ファイルが存在する場合、`INSERT` はそこに新しい値を追加します。
- サポートされていない：
    - `ALTER`
    - `SELECT ... SAMPLE`
    - インデックス
    - レプリケーション

## PARTITION BY {#partition-by}

`PARTITION BY` — オプションです。パーティションキーでデータをパーティション分けすることにより、別々のファイルを作成することが可能です。ほとんどの場合、パーティションキーは必要ありませんが、必要な場合でも通常、月単位より細かいパーティションキーは必要ありません。パーティショニングはクエリを高速化するものではなく（ORDER BY 式とは対照的）、あまり細かいパーティショニングは避けるべきです。クライアント識別子や名前でデータをパーティショニングしないでください（代わりに、ORDER BY 式の最初のカラムにクライアント識別子や名前を使ってください）。

月単位でパーティショニングするには、`toYYYYMM(date_column)` 式を使用します。ここで `date_column` は [Date](/sql-reference/data-types/date.md) 型の列です。ここでのパーティション名は `"YYYYMM"` 形式になります。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ： `LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ： `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ： `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。タイプ： `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。

## 設定 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 存在しないファイルから空のデータを選択することを許可します。デフォルトでは無効です。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 挿入時にファイルをトランケートすることを許可します。デフォルトでは無効です。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - 形式にサフィックスがある場合、各挿入ごとに新しいファイルを作成することを許可します。デフォルトでは無効です。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 読み込み中に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - ストレージファイルからデータを読み込む方法のいずれか： `read`、`pread`、`mmap`。mmap 方法は clickhouse-server には適用されません（clickhouse-local 用に意図されています）。デフォルト値： clickhouse-server 用の `pread`、clickhouse-local 用の `mmap`。
