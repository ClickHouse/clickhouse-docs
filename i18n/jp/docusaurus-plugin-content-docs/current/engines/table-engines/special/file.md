---
slug: /engines/table-engines/special/file
sidebar_position: 40
sidebar_label:  ファイル
title: "ファイル テーブル エンジン"
description: "ファイル テーブル エンジンは、サポートされているファイル形式のいずれかでファイルにデータを保持します（`TabSeparated`、`Native`など）。"
---


# ファイル テーブル エンジン

ファイル テーブル エンジンは、サポートされている [ファイル形式](/interfaces/formats#formats-overview) のいずれかでファイルにデータを保持します（`TabSeparated`、`Native`など）。

使用シナリオ：

- ClickHouseからファイルへのデータエクスポート。
- データを1つの形式から別の形式に変換。
- ディスク上のファイルを編集してClickHouseのデータを更新。

:::note
このエンジンは現在ClickHouse Cloudでは使用できませんので、[代わりにS3テーブル関数を使用してください](/sql-reference/table-functions/s3.md)。
:::

## ClickHouseサーバーでの使用 {#usage-in-clickhouse-server}

``` sql
File(Format)
```

`Format`パラメータは利用可能なファイル形式の1つを指定します。`SELECT` クエリを実行する場合、形式は入力に対してサポートされる必要があり、`INSERT` クエリを実行するには出力に対してサポートされている必要があります。利用可能な形式は、[Formats](/interfaces/formats#formats-overview) セクションにリストされています。

ClickHouseでは、`File`のファイルシステムパスを指定することはできません。[path](../../../operations/server-configuration-parameters/settings.md)設定でサーバー構成に定義されたフォルダーが使用されます。

`File(Format)`を使用してテーブルを作成すると、そのフォルダー内に空のサブディレクトリが作成されます。そのテーブルにデータが書き込まれると、そのサブディレクトリ内の`data.Format`ファイルに格納されます。

このサブフォルダーとファイルをサーバーファイルシステム内に手動で作成し、対応する名前でテーブル情報に[ATTACH](../../../sql-reference/statements/attach.md)することで、そのファイルからデータをクエリすることができます。

:::note
この機能を使用する際は注意してください。ClickHouseはそのようなファイルに対する外部の変更を追跡しません。ClickHouseとClickHouse外での同時書き込みの結果は不定です。
:::

## 例 {#example}

**1.** `file_engine_table` テーブルを設定します：

``` sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

デフォルトでは、ClickHouseは `/var/lib/clickhouse/data/default/file_engine_table` フォルダーを作成します。

**2.** `data.TabSeparated` を含む `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` を手動で作成します：

``` bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** データをクエリします：

``` sql
SELECT * FROM file_engine_table
```

``` text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## ClickHouse-localでの使用 {#usage-in-clickhouse-local}

[clickhouse-local](../../../operations/utilities/clickhouse-local.md) では、Fileエンジンは `Format`に加えてファイルパスを受け入れます。デフォルトの入出力ストリームは、`0`や`stdin`、`1`や`stdout`のような数値または人間が読み取れる名前で指定できます。追加のエンジンパラメータまたはファイル拡張子（`gz`、`br`、`xz`）に基づいて、圧縮ファイルを読み書きすることも可能です。

**例：**

``` bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 実装の詳細 {#details-of-implementation}

- 複数の `SELECT` クエリを同時に実行できますが、`INSERT` クエリは互いに待機します。
- `INSERT` クエリによって新しいファイルを作成することがサポートされています。
- ファイルが存在する場合、`INSERT` はそのファイルに新しい値を追加します。
- サポートされていないもの：
    - `ALTER`
    - `SELECT ... SAMPLE`
    - インデックス
    - レプリケーション

## PARTITION BY {#partition-by}

`PARTITION BY` — オプションです。パーティションキーでデータをパーティション分割することによって、別々のファイルを作成できます。ほとんどの場合、パーティションキーは必要なく、必要な場合でも通常は月単位でのパーティションキーを使用することが推奨されます。パーティション分割は、クエリの速度を向上させることはありません（ORDER BY式とは対照的です）。過剰に細かいパーティション分割を行ってはいけません。クライアント識別子や名前でデータをパーティション分割しないでください（代わりに、クライアント識別子や名前をORDER BY式の最初のカラムにします）。

月単位のパーティション分割には、`toYYYYMM(date_column)` 式を使用します。ここで、`date_column` は [Date](/sql-reference/data-types/date.md) 型の日付を持つカラムです。パーティション名はここで `"YYYYMM"` 形式になります。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイルの名前。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。

## 設定 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 存在しないファイルから空のデータを選択できるようにします。デフォルトでは無効です。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - フォーマットにサフィックスがある場合、各挿入で新しいファイルを作成できるようにします。デフォルトでは無効です。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 読み取り時に空のファイルをスキップできるようにします。デフォルトでは無効です。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - ストレージファイルからデータを読み取る方法。`read`、`pread`、`mmap` のいずれかです。mmapメソッドはclickhouse-serverには適用されません（clickhouse-local用です）。デフォルト値：clickhouse-serverの場合は`pread`、clickhouse-localの場合は`mmap`です。
