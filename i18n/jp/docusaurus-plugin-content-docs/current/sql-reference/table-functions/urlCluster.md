---
'description': '多くのノードから指定されたクラスター内でURLからファイルを並列処理することを許可します。'
'sidebar_label': 'urlCluster'
'sidebar_position': 201
'slug': '/sql-reference/table-functions/urlCluster'
'title': 'urlCluster'
'doc_type': 'reference'
---


# urlCluster テーブル関数

指定されたクラスター内の多数のノードから URL のファイルを並列処理します。発信者ノードでは、クラスタ内のすべてのノードへの接続を作成し、URL ファイルパス内のアスタリスクを開示し、各ファイルを動的にディスパッチします。ワーカーノードでは、発信者に次に処理すべきタスクを問い合わせ、それを処理します。すべてのタスクが完了するまでこのプロセスを繰り返します。

## 構文 {#syntax}

```sql
urlCluster(cluster_name, URL, format, structure)
```

## 引数 {#arguments}

| 引数             | 説明                                                                                                       |
|------------------|-----------------------------------------------------------------------------------------------------------|
| `cluster_name`   | リモートおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスターの名前。                |
| `URL`            | `GET` リクエストを受け入れることができる HTTP または HTTPS サーバーのアドレス。タイプ: [String](../../sql-reference/data-types/string.md)。    |
| `format`         | データの[フォーマット](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。                           |
| `structure`      | `'UserID UInt64, Name String'`形式のテーブル構造。カラム名とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。 |

## 戻り値 {#returned_value}

指定されたフォーマットと構造、および定義された `URL` からのデータを含むテーブル。

## 例 {#examples}

HTTP サーバーからの `String` および [UInt32](../../sql-reference/data-types/int-uint.md) 型のカラムを含むテーブルの最初の 3 行を取得すること。

1. 標準の Python 3 ツールを使用して基本的な HTTP サーバーを作成し、起動します。

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

中括弧 `{ }` 内のパターンは、シャードのセットを生成するため、またはフェイルオーバーアドレスを指定するために使用されます。サポートされているパターンの種類と例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の文字 `|` は、フェイルオーバーアドレスを指定するために使用されます。それらは、パターンにリストされた順序と同じ順序で繰り返されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されています。

## 関連 {#related}

-   [HDFS エンジン](/engines/table-engines/integrations/hdfs)
-   [URL テーブル関数](/engines/table-engines/special/url)
