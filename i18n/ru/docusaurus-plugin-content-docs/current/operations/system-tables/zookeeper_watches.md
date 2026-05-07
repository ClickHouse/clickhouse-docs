---
description: 'Системная таблица, показывающая зарегистрированные этим сервером ClickHouse
  активные в данный момент наблюдения ZooKeeper.'
keywords: ['системная таблица', 'zookeeper_watches']
slug: /operations/system-tables/zookeeper_watches
title: 'system.zookeeper_watches'
doc_type: 'reference'
---

## Описание \{#description\}

Показывает активные в данный момент [наблюдения](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches), зарегистрированные сервером ClickHouse на узлах ZooKeeper (включая дополнительные экземпляры ZooKeeper). Каждая строка соответствует одному наблюдению.

## Столбцы \{#columns\}

* `zookeeper_name` ([String](../../sql-reference/data-types/string.md)) — Имя соединения ZooKeeper (`default` для основного соединения или имя вспомогательного соединения).
* `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время, когда было создано наблюдение.
* `create_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время, когда было создано наблюдение, с точностью до микросекунд.
* `path` ([String](../../sql-reference/data-types/string.md)) — Путь ZooKeeper, за которым ведется наблюдение.
* `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор сеанса соединения, которое зарегистрировало наблюдение.
* `request_xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — XID запроса, который создал наблюдение.
* `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — Тип запроса, создавшего наблюдение.
* `watch_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип наблюдения. Возможные значения:
  * `Children` — отслеживание изменений в списке дочерних узлов (задается операциями `List`).
  * `Exists` — отслеживание создания или удаления узла.
  * `Data` — отслеживание изменений в данных узла (задается операциями `Get`).

Пример:

```sql
SELECT * FROM system.zookeeper_watches FORMAT Vertical;
```

```text
Row 1:
──────
zookeeper_name:           default
create_time:              2026-03-16 12:00:00
create_time_microseconds: 2026-03-16 12:00:00.123456
path:                     /clickhouse/task_queue/ddl
session_id:               106662742089334927
request_xid:              10858
op_num:                   List
watch_type:               Children
```

**См. также**

* [ZooKeeper](../../operations/tips.md#zookeeper)
* [Руководство по ZooKeeper](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)