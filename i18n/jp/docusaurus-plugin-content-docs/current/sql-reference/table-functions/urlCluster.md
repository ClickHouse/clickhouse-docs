---
description: '指定したクラスタ内の複数ノードで、URL から取得したファイルを並列処理できます。'
sidebar_label: 'urlCluster'
sidebar_position: 201
slug: /sql-reference/table-functions/urlCluster
title: 'urlCluster'
doc_type: 'reference'
---



# urlCluster テーブル関数

指定したクラスタ内の複数ノードから、URL で指定されたファイルを並列に処理できます。イニシエータでは、クラスタ内のすべてのノードへの接続を確立し、URL ファイルパス内のアスタリスクを展開して、各ファイルを動的に振り分けます。ワーカーノードでは、次に処理すべきタスクをイニシエータに問い合わせ、そのタスクを処理します。これは、すべてのタスクが完了するまで繰り返されます。



## 構文 {#syntax}

```sql
urlCluster(cluster_name, URL, format, structure)
```


## 引数 {#arguments}

| 引数       | 説明                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cluster_name` | リモートサーバーおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスター名。                                      |
| `URL`          | `GET`リクエストを受け付けることができるHTTPまたはHTTPSサーバーアドレス。型: [String](../../sql-reference/data-types/string.md)。                               |
| `format`       | データの[フォーマット](/sql-reference/formats)。型: [String](../../sql-reference/data-types/string.md)。                                                |
| `structure`    | `'UserID UInt64, Name String'`形式のテーブル構造。カラム名と型を決定します。型: [String](../../sql-reference/data-types/string.md)。 |


## 戻り値 {#returned_value}

指定された形式と構造を持ち、定義された`URL`からデータを取得したテーブル。


## Examples {#examples}

[CSV](/interfaces/formats/CSV)形式で応答するHTTPサーバーから、`String`型と[UInt32](../../sql-reference/data-types/int-uint.md)型のカラムを含むテーブルの最初の3行を取得します。

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

波括弧 `{ }` 内のパターンは、シャードのセットを生成する、またはフェイルオーバーアドレスを指定するために使用されます。サポートされているパターンタイプと例については、[remote](remote.md#globs-in-addresses)関数の説明を参照してください。
パターン内の文字 `|` は、フェイルオーバーアドレスを指定するために使用されます。これらはパターンに記載されている順序で反復処理されます。生成されるアドレスの数は、[glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements)設定によって制限されます。


## 関連項目 {#related}

- [HDFSエンジン](/engines/table-engines/integrations/hdfs)
- [URLテーブル関数](/engines/table-engines/special/url)
