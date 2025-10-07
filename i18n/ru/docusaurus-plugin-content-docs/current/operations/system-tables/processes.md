---
slug: '/operations/system-tables/processes'
description: 'Системная таблица, используемая для реализации запроса `SHOW PROCESSLIST`.'
title: system.processes
keywords: ['системная таблица', 'процессы']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.processes

<SystemTableCloud/>

Эта системная таблица используется для реализации запроса `SHOW PROCESSLIST`.

Столбцы:

- `user` (String) – Пользователь, который выполнил запрос. Имейте в виду, что для распределенной обработки запросы отправляются на удаленные серверы от имени пользователя `default`. Поле содержит имя пользователя для конкретного запроса, а не для запроса, который инициировал этот запрос.
- `address` (String) – IP-адрес, с которого был сделан запрос. То же самое и для распределенной обработки. Чтобы отследить, откуда изначально был выполнен распределенный запрос, смотрите `system.processes` на сервере запрашивающего.
- `elapsed` (Float64) – Время в секундах с начала выполнения запроса.
- `read_rows` (UInt64) – Количество строк, прочитанных из таблицы. Для распределенной обработки на сервере запрашивающего это общее количество для всех удаленных серверов.
- `read_bytes` (UInt64) – Количество необработанных байтов, прочитанных из таблицы. Для распределенной обработки на сервере запрашивающего это общее количество для всех удаленных серверов.
- `total_rows_approx` (UInt64) – Приблизительное количество строк, которое должно быть прочитано. Для распределенной обработки на сервере запрашивающего это общее количество для всех удаленных серверов. Оно может обновляться в процессе обработки запроса, когда становятся известны новые источники для обработки.
- `memory_usage` (Int64) – Количество оперативной памяти, используемое запросом. Оно может не включать некоторые виды выделенной памяти. См. настройку [max_memory_usage](/operations/settings/settings#max_memory_usage).
- `query` (String) – Текст запроса. Для `INSERT` он не включает данные для вставки.
- `query_id` (String) – Идентификатор запроса, если он определен.
- `is_cancelled` (UInt8) – Запрос был отменен.
- `is_all_data_sent` (UInt8) – Все данные были отправлены клиенту (иначе говоря, запрос был завершен на сервере).

```sql
SELECT * FROM system.processes LIMIT 10 FORMAT Vertical;
```

```response
Row 1:
──────
is_initial_query:     1
user:                 default
query_id:             35a360fa-3743-441d-8e1f-228c938268da
address:              ::ffff:172.23.0.1
port:                 47588
initial_user:         default
initial_query_id:     35a360fa-3743-441d-8e1f-228c938268da
initial_address:      ::ffff:172.23.0.1
initial_port:         47588
interface:            1
os_user:              bharatnc
client_hostname:      tower
client_name:          ClickHouse
client_revision:      54437
client_version_major: 20
client_version_minor: 7
client_version_patch: 2
http_method:          0
http_user_agent:
quota_key:
elapsed:              0.000582537
is_cancelled:         0
is_all_data_sent:     0
read_rows:            0
read_bytes:           0
total_rows_approx:    0
written_rows:         0
written_bytes:        0
memory_usage:         0
peak_memory_usage:    0
query:                SELECT * from system.processes LIMIT 10 FORMAT Vertical;
thread_ids:           [67]
ProfileEvents:        {'Query':1,'SelectQuery':1,'ReadCompressedBytes':36,'CompressedReadBufferBlocks':1,'CompressedReadBufferBytes':10,'IOBufferAllocs':1,'IOBufferAllocBytes':89,'ContextLock':15,'RWLockAcquiredReadLocks':1}
Settings:             {'background_pool_size':'32','load_balancing':'random','allow_suspicious_low_cardinality_types':'1','distributed_aggregation_memory_efficient':'1','skip_unavailable_shards':'1','log_queries':'1','max_bytes_before_external_group_by':'20000000000','max_bytes_before_external_sort':'20000000000','allow_introspection_functions':'1'}

1 rows in set. Elapsed: 0.002 sec.
```