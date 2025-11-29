---
alias: []
description: 'One 格式文档'
input_format: true
keywords: ['One']
output_format: false
slug: /interfaces/formats/One
title: 'One'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✗      |       |



## 描述 {#description}

`One` 格式是一种特殊的输入格式，它不会从文件中读取任何数据，而是只返回一行数据，该行包含一列，类型为 [`UInt8`](../../sql-reference/data-types/int-uint.md)、名称为 `dummy`、值为 `0`（类似于 `system.one` 表）。
可以配合虚拟列 `_file/_path` 使用，在不读取实际数据的情况下列出所有文件。



## 使用示例 {#example-usage}

示例：

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


## 格式设置 {#format-settings}