---
'slug': '/sql-reference/table-functions/generate_series'
'sidebar_position': 146
'sidebar_label': 'generate_series'
'title': 'generate_series (generateSeries)'
'description': '返回一个包含单个 `generate_series` 列 （UInt64）的表，该列包含从起始到结束的整数（包括起始和结束）。'
---


# generate_series 表函数

别名: `generateSeries`

## 语法 {#syntax}

返回一个只有单个 'generate_series' 列 (`UInt64`) 的表，该列包含从起始值到结束值（包含）之间的整数：

```sql
generate_series(START, STOP)
```

返回一个只有单个 'generate_series' 列 (`UInt64`) 的表，该列包含从起始值到结束值（包含）之间的整数，值之间的间隔由 `STEP` 指定：

```sql
generate_series(START, STOP, STEP)
```

## 示例 {#examples}

以下查询返回内容相同但列名不同的表：

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

以下查询返回内容相同但列名不同的表（但第二个选项更高效）：

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
