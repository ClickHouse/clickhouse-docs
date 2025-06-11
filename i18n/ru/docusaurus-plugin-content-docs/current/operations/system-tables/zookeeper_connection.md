---
description: 'Системная таблица, которая существует только в том случае, если ZooKeeper настроен. Показывает текущие соединения с ZooKeeper (включая вспомогательные ZooKeeper).'
keywords: ['системная таблица', 'zookeeper_connection']
slug: /operations/system-tables/zookeeper_connection
title: 'system.zookeeper_connection'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.zookeeper_connection

<SystemTableCloud/>

Эта таблица не существует, если ZooKeeper не настроен. Таблица 'system.zookeeper_connection' показывает текущие соединения с ZooKeeper (включая вспомогательные ZooKeeper). Каждая строка содержит информацию о одном соединении.

Колонки:

-   `name` ([String](../../sql-reference/data-types/string.md)) — Имя кластера ZooKeeper.
-   `host` ([String](../../sql-reference/data-types/string.md)) — Имя хоста/IP узла ZooKeeper, к которому подключен ClickHouse.
-   `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — Порт узла ZooKeeper, к которому подключен ClickHouse.
-   `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — Индекс узла ZooKeeper, к которому подключен ClickHouse. Индекс берется из конфигурации ZooKeeper. Если соединение не установлено, эта колонка NULL.
-   `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Когда было установлено соединение.
-   `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Секунды, прошедшие с момента установления соединения.
-   `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Истекло ли текущее соединение.
-   `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Версия API Keeper.
-   `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор сессии соединения.
-   `xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — XID текущей сессии.
-   `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — Включенные флаги функций. Применимы только к ClickHouse Keeper. Возможные значения: `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`.
-   `availability_zone` ([String](../../sql-reference/data-types/string.md)) — Зона доступности.

Пример:

```sql
SELECT * FROM system.zookeeper_connection;
```

```text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┬─xid─┬─enabled_feature_flags────────────────────────────────────────────────────┬─availability_zone─┐
│ default │ 127.0.0.1 │ 2181 │     0 │ 2025-04-10 14:30:00 │                            943 │          0 │                  0 │       420 │  69 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS'] │ eu-west-1b        │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┴─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────┘
```
