---
alias: []
description: 'ネイティブフォーマットのドキュメンテーション'
input_format: true
keywords: ['Native']
output_format: true
slug: /interfaces/formats/Native
title: 'ネイティブ'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`Native`フォーマットは、ClickHouseの最も効率的なフォーマットであり、実際に「列指向」であるため、カラムを行に変換しません。  

このフォーマットでは、データはバイナリフォーマットで[ブロック](/development/architecture#block)によって書き込まれ、読み取られます。 
各ブロックごとに、行数、カラム数、カラム名とタイプ、およびブロック内のカラムのパーツが順番に記録されます。 

これは、サーバー間の相互作用、コマンドラインクライアントの使用、C++クライアントのためのネイティブインターフェースで使用されるフォーマットです。

:::tip
このフォーマットを使用して、ClickHouse DBMSによってのみ読み取ることができるダンプを迅速に生成することができます。 
このフォーマットを自分で扱うのは実用的でないかもしれません。
:::

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
