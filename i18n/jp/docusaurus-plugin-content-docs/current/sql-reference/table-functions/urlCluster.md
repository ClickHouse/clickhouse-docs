---
description: '指定したクラスター内の多くのノードからURLのファイルを並行して処理することを許可します。'
sidebar_label: 'urlCluster'
sidebar_position: 201
slug: /sql-reference/table-functions/urlCluster
title: 'urlCluster'
---


# urlCluster テーブル関数

指定したクラスター内の多くのノードからURLのファイルを並行して処理することを許可します。イニシエーターは、クラスター内のすべてのノードへの接続を作成し、URLファイルパスにアスタリスクを開示し、各ファイルを動的にディスパッチします。ワーカーノードでは、イニシエーターに次の処理タスクを尋ね、処理します。すべてのタスクが終了するまでこれを繰り返します。

**構文**

```sql
urlCluster(cluster_name, URL, format, structure)
```

**引数**

-   `cluster_name` — リモートおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスターの名前。
- `URL` — `GET` リクエストを受け付けるHTTPまたはHTTPSサーバーのアドレス。タイプ: [String](../../sql-reference/data-types/string.md)。
- `format` — データの[フォーマット](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。
- `structure` — `'UserID UInt64, Name String'` 形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。

**返される値**

指定されたフォーマットと構造、および定義された `URL` からのデータを持つテーブル。

**例**

HTTPサーバーから `String` と [UInt32](../../sql-reference/data-types/int-uint.md) タイプのカラムを持つテーブルの最初の3行を取得します。このサーバーは [CSV](../../interfaces/formats.md#csv) フォーマットで応答します。

1. 標準のPython 3ツールを使用して基本的なHTTPサーバーを作成し、起動します:

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

```sql
SELECT * FROM urlCluster('cluster_simple','http://127.0.0.1:12345', CSV, 'column1 String, column2 UInt32')
```

## URL内のグロブ {#globs-in-url}

波括弧 `{ }` 内のパターンは、シャードのセットを生成したり、フェイルオーバーアドレスを指定したりするために使用されます。サポートされているパターンタイプと例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の文字 `|` はフェイルオーバーアドレスを指定するために使用されます。これらはパターンにリストされている順序で反復されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されています。

**参照**

-   [HDFSエンジン](../../engines/table-engines/special/url.md)
-   [URLテーブル関数](../../sql-reference/table-functions/url.md)
