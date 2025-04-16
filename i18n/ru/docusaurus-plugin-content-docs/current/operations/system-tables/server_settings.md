---
description: 'Системная таблица, содержащая информацию о глобальных настройках для сервера,
  которые указаны в `config.xml`.'
keywords: ['системная таблица', 'server_settings']
slug: /operations/system-tables/server_settings
title: 'system.server_settings'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.server_settings

<SystemTableCloud/>

Содержит информацию о глобальных настройках для сервера, которые указаны в `config.xml`. В настоящее время таблица отображает только настройки из первого уровня `config.xml` и не поддерживает вложенные конфигурации (например, [logger](../../operations/server-configuration-parameters/settings.md#logger)).

Колонки:

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя настройки сервера.
- `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки сервера.
- `default` ([String](../../sql-reference/data-types/string.md)) — Значение по умолчанию для настройки сервера.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, была ли настройка указана в `config.xml`.
- `description` ([String](../../sql-reference/data-types/string.md)) — Краткое описание настройки сервера.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип значения настройки сервера.
- `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — Можно ли изменить настройку во время работы сервера. Значения:
    - `'Нет'`
    - `'ТолькоУвеличение'`
    - `'ТолькоУменьшение'`
    - `'Да'`
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, является ли настройка устаревшей.

**Пример**

Следующий пример показывает, как получить информацию о настройках сервера, название которых содержит `thread_pool`.

```sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

```text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ Максимальное количество потоков, которые могут быть выделены из ОС и использованы для выполнения запросов и фоновых операций.                           │ UInt64 │                         Нет │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ Максимальное количество потоков, которые всегда будут оставаться в глобальном пуле потоков после выделения и останутся бездействующими в случае недостатка задач. │ UInt64 │                         Нет │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ Максимальное количество задач, которые будут помещены в очередь и ожидают выполнения.                                                                  │ UInt64 │                         Нет │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ Максимальное количество потоков, которые будут использоваться для операций ввода-вывода.                                                                 │ UInt64 │                         Нет │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ Максимальный свободный размер для пула потоков ввода-вывода.                                                                                                                    │ UInt64 │                         Нет │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ Размер очереди для пула потоков ввода-вывода.                                                                                                                      │ UInt64 │                         Нет │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ Количество потоков для загрузки активного набора частей данных (активных) при старте.                                                                    │ UInt64 │                         Нет │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ Количество потоков для загрузки неактивного набора частей данных (устаревших) при старте.                                                                │ UInt64 │                         Нет │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ Количество потоков для загрузки неактивного набора частей данных (непредвиденных) при старте.                                                              │ UInt64 │                         Нет │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ Количество потоков для параллельного удаления неактивных частей данных.                                                                                │ UInt64 │                         Нет │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ Максимальное количество потоков, которые будут использоваться для операций ввода-вывода для запросов BACKUP.                                                               │ UInt64 │                         Нет │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ Максимальный свободный размер для пула потоков ввода-вывода для резервных копий.                                                                                                           │ UInt64 │                         Нет │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ Размер очереди для пула потоков ввода-вывода для резервных копий.                                                                                                              │ UInt64 │                         Нет │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

Использование `WHERE changed` может быть полезно, например, когда вы хотите проверить, правильно ли загружены настройки из файлов конфигурации и используются ли они.

<!-- -->

```sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**Смотрите также**

- [Настройки](../../operations/system-tables/settings.md)
- [Файлы конфигурации](../../operations/configuration-files.md)
- [Настройки сервера](../../operations/server-configuration-parameters/settings.md)
