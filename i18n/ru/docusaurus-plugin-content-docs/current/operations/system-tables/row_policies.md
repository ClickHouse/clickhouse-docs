---
slug: '/operations/system-tables/row_policies'
description: 'Системная таблица, содержащая фильтры для одной конкретной таблицы,'
title: system.row_policies
keywords: ['системная таблица', 'политики строк']
doc_type: reference
---
# system.row_policies

Содержит фильтры для одной конкретной таблицы, а также список ролей и/или пользователей, которые должны использовать эту политику строк.

Столбцы:
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя политики строк.

- `short_name` ([String](../../sql-reference/data-types/string.md)) — Краткое имя политики строк. Имена политик строк составные, например: myfilter ON mydb.mytable. Здесь "myfilter ON mydb.mytable" — это имя политики строк, "myfilter" — её краткое имя.

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных.

- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы. Пусто, если политика предназначена для базы данных.

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — ID политики строк.

- `storage` ([String](../../sql-reference/data-types/string.md)) — Имя директории, где хранится политика строк.

- `select_filter` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Условие, которое используется для фильтрации строк.

- `is_restrictive` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показатель того, ограничивает ли политика строк доступ к строкам, см. [CREATE ROW POLICY](/sql-reference/statements/create/row-policy). Значение:
- `0` — Политика строк определена с использованием положенной `AS PERMISSIVE`.
- `1` — Политика строк определена с использованием положенной `AS RESTRICTIVE`.

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показатель того, что политики строк заданы для всех ролей и/или пользователей.

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список ролей и/или пользователей, к которым применяется политика строк.

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Политика строк применяется ко всем ролям и/или пользователям, кроме перечисленных.

## See Also {#see-also}

- [SHOW POLICIES](/sql-reference/statements/show#show-policies)