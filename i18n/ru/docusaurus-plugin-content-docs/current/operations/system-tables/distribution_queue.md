---
description: 'Системная таблица, содержащая информацию о локальных файлах, находящихся в очереди на отправку на шарды.'
slug: /operations/system-tables/distribution_queue
title: 'system.distribution_queue'
keywords: ['системная таблица', 'distribution_queue']
---

Содержит информацию о локальных файлах, находящихся в очереди на отправку на шарды. Эти локальные файлы содержат новые части, которые создаются путем вставки новых данных в распределенную таблицу в асинхронном режиме.

Колонки:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных.

- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.

- `data_path` ([String](../../sql-reference/data-types/string.md)) — Путь к папке с локальными файлами.

- `is_blocked` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, блокирована ли отправка локальных файлов на сервер.

- `error_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество ошибок.

- `data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество локальных файлов в папке.

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер сжатых данных в локальных файлах в байтах.

- `broken_data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество файлов, помеченных как поврежденные (вследствие ошибки).

- `broken_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер сжатых данных в поврежденных файлах в байтах.

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — Текстовое сообщение о последней произошедшей ошибке (если таковая была).

**Пример**

``` sql
SELECT * FROM system.distribution_queue LIMIT 1 FORMAT Vertical;
```

``` text
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

**См. Также**

- [Distributed table engine](../../engines/table-engines/special/distributed.md)
