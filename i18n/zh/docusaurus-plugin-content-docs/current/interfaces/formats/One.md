---
'alias': []
'description': 'One 格式的文档'
'input_format': true
'keywords':
- 'One'
'output_format': false
'slug': '/interfaces/formats/One'
'title': 'One'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 描述 {#description}

`One` 格式是一种特殊的输入格式，它不从文件中读取任何数据，仅返回一行，列类型为 [`UInt8`](../../sql-reference/data-types/int-uint.md)，名称为 `dummy`，值为 `0`（如同 `system.one` 表）。可以与虚拟列 `_file/_path` 一起使用，以列出所有文件而无需读取实际数据。

## 示例用法 {#example-usage}

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
