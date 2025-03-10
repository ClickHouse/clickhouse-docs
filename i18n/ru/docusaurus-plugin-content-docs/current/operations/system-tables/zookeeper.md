---
description: 'Системная таблица, которая существует только в том случае, если настроены ClickHouse Keeper или ZooKeeper. Она отображает данные из кластера Keeper, определенного в конфигурации.'
slug: /operations/system-tables/zookeeper
title: 'system.zookeeper'
keywords: ['system table', 'zookeeper']
---

Таблица не существует, если ClickHouse Keeper или ZooKeeper не настроены. Таблица `system.zookeeper` отображает данные из кластера Keeper, определенного в конфигурации.  
Запрос должен содержать либо условие 'path =' либо условие `path IN`, заданное в операторе `WHERE`, как показано ниже. Это соответствует пути к дочерним элементам, для которых вы хотите получить данные.

Запрос `SELECT * FROM system.zookeeper WHERE path = '/clickhouse'` выводит данные для всех дочерних узлов на узле `/clickhouse`.  
Чтобы получить данные для всех корневых узлов, напишите path = '/'.  
Если указанный в 'path' путь не существует, будет выброшено исключение.

Запрос `SELECT * FROM system.zookeeper WHERE path IN ('/', '/clickhouse')` выводит данные для всех дочерних узлов на узлах `/` и `/clickhouse`.  
Если в указанной коллекции 'path' нет существующего пути, будет выброшено исключение.  
Это можно использовать для выполнения группы запросов к путям Keeper.

Колонки:

- `name` (String) — Имя узла.
- `path` (String) — Путь к узлу.
- `value` (String) — Значение узла.
- `dataLength` (Int32) — Размер значения.
- `numChildren` (Int32) — Количество потомков.
- `czxid` (Int64) — ID транзакции, создавшей узел.
- `mzxid` (Int64) — ID транзакции, последней изменившей узел.
- `pzxid` (Int64) — ID транзакции, последней удалившей или добавившей потомков.
- `ctime` (DateTime) — Время создания узла.
- `mtime` (DateTime) — Время последнего изменения узла.
- `version` (Int32) — Версия узла: количество раз, когда узел изменялся.
- `cversion` (Int32) — Количество добавленных или удаленных потомков.
- `aversion` (Int32) — Количество изменений в ACL.
- `ephemeralOwner` (Int64) — Для эпhemerных узлов, ID сессии, которая владеет этим узлом.

Пример:

``` sql
SELECT *
FROM system.zookeeper
WHERE path = '/clickhouse/tables/01-08/visits/replicas'
FORMAT Vertical
```

``` text
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
