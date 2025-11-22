---
description: 'Системная таблица, содержащая информацию о потоках, выполняющих запросы, например, имя потока, время его запуска, длительность обработки запроса.'
keywords: ['системная таблица', 'query_thread_log']
slug: /operations/system-tables/query_thread_log
title: 'system.query_thread_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.query_thread_log

<SystemTableCloud/>

Содержит информацию о потоках, которые выполняют запросы, например, имя потока, время его запуска и длительность обработки запроса.

Чтобы начать логирование:

1.  Настройте параметры в разделе [query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log).
2.  Установите [log_query_threads](/operations/settings/settings#log_query_threads) в 1.

Период сброса данных задаётся параметром `flush_interval_milliseconds` в разделе настроек сервера [query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log). Для принудительного сброса используйте запрос [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs).

ClickHouse не удаляет данные из таблицы автоматически. См. раздел [Introduction](/operations/system-tables/overview#system-tables-introduction) для получения дополнительной информации.

Вы можете использовать настройку [log_queries_probability](/operations/settings/settings#log_queries_probability) для уменьшения числа запросов, регистрируемых в таблице `query_thread_log`.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, на котором выполняется запрос.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — дата завершения выполнения запроса потоком.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — дата и время, когда поток завершил выполнение запроса.
* `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда поток завершил выполнение запроса, с точностью до микросекунд.
* `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала выполнения запроса.
* `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — время начала выполнения запроса с микросекундной точностью.
* `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — продолжительность выполнения запроса.
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Число прочитанных строк.
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — количество прочитанных байт.
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Для запросов `INSERT` количество записанных строк. Для остальных запросов значение столбца равно 0.
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — для запросов `INSERT` — количество записанных байт. Для остальных запросов значение столбца равно 0.
* `memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — разница между объемом выделенной и освобожденной памяти для данного потока.
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — Максимальная разность между количеством выделенной и освобождённой памяти в контексте данного потока.
* `thread_name` ([String](../../sql-reference/data-types/string.md)) — Имя потока.
* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — идентификатор потока ОС.
* `master_thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — исходный идентификатор основного потока в ОС.
* `query` ([String](../../sql-reference/data-types/string.md)) — строка запроса.
* `is_initial_query` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — тип запроса. Возможные значения:
  * 1 — Запрос был инициирован клиентом.
  * 0 — Запрос был инициирован другим запросом при распределённом выполнении запроса.
* `user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя, инициировавшего текущий запрос.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор запроса.
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес, с которого был выполнен запрос.
* `port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — порт клиента, использованный для выполнения запроса.
* `initial_user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя, который выполнил исходный запрос (для распределённого выполнения запроса).
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор исходного запроса (для распределённого выполнения запроса).
* `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес, с которого был инициирован родительский запрос.
* `initial_port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — клиентский порт, который использовался для выполнения родительского запроса.
* `interface` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Интерфейс, через который был инициирован запрос. Возможные значения:
  * 1 — TCP.
  * 2 — HTTP.
* `os_user` ([String](../../sql-reference/data-types/string.md)) — имя пользователя операционной системы, от имени которого запускается [clickhouse-client](../../interfaces/cli.md).
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — имя хоста клиентской машины, на которой запущен [clickhouse-client](../../interfaces/cli.md) или другой TCP-клиент.
* `client_name` ([String](../../sql-reference/data-types/string.md)) — имя [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ревизия клиента [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Мажорная версия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Минорная версия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Номер патча версии [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `http_method` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — HTTP-метод, с которым был отправлен запрос. Возможные значения:
  * 0 — Запрос был выполнен через TCP-интерфейс.
  * 1 — Использован метод `GET`.
  * 2 — Использован метод `POST`.
* `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — заголовок `UserAgent`, переданный в HTTP-запросе.`
* `quota_key` ([String](../../sql-reference/data-types/string.md)) — «ключ квоты», заданный в настройке [quotas](../../operations/quotas.md) (см. `keyed`).
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ревизия сервера ClickHouse.
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — события профилировщика ProfileEvents, которые фиксируют различные метрики для этого потока. Их описание можно найти в таблице [system.events](/operations/system-tables/events).

**Пример**

```sql
 SELECT * FROM system.query_thread_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                      clickhouse.eu-central1.internal
event_date:                    2020-09-11
event_time:                    2020-09-11 10:08:17
event_time_microseconds:       2020-09-11 10:08:17.134042
query_start_time:              2020-09-11 10:08:17
query_start_time_microseconds: 2020-09-11 10:08:17.063150
query_duration_ms:             70
read_rows:                     0
read_bytes:                    0
written_rows:                  1
written_bytes:                 12
memory_usage:                  4300844
peak_memory_usage:             4300844
thread_name:                   TCPHandler
thread_id:                     638133
master_thread_id:              638133
query:                         INSERT INTO test1 VALUES
is_initial_query:              1
user:                          default
query_id:                      50a320fd-85a8-49b8-8761-98a86bcbacef
address:                       ::ffff:127.0.0.1
port:                          33452
initial_user:                  default
initial_query_id:              50a320fd-85a8-49b8-8761-98a86bcbacef
initial_address:               ::ffff:127.0.0.1
initial_port:                  33452
interface:                     1
os_user:                       bharatnc
client_hostname:               tower
client_name:                   ClickHouse
client_revision:               54437
client_version_major:          20
client_version_minor:          7
client_version_patch:          2
http_method:                   0
http_user_agent:
quota_key:
revision:                      54440
ProfileEvents:        {'Query':1,'SelectQuery':1,'ReadCompressedBytes':36,'CompressedReadBufferBlocks':1,'CompressedReadBufferBytes':10,'IOBufferAllocs':1,'IOBufferAllocBytes':89,'ContextLock':15,'RWLockAcquiredReadLocks':1}
```

**См. также**

* [system.query&#95;log](/operations/system-tables/query_log) — Описание системной таблицы `query_log`, которая содержит общую информацию об исполнении запросов.
* [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) — Эта таблица содержит информацию о каждом представлении, задействованном при выполнении запроса.
