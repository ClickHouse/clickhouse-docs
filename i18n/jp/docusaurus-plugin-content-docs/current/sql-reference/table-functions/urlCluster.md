---
description: '指定したクラスター内の複数ノードで、URL から取得したファイルを並列処理できるようにします。'
sidebar_label: 'urlCluster'
sidebar_position: 201
slug: /sql-reference/table-functions/urlCluster
title: 'urlCluster'
doc_type: 'reference'
---



# urlCluster テーブル関数

指定したクラスタ内の複数ノードで、URL から取得したファイルを並列処理できます。イニシエーター側では、クラスタ内のすべてのノードへの接続を確立し、URL のファイルパス中のアスタリスクを展開して、各ファイルを動的に割り当てます。ワーカーノードでは、処理すべき次のタスクをイニシエーターに問い合わせ、そのタスクを処理します。これは、すべてのタスクが完了するまで繰り返されます。



## 構文

```sql
urlCluster(cluster_name, URL, format, structure)
```


## 引数 {#arguments}

| 引数           | 説明                                                                                                                                                     |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name` | リモートおよびローカルサーバーへのアドレスおよび接続パラメーターの集合を構成するために使用されるクラスター名。                                             |
| `URL`          | `GET` リクエストを受け付け可能な HTTP または HTTPS サーバーのアドレス。型: [String](../../sql-reference/data-types/string.md)。                           |
| `format`       | データの[フォーマット](/sql-reference/formats)。型: [String](../../sql-reference/data-types/string.md)。                                                 |
| `structure`    | `'UserID UInt64, Name String'` の形式のテーブル構造。カラム名と型を決定する。型: [String](../../sql-reference/data-types/string.md)。                    |



## 戻り値 {#returned_value}

指定されたフォーマットと構造を持ち、定義された `URL` から取得したデータを含むテーブル。



## 例

`String` 列と [UInt32](../../sql-reference/data-types/int-uint.md) 型の列を含むテーブルについて、[CSV](/interfaces/formats/CSV) 形式で応答する HTTP サーバー経由で先頭 3 行を取得します。

1. 標準の Python 3 ツールを使用して基本的な HTTP サーバーを作成し、起動します。

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class CSVHTTPServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/csv')
        self.end_headers()

        self.wfile.write(bytes('こんにちは,1\n世界,2\n', "utf-8"))

if __name__ == "__main__":
    server_address = ('127.0.0.1', 12345)
    HTTPServer(server_address, CSVHTTPServer).serve_forever()
```

```sql
SELECT * FROM urlCluster('cluster_simple','http://127.0.0.1:12345', CSV, 'column1 String, column2 UInt32')
```


## URL のグロブ {#globs-in-url}

波括弧 `{ }` 内のパターンは、シャード集合の生成やフェイルオーバーアドレスの指定に使用されます。サポートされているパターンの型と例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の文字 `|` はフェイルオーバーアドレスを指定するために使用されます。これらはパターン内で列挙された順に試行されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されます。



## 関連項目 {#related}

-   [HDFS エンジン](/engines/table-engines/integrations/hdfs)
-   [URL テーブル関数](/engines/table-engines/special/url)
