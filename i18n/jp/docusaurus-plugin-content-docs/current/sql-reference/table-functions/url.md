---
description: '指定されたフォーマットと構造を持つ `URL` からテーブルを作成します'
sidebar_label: 'url'
sidebar_position: 200
slug: /sql-reference/table-functions/url
title: 'url'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url テーブル関数

`url` 関数は、指定されたフォーマットと構造を持つ `URL` からテーブルを作成します。

`url` 関数は、[URL](../../engines/table-engines/special/url.md) テーブル内のデータに対して `SELECT` および `INSERT` クエリで使用できます。

**構文**

```sql
url(URL [,format] [,structure] [,headers])
```

**パラメータ**

- `URL` — `GET` または `POST` リクエストを受け付けることができる HTTP または HTTPS サーバーのアドレス（それぞれ `SELECT` または `INSERT` クエリ用）。タイプ: [String](../../sql-reference/data-types/string.md)。
- `format` — データの[フォーマット](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。
- `structure` — `'UserID UInt64, Name String'` 形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。
- `headers` - HTTP コール用のヘッダーを `'headers('key1'='value1', 'key2'='value2')'` 形式で設定できます。

**返される値**

指定されたフォーマットと構造を持ち、定義された `URL` からのデータが含まれるテーブル。

**例**

HTTPサーバーから `String` および [UInt32](../../sql-reference/data-types/int-uint.md) タイプのカラムを持つテーブルの最初の 3 行を取得します。サーバーは [CSV](../../interfaces/formats.md#csv) 形式で応答します。

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

`URL` からテーブルにデータを挿入します:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## URL のグロブ {#globs-in-url}

中括弧 `{ }` 内のパターンは、シャードのセットを生成したり、フェイルオーバーアドレスを指定したりするために使用されます。サポートされるパターンタイプと例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の `|` 文字はフェイルオーバーアドレスを指定するために使用されます。リストに記載された順序で繰り返されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されています。

## 仮想カラム {#virtual-columns}

- `_path` — `URL` へのパス。タイプ: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。タイプ: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_headers` - HTTP 応答ヘッダー。タイプ: `Map(LowCardinality(String), LowCardinality(String))`。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` が 1 に設定されている場合、ClickHouse はパス内の Hiveスタイルパーティショニング (`/name=value/`) を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション化されたパスと同じ名前を持ちますが、先頭に `_` が付いています。

**例**

Hiveスタイルのパーティショニングで作成された仮想カラムを使用します。

```sql
SELECT * from url('http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI のパスのデコード/エンコードを有効/無効にすることを許可します。デフォルトでは有効です。

## 権限 {#permissions}

`url` 関数は `CREATE TEMPORARY TABLE` 権限を必要とします。そのため、[readonly](/operations/settings/permissions-for-queries#readonly) = 1 設定のユーザーには機能しません。少なくとも readonly = 2 が必要です。

**参照**

- [仮想カラム](/engines/table-engines/index.md#table_engines-virtual_columns)
