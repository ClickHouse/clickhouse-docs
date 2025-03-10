---
title: 'One'
slug: /interfaces/formats/One
keywords: ['One']
input_format: true
output_format: false
alias: []
---


| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 描述 {#description}

`One` 格式是一种特殊的输入格式，它不从文件中读取任何数据，而是仅返回一行，其中的列类型为 [`UInt8`](../../sql-reference/data-types/int-uint.md)，列名为 `dummy`，值为 `0`（像 `system.one` 表一样）。可以与虚拟列 `_file/_path` 一起使用，以列出所有文件而不读取实际数据。

## 示例用法 {#example-usage}

示例：

```sql title="查询"
SELECT _file FROM file('path/to/files/data*', One);
```

```text title="响应"
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

## 格式设置 {#format-settings}
