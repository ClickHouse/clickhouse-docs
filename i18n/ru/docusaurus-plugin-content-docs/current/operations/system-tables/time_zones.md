---
description: 'Системная таблица, содержащая список часовых поясов, поддерживаемых сервером ClickHouse.'
slug: /operations/system-tables/time_zones
title: 'system.time_zones'
keywords: ['system table', 'time_zones']
---

Содержит список часовых поясов, поддерживаемых сервером ClickHouse. Этот список часовых поясов может варьироваться в зависимости от версии ClickHouse.

Колонки:

- `time_zone` (String) — Список поддерживаемых часовых поясов.

**Пример**

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
