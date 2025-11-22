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

`One` 格式是一种特殊的输入格式,不从文件读取任何数据,仅返回一行,该行包含一个类型为 [`UInt8`](../../sql-reference/data-types/int-uint.md)、名称为 `dummy`、值为 `0` 的列(类似于 `system.one` 表)。
可与虚拟列 `_file/_path` 配合使用来列出所有文件,而无需读取实际数据。


## 使用示例 {#example-usage}

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
