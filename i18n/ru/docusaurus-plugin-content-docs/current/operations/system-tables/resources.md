---
description: 'Системная таблица, содержащая информацию о ресурсах, находящихся на локальном сервере, с одной строкой для каждого ресурса.'
keywords: ['системная таблица', 'ресурсы']
slug: /operations/system-tables/resources
title: 'system.system.resources'
---


# system.system.resources

Содержит информацию о [ресурсах](/operations/workload-scheduling.md#workload_entity_storage), находящихся на локальном сервере. Таблица содержит строку для каждого ресурса.

Пример:

```sql
SELECT *
FROM system.resources
FORMAT Vertical
```

```text
Row 1:
──────
name:         io_read
read_disks:   ['s3']
write_disks:  []
create_query: CREATE RESOURCE io_read (READ DISK s3)

Row 2:
──────
name:         io_write
read_disks:   []
write_disks:  ['s3']
create_query: CREATE RESOURCE io_write (WRITE DISK s3)
```

Столбцы:

- `name` (`String`) - Имя ресурса.
- `read_disks` (`Array(String)`) - Массив имен дисков, использующих этот ресурс для операций чтения.
- `write_disks` (`Array(String)`) - Массив имен дисков, использующих этот ресурс для операций записи.
- `create_query` (`String`) - Определение ресурса.
