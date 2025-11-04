---
slug: '/operations/system-tables/dropped_tables'
description: 'Системная таблица, содержащая информацию о таблицах, на которых была'
title: system.dropped_tables
keywords: ['системная таблица', 'dropped_tables']
doc_type: reference
---
Содержит информацию о таблицах, на которых была выполнена команда drop table, но для которых очистка данных еще не была выполнена.

Столбцы:

- `index` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Индекс в очереди marked_dropped_tables.
- `database` ([String](../../sql-reference/data-types/string.md)) — База данных.
- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы.
- `engine` ([String](../../sql-reference/data-types/string.md)) — Имя движка таблицы.
- `metadata_dropped_path` ([String](../../sql-reference/data-types/string.md)) — Путь к файлу метаданных таблицы в директории metadata_dropped.
- `table_dropped_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время, когда запланирована следующая попытка удалить данные таблицы. Обычно это время, когда таблица была удалена, плюс `database_atomic_delay_before_drop_table_sec`.

**Пример**

Следующий пример показывает, как получить информацию о `dropped_tables`.

```sql
SELECT *
FROM system.dropped_tables\G
```

```text
Row 1:
──────
index:                 0
database:              default
table:                 test
uuid:                  03141bb2-e97a-4d7c-a172-95cc066bb3bd
engine:                MergeTree
metadata_dropped_path: /data/ClickHouse/build/programs/data/metadata_dropped/default.test.03141bb2-e97a-4d7c-a172-95cc066bb3bd.sql
table_dropped_time:    2023-03-16 23:43:31
```