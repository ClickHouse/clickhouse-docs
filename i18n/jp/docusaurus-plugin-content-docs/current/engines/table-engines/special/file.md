---
description: 'The File table engine keeps the data in a file in one of the supported
  file formats (`TabSeparated`, `Native`, etc.).'
sidebar_label: 'File'
sidebar_position: 40
slug: '/engines/table-engines/special/file'
title: 'File テーブルエンジン'
---




# File Table Engine

Fileテーブルエンジンは、サポートされている[ファイルフォーマット](/interfaces/formats#formats-overview)のいずれか（`TabSeparated`、`Native`など）でファイルにデータを保持します。

使用シナリオ：

- ClickHouseからファイルへのデータエクスポート。
- データを別のフォーマットに変換。
- ディスク上のファイルを編集してClickHouseのデータを更新。

:::note
このエンジンは現在ClickHouse Cloudで使用できませんので、[S3テーブル関数を使用してください](/sql-reference/table-functions/s3.md)。
:::

## ClickHouseサーバーでの使用 {#usage-in-clickhouse-server}

```sql
File(Format)
```

`Format`パラメータは、利用可能なファイルフォーマットの1つを指定します。`SELECT`クエリを実行するには、フォーマットが入力をサポートしている必要があり、`INSERT`クエリを実行するには、出力をサポートしている必要があります。利用可能なフォーマットは、[Formats](/interfaces/formats#formats-overview)セクションにリストされています。

ClickHouseは`File`のためにファイルシステムのパスを指定することを許可しません。サーバー設定の[path](../../../operations/server-configuration-parameters/settings.md)設定で定義されたフォルダーを使用します。

`File(Format)`を使用してテーブルを作成すると、そのフォルダーに空のサブディレクトリが作成されます。そのテーブルにデータが書き込まれると、そのサブディレクトリ内の`data.Format`ファイルに配置されます。

このサブフォルダーとファイルを手動でサーバーファイルシステム内に作成し、対応する名前のテーブル情報に[ATTACH](../../../sql-reference/statements/attach.md)することで、そのファイルからデータをクエリすることができます。

:::note
この機能には注意が必要です。ClickHouseはそのようなファイルへの外部変更を追跡しません。ClickHouse外部と同時に書き込みを行う結果は未定義です。
:::

## 例 {#example}

**1.** `file_engine_table`テーブルを設定します：

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

デフォルトでは、ClickHouseはフォルダー`/var/lib/clickhouse/data/default/file_engine_table`を作成します。

**2.** 手動で`/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated`を作成し、次の内容を含めます：

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** データをクエリします：

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

[clickhouse-local](../../../operations/utilities/clickhouse-local.md)内で、Fileエンジンは`Format`に加えてファイルパスを受け付けます。デフォルトの入力/出力ストリームは、`0`や`stdin`、`1`や`stdout`のような数値または人間が読める名前を使用して指定できます。追加のエンジンパラメータまたはファイル拡張子（`gz`、`br`または`xz`）に基づいて圧縮ファイルを読み書きすることが可能です。

**例：**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 実装の詳細 {#details-of-implementation}

- 複数の`SELECT`クエリを同時に実行できますが、`INSERT`クエリは互いに待機します。
- `INSERT`クエリで新しいファイルの作成がサポートされています。
- ファイルが存在する場合、`INSERT`は新しい値を追加します。
- サポートされていないもの：
    - `ALTER`
    - `SELECT ... SAMPLE`
    - インデックス
    - レプリケーション

## PARTITION BY {#partition-by}

`PARTITION BY` — オプションです。パーティションキーでデータをパーティション化し、別々のファイルを作成することが可能です。ほとんどの場合、パーティションキーは必要ありませんが、必要な場合でも月単位でのパーティションキー以上の粒度は一般的には必要ありません。パーティション化はクエリの速度を向上させません（ORDER BY式とは対照的です）。粒度が細かすぎるパーティション化は行わないでください。クライアント識別子や名前でデータをパーティション化しないでください（その代わりに、ORDER BY式の最初のカラムにクライアント識別子または名前を設定してください）。

月ごとにパーティション化するには、`toYYYYMM(date_column)`式を使用します。ここで`date_column`は[Date](/sql-reference/data-types/date.md)タイプの日付を持つカラムです。ここでのパーティション名は`"YYYYMM"`形式です。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — バイト単位のファイルサイズ。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終変更時刻。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は`NULL`です。

## 設定 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 存在しないファイルから空のデータを選択できるようにします。デフォルトでは無効です。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 挿入前にファイルを切り詰めることを可能にします。デフォルトでは無効です。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - フォーマットにサフィックスがある場合、各挿入で新しいファイルを作成できるようにします。デフォルトでは無効です。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 読み込み中に空のファイルをスキップできるようにします。デフォルトでは無効です。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - ストレージファイルからデータを読み取る方法で、`read`、`pread`、`mmap`のいずれかです。mmap方法はclickhouse-serverには適用されません（clickhouse-local向けです）。デフォルト値：clickhouse-serverでは`pread`、clickhouse-localでは`mmap`です。
