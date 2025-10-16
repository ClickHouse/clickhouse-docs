---
'description': '指定された `format` と `structure` で `URL` からテーブルを作成します。'
'sidebar_label': 'url'
'sidebar_position': 200
'slug': '/sql-reference/table-functions/url'
'title': 'url'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url テーブル関数

`url` 関数は、指定された `format` と `structure` の `URL` からテーブルを作成します。

`url` 関数は、[URL](../../engines/table-engines/special/url.md) テーブル内のデータに対する `SELECT` および `INSERT` クエリで使用できます。

## 構文 {#syntax}

```sql
url(URL [,format] [,structure] [,headers])
```

## パラメータ {#parameters}

| パラメータ   | 説明                                                                                                                                    |
|-------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `URL`       | 単一引用符で囲まれた HTTP または HTTPS サーバーアドレスで、`GET` または `POST` リクエストを受け付けることができます（`SELECT` または `INSERT` クエリにそれぞれ対応）。タイプ: [String](../../sql-reference/data-types/string.md)。 |
| `format`    | データの[フォーマット](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。                                              |
| `structure` | `'UserID UInt64, Name String'` 形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。   |
| `headers`   | `'headers('key1'='value1', 'key2'='value2')'` 形式のヘッダー。HTTP 呼び出しのためにヘッダーを設定できます。                                                        |

## 戻り値 {#returned_value}

指定されたフォーマットと構造で、定義された `URL` からのデータを含むテーブル。

## 例 {#examples}

HTTP サーバーから [CSV](../../interfaces/formats.md#csv) フォーマットで応答する `String` と [UInt32](../../sql-reference/data-types/int-uint.md) タイプのカラムを含むテーブルの最初の 3 行を取得します。

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

`URL` からテーブルにデータを挿入する:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## URL のグロブ {#globs-in-url}

波かっこ `{ }` 内のパターンは、シャードのセットを生成したり、フェイルオーバーアドレスを指定するために使用されます。サポートされるパターンタイプと例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の文字 `|` はフェイルオーバーアドレスを指定するために使用されます。それらはパターンにリストされた順序で反復されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されます。

## 仮想カラム {#virtual-columns}

- `_path` — `URL` へのパス。タイプ: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。タイプ: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時刻。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。
- `_headers` - HTTP 応答ヘッダー。タイプ: `Map(LowCardinality(String), LowCardinality(String))`。

## use_hive_partitioning 設定 {#hive-style-partitioning}

`use_hive_partitioning` 設定が 1 に設定されている場合、ClickHouse はパス内の Hive スタイルのパーティショニングを検出し（`/name=value/`）、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション化されたパスと同じ名前を持ちますが、`_` で始まります。

**例**

Hive スタイルのパーティショニングで作成された仮想カラムを使用する

```sql
SELECT * FROM url('http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り中に空のファイルをスキップできるようにします。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI内のパスのデコード/エンコードを有効/無効にします。デフォルトでは有効です。

## 権限 {#permissions}

`url` 関数には `CREATE TEMPORARY TABLE` の権限が必要です。したがって、[readonly](/operations/settings/permissions-for-queries#readonly) = 1 設定のユーザーでは動作しません。少なくとも readonly = 2 が必要です。

## 関連項目 {#related}

- [仮想カラム](/engines/table-engines/index.md#table_engines-virtual_columns)
