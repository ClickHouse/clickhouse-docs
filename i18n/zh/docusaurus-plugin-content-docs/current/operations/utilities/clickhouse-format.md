---
slug: /operations/utilities/clickhouse-format
title: 'clickhouse-format'
---

允许格式化输入查询。

键：

- `--help` 或 `-h` — 生成帮助信息。
- `--query` — 格式化任何长度和复杂性的查询。
- `--hilite` — 使用 ANSI 终端转义序列添加语法高亮。
- `--oneline` — 格式化为单行。
- `--max_line_length` — 格式化为长度小于指定值的单行查询。
- `--comments` — 保留输出中的注释。
- `--quiet` 或 `-q` — 仅检查语法，成功时无输出。
- `--multiquery` 或 `-n` — 允许在同一文件中包含多个查询。
- `--obfuscate` — 混淆而不是格式化。
- `--seed <string>` — 任意字符串的种子，决定混淆结果。
- `--backslash` — 在格式化查询的每行末尾添加反斜杠。 当您从网页或其他地方复制多行查询并希望在命令行中执行时，这非常有用。

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
