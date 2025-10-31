---
slug: '/operations/system-tables/data_type_families'
description: 'Системная таблица, содержащая информацию о поддерживаемых типах данных'
title: system.data_type_families
keywords: ['системная таблица', 'семейства_типов_данных']
doc_type: reference
---
Содержит информацию о поддерживаемых [типах данных](../../sql-reference/data-types/index.md).

Колонки:

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя типа данных.
- `case_insensitive` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Свойство, показывающее, можно ли использовать имя типа данных в запросе без учета регистра или нет. Например, `Date` и `date` оба являются допустимыми.
- `alias_to` ([String](../../sql-reference/data-types/string.md)) — Имя типа данных, для которого `name` является псевдонимом.

**Пример**

```sql
SELECT * FROM system.data_type_families WHERE alias_to = 'String'
```

```text
┌─name───────┬─case_insensitive─┬─alias_to─┐
│ LONGBLOB   │                1 │ String   │
│ LONGTEXT   │                1 │ String   │
│ TINYTEXT   │                1 │ String   │
│ TEXT       │                1 │ String   │
│ VARCHAR    │                1 │ String   │
│ MEDIUMBLOB │                1 │ String   │
│ BLOB       │                1 │ String   │
│ TINYBLOB   │                1 │ String   │
│ CHAR       │                1 │ String   │
│ MEDIUMTEXT │                1 │ String   │
└────────────┴──────────────────┴──────────┘
```

**Смотрите Также**

- [Синтаксис](../../sql-reference/syntax.md) — Информация о поддерживаемом синтаксисе.