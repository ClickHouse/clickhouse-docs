---
description: 'Системная таблица, которая существует только если ZooKeeper настроен. Показывает текущие подключения к ZooKeeper (включая вспомогательные экземпляры ZooKeeper).'
keywords: ['системная таблица', 'zookeeper_connection']
slug: /operations/system-tables/zookeeper_connection
title: 'system.zookeeper_connection'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper&#95;connection {#systemzookeeper&#95;connection}

<SystemTableCloud />

Эта таблица отсутствует, если ZooKeeper не настроен. Таблица `system.zookeeper&#95;connection` показывает текущие подключения к ZooKeeper (включая вспомогательные экземпляры ZooKeeper). Каждая строка содержит информацию об одном подключении.

Столбцы:

* `name` ([String](../../sql-reference/data-types/string.md)) — Имя кластера ZooKeeper.
* `host` ([String](../../sql-reference/data-types/string.md)) — Имя хоста/IP-адрес узла ZooKeeper, к которому подключился ClickHouse.
* `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — Порт узла ZooKeeper, к которому подключился ClickHouse.
* `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — Индекс узла ZooKeeper, к которому подключился ClickHouse. Индекс берётся из конфигурации ZooKeeper. Если подключения нет, это значение равно NULL.
* `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время установления подключения.
* `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество секунд, прошедших с момента установления подключения.
* `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Признак того, что текущее подключение истекло.
* `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Версия Keeper API.
* `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор сеанса подключения.
* `xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — XID текущего сеанса.
* `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — Включённые флаги функциональности. Применимо только к ClickHouse Keeper. Возможные значения: `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`.
* `availability_zone` ([String](../../sql-reference/data-types/string.md)) — Зона доступности.

Пример:

```sql
SELECT * FROM system.zookeeper_connection;
```

```text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┬─xid─┬─enabled_feature_flags────────────────────────────────────────────────────┬─availability_zone─┐
│ default │ 127.0.0.1 │ 2181 │     0 │ 2025-04-10 14:30:00 │                            943 │          0 │                  0 │       420 │  69 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS'] │ eu-west-1b        │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┴─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────┘
```
