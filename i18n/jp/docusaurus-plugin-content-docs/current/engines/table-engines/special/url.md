---
description: 'リモートのHTTP/HTTPSサーバーとの間でデータをクエリします。このエンジンはFileエンジンと類似しています。'
sidebar_label: 'URL'
sidebar_position: 80
slug: '/engines/table-engines/special/url'
title: 'URL テーブルエンジン'
---





# URLテーブルエンジン

リモートHTTP/HTTPSサーバーからデータをクエリします。このエンジンは[File](../../../engines/table-engines/special/file.md)エンジンに似ています。

構文: `URL(URL [,Format] [,CompressionMethod])`

- `URL`パラメータは、Uniform Resource Locatorの構造に準拠する必要があります。指定されたURLはHTTPまたはHTTPSを使用するサーバーを指す必要があります。サーバーからの応答を取得するために追加のヘッダーは必要ありません。

- `Format`はClickHouseが`SELECT`クエリや、必要に応じて`INSERT`で使用できるものでなければなりません。サポートされるフォーマットの完全なリストについては、[Formats](/interfaces/formats#formats-overview)を参照してください。

　この引数が指定されていない場合、ClickHouseは自動的に`URL`パラメータのサフィックスからフォーマットを検出します。`URL`パラメータのサフィックスがサポートされるフォーマットのいずれとも一致しない場合、テーブルの作成に失敗します。たとえば、エンジン式`URL('http://localhost/test.json')`の場合、`JSON`フォーマットが適用されます。

- `CompressionMethod`は、HTTP本体を圧縮する必要があるかどうかを示します。圧縮が有効になっている場合、URLエンジンによって送信されるHTTPパケットには、どの圧縮方式が使用されているかを示す'Content-Encoding'ヘッダーが含まれます。

圧縮を有効にするには、まず`URL`パラメータで指定されたリモートHTTPエンドポイントが対応する圧縮アルゴリズムをサポートしていることを確認してください。

サポートされている`CompressionMethod`は以下のいずれかである必要があります：
- gzipまたはgz
- deflate
- brotliまたはbr
- lzmaまたはxz
- zstdまたはzst
- lz4
- bz2
- snappy
- none
- auto

`CompressionMethod`が指定されていない場合、デフォルトは`auto`です。これはClickHouseが`URL`パラメータのサフィックスから自動的に圧縮方式を検出することを意味します。サフィックスが上記の圧縮方法のいずれかと一致する場合、対応する圧縮が適用されますが、一致しない場合は圧縮は有効になりません。

たとえば、エンジン式`URL('http://localhost/test.gzip')`の場合、`gzip`圧縮方式が適用されますが、`URL('http://localhost/test.fr')`の場合、サフィックス`fr`が上記の圧縮方式のいずれとも一致しないため、圧縮は有効になりません。

## 使用法 {#using-the-engine-in-the-clickhouse-server}

`INSERT`および`SELECT`クエリは、それぞれ`POST`および`GET`リクエストに変換されます。`POST`リクエストを処理するために、リモートサーバーは[Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding)をサポートしている必要があります。

[ max_http_get_redirects](/operations/settings/settings#max_http_get_redirects)設定を使用して、最大HTTP GETリダイレクトホップ数を制限できます。

## 例 {#example}

**1.** サーバー上に`url_engine_table`テーブルを作成します：

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 標準のPython 3ツールを使って基本的なHTTPサーバーを作成し、起動します：

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

- 読み込みと書き込みは並列で行えます
- サポートされていないもの：
    - `ALTER`および`SELECT...SAMPLE`操作。
    - インデックス。
    - レプリケーション。

## 仮想カラム {#virtual-columns}

- `_path` — `URL`へのパス。型: `LowCardinality(String)`.
- `_file` — `URL`のリソース名。型: `LowCardinality(String)`.
- `_size` — リソースのサイズ（バイト）。型: `Nullable(UInt64)`。サイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は`NULL`です。
- `_headers` - HTTP応答ヘッダー。型: `Map(LowCardinality(String), LowCardinality(String))`.

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み込み中に空ファイルをスキップすることを許可します。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI内のパスのデコード/エンコードの有効/無効を設定できます。デフォルトでは有効です。
