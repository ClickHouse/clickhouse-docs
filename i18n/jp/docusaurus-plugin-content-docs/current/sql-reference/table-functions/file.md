---
description: 's3 テーブル関数と同様に、ファイルに対して SELECT や INSERT を実行するためのテーブル形式インターフェースを提供するテーブルエンジンです。ローカルファイルを扱う場合は `file()` を、S3、GCS、MinIO などのオブジェクトストレージ内のバケットを扱う場合は `s3()` を使用します。'
sidebar_label: 'file'
sidebar_position: 60
slug: /sql-reference/table-functions/file
title: 'file'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# file テーブル関数

[s3](/sql-reference/table-functions/url.md) テーブル関数と同様に、ファイルからの `SELECT` およびファイルへの `INSERT` のためのテーブルと同様のインターフェイスを提供するテーブルエンジンです。ローカルファイルを扱う場合は `file()` を、S3、GCS、MinIO などのオブジェクトストレージ内のバケットを扱う場合は `s3()` を使用します。

`file` 関数は、`SELECT` および `INSERT` クエリ内で使用して、ファイルからの読み取りやファイルへの書き込みを行うことができます。



## 構文 {#syntax}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```


## 引数 {#arguments}

| パラメータ         | 説明                                                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`            | [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path)からファイルへの相対パス。読み取り専用モードでは以下の[グロブ](#globs-in-path)をサポートします:`*`、`?`、`{abc,def}`(`'abc'`と`'def'`は文字列)、`{N..M}`(`N`と`M`は数値)。 |
| `path_to_archive` | zip/tar/7zアーカイブへの相対パス。`path`と同じグロブをサポートします。                                                                                                                                                                                                                                 |
| `format`          | ファイルの[フォーマット](/interfaces/formats)。                                                                                                                                                                                                                                                                |
| `structure`       | テーブルの構造。形式:`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                |
| `compression`     | `SELECT`クエリで使用する場合は既存の圧縮タイプ、`INSERT`クエリで使用する場合は指定する圧縮タイプ。サポートされる圧縮タイプは`gz`、`br`、`xz`、`zst`、`lz4`、`bz2`です。                                                                                                       |


## 戻り値 {#returned_value}

ファイル内のデータの読み取りまたは書き込みを行うためのテーブル。


## ファイルへの書き込み例 {#examples-for-writing-to-a-file}

### TSVファイルへの書き込み {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

この結果、データは`test.tsv`ファイルに書き込まれます:


```bash
# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### 複数のTSVファイルへのパーティション分割書き込み {#partitioned-write-to-multiple-tsv-files}

`file()`型のテーブル関数にデータを挿入する際に`PARTITION BY`式を指定すると、各パーティションごとに個別のファイルが作成されます。データを個別のファイルに分割することで、読み取り操作のパフォーマンス向上に役立ちます。

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

その結果、データは`test_1.tsv`、`test_2.tsv`、`test_3.tsv`の3つのファイルに書き込まれます。


```bash
# cat /var/lib/clickhouse/user_files/test_1.tsv
3    2    1
```


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2



# cat /var/lib/clickhouse/user&#95;files/test&#95;3.tsv

1    2    3

```
```


## ファイルからの読み取り例 {#examples-for-reading-from-a-file}

### CSVファイルからのSELECT {#select-from-a-csv-file}

まず、サーバー設定で`user_files_path`を設定し、ファイル`test.csv`を準備します:

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

`archive1.zip`または`archive2.zip`に格納されている`table.csv`からデータを読み取る例:

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```


## パス内のグロブ {#globs-in-path}

パスにはグロブを使用できます。ファイルは、接尾辞や接頭辞だけでなく、パスパターン全体に一致する必要があります。例外として、パスが既存のディレクトリを参照し、グロブを使用していない場合、パスに暗黙的に `*` が追加され、ディレクトリ内のすべてのファイルが選択されます。

- `*` — `/` を除く任意の数の文字を表します。空文字列も含まれます。
- `?` — 任意の1文字を表します。
- `{some_string,another_string,yet_another_one}` — `'some_string'`、`'another_string'`、`'yet_another_one'` のいずれかの文字列に置換されます。文字列には `/` 記号を含めることができます。
- `{N..M}` — `>= N` かつ `<= M` の任意の数値を表します。
- `**` — フォルダ内のすべてのファイルを再帰的に表します。

`{}` を使用した構文は、[remote](remote.md) および [hdfs](hdfs.md) テーブル関数と同様です。


## 例 {#examples}

**例**

以下の相対パスを持つファイルがあるとします:

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

すべてのファイルの総行数を取得するクエリ:

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

同じ結果を得られる別のパス表現:

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

暗黙的な `*` を使用して `some_dir` の総行数を取得するクエリ:

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
ファイルリストに先頭ゼロ付きの数値範囲が含まれる場合は、各桁ごとに中括弧を使用した構文を使用するか、`?` を使用してください。
:::

**例**

`file000`、`file001`、...、`file999` という名前のファイルの総行数を取得するクエリ:

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**例**

ディレクトリ `big_dir/` 内のすべてのファイルから再帰的に総行数を取得するクエリ:

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**例**

ディレクトリ `big_dir/` 内の任意のフォルダにあるすべての `file002` ファイルから再帰的に総行数を取得するクエリ:

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。


## use_hive_partitioning 設定 {#hive-style-partitioning}

`use_hive_partitioning` 設定を 1 に設定すると、ClickHouse はパス内の Hive 形式のパーティショニング（`/name=value/`）を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション化されたパス内と同じ名前を持ちますが、先頭に `_` が付きます。

**例**

Hive 形式のパーティショニングで作成された仮想カラムを使用する

```sql
SELECT * FROM file('data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## 設定 {#settings}

| 設定                                                                                                            | 説明                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                   | 存在しないファイルから空のデータを選択することを許可します。デフォルトでは無効です。                                                                                            |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                     | ファイルへの挿入前にファイルを切り詰めることを許可します。デフォルトでは無効です。                                                                                                         |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | フォーマットにサフィックスがある場合、挿入ごとに新しいファイルを作成することを許可します。デフォルトでは無効です。                                                                                       |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                       | 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。                                                                                                              |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                          | ストレージファイルからデータを読み取る方法。read、pread、mmap（clickhouse-localのみ）のいずれか。デフォルト値：clickhouse-serverの場合は`pread`、clickhouse-localの場合は`mmap`。 |


## 関連項目 {#related}

- [仮想カラム](engines/table-engines/index.md#table_engines-virtual_columns)
- [処理後のファイル名変更](operations/settings/settings.md#rename_files_after_processing)
