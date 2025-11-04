---
'description': '系统表，包含服务器支持的数据库引擎列表。'
'keywords':
- 'system table'
- 'database_engines'
'slug': '/operations/system-tables/database_engines'
'title': 'system.database_engines'
'doc_type': 'reference'
---

包含服务器支持的数据库引擎列表。

该表包含以下列（列类型以括号表示）：

- `name` (String) — 数据库引擎的名称。

示例：

```sql
SELECT *
FROM system.database_engines
WHERE name IN ('Atomic', 'Lazy', 'Ordinary')
```

```text
┌─name─────┐
│ Ordinary │
│ Atomic   │
│ Lazy     │
└──────────┘
```
