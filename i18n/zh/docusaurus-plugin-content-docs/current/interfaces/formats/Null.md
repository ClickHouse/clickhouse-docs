---
'alias': []
'description': 'Null 格式的文档'
'input_format': false
'keywords':
- 'Null'
- 'format'
'output_format': true
'slug': '/interfaces/formats/Null'
'title': 'Null'
'doc_type': 'reference'
---

| 输入  | 输出  | 别名  |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

在 `Null` 格式下 - 不会输出任何内容。 
这听起来可能有点奇怪，但重要的是要注意，尽管没有输出内容，查询仍然会被处理，并且在使用命令行客户端时，数据会被传输到客户端。

:::tip
`Null` 格式对于性能测试可能很有用。
:::

## 示例用法 {#example-usage}

### 读取数据 {#reading-data}

考虑一个名为 `football` 的表，具有以下数据：

```text
    ┌───────date─┬─season─┬─home_team─────────────┬─away_team───────────┬─home_team_goals─┬─away_team_goals─┐
 1. │ 2022-04-30 │   2021 │ Sutton United         │ Bradford City       │               1 │               4 │
 2. │ 2022-04-30 │   2021 │ Swindon Town          │ Barrow              │               2 │               1 │
 3. │ 2022-04-30 │   2021 │ Tranmere Rovers       │ Oldham Athletic     │               2 │               0 │
 4. │ 2022-05-02 │   2021 │ Port Vale             │ Newport County      │               1 │               2 │
 5. │ 2022-05-02 │   2021 │ Salford City          │ Mansfield Town      │               2 │               2 │
 6. │ 2022-05-07 │   2021 │ Barrow                │ Northampton Town    │               1 │               3 │
 7. │ 2022-05-07 │   2021 │ Bradford City         │ Carlisle United     │               2 │               0 │
 8. │ 2022-05-07 │   2021 │ Bristol Rovers        │ Scunthorpe United   │               7 │               0 │
 9. │ 2022-05-07 │   2021 │ Exeter City           │ Port Vale           │               0 │               1 │
10. │ 2022-05-07 │   2021 │ Harrogate Town A.F.C. │ Sutton United       │               0 │               2 │
11. │ 2022-05-07 │   2021 │ Hartlepool United     │ Colchester United   │               0 │               2 │
12. │ 2022-05-07 │   2021 │ Leyton Orient         │ Tranmere Rovers     │               0 │               1 │
13. │ 2022-05-07 │   2021 │ Mansfield Town        │ Forest Green Rovers │               2 │               2 │
14. │ 2022-05-07 │   2021 │ Newport County        │ Rochdale            │               0 │               2 │
15. │ 2022-05-07 │   2021 │ Oldham Athletic       │ Crawley Town        │               3 │               3 │
16. │ 2022-05-07 │   2021 │ Stevenage Borough     │ Salford City        │               4 │               2 │
17. │ 2022-05-07 │   2021 │ Walsall               │ Swindon Town        │               0 │               3 │
    └────────────┴────────┴───────────────────────┴─────────────────────┴─────────────────┴─────────────────┘
```

使用 `Null` 格式读取数据：

```sql
SELECT *
FROM football
FORMAT Null
```

查询将处理数据，但不会输出任何内容。

```response
0 rows in set. Elapsed: 0.154 sec.
```

## 格式设置 {#format-settings}
