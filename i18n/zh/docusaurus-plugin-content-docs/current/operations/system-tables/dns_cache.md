---
'description': '系统表包含关于缓存的 DNS 记录的信息。'
'keywords':
- 'system table'
- 'dns_cache'
'slug': '/operations/system-tables/dns_cache'
'title': 'system.dns_cache'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关缓存的 DNS 记录的信息。

列：

- `hostname` ([String](../../sql-reference/data-types/string.md)) — 缓存的主机名
- `ip_address` ([String](../../sql-reference/data-types/string.md)) — 主机名的 IP 地址
- `ip_family` ([Enum](../../sql-reference/data-types/enum.md)) — IP 地址的类型，可能的值：
   - 'IPv4' 
   - 'IPv6'
   - 'UNIX_LOCAL'
- `cached_at` ([DateTime](../../sql-reference/data-types/datetime.md)) - 记录被缓存的时间

**示例**

查询：

```sql
SELECT * FROM system.dns_cache;
```

结果：

| hostname | ip\_address | ip\_family | cached\_at |
| :--- | :--- | :--- | :--- |
| localhost | ::1 | IPv6 | 2024-02-11 17:04:40 |
| localhost | 127.0.0.1 | IPv4 | 2024-02-11 17:04:40 |

**另见**

- [disable_internal_dns_cache setting](../../operations/server-configuration-parameters/settings.md#disable_internal_dns_cache)
- [dns_cache_max_entries setting](../../operations/server-configuration-parameters/settings.md#dns_cache_max_entries)
- [dns_cache_update_period setting](../../operations/server-configuration-parameters/settings.md#dns_cache_update_period)
- [dns_max_consecutive_failures setting](../../operations/server-configuration-parameters/settings.md#dns_max_consecutive_failures)
