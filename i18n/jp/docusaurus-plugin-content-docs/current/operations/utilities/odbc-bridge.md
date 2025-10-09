---
'description': 'Odbc Bridge に関するドキュメント'
'slug': '/operations/utilities/odbc-bridge'
'title': 'clickhouse-odbc-bridge'
'doc_type': 'reference'
---

シンプルなHTTPサーバーで、ODBCドライバーのプロキシとして機能します。主な動機は、ODBCの実装内での可能なセグメンテーションフォルトやその他のエラーにあり、これが全体のclickhouse-serverプロセスをクラッシュさせる可能性があるからです。

このツールはHTTP経由で動作し、パイプ、共有メモリ、またはTCP経由ではありません。理由は以下の通りです：
- 実装が簡単です
- デバッグが簡単です
- jdbc-bridgeも同様の方法で実装できます

## 使用法 {#usage}

`clickhouse-server`は、このツールをodbcテーブル関数とStorageODBC内で使用します。しかし、コマンドラインからスタンドアロンツールとしても、以下のパラメータを含むPOSTリクエストURLで使用できます：
- `connection_string` -- ODBC接続文字列。
- `sample_block` -- ClickHouseのNamesAndTypesList形式によるカラムの説明。名前はバックティックで囲み、タイプは文字列として記述します。名前とタイプはスペースで区切られ、行は改行で区切られます。
- `max_block_size` -- オプションのパラメータで、単一のブロックの最大サイズを設定します。クエリはポストボディに送信され、レスポンスはRowBinary形式で返されます。

## 例: {#example}

```bash
$ clickhouse-odbc-bridge --http-port 9018 --daemon

$ curl -d "query=SELECT PageID, ImpID, AdType FROM Keys ORDER BY PageID, ImpID" --data-urlencode "connection_string=DSN=ClickHouse;DATABASE=stat" --data-urlencode "sample_block=columns format version: 1
3 columns:
\`PageID\` String
\`ImpID\` String
\`AdType\` String
"  "http://localhost:9018/" > result.txt

$ cat result.txt
12246623837185725195925621517
```
