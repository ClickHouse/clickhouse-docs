---
alias: []
description: 'One形式のドキュメント'
input_format: true
keywords: ['One']
output_format: false
slug: /interfaces/formats/One
title: 'One'
---


| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

`One`形式は、ファイルからデータを読み取ることなく、[`UInt8`](../../sql-reference/data-types/int-uint.md)型のカラムを持つ1行だけを返す特別な入力形式です。カラムの名前は`dummy`で、値は`0`です（`system.one`テーブルのように）。
実際のデータを読み取ることなく、仮想カラム`_file/_path`を使用して、すべてのファイルをリスト表示するのに使用できます。

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

## 形式設定 {#format-settings}
