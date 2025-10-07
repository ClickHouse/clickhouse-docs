---
slug: '/operations/system-tables/distribution_queue'
description: 'Системная таблица, содержащая информацию о локальных файлах, которые'
title: system.distribution_queue
keywords: ['системная таблица', 'distribution_queue']
doc_type: reference
---
Содержит информацию о локальных файлах, которые находятся в очереди на отправку на шард. Эти локальные файлы содержат новые части, созданные путем вставки новых данных в распределенную таблицу в асинхронном режиме.

Колонки:

- `database` ([String](../../sql-reference/data-types/string.md)) — Название базы данных.

- `table` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.

- `data_path` ([String](../../sql-reference/data-types/string.md)) — Путь к папке с локальными файлами.

- `is_blocked` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, заблокирована ли отправка локальных файлов на сервер.

- `error_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество ошибок.

- `data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество локальных файлов в папке.

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер сжатых данных в локальных файлах, в байтах.

- `broken_data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество файлов, которые были помечены как поврежденные (из-за ошибки).

- `broken_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер сжатых данных в поврежденных файлах, в байтах.

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — Текстовое сообщение о последней произошедшей ошибке (если такая имеется).

**Пример**

```sql
SELECT * FROM system.distribution_queue LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
database:              default
table:                 dist
data_path:             ./store/268/268bc070-3aad-4b1a-9cf2-4987580161af/default@127%2E0%2E0%2E2:9000/
is_blocked:            1
error_count:           0
data_files:            1
data_compressed_bytes: 499
last_exception:
```

**См. также**

- [Движок распределенной таблицы](../../engines/table-engines/special/distributed.md)