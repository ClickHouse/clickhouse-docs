---
slug: '/operations/system-tables/server_settings'
description: 'Системная таблица, содержащая информацию о глобальных настройках для'
title: system.server_settings
keywords: ['системная таблица', 'server_settings']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.server_settings

<SystemTableCloud/>

Содержит информацию о глобальных настройках сервера, которые указаны в `config.xml`. В настоящее время таблица показывает только настройки из первого уровня `config.xml` и не поддерживает вложенные конфигурации (например, [logger](../../operations/server-configuration-parameters/settings.md#logger)).

Колонки:

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя настройки сервера.
- `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки сервера.
- `default` ([String](../../sql-reference/data-types/string.md)) — Значение по умолчанию настройки сервера.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, была ли настройка указана в `config.xml`.
- `description` ([String](../../sql-reference/data-types/string.md)) — Краткое описание настройки сервера.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип значения настройки сервера.
- `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — Можно ли изменить настройку во время работы сервера. Значения:
  - `'No' `
  - `'IncreaseOnly'`
  - `'DecreaseOnly'`
  - `'Yes'`
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, является ли настройка устаревшей.

**Пример**

Следующий пример показывает, как получить информацию о настройках сервера, имя которых содержит `thread_pool`.

```sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

```text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ The maximum number of threads that could be allocated from the OS and used for query execution and background operations.                           │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ The maximum number of threads that will always stay in a global thread pool once allocated and remain idle in case of insufficient number of tasks. │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ The maximum number of tasks that will be placed in a queue and wait for execution.                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ The maximum number of threads that would be used for IO operations                                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ Max free size for IO thread pool.                                                                                                                   │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ Queue size for IO thread pool.                                                                                                                      │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ The number of threads to load active set of data parts (Active ones) at startup.                                                                    │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ The number of threads to load inactive set of data parts (Outdated ones) at startup.                                                                │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ The number of threads to load inactive set of data parts (Unexpected ones) at startup.                                                              │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ The number of threads for concurrent removal of inactive data parts.                                                                                │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ The maximum number of threads that would be used for IO operations for BACKUP queries                                                               │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ Max free size for backups IO thread pool.                                                                                                           │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ Queue size for backups IO thread pool.                                                                                                              │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

Использование `WHERE changed` может быть полезно, например, когда вы хотите проверить,
правильно ли загружены настройки из файлов конфигурации и используются ли они.

<!-- -->

```sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**Смотрите также**

- [Настройки](../../operations/system-tables/settings.md)
- [Файлы конфигурации](../../operations/configuration-files.md)
- [Настройки сервера](../../operations/server-configuration-parameters/settings.md)