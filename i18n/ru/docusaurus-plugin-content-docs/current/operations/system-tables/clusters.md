---
description: 'Системная таблица, содержащая информацию о кластерах, доступных в файле конфигурации, и серверах, определенных в них.'
slug: /operations/system-tables/clusters
title: 'system.clusters'
keywords: ['системная таблица', 'кластеры']
---

Содержит информацию о кластерах, доступных в файле конфигурации, и серверах в них.

Колонки:

- `cluster` ([String](../../sql-reference/data-types/string.md)) — Название кластера.
- `shard_num` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Номер шарда в кластере, начиная с 1. Может измениться в результате модификации кластера.
- `shard_name` ([String](../../sql-reference/data-types/string.md)) — Название шарда в кластере.
- `shard_weight` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Относительный вес шарда при записи данных.
- `replica_num` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Номер реплики в шарде, начиная с 1.
- `host_name` ([String](../../sql-reference/data-types/string.md)) — Имя хоста, указанное в конфигурации.
- `host_address` ([String](../../sql-reference/data-types/string.md)) — IP-адрес хоста, полученный из DNS.
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Порт для подключения к серверу.
- `is_local` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, является ли хост локальным.
- `user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя для подключения к серверу.
- `default_database` ([String](../../sql-reference/data-types/string.md)) — Название базы данных по умолчанию.
- `errors_count` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Количество случаев, когда этот хост не смог достичь реплики.
- `slowdowns_count` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Количество замедлений, которые привели к изменению реплики при установлении соединения с хеджированными запросами.
- `estimated_recovery_time` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Остаток секунд до тех пор, пока счетчик ошибок реплики не будет обнулен, и она не будет считаться нормальной.
- `database_shard_name` ([String](../../sql-reference/data-types/string.md)) — Название шарда базы данных `Replicated` (для кластеров, принадлежащих базе данных `Replicated`).
- `database_replica_name` ([String](../../sql-reference/data-types/string.md)) — Название реплики базы данных `Replicated` (для кластеров, принадлежащих базе данных `Replicated`).
- `is_active` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — Статус реплики базы данных `Replicated` (для кластеров, принадлежащих базе данных `Replicated`): 1 означает "реплика онлайн", 0 означает "реплика оффлайн", `NULL` означает "неизвестно".
- `name` ([String](../../sql-reference/data-types/string.md)) — Псевдоним для кластера.

**Пример**

Запрос:

```sql
SELECT * FROM system.clusters LIMIT 2 FORMAT Vertical;
```

Результат:

```text
Row 1:
──────
cluster:                 test_cluster_two_shards
shard_num:               1
shard_name:              shard_01
shard_weight:            1
replica_num:             1
host_name:               127.0.0.1
host_address:            127.0.0.1
port:                    9000
is_local:                1
user:                    default
default_database:
errors_count:            0
slowdowns_count:         0
estimated_recovery_time: 0
database_shard_name:
database_replica_name:
is_active:               NULL

Row 2:
──────
cluster:                 test_cluster_two_shards
shard_num:               2
shard_name:              shard_02
shard_weight:            1
replica_num:             1
host_name:               127.0.0.2
host_address:            127.0.0.2
port:                    9000
is_local:                0
user:                    default
default_database:
errors_count:            0
slowdowns_count:         0
estimated_recovery_time: 0
database_shard_name:
database_replica_name:
is_active:               NULL
```

**Смотрите также**

- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap setting](../../operations/settings/settings.md#distributed_replica_error_cap)
- [distributed_replica_error_half_life setting](../../operations/settings/settings.md#distributed_replica_error_half_life)
