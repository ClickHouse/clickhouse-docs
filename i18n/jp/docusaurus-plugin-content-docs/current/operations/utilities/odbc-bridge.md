---
description: 'ODBC ブリッジのドキュメント'
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
doc_type: 'reference'
---

ODBC ドライバーのプロキシとして動作するシンプルな HTTP サーバーです。主な目的は、
ODBC 実装におけるセグメンテーションフォールトやその他の不具合によって、
clickhouse-server プロセス全体がクラッシュしてしまう可能性を回避することです。

このツールは、パイプ、共有メモリ、TCP ではなく HTTP 経由で動作します。理由は次のとおりです。
- 実装がより簡単である
- デバッグがより簡単である
- jdbc-bridge も同じ方法で実装できる



## 使用方法 {#usage}

`clickhouse-server`は、ODBCテーブル関数とStorageODBC内でこのツールを使用します。
ただし、POST-リクエストURLに以下のパラメータを指定することで、コマンドラインからスタンドアロンツールとして使用することもできます:

- `connection_string` -- ODBC接続文字列。
- `sample_block` -- ClickHouseのNamesAndTypesList形式でのカラム記述。名前はバッククォートで囲み、
  型は文字列として指定します。名前と型はスペースで区切り、行は改行で区切ります。
- `max_block_size` -- オプションパラメータ。単一ブロックの最大サイズを設定します。
  クエリはPOSTボディで送信されます。レスポンスはRowBinary形式で返されます。


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
