---
alias: []
description: 'Native フォーマットのドキュメント'
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



## 説明 {#description}

`Native` フォーマットは、カラムを行に変換しないという意味で真の「カラム指向」であり、ClickHouse において最も効率的なフォーマットです。  

このフォーマットでは、データはバイナリ形式で [ブロック](/development/architecture#block) ごとに書き込みおよび読み取りが行われます。各ブロックについて、行数、カラム数、カラム名と型、およびブロック内の各カラムのデータが順番に記録されます。 

このフォーマットは、サーバー間のやり取りに使われるネイティブインターフェイス、コマンドラインクライアント、および C++ クライアントで使用されます。

:::tip
このフォーマットを使用して、ClickHouse DBMS でのみ読み取ることができるダンプを高速に生成できます。 
ただし、このフォーマットを手作業で扱うのは現実的ではない場合があります。
:::



## 使用例 {#example-usage}



## 書式設定 {#format-settings}