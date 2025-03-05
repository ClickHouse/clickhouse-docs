---
slug: /sql-reference/table-functions/urlCluster
sidebar_position: 201
sidebar_label: urlCluster
title: "urlCluster"
description: "指定したクラスタ内の多くのノードからURLのファイルを並列処理することを可能にします。"
---


# urlCluster テーブル関数

指定したクラスタ内の多くのノードからURLのファイルを並列処理することを可能にします。イニシエーターはクラスタ内のすべてのノードへの接続を確立し、URLファイルパス内のアスタリスクを開示し、各ファイルを動的にディスパッチします。ワーカーノードでは、次に処理するタスクについてイニシエーターに問い合わせ、そのタスクを処理します。この処理はすべてのタスクが完了するまで繰り返されます。

**構文**

``` sql
urlCluster(cluster_name, URL, format, structure)
```

**引数**

-   `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。
- `URL` — `GET` リクエストを受け入れることができるHTTPまたはHTTPSサーバーのアドレス。タイプ: [String](../../sql-reference/data-types/string.md)。
- `format` — データの[フォーマット](../../interfaces/formats.md#formats)。タイプ: [String](../../sql-reference/data-types/string.md)。
- `structure` — `'UserID UInt64, Name String'` 形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。

**戻り値**

指定されたフォーマットと構造を持ち、定義された `URL` からのデータを含むテーブル。

**例**

HTTPサーバーから[CSV](../../interfaces/formats.md#csv)フォーマットで応答する`String`型および[UInt32](../../sql-reference/data-types/int-uint.md)型のカラムを含むテーブルの最初の3行を取得します。

1. 標準的なPython 3ツールを使用して基本的なHTTPサーバーを作成し、起動します：

```python
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

``` sql
SELECT * FROM urlCluster('cluster_simple','http://127.0.0.1:12345', CSV, 'column1 String, column2 UInt32')
```

## URL でのグロブ {#globs-in-url}

波かっこ `{ }` 内のパターンは、一連のシャードを生成するためまたはフェイだおーバーアドレスを指定するために使用されます。サポートされているパターンタイプと例は、[remote](remote.md#globs-in-addresses)関数の説明で確認できます。
パターン内の文字 `|` は、フェイだおーバーアドレスを指定するために使用されます。これらはパターンにリストされた順序で反復されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements)設定によって制限されます。

**関連情報**

-   [HDFSエンジン](../../engines/table-engines/special/url.md)
-   [URLテーブル関数](../../sql-reference/table-functions/url.md)
