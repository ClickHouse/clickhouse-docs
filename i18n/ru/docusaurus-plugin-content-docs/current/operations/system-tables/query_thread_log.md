---
description: 'Системная таблица, содержащая информацию о потоках, выполняющих запросы, например, имя потока, время запуска потока, продолжительность обработки запроса.'
keywords: ['системная таблица', 'query_thread_log']
slug: /operations/system-tables/query_thread_log
title: 'system.query_thread_log'
---

import SystemTableCloud from '@site/i18n/docusaurus-plugin-content-docs/ru/current/_snippets/_system_table_cloud.md';


# system.query_thread_log

<SystemTableCloud/>

Содержит информацию о потоках, выполняющих запросы, например, имя потока, время запуска потока, продолжительность обработки запроса.

Чтобы начать логирование:

1.  Настройте параметры в разделе [query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log).
2.  Установите [log_query_threads](/operations/settings/settings#log_query_threads) в 1.

Период сброса данных устанавливается в параметре `flush_interval_milliseconds` в разделе настроек сервера [query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log). Чтобы принудительно выполнить сброс, используйте запрос [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs).

ClickHouse не удаляет данные из таблицы автоматически. Смотрите [Введение](/operations/system-tables/overview#system-tables-introduction) для получения дополнительных сведений.

Вы можете использовать настройку [log_queries_probability](/operations/settings/settings#log_queries_probability), чтобы уменьшить количество запросов, зарегистрированных в таблице `query_thread_log`.

Столбцы:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата, когда поток завершил выполнение запроса.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда поток завершил выполнение запроса.
- `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда поток завершил выполнение запроса с точностью до микросекунд.
- `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала выполнения запроса.
- `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время начала выполнения запроса с точностью до микросекунд.
- `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Продолжительность выполнения запроса.
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество прочитанных строк.
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество прочитанных байтов.
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Для запросов `INSERT` количество записанных строк. Для других запросов значение столбца равно 0.
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Для запросов `INSERT` количество записанных байтов. Для других запросов значение столбца равно 0.
- `memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — Разница между объемом выделенной и освобожденной памяти в контексте этого потока.
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — Максимальная разница между объемом выделенной и освобожденной памяти в контексте этого потока.
- `thread_name` ([String](../../sql-reference/data-types/string.md)) — Имя потока.
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ID потока ОС.
- `master_thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Изначальный ID потока ОС.
- `query` ([String](../../sql-reference/data-types/string.md)) — Строка запроса.
- `is_initial_query` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Тип запроса. Возможные значения:
    - 1 — Запрос был инициирован клиентом.
    - 0 — Запрос был инициирован другим запросом для распределенного выполнения запроса.
- `user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя, который инициировал текущий запрос.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — ID запроса.
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес, использованный для выполнения запроса.
- `port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — Клиентский порт, использованный для выполнения запроса.
- `initial_user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя, который запустил начальный запрос (для распределенного выполнения запроса).
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — ID начального запроса (для распределенного выполнения запроса).
- `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес, с которого был запущен родительский запрос.
- `initial_port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — Клиентский порт, использованный для выполнения родительского запроса.
- `interface` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Интерфейс, с которого был инициирован запрос. Возможные значения:
    - 1 — TCP.
    - 2 — HTTP.
- `os_user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя ОС, который запускает [clickhouse-client](../../interfaces/cli.md).
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — Имя хоста клиентской машины, где запущен [clickhouse-client](../../interfaces/cli.md) или другой TCP-клиент.
- `client_name` ([String](../../sql-reference/data-types/string.md)) — Имя [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Основная версия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Минорная версия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Версия патча [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `http_method` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — HTTP метод, инициировавший запрос. Возможные значения:
    - 0 — Запрос был запущен с интерфейса TCP.
    - 1 — Использован метод `GET`.
    - 2 — Использован метод `POST`.
- `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — Заголовок `UserAgent`, переданный в HTTP-запросе.
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — "Ключ квоты", указанный в настройке [quotas](../../operations/quotas.md) (см. `keyed`).
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизия ClickHouse.
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — ProfileEvents, измеряющие различные метрики для этого потока. Описание их можно найти в таблице [system.events](/operations/system-tables/events).

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

**Смотрите также**

- [system.query_log](/operations/system-tables/query_log) — Описание системной таблицы `query_log`, которая содержит общую информацию о выполнении запросов.
- [system.query_views_log](/operations/system-tables/query_views_log) — Эта таблица содержит информацию о каждом представлении, выполненном во время запроса.
