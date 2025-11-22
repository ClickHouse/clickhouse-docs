---
description: 'Показывает историю подключений к ZooKeeper (включая вспомогательные экземпляры ZooKeeper).'
keywords: ['системная таблица', 'zookeeper_connection_log']
slug: /operations/system-tables/zookeeper_connection_log
title: 'system.zookeeper_connection_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.zookeeper&#95;connection&#95;log

<SystemTableCloud />

Таблица &#39;system.zookeeper&#95;connection&#95;log&#39; показывает историю подключений к ZooKeeper (включая вспомогательные экземпляры ZooKeeper). Каждая строка содержит информацию об одном событии, связанном с подключениями.

:::note
Таблица не содержит событий отключений, вызванных остановкой сервера.
:::

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, который подключён к ZooKeeper или отключён от него.
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) - тип события. Возможные значения: `Connected`, `Disconnected`.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) - дата записи.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - время записи.
* `event_time_microseconds` ([Date](../../sql-reference/data-types/datetime64.md)) - время записи с точностью до микросекунд.
* `name` ([String](../../sql-reference/data-types/string.md)) — имя кластера ZooKeeper.
* `host` ([String](../../sql-reference/data-types/string.md)) — имя хоста/IP-адрес узла ZooKeeper, к которому ClickHouse подключился.
* `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — порт узла ZooKeeper, к которому ClickHouse подключился.
* `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — индекс узла ZooKeeper, к которому ClickHouse подключился или от которого отключился. Индекс берётся из конфигурации ZooKeeper.
* `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — идентификатор сеанса соединения.
* `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — версия Keeper API.
* `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — включённые флаги функций. Применимо только к ClickHouse Keeper. Возможные значения: `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`.
* `availability_zone` ([String](../../sql-reference/data-types/string.md)) — зона доступности.
* `reason` ([String](../../sql-reference/data-types/string.md)) — причина подключения или отключения.

Пример:

```sql
SELECT * FROM system.zookeeper_connection_log;
```


```text
┌─hostname─┬─type─────────┬─event_date─┬──────────event_time─┬────event_time_microseconds─┬─name───────────────┬─host─┬─port─┬─index─┬─client_id─┬─keeper_api_version─┬─enabled_feature_flags───────────────────────────────────────────────────────────────────────┬─availability_zone─┬─reason──────────────┐
 1. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:35 │ 2025-05-12 19:49:35.713067 │ zk_conn_log_test_4 │ zoo2 │ 2181 │     0 │        10 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Инициализация      │
 2. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:23 │ 2025-05-12 19:49:23.981570 │ default            │ zoo1 │ 2181 │     0 │         4 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Инициализация      │
 3. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:28 │ 2025-05-12 19:49:28.104021 │ default            │ zoo1 │ 2181 │     0 │         5 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Инициализация      │
 4. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.459251 │ zk_conn_log_test_2 │ zoo2 │ 2181 │     0 │         6 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Инициализация      │
 5. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.574312 │ zk_conn_log_test_3 │ zoo3 │ 2181 │     0 │         7 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Инициализация      │
 6. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.909890 │ default            │ zoo1 │ 2181 │     0 │         5 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Конфигурация изменена      │
 7. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.909895 │ default            │ zoo2 │ 2181 │     0 │         8 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Конфигурация изменена      │
 8. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912010 │ zk_conn_log_test_2 │ zoo2 │ 2181 │     0 │         6 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Конфигурация изменена      │
 9. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912014 │ zk_conn_log_test_2 │ zoo3 │ 2181 │     0 │         9 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Конфигурация изменена      │
10. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912061 │ zk_conn_log_test_3 │ zoo3 │ 2181 │     0 │         7 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Удалено из конфигурации │
    └──────────┴──────────────┴────────────┴─────────────────────┴────────────────────────────┴────────────────────┴──────┴──────┴───────┴───────────┴────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────┴─────────────────────┘
```