---
title: Native
slug: /interfaces/formats/Native
keywords: [Native]
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

`Native`フォーマットはClickHouseの最も効率的なフォーマットです。これは、本当に「列指向」であり、カラムを行に変換しないためです。  

このフォーマットでは、データは[ブロック](/development/architecture#block)ごとにバイナリ形式で書き込まれ、読み取られます。 
各ブロックには、行数、カラム数、カラム名と型、ブロック内のカラムのパーツが順番に記録されます。

これは、サーバー間のインターフェース、コマンドラインクライアントの使用、C++クライアントのためのネイティブインターフェースで使用されるフォーマットです。

:::tip
このフォーマットを使用して、ClickHouse DBMSによってのみ読み取ることができるダンプを迅速に生成することができます。 
自分自身でこのフォーマットを扱うのは、実用的ではないかもしれません。
:::

## Example Usage {#example-usage}

## Format Settings {#format-settings}
