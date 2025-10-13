---
slug: '/operations/system-tables/parts'
description: 'Системная таблица, содержащая информацию о частях MergeTree'
title: system.parts
keywords: ['системная таблица', 'части']
doc_type: reference
---
# system.parts

Содержит информацию о частях таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Каждая строка описывает одну часть данных.

Столбцы:

- `partition` ([String](../../sql-reference/data-types/string.md)) – Название партиции. Чтобы узнать, что такое партиция, смотрите описание запроса [ALTER](/sql-reference/statements/alter).

    Форматы:

  - `YYYYMM` для автоматического партиционирования по месяцам.
  - `any_string` при ручном партиционировании.

- `name` ([String](../../sql-reference/data-types/string.md)) – Название части данных. Структура наименования частей может использоваться для определения многих аспектов данных, процессов загрузки и слияния. Формат наименования частей следующий:

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* Определения:
  - `partition_id` - идентификатор ключа партиции
  - `minimum_block_number` - минимальный номер блока в части. ClickHouse всегда сливает непрерывные блоки
  - `maximum_block_number` - максимальный номер блока в части
  - `level` - увеличивается на один при каждом дополнительном слиянии части. Уровень 0 означает, что это новая часть, которая еще не была слита. Важно помнить, что все части в ClickHouse всегда неизменяемы
  - `data_version` - необязательное значение, увеличивается при мутации части (опять же, мутированные данные всегда записываются только в новую часть, так как части неизменяемы)

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) - UUID части данных.

- `part_type` ([String](../../sql-reference/data-types/string.md)) — Формат хранения части данных.

    Возможные значения:

  - `Wide` — Каждая колонка хранится в отдельном файле в файловой системе.
  - `Compact` — Все колонки хранятся в одном файле в файловой системе.

    Формат хранения данных контролируется настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part` таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – Флаг, который указывает, активна ли часть данных. Если часть данных активна, она используется в таблице. В противном случае она удаляется. Неактивные части данных остаются после слияния.

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Количество меток. Для получения приблизительного количества строк в части данных умножьте `marks` на гранулярность индекса (обычно 8192) (данный совет не работает для адаптивной гранулярности).

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Количество строк.

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Общий размер всех файлов части данных в байтах.

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Общий размер сжатых данных в части данных. Все вспомогательные файлы (например, файлы с метками) не включены.

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Общий размер не сжатых данных в части данных. Все вспомогательные файлы (например, файлы с метками) не включены.

- `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Объем памяти (в байтах), используемой значениями первичного ключа в файле primary.idx/cidx на диске.

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Размер файла с метками.

- `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Общий размер сжатых данных для вторичных индексов в части данных. Все вспомогательные файлы (например, файлы с метками) не включены.

- `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Общий размер не сжатых данных для вторичных индексов в части данных. Все вспомогательные файлы (например, файлы с метками) не включены.

- `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Размер файла с метками для вторичных индексов.

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – Время, когда директория с частью данных была изменена. Обычно это соответствует времени создания части данных.

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – Время, когда часть данных стала неактивной.

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – Количество мест, где используется часть данных. Значение, большее 2, указывает на то, что часть данных используется в запросах или слияниях.

- `min_date` ([Date](../../sql-reference/data-types/date.md)) – Минимальное значение ключа даты в части данных.

- `max_date` ([Date](../../sql-reference/data-types/date.md)) – Максимальное значение ключа даты в части данных.

- `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – Минимальное значение ключа даты и времени в части данных.

- `max_time`([DateTime](../../sql-reference/data-types/datetime.md)) – Максимальное значение ключа даты и времени в части данных.

- `partition_id` ([String](../../sql-reference/data-types/string.md)) – ID партиции.

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Минимальный номер блока данных, который составляет текущую часть после слияния.

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Максимальный номер блока данных, который составляет текущую часть после слияния.

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – Глубина дерева слияния. Ноль означает, что текущая часть была создана в результате вставки, а не в результате слияния других частей.

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Номер, используемый для определения, какие мутации должны быть применены к части данных (мутации с версией выше `data_version`).

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Объем памяти (в байтах), используемой значениями первичного ключа (будет `0` в случае `primary_key_lazy_load=1` и `use_primary_key_cache=1`).

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Объем памяти (в байтах), зарезервированный для значений первичного ключа (будет `0` в случае `primary_key_lazy_load=1` и `use_primary_key_cache=1`).

- `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – Флаг, который показывает, что существует резервная копия данных партиции. 1 - резервная копия существует. 0 - резервная копия не существует. Для получения более подробной информации смотрите [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)

- `database` ([String](../../sql-reference/data-types/string.md)) – Название базы данных.

- `table` ([String](../../sql-reference/data-types/string.md)) – Название таблицы.

- `engine` ([String](../../sql-reference/data-types/string.md)) – Название движка таблицы без параметров.

- `path` ([String](../../sql-reference/data-types/string.md)) – Абсолютный путь к папке с файлами частей данных.

- `disk_name` ([String](../../sql-reference/data-types/string.md)) – Название диска, который хранит часть данных.

- `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#sipHash128) сжатых файлов.

- `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#sipHash128) не сжатых файлов (файлы с метками, файл индекса и т. д.).

- `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#sipHash128) данных в сжатых файлах так, как если бы они были не сжатыми.

- `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — Минимальное значение ключа даты и времени для правила [TTL DELETE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

- `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — Максимальное значение ключа даты и времени для правила [TTL DELETE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

- `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Массив выражений. Каждое выражение определяет правило [TTL MOVE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

:::note
Массив `move_ttl_info.expression` в основном сохраняется для обратной совместимости. В настоящее время самый простой способ проверить правило `TTL MOVE` — использовать поля `move_ttl_info.min` и `move_ttl_info.max`.
:::

- `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Массив значений даты и времени. Каждый элемент описывает минимальное значение ключа для правила [TTL MOVE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

- `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Массив значений даты и времени. Каждый элемент описывает максимальное значение ключа для правила [TTL MOVE](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl).

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Псевдоним для `bytes_on_disk`.

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – Псевдоним для `marks_bytes`.

**Пример**

```sql
SELECT * FROM system.parts LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
partition:                             tuple()
name:                                  all_1_4_1_6
part_type:                             Wide
active:                                1
marks:                                 2
rows:                                  6
bytes_on_disk:                         310
data_compressed_bytes:                 157
data_uncompressed_bytes:               91
secondary_indices_compressed_bytes:    58
secondary_indices_uncompressed_bytes:  6
secondary_indices_marks_bytes:         48
marks_bytes:                           144
modification_time:                     2020-06-18 13:01:49
remove_time:                           1970-01-01 00:00:00
refcount:                              1
min_date:                              1970-01-01
max_date:                              1970-01-01
min_time:                              1970-01-01 00:00:00
max_time:                              1970-01-01 00:00:00
partition_id:                          all
min_block_number:                      1
max_block_number:                      4
level:                                 1
data_version:                          6
primary_key_bytes_in_memory:           8
primary_key_bytes_in_memory_allocated: 64
is_frozen:                             0
database:                              default
table:                                 months
engine:                                MergeTree
disk_name:                             default
path:                                  /var/lib/clickhouse/data/default/months/all_1_4_1_6/
hash_of_all_files:                     2d0657a16d9430824d35e327fcbd87bf
hash_of_uncompressed_files:            84950cc30ba867c77a408ae21332ba29
uncompressed_hash_of_compressed_files: 1ad78f1c6843bbfb99a2c931abe7df7d
delete_ttl_info_min:                   1970-01-01 00:00:00
delete_ttl_info_max:                   1970-01-01 00:00:00
move_ttl_info.expression:              []
move_ttl_info.min:                     []
move_ttl_info.max:                     []
```

**Смотрите также**

- [Семейство MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)
- [TTL для столбцов и таблиц](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)