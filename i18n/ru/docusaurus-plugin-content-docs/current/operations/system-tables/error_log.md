---
slug: '/operations/system-tables/system-error-log'
description: 'Системная таблица, содержащая историю значений ошибок из таблицы `system.errors`,'
title: system.error_log
keywords: ['системная таблица', 'журнал ошибок']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит историю значений ошибок из таблицы `system.errors`, периодически сбрасываемую на диск.

Столбцы:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — Номер кода ошибки.
- `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - Имя ошибки.
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество раз, когда произошла эта ошибка.
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Удаленное исключение (т.е. полученное во время одного из распределенных запросов).

**Пример**

```sql
SELECT * FROM system.error_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2024-06-18
event_time: 2024-06-18 07:32:39
code:       999
error:      KEEPER_EXCEPTION
value:      2
remote:     0
```

**Смотрите также**

- [error_log setting](../../operations/server-configuration-parameters/settings.md#error_log) — Включение и отключение настройки.
- [system.errors](../../operations/system-tables/errors.md) — Содержит коды ошибок с количеством раз, когда они были вызваны.
- [Monitoring](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.