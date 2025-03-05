---
slug: /sql-reference/table-functions/file
sidebar_position: 60
sidebar_label: file
title: "file"
description: "ファイルからのSELECTおよびINSERTのためのテーブルのようなインターフェイスを提供するテーブルエンジン。 s3テーブル関数に似ています。ローカルファイルを扱う際には`file()`を使用し、S3、GCS、またはMinIOのようなオブジェクトストレージのバケットを扱うときには`s3()`を使用します。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# file テーブル関数

ファイルからのSELECTおよびINSERTのためのテーブルのようなインターフェイスを提供するテーブルエンジンで、[s3](/sql-reference/table-functions/url.md)テーブル関数に似ています。ローカルファイルを扱う際には`file()`を使用し、S3、GCS、またはMinIOのようなオブジェクトストレージのバケットを扱うときには`s3()`を使用します。

`file`関数は、ファイルから読み取るかファイルに書き込むために`SELECT`および`INSERT`クエリで使用できます。

**構文**

``` sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

**パラメータ**

- `path` — [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path)からのファイルへの相対パス。読み取り専用モードで、次の[グロブ](#globs-in-path)をサポートします：`*`、`?`、`{abc,def}`（`'abc'`および`'def'`が文字列）および`{N..M}`（`N`および`M`が数字）。
- `path_to_archive` - zip/tar/7zアーカイブへの相対パス。`path`と同じグロブをサポートします。
- `format` — ファイルの[形式](interfaces/formats.md#formats)。
- `structure` — テーブルの構造。フォーマット：`'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — `SELECT`クエリで使用されるときは既存の圧縮タイプ、`INSERT`クエリで使用されるときは希望の圧縮タイプ。サポートされている圧縮タイプは`gz`、`br`、`xz`、`zst`、`lz4`、および`bz2`です。

**返される値**

ファイル内のデータを読み取るまたは書き込むためのテーブル。

## ファイルへの書き込み例 {#examples-for-writing-to-a-file}

### TSVファイルへの書き込み {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

結果として、データはファイル`test.tsv`に書き込まれます：

```bash

# cat /var/lib/clickhouse/user_files/test.tsv
1	2	3
3	2	1
1	3	2
```

### 複数のTSVファイルへのパーティション書き込み {#partitioned-write-to-multiple-tsv-files}

テーブル関数`file()`にデータを挿入する際に`PARTITION BY`式を指定すると、各パーティションに対して別々のファイルが作成されます。データを別々のファイルに分割することで、読み取り操作のパフォーマンスが向上します。

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

結果として、データは三つのファイルに書き込まれます：`test_1.tsv`、`test_2.tsv`、および`test_3.tsv`。

```bash

# cat /var/lib/clickhouse/user_files/test_1.tsv
3	2	1


# cat /var/lib/clickhouse/user_files/test_2.tsv
1	3	2


# cat /var/lib/clickhouse/user_files/test_3.tsv
1	2	3
```

## ファイルからの読み取り例 {#examples-for-reading-from-a-file}

### CSVファイルからのSELECT {#select-from-a-csv-file}

まず、サーバー設定で`user_files_path`を設定し、`test.csv`ファイルを準備します：

``` bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

次に、`test.csv`からデータをテーブルに読み込み、最初の二行を選択します：

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

`archive1.zip`または`archive2.zip`にある`table.csv`からデータを読み取る：

``` sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```

## パス内のグロブ {#globs-in-path}

パスはグロビングを使用できます。ファイルは全体のパスパターンに一致する必要があり、接尾辞や接頭辞のみでの一致はできません。唯一の例外は、パスが既存のディレクトリを指し、グロブを使用していない場合、パスに暗黙的に`*`が追加され、ディレクトリ内のすべてのファイルが選択されることです。

- `*` — `/`を除く任意の文字数を表し、空文字列も含まれます。
- `?` — 任意の1文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列`'some_string', 'another_string', 'yet_another_one'`のいずれかに置き換えます。文字列には`/`記号を含めることができます。
- `{N..M}` — 数値`>= N`かつ`<= M`を表します。
- `**` - フォルダー内のすべてのファイルを再帰的に表します。

`{}`を使用した構文は、[remote](remote.md)および[hdfs](hdfs.md)テーブル関数と似ています。

**例**

次の相対パスを持つファイルがあります：

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

すべてのファイルの行数をクエリ：

``` sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

同じことを達成する別のパス表現：

``` sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

暗黙の`*`を使用して`some_dir`の全行数をクエリ：

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
ファイルのリストに先頭ゼロの範囲が含まれる場合、各数字のために波かっこを使った構文を使用するか、`?`を使用してください。
:::

**例**

`file000`、`file001`、...、`file999`という名前のファイルの行数をクエリ：

``` sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**例**

`big_dir/`ディレクトリ内のすべてのファイルの行数を再帰的にクエリ：

``` sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**例**

`big_dir/`の任意のフォルダー内のすべてのファイル`file002`の行数を再帰的にクエリ：

``` sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型：`LowCardinality(String)`。
- `_file` — ファイルの名前。型：`LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型：`Nullable(UInt64)`。ファイルサイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終修正時間。型：`Nullable(DateTime)`。時間が不明な場合、値は`NULL`です。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning`を1に設定すると、ClickHouseはパス内のHiveスタイルのパーティショニングを検出し（`/name=value/`）、クエリ内でパーティションカラムを仮想カラムとして使用できるようになります。これらの仮想カラムは、パーティショニングされたパス内で同じ名前を持ちますが、`_`で始まります。

**例**

Hiveスタイルのパーティショニングで作成された仮想カラムを使用：

``` sql
SELECT * from file('data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 設定 {#settings}

- [engine_file_empty_if_not_exists](operations/settings/settings.md#engine-file-empty_if-not-exists) - 存在しないファイルから空のデータを選択できるようにします。デフォルトでは無効。
- [engine_file_truncate_on_insert](operations/settings/settings.md#engine-file-truncate-on-insert) - 挿入の前にファイルを切り詰めることを許可します。デフォルトでは無効。
- [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) - フォーマットにサフィックスがある場合、各挿入で新しいファイルを作成できるようにします。デフォルトでは無効。
- [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files) - 読み取り時に空のファイルをスキップできるようにします。デフォルトでは無効。
- [storage_file_read_method](operations/settings/settings.md#engine-file-empty_if-not-exists) - ストレージファイルからのデータ読み取り方法のうちの一つ：read、pread、mmap（clickhouse-localのみ）。デフォルト値：`pread`はclickhouse-server用、`mmap`はclickhouse-local用。

**関連項目**

- [仮想カラム](engines/table-engines/index.md#table_engines-virtual_columns)
- [処理後のファイル名の変更](operations/settings/settings.md#rename_files_after_processing)
