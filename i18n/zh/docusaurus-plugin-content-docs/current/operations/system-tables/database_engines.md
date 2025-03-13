---
description: '系统表，包含服务器支持的数据库引擎列表。'
slug: /operations/system-tables/database_engines
title: 'system.database_engines'
keywords: ['system table', 'database_engines']
---

包含服务器支持的数据库引擎列表。

该表包含以下列（列类型显示在括号中）：

- `name` (String) — 数据库引擎的名称。

示例：

``` sql
SELECT *
FROM system.database_engines
WHERE name in ('Atomic', 'Lazy', 'Ordinary')
```

``` text
┌─name─────┐
│ Ordinary │
│ Atomic   │
│ Lazy     │
└──────────┘
```
