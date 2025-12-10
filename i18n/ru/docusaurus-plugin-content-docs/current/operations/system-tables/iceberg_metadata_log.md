---
description: 'Системная таблица, содержащая информацию о файлах метаданных, прочитанных из таблиц Iceberg. Каждая запись
  представляет либо корневой файл метаданных, метаданные, извлечённые из файла Avro, либо запись из файла Avro.'
keywords: ['системная таблица', 'iceberg_metadata_log']
slug: /operations/system-tables/iceberg_metadata_log
title: 'system.iceberg_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.iceberg_metadata_log {#systemiceberg_metadata_log}

Таблица `system.iceberg_metadata_log` фиксирует события доступа к метаданным и их разбора для таблиц Iceberg, прочитанных ClickHouse. Она предоставляет подробную информацию о каждом обработанном файле или записи метаданных, что полезно для отладки, аудита и анализа эволюции структуры таблиц Iceberg.

## Назначение {#purpose}

Эта таблица фиксирует каждый файл и каждую запись метаданных, прочитанные из таблиц Iceberg, включая корневые файлы метаданных, списки манифестов и записи манифестов. Она помогает пользователям отследить, как ClickHouse интерпретирует метаданные таблиц Iceberg, и диагностировать проблемы, связанные с эволюцией схемы, поиском и разрешением файлов или планированием выполнения запросов.

:::note
Эта таблица в первую очередь предназначена для отладки.
:::

## Столбцы {#columns}

| Имя           | Тип      | Описание                                                                                       |
|---------------|----------|------------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | Дата записи лога.                                                                           |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | Временная метка события.                                                                    |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | Идентификатор запроса, который инициировал чтение метаданных.                               |
| `content_type` | [Enum8](../../sql-reference/data-types/enum.md)     | Тип содержимого метаданных (см. ниже).                                                      |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Путь к таблице Iceberg.                                                                     |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | Путь к корневому файлу метаданных в формате JSON, списку манифестов Avro или файлу манифеста. |
| `content`      | [String](../../sql-reference/data-types/string.md)    | Содержимое в формате JSON (исходные метаданные из файла .json, метаданные Avro или запись Avro). |
| `row_in_file`  | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | Номер строки в файле, если применимо. Заполняется для типов содержимого `ManifestListEntry` и `ManifestFileEntry`. |

## Значения `content_type` {#content-type-values}

- `None`: Нет содержимого.
- `Metadata`: Корневой файл метаданных.
- `ManifestListMetadata`: Метаданные списка манифестов.
- `ManifestListEntry`: Запись в списке манифестов.
- `ManifestFileMetadata`: Метаданные файла манифеста.
- `ManifestFileEntry`: Запись в файле манифеста.

<SystemTableCloud/>

## Управление подробностью журналирования {#controlling-log-verbosity}

Вы можете управлять тем, какие события, связанные с метаданными, записываются в журнал, с помощью настройки [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level).

Чтобы записывать в журнал все метаданные, используемые в текущем запросе:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

Чтобы логировать только корневой JSON‑файл метаданных, используемый в текущем запросе:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

См. дополнительную информацию в описании настройки [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level).

### Полезная информация {#good-to-know}

* Используйте `iceberg_metadata_log_level` на уровне запроса только тогда, когда вам нужно детально исследовать таблицу Iceberg. В противном случае вы можете заполнить таблицу логов избыточными метаданными и столкнуться с ухудшением производительности.
* Таблица может содержать дублирующиеся записи, так как она предназначена в первую очередь для отладки и не гарантирует уникальность записей для каждой сущности.
* Если вы используете `content_type`, более подробный, чем `ManifestListMetadata`, кэш метаданных Iceberg для списков манифестов отключается.
* Аналогично, если вы используете `content_type`, более подробный, чем `ManifestFileMetadata`, кэш метаданных Iceberg для файлов манифестов отключается.

## См. также {#see-also}
- [Движок таблиц Iceberg](../../engines/table-engines/integrations/iceberg.md)
- [Табличная функция Iceberg](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)
