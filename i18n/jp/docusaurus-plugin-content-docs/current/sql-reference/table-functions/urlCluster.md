---
description: 'Allows processing files from URL in parallel from many nodes in a
  specified cluster.'
sidebar_label: 'urlCluster'
sidebar_position: 201
slug: '/sql-reference/table-functions/urlCluster'
title: 'urlCluster'
---




# urlCluster テーブル関数

指定されたクラスター内の多くのノードから、URLのファイルを並行して処理することを可能にします。イニシエーターでは、クラスター内のすべてのノードへの接続を作成し、URLファイルパスのアスタリスクを明示し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクを尋ね、それを処理します。これをすべてのタスクが完了するまで繰り返します。

## 構文 {#syntax}

```sql
urlCluster(cluster_name, URL, format, structure)
```

## 引数 {#arguments}

| 引数            | 説明                                                                                                                                           |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name` | リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。                                                                 |
| `URL`          | `GET`リクエストを受け入れることができるHTTPまたはHTTPSサーバーのアドレス。タイプ: [String](../../sql-reference/data-types/string.md)。                                                  |
| `format`       | データの[フォーマット](/sql-reference/formats)。タイプ: [String](../../sql-reference/data-types/string.md)。                                                                 |
| `structure`    | `'UserID UInt64, Name String'`形式のテーブル構造。カラムの名前とタイプを決定します。タイプ: [String](../../sql-reference/data-types/string.md)。                                            |

## 戻り値 {#returned_value}

指定されたフォーマットおよび構造を持ち、定義された`URL`からのデータを含むテーブル。

## 例 {#examples}

HTTPサーバーから `String` および [UInt32](../../sql-reference/data-types/int-uint.md) 型のカラムを含むテーブルの最初の3行を取得します。サーバーは [CSV](../../interfaces/formats.md#csv) フォーマットで応答します。

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

```sql
SELECT * FROM urlCluster('cluster_simple','http://127.0.0.1:12345', CSV, 'column1 String, column2 UInt32')
```

## URL のグロブ {#globs-in-url}

中括弧 `{ }` 内のパターンは、シャードのセットを生成したり、フェイルオーバーアドレスを指定するために使用されます。サポートされているパターンのタイプと例については、[remote](remote.md#globs-in-addresses) 関数の説明を参照してください。
パターン内の文字 `|` は、フェイルオーバーアドレスを指定するために使用されます。リストされている順序と同じ順序で反復されます。生成されるアドレスの数は [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 設定によって制限されます。

## 関連項目 {#related}

-   [HDFS エンジン](../../engines/table-engines/special/url.md)
-   [URL テーブル関数](../../sql-reference/table-functions/url.md)
