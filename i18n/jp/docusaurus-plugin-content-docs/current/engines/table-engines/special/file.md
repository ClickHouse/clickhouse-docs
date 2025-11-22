---
description: 'File テーブルエンジンは、サポートされているいずれかのファイル形式（`TabSeparated`、`Native` など）でデータをファイルに保持します。'
sidebar_label: 'File'
sidebar_position: 40
slug: /engines/table-engines/special/file
title: 'File テーブルエンジン'
doc_type: 'reference'
---



# File テーブルエンジン

File テーブルエンジンは、サポートされている[ファイル形式](/interfaces/formats#formats-overview)（`TabSeparated`、`Native` など）のいずれかで、データをファイルとして保存します。

主な利用例:

- ClickHouse からファイルへのデータエクスポート。
- データをある形式から別の形式へ変換。
- ディスク上のファイルを編集することで ClickHouse 内のデータを更新。

:::note
このエンジンは現在 ClickHouse Cloud では利用できません。[代わりに S3 テーブル関数を使用してください](/sql-reference/table-functions/s3.md)。
:::



## ClickHouseサーバーでの使用 {#usage-in-clickhouse-server}

```sql
File(Format)
```

`Format`パラメータは、利用可能なファイル形式のいずれかを指定します。`SELECT`クエリを実行するには、その形式が入力をサポートしている必要があり、`INSERT`クエリを実行するには出力をサポートしている必要があります。利用可能な形式は[Formats](/interfaces/formats#formats-overview)セクションに記載されています。

ClickHouseでは`File`に対してファイルシステムパスを指定することはできません。サーバー設定の[path](../../../operations/server-configuration-parameters/settings.md)設定で定義されたフォルダが使用されます。

`File(Format)`を使用してテーブルを作成すると、そのフォルダ内に空のサブディレクトリが作成されます。そのテーブルにデータが書き込まれると、そのサブディレクトリ内の`data.Format`ファイルに保存されます。

サーバーのファイルシステム上でこのサブフォルダとファイルを手動で作成し、一致する名前のテーブル情報に[ATTACH](../../../sql-reference/statements/attach.md)することで、そのファイルからデータをクエリすることができます。

:::note
この機能を使用する際は注意してください。ClickHouseはこのようなファイルへの外部変更を追跡しないためです。ClickHouse経由とClickHouse外部からの同時書き込みの結果は未定義です。
:::


## 例 {#example}

**1.** `file_engine_table` テーブルを設定します:

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

デフォルトでは、ClickHouse は `/var/lib/clickhouse/data/default/file_engine_table` フォルダを作成します。

**2.** 以下の内容を含む `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` を手動で作成します:

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** データをクエリします:

```sql
SELECT * FROM file_engine_table
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```


## ClickHouse-localでの使用 {#usage-in-clickhouse-local}

[clickhouse-local](../../../operations/utilities/clickhouse-local.md)では、Fileエンジンは`Format`に加えてファイルパスを受け付けます。デフォルトの入出力ストリームは、`0`や`stdin`、`1`や`stdout`のような数値または人間が読みやすい名前を使用して指定できます。追加のエンジンパラメータまたはファイル拡張子(`gz`、`br`、`xz`)に基づいて、圧縮ファイルの読み書きが可能です。

**例:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```


## 実装の詳細 {#details-of-implementation}

- 複数の`SELECT`クエリは同時に実行できますが、`INSERT`クエリは相互に待機します。
- `INSERT`クエリによる新規ファイルの作成に対応しています。
- ファイルが存在する場合、`INSERT`は新しい値を追記します。
- 非対応:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - インデックス
  - レプリケーション


## PARTITION BY {#partition-by}

`PARTITION BY` — オプション。パーティションキーによってデータを分割し、個別のファイルを作成することができます。ほとんどの場合、パーティションキーは不要です。必要な場合でも、通常は月単位より細かい粒度のパーティションキーは必要ありません。パーティショニングはクエリを高速化しません(ORDER BY式とは対照的です)。過度に細かい粒度のパーティショニングは使用しないでください。クライアント識別子や名前でデータをパーティション分割しないでください(代わりに、クライアント識別子または名前をORDER BY式の最初の列として指定してください)。

月単位でパーティション分割するには、`toYYYYMM(date_column)`式を使用します。ここで`date_column`は[Date](/sql-reference/data-types/date.md)型の日付列です。パーティション名は`"YYYYMM"`形式になります。


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。


## 設定 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 存在しないファイルから空のデータを選択することを許可します。デフォルトでは無効です。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - フォーマットにサフィックスがある場合、挿入ごとに新しいファイルを作成することを許可します。デフォルトでは無効です。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - ストレージファイルからデータを読み取る方法。`read`、`pread`、`mmap`のいずれかを指定します。mmapメソッドはclickhouse-serverには適用されません（clickhouse-local用です）。デフォルト値：clickhouse-serverでは`pread`、clickhouse-localでは`mmap`。
