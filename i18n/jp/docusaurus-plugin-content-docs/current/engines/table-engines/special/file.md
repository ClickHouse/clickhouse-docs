---
'description': 'ファイルテーブルエンジンは、データをサポートされたファイル形式のいずれか（`TabSeparated`、`Native`など）でファイルに保持します。'
'sidebar_label': 'ファイル'
'sidebar_position': 40
'slug': '/engines/table-engines/special/file'
'title': 'ファイルテーブルエンジン'
'doc_type': 'reference'
---


# `File` テーブルエンジン

File テーブルエンジンは、サポートされている [ファイル形式](/interfaces/formats#formats-overview) (`TabSeparated`, `Native`, など) のいずれかのファイルにデータを保持します。

使用シナリオ:

- ClickHouse からファイルへのデータエクスポート。
- データを別の形式に変換する。
- ディスク上のファイルを編集して ClickHouse のデータを更新する。

:::note
このエンジンは現在 ClickHouse Cloud では利用できませんので、[代わりに S3 テーブル関数を使用してください](/sql-reference/table-functions/s3.md)。
:::

## ClickHouse サーバーでの使用 {#usage-in-clickhouse-server}

```sql
File(Format)
```

`Format` パラメータは、使用可能なファイル形式のいずれかを指定します。 `SELECT` クエリを実行するためには、形式が入力用である必要があり、`INSERT` クエリを実行するためには出力用である必要があります。使用可能な形式は、[Formats](/interfaces/formats#formats-overview) セクションに一覧されています。

ClickHouse では `File` のファイルシステムパスを指定することはできません。サーバー構成の [path](../../../operations/server-configuration-parameters/settings.md) 設定で定義されたフォルダーを使用します。

`File(Format)` を使用してテーブルを作成すると、そのフォルダーに空のサブディレクトリが作成されます。そのテーブルにデータが書き込まれると、そのサブディレクトリ内の `data.Format` ファイルに保存されます。

このサブフォルダーとファイルを手動でサーバーのファイルシステムに作成し、対応する名称でテーブル情報に [ATTACH](../../../sql-reference/statements/attach.md) することで、そのファイルからデータをクエリできます。

:::note
この機能には注意が必要です。なぜなら、ClickHouse はそのようなファイルに対する外部の変更を追跡しないからです。ClickHouse と外部からの同時書き込みの結果は未定義です。
:::

## 例 {#example}

**1.** `file_engine_table` テーブルを設定する:

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

デフォルトでは、ClickHouse は `/var/lib/clickhouse/data/default/file_engine_table` フォルダーを作成します。

**2.** `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` を手動で作成し、次の内容を含める：

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

## ClickHouse-local での使用 {#usage-in-clickhouse-local}

[clickhouse-local](../../../operations/utilities/clickhouse-local.md) では、File エンジンは `Format` に加えてファイルパスを受け入れます。デフォルトの入力/出力ストリームは、`0` や `stdin`、`1` や `stdout` といった数値または人間が読みやすい名前を使用して指定できます。追加のエンジンパラメータやファイル拡張子 (`gz`, `br`, または `xz`) に基づいて、圧縮ファイルを読み書きすることが可能です。

**例:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 実装の詳細 {#details-of-implementation}

- 複数の `SELECT` クエリを同時に実行できますが、`INSERT` クエリは互いに待機します。
- `INSERT` クエリによって新しいファイルを作成することがサポートされています。
- ファイルが存在する場合、`INSERT` は新しい値をそのファイルに追加します。
- サポートされていない:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - インデックス
  - レプリケーション

## PARTITION BY {#partition-by}

`PARTITION BY` — 任意です。パーティションキーでデータをパーティション化して、別々のファイルを作成できます。ほとんどの場合、パーティションキーは必要ありません。必要な場合でも、通常は月単位でのそれ以上の詳細なパーティションキーは必要ありません。パーティション化はクエリの速度を上げることはありません（ORDER BY式とは対照的です）。非常に詳細なパーティション化は決して使用しないでください。クライアントの識別子や名称でデータをパーティション化しないでください（代わりに、クライアントの識別子や名称を ORDER BY 式の最初のカラムにしてください）。

月単位でのパーティション化には、`toYYYYMM(date_column)` 式を使用します。ここで、`date_column` は [Date](/sql-reference/data-types/date.md) 型の日付を持つカラムです。ここでのパーティション名は `"YYYYMM"` 形式です。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、その値は `NULL` です。
- `_time` — ファイルの最終更新時間。タイプ: `Nullable(DateTime)`。時間が不明な場合、その値は `NULL` です。

## 設定 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 存在しないファイルから空のデータを選択できるようにします。デフォルトでは無効です。
- [engine_file_truncate_on_insert](/operations/settings/settings.md#engine_file_truncate_on_insert) - 挿入する前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - フォーマットにサフィックスがある場合、各挿入で新しいファイルを作成できるようにします。デフォルトでは無効です。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 読み込み時に空のファイルをスキップできるようにします。デフォルトでは無効です。
- [storage_file_read_method](/operations/settings/settings.md#engine_file_empty_if_not_exists) - ストレージファイルからデータを読み取る方法。選択肢: `read`, `pread`, `mmap`。mmap 方法は clickhouse-server には適用されません（clickhouse-local 用です）。デフォルト値: ClickHouse サーバー用に `pread`、ClickHouse-local 用に `mmap`。
