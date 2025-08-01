---
description: 'サーバーでサポートされているデータベースエンジンのリストを含むシステムテーブル。'
keywords:
- 'system table'
- 'database_engines'
slug: '/operations/system-tables/database_engines'
title: 'system.database_engines'
---



データベースエンジンのリストがサーバーによってサポートされています。

この表には以下のカラムが含まれています（カラムのタイプは括弧内に示されています）：

- `name` (String) — データベースエンジンの名前。

例：

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
