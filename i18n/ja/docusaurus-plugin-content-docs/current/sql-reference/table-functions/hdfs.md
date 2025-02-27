---
slug: /sql-reference/table-functions/hdfs
sidebar_position: 80
sidebar_label: hdfs
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# hdfs

HDFS内のファイルからテーブルを作成します。このテーブル関数は、[url](../../sql-reference/table-functions/url.md)や[file](../../sql-reference/table-functions/file.md)と似ています。

``` sql
hdfs(URI, format, structure)
```

**入力パラメータ**

- `URI` — HDFS内のファイルへの相対URI。ファイルパスは、読み取り専用モードの以下のグロブをサポートします: `*`, `?`, `{abc,def}` および `{N..M}` で、ここで `N`, `M` は数字、\``'abc', 'def'` は文字列です。
- `format` — ファイルの[フォーマット](../../interfaces/formats.md#formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定された構造を持つテーブルで、指定されたファイルからデータを読み取ったり書き込んだりします。

**例**

`hdfs://hdfs1:9000/test` から作成したテーブルと、そこから最初の2行を選択します：

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

パスはグロビングを使用できます。ファイルは、サフィックスやプレフィックスだけでなく、パスパターン全体と一致する必要があります。

- `*` — `/` を除く任意の文字数を表し、空の文字列も含まれます。
- `**` — フォルダー内のすべてのファイルを再帰的に表します。
- `?` — 任意の単一文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかを置き換えます。文字列には `/` シンボルを含めることができます。
- `{N..M}` — 数字 `>= N` および `<= M` のいずれかを表します。

`{}` を用いた構文は、[remote](remote.md)および[file](file.md)テーブル関数に似ています。

**例**

1.  HDFS上に以下のURIを持ついくつかのファイルがあると仮定します：

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  これらのファイルの行数をクエリします：

``` sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  これら2つのディレクトリ内のすべてのファイルの行数をクエリします：

``` sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
もしファイルのリストに先頭ゼロのある数字範囲が含まれている場合は、各数字に対してブレースを使った構文を使用するか、`?` を使用してください。
:::

**例**

`file000`, `file001`, ... , `file999` という名前のファイルからデータをクエリします：

``` sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` が1に設定されている場合、ClickHouseはパス内のHiveスタイルのパーティショニングを検出し（`/name=value/`）、クエリ内でパーティションカラムを仮想カラムとして使用可能にします。これらの仮想カラムは、パーティション化されたパスと同じ名前を持ちますが、先頭に `_` が付きます。

**例**

Hiveスタイルのパーティショニングを使用して作成された仮想カラムを使用します。

``` sql
SELECT * from HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - 形式にサフィックスがある場合、各挿入ごとに新しいファイルを作成することを許可します。デフォルトでは無効です。
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [ignore_access_denied_multidirectory_globs](/operations/settings/settings.md#ignore_access_denied_multidirectory_globs) - マルチディレクトリグロブに対する権限拒否エラーを無視することを許可します。

**関連項目**

- [仮想カラム](../../engines/table-engines/index.md#table_engines-virtual_columns)
