---
slug: /sql-reference/table-functions/file
sidebar_position: 60
sidebar_label: file
title: 'file'
description: 'A table engine which provides a table-like interface to SELECT from and INSERT into files, similar to the s3 table function. Use `file()` when working with local files, and `s3()` when working with buckets in object storage such as S3, GCS, or MinIO.'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# file テーブル関数

ファイルから SELECT および INSERT を行うためのテーブルのようなインターフェースを提供するテーブルエンジンで、[s3](/sql-reference/table-functions/url.md) テーブル関数に類似しています。ローカルファイルを操作する場合は `file()` を使用し、S3、GCS、または MinIO などのオブジェクトストレージ内のバケットを操作する場合は `s3()` を使用します。

`file` 関数は、ファイルを読み書きするために `SELECT` および `INSERT` クエリで使用できます。

**構文**

``` sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

**パラメータ**

- `path` — [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path) からのファイルへの相対パス。以下の [グロブ](#globs-in-path) を読み取り専用モードでサポートします: `*`, `?`, `{abc,def}`（`'abc'` と `'def'` が文字列）、および `{N..M}`（`N` と `M` が数字）。
- `path_to_archive` - zip/tar/7z アーカイブへの相対パス。`path` と同じグロブをサポートします。
- `format` — ファイルの [フォーマット](/interfaces/formats)。
- `structure` — テーブルの構造。形式: `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — `SELECT` クエリで使用する場合の既存の圧縮タイプ、または `INSERT` クエリで使用する場合の希望する圧縮タイプ。サポートされている圧縮タイプは `gz`, `br`, `xz`, `zst`, `lz4`, および `bz2` です。

**戻り値**

ファイル内のデータを読み書きするためのテーブル。

## ファイルへの書き込みの例 {#examples-for-writing-to-a-file}

### TSV ファイルへの書き込み {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

その結果、データはファイル `test.tsv` に書き込まれます:

```bash

# cat /var/lib/clickhouse/user_files/test.tsv
1	2	3
3	2	1
1	3	2
```

### 複数 TSV ファイルへのパーティション書き込み {#partitioned-write-to-multiple-tsv-files}

`file()` タイプのテーブル関数にデータを挿入する際に `PARTITION BY` 式を指定すると、各パーティションのために別々のファイルが作成されます。データを別々のファイルに分割することで、読み取り操作のパフォーマンスが向上します。

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

その結果、データは `test_1.tsv`、`test_2.tsv`、および `test_3.tsv` の3つのファイルに書き込まれます。

```bash

# cat /var/lib/clickhouse/user_files/test_1.tsv
3	2	1


# cat /var/lib/clickhouse/user_files/test_2.tsv
1	3	2


# cat /var/lib/clickhouse/user_files/test_3.tsv
1	2	3
```

## ファイルからの読み込みの例 {#examples-for-reading-from-a-file}

### CSV ファイルからの SELECT {#select-from-a-csv-file}

まず、サーバー設定で `user_files_path` を設定し、ファイル `test.csv` を準備します。

``` bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

次に、`test.csv` からデータをテーブルに読み込み、その最初の2行を選択します。

``` sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

``` text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

### ファイルからテーブルへのデータ挿入 {#inserting-data-from-a-file-into-a-table}

``` sql
INSERT INTO FUNCTION
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1);
```
```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32');
```

``` text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

`archive1.zip` または `archive2.zip` にある `table.csv` からのデータを読み込みます。

``` sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```

## パスのグロブ {#globs-in-path}

パスはグロビングを使用できます。ファイルは全体のパスパターンに一致する必要があり、サフィックスやプレフィックスだけには一致できません。パスが既存のディレクトリを指し、グロブを使用しない場合、すべてのファイルが選択されるように、`*` が暗黙的にパスに追加されます。

- `*` —  `/` を除く任意の文字を表し、空文字列を含みます。
- `?` — 任意の単一の文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかに置き換えます。文字列には `/` 記号が含まれることがあります。
- `{N..M}` — `>= N` かつ `<= M` の任意の数字を表します。
- `**` — フォルダ内のすべてのファイルを再帰的に表します。

`{}` を含む構文は、[remote](remote.md) および [hdfs](hdfs.md) テーブル関数に類似しています。

**例**

次の相対パスを持つファイルがあります:

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

すべてのファイルの行数をクエリします。

``` sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

同じことを達成する別のパス表現:

``` sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

暗黙的な `*` を使って `some_dir` 内の総行数をクエリします。

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
ファイルのリストに先頭ゼロのある数値範囲が含まれている場合は、それぞれの数字に対してブレースの構文を使用するか、`?` を使用してください。
:::

**例**

ファイル名 `file000`、`file001`、...、`file999` の全ファイルの行数をクエリします。

``` sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**例**

ディレクトリ `big_dir/` 内のすべてのファイルの行数を再帰的にクエリします。

``` sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**例**

ディレクトリ `big_dir/` 内の任意のフォルダにある `file002` という名前のすべてのファイルの行数を再帰的にクエリします。

``` sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ: `LowCardinality(String)`。
- `_size` — バイト単位のファイルサイズ。タイプ: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時間。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。

## Hive スタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` が 1 に設定されている場合、ClickHouse はパス内の Hive スタイルのパーティショニング（`/name=value/`）を検出し、クエリ内でパーティションカラムを仮想カラムとして使用することを許可します。これらの仮想カラムは、パーティション化されたパスと同じ名前を持ちますが、`_` から始まります。

**例**

Hive スタイルのパーティショニングで作成された仮想カラムを使用します。

``` sql
SELECT * from file('data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 設定 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 存在しないファイルから空のデータを選択することを許可します。デフォルトでは無効です。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 挿入の前にファイルを切り詰めることを許可します。デフォルトでは無効です。
- [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) - フォーマットにサフィックスがある場合、毎回の挿入で新しいファイルを作成することを許可します。デフォルトでは無効です。
- [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files) - 読み取り中に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - ストレージファイルからのデータ読み取り方法。選択肢: read, pread, mmap (clickhouse-local のみ)。デフォルト値: clickhouse-server 用に `pread`、clickhouse-local 用に `mmap`。

**関連情報**

- [仮想カラム](engines/table-engines/index.md#table_engines-virtual_columns)
- [処理後のファイル名変更](operations/settings/settings.md#rename_files_after_processing)
