---
description: 'HDFS内のファイルからテーブルを作成します。このテーブル関数は、urlおよびfileのテーブル関数に似ています。'
sidebar_label: 'hdfs'
sidebar_position: 80
slug: /sql-reference/table-functions/hdfs
title: 'hdfs'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfsテーブル関数

HDFS内のファイルからテーブルを作成します。このテーブル関数は、[url](../../sql-reference/table-functions/url.md)および[file](../../sql-reference/table-functions/file.md)のテーブル関数に似ています。

```sql
hdfs(URI, format, structure)
```

**入力パラメータ**

- `URI` — HDFS内のファイルへの相対URI。ファイルパスは、読み取り専用モードで以下のグロブをサポートします: `*`, `?`, `{abc,def}`および`{N..M}`、ここで`N`、`M`は数値、\``'abc', 'def'`は文字列です。
- `format` — ファイルの[フォーマット](/sql-reference/formats)。
- `structure` — テーブルの構造。フォーマットは`'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定された構造を持つテーブルを返します。指定されたファイル内のデータを読み書きするために使用されます。

**例**

`hdfs://hdfs1:9000/test`からテーブルを作成し、最初の2行を選択します：

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

パスにはグロビングを使用できます。ファイルは、サフィックスやプレフィックスだけでなく、全体のパスパターンと一致する必要があります。

- `*` — `/`を除く任意の文字を表しますが、空文字列も含みます。
- `**` — フォルダ内のすべてのファイルを再帰的に表します。
- `?` — 任意の単一の文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列`'some_string', 'another_string', 'yet_another_one'`のいずれかを置き換えます。文字列には`/`記号を含めることができます。
- `{N..M}` — 任意の数`>= N`および`<= M`を表します。

`{}`を使用した構文は、[remote](remote.md)および[file](file.md)のテーブル関数に似ています。

**例**

1. HDFSに次のURIを持つ複数のファイルがあるとします：

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2. これらのファイル内の行数をクエリします：

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. これらの2つのディレクトリのすべてのファイル内の行数をクエリします：

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭ゼロを含む数値範囲がある場合は、各数字を別々に囲む構文を使用するか、`?`を使用してください。
:::

**例**

`file000`, `file001`, ... , `file999`という名前のファイルからデータをクエリします：

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト）。タイプ: `Nullable(UInt64)`。サイズが不明な場合は、値は`NULL`です。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合は、値は`NULL`です。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning`を1に設定すると、ClickHouseはパス内のHiveスタイルのパーティショニングを検出し（`/name=value/`）、クエリ内でパーティションカラムを仮想カラムとして使用できるようになります。これらの仮想カラムは、パーティショニングされたパスと同じ名前ですが、`_`で始まります。

**例**

Hiveスタイルのパーティショニングで作成された仮想カラムを使用します：

```sql
SELECT * from HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り捨てることを許可します。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットにサフィックスがある場合、毎回新しいファイルを作成することを許可します。デフォルトでは無効です。
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。

**関連事項**

- [仮想カラム](../../engines/table-engines/index.md#table_engines-virtual_columns)
