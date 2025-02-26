---
slug: /sql-reference/table-functions/urlCluster
sidebar_position: 201
sidebar_label: urlCluster
---

# urlCluster テーブル関数

指定されたクラスター内の多数のノードから URL からファイルを並行して処理を行うことを可能にします。イニシエーターでは、クラスター内のすべてのノードに接続を作成し、URLファイルパスにアスタリスクを開示し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次に処理すべきタスクを尋ね、それを処理します。これはすべてのタスクが完了するまで繰り返されます。

**構文**

```sql
urlCluster(cluster_name, URL, format, structure)
```

**引数**

-   `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。
- `URL` — `GET` リクエストを受け付けることができる HTTP または HTTPS サーバーのアドレス。型: [String](../../sql-reference/data-types/string.md)。
- `format` — データの [フォーマット](../../interfaces/formats.md#formats)。型: [String](../../sql-reference/data-types/string.md)。
- `structure` — `'UserID UInt64, Name String'` 形式のテーブル構造。カラム名と型を決定します。型: [String](../../sql-reference/data-types/string.md)。

**戻り値**

指定されたフォーマットと構造、および定義された `URL` からのデータを持つテーブル。

**例**

HTTP サーバーから [CSV](../../interfaces/formats.md#csv) フォーマットで応答する `String` および [UInt32](../../sql-reference/data-types/int-uint.md) 型のカラムを含むテーブルの最初の 3 行を取得します。

1. 標準の Python 3 ツールを使用して基本的な HTTP サーバーを作成し、開始します：

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

## URL 内のグロブ {#globs-in-url}

波括弧 `{ }` 内のパターンは、シャードのセットを生成するためまたはフェイルオーバー アドレスを指定するために使用されます。サポートされているパターンタイプと例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の文字 `|` は、フェイルオーバーアドレスを指定するために使用されます。これらは、パターン内にリストされた順序で反復されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されています。

**関連情報**

-   [HDFS エンジン](../../engines/table-engines/special/url.md)
-   [URL テーブル関数](../../sql-reference/table-functions/url.md)
