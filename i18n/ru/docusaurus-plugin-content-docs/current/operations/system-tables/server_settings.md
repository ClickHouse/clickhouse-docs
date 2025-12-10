---
description: 'Системная таблица, содержащая информацию о глобальных настройках сервера, заданных в `config.xml`.'
keywords: ['system table', 'server_settings']
slug: /operations/system-tables/server_settings
title: 'system.server_settings'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.server&#95;settings {#systemserver&#95;settings}

<SystemTableCloud />

Содержит информацию о глобальных настройках сервера, которые задаются в `config.xml`.
В настоящее время таблица показывает только настройки из первого уровня `config.xml` и не поддерживает вложенные конфигурации (например, [logger](../../operations/server-configuration-parameters/settings.md#logger)).

Столбцы:

* `name` ([String](../../sql-reference/data-types/string.md)) — Имя настройки сервера.
* `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки сервера.
* `default` ([String](../../sql-reference/data-types/string.md)) — Значение настройки сервера по умолчанию.
* `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, была ли настройка задана в `config.xml`.
* `description` ([String](../../sql-reference/data-types/string.md)) — Краткое описание настройки сервера.
* `type` ([String](../../sql-reference/data-types/string.md)) — Тип значения настройки сервера.
* `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — Можно ли изменить настройку во время работы сервера. Возможные значения:
  * `'No' `
  * `'IncreaseOnly'`
  * `'DecreaseOnly'`
  * `'Yes'`
* `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, является ли настройка устаревшей.

**Пример**

Следующий пример показывает, как получить информацию о настройках сервера, имя которых содержит `thread_pool`.

```sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

```text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ Максимальное количество потоков, которые могут быть выделены ОС и использованы для выполнения запросов и фоновых операций.                        │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ Максимальное количество потоков, которые после выделения всегда остаются в глобальном пуле потоков и простаивают при недостаточном количестве задач. │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ Максимальное количество задач, которые будут помещены в очередь и ожидать выполнения.                                                              │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ Максимальное количество потоков, которые будут использоваться для операций ввода-вывода                                                            │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ Максимальное количество свободных потоков в пуле потоков ввода-вывода.                                                                             │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ Размер очереди пула потоков ввода-вывода.                                                                                                          │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ Количество потоков для загрузки активного набора частей данных при запуске.                                                                        │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ Количество потоков для загрузки неактивного набора частей данных (устаревших) при запуске.                                                         │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ Количество потоков для загрузки неактивного набора частей данных (неожиданных) при запуске.                                                        │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ Количество потоков для параллельного удаления неактивных частей данных.                                                                            │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ Максимальное количество потоков, которые будут использоваться для операций ввода-вывода при выполнении запросов BACKUP                            │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ Максимальное количество свободных потоков в пуле потоков ввода-вывода для резервных копий.                                                        │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ Размер очереди пула потоков ввода-вывода для резервных копий.                                                                                      │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

Использование `WHERE changed` может быть полезно, например, когда вы хотите проверить,
правильно ли загружены настройки из конфигурационных файлов и действительно ли они применяются.

{/* */ }

```sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**См. также**

* [Настройки](../../operations/system-tables/settings.md)
* [Файлы конфигурации](../../operations/configuration-files.md)
* [Настройки сервера](../../operations/server-configuration-parameters/settings.md)
