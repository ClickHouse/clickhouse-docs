---
alias: []
description: 'One フォーマットに関するドキュメント'
input_format: true
keywords: ['One']
output_format: false
slug: /interfaces/formats/One
title: 'One'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |



## 説明 {#description}

`One` フォーマットは、ファイルから一切データを読み込まず、[`UInt8`](../../sql-reference/data-types/int-uint.md) 型の `dummy` という名前のカラムを 1 列だけ持つ 1 行（値は `0`）だけを返す、特別な入力フォーマットです（`system.one` テーブルと同様）。
仮想カラム `_file/_path` と組み合わせることで、実際のデータを読み込まずにすべてのファイルを一覧表示するために使用できます。



## 使用例 {#example-usage}

例：

```sql title="Query"
SELECT _file FROM file('path/to/files/data*', One);
```

```text title="Response"
┌─_file────┐
│ data.csv │
└──────────┘
┌─_file──────┐
│ data.jsonl │
└────────────┘
┌─_file────┐
│ data.tsv │
└──────────┘
┌─_file────────┐
│ data.parquet │
└──────────────┘
```


## フォーマット設定 {#format-settings}