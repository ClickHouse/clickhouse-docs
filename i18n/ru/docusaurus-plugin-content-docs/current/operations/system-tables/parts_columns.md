---
slug: '/operations/system-tables/parts_columns'
description: 'Системная таблица, содержащая информацию о частях и колонках таблиц'
title: system.parts_columns
keywords: ['системная таблица', 'parts_columns']
doc_type: reference
---
# system.parts_columns

Содержит информацию о частях и колонках таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Каждая строка описывает одну часть данных.

Колонки:

- `partition` ([String](../../sql-reference/data-types/string.md)) — Имя партиции. Чтобы узнать, что такое партиция, смотрите описание запроса [ALTER](/sql-reference/statements/alter).

    Форматы:

  - `YYYYMM` для автоматической партиционирования по месяцам.
  - `any_string` при ручном партиционировании.

- `name` ([String](../../sql-reference/data-types/string.md)) — Название части данных.

- `part_type` ([String](../../sql-reference/data-types/string.md)) — Формат хранения части данных.

    Возможные значения:

  - `Wide` — Каждая колонка хранится в отдельном файле в файловой системе.
  - `Compact` — Все колонки хранятся в одном файле в файловой системе.

    Формат хранения данных контролируется настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part` таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, является ли часть данных активной. Если часть данных активна, она используется в таблице. В противном случае она удаляется. Неактивные части данных остаются после слияния.

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество меток. Чтобы получить приблизительное количество строк в части данных, умножьте `marks` на гранулярность индекса (обычно 8192) (это подсказка не сработает для адаптивной гранулярности).

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк.

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер всех файлов части данных в байтах.

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер сжатых данных в части данных. Все вспомогательные файлы (например, файлы с метками) не включены.

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер несжатых данных в части данных. Все вспомогательные файлы (например, файлы с метками) не включены.

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер файла с метками.

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время, когда директория с частью данных была изменена. Обычно это соответствует времени создания части данных.

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время, когда часть данных стала неактивной.

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Количество мест, где используется часть данных. Значение больше 2 указывает на то, что часть данных используется в запросах или слияниях.

- `min_date` ([Date](../../sql-reference/data-types/date.md)) — Минимальное значение ключа даты в части данных.

- `max_date` ([Date](../../sql-reference/data-types/date.md)) — Максимальное значение ключа даты в части данных.

- `partition_id` ([String](../../sql-reference/data-types/string.md)) — ID партиции.

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Минимальное количество частей данных, которые составляют текущую часть после слияния.

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Максимальное количество частей данных, которые составляют текущую часть после слияния.

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Глубина дерева слияния. Ноль означает, что текущая часть была создана путем вставки, а не путем слияния других частей.

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Номер, используемый для определения, какие мутации следует применять к части данных (мутации с версией выше `data_version`).

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество памяти (в байтах), используемой значениями первичного ключа.

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество памяти (в байтах), зарезервированной для значений первичного ключа.

- `database` ([String](../../sql-reference/data-types/string.md)) — Название базы данных.

- `table` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.

- `engine` ([String](../../sql-reference/data-types/string.md)) — Название движка таблицы без параметров.

- `disk_name` ([String](../../sql-reference/data-types/string.md)) — Название диска, на котором хранятся части данных.

- `path` ([String](../../sql-reference/data-types/string.md)) — Абсолютный путь к папке с файлами частей данных.

- `column` ([String](../../sql-reference/data-types/string.md)) — Название колонки.

- `type` ([String](../../sql-reference/data-types/string.md)) — Тип колонки.

- `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Порядковый номер колонки в таблице, начиная с 1.

- `default_kind` ([String](../../sql-reference/data-types/string.md)) — Тип выражения (`DEFAULT`, `MATERIALIZED`, `ALIAS`) для значения по умолчанию или пустая строка, если не определено.

- `default_expression` ([String](../../sql-reference/data-types/string.md)) — Выражение для значения по умолчанию или пустая строка, если не определено.

- `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер колонки в байтах.

- `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер сжатых данных в колонке, в байтах.

- `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер декомпрессированных данных в колонке, в байтах.

- `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер колонки с метками, в байтах.

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Псевдоним для `bytes_on_disk`.

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Псевдоним для `marks_bytes`.

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

**Смотрите также**

- [Семейство MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)