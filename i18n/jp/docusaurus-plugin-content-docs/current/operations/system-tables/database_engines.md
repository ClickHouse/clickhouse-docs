---
'description': 'システムテーブルは、サーバーによってサポートされているデータベースエンジンのリストを含んでいます。'
'keywords':
- 'system table'
- 'database_engines'
'slug': '/operations/system-tables/database_engines'
'title': 'system.database_engines'
'doc_type': 'reference'
---

Contains the list of database engines supported by the server.

このテーブルには以下のカラムが含まれています（カラムの型はカッコ内に示されています）：

- `name` (String) — データベースエンジンの名前。

例：

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
