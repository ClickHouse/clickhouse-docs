---
description: 'Эта таблица содержит предупреждающие сообщения о сервере ClickHouse.'
keywords: [ 'системная таблица', 'предупреждения' ]
slug: /ru/operations/system-tables/system_warnings
title: 'system.warnings'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.warnings

<SystemTableCloud/>

Эта таблица показывает предупреждения о сервере ClickHouse. 
Предупреждения одного типа объединяются в одно предупреждение. 
Например, если число N прикрепленных баз данных превышает настраиваемый порог T, показывается одна запись, содержащая текущее значение N, вместо N отдельных записей. 
Если текущее значение падает ниже порога, запись удаляется из таблицы.

Таблицу можно настроить с помощью следующих параметров:

- [max_table_num_to_warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
- [max_database_num_to_warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
- [max_dictionary_num_to_warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
- [max_view_num_to_warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
- [max_part_num_to_warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
- [max_pending_mutations_to_warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)

Столбцы:

- `message` ([String](../../sql-reference/data-types/string.md)) — Сообщение об предупреждении.
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
message:               Число активных частей превышает 10.
message_format_string: Число активных частей превышает {}.

Row 2:
──────
message:               Число прикрепленных баз данных превышает 2.
message_format_string: Число прикрепленных баз данных превышает {}.
```
