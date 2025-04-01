---
description: 'Системная таблица, содержащая информацию обо всех успешных и неуспешных событиях входа и выхода.'
keywords: ['системная таблица', 'session_log']
slug: /operations/system-tables/session_log
title: 'system.session_log'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.session_log

<SystemTableCloud/>

Содержит информацию обо всех успешных и неуспешных событиях входа и выхода.

Столбцы:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — Результат входа/выхода. Возможные значения:
    - `LoginFailure` — Ошибка входа.
    - `LoginSuccess` — Успешный вход.
    - `Logout` — Выход из системы.
- `auth_id` ([UUID](../../sql-reference/data-types/uuid.md)) — Идентификатор аутентификации, который является UUID и автоматически генерируется каждый раз, когда пользователь входит в систему.
- `session_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор сессии, который передается клиентом через интерфейс [HTTP](../../interfaces/http.md).
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата входа/выхода.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время входа/выхода.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Начальное время входа/выхода с точностью до микросекунд.
- `user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя.
- `auth_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип аутентификации. Возможные значения:
    - `NO_PASSWORD`
    - `PLAINTEXT_PASSWORD`
    - `SHA256_PASSWORD`
    - `DOUBLE_SHA1_PASSWORD`
    - `LDAP`
    - `KERBEROS`
    - `SSL_CERTIFICATE`
- `profiles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Список профилей, установленных для всех ролей и/или пользователей.
- `roles` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Список ролей, к которым применяется профиль.
- `settings` ([Array](../../sql-reference/data-types/array.md)([Tuple](../../sql-reference/data-types/tuple.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md), [String](../../sql-reference/data-types/string.md)))) — Настройки, которые изменились, когда клиент вошел в систему/вышел из нее.
- `client_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес, который использовался для входа/выхода.
- `client_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Порт клиента, который использовался для входа/выхода.
- `interface` ([Enum8](../../sql-reference/data-types/enum.md)) — Интерфейс, с которого был инициирован вход. Возможные значения:
    - `TCP`
    - `HTTP`
    - `gRPC`
    - `MySQL`
    - `PostgreSQL`
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — Имя хоста клиентской машины, на которой запускается [clickhouse-client](../../interfaces/cli.md) или другой TCP-клиент.
- `client_name` ([String](../../sql-reference/data-types/string.md)) — Имя `clickhouse-client` или другого TCP-клиента.
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизия `clickhouse-client` или другого TCP-клиента.
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Главная версия `clickhouse-client` или другого TCP-клиента.
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Вторая версия `clickhouse-client` или другого TCP-клиента.
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Патч-компонент версии `clickhouse-client` или другого TCP-клиента.
- `failure_reason` ([String](../../sql-reference/data-types/string.md)) — Сообщение об исключении, содержащее причину неудачи входа/выхода.

**Пример**

Запрос:

```sql
SELECT * FROM system.session_log LIMIT 1 FORMAT Vertical;
```

Результат:

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
type:                    LoginSuccess
auth_id:                 45e6bd83-b4aa-4a23-85e6-bd83b4aa1a23
session_id:
event_date:              2021-10-14
event_time:              2021-10-14 20:33:52
event_time_microseconds: 2021-10-14 20:33:52.104247
user:                    default
auth_type:               PLAINTEXT_PASSWORD
profiles:                ['default']
roles:                   []
settings:                [('load_balancing','random'),('max_memory_usage','10000000000')]
client_address:          ::ffff:127.0.0.1
client_port:             38490
interface:               TCP
client_hostname:
client_name:             ClickHouse client
client_revision:         54449
client_version_major:    21
client_version_minor:    10
client_version_patch:    0
failure_reason:
```
