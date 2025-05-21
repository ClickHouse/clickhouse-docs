description: 'ファイルから SELECT と INSERT を行うためのテーブルライクインターフェースを提供するテーブルエンジン。s3 テーブル関数に似ています。ローカルファイルを扱うときは `file()` を使用し、S3、GCS、MinIO のようなオブジェクトストレージのバケットを扱うときは `s3()` を使用します。'
sidebar_label: 'file'
sidebar_position: 60
slug: /sql-reference/table-functions/file
title: 'file'
```

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# file テーブル関数

ファイルから SELECT と INSERT を行うためのテーブルライクインターフェースを提供するテーブルエンジンで、[s3](/sql-reference/table-functions/url.md) テーブル関数に似ています。ローカルファイルを扱うときは `file()` を使用し、S3、GCS、MinIO のようなオブジェクトストレージのバケットを扱うときは `s3()` を使用します。

`file` 関数は、ファイルから読み込むかファイルに書き込むために、`SELECT` および `INSERT` クエリで使用できます。

**構文**

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

**パラメーター**

- `path` — [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path) からのファイルへの相対パス。読み取り専用モードで以下の [グロブ](#globs-in-path) をサポートします: `*`, `?`, `{abc,def}` (`'abc'` と `'def'` は文字列) と `{N..M}` (`N` と `M` は数字)。
- `path_to_archive` - zip/tar/7z アーカイブへの相対パス。同じグロブをサポートします。
- `format` — ファイルの [形式](/interfaces/formats)。
- `structure` — テーブルの構造。形式: `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — `SELECT` クエリで使用される場合の既存の圧縮タイプ、または `INSERT` クエリで使用される場合の希望する圧縮タイプ。サポートされる圧縮タイプは `gz`、`br`、`xz`、`zst`、`lz4`、`bz2` です。

**戻り値**

ファイル内でデータを読み書きするためのテーブル。

## ファイルへの書き込みの例 {#examples-for-writing-to-a-file}

### TSV ファイルへの書き込み {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

結果として、データはファイル `test.tsv` に書き込まれます:

```bash

# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### 複数の TSV ファイルへのパーティションを書き込み {#partitioned-write-to-multiple-tsv-files}

`file()` タイプのテーブル関数にデータを挿入する際に `PARTITION BY` 式を指定すると、各パーティションに対して別々のファイルが作成されます。データを別々のファイルに分割すると、読み取り操作のパフォーマンス向上に役立ちます。

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

結果として、データは `test_1.tsv`、`test_2.tsv`、および `test_3.tsv` の3つのファイルに書き込まれます。

```bash

# cat /var/lib/clickhouse/user_files/test_1.tsv
3    2    1


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2


# cat /var/lib/clickhouse/user_files/test_3.tsv
1    2    3
```

## ファイルからの読み込みの例 {#examples-for-reading-from-a-file}

### CSV ファイルから SELECT {#select-from-a-csv-file}

まず、サーバー構成で `user_files_path` を設定し、ファイル `test.csv` を準備します:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

次に、`test.csv` からテーブルにデータを読み込み、その最初の2行を選択します:

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

### ファイルからテーブルにデータを挿入する {#inserting-data-from-a-file-into-a-table}

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

`archive1.zip` または `archive2.zip` にある `table.csv` からのデータ読み込み:

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```

## パスにおけるグロブ {#globs-in-path}

パスはグロビングを使用できます。ファイルは完全なパスパターンと一致しなければなりません。例外として、パスが既存のディレクトリを指し、グロブを使用していない場合、`*` が暗黙的にパスに追加され、ディレクトリ内のすべてのファイルが選択されます。

- `*` — `/` を除く任意の多くの文字を表し、空文字も含まれます。
- `?` — 任意の単一の文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかを代入します。文字列は `/` 記号を含むことができます。
- `{N..M}` — 数字 `>= N` および `<= M` を表します。
- `**` - フォルダー内のすべてのファイルを再帰的に表します。

`{}` を含む構文は、[remote](remote.md) および [hdfs](hdfs.md) テーブル関数に似ています。

**例**

次の相対パスを持つファイルがあるとします:

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

すべてのファイルの行数をクエリします:

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

同じ結果を得るための代替パス表現:

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

暗黙の `*` を使用して `some_dir` 内の行数をクエリします:

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
ファイルのリストに先頭ゼロを持つ数字の範囲が含まれている場合、各数字ごとに波かっこを使った構文を使用するか、`?` を使用してください。
:::

**例**

`file000`、`file001`、...、`file999` という名前のファイルの行数をクエリします:

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**例**

`big_dir/` ディレクトリ内のすべてのファイルの行数を再帰的にクエリします:

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**例**

`big_dir/` ディレクトリ内の任意のフォルダーで `file002` という名前のすべてのファイルの行数を再帰的にクエリします:

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — バイト単位のファイルサイズ。タイプ: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時間。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。

## Hive スタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` を 1 に設定すると、ClickHouse はパス内の Hive スタイルのパーティショニング (`/name=value/`) を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようになります。これらの仮想カラムは、パーティション化されたパスと同じ名前で `_` から始まります。

**例**

Hive スタイルのパーティショニングで作成された仮想カラムを使用します

```sql
SELECT * from file('data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 設定 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 存在しないファイルから空のデータを選択可能にします。デフォルトでは無効。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 挿入前にファイルを切り捨てることを許可します。デフォルトでは無効。
- [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) - 形式にサフィックスがある場合、各挿入で新しいファイルを作成できるようにします。デフォルトでは無効。
- [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files) - 読み取り時に空のファイルをスキップできるようにします。デフォルトでは無効。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - ストレージファイルからのデータ読み取り方法。選択肢の1つ: read, pread, mmap (clickhouse-local のみ)。デフォルト値: `pread` (clickhouse-server 用), `mmap` (clickhouse-local 用)。

**関連情報**

- [仮想カラム](engines/table-engines/index.md#table_engines-virtual_columns)
- [処理後にファイルをリネーム](operations/settings/settings.md#rename_files_after_processing)
