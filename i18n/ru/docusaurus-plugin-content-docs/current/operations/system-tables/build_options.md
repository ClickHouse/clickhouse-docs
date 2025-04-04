---
description: 'Системная таблица, содержащая информацию о параметрах сборки сервера ClickHouse.'
slug: /operations/system-tables/build_options
title: 'system.build_options'
keywords: ['системная таблица', 'build_options']
---

Содержит информацию о параметрах сборки сервера ClickHouse.

Колонки:

- `name` (String) — Название параметра сборки, например, `USE_ODBC`
- `value` (String) — Значение параметра сборки, например, `1`

**Пример**

```sql
SELECT * FROM system.build_options LIMIT 5
```

```text
┌─name─────────────┬─value─┐
│ USE_BROTLI       │ 1     │
│ USE_BZIP2        │ 1     │
│ USE_CAPNP        │ 1     │
│ USE_CASSANDRA    │ 1     │
│ USE_DATASKETCHES │ 1     │
└──────────────────┴───────┘
```
