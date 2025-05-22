| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✗      |       |

## 描述 {#description}

`One` 格式是一种特殊的输入格式，不会从文件中读取任何数据，仅返回一行，包含类型为 [`UInt8`](../../sql-reference/data-types/int-uint.md) 的列，名称为 `dummy`，值为 `0` （类似于 `system.one` 表）。可以与虚拟列 `_file/_path` 一起使用，用于列出所有文件而无需读取实际数据。

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
