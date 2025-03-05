---
title: One
slug: /interfaces/formats/One
keywords: [One]
input_format: true
output_format: false
alias: []
---


| 入力   | 出力   | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

`One` フォーマットは、ファイルからデータを読み取らず、[`UInt8`](../../sql-reference/data-types/int-uint.md) 型のカラム `dummy` を持つ 1 行のみを返す特別な入力フォーマットです（`system.one` テーブルのように）。実際のデータを読み込むことなく、仮想カラム `_file/_path` と共に使用して、すべてのファイルをリストすることができます。

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
