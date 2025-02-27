---
slug: /sql-reference/table-functions/file
sidebar_position: 60
sidebar_label: file
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# file

ファイルに対してSELECTやINSERTを行うためのテーブルエンジンで、[s3](/sql-reference/table-functions/url.md)テーブル関数と似たテーブルライクインターフェースを提供します。ローカルファイルを扱う際には`file()`を使用し、S3、GCS、またはMinIOなどのオブジェクトストレージ内のバケットを扱う際には`s3()`を使用します。

`file`関数は、ファイルから読み込むか、ファイルに書き込むための`SELECT`および`INSERT`クエリで使用できます。

**構文**

``` sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

**パラメータ**

- `path` — [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path)からファイルへの相対パス。読み取り専用モードでサポートされている次の[グロブ](#globs-in-path): `*`, `?`, `{abc,def}`（ここで`'abc'`と`'def'`は文字列）および `{N..M}`（ここで`N`と`M`は数字）。
- `path_to_archive` - zip/tar/7zアーカイブへの相対パス。`path`と同じグロブをサポートします。
- `format` — ファイルの[フォーマット](/interfaces/formats.md#formats)。
- `structure` — テーブルの構造。形式： `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression` — `SELECT`クエリで使用される場合の既存の圧縮タイプ、または`INSERT`クエリで使用される場合の希望の圧縮タイプ。サポートされている圧縮タイプは `gz`, `br`, `xz`, `zst`, `lz4`, および `bz2`です。

**戻り値**

ファイル内でデータを読み書きするためのテーブル。

## ファイルへの書き込みの例 {#examples-for-writing-to-a-file}

### TSVファイルへの書き込み {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

その結果、データは`test.tsv`ファイルに書き込まれます：

```bash
# cat /var/lib/clickhouse/user_files/test.tsv
1	2	3
3	2	1
1	3	2
```

### 複数のTSVファイルへのパーティション書き込み {#partitioned-write-to-multiple-tsv-files}

テーブル関数のタイプ`file()`にデータを挿入する際に`PARTITION BY`式を指定すると、各パーティションごとに個別のファイルが作成されます。データを別々のファイルに分割することで、読み取り操作のパフォーマンスが向上します。

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

その結果、データは3つのファイルに書き込まれます： `test_1.tsv`, `test_2.tsv`, および `test_3.tsv`。

```bash
# cat /var/lib/clickhouse/user_files/test_1.tsv
3	2	1

# cat /var/lib/clickhouse/user_files/test_2.tsv
1	3	2

# cat /var/lib/clickhouse/user_files/test_3.tsv
1	2	3
```

## ファイルからの読み取りの例 {#examples-for-reading-from-a-file}

### CSVファイルからのSELECT {#select-from-a-csv-file}

まず、サーバー設定で`user_files_path`を設定し、`test.csv`ファイルを用意します：

``` bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

次に、`test.csv`からデータをテーブルに読み込み、最初の2行を選択します：

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

パスにはグロブが使用できます。ファイルは全体のパスパターンと一致する必要があり、接尾辞や接頭辞だけでは不十分です。例外として、パスが既存のディレクトリを指し、グロブを使用しない場合、`*`が暗黙的にパスに追加され、そのディレクトリ内のすべてのファイルが選択されます。

- `*` — `/`を除く任意の文字を表し、空文字列を含みます。
- `?` — 任意の単一文字を表します。
- `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかに置き換えられます。文字列には`/`記号を含むことができます。
- `{N..M}` — 任意の数 `>= N` および `<= M` を表します。
- `**` - フォルダ内のすべてのファイルを再帰的に表します。

`{}`を使用した構文は、[remote](remote.md)や[hdfs](hdfs.md)テーブル関数に類似しています。

**例**

次の相対パスを持つファイルがあるとします：

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

すべてのファイルの行数をクエリする：

``` sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

同じ結果を得るための代替パス式：

``` sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

暗黙の`*`を使用して`some_dir`内の行数をクエリする：

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
ファイルリストに先頭ゼロのある数値範囲が含まれている場合は、各桁ごとに中括弧を使用するか、`?`を使用してください。
:::

**例**

ファイル名が`file000`, `file001`, ... , `file999`のファイルの総行数をクエリする：

``` sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**例**

ディレクトリ`big_dir/`内のすべてのファイルの総行数を再帰的にクエリする：

``` sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**例**

ディレクトリ`big_dir/`内の任意のフォルダ内にあるすべてのファイル`file002`の総行数を再帰的にクエリする：

``` sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は`NULL`になります。
- `_time` — ファイルの最終更新時間。型: `Nullable(DateTime)`。時間が不明な場合、値は`NULL`になります。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning`が1に設定されている場合、ClickHouseはパスの中でHiveスタイルのパーティショニング（`/name=value/`）を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティションされたパスと同じ名前になり、`_`で始まります。

**例**

Hiveスタイルパーティショニングで作成された仮想カラムを使用：

``` sql
SELECT * from file('data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 設定 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings.md#engine-file-empty_if-not-exists) - 存在しないファイルから空のデータを選択することを許可します。デフォルトでは無効。
- [engine_file_truncate_on_insert](/operations/settings/settings.md#engine-file-truncate-on-insert) - 挿入の前にファイルを切り捨てることを許可します。デフォルトでは無効。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - フォーマットにサフィックスがある場合、挿入ごとに新しいファイルを作成することを許可します。デフォルトでは無効。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効。
- [storage_file_read_method](/operations/settings/settings.md#engine-file-empty_if-not-exists) - ストレージファイルからのデータ読み取り方法。選択肢の中から1つ：read, pread, mmap（clickhouse-local専用）。デフォルト値：`pread`（clickhouse-server用）、`mmap`（clickhouse-local用）。

**関連情報**

- [仮想カラム](/engines/table-engines/index.md#table_engines-virtual_columns)
- [処理後のファイル名変更](/operations/settings/settings.md#rename_files_after_processing)
