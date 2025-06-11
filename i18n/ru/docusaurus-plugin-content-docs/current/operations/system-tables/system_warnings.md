---
description: 'Эта таблица содержит предупреждения о сервере ClickHouse.'
keywords: [ 'системная таблица', 'предупреждения' ]
slug: /operations/system-tables/system_warnings
title: 'system.warnings'
---

import SystemTableCloud from '@site/i18n/docusaurus-plugin-content-docs/ru/current/_snippets/_system_table_cloud.md';


# system.warnings

<SystemTableCloud/>

Эта таблица показывает предупреждения о сервере ClickHouse. 
Предупреждения одного и того же типа объединяются в одно предупреждение. 
Например, если число N прикрепленных баз данных превышает настраиваемый порог T, отображается одна запись с текущим значением N вместо N отдельных записей. 
Если текущее значение падает ниже порога, запись удаляется из таблицы.

Таблицу можно настроить с помощью следующих параметров:

- [max_table_num_to_warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
- [max_database_num_to_warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
- [max_dictionary_num_to_warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
- [max_view_num_to_warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
- [max_part_num_to_warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
- [max_pending_mutations_to_warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)
- [max_pending_mutations_execution_time_to_warn](/operations/server-configuration-parameters/settings#max_pending_mutations_execution_time_to_warn)

Колонки:

- `message` ([String](../../sql-reference/data-types/string.md)) — Сообщение предупреждения.
- `message_format_string` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Строка формата, используемая для форматирования сообщения.

**Пример**

Запрос:

```sql
 SELECT * FROM system.warnings LIMIT 2 \G;
```

Результат:

```text
Row 1:
──────
message:               Число активных частей больше 10.
message_format_string: Число активных частей больше {}.

Row 2:
──────
message:               Число прикрепленных баз данных больше 2.
message_format_string: Число прикрепленных баз данных больше {}.
```
