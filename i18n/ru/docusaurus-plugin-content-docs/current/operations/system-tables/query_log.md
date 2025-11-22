---
description: 'Системная таблица, содержащая информацию о выполненных запросах, например,
  время начала выполнения, длительность обработки, сообщения об ошибках.'
keywords: ['системная таблица', 'query_log']
slug: /operations/system-tables/query_log
title: 'system.query_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.query_log

<SystemTableCloud/>

Хранит метаданные и статистику о выполненных запросах, такие как время начала, длительность, сообщения об ошибках, использование ресурсов и другие детали выполнения. Результаты запросов не сохраняются. 

Вы можете изменить настройки логирования запросов в разделе [query_log](../../operations/server-configuration-parameters/settings.md#query_log) конфигурации сервера.

Вы можете отключить логирование запросов, установив [log_queries = 0](/operations/settings/settings#log_queries). Мы не рекомендуем отключать логирование, поскольку информация в этой таблице важна для решения проблем.

Период сброса данных задаётся параметром `flush_interval_milliseconds` в разделе настроек сервера [query_log](../../operations/server-configuration-parameters/settings.md#query_log). Для принудительного сброса выполните запрос [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs).

ClickHouse не удаляет данные из таблицы автоматически. Подробности см. во [Введении](/operations/system-tables/overview#system-tables-introduction).

Таблица `system.query_log` регистрирует два вида запросов:

1.  Исходные запросы, которые были выполнены непосредственно клиентом.
2.  Дочерние запросы, которые были инициированы другими запросами (для распределённого выполнения запросов). Для таких запросов информация о родительских запросах показывается в столбцах `initial_*`.

Каждый запрос создаёт одну или две строки в таблице `query_log` в зависимости от статуса запроса (см. столбец `type`):

1.  Если запрос был успешно выполнен, создаются две строки с типами `QueryStart` и `QueryFinish`.
2.  Если во время обработки запроса произошла ошибка, создаются два события с типами `QueryStart` и `ExceptionWhileProcessing`.
3.  Если ошибка произошла до запуска запроса, создаётся одно событие с типом `ExceptionBeforeStart`.

Вы можете использовать настройку [log_queries_probability](/operations/settings/settings#log_queries_probability), чтобы уменьшить число запросов, регистрируемых в таблице `query_log`.

Вы можете использовать настройку [log_formatted_queries](/operations/settings/settings#log_formatted_queries), чтобы записывать отформатированные запросы в столбец `formatted_query`.



## Столбцы {#columns}


* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, на котором выполняется запрос.
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) — тип события, произошедшего при выполнении запроса. Значения:
  * `'QueryStart' = 1` — Успешное начало выполнения запроса.
  * `'QueryFinish' = 2` — Успешное завершение запроса.
  * `'ExceptionBeforeStart' = 3` — Исключение до начала выполнения запроса.
  * `'ExceptionWhileProcessing' = 4` — Исключение во время выполнения запроса.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата начала выполнения запроса.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время начала запроса.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время начала выполнения запроса с точностью до микросекунд.
* `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала выполнения запроса.
* `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — время начала выполнения запроса с микросекундной точностью.
* `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Длительность выполнения запроса в миллисекундах.
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — общее количество строк, прочитанных из всех таблиц и табличных функций, участвующих в запросе. Он включает обычные подзапросы, подзапросы для `IN` и `JOIN`. Для распределённых запросов `read_rows` включает общее количество строк, прочитанных на всех репликах. Каждая реплика отправляет своё значение `read_rows`, а сервер-инициатор запроса суммирует все полученные и локальные значения. Объёмы данных, прочитанных из кэша, не влияют на это значение.
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — общее количество байт, прочитанных из всех таблиц и табличных функций, участвующих в запросе. Включает обычные подзапросы, подзапросы для `IN` и `JOIN`. Для распределённых запросов `read_bytes` включает общее количество строк, прочитанных на всех репликах. Каждая реплика отправляет своё значение `read_bytes`, а сервер-инициатор запроса суммирует все полученные значения и своё локальное. Объём данных в кэше не влияет на это значение.
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — для запросов `INSERT` — число записанных строк. Для других запросов значение столбца равно 0.
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — для запросов `INSERT` количество записанных (несжатых) байт. Для остальных запросов значение этого столбца равно 0.
* `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — количество строк в результате запроса `SELECT` или количество строк, вставляемых запросом `INSERT`.
* `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — объем оперативной памяти в байтах, используемый для хранения результата запроса.
* `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Использование памяти запросом.
* `current_database` ([String](../../sql-reference/data-types/string.md)) — имя текущей базы данных.
* `query` ([String](../../sql-reference/data-types/string.md)) — строка запроса.
* `formatted_query` ([String](../../sql-reference/data-types/string.md)) — отформатированная строка запроса.
* `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — числовое хеш-значение, одинаковое для запросов, которые отличаются только значениями литералов.
* `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — тип запроса.
* `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена баз данных, упомянутых в запросе.
* `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена таблиц, которые используются в запросе.
* `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена столбцов, содержащихся в запросе.
* `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена партиций, присутствующих в запросе.
* `projections` ([String](../../sql-reference/data-types/string.md)) — Имена проекций, используемых при выполнении запроса.
* `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена (материализованных или live‑представлений), используемых в запросе.
* `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — код исключения.
* `exception` ([String](../../sql-reference/data-types/string.md)) — сообщение об исключении.
* `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [Трассировка стека](https://en.wikipedia.org/wiki/Stack_trace). Пустая строка, если запрос был успешно выполнен.
* `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Тип запроса. Возможные значения:
  * 1 — Запрос был инициирован клиентом.
  * 0 — Запрос был инициирован другим запросом в рамках выполнения распределённого запроса.
* `user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя, инициировавшего текущий запрос.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор запроса.
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес, с которого был отправлен запрос.
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Порт клиента, через который был выполнен запрос.
* `initial_user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя, который выполнил исходный запрос (при распределённом выполнении запросов).
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор исходного запроса (при распределённом выполнении запросов).
* `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес, с которого был выполнен родительский запрос.
* `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — клиентский порт, который использовался для выполнения родительского запроса.
* `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала исходного запроса (при распределённом выполнении запроса).
* `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время начала исходного запроса с точностью до микросекунд (для распределённого выполнения запроса).
* `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Интерфейс, через который был инициирован запрос. Возможные значения:
  * 1 — TCP.
  * 2 — HTTP.
* `os_user` ([String](../../sql-reference/data-types/string.md)) — имя пользователя операционной системы, под которым запускается [clickhouse-client](../../interfaces/cli.md).
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — имя хоста клиентского компьютера, на котором запущен [clickhouse-client](../../interfaces/cli.md) или другой TCP-клиент.
* `client_name` ([String](../../sql-reference/data-types/string.md)) — Имя [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ревизия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Мажорная версия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Номер минорной версии [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Патч-компонент версии [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
* `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — номер запроса в скрипте, содержащем несколько запросов для [clickhouse-client](../../interfaces/cli.md).
* `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Номер строки, на которой начинается запрос, в скрипте с несколькими запросами для [clickhouse-client](../../interfaces/cli.md).
* `http_method` (UInt8) — HTTP-метод, который инициировал запрос. Возможные значения:
  * 0 — Запрос был выполнен через интерфейс TCP.
  * 1 — Использовался метод `GET`.
  * 2 — Использовался метод `POST`.
* `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP-заголовок `UserAgent`, переданный в HTTP-запросе.
* `http_referer` ([String](../../sql-reference/data-types/string.md)) — HTTP-заголовок `Referer`, переданный в HTTP-запросе (содержит полный или частичный адрес страницы, с которой был отправлен запрос).
* `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — HTTP-заголовок `X-Forwarded-For`, передаваемый в HTTP-запросе.
* `quota_key` ([String](../../sql-reference/data-types/string.md)) — ключ квоты (`quota key`), указанный в параметре [quotas](../../operations/quotas.md) (см. `keyed`).
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — номер ревизии ClickHouse.
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — счётчики ProfileEvents, которые измеряют различные метрики. Их описание можно найти в таблице [system.events](/operations/system-tables/events)
* `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — настройки, которые были изменены при выполнении запроса клиентом. Чтобы включить логирование изменений настроек, установите значение параметра `log_query_settings` равным 1.
* `log_comment` ([String](../../sql-reference/data-types/string.md)) — Комментарий для журнала. Может быть произвольной строкой длиной не более [max&#95;query&#95;size](../../operations/settings/settings.md#max_query_size). Пустая строка, если не задан.
* `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — идентификаторы потоков, задействованных в выполнении запроса. Эти потоки могли выполняться не одновременно.
* `peak_threads_usage` ([UInt64)](../../sql-reference/data-types/int-uint.md)) — Максимальное количество потоков, одновременно выполняющих запрос.
* `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические имена агрегатных функций, использованных при выполнении запроса.
* `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — канонические имена комбинаторов агрегатных функций, использованных при выполнении запроса.
* `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — канонические имена `движков баз данных`, использованных при выполнении запроса.
* `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические имена `семейств типов данных`, которые использовались при выполнении запроса.
* `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические имена `dictionaries`, которые были использованы во время выполнения запроса. Для словарей, сконфигурированных с помощью XML-файла, это имя словаря, а для словарей, созданных с помощью SQL-оператора, каноническим именем является полностью квалифицированное имя объекта.
* `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические имена `форматов`, использованных при выполнении запроса.
* `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — канонические имена `functions`, использованных при выполнении запроса.
* `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические имена `storages`, которые использовались при выполнении запроса.
* `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические имена табличных функций (`table functions`), которые были использованы во время выполнения запроса.
* `used_executable_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические имена `executable user defined functions`, которые использовались при выполнении запроса.
* `used_sql_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические имена функций SQL, определённых пользователем (`sql user defined functions`), которые использовались при выполнении запроса.
* `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - Привилегии, которые были успешно проверены при выполнении запроса.
* `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) — Привилегии, которые отсутствуют при выполнении запроса.
* `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — использование [кэша запросов](../query-cache.md) при выполнении запроса. Значения:`
  * `'Unknown'` = Статус неизвестен.
  * `'None'` = Результат запроса не был записан в кэш запросов и не считывался из него.
  * `'Write'` = Результат запроса был записан в кэш запросов.
  * `'Read'` = Результат запроса был прочитан из кэша запросов.





## Примеры {#examples}

**Базовый пример**

```sql
SELECT * FROM system.query_log WHERE type = 'QueryFinish' ORDER BY query_start_time DESC LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                              clickhouse.eu-central1.internal
type:                                  QueryFinish
event_date:                            2021-11-03
event_time:                            2021-11-03 16:13:54
event_time_microseconds:               2021-11-03 16:13:54.953024
query_start_time:                      2021-11-03 16:13:54
query_start_time_microseconds:         2021-11-03 16:13:54.952325
query_duration_ms:                     0
read_rows:                             69
read_bytes:                            6187
written_rows:                          0
written_bytes:                         0
result_rows:                           69
result_bytes:                          48256
memory_usage:                          0
current_database:                      default
query:                                 DESCRIBE TABLE system.query_log
formatted_query:
normalized_query_hash:                 8274064835331539124
query_kind:
databases:                             []
tables:                                []
columns:                               []
projections:                           []
views:                                 []
exception_code:                        0
exception:
stack_trace:
is_initial_query:                      1
user:                                  default
query_id:                              7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
address:                               ::ffff:127.0.0.1
port:                                  40452
initial_user:                          default
initial_query_id:                      7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
initial_address:                       ::ffff:127.0.0.1
initial_port:                          40452
initial_query_start_time:              2021-11-03 16:13:54
initial_query_start_time_microseconds: 2021-11-03 16:13:54.952325
interface:                             1
os_user:                               sevirov
client_hostname:                       clickhouse.eu-central1.internal
client_name:                           ClickHouse
client_revision:                       54449
client_version_major:                  21
client_version_minor:                  10
client_version_patch:                  1
http_method:                           0
http_user_agent:
http_referer:
forwarded_for:
quota_key:
revision:                              54456
log_comment:
thread_ids:                            [30776,31174]
ProfileEvents:                         {'Query':1,'NetworkSendElapsedMicroseconds':59,'NetworkSendBytes':2643,'SelectedRows':69,'SelectedBytes':6187,'ContextLock':9,'RWLockAcquiredReadLocks':1,'RealTimeMicroseconds':817,'UserTimeMicroseconds':427,'SystemTimeMicroseconds':212,'OSCPUVirtualTimeMicroseconds':639,'OSReadChars':894,'OSWriteChars':319}
Settings:                              {'load_balancing':'random','max_memory_usage':'10000000000'}
used_aggregate_functions:              []
used_aggregate_function_combinators:   []
used_database_engines:                 []
used_data_type_families:               []
used_dictionaries:                     []
used_formats:                          []
used_functions:                        []
used_storages:                         []
used_table_functions:                  []
used_executable_user_defined_functions:[]
used_sql_user_defined_functions:       []
used_privileges:                       []
missing_privileges:                    []
query_cache_usage:                     None
```

**Пример для Cloud**

В ClickHouse Cloud таблица `system.query_log` является локальной для каждого узла; для просмотра всех записей необходимо выполнить запрос через [`clusterAllReplicas`](/sql-reference/table-functions/cluster).

Например, для агрегирования строк из query_log со всех реплик в кластере "default" можно использовать следующий запрос:

```sql
SELECT *
FROM clusterAllReplicas('default', system.query_log)
WHERE event_time >= now() - toIntervalHour(1)
LIMIT 10
SETTINGS skip_unavailable_shards = 1;
```

**См. также**

- [system.query_thread_log](/operations/system-tables/query_thread_log) — таблица содержит информацию о каждом потоке выполнения запроса.
