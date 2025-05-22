---
'description': 'Documentation for Odbc Bridge'
'slug': '/operations/utilities/odbc-bridge'
'title': 'clickhouse-odbc-bridge'
---



シンプルなHTTPサーバーは、ODBCドライバのプロキシとして機能します。主な動機は、ODBC実装におけるセグメンテーションフォルトやその他のエラーが、全体のclickhouse-serverプロセスをクラッシュさせる可能性があるためです。

このツールはHTTPを介して動作し、パイプ、共有メモリ、またはTCPを介してではありません。理由は以下の通りです：
- 実装が簡単であること
- デバッグが簡単であること
- jdbc-bridgeを同様に実装できること

## 使用法 {#usage}

`clickhouse-server`は、ODBCテーブル関数およびStorageODBC内部でこのツールを使用します。
ただし、次のパラメータを持つPOSTリクエストURLからコマンドラインでスタンドアロンツールとして使用することもできます：
- `connection_string` -- ODBC接続文字列。
- `sample_block` -- ClickHouse NamesAndTypesList形式でのカラムの説明、名前はバックティックで囲み、
  タイプは文字列として指定します。名前とタイプは空白で区切られ、行は
  改行で区切られます。
- `max_block_size` -- オプションのパラメータで、単一ブロックの最大サイズを設定します。
クエリはPOSTボディに送信されます。レスポンスはRowBinary形式で返されます。

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
