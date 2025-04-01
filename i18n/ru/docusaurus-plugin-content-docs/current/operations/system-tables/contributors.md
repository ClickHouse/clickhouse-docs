---
description: 'Системная таблица, содержащая информацию о контрибьюторах.'
keywords: ['системная таблица', 'контрибьюторах']
slug: /operations/system-tables/contributors
title: 'system.contributors'
---

Содержит информацию о контрибьюторах. Порядок результатов случайный в момент выполнения запроса.

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

Чтобы узнать себя в таблице, используйте запрос:

```sql
SELECT * FROM system.contributors WHERE name = 'Olga Khvostikova'
```

```text
┌─name─────────────┐
│ Olga Khvostikova │
└──────────────────┘
```
