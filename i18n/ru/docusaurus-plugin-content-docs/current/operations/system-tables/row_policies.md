---
description: 'Системная таблица, содержащая фильтры для одной конкретной таблицы, а также список ролей и/или пользователей, которые должны использовать эту политику строк.'
slug: /operations/system-tables/row_policies
title: 'system.row_policies'
keywords: ['системная таблица', 'row_policies']
---

Содержит фильтры для одной конкретной таблицы, а также список ролей и/или пользователей, которые должны использовать эту политику строк.

Колонки:
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя политики строк.

- `short_name` ([String](../../sql-reference/data-types/string.md)) — Краткое имя политики строк. Имена политик строк составные, например: myfilter ON mydb.mytable. Здесь "myfilter ON mydb.mytable" — это имя политики строк, "myfilter" — её краткое имя.

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных.

- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы. Пусто, если политика для базы данных.

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — ID политики строк.

- `storage` ([String](../../sql-reference/data-types/string.md)) — Имя директории, где хранится политика строк.

- `select_filter` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Условие, используемое для фильтрации строк.

- `is_restrictive` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, ограничивает ли политика строк доступ к строкам, см. [CREATE ROW POLICY](/sql-reference/statements/create/row-policy). Значение:
- `0` — Политика строк определена с использованием `AS PERMISSIVE` клаузулы.
- `1` — Политика строк определена с использованием `AS RESTRICTIVE` клаузулы.

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, что политика строк применима ко всем ролям и/или пользователям.

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список ролей и/или пользователей, к которым применяется политика строк.

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Политика строк применяется ко всем ролям и/или пользователям, кроме указанных в списке.

## See Also {#see-also}

- [SHOW POLICIES](/sql-reference/statements/show#show-policies)
