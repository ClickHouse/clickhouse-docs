---
slug: '/operations/system-tables/iceberg_history'
description: 'История снимков айсберга системы'
title: system.iceberg_history
keywords: ['system iceberg_history']
doc_type: reference
---
# system.iceberg_history

Эта системная таблица содержит историю снимков таблиц Iceberg, существующих в ClickHouse. Она будет пустой, если у вас нет таблиц Iceberg в ClickHouse.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится таблица.

- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.

- `made_current_at` ([DateTime](../../sql-reference/data-types/uuid.md)) — Время, когда снимок был сделан текущим.

- `snapshot_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор снимка.

- `parent_id` ([Int64](../../sql-reference/data-types/int-uint.md)) - Идентификатор снимка родительского снимка.

- `is_current_ancestor` ([Bool](../../sql-reference/data-types/boolean.md)) - Флаг, который указывает, является ли этот снимок предком текущего снимка.