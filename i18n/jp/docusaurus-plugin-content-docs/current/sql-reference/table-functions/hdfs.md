---
'description': 'HDFS のファイルからテーブルを作成します。このテーブル関数は、url および file テーブル関数に似ています。'
'sidebar_label': 'hdfs'
'sidebar_position': 80
'slug': '/sql-reference/table-functions/hdfs'
'title': 'hdfs'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfs テーブル関数

HDFS内のファイルからテーブルを作成します。このテーブル関数は、[url](../../sql-reference/table-functions/url.md)および[file](../../sql-reference/table-functions/file.md)テーブル関数に似ています。

## 構文 {#syntax}

```sql
hdfs(URI, format, structure)
```

## 引数 {#arguments}

| 引数       | 説明                                                                                                                                                                  |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URI`      | HDFS内のファイルへの相対URI。ファイルへのパスは、読み取り専用モードで以下のグロブをサポートします：`*`, `?`, `{abc,def}`および`{N..M}`、ここで`N`、`M`は数字、`'abc'`, `'def'`は文字列です。 |
| `format`   | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                  |
| `structure`| テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'` です。                                                                             |

## 戻り値 {#returned_value}

指定された構造のテーブルが、指定されたファイルからデータを読み書きするために返されます。

**例**

`hdfs://hdfs1:9000/test` のテーブルと、そこから最初の2行を選択します：

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

パスはグロブを使用できます。ファイルは、接尾辞や接頭辞だけでなく、全パスパターンに一致する必要があります。

- `*` — `/`を除く任意の多くの文字を表し、空文字列を含みます。
- `**` — フォルダーの中のすべてのファイルを再帰的に表します。
- `?` — 任意の単一の文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかに置き換えます。文字列は`/`記号を含むことができます。
- `{N..M}` — `>= N` および `<= M` の任意の数を表します。

`{}`を用いた構文は、[remote](remote.md)および[file](file.md)テーブル関数に似ています。

**例**

1. HDFS上に次のURIsを持ついくつかのファイルがあるとします：

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2. これらのファイルの行数をクエリします：

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. これらの2つのディレクトリ内のすべてのファイルの行数をクエリします：

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭ゼロを持つ番号範囲が含まれる場合は、各桁ごとに波括弧で構成を使用するか、`?`を使用してください。
:::

**例**

`file000`, `file001`, ... , `file999` という名前のファイルからデータをクエリします：

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` になります。

## use_hive_partitioning 設定 {#hive-style-partitioning}

`use_hive_partitioning` の設定が1に設定されている場合、ClickHouseはパス内のHiveスタイルのパーティショニング（`/name=value/`）を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようになります。これらの仮想カラムは、パーティションされたパスと同じ名前を持ちますが、`_`で始まります。

**例**

Hiveスタイルのパーティショニングで作成された仮想カラムを使用する

```sql
SELECT * FROM HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## ストレージ設定 {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットにサフィックスがある場合に、各挿入時に新しいファイルを作成することを許可します。デフォルトでは無効です。
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り中に空のファイルをスキップすることを許可します。デフォルトでは無効です。

## 関連 {#related}

- [仮想カラム](../../engines/table-engines/index.md#table_engines-virtual_columns)
