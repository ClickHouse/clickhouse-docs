---
description: 'Системная таблица, содержащая сведения о квотах.'
keywords: ['системная таблица', 'квоты', 'квота']
slug: /operations/system-tables/quotas
title: 'system.quotas'
doc_type: 'reference'
---

# system.quotas {#systemquotas}

Содержит информацию о [квотах](../../operations/system-tables/quotas.md).

Столбцы:
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя квоты.
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — Идентификатор квоты.
- `storage`([String](../../sql-reference/data-types/string.md)) — Хранилище квот. Возможные значения: "users.xml", если квота настроена в файле users.xml; "disk", если квота настроена SQL-запросом.
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — Ключ, определяющий, как должна распределяться квота. Если два соединения используют одну и ту же квоту и ключ, они делят один и тот же объём ресурсов. Значения:
  - `[]` — Все пользователи используют одну и ту же квоту.
  - `['user_name']` — Соединения с одинаковым именем пользователя используют одну и ту же квоту.
  - `['ip_address']` — Соединения с одного и того же IP-адреса используют одну и ту же квоту.
  - `['client_key']` — Соединения с одинаковым ключом используют одну и ту же квоту. Ключ должен быть явно передан клиентом. При использовании [clickhouse-client](../../interfaces/cli.md) передайте значение ключа в параметре `--quota_key` или используйте параметр `quota_key` в конфигурационном файле клиента. При использовании HTTP-интерфейса используйте заголовок `X-ClickHouse-Quota`.
  - `['user_name', 'client_key']` — Соединения с одинаковым `client_key` используют одну и ту же квоту. Если ключ не передан клиентом, квота отслеживается по `user_name`.
  - `['client_key', 'ip_address']` — Соединения с одинаковым `client_key` используют одну и ту же квоту. Если ключ не передан клиентом, квота отслеживается по `ip_address`.
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Продолжительности временных интервалов в секундах.
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Логическое значение. Показывает, к каким пользователям применяется квота. Значения:
  - `0` — Квота применяется к пользователям, указанным в `apply_to_list`.
  - `1` — Квота применяется ко всем пользователям, кроме перечисленных в `apply_to_except`.
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список имён пользователей/[ролей](../../guides/sre/user-management/index.md#role-management), к которым должна применяться квота.
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список имён пользователей/ролей, к которым квота не должна применяться.

## Смотрите также {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
