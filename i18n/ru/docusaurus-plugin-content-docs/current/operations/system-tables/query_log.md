---
description: 'Системная таблица, содержащая информацию о выполненных запросах, например, время начала, продолжительность обработки, сообщения об ошибках.'
slug: /operations/system-tables/query_log
title: 'system.query_log'
keywords: ['system table', 'query_log']
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о выполненных запросах, например, время начала, продолжительность обработки, сообщения об ошибках.

:::note
Эта таблица не содержит загруженные данные для запросов `INSERT`.
:::

Вы можете изменить настройки логирования запросов в разделе [query_log](../../operations/server-configuration-parameters/settings.md#query-log) конфигурации сервера.

Вы можете отключить логирование запросов, установив [log_queries = 0](/operations/settings/settings#log_queries). Мы не рекомендуем отключать логирование, так как информация в этой таблице важна для решения проблем.

Период сброса данных устанавливается в параметре `flush_interval_milliseconds` раздела настроек сервера [query_log](../../operations/server-configuration-parameters/settings.md#query-log). Чтобы принудительно выполнить сброс, используйте запрос [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs).

ClickHouse не удаляет данные из таблицы автоматически. Смотрите [Введение](/operations/system-tables/overview#system-tables-introduction) для получения дополнительной информации.

Таблица `system.query_log` фиксирует два типа запросов:

1.  Начальные запросы, которые были выполнены непосредственно клиентом.
2.  Дочерние запросы, которые были инициированы другими запросами (для распределенного выполнения запросов). Для этих типов запросов информация о родительских запросах отображается в колонках `initial_*`.

Каждый запрос создает одну или две строки в таблице `query_log` в зависимости от статуса (см. колонку `type`) запроса:

1.  Если выполнение запроса прошло успешно, создаются две строки с типами `QueryStart` и `QueryFinish`.
2.  Если во время обработки запроса произошла ошибка, создаются два события с типами `QueryStart` и `ExceptionWhileProcessing`.
3.  Если ошибка произошла до запуска запроса, создается одно событие с типом `ExceptionBeforeStart`.

Вы можете использовать настройку [log_queries_probability](/operations/settings/settings#log_queries_probability), чтобы уменьшить количество запросов, зарегистрированных в таблице `query_log`.

Вы можете использовать настройку [log_formatted_queries](/operations/settings/settings#log_formatted_queries), чтобы логировать отформатированные запросы в колонку `formatted_query`.

Колонки:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип события, которое произошло при выполнении запроса. Значения:
    - `'QueryStart' = 1` — Успешный старт выполнения запроса.
    - `'QueryFinish' = 2` — Успешное завершение выполнения запроса.
    - `'ExceptionBeforeStart' = 3` — Исключение перед началом выполнения запроса.
    - `'ExceptionWhileProcessing' = 4` — Исключение во время выполнения запроса.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата начала запроса.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала запроса.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время начала запроса с точностью до микросекунд.
- `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала выполнения запроса.
- `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время начала выполнения запроса с точностью до микросекунд.
- `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Продолжительность выполнения запроса в миллисекундах.
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Общее количество строк, прочитанных из всех таблиц и функций таблиц, участвовавших в запросе. Это включает обычные подзапросы, подзапросы для `IN` и `JOIN`. Для распределенных запросов `read_rows` включает общее количество строк, прочитанных на всех репликах. Каждая реплика отправляет свое значение `read_rows`, и сервер-инициатор запроса суммирует все полученные и локальные значения. Объемы кэша на это значение не влияют.
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Общее количество байт, прочитанных из всех таблиц и функций таблиц, участвовавших в запросе. Это включает обычные подзапросы, подзапросы для `IN` и `JOIN`. Для распределенных запросов `read_bytes` включает общее количество строк, прочитанных на всех репликах. Каждая реплика отправляет свое значение `read_bytes`, и сервер-инициатор запроса суммирует все полученные и локальные значения. Объемы кэша на это значение не влияют.
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Для запросов `INSERT` количество записанных строк. Для других запросов значение колонки равно 0.
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Для запросов `INSERT` количество записанных байт (недопжатых). Для других запросов значение колонки равно 0.
- `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество строк в результате запроса `SELECT` или количество строк в запросе `INSERT`.
- `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Объем ОЗУ в байтах, используемый для хранения результата запроса.
- `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Потребление памяти запросом.
- `current_database` ([String](../../sql-reference/data-types/string.md)) — Имя текущей базы данных.
- `query` ([String](../../sql-reference/data-types/string.md)) — Строка запроса.
- `formatted_query` ([String](../../sql-reference/data-types/string.md)) — Отформатированная строка запроса.
- `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Числовое хэш-значение, которое идентично для запросов, различающихся только значениями литералов.
- `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — Тип запроса.
- `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена баз данных, присутствующих в запросе.
- `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена таблиц, присутствующих в запросе.
- `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена колонок, присутствующих в запросе.
- `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена партиций, присутствующих в запросе.
- `projections` ([String](../../sql-reference/data-types/string.md)) — Имена проекций, использованных во время выполнения запроса.
- `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — Имена (материализованных или активных) представлений, присутствующих в запросе.
- `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — Код исключения.
- `exception` ([String](../../sql-reference/data-types/string.md)) — Сообщение об исключении.
- `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [Стек вызовов](https://en.wikipedia.org/wiki/Stack_trace). Пустая строка, если запрос был успешно выполнен.
- `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Тип запроса. Возможные значения:
    - 1 — Запрос был инициирован клиентом.
    - 0 — Запрос был инициирован другим запросом как часть распределенного выполнения запроса.
- `user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя, который инициировал текущий запрос.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — ID запроса.
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес, который использовался для выполнения запроса.
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Порт клиента, который использовался для выполнения запроса.
- `initial_user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя, который запустил начальный запрос (для распределенного выполнения запроса).
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — ID начального запроса (для распределенного выполнения запроса).
- `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — IP-адрес, с которого был запущен родительский запрос.
- `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Порт клиента, который использовался для выполнения родительского запроса.
- `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала начального запроса (для распределенного выполнения запроса).
- `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время начала начального запроса с точностью до микросекунд (для распределенного выполнения запроса).
- `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Интерфейс, из которого был инициирован запрос. Возможные значения:
    - 1 — TCP.
    - 2 — HTTP.
- `os_user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя операционной системы, запускающего [clickhouse-client](../../interfaces/cli.md).
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — Имя хоста клиентской машины, на которой запущен [clickhouse-client](../../interfaces/cli.md) или другой TCP-клиент.
- `client_name` ([String](../../sql-reference/data-types/string.md)) — Имя [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Основная версия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Небольшая версия [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизионный компонент версии [clickhouse-client](../../interfaces/cli.md) или другого TCP-клиента.
- `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Номер запроса в скрипте с несколькими запросами для [clickhouse-client](../../interfaces/cli.md).
- `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Номер строки начала запроса в скрипте с множеством запросов для [clickhouse-client](../../interfaces/cli.md).
- `http_method` (UInt8) — HTTP-метод, который инициировал запрос. Возможные значения:
    - 0 — Запрос был запущен из TCP-интерфейса.
    - 1 — Использовался метод `GET`.
    - 2 — Использовался метод `POST`.
- `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP-заголовок `UserAgent`, переданный в HTTP-запросе.
- `http_referer` ([String](../../sql-reference/data-types/string.md)) — HTTP-заголовок `Referer`, переданный в HTTP-запросе (содержит абсолютный или частичный адрес страницы, выполняющей запрос).
- `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — HTTP-заголовок `X-Forwarded-For`, переданный в HTTP-запросе.
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — Ключ `quota`, указанный в настройке [quotas](../../operations/quotas.md) (см. `keyed`).
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизия ClickHouse.
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — ProfileEvents, которые измеряют различные метрики. Описание их можно найти в таблице [system.events](/operations/system-tables/events).
- `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — Настройки, которые были изменены, когда клиент выполнил запрос. Чтобы включить логирование изменений настроек, установите параметр `log_query_settings` в 1.
- `log_comment` ([String](../../sql-reference/data-types/string.md)) — Комментарий к журналу. Он может быть установлен на произвольную строку не длиннее [max_query_size](../../operations/settings/settings.md#max_query_size). Пустая строка, если она не определена.
- `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — Идентификаторы потоков, которые участвуют в выполнении запроса. Эти потоки могут не выполняться одновременно.
- `peak_threads_usage` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Максимальное количество одновременных потоков, исполняющих запрос.
- `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические названия `aggregate functions`, которые использовались во время выполнения запроса.
- `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические названия `aggregate functions combinators`, которые использовались во время выполнения запроса.
- `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические названия `database engines`, которые использовались во время выполнения запроса.
- `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические названия `data type families`, которые использовались во время выполнения запроса.
- `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические названия `dictionaries`, которые использовались во время выполнения запроса. Для словарей, настроенных с использованием XML-файла, это имя словаря, а для словарей, созданных SQL-запросом, каноническое имя является полным квалифицированным именем объекта.
- `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические названия `formats`, которые использовались во время выполнения запроса.
- `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические названия `functions`, которые использовались во время выполнения запроса.
- `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические названия `storages`, которые использовались во время выполнения запроса.
- `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — Канонические названия `table functions`, которые использовались во время выполнения запроса.
- `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) — Привилегии, которые были успешно проверены во время выполнения запроса.
- `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) — Привилегии, отсутствующие во время выполнения запроса.
- `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — Использование [кэша запросов](../query-cache.md) во время выполнения запроса. Значения:
    - `'Unknown'` = Статус неизвестен.
    - `'None'` = Результат запроса не был ни записан в кэш запросов, ни прочитан из него.
    - `'Write'` = Результат запроса был записан в кэш запросов.
    - `'Read'` = Результат запроса был прочитан из кэша запросов.

**Пример**

``` sql
SELECT * FROM system.query_log WHERE type = 'QueryFinish' ORDER BY query_start_time DESC LIMIT 1 FORMAT Vertical;
```

``` text
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
used_privileges:                       []
missing_privileges:                    []
query_cache_usage:                     None
```

**Смотрите также**

- [system.query_thread_log](/operations/system-tables/query_thread_log) — Эта таблица содержит информацию о каждом потоке выполнения запроса.
