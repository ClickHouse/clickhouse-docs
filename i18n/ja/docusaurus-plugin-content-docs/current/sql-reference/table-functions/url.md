---
slug: /sql-reference/table-functions/url
sidebar_position: 200
sidebar_label: url
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# url

`url` 関数は、指定した `format` と `structure` を使用して `URL` からテーブルを作成します。

`url` 関数は、[URL](../../engines/table-engines/special/url.md) テーブル内のデータに対する `SELECT` および `INSERT` クエリで使用できます。

**構文**

``` sql
url(URL [,format] [,structure] [,headers])
```

**パラメータ**

- `URL` — `GET` または `POST` リクエストを受け入れることができる HTTP または HTTPS サーバーのアドレス（それぞれ `SELECT` または `INSERT` クエリ用）。タイプ: [String](../../sql-reference/data-types/string.md)。
- `format` — データの[フォーマット](../../interfaces/formats.md#formats)。タイプ: [String](../../sql-reference/data-types/string.md)。
- `structure` — `'UserID UInt64, Name String'`形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。
- `headers` - HTTP コール用のヘッダーを `'headers('key1'='value1', 'key2'='value2')'` 形式で設定します。

**返される値**

指定されたフォーマットと構造のテーブルで、定義された `URL` からデータが含まれています。

**例**

HTTP サーバーから `String` および [UInt32](../../sql-reference/data-types/int-uint.md) タイプのカラムを持つテーブルの最初の 3 行を取得します。HTTP サーバーは [CSV](../../interfaces/formats.md#csv) 形式で応答します。

``` sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

`URL` からテーブルにデータを挿入します：

``` sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## URL におけるグロブ {#globs-in-url}

波括弧 `{ }` 内のパターンは、シャードのセットを生成するためや、フェイルオーバーアドレスを指定するために使用されます。サポートされているパターンタイプと例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の文字 `|` は、フェイルオーバーアドレスを指定するために使用されます。これらは、パターンにリストアップされた順に繰り返されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されます。

## 仮想カラム {#virtual-columns}

- `_path` — `URL` へのパス。タイプ: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。タイプ: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終変更時間。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` になります。
- `_headers` - HTTP レスポンスヘッダー。タイプ: `Map(LowCardinality(String), LowCardinality(String))`。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` を 1 に設定すると、ClickHouse はパス内の Hive スタイルのパーティショニング (`/name=value/`) を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようになります。これらの仮想カラムは、パーティション化されたパスにおける名前と同じですが、 `_` で始まります。

**例**

Hiveスタイルのパーティショニングを使用して作成された仮想カラムを使用する

``` sql
SELECT * from url('http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI内のパスのデコード/エンコードを有効または無効にすることを許可します。デフォルトでは有効です。

**関連項目**

- [仮想カラム](/engines/table-engines/index.md#table_engines-virtual_columns)
