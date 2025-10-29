---
'description': 'ファイルからSELECTとINSERTを行うためのテーブルのようなインターフェースを提供するテーブルエンジンで、s3テーブル関数に似ています。ローカルファイルを扱うときは`file()`を使用し、S3、GCS、またはMinIOのようなオブジェクトストレージのバケットを扱うときは`s3()`を使用してください。'
'sidebar_label': 'ファイル'
'sidebar_position': 60
'slug': '/sql-reference/table-functions/file'
'title': 'ファイル'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# file テーブル関数

ファイルからSELECTおよびINSERTを行うためのテーブルエンジンで、[s3](/sql-reference/table-functions/url.md) テーブル関数と似たテーブルのようなインターフェースを提供します。ローカルファイルを扱う場合は`file()`を使用し、S3、GCS、またはMinIOのようなオブジェクトストレージのバケットを扱う場合は`s3()`を使用します。

`file`関数は、ファイルを読み書きするための`SELECT`および`INSERT`クエリで使用できます。

## 構文 {#syntax}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

## 引数 {#arguments}

| パラメーター         | 説明                                                                                                                                                                                                                                                                                                   |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`            | [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path)からのファイルへの相対パス。読み取り専用モードで次の[グロブ](#globs-in-path)をサポートします: `*`, `?`, `{abc,def}`（`'abc'`と`'def'`が文字列である場合）および`{N..M}`（`N`と`M`が数値である場合）。 |
| `path_to_archive` | zip/tar/7zアーカイブへの相対パス。同様のグロブをサポートします。                                                                                                                                                                                                                                 |
| `format`          | ファイルの[フォーマット](/interfaces/formats)。                                                                                                                                                                                                                                                                |
| `structure`       | テーブルの構造。形式: `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                |
| `compression`     | `SELECT`クエリで使用する場合の既存の圧縮タイプ、または`INSERT`クエリで使用する場合の希望する圧縮タイプ。サポートされている圧縮タイプは`gz`、`br`、`xz`、`zst`、`lz4`、および`bz2`です。                                                                                                       |

## 戻り値 {#returned_value}

ファイル内のデータを読み書きするためのテーブル。

## ファイルへの書き込み例 {#examples-for-writing-to-a-file}

### TSVファイルへの書き込み {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

結果として、データはファイル`test.tsv`に書き込まれます:

```bash

# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### 複数のTSVファイルへのパーティション書き込み {#partitioned-write-to-multiple-tsv-files}

ファイルタイプのテーブル関数にデータを挿入する際に`PARTITION BY`式を指定した場合、各パーティションのために別々のファイルが作成されます。データを別々のファイルに分割することで、読み取り操作のパフォーマンスが向上します。

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

結果として、データは3つのファイルに書き込まれます: `test_1.tsv`、`test_2.tsv`、および`test_3.tsv`。

```bash

# cat /var/lib/clickhouse/user_files/test_1.tsv
3    2    1


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2


# cat /var/lib/clickhouse/user_files/test_3.tsv
1    2    3
```

## ファイルからの読み取り例 {#examples-for-reading-from-a-file}

### CSVファイルからSELECT {#select-from-a-csv-file}

まず、サーバ設定で`user_files_path`を設定し、ファイル`test.csv`を準備します:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

次に、`test.csv`からテーブルにデータを読み込み、最初の2行を選択します:

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

### ファイルからテーブルへのデータ挿入 {#inserting-data-from-a-file-into-a-table}

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

`archive1.zip`または`archive2.zip`にある`table.csv`からデータを読み込みます:

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```

## パスにおけるグロブ {#globs-in-path}

パスはグロブを使うことができます。ファイルはパターン全体に一致する必要があり、サフィックスやプレフィックスのみでは不十分です。一つの例外として、パスが既存のディレクトリを指し、グロブを使用していない場合は、`*`が暗黙的にパスに追加され、そのディレクトリ内のすべてのファイルが選択されます。

- `*` — `/`を除く任意の文字を表し、空文字列も含みます。
- `?` — 任意の1文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列`'some_string', 'another_string', 'yet_another_one'`のいずれかに置き換えます。文字列には`/`記号を含めることができます。
- `{N..M}` — 任意の数`>= N`および`<= M`を表します。
- `**` - フォルダー内のすべてのファイルを再帰的に表します。

`{}`を使用した構文は、[remote](remote.md)および[hdfs](hdfs.md)テーブル関数に似ています。

## 例 {#examples}

**例**

次の相対パスのファイルがあるとします:

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

すべてのファイルの行数の合計をクエリします:

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

同じ結果を得る別のパス式:

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

暗黙の`*`を使用して`some_dir`内の行数の合計をクエリします:

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
ファイルのリストに先頭ゼロを含む数値範囲がある場合は、各桁のために波かっこを使う構文を使用するか、`?`を使用してください。
:::

**例**

`file000`、`file001`、...、`file999`という名前のファイルの行数の合計をクエリします:

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**例**

ディレクトリ`big_dir/`内のすべてのファイルの行数の合計を再帰的にクエリします:

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**例**

ディレクトリ`big_dir/`内の任意のフォルダーにある`file002`という名前のすべてのファイルの行数の合計を再帰的にクエリします:

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

## 擬似列 {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終変更時間。型: `Nullable(DateTime)`。時刻が不明な場合、値は`NULL`です。

## use_hive_partitioning設定 {#hive-style-partitioning}

`use_hive_partitioning`が1に設定されている場合、ClickHouseはパス内のHiveスタイルのパーティショニングを検出し（`/name=value/`）、クエリ内でパーティション列を擬似列として使用できるようにします。これらの擬似列は、パーティション化されたパスと同じ名前を持ちますが、`_`で始まります。

**例**

Hiveスタイルのパーティショニングで作成された擬似列を使用します:

```sql
SELECT * FROM file('data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## 設定 {#settings}

| 設定                                                                                                              | 説明                                                                                                                                                                 |
|-------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                  | 存在しないファイルから空のデータを選択できるようにします。デフォルトでは無効です。                                                                                     |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                    | 挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。                                                                                                  |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | 挿入ごとに新しいファイルを作成できるようにします（フォーマットにサフィックスがある場合）。デフォルトでは無効です。                                                                 |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                      | 読み込み中に空のファイルをスキップできるようにします。デフォルトでは無効です。                                                                                              |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                         | ストレージファイルからデータを読み取る方法。選択肢は: read、pread、mmap（clickhouse-localのみ）。デフォルト値: clickhouse-server用の`pread`、clickhouse-local用の`mmap`。 |

## 関連 {#related}

- [擬似列](engines/table-engines/index.md#table_engines-virtual_columns)
- [処理後のファイルの名前変更](operations/settings/settings.md#rename_files_after_processing)
