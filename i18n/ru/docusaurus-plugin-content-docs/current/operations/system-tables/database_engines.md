---
description: 'Системная таблица, содержащая список движков баз данных, поддерживаемых сервером.'
slug: /operations/system-tables/database_engines
title: 'system.database_engines'
keywords: ['system table', 'database_engines']
---

Содержит список движков баз данных, поддерживаемых сервером.

Эта таблица содержит следующие колонки (тип колонки указан в скобках):

- `name` (String) — Название движка базы данных.

Пример:

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
