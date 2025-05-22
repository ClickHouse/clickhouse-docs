包含服务器支持的数据库引擎列表。

此表包含以下列（列类型在括号中显示）：

- `name` (String) — 数据库引擎的名称。

示例：

```sql
SELECT *
FROM system.database_engines
WHERE name in ('Atomic', 'Lazy', 'Ordinary')
```

```text
┌─name─────┐
│ Ordinary │
│ Atomic   │
│ Lazy     │
└──────────┘
```
