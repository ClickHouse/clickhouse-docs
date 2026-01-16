---
description: 'Odbc Bridge のドキュメント'
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
doc_type: 'reference'
---

ODBC ドライバーのプロキシとして動作するシンプルな HTTP サーバーです。主な目的は、
ODBC 実装におけるセグメンテーションフォルトやその他の不具合によって
clickhouse-server のプロセス全体がクラッシュしてしまう可能性を回避することです。

このツールは、パイプ、共有メモリ、TCP ではなく HTTP 経由で動作します。その理由は次のとおりです。
- 実装がより簡単である
- デバッグがより簡単である
- jdbc-bridge も同様の方法で実装できる

## 使用方法 \{#usage\}

`clickhouse-server` は、このツールを ODBC テーブル関数および StorageODBC 内で使用します。
ただし、POST リクエストの URL に以下のパラメータを指定することで、コマンドラインからスタンドアロンのツールとして使用することもできます:
- `connection_string` -- ODBC 接続文字列。
- `sample_block` -- カラムの定義を ClickHouse の NamesAndTypesList 形式で指定します。名前はバッククォートで囲み、
  型は文字列とします。名前と型はスペース区切りで、行は改行区切りです。
- `max_block_size` -- オプションのパラメータで、1 ブロックあたりの最大サイズを設定します。
クエリは POST リクエストのボディで送信されます。応答は RowBinary 形式で返されます。

## 例： \{#example\}

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
