---
alias: []
description: 'Null フォーマットのドキュメント'
input_format: false
keywords: ['Null', 'format']
output_format: true
slug: /interfaces/formats/Null
title: 'Null'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`Null` フォーマットでは、何も出力されません。 
最初は奇妙に聞こえるかもしれませんが、出力が何もないにもかかわらず、クエリは処理され、 
コマンドラインクライアントを使用する際にはデータがクライアントに送信されることに注意が必要です。

:::tip
`Null` フォーマットはパフォーマンステストに役立ちます。
:::

## 使用例 {#example-usage}

clickhouse クライアントを使って `play.clickhouse.com` に接続します:

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

次のクエリを実行します:

```sql title="Query"
SELECT town
FROM uk_price_paid
LIMIT 1000
FORMAT `Null`
```

```response title="Response"
0 行がセットに含まれています。経過時間: 0.002 秒。処理された行数: 1.00 千行、2.00 KB (506.97 千行/秒、1.01 MB/秒)。
ピークメモリ使用量: 297.74 KiB。
```

1000行が処理されたが、結果セットには0行が出力されたことに注意してください。

## フォーマット設定 {#format-settings}
