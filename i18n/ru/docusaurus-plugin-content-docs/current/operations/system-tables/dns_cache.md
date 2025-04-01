---
description: 'Системная таблица, содержащая информацию о кэшированных DNS-записях.'
keywords: ['системная таблица', 'dns_cache']
slug: /operations/system-tables/dns_cache
title: 'system.dns_cache'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о кэшированных DNS-записях.

Колонки:

- `hostname` ([String](../../sql-reference/data-types/string.md)) — кэшированное имя хоста
- `ip_address` ([String](../../sql-reference/data-types/string.md)) — IP-адрес для имени хоста
- `ip_family` ([Enum](../../sql-reference/data-types/enum.md)) — семейство IP-адреса, возможные значения: 
   - 'IPv4' 
   - 'IPv6'
   - 'UNIX_LOCAL'
- `cached_at` ([DateTime](../../sql-reference/data-types/datetime.md)) - время, когда запись была кэширована

**Пример**

Запрос:

```sql
SELECT * FROM system.dns_cache;
```

Результат:

| hostname | ip\_address | ip\_family | cached\_at |
| :--- | :--- | :--- | :--- |
| localhost | ::1 | IPv6 | 2024-02-11 17:04:40 |
| localhost | 127.0.0.1 | IPv4 | 2024-02-11 17:04:40 |

**Смотрите также**

- [disable_internal_dns_cache setting](../../operations/server-configuration-parameters/settings.md#disable_internal_dns_cache)
- [dns_cache_max_entries setting](../../operations/server-configuration-parameters/settings.md#dns_cache_max_entries)
- [dns_cache_update_period setting](../../operations/server-configuration-parameters/settings.md#dns_cache_update_period)
- [dns_max_consecutive_failures setting](../../operations/server-configuration-parameters/settings.md#dns_max_consecutive_failures)
