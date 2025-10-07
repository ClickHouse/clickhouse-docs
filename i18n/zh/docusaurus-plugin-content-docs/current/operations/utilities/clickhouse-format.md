---
'description': '使用格式工具处理 ClickHouse 数据格式的指南'
'slug': '/operations/utilities/clickhouse-format'
'title': 'clickhouse-format'
'doc_type': 'reference'
---


# clickhouse-format 工具

允许格式化输入查询。

键：

- `--help` 或 `-h` — 输出帮助信息。
- `--query` — 格式化任何长度和复杂度的查询。
- `--hilite` 或 `--highlight` — 使用 ANSI 终端转义序列添加语法高亮。
- `--oneline` — 格式化为单行。
- `--max_line_length` — 格式化为单行查询，其长度小于指定值。
- `--comments` — 在输出中保留注释。
- `--quiet` 或 `-q` — 仅检查语法，成功时无输出。
- `--multiquery` 或 `-n` — 允许在同一文件中包含多个查询。
- `--obfuscate` — 混淆而不是格式化。
- `--seed <string>` — 任意字符串种子，决定混淆的结果。
- `--backslash` — 在格式化查询的每行末尾添加反斜杠。当您从网络或其他地方复制多行查询并希望在命令行中执行时，这非常有用。
- `--semicolons_inline` — 在多查询模式下，将分号写在查询的最后一行，而不是换行。

## 示例 {#examples}

1. 格式化查询：

```bash
$ clickhouse-format --query "select number from numbers(10) where number%2 order by number desc;"
```

结果：

```bash
SELECT number
FROM numbers(10)
WHERE number % 2
ORDER BY number DESC
```

2. 高亮和单行：

```bash
$ clickhouse-format --oneline --hilite <<< "SELECT sum(number) FROM numbers(5);"
```

结果：

```sql
SELECT sum(number) FROM numbers(5)
```

3. 多查询：

```bash
$ clickhouse-format -n <<< "SELECT min(number) FROM numbers(5); SELECT max(number) FROM numbers(5);"
```

结果：

```sql
SELECT min(number)
FROM numbers(5)
;

SELECT max(number)
FROM numbers(5)
;

```

4. 混淆：

```bash
$ clickhouse-format --seed Hello --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

结果：

```sql
SELECT treasury_mammoth_hazelnut BETWEEN nutmeg AND span, CASE WHEN chive >= 116 THEN switching ELSE ANYTHING END;
```

相同的查询和另一个种子字符串：

```bash
$ clickhouse-format --seed World --obfuscate <<< "SELECT cost_first_screen BETWEEN a AND b, CASE WHEN x >= 123 THEN y ELSE NULL END;"
```

结果：

```sql
SELECT horse_tape_summer BETWEEN folklore AND moccasins, CASE WHEN intestine >= 116 THEN nonconformist ELSE FORESTRY END;
```

5. 添加反斜杠：

```bash
$ clickhouse-format --backslash <<< "SELECT * FROM (SELECT 1 AS x UNION ALL SELECT 1 UNION DISTINCT SELECT 3);"
```

结果：

```sql
SELECT * \
FROM  \
( \
    SELECT 1 AS x \
    UNION ALL \
    SELECT 1 \
    UNION DISTINCT \
    SELECT 3 \
)
```
