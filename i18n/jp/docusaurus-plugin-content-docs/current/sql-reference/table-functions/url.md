---
description: 'Creates a table from the `URL` with given `format` and `structure`'
sidebar_label: 'url'
sidebar_position: 200
slug: '/sql-reference/table-functions/url'
title: 'url'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url テーブル関数

`url` 関数は、指定された `format` と `structure` を持つ `URL` からテーブルを作成します。

`url` 関数は、[URL](../../engines/table-engines/special/url.md) テーブル内のデータに対する `SELECT` および `INSERT` クエリで使用できます。

## 構文 {#syntax}

```sql
url(URL [,format] [,structure] [,headers])
```

## パラメータ {#parameters}

| パラメータ   | 説明                                                                                                                                              |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `URL`        | `GET` または `POST` リクエストを受け付ける HTTP または HTTPS サーバーのアドレス（それぞれ `SELECT` または `INSERT` クエリ用）。型: [String](../../sql-reference/data-types/string.md)。 |
| `format`     | データの[フォーマット](/sql-reference/formats)。型: [String](../../sql-reference/data-types/string.md)。                                                   |
| `structure`  | `'UserID UInt64, Name String'` フォーマットのテーブル構造。カラム名と型を決定します。型: [String](../../sql-reference/data-types/string.md)。     |
| `headers`    | `'headers('key1'='value1', 'key2'='value2')'` フォーマットのヘッダー。HTTP 呼び出し用のヘッダーを設定できます。                                               |

## 戻り値 {#returned_value}

指定されたフォーマットと構造、及び定義された `URL` からのデータを持つテーブル。

## 例 {#examples}

HTTP サーバーからの `String` および [UInt32](../../sql-reference/data-types/int-uint.md) タイプのカラムを含むテーブルの最初の 3 行を取得します。サーバーは [CSV](../../interfaces/formats.md#csv) フォーマットで応答します。

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

`URL` からテーブルへのデータ挿入：

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## URL におけるグロブ {#globs-in-url}

中括弧 `{ }` 内のパターンは、シャードのセットを生成したり、フェイルオーバーアドレスを指定するために使用されます。サポートされているパターンタイプと例は、[remote](remote.md#globs-in-addresses) 関数の説明で確認できます。
パターン内の文字 `|` はフェイルオーバーアドレスを指定するために使用され、リストの順序で反復されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されています。

## 仮想カラム {#virtual-columns}

- `_path` — `URL` へのパス。型: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。型: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時刻。型: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。
- `_headers` - HTTP 応答ヘッダー。型: `Map(LowCardinality(String), LowCardinality(String))`。

## Hive スタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` を 1 に設定すると、ClickHouse はパス内の Hive スタイルのパーティショニング (`/name=value/`) を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション化されたパスと同じ名前ですが、`_` で始まります。

**例**

Hive スタイルのパーティショニングで作成された仮想カラムを使用

```sql
SELECT * from url('http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI のパスのデコード/エンコードを有効/無効にすることを許可します。デフォルトでは有効です。

## 権限 {#permissions}

`url` 関数は `CREATE TEMPORARY TABLE` 権限を必要とします。そのため - [readonly](/operations/settings/permissions-for-queries#readonly) = 1 設定のユーザーには機能しません。少なくとも readonly = 2 が必要です。

## 関連 {#related}

- [仮想カラム](/engines/table-engines/index.md#table_engines-virtual_columns)
