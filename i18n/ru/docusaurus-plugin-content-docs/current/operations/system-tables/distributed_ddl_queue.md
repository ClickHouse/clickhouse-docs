---
slug: '/operations/system-tables/distributed_ddl_queue'
description: 'Системная таблица, содержащая информацию о распределенных ddl запросах'
title: system.distributed_ddl_queue
keywords: ['системная таблица', 'distributed_ddl_queue']
doc_type: reference
---
Содержит информацию о [распределённых ddl запросах (оператор ON CLUSTER)](../../sql-reference/distributed-ddl.md), которые были выполнены в кластере.

Столбцы:

- `entry` ([String](../../sql-reference/data-types/string.md)) — ID запроса.
- `entry_version` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) - Версия записи
- `initiator_host` ([Nullable(String)](../../sql-reference/data-types/string.md)) - Хост, который инициировал DDL операцию
- `initiator_port` ([Nullable(UInt16)](../../sql-reference/data-types/int-uint.md)) - Порт, использованный инициатором
- `cluster` ([String](../../sql-reference/data-types/string.md)) — Название кластера.
- `query` ([String](../../sql-reference/data-types/string.md)) — Выполненный запрос.
- `settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) - Настройки, использованные в DDL операции
- `query_create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время создания запроса.
- `host` ([String](../../sql-reference/data-types/string.md)) — Имя хоста
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Порт хоста.
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — Статус запроса.
- `exception_code` ([Enum8](../../sql-reference/data-types/enum.md)) — Код исключения.
- `exception_text` ([Nullable(String)](../../sql-reference/data-types/string.md)) - Сообщение об исключении
- `query_finish_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время завершения запроса.
- `query_duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Длительность выполнения запроса (в миллисекундах).

**Пример**

```sql
SELECT *
FROM system.distributed_ddl_queue
WHERE cluster = 'test_cluster'
LIMIT 2
FORMAT Vertical

Query id: f544e72a-6641-43f1-836b-24baa1c9632a

Row 1:
──────
entry:             query-0000000000
entry_version:     5
initiator_host:    clickhouse01
initiator_port:    9000
cluster:           test_cluster
query:             CREATE DATABASE test_db UUID '4a82697e-c85e-4e5b-a01e-a36f2a758456' ON CLUSTER test_cluster
settings:          {'max_threads':'16','use_uncompressed_cache':'0'}
query_create_time: 2023-09-01 16:15:14
host:              clickhouse-01
port:              9000
status:            Finished
exception_code:    0
exception_text:    
query_finish_time: 2023-09-01 16:15:14
query_duration_ms: 154

Row 2:
──────
entry:             query-0000000001
entry_version:     5
initiator_host:    clickhouse01
initiator_port:    9000
cluster:           test_cluster
query:             CREATE DATABASE test_db UUID '4a82697e-c85e-4e5b-a01e-a36f2a758456' ON CLUSTER test_cluster
settings:          {'max_threads':'16','use_uncompressed_cache':'0'}
query_create_time: 2023-09-01 16:15:14
host:              clickhouse-01
port:              9000
status:            Finished
exception_code:    630
exception_text:    Code: 630. DB::Exception: Cannot drop or rename test_db, because some tables depend on it:
query_finish_time: 2023-09-01 16:15:14
query_duration_ms: 154

2 rows in set. Elapsed: 0.025 sec.
```