---
'description': 'A table engine which provides a table-like interface to SELECT from
  and INSERT into files, similar to the s3 table function. Use `file()` when working
  with local files, and `s3()` when working with buckets in object storage such as
  S3, GCS, or MinIO.'
'sidebar_label': 'file'
'sidebar_position': 60
'slug': '/sql-reference/table-functions/file'
'title': 'file'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# file Table Function

ファイルからSELECTおよびINSERTするためのテーブルのようなインターフェースを提供するテーブルエンジンで、[s3](/sql-reference/table-functions/url.md)テーブル関数に似ています。ローカルファイルを扱う際は`file()`を、S3、GCS、またはMinIOのようなオブジェクトストレージ内のバケットを扱う際は`s3()`を使用します。

`file`関数は、ファイルから読み取ったり書き込んだりするために、`SELECT`および`INSERT`クエリで使用できます。

## Syntax {#syntax}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

## Arguments {#arguments}

| パラメーター        | 説明                                                                                                                                                                                                                                                                                                     |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`            | [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path)からのファイルへの相対パス。読み取り専用モードで次の[グロブ](#globs-in-path)がサポートされています：`*`、`?`、`{abc,def}`（ここで`'abc'`および`'def'`は文字列）および`{N..M}`（ここで`N`および`M`は数値）。 |
| `path_to_archive` | zip/tar/7zアーカイブへの相対パス。`path`と同様のグロブがサポートされています。                                                                                                                                                                                                                      |
| `format`          | ファイルの[フォーマット](/interfaces/formats)。                                                                                                                                                                                                                                                                |
| `structure`       | テーブルの構造。フォーマット：`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                |
| `compression`     | `SELECT`クエリで使用される既存の圧縮タイプ、または`INSERT`クエリで使用される際の希望する圧縮タイプ。サポートされている圧縮タイプは`gz`、`br`、`xz`、`zst`、`lz4`、および`bz2`です。                                                                                                       |

## Returned value {#returned_value}

ファイル内のデータを読み書きするためのテーブルです。

## Examples for Writing to a File {#examples-for-writing-to-a-file}

### Write to a TSV file {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

結果として、データはファイル`test.tsv`に書き込まれます：

```bash

# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### Partitioned write to multiple TSV files {#partitioned-write-to-multiple-tsv-files}

`file()`タイプのテーブル関数にデータを挿入する際に`PARTITION BY`式を指定すると、各パーティションに対して別のファイルが作成されます。データを別々のファイルに分割すると、読み取り操作のパフォーマンスが向上します。

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

結果として、データは3つのファイルに書き込まれます：`test_1.tsv`、`test_2.tsv`、および`test_3.tsv`。

```bash

# cat /var/lib/clickhouse/user_files/test_1.tsv
3    2    1


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2


# cat /var/lib/clickhouse/user_files/test_3.tsv
1    2    3
```

## Examples for Reading from a File {#examples-for-reading-from-a-file}

### SELECT from a CSV file {#select-from-a-csv-file}

まず、サーバー設定で`user_files_path`を設定し、`test.csv`ファイルを準備します：

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

次に、`test.csv`からデータをテーブルに読み込み、最初の2行を選択します：

```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

### Inserting data from a file into a table {#inserting-data-from-a-file-into-a-table}

```sql
INSERT INTO FUNCTION
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1);
```
```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

`archive1.zip`または/および`archive2.zip`にある`table.csv`からデータを読み取ります：

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```

## Globs in path {#globs-in-path}

パスはグロビングを使用できます。ファイルは全体のパスパターンと一致しなければなりません。サフィックスやプレフィックスのみではありません。1つだけ例外があり、パスが存在するディレクトリを参照しており、グロブを使用しない場合、`*`が暗黙的にパスに追加され、ディレクトリ内のすべてのファイルが選択されます。

- `*` — `/`を除く任意の多くの文字を表しますが、空の文字列を含みます。
- `?` — 任意の1文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列`'some_string', 'another_string', 'yet_another_one'`のいずれかを置き換えます。文字列は`/`記号を含むことができます。
- `{N..M}` — 任意の数`>= N`および`<= M`を表します。
- `**` - フォルダ内のすべてのファイルを再帰的に表します。

`{}`を含む構造は、[remote](remote.md)および[hdfs](hdfs.md)テーブル関数に似ています。

## Examples {#examples}

**Example**

次の相対パスを持つファイルがあるとします：

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

すべてのファイルの総行数をクエリします：

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

同じ結果を得る別のパス表現：

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

暗黙的`*`を使用して`some_dir`の総行数をクエリします：

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
ファイルリストに先頭ゼロの数字範囲が含まれている場合は、各桁に対してブレースを使用するか、`?`を使用してください。
:::

**Example**

`file000`、`file001`、...、`file999`という名前のファイルの総行数をクエリします：

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**Example**

ディレクトリ`big_dir/`内のすべてのファイルの総行数を再帰的にクエリします：

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**Example**

ディレクトリ`big_dir/`内の任意のフォルダにある`file002`という名前のすべてのファイルの総行数を再帰的にクエリします：

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

## Virtual Columns {#virtual-columns}

- `_path` — ファイルへのパス。タイプ：`LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ：`LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ：`Nullable(UInt64)`。ファイルサイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終更新時刻。タイプ：`Nullable(DateTime)`。時間が不明な場合、値は`NULL`です。

## Hive-style partitioning {#hive-style-partitioning}

`use_hive_partitioning`が1に設定されている場合、ClickHouseはパス内のHiveスタイルのパーティショニングを検出し（`/name=value/`）、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション化されたパスと同じ名前を持ちますが、`_`で始まります。

**Example**

Hiveスタイルのパーティショニングで作成された仮想カラムを使用：

```sql
SELECT * from file('data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## Settings {#settings}

| 設定                                                                                                              | 説明                                                                                                                                                                                      |
|-------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                   | 存在しないファイルから空のデータを選択することを許可します。デフォルトでは無効です。                                                                                                                                                 |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                     | 挿入の前にファイルを切り捨てることを許可します。デフォルトでは無効です。                                                                                                                                                  |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | フォーマットがサフィックスを持つ場合に、各挿入ごとに新しいファイルを作成することを許可します。デフォルトでは無効です。                                                                                                                  |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                       | 読み取り中に空のファイルをスキップすることを許可します。デフォルトでは無効です。                                                                                                                                                  |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                          | ストレージファイルからデータを読み取る方法の設定の1つ：read、pread、mmap（clickhouse-local専用）。デフォルト値：`pread`はclickhouse-serverのため、`mmap`はclickhouse-localのため。 |

## Related {#related}

- [Virtual columns](engines/table-engines/index.md#table_engines-virtual_columns)
- [Rename files after processing](operations/settings/settings.md#rename_files_after_processing)
