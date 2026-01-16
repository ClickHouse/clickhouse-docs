---
description: 'Системная таблица, содержащая информацию о партах и столбцах таблиц MergeTree.'
keywords: ['системная таблица', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
doc_type: 'reference'
---

# system.parts&#95;columns \\{#systemparts&#95;columns\\}

Содержит информацию о партах и столбцах таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Каждая строка описывает один парт данных.

Столбцы:

* `partition` ([String](../../sql-reference/data-types/string.md)) — Имя раздела. Чтобы узнать, что такое раздел, см. описание запроса [ALTER](/sql-reference/statements/alter).

  Форматы:

  * `YYYYMM` для автоматического разбиения на партиции по месяцам.
  * `any_string` при ручном разбиении на партиции.

* `name` ([String](../../sql-reference/data-types/string.md)) — Название части данных.

* `part_type` ([String](../../sql-reference/data-types/string.md)) — Формат хранения части данных.

  Допустимые значения:

  * `Wide` — каждый столбец хранится в отдельном файле в файловой системе.
  * `Compact` — все столбцы хранятся в одном файле в файловой системе.

    Формат хранения данных задаётся настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part` таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — флаг, показывающий, активна ли часть данных. Если часть данных активна, она используется в таблице. В противном случае она удаляется. Неактивные части данных остаются после слияния.

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество меток. Чтобы получить примерное число строк в части данных, умножьте `marks` на гранулярность индекса (обычно 8192) (эта оценка не применима при адаптивной гранулярности).

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — количество строк.

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер всех файлов частей данных в байтах.

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер сжатых данных в части. Все вспомогательные файлы (например, файлы с метками) не учитываются.

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер несжатых данных в части данных. Все вспомогательные файлы (например, файлы с метками) не учитываются.

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — размер файла меток.

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время изменения каталога, содержащего часть данных. Обычно соответствует времени создания части данных.

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время, когда часть данных стала неактивной.

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — количество мест, где используется часть данных. Значение больше 2 означает, что часть данных используется в запросах или операциях слияния.

* `min_date` ([Date](../../sql-reference/data-types/date.md)) — минимальное значение ключа по дате в части данных.

* `max_date` ([Date](../../sql-reference/data-types/date.md)) — максимальное значение по ключу даты в части данных.

* `partition_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор раздела.

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Минимальное количество частей данных, из которых после слияния состоит текущая часть.

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Максимальное число частей данных, образующих текущую часть после слияния.`

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Глубина дерева слияний. Ноль означает, что текущая часть была создана вставкой, а не в результате слияния других частей.

* `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — число, которое используется для определения, какие мутации нужно применить к части данных (мутации с версией больше, чем `data_version`).

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Объём памяти (в байтах), занимаемый значениями первичного ключа.

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Объём памяти (в байтах), зарезервированный для значений первичного ключа.

* `database` ([String](../../sql-reference/data-types/string.md)) — имя базы данных.

* `table` ([String](../../sql-reference/data-types/string.md)) — имя таблицы.

* `engine` ([String](../../sql-reference/data-types/string.md)) — Название движка таблицы без указания параметров.

* `disk_name` ([String](../../sql-reference/data-types/string.md)) — Имя диска, на котором хранится часть данных.

* `path` ([String](../../sql-reference/data-types/string.md)) — Абсолютный путь к папке с файлами частей данных.

* `column` ([String](../../sql-reference/data-types/string.md)) — имя столбца.

* `type` ([String](../../sql-reference/data-types/string.md)) — тип столбца.

* `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — порядковый номер столбца в таблице, начиная с 1.

* `default_kind` ([String](../../sql-reference/data-types/string.md)) — тип выражения (`DEFAULT`, `MATERIALIZED`, `ALIAS`) для значения по умолчанию или пустая строка, если значение не определено.

* `default_expression` ([String](../../sql-reference/data-types/string.md)) — выражение, задающее значение по умолчанию, или пустая строка, если оно не определено.

* `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — общий размер столбца на диске в байтах.

* `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — общий размер сжатых данных в столбце, в байтах.

* `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общий размер несжатых данных в столбце в байтах.

* `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер столбца с метками в байтах.

* `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — псевдоним для `bytes_on_disk`.

* `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — синоним для `marks_bytes`.

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
