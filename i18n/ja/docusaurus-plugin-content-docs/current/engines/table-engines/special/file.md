---
slug: /engines/table-engines/special/file
sidebar_position: 40
sidebar_label:  ファイル
title: "ファイルテーブルエンジン"
description: "ファイルテーブルエンジンは、サポートされているファイルフォーマット（`TabSeparated`, `Native`, など）のいずれかでファイル内にデータを保持します。"
---

# ファイルテーブルエンジン

ファイルテーブルエンジンは、サポートされている[ファイルフォーマット](../../../interfaces/formats.md#formats)（`TabSeparated`, `Native`, など）のいずれかでファイル内にデータを保持します。

使用シナリオ:

- ClickHouseからファイルへのデータエクスポート。
- データをあるフォーマットから別のフォーマットに変換。
- ディスク上のファイルを編集することによるClickHouseでのデータ更新。

:::note
このエンジンは現在ClickHouse Cloudでは利用できませんので、[代わりにS3テーブル関数を使用してください](/sql-reference/table-functions/s3.md)。
:::

## ClickHouseサーバーでの使用 {#usage-in-clickhouse-server}

``` sql
File(Format)
```

`Format`パラメータは、利用可能なファイルフォーマットのいずれかを指定します。`SELECT`クエリを実行するためには、フォーマットが入力用にサポートされている必要があり、`INSERT`クエリを実行するためには出力用にサポートされている必要があります。利用可能なフォーマットは[フォーマット](../../../interfaces/formats.md#formats)セクションにリストされています。

ClickHouseは`File`のためにファイルシステムパスを指定することを許可しません。[path](../../../operations/server-configuration-parameters/settings.md)設定で定義されたフォルダを使用します。

`File(Format)`を使用してテーブルを作成すると、そのフォルダ内に空のサブディレクトリが作成されます。そのテーブルにデータが書き込まれると、サブディレクトリ内の`data.Format`ファイルに格納されます。

このサブフォルダとファイルを手動でサーバーファイルシステムに作成し、同名のテーブル情報に[ATTACH](../../../sql-reference/statements/attach.md)することで、そのファイルからデータをクエリできます。

:::note
この機能には注意が必要です。なぜならClickHouseはそのようなファイルへの外部の変更を追跡しないからです。ClickHouse内外での同時書き込みの結果は未定義です。
:::

## 例 {#example}

**1.** `file_engine_table`テーブルを設定する:

``` sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

デフォルトではClickHouseは`/var/lib/clickhouse/data/default/file_engine_table`フォルダを作成します。

**2.** ```/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated```を手動で作成し、以下を含めます:

``` bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** データをクエリします:

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

[clickhouse-local](../../../operations/utilities/clickhouse-local.md)では、Fileエンジンは`Format`に加えてファイルパスを受け付けます。デフォルトの入力/出力ストリームは、`0`または`stdin`、`1`または`stdout`のような数値または人間が読める名前を使用して指定できます。追加のエンジンパラメータまたはファイル拡張子（`gz`, `br`, または`xz`）に基づいて圧縮ファイルを読み書きすることが可能です。

**例:**

``` bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 実装の詳細 {#details-of-implementation}

- 複数の`SELECT`クエリを同時に実行できますが、`INSERT`クエリは互いに待機します。
- `INSERT`クエリによって新しいファイルを作成することがサポートされています。
- ファイルが存在する場合、`INSERT`は新しい値をファイルに追加します。
- サポートされていない機能:
    - `ALTER`
    - `SELECT ... SAMPLE`
    - インデックス
    - レプリケーション

## PARTITION BY {#partition-by}

`PARTITION BY` — オプションです。パーティションキーでデータをパーティション分けることによって、別々のファイルを作成できます。ほとんどの場合、パーティションキーは必要ありませんが、必要な場合、一般的には月単位でのそれ以上の詳細なパーティションキーは必要ありません。パーティション分けはクエリの速度を向上させません（`ORDER BY`式とは対照的に）。過度に詳細なパーティション分けを使用すべきではありません。クライアント識別子や名前でデータをパーティション分けしないでください（代わりに、クライアント識別子や名前を`ORDER BY`式の最初のカラムにしてください）。

月単位でのパーティション分けを行うには、`toYYYYMM(date_column)`式を使用します。ここで、`date_column`は[Date](/sql-reference/data-types/date.md)タイプの列です。パーティション名は`"YYYYMM"`形式になります。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合、値は`NULL`です。

## 設定 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings.md#engine-file-empty_if-not-exists) - 存在しないファイルから空のデータを選択することを許可します。デフォルトでは無効です。
- [engine_file_truncate_on_insert](/operations/settings/settings.md#engine-file-truncate-on-insert) - ファイルに挿入する前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine-file_allow_create_multiple_files) - フォーマットにサフィックスがある場合、挿入ごとに新しいファイルを作成することを許可します。デフォルトでは無効です。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine-file_skip_empty_files) - 読み込み中に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [storage_file_read_method](/operations/settings/settings.md#engine-file-empty_if-not-exists) - ストレージファイルからのデータ読み取り方法。選択肢: `read`, `pread`, `mmap`。mmapメソッドはclickhouse-serverには適用されません（clickhouse-local用です）。デフォルト値: `clickhouse-server`のための`pread`、`clickhouse-local`のための`mmap`です。
