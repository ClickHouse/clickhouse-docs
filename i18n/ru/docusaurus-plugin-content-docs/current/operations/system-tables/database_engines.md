---
description: 'Системная таблица, содержащая список движков баз данных, поддерживаемых сервером.'
keywords: ['системная таблица', 'движки баз данных']
slug: /operations/system-tables/database_engines
title: 'system.database_engines'
---

Содержит список движков баз данных, поддерживаемых сервером.

Эта таблица содержит следующие колонки (тип колонки указан в скобках):

- `name` (String) — Название движка базы данных.

Пример:

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
