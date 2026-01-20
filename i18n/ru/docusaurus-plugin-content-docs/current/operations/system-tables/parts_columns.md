---
description: 'Системная таблица, содержащая информацию о партах и столбцах таблиц MergeTree.'
keywords: ['системная таблица', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
doc_type: 'reference'
---

# system.parts_columns \{#systemparts_columns\}

Содержит информацию о частях и столбцах таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).
Каждая строка описывает одну часть данных.

| Column                                  | Type     | Description                                                                                                                                                                                                |
| --------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `partition`                             | String   | Имя партиции. Форматы: `YYYYMM` для автоматического партиционирования по месяцам или `any_string` при ручном партиционировании.                                                                            |
| `name`                                  | String   | Имя части данных.                                                                                                                                                                                          |
| `part_type`                             | String   | Формат хранения части данных. Значения: `Wide` (каждый столбец в отдельном файле) или `Compact` (все столбцы в одном файле). Управляется настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part`. |
| `active`                                | UInt8    | Флаг, указывающий, активна ли часть данных. Активные части используются в таблице; неактивные части удаляются или остаются после слияния.                                                                  |
| `marks`                                 | UInt64   | Количество меток. Умножьте на гранулярность индекса (обычно 8192), чтобы получить примерное количество строк.                                                                                              |
| `rows`                                  | UInt64   | Количество строк.                                                                                                                                                                                          |
| `bytes_on_disk`                         | UInt64   | Общий размер всех файлов части данных в байтах.                                                                                                                                                            |
| `data_compressed_bytes`                 | UInt64   | Общий размер сжатых данных в части данных (исключая вспомогательные файлы, такие как метки).                                                                                                               |
| `data_uncompressed_bytes`               | UInt64   | Общий размер несжатых данных в части данных (исключая вспомогательные файлы, такие как метки).                                                                                                             |
| `marks_bytes`                           | UInt64   | Размер файла с метками.                                                                                                                                                                                    |
| `modification_time`                     | DateTime | Время модификации каталога с частью данных (обычно соответствует времени создания).                                                                                                                        |
| `remove_time`                           | DateTime | Время, когда часть данных стала неактивной.                                                                                                                                                                |
| `refcount`                              | UInt32   | Количество мест, в которых используется часть данных. Значение &gt; 2 указывает на использование в запросах или слияниях.                                                                                  |
| `min_date`                              | Date     | Минимальное значение ключа даты в части данных.                                                                                                                                                            |
| `max_date`                              | Date     | Максимальное значение ключа даты в части данных.                                                                                                                                                           |
| `partition_id`                          | String   | Идентификатор партиции.                                                                                                                                                                                    |
| `min_block_number`                      | UInt64   | Минимальный номер блока (части данных), из которых после слияния образована текущая часть.                                                                                                                 |
| `max_block_number`                      | UInt64   | Максимальный номер блока (части данных), из которых после слияния образована текущая часть.                                                                                                                |
| `level`                                 | UInt32   | Глубина дерева слияний. Ноль означает, что часть создана вставкой, а не слиянием.                                                                                                                          |
| `data_version`                          | UInt64   | Число, используемое для определения, какие мутации должны быть применены (мутации с версией выше `data_version`).                                                                                          |
| `primary_key_bytes_in_memory`           | UInt64   | Объем памяти (в байтах), используемый значениями первичного ключа.                                                                                                                                         |
| `primary_key_bytes_in_memory_allocated` | UInt64   | Объем памяти (в байтах), зарезервированный для значений первичного ключа.                                                                                                                                  |
| `database`                              | String   | Имя базы данных.                                                                                                                                                                                           |
| `table`                                 | String   | Имя таблицы.                                                                                                                                                                                               |
| `engine`                                | String   | Имя движка таблицы без параметров.                                                                                                                                                                         |
| `disk_name`                             | String   | Имя диска, на котором хранится часть данных.                                                                                                                                                               |
| `path`                                  | String   | Абсолютный путь к каталогу с файлами части данных.                                                                                                                                                         |
| `column`                                | String   | Имя столбца.                                                                                                                                                                                               |
| `type`                                  | String   | Тип столбца.                                                                                                                                                                                               |
| `column_position`                       | UInt64   | Порядковый номер столбца в таблице, начиная с 1.                                                                                                                                                           |
| `default_kind`                          | String   | Тип выражения (`DEFAULT`, `MATERIALIZED`, `ALIAS`) для значения по умолчанию или пустая строка, если не определено.                                                                                        |
| `default_expression`                    | String   | Выражение для значения по умолчанию или пустая строка, если не определено.                                                                                                                                 |
| `column_bytes_on_disk`                  | UInt64   | Общий размер столбца в байтах.                                                                                                                                                                             |
| `column_data_compressed_bytes`          | UInt64   | Общий размер сжатых данных в столбце в байтах. Примечание: это значение не вычисляется для компактных частей.                                                                                              |
| `column_data_uncompressed_bytes`        | UInt64   | Общий размер несжатых данных в столбце в байтах. Примечание: это значение не вычисляется для компактных частей.                                                                                            |
| `column_marks_bytes`                    | UInt64   | Размер столбца с метками в байтах.                                                                                                                                                                         |
| `bytes`                                 | UInt64   | Псевдоним для `bytes_on_disk`.                                                                                                                                                                             |
| `marks_size`                            | UInt64   | Псевдоним для `marks_bytes`.                                                                                                                                                                               |

**Пример**

```sql
SELECT * FROM system.parts_columns LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
partition:                             tuple()
name:                                  all_1_2_1
part_type:                             Wide
active:                                1
marks:                                 2
rows:                                  2
bytes_on_disk:                         155
data_compressed_bytes:                 56
data_uncompressed_bytes:               4
marks_bytes:                           96
modification_time:                     2020-09-23 10:13:36
remove_time:                           2106-02-07 06:28:15
refcount:                              1
min_date:                              1970-01-01
max_date:                              1970-01-01
partition_id:                          all
min_block_number:                      1
max_block_number:                      2
level:                                 1
data_version:                          1
primary_key_bytes_in_memory:           2
primary_key_bytes_in_memory_allocated: 64
database:                              default
table:                                 53r93yleapyears
engine:                                MergeTree
disk_name:                             default
path:                                  /var/lib/clickhouse/data/default/53r93yleapyears/all_1_2_1/
column:                                id
type:                                  Int8
column_position:                       1
default_kind:
default_expression:
column_bytes_on_disk:                  76
column_data_compressed_bytes:          28
column_data_uncompressed_bytes:        2
column_marks_bytes:                    48
```

**См. также**

* [Семейство MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)
* [Подсчёт количества и размера компактных и широких частей](/knowledgebase/count-parts-by-type)
