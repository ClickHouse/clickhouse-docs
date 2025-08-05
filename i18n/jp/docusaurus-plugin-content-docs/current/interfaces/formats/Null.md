---
alias: []
description: 'Nullフォーマットのドキュメント'
input_format: false
keywords:
- 'Null'
- 'format'
output_format: true
slug: '/interfaces/formats/Null'
title: 'Null'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`Null`フォーマットでは、何も出力されません。 
最初は奇妙に思えるかもしれませんが、何も出力しないにもかかわらず、クエリは依然として処理されることが重要です。 
コマンドラインクライアントを使用する際には、データがクライアントに送信されます。

:::tip
`Null`フォーマットは、性能テストに役立つ場合があります。
:::

## 使用例 {#example-usage}

clickhouseクライアントで`play.clickhouse.com`に接続します：

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

次のクエリを実行します：

```sql title="クエリ"
SELECT town
FROM uk_price_paid
LIMIT 1000
FORMAT `Null`
```

```response title="レスポンス"
0 rows in set. Elapsed: 0.002 sec. Processed 1.00 thousand rows, 2.00 KB (506.97 thousand rows/s., 1.01 MB/s.)
Peak memory usage: 297.74 KiB.
```

1000行が処理されたが、結果セットには0行が出力されたことに注意してください。

## フォーマット設定 {#format-settings}
