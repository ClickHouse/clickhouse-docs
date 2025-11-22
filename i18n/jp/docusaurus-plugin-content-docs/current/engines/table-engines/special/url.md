---
description: 'リモートの HTTP/HTTPS サーバーとの間でデータをクエリします。このエンジンは File エンジンに似ています。'
sidebar_label: 'URL'
sidebar_position: 80
slug: /engines/table-engines/special/url
title: 'URL テーブルエンジン'
doc_type: 'reference'
---



# URL テーブルエンジン

リモートの HTTP/HTTPS サーバーとの間でデータをクエリします。このエンジンは [File](../../../engines/table-engines/special/file.md) エンジンと類似しています。

構文: `URL(URL [,Format] [,CompressionMethod])`

- `URL` パラメータは Uniform Resource Locator の構造に準拠している必要があります。指定された URL は HTTP または HTTPS を使用するサーバーを指していなければなりません。サーバーからレスポンスを取得するために追加のヘッダーは不要です。

- `Format` は、ClickHouse が `SELECT` クエリおよび必要に応じて `INSERT` で使用可能なフォーマットである必要があります。サポートされているフォーマットの完全な一覧については、[Formats](/interfaces/formats#formats-overview) を参照してください。

    この引数が指定されない場合、ClickHouse は `URL` パラメータのサフィックスからフォーマットを自動検出します。`URL` パラメータのサフィックスがサポートされているフォーマットと一致しない場合、テーブルの作成は失敗します。たとえば、エンジン式 `URL('http://localhost/test.json')` では `JSON` フォーマットが適用されます。

- `CompressionMethod` は HTTP ボディを圧縮するかどうかを指定します。圧縮が有効な場合、URL エンジンが送信する HTTP パケットには、どの圧縮方式が使用されているかを示す `Content-Encoding` ヘッダーが含まれます。

圧縮を有効にするには、まず `URL` パラメータで指定されているリモート HTTP エンドポイントが、対応する圧縮アルゴリズムをサポートしていることを確認してください。

サポートされている `CompressionMethod` は次のいずれかです：
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

`CompressionMethod` が指定されない場合、デフォルトは `auto` です。これは、ClickHouse が `URL` パラメータのサフィックスから圧縮方式を自動検出することを意味します。サフィックスが上記の圧縮方式のいずれかと一致する場合は対応する圧縮が適用され、一致しない場合は圧縮は有効になりません。

たとえば、エンジン式 `URL('http://localhost/test.gzip')` では `gzip` 圧縮方式が適用されますが、`URL('http://localhost/test.fr')` ではサフィックス `fr` が上記のいずれの圧縮方式とも一致しないため、圧縮は有効になりません。



## 使用方法 {#using-the-engine-in-the-clickhouse-server}

`INSERT`クエリと`SELECT`クエリは、それぞれ`POST`リクエストと`GET`リクエストに変換されます。`POST`リクエストを処理するには、リモートサーバーが[チャンク転送エンコーディング](https://en.wikipedia.org/wiki/Chunked_transfer_encoding)をサポートしている必要があります。

HTTP GETリダイレクトの最大ホップ数は、[max_http_get_redirects](/operations/settings/settings#max_http_get_redirects)設定を使用して制限できます。


## 例 {#example}

**1.** サーバー上に `url_engine_table` テーブルを作成します:

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 標準の Python 3 ツールを使用して基本的な HTTP サーバーを作成し、起動します:

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

**3.** データをクエリします:

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

- 読み取りと書き込みは並列で実行可能です
- サポートされていない機能:
  - `ALTER`および`SELECT...SAMPLE`操作
  - インデックス
  - レプリケーション


## 仮想カラム {#virtual-columns}

- `_path` — `URL`へのパス。型: `LowCardinality(String)`。
- `_file` — `URL`のリソース名。型: `LowCardinality(String)`。
- `_size` — リソースのサイズ(バイト単位)。型: `Nullable(UInt64)`。サイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は`NULL`です。
- `_headers` — HTTPレスポンスヘッダー。型: `Map(LowCardinality(String), LowCardinality(String))`。


## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り時に空のファイルをスキップします。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI内のパスのデコード/エンコードを有効化/無効化します。デフォルトでは有効です。
