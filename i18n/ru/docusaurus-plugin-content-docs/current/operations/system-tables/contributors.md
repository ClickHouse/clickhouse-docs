---
slug: '/operations/system-tables/contributors'
description: 'Системная таблица, содержащая информацию о контрибьюторах.'
title: system.contributors
keywords: ['системная таблица', 'контрибьюторах']
doc_type: reference
---
Содержит информацию о контрибьюторах. Порядок произвольный во время выполнения запроса.

Колонки:

- `name` (String) — Имя контрибьютора (автора) из git log.

**Пример**

```sql
SELECT * FROM system.contributors LIMIT 10
```

```text
┌─name─────────────┐
│ Olga Khvostikova │
│ Max Vetrov       │
│ LiuYangkuan      │
│ svladykin        │
│ zamulla          │
│ Šimon Podlipský  │
│ BayoNet          │
│ Ilya Khomutov    │
│ Amy Krishnevsky  │
│ Loud_Scream      │
└──────────────────┘
```

Чтобы найти себя в таблице, используйте запрос:

```sql
SELECT * FROM system.contributors WHERE name = 'Olga Khvostikova'
```

```text
┌─name─────────────┐
│ Olga Khvostikova │
└──────────────────┘
```