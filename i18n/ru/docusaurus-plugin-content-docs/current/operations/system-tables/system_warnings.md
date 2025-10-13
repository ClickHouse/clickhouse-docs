---
slug: '/operations/system-tables/system_warnings'
description: 'Эта таблица содержит предупреждающие сообщения о сервере ClickHouse.'
title: system.warnings
keywords: ['системная таблица', 'предупреждения']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.warnings

<SystemTableCloud/>

Эта таблица показывает предупреждения о сервере ClickHouse. 
Предупреждения одного типа объединяются в одно общее предупреждение. 
Например, если количество N присоединенных баз данных превышает настраиваемый порог T, то отображается одна запись, содержащая текущее значение N, вместо N отдельных записей. 
Если текущее значение падает ниже порога, запись удаляется из таблицы.

Таблицу можно настроить с помощью следующих параметров:

- [max_table_num_to_warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
- [max_database_num_to_warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
- [max_dictionary_num_to_warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
- [max_view_num_to_warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
- [max_part_num_to_warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
- [max_pending_mutations_to_warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)
- [max_pending_mutations_execution_time_to_warn](/operations/server-configuration-parameters/settings#max_pending_mutations_execution_time_to_warn)
- [max_named_collection_num_to_warn](../server-configuration-parameters/settings.md#max_named_collection_num_to_warn)
- [resource_overload_warnings](/operations/settings/server-overload#resource-overload-warnings)

Столбцы:

- `message` ([String](../../sql-reference/data-types/string.md)) — Сообщение предупреждения.
- `message_format_string` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Форматная строка, используемая для форматирования сообщения.

**Пример**

Запрос:

```sql
SELECT * FROM system.warnings LIMIT 2 \G;
```

Результат:

```text
Row 1:
──────
message:               The number of active parts is more than 10.
message_format_string: The number of active parts is more than {}.

Row 2:
──────
message:               The number of attached databases is more than 2.
message_format_string: The number of attached databases is more than {}.
```