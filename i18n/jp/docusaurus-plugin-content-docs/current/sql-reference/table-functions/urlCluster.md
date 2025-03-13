---
slug: '/sql-reference/table-functions/urlCluster'
sidebar_position: 201
sidebar_label: 'urlCluster'
title: 'urlCluster'
description: '指定されたクラスターの複数のノードからURLのファイルを並行処理することを可能にします。'
---


# urlCluster テーブル関数

指定されたクラスターの複数のノードからURLのファイルを並行処理することを可能にします。イニシエーターはクラスター内のすべてのノードへの接続を作成し、URLファイルパスにアスタリスクを明示し、各ファイルを動的にディスパッチします。ワーカーノードでは、次に処理するタスクについてイニシエーターに要求し、それを処理します。これはすべてのタスクが完了するまで繰り返されます。

**構文**

``` sql
urlCluster(cluster_name, URL, format, structure)
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構成するために使用されるクラスターの名前。
- `URL` — `GET`リクエストを受け入れることができるHTTPまたはHTTPSサーバーアドレス。タイプ: [String](../../sql-reference/data-types/string.md)。
- `format` — データの[形式](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。
- `structure` — `'UserID UInt64, Name String'`形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。

**返される値**

指定された形式と構造、および定義された`URL`からのデータを持つテーブル。

**例**

HTTPサーバーから[CSV](../../interfaces/formats.md#csv)形式で応答し、`String`および[UInt32](../../sql-reference/data-types/int-uint.md)型のカラムを含むテーブルの最初の3行を取得します。

1. 標準のPython 3ツールを使用して基本的なHTTPサーバーを作成し、起動します：

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

## URL内のグロブ {#globs-in-url}

波括弧 `{ }` 内のパターンは、シャードのセットを生成するため、またはフェイルオーバーアドレスを指定するために使用されます。サポートされているパターンタイプと例については、[remote](remote.md#globs-in-addresses)関数の説明を参照してください。
パターン内の文字 `|` はフェイルオーバーアドレスを指定するために使用されます。それらは、パターンにリストされているのと同じ順序で繰り返されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements)設定によって制限されています。

**関連情報**

- [HDFS エンジン](../../engines/table-engines/special/url.md)
- [URL テーブル関数](../../sql-reference/table-functions/url.md)
