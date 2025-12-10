---
description: 'Системная таблица, содержащая историю значений ошибок из таблицы `system.errors`,
  периодически сохраняемую на диск.'
keywords: ['системная таблица', 'error_log']
slug: /operations/system-tables/system-error-log
title: 'system.error_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud />

Содержит историю значений ошибок из таблицы `system.errors`, периодически сбрасываемую на диск.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
* `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — Код ошибки.
* `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя ошибки.
* `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество возникновений этой ошибки.
* `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Удалённое исключение (т. е. полученное во время одного из распределённых запросов).
* `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md))  — Время, когда произошла последняя ошибка.
* `last_error_message` ([String](../../sql-reference/data-types/string.md)) — Сообщение последней ошибки.
* `last_error_query_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор запроса, который вызвал последнюю ошибку (если доступен).
* `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — Стек вызовов, представляющий собой список физических адресов, по которым расположены вызываемые методы.

**Пример**

```sql
SELECT * FROM system.error_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:            clickhouse.testing.internal
event_date:          2025-11-11
event_time:          2025-11-11 11:35:28
code:                60
error:               UNKNOWN_TABLE
value:               1
remote:              0
last_error_time:     2025-11-11 11:35:28
last_error_message:  Неизвестный идентификатор табличного выражения 'system.table_not_exist' в области SELECT * FROM system.table_not_exist
last_error_query_id: 77ad9ece-3db7-4236-9b5a-f789bce4aa2e
last_error_trace:    [100506790044914,100506534488542,100506409937998,100506409936517,100506425182891,100506618154123,100506617994473,100506617990486,100506617988112,100506618341386,100506630272160,100506630266232,100506630276900,100506629795243,100506633519500,100506633495783,100506692143858,100506692248921,100506790779783,100506790781278,100506790390399,100506790380047,123814948752036,123814949330028]
```

**См. также**

* [параметр error&#95;log](../../operations/server-configuration-parameters/settings.md#error_log) — Включение и отключение этого параметра.
* [system.errors](../../operations/system-tables/errors.md) — Содержит коды ошибок с числом срабатываний каждой из них.
* [Мониторинг](../../operations/monitoring.md) — Базовые концепции мониторинга ClickHouse.
