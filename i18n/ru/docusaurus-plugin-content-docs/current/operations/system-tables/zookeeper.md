---
slug: '/operations/system-tables/zookeeper'
description: 'Системная таблица, которая существует только если настроены ClickHouse'
title: system.zookeeper
keywords: ['системная таблица', 'zookeeper']
doc_type: reference
---
# system.zookeeper

Таблица не существует, если ClickHouse Keeper или ZooKeeper не настроены. Таблица `system.zookeeper` предоставляет данные из кластеров Keeper, определенных в конфигурации. Запрос должен содержать условие `path =` или условие `path IN`, установленное с помощью оператора `WHERE`, как показано ниже. Это соответствует пути к дочерним элементам, для которых вы хотите получить данные.

Запрос `SELECT * FROM system.zookeeper WHERE path = '/clickhouse'` выводит данные для всех дочерних элементов на узле `/clickhouse`. Чтобы вывести данные для всех корневых узлов, напишите `path = '/'`. Если указанный в 'path' путь не существует, будет выброшено исключение.

Запрос `SELECT * FROM system.zookeeper WHERE path IN ('/', '/clickhouse')` выводит данные для всех дочерних элементов на узлах `/` и `/clickhouse`. Если в указанной коллекции 'path' не существует пути, будет выброшено исключение. Это может быть использовано для выполнения пакетных запросов к путям Keeper.

Запрос `SELECT * FROM system.zookeeper WHERE path = '/clickhouse' AND zookeeperName = 'auxiliary_cluster'` выводит данные в кластере ZooKeeper `auxiliary_cluster`. Если указанный 'auxiliary_cluster' не существует, будет выброшено исключение.

Столбцы:

- `name` (String) — Имя узла.
- `path` (String) — Путь к узлу.
- `value` (String) — Значение узла.
- `zookeeperName` (String) — Имя основного или одного из вспомогательных кластеров ZooKeeper.
- `dataLength` (Int32) — Размер значения.
- `numChildren` (Int32) — Количество потомков.
- `czxid` (Int64) — Идентификатор транзакции, которая создала узел.
- `mzxid` (Int64) — Идентификатор транзакции, которая в последний раз изменила узел.
- `pzxid` (Int64) — Идентификатор транзакции, которая в последний раз удаляла или добавляла потомков.
- `ctime` (DateTime) — Время создания узла.
- `mtime` (DateTime) — Время последнего изменения узла.
- `version` (Int32) — Версия узла: количество изменений узла.
- `cversion` (Int32) — Количество добавленных или удаленных потомков.
- `aversion` (Int32) — Количество изменений в ACL.
- `ephemeralOwner` (Int64) — Для эфемерных узлов идентификатор сессии, которая владеет этим узлом.

Пример:

```sql
SELECT *
FROM system.zookeeper
WHERE path = '/clickhouse/tables/01-08/visits/replicas'
FORMAT Vertical
```

```text
Row 1:
──────
name:           example01-08-1
value:
czxid:          932998691229
mzxid:          932998691229
ctime:          2015-03-27 16:49:51
mtime:          2015-03-27 16:49:51
version:        0
cversion:       47
aversion:       0
ephemeralOwner: 0
dataLength:     0
numChildren:    7
pzxid:          987021031383
path:           /clickhouse/tables/01-08/visits/replicas

Row 2:
──────
name:           example01-08-2
value:
czxid:          933002738135
mzxid:          933002738135
ctime:          2015-03-27 16:57:01
mtime:          2015-03-27 16:57:01
version:        0
cversion:       37
aversion:       0
ephemeralOwner: 0
dataLength:     0
numChildren:    7
pzxid:          987021252247
path:           /clickhouse/tables/01-08/visits/replicas
```