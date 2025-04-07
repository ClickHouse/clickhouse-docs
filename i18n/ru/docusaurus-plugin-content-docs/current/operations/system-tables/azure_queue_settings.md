---
description: 'Системная таблица, содержащая информацию о настройках таблиц AzureQueue. Доступно с версии сервера `24.10`.'
keywords: ['системная таблица', 'azure_queue_settings']
slug: /operations/system-tables/azure_queue_settings
title: 'system.azure_queue_settings'
---

Содержит информацию о настройках таблиц [AzureQueue](../../engines/table-engines/integrations/azure-queue.md). Доступно с версии сервера `24.10`.

Колонки:

- `database` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.
- `table` ([String](../../sql-reference/data-types/string.md)) — Название базы данных.
- `name` ([String](../../sql-reference/data-types/string.md)) — Название настройки.
- `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Определяет, была ли настройка явно указана в конфигурации или явно изменена.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание настройки.
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, может ли настройка быть изменена через `ALTER TABLE ... MODIFY SETTING`.
    - `0` — Текущий пользователь может изменить настройку.
    - `1` — Текущий пользователь не может изменить настройку.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип настройки (строковое значение, специфичное для реализации).
