---
slug: /engines/table-engines/special/url
sidebar_position: 80
sidebar_label:  URL
title: "URLテーブルエンジン"
description: "リモートのHTTP/HTTPSサーバーからデータをクエリします。このエンジンはFileエンジンに似ています。"
---


# URLテーブルエンジン

リモートのHTTP/HTTPSサーバーからデータをクエリします。このエンジンは[File](../../../engines/table-engines/special/file.md)エンジンに似ています。

構文: `URL(URL [,Format] [,CompressionMethod])`

- `URL`パラメータは、Uniform Resource Locatorの構造に従う必要があります。指定されたURLはHTTPまたはHTTPSを使用するサーバーを指す必要があります。サーバーからの応答を得るために追加のヘッダーは必要ありません。

- `Format`はClickHouseが`SELECT`クエリで使用できる形式でなければならず、必要に応じて`INSERT`でも使用されます。サポートされている形式の完全なリストについては、[Formats](/interfaces/formats#formats-overview)を参照してください。

    この引数が指定されていない場合、ClickHouseは`URL`パラメータのサフィックスから形式を自動的に検出します。`URL`パラメータのサフィックスがサポートされている形式のいずれとも一致しない場合、テーブルの作成に失敗します。例えば、エンジン式`URL('http://localhost/test.json')`の場合、`JSON`形式が適用されます。

- `CompressionMethod`は、HTTPボディを圧縮すべきかどうかを示します。圧縮が有効になっている場合、URLエンジンによって送信されるHTTPパケットには、どの圧縮方法が使用されているかを示す`Content-Encoding`ヘッダーが含まれます。

圧縮を有効にするには、まず`URL`パラメータで示されたリモートHTTPエンドポイントが対応する圧縮アルゴリズムをサポートしていることを確認してください。

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

`CompressionMethod`が指定されていない場合、デフォルトは`auto`です。これはClickHouseが`URL`パラメータのサフィックスから圧縮方法を自動的に検出することを意味します。サフィックスが上記の圧縮方法のいずれかに一致する場合、対応する圧縮が適用され、圧縮が有効でない場合もあります。

例えば、エンジン式`URL('http://localhost/test.gzip')`の場合、`gzip`圧縮方法が適用されますが、`URL('http://localhost/test.fr')`の場合は、サフィックス`fr`が上記の圧縮方法のいずれとも一致しないため、圧縮は有効になりません。

## 使用方法 {#using-the-engine-in-the-clickhouse-server}

`INSERT`および`SELECT`クエリは、それぞれ`POST`および`GET`リクエストに変換されます。`POST`リクエストを処理するためには、リモートサーバーが[Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding)をサポートしている必要があります。

[ max_http_get_redirects](/operations/settings/settings#max_http_get_redirects)設定を使用して、最大のHTTP GETリダイレクトホップ数を制限できます。

## 例 {#example}

**1.** サーバー上に`url_engine_table`テーブルを作成します：

``` sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 標準のPython 3ツールを使用して基本的なHTTPサーバーを作成し、起動します：

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

**3.** データをリクエストします：

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

- 読み取りおよび書き込みは並列に可能です。
- サポートされていないもの：
    - `ALTER`および`SELECT...SAMPLE`操作。
    - インデックス。
    - レプリケーション。

## 仮想カラム {#virtual-columns}

- `_path` — `URL`へのパス。タイプ：`LowCardinality(String)`。
- `_file` — `URL`のリソース名。タイプ：`LowCardinality(String)`。
- `_size` — リソースのサイズ（バイト単位）。タイプ：`Nullable(UInt64)`。サイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終変更時刻。タイプ：`Nullable(DateTime)`。時刻が不明な場合、値は`NULL`です。
- `_headers` - HTTP応答ヘッダー。タイプ：`Map(LowCardinality(String), LowCardinality(String))`。

## ストレージ設定 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 読み取り時に空のファイルをスキップできるようにします。デフォルトでは無効です。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI内のパスのデコード/エンコードを有効/無効にします。デフォルトでは有効です。
