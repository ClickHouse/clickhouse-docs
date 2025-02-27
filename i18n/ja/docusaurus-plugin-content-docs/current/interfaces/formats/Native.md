---
title : Native
slug: /interfaces/formats/Native
keywords : [Native]
input_format: true
output_format: true
alias: []
---

| 入力  | 出力  | 別名  |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`Native`形式は、ClickHouseの最も効率的な形式であり、真に「列指向」で、カラムを行に変換しないためです。

この形式では、データは[ブロック](/development/architecture#block)によってバイナリ形式で書き込まれ、読み取られます。各ブロックについて、行数、カラム数、カラム名とタイプ、ブロック内のカラムの部分が逐次記録されます。

これは、サーバー間のインターフェース、コマンドラインクライアントの使用、およびC++クライアントとの対話に使用される形式です。

:::tip
この形式を使用して、ClickHouse DBMSのみが読み取ることができるダンプを迅速に生成できます。
この形式で作業することは実用的ではないかもしれません。
:::

## 使用例 {#example-usage}

## 形式設定 {#format-settings}
