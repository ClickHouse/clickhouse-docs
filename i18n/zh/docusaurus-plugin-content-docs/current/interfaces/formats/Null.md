---
'alias': []
'description': 'Null格式文档'
'input_format': false
'keywords':
- 'Null'
- 'format'
'output_format': true
'slug': '/interfaces/formats/Null'
'title': 'Null'
---



| 输入  | 输出   | 别名  |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

在 `Null` 格式中 - 不会输出任何内容。 
这乍听起来可能有些奇怪，但重要的是要注意，尽管没有输出任何内容，查询仍然被处理，并且在使用命令行客户端时，数据会传输到客户端。 

:::tip
`Null` 格式在性能测试中可能很有用。
:::

## 示例用法 {#example-usage}

使用 clickhouse 客户端连接到 `play.clickhouse.com`：

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

运行以下查询：

```sql title="Query"
SELECT town
FROM uk_price_paid
LIMIT 1000
FORMAT `Null`
```

```response title="Response"
0 rows in set. Elapsed: 0.002 sec. Processed 1.00 thousand rows, 2.00 KB (506.97 thousand rows/s., 1.01 MB/s.)
Peak memory usage: 297.74 KiB.
```

注意，虽然处理了 1000 行，但结果集中输出了 0 行。

## 格式设置 {#format-settings}
