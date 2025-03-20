---
description: 'Системная таблица, которая существует только если ZooKeeper настроен. Показывает текущие подключения к ZooKeeper (включая вспомогательные ZooKeeper).'
slug: /operations/system-tables/zookeeper_connection
title: 'system.zookeeper_connection'
keywords: ['system table', 'zookeeper_connection']
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# zookeeper_connection

<SystemTableCloud/>

Эта таблица не существует, если ZooKeeper не настроен. Таблица 'system.zookeeper_connection' показывает текущие подключения к ZooKeeper (включая вспомогательные ZooKeepers). Каждая строка содержит информацию об одном подключении.

Колонки:

-   `name` ([String](../../sql-reference/data-types/string.md)) — имя кластера ZooKeeper.
-   `host` ([String](../../sql-reference/data-types/string.md)) — Хостнейм/IP узла ZooKeeper, к которому подключился ClickHouse.
-   `port` ([String](../../sql-reference/data-types/string.md)) — Порт узла ZooKeeper, к которому подключился ClickHouse.
-   `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Индекс узла ZooKeeper, к которому подключился ClickHouse. Индекс взят из конфигурации ZooKeeper.
-   `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время, когда соединение было установлено.
-   `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество секунд, прошедших с момента установления соединения.
-   `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Истекло ли текущее соединение.
-   `keeper_api_version` ([String](../../sql-reference/data-types/string.md)) — Версия API Keeper.
-   `client_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор сессии соединения.
-   `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — Xid текущей сессии.

Пример:

``` sql
SELECT * FROM system.zookeeper_connection;
```

``` text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┐
│ default │ 127.0.0.1 │ 9181 │     0 │ 2023-06-15 14:36:01 │                           3058 │          0 │                  3 │         5 │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┘
```
