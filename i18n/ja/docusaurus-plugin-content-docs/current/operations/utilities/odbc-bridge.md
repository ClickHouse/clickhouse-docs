---
slug: /operations/utilities/odbc-bridge
title: clickhouse-odbc-bridge
---

ODBCドライバ用のプロキシのように動作するシンプルなHTTPサーバーです。主な動機は、ODBC実装でのセグメンテーションフォルトやその他のエラーが発生する可能性で、これが全体のclickhouse-serverプロセスをクラッシュさせる可能性があるためです。

このツールはHTTP経由で動作し、パイプ、共有メモリ、またはTCP経由ではありません。理由は以下の通りです：
- 実装が簡単
- デバッグが簡単
- jdbc-bridgeも同様に実装可能

## 使い方 {#usage}

`clickhouse-server`は、このツールをodbcテーブル関数とStorageODBCの内部で使用します。しかし、コマンドラインからスタンドアロンツールとしても使用でき、POSTリクエストURLに以下のパラメータを指定します：
- `connection_string` -- ODBC接続文字列。
- `sample_block` -- ClickHouseのNamesAndTypesList形式でのカラムの説明で、名前はバッククオートで囲み、タイプは文字列で示します。名前とタイプはスペースで区切られ、行は改行で区切られます。
- `max_block_size` -- オプションのパラメータで、単一ブロックの最大サイズを設定します。クエリはPOSTボディに送信されます。レスポンスはRowBinary形式で返されます。

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
