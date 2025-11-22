---
alias: []
description: 'One フォーマットのドキュメント'
input_format: true
keywords: ['One']
output_format: false
slug: /interfaces/formats/One
title: 'One'
doc_type: 'reference'
---

| Input | Output | 別名 |
|-------|--------|-------|
| ✔     | ✗      |       |



## 説明 {#description}

`One`フォーマットは、ファイルからデータを読み取らず、[`UInt8`](../../sql-reference/data-types/int-uint.md)型のカラム(名前は`dummy`、値は`0`)を持つ1行のみを返す特殊な入力フォーマットです(`system.one`テーブルと同様)。
仮想カラム`_file/_path`と組み合わせて使用することで、実際のデータを読み取ることなくすべてのファイルを一覧表示できます。


## 使用例 {#example-usage}

例:

```sql title="クエリ"
SELECT _file FROM file('path/to/files/data*', One);
```

```text title="レスポンス"
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
