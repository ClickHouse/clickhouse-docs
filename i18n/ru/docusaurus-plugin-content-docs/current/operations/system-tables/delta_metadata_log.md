---
description: 'Системная таблица, содержащая информацию о файлах метаданных, считываемых из таблиц Delta Lake. Каждая запись
  соответствует корневому JSON-файлу метаданных.'
keywords: ['системная таблица', 'delta_lake_metadata_log']
slug: /operations/system-tables/delta_lake_metadata_log
title: 'system.delta_lake_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.delta_lake_metadata_log \{#systemdelta_lake_metadata_log\}

Таблица `system.delta_lake_metadata_log` фиксирует события доступа к метаданным и их разбора для таблиц Delta Lake, которые читает ClickHouse. Она предоставляет подробную информацию о каждом файле метаданных, что полезно для отладки, аудита и понимания эволюции структуры таблиц Delta Lake.

## Назначение \{#purpose\}

Эта таблица регистрирует каждый файл метаданных, прочитанный из таблиц Delta Lake. Она помогает пользователям отследить, как ClickHouse интерпретирует метаданные таблиц Delta, и диагностировать проблемы, связанные с эволюцией схемы, выбором снимка (snapshot) или планированием выполнения запросов.

:::note
Эта таблица предназначена в первую очередь для целей отладки.
:::

## Столбцы \{#columns\}
| Имя           | Тип      | Описание                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | Дата файла журнала.                                                                       |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | Временная метка события.                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | Идентификатор запроса, инициировавшего чтение метаданных.                                                   |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Путь к таблице Delta Lake.                                                                |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | Путь к корневому JSON-файлу метаданных.             |
| `content`      | [String](../../sql-reference/data-types/string.md)    | Содержимое в формате JSON (исходные метаданные из файла .json).       |

<SystemTableCloud/>

## Управление уровнем детализации журналирования \{#controlling-log-verbosity\}

Вы можете управлять тем, какие события, связанные с метаданными, записываются в журнал с помощью настройки [`delta_lake_log_metadata`](../../operations/settings/settings.md#delta_lake_log_metadata).

Чтобы записывать в журнал все метаданные, используемые в текущем запросе:

```sql
SELECT * FROM my_delta_table SETTINGS delta_lake_log_metadata = 1;

SYSTEM FLUSH LOGS delta_lake_metadata_log;

SELECT *
FROM system.delta_lake_metadata_log
WHERE query_id = '{previous_query_id}';
```
