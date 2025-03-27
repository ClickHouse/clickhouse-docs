---
description: 'Таблица системы, содержащая информацию о контрибьюторах.'
keywords: ['системная таблица', 'контрибьюторы']
slug: /operations/system-tables/contributors
title: 'system.contributors'
---

Содержит информацию о контрибьюторах. Порядок случайный на момент выполнения запроса.

Столбцы:

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
