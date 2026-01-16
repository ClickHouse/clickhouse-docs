---
description: 'Системная таблица, содержащая информацию о параметрах запроса к серверу ZooKeeper и ответе сервера.'
keywords: ['system table', 'zookeeper_log']
slug: /operations/system-tables/zookeeper_log
title: 'system.zookeeper_log'
doc_type: 'reference'
---

# system.zookeeper&#95;log \\{#systemzookeeper&#95;log\\}

Эта таблица содержит информацию о параметрах запроса к серверу ZooKeeper и его ответе.

Для запросов заполняются только столбцы с параметрами запроса, а остальные столбцы заполняются значениями по умолчанию (`0` или `NULL`). Когда приходит ответ, данные из ответа добавляются в другие столбцы.

Столбцы с параметрами запроса:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, на котором выполняется запрос.
* `type` ([Enum](../../sql-reference/data-types/enum.md)) — Тип события в клиенте ZooKeeper. Может иметь одно из следующих значений:
  * `Request` — Запрос был отправлен.
  * `Response` — Ответ был получен.
  * `Finalize` — Соединение потеряно, ответ не был получен.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата, когда произошло событие.
* `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Дата и время, когда произошло событие.
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес сервера ZooKeeper, который использовался для выполнения запроса.
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Порт сервера ZooKeeper, который использовался для выполнения запроса.
* `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор сессии, который сервер ZooKeeper устанавливает для каждого соединения.
* `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — Идентификатор запроса внутри сессии. Обычно это последовательный номер запроса. Он одинаков для строки с запросом и соответствующей строки `response`/`finalize`.
* `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Устанавливается ли [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches) этим запросом.
* `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — Тип запроса или ответа.
* `path` ([String](../../sql-reference/data-types/string.md)) — Путь к узлу ZooKeeper, указанному в запросе, или пустая строка, если запрос не требует указания пути.
* `data` ([String](../../sql-reference/data-types/string.md)) — Данные, записанные в узел ZooKeeper (для запросов `SET` и `CREATE` — что запрос хотел записать, для ответа на запрос `GET` — что было прочитано) или пустая строка.
* `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Создаётся ли узел ZooKeeper как [временный (ephemeral)](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes).
* `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Создаётся ли узел ZooKeeper как [последовательный (sequential)](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming).
* `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — Версия узла ZooKeeper, которую запрос ожидает при выполнении. Поддерживается для запросов `CHECK`, `SET`, `REMOVE` (имеет значение `-1`, если запрос не проверяет версию, или `NULL` для других запросов, которые не поддерживают проверку версии).
* `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Количество запросов, входящих в multi-запрос (это специальный запрос, который состоит из нескольких последовательных обычных запросов и выполняет их атомарно). Все запросы, включённые в multi-запрос, будут иметь одинаковый `xid`.
* `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Номер запроса, входящего в multi-запрос (для самого multi-запроса — `0`, затем по порядку начиная с `1`).

Столбцы с параметрами ответа на запрос:

* `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — идентификатор транзакции ZooKeeper. Порядковый номер, выдаваемый сервером ZooKeeper в ответ на успешно выполненный запрос (`0`, если запрос не был выполнен/вернул ошибку/клиент не знает, был ли запрос выполнен).
* `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — код ошибки. Может иметь много значений, ниже приведены только некоторые из них:
  * `ZOK` — запрос выполнен успешно.
  * `ZCONNECTIONLOSS` — соединение потеряно.
  * `ZOPERATIONTIMEOUT` — истёк таймаут выполнения запроса.
  * `ZSESSIONEXPIRED` — срок действия сессии истёк.
  * `NULL` — запрос завершён.
* `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — тип события `watch` (для ответов с `op_num` = `Watch`), для остальных ответов: `NULL`.
* `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — состояние события `watch` (для ответов с `op_num` = `Watch`), для остальных ответов: `NULL`.
* `path_created` ([String](../../sql-reference/data-types/string.md)) — путь к созданному узлу ZooKeeper (для ответов на запрос `CREATE`); может отличаться от `path`, если узел создан как `sequential`.
* `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — `zxid` изменения, в результате которого был создан этот узел ZooKeeper.
* `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — `zxid` изменения, которое последним модифицировало этот узел ZooKeeper.
* `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — идентификатор транзакции изменения, которое последним модифицировало дочерние узлы этого узла ZooKeeper.
* `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — количество изменений данных этого узла ZooKeeper.
* `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — количество изменений дочерних узлов этого узла ZooKeeper.
* `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — длина поля данных этого узла ZooKeeper.
* `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — количество дочерних узлов этого узла ZooKeeper.
* `children` ([Array(String)](../../sql-reference/data-types/array.md)) — список дочерних узлов ZooKeeper (для ответов на запрос `LIST`).

**Пример**

Запрос:

```sql
SELECT * FROM system.zookeeper_log WHERE (session_id = '106662742089334927') AND (xid = '10858') FORMAT Vertical;
```

Результат:

```text
Row 1:
──────
hostname:         clickhouse.eu-central1.internal
type:             Request
event_date:       2021-08-09
event_time:       2021-08-09 21:38:30.291792
address:          ::
port:             2181
session_id:       106662742089334927
xid:              10858
has_watch:        1
op_num:           List
path:             /clickhouse/task_queue/ddl
data:
is_ephemeral:     0
is_sequential:    0
version:          ᴺᵁᴸᴸ
requests_size:    0
request_idx:      0
zxid:             0
error:            ᴺᵁᴸᴸ
watch_type:       ᴺᵁᴸᴸ
watch_state:      ᴺᵁᴸᴸ
path_created:
stat_czxid:       0
stat_mzxid:       0
stat_pzxid:       0
stat_version:     0
stat_cversion:    0
stat_dataLength:  0
stat_numChildren: 0
children:         []

Row 2:
──────
type:             Response
event_date:       2021-08-09
event_time:       2021-08-09 21:38:30.292086
address:          ::
port:             2181
session_id:       106662742089334927
xid:              10858
has_watch:        1
op_num:           List
path:             /clickhouse/task_queue/ddl
data:
is_ephemeral:     0
is_sequential:    0
version:          ᴺᵁᴸᴸ
requests_size:    0
request_idx:      0
zxid:             16926267
error:            ZOK
watch_type:       ᴺᵁᴸᴸ
watch_state:      ᴺᵁᴸᴸ
path_created:
stat_czxid:       16925469
stat_mzxid:       16925469
stat_pzxid:       16926179
stat_version:     0
stat_cversion:    7
stat_dataLength:  0
stat_numChildren: 7
children:         ['query-0000000006','query-0000000005','query-0000000004','query-0000000003','query-0000000002','query-0000000001','query-0000000000']
```

**См. также**

* [ZooKeeper](../../operations/tips.md#zookeeper)
* [Руководство по ZooKeeper](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
