---
slug: /sql-reference/table-functions/url
sidebar_position: 200
sidebar_label: url
title: "url"
description: "指定された `format` と `structure` で `URL` からテーブルを作成します"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url テーブル関数

`url` 関数は、指定された `format` と `structure` に基づいて `URL` からテーブルを作成します。

`url` 関数は、[URL](../../engines/table-engines/special/url.md) テーブルのデータに対する `SELECT` および `INSERT` クエリで使用できます。

**構文**

``` sql
url(URL [,format] [,structure] [,headers])
```

**パラメータ**

- `URL` — `GET` または `POST` リクエストを受け入れることができる HTTP または HTTPS サーバーアドレス（それぞれ `SELECT` または `INSERT` クエリ用）。タイプ: [String](../../sql-reference/data-types/string.md)。
- `format` — データの[フォーマット](../../interfaces/formats.md#formats)。タイプ: [String](../../sql-reference/data-types/string.md)。
- `structure` — テーブル構造 `'UserID UInt64, Name String'` 形式で。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。
- `headers` - HTTP コール用のヘッダーを `'headers('key1'='value1', 'key2'='value2')'` 形式で設定できます。

**戻り値**

指定されたフォーマットと構造のテーブルで、定義された `URL` からのデータが含まれます。

**例**

`String` および [UInt32](../../sql-reference/data-types/int-uint.md) タイプのカラムを含むテーブルの最初の 3 行を、[CSV](../../interfaces/formats.md#csv) フォーマットで返す HTTP サーバーから取得します。

``` sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

`URL` からテーブルにデータを挿入する：

``` sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## URL内のグロブ {#globs-in-url}

中括弧 `{ }` 内のパターンは、シャードのセットを生成したり、フェイルオーバーアドレスを指定するのに使用されます。サポートされるパターンタイプと例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の文字 `|` はフェイルオーバーアドレスを指定するために使用され、パターンにリストされているのと同じ順序で繰り返されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されています。

## 仮想カラム {#virtual-columns}

- `_path` — `URL` へのパス。タイプ: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。タイプ: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新日時。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。
- `_headers` - HTTP 応答ヘッダー。タイプ: `Map(LowCardinality(String), LowCardinality(String))`。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` が 1 に設定されていると、ClickHouse はパス内の Hive スタイルのパーティショニング (`/name=value/`) を検出し、クエリでパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティショニングされたパスと同じ名前ですが、 `_` で始まります。

**例**

Hiveスタイルのパーティショニングを使用して作成された仮想カラムを使用する

``` sql
SELECT * from url('http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り時に空のファイルをスキップできるようにします。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URIのパスのデコード/エンコードを有効または無効にします。デフォルトでは有効です。

**参照**

- [仮想カラム](/engines/table-engines/index.md#table_engines-virtual_columns)
