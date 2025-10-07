---
slug: '/operations/system-tables/workloads'
description: 'Системная таблица, содержащая информацию о нагрузках, находящихся'
title: system.workloads
keywords: ['системная таблица', 'рабочие нагрузки']
doc_type: reference
---
# system.workloads

Содержит информацию о [нагрузках](/operations/workload-scheduling.md#workload_entity_storage), находящихся на локальном сервере. Таблица содержит строку для каждой нагрузки.

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

Столбцы:

- `name` (`String`) - Название нагрузки.
- `parent` (`String`) - Название родительской нагрузки.
- `create_query` (`String`) - Определение нагрузки.