---
slug: /sql-reference/table-functions/hdfs
sidebar_position: 80
sidebar_label: hdfs
title: "hdfs"
description: "HDFSのファイルからテーブルを作成します。このテーブル関数は、urlテーブル関数やfileテーブル関数と似ています。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfs テーブル関数

HDFSのファイルからテーブルを作成します。このテーブル関数は、[url](../../sql-reference/table-functions/url.md)および[file](../../sql-reference/table-functions/file.md)テーブル関数に似ています。

``` sql
hdfs(URI, format, structure)
```

**入力パラメータ**

- `URI` — HDFSのファイルに対する相対URI。ファイルのパスは、読み取り専用モードで以下のグロブをサポートします：`*`、`?`、`{abc,def}` および `{N..M}` どこで `N`、`M` — 数字、 \``'abc', 'def'` — 文字列。
- `format` — ファイルの [フォーマット](../../interfaces/formats.md#formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定された構造に基づいてデータを読み書きするためのテーブル。

**例**

`hdfs://hdfs1:9000/test`からのテーブルとその最初の2行の選択：

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

## パス内のグロブ {#globs_in_path}

パスはグロビングを使用できます。ファイルは、サフィックスやプレフィックスだけでなく、全体のパスパターンに一致する必要があります。

- `*` — `/` を除く任意の数の文字を表し、空文字列も含む。
- `**` — フォルダー内のすべてのファイルを再帰的に表します。
- `?` — 任意の単一の文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかを置き換えます。文字列は `/` 記号を含むことができます。
- `{N..M}` — 数字 `>= N` および `<= M` を表します。

`{}`を使用した構文は、[remote](remote.md)および[file](file.md)テーブル関数に似ています。

**例**

1. HDFS上に次のURIを持ついくつかのファイルがあるとします：

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2. これらのファイルの行数をクエリします：

<!-- -->

``` sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. これらの2つのディレクトリ内のすべてのファイルの行数をクエリします：

<!-- -->

``` sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭がゼロの数字の範囲が含まれる場合は、各桁について中括弧を使った構造を使用するか、`?`を使用してください。
:::

**例**

`file000`、`file001`、...、`file999`という名前のファイルからデータをクエリします：

``` sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルのパス。タイプ：`LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ：`LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ：`Nullable(UInt64)`。サイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終更新時刻。タイプ：`Nullable(DateTime)`。時刻が不明な場合、値は`NULL`です。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` が 1 に設定されている場合、ClickHouseはパス内のHiveスタイルのパーティショニング (`/name=value/`) を検出し、クエリ内でパーティションカラムを仮想カラムとして使用可能にします。これらの仮想カラムは、パーティションされたパスと同じ名前を持ちますが、`_` で始まります。

**例**

Hiveスタイルのパーティショニングで作成された仮想カラムを使用：

``` sql
SELECT * from HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り捨てることを可能にします。デフォルトでは無効。
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットにサフィックスがある場合、挿入ごとに新しいファイルを作成することを可能にします。デフォルトでは無効。
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り中に空のファイルをスキップすることを可能にします。デフォルトでは無効。
- [ignore_access_denied_multidirectory_globs](operations/settings/settings.md#ignore_access_denied_multidirectory_globs) - 複数のディレクトリのグロブに対するアクセス拒否エラーを無視することを可能にします。

**関連項目**

- [仮想カラム](../../engines/table-engines/index.md#table_engines-virtual_columns)
