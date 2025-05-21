---
description: 'リモート HTTP/HTTPS サーバーからデータをクエリします。このエンジンは、File エンジンに似ています。'
sidebar_label: 'URL'
sidebar_position: 80
slug: /engines/table-engines/special/url
title: 'URL テーブルエンジン'
---


# URL テーブルエンジン

リモート HTTP/HTTPS サーバーからデータをクエリします。このエンジンは、[File](../../../engines/table-engines/special/file.md) エンジンに似ています。

構文: `URL(URL [,Format] [,CompressionMethod])`

- `URL` パラメータは、Uniform Resource Locator の構造に従う必要があります。指定された URL は、HTTP または HTTPS を使用するサーバーを指す必要があります。これには、サーバーからの応答を得るための追加のヘッダーは必要ありません。

- `Format` は、ClickHouse が `SELECT` クエリおよび必要に応じて `INSERT` に使用できる形式でなければなりません。サポートされている形式の完全なリストについては、[Formats](/interfaces/formats#formats-overview)を参照してください。

    この引数が指定されていない場合、ClickHouse は `URL` パラメータの接尾辞から形式を自動的に検出します。`URL` パラメータの接尾辞がサポートされている形式のいずれとも一致しない場合、テーブルの作成に失敗します。例えば、エンジン式 `URL('http://localhost/test.json')` の場合、`JSON` 形式が適用されます。

- `CompressionMethod` は、HTTP ボディを圧縮するかどうかを示します。圧縮が有効な場合、URL エンジンによって送信される HTTP パケットには、使用される圧縮方法を示す 'Content-Encoding' ヘッダーが含まれます。

圧縮を有効にするには、まず `URL` パラメータで示されるリモート HTTP エンドポイントが対応する圧縮アルゴリズムをサポートしていることを確認してください。

サポートされている `CompressionMethod` は以下のいずれかである必要があります：
- gzip または gz
- deflate
- brotli または br
- lzma または xz
- zstd または zst
- lz4
- bz2
- snappy
- none
- auto

`CompressionMethod` が指定されていない場合は、デフォルトで `auto` となります。これは、ClickHouse が `URL` パラメータの接尾辞から圧縮方法を自動的に検出することを意味します。接尾辞が上記のいずれかの圧縮方法と一致する場合、対応する圧縮が適用されるか、圧縮は行われません。

例えば、エンジン式 `URL('http://localhost/test.gzip')` の場合、`gzip` 圧縮方法が適用されますが、`URL('http://localhost/test.fr')` の場合は、接尾辞 `fr` が上記の圧縮方法に一致しないため、圧縮は有効になりません。

## 使用法 {#using-the-engine-in-the-clickhouse-server}

`INSERT` および `SELECT` クエリは、それぞれ `POST` および `GET` リクエストに変換されます。`POST` リクエストを処理するためには、リモートサーバーが [Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding) をサポートしている必要があります。

HTTP GET リダイレクトの最大回数を制限するには、[max_http_get_redirects](/operations/settings/settings#max_http_get_redirects) 設定を使用できます。

## 例 {#example}

**1.** サーバー上に `url_engine_table` テーブルを作成します：

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 標準の Python 3 ツールを使用して基本的な HTTP サーバーを作成し、起動します：

```python3
from http.server import BaseHTTPRequestHandler, HTTPServer

class CSVHTTPServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/csv')
        self.end_headers()

        self.wfile.write(bytes('Hello,1\nWorld,2\n', "utf-8"))

if __name__ == "__main__":
    server_address = ('127.0.0.1', 12345)
    HTTPServer(server_address, CSVHTTPServer).serve_forever()
```

```bash
$ python3 server.py
```

**3.** データをリクエストします：

```sql
SELECT * FROM url_engine_table
```

```text
┌─word──┬─value─┐
│ Hello │     1 │
│ World │     2 │
└───────┴───────┘
```

## 実装の詳細 {#details-of-implementation}

- 読み取りと書き込みは並行して行うことができます。
- サポートされていない：
    - `ALTER` および `SELECT...SAMPLE` 操作
    - インデックス
    - レプリケーション

## 仮想カラム {#virtual-columns}

- `_path` — `URL` へのパス。タイプ: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。タイプ: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時間。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。
- `_headers` - HTTP レスポンスヘッダー。タイプ: `Map(LowCardinality(String), LowCardinality(String))`。

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り時に空のファイルをスキップすることを許可します。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI のパスのデコード/エンコードを有効/無効にすることを許可します。デフォルトでは有効です。
