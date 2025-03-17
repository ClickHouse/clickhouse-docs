---
slug: /operations/utilities/odbc-bridge
title: clickhouse-odbc-bridge
---

ODBCドライバーのプロキシとして機能するシンプルなHTTPサーバーです。主な動機は、ODBC実装における潜在的なセグメンテーションフォルトやその他の障害であり、これが全体のclickhouse-serverプロセスをクラッシュさせる可能性があるからです。

このツールはHTTPを介して動作し、パイプ、共有メモリ、またはTCPを介してではありません。なぜなら：
- 実装が簡単だから
- デバッグが簡単だから
- jdbc-bridgeも同様の方法で実装できるからです

## 使用法 {#usage}

`clickhouse-server` はこのツールをodbcテーブル関数およびStorageODBC内で使用します。しかし、コマンドラインからスタンドアロンツールとしても使用でき、POSTリクエストのURLで以下のパラメーターを指定します：
- `connection_string` -- ODBC接続文字列。
- `sample_block` -- ClickHouseのNamesAndTypesList形式のカラム記述、バックティックで囲まれた名前、文字列としての型。名前と型はスペースで区切られ、行は改行で区切られます。
- `max_block_size` -- オプションのパラメーターで、単一のブロックの最大サイズを設定します。クエリはポストボディに送信され、レスポンスはRowBinary形式で返されます。

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
