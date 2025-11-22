---
description: 'Системная таблица, содержащая информацию о файлах метаданных, прочитанных из таблиц Iceberg. Каждая запись
  представляет собой либо корневой файл метаданных, метаданные, извлечённые из файла Avro, либо запись из какого-либо файла Avro.'
keywords: ['системная таблица', 'iceberg_metadata_log']
slug: /operations/system-tables/iceberg_metadata_log
title: 'system.iceberg_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.iceberg_metadata_log

Таблица `system.iceberg_metadata_log` регистрирует события доступа к метаданным и их разбора для таблиц Iceberg, читаемых в ClickHouse. Она предоставляет подробную информацию о каждом обработанном файле или записи метаданных, что полезно для отладки, аудита и понимания эволюции структуры таблиц Iceberg.



## Назначение {#purpose}

Эта таблица регистрирует каждый файл метаданных и запись, считанные из таблиц Iceberg, включая корневые файлы метаданных, списки манифестов и записи манифестов. Она помогает пользователям отслеживать, как ClickHouse интерпретирует метаданные таблиц Iceberg, и диагностировать проблемы, связанные с эволюцией схемы, разрешением файлов или планированием запросов.

:::note
Эта таблица предназначена главным образом для отладки.
:::


## Columns {#columns}

| Имя            | Тип                                                                                                          | Описание                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `event_date`   | [Date](../../sql-reference/data-types/date.md)                                                               | Дата записи журнала.                                                                                          |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)                                                       | Временная метка события.                                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)                                                           | Идентификатор запроса, инициировавшего чтение метаданных.                                                     |
| `content_type` | [Enum8](../../sql-reference/data-types/enum.md)                                                              | Тип содержимого метаданных (см. ниже).                                                                        |
| `table_path`   | [String](../../sql-reference/data-types/string.md)                                                           | Путь к таблице Iceberg.                                                                                       |
| `file_path`    | [String](../../sql-reference/data-types/string.md)                                                           | Путь к корневому JSON-файлу метаданных, списку манифестов Avro или файлу манифеста.                          |
| `content`      | [String](../../sql-reference/data-types/string.md)                                                           | Содержимое в формате JSON (исходные метаданные из .json, метаданные Avro или запись Avro).                   |
| `row_in_file`  | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | Номер строки в файле, если применимо. Присутствует для типов содержимого `ManifestListEntry` и `ManifestFileEntry`. |


## Значения `content_type` {#content-type-values}

- `None`: Содержимое отсутствует.
- `Metadata`: Корневой файл метаданных.
- `ManifestListMetadata`: Метаданные списка манифестов.
- `ManifestListEntry`: Запись в списке манифестов.
- `ManifestFileMetadata`: Метаданные файла манифеста.
- `ManifestFileEntry`: Запись в файле манифеста.

<SystemTableCloud />


## Управление детализацией журналирования {#controlling-log-verbosity}

Вы можете управлять тем, какие события метаданных записываются в журнал, с помощью настройки [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level).

Чтобы записать в журнал все метаданные, используемые в текущем запросе:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

Чтобы записать в журнал только корневой JSON-файл метаданных, используемый в текущем запросе:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

Дополнительную информацию см. в описании настройки [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level).

### Полезная информация {#good-to-know}

- Используйте `iceberg_metadata_log_level` на уровне запроса только в тех случаях, когда необходимо детально исследовать таблицу Iceberg. В противном случае таблица журнала может быть заполнена избыточными метаданными, что приведет к снижению производительности.
- Таблица может содержать дублирующиеся записи, так как она предназначена в первую очередь для отладки и не гарантирует уникальность каждой сущности.
- Если используется `content_type` с более высокой детализацией, чем `ManifestListMetadata`, кэш метаданных Iceberg для списков манифестов отключается.
- Аналогично, если используется `content_type` с более высокой детализацией, чем `ManifestFileMetadata`, кэш метаданных Iceberg для файлов манифестов отключается.


## См. также {#see-also}

- [Движок таблиц Iceberg](../../engines/table-engines/integrations/iceberg.md)
- [Табличная функция Iceberg](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)
