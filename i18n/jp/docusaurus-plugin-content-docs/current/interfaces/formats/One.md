---
alias: []
description: 'One formatのドキュメント'
input_format: true
keywords:
- 'One'
output_format: false
slug: '/interfaces/formats/One'
title: 'One'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

`One` フォーマットは特別な入力フォーマットで、ファイルからデータを読み込まず、カラムの型が [`UInt8`](../../sql-reference/data-types/int-uint.md) で名前が `dummy`、値が `0` という1行のみを返します（`system.one` テーブルのように）。実際のデータを読み込まずに、すべてのファイルをリストするために仮想カラム `_file/_path` と共に使用できます。

## 使用例 {#example-usage}

例：

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
