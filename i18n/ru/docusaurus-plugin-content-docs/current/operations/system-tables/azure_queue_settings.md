---
description: 'Системная таблица, содержащая информацию о настройках таблиц AzureQueue. Доступна с версии сервера `24.10`.'
keywords: ['системная таблица', 'azure_queue_settings']
slug: /operations/system-tables/azure_queue_settings
title: 'system.azure_queue_settings'
---

Содержит информацию о настройках таблиц [AzureQueue](../../engines/table-engines/integrations/azure-queue.md). Доступна с версии сервера `24.10`.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.
- `table` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных.
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя настройки.
- `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Указывает, была ли настройка явно определена в конфигурации или явно изменена.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание настройки.
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, может ли настройка быть изменена с помощью `ALTER TABLE ... MODIFY SETTING`.
    - `0` — Текущий пользователь может изменить настройку.
    - `1` — Текущий пользователь не может изменить настройку.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип настройки (строковое значение, зависящее от реализации).
