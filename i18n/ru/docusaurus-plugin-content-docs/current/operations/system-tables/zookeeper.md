---
description: 'Системная таблица, которая существует только если настроен ClickHouse Keeper или ZooKeeper. Предоставляет данные из кластера Keeper, заданного в конфигурации.'
keywords: ['системная таблица', 'zookeeper']
slug: /operations/system-tables/zookeeper
title: 'system.zookeeper'
doc_type: 'reference'
---

# system.zookeeper \{#systemzookeeper\}

Таблица не существует, если не настроен ClickHouse Keeper или ZooKeeper. Таблица `system.zookeeper` предоставляет данные из кластеров Keeper, определённых в конфигурации.
Запрос должен содержать либо условие `path =`, либо условие `path IN` в секции `WHERE`, как показано ниже. Это соответствует пути дочерних узлов, для которых вы хотите получить данные.

Запрос `SELECT * FROM system.zookeeper WHERE path = '/clickhouse'` выводит данные для всех дочерних узлов узла `/clickhouse`.
Чтобы вывести данные для всех корневых узлов, укажите path = &#39;/&#39;.
Если путь, указанный в &#39;path&#39;, не существует, будет сгенерировано исключение.

Запрос `SELECT * FROM system.zookeeper WHERE path IN ('/', '/clickhouse')` выводит данные для всех дочерних узлов узлов `/` и `/clickhouse`.
Если в указанной коллекции &#39;path&#39; отсутствует путь, будет сгенерировано исключение.
Эту таблицу можно использовать для пакетного выполнения запросов по путям в Keeper.

Запрос `SELECT * FROM system.zookeeper WHERE path = '/clickhouse' AND zookeeperName = 'auxiliary_cluster'` выводит данные из кластера ZooKeeper `auxiliary_cluster`.
Если указанный &#39;auxiliary&#95;cluster&#39; не существует, будет сгенерировано исключение.

Столбцы:

* `name` (String) — Имя узла.
* `path` (String) — Путь к узлу.
* `value` (String) — Значение узла.
* `zookeeperName` (String) — Имя кластера ZooKeeper по умолчанию или одного из дополнительных кластеров.
* `dataLength` (Int32) — Размер значения.
* `numChildren` (Int32) — Количество потомков.
* `czxid` (Int64) — ID транзакции, создавшей узел.
* `mzxid` (Int64) — ID транзакции, последней изменившей узел.
* `pzxid` (Int64) — ID транзакции, последней удалившей или добавившей потомков.
* `ctime` (DateTime) — Время создания узла.
* `mtime` (DateTime) — Время последнего изменения узла.
* `version` (Int32) — Версия узла: количество изменений узла.
* `cversion` (Int32) — Количество добавленных или удалённых потомков.
* `aversion` (Int32) — Количество изменений ACL.
* `ephemeralOwner` (Int64) — Для эфемерных узлов — ID сессии, которой принадлежит этот узел.

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
