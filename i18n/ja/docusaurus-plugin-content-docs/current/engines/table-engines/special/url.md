---
slug: /engines/table-engines/special/url
sidebar_position: 80
sidebar_label:  URL
title: "URL テーブルエンジン"
description: "リモート HTTP/HTTPS サーバーからのデータをクエリします。このエンジンは、File エンジンに似ています。"
---

# URL テーブルエンジン

リモート HTTP/HTTPS サーバーからのデータをクエリします。このエンジンは、[File](../../../engines/table-engines/special/file.md) エンジンに似ています。

構文: `URL(URL [,Format] [,CompressionMethod])`

- `URL` パラメータは、Uniform Resource Locator の構造に準拠している必要があります。指定した URL は HTTP または HTTPS を使用するサーバーを指す必要があります。サーバーからの応答を取得するために追加のヘッダーは必要ありません。

- `Format` は、ClickHouse が `SELECT` クエリおよび必要に応じて `INSERT` で使用できるものでなければなりません。サポートされているフォーマットの完全なリストについては、[Formats](../../../interfaces/formats.md#formats) を参照してください。

    この引数が指定されていない場合、ClickHouse は `URL` パラメータのサフィックスからフォーマットを自動的に検出します。`URL` パラメータのサフィックスがサポートされているフォーマットと一致しない場合、テーブルの作成は失敗します。例えば、エンジン式 `URL('http://localhost/test.json')` に対しては、`JSON` フォーマットが適用されます。

- `CompressionMethod` は、HTTP 本文が圧縮されるべきかどうかを示します。圧縮が有効になっている場合、URL エンジンによって送信される HTTP パケットには、使用される圧縮メソッドを示す 'Content-Encoding' ヘッダーが含まれます。

圧縮を有効にするには、まず `URL` パラメータによって示されたリモート HTTP エンドポイントが対応する圧縮アルゴリズムをサポートしていることを確認してください。

サポートされている `CompressionMethod` は以下のいずれかである必要があります:
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

`CompressionMethod` が指定されていない場合は、デフォルトで `auto` になります。これは、ClickHouse が自動的に `URL` パラメータのサフィックスから圧縮メソッドを検出することを意味します。サフィックスが上記のいずれかの圧縮メソッドと一致する場合、対応する圧縮が適用されるか、圧縮は有効になりません。

例えば、エンジン式 `URL('http://localhost/test.gzip')` に対しては `gzip` 圧縮メソッドが適用されますが、`URL('http://localhost/test.fr')` については、サフィックス `fr` が上記の圧縮メソッドのいずれとも一致しないため、圧縮は有効になりません。

## 使用法 {#using-the-engine-in-the-clickhouse-server}

`INSERT` および `SELECT` クエリはそれぞれ `POST` および `GET` リクエストに変換されます。`POST` リクエストを処理するために、リモートサーバーは [Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding) をサポートしている必要があります。

[max_http_get_redirects](../../../operations/settings/settings.md#setting-max_http_get_redirects) 設定を使用して、HTTP GET リダイレクトホップの最大数を制限できます。

## 例 {#example}

**1.** サーバー上に `url_engine_table` テーブルを作成します :

``` sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 標準の Python 3 ツールを使用して基本的な HTTP サーバーを作成し、起動します:

``` python3
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

``` bash
$ python3 server.py
```

**3.** データを要求します:

``` sql
SELECT * FROM url_engine_table
```

``` text
┌─word──┬─value─┐
│ Hello │     1 │
│ World │     2 │
└───────┴───────┘
```

## 実装の詳細 {#details-of-implementation}

- 読み取りと書き込みは並行して行うことができます。
- サポートされていません:
    - `ALTER` および `SELECT...SAMPLE` 操作。
    - インデックス。
    - レプリケーション。

## 仮想カラム {#virtual-columns}

- `_path` — `URL` へのパス。型: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。型: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_headers` - HTTP 応答ヘッダー。型: `Map(LowCardinality(String), LowCardinality(String))`。

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り時に空のファイルをスキップ可能にします。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI のパスのデコード/エンコードを有効/無効にします。デフォルトでは有効です。
