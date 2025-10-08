---
'description': 'Системная таблица, содержащая информацию о файлахmetadata, прочитанных
  из таблиц Delta Lake. Каждая запись представляет собой корневой файл метаданныых
  в формате JSON.'
'keywords':
- 'system table'
- 'delta_lake_metadata_log'
'slug': '/operations/system-tables/delta_lake_metadata_log'
'title': 'system.delta_lake_metadata_log'
'doc_type': 'reference'
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.delta_lake_metadata_log

Таблица `system.delta_lake_metadata_log` регистрирует события доступа к метаданным и их разбора для таблиц Delta Lake, читаемых ClickHouse. Она предоставляет подробную информацию о каждом метафайле, что полезно для отладки, аудита и понимания эволюции структуры таблицы Delta.

## Цель {#purpose}

Эта таблица ведет учет каждого метафайла, прочитанного из таблиц Delta Lake. Она помогает пользователям отследить, как ClickHouse интерпретирует метаданные таблицы Delta, и диагностировать проблемы, связанные с эволюцией схемы, разрешением снимков или планированием запросов.

:::note
Эта таблица в первую очередь предназначена для целей отладки.
:::note

## Столбцы {#columns}
| Название       | Тип       | Описание                                                                                     |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | Дата файла логов.                                                                           |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | Метка времени события.                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | Идентификатор запроса, который вызвал чтение метаданных.                                     |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Путь к таблице Delta Lake.                                                                   |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | Путь к корневому метаданному JSON файлу.                                                   |
| `content`      | [String](../../sql-reference/data-types/string.md)    | Содержимое в формате JSON (сырые метаданные из .json).                                      |

<SystemTableCloud/>

## Контроль Verbosity логирования {#controlling-log-verbosity}

Вы можете контролировать, какие события метаданных регистрируются, используя настройку [`delta_lake_log_metadata`](../../operations/settings/settings.md#delta_lake_log_metadata).

Чтобы зарегистрировать все метаданные, использованные в текущем запросе:

```sql
SELECT * FROM my_delta_table SETTINGS delta_lake_log_metadata = 1;

SYSTEM FLUSH LOGS delta_lake_metadata_log;

SELECT *
FROM system.delta_lake_metadata_log
WHERE query_id = '{previous_query_id}';
```