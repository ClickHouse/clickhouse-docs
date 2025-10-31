---
slug: '/operations/system-tables/databases'
description: 'Системная таблица, содержащая информацию о DATABASE, доступных текущему'
title: system.databases
keywords: ['системная таблица', 'базы данных']
doc_type: reference
---
Содержит информацию о доступных для текущего пользователя базах данных.

Столбцы:

- `name` ([String](../../sql-reference/data-types/string.md)) — Название базы данных.
- `engine` ([String](../../sql-reference/data-types/string.md)) — [Движок базы данных](../../engines/database-engines/index.md).
- `data_path` ([String](../../sql-reference/data-types/string.md)) — Путь к данным.
- `metadata_path` ([String](../../sql-reference/data-types/enum.md)) — Путь к метаданным.
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID базы данных.
- `comment` ([String](../../sql-reference/data-types/enum.md)) — Комментарий к базе данных.
- `engine_full` ([String](../../sql-reference/data-types/enum.md)) — Параметры движка базы данных.
- `database` ([String](../../sql-reference/data-types/string.md)) — Псевдоним для `name`.

Столбец `name` из этой системной таблицы используется для реализации запроса `SHOW DATABASES`.

**Пример**

Создайте базу данных.

```sql
CREATE DATABASE test;
```

Проверьте все доступные пользователю базы данных.

```sql
SELECT * FROM system.databases;
```

```text
┌─name────────────────┬─engine─────┬─data_path────────────────────┬─metadata_path─────────────────────────────────────────────────────────┬─uuid─────────────────────────────────┬─engine_full────────────────────────────────────────────┬─comment─┐
│ INFORMATION_SCHEMA  │ Memory     │ /data/clickhouse_data/       │                                                                       │ 00000000-0000-0000-0000-000000000000 │ Memory                                                 │         │
│ default             │ Atomic     │ /data/clickhouse_data/store/ │ /data/clickhouse_data/store/f97/f97a3ceb-2e8a-4912-a043-c536e826a4d4/ │ f97a3ceb-2e8a-4912-a043-c536e826a4d4 │ Atomic                                                 │         │
│ information_schema  │ Memory     │ /data/clickhouse_data/       │                                                                       │ 00000000-0000-0000-0000-000000000000 │ Memory                                                 │         │
│ replicated_database │ Replicated │ /data/clickhouse_data/store/ │ /data/clickhouse_data/store/da8/da85bb71-102b-4f69-9aad-f8d6c403905e/ │ da85bb71-102b-4f69-9aad-f8d6c403905e │ Replicated('some/path/database', 'shard1', 'replica1') │         │
│ system              │ Atomic     │ /data/clickhouse_data/store/ │ /data/clickhouse_data/store/b57/b5770419-ac7a-4b67-8229-524122024076/ │ b5770419-ac7a-4b67-8229-524122024076 │ Atomic                                                 │         │
└─────────────────────┴────────────┴──────────────────────────────┴───────────────────────────────────────────────────────────────────────┴──────────────────────────────────────┴────────────────────────────────────────────────────────┴─────────┘

```