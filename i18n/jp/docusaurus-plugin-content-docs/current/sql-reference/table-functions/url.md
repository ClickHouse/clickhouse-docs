---
slug: /sql-reference/table-functions/url
sidebar_position: 200
sidebar_label: url
title: 'url'
description: 'Creates a table from the `URL` with given `format` and `structure`'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url テーブル関数

`url` 関数は、指定された `format` と `structure` を持つ `URL` からテーブルを作成します。

`url` 関数は、[URL](../../engines/table-engines/special/url.md) テーブルのデータに対する `SELECT` および `INSERT` クエリで使用できます。

**構文**

``` sql
url(URL [,format] [,structure] [,headers])
```

**パラメータ**

- `URL` — `GET` または `POST` リクエストを受け付ける HTTP または HTTPS サーバーアドレス（それぞれ `SELECT` または `INSERT` クエリ用）。タイプ: [String](../../sql-reference/data-types/string.md)。
- `format` — データの[形式](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。
- `structure` — テーブル構造の `'UserID UInt64, Name String'` 形式。カラムの名前とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。
- `headers` - HTTP コール用のヘッダーを `'headers('key1'='value1', 'key2'='value2')'` 形式で設定します。

**返される値**

指定された形式と構造、および定義された `URL` からのデータを持つテーブル。

**例**

`String` および [UInt32](../../sql-reference/data-types/int-uint.md) タイプのカラムを含むテーブルの最初の 3 行を、[CSV](../../interfaces/formats.md#csv) 形式で応答する HTTP サーバーから取得する。

``` sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

`URL` からテーブルにデータを挿入する：

``` sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## URL のグロブ {#globs-in-url}

中括弧 `{ }` 内のパターンは、シャードのセットを生成するためやフェイルオーバーアドレスを指定するために使用されます。サポートされているパターンタイプと例は、[remote](remote.md#globs-in-addresses) 関数の説明で確認できます。  
パターン内の文字 `|` はフェイルオーバーアドレスを指定するために使用されます。これらは、パターンにリストされた順序で繰り返されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されます。

## 仮想カラム {#virtual-columns}

- `_path` — `URL` へのパス。タイプ: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。タイプ: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_headers` - HTTP 応答ヘッダー。タイプ: `Map(LowCardinality(String), LowCardinality(String))`。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` 設定が 1 に設定されていると、ClickHouse はパス (`/name=value/`) における Hiveスタイルのパーティショニングを検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティションされたパスでの同じ名前を持ちますが、`_` で始まります。

**例**

Hiveスタイルのパーティショニングを使用して作成された仮想カラムを使用する。

``` sql
SELECT * from url('http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り中に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI におけるパスのデコーディング/エンコーディングを有効/無効にします。デフォルトでは有効です。

**関連項目**

- [仮想カラム](/engines/table-engines/index.md#table_engines-virtual_columns)
