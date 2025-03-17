---
description: '包含 ClickHouse 服务器支持的时区列表的系统表。'
slug: /operations/system-tables/time_zones
title: 'system.time_zones'
keywords: ['system table', 'time_zones']
---

包含 ClickHouse 服务器支持的时区列表。此时区列表可能会因 ClickHouse 版本的不同而有所变化。

列：

- `time_zone` (String) — 支持的时区列表。

**示例**

``` sql
SELECT * FROM system.time_zones LIMIT 10
```

``` text
┌─time_zone──────────┐
│ Africa/Abidjan     │
│ Africa/Accra       │
│ Africa/Addis_Ababa │
│ Africa/Algiers     │
│ Africa/Asmara      │
│ Africa/Asmera      │
│ Africa/Bamako      │
│ Africa/Bangui      │
│ Africa/Banjul      │
│ Africa/Bissau      │
└────────────────────┘
```
