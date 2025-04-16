---
description: 'Системная таблица, которая существует только в случае настройки ZooKeeper. Показывает текущие соединения с ZooKeeper (включая вспомогательные ZooKeeper).'
keywords: ['системная таблица', 'соединение с zookeeper']
slug: /operations/system-tables/zookeeper_connection
title: 'system.zookeeper_connection'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.zookeeper_connection

<SystemTableCloud/>

Эта таблица не существует, если ZooKeeper не настроен. Таблица 'system.zookeeper_connection' показывает текущие соединения с ZooKeeper (включая вспомогательные ZooKeeper). Каждая строка отображает информацию об одном соединении.

Столбцы:

-   `name` ([String](../../sql-reference/data-types/string.md)) — имя кластера ZooKeeper.
-   `host` ([String](../../sql-reference/data-types/string.md)) — имя хоста/IP узла ZooKeeper, к которому подключен ClickHouse.
-   `port` ([String](../../sql-reference/data-types/string.md)) — порт узла ZooKeeper, к которому подключен ClickHouse.
-   `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — индекс узла ZooKeeper, к которому подключен ClickHouse. Индекс берется из конфигурации ZooKeeper.
-   `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Когда было установлено соединение.
-   `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество секунд, прошедших с момента установления соединения.
-   `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Текущая связь истекла или нет.
-   `keeper_api_version` ([String](../../sql-reference/data-types/string.md)) — версия API Keeper.
-   `client_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ID сессии соединения.
-   `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — Xid текущей сессии.

Пример:

```sql
SELECT * FROM system.zookeeper_connection;
```

```text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┐
│ default │ 127.0.0.1 │ 9181 │     0 │ 2023-06-15 14:36:01 │                           3058 │          0 │                  3 │         5 │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┘
```
