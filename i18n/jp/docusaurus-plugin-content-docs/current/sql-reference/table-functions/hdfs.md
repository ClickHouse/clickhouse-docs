---
description: 'HDFS 上のファイルからテーブルを作成します。このテーブル関数は `url` テーブル関数および `file` テーブル関数と似ています。'
sidebar_label: 'hdfs'
sidebar_position: 80
slug: /sql-reference/table-functions/hdfs
title: 'hdfs'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# hdfs テーブル関数 \\{#hdfs-table-function\\}

HDFS 上のファイルからテーブルを作成します。このテーブル関数は、[url](../../sql-reference/table-functions/url.md) および [file](../../sql-reference/table-functions/file.md) テーブル関数と同様です。

## 構文 \\{#syntax\\}

```sql
hdfs(URI, format, structure)
```

## 引数 \\{#arguments\\}

| 引数      | 説明                                                                                                                                                                                |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URI`     | HDFS 上のファイルへの相対 URI。ファイルパスは読み取り専用モードで次のグロブパターンをサポートします: `*`, `?`, `{abc,def}`, `{N..M}`。ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列です。 |
| `format`  | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                |
| `structure`| テーブルの構造。形式 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                              |

## 返り値 \\{#returned_value\\}

指定されたファイル内のデータを読み書きするための、指定された構造を持つテーブル。

**例**

`hdfs://hdfs1:9000/test` にあるテーブルと、その先頭 2 行を選択するクエリ:

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

## パスでのグロブ \\{#globs_in_path\\}

パスではグロブパターンを使用できます。ファイルは接頭辞や接尾辞だけでなく、パス全体のパターンに一致している必要があります。

* `*` — `/` を除く任意個数の文字（空文字列も含む）を表します。
* `**` — フォルダ内に再帰的に含まれるすべてのファイルを表します。
* `?` — 任意の 1 文字を表します。
* `{some_string,another_string,yet_another_one}` — 文字列 `'some_string', 'another_string', 'yet_another_one'` のいずれかに置き換えられます。これらの文字列には `/` 記号を含めることができます。
* `{N..M}` — `>= N` かつ `<= M` の任意の数値を表します。

`{}` を用いる構文は、[remote](remote.md) および [file](file.md) テーブル関数と類似しています。

**例**

1. HDFS 上に、次の URI を持つ複数のファイルがあるとします：

* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;3&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;3&#39;

2. これらのファイル内の行数をクエリします：

{/* */ }

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. これら2つのディレクトリ内のすべてのファイルに含まれる行数を取得します。

{/* */ }

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルの一覧に先頭にゼロが付いた数値の範囲が含まれている場合は、各桁をそれぞれ波かっこで囲む構文を用いるか、`?` を使用してください。
:::

**例**

`file000`, `file001`, ... , `file999` という名前のファイルからデータを取得します。

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## 仮想カラム \\{#virtual-columns\\}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL`。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL`。

## use&#95;hive&#95;partitioning 設定 \\{#hive-style-partitioning\\}

`use_hive_partitioning` 設定値を 1 にすると、ClickHouse はパス（`/name=value/`）内の Hive スタイルのパーティショニングを検出し、クエリ内でパーティション列を仮想列として利用できるようにします。これらの仮想列の名前は、パーティションパス内の名前と同じですが、先頭に `_` が付きます。

**例**

Hive スタイルのパーティショニングで作成された仮想列を使用する

```sql
SELECT * FROM HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## ストレージ設定 \\{#storage-settings\\}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - 挿入前にファイルを切り詰められるようにします。デフォルトでは無効です。
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - フォーマットにサフィックスがある場合、挿入ごとに新しいファイルを作成できるようにします。デフォルトでは無効です。
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 読み取り時に空のファイルをスキップできるようにします。デフォルトでは無効です。

## 関連項目 \\{#related\\}

- [仮想カラム](../../engines/table-engines/index.md#table_engines-virtual_columns)
