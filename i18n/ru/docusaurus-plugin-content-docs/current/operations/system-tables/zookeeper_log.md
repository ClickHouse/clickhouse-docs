---
slug: '/operations/system-tables/zookeeper_log'
description: 'Системная таблица, содержащая информацию о параметрах запроса к серверу'
title: system.zookeeper_log
keywords: ['системная таблица', 'zookeeper_log']
doc_type: reference
---
# system.zookeeper_log

Эта таблица содержит информацию о параметрах запроса к серверу ZooKeeper и ответе от него.

Для запросов заполняются только столбцы с параметрами запроса, а остальные столбцы заполняются значениями по умолчанию (`0` или `NULL`). Когда приходит ответ, данные из ответа добавляются в другие столбцы.

Столбцы с параметрами запроса:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — Тип события в клиенте ZooKeeper. Может принимать одно из следующих значений:
  - `Request` — Запрос был отправлен.
  - `Response` — Ответ был получен.
  - `Finalize` — Соединение потеряно, ответ не получен.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата, когда произошло событие.
- `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Дата и время, когда произошло событие.
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес сервера ZooKeeper, который использовался для выполнения запроса.
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Порт сервера ZooKeeper, который использовался для выполнения запроса.
- `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор сеанса, который сервер ZooKeeper устанавливает для каждого соединения.
- `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — Идентификатор запроса в рамках сеанса. Обычно это последовательный номер запроса. Он одинаков для строки запроса и сопряженной строки `response`/`finalize`.
- `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Запрос на наличие установленного [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches).
- `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — Тип запроса или ответа.
- `path` ([String](../../sql-reference/data-types/string.md)) — Путь к узлу ZooKeeper, указанному в запросе, или пустая строка, если запрос не требует указания пути.
- `data` ([String](../../sql-reference/data-types/string.md)) — Данные, записанные в узел ZooKeeper (для запросов `SET` и `CREATE` — то, что запрос хотел записать; для ответа на запрос `GET` — то, что было прочитано) или пустая строка.
- `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Создается ли узел ZooKeeper как [эпhemeral](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes).
- `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Создается ли узел ZooKeeper как [sequential](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming).
- `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — Версия узла ZooKeeper, которую запрос ожидает при выполнении. Это поддерживается для запросов `CHECK`, `SET`, `REMOVE` (релевантно `-1`, если запрос не проверяет версию, или `NULL` для других запросов, которые не поддерживают проверку версии).
- `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Количество запросов, включенных в многоразовый запрос (это специальный запрос, состоящий из нескольких последовательных обычных запросов и выполняющих их атомарно). Все запросы, включенные в многоразовый запрос, будут иметь один и тот же `xid`.
- `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Номер запроса, включенного в многоразовый запрос (для многоразового запроса — `0`, затем по порядку от `1`).

Столбцы с параметрами ответа на запрос:

- `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор транзакции ZooKeeper. Серийный номер, выданы сервером ZooKeeper в ответ на успешно выполненный запрос (`0`, если запрос не был выполнен/вернулся с ошибкой/клиент не знает, был ли запрос выполнен).
- `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — Код ошибки. Может иметь множество значений, вот некоторые из них:
  - `ZOK` — Запрос был выполнен успешно.
  - `ZCONNECTIONLOSS` — Соединение было потеряно.
  - `ZOPERATIONTIMEOUT` — Время выполнения запроса истекло.
  - `ZSESSIONEXPIRED` — Сессия истекла.
  - `NULL` — Запрос завершен.
- `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — Тип события `watch` (для ответов с `op_num` = `Watch`), для остальных ответов: `NULL`.
- `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — Статус события `watch` (для ответов с `op_num` = `Watch`), для остальных ответов: `NULL`.
- `path_created` ([String](../../sql-reference/data-types/string.md)) — Путь к созданному узлу ZooKeeper (для ответов на запрос `CREATE`), может отличаться от `path`, если узел создается как `sequential`.
- `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — `zxid` изменения, которое привело к созданию этого узла ZooKeeper.
- `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — `zxid` изменения, которое в последний раз изменило этот узел ZooKeeper.
- `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — Идентификатор транзакции изменения, которое в последний раз изменило дочерние узлы этого узла ZooKeeper.
- `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — Количество изменений данных этого узла ZooKeeper.
- `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — Количество изменений дочерних узлов этого узла ZooKeeper.
- `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — Длина поля данных этого узла ZooKeeper.
- `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — Количество дочерних узлов этого узла ZooKeeper.
- `children` ([Array(String)](../../sql-reference/data-types/array.md)) — Список дочерних узлов ZooKeeper (для ответов на запрос `LIST`).

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

- [ZooKeeper](../../operations/tips.md#zookeeper)
- [Руководство по ZooKeeper](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)