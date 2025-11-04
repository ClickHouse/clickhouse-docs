---
slug: '/operations/system-tables/database_engines'
description: 'Системная таблица, содержащая список движков БАЗ ДАННЫХ, поддерживаемых'
title: system.database_engines
keywords: ['системная таблица', 'движки баз данных']
doc_type: reference
---
Содержит список движков баз данных, поддерживаемых сервером.

Эта таблица включает следующие столбцы (тип столбца показан в скобках):

- `name` (String) — Название движка базы данных.

Пример:

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