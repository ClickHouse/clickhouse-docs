---
description: 'Системная таблица, содержащая информацию о рабочих нагрузках, находящихся на локальном сервере.'
keywords: ['системная таблица', 'рабочие нагрузки']
slug: /operations/system-tables/workloads
title: 'system.workloads'
---


# system.workloads

Содержит информацию о [рабочих нагрузках](/operations/workload-scheduling.md#workload_entity_storage), находящихся на локальном сервере. Таблица содержит строку для каждой рабочей нагрузки.

Пример:

```sql
SELECT *
FROM system.workloads
FORMAT Vertical
```

```text
Row 1:
──────
name:         production
parent:       all
create_query: CREATE WORKLOAD production IN `all` SETTINGS weight = 9

Row 2:
──────
name:         development
parent:       all
create_query: CREATE WORKLOAD development IN `all`

Row 3:
──────
name:         all
parent:
create_query: CREATE WORKLOAD `all`
```

Колонки:

- `name` (`String`) - Имя рабочей нагрузки.
- `parent` (`String`) - Имя родительской рабочей нагрузки.
- `create_query` (`String`) - Определение рабочей нагрузки.
