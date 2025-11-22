---
description: 'HDFS 上のファイルからテーブルを作成します。このテーブル関数は url および file テーブル関数と同様です。'
sidebar_label: 'hdfs'
sidebar_position: 80
slug: /sql-reference/table-functions/hdfs
title: 'hdfs'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfs テーブル関数

HDFS上のファイルからテーブルを作成します。このテーブル関数は、[url](../../sql-reference/table-functions/url.md) および [file](../../sql-reference/table-functions/file.md) テーブル関数と同様のものです。



## 構文 {#syntax}

```sql
hdfs(URI, format, structure)
```


## 引数 {#arguments}

| 引数    | 説明                                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `URI`       | HDFS内のファイルへの相対URI。読み取り専用モードでは、ファイルパスに次のグロブパターンを使用できます：`*`、`?`、`{abc,def}`、`{N..M}`（`N`、`M`は数値、`'abc'`、`'def'`は文字列）。 |
| `format`    | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                   |
| `structure` | テーブルの構造。形式：`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                       |


## 戻り値 {#returned_value}

指定されたファイル内のデータを読み書きするための、指定された構造を持つテーブル。

**例**

`hdfs://hdfs1:9000/test` からのテーブルと、その最初の2行を選択する例:

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

パスにはグロブを使用できます。ファイルは接尾辞や接頭辞だけでなく、パスパターン全体に一致する必要があります。

- `*` — `/`を除く任意の数の文字を表します(空文字列を含む)。
- `**` — フォルダ内のすべてのファイルを再帰的に表します。
- `?` — 任意の1文字を表します。
- `{some_string,another_string,yet_another_one}` — `'some_string'`、`'another_string'`、`'yet_another_one'`のいずれかの文字列に置換されます。文字列には`/`記号を含めることができます。
- `{N..M}` — `>= N`かつ`<= M`の任意の数値を表します。

`{}`を使用した構文は、[remote](remote.md)および[file](file.md)テーブル関数と同様です。

**例**

1.  HDFS上に以下のURIを持つ複数のファイルがあるとします:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  これらのファイルの行数をクエリします:

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  これら2つのディレクトリ内のすべてのファイルの行数をクエリします:

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭ゼロ付きの数値範囲が含まれる場合は、各桁に対して個別に中括弧を使用した構文を使用するか、`?`を使用してください。
:::

**例**

`file000`、`file001`、...、`file999`という名前のファイルからデータをクエリします:

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。


## use_hive_partitioning 設定 {#hive-style-partitioning}

`use_hive_partitioning` 設定を 1 に設定すると、ClickHouse はパス内の Hive スタイルのパーティショニング(`/name=value/`)を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション化されたパス内と同じ名前を持ちますが、先頭に `_` が付きます。

**例**

Hive スタイルのパーティショニングで作成された仮想カラムを使用する

```sql
SELECT * FROM HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰めます。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットに接尾辞がある場合、挿入ごとに新しいファイルを作成します。デフォルトでは無効です。
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り時に空のファイルをスキップします。デフォルトでは無効です。


## 関連項目 {#related}

- [仮想カラム](../../engines/table-engines/index.md#table_engines-virtual_columns)
