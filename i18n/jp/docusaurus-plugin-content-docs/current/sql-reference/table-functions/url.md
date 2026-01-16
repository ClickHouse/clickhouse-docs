---
description: '`URL` から、指定された `format` と `structure` に基づいてテーブルを作成します'
sidebar_label: 'url'
sidebar_position: 200
slug: /sql-reference/table-functions/url
title: 'url'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# url テーブル関数 \\{#url-table-function\\}

`url` 関数は、指定された `format` および `structure` を使用して、`URL` からテーブルを作成します。

`url` 関数は、[URL](../../engines/table-engines/special/url.md) テーブル内のデータに対する `SELECT` および `INSERT` クエリで使用できます。

## 構文 \\{#syntax\\}

```sql
url(URL [,format] [,structure] [,headers])
```

## パラメータ \\{#parameters\\}

| Parameter   | Description                                                                                                                                            |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URL`       | シングルクォートで囲まれた HTTP または HTTPS サーバーアドレス。`GET` または `POST` リクエスト（それぞれ `SELECT` または `INSERT` クエリに対応）を受け付ける必要があります。型: [String](../../sql-reference/data-types/string.md)。 |
| `format`    | データの[フォーマット](/sql-reference/formats)。型: [String](../../sql-reference/data-types/string.md)。                                                  |
| `structure` | `'UserID UInt64, Name String'` 形式のテーブル構造。カラム名と型を決定します。型: [String](../../sql-reference/data-types/string.md)。     |
| `headers`   | `'headers('key1'='value1', 'key2'='value2')'` 形式のヘッダー。HTTP 呼び出しで使用するヘッダーを設定できます。                                                  |

## 戻り値 \\{#returned_value\\}

指定された形式と構造を持ち、定義された `URL` からのデータを含むテーブル。

## 例 \\{#examples\\}

`String` 列と [UInt32](../../sql-reference/data-types/int-uint.md) 型の列を含むテーブルの先頭 3 行を、[CSV](/interfaces/formats/CSV) 形式で応答する HTTP サーバーから取得します。

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

`URL` からテーブルにデータを挿入する:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## URL のグロブ \\{#globs-in-url\\}

波かっこ `{ }` 内のパターンは、シャードの集合を生成するか、フェイルオーバーアドレスを指定するために使用されます。サポートされるパターンの種類と例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の文字 `|` はフェイルオーバーアドレスを指定するために使用されます。これらはパターン内で列挙された順序どおりに試行されます。生成されるアドレス数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されます。

## 仮想カラム \\{#virtual-columns\\}

- `_path` — `URL` へのパス。型: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。型: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` になります。
- `_headers` — HTTP レスポンスヘッダー。型: `Map(LowCardinality(String), LowCardinality(String))`。

## use&#95;hive&#95;partitioning 設定 \\{#hive-style-partitioning\\}

`use_hive_partitioning` の値が 1 の場合、ClickHouse はパス内の Hive 形式のパーティショニング（`/name=value/`）を検出し、クエリ内でパーティション列を仮想列として使用できるようにします。これらの仮想列はパーティションパス内の名前と同じですが、先頭に `_` が付きます。

**例**

Hive 形式のパーティショニングで作成された仮想列を使用する

```sql
SELECT * FROM url('http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## ストレージ設定 \\{#storage-settings\\}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み込み時に空のファイルをスキップします。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI 内のパスのデコード／エンコードを有効／無効にします。デフォルトでは有効です。

## 権限 \\{#permissions\\}

`url` 関数には `CREATE TEMPORARY TABLE` 権限が必要です。そのため、[readonly](/operations/settings/permissions-for-queries#readonly) = 1 に設定されているユーザーでは動作しません。少なくとも `readonly` = 2 が必要です。

## 関連項目 \\{#related\\}

- [仮想列](/engines/table-engines/index.md#table_engines-virtual_columns)
