---
description: 'Системная таблица, содержащая информацию о квотах.'
keywords: ['системная таблица', 'квоты', 'квота']
slug: /operations/system-tables/quotas
title: 'system.quotas'
---


# system.quotas

Содержит информацию о [квотах](../../operations/system-tables/quotas.md).

Столбцы:
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя квоты.
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — Идентификатор квоты.
- `storage`([String](../../sql-reference/data-types/string.md)) — Хранилище квот. Возможные значения: "users.xml", если квота настроена в файле users.xml, "disk", если квота настроена с помощью SQL-запроса.
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — Ключ, который указывает, как квота должна быть разделена. Если два соединения используют одну и ту же квоту и ключ, они делят одинаковые объемы ресурсов. Значения:
    - `[]` — Все пользователи делят одну и ту же квоту.
    - `['user_name']` — Соединения с одинаковым именем пользователя делят одну и ту же квоту.
    - `['ip_address']` — Соединения с одного и того же IP делят одну и ту же квоту.
    - `['client_key']` — Соединения с одинаковым ключом делят одну и ту же квоту. Ключ должен быть явно предоставлен клиентом. При использовании [clickhouse-client](../../interfaces/cli.md) передайте значение ключа в параметре `--quota_key`, или используйте параметр `quota_key` в файле конфигурации клиента. При использовании HTTP интерфейса используйте заголовок `X-ClickHouse-Quota`.
    - `['user_name', 'client_key']` — Соединения с одинаковым `client_key` делят одну и ту же квоту. Если ключ не предоставлен клиентом, квота отслеживается для `user_name`.
    - `['client_key', 'ip_address']` — Соединения с одинаковым `client_key` делят одну и ту же квоту. Если ключ не предоставлен клиентом, квота отслеживается для `ip_address`.
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Длины временных интервалов в секундах.
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Логическое значение. Оно показывает, к каким пользователям применяется квота. Значения:
    - `0` — Квота применяется к пользователям, указанным в `apply_to_list`.
    - `1` — Квота применяется ко всем пользователям, кроме тех, что перечислены в `apply_to_except`.
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список имен пользователей/[ролей](../../guides/sre/user-management/index.md#role-management), к которым должна применяться квота.
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список имен пользователей/ролей, к которым квота не должна применяться.

## See Also {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
