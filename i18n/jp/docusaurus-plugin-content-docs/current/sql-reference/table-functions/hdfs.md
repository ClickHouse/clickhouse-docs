---
description: 'Creates a table from files in HDFS. This table function is similar
  to the url and file table functions.'
sidebar_label: 'HDFS'
sidebar_position: 80
slug: '/sql-reference/table-functions/hdfs'
title: 'HDFS'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfs テーブル関数

HDFS 内のファイルからテーブルを作成します。このテーブル関数は、[url](../../sql-reference/table-functions/url.md) および [file](../../sql-reference/table-functions/file.md) テーブル関数に似ています。

## 構文 {#syntax}

```sql
hdfs(URI, format, structure)
```

## 引数 {#arguments}

| 引数      | 説明                                                                                                                                                                 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URI`     | HDFS 内のファイルへの相対 URI。ファイルへのパスは、読み取り専用モードで次のグロブをサポートします: `*`, `?`, `{abc,def}` および `{N..M}`（ここで `N` と `M` は数字、 `'abc', 'def'` は文字列）。 |
| `format`  | ファイルの [format](/sql-reference/formats)。                                                                                                                                 |
| `structure`| テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'` です。                                                                           |

## 戻り値 {#returned_value}

指定された構造のテーブルが、指定されたファイルのデータを読み書きするために返されます。

**例**

`hdfs://hdfs1:9000/test` からのテーブルと、その最初の 2 行の選択：

```sql
SELECT *
FROM hdfs('hdfs://hdfs1:9000/test', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

## パス内のグロブ {#globs_in_path}

パスはグロビングを使用することができます。ファイルは、サフィックスやプレフィックスだけでなく、全パスパターンに一致する必要があります。

- `*` — `/` を除く任意の文字を任意の数（空文字を含む）を表します。
- `**` — フォルダー内の全ファイルを再帰的に表します。
- `?` — 任意の 1 文字を表します。
- `{some_string,another_string,yet_another_one}` — `'some_string', 'another_string', 'yet_another_one'` のいずれかの文字列に置き換えます。文字列には `/` シンボルを含めることができます。
- `{N..M}` — `>= N` かつ `<= M` の任意の数を表します。

`{}` を含む構文は、[remote](remote.md) および [file](file.md) テーブル関数に似ています。

**例**

1.  HDFS 上に次の URI のいくつかのファイルがあるとします：

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  これらのファイルの行数をクエリします：

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  これらの 2 つのディレクトリ内のすべてのファイルの行数をクエリします：

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭ゼロのある数値範囲が含まれている場合は、各桁を別々に波括弧を使って構文を使用するか、`?` を使用してください。
:::

**例**

`file000`, `file001`, ... , `file999` というファイルからデータをクエリします：

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合の値は `NULL` です。
- `_time` — ファイルの最終変更時間。型: `Nullable(DateTime)`。時間が不明な場合の値は `NULL` です。

## Hive スタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` が 1 に設定されている場合、ClickHouse はパス内の Hive スタイルのパーティショニング（`/name=value/`）を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティションのパスと同じ名前を持ちますが、先頭に `_` が付いています。

**例**

Hive スタイルのパーティショニングを使用して作成された仮想カラムを使用する：

```sql
SELECT * from HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入する前にファイルを切り捨てることができます。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - 各挿入時にサフィックスを持つフォーマットで新しいファイルを作成できます。デフォルトでは無効です。
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 読み込み中に空のファイルをスキップできます。デフォルトでは無効です。

## 関連 {#related}

- [仮想カラム](../../engines/table-engines/index.md#table_engines-virtual_columns)
