---
slug: '/operations/system-tables/query_views_log'
description: 'Системная таблица, содержащая информацию о зависимых представлениях,'
title: system.query_views_log
keywords: ['системная таблица', 'query_views_log']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_views_log

<SystemTableCloud/>

Содержит информацию о зависимых представлениях, выполненных при запуске запроса, например, тип представления или время выполнения.

Чтобы начать логирование:

1. Настройте параметры в разделе [query_views_log](../../operations/server-configuration-parameters/settings.md#query_views_log).
2. Установите [log_query_views](/operations/settings/settings#log_query_views) в 1.

Период сброса данных устанавливается в параметре `flush_interval_milliseconds` в разделе настроек сервера [query_views_log](../../operations/server-configuration-parameters/settings.md#query_views_log). Чтобы принудительно сбросить, используйте запрос [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs).

ClickHouse не удаляет данные из таблицы автоматически. Дополнительные сведения см. в [Введении](/operations/system-tables/overview#system-tables-introduction).

Вы можете использовать настройку [log_queries_probability](/operations/settings/settings#log_queries_probability) для уменьшения количества запросов, зарегистрированных в таблице `query_views_log`.

Столбцы:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата, когда произошло последнее событие представления.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда представление завершило выполнение.
- `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда представление завершило выполнение с точностью до микросекунд.
- `view_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Длительность выполнения представления (сумма его стадий) в миллисекундах.
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор начального запроса (для распределенного выполнения запроса).
- `view_name` ([String](../../sql-reference/data-types/string.md)) — Имя представления.
- `view_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID представления.
- `view_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип представления. Значения:
  - `'Default' = 1` — [Обычные представления](/sql-reference/statements/create/view#normal-view). Не должны появляться в этом логе.
  - `'Materialized' = 2` — [Материализованные представления](/sql-reference/statements/create/view#materialized-view).
  - `'Live' = 3` — [Live-представления](../../sql-reference/statements/create/view.md#live-view).
- `view_query` ([String](../../sql-reference/data-types/string.md)) — Запрос, выполняемый представлением.
- `view_target` ([String](../../sql-reference/data-types/string.md)) — Имя целевой таблицы представления.
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество считанных строк.
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество считанных байт.
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество записанных строк.
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество записанных байт.
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — Максимальная разница между количеством выделенной и освобожденной памяти в контексте этого представления.
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — ProfileEvents, которые измеряют различные метрики. Описание их можно найти в таблице [system.events](/operations/system-tables/events).
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — Статус представления. Значения:
  - `'QueryStart' = 1` — Успешный старт выполнения представления. Не должно появляться.
  - `'QueryFinish' = 2` — Успешное завершение выполнения представления.
  - `'ExceptionBeforeStart' = 3` — Исключение перед началом выполнения представления.
  - `'ExceptionWhileProcessing' = 4` — Исключение во время выполнения представления.
- `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — Код исключения.
- `exception` ([String](../../sql-reference/data-types/string.md)) — Сообщение об исключении.
- `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [Стек вызовов](https://en.wikipedia.org/wiki/Stack_trace). Пустая строка, если запрос был успешно завершен.

**Пример**

Запрос:

```sql
SELECT * FROM system.query_views_log LIMIT 1 \G;
```

Результат:

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2021-06-22
event_time:              2021-06-22 13:23:07
event_time_microseconds: 2021-06-22 13:23:07.738221
view_duration_ms:        0
initial_query_id:        c3a1ac02-9cad-479b-af54-9e9c0a7afd70
view_name:               default.matview_inner
view_uuid:               00000000-0000-0000-0000-000000000000
view_type:               Materialized
view_query:              SELECT * FROM default.table_b
view_target:             default.`.inner.matview_inner`
read_rows:               4
read_bytes:              64
written_rows:            2
written_bytes:           32
peak_memory_usage:       4196188
ProfileEvents:           {'FileOpen':2,'WriteBufferFromFileDescriptorWrite':2,'WriteBufferFromFileDescriptorWriteBytes':187,'IOBufferAllocs':3,'IOBufferAllocBytes':3145773,'FunctionExecute':3,'DiskWriteElapsedMicroseconds':13,'InsertedRows':2,'InsertedBytes':16,'SelectedRows':4,'SelectedBytes':48,'ContextLock':16,'RWLockAcquiredReadLocks':1,'RealTimeMicroseconds':698,'SoftPageFaults':4,'OSReadChars':463}
status:                  QueryFinish
exception_code:          0
exception:
stack_trace:
```

**См. также**

- [system.query_log](/operations/system-tables/query_log) — Описание системной таблицы `query_log`, которая содержит общую информацию о выполнении запросов.
- [system.query_thread_log](/operations/system-tables/query_thread_log) — Эта таблица содержит информацию о каждом потоке выполнения запроса.