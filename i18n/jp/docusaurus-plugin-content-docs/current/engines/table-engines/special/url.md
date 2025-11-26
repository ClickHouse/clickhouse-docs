---
description: 'リモート HTTP/HTTPS サーバーとの間でデータをクエリします。このエンジンは File エンジンに似ています。'
sidebar_label: 'URL'
sidebar_position: 80
slug: /engines/table-engines/special/url
title: 'URL テーブルエンジン'
doc_type: 'reference'
---



# URL テーブルエンジン

リモートの HTTP/HTTPS サーバーとの間でデータをクエリします。このエンジンは [File](../../../engines/table-engines/special/file.md) エンジンに類似しています。

構文: `URL(URL [,Format] [,CompressionMethod])`

- `URL` パラメータは、Uniform Resource Locator の構造に準拠している必要があります。指定された URL は HTTP もしくは HTTPS を使用するサーバーを指している必要があります。サーバーからレスポンスを取得するために追加のヘッダーは不要です。

- `Format` には、ClickHouse が `SELECT` クエリおよび必要に応じて `INSERT` で使用できるフォーマットを指定します。サポートされているフォーマットの一覧については、[Formats](/interfaces/formats#formats-overview) を参照してください。

    この引数が指定されていない場合、ClickHouse は `URL` パラメータのサフィックスから自動的にフォーマットを判別します。`URL` パラメータのサフィックスがサポート対象のいずれのフォーマットとも一致しない場合、テーブルの作成は失敗します。たとえば、エンジン式 `URL('http://localhost/test.json')` の場合、`JSON` フォーマットが適用されます。

- `CompressionMethod` は、HTTP 本文を圧縮するかどうかを示します。圧縮が有効な場合、URL エンジンが送信する HTTP パケットには、使用している圧縮方式を示す `Content-Encoding` ヘッダーが含まれます。

圧縮を有効にする前に、`URL` パラメータで指定されたリモート HTTP エンドポイントが、対応する圧縮アルゴリズムをサポートしていることを確認してください。

サポートされている `CompressionMethod` は次のいずれかです:
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

`CompressionMethod` が指定されていない場合、デフォルトは `auto` です。これは、ClickHouse が `URL` パラメータのサフィックスから自動的に圧縮方式を判別することを意味します。サフィックスが上記のいずれかの圧縮方式と一致する場合は対応する圧縮が適用され、一致しない場合は圧縮は有効になりません。

たとえば、エンジン式 `URL('http://localhost/test.gzip')` の場合、`gzip` 圧縮方式が適用されますが、`URL('http://localhost/test.fr')` の場合、サフィックス `fr` が上記のいずれの圧縮方式とも一致しないため、圧縮は有効になりません。



## 使用方法 {#using-the-engine-in-the-clickhouse-server}

`INSERT` および `SELECT` クエリは、それぞれ `POST` および `GET` リクエストに変換されます。`POST` リクエストを処理するには、リモートサーバーが [チャンク転送エンコーディング](https://en.wikipedia.org/wiki/Chunked_transfer_encoding) をサポートしている必要があります。

[max_http_get_redirects](/operations/settings/settings#max_http_get_redirects) 設定を使用して、HTTP GET リダイレクトの最大ホップ数を制限できます。



## 例

**1.** サーバー上に `url_engine_table` テーブルを作成します：

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 標準の Python 3 ツールを使って簡易な HTTP サーバーを作成し、
起動します。

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

**3.** リクエストデータ：

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

- 読み取りと書き込みは並行して実行できます
- 以下はサポートされていません：
  - `ALTER` および `SELECT...SAMPLE` 操作
  - インデックス
  - レプリケーション



## 仮想カラム {#virtual-columns}

- `_path` — `URL` へのパス。型: `LowCardinality(String)`。
- `_file` — `URL` のリソース名。型: `LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL`。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL`。
- `_headers` - HTTP レスポンスヘッダー。型: `Map(LowCardinality(String), LowCardinality(String))`。



## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み込み時に空のファイルをスキップできるようにします。既定では無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI パスのエンコード／デコード処理を有効／無効にできます。既定では有効です。
