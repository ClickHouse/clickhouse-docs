---
slug: /sql-reference/table-functions/hdfs
sidebar_position: 80
sidebar_label: 'hdfs'
title: 'hdfs'
description: 'HDFS のファイルからテーブルを作成します。このテーブル関数は、url および file のテーブル関数に似ています。'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfs テーブル関数

HDFS のファイルからテーブルを作成します。このテーブル関数は、[url](../../sql-reference/table-functions/url.md) および [file](../../sql-reference/table-functions/file.md) テーブル関数に似ています。

``` sql
hdfs(URI, format, structure)
```

**入力パラメータ**

- `URI` — HDFS 内のファイルへの相対 URI。ファイルパスは、読み取り専用モードで以下のグロブをサポートします: `*`, `?`, `{abc,def}` および `{N..M}` ただし、ここで `N`, `M` は数値、\``'abc', 'def'` は文字列です。
- `format` — ファイルの[フォーマット](/sql-reference/formats)。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'` です。

**返される値**

指定された構造のテーブルが、指定されたファイルからのデータの読み取りまたは書き込みのために返されます。

**例**

`hdfs://hdfs1:9000/test` からのテーブルおよびその最初の 2 行の選択:

``` sql
SELECT *
FROM hdfs('hdfs://hdfs1:9000/test', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2
```

``` text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

## パスにおけるグロブ {#globs_in_path}

パスはグロブを使用できます。ファイルは、サフィックスやプレフィックスだけでなく、完全なパスパターンに一致する必要があります。

- `*` — `/` を除く任意の文字を表し、空文字列も含まれます。
- `**` — フォルダ内のすべてのファイルを再帰的に表します。
- `?` — 任意の単一の文字を表します。
- `{some_string,another_string,yet_another_one}` — 任意の文字列 `'some_string', 'another_string', 'yet_another_one'` を置き換えます。文字列は `/` シンボルを含むことができます。
- `{N..M}` — 任意の数値 `>= N` および `<= M` を表します。

`{}` を使用した構文は、[remote](remote.md) および [file](file.md) テーブル関数に似ています。

**例**

1. HDFS 上に以下の URI を持ついくつかのファイルがあるとします:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2. これらのファイルの行数をクエリします:

<!-- -->

``` sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. これらの 2 つのディレクトリのすべてのファイルの行数をクエリします:

<!-- -->

``` sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭にゼロのある数値範囲が含まれる場合は、各桁ごとに波括弧構文を使うか、`?` を使用してください。
:::

**例**

`file000`, `file001`, ... , `file999` という名のファイルからデータをクエリします:

``` sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` とします。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` とします。

## Hive スタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` が 1 に設定されている場合、ClickHouse はパス内の Hive スタイルのパーティショニングを検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション化されたパスと同じ名前ですが、`_` で始まります。

**例**

Hive スタイルのパーティショニングで作成された仮想カラムを使用します。

``` sql
SELECT * from HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットにサフィックスがある場合、挿入ごとに新しいファイルを作成することを許可します。デフォルトでは無効です。
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。

**関連情報**

- [仮想カラム](../../engines/table-engines/index.md#table_engines-virtual_columns)
