---
slug: '/operations/system-tables/detached_tables'
description: 'Системная таблица содержащая информацию о каждой отсоединенной таблице.'
title: system.detached_tables
keywords: ['системная таблица', 'отсоединенные таблицы']
doc_type: reference
---
Содержит информацию о каждой отсоединенной таблице.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится таблица.

- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы (атомарная база данных).

- `metadata_path` ([String](../../sql-reference/data-types/string.md)) - Путь к метаданным таблицы в файловой системе.

- `is_permanently` ([UInt8](../../sql-reference/data-types/int-uint.md)) - Флаг, указывающий, что таблица была отсоединена ПОДОЛГУ.

**Пример**

```sql
SELECT * FROM system.detached_tables FORMAT Vertical;
```

```text
Row 1:
──────
database:                   base
table:                      t1
uuid:                       81b1c20a-b7c6-4116-a2ce-7583fb6b6736
metadata_path:              /var/lib/clickhouse/store/461/461cf698-fd0b-406d-8c01-5d8fd5748a91/t1.sql
is_permanently:             1
```