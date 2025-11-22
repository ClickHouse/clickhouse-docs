---
alias: []
description: 'Native 形式のドキュメント'
input_format: true
keywords: ['Native']
output_format: true
slug: /interfaces/formats/Native
title: 'Native'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description {#description}

`Native`フォーマットは、列を行に変換せず真に「カラムナ」であるため、ClickHouseで最も効率的なフォーマットです。

このフォーマットでは、データはバイナリ形式で[ブロック](/development/architecture#block)単位で書き込まれ、読み取られます。
各ブロックについて、行数、列数、列名と型、およびブロック内の列の各部分が順次記録されます。

このフォーマットは、サーバー間の通信、コマンドラインクライアントの使用、およびC++クライアント向けのネイティブインターフェースで使用されます。

:::tip
このフォーマットを使用すると、ClickHouse DBMSでのみ読み取り可能なダンプを迅速に生成できます。
ただし、このフォーマットを直接扱うことは実用的ではない場合があります。
:::


## 使用例 {#example-usage}


## フォーマット設定 {#format-settings}
