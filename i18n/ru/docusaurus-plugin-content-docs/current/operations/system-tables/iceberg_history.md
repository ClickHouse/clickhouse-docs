---
description: 'История снимков системы iceberg'
keywords: ['system iceberg_history']
slug: /operations/system-tables/iceberg_history
title: 'system.iceberg_history'
---


# system.iceberg_history

Содержит историю снимков таблицы iceberg.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится таблица.

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.

- `made_current_at` ([DateTime](../../sql-reference/data-types/uuid.md)) — Время, когда снимок был сделан текущим.

- `snapshot_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор снимка.

- `parent_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор снимка родительского снимка.

- `is_current_ancestor` ([Bool](../../sql-reference/data-types/boolean.md)) — Флаг, указывающий, является ли этот снимок предком текущего снимка.
