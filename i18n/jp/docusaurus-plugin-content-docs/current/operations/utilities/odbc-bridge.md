---
description: 'Odbc Bridgeに関するドキュメント'
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
---

ODBCドライバーのプロキシとして機能するシンプルなHTTPサーバーです。主な動機は、ODBC実装における可能なセグメンテーションフォルトやその他のエラーであり、これが全体のclickhouse-serverプロセスをクラッシュさせる可能性があります。

このツールはHTTPを介して動作し、パイプ、共有メモリ、またはTCPを介しては動作しません。理由は以下の通りです：
- 実装が簡単
- デバッグが簡単
- jdbc-bridgeも同様の方法で実装可能

## 使用法 {#usage}

`clickhouse-server`は、このツールをODBCテーブル関数内やStorageODBC内で使用します。しかし、以下のパラメータを持つPOSTリクエストURLからコマンドラインでスタンドアロンツールとして使用することもできます：
- `connection_string` -- ODBC接続文字列。
- `sample_block` -- ClickHouseのNamesAndTypesList形式でのカラムの説明。名前はバッククォートで囲み、タイプは文字列で示します。名前とタイプはスペースで区切られ、行は改行で区切られます。
- `max_block_size` -- オプションのパラメータ、単一ブロックの最大サイズを設定します。クエリはPOSTボディで送信され、レスポンスはRowBinary形式で返されます。

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
