---
alias: []
description: 'Nativeフォーマットのドキュメント'
input_format: true
keywords:
- 'Native'
output_format: true
slug: '/interfaces/formats/Native'
title: 'Native'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`Native` フォーマットは、ClickHouse の最も効率的なフォーマットです。なぜなら、これは本当に「列指向」であり、カラムを行に変換しないからです。  

このフォーマットでは、データは [ブロック](/development/architecture#block) にバイナリフォーマットで書き込まれ、読み取られます。各ブロックについて、行数、カラム数、カラム名およびタイプ、ブロック内のカラムの部分が次々と記録されます。 

これはサーバー間のインターフェイス、コマンドラインクライアントの使用、および C++ クライアントとのインタラクションに使用されるフォーマットです。

:::tip
このフォーマットを使用すると、ClickHouse DBMS だけが読み取ることができるダンプを迅速に生成できます。
自分でこのフォーマットで作業するのは実用的ではないかもしれません。
:::

## 例の使用法 {#example-usage}

## フォーマット設定 {#format-settings}
