---
slug: '/operations/system-tables/quotas'
description: 'Системная таблица, содержащая информацию о пользовательских квотах.'
title: system.quotas
keywords: ['системная таблица', 'квоты', 'квота']
doc_type: reference
---
# system.quotas

Содержит информацию о [квотах](../../operations/system-tables/quotas.md).

Колонки:
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя квоты.
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — Идентификатор квоты.
- `storage` ([String](../../sql-reference/data-types/string.md)) — Хранение квот. Возможные значения: "users.xml", если квота настроена в файле users.xml, "disk", если квота настроена через SQL-запрос.
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — Ключ, который определяет, как квота должна быть разделена. Если два подключения используют одну и ту же квоту и ключ, они разделяют одни и те же объемы ресурсов. Значения:
  - `[]` — Все пользователи делят одну и ту же квоту.
  - `['user_name']` — Подключения с одним и тем же именем пользователя делят одну и ту же квоту.
  - `['ip_address']` — Подключения с одного и того же IP делят одну и ту же квоту.
  - `['client_key']` — Подключения с одним и тем же ключом делят одну и ту же квоту. Ключ должен быть явно предоставлен клиентом. При использовании [clickhouse-client](../../interfaces/cli.md) передайте значение ключа в параметре `--quota_key` или используйте параметр `quota_key` в файле конфигурации клиента. При использовании HTTP интерфейса используйте заголовок `X-ClickHouse-Quota`.
  - `['user_name', 'client_key']` — Подключения с одним и тем же `client_key` делят одну и ту же квоту. Если ключ не предоставлен клиентом, квота отслеживается по `user_name`.
  - `['client_key', 'ip_address']` — Подключения с одним и тем же `client_key` делят одну и ту же квоту. Если ключ не предоставлен клиентом, квота отслеживается по `ip_address`.
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Длины временных интервалов в секундах.
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Логическое значение. Показывает, к каким пользователям применяется квота. Значения:
  - `0` — Квота применяется к пользователям, указанным в `apply_to_list`.
  - `1` — Квота применяется ко всем пользователям, кроме тех, которые указаны в `apply_to_except`.
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список имен пользователей/[ролей](../../guides/sre/user-management/index.md#role-management), к которым должна применяться квота.
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список имен пользователей/ролей, к которым квота не должна применяться.

## Смотрите также {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)