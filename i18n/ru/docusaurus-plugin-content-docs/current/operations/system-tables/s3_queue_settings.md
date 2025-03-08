---
description: 'Системная таблица, содержащая информацию о настройках таблиц S3Queue. Доступна с версии сервера `24.10`.'
slug: /operations/system-tables/s3_queue_settings
title: 'system.s3_queue_settings'
keywords: ['системная таблица', 's3_queue_settings']
---

Содержит информацию о настройках таблиц [S3Queue](../../engines/table-engines/integrations/s3queue.md). Доступна с версии сервера `24.10`.

Колонки:

- `database` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.
- `table` ([String](../../sql-reference/data-types/string.md)) — Название базы данных.
- `name` ([String](../../sql-reference/data-types/string.md)) — Название настройки.
- `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Указывает, была ли настройка явно определена в конфигурации или изменена.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание настройки.
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, может ли настройка быть изменена с помощью `ALTER TABLE ... MODIFY SETTING`.
    - `0` — Текущий пользователь может изменять настройку.
    - `1` — Текущий пользователь не может изменять настройку.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип настройки (строковое значение, специфичное для реализации).
