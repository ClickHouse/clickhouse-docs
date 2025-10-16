---
'description': 'Системная таблица, содержащая информацию о файлах метаданных, прочитанных
  из таблиц Iceberg. Каждая запись представляет собой либо корневой файл метаданных,
  либо метаданные, извлеченные из файла Avro, либо запись из некоторого файла Avro.'
'keywords':
- 'system table'
- 'iceberg_metadata_log'
'slug': '/operations/system-tables/iceberg_metadata_log'
'title': 'system.iceberg_metadata_log'
'doc_type': 'reference'
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.iceberg_metadata_log

Таблица `system.iceberg_metadata_log` регистрирует события доступа и анализа метаданных для таблиц Iceberg, читаемых ClickHouse. Она предоставляет подробную информацию о каждом метафайле или записи, обработанных системой, что полезно для отладки, аудита и понимания эволюции структуры таблиц Iceberg.

## Цель {#purpose}

Эта таблица записывает каждый метафайл и запись, прочитанные из таблиц Iceberg, включая корневые метафайлы, списки манифестов и записи манифестов. Она помогает пользователям отслеживать, как ClickHouse интерпретирует метаданные таблиц Iceberg, и диагностировать проблемы, связанные с эволюцией схемы, разрешением файлов или планированием запросов.

:::note
Эта таблица в основном предназначена для целей отладки.
:::note

## Колонки {#columns}
| Имя             | Тип      | Описание                                                                                      |
|------------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`     | [Date](../../sql-reference/data-types/date.md)      | Дата записи в журнале.                                                                       |
| `event_time`     | [DateTime](../../sql-reference/data-types/datetime.md)  | Время события.                                                                              |
| `query_id`       | [String](../../sql-reference/data-types/string.md)    | Идентификатор запроса, вызвавшего чтение метаданных.                                         |
| `content_type`   | [Enum8](../../sql-reference/data-types/enum.md)     | Тип содержимого метаданных (см. ниже).                                                     |
| `table_path`     | [String](../../sql-reference/data-types/string.md)    | Путь к таблице Iceberg.                                                                     |
| `file_path`      | [String](../../sql-reference/data-types/string.md)    | Путь к корневому метафайлу JSON, списку манифестов или файлу манифеста.                   |
| `content`        | [String](../../sql-reference/data-types/string.md)    | Содержимое в формате JSON (сырые метаданные из .json, метаданные Avro или запись Avro).     |
| `row_in_file`    | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | Номер строки в файле, если применимо. Присутствует для типов содержимого `ManifestListEntry` и `ManifestFileEntry`. |

## Значения `content_type` {#content-type-values}

- `None`: Нет содержимого.
- `Metadata`: Корневой метафайл.
- `ManifestListMetadata`: Метаданные списка манифестов.
- `ManifestListEntry`: Запись в списке манифестов.
- `ManifestFileMetadata`: Метаданные файла манифеста.
- `ManifestFileEntry`: Запись в файле манифеста.

<SystemTableCloud/>

## Управление подробностью журнала {#controlling-log-verbosity}

Вы можете контролировать, какие события метаданных регистрируются, используя настройку [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level).

Чтобы зарегистрировать все метаданные, используемые в текущем запросе:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

Чтобы зарегистрировать только корневой метафайл JSON, используемый в текущем запросе:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

Дополнительную информацию смотрите в описании настройки [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level).

### Полезно знать {#good-to-know}

- Используйте `iceberg_metadata_log_level` на уровне запроса только тогда, когда вам нужно подробно исследовать вашу таблицу Iceberg. В противном случае вы можете заполнить таблицу журнала избыточными метаданными и столкнуться с ухудшением производительности.
- Таблица может содержать дублирующиеся записи, так как в первую очередь она предназначена для отладки и не гарантирует уникальность для каждого объекта.
- Если вы используете `content_type`, более подробный чем `ManifestListMetadata`, кеш метаданных Iceberg отключается для списков манифестов.
- Аналогично, если вы используете `content_type`, более подробный чем `ManifestFileMetadata`, кеш метаданных Iceberg отключается для файлов манифеста.

## См. также {#see-also}
- [Движок таблиц Iceberg](../../engines/table-engines/integrations/iceberg.md)
- [Табличная функция Iceberg](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)